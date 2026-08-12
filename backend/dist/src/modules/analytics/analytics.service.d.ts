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
            totalOrders: number;
            totalUsers: number;
            activeVendors: number;
            pendingOrders: number;
            pendingProducts: number;
            pendingKyc: number;
            pendingWithdrawals: number;
            pendingReturns: number;
            lowStockProducts: number;
        };
        recentOrders: {
            id: number;
            order_number: string;
            customer_name: string;
            delivery_type: import("@prisma/client").$Enums.DeliveryType;
            total: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            created_at: string;
        }[];
        revenueTrend: {
            day: any;
            revenue: number;
        }[];
    }>;
}
