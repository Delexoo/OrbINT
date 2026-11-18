/* Whiteboard presets, laser, and diagram import */
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
            const boardChord = (/Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent || '')) ? '⌘⇧K' : 'Ctrl+Shift+K';
            html += menuItem('data-board-ctx="link"', 'link', rec.href ? 'Edit link' : 'Add link', '<span class="board-kbd">' + boardChord + '</span>');
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

