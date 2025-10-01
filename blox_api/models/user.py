# py modules
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

# Use TYPE_CHECKING to prevent circular imports at runtime
if TYPE_CHECKING:
    from .blog import Blog

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True)
    password: str # Should be a hash, not plaintext
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    blogs: List["Blog"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "passive_deletes": True}
    )
