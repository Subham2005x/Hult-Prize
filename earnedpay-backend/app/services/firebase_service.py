import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FirebaseService:
    """Firebase Admin SDK service for authentication and Firestore operations"""
    
    def __init__(self):
        self._app = None
        self._db = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.firebase_credentials_dict)
                self._app = firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully")
            else:
                self._app = firebase_admin.get_app()
            
            self._db = firestore.client()
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise
    
    @property
    def db(self) -> firestore.Client:
        """Get Firestore client"""
        return self._db
    
    async def verify_token(self, id_token: str) -> Optional[dict]:
        """Verify Firebase ID token and return decoded token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None
    
    async def get_user(self, uid: str) -> Optional[dict]:
        """Get user document from Firestore"""
        try:
            user_ref = self._db.collection('users').document(uid)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                return {"uid": uid, **user_doc.to_dict()}
            return None
        except Exception as e:
            logger.error(f"Failed to get user {uid}: {e}")
            return None
    
    async def create_user(self, uid: str, user_data: dict) -> bool:
        """Create user document in Firestore"""
        try:
            user_ref = self._db.collection('users').document(uid)
            user_ref.set(user_data)
            logger.info(f"Created user {uid}")
            return True
        except Exception as e:
            logger.error(f"Failed to create user {uid}: {e}")
            return False
    
    async def update_user(self, uid: str, update_data: dict) -> bool:
        """Update user document in Firestore"""
        try:
            user_ref = self._db.collection('users').document(uid)
            user_ref.update(update_data)
            logger.info(f"Updated user {uid}")
            return True
        except Exception as e:
            logger.error(f"Failed to update user {uid}: {e}")
            return False


# Singleton instance
firebase_service = FirebaseService()
