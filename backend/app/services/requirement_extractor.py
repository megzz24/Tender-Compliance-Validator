"""
Takes chunks and runs concurrent Gemini calls (Semaphore(5)) to extract requirements from each chunk.
Each call returns a JSON list of requirements with id, category, requirement_text, source_page.
After all chunks, runs one dedup Gemini call to merge duplicates and near-duplicates.
Returns the final deduplicated list.
"""