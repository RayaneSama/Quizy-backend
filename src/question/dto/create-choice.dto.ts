import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}
