import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
// import { UpdateAttemptDto } from './dto/update-attempt.dto';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller('attempts')
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAttemptDto) {
    return this.attemptService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.attemptService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.attemptService.findOne(id, user.sub);
  }

  @Patch(':id/finish')
  finish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.attemptService.finish(id, user.sub);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAttemptDto: UpdateAttemptDto) {
  //   return this.attemptService.update(+id, updateAttemptDto);
  // }

  @Post(':attemptId/answers')
  submitAnswer(
    @CurrentUser() user: JwtPayload,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.attemptService.submitAnswer(attemptId, user.sub, dto);
  }

  @Get(':id/results')
  results(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.attemptService.results(id, user.sub);
  }

  // @Delete(':id')
  // remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
  //   return this.attemptService.remove(id, user.sub);
  // }
}
