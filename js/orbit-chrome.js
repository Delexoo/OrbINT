/* Photo sheet and field-menu bindings on the map */
        function showDeskDone(title, detail) {
            const sheet = document.getElementById('deskDone');
            const heading = document.getElementById('deskDoneTitle');
            const lead = document.getElementById('deskDoneLead');
            if (!sheet || !heading || !lead) return;
            heading.textContent = title || 'Done';
            lead.textContent = detail || '';
            sheet.hidden = false;
            requestAnimationFrame(function () { sheet.classList.add('is-in'); });
            const close = document.getElementById('deskDoneClose');
            if (close) close.focus();
        }
        window.OrbINTDone = showDeskDone;
        const undoToastBtn = document.getElementById('undoToastBtn');
        if (undoToastBtn) undoToastBtn.addEventListener('click', function () {
            if (typeof undoProfileDelete === 'function') undoProfileDelete();
        });
        const commandSheet = document.getElementById('commandMenu');
        const commandList = document.getElementById('commandList');
        const commandHint = document.getElementById('commandHint');
        const commandMac = /Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent || '');
        const commandChord = commandMac ? '⌘K' : 'Ctrl+K';
        function closeCommandMenu() {
            if (!commandSheet) return;
            commandSheet.classList.remove('is-in');
            commandSheet.hidden = true;
        }
        function openCommandMenu() {
            if (!commandSheet || !commandList) return;
            if (commandHint) commandHint.textContent = commandChord;
            const desks = [
                ['orbit', 'Orbit'],
                ['timeline', 'Timeline'],
                ['whiteboard', 'Whiteboard'],
                ['notepad', 'Notepad'],
                ['harvester', 'Harvester'],
                ['datasheet', 'Case file'],
                ['operations', 'Operations'],
                ['guide', 'Guide']
            ];
            const actions = desks.map(function (item) {
                return '<button type="button" data-command="page" data-page="' + item[0] + '"><span>' + item[1] + '</span><kbd>' + commandChord + '</kbd></button>';
            }).join('') +
                '<button type="button" data-command="export"><span>Export JSON</span><kbd>' + commandChord + '</kbd></button>' +
                '<button type="button" data-command="profile"><span>New profile</span><kbd>' + commandChord + '</kbd></button>';
            commandList.innerHTML = actions;
            commandSheet.hidden = false;
            requestAnimationFrame(function () { commandSheet.classList.add('is-in'); });
            const first = commandList.querySelector('button');
            if (first) first.focus();
        }
        const commandClose = document.getElementById('commandClose');
        if (commandClose) commandClose.addEventListener('click', closeCommandMenu);
        if (commandSheet) {
            commandSheet.addEventListener('click', function (event) {
                if (event.target === commandSheet) closeCommandMenu();
            });
            commandSheet.addEventListener('click', function (event) {
                const button = event.target.closest('button[data-command]');
                if (!button) return;
                const kind = button.getAttribute('data-command');
                closeCommandMenu();
                if (kind === 'page' && window.OrbINTCase && typeof OrbINTCase.setPage === 'function') {
                    OrbINTCase.setPage(button.getAttribute('data-page'));
                } else if (kind === 'export' && typeof exportCase === 'function') {
                    exportCase();
                } else if (kind === 'profile' && typeof createProfile === 'function') {
                    createProfile('');
                }
            });
        }
        document.addEventListener('keydown', function (event) {
            const key = event.key || '';
            if (key === 'Escape' && commandSheet && !commandSheet.hidden) {
                event.preventDefault();
                closeCommandMenu();
                return;
            }
            const mac = commandMac;
            const mod = mac ? event.metaKey : event.ctrlKey;
            if (!mod || event.shiftKey || event.altKey || (key !== 'k' && key !== 'K')) return;
            const target = event.target;
            if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;
            event.preventDefault();
            if (commandSheet && !commandSheet.hidden) closeCommandMenu();
            else openCommandMenu();
        });
        document.querySelectorAll('.phone-card').forEach(function (card) {
            const handle = card.querySelector('.phone-card-top') || card;
            let startY = 0;
            let dy = 0;
            let tracking = false;
            handle.addEventListener('pointerdown', function (event) {
                if (event.button !== 0) return;
                if (event.target.closest('button, a, input, textarea')) return;
                tracking = true;
                startY = event.clientY;
                dy = 0;
                card.style.transition = 'none';
                if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
            });
            handle.addEventListener('pointermove', function (event) {
                if (!tracking) return;
                dy = Math.max(0, event.clientY - startY);
                card.style.transform = 'translateY(' + dy + 'px)';
            });
            function endDrag() {
                if (!tracking) return;
                tracking = false;
                card.style.transition = '';
                card.style.transform = '';
                if (dy > 72) {
                    const done = card.querySelector('.phone-done');
                    if (done) done.click();
                }
                dy = 0;
            }
            handle.addEventListener('pointerup', endDrag);
            handle.addEventListener('pointercancel', endDrag);
        });
        const deskDoneClose = document.getElementById('deskDoneClose');
        const deskDoneSheet = document.getElementById('deskDone');
        if (deskDoneClose && deskDoneSheet) {
            function hideDeskDone() {
                deskDoneSheet.classList.remove('is-in');
                deskDoneSheet.hidden = true;
            }
            deskDoneClose.addEventListener('click', hideDeskDone);
            deskDoneSheet.addEventListener('click', function (event) {
                if (event.target === deskDoneSheet) hideDeskDone();
            });
        }

        const ccMenuEl = document.getElementById('ccMenu');
        if (ccMenuEl) ccMenuEl.addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-cc]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('ccMenu').dataset.field;
            applyCountryCodePick(fieldId, option.dataset.pickCc);
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('#platformMenu, .platform-trigger, .platform-icon, #phonePlatformBtn, [data-sheet-platform], .node.menu-open:not(.tz-open):not(.cc-open)')) {
                closePlatformMenu();
            }
            if (!event.target.closest('#tzMenu, .tz-trigger, .tz-pick, .tz-abbr, #phoneTzBtn, .node.tz-open')) {
                closeTimezoneMenu();
            }
            if (!event.target.closest('#ccMenu, .cc-trigger, .cc-pick, .cc-abbr, .cc-name, #phoneCcBtn, .node.cc-open')) {
                closeCountryCodeMenu();
            }
            if (!event.target.closest('#searchMenu, [data-search], #phoneFieldSearch')) {
                closeSearchMenu();
            }
            if (!event.target.closest('#exportMenu, #dockExport, #phoneExport')) {
                closeExportMenu();
            }
            if (!fieldMenuGuard && !event.target.closest('#fieldMenu, .node-more')) {
                closeFieldMenu();
            }
            if (!event.target.closest('#profileMenu, .profile-rail-item')) {
                closeProfileMenu();
            }
        });

        document.addEventListener('pointerdown', (event) => {
            if (fieldMenuGuard) return;
            if (event.target.closest('#fieldMenu, .node-more')) return;
            closeFieldMenu();
        }, true);

        document.getElementById('fieldMenu').addEventListener('pointerdown', onFieldMenuAct);
        document.getElementById('fieldMenu').addEventListener('click', onFieldMenuAct);

        function onFieldMenuAct(event) {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            event.preventDefault();
            event.stopPropagation();
            const menu = document.getElementById('fieldMenu');
            const act = button.dataset.fieldAct;
            const fieldId = menu ? menu.dataset.field : '';
            const extra = button.dataset.linkId || (menu && menu.dataset.peer) || '';
            if (!act) return;
            if (menu && menu.dataset.actLock === act + ':' + extra) return;
            if (menu) menu.dataset.actLock = act + ':' + extra;
            closeFieldMenu();
            runFieldAction(act, fieldId, extra);
        }

        function orbitHitEl(event, selector) {
            const stage = document.getElementById('mapStage');
            if (!event || !selector || !stage) return null;
            const fromTarget = event.target && event.target.closest && event.target.closest(selector);
            if (fromTarget && stage.contains(fromTarget)) return fromTarget;
            let stack = [];
            try { stack = document.elementsFromPoint(event.clientX, event.clientY) || []; } catch (err) { stack = []; }
            for (let i = 0; i < stack.length; i++) {
                const node = stack[i];
                if (!node || !node.closest) continue;
                const el = node.closest(selector);
                if (el && stage.contains(el)) return el;
            }
            return null;
        }

        function peerIdFromEl(el) {
            if (!el) return '';
            return el.getAttribute('data-peer') || '';
        }

        if (mapStage) mapStage.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#fieldMenu, #searchMenu, #platformMenu, #tzMenu, #ccMenu, #exportMenu, #profileMenu, .profile-rail, .media-viewer, .help-guide, .share-sheet, .install-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            const peer = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            const peerId = peerIdFromEl(peer);
            if (peerId) {
                event.preventDefault();
                event.stopPropagation();
                openPeerMenu(event, peerId);
                return;
            }
            const node = orbitHitEl(event, '.node');
            if (node) {
                event.preventDefault();
                openFieldMenu(event, node);
                return;
            }
            if (orbitHitEl(event, '#hubAdd')) {
                event.preventDefault();
                toggleAddField();
                return;
            }
            if (orbitHitEl(event, '#hub')) {
                event.preventDefault();
                openHubMenu(event);
                return;
            }
            if (event.target.closest('.map-toggle, .casebook-btn, #workNav, .donate, .dock')) return;
            event.preventDefault();
            openMapMenu(event);
        });

        const photosSheet = document.getElementById('photosSheet');
        const photosClose = document.getElementById('photosClose');
        const photosAdd = document.getElementById('photosAdd');
        const photosList = document.getElementById('photosList');
        const photosFile = document.getElementById('photosFile');
        if (photosClose) photosClose.addEventListener('click', closePhotosSheet);
        if (photosAdd) photosAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target && event.target.id === 'photosFile') return;
            if (photosFile) photosFile.click();
        });
        if (photosFile) photosFile.addEventListener('change', () => {
            const files = takeInputFiles(photosFile);
            if (files.length) applyProfilePhotoFiles(files);
        });
        const photosUrlForm = document.getElementById('photosUrlForm');
        const photosUrl = document.getElementById('photosUrl');
        if (photosUrlForm) {
            photosUrlForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (applyProfilePhotoUrl(photosUrl && photosUrl.value)) {
                    if (photosUrl) photosUrl.value = '';
                }
            });
        }
        if (photosList) {
            photosList.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-photo-act]');
                if (!btn) return;
                const card = btn.closest('[data-photos-index]');
                const items = imageGalleryItems();
                const item = items[Number(card && card.dataset.photosIndex)];
                if (!item) return;
                event.preventDefault();
                event.stopPropagation();
                const act = btn.dataset.photoAct;
                if (act === 'open') openPhotoInTab(item);
                else if (act === 'download') downloadPhotoItem(item);
                else if (act === 'copy' || act === 'copy-image') copyPhotoItem(item, btn);
                else if (act === 'search') {
                    if (window.OrbINTCase && typeof OrbINTCase.reverseSearchPhoto === 'function') {
                        OrbINTCase.reverseSearchPhoto(item, btn);
                    } else {
                        searchPhotoItem(item);
                    }
                } else if (act === 'meta') {
                    if (window.OrbINTCase && typeof OrbINTCase.showPhotoMeta === 'function') {
                        OrbINTCase.showPhotoMeta(item);
                    }
                }
                else if (act === 'left') reorderPhotoItem(item.index, -1);
                else if (act === 'right') reorderPhotoItem(item.index, 1);
                else if (act === 'face') promotePhotoItem(item);
                else if (act === 'delete') deletePhotoItem(item);
            });
            photosList.addEventListener('wheel', (event) => {
                if (!photosList.scrollWidth || photosList.scrollWidth <= photosList.clientWidth + 4) return;
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                event.preventDefault();
                photosList.scrollLeft += event.deltaY;
            }, { passive: false });
        }
        if (photosSheet) {
            photosSheet.addEventListener('click', (event) => {
                if (event.target.id === 'photosSheet') closePhotosSheet();
            });
            ['dragenter', 'dragover'].forEach((type) => {
                photosSheet.addEventListener(type, (event) => {
                    event.preventDefault();
                    photosSheet.classList.add('is-drop');
                });
            });
            photosSheet.addEventListener('dragleave', (event) => {
                if (event.target === photosSheet || event.target.id === 'photosStage') photosSheet.classList.remove('is-drop');
            });
            photosSheet.addEventListener('drop', (event) => {
                event.preventDefault();
                photosSheet.classList.remove('is-drop');
                const files = event.dataTransfer && event.dataTransfer.files;
                if (files && files.length) applyProfilePhotoFiles(files);
            });
            photosSheet.addEventListener('paste', (event) => {
                const clip = event.clipboardData;
                if (!clip) return;
                const files = Array.from(clip.files || []).filter(isImageFile);
                if (files.length) {
                    event.preventDefault();
                    applyProfilePhotoFiles(files);
                    return;
                }
                if (event.target && event.target.id === 'photosUrl') return;
                const text = String(clip.getData('text') || '').trim();
                if (text && applyProfilePhotoUrl(text)) event.preventDefault();
            });
        }
        document.getElementById('mediaClose').addEventListener('click', closeMediaViewer);
        const mediaPrev = document.getElementById('mediaPrev');
        const mediaNext = document.getElementById('mediaNext');
        if (mediaPrev) mediaPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(-1);
        });
        if (mediaNext) mediaNext.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(1);
        });
        document.getElementById('mediaViewer').addEventListener('click', (event) => {
            if (event.target.id === 'mediaViewer') closeMediaViewer();
        });
        document.getElementById('mediaViewer').addEventListener('wheel', (event) => {
            const viewer = document.getElementById('mediaViewer');
            if (!viewer || viewer.hidden || mediaGallery.items.length < 2) return;
            if (Math.abs(event.deltaY) < 2 && Math.abs(event.deltaX) < 2) return;
            event.preventDefault();
            stepMediaGallery((event.deltaY + event.deltaX) > 0 ? 1 : -1);
        }, { passive: false });

