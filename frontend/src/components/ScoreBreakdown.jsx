import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Terminal, GraduationCap, Code2, Check, X } from 'lucide-react';

const ScoreBreakdown = ({ result }) => {
  if (!result) return null;

  const { score, eligible, breakdown, metrics, eligibility_details } = result;

  // Format data for Recharts Radar
  const chartData = [
    { subject: 'Skills (Semantic)', value: breakdown.skills, fullMark: 100 },
    { subject: 'Academics (GPA)', value: breakdown.academics, fullMark: 100 },
    { subject: 'Coding Profiles', value: breakdown.coding, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Score</div>
          <div className="text-4xl font-extrabold font-display text-indigo-400 mt-1">{score}%</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</div>
          {eligible ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-3.5 w-3.5 mr-1" /> Eligible
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <X className="h-3.5 w-3.5 mr-1" /> Ineligible
            </span>
          )}
        </div>
      </div>

      {/* Radar Chart + Custom Sliders visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Recharts Radar Visualization */}
        <div className="h-56 w-full flex items-center justify-center bg-slate-950/40 rounded-2xl border border-white/5 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#475569', fontSize: 9 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown bar details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Metrics Breakdown</h4>
          
          {/* Skills bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-slate-300">
                <Terminal className="h-4 w-4 mr-2 text-indigo-400" /> Skills Fit
              </span>
              <span className="font-bold text-indigo-400">{breakdown.skills}%</span>
            </div>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${breakdown.skills}%` }}
              />
            </div>
          </div>

          {/* Academics bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-slate-300">
                <GraduationCap className="h-4 w-4 mr-2 text-cyan-400" /> Academics (GPA)
              </span>
              <span className="font-bold text-cyan-400">{breakdown.academics}%</span>
            </div>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${breakdown.academics}%` }}
              />
            </div>
          </div>

          {/* Coding Profile bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-slate-300">
                <Code2 className="h-4 w-4 mr-2 text-emerald-400" /> Coding Activity
              </span>
              <span className="font-bold text-emerald-400">{breakdown.coding}%</span>
            </div>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${breakdown.coding}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raw platform statistics & cutoff logs */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/40 rounded-2xl border border-white/5 text-xs">
        <div>
          <div className="text-slate-400 font-semibold mb-2 uppercase tracking-wide">Developer Profiles</div>
          <div className="space-y-1.5 text-slate-300">
            <div>LeetCode Solved: <span className="font-bold text-slate-100">{metrics.leetcode_solved}</span></div>
            <div>GitHub Commits (Mo): <span className="font-bold text-slate-100">{metrics.github_commits}</span></div>
            <div>Semantic Relevance: <span className="font-bold text-indigo-400">{metrics.semantic_similarity_percentage}%</span></div>
            <div>Keyword Match: <span className="font-bold text-indigo-400">{metrics.keyword_overlap_percentage}%</span></div>
          </div>
        </div>

        <div>
          <div className="text-slate-400 font-semibold mb-2 uppercase tracking-wide">Hard Filters Status</div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">GPA Cutoff:</span>
              <span className={eligibility_details.gpa_eligible ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {eligibility_details.gpa_eligible ? "Pass" : "Fail"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Branch Match:</span>
              <span className={eligibility_details.branch_eligible ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {eligibility_details.branch_eligible ? "Pass" : "Fail"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Grad Year Match:</span>
              <span className={eligibility_details.year_eligible ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {eligibility_details.year_eligible ? "Pass" : "Fail"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
