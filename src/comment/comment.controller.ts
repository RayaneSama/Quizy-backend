import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':questionId')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('questionId') questionId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(user.sub, questionId, dto.content);
  }

  @Get('question/:questionId')
  findByQuestion(@Param('questionId') questionId: string) {
    return this.commentService.findByQuestion(questionId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') commentId: string) {
    return this.commentService.remove(user.sub, commentId);
  }
}
