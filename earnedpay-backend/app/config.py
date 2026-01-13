from pydantic_settings import BaseSettings
from typing import Optional
import json


class Settings(BaseSettings):
    # Firebase
    firebase_credentials: str
    firebase_project_id: str
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    # UPI
    upi_mock_mode: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def firebase_credentials_dict(self) -> dict:
        """Parse Firebase credentials from JSON string"""
        try:
            return json.loads(self.firebase_credentials)
        except json.JSONDecodeError:
            raise ValueError("Invalid Firebase credentials JSON")
    
    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse allowed origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
