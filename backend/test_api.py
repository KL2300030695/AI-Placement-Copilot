import unittest
from backend.services.parser import parse_resume_text
from backend.services.match_engine import calculate_fitment, JDPayload

class TestPlacementCopilot(unittest.TestCase):
    
    def test_resume_parser_gpa(self):
        """Test GPA regex extraction from text."""
        texts = [
            "CGPA of 9.25 in Computer Science.",
            "Graduated with a 8.5 CGPA in 2026",
            "Academics: GPA: 9.1 / 10.0, branch IT",
            "Scored 85% in engineering tests"
        ]
        
        parsed = [parse_resume_text(t) for t in texts]
        
        self.assertEqual(parsed[0]["gpa"], 9.25)
        self.assertEqual(parsed[1]["gpa"], 8.5)
        self.assertEqual(parsed[2]["gpa"], 9.1)
        self.assertEqual(parsed[3]["gpa"], 8.5) # 85% / 10 = 8.5

    def test_resume_parser_handles(self):
        """Test GitHub and LeetCode link extraction."""
        text = "Check my projects at github.com/test-user and algorithm solves at leetcode.com/lc_tester"
        parsed = parse_resume_text(text)
        
        self.assertEqual(parsed["github_handle"], "test-user")
        self.assertEqual(parsed["leetcode_handle"], "lc_tester")

    def test_resume_parser_skills(self):
        """Test lexicon-based skill extraction."""
        text = "Experience with Python, FastAPI, Docker, and React. Built a PostgreSQL database."
        parsed = parse_resume_text(text)
        
        # Verify skills are extracted
        extracted = parsed["skills"]
        self.assertIn("Python", extracted)
        self.assertIn("FastAPI", extracted)
        self.assertIn("Docker", extracted)
        self.assertIn("React", extracted)
        self.assertIn("PostgreSQL", extracted)

    def test_fitment_algorithm(self):
        """Test fitment matcher score calculation and rules."""
        student = {
            "id": "std_test",
            "name": "Test Candidate",
            "gpa": 9.2,
            "branch": "Computer Science & Engineering",
            "grad_year": 2026,
            "skills": ["Python", "FastAPI", "React", "Docker"],
            "leetcode_solved": 150,
            "github_commits_last_month": 25,
            "github_repos": 6,
            "resume_text": "Experienced software developer in Python, FastAPI, and React."
        }
        
        # Perfect JD match
        jd = JDPayload(
            text="Looking for a Python backend developer skilled in FastAPI and React.",
            skills=["Python", "FastAPI"],
            eligibility={
                "min_gpa": 8.0,
                "target_branches": ["Computer Science & Engineering"],
                "target_years": [2026]
            },
            weights={
                "skills": 0.4,
                "academics": 0.3,
                "coding": 0.3
            }
        )
        
        fitment = calculate_fitment(student, jd)
        
        # Check eligibility and score components
        self.assertTrue(fitment["eligible"])
        self.assertTrue(fitment["eligibility_details"]["gpa_eligible"])
        self.assertTrue(fitment["eligibility_details"]["branch_eligible"])
        self.assertTrue(fitment["eligibility_details"]["year_eligible"])
        self.assertGreater(fitment["score"], 70.0) # should score high
        
        # Test GPA failure
        jd_high_gpa = JDPayload(
            text="High requirements",
            skills=["Python"],
            eligibility={
                "min_gpa": 9.5, # student is 9.2
                "target_branches": [],
                "target_years": []
            }
        )
        fitment_gpa_fail = calculate_fitment(student, jd_high_gpa)
        self.assertFalse(fitment_gpa_fail["eligible"])

if __name__ == "__main__":
    unittest.main()
