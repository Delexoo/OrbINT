/* Case File page */

    let dsLiveTimer = 0;
    let dsMarkup = '';
    let dsRevealed = new Set();
    let dsHidden = new Set();
    let dsRevealAll = false;

    function isRedactOpen(key) {
        if (dsRevealAll) return !dsHidden.has(key || '');
        return dsRevealed.has(key || '');
    }

    function paintDatasheetSpoilers() {
        const label = dsRevealAll ? 'Hide redacted' : 'Show redacted';
        const btn = $('dockSpoilers');
        if (btn) {
            btn.classList.toggle('is-on', !!dsRevealAll);
            btn.setAttribute('aria-pressed', dsRevealAll ? 'true' : 'false');
            btn.setAttribute('data-tip', label);
            btn.setAttribute('aria-label', label);
        }
        const phone = $('phoneSpoilers');
        if (phone) {
            phone.hidden = page !== 'datasheet';
            phone.textContent = label;
        }
    }

    function applyDatasheetSpoilers() {
        const view = $('datasheetView');
        if (view) {
            view.querySelectorAll('.ds-redact').forEach(function (btn) {
                const key = btn.getAttribute('data-redact') || '';
                btn.classList.toggle('is-open', isRedactOpen(key));
            });
        }
        paintDatasheetSpoilers();
    }

    function toggleDatasheetSpoilers() {
        dsRevealAll = !dsRevealAll;
        dsRevealed = new Set();
        dsHidden = new Set();
        applyDatasheetSpoilers();
        dsMarkup = '';
        renderDatasheet();
    }

    let dsOpening = null;
    let dsSuppressClick = false;

    function dsLocked() {
        return !!(host && host.readonly && host.readonly());
    }

    function dsSpec(row) {
        if (!row) return null;
        return {
            kind: row.getAttribute('data-ds-edit') || '',
            id: row.getAttribute('data-ds-id') || '',
            key: row.getAttribute('data-ds-key') || '',
            raw: row.getAttribute('data-ds-raw') || '',
            match: row.getAttribute('data-ds-match') || ''
        };
    }

    function dsPageIndex(page) {
        const view = $('datasheetView');
        if (!view || !page) return -1;
        return Array.prototype.indexOf.call(view.querySelectorAll('.ds-page'), page);
    }

    function dsFindRow(spec) {
        const view = $('datasheetView');
        if (!view || !spec) return null;
        const rows = view.querySelectorAll('[data-ds-edit]');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if ((row.getAttribute('data-ds-edit') || '') !== spec.kind) continue;
            if ((row.getAttribute('data-ds-id') || '') !== spec.id) continue;
            if ((row.getAttribute('data-ds-key') || '') !== spec.key) continue;
            if ((row.getAttribute('data-ds-match') || '') !== (spec.match || '')) continue;
            if (spec.raw && (row.getAttribute('data-ds-raw') || '') !== spec.raw) continue;
            return row;
        }
        return null;
    }

    function dsToggleRedact(btn) {
        const key = btn.getAttribute('data-redact') || '';
        const on = !btn.classList.contains('is-open');
        btn.classList.toggle('is-open', on);
        if (dsRevealAll) {
            if (on) dsHidden.delete(key);
            else dsHidden.add(key);
        } else if (on) dsRevealed.add(key);
        else dsRevealed.delete(key);
    }

    function dsChanged(next, show, raw) {
        if (next === show || next === raw) return false;
        if (!next && !show && !raw) return false;
        return true;
    }

    function dsApplyEdit(kind, id, key, raw, show, next, inputMatch) {
        if (!dsChanged(next, show, raw)) return;
        if (kind === 'case') {
            if (host && host.writeCaseField) host.writeCaseField(key, next);
            return;
        }
        if (kind === 'fact') {
            const match = inputMatch || raw;
            if (host && host.patchProfileFact) host.patchProfileFact(id, match, key === 'source' ? 'source' : 'value', next);
            return;
        }
        if (kind === 'note') {
            if (key === 'analysis') {
                if (host && host.writeAnalysis) host.writeAnalysis(next);
                return;
            }
            if (key === 'evidence') {
                const item = (data.evidence || [])[Number(id)];
                if (item) item.note = next;
                schedulePersist();
                return;
            }
            if (host && host.patchProfileFact) host.patchProfileFact(id || 'notes', raw, 'value', next);
            return;
        }
        if (kind === 'note-new') {
            if (next && host && host.addFact) host.addFact('notes', next);
            return;
        }
        if (kind === 'event') {
            const ev = (data.timeline || []).find(function (item) { return item && item.id === id; });
            if (!ev) return;
            if (key === 'body' && show !== raw) ev.moreNotes = [];
            ev[key] = next;
            schedulePersist();
            renderTimeline();
            return;
        }
        if (kind === 'board') {
            const node = ((data.whiteboard && data.whiteboard.nodes) || []).find(function (item) { return item && item.id === id; });
            if (!node) return;
            node[key] = next;
            schedulePersist();
            renderWhiteboard();
            return;
        }
        if (kind === 'pad') {
            const note = ((data.notepad && data.notepad.notes) || []).find(function (item) { return item && item.id === id; });
            if (!note) return;
            note[key] = next;
            if (key === 'body') note.html = '';
            schedulePersist();
            renderNotepad();
            return;
        }
        if (kind === 'harvest') {
            const hit = ((data.harvester && data.harvester.hits) || [])[Number(id)];
            if (!hit) return;
            hit[key] = next;
            schedulePersist();
            renderHarvester();
        }
    }

    function dsFinishEdit(nextOpen) {
        dsOpening = null;
        dsClearEditors();
        dsMarkup = '';
        renderDatasheet();
        if (!nextOpen) return;
        if (nextOpen.kind === 'note-new') {
            const pages = ($('datasheetView') || {}).querySelectorAll ? $('datasheetView').querySelectorAll('.ds-page') : [];
            dsOpenNote(pages[nextOpen.page], nextOpen.x, nextOpen.y);
            return;
        }
        const row = dsFindRow(nextOpen);
        if (row) dsOpenEditor(row);
    }

    function dsCommitEditor(input, cancel) {
        if (!input || input.dataset.dsDone) return;
        input.dataset.dsDone = '1';
        const kind = input.getAttribute('data-ds-kind') || '';
        const id = input.getAttribute('data-ds-id') || '';
        const key = input.getAttribute('data-ds-key') || '';
        const raw = input.getAttribute('data-ds-raw') || '';
        const show = input.getAttribute('data-ds-show') || '';
        const multiline = input.tagName === 'TEXTAREA';
        const next = multiline
            ? String(input.value || '').replace(/\s+$/g, '').replace(/^\s+/g, '')
            : String(input.value || '').replace(/\s+/g, ' ').trim();
        const match = input.getAttribute('data-ds-match') || '';
        const hold = cancel ? null : dsOpening;
        dsOpening = null;
        if (input.parentNode) input.remove();
        if (!cancel) dsApplyEdit(kind, id, key, raw, show, next, match);
        dsFinishEdit(hold);
    }

    function dsClearEditors() {
        const view = $('datasheetView');
        if (!view) return;
        view.querySelectorAll('.ds-inline, .ds-status-edit').forEach(function (el) { el.remove(); });
    }

    function dsPlaceCaret(input) {
        input.focus();
        const n = input.value.length;
        if (input.setSelectionRange) input.setSelectionRange(n, n);
    }

    function dsBindEditor(input) {
        input.addEventListener('mousedown', function (event) { event.stopPropagation(); });
        input.addEventListener('click', function (event) { event.stopPropagation(); });
        input.addEventListener('blur', function () { dsCommitEditor(input, false); });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                dsOpening = null;
                dsCommitEditor(input, true);
                return;
            }
            if (event.key === 'Enter' && (input.tagName !== 'TEXTAREA' || !event.shiftKey)) {
                event.preventDefault();
                input.blur();
            }
        });
    }

    function dsOpenEditor(row) {
        if (!row || dsLocked() || row.querySelector('.ds-inline, .ds-status-edit')) return;
        const kind = row.getAttribute('data-ds-edit') || '';
        const key = row.getAttribute('data-ds-key') || '';
        if (kind === 'case' && key === 'status') {
            dsOpenStatus(row);
            return;
        }
        const show = row.getAttribute('data-ds-show') || '';
        const raw = row.getAttribute('data-ds-raw') || '';
        const multiline = kind === 'note' || show.indexOf('\n') >= 0 || raw.indexOf('\n') >= 0;
        const input = document.createElement(multiline ? 'textarea' : 'input');
        input.className = 'ds-inline';
        if (!multiline) {
            input.type = 'text';
            if (kind === 'case' && key === 'number') input.maxLength = 48;
            if (kind === 'case' && key === 'offense') input.maxLength = 80;
            if (kind === 'case' && key === 'investigator') input.maxLength = 48;
            if (kind !== 'case') input.maxLength = 4000;
        } else input.maxLength = 4000;
        input.spellcheck = false;
        input.autocomplete = 'off';
        input.placeholder = show || raw ? '' : '--';
        input.value = show || raw;
        input.setAttribute('data-ds-kind', kind);
        input.setAttribute('data-ds-id', row.getAttribute('data-ds-id') || '');
        input.setAttribute('data-ds-key', key);
        input.setAttribute('data-ds-raw', raw);
        input.setAttribute('data-ds-show', show);
        input.setAttribute('data-ds-match', row.getAttribute('data-ds-match') || '');
        const label = row.querySelector('.ds-fill-k');
        if (label) input.setAttribute('aria-label', label.textContent || 'Edit');
        row.classList.add('is-editing');
        if (row.classList.contains('ds-note')) {
            row.textContent = '';
            row.appendChild(input);
        } else {
            const slot = row.querySelector('.ds-fill-v');
            if (!slot) return;
            slot.textContent = '';
            slot.appendChild(input);
        }
        dsBindEditor(input);
        dsPlaceCaret(input);
    }

    function dsOpenStatus(row) {
        const slot = row.querySelector('.ds-fill-v');
        if (!slot) return;
        const current = row.getAttribute('data-ds-raw') || 'open';
        const choices = [['open', 'Open'], ['inactive', 'Inactive'], ['closed', 'Closed']];
        const bar = document.createElement('span');
        bar.className = 'ds-status-edit';
        bar.addEventListener('mousedown', function (event) { event.stopPropagation(); });
        choices.forEach(function (pair) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = pair[1];
            if (pair[0] === current) btn.className = 'is-on';
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                dsOpening = null;
                if (host && host.writeCaseField) host.writeCaseField('status', pair[0]);
                dsFinishEdit(null);
            });
            bar.appendChild(btn);
        });
        row.classList.add('is-editing');
        slot.textContent = '';
        slot.appendChild(bar);
    }

    function dsOpenNote(page, clientX, clientY) {
        if (!page || dsLocked() || page.querySelector('.ds-inline')) return;
        const input = document.createElement('textarea');
        input.className = 'ds-inline ds-inline-note';
        input.maxLength = 4000;
        input.rows = 2;
        input.spellcheck = false;
        input.placeholder = 'Add to the record';
        input.setAttribute('aria-label', 'Add to the record');
        input.setAttribute('data-ds-kind', 'note-new');
        const rect = page.getBoundingClientRect();
        const scale = rect.width / (page.offsetWidth || 612) || 1;
        const localX = Number.isFinite(clientX) ? (clientX - rect.left) / scale : 72;
        const localY = Number.isFinite(clientY) ? (clientY - rect.top) / scale : 120;
        const left = Math.max(72, Math.min(localX, 430));
        const top = Math.max(86, Math.min(localY, 700));
        input.style.left = left + 'px';
        input.style.top = top + 'px';
        input.style.width = Math.max(140, 540 - left) + 'px';
        page.appendChild(input);
        dsBindEditor(input);
        input.focus();
    }

    function dsPaperTarget(event) {
        const page = event.target.closest('.ds-page');
        if (!page) return null;
        if (event.target.closest('.ds-headband, .ds-footband, .ds-cover, .ds-close, .ds-h, .ds-redact-photo, .ds-fill, .ds-item, .ds-meta, .ds-pair, .ds-case, .ds-p, .ds-cap')) return null;
        if (page.classList.contains('is-first') || page.classList.contains('is-close-page')) return null;
        return page;
    }

    function bindDatasheet() {
        const view = $('datasheetView');
        if (view && !view.dataset.redactBound) {
            view.dataset.redactBound = '1';
            view.addEventListener('mousedown', function (event) {
                if (event.button !== 0) return;
                const inline = view.querySelector('.ds-inline');
                const status = view.querySelector('.ds-status-edit');
                if (!inline && !status) return;
                if (event.target.closest('.ds-inline, .ds-status-edit')) return;
                const row = event.target.closest('[data-ds-edit]');
                const page = dsPaperTarget(event);
                dsSuppressClick = true;
                if (row) dsOpening = dsSpec(row);
                else if (page) dsOpening = { kind: 'note-new', page: dsPageIndex(page), x: event.clientX, y: event.clientY };
                else dsOpening = null;
                if (inline) return;
                dsFinishEdit(dsOpening);
            });
            view.addEventListener('click', function (event) {
                if (dsSuppressClick) {
                    dsSuppressClick = false;
                    return;
                }
                if (event.target.closest('.ds-inline, .ds-status-edit')) return;
                const photo = event.target.closest('.ds-redact-photo');
                if (photo) {
                    event.preventDefault();
                    dsToggleRedact(photo);
                    return;
                }
                const row = event.target.closest('[data-ds-edit]');
                if (row) {
                    event.preventDefault();
                    dsOpenEditor(row);
                    return;
                }
                const page = dsPaperTarget(event);
                if (!page) return;
                event.preventDefault();
                dsOpenNote(page, event.clientX, event.clientY);
            });
        }
        const dockBtn = $('dockSpoilers');
        if (dockBtn && !dockBtn.dataset.boundSpoilers) {
            dockBtn.dataset.boundSpoilers = '1';
            dockBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        const phoneBtn = $('phoneSpoilers');
        if (phoneBtn && !phoneBtn.dataset.boundSpoilers) {
            phoneBtn.dataset.boundSpoilers = '1';
            phoneBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        paintDatasheetSpoilers();
    }

    function renderDatasheet() {
        const view = $('datasheetView');
        if (!view) return;
        bindDatasheet();
        view.classList.toggle('is-locked', dsLocked());
        if (view.querySelector('.ds-inline, .ds-status-edit')) {
            dsMarkup = '';
            return;
        }
        const html = reportPreviewMarkup();
        if (html === dsMarkup && view.firstChild) {
            sizeDatasheet();
            applyDatasheetSpoilers();
            return;
        }
        dsMarkup = html;
        const y = view.scrollTop;
        view.innerHTML = html;
        applyDatasheetSpoilers();
        sizeDatasheet();
        view.scrollTop = y;
        requestAnimationFrame(function () {
            sizeDatasheet();
            view.scrollTop = y;
        });
    }

    function scheduleDatasheet() {
        if (page !== 'datasheet') return;
        clearTimeout(dsLiveTimer);
        dsLiveTimer = setTimeout(function () {
            dsLiveTimer = 0;
            renderDatasheet();
        }, 60);
    }
