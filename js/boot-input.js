/* Change, input, paste, keyboard, and file handlers */
    function onChange(event) {
        if (event.target.id === 'eventImagePick' && event.target.value) {
            $('eventImage').value = event.target.value;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-date')) {
            const id = event.target.getAttribute('data-tl-date');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.date = event.target.value;
                rec.pinned = true;
                renderTimeline();
            schedulePersist();
            }
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url')) {
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-href')) {
            const id = event.target.getAttribute('data-tl-href');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rec.source = String(event.target.value || '').trim();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardPlaybook' && event.target.value) {
            data.flowchart.preset = event.target.value;
            schedulePersist();
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            const rec = node && findBoardNode(node.dataset.node);
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onInput(event) {
        if (event.target.closest && event.target.closest('#timePop .time-num')) {
            applyTimeTyped(event.target);
            return;
        }
        const wbText = event.target.closest('[data-wb-text].is-edit');
        if (wbText) {
            const nodeEl = wbText.closest('.wb-node');
            const rec = nodeEl && (data.whiteboard.nodes || []).find(function (n) { return n.id === nodeEl.dataset.node; });
            if (rec) {
                const parts = String(wbText.innerText || '').replace(/\r/g, '').split('\n');
                rec.title = (parts.shift() || '').trim().slice(0, 120);
                rec.body = parts.join('\n').replace(/^\n+/, '').trim().slice(0, 800);
            schedulePersist();
            }
        }
        const field = event.target.closest('[data-tl-field]');
        if (field) {
            const id = field.getAttribute('data-event-id');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline('type:' + id);
                const key = field.getAttribute('data-tl-field');
                if (key === 'more') {
                    const nid = field.getAttribute('data-note-id');
                    rec.moreNotes = rec.moreNotes || [];
                    rec.moreNotes.forEach(function (item) {
                        if (item.id === nid) item.text = tlEditableBlank(field) ? '' : field.innerText;
                    });
                    syncTlPlaceholder(field);
                } else if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                    rec[key] = String(field.value || '').trim();
                } else {
                    syncTlPlaceholder(field);
                    rec[key] = tlEditableBlank(field) ? '' : field.innerText;
                }
                schedulePersist();
                scheduleStemRedraw();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardOpacity' && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard('op:' + rec.id);
                rec.op = Math.max(0, Math.min(1, Number(event.target.value) / 100));
                const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
                if (el) el.style.setProperty('--wb-op', String(rec.op));
                if (boardLinkSelected) drawBoardLinks($('boardLinks'), data.whiteboard);
                schedulePersist();
            }
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onPaste(event) {
        const clip = event.clipboardData;
        if (!clip) return;
        const inField = event.target && event.target.closest && event.target.closest('input:not([data-wb-image-url]):not([data-wb-embed-url]):not([data-tl-image-url]), textarea, select, [contenteditable="true"]');
        const file = clipboardImageFile(clip);
        const text = String(clip.getData('text') || '').trim();
        const slot = event.target && event.target.closest && event.target.closest('[data-wb-image-url], [data-wb-embed-url]');
        const slotNode = slot && slot.closest && slot.closest('.wb-node');
        if (file) {
            if (inField) return;
            event.preventDefault();
            if (page === 'whiteboard') {
                readImageFile(file, slotNode ? slotNode.dataset.node : (findBoardNode(boardSelected) && findBoardNode(boardSelected).type === 'image' ? boardSelected : ''), boardPointerAt);
                return;
            }
            if (page === 'timeline') {
                const card = event.target.closest && event.target.closest('.tl-node');
                const rec = (data.timeline || []).find(function (item) {
                    return item.id === (card ? card.getAttribute('data-event') : selectedEvent);
                }) || addEventAt(tlAimX, -1, true);
                const reader = new FileReader();
                reader.onload = function () { attachTimelineImage(rec.id, String(reader.result || '')); };
                reader.readAsDataURL(file);
                return;
            }
            if (host && host.applyProfilePhotoFiles) host.applyProfilePhotoFiles([file]);
            return;
        }
        if (page === 'whiteboard' && /^https?:\/\//i.test(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'embed') {
                event.preventDefault();
                rememberBoard();
                rec.src = text;
                renderWhiteboard();
                schedulePersist();
                return;
            }
        }
        if (page === 'whiteboard' && looksLikeImageSrc(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'image') {
                event.preventDefault();
                applyImageSrc(rec.id, text, '');
            }
            return;
        }
        if (page === 'whiteboard' && boardClip && !inField && !slot) {
            event.preventDefault();
            pasteBoardNode(boardPointerAt || boardDropAt);
            return;
        }
        if (page === 'timeline' && looksLikeImageSrc(text) && !inField) {
            const card = event.target.closest && event.target.closest('.tl-node');
            event.preventDefault();
            attachTimelineImage(card ? card.getAttribute('data-event') : selectedEvent, text);
            return;
        }
    }

    function onKey(event) {
        if (event.key === 'Escape' && calState) {
            event.preventDefault();
            closeCalendar();
            return;
        }
        if (event.key === 'Escape' && timeState) {
            event.preventDefault();
            closeTimePicker();
            return;
        }
        if (timeState && event.target.closest && event.target.closest('#timePop .time-num')) {
            if (onTimeFieldKey(event)) return;
        }
        if (event.key === 'Escape' && infoState) {
            event.preventDefault();
            closeTlInfoPop();
            return;
        }
        if (event.key === 'Escape' && document.querySelector('#boardStage [data-wb-text].is-edit')) {
            event.preventDefault();
            commitBoardTextEdit();
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const rec = node && findBoardNode(node.dataset.node);
            const url = String(event.target.value || '').trim();
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'Escape') {
            hideTimelineMenu();
            if (connectFrom || timelineConnectOn) {
                connectFrom = '';
                timelineConnectOn = false;
                renderTimeline();
            }
            if (boardConnect || boardTool === 'connect') {
                boardConnect = '';
                boardConnectPort = '';
                boardTool = 'select';
                renderWhiteboard();
            }
            const view = $('boardView');
            if (view) view.classList.remove('is-linking');
            markBoardPorts('', '', '', '');
            setLinkDraft('', false);
            hideBoardAddMenu();
            hideBoardMore();
            closeBoardPresets();
            return;
        }
        if ((event.key === 'Delete' || event.key === 'Backspace') && page === 'timeline' && selectedEvent) {
            event.preventDefault();
            deleteEvent(selectedEvent);
            return;
        }
        if (page === 'timeline') {
            const meta = event.metaKey || event.ctrlKey;
            const key = event.key;
            if (meta && (key === 'x' || key === 'X') && selectedEvent) {
                event.preventDefault();
                cutTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'c' || key === 'C') && selectedEvent) {
                event.preventDefault();
                copyTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'v' || key === 'V')) {
                event.preventDefault();
                pasteTimelineEvent();
                return;
            }
            if (meta && (key === 'd' || key === 'D') && selectedEvent) {
                event.preventDefault();
                duplicateTimelineEvent(selectedEvent);
                return;
            }
            if (meta && key === ']' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'front' : 'up');
                return;
            }
            if (meta && key === '[' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'back' : 'down');
                return;
            }
        }
        if (page !== 'whiteboard') return;
        const meta = event.metaKey || event.ctrlKey;
        const key = event.key;
        if (meta && (key === 'a' || key === 'A')) {
            event.preventDefault();
            selectBoardNodes(
                (data.whiteboard.nodes || []).map(function (n) { return n.id; }),
                (data.whiteboard.links || []).map(function (l) { return l.id; })
            );
            return;
        }
        if (meta && (key === 'z' || key === 'Z' || key === 'y' || key === 'Y')) return;
        if (meta && (key === 'x' || key === 'X') && boardSelected) {
            event.preventDefault();
            cutBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            copyBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'v' || key === 'V') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            pasteBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && boardSelected) {
            event.preventDefault();
            copyBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardLinkSelected) {
            event.preventDefault();
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardSelected) {
            event.preventDefault();
            duplicateBoardNode(boardSelected);
            return;
        }
        if (meta && event.shiftKey && (key === 'k' || key === 'K') && boardSelected) {
            event.preventDefault();
            setBoardHref(boardSelected);
            return;
        }
        if (meta && key === ']' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'front' : 'up');
            return;
        }
        if (meta && key === '[' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'back' : 'down');
            return;
        }
        if (event.shiftKey && (key === 'h' || key === 'H') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'h');
            return;
        }
        if (event.shiftKey && (key === 'v' || key === 'V') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'v');
            return;
        }
        if (event.shiftKey && (key === 'x' || key === 'X') && !meta) {
            event.preventDefault();
            startDrawToShape();
            return;
        }
        if (!meta && !event.shiftKey) {
            const tools = { h: 'pan', v: 'select', r: 'square', d: 'diamond', o: 'circle', a: 'arrow', l: 'line', p: 'draw', t: 'text', n: 'note', e: 'eraser', q: 'connect', i: 'image', f: 'frame', k: 'laser', b: 'bucket', '9': 'image' };
            const nextTool = tools[String(key).toLowerCase()];
            if (nextTool) {
                event.preventDefault();
                boardDrawToShape = false;
                boardTool = nextTool;
                boardConnect = '';
                boardConnectPort = '';
                renderWhiteboard();
                return;
            }
        }
        if ((key === 'Delete' || key === 'Backspace') && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            event.preventDefault();
            deleteBoardSelection();
            return;
        }
    }

    function onSubmit(event) {
        if (event.target.id === 'intelForm') {
            event.preventDefault();
            const input = event.target.querySelector('input');
            const value = input ? input.value : '';
            runDomainIntel(value);
        }
        if (event.target.id === 'eventForm' || event.target.id === 'boardForm') {
            event.preventDefault();
            if (event.target.id === 'eventForm') saveEventEditor();
            else saveBoardEditor();
        }
    }

    function onFile(event) {
        if (event.target.id === 'harvesterFile') {
            ingestHarvesterFiles(event.target.files);
            event.target.value = '';
            return;
        }
        if (event.target.id === 'timelineImageFile') {
        const file = event.target.files && event.target.files[0];
            const id = timelinePhotoId;
            event.target.value = '';
            if (!file || !id) return;
            const reader = new FileReader();
            reader.onload = function () {
                const rec = (data.timeline || []).find(function (item) { return item.id === id; });
                if (!rec) return;
                rememberTimeline();
                rec.image = String(reader.result || '');
                renderTimeline();
                schedulePersist();
            };
            reader.readAsDataURL(file);
            return;
        }
        if (event.target.id === 'boardImageFile') {
            const file = event.target.files && event.target.files[0];
            const at = boardDropAt || { x: 180, y: 140 };
            const onto = boardMenuMode === 'node' && boardSelected;
            const selectedId = boardSelected;
            boardDropAt = null;
            event.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
                const src = String(reader.result || '');
                const rec = selectedId && (data.whiteboard.nodes || []).find(function (n) { return n.id === selectedId; });
                if (rec && (rec.type === 'image' || onto)) {
                    applyImageSrc(rec.id, src, file.name || rec.title || '');
                    return;
                }
                const node = addBoardNode('image', at);
                if (!node) return;
                applyImageSrc(node.id, src, file.name || 'Photo');
        };
        reader.readAsDataURL(file);
        }
    }

    let fieldMenuEl = null;
    let fieldMenuTarget = null;
    let fieldMenuRange = null;

