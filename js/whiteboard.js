/* Whiteboard page */

    function syncBoardToolThumb(instant) {
        const bar = document.querySelector('.board-toolbar');
        if (!bar) return;
        let thumb = bar.querySelector('.board-tool-thumb');
        if (!thumb) {
            thumb = document.createElement('span');
            thumb.className = 'board-tool-thumb';
            thumb.setAttribute('aria-hidden', 'true');
            bar.insertBefore(thumb, bar.firstChild);
            instant = true;
        }
        let on = bar.querySelector('[data-board-tool].is-on');
        if (!on) on = bar.querySelector('[data-board-more]');
        if (!on) {
            thumb.style.opacity = '0';
            return;
        }
        const x = on.offsetLeft;
        const y = on.offsetTop;
        const w = on.offsetWidth;
        const h = on.offsetHeight;
        if (!(w > 0)) return;
        const snap = instant || reduceMotion() || !thumb.style.width;
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = x + 'px';
        thumb.style.top = y + 'px';
        thumb.style.width = w + 'px';
        thumb.style.height = h + 'px';
        thumb.style.opacity = '1';
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function syncBoardTools() {
        document.querySelectorAll('[data-board-tool]').forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-board-tool') === boardTool);
        });
        const lockBtn = document.querySelector('[data-board-lock]');
        if (lockBtn) lockBtn.classList.toggle('is-on', boardToolLock);
        const presetBtn = document.querySelector('[data-board-presets]');
        const presetSheet = $('boardPresetSheet');
        if (presetBtn) presetBtn.classList.toggle('is-on', !!(presetSheet && !presetSheet.hidden));
        const view = $('boardView');
        if (view) {
            view.classList.toggle('is-connect', boardTool === 'connect');
            view.classList.toggle('is-draw', BOARD_PLACE.indexOf(boardTool) >= 0 || boardTool === 'draw');
            view.classList.toggle('is-erase', boardTool === 'eraser');
            view.classList.toggle('is-laser', boardTool === 'laser');
            view.classList.toggle('is-lasso', boardTool === 'lasso');
            view.classList.toggle('is-bucket', boardTool === 'bucket');
            view.classList.toggle('is-pan', boardTool === 'pan');
            view.classList.toggle('is-select', boardTool === 'select' || !boardTool);
            view.classList.toggle('is-plain', data.whiteboard.grid === false);
        }
        if (boardTool !== 'laser') stopLaser(true);
        syncBoardToolThumb(false);
    }

    function boardHintText() {
        if (boardTool === 'connect') return 'Drag a point onto another shape.';
        if (boardTool === 'arrow' || boardTool === 'line') return 'Drag from one point to another. Drop an end on a shape to attach.';
        if (boardTool === 'draw') return boardDrawToShape ? 'Draw a shape. Release to snap it.' : 'Draw freely. Release to finish.';
        if (boardTool === 'eraser') return 'Click or drag to erase.';
        if (boardTool === 'laser') return 'Laser stays on until you pick another tool.';
        if (boardTool === 'lasso') return 'Drag around shapes to select them.';
        if (boardTool === 'bucket') return 'Click a shape to fill it.';
        if (boardTool === 'note') return 'Click or drag to place a sticky note.';
        if (boardTool === 'frame') return 'Drag to place a frame.';
        if (boardTool === 'embed') return 'Drag a frame, then paste a page URL.';
        return '';
    }

    function renderWhiteboard() {
        const stage = $('boardStage');
        const links = $('boardLinks');
        if (!stage) return;
        const board = data.whiteboard;
        stage.style.transform = 'translate(' + board.x + 'px,' + board.y + 'px) scale(' + board.z + ')';
        stage.style.setProperty('--wb-z', board.z || 1);
        const nodes = board.nodes || [];
        nodes.forEach(function (n) {
            if (isStrokeRec(n)) {
                followStrokeBinds(n);
                layoutStroke(n);
            }
        });
        stage.querySelectorAll('.wb-node').forEach(function (el) { el.remove(); });
        nodes.forEach(function (raw) {
            const node = normalizeBoardNode(raw);
            const el = document.createElement('article');
            const shape = node.shape || 'process';
            const ink = shape === 'draw' || node.type === 'draw';
            const stroke = isStrokeShape(shape);
            const geo = isGeoShape(shape) && node.type !== 'text' && !ink && !stroke;
            el.className = 'wb-node' +
                (geo ? ' is-geo' : '') +
                (ink ? ' is-ink' : '') +
                (node.type === 'text' ? ' is-text' : '') +
                (node.type === 'note' ? ' is-sticky' : '') +
                (node.type === 'image' ? ' is-image' : '') +
                (node.type === 'embed' ? ' is-embed' : '') +
                (stroke ? ' is-stroke' : '') +
                (node.type === 'image' && !node.src ? ' is-empty' : '') +
                ((boardPicked.length ? boardPicked : [boardSelected]).indexOf(node.id) >= 0 ? ' is-on' : '') +
                (boardConnect === node.id ? ' is-from' : '') +
                (node.done ? ' is-done' : '') +
                (node.locked ? ' is-locked' : '') +
                (node.flipX && !stroke ? ' is-flip-x' : '') +
                (node.flipY && !stroke ? ' is-flip-y' : '');
            el.dataset.node = node.id;
            el.dataset.shape = shape;
            el.style.setProperty('--tone', typeMeta(node.type).color);
            let copy = '';
            if (ink) {
                copy = '';
            } else if (node.type === 'embed' && node.src) {
                copy = '<iframe src="' + esc(node.src) + '" sandbox="allow-scripts allow-popups allow-forms" referrerpolicy="no-referrer" title=""></iframe>';
            } else if (node.type === 'embed') {
                copy = '<div class="wb-image-slot">' +
                    '<input type="url" data-wb-embed-url placeholder="Paste page URL">' +
                    '</div>';
            } else if (node.type === 'image' && node.src) {
                copy = '<img src="' + esc(node.src) + '" alt="">';
            } else if (node.type === 'image') {
                copy = '<div class="wb-image-slot">' +
                    '<button type="button" data-wb-upload>Upload</button>' +
                    '<input type="url" data-wb-image-url placeholder="Paste image URL">' +
                    '</div>';
            } else {
                const img = node.shape === 'document' && node.src ? '<img src="' + esc(node.src) + '" alt="">' : '';
                const href = node.href ? '<p class="wb-href">' + esc(node.href) + '</p>' : '';
                copy = img +
                    '<div class="wb-text" data-wb-text>' +
                    (node.title ? '<h3>' + esc(node.title) + '</h3>' : '') +
                    (node.body ? '<p>' + esc(node.body) + '</p>' : '') +
                    '</div>' + href;
            }
            el.innerHTML = (ink ? inkChrome(node) : (stroke || geo ? shapeChrome(shape, node) : '')) + (stroke ? '' : '<div class="wb-face"><div class="wb-copy">' +
                copy +
                '</div></div>') + portMarkup(shape) + (boardSelected === node.id && !node.locked && boardTool !== 'connect' ? handleMarkup(shape, node) : '');
            applyNodeBox(el, node);
            stage.appendChild(el);
            if (node.type === 'image' && node.src && !(Number(node.ratio) > 0)) fitImageNode(node, node.src);
        });
        const empty = $('boardEmpty');
        if (empty) empty.hidden = nodes.length > 0 || (board.links || []).length > 0;
        const hint = $('boardHint');
        if (hint) {
            const text = boardHintText();
            hint.hidden = !text;
            hint.textContent = text;
        }
        drawBoardLinks(links, board);
        syncBoardTools();
        syncBoardInspect();
        syncBoardGroupBox();
        syncDock();
        const play = $('boardPlaybook');
        if (play && data.flowchart && data.flowchart.preset && play.value !== data.flowchart.preset) {
            play.value = data.flowchart.preset;
        }
    }

    function nodeAnchor(node, toward) {
        return portPoint(node, inferPort(node, toward));
    }

    function drawBoardLinks(svg, board) {
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.setAttribute('overflow', 'visible');
        svg.classList.toggle('is-edit', !!boardLinkSelected);
        const list = board.links || [];
        list.forEach(function (link, i) { list[i] = normalizeLink(link); });
        const markers = {};
        const paths = ['<defs>'];
        list.forEach(function (link) {
            const color = link.stroke || '#d4d4d8';
            const key = markerKey(color);
            if (markers[key]) return;
            markers[key] = true;
            paths.push('<marker id="' + key + '" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0.6 L8 4 L0 7.4 z" fill="' + color + '"/></marker>');
        });
        paths.push('</defs>');
        let selectedEnds = null;
        list.forEach(function (link) {
            if (link.from && !findBoardNode(link.from)) {
                link.from = '';
                link.fromPort = '';
            }
            if (link.to && !findBoardNode(link.to)) {
                link.to = '';
                link.toPort = '';
            }
            if (!link.from && !link.to && !link.x1 && !link.y1 && !link.x2 && !link.y2) return;
            const ends = linkEnds(link);
            link.x1 = ends.p1.x;
            link.y1 = ends.p1.y;
            link.x2 = ends.p2.x;
            link.y2 = ends.p2.y;
            const on = boardLinkSelected === link.id || boardPickedLinks.indexOf(link.id) >= 0;
            if (on) selectedEnds = ends;
            const color = link.stroke || '#d4d4d8';
            const sw = link.sw || 1.7;
            const dash = dashFor(link.dash);
            const op = link.op == null ? 1 : link.op;
            const d = linkPath(ends.p1, ends.fromPort, ends.p2, ends.toPort);
            paths.push('<path class="wb-link-hit" data-link="' + esc(link.id) + '" d="' + d + '" fill="none"/>');
            paths.push('<path class="wb-link' + (on ? ' is-on' : '') + '" data-link="' + esc(link.id) + '" d="' + d + '" fill="none" stroke="' + color + '" style="--wb-link-sw:' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' opacity="' + op + '" marker-end="url(#' + markerKey(color) + ')"/>');
            if (link.label) {
                const mx = (ends.p1.x + ends.p2.x) / 2;
                const my = (ends.p1.y + ends.p2.y) / 2;
                paths.push('<text x="' + mx + '" y="' + (my - 8) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(link.label) + '</text>');
            }
        });
        paths.push('<path id="boardLinkDraft" fill="none" d="M0 0" opacity="0"/>');
        svg.innerHTML = paths.join('');
        const stage = svg.parentNode;
        if (!stage) return;
        let ui = stage.querySelector('.wb-link-ui');
        if (selectedEnds) {
            if (!ui) {
                ui = document.createElement('div');
                ui.className = 'wb-link-ui';
                stage.appendChild(ui);
            }
            ui.innerHTML =
                '<button type="button" class="wb-link-knob" data-link="' + esc(boardLinkSelected) + '" data-link-handle="start" style="left:' + selectedEnds.p1.x + 'px;top:' + selectedEnds.p1.y + 'px" aria-label="Move start"></button>' +
                '<button type="button" class="wb-link-knob" data-link="' + esc(boardLinkSelected) + '" data-link-handle="end" style="left:' + selectedEnds.p2.x + 'px;top:' + selectedEnds.p2.y + 'px" aria-label="Move end"></button>';
        } else if (ui) {
            ui.remove();
        }
    }

    function addBoardNode(type, at) {
        rememberBoard();
        const kind = BOARD_PLACE.indexOf(type) >= 0 ? type : (BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'process');
        const board = data.whiteboard;
        const origin = at || {
            x: (180 - board.x) / (board.z || 1),
            y: (120 - board.y) / (board.z || 1)
        };
        const meta = typeMeta(kind);
        const node = normalizeBoardNode({
            id: uid('nd'),
            type: kind,
            shape: meta.shape,
            x: origin.x,
            y: origin.y,
            w: origin.w,
            h: origin.h,
            title: BOARD_GEO.indexOf(kind) >= 0 || kind === 'image' || kind === 'embed' ? (kind === 'frame' ? 'Frame' : '') : (kind === 'person' ? (subjectName() || 'Person') : meta.label),
            body: '',
            src: ''
        });
        if (kind === 'web') node.body = firstValue('domain') || '';
        if (kind === 'person') node.body = [firstValue('username'), firstValue('email')].filter(Boolean).join(' · ');
        if (kind === 'text') { node.title = ''; node.body = ''; node.w = 220; node.h = 48; }
        if (kind === 'note') {
            node.title = '';
            node.body = '';
            node.w = 176;
            node.h = 176;
            node.fill = '#f3e08a';
            node.stroke = '#c9a227';
        }
        if (kind === 'image') { node.fill = 'rgba(250,250,250,0.08)'; node.dash = 'dotted'; node.stroke = '#3f3f46'; }
        if (kind === 'frame') { node.dash = 'dashed'; node.fill = 'rgba(250,250,250,0.04)'; }
        if (kind === 'finding') { node.title = 'Finding'; node.body = ''; }
        if (kind === 'question') { node.title = 'Question'; node.body = ''; }
        if (kind === 'event') {
            const last = numberedTimeline();
            node.body = last.length ? (last[last.length - 1].title || '') : '';
        }
        if (kind === 'evidence') {
            const locker = data.evidence || [];
            if (locker.length) node.body = locker[locker.length - 1].title || '';
        }
        board.nodes.push(node);
        boardSelected = node.id;
        renderWhiteboard();
        schedulePersist();
        return node;
    }

    function deleteBoardNode(id) {
        if (!id) return;
        const rec = findBoardNode(id);
        if (rec && rec.locked) return;
        rememberBoard();
        data.whiteboard.nodes = data.whiteboard.nodes.filter(function (n) { return n.id !== id; });
        data.whiteboard.links = data.whiteboard.links.filter(function (l) { return l.from !== id && l.to !== id; });
        if (boardSelected === id) boardSelected = '';
        boardPicked = boardPicked.filter(function (item) { return item !== id; });
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        if (boardConnect === id) {
            boardConnect = '';
            boardConnectPort = '';
        }
        renderWhiteboard();
        schedulePersist();
    }

    function deleteBoardSelection() {
        const ids = (boardPicked.length ? boardPicked : (boardSelected ? [boardSelected] : [])).slice();
        const linkIds = (boardPickedLinks.length ? boardPickedLinks : (boardLinkSelected ? [boardLinkSelected] : [])).slice();
        if (!ids.length && !linkIds.length) return;
        rememberBoard();
        const drop = {};
        ids.forEach(function (id) {
            const rec = findBoardNode(id);
            if (rec && rec.locked) return;
            drop[id] = true;
        });
        const dropLink = {};
        linkIds.forEach(function (id) { dropLink[id] = true; });
        data.whiteboard.nodes = (data.whiteboard.nodes || []).filter(function (n) { return !drop[n.id]; });
        data.whiteboard.links = (data.whiteboard.links || []).filter(function (l) {
            if (dropLink[l.id]) return false;
            return !drop[l.from] && !drop[l.to];
        });
        boardSelected = '';
        boardLinkSelected = '';
        boardPicked = [];
        boardPickedLinks = [];
        boardConnect = '';
        boardConnectPort = '';
        renderWhiteboard();
        schedulePersist();
    }

    function toggleBoardDone(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        rec.done = !rec.done;
        if (rec.flow && rec.stepId) {
            data.flowchart.checks[rec.flow] = data.flowchart.checks[rec.flow] || {};
            data.flowchart.checks[rec.flow][rec.stepId] = rec.done;
        }
        renderWhiteboard();
        schedulePersist();
    }

    function insertPlaybook(presetId, at) {
        const preset = FLOW_PRESETS.find(function (item) { return item.id === presetId; }) || FLOW_PRESETS[0];
        const board = data.whiteboard;
        data.flowchart.preset = preset.id;
        const existing = (board.nodes || []).filter(function (n) { return n.flow === preset.id; });
        if (existing.length) {
            boardSelected = existing[0].id;
            board.x = 48 - existing[0].x * board.z;
            board.y = 96 - existing[0].y * board.z;
            renderWhiteboard();
            return;
        }
        const originX = at && at.x != null ? at.x : Math.max(80, (120 - board.x) / (board.z || 1));
        const originY = at && at.y != null ? at.y : Math.max(80, (140 - board.y) / (board.z || 1));
        const checks = data.flowchart.checks[preset.id] || {};
        const notes = data.flowchart.notes[preset.id] || {};
        const start = normalizeBoardNode({
            id: uid('nd'),
            type: 'terminator',
            shape: 'terminator',
            flow: preset.id,
            stepId: 'start',
            x: originX,
            y: originY,
            title: preset.chip,
            body: preset.lead
        });
        board.nodes.push(start);
        let prev = start;
        preset.steps.forEach(function (step, i) {
            const node = normalizeBoardNode({
                id: uid('nd'),
                type: 'process',
                shape: 'process',
                flow: preset.id,
                stepId: step.id,
                href: step.href || '',
                x: originX,
                y: originY + 92 + i * 118,
                title: String(i + 1).padStart(2, '0') + '  ' + step.title,
                body: notes[step.id] || step.body,
                done: !!checks[step.id]
            });
            board.nodes.push(node);
            board.links.push(normalizeLink({ from: prev.id, to: node.id, fromPort: 's', toPort: 'n', label: '' }));
            prev = node;
        });
        boardSelected = start.id;
        renderWhiteboard();
        schedulePersist();
    }

    function boardViewportOrigin(offsetX, offsetY) {
        const view = $('boardView');
        const board = data.whiteboard;
        const z = board.z || 1;
        const vw = view ? view.clientWidth : 900;
        const vh = view ? view.clientHeight : 600;
        return {
            x: Math.max(40, ((vw * 0.5) - (board.x || 0)) / z - (offsetX || 280)),
            y: Math.max(40, ((vh * 0.42) - (board.y || 0)) / z - (offsetY || 80))
        };
    }

    function openBoardPresets() {
        hideBoardMore();
        hideBoardAddMenu();
        showSheet($('boardPresetSheet'));
        syncBoardTools();
    }

    function closeBoardPresets() {
        hideSheet($('boardPresetSheet'));
        syncBoardTools();
    }

    function presetPush(ids, spec) {
        const node = normalizeBoardNode(Object.assign({ id: uid('nd') }, spec));
        data.whiteboard.nodes.push(node);
        ids.push(node.id);
        return node;
    }

    function presetJoin(fromNode, toNode, fromPort, toPort, label) {
        data.whiteboard.links = data.whiteboard.links || [];
        data.whiteboard.links.push(normalizeLink({
            from: fromNode.id,
            to: toNode.id,
            fromPort: fromPort || 'e',
            toPort: toPort || 'w',
            label: label || ''
        }));
    }

    function finishBoardPreset(ids) {
        boardPicked = ids.slice();
        boardSelected = ids[0] || '';
        boardTool = 'select';
        closeBoardPresets();
        renderWhiteboard();
        schedulePersist();
    }

    function insertBoardPreset(kind) {
        rememberBoard();
        if (kind === 'bubble') insertBubblePreset();
        else if (kind === 'flowchart') insertFlowchartPreset();
        else if (kind === 'timeline') insertTimelinePreset();
        else if (kind === 'treemap') insertTreemapPreset();
    }

    function insertBubblePreset() {
        const at = boardViewportOrigin(360, 80);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const topicA = presetPush(ids, {
            type: 'circle', shape: 'circle', x: ox + 168, y: oy + 56, w: 176, h: 176,
            title: 'Topic A', fill: 'rgba(103,232,249,0.12)', stroke: '#67e8f9'
        });
        const topicB = presetPush(ids, {
            type: 'circle', shape: 'circle', x: ox + 392, y: oy + 56, w: 176, h: 176,
            title: 'Topic B', fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        [
            { x: ox + 8, y: oy + 8, title: 'Unique to A' },
            { x: ox, y: oy + 108, title: 'Unique to A' },
            { x: ox + 8, y: oy + 208, title: 'Unique to A' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 112, h: 72,
                title: item.title, fill: 'rgba(250,250,250,0.06)'
            });
            presetJoin(node, topicA, 'e', 'w');
        });
        [
            { x: ox + 616, y: oy + 8, title: 'Unique to B' },
            { x: ox + 628, y: oy + 108, title: 'Unique to B' },
            { x: ox + 616, y: oy + 208, title: 'Unique to B' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 112, h: 72,
                title: item.title, fill: 'rgba(250,250,250,0.06)'
            });
            presetJoin(node, topicB, 'w', 'e');
        });
        [
            { x: ox + 248, y: oy + 268, title: 'Shared' },
            { x: ox + 376, y: oy + 268, title: 'Shared' },
            { x: ox + 312, y: oy + 356, title: 'Shared' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 120, h: 72,
                title: item.title, fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
            });
            presetJoin(node, topicA, 'n', 's');
            presetJoin(node, topicB, 'n', 's');
        });
        finishBoardPreset(ids);
    }

    function insertFlowchartPreset() {
        const at = boardViewportOrigin(200, 40);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const start = presetPush(ids, {
            type: 'terminator', shape: 'terminator', x: ox + 126, y: oy, w: 188, h: 64, title: 'Start',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        const step = presetPush(ids, {
            type: 'process', shape: 'process', x: ox + 120, y: oy + 108, w: 200, h: 80, title: 'Process'
        });
        const decision = presetPush(ids, {
            type: 'decision', shape: 'decision', x: ox + 136, y: oy + 232, w: 168, h: 168, title: 'Decision?',
            fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        const yes = presetPush(ids, {
            type: 'process', shape: 'process', x: ox, y: oy + 448, w: 168, h: 72, title: 'Yes'
        });
        const no = presetPush(ids, {
            type: 'process', shape: 'process', x: ox + 272, y: oy + 448, w: 168, h: 72, title: 'No'
        });
        const end = presetPush(ids, {
            type: 'terminator', shape: 'terminator', x: ox + 126, y: oy + 568, w: 188, h: 64, title: 'End',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        presetJoin(start, step, 's', 'n');
        presetJoin(step, decision, 's', 'n');
        presetJoin(decision, yes, 'w', 'n');
        presetJoin(decision, no, 'e', 'n');
        presetJoin(yes, end, 's', 'w');
        presetJoin(no, end, 's', 'e');
        finishBoardPreset(ids);
    }

    function insertTimelinePreset() {
        const at = boardViewportOrigin(380, 60);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const labels = ['Event 1', 'Event 2', 'Event 3', 'Event 4'];
        const markers = [];
        labels.forEach(function (title, i) {
            const cx = ox + i * 210;
            const above = i % 2 === 0;
            const card = presetPush(ids, {
                type: 'process', shape: 'process', x: cx, y: above ? oy : oy + 168, w: 168, h: 72,
                title: title, body: 'Date'
            });
            const marker = presetPush(ids, {
                type: 'circle', shape: 'circle', x: cx + 68, y: oy + 96, w: 32, h: 32, title: '',
                fill: 'rgba(103,232,249,0.18)', stroke: '#67e8f9'
            });
            presetJoin(card, marker, above ? 's' : 'n', above ? 'n' : 's');
            if (markers.length) presetJoin(markers[markers.length - 1], marker, 'e', 'w');
            markers.push(marker);
        });
        finishBoardPreset(ids);
    }

    function insertTreemapPreset() {
        const at = boardViewportOrigin(340, 40);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        presetPush(ids, {
            type: 'frame', shape: 'frame', x: ox, y: oy, w: 680, h: 420, title: 'Treemap',
            dash: 'dashed', fill: 'rgba(250,250,250,0.04)'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 16, y: oy + 44, w: 328, h: 360, title: 'Group A', body: '42%',
            fill: 'rgba(103,232,249,0.12)', stroke: '#67e8f9'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 356, y: oy + 44, w: 308, h: 168, title: 'Group B', body: '28%',
            fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 356, y: oy + 224, w: 148, h: 180, title: 'Group C', body: '16%',
            fill: 'rgba(196,181,253,0.12)', stroke: '#c4b5fd'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 516, y: oy + 224, w: 148, h: 180, title: 'Group D', body: '14%',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        finishBoardPreset(ids);
    }

    function openBoardEditor(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        $('boardEditId').value = rec.id;
        $('boardTitle').value = rec.title || '';
        $('boardBody').value = rec.body || '';
        $('boardImage').value = rec.src || '';
        const size = shapeSize(rec);
        const width = $('boardWidth');
        const height = $('boardHeight');
        if (width) width.value = Math.round(size.w);
        if (height) height.value = Math.round(size.h);
        const shape = $('boardShape');
        if (shape) shape.value = rec.shape && BOARD_SHAPES[rec.shape] ? rec.shape : (typeMeta(rec.type).shape || 'process');
        const kicker = $('boardSheetKicker');
        if (kicker) kicker.textContent = rec.flow ? 'Playbook' : prettyLabel(rec.type || 'shape');
        showSheet($('boardSheet'));
        const title = $('boardTitle');
        if (title) title.focus();
    }

    function saveBoardEditor() {
        const id = $('boardEditId').value;
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        rec.title = $('boardTitle').value.trim().slice(0, 80);
        rec.body = $('boardBody').value.trim().slice(0, 400);
        rec.src = $('boardImage').value.trim();
        const shape = $('boardShape') && $('boardShape').value;
        if (shape && BOARD_SHAPES[shape]) rec.shape = shape;
        const width = Number($('boardWidth') && $('boardWidth').value);
        const height = Number($('boardHeight') && $('boardHeight').value);
        if (isImageNode(rec)) {
            if (width) rec.w = Math.max(48, Math.min(1200, width));
            applyImageRatio(rec, 'w');
            if (rec.src) fitImageNode(rec, rec.src);
        } else {
            if (width) rec.w = Math.max(48, Math.min(1200, width));
            if (height) rec.h = Math.max(48, Math.min(1200, height));
        }
        if (rec.flow && rec.stepId && rec.stepId !== 'start') {
            data.flowchart.notes[rec.flow] = data.flowchart.notes[rec.flow] || {};
            data.flowchart.notes[rec.flow][rec.stepId] = rec.body;
        }
        hideSheet($('boardSheet'));
        renderWhiteboard();
        schedulePersist();
    }

    function showSheet(el) {
        if (!el) return;
        el.hidden = false;
        requestAnimationFrame(function () { el.classList.add('is-in'); });
    }

    function hideSheet(el) {
        if (!el) return;
        el.classList.remove('is-in');
        el.hidden = true;
    }

    function hostName(value) {
        return String(value || '').trim().replace(/^https?:\/\//i, '').split('/')[0].replace(/:\d+$/, '').toLowerCase();
    }

    function applyBoardTransform() {
        const stage = $('boardStage');
        const board = data.whiteboard;
        if (stage) {
            stage.style.transform = 'translate(' + board.x + 'px,' + board.y + 'px) scale(' + board.z + ')';
            stage.style.setProperty('--wb-z', board.z || 1);
        }
    }

    function setBoardDrift(clientX, clientY) {
        const idle = reduceMotion() || clientX == null || clientY == null;
        let px = 0;
        let py = 0;
        let bgx = 0;
        let bgy = 0;
        if (!idle) {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const nx = Math.max(-1, Math.min(1, (clientX / w - 0.5) * 2));
            const ny = Math.max(-1, Math.min(1, (clientY / h - 0.5) * 2));
            px = nx * 8;
            py = ny * 6;
            bgx = nx * 14;
            bgy = ny * 10;
        }
        boardDrift.x = px;
        boardDrift.y = py;
        ['boardView'].forEach(function (id) {
            const el = $(id);
            if (!el) return;
            el.style.setProperty('--wb-px', px + 'px');
            el.style.setProperty('--wb-py', py + 'px');
            el.style.setProperty('--wb-bgx', bgx + 'px');
            el.style.setProperty('--wb-bgy', bgy + 'px');
        });
    }

    function worldFromClient(clientX, clientY) {
        const view = $('boardView');
        const board = data.whiteboard;
        const rect = view.getBoundingClientRect();
        const z = board.z || 1;
        return {
            x: (clientX - rect.left - board.x - boardDrift.x) / z,
            y: (clientY - rect.top - board.y - boardDrift.y) / z
        };
    }

    function hideBoardAddMenu(keepDrop) {
        const menu = $('boardAddMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        if (!keepDrop) boardDropAt = null;
    }

    function hideBoardMore() {
        const more = $('boardMoreMenu');
        if (more) more.hidden = true;
    }

    function showBoardMore() {
        const more = $('boardMoreMenu');
        const btn = document.querySelector('[data-board-more]');
        const view = $('boardView');
        if (!more) return;
        more.hidden = false;
        if (!btn || !view) return;
        const vr = view.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        const width = Math.min(248, vr.width - 16);
        more.style.width = width + 'px';
        more.style.transform = 'none';
        more.style.left = Math.min(Math.max(8, br.left - vr.left - 80), Math.max(8, vr.width - width - 8)) + 'px';
        more.style.top = (br.bottom - vr.top + 8) + 'px';
    }

    function setBoardOverlay(d, cls) {
        const svg = $('boardOverlay');
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.style.opacity = '1';
        svg.innerHTML = d ? '<path class="' + (cls || 'wb-lasso') + '" d="' + d + '"/>' : '';
    }

    function stopLaser(clear) {
        if (laserRaf) {
            cancelAnimationFrame(laserRaf);
            laserRaf = 0;
        }
        laserPts = [];
        if (!clear) return;
        const svg = $('boardOverlay');
        if (svg) {
            svg.style.opacity = '1';
            svg.innerHTML = '';
        }
    }

    function paintLaser() {
        const svg = $('boardOverlay');
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.style.opacity = '1';
        if (!laserPts.length) {
            svg.innerHTML = '';
            return;
        }
        const d = overlayLine(laserPts, false);
        const head = laserPts[laserPts.length - 1];
        svg.innerHTML =
            (d ? '<path class="wb-laser" d="' + d + '"/>' : '') +
            '<circle class="wb-laser-head" cx="' + head.x + '" cy="' + head.y + '" r="4"/>';
    }

    function tickLaser() {
        laserRaf = 0;
        if (boardTool !== 'laser') {
            stopLaser(true);
            return;
        }
        const now = performance.now();
        const life = 720;
        const last = laserPts[laserPts.length - 1];
        laserPts = laserPts.filter(function (pt, i, list) {
            return i === list.length - 1 || now - pt.t < life;
        });
        paintLaser();
        if (laserPts.length > 1 || (last && now - last.t < life)) {
            laserRaf = requestAnimationFrame(tickLaser);
        }
    }

    function feedLaser(world) {
        if (boardTool !== 'laser' || !world) return;
        const now = performance.now();
        const prev = laserPts[laserPts.length - 1];
        if (!prev || Math.hypot(world.x - prev.x, world.y - prev.y) > 1.1) {
            laserPts.push({ x: world.x, y: world.y, t: now });
        } else {
            prev.x = world.x;
            prev.y = world.y;
            prev.t = now;
        }
        if (laserPts.length > 180) laserPts = laserPts.slice(-140);
        if (!laserRaf) laserRaf = requestAnimationFrame(tickLaser);
        else paintLaser();
    }

    function overlayLine(pts, closed) {
        if (!pts || pts.length < 2) return '';
        const pairs = pts.map(function (p) { return Array.isArray(p) ? p : [p.x, p.y]; });
        return inkPath(pairs) + (closed ? ' Z' : '');
    }

    function pointInPoly(pt, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[j];
            const ay = a.y != null ? a.y : a[1];
            const ax = a.x != null ? a.x : a[0];
            const by = b.y != null ? b.y : b[1];
            const bx = b.x != null ? b.x : b[0];
            if (((ay > pt.y) !== (by > pt.y)) && (pt.x < (bx - ax) * (pt.y - ay) / ((by - ay) || 1) + ax)) inside = !inside;
            j = i;
        }
        return inside;
    }

    function convertInkToShape(rec) {
        if (!rec || rec.shape !== 'draw') return;
        const pts = rec.pts || [];
        if (pts.length < 4) return;
        const first = pts[0];
        const last = pts[pts.length - 1];
        const close = Math.hypot(first[0] - last[0], first[1] - last[1]) < Math.min(rec.w, rec.h) * 0.28;
        const aspect = rec.w / (rec.h || 1);
        let shape = 'square';
        if (!close && (aspect > 3.1 || aspect < 0.32)) {
            shape = 'line';
            rec.flipX = last[0] < first[0];
            rec.flipY = last[1] < first[1];
        } else if (Math.abs(aspect - 1) < 0.28) {
            shape = 'circle';
        }
        rec.type = shape;
        rec.shape = shape;
        rec.pts = [];
    }

    function parseFlowNode(chunk) {
        const text = String(chunk || '').trim().replace(/\|[^|]*\|/g, '').replace(/["']/g, '');
        const m = text.match(/^([A-Za-z0-9_]+)\s*(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\}|$)/);
        if (!m || !m[1]) {
            if (!text) return null;
            return { key: text.replace(/\s+/g, '_').slice(0, 24), title: text.slice(0, 80), shape: 'process' };
        }
        return {
            key: m[1],
            title: (m[2] || m[3] || m[4] || m[1]).slice(0, 80),
            shape: m[4] ? 'diamond' : (m[3] ? 'terminator' : 'process')
        };
    }

    function placeDiagram(specs, links, origin) {
        if (!specs.length) return;
        rememberBoard();
        const at = origin || boardPointerAt || { x: 180, y: 140 };
        const ids = {};
        specs.forEach(function (spec, i) {
            const node = normalizeBoardNode({
                id: uid('nd'),
                type: spec.shape === 'diamond' ? 'decision' : (spec.shape === 'terminator' ? 'terminator' : 'process'),
                shape: spec.shape || 'process',
                x: at.x + (i % 3) * 210,
                y: at.y + Math.floor(i / 3) * 120,
                w: spec.shape === 'diamond' ? 160 : 180,
                h: spec.shape === 'diamond' ? 88 : 70,
                title: spec.title || spec.key,
                body: ''
            });
            data.whiteboard.nodes.push(node);
            ids[spec.key] = node.id;
        });
        (links || []).forEach(function (link) {
            if (!ids[link.from] || !ids[link.to] || ids[link.from] === ids[link.to]) return;
            data.whiteboard.links.push(normalizeLink({
                from: ids[link.from],
                to: ids[link.to],
                fromPort: 's',
                toPort: 'n',
                label: link.label || ''
            }));
        });
        boardSelected = specs.length ? ids[specs[0].key] : '';
        boardPicked = boardSelected ? [boardSelected] : [];
        renderWhiteboard();
        schedulePersist();
    }

    function textToDiagram(raw) {
        const lines = String(raw || '').split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
        const nodes = [];
        const seen = {};
        const edges = [];
        function take(title) {
            const key = title.replace(/\s+/g, '_').slice(0, 28) || uid('n');
            if (!seen[key]) {
                seen[key] = true;
                nodes.push({ key: key, title: title.slice(0, 80), shape: 'process' });
            }
            return key;
        }
        lines.forEach(function (line) {
            const hit = line.match(/^(.*?)\s*(?:->|→)\s*(.*?)(?:\s*[:|]\s*(.*))?$/);
            if (hit) {
                const a = take(hit[1].trim());
                const b = take(hit[2].trim());
                edges.push({ from: a, to: b, label: (hit[3] || '').trim() });
            } else take(line);
        });
        placeDiagram(nodes, edges);
    }

    function mermaidToDiagram(raw) {
        const nodes = [];
        const seen = {};
        const edges = [];
        function take(spec) {
            if (!spec) return '';
            if (!seen[spec.key]) {
                seen[spec.key] = true;
                nodes.push(spec);
            }
            return spec.key;
        }
        String(raw || '').split(/\n/).forEach(function (line) {
            line = line.trim();
            if (!line || /^(graph|flowchart|%%)/i.test(line)) return;
            const parts = line.split(/\s*(?:-->|---|==>|-.->)\s*/);
            if (parts.length < 2) {
                take(parseFlowNode(line));
                return;
            }
            const a = parseFlowNode(parts[0]);
            const b = parseFlowNode(parts[1]);
            take(a);
            take(b);
            if (a && b) edges.push({ from: a.key, to: b.key });
        });
        placeDiagram(nodes, edges);
    }

    function wireframeToCode(raw) {
        const lines = String(raw || '').split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
        if (!lines.length) return;
        rememberBoard();
        const at = boardPointerAt || { x: 160, y: 120 };
        const frame = normalizeBoardNode({
            id: uid('nd'),
            type: 'frame',
            shape: 'frame',
            x: at.x,
            y: at.y,
            w: 360,
            h: Math.max(180, 56 + lines.length * 52),
            title: 'Wireframe',
            dash: 'dashed',
            fill: 'rgba(250,250,250,0.04)'
        });
        data.whiteboard.nodes.push(frame);
        lines.forEach(function (line, i) {
            data.whiteboard.nodes.push(normalizeBoardNode({
                id: uid('nd'),
                type: 'process',
                shape: 'process',
                x: at.x + 24,
                y: at.y + 36 + i * 50,
                w: 312,
                h: 40,
                title: line.slice(0, 80)
            }));
        });
        const html = '<main>\n' + lines.map(function (line) {
            return '  <section>' + line.replace(/</g, '&lt;') + '</section>';
        }).join('\n') + '\n</main>';
        try { navigator.clipboard.writeText(html); } catch (error) {}
        boardSelected = frame.id;
        boardPicked = [frame.id];
        renderWhiteboard();
        schedulePersist();
    }

    function startDrawToShape() {
        const rec = findBoardNode(boardSelected);
        if (rec && rec.shape === 'draw') {
            rememberBoard();
            convertInkToShape(rec);
            renderWhiteboard();
            schedulePersist();
            return;
        }
        boardDrawToShape = true;
        boardTool = 'draw';
        boardConnect = '';
        renderWhiteboard();
    }

    function showBoardAddMenu(clientX, clientY, kind) {
        const menu = $('boardAddMenu');
        const view = $('boardView');
        if (!menu || !view) return;
        hideBoardMore();
        boardDropAt = worldFromClient(clientX, clientY);
        boardMenuMode = kind === 'node' && boardSelected ? 'node' : (kind === 'link' && boardLinkSelected ? 'link' : 'canvas');
        const facts = filedFacts().slice(0, 8);
        const photos = imageItems().slice(0, 6);
        let html = '';
        if (boardMenuMode === 'node') {
            const rec = findBoardNode(boardSelected) || {};
            html += menuItem('data-board-ctx="cut"', 'cut', 'Cut', '<span class="board-kbd">Ctrl+X</span>');
            html += menuItem('data-board-ctx="copy"', 'copy', 'Copy', '<span class="board-kbd">Ctrl+C</span>');
            html += menuItem('data-board-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
            html += menuItem('data-board-add="connect"', 'connect', 'Connect shapes');
            html += menuItem('data-board-ctx="clear-links"', 'clear-links', 'Clear arrows');
            html += '<hr>';
            html += menuItem('data-board-ctx="copy-style"', 'style', 'Copy styles');
            html += menuItem('data-board-ctx="paste-style"', 'style', 'Paste styles');
            html += '<hr>';
            html += menuItem('data-board-layer="up"', 'up', 'Bring forward', '<span class="board-kbd">Ctrl+]</span>');
            html += menuItem('data-board-layer="down"', 'down', 'Send backward', '<span class="board-kbd">Ctrl+[</span>');
            html += menuItem('data-board-layer="forward"', 'front', 'Bring to front', '<span class="board-kbd">Ctrl+Shift+]</span>');
            html += menuItem('data-board-layer="back"', 'back', 'Send to back', '<span class="board-kbd">Ctrl+Shift+[</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="flip-h"', 'flip-h', 'Flip horizontal', '<span class="board-kbd">Shift+H</span>');
            html += menuItem('data-board-ctx="flip-v"', 'flip-v', 'Flip vertical', '<span class="board-kbd">Shift+V</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="link"', 'link', rec.href ? 'Edit link' : 'Add link', '<span class="board-kbd">Ctrl+K</span>');
            html += menuItem('data-board-ctx="lock"', rec.locked ? 'unlock' : 'lock', rec.locked ? 'Unlock' : 'Lock');
            html += '<hr>' + menuItem('data-board-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        } else if (boardMenuMode === 'link') {
            const link = findBoardLink(boardLinkSelected) || {};
            if (link.from || link.to) html += menuItem('data-board-ctx="detach"', 'detach', 'Detach');
            html += menuItem('data-board-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="copy-style"', 'style', 'Copy styles');
            html += menuItem('data-board-ctx="paste-style"', 'style', 'Paste styles');
            html += '<hr>' + menuItem('data-board-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        } else {
            html += menuItem('data-board-add="square"', 'square', 'Rectangle');
            html += menuItem('data-board-add="diamond"', 'diamond', 'Diamond');
            html += menuItem('data-board-add="circle"', 'circle', 'Circle');
            html += menuItem('data-board-add="triangle"', 'triangle', 'Triangle');
            html += menuItem('data-board-add="line"', 'line', 'Line');
            html += menuItem('data-board-add="arrow"', 'arrow', 'Arrow');
            html += menuItem('data-board-tool="draw"', 'draw', 'Draw');
            html += menuItem('data-board-tool="eraser"', 'eraser', 'Eraser');
            html += menuItem('data-board-add="text"', 'text', 'Text');
            html += menuItem('data-board-add="note"', 'note', 'Sticky note');
            html += menuItem('data-board-add="image"', 'image', 'Image');
            html += '<hr>';
            html += menuItem('data-board-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
            html += menuItem('data-board-grid', 'grid', data.whiteboard.grid === false ? 'Show grid' : 'Hide grid');
            html += menuItem('data-board-ctx="recenter"', 'recenter', 'Recenter');
        }
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        const rect = view.getBoundingClientRect();
        const maxH = Math.max(160, rect.height - 16);
        menu.style.maxHeight = maxH + 'px';
        const left = Math.min(Math.max(8, clientX - rect.left), Math.max(8, rect.width - 248));
        const menuH = Math.min(menu.scrollHeight || 240, maxH);
        const top = Math.min(Math.max(8, clientY - rect.top), Math.max(8, rect.height - menuH - 8));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function placeFromMenu(kind) {
        const at = boardDropAt || { x: 180, y: 140 };
        const onto = boardMenuMode === 'node' && boardSelected;
        hideBoardAddMenu();
        if (kind === 'connect') {
            boardTool = 'connect';
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return;
        }
        if (onto) {
            applyBoardKind(kind);
            return;
        }
        const node = addBoardNode(kind, at);
        if (node && (kind === 'text' || kind === 'finding' || kind === 'question' || kind === 'note')) {
            beginBoardTextEdit(node.id);
        }
        if (node && (kind === 'image' || kind === 'embed')) focusImageSlot(node.id);
    }

    function bindBoardPointers() {
        const view = $('boardView');
        const stage = $('boardStage');
        if (!view || !stage || view.dataset.bound) return;
        view.dataset.bound = '1';
        let drag = null;
        function stopMiddleAutoscroll(event) {
            if (event.button === 1) event.preventDefault();
        }
        view.addEventListener('mousedown', stopMiddleAutoscroll, true);
        view.addEventListener('auxclick', stopMiddleAutoscroll);
        view.addEventListener('pointerdown', function (event) {
            if (event.button === 1) {
                event.preventDefault();
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.classList.add('is-grabbing');
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan') || boardTool === 'pan') {
                event.preventDefault();
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.classList.add('is-grabbing');
                view.setPointerCapture(event.pointerId);
                return;
            }
            boardPointerAt = worldFromClient(event.clientX, event.clientY);
            if (event.target.closest('.wb-node.is-editing')) return;
            if (document.querySelector('#boardStage [data-wb-text].is-edit')) commitBoardTextEdit();
            if (event.target.closest('.board-toolbar, .board-props, .board-more, .board-add-menu')) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount) sel.removeAllRanges();
                return;
            }
            if (event.target.closest('[data-board-done], .wb-image-slot, [data-wb-upload], [data-wb-image-url], [data-wb-embed-url]')) return;
            event.preventDefault();
            if (boardTool === 'eraser') {
                hideBoardAddMenu();
                hideBoardMore();
                rememberBoard();
                histQuiet = true;
                drag = { mode: 'erase' };
                const hit = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
                if (hit) deleteBoardNode(hit.dataset.node);
                else {
                    const linkEl = event.target.closest('[data-link]');
                    if (linkEl) deleteBoardLink(linkEl.getAttribute('data-link'));
                }
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'draw') {
                hideBoardAddMenu();
                hideBoardMore();
                const origin = worldFromClient(event.clientX, event.clientY);
                rememberBoard();
                const ink = normalizeBoardNode({
                    id: uid('nd'),
                    type: 'draw',
                    shape: 'draw',
                    x: origin.x - 8,
                    y: origin.y - 8,
                    w: 16,
                    h: 16,
                    pts: [[8, 8]],
                    title: '',
                    fill: 'transparent'
                });
                data.whiteboard.nodes.push(ink);
                boardSelected = ink.id;
                boardPicked = [ink.id];
                renderWhiteboard();
                drag = { mode: 'ink', id: ink.id, moved: false };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'laser') {
                hideBoardAddMenu();
                hideBoardMore();
                feedLaser(worldFromClient(event.clientX, event.clientY));
                drag = { mode: 'laser' };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'lasso') {
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'lasso', pts: [worldFromClient(event.clientX, event.clientY)] };
                setBoardOverlay(overlayLine(drag.pts, true), 'wb-lasso');
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'bucket') {
                hideBoardAddMenu();
                hideBoardMore();
                const hit = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
                const rec = hit && findBoardNode(hit.dataset.node);
                if (rec && !rec.locked) {
                    rememberBoard();
                    rec.fill = boardPaintFill || 'rgba(103,232,249,0.12)';
                    if (!rec.fill || rec.fill === 'transparent') rec.fill = 'rgba(103,232,249,0.12)';
                    renderWhiteboard();
                    schedulePersist();
                }
                return;
            }
            const node = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
            const selectMode = boardTool === 'select' || !boardTool;
            function startMarquee(seed, add) {
                hideBoardAddMenu();
                hideBoardMore();
                if (!add && !seed) {
                    boardSelected = '';
                    boardLinkSelected = '';
                    boardPicked = [];
                    boardPickedLinks = [];
                    stage.querySelectorAll('.wb-node').forEach(function (el) {
                        el.classList.remove('is-on');
                        const box = el.querySelector('.wb-handles');
                        if (box) box.remove();
                    });
                    drawBoardLinks($('boardLinks'), data.whiteboard);
                    syncBoardInspect();
                    syncBoardGroupBox();
                }
                drag = {
                    mode: 'marquee',
                    origin: worldFromClient(event.clientX, event.clientY),
                    x: event.clientX,
                    y: event.clientY,
                    moved: false,
                    add: !!add,
                    seed: seed || '',
                    base: add ? boardPicked.slice() : [],
                    baseLinks: add ? boardPickedLinks.slice() : []
                };
                view.setPointerCapture(event.pointerId);
            }
            if (node) {
                const id = node.dataset.node;
                const port = event.target.closest('[data-port]');
                const handle = event.target.closest('[data-handle]');
                if (port) {
                    if (boardTool !== 'connect') return;
                    const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
                    if (!rec) return;
                    const portName = port.getAttribute('data-port');
                    if (boardConnect && boardConnectPort && boardConnect !== id) {
                        addBoardLink(boardConnect, boardConnectPort, id, portName);
                        boardConnect = '';
                        boardConnectPort = '';
                        return;
                    }
                    boardSelected = id;
                    boardConnect = id;
                    boardConnectPort = portName;
                    drag = {
                        mode: 'link',
                        id: id,
                        port: portName,
                        start: portPoint(rec, portName)
                    };
                    view.classList.add('is-linking');
                    markBoardPorts(id, portName, '', '');
                    view.setPointerCapture(event.pointerId);
                    syncBoardInspect();
                    return;
                }
                if (boardTool === 'connect') return;
                const rec = findBoardNode(id);
                if (!rec) return;
                const add = boardAddKey(event);
                const already = boardPicked.indexOf(id) >= 0;
                if (selectMode && !handle && !(already && !add && !rec.locked)) {
                    startMarquee(id, add);
                    return;
                }
                if (rec.locked) {
                    pickBoardNode(id, add);
                    return;
                }
                if (add) {
                    const ids = pickBoardNode(id, true);
                    if (ids.indexOf(id) < 0) return;
                } else if (boardPicked.indexOf(id) < 0) {
                    pickBoardNode(id, false);
                } else {
                    boardSelected = id;
                }
                const size = shapeSize(rec);
                if (handle) {
                    rememberBoard();
                    const hname = handle.getAttribute('data-handle');
                    if (isStrokeRec(rec) || hname === 'start' || hname === 'end') {
                        drag = {
                            mode: 'stroke-end',
                            id: id,
                            which: hname === 'start' ? 'start' : 'end',
                            x: event.clientX,
                            y: event.clientY
                        };
                        view.classList.add('is-snap');
                    } else {
                        drag = {
                            mode: 'resize',
                            id: id,
                            handle: hname,
                            x: event.clientX,
                            y: event.clientY,
                            ox: rec.x,
                            oy: rec.y,
                            ow: size.w,
                            oh: size.h
                        };
                    }
                } else {
                    rememberBoard();
                    const ids = boardPicked.indexOf(id) >= 0 && boardPicked.length > 1 ? boardPicked : [id];
                    drag = {
                        mode: 'node',
                        id: id,
                        x: event.clientX,
                        y: event.clientY,
                        pack: ids.map(function (nid) {
                            const n = findBoardNode(nid) || {};
                            return {
                                id: nid,
                                ox: n.x || 0,
                                oy: n.y || 0,
                                x1: n.x1,
                                y1: n.y1,
                                x2: n.x2,
                                y2: n.y2,
                                stroke: isStrokeShape(n.shape)
                            };
                        }),
                        moved: false
                    };
                }
                view.setPointerCapture(event.pointerId);
                boardLinkSelected = '';
                stage.querySelectorAll('.wb-node').forEach(function (el) {
                    const on = (boardPicked.indexOf(id) >= 0 ? boardPicked : [id]).indexOf(el.dataset.node) >= 0;
                    el.classList.toggle('is-on', on);
                    const box = el.querySelector('.wb-handles');
                    if (on && el.dataset.node === id && boardPicked.length < 2 && !box) {
                        el.insertAdjacentHTML('beforeend', handleMarkup((rec && rec.shape) || el.dataset.shape, rec));
                        if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
                    }
                    if ((!on || el.dataset.node !== id || boardPicked.length > 1) && box) box.remove();
                });
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
                syncBoardGroupBox();
                return;
            }
            const linkHandle = event.target.closest('[data-link-handle]');
            const linkEl = event.target.closest('[data-link]');
            const linkId = (linkHandle && linkHandle.getAttribute('data-link')) || (linkEl && linkEl.getAttribute('data-link'));
            if (linkId && boardTool !== 'connect') {
                hideBoardAddMenu();
                hideBoardMore();
                event.preventDefault();
                const link = findBoardLink(linkId);
                if (!link) return;
                selectBoardLink(linkId);
                const which = linkHandle && linkHandle.getAttribute('data-link-handle');
                if (which === 'start' || which === 'end') {
                    rememberBoard();
                    drag = { mode: 'link-end', id: linkId, which: which };
                    view.classList.add('is-snap');
                } else {
                    const ends = linkEnds(link);
                    drag = {
                        mode: 'link-move',
                        id: linkId,
                        x: event.clientX,
                        y: event.clientY,
                        x1: ends.p1.x,
                        y1: ends.p1.y,
                        x2: ends.p2.x,
                        y2: ends.p2.y,
                        moved: false
                    };
                }
            view.setPointerCapture(event.pointerId);
                return;
            }
            hideBoardAddMenu();
            hideBoardMore();
            if (selectMode) {
                startMarquee('', boardAddKey(event));
                return;
            }
            if (BOARD_PLACE.indexOf(boardTool) >= 0) {
                const origin = worldFromClient(event.clientX, event.clientY);
                const node = addBoardNode(boardTool, { x: origin.x, y: origin.y, w: 8, h: 8 });
                if (!node) return;
                if (isStrokeShape(node.shape)) {
                    setStrokePoint(node, 'start', origin, true);
                    setStrokePoint(node, 'end', origin, false);
                    const elDraw = stage.querySelector('[data-node="' + node.id + '"]');
                    applyNodeBox(elDraw, node);
                    view.classList.add('is-snap');
                }
                drag = {
                    mode: 'draw',
                    id: node.id,
                    origin: origin,
                    x: event.clientX,
                    y: event.clientY,
                    moved: false
                };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'connect') {
                boardConnect = '';
                boardConnectPort = '';
                markBoardPorts('', '', '', '');
                setLinkDraft('', false);
                return;
            }
            if (boardTool !== 'connect') {
                boardSelected = '';
                boardLinkSelected = '';
                stage.querySelectorAll('.wb-node').forEach(function (el) {
                    el.classList.remove('is-on');
                    const box = el.querySelector('.wb-handles');
                    if (box) box.remove();
                });
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
            }
            if (boardTool === 'pan') {
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.setPointerCapture(event.pointerId);
            }
        });
        view.addEventListener('pointermove', function (event) {
            if (!drag) setBoardDrift(event.clientX, event.clientY);
            boardPointerAt = worldFromClient(event.clientX, event.clientY);
            if (boardTool === 'laser') feedLaser(boardPointerAt);
            if (!drag) return;
            const z = data.whiteboard.z || 1;
            if (drag.mode === 'pan') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) drag.moved = true;
                if (!drag.moved) return;
                data.whiteboard.x = drag.ox + (event.clientX - drag.x);
                data.whiteboard.y = drag.oy + (event.clientY - drag.y);
                applyBoardTransform();
                return;
            }
            if (drag.mode === 'marquee') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
                if (!drag.moved) return;
                const at = worldFromClient(event.clientX, event.clientY);
                drag.at = at;
                setMarqueeOverlay(drag.origin, at);
                const hits = hitsInRect(drag.origin, at);
                const nodeIds = drag.add ? drag.base.concat(hits.nodes.filter(function (id) { return drag.base.indexOf(id) < 0; })) : hits.nodes;
                const linkIds = drag.add ? (drag.baseLinks || []).concat(hits.links.filter(function (id) { return (drag.baseLinks || []).indexOf(id) < 0; })) : hits.links;
                drag.hits = { nodes: nodeIds, links: linkIds };
                previewBoardHits(nodeIds, linkIds);
                return;
            }
            if (drag.mode === 'draw') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
                const recDraw = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!recDraw) return;
                applyDrawBox(drag.origin, recDraw, worldFromClient(event.clientX, event.clientY), drawLocksAspect(recDraw.shape, event.shiftKey));
                applyNodeBox(stage.querySelector('[data-node="' + recDraw.id + '"]'), recDraw);
                syncBoardInspect();
                return;
            }
            if (drag.mode === 'ink') {
                const recInk = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!recInk) return;
                drag.moved = true;
                growInk(recInk, worldFromClient(event.clientX, event.clientY));
                const elInk = stage.querySelector('[data-node="' + recInk.id + '"]');
                applyNodeBox(elInk, recInk);
                const path = elInk && elInk.querySelector('.wb-ink .wb-shape');
                if (path) path.setAttribute('d', inkPath(recInk.pts));
                const svgInk = elInk && elInk.querySelector('.wb-ink');
                if (svgInk) svgInk.setAttribute('viewBox', '0 0 ' + recInk.w + ' ' + recInk.h);
                return;
            }
            if (drag.mode === 'laser') {
                feedLaser(boardPointerAt);
                return;
            }
            if (drag.mode === 'lasso') {
                drag.pts.push(worldFromClient(event.clientX, event.clientY));
                setBoardOverlay(overlayLine(drag.pts, true), 'wb-lasso');
                const hits = hitsInLasso(drag.pts);
                drag.hits = hits;
                previewBoardHits(hits.nodes, hits.links);
                return;
            }
            if (drag.mode === 'erase') {
                const hit = document.elementFromPoint(event.clientX, event.clientY);
                const over = hit && hit.closest && hit.closest('.wb-node');
                if (over) deleteBoardNode(over.dataset.node);
                else {
                    const linkEl = hit && hit.closest && hit.closest('[data-link]');
                    if (linkEl) deleteBoardLink(linkEl.getAttribute('data-link'));
                }
                return;
            }
            if (drag.mode === 'link') {
                const at = worldFromClient(event.clientX, event.clientY);
                const hit = document.elementFromPoint(event.clientX, event.clientY);
                const overNode = hit && hit.closest && hit.closest('.wb-node');
                const overPort = hit && hit.closest && hit.closest('[data-port]');
                let end = at;
                const dx = at.x - drag.start.x;
                const dy = at.y - drag.start.y;
                let toId = '';
                let toPort = Math.abs(dx) > Math.abs(dy) ? (dx >= 0 ? 'w' : 'e') : (dy >= 0 ? 'n' : 's');
                if (overNode && overNode.dataset.node !== drag.id) {
                    const recTo = (data.whiteboard.nodes || []).find(function (n) { return n.id === overNode.dataset.node; });
                    if (recTo) {
                        toId = recTo.id;
                        toPort = overPort ? overPort.getAttribute('data-port') : nearestPort(recTo, at);
                        end = portPoint(recTo, toPort);
                    }
                }
                markBoardPorts(drag.id, drag.port, toId, toPort);
                drag.hoverId = toId;
                drag.hoverPort = toPort;
                setLinkDraft(linkPath(drag.start, drag.port, end, toPort), true);
                return;
            }
            if (drag.mode === 'link-end') {
                const link = findBoardLink(drag.id);
                if (!link) return;
                let at = worldFromClient(event.clientX, event.clientY);
                const ends = linkEnds(link);
                const other = drag.which === 'start' ? ends.p2 : ends.p1;
                at = snapAxis(other, at, event.shiftKey);
                setLinkPoint(link, drag.which, at, true);
                drawBoardLinks($('boardLinks'), data.whiteboard);
                return;
            }
            if (drag.mode === 'link-move') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) <= 6) return;
                const link = findBoardLink(drag.id);
                if (!link) return;
                if (!drag.moved) {
                    drag.moved = true;
                    rememberBoard();
                    link.from = '';
                    link.fromPort = '';
                    link.to = '';
                    link.toPort = '';
                }
                const dx = (event.clientX - drag.x) / z;
                const dy = (event.clientY - drag.y) / z;
                link.x1 = drag.x1 + dx;
                link.y1 = drag.y1 + dy;
                link.x2 = drag.x2 + dx;
                link.y2 = drag.y2 + dy;
                drawBoardLinks($('boardLinks'), data.whiteboard);
                return;
            }
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
            if (!rec) return;
            const el = stage.querySelector('[data-node="' + drag.id + '"]');
            if (drag.mode === 'resize') {
                if (isStrokeRec(rec)) return;
                const lock = isImageNode(rec) || event.shiftKey || (drag.handle && drag.handle.length === 2 && (rec.shape === 'circle' || rec.shape === 'ellipse'));
                resizeFromHandle(drag, rec, (event.clientX - drag.x) / z, (event.clientY - drag.y) / z, lock);
                applyNodeBox(el, rec);
                followAllStrokes(drag.id);
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
                return;
            }
            if (drag.mode === 'stroke-end') {
                let at = worldFromClient(event.clientX, event.clientY);
                const other = drag.which === 'start' ? { x: rec.x2, y: rec.y2 } : { x: rec.x1, y: rec.y1 };
                at = snapAxis(other, at, event.shiftKey);
                setStrokePoint(rec, drag.which, at, true);
                applyNodeBox(el, rec);
                return;
            }
            if (drag.mode === 'node') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) <= 6) return;
                drag.moved = true;
                const dx = (event.clientX - drag.x) / z;
                const dy = (event.clientY - drag.y) / z;
                (drag.pack || [{ id: drag.id, ox: drag.ox, oy: drag.oy }]).forEach(function (item) {
                    const n = findBoardNode(item.id);
                    const nel = stage.querySelector('[data-node="' + item.id + '"]');
                    if (!n) return;
                    if (item.stroke) {
                        n.x1 = item.x1 + dx;
                        n.y1 = item.y1 + dy;
                        n.x2 = item.x2 + dx;
                        n.y2 = item.y2 + dy;
                        n.startId = '';
                        n.startPort = '';
                        n.endId = '';
                        n.endPort = '';
                        layoutStroke(n);
                    } else {
                        n.x = item.ox + dx;
                        n.y = item.oy + dy;
                    }
                    applyNodeBox(nel, n);
                });
                followAllStrokes();
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardGroupBox();
                return;
            }
            rec.x = drag.ox + (event.clientX - drag.x) / z;
            rec.y = drag.oy + (event.clientY - drag.y) / z;
            applyNodeBox(el, rec);
            drawBoardLinks($('boardLinks'), data.whiteboard);
        });
        view.addEventListener('pointerup', function (event) {
            view.classList.remove('is-grabbing');
            if (drag && drag.mode === 'marquee') {
                setBoardOverlay('', '');
                if (!drag.moved) {
                    if (drag.seed) pickBoardNode(drag.seed, drag.add);
                    else if (!drag.add) selectBoardNodes([]);
                } else {
                    const at = drag.at || worldFromClient(event.clientX, event.clientY);
                    const hits = drag.hits || hitsInRect(drag.origin, at);
                    const nodeIds = drag.add ? drag.base.concat((hits.nodes || []).filter(function (id) { return drag.base.indexOf(id) < 0; })) : (hits.nodes || []);
                    const linkIds = drag.add ? (drag.baseLinks || []).concat((hits.links || []).filter(function (id) { return (drag.baseLinks || []).indexOf(id) < 0; })) : (hits.links || []);
                    selectBoardNodes(nodeIds, linkIds);
                }
                drag = null;
                return;
            }
            if (drag && drag.mode === 'erase') {
                histQuiet = false;
                drag = null;
                return;
            }
            if (drag && drag.mode === 'ink') {
                const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!rec || !drag.moved || (rec.pts || []).length < 3) {
                    histQuiet = true;
                    if (rec) deleteBoardNode(rec.id);
                    histQuiet = false;
                    if (boardUndo.length) boardUndo.pop();
                    syncBoardHistory();
                    drag = null;
                    return;
                }
                if (boardDrawToShape) convertInkToShape(rec);
                renderWhiteboard();
                schedulePersist();
                drag = null;
                finishBoardTool();
                return;
            }
            if (drag && drag.mode === 'laser') {
                drag = null;
                return;
            }
            if (drag && drag.mode === 'lasso') {
                const hits = drag.hits || hitsInLasso(drag.pts);
                setBoardOverlay('', '');
                selectBoardNodes(hits.nodes || [], hits.links || []);
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link') {
                if (drag.hoverId && drag.hoverId !== drag.id) {
                    addBoardLink(drag.id, drag.port, drag.hoverId, drag.hoverPort || 'w');
                    boardConnect = '';
                    boardConnectPort = '';
                }
                view.classList.remove('is-linking');
                markBoardPorts(boardConnect, boardConnectPort, '', '');
                setLinkDraft('', false);
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link-end') {
                clearStrokeSnap();
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link-move') {
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'stroke-end') {
                clearStrokeSnap();
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'draw') {
                const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                const kind = rec && rec.type;
                if (!rec) {
                    clearStrokeSnap();
                    drag = null;
                    return;
                }
                if (!drag.moved && (kind === 'note' || kind === 'text')) {
                    rec.w = kind === 'note' ? 176 : 220;
                    rec.h = kind === 'note' ? 176 : 48;
                    rec.x = drag.origin.x;
                    rec.y = drag.origin.y;
                    renderWhiteboard();
                    schedulePersist();
                    drag = null;
                    clearStrokeSnap();
                    beginBoardTextEdit(rec.id);
                    finishBoardTool();
                    return;
                }
                if (!drag.moved) {
                    clearStrokeSnap();
                    histQuiet = true;
                    deleteBoardNode(rec.id);
                    histQuiet = false;
                    if (boardUndo.length) boardUndo.pop();
                    syncBoardHistory();
                    drag = null;
                    return;
                }
                if (!isStrokeRec(rec)) {
                    const left = rec.x < drag.origin.x;
                    const up = rec.y < drag.origin.y;
                    rec.w = Math.max(kind === 'note' ? 140 : 48, rec.w);
                    rec.h = Math.max(kind === 'note' ? 140 : 48, rec.h);
                    if (drawLocksAspect(rec.shape, event.shiftKey)) {
                        const side = Math.max(rec.w, rec.h);
                        rec.w = side;
                        rec.h = side;
                    }
                    rec.x = left ? drag.origin.x - rec.w : drag.origin.x;
                    rec.y = up ? drag.origin.y - rec.h : drag.origin.y;
                }
                renderWhiteboard();
                schedulePersist();
                drag = null;
                clearStrokeSnap();
                if (kind === 'text' || kind === 'finding' || kind === 'question' || kind === 'note') beginBoardTextEdit(rec.id);
                if (kind === 'image' || kind === 'embed') {
                    boardTool = 'select';
                    renderWhiteboard();
                    focusImageSlot(rec.id);
                    return;
                }
                finishBoardTool();
                return;
            }
            if (drag) schedulePersist();
            drag = null;
        });
        view.addEventListener('pointercancel', function () {
            view.classList.remove('is-grabbing');
            view.classList.remove('is-linking');
            markBoardPorts('', '', '', '');
            setLinkDraft('', false);
            if (boardTool !== 'laser') setBoardOverlay('', '');
            clearStrokeSnap();
            histQuiet = false;
            drag = null;
        });
        view.addEventListener('contextmenu', function (event) {
            if (event.target.closest('.board-toolbar, .board-props, .board-more, .board-add-menu')) return;
            event.preventDefault();
            const linkHandle = event.target.closest('[data-link-handle]');
            const linkEl = event.target.closest('[data-link]');
            const linkId = (linkHandle && linkHandle.getAttribute('data-link')) || (linkEl && linkEl.getAttribute('data-link'));
            if (linkId && findBoardLink(linkId)) {
                selectBoardLink(linkId);
                showBoardAddMenu(event.clientX, event.clientY, 'link');
                return;
            }
            const node = nodeElAtClient(event.clientX, event.clientY) || event.target.closest('.wb-node');
            if (node) {
                selectBoardNode(node.dataset.node);
                showBoardAddMenu(event.clientX, event.clientY, 'node');
                return;
            }
            showBoardAddMenu(event.clientX, event.clientY, 'canvas');
        });
        view.addEventListener('wheel', function (event) {
            if (event.target.closest('.board-add-menu, .board-more, .board-props')) return;
            event.preventDefault();
            const rect = view.getBoundingClientRect();
            const prev = data.whiteboard.z || 1;
            const next = Math.min(2.8, Math.max(0.25, prev * (event.deltaY > 0 ? 0.92 : 1.08)));
            const px = event.clientX - rect.left - boardDrift.x;
            const py = event.clientY - rect.top - boardDrift.y;
            const wx = (px - data.whiteboard.x) / prev;
            const wy = (py - data.whiteboard.y) / prev;
            data.whiteboard.z = next;
            data.whiteboard.x = px - wx * next;
            data.whiteboard.y = py - wy * next;
            applyBoardTransform();
            schedulePersist();
        }, { passive: false });
        view.addEventListener('dblclick', function (event) {
            if (event.target.closest('.board-toolbar, .board-props')) return;
            if (event.target.closest('[data-board-done]')) return;
            const node = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
            if (!node) return;
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === node.dataset.node; });
            if (!rec) return;
            event.preventDefault();
            if (rec.type === 'image') {
                if (!rec.src) focusImageSlot(rec.id);
                else openBoardImagePicker(rec.id);
                return;
            }
            beginBoardTextEdit(rec.id);
        });
    }
