import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSameDay(): Promise<import("./dto/same-day-analytics-response.dto").SameDayAnalyticsResponseDto>;
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
            day: string;
            revenue: number;
        }[];
    }>;
}
