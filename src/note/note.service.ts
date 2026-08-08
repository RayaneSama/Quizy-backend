import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, questionId: string, dto: CreateNoteDto) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    const existingNote = await this.prisma.note.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existingNote) {
      throw new ForbiddenException(
        'You already have a note for this question.',
      );
    }

    return this.prisma.note.create({
      data: {
        content: dto.content,
        videoUrl: dto.videoUrl,
        imageUrl: dto.imageUrl,
        userId,
        questionId,
      },
    });
  }

  async findMyNotes(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
      },
      include: {
        question: {
          select: {
            id: true,
            statement: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
      include: {
        question: {
          select: {
            id: true,
            statement: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You can only access your own notes.');
    }

    return note;
  }

  async update(userId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You can only update your own notes.');
    }

    return this.prisma.note.update({
      where: {
        id: noteId,
      },
      data: dto,
    });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You can only delete your own notes.');
    }

    return this.prisma.note.delete({
      where: {
        id: noteId,
      },
    });
  }
}
