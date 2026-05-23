# AI Placement Copilot

An intelligent HRTech and placement dashboard designed to automate candidate shortlisting, resume parsing, and fitment scoring for academic institutions and enterprise placement activities.

---

## 🚀 Key Features

*   **Semantic Resume Parser**: Extracts contact details, CGPA, graduation year, profiles, and technical skills from PDF resumes using heuristics, custom regex matrices, and lexicons.
*   **Global Coding Profiles Scraper**: Dynamically syncs candidates' programming statistics directly from public API integrations like GitHub and LeetCode.
*   **Hybrid Fitment Matching Algorithm**: Computes candidate fitment percentages against Job Descriptions (JD) by combining:
    *   **Semantic Similarity (40% weight)**: Vector embedding proximity between full JD text and resume content.
    *   **Academic Eligibility (30% weight)**: Rigid rule verification (GPA cutoffs, target majors, and graduation years).
    *   **Coding Profile Boost (30% weight)**: Profile scoring based on active public repositories, stars, and LeetCode problem counts.
*   **Aesthetic Administrative Dashboard**: Premium dark-mode interface built with glassmorphism, Recharts visualization, and sorting controls for placement officers.
*   **Production Firebase Integration**: Complete out-of-the-box support for Firestore DB, Firebase Auth, and Storage. Includes an automatic fallback to local JSON/LocalStorage database structures if Firebase keys are absent.

---

## 🛠️ Architecture Stack

*   **Frontend**: React (Vite-powered), Tailwind CSS (v4), Lucide Icons, Recharts.
*   **Backend**: FastAPI, Uvicorn, Pydantic (v2), PyMuPDF/pdfplumber, scikit-learn.
*   **Database & Storage**: Firebase Web SDK / Firestore DB (production) or local JSON file storage (development fallback).

```
D:\AI Placement Copilot\
├── backend\
│   ├── data\             # Pre-seeded mock database
│   ├── services\         # Resume parser, NLP engine, matching algorithm
│   ├── config.py         # App configurations & Firebase init
│   ├── main.py           # FastAPI entrypoint
│   └── test_api.py       # Automated testing suite
└── frontend\
    ├── src\
    │   ├── components\   # Dashboard components, JD forms, detail radar charts
    │   ├── context\      # Global state management
    │   ├── index.css     # Glassmorphic layout variables & design tokens
    │   └── firebase.js   # Client SDK connection configurations
```

---

## 💿 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js v18+

---

### Step 1: Backend API Configuration & Execution

1.  Navigate into the `backend/` directory:
    ```powershell
    cd backend
    ```

2.  Initialize a clean Python virtual environment and activate it:
    ```powershell
    python -m venv .venv
    .venv\Scripts\activate
    ```

3.  Install python dependencies:
    ```powershell
    pip install -r requirements.txt
    ```

4.  *(Optional)* If utilizing production Firebase databases, set the credential path:
    ```powershell
    $env:FIREBASE_SERVICE_ACCOUNT="path/to/service-account.json"
    ```
    *(If not set, the backend runs instantly using local memory-backed JSON databases).*

5.  Start the FastAPI server:
    ```powershell
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    ```
    The Swagger UI documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### Step 2: Frontend Client Configuration & Execution

1.  Open a new terminal window, navigate into the `frontend/` directory:
    ```powershell
    cd frontend
    ```

2.  Install dependencies:
    ```powershell
    npm install
    ```

3.  *(Optional)* Configure production environment variables in a `.env` file:
    ```env
    VITE_FIREBASE_API_KEY="your-api-key"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    ```

4.  Launch the client development server:
    ```powershell
    npm run dev
    ```
    Open your browser and navigate to [http://localhost:5173/](http://localhost:5173/).

---

## 🧪 Verification & Testing

Verify that your local parsing models and fitment matching mathematics are running correctly by executing the backend automated test suite:

```powershell
cd "D:\AI Placement Copilot"
backend\.venv\Scripts\python.exe -m unittest backend.test_api
```

Expected output:
```text
....
----------------------------------------------------------------------
Ran 4 tests in 0.064s

OK
```

---

## 📊 Tuning Fitment Algorithm Weights
You can adjust the scoring weights directly on the administrative dashboard using the algorithm tuning sliders:
*   **Skills Match**: Weights Jaccard overlap + NLP semantic similarity between candidates' experience text and JDs.
*   **Academics**: Evaluates CGPA performance.
*   **Coding Profiles**: Scores platform consistency (GitHub commit frequency, repository quality, and LeetCode statistics).
