import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramQueryDto } from './dto/program-query.dto';

@Injectable()
export class ProgramService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProgramDto: CreateProgramDto) {
    const existingProgram = await this.prisma.program.findUnique({
      where: {
        name: createProgramDto.name,
      },
    });

    if (existingProgram) {
      throw new BadRequestException('A program with this name already exists.');
    }

    return this.prisma.program.create({
      data: createProgramDto,
    });
  }

  async findAll(query: ProgramQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProgramWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [programs, total] = await Promise.all([
      this.prisma.program.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              modules: true,
              subscriptionPlans: true,
            },
          },
        },
      }),

      this.prisma.program.count({
        where,
      }),
    ]);

    return {
      data: programs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: {
        id,
      },
      include: {
        modules: {
          include: {
            _count: {
              select: {
                courses: true,
              },
            },
          },
        },
        _count: {
          select: {
            modules: true,
            subscriptionPlans: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found.');
    }

    return program;
  }

  async update(id: string, updateProgramDto: UpdateProgramDto) {
    const program = await this.prisma.program.findUnique({
      where: {
        id,
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found.');
    }

    if (updateProgramDto.name) {
      const existingProgram = await this.prisma.program.findUnique({
        where: {
          name: updateProgramDto.name,
        },
      });

      if (existingProgram && existingProgram.id !== id) {
        throw new BadRequestException(
          'A program with this name already exists.',
        );
      }
    }

    return this.prisma.program.update({
      where: {
        id,
      },
      data: {
        ...(updateProgramDto.name !== undefined && {
          name: updateProgramDto.name,
        }),

        ...(updateProgramDto.description !== undefined && {
          description: updateProgramDto.description,
        }),
      },
    });
  }

  async remove(id: string) {
    const program = await this.prisma.program.findUnique({
      where: {
        id,
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found.');
    }

    return this.prisma.program.delete({
      where: {
        id,
      },
    });
  }
}
