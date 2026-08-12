/**
 * services/mapService.ts
 * Axios calls for the real map endpoints.
 */

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { MapMarkersResponse } from "@/types/map";

export async function getMapMarkers(): Promise<MapMarkersResponse> {
  const { data } = await axiosInstance.get<ApiResponse<MapMarkersResponse>>("/map/markers");
  return data.data;
}
