import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async findAll() {
    const courses = await this.prisma.course.findMany({
      include: {
        module: true,
      },
    });
    return {
      data: courses,
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
