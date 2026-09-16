#!/usr/bin/env python3
"""Split OrbINT CSS / page HTML / investigation JS into per-page files.

Runtime still uses one index.html shell (no URL page changes). CSS is linked
as separate files. investigation.js is rebuilt by concatenating js/*.js in
original order so behavior stays the same.
"""
from __future__ import annotations

import hashlib
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE_VER = "124"


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def strip_style_indent(css: str) -> str:
    lines = css.splitlines()
    out = []
    for line in lines:
        if line.startswith("        "):
            out.append(line[8:])
        else:
            out.append(line)
    return "\n".join(out).strip() + "\n"


def parse_top_chunks(src: str) -> list[str]:
    """Split CSS or JS-ish text into top-level chunks, keeping comments."""
    chunks: list[str] = []
    i = 0
    n = len(src)
    buf_start = 0

    def skip_string(q: str, pos: int) -> int:
        pos += 1
        while pos < n:
            c = src[pos]
            if c == "\\":
                pos += 2
                continue
            if c == q:
                return pos + 1
            pos += 1
        return pos

    def skip_comment(pos: int) -> int:
        if src.startswith("//", pos):
            nl = src.find("\n", pos)
            return n if nl < 0 else nl + 1
        if src.startswith("/*", pos):
            end = src.find("*/", pos + 2)
            return n if end < 0 else end + 2
        return pos + 1

    def skip_ws_comments(pos: int) -> int:
        while pos < n:
            c = src[pos]
            if c in " \t\r\n":
                pos += 1
                continue
            if src.startswith("//", pos) or src.startswith("/*", pos):
                pos = skip_comment(pos)
                continue
            break
        return pos

    def consume_block(pos: int) -> int:
        if pos >= n or src[pos] != "{":
            return pos
        depth = 0
        while pos < n:
            c = src[pos]
            if c in ("'", '"', "`"):
                pos = skip_string(c, pos)
                continue
            if src.startswith("//", pos) or src.startswith("/*", pos):
                pos = skip_comment(pos)
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                pos += 1
                if depth == 0:
                    return pos
                continue
            pos += 1
        return pos

    while True:
        i = skip_ws_comments(i)
        if i >= n:
            tail = src[buf_start:].strip()
            if tail:
                chunks.append(src[buf_start:].rstrip() + "\n")
            break
        start = i
        # at-rule or selector / statement until ; or { }
        if src[i] == "@":
            while i < n and src[i] not in "{;":
                if src[i] in ("'", '"'):
                    i = skip_string(src[i], i)
                    continue
                if src.startswith("/*", i):
                    i = skip_comment(i)
                    continue
                i += 1
            if i < n and src[i] == "{":
                i = consume_block(i)
            elif i < n and src[i] == ";":
                i += 1
        else:
            while i < n and src[i] not in "{;":
                if src[i] in ("'", '"', "`"):
                    i = skip_string(src[i], i)
                    continue
                if src.startswith("//", i) or src.startswith("/*", i):
                    i = skip_comment(i)
                    continue
                i += 1
            if i < n and src[i] == "{":
                i = consume_block(i)
            elif i < n and src[i] == ";":
                i += 1
        chunk = src[start:i].strip()
        if chunk:
            prefix = src[buf_start:start]
            chunks.append((prefix + src[start:i]).rstrip() + "\n")
            buf_start = i
        else:
            i += 1
            buf_start = i
    return chunks


