"""
Initialises the Vertex AI Gemini client using gcloud
Application Default Credentials.
Exports a single async `chat(prompt, system, temperature)` function. All Gemini calls go through this.
asyncio.Semaphore(5) lives here — limits concurrent calls.
"""