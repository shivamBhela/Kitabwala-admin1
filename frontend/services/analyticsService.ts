/**
 * services/analyticsService.ts
 * Axios calls for the real analytics endpoints.
 */

import adminPortalClient from "@/lib/api/adminPortalClient";
import type { ApiResponse } from "@/types/api";
import type { SameDayAnalytics } from "@/types/analytics";

export async function getSameDayAnalytics(): Promise<SameDayAnalytics> {
  const { data } = await adminPortalClient.get<ApiResponse<SameDayAnalytics>>("/analytics/same-day");
  return data.data;
}
