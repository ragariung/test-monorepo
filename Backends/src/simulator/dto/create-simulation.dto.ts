import { PaymentFrequency } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';

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
}
