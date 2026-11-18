"""Build a 1-degree camera density grid for the Operations map.

Counts only. The raw inventories stay out of the site.
"""
import base64
import csv
import gzip
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "js" / "ops-flock.js"
TSV = Path(r"C:\Users\Massi\Downloads\Flock Safety - Vulnerability Disclosure and National Security Analysis (Michael 2026)\Supporting Tools and Docs\map_workbench\ArcGIS\All_Camera_Locations\website\data\cameras.tsv")
OSM_URLS = [
    "https://data.dontgetflocked.com/cameras.geojson.gz",
    "https://data.dontgetflocked.com/cameras-canada.geojson.gz",
]
COLS = 360
ROWS = 180
COORD = re.compile(rb'"coordinates"\s*:\s*\[\s*(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s*,\s*(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)')


def cell(lat, lon):
    if lat < -90 or lat > 90 or lon < -180 or lon > 180:
        return None
    col = int((lon + 180) / 360 * COLS) % COLS
    row = int((90 - lat) / 180 * ROWS)
    if row >= ROWS:
        row = ROWS - 1
    if row < 0:
        row = 0
    return row * COLS + col


def add(grid, lat, lon):
    index = cell(lat, lon)
    if index is None:
        return False
    grid[index] += 1
    return True


def read_flock(path):
    grid = [0] * (COLS * ROWS)
    total = 0
    service = 0
    statuses = {}
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            try:
                lat = float(row.get("lat") or "")
                lon = float(row.get("lon") or "")
            except ValueError:
                continue
            if not add(grid, lat, lon):
                continue
            total += 1
            status = (row.get("status") or "").strip() or "unknown"
            statuses[status] = statuses.get(status, 0) + 1
            if status == "inService":
                service += 1
    return grid, total, service, statuses


def read_osm(url, grid):
    request = urllib.request.Request(url, headers={"User-Agent": "OrbINT flock map builder"})
    added = 0
    with urllib.request.urlopen(request, timeout=120) as response:
        raw = response.read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    for match in COORD.finditer(raw):
        lon = float(match.group(1))
        lat = float(match.group(2))
        if add(grid, lat, lon):
            added += 1
    return added


def pack(flock, osm):
    chunks = []
    cells = 0
    peak = 0
    for index, flock_count in enumerate(flock):
        osm_count = osm[index]
        if not flock_count and not osm_count:
            continue
        cells += 1
        peak = max(peak, flock_count, osm_count)
        col = index % COLS
        row = index // COLS
        chunks.append(bytes([
            (col >> 8) & 255, col & 255,
            (row >> 8) & 255, row & 255,
            (min(flock_count, 65535) >> 8) & 255, min(flock_count, 65535) & 255,
            (min(osm_count, 65535) >> 8) & 255, min(osm_count, 65535) & 255,
        ]))
    return base64.b64encode(b"".join(chunks)).decode("ascii"), cells, peak


def main():
    if not TSV.exists():
        print("missing inventory", TSV, file=sys.stderr)
        return 1
    flock, total, service, statuses = read_flock(TSV)
    osm = [0] * (COLS * ROWS)
    osm_total = 0
    osm_note = "unavailable"
    for url in OSM_URLS:
        try:
            count = read_osm(url, osm)
            osm_total += count
            osm_note = "ok"
            print("osm", url, count)
        except Exception as error:
            print("osm skip", url, error, file=sys.stderr)
    payload, cells, peak = pack(flock, osm)
    text = (
        "/* Camera density only. One-degree cells, decoded when the Cameras map opens.\n"
        "   Flock inventory coordinates: Joshua Michael, 2026 (CC BY 4.0), the public set behind flocksurveillance.org.\n"
        "   OSM ALPR coordinates: DeFlock volunteers and OpenStreetMap contributors (ODbL), via dontgetflocked.com.\n"
        "*/\n"
        "const OPS_FLOCK = {\n"
        "    cols: %d,\n"
        "    rows: %d,\n"
        "    flock: %d,\n"
        "    service: %d,\n"
        "    osm: %d,\n"
        "    cells: '%s'\n"
        "};\n"
    ) % (COLS, ROWS, total, service, osm_total, payload)
    OUT.write_text(text, encoding="utf-8")
    print("flock", total, "service", service, "statuses", statuses)
    print("osm", osm_total, osm_note, "cells", cells, "peak", peak, "bytes", OUT.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
