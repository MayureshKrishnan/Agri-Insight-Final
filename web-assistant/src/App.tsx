import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Analysis from './pages/Analysis';
import Scanner from './pages/Scanner';
import Advisory from './pages/Advisory';
import { Search, Camera, Lightbulb, Leaf } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F9F2] flex">
        {/* Professional Sidebar */}
        <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl flex flex-col py-8 border-r border-gray-100 z-50">
          {/* Logo Section */}
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="bg-[#3E442B] p-2 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="font-black text-[#3E442B] tracking-tighter text-xl">AGRI-INSIGHT</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 px-4">
            <NavLink to="/" icon={<Search size={20} />} label="Soil Composition" />
            <NavLink to="/scanner" icon={<Camera size={20} />} label="Disease Scanner" />
            <NavLink to="/advisory" icon={<Lightbulb size={20} />} label="Crop Recommendation" />
          </div>

          {/* Bottom Credit - SIESGST Branding */}
          <div className="mt-auto px-8 py-6 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              SIESGST Mumbai
            </p>
          </div>
        </nav>

        {/* Main Content Area - Shifted ml-64 to match new sidebar width */}
        <main className="ml-64 flex-1 p-10">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Analysis />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/advisory" element={<Advisory />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Helper Component for consistent link styling
function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group hover:bg-[#3E442B] hover:text-white text-gray-500"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest">
        {label}
      </span>
    </Link>
  );
}

export default App;