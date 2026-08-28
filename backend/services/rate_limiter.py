"""
In-Memory Rate Limiting & Resource Protection Service for DEVGYA
Protects AI endpoints, OTP requests, and high-compute routes against abuse and DDoS.
"""

import time
import logging
from typing import Dict, Tuple
from collections import defaultdict
from fastapi import Request, HTTPException, status

logger = logging.getLogger("rate_limiter")


class SimpleRateLimiter:
    """Sliding-window in-memory rate limiter per IP / User identifier."""

    def __init__(self):
        # Maps key -> list of timestamps
        self.requests: Dict[str, list] = defaultdict(list)

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        """
        Check if a key has exceeded max_requests within window_seconds.
        Returns: (is_limited, remaining_retry_after_seconds)
        """
        now = time.time()
        cutoff = now - window_seconds

        # Clean old timestamps
        self.requests[key] = [t for t in self.requests[key] if t > cutoff]

        if len(self.requests[key]) >= max_requests:
            oldest = self.requests[key][0]
            retry_after = max(1, int(oldest + window_seconds - now))
            return True, retry_after

        self.requests[key].append(now)
        return False, 0


rate_limiter = SimpleRateLimiter()


def check_rate_limit(max_requests: int = 30, window_seconds: int = 60, key_prefix: str = "global"):
    """FastAPI Dependency for rate limiting endpoints."""
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown_client"
        auth_header = request.headers.get("authorization", "")
        # Use auth token or IP as rate limiting key
        identifier = auth_header[:30] if auth_header else client_ip
        key = f"{key_prefix}:{identifier}"

        is_limited, retry_after = rate_limiter.is_rate_limited(key, max_requests, window_seconds)
        if is_limited:
            logger.warning(f"Rate limit triggered for {key} on {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please slow down and try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        return True
    return dependency
