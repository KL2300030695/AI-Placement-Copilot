import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AdminDashboard from './components/AdminDashboard';
import StudentProfile from './components/StudentProfile';
import { LayoutDashboard, UserCircle, GraduationCap } from 'lucide-react';

const AppContent = () => {
  const { currentView, setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Professional Header Navigation */}
      <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('admin')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl text-white shadow-lg shadow-indigo-600/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold font-display text-lg tracking-wider text-slate-100 uppercase">
                AI Placement <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Copilot</span>
              </span>
              <span className="text-[10px] block font-semibold text-indigo-400 tracking-widest uppercase">Academic Agent</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => setCurrentView('student')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'student'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCircle className="h-4 w-4" />
              <span>Student Registry</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 z-10 relative">
        {currentView === 'admin' ? (
          <AdminDashboard />
        ) : (
          <StudentProfile />
        )}
      </main>

      {/* Modern minimal footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 AI Placement Copilot. Build with Python FastAPI & React.</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Documentation</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition-colors">API Reference</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
