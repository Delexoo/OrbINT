/* Orbit motion, spokes, and node positions */
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

        function fitLinkLayer(svg, width, height) {
            if (!svg || !width || !height) return;
            const box = '0 0 ' + width + ' ' + height;
            if (svg.getAttribute('viewBox') !== box) {
                svg.setAttribute('preserveAspectRatio', 'none');
                svg.setAttribute('viewBox', box);
            }
        }

        function applyOrbit(dt) {
            applyMapGrid();
            if (linkLayer) {
                const liveW = linkLayer.clientWidth;
                const liveH = linkLayer.clientHeight;
                if (liveW > 20 && liveH > 20 && (Math.abs(liveW - (canvasBox.width || 0)) > 1 || Math.abs(liveH - (canvasBox.height || 0)) > 1)) {
                    const rect = linkLayer.getBoundingClientRect();
                    canvasBox = { left: rect.left, top: rect.top, width: liveW, height: liveH };
                }
            }
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height) return;
            fitLinkLayer(linkLayer, width, height);
            fitLinkLayer(document.getElementById('peerLinkLayer'), width, height);

            const viewPan = (orbit.dragging && orbit.dragMode === 'pan')
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingField = orbit.dragging && orbit.dragMode === 'node';
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

