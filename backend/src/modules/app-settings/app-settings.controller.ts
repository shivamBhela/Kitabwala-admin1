import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { AppSettingsService } from './app-settings.service';
import { UpsertAppSettingDto } from './dto/upsert-app-setting.dto';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  @RequirePermission(Permission.SETTINGS_MANAGE)
  findAll() {
    return this.appSettingsService.findAll();
  }

  @Get(':key')
  @RequirePermission(Permission.SETTINGS_MANAGE)
  findOne(@Param('key') key: string) {
    return this.appSettingsService.findOne(key);
  }

  @Put(':key')
  @RequirePermission(Permission.SETTINGS_MANAGE)
  upsert(
    @Param('key') key: string,
    @Body() dto: UpsertAppSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appSettingsService.upsert(key, dto, user.sub);
  }
}
