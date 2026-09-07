import { IsOptional, IsString } from 'class-validator';

export class UpdateManagerDto {
  @IsOptional()
  @IsString()
  managerId: string | null;
}
