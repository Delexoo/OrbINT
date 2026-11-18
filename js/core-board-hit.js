/* Whiteboard hit testing, selection, text, resize */
    function nodeElAtClient(clientX, clientY) {
        const stack = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (!el || !el.closest) continue;
            const node = el.closest('.wb-node');
            if (!node) continue;
            if (node.classList.contains('is-stroke')) {
                if ((el.classList && (el.classList.contains('wb-hit') || el.classList.contains('wb-handle'))) || (el.getAttribute && el.getAttribute('data-handle'))) return node;
                continue;
            }
            return node;
        }
        const stage = $('boardStage');
        if (!stage) return null;
        const at = worldFromClient(clientX, clientY);
        const nodes = data.whiteboard.nodes || [];
        for (let i = nodes.length - 1; i >= 0; i--) {
            const rec = nodes[i];
            if (isStrokeShape(rec.shape)) continue;
            const size = shapeSize(rec);
            if (at.x >= (rec.x || 0) && at.x <= (rec.x || 0) + size.w && at.y >= (rec.y || 0) && at.y <= (rec.y || 0) + size.h) {
                if (boardTool === 'select' || !boardTool) continue;
                return stage.querySelector('[data-node="' + rec.id + '"]');
            }
        }
        return null;
    }

    function selectBoardNode(id) {
        boardLinkSelected = '';
        boardPickedLinks = [];
        boardSelected = id || '';
        boardPicked = id ? [id] : [];
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (el) {
            const on = boardPicked.indexOf(el.dataset.node) >= 0;
            el.classList.toggle('is-on', on);
            const box = el.querySelector('.wb-handles');
            const rec = findBoardNode(el.dataset.node);
            if (on && el.dataset.node === boardSelected && !box && rec && !rec.locked) {
                el.insertAdjacentHTML('beforeend', handleMarkup(rec.shape, rec));
                if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
            }
            if ((!on || el.dataset.node !== boardSelected || (rec && rec.locked)) && box) box.remove();
        });
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function selectBoardNodes(ids, linkIds, primary) {
        boardPicked = (ids || []).filter(Boolean);
        boardPickedLinks = (linkIds || []).filter(Boolean);
        boardSelected = (primary && boardPicked.indexOf(primary) >= 0) ? primary : (boardPicked[0] || '');
        boardLinkSelected = boardPicked.length ? '' : (boardPickedLinks[0] || '');
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (el) {
            const on = boardPicked.indexOf(el.dataset.node) >= 0;
            el.classList.toggle('is-on', on);
            const box = el.querySelector('.wb-handles');
            const rec = findBoardNode(el.dataset.node);
            if (on && el.dataset.node === boardSelected && boardPicked.length < 2 && !box && rec && !rec.locked) {
                el.insertAdjacentHTML('beforeend', handleMarkup(rec.shape, rec));
                if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
            }
            if ((!on || el.dataset.node !== boardSelected || boardPicked.length > 1 || (rec && rec.locked)) && box) box.remove();
        });
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function boardAddKey(event) {
        return !!(event && (event.shiftKey || event.ctrlKey || event.metaKey));
    }

    function pickBoardNode(id, add) {
        if (!id) {
            selectBoardNodes([]);
            return [];
        }
        if (!add) {
            selectBoardNodes([id], [], id);
            return [id];
        }
        const ids = boardPicked.slice();
        const at = ids.indexOf(id);
        if (at >= 0) ids.splice(at, 1);
        else ids.push(id);
        selectBoardNodes(ids, boardPickedLinks, at < 0 ? id : '');
        return ids;
    }

    function nodesInRect(a, b) {
        return hitsInRect(a, b).nodes;
    }

    function normHitRect(a, b) {
        return {
            x0: Math.min(a.x, b.x),
            y0: Math.min(a.y, b.y),
            x1: Math.max(a.x, b.x),
            y1: Math.max(a.y, b.y)
        };
    }

    function pointInHitRect(x, y, r) {
        return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
    }

    function rectsTouch(a, b) {
        return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
    }

    function segHitsSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
        const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(d) < 1e-8) {
            const r = { x0: Math.min(x3, x4), y0: Math.min(y3, y4), x1: Math.max(x3, x4), y1: Math.max(y3, y4) };
            return (pointInHitRect(x1, y1, r) || pointInHitRect(x2, y2, r)) &&
                Math.min(x1, x2) <= r.x1 && Math.max(x1, x2) >= r.x0 &&
                Math.min(y1, y2) <= r.y1 && Math.max(y1, y2) >= r.y0;
        }
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    function segHitsRect(x1, y1, x2, y2, r) {
        if (pointInHitRect(x1, y1, r) || pointInHitRect(x2, y2, r)) return true;
        return segHitsSeg(x1, y1, x2, y2, r.x0, r.y0, r.x1, r.y0) ||
            segHitsSeg(x1, y1, x2, y2, r.x1, r.y0, r.x1, r.y1) ||
            segHitsSeg(x1, y1, x2, y2, r.x1, r.y1, r.x0, r.y1) ||
            segHitsSeg(x1, y1, x2, y2, r.x0, r.y1, r.x0, r.y0);
    }

    function nodeWorldBox(n) {
        if (!n) return null;
        if (isStrokeRec(n) && n.x1 != null && n.y1 != null && n.x2 != null && n.y2 != null) {
            return {
                x0: Math.min(Number(n.x1), Number(n.x2)),
                y0: Math.min(Number(n.y1), Number(n.y2)),
                x1: Math.max(Number(n.x1), Number(n.x2)),
                y1: Math.max(Number(n.y1), Number(n.y2))
            };
        }
        const size = shapeSize(n);
        return {
            x0: n.x || 0,
            y0: n.y || 0,
            x1: (n.x || 0) + size.w,
            y1: (n.y || 0) + size.h
        };
    }

    function selectionWorldBox(nodeIds, linkIds) {
        const boxes = [];
        (nodeIds || []).forEach(function (id) {
            const box = nodeWorldBox(findBoardNode(id));
            if (box) boxes.push(box);
        });
        (linkIds || []).forEach(function (id) {
            const link = findBoardLink(id);
            if (!link) return;
            const ends = linkEnds(link);
            boxes.push({
                x0: Math.min(ends.p1.x, ends.p2.x),
                y0: Math.min(ends.p1.y, ends.p2.y),
                x1: Math.max(ends.p1.x, ends.p2.x),
                y1: Math.max(ends.p1.y, ends.p2.y)
            });
        });
        if (!boxes.length) return null;
        let x0 = boxes[0].x0;
        let y0 = boxes[0].y0;
        let x1 = boxes[0].x1;
        let y1 = boxes[0].y1;
        boxes.forEach(function (b) {
            x0 = Math.min(x0, b.x0);
            y0 = Math.min(y0, b.y0);
            x1 = Math.max(x1, b.x1);
            y1 = Math.max(y1, b.y1);
        });
        const pad = 24;
        return { x: x0 - pad, y: y0 - pad, w: (x1 - x0) + pad * 2, h: (y1 - y0) + pad * 2 };
    }

    function syncBoardGroupBox(nodeIds, linkIds) {
        const stage = $('boardStage');
        if (!stage) return;
        const ids = nodeIds || boardPicked || [];
        const lids = linkIds || boardPickedLinks || [];
        const count = ids.length + lids.length;
        const box = count > 1 ? selectionWorldBox(ids, lids) : null;
        let el = stage.querySelector('.wb-group');
        if (!box) {
            if (el) el.remove();
            return;
        }
        if (!el) {
            el = document.createElement('div');
            el.className = 'wb-group';
            el.innerHTML = '<i></i><i></i><i></i><i></i>';
            el.setAttribute('aria-hidden', 'true');
            stage.appendChild(el);
        }
        el.style.left = box.x + 'px';
        el.style.top = box.y + 'px';
        el.style.width = box.w + 'px';
        el.style.height = box.h + 'px';
    }

    function inflateRect(r, pad) {
        return { x0: r.x0 - pad, y0: r.y0 - pad, x1: r.x1 + pad, y1: r.y1 + pad };
    }

    function nodeHitsRect(n, r) {
        if (!n) return false;
        const pad = Math.max(2, (Number(n.sw) || 1.75) + 1);
        const box = inflateRect(r, pad);
        if (isStrokeRec(n) && n.x1 != null && n.y1 != null && n.x2 != null && n.y2 != null) {
            return segHitsRect(Number(n.x1), Number(n.y1), Number(n.x2), Number(n.y2), box);
        }
        if ((n.shape === 'draw' || n.type === 'draw') && (n.pts || []).length) {
            const ox = n.x || 0;
            const oy = n.y || 0;
            const pts = n.pts;
            if (pts.length === 1) return pointInHitRect(ox + pts[0][0], oy + pts[0][1], box);
            for (let i = 1; i < pts.length; i++) {
                if (segHitsRect(ox + pts[i - 1][0], oy + pts[i - 1][1], ox + pts[i][0], oy + pts[i][1], box)) return true;
            }
            return false;
        }
        const size = shapeSize(n);
        return rectsTouch(box, {
            x0: n.x || 0,
            y0: n.y || 0,
            x1: (n.x || 0) + size.w,
            y1: (n.y || 0) + size.h
        });
    }

    function linkHitsRect(link, r) {
        if (!link) return false;
        const ends = linkEnds(link);
        const pad = Math.max(2, (Number(link.sw) || 1.7) + 2);
        return segHitsRect(ends.p1.x, ends.p1.y, ends.p2.x, ends.p2.y, inflateRect(r, pad));
    }

    function hitsInRect(a, b) {
        const r = normHitRect(a, b);
        const nodes = [];
        const links = [];
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (nodeHitsRect(n, r)) nodes.push(n.id);
        });
        (data.whiteboard.links || []).forEach(function (link) {
            if (linkHitsRect(link, r)) links.push(link.id);
        });
        return { nodes: nodes, links: links };
    }

    function previewBoardHits(nodeIds, linkIds) {
        const stage = $('boardStage');
        if (stage) {
            stage.querySelectorAll('.wb-node').forEach(function (el) {
                el.classList.toggle('is-on', nodeIds.indexOf(el.dataset.node) >= 0);
            });
        }
        const prevNodes = boardPicked;
        const prevLinks = boardPickedLinks;
        const prevLink = boardLinkSelected;
        boardPickedLinks = linkIds || [];
        boardLinkSelected = nodeIds.length ? '' : (boardPickedLinks[0] || '');
        drawBoardLinks($('boardLinks'), data.whiteboard);
        boardPicked = prevNodes;
        boardPickedLinks = prevLinks;
        boardLinkSelected = prevLink;
        syncBoardGroupBox(nodeIds, linkIds);
    }

    function polyPoint(p) {
        return p && p.x != null ? p : { x: (p && p[0]) || 0, y: (p && p[1]) || 0 };
    }

    function nodeHitsLasso(n, pts) {
        const poly = (pts || []).map(polyPoint);
        if (poly.length < 2) return false;
        const size = shapeSize(n);
        const samples = isStrokeRec(n)
            ? [{ x: n.x1, y: n.y1 }, { x: n.x2, y: n.y2 }, { x: (Number(n.x1) + Number(n.x2)) / 2, y: (Number(n.y1) + Number(n.y2)) / 2 }]
            : [
                { x: n.x || 0, y: n.y || 0 },
                { x: (n.x || 0) + size.w, y: n.y || 0 },
                { x: (n.x || 0) + size.w, y: (n.y || 0) + size.h },
                { x: n.x || 0, y: (n.y || 0) + size.h },
                { x: (n.x || 0) + size.w / 2, y: (n.y || 0) + size.h / 2 }
            ];
        for (let i = 0; i < samples.length; i++) {
            if (pointInPoly(samples[i], poly)) return true;
        }
        const box = isStrokeRec(n)
            ? { x0: Math.min(n.x1, n.x2), y0: Math.min(n.y1, n.y2), x1: Math.max(n.x1, n.x2), y1: Math.max(n.y1, n.y2) }
            : { x0: n.x || 0, y0: n.y || 0, x1: (n.x || 0) + size.w, y1: (n.y || 0) + size.h };
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            if (pointInHitRect(a.x, a.y, box) || segHitsRect(a.x, a.y, b.x, b.y, box)) return true;
            if (isStrokeRec(n) && segHitsSeg(Number(n.x1), Number(n.y1), Number(n.x2), Number(n.y2), a.x, a.y, b.x, b.y)) return true;
        }
        if ((n.shape === 'draw' || n.type === 'draw') && (n.pts || []).length) {
            const ox = n.x || 0;
            const oy = n.y || 0;
            for (let i = 0; i < n.pts.length; i++) {
                if (pointInPoly({ x: ox + n.pts[i][0], y: oy + n.pts[i][1] }, poly)) return true;
            }
        }
        return false;
    }

    function linkHitsLasso(link, pts) {
        const poly = (pts || []).map(polyPoint);
        if (!link || poly.length < 2) return false;
        const ends = linkEnds(link);
        if (pointInPoly(ends.p1, poly) || pointInPoly(ends.p2, poly)) return true;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            if (segHitsSeg(ends.p1.x, ends.p1.y, ends.p2.x, ends.p2.y, a.x, a.y, b.x, b.y)) return true;
        }
        return false;
    }

    function hitsInLasso(pts) {
        const nodes = [];
        const links = [];
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (nodeHitsLasso(n, pts)) nodes.push(n.id);
        });
        (data.whiteboard.links || []).forEach(function (link) {
            if (linkHitsLasso(link, pts)) links.push(link.id);
        });
        return { nodes: nodes, links: links };
    }

    function setMarqueeOverlay(a, b) {
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(b.x - a.x);
        const h = Math.abs(b.y - a.y);
        setBoardOverlay('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z', 'wb-marquee');
    }

    function boardTextValue(rec) {
        const title = rec && rec.title ? String(rec.title) : '';
        const body = rec && rec.body ? String(rec.body) : '';
        if (title && body) return title + '\n' + body;
        return title || body;
    }

    function beginBoardTextEdit(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        const el = document.querySelector('#boardStage [data-node="' + id + '"]');
        if (!rec || !el) return;
        const active = document.querySelector('#boardStage [data-wb-text].is-edit');
        if (active && active.closest('.wb-node') === el) {
            active.focus();
            return;
        }
        commitBoardTextEdit();
        rememberBoard();
        selectBoardNode(id);
        hideBoardAddMenu();
        hideBoardMore();
        let label = el.querySelector('[data-wb-text]');
        const copy = el.querySelector('.wb-copy');
        if (!label && copy) {
            copy.insertAdjacentHTML('beforeend', '<div class="wb-text" data-wb-text></div>');
            label = copy.querySelector('[data-wb-text]');
        }
        if (!label) return;
        label.textContent = boardTextValue(rec);
        label.contentEditable = 'true';
        label.classList.add('is-edit');
        el.classList.add('is-editing');
        label.focus();
        const range = document.createRange();
        range.selectNodeContents(label);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function commitBoardTextEdit() {
        const label = document.querySelector('#boardStage [data-wb-text].is-edit');
        if (!label) return;
        const nodeEl = label.closest('.wb-node');
        const rec = nodeEl && (data.whiteboard.nodes || []).find(function (n) { return n.id === nodeEl.dataset.node; });
        label.contentEditable = 'false';
        label.classList.remove('is-edit');
        if (nodeEl) nodeEl.classList.remove('is-editing');
        if (!rec) return;
        const parts = String(label.innerText || '').replace(/\r/g, '').split('\n');
        rec.title = (parts.shift() || '').trim().slice(0, 120);
        rec.body = parts.join('\n').replace(/^\n+/, '').trim().slice(0, 800);
        renderWhiteboard();
        schedulePersist();
    }

    function layerBoardNode(id, dir) {
        const nodes = data.whiteboard.nodes || [];
        const i = nodes.findIndex(function (n) { return n.id === id; });
        if (i < 0) return;
        if (dir === 'up' && i < nodes.length - 1) {
            rememberBoard();
            const swap = nodes[i];
            nodes[i] = nodes[i + 1];
            nodes[i + 1] = swap;
        } else if (dir === 'down' && i > 0) {
            rememberBoard();
            const swap = nodes[i];
            nodes[i] = nodes[i - 1];
            nodes[i - 1] = swap;
        } else if (dir === 'front' || dir === 'forward') {
            rememberBoard();
            nodes.push(nodes.splice(i, 1)[0]);
        } else if (dir === 'back') {
            rememberBoard();
            nodes.unshift(nodes.splice(i, 1)[0]);
        } else {
            return;
        }
        data.whiteboard.nodes = nodes;
        renderWhiteboard();
        schedulePersist();
    }

    function resizeFromHandle(drag, rec, dx, dy, lockAspect) {
        if (isStrokeRec(rec)) return;
        const hdl = drag.handle || 'se';
        const min = isStrokeShape(rec.shape) ? 4 : 48;
        let w = drag.ow;
        let h = drag.oh;
        if (hdl.indexOf('e') >= 0) w = drag.ow + dx;
        if (hdl.indexOf('s') >= 0) h = drag.oh + dy;
        if (hdl.indexOf('w') >= 0) w = drag.ow - dx;
        if (hdl.indexOf('n') >= 0) h = drag.oh - dy;
        if (lockAspect) {
            const ratio = isImageNode(rec) ? imageRatio(rec) : drag.ow / (drag.oh || 1);
            if (hdl === 'n' || hdl === 's') w = h * ratio;
            else if (hdl === 'e' || hdl === 'w') h = w / ratio;
            else if (Math.abs(w - drag.ow) >= Math.abs(h - drag.oh)) h = w / ratio;
            else w = h * ratio;
            const boxed = clampRatioSize(w, h, ratio, min, 1200);
            w = boxed.w;
            h = boxed.h;
        } else {
            w = Math.max(min, Math.min(1200, w));
            h = Math.max(min, Math.min(1200, h));
        }
        rec.w = w;
        rec.h = h;
        rec.x = hdl.indexOf('w') >= 0 ? drag.ox + (drag.ow - w) : ((hdl === 'n' || hdl === 's') && lockAspect ? drag.ox + (drag.ow - w) / 2 : drag.ox);
        rec.y = hdl.indexOf('n') >= 0 ? drag.oy + (drag.oh - h) : ((hdl === 'e' || hdl === 'w') && lockAspect ? drag.oy + (drag.oh - h) / 2 : drag.oy);
    }

    function applyDrawBox(origin, rec, at, lockAspect) {
        const stroke = isStrokeRec(rec);
        if (stroke) {
            let end = at;
            if (lockAspect) end = snapAxis(origin, at, true);
            if (rec.x1 == null) rec.x1 = origin.x;
            if (rec.y1 == null) rec.y1 = origin.y;
            setStrokePoint(rec, 'end', end, true);
            return;
        }
        let dx = at.x - origin.x;
        let dy = at.y - origin.y;
        if (lockAspect) {
            const side = Math.max(8, Math.abs(dx), Math.abs(dy));
            dx = dx < 0 ? -side : side;
            dy = dy < 0 ? -side : side;
        }
        rec.x = dx < 0 ? origin.x + dx : origin.x;
        rec.y = dy < 0 ? origin.y + dy : origin.y;
        rec.w = Math.max(8, Math.min(1200, Math.abs(dx) || 8));
        rec.h = Math.max(8, Math.min(1200, Math.abs(dy) || 8));
    }

    function drawLocksAspect(shape, shift) {
        const locked = shape === 'circle' || shape === 'ellipse';
        return shift ? !locked : locked;
    }

    function shapeSize(node) {
        const shape = (node && node.shape) || typeMeta(node && node.type).shape || 'process';
        const size = BOARD_SHAPES[shape] || BOARD_SHAPES.process;
        return { w: Number(node && node.w) || size.w, h: Number(node && node.h) || size.h, shape: shape };
    }

    function normalizeBoardNode(node) {
        const rec = node && typeof node === 'object' ? node : {};
        const meta = typeMeta(rec.type || 'note');
        rec.type = rec.type || 'note';
        rec.shape = rec.shape || meta.shape || 'process';
        const size = BOARD_SHAPES[rec.shape] || BOARD_SHAPES.process;
        rec.x = Number(rec.x) || 0;
        rec.y = Number(rec.y) || 0;
        rec.w = Number(rec.w) || size.w;
        rec.h = Number(rec.h) || size.h;
        rec.title = rec.title || '';
        rec.body = rec.body || '';
        rec.src = rec.src || '';
        rec.done = !!rec.done;
        rec.stroke = rec.stroke || '#e4e4e7';
        rec.fill = !rec.fill || rec.fill === '#111113' ? 'transparent' : rec.fill;
        rec.sw = Number(rec.sw) || 1.75;
        rec.op = rec.op == null ? 1 : Math.max(0, Math.min(1, Number(rec.op)));
        rec.href = rec.href || '';
        rec.flipX = !!rec.flipX;
        rec.flipY = !!rec.flipY;
        rec.locked = !!rec.locked;
        rec.dash = rec.dash === 'dashed' || rec.dash === 'dotted' ? rec.dash : 'solid';
        rec.edge = rec.edge === 'sharp' ? 'sharp' : 'round';
        rec.radius = shapeRadius(rec);
        rec.ratio = Number(rec.ratio) > 0 ? Number(rec.ratio) : 0;
        rec.pts = Array.isArray(rec.pts) ? rec.pts : [];
        rec.startId = rec.startId || '';
        rec.startPort = rec.startPort || '';
        rec.endId = rec.endId || '';
        rec.endPort = rec.endPort || '';
        if (isStrokeRec(rec)) layoutStroke(rec);
        return rec;
    }

