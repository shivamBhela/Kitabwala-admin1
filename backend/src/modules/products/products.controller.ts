import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ProductsService } from './products.service';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { BulkProductIdsDto } from './dto/bulk-product-ids.dto';
import { FeatureProductDto } from './dto/feature-product.dto';
import { UpsertCityPriceDto } from './dto/upsert-city-price.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.create(dto, user.sub);
  }

  @Patch(':id')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.update(id, dto, user.sub);
  }

  @Patch(':id/approve')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.approve(id, user.sub);
  }

  @Patch(':id/reject')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.reject(id, dto, user.sub);
  }

  @Post('bulk-approve')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  bulkApprove(@Body() dto: BulkProductIdsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.bulkApprove(dto, user.sub);
  }

  @Post('bulk-deactivate')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  bulkDeactivate(@Body() dto: BulkProductIdsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.bulkDeactivate(dto, user.sub);
  }

  @Patch(':id/feature')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  feature(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FeatureProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.feature(id, dto, user.sub);
  }

  @Delete(':id/feature')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  unfeature(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.unfeature(id, user.sub);
  }

  @Get(':id/city-prices')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  listCityPrices(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.listCityPrices(id);
  }

  @Put(':id/city-prices/:cityId')
  @RequirePermission(Permission.PRODUCTS_MANAGE)
  upsertCityPrice(
    @Param('id', ParseIntPipe) id: number,
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body() dto: UpsertCityPriceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.upsertCityPrice(id, cityId, dto, user.sub);
  }
}
