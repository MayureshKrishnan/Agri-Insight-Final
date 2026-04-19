import React from 'react';
import { FileText, X, Download, ShieldAlert, Thermometer, Droplets, Leaf } from 'lucide-react';

export default function DetailedReportModal({ isOpen, onClose, data }: any) {
  if (!isOpen) return null;

  const handleExportPDF = () => {
    window.print(); 
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col print:static print:block">
      {/* 1. ADVANCED PRINT RESET: This kills the empty pages and repetitive headers */}
      <style>
        {`
          @media print {
            /* 1. Hide everything except the report container */
            body * { visibility: hidden !important; }
            #printable-report, #printable-report * { visibility: visible !important; }
            
            /* 2. Reset the report to be a standard document, not a modal */
            #printable-report { 
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              display: block !important;
            }

            /* 3. Kill the dashboard header in the PDF */
            .print\\:hidden { display: none !important; }

            /* 4. Fix page margins for Indian A4 standard */
            @page { size: A4; margin: 20mm; }
          }
        `}
      </style>

      {/* DASHBOARD HEADER - print:hidden is critical here to avoid empty space */}
      <div className="sticky top-0 z-[100] p-6 border-b flex justify-between items-center bg-[#3E442B] text-white print:hidden">
        <div className="flex items-center gap-3">
          <FileText size={24} />
          <h2 className="text-xl font-black uppercase">Forensic Dossier</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportPDF} className="bg-white text-[#3E442B] px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <Download size={18} /> EXPORT PDF
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* THE REPORT CONTENT - Added 'print:p-0' to remove empty padding in PDF */}
      <div id="printable-report" className="flex-1 overflow-y-auto p-10 pt-20 lg:p-20 font-serif text-gray-800 print:p-0 print:overflow-visible">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Section 1: Branding Header */}
          <header className="border-b-8 border-[#3E442B] pb-10 text-center">
            <h1 className="text-6xl font-black text-[#3E442B] mb-4 uppercase">Forensic Analysis [cite: 1]</h1>
            <p className="text-xs font-bold text-gray-400 tracking-[0.4em]">NATIONAL INFERENCE ENGINE V2.1 [cite: 2]</p>
          </header>

          {/* Section 2: Identification Grid */}
          <section className="bg-gray-50 p-10 rounded-[3rem] border-2 border-gray-100 flex flex-col md:flex-row justify-between items-center print:border-none print:bg-white">
            <div className="text-center md:text-left">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Identification [cite: 3]</h3>
              <p className="text-4xl font-black text-[#3E442B] uppercase">Viral Mosaic Infection [cite: 4]</p>
              <span className="mt-4 inline-block bg-red-600 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase">High Severity [cite: 5]</span>
            </div>
            <div className="mt-8 md:mt-0 space-y-2 text-sm font-bold opacity-60 text-right">
              <p>TS: 19/4/2026 [cite: 6]</p>
              <p>REGION: India (All Zones) [cite: 7]</p>
              <p>CONFIDENCE: 94.2% [cite: 8]</p>
            </div>
          </section>

          {/* Section 3: Pathology */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#3E442B] border-b-2 border-gray-100 pb-2 uppercase">1. Pathological Overview [cite: 9]</h2>
            <p className="text-xl leading-relaxed text-justify">
              The specimen exhibits systemic disruption of chlorophyll, causing <strong>mottling</strong> and foliar discoloration characteristic of viral mosaic strains[cite: 10]. 
              Across Indian agro-climatic zones, high humidity levels (&gt;75%) accelerate viral load by facilitating rapid vector movement [cite: 11], leading to irreversible necrosis if unmanaged[cite: 12].
            </p>
          </div>

          {/* Section 4: Strategy */}
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-[#3E442B] border-b-2 border-gray-100 pb-2 uppercase">2. Mitigation Strategy [cite: 13]</h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="p-10 bg-white border-4 border-[#3E442B] rounded-[3rem] print:border-2">
                <h3 className="font-black text-2xl mb-6 flex items-center gap-3 uppercase"><Leaf className="text-green-600"/> Organic Protocol [cite: 14, 15]</h3>
                <ul className="list-disc pl-8 space-y-4 text-lg font-bold">
                  <li>ROGUING: UPROOT AND INCINERATE BIOMASS IMMEDIATELY[cite: 16, 17].</li>
                  <li>VECTOR CONTROL: APPLY NEEM OIL (AZADIRACHTIN) SPRAYS WEEKLY[cite: 18, 19, 20, 21].</li>
                  <li>SANITATION: DISINFECT ALL FIELD TOOLS TO PREVENT CROSS-CONTAMINATION[cite: 22, 23, 24, 25].</li>
                </ul>
              </div>

              <div className="p-10 bg-red-50 border-4 border-red-200 rounded-[3rem] print:bg-white print:border-2">
                <h3 className="font-black text-2xl mb-6 flex items-center gap-3 uppercase"><Droplets className="text-red-600"/> Chemical Defense [cite: 26, 27]</h3>
                <p className="text-red-700 font-black mb-6 uppercase text-sm italic">Note: No direct viricide exists: Focus strictly on vector eradication[cite: 28, 29].</p>
                <ul className="list-disc pl-8 space-y-4 text-lg font-bold italic">
                  <li>APPLY SYSTEMIC INSECTICIDES LIKE IMIDACLOPRID 17.8% SL[cite: 30, 31, 32].</li>
                  <li>ALTERNATE CHEMICAL GROUPS TO PREVENT PEST RESISTANCE[cite: 33, 34, 35].</li>
                </ul>
              </div>
            </div>
          </div>

          <footer className="bg-[#3E442B] p-16 rounded-[4rem] text-white text-center shadow-2xl print:bg-gray-100 print:text-black">
            <h2 className="text-4xl font-black mb-6 uppercase">Agronomic Conclusion [cite: 36]</h2>
            <p className="text-xl leading-relaxed opacity-90 italic">
              "The crop is currently in a critical recovery phase. Strict adherence to vector management across the entire field is the <strong>ONLY</strong> pathway to preserving yield integrity for Indian farmers." [cite: 37]
            </p>
            <div className="mt-12 pt-12 border-t border-white/20 text-[10px] font-black tracking-[0.8em] opacity-40 uppercase">
              SIESGST MUMBAI | AGRI-INSIGHT AI ENGINE 2026 [cite: 38, 39, 40, 41]
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}