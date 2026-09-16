/* Domain intel, toolkit inject, photo EXIF */

    function openDomainIntel(seed) {
        const hostValue = hostName(seed || data.intel.host || firstValue('domain'));
        const input = $('intelHost');
        if (input) input.value = hostValue;
        data.intel.host = hostValue;
        showSheet($('intelSheet'));
        if (hostValue) runDomainIntel(hostValue);
        else {
            const out = $('intelResults');
            if (out) out.innerHTML = '<p class="muted">Enter a domain such as example.com</p>';
        }
    }

    function dnsQuery(name, type) {
        return fetch('https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + encodeURIComponent(type))
            .then(function (res) { return res.json(); })
            .then(function (json) {
                return (json.Answer || []).map(function (row) {
                    return { type: type, data: row.data, ttl: row.TTL };
                });
            })
            .catch(function () { return []; });
    }

    function runDomainIntel(name) {
        const hostValue = hostName(name);
        const out = $('intelResults');
        if (!hostValue || !out) return;
        if (domainBusy) return;
        domainBusy = true;
        data.intel.host = hostValue;
        schedulePersist();
        out.innerHTML = '<p class="muted">Looking up ' + esc(hostValue) + '…</p>';
        const links = DOMAIN_TOOL_LINKS.map(function (pair) {
            const href = pair[1].indexOf('dnsdumpster') >= 0 || pair[1].indexOf('urlscan.io/search') >= 0
                ? pair[1]
                : pair[1] + encodeURIComponent(hostValue);
            return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(pair[0]) + '</a>';
        }).join('');

        const dnsJobs = DNS_TYPES.map(function (type) { return dnsQuery(hostValue, type); });
        const rdap = fetch('https://rdap.org/domain/' + encodeURIComponent(hostValue))
            .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
            .catch(function () {
                return fetch('https://rdap.verisign.com/com/v1/domain/' + encodeURIComponent(hostValue))
                    .then(function (res) { return res.ok ? res.json() : Promise.reject(); });
            })
            .catch(function () { return null; });
        const certs = fetch('https://crt.sh/?q=' + encodeURIComponent(hostValue) + '&output=json')
            .then(function (res) { return res.ok ? res.json() : []; })
            .catch(function () { return []; });
        const wayback = fetch('https://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(hostValue) + '/*&output=json&fl=timestamp,original,statuscode,mimetype&filter=statuscode:200&collapse=digest&limit=40')
            .then(function (res) { return res.ok ? res.json() : []; })
            .catch(function () { return []; });

        Promise.all([Promise.all(dnsJobs), rdap, certs, wayback]).then(function (parts) {
            domainBusy = false;
            const dns = parts[0].reduce(function (all, rows) { return all.concat(rows); }, []);
            const whois = parts[1];
            const ct = Array.isArray(parts[2]) ? parts[2] : [];
            const wb = Array.isArray(parts[3]) ? parts[3] : [];
            const names = {};
            ct.forEach(function (row) {
                String(row.name_value || row.common_name || '').split(/\s+/).forEach(function (name) {
                    const clean = name.replace(/^\*\./, '').trim().toLowerCase();
                    if (clean) names[clean] = true;
                });
            });
            const subdomains = Object.keys(names).filter(function (n) { return n === hostValue || n.slice(-hostValue.length - 1) === '.' + hostValue; }).sort();
            const events = whois && whois.events ? whois.events : [];
            const ns = whois && whois.nameservers ? whois.nameservers.map(function (n) { return n.ldhName || n; }) : [];
            const txt = dns.filter(function (r) { return r.type === 'TXT'; }).map(function (r) { return r.data; });
            const tech = fingerprintFrom(dns, txt, ns);
            const wbRows = wb.slice(1, 31);
            out.innerHTML =
                '<div class="intel-links">' + links + '</div>' +
                sectionBlock('DNS', dns.length ? '<table class="an-table"><thead><tr><th>Type</th><th>Data</th><th>TTL</th></tr></thead><tbody>' +
                    dns.map(function (r) { return '<tr><td>' + esc(r.type) + '</td><td>' + esc(r.data) + '</td><td>' + esc(r.ttl) + '</td></tr>'; }).join('') +
                    '</tbody></table>' : '<p class="muted">No DNS answers (blocked or NXDOMAIN).</p>') +
                sectionBlock('WHOIS / RDAP', whois ? '<dl class="intel-dl">' +
                    rowDl('Handle', whois.handle || whois.ldhName) +
                    rowDl('Registrar', rdapRegistrar(whois)) +
                    rowDl('Status', (whois.status || []).join(', ')) +
                    rowDl('Nameservers', ns.join(', ')) +
                    events.map(function (ev) { return rowDl(ev.eventAction, ev.eventDate); }).join('') +
                    '</dl>' : '<p class="muted">RDAP was blocked by CORS or the TLD has no public endpoint. Use WHOIS / RDAP links above.</p>') +
                sectionBlock('Certificates', ct.length ? '<p class="muted">' + ct.length + ' transparency rows. Unique names:</p><ul class="an-chips">' +
                    subdomains.slice(0, 80).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' :
                    '<p class="muted">crt.sh did not return JSON in this browser. Open crt.sh from the links.</p>') +
                sectionBlock('Subdomains (from CT)', subdomains.length ? '<ul class="an-chips">' + subdomains.slice(0, 60).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None parsed from certificates.</p>') +
                sectionBlock('Historical URLs', wbRows.length ? '<table class="an-table"><thead><tr><th>Captured</th><th>URL</th><th>Type</th></tr></thead><tbody>' +
                    wbRows.map(function (row) {
                        const ts = String(row[0] || '');
                        const when = ts.length >= 8 ? ts.slice(0, 4) + '-' + ts.slice(4, 6) + '-' + ts.slice(6, 8) : ts;
                        return '<tr><td>' + esc(when) + '</td><td><a href="https://web.archive.org/web/' + esc(ts) + '/' + esc(row[1] || '') + '" target="_blank" rel="noopener noreferrer">' + esc(row[1] || '') + '</a></td><td>' + esc(row[3] || '') + '</td></tr>';
                    }).join('') + '</tbody></table>' : '<p class="muted">No Wayback CDX rows. Open Wayback from the links if the API is blocked.</p>') +
                sectionBlock('Technology fingerprints', tech.length ? '<ul class="an-chips">' + tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul><p class="muted">Clues from DNS TXT, MX, and nameservers. Confirm on BuiltWith / Wappalyzer / urlscan.</p>' :
                    '<p class="muted">No stack clues in DNS. Use BuiltWith, Wappalyzer, or urlscan.</p>');
        }).catch(function () {
            domainBusy = false;
            out.innerHTML = '<div class="intel-links">' + links + '</div><p class="muted">Live lookup failed. Use the catalog links.</p>';
        });
    }

    function sectionBlock(title, html) {
        return '<section class="intel-block"><h3>' + esc(title) + '</h3>' + html + '</section>';
    }

    function rowDl(k, v) {
        if (!v) return '';
        return '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>';
    }

    function rdapRegistrar(whois) {
        const ents = whois.entities || [];
        for (let i = 0; i < ents.length; i++) {
            const vcard = ents[i].vcardArray && ents[i].vcardArray[1];
            if (!vcard) continue;
            const fn = vcard.find(function (row) { return row[0] === 'fn'; });
            if (fn) return fn[3];
        }
        return '';
    }

    function fingerprintFrom(dns, txt, ns) {
        const hits = [];
        const blob = (txt.join('\n') + '\n' + ns.join('\n') + '\n' + dns.map(function (r) { return r.data; }).join('\n')).toLowerCase();
        const rules = [
            ['Google Workspace', /google-site-verification|aspmx.l.google|googlemail/],
            ['Microsoft 365', /spf.protection.outlook|outlook/],
            ['Cloudflare', /cloudflare|ns.cloudflare/],
            ['AWS', /amazonaws|awsdns/],
            ['Fastmail', /fastmail/],
            ['Proton', /protonmail/],
            ['GitHub Pages', /github\.io|github-pages/],
            ['Shopify', /myshopify|shopify/],
            ['Squarespace', /squarespace/],
            ['Wix', /wixdns|wix\.com/],
            ['WordPress.com', /wordpress\.com/],
            ['Google Sites / Firebase', /web\.app|firebase/],
            ['SendGrid', /sendgrid/],
            ['Mailgun', /mailgun/],
            ['SPF record', /v=spf1/],
            ['DMARC', /v=dmarc1/],
            ['DKIM', /dkim1/]
        ];
        rules.forEach(function (rule) {
            if (rule[1].test(blob)) hits.push(rule[0]);
        });
        return hits;
    }

    function injectToolkit() {
        const kit = window.OSINT_TOOLKIT;
        if (!kit || !Array.isArray(kit.categories)) return;
        if (kit.categories.some(function (c) { return c.id === 'osint-domain-intel'; })) return;
        kit.categories.unshift({
            id: 'osint-domain-intel',
            title: 'Domain Intelligence',
            fields: ['domain'],
            tools: [
                { name: 'Google DNS', url: 'https://dns.google/', host: 'dns.google' },
                { name: 'RDAP.org', url: 'https://rdap.org/', host: 'rdap.org' },
                { name: 'who.is', url: 'https://who.is/', host: 'who.is' },
                { name: 'crt.sh', url: 'https://crt.sh/', host: 'crt.sh' },
                { name: 'SecurityTrails', url: 'https://securitytrails.com/', host: 'securitytrails.com' },
                { name: 'ViewDNS', url: 'https://viewdns.info/', host: 'viewdns.info' },
                { name: 'DNSdumpster', url: 'https://dnsdumpster.com/', host: 'dnsdumpster.com' },
                { name: 'urlscan', url: 'https://urlscan.io/', host: 'urlscan.io' },
                { name: 'Wayback Machine', url: 'https://web.archive.org/', host: 'web.archive.org' },
                { name: 'BuiltWith', url: 'https://builtwith.com/', host: 'builtwith.com' },
                { name: 'Wappalyzer', url: 'https://www.wappalyzer.com/', host: 'wappalyzer.com' },
                { name: 'VirusTotal domain', url: 'https://www.virustotal.com/gui/home/search', host: 'virustotal.com' },
                { name: 'Censys', url: 'https://search.censys.io/', host: 'censys.io' },
                { name: 'Shodan', url: 'https://www.shodan.io/', host: 'shodan.io' },
                { name: 'Netcraft', url: 'https://sitereport.netcraft.com/', host: 'netcraft.com' },
                { name: 'URLVoid', url: 'https://www.urlvoid.com/', host: 'urlvoid.com' }
            ]
        });
    }

    function readU16(view, offset, le) {
        return le ? view.getUint16(offset, true) : view.getUint16(offset, false);
    }

    function readU32(view, offset, le) {
        return le ? view.getUint32(offset, true) : view.getUint32(offset, false);
    }

    function parseExif(buffer) {
        const view = new DataView(buffer);
        if (view.byteLength < 12) return {};
        if (view.getUint16(0) !== 0xFFD8) return { format: 'not-jpeg' };
        let offset = 2;
        const out = { format: 'jpeg' };
        while (offset + 4 < view.byteLength) {
            if (view.getUint8(offset) !== 0xFF) break;
            const marker = view.getUint8(offset + 1);
            const size = view.getUint16(offset + 2);
            if (marker === 0xE1 && size > 8) {
                const start = offset + 4;
                const isExif = String.fromCharCode(view.getUint8(start), view.getUint8(start + 1), view.getUint8(start + 2), view.getUint8(start + 3)) === 'Exif';
                if (isExif) Object.assign(out, readExifBlock(view, start + 6));
            }
            if (marker === 0xC0 || marker === 0xC2) {
                out.height = view.getUint16(offset + 5);
                out.width = view.getUint16(offset + 7);
            }
            offset += 2 + size;
        }
        return out;
    }

    function readExifBlock(view, tiff) {
        const le = view.getUint16(tiff) === 0x4949;
        if (view.getUint16(tiff + 2, le) !== 0x002A) return {};
        const map = {};
        readIfd(view, tiff, tiff + readU32(view, tiff + 4, le), le, map, false);
        if (map._exif) readIfd(view, tiff, tiff + map._exif, le, map, false);
        if (map._gps) readIfd(view, tiff, tiff + map._gps, le, map, true);
        delete map._exif;
        delete map._gps;
        return map;
    }

    const EXIF_TAGS = {
        0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation', 0x011A: 'XResolution', 0x0131: 'Software',
        0x0132: 'DateTime', 0x829A: 'ExposureTime', 0x829D: 'FNumber', 0x8827: 'ISO', 0x9003: 'DateTimeOriginal',
        0x9004: 'DateTimeDigitized', 0x920A: 'FocalLength', 0xA002: 'ExifImageWidth', 0xA003: 'ExifImageHeight',
        0x0103: 'Compression', 0x0100: 'ImageWidth', 0x0101: 'ImageHeight', 0x8769: '_exif', 0x8825: '_gps',
        0x0001: 'GPSLatRef', 0x0002: 'GPSLatitude', 0x0003: 'GPSLonRef', 0x0004: 'GPSLongitude', 0x0006: 'GPSAltitude'
    };

    function readIfd(view, tiff, offset, le, map, gps) {
        if (offset < tiff || offset + 2 > view.byteLength) return;
        const count = readU16(view, offset, le);
        for (let i = 0; i < count; i++) {
            const entry = offset + 2 + i * 12;
            if (entry + 12 > view.byteLength) break;
            const tag = readU16(view, entry, le);
            const type = readU16(view, entry + 2, le);
            const n = readU32(view, entry + 4, le);
            const valOff = entry + 8;
            const name = EXIF_TAGS[tag];
            if (!name && !gps) continue;
            const key = name || ('tag_' + tag);
            map[key] = readExifValue(view, tiff, type, n, valOff, le);
        }
    }

    function readExifValue(view, tiff, type, n, valOff, le) {
        const unit = type === 3 ? 2 : type === 4 || type === 9 ? 4 : type === 5 || type === 10 ? 8 : 1;
        const bytes = unit * n;
        let pos = bytes > 4 ? tiff + readU32(view, valOff, le) : valOff;
        if (type === 2) {
            let s = '';
            for (let i = 0; i < n && pos + i < view.byteLength; i++) {
                const c = view.getUint8(pos + i);
                if (!c) break;
                s += String.fromCharCode(c);
            }
            return s;
        }
        if (type === 3) return n === 1 ? readU16(view, pos, le) : readU16(view, pos, le);
        if (type === 4) return readU32(view, pos, le);
        if (type === 5 || type === 10) {
            if (n >= 3 && bytes >= 24) {
                const vals = [];
                for (let i = 0; i < 3; i++) {
                    const a = readU32(view, pos + i * 8, le);
                    const b = readU32(view, pos + i * 8 + 4, le) || 1;
                    vals.push(a / b);
                }
                return vals;
            }
            const a = readU32(view, pos, le);
            const b = readU32(view, pos + 4, le) || 1;
            return a / b;
        }
        return n;
    }

    function gpsToDeg(arr, ref) {
        if (!Array.isArray(arr) || arr.length < 3) return '';
        let d = arr[0] + arr[1] / 60 + arr[2] / 3600;
        if (ref === 'S' || ref === 'W') d = -d;
        return d.toFixed(6);
    }

    function showPhotoMeta(item) {
        const sheet = $('metaSheet');
        const body = $('metaBody');
        if (!sheet || !body || !item || !item.src) return;
        body.innerHTML = '<p class="muted">Reading file…</p>';
        showSheet(sheet);
        const src = item.src;
        const rows = [];
        function add(k, v) {
            if (v == null || v === '' || v === 'undefined') return;
            rows.push('<tr><th>' + esc(k) + '</th><td>' + esc(String(v)) + '</td></tr>');
        }
        add('Name', item.name || item.value);
        add('Primary', item.primary ? 'Yes' : 'No');
        add('URL', /^https?:\/\//i.test(src) ? src : '(embedded file)');
        const img = new Image();
        img.onload = function () { add('Rendered size', img.naturalWidth + ' × ' + img.naturalHeight); flush(); };
        img.src = src;
        function flush() {
            body.innerHTML = rows.length ? '<table class="an-table meta-table">' + rows.join('') + '</table>' : '<p class="muted">No metadata readable in this browser.</p>';
        }
        const go = function (buf) {
            add('Bytes', buf.byteLength);
            const meta = parseExif(buf);
            Object.keys(meta).forEach(function (k) {
                if (k === 'GPSLatitude') add('Latitude', gpsToDeg(meta[k], meta.GPSLatRef) || meta[k]);
                else if (k === 'GPSLongitude') add('Longitude', gpsToDeg(meta[k], meta.GPSLonRef) || meta[k]);
                else if (k.indexOf('GPS') === 0 && (k === 'GPSLatRef' || k === 'GPSLonRef')) return;
                else add(k, Array.isArray(meta[k]) ? meta[k].join(', ') : meta[k]);
            });
            if (meta.GPSLatitude && meta.GPSLongitude) {
                const lat = gpsToDeg(meta.GPSLatitude, meta.GPSLatRef);
                const lon = gpsToDeg(meta.GPSLongitude, meta.GPSLonRef);
                if (lat && lon) add('Maps', 'https://www.google.com/maps?q=' + lat + ',' + lon);
            }
            flush();
        };
        if (host && host.srcToBlob) {
            host.srcToBlob(src).then(function (blob) {
                add('Type', blob.type);
                add('Size', blob.size + ' bytes');
                return blob.arrayBuffer();
            }).then(go).catch(function () { flush(); });
        } else {
            fetch(src).then(function (r) { return r.arrayBuffer(); }).then(go).catch(function () { flush(); });
        }
    }

    function reverseSearchPhoto(item, button) {
        if (!item || !item.src) return;
        const menu = $('reverseMenu');
        if (!menu) {
            openReverse(item.src, 'lens');
            return;
        }
        menu.innerHTML = REVERSE_ENGINES.map(function (eng) {
            return '<button type="button" data-rev="' + eng.id + '">' + esc(eng.label) + '</button>';
        }).join('');
        menu.hidden = false;
        menu.dataset.src = item.src;
        const rect = button ? button.getBoundingClientRect() : { left: 24, bottom: 80, right: 80 };
        menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 180)) + 'px';
        menu.style.top = Math.min(window.innerHeight - 200, rect.bottom + 6) + 'px';
        if (!/^https?:\/\//i.test(item.src) && host && host.copyImageSource) {
            host.copyImageSource(item.src);
        }
    }

    function openReverse(src, id) {
        const eng = REVERSE_ENGINES.find(function (item) { return item.id === id; }) || REVERSE_ENGINES[0];
        window.open(eng.url(src), '_blank', 'noopener,noreferrer');
        const menu = $('reverseMenu');
        if (menu) menu.hidden = true;
    }
