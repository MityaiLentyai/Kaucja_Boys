from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    role: str

    class Config:
        from_attributes = True

# Wallet Schemas
class WalletOut(BaseModel):
    id: str
    user_id: str
    balance: float
    updated_at: datetime

    class Config:
        from_attributes = True

# Voucher Schemas
class VoucherScanRequest(BaseModel):
    barcode: str
    raw_payload: Optional[str] = None

class VoucherScanResponse(BaseModel):
    message: str
    voucher_code: str
    amount: float
    issuer_store: str
    new_balance: float

# QR & Cashier Schemas
class RedemptionTokenCreate(BaseModel):
    max_amount: Optional[float] = None

class RedemptionTokenOut(BaseModel):
    token: str
    expires_at: datetime

class CashierRedeemRequest(BaseModel):
    token: str
    amount: float
    store_name: str

# Machine Schemas
class MachineCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    store_brand: str

class MachineOut(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    address: Optional[str]
    store_brand: str
    status_aggregate: str

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int
    tags: Optional[str] = None
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: str
    machine_id: str
    rating: int
    tags: Optional[str]
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
