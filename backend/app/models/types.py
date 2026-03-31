"""
Python Literal types used across the app:
    Status 
    Severity 
    RiskLevel 
    Category
    SessionStatus 
"""
from typing import Literal

Status   = Literal["Met", "Partial", "Missing"]
Severity = Literal["High", "Medium", "Low"]
RiskLevel = Literal["High", "Medium", "Low"]
Category = Literal["Legal", "Technical", "Financial", "Operational"]
SessionStatus = Literal["created", "extracted", "validated"]