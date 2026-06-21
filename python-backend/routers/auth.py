from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional
from database import get_db
from auth_utils import hash_password, verify_password, create_token, decode_token, make_otp
from schemas import (SignupRequest, LoginRequest, VerifyOTPRequest, ResendOTPRequest,
                     ForgotPasswordRequest, VerifyResetOTPRequest, ResetPasswordRequest)

router = APIRouter(prefix="/api/auth", tags=["auth"])

def serialize_user(u: dict) -> dict:
    return {"id": str(u["_id"]), "name": u["name"], "email": u["email"], "role": u.get("role","admin")}

# ── dependency: get current user from Bearer token ────────────────────────────
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No token provided")
    token = authorization.split(" ")[1]
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(401, "Invalid or expired token")
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(401, "User not found")
    return user

# ── POST /api/auth/signup ─────────────────────────────────────────────────────
@router.post("/signup")
async def signup(body: SignupRequest):
    db = get_db()
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    existing = await db.users.find_one({"email": body.email})
    otp        = make_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    if existing and existing.get("isEmailVerified"):
        raise HTTPException(409, "Email already registered")

    if existing and not existing.get("isEmailVerified"):
        await db.users.update_one({"_id": existing["_id"]}, {"$set": {
            "verifyToken": otp, "verifyTokenExpiry": otp_expiry
        }})
    else:
        await db.users.insert_one({
            "name": body.name, "email": body.email,
            "password": hash_password(body.password),
            "role": body.role or "admin",
            "status": "inactive", "isEmailVerified": False,
            "verifyToken": otp, "verifyTokenExpiry": otp_expiry,
            "createdAt": datetime.utcnow(),
        })

    return {"message": "OTP generated", "otp": otp, "name": body.name, "email": body.email}

# ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user:                                raise HTTPException(404, "Account not found")
    if user.get("isEmailVerified"):             raise HTTPException(400, "Email already verified")
    if user.get("verifyToken") != body.otp:     raise HTTPException(400, "Invalid OTP")
    if datetime.utcnow() > user.get("verifyTokenExpiry", datetime.utcnow()):
        raise HTTPException(400, "OTP has expired")

    await db.users.update_one({"_id": user["_id"]}, {"$set": {
        "isEmailVerified": True, "status": "active",
        "verifyToken": None, "verifyTokenExpiry": None,
    }})
    token = create_token(str(user["_id"]))
    return {"message": "Email verified!", "token": token, "user": serialize_user(user)}

# ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
@router.post("/resend-otp")
async def resend_otp(body: ResendOTPRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user:                    raise HTTPException(404, "No account with that email")
    if user.get("isEmailVerified"): raise HTTPException(400, "Email already verified")

    otp = make_otp()
    await db.users.update_one({"_id": user["_id"]}, {"$set": {
        "verifyToken": otp,
        "verifyTokenExpiry": datetime.utcnow() + timedelta(minutes=10),
    }})
    return {"message": "OTP regenerated", "otp": otp, "name": user["name"], "email": body.email}

# ── POST /api/auth/login ──────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    if not user.get("isEmailVerified"):
        raise HTTPException(403, detail={"message": "Please verify your email", "code": "EMAIL_NOT_VERIFIED"})
    if user.get("status") != "active":
        raise HTTPException(403, "Account is inactive")

    token = create_token(str(user["_id"]))
    return {"token": token, "user": serialize_user(user)}

# ── POST /api/auth/forgot-password ───────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not user.get("isEmailVerified"):
        return {"message": "OTP sent", "sent": False}

    otp = make_otp()
    await db.users.update_one({"_id": user["_id"]}, {"$set": {
        "resetToken": otp,
        "resetTokenExpiry": datetime.utcnow() + timedelta(minutes=10),
    }})
    return {"message": "OTP sent", "otp": otp, "name": user["name"], "email": body.email, "sent": True}

# ── POST /api/auth/verify-reset-otp ──────────────────────────────────────────
@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyResetOTPRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user:                                raise HTTPException(404, "Account not found")
    if user.get("resetToken") != body.otp:      raise HTTPException(400, "Invalid OTP")
    if datetime.utcnow() > user.get("resetTokenExpiry", datetime.utcnow()):
        raise HTTPException(400, "OTP has expired")
    return {"message": "OTP verified", "email": body.email}

# ── POST /api/auth/reset-password ────────────────────────────────────────────
@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    db = get_db()
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    user = await db.users.find_one({"email": body.email})
    if not user:                                raise HTTPException(404, "Account not found")
    if user.get("resetToken") != body.otp:      raise HTTPException(400, "Invalid OTP")
    if datetime.utcnow() > user.get("resetTokenExpiry", datetime.utcnow()):
        raise HTTPException(400, "OTP has expired")

    await db.users.update_one({"_id": user["_id"]}, {"$set": {
        "password": hash_password(body.password),
        "resetToken": None, "resetTokenExpiry": None,
    }})
    return {"message": "Password reset successfully! You can now log in."}

# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return serialize_user(current_user)
