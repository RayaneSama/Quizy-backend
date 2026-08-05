import { Body, Injectable } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
// import { UserInfoDto } from './user-info.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async createUser(data: RegisterDto) {
    return await this.prismaService.user.create({ data });
  }

  async deleteUser(userId: string) {
    return await this.prismaService.user.delete({ where: { id: userId } });
  }
}
