import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateChoiceDto {
  @IsString()
  // @IsOptional()
  @IsNotEmpty()
  @MaxLength(1000)
  text!: string;

  @IsBoolean()
  // @IsOptional()
  isCorrect!: boolean;
}
