import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateQuestionDto) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: dto.moduleId,
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    const course = await this.prisma.course.findUnique({
      where: {
        id: dto.courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.moduleId !== dto.moduleId) {
      throw new BadRequestException(
        'The course does not belong to the specified module.',
      );
    }

    const hasCorrectAnswer = dto.choices.some((choice) => choice.isCorrect);

    if (!hasCorrectAnswer) {
      throw new BadRequestException('At least one answer must be correct.');
    }

    return this.prisma.question.create({
      data: {
        statement: dto.statement,
        explanation: dto.explanation,
        moduleId: dto.moduleId,
        courseId: dto.courseId,

        choices: {
          create: dto.choices,
        },
      },

      include: {
        choices: true,
      },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        choices: true,
        course: true,
        module: true,
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        choices: true,
        course: true,
        module: true,
      },
    });
    if (!question) {
      throw new NotFoundException('Question not found.');
    }
    return question;
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const { choices, ...questionData } = dto;

    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    if (choices) {
      const correctChoices = choices.filter(
        (choice) => choice.isCorrect === true,
      );

      if (correctChoices.length === 0) {
        throw new BadRequestException(
          'A question must have at least one correct choice.',
        );
      }
    }
    if (dto.moduleId || dto.courseId) {
      const moduleId = dto.moduleId ?? question.moduleId;
      const courseId = dto.courseId ?? question.courseId;

      const course = await this.prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new NotFoundException('Course not found.');
      }

      if (course.moduleId !== moduleId) {
        throw new BadRequestException(
          'The course does not belong to the specified module.',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: questionData,
      });

      if (choices) {
        await tx.choice.deleteMany({
          where: {
            questionId: id,
          },
        });

        await tx.choice.createMany({
          data: choices.map((choice) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            questionId: id,
          })),
        });
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    return this.prisma.question.delete({
      where: {
        id,
      },
    });
  }
}
