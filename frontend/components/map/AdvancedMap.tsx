'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// react-leaflet's bundler doesn't resolve Leaflet's default marker image paths —
// point them at the same CDN Leaflet's own examples use.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type LatLngTuple = [number, number];
type MarkerColor = 'blue' | 'red' | 'green' | 'orange' | 'yellow' | 'violet' | 'grey' | 'black';
type MarkerSize = 'small' | 'medium' | 'large';

export interface MapMarkerDef {
  id?: string | number;
  position: LatLngTuple;
  color?: MarkerColor;
  size?: MarkerSize;
  icon?: L.Icon;
  popup?: { title: string; content: string; image?: string };
}

export interface MapShapeDef {
  id?: string | number;
  style?: L.PathOptions;
  popup?: string;
}

export interface MapPolygonDef extends MapShapeDef {
  positions: LatLngTuple[];
}

export interface MapCircleDef extends MapShapeDef {
  center: LatLngTuple;
  radius: number;
}

export interface MapPolylineDef extends MapShapeDef {
  positions: LatLngTuple[];
}

const MARKER_SIZES: Record<MarkerSize, [number, number]> = {
  small: [20, 32],
  medium: [25, 41],
  large: [30, 50],
};

function createCustomIcon(color: MarkerColor = 'blue', size: MarkerSize = 'medium'): L.Icon {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: MARKER_SIZES[size],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function MapEvents({
  onMapClick,
  onLocationFound,
}: {
  onMapClick?: (latlng: L.LatLng) => void;
  onLocationFound?: (latlng: L.LatLng) => void;
}) {
  const map = useMapEvents({
    click: (e) => onMapClick?.(e.latlng),
    locationfound: (e) => {
      onLocationFound?.(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
}

function CustomControls({
  onLocate,
  onToggleLayer,
}: {
  onLocate: () => void;
  onToggleLayer: (layer: 'satellite') => void;
}) {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: 'topright' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'kw-map-controls');
      div.innerHTML = `
        <div style="background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:4px;">
          <button id="kw-locate-btn" style="padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; background:#FFC107; font-weight:600;">📍 Locate Me</button>
          <button id="kw-satellite-btn" style="padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; background:#f1f5f9; font-weight:600;">🛰️ Satellite</button>
        </div>
      `;
      L.DomEvent.disableClickPropagation(div);

      div.querySelector('#kw-locate-btn')?.addEventListener('click', () => onLocate());
      div.querySelector('#kw-satellite-btn')?.addEventListener('click', () => onToggleLayer('satellite'));

      return div;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, onLocate, onToggleLayer]);

  return null;
}

function SearchControl({ onSearch }: { onSearch?: (result: { latLng: LatLngTuple; name: string }) => void }) {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: 'topleft' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'kw-map-search');
      div.innerHTML = `
        <div style="background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); display: flex; gap: 6px;">
          <input id="kw-search-input" type="text" placeholder="Search places..."
            style="padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; width: 200px; font-size: 12px; outline:none;" />
          <button id="kw-search-btn" style="padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; background: #FFC107; font-weight:600;">🔍</button>
        </div>
      `;
      L.DomEvent.disableClickPropagation(div);

      const input = div.querySelector<HTMLInputElement>('#kw-search-input');
      const button = div.querySelector<HTMLButtonElement>('#kw-search-btn');

      const runSearch = async () => {
        const query = input?.value.trim();
        if (!query) return;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
          );
          const results: { lat: string; lon: string; display_name: string }[] = await response.json();
          if (results.length > 0) {
            const { lat, lon, display_name } = results[0];
            const latLng: LatLngTuple = [parseFloat(lat), parseFloat(lon)];
            map.flyTo(latLng, 13);
            onSearch?.({ latLng, name: display_name });
          }
        } catch (error) {
          console.error('Map search error:', error);
        }
      };

      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runSearch();
      });
      button?.addEventListener('click', runSearch);

      return div;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, onSearch]);

  return null;
}

export interface AdvancedMapProps {
  center?: LatLngTuple;
  zoom?: number;
  markers?: MapMarkerDef[];
  polygons?: MapPolygonDef[];
  circles?: MapCircleDef[];
  polylines?: MapPolylineDef[];
  onMarkerClick?: (marker: MapMarkerDef) => void;
  onMapClick?: (latlng: L.LatLng) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Default center: Muzaffarpur, Bihar — Kitabwalah's home base.
const DEFAULT_CENTER: LatLngTuple = [26.1197, 85.391];

export function AdvancedMap({
  center = DEFAULT_CENTER,
  zoom = 12,
  markers = [],
  polygons = [],
  circles = [],
  polylines = [],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  className = '',
  style = { height: '600px', width: '100%' },
}: AdvancedMapProps) {
  const [satelliteEnabled, setSatelliteEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [searchResult, setSearchResult] = useState<{ latLng: LatLngTuple; name: string } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<L.LatLng | null>(null);

  const handleToggleLayer = useCallback((layer: 'satellite') => {
    if (layer === 'satellite') setSatelliteEnabled((v) => !v);
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
      (error) => console.error('Geolocation error:', error),
    );
  }, []);

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      setClickedLocation(latlng);
      onMapClick?.(latlng);
    },
    [onMapClick],
  );

  const renderedMarkers = markers.map((marker, index) => (
    <Marker
      key={marker.id ?? index}
      position={marker.position}
      icon={marker.icon ?? createCustomIcon(marker.color, marker.size)}
      eventHandlers={{ click: () => onMarkerClick?.(marker) }}
    >
      {marker.popup && (
        <Popup>
          <div>
            <h3 className="font-bold text-sm">{marker.popup.title}</h3>
            <p className="text-xs">{marker.popup.content}</p>
            {marker.popup.image && (
              <img src={marker.popup.image} alt={marker.popup.title} style={{ maxWidth: '200px', height: 'auto' }} />
            )}
          </div>
        </Popup>
      )}
    </Marker>
  ));

  return (
    <div className={`advanced-map ${className}`} style={style}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        {!satelliteEnabled ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <MapEvents onMapClick={handleMapClick} onLocationFound={(l) => setUserLocation([l.lat, l.lng])} />
        {enableSearch && <SearchControl onSearch={setSearchResult} />}
        {enableControls && <CustomControls onLocate={handleLocate} onToggleLayer={handleToggleLayer} />}

        {enableClustering ? (
          <MarkerClusterGroup>{renderedMarkers}</MarkerClusterGroup>
        ) : (
          renderedMarkers
        )}

        {userLocation && (
          <Marker position={userLocation} icon={createCustomIcon('red', 'medium')}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {searchResult && (
          <Marker position={searchResult.latLng} icon={createCustomIcon('green', 'large')}>
            <Popup>{searchResult.name}</Popup>
          </Marker>
        )}

        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]} icon={createCustomIcon('orange', 'small')}>
            <Popup>
              Lat: {clickedLocation.lat.toFixed(6)}
              <br />
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {polygons.map((polygon, index) => (
          <Polygon
            key={polygon.id ?? index}
            positions={polygon.positions}
            pathOptions={polygon.style ?? { color: 'purple', weight: 2, fillOpacity: 0.3 }}
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {circles.map((circle, index) => (
          <Circle
            key={circle.id ?? index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={circle.style ?? { color: 'blue', weight: 2, fillOpacity: 0.2 }}
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {polylines.map((polyline, index) => (
          <Polyline
            key={polyline.id ?? index}
            positions={polyline.positions}
            pathOptions={polyline.style ?? { color: 'red', weight: 3 }}
          >
            {polyline.popup && <Popup>{polyline.popup}</Popup>}
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}
