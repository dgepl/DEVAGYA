import os
import json
import logging
import uuid
import re
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
import difflib
from dotenv import load_dotenv

from services.ai_provider import ai_provider

load_dotenv()
logger = logging.getLogger("english_coach_service")

def _clean_supabase_url() -> str:
    url = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url if url else "https://amlvyskjrencrolnppgs.supabase.co"
    return url

SUPABASE_URL = _clean_supabase_url()
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

SUPABASE_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# In-memory/file fallback cache
COACH_TRACK_CACHE: Dict[str, Dict[str, Any]] = {}

# =====================================================================
# 1. 10-QUESTION SPOKEN DIAGNOSTIC ASSESSMENT
# =====================================================================
SPOKEN_DIAGNOSTIC_QUESTIONS = [
    {
        "id": 1,
        "category": "Introduction",
        "prompt": "Tell me about yourself.",
        "instruction": "Introduce yourself naturally — your name, where you are from, and what you do or like to study.",
        "time_limit_seconds": 60,
        "skill_focus": "Basic sentence construction, self-description, speech speed",
        "sample_answer": "Hello! My name is Rahul. I am from Delhi, and I am currently working on improving my spoken English communication."
    },
    {
        "id": 2,
        "category": "Daily Life",
        "prompt": "Describe what you usually do during a normal day.",
        "instruction": "Talk about your morning routine, your work or classes, and how you spend your evenings.",
        "time_limit_seconds": 60,
        "skill_focus": "Simple present tense, frequency adverbs (usually, often), time prepositions",
        "sample_answer": "On a typical day, I wake up at 7 AM, have tea, and head to my classes. In the evening, I enjoy reading and spending time with my family."
    },
    {
        "id": 3,
        "category": "Past Experience",
        "prompt": "Tell me about something interesting that happened to you recently.",
        "instruction": "Share a memorable event, trip, or moment from the last few weeks or months.",
        "time_limit_seconds": 60,
        "skill_focus": "Past simple & past continuous tenses, irregular verb forms, chronological order",
        "sample_answer": "Last month, I visited Jaipur with my friends. We explored the Amber Fort and tasted amazing traditional cuisine."
    },
    {
        "id": 4,
        "category": "Future Goals",
        "prompt": "What are your goals for the next few years?",
        "instruction": "Talk about your personal, academic, or career aspirations and what you plan to accomplish.",
        "time_limit_seconds": 60,
        "skill_focus": "Future tenses ('will', 'going to', 'plan to'), modal verbs, expressing intention",
        "sample_answer": "Over the next three years, I want to master fluent spoken English, lead major projects in my field, and travel to new countries."
    },
    {
        "id": 5,
        "category": "Opinion",
        "prompt": "Do you think learning English is important? Why?",
        "instruction": "State your viewpoint clearly and give at least one or two reasons to support it.",
        "time_limit_seconds": 60,
        "skill_focus": "Expressing opinions, causal connectors ('because', 'since', 'therefore'), persuasive clarity",
        "sample_answer": "Yes, I believe English is very important because it connects us globally, opens up career opportunities, and allows us to access vast knowledge."
    },
    {
        "id": 6,
        "category": "Social Situation",
        "prompt": "You are meeting a new person for the first time. How would you introduce yourself?",
        "instruction": "Imagine you are at a workshop or gathering. Introduce yourself warmly and start a polite conversation.",
        "time_limit_seconds": 60,
        "skill_focus": "Social etiquette, polite greetings, question formulation ('What about you?')",
        "sample_answer": "Hi there! Nice to meet you. I'm Amit. Are you also attending today's session? How has your experience been so far?"
    },
    {
        "id": 7,
        "category": "Problem Solving",
        "prompt": "You are at a restaurant and your order is wrong. What would you say?",
        "instruction": "Speak to the server politely but clearly to explain the mistake and ask for it to be corrected.",
        "time_limit_seconds": 60,
        "skill_focus": "Polite requests, assertive communication, modal expressions ('Could you please', 'I ordered')",
        "sample_answer": "Excuse me, I think there might be a small mix-up. I had ordered the grilled paneer sandwich, but this is a vegetable wrap. Could you check this for me, please?"
    },
    {
        "id": 8,
        "category": "Storytelling",
        "prompt": "Tell me about a memorable experience from your life.",
        "instruction": "Narrate an experience from beginning to end with details on what happened and how you felt.",
        "time_limit_seconds": 90,
        "skill_focus": "Narrative flow, descriptive adjectives, emotional expression, cohesive devices",
        "sample_answer": "One memorable experience was when I gave a presentation in front of 200 people. I was terrified at first, but once I started speaking, the audience cheered and I felt an immense sense of accomplishment."
    },
    {
        "id": 9,
        "category": "Advanced Opinion",
        "prompt": "Do you think technology has made communication better or worse? Explain.",
        "instruction": "Discuss both sides or state your stance with arguments on digital vs in-person communication.",
        "time_limit_seconds": 90,
        "skill_focus": "Complex sentence structures, balancing contrasting ideas ('On one hand... on the other hand')",
        "sample_answer": "In my opinion, technology has made communication much faster and accessible across the globe, though sometimes it reduces face-to-face personal warmth."
    },
    {
        "id": 10,
        "category": "Free Speaking",
        "prompt": "Speak about any topic you like for 1–2 minutes.",
        "instruction": "Pick any hobby, book, place, dream, or passion and speak freely with confidence.",
        "time_limit_seconds": 120,
        "skill_focus": "Sustained monologue, spontaneous fluency, vocabulary richness, thought coherence",
        "sample_answer": "I would love to speak about my passion for music. Music helps me unwind after a long day, sparks creativity, and connects people across cultures."
    }
]

