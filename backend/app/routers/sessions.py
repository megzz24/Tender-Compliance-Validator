from fastapi import APIRouter, HTTPException
from app.database import db
from app.models.schemas import SessionCreate, SessionResponse

router = APIRouter()


@router.post("/sessions", response_model=SessionResponse)
async def create_session(body: SessionCreate):
    result = (
        db.table("tender_sessions")
        .insert(
            {
                "name": body.name,
                "status": "created",
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    return result.data[0]


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    result = db.table("tender_sessions").select("*").eq("id", session_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    return result.data[0]


@router.get("/sessions/by-name/{name}", response_model=SessionResponse)
async def get_session_by_name(name: str):
    result = (
        db.table("tender_sessions")
        .select("*")
        .eq("name", name)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return result.data[0]
