"""
POST /api/sessions
    Creates a new row in tender_sessions table.
    Returns session id and status.
    
GET /api/sessions/{id}
    Returns session row. Used by frontend
    as fallback when SSE drops.
"""
from fastapi import APIRouter
router = APIRouter()