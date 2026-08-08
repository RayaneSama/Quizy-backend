import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';

@Controller('bookmarks')
@UseGuards(AuthGuard('jwt'))
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post(':questionId')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('questionId') questionId: string,
  ) {
    return this.bookmarkService.create(user.sub, questionId);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.bookmarkService.findAll(user.sub);
  }

  @Delete(':questionId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('questionId') questionId: string,
  ) {
    return this.bookmarkService.remove(user.sub, questionId);
  }
}
