import httpx
import logging
import asyncio
from typing import Dict, Any

logger = logging.getLogger("PlacementCopilot.platforms")

async def fetch_github_metrics(handle: str) -> Dict[str, Any]:
    """
    Fetches public metrics from GitHub API for a given handle.
    Falls back to mock data if rate-limited or handle is not found.
    """
    default_data = {
        "github_repos": 5,
        "github_commits_last_month": 10,
        "github_stars": 2
    }
    
    if not handle or handle.strip() == "":
        return default_data
        
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Fetch user info
            user_url = f"https://api.github.com/users/{handle}"
            user_response = await client.get(user_url)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                repos = user_data.get("public_repos", default_data["github_repos"])
                
                # Fetch repos to count stars
                repos_url = f"https://api.github.com/users/{handle}/repos?per_page=100"
                repos_response = await client.get(repos_url)
                stars = 0
                if repos_response.status_code == 200:
                    for repo in repos_response.json():
                        stars += repo.get("stargazers_count", 0)
                
                # Approximate commits using event timeline
                events_url = f"https://api.github.com/users/{handle}/events?per_page=50"
                events_response = await client.get(events_url)
                commits = 0
                if events_response.status_code == 200:
                    for event in events_response.json():
                        if event.get("type") == "PushEvent":
                            payload = event.get("payload", {})
                            commits += len(payload.get("commits", []))
                
                # Fallback check for commits
                commits = max(commits, 8) # minimum base commits for an active user
                
                return {
                    "github_repos": repos,
                    "github_commits_last_month": commits,
                    "github_stars": stars
                }
            elif user_response.status_code == 403:
                # Rate limited, generate a consistent pseudo-random profile based on handle length
                logger.warning(f"GitHub API Rate Limit hit. Utilizing simulated data for {handle}.")
                seed = len(handle)
                return {
                    "github_repos": 10 + (seed % 15),
                    "github_commits_last_month": 15 + (seed * 3) % 45,
                    "github_stars": (seed * 2) % 20
                }
    except Exception as e:
        logger.error(f"Error fetching GitHub profile for {handle}: {e}")
        
    return default_data

async def fetch_leetcode_metrics(handle: str) -> Dict[str, Any]:
    """
    Fetches solved questions count for a given LeetCode handle.
    Falls back to simulated metrics if endpoint fails.
    """
    default_data = {
        "leetcode_solved": 80,
        "leetcode_rating": 1400
    }
    
    if not handle or handle.strip() == "":
        return default_data

    # Use a widely available public proxy API for Leetcode user stats
    # E.g., alfa-leetcode-api.onrender.com or a GraphQL call to leetcode.com
    leetcode_graphql = "https://leetcode.com/graphql"
    graphql_query = {
        "query": """
        query userProblemsSolved($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                profile {
                    ranking
                }
            }
        }
        """,
        "variables": {"username": handle}
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(leetcode_graphql, json=graphql_query)
            if response.status_code == 200:
                data = response.json()
                matched_user = data.get("data", {}).get("matchedUser", {})
                if matched_user:
                    submissions = matched_user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
                    solved = 0
                    for sub in submissions:
                        if sub.get("difficulty") == "All":
                            solved = sub.get("count", 0)
                            break
                    ranking = matched_user.get("profile", {}).get("ranking", 100000)
                    rating = max(1200, 3000 - int(ranking / 500)) if ranking else 1400
                    return {
                        "leetcode_solved": solved,
                        "leetcode_rating": rating
                    }
    except Exception as e:
        logger.error(f"Error fetching LeetCode profile for {handle}: {e}")

    # Semi-random simulator for demo fallback
    seed = len(handle)
    return {
        "leetcode_solved": 50 + (seed * 17) % 350,
        "leetcode_rating": 1350 + (seed * 23) % 650
    }
