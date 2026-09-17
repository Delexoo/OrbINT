/* Compiler page */

    const CP_MAX = 2 * 1024 * 1024;
    const CP_KINDS = {
        txt: 1, md: 1, json: 1, html: 1, htm: 1, csv: 1, xml: 1
    };
    let cpBusy = false;
    let cpBound = false;

    function compilerState() {
        if (!data.compiler || typeof data.compiler !== 'object') {
            data.compiler = { files: [], hits: [], ready: false };
        }
        if (!Array.isArray(data.compiler.files)) data.compiler.files = [];
        if (!Array.isArray(data.compiler.hits)) data.compiler.hits = [];
        return data.compiler;
    }

    function cpKind(name, type) {
        const ext = String(name || '').split('.').pop().toLowerCase();
        if (CP_KINDS[ext]) return ext === 'htm' ? 'html' : ext;
        const t = String(type || '').toLowerCase();
        if (t.indexOf('json') >= 0) return 'json';
        if (t.indexOf('html') >= 0) return 'html';
        if (t.indexOf('csv') >= 0) return 'csv';
        if (t.indexOf('xml') >= 0) return 'xml';
        if (t.indexOf('markdown') >= 0) return 'md';
        return 'txt';
    }

    function cpPushHit(hits, kind, value, note) {
        const v = String(value || '').trim();
        if (!v) return;
        const key = kind + '\0' + v.toLowerCase();
        if (hits._seen[key]) return;
        hits._seen[key] = 1;
        hits.push({ kind: kind, value: v, note: note || '' });
    }

    function cpScanText(hits, text, note) {
        const src = String(text || '');
        if (!src) return;
        const email = src.match(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi) || [];
        email.forEach(function (v) { cpPushHit(hits, 'email', v, note); });
        const url = src.match(/\bhttps?:\/\/[^\s<>"'`]+/gi) || [];
        url.forEach(function (v) {
            const clean = v.replace(/[),.;]+$/, '');
            cpPushHit(hits, 'url', clean, note);
            try {
                const host = new URL(clean).hostname.replace(/^www\./, '');
                if (host && host.indexOf('.') > 0) cpPushHit(hits, 'domain', host, note);
            } catch (error) {}
        });
        const ip = src.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g) || [];
        ip.forEach(function (v) { cpPushHit(hits, 'ip', v, note); });
        const phone = src.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g) || [];
        phone.forEach(function (v) {
            const digits = v.replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) cpPushHit(hits, 'phone', v, note);
        });
        const user = src.match(/(^|[^\w])@([A-Za-z0-9_]{3,32})\b/g) || [];
        user.forEach(function (v) {
            const h = v.replace(/^[^@]+/, '');
            cpPushHit(hits, 'username', h, note);
        });
        const btc = src.match(/\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g) || [];
        btc.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const eth = src.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
        eth.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const labeled = src.match(/^\s*(name|full name|email|phone|address|username|company|domain|dob|date of birth|ip)\s*[:\-]\s*(.+)$/gim) || [];
        labeled.forEach(function (line) {
            const m = line.match(/^\s*([^:]+?)\s*[:\-]\s*(.+)$/);
            if (!m) return;
            const label = m[1].toLowerCase();
            const val = m[2].trim();
            if (/email/.test(label)) cpPushHit(hits, 'email', val, note);
            else if (/phone/.test(label)) cpPushHit(hits, 'phone', val, note);
            else if (/user/.test(label)) cpPushHit(hits, 'username', val, note);
            else if (/address/.test(label)) cpPushHit(hits, 'address', val, note);
            else if (/company/.test(label)) cpPushHit(hits, 'company', val, note);
            else if (/domain/.test(label)) cpPushHit(hits, 'domain', val, note);
            else if (/ip/.test(label)) cpPushHit(hits, 'ip', val, note);
            else if (/dob|birth/.test(label)) cpPushHit(hits, 'dob', val, note);
            else if (/name/.test(label)) cpPushHit(hits, 'name', val, note);
        });
    }

    function cpParseCsv(text) {
        const rows = [];
        let row = [];
        let cell = '';
        let q = false;
        const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (q) {
                if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
                else if (ch === '"') q = false;
                else cell += ch;
            } else if (ch === '"') q = true;
            else if (ch === ',') { row.push(cell); cell = ''; }
            else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
            else cell += ch;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); }
        return rows.filter(function (r) { return r.some(function (c) { return String(c).trim(); }); });
    }

    function cpFlatten(val, prefix, rows) {
        if (val == null) {
            rows.push({ key: prefix || '(root)', value: String(val) });
            return;
        }
        if (typeof val !== 'object') {
            rows.push({ key: prefix || '(value)', value: String(val) });
            return;
        }
        if (Array.isArray(val)) {
            if (!val.length) rows.push({ key: prefix || '(list)', value: '[]' });
            val.forEach(function (item, i) {
                cpFlatten(item, prefix ? prefix + '[' + i + ']' : '[' + i + ']', rows);
            });
            return;
        }
        const keys = Object.keys(val);
        if (!keys.length) rows.push({ key: prefix || '(object)', value: '{}' });
        keys.forEach(function (k) {
            cpFlatten(val[k], prefix ? prefix + '.' + k : k, rows);
        });
    }

    function cpTagWalk(node, counts, attrs) {
        if (!node) return;
        if (node.nodeType === 1) {
            const tag = String(node.tagName || '').toLowerCase();
            if (tag) counts[tag] = (counts[tag] || 0) + 1;
            if (node.attributes) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const a = node.attributes[i];
                    attrs.push({ tag: tag, name: a.name, value: a.value });
                }
            }
            const kids = node.childNodes || [];
            for (let i = 0; i < kids.length; i++) cpTagWalk(kids[i], counts, attrs);
        }
    }

    function cpHtml(raw, hits) {
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        const counts = {};
        const attrs = [];
        cpTagWalk(doc.documentElement, counts, attrs);
        const title = (doc.querySelector('title') && doc.querySelector('title').textContent) || '';
        const metas = [];
        doc.querySelectorAll('meta').forEach(function (el) {
            const name = el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('http-equiv') || '';
            const content = el.getAttribute('content') || '';
            if (name || content) metas.push({ key: name || '(meta)', value: content });
        });
        const headings = [];
        doc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (el) {
            const t = (el.textContent || '').trim();
            if (t) headings.push({ key: el.tagName.toLowerCase(), value: t });
        });
        const links = [];
        doc.querySelectorAll('a[href]').forEach(function (el) {
            links.push({ text: (el.textContent || '').trim(), href: el.getAttribute('href') || '' });
        });
        const images = [];
        doc.querySelectorAll('img').forEach(function (el) {
            images.push({ text: el.getAttribute('alt') || '', href: el.getAttribute('src') || '' });
        });
        const tables = [];
        doc.querySelectorAll('table').forEach(function (table) {
            const grid = [];
            table.querySelectorAll('tr').forEach(function (tr) {
                const cells = [];
                tr.querySelectorAll('th,td').forEach(function (td) { cells.push((td.textContent || '').trim()); });
                if (cells.length) grid.push(cells);
            });
            if (grid.length) tables.push(grid);
        });
        const bodyText = ((doc.body && doc.body.innerText) || '').replace(/\n{3,}/g, '\n\n').trim();
        cpScanText(hits, raw, 'html');
        if (title) cpPushHit(hits, 'name', title, 'title');
        return {
            title: title,
            metas: metas,
            headings: headings,
            links: links,
            images: images,
            tables: tables,
            text: bodyText,
            tags: Object.keys(counts).sort().map(function (k) { return { key: k, value: String(counts[k]) }; }),
            attrs: attrs.slice(0, 400)
        };
    }

    function cpXml(raw, hits) {
        const doc = new DOMParser().parseFromString(raw, 'application/xml');
        const err = doc.querySelector('parsererror');
        const counts = {};
        const attrs = [];
        const texts = [];
        function walk(node, path) {
            if (!node || node.nodeType !== 1) return;
            const tag = String(node.tagName || '').toLowerCase();
            counts[tag] = (counts[tag] || 0) + 1;
            const here = path ? path + '/' + tag : tag;
            if (node.attributes) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const a = node.attributes[i];
                    attrs.push({ key: here + '@' + a.name, value: a.value });
                    cpScanText(hits, a.value, 'xml attr');
                }
            }
            const kids = Array.prototype.slice.call(node.children || []);
            const text = Array.prototype.slice.call(node.childNodes || []).filter(function (n) {
                return n.nodeType === 3 && String(n.textContent || '').trim();
            }).map(function (n) { return n.textContent.trim(); }).join(' ');
            if (text) {
                texts.push({ key: here, value: text });
                cpScanText(hits, text, 'xml');
            }
            kids.forEach(function (child) { walk(child, here); });
        }
        if (!err && doc.documentElement) walk(doc.documentElement, '');
        cpScanText(hits, raw, 'xml');
        return {
            error: err ? ((err.textContent || 'Could not parse XML').slice(0, 240)) : '',
            tags: Object.keys(counts).sort().map(function (k) { return { key: k, value: String(counts[k]) }; }),
            attrs: attrs,
            texts: texts
        };
    }

    function cpJson(raw, hits) {
        let parsed = null;
        let error = '';
        try { parsed = JSON.parse(raw); }
        catch (e) { error = e.message || 'Invalid JSON'; }
        const rows = [];
        if (parsed != null) cpFlatten(parsed, '', rows);
        rows.forEach(function (row) { cpScanText(hits, row.key + ' ' + row.value, 'json'); });
        if (error) cpScanText(hits, raw, 'json');
        return { error: error, rows: rows, pretty: parsed != null ? JSON.stringify(parsed, null, 2) : '' };
    }

    function cpMd(raw, hits) {
        const headings = [];
        const links = [];
        const list = [];
        String(raw || '').split(/\n/).forEach(function (line) {
            const h = line.match(/^(#{1,6})\s+(.+)$/);
            if (h) headings.push({ key: 'h' + h[1].length, value: h[2].trim() });
            const li = line.match(/^\s*[-*+]\s+(.+)$/);
            if (li) list.push(li[1]);
            const link = line.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
            link.forEach(function (bit) {
                const m = bit.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (m) links.push({ text: m[1], href: m[2] });
            });
        });
        cpScanText(hits, raw, 'markdown');
        return { headings: headings, links: links, list: list, text: raw };
    }

    function cpCsv(raw, hits) {
        const grid = cpParseCsv(raw);
        grid.forEach(function (row) {
            row.forEach(function (cell) { cpScanText(hits, cell, 'csv'); });
        });
        return { tables: grid.length ? [grid] : [] };
    }

    function cpTxt(raw, hits) {
        cpScanText(hits, raw, 'text');
        const paras = String(raw || '').split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean);
        return { text: raw, paras: paras };
    }

    function compileOne(file, raw) {
        const kind = cpKind(file.name, file.type);
        const hits = [];
        hits._seen = {};
        let parsed;
        if (kind === 'html') parsed = cpHtml(raw, hits);
        else if (kind === 'xml') parsed = cpXml(raw, hits);
        else if (kind === 'json') parsed = cpJson(raw, hits);
        else if (kind === 'md') parsed = cpMd(raw, hits);
        else if (kind === 'csv') parsed = cpCsv(raw, hits);
        else parsed = cpTxt(raw, hits);
        delete hits._seen;
        return {
            id: uid('cp'),
            name: file.name || 'untitled',
            kind: kind,
            size: file.size || raw.length,
            raw: raw,
            parsed: parsed,
            hits: hits
        };
    }

    function mergeCompilerHits(files) {
        const hits = [];
        hits._seen = {};
        files.forEach(function (file) {
            (file.hits || []).forEach(function (hit) {
                cpPushHit(hits, hit.kind, hit.value, hit.note || file.name);
            });
        });
        delete hits._seen;
        return hits;
    }

    function setCompilerBusy(on, title, hint) {
        cpBusy = !!on;
        const load = $('compilerLoad');
        const drop = $('compilerDrop');
        if (load) {
            load.hidden = !on;
            const t = $('compilerLoadTitle');
            const h = $('compilerLoadHint');
            if (t && title) t.textContent = title;
            if (h && hint) h.textContent = hint;
        }
        if (drop) drop.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    function hideCompilerDownload() {
        const menu = $('compilerDownloadMenu');
        if (menu) menu.hidden = true;
    }

    function compilerSummary() {
        const st = compilerState();
        const n = (st.files || []).length;
        const hits = (st.hits || []).length;
        const el = $('compilerCount');
        if (!el) return;
        if (!st.ready || !n) el.textContent = 'No file';
        else el.textContent = n + (n === 1 ? ' file' : ' files') + ' · ' + hits + ' identifiers';
        const dl = $('compilerDownloadBtn');
        const ins = $('compilerInspectBtn');
        if (dl) dl.disabled = !st.ready;
        if (ins) ins.disabled = !st.ready;
    }

    function cpEsc(text) {
        return esc(text);
    }

    function renderKv(rows) {
        if (!rows || !rows.length) return '';
        return '<dl class="cp-kv">' + rows.map(function (row) {
            return '<dt>' + cpEsc(row.key) + '</dt><dd>' + cpEsc(row.value) + '</dd>';
        }).join('') + '</dl>';
    }

    function renderTable(grid) {
        if (!grid || !grid.length) return '';
        const head = grid[0];
        const body = grid.slice(1);
        const useHead = head.every(function (c) { return String(c).length < 48; });
        let html = '<div class="cp-table-wrap"><table class="cp-table">';
        if (useHead) {
            html += '<thead><tr>' + head.map(function (c) { return '<th>' + cpEsc(c) + '</th>'; }).join('') + '</tr></thead>';
        }
        const rows = useHead ? body : grid;
        html += '<tbody>' + rows.map(function (row) {
            return '<tr>' + row.map(function (c) { return '<td>' + cpEsc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
        return html;
    }

    function renderHits(hits) {
        if (!hits || !hits.length) return '';
        return '<div class="cp-grid">' + hits.map(function (hit) {
            return '<div class="cp-hit"><b>' + cpEsc(hit.kind) + '</b><span>' + cpEsc(hit.value) + '</span>' +
                (hit.note ? '<i>' + cpEsc(hit.note) + '</i>' : '') + '</div>';
        }).join('') + '</div>';
    }

    function renderCompilerFile(file) {
        const p = file.parsed || {};
        let body = '';
        if (p.title) body += '<p class="cp-block">' + cpEsc(p.title) + '</p>';
        if (p.error) body += '<p class="cp-block">' + cpEsc(p.error) + '</p>';
        if (p.headings && p.headings.length) body += renderKv(p.headings);
        if (p.metas && p.metas.length) body += '<p class="cp-label">Meta <em>' + p.metas.length + '</em></p>' + renderKv(p.metas);
        if (p.rows && p.rows.length) body += renderKv(p.rows);
        if (p.texts && p.texts.length) body += renderKv(p.texts);
        if (p.links && p.links.length) {
            body += '<ul class="cp-list">' + p.links.map(function (link) {
                return '<li>' + cpEsc(link.text || link.href) + (link.href ? ' — ' + cpEsc(link.href) : '') + '</li>';
            }).join('') + '</ul>';
        }
        if (p.images && p.images.length) {
            body += '<ul class="cp-list">' + p.images.map(function (img) {
                return '<li>' + cpEsc(img.text || 'image') + (img.href ? ' — ' + cpEsc(img.href) : '') + '</li>';
            }).join('') + '</ul>';
        }
        if (p.list && p.list.length) {
            body += '<ul class="cp-list">' + p.list.map(function (item) { return '<li>' + cpEsc(item) + '</li>'; }).join('') + '</ul>';
        }
        if (p.tables) p.tables.forEach(function (grid) { body += renderTable(grid); });
        if (p.paras && p.paras.length) {
            body += p.paras.map(function (para) { return '<p class="cp-block">' + cpEsc(para) + '</p>'; }).join('');
        } else if (p.text && !p.pretty && file.kind !== 'html') {
            body += '<pre class="cp-block">' + cpEsc(p.text) + '</pre>';
        }
        if (p.pretty) body += '<pre class="cp-src">' + cpEsc(p.pretty) + '</pre>';
        if (p.tags && p.tags.length) {
            body += '<p class="cp-label">Markup <em>kept</em></p>' + renderKv(p.tags);
        }
        if (p.attrs && p.attrs.length && file.kind !== 'xml') {
            body += '<p class="cp-label">Attributes <em>' + p.attrs.length + '</em></p>' + renderKv(p.attrs.map(function (a) {
                return { key: (a.tag ? a.tag + ' @' : '') + a.name, value: a.value };
            }));
        }
        body += '<details class="cp-orig"><summary>Original</summary><pre class="cp-src">' + cpEsc(file.raw) + '</pre></details>';
        return '<section class="cp-sec"><h3>' + cpEsc(file.name) + ' <em>' + cpEsc(file.kind) + '</em></h3>' + body + '</section>';
    }

    function renderCompiler() {
        const drop = $('compilerDrop');
        const result = $('compilerResult');
        const st = compilerState();
        compilerSummary();
        if (!drop || !result) return;
        if (!st.ready || !(st.files || []).length) {
            drop.hidden = false;
            result.hidden = true;
            result.innerHTML = '';
            return;
        }
        drop.hidden = true;
        result.hidden = false;
        const names = (st.files || []).map(function (f) { return f.name; }).join(', ');
        const n = (st.hits || []).length;
        result.innerHTML =
            '<div class="cp-stack"><div class="cp-banner"><b>' + cpEsc(names) + '</b><span>' + n + (n === 1 ? ' identifier' : ' identifiers') + '</span></div>' +
            (n ? '<section class="cp-sec"><h3>Identifiers</h3>' + renderHits(st.hits) + '</section>' : '') +
            (st.files || []).map(renderCompilerFile).join('') + '</div>';
    }

    function readCompilerFile(file) {
        return new Promise(function (resolve, reject) {
            if (file.size > CP_MAX) {
                reject(new Error(file.name + ' is larger than 2 MB'));
                return;
            }
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result || '')); };
            reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
            reader.readAsText(file);
        });
    }

    function ingestCompilerFiles(list) {
        const files = Array.prototype.slice.call(list || []).filter(Boolean);
        if (!files.length || cpBusy) return;
        hideCompilerDownload();
        setCompilerBusy(true, 'Compiling', 'Lining up the file…');
        const started = Date.now();
        Promise.all(files.map(function (file) {
            return readCompilerFile(file).then(function (raw) { return compileOne(file, raw); });
        })).then(function (compiled) {
            const wait = Math.max(0, 520 - (Date.now() - started));
            setTimeout(function () {
                const st = compilerState();
                st.files = compiled;
                st.hits = mergeCompilerHits(compiled);
                st.ready = true;
                st.at = new Date().toISOString();
                setCompilerBusy(false);
                renderCompiler();
                schedulePersist();
            }, wait);
        }).catch(function (error) {
            setCompilerBusy(false);
            const drop = $('compilerDrop');
            if (drop) {
                const strong = drop.querySelector('strong');
                if (strong) strong.textContent = error.message || 'Could not compile that file';
            }
        });
    }

    function openCompilerPicker() {
        const input = $('compilerFile');
        if (input) input.click();
    }

    function compilerExport(fmt) {
        const st = compilerState();
        if (!st.ready || !(st.files || []).length) return;
        const files = st.files;
        const hits = st.hits || [];
        let name = (files[0] && files[0].name ? files[0].name.replace(/\.[^.]+$/, '') : 'compiled') + '-compiled';
        let body = '';
        let type = 'text/plain';
        if (fmt === 'json') {
            type = 'application/json';
            body = JSON.stringify({ hits: hits, files: files.map(function (f) {
                return { name: f.name, kind: f.kind, parsed: f.parsed, original: f.raw };
            }) }, null, 2);
            name += '.json';
        } else if (fmt === 'csv') {
            type = 'text/csv';
            body = 'kind,value,note\n' + hits.map(function (h) {
                return [h.kind, h.value, h.note].map(function (c) {
                    const s = String(c || '');
                    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(',');
            }).join('\n');
            name += '.csv';
        } else if (fmt === 'xml') {
            type = 'application/xml';
            body = '<?xml version="1.0" encoding="UTF-8"?>\n<compiled>\n  <identifiers>\n' +
                hits.map(function (h) {
                    return '    <hit kind="' + esc(h.kind) + '">' + esc(h.value) + '</hit>';
                }).join('\n') + '\n  </identifiers>\n  <originals>\n' +
                files.map(function (f) {
                    return '    <file name="' + esc(f.name) + '" kind="' + esc(f.kind) + '"><![CDATA[' + String(f.raw || '').replace(/]]>/g, ']]]]><![CDATA[>') + ']]></file>';
                }).join('\n') + '\n  </originals>\n</compiled>\n';
            name += '.xml';
        } else if (fmt === 'html') {
            type = 'text/html';
            body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(name) + '</title></head><body>' +
                '<h1>Compiled record</h1>' +
                '<h2>Identifiers</h2><ul>' + hits.map(function (h) {
                    return '<li><b>' + esc(h.kind) + '</b> ' + esc(h.value) + '</li>';
                }).join('') + '</ul>' +
                files.map(function (f) {
                    return '<h2>' + esc(f.name) + '</h2><pre>' + esc(f.raw) + '</pre>';
                }).join('') + '</body></html>';
            name += '.html';
        } else if (fmt === 'md') {
            body = '# Compiled record\n\n## Identifiers\n\n' + hits.map(function (h) {
                return '- **' + h.kind + ':** ' + h.value;
            }).join('\n') + '\n\n' + files.map(function (f) {
                return '## ' + f.name + '\n\n```' + f.kind + '\n' + f.raw + '\n```\n';
            }).join('\n');
            name += '.md';
        } else {
            body = 'Compiled record\n\nIdentifiers\n' + hits.map(function (h) {
                return h.kind + ': ' + h.value;
            }).join('\n') + '\n\n' + files.map(function (f) {
                return '----- ' + f.name + ' -----\n' + f.raw;
            }).join('\n\n');
            name += '.txt';
        }
        const blob = new Blob([body], { type: type + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    const CP_FIELD = {
        email: 'email',
        phone: 'phone',
        username: 'username',
        name: 'name',
        address: 'address',
        ip: 'ip',
        domain: 'domain',
        crypto: 'crypto',
        dob: 'dob',
        company: 'company',
        url: ''
    };

    function inspectCompiler() {
        const st = compilerState();
        if (!st.ready) return;
        const hits = st.hits || [];
        const names = (st.files || []).map(function (f) { return f.name; }).join(', ');
        if (host && host.addFact) {
            hits.forEach(function (hit) {
                const field = CP_FIELD[hit.kind];
                if (!field) return;
                host.addFact(field, hit.value, { source: 'compiler', method: 'file-compile' });
            });
            const note = 'Compiled ' + names + ' — ' + hits.length + ' identifier' + (hits.length === 1 ? '' : 's') + ' lined up for inspection.';
            host.addFact('notes', note, { source: 'compiler', method: 'file-compile' });
        }
        if (typeof addEventAt === 'function') {
            const ev = addEventAt(220, -1, false);
            if (ev) {
                ev.title = 'Compiled ' + (names || 'file');
                ev.body = hits.slice(0, 12).map(function (h) { return h.kind + ': ' + h.value; }).join('\n');
                ev.source = names;
                ev.date = new Date().toISOString().slice(0, 10);
            }
        }
        schedulePersist();
        setPage('orbit');
    }

    function bindCompiler() {
        if (cpBound) return;
        const view = $('compilerView');
        const drop = $('compilerDrop');
        if (!view || !drop) return;
        cpBound = true;
        function over(event) {
            event.preventDefault();
            drop.classList.add('is-over');
        }
        function leave(event) {
            event.preventDefault();
            drop.classList.remove('is-over');
        }
        view.addEventListener('dragover', over);
        view.addEventListener('dragenter', over);
        view.addEventListener('dragleave', leave);
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            drop.classList.remove('is-over');
            ingestCompilerFiles(event.dataTransfer && event.dataTransfer.files);
        });
        document.addEventListener('click', function (event) {
            if (event.target.closest('#compilerUploadBtn, #compilerDropBtn')) {
                openCompilerPicker();
                return;
            }
            if (event.target.closest('#compilerDownloadBtn')) {
                const menu = $('compilerDownloadMenu');
                if (menu) menu.hidden = !menu.hidden;
                return;
            }
            if (event.target.closest('[data-cp-fmt]')) {
                compilerExport(event.target.getAttribute('data-cp-fmt'));
                hideCompilerDownload();
                return;
            }
            if (event.target.closest('#compilerInspectBtn')) {
                inspectCompiler();
                return;
            }
            if (!event.target.closest('.cp-dl')) hideCompilerDownload();
        });
    }
