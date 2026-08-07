import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateChoiceDto } from './create-choice.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  statement!: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsNotEmpty()
  moduleId!: string;

  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceDto)
  choices!: CreateChoiceDto[];
}
