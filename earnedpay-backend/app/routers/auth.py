from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, get_firebase_user
from app.services.firebase_service import firebase_service
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class VerifyTokenRequest(BaseModel):
    role: str = "worker"

@router.post("/verify-token")
async def verify_token(
    request: VerifyTokenRequest,
    decoded_token: dict = Depends(get_firebase_user)
):
    """
    Verify Firebase ID token and get/create user with specific role
    Uses Firebase for authentication, MongoDB for data storage
    """
    from app.services.mongodb_service import mongodb_service
    
    uid = decoded_token.get("uid")
    logger.info(f"🔐 verify-token called for UID: {uid}, role: {request.role}")
    
    user = await mongodb_service.get_user(uid)

    if not user:
        # Create new user in MongoDB
        phone_number = decoded_token.get("phone_number", "")
        email = decoded_token.get("email", "")
        
        import random
        import string
        
        # Generate Custom ID (EP-XXXX)
        random_suffix = ''.join(random.choices(string.digits, k=4))
        custom_id = f"EP-{random_suffix}"
        
        new_user_data = {
            "phone_number": phone_number,
            "email": email,
            "customId": custom_id,
            "password": "1234",  # Default password for now
            "role": request.role
        }
        
        logger.info(f"📝 Creating new user in MongoDB: {uid}")
        await mongodb_service.create_user(uid, new_user_data)
        logger.info(f"✅ User created successfully: {uid}")
        user = {"_id": uid, **new_user_data}
        
        # If employer, create employer profile
        if request.role == "employer":
            logger.info(f"👔 Creating employer profile for: {uid}")
            employer_data = {
                "company_name": email.split('@')[0] if email else "My Company",
                "contact_person": "",
                "email": email,
            }
            await mongodb_service.create_employer(uid, employer_data)
            logger.info(f"✅ Employer profile created: {uid}")
    else:
        logger.info(f"✅ User already exists: {uid}")
        
        # Check if employer profile exists (for existing users upgrading to employer)
        if user.get('role') == 'employer':
            employer = await mongodb_service.get_employer(uid)
            if not employer:
                logger.info(f"👔 Creating missing employer profile for: {uid}")
                employer_data = {
                    "company_name": user.get('email', '').split('@')[0] if user.get('email') else "My Company",
                    "contact_person": "",
                    "email": user.get('email', ''),
                }
                await mongodb_service.create_employer(uid, employer_data)
                logger.info(f"✅ Employer profile created: {uid}")

    return {
        "success": True,
        "user": user
    }


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user
