/**
 * hooks/queries/useMapMarkers.ts
 * Live delivery-agent locations. Refetched every 30s — same rationale as
 * Same-Day Analytics, this is meant to read as a near-real-time ops view.
 */

import { useQuery } from "@tanstack/react-query";
import { getMapMarkers } from "@/services/mapService";

const MAP_REFRESH_INTERVAL_MS = 30_000;

export function useMapMarkers() {
  return useQuery({
    queryKey: ["map", "markers"],
    queryFn: getMapMarkers,
    staleTime: MAP_REFRESH_INTERVAL_MS,
    refetchInterval: MAP_REFRESH_INTERVAL_MS,
  });
}
