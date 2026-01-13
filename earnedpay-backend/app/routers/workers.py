from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.worker import WorkerBalance, UpdateUPI, UpdatePassword
from app.models.withdrawal import WithdrawalRequest, WithdrawalResponse
from app.services.firebase_service import firebase_service
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
    
    # Get worker details from Firestore
    worker_ref = firebase_service.db.collection('workers').document(current_user["uid"])
    worker_doc = worker_ref.get()
    
    if not worker_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
    
    return {"id": current_user["uid"], **worker_doc.to_dict()}


@router.get("/me/balance", response_model=WorkerBalance)
async def get_worker_balance(current_user: dict = Depends(get_current_user)):
    """Get worker's current balance and withdrawal limits"""
    if current_user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    
    worker_id = current_user["uid"]
    
    # Get current month's wage ledger
    current_month = datetime.utcnow().strftime("%Y-%m")
    ledger_query = firebase_service.db.collection('wage_ledgers') \
        .where('workerId', '==', worker_id) \
        .where('month', '==', current_month) \
        .where('status', '==', 'active') \
        .limit(1)
    
    ledger_docs = ledger_query.get()
    
    if not ledger_docs:
        # No earnings yet this month
        return WorkerBalance(
            total_earned=0.0,
            total_withdrawn=0.0,
            available_to_withdraw=0.0,
            max_withdrawable=0.0,
            next_payday=datetime.utcnow(),
            payday_amount=0.0
        )
    
    ledger_data = ledger_docs[0].to_dict()
    
    # Get employer's withdrawal config
    employer_ref = firebase_service.db.collection('employers').document(ledger_data['employerId'])
    employer_doc = employer_ref.get()
    employer_data = employer_doc.to_dict() if employer_doc.exists else {}
    
    withdrawal_config = employer_data.get('withdrawalConfig', {})
    max_percentage = withdrawal_config.get('maxPercentage', 40)
    
    # Calculate available balance
    balance_info = wage_calculator.calculate_available_balance(
        total_earned=ledger_data.get('totalEarned', 0.0),
        total_withdrawn=ledger_data.get('totalWithdrawn', 0.0),
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
    
    # Query withdrawals
    withdrawals_query = firebase_service.db.collection('withdrawals') \
        .where('workerId', '==', worker_id) \
        .order_by('requestedAt', direction='DESCENDING') \
        .limit(limit)
    
    withdrawals = []
    for doc in withdrawals_query.get():
        withdrawal_data = doc.to_dict()
        withdrawals.append({
            "id": doc.id,
            **withdrawal_data
        })
    
    return {"withdrawals": withdrawals}


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
    
    # Get employer config for limits
    current_month = datetime.utcnow().strftime("%Y-%m")
    ledger_query = firebase_service.db.collection('wage_ledgers') \
        .where('workerId', '==', worker_id) \
        .where('month', '==', current_month) \
        .where('status', '==', 'active') \
        .limit(1)
    
    ledger_docs = ledger_query.get()
    if not ledger_docs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active wage ledger found"
        )
    
    ledger_doc = ledger_docs[0]
    ledger_data = ledger_doc.to_dict()
    
    employer_ref = firebase_service.db.collection('employers').document(ledger_data['employerId'])
    employer_doc = employer_ref.get()
    employer_data = employer_doc.to_dict() if employer_doc.exists else {}
    withdrawal_config = employer_data.get('withdrawalConfig', {})
    
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
    withdrawal_id = str(uuid.uuid4())
    withdrawal_data = {
        "workerId": worker_id,
        "employerId": ledger_data['employerId'],
        "amount": withdrawal_request.amount,
        "upiId": withdrawal_request.upi_id,
        "status": "processing",
        "requestedAt": datetime.utcnow(),
        "ledgerId": ledger_doc.id,
        "feeAmount": 0.0
    }
    
    # Save to Firestore
    withdrawal_ref = firebase_service.db.collection('withdrawals').document(withdrawal_id)
    withdrawal_ref.set(withdrawal_data)
    
    # Process UPI payout
    try:
        payout_result = await upi_service.initiate_payout(
            upi_id=withdrawal_request.upi_id,
            amount=withdrawal_request.amount,
            reference_id=withdrawal_id
        )
        
        if payout_result["success"]:
            # Update withdrawal status
            withdrawal_ref.update({
                "status": "completed",
                "completedAt": datetime.utcnow(),
                "transactionId": payout_result["transaction_id"]
            })
            
            # Update ledger
            ledger_doc.reference.update({
                "totalWithdrawn": ledger_data.get('totalWithdrawn', 0.0) + withdrawal_request.amount,
                "availableBalance": ledger_data.get('availableBalance', 0.0) - withdrawal_request.amount,
                "updatedAt": datetime.utcnow()
            })
            
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
                requested_at=withdrawal_data["requestedAt"],
                message=f"Successfully transferred ₹{withdrawal_request.amount} to {withdrawal_request.upi_id}"
            )
        else:
            # Payout failed
            withdrawal_ref.update({
                "status": "failed",
                "failureReason": payout_result.get("message", "Payout failed")
            })
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Withdrawal failed. Please try again."
            )
    
    except Exception as e:
        logger.error(f"Withdrawal processing error: {e}")
        withdrawal_ref.update({
            "status": "failed",
            "failureReason": str(e)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal processing failed"
        )


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
    
    # Update in workers collection
    worker_ref = firebase_service.db.collection('workers').document(worker_id)
    worker_ref.update({
        "upiId": upi_update.upi_id,
        "updatedAt": datetime.utcnow()
    })
    
    # Update in users collection
    user_ref = firebase_service.db.collection('users').document(worker_id)
    user_ref.update({
        "upiId": upi_update.upi_id,
        "updatedAt": datetime.utcnow()
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
    
    # Update in users collection
    user_ref = firebase_service.db.collection('users').document(worker_id)
    user_ref.update({
        "password": password_update.password,
        "updatedAt": datetime.utcnow()
    })
    
    return {
        "success": True,
        "message": "Password updated successfully"
    }
