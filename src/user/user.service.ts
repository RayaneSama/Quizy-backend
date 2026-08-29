import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { AttemptMode, Prisma } from '@prisma/client';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      role,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          {
            firstName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            userName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createUser(data: RegisterDto) {
    const existingUsername = await this.prisma.user.findUnique({
      where: {
        userName: data.userName,
      },
    });

    if (existingUsername) {
      throw new BadRequestException('This username is already registered');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('This email is already registered');
    }

    return this.prisma.user.create({
      data,
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.userName) {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          userName: dto.userName,
        },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Username is already taken.');
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.userName !== undefined && { userName: dto.userName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        hashedRefreshToken: null,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }
  async getStatistics(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    const totalAttempts = attempts.length;

    const completedAttempts = attempts.filter(
      (attempt) => attempt.finishedAt !== null,
    ).length;

    let totalQuestions = 0;
    let correctAnswers = 0;

    for (const attempt of attempts) {
      totalQuestions += attempt.questions.length;

      for (const attemptQuestion of attempt.questions) {
        const questionId = attemptQuestion.questionId;

        const selectedChoices = attempt.answers
          .filter((answer) => answer.questionId === questionId)
          .map((answer) => answer.choiceId)
          .sort();

        const correctChoices = attemptQuestion.question.choices
          .filter((choice) => choice.isCorrect)
          .map((choice) => choice.id)
          .sort();

        if (
          JSON.stringify(correctChoices) === JSON.stringify(selectedChoices)
        ) {
          correctAnswers++;
        }
      }
    }

    const incorrectAnswers = totalQuestions - correctAnswers;

    const accuracy =
      totalQuestions === 0
        ? 0
        : Number(((correctAnswers / totalQuestions) * 100).toFixed(2));

    const practiceAttempts = attempts.filter(
      (attempt) => attempt.mode === AttemptMode.PRACTICE,
    ).length;

    const examAttempts = attempts.filter(
      (attempt) => attempt.mode === AttemptMode.EXAM,
    ).length;

    return {
      totalAttempts,
      completedAttempts,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      practiceAttempts,
      examAttempts,
    };
  }
  async getProgress(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            questions: {
              select: {
                id: true,
                choices: {
                  select: {
                    id: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    const courses = new Map<
      string,
      {
        courseId: string;
        courseName: string;
        totalQuestions: number;
        answeredQuestions: Set<string>;
        correctQuestions: Set<string>;
      }
    >();

    for (const attempt of attempts) {
      let courseProgress = courses.get(attempt.courseId);

      if (!courseProgress) {
        courseProgress = {
          courseId: attempt.courseId,
          courseName: attempt.course.name,
          totalQuestions: attempt.course.questions.length,
          answeredQuestions: new Set<string>(),
          correctQuestions: new Set<string>(),
        };

        courses.set(attempt.courseId, courseProgress);
      }

      const answersByQuestion = new Map<string, string[]>();

      for (const answer of attempt.answers) {
        const existing = answersByQuestion.get(answer.questionId);

        if (existing) {
          existing.push(answer.choiceId);
        } else {
          answersByQuestion.set(answer.questionId, [answer.choiceId]);
        }
      }

      for (const [questionId, selectedChoices] of answersByQuestion) {
        courseProgress.answeredQuestions.add(questionId);

        const question = attempt.course.questions.find(
          (question) => question.id === questionId,
        );

        if (!question) {
          continue;
        }

        const correctIds = question.choices
          .filter((choice) => choice.isCorrect)
          .map((choice) => choice.id)
          .sort();

        const selectedIds = [...selectedChoices].sort();

        const isCorrect =
          JSON.stringify(correctIds) === JSON.stringify(selectedIds);

        if (isCorrect) {
          courseProgress.correctQuestions.add(questionId);
        }
      }
    }

    return Array.from(courses.values()).map((course) => {
      const answeredQuestions = course.answeredQuestions.size;
      const correctAnswers = course.correctQuestions.size;

      const progress =
        course.totalQuestions === 0
          ? 0
          : Number(
              ((answeredQuestions / course.totalQuestions) * 100).toFixed(2),
            );

      const accuracy =
        answeredQuestions === 0
          ? 0
          : Number(((correctAnswers / answeredQuestions) * 100).toFixed(2));

      return {
        courseId: course.courseId,
        courseName: course.courseName,
        totalQuestions: course.totalQuestions,
        answeredQuestions,
        correctAnswers,
        progress,
        accuracy,
      };
    });
  }
  async updateStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
