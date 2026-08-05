import os
import json
import logging
from typing import List, Dict, Any, AsyncGenerator, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai_provider")

class AIProviderService:
    """
    Central OpenAI-Compatible Provider Abstraction Service.
    Seamlessly supports Groq, OpenAI, OpenRouter, Together AI, and DeepSeek.
    Driven purely by environment variables without code modifications.
    """
    @property
    def api_key(self) -> str:
        return os.getenv("AI_API_KEY", os.getenv("GROQ_API_KEY", ""))

    @property
    def base_url(self) -> str:
        raw = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1").strip().strip("'\"")
        if raw.startswith("[") and "](" in raw:
            raw = raw.split("](")[-1].rstrip(")")
        if not raw.startswith("http://") and not raw.startswith("https://"):
            raw = "https://" + raw
        return raw.rstrip("/")

    @property
    def model(self) -> str:
        return os.getenv("AI_MODEL", "llama-3.3-70b-versatile")

    @property
    def vision_model(self) -> str:
        return os.getenv("AI_VISION_MODEL", "qwen/qwen3.6-27b")

    def build_vision_content(self, text: str, image_data_urls: List[str]) -> List[Dict[str, Any]]:
        """Build an OpenAI-style multi-part message content for vision-capable models."""
        parts: List[Dict[str, Any]] = [{"type": "text", "text": text}]
        for url in image_data_urls:
            parts.append({"type": "image_url", "image_url": {"url": url}})
        return parts

    def _has_images(self, messages: List[Dict[str, Any]]) -> bool:
        return any(
            isinstance(m.get("content"), list)
            and any(p.get("type") == "image_url" for p in m["content"])
            for m in messages
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.5,
        max_tokens: int = 2500,
        response_format_json: bool = False,
        model: Optional[str] = None
    ) -> str:
        """Non-streaming completion call to OpenAI-compatible provider."""
        key = self.api_key
        if not key:
            logger.warning("AI_API_KEY not configured, using fallback intelligent synthesizer.")
            return ""

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        selected_model = model or (self.vision_model if self._has_images(messages) else self.model)
        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": self._optimize_messages(messages),
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format_json:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error(f"AI Provider ({self.base_url}) Error: {e}")
                raise e

    def _optimize_messages(self, messages: List[Dict[str, Any]], max_turns: int = 6) -> List[Dict[str, Any]]:
        """
        Compresses conversation history to conserve API tokens and credits:
        1. Preserves system prompt.
        2. Retains the latest max_turns message exchanges.
        3. Strips extraneous white space from messages.
        """
        if not messages:
            return []

        def _normalize(value: Any) -> Any:
            if isinstance(value, str):
                return " ".join(value.split())
            return value

        optimized = []
        system_msgs = [m for m in messages if m.get("role") == "system"]
        user_assistant_msgs = [m for m in messages if m.get("role") != "system"]

        for sm in system_msgs:
            sm_copy = dict(sm)
            sm_copy["content"] = _normalize(sm_copy["content"])
            optimized.append(sm_copy)

        recent_msgs = user_assistant_msgs[-max_turns:]
        for m in recent_msgs:
            m_copy = dict(m)
            m_copy["content"] = _normalize(m_copy["content"])
            optimized.append(m_copy)

        return optimized

    async def stream_chat_completion(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.6,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """SSE streaming generator for ChatGPT-style real-time typing effect."""
        key = self.api_key
        if not key:
            yield "AI Provider API key is not configured. Please set AI_API_KEY in environment variables."
            return

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        selected_model = model or (self.vision_model if self._has_images(messages) else self.model)
        payload = {
            "model": selected_model,
            "messages": self._optimize_messages(messages),
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{self.base_url}/chat/completions", headers=headers, json=payload) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            content = chunk["choices"][0]["delta"].get("content", "")
                            if content:
                                yield content
                        except Exception:
                            continue

ai_provider = AIProviderService()

