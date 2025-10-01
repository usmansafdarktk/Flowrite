# py modules
from fastapi import HTTPException
from sqlmodel import Session, select
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import selectinload

# models
from models.blog import Blog
from models.message import Message
from models.checkpoint import Checkpoint
from .models import BlogDataResponse, CreateBlogRequest, BlogSummary, CreateMessageRequest, MessageResponse, UpdateBlogRequest
from common.auth import TokenData

#commons

async def create_blog_controller(blog: CreateBlogRequest, session: Session, current_user: TokenData) -> dict:
    """
    Create a new blog by starting a temporal workflow and waiting for completion.
    Returns the workflow result containing the created blog data.
    """
    from temporal.temporal_client import start_blog_creation_workflow

    try:
        # Prepare blog data for workflow
        blog_data = {
            "title": blog.title,
            "description": blog.description,
            "desired_tone": blog.desired_tone,
            "seo_keywords": blog.seo_keywords,
            "target_audience": blog.target_audience,
            "blog_length_min": blog.blog_length_min,
            "blog_length_max": blog.blog_length_max,
            "user_id": current_user.user_id
        }

        # Start temporal workflow and wait for result
        workflow_result = await start_blog_creation_workflow(blog_data)

        # Check if workflow completed successfully
        if "error" in workflow_result:
            raise HTTPException(status_code=500, detail=f"Workflow failed: {workflow_result['error']}")

        return workflow_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create blog: {str(e)}")

def list_blogs_controller(current_user: TokenData, session: Session) -> list[BlogSummary]:
    statement = select(Blog.id, Blog.title).where(Blog.user_id == current_user.user_id)
    blogs = session.exec(statement).all()
    return [BlogSummary(id=b[0], title=b[1]) for b in blogs]

def get_blog_controller(blog_id: int, session: Session) -> BlogDataResponse:
    # Load blog with messages in a single query
    blog = session.exec(
        select(Blog)
        .where(Blog.id == blog_id)
        .options(selectinload(Blog.messages))
    ).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    print(f"afaq: blog.messages: {blog.messages}")

    # Messages are already sorted by updated_at ascending thanks to relationship
    messages_response = []
    for msg in blog.messages:
        messages_response.append(MessageResponse(id="user_" + str(msg.id), role="user", message=msg.user_message, timestamp=msg.updated_at))
        messages_response.append(MessageResponse(id="assistant_" + str(msg.id), role="assistant", message=msg.ai_message, timestamp=msg.updated_at, checkpoint_id=msg.checkpoint_id))

    return BlogDataResponse(
        id=blog.id,
        title=blog.title,
        description=blog.description,
        desired_tone=blog.desired_tone,
        seo_keywords=blog.seo_keywords,
        target_audience=blog.target_audience,
        blog_length_min=blog.blog_length_min,
        blog_length_max=blog.blog_length_max,
        content=blog.content,
        user_id=blog.user_id,
        messages=messages_response,
        created_at=blog.created_at,
        updated_at=blog.updated_at
    )

def update_blog_controller(blog_id: int, blog: UpdateBlogRequest, session: Session, current_user: TokenData) -> BlogDataResponse:
    blog_db = session.exec(select(Blog).where(Blog.id == blog_id)).first()
    print(f"afaq: blog: {blog.content}")
    if not blog_db:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog_db.content = blog.content
    session.commit()
    session.refresh(blog_db)
    return blog_db

async def create_message_controller(message: CreateMessageRequest, session: Session, current_user: TokenData) -> dict:
    """
    Create a message for an existing blog by starting a temporal workflow and waiting for completion.
    Returns the workflow result containing the updated blog data and new message.
    """
    from temporal.temporal_client import start_message_workflow

    try:
        # Prepare message data for workflow
        message_data = {
            "title": message.title,
            "description": message.description,
            "desired_tone": message.desired_tone,
            "seo_keywords": message.seo_keywords,
            "target_audience": message.target_audience,
            "blog_length_min": message.blog_length_min,
            "blog_length_max": message.blog_length_max,
            "user_message": message.user_message,
            "blog_id": message.blog_id,
            "user_id": current_user.user_id,
            "user_selected_context": message.selected_context
        }

        # Start temporal workflow and wait for result
        workflow_result = await start_message_workflow(message_data)

        # Check if workflow completed successfully
        if "error" in workflow_result:
            raise HTTPException(status_code=500, detail=f"Workflow failed: {workflow_result['error']}")

        return workflow_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")


