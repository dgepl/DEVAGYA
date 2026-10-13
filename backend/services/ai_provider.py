import os
import re
import json
import asyncio
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
    def __init__(self):
        self._quota_exhausted_until: float = 0.0

    @property
    def api_key(self) -> str:
        return os.getenv("AI_API_KEY", os.getenv("GROQ_API_KEY", ""))

    @property
    def is_google(self) -> bool:
        key = self.api_key
        return key.startswith("AQ.") or key.startswith("AIza") or "googleapis" in os.getenv("AI_BASE_URL", "")

    @property
    def base_url(self) -> str:
        explicit = os.getenv("AI_BASE_URL")
        if explicit:
            raw = explicit.strip().strip("'\"")
        else:
            key = self.api_key
            if key.startswith("AQ.") or key.startswith("AIza"):
                raw = "https://generativelanguage.googleapis.com/v1beta/openai"
            else:
                raw = "https://api.groq.com/openai/v1"
        if raw.startswith("[") and "](" in raw:
            raw = raw.split("](")[-1].rstrip(")")
        if not raw.startswith("http://") and not raw.startswith("https://"):
            raw = "https://" + raw
        return raw.rstrip("/")

    @property
    def model(self) -> str:
        return os.getenv("AI_MODEL", "gemini-3.1-flash-lite")

    @property
    def vision_model(self) -> str:
        return os.getenv("AI_VISION_MODEL", "gemini-3.1-flash-lite")

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

        # High-performance native vision for Google Gemini provider
        if has_imgs and ("googleapis" in self.base_url or "gemini" in str(selected_model).lower() or self.is_google):
            try:
                native_res = await self._gemini_native_vision(messages, temperature, max_tokens, key, response_format_json=response_format_json)
                if native_res and len(native_res.strip()) > 5:
                    return native_res
            except Exception as native_err:
                logger.warning(f"Native Gemini vision fallback notice: {native_err}")

        # High-performance direct native text for Google Gemini provider (bypasses slow /openai proxy)
        if not has_imgs and ("googleapis" in self.base_url or "gemini" in str(selected_model).lower() or self.is_google):
            try:
                native_text_res = await self._gemini_native_text(messages, temperature, max_tokens, key, response_format_json=response_format_json, preferred_model=selected_model)
                if native_text_res and len(native_text_res.strip()) > 5:
                    return native_text_res
            except Exception as native_text_err:
                logger.warning(f"Native Gemini text fallback notice: {native_text_err}")

        # If vision call failed or didn't return text, sanitize messages so OpenAI-compatible endpoint doesn't hang on base64
        if has_imgs:
            stripped_messages = []
            for m in messages:
                c = m.get("content")
                if isinstance(c, list):
                    text_only = " ".join(p.get("text", "") for p in c if p.get("type") == "text").strip()
                    stripped_messages.append({"role": m.get("role", "user"), "content": text_only or "Please analyze and extract the document content."})
                else:
                    stripped_messages.append(m)
            messages = stripped_messages
            selected_model = self.model

        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": self._optimize_messages(messages),
            "temperature": temperature,
            "max_tokens": min(max_tokens or 4096, 12288)
        }
        
        if response_format_json and "qwen" not in str(selected_model).lower():
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=50.0) as client:
            if "gemini" in str(selected_model).lower() or "googleapis" in self.base_url:
                models_to_try = ["gemini-3.1-flash-lite", selected_model, "gemini-flash-latest"]
            elif has_imgs:
                models_to_try = ["gemini-3.1-flash-lite", selected_model, "gemini-flash-latest"]
            else:
                models_to_try = ["gemini-3.1-flash-lite", selected_model, "openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
            # Deduplicate while preserving order
            unique_models = []
            for m in models_to_try:
                if m and m not in unique_models:
                    unique_models.append(m)

            last_error = None
            for attempt_model in unique_models:
                payload["model"] = attempt_model
                try:
                    res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                    if res.status_code == 400 and "response_format" in payload:
                        payload.pop("response_format", None)
                        res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)

                    if res.status_code == 429:
                        logger.warning(f"Rate limit / Quota 429 on {attempt_model}. Trying next fallback model...")
                        continue

                    if res.status_code in (500, 502, 503, 504):
                        logger.warning(f"Google server {res.status_code} on {attempt_model}. Trying next fallback model...")
                        continue
                    
                    res.raise_for_status()
                    data = res.json()
                    choices = data.get("choices") or []
                    if not choices:
                        continue
                    first_choice = choices[0]
                    msg_obj = first_choice.get("message") or {}
                    raw_content = msg_obj.get("content") or first_choice.get("text") or ""
                    clean_content = re.sub(r'<think>[\s\S]*?</think>', '', raw_content).strip()
                    return clean_content or raw_content
                except httpx.HTTPStatusError as http_err:
                    last_error = http_err
                    if http_err.response.status_code == 400 and "response_format" in payload:
                        payload.pop("response_format", None)
                    continue
                except Exception as err:
                    last_error = err
                    logger.warning(f"Model {attempt_model} notice: {err}")
                    continue

            logger.warning(f"All AI models exhausted in chat_completion: {last_error}")
            return ""

    async def _gemini_native_text(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: int = 4096,
        api_key: str = "",
        response_format_json: bool = False,
        preferred_model: Optional[str] = None
    ) -> str:
        """Direct native Google Gemini generateContent for ultra-fast, robust text completions."""
        contents = []
        system_text = ""
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")
            if role == "system":
                if isinstance(content, str) and content.strip():
                    system_text += content.strip() + "\n"
                continue

            if isinstance(content, str) and content.strip():
                part_role = "user" if role != "assistant" else "model"
                contents.append({"role": part_role, "parts": [{"text": content.strip()}]})

        if not contents:
            return ""

        gen_config: Dict[str, Any] = {
            "temperature": temperature,
            "maxOutputTokens": min(max_tokens or 4096, 8192)
        }
        if response_format_json:
            gen_config["responseMimeType"] = "application/json"

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": gen_config
        }
        if system_text.strip():
            payload["system_instruction"] = {
                "parts": [{"text": system_text.strip()}]
            }

        candidate_models = ["gemini-3.1-flash-lite", preferred_model or self.model, "gemini-flash-latest"]
        unique_cands = []
        for m in candidate_models:
            if m and m not in unique_cands:
                unique_cands.append(m)

        async with httpx.AsyncClient(timeout=50.0) as client:
            for m in unique_cands:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts_out = candidates[0].get("content", {}).get("parts", [])
                            text_parts = [p.get("text", "") for p in parts_out if "text" in p]
                            raw_text = "".join(text_parts).strip()
                            clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
                            if clean_text:
                                return clean_text
                    elif res.status_code == 400 and "responseMimeType" in gen_config:
                        retry_payload = dict(payload)
                        retry_cfg = dict(gen_config)
                        retry_cfg.pop("responseMimeType", None)
                        retry_payload["generationConfig"] = retry_cfg
                        retry_res = await client.post(url, json=retry_payload)
                        if retry_res.status_code == 200:
                            data = retry_res.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts_out = candidates[0].get("content", {}).get("parts", [])
                                text_parts = [p.get("text", "") for p in parts_out if "text" in p]
                                raw_text = "".join(text_parts).strip()
                                clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
                                if clean_text:
                                    return clean_text
                    else:
                        logger.warning(f"Native Gemini {m} returned {res.status_code}: {res.text[:300]}")
                        continue
                except Exception as ex:
                    logger.warning(f"Native Gemini text model {m} notice: {ex}")
                    continue
        return ""

    async def _gemini_native_vision(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: int = 4096,
        api_key: str = "",
        response_format_json: bool = False
    ) -> str:
        """Direct native Google Gemini generateContent for robust, fast multi-image OCR & transcription."""
        parts = []
        system_text = ""
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")
            if role == "system":
                if isinstance(content, str) and content.strip():
                    system_text += content.strip() + "\n"
                continue

            if isinstance(content, str):
                if content.strip():
                    parts.append({"text": content.strip()})
            elif isinstance(content, list):
                # Put image parts first, then prompt text parts for optimal visual comprehension
                img_parts = []
                txt_parts = []
                for p in content:
                    if p.get("type") == "image_url":
                        url_val = (p.get("image_url") or {}).get("url", "")
                        if "base64," in url_val:
                            mime = "image/jpeg"
                            if "data:image/png" in url_val:
                                mime = "image/png"
                            elif "data:image/webp" in url_val:
                                mime = "image/webp"
                            b64_data = url_val.split("base64,")[1].strip()
                            img_parts.append({
                                "inline_data": {
                                    "mime_type": mime,
                                    "data": b64_data
                                }
                            })
                    elif p.get("type") == "text":
                        t = p.get("text", "").strip()
                        if t:
                            txt_parts.append({"text": t})
                parts.extend(img_parts)
                parts.extend(txt_parts)

        gen_config: Dict[str, Any] = {
            "temperature": temperature,
            "maxOutputTokens": min(max_tokens or 4096, 8192)
        }
        if response_format_json:
            gen_config["responseMimeType"] = "application/json"

        payload: Dict[str, Any] = {
            "contents": [{"parts": parts}],
            "generationConfig": gen_config
        }
        if system_text.strip():
            payload["system_instruction"] = {
                "parts": [{"text": system_text.strip()}]
            }

        candidate_models = ["gemini-3.1-flash-lite", self.vision_model, "gemini-flash-latest"]
        async with httpx.AsyncClient(timeout=50.0) as client:
            for m in candidate_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts_out = candidates[0].get("content", {}).get("parts", [])
                            text_parts = [p.get("text", "") for p in parts_out if "text" in p]
                            raw_text = "".join(text_parts).strip()
                            clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
                            if clean_text:
                                return clean_text
                    elif res.status_code == 400 and "responseMimeType" in gen_config:
                        # Retry without responseMimeType in case model rejects schema/instruction format
                        retry_payload = dict(payload)
                        retry_cfg = dict(gen_config)
                        retry_cfg.pop("responseMimeType", None)
                        retry_payload["generationConfig"] = retry_cfg
                        retry_res = await client.post(url, json=retry_payload)
                        if retry_res.status_code == 200:
                            data = retry_res.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts_out = candidates[0].get("content", {}).get("parts", [])
                                text_parts = [p.get("text", "") for p in parts_out if "text" in p]
                                raw_text = "".join(text_parts).strip()
                                clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
                                if clean_text:
                                    return clean_text
                    elif res.status_code in (503, 429, 404, 500, 502):
                        logger.warning(f"Gemini vision model {m} ({res.status_code}), trying next fallback...")
                        continue
                except Exception as ex:
                    logger.warning(f"Gemini vision model {m} error: {ex}, trying fallback...")
                    continue
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

    async def _stream_gemini_native(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.5,
        max_tokens: Optional[int] = None,
        candidate_models: Optional[List[str]] = None
    ) -> AsyncGenerator[str, None]:
        """Direct native Google Gemini streamGenerateContent with thinkingBudget: 0 for instant, sub-second response."""
        key = self.api_key
        contents = []
        system_instruction = None
        for m in messages:
            role = m.get("role")
            content = m.get("content", "")
            if role == "system":
                if isinstance(content, str) and content.strip():
                    system_instruction = {"parts": [{"text": content.strip()}]}
            elif role == "user":
                if isinstance(content, str) and content.strip():
                    contents.append({"role": "user", "parts": [{"text": content.strip()}]})
                elif isinstance(content, list):
                    img_parts = []
                    txt_parts = []
                    for p in content:
                        if p.get("type") == "image_url":
                            url_val = (p.get("image_url") or {}).get("url", "")
                            if "base64," in url_val:
                                mime = "image/jpeg"
                                if "data:image/png" in url_val:
                                    mime = "image/png"
                                elif "data:image/webp" in url_val:
                                    mime = "image/webp"
                                b64_data = url_val.split("base64,")[1].strip()
                                img_parts.append({"inline_data": {"mime_type": mime, "data": b64_data}})
                        elif p.get("type") == "text":
                            t = p.get("text", "").strip()
                            if t:
                                txt_parts.append({"text": t})
                    parts = img_parts + txt_parts
                    if parts:
                        contents.append({"role": "user", "parts": parts})
            elif role == "assistant":
                if isinstance(content, str) and content.strip():
                    contents.append({"role": "model", "parts": [{"text": content.strip()}]})

        models_to_try = candidate_models or ["gemini-3.1-flash-lite", self.model, "gemini-flash-latest"]
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens or 1500,
                "thinkingConfig": {"thinkingBudget": 0}
            }
        }
        if system_instruction:
            payload["system_instruction"] = system_instruction

        for m_idx, current_model in enumerate(models_to_try):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:streamGenerateContent?key={key}&alt=sse"
            has_yielded = False
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(connect=3.5, read=5.0, write=3.5, pool=3.5)) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code != 200:
                            logger.warning(f"Native Gemini model {current_model} returned {response.status_code}")
                            continue
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                chunk_str = line[6:].strip()
                                if not chunk_str:
                                    continue
                                try:
                                    data = json.loads(chunk_str)
                                    for cand in data.get("candidates", []):
                                        for p in cand.get("content", {}).get("parts", []):
                                            t = p.get("text", "")
                                            if t:
                                                clean_part = re.sub(r'<think>[\s\S]*?</think>', '', t)
                                                if clean_part:
                                                    has_yielded = True
                                                    yield clean_part
                                except Exception:
                                    pass
                        if has_yielded:
                            return
            except Exception as e:
                logger.warning(f"Error native streaming {current_model}: {e}")
                if m_idx < len(models_to_try) - 1:
                    continue

    async def stream_chat_completion(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.6,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """SSE streaming generator for real-time typing effect with pure DEVGYA branding."""
        import asyncio
        key = self.api_key
        if not key:
            yield "DEVGYA AI engine is initializing. Please try again in a few moments."
            return

        # For Google Gemini keys, use ultra-fast native streaming with thinkingBudget: 0 (sub-2s latency)
        if self.is_google:
            has_yielded = False
            try:
                cand_models = [model] if model and "gemini" in model.lower() else None
                async for chunk in self._stream_gemini_native(
                    messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    candidate_models=cand_models
                ):
                    has_yielded = True
                    yield chunk
            except Exception as gemini_err:
                logger.warning(f"Native Gemini stream error, falling back to OpenAI format: {gemini_err}")
            if has_yielded:
                return

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        selected_model = model or (self.vision_model if self._has_images(messages) else self.model)
        
        # Build candidate fallback models list with ultra-fast models
        fallback_models = [selected_model]
        if "gemini" in str(selected_model).lower() or "googleapis" in self.base_url:
            candidate_fallbacks = ["gemini-3-flash-preview", selected_model, "gemini-flash-latest"]
        else:
            candidate_fallbacks = ["openai/gpt-oss-20b", "llama-3.1-8b-instant", "qwen/qwen3.6-27b"]

        for alt_m in candidate_fallbacks:
            if alt_m and alt_m not in fallback_models:
                fallback_models.append(alt_m)

        max_turns_opt = 3 if (max_tokens and max_tokens <= 120) else 6
        payload = {
            "messages": self._optimize_messages(messages, max_turns=max_turns_opt),
            "temperature": temperature,
            "stream": True
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens

        for m_idx, current_model in enumerate(fallback_models):
            payload["model"] = current_model
            try:
                # Fast connection & read timeout (3.5s/4.5s) so stalled models fail over immediately
                async with httpx.AsyncClient(timeout=httpx.Timeout(connect=3.5, read=4.5, write=3.5, pool=3.5)) as client:
                    async with client.stream("POST", f"{self.base_url}/chat/completions", headers=headers, json=payload) as response:
                        if response.status_code == 429 or response.status_code >= 400:
                            logger.warning(f"Model {current_model} returned HTTP {response.status_code}. Retrying with fallback model...")
                            if m_idx < len(fallback_models) - 1:
                                await asyncio.sleep(0.3)
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
