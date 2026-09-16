from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def braces(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    d = 0
    i = 0
    n = len(t)
    in_s = None
    esc = False
    while i < n:
        c = t[i]
        if in_s:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == in_s:
                in_s = None
            i += 1
            continue
        if t.startswith("/*", i):
            j = t.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in "\"'":
            in_s = c
            i += 1
            continue
        if c == "{":
            d += 1
        elif c == "}":
            d -= 1
            if d < 0:
                print(path.name, "extra }")
                return
        i += 1
    print(path.name, "balance", d, "ok" if d == 0 else "BAD")


def main() -> None:
    for p in sorted((ROOT / "css").glob("*.css")):
        braces(p)
    ids = [
        "mapStage",
        "page-timeline",
        "page-whiteboard",
        "page-datasheet",
        "pageSwitch",
        "timelineView",
        "boardView",
        "datasheetBody",
        "boardStage",
        "timelineStage",
        "hub",
        "calPop",
        "timePop",
        "tlInfoPop",
        "dock",
        "boardInspect",
    ]
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    missing = [i for i in ids if f'id="{i}"' not in html]
    print("missing ids", missing or "none")
    print("index lines", html.count("\n") + 1)
    for name in ("orbit", "timeline", "whiteboard", "datasheet"):
        p = ROOT / "pages" / f"{name}.html"
        print(p.name, "bytes", p.stat().st_size)
    inv = (ROOT / "investigation.js").read_text(encoding="utf-8")
    for needle in ("function setPage", "function renderTimeline", "function renderWhiteboard", "function renderDatasheet", "window.OrbINTCase"):
        print(needle, needle in inv)


if __name__ == "__main__":
    main()
