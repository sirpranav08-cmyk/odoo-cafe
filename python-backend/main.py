from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os, pathlib

from database import connect_db, close_db
from routers.auth import router as auth_router
from routers.data import router as data_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="Odoo Cafe API", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(data_router)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    from datetime import datetime
    return {"status": "ok", "time": str(datetime.utcnow())}

# ── Serve frontend static files ───────────────────────────────────────────────
FRONTEND_DIR = pathlib.Path(__file__).parent.parent / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    async def serve_home():
        return FileResponse(str(FRONTEND_DIR / "homepage.html"))

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        # API routes are handled above, serve frontend for everything else
        file_path = FRONTEND_DIR / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIR / "homepage.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
