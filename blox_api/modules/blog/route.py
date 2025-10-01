# py modules
import datetime
from fastapi import APIRouter, Depends
from sqlmodel import Session

# controllers
from .controller import (
    create_blog_controller,
    create_message_controller,
    list_blogs_controller,
    get_blog_controller,
    create_checkpoint_controller,
    get_checkpoint_controller,
    restore_checkpoint_controller,
    delete_checkpoint_controller,
    update_blog_controller
)

# commons
from common.auth import TokenData, get_current_user
from common.db import get_session

# models
from models.user import User
from models.checkpoint import Checkpoint
from models.message import Message
from .models import CreateBlogRequest, BlogSummary, BlogDataResponse, UpdateBlogRequest, CreateMessageRequest

router = APIRouter(prefix="/blogs", tags=["blogs"])

@router.post("/")
async def create_blog(blog: CreateBlogRequest, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return await create_blog_controller(blog, session, current_user)

@router.get("/", response_model=list[BlogSummary])
def list_blogs(session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return list_blogs_controller(current_user, session)

@router.get("/{blog_id}", response_model=BlogDataResponse)
def get_blog(blog_id: int, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return get_blog_controller(blog_id, session)

@router.put("/{blog_id}", response_model=BlogDataResponse)
def update_blog(blog_id: int, blog: UpdateBlogRequest, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return update_blog_controller(blog_id, blog, session, current_user)

@router.post("/message")
async def create_message(message: CreateMessageRequest, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return await create_message_controller(message, session, current_user)

@router.post("/checkpoint/{message_id}", response_model=Checkpoint)
def create_checkpoint(message_id: int, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return create_checkpoint_controller(message_id, session)

@router.get("/checkpoint/{checkpoint_id}", response_model=Checkpoint)
def get_checkpoint(checkpoint_id: int, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return get_checkpoint_controller(checkpoint_id, session)

@router.post("/checkpoint/{checkpoint_id}/restore", response_model=BlogDataResponse)
def restore_checkpoint(checkpoint_id: int, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    return restore_checkpoint_controller(checkpoint_id, session)

@router.delete("/checkpoint/{checkpoint_id}")
def delete_checkpoint(checkpoint_id: int, session: Session = Depends(get_session), current_user: TokenData = Depends(get_current_user)):
    """Delete checkpoint and remove references from messages."""
    return delete_checkpoint_controller(checkpoint_id, session)
