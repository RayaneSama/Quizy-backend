import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, questionId: string, reason: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    return this.prisma.report.create({
      data: {
        userId,
        questionId,
        reason,
      },
    });
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        question: {
          select: {
            id: true,
            statement: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(reportId: string, status: ReportStatus) {
    const report = await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    return this.prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
      },
    });
  }

  async findMyReports(userId: string) {
    return this.prisma.report.findMany({
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
        createdAt: 'desc',
      },
    });
  }

  async remove(userId: string, reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reports.');
    }

    return this.prisma.report.delete({
      where: {
        id: reportId,
      },
    });
  }
}
