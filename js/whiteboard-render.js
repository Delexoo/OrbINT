/* Whiteboard render, links, nodes, playbooks */

    function boardImageTag(node) {
        const w = Math.max(1, Math.round(node.imgW || node.w || 240));
        const h = Math.max(1, Math.round(node.imgH || node.h || 168));
        if (node.blur) {
            return '<img src="' + esc(node.blur) + '" data-full="' + esc(node.src) + '" width="' + w + '" height="' + h + '" alt="" style="filter:blur(12px)">';
        }
        return '<img src="' + esc(node.src) + '" width="' + w + '" height="' + h + '" alt="">';
    }

    document.addEventListener('load', function (event) {
        const img = event.target;
        if (!img || !img.getAttribute || !img.getAttribute('data-full')) return;
        const full = img.getAttribute('data-full');
        img.removeAttribute('data-full');
        img.style.filter = '';
        if (full) img.src = full;
    }, true);

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
                    '<label for="wb-embed-' + esc(node.id) + '">Page URL</label>' +
                    '<input id="wb-embed-' + esc(node.id) + '" type="url" data-wb-embed-url placeholder="Paste page URL">' +
                    '</div>';
            } else if (node.type === 'image' && node.src) {
                copy = boardImageTag(node);
            } else if (node.type === 'image') {
                copy = '<div class="wb-image-slot">' +
                    '<button type="button" data-wb-upload>Upload</button>' +
                    '<label for="wb-image-' + esc(node.id) + '">Image URL</label>' +
                    '<input id="wb-image-' + esc(node.id) + '" type="url" data-wb-image-url placeholder="Paste image URL">' +
                    '</div>';
            } else {
                const img = node.shape === 'document' && node.src ? boardImageTag(node) : '';
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

