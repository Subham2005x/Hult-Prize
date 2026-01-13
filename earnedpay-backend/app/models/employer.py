from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EmployerBase(BaseModel):
    company_name: str
    phone_number: str = Field(..., pattern=r"^\+91\d{10}$")
    gst_number: Optional[str] = None


class EmployerCreate(EmployerBase):
    pass


class Employer(EmployerBase):
    id: str
    created_at: datetime
    is_active: bool = True
    withdrawal_config: dict
    
    class Config:
        from_attributes = True


class EmployerDashboard(BaseModel):
    total_workers: int
    active_workers: int
    total_earnings_this_month: float
    total_withdrawals_this_month: float
    pending_settlement: float
    next_payday: datetime


class AttendanceEntry(BaseModel):
    worker_id: str
    date: str  # YYYY-MM-DD
    hours_worked: float = Field(..., ge=0, le=24)
    wage_per_hour: float = Field(..., ge=0)
    status: str = Field(default="present")



class AttendanceSubmit(BaseModel):
    entries: List[AttendanceEntry]


class EmployerUpdate(BaseModel):
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    gst_number: Optional[str] = None
    withdrawal_config: Optional[dict] = None

