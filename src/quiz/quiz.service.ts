import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto) {
    const { title, description, courseId, questionIds } = createQuizDto;

    // Check that the course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // If questions were provided, verify that they belong to this course
    if (questionIds?.length) {
      const uniqueQuestionIds = [...new Set(questionIds)];

      if (uniqueQuestionIds.length !== questionIds.length) {
        throw new BadRequestException(
          'A question cannot be added to the quiz more than once.',
        );
      }
      const questions = await this.prisma.question.findMany({
        where: {
          id: {
            in: questionIds,
          },
        },
      });

      if (questions.length !== questionIds.length) {
        throw new BadRequestException('One or more questions were not found');
      }

      const invalidQuestion = questions.find(
        (question) => question.courseId !== courseId,
      );

      if (invalidQuestion) {
        throw new BadRequestException(
          'All questions must belong to the selected course',
        );
      }
    }

    return this.prisma.quiz.create({
      data: {
        title,
        description,
        courseId,

        questions: questionIds?.length
          ? {
              create: questionIds.map((questionId, index) => ({
                questionId,
                order: index + 1,
              })),
            }
          : undefined,
      },

      include: {
        course: true,
        questions: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.quiz.findMany({
      include: {
        course: {
          include: {
            module: true,
          },
        },
        questions: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            module: true,
          },
        },
        questions: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!existingQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    const { title, description, courseId, questionIds } = updateQuizDto;

    const finalCourseId = courseId ?? existingQuiz.courseId;

    const course = await this.prisma.course.findUnique({
      where: {
        id: finalCourseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // If the course changes, questions must also be supplied
    // so we don't leave questions from the old course.
    if (
      courseId &&
      courseId !== existingQuiz.courseId &&
      existingQuiz.questions.length > 0 &&
      !questionIds
    ) {
      throw new BadRequestException(
        'You must provide questionIds when changing the course.',
      );
    }

    if (questionIds) {
      const uniqueQuestionIds = [...new Set(questionIds)];

      if (uniqueQuestionIds.length !== questionIds.length) {
        throw new BadRequestException(
          'A question cannot be added to the quiz more than once.',
        );
      }

      const questions = await this.prisma.question.findMany({
        where: {
          id: {
            in: questionIds,
          },
        },
      });

      if (questions.length !== questionIds.length) {
        throw new BadRequestException('One or more questions were not found');
      }

      const invalidQuestion = questions.find(
        (question) => question.courseId !== finalCourseId,
      );

      if (invalidQuestion) {
        throw new BadRequestException(
          'All questions must belong to the selected course',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (questionIds) {
        await tx.quizQuestion.deleteMany({
          where: {
            quizId: id,
          },
        });

        await tx.quizQuestion.createMany({
          data: questionIds.map((questionId, index) => ({
            quizId: id,
            questionId,
            order: index + 1,
          })),
        });
      }

      return tx.quiz.update({
        where: {
          id,
        },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(courseId !== undefined && { courseId }),
        },
        include: {
          course: {
            include: {
              module: true,
            },
          },
          questions: {
            include: {
              question: {
                include: {
                  choices: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz._count.attempts > 0) {
      throw new BadRequestException(
        'This quiz cannot be deleted because students have already attempted it.',
      );
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
