import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateChoiceDto } from './create-choice.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  statement!: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  explanation?: string;

  @IsUUID()
  @IsNotEmpty()
  moduleId!: string;

  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceDto)
  choices!: CreateChoiceDto[];
}
