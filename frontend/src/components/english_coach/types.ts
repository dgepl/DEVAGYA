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

  // Priority order: Ultra-natural Gemini-like voices (Google US English, Natural en-US, Natural en-GB, Natural en-IN)
  const naturalUs = cachedVoices.find(
    (v) => (v.lang === "en-US" || v.lang.startsWith("en-US")) && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google") || v.name.includes("Neural"))
  );
  if (naturalUs) return naturalUs;

  const naturalGb = cachedVoices.find(
    (v) => (v.lang === "en-GB" || v.lang.startsWith("en-GB")) && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google"))
  );
  if (naturalGb) return naturalGb;

  const naturalIn = cachedVoices.find(
    (v) => (v.lang === "en-IN" || v.lang.startsWith("en-IN")) && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google"))
  );
  if (naturalIn) return naturalIn;

  const anyUs = cachedVoices.find((v) => v.lang === "en-US" || v.lang.startsWith("en-US"));
  if (anyUs) return anyUs;

  const anyEn = cachedVoices.find((v) => v.lang.startsWith("en"));
  return anyEn || null;
}

export function getMatchingBrowserVoice(voiceId: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (voiceId.includes("Andrew") || voiceId.includes("Guy") || voiceId.includes("Male")) {
    const usMale = voices.find(
      (v) =>
        (v.lang === "en-US" || v.lang.startsWith("en-US")) &&
        (v.name.includes("David") ||
          v.name.includes("Guy") ||
          v.name.includes("Male") ||
          v.name.includes("Mark") ||
          v.name.includes("George"))
    );
    if (usMale) return usMale;
    const anyUs = voices.find((v) => v.lang === "en-US" || v.lang.startsWith("en-US"));
    if (anyUs) return anyUs;
  } else if (voiceId.includes("Ava") || voiceId.includes("Jenny")) {
    const usFemale = voices.find(
      (v) =>
        (v.lang === "en-US" || v.lang.startsWith("en-US")) &&
        (v.name.includes("Zira") ||
          v.name.includes("Jenny") ||
          v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Female") ||
          v.name.includes("Ava"))
    );
    if (usFemale) return usFemale;
    const anyUs = voices.find((v) => v.lang === "en-US" || v.lang.startsWith("en-US"));
    if (anyUs) return anyUs;
  } else if (voiceId.includes("Neerja") || voiceId.includes("IN") || voiceId.includes("Indian")) {
    const inVoice = voices.find(
      (v) =>
        v.lang === "en-IN" ||
        v.lang === "en_IN" ||
        v.lang.includes("IN") ||
        v.name.includes("India") ||
        v.name.includes("Neerja") ||
        v.name.includes("Prabhat") ||
        v.name.includes("Heera") ||
        v.name.includes("Veena")
    );
    if (inVoice) return inVoice;
  } else if (voiceId.includes("Sonia") || voiceId.includes("GB") || voiceId.includes("British")) {
    const gbVoice = voices.find(
      (v) =>
        v.lang === "en-GB" ||
        v.lang.startsWith("en-GB") ||
        v.lang.includes("GB") ||
        v.name.includes("UK") ||
        v.name.includes("British") ||
        v.name.includes("Hazel") ||
        v.name.includes("Susan")
    );
    if (gbVoice) return gbVoice;
  }

  return getBestEnglishVoice();
}

let currentCoachAudio: HTMLAudioElement | null = null;
let currentVoiceId: string = "en-US-AvaNeural"; // Ultra-natural Gemini-quality Studio Voice
const audioBlobCache = new Map<string, string>();

export function setCoachVoicePreference(voiceId: string) {
  currentVoiceId = voiceId;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("devgya_coach_voice", voiceId);
    } catch (e) {}
  }
}

export function getCoachVoicePreference(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("devgya_coach_voice");
      if (stored) {
        currentVoiceId = stored;
        return stored;
      }
    } catch (e) {}
  }
  return currentVoiceId || "en-US-AvaNeural";
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

  const selectedVoice = voicePreference || getCoachVoicePreference();

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
    fallbackBrowserSpeech(clean, selectedVoice, finish);
  };

  // 1. Primary: Fetch & Play Studio-Quality Edge-TTS Neural Audio Blob
  (async () => {
    try {
      const apiBase = getApiBase();
      const streamUrl = `${apiBase}/tts/speak?voice=${encodeURIComponent(selectedVoice)}&rate=+0%&text=${encodeURIComponent(clean)}`;
      
      const cacheKey = `${selectedVoice}:${clean}`;
      let blobUrl = audioBlobCache.get(cacheKey);

      if (!blobUrl) {
        const resp = await fetch(streamUrl);
        if (!resp.ok) {
          throw new Error(`TTS server HTTP ${resp.status}`);
        }
        const blob = await resp.blob();
        blobUrl = URL.createObjectURL(blob);
        audioBlobCache.set(cacheKey, blobUrl);
      }

      if (completed) return;

      const audio = new Audio(blobUrl);
      currentCoachAudio = audio;

      audio.onended = () => {
        currentCoachAudio = null;
        finish();
      };

      audio.onerror = (e) => {
        console.warn("Audio element playback error, falling back:", e);
        triggerFallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Edge-TTS play error, using fallback:", err);
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
    } catch (err) {
      console.warn("Edge-TTS fetch error:", err);
      triggerFallback();
    }
  })();
}

function fallbackBrowserSpeech(cleanText: string, selectedVoice: string, onEnd: () => void) {
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
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Tailor pitch, rate, and language to user's selected voice
        if (selectedVoice.includes("Andrew") || selectedVoice.includes("Guy")) {
          utterance.lang = "en-US";
          utterance.pitch = 0.9;
          utterance.rate = 0.96;
        } else if (selectedVoice.includes("Ava") || selectedVoice.includes("Jenny")) {
          utterance.lang = "en-US";
          utterance.pitch = 1.08;
          utterance.rate = 1.0;
        } else if (
          selectedVoice.includes("Neerja") ||
          selectedVoice.includes("IN") ||
          selectedVoice.includes("Indian")
        ) {
          utterance.lang = "en-IN";
          utterance.pitch = 1.02;
          utterance.rate = 0.94;
        } else if (
          selectedVoice.includes("Sonia") ||
          selectedVoice.includes("GB") ||
          selectedVoice.includes("British")
        ) {
          utterance.lang = "en-GB";
          utterance.pitch = 1.0;
          utterance.rate = 0.94;
        } else {
          utterance.lang = "en-US";
          utterance.pitch = 1.0;
          utterance.rate = 0.98;
        }

        const voice = getMatchingBrowserVoice(selectedVoice);
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

