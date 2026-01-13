from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.settlement import Settlement, SettlementSummary, WorkerSettlement
from app.services.firebase_service import firebase_service
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settlements", tags=["Settlements"])


@router.get("/")
async def get_settlements(
    current_user: dict = Depends(get_current_user),
    limit: int = 12
):
    """Get settlement history"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    settlements_query = firebase_service.db.collection('settlements') \
        .where('employerId', '==', employer_id) \
        .order_by('settledAt', direction='DESCENDING') \
        .limit(limit)
    
    settlements = []
    for doc in settlements_query.get():
        settlement_data = doc.to_dict()
        settlements.append(SettlementSummary(
            month=settlement_data['month'],
            total_earnings=settlement_data['totalEarnings'],
            total_withdrawals=settlement_data['totalWithdrawals'],
            net_settlement=settlement_data['netSettlement'],
            settled_at=settlement_data['settledAt'],
            status=settlement_data['status']
        ))
    
    return {"settlements": settlements}


@router.post("/process")
async def process_settlement(
    month: str,  # YYYY-MM format
    current_user: dict = Depends(get_current_user)
):
    """Process monthly settlement"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    
    # Get all active ledgers for the month
    ledgers_query = firebase_service.db.collection('wage_ledgers') \
        .where('employerId', '==', employer_id) \
        .where('month', '==', month) \
        .where('status', '==', 'active')
    
    ledger_docs = ledgers_query.get()
    
    if not ledger_docs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active ledgers found for {month}"
        )
    
    # Calculate settlement
    total_earnings = 0.0
    total_withdrawals = 0.0
    worker_settlements = []
    
    for ledger_doc in ledger_docs:
        ledger_data = ledger_doc.to_dict()
        worker_id = ledger_data['workerId']
        
        # Get worker details
        worker_ref = firebase_service.db.collection('workers').document(worker_id)
        worker_doc = worker_ref.get()
        worker_data = worker_doc.to_dict() if worker_doc.exists else {}
        
        earned = ledger_data.get('totalEarned', 0.0)
        withdrawn = ledger_data.get('totalWithdrawn', 0.0)
        net_paid = earned - withdrawn
        
        total_earnings += earned
        total_withdrawals += withdrawn
        
        worker_settlements.append({
            "workerId": worker_id,
            "workerName": worker_data.get('fullName', 'Unknown'),
            "earned": earned,
            "withdrawn": withdrawn,
            "netPaid": net_paid
        })
        
        # Mark ledger as settled
        ledger_doc.reference.update({
            "status": "settled",
            "updatedAt": datetime.utcnow()
        })
    
    net_settlement = total_earnings - total_withdrawals
    
    # Create settlement record
    settlement_id = str(uuid.uuid4())
    settlement_data = {
        "employerId": employer_id,
        "month": month,
        "totalWorkers": len(worker_settlements),
        "totalEarnings": total_earnings,
        "totalWithdrawals": total_withdrawals,
        "netSettlement": net_settlement,
        "settledAt": datetime.utcnow(),
        "status": "completed",
        "workerSettlements": worker_settlements
    }
    
    settlement_ref = firebase_service.db.collection('settlements').document(settlement_id)
    settlement_ref.set(settlement_data)
    
    return {
        "success": True,
        "settlement_id": settlement_id,
        "message": f"Settlement processed for {month}",
        "total_earnings": total_earnings,
        "total_withdrawals": total_withdrawals,
        "net_settlement": net_settlement,
        "workers_count": len(worker_settlements)
    }
