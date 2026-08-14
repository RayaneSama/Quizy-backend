import { Injectable } from '@nestjs/common';
// import { CreateDashboardDto } from './dto/create-dashboard.dto';
// import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async getStats() {
    const [modules, courses, questions, students] = await Promise.all([
      this.prisma.module.count(),
      this.prisma.course.count(),
      this.prisma.question.count(),
      this.prisma.user.count({
        where: {
          role: 'STUDENT',
        },
      }),
    ]);

    return {
      modules,
      courses,
      questions,
      students,
    };
  }
}
