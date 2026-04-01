import os
import asyncio
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from app.database import db
from app.config import settings
from app.services import pdf_extractor, chunker, requirement_extractor
from app.utils.sse import format_sse_event

router = APIRouter()


@router.get("/sessions/{session_id}/stream/rfp")
async def stream_rfp(session_id: str):
    # Verify session exists
    session = db.table("tender_sessions").select("*").eq("id", session_id).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    rfp_path = os.path.join(settings.UPLOAD_DIR, session_id, "rfp.pdf")
    if not os.path.exists(rfp_path):
        raise HTTPException(status_code=400, detail="RFP file not uploaded yet")

    async def generator():
        try:
            await asyncio.sleep(0.5)
            
            # Step 1 — extract text
            yield format_sse_event("⏳ Extracting RFP text...")
            await asyncio.sleep(0.1)
        
            blocks = pdf_extractor.extract(rfp_path)
            pages = len(set(b["page"] for b in blocks))
            yield format_sse_event(f"✅ Extracted {len(blocks)} text blocks across {pages} pages")
            await asyncio.sleep(0.1)
        
            # Step 2 — chunk
            yield format_sse_event("⏳ Chunking into segments...")
            await asyncio.sleep(0.1)
        
            chunks = chunker.chunk(blocks)
            yield format_sse_event(f"✅ Created {len(chunks)} chunks")
            await asyncio.sleep(0.1)    
            
            # Step 3 — extract requirements from chunks
            
            # Run extraction — but we need to stream progress
            # Use a task + queue pattern for streaming

            queue = asyncio.Queue()

            async def streaming_yield_fn(message: str):
                await queue.put(message)

            async def run_extraction():
                result = await requirement_extractor.extract_from_chunks(
                    chunks, streaming_yield_fn
                )
                await queue.put(None)  # sentinel
                return result

            extract_task = asyncio.create_task(run_extraction())

            while True:
                msg = await queue.get()
                if msg is None:
                    break
                yield format_sse_event(msg)
                await asyncio.sleep(0.1)
            
            extracted = await extract_task

            # Step 4 — dedup
            queue2 = asyncio.Queue()

            async def dedup_yield_fn(message: str):
                await queue2.put(message)

            async def run_dedup():
                result = await requirement_extractor.dedup_requirements(
                    extracted, dedup_yield_fn
                )
                await queue2.put(None)
                return result

            dedup_task = asyncio.create_task(run_dedup())

            while True:
                msg = await queue2.get()
                if msg is None:
                    break
                yield format_sse_event(msg)
                await asyncio.sleep(0.1)

            deduped = await dedup_task

            # Step 5 — save to Supabase
            yield format_sse_event("⏳ Saving requirements to database...")
            await asyncio.sleep(0.1)
            
            # Delete any existing requirements for this session first
            db.table("requirements").delete().eq("session_id", session_id).execute()

            # Insert all requirements
            rows = []
            valid_categories = {"Legal", "Technical", "Financial", "Operational"}

            for req in deduped:
                category = req.get("category", "Technical")
                if category not in valid_categories:
                    category = "Technical"

                rows.append(
                    {
                        "session_id": session_id,
                        "req_id": req.get("req_id", f"req_{len(rows)+1:03d}"),
                        "category": category,
                        "requirement_text": req.get("requirement_text", ""),
                        "source_page": req.get("source_page", 1),
                        "confirmed": True,
                    }
                )

            if rows:
                db.table("requirements").insert(rows).execute()

            # Update session status
            db.table("tender_sessions").update({"status": "extracted"}).eq(
                "id", session_id
            ).execute()

            yield format_sse_event(f"✅ Saved {len(rows)} requirements to database")
            await asyncio.sleep(0.1)            
            yield format_sse_event("✅ Done")
            
        except Exception as e:
            yield format_sse_event(f"❌ Error: {str(e)}")
            raise 

    return EventSourceResponse(generator())
