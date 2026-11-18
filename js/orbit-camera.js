/* Orbit camera, zoom limits, saved layout */
        const mapStage = document.getElementById('mapStage');
        let reduceMotion = reduceMotionOn();
        const orbit = {
            dragX: 0,
            dragY: 0,
            zoom: 1,
            targetZoom: 1,
            zoomFocusX: null,
            zoomFocusY: null,
            zoomWorldX: null,
            zoomWorldY: null,
            zoomBusy: false,
            spin: 0,
            dSpin: 0,
            pulse: 1,
            parallaxX: 0,
            parallaxY: 0,
            targetParallaxX: 0,
            targetParallaxY: 0,
            spotX: null,
            spotY: null,
            targetSpotX: null,
            targetSpotY: null,
            gridShiftX: 0,
            gridShiftY: 0,
            gridPanX: 0,
            gridPanY: 0,
            gridOriginX: 0,
            gridOriginY: 0,
            dragging: false,
            dragMode: null,
            dragStartX: 0,
            dragStartY: 0,
            dragOriginX: 0,
            dragOriginY: 0,
            hubPx: null,
            hubPy: null,
            hubLiveX: null,
            hubLiveY: null,
            hubLiveVX: 0,
            hubLiveVY: 0,
            dragItem: null,
            grabX: 0,
            grabY: 0,
            grabOffX: 0,
            grabOffY: 0,
            grabVX: 0,
            grabVY: 0,
            panVX: 0,
            panVY: 0,
            prevCX: 0,
            prevCY: 0,
            snapLayout: true,
            restoreHomes: false,
            userZoomed: false,
            freeCam: false,
            fitZoom: 1,
            fitZooming: false,
            fitCount: -1,
            pinching: false,
            pinchDist: 0,
            pinchZoom: 1,
            raf: 0,
            tickAt: 0
        };
        const LAYOUT_KEY = 'osint-orbit-layout-v1';
        const nodeHomes = new Map();
        let orbitItems = [];
        let peerBodies = [];
        const PEER_HUB_SIZE = 92;
        let cachedLayout = null;
        let saveLayoutTimer = 0;
        const pinchPointers = new Map();

        function loadSavedLayout() {
            try {
                const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '');
                return raw && raw.items && typeof raw.items === 'object' ? raw : null;
            } catch (error) {
                return null;
            }
        }

        function saveOrbitLayout() {
            const size = canvasSize();
            if (!size.width || !size.height || !orbitItems.length) return;
            const items = {};
            orbitItems.forEach((item) => {
                const id = item.node && item.node.dataset.field;
                if (!id) return;
                items[id] = {
                    angle: item.tAngle == null ? item.angle : item.tAngle,
                    rx: item.tRx == null ? item.rx : item.tRx,
                    ry: item.tRy == null ? item.ry : item.tRy
                };
            });
            nodeHomes.forEach((home, id) => { items[id] = home; });
            try {
                localStorage.setItem(LAYOUT_KEY, JSON.stringify({
                    w: size.width,
                    h: size.height,
                    dragX: orbit.dragX,
                    dragY: orbit.dragY,
                    gridPanX: orbit.gridPanX,
                    gridPanY: orbit.gridPanY,
                    zoom: orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom,
                    homes: Array.from(nodeHomes.entries()),
                    items: items
                }));
            } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function scheduleSaveLayout() {
            clearTimeout(saveLayoutTimer);
            saveLayoutTimer = setTimeout(saveOrbitLayout, 160);
        }

        function resetPhoneOrbitCamera() {
            if (typeof isPhone !== 'function' || !isPhone()) return false;
            orbit.dragX = 0;
            orbit.dragY = 0;
            orbit.gridPanX = 0;
            orbit.gridPanY = 0;
            orbit.gridShiftX = 0;
            orbit.gridShiftY = 0;
            orbit.userZoomed = false;
            orbit.freeCam = false;
            orbit.fitZooming = true;
            orbit.zoom = 1;
            orbit.targetZoom = 1;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.zoomBusy = false;
            orbit.pinching = false;
            return true;
        }

        cachedLayout = loadSavedLayout();
        if (cachedLayout) {
            if (!resetPhoneOrbitCamera()) {
                if (Number.isFinite(cachedLayout.dragX)) orbit.dragX = cachedLayout.dragX;
                if (Number.isFinite(cachedLayout.dragY)) orbit.dragY = cachedLayout.dragY;
                orbit.gridPanX = Number.isFinite(cachedLayout.gridPanX) ? cachedLayout.gridPanX : orbit.dragX;
                orbit.gridPanY = Number.isFinite(cachedLayout.gridPanY) ? cachedLayout.gridPanY : orbit.dragY;
                if (Number.isFinite(cachedLayout.zoom) && cachedLayout.zoom > 0) {
                    orbit.zoom = cachedLayout.zoom;
                    orbit.targetZoom = cachedLayout.zoom;
                }
            }
            (cachedLayout.homes || []).forEach((entry) => {
                if (entry && entry[0] && entry[1]) nodeHomes.set(entry[0], entry[1]);
            });
        }

        function boxesOverlap(a, b, gap) {
            return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + gap &&
                Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap;
        }

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function orbitMinZoom() {
            return 0.001;
        }

        function orbitMaxZoom() {
            return 500;
        }

        function orbitViewInsets() {
            if (!isPhone()) return { top: 0, right: 0, bottom: 0, left: 0 };
            return { top: 56, right: 10, bottom: 78, left: 10 };
        }

        function nodeScreenLimits(item, width, height) {
            const insets = orbitViewInsets();
            const pad = isPhone() ? 6 : 14;
            const halfW = Math.max((item.sw || item.w || 0) / 2, 8);
            const halfH = Math.max((item.sh || item.h || 0) / 2, 8);
            const minX = insets.left + pad + halfW;
            const maxX = width - insets.right - pad - halfW;
            const minY = insets.top + pad + halfH;
            const maxY = height - insets.bottom - pad - halfH;
            return {
                x: minX > maxX ? width / 2 : clamp(item.x, minX, maxX),
                y: minY > maxY ? height / 2 : clamp(item.y, minY, maxY),
                tx: minX > maxX ? width / 2 : clamp(item.tx == null ? item.x : item.tx, minX, maxX),
                ty: minY > maxY ? height / 2 : clamp(item.ty == null ? item.y : item.ty, minY, maxY)
            };
        }

        function keepNodeOnScreen(item, width, height) {
            const next = nodeScreenLimits(item, width, height);
            if (next.x !== item.x) item.vx = 0;
            if (next.y !== item.y) item.vy = 0;
            item.x = next.x;
            item.y = next.y;
            item.tx = next.tx;
            item.ty = next.ty;
            return next;
        }

        function hubScreenBox(width, height) {
            const zoom = orbit.zoom || 1;
            const w = (hub && hub.offsetWidth || 220) * zoom;
            const h = (hub && hub.offsetHeight || 220) * zoom;
            const x = width / 2 + orbit.dragX + orbit.parallaxX;
            const y = height / 2 + orbit.dragY + orbit.parallaxY;
            return { x: x, y: y, tx: x, ty: y, sw: w, sh: h, w: w, h: h };
        }

        function keepHubOnScreen(width, height) {
            const prevX = orbit.dragX;
            const prevY = orbit.dragY;
            if (orbit.dragging && orbit.dragMode === 'hub') {
                orbit.dragX = orbit.grabX - width / 2 - orbit.parallaxX;
                orbit.dragY = orbit.grabY - height / 2 - orbit.parallaxY;
            }
            const box = hubScreenBox(width, height);
            keepNodeOnScreen(box, width, height);
            orbit.dragX = box.x - width / 2 - orbit.parallaxX;
            orbit.dragY = box.y - height / 2 - orbit.parallaxY;
            if (orbit.dragging && orbit.dragMode === 'hub') {
                orbit.grabX = box.x;
                orbit.grabY = box.y;
            } else {
                orbit.gridPanX += orbit.dragX - prevX;
                orbit.gridPanY += orbit.dragY - prevY;
            }
            return box;
        }

        function shortestAngle(from, to) {
            let delta = to - from;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            return delta;
        }

        let canvasBox = { left: 0, top: 0, width: 0, height: 0 };

        function syncCanvasBox() {
            const stage = mapStage || mapCanvas;
            if (!stage) return canvasBox;
            const r = stage.getBoundingClientRect();
            canvasBox = {
                left: r.left,
                top: r.top,
                width: r.width || stage.clientWidth || window.innerWidth || 0,
                height: r.height || stage.clientHeight || window.innerHeight || 0
            };
            return canvasBox;
        }

        function canvasSize() {
            if (isPhone() || !canvasBox.width || !canvasBox.height) syncCanvasBox();
            if (canvasBox.width && canvasBox.height) return { width: canvasBox.width, height: canvasBox.height };
            const canvasW = mapCanvas && mapCanvas.clientWidth;
            const canvasH = mapCanvas && mapCanvas.clientHeight;
            if (canvasW && canvasH) return { width: canvasW, height: canvasH };
            const stage = document.getElementById('mapStage');
            const rect = (stage || mapCanvas || document.body).getBoundingClientRect();
            return { width: rect.width || window.innerWidth || 0, height: rect.height || window.innerHeight || 0 };
        }

