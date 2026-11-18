/* Timeline create, edit, menus, links */
    function nextCardTitle() {
        return 'Untitled Card';
    }

    function isDefaultCardTitle(title) {
        const t = String(title || '').trim();
        return !t || /^untitled card$/i.test(t) || /^Card\s*#\{\d+\}$/i.test(t);
    }

    function addEventAt(x, side, spawn) {
        hideTimelineIsland();
        rememberTimeline();
        const pinX = clampTimelineX(x);
        const ev = {
            id: uid('ev'),
            title: nextCardTitle(),
            date: '',
            time: '',
            body: '',
            entities: '',
            source: '',
            evidence: '',
            image: '',
            createdAt: new Date().toISOString(),
            links: [],
            pinX: pinX,
            side: side === 1 ? 1 : -1,
            pinned: true,
            spawn: !!spawn,
            mini: false
        };
        data.timeline.push(ev);
        selectedEvent = ev.id;
        hideTlFollow();
        renderTimeline();
        schedulePersist();
        requestAnimationFrame(function () {
            const node = document.querySelector('[data-event="' + ev.id + '"]');
            if (node && spawn) {
                node.addEventListener('animationend', function () {
                    node.classList.remove('is-spawn');
                    stackTimelineStems();
                    drawTimelineAxis();
                }, { once: true });
            }
            const title = node && node.querySelector('[data-tl-field="title"]');
            if (title) title.focus();
        });
        return ev;
    }

    function attachTimelineImage(id, src) {
        let rec = (data.timeline || []).find(function (item) { return item.id === id; });
        if (!rec) {
            rec = addEventAt(tlAimX, -1, true);
        }
        if (!rec || !src) return rec;
        rememberTimeline();
        rec.image = src;
        renderTimeline();
        schedulePersist();
        return rec;
    }

    function expandTimelineImage(src) {
        if (!src) return;
        const viewer = $('mediaViewer');
        const image = $('mediaImage');
        const card = $('mediaAudioCard');
        const audio = $('mediaAudio');
        if (!viewer || !image) return;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
        }
        if (card) card.hidden = true;
        image.hidden = false;
        image.src = src;
        viewer.hidden = false;
    }

    function recenterTimeline() {
        const view = $('timelineView');
        const y = view ? Math.round(view.clientHeight / 2 - TL_AXIS_Y) : 40;
        easeTimelineCam({ x: 48, y: y, z: 1 });
    }

    function openEventEditor(id) {
        const sheet = $('eventSheet');
        const ev = id ? (data.timeline || []).find(function (item) { return item.id === id; }) : null;
        $('eventEditId').value = ev ? ev.id : '';
        $('eventTitle').value = ev ? (ev.title || '') : '';
        $('eventDate').value = ev ? (ev.date || '') : '';
        syncEventDateBtn();
        $('eventTime').value = ev ? (ev.time || '') : '';
        $('eventBody').value = ev ? (ev.body || '') : '';
        $('eventEntities').value = ev ? (ev.entities || '') : '';
        $('eventSource').value = ev ? (ev.source || '') : '';
        $('eventEvidence').value = ev ? (ev.evidence || '') : '';
        $('eventImage').value = ev ? (ev.image || '') : '';
        fillEventImagePick();
        showSheet(sheet);
        const title = $('eventTitle');
        if (title) title.focus();
    }

    function fillEventImagePick() {
        const sel = $('eventImagePick');
        if (!sel) return;
        const items = imageItems();
        sel.innerHTML = '<option value="">Attach a case photo…</option>' + items.map(function (item, i) {
            return '<option value="' + esc(item.src) + '">Photo ' + (i + 1) + (item.primary ? ' (primary)' : '') + '</option>';
        }).join('');
    }

    function saveEventEditor() {
        const id = $('eventEditId').value;
        const payload = {
            id: id || uid('ev'),
            title: $('eventTitle').value.trim(),
            date: $('eventDate').value,
            time: $('eventTime').value,
            body: $('eventBody').value.trim(),
            entities: $('eventEntities').value.trim(),
            source: $('eventSource').value.trim(),
            evidence: $('eventEvidence').value.trim(),
            image: $('eventImage').value.trim(),
            createdAt: ''
        };
        if (!payload.title && !payload.body && !payload.date) return;
        rememberTimeline();
        const existing = (data.timeline || []).find(function (item) { return item.id === payload.id; });
        if (existing) {
            payload.createdAt = existing.createdAt || new Date().toISOString();
            payload.links = existing.links || [];
            payload.pinX = existing.pinX;
            payload.side = existing.side;
            payload.pinY = existing.pinY;
            payload.pinned = existing.pinned;
            payload.free = existing.free;
            payload.mini = existing.mini;
            payload.locked = existing.locked;
            payload.titleH = existing.titleH;
            payload.noteH = existing.noteH;
            payload.w = existing.w;
            payload.h = existing.h;
            Object.assign(existing, payload);
        } else {
            if (!payload.title) payload.title = nextCardTitle();
            payload.createdAt = new Date().toISOString();
            payload.links = [];
            payload.pinned = false;
            data.timeline.push(payload);
        }
        hideSheet($('eventSheet'));
        selectedEvent = payload.id;
        renderTimeline();
        schedulePersist();
    }

    function markTimelineStemOut(id) {
        const svg = $('timelineAxis');
        if (!svg || !id) return;
        const sel = '[data-tl-stem="' + id + '"], [data-tl-pin="' + id + '"], [data-tl-pin-date="' + id + '"], [data-tl-link-a="' + id + '"], [data-tl-link-b="' + id + '"]';
        svg.querySelectorAll(sel).forEach(function (el) { el.classList.add('is-out'); });
    }

    function deleteEvent(id) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (node && node.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            data.timeline = (data.timeline || []).filter(function (item) { return item.id !== id; });
            data.timeline.forEach(function (item) {
                item.links = (item.links || []).filter(function (link) { return link.to !== id; });
            });
            if (selectedEvent === id) selectedEvent = '';
            if (connectFrom === id) connectFrom = '';
            renderTimeline();
            schedulePersist();
        }
        if (node && !reduceMotion()) {
            node.classList.add('is-out');
            markTimelineStemOut(id);
            afterEase(node, commit);
            return;
        }
        commit();
    }

    function toggleConnect(id) {
        if (connectFrom && connectFrom !== id) {
            rememberTimeline();
            const from = (data.timeline || []).find(function (item) { return item.id === connectFrom; });
            if (from) {
                from.links = from.links || [];
                if (!from.links.some(function (link) { return link.to === id; })) {
                    from.links.push({ to: id, label: '' });
                }
            }
            connectFrom = '';
            renderTimeline();
            schedulePersist();
            return;
        }
        connectFrom = connectFrom === id ? '' : id;
        timelineConnectOn = !!connectFrom;
        renderTimeline();
    }

    function findTimelineEvent(id) {
        return (data.timeline || []).find(function (item) { return item.id === id; }) || null;
    }

    function cloneTimelinePayload(ev, dx, dy) {
        const copy = JSON.parse(JSON.stringify(ev || {}));
        copy.id = uid('ev');
        copy.createdAt = new Date().toISOString();
        copy.links = [];
        copy.locked = false;
        copy.pinned = true;
        copy.free = true;
        copy.spawn = true;
        copy.pinX = clampTimelineX((Number(ev && ev.pinX) || TL_ORIGIN_X + 160) + (dx == null ? 48 : dx));
        copy.pinY = (Number(ev && ev.pinY) || TL_AXIS_Y - 180) + (dy == null ? 28 : dy);
        return copy;
    }

    function copyTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        tlClip = JSON.parse(JSON.stringify(rec));
    }

    function cutTimelineEvent(id) {
        copyTimelineEvent(id);
        deleteEvent(id);
    }

    function pasteTimelineEvent() {
        if (!tlClip) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(tlClip);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        if (tlDropAt) {
            copy.pinX = clampTimelineX(tlDropAt.x);
            copy.pinY = tlDropAt.y;
        }
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function duplicateTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(rec);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function clearTimelineLinks(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.links = [];
        (data.timeline || []).forEach(function (other) {
            other.links = (other.links || []).filter(function (link) { return link.to !== id; });
        });
        renderTimeline();
        schedulePersist();
    }

    function flipTimelineSide(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.side = rec.side === 1 ? -1 : 1;
        rec.free = true;
        rec.pinned = true;
        const el = document.querySelector('#timelineList [data-event="' + id + '"]');
        const h = el ? el.offsetHeight : 128;
        rec.pinY = rec.side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
        renderTimeline();
        schedulePersist();
    }

    function layerTimelineEvent(id, dir) {
        const list = data.timeline || [];
        const i = list.findIndex(function (item) { return item.id === id; });
        if (i < 0) return;
        rememberTimeline();
        const rec = list.splice(i, 1)[0];
        if (dir === 'front') list.push(rec);
        else if (dir === 'back') list.unshift(rec);
        else if (dir === 'up' || dir === 'forward') list.splice(Math.min(list.length, i + 1), 0, rec);
        else list.splice(Math.max(0, i - 1), 0, rec);
        selectedEvent = id;
        renderTimeline();
        schedulePersist();
    }

    function toggleTimelineLock(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.locked = !rec.locked;
        renderTimeline();
        schedulePersist();
    }

    function hideTimelineMenu() {
        const menu = $('timelineMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        tlMenuId = '';
    }

    function placeTimelineMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        const rect = view.getBoundingClientRect();
        const maxH = Math.max(160, rect.height - 16);
        menu.style.maxHeight = maxH + 'px';
        const left = Math.min(Math.max(8, clientX - rect.left), Math.max(8, rect.width - 248));
        const menuH = Math.min(menu.scrollHeight || 320, maxH);
        const top = Math.min(Math.max(8, clientY - rect.top), Math.max(8, rect.height - menuH - 8));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function placeCardAtDrop(side) {
        const at = tlDropAt || { x: tlAimX, y: TL_AXIS_Y };
        const useSide = side == null ? (at.y >= TL_AXIS_Y ? 1 : -1) : side;
        const ev = addEventAt(at.x, useSide, true);
        if (!ev) return null;
        ev.free = true;
        ev.pinned = true;
        ev.pinY = at.y;
        renderTimeline();
        return ev;
    }

    function showTimelineCanvasMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        tlMenuId = '';
        selectedEvent = '';
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        let html = '';
        html += menuItem('data-tl-ctx="add"', 'note', 'Add card');
        html += menuItem('data-tl-ctx="add-above"', 'up', 'Add card above');
        html += menuItem('data-tl-ctx="add-below"', 'down', 'Add card below');
        html += menuItem('data-tl-ctx="add-image"', 'image', 'Insert image');
        html += '<hr>';
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', timelineConnectOn ? 'Stop connecting' : 'Connect cards');
        html += '<hr>';
        html += menuItem('data-tl-ctx="recenter"', 'recenter', 'Recenter');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function showTimelineCardMenu(clientX, clientY, id) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        const rec = findTimelineEvent(id);
        if (!menu || !view || !rec) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        selectedEvent = id;
        tlMenuId = id;
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
            el.classList.toggle('is-on', el.getAttribute('data-event') === id);
        });
        let html = '';
        html += menuItem('data-tl-ctx="cut"', 'cut', 'Cut', '<span class="board-kbd">Ctrl+X</span>');
        html += menuItem('data-tl-ctx="copy"', 'copy', 'Copy', '<span class="board-kbd">Ctrl+C</span>');
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += '<hr>';
        html += menuItem('data-tl-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', connectFrom === id ? 'Pick second card' : 'Connect cards');
        html += menuItem('data-tl-ctx="clear-links"', 'clear-links', 'Clear connections');
        html += '<hr>';
        html += menuItem('data-tl-ctx="date"', 'calendar', rec.date ? 'Change date' : 'Add date');
        html += menuItem('data-tl-ctx="time"', 'clock', rec.time ? 'Change time' : 'Add time');
        html += menuItem('data-tl-ctx="image"', 'image', rec.image ? 'Replace image' : 'Attach image');
        html += menuItem('data-tl-ctx="mini"', rec.mini ? 'expand' : 'mini', rec.mini ? 'Expand' : 'Minimize');
        html += menuItem('data-tl-ctx="flip"', 'flip-v', rec.side === 1 ? 'Move above axis' : 'Move below axis');
        html += '<hr>';
        html += menuItem('data-tl-ctx="up"', 'up', 'Bring forward');
        html += menuItem('data-tl-ctx="down"', 'down', 'Send backward');
        html += menuItem('data-tl-ctx="front"', 'front', 'Bring to front');
        html += menuItem('data-tl-ctx="back"', 'back', 'Send to back');
        html += '<hr>';
        html += menuItem('data-tl-ctx="lock"', rec.locked ? 'unlock' : 'lock', rec.locked ? 'Unlock' : 'Lock');
        html += '<hr>' + menuItem('data-tl-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function runTimelineMenu(act, id) {
        hideTimelineMenu();
        if (!act) return;
        if (act === 'add' || act === 'add-above' || act === 'add-below') {
            const side = act === 'add-above' ? -1 : act === 'add-below' ? 1 : null;
            placeCardAtDrop(side);
            return;
        }
        if (act === 'add-image') {
            const ev = placeCardAtDrop(null);
            if (ev) {
                timelinePhotoId = ev.id;
                const input = $('timelineImageFile');
                if (input) input.click();
            }
            return;
        }
        if (act === 'recenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        if (act === 'cut' && id) cutTimelineEvent(id);
        if (act === 'copy' && id) copyTimelineEvent(id);
        if (act === 'paste') pasteTimelineEvent();
        if (act === 'duplicate' && id) duplicateTimelineEvent(id);
        if (act === 'connect') {
            if (id) toggleConnect(id);
            else {
                timelineConnectOn = !timelineConnectOn;
                if (!timelineConnectOn) connectFrom = '';
                applyTimelineCam();
                renderTimeline();
            }
        }
        if (act === 'clear-links' && id) clearTimelineLinks(id);
        if (act === 'date' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
        }
        if (act === 'time' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-time]');
            if (btn) openTimePicker(btn);
        }
        if (act === 'image' && id) {
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        }
        if (act === 'mini' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] [data-tl-mini]');
            if (btn) btn.click();
        }
        if (act === 'flip' && id) flipTimelineSide(id);
        if (act === 'up' && id) layerTimelineEvent(id, 'up');
        if (act === 'down' && id) layerTimelineEvent(id, 'down');
        if (act === 'front' && id) layerTimelineEvent(id, 'front');
        if (act === 'back' && id) layerTimelineEvent(id, 'back');
        if (act === 'lock' && id) toggleTimelineLock(id);
        if (act === 'delete' && id) deleteEvent(id);
    }
