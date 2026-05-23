from typing import Dict, Any, List
from pydantic import BaseModel
from backend.services.nlp_engine import nlp_engine

class JDEligibility(BaseModel):
    min_gpa: float = 6.0
    target_branches: List[str] = []
    target_years: List[int] = []

class JDPayload(BaseModel):
    text: str
    skills: List[str]
    eligibility: JDEligibility
    weights: Dict[str, float] = {
        "skills": 0.4,
        "academics": 0.3,
        "coding": 0.3
    }

def calculate_fitment(student: Dict[str, Any], jd: JDPayload) -> Dict[str, Any]:
    """
    Computes fitment score and detailed breakdown for a student profile against a Job Description.
    """
    weights = jd.weights or {"skills": 0.4, "academics": 0.3, "coding": 0.3}
    
    # 1. Eligibility Check (Hard Filters)
    gpa_threshold = jd.eligibility.min_gpa
    gpa_eligible = student.get("gpa", 0.0) >= gpa_threshold
    
    branch_eligible = True
    if jd.eligibility.target_branches:
        # Match case-insensitive or substring
        student_branch = student.get("branch", "").lower()
        branch_eligible = any(b.lower() in student_branch for b in jd.eligibility.target_branches)
        
    year_eligible = True
    if jd.eligibility.target_years:
        year_eligible = student.get("grad_year") in jd.eligibility.target_years
        
    is_eligible = gpa_eligible and branch_eligible and year_eligible
    
    # 2. Academic Score (Max 100)
    # Scaled from 50 to 100 based on GPA.
    gpa_val = student.get("gpa", 0.0)
    academic_score = 50.0 + (gpa_val / 10.0) * 50.0
    academic_score = min(100.0, max(0.0, academic_score))
    
    # If not gpa_eligible, penalize academic score
    if not gpa_eligible:
        academic_score *= 0.6 # 40% penalty for failing cutoffs
        
    # 3. Skills Score (Max 100)
    # Sub-metric A: Keyword matching (Exact Match)
    jd_skills = [s.lower().strip() for s in jd.skills]
    student_skills = [s.lower().strip() for s in student.get("skills", [])]
    
    if jd_skills:
        overlap = set(jd_skills).intersection(set(student_skills))
        keyword_score = (len(overlap) / len(jd_skills)) * 100.0
    else:
        keyword_score = 100.0 # No skills specified in JD
        
    # Sub-metric B: Semantic matching (Embeddings between Resume text and JD text)
    resume_text = student.get("resume_text", "")
    jd_text = jd.text
    semantic_score = nlp_engine.calculate_similarity(resume_text, jd_text) * 100.0
    
    # Combine skills score: 60% Semantic, 40% Exact overlap
    skills_score = (semantic_score * 0.6) + (keyword_score * 0.4)
    skills_score = min(100.0, max(0.0, skills_score))
    
    # 4. Coding Profile Score (Max 100)
    leetcode_solved = student.get("leetcode_solved", 0)
    github_commits = student.get("github_commits_last_month", 0)
    github_repos = student.get("github_repos", 0)
    
    # Normalizing parameters:
    # LeetCode: 300 solved is excellent
    leetcode_score = min(100.0, (leetcode_solved / 300.0) * 100)
    
    # GitHub: 30 commits / month and 8 repos is highly active
    commit_score = min(100.0, (github_commits / 30.0) * 100)
    repo_score = min(100.0, (github_repos / 8.0) * 100)
    github_score = (commit_score * 0.6) + (repo_score * 0.4)
    
    coding_score = (leetcode_score * 0.5) + (github_score * 0.5)
    coding_score = min(100.0, max(0.0, coding_score))
    
    # 5. Weighted Final Score
    w_skills = weights.get("skills", 0.4)
    w_acad = weights.get("academics", 0.3)
    w_coding = weights.get("coding", 0.3)
    
    final_score = (skills_score * w_skills) + (academic_score * w_acad) + (coding_score * w_coding)
    final_score = round(min(100.0, max(0.0, final_score)), 1)
    
    return {
        "student_id": student.get("id"),
        "student_name": student.get("name"),
        "eligible": is_eligible,
        "eligibility_details": {
            "gpa_eligible": gpa_eligible,
            "branch_eligible": branch_eligible,
            "year_eligible": year_eligible
        },
        "score": final_score,
        "breakdown": {
            "skills": round(skills_score, 1),
            "academics": round(academic_score, 1),
            "coding": round(coding_score, 1)
        },
        "metrics": {
            "keyword_overlap_percentage": round(keyword_score, 1),
            "semantic_similarity_percentage": round(semantic_score, 1),
            "leetcode_solved": leetcode_solved,
            "github_commits": github_commits
        }
    }
