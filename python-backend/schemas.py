from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "admin"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str

# ── Category ──────────────────────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    color: Optional[str] = "#E8A020"

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

# ── Product ───────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None   # category _id string
    price: float
    tax: Optional[int] = 5
    uom: Optional[str] = "piece"
    desc: Optional[str] = ""
    emoji: Optional[str] = "🍽"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    tax: Optional[int] = None
    uom: Optional[str] = None
    desc: Optional[str] = None
    emoji: Optional[str] = None

# ── Order ─────────────────────────────────────────────────────────────────────
class OrderItem(BaseModel):
    id: Optional[Any] = None
    name: str
    emoji: Optional[str] = "🍽"
    price: float
    tax: Optional[int] = 5
    qty: int

class OrderCreate(BaseModel):
    tableId: Optional[str] = None
    tableNum: Optional[int] = None
    customer: Optional[str] = "Guest"
    customerId: Optional[str] = None
    items: List[OrderItem]
    sub: float
    tax: float
    disc: Optional[float] = 0
    discLabel: Optional[str] = None
    total: float
    payMethod: Optional[str] = "Cash"
    status: Optional[str] = "paid"
    date: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    stage: Optional[str] = None
