import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "DEVGYA GLOBAL AI Engine"
    API_V1_STR: str = "/api/v1"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", os.getenv("AI_API_KEY", ""))
    GROQ_MODEL: str = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GROQ_API_KEY", ""))
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "demo")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
