import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader2, Sprout, RefreshCcw } from 'lucide-react';
import axios from 'axios';

interface AnalysisResult {
  status: string;
  detection: string;
  confidence: string;
  expert_guidance: string;
  message?: string; // The '?' means it's optional
}

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  const handleAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null); // Clear previous result immediately

    const formData = new FormData();
    formData.append('file', file);
    formData.append('location', 'Mumbai, India');
    formData.append('weather', '28°C, Humidity 60%');

    try {
      // Corrected Port to 8002 to match backend
      const response = await axios.post<AnalysisResult>(
        'http://127.0.0.1:8001/analyze', 
        formData,
        { timeout: 45000 } // Slightly longer timeout for complex AI vision tasks
      );
      
      if (response.data.status === "error") {
          throw new Error(response.data.message);
      }
      
      setResult(response.data);
    } catch (error: any) {
      console.error(error);
      alert(`Analysis failed: ${error.message}. Ensure the Python API is running on Port 8001!`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Drag & Drop Area */}
      <div 
        {...getRootProps()} 
        className={`border-4 border-dashed rounded-[2.5rem] p-10 transition-all flex flex-col items-center justify-center cursor-pointer 
          ${isDragActive ? 'border-[#3E442B] bg-[#B2AC88]/20 scale-95' : 'border-[#B2AC88] bg-white hover:bg-[#f7f9f2]'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-center animate-in zoom-in duration-300">
            <CheckCircle size={56} className="text-green-600 mx-auto mb-4" />
            <p className="font-black text-[#3E442B] truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-2">Tap to change image</p>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud size={56} className="text-[#B2AC88] mx-auto mb-4" />
            <p className="font-black text-[#3E442B] text-lg">Drop Crop Photo</p>
            <p className="text-sm text-gray-400 font-bold tracking-tight">JPEG, PNG or WEBP</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        {file && !result && (
          <button 
            onClick={handleAnalysis} 
            disabled={loading} 
            className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sprout size={20} />}
            {loading ? "Consulting AI..." : "Analyze Health"}
          </button>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#3E442B] p-8 rounded-[2.5rem] shadow-2xl mt-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <h4 className="text-xl font-black text-white uppercase tracking-widest">
                Agronomist Report
              </h4>
            </div>
            <span className="bg-[#B2AC88] text-[#3E442B] text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {result.confidence} Match
            </span>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap font-medium">
              {result.expert_guidance}
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
             <button 
               onClick={resetScanner} 
               className="text-[#B2AC88] text-[10px] font-black uppercase tracking-widest hover:underline"
             >
               Clear and Start New Analysis
             </button>
          </div>
        </div>
      )}
    </div>
  );
}