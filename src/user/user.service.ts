import { Body, Injectable, Param } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfoDto } from './user-info.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async createUser(data: UserInfoDto) {
    return await this.prismaService.user.create({ data });
  }

  async deleteUser(userId: string) {
    return await this.prismaService.user.delete({ where: { id: userId } });
  }
}
