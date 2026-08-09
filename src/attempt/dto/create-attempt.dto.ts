import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { AttemptMode } from '@prisma/client';

export class CreateAttemptDto {
  @IsUUID()
  courseId!: string;

  @IsEnum(AttemptMode)
  mode!: AttemptMode;

  @IsInt()
  @Min(1)
  questionCount!: number;
}
