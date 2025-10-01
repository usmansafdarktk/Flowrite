from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from models.message import Message

class CreateBlogRequest(BaseModel):
    title: str
    description: str
    desired_tone: str
    seo_keywords: list[str]
    target_audience: str
    blog_length_min: int
    blog_length_max: int

class BlogSummary(BaseModel):
    id: int
    title: str

class MessageResponse(BaseModel):
    id: str
    role: str
    message: str
    checkpoint_id: Optional[int] = None
    timestamp: datetime

class BlogDataResponse(BaseModel):
    id: int
    title: str
    description: str
    desired_tone: str
    seo_keywords: list[str]
    target_audience: str
    blog_length_min: int
    blog_length_max: int
    content: str
    messages: list[MessageResponse]
    created_at: datetime
    updated_at: datetime

class UpdateBlogRequest(BaseModel):
    content: str

class CreateMessageRequest(BaseModel):
    title: str
    description: str
    desired_tone: str
    seo_keywords: list[str]
    target_audience: str
    blog_length_min: int
    blog_length_max: int
    user_message: str
    selected_context: list[str]
    blog_id: int
