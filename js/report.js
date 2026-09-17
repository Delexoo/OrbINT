/* PDF report */

    function pdfClean(text) {
        return String(text == null ? '' : text)
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '--')
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/[^\x20-\x7E]/g, function (ch) {
                try { return ch.normalize('NFKD').replace(/[^\x20-\x7E]/g, ''); } catch (error) { return ''; }
            });
    }

    function pdfSafe(text) {
        return pdfClean(text).replace(/\s+/g, ' ').trim();
    }

    function pdfEscape(text) {
        return pdfClean(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }

    function measurePdf(text, size) {
        return pdfClean(text).length * size * 0.6;
    }

    function wrapPdf(text, maxW, size) {
        var words = pdfSafe(text).split(/\s+/).filter(Boolean);
        var lines = [];
        var line = '';
        function pushChunk(raw) {
            var chunk = '';
            for (var i = 0; i < raw.length; i++) {
                if (measurePdf(chunk + raw[i], size) > maxW && chunk) {
                    lines.push(chunk);
                    chunk = raw[i];
                } else chunk += raw[i];
            }
            line = chunk;
        }
        words.forEach(function (w) {
            if (measurePdf(w, size) > maxW) {
                if (line) lines.push(line);
                pushChunk(w);
                return;
            }
            var next = line ? line + ' ' + w : w;
            if (measurePdf(next, size) > maxW && line) {
                lines.push(line);
                line = w;
            } else line = next;
        });
        if (line) lines.push(line);
        return lines.length ? lines : [''];
    }

    function wrapWords(text, width) {
        return wrapPdf(text, width * 5.4, 10);
    }

    function latin1Pdf(str) {
        var out = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 255;
        return out;
    }

    function concatPdf(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        var out = new Uint8Array(n);
        var o = 0;
        for (i = 0; i < chunks.length; i++) {
            out.set(chunks[i], o);
            o += chunks[i].length;
        }
        return out;
    }

    function pdfChunksLength(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        return n;
    }

    function longPdfDate(raw) {
        var s = String(raw || '').trim();
        var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return s;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return String(Number(m[3])) + ' ' + (months[Number(m[2]) - 1] || m[2]) + ' ' + m[1];
    }

    function displaySafe(raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v) return '';
        if (/^(data:|blob:)/i.test(v)) return '';
        if (/^file:/i.test(v) || /^[a-zA-Z]:[\\/]/.test(v) || v.indexOf('\\Users\\') >= 0 || v.indexOf('/Users/') === 0 || v.indexOf('/home/') === 0) {
            return v.split(/[\\/]/).pop() || '';
        }
        return v;
    }

    function prettyPdfValue(raw) {
        var v = displaySafe(raw);
        if (!v) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
            var head = v.slice(0, 10);
            var rest = v.slice(10).trim();
            return rest ? longPdfDate(head) + ' ' + rest : longPdfDate(head);
        }
        return v;
    }

    var REPORT_HEAD = 'Open-source Reconnaissance Bureau of Intelligence';
    var REPORT_HEAD_SIZE = 12;
    var REPORT_BANNER = 'AUTHORIZED USE ONLY -- INFORMATION SUBJECT TO VERIFICATION -- DO NOT TREAT UNVERIFIED FINDINGS AS ESTABLISHED FACT';
    var REPORT_NOTICE = [
        'This record is intended strictly for **authorized investigative, research, and analytical purposes**. Access, reproduction, disclosure, and distribution should be limited to individuals with a legitimate need to review the information contained herein.',
        'Information within this record is derived primarily from publicly available and open-source material. Such information **cannot be presumed accurate**, as publicly available data may contain typographical errors, mistakes, or particulars that remain unconfirmed. Sources may also be false, misleading, outdated, incomplete, altered, misattributed, or otherwise unreliable. Accordingly, all findings should be treated as **information for consideration and further analysis**, rather than established fact, unless independently verified.',
        'The inclusion of a name, account, photograph, address, organization, relationship, identifier, or other data point does not by itself confirm identity, ownership, association, involvement, or responsibility. Similarities and apparent connections may be coincidental or the result of inaccurate source information.',
        'Information of material importance should be verified against its originating source and, where appropriate, corroborated through additional independent and reliable sources before any consequential action or conclusion is based upon it.',
        'This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion regarding an individual or organization. Analytical notes, suspected associations, and unresolved leads should remain clearly distinguished from verified findings.',
        'Information may change after collection. Accounts may be modified, records corrected, websites removed, and circumstances altered. Dates, source references, and supporting evidence should therefore be considered when evaluating the reliability and continued relevance of any finding.'
    ];
    var REPORT_CLOSE = [
        'This record is to be kept strictly confidential. It is issued for the use of the recipient only. Copying, forwarding, posting, printing for circulation, or any other reproduction, disclosure, or distribution of this file, in whole or in part, should be limited to individuals with a legitimate need to review it for **authorized investigative, research, and analytical purposes**. Recipients are required to store it securely and to destroy or return it when it is no longer required. Unauthorized disclosure of the particulars herein is to be avoided in every case.',
        'Nothing in this file should be treated as established fact unless independently verified. Information of material importance should be checked against its originating source, and where appropriate corroborated through additional independent and reliable sources, before any consequential action or conclusion is based upon it. This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion. Analytical notes, suspected associations, and unresolved leads remain **information for consideration and further analysis** only.'
    ];
    var REPORT_CLOSE_TITLE = 'LIMITATION OF RELIANCE';
    var REPORT_LIABILITY_TITLE = 'LIABILITY AND DISTRIBUTION DISCLAIMER';
    var REPORT_LIABILITY = [
        'This disclaimer serves as formal notice that the creator(s), developer(s), and contributors of OrbINT assume no responsibility or liability for the use, misuse, disclosure, reproduction, distribution, or dissemination of this document or the information contained within it once it has been generated, exported, downloaded, shared, or otherwise transferred outside of their control.',
        'Responsibility for the lawful handling, verification, security, and distribution of this document rests solely with the individual or organization possessing or using it. The creator(s) of OrbINT shall not be held responsible for any unauthorized disclosure, improper use, reliance upon unverified information, or consequences arising from actions taken by users or third parties.',
        'Generation of this document does not constitute verification, endorsement, or certification of the information contained herein.'
    ];
    var NICE_LABEL = {
        name: 'Name',
        dob: 'Date of birth',
        age: 'Age',
        phone: 'Telephone',
        email: 'Electronic mail',
        username: 'Username',
        address: 'Address',
        city: 'City',
        country: 'Country',
        countrycode: 'Country code',
        company: 'Employer / company',
        occupation: 'Occupation',
        domain: 'Website',
        ip: 'Internet address',
        vehicle: 'Vehicle',
        plate: 'Registration plate',
        vin: 'VIN',
        image: 'Photograph',
        password: 'Password',
        phoneos: 'Telephone system',
        os: 'Computer system',
        timezone: 'Timezone',
        crypto: 'Wallet',
        notes: 'Notes'
    };
    var FIELD_ORDER = ['name', 'dob', 'age', 'address', 'city', 'country', 'countrycode', 'phone', 'email', 'username', 'occupation', 'company', 'domain', 'ip', 'timezone', 'phoneos', 'os', 'vehicle', 'plate', 'vin', 'crypto', 'password', 'notes', 'image'];
    var SKIP_TITLES = {
        Untitled: 1, 'Untitled Card': 1, Frame: 1, Finding: 1, Question: 1, Square: 1, Circle: 1, Triangle: 1,
        Diamond: 1, Note: 1, Person: 1, Evidence: 1, Image: 1, Website: 1, Event: 1, Text: 1,
        Rectangle: 1, Capsule: 1, Document: 1, Line: 1, Arrow: 1, Embed: 1, 'Web Embed': 1
    };

    var CONF_LABEL = { confirmed: 'Confirmed', probable: 'Probable', possible: 'Possible', unconfirmed: 'Unconfirmed' };
    var METHOD_LABEL = {
        'open-web': 'Open web',
        'public-records': 'Public records',
        'subscriber-db': 'Subscriber DB',
        interview: 'Interview',
        'legal-process': 'Legal process'
    };

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
                source: prettyPdfValue(item.source),
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
            return {
                date: prettyPdfValue(ev.date || ''),
                time: prettyPdfValue(ev.time || ''),
                title: title,
                body: prettyPdfValue(ev.body || ''),
                source: prettyPdfValue(ev.source || '')
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

    function pushReportNote(notes, text) {
        var t = prettyPdfValue(text);
        if (!t) return;
        if (notes.some(function (item) { return item.text === t; })) return;
        notes.push({ text: t });
    }

    function reportNotes() {
        var notes = [];
        filedFacts().forEach(function (item) {
            if (item.id === 'notes' || /^notes?$/i.test(item.label || '')) {
                pushReportNote(notes, item.value);
            }
        });
        pushReportNote(notes, profile().analysis);
        numberedTimeline().forEach(function (ev) {
            var title = String(ev.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            function addTl(text) {
                var t = prettyPdfValue(text);
                if (!t) return;
                pushReportNote(notes, title ? title + '. ' + t : t);
            }
            addTl(ev.body);
            (ev.moreNotes || []).forEach(function (note) {
                addTl(note && note.text);
            });
        });
        (data.evidence || []).forEach(function (item) {
            pushReportNote(notes, item && item.note);
        });
        ((data.whiteboard && data.whiteboard.nodes) || []).forEach(function (node) {
            if (!node || node.type !== 'note') return;
            var title = String(node.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            var body = String(node.body || '').trim();
            var bits = [];
            if (title) bits.push(title);
            if (body) bits.push(body);
            pushReportNote(notes, bits.join('. '));
        });
        return notes;
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

        if (chrono.length) {
            pageObj = heading(pageObj, 'III. Chronology');
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

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            pageObj = heading(pageObj, 'IV. Photographs');
            morePhotos.forEach(function (item) {
                pageObj = placePhoto(pageObj, item.jpeg, 180, 160);
                if (item.caption) {
                    pageObj = flow(pageObj, item.caption, { center: true, size: 9, font: '/F3', width: NARROW, after: 10, gray: '0.25 0.25 0.25' });
                }
            });
            if (!morePhotos.length && portrait && portrait.caption) pageObj = kvLine(pageObj, 'Photograph', portrait.caption);
        }

        if (notes.length) {
            pageObj = heading(pageObj, 'V. Notes');
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

    function reportRichHtml(text) {
        return String(text || '').split('**').map(function (part, i) {
            return i % 2 === 1 ? '<b>' + esc(part) + '</b>' : esc(part);
        }).join('');
    }

    function reportPreviewMarkup() {
        var doc = reportDocument();
        var WIDTH = 468;
        var MAX = 580;
        var rec = doc.case || {};
        var photos = doc.photos || [];
        var portrait = photos[0] || null;
        var morePhotos = photos.slice(1);
        var chrono = doc.chronology || [];
        var pages = [];
        var cur = [];
        var used = 0;
        var nextKind = 'cover';
        var lockCover = true;

        function flush() {
            if (!cur.length && pages.length) return;
            pages.push({ kind: nextKind, first: nextKind === 'cover', html: cur.join('') });
            cur = [];
            used = 0;
            nextKind = nextKind === 'cover' ? 'record' : 'cont';
        }

        function add(html, h) {
            h = Math.max(8, Math.ceil(h || 20));
            if (!lockCover && cur.length && used + h > MAX) flush();
            cur.push(html);
            used += h;
        }

        function fillHtml(label, valueHtml) {
            return '<div class="ds-fill"><span class="ds-fill-k">' + esc(label) + '</span><span class="ds-fill-dots" aria-hidden="true"></span><span class="ds-fill-v">' + valueHtml + '</span></div>';
        }

        function pairHtml(a, b) {
            return '<div class="ds-pair">' + fillHtml(a[0], a[1]) + fillHtml(b[0], b[1]) + '</div>';
        }

        function addRows(pairs) {
            var html = '';
            var h = 0;
            pairs.forEach(function (pair) {
                html += fillHtml(pair[0], pair[1]);
                h += 13 * Math.max(1, wrapPdf(String(pair[2] != null ? pair[2] : '').replace(/<[^>]*>/g, ' ') || '--', 220, 10).length);
            });
            add(html, h);
        }

        function addFact(row, idx) {
            var title = String(idx + 1).padStart(2, '0') + '  ' + String(row.label || '').toUpperCase();
            var html = '<div class="ds-item">' + fillHtml(title, redactHtml(row.id, row.value));
            var h = 16;
            var bits = [row.confidence, row.method, row.captured].filter(Boolean);
            if (bits.length) {
                html += '<div class="ds-meta">' + esc(bits.join('  ·  ')) + '</div>';
                h += 11;
            }
            if (row.source) {
                html += fillHtml('Note', esc(row.source));
                h += 13 * Math.max(1, wrapPdf(row.source, 280, 9).length);
            }
            html += '</div>';
            add(html, h + 4);
        }

        function section(title) {
            add('<h3 class="ds-h">' + esc(title) + '</h3>', 22);
        }

        add('<div class="ds-cover"><div class="ds-c ds-banner"><span>' + esc(REPORT_HEAD.toUpperCase()) + '</span></div>', 22);
        add('<div class="ds-c ds-kicker">INVESTIGATIVE NOTICE</div>', 20);
        doc.notice.forEach(function (para, i) {
            var last = i === doc.notice.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 10).length * 14 + (last ? 12 : 8);
            add('<p class="ds-p' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        add('</div>', 1);
        lockCover = false;
        flush();

        section('I. Case file');
        (function () {
            var meta = pairHtml(
                ['Case no.', rec.number ? esc(rec.number) : '<span class="ds-empty">--</span>'],
                ['Status', rec.status ? esc(rec.status) : '<span class="ds-empty">--</span>']
            ) + pairHtml(
                ['Offense', rec.offense ? esc(rec.offense) : '<span class="ds-empty">--</span>'],
                ['Investigator', rec.investigator ? esc(rec.investigator) : '<span class="ds-empty">--</span>']
            ) + pairHtml(
                ['Subject', redactHtml('name', doc.subject || 'UNKNOWN')],
                ['Recorded', esc(doc.dateLong)]
            ) + (rec.openedAt ? fillHtml('Opened', esc(rec.openedAt)) : '');
            var html = '<div class="ds-case"><div class="ds-case-meta">' + meta + '</div>';
            if (portrait && portrait.src) html += redactPhotoHtml(portrait.src, false);
            html += '</div>';
            add(html, portrait && portrait.src ? 128 : 48);
        }());

        section('II. Particulars');
        if (!doc.rows.length) add('<p class="ds-p">No particulars have been recorded.</p>', 18);
        doc.rows.forEach(function (row, idx) {
            addFact(row, idx);
        });

        if (chrono.length) {
            section('III. Chronology');
            chrono.forEach(function (row, idx) {
                var when = [row.date, row.time].filter(Boolean).join('  ') || '--';
                var html = '<div class="ds-item">' + (row.title
                    ? fillHtml(String(idx + 1).padStart(2, '0') + '  ' + when, esc(row.title))
                    : '<div class="ds-fill"><span class="ds-fill-k">' + esc(String(idx + 1).padStart(2, '0') + '  ' + when) + '</span></div>');
                var h = 16;
                if (row.body) {
                    html += fillHtml('Entry', redactHtml('notes', row.body));
                    h += 12;
                }
                if (row.source) {
                    html += fillHtml('Source', esc(row.source));
                    h += 12;
                }
                html += '</div>';
                add(html, h + 4);
            });
        }

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            section('IV. Photographs');
            morePhotos.forEach(function (item) {
                add(redactPhotoHtml(item.src, true), 220);
                if (item.caption) add('<div class="ds-cap">' + esc(item.caption) + '</div>', 14);
            });
            if (!morePhotos.length && portrait && portrait.caption) {
                addRows([['Photograph', esc(portrait.caption), portrait.caption]]);
            }
        }

        if (doc.notes.length) {
            section('V. Notes');
            doc.notes.forEach(function (item) {
                var h = wrapPdf(item.text, WIDTH, 10).length * 13 + 8;
                add('<p class="ds-p ds-note">' + redactHtml('notes', item.text) + '</p>', h);
            });
        }

        flush();
        nextKind = 'close';
        var closeHtml = '<div class="ds-close">';
        closeHtml += '<p class="ds-p is-close">' + reportRichHtml(doc.close[0]) + '</p>';
        closeHtml += '<h3 class="ds-h">' + esc(doc.closeTitle) + '</h3>';
        closeHtml += '<p class="ds-p is-close">' + reportRichHtml(doc.close[1]) + '</p>';
        closeHtml += '<h3 class="ds-h">' + esc(doc.liabilityTitle) + '</h3>';
        doc.liability.forEach(function (para, i) {
            closeHtml += '<p class="ds-p is-close' + (i === doc.liability.length - 1 ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>';
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            closeHtml += '<div class="ds-c ds-foot">' + esc(ln) + '</div>';
        });
        closeHtml += '</div>';
        add(closeHtml, 520);
        flush();

        var n = pages.length || 1;
        return '<div class="ds-fit">' + pages.map(function (page, i) {
            var kind = page.kind || (page.first ? 'cover' : 'cont');
            var cls = kind === 'cover' ? ' is-first' : (kind === 'record' ? ' is-record' : (kind === 'close' ? ' is-close-page' : ''));
            var head = '<div class="ds-headband"><span>' + esc(rec.number ? 'CASE ' + rec.number : 'CASE FILE') + '</span><span>RECORD</span><span>' + esc(doc.dateLong) + '</span></div>';
            var foot = '<div class="ds-footband"><span>AUTHORIZED USE ONLY</span><span>PAGE ' + (i + 1) + ' OF ' + n + '</span></div>';
            return '<div class="ds-sheet"><article class="ds-page' + cls + '">' + head + '<div class="ds-body">' + page.html + '</div>' + foot + '</article></div>';
        }).join('') + '</div>';
    }

    function sizeDatasheet() {
        var view = $('datasheetView');
        var fit = view && view.querySelector('.ds-fit');
        if (!view || !fit) return;
        var n = fit.querySelectorAll('.ds-page').length || 1;
        var avail = Math.max(280, view.clientWidth - 48);
        var s = Math.min(1.15, Math.max(0.42, avail / 612));
        fit.style.setProperty('--ds-scale', String(s));
        fit.style.height = (n * 792 * s + (n - 1) * 28 * s + 8) + 'px';
    }

    function buildPdf(pages) {
        var nPages = pages.length;
        var pageDictIds = [];
        var contentIds = [];
        var i;
        for (i = 0; i < nPages; i++) {
            pageDictIds.push(6 + i * 2);
            contentIds.push(7 + i * 2);
        }
        var nextId = 6 + nPages * 2;
        pages.forEach(function (pageObj) {
            (pageObj.images || []).forEach(function (im) {
                im.objId = nextId++;
            });
        });
        var objects = new Array(nextId - 1);
        objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
        objects[1] = '<< /Type /Pages /Kids [ ' + pageDictIds.map(function (id) { return id + ' 0 R'; }).join(' ') + ' ] /Count ' + nPages + ' /MediaBox [0 0 612 792] >>';
        objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
        objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';
        objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Oblique >>';
        pages.forEach(function (pageObj, idx) {
            var xobj = (pageObj.images || []).map(function (im) {
                return '/' + im.name + ' ' + im.objId + ' 0 R';
            }).join(' ');
            var res = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>' + (xobj ? ' /XObject << ' + xobj + ' >>' : '');
            var left = 'AUTHORIZED USE ONLY';
            var right = 'PAGE ' + (idx + 1) + ' OF ' + nPages;
            var rightX = 540 - measurePdf(right, 9);
            var pageFoot =
                '0 0 0 RG 0.8 w 72 62 m 540 62 l S\n' +
                '0.15 0.15 0.15 rg BT /F1 9 Tf 0 Tc 0 Tw 72 50 Td (' + pdfEscape(left) + ') Tj ET\n' +
                '0.15 0.15 0.15 rg BT /F1 9 Tf 0 Tc 0 Tw ' + rightX.toFixed(2) + ' 50 Td (' + pdfEscape(right) + ') Tj ET';
            var streamBytes = latin1Pdf(pageObj.ops.join('\n').replace(/__PAGE_FOOT__/g, pageFoot).replace(/__PAGE_NO__/g, pageFoot));
            objects[pageDictIds[idx] - 1] = '<< /Type /Page /Parent 2 0 R /Resources << ' + res + ' >> /Contents ' + contentIds[idx] + ' 0 R >>';
            objects[contentIds[idx] - 1] = { dict: '<< /Length ' + streamBytes.length + ' >>', stream: streamBytes };
            (pageObj.images || []).forEach(function (im) {
                objects[im.objId - 1] = {
                    dict: '<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.bytes.length + ' >>',
                    stream: im.bytes
                };
            });
        });
        var chunks = [];
        chunks.push(latin1Pdf('%PDF-1.4\n'));
        chunks.push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
        var offsets = [0];
        objects.forEach(function (obj, idx) {
            offsets.push(pdfChunksLength(chunks));
            chunks.push(latin1Pdf((idx + 1) + ' 0 obj\n'));
            if (obj && obj.stream) {
                chunks.push(latin1Pdf(obj.dict + '\nstream\n'));
                chunks.push(obj.stream);
                chunks.push(latin1Pdf('\nendstream\nendobj\n'));
            } else {
                chunks.push(latin1Pdf(obj + '\nendobj\n'));
            }
        });
        var xrefPos = pdfChunksLength(chunks);
        var xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
        for (i = 1; i < offsets.length; i++) {
            xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
        }
        chunks.push(latin1Pdf(xref + 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF'));
        return concatPdf(chunks);
    }
