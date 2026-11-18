/* Timeline pointer dragging */


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
            stopTimelineCamAnim();
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
            stopTimelineCamAnim();
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

