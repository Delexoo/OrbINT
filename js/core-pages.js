/* Case snapshot, page switch, dock, render all */
    function snapshot() {
        return JSON.parse(JSON.stringify(data));
    }

    function load(raw) {
        const next = emptyInvestigation();
        if (raw && typeof raw === 'object') {
            next.timeline = Array.isArray(raw.timeline) ? raw.timeline : [];
            if (raw.timelineView && typeof raw.timelineView === 'object') {
                next.timelineView.x = Number(raw.timelineView.x) || 0;
                next.timelineView.y = Number(raw.timelineView.y) || 0;
                next.timelineView.z = Number(raw.timelineView.z) > 0 ? Number(raw.timelineView.z) : 1;
            }
            next.evidence = Array.isArray(raw.evidence) ? raw.evidence : [];
            if (raw.whiteboard && typeof raw.whiteboard === 'object') {
                next.whiteboard.x = Number(raw.whiteboard.x) || 0;
                next.whiteboard.y = Number(raw.whiteboard.y) || 0;
                next.whiteboard.z = Number(raw.whiteboard.z) > 0 ? Number(raw.whiteboard.z) : 1;
                next.whiteboard.nodes = (Array.isArray(raw.whiteboard.nodes) ? raw.whiteboard.nodes : []).map(normalizeBoardNode);
                next.whiteboard.links = (Array.isArray(raw.whiteboard.links) ? raw.whiteboard.links : []).map(normalizeLink);
            }
            if (raw.notepad && typeof raw.notepad === 'object') {
                next.notepad.notes = (Array.isArray(raw.notepad.notes) ? raw.notepad.notes : []).map(normalizeNote);
                next.notepad.active = raw.notepad.active || (next.notepad.notes[0] && next.notepad.notes[0].id) || '';
                const ids = {};
                next.notepad.notes.forEach(function (note) { ids[note.id] = true; });
                next.notepad.links = (Array.isArray(raw.notepad.links) ? raw.notepad.links : []).map(normalizeNoteLink).filter(function (link) {
                    return ids[link.from] && ids[link.to];
                });
                next.notepad.layout = normalizeNoteLayout(raw.notepad.layout);
                const pan = raw.notepad.pan;
                next.notepad.pan = {
                    x: Number(pan && pan.x) || 0,
                    y: Number(pan && pan.y) || 0
                };
            }
            if (raw.flowchart && typeof raw.flowchart === 'object') {
                next.flowchart.preset = raw.flowchart.preset || 'username';
                next.flowchart.checks = raw.flowchart.checks && typeof raw.flowchart.checks === 'object' ? raw.flowchart.checks : {};
                next.flowchart.notes = raw.flowchart.notes && typeof raw.flowchart.notes === 'object' ? raw.flowchart.notes : {};
            }
            next.intel.host = (raw.intel && raw.intel.host) || '';
            const harvestedIn = (raw.harvester && typeof raw.harvester === 'object')
                ? raw.harvester
                : (raw.compiler && typeof raw.compiler === 'object')
                    ? raw.compiler
                    : null;
            if (harvestedIn) {
                next.harvester.files = Array.isArray(harvestedIn.files) ? harvestedIn.files : [];
                next.harvester.hits = Array.isArray(harvestedIn.hits) ? harvestedIn.hits : [];
                next.harvester.ready = !!harvestedIn.ready;
                next.harvester.at = harvestedIn.at || '';
                next.harvester.view = harvestedIn.view === 'original' || harvestedIn.view === 'stripped'
                    ? harvestedIn.view
                    : 'split';
                const split = Number(harvestedIn.split);
                next.harvester.split = isFinite(split) ? Math.min(78, Math.max(22, split)) : 50;
            }
        }
        data = next;
        selectedEvent = '';
        connectFrom = '';
        boardConnect = '';
        boardConnectPort = '';
        boardSelected = '';
        boardLinkSelected = '';
        boardPicked = [];
        boardPickedLinks = [];
        boardUndo = [];
        boardRedo = [];
        tlUndo = [];
        tlRedo = [];
        renderAll();
    }

    function reduceMotion() {
        try {
            return document.documentElement.classList.contains('reduce-motion') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (error) {
            return false;
        }
    }

    function pagePane(id) {
        return id === 'orbit' ? $('mapStage') : $('page-' + id);
    }

    function pageIndex(id) {
        const i = PAGES.findIndex(function (item) { return item.id === id; });
        return i < 0 ? 0 : i;
    }

    function clearPageAnim(el) {
        if (!el) return;
        el.classList.remove('is-page-enter', 'is-page-leave', 'from-left', 'from-right', 'to-left', 'to-right');
    }

    let splitOn = false;
    let splitRatio = 46;

    function readSplitRatio() {
        try {
            const n = Number(localStorage.getItem('orbint-split-ratio'));
            if (n >= 28 && n <= 72) return n;
        } catch (error) {}
        return 46;
    }

    function splitSidePage() {
        let side = 'operations';
        try {
            const saved = localStorage.getItem('orbint-split-page');
            if (saved && saved !== 'orbit' && PAGES.some(function (item) { return item.id === saved; })) side = saved;
        } catch (error) {}
        if (page && page !== 'orbit') side = page;
        return side;
    }

    function paintSplitButton() {
        const on = splitOn;
        const tip = on ? 'Close split' : 'Split screen';
        const btn = $('dockSplit');
        if (btn) {
            btn.classList.toggle('is-on', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.setAttribute('data-tip', tip);
            btn.setAttribute('aria-label', tip);
        }
        const phone = $('phoneSplit');
        if (phone) phone.textContent = tip;
    }

    function refreshSplitLayout() {
        if (page === 'timeline') renderTimeline();
        if (page === 'whiteboard') renderWhiteboard();
        if (page === 'notepad') renderNotepad();
        if (page === 'datasheet') sizeDatasheet();
        if (typeof opsSyncMapSize === 'function') opsSyncMapSize();
        window.dispatchEvent(new Event('resize'));
    }

    function ensureSplitBar() {
        let bar = $('splitBar');
        if (bar) return bar;
        const stage = document.querySelector('.work-stage');
        if (!stage) return null;
        bar = document.createElement('div');
        bar.id = 'splitBar';
        bar.className = 'split-bar';
        bar.hidden = true;
        bar.tabIndex = 0;
        bar.setAttribute('role', 'separator');
        bar.setAttribute('aria-orientation', 'vertical');
        bar.setAttribute('aria-label', 'Resize split');
        bar.setAttribute('aria-valuemin', '28');
        bar.setAttribute('aria-valuemax', '72');
        stage.appendChild(bar);
        function setRatio(next) {
            splitRatio = Math.min(72, Math.max(28, next));
            document.body.style.setProperty('--split-w', splitRatio + '%');
            bar.setAttribute('aria-valuenow', String(Math.round(splitRatio)));
        }
        function narrow() {
            try { return window.matchMedia('(max-width: 820px)').matches; } catch (error) { return false; }
        }
        bar.addEventListener('pointerdown', function (event) {
            if (!splitOn || event.button) return;
            event.preventDefault();
            bar.setPointerCapture(event.pointerId);
            const move = function (ev) {
                const rect = stage.getBoundingClientRect();
                const ratio = narrow()
                    ? ((ev.clientY - rect.top) / rect.height) * 100
                    : ((ev.clientX - rect.left) / rect.width) * 100;
                setRatio(ratio);
            };
            const up = function (ev) {
                if (bar.hasPointerCapture(ev.pointerId)) bar.releasePointerCapture(ev.pointerId);
                bar.removeEventListener('pointermove', move);
                bar.removeEventListener('pointerup', up);
                bar.removeEventListener('pointercancel', up);
                try { localStorage.setItem('orbint-split-ratio', String(Math.round(splitRatio))); } catch (error) {}
                refreshSplitLayout();
            };
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
            bar.addEventListener('pointercancel', up);
        });
        bar.addEventListener('dblclick', function () {
            setRatio(46);
            try { localStorage.setItem('orbint-split-ratio', '46'); } catch (error) {}
            refreshSplitLayout();
        });
        bar.addEventListener('keydown', function (event) {
            if (!splitOn) return;
            const step = event.shiftKey ? 8 : 3;
            const key = event.key;
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Home' && key !== 'End') return;
            event.preventDefault();
            if (key === 'Home') setRatio(28);
            else if (key === 'End') setRatio(72);
            else if (key === 'ArrowLeft' || key === 'ArrowUp') setRatio(splitRatio - step);
            else setRatio(splitRatio + step);
            try { localStorage.setItem('orbint-split-ratio', String(Math.round(splitRatio))); } catch (error) {}
            refreshSplitLayout();
        });
        return bar;
    }

    function applySplit() {
        document.body.classList.toggle('split-orbit', splitOn);
        document.body.style.setProperty('--split-w', splitRatio + '%');
        const bar = ensureSplitBar();
        if (bar) {
            bar.hidden = !splitOn;
            bar.setAttribute('aria-valuenow', String(Math.round(splitRatio)));
            bar.setAttribute('aria-orientation', (function () {
                try { return window.matchMedia('(max-width: 820px)').matches ? 'horizontal' : 'vertical'; } catch (error) { return 'vertical'; }
            })());
        }
        paintSplitButton();
        try { localStorage.setItem('orbint-split', splitOn ? '1' : '0'); } catch (error) {}
    }

    function restoreSplit(savedPage) {
        splitRatio = readSplitRatio();
        splitOn = false;
        try {
            splitOn = localStorage.getItem('orbint-split') === '1' && !!savedPage && savedPage !== 'orbit' && savedPage !== 'guide';
        } catch (error) {}
        applySplit();
    }

    function toggleSplit() {
        if (splitOn) {
            splitOn = false;
            applySplit();
            setPage('orbit');
            return;
        }
        splitRatio = readSplitRatio();
        const side = splitSidePage();
        splitOn = true;
        applySplit();
        if (page === side) {
            const map = $('mapStage');
            if (map) map.setAttribute('aria-hidden', 'false');
            settlePages(page);
            refreshSplitLayout();
            return;
        }
        setPage(side);
        refreshSplitLayout();
    }

    function settlePages(activeId) {
        PAGES.forEach(function (item) {
            const el = pagePane(item.id);
            if (!el) return;
            clearPageAnim(el);
            if (item.id === 'orbit') {
                el.setAttribute('aria-hidden', (activeId === 'orbit' || splitOn) ? 'false' : 'true');
                return;
            }
            el.hidden = item.id !== activeId;
        });
        if (activeId === 'datasheet') sizeDatasheet();
    }

    function setPage(id) {
        if (id === 'flowchart') id = 'whiteboard';
        if (id === 'analytics' || id === 'evidence') id = 'orbit';
        if (id === 'compiler') id = 'harvester';
        const next = PAGES.some(function (item) { return item.id === id; }) ? id : 'orbit';
        if (next === 'orbit' && splitOn) {
            splitOn = false;
            applySplit();
        }
        const prev = page;
        if (page === 'whiteboard' && next !== 'whiteboard') {
            hideBoardAddMenu();
            hideBoardMore();
            stopLaser(true);
        }
        if (next !== 'timeline') {
            closeCalendar();
            closeTimePicker();
            closeTlInfoPop();
        }
        page = next;
        document.body.setAttribute('data-page', page);
        document.body.classList.toggle('page-orbit', page === 'orbit');

        const skipAnim = !pageSwitchReady || prev === next || reduceMotion() || splitOn;
        const slideTab = pageSwitchReady && prev !== next;
        pageSwitchReady = true;
        if (pageAnimTimer) {
            clearTimeout(pageAnimTimer);
            pageAnimTimer = 0;
        }

        if (skipAnim) {
            settlePages(page);
        } else {
            const fromEl = pagePane(prev);
            const toEl = pagePane(next);
        PAGES.forEach(function (item) {
                if (item.id === prev || item.id === next) return;
                const el = pagePane(item.id);
            if (!el) return;
                clearPageAnim(el);
                if (item.id !== 'orbit') el.hidden = true;
            });
            if (fromEl) {
                clearPageAnim(fromEl);
                if (fromEl.id !== 'mapStage') fromEl.hidden = false;
            }
            if (toEl) {
                clearPageAnim(toEl);
                if (toEl.id !== 'mapStage') toEl.hidden = false;
            }
            const paint = function () {
                if (fromEl && toEl) {
                    void toEl.offsetWidth;
                    fromEl.classList.add('is-page-leave');
                    toEl.classList.add('is-page-enter');
                    pageAnimTimer = setTimeout(function () {
                        pageAnimTimer = 0;
                        settlePages(page);
                    }, PAGE_ANIM_MS);
                } else {
                    settlePages(page);
                }
            };
            if (document.startViewTransition) document.startViewTransition(paint);
            else paint();
        }

        const map = $('mapStage');
        if (map) map.setAttribute('aria-hidden', (page === 'orbit' || splitOn) ? 'false' : 'true');
        renderPageSwitch({ instant: !slideTab });
        syncDock();
        if (page === 'timeline') {
            renderTimeline();
            syncTimelineIsland();
        }
        if (page === 'whiteboard') renderWhiteboard();
        if (page === 'notepad') renderNotepad();
        if (page === 'harvester') renderHarvester();
        if (page === 'datasheet') renderDatasheet();
        if (page === 'operations') renderOperations();
        try {
            if (window.OrbINTSettings && OrbINTSettings.get('rememberPage') === false) {
                /* keep the in-memory page without writing it */
            } else {
                localStorage.setItem('orbint-page', page);
            }
            if (splitOn && page !== 'orbit') localStorage.setItem('orbint-split-page', page);
        } catch (error) {}
        paintSplitButton();
    }

    function currentPage() {
        return page;
    }

    function syncDock() {
        const add = $('dockAdd');
        const phone = $('phoneAdd');
        const connect = $('dockConnect');
        const labels = {
            orbit: 'Add field',
            timeline: 'Add event',
            whiteboard: 'Add shape',
            notepad: 'New note',
            harvester: 'Upload file',
            operations: 'Operations'
        };
        const label = labels[page] || labels.orbit;
        if (add) {
            add.setAttribute('data-tip', label);
            add.setAttribute('aria-label', label);
        }
        if (phone) phone.setAttribute('aria-label', label);
        if (connect) {
            connect.classList.toggle('is-on', !!timelineConnectOn);
            connect.setAttribute('data-tip', 'Connect cards');
            connect.setAttribute('aria-label', 'Connect cards');
        }
        if (typeof paintDatasheetSpoilers === 'function') paintDatasheetSpoilers();
        syncBoardHistory();
    }

    function dockAdd() {
        if (page === 'timeline') {
            const view = $('timelineView');
            const cam = timelineCam();
            const z = cam.z || 1;
            const mid = view ? ((view.clientWidth / 2) - cam.x) / z : 400;
            addEventAt(mid, -1);
            return true;
        }
        if (page === 'whiteboard') {
            const view = $('boardView');
            const board = data.whiteboard;
            const z = board.z || 1;
            const w = view ? view.clientWidth : 480;
            const h = view ? view.clientHeight : 320;
            addBoardNode(BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'square', {
                x: ((w / 2) - board.x) / z - 74,
                y: ((h / 2) - board.y) / z - 74
            });
            return true;
        }
        if (page === 'notepad') {
            addNotepadNote();
            return true;
        }
        if (page === 'harvester') {
            openHarvesterPicker();
            return true;
        }
        if (page === 'operations') return true;
        return false;
    }

    function dockConnect() {
        if (page === 'timeline') {
            timelineConnectOn = !timelineConnectOn;
            if (!timelineConnectOn) connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return true;
        }
        if (page === 'whiteboard') {
            boardTool = boardTool === 'connect' ? 'select' : 'connect';
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return true;
        }
        return false;
    }

    function isCompactNav() {
        try { return window.matchMedia('(max-width: 820px)').matches; } catch (error) { return false; }
    }

    function pageSwitchItems() {
        const items = PAGES.filter(function (item) { return item.id !== 'guide'; });
        if (!isCompactNav()) return items;
        return [{ id: 'casebook', label: 'Casebook' }].concat(items);
    }

    function pageSwitchActive() {
        if (isCompactNav() && document.body.classList.contains('panel-open')) return 'casebook';
        return page;
    }

    function syncPageSwitchThumb(instant) {
        const wrap = $('pageSwitch');
        if (!wrap) return;
        const thumb = wrap.querySelector('.page-switch-thumb');
        const on = wrap.querySelector('[aria-current="page"]');
        if (!thumb || !on) return;
        const x = on.offsetLeft;
        const w = on.offsetWidth;
        if (!(w > 0)) return;
        const snap = instant || reduceMotion();
        thumb.style.transform = '';
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = x + 'px';
        thumb.style.width = w + 'px';
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function renderPageSwitch(opts) {
        const wrap = $('pageSwitch');
        if (!wrap) return;
        opts = opts || {};
        const items = pageSwitchItems();
        const active = pageSwitchActive();
        const existing = wrap.querySelectorAll('[data-page]');
        const have = Array.prototype.map.call(existing, function (el) { return el.getAttribute('data-page'); }).join(',');
        const want = items.map(function (item) { return item.id; }).join(',');
        if (have !== want) {
            wrap.innerHTML = '<span class="page-switch-thumb" aria-hidden="true"></span>' + items.map(function (item) {
                const on = item.id === active;
                return '<button type="button" role="tab" data-page="' + item.id + '"' +
                    (on ? ' aria-current="page" aria-selected="true"' : ' aria-selected="false"') +
                    '>' + esc(item.label) + '</button>';
            }).join('');
            requestAnimationFrame(function () { syncPageSwitchThumb(true); });
            return;
        }
        items.forEach(function (item) {
            const btn = wrap.querySelector('[data-page="' + item.id + '"]');
            if (!btn) return;
            const on = item.id === active;
            if (on) {
                btn.setAttribute('aria-current', 'page');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.removeAttribute('aria-current');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        syncPageSwitchThumb(!!opts.instant);
    }

    function filedFacts() {
        const facts = (profile().facts) || {};
        const out = [];
        fields().forEach(function (field) {
            (facts[field.id] || []).forEach(function (item) {
                if (!item || !String(item.value || '').trim()) return;
                out.push({
                    id: field.id,
                    label: field.label,
                    group: field.group || '',
                    value: String(item.value).trim(),
                    platform: item.platform || '',
                    platformLabel: (platformById(item.platform) || {}).label || item.platformLabel || '',
                    source: item.source || '',
                    confidence: item.confidence || '',
                    method: item.method || '',
                    capturedAt: item.capturedAt || item.addedAt || ''
                });
            });
        });
        return out;
    }

    function subjectName() {
        return firstValue('name') || 'Anonymous';
    }

    function numberedTimeline() {
        const list = (data.timeline || []).slice().sort(function (a, b) {
            const da = String(a.date || '') + 'T' + String(a.time || '00:00');
            const db = String(b.date || '') + 'T' + String(b.time || '00:00');
            if (da !== db) return da < db ? -1 : 1;
            return String(a.createdAt || '') < String(b.createdAt || '') ? -1 : 1;
        });
        list.forEach(function (item, i) { item.n = i + 1; });
        return list;
    }

    function renderAll() {
        renderPageSwitch();
        renderTimeline();
        renderWhiteboard();
        renderNotepad();
        renderHarvester();
        renderDatasheet();
        renderOperations();
    }

