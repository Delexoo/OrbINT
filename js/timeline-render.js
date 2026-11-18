/* Timeline cards, bits, axis drawing */
    function tlShows(ev, key) {
        if (!ev) return false;
        if (key === 'image') return !!(ev.image || (ev.show && ev.show.image));
        const shown = ev.show && ev.show[key];
        return !!(shown || String(ev[key] || '').trim());
    }

    function tlFolded(ev, key, note) {
        if (note) return !!note.fold;
        return !!(ev && ev.fold && ev.fold[key]);
    }

    function tlBitBar(ev, key, label, folded, noteId) {
        const nid = noteId ? ' data-note-id="' + esc(noteId) + '"' : '';
        const expand = folded ? 'Expand' : 'Minimize';
        return '<div class="tl-bit-bar">' +
            '<span>' + esc(label) + '</span>' +
            '<div class="tl-bit-acts">' +
            '<button type="button" class="tl-bit-btn" data-tl-fold="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="' + expand + '" aria-label="' + expand + '" aria-expanded="' + (folded ? 'false' : 'true') + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
            '</button>' +
            '<button type="button" class="tl-bit-btn is-del" data-tl-drop="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="Delete" aria-label="Delete">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
            '</button>' +
            '</div></div>';
    }

    function tlBitShell(ev, key, label, folded, innerHtml, noteId) {
        return '<div class="tl-bit' + (folded ? ' is-fold' : '') + '" data-tl-bit="' + key + '">' +
            tlBitBar(ev, key, label, folded, noteId) +
            '<div class="tl-bit-body"><div class="tl-bit-body-inner">' + innerHtml + '</div></div></div>';
    }

    function tlBitEl(id, key, noteId) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (!node) return null;
        if (key === 'more' || key === 'moreTime') {
            const hit = node.querySelector('[data-note-id="' + noteId + '"]');
            return hit ? hit.closest('.tl-bit') : null;
        }
        return node.querySelector('[data-tl-bit="' + key + '"]');
    }

    function afterEase(el, fn) {
        if (!el || reduceMotion()) {
            fn();
            return;
        }
        let done = false;
        const finish = function (event) {
            if (done) return;
            if (event) {
                if (event.target !== el) return;
                if (event.type === 'transitionend' && event.propertyName !== 'height') return;
            }
            done = true;
            fn();
        };
        el.addEventListener('transitionend', finish);
        el.addEventListener('animationend', finish);
        setTimeout(function () { finish(); }, 420);
    }

    function tickTlLayout(frames, preferId) {
        let n = 0;
        const max = frames || 20;
        const tick = function () {
            stackTimelineStems(preferId);
            drawTimelineAxis();
            n += 1;
            if (n < max) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function moreTimesOf(ev) {
        if (!ev) return [];
        ev.moreTimes = Array.isArray(ev.moreTimes) ? ev.moreTimes.filter(function (item) { return item && item.id; }) : [];
        if ((ev.infoTime || (ev.show && ev.show.infoTime)) && !ev.moreTimes.length) {
            ev.moreTimes.push({
                id: uid('tm'),
                value: ev.infoTime || '',
                fold: !!(ev.fold && ev.fold.infoTime)
            });
            ev.infoTime = '';
            if (ev.show) ev.show.infoTime = false;
        }
        return ev.moreTimes;
    }

    function tlInfoTimeHtml(ev) {
        return moreTimesOf(ev).map(function (item) {
            const folded = !!item.fold;
            const label = item.value ? formatTime12(item.value) : 'Select time';
            return tlBitShell(ev, 'moreTime', 'Time', folded,
                '<button type="button" class="tl-info-clock' + (item.value ? ' has-time' : '') + '" data-tl-time="' + esc(ev.id) + '" data-tl-time-for="moreTime" data-note-id="' + esc(item.id) + '" aria-haspopup="dialog" aria-label="Card time">' + esc(label) + '</button>',
                item.id);
        }).join('');
    }

    function tlFactRow(ev, key, label, ph) {
        if (!tlShows(ev, key)) return '';
        const folded = tlFolded(ev, key);
        return tlBitShell(ev, key, label, folded,
            '<input data-tl-field="' + key + '" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev[key] || '') + '" placeholder="' + esc(ph) + '" spellcheck="false" autocomplete="off">');
    }

    function tlMoreNotesHtml(ev) {
        return (Array.isArray(ev.moreNotes) ? ev.moreNotes : []).map(function (note) {
            if (!note || !note.id) return '';
            const blank = !(note.text || '').trim();
            const h = Number(note.h);
            const folded = tlFolded(ev, 'more', note);
            return tlBitShell(ev, 'more', 'Note', folded,
                '<div class="tl-note' + (blank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="more" data-event-id="' + esc(ev.id) + '" data-note-id="' + esc(note.id) + '" data-ph="Note" spellcheck="false" style="height:' + (h >= 48 ? h : 76) + 'px">' + esc(note.text || '') + '</div>',
                note.id);
        }).join('');
    }

    function tlMediaHtml(ev) {
        if (!ev.image && !tlShows(ev, 'image')) return '';
        const folded = tlFolded(ev, 'image');
        const body = ev.image
            ? '<div class="tl-media"><img class="tl-thumb" src="' + esc(ev.image) + '" alt="" data-tl-expand="' + esc(ev.id) + '"></div>'
            : '<div class="tl-attach">' +
                '<button type="button" class="tl-attach-hit" data-tl-photo="' + esc(ev.id) + '">Attach image</button>' +
                '<input class="tl-attach-url" data-tl-image-url="' + esc(ev.id) + '" type="url" placeholder="Paste image URL" spellcheck="false" autocomplete="off">' +
                '</div>';
        return tlBitShell(ev, 'image', 'Image', folded, body);
    }

    function toggleTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        rememberTimeline();
        let folded = false;
        if (key === 'more') {
            const note = (rec.moreNotes || []).find(function (item) { return item.id === noteId; });
            if (!note) return;
            note.fold = !note.fold;
            folded = !!note.fold;
        } else if (key === 'moreTime') {
            const slot = moreTimesOf(rec).find(function (item) { return item.id === noteId; });
            if (!slot) return;
            slot.fold = !slot.fold;
            folded = !!slot.fold;
            rec.moreTimes = moreTimesOf(rec);
        } else {
            rec.fold = rec.fold && typeof rec.fold === 'object' ? rec.fold : {};
            rec.fold[key] = !rec.fold[key];
            folded = !!rec.fold[key];
        }
        const bit = tlBitEl(id, key, noteId);
        if (bit) {
            bit.classList.toggle('is-fold', folded);
            const btn = bit.querySelector('[data-tl-fold]');
            if (btn) {
                btn.title = folded ? 'Expand' : 'Minimize';
                btn.setAttribute('aria-label', folded ? 'Expand' : 'Minimize');
                btn.setAttribute('aria-expanded', folded ? 'false' : 'true');
            }
            if (reduceMotion()) {
                stackTimelineStems();
                drawTimelineAxis();
            } else tickTlLayout(20);
        } else {
            renderTimeline();
        }
        schedulePersist();
    }

    function dropTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        const bit = tlBitEl(id, key, noteId);
        if (bit && bit.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            const live = findTimelineEvent(id);
            if (!live) return;
            if (key === 'more') {
                live.moreNotes = (live.moreNotes || []).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'moreTime') {
                live.moreTimes = moreTimesOf(live).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'image') {
                live.image = '';
                if (live.show) live.show.image = false;
                if (live.fold) live.fold.image = false;
            } else {
                live[key] = '';
                live.show = live.show && typeof live.show === 'object' ? live.show : {};
                live.show[key] = false;
                if (live.fold) live.fold[key] = false;
            }
            renderTimeline();
            schedulePersist();
        }
        if (bit && !reduceMotion()) {
            const h = bit.offsetHeight;
            bit.style.height = h + 'px';
            void bit.offsetHeight;
            bit.classList.add('is-out');
            bit.style.height = '0px';
            tickTlLayout(20);
            afterEase(bit, commit);
            return;
        }
        commit();
    }

    function closeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (infoState && infoState.anchor) infoState.anchor.setAttribute('aria-expanded', 'false');
        infoState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || pop.hidden || !infoState || !infoState.anchor) return;
        const r = infoState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 268;
        const h = pop.offsetHeight || 280;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function paintTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || !infoState) return;
        const rec = findTimelineEvent(infoState.eventId);
        const items = [
            ['image', 'image', rec && rec.image ? 'Replace image' : 'Image'],
            ['notes', 'note', 'More notes'],
            ['time', 'clock', 'Time'],
            ['date', 'calendar', 'Date'],
            ['entities', 'person', 'Entities'],
            ['source', 'link', 'Source'],
            ['evidence', 'document', 'Evidence']
        ];
        pop.innerHTML =
            '<div class="tl-info-head">Add information</div>' +
            '<div class="tl-info-grid">' +
            items.map(function (item) {
                return '<button type="button" data-tl-add="' + item[0] + '">' + boardIcon(item[1]) + '<span>' + item[2] + '</span></button>';
            }).join('') +
            '</div>';
        pop.hidden = false;
        placeTlInfoPop();
    }

    function openTlInfoPop(anchor) {
        if (!anchor) return;
        if (infoState && infoState.anchor === anchor) {
            if (Date.now() - (infoState.at || 0) < 500) return;
            closeTlInfoPop();
            return;
        }
        closeCalendar();
        closeTimePicker();
        hideTimelineMenu();
        closeTlInfoPop();
        infoState = {
            anchor: anchor,
            eventId: anchor.getAttribute('data-tl-info') || '',
            at: Date.now()
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintTlInfoPop();
    }

    function runTlInfo(kind, id) {
        const rec = findTimelineEvent(id);
        if (!rec || !kind) return;
        closeTlInfoPop();
        if (kind === 'date') {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
            return;
        }
        rememberTimeline('info:' + id);
        rec.show = rec.show && typeof rec.show === 'object' ? rec.show : {};
        if (rec.mini) rec.mini = false;
        if (kind === 'time') {
            moreTimesOf(rec);
            const item = { id: uid('tm'), value: '' };
            rec.moreTimes.push(item);
            tlFocusAfter = { id: id, pickTime: item.id };
        } else if (kind === 'notes') {
            rec.moreNotes = Array.isArray(rec.moreNotes) ? rec.moreNotes : [];
            const note = { id: uid('note'), text: '' };
            rec.moreNotes.push(note);
            tlFocusAfter = { id: id, more: note.id };
        } else if (kind === 'image') {
            rec.show.image = true;
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        } else {
            rec.show[kind] = true;
            tlFocusAfter = { id: id, field: kind };
        }
        renderTimeline();
        tickTlLayout(28, id);
        schedulePersist();
    }

    function onTlInfoClick(event) {
        const act = event.target.closest('[data-tl-add]');
        if (!act || !infoState) return;
        runTlInfo(act.getAttribute('data-tl-add'), infoState.eventId);
    }

    function applyTlFocusAfter(list) {
        const spec = tlFocusAfter;
        tlFocusAfter = null;
        if (!spec || !list) return;
        const node = list.querySelector('[data-event="' + spec.id + '"]');
        if (!node) return;
        if (spec.photo) {
            timelinePhotoId = spec.id;
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        if (spec.pickTime) {
            const btn = node.querySelector('[data-tl-time-for="moreTime"][data-note-id="' + spec.pickTime + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        if (spec.pick) {
            const btn = node.querySelector('[data-tl-time-for="' + spec.pick + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        const el = spec.more
            ? node.querySelector('[data-note-id="' + spec.more + '"]')
            : node.querySelector('[data-tl-field="' + spec.field + '"]');
        if (el) el.focus();
    }

    function renderTimeline() {
        if (calState && calState.eventId) closeCalendar();
        if (timeState && timeState.eventId) closeTimePicker();
        if (infoState && infoState.eventId) closeTlInfoPop();
        const list = $('timelineList');
        const count = $('timelineCount');
        const events = layoutTimelineEvents();
        if (count) count.textContent = events.length ? (events.length === 1 ? '1 event' : events.length + ' events') : 'No events';
        applyTimelineCam();
        const empty = $('timelineEmpty');
        if (empty) empty.hidden = true;
        if (!events.length && !tlCamAnim) {
            const view = $('timelineView');
            const cam = timelineCam();
            if (view && view.clientHeight > 80) {
                const y = Math.round(view.clientHeight / 2 - TL_AXIS_Y * (cam.z || 1));
                if (Math.abs((cam.y || 0) - y) > 1) easeTimelineCam({ x: cam.x, y: y, z: cam.z || 1 });
            }
        }
        if (!list) {
            scheduleDatasheet();
            return;
        }
        list.innerHTML = events.map(function (ev) {
            const n = String(ev.n).padStart(2, '0');
            const active = ev.id === selectedEvent ? ' is-on' : '';
            const connecting = connectFrom === ev.id ? ' is-from' : '';
            const spawn = ev.spawn ? ' is-spawn' : '';
            delete ev.spawn;
            const mini = ev.mini ? ' is-mini' : '';
            const locked = ev.locked ? ' is-locked' : '';
            const facts = tlInfoTimeHtml(ev) +
                tlFactRow(ev, 'entities', 'Entities', 'People, accounts, companies') +
                tlFactRow(ev, 'source', 'Source', 'URL or origin') +
                tlFactRow(ev, 'evidence', 'Evidence', 'File, exhibit, or note');
            const media = tlMediaHtml(ev);
            const noteBlank = !(ev.body || '').trim();
            const noteH = Number(ev.noteH);
            const w = tlCardW(ev);
            const h = tlCardH(ev);
            const top = cardTop(ev, ev.mini ? 86 : (ev.image ? 420 : 220));
            return '<article class="tl-node' + active + connecting + spawn + mini + locked + (h ? ' is-sized' : '') + '" data-event="' + esc(ev.id) + '" data-side="' + (ev.side === 1 ? '1' : '-1') + '" style="left:' + (ev.pinX - w / 2) + 'px;top:' + top + 'px;width:' + w + 'px' + (h && !ev.mini ? ';height:' + h + 'px' : '') + '">' +
                '<div class="tl-card">' +
                '<div class="tl-bar" data-tl-drag>' +
                '<span class="tl-idx">' + n + '</span>' +
                '<div class="tl-when">' +
                '<span class="tl-date' + (ev.date ? ' has-date' : '') + '">' + esc(ev.date ? formatDayLabel(ev.date) : 'Date') + '</span>' +
                '<span class="tl-time' + (ev.time ? ' has-time' : '') + '">' + esc(ev.time ? formatTime12(ev.time) : 'Time') + '</span>' +
                '</div>' +
                '<div class="tl-bar-actions">' +
                '<button type="button" class="tl-ico" data-tl-cal="' + esc(ev.id) + '" title="Date" aria-label="Choose date" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-time="' + esc(ev.id) + '" title="Time" aria-label="Choose time" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico' + (connectFrom === ev.id ? ' is-on' : '') + '" data-connect-event="' + esc(ev.id) + '" title="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-label="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-pressed="' + (connectFrom === ev.id ? 'true' : 'false') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a3.8 3.8 0 0 0 5.4.4l1.6-1.6a3.8 3.8 0 1 0-5.4-5.4l-.9.9"/><path d="M14 10.5a3.8 3.8 0 0 0-5.4-.4L7 11.7a3.8 3.8 0 0 0 5.4 5.4l.9-.9"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-mini="' + esc(ev.id) + '" title="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-label="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-expanded="' + (ev.mini ? 'false' : 'true') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico danger" data-del-event="' + esc(ev.id) + '" title="Delete" aria-label="Delete">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
                '</button>' +
                '</div></div>' +
                '<input class="tl-title" data-tl-field="title" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev.title || '') + '" placeholder="Title" spellcheck="false" autocomplete="off" maxlength="120">' +
                '<div class="tl-extra"><div class="tl-extra-inner">' +
                '<div class="tl-note' + (noteBlank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="body" data-event-id="' + esc(ev.id) + '" data-ph="Note" spellcheck="false" style="height:' + (noteH >= 48 ? noteH : 76) + 'px">' + esc(ev.body || '') + '</div>' +
                tlMoreNotesHtml(ev) +
                (facts ? '<div class="tl-facts">' + facts + '</div>' : '') +
                media +
                '<div class="tl-acts">' +
                '<button type="button" class="tl-add-info" data-tl-info="' + esc(ev.id) + '" aria-haspopup="dialog" aria-expanded="false">+ Add information</button>' +
                '</div></div></div></div>' +
                '<div class="tl-rs" aria-hidden="true">' +
                '<i data-tl-rs="n"></i><i data-tl-rs="s"></i><i data-tl-rs="e"></i><i data-tl-rs="w"></i>' +
                '<i data-tl-rs="ne"></i><i data-tl-rs="nw"></i><i data-tl-rs="se"></i><i data-tl-rs="sw"></i>' +
                '</div></article>';
        }).join('');
        requestAnimationFrame(function () {
            list.querySelectorAll('.tl-node').forEach(function (el) {
                const rec = (data.timeline || []).find(function (item) { return item.id === el.getAttribute('data-event'); });
                if (!rec) return;
                if (!(rec.pinY != null && isFinite(Number(rec.pinY)))) rec.pinY = cardTop(rec, tlNodeH(el, rec));
                placeTlCard(el, rec);
            });
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
            bindTimelineFieldSizes(list);
            bindTimelineNodeSizes(list);
            applyTlFocusAfter(list);
            tickTlLayout(12);
        });
        scheduleDatasheet();
    }

    function tlEditableBlank(el) {
        return !String((el && el.innerText) || '').replace(/\u00a0/g, ' ').trim();
    }

    function syncTlPlaceholder(el) {
        if (!el || !el.hasAttribute || !el.hasAttribute('data-tl-field')) return;
        if (tlEditableBlank(el)) {
            el.classList.add('is-blank');
            const html = String(el.innerHTML || '').replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/gi, '').replace(/\s/g, '');
            if (!html && el.innerHTML) el.innerHTML = '';
        } else {
            el.classList.remove('is-blank');
        }
    }

    function bindTimelineFieldSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlSizeObs) tlSizeObs.disconnect();
        tlSizeObs = new ResizeObserver(function (entries) {
            entries.forEach(function (entry) {
                const el = entry.target;
                const rec = findTimelineEvent(el.getAttribute('data-event-id'));
                if (!rec) return;
                const field = el.getAttribute('data-tl-field');
                if (el.closest('.tl-node.is-sized, .tl-node.is-resizing')) return;
                const h = Math.round(el.offsetHeight);
                if (h < 16) return;
                if (field === 'more') {
                    const nid = el.getAttribute('data-note-id');
                    const item = (rec.moreNotes || []).find(function (note) { return note.id === nid; });
                    if (!item || item.h === h) return;
                    item.h = h;
                    schedulePersist();
                    scheduleStemRedraw();
                    return;
                }
                const key = field === 'title' ? 'titleH' : 'noteH';
                if (rec[key] === h) return;
                rec[key] = h;
                schedulePersist();
                scheduleStemRedraw();
            });
        });
        list.querySelectorAll('[data-tl-field="body"], [data-tl-field="more"]').forEach(function (el) { tlSizeObs.observe(el); });
    }

    function scheduleStemRedraw() {
        if (tlStemRedraw) return;
        tlStemRedraw = requestAnimationFrame(function () {
            tlStemRedraw = 0;
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
        });
    }

    function trackTimelineStems() {
        if (tlStemTrack) return;
        const tick = function () {
            tlStemTrack = 0;
            drawTimelineAxis();
            if (document.querySelector('#timelineList .tl-node.is-spawn, #timelineList .tl-node.is-moving, #timelineList .tl-node.is-resizing')) {
                tlStemTrack = requestAnimationFrame(tick);
            }
        };
        tlStemTrack = requestAnimationFrame(tick);
    }

    function bindTimelineNodeSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlNodeObs) tlNodeObs.disconnect();
        tlNodeObs = new ResizeObserver(function (entries) {
            let dirty = false;
            entries.forEach(function (entry) {
                const el = entry.target;
                if (!el || el.classList.contains('is-resizing') || el.classList.contains('is-moving') || el.classList.contains('is-out')) return;
                dirty = true;
            });
            if (dirty) scheduleStemRedraw();
        });
        list.querySelectorAll('.tl-node, .tl-node .tl-card').forEach(function (el) { tlNodeObs.observe(el); });
    }

    function formatWhen(ev) {
        if (!ev.date && !ev.time) return 'Undated';
        if (ev.date && ev.time) return ev.date + ' ' + ev.time;
        return ev.date || ev.time;
    }

    function tlPortPoint(box, side) {
        const mx = (box.left + box.right) / 2;
        const my = (box.top + box.bottom) / 2;
        if (side === 'n') return { x: mx, y: box.top };
        if (side === 's') return { x: mx, y: box.bottom };
        if (side === 'e') return { x: box.right, y: my };
        return { x: box.left, y: my };
    }

    function tlCardLinkPath(a, b) {
        const sides = ['n', 'e', 's', 'w'];
        let best = null;
        let dist = Infinity;
        sides.forEach(function (sa) {
            const pa = tlPortPoint(a, sa);
            sides.forEach(function (sb) {
                const pb = tlPortPoint(b, sb);
                const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
                if (d < dist) {
                    dist = d;
                    best = { sa: sa, sb: sb, a: pa, b: pb };
                }
            });
        });
        if (!best) return '';
        const out = { n: [0, -22], s: [0, 22], e: [22, 0], w: [-22, 0] };
        const a1 = { x: best.a.x + out[best.sa][0], y: best.a.y + out[best.sa][1] };
        const b1 = { x: best.b.x + out[best.sb][0], y: best.b.y + out[best.sb][1] };
        const mid = (best.sa === 'e' || best.sa === 'w')
            ? [{ x: a1.x, y: b1.y }]
            : [{ x: b1.x, y: a1.y }];
        return tlOrthoPath([best.a, a1].concat(mid).concat([b1, best.b]), 12);
    }

    function tlCardBox(ev, el) {
        const card = el && el.querySelector('.tl-card');
        const w = Math.max(1, (card && card.offsetWidth) || (el && el.offsetWidth) || tlCardW(ev));
        const h = Math.max(86, (card && card.offsetHeight) || tlNodeH(el, ev));
        const left = el
            ? (parseFloat(el.style.left) || el.offsetLeft || ((Number(ev.pinX) || 0) - w / 2))
            : ((Number(ev.pinX) || 0) - w / 2);
        const top = el
            ? (parseFloat(el.style.top) || el.offsetTop || Number(ev.pinY) || 0)
            : (Number(ev.pinY) || 0);
        const pin = left + w / 2;
        const side = tlFacingSide(top, h, ev && ev.side);
        return { id: ev.id, side: side, pin: pin, left: left, right: left + w, top: top, bottom: top + h };
    }

    function tlStemEnds(box, axisY) {
        const side = box.side === 1 ? 1 : -1;
        const glue = 5;
        return {
            side: side,
            pin: box.pin,
            tickY: side === 1 ? axisY + 22 : axisY - 22,
            cardY: side === 1 ? box.top + glue : box.bottom - glue
        };
    }

    function mergeTlBoxes(list) {
        if (!list.length) return [];
        const items = list.slice().sort(function (a, b) { return a.top - b.top; });
        const out = [{ left: items[0].left, right: items[0].right, top: items[0].top, bottom: items[0].bottom }];
        for (let i = 1; i < items.length; i++) {
            const last = out[out.length - 1];
            const cur = items[i];
            if (cur.top <= last.bottom + 18) {
                last.bottom = Math.max(last.bottom, cur.bottom);
                last.left = Math.min(last.left, cur.left);
                last.right = Math.max(last.right, cur.right);
            } else {
                out.push({ left: cur.left, right: cur.right, top: cur.top, bottom: cur.bottom });
            }
        }
        return out;
    }

    function tlOrthoPath(pts, radius) {
        if (!pts.length) return '';
        const r = radius == null ? 10 : radius;
        let d = 'M' + pts[0].x + ' ' + pts[0].y;
        if (pts.length === 1) return d;
        if (pts.length === 2) return d + ' L' + pts[1].x + ' ' + pts[1].y;
        for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            const next = pts[i + 1];
            const dx1 = cur.x - prev.x;
            const dy1 = cur.y - prev.y;
            const dx2 = next.x - cur.x;
            const dy2 = next.y - cur.y;
            const len1 = Math.hypot(dx1, dy1) || 1;
            const len2 = Math.hypot(dx2, dy2) || 1;
            const rr = Math.min(r, len1 / 2, len2 / 2);
            d += ' L' + (cur.x - dx1 / len1 * rr) + ' ' + (cur.y - dy1 / len1 * rr);
            d += ' Q' + cur.x + ' ' + cur.y + ' ' + (cur.x + dx2 / len2 * rr) + ' ' + (cur.y + dy2 / len2 * rr);
        }
        const last = pts[pts.length - 1];
        d += ' L' + last.x + ' ' + last.y;
        return d;
    }

    function tlStemPoints(pin, startY, endY, selfId, boxes) {
        const down = endY > startY;
        const hits = boxes.filter(function (b) {
            if (b.id === selfId) return false;
            if (pin < b.left - 1 || pin > b.right + 1) return false;
            if (down) return b.top < endY - 8 && b.bottom > startY + 8;
            return b.bottom > endY + 8 && b.top < startY - 8;
        });
        const merged = mergeTlBoxes(hits);
        const pad = 16;
        const pts = [{ x: pin, y: startY }];
        merged.forEach(function (obs) {
            let enter;
            let leave;
            if (down) {
                if (obs.bottom <= startY + 4 || obs.top >= endY - 4) return;
                enter = Math.max(startY, obs.top - pad);
                leave = Math.min(endY, obs.bottom + pad);
            } else {
                if (obs.top >= startY - 4 || obs.bottom <= endY + 4) return;
                enter = Math.min(startY, obs.bottom + pad);
                leave = Math.max(endY, obs.top - pad);
            }
            if (down ? leave <= enter : leave >= enter) return;
            const leftX = obs.left - pad;
            const rightX = obs.right + pad;
            let around = Math.abs(pin - leftX) <= Math.abs(rightX - pin) ? leftX : rightX;
            if (around < TL_ORIGIN_X - 8) around = rightX;
            pts.push({ x: pin, y: enter });
            pts.push({ x: around, y: enter });
            pts.push({ x: around, y: leave });
            pts.push({ x: pin, y: leave });
        });
        const last = pts[pts.length - 1];
        if (!last || last.x !== pin) pts.push({ x: pin, y: last ? last.y : startY });
        const tail = pts[pts.length - 1];
        if (!tail || Math.abs(tail.y - endY) > 0.5) pts.push({ x: pin, y: endY });
        if (pts.length < 2) {
            pts.push({ x: pin, y: startY });
            pts.push({ x: pin, y: endY });
        }
        return pts;
    }

    function drawTimelineAxis() {
        const svg = $('timelineAxis');
        const stage = $('timelineStage');
        if (!svg || !stage) return;
        const x0 = TL_ORIGIN_X;
        const x1 = axisEnd();
        const y = TL_AXIS_Y;
        svg.setAttribute('viewBox', '0 0 ' + TL_STAGE_W + ' ' + TL_STAGE_H);
        svg.setAttribute('width', TL_STAGE_W);
        svg.setAttribute('height', TL_STAGE_H);
        const parts = [];
        parts.push('<defs><marker id="tl-arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto"><polygon points="0 0, 12 5, 0 10" fill="#a1a1aa"/></marker><marker id="tl-card-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#73737a"/></marker></defs>');
        parts.push('<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#a1a1aa" stroke-width="1.5" marker-end="url(#tl-arrow)"/>');
        parts.push('<circle cx="' + x0 + '" cy="' + y + '" r="4" fill="#e4e4e7"/>');
        const tickStep = 80;
        let n = 0;
        for (let x = x0; x < x1 - 24; x += tickStep) {
            const major = n % 5 === 0;
            parts.push('<line x1="' + x + '" y1="' + (y - (major ? 16 : 7)) + '" x2="' + x + '" y2="' + (y + (major ? 16 : 7)) + '" stroke="' + (major ? '#d4d4d8' : '#52525b') + '" stroke-width="' + (major ? '1.3' : '1') + '"/>');
            if (major) {
                parts.push('<text x="' + x + '" y="' + (y + 34) + '" text-anchor="middle" fill="#71717a" font-size="11" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">' + n + '</text>');
            }
            n += 1;
        }
        const nodes = {};
        stage.querySelectorAll('[data-event]').forEach(function (el) {
            nodes[el.getAttribute('data-event')] = el;
        });
        const boxes = (data.timeline || []).map(function (ev) {
            return tlCardBox(ev, nodes[ev.id]);
        }).filter(function (b) { return b && nodes[b.id]; });
        (data.timeline || []).forEach(function (ev) {
            const el = nodes[ev.id];
            const box = el ? tlCardBox(ev, el) : null;
            const pin = box ? box.pin : (Number(ev.pinX) || x0 + 80);
            const leaving = !!(el && el.classList.contains('is-out'));
            const outClass = leaving ? ' is-out' : '';
            parts.push('<line class="tl-pin' + outClass + '" data-tl-pin="' + esc(ev.id) + '" pathLength="1" x1="' + pin + '" y1="' + (y - 22) + '" x2="' + pin + '" y2="' + (y + 22) + '" stroke="#fafafa" stroke-width="1.6"/>');
            if (box) {
                const ends = tlStemEnds(box, y);
                let pts = tlStemPoints(ends.pin, ends.tickY, ends.cardY, ev.id, boxes);
                if (pts.length < 2) {
                    pts = [{ x: ends.pin, y: ends.tickY }, { x: ends.pin, y: ends.cardY }];
                }
                pts[0] = { x: ends.pin, y: ends.tickY };
                pts[pts.length - 1] = { x: ends.pin, y: ends.cardY };
                pts.reverse();
                let d = tlOrthoPath(pts, 10);
                if (!d) d = 'M' + ends.pin + ' ' + ends.cardY + ' L' + ends.pin + ' ' + ends.tickY;
                parts.push('<path class="tl-stem' + outClass + '" data-tl-stem="' + esc(ev.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#a1a1aa" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>');
            }
            if (ev.date) {
                parts.push('<text class="tl-pin-date' + outClass + '" data-tl-pin-date="' + esc(ev.id) + '" x="' + pin + '" y="' + (y - 40) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(formatDayLabel(ev.date)) + '</text>');
            }
        });
        (data.timeline || []).forEach(function (ev) {
            (ev.links || []).forEach(function (link) {
                const b = (data.timeline || []).find(function (item) { return item.id === link.to; });
                if (!b || b.id === ev.id) return;
                const boxA = tlCardBox(ev, nodes[ev.id]);
                const boxB = tlCardBox(b, nodes[b.id]);
                if (!boxA || !boxB) return;
                const d = tlCardLinkPath(boxA, boxB);
                if (!d) return;
                const elA = nodes[ev.id];
                const elB = nodes[b.id];
                const leaving = !!(elA && elA.classList.contains('is-out')) || !!(elB && elB.classList.contains('is-out'));
                parts.push('<path class="tl-card-link' + (leaving ? ' is-out' : '') + '" data-tl-link-a="' + esc(ev.id) + '" data-tl-link-b="' + esc(b.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#73737a" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" marker-end="url(#tl-card-arrow)"/>');
            });
        });
        svg.innerHTML = parts.join('');
    }

