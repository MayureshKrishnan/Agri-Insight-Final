import React, { useState } from 'react';
import axios from 'axios';
import { Beaker, TrendingUp, Leaf } from 'lucide-react';

export default function Discover() {
  const [inputs, setInputs] = useState({ n: 80, p: 45, k: 40, ph: 6.5 });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Calls Model 2 (Recommend) and Model 3 (Yield) simultaneously
      const [recRes, yieldRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8001/recommend?n=${inputs.n}&p=${inputs.p}&k=${inputs.k}&ph=${inputs.ph}`),
        axios.get(`http://127.0.0.1:8001/predict-yield?n=${inputs.n}&p=${inputs.p}&k=${inputs.k}&ph=${inputs.ph}`)
      ]);
      setData({ ...recRes.data, ...yieldRes.data });
    } catch (e) {
      alert("Backend connection error on Port 8001");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      {/* Input Section */}
      <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-white">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-[#3E442B]">
          <Beaker className="text-[#B2AC88]" /> Soil Sensors
        </h3>
        {['n', 'p', 'k', 'ph'].map((key) => (
          <div key={key} className="mb-6">
            <div className="flex justify-between text-xs font-black uppercase mb-2">
              <span className="text-gray-400">{key}</span>
              <span className="text-[#B2AC88]">{inputs[key as keyof typeof inputs]}</span>
            </div>
            <input 
              type="range" min="0" max={key === 'ph' ? "14" : "150"} step="0.1"
              value={inputs[key as keyof typeof inputs]}
              onChange={(e) => setInputs({...inputs, [key]: parseFloat(e.target.value)})}
              className="w-full accent-[#3E442B] h-1"
            />
          </div>
        ))}
        <button onClick={fetchInsights} disabled={loading} className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black shadow-lg hover:brightness-110">
          {loading ? "Calculating..." : "Get AI Insights"}
        </button>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-6">
        {data ? (
          <>
            <div className="bg-[#B2AC88] p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-2 opacity-80 text-xs font-black uppercase tracking-tighter mb-2">
                <Leaf size={14} /> Recommended Crop
              </div>
              <h2 className="text-5xl font-black italic">{data.recommended_crop}</h2>
              <p className="mt-4 font-bold leading-relaxed">{data.details}</p>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-l-[12px] border-[#3E442B]">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase mb-2">
                <TrendingUp size={14} /> Predictive Analytics
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-[#3E442B]">{data.expected_yield}</p>
                  <p className="text-sm font-bold text-gray-400">Estimated Harvest Potential</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#B2AC88]">{data.efficiency_score}</p>
                  <p className="text-[10px] font-black uppercase text-gray-300">Soil efficiency</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center border-4 border-dashed border-gray-200 rounded-[3rem]">
            <p className="font-bold text-gray-300">Adjust sensors and click "Get AI Insights"</p>
          </div>
        )}
      </div>
    </div>
  );
}