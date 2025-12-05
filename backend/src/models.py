from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class StatusType(str, Enum):
    planned = "planned"
    reading = "reading"
    completed = "completed"
    dropped = "dropped"
    on_hold = "on_hold"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # Relationships
    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="user", cascade="all, delete")
    history: Mapped[list["ReadingHistory"]] = relationship(back_populates="user", cascade="all, delete")
    ratings: Mapped[list["Rating"]] = relationship(back_populates="user", cascade="all, delete")
    statuses: Mapped[list["MangaStatus"]] = relationship(back_populates="user", cascade="all, delete")

class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    manga_id: Mapped[str] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="bookmarks")

class ReadingHistory(Base):
    __tablename__ = "reading_history"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    manga_id: Mapped[str] = mapped_column(String(36))
    chapter_id: Mapped[str] = mapped_column(String(36))
    page: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    user: Mapped["User"] = relationship(back_populates="history")

class Rating(Base):
    __tablename__ = "ratings"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    manga_id: Mapped[str] = mapped_column(String(36))
    score: Mapped[int] = mapped_column(Integer)  # 1-10
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="ratings")

class MangaStatus(Base):
    __tablename__ = "manga_statuses"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    manga_id: Mapped[str] = mapped_column(String(36))
    status: Mapped[StatusType] = mapped_column(SQLEnum(StatusType), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    user: Mapped["User"] = relationship(back_populates="statuses")
