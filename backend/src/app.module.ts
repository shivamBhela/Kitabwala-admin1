import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';

import { RedisModule } from './redis/redis.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProductsModule } from './modules/products/products.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { MapModule } from './modules/map/map.module';
import { AppSettingsModule } from './modules/app-settings/app-settings.module';
import { PincodesModule } from './modules/pincodes/pincodes.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ThemesModule } from './modules/themes/themes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: seconds(60), limit: 60 }]),

    RedisModule,
    AuditModule,
    AuthModule,
    UsersModule,
    AdminModule,
    AnalyticsModule,
    ProductsModule,
    VendorsModule,
    MapModule,
    AppSettingsModule,
    PincodesModule,
    WithdrawalsModule,
    OrdersModule,
    ReturnsModule,
    DeliveryModule,
    ThemesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // ThrottlerGuard runs first — repeated bad-auth attempts get rate-limited
    // before JwtAuthGuard/PermissionsGuard even evaluate them.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
