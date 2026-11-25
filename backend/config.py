"""Environment-based configuration for the Spec2Test AI backend.

Local development reads values from backend/.env (git-ignored).
On Vercel, set the same names in Project Settings -> Environment Variables.
"""

import os

from dotenv import load_dotenv

# No-op when backend/.env does not exist (e.g. on Vercel).
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

LOCAL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


def _split_csv(value: str) -> list[str]:
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


# "mock" (default): rule-based, offline, zero API cost.
# "live": calls Gemini and needs GEMINI_API_KEY. Anything else falls back to mock.
AI_MODE = "live" if os.getenv("AI_MODE", "mock").strip().lower() == "live" else "mock"

# Comma-separated list of allowed browser origins. When unset, only local dev
# origins are allowed. In production set it to the deployed frontend URL.
ALLOWED_ORIGINS = _split_csv(os.getenv("ALLOWED_ORIGINS", "")) or LOCAL_ORIGINS

# Optional regex, e.g. to allow Vercel preview URLs of the frontend project.
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX") or None
