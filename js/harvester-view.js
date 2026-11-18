/* Harvester editor, diff, and file list */
    function setHarvesterBusy(on, title, hint) {
        cpBusy = !!on;
        const load = $('harvesterLoad');
        const drop = $('harvesterDrop');
        if (load) {
            load.hidden = !on;
            const t = $('harvesterLoadTitle');
            const h = $('harvesterLoadHint');
            if (t && title) t.textContent = title;
            if (h && hint) h.textContent = hint;
        }
        if (drop) drop.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    function hideHarvesterDownload() {
        const menu = $('harvesterDownloadMenu');
        if (menu) menu.hidden = true;
    }

    function harvesterSplitPct() {
        const n = Number(harvesterState().split);
        return isFinite(n) ? Math.min(78, Math.max(22, n)) : 50;
    }

    function applyHarvesterSplit(pct, persist) {
        const n = Math.round(Math.min(78, Math.max(22, Number(pct))) * 10) / 10;
        harvesterState().split = n;
        document.querySelectorAll('.cp-diff:not(.is-single)').forEach(function (el) {
            el.style.setProperty('--cp-split', n + '%');
            const g = el.querySelector('.cp-split-gutter');
            if (g) {
                g.setAttribute('aria-valuenow', String(Math.round(n)));
                g.setAttribute('aria-valuetext', Math.round(n) + '% original');
            }
        });
        if (persist) schedulePersist();
    }

    function splitPctFromPointer(gutter, clientX) {
        const body = gutter.closest('.cp-diff-body') || gutter.parentNode;
        const rect = body.getBoundingClientRect();
        if (!rect.width) return harvesterSplitPct();
        const minPx = Math.min(160, rect.width * 0.22);
        const x = Math.min(rect.width - minPx, Math.max(minPx, clientX - rect.left));
        return (x / rect.width) * 100;
    }

    function harvesterView() {
        const view = harvesterState().view;
        return view === 'original' || view === 'stripped' ? view : 'split';
    }

    function syncCpModeThumb(instant) {
        const wrap = $('harvesterCount');
        if (!wrap) return;
        let thumb = wrap.querySelector('.cp-mode-thumb');
        if (!thumb) {
            thumb = document.createElement('span');
            thumb.className = 'cp-mode-thumb';
            thumb.setAttribute('aria-hidden', 'true');
            wrap.insertBefore(thumb, wrap.firstChild);
            instant = true;
        }
        const on = wrap.querySelector('[aria-checked="true"]') || wrap.querySelector('.is-on');
        if (!on) return;
        const w = on.offsetWidth;
        if (!(w > 0)) return;
        const snap = instant || !cpModeThumbReady || reduceMotion();
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = on.offsetLeft + 'px';
        thumb.style.width = w + 'px';
        cpModeThumbReady = true;
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function setHarvesterView(view) {
        const next = view === 'original' || view === 'stripped' ? view : 'split';
        const st = harvesterState();
        const prev = harvesterView();
        if (prev === next) {
            harvesterSummary();
            return;
        }
        const order = ['split', 'original', 'stripped'];
        st.view = next;
        renderHarvester({ slide: order.indexOf(next) - order.indexOf(prev) });
        schedulePersist();
    }

    function harvesterSummary() {
        const st = harvesterState();
        const n = (st.files || []).length;
        const el = $('harvesterCount');
        const view = harvesterView();
        if (el) {
            el.querySelectorAll('[data-cp-view]').forEach(function (btn) {
                const on = btn.getAttribute('data-cp-view') === view;
                btn.setAttribute('aria-checked', on ? 'true' : 'false');
                btn.classList.toggle('is-on', on);
            });
            requestAnimationFrame(function () { syncCpModeThumb(false); });
        }
        const dl = $('harvesterDownloadBtn');
        const cpy = $('harvesterCopyBtn');
        const ins = $('harvesterInspectBtn');
        const clr = $('harvesterClearBtn');
        const on = !!(st.ready && n);
        if (dl) dl.disabled = !on;
        if (cpy) cpy.disabled = !on;
        if (ins) ins.disabled = !on;
        if (clr) clr.disabled = !on;
    }

    function cpEsc(text) {
        return esc(text);
    }

    function cpHitLabel(hit) {
        if (hit.platform) {
            const p = hit.platform;
            return p === 'github' ? 'GitHub' : p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1);
        }
        return CP_KIND_LABEL[hit.kind] || hit.kind;
    }

    function cpHitLine(hit) {
        return cpHitLabel(hit) + ': ' + hit.value;
    }

    function cpTokenAt(line, at, len) {
        const src = String(line || '');
        const left = at > 0 ? src.charAt(at - 1) : '';
        const right = at + len < src.length ? src.charAt(at + len) : '';
        const word = /[A-Za-z0-9_.-]/;
        if (left && word.test(left)) return false;
        if (right && word.test(right)) return false;
        return true;
    }

    function cpHasHint(line, hint) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const h = String(hint || '').toLowerCase();
        if (h.length < 2) return false;
        let from = 0;
        let at;
        while ((at = low.indexOf(h, from)) >= 0) {
            const left = at === 0 || !/[A-Za-z0-9]/.test(src.charAt(at - 1));
            const right = at + h.length >= src.length || !/[A-Za-z0-9]/.test(src.charAt(at + h.length));
            if (left && right) return true;
            from = at + 1;
        }
        return false;
    }

    function cpHitHints(hit) {
        const hints = [];
        function add(s) {
            const t = String(s || '').toLowerCase().trim();
            if (t.length >= 2 && hints.indexOf(t) < 0) hints.push(t);
        }
        add(cpHitLabel(hit));
        if (hit.platform) add(hit.platform);
        if (hit.kind && hit.kind !== 'username') add(hit.kind);
        const extra = {
            email: ['e-mail', 'mail'],
            phone: ['tel', 'mobile', 'cell', 'telephone'],
            dob: ['dob', 'd.o.b', 'birthday', 'birth date', 'date of birth', 'born', 'birth'],
            address: ['location', 'city', 'addr'],
            alias: ['aka', 'nick', 'nickname'],
            name: ['full name', 'real name', 'display name', 'display_name', 'legal name'],
            domain: ['website', 'url', 'site'],
            date: ['timestamp', 'created']
        };
        (extra[hit.kind] || []).forEach(add);
        return hints;
    }

    function cpMarkInLine(line, value) {
        const src = String(line || '');
        const needle = String(value || '');
        if (!src || !needle) return cpEsc(src);
        const low = src.toLowerCase();
        const want = needle.toLowerCase();
        let from = 0;
        let at = -1;
        while ((from = low.indexOf(want, from)) >= 0) {
            if (cpTokenAt(src, from, needle.length)) {
                at = from;
                break;
            }
            from += 1;
        }
        if (at < 0) return '<span class="cp-x">' + cpEsc(src) + '</span>';
        const before = src.slice(0, at);
        const mid = src.slice(at, at + needle.length);
        const after = src.slice(at + needle.length);
        return (before ? '<span class="cp-x">' + cpEsc(before) + '</span>' : '') +
            '<span class="cp-keep">' + cpEsc(mid) + '</span>' +
            (after ? '<span class="cp-x">' + cpEsc(after) + '</span>' : '');
    }

    function cpHitsOnLine(line, hits, used) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const tokenHits = [];
        hits.forEach(function (hit, i) {
            if (used[i]) return;
            const v = String(hit.value || '');
            if (v.length < 2) return;
            const want = v.toLowerCase();
            let from = 0;
            let at = -1;
            while ((from = low.indexOf(want, from)) >= 0) {
                if (cpTokenAt(src, from, v.length)) {
                    at = from;
                    break;
                }
                from += 1;
            }
            if (at < 0) return;
            const hinted = cpHitHints(hit).some(function (h) { return cpHasHint(src, h); });
            tokenHits.push({ i: i, hit: hit, at: at, len: v.length, hinted: hinted });
        });
        const hinted = tokenHits.filter(function (item) { return item.hinted; });
        const pool = hinted.length ? hinted : tokenHits;
        pool.sort(function (a, b) {
            if (b.len !== a.len) return b.len - a.len;
            return a.at - b.at;
        });
        const taken = [];
        const found = [];
        pool.forEach(function (item) {
            const overlap = taken.some(function (t) {
                return !(item.at + item.len <= t.at || t.at + t.len <= item.at);
            });
            if (overlap) return;
            taken.push(item);
            found.push(item);
        });
        found.sort(function (a, b) { return a.at - b.at; });
        return found;
    }

    function cpBuildSplit(raw, hits) {
        const lines = String(raw || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const list = hits || [];
        const used = [];
        const rows = [];
        let lnL = 0;
        let lnR = 0;
        lines.forEach(function (line) {
            lnL += 1;
            const matched = cpHitsOnLine(line, list, used);
            if (!matched.length) {
                rows.push({
                    lnum: lnL,
                    ltext: line,
                    lhtml: cpEsc(line),
                    lkind: 'del',
                    rnum: '',
                    rtext: '',
                    rhtml: '',
                    rkind: 'empty'
                });
                return;
            }
            matched.forEach(function (item, j) {
                used[item.i] = 1;
                lnR += 1;
                const right = cpHitLine(item.hit);
                const rightHtml = '<span class="cp-lab">' + cpEsc(cpHitLabel(item.hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(item.hit.value) + '</span>';
                if (j === 0) {
                    rows.push({
                        lnum: lnL,
                        ltext: line,
                        lhtml: cpMarkInLine(line, item.hit.value),
                        lkind: 'del',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                } else {
                    rows.push({
                        lnum: '',
                        ltext: '',
                        lhtml: '',
                        lkind: 'empty',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                }
            });
        });
        list.forEach(function (hit, i) {
            if (used[i]) return;
            lnR += 1;
            const right = cpHitLine(hit);
            rows.push({
                lnum: '',
                ltext: '',
                lhtml: '',
                lkind: 'empty',
                rnum: lnR,
                rtext: right,
                rhtml: '<span class="cp-lab">' + cpEsc(cpHitLabel(hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(hit.value) + '</span>',
                rkind: 'add'
            });
        });
        return rows;
    }

    function cpDiffCell(kind, num, html, sign) {
        const empty = kind === 'empty';
        const cls = empty ? 'cp-empty' : (kind === 'add' ? 'cp-add' : (kind === 'del' ? 'cp-del' : 'cp-ctx'));
        const numHtml = empty || num === '' ? '' : String(num);
        const signHtml = empty ? '' : '<span class="cp-sign" aria-hidden="true">' + sign + '</span>';
        const body = empty ? '' : '<span class="cp-line">' + (html || '') + '</span>';
        return '<td class="cp-num ' + cls + '">' + numHtml + '</td>' +
            '<td class="cp-signcol ' + cls + '">' + signHtml + '</td>' +
            '<td class="cp-code ' + cls + '">' + body + '</td>';
    }

    function cpCounts(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        let plus = 0;
        let minus = 0;
        rows.forEach(function (row) {
            if (row.lkind === 'del') minus += 1;
            if (row.rkind === 'add') plus += 1;
        });
        return { plus: plus, minus: minus, rows: rows };
    }

    function cpGutterText(raw) {
        const n = Math.max(1, String(raw || '').split('\n').length);
        let out = '';
        for (let i = 1; i <= n; i++) out += i + '\n';
        return out;
    }

    function renderEditor(file) {
        const i = file && file._i != null ? file._i : 0;
        const raw = String(file.raw || '');
        return '<div class="cp-editor-shell">' +
            '<pre class="cp-editor-gutter" aria-hidden="true">' + cpGutterText(raw) + '</pre>' +
            '<textarea class="cp-editor" data-cp-file="' + i + '" spellcheck="false" placeholder="Type or paste. Identifiers show on the right." aria-label="Edit ' + cpEsc(file.name || 'untitled.txt') + '">' +
            cpEsc(raw) + '</textarea></div>';
    }

    function renderStrippedBody(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) {
            return row.rkind === 'add';
        });
        if (!rows.length) {
            return '<div class="cp-strip-row cp-strip-empty">' +
                '<div class="cp-num cp-empty"></div><div class="cp-signcol cp-empty"></div>' +
                '<div class="cp-code cp-empty">No names, accounts, dates, or other identifiers in this file.</div></div>';
        }
        return rows.map(function (row, i) {
            return '<div class="cp-strip-row" style="--cp-i:' + i + '">' +
                '<div class="cp-num cp-add">' + row.rnum + '</div>' +
                '<div class="cp-signcol cp-add"><span class="cp-sign" aria-hidden="true">+</span></div>' +
                '<div class="cp-code cp-add"><span class="cp-line">' + (row.rhtml || '') + '</span></div>' +
                '</div>';
        }).join('');
    }

    function cpPaneCopySvg() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="13" rx="1.6"/><path d="M5 15V5a1.6 1.6 0 0 1 1.6-1.6H15"/></svg>';
    }

    function cpPaneLabel(file, side, label) {
        const i = file && file._i != null ? file._i : 0;
        const tip = 'Copy ' + label.toLowerCase();
        return '<div class="cp-pane-label">' +
            '<span class="cp-th-pip" aria-hidden="true"></span>' +
            '<span class="cp-pane-name">' + label + '</span>' +
            '<button type="button" class="cp-ico cp-pane-copy" data-cp-pane-copy="' + side + '" data-cp-file="' + i + '" data-tip="' + tip + '" aria-label="' + tip + '">' +
            cpPaneCopySvg() + '</button></div>';
    }

    function renderStrippedTable(file) {
        return cpPaneLabel(file, 'stripped', 'Stripped') +
            '<div class="cp-strip-rows">' + renderStrippedBody(file) + '</div>';
    }

    function renderSplitDiff(file) {
        const i = file && file._i != null ? file._i : 0;
        const c = cpCounts(file);
        return '<section class="cp-diff" data-cp-card="' + i + '" style="--cp-split:' + harvesterSplitPct() + '%" aria-label="Split view">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span></span>') +
            '<div class="cp-diff-body">' +
            '<div class="cp-orig-pane">' +
            cpPaneLabel(file, 'original', 'Original') +
            renderEditor(file) + '</div>' +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div>' +
            '<div class="cp-split-gutter" role="separator" aria-orientation="vertical" aria-label="Resize original and stripped" title="Drag to resize" aria-valuemin="22" aria-valuemax="78" aria-valuenow="' + Math.round(harvesterSplitPct()) + '" tabindex="0"></div>' +
            '</div></section>';
    }

    function cpFileChrome(file, statHtml) {
        const i = file && file._i != null ? file._i : 0;
        return '<header class="cp-diff-head">' +
            '<label class="cp-diff-file">' +
            '<svg class="cp-file-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4.5 1.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V6.207a1.5 1.5 0 0 0-.44-1.06L9.854 2.44A1.5 1.5 0 0 0 8.793 2H4.5v-.5ZM4 3a.5.5 0 0 1 .5-.5H8v2.5A1.5 1.5 0 0 0 9.5 6.5H12V13a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 13V3Zm8.146 2.5H9.5a.5.5 0 0 1-.5-.5V2.854L12.146 5.5Z"/></svg>' +
            '<input class="cp-file-name" data-cp-name="' + i + '" value="' + cpEsc(file.name || 'untitled.txt') + '" spellcheck="false" aria-label="File name"></label>' +
            '<span class="cp-diff-actions">' +
            '<button type="button" class="cp-copy-btn" data-cp-copy="' + i + '">Copy</button>' +
            (statHtml || '') +
            '</span></header>';
    }

    function cpMarkHitsInLine(line, matched) {
        const src = String(line || '');
        if (!matched.length) return cpEsc(src);
        const marks = matched.slice().sort(function (a, b) { return a.at - b.at; });
        let html = '';
        let cursor = 0;
        marks.forEach(function (item) {
            if (item.at < cursor) return;
            if (item.at > cursor) html += cpEsc(src.slice(cursor, item.at));
            html += '<span class="cp-keep">' + cpEsc(src.slice(item.at, item.at + item.len)) + '</span>';
            cursor = item.at + item.len;
        });
        if (cursor < src.length) html += cpEsc(src.slice(cursor));
        return html;
    }

    function renderOriginalDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const lines = String(file.raw || '').split('\n').length;
        return '<section class="cp-diff is-single is-original" data-cp-card="' + i + '" aria-label="Original document">' +
            cpFileChrome(file, '<span class="cp-diff-stat">' + lines + (lines === 1 ? ' line' : ' lines') + '</span>') +
            '<div class="cp-orig-pane">' +
            cpPaneLabel(file, 'original', 'Original') +
            renderEditor(file) + '</div></section>';
    }

    function renderStrippedDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) { return row.rkind === 'add'; });
        return '<section class="cp-diff is-single is-stripped" data-cp-card="' + i + '" aria-label="Stripped document">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + rows.length + '</span></span>') +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div></section>';
    }

    function renderHarvesterFile(file, i) {
        if (file) file._i = i;
        const view = harvesterView();
        if (view === 'original') return renderOriginalDoc(file);
        if (view === 'stripped') return renderStrippedDoc(file);
        return renderSplitDiff(file);
    }

    function renderHarvester(opts) {
        const drop = $('harvesterDrop');
        const result = $('harvesterResult');
        const st = harvesterState();
        harvesterSummary();
        if (!drop || !result) return;
        if (!st.ready || !(st.files || []).length) {
            drop.hidden = false;
            result.hidden = true;
            result.innerHTML = '';
            return;
        }
        drop.hidden = true;
        result.hidden = false;
        const reveal = cpReveal && !reduceMotion();
        cpReveal = false;
        const slide = opts && opts.slide && !reduceMotion() && !reveal;
        const slideClass = slide ? (opts.slide > 0 ? ' cp-slide-next' : ' cp-slide-prev') : '';
        result.innerHTML = '<div class="cp-stack' + (reveal ? ' cp-in' : '') + slideClass + '">' + (st.files || []).map(renderHarvesterFile).join('') + '</div>';
        if (reveal) {
            result.querySelectorAll('.cp-strip-row').forEach(function (row, i) {
                row.style.setProperty('--cp-i', String(i));
            });
        }
        applyHarvesterSplit(harvesterSplitPct(), false);
    }

    function syncHarvesterGutter(ta) {
        if (!ta) return;
        const g = ta.parentNode && ta.parentNode.querySelector('.cp-editor-gutter');
        if (!g) return;
        const next = cpGutterText(ta.value);
        if (g.textContent !== next) g.textContent = next;
        g.scrollTop = ta.scrollTop;
    }

    function patchHarvesterCard(index) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        file._i = index;
        const card = document.querySelector('[data-cp-card="' + index + '"]');
        if (!card) return;
        const view = harvesterView();
        const stat = card.querySelector('.cp-diff-stat');
        if (view === 'original') {
            const lines = String(file.raw || '').split('\n').length;
            if (stat) stat.textContent = lines + (lines === 1 ? ' line' : ' lines');
            return;
        }
        const c = cpCounts(file);
        if (view === 'stripped') {
            if (stat) stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span>';
        } else if (stat) {
            stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span>';
        }
        const body = card.querySelector('.cp-strip-rows');
        if (body) body.innerHTML = renderStrippedBody(file);
    }

    function applyHarvesterEdit(index, raw) {
        const st = harvesterState();
        const prev = st.files && st.files[index];
        if (!prev) return;
        let text = String(raw == null ? '' : raw);
        if (text.length > CP_MAX) text = text.slice(0, CP_MAX);
        if (prev.raw === text) {
            patchHarvesterCard(index);
            return;
        }
        const next = harvestOne({ name: prev.name, type: prev.kind, size: text.length }, text);
        next.id = prev.id;
        next.kind = prev.kind || next.kind;
        next.name = prev.name;
        st.files[index] = next;
        st.hits = mergeHarvesterHits(st.files);
        st.at = new Date().toISOString();
        patchHarvesterCard(index);
        schedulePersist();
    }

    function onHarvesterEditorInput(ta) {
        const i = parseInt(ta.getAttribute('data-cp-file'), 10);
        if (isNaN(i)) return;
        syncHarvesterGutter(ta);
        clearTimeout(cpEditTimers[i]);
        cpEditTimers[i] = setTimeout(function () {
            applyHarvesterEdit(i, ta.value);
        }, 160);
    }

    function renameHarvesterFile(index, name) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        let next = String(name || '').trim() || 'untitled.txt';
        if (next.length > 120) next = next.slice(0, 120);
        if (file.name === next) return;
        file.name = next;
        st.at = new Date().toISOString();
        schedulePersist();
    }

    function newHarvesterFile(raw) {
        if (cpBusy) return;
        const text = String(raw || '');
        const harvested = harvestOne({ name: 'untitled.txt', type: 'text/plain', size: text.length }, text);
        const st = harvesterState();
        if (!Array.isArray(st.files)) st.files = [];
        st.files.push(harvested);
        st.hits = mergeHarvesterHits(st.files);
        st.ready = true;
        st.at = new Date().toISOString();
        if (st.view === 'stripped') st.view = 'split';
        hideHarvesterDownload();
        renderHarvester();
        schedulePersist();
        const editors = document.querySelectorAll('.cp-editor');
        const last = editors[editors.length - 1];
        if (last) {
            last.focus();
            const end = last.value.length;
            last.setSelectionRange(end, end);
        }
    }

    function readHarvesterFile(file) {
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

    function ingestHarvesterFiles(list) {
        const files = Array.prototype.slice.call(list || []).filter(Boolean);
        if (!files.length || cpBusy) return;
        hideHarvesterDownload();
        setHarvesterBusy(true, 'Harvesting', 'Keeping names, accounts, dates — cutting the rest…');
        const started = Date.now();
        Promise.all(files.map(function (file) {
            return readHarvesterFile(file).then(function (raw) { return harvestOne(file, raw); });
        })).then(function (harvested) {
            const wait = Math.max(0, 520 - (Date.now() - started));
            setTimeout(function () {
                const st = harvesterState();
                st.files = harvested;
                st.hits = mergeHarvesterHits(harvested);
                st.ready = true;
                st.at = new Date().toISOString();
                setHarvesterBusy(false);
                cpReveal = true;
                renderHarvester();
                schedulePersist();
                if (window.OrbINTDone) window.OrbINTDone('File harvested', 'Names, dates, and accounts from that file are on the desk. The rest of the file stays in the harvest view.');
            }, wait);
        }).catch(function (error) {
            setHarvesterBusy(false);
            const drop = $('harvesterDrop');
            if (drop) {
                const strong = drop.querySelector('strong');
                if (strong) strong.textContent = error.message || 'Could not harvest that file';
            }
        });
    }

    function openHarvesterPicker() {
        const input = $('harvesterFile');
        if (input) input.click();
    }

    function clearHarvester() {
        if (cpBusy) return;
        const st = harvesterState();
        if (!st.ready && !(st.files || []).length) return;
        hideHarvesterDownload();
        st.files = [];
        st.hits = [];
        st.ready = false;
        st.at = '';
        const input = $('harvesterFile');
        if (input) input.value = '';
        const drop = $('harvesterDrop');
        if (drop) {
            const strong = drop.querySelector('strong');
            if (strong) strong.textContent = 'Drop or write a file.';
        }
        renderHarvester();
        schedulePersist();
    }

