"""
Loads the all-MiniLM-L6-v2 model once at startup.
encode_chunks(chunks) → encodes all vendor chunks and builds a FAISS IndexFlatIP in memory.
retrieve(query, index, chunks, k=3) → returns top-k chunks with cosine similarity scores.
"""