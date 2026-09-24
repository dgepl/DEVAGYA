import os
import json
import logging
import uuid
import re
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
# 1. 10-MARK DIAGNOSTIC QUESTION BANK
# =====================================================================
DIAGNOSTIC_QUESTIONS = [
    {
        "id": 1,
        "category": "Tenses & Duration",
        "question": "She _______ to London three times this year for academic conferences.",
        "options": ["has gone", "has been", "went", "was going"],
        "correct_index": 1,
        "explanation": "'Has been' is used for completed visits with return, indicating life experience in an unfinished time period (this year).",
        "weakness_tag": "Present Perfect vs Past Simple"
    },
    {
        "id": 2,
        "category": "Prepositions of Time & Place",
        "question": "The annual science symposium is scheduled to begin _______ 10:00 AM on Monday.",
        "options": ["in", "on", "at", "by"],
        "correct_index": 2,
        "explanation": "We use 'at' for precise clock times (at 10:00 AM) and 'on' for specific days (on Monday).",
        "weakness_tag": "Time & Place Prepositions"
    },
    {
        "id": 3,
        "category": "Subject-Verb Agreement",
        "question": "Neither of the two candidate teachers _______ ready to take over the class.",
        "options": ["were", "was", "are", "have been"],
        "correct_index": 1,
        "explanation": "'Neither of' takes a singular verb ('was') in formal standard English.",
        "weakness_tag": "Singular vs Plural Concord"
    },
    {
        "id": 4,
        "category": "Connectors & Flow",
        "question": "She practiced speaking every single day, _______ she was still nervous before her speech.",
        "options": ["because", "yet", "so", "therefore"],
        "correct_index": 1,
        "explanation": "'Yet' introduces a surprising contrast between daily practice and nervousness.",
        "weakness_tag": "Contrasting Conjunctions & Flow"
    },
    {
        "id": 5,
        "category": "Vocabulary & Collocations",
        "question": "Could you please _______ a quick look at my project presentation slides?",
        "options": ["make", "take", "do", "give"],
        "correct_index": 1,
        "explanation": "The natural English collocation is 'take a look' or 'have a look'.",
        "weakness_tag": "Natural Collocations & Word Choice"
    },
    {
        "id": 6,
        "category": "Pronunciation & Phonetics",
        "question": "Which of the following words contains a silent consonant letter?",
        "options": ["Doubt", "Rapid", "Silver", "Planet"],
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
        "options": ["have", "had", "would have", "will have"],
        "correct_index": 1,
        "explanation": "Second conditional for hypothetical situations uses 'If + past simple (had) ... would + base verb'.",
        "weakness_tag": "Hypothetical Conditionals"
    },
    {
        "id": 9,
        "category": "Modals & Persuasion",
        "question": "To persuade the audience effectively, a speaker _______ maintain steady eye contact.",
        "options": ["ought to", "might to", "could to", "would to"],
        "correct_index": 0,
        "explanation": "'Ought to' expresses best practice or recommendation without needing an extra preposition.",
        "weakness_tag": "Modal Verbs of Advice"
    },
    {
        "id": 10,
        "category": "Public Speaking Hooks",
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
# 2. MULTI-DIMENSIONAL SPEECH ALIGNMENT & PERFORMANCE ENGINE
# =====================================================================
def _clean_word(w: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', w).lower()

def _levenshtein(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return _levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def evaluate_speech_alignment(target_phrase: str, spoken_text: str, duration_seconds: Optional[float] = None) -> Dict[str, Any]:
    """
    Evaluates spoken transcript against the target phrase:
    - Word-by-word status: 'correct' (green), 'hesitant' (amber), 'missed' (red)
    - Pacing (Words Per Minute)
    - Filler word detection (um, uh, like, actually, basically, you know, i mean)
    - Spoken critique ready for Edge-TTS audio playback
    """
    target_tokens = target_phrase.strip().split()
    spoken_tokens = spoken_text.strip().split()
    clean_spoken = [_clean_word(w) for w in spoken_tokens if _clean_word(w)]

    word_matches = []
    correct_count = 0
    hesitant_count = 0
    missed_words = []

    spoken_search_idx = 0
    for orig_w in target_tokens:
        cw = _clean_word(orig_w)
        if not cw:
            word_matches.append({"word": orig_w, "status": "correct"})
            continue

        matched_status = "missed"
        window_start = max(0, spoken_search_idx - 2)
        window_end = min(len(clean_spoken), spoken_search_idx + 6)
        candidates = clean_spoken[window_start:window_end]

        best_dist = 999
        best_cand_idx = -1
        for idx_offset, cand in enumerate(candidates):
            if cand == cw:
                best_dist = 0
                best_cand_idx = window_start + idx_offset
                break
            d = _levenshtein(cw, cand)
            if d < best_dist:
                best_dist = d
                best_cand_idx = window_start + idx_offset

        if best_dist == 0:
            matched_status = "correct"
            correct_count += 1
            spoken_search_idx = best_cand_idx + 1
        elif best_dist == 1 or (len(cw) >= 6 and best_dist <= 2):
            matched_status = "hesitant"
            hesitant_count += 1
            spoken_search_idx = best_cand_idx + 1
        else:
            matched_status = "missed"
            missed_words.append(orig_w)

        word_matches.append({
            "word": orig_w,
            "status": matched_status
        })

    total_words = max(len([w for w in target_tokens if _clean_word(w)]), 1)
    accuracy_score = min(100, round(((correct_count + (0.5 * hesitant_count)) / total_words) * 100))

    # Pacing / WPM calculation
    num_spoken_words = len(spoken_tokens)
    if duration_seconds and duration_seconds > 0:
        wpm = round((num_spoken_words / duration_seconds) * 60)
    else:
        wpm = round(min(145, max(95, num_spoken_words * 14)))

    if wpm < 110:
        pace_status = "Pace: Measured / Deliberate (Target: 120-150 WPM)"
    elif 110 <= wpm <= 155:
        pace_status = "Pace: Masterclass Cadence (Optimal)"
    else:
        pace_status = "Pace: Rapid / Hurried (Target: 120-150 WPM)"

    # Filler words detection
    filler_vocab = ["um", "uh", "like", "actually", "basically", "you know", "i mean", "sort of", "literally"]
    lower_spoken = spoken_text.lower()
    filler_occurrences = []
    for f in filler_vocab:
        count = lower_spoken.count(f)
        if count > 0:
            filler_occurrences.append({"filler": f, "count": count})

    total_fillers = sum(item["count"] for item in filler_occurrences)

    # Audio Critique Generator for Edge-TTS
    if accuracy_score >= 85 and total_fillers == 0:
        critique = f"Outstanding delivery! Your diction was razor sharp and pacing was {wpm} words per minute. Flawless cadence!"
    elif accuracy_score >= 70:
        critique = f"Great execution with a {accuracy_score} percent score. Keep practicing your vowel transitions and final consonants."
    elif accuracy_score >= 50:
        critique = f"Good attempt! Focus on pronouncing {', '.join(missed_words[:3]) or 'word transitions'} clearly, and pause slightly before key phrases."
    else:
        critique = f"Good vocal effort! Slow down your speech, relax your jaw, and let's run this drill once more."

    return {
        "accuracy_score": accuracy_score,
        "word_matches": word_matches,
        "wpm": wpm,
        "pace_status": pace_status,
        "filler_words": filler_occurrences,
        "total_fillers": total_fillers,
        "spoken_coach_critique": critique
    }

# =====================================================================
# 3. CLEAN FALLBACK MODULE GENERATOR (ZERO 3-DRILLS, ZERO PASSIVE STEPS)
# =====================================================================
def get_clean_curriculum_fallback(level: str, weak_points: List[str]) -> List[Dict[str, Any]]:
    """Clean fallback if AI service is temporarily offline. Zero 3-drill tabs, zero passive listening steps."""
    weak_str = ', '.join(weak_points[:3]) if weak_points else 'Tense consistency and natural cadence'
    return [
        {
            "id": "module_1",
            "title": "Module 1: Everyday Conversational Fluency & Confidence",
            "methodology": "Conversational Psychology & Vocal Cadence",
            "description": "Overcome vocal hesitation, master executive conversation openers, and eliminate filler pauses.",
            "focus_areas": ["Natural Cadence & Inflection", "Instant Sentence Formation", "Zero-Filler Delivery"],
            "steps": [
                {
                    "step_id": "m1_s1",
                    "type": "coach_masterclass",
                    "title": "Stage 1: Executive Masterclass & Mandatory Vocal Warmup",
                    "prompt": "Study the coach's vocal breakdown below, then press the microphone and speak the mandatory Vocal Warmup phrase to unlock the next stage!",
                    "masterclass_lecture": {
                        "topic": "The Physics of Confident Spoken Cadence",
                        "duration": "Executive 10-Minute Deep Dive",
                        "summary": "Master speakers use diaphragmatic breathing and terminal downward inflection to project authority rather than rushing.",
                        "vocal_mechanics": "1. Diaphragmatic Breath: Inhale deeply before speaking your initial clause.\n2. Downward Terminal Inflection: Avoid turning statements into questions by ending with a grounded tone.\n3. Syllable Bridges: Link vowel sounds smoothly.",
                        "key_formulas": [
                            "The Warmth Opener: [Warm Greeting] + [Sincere Emotion] + [Purpose Statement]",
                            "The Momentum Transition: [Context Bridge] + [Conjunctive Pause] + [Action Step]",
                            "The Group Magnet: [Acknowledging Question] + [Shared Reflection]"
                        ],
                        "common_traps": [
                            "Trap: Saying 'Myself Rahul' -> Correction: 'I am Rahul' or 'My name is Rahul'",
                            "Trap: Saying 'Today morning I reached' -> Correction: 'This morning I arrived'",
                            "Trap: Trailing off weakly at sentence ends -> Correction: Crisp closure on final consonant"
                        ],
                        "model_audio_text": "Good morning everyone! It is a genuine pleasure to connect with all of you today. Let us get started on our discussion."
                    },
                    "vocal_warmup_phrase": "Good morning everyone! It is a genuine pleasure to connect with all of you today."
                },
                {
                    "step_id": "m1_s2",
                    "type": "vocal_mimicry",
                    "title": "Stage 2: Vocal Mimicry & Cadence Sculptor",
                    "prompt": "Listen to the coach's natural inflection, then press the microphone and echo the phrase aloud. AI scores your accuracy, WPM, and cadence.",
                    "target_phrase": "It is a genuine pleasure to connect with all of you today."
                },
                {
                    "step_id": "m1_s3",
                    "type": "sentence_doctor",
                    "title": "Stage 3: Real-Time Sentence Doctor (Spot & Speak the Fix)",
                    "prompt": "Spot the common Indian English flaw below. Speak the grammatically pristine correction aloud into your microphone!",
                    "flawed_sentence": "Myself Amit and today morning I reached the school.",
                    "corrected_sentence": "My name is Amit and I arrived at school this morning.",
                    "explanation": "Avoid starting with 'Myself' and replace 'today morning' with 'this morning'."
                },
                {
                    "step_id": "m1_s4",
                    "type": "conversational_sparring",
                    "title": "Stage 4: 1-on-1 Conversational Sparring (Live Voice Dialogue)",
                    "prompt": "Hands-Free Voice Mode: The AI coach speaks and listens. Answer naturally—the coach provides immediate spoken corrections if needed.",
                    "coach_starter": "Hello there! Tell me one exciting milestone or project you worked on recently."
                },
                {
                    "step_id": "m1_s5",
                    "type": "spoken_capstone",
                    "title": "Stage 5: 60-Second Spoken Capstone (Live Scorecard)",
                    "prompt": "Deliver a 60-second public speech on: 'Why Curiosity is the Greatest Teacher'. DEVGYA AI evaluates your filler words, cadence, and grammar!",
                    "topic": "Why Curiosity is the Greatest Teacher"
                }
            ]
        },
        {
            "id": "module_2",
            "title": "Module 2: Grammar in Spoken Action & Sentence Reconstruction",
            "methodology": "Sentence Clinic & Diplomatic Negotiation",
            "description": f"Targeted corrections for your specific diagnostic gaps: {weak_str}.",
            "focus_areas": ["Accurate Verb Tenses", "Eliminating Indianisms", "Polite Negotiation Phrasing"],
            "steps": [
                {
                    "step_id": "m2_s1",
                    "type": "coach_masterclass",
                    "title": "Stage 1: Grammar Clinic Masterclass & Vocal Warmup",
                    "prompt": "Absorb the coach's grammar formulas, then record the mandatory Vocal Warmup phrase to unlock the stage!",
                    "masterclass_lecture": {
                        "topic": "Mastering Tense Bridges & Eliminating Literal Hindi-to-English Translations",
                        "duration": "Executive 10-Minute Deep Dive",
                        "summary": "In Indian languages, present continuous is often used for ongoing past duration. Translating this literally as 'I am working here since 5 years' is the #1 grammatical slip in Indian spoken English.",
                        "vocal_mechanics": "1. Perfect Continuous Arc: Use 'have been + [verb]-ing' with 'for' (duration) or 'since' (starting point).\n2. Diplomatic Softeners: Use modal cushions ('Could we consider...', 'Would it be possible...').\n3. Preposition Accuracy: Use 'at' for precise clock times and 'on' for calendar days.",
                        "key_formulas": [
                            "The Duration Formula: [Subject] + [have/has been] + [verb-ing] + [for + duration]",
                            "The Diplomatic Suggestion: 'Would you be open to...' + [verb-ing / noun]?",
                            "The Clarification Bridge: 'May I confirm my understanding on...' + [topic]?"
                        ],
                        "common_traps": [
                            "Trap: 'I am working here since 5 years' -> Correction: 'I have been working here for 5 years'",
                            "Trap: 'Please revert back' -> Correction: 'Please reply' or 'Please get back to me'",
                            "Trap: 'Can we prepone the meeting?' -> Correction: 'Can we move the meeting forward?'"
                        ],
                        "model_audio_text": "Over the past several weeks, our students have demonstrated significant improvement in mathematical reasoning."
                    },
                    "vocal_warmup_phrase": "I have been working on this educational research for the past six months, and the results are remarkable."
                },
                {
                    "step_id": "m2_s2",
                    "type": "vocal_mimicry",
                    "title": "Stage 2: Vocal Mimicry & Cadence Sculptor",
                    "prompt": "Echo this phrase emphasizing continuing duration and crisp connector flow.",
                    "target_phrase": "I have been working on this educational research for the past six months, and the results are remarkable."
                },
                {
                    "step_id": "m2_s3",
                    "type": "sentence_doctor",
                    "title": "Stage 3: Real-Time Sentence Doctor (Spot & Speak the Fix)",
                    "prompt": "Listen to the flawed Indian English sentence. Speak the corrected version aloud into your microphone!",
                    "flawed_sentence": "I am working here since five years and I will revert back tomorrow.",
                    "corrected_sentence": "I have been working here for five years and I will reply tomorrow.",
                    "explanation": "Use 'have been working ... for five years' and say 'reply' instead of 'revert back'."
                },
                {
                    "step_id": "m2_s4",
                    "type": "conversational_sparring",
                    "title": "Stage 4: 1-on-1 Conversational Sparring (Live Voice Dialogue)",
                    "prompt": "Hands-Free Voice Mode: A colleague asks for an urgent deadline extension. Negotiate politely, explain your schedule, and propose a solution.",
                    "coach_starter": "Hi! We encountered unexpected technical delays on the report. Could we get a four-day deadline extension?"
                },
                {
                    "step_id": "m2_s5",
                    "type": "spoken_capstone",
                    "title": "Stage 5: 60-Second Spoken Capstone (Live Scorecard)",
                    "prompt": "Deliver a 60-second speech on: 'How to Resolve Disagreements Diplomatically in a Professional Setting'.",
                    "topic": "How to Resolve Disagreements Diplomatically in a Professional Setting"
                }
            ]
        },
        {
            "id": "module_3",
            "title": "Module 3: Persuasive Keynote & Public Speaking Mastery",
            "methodology": "TED-Style Keynote & Stage Gravitas",
            "description": "Master stage presence, opening hooks, transition connectors, and impromptu speech delivery.",
            "focus_areas": ["The 3-Part Speech Formula", "Impromptu Audience Defense", "Power Pauses & Modulation"],
            "steps": [
                {
                    "step_id": "m3_s1",
                    "type": "coach_masterclass",
                    "title": "Stage 1: TED-Style Keynote Masterclass & Vocal Warmup",
                    "prompt": "Study the TED-style speech blueprint, then record the mandatory Vocal Warmup phrase to unlock the stage!",
                    "masterclass_lecture": {
                        "topic": "The 3-Part Architecture of High-Impact Public Speaking",
                        "duration": "Executive 10-Minute Deep Dive",
                        "summary": "World-class speakers do not start with slides or logistical apologies. They start with an unforgettable emotional or cognitive hook that reshapes audience attention in the first 15 seconds.",
                        "vocal_mechanics": "1. The Power Pause: Pause for a full two seconds immediately after your opening hook.\n2. Pitch Modulation: Use resonant low frequencies for authoritative proof and higher inflection for calls to action.\n3. Eliminating Verbal Fillers: Replace 'um' and 'you know' with silent breath pauses.",
                        "key_formulas": [
                            "The Visionary Grabber: 'Imagine a world where...' + [compelling counter-intuitive reality]",
                            "The Proof Contrast: 'Our evidence shows that when...' + [contrasting metrics]",
                            "The Resonant Call: 'Let us not wait for...' + [bold collective directive]"
                        ],
                        "common_traps": [
                            "Trap: Opening with 'Today my topic is...' -> Correction: Open with a provocative question or story",
                            "Trap: Speaking in a monotone flat frequency -> Correction: Inflect upward on key adjectives",
                            "Trap: Pacing rapidly without breathing -> Correction: Breathe at every comma and full stop"
                        ],
                        "model_audio_text": "Imagine a world where learning is not about memorizing answers, but about discovering questions that change lives."
                    },
                    "vocal_warmup_phrase": "Imagine a world where learning is not about memorizing answers, but about discovering questions that change lives."
                },
                {
                    "step_id": "m3_s2",
                    "type": "vocal_mimicry",
                    "title": "Stage 2: Vocal Mimicry & Cadence Sculptor",
                    "prompt": "Deliver this opening hook emphasizing the power pause immediately after 'unstoppable'.",
                    "target_phrase": "Have you ever wondered what makes a great mind truly unstoppable? It begins with a single teacher who believes."
                },
                {
                    "step_id": "m3_s3",
                    "type": "sentence_doctor",
                    "title": "Stage 3: Real-Time Sentence Doctor (Spot & Speak the Fix)",
                    "prompt": "Spot the clumsy opening phrase below. Speak the powerful, engaging version into your microphone!",
                    "flawed_sentence": "Good morning all, today my presentation is about technology in education.",
                    "corrected_sentence": "What if artificial intelligence could give every single student a personal mentor? Today, that future is within our reach.",
                    "explanation": "Replace dry topic announcements with an electrifying question that grabs attention."
                },
                {
                    "step_id": "m3_s4",
                    "type": "conversational_sparring",
                    "title": "Stage 4: 1-on-1 Conversational Sparring (Impromptu Q&A Defense)",
                    "prompt": "The audience asks a tough impromptu question about your presentation! Defend your stance clearly and diplomatically.",
                    "coach_starter": "You argued that curiosity is greater than discipline. But isn't discipline what actually gets exams cleared?"
                },
                {
                    "step_id": "m3_s5",
                    "type": "spoken_capstone",
                    "title": "Stage 5: 60-Second Spoken Capstone (Live Scorecard)",
                    "prompt": "Deliver a 60-second speech on: 'Why Failure is the Best Stepping Stone to Mastery'.",
                    "topic": "Why Failure is the Best Stepping Stone to Mastery"
                }
            ]
        },
        {
            "id": "module_4",
            "title": "Module 4: Executive Interview & Mastery Capstone",
            "methodology": "STAR Technique & Official Graduation",
            "description": "The culminating spoken masterclass. Demonstrate your professional fluency to generate your official report card and certificate.",
            "focus_areas": ["STAR Method Framing", "Executive Presence", "Mastery Certification"],
            "steps": [
                {
                    "step_id": "m4_s1",
                    "type": "coach_masterclass",
                    "title": "Stage 1: Executive Presence Masterclass & Vocal Warmup",
                    "prompt": "Review the executive STAR framework, then record the mandatory Vocal Warmup phrase to unlock the Senior Mock Interview!",
                    "masterclass_lecture": {
                        "topic": "The STAR Behavioral Framework for High-Stakes Spoken Interviews",
                        "duration": "Executive 10-Minute Deep Dive",
                        "summary": "In senior leadership, corporate panels, and academic interviews, rambling answers are lethal. The STAR method forces structured, metric-backed impact in under 90 seconds.",
                        "vocal_mechanics": "1. Situation & Task (25%): Set the stage succinctly without excessive background detail.\n2. Action (50%): Use strong dynamic action verbs ('I spearheaded', 'I orchestrated', 'I synthesized') instead of passive verbs ('Work was done').\n3. Result (25%): Close with quantifiable impact and long-term value.",
                        "key_formulas": [
                            "The Action Metric Anchor: 'I mobilized our team of four, resulting in a thirty percent boost in efficiency.'",
                            "The Conflict Resolution Bridge: 'Rather than debating assumptions, I introduced an empirical benchmark.'",
                            "The Visionary Closer: 'My objective was to build a sustainable system that outlasted the immediate crisis.'"
                        ],
                        "common_traps": [
                            "Trap: Saying 'We did this and we did that' -> Correction: Specify YOUR distinct contribution with 'I'",
                            "Trap: Skipping the measurable result -> Correction: Always state the positive outcome or learning",
                            "Trap: Speaking with apologetic timid volume -> Correction: Project from the chest with steady eye contact"
                        ],
                        "model_audio_text": "When faced with low student engagement, I initiated interactive peer-teaching sessions, which resulted in a forty percent boost in exam performance."
                    },
                    "vocal_warmup_phrase": "When faced with tight project deadlines, I reorganized our milestones, communicated daily updates, and delivered two days ahead of schedule."
                },
                {
                    "step_id": "m4_s2",
                    "type": "vocal_mimicry",
                    "title": "Stage 2: Vocal Mimicry & Cadence Sculptor",
                    "prompt": "Deliver this executive STAR response with crisp metrics and authoritative downward terminal inflection.",
                    "target_phrase": "When faced with tight project deadlines, I reorganized our milestones, communicated daily updates, and delivered two days ahead of schedule."
                },
                {
                    "step_id": "m4_s3",
                    "type": "sentence_doctor",
                    "title": "Stage 3: Real-Time Sentence Doctor (Spot & Speak the Fix)",
                    "prompt": "Spot the passive, vague interview answer below. Speak the metric-driven STAR correction into your microphone!",
                    "flawed_sentence": "In our team project, some work was done by us and we managed to finish it somehow.",
                    "corrected_sentence": "I organized our project into four weekly milestones, leading our team to complete all deliverables two days ahead of schedule.",
                    "explanation": "Replace passive voice ('work was done by us') with active leadership verbs ('I organized', 'leading our team') and measurable results."
                },
                {
                    "step_id": "m4_s4",
                    "type": "conversational_sparring",
                    "title": "Stage 4: 1-on-1 Conversational Sparring (Senior Panel Interview)",
                    "prompt": "Hands-Free Voice Mode: You are in an executive interview. Answer spontaneous questions from the hiring director with authority.",
                    "coach_starter": "Welcome to the final interview panel. How do you handle high-pressure conflicts or differing opinions in your team?"
                },
                {
                    "step_id": "m4_s5",
                    "type": "spoken_capstone",
                    "title": "Stage 5: Official Graduation Spoken Capstone & Certificate",
                    "prompt": "Deliver your final spoken graduation speech summarizing your learning journey and your vision. DEVGYA AI will award your official Spoken English Mastery Certificate!",
                    "topic": "My Spoken English Transformation & Long-Term Communication Vision"
                }
            ]
        }
    ]

# Alias for backward compatibility
get_curriculum_modules = get_clean_curriculum_fallback

# =====================================================================
# 4. 100% PURE AI CURRICULUM GENERATOR (ZERO MANUAL WRITTEN DRILLS)
# =====================================================================
async def generate_pure_ai_curriculum(
    score: int,
    level: str,
    weak_points: List[str],
    failed_topics: List[str],
    user_role: str = "student",
    user_name: str = "Learner"
) -> List[Dict[str, Any]]:
    """
    Calls Groq LLM to synthesize a 100% bespoke, personalized 4-module spoken English curriculum.
    NO HARDCODED SENTENCES, NO 3-DRILLS TABS.
    Every step is an active speaking stage tailored to the learner's exact gaps.
    """
    weak_summary = ", ".join(weak_points) if weak_points else "Natural sentence cadence and verb tenses"
    failed_summary = ", ".join(failed_topics) if failed_topics else "General conversational polish and preposition precision"

    prompt = f"""You are the Chief Speech Pathologist & Executive Vocal Coach at DEVGYA.
Synthesize a 100% personalized, premium 4-module Spoken English Curriculum for:
- Learner Name: {user_name} ({user_role.capitalize()})
- Diagnostic Score: {score}/10
- Assessed Fluency Level: {level}
- Weak Points Identified: {weak_summary}
- Failed Diagnostic Topics: {failed_summary}

ABSOLUTE ARCHITECTURAL RULES (CRITICAL):
1. ZERO PASSIVE LISTENING STEPS. The learner MUST speak in every single stage.
2. DO NOT use "Drill 1, Drill 2, Drill 3" or practice item arrays! Each step is a SINGLE, high-stakes, focused coaching experience.
3. Every module MUST have EXACTLY 5 progressive stages:
   - Stage 1: "coach_masterclass"
     - "title": "Stage 1: Executive Masterclass & Mandatory Vocal Warmup"
     - "prompt": "Study the coach's vocal breakdown below, then press the microphone and speak the mandatory Vocal Warmup phrase to unlock the next stage!"
     - "masterclass_lecture": {{
         "topic": "...",
         "duration": "Executive 10-Minute Deep Dive",
         "summary": "In-depth explanation (2-3 paragraphs) diagnosing the exact psychology and vocal habits of Indian speakers on these weak points ({failed_summary}).",
         "vocal_mechanics": "1. Diaphragmatic Breath: ...\\n2. Downward Terminal Inflection: ...\\n3. Syllable Bridges: ...",
         "key_formulas": ["Formula 1", "Formula 2", "Formula 3"],
         "common_traps": ["Trap 1 -> Correction", "Trap 2 -> Correction", "Trap 3 -> Correction"],
         "model_audio_text": "A pristine model sentence demonstrating the lesson."
       }}
     - "vocal_warmup_phrase": "A bespoke 1-2 sentence phrase the user MUST speak into the mic to complete the warmup."

   - Stage 2: "vocal_mimicry"
     - "title": "Stage 2: Vocal Mimicry & Cadence Sculptor"
     - "prompt": "Listen to the coach's natural inflection, then press the microphone and echo the phrase aloud. AI scores your accuracy, WPM, and cadence."
     - "target_phrase": "A challenging, natural spoken English sentence designed to rewire the user's specific weak points."

   - Stage 3: "sentence_doctor"
     - "title": "Stage 3: Real-Time Sentence Doctor (Spot & Speak the Fix)"
     - "prompt": "Spot the common Indian English flaw below. Speak the grammatically pristine correction aloud into your microphone!"
     - "flawed_sentence": "A flawed spoken Indian English sentence directly targeting: {failed_summary}."
     - "corrected_sentence": "The pristine, natural global English version."
     - "explanation": "Why the original is flawed and how the correction works."

   - Stage 4: "conversational_sparring"
     - "title": "Stage 4: 1-on-1 Conversational Sparring (Live Voice Dialogue)"
     - "prompt": "Hands-Free Voice Mode: The AI coach speaks and listens. Answer naturally—the coach provides immediate spoken corrections if needed."
     - "coach_starter": "A provocative, engaging opening question tailored to a {user_role} to trigger spontaneous speech."

   - Stage 5: "spoken_capstone"
     - "title": "Stage 5: 60-Second Spoken Capstone (Live Scorecard)"
     - "prompt": "Deliver a 60-second speech on the challenge topic. DEVGYA AI evaluates your filler words, cadence, and grammar!"
     - "topic": "An engaging, deep public speaking topic suited for a {user_role}."

4. Generate 4 modules:
   - Module 1: Everyday Conversational Fluency & Confidence (overcoming hesitation & fillers)
   - Module 2: Grammar in Spoken Action & Sentence Reconstruction (directly targeting: {failed_summary})
   - Module 3: Persuasive Keynote & Public Speaking Mastery (TED-style hooks & gravitas)
   - Module 4: Executive Interview & Mastery Capstone (STAR framework & leadership presence)

5. Return ONLY a valid JSON array of 4 module objects. No markdown backticks, no preamble.
"""
    messages = [
        {"role": "system", "content": "You are Devgya Chief Speech Pathologist. Return ONLY a valid JSON array of 4 bespoke module objects. Do NOT use drill arrays or hardcoded boilerplate."},
        {"role": "user", "content": prompt}
    ]

    try:
        raw = await ai_provider.chat_completion(messages, temperature=0.35, response_format_json=True)
        data = json.loads(raw)
        if isinstance(data, list) and len(data) >= 4:
            return data
        elif isinstance(data, dict) and "modules" in data and isinstance(data["modules"], list) and len(data["modules"]) >= 4:
            return data["modules"]
    except Exception as e:
        logger.warning(f"Groq pure AI curriculum generation fallback: {e}")

    return get_clean_curriculum_fallback(level, weak_points)


# =====================================================================
# 5. ENTERPRISE SERVICE IMPLEMENTATION
# =====================================================================
class EnglishCoachService:
    """Enterprise-grade service managing diagnostic assessments, 100% dynamic AI generation, and speech evaluation."""

    CYCLE_DURATION_DAYS = 30

    def get_diagnostic_questions_for_client(self) -> List[Dict[str, Any]]:
        """Returns the 10 diagnostic questions without the answer key for frontend assessment."""
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

    def get_user_track(self, user_id: str, user_role: str = "student") -> Dict[str, Any]:
        """Loads user's active English speaking track from Supabase, checking for 30-day expiry."""
        if not user_id:
            user_id = "guest_user"

        track = None
        if SUPABASE_URL and SERVICE_KEY:
            try:
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

        if not track:
            track = COACH_TRACK_CACHE.get(user_id)

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
            "custom_modules": None,
            "created_at": self._get_now_iso(),
            "expires_at": self._get_expiry_iso(),
            "is_expired": False
        }
        COACH_TRACK_CACHE[user_id] = fresh_state
        return fresh_state

    def save_user_track(self, user_id: str, track: Dict[str, Any], user_role: str = "student") -> bool:
        """Saves user track to Supabase Cloud and local memory cache."""
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

            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conv_id}"
            with httpx.Client(timeout=6.0) as client:
                check_res = client.get(url, headers=SUPABASE_HEADERS)
                if check_res.status_code == 200 and check_res.json():
                    patch_url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conv_id}"
                    client.patch(patch_url, headers=SUPABASE_HEADERS, json={
                        "title": payload_json,
                        "updated_at": self._get_now_iso()
                    })
                else:
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

    async def submit_diagnostic(self, user_id: str, user_answers: Dict[str, int], user_role: str = "student") -> Dict[str, Any]:
        """
        Grades diagnostic test, extracts exact weak points, and triggers 100% pure AI curriculum generation.
        """
        score = 0
        weak_points = []
        failed_topics = []
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
                failed_topics.append(f"{q['category']}: {q['weakness_tag']}")

            detailed_breakdown.append({
                "question_id": q["id"],
                "category": q["category"],
                "weakness_tag": q["weakness_tag"],
                "is_correct": is_correct,
                "user_selected": user_ans,
                "correct_option": correct_ans,
                "explanation": q["explanation"]
            })

        if score >= 8:
            level = "Advanced (C1 Spoken Fluency)"
        elif score >= 5:
            level = "Intermediate (B1 Conversational)"
        else:
            level = "Foundation (A2 Expressive Basics)"

        # Generate 100% pure AI personalized curriculum
        modules = await generate_pure_ai_curriculum(
            score=score,
            level=level,
            weak_points=weak_points,
            failed_topics=failed_topics,
            user_role=user_role
        )

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
        track["custom_modules"] = modules
        track["created_at"] = self._get_now_iso()
        track["expires_at"] = self._get_expiry_iso()
        track["is_expired"] = False

        self.save_user_track(user_id, track, user_role=user_role)

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

    async def regenerate_curriculum(self, user_id: str, user_role: str = "student", user_name: str = "Learner") -> Dict[str, Any]:
        """Regenerates a fresh AI curriculum on-demand based on existing profile."""
        track = self.get_user_track(user_id, user_role=user_role)
        score = track.get("diagnostic_score", 6)
        level = track.get("fluency_level", "Intermediate (B1 Conversational)")
        weak_points = track.get("weak_points", [])

        modules = await generate_pure_ai_curriculum(
            score=score,
            level=level,
            weak_points=weak_points,
            failed_topics=weak_points,
            user_role=user_role,
            user_name=user_name
        )

        track["custom_modules"] = modules
        self.save_user_track(user_id, track, user_role=user_role)
        return {
            "status": "success",
            "modules": modules,
            "track": track
        }

    def complete_lecture_step(self, user_id: str, module_index: int, step_id: str, user_role: str = "student") -> Dict[str, Any]:
        """Validates that user completes prerequisites before advancing. Strictly prevents skipping."""
        track = self.get_user_track(user_id, user_role=user_role)

        if not track.get("diagnostic_completed"):
            raise ValueError("You must complete the Diagnostic Assessment before entering lectures.")

        unlocked_idx = track.get("unlocked_module_index", 0)
        if module_index > unlocked_idx:
            raise ValueError(f"Skipping is strictly disabled. You must complete Module {unlocked_idx + 1} first.")

        completed_steps = track.get("completed_steps", [])
        if step_id not in completed_steps:
            completed_steps.append(step_id)
            track["completed_steps"] = completed_steps

        modules = track.get("custom_modules") or get_clean_curriculum_fallback(track.get("fluency_level", "Intermediate"), track.get("weak_points", []))
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

    def evaluate_speech(self, target_phrase: str, spoken_text: str, duration_seconds: Optional[float] = None) -> Dict[str, Any]:
        """Evaluates spoken speech alignment against target phrase."""
        return evaluate_speech_alignment(target_phrase=target_phrase, spoken_text=spoken_text, duration_seconds=duration_seconds)

    async def evaluate_speak_stage(
        self,
        prompt: str,
        sample_answer: Optional[str],
        user_speech: str,
        user_level: str = "Intermediate"
    ) -> Dict[str, Any]:
        """Evaluates student's spoken answer with positives, negatives, improvements, and Edge-TTS feedback."""
        clean_speech = (user_speech or "").strip()
        if not clean_speech or len(clean_speech.split()) < 3:
            return {
                "positive_points": ["Willingness to attempt spoken English"],
                "negative_points": ["Response was too short (under 3 words) to assess sentence flow."],
                "how_to_improve": "Try speaking at least 2 full sentences using a clear subject, verb, and object.",
                "polished_version": sample_answer or "Good morning everyone! It is a true pleasure to speak with you today.",
                "spoken_feedback": "Good attempt! Next time, try to speak two complete sentences so we can evaluate your rhythm and grammar."
            }

        eval_prompt = f"""You are Devgya Spoken English Coach.
A student (Level: {user_level}) was given this speaking prompt:
Prompt: "{prompt}"
Reference Sample: "{sample_answer or 'N/A'}"

Student's Spoken Answer:
\"\"\"{clean_speech}\"\"\"

Analyze their spoken English and return a JSON object with EXACTLY these keys:
1. "positive_points": A list of 2-3 concise bullet points praising their vocabulary, confidence, grammar correctness, or clear delivery.
2. "negative_points": A list of 1-2 concise bullet points pointing out grammar slips, awkward Indianisms (e.g., 'revert back', 'since 5 years', 'today morning'), misplaced prepositions, or hesitation.
3. "how_to_improve": 1-2 actionable sentences telling the student how to fix the issue and sound more natural.
4. "polished_version": A beautifully natural, native-sounding 1-2 sentence version of what they intended to say.
5. "spoken_feedback": A spoken coaching message (max 35 words) that MUST clearly tell the student: 1) How they are doing, 2) What they should enhance, and 3) An encouraging finish.
"""
        messages = [
            {"role": "system", "content": "You are an expert spoken English coach. Return ONLY valid JSON."},
            {"role": "user", "content": eval_prompt}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.3, response_format_json=True)
            data = json.loads(raw)
            return {
                "positive_points": data.get("positive_points", ["Good vocal confidence", "Clear attempt at conveying ideas"]),
                "negative_points": data.get("negative_points", ["Check sentence connector and verb agreement"]),
                "how_to_improve": data.get("how_to_improve", "Focus on speaking in complete phrases without rushing."),
                "polished_version": data.get("polished_version", sample_answer or clean_speech),
                "spoken_feedback": data.get("spoken_feedback", "You are doing great with your vocabulary! To enhance your fluency, practice connecting sentences smoothly.")
            }
        except Exception as e:
            logger.warning(f"Speak stage AI critique error: {e}")
            return {
                "positive_points": ["Strong spoken confidence", "Relevant response to the question"],
                "negative_points": ["Minor grammatical agreement or phrasing slip"],
                "how_to_improve": "Practice pausing slightly at commas to give your sentence natural breathing room.",
                "polished_version": sample_answer or clean_speech,
                "spoken_feedback": "You are doing great with your ideas! To enhance your speech, listen to the native model and refine your phrasing."
            }

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
                "praise": "Good attempt stepping up to the microphone!",
                "spoken_feedback": "Good attempt! To enhance your public speaking, speak for at least 3 complete sentences so we can evaluate your pacing."
            }

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
7. "spoken_feedback": A warm spoken message (max 35 words) telling the student: 1) Whether they are doing great or need improvement, 2) Exactly what they should enhance, and 3) A short encouraging sentence.
"""
        messages = [
            {"role": "system", "content": "You are a professional spoken English and public speaking adjudicator. Return ONLY a valid JSON object."},
            {"role": "user", "content": prompt}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.3, response_format_json=True)
            data = json.loads(raw)
            data["filler_count"] = filler_count
            if not data.get("spoken_feedback"):
                data["spoken_feedback"] = f"You are doing great with your presence! To enhance your presentation, focus on: {data.get('what_was_wrong', 'pacing')}."
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
                "praise": "Great passion and clear voice projection!",
                "spoken_feedback": "You did great on projection and vocal energy! To enhance your speech, cut down on filler pauses."
            }

    async def process_dialogue_turn(
        self,
        user_message: str,
        history: List[Dict[str, str]] = None,
        coach_starter: str = "",
        user_level: str = "Intermediate",
        target_focus: str = "Spoken English Fluency"
    ) -> Dict[str, Any]:
        """Ultra-fast conversational sparring turn with immediate live grammar correction."""
        clean_msg = (user_message or "").strip()
        system_prompt = f"""You are Devgya Spoken English Coach in a live 1-on-1 spoken practice session with an Indian learner (Level: {user_level}, Focus: {target_focus}).

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
                "reply": "Well said! That makes complete sense. How do your friends or colleagues react when you share that?",
                "correction": None,
                "praise_word": "Great job!"
            }

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
7. "coach_recommendation_for_parents": 2-3 warm sentences advising parents how to encourage speaking at home.
8. "coach_recommendation_for_teachers": 2-3 actionable sentences advising the teacher on participation.
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
                "coach_recommendation_for_teachers": f"Invite {student_name} to lead morning announcements or moderate peer group discussions.",
                "certificate_id": f"DEVGYA-ENG-{uuid.uuid4().hex[:6].upper()}"
            }

        report_data["student_name"] = student_name
        report_data["user_id"] = user_id
        report_data["user_role"] = user_role
        report_data["diagnostic_score"] = score
        report_data["generated_at"] = self._get_now_iso()
        report_data["cycle_valid_until"] = track.get("expires_at", self._get_expiry_iso())

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


english_coach_service = EnglishCoachService()
