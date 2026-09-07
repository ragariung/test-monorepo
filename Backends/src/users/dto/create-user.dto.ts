import { StaffRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsEnum(StaffRole)
  role: StaffRole;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  managerId?: string | null;

  @IsString()
  @MinLength(8)
  password: string;
}
