import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../auth/rbac/permissions';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('same-day')
  @RequirePermission(Permission.ANALYTICS_READ)
  getSameDay() {
    return this.analyticsService.getSameDayAnalytics();
  }

  @Get('dashboard')
  @RequirePermission(Permission.ANALYTICS_READ)
  getDashboard() {
    return this.analyticsService.getDashboard();
  }
}

