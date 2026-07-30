# Phase 3 – REST API Endpoints Reference

All Phase 3 API endpoints are mounted under `/api/v1` on FastAPI engine.

## Student APIs
- `GET /api/v1/student/dashboard`: Returns today's study plan, homework, goals, AI recommendations, XP, streak, badges.
- `POST /api/v1/student/socratic-tutor`: Accepts student question, subject, topic, and Socratic mode toggle; returns guided hints and questions.
- `POST /api/v1/student/generate-planner`: Generates daily/weekly AI study schedule based on weak topics and hours available.
- `GET /api/v1/student/leaderboard`: Returns class, school, or subject leaderboards with privacy filter.
- `POST /api/v1/student/notes/ai-action`: Performs AI Summarize, AI Rewrite, or AI Quiz creation on student notes.
- `POST /api/v1/student/pomodoro/log`: Logs completed focus timer session and calculates earned XP.

## Adaptive Quiz & Practice APIs
- `POST /api/v1/quizzes/generate`: Generates adaptive practice questions across 9 question types.
- `POST /api/v1/quizzes/evaluate`: Evaluates student answers, calculates XP/coins, and provides detailed solution breakdown.

## Revision & Exam Prep APIs
- `POST /api/v1/revision/flashcards`: Generates spaced repetition flashcards.
- `POST /api/v1/revision/material`: Generates quick notes, mind maps, formula sheets, or cheat sheets.
- `POST /api/v1/revision/exam-prep`: Generates exam readiness index, expected questions, and day-by-day countdown plan.

## Parent Portal APIs
- `GET /api/v1/parent/dashboard`: Returns linked child homework, attendance, study hours, and subject mastery.
- `POST /api/v1/parent/coach`: Returns structured evidence-based parenting advice and discussion starters.
- `GET /api/v1/parent/notifications`: Returns real-time alerts feed for parent monitoring.
