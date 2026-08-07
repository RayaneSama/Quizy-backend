import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        module: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        module: true,
      },
    });
  }

  async findByModule(moduleId: string) {
    return this.prisma.course.findMany({
      where: {
        moduleId,
      },
    });
  }

  update(id: string, updateCourseDto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: updateCourseDto });
  }

  remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
