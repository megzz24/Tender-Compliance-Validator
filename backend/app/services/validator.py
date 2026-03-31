"""
Takes confirmed requirements and a vendor FAISS index.
Per requirement: retrieves top-3 chunks.
If max cosine < 0.5 → status = Missing, skip Gemini.
If cosine ≥ 0.5 → batches 10 requirements per Gemini call → returns status, closest_excerpt, page, reasoning.
Second Gemini call (self-probe) per batch → returns probe_confidence (0-100) and evidence_quality per req.
Returns a dict of {req_id: result} for the vendor.
"""