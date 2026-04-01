from fastapi import APIRouter, HTTPException, Path, Body
from typing import List
from app.database import db
from app.models.schemas import (
    RequirementResponse,
    RequirementUpdate,
    RequirementCreate,
)

router = APIRouter()


@router.get(
    "/sessions/{session_id}/requirements",
    response_model=List[RequirementResponse],
)
async def get_requirements(session_id: str = Path(...)):
    result = (
        db.table("requirements")
        .select("*")
        .eq("session_id", session_id)
        .order("req_id")
        .execute()
    )
    return result.data


@router.patch(
    "/sessions/{session_id}/requirements/{req_id}",
    response_model=RequirementResponse,
)
async def update_requirement(
    session_id: str = Path(...),
    req_id: str = Path(...),
    body: RequirementUpdate = Body(...),
):
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("requirements")
        .update(updates)
        .eq("session_id", session_id)
        .eq("req_id", req_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Requirement not found")

    return result.data[0]


@router.post(
    "/sessions/{session_id}/requirements",
    response_model=RequirementResponse,
)
async def add_requirement(
    session_id: str = Path(...),
    body: RequirementCreate = Body(...),
):
    existing = (
        db.table("requirements").select("req_id").eq("session_id", session_id).execute()
    )

    next_num = len(existing.data) + 1
    new_req_id = f"req_{next_num:03d}"

    row = {
        "session_id": session_id,
        "req_id": new_req_id,
        "category": body.category,
        "requirement_text": body.requirement_text,
        "source_page": body.source_page,
        "confirmed": body.confirmed,
    }

    result = db.table("requirements").insert(row).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create requirement")

    return result.data[0]


@router.delete("/sessions/{session_id}/requirements/{req_id}")
async def delete_requirement(
    session_id: str = Path(...),
    req_id: str = Path(...),
):
    db.table("requirements").delete().eq("session_id", session_id).eq(
        "req_id", req_id
    ).execute()

    return {"ok": True}
