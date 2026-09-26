import { getApiBase } from "@/lib/api";

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

let currentCoachAudio: HTMLAudioElement | null = null;
let currentVoiceId: string = "en-IN-NeerjaNeural"; // Studio Neural Voice (Indian English)

export function setCoachVoicePreference(voiceId: string) {
  currentVoiceId = voiceId;
}

export function getCoachVoicePreference(): string {
  return currentVoiceId;
}

export function speakCoachText(
  text: string,
  onEnd?: () => void,
  voicePreference?: string
) {
  stopCoachSpeaking();
  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  // Clean raw markdown, bold, emojis, quotes for crisp pronunciation
  const clean = text
    .replace(/[*_#`~>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  let completed = false;
  let fallbackAttempted = false;

  const finish = () => {
    if (!completed) {
      completed = true;
      if (onEnd) onEnd();
    }
  };

  const triggerFallback = () => {
    if (fallbackAttempted || completed) return;
    fallbackAttempted = true;
    if (currentCoachAudio) {
      try {
        currentCoachAudio.pause();
        currentCoachAudio.currentTime = 0;
        currentCoachAudio.src = "";
      } catch (e) {}
      currentCoachAudio = null;
    }
    fallbackBrowserSpeech(clean, finish);
  };

  const selectedVoice = voicePreference || currentVoiceId || "en-IN-NeerjaNeural";

  // 1. Primary: Stream Studio-Quality Edge-TTS Neural Audio via Backend API
  try {
    const apiBase = getApiBase();
    const streamUrl = `${apiBase}/tts/speak?voice=${encodeURIComponent(selectedVoice)}&rate=+0%&text=${encodeURIComponent(clean)}`;
    const audio = new Audio(streamUrl);
    currentCoachAudio = audio;

    audio.onended = () => {
      currentCoachAudio = null;
      finish();
    };

    audio.onerror = () => {
      triggerFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Edge-TTS stream error, using fallback:", err);
        triggerFallback();
      });
    }

    // Safety timeout in case audio playback stalls
    const maxWaitMs = Math.max(3500, Math.min(25000, clean.length * 90));
    setTimeout(() => {
      if (!completed && currentCoachAudio) {
        stopCoachSpeaking();
        finish();
      }
    }, maxWaitMs);
  } catch {
    triggerFallback();
  }
}

function fallbackBrowserSpeech(cleanText: string, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setTimeout(() => {
      try {
        // Cancel again to ensure queue is completely empty
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
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
            onEnd();
          }
        };

        utterance.onend = complete;
        utterance.onerror = complete;

        const maxWaitMs = Math.max(3000, Math.min(20000, cleanText.length * 90));
        setTimeout(() => {
          if (!finished) complete();
        }, maxWaitMs);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Browser fallback speech error:", err);
        onEnd();
      }
    }, 50);
  } catch (err) {
    console.warn("Speech cancel error:", err);
    onEnd();
  }
}

export function stopCoachSpeaking() {
  if (currentCoachAudio) {
    try {
      currentCoachAudio.pause();
      currentCoachAudio.currentTime = 0;
      currentCoachAudio.src = "";
    } catch (e) {}
    currentCoachAudio = null;
  }
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

