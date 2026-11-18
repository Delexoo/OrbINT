/* Whiteboard shapes, strokes, ports, link paths */
    function finishBoardTool() {
        boardDrawToShape = false;
        syncBoardTools();
    }

    function typeMeta(type) {
        return BOARD_TYPES.find(function (item) { return item.id === type; }) || BOARD_TYPES[0];
    }

    function isGeoShape(shape) {
        return BOARD_GEO.indexOf(shape) >= 0;
    }

    function isStrokeShape(shape) {
        return shape === 'line' || shape === 'arrow';
    }

    function isStrokeRec(rec) {
        return !!(rec && isStrokeShape(rec.shape || rec.type));
    }

    function layoutStroke(rec) {
        if (!isStrokeRec(rec)) return;
        if (rec.x1 == null || rec.y1 == null || rec.x2 == null || rec.y2 == null) {
            rec.x1 = (rec.x || 0) + (rec.flipX ? (rec.w || 0) : 0);
            rec.y1 = (rec.y || 0) + (rec.flipY ? (rec.h || 0) : 0);
            rec.x2 = (rec.x || 0) + (rec.flipX ? 0 : (rec.w || 0));
            rec.y2 = (rec.y || 0) + (rec.flipY ? 0 : (rec.h || 0));
        }
        rec.startId = rec.startId || '';
        rec.startPort = rec.startPort || '';
        rec.endId = rec.endId || '';
        rec.endPort = rec.endPort || '';
        const pad = 12;
        const minx = Math.min(rec.x1, rec.x2);
        const miny = Math.min(rec.y1, rec.y2);
        rec.x = minx - pad;
        rec.y = miny - pad;
        rec.w = Math.max(1, Math.abs(rec.x2 - rec.x1) + pad * 2);
        rec.h = Math.max(1, Math.abs(rec.y2 - rec.y1) + pad * 2);
    }

    function followStrokeBinds(rec) {
        if (!isStrokeRec(rec)) return;
        if (rec.startId && rec.startPort) {
            const n = findBoardNode(rec.startId);
            if (n && n.id !== rec.id) {
                const p = portPoint(n, rec.startPort);
                rec.x1 = p.x;
                rec.y1 = p.y;
            } else {
                rec.startId = '';
                rec.startPort = '';
            }
        }
        if (rec.endId && rec.endPort) {
            const n = findBoardNode(rec.endId);
            if (n && n.id !== rec.id) {
                const p = portPoint(n, rec.endPort);
                rec.x2 = p.x;
                rec.y2 = p.y;
            } else {
                rec.endId = '';
                rec.endPort = '';
            }
        }
    }

    function followAllStrokes(exceptId) {
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (!isStrokeRec(n) || n.id === exceptId) return;
            followStrokeBinds(n);
            layoutStroke(n);
            const el = document.querySelector('#boardStage [data-node="' + n.id + '"]');
            if (el) applyNodeBox(el, n);
        });
    }

    function nearestBind(world, skipId) {
        const z = (data.whiteboard && data.whiteboard.z) || 1;
        const max = 28 / z;
        let best = null;
        let bestD = max;
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (!n || n.id === skipId || isStrokeRec(n) || n.shape === 'draw' || n.type === 'draw') return;
            BOARD_PORTS.forEach(function (port) {
                const pt = portPoint(n, port);
                const d = Math.hypot(pt.x - world.x, pt.y - world.y);
                if (d <= bestD) {
                    bestD = d;
                    best = { id: n.id, port: port, x: pt.x, y: pt.y };
                }
            });
        });
        return best;
    }

    function snapAxis(from, to, shift) {
        if (!shift || !from || !to) return to;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const step = Math.PI / 4;
        const ang = Math.round(Math.atan2(dy, dx) / step) * step;
        return { x: from.x + Math.cos(ang) * len, y: from.y + Math.sin(ang) * len };
    }

    function setStrokeSnap(hit) {
        const view = $('boardView');
        if (view) view.classList.add('is-snap');
        if (hit) markBoardPorts('', '', hit.id, hit.port);
        else markBoardPorts('', '', '', '');
    }

    function clearStrokeSnap() {
        const view = $('boardView');
        if (view && boardTool !== 'connect') view.classList.remove('is-snap');
        if (boardTool !== 'connect') markBoardPorts('', '', '', '');
    }

    function setStrokePoint(rec, which, world, snap) {
        if (!rec) return;
        const hit = snap ? nearestBind(world, rec.id) : null;
        if (which === 'start') {
            rec.startId = hit ? hit.id : '';
            rec.startPort = hit ? hit.port : '';
            rec.x1 = hit ? hit.x : world.x;
            rec.y1 = hit ? hit.y : world.y;
        } else {
            rec.endId = hit ? hit.id : '';
            rec.endPort = hit ? hit.port : '';
            rec.x2 = hit ? hit.x : world.x;
            rec.y2 = hit ? hit.y : world.y;
        }
        layoutStroke(rec);
        setStrokeSnap(hit);
    }

    function strokeEnds(rec) {
        layoutStroke(rec);
        return {
            w: rec.w,
            h: rec.h,
            x1: rec.x1 - rec.x,
            y1: rec.y1 - rec.y,
            x2: rec.x2 - rec.x,
            y2: rec.y2 - rec.y
        };
    }

    function arrowHeadPoints(x1, y1, x2, y2, size) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const s = size || 12;
        const bx = x2 - ux * s;
        const by = y2 - uy * s;
        const hw = s * 0.55;
        return x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' +
            (bx - uy * hw).toFixed(1) + ',' + (by + ux * hw).toFixed(1) + ' ' +
            (bx + uy * hw).toFixed(1) + ',' + (by - ux * hw).toFixed(1);
    }

    function strokeInner(rec) {
        const e = strokeEnds(rec);
        const dx = e.x2 - e.x1;
        const dy = e.y2 - e.y1;
        const len = Math.hypot(dx, dy) || 1;
        const back = rec && rec.shape === 'arrow' ? Math.min(12, len * 0.35) : 0;
        let html = '<line class="wb-hit" x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) +
            '" x2="' + e.x2.toFixed(1) + '" y2="' + e.y2.toFixed(1) + '"/>';
        html += '<line class="wb-shape" x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) +
            '" x2="' + (e.x2 - dx / len * back).toFixed(1) + '" y2="' + (e.y2 - dy / len * back).toFixed(1) + '"/>';
        if (rec && rec.shape === 'arrow') {
            html += '<polygon class="wb-arrowhead" points="' + arrowHeadPoints(e.x1, e.y1, e.x2, e.y2, 12) + '"/>';
        }
        return html;
    }

    function syncStrokeChrome(el, rec) {
        if (!el || !isStrokeRec(rec)) return;
        const svg = el.querySelector('.wb-geo');
        if (!svg) return;
        const e = strokeEnds(rec);
        svg.setAttribute('viewBox', '0 0 ' + e.w + ' ' + e.h);
        svg.setAttribute('width', String(e.w));
        svg.setAttribute('height', String(e.h));
        const dx = e.x2 - e.x1;
        const dy = e.y2 - e.y1;
        const len = Math.hypot(dx, dy) || 1;
        const back = rec.shape === 'arrow' ? Math.min(12, len * 0.35) : 0;
        const hit = svg.querySelector('line.wb-hit');
        if (hit) {
            hit.setAttribute('x1', e.x1.toFixed(1));
            hit.setAttribute('y1', e.y1.toFixed(1));
            hit.setAttribute('x2', e.x2.toFixed(1));
            hit.setAttribute('y2', e.y2.toFixed(1));
        }
        const line = svg.querySelector('line.wb-shape');
        if (line) {
            line.setAttribute('x1', e.x1.toFixed(1));
            line.setAttribute('y1', e.y1.toFixed(1));
            line.setAttribute('x2', (e.x2 - dx / len * back).toFixed(1));
            line.setAttribute('y2', (e.y2 - dy / len * back).toFixed(1));
        }
        const head = svg.querySelector('.wb-arrowhead');
        if (head) head.setAttribute('points', arrowHeadPoints(e.x1, e.y1, e.x2, e.y2, 12));
        positionStrokeHandles(el, rec);
    }

    function positionStrokeHandles(el, rec) {
        if (!el || !rec) return;
        const e = strokeEnds(rec);
        const w = rec.w || 1;
        const h = rec.h || 1;
        const start = el.querySelector('[data-handle="start"]');
        const end = el.querySelector('[data-handle="end"]');
        if (start) {
            start.style.left = ((e.x1 / w) * 100) + '%';
            start.style.top = ((e.y1 / h) * 100) + '%';
        }
        if (end) {
            end.style.left = ((e.x2 / w) * 100) + '%';
            end.style.top = ((e.y2 / h) * 100) + '%';
        }
    }

    function shapeRadius(rec) {
        const shape = rec && (rec.shape || rec.type);
        if (rec && rec.radius != null && rec.radius !== '' && !isNaN(Number(rec.radius))) {
            return Math.max(0, Math.min(50, Number(rec.radius)));
        }
        if (rec && rec.edge === 'sharp') return 0;
        if (shape === 'circle' || shape === 'ellipse' || shape === 'terminator') return 50;
        return 12;
    }

    function shapeBoxSize(rec) {
        const size = shapeSize(rec);
        return { w: Math.max(8, size.w), h: Math.max(8, size.h) };
    }

    function isRoundRectShape(shape) {
        return shape === 'square' || shape === 'circle' || shape === 'ellipse' || shape === 'process' || shape === 'terminator' || shape === 'frame' || shape === 'image' || shape === 'embed';
    }

    function cornerRadiusPx(rec, w, h) {
        const pad = 1.5;
        const innerW = Math.max(0, w - pad * 2);
        const innerH = Math.max(0, h - pad * 2);
        const n = shapeRadius(rec);
        const shape = (rec && (rec.shape || rec.type)) || '';
        if (n <= 0) return { rx: 0, ry: 0, innerW: innerW, innerH: innerH, pad: pad };
        if (shape === 'circle' || shape === 'ellipse') {
            return { rx: innerW / 2, ry: innerH / 2, innerW: innerW, innerH: innerH, pad: pad };
        }
        const maxR = Math.min(innerW, innerH) / 2;
        const px = n >= 50 ? maxR : Math.min(maxR, n);
        return { rx: px, ry: px, innerW: innerW, innerH: innerH, pad: pad };
    }

    function applyShapeRadius(el, rec) {
        if (!el || !rec) return;
        rec.edge = shapeRadius(rec) < 1 ? 'sharp' : 'round';
        const geo = el.querySelector('.wb-geo');
        const shapeEl = geo && geo.querySelector('.wb-shape');
        el.style.setProperty('--wb-lc', shapeRadius(rec) < 1 ? 'butt' : 'round');
        el.style.setProperty('--wb-lj', shapeRadius(rec) < 1 ? 'miter' : 'round');
        if (!geo || !shapeEl || geo.classList.contains('wb-stroke') || geo.classList.contains('wb-ink')) return;
        if (String(shapeEl.tagName).toLowerCase() !== 'rect') return;
        const size = shapeBoxSize(rec);
        const r = cornerRadiusPx(rec, size.w, size.h);
        geo.setAttribute('viewBox', '0 0 ' + size.w + ' ' + size.h);
        geo.setAttribute('width', String(size.w));
        geo.setAttribute('height', String(size.h));
        shapeEl.setAttribute('x', String(r.pad));
        shapeEl.setAttribute('y', String(r.pad));
        shapeEl.setAttribute('width', String(r.innerW));
        shapeEl.setAttribute('height', String(r.innerH));
        shapeEl.setAttribute('rx', String(r.rx));
        shapeEl.setAttribute('ry', String(r.ry));
    }

    function setBoardRadius(value) {
        const rec = findBoardNode(boardSelected);
        if (!rec || rec.locked || isStrokeRec(rec)) return;
        const next = Math.max(0, Math.min(50, Math.round(Number(value))));
        if (isNaN(next)) return;
        rememberBoard('radius:' + rec.id);
        rec.radius = next;
        rec.edge = next < 1 ? 'sharp' : 'round';
        const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
        applyShapeRadius(el, rec);
        const slider = $('boardRadius');
        if (slider && document.activeElement !== slider) slider.value = String(next);
        schedulePersist();
    }

    function shapeChrome(shape, rec) {
        if (!isGeoShape(shape)) return '';
        if (isStrokeShape(shape)) {
            const e = strokeEnds(rec);
            return '<svg class="wb-geo wb-stroke" width="' + e.w + '" height="' + e.h + '" viewBox="0 0 ' + e.w + ' ' + e.h + '" preserveAspectRatio="xMinYMin meet" overflow="visible" aria-hidden="true">' +
                strokeInner(Object.assign({}, rec, { shape: shape })) + '</svg>';
        }
        const size = shapeBoxSize(rec);
        if (isRoundRectShape(shape)) {
            const r = cornerRadiusPx(Object.assign({}, rec || {}, { shape: shape }), size.w, size.h);
            return '<svg class="wb-geo" viewBox="0 0 ' + size.w + ' ' + size.h + '" width="' + size.w + '" height="' + size.h + '" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' +
                '<rect class="wb-shape" x="' + r.pad + '" y="' + r.pad + '" width="' + r.innerW + '" height="' + r.innerH + '" rx="' + r.rx + '" ry="' + r.ry + '"/>' +
                '</svg>';
        }
        let inner = '<rect class="wb-shape" x="1.5" y="1.5" width="97" height="97" rx="0" ry="0"/>';
        if (shape === 'triangle') inner = '<polygon class="wb-shape" points="50,1.5 98.5,98.5 1.5,98.5"/>';
        else if (shape === 'diamond' || shape === 'decision') inner = '<polygon class="wb-shape" points="50,1.5 98.5,50 50,98.5 1.5,50"/>';
        else if (shape === 'data') inner = '<polygon class="wb-shape" points="12,1.5 98.5,1.5 88,98.5 1.5,98.5"/>';
        else if (shape === 'document') inner = '<path class="wb-shape" d="M1.5 1.5 H98.5 V78 C84 92 66 72 50 84 C34 96 18 74 1.5 82 Z"/>';
        else if (shape === 'note') {
            inner = '<path class="wb-shape" d="M1.5 1.5 H72 L98.5 28 V98.5 H1.5 Z"/>' +
                '<path class="wb-fold" d="M72 1.5 V28 H98.5"/>';
        }
        return '<svg class="wb-geo" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' + inner + '</svg>';
    }

    function inkPath(pts) {
        if (!pts || !pts.length) return 'M0 0';
        const clean = [];
        pts.forEach(function (p) {
            const prev = clean[clean.length - 1];
            if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 0.7) clean.push(p);
        });
        if (!clean.length) return 'M0 0';
        if (clean.length === 1) return 'M' + clean[0][0].toFixed(1) + ' ' + clean[0][1].toFixed(1);
        let d = 'M' + clean[0][0].toFixed(1) + ' ' + clean[0][1].toFixed(1);
        if (clean.length === 2) return d + ' L' + clean[1][0].toFixed(1) + ' ' + clean[1][1].toFixed(1);
        function at(i) {
            return clean[Math.max(0, Math.min(clean.length - 1, i))];
        }
        for (let i = 0; i < clean.length - 1; i++) {
            const p0 = at(i - 1);
            const p1 = at(i);
            const p2 = at(i + 1);
            const p3 = at(i + 2);
            d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
                (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
                p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
        }
        return d;
    }

    function inkChrome(node) {
        const w = Math.max(8, Number(node.w) || 8);
        const h = Math.max(8, Number(node.h) || 8);
        return '<svg class="wb-geo wb-ink" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' +
            '<path class="wb-shape" d="' + inkPath(node.pts) + '" fill="none"/>' +
            '</svg>';
    }

    function growInk(rec, world) {
        const pad = 10;
        let x = world.x - rec.x;
        let y = world.y - rec.y;
        let dx = 0;
        let dy = 0;
        if (x < pad) { dx = pad - x; rec.x -= dx; rec.w += dx; x += dx; }
        if (y < pad) { dy = pad - y; rec.y -= dy; rec.h += dy; y += dy; }
        if (x > rec.w - pad) rec.w = x + pad;
        if (y > rec.h - pad) rec.h = y + pad;
        if (dx || dy) rec.pts = (rec.pts || []).map(function (p) { return [p[0] + dx, p[1] + dy]; });
        rec.pts = rec.pts || [];
        rec.pts.push([x, y]);
    }

    function applyNodeBox(el, node) {
        if (!el || !node) return;
        const size = shapeSize(node);
        el.style.left = (node.x || 0) + 'px';
        el.style.top = (node.y || 0) + 'px';
        el.style.width = size.w + 'px';
        el.style.height = size.h + 'px';
        el.style.setProperty('--wb-w', size.w + 'px');
        el.style.setProperty('--wb-h', size.h + 'px');
        el.style.setProperty('--wb-stroke', node.type === 'note' ? (node.stroke || '#c9a227') : (node.type === 'image' && !node.src ? '#3f3f46' : (node.stroke || '#e4e4e7')));
        el.style.setProperty('--wb-fill', node.type === 'note'
            ? (node.fill && node.fill !== 'transparent' && node.fill !== 'none' ? node.fill : '#f3e08a')
            : (node.type === 'image' && !node.src ? 'rgba(250,250,250,0.08)' : (size.shape === 'line' || size.shape === 'arrow' || !node.fill || node.fill === 'transparent' || node.fill === '#111113' ? 'none' : node.fill)));
        el.style.setProperty('--wb-sw', String(node.sw || 1.75));
        el.style.setProperty('--wb-op', String(node.op == null ? 1 : node.op));
        el.style.setProperty('--wb-dash', (node.type === 'image' && !node.src) ? '2.4 6' : node.dash === 'dashed' ? '8 6' : node.dash === 'dotted' ? '1.4 6' : 'none');
        el.style.setProperty('--wb-lc', shapeRadius(node) < 1 ? 'butt' : 'round');
        el.style.setProperty('--wb-lj', shapeRadius(node) < 1 ? 'miter' : 'round');
        el.style.setProperty('--wb-flip-x', node.flipX ? '-1' : '1');
        el.style.setProperty('--wb-flip-y', node.flipY ? '-1' : '1');
        el.querySelectorAll('img').forEach(function (img) { img.draggable = false; });
        syncStrokeChrome(el, node);
        applyShapeRadius(el, node);
    }

    function handleMarkup(shape, rec) {
        if (isStrokeShape(shape) || isStrokeRec(rec)) {
            const e = rec && rec.x1 != null ? strokeEnds(rec) : { x1: 0, y1: 0, x2: 1, y2: 0, w: 1, h: 1 };
            const w = e.w || 1;
            const h = e.h || 1;
            return '<div class="wb-handles is-stroke">' +
                '<span class="wb-handle" data-handle="start" style="left:' + ((e.x1 / w) * 100) + '%;top:' + ((e.y1 / h) * 100) + '%"></span>' +
                '<span class="wb-handle" data-handle="end" style="left:' + ((e.x2 / w) * 100) + '%;top:' + ((e.y2 / h) * 100) + '%"></span>' +
                '</div>';
        }
        return '<div class="wb-handles">' + BOARD_HANDLES.map(function (name) {
            return '<span class="wb-handle" data-handle="' + name + '"></span>';
        }).join('') + '</div>';
    }

    function portAnchor(shape, port) {
        const spots = {
            triangle: { n: [50, 1.5], e: [74.5, 50], s: [50, 98.5], w: [25.5, 50] },
            diamond: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            decision: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            circle: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            ellipse: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            square: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] }
        };
        const box = { n: [50, 0], e: [100, 50], s: [50, 100], w: [0, 50] };
        const pt = ((spots[shape] || box)[port] || box[port]);
        return { x: pt[0] / 100, y: pt[1] / 100 };
    }

    function portMarkup(shape) {
        if (isStrokeShape(shape)) return '';
        return '<div class="wb-ports">' + BOARD_PORTS.map(function (name) {
            const a = portAnchor(shape, name);
            return '<span class="wb-port" data-port="' + name + '" style="left:' + (a.x * 100) + '%;top:' + (a.y * 100) + '%"></span>';
        }).join('') + '</div>';
    }

    function portPoint(node, port) {
        const size = shapeSize(node);
        const a = portAnchor(node.shape || typeMeta(node.type).shape, port);
        return {
            x: (node.x || 0) + size.w * a.x,
            y: (node.y || 0) + size.h * a.y
        };
    }

    function portNormal(port, dist) {
        if (port === 'n') return { x: 0, y: -dist };
        if (port === 'e') return { x: dist, y: 0 };
        if (port === 's') return { x: 0, y: dist };
        return { x: -dist, y: 0 };
    }

    function inferPort(node, toward) {
        const size = shapeSize(node);
        const dx = toward.x - ((node.x || 0) + size.w / 2);
        const dy = toward.y - ((node.y || 0) + size.h / 2);
        if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'e' : 'w';
        return dy >= 0 ? 's' : 'n';
    }

    function nearestPort(node, point) {
        let best = 'n';
        let bestD = Infinity;
        BOARD_PORTS.forEach(function (port) {
            const pt = portPoint(node, port);
            const d = Math.hypot(pt.x - point.x, pt.y - point.y);
            if (d < bestD) {
                bestD = d;
                best = port;
            }
        });
        return best;
    }

    function linkWaypoints(p1, fromPort, p2, toPort) {
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        const gap = Math.min(56, Math.max(28, dist * 0.18));
        const a = { x: p1.x + portNormal(fromPort, gap).x, y: p1.y + portNormal(fromPort, gap).y };
        const b = { x: p2.x + portNormal(toPort, gap).x, y: p2.y + portNormal(toPort, gap).y };
        const fromH = fromPort === 'e' || fromPort === 'w';
        const toH = toPort === 'e' || toPort === 'w';
        const pts = [p1, a];
        if (fromH === toH) {
            if (fromH) {
                const midX = (a.x + b.x) / 2;
                pts.push({ x: midX, y: a.y }, { x: midX, y: b.y });
            } else {
                const midY = (a.y + b.y) / 2;
                pts.push({ x: a.x, y: midY }, { x: b.x, y: midY });
            }
        } else if (fromH) {
            pts.push({ x: b.x, y: a.y });
        } else {
            pts.push({ x: a.x, y: b.y });
        }
        pts.push(b, p2);
        const clean = [];
        pts.forEach(function (p) {
            const prev = clean[clean.length - 1];
            if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 0.6) clean.push(p);
        });
        return clean;
    }

    function roundedPolyline(pts, radius) {
        if (!pts || pts.length < 2) return 'M0 0';
        if (pts.length === 2) return 'M' + pts[0].x + ' ' + pts[0].y + ' L' + pts[1].x + ' ' + pts[1].y;
        let d = 'M' + pts[0].x + ' ' + pts[0].y;
        for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            const next = pts[i + 1];
            const d1 = Math.hypot(cur.x - prev.x, cur.y - prev.y) || 1;
            const d2 = Math.hypot(next.x - cur.x, next.y - cur.y) || 1;
            const r = Math.min(radius, d1 / 2, d2 / 2);
            d += ' L' + (cur.x - (cur.x - prev.x) / d1 * r) + ' ' + (cur.y - (cur.y - prev.y) / d1 * r);
            d += ' Q' + cur.x + ' ' + cur.y + ' ' +
                (cur.x + (next.x - cur.x) / d2 * r) + ' ' + (cur.y + (next.y - cur.y) / d2 * r);
        }
        const last = pts[pts.length - 1];
        return d + ' L' + last.x + ' ' + last.y;
    }

    function linkPath(p1, fromPort, p2, toPort) {
        if (!p1 || !p2) return 'M0 0';
        return 'M' + p1.x + ' ' + p1.y + ' L' + p2.x + ' ' + p2.y;
    }

    function setLinkDraft(d, on) {
        const svg = $('boardLinks');
        if (!svg) return;
        let el = svg.querySelector('#boardLinkDraft');
        if (!el) {
            el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            el.setAttribute('id', 'boardLinkDraft');
            el.setAttribute('fill', 'none');
            svg.appendChild(el);
        }
        el.setAttribute('d', d || 'M0 0');
        el.setAttribute('opacity', on ? '1' : '0');
    }

    function markBoardPorts(fromId, fromPort, toId, toPort) {
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (node) {
            node.classList.toggle('is-aim', !!(toId && node.dataset.node === toId));
        });
        stage.querySelectorAll('.wb-port').forEach(function (el) {
            const node = el.closest('.wb-node');
            const id = node ? node.dataset.node : '';
            const port = el.getAttribute('data-port');
            el.classList.toggle('is-from', !!(fromId && id === fromId && port === fromPort));
            el.classList.toggle('is-target', !!(toId && id === toId && port === toPort));
        });
    }

    function portFromDelta(from, to) {
        const dx = (to && to.x || 0) - (from && from.x || 0);
        const dy = (to && to.y || 0) - (from && from.y || 0);
        if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'e' : 'w';
        return dy >= 0 ? 's' : 'n';
    }

    function dashFor(dash) {
        if (dash === 'dashed') return '8 6';
        if (dash === 'dotted') return '1.6 5';
        return '';
    }

    function markerKey(color) {
        return 'wbarr' + String(color || 'd4d4d8').replace(/[^a-zA-Z0-9]/g, '');
    }

    function normalizeLink(raw) {
        const link = raw || {};
        if (!link.id) link.id = uid('lk');
        link.from = link.from || '';
        link.to = link.to || '';
        link.fromPort = link.fromPort || '';
        link.toPort = link.toPort || '';
        link.x1 = Number(link.x1) || 0;
        link.y1 = Number(link.y1) || 0;
        link.x2 = Number(link.x2) || 0;
        link.y2 = Number(link.y2) || 0;
        link.stroke = link.stroke || '#d4d4d8';
        link.sw = Number(link.sw) > 0 ? Number(link.sw) : 1.7;
        link.op = link.op == null ? 1 : Math.max(0, Math.min(1, Number(link.op)));
        link.dash = link.dash === 'dashed' || link.dash === 'dotted' ? link.dash : 'solid';
        link.label = link.label || '';
        return link;
    }

