import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { ContactTime } from '@prisma/client';

/**
 * Deliberately minimal compared to ApplicantDto (create-application.dto.ts):
 * only fullName is required. At least one of email/phone is required, but
 * that's an "at least one of" rule class-validator field decorators can't
 * express alone - enforced in ApplicationsService.createLead().
 */
class LeadApplicantDto {
  @IsString()
  @MinLength(1)
  fullName: string;

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

export class CreateLeadDto {
  @IsString()
  @MinLength(1)
  productId: string;

  @ValidateNested()
  @Type(() => LeadApplicantDto)
  applicant: LeadApplicantDto;

  @IsBoolean()
  consent: boolean;

  /**
   * Optional: id of a SimulationRun (from POST /simulations) already run for
   * this same productId. When given, its numbers are copied into this lead's
   * simulationSnapshot - same shape ApplicationsService.createAndSubmit()
   * writes for the full funnel - so a quote given during chat isn't lost.
   * Omit entirely for a lead with no simulation (unchanged prior behavior).
   */
  @IsOptional()
  @IsString()
  simulationRunId?: string;

  /**
   * Optional: the PRAXIS Assistant chat session this lead came from
   * (Automation/) - supplied by the n8n workflow itself, not the chatbot's
   * LLM. When simulationRunId isn't given but this is, createLead() looks up
   * the most recent valid SimulationRun for this (sessionId, productId) pair
   * and attaches it automatically - more reliable than asking the LLM to
   * carry an opaque simulationRunId across conversation turns.
   */
  @IsOptional()
  @IsString()
  sessionId?: string;
}
