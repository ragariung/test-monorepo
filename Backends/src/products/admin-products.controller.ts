import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products:read')
  list() {
    return this.productsService.listAllForAdmin();
  }

  @Post()
  @RequirePermission('products:write')
  create(@Body() dto: CreateProductDto) {
    // NOTE: the current frontend's "Add Product" button in ProductCmsView
    // does not call this endpoint yet - it only shows a toast notification.
    // This endpoint exists to satisfy the PRD requirement and for future
    // frontend wiring.
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('products:write')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Post(':id/publish')
  @RequirePermission('products:publish')
  publish(@Param('id') id: string) {
    return this.productsService.publish(id);
  }

  @Post(':id/archive')
  @RequirePermission('products:publish')
  archive(@Param('id') id: string) {
    return this.productsService.archive(id);
  }
}
