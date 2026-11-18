/* Notepad graph layout and simulation */
    function renderNotepad() {
        const list = $('noteList');
        const title = $('noteTitle');
        const body = $('noteBody');
        const empty = $('noteEmpty');
        if (!list || !title || !body) return;
        if (!noteLinkFrom) setNoteTip(false);
        const state = notepadState();
        if (!state.active || !state.notes.some(function (note) { return note.id === state.active; })) {
            state.active = state.notes.length ? state.notes[0].id : '';
        }
        list.innerHTML = state.notes.map(function (note) {
            const on = note.id === state.active;
            const shift = noteShiftIds.indexOf(note.id) >= 0;
            return '<div class="note-item' + (on ? ' is-on' : '') + (shift ? ' is-shift' : '') + '" role="option" tabindex="0" data-note="' + esc(note.id) + '"' +
                (on ? ' aria-selected="true"' : ' aria-selected="false"') + '>' +
                '<strong>' + esc(noteTitleText(note)) + '</strong>' +
                '<button type="button" class="note-more" data-note-more aria-label="Options for ' + esc(noteTitleText(note)) + '">⋯</button>' +
                '<small>' + esc(notePreview(note)) + '</small></div>';
        }).join('');
        const current = noteById(state.active);
        const has = !!current;
        if (empty) empty.hidden = state.notes.length > 0;
        if (document.activeElement !== title) title.value = has ? current.title : '';
        if (document.activeElement !== body) noteFillBody(body, has ? current : null);
        paintNoteGraph();
    }

    function noteSpots(notes, w, h) {
        const state = notepadState();
        const spots = {};
        notes.forEach(function (note, index) {
            const saved = state.layout[note.id];
            let x;
            let y;
            if (saved && isFinite(saved.x) && isFinite(saved.y)) {
                x = 28 + saved.x * Math.max(1, w - 56);
                y = 24 + saved.y * Math.max(1, h - 56);
            } else {
                const angle = (-Math.PI / 2) + (index / Math.max(1, notes.length)) * Math.PI * 2;
                const rx = Math.max(28, (w - 80) / 2);
                const ry = Math.max(24, (h - 72) / 2);
                x = w / 2 + Math.cos(angle) * rx * 0.78;
                y = h / 2 + Math.sin(angle) * ry * 0.72;
            }
            spots[note.id] = { x: x, y: y };
        });
        return spots;
    }

    function noteReduceMotion() {
        return document.documentElement.classList.contains('reduce-motion') ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function noteGraphSignature(state) {
        return state.notes.map(function (note) { return note.id; }).join('\n') + '\n' +
            state.links.map(function (link) { return link.id + ':' + link.from + ':' + link.to; }).join('\n');
    }

    function noteSyncBodies(notes, w, h) {
        const spots = noteSpots(notes, w, h);
        const next = {};
        notes.forEach(function (note) {
            const prev = noteBodies[note.id];
            if (prev) {
                next[note.id] = prev;
                return;
            }
            const spot = spots[note.id];
            let x = spot.x;
            let y = spot.y;
            const placed = Object.keys(next);
            let guard = 0;
            for (let i = 0; i < placed.length; i++) {
                const other = next[placed[i]];
                if (Math.hypot(other.x - x, other.y - y) < 48) {
                    guard += 1;
                    const angle = guard * 2.4;
                    x = w / 2 + Math.cos(angle) * Math.min(120, w * 0.34);
                    y = h / 2 + Math.sin(angle) * Math.min(120, h * 0.28);
                    i = -1;
                    if (guard > placed.length + 2) break;
                }
            }
            next[note.id] = { x: x, y: y, vx: 0, vy: 0 };
        });
        noteBodies = next;
    }

    function noteResizeBodies(w, h) {
        if (w < 20 || h < 20) return false;
        if (!noteSimSize) {
            noteSimSize = { w: w, h: h };
            return false;
        }
        if (Math.abs(noteSimSize.w - w) < 2 && Math.abs(noteSimSize.h - h) < 2) return false;
        if (noteSimSize.w < 20 || noteSimSize.h < 20) {
            noteBodies = {};
            noteSimSize = { w: w, h: h };
            return true;
        }
        const sx = w / noteSimSize.w;
        const sy = h / noteSimSize.h;
        Object.keys(noteBodies).forEach(function (id) {
            noteBodies[id].x *= sx;
            noteBodies[id].y *= sy;
        });
        noteSimSize = { w: w, h: h };
        return true;
    }

    function noteStoreLayout() {
        const stage = $('noteGraph');
        if (!stage) return;
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        const state = notepadState();
        Object.keys(noteBodies).forEach(function (id) {
            const body = noteBodies[id];
            state.layout[id] = {
                x: Math.min(1, Math.max(0, (body.x - 28) / Math.max(1, w - 56))),
                y: Math.min(1, Math.max(0, (body.y - 24) / Math.max(1, h - 56)))
            };
        });
    }

    function noteIndexGraph(svg) {
        noteDotEls = {};
        noteLineEls = {};
        const dots = svg.querySelectorAll('[data-graph-note]');
        for (let i = 0; i < dots.length; i++) noteDotEls[dots[i].getAttribute('data-graph-note')] = dots[i];
        const lines = svg.querySelectorAll('[data-note-edge]');
        for (let i = 0; i < lines.length; i++) {
            const id = lines[i].getAttribute('data-note-edge');
            if (!noteLineEls[id]) noteLineEls[id] = [];
            noteLineEls[id].push(lines[i]);
        }
    }

    function noteRefreshMarks(notes, state) {
        notes.forEach(function (note) {
            const dot = noteDotEls[note.id];
            if (!dot) return;
            dot.classList.toggle('is-on', note.id === state.active);
            dot.classList.toggle('is-from', note.id === noteLinkFrom);
            dot.classList.toggle('is-shift', noteShiftIds.indexOf(note.id) >= 0);
            const text = dot.querySelector('text');
            const label = noteTitleText(note).slice(0, 18);
            if (text && text.textContent !== label) text.textContent = label;
        });
    }

    function notePaintBodies() {
        Object.keys(noteBodies).forEach(function (id) {
            const dot = noteDotEls[id];
            const body = noteBodies[id];
            if (dot) dot.setAttribute('transform', 'translate(' + body.x.toFixed(1) + ' ' + body.y.toFixed(1) + ')');
        });
        const links = notepadState().links;
        links.forEach(function (link) {
            const lines = noteLineEls[link.id];
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            if (!lines || !a || !b) return;
            for (let i = 0; i < lines.length; i++) {
                lines[i].setAttribute('x1', a.x.toFixed(1));
                lines[i].setAttribute('y1', a.y.toFixed(1));
                lines[i].setAttribute('x2', b.x.toFixed(1));
                lines[i].setAttribute('y2', b.y.toFixed(1));
            }
        });
    }

    function noteSimStep(w, h) {
        const state = notepadState();
        const ids = Object.keys(noteBodies);
        const cx = w / 2;
        const cy = h / 2;
        const rest = Math.min(150, Math.max(78, Math.min(w, h) * 0.28));
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const a = noteBodies[ids[i]];
                const b = noteBodies[ids[j]];
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let dist = Math.hypot(dx, dy);
                if (dist < 1) {
                    dx = (i % 2 ? 1 : -1);
                    dy = 0.35;
                    dist = 1;
                }
                const push = Math.min(11, 1600 / (dist * dist));
                const fx = (dx / dist) * push;
                const fy = (dy / dist) * push;
                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
            }
        }
        state.links.forEach(function (link) {
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            if (!a || !b) return;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const pull = (dist - rest) * 0.02;
            const fx = (dx / dist) * pull;
            const fy = (dy / dist) * pull;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        });
        let energy = 0;
        ids.forEach(function (id) {
            const body = noteBodies[id];
            if (noteDrag && noteDrag.id === id) {
                body.vx = noteDrag.vx || 0;
                body.vy = noteDrag.vy || 0;
                energy += 1;
                return;
            }
            body.vx += (cx - body.x) * 0.012;
            body.vy += (cy - body.y) * 0.012;
            body.vx *= 0.8;
            body.vy *= 0.8;
            const speed = Math.hypot(body.vx, body.vy);
            if (speed > 12) {
                body.vx = body.vx / speed * 12;
                body.vy = body.vy / speed * 12;
            } else if (speed < 0.05) {
                body.vx = 0;
                body.vy = 0;
            }
            body.x += body.vx;
            body.y += body.vy;
            if (body.x < 36) { body.x = 36; body.vx *= -0.35; }
            if (body.x > w - 36) { body.x = w - 36; body.vx *= -0.35; }
            if (body.y < 28) { body.y = 28; body.vy *= -0.35; }
            if (body.y > h - 40) { body.y = h - 40; body.vy *= -0.35; }
            energy += body.vx * body.vx + body.vy * body.vy;
        });
        return energy;
    }

    function noteSimStop(save) {
        noteSimOn = false;
        noteSimCalm = 0;
        if (!save) return;
        noteStoreLayout();
        schedulePersist();
    }

    function noteSimTick() {
        if (!noteSimOn) return;
        const stage = $('noteGraph');
        const page = document.body && document.body.getAttribute('data-page');
        if (page !== 'notepad' || !stage || !stage.querySelector('svg')) {
            noteSimOn = false;
            return;
        }
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (w < 20 || h < 20) {
            requestAnimationFrame(noteSimTick);
            return;
        }
        const energy = noteSimStep(w, h);
        notePaintBodies();
        if (!noteDrag && energy < 0.08) noteSimCalm += 1;
        else noteSimCalm = 0;
        if (!noteDrag && noteSimCalm > 24) {
            noteSimStop(true);
            return;
        }
        requestAnimationFrame(noteSimTick);
    }

    function noteSimStart() {
        const stage = $('noteGraph');
        if (!stage || !Object.keys(noteBodies).length) return;
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        if (noteReduceMotion()) {
            for (let step = 0; step < 140; step++) noteSimStep(w, h);
            Object.keys(noteBodies).forEach(function (id) {
                noteBodies[id].vx = 0;
                noteBodies[id].vy = 0;
            });
            notePaintBodies();
            noteStoreLayout();
            return;
        }
        if (noteSimOn) return;
        noteSimCalm = 0;
        noteSimOn = true;
        requestAnimationFrame(noteSimTick);
    }

    function paintNoteGraph() {
        const stage = $('noteGraph');
        if (!stage) return;
        const state = notepadState();
        const notes = state.notes;
        if (!notes.length) {
            noteBodies = {};
            noteDotEls = {};
            noteLineEls = {};
            noteGraphSig = '';
            noteSimSize = null;
            noteSimOn = false;
            stage.innerHTML = '';
            return;
        }
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        if (w < 20 || h < 20) return;
        const resized = noteResizeBodies(w, h);
        noteSyncBodies(notes, w, h);
        const sig = noteGraphSignature(state);
        const svg = stage.querySelector('svg');
        if (svg && sig === noteGraphSig) {
            svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            noteRefreshMarks(notes, state);
            notePaintBodies();
            if (resized) noteSimStart();
            return;
        }
        noteGraphSig = sig;
        const lines = state.links.filter(function (link) {
            return noteBodies[link.from] && noteBodies[link.to];
        }).map(function (link) {
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            const id = esc(link.id);
            return '<line class="note-edge-hit" data-note-edge="' + id + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />' +
                '<line class="note-edge" data-note-edge="' + id + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />';
        }).join('');
        const dots = notes.map(function (note) {
            const spot = noteBodies[note.id];
            const on = note.id === state.active ? ' is-on' : '';
            const from = note.id === noteLinkFrom ? ' is-from' : '';
            const shift = noteShiftIds.indexOf(note.id) >= 0 ? ' is-shift' : '';
            const label = noteTitleText(note).slice(0, 18);
            return '<g class="note-dot' + on + from + shift + '" data-graph-note="' + esc(note.id) + '" transform="translate(' + spot.x + ' ' + spot.y + ')">' +
                '<circle r="7" />' +
                '<text y="18">' + esc(label) + '</text></g>';
        }).join('');
        stage.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><g data-note-cam transform="translate(' +
            notepadState().pan.x + ' ' + notepadState().pan.y + ')">' + lines + dots + '</g></svg>';
        noteIndexGraph(stage.querySelector('svg'));
        noteSimStart();
    }

    function addNotepadNote() {
        const state = notepadState();
        const note = blankNote();
        state.notes.unshift(note);
        state.active = note.id;
        renderNotepad();
        schedulePersist();
        const title = $('noteTitle');
        if (title) title.focus();
    }

    function writeActiveNote() {
        const state = notepadState();
        const title = $('noteTitle');
        const body = $('noteBody');
        if (!title || !body) return;
        noteMarkEmpty(body);
        let note = noteById(state.active);
        const fresh = !note;
        const plain = notePlainFrom(body);
        const html = noteSanitize(body.innerHTML);
        if (!note) {
            if (!title.value && !plain && !noteHasFormat(html)) return;
            note = blankNote();
            state.notes.unshift(note);
            state.active = note.id;
        }
        note.title = title.value.slice(0, 80);
        note.body = plain;
        note.html = (plain || noteHasFormat(html)) ? html : '';
        if (!note.created) note.created = note.updated || noteNow();
        note.updated = noteNow();
        if (fresh) {
            renderNotepad();
            schedulePersist();
            return;
        }
        const rows = document.querySelectorAll('#noteList [data-note]');
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute('data-note') !== note.id) continue;
            const strong = rows[i].querySelector('strong');
            const small = rows[i].querySelector('small');
            const more = rows[i].querySelector('[data-note-more]');
            if (strong) strong.textContent = noteTitleText(note);
            if (small) small.textContent = notePreview(note);
            if (more) more.setAttribute('aria-label', 'Options for ' + noteTitleText(note));
        }
        paintNoteGraph();
        schedulePersist();
    }

    function runNoteAction(action, noteId, linkId) {
        closeNoteMenu();
        if (action === 'new') {
            addNotepadNote();
            return;
        }
        const state = notepadState();
        if (noteId) state.active = noteId;
        if (action === 'rename') {
            renderNotepad();
            const title = $('noteTitle');
            if (title) {
                title.focus();
                title.select();
            }
            return;
        }
        if (action === 'edit') {
            renderNotepad();
            const body = $('noteBody');
            if (body) body.focus();
            return;
        }
        if (action === 'link') {
            startNoteLink(noteId);
            return;
        }
        if (action === 'unlink') {
            state.links = state.links.filter(function (link) { return link.id !== linkId; });
            renderNotepad();
            schedulePersist();
            return;
        }
        if (action === 'delete') deleteNote(noteId);
    }

