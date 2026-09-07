import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AlcoholUse, ContactTime, SmokingStatus } from '@prisma/client';

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

  /**
   * ISO date string (e.g. "1990-05-15"), optional - additional identity
   * data alongside age, not a replacement for it. age still drives
   * simulation/eligibility everywhere; dob is stored as-is for the record.
   */
  @IsOptional()
  @IsDateString()
  dob?: string;

  /**
   * Health/medical intake, optional - typically filled in by staff during
   * their call with the prospect, not collected on the public form itself.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsEnum(SmokingStatus)
  smokingStatus?: SmokingStatus;

  @IsOptional()
  @IsEnum(AlcoholUse)
  alcoholUse?: AlcoholUse;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

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
