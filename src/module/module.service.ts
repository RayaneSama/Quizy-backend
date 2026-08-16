import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}
  create(createModuleDto: CreateModuleDto) {
    return this.prisma.module.create({ data: createModuleDto });
  }

  async findAll() {
    return this.prisma.module.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id,
      },
    });
    if (!module) {
      throw new NotFoundException('Module not found.');
    }
    return module;
  }

  async update(id: string, dto: UpdateModuleDto) {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    return this.prisma.module.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id,
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    return this.prisma.module.delete({
      where: {
        id,
      },
    });
  }
}
