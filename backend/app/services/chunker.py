"""
Takes the list of {text, page} blocks from pdf_extractor.
Merges and splits them into ~500 word segments.
Each chunk preserves the page number of its first block.
Returns a list of {text, page} chunks.
"""