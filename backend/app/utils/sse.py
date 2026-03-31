"""
format_sse_event(data, event=None) helper.
Takes a string or dict and returns a correctly formatted SSE string: "data: ...\n\n"
Used by both pipeline SSE endpoints.
"""
import json
from typing import Union


def format_sse_event(data: Union[str, dict]) -> str:
    """
    Format a string or dict as a valid SSE event string.
    Usage:  yield format_sse_event("Processing chunk 1...")
            yield format_sse_event({"type": "done", "count": 5})
    """
    if isinstance(data, dict):
        payload = json.dumps(data)
    else:
        payload = data

    return f"data: {payload}\n\n"