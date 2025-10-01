from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

# Use TYPE_CHECKING to prevent circular imports at runtime
if TYPE_CHECKING:
    from .blog import Blog
    from .checkpoint import Checkpoint

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: int = Field(primary_key=True)
    user_message: str
    ai_message: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    blog_id: int = Field(foreign_key="blogs.id", ondelete="CASCADE")
    checkpoint_id: int | None = Field(default=None, foreign_key="checkpoints.id", ondelete="SET NULL")
    blog: Optional["Blog"] = Relationship(back_populates="messages")
