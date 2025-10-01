# py modules
from fastapi import APIRouter, Depends, Form, Response
from sqlmodel import Session

# helpers
from common.db import get_session

# controllers
from .controller import signup_user_controller, login_user_controller

# models
from models.user import User
from .models import AuthResponse, LoginRequest

router = APIRouter(tags=["auth"])

@router.post("/signup", response_model=AuthResponse)
def signup(response: Response, user: User, session: Session = Depends(get_session)):
    return signup_user_controller(response, user, session)

@router.post("/login")
def login(response: Response, payload: LoginRequest, session: Session = Depends(get_session), response_model=AuthResponse):
    return login_user_controller(response, payload.email, payload.password, session)

@router.post("/logout")
def logout(response: Response, response_model=AuthResponse):
    response.delete_cookie(
        key="access_token",
        path="/",
        domain=None,
    )
    return AuthResponse(
        message="Logged out successfully",
        data={}
    )



