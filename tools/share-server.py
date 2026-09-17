#!/usr/bin/env python3
"""Encrypted blob + live-session relay for OrbINT share links.

The server never sees plaintext. Clients encrypt with AES-GCM; the key stays
in the URL hash (Excalidraw model). The host token is also never the view key.

    python tools/share-server.py

Then set in .env / Settings:

    SHARE_API_URL=http://127.0.0.1:8788
    COLLAB_WS_URL=http://127.0.0.1:8788

Session:
    PUT  /v1/blob/<id>      ciphertext; X-OrbINT-Host + X-OrbINT-Live
    GET  /v1/blob/<id>      ciphertext only while the session is on (else 410)
    PUT  /v1/session/<id>   X-OrbINT-Host + X-OrbINT-Live: on|off
    GET  /v1/session/<id>   {"live": true|false}  (no ciphertext)
    GET  /v1/watch/<id>     SSE: update | ended
"""
from __future__ import annotations

import hashlib
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote


def load_dotenv() -> None:
    path = Path(__file__).resolve().parents[1] / ".env"
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        if not key or key == "GITHUB_TOKEN":
            continue
        os.environ.setdefault(key, val.strip().strip('"').strip("'"))


load_dotenv()

HOST = os.environ.get("SHARE_BIND", "127.0.0.1")
PORT = int(os.environ.get("SHARE_PORT", "8788"))
MAX_BLOB = int(os.environ.get("SHARE_MAX_BYTES", str(8 * 1024 * 1024)))
ROOT = Path(__file__).resolve().parents[1] / "tmp" / "share-blobs"
ROOT.mkdir(parents=True, exist_ok=True)

WATCHERS: dict[str, list] = {}
LOCK = threading.Lock()


def cors(handler: BaseHTTPRequestHandler) -> None:
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, X-OrbINT-Kind, X-OrbINT-Host, X-OrbINT-Live")
    handler.send_header("Cache-Control", "no-store")


def blob_path(room_id: str) -> Path:
    safe = "".join(ch for ch in room_id if ch.isalnum() or ch in "-_")[:80]
    return ROOT / (safe + ".bin")


def meta_path(room_id: str) -> Path:
    return blob_path(room_id).with_suffix(".json")


def host_digest(token: str) -> str:
    return hashlib.sha256((token or "").encode("utf-8")).hexdigest()


def read_meta(room_id: str) -> dict:
    path = meta_path(room_id)
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def write_meta(room_id: str, meta: dict) -> None:
    meta_path(room_id).write_text(json.dumps(meta), encoding="utf-8")


def is_live(room_id: str) -> bool:
    return bool(read_meta(room_id).get("live"))


def drop_blob(room_id: str) -> None:
    path = blob_path(room_id)
    if path.exists():
        try:
            path.unlink()
        except OSError:
            pass


def notify(room_id: str) -> None:
    with LOCK:
        waiters = list(WATCHERS.get(room_id) or [])
    for event in waiters:
        event.set()


