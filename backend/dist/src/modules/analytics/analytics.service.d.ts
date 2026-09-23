import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import type { SameDayAnalyticsResponseDto } from './dto/same-day-analytics-response.dto';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    getSameDayAnalytics(): Promise<SameDayAnalyticsResponseDto>;
    private computeSameDayAnalytics;
    private estimateDeliveryCost;
    getDashboard(): Promise<{
        stats: {
            totalRevenue: number;
            totalOrders: any;
            totalUsers: any;
            activeVendors: any;
            pendingOrders: any;
            pendingProducts: any;
            pendingKyc: any;
            pendingWithdrawals: any;
            pendingReturns: any;
            lowStockProducts: any;
        };
        recentOrders: any;
        revenueTrend: any;
    }>;
}
