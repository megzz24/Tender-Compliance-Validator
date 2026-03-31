"""
FastAPI app instance. Registers all routers with /api prefix.
Configures CORS to allow requests from the frontend.
Mounts nothing else — just wires everything together.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title="Tender Compliance Validator")

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Upload directory ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# ── Routers ───────────────────────────────────────────────────────────────────
# Imported here so they register after the app is created.
# Each router is added as features are built — uncomment as you go.

from app.routers import sessions      # noqa: E402
# from app.routers import documents   # uncomment in Feature 1
# from app.routers import pipeline    # uncomment in Feature 1
# from app.routers import requirements # uncomment in Feature 1
# from app.routers import results     # uncomment in Feature 2

app.include_router(sessions.router,  prefix="/api")
# app.include_router(documents.router,    prefix="/api")
# app.include_router(pipeline.router,     prefix="/api")
# app.include_router(requirements.router, prefix="/api")
# app.include_router(results.router,      prefix="/api")


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}