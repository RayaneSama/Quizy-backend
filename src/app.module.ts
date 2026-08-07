import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ModuleModule } from './module/module.module';
import { CourseModule } from './course/course.module';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    ModuleModule,
    CourseModule,
    QuestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
