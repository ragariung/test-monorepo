import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCT_INCLUDE = {
  benefits: { orderBy: { sortOrder: 'asc' as const } },
  coverageDetails: { orderBy: { sortOrder: 'asc' as const } },
  eligibilityConditions: { orderBy: { sortOrder: 'asc' as const } },
  documents: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPublishedBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });

    if (!product || product.status !== ProductStatus.PUBLISHED) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  listAllForAdmin() {
    return this.prisma.product.findMany({
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        tagline: dto.tagline,
        category: dto.category,
        categoryLabel: dto.categoryLabel,
        summary: dto.summary,
        targetAudience: dto.targetAudience,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        minSumAssured: dto.minSumAssured,
        maxSumAssured: dto.maxSumAssured,
        allowedPaymentTerms: dto.allowedPaymentTerms,
        coverageDurationYears: dto.coverageDurationYears,
        baseAnnualRatePerMillion: dto.baseAnnualRatePerMillion,
        badge: dto.badge,
        colorTone: dto.colorTone,
        status: ProductStatus.DRAFT,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { ...dto },
      include: PRODUCT_INCLUDE,
    });
  }

  async publish(id: string) {
    await this.assertExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.PUBLISHED, publishedAt: new Date() },
      include: PRODUCT_INCLUDE,
    });
  }

  async archive(id: string) {
    await this.assertExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
      include: PRODUCT_INCLUDE,
    });
  }

  private async assertExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
