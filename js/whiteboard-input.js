/* Whiteboard pointer tools */
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
