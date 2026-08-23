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
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_CLOUD_NAME != "devagya":
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
    logger.info("Cloudinary credentials fallback: high-performance compressed base64 active.")

def _compress_base64_image(data_url: str, max_size: int = 350, quality: int = 82) -> str:
    """Compress base64 image down to max_size px JPEG so it is lightweight (<30KB)."""
    try:
        if not data_url or not isinstance(data_url, str) or not data_url.startswith("data:image"):
            return data_url
        if "," not in data_url:
            return data_url
        header, encoded = data_url.split(",", 1)
        raw_bytes = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(raw_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=quality, optimize=True)
        compressed_bytes = out_buf.getvalue()
        return "data:image/jpeg;base64," + base64.b64encode(compressed_bytes).decode("utf-8")
    except Exception as err:
        logger.warning(f"Image compression notice: {err}")
        return data_url

class CloudinaryService:
    def upload_image(self, file_or_data_url: str, folder: str = "devgya_school_logos") -> Dict[str, Any]:
        """
        Upload image (file path, base64 data URL, or remote URL) to Cloudinary.
        Returns dictionary with secure_url, public_id, format, width, height.
        """
        compressed_url = _compress_base64_image(file_or_data_url)
        try:
            if not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_CLOUD_NAME or settings.CLOUDINARY_CLOUD_NAME in ("demo", "devagya"):
                return {
                    "status": "success",
                    "secure_url": compressed_url,
                    "url": compressed_url,
                    "public_id": "optimized_fallback"
                }

            result = cloudinary.uploader.upload(
                compressed_url,
                folder=folder,
                resource_type="image",
                overwrite=True,
                transformation=[
                    {"width": 500, "crop": "limit"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            logger.info("Uploaded image to Cloudinary: %s", result.get("secure_url"))
            return {
                "status": "success",
                "secure_url": result.get("secure_url"),
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height")
            }
        except Exception as e:
            logger.warning("Cloudinary upload fallback to compressed image: %s", e)
            return {
                "status": "success",
                "secure_url": compressed_url,
                "url": compressed_url,
                "error": str(e)
            }

cloudinary_service = CloudinaryService()
