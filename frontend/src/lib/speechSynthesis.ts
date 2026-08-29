/**
 * DEVGYA AI Natural Speech Synthesis (TTS) Engine
 * Supports high-fidelity, natural Hindi & English speech synthesis with intelligent voice routing.
 */

// Helper: Clean raw markdown, LaTeX, tables, and emojis into natural spoken language
export function cleanTextForSpeech(rawText: string, lang: string = "english"): string {
  if (!rawText) return "";
  let clean = rawText;

  // 1. Remove code blocks and inline code
  clean = clean.replace(/```[\s\S]*?```/g, "");
  clean = clean.replace(/`([^`]+)`/g, "$1");

  // 2. Remove markdown links [title](url) -> title
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 3. Remove markdown headers, bold, italic, strikethrough
  clean = clean.replace(/(\*\*|__)(.*?)\1/g, "$2");
  clean = clean.replace(/(\*|_)(.*?)\1/g, "$2");
  clean = clean.replace(/~~(.*?)~~/g, "$1");
  clean = clean.replace(/^#+\s+/gm, "");

  // 4. Clean markdown tables | col | col | -> pause
  clean = clean.replace(/^\|.*?\|$/gm, "");

  // 5. Clean list bullets and numbering -> natural pauses
  clean = clean.replace(/^[-*•]\s+/gm, "");
  clean = clean.replace(/^[0-9]+[\.\)]\s+/gm, "");
  clean = clean.replace(/^>\s+/gm, "");
  clean = clean.replace(/[#_~*`]/g, "");

  // 6. Convert Math / LaTeX expressions to speakable words
  clean = clean.replace(/\\times/g, " times ");
  clean = clean.replace(/\\div/g, " divided by ");
  clean = clean.replace(/\\pm/g, " plus or minus ");
  clean = clean.replace(/\\sqrt\{([^}]+)\}/g, "square root of $1");
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2");
  clean = clean.replace(/\$([^\$]+)\$/g, "$1");

  // 7. Remove emojis and decorative icons
  clean = clean.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
    ""
  );

  // 8. Normalize punctuation and whitespace
  clean = clean.replace(/\s+/g, " ").trim();

  return clean;
}

// Detect if text is predominantly Hindi / Devanagari script
export function isHindiText(text: string): boolean {
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  return devanagariCount > 5 || devanagariCount / Math.max(text.length, 1) > 0.15;
}

// Pick the best natural neural voice available on the device
export function getBestVoice(preferredLang: string, sampleText: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isHindi = preferredLang === "hindi" || isHindiText(sampleText);

  if (isHindi) {
    // 1. High-priority Neural/Natural Hindi voices
    const naturalHindi = voices.find(
      (v) =>
        (v.lang.startsWith("hi") || v.lang === "hi_IN" || v.lang === "hi-IN") &&
        (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural"))
    );
    if (naturalHindi) return naturalHindi;

    // 2. Google हिन्दी voice
    const googleHindi = voices.find((v) => v.lang.startsWith("hi") && v.name.includes("Google"));
    if (googleHindi) return googleHindi;

    // 3. Named Hindi voices (Swara, Madhur, Kalpana, Hemant)
    const namedHindi = voices.find(
      (v) =>
        (v.lang.startsWith("hi") || v.lang.includes("IN")) &&
        (v.name.includes("Swara") ||
          v.name.includes("Madhur") ||
          v.name.includes("Kalpana") ||
          v.name.includes("Hemant"))
    );
    if (namedHindi) return namedHindi;

    // 4. Any Hindi language voice
    const anyHindi = voices.find((v) => v.lang.startsWith("hi") || v.lang === "hi-IN");
    if (anyHindi) return anyHindi;

    // Fallback: Indian English voice
    return voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en_IN")) || voices[0];
  } else {
    // English / Hinglish voice selection
    // 1. Natural Indian English / Neural English
    const naturalIndianEnglish = voices.find(
      (v) =>
        (v.lang === "en-IN" || v.lang === "en_IN") &&
        (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online"))
    );
    if (naturalIndianEnglish) return naturalIndianEnglish;

    // 2. Named Indian English (Neerja, Prabhat, Google English India)
    const namedIndianEnglish = voices.find(
      (v) =>
        (v.lang.includes("en-IN") || v.lang.includes("en_IN")) &&
        (v.name.includes("Neerja") || v.name.includes("Prabhat") || v.name.includes("India"))
    );
    if (namedIndianEnglish) return namedIndianEnglish;

    // 3. Any Indian English
    const anyIndianEnglish = voices.find((v) => v.lang === "en-IN" || v.lang === "en_IN");
    if (anyIndianEnglish) return anyIndianEnglish;

    // 4. Natural Global English (Google US/UK, Microsoft Jenny, Aria, Guy)
    const naturalGlobalEnglish = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Google") || v.name.includes("Online"))
    );
    if (naturalGlobalEnglish) return naturalGlobalEnglish;

    // 5. Any English voice
    return voices.find((v) => v.lang.startsWith("en")) || voices[0];
  }
}

// Global active utterance tracking to prevent garbage collection cutoffs
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentOnStopCallback: (() => void) | null = null;

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  if (currentOnStopCallback) {
    currentOnStopCallback();
    currentOnStopCallback = null;
  }
  currentUtterance = null;
}

export function isSpeechActive(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Speaks the given text naturally with automatic language detection,
 * neural voice assignment, and speech state callbacks.
 */
export function speakChatMessage(
  rawText: string,
  language: string = "english",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.();
    return () => {};
  }

  // Stop any ongoing speech
  stopSpeech();

  const isHindi = language === "hindi" || isHindiText(rawText);
  const clean = cleanTextForSpeech(rawText, isHindi ? "hindi" : "english");

  if (!clean) {
    onEnd?.();
    return () => {};
  }

  const voice = getBestVoice(isHindi ? "hindi" : "english", clean);
  const utt = new SpeechSynthesisUtterance(clean);

  utt.lang = isHindi ? "hi-IN" : (voice?.lang || "en-IN");
  utt.rate = isHindi ? 0.95 : 1.0;
  utt.pitch = isHindi ? 1.05 : 1.0;

  if (voice) {
    utt.voice = voice;
  }

  currentUtterance = utt;
  currentOnStopCallback = onEnd || null;

  utt.onstart = () => {
    onStart?.();
  };

  utt.onend = () => {
    currentUtterance = null;
    currentOnStopCallback = null;
    onEnd?.();
  };

  utt.onerror = (e) => {
    // If canceled manually, don't trigger error state
    if (e.error !== "canceled" && e.error !== "interrupted") {
      onError?.();
    }
    currentUtterance = null;
    currentOnStopCallback = null;
    onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utt);
  } catch (err) {
    console.warn("Speech synthesis notice:", err);
    onError?.();
  }

  // Return cancel function
  return stopSpeech;
}
