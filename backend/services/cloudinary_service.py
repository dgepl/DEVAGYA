import os
import io
import base64
import logging
from typing import Optional, Dict, Any
from config import settings
import cloudinary
import cloudinary.uploader
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
        logger.info("Cloudinary successfully initialized with cloud_name: %s", settings.CLOUDINARY_CLOUD_NAME)
    except Exception as e:
        logger.warning(f"Cloudinary config warning: {e}")
else:
    logger.info("Cloudinary credentials not configured.")

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

class CloudinaryService:
    def upload_image(self, file_or_data_url: str, folder: str = "devgya_school_logos") -> Dict[str, Any]:
        """
        Upload user profile photo or school logo directly to Cloudinary storage.
        Returns dictionary with secure_url, public_id, format, width, height.
        """
        if not file_or_data_url:
            return {"status": "success", "secure_url": "", "url": ""}

        # If it's already an active HTTP/HTTPS Cloudinary CDN URL, return it directly
        if isinstance(file_or_data_url, str) and file_or_data_url.startswith("http"):
            return {
                "status": "success",
                "secure_url": file_or_data_url,
                "url": file_or_data_url
            }

        raw_bytes, compressed_b64 = _compress_image_bytes(file_or_data_url)

        # Direct Cloudinary Upload
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
            logger.error(f"Cloudinary upload exception: {c_err}")

        # Fallback to local compressed data url if network/api is down
        return {
            "status": "success",
            "secure_url": compressed_b64 or file_or_data_url,
            "url": compressed_b64 or file_or_data_url
        }

cloudinary_service = CloudinaryService()
