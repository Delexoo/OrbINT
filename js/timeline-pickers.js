/* Timeline calendar and time picker */
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

