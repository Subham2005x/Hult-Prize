from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0)
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")


class Withdrawal(BaseModel):
    id: str
    worker_id: str
    employer_id: str
    amount: float
    upi_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    requested_at: datetime
    completed_at: Optional[datetime] = None
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    ledger_id: str
    fee_amount: float = 0.0
    
    class Config:
        from_attributes = True


class WithdrawalResponse(BaseModel):
    id: str
    amount: float
    status: str
    requested_at: datetime
    estimated_completion: str = "Instant"
    message: str
