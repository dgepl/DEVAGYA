import os
import json
import logging
from typing import List, Dict, Any, AsyncGenerator, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()
if not os.getenv("AI_API_KEY") and not os.getenv("GROQ_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    load_dotenv("backend/.env")

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
        return os.getenv("AI_MODEL", "openai/gpt-oss-120b")

    @property
    def vision_model(self) -> str:
        return os.getenv("AI_VISION_MODEL", "qwen/qwen3.8-27b")

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
        
        has_imgs = self._has_images(messages)
        selected_model = model or (self.vision_model if has_imgs else self.model)
        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": self._optimize_messages(messages),
            "temperature": temperature,
            "max_tokens": min(max_tokens, 2500)
        }
        
        if response_format_json and not has_imgs:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=45.0) as client:
            if has_imgs:
                models_to_try = [selected_model, "qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]
            else:
                models_to_try = [selected_model, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"]
            # Deduplicate while preserving order
            unique_models = []
            for m in models_to_try:
                if m and m not in unique_models:
                    unique_models.append(m)

            last_error = None
            for attempt_model in unique_models:
                payload["model"] = attempt_model
                for retry in range(2):
                    try:
                        res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                        if res.status_code == 400 and "response_format" in payload:
                            payload.pop("response_format", None)
                            continue

                        if res.status_code == 429:
                            retry_after = min(float(res.headers.get("retry-after", 1.5 * (retry + 1))), 4.0)
                            logger.warning(f"Rate limit 429 on {attempt_model}. Backing off {retry_after}s...")
                            import asyncio
                            await asyncio.sleep(retry_after)
                            continue
                        
                        res.raise_for_status()
                        data = res.json()
                        raw_content = data["choices"][0]["message"]["content"] or ""
                        # Strip any reasoning/think tags if present
                        import re
                        clean_content = re.sub(r'<think>[\s\S]*?</think>', '', raw_content).strip()
                        return clean_content or raw_content
                    except httpx.HTTPStatusError as http_err:
                        last_error = http_err
                        if http_err.response.status_code == 400 and "response_format" in payload:
                            payload.pop("response_format", None)
                            continue
                        if http_err.response.status_code == 429:
                            import asyncio
                            await asyncio.sleep(1.5)
                            continue
                        break
                    except Exception as err:
                        last_error = err
                        logger.warning(f"Model {attempt_model} attempt {retry+1} notice: {err}")
                        import asyncio
                        await asyncio.sleep(0.5)

            logger.error(f"All AI models failed in chat_completion: {last_error}")
            if last_error:
                raise last_error
            return ""

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
                return value.strip()
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
        """SSE streaming generator for real-time typing effect with pure DEVGYA branding."""
        import asyncio
        key = self.api_key
        if not key:
            yield "DEVGYA AI engine is initializing. Please try again in a few moments."
            return

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        selected_model = model or (self.vision_model if self._has_images(messages) else self.model)
        
        # Build candidate fallback models list
        fallback_models = [selected_model]
        for alt_m in ["openai/gpt-oss-20b", "qwen/qwen3.6-27b"]:
            if alt_m not in fallback_models:
                fallback_models.append(alt_m)

        payload = {
            "messages": self._optimize_messages(messages),
            "temperature": temperature,
            "stream": True
        }

        for m_idx, current_model in enumerate(fallback_models):
            payload["model"] = current_model
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", f"{self.base_url}/chat/completions", headers=headers, json=payload) as response:
                        if response.status_code == 429 or response.status_code >= 400:
                            logger.warning(f"Model {current_model} returned HTTP {response.status_code}. Retrying with fallback model...")
                            if m_idx < len(fallback_models) - 1:
                                await asyncio.sleep(0.5)
                                continue
                            else:
                                yield f"\n\n*(DEVGYA AI engine is currently processing high traffic. Please try again in a few moments.)*"
                                return

                        has_yielded = False
                        in_think_block = False
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:].strip()
                                if data_str == "[DONE]":
                                    break
                                try:
                                    chunk = json.loads(data_str)
                                    content = chunk["choices"][0]["delta"].get("content", "")
                                    if not content:
                                        continue
                                    if "<think>" in content:
                                        in_think_block = True
                                        continue
                                    if "</think>" in content:
                                        in_think_block = False
                                        continue
                                    if in_think_block:
                                        continue
                                    
                                    has_yielded = True
                                    yield content
                                except Exception:
                                    pass

                        if has_yielded:
                            return
                        elif m_idx < len(fallback_models) - 1:
                            logger.warning(f"Model {current_model} produced no content stream. Retrying next model...")
                            await asyncio.sleep(0.5)
                            continue
                        return
            except Exception as e:
                logger.error(f"Error streaming with model {current_model}: {e}")
                if m_idx < len(fallback_models) - 1:
                    await asyncio.sleep(0.5)
                    continue
                else:
                    yield f"\n\n*(DEVGYA AI temporarily busy: Please try again in a few moments.)*"
                    return

ai_provider = AIProviderService()
