import os
import logging
from pydantic_settings import BaseSettings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PlacementCopilot")

class Settings(BaseSettings):
    # App Mode
    ENVIRONMENT: str = "development"
    
    # Firebase settings (optional - falls back to local data if not supplied)
    FIREBASE_SERVICE_ACCOUNT: str | None = os.getenv("FIREBASE_SERVICE_ACCOUNT", None)
    
    # Matching thresholds and defaults
    DEFAULT_MIN_GPA: float = 6.0
    DEFAULT_GRAD_YEAR: int = 2026

settings = Settings()

# Check for Firebase availability
firebase_initialized = False
try:
    if settings.FIREBASE_SERVICE_ACCOUNT and os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT):
        import firebase_admin
        from firebase_admin import credentials, firestore, storage
        
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET", None)
        })
        db = firestore.client()
        bucket = storage.bucket() if os.getenv("FIREBASE_STORAGE_BUCKET") else None
        firebase_initialized = True
        logger.info("Successfully initialized Firebase connection!")
    else:
        logger.info("Firebase credentials not found. Falling back to local JSON database mode.")
        db = None
        bucket = None
except Exception as e:
    logger.error(f"Error initializing Firebase: {e}. Falling back to local JSON database mode.")
    db = None
    bucket = None
