import asyncio
import json
import re
from typing import List, Dict, Callable, Awaitable
from app.services.llm_client import chat

EXTRACTION_SYSTEM = """You are a procurement compliance analyst.
Your job is to extract mandatory compliance requirements from RFP documents.
Return ONLY valid JSON. No markdown. No explanation. No code fences."""

EXTRACTION_PROMPT = """Read the following RFP text chunk and extract every
mandatory compliance requirement the buyer is imposing on vendors.

The text contains [PAGE N] markers showing page numbers.
Use these markers to set the correct source_page for each requirement.

Return a JSON array. Each object must have exactly these keys:
- req_id: sequential string like "req_001", "req_002" etc.
- category: one of exactly: Legal, Technical, Financial, Operational
- requirement_text: clear, specific requirement text
- source_page: the page number where this requirement appears
                (use the most recent [PAGE N] marker before the requirement)

Rules:
- Only extract genuine requirements (must, shall, will be required to, etc.)
- Ignore background information, definitions, and instructions to bidders
- If no requirements found, return an empty array []
- Return ONLY the JSON array, nothing else

RFP text:
{chunk_text}
"""

DEDUP_SYSTEM = """You are a procurement analyst.
Merge duplicate requirements from an RFP extraction.
Return ONLY valid JSON. No markdown. No explanation. No code fences."""

DEDUP_PROMPT = """Below is a list of requirements extracted from an RFP.
Some may be duplicates or near-duplicates.

Merge any requirements that are identical or near-identical.
Keep the most specific and complete version of each requirement.
Keep all genuinely unique requirements.
Re-number req_ids sequentially starting from req_001.

Return a JSON array in the same format:
- req_id
- category (one of: Legal, Technical, Financial, Operational)
- requirement_text
- source_page

Return ONLY the JSON array, nothing else.

Requirements:
{requirements_json}
"""


def _parse_json_response(text: str) -> List[Dict]:
    # Strip markdown code fences if present
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
        return []
    except json.JSONDecodeError:
        return []


async def _extract_from_chunk(
    chunk: Dict,
    chunk_index: int,
    total_chunks: int,
    yield_fn: Callable[[str], Awaitable[None]],
) -> List[Dict]:
    await yield_fn(f"⏳ Analyzing chunk {chunk_index + 1} of {total_chunks}...")

    prompt = EXTRACTION_PROMPT.format(chunk_text=chunk["text"])
    response = await chat(prompt, system=EXTRACTION_SYSTEM, temperature=0.1)
    requirements = _parse_json_response(response)

    # Stamp each requirement with the chunk's page if source_page is missing
    for req in requirements:
        if not req.get("source_page"):
            req["source_page"] = chunk.get("page", 1)

    return requirements


async def extract_from_chunks(
    chunks: List[Dict],
    yield_fn: Callable[[str], Awaitable[None]],
) -> List[Dict]:
    all_requirements = []
    
    for i, chunk in enumerate(chunks):
        reqs = await _extract_from_chunk(chunk, i, len(chunks), yield_fn)
        all_requirements.extend(reqs)
        await asyncio.sleep(0.1)

    await yield_fn(
        f"✅ Extraction complete — {len(all_requirements)} requirements before dedup"
    )
    return all_requirements

async def dedup_requirements(
    requirements: List[Dict],
    yield_fn: Callable[[str], Awaitable[None]],
) -> List[Dict]:
    if not requirements:
        return []

    await yield_fn("⏳ Deduplicating requirements...")

    # If too many requirements, dedup in two passes
    if len(requirements) > 60:
        await yield_fn(
            f"⏳ Large set ({len(requirements)}) — deduplicating in two passes..."
        )
        mid = len(requirements) // 2
        first = await _run_dedup(requirements[:mid])
        second = await _run_dedup(requirements[mid:])
        combined = first + second
        await yield_fn("⏳ Merging passes...")
        deduped = await _run_dedup(combined)
    else:
        deduped = await _run_dedup(requirements)

    await yield_fn(f"✅ Deduplication complete — {len(deduped)} unique requirements")
    return deduped


async def _run_dedup(requirements: List[Dict]) -> List[Dict]:
    """Single Gemini dedup call for a batch of requirements."""
    prompt = DEDUP_PROMPT.format(requirements_json=json.dumps(requirements, indent=2))
    response = await chat(prompt, system=DEDUP_SYSTEM, temperature=0.1)
    return _parse_json_response(response)