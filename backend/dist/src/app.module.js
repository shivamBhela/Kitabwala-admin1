"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const admin_module_1 = require("./modules/admin/admin.module");
const audit_module_1 = require("./modules/audit/audit.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const products_module_1 = require("./modules/products/products.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const map_module_1 = require("./modules/map/map.module");
const app_settings_module_1 = require("./modules/app-settings/app-settings.module");
const pincodes_module_1 = require("./modules/pincodes/pincodes.module");
const withdrawals_module_1 = require("./modules/withdrawals/withdrawals.module");
const orders_module_1 = require("./modules/orders/orders.module");
const returns_module_1 = require("./modules/returns/returns.module");
const delivery_module_1 = require("./modules/delivery/delivery.module");
const themes_module_1 = require("./modules/themes/themes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, validate: env_validation_1.validateEnv }),
            throttler_1.ThrottlerModule.forRoot([{ name: 'default', ttl: (0, throttler_1.seconds)(60), limit: 60 }]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            products_module_1.ProductsModule,
            vendors_module_1.VendorsModule,
            map_module_1.MapModule,
            app_settings_module_1.AppSettingsModule,
            pincodes_module_1.PincodesModule,
            withdrawals_module_1.WithdrawalsModule,
            orders_module_1.OrdersModule,
            returns_module_1.ReturnsModule,
            delivery_module_1.DeliveryModule,
            themes_module_1.ThemesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map