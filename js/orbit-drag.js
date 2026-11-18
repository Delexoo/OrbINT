/* Orbit drag and relayout */
        function onViewportChange() {
            const phone = isPhone();
            document.body.classList.toggle('phone', phone);
            if (!phone) {
                setPanelOpen(false);
                closePhoneField();
                closePhoneMore();
                const saved = Number(localStorage.getItem(SIDEBAR_KEY));
                applySidebarWidth(saved && saved !== 268 && saved !== 320 ? saved : SIDEBAR_DEFAULT);
            } else {
                resetPhoneOrbitCamera();
                orbit.snapLayout = true;
            }
            syncCanvasBox();
            if (typeof positionNodes === 'function') positionNodes();
            orbit.snapLayout = false;
            renderProfile();
        }

        if (drawerQuery.addEventListener) drawerQuery.addEventListener('change', onViewportChange);
        else drawerQuery.addListener(onViewportChange);

        let layoutSizeKey = '';
        function relayoutIfNeeded(force) {
            if (orbit.dragging || orbit.pinching) {
                orbit.layoutDirty = true;
                return;
            }
            if (mapStage && (mapStage.classList.contains('boot-enter') || mapStage.classList.contains('profile-enter') || mapStage.classList.contains('profile-fly'))) return;
            syncCanvasBox();
            const size = canvasSize();
            const key = Math.round(size.width) + 'x' + Math.round(size.height);
            if (!force && key === layoutSizeKey) return;
            layoutSizeKey = key;
            if (isPhone() && !orbit.userZoomed) orbit.fitZooming = true;
            if (typeof positionNodes === 'function') positionNodes();
        }

        window.addEventListener('resize', () => relayoutIfNeeded(false));
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => relayoutIfNeeded(false));
        }
        requestAnimationFrame(() => {
            const animate = !reduceMotion;
            function startIntro() {
                const span = animate ? bloomOrbitFromHub() : 0;
                if (mapCanvas) mapCanvas.classList.add('orbit-ready');
                if (mapStage) mapStage.classList.add('orbit-ready');
                if (animate && mapStage) {
                    void mapStage.offsetWidth;
                    mapStage.classList.add('boot-enter');
                    if (typeof kickOrbit === 'function') kickOrbit();
                    setTimeout(function () {
                        if (mapStage) mapStage.classList.remove('boot-enter');
                        if (typeof clearOrbitBloomDelays === 'function') clearOrbitBloomDelays();
                    }, Math.max(800, span + 720));
                }
                saveOrbitLayout();
            }
            if (isPhone()) resetPhoneOrbitCamera();
            orbit.snapLayout = true;
            positionNodes();
            orbit.snapLayout = false;
            if (isPhone()) {
                requestAnimationFrame(function () {
                    resetPhoneOrbitCamera();
                    orbit.snapLayout = true;
                    positionNodes();
                    orbit.snapLayout = false;
                    startIntro();
                });
            } else {
                startIntro();
            }
        });
        if (window.ResizeObserver && mapCanvas) {
            const layoutWatch = new ResizeObserver(() => {
                if (orbit.dragging || orbit.pinching) {
                    orbit.layoutDirty = true;
                    return;
                }
                relayoutIfNeeded(false);
            });
            layoutWatch.observe(mapCanvas);
        }

        function pointerOnCanvas(event) {
            if (isPhone() || !canvasBox.width) syncCanvasBox();
            return { x: event.clientX - canvasBox.left, y: event.clientY - canvasBox.top };
        }

        function paintHeldItem() {
            const zoom = orbit.zoom || 1;
            if (orbit.dragMode === 'node' && orbit.dragItem && orbit.dragItem.node) {
                const item = orbit.dragItem;
                item.x = orbit.grabX;
                item.y = orbit.grabY;
                const next = 'translate3d(' + (item.x - item.w / 2) + 'px,' + (item.y - item.h / 2) + 'px,0) scale(' + zoom + ')';
                item._tf = next;
                item.node.style.left = '0px';
                item.node.style.top = '0px';
                item.node.style.transform = next;
                if (item.line) {
                    const parent = item.parentId && orbitItems.find((other) => other.node.dataset.field === item.parentId);
                    const hx = orbit.hubLiveX != null ? orbit.hubLiveX : (canvasBox.width / 2 + orbit.dragX + orbit.parallaxX);
                    const hy = orbit.hubLiveY != null ? orbit.hubLiveY : (canvasBox.height / 2 + orbit.dragY + orbit.parallaxY);
                    item.line.setAttribute('x1', parent ? parent.x : hx);
                    item.line.setAttribute('y1', parent ? parent.y : hy);
                    item.line.setAttribute('x2', item.x);
                    item.line.setAttribute('y2', item.y);
                }
            } else if (orbit.dragMode === 'hub' && hub) {
                hub.style.left = orbit.grabX + 'px';
                hub.style.top = orbit.grabY + 'px';
            } else if (orbit.dragMode === 'peer' && orbit.dragItem && orbit.dragItem.el) {
                const body = orbit.dragItem;
                body.x = orbit.grabX;
                body.y = orbit.grabY;
                body.el.style.left = body.x + 'px';
                body.el.style.top = body.y + 'px';
                body.el.style.transform = 'translate(-50%, -50%) scale(' + zoom + ')';
            }
        }

        function commitNodeHome(item) {
            if (!item || !item.node) return;
            const size = canvasSize();
            const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
            const dx = item.x - cx;
            const dy = item.y - cy;
            const angle = Math.atan2(dy, dx) - orbit.spin;
            item.tAngle = angle;
            item.angle = angle;
            nodeHomes.set(item.node.dataset.field, {
                angle: angle,
                rx: item.tRx == null ? item.rx : item.tRx,
                ry: item.tRy == null ? item.ry : item.tRy,
                pinned: true
            });
            scheduleSaveLayout();
        }

        function beginOrbitDrag(event, mode, item) {
            if (orbit.pinching) return;
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            syncCanvasBox();
            orbit.dragging = true;
            if (mode === 'pan' || mode === 'hub') {
                orbit.freeCam = true;
                orbit.userZoomed = true;
            }
            if (typeof kickOrbit === 'function') kickOrbit();
            orbit.dragMode = mode || 'pan';
            orbit.dragItem = item || null;
            orbit.dragStartX = event.clientX;
            orbit.dragStartY = event.clientY;
            orbit.dragOriginX = orbit.dragX;
            orbit.dragOriginY = orbit.dragY;
            orbit.gridOriginX = orbit.gridPanX;
            orbit.gridOriginY = orbit.gridPanY;
            orbit.prevCX = event.clientX;
            orbit.prevCY = event.clientY;
            orbit.panVX = 0;
            orbit.panVY = 0;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.dragMoved = false;
            if (mode === 'pan') {
                orbit.targetParallaxX = 0;
                orbit.targetParallaxY = 0;
                orbit.hubLiveX = null;
                orbit.hubLiveY = null;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
                orbitItems.forEach((entry) => {
                    entry.vx = 0;
                    entry.vy = 0;
                    if (entry.tx != null) {
                        entry.x = entry.tx;
                        entry.y = entry.ty;
                    }
                });
                peerBodies.forEach((entry) => {
                    entry.vx = 0;
                    entry.vy = 0;
                    if (entry.tx != null) {
                        entry.x = entry.tx;
                        entry.y = entry.ty;
                    }
                });
            }
            if (mode === 'node' && item) {
                const p = pointerOnCanvas(event);
                orbit.grabOffX = item.x - p.x;
                orbit.grabOffY = item.y - p.y;
                orbit.grabX = item.x;
                orbit.grabY = item.y;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                item.node.classList.add('dragging');
                mapStage.classList.add('dragging-node');
            } else if (mode === 'peer' && item) {
                const p = pointerOnCanvas(event);
                if (item.x == null) item.x = item.tx;
                if (item.y == null) item.y = item.ty;
                orbit.grabOffX = item.x - p.x;
                orbit.grabOffY = item.y - p.y;
                orbit.grabX = item.x;
                orbit.grabY = item.y;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                if (item.el) item.el.classList.add('dragging');
                mapStage.classList.add('dragging-node');
            } else if (mode === 'hub') {
                const p = pointerOnCanvas(event);
                const size = canvasSize();
                const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
                const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
                orbit.grabOffX = cx - p.x;
                orbit.grabOffY = cy - p.y;
                orbit.grabX = cx;
                orbit.grabY = cy;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                mapStage.classList.add('panning');
            } else {
                mapStage.classList.add('panning');
            }
            mapStage.setPointerCapture(event.pointerId);
        }

        function endOrbitDrag() {
            if (orbit.dragMode === 'node' && orbit.dragItem) {
                const item = orbit.dragItem;
                if (orbit.dragMoved) {
                    item.comingHome = true;
                } else {
                    item.comingHome = false;
                    if (item.tAngle != null) item.angle = item.tAngle;
                    if (item.tRx != null) item.rx = item.tRx;
                    if (item.tRy != null) item.ry = item.tRy;
                    item.dispRx = item.rx;
                    item.dispRy = item.ry;
                }
                item.node.classList.remove('dragging');
            }
            if (orbit.dragMode === 'peer' && orbit.dragItem) {
                const body = orbit.dragItem;
                if (body.el) body.el.classList.remove('dragging');
                if (orbit.dragMoved) commitPeerHome(body);
                else if (body.id && body.el) openLinkedProfile(body.id, body.el);
            }
            orbit.dragging = false;
            orbit.dragMode = null;
            orbit.dragItem = null;
            orbit.dragMoved = false;
            mapStage.classList.remove('panning');
            mapStage.classList.remove('dragging-node');
            scheduleSaveLayout();
            if (orbit.layoutDirty) {
                orbit.layoutDirty = false;
                relayoutIfNeeded(true);
            }
        }

        if (mapStage) mapStage.addEventListener('mousedown', (event) => {
            if (event.button === 1) event.preventDefault();
        });

        if (mapStage) mapStage.addEventListener('auxclick', (event) => {
            if (event.button === 1) event.preventDefault();
        });

        if (mapStage) mapStage.addEventListener('pointerdown', (event) => {
            if (orbit.pinching || pinchPointers.size >= 2) return;
            if (event.button === 1) {
                event.preventDefault();
                beginOrbitDrag(event, 'pan');
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan')) {
                event.preventDefault();
                beginOrbitDrag(event, 'pan');
                return;
            }
            if (event.target.closest('#hubAdd')) return;
            const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            if (peerEl) {
                const body = peerBodyFromEl(peerEl);
                if (body) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'peer', body);
                    return;
                }
            }
            if (event.target.closest('input, select, textarea, button, .search-btn, .secret-reveal, .node-clear, .node-more, .file-btn, .image-add, .platform-trigger, .tz-trigger, .tz-pick, .tz-abbr, .cc-trigger, .cc-pick, .cc-abbr, .cc-name, .media-thumb, .platform-icon')) return;
            const node = event.target.closest('.node');
            if (node && !node.classList.contains('renaming')) {
                const item = orbitItems.find((entry) => entry.node === node);
                if (item) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'node', item);
                    return;
                }
            }
            if (event.target.closest('#hub')) return;
            event.preventDefault();
            beginOrbitDrag(event, 'pan');
        });

        if (hub) hub.addEventListener('pointerdown', (event) => {
            if (orbit.pinching || pinchPointers.size >= 2) return;
            if (event.target.closest('#hubAdd')) {
                event.stopPropagation();
                return;
            }
            if (event.button === 1) return;
            if (event.button !== 0) return;
            const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            if (peerEl) {
                const body = peerBodyFromEl(peerEl);
                if (body) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'peer', body);
                    return;
                }
            }
            event.preventDefault();
            event.stopPropagation();
            beginOrbitDrag(event, 'hub');
        });

        if (mapStage) mapStage.addEventListener('pointermove', (event) => {
            if (orbit.pinching) return;
            if (orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'hub' || orbit.dragMode === 'peer')) {
                if (Math.hypot(event.clientX - orbit.dragStartX, event.clientY - orbit.dragStartY) > ((event.pointerType === 'touch' && orbit.dragMode === 'peer') ? 16 : 8)) orbit.dragMoved = true;
                const p = pointerOnCanvas(event);
                orbit.grabVX = event.clientX - orbit.prevCX;
                orbit.grabVY = event.clientY - orbit.prevCY;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                orbit.grabX = p.x + orbit.grabOffX;
                orbit.grabY = p.y + orbit.grabOffY;
                const zoom = orbit.zoom || 1;
                const item = orbit.dragItem;
                const held = {
                    x: orbit.grabX,
                    y: orbit.grabY,
                    tx: orbit.grabX,
                    ty: orbit.grabY,
                    sw: orbit.dragMode === 'hub' ? 220 * zoom : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE * zoom : (item && (item.sw || item.w)) || 186),
                    sh: orbit.dragMode === 'hub' ? 220 * zoom : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE * zoom : (item && (item.sh || item.h)) || 34),
                    w: orbit.dragMode === 'hub' ? 220 : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE : (item && item.w) || 186),
                    h: orbit.dragMode === 'hub' ? 220 : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE : (item && item.h) || 34)
                };
                orbit.grabX = held.x;
                orbit.grabY = held.y;
                if (orbit.dragMode === 'hub') {
                    orbit.dragX = orbit.grabX - canvasBox.width / 2 - orbit.parallaxX;
                    orbit.dragY = orbit.grabY - canvasBox.height / 2 - orbit.parallaxY;
                }
                paintHeldItem();
                return;
            }
            if (orbit.dragging) {
                orbit.panVX = event.clientX - orbit.prevCX;
                orbit.panVY = event.clientY - orbit.prevCY;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                const dx = event.clientX - orbit.dragStartX;
                const dy = event.clientY - orbit.dragStartY;
                orbit.dragX = orbit.dragOriginX + dx;
                orbit.dragY = orbit.dragOriginY + dy;
                orbit.gridPanX = orbit.gridOriginX + dx;
                orbit.gridPanY = orbit.gridOriginY + dy;
                orbit.gridShiftX = orbit.gridPanX + orbit.parallaxX * 2.05;
                orbit.gridShiftY = orbit.gridPanY + orbit.parallaxY * 2.05;
                applyMapGrid();
                return;
            }
        }, { passive: true });

        function updatePointerParallax(event) {
            if (!event || orbit.dragging) return;
            if (typeof isPhone === 'function' && isPhone()) return;
            if (event.pointerType === 'touch') return;
            if (reduceMotionOn()) {
                orbit.targetParallaxX = 0;
                orbit.targetParallaxY = 0;
                return;
            }
            if (!canvasBox.width) syncCanvasBox();
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const nx = event.clientX / w - 0.5;
            const ny = event.clientY / h - 0.5;
            const strength = 18;
            orbit.targetParallaxX = nx * strength;
            orbit.targetParallaxY = ny * strength;
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        document.addEventListener('pointermove', updatePointerParallax, { passive: true, capture: true });

            if (mapStage) mapStage.addEventListener('pointerup', endOrbitDrag);
            if (mapStage) mapStage.addEventListener('pointercancel', endOrbitDrag);
            function endOrbitDragFromPointer() {
                if (orbit.dragging) endOrbitDrag();
            }
            window.addEventListener('pointerup', endOrbitDragFromPointer);
            window.addEventListener('pointercancel', endOrbitDragFromPointer);
            if (mapStage) mapStage.addEventListener('lostpointercapture', endOrbitDragFromPointer);

        document.getElementById('searchMenu').addEventListener('click', (event) => {
            const browse = event.target.closest('[data-open-toolkit]');
            if (browse) {
                event.stopPropagation();
                const node = document.querySelector('.node.search-open');
                closeSearchMenu();
                openToolkit(browse.dataset.openToolkit || (node && node.dataset.field));
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.search-open');
            const fieldId = node && node.dataset.field;
            openLead(option.dataset.openLead, fieldInputValue(fieldId), option.dataset.leadMode);
        });

        document.getElementById('platformMenu').addEventListener('click', (event) => {
            const customPick = event.target.closest('[data-pick-custom]');
            if (customPick) {
                event.stopPropagation();
                applyCustomPlatformPick(customPick.dataset.pickCustom);
                return;
            }
            const option = event.target.closest('[data-pick-platform]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.menu-open:not(.tz-open)');
            const fieldId = (node && node.dataset.field) || document.getElementById('platformMenu').dataset.field;
            if (!fieldId) return;
            applyPlatformChoice(fieldId, option.dataset.pickPlatform);
        });

        document.getElementById('tzMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-tz]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('tzMenu').dataset.field;
            applyTimezonePick(fieldId, option.dataset.pickTz);
            if (isPhone()) syncPhoneField();
        });

