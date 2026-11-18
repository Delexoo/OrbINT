/* Notepad model and note menus */

    let noteLinkFrom = '';
    let noteShiftIds = [];
    let noteDrag = null;
    let notePan = null;
    let noteBodies = {};
    let noteDotEls = {};
    let noteLineEls = {};
    let noteSimOn = false;
    let noteSimCalm = 0;
    let noteSimSize = null;
    let noteGraphSig = '';

    function setNoteTip(picking) {
        const tip = $('noteLinkHint');
        if (!tip) return;
        tip.classList.toggle('is-armed', !!picking);
        let touch = false;
        try {
            touch = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
        } catch (error) {}
        if (picking) {
            tip.textContent = touch ? 'Tap another note to link' : 'Click another note to link';
            return;
        }
        tip.innerHTML = touch
            ? 'Tap Link, then another note.'
            : 'Hold <kbd>Shift</kbd> and click notes to link. Middle-click to pan.';
    }

    function linkNoteIntoShift(id) {
        if (!id || !noteById(id)) return;
        if (noteLinkFrom) {
            noteLinkFrom = '';
            setNoteTip(false);
        }
        if (noteShiftIds.indexOf(id) === -1) {
            noteShiftIds.forEach(function (other) { addNoteLink(other, id); });
            noteShiftIds.push(id);
        }
        notepadState().active = id;
        renderNotepad();
        const tip = $('noteLinkHint');
        if (tip) tip.classList.add('is-armed');
    }

    function normalizeNote(note) {
        const rec = note && typeof note === 'object' ? note : {};
        const created = rec.created || rec.updated || '';
        return {
            id: rec.id || uid('note'),
            title: String(rec.title || '').slice(0, 80),
            body: String(rec.body || ''),
            html: String(rec.html || '').slice(0, 200000),
            created: created,
            updated: rec.updated || created
        };
    }

    function normalizeNoteLink(link) {
        const rec = link && typeof link === 'object' ? link : {};
        const from = String(rec.from || '');
        const to = String(rec.to || '');
        if (!from || !to || from === to) return { id: '', from: '', to: '' };
        return { id: rec.id || uid('nlink'), from: from, to: to };
    }

    function normalizeNoteLayout(layout) {
        const next = {};
        if (!layout || typeof layout !== 'object') return next;
        Object.keys(layout).forEach(function (id) {
            const spot = layout[id];
            const x = Number(spot && spot.x);
            const y = Number(spot && spot.y);
            if (!isFinite(x) || !isFinite(y)) return;
            next[id] = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
        });
        return next;
    }

    function noteNow() {
        return new Date().toISOString();
    }

    function noteWhen(note) {
        const raw = (note && (note.updated || note.created)) || '';
        const date = new Date(raw);
        if (!raw || isNaN(date.getTime())) return '';
        return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }

    function blankNote() {
        const now = noteNow();
        return { id: uid('note'), title: '', body: '', created: now, updated: now };
    }

    function notepadState() {
        if (!data.notepad || typeof data.notepad !== 'object') data.notepad = { notes: [], active: '', links: [], layout: {}, pan: { x: 0, y: 0 } };
        if (!Array.isArray(data.notepad.notes)) data.notepad.notes = [];
        if (!Array.isArray(data.notepad.links)) data.notepad.links = [];
        if (!data.notepad.layout || typeof data.notepad.layout !== 'object') data.notepad.layout = {};
        if (!data.notepad.pan || typeof data.notepad.pan !== 'object') data.notepad.pan = { x: 0, y: 0 };
        data.notepad.pan.x = Number(data.notepad.pan.x) || 0;
        data.notepad.pan.y = Number(data.notepad.pan.y) || 0;
        return data.notepad;
    }

    function noteById(id) {
        return notepadState().notes.filter(function (note) { return note.id === id; })[0] || null;
    }

    function noteTitleText(note) {
        return (note && note.title && note.title.trim()) || 'Untitled';
    }

    function notePreview(note) {
        const text = String(note.body || '').replace(/\s+/g, ' ').trim();
        const when = noteWhen(note);
        const bit = text ? text.slice(0, 42) : 'Empty note';
        return when ? when + ' · ' + bit : bit;
    }

    function noteHasLink(from, to) {
        return notepadState().links.some(function (link) {
            return (link.from === from && link.to === to) || (link.from === to && link.to === from);
        });
    }

    function closeNoteMenu() {
        const menu = $('noteMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
    }

    function cancelNoteLink() {
        noteLinkFrom = '';
        const cancel = $('noteLinkCancel');
        const go = $('noteLinkGo');
        if (cancel) cancel.hidden = true;
        if (go) go.classList.remove('is-on');
        setNoteTip(false);
        paintNoteGraph();
    }

    function startNoteLink(id) {
        const note = noteById(id);
        if (!note) return;
        noteLinkFrom = id;
        noteShiftIds = [];
        notepadState().active = id;
        const cancel = $('noteLinkCancel');
        const go = $('noteLinkGo');
        if (cancel) cancel.hidden = false;
        if (go) go.classList.add('is-on');
        setNoteTip(true);
        renderNotepad();
    }

    function addNoteLink(from, to) {
        if (!from || !to || from === to || noteHasLink(from, to)) return;
        if (!noteById(from) || !noteById(to)) return;
        notepadState().links.push({ id: uid('nlink'), from: from, to: to });
        schedulePersist();
    }

    function deleteNote(id) {
        const state = notepadState();
        state.notes = state.notes.filter(function (note) { return note.id !== id; });
        state.links = state.links.filter(function (link) { return link.from !== id && link.to !== id; });
        if (state.layout) delete state.layout[id];
        if (state.active === id) state.active = state.notes.length ? state.notes[0].id : '';
        if (noteLinkFrom === id) noteLinkFrom = '';
        noteShiftIds = noteShiftIds.filter(function (item) { return item !== id; });
        closeNoteMenu();
        renderNotepad();
        schedulePersist();
    }

    function noteActRow(act, label, attrs, danger) {
        return '<button type="button" role="menuitem" data-note-act="' + act + '"' + (attrs || '') + (danger ? ' class="is-danger"' : '') + '><span>' + esc(label) + '</span></button>';
    }

    function noteMenuHtml(noteId) {
        const links = notepadState().links.filter(function (link) { return link.from === noteId || link.to === noteId; });
        let html = '<p>Note</p>' +
            noteActRow('rename', 'Rename') +
            noteActRow('edit', 'Edit') +
            noteActRow('link', 'Link');
        links.forEach(function (link) {
            const otherId = link.from === noteId ? link.to : link.from;
            html += noteActRow('unlink', 'Unlink ' + noteTitleText(noteById(otherId)), ' data-link="' + esc(link.id) + '"');
        });
        html += '<hr>' + noteActRow('delete', 'Delete', '', true);
        return html;
    }

    function fillNoteMenu(html, noteId, fieldId) {
        const menu = $('noteMenu');
        if (!menu) return null;
        hideFieldMenu();
        menu.innerHTML = html;
        menu.dataset.note = noteId || '';
        menu.dataset.field = fieldId || '';
        return menu;
    }

    function openNoteMenu(noteId, anchor) {
        const note = noteById(noteId);
        const menu = note && anchor ? fillNoteMenu(noteMenuHtml(noteId), noteId, '') : null;
        if (!menu) return;
        menu.hidden = false;
        const rect = anchor.getBoundingClientRect();
        const width = menu.offsetWidth || 196;
        placeAppMenu(menu, rect.right - width, rect.bottom + 4);
    }

    function openNoteMenuAt(noteId, x, y) {
        if (!noteById(noteId)) return;
        const menu = fillNoteMenu(noteMenuHtml(noteId), noteId, '');
        if (menu) placeAppMenu(menu, x, y);
    }

    function openNoteEditMenu(field, x, y) {
        if (!field) return;
        armFieldEdit(field);
        const note = noteById(notepadState().active);
        let html = fieldEditRows(field);
        if (note) html += '<hr>' + noteActRow('delete', 'Delete note', '', true);
        const menu = fillNoteMenu(html, note ? note.id : '', field.id || '');
        if (menu) placeAppMenu(menu, x, y);
    }

    function openNoteCreateMenu(x, y) {
        const menu = fillNoteMenu('<p>Notepad</p>' + noteActRow('new', 'New note'), '', '');
        if (menu) placeAppMenu(menu, x, y);
    }

