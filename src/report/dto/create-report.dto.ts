import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
