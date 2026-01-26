from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.worker import WorkerBalance, UpdateUPI, UpdatePassword, UpdateProfile
from app.models.withdrawal import WithdrawalRequest, WithdrawalResponse
from app.services.firebase_service import firebase_service  # Auth only
from app.services.mongodb_service import mongodb_service  # Data storage
from app.services.wage_calculator import wage_calculator
from app.services.upi_service import upi_service
from app.services.notification_service import notification_service
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/workers", tags=["Workers"])


@router.get("/me")
async def get_worker_profile(current_user: dict = Depends(get_current_user)):
    """Get current worker profile"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    # Get worker details from MongoDB
    worker = await mongodb_service.get_worker(current_user["uid"])
    
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
    
    # Get employer details to include company name
    employer = await mongodb_service.get_employer(worker.get('employerId'))
    company_name = employer.get('companyName', 'Unknown Company') if employer else 'Unknown Company'
    
    return {
        "id": current_user["uid"], 
        **worker,
        "companyName": company_name  # Add company name for worker dashboard
    }


@router.get("/me/balance", response_model=WorkerBalance)
async def get_worker_balance(current_user: dict = Depends(get_current_user)):
    """Get worker's current balance and withdrawal limits"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Get wage ledger from MongoDB
    ledger = await mongodb_service.get_wage_ledger(worker_id)
    
    if not ledger:
        # No earnings yet
        return WorkerBalance(
            total_earned=0.0,
            total_withdrawn=0.0,
            available_to_withdraw=0.0,
            max_withdrawable=0.0,
            max_withdrawal_percentage=40,  # Default value
            next_payday=datetime.utcnow(),
            payday_amount=0.0
        )
    
    # Get employer's withdrawal config
    employer = await mongodb_service.get_employer(ledger['employerId'])
    withdrawal_config = employer.get('withdrawalConfig', {}) if employer else {}
    max_percentage = withdrawal_config.get('maxPercentage', 40)
    
    # Calculate available balance
    balance_info = wage_calculator.calculate_available_balance(
        total_earned=ledger.get('totalEarned', 0.0),
        total_withdrawn=ledger.get('totalWithdrawn', 0.0),
        max_percentage=max_percentage
    )
    
    # Get next payday
    payday_date = withdrawal_config.get('paydayDate', 1)
    next_payday = wage_calculator.get_next_payday(payday_date)
    
    # Calculate payday amount (total earned - total withdrawn)
    payday_amount = balance_info['total_earned'] - balance_info['total_withdrawn']
    
    return WorkerBalance(
        total_earned=balance_info['total_earned'],
        total_withdrawn=balance_info['total_withdrawn'],
        available_to_withdraw=balance_info['available_to_withdraw'],
        max_withdrawable=balance_info['max_withdrawable'],
        max_withdrawal_percentage=max_percentage,  # Include employer's limit
        next_payday=next_payday,
        payday_amount=payday_amount
    )


@router.get("/me/withdrawals")
async def get_withdrawal_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 20
):
    """Get worker's withdrawal history"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Query withdrawals from MongoDB
    withdrawals = await mongodb_service.get_worker_withdrawals(worker_id)
    
    return {"withdrawals": withdrawals[:limit]}


@router.post("/me/withdraw", response_model=WithdrawalResponse)
async def request_withdrawal(
    withdrawal_request: WithdrawalRequest,
    current_user: dict = Depends(get_current_user)
):
    """Request instant withdrawal"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Get current balance
    balance_response = await get_worker_balance(current_user)
    
    # Get ledger and employer config
    ledger = await mongodb_service.get_wage_ledger(worker_id)
    if not ledger:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active wage ledger found"
        )
    
    employer = await mongodb_service.get_employer(ledger['employerId'])
    withdrawal_config = employer.get('withdrawalConfig', {}) if employer else {}
    
    # Validate withdrawal amount
    is_valid, error_message = wage_calculator.validate_withdrawal_amount(
        amount=withdrawal_request.amount,
        available_balance=balance_response.available_to_withdraw,
        min_amount=withdrawal_config.get('minAmount', 100),
        max_amount=withdrawal_config.get('maxAmount', 10000)
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Create withdrawal record
    withdrawal_data = {
        "worker_id": worker_id,
        "employer_id": ledger['employerId'],
        "amount": withdrawal_request.amount,
        "upi_id": withdrawal_request.upi_id,
        "status": "processing"
    }
    
    withdrawal_id = await mongodb_service.create_withdrawal(withdrawal_data)
    
    # Process UPI payout
    try:
        payout_result = await upi_service.initiate_payout(
            upi_id=withdrawal_request.upi_id,
            amount=withdrawal_request.amount,
            reference_id=withdrawal_id
        )
        
        if payout_result["success"]:
            # Update withdrawal status
            await mongodb_service.update_withdrawal(withdrawal_id, {
                "status": "completed",
                "completedAt": datetime.utcnow(),
                "transactionId": payout_result["transaction_id"]
            })
            
            # Update ledger (atomic operation)
            await mongodb_service.record_withdrawal(worker_id, withdrawal_request.amount)
            
            # Send notification
            await notification_service.send_withdrawal_confirmation(
                phone_number=current_user.get("phoneNumber", ""),
                amount=withdrawal_request.amount,
                transaction_id=payout_result["transaction_id"]
            )
            
            return WithdrawalResponse(
                id=withdrawal_id,
                amount=withdrawal_request.amount,
                status="completed",
                requested_at=datetime.utcnow(),
                message=f"Successfully transferred ₹{withdrawal_request.amount} to {withdrawal_request.upi_id}"
            )
        else:
            # Payout failed
            await mongodb_service.update_withdrawal(withdrawal_id, {
                "status": "failed",
                "failureReason": payout_result.get("message", "Payout failed")
            })
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Withdrawal failed. Please try again."
            )
    
    except Exception as e:
        logger.error(f"Withdrawal processing error: {e}")
        await mongodb_service.update_withdrawal(withdrawal_id, {
            "status": "failed",
            "failureReason": str(e)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal processing failed"
        )


@router.put("/me")
async def update_worker_profile(
    profile_update: UpdateProfile,
    current_user: dict = Depends(get_current_user)
):
    """Update worker's profile (name and UPI) - syncs with employer view"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Build update dict from provided fields
    update_data = {}
    if profile_update.full_name is not None:
        update_data["fullName"] = profile_update.full_name
    if profile_update.upi_id is not None:
        update_data["upiId"] = profile_update.upi_id
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update in MongoDB workers collection (syncs with employer view)
    await mongodb_service.update_worker(worker_id, update_data)
    
    logger.info(f"Worker profile updated: {worker_id}, fields: {list(update_data.keys())}")
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "updated_fields": list(update_data.keys())
    }


@router.put("/me/upi")
async def update_upi_id(
    upi_update: UpdateUPI,
    current_user: dict = Depends(get_current_user)
):
    """Update worker's UPI ID"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Update in MongoDB workers collection
    await mongodb_service.update_worker(worker_id, {
        "upiId": upi_update.upi_id
    })
    
    # Update in users collection
    await mongodb_service.update_user(worker_id, {
        "upiId": upi_update.upi_id
    })
    
    return {
        "success": True,
        "message": "UPI ID updated successfully",
        "upi_id": upi_update.upi_id
    }


@router.put("/me/password")
async def update_password(
    password_update: UpdatePassword,
    current_user: dict = Depends(get_current_user)
):
    """Update worker's password"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Update in MongoDB users collection
    await mongodb_service.update_user(worker_id, {
        "password": password_update.password
    })
    
    return {
        "success": True,
        "message": "Password updated successfully"
    }
