"""
End-to-end test for the DevIntel Socket.IO flow.

Usage:
    REPO_URL=https://github.com/your/repo python test_socket.py

Environment variables:
    REPO_URL   — Git repository URL to analyze (required)
    API_BASE   — Base URL of the API server (default: http://localhost:8000)
"""

import asyncio
import os
import sys

import requests
import socketio


API_BASE = os.environ.get("API_BASE", "http://localhost:8000")
REPO_URL = os.environ.get("REPO_URL", "")


def call_analyze(repo_url: str) -> str:
    """POST /api/analyze/ and return the repository ID."""
    print(f"[analyze] Calling POST {API_BASE}/api/analyze/ with repo_url={repo_url!r}")
    response = requests.post(
        f"{API_BASE}/api/analyze/",
        json={"repo_url": repo_url},
        timeout=30,
    )
    response.raise_for_status()
    repository_id = response.json()["id"]
    print(f"[analyze] Repository ID: {repository_id}")
    return repository_id


async def listen(repository_id: str) -> None:
    """Connect to Socket.IO and listen until a terminal event is received."""
    sio = socketio.AsyncClient(logger=False)
    done_event = asyncio.Event()

    @sio.event
    async def connect():
        print(f"[socket] Connected  (sid={sio.get_sid()!r})")

    @sio.event
    async def connect_error(data):
        print(f"[socket] Connection error: {data}")
        done_event.set()

    @sio.event
    async def disconnect():
        print("[socket] Disconnected")
        done_event.set()

    @sio.on("progress")
    async def on_progress(data):
        print(f"[progress] {data}")

    @sio.on("done")
    async def on_done(data):
        print(f"[done] {data}")
        done_event.set()

    @sio.on("error")
    async def on_error(data):
        print(f"[error] {data}")
        done_event.set()

    await sio.connect(API_BASE, auth={"repository_id": repository_id})

    try:
        await done_event.wait()
    finally:
        if sio.connected:
            await sio.disconnect()


def main() -> None:
    repo_url = REPO_URL
    if not repo_url:
        print("Error: REPO_URL environment variable is not set.")
        print("Usage: REPO_URL=https://github.com/your/repo python test_socket.py")
        sys.exit(1)

    repository_id = call_analyze(repo_url)
    asyncio.run(listen(repository_id))


if __name__ == "__main__":
    main()
