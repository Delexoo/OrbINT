/* Case file sections and PDF writer */
    function factBaseId(id) {
        return String(id || '').replace(/:\d+$/, '').split(/[:_]/)[0];
    }

    function isRedactField(id) {
        var base = factBaseId(id);
        return /^(name|dob|age|phone|email|address|city|username|password|ip|plate|vin|crypto|image|notes)$/i.test(base)
            || /(password|passwd|pin|ssn|seed|privatekey|apikey|session|passport|secret|token)/i.test(String(id || ''));
    }

    function prettyConfidence(value) {
        return CONF_LABEL[value] || prettyPdfValue(value);
    }

    function prettyMethod(value) {
        return METHOD_LABEL[value] || prettyPdfValue(value);
    }

    function prettyCaptured(iso) {
        var d = new Date(iso);
        if (!Number.isFinite(d.getTime())) return prettyPdfValue(iso);
        return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
            '  ' + d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
    }

    function reportFactLabel(item) {
        var base = NICE_LABEL[factBaseId(item.id)] || item.label || 'Item';
        return item.platformLabel ? item.platformLabel + ' / ' + base : base;
    }

    function reportOrderedFacts() {
        var facts = filedFacts();
        var used = {};
        var out = [];
        function take(item) {
            if (factBaseId(item.id) === 'notes') return;
            var value = prettyPdfValue(item.value);
            if (!value) return;
            out.push({
                id: item.id,
                label: reportFactLabel(item),
                value: value,
                raw: String(item.value || '').trim(),
                source: prettyPdfValue(item.source),
                sourceRaw: String(item.source || '').trim(),
                confidence: prettyConfidence(item.confidence),
                method: prettyMethod(item.method),
                captured: item.capturedAt ? prettyCaptured(item.capturedAt) : '',
                redact: isRedactField(item.id)
            });
            used[item.id + '\0' + item.value] = true;
        }
        FIELD_ORDER.forEach(function (id) {
            facts.forEach(function (item) {
                if (factBaseId(item.id) === id && !used[item.id + '\0' + item.value]) take(item);
            });
        });
        facts.forEach(function (item) {
            if (!used[item.id + '\0' + item.value]) take(item);
        });
        return out;
    }

    function reportChronology() {
        return numberedTimeline().map(function (ev) {
            var title = prettyPdfValue(ev.title || '');
            if (SKIP_TITLES[title]) title = '';
            var bodyRaw = String(ev.body || '').trim();
            var bodyShow = [prettyPdfValue(ev.body || '')].concat((ev.moreNotes || []).map(function (note) {
                return prettyPdfValue(note && note.text);
            })).filter(Boolean).join('  ');
            return {
                id: ev.id,
                date: prettyPdfValue(ev.date || ''),
                time: prettyPdfValue(ev.time || ''),
                title: title,
                titleRaw: String(ev.title || '').trim(),
                body: bodyShow,
                bodyRaw: bodyRaw,
                source: prettyPdfValue(ev.source || ''),
                sourceRaw: String(ev.source || '').trim()
            };
        }).filter(function (row) {
            return row.date || row.time || row.body || row.title;
        });
    }

    function redactKey(id, value) {
        return String(id || '') + '|' + String(value || '').slice(0, 120);
    }

    function redactHtml(id, value) {
        var text = String(value || '');
        if (!text) return '<span class="ds-empty">--</span>';
        if (!isRedactField(id)) return esc(text);
        var key = redactKey(id, text);
        var open = (typeof isRedactOpen === 'function' ? isRedactOpen(key) : (typeof dsRevealed !== 'undefined' && dsRevealed.has(key))) ? ' is-open' : '';
        return '<button type="button" class="ds-redact' + open + '" data-redact="' + esc(key) + '" aria-label="Reveal redacted value">' +
            '<span class="ds-redact-bar" aria-hidden="true"></span>' +
            '<span class="ds-redact-val">' + esc(text) + '</span>' +
            '</button>';
    }

    function redactPhotoHtml(src, wide) {
        if (!src) return '';
        var key = redactKey('image', src);
        var open = (typeof isRedactOpen === 'function' ? isRedactOpen(key) : (typeof dsRevealed !== 'undefined' && dsRevealed.has(key))) ? ' is-open' : '';
        return '<button type="button" class="ds-redact ds-redact-photo' + open + (wide ? ' is-wide' : '') + '" data-redact="' + esc(key) + '" aria-label="Reveal photograph">' +
            '<span class="ds-redact-bar" aria-hidden="true"></span>' +
            '<img src="' + esc(src) + '" alt="">' +
            '</button>';
    }

    function pushReportNote(notes, text, ref) {
        var raw = String(text || '').trim();
        var t = prettyPdfValue(text);
        if (!t) return;
        if (notes.some(function (item) { return item.text === t; })) return;
        notes.push({ text: t, raw: raw, ref: ref || null });
    }

    function reportNotes() {
        var notes = [];
        filedFacts().forEach(function (item) {
            if (item.id === 'notes' || /^notes?$/i.test(item.label || '')) {
                pushReportNote(notes, item.value, { key: 'fact', id: item.id });
            }
        });
        pushReportNote(notes, profile().analysis, { key: 'analysis', id: '' });
        (data.evidence || []).forEach(function (item, idx) {
            pushReportNote(notes, item && item.note, { key: 'evidence', id: String(idx) });
        });
        return notes;
    }

    function reportNamed(text) {
        var value = prettyPdfValue(text || '');
        if (!value || SKIP_TITLES[value]) return '';
        return value;
    }

    function reportBoardItems() {
        var board = data.whiteboard || {};
        var nodes = board.nodes || [];
        var byId = {};
        var items = [];
        nodes.forEach(function (node) {
            if (!node || node.type === 'image' || node.type === 'draw') return;
            var title = reportNamed(node.title);
            var body = prettyPdfValue(node.body || '');
            if (!title && !body) return;
            byId[node.id] = title || body.slice(0, 48);
            items.push({
                label: title || 'Card',
                value: body,
                redact: body ? 'notes' : '',
                edit: { kind: 'board', id: node.id, key: body ? 'body' : 'title', raw: body || String(node.title || '').trim(), show: body || title }
            });
        });
        (board.links || []).forEach(function (link) {
            var from = byId[link && link.from];
            var to = byId[link && link.to];
            if (!from || !to) return;
            var label = prettyPdfValue(link.label || '');
            items.push({ label: from + ' → ' + to, value: label });
        });
        return items;
    }

    function reportPadItems() {
        var pad = data.notepad || {};
        var byId = {};
        var items = [];
        (pad.notes || []).forEach(function (note) {
            if (!note) return;
            var title = reportNamed(note.title);
            var body = prettyPdfValue(note.body || '');
            if (!title && !body) return;
            byId[note.id] = title || 'Note';
            items.push({
                label: title || 'Note',
                value: body,
                redact: body ? 'notes' : '',
                edit: { kind: 'pad', id: note.id, key: body ? 'body' : 'title', raw: body || String(note.title || '').trim(), show: body || title }
            });
        });
        (pad.links || []).forEach(function (link) {
            var from = byId[link && link.from];
            var to = byId[link && link.to];
            if (!from || !to) return;
            items.push({ label: from + ' → ' + to, value: '' });
        });
        return items;
    }

    function reportHarvestItems() {
        var names = {
            name: 'Name', alias: 'Alias', email: 'Email', phone: 'Phone', username: 'Username',
            password: 'Password', address: 'Address', dob: 'Date of birth', date: 'Date', time: 'Time',
            company: 'Company', occupation: 'Occupation', ip: 'IP address', url: 'URL', domain: 'Domain',
            id: 'Identifier', os: 'System', vin: 'VIN'
        };
        var redact = { name: 'name', alias: 'name', email: 'email', phone: 'phone', username: 'username', password: 'password', address: 'address', dob: 'dob', ip: 'ip', id: 'id' };
        var hits = (data.harvester && data.harvester.hits) || [];
        var out = [];
        hits.forEach(function (hit, index) {
            if (!hit) return;
            var value = prettyPdfValue(hit.value || '');
            if (!value) return;
            var kind = String(hit.kind || '');
            var label = names[kind] || (kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : 'Item');
            if (hit.platform) label += ' / ' + prettyPdfValue(hit.platform);
            var note = prettyPdfValue(hit.note || '');
            out.push({
                label: label,
                value: value,
                note: note,
                redact: redact[kind] || '',
                edit: { kind: 'harvest', id: String(index), key: 'value', raw: String(hit.value || '').trim(), show: value },
                noteEdit: note ? { kind: 'harvest', id: String(index), key: 'note', raw: String(hit.note || '').trim(), show: note } : null
            });
        });
        return out;
    }

    function reportRoman(n) {
        var romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return romans[n - 1] || String(n);
    }

    function reportCaseMeta() {
        var rec = (profile() && profile().case) || {};
        var status = pdfSafe(rec.status || 'open');
        return {
            number: pdfSafe(rec.number || ''),
            offense: pdfSafe(rec.offense || ''),
            status: status ? status.charAt(0).toUpperCase() + status.slice(1) : '',
            investigator: pdfSafe(rec.investigator || ''),
            openedAt: rec.openedAt ? prettyCaptured(rec.openedAt) : ''
        };
    }

    function reportDocument() {
        var rec = reportCaseMeta();
        return {
            subject: subjectName(),
            dateLong: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            notice: REPORT_NOTICE,
            close: REPORT_CLOSE,
            closeTitle: REPORT_CLOSE_TITLE,
            liabilityTitle: REPORT_LIABILITY_TITLE,
            liability: REPORT_LIABILITY,
            banner: REPORT_BANNER,
            case: rec,
            rows: reportOrderedFacts(),
            notes: reportNotes(),
            chronology: reportChronology(),
            board: reportBoardItems(),
            pad: reportPadItems(),
            harvest: reportHarvestItems(),
            photos: collectReportPhotos()
        };
    }

    function loadReportPhoto(src, opts) {
        opts = typeof opts === 'number' ? { max: opts } : (opts || {});
        return new Promise(function (resolve) {
            if (!src) { resolve(null); return; }
            function paint(img) {
                try {
                    var nw = img.naturalWidth || img.width || 1;
                    var nh = img.naturalHeight || img.height || 1;
                    var max = opts.max || 360;
                    var scale = Math.min(1, max / Math.max(nw, nh));
                    var w = Math.max(1, Math.round(nw * scale));
                    var h = Math.max(1, Math.round(nh * scale));
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    if (opts.paper) {
                        ctx.fillStyle = opts.paper;
                    ctx.fillRect(0, 0, w, h);
                    }
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(function (blob) {
                        if (!blob) { resolve(null); return; }
                        blob.arrayBuffer().then(function (buf) {
                            resolve({ bytes: new Uint8Array(buf), w: w, h: h });
                        }).catch(function () { resolve(null); });
                    }, 'image/jpeg', 0.86);
                } catch (err) { resolve(null); }
            }
            function fromUrl(url, cors) {
                var img = new Image();
                if (cors) img.crossOrigin = 'anonymous';
                img.onload = function () { paint(img); };
                img.onerror = function () { resolve(null); };
                img.src = url;
            }
            if (/^(data:|blob:)/i.test(src)) {
                fromUrl(src, false);
                return;
            }
            var job = host && host.srcToBlob ? host.srcToBlob(src) : fetch(src).then(function (r) { return r.blob(); });
            Promise.resolve(job).then(function (blob) {
                if (!blob) { fromUrl(src, true); return; }
                var u = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = function () { URL.revokeObjectURL(u); paint(img); };
                img.onerror = function () { URL.revokeObjectURL(u); fromUrl(src, true); };
                img.src = u;
            }).catch(function () { fromUrl(src, true); });
        });
    }

    function collectReportPhotos() {
        var seen = {};
        var list = [];
        function add(src, caption) {
            src = String(src || '').trim();
            if (!src || seen[src]) return;
            seen[src] = true;
            var cap = prettyPdfValue(caption) || (/^https?:\/\//i.test(src) ? src : '');
            list.push({ src: src, caption: cap });
        }
        imageItems().forEach(function (item) {
            add(item.src || item.thumb, item.value || item.name || '');
        });
        (data.timeline || []).forEach(function (ev) {
            if (ev && ev.image) add(ev.image, ev.title || ev.source || '');
        });
        ((data.whiteboard && data.whiteboard.nodes) || []).forEach(function (node) {
            if (!node || !node.src) return;
            if (node.type === 'image' || node.shape === 'image' || /^data:image/i.test(node.src) || /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(node.src) || /^https?:\/\//i.test(node.src)) {
                add(node.src, node.title || node.body || '');
            }
        });
        (data.evidence || []).forEach(function (item) {
            if (!item) return;
            var src = item.file || item.url || '';
            if (item.kind === 'image' || /^data:image/i.test(src) || /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(src)) add(src, item.title || '');
        });
        return list;
    }

    function downloadReport() {
        var photos = collectReportPhotos();
        var jobs = photos.slice(0, 8).map(function (item) {
            return loadReportPhoto(item.src).then(function (jpeg) {
                item.jpeg = jpeg;
                return item;
            });
        });
        Promise.all(jobs).then(function (loaded) {
            writeSubjectPdf(loaded);
        }).catch(function () {
            writeSubjectPdf(photos);
        });
    }

    function writeSubjectPdf(photos) {
        const doc = reportDocument();
        const subject = doc.subject;
        const dateLong = doc.dateLong;
        const pages = [];
        const LEFT = 72;
        const WIDTH = 612 - LEFT - 72;
        const NARROW = 420;
        const BOTTOM = 72;
        const BODY = 10;

        function newPage(kind) {
            if (kind === true) kind = 'cover';
            if (kind === false) kind = 'cont';
            var cover = kind === 'cover';
            var page = { ops: ['__PAGE_FOOT__'], y: 728, first: cover, kind: kind, images: [] };
            var rec = doc.case || {};
            var left = rec.number ? 'CASE ' + rec.number : 'CASE FILE';
            var mid = 'RECORD';
            var right = pdfSafe(dateLong);
            paint(page, '/F1', 9, LEFT, 758, left, '0.15 0.15 0.15');
            paint(page, '/F2', 9, (612 - measurePdf(mid, 9)) / 2, 758, mid, '0 0 0');
            paint(page, '/F1', 9, LEFT + WIDTH - measurePdf(right, 9), 758, right, '0.15 0.15 0.15');
            page.ops.push('0 0 0 RG 0.9 w ' + LEFT.toFixed(2) + ' 746 m ' + (LEFT + WIDTH).toFixed(2) + ' 746 l S');
            page.ops.push('0 0 0 RG 0.4 w ' + LEFT.toFixed(2) + ' 743 m ' + (LEFT + WIDTH).toFixed(2) + ' 743 l S');
            page.y = 728;
            return page;
        }

        function ensure(page, need) {
            if (page.y - need < BOTTOM) {
                pages.push(page);
                return newPage(page.kind === 'cover' ? 'record' : 'cont');
            }
            return page;
        }

        function paint(page, font, size, x, y, text, gray, track) {
            var g = gray == null ? '0.12 0.12 0.12' : gray;
            var tc = track ? String(track) + ' Tc ' : '0 Tc ';
            page.ops.push(g + ' rg BT ' + font + ' ' + size + ' Tf ' + tc + x.toFixed(2) + ' ' + y.toFixed(2) + ' Td (' + pdfEscape(text) + ') Tj ET');
        }

        function center(page, text, size, font, extra, gray, track) {
            page = ensure(page, size + extra + 4);
            var w = measurePdf(text, size) + (track || 0) * Math.max(0, pdfSafe(text).length - 1);
            paint(page, font, size, (612 - w) / 2, page.y, text, gray, track);
            page.y -= size + extra;
            return page;
        }

        function flow(page, text, opts) {
            opts = opts || {};
            var size = opts.size || BODY;
            var font = opts.font || '/F1';
            var width = opts.width || WIDTH;
            var x = opts.x != null ? opts.x : LEFT;
            var lead = opts.lead || (size + 4.4);
            var lines = wrapPdf(text, width, size);
            lines.forEach(function (ln, i) {
                page = ensure(page, lead + 2);
                var drawX = x;
                if (opts.center) drawX = (612 - measurePdf(ln, size)) / 2;
                page.ops.push((opts.gray || '0.12 0.12 0.12') + ' rg BT ' + font + ' ' + size + ' Tf 0 Tc 0 Tw ' + drawX.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td (' + pdfEscape(ln) + ') Tj ET');
                page.y -= lead;
            });
            if (opts.after) page.y -= opts.after;
            return page;
        }

        function flowRich(page, text, opts) {
            opts = opts || {};
            var size = opts.size || BODY;
            var width = opts.width || WIDTH;
            var x = opts.x != null ? opts.x : LEFT;
            var lead = opts.lead || (size + 4.4);
            var parts = String(text || '').split('**');
            var tokens = [];
            parts.forEach(function (part, i) {
                if (!part) return;
                var bold = i % 2 === 1;
                part.split(/(\s+)/).forEach(function (bit) {
                    if (!bit) return;
                    tokens.push({ bold: bold, text: bit, space: /^\s+$/.test(bit) });
                });
            });
            var lines = [];
            var line = [];
            var lineW = 0;
            tokens.forEach(function (tok) {
                var tw = measurePdf(tok.text, size);
                if (!line.length && tok.space) return;
                if (line.length && lineW + tw > width && !tok.space) {
                    while (line.length && line[line.length - 1].space) line.pop();
                    if (line.length) lines.push(line);
                    line = [tok];
                    lineW = tw;
                    return;
                }
                line.push(tok);
                lineW += tw;
            });
            while (line.length && line[line.length - 1].space) line.pop();
            if (line.length) lines.push(line);
            lines.forEach(function (ln, i) {
                page = ensure(page, lead + 2);
                var lineW = 0;
                ln.forEach(function (tok) {
                    var chunk = tok.space ? tok.text.replace(/\s+/g, ' ') : tok.text;
                    if (chunk) lineW += measurePdf(chunk, size);
                });
                var drawX = opts.center ? (612 - lineW) / 2 : x;
                var ops = [(opts.gray || '0.12 0.12 0.12') + ' rg BT 0 Tc 0 Tw ' + drawX.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td'];
                ln.forEach(function (tok) {
                    var chunk = tok.space ? tok.text.replace(/\s+/g, ' ') : tok.text;
                    if (!chunk) return;
                    ops.push((tok.bold ? '/F2 ' : '/F1 ') + size + ' Tf (' + pdfEscape(chunk) + ') Tj');
                });
                ops.push('ET');
                page.ops.push(ops.join(' '));
                page.y -= lead;
            });
            if (opts.after) page.y -= opts.after;
            return page;
        }

        function heading(page, text) {
            page = ensure(page, 20);
            page.y -= 3;
            paint(page, '/F2', 11, LEFT, page.y, pdfSafe(text).toUpperCase(), '0 0 0');
            page.y -= 4;
            page.ops.push('0 0 0 RG 0.7 w ' + LEFT.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (LEFT + WIDTH).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 10;
            return page;
        }

        function centerHeading(page, text) {
            page = center(page, pdfSafe(text).toUpperCase(), 11, '/F2', 6, '0 0 0', 0);
            var rw = 168;
            var rx = (612 - rw) / 2;
            page.ops.push('0 0 0 RG 0.7 w ' + rx.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (rx + rw).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 12;
            return page;
        }

        function closeParaH(text, after) {
            return wrapPdf(String(text || '').replace(/\*\*/g, ''), WIDTH, 9).length * 12.5 + (after || 8);
        }

        function paintFill(page, x, width, label, value, size) {
            size = size || 10;
            var lab = pdfSafe(label);
            var val = pdfSafe(value == null || value === '' ? '--' : value);
            var lines = wrapPdf(val, Math.max(72, width * 0.5), size);
            if (!lines.length) lines = ['--'];
            var v0 = lines[0];
            var labW = measurePdf(lab, size);
            var valW = measurePdf(v0, size);
            var valX = x + width - valW;
            paint(page, '/F2', size, x, page.y, lab, '0.12 0.12 0.12');
            if (valX > x + labW + 10) {
                var dots = '';
                var room = valX - x - labW - 8;
                while (measurePdf(dots + '.', 8) < room) dots += '.';
                if (dots) paint(page, '/F1', 8, x + labW + 4, page.y, dots, '0.5 0.5 0.5');
            }
            paint(page, '/F1', size, Math.max(x + labW + 6, valX), page.y, v0, '0.12 0.12 0.12');
            return lines;
        }

        function fillLine(page, label, value, opts) {
            opts = opts || {};
            var size = opts.size || 10;
            var lead = opts.lead || 12;
            var indent = opts.indent || 0;
            var width = opts.width != null ? opts.width : (WIDTH - indent);
            var x = LEFT + indent;
            page = ensure(page, lead + 2);
            var lines = paintFill(page, x, width, label, value, size);
            page.y -= lead;
            var i;
            for (i = 1; i < lines.length; i++) {
                page = ensure(page, lead);
                paint(page, '/F1', size, x + width - measurePdf(lines[i], size), page.y, lines[i], '0.12 0.12 0.12');
                page.y -= lead;
            }
            return page;
        }

        function pairLine(page, leftL, leftV, rightL, rightV, width) {
            width = width != null ? width : WIDTH;
            var col = (width - 14) / 2;
            page = ensure(page, 12);
            var y = page.y;
            paintFill(page, LEFT, col, leftL, leftV, 10);
            paintFill(page, LEFT + col + 14, col, rightL, rightV, 10);
            page.y = y - 12;
            return page;
        }

        function kvLine(page, label, value, indent) {
            return fillLine(page, label, value, { indent: indent || 0 });
        }

        function runIn(page, label, value) {
            return fillLine(page, label, value);
        }

        function rule(page) {
            page = ensure(page, 18);
            page.ops.push('0.35 0.35 0.35 RG 0.55 w ' + LEFT.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (LEFT + WIDTH).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 16;
            return page;
        }

        function placePhoto(page, jpeg, maxW, maxH) {
            if (!jpeg || !jpeg.bytes || !jpeg.bytes.length) return page;
            var aspect = jpeg.h / Math.max(1, jpeg.w);
            var w = maxW;
            var h = w * aspect;
            if (h > maxH) { h = maxH; w = h / aspect; }
            page = ensure(page, h + 22);
            var x = (612 - w) / 2;
            var y = page.y - h;
            var name = 'Im' + (page.images.length + 1);
            page.images.push({ name: name, bytes: jpeg.bytes, w: jpeg.w, h: jpeg.h });
            page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /' + name + ' Do Q');
            page.ops.push('0.42 0.42 0.42 RG 0.6 w ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
            page.y = y - 14;
            return page;
        }

        function placePhotoAt(page, jpeg, x, yTop, maxW, maxH) {
            if (!jpeg || !jpeg.bytes || !jpeg.bytes.length) return { w: 0, h: 0 };
            var aspect = jpeg.h / Math.max(1, jpeg.w);
            var w = maxW;
            var h = w * aspect;
            if (h > maxH) { h = maxH; w = h / aspect; }
            var y = yTop - h;
            var name = 'Im' + (page.images.length + 1);
            page.images.push({ name: name, bytes: jpeg.bytes, w: jpeg.w, h: jpeg.h });
            page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /' + name + ' Do Q');
            page.ops.push('0.42 0.42 0.42 RG 0.5 w ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
            return { w: w, h: h };
        }

        var portrait = (photos || []).find(function (item) { return item && item.jpeg && item.jpeg.bytes; }) || null;
        var morePhotos = (photos || []).filter(function (item) { return item && item.jpeg && item.jpeg.bytes && item !== portrait; });
        var rows = doc.rows;
        var notes = doc.notes;
        var rec = doc.case || {};
        var chrono = doc.chronology || [];

        let pageObj = newPage('cover');
        var head = REPORT_HEAD.toUpperCase();
        var headW = measurePdf(head, REPORT_HEAD_SIZE);
        var coverH = REPORT_HEAD_SIZE + 18 + 10 + 16;
        doc.notice.forEach(function (para, i) {
            coverH += wrapPdf(String(para || '').replace(/\*\*/g, ''), WIDTH, 10).length * 13.5 + (i === doc.notice.length - 1 ? 12 : 8);
        });
        coverH += wrapPdf(doc.banner, WIDTH, 9).length * 12;
        var coverTop = 728;
        var coverBot = 84;
        pageObj.y = Math.min(coverTop, (coverTop + coverBot + coverH) / 2);
        paint(pageObj, '/F2', REPORT_HEAD_SIZE, (612 - headW) / 2, pageObj.y, head, '0 0 0', 0);
        pageObj.y -= REPORT_HEAD_SIZE + 18;
        pageObj = center(pageObj, 'INVESTIGATIVE NOTICE', 10, '/F2', 16, '0 0 0', 0);
        doc.notice.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 10, lead: 13.5, after: i === doc.notice.length - 1 ? 12 : 8, center: true });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 3, '0 0 0', 0);
        });
        pages.push(pageObj);

        pageObj = newPage('record');
        pageObj = heading(pageObj, 'I. Case file');
        var caseTop = pageObj.y;
        var textW = WIDTH;
        var photoBox = { w: 0, h: 0 };
        if (portrait) {
            photoBox = placePhotoAt(pageObj, portrait.jpeg, LEFT + WIDTH - 92, caseTop, 92, 118);
            textW = WIDTH - photoBox.w - 14;
        }
        pageObj = pairLine(pageObj, 'Case no.', rec.number || '--', 'Status', rec.status || '--', textW);
        pageObj = pairLine(pageObj, 'Offense', rec.offense || '--', 'Investigator', rec.investigator || '--', textW);
        pageObj = pairLine(pageObj, 'Subject', subject || 'UNKNOWN', 'Recorded', dateLong, textW);
        if (rec.openedAt) pageObj = fillLine(pageObj, 'Opened', rec.openedAt, { width: textW, lead: 12 });
        if (photoBox.h) pageObj.y = Math.min(pageObj.y, caseTop - photoBox.h - 8);
        pageObj.y -= 4;

        pageObj = heading(pageObj, 'II. Particulars');
        if (!rows.length) {
            pageObj = flow(pageObj, 'No particulars have been recorded.', { size: 10, after: 6 });
        }
        rows.forEach(function (row, idx) {
            var title = String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(row.label).toUpperCase();
            var meta = [row.confidence, row.method, row.captured].filter(Boolean).join('   ');
            var valLines = wrapPdf(row.value || '--', WIDTH * 0.5, 10);
            var need = 16 + (valLines.length - 1) * 12 + (meta ? 11 : 0) + (row.source ? 12 : 0);
            pageObj = ensure(pageObj, Math.min(need, 220));
            pageObj = fillLine(pageObj, title, row.value || '--', { lead: 12 });
            if (meta) {
                pageObj = ensure(pageObj, 11);
                paint(pageObj, '/F3', 9, LEFT + 18, pageObj.y, pdfSafe(meta), '0.28 0.28 0.28');
                pageObj.y -= 11;
            }
            if (row.source) pageObj = fillLine(pageObj, 'Note', row.source, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
            pageObj.y -= 3;
        });

        var sectionNo = 2;
        function nextHeading(title) {
            sectionNo += 1;
            pageObj = heading(pageObj, reportRoman(sectionNo) + '. ' + title);
        }
        function paintItems(items) {
            items.forEach(function (row, idx) {
                pageObj = ensure(pageObj, 28);
                pageObj = fillLine(pageObj, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(row.label), row.value || '--', { lead: 12 });
                if (row.note) pageObj = fillLine(pageObj, 'Note', row.note, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                pageObj.y -= 3;
            });
        }

        if (chrono.length) {
            nextHeading('Timeline');
            chrono.forEach(function (row, idx) {
                var when = [row.date, row.time].filter(Boolean).join('  ') || '--';
                pageObj = ensure(pageObj, 28);
                if (row.title) {
                    pageObj = fillLine(pageObj, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(when), row.title, { lead: 12 });
                } else {
                    pageObj = ensure(pageObj, 13);
                    paint(pageObj, '/F2', 10, LEFT, pageObj.y, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(when), '0.12 0.12 0.12');
                    pageObj.y -= 12;
                }
                if (row.body) pageObj = fillLine(pageObj, 'Entry', row.body, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                if (row.source) pageObj = fillLine(pageObj, 'Source', row.source, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                pageObj.y -= 3;
            });
        }

        if ((doc.board || []).length) {
            nextHeading('Whiteboard');
            paintItems(doc.board);
        }
        if ((doc.pad || []).length) {
            nextHeading('Notepad');
            paintItems(doc.pad);
        }
        if ((doc.harvest || []).length) {
            nextHeading('Harvester');
            paintItems(doc.harvest);
        }

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            nextHeading('Photographs');
            morePhotos.forEach(function (item) {
                pageObj = placePhoto(pageObj, item.jpeg, 180, 160);
                if (item.caption) {
                    pageObj = flow(pageObj, item.caption, { center: true, size: 9, font: '/F3', width: NARROW, after: 10, gray: '0.25 0.25 0.25' });
                }
            });
            if (!morePhotos.length && portrait && portrait.caption) pageObj = kvLine(pageObj, 'Photograph', portrait.caption);
        }

        if (notes.length) {
            nextHeading('Notes');
            notes.forEach(function (item) {
                pageObj = flow(pageObj, item.text, { size: 10, lead: 13, after: 8 });
            });
        }

        pages.push(pageObj);
        pageObj = newPage('close');
        var closeH = closeParaH(doc.close[0], 16) + 29 + closeParaH(doc.close[1], 18) + 29;
        doc.liability.forEach(function (para, i) {
            closeH += closeParaH(para, i === doc.liability.length - 1 ? 14 : 10);
        });
        closeH += wrapPdf(doc.banner, WIDTH, 9).length * 12;
        var usableTop = 728;
        var usableBot = 84;
        pageObj.y = Math.min(usableTop, (usableTop + usableBot + closeH) / 2);
        pageObj = flowRich(pageObj, doc.close[0], { size: 9, lead: 12.5, after: 16, center: true });
        pageObj = centerHeading(pageObj, doc.closeTitle);
        pageObj = flowRich(pageObj, doc.close[1], { size: 9, lead: 12.5, after: 18, center: true });
        pageObj = centerHeading(pageObj, doc.liabilityTitle);
        doc.liability.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 9, lead: 12.5, after: i === doc.liability.length - 1 ? 14 : 10, center: true });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 3, '0 0 0', 0);
        });

        pages.push(pageObj);
        const pdf = buildPdf(pages);
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        var fileBase = String(rec.number || subject || 'file').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
        a.download = (fileBase || 'file') + '.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

