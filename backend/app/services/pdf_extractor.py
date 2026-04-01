import fitz  # PyMuPDF
from typing import List, Dict


def extract(pdf_path: str) -> List[Dict]:
    doc: fitz.Document = fitz.open(pdf_path)
    blocks = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_blocks = page.get_text("blocks")  # returns list of tuples

        for block in page_blocks:
            # block format: (x0, y0, x1, y1, text, block_no, block_type)
            # block_type 0 = text, 1 = image
            if block[6] != 0:
                continue  # skip image blocks

            text = block[4].strip()
            if len(text) < 20:
                continue  # skip very short blocks

            blocks.append(
                {
                    "text": text,
                    "page": page_num + 1,  # 1-indexed
                }
            )

    doc.close()
    return blocks
