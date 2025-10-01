# py modules
from sqlmodel import Session
from fastapi import HTTPException, status, Response
from sqlmodel import select
import os

# helpers
from .helper import get_password_hash, verify_password
from common.auth import create_access_token

# models
from models.user import User
from .models import AuthResponse

ENV = os.getenv("ENV", "development")

def signup_user_controller(response: Response, user: User, session: Session) -> AuthResponse:
    # Check if email already exists
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = get_password_hash(user.password)
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(data={ "sub": str(user.id) })
    response.set_cookie(key="access_token", value=token, httponly=True, secure=ENV == "production", samesite="strict")
    return AuthResponse(
        message="Signed up successfully",
        data={
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    )

def login_user_controller(response: Response, email: str, password: str, session: Session) -> AuthResponse:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(data={ "sub": str(user.id) })
    response.set_cookie(key="access_token", value=token, httponly=True, secure=ENV == "production", samesite="strict")
    return AuthResponse(
        message="Logged in successfully",
        data={
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    )
