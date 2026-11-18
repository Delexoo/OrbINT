/* Case reset and recenter */
        function closeResetConfirm() {
            hideSheet(document.getElementById('resetConfirm'));
        }

        function closeBombConfirm() {
            hideSheet(document.getElementById('bombConfirm'));
        }

        function closeSettings() {
            closeSetPick();
            hideSheet(document.getElementById('settingsSheet'));
        }

        function openSettings() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeAddField();
            closeToolkit();
            closeProfileMenu();
            closeProfilePrompt();
            closeHelp();
            closeResetConfirm();
            closeBombConfirm();
            closePhoneMore();
            bombPulseLow = false;
            syncSettingsForm();
            showSheet(document.getElementById('settingsSheet'));
        }

        function armLogicBombNow() {
            const sheet = document.getElementById('bombConfirm');
            if (!sheet) {
                applyResetCase();
                return;
            }
            showSheet(sheet);
        }

        function resetCase() {
            const sheet = document.getElementById('resetConfirm');
            if (!sheet) return;
            showSheet(sheet);
            const cancel = document.getElementById('resetCancel');
            if (cancel) cancel.focus();
        }

        function applyResetCase() {
            closeResetConfirm();
            Object.keys(mediaStore).forEach((id) => {
                if (mediaStore[id] && mediaStore[id].src && String(mediaStore[id].src).indexOf('blob:') === 0) {
                    URL.revokeObjectURL(mediaStore[id].src);
                }
                delete mediaStore[id];
            });
            const wipeLocal = function () {
                try { localStorage.clear(); } catch (error) {}
                try { sessionStorage.clear(); } catch (error) {}
                try {
                    document.cookie.split(';').forEach((part) => {
                        const name = part.split('=')[0].trim();
                        if (!name) return;
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
                    });
                } catch (error) {}
            };
            const reloadFresh = function () {
                const url = new URL(location.href);
                url.searchParams.set('v', String(Date.now()));
                location.replace(url.pathname + url.search + url.hash);
            };
            const dropWorkers = (navigator.serviceWorker && navigator.serviceWorker.getRegistrations)
                ? navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
                : Promise.resolve();
            const dropCaches = (window.caches && caches.keys)
                ? caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                : Promise.resolve();
            const bustHttp = function () {
                const files = ['./', './index.html', './app.js', './app.js?v=352', './osint-tools.js', './osint-tools.js?v=329', './investigation.js', './investigation.js?v=377', './css/base-shell.css?v=329', './css/base-leads.css?v=329', './css/base-toolkit.css?v=329', './css/base-menus.css?v=329', './css/base-dock.css?v=329', './css/base-export.css?v=329', './css/base-workspace.css?v=329', './css/base-calendar.css?v=329', './css/base-share.css?v=329', './css/base-guide.css?v=329', './css/base-settings.css?v=329', './css/base-phone.css?v=329', './css/orbit-rail.css?v=329', './css/orbit-face.css?v=329', './css/orbit-picks.css?v=329', './css/orbit-dossier.css?v=329', './css/orbit-map.css?v=329', './css/orbit-photos.css?v=329', './css/orbit-nodes.css?v=329', './css/orbit-field-ui.css?v=329', './css/orbit-responsive.css?v=367', './css/timeline-stage.css?v=329', './css/timeline-cards.css?v=329', './css/timeline-editor.css?v=329', './css/whiteboard-bar.css?v=329', './css/whiteboard-props.css?v=329', './css/whiteboard-nodes.css?v=329', './css/whiteboard-links.css?v=329', './css/harvester.css?v=329', './css/datasheet.css?v=329', './css/notepad.css?v=329', './css/operations.css?v=376', './sw.js', './manifest.webmanifest'];
                return Promise.all(files.map(function (path) {
                    return fetch(path, { cache: 'reload', credentials: 'same-origin' }).catch(function () {});
                }));
            };
            Promise.resolve(clearAllProfileImages()).then(function () {
                wipeLocal();
                return Promise.all([dropWorkers, dropCaches]).then(bustHttp);
            }).then(reloadFresh).catch(reloadFresh);
        }

        function recenterOrbit() {
            if (window.OrbINTCase && OrbINTCase.resetView && OrbINTCase.resetView()) return;
            orbit.dragX = 0;
            orbit.dragY = 0;
            orbit.gridPanX = 0;
            orbit.gridPanY = 0;
            orbit.gridShiftX = 0;
            orbit.gridShiftY = 0;
            orbit.hubLiveX = null;
            orbit.hubLiveY = null;
            orbit.hubLiveVX = 0;
            orbit.hubLiveVY = 0;
            orbit.userZoomed = false;
            orbit.freeCam = false;
            orbit.fitZooming = true;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.zoomBusy = false;
            orbit.parallaxX = 0;
            orbit.parallaxY = 0;
            orbit.targetParallaxX = 0;
            orbit.targetParallaxY = 0;
            nodeHomes.clear();
            if (isPhone()) orbit.snapLayout = true;
            if (typeof positionNodes === 'function') positionNodes();
            if (isPhone()) orbit.snapLayout = false;
        }

        try { createNodes(); applyStoredFieldLabels(); applyHiddenFields(); } catch (error) { console.error(error); }
        try {
            document.body.classList.toggle('phone', isPhone());
            if (isPhone()) setPanelOpen(false);
            else {
                let collapsed = false;
                try { collapsed = localStorage.getItem('orbint-casebook-collapsed') === '1'; } catch (error) {}
                setCasebookCollapsed(collapsed);
            }
        } catch (error) {}
        if (window.OrbINTCase && typeof OrbINTCase.init === 'function') {
            OrbINTCase.init({
                getProfile: function () { return profile; },
                getFields: function () { return FIELDS; },
                firstValue: firstValue,
                fieldById: fieldById,
                platformById: platformById,
                imageGalleryItems: imageGalleryItems,
                applyProfilePhotoFiles: applyProfilePhotoFiles,
                applyProfilePhotoUrl: applyProfilePhotoUrl,
                escapeHtml: escapeHtml,
                addFact: addFact,
                addFactSlot: addFactSlot,
                writeCaseField: writeCaseField,
                patchProfileFact: patchProfileFact,
                writeAnalysis: writeAnalysis,
                flushFacts: flushFacts,
                srcToBlob: srcToBlob,
                copyImageSource: copyImageSource,
                closeSheetPick: function () {
                    if (typeof closeSheetPick === 'function') closeSheetPick();
                },
                readonly: function () {
                    return !!(window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly());
                },
                getFactCaptured: function (id) {
                    return factStampIso(lastFactRecord(id));
                },
                setFactCaptured: function (id, iso) {
                    patchFactMeta(id, 'capturedAt', iso || '');
                    paintFactCaptured(id);
                    if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
                },
                save: function () {
                    if (typeof saveProfile === 'function') saveProfile();
                    if (typeof queueLibrarySync === 'function') queueLibrarySync();
                }
            });
        }
        try { initProfileLibrary(); } catch (error) { console.error(error); }
        try { renderProfile(); } catch (error) { console.error(error); }
        try { renderNodes(); } catch (error) { console.error(error); }
        try { initSidebarWidth(); } catch (error) {}
        try { bindSidebarResize(); } catch (error) {}
        try { pushHistory(); } catch (error) {}

        mapCanvas.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            event.preventDefault();
            const fieldId = input.id.replace('field-', '');
            saveInputAsIs(input);
            flushHistory();
            activeField = fieldId;
            renderLeads(fieldId);
        });

        mapCanvas.addEventListener('change', (event) => {
            const select = event.target.closest('select');
            if (select && select.id && select.id.startsWith('field-')) {
                syncNodeFilled(select);
                saveInputAsIs(select);
                updateTimezoneClocks();
                return;
            }
            const upload = event.target.closest('[data-upload]');
            if (!upload || !upload.files || !upload.files[0]) return;
            const fieldId = upload.dataset.upload;
            const file = upload.files[0];
            const finish = (extra) => {
                addFact(fieldId, file.name + ' (' + Math.round(file.size / 1024) + ' KB)', extra);
                activeField = fieldId;
                renderLeads(fieldId);
            };
            if (file.type.indexOf('image/') === 0) {
                imageVersionsFromFile(file).then((versions) => finish(versions || { kind: 'image' }));
            } else if (file.type.indexOf('audio/') === 0 || fieldBase(fieldId) === 'audio') {
                const extra = { kind: 'audio' };
                if (file.size < 1800000) {
                    readFileAsDataURL(file).then((dataUrl) => {
                        extra.media = dataUrl;
                        finish(extra);
                    }).catch(() => finish(extra));
                } else {
                    if (mediaStore[fieldId] && mediaStore[fieldId].src && String(mediaStore[fieldId].src).indexOf('blob:') === 0) {
                        URL.revokeObjectURL(mediaStore[fieldId].src);
                    }
                    mediaStore[fieldId] = { src: URL.createObjectURL(file), kind: 'audio', name: file.name };
                    extra.session = true;
                    finish(extra);
                }
            } else {
                finish();
            }
        });

        mapCanvas.addEventListener('click', (event) => {
            const secretBtn = event.target.closest('[data-secret-reveal]');
            if (secretBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleSecretReveal(secretBtn.dataset.secretReveal);
                return;
            }
            const more = event.target.closest('[data-more]');
            if (more) {
                event.preventDefault();
                event.stopPropagation();
                const node = more.closest('.node');
                const menu = document.getElementById('fieldMenu');
                if (menu && !menu.hidden && menu.dataset.field === more.dataset.more) closeFieldMenu();
                else openFieldMenu(event, node);
                return;
            }
            const searchBtn = event.target.closest('[data-search]');
            if (searchBtn) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = searchBtn.dataset.search;
                const menu = document.getElementById('searchMenu');
                const node = searchBtn.closest('.node');
                if (menu && !menu.hidden && node && node.classList.contains('search-open')) closeSearchMenu();
                else openSearchMenu(fieldId);
                return;
            }
            const tzTrigger = event.target.closest('.tz-pick, .tz-trigger, .tz-abbr');
            if (tzTrigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = tzTrigger.closest('.node');
                const menu = document.getElementById('tzMenu');
                if (menu && !menu.hidden && node && node.classList.contains('tz-open')) closeTimezoneMenu();
                else openTimezoneMenu(node);
                return;
            }
            const ccTrigger = event.target.closest('.cc-pick, .cc-trigger, .cc-abbr, .cc-name');
            if (ccTrigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = ccTrigger.closest('.node');
                const menu = document.getElementById('ccMenu');
                if (menu && !menu.hidden && node && node.classList.contains('cc-open')) closeCountryCodeMenu();
                else openCountryCodeMenu(node);
                return;
            }
            const photosOpen = event.target.closest('[data-photos-open], .image-add');
            if (photosOpen) {
                event.preventDefault();
                event.stopPropagation();
                openPhotosSheet();
                return;
            }
            const trigger = event.target.closest('.platform-trigger');
            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = trigger.closest('.node');
                const menu = document.getElementById('platformMenu');
                if (menu && !menu.hidden) closePlatformMenu();
                else openPlatformMenu(node);
                return;
            }
            const icon = event.target.closest('.platform-icon');
            if (icon) {
                const node = icon.closest('.node');
                const fieldId = node && node.dataset.field;
                if (node && isPlatformField(fieldId)) openPlatformMenu(node);
                return;
            }
            const mediaBtn = event.target.closest('[data-open-media]');
            if (mediaBtn) {
                event.preventDefault();
                event.stopPropagation();
                const mediaId = mediaBtn.dataset.openMedia;
                if (fieldBase(mediaId) === 'ip') {
                    const input = document.getElementById('field-' + mediaId);
                    openIpLocation((input && input.value) || firstValue(mediaId));
                    return;
                }
                if (fieldBase(mediaId) === 'address') {
                    openFieldMaps(mediaId);
                    return;
                }
                openMediaViewer(mediaId);
                return;
            }
            const clear = event.target.closest('[data-clear]');
            if (clear) {
                event.preventDefault();
                event.stopPropagation();
                clearField(clear.dataset.clear);
                return;
            }
            const button = event.target.closest('[data-file]');
            if (!button) return;
            const upload = document.querySelector('[data-upload="' + button.dataset.file + '"]');
            if (upload) upload.click();
        });

        mapCanvas.addEventListener('beforeinput', (event) => {
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            if (fieldBase(input.id.replace('field-', '')) !== 'phone') return;
            if (event.inputType === 'insertText' && event.data && /\D/.test(event.data)) {
                event.preventDefault();
            }
        });

        mapCanvas.addEventListener('input', (event) => {
            const input = event.target.closest('input, select');
            if (!input || !input.id || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            if (fieldBase(fieldId) === 'phone') applyPhoneMask(input);
            syncNodeFilled(input);
            saveInputAsIs(input);
            if (isThumbField(fieldId)) {
                setFieldThumb(fieldId);
            }
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
            if (fieldBase(fieldId) === 'timezone') updateTimezoneClocks();
        });

        mapCanvas.addEventListener('paste', (event) => {
            const input = event.target.closest('input');
            if (!input || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            if (fieldBase(fieldId) !== 'image' && fieldBase(fieldId) !== 'audio') return;
            setTimeout(() => {
                const value = input.value.trim();
                if (looksLikeUrl(value) && mediaStore[fieldId]) {
                    if (mediaStore[fieldId].src && String(mediaStore[fieldId].src).indexOf('blob:') === 0) {
                        URL.revokeObjectURL(mediaStore[fieldId].src);
                    }
                    delete mediaStore[fieldId];
                }
                setFieldThumb(fieldId);
                saveInputAsIs(input);
                syncNodeFilled(input);
                activeField = fieldId;
                renderLeads(fieldId);
            }, 0);
        });

        mapCanvas.addEventListener('focusin', (event) => {
            const node = event.target.closest('.node');
            if (!node) return;
            activeField = node.dataset.field;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item === node);
            });
            renderLeads(activeField);
        });

        document.getElementById('factsList').addEventListener('click', (event) => {
            const mapsBtn = event.target.closest('[data-open-maps]');
            if (mapsBtn) {
                event.stopPropagation();
                if (mapsBtn.disabled || mapsBtn.getAttribute('aria-disabled') === 'true' || mapsBtn.getAttribute('href') === '#') {
                    event.preventDefault();
                    return;
                }
                if (mapsBtn.tagName === 'A' && mapsBtn.getAttribute('href')) return;
                event.preventDefault();
                openFieldMaps(mapsBtn.dataset.openMaps);
                return;
            }
            if (event.target.closest('a')) return;
            const add = event.target.closest('[data-dossier-add]');
            if (add) {
                event.preventDefault();
                event.stopPropagation();
                toggleAddField();
                return;
            }
            const moreBtn = event.target.closest('[data-fact-more]');
            if (moreBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleFactDetails(moreBtn.getAttribute('data-fact-more'));
                return;
            }
            const hideBtn = event.target.closest('[data-sheet-hide]');
            if (hideBtn) {
                event.preventDefault();
                event.stopPropagation();
                hideField(hideBtn.getAttribute('data-sheet-hide'));
                return;
            }
            const dupBtn = event.target.closest('[data-sheet-dup]');
            if (dupBtn) {
                event.preventDefault();
                event.stopPropagation();
                duplicateField(dupBtn.getAttribute('data-sheet-dup'), { focus: 'sheet' });
                return;
            }
            const sheetPlat = event.target.closest('[data-sheet-platform]');
            if (sheetPlat) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = sheetPlat.getAttribute('data-sheet-platform') || '';
                const menu = document.getElementById('platformMenu');
                if (menu && !menu.hidden && (menu.dataset.field === fieldId)) {
                    closePlatformMenu();
                    return;
                }
                const node = document.querySelector('.node[data-field="' + fieldId + '"]');
                openPlatformMenu(node || fieldId, sheetPlat);
                return;
            }
            const sheetPick = event.target.closest('[data-sheet-pick]');
            if (sheetPick) {
                event.preventDefault();
                event.stopPropagation();
                openSheetPick(sheetPick);
                return;
            }
            if (event.target.closest('[data-sheet-field], [data-sheet-meta], .fact-prov, .fact-detail, .case-file, .sheet-pick, #sheetPickMenu, [data-fact-more], [data-fact-cal], [data-fact-time]')) return;
            const find = event.target.closest('[data-search-field]');
            if (find) {
                event.preventDefault();
                event.stopPropagation();
                openSearchMenu(find.dataset.searchField);
                return;
            }
            const reveal = event.target.closest('[data-secret-reveal], [data-reveal]');
            if (reveal) {
                event.preventDefault();
                event.stopPropagation();
                const fieldId = reveal.dataset.secretReveal || decodeURIComponent(reveal.dataset.reveal || '').split('|')[0];
                toggleSecretReveal(fieldId);
                return;
            }
            const button = event.target.closest('[data-remove]');
            if (button) {
                removeFact(button.dataset.remove, decodeURIComponent(button.dataset.value));
                return;
            }
            const row = event.target.closest('[data-focus]');
            if (!row) return;
            activeField = row.dataset.focus;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item.dataset.field === activeField);
            });
            const sheet = row.querySelector('[data-sheet-field]');
            if (sheet) {
                if (isPlatformField(row.dataset.focus) && !fieldPlatformId(row.dataset.focus)) {
                    const pick = row.querySelector('.sheet-platform');
                    const node = document.querySelector('.node[data-field="' + row.dataset.focus + '"]');
                    if (pick) pick.focus();
                    openPlatformMenu(node || row.dataset.focus, pick || row.querySelector('[data-sheet-platform]'));
                    return;
                }
                sheet.focus();
                return;
            }
            if (isPhone() && !profilePanel.classList.contains('open')) {
                openPhoneField(row.dataset.focus);
                return;
            }
            renderProfile();
        });

        document.getElementById('factsList').addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.isComposing || event.keyCode === 229) return;
            if (event.target.closest('[data-fact-meta], .fact-source, .sheet-area')) return;
            const input = event.target.closest('[data-sheet-field]');
            if (!input || input.tagName === 'TEXTAREA') return;
            event.preventDefault();
            commitSheetEnter(input.getAttribute('data-sheet-field') || input.dataset.sheetField);
        });
        document.getElementById('factsList').addEventListener('input', (event) => {
            const meta = event.target.closest('[data-sheet-meta]');
            if (meta) {
                patchFactMeta(meta.getAttribute('data-sheet-meta'), meta.getAttribute('data-fact-meta'), meta.value);
                return;
            }
            const input = event.target.closest('[data-sheet-field]');
            if (!input) return;
            const fieldId = input.dataset.sheetField;
            if (fieldBase(fieldId) === 'phone') applyPhoneMask(input);
            const value = fieldBase(fieldId) === 'timezone'
                ? resolveTimezoneValue(input.value)
                : (fieldBase(fieldId) === 'countrycode' ? (resolveCountryCodeValue(input.value) || input.value) : input.value);
            writeLatestFact(fieldId, value, extrasFromInput(fieldId, value));
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
        });
        document.getElementById('factsList').addEventListener('change', (event) => {
            const meta = event.target.closest('[data-sheet-meta]');
            if (!meta) return;
            patchFactMeta(meta.getAttribute('data-sheet-meta'), meta.getAttribute('data-fact-meta'), meta.value);
        });

