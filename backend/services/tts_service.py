import re
import logging
import asyncio
from typing import AsyncGenerator, Dict, List, Optional
import edge_tts

logger = logging.getLogger("tts_service")

# Official Indian Accent Neural Voices (Microsoft Edge Speech)
INDIAN_VOICES: Dict[str, Dict[str, str]] = {
    "en-IN-NeerjaNeural": {
        "id": "en-IN-NeerjaNeural",
        "name": "Neerja",
        "gender": "Female",
        "lang": "en-IN",
        "label": "Indian English — Warm Educator (Female)",
        "description": "Clear, gentle, and articulated Indian English teacher voice."
    },
    "en-IN-PrabhatNeural": {
        "id": "en-IN-PrabhatNeural",
        "name": "Prabhat",
        "gender": "Male",
        "lang": "en-IN",
        "label": "Indian English — Professional Teacher (Male)",
        "description": "Authoritative, crisp, and standard Indian English educator voice."
    },
    "hi-IN-SwaraNeural": {
        "id": "hi-IN-SwaraNeural",
        "name": "Swara",
        "gender": "Female",
        "lang": "hi-IN",
        "label": "Hindi — Expressive Mentor (Female)",
        "description": "Natural, native Hindi cadence with clear enunciation."
    },
    "hi-IN-MadhurNeural": {
        "id": "hi-IN-MadhurNeural",
        "name": "Madhur",
        "gender": "Male",
        "lang": "hi-IN",
        "label": "Hindi — Encouraging Coach (Male)",
        "description": "Conversational, warm, and friendly Hindi speaker."
    }
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"

def clean_text_for_tts(raw: str) -> str:
    """Strips Markdown syntax, emojis, URLs, and code blocks so synthesized speech sounds natural."""
    if not raw:
        return ""
    text = raw

    # Strip reasoning tags <think>...</think>
    text = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE)
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Strip code blocks
    text = re.sub(r'```[\s\S]*?```', ' ', text)
    text = re.sub(r'`[^`]+`', ' ', text)
    # Strip Markdown links [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Strip Markdown formatting (*, **, _, __, #, >, ~)
    text = re.sub(r'(\*\*|__)(.*?)\1', r'\2', text)
    text = re.sub(r'(\*|_)(.*?)\1', r'\2', text)
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[-*•]\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[0-9]+\.\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'>\s*', '', text)
    text = re.sub(r'[#_~*`]', '', text)

    # Strip decorative Unicode emojis safely
    def _is_emoji(ch: str) -> bool:
        cp = ord(ch)
        return (
            0x1F600 <= cp <= 0x1F64F or # Emoticons
            0x1F300 <= cp <= 0x1F5FF or # Misc Symbols and Pictographs
            0x1F680 <= cp <= 0x1F6FF or # Transport and Map
            0x1F700 <= cp <= 0x1F77F or # Alchemical
            0x1F780 <= cp <= 0x1F7FF or # Geometric Shapes
            0x1F800 <= cp <= 0x1F8FF or # Supplemental Arrows
            0x1F900 <= cp <= 0x1F9FF or # Supplemental Symbols
            0x1FA00 <= cp <= 0x1FA6F or # Chess Symbols
            0x1FA70 <= cp <= 0x1FAFF or # Symbols and Pictographs Extended-A
            0x2600 <= cp <= 0x26FF or   # Misc symbols
            0x2700 <= cp <= 0x27BF      # Dingbats
        )

    text = "".join(ch for ch in text if not _is_emoji(ch))

    # Clean LaTeX symbols
    text = re.sub(r'\$([^\$]+)\$', r'\1', text)

    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

class TTSService:
    def __init__(self):
        self.voices = INDIAN_VOICES
        self._cache: Dict[str, bytes] = {}

    def get_available_voices(self) -> List[Dict[str, str]]:
        return list(self.voices.values())

    async def generate_speech_stream(
        self,
        text: str,
        voice: str = DEFAULT_VOICE,
        rate: str = "+0%"
    ) -> AsyncGenerator[bytes, None]:
        """Streams MP3 audio chunks from Edge-TTS for low-latency playback."""
        clean = clean_text_for_tts(text)
        if not clean:
            return

        selected_voice = voice if voice in self.voices else DEFAULT_VOICE
        cache_key = f"{selected_voice}_{rate}_{clean}"

        # If already cached in memory, yield cached bytes
        if cache_key in self._cache:
            yield self._cache[cache_key]
            return

        chunks: List[bytes] = []
        try:
            communicate = edge_tts.Communicate(clean, selected_voice, rate=rate)
            async for chunk in communicate.stream():
                if chunk.get("type") == "audio" and chunk.get("data"):
                    data = chunk["data"]
                    chunks.append(data)
                    yield data

            # Cache short phrases (under 250 characters)
            if len(clean) < 250 and chunks:
                self._cache[cache_key] = b"".join(chunks)

        except Exception as e:
            logger.error(f"Error in edge-tts stream for voice {selected_voice}: {e}")
            raise e

tts_service = TTSService()
