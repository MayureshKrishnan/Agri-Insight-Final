import React, { useState, useEffect } from 'react';
import { Leaf, Zap, AlertTriangle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Advisory() {
  const [soilData, setSoilData] = useState<any>(null);
  const [mlRecs, setMlRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('currentSoil');
    if (saved) {
      const soil = JSON.parse(saved);
      setSoilData(soil);

      // Fetch Real ML Recommendations from your Python API
      fetch(`http://127.0.0.1:8001/recommend?n=${soil.n}&p=${soil.p}&k=${soil.k}&ph=${soil.ph}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setMlRecs(data.recommendations);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(62, 68, 43); // Your brand green
    doc.text("Agri-Insight AI: Analysis Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Location: ${soilData?.locationName || 'Mumbai Suburban'}`, 14, 35);

    // 2. Soil Data Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Soil Composition", 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [['Nutrient', 'Value', 'Unit']],
      body: [
        ['Nitrogen (N)', soilData?.n, 'g/kg'],
        ['Phosphorus (P)', soilData?.p, 'mg/kg'],
        ['Potassium (K)', soilData?.k, 'mg/kg'],
        ['pH Level', soilData?.ph, 'pH'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [62, 68, 43] }
    });

    // 3. ML Recommendations Table
    doc.text("ML Crop Recommendations", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Recommended Crop', 'Confidence Match']],
      body: mlRecs.map(r => [r.name, r.confidence]),
      theme: 'striped',
      headStyles: { fillColor: [178, 172, 136] }
    });

    // 4. Footer
    doc.setFontSize(8);
    doc.text("This report is AI-generated based on Random Forest Classifiers and Geospatial Data.", 14, 285);

    doc.save(`AgriInsight_Report_${soilData?.locationName || 'Farm'}.pdf`);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#3E442B]" size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#3E442B]">Agricultural Advisory</h1>
          <p className="text-gray-500 mt-2">Personalized for {soilData?.locationName || 'Your Farm'}</p>
        </div>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 px-6 py-3 bg-[#3E442B] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
        >
          <Download size={20} /> Export PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Recommendations Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="flex items-center gap-2 font-bold text-[#3E442B] mb-6">
            <Leaf size={20} className="text-green-600" /> ML Top Fits
          </h3>
          <div className="space-y-4">
            {mlRecs.map((crop, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#3E442B]">{crop.name}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg">{crop.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Insights Card */}
        <div className="bg-[#B2AC88]/10 p-8 rounded-[2.5rem] border border-[#B2AC88]/20">
          <h3 className="flex items-center gap-2 font-bold text-[#3E442B] mb-6">
            <Zap size={20} className="text-yellow-600" /> Growth Insights
          </h3>
          <ul className="space-y-4 text-sm font-medium text-[#3E442B]/80">
            <li className="flex gap-2"><CheckCircle2 size={16} /> pH ({soilData?.ph}) is {soilData?.ph > 7 ? 'Alkaline' : 'Acidic'}.</li>
            <li className="flex gap-2"><CheckCircle2 size={16} /> Nitrogen is {soilData?.n > 50 ? 'Optimal' : 'Needs Supplement'}.</li>
          </ul>
        </div>

        {/* Alerts Card */}
        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100">
          <h3 className="flex items-center gap-2 font-bold text-orange-700 mb-6">
            <AlertTriangle size={20} /> Regional Alerts
          </h3>
          <p className="text-xs text-orange-800 opacity-70 italic">Monitoring Mumbai Suburban weather patterns...</p>
        </div>
      </div>
    </div>
  );
}