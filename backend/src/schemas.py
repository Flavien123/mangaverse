from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class StatusType(str, Enum):
    planned = "planned"
    reading = "reading"
    completed = "completed"
    dropped = "dropped"
    on_hold = "on_hold"

# Auth
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Bookmarks
class BookmarkCreate(BaseModel):
    manga_id: str

class BookmarkResponse(BaseModel):
    id: int
    manga_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# History
class HistoryUpdate(BaseModel):
    manga_id: str
    chapter_id: str
    page: int

class HistoryResponse(BaseModel):
    id: int
    manga_id: str
    chapter_id: str
    page: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Ratings
class RatingCreate(BaseModel):
    manga_id: str
    score: int

class RatingResponse(BaseModel):
    id: int
    manga_id: str
    score: int
    created_at: datetime

    class Config:
        from_attributes = True

# Status
class StatusUpdate(BaseModel):
    manga_id: str
    status: StatusType

class StatusResponse(BaseModel):
    id: int
    manga_id: str
    status: StatusType
    updated_at: datetime

    class Config:
        from_attributes = True
