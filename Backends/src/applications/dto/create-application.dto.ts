import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ContactTime } from '@prisma/client';

class ApplicantDto {
  @IsString()
  @MinLength(1)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @MinLength(1)
  city: string;

  @IsEnum(ContactTime)
  preferredContactTime: ContactTime;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateApplicationDto {
  @IsString()
  productId: string;

  @IsString()
  simulationRunId: string;

  @ValidateNested()
  @Type(() => ApplicantDto)
  applicant: ApplicantDto;

  @IsBoolean()
  consent: boolean;
}
