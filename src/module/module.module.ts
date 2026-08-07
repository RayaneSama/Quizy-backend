import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { CourseService } from 'src/course/course.service';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService, CourseService],
})
export class ModuleModule {}