TIMELINE_RE = re.compile(
    r"page-timeline|\.tl-|#timeline|tl-island|tl-view|tl-node|tl-card|"
    r"tl-bar|tl-stage|cal-pop|#calPop|#timePop|#tlInfo|time-pop|tl-info|"
    r"\.ev-card|\.ev-date|\.ev-grid|\.ev-|\.tl-acts|data-page=\"timeline\"|"
    r"timelineIsland|timelineMenu|timelineView",
    re.I,
)
WHITEBOARD_RE = re.compile(
    r"page-whiteboard|\.board-|#board|\.wb-|board-view|board-toolbar|board-ico|"
    r"board-props|board-hint|board-empty|board-stage|board-shift|board-add|"
    r"board-more|wb-overlay|wb-geo|data-page=\"whiteboard\"|board-tool|"
    r"boardInspect|boardLinks",
    re.I,
)
DATASHEET_RE = re.compile(
    r"page-datasheet|\.ds-|#datasheet|data-page=\"datasheet\"",
    re.I,
)
ORBIT_RE = re.compile(
    r"data-page=\"orbit\"|\.map\b|#mapStage|#mapCanvas|#mapGrid|\.map-|"
    r"\.node\b|#hub\b|\.hub-|\.profile-|\.target-|\.subject-|\.fact-row|"
    r"\.platform-|\.search-menu|\.field-menu|\.media-viewer|\.peer-|"
    r"\.email-node|\.image-node|\.face-|photos-sheet|\.photos-|"
    r"\.tz-menu|#hubAdd|\.links\b|\.coverage|\.dossier|"
    r"\.phone-sheet|\.phone-card",
    re.I,
)


def classify_css(chunk: str) -> str:
    hits = []
    if TIMELINE_RE.search(chunk):
        hits.append("timeline")
    if WHITEBOARD_RE.search(chunk):
        hits.append("whiteboard")
    if DATASHEET_RE.search(chunk):
        hits.append("datasheet")
    if ORBIT_RE.search(chunk):
        hits.append("orbit")
    unique = []
    for h in hits:
        if h not in unique:
            unique.append(h)
    if len(unique) == 1:
        return unique[0]
    return "base"


def split_media_chunk(chunk: str) -> list[tuple[str, str]]:
    m = re.match(r"(@media[^{]+)\{(.*)\}\s*$", chunk.strip(), re.S)
    if not m:
        return [(classify_css(chunk), chunk)]
    prelude, inner = m.group(1).rstrip(), m.group(2)
    inner_chunks = parse_top_chunks(inner)
    if not inner_chunks:
        return [("base", chunk)]
    buckets: dict[str, list[str]] = {}
    for ic in inner_chunks:
        b = classify_css(ic)
        buckets.setdefault(b, []).append(ic.rstrip())
    if len(buckets) == 1:
        b = next(iter(buckets))
        return [(b, chunk)]
    out = []
    for b, rules in buckets.items():
        body = "\n".join("    " + line if line.strip() else line for block in rules for line in (block.splitlines() or [""]))
        # rebuild nicely
        inner_txt = "\n".join(rules)
        indented = "\n".join(("    " + ln if ln.strip() else ln) for ln in inner_txt.splitlines())
        out.append((b, f"{prelude} {{\n{indented}\n}}\n"))
    return out


def classify_js_name(name: str, text: str) -> str:
    n = name.lower()
    blob = (name + "\n" + text[:200]).lower()
    if re.search(r"datasheet|sheetfact|^ds[A-Z_]", name):
        return "datasheet"
    tl = re.search(
        r"timeline|^tl[A-Z_]|tlcard|tlevent|tlnode|calpop|calendar|timepop|"
        r"timepicker|tlinfo|tlundo|tlredo|tltip|island|numberedtimeline|"
        r"formattime|parsetime|toconnect",
        n,
    )
    wb = re.search(
        r"board|whiteboard|stroke|inkpath|laser|playbook|wb[A-Z_]|marquee|"
        r"boardpicked|boardtool",
        n,
    )
    if tl and not wb:
        return "timeline"
    if wb and not tl:
        return "whiteboard"
    if tl and wb:
        if n.startswith("tl") or "timeline" in n:
            return "timeline"
        return "whiteboard"
    if name in {
        "PAGES",
        "FLOW_PRESETS",
        "CHART_COLORS",
        "EVIDENCE_KINDS",
        "REVERSE_ENGINES",
        "DNS_TYPES",
        "DOMAIN_TOOL_LINKS",
        "EXIF_TAGS",
        "TIMES_W",
        "PAGE_ANIM_MS",
    } or n in {
        "host",
        "page",
        "pageanimtimer",
        "pageswitchready",
        "data",
        "persisttimer",
        "histquiet",
        "evidencefilter",
        "evidencequery",
        "domainbusy",
    }:
        return "core"
    if name.startswith("BOARD_") or name.startswith("board") or name.startswith("laser"):
        return "whiteboard"
    if name.startswith("TL_") or name.startswith("CAL_") or name.startswith("tl"):
        return "timeline"
    return "core"


