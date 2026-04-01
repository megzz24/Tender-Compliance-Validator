import asyncio
from typing import Optional
from google import genai
from google.genai.types import HttpOptions, GenerateContentConfig
from app.config import settings

client = genai.Client(
    vertexai=True,
    project=settings.GOOGLE_CLOUD_PROJECT,
    location=settings.GOOGLE_CLOUD_LOCATION,
    http_options=HttpOptions(api_version="v1"),
)

_semaphore = asyncio.Semaphore(5)


async def chat(
    prompt: str,
    system: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    async with _semaphore:
        config = GenerateContentConfig(temperature=temperature)
        if system:
            config.system_instruction = system

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        return response.text or ""
