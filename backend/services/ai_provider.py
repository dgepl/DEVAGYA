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
        return os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")

    @property
    def model(self) -> str:
        return os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
        
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.5,
        max_tokens: int = 2500,
        response_format_json: bool = False
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
        
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
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

    async def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.6
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
        payload = {
            "model": self.model,
            "messages": messages,
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
