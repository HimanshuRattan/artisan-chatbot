import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Chat Widget API"
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./test.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

settings = Settings()