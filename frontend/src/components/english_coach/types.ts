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

// Speech synthesis helper
export function speakCoachText(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN"; // Warm Indian/English tone
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(
    (v) => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.name.includes("Natural") || v.lang.includes("en")
  );
  if (enVoice) utterance.voice = enVoice;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}

export function stopCoachSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
