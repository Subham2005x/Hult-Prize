from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.employer import EmployerDashboard, AttendanceSubmit, EmployerUpdate
from app.models.worker import WorkerCreate
from app.services.firebase_service import firebase_service  # Auth only
from app.services.mongodb_service import mongodb_service  # Data storage
from app.services.wage_calculator import wage_calculator
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/employers", tags=["Employers"])


@router.get("/me")
async def get_employer_profile(current_user: dict = Depends(get_current_user)):
    """Get current employer profile"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer = await mongodb_service.get_employer(current_user["uid"])
    
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
    
    return {"id": current_user["uid"], **employer}


@router.put("/me")
async def update_employer_profile(
    update_data: EmployerUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update employer profile and settings"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer = await mongodb_service.get_employer(current_user["uid"])
    
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
        
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Map to MongoDB field names
    mongodb_update = {}
    if 'company_name' in update_dict:
        mongodb_update['companyName'] = update_dict['company_name']
    if 'phone_number' in update_dict:
        mongodb_update['phoneNumber'] = update_dict['phone_number']
    if 'gst_number' in update_dict:
        mongodb_update['gstNumber'] = update_dict['gst_number']
    if 'withdrawal_config' in update_dict:
        mongodb_update['withdrawalConfig'] = update_dict['withdrawal_config']
        
    if mongodb_update:
        await mongodb_service.update_employer(current_user["uid"], mongodb_update)
        
    return {"success": True, "message": "Profile updated successfully"}


@router.get("/me/workers")
async def list_workers(current_user: dict = Depends(get_current_user)):
    """List all workers under this employer"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    workers = await mongodb_service.get_employer_workers(employer_id)
    
    # Add id field from _id
    for worker in workers:
        worker['id'] = worker['_id']
    
    return {"workers": workers}


@router.post("/me/workers")
async def add_worker(
    worker_data: WorkerCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new worker (worker must have logged in first to create Firebase Auth account)"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    # Check if employer exists in MongoDB
    employer = await mongodb_service.get_employer(employer_id)
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found. Please complete your profile first."
        )
    
    # Preprocess: Convert empty strings to None
    if worker_data.phone_number == "":
        worker_data.phone_number = None
    if worker_data.email == "":
        worker_data.email = None
    
    # Normalize phone number (remove spaces)
    if worker_data.phone_number:
        worker_data.phone_number = worker_data.phone_number.replace(" ", "").strip()
    
    # Validate that at least one identifier (phone or email) is provided
    if not worker_data.phone_number and not worker_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either phone number or email must be provided"
        )
    
    # Look up worker by phone number OR email in MongoDB users collection
    try:
        # Build query based on what's provided
        query = {}
        if worker_data.phone_number:
            query["phoneNumber"] = worker_data.phone_number
            logger.info(f"🔍 Looking up worker by phone: {worker_data.phone_number}")
        elif worker_data.email:
            query["email"] = worker_data.email
            logger.info(f"🔍 Looking up worker by email: {worker_data.email}")
        
        worker_user = await mongodb_service.db.users.find_one(query)
        
        if worker_user:
            logger.info(f"✅ Found worker by {'phone' if worker_data.phone_number else 'email'}: {worker_user['_id']}")
        else:
            logger.warning(f"❌ Worker not found in database with query: {query}")
    except Exception as e:
        logger.error(f"Error looking up worker: {e}")
        worker_user = None
    
    if not worker_user:
        identifier = worker_data.phone_number or worker_data.email
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Worker with {identifier} must login to the app first to create their account. Ask them to download the app and complete login."
        )
    
    worker_uid = worker_user['_id']
    
    # Check if worker already exists for this employer
    existing_worker = await mongodb_service.get_worker(worker_uid)
    if existing_worker:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker already exists in the system"
        )
    
    # Get employer config
    withdrawal_config = employer.get('withdrawalConfig', {})
    payday_date = withdrawal_config.get('paydayDate', 1)
    
    # Create worker in MongoDB with Firebase UID
    worker_id = await mongodb_service.create_worker(
        worker_uid,
        {
            "employer_id": employer_id,
            "full_name": worker_data.full_name,
            "phone_number": worker_data.phone_number or worker_user.get('phoneNumber', ''),
            "email": worker_data.email or worker_user.get('email', ''),
            "upi_id": worker_data.upi_id
        }
    )
    
    # Create initial wage ledger
    await mongodb_service.create_wage_ledger(worker_uid, employer_id)
    
    return {
        "success": True,
        "worker_id": worker_id,
        "message": f"Worker {worker_data.full_name} added successfully"
    }


@router.get("/me/dashboard", response_model=EmployerDashboard)
async def get_employer_dashboard(current_user: dict = Depends(get_current_user)):
    """Get employer dashboard statistics"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    # Get all workers
    workers = await mongodb_service.get_employer_workers(employer_id)
    total_workers = len(workers)
    active_workers = sum(1 for w in workers if w.get('isActive', True))
    
    # Calculate totals from wage ledgers
    total_earnings = 0.0
    total_withdrawals = 0.0
    
    for worker in workers:
        ledger = await mongodb_service.get_wage_ledger(worker['_id'])
        if ledger:
            total_earnings += ledger.get('totalEarned', 0.0)
            total_withdrawals += ledger.get('totalWithdrawn', 0.0)
    
    pending_settlement = total_earnings - total_withdrawals
    
    # Get employer config for next payday
    employer = await mongodb_service.get_employer(employer_id)
    withdrawal_config = employer.get('withdrawalConfig', {}) if employer else {}
    payday_date = withdrawal_config.get('paydayDate', 1)
    next_payday = wage_calculator.get_next_payday(payday_date)
    
    return EmployerDashboard(
        total_workers=total_workers,
        active_workers=active_workers,
        total_earnings_this_month=total_earnings,
        total_withdrawals_this_month=total_withdrawals,
        pending_settlement=pending_settlement,
        next_payday=next_payday
    )


@router.post("/attendance")
async def submit_attendance(
    attendance_data: AttendanceSubmit,
    current_user: dict = Depends(get_current_user)
):
    """Submit attendance and update wage ledgers"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    # Get employer config
    employer = await mongodb_service.get_employer(employer_id)
    withdrawal_config = employer.get('withdrawalConfig', {}) if employer else {}
    max_percentage = withdrawal_config.get('maxPercentage', 40)
    
    # Process each attendance entry
    processed_entries = []
    
    for entry in attendance_data.entries:
        # Calculate earnings
        total_earned = wage_calculator.calculate_daily_earnings(
            hours_worked=entry.hours_worked,
            wage_per_hour=entry.wage_per_hour
        )
        
        # Create attendance record
        attendance_record = {
            "worker_id": entry.worker_id,
            "employer_id": employer_id,
            "date": datetime.strptime(entry.date, "%Y-%m-%d"),
            "hours_worked": entry.hours_worked,
            "wage_per_hour": entry.wage_per_hour,
            "total_earned": total_earned,
            "status": entry.status
        }
        
        await mongodb_service.add_attendance(attendance_record)
        
        # Update wage ledger (atomic increment)
        await mongodb_service.increment_earnings(entry.worker_id, total_earned)
        
        processed_entries.append({
            "worker_id": entry.worker_id,
            "date": entry.date,
            "earned": total_earned
        })
    
    return {
        "success": True,
        "message": f"Processed {len(processed_entries)} attendance entries",
        "entries": processed_entries
    }
