#!/usr/bin/env python3
"""Trim dead Analytics/Evidence code and split oversized JS modules."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, text: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print(f"wrote {rel}  {path.stat().st_size} bytes")


def slice_named(src: str, start: str, end: str | None) -> tuple[str, str, str]:
    a = src.find(start)
    if a < 0:
        raise SystemExit(f"missing start {start[:40]!r}")
    if end is None:
        return src[:a], src[a:], ""
    b = src.find(end, a + 1)
    if b < 0:
        raise SystemExit(f"missing end {end[:40]!r}")
    return src[:a], src[a:b], src[b:]


def main() -> None:
    if (ROOT / "js" / "intel.js").exists() and (ROOT / "js" / "orbit-fields.js").exists():
        raise SystemExit("Already trimmed. Edit js/*.js and pages/*.html, then run: python tools/bundle.py")
    tl = read("js/timeline.js")
    before, dead, after = slice_named(tl, "    function collectedStats()", "    function syncBoardToolThumb(")
    if "function renderAnalytics" not in dead or "function renderEvidence" not in dead:
        raise SystemExit("timeline dead-code slice looks wrong")
    board_helpers, rest = after, ""
    # after starts at syncBoardToolThumb; split before renderWhiteboard lives in whiteboard.js
    hint_end = board_helpers.find("    function renderWhiteboard(")
    if hint_end >= 0:
        raise SystemExit("renderWhiteboard unexpectedly in timeline.js")
    # Keep board helpers (syncBoardToolThumb through boardHintText) for whiteboard.js
    write("js/timeline.js", before.rstrip() + "\n")

    wb = read("js/whiteboard.js")
    if wb.startswith("/*"):
        nl = wb.find("\n")
        body = wb[nl + 1 :].lstrip("\n")
    else:
        body = wb
    a = body.find("    function openDomainIntel(")
    b = body.find("    function pdfClean(")
    c = body.find("    function applyBoardTransform(")
    if min(a, b, c) < 0 or not (a < b < c):
        raise SystemExit("whiteboard split points missing")
    pre, intel_body, report, wb_tail = body[:a], body[a:b], body[b:c], body[c:]
    if "function injectToolkit" not in intel_body or "function downloadReport" not in report:
        raise SystemExit("intel/report slice looks wrong")

    write(
        "js/whiteboard.js",
        "/* Whiteboard page */\n\n" + board_helpers.rstrip() + "\n\n" + pre.lstrip("\n").rstrip() + "\n\n" + wb_tail.lstrip("\n"),
    )
    write("js/intel.js", "/* Domain intel, toolkit inject, photo EXIF */\n\n" + intel_body.rstrip() + "\n")
    write("js/report.js", "/* PDF report (no OrbINT branding in the file) */\n\n" + report.rstrip() + "\n")

    core = read("js/core.js")
    core = re.sub(
        r"\n    const CHART_COLORS = \[[^\]]+\];\n",
        "\n",
        core,
        count=1,
    )
    core = re.sub(
        r"\n    const EVIDENCE_KINDS = \[\n(?:.*\n)*?    \];\n",
        "\n",
        core,
        count=1,
    )
    core = core.replace("    let evidenceFilter = 'all';\n    let evidenceQuery = '';\n", "")
    write("js/core.js", core)

    css = read("css/base.css")
    css = re.sub(r"\n\.an-kpis \{.*?\n#evidenceFilters \{ display: flex; flex-wrap: wrap; gap: 6px; \}\n\n\n#evidenceFilters \{ display: flex; flex-wrap: wrap; gap: 6px; \}\n", "\n", css, count=1, flags=re.S)
    css = css.replace("        .an-grid, .an-chart-row { grid-template-columns: 1fr; }\n\n", "")
    css = css.replace("        .an-grid { grid-template-columns: 1fr; }\n\n", "")
    write("css/base.css", css)

    app = read("app.js")
    if not app.lstrip().startswith("const GROUPS"):
        # keep leading whitespace; first non-empty should be GROUPS
        pass
    s1 = app.find("        function platformSearch(label) {")
    s2 = app.find("        function renderProfileRail() {")
    s3 = app.find("        function createNodes() {")
    if min(s1, s2, s3) < 0:
        raise SystemExit("app.js split points missing")
    write("js/orbit-settings.js", "/* OrbINT settings, logic bomb, stealth */\n\n" + app[:s1].rstrip() + "\n")
    write("js/orbit-fields.js", "/* OrbINT fields, platforms, toolkit, search */\n\n" + app[s1:s2].rstrip() + "\n")
    write("js/orbit-library.js", "/* OrbINT casebook / profile library */\n\n" + app[s2:s3].rstrip() + "\n")
    write("js/orbit-map.js", "/* OrbINT map, dock, boot */\n\n" + app[s3:].rstrip() + "\n")

    pointer = ROOT / "js" / "orbit.js"
    if pointer.exists() and pointer.stat().st_size < 500:
        pointer.unlink()
        print("removed js/orbit.js pointer")


if __name__ == "__main__":
    main()
