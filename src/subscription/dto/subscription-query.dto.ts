import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SubscriptionQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  planId?: string;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsOptional()
  @IsIn(['createdAt', 'startDate', 'endDate', 'status'])
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'])
  status?: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}
