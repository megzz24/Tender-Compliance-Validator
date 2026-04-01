import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown (nothing to clean up)


app = FastAPI(title="Tender Compliance Validator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import sessions  # noqa: E402
from app.routers import documents  # noqa: E402
from app.routers import pipeline  # noqa: E402
from app.routers import requirements  # noqa: E402

# from app.routers import results     # uncomment in Feature 2

app.include_router(sessions.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(requirements.router, prefix="/api")
# app.include_router(results.router,    prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
