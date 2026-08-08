import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { AttemptMode } from '@prisma/client';

export class CreateAttemptDto {
  @IsString()
  courseId!: string;

  @IsEnum(AttemptMode)
  mode!: AttemptMode;

  @IsInt()
  @Min(1)
  questionCount!: number;
}
