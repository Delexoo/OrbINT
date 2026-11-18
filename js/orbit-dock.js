/* Dock, phone, and toolkit element binding */
        const dockSplit = document.getElementById('dockSplit');
        if (dockSplit) dockSplit.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.OrbINTCase && typeof OrbINTCase.toggleSplit === 'function') OrbINTCase.toggleSplit();
        });
        const dockPlay = document.getElementById('dockPlay');
        if (dockPlay) dockPlay.addEventListener('click', replayIntro);
        document.getElementById('dockPlaytest').addEventListener('click', playtestFillVisibleFields);
        const dockAdd = document.getElementById('dockAdd');
        if (dockAdd) dockAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            closePhoneField();
            closePhoneMore();
            if (window.OrbINTCase && typeof OrbINTCase.dockAdd === 'function' && OrbINTCase.dockAdd()) return;
            openAddField();
        });
        const dockConnect = document.getElementById('dockConnect');
        if (dockConnect) dockConnect.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.OrbINTCase && typeof OrbINTCase.dockConnect === 'function') OrbINTCase.dockConnect();
        });
        document.getElementById('dockHelp').addEventListener('click', (event) => {
            event.stopPropagation();
            openHelp();
        });
        const dockToolkit = document.getElementById('dockToolkit');
        if (dockToolkit) dockToolkit.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleToolkit();
        });
        document.getElementById('dockUndo').addEventListener('click', undoNow);
        document.getElementById('dockRedo').addEventListener('click', redoNow);
        window.addEventListener('orbint-history', updateHistoryButtons);
        document.getElementById('dockExport').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleExportMenu();
        });
        const dockImport = document.getElementById('dockImport');
        if (dockImport) dockImport.addEventListener('click', (event) => {
            event.stopPropagation();
            pickProfileUpload();
        });
        const dockReport = document.getElementById('dockReport');
        if (dockReport) dockReport.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.OrbINTCase) OrbINTCase.downloadReport();
        });
        document.getElementById('dockShare').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleShare();
        });
        document.getElementById('dockInstall').addEventListener('click', (event) => {
            event.stopPropagation();
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) closeInstall();
            else openInstall();
        });
        document.getElementById('phoneHelp').addEventListener('click', openHelp);
        document.getElementById('phoneAdd').addEventListener('click', () => {
            closePhoneField();
            closePhoneMore();
            if (window.OrbINTCase && typeof OrbINTCase.dockAdd === 'function' && OrbINTCase.dockAdd()) return;
            openAddField();
        });
        document.getElementById('phoneShare').addEventListener('click', () => {
            closePhoneField();
            closePhoneMore();
            openShare();
        });
        document.getElementById('phoneMoreBtn').addEventListener('click', () => {
            closePhoneField();
            showSheet(document.getElementById('phoneMore'));
        });
        const phoneMoreHelp = document.getElementById('phoneMoreHelp');
        if (phoneMoreHelp) phoneMoreHelp.addEventListener('click', () => { closePhoneMore(); openHelp(); });
        document.getElementById('phoneMoreClose').addEventListener('click', closePhoneMore);
        document.getElementById('phoneMore').addEventListener('click', (event) => {
            if (event.target.id === 'phoneMore') closePhoneMore();
        });
        document.getElementById('phoneUndo').addEventListener('click', () => { closePhoneMore(); undoNow(); });
        document.getElementById('phoneRedo').addEventListener('click', () => { closePhoneMore(); redoNow(); });
        const phonePlay = document.getElementById('phonePlay');
        if (phonePlay) phonePlay.addEventListener('click', () => { closePhoneMore(); replayIntro(); });
        const phonePlaytest = document.getElementById('phonePlaytest');
        if (phonePlaytest) phonePlaytest.addEventListener('click', () => { closePhoneMore(); playtestFillVisibleFields(); });
        const phoneSplit = document.getElementById('phoneSplit');
        if (phoneSplit) phoneSplit.addEventListener('click', () => {
            closePhoneMore();
            if (window.OrbINTCase && typeof OrbINTCase.toggleSplit === 'function') OrbINTCase.toggleSplit();
        });
        const phoneToolkit = document.getElementById('phoneToolkit');
        if (phoneToolkit) phoneToolkit.addEventListener('click', () => { closePhoneMore(); openToolkit(); });
        document.getElementById('phoneExport').addEventListener('click', () => { closePhoneMore(); toggleExportMenu(); });
        const phoneImport = document.getElementById('phoneImport');
        if (phoneImport) phoneImport.addEventListener('click', () => { closePhoneMore(); pickProfileUpload(); });
        const phoneReport = document.getElementById('phoneReport');
        if (phoneReport) phoneReport.addEventListener('click', () => {
            closePhoneMore();
            if (window.OrbINTCase) OrbINTCase.downloadReport();
        });
        const phoneInstall = document.getElementById('phoneInstall');
        if (phoneInstall) phoneInstall.addEventListener('click', () => { closePhoneMore(); openInstall(); });
        const phoneSettings = document.getElementById('phoneSettings');
        if (phoneSettings) phoneSettings.addEventListener('click', () => { closePhoneMore(); openSettings(); });
        document.getElementById('phoneReset').addEventListener('click', () => { closePhoneMore(); resetCase(); });
        document.getElementById('phoneFieldDone').addEventListener('click', () => {
            writePhoneField();
            closePhoneField();
            renderProfile();
        });
        document.getElementById('phoneField').addEventListener('click', (event) => {
            if (event.target.id === 'phoneField') {
                writePhoneField();
                closePhoneField();
                renderProfile();
            }
        });
        document.getElementById('phoneFieldInput').addEventListener('input', () => {
            writePhoneField();
            syncPhoneFindIcon();
            renderPhoneLeads(phoneFieldId);
        });
        document.getElementById('phonePlatformBtn').addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const trigger = node && node.querySelector('.platform-trigger');
            if (trigger) trigger.click();
        });
        document.getElementById('phoneTzBtn').addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const trigger = node && node.querySelector('.tz-trigger');
            if (trigger) trigger.click();
        });
        const phoneCcBtn = document.getElementById('phoneCcBtn');
        if (phoneCcBtn) phoneCcBtn.addEventListener('click', () => {
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            if (node) openCountryCodeMenu(node);
        });
        const phoneFieldSearch = document.getElementById('phoneFieldSearch');
        if (phoneFieldSearch) phoneFieldSearch.addEventListener('click', () => {
            writePhoneField();
            if (phoneFieldId) openSearchMenu(phoneFieldId);
        });
        document.getElementById('phoneLeads').addEventListener('click', (event) => {
            const browse = event.target.closest('[data-open-toolkit]');
            if (browse) {
                event.stopPropagation();
                openToolkit(browse.dataset.openToolkit || phoneFieldId);
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            openLead(option.dataset.openLead, fieldInputValue(phoneFieldId), option.dataset.leadMode);
        });
        document.getElementById('phoneFieldUpload').addEventListener('click', () => {
            if (fieldBase(phoneFieldId) === 'image') {
                openPhotosSheet();
                return;
            }
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const file = node && node.querySelector('input[type="file"]');
            if (file) file.click();
        });
        document.getElementById('phoneFieldClear').addEventListener('click', () => {
            const editor = document.getElementById('phoneFieldInput');
            if (editor) editor.value = '';
            writePhoneField();
            if (phoneFieldId) clearField(phoneFieldId);
            syncPhoneField();
            renderProfile();
        });
        document.getElementById('phoneReveal').addEventListener('click', () => {
            toggleSecretReveal(phoneFieldId);
        });
        const phoneMaps = document.getElementById('phoneMaps');
        if (phoneMaps) phoneMaps.addEventListener('click', () => {
            openFieldMaps(phoneFieldId);
        });
        document.getElementById('shareClose').addEventListener('click', closeShare);
        document.getElementById('shareSheet').addEventListener('click', (event) => {
            if (event.target.id === 'shareSheet') closeShare();
        });
        document.getElementById('shareCopy').addEventListener('click', copyShareLink);
        const shareSessionLive = document.getElementById('shareSessionLive');
        if (shareSessionLive) {
            shareSessionLive.addEventListener('change', function () {
                if (!window.OrbINTShare || typeof OrbINTShare.setLive !== 'function') return;
                const on = !!shareSessionLive.checked;
                const err = document.getElementById('shareCollabError');
                shareSessionLive.disabled = true;
                OrbINTShare.setLive(on).then(function () {
                    if (err) { err.hidden = true; err.textContent = ''; }
                }).catch(function (error) {
                    if (err) {
                        err.hidden = false;
                        err.textContent = String(error && error.message || error);
                    }
                    shareSessionLive.checked = !on;
                }).then(function () {
                    shareSessionLive.disabled = false;
                    if (window.OrbINTShare) OrbINTShare.paint();
                });
            });
        }
        const shareCopyView = document.getElementById('shareCopyView');
        if (shareCopyView) shareCopyView.addEventListener('click', function () {
            const el = document.getElementById('shareViewUrl');
            if (el && /^https?:/i.test(el.textContent)) OrbINTShare.copy(el.textContent);
        });
        ['setShareApi', 'setCollabWs', 'setHibpKey'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const key = id === 'setShareApi' ? 'shareApiUrl' : id === 'setCollabWs' ? 'collabWsUrl' : 'hibpApiKey';
            el.addEventListener('change', function () {
                patchSettings({ [key]: el.value.trim() });
                if (id !== 'setHibpKey' && window.OrbINTShare) OrbINTShare.paint();
            });
        });
        document.getElementById('shareNative').addEventListener('click', nativeShareSite);
        const installSheet = document.getElementById('installSheet');
        const installClose = document.getElementById('installClose');
        const installDismiss = document.getElementById('installDismiss');
        const installGo = document.getElementById('installGo');
        if (installClose) installClose.addEventListener('click', closeInstall);
        if (installDismiss) installDismiss.addEventListener('click', closeInstall);
        if (installGo) installGo.addEventListener('click', confirmInstall);
        if (installSheet) installSheet.addEventListener('click', (event) => {
            if (event.target.id === 'installSheet') closeInstall();
        });
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredInstallPrompt = event;
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) fillInstallSheet();
        });
        window.addEventListener('appinstalled', () => {
            deferredInstallPrompt = null;
            const sheet = document.getElementById('installSheet');
            if (sheet && !sheet.hidden) fillInstallSheet();
        });
        if (navigator.serviceWorker) {
            navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
        }
        document.getElementById('hubAdd').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleAddField();
        });
        const dossierAdd = document.getElementById('dossierAdd');
        if (dossierAdd) {
            dossierAdd.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleAddField();
            });
        }
        const peerHubs = document.getElementById('peerHubs');
        if (peerHubs) {
            peerHubs.addEventListener('pointerdown', (event) => {
                if (event.button === 1) return;
                if (event.button !== 0) return;
                const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]') || event.target.closest('.peer-hub, [data-peer]');
                if (!peerEl) return;
                const body = peerBodyFromEl(peerEl);
                if (!body) return;
                event.preventDefault();
                event.stopPropagation();
                beginOrbitDrag(event, 'peer', body);
            }, true);
            peerHubs.addEventListener('contextmenu', (event) => {
                const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]') || event.target.closest('.peer-hub, [data-peer]');
                const peerId = peerIdFromEl(peerEl);
                if (!peerId) return;
                event.preventDefault();
                event.stopPropagation();
                openPeerMenu(event, peerId);
            }, true);
            peerHubs.addEventListener('error', (event) => {
                const img = event.target.closest('.peer-hub-face');
                const btn = event.target.closest('.peer-hub');
                if (!img || !btn) return;
                img.remove();
                if (!btn.querySelector('.peer-hub-letter')) {
                    const letter = document.createElement('span');
                    letter.className = 'peer-hub-letter';
                    letter.textContent = profileLetter(btn.getAttribute('title') || 'U');
                    btn.insertBefore(letter, btn.firstChild);
                }
            }, true);
        }
        document.getElementById('addClose').addEventListener('click', closeAddField);
        document.getElementById('addSheet').addEventListener('click', (event) => {
            if (event.target.id === 'addSheet') closeAddField();
            const pick = event.target.closest('[data-add-field]');
            if (!pick) return;
            event.stopPropagation();
            addOrbitField(pick.dataset.addField);
        });
        document.getElementById('addSheet').addEventListener('wheel', (event) => {
            const row = event.target.closest('.add-chips');
            if (!row || row.scrollWidth <= row.clientWidth + 1) return;
            event.preventDefault();
            row.scrollLeft += event.deltaY + event.deltaX;
        }, { passive: false });
        document.getElementById('addPresetFilter').addEventListener('input', renderAddPanel);
        document.getElementById('addCustomForm').addEventListener('submit', (event) => {
            event.preventDefault();
            addCustomField(
                document.getElementById('addCustomLabel').value,
                document.getElementById('addCustomHint').value
            );
        });
        const toolkitClose = document.getElementById('toolkitClose');
        const toolkitSheet = document.getElementById('toolkitSheet');
        const toolkitFilter = document.getElementById('toolkitFilter');
        const toolkitList = document.getElementById('toolkitList');
        const toolkitFocusClear = document.getElementById('toolkitFocusClear');
        if (toolkitClose) toolkitClose.addEventListener('click', closeToolkit);
        if (toolkitSheet) toolkitSheet.addEventListener('click', (event) => {
            if (event.target.id === 'toolkitSheet') closeToolkit();
        });
        if (toolkitFilter) toolkitFilter.addEventListener('input', renderToolkit);
        if (toolkitFocusClear) toolkitFocusClear.addEventListener('click', () => {
            toolkitFocusField = '';
            toolkitOpenCats.clear();
            if (toolkitFilter) {
                toolkitFilter.placeholder = 'Search categories or tools';
            }
            renderToolkit();
            if (toolkitFilter) toolkitFilter.focus();
        });
        if (toolkitList) toolkitList.addEventListener('click', (event) => {
            const toggle = event.target.closest('[data-toolkit-toggle]');
            if (toggle) {
                event.stopPropagation();
                const tools = toggle.nextElementSibling;
                const key = toggle.getAttribute('data-toolkit-toggle') || '';
                const open = toggle.getAttribute('aria-expanded') !== 'true';
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (tools) tools.hidden = !open;
                if (key) {
                    if (open) toolkitOpenCats.add(key);
                    else toolkitOpenCats.delete(key);
                }
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            openLead(option.dataset.openLead, fieldInputValue(toolkitFocusField), option.dataset.leadMode);
        });

        const profileToggle = document.getElementById('profileToggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', function () {
                if (isPhone()) {
                    setPanelOpen(!profilePanel.classList.contains('open'));
                    return;
                }
                setCasebookCollapsed(!document.body.classList.contains('casebook-collapsed'));
            });
        }
        document.getElementById('profileClose').addEventListener('click', () => setPanelOpen(false));
        const pageSwitchNav = document.getElementById('pageSwitch');
        if (pageSwitchNav) {
            pageSwitchNav.addEventListener('click', function (event) {
                const btn = event.target.closest('[data-page]');
                if (btn && btn.getAttribute('data-page') !== 'casebook' && isPhone() && profilePanel.classList.contains('open')) {
                    setPanelOpen(false);
                }
            });
        }
        const dockPortfolio = document.getElementById('dockPortfolio');
        if (dockPortfolio) {
            dockPortfolio.addEventListener('click', () => {
                setPanelOpen(!profilePanel.classList.contains('open'));
            });
        }
        const dockMore = document.getElementById('dockMore');
        if (dockMore) {
            dockMore.addEventListener('click', () => {
                closePhoneField();
                showSheet(document.getElementById('phoneMore'));
            });
        }
        backdrop.addEventListener('click', () => setPanelOpen(false));
        const profileRailList = document.getElementById('profileRailList');
        if (profileRailList) {
            profileRailList.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-profile]');
                if (!btn) return;
                const id = btn.dataset.profile;
                const peer = document.querySelector('.peer-hub[data-peer="' + id + '"]');
                if (peer) openLinkedProfile(id, peer);
                else switchProfile(id);
            });
            profileRailList.addEventListener('contextmenu', (event) => {
                const btn = event.target.closest('[data-profile]');
                if (!btn) return;
                event.preventDefault();
                openProfileMenu(event, btn.dataset.profile);
            });
            profileRailList.addEventListener('error', (event) => {
                const img = event.target.closest('img');
                const btn = event.target.closest('.profile-rail-item');
                if (!img || !btn) return;
                const letter = escapeHtml(profileLetter(btn.getAttribute('title') || 'U'));
                const linked = linkedProfileIds(btn.dataset.profile).length > 0;
                btn.innerHTML = '<span class="profile-rail-face"><span>' + letter + '</span></span>' + (linked ? PROFILE_LINK_BADGE : '');
            }, true);
        }
        document.getElementById('profileNew').addEventListener('click', () => createProfile(''));
        document.getElementById('profileUpload').addEventListener('click', pickProfileUpload);
        document.getElementById('profileRename').addEventListener('click', () => openProfilePrompt('rename'));
        document.getElementById('profileFile').addEventListener('change', (event) => {
            uploadProfileFiles(event.target.files);
            event.target.value = '';
        });
        document.getElementById('profilePromptCancel').addEventListener('click', closeProfilePrompt);
        document.getElementById('profilePromptGo').addEventListener('click', submitProfilePrompt);
        document.getElementById('profilePromptInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitProfilePrompt();
            }
        });
        const profilePromptSheet = document.getElementById('profilePrompt');
        if (profilePromptSheet) profilePromptSheet.addEventListener('click', (event) => {
            if (event.target.id === 'profilePrompt') closeProfilePrompt();
        });
        document.getElementById('profileMenu').addEventListener('click', (event) => {
            const button = event.target.closest('[data-profile-act]');
            if (!button || button.disabled) return;
            event.stopPropagation();
            const act = button.dataset.profileAct;
            const id = document.getElementById('profileMenu').dataset.profile;
            closeProfileMenu();
            if (act === 'open') {
                const peer = document.querySelector('.peer-hub[data-peer="' + id + '"]');
                if (peer) openLinkedProfile(id, peer);
                else switchProfile(id);
            }
            else if (act === 'rename') openProfilePrompt('rename', id);
            else if (act === 'duplicate') duplicateProfile(id);
            else if (act === 'download') downloadProfile(id);
            else if (act === 'delete') openProfilePrompt('delete', id);
        });
        document.addEventListener('keydown', (event) => {
            const key = (event.key || '').toLowerCase();
            const promptOpen = profilePromptSheet && !profilePromptSheet.hidden;
            if (promptOpen && (event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y')) return;
            const typing = event.target && event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"]');
            const undoKey = (event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y');
            if (typing) {
                const pg = document.body.getAttribute('data-page');
                if (!undoKey || (pg !== 'timeline' && pg !== 'whiteboard')) return;
            }
            if (event.code === 'Space' || event.key === ' ') {
                event.preventDefault();
                document.body.classList.add('is-space-pan');
            }
            if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
                event.preventDefault();
                undoNow();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && (key === 'y' || (key === 'z' && event.shiftKey))) {
                event.preventDefault();
                redoNow();
                return;
            }
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !promptOpen) {
                const viewer = document.getElementById('mediaViewer');
                if (viewer && !viewer.hidden && mediaGallery.items.length > 1) {
                    event.preventDefault();
                    stepMediaGallery(event.key === 'ArrowRight' ? 1 : -1);
                    return;
                }
            }
            if (event.key === 'Escape') {
                if (promptOpen) {
                    closeProfilePrompt();
                    return;
                }
                const profileMenu = document.getElementById('profileMenu');
                if (profileMenu && !profileMenu.hidden) {
                    closeProfileMenu();
                    return;
                }
                const phoneField = document.getElementById('phoneField');
                if (phoneField && !phoneField.hidden) {
                    closePhoneField();
                    return;
                }
                const phoneMore = document.getElementById('phoneMore');
                if (phoneMore && !phoneMore.hidden) {
                    closePhoneMore();
                    return;
                }
                const lock = document.getElementById('lockCurtain');
                if (lock && !lock.hidden) {
                    coverWorkspace(false);
                    bumpIdleLock();
                    return;
                }
                const bomb = document.getElementById('bombConfirm');
                if (bomb && !bomb.hidden) {
                    closeBombConfirm();
                    patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
                    syncSettingsForm();
                    return;
                }
                if (setPickOpen) {
                    closeSetPick();
                    return;
                }
                const settings = document.getElementById('settingsSheet');
                if (settings && !settings.hidden) {
                    closeSettings();
                    return;
                }
                const reset = document.getElementById('resetConfirm');
                if (reset && !reset.hidden) {
                    closeResetConfirm();
                    return;
                }
                const share = document.getElementById('shareSheet');
                if (share && !share.hidden) {
                    closeShare();
                    return;
                }
                const install = document.getElementById('installSheet');
                if (install && !install.hidden) {
                    closeInstall();
                    return;
                }
                const photos = document.getElementById('photosSheet');
                if (photos && !photos.hidden) {
                    closePhotosSheet();
                    return;
                }
                if (window.OrbINTCase && typeof OrbINTCase.closeOverlays === 'function') {
                    const meta = document.getElementById('metaSheet');
                    const intel = document.getElementById('intelSheet');
                    const eventSheet = document.getElementById('eventSheet');
                    const reverse = document.getElementById('reverseMenu');
                    if ((meta && !meta.hidden) || (intel && !intel.hidden) || (eventSheet && !eventSheet.hidden) || (reverse && !reverse.hidden)) {
                        OrbINTCase.closeOverlays();
                        return;
                    }
                }
                const add = document.getElementById('addSheet');
                if (add && !add.hidden) {
                    closeAddField();
                    return;
                }
                const toolkit = document.getElementById('toolkitSheet');
                if (toolkit && !toolkit.hidden) {
                    closeToolkit();
                    return;
                }
                const viewer = document.getElementById('mediaViewer');
                if (viewer && !viewer.hidden) {
                    closeMediaViewer();
                    return;
                }
                setPanelOpen(false);
                closePlatformMenu();
                closeSearchMenu();
                closeExportMenu();
                closeFieldMenu();
            }
        });

        document.addEventListener('keyup', function (event) {
            if (event.code === 'Space' || event.key === ' ') document.body.classList.remove('is-space-pan');
        });
        window.addEventListener('blur', function () {
            document.body.classList.remove('is-space-pan');
        });
        document.addEventListener('dragstart', function (event) {
            if (event.target && event.target.closest && event.target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
        });
        document.addEventListener('mousedown', function (event) {
            if (event.button !== 1) return;
            if (event.target && event.target.closest && event.target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
        }, true);

