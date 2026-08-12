export interface SameDayAnalyticsResponseDto {
  date: string;
  ordersCount: number;
  revenue: number;
  /** Contribution margin (commission + shipping/COD collected − estimated delivery cost − refunds), not full P&L. */
  profit: number;
  loss: number;
  /** Estimated using the customer-facing delivery-zone flat-rate table, not real courier billing data. */
  deliveryCostEstimated: number;
  refundCost: number;
  newUsersCount: number;
  returningUsersCount: number;
  couponUsage: {
    count: number;
    totalDiscountAmount: number;
  };
}
