/* OrbINT map, dock, boot */

        function createNodes() {
            if (!mapCanvas) return;
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (id === 'url' || (id && id.indexOf('url-') === 0) || (id && !fieldById(id))) node.remove();
            });
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                node.style.left = '';
                node.style.top = '';
            });
            FIELDS.forEach((field) => {
                if (mapCanvas.querySelector('.node[data-field="' + field.id + '"]')) return;
                const node = document.createElement('div');
                node.className = 'node';
                node.dataset.field = field.id;
                const base = fieldBase(field.id);
                if (base === 'timezone') {
                    node.className = 'node tz-node';
                    node.innerHTML =
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<span class="tz-pick empty"><span class="tz-abbr">Zone</span><button class="tz-trigger" type="button" aria-label="Choose timezone" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="tz-clock" data-tz-clock="' + field.id + '" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'countrycode') {
                    node.className = 'node cc-node';
                    node.innerHTML =
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<span class="cc-pick empty"><span class="cc-flag" hidden></span><span class="cc-abbr">Code</span><button class="cc-trigger" type="button" aria-label="Choose country code" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="cc-name" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'image') {
                    node.className = 'node image-node';
                    node.innerHTML =
                        '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="Open ' + escapeHtml(field.label) + '"></button>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="image-add" type="button" data-photos-open aria-label="Add photos">Add</button>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (isPlatformField(field.id)) {
                    node.classList.add('platform-node');
                    if (isSecretField(field.id)) node.classList.add('secret-node');
                    node.innerHTML =
                        '<span class="platform-icon" hidden></span>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="platform-trigger" type="button">Select site</button>' +
                            '<input id="field-' + field.id + '" type="' + (isSecretField(field.id) ? 'password' : 'text') + '" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" spellcheck="false" autocomplete="off" hidden>' +
                            (isSecretField(field.id) ? secretRevealBtnHtml(field.id) : '') +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else {
                    const email = isEmailField(field.id);
                    const secret = isSecretField(field.id);
                    if (email) node.classList.add('email-node');
                    if (secret) node.classList.add('secret-node');
                    node.innerHTML =
                        (email ? '<span class="platform-icon" hidden></span>' : '') +
                        ((base === 'image' || base === 'audio' || base === 'ip' || base === 'address')
                            ? '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="' + (base === 'address' ? 'Open in Google Maps' : 'Open ' + escapeHtml(field.label)) + '"></button>'
                            : '') +
                        '<div class="node-copy">' +
                            '<label for="field-' + field.id + '">' + escapeHtml(field.label) + '</label>' +
                            '<input id="field-' + field.id + '" type="' + (secret ? 'password' : 'text') + '" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder) + '" spellcheck="false" autocomplete="off">' +
                            (secret ? secretRevealBtnHtml(field.id) : '') +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            (field.file ? '<button class="file-btn" type="button" data-file="' + field.id + '">+</button>' : '') +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>' +
                        (field.file ? '<input type="file" accept="' + field.file + '" hidden data-upload="' + field.id + '">' : '');
                }
                mapCanvas.appendChild(node);
            });
            decorateNodes();
            fillTimezoneSelects();
            fillCountryCodeSelects();
        }

        function syncNodeFilled(input) {
            const node = input && input.closest('.node');
            if (!node) return false;
            const fieldId = node.dataset.field;
            const filled = !!(input.value && input.value.trim());
            if (filled && isNullField(fieldId)) {
                setFieldNull(fieldId, false, true);
                saveProfile();
            }
            const nulled = !filled && isNullField(fieldId);
            node.classList.toggle('filled', filled);
            node.classList.toggle('null', nulled);
            if (input && !input.dataset.ph) input.dataset.ph = input.getAttribute('placeholder') || '';
            if (input) input.placeholder = nulled ? 'Missing' : (input.dataset.ph || '');
            setSearchIcon(node, filled);
            if (isEmailField(fieldId)) setEmailIcon(node, input.value);
            updateHubProgress();
            return filled;
        }

        function renderNodes() {
            FIELDS.forEach((field) => {
                const node = document.querySelector('.node[data-field="' + field.id + '"]');
                if (!node) return;
                const input = document.getElementById('field-' + field.id);
                const fact = fieldBase(field.id) === 'image' ? (primaryImageFact() || latestFact(field.id)) : latestFact(field.id);
                if (input && document.activeElement !== input) {
                    const next = fact ? (fieldBase(field.id) === 'phone' ? formatPhoneNumber(fact.value) : fact.value) : '';
                    if (fieldBase(field.id) === 'timezone') input.value = resolveTimezoneValue(next);
                    else if (fieldBase(field.id) === 'countrycode') input.value = resolveCountryCodeValue(next);
                    else input.value = next;
                }
                const filled = syncNodeFilled(input);
                node.classList.toggle('active', activeField === field.id);

                if (isPlatformField(field.id)) {
                    setUsernameStep(node, fieldPlatformId(field.id), filled);
                }

                if (fieldBase(field.id) === 'timezone') {
                    syncTimezoneTrigger(node);
                    updateTimezoneClocks();
                }

                if (fieldBase(field.id) === 'countrycode') {
                    syncCountryCodeTrigger(node);
                }

                if (isThumbField(field.id)) {
                    setFieldThumb(field.id);
                }

                if (isSecretField(field.id)) syncSecretNode(node);
            });
            positionNodes();
        }

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

        function computeLayout() {
            const nodes = Array.from(document.querySelectorAll('.node:not(.off)'));
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height || !nodes.length) return;

            const cx = width / 2;
            const cy = height / 2;
            const phone = isPhone();
            const insets = orbitViewInsets();
            const innerW = Math.max(80, width - insets.left - insets.right);
            const innerH = Math.max(80, height - insets.top - insets.bottom);
            const pad = phone ? 10 : 16;
            const hubClear = hub ? Math.max(hub.offsetWidth, hub.offsetHeight) / 2 + (phone ? 16 : 6) : (phone ? 68 : 116);

            const visibleIds = new Set(nodes.map((node) => node.dataset.field));

            function visibleParentId(id) {
                let field = fieldById(id);
                const seen = new Set();
                while (field && field.parent && !seen.has(field.id)) {
                    seen.add(field.id);
                    if (visibleIds.has(field.parent)) return field.parent;
                    field = fieldById(field.parent);
                }
                return '';
            }

            const items = nodes.map((node, index) => ({
                node,
                index,
                w: node.offsetWidth || 168,
                h: node.offsetHeight || 34,
                parentId: visibleParentId(node.dataset.field)
            }));

            const roots = items.filter((item) => !item.parentId);
            const maxNodeW = Math.max.apply(null, items.map((item) => item.w));
            const maxNodeH = Math.max.apply(null, items.map((item) => item.h));
            const viewMaxRx = Math.max(phone ? 36 : 80, innerW / 2 - pad - maxNodeW / 2);
            const viewMaxRy = Math.max(phone ? 36 : 80, innerH / 2 - pad - maxNodeH / 2);
            const hubMinX = hubClear + maxNodeW / 2 + 2;
            const hubMinY = hubClear + maxNodeH / 2 + 2;

            function fieldOrder(id) {
                const at = FIELDS.findIndex((field) => field.id === id);
                return at < 0 ? 999 : at;
            }

            function idJitter(id) {
                let h = 2166136261;
                const text = String(id || '');
                for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
                return (h >>> 0) / 4294967296;
            }

            const others = roots.filter((item) => item.node.dataset.field !== 'name').sort((a, b) => {
                return fieldOrder(a.node.dataset.field) - fieldOrder(b.node.dataset.field)
                    + (idJitter(a.node.dataset.field) - idJitter(b.node.dataset.field)) * 7;
            });
            const nameItem = roots.find((item) => item.node.dataset.field === 'name');
            const ordered = others.slice();
            if (nameItem) {
                const at = Math.min(ordered.length, Math.max(0, Math.round(idJitter(nameItem.node.dataset.field) * ordered.length)));
                ordered.splice(at, 0, nameItem);
            }
            const boxGap = (phone ? 6 : 12) + Math.min(6, Math.max(0, roots.length - 10) * 0.2);
            let ovalRatio = phone ? 1.12 : 0.6;

            function ovalRy(rx) {
                const lo = hubMinY + 10;
                const hi = phone ? viewMaxRy * 1.08 : viewMaxRy * 1.06;
                return Math.min(Math.max(rx * ovalRatio, lo), hi);
            }

            function poleAmount(angle) {
                const s = Math.abs(Math.sin(angle));
                return s * s;
            }

            function isPinnedRoot(item) {
                if (phone) return false;
                const home = nodeHomes.get(item.node.dataset.field);
                return !!(home && home.pinned && Number.isFinite(home.angle));
            }

            function ellipseSpeedAt(angle, rx, ry) {
                return Math.max(Math.hypot(rx * Math.sin(angle), ry * Math.cos(angle)), 10);
            }

            function warpAroundOval(t) {
                // Spend less time at 12 and 6 so wide pills sit on the sides of the oval.
                return t - 0.2 * Math.sin(2 * t);
            }

            function packRoots(rx, ry) {
                const n = ordered.length;
                if (n < 1) return 1;
                if (n === 1) {
                    ordered[0].angle = ordered[0].angle || -Math.PI / 2;
                    ordered[0].rx = rx;
                    ordered[0].ry = ry;
                    ordered[0].x = cx + Math.cos(ordered[0].angle) * rx;
                    ordered[0].y = cy + Math.sin(ordered[0].angle) * ry;
                    return 1;
                }

                ordered.forEach((item, i) => {
                    if (!isPinnedRoot(item)) {
                        const u = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2;
                        const jitter = (idJitter(item.node.dataset.field) - 0.5) * 0.055;
                        item.angle = warpAroundOval(u) + jitter;
                    }
                    if (!item.radialLift) {
                        item.rx = rx;
                        item.ry = ry;
                    }
                    item.x = cx + Math.cos(item.angle) * item.rx;
                    item.y = cy + Math.sin(item.angle) * item.ry;
                });

                let tight = 0;
                for (let i = 0; i < ordered.length; i++) {
                    for (let j = i + 1; j < ordered.length; j++) {
                        if (boxesOverlap(ordered[i], ordered[j], boxGap)) tight++;
                    }
                }
                return tight ? -tight : 1;
            }

            ordered.forEach((item) => {
                item.radialLift = false;
            });

            const crowd = Math.min(1, roots.length / 22);
            let maxRx = phone ? viewMaxRx * 1.06 : viewMaxRx * 1.12;
            let maxRy = phone ? viewMaxRy * 1.05 : viewMaxRy * 1.12;
            let ringRx = phone
                ? Math.max(hubMinX + 12, Math.min(maxRx, viewMaxRx * 0.96))
                : Math.min(maxRx, Math.max(hubMinX + 40, viewMaxRx * (0.78 + crowd * 0.14)));
            let ringRy = ovalRy(ringRx);
            packRoots(ringRx, ringRy);

            function project(item) {
                item.x = cx + Math.cos(item.angle) * item.rx;
                item.y = cy + Math.sin(item.angle) * item.ry;
            }

            function radialExtent(item, angle) {
                const a = angle == null ? item.angle : angle;
                return (item.w / 2) * Math.abs(Math.cos(a)) + (item.h / 2) * Math.abs(Math.sin(a));
            }

            function stampOval(item) {
                if (!item.radialLift) {
                    item.rx = ringRx;
                    item.ry = ringRy;
                }
                project(item);
            }

            function liftOutward(item, pix) {
                item.radialLift = true;
                item.rx = Math.min(maxRx, (item.rx || ringRx) + Math.max(18, pix));
                item.ry = Math.min(maxRy, Math.max(hubMinY, ovalRy(item.rx)));
                project(item);
            }

            function ellipseSpeed(item) {
                return Math.hypot((item.rx || ringRx) * Math.sin(item.angle), (item.ry || ringRy) * Math.cos(item.angle)) || 90;
            }

            function separatePair(a, b, gap) {
                if (!boxesOverlap(a, b, gap)) return false;
                const pinA = !a.parentId && isPinnedRoot(a);
                const pinB = !b.parentId && isPinnedRoot(b);
                const needX = (a.w + b.w) / 2 + gap - Math.abs(a.x - b.x);
                const needY = (a.h + b.h) / 2 + gap - Math.abs(a.y - b.y);
                let sep = shortestAngle(a.angle, b.angle);
                if (Math.abs(sep) < 0.02) {
                    sep = (idJitter(a.node.dataset.field) >= 0.5 ? 1 : -1) * 0.06;
                }
                const dir = sep >= 0 ? 1 : -1;
                const pix = Math.max(3, Math.min(needX, needY));
                const speed = Math.max((ellipseSpeed(a) + ellipseSpeed(b)) / 2, 50);
                const push = Math.min(0.2, (pix / speed) * 0.85);
                if (pinA && pinB) {
                    a.angle -= dir * Math.max(push, 0.03);
                    b.angle += dir * Math.max(push, 0.03);
                    project(a);
                    project(b);
                    return true;
                }
                if (!pinA && !pinB) {
                    a.angle -= dir * push * 0.5;
                    b.angle += dir * push * 0.5;
                } else if (!pinA) {
                    a.angle -= dir * push;
                } else {
                    b.angle += dir * push;
                }
                if (!a.parentId) stampOval(a);
                else project(a);
                if (!b.parentId) stampOval(b);
                else project(b);
                return true;
            }

            function overlapNeed(list) {
                let needX = 0;
                let needY = 0;
                let hits = 0;
                for (let i = 0; i < list.length; i++) {
                    for (let j = i + 1; j < list.length; j++) {
                        const a = list[i];
                        const b = list[j];
                        if (!boxesOverlap(a, b, boxGap)) continue;
                        hits++;
                        needX = Math.max(needX, (a.w + b.w) / 2 + boxGap - Math.abs(a.x - b.x));
                        needY = Math.max(needY, (a.h + b.h) / 2 + boxGap - Math.abs(a.y - b.y));
                    }
                }
                return { hits: hits, needX: needX, needY: needY };
            }

            function spreadRootsOnOval() {
                const growLimit = phone ? 8 : 10;
                const ratioCap = phone ? 1.16 : 0.68;
                for (let grow = 0; grow < growLimit; grow++) {
                    packRoots(ringRx, ringRy);
                    roots.forEach((item) => {
                        if (!item.radialLift) {
                            item.rx = ringRx;
                            item.ry = ringRy;
                        }
                        project(item);
                    });
                    for (let iter = 0; iter < (phone ? 28 : 36); iter++) {
                        let hits = 0;
                        for (let i = 0; i < roots.length; i++) {
                            for (let j = i + 1; j < roots.length; j++) {
                                if (separatePair(roots[i], roots[j], boxGap * (phone ? 0.4 : 0.45))) hits++;
                            }
                        }
                        if (!hits) return;
                    }
                    const stuck = overlapNeed(roots);
                    // Leave a few pixels of clip; the live ease finishes it.
                    if (!stuck.hits || (stuck.needX < 8 && stuck.needY < 8)) return;
                    if (ringRx < maxRx - 0.5) {
                        ringRx = Math.min(maxRx, ringRx * (phone ? 1.02 : 1.025));
                        ringRy = ovalRy(ringRx);
                    } else if (ovalRatio < ratioCap) {
                        ovalRatio = Math.min(ratioCap, ovalRatio + (phone ? 0.02 : 0.015));
                        ringRy = ovalRy(ringRx);
                    } else {
                        return;
                    }
                }
            }

            roots.forEach((item) => {
                if (phone) return;
                const home = nodeHomes.get(item.node.dataset.field);
                if (home && home.pinned && Number.isFinite(home.angle)) item.angle = home.angle;
            });
            spreadRootsOnOval();

            function placeBranches() {
                const byId = new Map(items.map((item) => [item.node.dataset.field, item]));
                const kids = {};
                items.forEach((item) => {
                    if (!item.parentId) return;
                    if (!kids[item.parentId]) kids[item.parentId] = [];
                    kids[item.parentId].push(item);
                });
                function placeKids(pid) {
                    const parent = byId.get(pid);
                    const list = kids[pid];
                    if (!parent || !list) return;
                    const extra = radialExtent(parent) + Math.max.apply(null, list.map((child) => radialExtent(child, parent.angle))) + (phone ? 18 : 28);
                    const midR = Math.max(parent.rx + extra, 90);
                    const angNeed = Math.atan2((Math.max.apply(null, list.map((child) => child.w)) + 16) / 2, midR) * 2;
                    const fan = list.length > 1 ? Math.min(1.15, angNeed * (list.length - 1)) : 0;
                    const polar = { angle: parent.angle, rx: parent.rx, ry: parent.ry };
                    const halves = list.map((entry) => Math.atan2((entry.w + 16) / 2, midR));
                    const used = halves.reduce((sum, span) => sum + 2 * span, 0);
                    const gap = list.length > 1 ? Math.max(0.04, (fan - used) / (list.length - 1)) : 0;
                    list.forEach((child, i) => {
                        if (list.length === 1) {
                            child.angle = polar.angle;
                        } else {
                            let angle = polar.angle - (used + gap * (list.length - 1)) / 2 + halves[0];
                            for (let k = 0; k < i; k++) angle += halves[k] + gap + halves[k + 1];
                            child.angle = angle;
                        }
                        child.rx = Math.min(maxRx, polar.rx + extra);
                        child.ry = ovalRy(child.rx);
                        project(child);
                        placeKids(child.node.dataset.field);
                    });
                }
                roots.forEach((root) => placeKids(root.node.dataset.field));

                for (let iter = 0; iter < 48; iter++) {
                    let hits = 0;
                    items.forEach((child) => {
                        if (!child.parentId) return;
                        const parent = byId.get(child.parentId);
                        items.forEach((other) => {
                            if (child === other || !boxesOverlap(child, other, 24)) return;
                            hits++;
                            child.rx = Math.min(maxRx, child.rx + 12);
                            child.ry = ovalRy(child.rx);
                            if (parent) {
                                const only = (kids[child.parentId] || []).length <= 1;
                                if (only) {
                                    child.angle = parent.angle;
                                } else {
                                    const away = shortestAngle(other.angle, child.angle) >= 0 ? 0.05 : -0.05;
                                    child.angle += away;
                                    const drift = shortestAngle(parent.angle, child.angle);
                                    if (Math.abs(drift) > 0.85) child.angle = parent.angle + Math.sign(drift || 1) * 0.85;
                                }
                            }
                            project(child);
                        });
                    });
                    if (!hits) break;
                }
            }

            roots.forEach(project);
            placeBranches();

            function chromeBoxes() {
                const boxes = [];
                const canvasRect = mapCanvas.getBoundingClientRect();
                function add(el, extra) {
                    if (!el || el.hidden) return;
                    const r = el.getBoundingClientRect();
                    if (!r.width || !r.height) return;
                    boxes.push({
                        x: r.left - canvasRect.left + r.width / 2,
                        y: r.top - canvasRect.top + r.height / 2,
                        w: r.width + extra,
                        h: r.height + extra
                    });
                }
                add(document.getElementById('dock'), 28);
                add(document.getElementById('bombTag'), 16);
                add(document.getElementById('donate'), 22);
                add(document.getElementById('workNav') || document.getElementById('pageSwitch'), 22);
                return boxes;
            }

            function clampToCanvas(item) {
                return false;
            }

            const chrome = phone ? [] : chromeBoxes();

            function unstackPoles() {
                spreadRootsOnOval();
            }

            function separateRoots(a, b) {
                separatePair(a, b, boxGap);
            }

            for (let iter = 0; iter < 48; iter++) {
                let hits = 0;
                roots.forEach((item) => {
                    if (clampToCanvas(item)) hits++;
                    chrome.forEach((box) => {
                        if (!boxesOverlap(item, box, 10)) return;
                        hits++;
                        item.angle += (Math.sin(item.angle) > 0 ? -1 : 1) * 0.04 * (Math.cos(item.angle) >= 0 ? 1 : -1);
                        project(item);
                    });
                    const dist = Math.hypot(item.x - cx, item.y - cy);
                    const need = hubClear + radialExtent(item) + 2;
                    if (dist < need) {
                        hits++;
                        const scale = need / Math.max(dist, 1);
                        item.rx = Math.min(maxRx, item.rx * scale);
                        item.ry = Math.min(maxRy, Math.max(item.ry * scale, ovalRy(item.rx)));
                        item.radialLift = item.rx > ringRx + 0.5 || item.ry > ringRy + 0.5;
                        project(item);
                    }
                });

                items.forEach((item) => {
                    if (!item.parentId) return;
                    if (clampToCanvas(item)) hits++;
                    chrome.forEach((box) => {
                        if (!boxesOverlap(item, box, 10)) return;
                        hits++;
                        item.rx = Math.min(maxRx, item.rx + 8);
                        item.ry = ovalRy(item.rx);
                        project(item);
                    });
                    const dist = Math.hypot(item.x - cx, item.y - cy);
                    const need = hubClear + radialExtent(item) + 2;
                    if (dist < need) {
                        hits++;
                        item.rx = Math.min(maxRx, item.rx * (need / Math.max(dist, 1)));
                        item.ry = ovalRy(item.rx);
                        project(item);
                    }
                });
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        const polarPad = (!a.parentId && !b.parentId)
                            ? 10 + 8 * Math.max(poleAmount(a.angle), poleAmount(b.angle))
                            : 10;
                        if (!boxesOverlap(a, b, polarPad)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separateRoots(a, b);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        const parent = move.parentId && items.find((item) => item.node.dataset.field === move.parentId);
                        move.rx = Math.min(maxRx, move.rx + 8);
                        move.ry = ovalRy(move.rx);
                        const siblings = items.filter((entry) => entry.parentId === move.parentId);
                        if (!(parent && siblings.length <= 1)) {
                            move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.04 : -0.04;
                        }
                        if (parent) {
                            if (siblings.length <= 1) {
                                move.angle = parent.angle;
                            } else {
                                const drift = shortestAngle(parent.angle, move.angle);
                                if (Math.abs(drift) > 0.85) move.angle = parent.angle + Math.sign(drift || 1) * 0.85;
                            }
                        }
                        project(move);
                    }
                }
                if (!hits) break;
            }

            unstackPoles();
            roots.forEach(stampOval);
            for (let pass = 0; pass < 4; pass++) {
                let hits = 0;
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        if (!boxesOverlap(a, b, boxGap * 0.25)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separatePair(a, b, boxGap * 0.25);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        const parent = move.parentId && items.find((item) => item.node.dataset.field === move.parentId);
                        move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.02 : -0.02;
                        if (parent) {
                            const drift = shortestAngle(parent.angle, move.angle);
                            if (Math.abs(drift) > 0.9) move.angle = parent.angle + Math.sign(drift || 1) * 0.9;
                        }
                        project(move);
                    }
                }
                if (!hits) break;
            }
            placeBranches();
            for (let pass = 0; pass < 6; pass++) {
                let hits = 0;
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        if (!boxesOverlap(a, b, boxGap * 0.2)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separatePair(a, b, boxGap * 0.2);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.02 : -0.02;
                        project(move);
                    }
                }
                if (!hits) break;
            }

            function untangleBoxes(list, gap, loops) {
                for (let iter = 0; iter < loops; iter++) {
                    let hits = 0;
                    for (let i = 0; i < list.length; i++) {
                        for (let j = i + 1; j < list.length; j++) {
                            const a = list[i];
                            const b = list[j];
                            if (!boxesOverlap(a, b, gap)) continue;
                            hits++;
                            if (!a.parentId && !b.parentId) {
                                separatePair(a, b, gap);
                                continue;
                            }
                            const move = a.parentId ? a : b;
                            const other = move === a ? b : a;
                            move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.025 : -0.025;
                            project(move);
                        }
                    }
                    if (!hits) break;
                }
            }
            untangleBoxes(items, boxGap * 0.15, 8);

            if (linkLayer) {
                linkLayer.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                linkLayer.innerHTML = '';
            }
            const prev = new Map(orbitItems.map((item) => [item.node, item]));
            orbitItems = items.map((item) => {
                const old = prev.get(item.node);
                const parentOld = item.parentId && Array.from(prev.values()).find((other) => other.node.dataset.field === item.parentId);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('stroke', orbitSpokeStroke(item.node, false));
                line.setAttribute('stroke-width', '1');
                if (linkLayer) linkLayer.appendChild(line);
                let angle = item.angle;
                let rx = item.rx;
                let ry = item.ry;
                let x = item.x;
                let y = item.y;
                if (orbit.snapLayout) {
                    angle = item.angle;
                    rx = item.rx;
                    ry = item.ry;
                    x = item.x;
                    y = item.y;
                } else if (old) {
                    angle = old.angle;
                    rx = old.rx;
                    ry = old.ry;
                    x = old.x;
                    y = old.y;
                } else if (parentOld) {
                    angle = item.angle;
                    rx = Math.max(parentOld.rx + 24, item.rx * 0.86);
                    ry = Math.max(parentOld.ry + 24, item.ry * 0.86);
                    x = parentOld.x;
                    y = parentOld.y;
                }
                return {
                    node: item.node,
                    angle: angle,
                    rx: rx,
                    ry: ry,
                    tAngle: item.angle,
                    tRx: item.rx,
                    tRy: item.ry,
                    w: item.w,
                    h: item.h,
                    line: line,
                    parentId: item.parentId || '',
                    x: x,
                    y: y,
                    vx: old && !orbit.snapLayout ? old.vx : 0,
                    vy: old && !orbit.snapLayout ? old.vy : 0,
                    comingHome: old && old.comingHome,
                    bloomWait: old && old.bloomWait > 0 ? old.bloomWait : 0
                };
            });

            if (orbit.fitCount !== nodes.length) {
                orbit.fitCount = nodes.length;
            }
            let maxDx = hubClear + 24;
            let maxDy = hubClear + 24;
            items.forEach((item) => {
                maxDx = Math.max(maxDx, Math.abs(item.x - cx) + item.w / 2);
                maxDy = Math.max(maxDy, Math.abs(item.y - cy) + item.h / 2);
            });
            const availX = Math.max(phone ? 40 : 80, innerW / 2);
            const availY = Math.max(phone ? 40 : 80, innerH / 2);
            const raw = Math.min(1, availX / Math.max(maxDx, 1), availY / Math.max(maxDy, 1));
            const fit = phone
                ? clamp(raw * 0.96, 0.8, 0.98)
                : Math.max(0.86, 1 - (1 - raw) * 0.32);
            orbit.fitZoom = fit;
            if (!orbit.dragging && !orbit.userZoomed && !orbit.pinching) {
                orbit.targetZoom = fit;
                orbit.fitZooming = Math.abs(orbit.zoom - fit) > 0.008;
                if (orbit.snapLayout || reduceMotion) {
                    orbit.zoom = fit;
                    orbit.fitZooming = false;
                }
            }

            applyOrbit(orbit.snapLayout ? 1000 : 16);
            if (orbit.snapLayout && mapCanvas) mapCanvas.classList.add('orbit-ready');
            scheduleSaveLayout();
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        const mapGrid = document.getElementById('mapGrid');

        function follow(current, target, dt, ms) {
            if (current == null || !Number.isFinite(current)) return target;
            if (target == null || !Number.isFinite(target)) return current;
            const tau = Math.max(ms, 1);
            return current + (target - current) * (1 - Math.exp(-dt / tau));
        }

        function smoothDamp(current, target, vel, dt, ms) {
            if (current == null || !Number.isFinite(current)) return { value: target, vel: 0 };
            if (target == null || !Number.isFinite(target)) return { value: current, vel: 0 };
            const st = Math.max((ms || 420) / 1000, 0.02);
            const h = Math.min(Math.max(dt || 16, 1), 48) / 1000;
            const omega = 2 / st;
            const x = omega * h;
            const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
            const change = current - target;
            const temp = ((vel || 0) + omega * change) * h;
            let nextVel = ((vel || 0) - omega * temp) * exp;
            let next = target + (change + temp) * exp;
            if ((target - current > 0) === (next > target)) {
                next = target;
                nextVel = 0;
            }
            return { value: next, vel: nextVel };
        }

        function applyMapGrid() {
            if (!mapGrid) return;
            const x = orbit.gridShiftX + 'px';
            const y = orbit.gridShiftY + 'px';
            const z = String(orbit.zoom);
            if (orbit._gx === x && orbit._gy === y && orbit._gz === z) return;
            orbit._gx = x;
            orbit._gy = y;
            orbit._gz = z;
            mapGrid.style.setProperty('--grid-x', x);
            mapGrid.style.setProperty('--grid-y', y);
            mapGrid.style.setProperty('--grid-z', z);
        }

        function setGridSpot() {}

        function orbitBoxOverlap(a, b, gap) {
            const aw = a.sw || a.w || 0;
            const ah = a.sh || a.h || 0;
            const bw = b.sw || b.w || 0;
            const bh = b.sh || b.h || 0;
            const ox = (aw + bw) / 2 + gap - Math.abs(a.tx - b.tx);
            const oy = (ah + bh) / 2 + gap - Math.abs(a.ty - b.ty);
            if (ox <= 0 || oy <= 0) return null;
            return { ox: ox, oy: oy };
        }

        function projectOrbitTarget(item, hx, hy, zoom) {
            const rx = item.dispRx == null ? item.rx : item.dispRx;
            const ry = item.dispRy == null ? item.ry : item.dispRy;
            const z = Math.max(zoom, 0.01);
            const dx = (item.tx - hx) / z;
            const dy = (item.ty - hy) / z;
            const t = Math.atan2(dy / Math.max(ry, 1e-6), dx / Math.max(rx, 1e-6));
            item.tx = hx + Math.cos(t) * rx * z;
            item.ty = hy + Math.sin(t) * ry * z;
        }

        function keepOrbitBoxesClear(hx, hy, zoom, nodeGrab, dt) {
            if (!orbitItems.length) return;
            const gap = 6 * Math.max(zoom, 0.35);
            const maxLift = 56;
            const step = Math.min(Math.max(dt || 16, 8), 40);
            const dragging = !!nodeGrab;
            const k = (reduceMotion ? 0.55 : (1 - Math.exp(-step / (dragging ? 1800 : 1280)))) * (dragging ? 0.28 : 1);

            function fieldHash(item) {
                const text = String((item.node && item.node.dataset.field) || '');
                let h = 2166136261;
                for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
                return (h >>> 0) / 4294967296;
            }

            orbitItems.forEach((item) => {
                if (item.dispRx == null || !Number.isFinite(item.dispRx)) item.dispRx = item.rx;
                if (item.dispRy == null || !Number.isFinite(item.dispRy)) item.dispRy = item.ry;
                item.sw = item.w * zoom;
                item.sh = item.h * zoom;
                if (item === nodeGrab) {
                    item.tx = item.x;
                    item.ty = item.y;
                    return;
                }
                const ang = item.angle + orbit.spin;
                item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
            });

            let deepest = 0;
            for (let i = 0; i < orbitItems.length; i++) {
                for (let j = i + 1; j < orbitItems.length; j++) {
                    const a = orbitItems[i];
                    const b = orbitItems[j];
                    const hit = orbitBoxOverlap(a, b, gap);
                    if (!hit) continue;
                    const depth = Math.min(hit.ox, hit.oy);
                    deepest = Math.max(deepest, depth);

                    const grabA = a === nodeGrab;
                    const grabB = b === nodeGrab;
                    let wA = grabA ? 0 : 0.5;
                    let wB = grabB ? 0 : 0.5;
                    if (a.parentId && !b.parentId && !grabB) {
                        wA = 0.8;
                        wB = 0.2;
                    } else if (b.parentId && !a.parentId && !grabA) {
                        wA = 0.2;
                        wB = 0.8;
                    }
                    if (wA + wB === 0) continue;
                    const sum = wA + wB;
                    wA /= sum;
                    wB /= sum;

                    function ringAmt(item) {
                        const home = Math.max(item.tRx == null ? item.rx : item.tRx, 1);
                        const cur = Math.max(item.dispRx || 0, item.rx || 0);
                        return Math.min(1, Math.max(0, (cur / home - 0.5) / 0.45));
                    }
                    const arrived = Math.min(ringAmt(a), ringAmt(b));
                    if (arrived < 0.08) continue;

                    let sep = shortestAngle(a.angle, b.angle);
                    if (Math.abs(sep) < 0.025) {
                        sep = (fieldHash(a) >= 0.5 ? 1 : -1) * 0.08;
                    }
                    const dir = sep >= 0 ? 1 : -1;
                    const spA = Math.max(Math.hypot((a.dispRx || a.rx) * Math.sin(a.angle), (a.dispRy || a.ry) * Math.cos(a.angle)), 16);
                    const spB = Math.max(Math.hypot((b.dispRx || b.rx) * Math.sin(b.angle), (b.dispRy || b.ry) * Math.cos(b.angle)), 16);
                    const speed = Math.max((spA + spB) / 2, 18);
                    const push = Math.min(dragging ? 0.012 : 0.08, ((depth + 10) / speed) * k * arrived);

                    function shear(item, sign, weight) {
                        if (!item || item === nodeGrab || weight <= 0) return;
                        const delta = sign * push * weight;
                        item.angle += delta;
                        // While dragging, only yield live position so neighbors ease back home.
                        if (!dragging && item.tAngle != null) item.tAngle += delta;
                    }
                    shear(a, -dir, wA);
                    shear(b, dir, wB);

                    const related = (a.parentId && a.parentId === b.node.dataset.field)
                        || (b.parentId && b.parentId === a.node.dataset.field)
                        || (a.parentId && a.parentId === b.parentId);
                    if (depth > 16 || related) {
                        const lift = grabA ? b : (grabB ? a : (related
                            ? (a.parentId ? a : b)
                            : (a.dispRx <= b.dispRx ? a : b)));
                        if (lift && lift !== nodeGrab) {
                            const home = Math.max(lift.rx || 0, 1);
                            const room = Math.max(0, home + maxLift - lift.dispRx);
                            const extra = Math.min(room, depth * k * arrived * (dragging ? 0.03 : (related ? 0.22 : 0.1)));
                            if (extra > 0.04) {
                                lift.dispRx += extra;
                                lift.dispRy = Math.max(lift.dispRy, lift.dispRx * ((lift.ry || home) / home));
                                if (!dragging) {
                                    if (lift.tRx != null) lift.tRx = Math.min(lift.tRx + extra * 0.28, home + maxLift);
                                    if (lift.tRy != null) lift.tRy = Math.max(lift.tRy, lift.tRx * ((lift.ry || home) / home));
                                }
                            }
                        }
                    }

                    function ontoOval(item) {
                        if (!item || item === nodeGrab) return;
                        const ang = item.angle + orbit.spin;
                        item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                        item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
                    }
                    ontoOval(a);
                    ontoOval(b);
                }
            }

            const homePull = deepest < 4 ? 0.1 : (deepest < 12 ? 0.03 : 0.008);
            orbitItems.forEach((item) => {
                if (item === nodeGrab) return;
                const homeRx = item.rx;
                const homeRy = item.ry;
                item.dispRx = Math.min(item.dispRx, homeRx + maxLift);
                item.dispRy = Math.min(item.dispRy, Math.max(homeRy, item.dispRx * (homeRy / Math.max(homeRx, 1))));
                item.dispRx += (homeRx - item.dispRx) * homePull;
                item.dispRy += (homeRy - item.dispRy) * homePull;
                const ang = item.angle + orbit.spin;
                item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
            });
        }

        function applyOrbit(dt) {
            applyMapGrid();
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height) return;

            const viewPan = (orbit.dragging && orbit.dragMode === 'pan')
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingField = orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'peer');
            if (!viewPan && !holdingField && !orbit.userZoomed && !orbit.freeCam && ((!orbit.zoomBusy && orbit.zoomWorldX == null) || orbit.dragging)) keepHubOnScreen(width, height);

            const zoom = orbit.zoom;
            const zoomJump = Math.abs((orbit.prevZoom == null ? zoom : orbit.prevZoom) - zoom) > 0.00001;
            orbit.prevZoom = zoom;
            const cx = width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = height / 2 + orbit.dragY + orbit.parallaxY;
            if (orbit.hubPx == null) {
                orbit.hubPx = cx;
                orbit.hubPy = cy;
            }
            const hvx = cx - orbit.hubPx;
            const hvy = cy - orbit.hubPy;
            orbit.hubPx = cx;
            orbit.hubPy = cy;

            const nodeGrab = orbit.dragging && orbit.dragMode === 'node' ? orbit.dragItem : null;
            const peerGrab = orbit.dragging && orbit.dragMode === 'peer' ? orbit.dragItem : null;
            const hubGrab = orbit.dragging && orbit.dragMode === 'hub';
            const panning = orbit.dragging && orbit.dragMode === 'pan';
            const coasting = !orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12;
            const rigidView = panning || coasting || orbit.zoomBusy || zoomJump;
            const byId = new Map(orbitItems.map((item) => [item.node.dataset.field, item]));
            const step = Math.min(Math.max(dt || 16, 8), 32) / 16.67;

            if (orbit.hubLiveX == null || !Number.isFinite(orbit.hubLiveX)) {
                orbit.hubLiveX = cx;
                orbit.hubLiveY = cy;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
            }
            if (hubGrab || nodeGrab || rigidView || reduceMotion || orbit.snapLayout) {
                orbit.hubLiveX = cx;
                orbit.hubLiveY = cy;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
            } else {
                let ax = (cx - orbit.hubLiveX) * 0.2;
                let ay = (cy - orbit.hubLiveY) * 0.2;
                if (nodeGrab && nodeGrab.x != null) {
                    const restLen = Math.max(Math.hypot(
                        Math.cos((nodeGrab.tAngle == null ? nodeGrab.angle : nodeGrab.tAngle) + orbit.spin) * (nodeGrab.tRx == null ? nodeGrab.rx : nodeGrab.tRx) * zoom,
                        Math.sin((nodeGrab.tAngle == null ? nodeGrab.angle : nodeGrab.tAngle) + orbit.spin) * (nodeGrab.tRy == null ? nodeGrab.ry : nodeGrab.tRy) * zoom
                    ), 28);
                    const dx = nodeGrab.x - orbit.hubLiveX;
                    const dy = nodeGrab.y - orbit.hubLiveY;
                    const cur = Math.hypot(dx, dy) || 1;
                    const stretch = cur - restLen;
                    if (stretch > 14) {
                        const pull = (stretch - 14) * 0.016;
                        ax += (dx / cur) * pull;
                        ay += (dy / cur) * pull;
                    }
                    ax += (orbit.grabVX || 0) * 0.004;
                    ay += (orbit.grabVY || 0) * 0.004;
                }
                if (peerGrab && peerGrab.x != null) {
                    const restLen = Math.max(Math.hypot((peerGrab.tx || 0) - cx, (peerGrab.ty || 0) - cy), 48);
                    const dx = peerGrab.x - orbit.hubLiveX;
                    const dy = peerGrab.y - orbit.hubLiveY;
                    const cur = Math.hypot(dx, dy) || 1;
                    const stretch = cur - restLen;
                    if (stretch > 8) {
                        const pull = (stretch - 8) * 0.045;
                        ax += (dx / cur) * pull;
                        ay += (dy / cur) * pull;
                    }
                    ax += (orbit.grabVX || 0) * 0.014;
                    ay += (orbit.grabVY || 0) * 0.014;
                }
                orbit.hubLiveVX = (orbit.hubLiveVX || 0) + ax * step;
                orbit.hubLiveVY = (orbit.hubLiveVY || 0) + ay * step;
                orbit.hubLiveVX *= Math.pow(0.8, step);
                orbit.hubLiveVY *= Math.pow(0.8, step);
                orbit.hubLiveX += orbit.hubLiveVX * step;
                orbit.hubLiveY += orbit.hubLiveVY * step;
                const ndx = orbit.hubLiveX - cx;
                const ndy = orbit.hubLiveY - cy;
                const nlen = Math.hypot(ndx, ndy);
                const maxNudge = nodeGrab ? 22 : 40;
                if (nlen > maxNudge) {
                    orbit.hubLiveX = cx + ndx / nlen * maxNudge;
                    orbit.hubLiveY = cy + ndy / nlen * maxNudge;
                    orbit.hubLiveVX *= 0.4;
                    orbit.hubLiveVY *= 0.4;
                }
                if (!nodeGrab && !peerGrab && nlen < 0.35 && Math.hypot(orbit.hubLiveVX, orbit.hubLiveVY) < 0.2) {
                    orbit.hubLiveX = cx;
                    orbit.hubLiveY = cy;
                    orbit.hubLiveVX = 0;
                    orbit.hubLiveVY = 0;
                }
            }
            const hx = orbit.hubLiveX;
            const hy = orbit.hubLiveY;

            if (hub) {
                const hubTf = hx.toFixed(1) + ',' + hy.toFixed(1) + ',' + zoom;
                if (orbit._hubTf !== hubTf) {
                    orbit._hubTf = hubTf;
                    hub.style.left = hx + 'px';
                    hub.style.top = hy + 'px';
                    hub.style.transform = 'translate(-50%, -50%) translateZ(0) scale(' + zoom + ')';
                }
            }

            if (nodeGrab) {
                nodeGrab.x = orbit.grabX;
                nodeGrab.y = orbit.grabY;
                nodeGrab.vx = 0;
                nodeGrab.vy = 0;
                nodeGrab.bloomWait = 0;
                const liveDx = nodeGrab.x - hx;
                const liveDy = nodeGrab.y - hy;
                nodeGrab.angle = Math.atan2(liveDy, liveDx) - orbit.spin;
                const liveR = Math.hypot(liveDx, liveDy) / Math.max(zoom, 0.01);
                nodeGrab.rx = liveR;
                nodeGrab.ry = liveR;
                nodeGrab.dispRx = liveR;
                nodeGrab.dispRy = liveR;
            }

            const settle = reduceMotion || orbit.snapLayout ? 1 : 1 - Math.exp(-(dt || 16) / 720);
            const settleHome = reduceMotion || orbit.snapLayout ? 1 : 1 - Math.exp(-(dt || 16) / 2600);
            orbitItems.forEach((item) => {
                if (item === nodeGrab) {
                    item.bloomWait = 0;
                    return;
                }
                if (item.bloomWait > 0) item.bloomWait = Math.max(0, item.bloomWait - (dt || 16));
            });
            orbitItems.forEach((item) => {
                if (item.parentId || item === nodeGrab) return;
                if (item.bloomWait > 0) return;
                const rate = item.comingHome ? settleHome : settle;
                item.angle += shortestAngle(item.angle, item.tAngle == null ? item.angle : item.tAngle) * rate;
                item.rx += ((item.tRx == null ? item.rx : item.tRx) - item.rx) * rate;
                item.ry += ((item.tRy == null ? item.ry : item.tRy) - item.ry) * rate;
                if (item.comingHome) {
                    const homeRx = item.tRx == null ? item.rx : item.tRx;
                    const homeRy = item.tRy == null ? item.ry : item.tRy;
                    const angErr = Math.abs(shortestAngle(item.angle, item.tAngle == null ? item.angle : item.tAngle));
                    if (angErr < 0.01 && Math.abs(item.rx - homeRx) < 0.8 && Math.abs(item.ry - homeRy) < 0.8) {
                        item.angle = item.tAngle == null ? item.angle : item.tAngle;
                        item.rx = homeRx;
                        item.ry = homeRy;
                        item.comingHome = false;
                    }
                }
            });

            const kidsByParent = {};
            orbitItems.forEach((item) => {
                if (!item.parentId) return;
                if (!kidsByParent[item.parentId]) kidsByParent[item.parentId] = [];
                kidsByParent[item.parentId].push(item);
            });
            function deriveKids(pid) {
                const parent = byId.get(pid);
                const list = kidsByParent[pid];
                if (!parent || !list) return;
                const pAngle = parent.tAngle == null ? parent.angle : parent.tAngle;
                const pRx = parent.tRx == null ? parent.rx : parent.tRx;
                const pRy = parent.tRy == null ? parent.ry : parent.tRy;
                const grow = pRx > 1 ? Math.max(0, Math.min(1, parent.rx / pRx)) : 1;
                list.forEach((child) => {
                    const fan = (child.tAngle == null ? child.angle : child.tAngle) - pAngle;
                    const wantAngle = parent.angle + fan;
                    const wantRx = parent.rx + ((child.tRx == null ? child.rx : child.tRx) - pRx) * grow;
                    const wantRy = parent.ry + ((child.tRy == null ? child.ry : child.tRy) - pRy) * grow;
                    if (child !== nodeGrab) {
                        if (child.comingHome) {
                            child.angle += shortestAngle(child.angle, wantAngle) * settleHome;
                            child.rx += (wantRx - child.rx) * settleHome;
                            child.ry += (wantRy - child.ry) * settleHome;
                            const angErr = Math.abs(shortestAngle(child.angle, wantAngle));
                            if (angErr < 0.01 && Math.abs(child.rx - wantRx) < 0.8 && Math.abs(child.ry - wantRy) < 0.8) {
                                child.angle = wantAngle;
                                child.rx = wantRx;
                                child.ry = wantRy;
                                child.comingHome = false;
                            }
                        } else {
                            child.angle = wantAngle;
                            child.rx = wantRx;
                            child.ry = wantRy;
                        }
                    }
                    deriveKids(child.node.dataset.field);
                });
            }
            orbitItems.forEach((item) => {
                if (!item.parentId) deriveKids(item.node.dataset.field);
            });

            const blooming = !nodeGrab && !hubGrab && !panning && orbitItems.some((item) => {
                const home = item.tRx == null ? item.rx : item.tRx;
                return Math.abs((item.rx || 0) - home) > 10;
            });
            const homing = orbitItems.some((item) => item.comingHome);
            if (nodeGrab || hubGrab || panning || blooming || homing) {
                orbitItems.forEach((item) => {
                    item.sw = item.w * zoom;
                    item.sh = item.h * zoom;
                    if (item === nodeGrab) {
                        item.tx = item.x;
                        item.ty = item.y;
                        return;
                    }
                    item.dispRx = item.rx;
                    item.dispRy = item.ry;
                    const ang = item.angle + orbit.spin;
                    item.tx = hx + Math.cos(ang) * item.rx * zoom;
                    item.ty = hy + Math.sin(ang) * item.ry * zoom;
                });
            } else {
                keepOrbitBoxesClear(hx, hy, zoom, nodeGrab, dt);
            }

            orbitItems.forEach((item) => {
                if (item === nodeGrab) return;
                const ang = item.angle + orbit.spin;
                const rx = item.dispRx == null ? item.rx : item.dispRx;
                const ry = item.dispRy == null ? item.ry : item.dispRy;
                item.sw = item.w * zoom;
                item.sh = item.h * zoom;
                item.tx = hx + Math.cos(ang) * rx * zoom;
                item.ty = hy + Math.sin(ang) * ry * zoom;
                item.x = item.tx;
                item.y = item.ty;
                item.vx = 0;
                item.vy = 0;
                item.sxv = 0;
                item.syv = 0;
            });

            orbitItems.forEach((item) => {
                const next = 'translate3d(' + (item.x - item.w / 2) + 'px,' + (item.y - item.h / 2) + 'px,0) scale(' + zoom + ')';
                if (item._tf === next) return;
                item._tf = next;
                item.node.style.left = '0px';
                item.node.style.top = '0px';
                item.node.style.transform = next;
            });
            orbitItems.forEach((item) => {
                const parent = item.parentId && byId.get(item.parentId);
                const x1 = parent ? parent.x : hx;
                const y1 = parent ? parent.y : hy;
                if (item._lx !== x1 || item._ly !== y1 || item._lx2 !== item.x || item._ly2 !== item.y) {
                    item._lx = x1;
                    item._ly = y1;
                    item._lx2 = item.x;
                    item._ly2 = item.y;
                    item.line.setAttribute('x1', x1);
                    item.line.setAttribute('y1', y1);
                    item.line.setAttribute('x2', item.x);
                    item.line.setAttribute('y2', item.y);
                }
                if (item.bloomWait > 0) item.line.setAttribute('opacity', '0');
                else item.line.removeAttribute('opacity');
                if (nodeGrab || hubGrab || panning) return;
                const rest = Math.max(Math.hypot(item.tx - (parent ? parent.tx : hx), item.ty - (parent ? parent.ty : hy)), 8);
                const stretch = Math.hypot(item.x - x1, item.y - y1) / rest;
                item.line.setAttribute('stroke-linecap', 'round');
                if (parent) {
                    item.line.setAttribute('stroke', orbitSpokeStroke(item.node, true));
                    item.line.setAttribute('stroke-width', stretch > 1.08 ? '2' : '1.5');
                } else {
                    item.line.setAttribute('stroke', orbitSpokeStroke(item.node, false));
                    item.line.setAttribute('stroke-width', stretch > 1.12 ? '1.35' : '1');
                }
            });
            if (document.getElementById('platformMenu') && !document.getElementById('platformMenu').hidden) {
                placePlatformMenu();
                placeTimezoneMenu();
            } else if (document.querySelector('.node.menu-open')) {
                placeTimezoneMenu();
            }
            const searchNode = document.querySelector('.node.search-open');
            if (searchNode) placeSearchMenu(searchNode);
            applyPeerPhysics(dt, hx, hy, zoom, step, rigidView, false, nodeGrab, hubGrab, peerGrab, hvx, hvy);
        }

        function positionNodes() {
            computeLayout();
        }

        function serializeProfile() {
            return FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return platform ? platform.label + ' ' + item.value : item.value;
                }).join(', ');
                return values ? field.label + ': ' + values : '';
            }).filter(Boolean).join('\n') || 'No facts yet.';
        }

        function caseText() {
            return '# OSINT Subject Profile\n\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\n## Analyst notes\n\n' + profile.analysis : '');
        }

        function casePlainText() {
            return 'OrbINT target\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\nNotes\n' + profile.analysis : '');
        }

        function caseHtml() {
            const subject = firstValue('name') || 'Anonymous';
            const rows = FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return escapeHtml(platform ? platform.label + ' ' + item.value : item.value);
                }).join(', ');
                if (!values) return '';
                return '<tr><th>' + escapeHtml(field.label) + '</th><td>' + values + '</td></tr>';
            }).filter(Boolean).join('');
            return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' +
                escapeHtml(subject) + ' — OrbINT</title><style>' +
                'body{font:16px/1.5 Segoe UI,sans-serif;background:#09090b;color:#fafafa;padding:32px;}' +
                'h1{font-size:28px;margin:0 0 8px;}p{color:#a1a1aa;margin:0 0 24px;}' +
                'table{width:100%;border-collapse:collapse;}th,td{padding:8px 0;border-bottom:1px solid #27272a;text-align:left;vertical-align:top;}' +
                'th{width:140px;color:#a1a1aa;font-weight:500;}pre{white-space:pre-wrap;}</style></head><body>' +
                '<h1>' + escapeHtml(subject) + '</h1>' +
                '<p>Updated ' + escapeHtml(new Date().toLocaleString()) + '</p>' +
                (rows ? '<table>' + rows + '</table>' : '<p>No facts yet.</p>') +
                (profile.analysis ? '<h2>Notes</h2><pre>' + escapeHtml(profile.analysis) + '</pre>' : '') +
                '</body></html>';
        }

        function downloadBlob(name, type, text) {
            const blob = new Blob([text], { type: type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        function caseFileName(ext) {
            const name = (firstValue('name') || 'case').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            return 'orbint-' + (name || 'case') + '.' + ext;
        }

        function closeExportMenu() {
            const menu = document.getElementById('exportMenu');
            if (menu) menu.hidden = true;
            document.getElementById('dock').classList.remove('picking-export');
        }

        function siteShareUrl() {
            const href = String((window.location && window.location.href) || '').split('#')[0];
            if (/^https?:\/\//i.test(href) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(href)) {
                return href.replace(/\/index\.html$/i, '/');
            }
            return 'https://orbint.net/';
        }

        const QR_EXP = new Uint8Array(512);
        const QR_LOG = new Uint8Array(256);
        (function () {
            let x = 1;
            for (let i = 0; i < 255; i++) {
                QR_EXP[i] = x;
                QR_LOG[x] = i;
                x <<= 1;
                if (x & 256) x ^= 0x11d;
            }
            for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
        })();

        function qrMul(a, b) {
            return a && b ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0;
        }

        const QR_M = {
            1: { ec: 10, g1: [1, 16], g2: [0, 0] },
            2: { ec: 16, g1: [1, 28], g2: [0, 0] },
            3: { ec: 26, g1: [1, 44], g2: [0, 0] },
            4: { ec: 18, g1: [2, 32], g2: [0, 0] },
            5: { ec: 24, g1: [2, 43], g2: [0, 0] },
            6: { ec: 16, g1: [4, 27], g2: [0, 0] },
            7: { ec: 18, g1: [4, 31], g2: [0, 0] },
            8: { ec: 22, g1: [2, 38], g2: [2, 39] },
            9: { ec: 22, g1: [3, 36], g2: [2, 37] },
            10: { ec: 26, g1: [4, 43], g2: [1, 44] }
        };
        const QR_ALIGN = { 1: [], 2: [18], 3: [22], 4: [26], 5: [30], 6: [34], 7: [22, 38], 8: [24, 42], 9: [26, 46], 10: [28, 50] };
        const QR_REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
        const QR_VERSION_BITS = { 7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3 };

        function qrPolyMul(a, b) {
            const out = new Array(a.length + b.length - 1).fill(0);
            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) out[i + j] ^= qrMul(a[i], b[j]);
            }
            return out;
        }

        function qrRsEncode(data, ec) {
            let gen = [1];
            for (let i = 0; i < ec; i++) gen = qrPolyMul(gen, [1, QR_EXP[i]]);
            const rest = data.concat(new Array(ec).fill(0));
            for (let i = 0; i < data.length; i++) {
                const coef = rest[i];
                if (!coef) continue;
                for (let j = 0; j < gen.length; j++) rest[i + j] ^= qrMul(gen[j], coef);
            }
            return rest.slice(data.length);
        }

        function qrBitsToBytes(bits) {
            const bytes = [];
            for (let i = 0; i < bits.length; i += 8) {
                let v = 0;
                for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i + j] || 0);
                bytes.push(v);
            }
            return bytes;
        }

        function qrEncode(text) {
            const bytes = Array.from(new TextEncoder().encode(text));
            let version = 0;
            for (let v = 1; v <= 10; v++) {
                const spec = QR_M[v];
                const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
                const need = 4 + (v >= 10 ? 16 : 8) + bytes.length * 8 + 4;
                if (need <= dataCw * 8) { version = v; break; }
            }
            if (!version) return null;
            const spec = QR_M[version];
            const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
            const bits = [];
            const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
            put(0b0100, 4);
            put(bytes.length, version >= 10 ? 16 : 8);
            bytes.forEach((b) => put(b, 8));
            const maxBits = dataCw * 8;
            put(0, Math.min(4, maxBits - bits.length));
            while (bits.length % 8) bits.push(0);
            const pad = [0xEC, 0x11];
            let pi = 0;
            while (bits.length + 8 <= maxBits) {
                put(pad[pi % 2], 8);
                pi++;
            }
            const codewords = qrBitsToBytes(bits);
            while (codewords.length < dataCw) codewords.push(0);
            codewords.length = dataCw;
            const blocks = [];
            let offset = 0;
            const groups = [spec.g1, spec.g2];
            groups.forEach((g) => {
                for (let i = 0; i < g[0]; i++) {
                    const d = codewords.slice(offset, offset + g[1]);
                    offset += g[1];
                    blocks.push({ d: d, e: qrRsEncode(d, spec.ec) });
                }
            });
            const interleaved = [];
            const maxD = Math.max(spec.g1[1], spec.g2[1]);
            for (let i = 0; i < maxD; i++) {
                blocks.forEach((b) => { if (i < b.d.length) interleaved.push(b.d[i]); });
            }
            for (let i = 0; i < spec.ec; i++) {
                blocks.forEach((b) => interleaved.push(b.e[i]));
            }
            const outBits = [];
            interleaved.forEach((b) => { for (let i = 7; i >= 0; i--) outBits.push((b >> i) & 1); });
            for (let i = 0; i < QR_REMAINDER[version]; i++) outBits.push(0);
            return { version: version, bits: outBits };
        }

        function qrFillFinder(grid, reserved, r, c) {
            for (let y = -1; y <= 7; y++) {
                for (let x = -1; x <= 7; x++) {
                    const rr = r + y;
                    const cc = c + x;
                    if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid.length) continue;
                    const dark = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
                    grid[rr][cc] = dark ? 1 : 0;
                    reserved[rr][cc] = 1;
                }
            }
        }

        function qrFillAlign(grid, reserved, cy, cx) {
            for (let y = -2; y <= 2; y++) {
                for (let x = -2; x <= 2; x++) {
                    const ring = Math.max(Math.abs(x), Math.abs(y));
                    grid[cy + y][cx + x] = (ring === 0 || ring === 2) ? 1 : 0;
                    reserved[cy + y][cx + x] = 1;
                }
            }
        }

        function qrFormatBits(mask) {
            const data = mask & 7;
            let rem = data;
            for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
            return ((data << 10) | rem) ^ 0x5412;
        }

        function qrSetFormat(grid, reserved, bits, size) {
            const set = (x, y, i) => {
                grid[y][x] = (bits >> i) & 1;
                reserved[y][x] = 1;
            };
            for (let i = 0; i <= 5; i++) set(8, i, i);
            set(8, 7, 6);
            set(8, 8, 7);
            set(7, 8, 8);
            for (let i = 9; i < 15; i++) set(14 - i, 8, i);
            for (let i = 0; i < 8; i++) set(size - 1 - i, 8, i);
            for (let i = 8; i < 15; i++) set(8, size - 15 + i, i);
            grid[size - 8][8] = 1;
            reserved[size - 8][8] = 1;
        }

        function qrMaskBit(mask, r, c) {
            if (mask === 0) return ((r + c) & 1) === 0;
            if (mask === 1) return (r & 1) === 0;
            if (mask === 2) return c % 3 === 0;
            if (mask === 3) return (r + c) % 3 === 0;
            if (mask === 4) return (((r >> 1) + Math.floor(c / 3)) & 1) === 0;
            if (mask === 5) return (r * c) % 2 + (r * c) % 3 === 0;
            if (mask === 6) return (((r * c) % 2 + (r * c) % 3) & 1) === 0;
            return (((r + c) % 2 + (r * c) % 3) & 1) === 0;
        }

        function qrPenalty(grid) {
            const size = grid.length;
            let score = 0;
            for (let r = 0; r < size; r++) {
                let run = 1;
                for (let c = 1; c <= size; c++) {
                    if (c < size && grid[r][c] === grid[r][c - 1]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let c = 0; c < size; c++) {
                let run = 1;
                for (let r = 1; r <= size; r++) {
                    if (r < size && grid[r][c] === grid[r - 1][c]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let r = 0; r < size - 1; r++) {
                for (let c = 0; c < size - 1; c++) {
                    const v = grid[r][c];
                    if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
                }
            }
            const pattern = function (line) {
                let s = 0;
                const str = line.join('');
                let i = 0;
                while ((i = str.indexOf('10111010000', i)) >= 0) { s += 40; i++; }
                i = 0;
                while ((i = str.indexOf('00001011101', i)) >= 0) { s += 40; i++; }
                return s;
            };
            for (let r = 0; r < size; r++) score += pattern(grid[r]);
            for (let c = 0; c < size; c++) {
                const col = [];
                for (let r = 0; r < size; r++) col.push(grid[r][c]);
                score += pattern(col);
            }
            let dark = 0;
            grid.forEach((row) => row.forEach((v) => { dark += v; }));
            score += Math.abs(Math.floor(dark * 100 / (size * size) / 5) - 10) * 10;
            return score;
        }

        function qrMatrix(text) {
            const encoded = qrEncode(text);
            if (!encoded) return null;
            const size = 21 + 4 * (encoded.version - 1);
            const base = Array.from({ length: size }, () => new Array(size).fill(0));
            const reserved = Array.from({ length: size }, () => new Array(size).fill(0));
            qrFillFinder(base, reserved, 0, 0);
            qrFillFinder(base, reserved, 0, size - 7);
            qrFillFinder(base, reserved, size - 7, 0);
            const pos = [6].concat(QR_ALIGN[encoded.version]);
            pos.forEach((r) => {
                pos.forEach((c) => {
                    if ((r < 9 && c < 9) || (r < 9 && c > size - 10) || (r > size - 10 && c < 9)) return;
                    qrFillAlign(base, reserved, r, c);
                });
            });
            for (let i = 8; i < size - 8; i++) {
                base[6][i] = 1 - (i & 1);
                base[i][6] = 1 - (i & 1);
                reserved[6][i] = 1;
                reserved[i][6] = 1;
            }
            reserved[size - 8][8] = 1;
            base[size - 8][8] = 1;
            if (encoded.version >= 7) {
                const vb = QR_VERSION_BITS[encoded.version];
                let k = 0;
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 3; j++) {
                        const bit = (vb >> k) & 1;
                        base[size - 11 + j][i] = bit;
                        base[i][size - 11 + j] = bit;
                        reserved[size - 11 + j][i] = 1;
                        reserved[i][size - 11 + j] = 1;
                        k++;
                    }
                }
            }
            for (let i = 0; i < 9; i++) {
                if (i !== 6) { reserved[8][i] = 1; reserved[i][8] = 1; }
            }
            reserved[8][7] = 1;
            reserved[7][8] = 1;
            reserved[8][8] = 1;
            for (let i = 0; i < 8; i++) reserved[size - 1 - i][8] = 1;
            for (let i = 0; i < 8; i++) reserved[8][size - 1 - i] = 1;

            let best = null;
            let bestScore = Infinity;
            for (let mask = 0; mask < 8; mask++) {
                const grid = base.map((row) => row.slice());
                const rec = reserved.map((row) => row.slice());
                let bit = 0;
                let upward = true;
                for (let col = size - 1; col > 0; col -= 2) {
                    if (col === 6) col--;
                    for (let i = 0; i < size; i++) {
                        const row = upward ? size - 1 - i : i;
                        for (let dc = 0; dc < 2; dc++) {
                            const c = col - dc;
                            if (rec[row][c]) continue;
                            const v = encoded.bits[bit] || 0;
                            grid[row][c] = v ^ (qrMaskBit(mask, row, c) ? 1 : 0);
                            bit++;
                        }
                    }
                    upward = !upward;
                }
                qrSetFormat(grid, rec, qrFormatBits(mask), size);
                const score = qrPenalty(grid);
                if (score < bestScore) {
                    bestScore = score;
                    best = grid;
                }
            }
            return best;
        }

        function drawShareQr(text) {
            const canvas = document.getElementById('shareQr');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const matrix = qrMatrix(text);
            const cssTarget = 232;
            if (!matrix) {
                canvas.width = cssTarget;
                canvas.height = cssTarget;
                canvas.style.width = cssTarget + 'px';
                canvas.style.height = 'auto';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, cssTarget, cssTarget);
                return;
            }
            const quiet = 4;
            const dim = matrix.length + quiet * 2;
            const moduleCss = Math.max(5, Math.round(cssTarget / dim));
            const css = dim * moduleCss;
            const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
            const module = moduleCss * dpr;
            const px = dim * module;
            canvas.width = px;
            canvas.height = px;
            canvas.style.width = css + 'px';
            canvas.style.height = 'auto';
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, px, px);
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            for (let r = 0; r < matrix.length; r++) {
                for (let c = 0; c < matrix[r].length; c++) {
                    if (!matrix[r][c]) continue;
                    ctx.rect((c + quiet) * module, (r + quiet) * module, module, module);
                }
            }
            ctx.fill();
        }

        function closeShare() {
            const sheet = document.getElementById('shareSheet');
            hideSheet(sheet);
            const dock = document.getElementById('dock');
            if (dock) dock.classList.remove('picking-share');
        }

        function openShare() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeHelp();
            closeInstall();
            closeAddField();
            closeToolkit();
            const sheet = document.getElementById('shareSheet');
            const urlEl = document.getElementById('shareUrl');
            const copyBtn = document.getElementById('shareCopy');
            if (!sheet) return;
            const url = siteShareUrl();
            if (urlEl) {
                urlEl.textContent = url;
                urlEl.title = url;
            }
            if (copyBtn) copyBtn.textContent = 'Copy';
            const nativeBtn = document.getElementById('shareNative');
            if (nativeBtn) nativeBtn.hidden = !navigator.share;
            if (window.OrbINTShare && typeof OrbINTShare.paint === 'function') OrbINTShare.paint();
            const viewEl = document.getElementById('shareViewUrl');
            const sessionUrl = viewEl && /^https?:/i.test(String(viewEl.textContent || '').trim())
                ? String(viewEl.textContent).trim()
                : url;
            drawShareQr(sessionUrl);
            showSheet(sheet);
            document.getElementById('dock').classList.add('picking-share');
        }

        let deferredInstallPrompt = null;

        function isAppInstalled() {
            if (window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches) return true;
            if (window.navigator.standalone) return true;
            return false;
        }

        function installDevice() {
            const ua = navigator.userAgent || '';
            const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const android = /Android/.test(ua);
            const mac = /Mac OS X|Macintosh/.test(ua) && !iOS;
            const win = /Windows/.test(ua);
            const chrome = /Chrome|CriOS|Edg|EdgiOS|OPR|Brave/i.test(ua) && !/iPhone|iPad|iPod/.test(ua);
            const safari = /Safari/.test(ua) && !/Chrome|CriOS|Android|Edg|OPR|Firefox/i.test(ua);
            return { iOS: iOS, android: android, mac: mac, win: win, chrome: chrome, safari: safari };
        }

        function installStepsHtml() {
            const d = installDevice();
            let steps = [];
            if (d.iOS) {
                steps = [
                    'Tap the Share button in Safari.',
                    'Scroll and tap Add to Home Screen.',
                    'Tap Add. OrbINT appears on your home screen.'
                ];
            } else if (d.android) {
                steps = [
                    'Tap Install in this window, or open the browser menu.',
                    'Choose Install app or Add to Home screen.',
                    'Confirm. OrbINT opens from your app drawer.'
                ];
            } else if (d.mac && d.safari) {
                steps = [
                    'Open the File menu in Safari, or the Share button.',
                    'Choose Add to Dock.',
                    'OrbINT stays in the Dock and Launchpad like any Mac app.'
                ];
            } else if (d.win || d.mac || d.chrome) {
                steps = [
                    'Click Install in this window, or the install icon in the address bar.',
                    'Confirm the prompt.',
                    'OrbINT opens in its own window from the Start menu, Dock, or desktop.'
                ];
            } else {
                steps = [
                    'Open this site in Chrome, Edge, or Safari.',
                    'Use Install in this window, or Add to Home Screen / Add to Dock from the browser menu.',
                    'OrbINT then launches like an app on this device.'
                ];
            }
            return steps.map(function (text, i) {
                return '<li><b>' + (i + 1) + '</b><span>' + text + '</span></li>';
            }).join('');
        }

        function fillInstallSheet() {
            const installed = isAppInstalled();
            const canPrompt = !!deferredInstallPrompt;
            const kicker = document.getElementById('installKicker');
            const title = document.getElementById('installTitle');
            const lead = document.getElementById('installLead');
            const steps = document.getElementById('installSteps');
            const go = document.getElementById('installGo');
            const dismiss = document.getElementById('installDismiss');
            if (kicker) kicker.textContent = installed ? 'This device' : 'Home screen';
            if (title) title.textContent = installed ? 'Already installed' : 'Install OrbINT';
            if (lead) {
                lead.textContent = installed
                    ? 'OrbINT is already running as an app on this device. You can keep using it from the home screen, Dock, or Start menu.'
                    : 'Add this case file to this device like an app. It works on iPhone, iPad, Android, Windows, and Mac.';
            }
            if (steps) {
                steps.hidden = installed;
                steps.innerHTML = installed ? '' : installStepsHtml();
            }
            if (dismiss) dismiss.textContent = installed ? 'Close' : 'Not now';
            if (go) {
                go.hidden = installed;
                go.textContent = canPrompt ? 'Install' : 'Got it';
            }
        }

        function closeInstall() {
            hideSheet(document.getElementById('installSheet'));
        }

        function openInstall() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeHelp();
            closeAddField();
            closeToolkit();
            fillInstallSheet();
            showSheet(document.getElementById('installSheet'));
        }

        async function confirmInstall() {
            const go = document.getElementById('installGo');
            if (!deferredInstallPrompt) {
                if (!go || go.textContent !== 'Install') closeInstall();
                return;
            }
            const prompt = deferredInstallPrompt;
            deferredInstallPrompt = null;
            try {
                prompt.prompt();
                const result = await prompt.userChoice;
                if (result && result.outcome === 'accepted') closeInstall();
                else fillInstallSheet();
            } catch (error) {
                fillInstallSheet();
            }
        }

        function toggleShare() {
            const sheet = document.getElementById('shareSheet');
            if (!sheet) return;
            if (sheet.hidden) openShare();
            else closeShare();
        }

        function copyShareLink() {
            const url = siteShareUrl();
            const button = document.getElementById('shareCopy');
            const done = () => {
                if (!button) return;
                button.textContent = 'Copied';
                setTimeout(() => { button.textContent = 'Copy'; }, 1200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done).catch(done);
                return;
            }
            const area = document.createElement('textarea');
            area.value = url;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            done();
        }

        function nativeShareSite() {
            const url = siteShareUrl();
            if (navigator.share) {
                navigator.share({
                    title: 'OrbINT',
                    text: 'Open-source Reconnaissance Bureau of Intelligence',
                    url: url
                }).catch(function () {});
                return;
            }
            copyShareLink();
        }

        function closeHelp() {
            hideSheet(document.getElementById('helpGuide'));
        }

        function openHelp() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeAddField();
            closeToolkit();
            closeProfileMenu();
            closeProfilePrompt();
            closeSettings();
            showSheet(document.getElementById('helpGuide'));
        }

        function toggleExportMenu() {
            exportCase();
        }

        function exportCase() {
            closeExportMenu();
            const id = profileLibrary && profileLibrary.activeId;
            const bundle = (profileLibrary && typeof exportProfileBundle === 'function')
                ? exportProfileBundle(id)
                : stampMissingFields(JSON.parse(JSON.stringify(profile || {})), profile && profile.nulls);
            const skipMedia = !!(appSettings && appSettings.exportNoPhotos);
            Promise.resolve(skipMedia ? stripExportMedia(bundle) : attachImagesToBundle(bundle, id)).then((full) => {
                downloadBlob(caseFileName('json'), 'application/json', JSON.stringify(full, null, 2));
            });
        }

        function closeResetConfirm() {
            hideSheet(document.getElementById('resetConfirm'));
        }

        function closeBombConfirm() {
            hideSheet(document.getElementById('bombConfirm'));
        }

        function closeSettings() {
            closeSetPick();
            hideSheet(document.getElementById('settingsSheet'));
        }

        function openSettings() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeAddField();
            closeToolkit();
            closeProfileMenu();
            closeProfilePrompt();
            closeHelp();
            closeResetConfirm();
            closeBombConfirm();
            closePhoneMore();
            bombPulseLow = false;
            syncSettingsForm();
            showSheet(document.getElementById('settingsSheet'));
        }

        function armLogicBombNow() {
            const sheet = document.getElementById('bombConfirm');
            if (!sheet) {
                applyResetCase();
                return;
            }
            showSheet(sheet);
        }

        function resetCase() {
            const sheet = document.getElementById('resetConfirm');
            if (!sheet) return;
            showSheet(sheet);
            const cancel = document.getElementById('resetCancel');
            if (cancel) cancel.focus();
        }

        function applyResetCase() {
            closeResetConfirm();
            Object.keys(mediaStore).forEach((id) => {
                if (mediaStore[id] && mediaStore[id].src && String(mediaStore[id].src).indexOf('blob:') === 0) {
                    URL.revokeObjectURL(mediaStore[id].src);
                }
                delete mediaStore[id];
            });
            const wipeLocal = function () {
                try { localStorage.clear(); } catch (error) {}
                try { sessionStorage.clear(); } catch (error) {}
                try {
                    document.cookie.split(';').forEach((part) => {
                        const name = part.split('=')[0].trim();
                        if (!name) return;
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
                    });
                } catch (error) {}
            };
            const reloadFresh = function () {
                const url = new URL(location.href);
                url.searchParams.set('v', String(Date.now()));
                location.replace(url.pathname + url.search + url.hash);
            };
            const dropWorkers = (navigator.serviceWorker && navigator.serviceWorker.getRegistrations)
                ? navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
                : Promise.resolve();
            const dropCaches = (window.caches && caches.keys)
                ? caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                : Promise.resolve();
            const bustHttp = function () {
                const files = ['./', './index.html', './app.js', './app.js?v=255', './osint-tools.js', './osint-tools.js?v=255', './investigation.js', './investigation.js?v=255', './css/base.css?v=255', './css/orbit.css?v=255', './css/timeline.css?v=255', './css/whiteboard.css?v=255', './css/harvester.css?v=255', './css/datasheet.css?v=255', './sw.js', './manifest.webmanifest'];
                return Promise.all(files.map(function (path) {
                    return fetch(path, { cache: 'reload', credentials: 'same-origin' }).catch(function () {});
                }));
            };
            Promise.resolve(clearAllProfileImages()).then(function () {
                wipeLocal();
                return Promise.all([dropWorkers, dropCaches]).then(bustHttp);
            }).then(reloadFresh).catch(reloadFresh);
        }

        function recenterOrbit() {
            if (window.OrbINTCase && OrbINTCase.resetView && OrbINTCase.resetView()) return;
            orbit.dragX = 0;
            orbit.dragY = 0;
            orbit.gridPanX = 0;
            orbit.gridPanY = 0;
            orbit.gridShiftX = 0;
            orbit.gridShiftY = 0;
            orbit.hubLiveX = null;
            orbit.hubLiveY = null;
            orbit.hubLiveVX = 0;
            orbit.hubLiveVY = 0;
            orbit.userZoomed = false;
            orbit.freeCam = false;
            orbit.fitZooming = true;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.zoomBusy = false;
            orbit.parallaxX = 0;
            orbit.parallaxY = 0;
            orbit.targetParallaxX = 0;
            orbit.targetParallaxY = 0;
            nodeHomes.clear();
            if (isPhone()) orbit.snapLayout = true;
            if (typeof positionNodes === 'function') positionNodes();
            if (isPhone()) orbit.snapLayout = false;
        }

        try { createNodes(); applyStoredFieldLabels(); applyHiddenFields(); } catch (error) { console.error(error); }
        try { document.body.classList.toggle('phone', isPhone()); if (isPhone()) setPanelOpen(false); } catch (error) {}
        if (window.OrbINTCase && typeof OrbINTCase.init === 'function') {
            OrbINTCase.init({
                getProfile: function () { return profile; },
                getFields: function () { return FIELDS; },
                firstValue: firstValue,
                fieldById: fieldById,
                platformById: platformById,
                imageGalleryItems: imageGalleryItems,
                applyProfilePhotoFiles: applyProfilePhotoFiles,
                applyProfilePhotoUrl: applyProfilePhotoUrl,
                escapeHtml: escapeHtml,
                addFact: addFact,
                addFactSlot: addFactSlot,
                flushFacts: flushFacts,
                srcToBlob: srcToBlob,
                copyImageSource: copyImageSource,
                closeSheetPick: function () {
                    if (typeof closeSheetPick === 'function') closeSheetPick();
                },
                readonly: function () {
                    return !!(window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly());
                },
                getFactCaptured: function (id) {
                    return factStampIso(lastFactRecord(id));
                },
                setFactCaptured: function (id, iso) {
                    patchFactMeta(id, 'capturedAt', iso || '');
                    paintFactCaptured(id);
                    if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
                },
                save: function () {
                    if (typeof saveProfile === 'function') saveProfile();
                    if (typeof queueLibrarySync === 'function') queueLibrarySync();
                }
            });
        }
        try { initProfileLibrary(); } catch (error) { console.error(error); }
        try { renderProfile(); } catch (error) { console.error(error); }
        try { renderNodes(); } catch (error) { console.error(error); }
        try { initSidebarWidth(); } catch (error) {}
        try { bindSidebarResize(); } catch (error) {}
        try { pushHistory(); } catch (error) {}

        mapCanvas.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            event.preventDefault();
            const fieldId = input.id.replace('field-', '');
            saveInputAsIs(input);
            flushHistory();
            activeField = fieldId;
            renderLeads(fieldId);
        });

        mapCanvas.addEventListener('change', (event) => {
            const select = event.target.closest('select');
            if (select && select.id && select.id.startsWith('field-')) {
                syncNodeFilled(select);
                saveInputAsIs(select);
                updateTimezoneClocks();
                return;
            }
            const upload = event.target.closest('[data-upload]');
            if (!upload || !upload.files || !upload.files[0]) return;
            const fieldId = upload.dataset.upload;
            const file = upload.files[0];
            const finish = (extra) => {
                addFact(fieldId, file.name + ' (' + Math.round(file.size / 1024) + ' KB)', extra);
                activeField = fieldId;
                renderLeads(fieldId);
            };
            if (file.type.indexOf('image/') === 0) {
                imageVersionsFromFile(file).then((versions) => finish(versions || { kind: 'image' }));
            } else if (file.type.indexOf('audio/') === 0 || fieldBase(fieldId) === 'audio') {
                const extra = { kind: 'audio' };
                if (file.size < 1800000) {
                    readFileAsDataURL(file).then((dataUrl) => {
                        extra.media = dataUrl;
                        finish(extra);
                    }).catch(() => finish(extra));
                } else {
                    if (mediaStore[fieldId] && mediaStore[fieldId].src && String(mediaStore[fieldId].src).indexOf('blob:') === 0) {
                        URL.revokeObjectURL(mediaStore[fieldId].src);
                    }
                    mediaStore[fieldId] = { src: URL.createObjectURL(file), kind: 'audio', name: file.name };
                    extra.session = true;
                    finish(extra);
                }
            } else {
                finish();
            }
        });

        mapCanvas.addEventListener('click', (event) => {
            const secretBtn = event.target.closest('[data-secret-reveal]');
            if (secretBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleSecretReveal(secretBtn.dataset.secretReveal);
                return;
            }
            const more = event.target.closest('[data-more]');
            if (more) {
                event.preventDefault();
                event.stopPropagation();
                const node = more.closest('.node');
                const menu = document.getElementById('fieldMenu');
                if (menu && !menu.hidden && menu.dataset.field === more.dataset.more) closeFieldMenu();
                else openFieldMenu(event, node);
                return;
            }
            const searchBtn = event.target.closest('[data-search]');
            if (searchBtn) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = searchBtn.dataset.search;
                const menu = document.getElementById('searchMenu');
                const node = searchBtn.closest('.node');
                if (menu && !menu.hidden && node && node.classList.contains('search-open')) closeSearchMenu();
                else openSearchMenu(fieldId);
                return;
            }
            const tzTrigger = event.target.closest('.tz-pick, .tz-trigger, .tz-abbr');
            if (tzTrigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = tzTrigger.closest('.node');
                const menu = document.getElementById('tzMenu');
                if (menu && !menu.hidden && node && node.classList.contains('tz-open')) closeTimezoneMenu();
                else openTimezoneMenu(node);
                return;
            }
            const ccTrigger = event.target.closest('.cc-pick, .cc-trigger, .cc-abbr, .cc-name');
            if (ccTrigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = ccTrigger.closest('.node');
                const menu = document.getElementById('ccMenu');
                if (menu && !menu.hidden && node && node.classList.contains('cc-open')) closeCountryCodeMenu();
                else openCountryCodeMenu(node);
                return;
            }
            const photosOpen = event.target.closest('[data-photos-open], .image-add');
            if (photosOpen) {
                event.preventDefault();
                event.stopPropagation();
                openPhotosSheet();
                return;
            }
            const trigger = event.target.closest('.platform-trigger');
            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = trigger.closest('.node');
                const menu = document.getElementById('platformMenu');
                if (menu && !menu.hidden) closePlatformMenu();
                else openPlatformMenu(node);
                return;
            }
            const icon = event.target.closest('.platform-icon');
            if (icon) {
                const node = icon.closest('.node');
                const fieldId = node && node.dataset.field;
                if (node && isPlatformField(fieldId)) openPlatformMenu(node);
                return;
            }
            const mediaBtn = event.target.closest('[data-open-media]');
            if (mediaBtn) {
                event.preventDefault();
                event.stopPropagation();
                const mediaId = mediaBtn.dataset.openMedia;
                if (fieldBase(mediaId) === 'ip') {
                    const input = document.getElementById('field-' + mediaId);
                    openIpLocation((input && input.value) || firstValue(mediaId));
                    return;
                }
                if (fieldBase(mediaId) === 'address') {
                    openFieldMaps(mediaId);
                    return;
                }
                openMediaViewer(mediaId);
                return;
            }
            const clear = event.target.closest('[data-clear]');
            if (clear) {
                event.preventDefault();
                event.stopPropagation();
                clearField(clear.dataset.clear);
                return;
            }
            const button = event.target.closest('[data-file]');
            if (!button) return;
            const upload = document.querySelector('[data-upload="' + button.dataset.file + '"]');
            if (upload) upload.click();
        });

        mapCanvas.addEventListener('beforeinput', (event) => {
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            if (fieldBase(input.id.replace('field-', '')) !== 'phone') return;
            if (event.inputType === 'insertText' && event.data && /\D/.test(event.data)) {
                event.preventDefault();
            }
        });

        mapCanvas.addEventListener('input', (event) => {
            const input = event.target.closest('input, select');
            if (!input || !input.id || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            if (fieldBase(fieldId) === 'phone') applyPhoneMask(input);
            syncNodeFilled(input);
            saveInputAsIs(input);
            if (isThumbField(fieldId)) {
                setFieldThumb(fieldId);
            }
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
            if (fieldBase(fieldId) === 'timezone') updateTimezoneClocks();
        });

        mapCanvas.addEventListener('paste', (event) => {
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            if (fieldBase(fieldId) !== 'image' && fieldBase(fieldId) !== 'audio') return;
            setTimeout(() => {
                const value = input.value.trim();
                if (looksLikeUrl(value) && mediaStore[fieldId]) {
                    if (mediaStore[fieldId].src && String(mediaStore[fieldId].src).indexOf('blob:') === 0) {
                        URL.revokeObjectURL(mediaStore[fieldId].src);
                    }
                    delete mediaStore[fieldId];
                }
                setFieldThumb(fieldId);
                saveInputAsIs(input);
                syncNodeFilled(input);
                activeField = fieldId;
                renderLeads(fieldId);
            }, 0);
        });

        mapCanvas.addEventListener('focusin', (event) => {
            const node = event.target.closest('.node');
            if (!node) return;
            activeField = node.dataset.field;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item === node);
            });
            renderLeads(activeField);
        });

        document.getElementById('factsList').addEventListener('click', (event) => {
            const mapsBtn = event.target.closest('[data-open-maps]');
            if (mapsBtn) {
                event.stopPropagation();
                if (mapsBtn.disabled || mapsBtn.getAttribute('aria-disabled') === 'true' || mapsBtn.getAttribute('href') === '#') {
                    event.preventDefault();
                    return;
                }
                if (mapsBtn.tagName === 'A' && mapsBtn.getAttribute('href')) return;
                event.preventDefault();
                openFieldMaps(mapsBtn.dataset.openMaps);
                return;
            }
            if (event.target.closest('a')) return;
            const add = event.target.closest('[data-dossier-add]');
            if (add) {
                event.preventDefault();
                event.stopPropagation();
                toggleAddField();
                return;
            }
            const moreBtn = event.target.closest('[data-fact-more]');
            if (moreBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleFactDetails(moreBtn.getAttribute('data-fact-more'));
                return;
            }
            const hideBtn = event.target.closest('[data-sheet-hide]');
            if (hideBtn) {
                event.preventDefault();
                event.stopPropagation();
                hideField(hideBtn.getAttribute('data-sheet-hide'));
                return;
            }
            const dupBtn = event.target.closest('[data-sheet-dup]');
            if (dupBtn) {
                event.preventDefault();
                event.stopPropagation();
                duplicateField(dupBtn.getAttribute('data-sheet-dup'), { focus: 'sheet' });
                return;
            }
            const sheetPlat = event.target.closest('[data-sheet-platform]');
            if (sheetPlat) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = sheetPlat.getAttribute('data-sheet-platform') || '';
                const menu = document.getElementById('platformMenu');
                if (menu && !menu.hidden && (menu.dataset.field === fieldId)) {
                    closePlatformMenu();
                    return;
                }
                const node = document.querySelector('.node[data-field="' + fieldId + '"]');
                openPlatformMenu(node || fieldId, sheetPlat);
                return;
            }
            const sheetPick = event.target.closest('[data-sheet-pick]');
            if (sheetPick) {
                event.preventDefault();
                event.stopPropagation();
                openSheetPick(sheetPick);
                return;
            }
            if (event.target.closest('[data-sheet-field], [data-sheet-meta], .fact-prov, .fact-detail, .case-file, .sheet-pick, #sheetPickMenu, [data-fact-more], [data-fact-cal], [data-fact-time]')) return;
            const find = event.target.closest('[data-search-field]');
            if (find) {
                event.preventDefault();
                event.stopPropagation();
                openSearchMenu(find.dataset.searchField);
                return;
            }
            const reveal = event.target.closest('[data-secret-reveal], [data-reveal]');
            if (reveal) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = reveal.dataset.secretReveal || decodeURIComponent(reveal.dataset.reveal || '').split('|')[0];
                toggleSecretReveal(fieldId);
                return;
            }
            const button = event.target.closest('[data-remove]');
            if (button) {
                removeFact(button.dataset.remove, decodeURIComponent(button.dataset.value));
                return;
            }
            const row = event.target.closest('[data-focus]');
            if (!row) return;
            activeField = row.dataset.focus;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item.dataset.field === activeField);
            });
            const sheet = row.querySelector('[data-sheet-field]');
            if (sheet) {
                if (isPlatformField(row.dataset.focus) && !fieldPlatformId(row.dataset.focus)) {
                    const pick = row.querySelector('.sheet-platform');
                    const node = document.querySelector('.node[data-field="' + row.dataset.focus + '"]');
                    if (pick) pick.focus();
                    openPlatformMenu(node || row.dataset.focus, pick || row.querySelector('[data-sheet-platform]'));
                    return;
                }
                sheet.focus();
                return;
            }
            if (isPhone() && !profilePanel.classList.contains('open')) {
                openPhoneField(row.dataset.focus);
                return;
            }
            renderProfile();
        });

        document.getElementById('factsList').addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.isComposing || event.keyCode === 229) return;
            if (event.target.closest('[data-fact-meta], .fact-source, .sheet-area')) return;
            const input = event.target.closest('[data-sheet-field]');
            if (!input || input.tagName === 'TEXTAREA') return;
            event.preventDefault();
            commitSheetEnter(input.getAttribute('data-sheet-field') || input.dataset.sheetField);
        });
        document.getElementById('factsList').addEventListener('input', (event) => {
            const meta = event.target.closest('[data-sheet-meta]');
            if (meta) {
                patchFactMeta(meta.getAttribute('data-sheet-meta'), meta.getAttribute('data-fact-meta'), meta.value);
                return;
            }
            const input = event.target.closest('[data-sheet-field]');
            if (!input) return;
            const fieldId = input.dataset.sheetField;
            if (fieldBase(fieldId) === 'phone') applyPhoneMask(input);
            const value = fieldBase(fieldId) === 'timezone'
                ? resolveTimezoneValue(input.value)
                : (fieldBase(fieldId) === 'countrycode' ? (resolveCountryCodeValue(input.value) || input.value) : input.value);
            writeLatestFact(fieldId, value, extrasFromInput(fieldId, value));
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
        });
        document.getElementById('factsList').addEventListener('change', (event) => {
            const meta = event.target.closest('[data-sheet-meta]');
            if (!meta) return;
            patchFactMeta(meta.getAttribute('data-sheet-meta'), meta.getAttribute('data-fact-meta'), meta.value);
        });

        function bindCaseFileFields() {
            ['caseNumber', 'caseOffense', 'caseInvestigator'].forEach(function (id) {
                const el = document.getElementById(id);
                if (!el || el.dataset.boundCase) return;
                el.dataset.boundCase = '1';
                const apply = function () {
                    if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
                    profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                    const map = { caseNumber: 'number', caseOffense: 'offense', caseInvestigator: 'investigator' };
                    profile.case[map[id]] = el.value;
                    if (id === 'caseOffense') {
                        const pick = document.getElementById('caseOffensePick');
                        if (pick) pick.dataset.value = el.value;
                    }
                    if (id === 'caseNumber' && el.value && !profile.case.openedAt) profile.case.openedAt = new Date().toISOString();
                    saveProfile();
                };
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            });
            function bindCasePick(id) {
                const btn = document.getElementById(id);
                if (!btn || btn.dataset.boundCase) return;
                btn.dataset.boundCase = '1';
                btn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    openSheetPick(btn);
                });
            }
            bindCasePick('caseStatus');
            bindCasePick('caseOffensePick');
        }
        bindCaseFileFields();

        let sheetPickOpen = '';
        let sheetPickAnchor = null;
        let sheetPickCloseTimer = 0;

        function finishSheetPickClose(menu) {
            hideSheetPickTip();
            if (!menu || sheetPickOpen) return;
            menu.hidden = true;
            menu.innerHTML = '';
            menu.classList.remove('is-up', 'is-in', 'is-out');
            menu.style.left = '';
            menu.style.top = '';
            menu.style.bottom = '';
            menu.style.minWidth = '';
        }

        function hideSheetPickTip() {
            const tip = document.getElementById('sheetPickTip');
            if (!tip) return;
            tip.hidden = true;
            tip.textContent = '';
            tip.style.left = '';
            tip.style.top = '';
        }

        function showSheetPickTip(btn) {
            const hint = btn && btn.getAttribute('data-pick-hint');
            const tip = document.getElementById('sheetPickTip');
            const menu = document.getElementById('sheetPickMenu');
            if (!hint || !tip || !menu || menu.hidden) {
                hideSheetPickTip();
                return;
            }
            tip.textContent = hint;
            tip.hidden = false;
            const br = btn.getBoundingClientRect();
            const mr = menu.getBoundingClientRect();
            const tr = tip.getBoundingClientRect();
            let left = mr.right + 8;
            if (left + tr.width > window.innerWidth - 8) left = Math.max(8, mr.left - tr.width - 8);
            let top = br.top + (br.height - tr.height) / 2;
            top = Math.max(8, Math.min(top, window.innerHeight - tr.height - 8));
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }

        function closeSheetPick() {
            hideSheetPickTip();
            sheetPickOpen = '';
            sheetPickAnchor = null;
            const menu = document.getElementById('sheetPickMenu');
            document.querySelectorAll('.sheet-pick[aria-expanded="true"]').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
            });
            if (!menu || menu.hidden) return;
            clearTimeout(sheetPickCloseTimer);
            if (document.documentElement.classList.contains('reduce-motion')) {
                finishSheetPickClose(menu);
                return;
            }
            menu.classList.remove('is-in');
            menu.classList.add('is-out');
            const onEnd = function (event) {
                if (event.target !== menu) return;
                menu.removeEventListener('animationend', onEnd);
                finishSheetPickClose(menu);
            };
            menu.addEventListener('animationend', onEnd);
            sheetPickCloseTimer = setTimeout(function () {
                menu.removeEventListener('animationend', onEnd);
                finishSheetPickClose(menu);
            }, 200);
        }

        function placeSheetPick(btn) {
            const menu = document.getElementById('sheetPickMenu');
            if (!menu || !btn) return;
            const box = btn.closest('.case-offense') || btn;
            const r = box.getBoundingClientRect();
            const w = Math.max(r.width, 196);
            let left = r.left;
            if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
            if (left < 8) left = 8;
            const spaceBelow = window.innerHeight - r.bottom - 10;
            const spaceAbove = r.top - 10;
            const need = Math.min(menu.scrollHeight || 240, Math.min(window.innerHeight * 0.7, 420));
            const up = spaceBelow < Math.min(need, 240) && spaceAbove > spaceBelow;
            const room = Math.max(120, up ? spaceAbove : spaceBelow);
            menu.classList.toggle('is-up', up);
            menu.style.minWidth = w + 'px';
            menu.style.maxWidth = Math.min(280, window.innerWidth - 16) + 'px';
            menu.style.maxHeight = Math.min(room, window.innerHeight * 0.7, 420) + 'px';
            menu.style.left = left + 'px';
            if (up) {
                menu.style.top = 'auto';
                menu.style.bottom = (window.innerHeight - r.top + 6) + 'px';
            } else {
                menu.style.bottom = 'auto';
                menu.style.top = (r.bottom + 6) + 'px';
            }
        }

        function paintSheetPickButton(btn, kind, value) {
            if (!btn) return;
            btn.dataset.value = value || '';
            btn.classList.toggle('is-empty', !value);
            const lab = btn.querySelector('span');
            if (lab) lab.textContent = sheetPickLabel(kind, value);
        }

        function applySheetPick(kind, fieldId, value) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            if (kind === 'status') {
                profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                profile.case.status = value || 'open';
                paintSheetPickButton(document.getElementById('caseStatus'), 'status', profile.case.status);
                saveProfile();
                return;
            }
            if (kind === 'offense') {
                profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                profile.case.offense = value || '';
                const input = document.getElementById('caseOffense');
                if (input) input.value = profile.case.offense;
                paintSheetPickButton(document.getElementById('caseOffensePick'), 'offense', profile.case.offense);
                saveProfile();
                return;
            }
            if (!fieldId) return;
            patchFactMeta(fieldId, kind, value);
            const btn = document.querySelector('.sheet-pick[data-sheet-pick="' + kind + '"][data-sheet-meta="' + fieldId + '"]');
            paintSheetPickButton(btn, kind, value);
        }

        function openSheetPick(btn) {
            const kind = btn && btn.getAttribute('data-sheet-pick');
            const menu = document.getElementById('sheetPickMenu');
            const options = (typeof SHEET_PICKS !== 'undefined' && SHEET_PICKS[kind]) || [];
            if (!kind || !menu || !options.length) return;
            const key = kind + ':' + (btn.getAttribute('data-sheet-meta') || btn.id || '');
            if (sheetPickOpen === key) {
                closeSheetPick();
                return;
            }
            if (typeof closeSetPick === 'function') closeSetPick();
            if (typeof closePlatformMenu === 'function') closePlatformMenu();
            if (menu.parentElement !== document.body) document.body.appendChild(menu);
            sheetPickOpen = key;
            sheetPickAnchor = btn;
            const current = kind === 'offense'
                ? String((document.getElementById('caseOffense') || {}).value || '').trim()
                : (btn.getAttribute('data-value') || '');
            const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
            menu.innerHTML = options.map(function (item) {
                if (item.sep) return '<div class="set-pick-sep"></div>';
                const on = String(item.value || '').trim().toLowerCase() === current.toLowerCase();
                const active = on ? ' is-active' : '';
                const hint = item.hint ? ' data-pick-hint="' + escapeHtml(item.hint) + '"' : '';
                const aria = item.hint
                    ? ' aria-label="' + escapeHtml(item.label + '. ' + item.hint) + '"'
                    : '';
                return '<button type="button" role="option" class="' + active + '" data-pick-kind="' + kind + '" data-pick-field="' + escapeHtml(btn.getAttribute('data-sheet-meta') || '') + '" data-pick-value="' + escapeHtml(item.value) + '" aria-selected="' + (on ? 'true' : 'false') + '"' + hint + aria + '><span>' + escapeHtml(item.label) + '</span>' + check + '</button>';
            }).join('');
            clearTimeout(sheetPickCloseTimer);
            menu.classList.remove('is-out', 'is-in');
            menu.hidden = false;
            document.querySelectorAll('.sheet-pick[aria-expanded="true"]').forEach(function (el) {
                el.setAttribute('aria-expanded', 'false');
            });
            btn.setAttribute('aria-expanded', 'true');
            placeSheetPick(btn);
            void menu.offsetWidth;
            menu.classList.add('is-in');
        }

        const sheetPickMenu = document.getElementById('sheetPickMenu');
        if (sheetPickMenu) {
            sheetPickMenu.addEventListener('click', function (event) {
                const choice = event.target.closest('[data-pick-kind]');
                if (!choice) return;
                event.preventDefault();
                const kind = choice.getAttribute('data-pick-kind');
                const fieldId = choice.getAttribute('data-pick-field') || '';
                const value = choice.getAttribute('data-pick-value') || '';
                hideSheetPickTip();
                closeSheetPick();
                applySheetPick(kind, fieldId, value);
            });
            sheetPickMenu.addEventListener('mouseover', function (event) {
                const opt = event.target.closest('[data-pick-hint]');
                if (opt) showSheetPickTip(opt);
            });
            sheetPickMenu.addEventListener('mouseleave', hideSheetPickTip);
            sheetPickMenu.addEventListener('scroll', hideSheetPickTip);
            sheetPickMenu.addEventListener('focusin', function (event) {
                const opt = event.target.closest('[data-pick-hint]');
                if (opt) showSheetPickTip(opt);
            });
            sheetPickMenu.addEventListener('focusout', function (event) {
                if (!event.relatedTarget || !sheetPickMenu.contains(event.relatedTarget)) hideSheetPickTip();
            });
        }
        document.addEventListener('mousedown', function (event) {
            if (!sheetPickOpen) return;
            if (event.target.closest('.sheet-pick') || event.target.closest('#sheetPickMenu')) return;
            closeSheetPick();
        });
        window.addEventListener('resize', function () {
            if (sheetPickOpen && sheetPickAnchor) placeSheetPick(sheetPickAnchor);
        });

        let nameEditOriginal = '';
        const subjectName = document.getElementById('subjectName');
        const subjectEdit = document.getElementById('subjectEdit');
        const subjectNameInput = document.getElementById('subjectNameInput');
        const targetFace = document.getElementById('targetFace');
        const profilePhotoFile = document.getElementById('profilePhotoFile');

        function onNameEditClick(event) {
            event.preventDefault();
            event.stopPropagation();
            if (document.getElementById('subjectNameRow') && document.getElementById('subjectNameRow').classList.contains('editing')) return;
            nameEditOriginal = firstValue('name');
            beginNameEdit();
        }
        if (subjectEdit) subjectEdit.addEventListener('click', onNameEditClick);
        const subjectFind = document.getElementById('subjectFind');
        if (subjectFind) {
            subjectFind.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openSearchMenu('name', subjectFind);
            });
        }
        const idStackEl = document.getElementById('idStack');
        if (idStackEl) {
            idStackEl.addEventListener('click', (event) => {
                const mapsBtn = event.target.closest('[data-open-maps]');
                if (!mapsBtn) return;
                event.stopPropagation();
                if (mapsBtn.disabled || mapsBtn.getAttribute('aria-disabled') === 'true' || mapsBtn.getAttribute('href') === '#') {
                    event.preventDefault();
                    return;
                }
                if (mapsBtn.tagName === 'A' && mapsBtn.getAttribute('href')) return;
                event.preventDefault();
                openFieldMaps(mapsBtn.dataset.openMaps);
            });
        }
        if (subjectNameInput) {
            subjectNameInput.addEventListener('input', () => {
                writeLatestFact('name', subjectNameInput.value, extrasFromInput('name', subjectNameInput.value));
            });
            subjectNameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    endNameEdit(true);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    subjectNameInput.value = nameEditOriginal;
                    writeLatestFact('name', nameEditOriginal, extrasFromInput('name', nameEditOriginal));
                    endNameEdit(false);
                }
            });
            subjectNameInput.addEventListener('blur', () => {
                requestAnimationFrame(function () {
                    if (document.activeElement === subjectNameInput) return;
                    endNameEdit(true);
                });
            });
        }
        document.addEventListener('pointerdown', (event) => {
            const row = document.getElementById('subjectNameRow');
            if (!row || !row.classList.contains('editing')) return;
            if (event.target.closest('#subjectNameInput')) return;
            endNameEdit(true);
        }, true);
            if (targetFace && profilePhotoFile) {
            targetFace.addEventListener('click', (event) => {
                event.preventDefault();
                openPhotosSheet();
            });
            profilePhotoFile.addEventListener('change', () => {
                const files = takeInputFiles(profilePhotoFile);
                const target = photoUploadFor;
                photoUploadFor = '';
                if (!files.length) return;
                if (!target || target === (profileLibrary && profileLibrary.activeId)) {
                    applyProfilePhotoFiles(files);
                } else {
                    applyPhotoToProfile(target, files[0]);
                }
            });
        }
        const faceGallery = document.getElementById('faceGallery');
        if (faceGallery) {
            faceGallery.addEventListener('click', (event) => {
                const view = event.target.closest('[data-face-view]');
                if (view) {
                    event.preventDefault();
                    openPhotosSheet();
                }
            });
        }

        document.getElementById('dockReset').addEventListener('click', resetCase);
        const dockSettings = document.getElementById('dockSettings');
        if (dockSettings) dockSettings.addEventListener('click', function () {
            const sheet = document.getElementById('settingsSheet');
            if (sheet && !sheet.hidden) closeSettings();
            else openSettings();
        });
        const resetSheet = document.getElementById('resetConfirm');
        document.getElementById('resetCancel').addEventListener('click', closeResetConfirm);
        document.getElementById('resetConfirmBtn').addEventListener('click', applyResetCase);
        if (resetSheet) resetSheet.addEventListener('click', (event) => {
            if (event.target.id === 'resetConfirm') closeResetConfirm();
        });
        const bombSheet = document.getElementById('bombConfirm');
        const bombCancel = document.getElementById('bombCancel');
        const bombGo = document.getElementById('bombConfirmBtn');
        if (bombCancel) bombCancel.addEventListener('click', function () {
            closeBombConfirm();
            patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
            syncSettingsForm();
        });
        if (bombGo) bombGo.addEventListener('click', function () {
            closeBombConfirm();
            applyResetCase();
        });
        if (bombSheet) bombSheet.addEventListener('click', function (event) {
            if (event.target.id !== 'bombConfirm') return;
            closeBombConfirm();
            patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
            syncSettingsForm();
        });
        const settingsSheet = document.getElementById('settingsSheet');
        const settingsClose = document.getElementById('settingsClose');
        if (settingsClose) settingsClose.addEventListener('click', closeSettings);
        if (settingsSheet) settingsSheet.addEventListener('click', function (event) {
            if (event.target.id === 'settingsSheet') closeSettings();
        });
        const lockUnlock = document.getElementById('lockUnlock');
        if (lockUnlock) lockUnlock.addEventListener('click', function () {
            coverWorkspace(false);
            bumpIdleLock();
        });
        const settingToggles = {
            setLogicBomb: 'logicBomb',
            setCurtain: 'curtain',
            setConfirmOut: 'confirmOutbound',
            setStealth: 'stealthTab',
            setReduceMotion: 'reduceMotion',
            setHideTips: 'hideTips',
            setLargeType: 'largeType',
            setRememberPage: 'rememberPage',
            setHideBg: 'hideBackground',
            setShowGitHub: 'showGitHub',
            setShowDonate: 'showDonate',
            setExportNoPhotos: 'exportNoPhotos',
            setInvestigator: 'investigatorMode'
        };
        Object.keys(settingToggles).forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', function () {
                const patch = {};
                patch[settingToggles[id]] = !!el.checked;
                if (settingToggles[id] === 'logicBomb') patch.lastSeen = Date.now();
                patchSettings(patch);
                applyAppSettings(true);
                syncSettingsForm();
                if (settingToggles[id] === 'investigatorMode' && typeof renderProfile === 'function') renderProfile(true);
            });
        });
        document.querySelectorAll('[data-set-pick]').forEach(function (wrap) {
            const btn = wrap.querySelector('.set-pick-btn');
            if (!btn) return;
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                closeSheetPick();
                openSetPick(wrap.getAttribute('data-set-pick'), btn);
            });
        });
        const setPickMenu = document.getElementById('setPickMenu');
        if (setPickMenu) {
            setPickMenu.addEventListener('click', function (event) {
                const choice = event.target.closest('[data-set-value]');
                if (!choice || !setPickOpen) return;
                event.preventDefault();
                const id = setPickOpen;
                const value = choice.getAttribute('data-set-value');
                closeSetPick();
                applySetPick(id, value);
            });
        }
        document.addEventListener('mousedown', function (event) {
            if (!setPickOpen) return;
            if (event.target.closest('.set-pick') || event.target.closest('#setPickMenu')) return;
            closeSetPick();
        });
        const settingsBody = document.querySelector('.settings-body');
        if (settingsBody) settingsBody.addEventListener('scroll', closeSetPick, { passive: true });
        ['pointerdown', 'keydown', 'wheel'].forEach(function (name) {
            document.addEventListener(name, function () {
                if (document.getElementById('lockCurtain') && !document.getElementById('lockCurtain').hidden) return;
                bumpIdleLock();
            }, { passive: true });
        });
        document.addEventListener('visibilitychange', function () {
            applyStealthTitle();
            if (document.hidden) {
                touchSeen(true);
                bombPulseLow = false;
                return;
            }
            markSeen();
            bombPulseLow = false;
            bumpIdleLock();
            const settings = document.getElementById('settingsSheet');
            if (settings && !settings.hidden) updateBombCountdown();
        });
        window.addEventListener('pagehide', function () {
            touchSeen(true);
        });
        applyAppSettings();
        syncSettingsForm();
        document.getElementById('dockRecenter').addEventListener('click', recenterOrbit);
        const dockPlay = document.getElementById('dockPlay');
        if (dockPlay) dockPlay.addEventListener('click', replayIntro);
        document.getElementById('dockPlaytest').addEventListener('click', playtestFillVisibleFields);
        const dockAdd = document.getElementById('dockAdd');
        if (dockAdd) dockAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            closePhoneField();
            closePhoneMore();
            if (window.OrbINTCase && typeof OrbINTCase.dockAdd === 'function' && OrbINTCase.dockAdd()) return;
            openAddField();
        });
        const dockConnect = document.getElementById('dockConnect');
        if (dockConnect) dockConnect.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.OrbINTCase && typeof OrbINTCase.dockConnect === 'function') OrbINTCase.dockConnect();
        });
        document.getElementById('dockHelp').addEventListener('click', (event) => {
            event.stopPropagation();
            const guide = document.getElementById('helpGuide');
            if (guide && !guide.hidden) closeHelp();
            else openHelp();
        });
        const dockToolkit = document.getElementById('dockToolkit');
        if (dockToolkit) dockToolkit.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleToolkit();
        });
        document.getElementById('dockUndo').addEventListener('click', undoNow);
        document.getElementById('dockRedo').addEventListener('click', redoNow);
        window.addEventListener('orbint-history', updateHistoryButtons);
        document.getElementById('dockExport').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleExportMenu();
        });
        const dockImport = document.getElementById('dockImport');
        if (dockImport) dockImport.addEventListener('click', (event) => {
            event.stopPropagation();
            pickProfileUpload();
        });
        const dockReport = document.getElementById('dockReport');
        if (dockReport) dockReport.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.OrbINTCase) OrbINTCase.downloadReport();
        });
        document.getElementById('dockShare').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleShare();
        });
        document.getElementById('dockInstall').addEventListener('click', (event) => {
            event.stopPropagation();
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) closeInstall();
            else openInstall();
        });
        document.getElementById('phoneHelp').addEventListener('click', openHelp);
        document.getElementById('phoneAdd').addEventListener('click', () => {
            closePhoneField();
            closePhoneMore();
            if (window.OrbINTCase && typeof OrbINTCase.dockAdd === 'function' && OrbINTCase.dockAdd()) return;
            openAddField();
        });
        document.getElementById('phoneShare').addEventListener('click', () => {
            closePhoneField();
            closePhoneMore();
            openShare();
        });
        document.getElementById('phoneMoreBtn').addEventListener('click', () => {
            closePhoneField();
            showSheet(document.getElementById('phoneMore'));
        });
        const phoneMoreHelp = document.getElementById('phoneMoreHelp');
        if (phoneMoreHelp) phoneMoreHelp.addEventListener('click', () => { closePhoneMore(); openHelp(); });
        document.getElementById('phoneMoreClose').addEventListener('click', closePhoneMore);
        document.getElementById('phoneMore').addEventListener('click', (event) => {
            if (event.target.id === 'phoneMore') closePhoneMore();
        });
        document.getElementById('phoneUndo').addEventListener('click', () => { closePhoneMore(); undoNow(); });
        document.getElementById('phoneRedo').addEventListener('click', () => { closePhoneMore(); redoNow(); });
        const phonePlay = document.getElementById('phonePlay');
        if (phonePlay) phonePlay.addEventListener('click', () => { closePhoneMore(); replayIntro(); });
        const phonePlaytest = document.getElementById('phonePlaytest');
        if (phonePlaytest) phonePlaytest.addEventListener('click', () => { closePhoneMore(); playtestFillVisibleFields(); });
        const phoneToolkit = document.getElementById('phoneToolkit');
        if (phoneToolkit) phoneToolkit.addEventListener('click', () => { closePhoneMore(); openToolkit(); });
        document.getElementById('phoneExport').addEventListener('click', () => { closePhoneMore(); toggleExportMenu(); });
        const phoneImport = document.getElementById('phoneImport');
        if (phoneImport) phoneImport.addEventListener('click', () => { closePhoneMore(); pickProfileUpload(); });
        const phoneReport = document.getElementById('phoneReport');
        if (phoneReport) phoneReport.addEventListener('click', () => {
            closePhoneMore();
            if (window.OrbINTCase) OrbINTCase.downloadReport();
        });
        const phoneInstall = document.getElementById('phoneInstall');
        if (phoneInstall) phoneInstall.addEventListener('click', () => { closePhoneMore(); openInstall(); });
        const phoneSettings = document.getElementById('phoneSettings');
        if (phoneSettings) phoneSettings.addEventListener('click', () => { closePhoneMore(); openSettings(); });
        document.getElementById('phoneReset').addEventListener('click', () => { closePhoneMore(); resetCase(); });
        document.getElementById('phoneFieldDone').addEventListener('click', () => {
            writePhoneField();
            closePhoneField();
            renderProfile();
        });
        document.getElementById('phoneField').addEventListener('click', (event) => {
            if (event.target.id === 'phoneField') {
                writePhoneField();
                closePhoneField();
                renderProfile();
            }
        });
        document.getElementById('phoneFieldInput').addEventListener('input', () => {
            writePhoneField();
            syncPhoneFindIcon();
            renderPhoneLeads(phoneFieldId);
        });
        document.getElementById('phonePlatformBtn').addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const trigger = node && node.querySelector('.platform-trigger');
            if (trigger) trigger.click();
        });
        document.getElementById('phoneTzBtn').addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const trigger = node && node.querySelector('.tz-trigger');
            if (trigger) trigger.click();
        });
        const phoneCcBtn = document.getElementById('phoneCcBtn');
        if (phoneCcBtn) phoneCcBtn.addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            if (node) openCountryCodeMenu(node);
        });
        const phoneFieldSearch = document.getElementById('phoneFieldSearch');
        if (phoneFieldSearch) phoneFieldSearch.addEventListener('click', () => {
            writePhoneField();
            if (phoneFieldId) openSearchMenu(phoneFieldId);
        });
        document.getElementById('phoneLeads').addEventListener('click', (event) => {
            const browse = event.target.closest('[data-open-toolkit]');
            if (browse) {
                event.stopPropagation();
                openToolkit(browse.dataset.openToolkit || phoneFieldId);
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            openLead(option.dataset.openLead, fieldInputValue(phoneFieldId), option.dataset.leadMode);
        });
        document.getElementById('phoneFieldUpload').addEventListener('click', () => {
            if (fieldBase(phoneFieldId) === 'image') {
                openPhotosSheet();
                return;
            }
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const file = node && node.querySelector('input[type="file"]');
            if (file) file.click();
        });
        document.getElementById('phoneFieldClear').addEventListener('click', () => {
            const editor = document.getElementById('phoneFieldInput');
            if (editor) editor.value = '';
            writePhoneField();
            if (phoneFieldId) clearField(phoneFieldId);
            syncPhoneField();
            renderProfile();
        });
        document.getElementById('phoneReveal').addEventListener('click', () => {
            toggleSecretReveal(phoneFieldId);
        });
        const phoneMaps = document.getElementById('phoneMaps');
        if (phoneMaps) phoneMaps.addEventListener('click', () => {
            openFieldMaps(phoneFieldId);
        });
        document.getElementById('shareClose').addEventListener('click', closeShare);
        document.getElementById('shareSheet').addEventListener('click', (event) => {
            if (event.target.id === 'shareSheet') closeShare();
        });
        document.getElementById('shareCopy').addEventListener('click', copyShareLink);
        const shareSessionLive = document.getElementById('shareSessionLive');
        if (shareSessionLive) {
            shareSessionLive.addEventListener('change', function () {
                if (!window.OrbINTShare || typeof OrbINTShare.setLive !== 'function') return;
                const on = !!shareSessionLive.checked;
                const err = document.getElementById('shareCollabError');
                shareSessionLive.disabled = true;
                OrbINTShare.setLive(on).then(function () {
                    if (err) { err.hidden = true; err.textContent = ''; }
                }).catch(function (error) {
                    if (err) {
                        err.hidden = false;
                        err.textContent = String(error && error.message || error);
                    }
                    shareSessionLive.checked = !on;
                }).then(function () {
                    shareSessionLive.disabled = false;
                    if (window.OrbINTShare) OrbINTShare.paint();
                });
            });
        }
        const shareCopyView = document.getElementById('shareCopyView');
        if (shareCopyView) shareCopyView.addEventListener('click', function () {
            const el = document.getElementById('shareViewUrl');
            if (el && /^https?:/i.test(el.textContent)) OrbINTShare.copy(el.textContent);
        });
        ['setShareApi', 'setCollabWs'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const key = id === 'setShareApi' ? 'shareApiUrl' : 'collabWsUrl';
            el.addEventListener('change', function () {
                patchSettings({ [key]: el.value.trim() });
                if (window.OrbINTShare) OrbINTShare.paint();
            });
        });
        document.getElementById('shareNative').addEventListener('click', nativeShareSite);
        const installSheet = document.getElementById('installSheet');
        const installClose = document.getElementById('installClose');
        const installDismiss = document.getElementById('installDismiss');
        const installGo = document.getElementById('installGo');
        if (installClose) installClose.addEventListener('click', closeInstall);
        if (installDismiss) installDismiss.addEventListener('click', closeInstall);
        if (installGo) installGo.addEventListener('click', confirmInstall);
        if (installSheet) installSheet.addEventListener('click', (event) => {
            if (event.target.id === 'installSheet') closeInstall();
        });
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredInstallPrompt = event;
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) fillInstallSheet();
        });
        window.addEventListener('appinstalled', () => {
            deferredInstallPrompt = null;
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) fillInstallSheet();
        });
        if (navigator.serviceWorker) {
            navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
        }
        document.getElementById('hubAdd').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleAddField();
        });
        const dossierAdd = document.getElementById('dossierAdd');
        if (dossierAdd) {
            dossierAdd.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleAddField();
            });
        }
        const peerHubs = document.getElementById('peerHubs');
        if (peerHubs) {
            peerHubs.addEventListener('pointerdown', (event) => {
                if (event.button === 1) return;
                if (event.button !== 0) return;
                const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]') || event.target.closest('.peer-hub, [data-peer]');
                if (!peerEl) return;
                const body = peerBodyFromEl(peerEl);
                if (!body) return;
                event.preventDefault();
                event.stopPropagation();
                beginOrbitDrag(event, 'peer', body);
            }, true);
            peerHubs.addEventListener('contextmenu', (event) => {
                const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]') || event.target.closest('.peer-hub, [data-peer]');
                const peerId = peerIdFromEl(peerEl);
                if (!peerId) return;
                event.preventDefault();
                event.stopPropagation();
                openPeerMenu(event, peerId);
            }, true);
            peerHubs.addEventListener('error', (event) => {
                const img = event.target.closest('.peer-hub-face');
                const btn = event.target.closest('.peer-hub');
                if (!img || !btn) return;
                img.remove();
                if (!btn.querySelector('.peer-hub-letter')) {
                    const letter = document.createElement('span');
                    letter.className = 'peer-hub-letter';
                    letter.textContent = profileLetter(btn.getAttribute('title') || 'U');
                    btn.insertBefore(letter, btn.firstChild);
                }
            }, true);
        }
        document.getElementById('addClose').addEventListener('click', closeAddField);
        document.getElementById('addSheet').addEventListener('click', (event) => {
            if (event.target.id === 'addSheet') closeAddField();
            const pick = event.target.closest('[data-add-field]');
            if (!pick) return;
            event.stopPropagation();
            addOrbitField(pick.dataset.addField);
        });
        document.getElementById('addSheet').addEventListener('wheel', (event) => {
            const row = event.target.closest('.add-chips');
            if (!row || row.scrollWidth <= row.clientWidth + 1) return;
            event.preventDefault();
            row.scrollLeft += event.deltaY + event.deltaX;
        }, { passive: false });
        document.getElementById('addPresetFilter').addEventListener('input', renderAddPanel);
        document.getElementById('addCustomForm').addEventListener('submit', (event) => {
            event.preventDefault();
            addCustomField(
                document.getElementById('addCustomLabel').value,
                document.getElementById('addCustomHint').value
            );
        });
        const toolkitClose = document.getElementById('toolkitClose');
        const toolkitSheet = document.getElementById('toolkitSheet');
        const toolkitFilter = document.getElementById('toolkitFilter');
        const toolkitList = document.getElementById('toolkitList');
        const toolkitFocusClear = document.getElementById('toolkitFocusClear');
        if (toolkitClose) toolkitClose.addEventListener('click', closeToolkit);
        if (toolkitSheet) toolkitSheet.addEventListener('click', (event) => {
            if (event.target.id === 'toolkitSheet') closeToolkit();
        });
        if (toolkitFilter) toolkitFilter.addEventListener('input', renderToolkit);
        if (toolkitFocusClear) toolkitFocusClear.addEventListener('click', () => {
            toolkitFocusField = '';
            toolkitOpenCats.clear();
            if (toolkitFilter) {
                toolkitFilter.placeholder = 'Search categories or tools';
            }
            renderToolkit();
            if (toolkitFilter) toolkitFilter.focus();
        });
        if (toolkitList) toolkitList.addEventListener('click', (event) => {
            const toggle = event.target.closest('[data-toolkit-toggle]');
            if (toggle) {
                event.stopPropagation();
                const tools = toggle.nextElementSibling;
                const key = toggle.getAttribute('data-toolkit-toggle') || '';
                const open = toggle.getAttribute('aria-expanded') !== 'true';
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (tools) tools.hidden = !open;
                if (key) {
                    if (open) toolkitOpenCats.add(key);
                    else toolkitOpenCats.delete(key);
                }
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            openLead(option.dataset.openLead, fieldInputValue(toolkitFocusField), option.dataset.leadMode);
        });

        const profileToggle = document.getElementById('profileToggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', function () {
                setPanelOpen(!profilePanel.classList.contains('open'));
            });
        }
        document.getElementById('profileClose').addEventListener('click', () => setPanelOpen(false));
        const pageSwitchNav = document.getElementById('pageSwitch');
        if (pageSwitchNav) {
            pageSwitchNav.addEventListener('click', function (event) {
                const btn = event.target.closest('[data-page]');
                if (btn && btn.getAttribute('data-page') !== 'casebook' && isPhone() && profilePanel.classList.contains('open')) {
                    setPanelOpen(false);
                }
            });
        }
        const dockPortfolio = document.getElementById('dockPortfolio');
        if (dockPortfolio) {
            dockPortfolio.addEventListener('click', () => {
                setPanelOpen(!profilePanel.classList.contains('open'));
            });
        }
        const dockMore = document.getElementById('dockMore');
        if (dockMore) {
            dockMore.addEventListener('click', () => {
                closePhoneField();
                showSheet(document.getElementById('phoneMore'));
            });
        }
        backdrop.addEventListener('click', () => setPanelOpen(false));
        const profileRailList = document.getElementById('profileRailList');
        if (profileRailList) {
            profileRailList.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-profile]');
                if (!btn) return;
                const id = btn.dataset.profile;
                const peer = document.querySelector('.peer-hub[data-peer="' + id + '"]');
                if (peer) openLinkedProfile(id, peer);
                else switchProfile(id);
            });
            profileRailList.addEventListener('contextmenu', (event) => {
                const btn = event.target.closest('[data-profile]');
                if (!btn) return;
                event.preventDefault();
                openProfileMenu(event, btn.dataset.profile);
            });
            profileRailList.addEventListener('error', (event) => {
                const img = event.target.closest('img');
                const btn = event.target.closest('.profile-rail-item');
                if (!img || !btn) return;
                const letter = escapeHtml(profileLetter(btn.getAttribute('title') || 'U'));
                const linked = linkedProfileIds(btn.dataset.profile).length > 0;
                btn.innerHTML = '<span class="profile-rail-face"><span>' + letter + '</span></span>' + (linked ? PROFILE_LINK_BADGE : '');
            }, true);
        }
        document.getElementById('profileNew').addEventListener('click', () => createProfile(''));
        document.getElementById('profileUpload').addEventListener('click', pickProfileUpload);
        document.getElementById('profileRename').addEventListener('click', () => openProfilePrompt('rename'));
        document.getElementById('profileFile').addEventListener('change', (event) => {
            uploadProfileFiles(event.target.files);
            event.target.value = '';
        });
        document.getElementById('profilePromptCancel').addEventListener('click', closeProfilePrompt);
        document.getElementById('profilePromptGo').addEventListener('click', submitProfilePrompt);
        document.getElementById('profilePromptInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitProfilePrompt();
            }
        });
        const profilePromptSheet = document.getElementById('profilePrompt');
        if (profilePromptSheet) profilePromptSheet.addEventListener('click', (event) => {
            if (event.target.id === 'profilePrompt') closeProfilePrompt();
        });
        document.getElementById('profileMenu').addEventListener('click', (event) => {
            const button = event.target.closest('[data-profile-act]');
            if (!button || button.disabled) return;
            event.stopPropagation();
            const act = button.dataset.profileAct;
            const id = document.getElementById('profileMenu').dataset.profile;
            closeProfileMenu();
            if (act === 'open') {
                const peer = document.querySelector('.peer-hub[data-peer="' + id + '"]');
                if (peer) openLinkedProfile(id, peer);
                else switchProfile(id);
            }
            else if (act === 'rename') openProfilePrompt('rename', id);
            else if (act === 'duplicate') duplicateProfile(id);
            else if (act === 'download') downloadProfile(id);
            else if (act === 'delete') openProfilePrompt('delete', id);
        });
        document.addEventListener('keydown', (event) => {
            const key = (event.key || '').toLowerCase();
            const promptOpen = profilePromptSheet && !profilePromptSheet.hidden;
            if (promptOpen && (event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y')) return;
            const typing = event.target && event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"]');
            const undoKey = (event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y');
            if (typing) {
                const pg = document.body.getAttribute('data-page');
                if (!undoKey || (pg !== 'timeline' && pg !== 'whiteboard')) return;
            }
            if (event.code === 'Space' || event.key === ' ') {
                event.preventDefault();
                document.body.classList.add('is-space-pan');
            }
            if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
                event.preventDefault();
                undoNow();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && (key === 'y' || (key === 'z' && event.shiftKey))) {
                event.preventDefault();
                redoNow();
                return;
            }
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !promptOpen) {
                const viewer = document.getElementById('mediaViewer');
                if (viewer && !viewer.hidden && mediaGallery.items.length > 1) {
                    event.preventDefault();
                    stepMediaGallery(event.key === 'ArrowRight' ? 1 : -1);
                    return;
                }
            }
            if (event.key === 'Escape') {
                if (promptOpen) {
                    closeProfilePrompt();
                    return;
                }
                const profileMenu = document.getElementById('profileMenu');
                if (profileMenu && !profileMenu.hidden) {
                    closeProfileMenu();
                    return;
                }
                const phoneField = document.getElementById('phoneField');
                if (phoneField && !phoneField.hidden) {
                    closePhoneField();
                    return;
                }
                const phoneMore = document.getElementById('phoneMore');
                if (phoneMore && !phoneMore.hidden) {
                    closePhoneMore();
                    return;
                }
                const lock = document.getElementById('lockCurtain');
                if (lock && !lock.hidden) {
                    coverWorkspace(false);
                    bumpIdleLock();
                    return;
                }
                const bomb = document.getElementById('bombConfirm');
                if (bomb && !bomb.hidden) {
                    closeBombConfirm();
                    patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
                    syncSettingsForm();
                    return;
                }
                if (setPickOpen) {
                    closeSetPick();
                    return;
                }
                const settings = document.getElementById('settingsSheet');
                if (settings && !settings.hidden) {
                    closeSettings();
                    return;
                }
                const reset = document.getElementById('resetConfirm');
                if (reset && !reset.hidden) {
                    closeResetConfirm();
                    return;
                }
                const help = document.getElementById('helpGuide');
                if (help && !help.hidden) {
                    closeHelp();
                    return;
                }
                const share = document.getElementById('shareSheet');
                if (share && !share.hidden) {
                    closeShare();
                    return;
                }
                const install = document.getElementById('installSheet');
                if (install && !install.hidden) {
                    closeInstall();
                    return;
                }
                const photos = document.getElementById('photosSheet');
                if (photos && !photos.hidden) {
                    closePhotosSheet();
                    return;
                }
                if (window.OrbINTCase && typeof OrbINTCase.closeOverlays === 'function') {
                    const meta = document.getElementById('metaSheet');
                    const intel = document.getElementById('intelSheet');
                    const eventSheet = document.getElementById('eventSheet');
                    const reverse = document.getElementById('reverseMenu');
                    if ((meta && !meta.hidden) || (intel && !intel.hidden) || (eventSheet && !eventSheet.hidden) || (reverse && !reverse.hidden)) {
                        OrbINTCase.closeOverlays();
                        return;
                    }
                }
                const add = document.getElementById('addSheet');
                if (add && !add.hidden) {
                    closeAddField();
                    return;
                }
                const toolkit = document.getElementById('toolkitSheet');
                if (toolkit && !toolkit.hidden) {
                    closeToolkit();
                    return;
                }
                const viewer = document.getElementById('mediaViewer');
                if (viewer && !viewer.hidden) {
                    closeMediaViewer();
                    return;
                }
                setPanelOpen(false);
                closePlatformMenu();
                closeSearchMenu();
                closeExportMenu();
                closeFieldMenu();
            }
        });

        document.addEventListener('keyup', function (event) {
            if (event.code === 'Space' || event.key === ' ') document.body.classList.remove('is-space-pan');
        });
        window.addEventListener('blur', function () {
            document.body.classList.remove('is-space-pan');
        });
        document.addEventListener('dragstart', function (event) {
            if (event.target && event.target.closest && event.target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
        });
        document.addEventListener('mousedown', function (event) {
            if (event.button !== 1) return;
            if (event.target && event.target.closest && event.target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
        }, true);

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
            if (orbit.dragging || orbit.pinching) return;
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
                if (orbit.dragging || orbit.pinching) return;
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
                const size = PEER_HUB_SIZE * zoom;
                body.el.style.left = (body.x - size / 2) + 'px';
                body.el.style.top = (body.y - size / 2) + 'px';
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

        const ccMenuEl = document.getElementById('ccMenu');
        if (ccMenuEl) ccMenuEl.addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-cc]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('ccMenu').dataset.field;
            applyCountryCodePick(fieldId, option.dataset.pickCc);
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('#platformMenu, .platform-trigger, .platform-icon, #phonePlatformBtn, [data-sheet-platform], .node.menu-open:not(.tz-open):not(.cc-open)')) {
                closePlatformMenu();
            }
            if (!event.target.closest('#tzMenu, .tz-trigger, .tz-pick, .tz-abbr, #phoneTzBtn, .node.tz-open')) {
                closeTimezoneMenu();
            }
            if (!event.target.closest('#ccMenu, .cc-trigger, .cc-pick, .cc-abbr, .cc-name, #phoneCcBtn, .node.cc-open')) {
                closeCountryCodeMenu();
            }
            if (!event.target.closest('#searchMenu, [data-search], #phoneFieldSearch')) {
                closeSearchMenu();
            }
            if (!event.target.closest('#exportMenu, #dockExport, #phoneExport')) {
                closeExportMenu();
            }
            if (!fieldMenuGuard && !event.target.closest('#fieldMenu, .node-more')) {
                closeFieldMenu();
            }
            if (!event.target.closest('#profileMenu, .profile-rail-item')) {
                closeProfileMenu();
            }
        });

        document.addEventListener('pointerdown', (event) => {
            if (fieldMenuGuard) return;
            if (event.target.closest('#fieldMenu, .node-more')) return;
            closeFieldMenu();
        }, true);

        document.getElementById('fieldMenu').addEventListener('pointerdown', onFieldMenuAct);
        document.getElementById('fieldMenu').addEventListener('click', onFieldMenuAct);

        function onFieldMenuAct(event) {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            event.preventDefault();
            event.stopPropagation();
            const menu = document.getElementById('fieldMenu');
            const act = button.dataset.fieldAct;
            const fieldId = menu ? menu.dataset.field : '';
            const extra = button.dataset.linkId || (menu && menu.dataset.peer) || '';
            if (!act) return;
            if (menu && menu.dataset.actLock === act + ':' + extra) return;
            if (menu) menu.dataset.actLock = act + ':' + extra;
            closeFieldMenu();
            runFieldAction(act, fieldId, extra);
        }

        function orbitHitEl(event, selector) {
            const stage = document.getElementById('mapStage');
            if (!event || !selector || !stage) return null;
            const fromTarget = event.target && event.target.closest && event.target.closest(selector);
            if (fromTarget && stage.contains(fromTarget)) return fromTarget;
            let stack = [];
            try { stack = document.elementsFromPoint(event.clientX, event.clientY) || []; } catch (err) { stack = []; }
            for (let i = 0; i < stack.length; i++) {
                const node = stack[i];
                if (!node || !node.closest) continue;
                const el = node.closest(selector);
                if (el && stage.contains(el)) return el;
            }
            return null;
        }

        function peerIdFromEl(el) {
            if (!el) return '';
            return el.getAttribute('data-peer') || '';
        }

        if (mapStage) mapStage.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#fieldMenu, #searchMenu, #platformMenu, #tzMenu, #ccMenu, #exportMenu, #profileMenu, .profile-rail, .media-viewer, .help-guide, .share-sheet, .install-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            const peer = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            const peerId = peerIdFromEl(peer);
            if (peerId) {
                event.preventDefault();
                event.stopPropagation();
                openPeerMenu(event, peerId);
                return;
            }
            const node = orbitHitEl(event, '.node');
            if (node) {
                event.preventDefault();
                openFieldMenu(event, node);
                return;
            }
            if (orbitHitEl(event, '#hubAdd')) {
                event.preventDefault();
                toggleAddField();
                return;
            }
            if (orbitHitEl(event, '#hub')) {
                event.preventDefault();
                openHubMenu(event);
                return;
            }
            if (event.target.closest('.map-toggle, .casebook-btn, #workNav, .donate, .dock')) return;
            event.preventDefault();
            openMapMenu(event);
        });

        document.getElementById('helpClose').addEventListener('click', closeHelp);
        document.getElementById('helpGuide').addEventListener('click', (event) => {
            if (event.target.id === 'helpGuide') closeHelp();
        });
        const photosSheet = document.getElementById('photosSheet');
        const photosClose = document.getElementById('photosClose');
        const photosAdd = document.getElementById('photosAdd');
        const photosList = document.getElementById('photosList');
        const photosFile = document.getElementById('photosFile');
        if (photosClose) photosClose.addEventListener('click', closePhotosSheet);
        if (photosAdd) photosAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target && event.target.id === 'photosFile') return;
            if (photosFile) photosFile.click();
        });
        if (photosFile) photosFile.addEventListener('change', () => {
            const files = takeInputFiles(photosFile);
            if (files.length) applyProfilePhotoFiles(files);
        });
        const photosUrlForm = document.getElementById('photosUrlForm');
        const photosUrl = document.getElementById('photosUrl');
        if (photosUrlForm) {
            photosUrlForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (applyProfilePhotoUrl(photosUrl && photosUrl.value)) {
                    if (photosUrl) photosUrl.value = '';
                }
            });
        }
        if (photosList) {
            photosList.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-photo-act]');
                if (!btn) return;
                const card = btn.closest('[data-photos-index]');
                const items = imageGalleryItems();
                const item = items[Number(card && card.dataset.photosIndex)];
                if (!item) return;
                event.preventDefault();
                event.stopPropagation();
                const act = btn.dataset.photoAct;
                if (act === 'open') openPhotoInTab(item);
                else if (act === 'download') downloadPhotoItem(item);
                else if (act === 'copy' || act === 'copy-image') copyPhotoItem(item, btn);
                else if (act === 'search') {
                    if (window.OrbINTCase && typeof OrbINTCase.reverseSearchPhoto === 'function') {
                        OrbINTCase.reverseSearchPhoto(item, btn);
                    } else {
                        searchPhotoItem(item);
                    }
                } else if (act === 'meta') {
                    if (window.OrbINTCase && typeof OrbINTCase.showPhotoMeta === 'function') {
                        OrbINTCase.showPhotoMeta(item);
                    }
                }
                else if (act === 'left') reorderPhotoItem(item.index, -1);
                else if (act === 'right') reorderPhotoItem(item.index, 1);
                else if (act === 'face') promotePhotoItem(item);
                else if (act === 'delete') deletePhotoItem(item);
            });
            photosList.addEventListener('wheel', (event) => {
                if (!photosList.scrollWidth || photosList.scrollWidth <= photosList.clientWidth + 4) return;
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                event.preventDefault();
                photosList.scrollLeft += event.deltaY;
            }, { passive: false });
        }
        if (photosSheet) {
            photosSheet.addEventListener('click', (event) => {
                if (event.target.id === 'photosSheet') closePhotosSheet();
            });
            ['dragenter', 'dragover'].forEach((type) => {
                photosSheet.addEventListener(type, (event) => {
                    event.preventDefault();
                    photosSheet.classList.add('is-drop');
                });
            });
            photosSheet.addEventListener('dragleave', (event) => {
                if (event.target === photosSheet || event.target.id === 'photosStage') photosSheet.classList.remove('is-drop');
            });
            photosSheet.addEventListener('drop', (event) => {
                event.preventDefault();
                photosSheet.classList.remove('is-drop');
                const files = event.dataTransfer && event.dataTransfer.files;
                if (files && files.length) applyProfilePhotoFiles(files);
            });
            photosSheet.addEventListener('paste', (event) => {
                const clip = event.clipboardData;
                if (!clip) return;
                const files = Array.from(clip.files || []).filter(isImageFile);
                if (files.length) {
                    event.preventDefault();
                    applyProfilePhotoFiles(files);
                    return;
                }
                if (event.target && event.target.id === 'photosUrl') return;
                const text = String(clip.getData('text') || '').trim();
                if (text && applyProfilePhotoUrl(text)) event.preventDefault();
            });
        }
        document.getElementById('mediaClose').addEventListener('click', closeMediaViewer);
        const mediaPrev = document.getElementById('mediaPrev');
        const mediaNext = document.getElementById('mediaNext');
        if (mediaPrev) mediaPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(-1);
        });
        if (mediaNext) mediaNext.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(1);
        });
        document.getElementById('mediaViewer').addEventListener('click', (event) => {
            if (event.target.id === 'mediaViewer') closeMediaViewer();
        });
        document.getElementById('mediaViewer').addEventListener('wheel', (event) => {
            const viewer = document.getElementById('mediaViewer');
            if (!viewer || viewer.hidden || mediaGallery.items.length < 2) return;
            if (Math.abs(event.deltaY) < 2 && Math.abs(event.deltaX) < 2) return;
            event.preventDefault();
            stepMediaGallery((event.deltaY + event.deltaX) > 0 ? 1 : -1);
        }, { passive: false });

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
            const freezeWorld = !!orbit.dragging || !!orbit.pinching
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingField = orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'peer');
            if (!reduceMotion && !isPhone() && !orbit.pinching && !holdingField) {
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
