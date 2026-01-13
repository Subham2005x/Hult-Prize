from pydantic import BaseModel
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
    total_earnings: float
    total_withdrawals: float
    net_settlement: float
    settled_at: datetime
    status: str
