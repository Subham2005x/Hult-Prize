from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    phone_number: str = Field(..., pattern=r"^\+91\d{10}$")
    role: Literal["worker", "employer"]


class UserCreate(UserBase):
    pass


class User(UserBase):
    uid: str
    created_at: datetime
    updated_at: datetime
    
    # Worker-specific
    employer_id: Optional[str] = None
    full_name: Optional[str] = None
    upi_id: Optional[str] = None
    
    # Employer-specific
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    
    class Config:
        from_attributes = True


class BankAccount(BaseModel):
    account_number: str
    ifsc: str
    account_holder_name: str


class WithdrawalConfig(BaseModel):
    max_percentage: int = Field(default=40, ge=30, le=50)
    min_amount: int = Field(default=100, ge=1)
    max_amount: int = Field(default=10000, ge=1)
