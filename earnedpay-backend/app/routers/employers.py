from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.employer import EmployerDashboard, AttendanceSubmit, EmployerUpdate
from app.models.worker import WorkerCreate
from app.services.firebase_service import firebase_service
from app.services.wage_calculator import wage_calculator
from datetime import datetime
import uuid
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
    
    employer_ref = firebase_service.db.collection('employers').document(current_user["uid"])
    employer_doc = employer_ref.get()
    
    if not employer_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
    
    return {"id": current_user["uid"], **employer_doc.to_dict()}


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
    
    employer_ref = firebase_service.db.collection('employers').document(current_user["uid"])
    employer_doc = employer_ref.get()
    
    if not employer_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
        
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Map snake_case to camelCase for Firestore if needed, or keep consistent. 
    # Current codebase seems to mix, but let's stick to camelCase for Firestore fields used in frontend often, 
    # but the model uses snake_case. Let's map key fields.
    firestore_update = {}
    if 'company_name' in update_dict:
        firestore_update['companyName'] = update_dict['company_name']
    if 'phone_number' in update_dict:
        firestore_update['phoneNumber'] = update_dict['phone_number']
    if 'gst_number' in update_dict:
        firestore_update['gstNumber'] = update_dict['gst_number']
    if 'withdrawal_config' in update_dict:
        firestore_update['withdrawalConfig'] = update_dict['withdrawal_config']
        
    if firestore_update:
        firestore_update['updatedAt'] = datetime.utcnow()
        employer_ref.update(firestore_update)
        
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
    
    workers_query = firebase_service.db.collection('workers') \
        .where('employerId', '==', employer_id) \
        .where('isActive', '==', True)
    
    workers = []
    for doc in workers_query.get():
        worker_data = doc.to_dict()
        workers.append({
            "id": doc.id,
            **worker_data
        })
    
    return {"workers": workers}


@router.post("/me/workers")
async def add_worker(
    worker_data: WorkerCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new worker"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    # Get employer config
    employer_ref = firebase_service.db.collection('employers').document(employer_id)
    employer_doc = employer_ref.get()
    employer_data = employer_doc.to_dict() if employer_doc.exists else {}
    withdrawal_config = employer_data.get('withdrawalConfig', {})
    payday_date = withdrawal_config.get('paydayDate', 1)
    
    # Create worker ID
    worker_id = str(uuid.uuid4())
    
    # Create worker document
    worker_doc_data = {
        "employerId": employer_id,
        "fullName": worker_data.full_name,
        "phoneNumber": worker_data.phone_number,
        "upiId": worker_data.upi_id,
        "joinedAt": datetime.utcnow(),
        "isActive": True,
        "currentMonthEarnings": 0.0,
        "totalWithdrawn": 0.0,
        "nextPayday": wage_calculator.get_next_payday(payday_date)
    }
    
    worker_ref = firebase_service.db.collection('workers').document(worker_id)
    worker_ref.set(worker_doc_data)
    
    # Create initial wage ledger for current month
    current_month = datetime.utcnow().strftime("%Y-%m")
    ledger_id = str(uuid.uuid4())
    ledger_data = {
        "workerId": worker_id,
        "employerId": employer_id,
        "month": current_month,
        "totalEarned": 0.0,
        "totalWithdrawn": 0.0,
        "availableBalance": 0.0,
        "paydayDate": wage_calculator.get_next_payday(payday_date),
        "status": "active",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    ledger_ref = firebase_service.db.collection('wage_ledgers').document(ledger_id)
    ledger_ref.set(ledger_data)
    
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
    current_month = datetime.utcnow().strftime("%Y-%m")
    
    # Get all workers
    workers_query = firebase_service.db.collection('workers') \
        .where('employerId', '==', employer_id)
    
    total_workers = 0
    active_workers = 0
    
    for doc in workers_query.get():
        total_workers += 1
        if doc.to_dict().get('isActive'):
            active_workers += 1
    
    # Get current month's ledgers
    ledgers_query = firebase_service.db.collection('wage_ledgers') \
        .where('employerId', '==', employer_id) \
        .where('month', '==', current_month) \
        .where('status', '==', 'active')
    
    total_earnings = 0.0
    total_withdrawals = 0.0
    
    for doc in ledgers_query.get():
        ledger_data = doc.to_dict()
        total_earnings += ledger_data.get('totalEarned', 0.0)
        total_withdrawals += ledger_data.get('totalWithdrawn', 0.0)
    
    pending_settlement = total_earnings - total_withdrawals
    
    # Get employer config for next payday
    employer_ref = firebase_service.db.collection('employers').document(employer_id)
    employer_doc = employer_ref.get()
    employer_data = employer_doc.to_dict() if employer_doc.exists else {}
    withdrawal_config = employer_data.get('withdrawalConfig', {})
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
    
    # Process each attendance entry
    processed_entries = []
    
    for entry in attendance_data.entries:
        # Calculate earnings
        total_earned = wage_calculator.calculate_daily_earnings(
            hours_worked=entry.hours_worked,
            wage_per_hour=entry.wage_per_hour
        )
        
        # Create attendance record
        attendance_id = str(uuid.uuid4())
        attendance_doc_data = {
            "workerId": entry.worker_id,
            "employerId": employer_id,
            "date": datetime.strptime(entry.date, "%Y-%m-%d"),
            "hoursWorked": entry.hours_worked,
            "wagePerHour": entry.wage_per_hour,
            "totalEarned": total_earned,
            "status": entry.status,
            "createdAt": datetime.utcnow()
        }
        
        attendance_ref = firebase_service.db.collection('attendance').document(attendance_id)
        attendance_ref.set(attendance_doc_data)
        
        # Update wage ledger
        entry_month = datetime.strptime(entry.date, "%Y-%m-%d").strftime("%Y-%m")
        
        ledger_query = firebase_service.db.collection('wage_ledgers') \
            .where('workerId', '==', entry.worker_id) \
            .where('month', '==', entry_month) \
            .where('status', '==', 'active') \
            .limit(1)
        
        ledger_docs = ledger_query.get()
        
        if ledger_docs:
            ledger_doc = ledger_docs[0]
            ledger_data = ledger_doc.to_dict()
            
            new_total_earned = ledger_data.get('totalEarned', 0.0) + total_earned
            total_withdrawn = ledger_data.get('totalWithdrawn', 0.0)
            
            # Get employer config
            employer_ref = firebase_service.db.collection('employers').document(employer_id)
            employer_doc = employer_ref.get()
            employer_data = employer_doc.to_dict() if employer_doc.exists else {}
            withdrawal_config = employer_data.get('withdrawalConfig', {})
            max_percentage = withdrawal_config.get('maxPercentage', 40)
            
            # Calculate new available balance
            balance_info = wage_calculator.calculate_available_balance(
                total_earned=new_total_earned,
                total_withdrawn=total_withdrawn,
                max_percentage=max_percentage
            )
            
            ledger_doc.reference.update({
                "totalEarned": new_total_earned,
                "availableBalance": balance_info['available_to_withdraw'],
                "updatedAt": datetime.utcnow()
            })
        
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
