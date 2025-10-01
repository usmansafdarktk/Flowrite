# py modules
import os
from typing import List, Tuple, Optional
from temporalio import activity
from datetime import datetime, timezone
from sqlalchemy.orm import selectinload
from temporalio.exceptions import ApplicationError
from sqlmodel import Session, select
from sqlalchemy import desc
import asyncio

# Import activity logger
from temporalio import activity as activity_module

# models
from .models import OpenAIMessage, WebSearchToolResponse, BlogDetails, MessageResponse
from models.blog import Blog
from models.message import Message
from models.user import User  # Import User to ensure SQLAlchemy can resolve relationships
from models.checkpoint import Checkpoint  # Import Checkpoint to ensure SQLAlchemy can resolve relationships

# constants
from .constants import constants

# common
from common.db import get_session

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

@activity.defn
async def web_search(query: str, current_call_count: int) -> Tuple[List[WebSearchToolResponse], int]:
    """
    Performs a web search using Tavily API and returns the search results with updated call count.

    Args:
        query (str): The search query.
        current_call_count (int): Current number of calls made for this workflow.

    Returns:
        Tuple of (search results list, updated call count).
    """
    try:
        activity_module.logger.info(
            "Web search activity started",
            extra={
                "activity_name": "web_search",
                "query": query,
                "current_call_count": current_call_count,
                "search_depth": constants.get("tavily_search_depth"),
            },
        )

        from tavily import TavilyClient

        tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
        response = tavily_client.search(query=query, search_depth=constants.get("tavily_search_depth"))

        updated_call_count = current_call_count + 1
        results = [
            WebSearchToolResponse(
                url=res['url'],
                content=f"Title: {res['title']}\nContent: {res['content']}"
            )
            for res in response['results']
        ]

        activity_module.logger.info(
            "Web search activity completed successfully",
            extra={
                "activity_name": "web_search",
                "query": query,
                "results_count": len(results),
                "updated_call_count": updated_call_count,
                "search_depth": constants.get("tavily_search_depth"),
            },
        )

        return results, updated_call_count
    except ApplicationError:
        # Re-raise non-retryable max limit exception
        activity_module.logger.error(
            "Web search activity failed with ApplicationError",
            extra={
                "activity_name": "web_search",
                "query": query,
                "current_call_count": current_call_count,
                "error_type": "ApplicationError",
            },
        )
        raise
    except Exception as e:
        activity_module.logger.error(
            f"Web search activity failed: {e}",
            extra={
                "activity_name": "web_search",
                "query": query,
                "current_call_count": current_call_count,
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise ApplicationError(f"Failed to search the web: {e}")


@activity.defn
async def get_blog_details(blog_id: int) -> BlogDetails:
    """
    Retrieves blog details from database including the last 10 messages.
    """
    try:
        activity_module.logger.info(
            "Get blog details activity started",
            extra={
                "activity_name": "get_blog_details",
                "blog_id": blog_id,
            },
        )

        with next(get_session()) as session:
            # Get blog data
            blog = session.exec(
                select(Blog)
                .where(Blog.id == blog_id)
            ).first()

            if blog is None:
                activity_module.logger.error(
                    f"Blog with id {blog_id} not found",
                    extra={
                        "activity_name": "get_blog_details",
                        "blog_id": blog_id,
                        "error_type": "BlogNotFound",
                    },
                )
                raise ApplicationError(f"Blog with id {blog_id} not found", non_retryable=True)

            # Get last 10 messages
            messages_query = select(Message).where(Message.blog_id == blog_id).order_by(Message.updated_at.asc()).limit(10)
            messages_db = session.exec(messages_query).all()

            # Convert to OpenAI Message format
            messages = []
            for msg in messages_db:
                messages.append(OpenAIMessage(role="user", content=msg.user_message))
                messages.append(OpenAIMessage(role="assistant", content=msg.ai_message))

            blog_details = BlogDetails(
                id=blog.id,
                title=blog.title,
                description=blog.description,
                desired_tone=blog.desired_tone,
                seo_keywords=blog.seo_keywords,
                target_audience=blog.target_audience,
                blog_length_min=blog.blog_length_min,
                blog_length_max=blog.blog_length_max,
                content=blog.content,
                messages=messages,
                instructions=None,  # Will be set by instruction agent
                user_selected_context=None,  # Will be set from workflow input
                user_message=None,  # Will be set from workflow input
                general_instructions=blog.instructions,  # General instructions from DB
                user_prompt=None,  # Will be set by instruction agent
                tool_call_counters={}
            )

            activity_module.logger.info(
                "Get blog details activity completed successfully",
                extra={
                    "activity_name": "get_blog_details",
                    "blog_id": blog_id,
                    "title": blog.title,
                    "message_count": len(messages),
                    "has_content": blog.content is not None,
                    "has_instructions": blog.instructions is not None,
                    "seo_keywords_count": len(blog.seo_keywords) if blog.seo_keywords else 0,
                },
            )

            return blog_details
    except Exception as e:
        if isinstance(e, ApplicationError):
            raise
        activity_module.logger.error(
            f"Failed to get blog details: {e}",
            extra={
                "activity_name": "get_blog_details",
                "blog_id": blog_id,
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise ApplicationError(f"Failed to get blog details: {e}")


@activity.defn
async def save_blog_content(blog_id: int, content: Optional[str] = None, instructions: Optional[str] = None) -> None:
    """
    Saves blog content and optionally instructions to database.
    """
    try:
        activity_module.logger.info(
            "Save blog content activity started",
            extra={
                "activity_name": "save_blog_content",
                "blog_id": blog_id,
                "has_content": content is not None,
                "content_length": len(content) if content else 0,
                "has_instructions": instructions is not None,
                "instructions_length": len(instructions) if instructions else 0,
            },
        )

        with next(get_session()) as session:
            blog = session.get(Blog, blog_id)
            if not blog:
                activity_module.logger.error(
                    f"Blog with id {blog_id} not found",
                    extra={
                        "activity_name": "save_blog_content",
                        "blog_id": blog_id,
                        "error_type": "BlogNotFound",
                    },
                )
                raise ApplicationError(f"Blog with id {blog_id} not found", non_retryable=True)

            if content:
                blog.content = content
            blog.updated_at = datetime.now(timezone.utc)
            if instructions:
                blog.instructions = instructions

            session.add(blog)
            session.commit()

            activity_module.logger.info(
                "Save blog content activity completed successfully",
                extra={
                    "activity_name": "save_blog_content",
                    "blog_id": blog_id,
                    "content_saved": content is not None,
                    "instructions_saved": instructions is not None,
                    "updated_at": blog.updated_at.isoformat() if blog.updated_at else None,
                },
            )
    except Exception as e:
        if isinstance(e, ApplicationError):
            raise
        activity_module.logger.error(
            f"Failed to save blog content: {e}",
            extra={
                "activity_name": "save_blog_content",
                "blog_id": blog_id,
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise ApplicationError(f"Failed to save blog content: {e}")


@activity.defn
async def save_messages(blog_id: int, user_message: str, ai_message: str) -> MessageResponse:
    """
    Saves user message and AI response to database.
    Returns the ID of the saved user message.
    """
    try:
        activity_module.logger.info(
            "Save messages activity started",
            extra={
                "activity_name": "save_messages",
                "blog_id": blog_id,
                "user_message_length": len(user_message),
                "ai_message_length": len(ai_message),
            },
        )

        with next(get_session()) as session:
            message = Message(
                user_message=user_message,
                ai_message=ai_message,
                blog_id=blog_id,
                updated_at=datetime.now(timezone.utc)
            )
            session.add(message)
            session.commit()
            session.refresh(message)

            activity_module.logger.info(
                "Save messages activity completed successfully",
                extra={
                    "activity_name": "save_messages",
                    "blog_id": blog_id,
                    "message_id": message.id,
                    "user_message_length": len(user_message),
                    "ai_message_length": len(ai_message),
                    "saved_at": message.updated_at.isoformat() if message.updated_at else None,
                },
            )

            return MessageResponse(
                id=message.id,
                user_message=message.user_message,
                ai_message=message.ai_message,
                updated_at=message.updated_at,
                blog_id=message.blog_id,
                checkpoint_id=message.checkpoint_id
            )
    except Exception as e:
        activity_module.logger.error(
            f"Failed to save messages: {e}",
            extra={
                "activity_name": "save_messages",
                "blog_id": blog_id,
                "user_message_length": len(user_message),
                "ai_message_length": len(ai_message),
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise ApplicationError(f"Failed to save messages: {e}")


@activity.defn
async def create_new_blog(title: str, description: str, desired_tone: str, seo_keywords: List[str],
                         target_audience: str, blog_length_min: int, blog_length_max: int,
                         user_id: int) -> int:
    """
    Creates a new blog in the database and returns the blog ID.
    """
    try:
        activity_module.logger.info(
            "Create new blog activity started",
            extra={
                "activity_name": "create_new_blog",
                "title": title,
                "description_length": len(description),
                "desired_tone": desired_tone,
                "seo_keywords_count": len(seo_keywords),
                "target_audience": target_audience,
                "blog_length_range": f"{blog_length_min}-{blog_length_max}",
                "user_id": user_id,
            },
        )

        with next(get_session()) as session:
            blog = Blog(
                title=title,
                description=description,
                desired_tone=desired_tone,
                seo_keywords=seo_keywords,
                target_audience=target_audience,
                blog_length_min=blog_length_min,
                blog_length_max=blog_length_max,
                user_id=user_id
            )
            session.add(blog)
            session.commit()
            session.refresh(blog)

            activity_module.logger.info(
                "Create new blog activity completed successfully",
                extra={
                    "activity_name": "create_new_blog",
                    "blog_id": blog.id,
                    "title": title,
                    "created_at": blog.created_at.isoformat() if blog.created_at else None,
                    "user_id": user_id,
                },
            )

            return blog.id
    except Exception as e:
        activity_module.logger.error(
            f"Failed to create new blog: {e}",
            extra={
                "activity_name": "create_new_blog",
                "title": title,
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise ApplicationError(f"Failed to create new blog: {e}")