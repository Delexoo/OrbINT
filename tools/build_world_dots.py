"""Build a dotted land mask and country points for the operations globe."""
import base64
import csv
import json
import urllib.request

LAND_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json"
COUNTRY_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
ISO_URL = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv"
COLS = 180
ROWS = 90


def load(url):
    with urllib.request.urlopen(url, timeout=60) as res:
        return res.read()


def decode_arcs(topo):
    scale = topo["transform"]["scale"]
    translate = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * scale[0] + translate[0], y * scale[1] + translate[1]))
        arcs.append(pts)
    return arcs


def stitch(indexes, arcs):
    pts = []
    for idx in indexes:
        arc = arcs[idx] if idx >= 0 else list(reversed(arcs[~idx]))
        if pts:
            arc = arc[1:]
        pts.extend(arc)
    return pts


def geometry_rings(geometry, arcs):
    kind = geometry["type"]
    raw = geometry["arcs"]
    polygons = raw if kind == "MultiPolygon" else [raw]
    rings = []
    for poly in polygons:
        for ring in poly:
            pts = stitch(ring, arcs)
            if len(pts) >= 2:
                rings.append(pts)
    return rings


def land_mask(topo):
    arcs = decode_arcs(topo)
    rings = []
    for geometry in topo["objects"]["land"]["geometries"]:
        rings.extend(geometry_rings(geometry, arcs))
    bits = bytearray((COLS * ROWS + 7) // 8)
    for row in range(ROWS):
        lat = 90 - (row + 0.5) * (180 / ROWS)
        crossings = []
        for ring in rings:
            for i in range(len(ring) - 1):
                x1, y1 = ring[i]
                x2, y2 = ring[i + 1]
                if abs(x2 - x1) > 180:
                    continue
                if (y1 > lat) == (y2 > lat):
                    continue
                crossings.append(x1 + (lat - y1) * (x2 - x1) / (y2 - y1))
        crossings.sort()
        cursor = 0
        for col in range(COLS):
            lon = -180 + (col + 0.5) * (360 / COLS)
            while cursor < len(crossings) and crossings[cursor] <= lon:
                cursor += 1
            if cursor % 2 == 1:
                index = row * COLS + col
                bits[index // 8] |= 1 << (index % 8)
    return bits


def country_mask(topo, numeric_to_a2):
    arcs = decode_arcs(topo)
    codes = [""]
    index = {}
    grid = bytearray(COLS * ROWS)
    for geometry in topo["objects"]["countries"]["geometries"]:
        code = numeric_to_a2.get(str(geometry.get("id") or ""))
        if not code or len(codes) >= 255 and code not in index:
            continue
        if code not in index:
            index[code] = len(codes)
            codes.append(code)
        cid = index[code]
        rings = geometry_rings(geometry, arcs)
        for row in range(ROWS):
            lat = 90 - (row + 0.5) * (180 / ROWS)
            crossings = []
            for ring in rings:
                for i in range(len(ring) - 1):
                    x1, y1 = ring[i]
                    x2, y2 = ring[i + 1]
                    if abs(x2 - x1) > 180:
                        continue
                    if (y1 > lat) == (y2 > lat):
                        continue
                    crossings.append(x1 + (lat - y1) * (x2 - x1) / (y2 - y1))
            crossings.sort()
            cursor = 0
            for col in range(COLS):
                lon = -180 + (col + 0.5) * (360 / COLS)
                while cursor < len(crossings) and crossings[cursor] <= lon:
                    cursor += 1
                if cursor % 2 == 1:
                    grid[row * COLS + col] = cid
    return grid, codes


def country_points(topo, numeric_to_a2):
    arcs = decode_arcs(topo)
    places = {}
    for geometry in topo["objects"]["countries"]["geometries"]:
        code = numeric_to_a2.get(str(geometry.get("id") or ""))
        if not code:
            continue
        rings = geometry_rings(geometry, arcs)
        if not rings:
            continue
        ring = max(rings, key=len)
        lons = [p[0] for p in ring]
        if max(lons) - min(lons) > 180:
            lons = [x + 360 if x < 0 else x for x in lons]
        lon = sum(lons) / len(lons)
        if lon > 180:
            lon -= 360
        lat = sum(p[1] for p in ring) / len(ring)
        places[code] = [round(lon, 2), round(lat, 2)]
    return places


def main():
    land = json.loads(load(LAND_URL))
    countries = json.loads(load(COUNTRY_URL))
    iso = csv.DictReader(load(ISO_URL).decode("utf-8").splitlines())
    numeric_to_a2 = {}
    for row in iso:
        numeric_to_a2[str(int(row["country-code"])).zfill(3)] = row["alpha-2"]
    mask = land_mask(land)
    places = country_points(countries, numeric_to_a2)
    grid, codes = country_mask(countries, numeric_to_a2)
    encoded = base64.b64encode(mask).decode("ascii")
    country_bits = base64.b64encode(grid).decode("ascii")
    body = (
        "/* Dotted land mask and country points. Generated by tools/build_world_dots.py */\n"
        "const OPS_LAND = { cols: %d, rows: %d, bits: '%s' };\n"
        "const OPS_PLACES = %s;\n"
        "const OPS_COUNTRY = { cols: %d, rows: %d, codes: %s, bits: '%s' };\n"
        % (
            COLS,
            ROWS,
            encoded,
            json.dumps(places, separators=(",", ":")),
            COLS,
            ROWS,
            json.dumps(codes, separators=(",", ":")),
            country_bits,
        )
    )
    with open("js/ops-world.js", "w", encoding="utf-8", newline="\n") as handle:
        handle.write(body)
    print("places", len(places), "bytes", len(body), "land cells", bin(int.from_bytes(mask, "little")).count("1"))


if __name__ == "__main__":
    main()
