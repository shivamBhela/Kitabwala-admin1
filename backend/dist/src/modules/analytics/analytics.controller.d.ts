import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSameDay(): Promise<import("./dto/same-day-analytics-response.dto").SameDayAnalyticsResponseDto>;
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