# =====================================================================
# 2. 5-LEVEL PROGRESSIVE CURRICULUM DEFINITIONS
# =====================================================================
LEVELS_CONFIG = [
    {
        "level_number": 1,
        "title": "English Foundations",
        "tagline": "Master basic sentence building, common vocabulary & everyday expressions",
        "badge": "FOUNDATIONS",
        "accent_color": "indigo",
        "gradient": "from-blue-600 via-indigo-600 to-purple-600",
        "pass_percentage": 80,
        "focus_areas": ["Sentence Formation", "Common Vocabulary", "Present & Past Verbs", "Pronunciation Basics"],
        "activities": [
            {
                "id": "l1_act_1",
                "type": "vocabulary",
                "title": "Everyday Verbs & Action Words",
                "duration": "4 mins",
                "xp": 25,
                "instructions": "Learn and pronounce high-frequency daily action verbs.",
                "data": {
                    "words": [
                        {"word": "Explain", "meaning": "To make something clear or easy to understand", "example": "She will explain the lesson clearly."},
                        {"word": "Suggest", "meaning": "To propose an idea or plan", "example": "I suggest we practice speaking daily."},
                        {"word": "Prepare", "meaning": "To get ready for something", "example": "He needs to prepare for tomorrow's class."},
                        {"word": "Improve", "meaning": "To make or become better", "example": "Regular speaking helps you improve quickly."}
                    ]
                }
            },
            {
                "id": "l1_act_2",
                "type": "sentence_builder",
                "title": "Subject + Verb + Object Mastery",
                "duration": "5 mins",
                "xp": 30,
                "instructions": "Construct clear, grammatically sound basic sentences.",
                "data": {
                    "drills": [
                        {"target": "She writes an email every morning.", "jumbled": ["an email", "writes", "She", "every morning"]},
                        {"target": "They practice speaking English together.", "jumbled": ["together", "They", "speaking English", "practice"]},
                        {"target": "I prepared a delicious dinner yesterday.", "jumbled": ["yesterday", "prepared", "a delicious dinner", "I"]}
                    ]
                }
            },
            {
                "id": "l1_act_3",
                "type": "mini_lesson",
                "title": "Grammar: Past Simple vs Present Simple",
                "duration": "4 mins",
                "xp": 20,
                "instructions": "Understand when to use 'went' vs 'go', 'did' vs 'do'.",
                "data": {
                    "rule": "Use Present Simple (I go, she goes) for routines. Use Past Simple (I went, she went) for completed past events.",
                    "examples": [
                        {"incorrect": "Yesterday I go to the store.", "correct": "Yesterday I went to the store.", "explanation": "Completed past action requires 'went'."},
                        {"incorrect": "Everyday he is coming by bus.", "correct": "Everyday he comes by bus.", "explanation": "Regular routines take simple present 'comes'."}
                    ]
                }
            },
            {
                "id": "l1_act_4",
                "type": "repeat_after_coach",
                "title": "Pronunciation: Clear Vowel & Consonant Sounds",
                "duration": "5 mins",
                "xp": 35,
                "instructions": "Listen to the coach, then speak each phrase clearly into your microphone.",
                "data": {
                    "phrases": [
                        {"text": "Good morning! How are you doing today?", "phonetic_tip": "Keep the 'oo' in 'good' soft, and stress 'morning'."},
                        {"text": "I am working on my spoken English fluency.", "phonetic_tip": "Notice the clean 'f' and 'l' in 'fluency'."},
                        {"text": "Could you please give me a quick example?", "phonetic_tip": "The 'l' in 'could' is silent (/kʊd/)."}
                    ]
                }
            },
            {
                "id": "l1_act_5",
                "type": "sentence_doctor",
                "title": "Sentence Doctor: Fix 5 Common Speaking Traps",
                "duration": "5 mins",
                "xp": 30,
                "instructions": "Find the spoken mistake and tap or say the corrected version.",
                "data": {
                    "traps": [
                        {"flawed": "Myself Rahul from Mumbai.", "corrected": "I am Rahul from Mumbai.", "reason": "Never introduce yourself using 'Myself'. Use 'I am' or 'My name is'."},
                        {"flawed": "She is knowing the answer.", "corrected": "She knows the answer.", "reason": "'Know' is a stative verb and is rarely used in continuous tense."},
                        {"flawed": "I didn't saw him yesterday.", "corrected": "I didn't see him yesterday.", "reason": "After 'did not', always use the base form of the verb ('see', not 'saw')."}
                    ]
                }
            },
            {
                "id": "l1_act_6",
                "type": "spoken_prompt",
                "title": "Spoken Challenge: My Favourite Morning Routine",
                "duration": "5 mins",
                "xp": 40,
                "instructions": "Answer using your microphone. Aim for 30–45 seconds of natural speech.",
                "data": {
                    "question": "What is the very first thing you do in the morning, and why do you like it?",
                    "hints": ["Start with 'The first thing I usually do is...'", "Mention how it makes you feel.", "Use simple present verbs."]
                }
            },
            {
                "id": "l1_act_7",
                "type": "fill_in_blanks",
                "title": "Prepositions in Action: At, On, In",
                "duration": "4 mins",
                "xp": 25,
                "instructions": "Master time and place prepositions through spoken sentences.",
                "data": {
                    "questions": [
                        {"sentence": "Our morning meeting starts _______ 9:30 AM.", "options": ["at", "on", "in"], "correct": "at"},
                        {"sentence": "We are presenting our project _______ Monday.", "options": ["at", "on", "in"], "correct": "on"},
                        {"sentence": "She was born _______ November.", "options": ["at", "on", "in"], "correct": "in"}
                    ]
                }
            },
            {
                "id": "l1_act_8",
                "type": "daily_expressions",
                "title": "Everyday Social Greetings & Polite Replies",
                "duration": "4 mins",
                "xp": 30,
                "instructions": "Learn how native speakers naturally greet and respond.",
                "data": {
                    "expressions": [
                        {"trigger": "How's your day going?", "replies": ["Pretty good, thanks! How about yours?", "It's going well, just keeping busy."]},
                        {"trigger": "Thanks for your help!", "replies": ["You're very welcome!", "Happy to help anytime!"]}
                    ]
                }
            },
            {
                "id": "l1_act_9",
                "type": "speaking_challenge",
                "title": "Daily Speaking Challenge: 30-Second Self-Introduction",
                "duration": "5 mins",
                "xp": 45,
                "instructions": "Deliver a crisp, confident 30-second introduction without stopping.",
                "data": {
                    "target_seconds": 30,
                    "prompt": "Introduce yourself to a friendly colleague you meet for the first time."
                }
            },
            {
                "id": "l1_act_10",
                "type": "level_capstone_test",
                "title": "Level 1 Spoken Capstone Assessment",
                "duration": "8 mins",
                "xp": 100,
                "instructions": "Comprehensive speaking exam. Score 80%+ to unlock Level 2: Everyday English.",
                "data": {
                    "questions": [
                        {"prompt": "Tell me about your home town and why you enjoy living there.", "min_seconds": 30},
                        {"prompt": "Describe what you did last weekend from morning until evening.", "min_seconds": 30},
                        {"prompt": "Say this sentence correctly: 'Yesterday I (see) a movie and I (feel) happy.'", "min_seconds": 15}
                    ]
                }
            }
        ]
    },
    {
        "level_number": 2,
        "title": "Everyday English",
        "tagline": "Comfortable daily interactions, asking questions, ordering food & natural roleplays",
        "badge": "CONVERSATIONS",
        "accent_color": "emerald",
        "gradient": "from-emerald-600 via-teal-600 to-cyan-600",
        "pass_percentage": 80,
        "focus_areas": ["Daily Conversations", "Roleplays & Real Situations", "Question Asking", "Vocabulary Expansion"],
        "activities": [
            {
                "id": "l2_act_1",
                "type": "roleplay",
                "title": "Roleplay: Ordering Food at a Restaurant",
                "duration": "6 mins",
                "xp": 40,
                "instructions": "The AI is your waiter. Ask for the menu, place your order, and ask for the bill.",
                "data": {
                    "scenario": "You are having lunch at a cafe.",
                    "starter": "Welcome to Bistro Green! What can I get started for you today?",
                    "suggested_phrases": ["Could I please see the vegetarian options?", "I'd like to order...", "Could we please have the bill?"]
                }
            },
            {
                "id": "l2_act_2",
                "type": "roleplay",
                "title": "Roleplay: Asking for Directions & Commuting",
                "duration": "5 mins",
                "xp": 35,
                "instructions": "Ask a passerby for directions to the metro station.",
                "data": {
                    "scenario": "You are slightly lost in a new city.",
                    "starter": "Hello! You look like you're looking for something. Can I help?",
                    "suggested_phrases": ["Excuse me, could you point me towards the nearest metro?", "Is it within walking distance?"]
                }
            },
            {
                "id": "l2_act_3",
                "type": "sentence_doctor",
                "title": "Fix Direct Native Translation Habits",
                "duration": "5 mins",
                "xp": 30,
                "instructions": "Replace Hindi/native thought patterns with natural English phrases.",
                "data": {
                    "traps": [
                        {"flawed": "Open the light.", "corrected": "Turn on the light.", "reason": "For electrical switches, use 'turn on' or 'switch on', not 'open'."},
                        {"flawed": "I am eating my dinner right now. (when talking about routine)", "corrected": "I usually have dinner at 8 PM.", "reason": "Use simple present for regular dining times."},
                        {"flawed": "Tell me what is your good name?", "corrected": "May I know your name, please?", "reason": "'Good name' is an Indianism translated from 'shubh naam'. Native English uses 'May I have your name?'"}
                    ]
                }
            },
            {
                "id": "l2_act_4",
                "type": "spoken_prompt",
                "title": "Talking About Hobbies & Passions",
                "duration": "5 mins",
                "xp": 40,
                "instructions": "Explain your favourite hobby and why it brings you joy.",
                "data": {
                    "question": "What is one activity you can do for hours without getting bored?",
                    "hints": ["Explain how you got started.", "Describe what skills it requires.", "Use phrases like 'I'm passionate about...'"]
                }
            },
            {
                "id": "l2_act_5",
                "type": "roleplay",
                "title": "Roleplay: Shopping & Bargaining Politely",
                "duration": "6 mins",
                "xp": 40,
                "instructions": "Inquire about sizes, prices, and return policies at a clothing store.",
                "data": {
                    "scenario": "Shopping for a smart jacket.",
                    "starter": "Hi there! Looking for anything specific today?",
                    "suggested_phrases": ["Do you have this in a medium size?", "Is there any seasonal discount available?"]
                }
            },
            {
                "id": "l2_act_6",
                "type": "speaking_challenge",
                "title": "60-Second Challenge: My Ideal Weekend",
                "duration": "5 mins",
                "xp": 45,
                "instructions": "Speak continuously for 60 seconds describing your dream Saturday and Sunday.",
                "data": {"target_seconds": 60, "prompt": "Describe your ideal relaxing weekend from start to finish."}
            },
            {
                "id": "l2_act_7",
                "type": "level_capstone_test",
                "title": "Level 2 Spoken Capstone Assessment",
                "duration": "8 mins",
                "xp": 100,
                "instructions": "Conversational test. Score 80%+ to unlock Level 3: Fluent Speaking.",
                "data": {
                    "questions": [
                        {"prompt": "Roleplay: You are returning a defective item to a shop. Explain the issue politely.", "min_seconds": 45},
                        {"prompt": "Describe an unforgettable meal you had at a restaurant.", "min_seconds": 45}
                    ]
                }
            }
        ]
    },
    {
        "level_number": 3,
        "title": "Fluent Speaking",
        "tagline": "Eliminate pauses, master connective words & speak spontaneously with speed",
        "badge": "FLUENCY",
        "accent_color": "purple",
        "gradient": "from-purple-600 via-indigo-600 to-pink-600",
        "pass_percentage": 80,
        "focus_areas": ["Speaking Speed", "Thought Connectors", "Storytelling", "Spontaneous Monologues"],
        "activities": [
            {
                "id": "l3_act_1",
                "type": "spontaneous_speaking",
                "title": "1-Minute Spontaneous Speaking: Random Topic",
                "duration": "6 mins",
                "xp": 50,
                "instructions": "AI gives you a surprise topic. Speak for 60 seconds with zero preparation.",
                "data": {
                    "topics": [
                        "Why do you think travel changes a person's perspective?",
                        "If you could invent one gadget to help humanity, what would it be?",
                        "Is it better to read a book or watch the movie adaptation?"
                    ]
                }
            },
            {
                "id": "l3_act_2",
                "type": "connectors",
                "title": "Thought Connectors: Although, However & Furthermore",
                "duration": "5 mins",
                "xp": 35,
                "instructions": "Connect two contrasting ideas smoothly without long pauses.",
                "data": {
                    "drills": [
                        {"prompt": "Contrast: Working hard vs Not getting immediate results.", "model": "Although he worked tirelessly, he understood that major results take time."},
                        {"prompt": "Contrast: Technology saves time vs It creates distractions.", "model": "Technology undeniably saves time; however, it can also become a source of distraction."}
                    ]
                }
            },
            {
                "id": "l3_act_3",
                "type": "storytelling",
                "title": "Narrative Arc: The Unexpected Journey",
                "duration": "7 mins",
                "xp": 45,
                "instructions": "Narrate an eventful story with a clear beginning, climax, and lesson learned.",
                "data": {
                    "starter": "It was raining heavily, and the last train had already departed...",
                    "guidelines": ["Describe the setting", "Introduce a sudden obstacle", "Explain how you resolved it"]
                }
            },
            {
                "id": "l3_act_4",
                "type": "sentence_expansion",
                "title": "Sentence Expansion: From 4 Words to 16 Words",
                "duration": "5 mins",
                "xp": 40,
                "instructions": "Transform simple sentences into rich, expressive statements.",
                "data": {
                    "base": "The presentation went well.",
                    "expanded": "Despite the unexpected projector glitch, our team delivered a thoroughly engaging and impactful presentation."
                }
            },
            {
                "id": "l3_act_5",
                "type": "level_capstone_test",
                "title": "Level 3 Spoken Capstone Assessment",
                "duration": "8 mins",
                "xp": 100,
                "instructions": "High-fluency assessment. Score 80%+ to unlock Level 4: Real-World English.",
                "data": {
                    "questions": [
                        {"prompt": "Speak for 75 seconds on: 'What qualities make someone a great communicator?'", "min_seconds": 60},
                        {"prompt": "Tell a 60-second story about a time you had to adapt quickly to unexpected news.", "min_seconds": 50}
                    ]
                }
            }
        ]
    },
    {
        "level_number": 4,
        "title": "Real-World English",
        "tagline": "Professional interviews, presentations, debates & workplace communication",
        "badge": "PROFESSIONAL",
        "accent_color": "amber",
        "gradient": "from-amber-600 via-orange-600 to-red-600",
        "pass_percentage": 80,
        "focus_areas": ["Job Interviews", "Business Presentations", "Polite Disagreement", "Debating Complex Ideas"],
        "activities": [
            {
                "id": "l4_act_1",
                "type": "interview_simulation",
                "title": "Job Interview Simulation: 'Tell Me About Yourself'",
                "duration": "6 mins",
                "xp": 50,
                "instructions": "Deliver a professional 90-second career narrative suitable for top hiring managers.",
                "data": {
                    "role": "Senior Consultant / Educator",
                    "coach_prompt": "Welcome to our final interview round. Could you walk me through your journey, core strengths, and why you are excited about this position?"
                }
            },
            {
                "id": "l4_act_2",
                "type": "interview_simulation",
                "title": "STAR Method: Handling Workplace Challenges",
                "duration": "7 mins",
                "xp": 55,
                "instructions": "Explain a difficult situation using Situation, Task, Action, and Result.",
                "data": {
                    "coach_prompt": "Tell me about a time you had a major disagreement with a team member. How did you resolve it?"
                }
            },
            {
                "id": "l4_act_3",
                "type": "presentation_pitch",
                "title": "2-Minute Project Pitch",
                "duration": "6 mins",
                "xp": 50,
                "instructions": "Pitch a new project or teaching methodology with a captivating hook and call to action.",
                "data": {
                    "prompt": "Pitch an innovative educational idea to a panel of school principals."
                }
            },
            {
                "id": "l4_act_4",
                "type": "debate_sparring",
                "title": "Debate Sparring: Artificial Intelligence in Education",
                "duration": "7 mins",
                "xp": 50,
                "instructions": "The coach presents counter-arguments. Defend your point with poise and professional evidence.",
                "data": {
                    "coach_starter": "Many argue that AI will replace human teachers and diminish social connection. How do you respond?"
                }
            },
            {
                "id": "l4_act_5",
                "type": "level_capstone_test",
                "title": "Level 4 Spoken Capstone Assessment",
                "duration": "10 mins",
                "xp": 100,
                "instructions": "Executive spoken assessment. Score 80%+ to unlock Level 5: AI Conversation Mastery.",
                "data": {
                    "questions": [
                        {"prompt": "Deliver a 90-second executive summary pitching your background and leadership philosophy.", "min_seconds": 75},
                        {"prompt": "Respond professionally to a critical client whose delivery deadline was missed.", "min_seconds": 60}
                    ]
                }
            }
        ]
    },
    {
        "level_number": 5,
        "title": "AI Conversation Mastery",
        "tagline": "Real-time, dynamic voice conversation partner with adaptive native fluency",
        "badge": "MASTERY 🎙️",
        "accent_color": "rose",
        "gradient": "from-rose-600 via-pink-600 to-purple-700",
        "pass_percentage": 85,
        "focus_areas": ["Live Voice Interaction", "Natural Turn-Taking", "Context Retention", "Fluid Conversational Mastery"],
        "activities": [
            {
                "id": "l5_act_1",
                "type": "live_voice_lounge",
                "title": "Casual Spoken Lounge: Life, Hobbies & Travel",
                "duration": "Live Conversation",
                "xp": 60,
                "instructions": "Have an unscripted, natural voice conversation with your AI coach.",
                "data": {
                    "category": "Casual",
                    "initial_prompt": "Hey there! It's wonderful to practice with you today. How has your week been treating you so far?"
                }
            },
            {
                "id": "l5_act_2",
                "type": "live_voice_lounge",
                "title": "Intermediate Lounge: Culture, Society & Tech",
                "duration": "Live Conversation",
                "xp": 70,
                "instructions": "Discuss emerging trends, society, and your perspectives with real-time feedback.",
                "data": {
                    "category": "Intermediate",
                    "initial_prompt": "I was just reading an article about how reading habits are shifting toward short digital video summaries. What do you think about that?"
                }
            },
            {
                "id": "l5_act_3",
                "type": "live_voice_lounge",
                "title": "Advanced Mastery Lounge: Global Issues & Philosophy",
                "duration": "Live Conversation",
                "xp": 80,
                "instructions": "Engage in deep, nuanced debate on leadership, economics, and human psychology.",
                "data": {
                    "category": "Advanced",
                    "initial_prompt": "Welcome to our Master's dialogue! Today, let's explore what truly defines ethical leadership in the 21st century. What's your take?"
                }
            }
        ]
    }
]


