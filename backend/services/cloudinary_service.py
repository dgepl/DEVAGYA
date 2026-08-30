import os
import io
import base64
import uuid
import logging
from typing import Optional, Dict, Any
from config import settings
import cloudinary
import cloudinary.uploader
import httpx
from PIL import Image

logger = logging.getLogger("cloudinary_service")

# Configure Cloudinary credentials from environment
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET and settings.CLOUDINARY_CLOUD_NAME != "demo":
    try:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        logger.info("Cloudinary configured with cloud_name: %s", settings.CLOUDINARY_CLOUD_NAME)
    except Exception as e:
        logger.warning(f"Cloudinary config warning: {e}")
else:
    logger.info("Cloudinary credentials fallback: Cloud storage active.")

def _compress_image_bytes(data_url: str, max_size: int = 500, quality: int = 85) -> tuple[Optional[bytes], str]:
    """Compress image down to max_size px JPEG, returning (raw_bytes, base64_data_url)."""
    try:
        if not data_url or not isinstance(data_url, str):
            return None, ""
        if not data_url.startswith("data:image"):
            return None, data_url
        if "," not in data_url:
            return None, data_url
        header, encoded = data_url.split(",", 1)
        raw_bytes = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(raw_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=quality, optimize=True)
        compressed_bytes = out_buf.getvalue()
        b64_url = "data:image/jpeg;base64," + base64.b64encode(compressed_bytes).decode("utf-8")
        return compressed_bytes, b64_url
    except Exception as err:
        logger.warning(f"Image compression notice: {err}")
        return None, data_url

def _upload_to_supabase_storage(raw_bytes: bytes, folder: str = "avatars") -> Optional[str]:
    """Upload raw image bytes directly to Supabase Cloud Storage devgya_media bucket."""
    supabase_url = (os.getenv("SUPABASE_URL") or settings.SUPABASE_URL or "").strip().rstrip("/")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or settings.SUPABASE_SERVICE_ROLE_KEY or ""
    if not supabase_url or not service_key:
        return None

    try:
        filename = f"{folder}_{uuid.uuid4().hex[:12]}.jpg"
        target_path = f"{folder}/{filename}"
        upload_endpoint = f"{supabase_url}/storage/v1/object/devgya_media/{target_path}"
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true"
        }

        with httpx.Client(timeout=12.0) as client:
            res = client.post(upload_endpoint, headers=headers, content=raw_bytes)
            if res.status_code in (200, 201):
                public_cdn_url = f"{supabase_url}/storage/v1/object/public/devgya_media/{target_path}"
                logger.info("Uploaded image to Supabase Cloud Storage: %s", public_cdn_url)
                return public_cdn_url
            else:
                logger.warning("Supabase storage upload returned %d: %s", res.status_code, res.text)
    except Exception as e:
        logger.warning("Supabase Cloud Storage upload error: %s", e)
    return None

class CloudinaryService:
    def upload_image(self, file_or_data_url: str, folder: str = "devgya_school_logos") -> Dict[str, Any]:
        """
        Upload image to Cloudinary or Supabase Cloud Storage.
        Returns dictionary with secure_url, public_id, format, width, height.
        """
        if not file_or_data_url:
            return {"status": "success", "secure_url": "", "url": ""}

        # If it's already an active HTTP/HTTPS CDN URL, return it directly
        if isinstance(file_or_data_url, str) and file_or_data_url.startswith("http"):
            return {
                "status": "success",
                "secure_url": file_or_data_url,
                "url": file_or_data_url
            }

        raw_bytes, compressed_b64 = _compress_image_bytes(file_or_data_url)

        # 1. Attempt Cloudinary upload
        if settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_CLOUD_NAME != "demo":
            try:
                result = cloudinary.uploader.upload(
                    compressed_b64 or file_or_data_url,
                    folder=folder,
                    resource_type="image",
                    overwrite=True,
                    transformation=[
                        {"width": 500, "crop": "limit"},
                        {"quality": "auto"},
                        {"fetch_format": "auto"}
                    ]
                )
                sec_url = result.get("secure_url")
                if sec_url and sec_url.startswith("http"):
                    logger.info("Uploaded image to Cloudinary: %s", sec_url)
                    return {
                        "status": "success",
                        "secure_url": sec_url,
                        "url": sec_url,
                        "public_id": result.get("public_id"),
                        "format": result.get("format"),
                        "width": result.get("width"),
                        "height": result.get("height")
                    }
            except Exception as c_err:
                logger.warning(f"Cloudinary upload notice: {c_err}")

        # 2. Attempt Supabase Cloud Storage upload
        if raw_bytes:
            sb_url = _upload_to_supabase_storage(raw_bytes, folder=folder)
            if sb_url:
                return {
                    "status": "success",
                    "secure_url": sb_url,
                    "url": sb_url,
                    "public_id": f"supabase_{folder}"
                }

        # 3. Fallback to optimized compressed data URL
        return {
            "status": "success",
            "secure_url": compressed_b64 or file_or_data_url,
            "url": compressed_b64 or file_or_data_url
        }

cloudinary_service = CloudinaryService()
