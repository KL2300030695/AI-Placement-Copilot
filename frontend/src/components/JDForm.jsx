import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Cpu, GraduationCap, Award, Sliders, Play } from 'lucide-react';

const JDForm = () => {
  const { matchCandidates, loading } = useApp();
  
  const [jdText, setJdText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [minGpa, setMinGpa] = useState(7.0);
  const [targetBranches, setTargetBranches] = useState('Computer Science & Engineering, Information Technology');
  const [targetYear, setTargetYear] = useState(2026);
  
  // Weights (normalized to sum to 100)
  const [weights, setWeights] = useState({
    skills: 40,
    academics: 30,
    coding: 30
  });

  const handleWeightChange = (key, val) => {
    const value = parseInt(val) || 0;
    setWeights(prev => {
      const next = { ...prev, [key]: value };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse skills list (split by comma or newline)
    const skillsList = skillsText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    // Parse branches list
    const branchList = targetBranches
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    // Normalize weights to sum to 1.0
    const totalWeights = weights.skills + weights.academics + weights.coding;
    const normalizedWeights = {
      skills: Number((weights.skills / totalWeights).toFixed(2)),
      academics: Number((weights.academics / totalWeights).toFixed(2)),
      coding: Number((weights.coding / totalWeights).toFixed(2))
    };

    const payload = {
      text: jdText,
      skills: skillsList,
      eligibility: {
        min_gpa: parseFloat(minGpa),
        target_branches: branchList,
        target_years: [parseInt(targetYear)]
      },
      weights: normalizedWeights
    };

    matchCandidates(payload);
  };

  return (
    <div className="glass-card p-6 animate-fade-in text-slate-100 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wide font-display">Evaluate Job Profile Fitment</h2>
          <p className="text-sm text-slate-400">Specify requirements and tune alignment parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Description Text */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-slate-300">Job Description Text</label>
          <textarea
            required
            rows={5}
            placeholder="Paste the full job description here. The NLP embedding engine will perform semantic analysis on this text..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>

        {/* Required Skills & Target Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Required Skills <span className="text-slate-500 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React, Python, FastAPI, Docker, SQL"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Target Branches <span className="text-slate-500 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science, Information Technology"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              value={targetBranches}
              onChange={(e) => setTargetBranches(e.target.value)}
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-400 block mb-1">MINIMUM CGPA (Cutoff)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  className="w-full accent-cyan-400 cursor-pointer"
                  value={minGpa}
                  onChange={(e) => setMinGpa(e.target.value)}
                />
                <span className="text-lg font-bold font-display text-cyan-400 min-w-10">{minGpa}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-400 block mb-1">TARGET GRADUATION YEAR</label>
              <select
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              >
                <option value={2025}>2025 (Final Year)</option>
                <option value={2026}>2026 (Pre-Final Year)</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
        </div>

        {/* Algorithm Tuning Weights */}
        <div className="p-5 bg-slate-950/40 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider font-display">Fitment Algorithm Weight Tuning</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skills weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>SKILLS MATCH</span>
                <span className="font-bold text-indigo-400">{weights.skills}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full accent-indigo-400 cursor-pointer"
                value={weights.skills}
                onChange={(e) => handleWeightChange('skills', e.target.value)}
              />
            </div>

            {/* Academics weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>ACADEMICS</span>
                <span className="font-bold text-cyan-400">{weights.academics}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full accent-cyan-400 cursor-pointer"
                value={weights.academics}
                onChange={(e) => handleWeightChange('academics', e.target.value)}
              />
            </div>

            {/* Coding profile weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>CODING PROFILES</span>
                <span className="font-bold text-emerald-400">{weights.coding}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full accent-emerald-400 cursor-pointer"
                value={weights.coding}
                onChange={(e) => handleWeightChange('coding', e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            Note: Weights will be automatically normalized. Current raw total: {weights.skills + weights.academics + weights.coding}%
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Execute Candidate Match</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JDForm;
