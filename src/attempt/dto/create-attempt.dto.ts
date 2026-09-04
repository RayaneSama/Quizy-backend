import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { AttemptMode } from '@prisma/client';

export class CreateAttemptDto {
  @IsUUID()
  quizId!: string;

  @IsEnum(AttemptMode)
  mode!: AttemptMode;

  @IsInt()
  @Min(1)
  questionCount!: number;
}
