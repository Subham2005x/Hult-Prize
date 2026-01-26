from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.models.settlement import Settlement, SettlementSummary, WorkerSettlement
from app.services.mongodb_service import mongodb_service  # Changed from firebase_service
from datetime import datetime
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
    
    # Get settlements from MongoDB
    cursor = mongodb_service.db.settlements.find(
        {"employerId": employer_id}
    ).sort("settledAt", -1).limit(limit)
    
    settlement_docs = await cursor.to_list(length=limit)
    
    settlements = []
    for settlement_data in settlement_docs:
        settlement = SettlementSummary(
            month=settlement_data['month'],
            total_workers=settlement_data.get('totalWorkers', 0),
            total_earnings=settlement_data['totalEarnings'],
            total_withdrawals=settlement_data['totalWithdrawals'],
            net_settlement=settlement_data['netSettlement'],
            settled_at=settlement_data['settledAt'],
            status=settlement_data['status']
        )
        # Convert to dict with camelCase aliases
        settlements.append(settlement.model_dump(by_alias=True))
    
    return {"settlements": settlements}


@router.post("/process")
async def process_settlement(
    request_body: dict,  # Accept month from request body
    current_user: dict = Depends(get_current_user)
):
    """Process monthly settlement"""
    if current_user.get("role") != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer_id = current_user["uid"]
    month = request_body.get("month")  # Extract month from body
    
    # Get all workers for this employer
    workers = await mongodb_service.get_employer_workers(employer_id)
    
    if not workers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No workers found for employer"
        )
    
    # Calculate settlement
    total_earnings = 0.0
    total_withdrawals = 0.0
    worker_settlements = []
    
    for worker in workers:
        worker_id = worker['_id']
        
        # Get wage ledger for this worker
        ledger = await mongodb_service.get_wage_ledger(worker_id)
        
        if not ledger:
            continue
        
        earned = ledger.get('totalEarned', 0.0)
        withdrawn = ledger.get('totalWithdrawn', 0.0)
        net_paid = earned - withdrawn
        
        total_earnings += earned
        total_withdrawals += withdrawn
        
        worker_settlements.append({
            "workerId": worker_id,
            "workerName": worker.get('fullName', 'Unknown'),
            "earned": earned,
            "withdrawn": withdrawn,
            "netPaid": net_paid
        })
        
        # Reset ledger for new month (optional - depends on your business logic)
        # You might want to keep historical data instead
        # await mongodb_service.update_wage_ledger(worker_id, {
        #     "totalEarned": 0.0,
        #     "totalWithdrawn": 0.0,
        #     "availableBalance": 0.0
        # })
    
    net_settlement = total_earnings - total_withdrawals
    
    # Create settlement record in MongoDB
    settlement_data = {
        "employer_id": employer_id,
        "month": month,
        "totalWorkers": len(worker_settlements),
        "totalEarnings": total_earnings,
        "totalWithdrawals": total_withdrawals,
        "netSettlement": net_settlement,
        "settledAt": datetime.utcnow(),
        "status": "completed",
        "workerSettlements": worker_settlements
    }
    
    settlement_id = await mongodb_service.create_settlement(settlement_data)
    
    return {
        "success": True,
        "settlement_id": settlement_id,
        "message": f"Settlement processed for {month}",
        "total_earnings": total_earnings,
        "total_withdrawals": total_withdrawals,
        "net_settlement": net_settlement,
        "workers_count": len(worker_settlements)
    }