JS_CHUNK_START = re.compile(
    r"^(    (?:async )?function ([A-Za-z_$][\w$]*)\s*\(|"
    r"    const ([A-Za-z_$][\w$]*)\s*=|"
    r"    let ([A-Za-z_$][\w$]*)\s*=|"
    r"    var ([A-Za-z_$][\w$]*)\s*=)"
)


def parse_js_chunks(body: str) -> list[tuple[int, str, str, str]]:
    """Return (order, bucket, name, text) for top-level IIFE statements."""
    lines = body.splitlines(keepends=True)
    n = len(lines)
    i = 0
    chunks: list[tuple[int, str, str, str]] = []
    order = 0

    def is_start(line: str) -> re.Match[str] | None:
        if line.startswith("    function ") or line.startswith("    async function "):
            return JS_CHUNK_START.match(line)
        if line.startswith("    const ") or line.startswith("    let ") or line.startswith("    var "):
            return JS_CHUNK_START.match(line)
        return None

    while i < n:
        raw = lines[i]
        if not raw.strip() or raw.strip().startswith("//"):
            # gather leading blank/comment into next chunk
            j = i
            lead = []
            while j < n and (not lines[j].strip() or lines[j].strip().startswith("//") or lines[j].strip().startswith("/*")):
                lead.append(lines[j])
                if lines[j].strip().startswith("/*") and "*/" not in lines[j]:
                    j += 1
                    while j < n:
                        lead.append(lines[j])
                        if "*/" in lines[j]:
                            break
                        j += 1
                j += 1
            i = j
            if i >= n:
                if lead:
                    chunks.append((order, "core", "_tail", "".join(lead)))
                    order += 1
                break
            start_line = i
            m = is_start(lines[i])
            name = "_block"
            if m:
                name = m.group(2) or m.group(3) or m.group(4) or m.group(5) or "_block"
            end = consume_js_statement(lines, i)
            text = "".join(lead) + "".join(lines[start_line:end])
            bucket = classify_js_name(name, text)
            chunks.append((order, bucket, name, text))
            order += 1
            i = end
            continue
        m = is_start(raw)
        name = "_block"
        if m:
            name = m.group(2) or m.group(3) or m.group(4) or m.group(5) or "_block"
        end = consume_js_statement(lines, i)
        text = "".join(lines[i:end])
        bucket = classify_js_name(name, text)
        chunks.append((order, bucket, name, text))
        order += 1
        i = end
    return chunks


def consume_js_statement(lines: list[str], start: int) -> int:
    i = start
    n = len(lines)
    depth = 0
    started = False
    in_s: str | None = None
    escape = False
    in_line_comment = False
    in_block_comment = False
    while i < n:
        line = lines[i]
        j = 0
        while j < len(line):
            c = line[j]
            nxt = line[j + 1] if j + 1 < len(line) else ""
            if in_line_comment:
                break
            if in_block_comment:
                if c == "*" and nxt == "/":
                    in_block_comment = False
                    j += 2
                    continue
                j += 1
                continue
            if in_s:
                if escape:
                    escape = False
                elif c == "\\":
                    escape = True
                elif c == in_s:
                    in_s = None
                j += 1
                continue
            if c == "/" and nxt == "/":
                in_line_comment = True
                break
            if c == "/" and nxt == "*":
                in_block_comment = True
                j += 2
                continue
            if c in ("'", '"', "`"):
                in_s = c
                j += 1
                continue
            if c == "{":
                depth += 1
                started = True
            elif c == "}":
                depth -= 1
            elif c == ";" and depth == 0:
                return i + 1
            j += 1
        in_line_comment = False
        i += 1
        if started and depth <= 0:
            # function / object finished; skip optional semicolon on same or next
            if i < n and lines[i].strip() == ";":
                i += 1
            return i
    return n


