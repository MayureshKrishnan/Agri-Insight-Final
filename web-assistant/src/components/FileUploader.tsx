import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader2, Sprout, FileText } from 'lucide-react';
import axios from 'axios';
// STEP A: THE IMPORT
import DetailedReportModal from './DetailedReportModal'; 

// --- INTERFACE SYNC ---
interface AnalysisResult {
  status: string;
  analysis: string; 
  message?: string;
}

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // STEP B: THE OPEN/CLOSE STATE
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Backend Port 8001
      const response = await axios.post<AnalysisResult>(
        'http://127.0.0.1:8001/analyze', 
        formData,
        { timeout: 50000 } 
      );
      
      if (response.data.status === "success") {
          setResult(response.data);
      } else {
          throw new Error(response.data.message || "Unknown error");
      }
    } catch (error: any) {
      console.error(error);
      alert(`Analysis failed: ${error.message}. Ensure backend is on Port 8001!`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setResult(null);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Drag & Drop Area */}
      <div 
        {...getRootProps()} 
        className={`border-4 border-dashed rounded-[2.5rem] p-10 transition-all flex flex-col items-center justify-center cursor-pointer 
          ${isDragActive ? 'border-[#3E442B] bg-[#B2AC88]/20' : 'border-[#B2AC88] bg-white hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-center animate-in zoom-in duration-300">
            <CheckCircle size={56} className="text-green-600 mx-auto mb-4" />
            <p className="font-black text-[#3E442B] truncate w-48">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud size={56} className="text-[#B2AC88] mx-auto mb-4" />
            <p className="font-black text-[#3E442B] text-lg">Drop Crop Photo</p>
          </div>
        )}
      </div>

      {/* Action Button */}
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

      {/* Result Card */}
      {result && (
        <div className="bg-[#3E442B] p-8 rounded-[2.5rem] shadow-2xl mt-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <h4 className="text-xl font-black text-white uppercase tracking-widest">
              Agronomist Report
            </h4>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-4">
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap font-medium">
              {result.analysis}
            </p>
          </div>
          
          {/* STEP C: THE TRIGGER BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Open Full Forensic Dossier & Export PDF
          </button>

          <button 
            onClick={resetScanner} 
            className="w-full mt-6 text-[#B2AC88] text-[10px] font-black uppercase tracking-widest hover:underline opacity-60"
          >
            Clear and Start New Analysis
          </button>

          {/* THE MODAL COMPONENT */}
          <DetailedReportModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={result} 
          />
        </div>
      )}
    </div>
  );
}