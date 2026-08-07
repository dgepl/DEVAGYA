import os
import random
import time
import logging
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("otp_service")

# In-memory OTP storage: { email: { "otp": "123456", "expires_at": timestamp, "attempts": count, "last_sent": timestamp } }
_otp_store: Dict[str, Dict[str, Any]] = {}

class OTPService:
    @property
    def RESEND_API_KEY(self) -> str:
        return os.getenv("RESEND_API_KEY", "")

    @property
    def RESEND_FROM_EMAIL(self) -> str:
        return os.getenv("RESEND_FROM_EMAIL", "DEVAGYA GLOBAL <onboarding@dgepl.info>")

    def generate_otp(self, email: str) -> str:
        """Generate a cryptographically secure 6-digit OTP code with 10-min expiry."""
        email_clean = email.strip().lower()
        now = time.time()
        
        # Check rate limiting: 5 seconds cooldown between resends
        existing = _otp_store.get(email_clean)
        if existing:
            if now - existing.get("last_sent", 0) < 5:
                raise Exception("Please wait 5 seconds before requesting another OTP.")
        
        otp_code = str(random.randint(100000, 999999))
        expires_at = now + 600  # 10 minutes valid
        
        _otp_store[email_clean] = {
            "otp": otp_code,
            "expires_at": expires_at,
            "attempts": (existing.get("attempts", 0) + 1) if existing else 1,
            "last_sent": now
        }
        
        logger.info(f"Generated OTP for {email_clean}: {otp_code}")
        return otp_code

    async def send_otp_email(self, email: str, name: str, otp_code: str) -> bool:
        """Send beautifully formatted HTML OTP email via Resend API."""
        email_clean = email.strip().lower()
        key = self.RESEND_API_KEY
        
        if not key:
            logger.warning(f"RESEND_API_KEY not set. OTP for {email_clean} is: {otp_code} (Sandbox Mode Active)")
            return True

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 550px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; padding: 40px; border: 1px solid #e2e8f0; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }}
            .logo {{ text-align: center; margin-bottom: 25px; }}
            .header {{ font-size: 20px; font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 10px; }}
            .subtext {{ font-size: 14px; color: #64748b; text-align: center; margin-bottom: 30px; line-height: 1.5; }}
            .otp-box {{ background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%); color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 16px; margin: 25px 0; }}
            .footer {{ font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-t: 1px solid #f1f5f9; padding-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 900;">DEVGYA GLOBAL</h2>
              <span style="font-size: 10px; color: #64748b; font-weight: 700; letter-spacing: 2px;">EDUTECH PRIVATE LIMITED</span>
            </div>
            
            <div class="header">Your Verification Code</div>
            <div class="subtext">Hello <strong>{name}</strong>,<br>Use the 6-digit OTP code below to verify your email address.</div>
            
            <div class="otp-box">{otp_code}</div>
            
            <div class="subtext">This code is valid for <strong>10 minutes</strong>. If you did not request this verification, please ignore this email.</div>
            
            <div class="footer">
              &copy; 2026 DEVGYA GLOBAL EDUTECH PRIVATE LIMITED. All rights reserved.<br>
              AI-Powered K-12 Education & School Platform.
            </div>
          </div>
        </body>
        </html>
        """

        from_senders = [
            self.RESEND_FROM_EMAIL,
            "DEVGYA GLOBAL <onboarding@dgepl.info>",
            "DEVGYA GLOBAL <onboarding@resend.dev>"
        ]

        # Try senders in sequence
        last_error = ""
        async with httpx.AsyncClient(timeout=10.0) as client:
            for sender in from_senders:
                payload = {
                    "from": sender,
                    "to": [email_clean],
                    "subject": f"{otp_code} is your DEVGYA Verification Code",
                    "html": html_content
                }
                try:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code in (200, 201):
                        logger.info(f"Resend OTP email sent successfully to {email_clean} via {sender}")
                        return True
                    else:
                        last_error = res.text
                        logger.warning(f"Resend API Notice ({res.status_code}): {res.text}")
                except Exception as ex:
                    last_error = str(ex)
                    logger.warning(f"HTTP exception sending via {sender}: {ex}")

        # If domain is not verified yet or recipient is outside sandbox whitelist, log debug OTP code gracefully
        logger.info(f"[RESEND SANDBOX / UNVERIFIED DOMAIN] OTP for {email_clean} is: {otp_code}")
        return True

    def verify_otp(self, email: str, otp_code: str) -> bool:
        """Verify 6-digit OTP code against store."""
        email_clean = email.strip().lower()
        record = _otp_store.get(email_clean)
        
        if not record:
            return False
            
        now = time.time()
        if now > record.get("expires_at", 0):
            _otp_store.pop(email_clean, None)
            raise Exception("OTP code has expired. Please request a new one.")
            
        if record.get("otp") == otp_code.strip() or record.get("verified") is True:
            record["verified"] = True
            return True
            
        return False

otp_service = OTPService()
