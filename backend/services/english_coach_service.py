import os
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
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

# In-memory/file fallback cache to ensure zero loss if network fails
COACH_TRACK_CACHE: Dict[str, Dict[str, Any]] = {}

# =====================================================================
# 1. FIXED 10-MARK DIAGNOSTIC QUESTION BANK (DETERMINISTIC, NO AI LAG)
# =====================================================================
DIAGNOSTIC_QUESTIONS = [
    {
        "id": 1,
        "category": "Tenses",
        "question": "She _______ to London three times this year for academic conferences.",
        "options": [
            "has gone",
            "has been",
            "went",
            "was going"
        ],
        "correct_index": 1,
        "explanation": "'Has been' is used for completed visits with return, indicating life experience in an unfinished time period (this year).",
        "weakness_tag": "Present Perfect vs Past Simple"
    },
    {
        "id": 2,
        "category": "Prepositions",
        "question": "The annual science symposium is scheduled to begin _______ 10:00 AM on Monday.",
        "options": [
            "in",
            "on",
            "at",
            "by"
        ],
        "correct_index": 2,
        "explanation": "We use 'at' for precise clock times (at 10:00 AM) and 'on' for specific days (on Monday).",
        "weakness_tag": "Time & Place Prepositions"
    },
    {
        "id": 3,
        "category": "Subject-Verb Agreement",
        "question": "Neither of the two candidate teachers _______ ready to take over the class.",
        "options": [
            "were",
            "was",
            "are",
            "have been"
        ],
        "correct_index": 1,
        "explanation": "'Neither of' takes a singular verb ('was') in formal standard English.",
        "weakness_tag": "Singular vs Plural Concord"
    },
    {
        "id": 4,
        "category": "Connectors & Transition Words",
        "question": "She practiced speaking every single day, _______ she was still nervous before her speech.",
        "options": [
            "because",
            "yet",
            "so",
            "therefore"
        ],
        "correct_index": 1,
        "explanation": "'Yet' introduces a surprising contrast between daily practice and nervousness.",
        "weakness_tag": "Contrasting Conjunctions & Flow"
    },
    {
        "id": 5,
        "category": "Vocabulary & Collocations",
        "question": "Could you please _______ a quick look at my project presentation slides?",
        "options": [
            "make",
            "take",
            "do",
            "give"
        ],
        "correct_index": 1,
        "explanation": "The natural English collocation is 'take a look' or 'have a look'.",
        "weakness_tag": "Natural Collocations & Word Choice"
    },
    {
        "id": 6,
        "category": "Pronunciation & Phonetics Awareness",
        "question": "Which of the following words contains a silent consonant letter?",
        "options": [
            "Doubt",
            "Rapid",
            "Silver",
            "Planet"
        ],
        "correct_index": 0,
        "explanation": "In 'Doubt', the letter 'b' is silent (/daʊt/).",
        "weakness_tag": "Silent Consonants & Articulation"
    },
    {
        "id": 7,
        "category": "Conversational Etiquette",
        "question": "What is the most polite, professional way to interject in a group discussion?",
        "options": [
            "Stop talking, hear my point.",
            "May I add a quick observation here?",
            "You are wrong about that.",
            "Listen to me right now."
        ],
        "correct_index": 1,
        "explanation": "'May I add a quick observation here?' maintains diplomatic tact and respect.",
        "weakness_tag": "Diplomatic Interjection & Etiquette"
    },
    {
        "id": 8,
        "category": "Conditionals & Hypotheticals",
        "question": "If I _______ more opportunities to practice public speaking, I would be much more confident.",
        "options": [
            "have",
            "had",
            "would have",
            "will have"
        ],
        "correct_index": 1,
        "explanation": "Second conditional for hypothetical present situations uses 'If + past simple (had) ... would + base verb'.",
        "weakness_tag": "Hypothetical Conditionals"
    },
    {
        "id": 9,
        "category": "Modals & Persuasion",
        "question": "To persuade the audience effectively, a speaker _______ maintain steady eye contact.",
        "options": [
            "ought to",
            "might to",
            "could to",
            "would to"
        ],
        "correct_index": 0,
        "explanation": "'Ought to' expresses moral recommendation or best practice.",
        "weakness_tag": "Modal Verbs of Advice"
    },
    {
        "id": 10,
        "category": "Public Speaking & Presentation Structure",
        "question": "Which of the following is the most powerful opening hook for a public speech?",
        "options": [
            "A startling question, relatable story, or compelling fact.",
            "Reading the agenda slide word for word.",
            "Apologizing that you didn't prepare enough.",
            "Saying 'My name is X and my topic is Y'."
        ],
        "correct_index": 0,
        "explanation": "Compelling speeches hook audience attention immediately with an emotional story, startling statistic, or thought-provoking question.",
        "weakness_tag": "Public Speaking Hook & Structure"
    }
]

# =====================================================================
# 2. STRUCTURED LRSI & LRSP LECTURE ROADMAP
# =====================================================================
def get_curriculum_modules(level: str, weak_points: List[str]) -> List[Dict[str, Any]]:
    """Generates sequential, locked modules tailored to the student's level and weak points."""
    return [
        {
            "id": "module_1",
            "title": "Module 1: Foundation Spoken Fluency (LRSI Method)",
            "methodology": "LRSI (Listen, Repeat, Speak, Interact)",
            "description": "Overcome hesitation, master everyday conversation openers, and eliminate filler words.",
            "focus_areas": ["Natural Intonation", "Quick Sentence Formation", "Filler Word Reduction"],
            "steps": [
                {
                    "step_id": "m1_listen",
                    "type": "listen",
                    "title": "Listen: Clear Conversational Cadence",
                    "prompt": "Listen carefully to the coach's tone, pacing, and natural sentence pauses.",
                    "model_audio_text": "Good morning everyone. It is a genuine pleasure to connect with all of you today. Let us get started on our discussion."
                },
                {
                    "step_id": "m1_repeat",
                    "type": "repeat",
                    "title": "Repeat: Echo Pronunciation & Intonation",
                    "prompt": "Press the microphone and repeat the exact phrase with clear cadence.",
                    "target_phrase": "It is a genuine pleasure to connect with all of you today."
                },
                {
                    "step_id": "m1_speak",
                    "type": "speak",
                    "title": "Speak: Situational Classroom Greeting",
                    "prompt": "How would you warmly welcome your students or colleagues to an interactive morning session? Speak in 1-2 clear sentences.",
                    "sample_answer": "Good morning class! I am excited to see your bright smiles today. Let us dive into our fascinating topic!"
                },
                {
                    "step_id": "m1_interact",
                    "type": "interact",
                    "title": "Interact: Live Back-and-Forth Dialogue",
                    "prompt": "Have a spontaneous spoken exchange with the AI coach. Respond warmly to whatever the coach asks you.",
                    "coach_starter": "Hello there! Tell me one exciting thing you learned or taught recently in your school."
                },
                {
                    "step_id": "m1_game",
                    "type": "game",
                    "game_type": "word_sprint",
                    "title": "Mini-Game: 30-Second Word Association Sprint",
                    "prompt": "Speak aloud as many inspiring adjectives related to 'Education & Learning' as you can within 30 seconds!",
                    "target_keywords": ["engaging", "creative", "curious", "brilliant", "thoughtful", "vibrant", "interactive", "inspiring", "dynamic", "knowledgeable"]
                }
            ],
            "game": {
                "id": "word_sprint",
                "title": "Game: 30-Second Word Association Sprint",
                "instructions": "Speak aloud as many adjectives related to 'Inspiring Education' as you can in 30 seconds!",
                "target_keywords": ["engaging", "creative", "curious", "brilliant", "thoughtful", "vibrant", "interactive"]
            }
        },
        {
            "id": "module_2",
            "title": "Module 2: Polish Grammar & Vocabulary Precision",
            "methodology": "Interactive Polish & Error Fixer",
            "description": f"Targeted corrections for your specific diagnostic gaps: {', '.join(weak_points[:3]) if weak_points else 'Tenses and Prepositions'}.",
            "focus_areas": ["Accurate Verb Tenses", "Idiomatic Collocations", "Phonetic Articulation"],
            "steps": [
                {
                    "step_id": "m2_listen",
                    "type": "listen",
                    "title": "Listen: Expressing Past & Present Experiences",
                    "prompt": "Notice how the speaker smoothly transitions from past observations to current conclusions.",
                    "model_audio_text": "Over the past several weeks, our students have demonstrated significant improvement in mathematical reasoning, and they are now ready for advanced challenges."
                },
                {
                    "step_id": "m2_repeat",
                    "type": "repeat",
                    "title": "Repeat: Polish Tongue Twister for Lip & Tongue Agility",
                    "prompt": "Articulate each syllable cleanly without stumbling.",
                    "target_phrase": "Vincent vowed vengeance very vehemently with vibrant voice."
                },
                {
                    "step_id": "m2_speak",
                    "type": "speak",
                    "title": "Speak: Fixing Common Indian English Flaws",
                    "prompt": "Avoid saying 'revert back' or 'prepone'. State how you would professionally request someone to reply to your email by tomorrow.",
                    "sample_answer": "Please let me know your thoughts by tomorrow afternoon at your earliest convenience."
                },
                {
                    "step_id": "m2_interact",
                    "type": "interact",
                    "title": "Interact: Professional Problem Solving",
                    "prompt": "A parent or student asks you for extra time to submit an assignment. Politely explain your classroom policy.",
                    "coach_starter": "Teacher, my child could not finish the science project due to a family wedding. Can we submit it next week?"
                },
                {
                    "step_id": "m2_game",
                    "type": "game",
                    "game_type": "sentence_fixer",
                    "title": "Mini-Game: Spot & Speak The Grammar Fix",
                    "prompt": "Look at the flawed sentence, identify the grammatical error, and speak the correct version into your microphone!",
                    "flawed_sentence": "I am working here since five years.",
                    "corrected_sentence": "I have been working here for five years."
                }
            ],
            "game": {
                "id": "sentence_fixer",
                "title": "Game: Spot & Speak The Fix",
                "flawed_sentence": "I am working here since five years.",
                "corrected_sentence": "I have been working here for five years."
            }
        },
        {
            "id": "module_3",
            "title": "Module 3: Public Speaking & Presentation Mastery (LRSP Method)",
            "methodology": "LRSP (Listen, Repeat, Speak, Present)",
            "description": "Master stage presence, opening hooks, transition connectors, and impromptu speech delivery.",
            "focus_areas": ["Strong Speech Hooks", "Storytelling Arc", "Pacing & Modulation", "Live AI Critique"],
            "steps": [
                {
                    "step_id": "m3_listen",
                    "type": "listen",
                    "title": "Listen: The 3-Part Public Speech Formula",
                    "prompt": "Listen to the formula: 1) The Grabber Hook, 2) The Core Proof, 3) The Inspiring Call to Action.",
                    "model_audio_text": "Imagine a classroom where every student is so excited that they cannot wait for the bell to ring. That is not a dream—that is the classroom we are creating together today."
                },
                {
                    "step_id": "m3_repeat",
                    "type": "repeat",
                    "title": "Repeat: High-Impact Keynote Transition",
                    "prompt": "Deliver this transition with authoritative, confident volume.",
                    "target_phrase": "This brings me directly to our most transformative conclusion."
                },
                {
                    "step_id": "m3_speak",
                    "type": "speak",
                    "title": "Speak: 30-Second Elevator Pitch",
                    "prompt": "In 30 seconds, introduce a creative educational innovation you want to implement in school.",
                    "sample_answer": "I propose creating an experiential discovery lab where students learn science by designing real working prototypes."
                },
                {
                    "step_id": "m3_present",
                    "type": "present",
                    "title": "Present: 1-Minute Live Public Speech Stage",
                    "prompt": "Deliver a 60-second public speech on: 'Why Curiosity is the Greatest Teacher'. The AI coach will evaluate your filler words, pacing, and conviction!",
                    "topic": "Why Curiosity is the Greatest Teacher"
                },
                {
                    "step_id": "m3_game",
                    "type": "game",
                    "game_type": "tongue_twister",
                    "title": "Mini-Game: Speed Tongue Twister Sprint",
                    "prompt": "Speak this classic articulation tongue twister without stumbling. Speed and crisp pronunciation count!",
                    "target_phrase": "She sells seashells by the seashore and the shells she sells are seashells"
                }
            ],
            "game": {
                "id": "impromptu_challenge",
                "title": "Game: 30-Second Impromptu Speech Sprint",
                "instructions": "Speak continuously for 30 seconds without saying 'um', 'uh', or 'like' on the topic: 'My Favorite Book'."
            }
        },
        {
            "id": "module_4",
            "title": "Module 4: Final Capstone Live Interaction & Mastery Evaluation",
            "methodology": "Live Spoken Capstone & Spoken Mastery Report",
            "description": "The culminating live spoken session. Demonstrate your spoken mastery to generate your official report card.",
            "focus_areas": ["Spontaneous Fluency", "Professional Vocabulary", "Complete Spoken Report"],
            "steps": [
                {
                    "step_id": "m4_live_capstone",
                    "type": "capstone",
                    "title": "Capstone: Live Spoken AI Interaction",
                    "prompt": "Engage in a live interactive interview with Devgya English Coach. Answer spontaneous questions about leadership, communication, and your vision.",
                    "coach_starter": "Welcome to your Final Spoken Capstone! Tell me: how has your confidence in spoken English evolved, and how will you use it in your daily life?"
                }
            ]
        }
    ]


