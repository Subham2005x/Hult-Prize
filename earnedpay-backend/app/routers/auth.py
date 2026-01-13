from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.services.firebase_service import firebase_service
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


from pydantic import BaseModel
from app.dependencies import get_current_user, get_firebase_user
import logging

class VerifyTokenRequest(BaseModel):
    role: str = "worker"

@router.post("/verify-token")
async def verify_token(
    request: VerifyTokenRequest,
    decoded_token: dict = Depends(get_firebase_user)
):
    """
    Verify Firebase ID token and get/create user with specific role
    """
    uid = decoded_token.get("uid")
    user = await firebase_service.get_user(uid)

    if not user:
        # Create new user
        phone_number = decoded_token.get("phone_number", "")
        email = decoded_token.get("email", "")
        
        import random
        import string
        
        # Generate Custom ID (EP-XXXX)
        random_suffix = ''.join(random.choices(string.digits, k=4))
        custom_id = f"EP-{random_suffix}"
        
        new_user_data = {
            "phoneNumber": phone_number,
            "email": email,
            "customId": custom_id,
            "password": "1234", # Default password for now
            "role": request.role,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "isGoogleAuth": bool(email)
        }
        
        await firebase_service.create_user(uid, new_user_data)
        user = {"uid": uid, **new_user_data}

    return {
        "success": True,
        "user": user
    }


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user
