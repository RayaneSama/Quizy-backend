import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    return this.prisma.bookmark.create({
      data: {
        userId,
        questionId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
      include: {
        question: {
          include: {
            choices: true,
          },
        },
      },
    });
  }

  async remove(userId: string, questionId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found.');
    }

    return this.prisma.bookmark.delete({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });
  }
}
