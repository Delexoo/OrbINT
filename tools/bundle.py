#!/usr/bin/env python3
"""Rebuild investigation.js and app.js from js/* modules; inline pages/*.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASE_ORDER = ["core-catalog", "core-state", "core-board-shape", "core-board-edit", "core-board-hit", "core-pages", "datasheet", "timeline-layout", "timeline-pickers", "timeline-render", "timeline-events", "whiteboard-render", "whiteboard-presets", "whiteboard-input", "notepad-notes", "notepad-graph", "notepad-format", "notepad-bind", "harvester-classify", "harvester-scan", "harvester-view", "harvester-export", "ops-world", "ops-flock", "operations-lounge", "operations-news", "operations-map", "operations-map-live", "intel", "report-pdf", "report-build", "report-preview", "boot-timeline", "boot-click", "boot-input", "boot-init"]
APP_ORDER = ["orbit-settings", "orbit-platforms", "orbit-field-stock", "orbit-find-links", "orbit-field-presets", "orbit-zones", "orbit-field-tools", "orbit-field-menus", "orbit-profile-store", "orbit-library-store", "search-desk", "orbit-profiles", "orbit-facts", "orbit-media", "orbit-dossier", "orbit-peers", "orbit-icons", "orbit-pickers", "crypto-share", "orbit-nodes", "orbit-camera", "orbit-pack", "orbit-motion", "orbit-export", "orbit-reset", "orbit-case-ui", "orbit-dock", "orbit-drag", "orbit-chrome", "orbit-zoom"]
PAGES = ["operations", "orbit", "timeline", "whiteboard", "notepad", "harvester", "datasheet", "guide", "chrome"]
HEADER_RE = re.compile(r"^/\*.*?\*/\n", re.S)


def strip_file_header(text: str) -> str:
    return HEADER_RE.sub("", text, count=1)


def inline_pages(html: str) -> str:
    for name in PAGES:
        start = f"    <!-- pages/{name}.html -->"
        end = f"    <!-- /pages/{name}.html -->"
        a = html.find(start)
        b = html.find(end)
        if a < 0 or b < 0 or b < a:
            raise SystemExit(f"missing markers for pages/{name}.html")
        body = (ROOT / "pages" / f"{name}.html").read_text(encoding="utf-8").strip("\n")
        html = html[:a] + start + "\n" + body + "\n" + end + html[b + len(end) :]
    return html


def assemble(order: list[str], dest: Path, wrap_iife: bool, comment: str) -> None:
    parts = []
    for name in order:
        raw = (ROOT / "js" / f"{name}.js").read_text(encoding="utf-8")
        parts.append(strip_file_header(raw))
    inner = "".join(parts)
    if wrap_iife:
        out = comment + "(function () {\n    'use strict';\n" + inner + "})();\n"
    else:
        out = comment + inner
        if not out.endswith("\n"):
            out += "\n"
    dest.write_text(out, encoding="utf-8")
    print("wrote", dest.name, dest.stat().st_size, "bytes")


def bundle() -> None:
    assemble(
        CASE_ORDER,
        ROOT / "investigation.js",
        True,
        "/* Assembled from the js/* files listed in CASE_ORDER.\n"
        "   Edit those files, then run: python tools/bundle.py */\n",
    )
    assemble(
        APP_ORDER,
        ROOT / "app.js",
        False,
        "/* Assembled from the js/* files listed in APP_ORDER.\n"
        "   Edit those files, then run: python tools/bundle.py */\n",
    )
    index_path = ROOT / "index.html"
    html = inline_pages(index_path.read_text(encoding="utf-8"))
    index_path.write_text(html, encoding="utf-8")
    print("inlined pages/*.html into index.html")


if __name__ == "__main__":
    bundle()
