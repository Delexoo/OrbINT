/* Orbit oval packing */
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

