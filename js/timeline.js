/* Timeline page */


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

    const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const CAL_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const CAL_DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function calPad(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function calIso(y, m, d) {
        return y + '-' + calPad(m + 1) + '-' + calPad(d);
    }

    function parseCalIso(value) {
        const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
        if (!hit) return null;
        const y = Number(hit[1]);
        const m = Number(hit[2]) - 1;
        const d = Number(hit[3]);
        if (!y || m < 0 || m > 11 || d < 1 || d > 31) return null;
        return { y: y, m: m, d: d };
    }

    function parseCalAny(value) {
        const exact = parseCalIso(value);
        if (exact) return exact;
        const d = new Date(value);
        if (!Number.isFinite(d.getTime())) return null;
        return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
    }

    function stampFromIso(iso) {
        const d = iso ? new Date(iso) : null;
        if (!d || !Number.isFinite(d.getTime())) return null;
        return {
            date: calIso(d.getFullYear(), d.getMonth(), d.getDate()),
            h: d.getHours(),
            m: d.getMinutes()
        };
    }

    function isoFromStamp(dateIso, h, m) {
        const parsed = parseCalIso(dateIso);
        if (!parsed) return '';
        const dt = new Date(parsed.y, parsed.m, parsed.d, ((h % 24) + 24) % 24, ((m % 60) + 60) % 60, 0, 0);
        return dt.toISOString();
    }

    function readFactStamp(factId) {
        return (host && host.getFactCaptured && host.getFactCaptured(factId)) || '';
    }

    function writeFactStamp(factId, iso) {
        if (host && host.setFactCaptured) host.setFactCaptured(factId, iso || '');
    }

    function factStampLocked() {
        return !!(host && host.readonly && host.readonly());
    }

    function calNavSvg(dir) {
        return dir === 'prev'
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 9 12l5.5 6"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6 15 12l-5.5 6"/></svg>';
    }

    function syncEventDateBtn() {
        const btn = $('eventDateBtn');
        const field = $('eventDate');
        if (!btn || !field) return;
        const value = field.value;
        btn.classList.toggle('is-empty', !value);
        btn.innerHTML = esc(value ? formatDayLabel(value) : 'Date') +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/></svg>';
    }

    function closeCalendar() {
        const pop = $('calPop');
        if (calState && calState.anchor) calState.anchor.setAttribute('aria-expanded', 'false');
        calState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeCalendar() {
        const pop = $('calPop');
        if (!pop || pop.hidden || !calState || !calState.anchor) return;
        const r = calState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 292;
        const h = pop.offsetHeight || 320;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function paintCalendar() {
        const pop = $('calPop');
        if (!pop || !calState) return;
        const now = new Date();
        const todayIso = calIso(now.getFullYear(), now.getMonth(), now.getDate());
        const sel = parseCalIso(calState.value);
        const y = calState.y;
        const m = calState.m;
        const mode = calState.mode || 'days';
        let title = CAL_MONTHS[m] + ' ' + y;
        if (mode === 'months') title = String(y);
        if (mode === 'years') {
            const start = Math.floor(y / 12) * 12;
            title = start + ' – ' + (start + 11);
        }
        let body = '';
        if (mode === 'months') {
            body = '<div class="cal-months">' + CAL_MONTHS_SHORT.map(function (name, i) {
                return '<button type="button" class="cal-chip' + (i === m ? ' is-on' : '') + '" data-cal="month" data-m="' + i + '">' + name + '</button>';
            }).join('') + '</div>';
        } else if (mode === 'years') {
            const start = Math.floor(y / 12) * 12;
            const chips = [];
            for (let n = start; n < start + 12; n++) {
                chips.push('<button type="button" class="cal-chip' + (n === y ? ' is-on' : '') + '" data-cal="year" data-y="' + n + '">' + n + '</button>');
            }
            body = '<div class="cal-years">' + chips.join('') + '</div>';
        } else {
            const first = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            const prevDays = new Date(y, m, 0).getDate();
            const cells = [];
            CAL_DOW.forEach(function (d) { cells.push('<span class="cal-dow">' + d + '</span>'); });
            for (let i = 0; i < 42; i++) {
                let cellY = y;
                let cellM = m;
                let cellD;
                if (i < first) {
                    cellM = m - 1;
                    if (cellM < 0) { cellM = 11; cellY -= 1; }
                    cellD = prevDays - first + i + 1;
                } else if (i >= first + days) {
                    cellM = m + 1;
                    if (cellM > 11) { cellM = 0; cellY += 1; }
                    cellD = i - first - days + 1;
                } else {
                    cellD = i - first + 1;
                }
                const iso = calIso(cellY, cellM, cellD);
                const mute = cellM !== m ? ' is-mute' : '';
                const on = sel && iso === calIso(sel.y, sel.m, sel.d) ? ' is-on' : '';
                const today = iso === todayIso ? ' is-today' : '';
                cells.push('<button type="button" class="cal-day' + mute + on + today + '" data-cal="day" data-iso="' + iso + '">' + cellD + '</button>');
            }
            body = '<div class="cal-grid">' + cells.join('') + '</div>';
        }
        pop.innerHTML =
            '<div class="cal-head">' +
            '<button type="button" class="cal-nav" data-cal="prev" aria-label="Previous">' + calNavSvg('prev') + '</button>' +
            '<button type="button" class="cal-title" data-cal="title">' + esc(title) + '</button>' +
            '<button type="button" class="cal-nav" data-cal="next" aria-label="Next">' + calNavSvg('next') + '</button>' +
            '</div>' + body +
            '<div class="cal-foot">' +
            '<button type="button" data-cal="clear">Clear</button>' +
            '<button type="button" data-cal="today">Today</button>' +
            '</div>';
        pop.hidden = false;
        placeCalendar();
    }

    function openCalendar(anchor) {
        if (!anchor) return;
        if (calState && calState.anchor === anchor) {
            closeCalendar();
            return;
        }
        const eventId = anchor.getAttribute('data-tl-cal') || '';
        const factId = anchor.getAttribute('data-fact-cal') || '';
        if (factId && factStampLocked()) return;
        let value = '';
        if (factId) {
            const stamp = stampFromIso(readFactStamp(factId));
            value = stamp ? stamp.date : '';
        } else if (eventId) {
            const rec = (data.timeline || []).find(function (item) { return item.id === eventId; });
            value = rec ? (rec.date || '') : '';
        } else {
            value = ($('eventDate') && $('eventDate').value) || '';
        }
        const parsed = parseCalAny(value);
        const now = new Date();
        if (host && host.closeSheetPick) host.closeSheetPick();
        closeTimePicker();
        closeTlInfoPop();
        closeCalendar();
        calState = {
            anchor: anchor,
            eventId: eventId,
            factId: factId,
            field: eventId || factId ? '' : 'eventDate',
            value: value,
            y: parsed ? parsed.y : now.getFullYear(),
            m: parsed ? parsed.m : now.getMonth(),
            mode: 'days'
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintCalendar();
    }

    function shiftCal(dir) {
        if (!calState) return;
        const mode = calState.mode || 'days';
        if (mode === 'years') calState.y += dir * 12;
        else if (mode === 'months') calState.y += dir;
        else {
            calState.m += dir;
            if (calState.m > 11) { calState.m = 0; calState.y += 1; }
            if (calState.m < 0) { calState.m = 11; calState.y -= 1; }
        }
        paintCalendar();
    }

    function applyCalValue(iso) {
        if (!calState) return;
        const eventId = calState.eventId;
        const factId = calState.factId;
        const field = calState.field;
        closeCalendar();
        if (factId) {
            if (!iso) {
                writeFactStamp(factId, '');
                return;
            }
            const prev = stampFromIso(readFactStamp(factId));
            const now = new Date();
            const h = prev ? prev.h : now.getHours();
            const m = prev ? prev.m : now.getMinutes();
            writeFactStamp(factId, isoFromStamp(iso, h, m));
            return;
        }
        if (eventId) {
            const rec = (data.timeline || []).find(function (item) { return item.id === eventId; });
            if (rec) {
                rememberTimeline();
                rec.date = iso || '';
                rec.pinned = true;
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        if (field === 'eventDate' && $('eventDate')) {
            $('eventDate').value = iso || '';
            syncEventDateBtn();
        }
    }

    function onCalendarClick(event) {
        const act = event.target.closest('[data-cal]');
        if (!act || !calState) return;
        const op = act.getAttribute('data-cal');
        if (op === 'prev') { shiftCal(-1); return; }
        if (op === 'next') { shiftCal(1); return; }
        if (op === 'title') {
            calState.mode = calState.mode === 'days' ? 'months' : (calState.mode === 'months' ? 'years' : 'days');
            paintCalendar();
            return;
        }
        if (op === 'month') {
            calState.m = Number(act.getAttribute('data-m')) || 0;
            calState.mode = 'days';
            paintCalendar();
            return;
        }
        if (op === 'year') {
            calState.y = Number(act.getAttribute('data-y')) || calState.y;
            calState.mode = 'months';
            paintCalendar();
            return;
        }
        if (op === 'day') {
            applyCalValue(act.getAttribute('data-iso') || '');
            return;
        }
        if (op === 'clear') {
            applyCalValue('');
            return;
        }
        if (op === 'today') {
            const now = new Date();
            applyCalValue(calIso(now.getFullYear(), now.getMonth(), now.getDate()));
        }
    }

    function parseTimeParts(value) {
        const raw = String(value || '').trim();
        const hit = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(raw);
        if (!hit) return null;
        let h = Number(hit[1]);
        const m = Number(hit[2]);
        if (m > 59) return null;
        const mer = hit[3] ? hit[3].toLowerCase() : '';
        if (mer) {
            if (h < 1 || h > 12) return null;
            if (h === 12) h = mer === 'pm' ? 12 : 0;
            else if (mer === 'pm') h += 12;
        } else if (h > 23) return null;
        return { h: h, m: m };
    }

    function toTime24(h, m) {
        return calPad(((h % 24) + 24) % 24) + ':' + calPad(((m % 60) + 60) % 60);
    }

    function formatTime12(value) {
        const p = parseTimeParts(value);
        if (!p) return 'Time';
        let h = p.h % 12;
        if (!h) h = 12;
        return h + ':' + calPad(p.m) + ' ' + (p.h >= 12 ? 'PM' : 'AM');
    }

    function closeTimePicker() {
        const pop = $('timePop');
        if (timeState && timeState.anchor) timeState.anchor.setAttribute('aria-expanded', 'false');
        timeState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeTimePicker() {
        const pop = $('timePop');
        if (!pop || pop.hidden || !timeState || !timeState.anchor) return;
        const r = timeState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 248;
        const h = pop.offsetHeight || 220;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function timeNavSvg(dir) {
        return dir === 'up'
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14.5 12 9l6 5.5"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5 12 15l6-5.5"/></svg>';
    }

    function hour12From24(h) {
        const n = h % 12;
        return n ? n : 12;
    }

    function paintTimePicker() {
        const pop = $('timePop');
        if (!pop || !timeState) return;
        const h12 = hour12From24(timeState.h);
        const pm = timeState.h >= 12;
        pop.innerHTML =
            '<div class="time-head">Time</div>' +
            '<div class="time-face">' +
            '<div class="time-col">' +
            '<button type="button" class="cal-nav" data-tm="h-up" aria-label="Hour up">' + timeNavSvg('up') + '</button>' +
            '<input class="time-num" data-tm="h-in" type="text" inputmode="numeric" maxlength="2" value="' + h12 + '" aria-label="Hour" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="cal-nav" data-tm="h-dn" aria-label="Hour down">' + timeNavSvg('down') + '</button>' +
            '</div>' +
            '<span class="time-colon">:</span>' +
            '<div class="time-col">' +
            '<button type="button" class="cal-nav" data-tm="m-up" aria-label="Minute up">' + timeNavSvg('up') + '</button>' +
            '<input class="time-num" data-tm="m-in" type="text" inputmode="numeric" maxlength="2" value="' + calPad(timeState.m) + '" aria-label="Minute" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="cal-nav" data-tm="m-dn" aria-label="Minute down">' + timeNavSvg('down') + '</button>' +
            '</div>' +
            '<div class="time-meridiem">' +
            '<button type="button" class="cal-chip' + (!pm ? ' is-on' : '') + '" data-tm="am">AM</button>' +
            '<button type="button" class="cal-chip' + (pm ? ' is-on' : '') + '" data-tm="pm">PM</button>' +
            '</div>' +
            '</div>' +
            '<div class="cal-foot">' +
            '<button type="button" data-tm="clear">Clear</button>' +
            '<button type="button" data-tm="now">Now</button>' +
            '</div>';
        pop.hidden = false;
        pop.querySelectorAll('.time-num').forEach(function (el) {
            el.addEventListener('focus', function () {
                requestAnimationFrame(function () { el.select(); });
            });
            el.addEventListener('blur', function () { finishTimeTyped(el); });
        });
        placeTimePicker();
    }

    function openTimePicker(anchor) {
        if (!anchor) return;
        if (timeState && timeState.anchor === anchor) {
            closeTimePicker();
            return;
        }
        const eventId = anchor.getAttribute('data-tl-time') || '';
        const factId = anchor.getAttribute('data-fact-time') || '';
        if (factId && factStampLocked()) return;
        const rec = factId ? null : findTimelineEvent(eventId);
        const field = anchor.getAttribute('data-tl-time-for') || 'time';
        const slotId = anchor.getAttribute('data-note-id') || '';
        let parsed = null;
        if (factId) {
            const stamp = stampFromIso(readFactStamp(factId));
            if (stamp) parsed = { h: stamp.h, m: stamp.m };
        } else if (field === 'moreTime' && rec) {
            const slot = (rec.moreTimes || []).find(function (item) { return item.id === slotId; });
            parsed = parseTimeParts(slot && slot.value);
        } else {
            parsed = parseTimeParts(rec && rec[field]);
        }
        const now = new Date();
        if (host && host.closeSheetPick) host.closeSheetPick();
        closeCalendar();
        closeTlInfoPop();
        closeTimePicker();
        timeState = {
            anchor: anchor,
            eventId: eventId,
            factId: factId,
            field: field,
            slotId: slotId,
            h: parsed ? parsed.h : now.getHours(),
            m: parsed ? parsed.m : now.getMinutes()
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintTimePicker();
    }

    function setTimeMeridiem(pm) {
        if (!timeState) return;
        if (pm && timeState.h < 12) timeState.h += 12;
        if (!pm && timeState.h >= 12) timeState.h -= 12;
        commitTimeValue(false);
        syncTimePickerFace();
    }

    function shiftTime(unit, dir) {
        if (!timeState) return;
        if (unit === 'h') timeState.h = (timeState.h + dir + 24) % 24;
        else timeState.m = (timeState.m + dir + 60) % 60;
        commitTimeValue(false);
        syncTimePickerFace(true);
    }

    function syncTimePickerFace(force) {
        const pop = $('timePop');
        if (!pop || pop.hidden || !timeState) return;
        const hIn = pop.querySelector('[data-tm="h-in"]');
        const mIn = pop.querySelector('[data-tm="m-in"]');
        const am = pop.querySelector('[data-tm="am"]');
        const pm = pop.querySelector('[data-tm="pm"]');
        const pmOn = timeState.h >= 12;
        if (hIn && (force || document.activeElement !== hIn)) hIn.value = String(hour12From24(timeState.h));
        if (mIn && (force || document.activeElement !== mIn)) mIn.value = calPad(timeState.m);
        if (am) am.classList.toggle('is-on', !pmOn);
        if (pm) pm.classList.toggle('is-on', pmOn);
    }

    function applyTimeTyped(el) {
        if (!timeState || !el) return;
        const kind = el.getAttribute('data-tm');
        const raw = String(el.value || '').replace(/\D/g, '').slice(0, 2);
        if (el.value !== raw) el.value = raw;
        if (!raw) return;
        const n = Number(raw);
        if (kind === 'h-in') {
            if (n < 1 || n > 12) return;
            const pm = timeState.h >= 12;
            if (n === 12) timeState.h = pm ? 12 : 0;
            else timeState.h = pm ? n + 12 : n;
        } else if (kind === 'm-in') {
            if (n > 59) return;
            timeState.m = n;
        } else return;
        commitTimeValue(false);
        syncTimePickerFace();
    }

    function finishTimeTyped(el) {
        if (!timeState || !el) return;
        applyTimeTyped(el);
        const kind = el.getAttribute('data-tm');
        if (kind === 'h-in') {
            let n = Number(String(el.value || '').replace(/\D/g, ''));
            if (!n) n = hour12From24(timeState.h);
            if (n < 1) n = 1;
            if (n > 12) n = 12;
            const pm = timeState.h >= 12;
            if (n === 12) timeState.h = pm ? 12 : 0;
            else timeState.h = pm ? n + 12 : n;
        } else if (kind === 'm-in') {
            let n = Number(String(el.value || '').replace(/\D/g, ''));
            if (!isFinite(n) || n < 0) n = timeState.m;
            if (n > 59) n = 59;
            timeState.m = n;
        }
        commitTimeValue(false);
        syncTimePickerFace(true);
    }

    function onTimeFieldKey(event) {
        const el = event.target;
        const kind = el && el.getAttribute && el.getAttribute('data-tm');
        if (kind !== 'h-in' && kind !== 'm-in') return false;
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            shiftTime(kind === 'h-in' ? 'h' : 'm', 1);
            return true;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            shiftTime(kind === 'h-in' ? 'h' : 'm', -1);
            return true;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            finishTimeTyped(el);
            closeTimePicker();
            return true;
        }
        return false;
    }

    function commitTimeValue(clear) {
        if (!timeState) return;
        if (timeState.factId) {
            const factId = timeState.factId;
            const prev = stampFromIso(readFactStamp(factId));
            const now = new Date();
            const date = prev ? prev.date : calIso(now.getFullYear(), now.getMonth(), now.getDate());
            if (clear) {
                writeFactStamp(factId, isoFromStamp(date, 0, 0));
                return;
            }
            writeFactStamp(factId, isoFromStamp(date, timeState.h, timeState.m));
            return;
        }
        const rec = findTimelineEvent(timeState.eventId);
        if (!rec) return;
        rememberTimeline('time:' + rec.id);
        const field = timeState.field || 'time';
        const stamp = clear ? '' : toTime24(timeState.h, timeState.m);
        const node = document.querySelector('#timelineList [data-event="' + rec.id + '"]');
        if (field === 'moreTime') {
            rec.moreTimes = Array.isArray(rec.moreTimes) ? rec.moreTimes : [];
            rec.moreTimes.forEach(function (item) {
                if (item.id === timeState.slotId) item.value = stamp;
            });
            const btn = node && node.querySelector('[data-tl-time-for="moreTime"][data-note-id="' + timeState.slotId + '"]');
            if (btn) {
                btn.textContent = stamp ? formatTime12(stamp) : 'Select time';
                btn.classList.toggle('has-time', !!stamp);
            }
        } else if (field === 'infoTime') {
            rec.infoTime = stamp;
            const btn = node && node.querySelector('[data-tl-time-for="infoTime"]');
            if (btn) {
                btn.textContent = rec.infoTime ? formatTime12(rec.infoTime) : 'Select time';
                btn.classList.toggle('has-time', !!rec.infoTime);
            }
        } else {
            rec.time = stamp;
            const label = node && node.querySelector('.tl-bar .tl-time');
            if (label) {
                label.textContent = rec.time ? formatTime12(rec.time) : 'Time';
                label.classList.toggle('has-time', !!rec.time);
            }
        }
        schedulePersist();
        scheduleDatasheet();
    }

    function onTimeClick(event) {
        const act = event.target.closest('[data-tm]');
        if (!act || !timeState) return;
        const op = act.getAttribute('data-tm');
        if (op === 'h-in' || op === 'm-in') return;
        if (op === 'h-up') { shiftTime('h', 1); return; }
        if (op === 'h-dn') { shiftTime('h', -1); return; }
        if (op === 'm-up') { shiftTime('m', 1); return; }
        if (op === 'm-dn') { shiftTime('m', -1); return; }
        if (op === 'am') { setTimeMeridiem(false); return; }
        if (op === 'pm') { setTimeMeridiem(true); return; }
        if (op === 'clear') {
            commitTimeValue(true);
            closeTimePicker();
            return;
        }
        if (op === 'now') {
            const now = new Date();
            timeState.h = now.getHours();
            timeState.m = now.getMinutes();
            commitTimeValue(false);
            closeTimePicker();
        }
    }

    function tlShows(ev, key) {
        if (!ev) return false;
        if (key === 'image') return !!(ev.image || (ev.show && ev.show.image));
        const shown = ev.show && ev.show[key];
        return !!(shown || String(ev[key] || '').trim());
    }

    function tlFolded(ev, key, note) {
        if (note) return !!note.fold;
        return !!(ev && ev.fold && ev.fold[key]);
    }

    function tlBitBar(ev, key, label, folded, noteId) {
        const nid = noteId ? ' data-note-id="' + esc(noteId) + '"' : '';
        const expand = folded ? 'Expand' : 'Minimize';
        return '<div class="tl-bit-bar">' +
            '<span>' + esc(label) + '</span>' +
            '<div class="tl-bit-acts">' +
            '<button type="button" class="tl-bit-btn" data-tl-fold="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="' + expand + '" aria-label="' + expand + '" aria-expanded="' + (folded ? 'false' : 'true') + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
            '</button>' +
            '<button type="button" class="tl-bit-btn is-del" data-tl-drop="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="Delete" aria-label="Delete">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
            '</button>' +
            '</div></div>';
    }

    function tlBitShell(ev, key, label, folded, innerHtml, noteId) {
        return '<div class="tl-bit' + (folded ? ' is-fold' : '') + '" data-tl-bit="' + key + '">' +
            tlBitBar(ev, key, label, folded, noteId) +
            '<div class="tl-bit-body"><div class="tl-bit-body-inner">' + innerHtml + '</div></div></div>';
    }

    function tlBitEl(id, key, noteId) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (!node) return null;
        if (key === 'more' || key === 'moreTime') {
            const hit = node.querySelector('[data-note-id="' + noteId + '"]');
            return hit ? hit.closest('.tl-bit') : null;
        }
        return node.querySelector('[data-tl-bit="' + key + '"]');
    }

    function afterEase(el, fn) {
        if (!el || reduceMotion()) {
            fn();
            return;
        }
        let done = false;
        const finish = function (event) {
            if (done) return;
            if (event) {
                if (event.target !== el) return;
                if (event.type === 'transitionend' && event.propertyName !== 'height') return;
            }
            done = true;
            fn();
        };
        el.addEventListener('transitionend', finish);
        el.addEventListener('animationend', finish);
        setTimeout(function () { finish(); }, 420);
    }

    function tickTlLayout(frames, preferId) {
        let n = 0;
        const max = frames || 20;
        const tick = function () {
            stackTimelineStems(preferId);
            drawTimelineAxis();
            n += 1;
            if (n < max) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function moreTimesOf(ev) {
        if (!ev) return [];
        ev.moreTimes = Array.isArray(ev.moreTimes) ? ev.moreTimes.filter(function (item) { return item && item.id; }) : [];
        if ((ev.infoTime || (ev.show && ev.show.infoTime)) && !ev.moreTimes.length) {
            ev.moreTimes.push({
                id: uid('tm'),
                value: ev.infoTime || '',
                fold: !!(ev.fold && ev.fold.infoTime)
            });
            ev.infoTime = '';
            if (ev.show) ev.show.infoTime = false;
        }
        return ev.moreTimes;
    }

    function tlInfoTimeHtml(ev) {
        return moreTimesOf(ev).map(function (item) {
            const folded = !!item.fold;
            const label = item.value ? formatTime12(item.value) : 'Select time';
            return tlBitShell(ev, 'moreTime', 'Time', folded,
                '<button type="button" class="tl-info-clock' + (item.value ? ' has-time' : '') + '" data-tl-time="' + esc(ev.id) + '" data-tl-time-for="moreTime" data-note-id="' + esc(item.id) + '" aria-haspopup="dialog" aria-label="Card time">' + esc(label) + '</button>',
                item.id);
        }).join('');
    }

    function tlFactRow(ev, key, label, ph) {
        if (!tlShows(ev, key)) return '';
        const folded = tlFolded(ev, key);
        return tlBitShell(ev, key, label, folded,
            '<input data-tl-field="' + key + '" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev[key] || '') + '" placeholder="' + esc(ph) + '" spellcheck="false" autocomplete="off">');
    }

    function tlMoreNotesHtml(ev) {
        return (Array.isArray(ev.moreNotes) ? ev.moreNotes : []).map(function (note) {
            if (!note || !note.id) return '';
            const blank = !(note.text || '').trim();
            const h = Number(note.h);
            const folded = tlFolded(ev, 'more', note);
            return tlBitShell(ev, 'more', 'Note', folded,
                '<div class="tl-note' + (blank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="more" data-event-id="' + esc(ev.id) + '" data-note-id="' + esc(note.id) + '" data-ph="Note" spellcheck="false" style="height:' + (h >= 48 ? h : 76) + 'px">' + esc(note.text || '') + '</div>',
                note.id);
        }).join('');
    }

    function tlMediaHtml(ev) {
        if (!ev.image && !tlShows(ev, 'image')) return '';
        const folded = tlFolded(ev, 'image');
        const body = ev.image
            ? '<div class="tl-media"><img class="tl-thumb" src="' + esc(ev.image) + '" alt="" data-tl-expand="' + esc(ev.id) + '"></div>'
            : '<div class="tl-attach">' +
                '<button type="button" class="tl-attach-hit" data-tl-photo="' + esc(ev.id) + '">Attach image</button>' +
                '<input class="tl-attach-url" data-tl-image-url="' + esc(ev.id) + '" type="url" placeholder="Paste image URL" spellcheck="false" autocomplete="off">' +
                '</div>';
        return tlBitShell(ev, 'image', 'Image', folded, body);
    }

    function toggleTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        rememberTimeline();
        let folded = false;
        if (key === 'more') {
            const note = (rec.moreNotes || []).find(function (item) { return item.id === noteId; });
            if (!note) return;
            note.fold = !note.fold;
            folded = !!note.fold;
        } else if (key === 'moreTime') {
            const slot = moreTimesOf(rec).find(function (item) { return item.id === noteId; });
            if (!slot) return;
            slot.fold = !slot.fold;
            folded = !!slot.fold;
            rec.moreTimes = moreTimesOf(rec);
        } else {
            rec.fold = rec.fold && typeof rec.fold === 'object' ? rec.fold : {};
            rec.fold[key] = !rec.fold[key];
            folded = !!rec.fold[key];
        }
        const bit = tlBitEl(id, key, noteId);
        if (bit) {
            bit.classList.toggle('is-fold', folded);
            const btn = bit.querySelector('[data-tl-fold]');
            if (btn) {
                btn.title = folded ? 'Expand' : 'Minimize';
                btn.setAttribute('aria-label', folded ? 'Expand' : 'Minimize');
                btn.setAttribute('aria-expanded', folded ? 'false' : 'true');
            }
            if (reduceMotion()) {
                stackTimelineStems();
                drawTimelineAxis();
            } else tickTlLayout(20);
        } else {
            renderTimeline();
        }
        schedulePersist();
    }

    function dropTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        const bit = tlBitEl(id, key, noteId);
        if (bit && bit.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            const live = findTimelineEvent(id);
            if (!live) return;
            if (key === 'more') {
                live.moreNotes = (live.moreNotes || []).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'moreTime') {
                live.moreTimes = moreTimesOf(live).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'image') {
                live.image = '';
                if (live.show) live.show.image = false;
                if (live.fold) live.fold.image = false;
            } else {
                live[key] = '';
                live.show = live.show && typeof live.show === 'object' ? live.show : {};
                live.show[key] = false;
                if (live.fold) live.fold[key] = false;
            }
            renderTimeline();
            schedulePersist();
        }
        if (bit && !reduceMotion()) {
            const h = bit.offsetHeight;
            bit.style.height = h + 'px';
            void bit.offsetHeight;
            bit.classList.add('is-out');
            bit.style.height = '0px';
            tickTlLayout(20);
            afterEase(bit, commit);
            return;
        }
        commit();
    }

    function closeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (infoState && infoState.anchor) infoState.anchor.setAttribute('aria-expanded', 'false');
        infoState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || pop.hidden || !infoState || !infoState.anchor) return;
        const r = infoState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 268;
        const h = pop.offsetHeight || 280;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function paintTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || !infoState) return;
        const rec = findTimelineEvent(infoState.eventId);
        const items = [
            ['image', 'image', rec && rec.image ? 'Replace image' : 'Image'],
            ['notes', 'note', 'More notes'],
            ['time', 'clock', 'Time'],
            ['date', 'calendar', 'Date'],
            ['entities', 'person', 'Entities'],
            ['source', 'link', 'Source'],
            ['evidence', 'document', 'Evidence']
        ];
        pop.innerHTML =
            '<div class="tl-info-head">Add information</div>' +
            '<div class="tl-info-grid">' +
            items.map(function (item) {
                return '<button type="button" data-tl-add="' + item[0] + '">' + boardIcon(item[1]) + '<span>' + item[2] + '</span></button>';
            }).join('') +
            '</div>';
        pop.hidden = false;
        placeTlInfoPop();
    }

    function openTlInfoPop(anchor) {
        if (!anchor) return;
        if (infoState && infoState.anchor === anchor) {
            if (Date.now() - (infoState.at || 0) < 500) return;
            closeTlInfoPop();
            return;
        }
        closeCalendar();
        closeTimePicker();
        hideTimelineMenu();
        closeTlInfoPop();
        infoState = {
            anchor: anchor,
            eventId: anchor.getAttribute('data-tl-info') || '',
            at: Date.now()
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintTlInfoPop();
    }

    function runTlInfo(kind, id) {
        const rec = findTimelineEvent(id);
        if (!rec || !kind) return;
        closeTlInfoPop();
        if (kind === 'date') {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
            return;
        }
        rememberTimeline('info:' + id);
        rec.show = rec.show && typeof rec.show === 'object' ? rec.show : {};
        if (rec.mini) rec.mini = false;
        if (kind === 'time') {
            moreTimesOf(rec);
            const item = { id: uid('tm'), value: '' };
            rec.moreTimes.push(item);
            tlFocusAfter = { id: id, pickTime: item.id };
        } else if (kind === 'notes') {
            rec.moreNotes = Array.isArray(rec.moreNotes) ? rec.moreNotes : [];
            const note = { id: uid('note'), text: '' };
            rec.moreNotes.push(note);
            tlFocusAfter = { id: id, more: note.id };
        } else if (kind === 'image') {
            rec.show.image = true;
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        } else {
            rec.show[kind] = true;
            tlFocusAfter = { id: id, field: kind };
        }
        renderTimeline();
        tickTlLayout(28, id);
        schedulePersist();
    }

    function onTlInfoClick(event) {
        const act = event.target.closest('[data-tl-add]');
        if (!act || !infoState) return;
        runTlInfo(act.getAttribute('data-tl-add'), infoState.eventId);
    }

    function applyTlFocusAfter(list) {
        const spec = tlFocusAfter;
        tlFocusAfter = null;
        if (!spec || !list) return;
        const node = list.querySelector('[data-event="' + spec.id + '"]');
        if (!node) return;
        if (spec.photo) {
            timelinePhotoId = spec.id;
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        if (spec.pickTime) {
            const btn = node.querySelector('[data-tl-time-for="moreTime"][data-note-id="' + spec.pickTime + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        if (spec.pick) {
            const btn = node.querySelector('[data-tl-time-for="' + spec.pick + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        const el = spec.more
            ? node.querySelector('[data-note-id="' + spec.more + '"]')
            : node.querySelector('[data-tl-field="' + spec.field + '"]');
        if (el) el.focus();
    }

    function renderTimeline() {
        if (calState && calState.eventId) closeCalendar();
        if (timeState && timeState.eventId) closeTimePicker();
        if (infoState && infoState.eventId) closeTlInfoPop();
        const list = $('timelineList');
        const count = $('timelineCount');
        const events = layoutTimelineEvents();
        if (count) count.textContent = events.length ? (events.length === 1 ? '1 event' : events.length + ' events') : 'No events';
        applyTimelineCam();
        const empty = $('timelineEmpty');
        if (empty) empty.hidden = true;
        if (!events.length) {
            const view = $('timelineView');
            const cam = timelineCam();
            if (view && view.clientHeight > 80) {
                cam.y = Math.round(view.clientHeight / 2 - TL_AXIS_Y * cam.z);
                applyTimelineCam();
            }
        }
        if (!list) {
            scheduleDatasheet();
            return;
        }
        list.innerHTML = events.map(function (ev) {
            const n = String(ev.n).padStart(2, '0');
            const active = ev.id === selectedEvent ? ' is-on' : '';
            const connecting = connectFrom === ev.id ? ' is-from' : '';
            const spawn = ev.spawn ? ' is-spawn' : '';
            delete ev.spawn;
            const mini = ev.mini ? ' is-mini' : '';
            const locked = ev.locked ? ' is-locked' : '';
            const facts = tlInfoTimeHtml(ev) +
                tlFactRow(ev, 'entities', 'Entities', 'People, accounts, companies') +
                tlFactRow(ev, 'source', 'Source', 'URL or origin') +
                tlFactRow(ev, 'evidence', 'Evidence', 'File, exhibit, or note');
            const media = tlMediaHtml(ev);
            const noteBlank = !(ev.body || '').trim();
            const noteH = Number(ev.noteH);
            const w = tlCardW(ev);
            const h = tlCardH(ev);
            const top = cardTop(ev, ev.mini ? 86 : (ev.image ? 420 : 220));
            return '<article class="tl-node' + active + connecting + spawn + mini + locked + (h ? ' is-sized' : '') + '" data-event="' + esc(ev.id) + '" data-side="' + (ev.side === 1 ? '1' : '-1') + '" style="left:' + (ev.pinX - w / 2) + 'px;top:' + top + 'px;width:' + w + 'px' + (h && !ev.mini ? ';height:' + h + 'px' : '') + '">' +
                '<div class="tl-card">' +
                '<div class="tl-bar" data-tl-drag>' +
                '<span class="tl-idx">' + n + '</span>' +
                '<div class="tl-when">' +
                '<span class="tl-date' + (ev.date ? ' has-date' : '') + '">' + esc(ev.date ? formatDayLabel(ev.date) : 'Date') + '</span>' +
                '<span class="tl-time' + (ev.time ? ' has-time' : '') + '">' + esc(ev.time ? formatTime12(ev.time) : 'Time') + '</span>' +
                '</div>' +
                '<div class="tl-bar-actions">' +
                '<button type="button" class="tl-ico" data-tl-cal="' + esc(ev.id) + '" title="Date" aria-label="Choose date" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-time="' + esc(ev.id) + '" title="Time" aria-label="Choose time" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico' + (connectFrom === ev.id ? ' is-on' : '') + '" data-connect-event="' + esc(ev.id) + '" title="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-label="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-pressed="' + (connectFrom === ev.id ? 'true' : 'false') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a3.8 3.8 0 0 0 5.4.4l1.6-1.6a3.8 3.8 0 1 0-5.4-5.4l-.9.9"/><path d="M14 10.5a3.8 3.8 0 0 0-5.4-.4L7 11.7a3.8 3.8 0 0 0 5.4 5.4l.9-.9"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-mini="' + esc(ev.id) + '" title="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-label="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-expanded="' + (ev.mini ? 'false' : 'true') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico danger" data-del-event="' + esc(ev.id) + '" title="Delete" aria-label="Delete">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
                '</button>' +
                '</div></div>' +
                '<input class="tl-title" data-tl-field="title" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev.title || '') + '" placeholder="Title" spellcheck="false" autocomplete="off" maxlength="120">' +
                '<div class="tl-extra"><div class="tl-extra-inner">' +
                '<div class="tl-note' + (noteBlank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="body" data-event-id="' + esc(ev.id) + '" data-ph="Note" spellcheck="false" style="height:' + (noteH >= 48 ? noteH : 76) + 'px">' + esc(ev.body || '') + '</div>' +
                tlMoreNotesHtml(ev) +
                (facts ? '<div class="tl-facts">' + facts + '</div>' : '') +
                media +
                '<div class="tl-acts">' +
                '<button type="button" class="tl-add-info" data-tl-info="' + esc(ev.id) + '" aria-haspopup="dialog" aria-expanded="false">+ Add information</button>' +
                '</div></div></div></div>' +
                '<div class="tl-rs" aria-hidden="true">' +
                '<i data-tl-rs="n"></i><i data-tl-rs="s"></i><i data-tl-rs="e"></i><i data-tl-rs="w"></i>' +
                '<i data-tl-rs="ne"></i><i data-tl-rs="nw"></i><i data-tl-rs="se"></i><i data-tl-rs="sw"></i>' +
                '</div></article>';
        }).join('');
        requestAnimationFrame(function () {
            list.querySelectorAll('.tl-node').forEach(function (el) {
                const rec = (data.timeline || []).find(function (item) { return item.id === el.getAttribute('data-event'); });
                if (!rec) return;
                if (!(rec.pinY != null && isFinite(Number(rec.pinY)))) rec.pinY = cardTop(rec, tlNodeH(el, rec));
                placeTlCard(el, rec);
            });
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
            bindTimelineFieldSizes(list);
            bindTimelineNodeSizes(list);
            applyTlFocusAfter(list);
            tickTlLayout(12);
        });
        scheduleDatasheet();
    }

    function tlEditableBlank(el) {
        return !String((el && el.innerText) || '').replace(/\u00a0/g, ' ').trim();
    }

    function syncTlPlaceholder(el) {
        if (!el || !el.hasAttribute || !el.hasAttribute('data-tl-field')) return;
        if (tlEditableBlank(el)) {
            el.classList.add('is-blank');
            const html = String(el.innerHTML || '').replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/gi, '').replace(/\s/g, '');
            if (!html && el.innerHTML) el.innerHTML = '';
        } else {
            el.classList.remove('is-blank');
        }
    }

    function bindTimelineFieldSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlSizeObs) tlSizeObs.disconnect();
        tlSizeObs = new ResizeObserver(function (entries) {
            entries.forEach(function (entry) {
                const el = entry.target;
                const rec = findTimelineEvent(el.getAttribute('data-event-id'));
                if (!rec) return;
                const field = el.getAttribute('data-tl-field');
                if (el.closest('.tl-node.is-sized, .tl-node.is-resizing')) return;
                const h = Math.round(el.offsetHeight);
                if (h < 16) return;
                if (field === 'more') {
                    const nid = el.getAttribute('data-note-id');
                    const item = (rec.moreNotes || []).find(function (note) { return note.id === nid; });
                    if (!item || item.h === h) return;
                    item.h = h;
                    schedulePersist();
                    scheduleStemRedraw();
                    return;
                }
                const key = field === 'title' ? 'titleH' : 'noteH';
                if (rec[key] === h) return;
                rec[key] = h;
                schedulePersist();
                scheduleStemRedraw();
            });
        });
        list.querySelectorAll('[data-tl-field="body"], [data-tl-field="more"]').forEach(function (el) { tlSizeObs.observe(el); });
    }

    function scheduleStemRedraw() {
        if (tlStemRedraw) return;
        tlStemRedraw = requestAnimationFrame(function () {
            tlStemRedraw = 0;
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
        });
    }

    function trackTimelineStems() {
        if (tlStemTrack) return;
        const tick = function () {
            tlStemTrack = 0;
            drawTimelineAxis();
            if (document.querySelector('#timelineList .tl-node.is-spawn, #timelineList .tl-node.is-moving, #timelineList .tl-node.is-resizing')) {
                tlStemTrack = requestAnimationFrame(tick);
            }
        };
        tlStemTrack = requestAnimationFrame(tick);
    }

    function bindTimelineNodeSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlNodeObs) tlNodeObs.disconnect();
        tlNodeObs = new ResizeObserver(function (entries) {
            let dirty = false;
            entries.forEach(function (entry) {
                const el = entry.target;
                if (!el || el.classList.contains('is-resizing') || el.classList.contains('is-moving') || el.classList.contains('is-out')) return;
                dirty = true;
            });
            if (dirty) scheduleStemRedraw();
        });
        list.querySelectorAll('.tl-node, .tl-node .tl-card').forEach(function (el) { tlNodeObs.observe(el); });
    }

    function formatWhen(ev) {
        if (!ev.date && !ev.time) return 'Undated';
        if (ev.date && ev.time) return ev.date + ' ' + ev.time;
        return ev.date || ev.time;
    }

    function tlPortPoint(box, side) {
        const mx = (box.left + box.right) / 2;
        const my = (box.top + box.bottom) / 2;
        if (side === 'n') return { x: mx, y: box.top };
        if (side === 's') return { x: mx, y: box.bottom };
        if (side === 'e') return { x: box.right, y: my };
        return { x: box.left, y: my };
    }

    function tlCardLinkPath(a, b) {
        const sides = ['n', 'e', 's', 'w'];
        let best = null;
        let dist = Infinity;
        sides.forEach(function (sa) {
            const pa = tlPortPoint(a, sa);
            sides.forEach(function (sb) {
                const pb = tlPortPoint(b, sb);
                const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
                if (d < dist) {
                    dist = d;
                    best = { sa: sa, sb: sb, a: pa, b: pb };
                }
            });
        });
        if (!best) return '';
        const out = { n: [0, -22], s: [0, 22], e: [22, 0], w: [-22, 0] };
        const a1 = { x: best.a.x + out[best.sa][0], y: best.a.y + out[best.sa][1] };
        const b1 = { x: best.b.x + out[best.sb][0], y: best.b.y + out[best.sb][1] };
        const mid = (best.sa === 'e' || best.sa === 'w')
            ? [{ x: a1.x, y: b1.y }]
            : [{ x: b1.x, y: a1.y }];
        return tlOrthoPath([best.a, a1].concat(mid).concat([b1, best.b]), 12);
    }

    function tlCardBox(ev, el) {
        const card = el && el.querySelector('.tl-card');
        const w = Math.max(1, (card && card.offsetWidth) || (el && el.offsetWidth) || tlCardW(ev));
        const h = Math.max(86, (card && card.offsetHeight) || tlNodeH(el, ev));
        const left = el
            ? (parseFloat(el.style.left) || el.offsetLeft || ((Number(ev.pinX) || 0) - w / 2))
            : ((Number(ev.pinX) || 0) - w / 2);
        const top = el
            ? (parseFloat(el.style.top) || el.offsetTop || Number(ev.pinY) || 0)
            : (Number(ev.pinY) || 0);
        const pin = left + w / 2;
        const side = tlFacingSide(top, h, ev && ev.side);
        return { id: ev.id, side: side, pin: pin, left: left, right: left + w, top: top, bottom: top + h };
    }

    function tlStemEnds(box, axisY) {
        const side = box.side === 1 ? 1 : -1;
        const glue = 5;
        return {
            side: side,
            pin: box.pin,
            tickY: side === 1 ? axisY + 22 : axisY - 22,
            cardY: side === 1 ? box.top + glue : box.bottom - glue
        };
    }

    function mergeTlBoxes(list) {
        if (!list.length) return [];
        const items = list.slice().sort(function (a, b) { return a.top - b.top; });
        const out = [{ left: items[0].left, right: items[0].right, top: items[0].top, bottom: items[0].bottom }];
        for (let i = 1; i < items.length; i++) {
            const last = out[out.length - 1];
            const cur = items[i];
            if (cur.top <= last.bottom + 18) {
                last.bottom = Math.max(last.bottom, cur.bottom);
                last.left = Math.min(last.left, cur.left);
                last.right = Math.max(last.right, cur.right);
            } else {
                out.push({ left: cur.left, right: cur.right, top: cur.top, bottom: cur.bottom });
            }
        }
        return out;
    }

    function tlOrthoPath(pts, radius) {
        if (!pts.length) return '';
        const r = radius == null ? 10 : radius;
        let d = 'M' + pts[0].x + ' ' + pts[0].y;
        if (pts.length === 1) return d;
        if (pts.length === 2) return d + ' L' + pts[1].x + ' ' + pts[1].y;
        for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            const next = pts[i + 1];
            const dx1 = cur.x - prev.x;
            const dy1 = cur.y - prev.y;
            const dx2 = next.x - cur.x;
            const dy2 = next.y - cur.y;
            const len1 = Math.hypot(dx1, dy1) || 1;
            const len2 = Math.hypot(dx2, dy2) || 1;
            const rr = Math.min(r, len1 / 2, len2 / 2);
            d += ' L' + (cur.x - dx1 / len1 * rr) + ' ' + (cur.y - dy1 / len1 * rr);
            d += ' Q' + cur.x + ' ' + cur.y + ' ' + (cur.x + dx2 / len2 * rr) + ' ' + (cur.y + dy2 / len2 * rr);
        }
        const last = pts[pts.length - 1];
        d += ' L' + last.x + ' ' + last.y;
        return d;
    }

    function tlStemPoints(pin, startY, endY, selfId, boxes) {
        const down = endY > startY;
        const hits = boxes.filter(function (b) {
            if (b.id === selfId) return false;
            if (pin < b.left - 1 || pin > b.right + 1) return false;
            if (down) return b.top < endY - 8 && b.bottom > startY + 8;
            return b.bottom > endY + 8 && b.top < startY - 8;
        });
        const merged = mergeTlBoxes(hits);
        const pad = 16;
        const pts = [{ x: pin, y: startY }];
        merged.forEach(function (obs) {
            let enter;
            let leave;
            if (down) {
                if (obs.bottom <= startY + 4 || obs.top >= endY - 4) return;
                enter = Math.max(startY, obs.top - pad);
                leave = Math.min(endY, obs.bottom + pad);
            } else {
                if (obs.top >= startY - 4 || obs.bottom <= endY + 4) return;
                enter = Math.min(startY, obs.bottom + pad);
                leave = Math.max(endY, obs.top - pad);
            }
            if (down ? leave <= enter : leave >= enter) return;
            const leftX = obs.left - pad;
            const rightX = obs.right + pad;
            let around = Math.abs(pin - leftX) <= Math.abs(rightX - pin) ? leftX : rightX;
            if (around < TL_ORIGIN_X - 8) around = rightX;
            pts.push({ x: pin, y: enter });
            pts.push({ x: around, y: enter });
            pts.push({ x: around, y: leave });
            pts.push({ x: pin, y: leave });
        });
        const last = pts[pts.length - 1];
        if (!last || last.x !== pin) pts.push({ x: pin, y: last ? last.y : startY });
        const tail = pts[pts.length - 1];
        if (!tail || Math.abs(tail.y - endY) > 0.5) pts.push({ x: pin, y: endY });
        if (pts.length < 2) {
            pts.push({ x: pin, y: startY });
            pts.push({ x: pin, y: endY });
        }
        return pts;
    }

    function drawTimelineAxis() {
        const svg = $('timelineAxis');
        const stage = $('timelineStage');
        if (!svg || !stage) return;
        const x0 = TL_ORIGIN_X;
        const x1 = axisEnd();
        const y = TL_AXIS_Y;
        svg.setAttribute('viewBox', '0 0 ' + TL_STAGE_W + ' ' + TL_STAGE_H);
        svg.setAttribute('width', TL_STAGE_W);
        svg.setAttribute('height', TL_STAGE_H);
        const parts = [];
        parts.push('<defs><marker id="tl-arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto"><polygon points="0 0, 12 5, 0 10" fill="#a1a1aa"/></marker><marker id="tl-card-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#73737a"/></marker></defs>');
        parts.push('<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#a1a1aa" stroke-width="1.5" marker-end="url(#tl-arrow)"/>');
        parts.push('<circle cx="' + x0 + '" cy="' + y + '" r="4" fill="#e4e4e7"/>');
        const tickStep = 80;
        let n = 0;
        for (let x = x0; x < x1 - 24; x += tickStep) {
            const major = n % 5 === 0;
            parts.push('<line x1="' + x + '" y1="' + (y - (major ? 16 : 7)) + '" x2="' + x + '" y2="' + (y + (major ? 16 : 7)) + '" stroke="' + (major ? '#d4d4d8' : '#52525b') + '" stroke-width="' + (major ? '1.3' : '1') + '"/>');
            if (major) {
                parts.push('<text x="' + x + '" y="' + (y + 34) + '" text-anchor="middle" fill="#71717a" font-size="11" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">' + n + '</text>');
            }
            n += 1;
        }
        const nodes = {};
        stage.querySelectorAll('[data-event]').forEach(function (el) {
            nodes[el.getAttribute('data-event')] = el;
        });
        const boxes = (data.timeline || []).map(function (ev) {
            return tlCardBox(ev, nodes[ev.id]);
        }).filter(function (b) { return b && nodes[b.id]; });
        (data.timeline || []).forEach(function (ev) {
            const el = nodes[ev.id];
            const box = el ? tlCardBox(ev, el) : null;
            const pin = box ? box.pin : (Number(ev.pinX) || x0 + 80);
            const leaving = !!(el && el.classList.contains('is-out'));
            const outClass = leaving ? ' is-out' : '';
            parts.push('<line class="tl-pin' + outClass + '" data-tl-pin="' + esc(ev.id) + '" pathLength="1" x1="' + pin + '" y1="' + (y - 22) + '" x2="' + pin + '" y2="' + (y + 22) + '" stroke="#fafafa" stroke-width="1.6"/>');
            if (box) {
                const ends = tlStemEnds(box, y);
                let pts = tlStemPoints(ends.pin, ends.tickY, ends.cardY, ev.id, boxes);
                if (pts.length < 2) {
                    pts = [{ x: ends.pin, y: ends.tickY }, { x: ends.pin, y: ends.cardY }];
                }
                pts[0] = { x: ends.pin, y: ends.tickY };
                pts[pts.length - 1] = { x: ends.pin, y: ends.cardY };
                pts.reverse();
                let d = tlOrthoPath(pts, 10);
                if (!d) d = 'M' + ends.pin + ' ' + ends.cardY + ' L' + ends.pin + ' ' + ends.tickY;
                parts.push('<path class="tl-stem' + outClass + '" data-tl-stem="' + esc(ev.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#a1a1aa" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>');
            }
            if (ev.date) {
                parts.push('<text class="tl-pin-date' + outClass + '" data-tl-pin-date="' + esc(ev.id) + '" x="' + pin + '" y="' + (y - 40) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(formatDayLabel(ev.date)) + '</text>');
            }
        });
        (data.timeline || []).forEach(function (ev) {
            (ev.links || []).forEach(function (link) {
                const b = (data.timeline || []).find(function (item) { return item.id === link.to; });
                if (!b || b.id === ev.id) return;
                const boxA = tlCardBox(ev, nodes[ev.id]);
                const boxB = tlCardBox(b, nodes[b.id]);
                if (!boxA || !boxB) return;
                const d = tlCardLinkPath(boxA, boxB);
                if (!d) return;
                const elA = nodes[ev.id];
                const elB = nodes[b.id];
                const leaving = !!(elA && elA.classList.contains('is-out')) || !!(elB && elB.classList.contains('is-out'));
                parts.push('<path class="tl-card-link' + (leaving ? ' is-out' : '') + '" data-tl-link-a="' + esc(ev.id) + '" data-tl-link-b="' + esc(b.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#73737a" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" marker-end="url(#tl-card-arrow)"/>');
            });
        });
        svg.innerHTML = parts.join('');
    }

    function nextCardTitle() {
        return 'Untitled Card';
    }

    function isDefaultCardTitle(title) {
        const t = String(title || '').trim();
        return !t || /^untitled card$/i.test(t) || /^Card\s*#\{\d+\}$/i.test(t);
    }

    function addEventAt(x, side, spawn) {
        hideTimelineIsland();
        rememberTimeline();
        const pinX = clampTimelineX(x);
        const ev = {
            id: uid('ev'),
            title: nextCardTitle(),
            date: '',
            time: '',
            body: '',
            entities: '',
            source: '',
            evidence: '',
            image: '',
            createdAt: new Date().toISOString(),
            links: [],
            pinX: pinX,
            side: side === 1 ? 1 : -1,
            pinned: true,
            spawn: !!spawn,
            mini: false
        };
        data.timeline.push(ev);
        selectedEvent = ev.id;
        hideTlFollow();
        renderTimeline();
        schedulePersist();
        requestAnimationFrame(function () {
            const node = document.querySelector('[data-event="' + ev.id + '"]');
            if (node && spawn) {
                node.addEventListener('animationend', function () {
                    node.classList.remove('is-spawn');
                    stackTimelineStems();
                    drawTimelineAxis();
                }, { once: true });
            }
            const title = node && node.querySelector('[data-tl-field="title"]');
            if (title) title.focus();
        });
        return ev;
    }

    function attachTimelineImage(id, src) {
        let rec = (data.timeline || []).find(function (item) { return item.id === id; });
        if (!rec) {
            rec = addEventAt(tlAimX, -1, true);
        }
        if (!rec || !src) return rec;
        rememberTimeline();
        rec.image = src;
        renderTimeline();
        schedulePersist();
        return rec;
    }

    function expandTimelineImage(src) {
        if (!src) return;
        const viewer = $('mediaViewer');
        const image = $('mediaImage');
        const card = $('mediaAudioCard');
        const audio = $('mediaAudio');
        if (!viewer || !image) return;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
        }
        if (card) card.hidden = true;
        image.hidden = false;
        image.src = src;
        viewer.hidden = false;
    }

    function recenterTimeline() {
        const view = $('timelineView');
        const cam = timelineCam();
        const z = 1;
        const y = view ? Math.round(view.clientHeight / 2 - TL_AXIS_Y) : 40;
        cam.x = 48;
        cam.y = y;
        cam.z = z;
        applyTimelineCam();
        drawTimelineAxis();
    }

    function openEventEditor(id) {
        const sheet = $('eventSheet');
        const ev = id ? (data.timeline || []).find(function (item) { return item.id === id; }) : null;
        $('eventEditId').value = ev ? ev.id : '';
        $('eventTitle').value = ev ? (ev.title || '') : '';
        $('eventDate').value = ev ? (ev.date || '') : '';
        syncEventDateBtn();
        $('eventTime').value = ev ? (ev.time || '') : '';
        $('eventBody').value = ev ? (ev.body || '') : '';
        $('eventEntities').value = ev ? (ev.entities || '') : '';
        $('eventSource').value = ev ? (ev.source || '') : '';
        $('eventEvidence').value = ev ? (ev.evidence || '') : '';
        $('eventImage').value = ev ? (ev.image || '') : '';
        fillEventImagePick();
        showSheet(sheet);
        const title = $('eventTitle');
        if (title) title.focus();
    }

    function fillEventImagePick() {
        const sel = $('eventImagePick');
        if (!sel) return;
        const items = imageItems();
        sel.innerHTML = '<option value="">Attach a case photo…</option>' + items.map(function (item, i) {
            return '<option value="' + esc(item.src) + '">Photo ' + (i + 1) + (item.primary ? ' (primary)' : '') + '</option>';
        }).join('');
    }

    function saveEventEditor() {
        const id = $('eventEditId').value;
        const payload = {
            id: id || uid('ev'),
            title: $('eventTitle').value.trim(),
            date: $('eventDate').value,
            time: $('eventTime').value,
            body: $('eventBody').value.trim(),
            entities: $('eventEntities').value.trim(),
            source: $('eventSource').value.trim(),
            evidence: $('eventEvidence').value.trim(),
            image: $('eventImage').value.trim(),
            createdAt: ''
        };
        if (!payload.title && !payload.body && !payload.date) return;
        rememberTimeline();
        const existing = (data.timeline || []).find(function (item) { return item.id === payload.id; });
        if (existing) {
            payload.createdAt = existing.createdAt || new Date().toISOString();
            payload.links = existing.links || [];
            payload.pinX = existing.pinX;
            payload.side = existing.side;
            payload.pinY = existing.pinY;
            payload.pinned = existing.pinned;
            payload.free = existing.free;
            payload.mini = existing.mini;
            payload.locked = existing.locked;
            payload.titleH = existing.titleH;
            payload.noteH = existing.noteH;
            payload.w = existing.w;
            payload.h = existing.h;
            Object.assign(existing, payload);
        } else {
            if (!payload.title) payload.title = nextCardTitle();
            payload.createdAt = new Date().toISOString();
            payload.links = [];
            payload.pinned = false;
            data.timeline.push(payload);
        }
        hideSheet($('eventSheet'));
        selectedEvent = payload.id;
        renderTimeline();
        schedulePersist();
    }

    function markTimelineStemOut(id) {
        const svg = $('timelineAxis');
        if (!svg || !id) return;
        const sel = '[data-tl-stem="' + id + '"], [data-tl-pin="' + id + '"], [data-tl-pin-date="' + id + '"], [data-tl-link-a="' + id + '"], [data-tl-link-b="' + id + '"]';
        svg.querySelectorAll(sel).forEach(function (el) { el.classList.add('is-out'); });
    }

    function deleteEvent(id) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (node && node.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            data.timeline = (data.timeline || []).filter(function (item) { return item.id !== id; });
            data.timeline.forEach(function (item) {
                item.links = (item.links || []).filter(function (link) { return link.to !== id; });
            });
            if (selectedEvent === id) selectedEvent = '';
            if (connectFrom === id) connectFrom = '';
            renderTimeline();
            schedulePersist();
        }
        if (node && !reduceMotion()) {
            node.classList.add('is-out');
            markTimelineStemOut(id);
            afterEase(node, commit);
            return;
        }
        commit();
    }

    function toggleConnect(id) {
        if (connectFrom && connectFrom !== id) {
            rememberTimeline();
            const from = (data.timeline || []).find(function (item) { return item.id === connectFrom; });
            if (from) {
                from.links = from.links || [];
                if (!from.links.some(function (link) { return link.to === id; })) {
                    from.links.push({ to: id, label: '' });
                }
            }
            connectFrom = '';
            renderTimeline();
            schedulePersist();
            return;
        }
        connectFrom = connectFrom === id ? '' : id;
        timelineConnectOn = !!connectFrom;
        renderTimeline();
    }

    function findTimelineEvent(id) {
        return (data.timeline || []).find(function (item) { return item.id === id; }) || null;
    }

    function cloneTimelinePayload(ev, dx, dy) {
        const copy = JSON.parse(JSON.stringify(ev || {}));
        copy.id = uid('ev');
        copy.createdAt = new Date().toISOString();
        copy.links = [];
        copy.locked = false;
        copy.pinned = true;
        copy.free = true;
        copy.spawn = true;
        copy.pinX = clampTimelineX((Number(ev && ev.pinX) || TL_ORIGIN_X + 160) + (dx == null ? 48 : dx));
        copy.pinY = (Number(ev && ev.pinY) || TL_AXIS_Y - 180) + (dy == null ? 28 : dy);
        return copy;
    }

    function copyTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        tlClip = JSON.parse(JSON.stringify(rec));
    }

    function cutTimelineEvent(id) {
        copyTimelineEvent(id);
        deleteEvent(id);
    }

    function pasteTimelineEvent() {
        if (!tlClip) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(tlClip);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        if (tlDropAt) {
            copy.pinX = clampTimelineX(tlDropAt.x);
            copy.pinY = tlDropAt.y;
        }
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function duplicateTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(rec);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function clearTimelineLinks(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.links = [];
        (data.timeline || []).forEach(function (other) {
            other.links = (other.links || []).filter(function (link) { return link.to !== id; });
        });
        renderTimeline();
        schedulePersist();
    }

    function flipTimelineSide(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.side = rec.side === 1 ? -1 : 1;
        rec.free = true;
        rec.pinned = true;
        const el = document.querySelector('#timelineList [data-event="' + id + '"]');
        const h = el ? el.offsetHeight : 128;
        rec.pinY = rec.side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
        renderTimeline();
        schedulePersist();
    }

    function layerTimelineEvent(id, dir) {
        const list = data.timeline || [];
        const i = list.findIndex(function (item) { return item.id === id; });
        if (i < 0) return;
        rememberTimeline();
        const rec = list.splice(i, 1)[0];
        if (dir === 'front') list.push(rec);
        else if (dir === 'back') list.unshift(rec);
        else if (dir === 'up' || dir === 'forward') list.splice(Math.min(list.length, i + 1), 0, rec);
        else list.splice(Math.max(0, i - 1), 0, rec);
        selectedEvent = id;
        renderTimeline();
        schedulePersist();
    }

    function toggleTimelineLock(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.locked = !rec.locked;
        renderTimeline();
        schedulePersist();
    }

    function hideTimelineMenu() {
        const menu = $('timelineMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        tlMenuId = '';
    }

    function placeTimelineMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        const rect = view.getBoundingClientRect();
        const maxH = Math.max(160, rect.height - 16);
        menu.style.maxHeight = maxH + 'px';
        const left = Math.min(Math.max(8, clientX - rect.left), Math.max(8, rect.width - 248));
        const menuH = Math.min(menu.scrollHeight || 320, maxH);
        const top = Math.min(Math.max(8, clientY - rect.top), Math.max(8, rect.height - menuH - 8));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function placeCardAtDrop(side) {
        const at = tlDropAt || { x: tlAimX, y: TL_AXIS_Y };
        const useSide = side == null ? (at.y >= TL_AXIS_Y ? 1 : -1) : side;
        const ev = addEventAt(at.x, useSide, true);
        if (!ev) return null;
        ev.free = true;
        ev.pinned = true;
        ev.pinY = at.y;
        renderTimeline();
        return ev;
    }

    function showTimelineCanvasMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        tlMenuId = '';
        selectedEvent = '';
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        let html = '';
        html += menuItem('data-tl-ctx="add"', 'note', 'Add card');
        html += menuItem('data-tl-ctx="add-above"', 'up', 'Add card above');
        html += menuItem('data-tl-ctx="add-below"', 'down', 'Add card below');
        html += menuItem('data-tl-ctx="add-image"', 'image', 'Insert image');
        html += '<hr>';
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', timelineConnectOn ? 'Stop connecting' : 'Connect cards');
        html += '<hr>';
        html += menuItem('data-tl-ctx="recenter"', 'recenter', 'Recenter');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function showTimelineCardMenu(clientX, clientY, id) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        const rec = findTimelineEvent(id);
        if (!menu || !view || !rec) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        selectedEvent = id;
        tlMenuId = id;
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
            el.classList.toggle('is-on', el.getAttribute('data-event') === id);
        });
        let html = '';
        html += menuItem('data-tl-ctx="cut"', 'cut', 'Cut', '<span class="board-kbd">Ctrl+X</span>');
        html += menuItem('data-tl-ctx="copy"', 'copy', 'Copy', '<span class="board-kbd">Ctrl+C</span>');
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += '<hr>';
        html += menuItem('data-tl-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', connectFrom === id ? 'Pick second card' : 'Connect cards');
        html += menuItem('data-tl-ctx="clear-links"', 'clear-links', 'Clear connections');
        html += '<hr>';
        html += menuItem('data-tl-ctx="date"', 'calendar', rec.date ? 'Change date' : 'Add date');
        html += menuItem('data-tl-ctx="time"', 'clock', rec.time ? 'Change time' : 'Add time');
        html += menuItem('data-tl-ctx="image"', 'image', rec.image ? 'Replace image' : 'Attach image');
        html += menuItem('data-tl-ctx="mini"', rec.mini ? 'expand' : 'mini', rec.mini ? 'Expand' : 'Minimize');
        html += menuItem('data-tl-ctx="flip"', 'flip-v', rec.side === 1 ? 'Move above axis' : 'Move below axis');
        html += '<hr>';
        html += menuItem('data-tl-ctx="up"', 'up', 'Bring forward');
        html += menuItem('data-tl-ctx="down"', 'down', 'Send backward');
        html += menuItem('data-tl-ctx="front"', 'front', 'Bring to front');
        html += menuItem('data-tl-ctx="back"', 'back', 'Send to back');
        html += '<hr>';
        html += menuItem('data-tl-ctx="lock"', rec.locked ? 'unlock' : 'lock', rec.locked ? 'Unlock' : 'Lock');
        html += '<hr>' + menuItem('data-tl-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function runTimelineMenu(act, id) {
        hideTimelineMenu();
        if (!act) return;
        if (act === 'add' || act === 'add-above' || act === 'add-below') {
            const side = act === 'add-above' ? -1 : act === 'add-below' ? 1 : null;
            placeCardAtDrop(side);
            return;
        }
        if (act === 'add-image') {
            const ev = placeCardAtDrop(null);
            if (ev) {
                timelinePhotoId = ev.id;
                const input = $('timelineImageFile');
                if (input) input.click();
            }
            return;
        }
        if (act === 'recenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        if (act === 'cut' && id) cutTimelineEvent(id);
        if (act === 'copy' && id) copyTimelineEvent(id);
        if (act === 'paste') pasteTimelineEvent();
        if (act === 'duplicate' && id) duplicateTimelineEvent(id);
        if (act === 'connect') {
            if (id) toggleConnect(id);
            else {
                timelineConnectOn = !timelineConnectOn;
                if (!timelineConnectOn) connectFrom = '';
                applyTimelineCam();
                renderTimeline();
            }
        }
        if (act === 'clear-links' && id) clearTimelineLinks(id);
        if (act === 'date' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
        }
        if (act === 'time' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-time]');
            if (btn) openTimePicker(btn);
        }
        if (act === 'image' && id) {
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        }
        if (act === 'mini' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] [data-tl-mini]');
            if (btn) btn.click();
        }
        if (act === 'flip' && id) flipTimelineSide(id);
        if (act === 'up' && id) layerTimelineEvent(id, 'up');
        if (act === 'down' && id) layerTimelineEvent(id, 'down');
        if (act === 'front' && id) layerTimelineEvent(id, 'front');
        if (act === 'back' && id) layerTimelineEvent(id, 'back');
        if (act === 'lock' && id) toggleTimelineLock(id);
        if (act === 'delete' && id) deleteEvent(id);
    }
