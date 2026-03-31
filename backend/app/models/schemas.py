"""
All Pydantic request and response models:
    SessionCreate, SessionResponse
    RequirementResponse, RequirementUpdate, RequirementCreate
    VendorResultResponse
    RiskReportResponse
    ValidationResult (per-requirement result shape)
    RiskFlag (individual flag shape)
"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.types import Status, Severity, RiskLevel, Category, SessionStatus


class SessionCreate(BaseModel):
    name: str


class SessionResponse(BaseModel):
    id: str
    name: str
    rfp_filename: Optional[str] = None
    status: SessionStatus
    created_at: Optional[datetime] = None


class RequirementResponse(BaseModel):
    id: str
    session_id: str
    req_id: str
    category: Category
    requirement_text: str
    source_page: int
    confirmed: bool


class RequirementUpdate(BaseModel):
    category: Optional[Category] = None
    requirement_text: Optional[str] = None
    source_page: Optional[int] = None
    confirmed: Optional[bool] = None


class RequirementCreate(BaseModel):
    category: Category
    requirement_text: str
    source_page: int
    confirmed: bool = True


class ValidationResult(BaseModel):
    req_id: str
    status: Status
    closest_excerpt: Optional[str] = None
    page: Optional[int] = None
    reasoning: Optional[str] = None
    probe_confidence: Optional[int] = None
    evidence_quality: Optional[str] = None
    cosine_similarity: Optional[float] = None


class VendorResultResponse(BaseModel):
    id: str
    session_id: str
    vendor_name: str
    compliance_score: Optional[float] = None
    status: Optional[str] = None
    results: Optional[Any] = None


class RiskFlag(BaseModel):
    flagged_text: str
    risk_type: str
    severity: Severity
    page: int
    impact: str


class RiskReportResponse(BaseModel):
    id: str
    session_id: str
    vendor_name: str
    tone_score: Optional[int] = None
    tone_summary: Optional[str] = None
    overall_risk: Optional[RiskLevel] = None
    total_flags: Optional[int] = None
    flags: Optional[Any] = None
