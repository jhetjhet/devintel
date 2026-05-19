import logging

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.admin import setup_admin
from app.routers import analyze, auth
from app.socket.handlers import sio

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

app = FastAPI(title="DevIntel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(auth.router)
setup_admin(app)


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Wrap the FastAPI app inside the Socket.IO ASGI app.
# Uvicorn must be pointed at this object: app.main:socket_app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
