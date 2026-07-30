# Phase 3 – Database Schema Documentation

File: `supabase/schema_phase3.sql`

## Extended Tables
1. `students`: Extended student profile with XP, coins, level, learning streak, opt_out_leaderboard.
2. `parents`: Parent entity linked to phone & notification settings.
3. `parent_student_links`: Multi-child association mapping parent profiles to student profiles.
4. `student_progress`: Subject & chapter mastery scores, weak topics, and strong topics.
5. `study_sessions`: Logs completed study sessions and XP earned.
6. `study_goals`: Tracks daily, weekly, monthly, and exam targets.
7. `student_memory`: Personal AI memory store per student for selective token retrieval.
8. `homework`: Student homework items with due dates and submission status.
9. `flashcards`: Spaced repetition flashcards with ease factor and next review dates.
10. `revision_plans`: Revision material JSONs (mind maps, formula sheets, cheat sheets).
11. `badges`: Gamification badge unlock tracking.
12. `leaderboards`: Ranked leaderboard records by school/class/subject.
13. `quiz_attempts`: Stores quiz attempts, user answers, scores, and XP awards.
14. `exam_preparation`: Strategic exam preparation plans and confidence indices.
15. `notes`: Notion-style markdown notes with tags, summary, and AI quiz attachments.
16. `study_timer`: Pomodoro focus logs and focus scores.
17. `notifications`: Real-time notification feed for parent and student users.
