import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UploadCloud, CheckCircle2, User, Terminal, Code2, Save, FileText } from 'lucide-react';

const StudentProfile = () => {
  const { registerStudent, API_BASE_URL } = useApp();

  const [parsing, setParsing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gpa, setGpa] = useState(8.0);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(2026);
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState('');

  // Resume File drag-over handlers
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await parseResumeFile(files[0]);
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await parseResumeFile(files[0]);
    }
  };

  // Upload PDF and hit parsing API
  const parseResumeFile = async (file) => {
    if (!file.name.endsWith('.pdf')) {
      setErrorMsg('Only PDF files are supported for resume parsing.');
      return;
    }

    setParsing(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/parser/resume`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Populate parsed fields dynamically
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.gpa) setGpa(data.gpa);
        if (data.branch) setBranch(data.branch);
        if (data.grad_year) setGradYear(data.grad_year);
        if (data.skills) setSkills(data.skills);
        if (data.github_handle) setGithub(data.github_handle);
        if (data.leetcode_handle) setLeetcode(data.leetcode_handle);
        if (data.resume_text) setResumeText(data.resume_text);

        setSuccessMsg('Resume parsed successfully! Please review and verify the prefilled fields below.');
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to parse resume.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error communicating with resume parser backend. Pre-seeded fallback mode enabled.');
      
      // Local simulated parser fallback for offline developer demo
      simulateLocalParsing(file.name);
    } finally {
      setParsing(false);
    }
  };

  const simulateLocalParsing = (filename) => {
    // Generate some simulated parsed data based on file name characteristics
    const isSpecialist = filename.toLowerCase().includes('data') || filename.toLowerCase().includes('ml');
    setEmail(`${filename.split('.')[0].replace(/\s+/g, '').toLowerCase()}@university.edu`);
    setPhone('+91 95000 12345');
    setGpa(8.7);
    setBranch(isSpecialist ? 'Data Science & AI' : 'Computer Science & Engineering');
    setGradYear(2026);
    setGithub(filename.split('.')[0].toLowerCase().replace(/\s+/g, '-'));
    setLeetcode(filename.split('.')[0].toLowerCase().replace(/\s+/g, '_'));
    setSkills(isSpecialist 
      ? ['Python', 'scikit-learn', 'PyTorch', 'SQL', 'NLP', 'Docker']
      : ['React', 'JavaScript', 'Node.js', 'Firebase', 'CSS', 'Tailwind']
    );
    setResumeText(`Simulated resume text extracted from ${filename}. Candidate possesses strong programming foundation and interest in developer roles.`);
    setSuccessMsg('Simulated parsing: Loaded representative data for demo purposes.');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      name,
      email,
      phone,
      gpa: parseFloat(gpa),
      branch,
      grad_year: parseInt(gradYear),
      skills,
      leetcode_handle: leetcode,
      github_handle: github,
      resume_text: resumeText || `${name} is a student in ${branch}. Technical skillset: ${skills.join(', ')}.`
    };

    try {
      await registerStudent(payload);
      setSuccessMsg('Profile saved successfully! Public platform statistics will sync in the background.');
    } catch (err) {
      setErrorMsg('Failed to save profile details.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* Visual Resume Upload Area */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold font-display tracking-wide mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" /> Resume Analyzer
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Upload your resume in PDF format. The parser will extract credentials, handles, education, and skills.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver 
              ? 'border-indigo-500 bg-indigo-500/5' 
              : 'border-white/10 hover:border-white/20 bg-slate-950/20'
          }`}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
            {parsing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-3" />
            ) : (
              <UploadCloud className="h-12 w-12 text-slate-400 mb-3 hover:text-indigo-400 transition-colors" />
            )}
            <span className="text-sm font-semibold">
              {parsing ? 'Extracting metadata...' : 'Drag & drop resume PDF here, or click to browse'}
            </span>
            <span className="text-xs text-slate-500 mt-1">Supports PDF format (Max 4MB)</span>
          </label>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Main Student Profile details Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <h3 className="text-lg font-bold font-display tracking-wide border-b border-white/10 pb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-400" /> Student Profile Credentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikramaditya Reddy"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. vikram.r@university.edu"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 99887 76655"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* GPA */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">CGPA (10.0 Scale)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 9.15"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-display"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
            />
          </div>

          {/* Branch */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Department / Branch</label>
            <select
              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Data Science & AI">Data Science & AI</option>
            </select>
          </div>

          {/* Grad Year */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Graduation Year</label>
            <select
              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {/* Global Platform Handles */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Code2 className="h-4.5 w-4.5 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-display">Global Coding Platforms</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">GitHub Handle</label>
              <input
                type="text"
                placeholder="e.g. github-username"
                className="bg-slate-900/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">LeetCode Username</label>
              <input
                type="text"
                placeholder="e.g. leetcode_user"
                className="bg-slate-900/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Skills Tag Input */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-300">
            <Terminal className="h-4.5 w-4.5 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-display">Technical Skills Badge Registry</h4>
          </div>

          <div className="flex flex-wrap gap-2 p-3 bg-slate-950/30 border border-white/5 rounded-2xl min-h-[50px]">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-500 italic p-1">No skills registered yet. Parse a resume or add skills manually.</span>
            ) : (
              skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 font-bold text-indigo-400 hover:text-indigo-200 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 max-w-xs">
            <input
              type="text"
              placeholder="Add skill (e.g. Docker)"
              className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button
              onClick={handleAddSkill}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile & Sync Platforms</span>
          </button>
        </div>
      </form>

    </div>
  );
};

export default StudentProfile;
