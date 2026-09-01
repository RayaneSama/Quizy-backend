import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  duration?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @IsUUID()
  @IsOptional()
  programId?: string;
}
