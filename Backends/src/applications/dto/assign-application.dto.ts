import { IsOptional, IsString } from 'class-validator';

export class AssignApplicationDto {
  @IsOptional()
  @IsString()
  userId: string | null;
}
