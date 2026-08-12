'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMapMarkers } from '@/hooks/queries/useMapMarkers';
import type { MapMarkerDef } from '@/components/map/AdvancedMap';
import type { MapMarker } from '@/types/map';
import { formatDateTime } from '@/utils/format';

// Leaflet touches window/document directly — must never run during SSR.
const AdvancedMap = dynamic(() => import('@/components/map/AdvancedMap').then((m) => m.AdvancedMap), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
      Loading map…
    </div>
  ),
});

function toMarkerDef(marker: MapMarker): MapMarkerDef {
  return {
    id: marker.id,
    position: [marker.lat, marker.lng],
    color: 'blue',
    popup: {
      title: marker.label,
      content: `Delivery agent · ${marker.meta.vehicleType ?? 'vehicle unknown'}${
        marker.meta.lastUpdate ? ` · last seen ${formatDateTime(marker.meta.lastUpdate as string)}` : ''
      }`,
    },
  };
}

export default function MapSection() {
  const { data, isLoading, isError, error, refetch } = useMapMarkers();

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-sm font-bold">Couldn&apos;t load map markers</h2>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error contacting the backend.'}
        </p>
        <button onClick={() => refetch()} className="mt-4 text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const markers = (data?.markers ?? []).map(toMarkerDef);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
          <MapPin className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {isLoading ? 'Loading live delivery-agent locations…' : `${markers.length} live delivery agent${markers.length === 1 ? '' : 's'} on the map`}
          </p>
          <p className="text-slate-500 mt-0.5">
            Vendor, order, and warehouse pins need pincode-level coordinates, which aren&apos;t in the database yet —
            they&apos;ll appear automatically once that data is imported. Search, satellite view, and geolocation work now.
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
        <AdvancedMap markers={markers} style={{ height: '600px', width: '100%' }} />
      </div>
    </div>
  );
}
