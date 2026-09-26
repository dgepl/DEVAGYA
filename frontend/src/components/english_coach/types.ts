export interface DiagnosticQuestion {
  id: number;
  category: string;
  prompt: string;
  instruction: string;
  time_limit_seconds: number;
  skill_focus: string;
  sample_answer: string;
}

export interface SpokenAnswerItem {
  question_id: number;
  category: string;
  prompt: string;
  transcript: string;
  duration_seconds?: number;
}

export interface CoachProfile {
  user_id: string;
  user_role: string;
  user_name: string;
  has_taken_diagnostic: boolean;
  overall_level: string; // A1, A2, B1, B2, C1
  overall_score: number;
  skills: {
    speaking: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    confidence: number;
    conversation: number;
  };
  strengths: string[];
  weaknesses: string[];
  coach_feedback?: {
    what_you_are_good_at?: string;
    what_we_need_to_improve?: string;
    your_biggest_focus?: string;
  };
  priority_focus: string[];
  personalized_roadmap: Array<{
    week: number;
    theme: string;
    focus: string;
  }>;
  current_level: number;
  unlocked_levels: number[];
  completed_activities: string[];
  activity_scores: Record<string, number>;
  common_mistakes?: Array<{
    type?: string;
    original: string;
    corrected: string;
    rule: string;
  }>;
  words_learned: number;
  daily_streak: number;
  xp: number;
  updated_at?: string;
}

export interface CoachActivity {
  id: string;
  type: string;
  title: string;
  duration: string;
  xp: number;
  instructions: string;
  data: any;
  is_completed?: boolean;
  user_score?: number;
}

export interface CoachLevel {
  level_number: number;
  title: string;
  tagline: string;
  badge: string;
  accent_color: string;
  gradient: string;
  focus_areas: string[];
  pass_percentage: number;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  completed_activities_count: number;
  total_activities_count: number;
  capstone_passed: boolean;
  unlock_requirement: string;
  activities: CoachActivity[];
}

export type CoachView =
  | "welcome"
  | "diagnostic"
  | "report"
  | "dashboard"
  | "roadmap"
  | "activity"
  | "live_voice";

// Cached voices
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch (e) {}
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (!cachedVoices || cachedVoices.length === 0) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch (e) {}
  }
  if (!cachedVoices || cachedVoices.length === 0) return null;

  // Priority order: Natural/Neural en-IN -> en-GB -> en-US -> generic en
  const naturalIn = cachedVoices.find(
    (v) => (v.lang === "en-IN" || v.lang.startsWith("en-IN")) && (v.name.includes("Natural") || v.name.includes("Online"))
  );
  if (naturalIn) return naturalIn;

  const anyIn = cachedVoices.find((v) => v.lang === "en-IN" || v.lang.startsWith("en-IN"));
  if (anyIn) return anyIn;

  const naturalGb = cachedVoices.find(
    (v) => (v.lang === "en-GB" || v.lang.startsWith("en-GB")) && (v.name.includes("Natural") || v.name.includes("Online"))
  );
  if (naturalGb) return naturalGb;

  const anyGb = cachedVoices.find((v) => v.lang === "en-GB" || v.lang.startsWith("en-GB"));
  if (anyGb) return anyGb;

  const anyEn = cachedVoices.find((v) => v.lang.startsWith("en"));
  return anyEn || null;
}

export function speakCoachText(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = "en-IN";
        utterance.rate = 0.95;
        utterance.pitch = 1.02;

        const voice = getBestEnglishVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        let finished = false;
        const complete = () => {
          if (!finished) {
            finished = true;
            if (onEnd) onEnd();
          }
        };

        utterance.onend = complete;
        utterance.onerror = complete;

        // Safety fallback timer if browser synthesis freezes (roughly 70ms per char)
        const maxWaitMs = Math.max(3000, Math.min(20000, text.length * 90));
        setTimeout(() => {
          if (!finished) {
            complete();
          }
        }, maxWaitMs);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech speak error:", err);
        if (onEnd) onEnd();
      }
    }, 50);
  } catch (err) {
    console.warn("Speech cancel error:", err);
    if (onEnd) onEnd();
  }
}

export function stopCoachSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Strips speech recognizer repetitive word stuttering and multi-word loop artifacts.
 * e.g., "she she writes she writes an email she writes an email" -> "she writes an email"
 */
export function cleanRepeatedPhrases(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  // 1. Remove consecutive identical duplicate words ("she she" -> "she")
  const rawWords = trimmed.split(/\s+/);
  if (rawWords.length <= 1) return trimmed;

  const dedupedWords: string[] = [];
  for (let i = 0; i < rawWords.length; i++) {
    const current = rawWords[i];
    const prev = dedupedWords[dedupedWords.length - 1];
    if (!prev || current.toLowerCase() !== prev.toLowerCase()) {
      dedupedWords.push(current);
    }
  }

  let result = dedupedWords.join(" ");

  // 2. Loop to collapse repeated multi-word phrase patterns
  for (let phraseLen = 8; phraseLen >= 2; phraseLen--) {
    let words = result.split(/\s+/);
    if (words.length < phraseLen * 2) continue;

    let changed = false;
    for (let i = 0; i <= words.length - phraseLen * 2; i++) {
      const phraseA = words.slice(i, i + phraseLen).join(" ").toLowerCase();
      const phraseB = words.slice(i + phraseLen, i + phraseLen * 2).join(" ").toLowerCase();

      if (phraseA === phraseB) {
        words.splice(i, phraseLen);
        result = words.join(" ");
        changed = true;
        break;
      }
    }
    if (changed) {
      phraseLen++; // re-check at same length
    }
  }

  return result.trim();
}

