import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
