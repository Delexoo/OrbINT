/* Pointers, shortcuts, init */


    function bindTimelinePointers() {
        const view = $('timelineView');
        const stage = $('timelineStage');
        if (!view || !stage || view.dataset.bound) return;
        view.dataset.bound = '1';
        let drag = null;
        function stopMiddleAutoscroll(event) {
            if (event.button === 1) event.preventDefault();
        }
        view.addEventListener('mousedown', stopMiddleAutoscroll, true);
        view.addEventListener('auxclick', stopMiddleAutoscroll);
        view.addEventListener('pointerdown', function (event) {
            if (event.target.closest('#timelineMenu, #timelineIsland, #calPop, #timePop, #tlInfoPop')) return;
            hideTimelineMenu();
            if (event.target.closest('.board-bar, .work-ghost')) return;
            if (!event.target.closest('[data-tl-rs]')) {
                if (event.target.closest('button, input, textarea, [contenteditable="true"], .tl-attach, .tl-media, .tl-acts')) return;
            }
            if (event.button === 1) {
                event.preventDefault();
                const cam = timelineCam();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: false };
                view.classList.add('is-grabbing');
                hideTlFollow();
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan')) {
                const cam = timelineCam();
                event.preventDefault();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: false };
                view.classList.add('is-grabbing');
                hideTlFollow();
                view.setPointerCapture(event.pointerId);
                return;
            }
            const node = event.target.closest('.tl-node');
            if (event.target.closest('[data-tl-cal], [data-tl-time], [data-tl-info], #calPop, #timePop, #tlInfoPop')) return;
            if (calState) closeCalendar();
            if (timeState) closeTimePicker();
            if (infoState) closeTlInfoPop();
            if (node) {
                const id = node.getAttribute('data-event');
                const rec = (data.timeline || []).find(function (n) { return n.id === id; });
                if (timelineConnectOn) {
                    event.preventDefault();
                    toggleConnect(id);
                    return;
                }
                selectedEvent = id;
                stage.querySelectorAll('.tl-node').forEach(function (el) {
                    el.classList.toggle('is-on', el.getAttribute('data-event') === id);
                });
                hideTlFollow();
                if (!rec || rec.locked) return;
                const rs = event.target.closest('[data-tl-rs]');
                if (rs && !event.target.closest('.tl-card, button, input, [contenteditable="true"]')) {
                    event.preventDefault();
                    const startY = rec && rec.pinY != null ? Number(rec.pinY) : (parseFloat(node.style.top) || 0);
                    drag = {
                        mode: 'resize',
                        id: id,
                        handle: rs.getAttribute('data-tl-rs') || 'se',
                        x: event.clientX,
                        y: event.clientY,
                        ox: rec ? rec.pinX : 0,
                        oy: startY,
                        ow: tlCardW(rec),
                        oh: tlCardH(rec) || node.offsetHeight,
                        moved: false
                    };
                    view.style.cursor = tlResizeCursor(drag.handle);
                    view.setPointerCapture(event.pointerId);
                    return;
                }
                if (!event.target.closest('.tl-bar')) return;
                event.preventDefault();
                rememberTimeline('move:' + id);
                const startY = rec && rec.pinY != null ? Number(rec.pinY) : (parseFloat(node.style.top) || 0);
                drag = {
                    mode: 'free',
                    id: id,
                    x: event.clientX,
                    y: event.clientY,
                    ox: rec ? rec.pinX : 0,
                    oy: startY
                };
                node.classList.add('is-moving');
                view.setPointerCapture(event.pointerId);
                return;
            }
            event.preventDefault();
            const world = timelineWorldAt(event.clientX, event.clientY);
            const cam = world.cam;
            if (nearTlAxis(world) && !timelineConnectOn) {
                hideTimelineIsland();
                drag = { mode: 'mark', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, worldX: world.x, worldY: world.y };
                view.setPointerCapture(event.pointerId);
                return;
            }
            drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: true };
            hideTlFollow();
            view.setPointerCapture(event.pointerId);
        });
        view.addEventListener('pointermove', function (event) {
            const world = timelineWorldAt(event.clientX, event.clientY);
            if (!drag) {
                updateTlFollow(world, event.target.closest('.tl-node'));
                return;
            }
            const cam = timelineCam();
            const z = cam.z || 1;
            if (drag.mode === 'mark') {
                if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
                    drag.mode = 'pan';
                    drag.moved = true;
                    drag.openMenu = false;
                    view.classList.add('is-grabbing');
                    hideTlFollow();
                    cam.x = drag.ox + (event.clientX - drag.x);
                    cam.y = drag.oy + (event.clientY - drag.y);
                    applyTimelineCam();
                } else {
                    updateTlFollow(world, false);
                }
                return;
            }
            if (drag.mode === 'pan') {
                if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) drag.moved = true;
                if (!drag.moved) return;
                view.classList.add('is-grabbing');
                cam.x = drag.ox + (event.clientX - drag.x);
                cam.y = drag.oy + (event.clientY - drag.y);
                applyTimelineCam();
                return;
            }
            if (drag.mode === 'resize') {
                if (!drag.moved) {
                    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
                    drag.moved = true;
                    rememberTimeline('resize:' + drag.id);
                    const live = stage.querySelector('[data-event="' + drag.id + '"]');
                    if (live) live.classList.add('is-resizing');
                }
                const rec = (data.timeline || []).find(function (n) { return n.id === drag.id; });
                if (!rec) return;
                applyTlResize(rec, drag, (event.clientX - drag.x) / z, (event.clientY - drag.y) / z);
                const el = stage.querySelector('[data-event="' + drag.id + '"]');
                if (el) {
                    placeTlCard(el, rec);
                    el.setAttribute('data-side', rec.side === 1 ? '1' : '-1');
                }
                drawTimelineAxis();
                return;
            }
            if (drag.mode === 'free' || drag.mode === 'node') {
                const rec = (data.timeline || []).find(function (n) { return n.id === drag.id; });
                if (!rec) return;
                rec.pinX = clampTimelineX(drag.ox + (event.clientX - drag.x) / z);
                rec.pinY = drag.oy + (event.clientY - drag.y) / z;
                rec.pinned = true;
                rec.free = true;
                const el = stage.querySelector('[data-event="' + drag.id + '"]');
                const boxH = el ? el.offsetHeight : 128;
                rec.side = (rec.pinY + boxH / 2) >= TL_AXIS_Y ? 1 : -1;
                if (el) {
                    placeTlCard(el, rec);
                    el.setAttribute('data-side', rec.side === 1 ? '1' : '-1');
                }
                drawTimelineAxis();
                return;
            }
        });
        view.addEventListener('pointerup', function () {
            view.classList.remove('is-grabbing');
            view.style.cursor = '';
            stage.querySelectorAll('.tl-node.is-moving').forEach(function (el) { el.classList.remove('is-moving'); });
            stage.querySelectorAll('.tl-node.is-resizing').forEach(function (el) { el.classList.remove('is-resizing'); });
            if (drag && drag.mode === 'mark') {
                addEventAt(drag.worldX, drag.worldY >= TL_AXIS_Y ? 1 : -1, true);
            }
            if (drag && drag.mode === 'pan' && !drag.moved && drag.openMenu) {
                showTimelineCanvasMenu(drag.x, drag.y);
            }
            if (drag && (drag.mode === 'node' || drag.mode === 'free' || (drag.mode === 'resize' && drag.moved))) {
                stackTimelineStems(drag.id);
                drawTimelineAxis();
                schedulePersist();
            }
            if (drag && drag.mode === 'pan' && drag.moved) schedulePersist();
            drag = null;
        });
        view.addEventListener('pointercancel', function () {
            view.classList.remove('is-grabbing');
            view.style.cursor = '';
            stage.querySelectorAll('.tl-node.is-moving').forEach(function (el) { el.classList.remove('is-moving'); });
            stage.querySelectorAll('.tl-node.is-resizing').forEach(function (el) { el.classList.remove('is-resizing'); });
            drag = null;
            hideTlFollow();
        });
        view.addEventListener('pointerleave', function () {
            if (!drag) hideTlFollow();
        });
        view.addEventListener('wheel', function (event) {
            event.preventDefault();
            const cam = timelineCam();
            const rect = view.getBoundingClientRect();
            const prev = cam.z || 1;
            const next = Math.min(3.2, Math.max(0.2, prev * (event.deltaY > 0 ? 0.92 : 1.08)));
            const px = event.clientX - rect.left;
            const py = event.clientY - rect.top;
            const wx = (px - cam.x) / prev;
            const wy = (py - cam.y) / prev;
            cam.z = next;
            cam.x = px - wx * next;
            cam.y = py - wy * next;
            applyTimelineCam();
            schedulePersist();
        }, { passive: false });
        view.addEventListener('dragover', function (event) {
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
            event.preventDefault();
        });
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            if (!file || String(file.type || '').indexOf('image/') !== 0) return;
            const card = event.target.closest && event.target.closest('.tl-node');
            const rec = (data.timeline || []).find(function (item) {
                return item.id === (card ? card.getAttribute('data-event') : selectedEvent);
            }) || addEventAt(tlAimX, -1, true);
            const reader = new FileReader();
            reader.onload = function () { attachTimelineImage(rec.id, String(reader.result || '')); };
            reader.readAsDataURL(file);
        });
        view.addEventListener('contextmenu', function (event) {
            if (event.target.closest('#timelineMenu, #timelineIsland, .board-bar')) return;
            event.preventDefault();
            const node = event.target.closest('.tl-node');
            if (node) showTimelineCardMenu(event.clientX, event.clientY, node.getAttribute('data-event'));
            else showTimelineCanvasMenu(event.clientX, event.clientY);
        });
    }

    function onClick(event) {
        if (event.target.closest('#calPop')) {
            onCalendarClick(event);
            return;
        }
        if (event.target.closest('#timePop')) {
            onTimeClick(event);
            return;
        }
        if (event.target.closest('#tlInfoPop')) {
            onTlInfoClick(event);
            return;
        }
        const calBtn = event.target.closest('[data-tl-cal], [data-fact-cal], #eventDateBtn') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-cal], #eventDateBtn');
        if (calBtn) {
            event.preventDefault();
            openCalendar(calBtn);
            return;
        }
        const timeBtn = event.target.closest('[data-tl-time], [data-fact-time]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-time]');
        if (timeBtn) {
            event.preventDefault();
            openTimePicker(timeBtn);
            return;
        }
        const infoBtn = event.target.closest('[data-tl-info]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-info]');
        if (infoBtn) {
            event.preventDefault();
            openTlInfoPop(infoBtn);
            return;
        }
        if (calState) closeCalendar();
        if (timeState) closeTimePicker();
        if (infoState) closeTlInfoPop();
        const tlAct = event.target.closest('[data-tl-ctx]');
        if (tlAct) {
            runTimelineMenu(tlAct.getAttribute('data-tl-ctx'), tlMenuId || selectedEvent);
            return;
        }
        if (!event.target.closest('#timelineMenu')) hideTimelineMenu();
        const pageBtn = event.target.closest('[data-page]');
        if (pageBtn && pageBtn.closest('#pageSwitch')) {
            setPage(pageBtn.getAttribute('data-page'));
            return;
        }
        const uploadBtn = event.target.closest('[data-wb-upload]');
        if (uploadBtn) {
            const node = uploadBtn.closest('.wb-node');
            openBoardImagePicker(node && node.dataset.node);
            return;
        }

        const addEv = event.target.closest('#timelineAdd, #timelineEmptyAdd');
        if (addEv) {
            const events = data.timeline || [];
            let x = 220;
            events.forEach(function (ev) { x = Math.max(x, (Number(ev.pinX) || 0) + TL_GAP); });
            addEventAt(x, events.length % 2 === 0 ? -1 : 1);
            return;
        }
        const foldBit = event.target.closest('[data-tl-fold]');
        if (foldBit) {
            event.preventDefault();
            toggleTlBit(foldBit.getAttribute('data-event'), foldBit.getAttribute('data-tl-fold'), foldBit.getAttribute('data-note-id'));
            return;
        }
        const dropBit = event.target.closest('[data-tl-drop]');
        if (dropBit) {
            event.preventDefault();
            dropTlBit(dropBit.getAttribute('data-event'), dropBit.getAttribute('data-tl-drop'), dropBit.getAttribute('data-note-id'));
            return;
        }
        const delEv = event.target.closest('[data-del-event]');
        if (delEv) { deleteEvent(delEv.getAttribute('data-del-event')); return; }
        const miniBtn = event.target.closest('[data-tl-mini]');
        if (miniBtn) {
            const id = miniBtn.getAttribute('data-tl-mini');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            const node = miniBtn.closest('.tl-node');
            if (rec && node) {
                rememberTimeline();
                rec.mini = !rec.mini;
                node.classList.toggle('is-mini', rec.mini);
                placeTlCard(node, rec);
                miniBtn.title = rec.mini ? 'Expand' : 'Minimize';
                miniBtn.setAttribute('aria-label', rec.mini ? 'Expand' : 'Minimize');
                miniBtn.setAttribute('aria-expanded', rec.mini ? 'false' : 'true');
                const extra = node.querySelector('.tl-extra');
                const finish = function () {
                    stackTimelineStems();
                    drawTimelineAxis();
                };
                if (reduceMotion()) {
                    finish();
                } else {
                    let frames = 0;
                    const tick = function () {
                        stackTimelineStems();
                        drawTimelineAxis();
                        frames += 1;
                        if (frames < 22) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                    if (extra) extra.addEventListener('transitionend', finish, { once: true });
                }
                schedulePersist();
            }
            return;
        }
        const clearImg = event.target.closest('[data-tl-clear-img]');
        if (clearImg) {
            const id = clearImg.getAttribute('data-tl-clear-img');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.image = '';
                if (rec.show) rec.show.image = false;
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const delNote = event.target.closest('[data-tl-del-note]');
        if (delNote) {
            const id = delNote.getAttribute('data-event');
            const nid = delNote.getAttribute('data-tl-del-note');
            const rec = findTimelineEvent(id);
            if (rec) {
                rememberTimeline();
                rec.moreNotes = (rec.moreNotes || []).filter(function (note) { return note.id !== nid; });
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const expandImg = event.target.closest('[data-tl-expand], .tl-thumb');
        if (expandImg && expandImg.closest('.tl-media')) {
            const id = expandImg.getAttribute('data-tl-expand') || (expandImg.closest('[data-event]') && expandImg.closest('[data-event]').getAttribute('data-event'));
            const rec = findTimelineEvent(id);
            if (rec && rec.image) expandTimelineImage(rec.image);
            return;
        }
        const photoBtn = event.target.closest('[data-tl-photo]');
        if (photoBtn) {
            timelinePhotoId = photoBtn.getAttribute('data-tl-photo');
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        const conEv = event.target.closest('[data-connect-event]');
        if (conEv) { toggleConnect(conEv.getAttribute('data-connect-event')); return; }
        if (event.target.closest('#timelineIsland')) {
            timelineConnectOn = false;
            connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.closest('#timelineConnectBtn, [data-tl-connect]')) {
            timelineConnectOn = !timelineConnectOn;
            if (!timelineConnectOn) connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.id === 'timelineDelete' && selectedEvent) {
            deleteEvent(selectedEvent);
            return;
        }
        if (event.target.id === 'timelineRecenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        const selEv = event.target.closest('[data-event]');
        if (selEv && selEv.closest('#timelineList') && !event.target.closest('button, input, [contenteditable="true"]')) {
            const id = selEv.getAttribute('data-event');
            if (timelineConnectOn || connectFrom) { toggleConnect(id); return; }
            selectedEvent = id;
            document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
                el.classList.toggle('is-on', el.getAttribute('data-event') === id);
            });
            return;
        }
        if (event.target.id === 'eventCancel' || event.target.id === 'eventClose') { hideSheet($('eventSheet')); return; }
        if (event.target.id === 'eventSheet') hideSheet($('eventSheet'));

        const done = event.target.closest('[data-board-done]');
        if (done) { toggleBoardDone(done.getAttribute('data-board-done')); return; }
        const addKind = event.target.closest('[data-board-add]');
        if (addKind) { placeFromMenu(addKind.getAttribute('data-board-add')); return; }
        const addFact = event.target.closest('[data-board-add-fact]');
        if (addFact) {
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec) {
                rec.type = 'data';
                rec.shape = typeMeta('data').shape || 'data';
                rec.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                rec.body = addFact.getAttribute('data-fact-value') || '';
                renderWhiteboard();
                schedulePersist();
                return;
            }
            const node = addBoardNode('data', at);
            if (node) {
                node.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                node.body = addFact.getAttribute('data-fact-value') || '';
            renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPhoto = event.target.closest('[data-board-add-photo]');
        if (addPhoto) {
            const photos = imageItems();
            const item = photos[Number(addPhoto.getAttribute('data-board-add-photo'))];
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec && item) {
                rec.type = 'image';
                rec.shape = typeMeta('image').shape || 'image';
                rec.src = item.src;
                rec.title = item.name || item.value || rec.title || 'Photo';
            renderWhiteboard();
            schedulePersist();
            return;
        }
            const node = addBoardNode('image', at);
            if (node && item) {
                node.src = item.src;
                node.title = item.name || item.value || 'Photo';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPlay = event.target.closest('[data-board-add-play]');
        if (addPlay) {
            const at = boardDropAt;
            hideBoardAddMenu();
            insertPlaybook(addPlay.getAttribute('data-board-add-play'), at);
            return;
        }
        const addUpload = event.target.closest('[data-board-add-upload]');
        if (addUpload) {
            hideBoardAddMenu(true);
            const input = $('boardImageFile');
            if (input) input.click();
            return;
        }
        const moreBtn = event.target.closest('[data-board-more]');
        if (moreBtn) {
            hideBoardAddMenu();
            closeBoardPresets();
            const more = $('boardMoreMenu');
            if (more && !more.hidden) hideBoardMore();
            else showBoardMore();
            return;
        }
        if (event.target.closest('[data-board-presets]')) {
            hideBoardAddMenu();
            hideBoardMore();
            const sheet = $('boardPresetSheet');
            if (sheet && !sheet.hidden) closeBoardPresets();
            else openBoardPresets();
            return;
        }
        if (event.target.id === 'boardPresetClose' || event.target.id === 'boardPresetSheet') {
            closeBoardPresets();
            return;
        }
        const presetPick = event.target.closest('[data-board-preset]');
        if (presetPick) {
            insertBoardPreset(presetPick.getAttribute('data-board-preset'));
            return;
        }
        const more = $('boardMoreMenu');
        if (more && !more.hidden && !event.target.closest('#boardMoreMenu, [data-board-more]')) hideBoardMore();
        const addMenu = $('boardAddMenu');
        if (addMenu && !addMenu.hidden) {
            if (addMenu.dataset.skip) {
                delete addMenu.dataset.skip;
            } else if (!event.target.closest('#boardAddMenu')) {
                hideBoardAddMenu();
            }
        }
        const stroke = event.target.closest('[data-board-stroke]');
        if (stroke && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.stroke = stroke.getAttribute('data-board-stroke');
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const fill = event.target.closest('[data-board-fill]');
        if (fill && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.fill = fill.getAttribute('data-board-fill');
                boardPaintFill = rec.fill;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const sw = event.target.closest('[data-board-sw]');
        if (sw && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.sw = Number(sw.getAttribute('data-board-sw')) || 1.75;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const dash = event.target.closest('[data-board-dash]');
        if (dash && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.dash = dash.getAttribute('data-board-dash') || 'solid';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const edge = event.target.closest('[data-board-edge]');
        if (edge && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.edge = edge.getAttribute('data-board-edge') || 'round';
                rec.radius = rec.edge === 'sharp' ? 0 : 12;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('[data-board-grid]')) {
            data.whiteboard.grid = data.whiteboard.grid === false;
            hideBoardAddMenu();
            renderWhiteboard();
            schedulePersist();
            return;
        }
        const ctx = event.target.closest('[data-board-ctx]');
        if (ctx) {
            const act = ctx.getAttribute('data-board-ctx');
            const drop = boardDropAt;
            hideBoardAddMenu();
            if (act === 'cut' && boardSelected) cutBoardNode(boardSelected);
            if (act === 'copy' && boardSelected) copyBoardNode(boardSelected);
            if (act === 'paste') pasteBoardNode(drop || { x: 180, y: 140 });
            if (act === 'duplicate' && boardLinkSelected) duplicateBoardLink(boardLinkSelected);
            else if (act === 'duplicate' && boardSelected) duplicateBoardNode(boardSelected);
            if (act === 'clear-links' && boardSelected) clearBoardLinks(boardSelected);
            if (act === 'detach' && boardLinkSelected) detachBoardLink(boardLinkSelected, 'both');
            if (act === 'copy-style' && (boardSelected || boardLinkSelected)) copyBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'paste-style' && (boardSelected || boardLinkSelected)) pasteBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'flip-h' && boardSelected) flipBoardNode(boardSelected, 'h');
            if (act === 'flip-v' && boardSelected) flipBoardNode(boardSelected, 'v');
            if (act === 'link' && boardSelected) setBoardHref(boardSelected);
            if (act === 'lock' && boardSelected) toggleBoardLock(boardSelected);
            if (act === 'delete' && boardLinkSelected) deleteBoardLink(boardLinkSelected);
            else if (act === 'delete' && boardSelected) deleteBoardNode(boardSelected);
            if (act === 'recenter') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            }
            return;
        }
        const tool = event.target.closest('[data-board-tool]');
        if (tool) {
            hideBoardMore();
            hideBoardAddMenu();
            boardDrawToShape = false;
            boardTool = tool.getAttribute('data-board-tool');
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return;
        }
        const action = event.target.closest('[data-board-action]');
        if (action) {
            hideBoardMore();
            hideBoardAddMenu();
            const act = action.getAttribute('data-board-action');
            if (act === 'draw-shape') startDrawToShape();
            if (act === 'text-diagram') {
                const raw = window.prompt('Text to diagram\nUse lines, and arrows like Alice -> Bob', '');
                if (raw) textToDiagram(raw);
            }
            if (act === 'mermaid') {
                const raw = window.prompt('Mermaid flowchart\nExample:\ngraph TD\nA[Start] --> B{Check}\nB --> C[Done]', '');
                if (raw) mermaidToDiagram(raw);
            }
            if (act === 'wireframe') {
                const raw = window.prompt('Wireframe to code\nOne section per line. HTML is copied to the clipboard.', 'Header\nSearch\nResults\nFooter');
                if (raw) wireframeToCode(raw);
            }
            return;
        }
        if (event.target.closest('[data-board-lock]')) {
            boardToolLock = !boardToolLock;
            syncBoardTools();
            return;
        }
        if (event.target.closest('[data-board-undo]')) {
            undoBoard();
            return;
        }
        if (event.target.closest('[data-board-redo]')) {
            redoBoard();
            return;
        }
        if (event.target.id === 'boardAdd') {
            addBoardNode(BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'square');
            return;
        }
        if (event.target.id === 'boardInsertPlaybook') {
            insertPlaybook(($('boardPlaybook') && $('boardPlaybook').value) || 'username');
            return;
        }
        if (event.target.id === 'boardDelete' && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            deleteBoardSelection();
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardLinkSelected) {
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardSelected) {
            duplicateBoardNode(boardSelected);
            return;
        }
        if (event.target.id === 'boardEditBtn' && boardSelected) {
            beginBoardTextEdit(boardSelected);
            return;
        }
        const applyShape = event.target.closest('[data-board-apply]');
        if (applyShape && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const kind = applyShape.getAttribute('data-board-apply');
            if (rec && BOARD_SHAPES[kind]) {
                rec.type = kind;
                rec.shape = typeMeta(kind).shape || kind;
                if (kind === 'circle' || kind === 'square') {
                    const side = Math.max(shapeSize(rec).w, shapeSize(rec).h);
                    rec.w = side;
                    rec.h = side;
                }
                renderWhiteboard();
            schedulePersist();
            }
            return;
        }
        const layer = event.target.closest('[data-board-layer]');
        if (layer && boardSelected) {
            hideBoardAddMenu();
            layerBoardNode(boardSelected, layer.getAttribute('data-board-layer'));
            return;
        }
        if (event.target.id === 'boardSheetClose' || event.target.id === 'boardSheetCancel' || event.target.id === 'boardSheet') {
            hideSheet($('boardSheet'));
            return;
        }

        if (event.target.id === 'intelClose' || event.target.id === 'intelSheet') { hideSheet($('intelSheet')); return; }
        if (event.target.id === 'intelRun') {
            runDomainIntel($('intelHost') && $('intelHost').value);
            return;
        }
        if (event.target.id === 'metaClose' || event.target.id === 'metaSheet') hideSheet($('metaSheet'));
        const rev = event.target.closest('[data-rev]');
        if (rev) {
            openReverse(($('reverseMenu') && $('reverseMenu').dataset.src) || '', rev.getAttribute('data-rev'));
            return;
        }
        if (!event.target.closest('#reverseMenu')) {
            const menu = $('reverseMenu');
            if (menu) menu.hidden = true;
        }
        if (event.target.id === 'timelineZoomIn') {
            const cam = timelineCam();
            cam.z = Math.min(3.2, cam.z * 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
        if (event.target.id === 'timelineZoomOut') {
            const cam = timelineCam();
            cam.z = Math.max(0.2, cam.z / 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
    }

    function onChange(event) {
        if (event.target.id === 'eventImagePick' && event.target.value) {
            $('eventImage').value = event.target.value;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-date')) {
            const id = event.target.getAttribute('data-tl-date');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.date = event.target.value;
                rec.pinned = true;
                renderTimeline();
            schedulePersist();
            }
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url')) {
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-href')) {
            const id = event.target.getAttribute('data-tl-href');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rec.source = String(event.target.value || '').trim();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardPlaybook' && event.target.value) {
            data.flowchart.preset = event.target.value;
            schedulePersist();
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            const rec = node && findBoardNode(node.dataset.node);
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onInput(event) {
        if (event.target.closest && event.target.closest('#timePop .time-num')) {
            applyTimeTyped(event.target);
            return;
        }
        const wbText = event.target.closest('[data-wb-text].is-edit');
        if (wbText) {
            const nodeEl = wbText.closest('.wb-node');
            const rec = nodeEl && (data.whiteboard.nodes || []).find(function (n) { return n.id === nodeEl.dataset.node; });
            if (rec) {
                const parts = String(wbText.innerText || '').replace(/\r/g, '').split('\n');
                rec.title = (parts.shift() || '').trim().slice(0, 120);
                rec.body = parts.join('\n').replace(/^\n+/, '').trim().slice(0, 800);
            schedulePersist();
            }
        }
        const field = event.target.closest('[data-tl-field]');
        if (field) {
            const id = field.getAttribute('data-event-id');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline('type:' + id);
                const key = field.getAttribute('data-tl-field');
                if (key === 'more') {
                    const nid = field.getAttribute('data-note-id');
                    rec.moreNotes = rec.moreNotes || [];
                    rec.moreNotes.forEach(function (item) {
                        if (item.id === nid) item.text = tlEditableBlank(field) ? '' : field.innerText;
                    });
                    syncTlPlaceholder(field);
                } else if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                    rec[key] = String(field.value || '').trim();
                } else {
                    syncTlPlaceholder(field);
                    rec[key] = tlEditableBlank(field) ? '' : field.innerText;
                }
                schedulePersist();
                scheduleStemRedraw();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardOpacity' && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard('op:' + rec.id);
                rec.op = Math.max(0, Math.min(1, Number(event.target.value) / 100));
                const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
                if (el) el.style.setProperty('--wb-op', String(rec.op));
                if (boardLinkSelected) drawBoardLinks($('boardLinks'), data.whiteboard);
                schedulePersist();
            }
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onPaste(event) {
        const clip = event.clipboardData;
        if (!clip) return;
        const inField = event.target && event.target.closest && event.target.closest('input:not([data-wb-image-url]):not([data-wb-embed-url]):not([data-tl-image-url]), textarea, select, [contenteditable="true"]');
        const file = clipboardImageFile(clip);
        const text = String(clip.getData('text') || '').trim();
        const slot = event.target && event.target.closest && event.target.closest('[data-wb-image-url], [data-wb-embed-url]');
        const slotNode = slot && slot.closest && slot.closest('.wb-node');
        if (file) {
            if (inField) return;
            event.preventDefault();
            if (page === 'whiteboard') {
                readImageFile(file, slotNode ? slotNode.dataset.node : (findBoardNode(boardSelected) && findBoardNode(boardSelected).type === 'image' ? boardSelected : ''), boardPointerAt);
                return;
            }
            if (page === 'timeline') {
                const card = event.target.closest && event.target.closest('.tl-node');
                const rec = (data.timeline || []).find(function (item) {
                    return item.id === (card ? card.getAttribute('data-event') : selectedEvent);
                }) || addEventAt(tlAimX, -1, true);
                const reader = new FileReader();
                reader.onload = function () { attachTimelineImage(rec.id, String(reader.result || '')); };
                reader.readAsDataURL(file);
                return;
            }
            if (host && host.applyProfilePhotoFiles) host.applyProfilePhotoFiles([file]);
            return;
        }
        if (page === 'whiteboard' && /^https?:\/\//i.test(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'embed') {
                event.preventDefault();
                rememberBoard();
                rec.src = text;
                renderWhiteboard();
                schedulePersist();
                return;
            }
        }
        if (page === 'whiteboard' && looksLikeImageSrc(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'image') {
                event.preventDefault();
                applyImageSrc(rec.id, text, '');
            }
            return;
        }
        if (page === 'whiteboard' && boardClip && !inField && !slot) {
            event.preventDefault();
            pasteBoardNode(boardPointerAt || boardDropAt);
            return;
        }
        if (page === 'timeline' && looksLikeImageSrc(text) && !inField) {
            const card = event.target.closest && event.target.closest('.tl-node');
            event.preventDefault();
            attachTimelineImage(card ? card.getAttribute('data-event') : selectedEvent, text);
            return;
        }
    }

    function onKey(event) {
        if (event.key === 'Escape' && calState) {
            event.preventDefault();
            closeCalendar();
            return;
        }
        if (event.key === 'Escape' && timeState) {
            event.preventDefault();
            closeTimePicker();
            return;
        }
        if (timeState && event.target.closest && event.target.closest('#timePop .time-num')) {
            if (onTimeFieldKey(event)) return;
        }
        if (event.key === 'Escape' && infoState) {
            event.preventDefault();
            closeTlInfoPop();
            return;
        }
        if (event.key === 'Escape' && document.querySelector('#boardStage [data-wb-text].is-edit')) {
            event.preventDefault();
            commitBoardTextEdit();
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const rec = node && findBoardNode(node.dataset.node);
            const url = String(event.target.value || '').trim();
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'Escape') {
            hideTimelineMenu();
            if (connectFrom || timelineConnectOn) {
                connectFrom = '';
                timelineConnectOn = false;
                renderTimeline();
            }
            if (boardConnect || boardTool === 'connect') {
                boardConnect = '';
                boardConnectPort = '';
                boardTool = 'select';
                renderWhiteboard();
            }
            const view = $('boardView');
            if (view) view.classList.remove('is-linking');
            markBoardPorts('', '', '', '');
            setLinkDraft('', false);
            hideBoardAddMenu();
            hideBoardMore();
            closeBoardPresets();
            return;
        }
        if ((event.key === 'Delete' || event.key === 'Backspace') && page === 'timeline' && selectedEvent) {
            event.preventDefault();
            deleteEvent(selectedEvent);
            return;
        }
        if (page === 'timeline') {
            const meta = event.metaKey || event.ctrlKey;
            const key = event.key;
            if (meta && (key === 'x' || key === 'X') && selectedEvent) {
                event.preventDefault();
                cutTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'c' || key === 'C') && selectedEvent) {
                event.preventDefault();
                copyTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'v' || key === 'V')) {
                event.preventDefault();
                pasteTimelineEvent();
                return;
            }
            if (meta && (key === 'd' || key === 'D') && selectedEvent) {
                event.preventDefault();
                duplicateTimelineEvent(selectedEvent);
                return;
            }
            if (meta && key === ']' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'front' : 'up');
                return;
            }
            if (meta && key === '[' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'back' : 'down');
                return;
            }
        }
        if (page !== 'whiteboard') return;
        const meta = event.metaKey || event.ctrlKey;
        const key = event.key;
        if (meta && (key === 'a' || key === 'A')) {
            event.preventDefault();
            selectBoardNodes(
                (data.whiteboard.nodes || []).map(function (n) { return n.id; }),
                (data.whiteboard.links || []).map(function (l) { return l.id; })
            );
            return;
        }
        if (meta && (key === 'z' || key === 'Z' || key === 'y' || key === 'Y')) return;
        if (meta && (key === 'x' || key === 'X') && boardSelected) {
            event.preventDefault();
            cutBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            copyBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'v' || key === 'V') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            pasteBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && boardSelected) {
            event.preventDefault();
            copyBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardLinkSelected) {
            event.preventDefault();
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardSelected) {
            event.preventDefault();
            duplicateBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'k' || key === 'K') && boardSelected) {
            event.preventDefault();
            setBoardHref(boardSelected);
            return;
        }
        if (meta && key === ']' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'front' : 'up');
            return;
        }
        if (meta && key === '[' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'back' : 'down');
            return;
        }
        if (event.shiftKey && (key === 'h' || key === 'H') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'h');
            return;
        }
        if (event.shiftKey && (key === 'v' || key === 'V') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'v');
            return;
        }
        if (event.shiftKey && (key === 'x' || key === 'X') && !meta) {
            event.preventDefault();
            startDrawToShape();
            return;
        }
        if (!meta && !event.shiftKey) {
            const tools = { h: 'pan', v: 'select', r: 'square', d: 'diamond', o: 'circle', a: 'arrow', l: 'line', p: 'draw', t: 'text', n: 'note', e: 'eraser', q: 'connect', i: 'image', f: 'frame', k: 'laser', b: 'bucket', '9': 'image' };
            const nextTool = tools[String(key).toLowerCase()];
            if (nextTool) {
                event.preventDefault();
                boardDrawToShape = false;
                boardTool = nextTool;
                boardConnect = '';
                boardConnectPort = '';
                renderWhiteboard();
                return;
            }
        }
        if ((key === 'Delete' || key === 'Backspace') && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            event.preventDefault();
            deleteBoardSelection();
            return;
        }
    }

    function onSubmit(event) {
        if (event.target.id === 'intelForm') {
            event.preventDefault();
            const input = event.target.querySelector('input');
            const value = input ? input.value : '';
            runDomainIntel(value);
        }
        if (event.target.id === 'eventForm' || event.target.id === 'boardForm') {
            event.preventDefault();
            if (event.target.id === 'eventForm') saveEventEditor();
            else saveBoardEditor();
        }
    }

    function onFile(event) {
        if (event.target.id === 'harvesterFile') {
            ingestHarvesterFiles(event.target.files);
            event.target.value = '';
            return;
        }
        if (event.target.id === 'timelineImageFile') {
        const file = event.target.files && event.target.files[0];
            const id = timelinePhotoId;
            event.target.value = '';
            if (!file || !id) return;
            const reader = new FileReader();
            reader.onload = function () {
                const rec = (data.timeline || []).find(function (item) { return item.id === id; });
                if (!rec) return;
                rememberTimeline();
                rec.image = String(reader.result || '');
                renderTimeline();
                schedulePersist();
            };
            reader.readAsDataURL(file);
            return;
        }
        if (event.target.id === 'boardImageFile') {
            const file = event.target.files && event.target.files[0];
            const at = boardDropAt || { x: 180, y: 140 };
            const onto = boardMenuMode === 'node' && boardSelected;
            const selectedId = boardSelected;
            boardDropAt = null;
            event.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
                const src = String(reader.result || '');
                const rec = selectedId && (data.whiteboard.nodes || []).find(function (n) { return n.id === selectedId; });
                if (rec && (rec.type === 'image' || onto)) {
                    applyImageSrc(rec.id, src, file.name || rec.title || '');
                    return;
                }
                const node = addBoardNode('image', at);
                if (!node) return;
                applyImageSrc(node.id, src, file.name || 'Photo');
        };
        reader.readAsDataURL(file);
        }
    }

    function init(api) {
        host = api || {};
        injectToolkit();
        window.addEventListener('orbint-toolkit-ready', injectToolkit);
        document.addEventListener('click', onClick);
        document.addEventListener('change', onChange);
        document.addEventListener('input', onInput);
        document.addEventListener('focusout', function (event) {
            const field = event.target && event.target.closest && event.target.closest('[data-tl-field]');
            if (field) syncTlPlaceholder(field);
        });
        document.addEventListener('keydown', onKey);
        document.addEventListener('paste', onPaste);
        document.addEventListener('submit', onSubmit);
        document.addEventListener('change', onFile, true);
        bindBoardPointers();
        bindTimelinePointers();
        bindHarvester();
        document.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch') return;
            setBoardDrift(event.clientX, event.clientY);
            if (page === 'whiteboard' && boardTool === 'laser') {
                feedLaser(worldFromClient(event.clientX, event.clientY));
            }
        }, { passive: true });
        window.addEventListener('orbint-motion', function () {
            if (reduceMotion()) setBoardDrift(null, null);
        });
        let saved = 'orbit';
        try {
            if (settingValue('rememberPage', true) === false) {
                saved = settingValue('startPage', 'orbit') || 'orbit';
            } else {
                saved = localStorage.getItem('orbint-page') || settingValue('startPage', 'orbit') || 'orbit';
            }
        } catch (error) {}
        if (saved === 'compiler') saved = 'harvester';
        if (['orbit', 'timeline', 'whiteboard', 'harvester', 'datasheet'].indexOf(saved) < 0) saved = 'orbit';
        setPage(saved);
        renderAll();
        window.addEventListener('resize', function () {
            syncPageSwitchThumb(true);
            syncBoardToolThumb(true);
            if (calState) placeCalendar();
            if (timeState) placeTimePicker();
            if (infoState) placeTlInfoPop();
            if (page === 'datasheet') sizeDatasheet();
        });
    }

    function closeOverlays() {
        hideSheet($('eventSheet'));
        hideSheet($('intelSheet'));
        hideSheet($('metaSheet'));
        hideSheet($('boardSheet'));
        hideSheet($('boardPresetSheet'));
        hideBoardAddMenu();
        hideBoardMore();
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        const viewer = $('mediaViewer');
        if (viewer) viewer.hidden = true;
        const menu = $('reverseMenu');
        if (menu) menu.hidden = true;
        return false;
    }

    function resetView() {
        if (page === 'whiteboard') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            return true;
        }
        if (page === 'timeline') {
            recenterTimeline();
            return true;
        }
        if (page === 'datasheet') return true;
        if (page === 'harvester') return true;
        return false;
    }

    window.OrbINTCase = {
        init: init,
        load: load,
        snapshot: snapshot,
        setPage: setPage,
        page: currentPage,
        downloadReport: downloadReport,
        showPhotoMeta: showPhotoMeta,
        reverseSearchPhoto: reverseSearchPhoto,
        openDomainIntel: openDomainIntel,
        closeOverlays: closeOverlays,
        resetView: resetView,
        dockAdd: dockAdd,
        dockConnect: dockConnect,
        undoBoard: undoBoard,
        redoBoard: redoBoard,
        undoTimeline: undoTimeline,
        redoTimeline: redoTimeline,
        boardHistory: function () {
            return { undo: boardUndo.length, redo: boardRedo.length };
        },
        syncBoardHistory: syncBoardHistory,
        pages: PAGES,
        renderDatasheet: renderDatasheet,
        scheduleDatasheet: scheduleDatasheet,
        ingestHarvesterFiles: ingestHarvesterFiles
    };
