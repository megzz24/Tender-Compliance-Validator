"""
GET /api/sessions/{id}/requirements
    Returns all requirements for the session.
    
PATCH /api/sessions/{id}/requirements/{req_id}
    Updates category, text, source_page, or confirmed flag.
    
POST /api/sessions/{id}/requirements
    Adds a manually typed requirement row.
    
DELETE /api/sessions/{id}/requirements/{req_id}
    Deletes a requirement row.
"""