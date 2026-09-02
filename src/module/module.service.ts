import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryModuleDto } from './dto/query-module.dto';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}
  create(createModuleDto: CreateModuleDto) {
    return this.prisma.module.create({
      data: {
        name: createModuleDto.name,
        description: createModuleDto.description,
        programId: createModuleDto.programId,
      },
    });
  }

  async findAll(query: QueryModuleDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where = search
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
      : {};

    const [modules, total] = await Promise.all([
      this.prisma.module.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: { program: true },
      }),

      this.prisma.module.count({
        where,
      }),
    ]);

    return {
      data: modules,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
