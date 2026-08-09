import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { UserInfoDto } from './user-info.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.sub);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.sub, dto);
  }
  @Post()
  createUser(@Body() data: RegisterDto) {
    return this.userService.createUser(data);
  }
  @Get('me/statistics')
  @UseGuards(AuthGuard('jwt'))
  getStatistics(@CurrentUser() user: JwtPayload) {
    return this.userService.getStatistics(user.sub);
  }

  @Get('me/progress')
  @UseGuards(AuthGuard('jwt'))
  getProgress(@CurrentUser() user: JwtPayload) {
    return this.userService.getProgress(user.sub);
  }
  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.sub, dto);
  }
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
