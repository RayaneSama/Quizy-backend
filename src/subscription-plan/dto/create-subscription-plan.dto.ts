import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsInt()
  @IsPositive()
  duration!: number;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsUUID()
  @IsNotEmpty()
  programId!: string;
}
