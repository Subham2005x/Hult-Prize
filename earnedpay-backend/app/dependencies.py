from fastapi import Header, HTTPException, status, Depends
from typing import Optional
from app.services.firebase_service import firebase_service
import logging

logger = logging.getLogger(__name__)



async def get_firebase_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependency to verify Firebase ID token only
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    decoded_token = await firebase_service.verify_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return decoded_token


async def get_current_user(firebase_user: dict = Depends(get_firebase_user)) -> dict:
    """
    Dependency to get current authenticated user from Firestore
    """
    uid = firebase_user.get("uid")
    user = await firebase_service.get_user(uid)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not registered"
        )
    
    return user


async def get_current_worker(current_user: dict = None) -> dict:
    """
    Dependency to ensure current user is a worker
    """
    if not current_user:
        from fastapi import Depends
        current_user = Depends(get_current_user)
    
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    return current_user


async def get_current_employer(current_user: dict = None) -> dict:
    """
    Dependency to ensure current user is an employer
    """
    if not current_user:
        from fastapi import Depends
        current_user = Depends(get_current_user)
    
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    return current_user
