import os
import logging
from typing import Optional, Dict, Any
from config import settings
import cloudinary
import cloudinary.uploader

logger = logging.getLogger("cloudinary_service")

# Configure Cloudinary credentials from environment
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info("Cloudinary configured with cloud_name: %s", settings.CLOUDINARY_CLOUD_NAME)
else:
    logger.info("Cloudinary credentials not fully configured; base64 fallback active.")

class CloudinaryService:
    def upload_image(self, file_or_data_url: str, folder: str = "devgya_school_logos") -> Dict[str, Any]:
        """
        Upload image (file path, base64 data URL, or remote URL) to Cloudinary.
        Returns dictionary with secure_url, public_id, format, width, height.
        """
        try:
            if not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_CLOUD_NAME or settings.CLOUDINARY_CLOUD_NAME == "demo":
                # Return data URL as secure fallback when Cloudinary credentials aren't set
                return {
                    "status": "fallback",
                    "secure_url": file_or_data_url,
                    "url": file_or_data_url,
                    "public_id": "local_fallback"
                }

            result = cloudinary.uploader.upload(
                file_or_data_url,
                folder=folder,
                resource_type="image",
                overwrite=True,
                transformation=[
                    {"width": 800, "crop": "limit"},
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
            logger.error("Cloudinary upload failed: %s", e)
            # Gracefully fallback to the data URL so user operations never fail
            return {
                "status": "fallback",
                "secure_url": file_or_data_url,
                "url": file_or_data_url,
                "error": str(e)
            }

cloudinary_service = CloudinaryService()
