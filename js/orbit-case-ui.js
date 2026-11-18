/* Case number, offense, and status controls */
        function bindCaseFileFields() {
            ['caseNumber', 'caseOffense', 'caseInvestigator'].forEach(function (id) {
                const el = document.getElementById(id);
                if (!el || el.dataset.boundCase) return;
                el.dataset.boundCase = '1';
                const apply = function () {
                    if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
                    profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                    const map = { caseNumber: 'number', caseOffense: 'offense', caseInvestigator: 'investigator' };
                    profile.case[map[id]] = el.value;
                    if (id === 'caseOffense') {
                        const pick = document.getElementById('caseOffensePick');
                        if (pick) pick.dataset.value = el.value;
                    }
                    if (id === 'caseNumber' && el.value && !profile.case.openedAt) profile.case.openedAt = new Date().toISOString();
                    saveProfile();
                };
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            });
            function bindCasePick(id) {
                const btn = document.getElementById(id);
                if (!btn || btn.dataset.boundCase) return;
                btn.dataset.boundCase = '1';
                btn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    openSheetPick(btn);
                });
            }
            bindCasePick('caseStatus');
            bindCasePick('caseOffensePick');
        }
        bindCaseFileFields();

        let sheetPickOpen = '';
        let sheetPickAnchor = null;
        let sheetPickCloseTimer = 0;

        function finishSheetPickClose(menu) {
            hideSheetPickTip();
            if (!menu || sheetPickOpen) return;
            menu.hidden = true;
            menu.innerHTML = '';
            menu.classList.remove('is-up', 'is-in', 'is-out');
            menu.style.left = '';
            menu.style.top = '';
            menu.style.bottom = '';
            menu.style.minWidth = '';
        }

        function hideSheetPickTip() {
            const tip = document.getElementById('sheetPickTip');
            if (!tip) return;
            tip.hidden = true;
            tip.textContent = '';
            tip.style.left = '';
            tip.style.top = '';
        }

        function showSheetPickTip(btn) {
            const hint = btn && btn.getAttribute('data-pick-hint');
            const tip = document.getElementById('sheetPickTip');
            const menu = document.getElementById('sheetPickMenu');
            if (!hint || !tip || !menu || menu.hidden) {
                hideSheetPickTip();
                return;
            }
            tip.textContent = hint;
            tip.hidden = false;
            const br = btn.getBoundingClientRect();
            const mr = menu.getBoundingClientRect();
            const tr = tip.getBoundingClientRect();
            let left = mr.right + 8;
            if (left + tr.width > window.innerWidth - 8) left = Math.max(8, mr.left - tr.width - 8);
            let top = br.top + (br.height - tr.height) / 2;
            top = Math.max(8, Math.min(top, window.innerHeight - tr.height - 8));
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }

        function closeSheetPick() {
            hideSheetPickTip();
            sheetPickOpen = '';
            sheetPickAnchor = null;
            const menu = document.getElementById('sheetPickMenu');
            document.querySelectorAll('.sheet-pick[aria-expanded="true"]').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
            });
            if (!menu || menu.hidden) return;
            clearTimeout(sheetPickCloseTimer);
            if (document.documentElement.classList.contains('reduce-motion')) {
                finishSheetPickClose(menu);
                return;
            }
            menu.classList.remove('is-in');
            menu.classList.add('is-out');
            const onEnd = function (event) {
                if (event.target !== menu) return;
                menu.removeEventListener('animationend', onEnd);
                finishSheetPickClose(menu);
            };
            menu.addEventListener('animationend', onEnd);
            sheetPickCloseTimer = setTimeout(function () {
                menu.removeEventListener('animationend', onEnd);
                finishSheetPickClose(menu);
            }, 200);
        }

        function placeSheetPick(btn) {
            const menu = document.getElementById('sheetPickMenu');
            if (!menu || !btn) return;
            const box = btn.closest('.case-offense') || btn;
            const r = box.getBoundingClientRect();
            const w = Math.max(r.width, 196);
            let left = r.left;
            if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
            if (left < 8) left = 8;
            const spaceBelow = window.innerHeight - r.bottom - 10;
            const spaceAbove = r.top - 10;
            const need = Math.min(menu.scrollHeight || 240, Math.min(window.innerHeight * 0.7, 420));
            const up = spaceBelow < Math.min(need, 240) && spaceAbove > spaceBelow;
            const room = Math.max(120, up ? spaceAbove : spaceBelow);
            menu.classList.toggle('is-up', up);
            menu.style.minWidth = w + 'px';
            menu.style.maxWidth = Math.min(280, window.innerWidth - 16) + 'px';
            menu.style.maxHeight = Math.min(room, window.innerHeight * 0.7, 420) + 'px';
            menu.style.left = left + 'px';
            if (up) {
                menu.style.top = 'auto';
                menu.style.bottom = (window.innerHeight - r.top + 6) + 'px';
            } else {
                menu.style.bottom = 'auto';
                menu.style.top = (r.bottom + 6) + 'px';
            }
        }

        function paintSheetPickButton(btn, kind, value) {
            if (!btn) return;
            btn.dataset.value = value || '';
            btn.classList.toggle('is-empty', !value);
            const lab = btn.querySelector('span');
            if (lab) lab.textContent = sheetPickLabel(kind, value);
        }

        function applySheetPick(kind, fieldId, value) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            if (kind === 'status') {
                profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                profile.case.status = value || 'open';
                paintSheetPickButton(document.getElementById('caseStatus'), 'status', profile.case.status);
                saveProfile();
                return;
            }
            if (kind === 'offense') {
                profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
                profile.case.offense = value || '';
                const input = document.getElementById('caseOffense');
                if (input) input.value = profile.case.offense;
                paintSheetPickButton(document.getElementById('caseOffensePick'), 'offense', profile.case.offense);
                saveProfile();
                return;
            }
            if (!fieldId) return;
            patchFactMeta(fieldId, kind, value);
            const btn = document.querySelector('.sheet-pick[data-sheet-pick="' + kind + '"][data-sheet-meta="' + fieldId + '"]');
            paintSheetPickButton(btn, kind, value);
        }

        function openSheetPick(btn) {
            const kind = btn && btn.getAttribute('data-sheet-pick');
            const menu = document.getElementById('sheetPickMenu');
            const options = (typeof SHEET_PICKS !== 'undefined' && SHEET_PICKS[kind]) || [];
            if (!kind || !menu || !options.length) return;
            const key = kind + ':' + (btn.getAttribute('data-sheet-meta') || btn.id || '');
            if (sheetPickOpen === key) {
                closeSheetPick();
                return;
            }
            if (typeof closeSetPick === 'function') closeSetPick();
            if (typeof closePlatformMenu === 'function') closePlatformMenu();
            if (menu.parentElement !== document.body) document.body.appendChild(menu);
            sheetPickOpen = key;
            sheetPickAnchor = btn;
            const current = kind === 'offense'
                ? String((document.getElementById('caseOffense') || {}).value || '').trim()
                : (btn.getAttribute('data-value') || '');
            const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
            menu.innerHTML = options.map(function (item) {
                if (item.sep) return '<div class="set-pick-sep"></div>';
                const on = String(item.value || '').trim().toLowerCase() === current.toLowerCase();
                const active = on ? ' is-active' : '';
                const hint = item.hint ? ' data-pick-hint="' + escapeHtml(item.hint) + '"' : '';
                const aria = item.hint
                    ? ' aria-label="' + escapeHtml(item.label + '. ' + item.hint) + '"'
                    : '';
                return '<button type="button" role="option" class="' + active + '" data-pick-kind="' + kind + '" data-pick-field="' + escapeHtml(btn.getAttribute('data-sheet-meta') || '') + '" data-pick-value="' + escapeHtml(item.value) + '" aria-selected="' + (on ? 'true' : 'false') + '"' + hint + aria + '><span>' + escapeHtml(item.label) + '</span>' + check + '</button>';
            }).join('');
            clearTimeout(sheetPickCloseTimer);
            menu.classList.remove('is-out', 'is-in');
            menu.hidden = false;
            document.querySelectorAll('.sheet-pick[aria-expanded="true"]').forEach(function (el) {
                el.setAttribute('aria-expanded', 'false');
            });
            btn.setAttribute('aria-expanded', 'true');
            placeSheetPick(btn);
            void menu.offsetWidth;
            menu.classList.add('is-in');
        }

        const sheetPickMenu = document.getElementById('sheetPickMenu');
        if (sheetPickMenu) {
            sheetPickMenu.addEventListener('click', function (event) {
                const choice = event.target.closest('[data-pick-kind]');
                if (!choice) return;
                event.preventDefault();
                const kind = choice.getAttribute('data-pick-kind');
                const fieldId = choice.getAttribute('data-pick-field') || '';
                const value = choice.getAttribute('data-pick-value') || '';
                hideSheetPickTip();
                closeSheetPick();
                applySheetPick(kind, fieldId, value);
            });
            sheetPickMenu.addEventListener('mouseover', function (event) {
                const opt = event.target.closest('[data-pick-hint]');
                if (opt) showSheetPickTip(opt);
            });
            sheetPickMenu.addEventListener('mouseleave', hideSheetPickTip);
            sheetPickMenu.addEventListener('scroll', hideSheetPickTip);
            sheetPickMenu.addEventListener('focusin', function (event) {
                const opt = event.target.closest('[data-pick-hint]');
                if (opt) showSheetPickTip(opt);
            });
            sheetPickMenu.addEventListener('focusout', function (event) {
                if (!event.relatedTarget || !sheetPickMenu.contains(event.relatedTarget)) hideSheetPickTip();
            });
        }
        document.addEventListener('mousedown', function (event) {
            if (!sheetPickOpen) return;
            if (event.target.closest('.sheet-pick') || event.target.closest('#sheetPickMenu')) return;
            closeSheetPick();
        });
        window.addEventListener('resize', function () {
            if (sheetPickOpen && sheetPickAnchor) placeSheetPick(sheetPickAnchor);
        });

        let nameEditOriginal = '';
        const subjectName = document.getElementById('subjectName');
        const subjectEdit = document.getElementById('subjectEdit');
        const subjectNameInput = document.getElementById('subjectNameInput');
        const targetFace = document.getElementById('targetFace');
        const profilePhotoFile = document.getElementById('profilePhotoFile');

        function onNameEditClick(event) {
            event.preventDefault();
            event.stopPropagation();
            if (document.getElementById('subjectNameRow') && document.getElementById('subjectNameRow').classList.contains('editing')) return;
            nameEditOriginal = firstValue('name');
            beginNameEdit();
        }
        if (subjectEdit) subjectEdit.addEventListener('click', onNameEditClick);
        const subjectFind = document.getElementById('subjectFind');
        if (subjectFind) {
            subjectFind.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openSearchMenu('name', subjectFind);
            });
        }
        const idStackEl = document.getElementById('idStack');
        if (idStackEl) {
            idStackEl.addEventListener('click', (event) => {
                const mapsBtn = event.target.closest('[data-open-maps]');
                if (!mapsBtn) return;
                event.stopPropagation();
                if (mapsBtn.disabled || mapsBtn.getAttribute('aria-disabled') === 'true' || mapsBtn.getAttribute('href') === '#') {
                    event.preventDefault();
                    return;
                }
                if (mapsBtn.tagName === 'A' && mapsBtn.getAttribute('href')) return;
                event.preventDefault();
                openFieldMaps(mapsBtn.dataset.openMaps);
            });
        }
        if (subjectNameInput) {
            subjectNameInput.addEventListener('input', () => {
                writeLatestFact('name', subjectNameInput.value, extrasFromInput('name', subjectNameInput.value));
            });
            subjectNameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    endNameEdit(true);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    subjectNameInput.value = nameEditOriginal;
                    writeLatestFact('name', nameEditOriginal, extrasFromInput('name', nameEditOriginal));
                    endNameEdit(false);
                }
            });
            subjectNameInput.addEventListener('blur', () => {
                requestAnimationFrame(function () {
                    if (document.activeElement === subjectNameInput) return;
                    endNameEdit(true);
                });
            });
        }
        document.addEventListener('pointerdown', (event) => {
            const row = document.getElementById('subjectNameRow');
            if (!row || !row.classList.contains('editing')) return;
            if (event.target.closest('#subjectNameInput')) return;
            endNameEdit(true);
        }, true);
            if (targetFace && profilePhotoFile) {
            targetFace.addEventListener('click', (event) => {
                event.preventDefault();
                openPhotosSheet();
            });
            profilePhotoFile.addEventListener('change', () => {
                const files = takeInputFiles(profilePhotoFile);
                const target = photoUploadFor;
                photoUploadFor = '';
                if (!files.length) return;
                if (!target || target === (profileLibrary && profileLibrary.activeId)) {
                    applyProfilePhotoFiles(files);
                } else {
                    applyPhotoToProfile(target, files[0]);
                }
            });
        }
        const faceGallery = document.getElementById('faceGallery');
        if (faceGallery) {
            faceGallery.addEventListener('click', (event) => {
                const view = event.target.closest('[data-face-view]');
                if (view) {
                    event.preventDefault();
                    openPhotosSheet();
                }
            });
        }

        document.getElementById('dockReset').addEventListener('click', resetCase);
        const dockSettings = document.getElementById('dockSettings');
        if (dockSettings) dockSettings.addEventListener('click', function () {
            const sheet = document.getElementById('settingsSheet');
            if (sheet && !sheet.hidden) closeSettings();
            else openSettings();
        });
        const resetSheet = document.getElementById('resetConfirm');
        document.getElementById('resetCancel').addEventListener('click', closeResetConfirm);
        document.getElementById('resetConfirmBtn').addEventListener('click', applyResetCase);
        if (resetSheet) resetSheet.addEventListener('click', (event) => {
            if (event.target.id === 'resetConfirm') closeResetConfirm();
        });
        const bombSheet = document.getElementById('bombConfirm');
        const bombCancel = document.getElementById('bombCancel');
        const bombGo = document.getElementById('bombConfirmBtn');
        if (bombCancel) bombCancel.addEventListener('click', function () {
            closeBombConfirm();
            patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
            syncSettingsForm();
        });
        if (bombGo) bombGo.addEventListener('click', function () {
            closeBombConfirm();
            applyResetCase();
        });
        if (bombSheet) bombSheet.addEventListener('click', function (event) {
            if (event.target.id !== 'bombConfirm') return;
            closeBombConfirm();
            patchSettings({ logicBombPeriod: bombPrevPeriod || '6m' });
            syncSettingsForm();
        });
        const settingsSheet = document.getElementById('settingsSheet');
        const settingsClose = document.getElementById('settingsClose');
        if (settingsClose) settingsClose.addEventListener('click', closeSettings);
        if (settingsSheet) settingsSheet.addEventListener('click', function (event) {
            if (event.target.id === 'settingsSheet') closeSettings();
        });
        const lockUnlock = document.getElementById('lockUnlock');
        if (lockUnlock) lockUnlock.addEventListener('click', function () {
            coverWorkspace(false);
            bumpIdleLock();
        });
        const settingToggles = {
            setLogicBomb: 'logicBomb',
            setCurtain: 'curtain',
            setConfirmOut: 'confirmOutbound',
            setStealth: 'stealthTab',
            setReduceMotion: 'reduceMotion',
            setHideTips: 'hideTips',
            setLargeType: 'largeType',
            setRememberPage: 'rememberPage',
            setHideBg: 'hideBackground',
            setShowGitHub: 'showGitHub',
            setShowDonate: 'showDonate',
            setExportNoPhotos: 'exportNoPhotos',
            setInvestigator: 'investigatorMode'
        };
        Object.keys(settingToggles).forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', function () {
                const patch = {};
                patch[settingToggles[id]] = !!el.checked;
                if (settingToggles[id] === 'logicBomb') patch.lastSeen = Date.now();
                patchSettings(patch);
                applyAppSettings(true);
                syncSettingsForm();
                if (settingToggles[id] === 'investigatorMode' && typeof renderProfile === 'function') renderProfile(true);
            });
        });
        document.querySelectorAll('[data-set-pick]').forEach(function (wrap) {
            const btn = wrap.querySelector('.set-pick-btn');
            if (!btn) return;
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                closeSheetPick();
                openSetPick(wrap.getAttribute('data-set-pick'), btn);
            });
        });
        const setPickMenu = document.getElementById('setPickMenu');
        if (setPickMenu) {
            setPickMenu.addEventListener('click', function (event) {
                const choice = event.target.closest('[data-set-value]');
                if (!choice || !setPickOpen) return;
                event.preventDefault();
                const id = setPickOpen;
                const value = choice.getAttribute('data-set-value');
                closeSetPick();
                applySetPick(id, value);
            });
        }
        document.addEventListener('mousedown', function (event) {
            if (!setPickOpen) return;
            if (event.target.closest('.set-pick') || event.target.closest('#setPickMenu')) return;
            closeSetPick();
        });
        const settingsBody = document.querySelector('.settings-body');
        if (settingsBody) settingsBody.addEventListener('scroll', closeSetPick, { passive: true });
        ['pointerdown', 'keydown', 'wheel'].forEach(function (name) {
            document.addEventListener(name, function () {
                if (document.getElementById('lockCurtain') && !document.getElementById('lockCurtain').hidden) return;
                bumpIdleLock();
            }, { passive: true });
        });
        document.addEventListener('visibilitychange', function () {
            applyStealthTitle();
            if (document.hidden) {
                touchSeen(true);
                bombPulseLow = false;
                return;
            }
            markSeen();
            bombPulseLow = false;
            bumpIdleLock();
            const settings = document.getElementById('settingsSheet');
            if (settings && !settings.hidden) updateBombCountdown();
        });
        window.addEventListener('pagehide', function () {
            touchSeen(true);
        });
        applyAppSettings();
        syncSettingsForm();
        document.getElementById('dockRecenter').addEventListener('click', recenterOrbit);
