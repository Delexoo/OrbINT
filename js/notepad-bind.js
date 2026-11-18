/* Notepad pointer binding and pane split */
    function bindNotepad() {
        const list = $('noteList');
        const title = $('noteTitle');
        const body = $('noteBody');
        const add = $('noteNew');
        const menu = $('noteMenu');
        const stage = $('noteGraph');
        const view = $('noteView');
        const linkGo = $('noteLinkGo');
        const linkCancel = $('noteLinkCancel');
        if (add) add.addEventListener('click', addNotepadNote);
        if (list) {
            list.addEventListener('click', function (event) {
                const more = event.target.closest('[data-note-more]');
                const row = event.target.closest('[data-note]');
                if (!row) return;
                const id = row.getAttribute('data-note') || '';
                if (event.shiftKey && !more) {
                    event.preventDefault();
                    linkNoteIntoShift(id);
                    return;
                }
                notepadState().active = id;
                if (more) {
                    event.stopPropagation();
                    renderNotepad();
                    const anchor = document.querySelector('#noteList [data-note="' + id + '"] [data-note-more]');
                    openNoteMenu(id, anchor);
                    return;
                }
                closeNoteMenu();
                renderNotepad();
            });
            list.addEventListener('keydown', function (event) {
                const row = event.target.closest('[data-note]');
                if (!row || (event.key !== 'Enter' && event.key !== ' ')) return;
                if (event.target.closest('[data-note-more]')) return;
                event.preventDefault();
                notepadState().active = row.getAttribute('data-note') || '';
                closeNoteMenu();
                renderNotepad();
            });
        }
        if (menu) {
            menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
            menu.addEventListener('click', function (event) {
                const fieldBtn = event.target.closest('[data-field-act]');
                if (fieldBtn) {
                    if (fieldBtn.disabled) return;
                    const field = document.getElementById(menu.dataset.field || '');
                    const act = fieldBtn.getAttribute('data-field-act');
                    closeNoteMenu();
                    if (field) runFieldEdit(field, act);
                    return;
                }
                const button = event.target.closest('[data-note-act]');
                if (!button) return;
                runNoteAction(button.getAttribute('data-note-act'), menu.dataset.note || '', button.getAttribute('data-link') || '');
            });
        }
        if (view) {
            view.addEventListener('contextmenu', function (event) {
                const field = event.target.closest('#noteTitle, #noteBody');
                if (field && field.id === 'noteBody' && noteBodySelection()) {
                    openNoteFormat(event.clientX, event.clientY);
                    return;
                }
                if (field) {
                    openNoteEditMenu(field, event.clientX, event.clientY);
                    return;
                }
                const row = event.target.closest('#noteList [data-note]');
                if (row) {
                    const id = row.getAttribute('data-note') || '';
                    notepadState().active = id;
                    renderNotepad();
                    openNoteMenuAt(id, event.clientX, event.clientY);
                    return;
                }
                const dot = event.target.closest('[data-graph-note]');
                if (dot) {
                    const id = dot.getAttribute('data-graph-note') || '';
                    notepadState().active = id;
                    renderNotepad();
                    openNoteMenuAt(id, event.clientX, event.clientY);
                    return;
                }
                openNoteCreateMenu(event.clientX, event.clientY);
            });
        }
        document.addEventListener('click', function (event) {
            if (event.target.closest('#noteMenu') || event.target.closest('#noteFormat') || event.target.closest('#noteLinePlus') || event.target.closest('[data-note-more]')) return;
            closeNoteMenu();
            closeNoteFormat();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Shift') {
                const tip = $('noteLinkHint');
                if (tip && !noteLinkFrom) tip.classList.add('is-armed');
            }
            if (event.key !== 'Escape') return;
            closeNoteMenu();
            closeNoteFormat();
            if (noteLinkFrom) cancelNoteLink();
        });
        document.addEventListener('keyup', function (event) {
            if (event.key !== 'Shift') return;
            const tip = $('noteLinkHint');
            if (tip && !noteLinkFrom) tip.classList.remove('is-armed');
            if (!noteShiftIds.length) return;
            noteShiftIds = [];
            renderNotepad();
        });
        if (title) title.addEventListener('input', writeActiveNote);
        if (body) body.addEventListener('input', writeActiveNote);
        if (linkGo) {
            linkGo.addEventListener('click', function () {
                if (noteLinkFrom) {
                    cancelNoteLink();
                    return;
                }
                const state = notepadState();
                const id = state.active || (state.notes[0] && state.notes[0].id) || '';
                if (id) startNoteLink(id);
            });
        }
        if (linkCancel) linkCancel.addEventListener('click', cancelNoteLink);
        if (stage) {
            function stopNoteAutoscroll(event) {
                if (event.button === 1) event.preventDefault();
            }
            stage.addEventListener('mousedown', stopNoteAutoscroll, true);
            stage.addEventListener('auxclick', stopNoteAutoscroll);
            stage.addEventListener('pointerdown', function (event) {
                if (event.button === 1) {
                    event.preventDefault();
                    notePan = { x: event.clientX, y: event.clientY, pointer: event.pointerId, moved: false };
                    stage.classList.add('is-panning');
                    try { stage.setPointerCapture(event.pointerId); } catch (error) {}
                    return;
                }
                if (event.button !== 0) return;
                if (event.target.closest('[data-note-edge]')) return;
                const dot = event.target.closest('[data-graph-note]');
                if (!dot) {
                    if (noteLinkFrom) cancelNoteLink();
                    return;
                }
                const id = dot.getAttribute('data-graph-note') || '';
                if (event.shiftKey) {
                    linkNoteIntoShift(id);
                    return;
                }
                if (noteLinkFrom) {
                    if (noteLinkFrom !== id) addNoteLink(noteLinkFrom, id);
                    cancelNoteLink();
                    notepadState().active = id;
                    renderNotepad();
                    return;
                }
                noteDrag = { id: id, x: event.clientX, y: event.clientY, vx: 0, vy: 0, moved: false, pointer: event.pointerId };
                stage.classList.add('is-dragging');
                try { stage.setPointerCapture(event.pointerId); } catch (error) {}
            });
            stage.addEventListener('pointermove', function (event) {
                if (notePan && notePan.pointer === event.pointerId) {
                    const dx = event.clientX - notePan.x;
                    const dy = event.clientY - notePan.y;
                    if (!notePan.moved && Math.hypot(dx, dy) < 3) return;
                    notePan.moved = true;
                    notePan.x = event.clientX;
                    notePan.y = event.clientY;
                    const pan = notepadState().pan;
                    pan.x += dx;
                    pan.y += dy;
                    const cam = stage.querySelector('[data-note-cam]');
                    if (cam) cam.setAttribute('transform', 'translate(' + pan.x + ' ' + pan.y + ')');
                    return;
                }
                if (!noteDrag || noteDrag.pointer !== event.pointerId) return;
                const dx = event.clientX - noteDrag.x;
                const dy = event.clientY - noteDrag.y;
                if (!noteDrag.moved && Math.hypot(dx, dy) < 4) return;
                noteDrag.moved = true;
                noteDrag.x = event.clientX;
                noteDrag.y = event.clientY;
                const body = noteBodies[noteDrag.id];
                const rect = stage.getBoundingClientRect();
                const pan = notepadState().pan;
                if (!body) return;
                const x = event.clientX - rect.left - pan.x;
                const y = event.clientY - rect.top - pan.y;
                noteDrag.vx = x - body.x;
                noteDrag.vy = y - body.y;
                body.x = x;
                body.y = y;
                noteSimStart();
            });
            stage.addEventListener('pointerup', function (event) {
                if (notePan && notePan.pointer === event.pointerId) {
                    const moved = notePan.moved;
                    notePan = null;
                    stage.classList.remove('is-panning');
                    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
                    if (moved) schedulePersist();
                    return;
                }
                if (!noteDrag || noteDrag.pointer !== event.pointerId) return;
                const drag = noteDrag;
                const body = noteBodies[drag.id];
                noteDrag = null;
                stage.classList.remove('is-dragging');
                if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
                if (!drag.moved) {
                    notepadState().active = drag.id;
                    renderNotepad();
                    return;
                }
                if (body) {
                    body.vx = drag.vx || 0;
                    body.vy = drag.vy || 0;
                }
                noteStoreLayout();
                schedulePersist();
                noteSimStart();
            });
            stage.addEventListener('pointercancel', function () {
                noteDrag = null;
                notePan = null;
                stage.classList.remove('is-dragging');
                stage.classList.remove('is-panning');
            });
            stage.addEventListener('click', function (event) {
                const edge = event.target.closest('[data-note-edge]');
                if (!edge) return;
                const id = edge.getAttribute('data-note-edge') || '';
                const state = notepadState();
                state.links = state.links.filter(function (link) { return link.id !== id; });
                paintNoteGraph();
                schedulePersist();
            });
            if (window.ResizeObserver) {
                const watcher = new ResizeObserver(function () {
                    if (!noteDrag) paintNoteGraph();
                });
                watcher.observe(stage);
            }
        }
        bindNoteSplit();
    }

    function notePaneNumber(view, name, fallback) {
        const n = parseFloat(view.style.getPropertyValue(name));
        return isFinite(n) ? n : fallback;
    }

    function notePaneSaved() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('orbint-note-panes') || '') || {}; } catch (error) {}
        const list = Number(saved.list);
        const graph = Number(saved.graph);
        return {
            list: isFinite(list) ? list : 220,
            graph: isFinite(graph) ? graph : 280
        };
    }

    function notePaneStore(list, graph) {
        try { localStorage.setItem('orbint-note-panes', JSON.stringify({ list: list, graph: graph })); } catch (error) {}
    }

    function applyNotePane(view, which, next) {
        const width = view.getBoundingClientRect().width;
        const narrow = window.innerWidth <= 1100;
        const listNow = notePaneNumber(view, '--note-list-w', 220);
        const graphNow = notePaneNumber(view, '--note-graph-w', 280);
        if (which === 'list') {
            const reserved = (narrow ? 12 : 24) + 220 + (narrow ? 0 : graphNow);
            const max = width > 40 ? Math.max(160, width - reserved) : 560;
            const list = Math.round(Math.min(max, Math.max(160, next)));
            view.style.setProperty('--note-list-w', list + 'px');
            const handle = view.querySelector('[data-note-split="list"]');
            if (handle) handle.setAttribute('aria-valuenow', String(list));
            return list;
        }
        const max = width > 40 ? Math.max(180, width - 24 - 220 - listNow) : 720;
        const graph = Math.round(Math.min(max, Math.max(180, next)));
        view.style.setProperty('--note-graph-w', graph + 'px');
        const handle = view.querySelector('[data-note-split="graph"]');
        if (handle) handle.setAttribute('aria-valuenow', String(graph));
        return graph;
    }

    function bindNoteSplit() {
        const view = $('noteView');
        if (!view) return;
        const saved = notePaneSaved();
        applyNotePane(view, 'list', saved.list);
        applyNotePane(view, 'graph', saved.graph);
        let drag = null;
        function finishNoteSplit() {
            if (!drag) return;
            drag.handle.classList.remove('is-on');
            document.body.classList.remove('note-splitting');
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
            drag = null;
        }
        view.addEventListener('pointerdown', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle || event.button || window.innerWidth <= 820) return;
            const which = handle.getAttribute('data-note-split');
            if (which === 'graph' && window.innerWidth <= 1100) return;
            event.preventDefault();
            drag = {
                which: which,
                handle: handle,
                x: event.clientX,
                size: notePaneNumber(view, which === 'list' ? '--note-list-w' : '--note-graph-w', which === 'list' ? 220 : 280)
            };
            handle.classList.add('is-on');
            document.body.classList.add('note-splitting');
            handle.setPointerCapture(event.pointerId);
        });
        view.addEventListener('pointermove', function (event) {
            if (!drag) return;
            const delta = event.clientX - drag.x;
            applyNotePane(view, drag.which, drag.which === 'list' ? drag.size + delta : drag.size - delta);
        });
        view.addEventListener('pointerup', finishNoteSplit);
        view.addEventListener('pointercancel', finishNoteSplit);
        view.addEventListener('dblclick', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle) return;
            const which = handle.getAttribute('data-note-split');
            applyNotePane(view, which, which === 'list' ? 220 : 280);
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
        });
        view.addEventListener('keydown', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle) return;
            const which = handle.getAttribute('data-note-split');
            const step = event.shiftKey ? 32 : 16;
            let delta = 0;
            if (event.key === 'ArrowLeft') delta = which === 'list' ? -step : step;
            else if (event.key === 'ArrowRight') delta = which === 'list' ? step : -step;
            else if (event.key === 'Home') {
                applyNotePane(view, which, which === 'list' ? 160 : 180);
                notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
                event.preventDefault();
                return;
            } else return;
            event.preventDefault();
            const current = notePaneNumber(view, which === 'list' ? '--note-list-w' : '--note-graph-w', which === 'list' ? 220 : 280);
            applyNotePane(view, which, current + delta);
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
        });
        if (window.ResizeObserver) {
            const panes = new ResizeObserver(function () {
                if (drag || view.hidden || !view.getBoundingClientRect().width) return;
                applyNotePane(view, 'list', notePaneNumber(view, '--note-list-w', 220));
                if (window.innerWidth > 1100) applyNotePane(view, 'graph', notePaneNumber(view, '--note-graph-w', 280));
            });
            panes.observe(view);
        }
    }

    bindNotepad();
