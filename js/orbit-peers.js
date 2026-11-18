/* Linked profile hubs on the orbit */
        function peerFaceSrc(entry) {
            return compactFaceFrom(entry && entry.facts) || DEFAULT_FACE;
        }

        function renderPeerHubs() {
            const layer = document.getElementById('peerHubs');
            const lines = document.getElementById('peerLinkLayer');
            if (!layer) return;
            const ids = linkedProfileIds();
            const rows = ids.map((id) => {
                const entry = profileLibrary.items[id];
                const name = displayProfileName(entry);
                const face = compactFaceFrom(entry && entry.facts);
                return { id: id, name: name, face: face, stamp: id + ':' + name + ':' + (face ? 'I' + faceStamp(face) : 'L') };
            });
            const stamp = rows.map((row) => row.stamp).join('|');
            if (layer.dataset.stamp === stamp && peerBodies.length === ids.length) {
                peerBodies.forEach((body) => {
                    const el = layer.querySelector('.peer-hub[data-peer="' + body.id + '"]');
                    if (!el) return;
                    body.el = el;
                    releasePeerChildLayout(el);
                });
                return;
            }
            layer.dataset.stamp = stamp;
            layer.innerHTML = rows.map((row) => {
                const mark = row.face
                    ? '<img class="peer-hub-face" alt="" width="92" height="92" data-peer-face="' + escapeHtml(row.id) + '">'
                    : '<span class="peer-hub-letter">' + escapeHtml(profileLetter(row.name)) + '</span>';
                return '<div class="peer-hub" data-peer="' + escapeHtml(row.id) + '" title="' + escapeHtml(row.name) + '" role="button" tabindex="0" aria-label="' + escapeHtml(row.name) + '">' +
                    mark +
                    '<span class="peer-hub-name">' + escapeHtml(row.name) + '</span>' +
                    '</div>';
            }).join('');
            rows.forEach((row) => {
                if (!row.face) return;
                const img = layer.querySelector('img[data-peer-face="' + row.id + '"]');
                if (img) img.src = row.face;
            });
            if (lines) {
                const size = canvasSize();
                lines.setAttribute('viewBox', '0 0 ' + size.width + ' ' + size.height);
                lines.innerHTML = ids.map((id) => '<line data-peer-line="' + escapeHtml(id) + '"></line>').join('');
            }
            syncPeerBodies();
            positionPeerHubs();
        }

        function releasePeerChildLayout(hubEl) {
            if (!hubEl) return;
            const kids = hubEl.querySelectorAll('.peer-hub-name, .peer-hub-letter, .peer-hub-face');
            for (let i = 0; i < kids.length; i++) {
                const child = kids[i];
                if (!child.style.left && !child.style.top && !child.style.transform) continue;
                child.style.left = '';
                child.style.top = '';
                child.style.transform = '';
            }
        }

        function bindPeerBodies() {
            if (!peerBodies.length) return;
            const layer = document.getElementById('peerHubs');
            const byId = new Map();
            peerBodies.forEach((body) => {
                if (!body || !body.id || byId.has(body.id)) return;
                byId.set(body.id, body);
            });
            const next = Array.from(byId.values());
            next.forEach((body) => {
                const hubEl = layer && layer.querySelector('.peer-hub[data-peer="' + body.id + '"]');
                if (!hubEl) return;
                body.el = hubEl;
                releasePeerChildLayout(hubEl);
            });
            if (next.length !== peerBodies.length) peerBodies = next;
            if (orbit.dragMode === 'peer' && orbit.dragItem && orbit.dragItem.id) {
                const live = peerBodies.find((body) => body.id === orbit.dragItem.id);
                if (live) orbit.dragItem = live;
            }
        }

        function syncPeerBodies() {
            const layer = document.getElementById('peerHubs');
            const els = layer ? Array.from(layer.querySelectorAll('.peer-hub[data-peer]')) : [];
            const prev = new Map();
            peerBodies.forEach((body) => {
                if (body && body.id && !prev.has(body.id)) prev.set(body.id, body);
            });
            const seen = new Set();
            peerBodies = [];
            els.forEach((el) => {
                const id = el.dataset.peer;
                if (!id || seen.has(id)) return;
                seen.add(id);
                releasePeerChildLayout(el);
                const old = prev.get(id);
                if (old) {
                    old.el = el;
                    old.w = PEER_HUB_SIZE;
                    old.h = PEER_HUB_SIZE;
                    peerBodies.push(old);
                    return;
                }
                peerBodies.push({
                    id: id,
                    el: el,
                    x: null,
                    y: null,
                    vx: 0,
                    vy: 0,
                    tx: 0,
                    ty: 0,
                    w: PEER_HUB_SIZE,
                    h: PEER_HUB_SIZE,
                    sw: PEER_HUB_SIZE,
                    sh: PEER_HUB_SIZE
                });
            });
            if (orbit.dragMode === 'peer' && orbit.dragItem && orbit.dragItem.id) {
                const live = peerBodies.find((body) => body.id === orbit.dragItem.id);
                if (live) orbit.dragItem = live;
            }
        }

        function peerBodyFromEl(el) {
            const hubEl = el && (el.classList && el.classList.contains('peer-hub') ? el : (el.closest && el.closest('.peer-hub')));
            if (!hubEl || !hubEl.dataset.peer) return null;
            let body = peerBodies.find((entry) => entry.id === hubEl.dataset.peer);
            if (body) {
                body.el = hubEl;
                return body;
            }
            body = {
                id: hubEl.dataset.peer,
                el: hubEl,
                x: null,
                y: null,
                vx: 0,
                vy: 0,
                tx: 0,
                ty: 0,
                w: PEER_HUB_SIZE,
                h: PEER_HUB_SIZE,
                sw: PEER_HUB_SIZE,
                sh: PEER_HUB_SIZE
            };
            peerBodies.push(body);
            return body;
        }

        function hubPeerClearance() {
            return (hub && hub.offsetWidth || 220) / 2 + PEER_HUB_SIZE / 2 + 20;
        }

        function peerPeerClearance() {
            return PEER_HUB_SIZE + 18;
        }

        function pushOutOfCircle(x, y, cx, cy, minDist) {
            let dx = x - cx;
            let dy = y - cy;
            let dist = Math.hypot(dx, dy);
            if (dist < 0.0001) {
                dx = 1;
                dy = 0;
                dist = 1;
            }
            if (dist >= minDist) return { x: x, y: y, hit: false };
            const scale = minDist / dist;
            return { x: cx + dx * scale, y: cy + dy * scale, hit: true };
        }

        function otherPeerWorlds(ignoreId) {
            const pts = [];
            (typeof linkedProfileIds === 'function' ? linkedProfileIds() : []).forEach((id) => {
                if (!id || id === ignoreId) return;
                const home = peerHomeFor(id);
                if (home) pts.push({ id: id, x: home.x, y: home.y });
            });
            peerBodies.forEach((body) => {
                if (!body || body.id === ignoreId || body.x == null) return;
                if (pts.some((pt) => pt.id === body.id)) return;
                const hubPt = typeof hubScreenPoint === 'function' ? hubScreenPoint() : { x: 0, y: 0 };
                const zoom = Math.max(orbit.zoom || 1, 0.01);
                pts.push({
                    id: body.id,
                    x: (body.x - hubPt.x) / zoom,
                    y: (body.y - hubPt.y) / zoom
                });
            });
            return pts;
        }

        function unclipPeerWorld(x, y, ignoreId) {
            let px = Number.isFinite(x) ? x : 0;
            let py = Number.isFinite(y) ? y : 0;
            const hubMin = hubPeerClearance();
            const peerMin = peerPeerClearance();
            const others = otherPeerWorlds(ignoreId);
            for (let iter = 0; iter < 18; iter++) {
                let hits = 0;
                const hubPush = pushOutOfCircle(px, py, 0, 0, hubMin);
                if (hubPush.hit) {
                    px = hubPush.x;
                    py = hubPush.y;
                    hits++;
                }
                others.forEach((other) => {
                    const dx = px - other.x;
                    const dy = py - other.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist < 0.0001) dist = 0.0001;
                    if (dist >= peerMin) return;
                    const scale = peerMin / dist;
                    px = other.x + dx * scale;
                    py = other.y + dy * scale;
                    hits++;
                });
                if (!hits) break;
            }
            return { x: px, y: py };
        }

        let peerHomeFixTimer = 0;
        function schedulePeerHomeFix() {
            clearTimeout(peerHomeFixTimer);
            peerHomeFixTimer = setTimeout(function () {
                if (typeof persistPeerHomes === 'function') persistPeerHomes();
            }, 280);
        }

        function phonePeerOnScreen(sx, sy) {
            const size = canvasSize();
            const insets = orbitViewInsets();
            const pad = 36;
            return sx >= insets.left + pad &&
                sx <= size.width - insets.right - pad &&
                sy >= insets.top + pad &&
                sy <= size.height - insets.bottom - pad;
        }

        function computePeerTargets(hx, hy, zoom) {
            const z = Math.max(zoom || 1, 0.01);
            const phone = typeof isPhone === 'function' && isPhone();
            const worldRing = hubPeerClearance() + (phone ? 28 : 48);
            let far = worldRing;
            if (!phone && orbitItems.length) {
                const reach = Math.max.apply(null, orbitItems.map((item) => {
                    if (item.x == null || item.y == null) return 0;
                    return (Math.hypot(item.x - hx, item.y - hy) + Math.max(item.sw || item.w || 0, item.sh || item.h || 0) / 2) / z;
                }));
                if (reach) far = Math.max(far, reach + 64);
            }
            const unplaced = [];
            peerBodies.forEach((body) => {
                body.sw = PEER_HUB_SIZE * z;
                body.sh = PEER_HUB_SIZE * z;
                const home = peerHomeFor(body.id);
                if (home) {
                    let wx = home.x;
                    let wy = home.y;
                    if (phone && !phonePeerOnScreen(hx + wx * z, hy + wy * z)) {
                        const ang = (wx === 0 && wy === 0) ? -Math.PI / 2 : Math.atan2(wy, wx);
                        const parked = unclipPeerWorld(Math.cos(ang) * worldRing, Math.sin(ang) * worldRing, body.id);
                        wx = parked.x;
                        wy = parked.y;
                    } else if (!phone) {
                        const clear = unclipPeerWorld(home.x, home.y, body.id);
                        if (Math.hypot(clear.x - home.x, clear.y - home.y) > 1.5) {
                            peerHomes[body.id] = { x: clear.x, y: clear.y };
                            schedulePeerHomeFix();
                        }
                        wx = clear.x;
                        wy = clear.y;
                    }
                    body.tx = hx + wx * z;
                    body.ty = hy + wy * z;
                    return;
                }
                unplaced.push(body);
            });
            unplaced.forEach((body, i) => {
                const angle = -Math.PI / 2 + (i / Math.max(unplaced.length, 1)) * Math.PI * 2;
                const clear = unclipPeerWorld(Math.cos(angle) * far, Math.sin(angle) * far, body.id);
                body.tx = hx + clear.x * z;
                body.ty = hy + clear.y * z;
            });
        }

        function resolveLinkedProfileCollisions(hx, hy, zoom, peerGrab) {
            if (!peerBodies.length) return;
            const z = Math.max(zoom || 1, 0.01);
            const hubMin = hubPeerClearance();
            const peerMin = peerPeerClearance();
            const pts = peerBodies.map((body) => {
                const sx = body.x == null ? body.tx : body.x;
                const sy = body.y == null ? body.ty : body.y;
                return {
                    body: body,
                    grabbed: !!(peerGrab && body.id === peerGrab.id),
                    x: (sx - hx) / z,
                    y: (sy - hy) / z
                };
            });
            for (let iter = 0; iter < 16; iter++) {
                let hits = 0;
                pts.forEach((pt) => {
                    const pushed = pushOutOfCircle(pt.x, pt.y, 0, 0, hubMin);
                    if (!pushed.hit) return;
                    pt.x = pushed.x;
                    pt.y = pushed.y;
                    hits++;
                });
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const a = pts[i];
                        const b = pts[j];
                        let dx = a.x - b.x;
                        let dy = a.y - b.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist < 0.0001) {
                            dx = 1;
                            dy = 0;
                            dist = 1;
                        }
                        if (dist >= peerMin) continue;
                        const overlap = peerMin - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        if (a.grabbed && !b.grabbed) {
                            b.x -= nx * overlap;
                            b.y -= ny * overlap;
                        } else if (b.grabbed && !a.grabbed) {
                            a.x += nx * overlap;
                            a.y += ny * overlap;
                        } else {
                            a.x += nx * overlap * 0.5;
                            a.y += ny * overlap * 0.5;
                            b.x -= nx * overlap * 0.5;
                            b.y -= ny * overlap * 0.5;
                        }
                        hits++;
                    }
                }
                if (!hits) break;
            }
            pts.forEach((pt) => {
                pt.body.x = hx + pt.x * z;
                pt.body.y = hy + pt.y * z;
                if (pt.grabbed) {
                    orbit.grabX = pt.body.x;
                    orbit.grabY = pt.body.y;
                    return;
                }
                pt.body.vx = 0;
                pt.body.vy = 0;
            });
        }

        function paintPeerHubs(hx, hy, zoom) {
            const lines = document.getElementById('peerLinkLayer');
            const size = canvasSize();
            if (lines) lines.setAttribute('viewBox', '0 0 ' + size.width + ' ' + size.height);
            bindPeerBodies();
            peerBodies.forEach((body) => {
                if (!body.el || !body.el.classList.contains('peer-hub')) return;
                const x = body.x == null ? body.tx : body.x;
                const y = body.y == null ? body.ty : body.y;
                body.el.style.left = x + 'px';
                body.el.style.top = y + 'px';
                body.el.style.transform = 'translate(-50%, -50%) scale(' + zoom + ')';
                const line = lines && lines.querySelector('[data-peer-line="' + body.id + '"]');
                if (!line) return;
                const rest = Math.max(Math.hypot(body.tx - hx, body.ty - hy), 8);
                const stretch = Math.hypot(x - hx, y - hy) / rest;
                line.setAttribute('x1', hx);
                line.setAttribute('y1', hy);
                line.setAttribute('x2', x);
                line.setAttribute('y2', y);
                line.setAttribute('stroke-width', stretch > 1.12 ? '2.2' : '1.6');
            });
        }

        function positionPeerHubs() {
            const layer = document.getElementById('peerHubs');
            const lines = document.getElementById('peerLinkLayer');
            bindPeerBodies();
            if (!layer || !hub) return;
            if (!peerBodies.length) {
                if (lines) lines.innerHTML = '';
                return;
            }
            const zoom = orbit.zoom || 1;
            const hubPt = hubScreenPoint();
            computePeerTargets(hubPt.x, hubPt.y, zoom);
            const snap = orbit.snapLayout || reduceMotion;
            peerBodies.forEach((body) => {
                if (snap || body.x == null || body.y == null) {
                    body.x = body.tx;
                    body.y = body.ty;
                    body.vx = 0;
                    body.vy = 0;
                }
            });
            resolveLinkedProfileCollisions(hubPt.x, hubPt.y, zoom, null);
            paintPeerHubs(hubPt.x, hubPt.y, zoom);
        }

        function commitPeerHome(body) {
            if (!body || !body.id) return;
            const hubPt = hubScreenPoint();
            const zoom = Math.max(orbit.zoom || 1, 0.01);
            resolveLinkedProfileCollisions(hubPt.x, hubPt.y, zoom, null);
            const clear = unclipPeerWorld((body.x - hubPt.x) / zoom, (body.y - hubPt.y) / zoom, body.id);
            body.x = hubPt.x + clear.x * zoom;
            body.y = hubPt.y + clear.y * zoom;
            peerHomes[body.id] = { x: clear.x, y: clear.y };
            persistPeerHomes();
            const mine = profileLibrary && profileLibrary.activeId;
            const other = profileLibrary && profileLibrary.items[body.id];
            if (mine && other) {
                other.peerHomes = other.peerHomes || {};
                other.peerHomes[mine] = { x: -clear.x, y: -clear.y };
                saveProfileEntry(other);
            }
        }

        function applyPeerPhysics(dt, hx, hy, zoom, step, rigidView, tug, nodeGrab, hubGrab, peerGrab, hvx, hvy) {
            bindPeerBodies();
            if (!peerBodies.length) return;
            computePeerTargets(hx, hy, zoom);
            const posMs = reduceMotion || orbit.snapLayout || rigidView ? 1 : (nodeGrab || peerGrab ? 520 : 420);
            peerBodies.forEach((body) => {
                const grabbed = peerGrab && body.id === peerGrab.id;
                if (grabbed) {
                    body.x = orbit.grabX;
                    body.y = orbit.grabY;
                    body.vx = 0;
                    body.vy = 0;
                    return;
                }
                if (body.x == null) body.x = body.tx;
                if (body.y == null) body.y = body.ty;
                if (!tug) {
                    if (rigidView || posMs <= 1) {
                        body.x = body.tx;
                        body.y = body.ty;
                        body.vx = 0;
                        body.vy = 0;
                        body.sxv = 0;
                        body.syv = 0;
                        return;
                    }
                    const fromX = body.x;
                    const fromY = body.y;
                    const nx = smoothDamp(fromX, body.tx, body.sxv || 0, dt, posMs);
                    const ny = smoothDamp(fromY, body.ty, body.syv || 0, dt, posMs);
                    body.x = nx.value;
                    body.y = ny.value;
                    body.sxv = nx.vel;
                    body.syv = ny.vel;
                    body.vx = 0;
                    body.vy = 0;
                    return;
                }
                if (hubGrab) {
                    body.x += hvx * 0.38;
                    body.y += hvy * 0.38;
                }
                const kHome = hubGrab ? 0.055 : (nodeGrab || peerGrab ? 0.07 : 0.14);
                const damp = hubGrab || nodeGrab || peerGrab ? 0.9 : 0.84;
                body.vx = (body.vx || 0) + (body.tx - body.x) * kHome * step;
                body.vy = (body.vy || 0) + (body.ty - body.y) * kHome * step;
                if (peerGrab && peerGrab !== body && peerGrab.x != null) {
                    const bx = body.x - peerGrab.x;
                    const by = body.y - peerGrab.y;
                    const gap = Math.hypot(bx, by);
                    const minGap = ((body.sw || body.w) + (peerGrab.sw || peerGrab.w || 0)) / 2 + 16;
                    if (gap > 0.001 && gap < minGap) {
                        const push = (minGap - gap) * 0.04 * step;
                        body.vx += (bx / gap) * push;
                        body.vy += (by / gap) * push;
                    }
                }
                peerBodies.forEach((other) => {
                    if (other === body || (peerGrab && other.id === peerGrab.id) || other.x == null) return;
                    const bx = body.x - other.x;
                    const by = body.y - other.y;
                    const gap = Math.hypot(bx, by);
                    const minGap = ((body.sw || body.w) + (other.sw || other.w || 0)) / 2 + 18;
                    if (gap > 0.001 && gap < minGap) {
                        const push = (minGap - gap) * 0.04 * step;
                        body.vx += (bx / gap) * push;
                        body.vy += (by / gap) * push;
                    }
                });
                const rest = Math.max(Math.hypot(body.tx - hx, body.ty - hy), 10);
                const ldx = body.x - hx;
                const ldy = body.y - hy;
                const cur = Math.hypot(ldx, ldy);
                if (cur > rest + 6) {
                    const stretch = cur - rest;
                    const kLink = hubGrab || nodeGrab || peerGrab ? 0.16 : 0.11;
                    body.vx -= (ldx / cur) * stretch * kLink * step;
                    body.vy -= (ldy / cur) * stretch * kLink * step;
                }
                body.vx *= Math.pow(damp, step);
                body.vy *= Math.pow(damp, step);
                body.x += body.vx * step;
                body.y += body.vy * step;
                if (!hubGrab && !nodeGrab && !peerGrab && Math.hypot(body.x - body.tx, body.y - body.ty) < 0.45 && Math.hypot(body.vx, body.vy) < 0.2) {
                    body.x = body.tx;
                    body.y = body.ty;
                    body.vx = 0;
                    body.vy = 0;
                }
            });
            resolveLinkedProfileCollisions(hx, hy, zoom, peerGrab);
            paintPeerHubs(hx, hy, zoom);
        }

        function renderLeads(fieldId) {
            const field = FIELDS.find((item) => item.id === fieldId);
            const leadsList = document.getElementById('leadsList');
            const leadsSection = document.getElementById('leadsSection');
            const cautionSection = document.getElementById('cautionSection');
            const value = field ? firstValue(field.id) : '';

            leadsList.innerHTML = '';
            leadsSection.hidden = true;
            cautionSection.hidden = true;
        }

