import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAttemptDto } from './dto/create-attempt.dto';
// import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { AttemptMode } from '@prisma/client';
import { ResultDetail } from './types/result-type';

@Injectable()
export class AttemptService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, dto: CreateAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: dto.quizId,
      },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    if (!userId) {
      throw new UnauthorizedException('You are not allowed to do this!');
    }

    if (quiz.questions.length < dto.questionCount) {
      throw new BadRequestException(
        `This quiz only has ${quiz.questions.length} questions.`,
      );
    }
    const shuffledQuestions = [...quiz.questions].sort(
      () => Math.random() - 0.5,
    );

    const selectedQuestions = shuffledQuestions.slice(0, dto.questionCount);
    const attempt = await this.prisma.attempt.create({
      data: {
        userId,
        quizId: dto.quizId,
        mode: dto.mode,

        questions: {
          create: selectedQuestions.map((question) => ({
            questionId: question.questionId,
          })),
        },
      },

      include: {
        quiz: true,
        questions: {
          include: {
            question: true,
          },
        },
      },
    });
    return attempt;
  }

  async findAll(userId: string) {
    return this.prisma.attempt.findMany({
      where: {
        userId,
      },
      include: {
        answers: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const attempt = await this.prisma.attempt.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt.');
    }

    return attempt;
  }
  async finish(id: string, userId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: {
        id,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt.');
    }

    if (attempt.finishedAt) {
      throw new BadRequestException('Attempt is already finished.');
    }

    return this.prisma.attempt.update({
      where: {
        id,
      },
      data: {
        finishedAt: new Date(),
      },
    });
  }
  // update(id: number, updateAttemptDto: UpdateAttemptDto) {
  //   return `This action updates a #${id} attempt`;
  // }

  async submitAnswer(attemptId: string, userId: string, dto: SubmitAnswerDto) {
    const attempt = await this.prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt.');
    }
    if (attempt.finishedAt) {
      throw new ForbiddenException('Attempt has already been completed');
    }
    const attemptQuestion = await this.prisma.attemptQuestion.findFirst({
      where: {
        attemptId,
        questionId: dto.questionId,
      },
    });

    if (!attemptQuestion) {
      throw new BadRequestException(
        'This question is not part of this attempt.',
      );
    }

    const question = await this.prisma.question.findUnique({
      where: {
        id: dto.questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    const choices = await this.prisma.choice.findMany({
      where: {
        id: {
          in: dto.choiceIds,
        },
        questionId: dto.questionId,
      },
    });

    if (choices.length !== dto.choiceIds.length) {
      throw new BadRequestException(
        'One or more selected choices are invalid.',
      );
    }

    const existingAnswer = await this.prisma.userAnswer.findFirst({
      where: {
        attemptId,
        questionId: dto.questionId,
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('You have already answered this question.');
    }

    await this.prisma.userAnswer.createMany({
      data: dto.choiceIds.map((choiceId) => ({
        userId: attempt.userId,
        attemptId,
        questionId: dto.questionId,
        choiceId,
      })),
    });

    const correctChoices = await this.prisma.choice.findMany({
      where: {
        questionId: dto.questionId,
        isCorrect: true,
      },
    });

    const correctIds = correctChoices.map((choice) => choice.id);

    const selectedIds = dto.choiceIds;
    const sortedCorrectIds = [...correctIds].sort();
    const sortedSelectedIds = [...selectedIds].sort();

    const isCorrect =
      JSON.stringify(sortedCorrectIds) === JSON.stringify(sortedSelectedIds);

    if (attempt.mode === AttemptMode.PRACTICE) {
      return {
        success: true,
        isCorrect,
        explanation: question.explanation,
      };
    }
    if (attempt.mode === AttemptMode.EXAM) {
      return {
        success: true,
      };
    }
    throw new BadRequestException('Invalid attempt mode.');
  }
  async results(id: string, userId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: {
        id,
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

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt.');
    }

    if (attempt.mode === AttemptMode.EXAM && !attempt.finishedAt) {
      throw new ForbiddenException(
        'You must finish the exam before viewing the results.',
      );
    }

    let correctAnswers = 0;

    const details: ResultDetail[] = [];

    for (const attemptQuestion of attempt.questions) {
      const question = attemptQuestion.question;

      // Get all answers submitted for this question
      const selectedChoices = attempt.answers
        .filter((answer) => answer.questionId === question.id)
        .map((answer) => answer.choiceId)
        .sort();

      // Get the correct choices
      const correctChoices = question.choices
        .filter((choice) => choice.isCorrect)
        .map((choice) => choice.id)
        .sort();

      const isCorrect =
        JSON.stringify(correctChoices) === JSON.stringify(selectedChoices);

      if (isCorrect) {
        correctAnswers++;
      }

      details.push({
        questionId: question.id,
        statement: question.statement,
        selectedChoices,

        correctChoices:
          attempt.mode === AttemptMode.PRACTICE ? correctChoices : [],

        isCorrect: attempt.mode === AttemptMode.PRACTICE ? isCorrect : false,

        explanation:
          attempt.mode === AttemptMode.PRACTICE ? question.explanation : null,
      });
    }

    const totalQuestions = attempt.questions.length;

    const incorrectAnswers = totalQuestions - correctAnswers;

    const score =
      totalQuestions === 0 ? 0 : (correctAnswers / totalQuestions) * 100;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
      details,
    };
  }
  // async remove(id: string, userId: string) {
  //   const attempt = await this.prisma.attempt.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!attempt) {
  //     throw new NotFoundException('Attempt not found.');
  //   }

  //   if (attempt.userId !== userId) {
  //     throw new ForbiddenException('You can only delete your own attempts.');
  //   }

  //   return this.prisma.attempt.delete({
  //     where: {
  //       id,
  //     },
  //   });
  // }
}
