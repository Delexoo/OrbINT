/* Shared click routing */
    function onClick(event) {
        if (event.target.closest('#calPop')) {
            onCalendarClick(event);
            return;
        }
        if (event.target.closest('#timePop')) {
            onTimeClick(event);
            return;
        }
        if (event.target.closest('#tlInfoPop')) {
            onTlInfoClick(event);
            return;
        }
        const calBtn = event.target.closest('[data-tl-cal], [data-fact-cal], #eventDateBtn') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-cal], #eventDateBtn');
        if (calBtn) {
            event.preventDefault();
            openCalendar(calBtn);
            return;
        }
        const timeBtn = event.target.closest('[data-tl-time], [data-fact-time]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-time]');
        if (timeBtn) {
            event.preventDefault();
            openTimePicker(timeBtn);
            return;
        }
        const infoBtn = event.target.closest('[data-tl-info]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-info]');
        if (infoBtn) {
            event.preventDefault();
            openTlInfoPop(infoBtn);
            return;
        }
        if (calState) closeCalendar();
        if (timeState) closeTimePicker();
        if (infoState) closeTlInfoPop();
        const tlAct = event.target.closest('[data-tl-ctx]');
        if (tlAct) {
            runTimelineMenu(tlAct.getAttribute('data-tl-ctx'), tlMenuId || selectedEvent);
            return;
        }
        if (!event.target.closest('#timelineMenu')) hideTimelineMenu();
        const pageBtn = event.target.closest('[data-page]');
        if (pageBtn && pageBtn.closest('#pageSwitch')) {
            const id = pageBtn.getAttribute('data-page');
            if (id === 'casebook') {
                const panel = $('profilePanel');
                const toggle = $('profileToggle');
                if (panel && !panel.classList.contains('open') && toggle) toggle.click();
                return;
            }
            setPage(id);
            return;
        }
        const uploadBtn = event.target.closest('[data-wb-upload]');
        if (uploadBtn) {
            const node = uploadBtn.closest('.wb-node');
            openBoardImagePicker(node && node.dataset.node);
            return;
        }

        const addEv = event.target.closest('#timelineAdd, #timelineEmptyAdd');
        if (addEv) {
            const events = data.timeline || [];
            let x = 220;
            events.forEach(function (ev) { x = Math.max(x, (Number(ev.pinX) || 0) + TL_GAP); });
            addEventAt(x, events.length % 2 === 0 ? -1 : 1);
            return;
        }
        const foldBit = event.target.closest('[data-tl-fold]');
        if (foldBit) {
            event.preventDefault();
            toggleTlBit(foldBit.getAttribute('data-event'), foldBit.getAttribute('data-tl-fold'), foldBit.getAttribute('data-note-id'));
            return;
        }
        const dropBit = event.target.closest('[data-tl-drop]');
        if (dropBit) {
            event.preventDefault();
            dropTlBit(dropBit.getAttribute('data-event'), dropBit.getAttribute('data-tl-drop'), dropBit.getAttribute('data-note-id'));
            return;
        }
        const delEv = event.target.closest('[data-del-event]');
        if (delEv) { deleteEvent(delEv.getAttribute('data-del-event')); return; }
        const miniBtn = event.target.closest('[data-tl-mini]');
        if (miniBtn) {
            const id = miniBtn.getAttribute('data-tl-mini');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            const node = miniBtn.closest('.tl-node');
            if (rec && node) {
                rememberTimeline();
                rec.mini = !rec.mini;
                node.classList.toggle('is-mini', rec.mini);
                placeTlCard(node, rec);
                miniBtn.title = rec.mini ? 'Expand' : 'Minimize';
                miniBtn.setAttribute('aria-label', rec.mini ? 'Expand' : 'Minimize');
                miniBtn.setAttribute('aria-expanded', rec.mini ? 'false' : 'true');
                const extra = node.querySelector('.tl-extra');
                const finish = function () {
                    stackTimelineStems();
                    drawTimelineAxis();
                };
                if (reduceMotion()) {
                    finish();
                } else {
                    let frames = 0;
                    const tick = function () {
                        stackTimelineStems();
                        drawTimelineAxis();
                        frames += 1;
                        if (frames < 22) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                    if (extra) extra.addEventListener('transitionend', finish, { once: true });
                }
                schedulePersist();
            }
            return;
        }
        const clearImg = event.target.closest('[data-tl-clear-img]');
        if (clearImg) {
            const id = clearImg.getAttribute('data-tl-clear-img');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.image = '';
                if (rec.show) rec.show.image = false;
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const delNote = event.target.closest('[data-tl-del-note]');
        if (delNote) {
            const id = delNote.getAttribute('data-event');
            const nid = delNote.getAttribute('data-tl-del-note');
            const rec = findTimelineEvent(id);
            if (rec) {
                rememberTimeline();
                rec.moreNotes = (rec.moreNotes || []).filter(function (note) { return note.id !== nid; });
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const expandImg = event.target.closest('[data-tl-expand], .tl-thumb');
        if (expandImg && expandImg.closest('.tl-media')) {
            const id = expandImg.getAttribute('data-tl-expand') || (expandImg.closest('[data-event]') && expandImg.closest('[data-event]').getAttribute('data-event'));
            const rec = findTimelineEvent(id);
            if (rec && rec.image) expandTimelineImage(rec.image);
            return;
        }
        const photoBtn = event.target.closest('[data-tl-photo]');
        if (photoBtn) {
            timelinePhotoId = photoBtn.getAttribute('data-tl-photo');
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        const conEv = event.target.closest('[data-connect-event]');
        if (conEv) { toggleConnect(conEv.getAttribute('data-connect-event')); return; }
        if (event.target.closest('#timelineIsland')) {
            timelineConnectOn = false;
            connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.closest('#timelineConnectBtn, [data-tl-connect]')) {
            timelineConnectOn = !timelineConnectOn;
            if (!timelineConnectOn) connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.id === 'timelineDelete' && selectedEvent) {
            deleteEvent(selectedEvent);
            return;
        }
        if (event.target.id === 'timelineRecenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        const selEv = event.target.closest('[data-event]');
        if (selEv && selEv.closest('#timelineList') && !event.target.closest('button, input, [contenteditable="true"]')) {
            const id = selEv.getAttribute('data-event');
            if (timelineConnectOn || connectFrom) { toggleConnect(id); return; }
            selectedEvent = id;
            document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
                el.classList.toggle('is-on', el.getAttribute('data-event') === id);
            });
            return;
        }
        if (event.target.id === 'eventCancel' || event.target.id === 'eventClose') { hideSheet($('eventSheet')); return; }
        if (event.target.id === 'eventSheet') hideSheet($('eventSheet'));

        const done = event.target.closest('[data-board-done]');
        if (done) { toggleBoardDone(done.getAttribute('data-board-done')); return; }
        const addKind = event.target.closest('[data-board-add]');
        if (addKind) { placeFromMenu(addKind.getAttribute('data-board-add')); return; }
        const addFact = event.target.closest('[data-board-add-fact]');
        if (addFact) {
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec) {
                rec.type = 'data';
                rec.shape = typeMeta('data').shape || 'data';
                rec.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                rec.body = addFact.getAttribute('data-fact-value') || '';
                renderWhiteboard();
                schedulePersist();
                return;
            }
            const node = addBoardNode('data', at);
            if (node) {
                node.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                node.body = addFact.getAttribute('data-fact-value') || '';
            renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPhoto = event.target.closest('[data-board-add-photo]');
        if (addPhoto) {
            const photos = imageItems();
            const item = photos[Number(addPhoto.getAttribute('data-board-add-photo'))];
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec && item) {
                rec.type = 'image';
                rec.shape = typeMeta('image').shape || 'image';
                rec.src = item.src;
                rec.title = item.name || item.value || rec.title || 'Photo';
            renderWhiteboard();
            schedulePersist();
            return;
        }
            const node = addBoardNode('image', at);
            if (node && item) {
                node.src = item.src;
                node.title = item.name || item.value || 'Photo';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPlay = event.target.closest('[data-board-add-play]');
        if (addPlay) {
            const at = boardDropAt;
            hideBoardAddMenu();
            insertPlaybook(addPlay.getAttribute('data-board-add-play'), at);
            return;
        }
        const addUpload = event.target.closest('[data-board-add-upload]');
        if (addUpload) {
            hideBoardAddMenu(true);
            const input = $('boardImageFile');
            if (input) input.click();
            return;
        }
        const moreBtn = event.target.closest('[data-board-more]');
        if (moreBtn) {
            hideBoardAddMenu();
            closeBoardPresets();
            const more = $('boardMoreMenu');
            if (more && !more.hidden) hideBoardMore();
            else showBoardMore();
            return;
        }
        if (event.target.closest('[data-board-presets]')) {
            hideBoardAddMenu();
            hideBoardMore();
            const sheet = $('boardPresetSheet');
            if (sheet && !sheet.hidden) closeBoardPresets();
            else openBoardPresets();
            return;
        }
        if (event.target.id === 'boardPresetClose' || event.target.id === 'boardPresetSheet') {
            closeBoardPresets();
            return;
        }
        const presetPick = event.target.closest('[data-board-preset]');
        if (presetPick) {
            insertBoardPreset(presetPick.getAttribute('data-board-preset'));
            return;
        }
        const more = $('boardMoreMenu');
        if (more && !more.hidden && !event.target.closest('#boardMoreMenu, [data-board-more]')) hideBoardMore();
        const addMenu = $('boardAddMenu');
        if (addMenu && !addMenu.hidden) {
            if (addMenu.dataset.skip) {
                delete addMenu.dataset.skip;
            } else if (!event.target.closest('#boardAddMenu')) {
                hideBoardAddMenu();
            }
        }
        const stroke = event.target.closest('[data-board-stroke]');
        if (stroke && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.stroke = stroke.getAttribute('data-board-stroke');
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const fill = event.target.closest('[data-board-fill]');
        if (fill && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.fill = fill.getAttribute('data-board-fill');
                boardPaintFill = rec.fill;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const sw = event.target.closest('[data-board-sw]');
        if (sw && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.sw = Number(sw.getAttribute('data-board-sw')) || 1.75;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const dash = event.target.closest('[data-board-dash]');
        if (dash && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.dash = dash.getAttribute('data-board-dash') || 'solid';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const edge = event.target.closest('[data-board-edge]');
        if (edge && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.edge = edge.getAttribute('data-board-edge') || 'round';
                rec.radius = rec.edge === 'sharp' ? 0 : 12;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('[data-board-grid]')) {
            data.whiteboard.grid = data.whiteboard.grid === false;
            hideBoardAddMenu();
            renderWhiteboard();
            schedulePersist();
            return;
        }
        const ctx = event.target.closest('[data-board-ctx]');
        if (ctx) {
            const act = ctx.getAttribute('data-board-ctx');
            const drop = boardDropAt;
            hideBoardAddMenu();
            if (act === 'cut' && boardSelected) cutBoardNode(boardSelected);
            if (act === 'copy' && boardSelected) copyBoardNode(boardSelected);
            if (act === 'paste') pasteBoardNode(drop || { x: 180, y: 140 });
            if (act === 'duplicate' && boardLinkSelected) duplicateBoardLink(boardLinkSelected);
            else if (act === 'duplicate' && boardSelected) duplicateBoardNode(boardSelected);
            if (act === 'clear-links' && boardSelected) clearBoardLinks(boardSelected);
            if (act === 'detach' && boardLinkSelected) detachBoardLink(boardLinkSelected, 'both');
            if (act === 'copy-style' && (boardSelected || boardLinkSelected)) copyBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'paste-style' && (boardSelected || boardLinkSelected)) pasteBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'flip-h' && boardSelected) flipBoardNode(boardSelected, 'h');
            if (act === 'flip-v' && boardSelected) flipBoardNode(boardSelected, 'v');
            if (act === 'link' && boardSelected) setBoardHref(boardSelected);
            if (act === 'lock' && boardSelected) toggleBoardLock(boardSelected);
            if (act === 'delete' && boardLinkSelected) deleteBoardLink(boardLinkSelected);
            else if (act === 'delete' && boardSelected) deleteBoardNode(boardSelected);
            if (act === 'recenter') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            }
            return;
        }
        const tool = event.target.closest('[data-board-tool]');
        if (tool) {
            hideBoardMore();
            hideBoardAddMenu();
            boardDrawToShape = false;
            const nextTool = tool.getAttribute('data-board-tool');
            boardTool = boardTool === nextTool && nextTool !== 'select' ? 'select' : nextTool;
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return;
        }
        const action = event.target.closest('[data-board-action]');
        if (action) {
            hideBoardMore();
            hideBoardAddMenu();
            const act = action.getAttribute('data-board-action');
            if (act === 'draw-shape') startDrawToShape();
            if (act === 'text-diagram') {
                const raw = window.prompt('Text to diagram\nUse lines, and arrows like Alice -> Bob', '');
                if (raw) textToDiagram(raw);
            }
            if (act === 'mermaid') {
                const raw = window.prompt('Mermaid flowchart\nExample:\ngraph TD\nA[Start] --> B{Check}\nB --> C[Done]', '');
                if (raw) mermaidToDiagram(raw);
            }
            if (act === 'wireframe') {
                const raw = window.prompt('Wireframe to code\nOne section per line. HTML is copied to the clipboard.', 'Header\nSearch\nResults\nFooter');
                if (raw) wireframeToCode(raw);
            }
            return;
        }
        if (event.target.closest('[data-board-undo]')) {
            undoBoard();
            return;
        }
        if (event.target.closest('[data-board-redo]')) {
            redoBoard();
            return;
        }
        if (event.target.id === 'boardAdd') {
            addBoardNode(BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'square');
            return;
        }
        if (event.target.id === 'boardInsertPlaybook') {
            insertPlaybook(($('boardPlaybook') && $('boardPlaybook').value) || 'username');
            return;
        }
        if (event.target.id === 'boardDelete' && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            deleteBoardSelection();
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardLinkSelected) {
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardSelected) {
            duplicateBoardNode(boardSelected);
            return;
        }
        if (event.target.id === 'boardEditBtn' && boardSelected) {
            beginBoardTextEdit(boardSelected);
            return;
        }
        const applyShape = event.target.closest('[data-board-apply]');
        if (applyShape && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const kind = applyShape.getAttribute('data-board-apply');
            if (rec && BOARD_SHAPES[kind]) {
                rec.type = kind;
                rec.shape = typeMeta(kind).shape || kind;
                if (kind === 'circle' || kind === 'square') {
                    const side = Math.max(shapeSize(rec).w, shapeSize(rec).h);
                    rec.w = side;
                    rec.h = side;
                }
                renderWhiteboard();
            schedulePersist();
            }
            return;
        }
        const layer = event.target.closest('[data-board-layer]');
        if (layer && boardSelected) {
            hideBoardAddMenu();
            layerBoardNode(boardSelected, layer.getAttribute('data-board-layer'));
            return;
        }
        if (event.target.id === 'boardSheetClose' || event.target.id === 'boardSheetCancel' || event.target.id === 'boardSheet') {
            hideSheet($('boardSheet'));
            return;
        }

        if (event.target.id === 'intelClose' || event.target.id === 'intelSheet') { hideSheet($('intelSheet')); return; }
        if (event.target.id === 'intelRun') {
            runDomainIntel($('intelHost') && $('intelHost').value);
            return;
        }
        if (event.target.id === 'metaClose' || event.target.id === 'metaSheet') hideSheet($('metaSheet'));
        const rev = event.target.closest('[data-rev]');
        if (rev) {
            openReverse(($('reverseMenu') && $('reverseMenu').dataset.src) || '', rev.getAttribute('data-rev'));
            return;
        }
        if (!event.target.closest('#reverseMenu')) {
            const menu = $('reverseMenu');
            if (menu) menu.hidden = true;
        }
        if (event.target.id === 'timelineZoomIn') {
            stopTimelineCamAnim();
            const cam = timelineCam();
            cam.z = Math.min(3.2, cam.z * 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
        if (event.target.id === 'timelineZoomOut') {
            stopTimelineCamAnim();
            const cam = timelineCam();
            cam.z = Math.max(0.2, cam.z / 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
    }

