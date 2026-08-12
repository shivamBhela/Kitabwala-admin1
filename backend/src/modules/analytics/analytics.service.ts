import { Injectable } from '@nestjs/common';
import { DeliveryZone, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { getTodayRange } from '../../common/utils/timezone';
import { format, subDays } from 'date-fns';
import type { SameDayAnalyticsResponseDto } from './dto/same-day-analytics-response.dto';

// Mirrors kitabwalah-admin/constants/app.ts DELIVERY_CHARGES — the customer-facing
// flat-rate table, used here as an MVP estimate of the platform's own courier cost.
// Replace with real Shadowfax/in-house billing once that data is captured on Shipment.
const ZONE_RATE: Record<DeliveryZone, number> = {
  local: 39,
  rest_bihar: 49,
  south_india: 59,
  rest_india: 59,
};

function toNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? Number(value) : 0;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getSameDayAnalytics(): Promise<SameDayAnalyticsResponseDto> {
    const timezone = process.env.ANALYTICS_TIMEZONE ?? 'Asia/Kolkata';
    const { start, end, dateKey } = getTodayRange(timezone);

    const cacheKey = `analytics:same-day:${dateKey}`;
    const cached = await this.redis.getJson<SameDayAnalyticsResponseDto>(cacheKey);
    if (cached) return cached;

    const result = await this.computeSameDayAnalytics(start, end, dateKey);

    const ttl = Number(process.env.SAME_DAY_CACHE_TTL_SECONDS ?? 45);
    await this.redis.setJson(cacheKey, result, ttl);
    return result;
  }

  private async computeSameDayAnalytics(
    start: Date,
    end: Date,
    dateKey: string,
  ): Promise<SameDayAnalyticsResponseDto> {
    const validOrdersWhere: Prisma.OrderWhereInput = {
      created_at: { gte: start, lt: end },
      status: { not: 'cancelled' },
      payment_status: { not: 'failed' },
    };

    const [
      ordersCount,
      revenueAgg,
      commissionAgg,
      shippingAgg,
      refundAgg,
      newUsersCount,
      couponAgg,
      todaysOrdersForDelivery,
      todaysOrdersForReturning,
    ] = await Promise.all([
      this.prisma.order.count({ where: validOrdersWhere }),
      this.prisma.order.aggregate({ where: validOrdersWhere, _sum: { total: true } }),
      this.prisma.vendorOrderItem.aggregate({
        where: { order: validOrdersWhere },
        _sum: { commission_amount: true },
      }),
      this.prisma.order.aggregate({
        where: validOrdersWhere,
        _sum: { shipping_amount: true, cod_charge: true },
      }),
      this.prisma.returnRequest.aggregate({
        where: { status: 'completed', updated_at: { gte: start, lt: end } },
        _sum: { refund_amount: true },
      }),
      this.prisma.user.count({ where: { role: 'customer', created_at: { gte: start, lt: end } } }),
      this.prisma.couponUsage.aggregate({
        where: { used_at: { gte: start, lt: end } },
        _count: { _all: true },
        _sum: { discount_applied: true },
      }),
      this.prisma.order.findMany({ where: validOrdersWhere, select: { pincode: true } }),
      this.prisma.order.findMany({
        where: { ...validOrdersWhere, user: { created_at: { lt: start } } },
        distinct: ['user_id'],
        select: { user_id: true },
      }),
    ]);

    const deliveryCostEstimated = await this.estimateDeliveryCost(todaysOrdersForDelivery);

    const revenue = toNumber(revenueAgg._sum.total);
    const commission = toNumber(commissionAgg._sum.commission_amount);
    const shippingCollected = toNumber(shippingAgg._sum.shipping_amount) + toNumber(shippingAgg._sum.cod_charge);
    const refundCost = toNumber(refundAgg._sum.refund_amount);

    const net = commission + shippingCollected - deliveryCostEstimated - refundCost;

    return {
      date: dateKey,
      ordersCount,
      revenue,
      profit: net >= 0 ? net : 0,
      loss: net < 0 ? Math.abs(net) : 0,
      deliveryCostEstimated,
      refundCost,
      newUsersCount,
      returningUsersCount: todaysOrdersForReturning.length,
      couponUsage: {
        count: couponAgg._count._all,
        totalDiscountAmount: toNumber(couponAgg._sum.discount_applied),
      },
    };
  }

  private async estimateDeliveryCost(orders: { pincode: string | null }[]): Promise<number> {
    const pincodes = [...new Set(orders.map((o) => o.pincode).filter((p): p is string => Boolean(p)))];
    if (pincodes.length === 0) return 0;

    const pincodeRows = await this.prisma.pincode.findMany({
      where: { pincode: { in: pincodes } },
      select: { pincode: true, delivery_zone: true },
    });
    const zoneByPincode = new Map(pincodeRows.map((p) => [p.pincode, p.delivery_zone]));

    return orders.reduce((sum, order) => {
      const zone = order.pincode ? zoneByPincode.get(order.pincode) : undefined;
      return sum + (zone ? ZONE_RATE[zone] : 0);
    }, 0);
  }

  /** Aggregated dashboard stats + recent orders + 30-day revenue trend */
  async getDashboard() {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [
      totalOrders,
      totalUsers,
      activeVendors,
      pendingOrders,
      pendingProducts,
      pendingKyc,
      pendingWithdrawals,
      pendingReturns,
      lowStockProducts,
      deliveredRevenue,
      recentOrders,
      revenueTrendRaw,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.vendorProfile.count({ where: { is_active: true, is_verified: true } }),
      this.prisma.order.count({ where: { status: { in: ['pending', 'processing'] } } }),
      this.prisma.product.count({ where: { status: 'pending_review' } }),
      this.prisma.vendorProfile.count({ where: { is_verified: false } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
      this.prisma.returnRequest.count({ where: { status: 'pending' } }),
      this.prisma.product.count({ where: { stock_quantity: { lt: 5 }, status: 'active' } }),
      this.prisma.order.aggregate({ where: { status: 'delivered' }, _sum: { total: true } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          order_number: true,
          delivery_type: true,
          total: true,
          status: true,
          created_at: true,
          user: { select: { display_name: true } },
        },
      }),
      this.prisma.$queryRaw<{ day: string; revenue: number }[]>(
        Prisma.sql`
          SELECT DATE(created_at AT TIME ZONE 'Asia/Kolkata') AS day,
                 SUM(total)::float AS revenue
          FROM orders
          WHERE status = 'delivered'
            AND created_at >= ${thirtyDaysAgo}
          GROUP BY day
          ORDER BY day ASC
        `,
      ),
    ]);

    return {
      stats: {
        totalRevenue: toNumber(deliveredRevenue._sum.total),
        totalOrders,
        totalUsers,
        activeVendors,
        pendingOrders,
        pendingProducts,
        pendingKyc,
        pendingWithdrawals,
        pendingReturns,
        lowStockProducts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.user.display_name,
        delivery_type: o.delivery_type,
        total: toNumber(o.total),
        status: o.status,
        created_at: o.created_at.toISOString(),
      })),
      revenueTrend: revenueTrendRaw.map((r) => ({
        day: format(new Date(r.day), 'yyyy-MM-dd'),
        revenue: Number(r.revenue),
      })),
    };
  }
}
