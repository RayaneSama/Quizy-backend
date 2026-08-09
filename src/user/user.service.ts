import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async createUser(data: RegisterDto) {
    const existingUsername = await this.prisma.user.findUnique({
      where: {
        userName: data.userName,
      },
    });

    if (existingUsername) {
      throw new BadRequestException('This username is already registered');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('This email is already registered');
    }

    return this.prisma.user.create({
      data,
    });
  }

  async deleteUser(userId: string) {
    return await this.prisma.user.delete({ where: { id: userId } });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.userName) {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          userName: dto.userName,
        },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Username is already taken.');
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.userName !== undefined && { userName: dto.userName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        hashedRefreshToken: null,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }
}
