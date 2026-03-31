"""
POST /api/sessions/{id}/upload-rfp
    Accepts a single PDF file. Saves to uploads/{session_id}/rfp.pdf.
    Updates rfp_filename in tender_sessions.
    
POST /api/sessions/{id}/upload-vendors
    Accepts multiple PDF files. Saves each to
    uploads/{session_id}/vendors/{filename}.
"""