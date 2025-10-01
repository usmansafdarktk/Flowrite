from pydantic import BaseModel

class AuthResponse(BaseModel):
    message: str
    data: dict

class LoginRequest(BaseModel):
    email: str
    password: str
