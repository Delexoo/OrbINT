/* Settings, empty case, save scheduling, undo stacks */
    function settingValue(key, fallback) {
        if (window.OrbINTSettings) {
            const value = OrbINTSettings.get(key);
            return value === undefined ? fallback : value;
        }
        try {
            const saved = JSON.parse(localStorage.getItem('orbint-settings') || '');
            if (saved && saved[key] !== undefined) return saved[key];
        } catch (error) {}
        return fallback;
    }

    let page = 'orbit';
    let pageAnimTimer = 0;
    let pageSwitchReady = false;
    const PAGE_ANIM_MS = 180;
    let data = emptyInvestigation();
    let persistTimer = 0;
    let selectedEvent = '';
    let connectFrom = '';
    let timelineConnectOn = false;
    let calState = null;
    let timeState = null;
    let infoState = null;
    let tlFocusAfter = null;
    let boardTool = 'select';
    let boardConnect = '';
    let boardConnectPort = '';
    let boardSelected = '';
    let boardLinkSelected = '';
    let boardDropAt = null;
    let boardPointerAt = { x: 180, y: 140 };
    let boardMenuMode = 'canvas';
    let boardDrift = { x: 0, y: 0 };
    let boardClip = null;
    let boardStyleClip = null;
    let boardPicked = [];
    let boardPickedLinks = [];
    let boardPaintFill = 'rgba(103,232,249,0.12)';
    let boardDrawToShape = false;
    let laserPts = [];
    let laserRaf = 0;
    let boardUndo = [];
    let boardRedo = [];
    let boardHistMerge = '';
    let boardHistMergeTimer = 0;
    let tlUndo = [];
    let tlRedo = [];
    let tlHistMerge = '';
    let tlHistMergeTimer = 0;
    let histQuiet = false;
    let timelineZoom = 1;
    let timelinePhotoId = '';
    let tlClip = null;
    let tlMenuId = '';
    let tlDropAt = null;
    let tlSizeObs = null;
    let tlIslandHide = 0;
    let domainBusy = false;

    function emptyInvestigation() {
        return {
            timeline: [],
            timelineView: { x: 48, y: 40, z: 1 },
            evidence: [],
            whiteboard: { x: 0, y: 0, z: 1, nodes: [], links: [], grid: true },
            notepad: { notes: [], active: '', links: [], layout: {}, pan: { x: 0, y: 0 } },
            harvester: { files: [], hits: [], ready: false, view: 'split', split: 50 },
            flowchart: { preset: 'username', checks: {}, notes: {} },
            intel: { host: '' }
        };
    }

    function uid(prefix) {
        return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function esc(text) {
        if (host && host.escapeHtml) return host.escapeHtml(text);
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function boardIcon(name) {
        const d = BOARD_ICONS[name];
        if (!d) return '';
        return '<svg class="board-mi" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
    }

    function menuItem(attrs, icon, label, extra) {
        return '<button type="button" ' + attrs + '>' + boardIcon(icon) + '<span>' + label + '</span>' + (extra || '') + '</button>';
    }

    function $(id) {
        return document.getElementById(id);
    }

    function profile() {
        return (host && host.getProfile && host.getProfile()) || { facts: {} };
    }

    function fields() {
        return (host && host.getFields && host.getFields()) || [];
    }

    function firstValue(id) {
        return (host && host.firstValue && host.firstValue(id)) || '';
    }

    function platformById(id) {
        return host && host.platformById ? host.platformById(id) : null;
    }

    function imageItems() {
        return (host && host.imageGalleryItems && host.imageGalleryItems()) || [];
    }

    function schedulePersist() {
        scheduleDatasheet();
        clearTimeout(persistTimer);
        persistTimer = setTimeout(function () {
            persistTimer = 0;
            if (host && host.save) host.save();
        }, 160);
    }

    function boardStateJson() {
        return JSON.stringify({
            nodes: data.whiteboard.nodes || [],
            links: data.whiteboard.links || [],
            selected: boardSelected || '',
            picked: boardPicked || [],
            link: boardLinkSelected || ''
        });
    }

    function timelineStateJson() {
        return JSON.stringify({
            events: data.timeline || [],
            view: data.timelineView || { x: 48, y: 40, z: 1 },
            selected: selectedEvent || '',
            connectFrom: connectFrom || '',
            connectOn: !!timelineConnectOn
        });
    }

    function syncBoardHistory() {
        const undo = $('dockUndo');
        const redo = $('dockRedo');
        if (page === 'whiteboard') {
            if (undo) {
                undo.disabled = !boardUndo.length;
                undo.setAttribute('data-tip', 'Undo (Ctrl+Z)');
                undo.setAttribute('aria-label', 'Undo');
            }
            if (redo) {
                redo.disabled = !boardRedo.length;
                redo.setAttribute('data-tip', 'Redo (Ctrl+Y)');
                redo.setAttribute('aria-label', 'Redo');
            }
            return;
        }
        if (page === 'timeline') {
            if (undo) {
                undo.disabled = !tlUndo.length;
                undo.setAttribute('data-tip', 'Undo (Ctrl+Z)');
                undo.setAttribute('aria-label', 'Undo');
            }
            if (redo) {
                redo.disabled = !tlRedo.length;
                redo.setAttribute('data-tip', 'Redo (Ctrl+Y)');
                redo.setAttribute('aria-label', 'Redo');
            }
            return;
        }
        window.dispatchEvent(new CustomEvent('orbint-history'));
    }

    function rememberTimeline(mergeKey) {
        if (histQuiet) return;
        const snap = timelineStateJson();
        if (mergeKey && tlHistMerge === mergeKey) {
            syncBoardHistory();
            return;
        }
        if (tlUndo.length && tlUndo[tlUndo.length - 1] === snap) {
            tlHistMerge = mergeKey || '';
            syncBoardHistory();
            return;
        }
        tlUndo.push(snap);
        if (tlUndo.length > 100) tlUndo.shift();
        tlRedo = [];
        tlHistMerge = mergeKey || '';
        if (tlHistMergeTimer) clearTimeout(tlHistMergeTimer);
        if (mergeKey) {
            tlHistMergeTimer = setTimeout(function () { tlHistMerge = ''; }, 900);
        }
        syncBoardHistory();
    }

    function applyTimelineSnapshot(raw) {
        const prev = typeof raw === 'string' ? JSON.parse(raw) : raw;
        histQuiet = true;
        data.timeline = JSON.parse(JSON.stringify(prev.events || []));
        if (prev.view && typeof prev.view === 'object') {
            data.timelineView = {
                x: Number(prev.view.x) || 0,
                y: Number(prev.view.y) || 0,
                z: Number(prev.view.z) > 0 ? Number(prev.view.z) : 1
            };
        }
        selectedEvent = prev.selected || '';
        connectFrom = prev.connectFrom || '';
        timelineConnectOn = !!prev.connectOn;
        renderTimeline();
        schedulePersist();
        histQuiet = false;
        syncBoardHistory();
    }

    function undoTimeline() {
        if (!tlUndo.length) return;
        tlHistMerge = '';
        tlRedo.push(timelineStateJson());
        applyTimelineSnapshot(tlUndo.pop());
    }

    function redoTimeline() {
        if (!tlRedo.length) return;
        tlHistMerge = '';
        tlUndo.push(timelineStateJson());
        applyTimelineSnapshot(tlRedo.pop());
    }

    function rememberBoard(mergeKey) {
        if (histQuiet) return;
        const snap = boardStateJson();
        if (mergeKey && boardHistMerge === mergeKey) {
            syncBoardHistory();
            return;
        }
        if (boardUndo.length && boardUndo[boardUndo.length - 1] === snap) {
            boardHistMerge = mergeKey || '';
            syncBoardHistory();
            return;
        }
        boardUndo.push(snap);
        if (boardUndo.length > 100) boardUndo.shift();
        boardRedo = [];
        boardHistMerge = mergeKey || '';
        if (boardHistMergeTimer) clearTimeout(boardHistMergeTimer);
        if (mergeKey) {
            boardHistMergeTimer = setTimeout(function () { boardHistMerge = ''; }, 900);
        }
        syncBoardHistory();
    }

    function applyBoardSnapshot(raw) {
        const prev = typeof raw === 'string' ? JSON.parse(raw) : raw;
        data.whiteboard.nodes = (prev.nodes || []).map(normalizeBoardNode);
        data.whiteboard.links = (prev.links || []).map(normalizeLink);
        boardSelected = prev.selected || '';
        boardPicked = Array.isArray(prev.picked) && prev.picked.length ? prev.picked.slice() : (boardSelected ? [boardSelected] : []);
        boardLinkSelected = prev.link || '';
        if (boardSelected && !findBoardNode(boardSelected)) {
            boardSelected = '';
            boardPicked = [];
        }
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
        syncBoardHistory();
    }

    function undoBoard() {
        if (!boardUndo.length) return;
        boardHistMerge = '';
        boardRedo.push(boardStateJson());
        applyBoardSnapshot(boardUndo.pop());
    }

    function redoBoard() {
        if (!boardRedo.length) return;
        boardHistMerge = '';
        boardUndo.push(boardStateJson());
        applyBoardSnapshot(boardRedo.pop());
    }

