from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import urllib.parse

# Parse the database URL to add SSL requirements if needed
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Create engine with SSL configurations for Azure PostgreSQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"sslmode": "require"} if "azure" in settings.POSTGRES_HOST else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 