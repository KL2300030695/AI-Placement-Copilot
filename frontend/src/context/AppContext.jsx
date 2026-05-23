import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE_URL = 'http://localhost:8000';

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [currentView, setCurrentView] = useState('admin'); // 'admin' | 'student'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [matchResults, setMatchResults] = useState(null); // { eligible: [], ineligible: [] }
  const [currentJD, setCurrentJD] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend status and fetch students on load
  const checkBackendStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/status`);
      if (res.ok) {
        setBackendOnline(true);
        return true;
      }
    } catch (e) {
      console.warn('Backend is offline. Using simulated frontend actions.');
      setBackendOnline(false);
    }
    return false;
  };

  const fetchStudents = async () => {
    setLoading(true);
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error fetching students:', e);
      }
    }
    
    // Fallback: load initial mock students in frontend memory if backend offline
    const fallbackStudents = [
      {
        id: "std_001",
        name: "Aditya Sharma",
        email: "aditya.sharma@university.edu",
        phone: "+91 98765 43210",
        gpa: 9.4,
        branch: "Computer Science & Engineering",
        grad_year: 2026,
        skills: ["React", "JavaScript", "TypeScript", "Node.js", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Firebase", "Git"],
        leetcode_handle: "adityasharma_dev",
        github_handle: "adityasharma-git",
        leetcode_solved: 345,
        github_repos: 14,
        github_commits_last_month: 42,
        resume_text: "Highly motivated CSE student. Proficient in React, JavaScript, TypeScript, Node.js. Built a placement portal web application using Firebase."
      },
      {
        id: "std_002",
        name: "Priyanka Patel",
        email: "priyanka.patel@university.edu",
        phone: "+91 87654 32109",
        gpa: 8.8,
        branch: "Information Technology",
        grad_year: 2026,
        skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Machine Learning", "scikit-learn"],
        leetcode_handle: "priyanka_code",
        github_handle: "priyanka-patel",
        leetcode_solved: 512,
        github_repos: 22,
        github_commits_last_month: 58,
        resume_text: "Backend developer and ML enthusiast. Specialized in building robust APIs with Python and FastAPI."
      },
      {
        id: "std_003",
        name: "Rohan Das",
        email: "rohan.das@university.edu",
        phone: "+91 76543 21098",
        gpa: 7.5,
        branch: "Electronics & Communication Engineering",
        grad_year: 2026,
        skills: ["Java", "Spring Boot", "MySQL", "C++", "Git"],
        leetcode_handle: "rohan_coder",
        github_handle: "rohan-das-ec",
        leetcode_solved: 120,
        github_repos: 5,
        github_commits_last_month: 12,
        resume_text: "Electronics student transitions to Software Engineering. Well-versed in Object-Oriented Programming (OOP) in Java and Spring Boot."
      }
    ];
    setStudents(fallbackStudents);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Match students against a JD
  const matchCandidates = async (jdPayload) => {
    setLoading(true);
    setCurrentJD(jdPayload);
    const isOnline = await checkBackendStatus();
    
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jdPayload)
        });
        if (res.ok) {
          const results = await res.json();
          setMatchResults(results);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Matching request failed:', e);
      }
    }

    // Frontend fallback matching simulation if backend is offline
    simulateFrontendMatching(jdPayload);
  };

  const simulateFrontendMatching = (jdPayload) => {
    const minGpa = jdPayload.eligibility.min_gpa;
    const targetBranches = jdPayload.eligibility.target_branches.map(b => b.toLowerCase());
    const targetYears = jdPayload.eligibility.target_years;

    const results = students.map(student => {
      // Eligibility
      const gpaEligible = student.gpa >= minGpa;
      const branchEligible = targetBranches.length === 0 || 
        targetBranches.some(tb => student.branch.toLowerCase().includes(tb));
      const yearEligible = targetYears.length === 0 || 
        targetYears.includes(student.grad_year);
      
      const eligible = gpaEligible && branchEligible && yearEligible;

      // Scores
      // Simple word overlap for skills
      const jdSkillsLower = jdPayload.skills.map(s => s.toLowerCase().strip ? s.toLowerCase().strip() : s.toLowerCase());
      const studentSkillsLower = student.skills.map(s => s.toLowerCase());
      const overlap = jdSkillsLower.filter(s => studentSkillsLower.includes(s));
      const skillsScore = jdSkillsLower.length > 0 ? (overlap.length / jdSkillsLower.length) * 100 : 80;

      const academicsScore = minGpa > 0 ? (student.gpa / 10) * 100 : 80;
      const leetcodeScore = Math.min(100, (student.leetcode_solved / 300) * 100);
      const commitsScore = Math.min(100, (student.github_commits_last_month / 30) * 100);
      const codingScore = (leetcodeScore + commitsScore) / 2;

      // Final weighted
      const weights = jdPayload.weights || { skills: 0.4, academics: 0.3, coding: 0.3 };
      const score = Math.round(
        (skillsScore * weights.skills) + 
        (academicsScore * weights.academics) + 
        (codingScore * weights.coding)
      );

      return {
        student_id: student.id,
        student_name: student.name,
        student_branch: student.branch,
        student_gpa: student.gpa,
        student_year: student.grad_year,
        skills: student.skills,
        eligible,
        eligibility_details: {
          gpa_eligible: gpaEligible,
          branch_eligible: branchEligible,
          year_eligible: yearEligible
        },
        score,
        breakdown: {
          skills: Math.round(skillsScore),
          academics: Math.round(academicsScore),
          coding: Math.round(codingScore)
        },
        metrics: {
          keyword_overlap_percentage: Math.round(skillsScore),
          semantic_similarity_percentage: Math.round(skillsScore * 0.9), // simulate similarity
          leetcode_solved: student.leetcode_solved,
          github_commits: student.github_commits_last_month
        }
      };
    });

    const eligibleList = results.filter(r => r.eligible).sort((a, b) => b.score - a.score);
    const ineligibleList = results.filter(r => !r.eligible).sort((a, b) => b.score - a.score);

    setMatchResults({
      eligible: eligibleList,
      ineligible: ineligibleList,
      total_evaluated: results.length,
      total_eligible: eligibleList.length
    });
    setLoading(false);
  };

  // Sync candidate stats from public APIs
  const syncStudentProfile = async (studentId) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students/${studentId}/sync`, { method: 'POST' });
        if (res.ok) {
          // Toast or message. Fetch students again after a small delay
          setTimeout(fetchStudents, 2000);
          return true;
        }
      } catch (e) {
        console.error('Sync profile failed:', e);
      }
    }
    return false;
  };

  // Register student profile
  const registerStudent = async (studentPayload) => {
    setLoading(true);
    const isOnline = await checkBackendStatus();
    
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentPayload)
        });
        if (res.ok) {
          const data = await res.json();
          await fetchStudents();
          setLoading(false);
          return data;
        }
      } catch (e) {
        console.error('Registration failed:', e);
      }
    }

    // Frontend fallback register
    const newStudent = {
      ...studentPayload,
      id: studentPayload.id || `std_${Math.floor(Math.random() * 1000)}`,
      leetcode_solved: studentPayload.leetcode_solved || 120,
      github_repos: studentPayload.github_repos || 8,
      github_commits_last_month: studentPayload.github_commits_last_month || 20
    };

    setStudents(prev => {
      const idx = prev.findIndex(s => s.email === studentPayload.email);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newStudent };
        return updated;
      }
      return [...prev, newStudent];
    });
    setLoading(false);
    return newStudent;
  };

  return (
    <AppContext.Provider value={{
      students,
      currentView,
      setCurrentView,
      selectedStudent,
      setSelectedStudent,
      matchResults,
      setMatchResults,
      currentJD,
      loading,
      backendOnline,
      fetchStudents,
      matchCandidates,
      syncStudentProfile,
      registerStudent,
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
