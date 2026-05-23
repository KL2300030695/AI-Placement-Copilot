import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import JDForm from './JDForm';
import StudentList from './StudentList';
import { Users, FileText, CheckCircle, Database, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

const AdminDashboard = () => {
  const { matchResults, students, backendOnline } = useApp();
  const [activeSection, setActiveSection] = useState('match'); // 'match' | 'jd'

  // Calculate high-level stats
  const totalStudents = students.length;
  const evaluatedCount = matchResults ? matchResults.total_evaluated : 0;
  const eligibleCount = matchResults ? matchResults.total_eligible : 0;
  
  // Calculate average score of eligible students
  let avgScore = 0;
  if (matchResults && matchResults.eligible.length > 0) {
    const totalScore = matchResults.eligible.reduce((acc, curr) => acc + curr.score, 0);
    avgScore = Math.round(totalScore / matchResults.eligible.length);
  }

  return (
    <div className="space-y-6 text-slate-100 relative">
      {/* Glow Blobs */}
      <div className="glow-blob blob-indigo" />
      <div className="glow-blob blob-cyan" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-display bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Placement Administration Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automate resume parsing, academic filtering, and semantic candidate fitment analysis.
          </p>
        </div>
        
        {/* API connection state indicator */}
        <div className="flex items-center space-x-2 bg-slate-900/60 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold self-start">
          <Database className={`h-4 w-4 ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>DB Status:</span>
          {backendOnline ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-glow" /> FastAPI Live
            </span>
          ) : (
            <span className="text-amber-400 font-bold">Local JSON Fallback</span>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 z-10 relative">
        {/* Total Registered */}
        <div className="glass-card p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-display">{totalStudents}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-0.5">Registered Pool</div>
          </div>
        </div>

        {/* Total Evaluated */}
        <div className="glass-card p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-cyan-500/10 rounded-2xl text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-display">{evaluatedCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-0.5">Candidates Matched</div>
          </div>
        </div>

        {/* Eligible Count */}
        <div className="glass-card p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-display">{eligibleCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-0.5">Eligible Shortlist</div>
          </div>
        </div>

        {/* Avg Match Score */}
        <div className="glass-card p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold font-display">{avgScore}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-0.5">Avg Shortlist Score</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-toggles */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 max-w-md mx-auto z-10 relative">
        <button
          onClick={() => setActiveSection('match')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'match' 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Matched Shortlist</span>
        </button>
        <button
          onClick={() => setActiveSection('jd')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'jd' 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Upload & Target JD</span>
        </button>
      </div>

      {/* Main View Render */}
      <div className="z-10 relative">
        {activeSection === 'jd' ? (
          <JDForm />
        ) : (
          <StudentList />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
