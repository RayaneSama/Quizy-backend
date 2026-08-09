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

import { UpdateChoiceDto } from './update-choice.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(5000)
  statement?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(5000)
  explanation?: string;

  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateChoiceDto)
  @IsOptional()
  choices?: UpdateChoiceDto[];
}
