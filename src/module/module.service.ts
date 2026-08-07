import { Injectable } from '@nestjs/common';
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
    return this.prisma.module.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, dto: UpdateModuleDto) {
    return this.prisma.module.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.module.delete({
      where: {
        id,
      },
    });
  }
}
