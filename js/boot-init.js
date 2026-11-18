/* Field edit menu and app init */
    function editableField(node) {
        if (!node || !node.closest) return null;
        const field = node.closest('textarea, input, [contenteditable="true"]');
        if (!field || field.disabled) return null;
        if (field.matches('input')) {
            const type = (field.getAttribute('type') || 'text').toLowerCase();
            if (/^(button|submit|reset|checkbox|radio|file|range|color|hidden|image)$/.test(type)) return null;
        }
        return field;
    }

    function fieldHasSelection(field) {
        if (!field) return false;
        if (field.selectionStart != null) return field.selectionEnd > field.selectionStart;
        const sel = window.getSelection();
        return !!(sel && !sel.isCollapsed && field.contains(sel.anchorNode));
    }

    function captureFieldRange(field) {
        if (!field) return null;
        if (field.selectionStart != null) return { kind: 'input', start: field.selectionStart, end: field.selectionEnd };
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (!field.contains(range.commonAncestorContainer)) return null;
        return { kind: 'range', range: range.cloneRange() };
    }

    function restoreFieldRange(field, saved) {
        if (!field) return;
        field.focus();
        if (!saved) return;
        if (saved.kind === 'input' && field.setSelectionRange) {
            field.setSelectionRange(saved.start, saved.end);
            return;
        }
        if (saved.kind === 'range') {
            const sel = window.getSelection();
            if (!sel) return;
            sel.removeAllRanges();
            sel.addRange(saved.range);
        }
    }

    function armFieldEdit(field) {
        fieldMenuTarget = field;
        fieldMenuRange = captureFieldRange(field);
    }

    function fieldEditRows(field) {
        const secret = field && field.type === 'password';
        const locked = !!(field && (field.readOnly || field.disabled));
        const selected = fieldHasSelection(field);
        function row(act, label, keys, off) {
            return '<button type="button" role="menuitem" data-field-act="' + act + '"' + (off ? ' disabled' : '') + '><span>' + label + '</span><kbd>' + keys + '</kbd></button>';
        }
        return '<p>Edit</p>' +
            row('undo', 'Undo', 'Ctrl+Z', locked) +
            row('redo', 'Redo', 'Ctrl+Shift+Z', locked) +
            '<hr>' +
            row('cut', 'Cut', 'Ctrl+X', locked || secret || !selected) +
            row('copy', 'Copy', 'Ctrl+C', secret || !selected) +
            row('paste', 'Paste', 'Ctrl+V', locked) +
            '<hr>' +
            row('select', 'Select all', 'Ctrl+A', false);
    }

    function hideFieldMenu() {
        if (fieldMenuEl) fieldMenuEl.hidden = true;
    }

    function placeAppMenu(menu, x, y) {
        if (!menu) return;
        menu.hidden = false;
        const width = menu.offsetWidth || 196;
        const height = menu.offsetHeight || 40;
        const left = Math.min(Math.max(8, x), window.innerWidth - width - 8);
        const top = y + height > window.innerHeight - 8 ? Math.max(8, y - height) : Math.max(8, y);
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function fieldMenuHost() {
        if (fieldMenuEl) return fieldMenuEl;
        const menu = document.createElement('div');
        menu.id = 'editMenu';
        menu.className = 'app-menu';
        menu.hidden = true;
        menu.setAttribute('role', 'menu');
        menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
        menu.addEventListener('click', function (event) {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            const field = fieldMenuTarget;
            const act = button.getAttribute('data-field-act');
            hideFieldMenu();
            if (field) runFieldEdit(field, act);
        });
        document.body.appendChild(menu);
        fieldMenuEl = menu;
        return menu;
    }

    function showFieldMenu(field, x, y) {
        if (!field) return;
        closeNoteMenu();
        armFieldEdit(field);
        const menu = fieldMenuHost();
        menu.innerHTML = fieldEditRows(field);
        placeAppMenu(menu, x, y);
    }

    function runFieldEdit(field, action) {
        if (!field || field.disabled) return;
        const saved = fieldMenuRange;
        restoreFieldRange(field, saved);
        if (action === 'select') {
            if (field.select) field.select();
            else document.execCommand('selectAll');
            return;
        }
        if (action === 'undo' || action === 'redo') {
            if (field.readOnly) return;
            document.execCommand(action);
            field.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        const secret = field.type === 'password';
        if ((action === 'cut' || action === 'copy') && !secret) {
            let text = '';
            if (field.selectionStart != null) text = field.value.slice(field.selectionStart, field.selectionEnd);
            else text = String(window.getSelection() || '');
            if (!text) return;
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
            else document.execCommand('copy');
            if (action === 'cut' && !field.readOnly) {
                if (field.selectionStart != null) {
                    const start = field.selectionStart;
                    field.value = field.value.slice(0, start) + field.value.slice(field.selectionEnd);
                    field.setSelectionRange(start, start);
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    document.execCommand('delete');
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            return;
        }
        if (action !== 'paste' || field.readOnly) return;
        function insert(text) {
            restoreFieldRange(field, saved);
            if (field.selectionStart != null) {
                const start = field.selectionStart;
                const end = field.selectionEnd;
                field.value = field.value.slice(0, start) + text + field.value.slice(end);
                const caret = start + text.length;
                field.setSelectionRange(caret, caret);
                field.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            document.execCommand('insertText', false, text);
        }
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(insert).catch(function () {
                restoreFieldRange(field, saved);
                document.execCommand('paste');
            });
            return;
        }
        document.execCommand('paste');
    }

    function bindPageContextMenu() {
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            hideFieldMenu();
            if (!event.target.closest('#noteMenu')) closeNoteMenu();
        }, true);
        document.addEventListener('contextmenu', function (event) {
            if (event.target.closest('#timelineView, #boardView, #mapStage, #noteView, #noteMenu, #noteFormat, #editMenu, #fieldMenu, #peerHubs, .board-add-menu')) return;
            const field = editableField(event.target);
            if (field) showFieldMenu(field, event.clientX, event.clientY);
        });
        document.addEventListener('pointerdown', function (event) {
            if (event.target.closest('#editMenu')) return;
            hideFieldMenu();
        }, true);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideFieldMenu();
        });
    }

    function init(api) {
        host = api || {};
        injectToolkit();
        window.addEventListener('orbint-toolkit-ready', injectToolkit);
        document.addEventListener('click', onClick);
        bindPageContextMenu();
        document.addEventListener('change', onChange);
        document.addEventListener('input', onInput);
        document.addEventListener('focusout', function (event) {
            const field = event.target && event.target.closest && event.target.closest('[data-tl-field]');
            if (field) syncTlPlaceholder(field);
        });
        document.addEventListener('keydown', onKey);
        document.addEventListener('paste', onPaste);
        document.addEventListener('submit', onSubmit);
        document.addEventListener('change', onFile, true);
        bindBoardPointers();
        bindTimelinePointers();
        bindHarvester();
        document.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch') return;
            setBoardDrift(event.clientX, event.clientY);
            if (page === 'whiteboard' && boardTool === 'laser') {
                feedLaser(worldFromClient(event.clientX, event.clientY));
            }
        }, { passive: true });
        window.addEventListener('orbint-motion', function () {
            if (reduceMotion()) setBoardDrift(null, null);
        });
        let saved = 'orbit';
        try {
            if (settingValue('rememberPage', true) === false) {
                saved = settingValue('startPage', 'orbit') || 'orbit';
            } else {
                saved = localStorage.getItem('orbint-page') || settingValue('startPage', 'orbit') || 'orbit';
            }
        } catch (error) {}
        if (saved === 'compiler') saved = 'harvester';
        if (['operations', 'orbit', 'timeline', 'whiteboard', 'notepad', 'harvester', 'datasheet', 'guide'].indexOf(saved) < 0) saved = 'orbit';
        restoreSplit(saved);
        setPage(saved);
        renderAll();
        openVisitNotice();
        document.addEventListener('click', function (event) {
            const jump = event.target.closest('[data-guide-jump]');
            if (!jump || page !== 'guide') return;
            const target = document.getElementById(jump.getAttribute('data-guide-jump'));
            if (target) target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        });
        window.addEventListener('resize', function () {
            renderPageSwitch({ instant: true });
            syncBoardToolThumb(true);
            if (calState) placeCalendar();
            if (timeState) placeTimePicker();
            if (infoState) placeTlInfoPop();
            if (page === 'datasheet') sizeDatasheet();
        });
    }

    function openVisitNotice() {
        const sheet = $('visitNotice');
        if (!sheet) return;
        let seen = '';
        try { seen = localStorage.getItem('orbint-notice'); } catch (error) {}
        if (seen === '1') return;
        sheet.hidden = false;
        const ok = $('visitNoticeOk');
        if (ok && !ok.dataset.bound) {
            ok.dataset.bound = '1';
            ok.addEventListener('click', function () {
                try { localStorage.setItem('orbint-notice', '1'); } catch (error) {}
                sheet.classList.remove('is-in');
                sheet.hidden = true;
            });
        }
        requestAnimationFrame(function () {
            sheet.classList.add('is-in');
            if (ok) ok.focus();
        });
    }

    function closeOverlays() {
        hideSheet($('eventSheet'));
        hideSheet($('intelSheet'));
        hideSheet($('metaSheet'));
        hideSheet($('boardSheet'));
        hideSheet($('boardPresetSheet'));
        hideBoardAddMenu();
        hideBoardMore();
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        const viewer = $('mediaViewer');
        if (viewer) viewer.hidden = true;
        const menu = $('reverseMenu');
        if (menu) menu.hidden = true;
        return false;
    }

    function resetView() {
        if (page === 'whiteboard') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            return true;
        }
        if (page === 'timeline') {
            recenterTimeline();
            return true;
        }
        if (page === 'datasheet') return true;
        if (page === 'notepad') return true;
        if (page === 'harvester') return true;
        if (page === 'operations') return true;
        return false;
    }

    window.OrbINTCase = {
        init: init,
        load: load,
        snapshot: snapshot,
        setPage: setPage,
        toggleSplit: toggleSplit,
        page: currentPage,
        downloadReport: downloadReport,
        showPhotoMeta: showPhotoMeta,
        reverseSearchPhoto: reverseSearchPhoto,
        openDomainIntel: openDomainIntel,
        closeOverlays: closeOverlays,
        resetView: resetView,
        dockAdd: dockAdd,
        dockConnect: dockConnect,
        undoBoard: undoBoard,
        redoBoard: redoBoard,
        undoTimeline: undoTimeline,
        redoTimeline: redoTimeline,
        boardHistory: function () {
            return { undo: boardUndo.length, redo: boardRedo.length };
        },
        syncBoardHistory: syncBoardHistory,
        pages: PAGES,
        renderPageSwitch: renderPageSwitch,
        renderDatasheet: renderDatasheet,
        scheduleDatasheet: scheduleDatasheet,
        ingestHarvesterFiles: ingestHarvesterFiles
    };
