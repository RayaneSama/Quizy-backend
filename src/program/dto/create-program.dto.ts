import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;
}
