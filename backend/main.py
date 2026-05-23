import os
import json
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings, db, firebase_initialized
from backend.services.parser import parse_resume_text, extract_text_from_pdf
from backend.services.platforms import fetch_github_metrics, fetch_leetcode_metrics
from backend.services.match_engine import calculate_fitment, JDPayload

logger = logging.getLogger("PlacementCopilot.main")

app = FastAPI(title="AI Placement Copilot API", version="1.0.0")

# CORS middleware config to allow React dev server requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local data cache/database fallback path
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "data", "mock_students.json")

def load_local_students() -> List[Dict[str, Any]]:
    """Loads student data from local JSON database."""
    try:
        if os.path.exists(LOCAL_DB_PATH):
            with open(LOCAL_DB_PATH, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error reading local db: {e}")
    return []

def save_local_students(students: List[Dict[str, Any]]):
    """Saves student data to local JSON database."""
    try:
        os.makedirs(os.path.dirname(LOCAL_DB_PATH), exist_ok=True)
        with open(LOCAL_DB_PATH, "w") as f:
            json.dump(students, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving to local db: {e}")

# Student schema for API payload
class StudentProfileSchema(BaseModel):
    name: str
    email: str
    phone: str
    gpa: float
    branch: str
    grad_year: int
    skills: List[str]
    leetcode_handle: str | None = ""
    github_handle: str | None = ""
    leetcode_solved: int = 0
    github_repos: int = 0
    github_commits_last_month: int = 0
    resume_text: str | None = ""

@app.get("/api/system/status")
def get_system_status():
    """Returns database configuration state."""
    return {
        "status": "online",
        "firebase_active": firebase_initialized,
        "local_db_path": LOCAL_DB_PATH if not firebase_initialized else None
    }

@app.get("/api/students")
async def get_students():
    """Retrieve all students (Firestore or Local JSON)."""
    if firebase_initialized and db:
        try:
            docs = db.collection("students").stream()
            students = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                students.append(data)
            return students
        except Exception as e:
            logger.error(f"Firebase fetch failed: {e}. Falling back to local data.")
    
    return load_local_students()

@app.get("/api/students/{student_id}")
async def get_student(student_id: str):
    """Retrieve a single student profile."""
    if firebase_initialized and db:
        try:
            doc = db.collection("students").document(student_id).get()
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
            raise HTTPException(status_code=404, detail="Student not found in Firestore")
        except Exception as e:
            if not isinstance(e, HTTPException):
                logger.error(f"Firebase single fetch failed: {e}")
            
    students = load_local_students()
    for s in students:
        if s["id"] == student_id:
            return s
    raise HTTPException(status_code=404, detail="Student not found")

@app.post("/api/students")
async def create_student(profile: StudentProfileSchema):
    """Create or update a student profile."""
    student_dict = profile.model_dump()
    
    if firebase_initialized and db:
        try:
            # Check if email already exists
            docs = db.collection("students").where("email", "==", profile.email).limit(1).stream()
            existing_doc = None
            for doc in docs:
                existing_doc = doc
                break
                
            if existing_doc:
                db.collection("students").document(existing_doc.id).update(student_dict)
                student_dict["id"] = existing_doc.id
                return student_dict
            else:
                doc_ref = db.collection("students").document()
                doc_ref.set(student_dict)
                student_dict["id"] = doc_ref.id
                return student_dict
        except Exception as e:
            logger.error(f"Firebase create failed: {e}. Using local fallback.")
            
    # Fallback/Local write
    students = load_local_students()
    existing_idx = -1
    for i, s in enumerate(students):
        if s["email"] == profile.email:
            existing_idx = i
            break
            
    if existing_idx >= 0:
        student_dict["id"] = students[existing_idx]["id"]
        # Retain existing handles / fields if blank in update
        for k, v in student_dict.items():
            if v is not None and v != "":
                students[existing_idx][k] = v
        save_local_students(students)
        return students[existing_idx]
    else:
        new_id = f"std_{len(students) + 1:03d}"
        student_dict["id"] = new_id
        students.append(student_dict)
        save_local_students(students)
        return student_dict

async def sync_platforms_background(student_id: str, github_handle: str, leetcode_handle: str):
    """Background task to fetch developer profile data asynchronously."""
    # Fetch data parallelly
    gh_task = fetch_github_metrics(github_handle)
    lc_task = fetch_leetcode_metrics(leetcode_handle)
    gh_data, lc_data = await asyncio.gather(gh_task, lc_task)
    
    # Update Database
    if firebase_initialized and db:
        try:
            update_payload = {
                **gh_data,
                **lc_data
            }
            db.collection("students").document(student_id).update(update_payload)
            logger.info(f"Sync complete for student {student_id} on Firestore.")
            return
        except Exception as e:
            logger.error(f"Firebase sync update failed: {e}")

    # Local fallback
    students = load_local_students()
    for s in students:
        if s["id"] == student_id:
            s.update(gh_data)
            s.update(lc_data)
            break
    save_local_students(students)
    logger.info(f"Sync complete for student {student_id} locally.")

@app.post("/api/students/{student_id}/sync")
async def sync_student_profile(student_id: str, background_tasks: BackgroundTasks):
    """Trigger an asynchronous refresh of a student's public platform stats."""
    student = None
    if firebase_initialized and db:
        doc = db.collection("students").document(student_id).get()
        if doc.exists:
            student = doc.to_dict()
            student["id"] = doc.id
            
    if not student:
        students = load_local_students()
        for s in students:
            if s["id"] == student_id:
                student = s
                break
                
    if not student:
        raise HTTPException(status_code=404, detail="Student not found for synchronization")
        
    github_handle = student.get("github_handle", "")
    leetcode_handle = student.get("leetcode_handle", "")
    
    background_tasks.add_task(
        sync_platforms_background, 
        student["id"], 
        github_handle, 
        leetcode_handle
    )
    
    return {"message": "Sync job triggered in background", "student_id": student["id"]}

@app.post("/api/parser/resume")
async def upload_resume(file: UploadFile = File(...)):
    """Handles resume PDF upload, extracts text, and parses structured fields."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
        
    # Save file temporarily to disk to parse
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Extract text and parse
        text = extract_text_from_pdf(temp_path)
        parsed_fields = parse_resume_text(text)
        
        # Inject raw text for embedding matching
        parsed_fields["resume_text"] = text
        
        return parsed_fields
    except Exception as e:
        logger.error(f"Error parsing uploaded resume: {e}")
        raise HTTPException(status_code=500, detail=f"Resume parsing error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/match")
async def match_candidates(jd: JDPayload):
    """
    Ranks all students against the provided JD.
    Returns lists of eligible and ineligible candidates sorted by fitment percentage.
    """
    # 1. Fetch candidates
    students = await get_students()
    
    if not students:
        return {"eligible": [], "ineligible": []}
        
    # 2. Run fitment logic
    results = []
    for s in students:
        fit = calculate_fitment(s, jd)
        # Attach candidate information details for table display
        fit["student_branch"] = s.get("branch", "N/A")
        fit["student_gpa"] = s.get("gpa", 0.0)
        fit["student_year"] = s.get("grad_year", 0)
        fit["skills"] = s.get("skills", [])
        results.append(fit)
        
    # 3. Partition by eligibility
    eligible_list = [r for r in results if r["eligible"]]
    ineligible_list = [r for r in results if not r["eligible"]]
    
    # 4. Sort lists by fitment score descending
    eligible_list.sort(key=lambda x: x["score"], reverse=True)
    ineligible_list.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "eligible": eligible_list,
        "ineligible": ineligible_list,
        "total_evaluated": len(results),
        "total_eligible": len(eligible_list)
    }
