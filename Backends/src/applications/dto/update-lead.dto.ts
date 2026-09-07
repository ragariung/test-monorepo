import { Type } from 'class-transformer';
import {
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
import { ContactTime, PaymentFrequency } from '@prisma/client';

/**
 * Every field optional - a partial update. Staff editing a DRAFT lead after
 * a phone call only sends whatever actually changed (e.g. just a corrected
 * phone number, or a whole new product + simulation if the prospect wants
 * something different than what the chatbot originally captured).
 */
class UpdateLeadApplicantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(ContactTime)
  preferredContactTime?: ContactTime;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Same shape as CreateSimulationDto - if given, ApplicationsService.updateLead()
 * re-runs the real simulation engine (via SimulatorService) rather than just
 * overwriting numbers, so the attached premium figures are always genuinely
 * computed, never hand-typed.
 */
class UpdateLeadSimulationDto {
  @IsInt()
  @Min(0)
  age: number;

  @IsNumber()
  @Min(0)
  sumAssured: number;

  @IsInt()
  @Min(1)
  paymentTermYears: number;

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  productId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLeadApplicantDto)
  applicant?: UpdateLeadApplicantDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLeadSimulationDto)
  simulation?: UpdateLeadSimulationDto;
}
