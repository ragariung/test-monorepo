import { PaymentFrequency } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSimulationDto {
  @IsString()
  productId: string;

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

  /**
   * Optional: the PRAXIS Assistant chat session this simulation was run
   * from (Automation/). Lets a later POST /leads in the same chat session
   * auto-attach this simulation without needing an explicit simulationRunId -
   * see CreateLeadDto. Not used/settable by the formal web funnel.
   */
  @IsOptional()
  @IsString()
  sessionId?: string;
}
