from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WorkerBase(BaseModel):
    full_name: str
    phone_number: str = Field(..., pattern=r"^\+91\d{10}$")
    upi_id: str


class WorkerCreate(WorkerBase):
    employer_id: str


class Worker(WorkerBase):
    id: str
    employer_id: str
    joined_at: datetime
    is_active: bool = True
    current_month_earnings: float = 0.0
    total_withdrawn: float = 0.0
    next_payday: datetime
    
    class Config:
        from_attributes = True


class WorkerBalance(BaseModel):
    total_earned: float
    total_withdrawn: float
    available_to_withdraw: float
    max_withdrawable: float
    next_payday: datetime
    payday_amount: float


class UpdateUPI(BaseModel):
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")


class UpdatePassword(BaseModel):
    password: str = Field(..., min_length=4)
