import { ProductCategory, ProductStatus } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Deliberately narrower than CreateProductDto: this mirrors exactly what the
 * frontend's ProductCmsView edit form actually sends (name, tagline,
 * category, categoryLabel, summary, minAge, maxAge, minSumAssured,
 * maxSumAssured, status), not the full Product field set.
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSumAssured?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSumAssured?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
