/* Timeline camera, card layout, stems */


    const TL_AXIS_Y = 480;
    const TL_ORIGIN_X = 88;
    const TL_STAGE_W = 8000;
    const TL_STAGE_H = 2400;
    const TL_CARD_W = 272;
    const TL_CARD_MIN_W = 160;
    const TL_CARD_MAX_W = 2400;
    const TL_CARD_MIN_H = 86;
    const TL_CARD_MAX_H = 2400;
    const TL_GAP = 280;
    const TL_STEM = 64;
    const TL_AXIS_CLEAR = TL_STEM;
    const TL_MIN_DX = TL_CARD_W + 40;
    const TL_CTRL = 'button, input, textarea, [contenteditable="true"], [data-tl-info], [data-tl-cal], [data-tl-time], [data-tl-mini], [data-tl-fold], [data-tl-drop], [data-del-event], [data-connect-event], [data-tl-photo], [data-tl-add], [data-tl-expand], .tl-acts, .tl-attach, .tl-media, .tl-thumb, .tl-bit-btn';
    let tlAimX = 220;
    let tlNodeObs = null;
    let tlStemRedraw = 0;
    let tlStemTrack = 0;

    function tlHitFromPoint(x, y, selector) {
        if (typeof document.elementsFromPoint !== 'function') return null;
        const stack = document.elementsFromPoint(x, y) || [];
        const sel = selector || TL_CTRL;
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (!el || !el.closest) continue;
            if (el.closest('.tl-rs, .cal-pop, #timelineMenu, #timelineIsland')) {
                if (el.closest('.cal-pop')) {
                    const hit = el.closest(sel);
                    if (hit) return hit;
                }
                continue;
            }
            const hit = el.closest(sel);
            if (hit) return hit;
        }
        return null;
    }

    function tlCardW(ev) {
        const n = Number(ev && ev.w);
        if (n >= TL_CARD_MIN_W) return Math.min(TL_CARD_MAX_W, n);
        return TL_CARD_W;
    }

    function tlCardH(ev) {
        const n = Number(ev && ev.h);
        if (n >= TL_CARD_MIN_H) return Math.min(TL_CARD_MAX_H, n);
        return 0;
    }

    function tlNodeH(el, ev) {
        const card = el && el.querySelector('.tl-card');
        return Math.max(
            (card && card.offsetHeight) || 0,
            (el && el.offsetHeight) || 0,
            tlCardH(ev) || 0,
            86
        );
    }

    function tlNaturalH(el) {
        if (!el) return 86;
        const card = el.querySelector('.tl-card');
        const sized = el.classList.contains('is-sized');
        if (!sized) {
            return Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        }
        const extra = el.querySelector('.tl-extra-inner');
        const clipped = (extra && extra.scrollHeight > extra.clientHeight + 1) ||
            (card && card.scrollHeight > card.clientHeight + 1);
        if (!clipped) {
            return Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        }
        const prev = el.style.height;
        el.classList.remove('is-sized');
        el.style.height = 'auto';
        const h = Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        el.style.height = prev;
        el.classList.add('is-sized');
        return h;
    }

    function tlFitNodeHeight(el, ev) {
        if (!el || !ev || ev.mini) return tlNodeH(el, ev);
        const natural = tlNaturalH(el);
        const locked = tlCardH(ev);
        if (locked) {
            if (natural > locked + 1) {
                ev.h = Math.min(TL_CARD_MAX_H, natural);
                el.style.height = ev.h + 'px';
                el.classList.add('is-sized');
                return ev.h;
            }
            return Math.max(locked, tlNodeH(el, ev));
        }
        return natural;
    }

    function tlFacingSide(top, h, stored) {
        const bottom = top + h;
        if (top >= TL_AXIS_Y - 8) return 1;
        if (bottom <= TL_AXIS_Y + 8) return -1;
        if (stored === 1 || stored === -1) return stored;
        return (top + h / 2) >= TL_AXIS_Y ? 1 : -1;
    }

    function tlPlantTop(side, h, freeTop, free) {
        const natural = side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
        if (!free || !isFinite(freeTop)) return natural;
        return tlKeepClearOfAxis(side, freeTop, h);
    }

    function placeTlCard(el, rec) {
        if (!el || !rec) return;
        const w = tlCardW(rec);
        const h = tlCardH(rec);
        el.style.width = w + 'px';
        el.style.left = ((Number(rec.pinX) || 0) - w / 2) + 'px';
        el.style.top = (Number(rec.pinY) || 0) + 'px';
        if (h && !rec.mini) {
            el.style.height = h + 'px';
            el.classList.add('is-sized');
        } else {
            el.style.height = '';
            if (h) el.classList.add('is-sized');
            else el.classList.remove('is-sized');
        }
    }

    function tlResizeCursor(handle) {
        if (handle === 'e' || handle === 'w') return 'ew-resize';
        if (handle === 'n' || handle === 's') return 'ns-resize';
        if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
        return 'nwse-resize';
    }

    function applyTlResize(rec, drag, dx, dy) {
        if (!rec || !drag) return;
        let handle = drag.handle || 'se';
        if (rec.mini) handle = handle.replace(/[ns]/g, '');
        if (!handle) return;
        const ow = drag.ow;
        const oh = drag.oh;
        const right = drag.ox - ow / 2 + ow;
        const bottom = drag.oy + oh;
        let w = ow;
        let h = oh;
        if (handle.indexOf('e') !== -1) w = ow + dx;
        if (handle.indexOf('w') !== -1) w = ow - dx;
        if (handle.indexOf('s') !== -1) h = oh + dy;
        if (handle.indexOf('n') !== -1) h = oh - dy;
        w = Math.round(Math.max(TL_CARD_MIN_W, Math.min(TL_CARD_MAX_W, w)));
        h = Math.round(Math.max(TL_CARD_MIN_H, Math.min(TL_CARD_MAX_H, h)));
        let left = drag.ox - ow / 2;
        let top = drag.oy;
        if (handle.indexOf('w') !== -1) left = right - w;
        if (handle.indexOf('n') !== -1) top = bottom - h;
        rec.w = w;
        rec.pinX = clampTimelineX(left + w / 2);
        rec.pinned = true;
        rec.free = true;
        if (!rec.mini) {
            rec.h = h;
            rec.pinY = top;
            rec.side = (rec.pinY + h / 2) >= TL_AXIS_Y ? 1 : -1;
        }
    }

    function clampTimelineX(x) {
        const n = Number(x);
        if (!isFinite(n)) return TL_ORIGIN_X;
        return Math.max(TL_ORIGIN_X, Math.min(TL_STAGE_W - 160, n));
    }

    function timelineCam() {
        if (!data.timelineView || typeof data.timelineView !== 'object') data.timelineView = { x: 48, y: 40, z: 1 };
        if (!(data.timelineView.z > 0)) data.timelineView.z = 1;
        return data.timelineView;
    }

    let tlCamAnim = 0;
    let tlCamAim = null;

    function timelineCamClose(a, b) {
        return !!a && !!b && Math.abs(a.x - b.x) < 0.6 && Math.abs(a.y - b.y) < 0.6 && Math.abs((a.z || 1) - (b.z || 1)) < 0.004;
    }

    function stopTimelineCamAnim() {
        if (tlCamAnim) cancelAnimationFrame(tlCamAnim);
        tlCamAnim = 0;
        tlCamAim = null;
    }

    function easeTimelineCam(target) {
        const cam = timelineCam();
        const to = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
            z: target.z > 0 ? target.z : 1
        };
        if (tlCamAnim && timelineCamClose(tlCamAim, to)) return;
        const from = { x: cam.x, y: cam.y, z: cam.z || 1 };
        if (timelineCamClose(from, to) || reduceMotion()) {
            stopTimelineCamAnim();
            cam.x = to.x;
            cam.y = to.y;
            cam.z = to.z;
            applyTimelineCam();
            drawTimelineAxis();
            return;
        }
        stopTimelineCamAnim();
        tlCamAim = to;
        const t0 = performance.now();
        const ms = 500;
        function frame(now) {
            const t = Math.min(1, (now - t0) / ms);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            cam.x = from.x + (to.x - from.x) * e;
            cam.y = from.y + (to.y - from.y) * e;
            cam.z = from.z + (to.z - from.z) * e;
            applyTimelineCam();
            if (t < 1) {
                tlCamAnim = requestAnimationFrame(frame);
                return;
            }
            cam.x = to.x;
            cam.y = to.y;
            cam.z = to.z;
            tlCamAnim = 0;
            tlCamAim = null;
            applyTimelineCam();
            drawTimelineAxis();
            schedulePersist();
        }
        tlCamAnim = requestAnimationFrame(frame);
    }

    function applyTimelineCam() {
        const stage = $('timelineStage');
        const cam = timelineCam();
        if (stage) stage.style.transform = 'translate(' + cam.x + 'px,' + cam.y + 'px) scale(' + cam.z + ')';
        const label = $('timelineZoomLabel');
        if (label) label.textContent = Math.round(cam.z * 100) + '%';
        const btn = $('timelineConnectBtn');
        if (btn) btn.classList.toggle('is-on', timelineConnectOn);
        const view = $('timelineView');
        if (view) view.classList.toggle('is-connect', timelineConnectOn);
        syncDock();
        syncTimelineIsland();
    }

    function hideTimelineIsland(instant) {
        const island = $('timelineIsland');
        if (!island) return;
        const alreadyOut = island.classList.contains('is-out') && !island.classList.contains('is-on');
        if (alreadyOut && !instant) return;
        island.classList.remove('is-on', 'is-connect');
        island.classList.add('is-out');
        island.setAttribute('aria-hidden', 'true');
        clearTimeout(tlIslandHide);
        if (instant || reduceMotion()) return;
    }

    function syncTimelineIsland() {
        const island = $('timelineIsland');
        const label = $('timelineIslandText');
        const hint = $('timelineHint');
        if (hint) {
            hint.hidden = true;
            hint.textContent = '';
        }
        if (!island) return;
        const connecting = !!timelineConnectOn;
        const empty = !(data.timeline && data.timeline.length);
        if (!connecting && !empty) {
            hideTimelineIsland();
            return;
        }
        clearTimeout(tlIslandHide);
        const text = connecting
            ? (connectFrom ? 'Click the second card to connect them.' : 'Click two cards to connect them.')
            : 'Click the number line to add a card';
        if (label) label.textContent = text;
        island.classList.toggle('is-connect', connecting);
        island.hidden = false;
        island.removeAttribute('hidden');
        island.setAttribute('aria-hidden', 'false');
        if (island.classList.contains('is-on') && !island.classList.contains('is-out')) return;
        island.classList.remove('is-on');
        island.classList.add('is-out');
        void island.offsetWidth;
        requestAnimationFrame(function () {
            island.classList.remove('is-out');
            island.classList.add('is-on');
        });
    }

    function relatedIds(ev) {
        const ids = {};
        (ev.links || []).forEach(function (link) { if (link && link.to) ids[link.to] = true; });
        (data.timeline || []).forEach(function (other) {
            (other.links || []).forEach(function (link) {
                if (link.to === ev.id) ids[other.id] = true;
            });
        });
        return Object.keys(ids);
    }

    function formatDayLabel(date) {
        if (!date) return 'Undated';
        const parts = String(date).split('-');
        if (parts.length !== 3) return date;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = months[Number(parts[1]) - 1] || parts[1];
        return parts[2] + ' ' + m + ' ' + parts[0];
    }

    function eventStamp(ev) {
        if (!ev || !ev.date) return 0;
        const t = Date.parse(String(ev.date) + 'T' + (ev.time || '00:00:00'));
        return isNaN(t) ? 0 : t;
    }

    function layoutTimelineEvents() {
        const events = numberedTimeline();
        const dated = events.filter(function (ev) { return ev.date && !ev.pinned; });
        const loose = events.filter(function (ev) { return !ev.date && !ev.pinned; });
        let min = Infinity;
        let max = -Infinity;
        dated.forEach(function (ev) {
            const t = eventStamp(ev);
            if (t < min) min = t;
            if (t > max) max = t;
        });
        if (!isFinite(min)) { min = 0; max = 1; }
        if (min === max) max = min + 86400000;
        const span = Math.max(dated.length * TL_GAP, 720);
        dated.forEach(function (ev, i) {
            const u = (eventStamp(ev) - min) / (max - min);
            ev.pinX = 180 + u * span;
            if (ev.side !== 1 && ev.side !== -1) ev.side = i % 2 === 0 ? -1 : 1;
        });
        loose.forEach(function (ev, i) {
            ev.pinX = 180 + span + 80 + i * TL_GAP;
            if (ev.side !== 1 && ev.side !== -1) ev.side = (dated.length + i) % 2 === 0 ? -1 : 1;
        });
        events.forEach(function (ev) {
            ev.pinX = clampTimelineX(ev.pinX);
            if (ev.side !== 1 && ev.side !== -1) ev.side = -1;
        });
        return events;
    }

    function tlKeepClearOfAxis(side, top, h) {
        if (side === 1) return Math.max(top, TL_AXIS_Y + TL_AXIS_CLEAR);
        const maxBottom = TL_AXIS_Y - TL_AXIS_CLEAR;
        if (top + h > maxBottom) return maxBottom - h;
        return top;
    }

    function stackTimelineStems(preferId) {
        const list = $('timelineList');
        if (!list) return;
        const GAP = 16;
        const OVERLAP = 8;
        const items = (data.timeline || []).map(function (ev) {
            const el = list.querySelector('[data-event="' + ev.id + '"]');
            if (!el || el.classList.contains('is-out') || el.classList.contains('is-moving') || el.classList.contains('is-resizing')) return null;
            const h = tlFitNodeHeight(el, ev);
            const w = el.offsetWidth || tlCardW(ev);
            const left = parseFloat(el.style.left);
            const top = parseFloat(el.style.top);
            return {
                ev: ev,
                el: el,
                h: h,
                left: isFinite(left) ? left : (Number(ev.pinX) || 0) - w / 2,
                right: (isFinite(left) ? left : (Number(ev.pinX) || 0) - w / 2) + w,
                top0: isFinite(top) ? top : (Number(ev.pinY) || 0)
            };
        }).filter(Boolean);
        items.forEach(function (item) {
            item.side = tlFacingSide(item.top0, item.h, item.ev.side);
        });
        [-1, 1].forEach(function (side) {
            const group = items.filter(function (item) { return item.side === side; }).sort(function (a, b) {
                if (preferId) {
                    if (a.ev.id === preferId) return 1;
                    if (b.ev.id === preferId) return -1;
                }
                const ca = String(a.ev.createdAt || '');
                const cb = String(b.ev.createdAt || '');
                if (ca !== cb) return ca < cb ? -1 : 1;
                return a.left - b.left;
            });
            const placed = [];
            group.forEach(function (item) {
                let top = item.ev.locked && isFinite(item.top0)
                    ? item.top0
                    : tlPlantTop(side, item.h, item.top0, !!(item.ev.free && isFinite(item.top0)));
                if (!item.ev.locked) top = tlKeepClearOfAxis(side, top, item.h);
                if (!item.ev.locked) {
                    let guard = 0;
                    while (guard++ < 64) {
                        const box = { left: item.left, right: item.right, top: top, bottom: top + item.h };
                        let bump = 0;
                        placed.forEach(function (p) {
                            const ox = box.left < p.right - OVERLAP && p.left < box.right - OVERLAP;
                            const oy = box.top < p.bottom + GAP && p.top < box.bottom + GAP;
                            if (!ox || !oy) return;
                            if (side === 1) bump = Math.max(bump, p.bottom + GAP - box.top);
                            else bump = Math.max(bump, box.bottom + GAP - p.top);
                        });
                        if (bump <= 0) break;
                        top += side === 1 ? bump : -bump;
                    }
                }
                item.ev.pinY = top;
                item.ev.side = side;
                item.el.style.top = top + 'px';
                item.el.setAttribute('data-side', side === 1 ? '1' : '-1');
                placed.push({ left: item.left, right: item.right, top: top, bottom: top + item.h });
            });
        });
    }

    function axisEnd() {
        let maxX = 2480;
        (data.timeline || []).forEach(function (ev) {
            maxX = Math.max(maxX, (Number(ev.pinX) || 0) + 420);
        });
        return Math.min(TL_STAGE_W - 80, maxX);
    }

    function timelineWorldAt(clientX, clientY) {
        const view = $('timelineView');
        const cam = timelineCam();
        if (!view) return { x: 0, y: 0, cam: cam };
        const rect = view.getBoundingClientRect();
        return {
            x: (clientX - rect.left - cam.x) / (cam.z || 1),
            y: (clientY - rect.top - cam.y) / (cam.z || 1),
            cam: cam
        };
    }

    function nearTlAxis(world) {
        const cam = (world && world.cam) || timelineCam();
        const slop = 28 / (cam.z || 1);
        const x0 = TL_ORIGIN_X;
        const x1 = axisEnd() + 160;
        return world.x >= x0 && world.x <= x1 && Math.abs(world.y - TL_AXIS_Y) <= slop;
    }

    function hideTlFollow() {
        const follow = $('timelineFollow');
        const view = $('timelineView');
        if (follow) follow.hidden = true;
        if (view) view.classList.remove('is-aim');
    }

    function updateTlFollow(world, overNode) {
        const follow = $('timelineFollow');
        const view = $('timelineView');
        if (!follow || !view) return;
        if (overNode || !nearTlAxis(world)) {
            hideTlFollow();
            return;
        }
        tlAimX = Math.max(TL_ORIGIN_X, world.x);
        follow.hidden = false;
        follow.style.left = tlAimX + 'px';
        follow.style.top = TL_AXIS_Y + 'px';
        view.classList.add('is-aim');
    }

    function cardTop(ev, height) {
        if (ev && ev.pinY != null && isFinite(Number(ev.pinY))) return Number(ev.pinY);
        const h = height || 168;
        return ev.side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
    }

