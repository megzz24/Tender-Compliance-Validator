"""
GET /api/sessions/{id}/stream/rfp
    SSE endpoint. Runs the full RFP extraction pipeline
    and yields log events as text/event-stream.
    Saves requirements to Supabase when done.

GET /api/sessions/{id}/stream/validate
    SSE endpoint. Per vendor: embeds chunks, validates
    requirements, probes confidence, runs risk detection.
    Saves vendor_results and risk_reports to Supabase.
"""