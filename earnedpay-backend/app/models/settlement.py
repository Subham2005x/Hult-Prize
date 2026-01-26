from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class WorkerSettlement(BaseModel):
    worker_id: str
    worker_name: str
    earned: float
    withdrawn: float
    net_paid: float


class Settlement(BaseModel):
    id: str
    employer_id: str
    month: str  # YYYY-MM
    total_workers: int
    total_earnings: float
    total_withdrawals: float
    net_settlement: float
    settled_at: datetime
    status: str
    worker_settlements: List[WorkerSettlement]
    
    class Config:
        from_attributes = True


class SettlementSummary(BaseModel):
    month: str
    total_workers: int = Field(default=0, alias='totalWorkers')
    total_earnings: float = Field(alias='totalEarnings')
    total_withdrawals: float = Field(alias='totalWithdrawals')
    net_settlement: float = Field(alias='netSettlement')
    settled_at: datetime = Field(alias='settledAt')
    status: str
    
    class Config:
        populate_by_name = True  # Allow both snake_case and camelCase
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
