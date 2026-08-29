import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { UserInfoDto } from './user-info.dto';
// import { RegisterDto } from 'src/auth/dto/register.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
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
  // @Post()
  // createUser(@Body() data: RegisterDto) {
  //   return this.userService.createUser(data);
  // }
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

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') userId: string, @Body() dto: UpdateUserStatusDto) {
    return this.userService.updateStatus(userId, dto);
  }
}
