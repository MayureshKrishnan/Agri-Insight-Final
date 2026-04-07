import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Analysis from './pages/Analysis';
import Scanner from './pages/Scanner';
import Advisory from './pages/Advisory';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F9F2]">
        {/* Simple Navigation Sidebar */}
        <nav className="fixed left-0 top-0 h-full w-20 bg-white shadow-xl flex flex-col items-center py-10 gap-8 border-r border-gray-100">
          <Link to="/" className="p-3 hover:bg-green-50 rounded-xl transition-all">🔍</Link>
          <Link to="/scanner" className="p-3 hover:bg-green-50 rounded-xl transition-all">📸</Link>
          <Link to="/advisory" className="p-3 hover:bg-green-50 rounded-xl transition-all">💡</Link>
        </nav>

        {/* Main Content Area */}
        <main className="ml-20 p-8">
          <Routes>
            <Route path="/" element={<Analysis />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/advisory" element={<Advisory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;