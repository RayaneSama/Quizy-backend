import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateChoiceDto } from './update-choice.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  statement?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsOptional()
  moduleId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateChoiceDto)
  @IsOptional()
  choices?: UpdateChoiceDto[];
}
