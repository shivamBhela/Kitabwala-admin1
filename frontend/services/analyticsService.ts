/**
 * services/analyticsService.ts
 * Axios calls for the real analytics endpoints.
 */

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SameDayAnalytics } from "@/types/analytics";

export async function getSameDayAnalytics(): Promise<SameDayAnalytics> {
  const { data } = await axiosInstance.get<ApiResponse<SameDayAnalytics>>("/analytics/same-day");
  return data.data;
}
