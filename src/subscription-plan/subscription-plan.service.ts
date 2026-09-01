import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanQueryDto } from './dto/subscription-plan-query.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriptionPlanDto) {
    const program = await this.prisma.program.findUnique({
      where: {
        id: dto.programId,
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found.');
    }

    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        duration: dto.duration,
        price: dto.price,
        programId: dto.programId,
      },
      include: {
        program: true,
      },
    });
  }

  async findAll(query: SubscriptionPlanQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      programId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionPlanWhereInput = {
      ...(programId && {
        programId,
      }),

      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [plans, total] = await Promise.all([
      this.prisma.subscriptionPlan.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      }),

      this.prisma.subscriptionPlan.count({
        where,
      }),
    ]);

    return {
      data: plans,

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id,
      },

      include: {
        program: true,

        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    return plan;
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (dto.programId) {
      const program = await this.prisma.program.findUnique({
        where: {
          id: dto.programId,
        },
      });

      if (!program) {
        throw new NotFoundException('Program not found.');
      }
    }

    return this.prisma.subscriptionPlan.update({
      where: {
        id,
      },

      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.duration !== undefined && {
          duration: dto.duration,
        }),

        ...(dto.price !== undefined && {
          price: dto.price,
        }),

        ...(dto.programId !== undefined && {
          programId: dto.programId,
        }),
      },

      include: {
        program: true,
      },
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id,
      },

      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (plan._count.subscriptions > 0) {
      throw new BadRequestException(
        'This subscription plan cannot be deleted because it has subscriptions.',
      );
    }

    await this.prisma.subscriptionPlan.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Subscription plan deleted successfully.',
    };
  }
}
