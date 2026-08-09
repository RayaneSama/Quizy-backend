import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
