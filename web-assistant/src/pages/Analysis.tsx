import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Droplets, Thermometer, MapPin, CheckCircle } from 'lucide-react';
import L from 'leaflet';

// Fix for marker icons using CDN
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapMover({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center, 13);
  return null;
}

export default function Analysis() {
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<[number, number]>([19.0760, 72.8777]);
  const [address, setAddress] = useState("Mumbai, Maharashtra, India");
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  const [soil, setSoil] = useState({ n: 45.0, p: 25.0, k: 180.0, ph: 6.5, locationName: "Mumbai" });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();
      
      if (data[0]) {
        const newCoords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        
        // 1. Generate New Data
        const newSoil = {
          n: Number((Math.random() * 20 + 40).toFixed(1)),
          p: Number((Math.random() * 10 + 20).toFixed(1)),
          k: Number((Math.random() * 50 + 150).toFixed(1)),
          ph: Number((5.5 + Math.random() * 2).toFixed(1)),
          locationName: data[0].display_name.split(',')[0] 
        };

        // 2. Update UI
        setPosition(newCoords);
        setAddress(data[0].display_name);
        setSoil(newSoil);

        // 3. --- THE SECRET SAUCE (Fixed Syntax) ---
        localStorage.setItem('currentSoil', JSON.stringify(newSoil));
        
        // 4. Show "Data Synced" animation
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 relative">
      
      {/* Sync Notification Toast */}
      {showSavedToast && (
        <div className="fixed top-10 right-10 bg-[#3E442B] text-white px-6 py-3 rounded-2xl shadow-2xl z-[1000] flex items-center gap-2 animate-bounce">
          <CheckCircle size={18} className="text-green-400" />
          <span className="font-bold text-sm">Soil Data Synced to Advisory</span>
        </div>
      )}

      {/* 1. Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <input 
          type="text"
          className="w-full p-4 pl-12 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-[#3E442B] outline-none text-lg bg-white"
          placeholder="Search location (e.g. Ghatkopar East)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-5 text-gray-400" size={24} />
        <button type="submit" className="absolute right-3 top-3 px-4 py-2 bg-[#3E442B] text-white rounded-xl font-bold hover:scale-105 transition-all">
            Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white z-0 relative">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
              <MapMover center={position} />
            </MapContainer>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-[#3E442B] mb-2">
              <MapPin size={18} /> Location Details
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{address}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#3E442B] px-2 uppercase tracking-tight">Soil Composition</h2>
          <div className="grid grid-cols-1 gap-4">
            <MetricCard label="Nitrogen (N)" value={soil.n} unit="g/kg" color="bg-green-50" />
            <MetricCard label="Phosphorus (P)" value={soil.p} unit="mg/kg" color="bg-blue-50" />
            <MetricCard label="Potassium (K)" value={soil.k} unit="mg/kg" color="bg-purple-50" />
            <MetricCard label="pH Level" value={soil.ph} unit="pH" color="bg-orange-50" />
          </div>
          <div className="mt-6 p-6 bg-[#3E442B] text-white rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Local Insight</p>
            <p className="text-sm italic leading-relaxed font-medium">
              "The current {soil.ph > 7 ? 'alkaline' : 'acidic'} soil profile suggests that {soil.ph > 7 ? 'Cotton or Wheat' : 'Rice or Sugarcane'} would yield the highest efficiency."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: any) {
  return (
    <div className={`${color} p-5 rounded-[2rem] border border-black/5 transition-all hover:-translate-y-1 hover:shadow-md`}>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-[#3E442B]">{value}</span>
        <span className="text-xs font-bold text-gray-400">{unit}</span>
      </div>
    </div>
  );
}