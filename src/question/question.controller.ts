import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { QuestionQueryDto } from './dto/question-query.dto';

@Controller('questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  findAll(@Query() query: QuestionQueryDto) {
    return this.questionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.questionService.remove(id);
  }
}
