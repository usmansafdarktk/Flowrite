# from __future__ import annotations
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel, Column, JSON

# Use TYPE_CHECKING to prevent circular imports at runtime
if TYPE_CHECKING:
    from .user import User
    from .message import Message
    from .checkpoint import Checkpoint

class Blog(SQLModel, table=True):
    __tablename__ = "blogs"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str | None = Field(default=None)
    desired_tone: str | None = Field(default=None)
    seo_keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    target_audience: str | None = Field(default=None)
    blog_length_min: int | None = Field(default=None)
    blog_length_max: int | None = Field(default=None)
    content: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: int | None = Field(default=None, foreign_key="users.id", ondelete="CASCADE")
    user: Optional["User"] = Relationship(back_populates="blogs")
    instructions: str | None = Field(default=None)
    messages: list["Message"] = Relationship(
        back_populates="blog",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "passive_deletes": True,
            "order_by": "Message.updated_at.asc()"
        }
    )
    checkpoints: list["Checkpoint"] = Relationship(
        back_populates="blog",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "passive_deletes": True,
            "order_by": "Checkpoint.created_at.asc()"
        }
    )
