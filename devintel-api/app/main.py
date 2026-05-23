import logging

import socketio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.database import engine, Base
from app.admin import setup_admin
from app.routers import analyze, auth
from app.socket.handlers import sio

from app.config import settings

is_production = settings.ENVIRONMENT == "production"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

app = FastAPI(title="DevIntel API", version="1.0.0")

app.add_middleware(
    ProxyHeadersMiddleware,
    trusted_hosts=settings.TRUSTED_PROXIES.split(","),
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS.split(","),
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.ADMIN_SECRET_KEY,
    https_only=True,
    same_site="lax",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.DEBUG:
    @app.middleware("http")
    async def debug_everything(request: Request, call_next):
        print("\n=== RAW REQUEST DEBUG ===")

        print("URL:", request.url)
        print("Method:", request.method)
        print("Client:", request.client)

        print("\nHEADERS:")
        for key, value in request.headers.items():
            print(f"{key}: {value}")

        print("\nSCOPE:")
        print(request.scope)

        try:
            response = await call_next(request)

            print("\nRESPONSE STATUS:", response.status_code)

            return response

        except Exception as e:
            print("\nEXCEPTION:", repr(e))
            raise

        finally:
            print("=========================\n")

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
