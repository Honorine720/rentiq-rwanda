"""
Auth routes: register (user & admin), login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import os

from app.models.database import get_db, User
from app.models.schemas import UserRegister, AdminRegister, UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "rentiq-rwanda-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(body: UserRegister, db: Session = Depends(get_db)):
    """Register a new end user."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=_hash(body.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = _create_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, full_name=user.full_name)


@router.post("/register/admin", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_admin(body: AdminRegister, db: Session = Depends(get_db)):
    """Register a new admin — requires ADMIN_SECRET_KEY."""
    admin_secret = os.getenv("ADMIN_SECRET_KEY", "admin-rentiq-2024")
    if body.admin_secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret key")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=_hash(body.password),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = _create_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, full_name=user.full_name)


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    """Login for both users and admins."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not _verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = _create_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, full_name=user.full_name)


@router.get("/me", response_model=UserOut)
def get_me(token: str = "", db: Session = Depends(get_db)):
    """Get current user info from token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
