import json
from typing import Union


def format_sse_event(data: Union[str, dict]) -> str:
    if isinstance(data, dict):
        # Structured payload — JSON serialise, no newline sanitisation needed
        payload = json.dumps(data)
    else:
        # Plain string — replace internal newlines so one message
        # doesn't get split into multiple SSE events by the browser
        payload = str(data).replace("\n", " ")

    return f"data: {payload}\n\n"