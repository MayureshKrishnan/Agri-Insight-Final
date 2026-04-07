import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props { coords: [number, number]; }

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1.5 }); }, [center, map]);
  return null;
}

export default function LocationMap({ coords }: Props) {
  return (
    <div className="h-64 w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white relative z-0">
      <MapContainer center={coords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <MapController center={coords} />
        <Marker position={coords} />
      </MapContainer>
    </div>
  );
}