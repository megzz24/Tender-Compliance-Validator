from typing import List, Dict

CHUNK_SIZE_WORDS = 500

def chunk(blocks: List[Dict]) -> List[Dict]:
    chunks = []
    current_parts = []
    current_page = None
    current_words = 0

    for block in blocks:
        block_words = len(block["text"].split())

        if current_words + block_words > CHUNK_SIZE_WORDS and current_parts:
            chunks.append(
                {
                    "text": " ".join(current_parts).strip(),
                    "page": current_page,
                }
            )
            current_parts = []
            current_page = None
            current_words = 0

        # Add a page marker when the page changes
        if block["page"] != current_page:
            current_parts.append(f"[PAGE {block['page']}]")
            if current_page is None:
                current_page = block["page"]

        current_parts.append(block["text"])
        current_words += block_words

    if current_parts:
        chunks.append(
            {
                "text": " ".join(current_parts).strip(),
                "page": current_page,
            }
        )

    return chunks