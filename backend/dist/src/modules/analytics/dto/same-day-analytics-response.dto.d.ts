export interface SameDayAnalyticsResponseDto {
    date: string;
    ordersCount: number;
    revenue: number;
    profit: number;
    loss: number;
    deliveryCostEstimated: number;
    refundCost: number;
    newUsersCount: number;
    returningUsersCount: number;
    couponUsage: {
        count: number;
        totalDiscountAmount: number;
    };
}
