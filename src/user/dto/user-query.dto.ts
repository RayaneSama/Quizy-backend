import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['STUDENT', 'ADMIN'])
  role?: 'STUDENT' | 'ADMIN';

  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED'])
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';

  @IsOptional()
  @IsIn(['firstName', 'lastName', 'userName', 'email', 'createdAt'])
  sortBy?: 'firstName' | 'lastName' | 'userName' | 'email' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
