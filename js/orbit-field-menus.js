/* Orbit field context menus */
        let fieldMenuGuard = false;
        let fieldMenuGuardTimer = 0;

        function armFieldMenuGuard() {
            fieldMenuGuard = true;
            clearTimeout(fieldMenuGuardTimer);
            fieldMenuGuardTimer = setTimeout(() => { fieldMenuGuard = false; }, 80);
        }

        function closeFieldMenu() {
            const menu = document.getElementById('fieldMenu');
            if (menu) menu.hidden = true;
            fieldMenuGuard = false;
            clearTimeout(fieldMenuGuardTimer);
        }

        function fieldMenuValue(fieldId) {
            const input = document.getElementById('field-' + fieldId);
            return ((input && input.value) || '').trim();
        }

        function copyFieldValue(fieldId) {
            const value = fieldMenuValue(fieldId);
            if (!value || !navigator.clipboard || !navigator.clipboard.writeText) return;
            navigator.clipboard.writeText(value).catch(function () {});
        }

        function openFieldMenu(event, node) {
            const menu = document.getElementById('fieldMenu');
            const stage = document.getElementById('mapStage');
            const fieldId = node && node.dataset.field;
            const field = fieldById(fieldId);
            if (!menu || !stage || !field) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeExportMenu();
            const value = fieldMenuValue(fieldId);
            const hasValue = !!value;
            menu.innerHTML =
                '<button type="button" data-field-act="copy" ' + (hasValue ? '' : 'disabled') + '>Copy</button>' +
                '<button type="button" data-field-act="copy-label" ' + (hasValue ? '' : 'disabled') + '>Copy with label</button>' +
                '<button type="button" data-field-act="cut" ' + (hasValue ? '' : 'disabled') + '>Cut</button>' +
                '<button type="button" data-field-act="paste">Paste</button>' +
                '<button type="button" data-field-act="select">Select all</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" data-field-act="rename">Rename field</button>' +
                '<button type="button" data-field-act="duplicate">Duplicate</button>' +
                '<button type="button" data-field-act="search">' + (hasValue ? 'Search deeper' : 'How to find this') + '</button>' +
                '<button type="button" class="field-danger" data-field-act="null">' + (isNullField(fieldId) ? 'Unmark missing' : 'Missing') + '</button>' +
                '<button type="button" data-field-act="clear" ' + (hasValue || isNullField(fieldId) ? '' : 'disabled') + '>Clear value</button>' +
                '<button type="button" data-field-act="hide">Remove field</button>' +
                (hiddenFields.size ? '<div class="field-sep"></div><button type="button" data-field-act="restore">Show all fields</button>' : '');
            menu.dataset.field = fieldId;
            menu.dataset.peer = '';
            menu.dataset.actLock = '';
            menu.hidden = false;
            const mapRect = stage.getBoundingClientRect();
            const left = event.clientX - mapRect.left;
            const top = event.clientY - mapRect.top;
            menu.style.left = Math.max(8, Math.min(left, mapRect.width - menu.offsetWidth - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(top, mapRect.height - menu.offsetHeight - 8)) + 'px';
            armFieldMenuGuard();
        }

        function runFieldAction(act, fieldId, extra) {
            const input = document.getElementById('field-' + fieldId);
            if (act === 'copy') {
                copyFieldValue(fieldId);
                return;
            }
            if (act === 'copy-label') {
                const value = fieldMenuValue(fieldId);
                const field = fieldById(fieldId);
                if (!value || !field || !navigator.clipboard || !navigator.clipboard.writeText) return;
                navigator.clipboard.writeText(field.label + ': ' + value).catch(function () {});
                return;
            }
            if (act === 'cut') {
                copyFieldValue(fieldId);
                clearField(fieldId);
                return;
            }
            if (act === 'paste') {
                if (!input || !navigator.clipboard || !navigator.clipboard.readText) return;
                navigator.clipboard.readText().then((text) => {
                    if (!text) return;
                    input.hidden = false;
                    input.value = text;
                    input.focus();
                    syncNodeFilled(input);
                    saveInputAsIs(input);
                    if (isThumbField(fieldId)) setFieldThumb(fieldId);
                }).catch(function () {});
                return;
            }
            if (act === 'select') {
                if (!input) return;
                input.hidden = false;
                input.focus();
                input.select();
                return;
            }
            if (act === 'rename') {
                beginFieldRename(fieldId);
                return;
            }
            if (act === 'duplicate') {
                duplicateField(fieldId);
                return;
            }
            if (act === 'search') {
                openSearchMenu(fieldId);
                return;
            }
            if (act === 'null') {
                toggleFieldNull(fieldId);
                return;
            }
            if (act === 'clear') {
                clearField(fieldId);
                return;
            }
            if (act === 'hide') {
                hideField(fieldId);
                return;
            }
            if (act === 'restore') showAllFields();
            if (act === 'recenter') recenterOrbit();
            if (act === 'play') replayIntro();
            if (act === 'playtest') playtestFillVisibleFields();
            if (act === 'help') openHelp();
            if (act === 'toolkit') openToolkit();
            if (act === 'undo') undoNow();
            if (act === 'redo') redoNow();
            if (act === 'export') toggleExportMenu();
            if (act === 'share') openShare();
            if (act === 'install') openInstall();
            if (act === 'reset') resetCase();
            if (act === 'new-profile') createProfile('');
            if (act === 'place-profile') {
                placeLinkedProfile(mapMenuAnchor);
                mapMenuAnchor = null;
            }
            if (act === 'link-profile' && extra) linkProfiles(profileLibrary && profileLibrary.activeId, extra);
            if (act === 'unlink-profile' && extra) unlinkProfiles(profileLibrary && profileLibrary.activeId, extra);
            if (act === 'delete-profile' && extra) {
                if (profileLibrary && profileLibrary.order && profileLibrary.order.length > 1) {
                    openProfilePrompt('delete', extra);
                }
                return;
            }
            if (act === 'open-profile' && extra) {
                const peer = document.querySelector('.peer-hub[data-peer="' + extra + '"]');
                openLinkedProfile(extra, peer);
            }
            if (act === 'upload-photo') pickProfilePhoto(extra);
        }

        let renameState = null;

        function stopFieldRename(save) {
            if (!renameState) return;
            const state = renameState;
            renameState = null;
            const next = state.input.value.trim().slice(0, 28);
            state.input.remove();
            if (state.label) state.label.hidden = false;
            if (state.node) state.node.classList.remove('renaming');
            if (save && next && next !== state.original) applyFieldLabel(state.fieldId, next);
        }

        function beginFieldRename(fieldId) {
            stopFieldRename(true);
            const field = fieldById(fieldId);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const label = node && node.querySelector('label');
            if (!field || !label) return;
            const input = document.createElement('input');
            input.className = 'node-rename';
            input.type = 'text';
            input.value = field.label;
            input.maxLength = 28;
            input.setAttribute('aria-label', 'Rename field');
            input.spellcheck = false;
            input.autocomplete = 'off';
            label.hidden = true;
            label.after(input);
            node.classList.add('renaming');
            renameState = { fieldId: fieldId, input: input, label: label, node: node, original: field.label };
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    stopFieldRename(true);
                    return;
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    stopFieldRename(false);
                }
            });
            input.addEventListener('blur', () => stopFieldRename(true));
            input.addEventListener('pointerdown', (event) => event.stopPropagation());
            input.focus();
            input.select();
        }

        function placeFieldMenu(event) {
            const menu = document.getElementById('fieldMenu');
            const stage = document.getElementById('mapStage');
            if (!menu || !stage) return;
            const mapRect = stage.getBoundingClientRect();
            const left = event.clientX - mapRect.left;
            const top = event.clientY - mapRect.top;
            menu.style.left = Math.max(8, Math.min(left, mapRect.width - menu.offsetWidth - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(top, mapRect.height - menu.offsetHeight - 8)) + 'px';
            armFieldMenuGuard();
        }

        function openMapMenu(event) {
            const menu = document.getElementById('fieldMenu');
            if (!menu) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeExportMenu();
            mapMenuAnchor = mapEventToHubWorld(event);
            const canUndo = history.past.length >= 2;
            const canRedo = !!history.future.length;
            menu.innerHTML =
                '<button type="button" data-field-act="place-profile">New profile</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" data-field-act="help">Guide</button>' +
                '<button type="button" data-field-act="toolkit">OSINT toolkit</button>' +
                '<button type="button" data-field-act="recenter">Recenter</button>' +
                '<button type="button" data-field-act="play">Play</button>' +
                '<button type="button" data-field-act="playtest">Generate Identity</button>' +
                '<button type="button" data-field-act="undo" ' + (canUndo ? '' : 'disabled') + '>Undo</button>' +
                '<button type="button" data-field-act="redo" ' + (canRedo ? '' : 'disabled') + '>Redo</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" data-field-act="export">Export</button>' +
                '<button type="button" data-field-act="share">Share</button>' +
                '<button type="button" data-field-act="install">Install app</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" class="field-danger" data-field-act="reset">Reset</button>';
            menu.dataset.field = '';
            menu.dataset.peer = '';
            menu.dataset.actLock = '';
            menu.hidden = false;
            placeFieldMenu(event);
        }

        function profileMenuButtons(fromId) {
            const source = fromId || (profileLibrary && profileLibrary.activeId) || '';
            const linked = linkedProfileIds(source);
            const available = otherProfiles(source).filter((id) => linked.indexOf(id) === -1);
            let html = '<button type="button" data-field-act="place-profile">New profile</button>';
            if (available.length) {
                html += '<div class="field-sep"></div>';
                available.forEach((id) => {
                    const name = displayProfileName(profileLibrary.items[id]);
                    html += '<button type="button" data-field-act="link-profile" data-link-id="' + escapeHtml(id) + '">Link ' + escapeHtml(name) + '</button>';
                });
            } else if (otherProfiles(source).length) {
                html += '<div class="field-sep"></div><button type="button" disabled>All profiles linked</button>';
            }
            if (linked.length) {
                html += '<div class="field-sep"></div>';
                linked.forEach((id) => {
                    const name = displayProfileName(profileLibrary.items[id]);
                    html += '<button type="button" data-field-act="open-profile" data-link-id="' + escapeHtml(id) + '">Open ' + escapeHtml(name) + '</button>';
                    html += '<button type="button" class="field-danger" data-field-act="unlink-profile" data-link-id="' + escapeHtml(id) + '">Unlink ' + escapeHtml(name) + '</button>';
                });
            }
            return html;
        }

        function openHubMenu(event) {
            const menu = document.getElementById('fieldMenu');
            const stage = document.getElementById('mapStage');
            if (!menu || !stage) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeExportMenu();
            mapMenuAnchor = null;
            menu.innerHTML =
                profileMenuButtons() +
                '<div class="field-sep"></div>' +
                '<button type="button" data-field-act="upload-photo">Upload image</button>' +
                '<button type="button" data-field-act="toolkit">OSINT toolkit</button>' +
                '<div class="field-sep"></div>' +
                (hiddenFields.size
                    ? '<button type="button" data-field-act="restore">Show all fields</button>'
                    : '<button type="button" disabled>No hidden fields</button>') +
                '<button type="button" data-field-act="recenter">Recenter map</button>';
            menu.dataset.field = '';
            menu.dataset.peer = '';
            menu.dataset.actLock = '';
            menu.hidden = false;
            placeFieldMenu(event);
        }

        function openPeerMenu(event, peerId) {
            const menu = document.getElementById('fieldMenu');
            if (!menu || !peerId) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeExportMenu();
            const name = displayProfileName(profileLibrary && profileLibrary.items[peerId]);
            const canDelete = !!(profileLibrary && profileLibrary.order && profileLibrary.order.length > 1);
            menu.innerHTML =
                '<button type="button" data-field-act="open-profile" data-link-id="' + escapeHtml(peerId) + '">Open ' + escapeHtml(name) + '</button>' +
                '<button type="button" data-field-act="upload-photo" data-link-id="' + escapeHtml(peerId) + '">Upload image</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" class="field-danger" data-field-act="unlink-profile" data-link-id="' + escapeHtml(peerId) + '">Unlink</button>' +
                '<button type="button" class="field-danger" data-field-act="delete-profile" data-link-id="' + escapeHtml(peerId) + '"' + (canDelete ? '' : ' disabled') + '>Delete</button>';
            menu.dataset.field = '';
            menu.dataset.peer = peerId;
            menu.dataset.actLock = '';
            menu.hidden = false;
            placeFieldMenu(event);
        }

        function placeSearchMenu(node) {
            const menu = document.getElementById('searchMenu');
            if (!menu || menu.hidden) return;
            if (isPhone()) {
                menu.style.left = '';
                menu.style.top = '';
                return;
            }
            const stage = document.getElementById('mapStage');
            if (!node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.right - mapRect.left - 240, mapRect.width - 252);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function openSearchMenu(fieldId) {
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            document.querySelectorAll('.node.search-open').forEach((item) => item.classList.remove('search-open'));
            if (typeof openSearchDesk === 'function') openSearchDesk(fieldId);
        }

        function srcToBlob(src) {
            return fetch(src).then(function (response) { return response.blob(); });
        }

        function copyImageSource(src) {
            if (!src) return Promise.resolve();
            return srcToBlob(src).then(function (blob) {
                if (navigator.clipboard && window.ClipboardItem) {
                    return navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
                }
            }).catch(function () {});
        }

        function openLead(href, value, mode) {
            if (href === 'orbint:intel') {
                if (window.OrbINTCase && typeof OrbINTCase.openDomainIntel === 'function') {
                    OrbINTCase.openDomainIntel(value);
                }
                return;
            }
            if (mode === 'image') {
                const media = mediaSource('image');
                copyImageSource(media && media.src).finally(function () {
                    window.open(href, '_blank', 'noopener,noreferrer');
                });
                return;
            }
            if (value) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(value).catch(function () {});
                }
            }
            window.open(href, '_blank', 'noopener,noreferrer');
        }

