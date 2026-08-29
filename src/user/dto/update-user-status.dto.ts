import { IsEnum } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(AccountStatus)
  status!: AccountStatus;
}
