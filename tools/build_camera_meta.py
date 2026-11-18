"""Camera hover details.

Flock rows follow the same order as data/cameras.bin, so a hit index can
read this file directly. map.osm is one intersection, not the national set.
Its surveillance nodes supply id, maker, and zone for cameras in that box.
"""
import csv
import json
import struct
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BIN = ROOT / "data" / "cameras.bin"
META = ROOT / "data" / "cameras-flock.meta"
OSM_JSON = ROOT / "data" / "cameras-osm.json"
OSM_XML = ROOT / "data" / "map.osm"
TSV = Path(r"C:\Users\Massi\Downloads\Flock Safety - Vulnerability Disclosure and National Security Analysis (Michael 2026)\Supporting Tools and Docs\map_workbench\ArcGIS\All_Camera_Locations\website\data\cameras.tsv")


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
    rows = []
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            try:
                pair = keep(row.get("lat") or "", row.get("lon") or "")
            except ValueError:
                continue
            if not pair:
                continue
            angle = row.get("rotationAngle") or ""
            try:
                angle10 = int(round(float(angle) * 10)) if angle.strip() else -32768
            except ValueError:
                angle10 = -32768
            if angle10 < -32768 or angle10 > 32767:
                angle10 = -32768
            kind = (row.get("type") or "").strip()[:40]
            name = (row.get("name") or "").strip()[:180]
            try:
                object_id = int(float(row.get("OBJECTID") or "0"))
            except ValueError:
                object_id = 0
            if object_id < 0 or object_id > 0xFFFFFFFF:
                object_id = 0
            flags = 1 if (row.get("status") or "").strip() == "inService" else 0
            rows.append((object_id, angle10, flags, kind.encode("utf-8"), name.encode("utf-8"), pair))
    return rows


def read_osm(path):
    cameras = []
    for node in ET.parse(path).getroot().findall("node"):
        tags = {tag.get("k"): tag.get("v") or "" for tag in node.findall("tag")}
        if tags.get("man_made") != "surveillance" and "surveillance:type" not in tags:
            continue
        try:
            lat = float(node.get("lat"))
            lon = float(node.get("lon"))
            node_id = int(node.get("id"))
        except (TypeError, ValueError):
            continue
        direction = tags.get("direction") or ""
        try:
            facing = int(round(float(direction))) if direction else None
        except ValueError:
            facing = None
        cameras.append({
            "id": node_id,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "maker": tags.get("manufacturer") or "",
            "zone": tags.get("surveillance:zone") or "",
            "kind": tags.get("surveillance:type") or "ALPR",
            "facing": facing,
        })
    return cameras


def main():
    if not TSV.exists():
        print("missing inventory", TSV, file=sys.stderr)
        return 1
    if not BIN.exists():
        print("missing", BIN, file=sys.stderr)
        return 1
    header = BIN.read_bytes()[:12]
    magic, flock_count, osm_count = struct.unpack("<4sII", header)
    if magic != b"ORB1":
        print("bad camera file", file=sys.stderr)
        return 1
    rows = read_flock(TSV)
    if len(rows) != flock_count:
        print("flock count", len(rows), "bin", flock_count, file=sys.stderr)
        return 1
    view = BIN.read_bytes()
    for index in (0, 1, len(rows) - 1):
        at = 12 + index * 8
        lat_i, lon_i = struct.unpack_from("<ii", view, at)
        if (lat_i, lon_i) != rows[index][5]:
            print("order mismatch at", index, file=sys.stderr)
            return 1
    offsets = []
    blob = bytearray()
    for object_id, angle10, flags, kind, name, _pair in rows:
        offsets.append(len(blob))
        blob += struct.pack("<IhBBH", object_id & 0xFFFFFFFF, angle10, flags, len(kind), len(name))
        blob += kind
        blob += name
    META.write_bytes(struct.pack("<4sI", b"ORBM", len(rows)) + struct.pack("<%dI" % len(rows), *offsets) + blob)
    cameras = read_osm(OSM_XML)
    OSM_JSON.write_text(json.dumps(cameras, separators=(",", ":")), encoding="utf-8")
    print("flock", len(rows), "osm nodes", len(cameras), "meta", META.stat().st_size, "osm file", osm_count)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
