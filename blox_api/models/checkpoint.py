# py modules
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

# Use TYPE_CHECKING to prevent circular imports at runtime
if TYPE_CHECKING:
    from .blog import Blog  

class Checkpoint(SQLModel, table=True):
    __tablename__ = "checkpoints"
    
    id: int | None = Field(default=None, primary_key=True)
    content: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    blog_id: int | None = Field(default=None, foreign_key="blogs.id", ondelete="CASCADE")
    blog: Optional["Blog"] = Relationship(back_populates="checkpoints")
