import { ProductCategory } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  tagline: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @MinLength(1)
  categoryLabel: string;

  @IsString()
  @MinLength(1)
  summary: string;

  @IsArray()
  @IsString({ each: true })
  targetAudience: string[];

  @IsInt()
  @Min(0)
  minAge: number;

  @IsInt()
  @Min(0)
  maxAge: number;

  @IsNumber()
  @Min(0)
  minSumAssured: number;

  @IsNumber()
  @Min(0)
  maxSumAssured: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  allowedPaymentTerms: number[];

  @IsInt()
  @Min(1)
  coverageDurationYears: number;

  @IsNumber()
  @Min(0)
  baseAnnualRatePerMillion: number;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  colorTone?: string;
}
