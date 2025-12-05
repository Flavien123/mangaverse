from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from ..database import get_db
from ..models import User, Bookmark, MangaStatus, ReadingHistory, StatusType
from ..auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return user

@router.get("/stats")
async def get_system_stats(
    user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns system-wide statistics.
    Demonstrates complex SQL queries (Aggregations, Group By).
    """
    
    # 1. Total Users
    user_count_query = select(func.count(User.id))
    user_count = (await db.execute(user_count_query)).scalar()

    # 2. Distribution of Manga Statuses (GROUP BY)
    # SELECT status, COUNT(*) FROM manga_statuses GROUP BY status
    status_dist_query = (
        select(MangaStatus.status, func.count(MangaStatus.id))
        .group_by(MangaStatus.status)
    )
    status_dist_res = (await db.execute(status_dist_query)).all()
    status_stats = {status: count for status, count in status_dist_res}

    # 3. Top 5 Most Bookmarked Mangas (Complex Ordering & Limit)
    # SELECT manga_id, COUNT(*) as c FROM bookmarks GROUP BY manga_id ORDER BY c DESC LIMIT 5
    top_bookmarks_query = (
        select(Bookmark.manga_id, func.count(Bookmark.id).label("count"))
        .group_by(Bookmark.manga_id)
        .order_by(desc("count"))
        .limit(5)
    )
    top_bookmarks = (await db.execute(top_bookmarks_query)).all()
    
    # 4. Activity (Reading History updates in last 24h) - simplified to just total count for now
    history_count_query = select(func.count(ReadingHistory.id))
    history_count = (await db.execute(history_count_query)).scalar()

    return {
        "users_total": user_count,
        "manga_status_distribution": status_stats,
        "top_bookmarked_manga": [{"id": m[0], "count": m[1]} for m in top_bookmarks],
        "total_reading_entries": history_count
    }
