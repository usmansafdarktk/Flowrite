# py modules
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie, Response
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlmodel import Session
import os

# helpers
from .db import get_session

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_CHANGE_ME")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Token payload schema
class TokenData(BaseModel):
    user_id: int

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependency to get current user
def get_current_user(response: Response, token: str = Cookie(None, alias="access_token"), session: Session = Depends(get_session)) -> TokenData:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        new_token = create_access_token(data={
            "sub": str(user_id),
        })
        response.set_cookie(
            key="access_token",
            value=new_token,
            httponly=True,
            secure=True,
            samesite="strict",
        )
        return TokenData(user_id=user_id)
    except JWTError as e:
        response.delete_cookie(
            key="access_token",
            path="/",
            domain=None,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

