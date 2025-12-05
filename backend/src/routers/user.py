from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from ..database import get_db
from ..models import User, Bookmark, ReadingHistory, Rating, MangaStatus, StatusType
from ..schemas import (
    BookmarkCreate, BookmarkResponse,
    HistoryUpdate, HistoryResponse,
    RatingCreate, RatingResponse,
    StatusUpdate, StatusResponse
)
from ..auth import get_current_user

router = APIRouter(prefix="/user", tags=["user"])

# ... (Previous endpoints for bookmarks/history/ratings - I will include them to ensure file integrity)

@router.get("/bookmarks", response_model=list[BookmarkResponse])
async def get_bookmarks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Bookmark).where(Bookmark.user_id == user.id))
    return result.scalars().all()

@router.post("/bookmarks", response_model=BookmarkResponse)
async def add_bookmark(
    bookmark: BookmarkCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if exists
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user.id,
            Bookmark.manga_id == bookmark.manga_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bookmark already exists")
    
    new_bookmark = Bookmark(user_id=user.id, manga_id=bookmark.manga_id)
    db.add(new_bookmark)
    await db.commit()
    await db.refresh(new_bookmark)
    return new_bookmark

@router.delete("/bookmarks/{manga_id}")
async def remove_bookmark(
    manga_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        delete(Bookmark).where(
            Bookmark.user_id == user.id,
            Bookmark.manga_id == manga_id
        )
    )
    await db.commit()
    return {"message": "Bookmark removed"}

# History
@router.get("/history", response_model=list[HistoryResponse])
async def get_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ReadingHistory)
        .where(ReadingHistory.user_id == user.id)
        .order_by(ReadingHistory.updated_at.desc())
    )
    return result.scalars().all()

@router.post("/history", response_model=HistoryResponse)
async def update_history(
    history: HistoryUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ReadingHistory).where(
            ReadingHistory.user_id == user.id,
            ReadingHistory.manga_id == history.manga_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.chapter_id = history.chapter_id
        existing.page = history.page
        # updated_at updates automatically on DB side or we can force it
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_history = ReadingHistory(
            user_id=user.id,
            manga_id=history.manga_id,
            chapter_id=history.chapter_id,
            page=history.page
        )
        db.add(new_history)
        await db.commit()
        await db.refresh(new_history)
        return new_history

# Ratings
@router.get("/ratings", response_model=list[RatingResponse])
async def get_ratings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Rating).where(Rating.user_id == user.id))
    return result.scalars().all()

@router.post("/ratings", response_model=RatingResponse)
async def add_rating(
    rating: RatingCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Rating).where(
            Rating.user_id == user.id,
            Rating.manga_id == rating.manga_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.score = rating.score
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_rating = Rating(
            user_id=user.id,
            manga_id=rating.manga_id,
            score=rating.score
        )
        db.add(new_rating)
        await db.commit()
        await db.refresh(new_rating)
        return new_rating

# Status
@router.get("/status", response_model=list[StatusResponse])
async def get_statuses(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(MangaStatus).where(MangaStatus.user_id == user.id))
    return result.scalars().all()

@router.post("/status", response_model=StatusResponse)
async def update_status(
    status_update: StatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MangaStatus).where(
            MangaStatus.user_id == user.id,
            MangaStatus.manga_id == status_update.manga_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.status = status_update.status
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_status = MangaStatus(
            user_id=user.id,
            manga_id=status_update.manga_id,
            status=status_update.status
        )
        db.add(new_status)
        await db.commit()
        await db.refresh(new_status)
        return new_status
