import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChoiceDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}
