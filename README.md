<div align="center">

<img src="icons/app-512.png" width="96" height="96" alt="OrbINT">

# OrbINT

**Open-source Reconnaissance Bureau of Intelligence**

A local desk for collecting, organizing, and managing open-source reconnaissance.

[Open OrbINT](https://orbint.net/)

<img src="media/orbint.webp" alt="OrbINT in use" width="400" height="252">

</div>

## What it is

OrbINT is case and investigative management software for publicly available information. One subject sits at the center of a case: a dossier of facts, a chronology, a whiteboard, and a printable record.

It runs entirely in the browser. There is no account, no remote database, and no upload. Cases stay on this device.

## What it has

- **Orbit** — the subject at the hub, with fields for identity, contact, place, vehicles, infrastructure, and media
- **Timeline** — a pan-and-zoom chronology of dated events
- **Whiteboard** — sketches, sticky notes, and diagrams for the same case
- **Harvester** — drop a file or write one; keep names, dates, accounts, passwords, times, age, and other key data
- **Case File** — a letter-style PDF of the particulars
- **Toolkit** — searches that open from a filed value

## How it works

1. Open the [live app](https://orbint.net/), or clone this repository and open `index.html`.
2. Name the subject in the hub.
3. Click a field, enter a value, and use the magnifying glass to search from it.
4. Keep a timeline and a whiteboard as the case develops.
5. Export JSON, or generate the case file, when you need a copy off the desk.

Cases are stored in this browser. Clear site data and they are gone.

Export JSON downloads the case. Upload JSON on the profile rail restores that file. The browser does not keep an automatic backup.

```bash
git clone https://github.com/Delexoo/OrbINT.git
```

## Project map

- `index.html` is the assembled desk. `python tools/bundle.py` rebuilds it from the pieces below.
- `pages/` holds the desk markup.
- `js/` holds the behavior. The bundler writes `investigation.js` and `app.js`.
- `css/` holds the appearance.
- `tools/` holds the bundler, the share relay (`tools/share-server.py`), and `node tools/test_harvester.js`.

## DNS

There is no DNS zone in this repository. At the host that serves `orbint.net`, review the records that point the name at GitHub Pages and delete any record that still points at a host you removed.

## Host headers

GitHub Pages does not send these from a file in the repository. A proxy in front of Pages can:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-src 'self' https:; worker-src 'self' blob:; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
```

`frame-ancestors` and `nosniff` cannot be set from HTML. The public pages send a referrer meta tag of `strict-origin-when-cross-origin`.
