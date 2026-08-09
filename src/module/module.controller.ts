import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CourseService } from 'src/course/course.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('module')
@UseGuards(AuthGuard('jwt'))
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly courseService: CourseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  findAll() {
    return this.moduleService.findAll();
  }

  @Get(':moduleId/courses')
  findCourses(@Param('moduleId') moduleId: string) {
    return this.courseService.findByModule(moduleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(id);
  }
}
