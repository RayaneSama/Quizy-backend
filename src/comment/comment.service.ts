import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, questionId: string, content: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    return this.prisma.comment.create({
      data: {
        userId,
        questionId,
        content,
      },
    });
  }

  async findByQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    return this.prisma.comment.findMany({
      where: {
        questionId,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments.');
    }

    return this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }
  async removeAsAdmin(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    return this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }
}
