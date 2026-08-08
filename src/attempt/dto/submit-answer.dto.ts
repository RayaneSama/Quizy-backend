import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  choiceIds!: string[];
}