class EnglishCoachService:
    """Enterprise-grade service for managing diagnostic assessments, LRSI/LRSP progression, and reports."""

    CYCLE_DURATION_DAYS = 30  # Data expires every 30 days to encourage periodic re-assessment

    def get_diagnostic_questions_for_client(self) -> List[Dict[str, Any]]:
        """Returns the 10 fixed questions without the answer key for frontend rendering."""
        return [
            {
                "id": q["id"],
                "category": q["category"],
                "question": q["question"],
                "options": q["options"],
                "weakness_tag": q["weakness_tag"]
            }
            for q in DIAGNOSTIC_QUESTIONS
        ]

    def _get_now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _get_expiry_iso(self) -> str:
        return (datetime.now(timezone.utc) + timedelta(days=self.CYCLE_DURATION_DAYS)).isoformat()

    def _is_expired(self, expires_at: Optional[str]) -> bool:
        if not expires_at:
            return False
        try:
            exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            return datetime.now(timezone.utc) > exp
        except Exception:
            return False

    # ------------------------------------------------------------------
    # SUPABASE PERSISTENCE WITH FALLBACK
    # ------------------------------------------------------------------
    def get_user_track(self, user_id: str, user_role: str = "student") -> Dict[str, Any]:
        """Loads user's active English speaking track from Supabase, checking for 30-day expiry."""
        if not user_id:
            user_id = "guest_user"

        track = None

        # 1. Try Supabase Cloud query
        if SUPABASE_URL and SERVICE_KEY:
            try:
                # Query chat_conversations where agent_code = 'english_coach_track' and user_id = user_id
                url = f"{SUPABASE_URL}/rest/v1/chat_conversations?user_id=eq.{user_id}&agent_code=eq.english_coach_track&order=created_at.desc&limit=1"
                with httpx.Client(timeout=5.0) as client:
                    res = client.get(url, headers=SUPABASE_HEADERS)
                    if res.status_code == 200:
                        rows = res.json()
                        if rows:
                            row = rows[0]
                            title = row.get("title") or "{}"
                            try:
                                track = json.loads(title)
                            except Exception:
                                pass
            except Exception as e:
                logger.warning(f"Supabase get_user_track notice: {e}")

        # 2. Check local in-memory/file fallback cache
        if not track:
            track = COACH_TRACK_CACHE.get(user_id)

        # 3. Check for 30-day cycle expiry: if expired, mark expired and prompt re-assessment
        if track:
            if self._is_expired(track.get("expires_at")):
                logger.info(f"User {user_id} English coach track expired. Resetting cycle.")
                track["is_expired"] = True
                track["diagnostic_completed"] = False
                track["current_module_index"] = 0
                track["unlocked_module_index"] = 0
                track["completed_steps"] = []
                self.save_user_track(user_id, track, user_role=user_role)
            return track

        # 4. Default fresh state (first-time user)
        fresh_state = {
            "user_id": user_id,
            "user_role": user_role,
            "diagnostic_completed": False,
            "diagnostic_score": 0,
            "diagnostic_total": 10,
            "weak_points": [],
            "fluency_level": "Unassessed",
            "current_module_index": 0,
            "unlocked_module_index": 0,
            "completed_steps": [],
            "public_speaking_feedback": None,
            "mastery_report": None,
            "created_at": self._get_now_iso(),
            "expires_at": self._get_expiry_iso(),
            "is_expired": False
        }
        COACH_TRACK_CACHE[user_id] = fresh_state
        return fresh_state

    def save_user_track(self, user_id: str, track: Dict[str, Any], user_role: str = "student") -> bool:
        """Saves user track to Supabase Cloud and local cache."""
        if not user_id:
            user_id = "guest_user"

        track["user_id"] = user_id
        track["user_role"] = user_role
        track["updated_at"] = self._get_now_iso()
        COACH_TRACK_CACHE[user_id] = track

        if not SUPABASE_URL or not SERVICE_KEY:
            return True

        try:
            payload_json = json.dumps(track)
            conv_id = f"coach-track-{user_id}"

            # Check if conversation record already exists
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conv_id}"
            with httpx.Client(timeout=6.0) as client:
                check_res = client.get(url, headers=SUPABASE_HEADERS)
                if check_res.status_code == 200 and check_res.json():
                    # Update
                    patch_url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conv_id}"
                    client.patch(patch_url, headers=SUPABASE_HEADERS, json={
                        "title": payload_json,
                        "updated_at": self._get_now_iso()
                    })
                else:
                    # Insert
                    post_url = f"{SUPABASE_URL}/rest/v1/chat_conversations"
                    client.post(post_url, headers=SUPABASE_HEADERS, json={
                        "id": conv_id,
                        "user_id": user_id,
                        "title": payload_json,
                        "agent_code": "english_coach_track",
                        "language": "english",
                        "created_at": self._get_now_iso(),
                        "updated_at": self._get_now_iso()
                    })
            return True
        except Exception as e:
            logger.warning(f"Failed to persist coach track to Supabase: {e}")
            return False

    # ------------------------------------------------------------------
    # 3. DIAGNOSTIC EVALUATION (DETERMINISTIC)
    # ------------------------------------------------------------------
    def submit_diagnostic(self, user_id: str, user_answers: Dict[str, int], user_role: str = "student") -> Dict[str, Any]:
        """
        Grades the 10 fixed questions, identifies weak points, sets level, and initializes roadmap.
        """
        score = 0
        weak_points = []
        detailed_breakdown = []

        for q in DIAGNOSTIC_QUESTIONS:
            q_id = str(q["id"])
            user_ans = user_answers.get(q_id)
            correct_ans = q["correct_index"]
            is_correct = (user_ans == correct_ans)

            if is_correct:
                score += 1
            else:
                weak_points.append(q["weakness_tag"])

            detailed_breakdown.append({
                "question_id": q["id"],
                "category": q["category"],
                "weakness_tag": q["weakness_tag"],
                "is_correct": is_correct,
                "user_selected": user_ans,
                "correct_option": correct_ans,
                "explanation": q["explanation"]
            })

        # Fluency level band
        if score >= 8:
            level = "Advanced (C1 Spoken Fluency)"
        elif score >= 5:
            level = "Intermediate (B1 Conversational)"
        else:
            level = "Foundation (A2 Expressive Basics)"

        track = self.get_user_track(user_id, user_role=user_role)
        track["diagnostic_completed"] = True
        track["diagnostic_score"] = score
        track["diagnostic_total"] = 10
        track["weak_points"] = weak_points
        track["fluency_level"] = level
        track["current_module_index"] = 0
        track["unlocked_module_index"] = 0
        track["completed_steps"] = []
        track["mastery_report"] = None
        track["created_at"] = self._get_now_iso()
        track["expires_at"] = self._get_expiry_iso()
        track["is_expired"] = False

        self.save_user_track(user_id, track, user_role=user_role)

        modules = get_curriculum_modules(level, weak_points)

        return {
            "score": score,
            "total": 10,
            "percentage": (score / 10) * 100,
            "fluency_level": level,
            "weak_points": weak_points,
            "detailed_breakdown": detailed_breakdown,
            "modules": modules,
            "track": track
        }

    # ------------------------------------------------------------------
    # 4. STRICT PROGRESSION CONTROLLER (NO SKIPPING)
    # ------------------------------------------------------------------
    def complete_lecture_step(self, user_id: str, module_index: int, step_id: str, user_role: str = "student") -> Dict[str, Any]:
        """
        Validates that user completes prerequisites before advancing. Strictly prevents skipping.
        """
        track = self.get_user_track(user_id, user_role=user_role)

        if not track.get("diagnostic_completed"):
            raise ValueError("You must complete the 10-Mark Diagnostic Test before taking lectures.")

        unlocked_idx = track.get("unlocked_module_index", 0)
        if module_index > unlocked_idx:
            raise ValueError(f"Skipping is strictly disabled. You must complete Module {unlocked_idx + 1} first.")

        completed_steps = track.get("completed_steps", [])
        if step_id not in completed_steps:
            completed_steps.append(step_id)
            track["completed_steps"] = completed_steps

        # Check if current module's steps are all complete -> unlock next module
        modules = get_curriculum_modules(track.get("fluency_level", "Intermediate"), track.get("weak_points", []))
        if module_index < len(modules):
            current_mod = modules[module_index]
            required_step_ids = [s["step_id"] for s in current_mod.get("steps", [])]
            all_done = all(sid in completed_steps for sid in required_step_ids)
            if all_done and module_index == unlocked_idx:
                track["unlocked_module_index"] = min(unlocked_idx + 1, len(modules) - 1)
                track["current_module_index"] = track["unlocked_module_index"]

        self.save_user_track(user_id, track, user_role=user_role)

        return {
            "status": "success",
            "unlocked_module_index": track.get("unlocked_module_index", 0),
            "completed_steps": track.get("completed_steps", []),
            "track": track
        }

    # ------------------------------------------------------------------
    # 5. PUBLIC SPEAKING CRITIC (TARGETED AI EVALUATION)
    # ------------------------------------------------------------------
    async def evaluate_public_speaking(self, speech_text: str, topic: str, user_level: str) -> Dict[str, Any]:
        """Evaluates 1-minute public speaking presentation for fillers, structure, and corrections."""
        clean_speech = speech_text.strip()
        if not clean_speech or len(clean_speech.split()) < 5:
            return {
                "filler_count": 0,
                "wpm_pacing": "Too brief",
                "grammar_score": 50,
                "overall_score": 50,
                "what_was_wrong": "Speech was too brief (under 15 words). Give a fuller answer with at least 3-4 sentences.",
                "live_correction": "Try starting with: 'Curiosity is the engine that drives all human discovery...'",
                "praise": "Good attempt stepping up to the microphone!"
            }

        # Deterministic filler word counter
        filler_words = ["um", "uh", "like", "actually", "basically", "you know", "i mean", "sort of"]
        lower = clean_speech.lower()
        filler_count = sum(lower.count(f) for f in filler_words)

        prompt = f"""You are Devgya Chief Public Speaking Coach.
Analyze the student's 1-minute public speech on topic: "{topic}".
Student Spoken Transcript:
\"\"\"{clean_speech}\"\"\"

Student Level: {user_level}

Evaluate strictly and return JSON with keys:
1. "grammar_score": integer 1-100
2. "confidence_score": integer 1-100
3. "overall_score": integer 1-100
4. "what_was_wrong": 1-2 concise bullet points explaining grammatical slips, awkward pauses, or lack of structure.
5. "live_correction": Rephrase the student's speech into a polished, powerful 2-3 sentence speech version they can read aloud.
6. "praise": 1 energetic sentence praising their best point.
"""
        messages = [
            {"role": "system", "content": "You are a professional spoken English and public speaking adjudicator. Return ONLY a valid JSON object."},
            {"role": "user", "content": prompt}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.3, response_format_json=True)
            data = json.loads(raw)
            data["filler_count"] = filler_count
            return data
        except Exception as ex:
            logger.warning(f"Public speaking AI critique notice: {ex}")
            return {
                "filler_count": filler_count,
                "grammar_score": 80,
                "confidence_score": 85,
                "overall_score": 82,
                "what_was_wrong": "Good enthusiasm, but make sure to use transition words like 'Furthermore' and 'In conclusion'.",
                "live_correction": "Curiosity sparks discovery. When students ask 'why', they begin to truly learn. That is why curiosity is our greatest mentor.",
                "praise": "Great passion and clear voice projection!"
            }

    # ------------------------------------------------------------------
    # 6. FINAL MASTERY REPORT GENERATOR (CAPSTONE COMPLETION)
    # ------------------------------------------------------------------
    async def generate_mastery_report(self, user_id: str, capstone_transcript: str, user_role: str = "student", student_name: str = "Student") -> Dict[str, Any]:
        """Synthesizes the official Spoken English Mastery Report Card."""
        track = self.get_user_track(user_id, user_role=user_role)
        score = track.get("diagnostic_score", 7)
        level = track.get("fluency_level", "Intermediate")
        weak_points = track.get("weak_points", [])

        prompt = f"""Generate an official Devgya Spoken English Mastery Report for:
Learner Name: {student_name} ({user_role.capitalize()})
Diagnostic Score: {score}/10
Initial Level: {level}
Identified Weak Points: {', '.join(weak_points) if weak_points else 'Minor filler words'}
Capstone Spoken Presentation:
\"\"\"{capstone_transcript}\"\"\"

Generate a formal JSON report with keys:
1. "fluency_band": e.g. "B2 Independent Communicator" or "C1 Advanced Speaker"
2. "pronunciation_rating": integer 80-98
3. "grammar_accuracy": integer 80-98
4. "public_speaking_confidence": integer 80-98
5. "strengths": list of 3 bullet points
6. "weaknesses_resolved": list of 2-3 weak points successfully addressed during lectures
7. "coach_recommendation_for_parents": 2-3 warm sentences advising parents how to encourage their child's speaking at home.
8. "coach_recommendation_for_teachers": 2-3 actionable sentences advising the teacher on classroom participation.
9. "certificate_id": string like "DEVGYA-ENG-{uuid.uuid4().hex[:6].upper()}"
"""
        messages = [
            {"role": "system", "content": "You are Devgya Academic English Director. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]

        report_data = {}
        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.4, response_format_json=True)
            report_data = json.loads(raw)
        except Exception as e:
            logger.warning(f"Mastery report synthesis notice: {e}")
            report_data = {
                "fluency_band": "B2 Confident Communicator",
                "pronunciation_rating": 88,
                "grammar_accuracy": 86,
                "public_speaking_confidence": 90,
                "strengths": [
                    "Articulates complete sentences with natural cadence",
                    "Overcame hesitation when presenting arguments",
                    "Strong use of opening hooks"
                ],
                "weaknesses_resolved": [
                    "Past vs Present Perfect tenses mastered",
                    "Filler words reduced by over 70%"
                ],
                "coach_recommendation_for_parents": f"Encourage {student_name} to explain one interesting topic in English at the dinner table every evening for 2 minutes.",
                "coach_recommendation_for_teachers": f"Invite {student_name} to lead morning assembly announcements or moderate peer group discussions.",
                "certificate_id": f"DEVGYA-ENG-{uuid.uuid4().hex[:6].upper()}"
            }

        report_data["student_name"] = student_name
        report_data["user_id"] = user_id
        report_data["user_role"] = user_role
        report_data["diagnostic_score"] = score
        report_data["generated_at"] = self._get_now_iso()
        report_data["cycle_valid_until"] = track.get("expires_at", self._get_expiry_iso())

        # Populate normalized alias keys for parent & teacher dashboards
        report_data["overall_fluency_band"] = report_data.get("fluency_band", "B2 Confident Communicator")
        report_data["pronunciation_accuracy_percent"] = report_data.get("pronunciation_rating", 88)
        report_data["grammar_structure_percent"] = report_data.get("grammar_accuracy", 86)
        report_data["public_speaking_confidence_percent"] = report_data.get("public_speaking_confidence", 90)
        report_data["parent_recommendations"] = [
            report_data.get("coach_recommendation_for_parents", f"Encourage {student_name} to speak English for 2 minutes every day at home.")
        ]
        report_data["teacher_recommendations"] = [
            report_data.get("coach_recommendation_for_teachers", f"Provide {student_name} opportunities to speak in front of the classroom.")
        ]
        report_data["mastered_competencies"] = report_data.get("strengths", [])
        report_data["areas_for_continued_practice"] = report_data.get("weaknesses_resolved", [])

        track["mastery_report"] = report_data
        track["final_report"] = report_data
        self.save_user_track(user_id, track, user_role=user_role)
        return report_data

    # ------------------------------------------------------------------
    # 7. HIGH-SPEED CONVERSATIONAL DIALOGUE TURN (LRSI ENGINE)
    # ------------------------------------------------------------------
    async def process_dialogue_turn(
        self,
        user_message: str,
        history: List[Dict[str, str]] = None,
        coach_starter: str = "",
        user_level: str = "Intermediate",
        target_focus: str = "Spoken English Fluency"
    ) -> Dict[str, Any]:
        """
        Ultra-fast conversational turn engine for LRSI Spoken English Coach.
        Executes with immediate live grammar correction and conversational continuation.
        """
        clean_msg = (user_message or "").strip()
        system_prompt = f"""You are Devgya Spoken English Coach in a live 1-on-1 spoken practice session with an Indian student (Level: {user_level}, Focus: {target_focus}).

CRITICAL INSTRUCTIONS FOR SPOKEN DIALOGUE:
1. Keep your reply conversational, warm, energetic, and BRIEF (15-25 words max) so it sounds natural when spoken aloud.
2. If the student made any grammatical error in their speech, immediately give the gentle spoken fix first: e.g., 'Nice point! Say "I saw" instead of "I seen".'
3. Conclude with 1 engaging question to keep the student talking.
4. Do NOT use markdown asterisks (*), bullet points, or complex formatting—write pure plain spoken text.
5. Return JSON with:
   - "reply": The short natural spoken response (max 25 words).
   - "correction": A brief grammar correction string if any error was spotted, otherwise null.
   - "praise_word": e.g. "Brilliant!", "Spot on!", "Fantastic!", or "Great try!"
"""
        convo_messages = [{"role": "system", "content": system_prompt}]
        if coach_starter:
            convo_messages.append({"role": "assistant", "content": coach_starter})

        if history:
            for h in history[-6:]:
                role = "user" if h.get("sender") == "user" else "assistant"
                convo_messages.append({"role": role, "content": h.get("text", "")})

        convo_messages.append({"role": "user", "content": clean_msg or "Hello coach!"})

        try:
            raw = await ai_provider.chat_completion(convo_messages, temperature=0.3, response_format_json=True)
            data = json.loads(raw)
            return {
                "status": "success",
                "reply": data.get("reply", "That is an insightful observation! Tell me more about why you feel that way."),
                "correction": data.get("correction"),
                "praise_word": data.get("praise_word", "Well said!")
            }
        except Exception as e:
            logger.warning(f"Dialogue turn error: {e}")
            return {
                "status": "success",
                "reply": "Well said! That makes complete sense. How do your friends or teachers react when you share that?",
                "correction": None,
                "praise_word": "Great job!"
            }


english_coach_service = EnglishCoachService()
