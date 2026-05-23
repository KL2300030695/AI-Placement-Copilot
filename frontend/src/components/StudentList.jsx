import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, UserCheck, Eye, Sparkles, AlertCircle, Award } from 'lucide-react';
import ScoreBreakdown from './ScoreBreakdown';

const StudentList = () => {
  const { students, matchResults, syncStudentProfile, loading } = useApp();
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'ineligible'
  const [selectedResult, setSelectedResult] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  const handleSync = async (e, id) => {
    e.stopPropagation();
    setSyncingId(id);
    await syncStudentProfile(id);
    setSyncingId(null);
  };

  // If matchResults is null, display the general student registry list
  if (!matchResults) {
    return (
      <div className="glass-card p-6 animate-fade-in text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-wide font-display">Registered Candidate Pool</h2>
            <p className="text-sm text-slate-400">Total registered profiles awaiting evaluation: {students.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Academic CGPA</th>
                <th className="py-3 px-4">Grad Year</th>
                <th className="py-3 px-4">LeetCode Solved</th>
                <th className="py-3 px-4">Sync Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr 
                  key={student.id} 
                  className="border-b border-white/5 hover:bg-slate-900/40 transition-colors text-sm"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    <div>{student.name}</div>
                    <div className="text-xs text-slate-500 font-normal">{student.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{student.branch}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-display font-semibold">{student.gpa} / 10.0</td>
                  <td className="py-3.5 px-4 text-slate-400">{student.grad_year}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {student.leetcode_solved || 0} Solved
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={(e) => handleSync(e, student.id)}
                      disabled={syncingId === student.id}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
                      title="Sync Public Profiles"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncingId === student.id ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const { eligible, ineligible, total_evaluated, total_eligible } = matchResults;
  const currentList = activeTab === 'eligible' ? eligible : ineligible;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Candidates List Column */}
      <div className="lg:col-span-2 glass-card p-6 text-slate-100 flex flex-col h-[600px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-wide font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" /> Evaluation Rankings
            </h2>
            <p className="text-sm text-slate-400">
              Evaluated {total_evaluated} profiles • {total_eligible} eligible
            </p>
          </div>
          
          {/* Tab controllers */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 self-start">
            <button
              onClick={() => setActiveTab('eligible')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'eligible' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eligible ({eligible.length})
            </button>
            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ineligible' 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ineligible ({ineligible.length})
            </button>
          </div>
        </div>

        {/* Candidates Table container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <AlertCircle className="h-10 w-10 text-slate-600" />
              <p className="text-sm font-medium">No candidates fit this category.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Branch & GPA</th>
                  <th className="py-2.5 px-3 text-right">Match</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((result, idx) => (
                  <tr 
                    key={result.student_id} 
                    onClick={() => setSelectedResult(result)}
                    className={`border-b border-white/5 hover:bg-slate-900/40 transition-colors text-sm cursor-pointer ${
                      selectedResult?.student_id === result.student_id ? 'bg-indigo-500/5 border-indigo-500/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-400 font-display">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{result.student_name}</div>
                      <div className="text-xs text-slate-500">{result.student_year} Passout</div>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <div className="text-slate-300 font-semibold">{result.student_branch}</div>
                      <div className="text-slate-400 mt-0.5">GPA: {result.student_gpa} / 10.0</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold font-display ${
                        result.score >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : result.score >= 60 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          title="View Breakdown"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleSync(e, result.student_id)}
                          disabled={syncingId === result.student_id}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
                          title="Refresh Stats"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${syncingId === result.student_id ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Candidate Detailed Breakdown Panel */}
      <div className="glass-card p-6 text-slate-100 h-[600px] flex flex-col">
        {selectedResult ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-white/10 pb-4 mb-4 flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold font-display text-slate-200 truncate">{selectedResult.student_name}</h3>
                <p className="text-xs text-slate-400 truncate">{selectedResult.student_branch}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              <ScoreBreakdown result={selectedResult} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-3 px-4">
            <Award className="h-12 w-12 text-slate-700 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-slate-400">Select a Candidate</p>
              <p className="text-xs text-slate-600 mt-1">
                Click on any candidate in the list to inspect their fitment breakdown and detailed skill matches.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
