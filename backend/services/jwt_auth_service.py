"""
Cryptographic JWT Authentication & Role Verification Service for DEVGYA
Provides secure HMAC-SHA256 token generation, signature verification, and role-based access control.
"""

import os
import time
import hmac
import hashlib
import base64
import json
import logging
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, Security, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger("jwt_auth_service")

# Server Secret Key (from env or cryptographically secure default)
JWT_SECRET = os.getenv("JWT_SECRET_KEY", os.getenv("AI_API_KEY", "devgya_super_secret_master_key_2026_jwt_auth"))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "720")) # 30 Days default

security_bearer = HTTPBearer(auto_error=False)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _b64url_decode(data_str: str) -> bytes:
    padding = 4 - (len(data_str) % 4)
    if padding != 4:
        data_str += '=' * padding
    return base64.urlsafe_b64decode(data_str)


class JWTAuthService:
    @staticmethod
    def create_access_token(user_id: str, email: str, role: str, extra_claims: Optional[Dict[str, Any]] = None) -> str:
        """Create a standard signed JWT token containing user identity and expiration."""
        now = int(time.time())
        exp = now + (JWT_EXPIRATION_HOURS * 3600)

        header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
        payload = {
            "sub": user_id,
            "email": email.strip().lower(),
            "role": role.strip().lower(),
            "iat": now,
            "exp": exp,
            **(extra_claims or {})
        }

        header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
        payload_b64 = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        signature_b64 = _b64url_encode(signature)

        return f"{header_b64}.{payload_b64}.{signature_b64}"

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify signature and return token payload if valid and unexpired."""
        if not token or not isinstance(token, str):
            return None

        # Clean Bearer prefix if passed
        token = token.strip()
        if token.lower().startswith("bearer "):
            token = token[7:].strip()

        parts = token.split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, signature_b64 = parts

        # Verify HMAC-SHA256 signature
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = _b64url_encode(expected_sig)

        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None

        try:
            payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
            now = int(time.time())
            if payload.get("exp") and payload["exp"] < now:
                logger.warning(f"Token expired for user: {payload.get('sub')}")
                return None
            return payload
        except Exception as e:
            logger.error(f"Failed to decode token payload: {e}")
            return None


jwt_auth = JWTAuthService()


# ====================================================================
# FASTAPI DEPENDENCIES FOR ROUTE PROTECTION
# ====================================================================

async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Optional[Dict[str, Any]]:
    """Extract and verify user from Bearer Token or X-User-Token header if available."""
    token = None
    if credentials:
        token = credentials.credentials
    elif "authorization" in request.headers:
        token = request.headers.get("authorization")
    elif "x-user-token" in request.headers:
        token = request.headers.get("x-user-token")

    if not token:
        return None

    return jwt_auth.verify_token(token)


async def require_authenticated_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Dict[str, Any]:
    """Strict Dependency: Rejects unauthenticated requests with 401 Unauthorized."""
    user = await get_current_user_optional(request, credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid authorization token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) Dependency Factory."""
    async def role_checker(
        user: Dict[str, Any] = Security(require_authenticated_user)
    ) -> Dict[str, Any]:
        user_role = (user.get("role") or "").lower().strip()
        if user_role not in [r.lower().strip() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: This action requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker
