import re
import pdfplumber
from typing import Dict, Any, List

# Common skills lexicon to extract from resumes
SKILLS_LEXICON = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C\\+\\+", "C#", "Ruby", "Golang", "Rust", "PHP", "Kotlin", "Swift",
    # Frontend
    "React", "Angular", "Vue", "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Bootstrap", "Redux", "Webpack", "Sass",
    # Backend
    "Node\\.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET", "GraphQL", "REST APIs",
    # Databases
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Cassandra", "Firestore", "Oracle",
    # DevOps & Cloud
    "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure", "Git", "GitHub", "CI/CD", "Jenkins", "Terraform",
    # AI/ML & Data
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "scikit-learn", 
    "Pandas", "NumPy", "Spark", "Hadoop", "Tableau", "PowerBI"
]

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts all text content from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
    return text

def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Parses resume text using regex and heuristics to extract:
    contact details, education, GPA, graduation year, profiles, and skills.
    """
    # 1. Clean text for regex matching
    cleaned_text = re.sub(r'\s+', ' ', text)
    
    # 2. Extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else ""
    
    # 3. Extract phone (supports +91-XXXXX-XXXXX, 9876543210 etc)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}', text)
    phone = phone_match.group(0).strip() if phone_match else ""
    
    # 4. Extract URLs/Handles (GitHub, LeetCode)
    github_match = re.search(r'github\.com/([\w\.-]+)', text, re.IGNORECASE)
    github_handle = github_match.group(1) if github_match else ""
    
    leetcode_match = re.search(r'leetcode\.com/([\w\.-]+)', text, re.IGNORECASE)
    leetcode_handle = leetcode_match.group(1) if leetcode_match else ""

    # 5. Extract CGPA/GPA
    # Look for patterns like: GPA: 9.1, CGPA: 9.32, 9.4/10, 8.5 CGPA, 3.8/4.0
    gpa = 0.0
    gpa_patterns = [
        r'(?:c?gpa|g\.?p\.?a\.?)\s*(?:of|is|:)?\s*([0-9]\.[0-9]{1,2})',
        r'([0-9]\.[0-9]{1,2})\s*(?:/10)?\s*(?:c?gpa|g\.?p\.?a\.?)',
        r'(?:c?gpa|g\.?p\.?a\.?)\s*(?:of|is|:)?\s*([0-9]{2}(?:\.[0-9]{1,2})?)\s*%', # Percentage case: e.g. 85%
    ]
    for pattern in gpa_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            # Convert percentage or scale out of 100 to 10 scale if needed
            if val > 10.0:
                gpa = round(val / 10.0, 2)
            else:
                gpa = val
            break
    
    # Fallback search if no GPA keyword matches, search for generic 10-scale decimal like "9.2/10"
    if gpa == 0.0:
        fallback_match = re.search(r'([6-9]\.[0-9]{1,2})\s*/\s*10', text)
        if fallback_match:
            gpa = float(fallback_match.group(1))
            
    # 6. Extract Graduation Year
    # Look for standard years around current (2020-2029)
    grad_year = 2026 # Default fallback
    year_match = re.search(r'\b(202[3-9])\b', text)
    if year_match:
        grad_year = int(year_match.group(1))

    # 7. Extract major/branch
    branch = "Computer Science & Engineering" # Default fallback
    branch_keywords = {
        "Computer Science": "Computer Science & Engineering",
        "Information Technology": "Information Technology",
        "Electronics": "Electronics & Communication Engineering",
        "Electrical": "Electrical Engineering",
        "Mechanical": "Mechanical Engineering",
        "Civil": "Civil Engineering",
        "Chemical": "Chemical Engineering",
        "Data Science": "Data Science & AI"
    }
    for kw, full_name in branch_keywords.items():
        if re.search(kw, text, re.IGNORECASE):
            branch = full_name
            break

    # 8. Extract Skills using Lexicon
    skills = []
    for skill_pattern in SKILLS_LEXICON:
        # Match with boundary tokens, e.g. \bReact\b
        # Cleaned escape characters from list name
        clean_skill_name = skill_pattern.replace("\\", "")
        # Adjust for special characters like C++ or Node.js
        if "++" in skill_pattern or "." in skill_pattern:
            match = re.search(skill_pattern, text, re.IGNORECASE)
        else:
            match = re.search(r'\b' + skill_pattern + r'\b', text, re.IGNORECASE)
            
        if match:
            skills.append(clean_skill_name)

    return {
        "email": email,
        "phone": phone,
        "gpa": gpa if gpa > 0.0 else 8.0, # Default if not found
        "branch": branch,
        "grad_year": grad_year,
        "skills": list(set(skills)),
        "github_handle": github_handle,
        "leetcode_handle": leetcode_handle
    }
