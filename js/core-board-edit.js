/* Whiteboard link edit, clipboard, images, duplicates */
    function findBoardLink(id) {
        if (!id) return null;
        return (data.whiteboard.links || []).find(function (l) { return l.id === id; }) || null;
    }

    function linkEnds(link) {
        const a = link && link.from ? findBoardNode(link.from) : null;
        const b = link && link.to ? findBoardNode(link.to) : null;
        let fromPort = (link && link.fromPort) || '';
        let toPort = (link && link.toPort) || '';
        let p1;
        let p2;
        if (a) {
            if (!fromPort && b) {
                const sb = shapeSize(b);
                fromPort = inferPort(a, { x: (b.x || 0) + sb.w / 2, y: (b.y || 0) + sb.h / 2 });
            }
            p1 = portPoint(a, fromPort || 'e');
        } else {
            p1 = { x: Number(link && link.x1) || 0, y: Number(link && link.y1) || 0 };
        }
        if (b) {
            if (!toPort && a) {
                const sa = shapeSize(a);
                toPort = inferPort(b, { x: (a.x || 0) + sa.w / 2, y: (a.y || 0) + sa.h / 2 });
            }
            p2 = portPoint(b, toPort || 'w');
        } else {
            p2 = { x: Number(link && link.x2) || 0, y: Number(link && link.y2) || 0 };
        }
        if (!a) fromPort = portFromDelta(p1, p2);
        if (!b) toPort = portFromDelta(p2, p1);
        return { p1: p1, p2: p2, fromPort: fromPort || 'e', toPort: toPort || 'w' };
    }

    function setLinkPoint(link, which, world, snap) {
        if (!link) return;
        const skip = which === 'start' ? link.to : link.from;
        let hit = snap ? nearestBind(world, skip) : null;
        if (hit && hit.id === skip) hit = null;
        if (which === 'start') {
            link.from = hit ? hit.id : '';
            link.fromPort = hit ? hit.port : '';
            link.x1 = hit ? hit.x : world.x;
            link.y1 = hit ? hit.y : world.y;
        } else {
            link.to = hit ? hit.id : '';
            link.toPort = hit ? hit.port : '';
            link.x2 = hit ? hit.x : world.x;
            link.y2 = hit ? hit.y : world.y;
        }
        setStrokeSnap(hit);
    }

    function addBoardLink(from, fromPort, to, toPort) {
        if (!from || !to || from === to) return;
        const links = data.whiteboard.links || [];
        const dup = links.some(function (l) {
            return l.from === from && l.to === to && (l.fromPort || '') === (fromPort || '') && (l.toPort || '') === (toPort || '');
        });
        if (dup) return;
        rememberBoard();
        links.push(normalizeLink({ from: from, to: to, fromPort: fromPort || 'e', toPort: toPort || 'w', label: '' }));
        data.whiteboard.links = links;
        renderWhiteboard();
        schedulePersist();
    }

    function clearBoardLinks(id) {
        if (!id) return;
        const links = data.whiteboard.links || [];
        const next = links.filter(function (l) { return l.from !== id && l.to !== id; });
        if (next.length === links.length) return;
        rememberBoard();
        data.whiteboard.links = next;
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
    }

    function deleteBoardLink(id) {
        if (!id) return;
        const links = data.whiteboard.links || [];
        if (!links.some(function (l) { return l.id === id; })) return;
        rememberBoard();
        data.whiteboard.links = links.filter(function (l) { return l.id !== id; });
        if (boardLinkSelected === id) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
    }

    function detachBoardLink(id, which) {
        const link = findBoardLink(id);
        if (!link) return;
        if (!link.from && !link.to) return;
        rememberBoard();
        const ends = linkEnds(link);
        link.x1 = ends.p1.x;
        link.y1 = ends.p1.y;
        link.x2 = ends.p2.x;
        link.y2 = ends.p2.y;
        if (!which || which === 'both' || which === 'start') {
            link.from = '';
            link.fromPort = '';
        }
        if (!which || which === 'both' || which === 'end') {
            link.to = '';
            link.toPort = '';
        }
        renderWhiteboard();
        schedulePersist();
    }

    function duplicateBoardLink(id) {
        const link = findBoardLink(id);
        if (!link) return;
        rememberBoard();
        const ends = linkEnds(link);
        const copy = normalizeLink(Object.assign({}, link, {
            id: '',
            from: '',
            to: '',
            fromPort: '',
            toPort: '',
            x1: ends.p1.x + 24,
            y1: ends.p1.y + 24,
            x2: ends.p2.x + 24,
            y2: ends.p2.y + 24
        }));
        data.whiteboard.links = data.whiteboard.links || [];
        data.whiteboard.links.push(copy);
        selectBoardLink(copy.id);
        schedulePersist();
    }

    function selectBoardLink(id) {
        boardLinkSelected = id || '';
        boardSelected = '';
        boardPicked = [];
        boardPickedLinks = id ? [id] : [];
        const stage = $('boardStage');
        if (stage) {
            stage.querySelectorAll('.wb-node').forEach(function (el) {
                el.classList.remove('is-on');
                const box = el.querySelector('.wb-handles');
                if (box) box.remove();
            });
        }
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function styleBoardItem() {
        return findBoardNode(boardSelected) || findBoardLink(boardLinkSelected);
    }

    function syncBoardInspect() {
        const inspect = $('boardInspect');
        if (!inspect) return;
        const rec = findBoardNode(boardSelected) || findBoardLink(boardLinkSelected);
        inspect.hidden = !rec;
        inspect.classList.toggle('is-link', !!boardLinkSelected && !boardSelected);
        inspect.classList.toggle('is-stroke', !!(boardSelected && rec && isStrokeRec(rec)));
        if (!rec) return;
        if (boardSelected) {
            const size = shapeSize(rec);
            const w = $('boardSizeW');
            const h = $('boardSizeH');
            if (w && document.activeElement !== w) w.value = Math.round(size.w);
            if (h && document.activeElement !== h) h.value = Math.round(size.h);
        }
        const strokeBox = $('boardStrokeSwatches');
        const fillBox = $('boardFillSwatches');
        if (strokeBox) {
            strokeBox.innerHTML = BOARD_STROKES.map(function (color) {
                return '<button type="button" class="board-swatch' + (rec.stroke === color ? ' is-on' : '') + '" data-board-stroke="' + color + '" style="background:' + color + '" aria-label="Stroke"></button>';
            }).join('');
        }
        if (fillBox) {
            fillBox.innerHTML = BOARD_FILLS.map(function (color) {
                const none = color === 'transparent';
                return '<button type="button" class="board-swatch' + (none ? ' is-none' : '') + (rec.fill === color ? ' is-on' : '') + '" data-board-fill="' + color + '"' + (none ? '' : ' style="background:' + color + '"') + ' aria-label="Fill"></button>';
            }).join('');
        }
        inspect.querySelectorAll('[data-board-sw]').forEach(function (btn) {
            btn.classList.toggle('is-on', Number(btn.getAttribute('data-board-sw')) === Number(rec.sw || 1.75));
        });
        inspect.querySelectorAll('[data-board-dash]').forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-board-dash') === (rec.dash || 'solid'));
        });
        const radius = shapeRadius(rec);
        const radiusRange = $('boardRadius');
        if (radiusRange && document.activeElement !== radiusRange) radiusRange.value = String(Math.round(radius));
        const op = $('boardOpacity');
        if (op && document.activeElement !== op) op.value = Math.round((rec.op == null ? 1 : rec.op) * 100);
    }

    function applyBoardSizeFromFields() {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
        if (!rec) return;
        rememberBoard();
        const w = Number($('boardSizeW') && $('boardSizeW').value);
        const h = Number($('boardSizeH') && $('boardSizeH').value);
        if (isImageNode(rec)) {
            const ratio = imageRatio(rec);
            if (document.activeElement && document.activeElement.id === 'boardSizeH' && h) {
                rec.h = Math.max(48, Math.min(1200, h));
                rec.w = Math.max(48, Math.min(1200, rec.h * ratio));
            } else {
                rec.w = Math.max(48, Math.min(1200, w || rec.w));
                rec.h = Math.max(48, Math.min(1200, rec.w / ratio));
            }
            rec.ratio = ratio;
        } else if (isStrokeRec(rec)) {
            layoutStroke(rec);
        } else {
            if (w) rec.w = Math.max(48, Math.min(1200, w));
            if (h) rec.h = Math.max(48, Math.min(1200, h));
        }
        const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
        applyNodeBox(el, rec);
        drawBoardLinks($('boardLinks'), data.whiteboard);
        schedulePersist();
    }

    function findBoardNode(id) {
        return (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
    }

    function cloneBoardPayload(rec) {
        return {
            type: rec.type,
            shape: rec.shape,
            w: rec.w,
            h: rec.h,
            title: rec.title,
            body: rec.body,
            src: rec.src,
            href: rec.href || '',
            stroke: rec.stroke,
            fill: rec.fill,
            sw: rec.sw,
            op: rec.op,
            flipX: !!rec.flipX,
            flipY: !!rec.flipY,
            dash: rec.dash || 'solid',
            edge: rec.edge || 'round',
            radius: rec.radius,
            ratio: Number(rec.ratio) > 0 ? Number(rec.ratio) : 0,
            pts: Array.isArray(rec.pts) ? rec.pts : [],
            x1: rec.x1,
            y1: rec.y1,
            x2: rec.x2,
            y2: rec.y2,
            startId: rec.startId || '',
            startPort: rec.startPort || '',
            endId: rec.endId || '',
            endPort: rec.endPort || ''
        };
    }

    function copyBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        boardClip = cloneBoardPayload(rec);
        boardClip.x = rec.x;
        boardClip.y = rec.y;
    }

    function cutBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        copyBoardNode(id);
        deleteBoardNode(id);
    }

    function pasteBoardNode(at) {
        if (!boardClip) return;
        rememberBoard();
        const origin = at || { x: (boardClip.x || 0) + 28, y: (boardClip.y || 0) + 28 };
        const dx = origin.x - (boardClip.x || 0);
        const dy = origin.y - (boardClip.y || 0);
        const copy = normalizeBoardNode(Object.assign({}, boardClip, {
            id: uid('nd'),
            x: origin.x,
            y: origin.y,
            x1: boardClip.x1 != null ? boardClip.x1 + dx : boardClip.x1,
            y1: boardClip.y1 != null ? boardClip.y1 + dy : boardClip.y1,
            x2: boardClip.x2 != null ? boardClip.x2 + dx : boardClip.x2,
            y2: boardClip.y2 != null ? boardClip.y2 + dy : boardClip.y2,
            startId: '',
            startPort: '',
            endId: '',
            endPort: '',
            locked: false
        }));
        data.whiteboard.nodes.push(copy);
        boardSelected = copy.id;
        renderWhiteboard();
        schedulePersist();
        return copy;
    }

    function flipBoardNode(id, axis) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        if (isStrokeRec(rec)) {
            if (axis === 'h') {
                const t = rec.x1; rec.x1 = rec.x2; rec.x2 = t;
            } else {
                const t = rec.y1; rec.y1 = rec.y2; rec.y2 = t;
            }
            const sid = rec.startId; rec.startId = rec.endId; rec.endId = sid;
            const sport = rec.startPort; rec.startPort = rec.endPort; rec.endPort = sport;
            layoutStroke(rec);
        } else if (axis === 'h') rec.flipX = !rec.flipX;
        else rec.flipY = !rec.flipY;
        renderWhiteboard();
        schedulePersist();
    }

    function toggleBoardLock(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        rec.locked = !rec.locked;
        renderWhiteboard();
        schedulePersist();
    }

    function copyBoardStyle(id) {
        const rec = findBoardNode(id) || findBoardLink(id) || findBoardLink(boardLinkSelected);
        if (!rec) return;
        boardStyleClip = { stroke: rec.stroke, fill: rec.fill, sw: rec.sw, op: rec.op, dash: rec.dash, radius: rec.radius, edge: rec.edge };
    }

    function pasteBoardStyle(id) {
        const rec = findBoardNode(id) || findBoardLink(id) || findBoardLink(boardLinkSelected);
        if (!rec || !boardStyleClip || rec.locked) return;
        rec.stroke = boardStyleClip.stroke;
        if (rec.fill !== undefined && boardStyleClip.fill !== undefined) rec.fill = boardStyleClip.fill;
        rec.sw = boardStyleClip.sw;
        rec.op = boardStyleClip.op;
        if (boardStyleClip.dash) rec.dash = boardStyleClip.dash;
        if (boardStyleClip.radius != null) rec.radius = boardStyleClip.radius;
        if (boardStyleClip.edge) rec.edge = boardStyleClip.edge;
        renderWhiteboard();
        schedulePersist();
    }

    function looksLikeImageSrc(text) {
        const value = String(text || '').trim();
        return /^(https?:\/\/|data:image\/)/i.test(value);
    }

    function isImageNode(rec) {
        return !!(rec && (rec.type === 'image' || rec.shape === 'image'));
    }

    function imageRatio(rec) {
        const r = Number(rec && rec.ratio);
        if (r > 0.04 && r < 50) return r;
        const w = Number(rec && rec.w) || 0;
        const h = Number(rec && rec.h) || 0;
        return w > 0 && h > 0 ? w / h : 4 / 3;
    }

    function clampRatioSize(w, h, ratio, min, max) {
        min = min || 48;
        max = max || 1200;
        w = Math.abs(w) || min;
        h = Math.abs(h) || min;
        if (ratio > 0) h = w / ratio;
        if (w > max) { w = max; h = w / ratio; }
        if (h > max) { h = max; w = h * ratio; }
        if (w < min) { w = min; h = w / ratio; }
        if (h < min) { h = min; w = h * ratio; }
        return { w: w, h: h };
    }

    function applyImageRatio(rec, prefer) {
        if (!isImageNode(rec)) return;
        const ratio = imageRatio(rec);
        rec.ratio = ratio;
        const size = prefer === 'h'
            ? clampRatioSize((Number(rec.h) || 168) * ratio, rec.h || 168, ratio, 48, 1200)
            : clampRatioSize(rec.w || 240, rec.h || 168, ratio, 48, 1200);
        rec.w = size.w;
        rec.h = size.h;
    }

    function fitImageNode(rec, src) {
        if (!rec || !src) return;
        const img = new Image();
        img.onload = function () {
            const nw = img.naturalWidth || img.width || 0;
            const nh = img.naturalHeight || img.height || 0;
            if (!(nw > 0 && nh > 0)) return;
            rec.ratio = nw / nh;
            applyImageRatio(rec, 'w');
            const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
            applyNodeBox(el, rec);
            followAllStrokes(rec.id);
            drawBoardLinks($('boardLinks'), data.whiteboard);
            syncBoardInspect();
            schedulePersist();
        };
        img.src = src;
    }

    function clipboardImageFile(clip) {
        if (!clip) return null;
        const files = Array.from(clip.files || []);
        let hit = files.find(function (file) { return file && /^image\//i.test(file.type); });
        if (hit) return hit;
        const items = Array.from(clip.items || []);
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && /^image\//i.test(items[i].type)) {
                const file = items[i].getAsFile && items[i].getAsFile();
                if (file) return file;
            }
        }
        return null;
    }

    function applyImageSrc(id, src, title) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked || !src) return false;
        rememberBoard();
        rec.type = 'image';
        rec.shape = rec.shape === 'image' ? rec.shape : (typeMeta('image').shape || 'image');
        rec.src = src;
        rec.blur = '';
        if (title) rec.title = title;
        fitImageNode(rec, src);
        renderWhiteboard();
        schedulePersist();
        const probe = new Image();
        probe.onload = function () {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = Math.max(1, Math.round(16 * probe.height / Math.max(1, probe.width)));
                canvas.getContext('2d').drawImage(probe, 0, 0, canvas.width, canvas.height);
                rec.blur = canvas.toDataURL('image/jpeg', 0.45);
                rec.imgW = probe.naturalWidth || probe.width;
                rec.imgH = probe.naturalHeight || probe.height;
                renderWhiteboard();
                schedulePersist();
            } catch (error) {}
        };
        probe.src = src;
        return true;
    }

    function placePastedImage(src, title, at) {
        const rec = findBoardNode(boardSelected);
        if (rec && rec.type === 'image') {
            applyImageSrc(rec.id, src, title);
            return rec;
        }
        const origin = at || boardPointerAt || { x: 180, y: 140 };
        const node = addBoardNode('image', { x: origin.x, y: origin.y, w: origin.w || 240, h: origin.h || 168 });
        if (node) applyImageSrc(node.id, src, title);
        return node;
    }

    function readImageFile(file, ontoId, at) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
            const src = String(reader.result || '');
            if (!src) return;
            if (ontoId && applyImageSrc(ontoId, src, file.name || '')) return;
            placePastedImage(src, file.name || '', at);
        };
        reader.readAsDataURL(file);
    }

    function focusImageSlot(id) {
        requestAnimationFrame(function () {
            const input = document.querySelector('#boardStage [data-node="' + id + '"] [data-wb-image-url], #boardStage [data-node="' + id + '"] [data-wb-embed-url]');
            if (input) input.focus();
        });
    }

    function openBoardImagePicker(id) {
        if (id) {
            boardSelected = id;
            boardMenuMode = 'node';
        }
        const input = $('boardImageFile');
        if (input) input.click();
    }

    function setBoardHref(id) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        const next = window.prompt('Link URL', rec.href || 'https://');
        if (next == null) return;
        rec.href = String(next).trim();
        renderWhiteboard();
        schedulePersist();
    }

    function duplicateBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        const copy = normalizeBoardNode(Object.assign(cloneBoardPayload(rec), {
            id: uid('nd'),
            x: (rec.x || 0) + 28,
            y: (rec.y || 0) + 28,
            x1: rec.x1 != null ? rec.x1 + 28 : rec.x1,
            y1: rec.y1 != null ? rec.y1 + 28 : rec.y1,
            x2: rec.x2 != null ? rec.x2 + 28 : rec.x2,
            y2: rec.y2 != null ? rec.y2 + 28 : rec.y2,
            startId: '',
            startPort: '',
            endId: '',
            endPort: '',
            locked: false
        }));
        data.whiteboard.nodes.push(copy);
        boardSelected = copy.id;
        renderWhiteboard();
        schedulePersist();
        return copy;
    }

    function applyBoardKind(kind) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
        if (!rec || BOARD_PLACE.indexOf(kind) < 0) return;
        rec.type = kind;
        rec.shape = typeMeta(kind).shape || kind;
        if (kind === 'circle' || kind === 'square') {
            const side = Math.max(shapeSize(rec).w, shapeSize(rec).h);
            rec.w = side;
            rec.h = side;
        }
        if (kind === 'text' && !rec.title) rec.title = 'Text';
        if (kind === 'note') {
            rec.title = rec.title && rec.title !== 'Note' ? rec.title : '';
            rec.fill = rec.fill && rec.fill !== 'transparent' && rec.fill !== 'none' ? rec.fill : '#f3e08a';
            rec.stroke = rec.stroke || '#c9a227';
            if (!(rec.w > 120)) rec.w = 176;
            if (!(rec.h > 120)) rec.h = 176;
        }
        if (kind === 'person' && !rec.title) rec.title = subjectName() || 'Person';
        renderWhiteboard();
        schedulePersist();
        if (kind === 'text' || kind === 'note' || kind === 'finding' || kind === 'question') beginBoardTextEdit(rec.id);
    }

