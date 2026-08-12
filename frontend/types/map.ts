/**
 * types/map.ts
 * Mirrors kitabwalah-api's GET /map/markers response.
 */

export interface MapMarker {
  id: string;
  type: "delivery_person";
  lat: number;
  lng: number;
  label: string;
  meta: Record<string, unknown>;
}

export interface MapMarkersResponse {
  markers: MapMarker[];
}
