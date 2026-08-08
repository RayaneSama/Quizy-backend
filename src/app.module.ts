import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ModuleModule } from './module/module.module';
import { CourseModule } from './course/course.module';
import { QuestionModule } from './question/question.module';
import { AttemptModule } from './attempt/attempt.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { CommentModule } from './comment/comment.module';
import { ReportModule } from './report/report.module';
import { NoteModule } from './note/note.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    ModuleModule,
    CourseModule,
    QuestionModule,
    AttemptModule,
    BookmarkModule,
    CommentModule,
    ReportModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
