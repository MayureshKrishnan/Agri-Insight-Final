import FileUploader from '../components/FileUploader';
import { ShieldCheck, Zap, Thermometer } from 'lucide-react';

export default function Scanner() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Section */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl font-black text-[#3E442B] mb-2 uppercase tracking-tight">
          Disease Scanner
        </h1>
        <p className="text-gray-500 font-medium">
          Upload a high-resolution photo of your crop for real-time AI diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: The Actual Tool */}
        <div className="lg:col-span-2">
          <FileUploader />
        </div>

        {/* Right Side: Pro-Tips / Instructions */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-[#3E442B] uppercase tracking-[0.2em] opacity-50">
            Scanning Guide
          </h2>
          
          <div className="space-y-4">
            <GuideStep 
              icon={<Zap size={18} className="text-yellow-600" />}
              title="Bright Lighting"
              desc="Ensure the leaf is well-lit for accurate vein analysis."
            />
            <GuideStep 
              icon={<ShieldCheck size={18} className="text-green-600" />}
              title="Steady Focus"
              desc="Avoid blurry images to help the AI detect fungal spores."
            />
            <GuideStep 
              icon={<Thermometer size={18} className="text-blue-600" />}
              title="Environmental Context"
              desc="Our engine factors in local humidity for the report."
            />
          </div>

          <div className="p-6 bg-[#B2AC88]/10 rounded-[2rem] border border-[#B2AC88]/20">
            <p className="text-[10px] font-bold text-[#3E442B] opacity-60 uppercase mb-2">Note</p>
            <p className="text-xs text-[#3E442B] leading-relaxed italic">
              "This AI model is trained on over 50,000 images of tropical crop diseases common in Maharashtra."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="text-sm font-black text-[#3E442B]">{title}</h4>
        <p className="text-xs text-gray-500 leading-tight mt-1">{desc}</p>
      </div>
    </div>
  );
}