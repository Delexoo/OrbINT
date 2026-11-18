"""Pack exact camera coordinates for the Operations map.

Each point is stored as little-endian int32 latitude and longitude in microdegrees.
The map plots those values directly. It does not snap them to a grid.
"""
import csv
import gzip
import re
import struct
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_BIN = ROOT / "data" / "cameras.bin"
OUT_JS = ROOT / "js" / "ops-flock.js"
TSV = Path(r"C:\Users\Massi\Downloads\Flock Safety - Vulnerability Disclosure and National Security Analysis (Michael 2026)\Supporting Tools and Docs\map_workbench\ArcGIS\All_Camera_Locations\website\data\cameras.tsv")
OSM_URLS = [
    "https://data.dontgetflocked.com/cameras.geojson.gz",
    "https://data.dontgetflocked.com/cameras-canada.geojson.gz",
]
COORD = re.compile(rb'"coordinates"\s*:\s*\[\s*(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s*,\s*(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)')


def micro(value):
    scaled = int(round(float(value) * 1000000))
    if scaled < -2147483648 or scaled > 2147483647:
        return None
    return scaled


def keep(lat, lon):
    lat_i = micro(lat)
    lon_i = micro(lon)
    if lat_i is None or lon_i is None:
        return None
    if lat_i < -90000000 or lat_i > 90000000 or lon_i < -180000000 or lon_i > 180000000:
        return None
    return lat_i, lon_i


def read_flock(path):
    points = bytearray()
    total = 0
    service = 0
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            try:
                pair = keep(row.get("lat") or "", row.get("lon") or "")
            except ValueError:
                continue
            if not pair:
                continue
            points += struct.pack("<ii", pair[0], pair[1])
            total += 1
            if (row.get("status") or "").strip() == "inService":
                service += 1
    return points, total, service


def read_osm(url):
    request = urllib.request.Request(url, headers={"User-Agent": "OrbINT camera map"})
    with urllib.request.urlopen(request, timeout=180) as response:
        raw = response.read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    points = bytearray()
    total = 0
    for match in COORD.finditer(raw):
        try:
            pair = keep(match.group(2), match.group(1))
        except ValueError:
            continue
        if not pair:
            continue
        points += struct.pack("<ii", pair[0], pair[1])
        total += 1
    return points, total


def main():
    if not TSV.exists():
        print("missing inventory", TSV, file=sys.stderr)
        return 1
    flock, total, service = read_flock(TSV)
    osm = bytearray()
    osm_total = 0
    for url in OSM_URLS:
        try:
            chunk, count = read_osm(url)
        except Exception as error:
            print("osm skip", url, error, file=sys.stderr)
            continue
        osm += chunk
        osm_total += count
        print("osm", url, count)
    OUT_BIN.parent.mkdir(parents=True, exist_ok=True)
    header = struct.pack("<4sII", b"ORB1", total, osm_total)
    OUT_BIN.write_bytes(header + flock + osm)
    OUT_JS.write_text(
        "/* Exact camera coordinates live in data/cameras.bin.\n"
        "   Flock inventory: Joshua Michael, 2026 (CC BY 4.0), the public set behind flocksurveillance.org.\n"
        "   OSM ALPR: DeFlock volunteers and OpenStreetMap contributors (ODbL), via dontgetflocked.com.\n"
        "*/\n"
        "const OPS_FLOCK = {\n"
        "    file: 'data/cameras.bin',\n"
        "    flock: %d,\n"
        "    service: %d,\n"
        "    osm: %d\n"
        "};\n" % (total, service, osm_total),
        encoding="utf-8",
    )
    print("flock", total, "service", service, "osm", osm_total, "bin", OUT_BIN.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
