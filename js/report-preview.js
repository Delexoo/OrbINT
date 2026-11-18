/* Redacted case-file preview */
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

        function dsEditAttrs(edit) {
            if (!edit) return '';
            function attr(text) {
                return esc(String(text == null ? '' : text)).replace(/\r?\n/g, '&#10;');
            }
            return ' data-ds-edit="' + attr(edit.kind) + '" data-ds-id="' + attr(edit.id) + '" data-ds-key="' + attr(edit.key) + '" data-ds-match="' + attr(edit.match) + '" data-ds-raw="' + attr(edit.raw) + '" data-ds-show="' + attr(edit.show) + '"';
        }

        function fillHtml(label, valueHtml, edit) {
            return '<div class="ds-fill' + (edit ? ' is-editable' : '') + '"' + dsEditAttrs(edit) + '><span class="ds-fill-k">' + esc(label) + '</span><span class="ds-fill-dots" aria-hidden="true"></span><span class="ds-fill-v">' + valueHtml + '</span></div>';
        }

        function pairHtml(a, b) {
            return '<div class="ds-pair">' + fillHtml(a[0], a[1], a[2]) + fillHtml(b[0], b[1], b[2]) + '</div>';
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
            var html = '<div class="ds-item">' + fillHtml(title, redactHtml(row.id, row.value), {
                kind: 'fact', id: row.id, key: 'value', raw: row.raw || '', show: row.value || '', match: row.raw || ''
            });
            var h = 16;
            var bits = [row.confidence, row.method, row.captured].filter(Boolean);
            if (bits.length) {
                html += '<div class="ds-meta">' + esc(bits.join('  ·  ')) + '</div>';
                h += 11;
            }
            if (row.source) {
                html += fillHtml('Note', esc(row.source), {
                    kind: 'fact', id: row.id, key: 'source', raw: row.sourceRaw || '', show: row.source || '', match: row.raw || ''
                });
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
            var live = (profile().case) || {};
            var subjectRaw = firstValue('name') || '';
            var meta = pairHtml(
                ['Case no.', rec.number ? esc(rec.number) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'number', raw: live.number || '', show: live.number || '' }],
                ['Status', rec.status ? esc(rec.status) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'status', raw: live.status || 'open', show: rec.status || 'Open' }]
            ) + pairHtml(
                ['Offense', rec.offense ? esc(rec.offense) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'offense', raw: live.offense || '', show: live.offense || '' }],
                ['Investigator', rec.investigator ? esc(rec.investigator) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'investigator', raw: live.investigator || '', show: live.investigator || '' }]
            ) + pairHtml(
                ['Subject', redactHtml('name', doc.subject || 'UNKNOWN'), { kind: 'fact', id: 'name', key: 'value', raw: subjectRaw, show: subjectRaw, match: subjectRaw }],
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

        var sectionNo = 2;
        function nextSection(title) {
            sectionNo += 1;
            section(reportRoman(sectionNo) + '. ' + title);
        }
        function addItems(rows) {
            rows.forEach(function (row, idx) {
                var label = String(idx + 1).padStart(2, '0') + '  ' + row.label;
                var valueHtml = row.redact ? redactHtml(row.redact, row.value) : (row.value ? esc(row.value) : '<span class="ds-empty">--</span>');
                var html = '<div class="ds-item">' + fillHtml(label, valueHtml, row.edit || null);
                var h = 16 + 13 * Math.max(0, wrapPdf(row.value || '', 220, 10).length - 1);
                if (row.note) {
                    html += fillHtml('Note', esc(row.note), row.noteEdit || null);
                    h += 13;
                }
                html += '</div>';
                add(html, h + 4);
            });
        }

        if (chrono.length) {
            nextSection('Timeline');
            chrono.forEach(function (row, idx) {
                var when = [row.date, row.time].filter(Boolean).join('  ') || '--';
                var html = '<div class="ds-item">' + (row.title
                    ? fillHtml(String(idx + 1).padStart(2, '0') + '  ' + when, esc(row.title), { kind: 'event', id: row.id, key: 'title', raw: row.titleRaw || '', show: row.title || '' })
                    : '<div class="ds-fill"><span class="ds-fill-k">' + esc(String(idx + 1).padStart(2, '0') + '  ' + when) + '</span></div>');
                var h = 16;
                if (row.body) {
                    html += fillHtml('Entry', redactHtml('notes', row.body), { kind: 'event', id: row.id, key: 'body', raw: row.bodyRaw || '', show: row.body || '' });
                    h += 12;
                }
                if (row.source) {
                    html += fillHtml('Source', esc(row.source), { kind: 'event', id: row.id, key: 'source', raw: row.sourceRaw || '', show: row.source || '' });
                    h += 12;
                }
                html += '</div>';
                add(html, h + 4);
            });
        }

        if ((doc.board || []).length) {
            nextSection('Whiteboard');
            addItems(doc.board);
        }
        if ((doc.pad || []).length) {
            nextSection('Notepad');
            addItems(doc.pad);
        }
        if ((doc.harvest || []).length) {
            nextSection('Harvester');
            addItems(doc.harvest);
        }

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            nextSection('Photographs');
            morePhotos.forEach(function (item) {
                add(redactPhotoHtml(item.src, true), 220);
                if (item.caption) add('<div class="ds-cap">' + esc(item.caption) + '</div>', 14);
            });
            if (!morePhotos.length && portrait && portrait.caption) {
                addRows([['Photograph', esc(portrait.caption), portrait.caption]]);
            }
        }

        if (doc.notes.length) {
            nextSection('Notes');
            doc.notes.forEach(function (item) {
                var ref = item.ref || {};
                var h = wrapPdf(item.text, WIDTH, 10).length * 13 + 8;
                add('<p class="ds-p ds-note is-editable"' + dsEditAttrs({ kind: 'note', id: ref.id || '', key: ref.key || '', raw: item.raw || item.text, show: item.text }) + '>' + redactHtml('notes', item.text) + '</p>', h);
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
        var avail = Math.max(240, view.clientWidth - (view.clientWidth < 820 ? 16 : 48));
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
