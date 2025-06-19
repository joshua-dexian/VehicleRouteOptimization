import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Azure PostgreSQL connection string format
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres@scm_app_user:S3cur3Tr%40ckP%40ss@disc-post-db.postgres.database.azure.com:5432/scm_tracker_db?sslmode=require")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "scm_app_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "S3cur3Tr@ckP@ss")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "scm_tracker_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "disc-post-db.postgres.database.azure.com")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    
    # Google Maps API settings
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Cache settings for geocoding and distance matrix
    GEOCODING_CACHE_SIZE: int = int(os.getenv("GEOCODING_CACHE_SIZE", "1000"))
    GEOCODING_CACHE_TTL: int = int(os.getenv("GEOCODING_CACHE_TTL", "86400"))  # 24 hours in seconds
    DISTANCE_MATRIX_CACHE_SIZE: int = int(os.getenv("DISTANCE_MATRIX_CACHE_SIZE", "10000"))
    DISTANCE_MATRIX_CACHE_TTL: int = int(os.getenv("DISTANCE_MATRIX_CACHE_TTL", "86400"))  # 24 hours

settings = Settings() 