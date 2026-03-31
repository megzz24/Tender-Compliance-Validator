"""
Uses PyMuPDF (fitz) to open a PDF file.
Extracts all text blocks with their page numbers.
Returns a list of {text, page} dicts.
Handles multi-column layouts and ignores empty blocks.
"""