import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  planId!: string;
}