class EnglishCoachService:
    def __init__(self):
        self.supabase_url = SUPABASE_URL
        self.service_key = SERVICE_KEY
        self.headers = SUPABASE_HEADERS

    # -----------------------------------------------------------------
    # DIAGNOSTIC QUESTIONS
    # -----------------------------------------------------------------
    def get_diagnostic_questions_for_client(self) -> List[Dict[str, Any]]:
        """Returns the 10 spoken diagnostic assessment questions."""
        return SPOKEN_DIAGNOSTIC_QUESTIONS

    # -----------------------------------------------------------------
    # USER PROFILE & PROGRESS STATE
    # -----------------------------------------------------------------
    def _normalize_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Safely parses JSONB fields from Supabase or cache into Python data structures."""
        if not isinstance(data, dict):
            return data

        for list_field in ["unlocked_levels", "completed_activities", "common_mistakes", "strengths", "weaknesses", "priority_focus", "personalized_roadmap"]:
            val = data.get(list_field)
            if isinstance(val, str):
                try:
                    data[list_field] = json.loads(val)
                except Exception:
                    data[list_field] = []
            elif not isinstance(val, list):
                data[list_field] = [1] if list_field == "unlocked_levels" else []

        for dict_field in ["activity_scores", "skills", "coach_feedback"]:
            val = data.get(dict_field)
            if isinstance(val, str):
                try:
                    data[dict_field] = json.loads(val)
                except Exception:
                    data[dict_field] = {}
            elif not isinstance(val, dict):
                data[dict_field] = {}

        # Ensure unlocked_levels contains at least 1 and are ints
        unlocked = []
        for x in data.get("unlocked_levels", [1]):
            try:
                unlocked.append(int(x))
            except (ValueError, TypeError):
                pass
        data["unlocked_levels"] = sorted(list(set(unlocked))) if unlocked else [1]
        return data

    def get_or_create_profile(self, user_id: str, user_role: str = "student", user_name: str = "Learner") -> Dict[str, Any]:
        """Fetches user's coach profile or initializes default state."""
        clean_id = (user_id or "guest_learner").strip().lower()
        cache_key = f"{clean_id}_{user_role}"

        # 1. Try Supabase cloud fetch
        if self.supabase_url and self.service_key:
            try:
                with httpx.Client(timeout=4.0) as client:
                    resp = client.get(
                        f"{self.supabase_url}/rest/v1/english_coach_profiles",
                        headers=self.headers,
                        params={"user_id": f"eq.{clean_id}", "user_role": f"eq.{user_role}"}
                    )
                    if resp.status_code == 200:
                        rows = resp.json()
                        if rows and len(rows) > 0:
                            data = self._normalize_profile(rows[0])
                            COACH_TRACK_CACHE[cache_key] = data
                            return data
            except Exception as e:
                logger.warning(f"Supabase fetch profile failed for {clean_id}: {e}")

        # 2. Return cached if present
        if cache_key in COACH_TRACK_CACHE:
            return self._normalize_profile(COACH_TRACK_CACHE[cache_key])

        # 3. Initialize fresh profile
        initial_profile = {
            "user_id": clean_id,
            "user_role": user_role,
            "user_name": user_name,
            "has_taken_diagnostic": False,
            "overall_level": "Unassessed", # A1, A2, B1, B2, C1
            "overall_score": 0,
            "skills": {
                "speaking": 0,
                "grammar": 0,
                "vocabulary": 0,
                "pronunciation": 0,
                "fluency": 0,
                "confidence": 0,
                "conversation": 0
            },
            "strengths": [],
            "weaknesses": [],
            "priority_focus": ["Speaking Fluency", "Sentence Formation", "Everyday Vocabulary"],
            "personalized_roadmap": [],
            "current_level": 1,
            "unlocked_levels": [1],
            "completed_activities": [],
            "activity_scores": {},
            "common_mistakes": [],
            "words_learned": 0,
            "daily_streak": 1,
            "xp": 0,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        COACH_TRACK_CACHE[cache_key] = initial_profile
        self._persist_profile_async(initial_profile)
        return initial_profile

    def _persist_profile_async(self, profile: Dict[str, Any]):
        """Persists profile to Supabase cloud table."""
        if not self.supabase_url or not self.service_key:
            return
        try:
            with httpx.Client(timeout=4.0) as client:
                client.post(
                    f"{self.supabase_url}/rest/v1/english_coach_profiles",
                    headers={**self.headers, "Prefer": "resolution=merge-duplicates"},
                    json=profile
                )
        except Exception as e:
            logger.debug(f"Cloud profile sync fallback: {e}")

    # -----------------------------------------------------------------
    # EVALUATE 10-QUESTION SPOKEN ASSESSMENT
    # -----------------------------------------------------------------
    async def evaluate_diagnostic_assessment(
        self,
        user_id: str,
        user_role: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes the learner's 10 spoken responses using Groq AI.
        Computes CEFR Level, skill scores, strengths, weaknesses, and weekly roadmap.
        """
        clean_id = (user_id or "guest_learner").strip().lower()
        profile = self.get_or_create_profile(clean_id, user_role=user_role)

        # Identify genuine responses provided by the user
        valid_answers = []
        transcript_lines = []
        for idx, item in enumerate(answers, 1):
            q_id = item.get("question_id", idx)
            category = item.get("category", f"Question {idx}")
            prompt = item.get("prompt", "")
            raw_transcript = (item.get("transcript") or "").strip()

            is_valid = bool(raw_transcript) and raw_transcript.lower() not in [
                "[no answer / skipped]",
                "skipped",
                "no answer",
                "undefined",
                "null",
                "[skipped]",
                "none"
            ]

            if is_valid:
                words = [w for w in raw_transcript.split() if len(w) > 1]
                if len(words) >= 1:
                    valid_answers.append(item)
                    transcript_lines.append(f"Question {idx} [{category}]: \"{prompt}\"\nLearner Spoken Response: \"{raw_transcript}\"")
                else:
                    transcript_lines.append(f"Question {idx} [{category}]: \"{prompt}\"\nLearner Spoken Response: [No answer / Skipped]")
            else:
                transcript_lines.append(f"Question {idx} [{category}]: \"{prompt}\"\nLearner Spoken Response: [No answer / Skipped]")

        total_answered = len(valid_answers)
        total_words = sum(len((a.get("transcript") or "").split()) for a in valid_answers)

        # STRICT ZERO SCORE CHECK: If student answered 0 questions or uttered fewer than 3 words
        if total_answered == 0 or total_words < 3:
            analysis_data = {
                "overall_level": "A1",
                "overall_score": 0,
                "skills": {
                    "speaking": 0,
                    "grammar": 0,
                    "vocabulary": 0,
                    "pronunciation": 0,
                    "fluency": 0,
                    "confidence": 0,
                    "conversation": 0
                },
                "strengths": ["Initiated the diagnostic assessment"],
                "weaknesses": ["No voice responses detected — all 10 diagnostic questions were skipped or left silent."],
                "coach_feedback": {
                    "what_you_are_good_at": "You opened the diagnostic assessment, but no voice responses were detected.",
                    "what_we_need_to_improve": "To evaluate your English accurately, you must speak into your microphone and answer each question aloud.",
                    "your_biggest_focus": "Start from Level 1: English Foundations to build vocabulary, correct pronunciation, and basic speaking habits."
                },
                "priority_focus": ["Speaking Confidence", "Everyday Vocabulary", "Pronunciation Fundamentals"],
                "personalized_roadmap": [
                    {"week": 1, "theme": "Foundations & First Words", "focus": "Speaking basic greetings and everyday verbs with confidence"},
                    {"week": 2, "theme": "Simple Sentence Patterns", "focus": "Subject + Verb + Object structure"},
                    {"week": 3, "theme": "Daily Life Scenarios", "focus": "Short 15-second speaking drills"},
                    {"week": 4, "theme": "Spontaneous Fluency", "focus": "30-second speaking challenges"}
                ],
                "recommended_level": 1
            }
        else:
            max_allowed_score = int((total_answered / 10.0) * 100)
            prompt_content = f"""
You are an expert Cambridge & CEFR Spoken English Master Examiner.
You are evaluating a student's real spoken diagnostic responses.

STUDENT ASSESSMENT METRICS:
- Total Questions: 10
- Answered Questions: {total_answered} of 10
- Skipped / Silent Questions: {10 - total_answered} of 10
- Total Words Spoken: {total_words}
- MAXIMUM POSSIBLE OVERALL SCORE: {max_allowed_score} (strictly capped because student only answered {total_answered}/10 questions)

Here are the 10 questions and the learner's actual spoken responses:
{chr(10).join(transcript_lines)}

STRICT CEFR EXAMINER RULES & INDEPENDENT RUBRICS:
1. Genuinely observe what the student actually spoke. DO NOT award high, mock, or imaginary marks.
2. For each question with [No answer / Skipped], award 0 marks.
3. The overall_score CANNOT exceed {max_allowed_score}! If the student answered {total_answered} questions, their score must be proportional.
4. INDEPENDENT RUBRIC PER COMPETENCY (Score each independently between 0 and {max_allowed_score}):
   - fluency (0 to {max_allowed_score}): Assess flow, pacing, rhythm, and absence of broken hesitations across answered questions. If answers are 1-2 words or disjointed, score 10-35. If answers have smooth continuity, score 65-90.
   - grammar (0 to {max_allowed_score}): Assess verb tenses, subject-verb agreement, auxiliary verbs, and syntax. If student makes basic tense mistakes or omits verbs, score 15-45. If grammatically structured with minor slips, score 60-80. If flawless, score 85-95.
   - vocabulary (0 to {max_allowed_score}): Assess lexical range and precision. If learner repeats simple words ('good', 'yes') or lacks words, score 15-40. If diverse, context-rich words, score 65-85.
   - pronunciation (0 to {max_allowed_score}): Phonetic clarity and intelligibility.
   - speaking (0 to {max_allowed_score}): General communicative ability.
   - confidence (0 to {max_allowed_score}): Sentence completeness vs hesitation.
   - conversation (0 to {max_allowed_score}): Relevance to the specific questions asked.
5. NEVER assign identical numbers across all skills. Differentiate each score based on their actual answers.

Return ONLY a valid JSON object matching this schema:
{{
  "overall_level": "A1 | A2 | B1 | B2 | C1",
  "overall_score": <integer between 0 and {max_allowed_score}>,
  "skills": {{
    "speaking": <integer between 0 and {max_allowed_score}>,
    "grammar": <integer between 0 and {max_allowed_score}>,
    "vocabulary": <integer between 0 and {max_allowed_score}>,
    "pronunciation": <integer between 0 and {max_allowed_score}>,
    "fluency": <integer between 0 and {max_allowed_score}>,
    "confidence": <integer between 0 and {max_allowed_score}>,
    "conversation": <integer between 0 and {max_allowed_score}>
  }},
  "strengths": [
    "Genuine strength observed from their actual spoken answers",
    "Second genuine strength"
  ],
  "weaknesses": [
    "Specific linguistic weakness observed from their actual spoken answers",
    "Second specific weakness"
  ],
  "coach_feedback": {{
    "what_you_are_good_at": "Honest explanation of what was good in their spoken answers.",
    "what_we_need_to_improve": "Specific linguistic hurdles identified from their speech.",
    "your_biggest_focus": "The concrete skills we will train together in Level 1."
  }},
  "priority_focus": ["Speaking Fluency", "Sentence Formation", "Everyday Vocabulary"],
  "personalized_roadmap": [
    {{"week": 1, "theme": "Basic Sentence Formation & Daily Speaking", "focus": "Present & Past simple verbs"}},
    {{"week": 2, "theme": "Everyday Vocabulary & Conversation", "focus": "Shopping, dining, travel phrases"}},
    {{"week": 3, "theme": "Grammar Correction & Fluid Connectors", "focus": "Because, although, however"}},
    {{"week": 4, "theme": "Storytelling & Spontaneous Speaking", "focus": "1-minute speaking without pause"}}
  ],
  "recommended_level": 1
}}
"""
            try:
                resp = await ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": "You are a professional Cambridge CEFR spoken English examiner. Strictly accurate, non-inflated, distinct scoring for fluency, grammar, and vocabulary. Return pure JSON only."},
                        {"role": "user", "content": prompt_content}
                    ],
                    temperature=0.2,
                    max_tokens=1200
                )

                raw_text = resp.get("content", "").strip()
                raw_text = re.sub(r"^```json\s*", "", raw_text, flags=re.MULTILINE)
                raw_text = re.sub(r"^```\s*", "", raw_text, flags=re.MULTILINE).rstrip("`").strip()
                analysis_data = json.loads(raw_text)

                # Calibrate score against maximum allowed score
                raw_score = int(analysis_data.get("overall_score", 0))
                calibrated_score = min(max_allowed_score, max(0, raw_score))
                analysis_data["overall_score"] = calibrated_score

                # Calibrate skills
                skills = analysis_data.get("skills", {})
                for k in ["speaking", "grammar", "vocabulary", "pronunciation", "fluency", "confidence", "conversation"]:
                    skills[k] = min(max_allowed_score, max(0, int(skills.get(k, calibrated_score))))
                analysis_data["skills"] = skills

                # Assign authentic CEFR level
                if calibrated_score <= 30:
                    analysis_data["overall_level"] = "A1"
                elif calibrated_score <= 50:
                    analysis_data["overall_level"] = "A2"
                elif calibrated_score <= 70:
                    analysis_data["overall_level"] = "B1"
                elif calibrated_score <= 85:
                    analysis_data["overall_level"] = "B2"
                else:
                    analysis_data["overall_level"] = "C1"

            except Exception as e:
                logger.error(f"AI evaluation failed for diagnostic: {e}")
                # Authentic linguistic computation based on actual answered content
                unique_words = len(set(" ".join(valid_answers).lower().split()))
                avg_words = total_words / max(1, total_answered)
                coverage_factor = total_answered / 10.0

                calc_fluency = min(max_allowed_score, max(0, int(min(1.0, avg_words / 12.0) * max_allowed_score)))
                calc_vocab = min(max_allowed_score, max(0, int(min(1.0, unique_words / 30.0) * max_allowed_score)))
                calc_grammar = min(max_allowed_score, max(0, int(min(1.0, avg_words / 10.0) * max_allowed_score * 0.9)))
                calc_pron = min(max_allowed_score, max(0, int((calc_fluency + calc_vocab) / 2)))
                calc_conf = min(max_allowed_score, max(0, int(coverage_factor * 85)))
                calc_conv = min(max_allowed_score, max(0, int((calc_grammar + calc_vocab) / 2)))
                calc_overall = min(max_allowed_score, max(0, int((calc_fluency + calc_grammar + calc_vocab + calc_pron) / 4)))

                level = "A1" if calc_overall <= 30 else ("A2" if calc_overall <= 50 else "B1")
                analysis_data = {
                    "overall_level": level,
                    "overall_score": calc_overall,
                    "skills": {
                        "speaking": calc_overall,
                        "grammar": calc_grammar,
                        "vocabulary": calc_vocab,
                        "pronunciation": calc_pron,
                        "fluency": calc_fluency,
                        "confidence": calc_conf,
                        "conversation": calc_conv
                    },
                    "strengths": [f"Attempted {total_answered} of 10 speaking questions", f"Spoke {total_words} words across responses"],
                    "weaknesses": [f"{10 - total_answered} questions were skipped or left unanswered", "Need more expanded sentences to show vocabulary and fluency depth"],
                    "coach_feedback": {
                        "what_you_are_good_at": f"You attempted {total_answered} speaking questions.",
                        "what_we_need_to_improve": "Consistency across all speaking prompts and full sentence responses.",
                        "your_biggest_focus": "We will build daily speaking habits and vocabulary in Level 1."
                    },
                    "priority_focus": ["Speaking Consistency", "Sentence Formation", "Everyday Vocabulary"],
                    "personalized_roadmap": [
                        {"week": 1, "theme": "Basic Sentence Formation & Daily Speaking", "focus": "Present & Past simple verbs"},
                        {"week": 2, "theme": "Everyday Vocabulary & Conversation", "focus": "Daily social scenarios"},
                        {"week": 3, "theme": "Thought Connectors & Flow", "focus": "Connecting ideas smoothly"},
                        {"week": 4, "theme": "Spontaneous Speaking", "focus": "60-second speaking challenges"}
                    ],
                    "recommended_level": 1
                }

        # Update and save profile
        profile["has_taken_diagnostic"] = True
        profile["overall_level"] = analysis_data.get("overall_level", "A1")
        profile["overall_score"] = analysis_data.get("overall_score", 0)
        profile["skills"] = analysis_data.get("skills", profile["skills"])
        profile["strengths"] = analysis_data.get("strengths", [])
        profile["weaknesses"] = analysis_data.get("weaknesses", [])
        profile["coach_feedback"] = analysis_data.get("coach_feedback", {})
        profile["priority_focus"] = analysis_data.get("priority_focus", [])
        profile["personalized_roadmap"] = analysis_data.get("personalized_roadmap", [])
        profile["current_level"] = 1 # Always start at Level 1 per strict locked progression flow
        profile["unlocked_levels"] = [1]
        profile["updated_at"] = datetime.now(timezone.utc).isoformat()

        cache_key = f"{clean_id}_{user_role}"
        COACH_TRACK_CACHE[cache_key] = profile
        self._persist_profile_async(profile)

        return {
            "status": "success",
            "profile": profile,
            "report": analysis_data
        }

    # -----------------------------------------------------------------
    # GET CURRICULUM & LEVEL LOCKS
    # -----------------------------------------------------------------
    def get_levels_for_user(self, user_id: str, user_role: str = "student") -> List[Dict[str, Any]]:
        """
        Returns all 5 levels with personalized lock states, progress percentages,
        and completion statuses according to the user's profile.
        """
        profile = self.get_or_create_profile(user_id, user_role=user_role)
        unlocked_set = set(profile.get("unlocked_levels") or [1])
        completed_activities_set = set(profile.get("completed_activities") or [])

        result_levels = []
        for l_cfg in LEVELS_CONFIG:
            lvl_num = l_cfg["level_number"]

            # Dynamic unlock check: If preceding level has >= 70% completed, or capstone passed/done, unlock this level
            if lvl_num > 1:
                prev_cfg = next((l for l in LEVELS_CONFIG if l["level_number"] == lvl_num - 1), None)
                if prev_cfg:
                    prev_acts = prev_cfg.get("activities", [])
                    prev_total = len(prev_acts)
                    prev_completed = sum(1 for a in prev_acts if a["id"] in completed_activities_set)
                    prev_prog = int((prev_completed / prev_total) * 100) if prev_total > 0 else 0
                    prev_capstone = next((a for a in prev_acts if a.get("type") == "level_capstone_test"), None)
                    prev_cap_passed = False
                    if prev_capstone:
                        prev_cap_score = profile.get("activity_scores", {}).get(prev_capstone["id"], 0)
                        prev_cap_passed = prev_cap_score >= 60 or (prev_capstone["id"] in completed_activities_set)

                    if prev_prog >= 70 or prev_cap_passed or prev_completed >= max(1, prev_total - 2):
                        unlocked_set.add(lvl_num)

            is_unlocked = (lvl_num in unlocked_set) or (lvl_num == 1)

            activities = l_cfg.get("activities", [])
            total_acts = len(activities)
            completed_in_lvl = sum(1 for a in activities if a["id"] in completed_activities_set)
            progress_pct = int((completed_in_lvl / total_acts) * 100) if total_acts > 0 else 0

            # Level capstone status
            capstone_act = next((a for a in activities if a.get("type") == "level_capstone_test"), None)
            capstone_passed = False
            if capstone_act:
                capstone_score = profile.get("activity_scores", {}).get(capstone_act["id"], 0)
                capstone_passed = capstone_score >= 60 or (capstone_act["id"] in completed_activities_set)

            is_completed = (progress_pct >= 80) or capstone_passed

            # Enrich activities with completion flag
            enriched_acts = []
            for act in activities:
                act_copy = dict(act)
                act_copy["is_completed"] = act["id"] in completed_activities_set
                act_copy["user_score"] = profile.get("activity_scores", {}).get(act["id"])
                enriched_acts.append(act_copy)

            result_levels.append({
                "level_number": lvl_num,
                "title": l_cfg["title"],
                "tagline": l_cfg["tagline"],
                "badge": l_cfg["badge"],
                "accent_color": l_cfg["accent_color"],
                "gradient": l_cfg["gradient"],
                "focus_areas": l_cfg["focus_areas"],
                "pass_percentage": l_cfg["pass_percentage"],
                "is_unlocked": is_unlocked,
                "is_completed": is_completed,
                "progress_percentage": progress_pct,
                "completed_activities_count": completed_in_lvl,
                "total_activities_count": total_acts,
                "capstone_passed": capstone_passed,
                "unlock_requirement": f"Complete Level {lvl_num - 1} activities or pass the Level {lvl_num - 1} Spoken Exam" if lvl_num > 1 else "Unlocked by default",
                "activities": enriched_acts
            })

        # Keep profile's unlocked_levels synchronized
        if set(profile.get("unlocked_levels") or []) != unlocked_set:
            profile["unlocked_levels"] = sorted(list(unlocked_set))
            if profile.get("current_level", 1) < max(unlocked_set):
                profile["current_level"] = max(unlocked_set)
            self._persist_profile_async(profile)

        return result_levels

    # -----------------------------------------------------------------
    # COMPLETE AN ACTIVITY & CHECK LEVEL UNLOCK
    # -----------------------------------------------------------------
    def complete_activity(
        self,
        user_id: str,
        user_role: str,
        level_number: int,
        activity_id: str,
        score: int = 100,
        mistakes: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Marks an activity as completed, updates XP, daily streak, and checks
        if the next progressive level should be unlocked.
        """
        clean_id = (user_id or "guest_learner").strip().lower()
        profile = self.get_or_create_profile(clean_id, user_role=user_role)

        completed_list = list(profile.get("completed_activities") or [])
        if activity_id not in completed_list:
            completed_list.append(activity_id)

        scores_map = dict(profile.get("activity_scores") or {})
        scores_map[activity_id] = max(scores_map.get(activity_id, 0), score)

        # Log mistakes for adaptive practice
        common_mistakes = list(profile.get("common_mistakes") or [])
        if mistakes:
            for m in mistakes:
                if m not in common_mistakes:
                    common_mistakes.append(m)

        # Update XP
        earned_xp = max(20, int(score * 0.5))
        profile["xp"] = profile.get("xp", 0) + earned_xp
        profile["completed_activities"] = completed_list
        profile["activity_scores"] = scores_map
        profile["common_mistakes"] = common_mistakes[-20:] # Keep last 20

        # Check level unlock logic
        unlocked_levels = list(profile.get("unlocked_levels") or [1])
        level_cfg = next((l for l in LEVELS_CONFIG if l["level_number"] == level_number), None)
        next_level_unlocked = False

        if level_cfg and level_number < 5:
            acts = level_cfg.get("activities", [])
            capstone = next((a for a in acts if a.get("type") == "level_capstone_test"), None)
            total_count = len(acts)
            completed_count = sum(1 for a in acts if a["id"] in completed_list)
            prog_pct = int((completed_count / total_count) * 100) if total_count > 0 else 0

            capstone_passed = False
            if capstone:
                capstone_score = scores_map.get(capstone["id"], 0)
                capstone_passed = capstone_score >= 60 or (capstone["id"] in completed_list)

            # Unlocks next level if:
            # 1. 70%+ of level activities done, OR
            # 2. Capstone assessment passed or finished, OR
            # 3. Current activity is the capstone exam, OR
            # 4. Completed at least total_count - 2 activities
            is_capstone_act = capstone and (activity_id == capstone["id"])
            should_unlock = (
                prog_pct >= 70
                or capstone_passed
                or is_capstone_act
                or (completed_count >= max(1, total_count - 2))
            )

            if should_unlock:
                next_lvl = level_number + 1
                if next_lvl not in unlocked_levels:
                    unlocked_levels.append(next_lvl)
                    next_level_unlocked = True
                profile["current_level"] = max(profile.get("current_level", 1), next_lvl)

        profile["unlocked_levels"] = sorted(list(set(unlocked_levels)))
        profile["updated_at"] = datetime.now(timezone.utc).isoformat()

        cache_key = f"{clean_id}_{user_role}"
        COACH_TRACK_CACHE[cache_key] = profile
        self._persist_profile_async(profile)

        return {
            "status": "success",
            "earned_xp": earned_xp,
            "next_level_unlocked": next_level_unlocked,
            "unlocked_level": level_number + 1 if next_level_unlocked else None,
            "profile": profile
        }

    # -----------------------------------------------------------------
    # EVALUATE SINGLE SPOKEN RESPONSE & ERROR CORRECTION
    # -----------------------------------------------------------------
    async def critique_spoken_response(
        self,
        prompt: str,
        user_speech: str,
        target_phrase: Optional[str] = None,
        context: Optional[str] = None,
        drill_type: Optional[str] = "general",
        user_level: str = "A2"
    ) -> Dict[str, Any]:
        """
        Analyzes a single spoken answer from the learner.
        Provides constructive error correction and a spoken audio script:
        1. Praise & affirmation
        2. Exact comparison against target_phrase if provided (e.g. for pronunciation/repeat)
        3. Gentle mistake correction (❌ original vs ✅ corrected)
        4. Simple explanation of the rule
        5. Real fluency, grammar, and pronunciation scores (no mock numbers)
        6. spoken_coach_speech: audio script designed for AI coach to speak out loud
        """
        speech_text = (user_speech or "").strip()
        if not speech_text:
            return {
                "understood": False,
                "feedback": "I didn't hear your response. Tap the microphone and speak clearly.",
                "spoken_coach_speech": "I couldn't hear your response clearly. Please tap the microphone and speak again.",
                "has_mistakes": False,
                "scores": {"fluency": 0, "grammar": 0, "vocabulary": 0, "confidence": 0}
            }

        # Clean and extract tokens for genuine linguistic comparison
        spoken_clean_words = [re.sub(r"[^\w]", "", w.lower()) for w in speech_text.split() if re.sub(r"[^\w]", "", w.lower())]
        word_count = len(spoken_clean_words)

        target_clean_words = []
        similarity_ratio = 1.0
        if target_phrase:
            target_clean_words = [re.sub(r"[^\w]", "", w.lower()) for w in target_phrase.split() if re.sub(r"[^\w]", "", w.lower())]
            clean_spoken_str = " ".join(spoken_clean_words)
            clean_target_str = " ".join(target_clean_words)
            similarity_ratio = difflib.SequenceMatcher(None, clean_spoken_str, clean_target_str).ratio() if clean_target_str else 1.0

        ai_prompt = f"""
You are an expert Cambridge Spoken English Coach listening to a student's voice response.
Activity Drill Type: {drill_type}
Prompt given to student: "{prompt}"
{f'Target Expected Phrase: "{target_phrase}"' if target_phrase else ''}
{f'Context: "{context}"' if context else ''}
Student's Spoken Utterance: "{speech_text}"
Spoken Word Count: {word_count}
{f'Lexical Match Ratio: {int(similarity_ratio * 100)}%' if target_phrase else ''}
Student Proficiency Level: {user_level}

GENUINE SCORING RUBRICS (Each metric MUST be independently scored 0 to 100 based on what they actually said):
1. fluency (0-100):
   - Measures speech flow, natural pacing, and continuous rhythm.
   - 0 words spoken: 0.
   - 1 isolated word: 10-30 max.
   - 2-4 words with hesitation/fragmentation: 35-55.
   - Complete sentence with natural flow and continuity: 75-95.
2. grammar (0-100):
   - Measures syntactic accuracy: verb tenses, subject-verb agreement, auxiliary verbs, prepositions, articles.
   - If target phrase is given: Does their spoken response match the target grammar?
   - Broken syntax or major missing verbs: 20-50.
   - 1 minor grammatical slip: 60-75.
   - Grammatically correct and complete: 85-98.
3. vocabulary (0-100):
   - Measures lexical appropriateness, word precision, and range.
   - If target phrase was given: Score strictly proportional to target words accurately spoken ({int(similarity_ratio * 100)}%).
   - If open-ended: Score based on appropriate vocabulary versus elementary/garbled words.
4. confidence (0-100):
   - Measures assertiveness, completeness, and clarity.

CRITICAL INSTRUCTIONS:
- Do NOT give fake, mock, or identical numbers across all metrics.
- Genuinely critique the exact spoken text: "{speech_text}".
- Provide "spoken_coach_speech": A concise, warm, natural spoken message (1-2 sentences) that YOU will speak aloud to the student through their headphones.
  - If good: "Spot on! Your sentence delivery was clear and natural."
  - If mistake: "Good try! You said '[short snippet]', but the correct way is '[corrected sentence]'. Let's repeat it together: '[corrected sentence]'."

Return ONLY valid JSON:
{{
  "affirmation": "Short warm praise acknowledging their effort.",
  "has_mistakes": true,
  "original_snippet": "{speech_text}",
  "corrected_sentence": "The correct natural sentence",
  "explanation": "Clear, simple 1-sentence grammar or pronunciation rule.",
  "repeat_challenge": "Now repeat after me: '...'",
  "spoken_coach_speech": "Spoken audio script for coach to say aloud to the student",
  "scores": {{
    "fluency": <integer 0-100 based on fluency criteria>,
    "grammar": <integer 0-100 based on grammar criteria>,
    "vocabulary": <integer 0-100 based on vocabulary criteria>,
    "confidence": <integer 0-100 based on confidence criteria>
  }}
}}
"""
        try:
            resp = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a warm, highly observant Cambridge spoken English coach. Accurately and strictly score fluency, grammar, and vocabulary without mock numbers. Return pure JSON only."},
                    {"role": "user", "content": ai_prompt}
                ],
                temperature=0.2,
                max_tokens=650
            )
            raw_text = resp.get("content", "").strip()
            raw_text = re.sub(r"^```json\s*", "", raw_text, flags=re.MULTILINE)
            raw_text = re.sub(r"^```\s*", "", raw_text, flags=re.MULTILINE).rstrip("`").strip()
            data = json.loads(raw_text)

            # Ensure spoken_coach_speech exists
            if not data.get("spoken_coach_speech"):
                if data.get("has_mistakes") and data.get("corrected_sentence"):
                    data["spoken_coach_speech"] = f"Good try! Instead of saying {data.get('original_snippet', '')}, you should say: {data['corrected_sentence']}. {data.get('explanation', '')}"
                else:
                    data["spoken_coach_speech"] = f"Excellent job! Your pronunciation and sentence delivery were clear and natural."

            # Real-world sanity calibrations on returned scores
            scores = data.get("scores", {})
            raw_fluency = int(scores.get("fluency", 50))
            raw_grammar = int(scores.get("grammar", 50))
            raw_vocab = int(scores.get("vocabulary", 50))
            raw_conf = int(scores.get("confidence", 50))

            if word_count == 0:
                data["scores"] = {"fluency": 0, "grammar": 0, "vocabulary": 0, "confidence": 0}
            elif word_count == 1:
                data["scores"] = {
                    "fluency": min(30, raw_fluency),
                    "grammar": min(35, raw_grammar),
                    "vocabulary": min(40, raw_vocab) if not target_phrase else min(int(similarity_ratio * 100), raw_vocab),
                    "confidence": min(50, raw_conf)
                }
            elif target_phrase and len(target_clean_words) > 0:
                lexical_pct = int(similarity_ratio * 100)
                data["scores"] = {
                    "fluency": min(100, max(10, raw_fluency)),
                    "grammar": min(100, max(15, raw_grammar if lexical_pct > 30 else int(lexical_pct * 0.7))),
                    "vocabulary": min(100, max(10, int(lexical_pct * 0.75 + raw_vocab * 0.25))),
                    "confidence": min(100, max(15, raw_conf))
                }
            else:
                data["scores"] = {
                    "fluency": min(100, max(10, raw_fluency)),
                    "grammar": min(100, max(10, raw_grammar)),
                    "vocabulary": min(100, max(10, raw_vocab)),
                    "confidence": min(100, max(10, raw_conf))
                }

            return data
        except Exception as e:
            logger.warning(f"AI critique error: {e}")
            # Authentic linguistic computation based on actual spoken words
            if target_phrase and len(target_clean_words) > 0:
                sim_pct = int(similarity_ratio * 100)
                has_err = sim_pct < 80
                return {
                    "affirmation": "Good effort!" if has_err else "Excellent pronunciation!",
                    "has_mistakes": has_err,
                    "original_snippet": speech_text,
                    "corrected_sentence": target_phrase,
                    "explanation": f"Make sure to speak all target words clearly: '{target_phrase}'." if has_err else "Your rhythm and pronunciation were accurate.",
                    "repeat_challenge": f"Now repeat after me: '{target_phrase}'",
                    "spoken_coach_speech": f"Nice effort! You said '{speech_text}'. Listen carefully and repeat: '{target_phrase}'." if has_err else "Great job! You spoke that accurately and clearly.",
                    "scores": {
                        "fluency": min(95, max(15, int(sim_pct * 0.95))),
                        "grammar": min(98, max(20, int(sim_pct * 0.98))) if not has_err else min(70, max(25, int(sim_pct * 0.8))),
                        "vocabulary": min(100, max(10, sim_pct)),
                        "confidence": min(90, max(30, int(min(1.0, word_count / len(target_clean_words)) * 85)))
                    }
                }
            else:
                fluency_score = min(92, max(20, word_count * 9))
                grammar_score = min(88, max(30, 45 + (15 if word_count >= 5 else 0)))
                vocab_score = min(90, max(25, len(set(spoken_clean_words)) * 8))
                conf_score = min(90, max(30, 30 + word_count * 7))
                return {
                    "affirmation": "Good effort! I heard your response clearly.",
                    "has_mistakes": False,
                    "original_snippet": speech_text,
                    "corrected_sentence": speech_text,
                    "explanation": "Practice connecting your ideas with smooth phrases like 'because' and 'for example'.",
                    "repeat_challenge": "Keep practicing daily speaking with confidence.",
                    "spoken_coach_speech": "Well spoken! You shared your thoughts with good confidence. Let's continue to the next practice.",
                    "scores": {
                        "fluency": fluency_score,
                        "grammar": grammar_score,
                        "vocabulary": vocab_score,
                        "confidence": conf_score
                    }
                }

    # -----------------------------------------------------------------
    # REAL-TIME CONVERSATIONAL VOICE AGENT (LEVEL 5)
    # -----------------------------------------------------------------
    async def process_conversation_turn(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        category: str = "Casual",
        user_level: str = "B1"
    ) -> Dict[str, Any]:
        """
        Conducts a fluid, natural conversation turn with the AI coach.
        Returns:
        1. Conversational natural reply
        2. In-line gentle speech notes (if any major mistake was made)
        3. End of session metrics if requested
        """
        speech_text = (user_message or "").strip()

        history_formatted = []
        for turn in conversation_history[-6:]:
            role = "user" if turn.get("sender") == "user" else "assistant"
            history_formatted.append({"role": role, "content": turn.get("text", "")})

        system_instruction = f"""
You are DEVGYA's AI English Speaking Coach, engaging in an authentic, natural voice conversation with an Indian learner.
Topic Domain: {category}
Learner Proficiency: {user_level}

Rules for your response:
1. Speak warmly, naturally, and concisely (2–3 sentences max) so it sounds like real human dialogue.
2. Ask one engaging follow-up question to keep the conversation flowing.
3. If the user made a noticeable grammatical error, include a gentle correction in the "correction" field, but NEVER let it break the natural flow of your spoken conversation.
4. Return pure JSON:
{{
  "reply": "Your natural spoken reply and follow-up question here.",
  "gentle_correction": "Optional small note: 'By the way, you can say went instead of go.' or empty string",
  "topic_insight": "Encouraging remark on their vocabulary or sentence structure."
}}
"""
        history_formatted.insert(0, {"role": "system", "content": system_instruction})
        history_formatted.append({"role": "user", "content": speech_text})

        try:
            resp = await ai_provider.chat_completion(
                messages=history_formatted,
                temperature=0.6,
                max_tokens=350
            )
            raw = resp.get("content", "").strip()
            raw = re.sub(r"^```json\s*", "", raw, flags=re.MULTILINE)
            raw = re.sub(r"^```\s*", "", raw, flags=re.MULTILINE).rstrip("`").strip()
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"Conversation turn fallback: {e}")
            return {
                "reply": "That's very interesting! Could you tell me a little bit more about why you feel that way?",
                "gentle_correction": "",
                "topic_insight": "Good confidence in expressing your thoughts."
            }

    # -----------------------------------------------------------------
    # END-OF-SESSION PERFORMANCE REPORT (LEVEL 5)
    # -----------------------------------------------------------------
    async def generate_session_report(
        self,
        conversation_turns: List[Dict[str, str]],
        category: str = "Casual"
    ) -> Dict[str, Any]:
        """Generates an end-of-session performance report after a conversation."""
        user_utterances = [t.get("text", "").strip() for t in conversation_turns if t.get("sender") == "user" and t.get("text", "").strip()]
        total_words = sum(len(u.split()) for u in user_utterances)
        unique_words = len(set(" ".join(user_utterances).lower().split())) if user_utterances else 0
        turn_count = len(user_utterances)

        if turn_count == 0 or total_words == 0:
            return {
                "fluency": 0,
                "grammar": 0,
                "vocabulary": 0,
                "pronunciation": 0,
                "confidence": 0,
                "you_did_well": ["Started the conversation practice"],
                "improve_next": ["Speak your answers aloud into the microphone to receive feedback"],
                "coach_closing_message": "I didn't detect any spoken words during this session. Please check your microphone and speak with me next time!"
            }

        ai_prompt = f"""
Evaluate this full voice conversation session between a student and their English coach:
Conversation domain: {category}
Total Student Turns: {turn_count}
Total Spoken Words: {total_words}
Student's actual spoken sentences:
{chr(10).join(f"- {u}" for u in user_utterances)}

GENUINE SCORING RUBRICS (Each score 0-100 independently based on what was actually spoken):
1. fluency (0-100): Flow, rhythm, response pacing, absence of broken fragments across turns.
2. grammar (0-100): Tense accuracy, subject-verb agreement, sentence completeness.
3. vocabulary (0-100): Lexical richness and contextual appropriateness.
4. pronunciation (0-100): Clarity and phonetic intelligibility.
5. confidence (0-100): Conversational assertiveness.

Do NOT award identical numbers or generic mock scores.

Provide an End-of-Session Performance Report as pure JSON:
{{
  "fluency": <integer 0-100 based on fluency rubric>,
  "grammar": <integer 0-100 based on grammar rubric>,
  "vocabulary": <integer 0-100 based on vocabulary rubric>,
  "pronunciation": <integer 0-100 based on pronunciation rubric>,
  "confidence": <integer 0-100 based on confidence rubric>,
  "you_did_well": [
    "Genuine strength observed from their actual responses",
    "Second genuine strength"
  ],
  "improve_next": [
    "Specific grammar or vocabulary improvement area observed",
    "Second specific improvement area"
  ],
  "coach_closing_message": "Personalized 2-sentence closing encouragement referencing their actual conversation."
}}
"""
        try:
            resp = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are an expert spoken English coach evaluating a conversation. Strictly score real fluency, grammar, and vocabulary without mock numbers. Return pure JSON only."},
                    {"role": "user", "content": ai_prompt}
                ],
                temperature=0.2,
                max_tokens=600
            )
            raw = resp.get("content", "").strip()
            raw = re.sub(r"^```json\s*", "", raw, flags=re.MULTILINE)
            raw = re.sub(r"^```\s*", "", raw, flags=re.MULTILINE).rstrip("`").strip()
            return json.loads(raw)
        except Exception:
            # Authentic dynamic computation based on conversation statistics
            avg_w = total_words / max(1, turn_count)
            calc_f = min(92, max(20, int(min(1.0, avg_w / 10.0) * 85)))
            calc_v = min(92, max(20, int(min(1.0, unique_words / 25.0) * 85)))
            calc_g = min(90, max(25, int(min(1.0, avg_w / 8.0) * 80)))
            calc_p = min(90, max(25, int((calc_f + calc_v) / 2)))
            calc_c = min(95, max(30, int(min(1.0, turn_count / 5.0) * 85)))
            return {
                "fluency": calc_f,
                "grammar": calc_g,
                "vocabulary": calc_v,
                "pronunciation": calc_p,
                "confidence": calc_c,
                "you_did_well": [f"Completed {turn_count} conversational turns", f"Spoke {total_words} total words in English"],
                "improve_next": ["Expanding sentences with connective words like 'because' and 'for instance'"],
                "coach_closing_message": "Good effort practicing today! Continue having daily conversations to build effortless speaking flow."
            }

    # -----------------------------------------------------------------
    # RESET TRACK (FOR RETAKING DIAGNOSTIC)
    # -----------------------------------------------------------------
    def reset_profile(self, user_id: str, user_role: str = "student") -> Dict[str, Any]:
        """Resets diagnostic status and level progression to allow a fresh start."""
        clean_id = (user_id or "guest_learner").strip().lower()
        cache_key = f"{clean_id}_{user_role}"
        if cache_key in COACH_TRACK_CACHE:
            del COACH_TRACK_CACHE[cache_key]

        return self.get_or_create_profile(clean_id, user_role=user_role)


english_coach_service = EnglishCoachService()
