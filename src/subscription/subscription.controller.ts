import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';

import { SubscriptionQueryDto } from './dto/subscription-query.dto';

import { SubscriptionService } from './subscription.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ---------------------------------------------
  // Student
  // ---------------------------------------------

  @Post('request')
  @Roles('STUDENT')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(user.sub, dto);
  }

  @Get('me')
  @Roles('STUDENT')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.findMine(user.sub);
  }

  // ---------------------------------------------
  // Admin
  // ---------------------------------------------

  @Get()
  @Roles('ADMIN')
  findAll(@Query() query: SubscriptionQueryDto) {
    return this.subscriptionService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(@Param('id') id: string) {
    return this.subscriptionService.activate(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN')
  cancel(@Param('id') id: string) {
    return this.subscriptionService.cancel(id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  reject(@Param('id') id: string) {
    return this.subscriptionService.reject(id);
  }
}
