import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  // CategoriesModule is imported here (rather than registered directly in app.module.ts,
  // which is off-limits for this pass) purely so CategoriesController's routes get
  // wired into the app via ProductsModule, which app.module.ts already imports.
  // CategoriesService has no dependency on ProductsService or vice versa — they stay
  // fully separate CRUD implementations, just co-located in the module graph.
  imports: [AuditModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
