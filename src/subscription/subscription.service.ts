import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';

import { SubscriptionQueryDto } from './dto/subscription-query.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------
  // Student: request subscription
  // ---------------------------------------------

  async create(userId: string, dto: CreateSubscriptionDto) {
    // Check plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id: dto.planId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    // Check if user already has a pending request
    const pendingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.PENDING,
      },
    });

    if (pendingSubscription) {
      throw new BadRequestException(
        'You already have a pending subscription request.',
      );
    }

    // Check if user already has an active subscription
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (activeSubscription) {
      throw new BadRequestException('You already have an active subscription.');
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        planId: dto.planId,
        status: SubscriptionStatus.PENDING,
      },
      include: {
        plan: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  // ---------------------------------------------
  // Student: get my subscriptions
  // ---------------------------------------------

  async findMine(userId: string) {
    return this.prisma.subscription.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plan: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  // ---------------------------------------------
  // Admin: get all subscriptions
  // ---------------------------------------------

  async findAll(query: SubscriptionQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      planId,
      programId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {
      ...(status && {
        status: status,
      }),

      ...(planId && {
        planId,
      }),

      ...(programId && {
        plan: {
          programId,
        },
      }),

      ...(search && {
        user: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              userName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    };

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,

        where,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              email: true,
            },
          },

          plan: {
            include: {
              program: true,
            },
          },
        },
      }),

      this.prisma.subscription.count({
        where,
      }),
    ]);

    return {
      data: subscriptions,

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------------------------
  // Find one
  // ---------------------------------------------

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
          },
        },

        plan: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    return subscription;
  }

  // ---------------------------------------------
  // Admin: activate
  // ---------------------------------------------

  async activate(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id,
      },

      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending subscriptions can be activated.',
      );
    }

    const startDate = new Date();

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + subscription.plan.duration);

    return this.prisma.subscription.update({
      where: {
        id,
      },

      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
          },
        },

        plan: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  // ---------------------------------------------
  // Admin: reject
  // ---------------------------------------------

  async reject(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending subscriptions can be rejected.',
      );
    }

    return this.prisma.subscription.update({
      where: {
        id,
      },

      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });
  }
}
