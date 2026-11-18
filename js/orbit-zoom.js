/* Orbit pinch zoom and animation loop */
        function captureZoomFocus(mx, my) {
            const size = canvasSize();
            const zoom = Math.max(orbit.zoom, 0.01);
            const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
            orbit.zoomFocusX = mx;
            orbit.zoomFocusY = my;
            orbit.zoomWorldX = (mx - cx) / zoom;
            orbit.zoomWorldY = (my - cy) / zoom;
        }

        function applyZoomFocus(nextZoom) {
            if (orbit.zoomWorldX == null || orbit.zoomFocusX == null) return;
            const size = canvasSize();
            const nextX = orbit.zoomFocusX - orbit.zoomWorldX * nextZoom - size.width / 2 - orbit.parallaxX;
            const nextY = orbit.zoomFocusY - orbit.zoomWorldY * nextZoom - size.height / 2 - orbit.parallaxY;
            orbit.gridPanX += nextX - orbit.dragX;
            orbit.gridPanY += nextY - orbit.dragY;
            orbit.dragX = nextX;
            orbit.dragY = nextY;
        }

        function followZoom(current, target, dt, ms) {
            if (current <= 0 || target <= 0) return follow(current, target, dt, ms);
            return Math.exp(follow(Math.log(current), Math.log(target), dt, ms));
        }

        if (mapStage) mapStage.addEventListener('wheel', (event) => {
            if (event.target.closest('select, option, .platform-menu, .tz-menu, .search-menu, .field-menu, #profileMenu, .profile-rail, .media-viewer, .help-guide, .share-sheet, .install-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            event.preventDefault();
            const rect = mapCanvas.getBoundingClientRect();
            let delta = event.deltaY;
            if (event.deltaMode === 1) delta *= 16;
            else if (event.deltaMode === 2) delta *= rect.height || 800;
            const current = orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom;
            const next = clamp(current * Math.exp(-delta * 0.00105), orbitMinZoom(), orbitMaxZoom());
            captureZoomFocus(event.clientX - rect.left, event.clientY - rect.top);
            orbit.userZoomed = true;
            orbit.freeCam = true;
            orbit.fitZooming = false;
            orbit.targetZoom = next;
            orbit.zoom = next;
            orbit.zoomBusy = true;
            applyZoomFocus(next);
            if (reduceMotion) orbit.zoomBusy = false;
            if (typeof kickOrbit === 'function') kickOrbit();
        }, { passive: false });

        function pinchPointList() {
            return Array.from(pinchPointers.values());
        }

        function pinchDistance() {
            const pts = pinchPointList();
            if (pts.length < 2) return 0;
            return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        }

        function pinchCenter() {
            const pts = pinchPointList();
            if (pts.length < 2) return { x: 0, y: 0 };
            return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        }

        function startOrbitPinch() {
            if (orbit.dragging) endOrbitDrag({ pointerId: -1 });
            orbit.panVX = 0;
            orbit.panVY = 0;
            syncCanvasBox();
            const dist = Math.max(pinchDistance(), 8);
            const c = pinchCenter();
            captureZoomFocus(c.x - canvasBox.left, c.y - canvasBox.top);
            orbit.pinching = true;
            orbit.pinchDist = dist;
            orbit.pinchZoom = orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom;
            orbit.userZoomed = true;
            orbit.freeCam = true;
            orbit.fitZooming = false;
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        function moveOrbitPinch() {
            if (!orbit.pinching || pinchPointers.size < 2 || orbit.pinchDist < 8) return;
            const dist = pinchDistance();
            if (dist < 8) return;
            const next = clamp(orbit.pinchZoom * (dist / orbit.pinchDist), orbitMinZoom(), orbitMaxZoom());
            const c = pinchCenter();
            captureZoomFocus(c.x - canvasBox.left, c.y - canvasBox.top);
            orbit.targetZoom = next;
            orbit.zoom = next;
            orbit.zoomBusy = true;
            applyZoomFocus(next);
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        function endOrbitPinch(pointerId) {
            pinchPointers.delete(pointerId);
            if (pinchPointers.size < 2) {
                orbit.pinching = false;
                orbit.pinchDist = 0;
                orbit.zoomBusy = false;
                if (typeof kickOrbit === 'function') kickOrbit();
            }
        }

        if (mapStage) {
            mapStage.addEventListener('pointerdown', (event) => {
                if (event.pointerType !== 'touch') return;
                if (event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (pinchPointers.size >= 2) {
                    event.preventDefault();
                    event.stopPropagation();
                    startOrbitPinch();
                }
            }, true);
            mapStage.addEventListener('pointermove', (event) => {
                if (!pinchPointers.has(event.pointerId)) return;
                pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (!orbit.pinching || pinchPointers.size < 2) return;
                event.preventDefault();
                event.stopPropagation();
                moveOrbitPinch();
            }, { capture: true, passive: false });
            mapStage.addEventListener('pointerup', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            mapStage.addEventListener('pointercancel', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            mapStage.addEventListener('lostpointercapture', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            ['gesturestart', 'gesturechange', 'gestureend'].forEach((name) => {
                mapStage.addEventListener(name, (event) => {
                    if (event.target.closest && event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                    event.preventDefault();
                });
            });
            mapStage.addEventListener('touchmove', (event) => {
                if (event.target.closest && event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                if (event.touches && event.touches.length > 1) event.preventDefault();
            }, { passive: false });
        }

        function orbitIsBusy() {
            if (document.hidden) return false;
            if (orbit.dragging) return true;
            if (orbit.pinching) return true;
            if (!reduceMotion && !isPhone() && !document.hidden) return true;
            if (orbit.zoomBusy || orbit.zoomWorldX != null) return true;
            if (Math.abs((orbit.zoom || 1) - (orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom)) > 0.0008) return true;
            if (Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.08) return true;
            if (Math.abs((orbit.parallaxX || 0) - (orbit.targetParallaxX || 0)) > 0.12) return true;
            if (Math.abs((orbit.parallaxY || 0) - (orbit.targetParallaxY || 0)) > 0.12) return true;
            if (orbit.targetSpotX != null && Math.abs((orbit.spotX || 0) - orbit.targetSpotX) > 0.2) return true;
            if (orbit.targetSpotY != null && Math.abs((orbit.spotY || 0) - orbit.targetSpotY) > 0.2) return true;
            if (Math.hypot(orbit.hubLiveVX || 0, orbit.hubLiveVY || 0) > 0.12) return true;
            const drift = reduceMotion ? 1 : 2.05;
            if (Math.abs((orbit.gridShiftX || 0) - ((orbit.gridPanX || 0) + (orbit.parallaxX || 0) * drift)) > 0.25) return true;
            if (Math.abs((orbit.gridShiftY || 0) - ((orbit.gridPanY || 0) + (orbit.parallaxY || 0) * drift)) > 0.25) return true;
            for (let i = 0; i < orbitItems.length; i++) {
                const item = orbitItems[i];
                if (item.comingHome || (item.bloomWait || 0) > 0) return true;
                if (Math.abs(item.vx || 0) > 0.05 || Math.abs(item.vy || 0) > 0.05) return true;
                const wantRx = item.tRx == null ? item.rx : item.tRx;
                const wantRy = item.tRy == null ? item.ry : item.tRy;
                if (Math.abs((item.rx || 0) - wantRx) > 0.8 || Math.abs((item.ry || 0) - wantRy) > 0.8) return true;
            }
            for (let i = 0; i < peerBodies.length; i++) {
                const body = peerBodies[i];
                if (Math.abs(body.vx || 0) > 0.05 || Math.abs(body.vy || 0) > 0.05) return true;
                if (body.tx != null && body.x != null && Math.hypot(body.tx - body.x, (body.ty || 0) - (body.y || 0)) > 0.8) return true;
            }
            return false;
        }

        function kickOrbit() {
            if (!orbit || orbit.raf || document.hidden) return;
            orbit.tickAt = performance.now();
            orbit.raf = requestAnimationFrame(tickOrbit);
        }

        function tickOrbit(now) {
            const dt = Math.min(48, now - (orbit.tickAt || now));
            orbit.tickAt = now;
            if (orbit.dragging || !canvasBox.width) syncCanvasBox();
            if (orbit.targetZoom == null) orbit.targetZoom = orbit.zoom;
            if (!orbit.dragging && !orbit.zoomBusy && !orbit.pinching) {
                if (Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12) {
                    orbit.dragX += orbit.panVX;
                    orbit.dragY += orbit.panVY;
                    orbit.gridPanX += orbit.panVX;
                    orbit.gridPanY += orbit.panVY;
                    orbit.panVX *= 0.86;
                    orbit.panVY *= 0.86;
                } else {
                    orbit.panVX = 0;
                    orbit.panVY = 0;
                }
            }
            const size = canvasSize();
            if (orbit.targetSpotX == null) {
                orbit.targetSpotX = size.width / 2;
                orbit.targetSpotY = size.height / 2;
                orbit.spotX = orbit.targetSpotX;
                orbit.spotY = orbit.targetSpotY;
            }
            const holdingPeer = orbit.dragging && orbit.dragMode === 'peer';
            const freezeWorld = (!!orbit.dragging && !holdingPeer) || !!orbit.pinching
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingNode = orbit.dragging && orbit.dragMode === 'node';
            if (!reduceMotion && !isPhone() && !orbit.pinching && !holdingNode) {
                orbit.spin += dt * 0.00007;
            }
            const zoomMs = reduceMotion ? 1 : (orbit.fitZooming && !orbit.zoomWorldX ? 640 : 48);
            orbit.zoom = followZoom(orbit.zoom, orbit.targetZoom, dt, zoomMs);
            if (Math.abs(Math.log(orbit.zoom / Math.max(orbit.targetZoom, 0.01))) < 0.0008) {
                orbit.zoom = orbit.targetZoom;
            }
            if (orbit.zoomWorldX != null) applyZoomFocus(orbit.zoom);
            orbit.zoomBusy = orbit.zoom !== orbit.targetZoom || orbit.zoomWorldX != null;
            const freezeCam = freezeWorld || orbit.zoomBusy;
            const mouseMs = reduceMotion ? 40 : 72;
            const snapMs = 16;
            orbit.parallaxX = follow(orbit.parallaxX, freezeCam ? orbit.parallaxX : orbit.targetParallaxX, dt, freezeCam ? snapMs : mouseMs);
            orbit.parallaxY = follow(orbit.parallaxY, freezeCam ? orbit.parallaxY : orbit.targetParallaxY, dt, freezeCam ? snapMs : mouseMs);
            orbit.spotX = follow(orbit.spotX, orbit.targetSpotX, dt, freezeCam ? snapMs : mouseMs);
            orbit.spotY = follow(orbit.spotY, orbit.targetSpotY, dt, freezeCam ? snapMs : mouseMs);
            const gridMs = reduceMotion ? 50 : (orbit.zoomBusy ? 1 : 110);
            const drift = reduceMotion ? 1 : 2.05;
            orbit.gridShiftX = follow(orbit.gridShiftX, orbit.gridPanX + orbit.parallaxX * drift, dt, freezeCam ? 1 : gridMs);
            orbit.gridShiftY = follow(orbit.gridShiftY, orbit.gridPanY + orbit.parallaxY * drift, dt, freezeCam ? 1 : gridMs);
            if (!isPhone() || !profilePanel.classList.contains('open')) applyOrbit(dt);
            if (orbit.zoom === orbit.targetZoom) {
                orbit.zoomBusy = false;
                orbit.fitZooming = false;
                orbit.zoomFocusX = null;
                orbit.zoomFocusY = null;
                orbit.zoomWorldX = null;
                orbit.zoomWorldY = null;
            }
            if (orbitIsBusy()) orbit.raf = requestAnimationFrame(tickOrbit);
            else orbit.raf = 0;
        }
        kickOrbit();
        setInterval(function () {
            if (document.hidden) return;
            updateTimezoneClocks();
            touchSeen();
            const settings = document.getElementById('settingsSheet');
            if (settings && !settings.hidden && appSettings.logicBomb && appSettings.logicBombPeriod !== 'now') {
                bombPulseLow = !bombPulseLow;
                updateBombCountdown();
            }
        }, 1000);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (orbit.raf) {
                    cancelAnimationFrame(orbit.raf);
                    orbit.raf = 0;
                }
                return;
            }
            kickOrbit();
        });
        if (window.OrbINTShare && typeof OrbINTShare.boot === 'function') OrbINTShare.boot();
