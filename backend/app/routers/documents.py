import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Path
from typing import List
from app.database import db
from app.config import settings

router = APIRouter()


def _session_dir(session_id: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, session_id)


def _vendor_dir(session_id: str) -> str:
    return os.path.join(_session_dir(session_id), "vendors")


@router.post("/sessions/{session_id}/upload-rfp")
async def upload_rfp(
    session_id: str = Path(...),
    file: UploadFile = File(...),
):
    filename = file.filename or "rfp.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    session_dir = _session_dir(session_id)
    os.makedirs(session_dir, exist_ok=True)

    save_path = os.path.join(session_dir, "rfp.pdf")
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    db.table("tender_sessions").update(
        {
            "rfp_filename": filename,
        }
    ).eq("id", session_id).execute()

    return {"ok": True, "filename": filename}


@router.post("/sessions/{session_id}/upload-vendors")
async def upload_vendors(
    session_id: str = Path(...),
    files: List[UploadFile] = File(...),
):
    vendor_dir = _vendor_dir(session_id)
    os.makedirs(vendor_dir, exist_ok=True)

    saved = []
    for file in files:
        filename = file.filename or ""
        if not filename.lower().endswith(".pdf"):
            continue

        save_path = os.path.join(vendor_dir, filename)
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        saved.append(filename)

    return {"ok": True, "saved": saved}
