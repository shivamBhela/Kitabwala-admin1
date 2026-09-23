/**
 * services/mapService.ts
 * Axios calls for the real map endpoints.
 */

import adminPortalClient from "@/lib/api/adminPortalClient";
import type { ApiResponse } from "@/types/api";
import type { MapMarkersResponse } from "@/types/map";

export async function getMapMarkers(): Promise<MapMarkersResponse> {
  const { data } = await adminPortalClient.get<ApiResponse<MapMarkersResponse>>("/map/markers");
  return data.data;
}
