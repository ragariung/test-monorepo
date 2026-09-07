import { IsOptional, IsString } from 'class-validator';

export class QueryAuditDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  action?: string;
}