def extract_section(html: str, start_marker: str, end_marker: str) -> str:
    a = html.find(start_marker)
    if a < 0:
        raise SystemExit(f"missing {start_marker}")
    b = html.find(end_marker, a)
    if b < 0:
        raise SystemExit(f"missing {end_marker}")
    return html[a:b + len(end_marker)]


def main() -> None:
    index_path = ROOT / "index.html"
    html = index_path.read_text(encoding="utf-8")
    if '<link rel="stylesheet" href="css/base.css' in html:
        raise SystemExit("CSS already split. Edit css/*.css and js/*.js, then run: python tools/bundle.py")
    style_m = re.search(r"    <style>\n(.*?)\n    </style>", html, re.S)
    if not style_m:
        raise SystemExit("no <style> block")
    raw_css = style_m.group(1)
    css = strip_style_indent(raw_css)

    wipe = "html[data-orbint-wipe] body { visibility: hidden !important; }\n"
    css_wo_wipe = css
    if css_wo_wipe.startswith("html[data-orbint-wipe]"):
        first_nl = css_wo_wipe.find("\n")
        css_wo_wipe = css_wo_wipe[first_nl + 1 :].lstrip("\n")

    css_chunks = parse_top_chunks(css_wo_wipe)
    buckets = {k: [] for k in ("base", "orbit", "timeline", "whiteboard", "datasheet")}
    for ch in css_chunks:
        if ch.strip().startswith("@media"):
            parts = split_media_chunk(ch)
        else:
            parts = [(classify_css(ch), ch)]
        for b, text in parts:
            buckets[b].append(text if text.endswith("\n") else text + "\n")

    css_dir = ROOT / "css"
    css_dir.mkdir(exist_ok=True)
    headers = {
        "base": "/* OrbINT shared chrome, tokens, dock, sheets */\n",
        "orbit": "/* OrbINT map / casebook */\n",
        "timeline": "/* Timeline page */\n",
        "whiteboard": "/* Whiteboard page */\n",
        "datasheet": "/* Datasheet page */\n",
    }
    for name, parts in buckets.items():
        (css_dir / f"{name}.css").write_text(headers[name] + "\n" + "\n".join(parts).rstrip() + "\n", encoding="utf-8")
        print(f"css/{name}.css  {len(parts)} rules  {(css_dir / f'{name}.css').stat().st_size} bytes")

    pages_dir = ROOT / "pages"
    pages_dir.mkdir(exist_ok=True)
    orbit = extract_section(html, '    <main class="map" id="mapStage">', "    </main>")
    timeline = extract_section(html, '    <section class="work-page page-timeline"', "    </section>")
    # first section after timeline is whiteboard
    wb_start = html.find('    <section class="work-page page-whiteboard"')
    wb_end = html.find("    </section>", wb_start)
    whiteboard = html[wb_start : wb_end + len("    </section>")]
    ds_start = html.find('    <section class="work-page page-datasheet"')
    ds_end = html.find("    </section>", ds_start)
    datasheet = html[ds_start : ds_end + len("    </section>")]

    (pages_dir / "orbit.html").write_text(orbit + "\n", encoding="utf-8")
    (pages_dir / "timeline.html").write_text(timeline + "\n", encoding="utf-8")
    (pages_dir / "whiteboard.html").write_text(whiteboard + "\n", encoding="utf-8")
    (pages_dir / "datasheet.html").write_text(datasheet + "\n", encoding="utf-8")
    print("wrote pages/*.html")

    inv_path = ROOT / "investigation.js"
    inv = inv_path.read_text(encoding="utf-8")
    if not inv.startswith("(function ()"):
        raise SystemExit("unexpected investigation.js wrapper")
    inner_start = inv.find("'use strict';")
    inner_end = inv.rfind("})();")
    body = inv[inner_start + len("'use strict';") : inner_end]
    if body.startswith("\n"):
        body = body[1:]

    js_chunks = parse_js_chunks(body)
    js_dir = ROOT / "js"
    js_dir.mkdir(exist_ok=True)
    js_buckets = {k: [] for k in ("core", "timeline", "whiteboard", "datasheet")}
    for order, bucket, name, text in js_chunks:
        js_buckets[bucket].append((order, name, text))

    rebuilt_parts = [c[3] for c in js_chunks]
    rebuilt_body = "".join(rebuilt_parts)
    if rebuilt_body.replace("\r\n", "\n") != body.replace("\r\n", "\n"):
        # keep going but warn
        print("WARN js chunk rebuild differs from original body")
        print("  orig", len(body), "rebuilt", len(rebuilt_body))
        # write debug
        (ROOT / "tools" / "_body_orig.js").write_text(body, encoding="utf-8")
        (ROOT / "tools" / "_body_rebuilt.js").write_text(rebuilt_body, encoding="utf-8")
    else:
        print("js chunks round-trip OK", len(js_chunks), "chunks")

    file_headers = {
        "core": "/* Shared investigation state, page switch, persist, toolkit, PDF */\n",
        "timeline": "/* Timeline page */\n",
        "whiteboard": "/* Whiteboard page */\n",
        "datasheet": "/* Datasheet page */\n",
    }
    for name, items in js_buckets.items():
        items_sorted = sorted(items, key=lambda x: x[0])
        bits = []
        for order, ident, text in items_sorted:
            bits.append(f"    /* @ord:{order:04d} {ident} */\n")
            bits.append(text if text.endswith("\n") else text + "\n")
        (js_dir / f"{name}.js").write_text(file_headers[name] + "\n" + "".join(bits), encoding="utf-8")
        print(f"js/{name}.js  {len(items)} chunks  {(js_dir / f'{name}.js').stat().st_size} bytes")

    # Rewrite index.html: drop big style, link CSS, bump cache, keep HTML
    links = "\n".join(
        [
            f'    <link rel="stylesheet" href="css/base.css?v={CACHE_VER}">',
            f'    <link rel="stylesheet" href="css/orbit.css?v={CACHE_VER}">',
            f'    <link rel="stylesheet" href="css/timeline.css?v={CACHE_VER}">',
            f'    <link rel="stylesheet" href="css/whiteboard.css?v={CACHE_VER}">',
            f'    <link rel="stylesheet" href="css/datasheet.css?v={CACHE_VER}">',
        ]
    )
    new_style = (
        "    <style>\n"
        "        html[data-orbint-wipe] body { visibility: hidden !important; }\n"
        "    </style>\n"
        + links
        + "\n"
    )
    html2 = html[: style_m.start()] + new_style + html[style_m.end() :]
    html2 = html2.replace("?v=123", f"?v={CACHE_VER}")
    html2 = html2.replace(
        '    <script src="osint-tools.js',
        '    <script src="js/core.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/timeline.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/whiteboard.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/datasheet.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/boot.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="osint-tools.js',
    )
    # We still need investigation.js OR a boot that wraps IIFE — do not load loose js files
    # Revert script injection; keep investigation.js as the runtime bundle.
    html2 = html2.replace(
        '    <script src="js/core.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/timeline.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/whiteboard.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/datasheet.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="js/boot.js?v=' + CACHE_VER + '" defer></script>\n'
        '    <script src="osint-tools.js',
        '    <script src="osint-tools.js',
    )
    html2 = html2.replace(
        '    <main class="map" id="mapStage">',
        '    <!-- pages/orbit.html -->\n    <main class="map" id="mapStage">',
    )
    html2 = html2.replace(
        '    <section class="work-page page-timeline"',
        '    <!-- pages/timeline.html -->\n    <section class="work-page page-timeline"',
    )
    html2 = html2.replace(
        '    <section class="work-page page-whiteboard"',
        '    <!-- pages/whiteboard.html -->\n    <section class="work-page page-whiteboard"',
    )
    html2 = html2.replace(
        '    <section class="work-page page-datasheet"',
        '    <!-- pages/datasheet.html -->\n    <section class="work-page page-datasheet"',
    )
    index_path.write_text(html2, encoding="utf-8")
    print("index.html", index_path.stat().st_size, "bytes")

    # Keep investigation.js as-is except we will later optionally rebuild
    print("investigation.js left intact (source parts in js/)")


if __name__ == "__main__":
    main()
