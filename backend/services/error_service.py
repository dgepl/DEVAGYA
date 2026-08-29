import logging
import httpx
from typing import Tuple

logger = logging.getLogger("error_service")

def format_ai_exception_detail(e: Exception, fallback_title: str = "Assessment Generation") -> Tuple[int, str]:
    """
    Translates raw backend exceptions, HTTP status errors, and AI provider messages
    into crystal-clear, categorized, and actionable error descriptions for end users.
    """
    err_str = str(e)
    lower_err = err_str.lower()

    # 1. Inspect HTTP status errors from AI Providers (Groq / OpenAI / Cloud)
    if isinstance(e, httpx.HTTPStatusError):
        code = e.response.status_code
        try:
            resp_json = e.response.json()
            provider_msg = (
                resp_json.get("error", {}).get("message")
                or resp_json.get("detail")
                or resp_json.get("message")
                or ""
            )
        except Exception:
            provider_msg = e.response.text or ""

        if code == 429 or "rate limit" in provider_msg.lower() or "too many requests" in provider_msg.lower():
            return 429, (
                "⚠️ AI Rate Limit Reached: The AI provider is temporarily busy handling high request volume. "
                "Please wait 10–15 seconds and click Generate again."
            )
        if code == 401 or "unauthorized" in provider_msg.lower() or "invalid api key" in provider_msg.lower():
            return 401, (
                "🔑 AI Authentication Error: The AI service API credentials are invalid or expired. "
                "Please contact system administrator."
            )
        if code == 413 or "context length" in provider_msg.lower() or "maximum context" in provider_msg.lower() or "too large" in provider_msg.lower():
            return 413, (
                "📁 Content Length Exceeded: The requested assessment length or uploaded document is too large. "
                "Please reduce the number of questions or upload a shorter chapter section."
            )
        if code in (502, 503, 504) or "overloaded" in provider_msg.lower() or "temporarily unavailable" in provider_msg.lower():
            return 503, (
                "🌐 AI Provider Overloaded: The AI model service is temporarily experiencing high load. "
                "Please try again in a few moments."
            )
        if provider_msg:
            return code, f"AI Provider Error: {provider_msg}"

    # 2. Inspect text-based error strings
    if "429" in err_str or "rate limit" in lower_err or "too many requests" in lower_err:
        return 429, (
            "⚠️ AI Rate Limit Reached: The AI provider is temporarily busy handling high request volume. "
            "Please wait 10–15 seconds and click Generate again."
        )

    if "401" in err_str or "unauthorized" in lower_err or "invalid_api_key" in lower_err:
        return 401, (
            "🔑 AI Authentication Error: The AI service API credentials are invalid or expired. "
            "Please contact system administrator."
        )

    if "413" in err_str or "context length" in lower_err or "maximum context" in lower_err:
        return 413, (
            "📁 Content Length Exceeded: The requested question count or document is too large. "
            "Please try generating with fewer questions."
        )

    if "503" in err_str or "502" in err_str or "504" in err_str or "overloaded" in lower_err:
        return 503, (
            "🌐 AI Provider Overloaded: The AI engine is temporarily busy. "
            "Please wait a moment and try again."
        )

    # 3. Connection & Timeout
    if isinstance(e, (httpx.ConnectError, httpx.TimeoutException)) or "timeout" in lower_err or "connecterror" in lower_err or "timed out" in lower_err:
        return 504, (
            "⏱️ AI Request Timeout: The generation request took longer than 45 seconds to complete. "
            "Please try generating in smaller question batches."
        )

    # 4. Attachment / Document parsing issues
    if "unreadable" in lower_err or "attachment" in lower_err or "pdf parsing" in lower_err or "image parsing" in lower_err or "corrupted" in lower_err:
        return 400, f"📄 Unreadable Attachment: {err_str}"

    # 5. Empty or malformed responses
    if "empty response" in lower_err or "no questions" in lower_err or "zero questions" in lower_err:
        return 422, (
            "⚠️ Incomplete Generation: The AI model did not return complete questions for this topic. "
            "Please adjust your prompt instructions or subject topic and retry."
        )

    # Default fallback with actual exception detail
    return 500, f"{fallback_title} Error: {err_str}"
