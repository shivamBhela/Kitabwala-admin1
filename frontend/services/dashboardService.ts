/**
 * services/dashboardService.ts
 * Fetches dashboard stats and recent orders from the real API.
 */

import adminPortalClient from "@/lib/api/adminPortalClient";
import type { ApiResponse } from "@/types/api";

export interface DashboardStats {
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
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  delivery_type: "same_day" | "normal";
  total: number;
  status: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  revenueTrend: { day: string; revenue: number }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await adminPortalClient.get<ApiResponse<DashboardData>>("/analytics/dashboard");
  return data.data;
}