def check_host(meta: dict, token: str) -> bool:
    expected = str(meta.get("host") or "")
    if not expected:
        return True
    return bool(token) and host_digest(token) == expected


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt: str, *args) -> None:
        return

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        cors(self)
        self.end_headers()

    def do_GET(self) -> None:
        path = unquote(self.path.split("?", 1)[0])
        if path == "/health":
            return self._send(200, b'{"ok":true}', "application/json")
        if path.startswith("/v1/session/"):
            return self._get_session(path.split("/v1/session/", 1)[1])
        if path.startswith("/v1/watch/"):
            return self._watch(path.split("/v1/watch/", 1)[1])
        if path.startswith("/v1/blob/"):
            return self._get_blob(path.split("/v1/blob/", 1)[1])
        self._send(404, b"not found", "text/plain")

    def do_PUT(self) -> None:
        path = unquote(self.path.split("?", 1)[0])
        if path.startswith("/v1/session/"):
            return self._put_session(path.split("/v1/session/", 1)[1])
        if not path.startswith("/v1/blob/"):
            self._send(404, b"not found", "text/plain")
            return
        room_id = path.split("/v1/blob/", 1)[1]
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0 or length > MAX_BLOB:
            self._send(413, b"too large", "text/plain")
            return
        body = self.rfile.read(length)
        token = (self.headers.get("X-OrbINT-Host") or "").strip()
        kind = (self.headers.get("X-OrbINT-Kind") or "room").strip().lower()
        live_hdr = (self.headers.get("X-OrbINT-Live") or "on").strip().lower()
        meta = read_meta(room_id)
        if kind == "json" and meta_path(room_id).exists() and meta.get("kind") == "json":
            self._send(409, b"frozen", "text/plain")
            return
        if not check_host(meta, token):
            self._send(403, b"forbidden", "text/plain")
            return
        if token and not meta.get("host"):
            meta["host"] = host_digest(token)
        meta["kind"] = kind
        meta["bytes"] = len(body)
        meta["live"] = live_hdr not in ("0", "off", "false", "no")
        blob_path(room_id).write_bytes(body)
        write_meta(room_id, meta)
        notify(room_id)
        self._send(204, b"", "text/plain")

    def _get_session(self, room_id: str) -> None:
        meta = read_meta(room_id)
        if not meta:
            self._send(404, b'{"live":false}', "application/json")
            return
        body = json.dumps({"live": bool(meta.get("live"))}).encode("utf-8")
        self._send(200, body, "application/json")

    def _put_session(self, room_id: str) -> None:
        length = int(self.headers.get("Content-Length") or "0")
        if length > 0:
            self.rfile.read(min(length, MAX_BLOB))
        token = (self.headers.get("X-OrbINT-Host") or "").strip()
        live_hdr = (self.headers.get("X-OrbINT-Live") or "").strip().lower()
        meta = read_meta(room_id)
        if not meta and not token:
            self._send(404, b"missing", "text/plain")
            return
        if meta.get("host") and not check_host(meta, token):
            self._send(403, b"forbidden", "text/plain")
            return
        if token and not meta.get("host"):
            meta["host"] = host_digest(token)
        live = live_hdr not in ("0", "off", "false", "no")
        meta["live"] = live
        if not live:
            drop_blob(room_id)
            meta["bytes"] = 0
        write_meta(room_id, meta)
        notify(room_id)
        self._send(204, b"", "text/plain")

    def _get_blob(self, room_id: str) -> None:
        meta = read_meta(room_id)
        path = blob_path(room_id)
        if not meta.get("live") or not path.exists():
            self._send(410, b'{"live":false}', "application/json")
            return
        data = path.read_bytes()
        self.send_response(200)
        cors(self)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _watch(self, room_id: str) -> None:
        event = threading.Event()
        with LOCK:
            WATCHERS.setdefault(room_id, []).append(event)
        self.send_response(200)
        cors(self)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        try:
            self.wfile.write(b"retry: 2000\n\n")
            self.wfile.flush()
            if not is_live(room_id):
                self.wfile.write(b"data: ended\n\n")
                self.wfile.flush()
            while True:
                if not event.wait(timeout=25):
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
                    continue
                if not is_live(room_id):
                    self.wfile.write(b"data: ended\n\n")
                    self.wfile.flush()
                    event.clear()
                    continue
                self.wfile.write(b"data: update\n\n")
                self.wfile.flush()
                event.clear()
        except BrokenPipeError:
            return
        finally:
            with LOCK:
                room = WATCHERS.get(room_id) or []
                if event in room:
                    room.remove(event)

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        cors(self)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)


def main() -> None:
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"OrbINT share relay on http://{HOST}:{PORT}")
    print("Stores opaque ciphertext only. Session off deletes the blob. Ctrl+C to stop.")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