def create_checkpoint_controller(message_id: int, session: Session) -> Checkpoint:
    """Create a checkpoint for a blog. Keep max 3 checkpoints per blog."""

    # Load message and its blog + existing checkpoints
    message = session.exec(
        select(Message)
        .where(Message.id == message_id)
        .options(
            selectinload(Message.blog).selectinload(Blog.checkpoints)
        )
    ).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if not message.blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    blog = message.blog

    # Delete oldest checkpoint if there are already 3 or more
    if len(blog.checkpoints) >= 3:
        oldest_checkpoint = blog.checkpoints[0]  # already sorted by created_at
        session.delete(oldest_checkpoint)

    # Create new checkpoint
    new_checkpoint = Checkpoint(blog_id=blog.id, content=blog.content)
    session.add(new_checkpoint)
    session.flush()

    # Update message to point to the new checkpoint
    message.checkpoint_id = new_checkpoint.id
    print(f"afaq: message: {message}")
    print(f"afaq: new_checkpoint: {new_checkpoint}")
    session.add(message)

    # Commit everything in a single transaction
    session.commit()

    # Refresh objects to get IDs and timestamps
    session.refresh(new_checkpoint)
    session.refresh(message)

    return new_checkpoint

def get_checkpoint_controller(checkpoint_id: int, session: Session) -> Checkpoint:
    statement = select(Checkpoint).where(Checkpoint.id == checkpoint_id)
    checkpoint = session.exec(statement).first()
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    return checkpoint

def restore_checkpoint_controller(checkpoint_id: int, session: Session) -> BlogDataResponse:
    # Get the checkpoint to be restored
    checkpoint = session.get(Checkpoint, checkpoint_id)
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Checkpoint not found")

    # Get the parent blog
    blog = session.get(Blog, checkpoint.blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Update blog content with the checkpoint's content
    blog.content = checkpoint.content
    blog.updated_at = datetime.now(timezone.utc)
    session.add(blog)

    # Find the message that created this checkpoint with
    message_statement = select(Message).where(Message.checkpoint_id == checkpoint_id)
    checkpoint_message = session.exec(message_statement).first()
    if not checkpoint_message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Delete subsequent message history
    messages_to_delete_statement = select(Message).where(
        Message.blog_id == blog.id,
        Message.updated_at > checkpoint_message.updated_at
    )
    messages_to_delete = session.exec(messages_to_delete_statement).all()

    if messages_to_delete:
        message_ids = [item.id for item in messages_to_delete]
        checkpoint_ids_to_delete = [item.checkpoint_id for item in messages_to_delete if item.checkpoint_id]
        session.query(Message).filter(Message.id.in_(message_ids)).delete(synchronize_session=False)
        if checkpoint_ids_to_delete:
            session.query(Checkpoint).filter(Checkpoint.id.in_(checkpoint_ids_to_delete)).delete(synchronize_session=False)

    # Commit all changes to the database
    session.commit()
    session.refresh(blog)

    # todo(afaq): dessummarize the instructions

    # Return the updated blog and its message data
    return get_blog_controller(blog.id, session)


def delete_checkpoint_controller(checkpoint_id: int, session: Session) -> dict:
    # Get the checkpoint
    checkpoint = session.get(Checkpoint, checkpoint_id)
    
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Checkpoint not found")

    # Delete the checkpoint object.
    session.delete(checkpoint)
    session.commit()

    return {"message": f"Checkpoint {checkpoint_id} was deleted successfully."}
