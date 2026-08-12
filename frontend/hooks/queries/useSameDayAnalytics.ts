/**
 * hooks/queries/useSameDayAnalytics.ts
 * Live "today" metrics — refetched frequently, unlike the 5-minute app default,
 * since Same-Day Analytics is meant to read as near-real-time.
 */

import { useQuery } from "@tanstack/react-query";
import { getSameDayAnalytics } from "@/services/analyticsService";

const SAME_DAY_REFRESH_INTERVAL_MS = 60_000;

export function useSameDayAnalytics() {
  return useQuery({
    queryKey: ["analytics", "same-day"],
    queryFn: getSameDayAnalytics,
    staleTime: SAME_DAY_REFRESH_INTERVAL_MS,
    refetchInterval: SAME_DAY_REFRESH_INTERVAL_MS,
  });
}
