import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post(':questionId')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('questionId') questionId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.noteService.create(user.sub, questionId, dto);
  }

  @Get()
  findMyNotes(@CurrentUser() user: JwtPayload) {
    return this.noteService.findMyNotes(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') noteId: string) {
    return this.noteService.findOne(user.sub, noteId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') noteId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.noteService.update(user.sub, noteId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') noteId: string) {
    return this.noteService.remove(user.sub, noteId);
  }
}
