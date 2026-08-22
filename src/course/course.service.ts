import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseQueryDto } from './dto/course-query.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: dto.moduleId,
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    return this.prisma.course.create({
      data: dto,
    });
  }

  async findAll(query: CourseQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      moduleId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;
    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),

      ...(moduleId
        ? {
            moduleId,
          }
        : {}),
    };
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      this.prisma.course.count({
        where,
      }),
    ]);
    return {
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        module: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    return course;
  }

  async findByModule(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    return this.prisma.course.findMany({
      where: {
        moduleId,
      },
    });
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (dto.moduleId) {
      const module = await this.prisma.module.findUnique({
        where: {
          id: dto.moduleId,
        },
      });

      if (!module) {
        throw new NotFoundException('Module not found.');
      }
    }

    return this.prisma.course.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    return this.prisma.course.delete({
      where: {
        id,
      },
    });
  }
}
