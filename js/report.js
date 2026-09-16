/* PDF report (no OrbINT branding in the file) */

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

    var TIMES_W = {
        32:250,33:333,34:408,35:500,36:500,37:833,38:778,39:333,40:333,41:333,42:500,43:564,44:250,45:333,46:250,47:278,
        48:500,49:500,50:500,51:500,52:500,53:500,54:500,55:500,56:500,57:500,58:278,59:278,60:564,61:564,62:564,63:444,
        64:921,65:722,66:667,67:667,68:722,69:611,70:556,71:722,72:722,73:333,74:389,75:722,76:611,77:889,78:722,79:722,
        80:556,81:722,82:667,83:556,84:611,85:722,86:722,87:944,88:722,89:722,90:611,91:333,92:278,93:333,94:469,95:500,
        96:333,97:444,98:500,99:444,100:500,101:444,102:333,103:500,104:500,105:278,106:278,107:500,108:278,109:778,110:500,111:500,
        112:500,113:500,114:333,115:389,116:278,117:500,118:500,119:722,120:500,121:500,122:444,123:480,124:200,125:480,126:541
    };

    function measurePdf(text, size) {
        var w = 0;
        var s = pdfClean(text);
        for (var i = 0; i < s.length; i++) {
            w += TIMES_W[s.charCodeAt(i)] || 500;
        }
        return w * size / 1000;
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
    var REPORT_HEAD_SIZE = 16;
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

    function noteSource(origin) {
        return '[' + origin + ']';
    }

    function reportFactLabel(item) {
        var base = NICE_LABEL[item.id] || item.label || 'Item';
        return item.platformLabel ? item.platformLabel + ' / ' + base : base;
    }

    function reportOrderedFacts() {
        var facts = filedFacts();
        var used = {};
        var out = [];
        function take(item) {
            if (item.id === 'notes') return;
            var value = prettyPdfValue(item.value);
            if (!value) return;
            out.push({ label: reportFactLabel(item), value: value });
            used[item.id + '\0' + item.value] = true;
        }
        FIELD_ORDER.forEach(function (id) {
            facts.forEach(function (item) {
                if (item.id === id && !used[item.id + '\0' + item.value]) take(item);
            });
        });
        facts.forEach(function (item) {
            if (!used[item.id + '\0' + item.value]) take(item);
        });
        return out;
    }

    function pushReportNote(notes, origin, text) {
        var t = prettyPdfValue(text);
        if (!t) return;
        notes.push({ label: noteSource(origin), text: t });
    }

    function reportNotes() {
        var notes = [];
        filedFacts().forEach(function (item) {
            if (item.id === 'notes' || /^notes?$/i.test(item.label || '')) {
                pushReportNote(notes, 'OrbINT', item.value);
            }
        });
        pushReportNote(notes, 'OrbINT', profile().analysis);
        numberedTimeline().forEach(function (ev) {
            var title = String(ev.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            function addTl(text) {
                var t = prettyPdfValue(text);
                if (!t) return;
                pushReportNote(notes, 'Timeline', title ? title + '. ' + t : t);
            }
            addTl(ev.body);
            (ev.moreNotes || []).forEach(function (note) {
                addTl(note && note.text);
            });
        });
        (data.evidence || []).forEach(function (item) {
            pushReportNote(notes, 'OrbINT', item && item.note);
        });
        ((data.whiteboard && data.whiteboard.nodes) || []).forEach(function (node) {
            if (!node || node.type !== 'note') return;
            var title = String(node.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            var body = String(node.body || '').trim();
            var bits = [];
            if (title) bits.push(title);
            if (body) bits.push(body);
            pushReportNote(notes, 'Whiteboard', bits.join('. '));
        });
        return notes;
    }

    function reportDocument() {
        return {
            subject: subjectName(),
            dateLong: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            notice: REPORT_NOTICE,
            close: REPORT_CLOSE,
            banner: REPORT_BANNER,
            rows: reportOrderedFacts(),
            notes: reportNotes(),
            photos: collectReportPhotos()
        };
    }

    function loadGreyPhoto(src) {
        return new Promise(function (resolve) {
            if (!src) { resolve(null); return; }
            function paint(img) {
                try {
                    var nw = img.naturalWidth || img.width || 1;
                    var nh = img.naturalHeight || img.height || 1;
                    var max = 360;
                    var scale = Math.min(1, max / Math.max(nw, nh));
                    var w = Math.max(1, Math.round(nw * scale));
                    var h = Math.max(1, Math.round(nh * scale));
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    ctx.filter = 'grayscale(100%) contrast(0.9) brightness(1.06)';
                    ctx.drawImage(img, 0, 0, w, h);
                    ctx.filter = 'none';
                    ctx.fillStyle = 'rgba(118,118,118,0.22)';
                    ctx.fillRect(0, 0, w, h);
                    canvas.toBlob(function (blob) {
                        if (!blob) { resolve(null); return; }
                        blob.arrayBuffer().then(function (buf) {
                            resolve({ bytes: new Uint8Array(buf), w: w, h: h });
                        }).catch(function () { resolve(null); });
                    }, 'image/jpeg', 0.7);
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
            return loadGreyPhoto(item.src).then(function (jpeg) {
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
        const BOTTOM = 64;
        const BODY = 11;
        const LEAD = 15.4;

        function newPage(kind) {
            if (kind === true) kind = 'cover';
            if (kind === false) kind = 'cont';
            var cover = kind === 'cover';
            var record = kind === 'record';
            var page = { ops: ['__PAGE_NO__'], y: cover ? 700 : 720, first: cover, kind: kind, images: [] };
            if (!cover && !record) {
                var run = pdfSafe(subject);
                if (run) {
                    var w = measurePdf(run, 9);
                    page.ops.push('0.35 0.35 0.35 rg BT /F3 9 Tf 0 Tc 0 Tw ' + ((612 - w) / 2).toFixed(2) + ' 748 Td (' + pdfEscape(run) + ') Tj ET');
                }
            }
            return page;
        }

        function ensure(page, need) {
            if (page.y - need < BOTTOM) {
                pages.push(page);
                return newPage(page.kind === 'cover' ? 'cover' : 'cont');
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
                var ops = [(opts.gray || '0.12 0.12 0.12') + ' rg BT 0 Tc 0 Tw ' + x.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td'];
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
            page = ensure(page, 28);
            page.y -= 8;
            paint(page, '/F2', 12, LEFT, page.y, text, '0 0 0');
            page.y -= 18;
            return page;
        }

        function runIn(page, label, value) {
            var size = BODY;
            var rowLead = 17;
            var labelText = pdfSafe(label);
            var right = LEFT + WIDTH;
            var labelW = measurePdf(labelText, size);
            var maxVal = Math.max(90, WIDTH - labelW - 28);
            var lines = wrapPdf(value, maxVal, size);
            if (!lines.length) lines = [''];
            page = ensure(page, rowLead + 2);
            paint(page, '/F1', size, LEFT, page.y, labelText, '0.1 0.1 0.1');
            var v0w = measurePdf(lines[0] || '', size);
            var valueX = right - v0w;
            var dotsStart = LEFT + labelW + 4;
            var dotsEnd = valueX - 2;
            var dotW = measurePdf('.', size);
            var nDots = (dotW && dotsEnd > dotsStart) ? Math.max(0, Math.floor((dotsEnd - dotsStart) / dotW) + 1) : 0;
            if (nDots >= 2) paint(page, '/F1', size, dotsStart, page.y, Array(nDots + 1).join('.'), '0.55 0.55 0.55');
            paint(page, '/F1', size, valueX, page.y, lines[0] || '', '0.1 0.1 0.1');
            page.y -= rowLead;
            for (var i = 1; i < lines.length; i++) {
                page = ensure(page, rowLead);
                var lw = measurePdf(lines[i], size);
                paint(page, '/F1', size, right - lw, page.y, lines[i], '0.1 0.1 0.1');
                page.y -= rowLead;
            }
            page.y -= 3;
            return page;
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

        var portrait = (photos || []).find(function (item) { return item && item.jpeg && item.jpeg.bytes; }) || null;
        var morePhotos = (photos || []).filter(function (item) { return item && item.jpeg && item.jpeg.bytes && item !== portrait; });
        var rows = doc.rows;
        var notes = doc.notes;

        let pageObj = newPage('cover');
        pageObj = center(pageObj, REPORT_HEAD, REPORT_HEAD_SIZE, '/F2', 8, '0 0 0', 0);
        pageObj.y -= 28;
        doc.notice.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 11, lead: 16, after: i === doc.notice.length - 1 ? 14 : 11 });
        });
        wrapPdf(doc.banner, NARROW, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 4, '0 0 0', 0.4);
        });
        pages.push(pageObj);
        pageObj = newPage('record');
        wrapPdf(String(subject || 'UNKNOWN').toUpperCase(), NARROW, 16).forEach(function (ln) {
            pageObj = center(pageObj, ln, 16, '/F2', 6, '0 0 0', 0.7);
        });
        pageObj.y -= 6;
        if (portrait) pageObj = placePhoto(pageObj, portrait.jpeg, 168, 210);
        pageObj = center(pageObj, dateLong, 11, '/F3', 14, '0.2 0.2 0.2');
        pageObj = rule(pageObj);

        if (!rows.length && !notes.length && !portrait) {
            pageObj = flow(pageObj, 'No particulars have been recorded for this person.', { after: 8 });
        }
        rows.forEach(function (row) {
            pageObj = runIn(pageObj, row.label, row.value);
        });

        if (morePhotos.length) {
            pageObj.y -= 6;
            pageObj = heading(pageObj, 'Photographs');
            morePhotos.forEach(function (item) {
                pageObj = placePhoto(pageObj, item.jpeg, 220, 200);
                if (item.caption) {
                    pageObj = flow(pageObj, item.caption, { center: true, size: 9, font: '/F3', width: NARROW, after: 12, gray: '0.25 0.25 0.25' });
                }
            });
        } else if (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption)) {
            pageObj = runIn(pageObj, 'Photograph', portrait.caption);
        }

        if (notes.length) {
            pageObj.y -= 4;
            pageObj = heading(pageObj, 'Notes');
            notes.forEach(function (item) {
                pageObj = runIn(pageObj, item.label, item.text);
            });
        }

        pageObj.y -= 8;
        pageObj = rule(pageObj);
        doc.close.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 10.5, lead: 15.4, after: i === doc.close.length - 1 ? 12 : 10 });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 4, '0 0 0', 0.4);
        });

        pages.push(pageObj);
        const pdf = buildPdf(pages);
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        var fileBase = String(subject || 'file').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
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
        var NARROW = 420;
        var MAX = 668;
        var subject = pdfSafe(doc.subject || 'UNKNOWN').toUpperCase();
        var photos = doc.photos || [];
        var portrait = photos[0] || null;
        var morePhotos = photos.slice(1);
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
            h = h || 20;
            if (!lockCover && used + h > MAX && cur.length) flush();
            cur.push(html);
            used += h;
        }

        function kv(label, value) {
            var lines = wrapPdf(value, 250, 11);
            if (!lines.length) lines = [''];
            var h = 20 + Math.max(0, lines.length - 1) * 17;
            var html = '<div class="ds-kv"><span class="ds-k">' + esc(label) + '</span><span class="ds-leader" aria-hidden="true"></span><span class="ds-v">' + esc(lines[0]) + '</span></div>';
            for (var i = 1; i < lines.length; i++) {
                html += '<div class="ds-kv is-cont"><span class="ds-v">' + esc(lines[i]) + '</span></div>';
            }
            add(html, h);
        }

        function photoFig(src, wide) {
            if (!src) return;
            add('<figure class="ds-fig' + (wide ? ' is-wide' : '') + '"><img src="' + esc(src) + '" alt=""></figure>', wide ? 214 : 224);
        }

        add('<div class="ds-c ds-banner">' + esc(REPORT_HEAD) + '</div>', 24);
        add('<div class="ds-after-head"></div>', 28);
        doc.notice.forEach(function (para, i) {
            var last = i === doc.notice.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 11).length * 16 + (last ? 14 : 11);
            add('<p class="ds-p' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, NARROW, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        lockCover = false;
        flush();
        wrapPdf(subject, NARROW, 16).forEach(function (ln) {
            add('<div class="ds-c ds-subject">' + esc(ln) + '</div>', 22);
        });
        add('<div class="ds-gap"></div>', 6);
        if (portrait && portrait.src) photoFig(portrait.src, false);
        add('<div class="ds-c ds-date">' + esc(doc.dateLong) + '</div>', 25);
        add('<hr class="ds-rule">', 16);

        if (!doc.rows.length && !doc.notes.length && !portrait) {
            add('<p class="ds-p">No particulars have been recorded for this person.</p>', 24);
        }
        doc.rows.forEach(function (row) { kv(row.label, row.value); });

        if (morePhotos.length) {
            add('<h3 class="ds-h">Photographs</h3>', 28);
            morePhotos.forEach(function (item) {
                photoFig(item.src, true);
                if (item.caption) {
                    wrapPdf(item.caption, NARROW, 9).forEach(function (ln) {
                        add('<div class="ds-cap">' + esc(ln) + '</div>', 13);
                    });
                }
            });
        } else if (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption)) {
            kv('Photograph', portrait.caption);
        }

        if (doc.notes.length) {
            add('<h3 class="ds-h">Notes</h3>', 28);
            doc.notes.forEach(function (item) { kv(item.label, item.text); });
        }

        add('<hr class="ds-rule">', 24);
        doc.close.forEach(function (para, i) {
            var last = i === doc.close.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 10.5).length * 15.4 + (last ? 12 : 10);
            add('<p class="ds-p is-close' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        flush();

        var inner = pages.map(function (page, i) {
            var kind = page.kind || (page.first ? 'cover' : 'cont');
            var head = kind === 'cont' ? '<div class="ds-runhead">' + esc(pdfSafe(doc.subject)) + '</div>' : '';
            var cls = kind === 'cover' ? ' is-first' : (kind === 'record' ? ' is-record' : '');
            return '<article class="ds-page' + cls + '">' + head + page.html + '<div class="ds-pageno">' + (i + 1) + '</div></article>';
        }).join('');
        return '<div class="ds-fit"><div class="ds-stage">' + inner + '</div></div>';
    }

    function sizeDatasheet() {
        var view = $('datasheetView');
        var fit = view && view.querySelector('.ds-fit');
        var stage = view && view.querySelector('.ds-stage');
        if (!view || !fit || !stage) return;
        var n = stage.querySelectorAll('.ds-page').length || 1;
        var gap = 28;
        var avail = Math.max(280, view.clientWidth - 48);
        var s = Math.min(1.22, Math.max(0.42, avail / 612));
        stage.style.setProperty('--ds-scale', String(s));
        fit.style.height = (n * 792 * s + (n - 1) * gap * s + 8) + 'px';
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
        objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>';
        objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>';
        objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>';
        pages.forEach(function (pageObj, idx) {
            var xobj = (pageObj.images || []).map(function (im) {
                return '/' + im.name + ' ' + im.objId + ' 0 R';
            }).join(' ');
            var res = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>' + (xobj ? ' /XObject << ' + xobj + ' >>' : '');
            var label = String(idx + 1);
            var numW = measurePdf(label, 9);
            var pageNo = '0.35 0.35 0.35 rg BT /F1 9 Tf 0 Tc 0 Tw ' + ((612 - numW) / 2).toFixed(2) + ' 46 Td (' + label + ') Tj ET';
            var streamBytes = latin1Pdf(pageObj.ops.join('\n').replace(/__PAGE_NO__/g, pageNo));
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
