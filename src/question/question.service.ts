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

    await this.prisma.question.update({
      where: {
        id,
      },
      data: questionData,
    });

    if (choices) {
      await this.prisma.choice.deleteMany({
        where: {
          questionId: id,
        },
      });

      await this.prisma.choice.createMany({
        data: choices.map((choice) => ({
          text: choice.text!,
          isCorrect: choice.isCorrect ?? false,
          questionId: id,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.prisma.question.delete({
      where: {
        id,
      },
    });
  }
}
