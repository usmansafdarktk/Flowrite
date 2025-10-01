from datetime import datetime
from pydantic import BaseModel
from dataclasses import dataclass
from typing import Optional

class WebSearchToolResponse(BaseModel):
    url: str
    content: str

@dataclass
class OpenAIMessage:
    """Response model for message"""
    role: str
    content: str

@dataclass
class BlogDetails:
    """Response model for blog with all fields"""
    id: int
    title: str
    description: str
    desired_tone: str
    seo_keywords: list[str]
    target_audience: str
    blog_length_min: int
    blog_length_max: int
    content: Optional[str]
    messages: list[OpenAIMessage]
    instructions: Optional[str]
    user_selected_context: Optional[list[str]]
    user_message: Optional[str] = None
    general_instructions: Optional[str] = None  # General summary of user preferences
    user_prompt: Optional[str] = None  # Enhanced user message for multi-agent system
    # Consolidated tool call counters for workflow determinism - track usage per workflow execution
    tool_call_counters: dict[str, int] = None  # Track calls to all tools (agents and simple tools)

    def __post_init__(self):
        if self.tool_call_counters is None:
            self.tool_call_counters = {}


@dataclass
class BlogWorkflowInput:
    """Input model for blog workflow"""
    title: str
    description: str
    desired_tone: str
    seo_keywords: list[str]
    target_audience: str
    blog_length_min: int
    blog_length_max: int
    user_id: int
    user_message: Optional[str] = None
    blog_id: Optional[int] = None  # None for new blogs, ID for existing blogs
    user_selected_context: Optional[list[str]] = None

@dataclass
class BlogInstructions:
    instructions: str
    new_message: str

@dataclass
class MessageResponse:
    """Pydantic model for message data that can be safely serialized in Temporal workflows"""
    id: int
    user_message: str
    ai_message: str
    updated_at: datetime
    blog_id: int
    checkpoint_id: Optional[int] = None
