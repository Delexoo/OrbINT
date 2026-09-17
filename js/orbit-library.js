/* OrbINT casebook / profile library */

        function renderProfileRail() {
            const list = document.getElementById('profileRailList');
            if (!list || !profileLibrary) return;
            const rows = profileLibrary.order.map((id) => {
                const entry = profileLibrary.items[id] || { id: id };
                const live = id === profileLibrary.activeId;
                const facts = live ? profile.facts : entry.facts;
                const name = displayProfileName(live ? Object.assign({}, entry, { facts: facts, id: id }) : entry);
                const face = compactFaceFrom(facts);
                const linked = linkedProfileIds(id).length;
                return {
                    id: id,
                    live: live,
                    name: name,
                    face: face,
                    linked: linked,
                    stamp: id + (live ? '*' : '') + ':' + name + ':' + (face ? 'I' + faceStamp(face) : profileLetter(name)) + ':L' + linked
                };
            });
            const stamp = rows.map((row) => row.stamp).join('|');
            if (list.dataset.stamp === stamp) return;
            list.dataset.stamp = stamp;
            list.innerHTML = rows.map((row) => {
                const active = row.live ? ' active' : '';
                const mark = row.face
                    ? '<img alt="" data-rail-face="' + escapeHtml(row.id) + '">'
                    : '<span>' + escapeHtml(profileLetter(row.name)) + '</span>';
                const label = row.linked ? row.name + ' · linked' : row.name;
                return '<button type="button" class="profile-rail-item' + active + '" data-profile="' + escapeHtml(row.id) + '" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '" aria-current="' + (row.live ? 'true' : 'false') + '"><span class="profile-rail-face">' + mark + '</span>' + (row.linked ? PROFILE_LINK_BADGE : '') + '</button>';
            }).join('');
            rows.forEach((row) => {
                if (!row.face) return;
                const img = list.querySelector('img[data-rail-face="' + row.id + '"]');
                if (img) img.src = row.face;
            });
        }

        function closeProfileMenu() {
            const menu = document.getElementById('profileMenu');
            if (menu) menu.hidden = true;
        }

        function closeProfilePrompt() {
            hideSheet(document.getElementById('profilePrompt'));
            profilePromptState = null;
        }

        function openProfilePrompt(mode, id) {
            closeProfileMenu();
            const sheet = document.getElementById('profilePrompt');
            const title = document.getElementById('profilePromptTitle');
            const lead = document.getElementById('profilePromptLead');
            const input = document.getElementById('profilePromptInput');
            const go = document.getElementById('profilePromptGo');
            if (!sheet || !title || !lead || !go) return;
            profilePromptState = { mode: mode, id: id || (profileLibrary && profileLibrary.activeId) };
            const entry = profileLibrary && profileLibrary.items[profilePromptState.id];
            const currentName = displayProfileName(entry);
            input.hidden = mode === 'delete';
            go.className = mode === 'delete' ? 'confirm-go' : 'confirm-ok';
            if (mode === 'create') {
                title.textContent = 'New profile';
                lead.textContent = 'Give this case a name. Leave it blank to keep it untitled.';
                go.textContent = 'Create';
                input.value = '';
                input.placeholder = 'Untitled';
            } else if (mode === 'rename') {
                title.textContent = 'Rename profile';
                lead.textContent = 'This name is for the rail. It does not change the Name field.';
                go.textContent = 'Rename';
                input.value = currentName === 'Untitled' || currentName === 'Anonymous' ? '' : currentName;
                input.placeholder = currentName || 'Untitled';
            } else {
                title.textContent = 'Delete profile?';
                lead.textContent = '"' + currentName + '" will be removed from this browser. This cannot be undone.';
                go.textContent = 'Delete';
                input.value = '';
            }
            showSheet(sheet);
            if (!input.hidden) {
                requestAnimationFrame(function () {
                    input.focus();
                    input.select();
                });
            } else {
                const cancel = document.getElementById('profilePromptCancel');
                if (cancel) cancel.focus();
            }
        }

        function submitProfilePrompt() {
            if (!profilePromptState) return;
            const mode = profilePromptState.mode;
            const id = profilePromptState.id;
            const input = document.getElementById('profilePromptInput');
            const value = input ? input.value : '';
            closeProfilePrompt();
            if (mode === 'create') createProfile(value);
            else if (mode === 'rename') renameProfile(id, value);
            else if (mode === 'delete') deleteProfile(id);
        }

        function openProfileMenu(event, id) {
            const menu = document.getElementById('profileMenu');
            if (!menu || !profileLibrary) return;
            closeFieldMenu();
            closeExportMenu();
            const only = profileLibrary.order.length < 2;
            menu.innerHTML =
                '<button type="button" data-profile-act="open">Open</button>' +
                '<button type="button" data-profile-act="rename">Rename</button>' +
                '<button type="button" data-profile-act="duplicate">Duplicate</button>' +
                '<button type="button" data-profile-act="download">Download</button>' +
                '<button type="button" class="field-danger" data-profile-act="delete"' + (only ? ' disabled' : '') + '>Delete</button>';
            menu.dataset.profile = id;
            menu.hidden = false;
            const left = event.clientX;
            const top = event.clientY;
            const w = menu.offsetWidth || 168;
            const h = menu.offsetHeight || 180;
            menu.style.left = Math.max(8, Math.min(left, window.innerWidth - w - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(top, window.innerHeight - h - 8)) + 'px';
        }

        function switchProfile(id, opts) {
            if (!profileLibrary || !id || id === profileLibrary.activeId) return;
            if (!profileLibrary.items[id]) return;
            flushLibrarySync();
            profileLibrary.activeId = id;
            saveProfileIndex();
            applyWorkspace(profileLibrary.items[id], opts);
            renderProfileRail();
        }

        function openLinkedProfile(id, fromEl) {
            if (!profileLibrary || !id || id === profileLibrary.activeId) return;
            if (!profileLibrary.items[id]) return;
            if (reduceMotionOn()) {
                switchProfile(id);
                return;
            }
            const source = fromEl && fromEl.getBoundingClientRect
                ? fromEl
                : document.querySelector('.peer-hub[data-peer="' + id + '"]');
            if (!source || !mapCanvas || !hub) {
                switchProfile(id);
                return;
            }
            if (typeof isPhone === 'function' && isPhone() && profilePanel && profilePanel.classList.contains('open')) {
                if (profileFlyLock) return;
                profileFlyLock = true;
                setPanelOpen(false);
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        profileFlyLock = false;
                        openLinkedProfile(id, document.querySelector('.peer-hub[data-peer="' + id + '"]') || source);
                    });
                });
                return;
            }
            if (profileFlyLock) return;
            profileFlyLock = true;
            const canvasRect = mapCanvas.getBoundingClientRect();
            const peerRect = source.getBoundingClientRect();
            const hubRect = hub.getBoundingClientRect();
            const fly = source.cloneNode(true);
            fly.classList.add('peer-hub-fly');
            fly.removeAttribute('data-peer');
            fly.setAttribute('aria-hidden', 'true');
            fly.tabIndex = -1;
            fly.style.left = (peerRect.left - canvasRect.left + peerRect.width / 2) + 'px';
            fly.style.top = (peerRect.top - canvasRect.top + peerRect.height / 2) + 'px';
            fly.style.width = peerRect.width + 'px';
            fly.style.height = peerRect.height + 'px';
            fly.style.transform = 'translate(-50%, -50%)';
            mapCanvas.appendChild(fly);
            if (mapStage) mapStage.classList.add('profile-fly');
            const nameEl = fly.querySelector('.peer-hub-name');
            const letterEl = fly.querySelector('.peer-hub-letter');
            const hubTitle = document.getElementById('hubTitle');
            const destType = hubTitle ? getComputedStyle(hubTitle) : null;
            const destWeight = destType && destType.fontWeight ? destType.fontWeight : '700';
            const destTrack = destType && destType.letterSpacing ? destType.letterSpacing : '-0.04em';
            const destLeading = destType && destType.lineHeight ? destType.lineHeight : '1.15';
            const destFamily = destType && destType.fontFamily ? destType.fontFamily : '';
            const destFont = destType ? destType.fontSize : '';
            if (nameEl) {
                const startName = getComputedStyle(nameEl);
                nameEl.style.fontSize = startName.fontSize;
                nameEl.style.fontWeight = destWeight;
                nameEl.style.letterSpacing = destTrack;
                nameEl.style.lineHeight = destLeading;
                if (destFamily) nameEl.style.fontFamily = destFamily;
                nameEl.style.width = '78%';
            }
            if (letterEl) {
                letterEl.style.fontWeight = destWeight;
                if (destFamily) letterEl.style.fontFamily = destFamily;
            }
            void fly.offsetWidth;
            requestAnimationFrame(function () {
                fly.style.left = (hubRect.left - canvasRect.left + hubRect.width / 2) + 'px';
                fly.style.top = (hubRect.top - canvasRect.top + hubRect.height / 2) + 'px';
                fly.style.width = hubRect.width + 'px';
                fly.style.height = hubRect.height + 'px';
                if (nameEl && destFont) {
                    nameEl.style.fontSize = destFont;
                    nameEl.style.fontWeight = destWeight;
                    nameEl.style.letterSpacing = destTrack;
                    nameEl.style.lineHeight = destLeading;
                    nameEl.style.width = '72%';
                }
                if (letterEl && destFont) {
                    letterEl.style.fontSize = destFont;
                    letterEl.style.fontWeight = destWeight;
                }
            });
            let landed = false;
            const finish = function () {
                if (landed) return;
                landed = true;
                switchProfile(id, { keepCamera: true, fromHub: true });
                if (typeof kickOrbit === 'function') kickOrbit();
                if (mapStage) {
                    mapStage.classList.remove('profile-fly');
                    mapStage.classList.add('profile-enter');
                }
                requestAnimationFrame(function () {
                    if (fly.parentNode) fly.parentNode.removeChild(fly);
                    profileFlyLock = false;
                });
                clearTimeout(profileFlyTimer);
                profileFlyTimer = setTimeout(function () {
                    if (mapStage) mapStage.classList.remove('profile-enter');
                }, 720);
            };
            fly.addEventListener('transitionend', function done(event) {
                if (event.target !== fly) return;
                if (event.propertyName && event.propertyName !== 'left' && event.propertyName !== 'width' && event.propertyName !== 'top' && event.propertyName !== 'height') return;
                fly.removeEventListener('transitionend', done);
                finish();
            });
            setTimeout(finish, 700);
        }

        function createProfile(title) {
            if (!profileLibrary) return;
            flushLibrarySync();
            const id = newProfileId();
            const name = String(title || '').trim().slice(0, 48);
            const entry = emptyLibraryEntry(id, name, !!name);
            profileLibrary.items[id] = entry;
            profileLibrary.order.push(id);
            profileLibrary.activeId = id;
            saveProfileEntry(entry);
            saveProfileIndex();
            applyWorkspace(entry);
            renderProfileRail();
        }

        function renameProfile(id, title) {
            if (!profileLibrary || !id) return;
            const entry = profileLibrary.items[id];
            const name = String(title || '').trim().slice(0, 48);
            if (!entry || !name) return;
            if (id === profileLibrary.activeId) flushLibrarySync();
            entry.title = name;
            entry.named = true;
            entry.updatedAt = new Date().toISOString();
            saveProfileEntry(entry);
            saveProfileIndex();
            renderProfileRail();
        }

        function duplicateProfile(id) {
            if (!profileLibrary || !id) return;
            if (id === profileLibrary.activeId) flushLibrarySync();
            const source = profileLibrary.items[id];
            if (!source) return;
            const copy = JSON.parse(JSON.stringify(source));
            copy.id = newProfileId();
            copy.createdAt = new Date().toISOString();
            copy.updatedAt = copy.createdAt;
            const base = displayProfileName(source);
            copy.title = /copy$/i.test(base) ? base : (base + ' copy');
            copy.named = true;
            copy.peerHomes = {};
            profileLibrary.items[copy.id] = copy;
            const at = profileLibrary.order.indexOf(id);
            profileLibrary.order.splice(at < 0 ? profileLibrary.order.length : at + 1, 0, copy.id);
            profileLibrary.activeId = copy.id;
            saveProfileEntry(copy);
            saveProfileIndex();
            applyWorkspace(copy);
            renderProfileRail();
        }

        function deleteProfile(id) {
            if (!profileLibrary || !id || profileLibrary.order.length < 2) return;
            const at = profileLibrary.order.indexOf(id);
            if (at < 0) return;
            const wasActive = profileLibrary.activeId === id;
            profileLibrary.order.splice(at, 1);
            delete profileLibrary.items[id];
            deleteProfileEntry(id);
            pruneProfileLinks(id);
            const layer = document.getElementById('peerHubs');
            if (layer) delete layer.dataset.stamp;
            peerBodies = peerBodies.filter((body) => body && body.id !== id);
            if (wasActive) {
                const nextId = profileLibrary.order[Math.max(0, at - 1)] || profileLibrary.order[0];
                profileLibrary.activeId = nextId;
                saveProfileIndex();
                applyWorkspace(profileLibrary.items[nextId]);
            } else {
                saveProfileIndex();
                renderPeerHubs();
                if (typeof positionPeerHubs === 'function') positionPeerHubs();
            }
            renderProfileRail();
        }

        function exportProfileBundle(id) {
            if (!profileLibrary) return {};
            if (id === profileLibrary.activeId) flushLibrarySync();
            const entry = profileLibrary.items[id];
            const bundle = entry ? JSON.parse(JSON.stringify(entry)) : {};
            if (id === profileLibrary.activeId && profile && profile.facts) {
                bundle.facts = bundle.facts || {};
                bundle.facts.image = JSON.parse(JSON.stringify(profile.facts.image || []));
            }
            const live = (id === profileLibrary.activeId && Array.isArray(profile.nulls))
                ? profile.nulls.filter(Boolean)
                : missingFieldIds(bundle);
            return stampMissingFields(bundle, live);
        }

        function downloadProfile(id) {
            const bundle = exportProfileBundle(id);
            const name = displayProfileName(bundle).replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            Promise.resolve(attachImagesToBundle(bundle, id)).then((full) => {
                downloadBlob('orbint-' + (name || 'profile') + '.json', 'application/json', JSON.stringify(full, null, 2));
            });
        }

        function coerceImportedEntry(raw, fallbackTitle) {
            if (!raw || typeof raw !== 'object') return null;
            const source = raw.facts && typeof raw.facts === 'object' ? raw : (raw.profile && raw.profile.facts ? raw.profile : null);
            if (!source || typeof source.facts !== 'object') return null;
            const id = newProfileId();
            const title = String(raw.title || source.title || fallbackTitle || '').trim().slice(0, 48);
            const named = !!(raw.named || raw.title || source.title);
            const missing = (missingFieldIds(source).length ? missingFieldIds(source) : missingFieldIds(raw)).slice();
            return {
                id: id,
                kind: 'orbint-profile',
                title: title,
                named: named && !!title,
                createdAt: raw.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analysis: source.analysis || raw.analysis || '',
                facts: source.facts,
                nulls: missing,
                missing: missing.slice(),
                added: Array.isArray(raw.added) ? raw.added : (Array.isArray(source.added) ? source.added : []),
                labels: (raw.labels && typeof raw.labels === 'object' && !Array.isArray(raw.labels)) ? raw.labels
                    : ((source.labels && typeof source.labels === 'object' && !Array.isArray(source.labels)) ? source.labels : {}),
                hidden: Array.isArray(raw.hidden) ? raw.hidden : (Array.isArray(source.hidden) ? source.hidden : []),
                layout: raw.layout || source.layout || null,
                peerHomes: normalizePeerHomes(raw.peerHomes || source.peerHomes),
                investigation: raw.investigation || source.investigation || null,
                case: Object.assign({}, emptyCaseMeta(), raw.case || source.case || {}),
                audit: Array.isArray(raw.audit) ? raw.audit : (Array.isArray(source.audit) ? source.audit : [])
            };
        }

        function importedEntriesFrom(data, filename) {
            const fallback = String(filename || '').replace(/\.json$/i, '').replace(/^orbint-/, '').replace(/[-_]+/g, ' ').trim();
            if (Array.isArray(data)) {
                return data.map((item) => coerceImportedEntry(item, fallback)).filter(Boolean);
            }
            if (!data || typeof data !== 'object') return [];
            if (Array.isArray(data.profiles)) {
                return data.profiles.map((item) => coerceImportedEntry(item, fallback)).filter(Boolean);
            }
            if (data.items && Array.isArray(data.order)) {
                return data.order.map((id) => coerceImportedEntry(data.items[id], fallback)).filter(Boolean);
            }
            const one = coerceImportedEntry(data, fallback);
            return one ? [one] : [];
        }

        function importProfileEntries(entries) {
            if (!profileLibrary || !entries || !entries.length) return;
            flushLibrarySync();
            let lastId = '';
            entries.forEach((entry) => {
                profileLibrary.items[entry.id] = entry;
                profileLibrary.order.push(entry.id);
                saveProfileEntry(entry);
                lastId = entry.id;
            });
            if (!lastId) return;
            profileLibrary.activeId = lastId;
            saveProfileIndex();
            applyWorkspace(profileLibrary.items[lastId]);
            renderProfileRail();
        }

        function isJsonProfileFile(file) {
            return !!(file && /\.json$/i.test(String(file.name || '')));
        }

        function uploadProfileFiles(fileList) {
            const files = Array.from(fileList || []).filter(isJsonProfileFile);
            if (!files.length) return;
            const jobs = files.map((file) => file.text().then((text) => {
                let data = null;
                try { data = JSON.parse(text); } catch (error) { return []; }
                return importedEntriesFrom(data, file.name);
            }));
            Promise.all(jobs).then((groups) => {
                const entries = groups.reduce((all, group) => all.concat(group), []);
                importProfileEntries(entries);
            }).catch(function () {});
        }

        function pickProfileUpload() {
            const input = document.getElementById('profileFile');
            if (!input) return;
            input.value = '';
            input.click();
        }

        function initProfileLibrary() {
            const index = readStoredJson(PROFILE_INDEX_KEY, null);
            profileLibrary = { activeId: '', order: [], items: {}, links: [] };
            if (index && Array.isArray(index.order) && index.order.length) {
                index.order.forEach((id) => {
                    if (!id) return;
                    const entry = loadProfileEntry(id);
                    if (!entry) return;
                    profileLibrary.items[id] = entry;
                    profileLibrary.order.push(id);
                });
                profileLibrary.activeId = profileLibrary.items[index.activeId] ? index.activeId : profileLibrary.order[0];
                profileLibrary.links = normalizeProfileLinks(index.links);
            }
            const activeEntry = profileLibrary.items[profileLibrary.activeId];
            if (activeEntry && window.OrbINTCase && typeof OrbINTCase.load === 'function') {
                OrbINTCase.load(activeEntry.investigation || null);
            }
            if (!profileLibrary.order.length) {
                const id = newProfileId();
                const seed = captureWorkspace(id, emptyLibraryEntry(id, factNameFrom(profile.facts), false));
                profileLibrary.items[id] = seed;
                profileLibrary.order = [id];
                profileLibrary.activeId = id;
                saveProfileEntry(seed);
                saveProfileIndex();
                renderProfileRail();
                return;
            }
            renderProfileRail();
            hydrateLibraryImages().then(function () {
                if (!profileLibrary || !profileLibrary.activeId) return;
                const live = captureWorkspace(profileLibrary.activeId, profileLibrary.items[profileLibrary.activeId]);
                profileLibrary.items[profileLibrary.activeId] = live;
                saveProfileEntry(live);
                saveProfileIndex();
                renderProfileRail();
            });
        }

        function updateHistoryButtons() {
            const undo = document.getElementById('dockUndo');
            const redo = document.getElementById('dockRedo');
            const page = document.body.getAttribute('data-page');
            if ((page === 'whiteboard' || page === 'timeline') && window.OrbINTCase && typeof OrbINTCase.syncBoardHistory === 'function') {
                OrbINTCase.syncBoardHistory();
                return;
            }
            if (undo) undo.disabled = history.past.length < 2;
            if (redo) redo.disabled = !history.future.length;
        }

        function pushHistory() {
            if (history.applying) return;
            const snap = snapshotProfile();
            const last = history.past[history.past.length - 1];
            if (snapshotsEqual(last, snap)) {
                updateHistoryButtons();
                return;
            }
            history.past.push(snap);
            if (history.past.length > 40) history.past.splice(0, history.past.length - 40);
            history.future = [];
            updateHistoryButtons();
        }

        function recordHistory(immediate) {
            if (history.applying) return;
            clearTimeout(history.timer);
            if (immediate) {
                history.timer = 0;
                pushHistory();
                return;
            }
            history.timer = setTimeout(pushHistory, 400);
        }

        function flushHistory() {
            clearTimeout(history.timer);
            history.timer = 0;
            pushHistory();
        }

        function applySnapshot(snap) {
            if (!snap) return;
            history.applying = true;
            profile.facts = JSON.parse(JSON.stringify(snap.facts || emptyFacts()));
            profile.analysis = snap.analysis || '';
            profile.nulls = Array.isArray(snap.nulls) ? snap.nulls.slice() : [];
            saveProfile();
            activeField = null;
            renderProfile();
            renderNodes();
            updateHubProgress();
            history.applying = false;
            updateHistoryButtons();
            if (typeof hydrateActiveImages === 'function') hydrateActiveImages();
        }

        function undoNow() {
            const page = document.body.getAttribute('data-page');
            if (page === 'whiteboard' && window.OrbINTCase && typeof OrbINTCase.undoBoard === 'function') {
                OrbINTCase.undoBoard();
                return;
            }
            if (page === 'timeline' && window.OrbINTCase && typeof OrbINTCase.undoTimeline === 'function') {
                OrbINTCase.undoTimeline();
                return;
            }
            undoCase();
        }

        function redoNow() {
            const page = document.body.getAttribute('data-page');
            if (page === 'whiteboard' && window.OrbINTCase && typeof OrbINTCase.redoBoard === 'function') {
                OrbINTCase.redoBoard();
                return;
            }
            if (page === 'timeline' && window.OrbINTCase && typeof OrbINTCase.redoTimeline === 'function') {
                OrbINTCase.redoTimeline();
                return;
            }
            redoCase();
        }

        function undoCase() {
            flushHistory();
            if (history.past.length < 2) return;
            history.future.push(history.past.pop());
            applySnapshot(history.past[history.past.length - 1]);
        }

        function redoCase() {
            flushHistory();
            if (!history.future.length) return;
            const next = history.future.pop();
            history.past.push(JSON.parse(JSON.stringify(next)));
            applySnapshot(next);
        }

        function firstValue(id) {
            const fact = latestFact(id);
            return (fact && fact.value) || '';
        }

        function fieldById(id) {
            return FIELDS.find((field) => field.id === id);
        }

        function setPanelOpen(open) {
            const next = !!open;
            profilePanel.classList.toggle('open', next);
            document.body.classList.toggle('panel-open', next);
            const phone = isPhone();
            backdrop.hidden = !next || !drawerQuery.matches || phone;
            backdrop.classList.toggle('visible', next && drawerQuery.matches && !phone);
            const toggle = document.getElementById('profileToggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
                toggle.classList.toggle('is-on', next);
            }
            const dockPort = document.getElementById('dockPortfolio');
            if (dockPort) dockPort.setAttribute('aria-expanded', next ? 'true' : 'false');
            if (phone && !next && typeof kickOrbit === 'function') kickOrbit();
            if (window.OrbINTCase && typeof OrbINTCase.renderPageSwitch === 'function') {
                OrbINTCase.renderPageSwitch({ instant: true });
            }
        }

        function latestFact(id) {
            const values = ((profile.facts && profile.facts[id]) || []).filter((item) => item && String(item.value || '').trim());
            return values[values.length - 1] || null;
        }

        function factExtra(extra) {
            if (!extra) return null;
            const out = {};
            Object.keys(extra).forEach((key) => {
                if (key === 'quiet' || key === 'slot') return;
                out[key] = extra[key];
            });
            return Object.keys(out).length ? out : null;
        }

        function addFact(id, value, extra) {
            const clean = String(value || '').trim();
            if (!clean) return;
            const meta = factExtra(extra);
            const quiet = !!(extra && extra.quiet);
            profile.facts[id] = profile.facts[id] || [];
            const same = profile.facts[id].some((item) => {
                if (item.value.toLowerCase() !== clean.toLowerCase()) return false;
                if (meta && meta.platform) return item.platform === meta.platform;
                return true;
            });
            if (same) {
                if (meta) {
                    const existing = profile.facts[id].find((item) => item.value.toLowerCase() === clean.toLowerCase());
                    if (existing) Object.keys(meta).forEach((key) => { existing[key] = meta[key]; });
                    if (!quiet) {
                        saveProfile();
                        renderProfile();
                        renderNodes();
                        recordHistory(true);
                    }
                }
                return;
            }
            const fact = { value: clean, addedAt: new Date().toISOString() };
            if (meta) Object.keys(meta).forEach((key) => { fact[key] = meta[key]; });
            if (isNullField(id)) setFieldNull(id, false, true);
            profile.facts[id].push(fact);
            if (quiet) return;
            saveProfile();
            renderProfile();
            renderNodes();
            recordHistory(true);
        }

        function addFactSlot(baseId, value, extra) {
            const clean = String(value || '').trim();
            if (!clean) return;
            extra = extra || {};
            if (baseId === 'notes') {
                const cur = latestFact('notes');
                const prev = cur && String(cur.value || '').trim();
                if (prev && prev.indexOf(clean) >= 0) return;
                if (prev) {
                    cur.value = prev + '\n' + clean;
                    if (!extra.quiet) {
                        saveProfile();
                        renderProfile();
                        renderNodes();
                        recordHistory(true);
                    }
                    return;
                }
                addFact('notes', clean, extra);
                return;
            }
            let base = baseId;
            if (extra.platform && typeof fieldById === 'function' && fieldById(extra.platform)) {
                base = extra.platform;
            }
            const ids = [];
            function pushId(id) {
                if (!id || ids.indexOf(id) >= 0) return;
                if (typeof fieldById === 'function' && !fieldById(id)) return;
                ids.push(id);
            }
            pushId(base);
            if (base === 'email') pushId('email2');
            if (base === 'phone') pushId('phone2');
            if (typeof FIELDS !== 'undefined' && FIELDS && FIELDS.forEach) {
                const root = typeof fieldBase === 'function' ? fieldBase(base) : base;
                FIELDS.forEach((field) => {
                    if (field && fieldBase(field.id) === root) pushId(field.id);
                });
            }
            const lower = clean.toLowerCase();
            for (let i = 0; i < ids.length; i++) {
                const facts = (profile.facts && profile.facts[ids[i]]) || [];
                if (facts.some((item) => item && String(item.value || '').toLowerCase() === lower)) {
                    addFact(ids[i], clean, extra);
                    return;
                }
            }
            for (let i = 0; i < ids.length; i++) {
                const cur = latestFact(ids[i]);
                if (cur && String(cur.value || '').trim()) continue;
                if (typeof showField === 'function') showField(ids[i]);
                addFact(ids[i], clean, extra);
                return;
            }
            if (ids.length >= 30) {
                addFact(ids[ids.length - 1] || base, clean, extra);
                return;
            }
            let newId = '';
            if (typeof duplicateField === 'function') {
                newId = duplicateField(ids[ids.length - 1] || base, { quiet: extra.quiet });
            }
            if (newId) addFact(newId, clean, extra);
            else addFact(base, clean, extra);
        }

        function flushFacts() {
            saveProfile();
            if (typeof createNodes === 'function') createNodes();
            if (typeof applyHiddenFields === 'function') applyHiddenFields();
            if (typeof decorateNodes === 'function') decorateNodes();
            renderProfile();
            renderNodes();
            if (typeof updateHubProgress === 'function') updateHubProgress();
            recordHistory(true);
        }

        function extrasFromInput(fieldId, value) {
            const extra = {};
            const base = fieldBase(fieldId);
            if (isPlatformField(fieldId)) {
                const platform = fieldPlatformId(fieldId);
                if (platform) extra.platform = platform;
            } else if (base === 'image' && looksLikeImageSrc(value)) {
                extra.preview = value;
                extra.media = value;
                extra.kind = 'image';
            } else if (base === 'audio' && looksLikeAudioSrc(value)) {
                extra.media = value;
                extra.kind = 'audio';
            }
            return extra;
        }

        function patchFactMeta(id, key, value) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            if (!id || !key) return;
            profile.facts[id] = profile.facts[id] || [];
            let current = profile.facts[id][profile.facts[id].length - 1];
            if (!current) {
                current = { value: '', addedAt: new Date().toISOString() };
                profile.facts[id].push(current);
            }
            if (key === 'capturedAt') {
                if (value) current.capturedAt = String(value).trim();
                else delete current.capturedAt;
            } else {
                if (value) current[key] = String(value).trim();
                else delete current[key];
                if (!current.capturedAt) current.capturedAt = new Date().toISOString();
            }
            saveProfile();
        }

        function writeLatestFact(id, value, extra) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            const clean = String(value || '').trim();
            profile.facts[id] = profile.facts[id] || [];
            if (!clean) {
                if (!profile.facts[id].length) {
                    updateHubProgress();
                    return;
                }
                const current = profile.facts[id][profile.facts[id].length - 1];
                const keepPlatform = isPlatformField(id) && current && current.platform && platformById(current.platform);
                if (keepPlatform) {
                    current.value = '';
                    if (extra && extra.platform && platformById(extra.platform)) current.platform = extra.platform;
                } else {
                    profile.facts[id].pop();
                }
                saveProfile();
                refreshProfileChrome();
                syncLinkedField(id, '');
                updateHubProgress();
                recordHistory(false);
                if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
                return;
            }
            if (isNullField(id)) setFieldNull(id, false, true);
            let current = profile.facts[id][profile.facts[id].length - 1];
            const prevValue = current ? String(current.value || '') : '';
            if (!current) {
                current = { value: clean, addedAt: new Date().toISOString() };
                profile.facts[id].push(current);
            } else {
                current.value = clean;
            }
            if (extra) Object.keys(extra).forEach((key) => { current[key] = extra[key]; });
            if (isPlatformField(id) && !current.platform) {
                const platform = fieldPlatformId(id);
                if (platform) current.platform = platform;
            }
            if (!current.capturedAt) current.capturedAt = new Date().toISOString();
            if (investigatorModeOn() && !current.method) current.method = 'open-web';
            if (prevValue !== clean) appendCaseAudit('fact', id, String(clean).slice(0, 80));
            saveProfile();
            refreshProfileChrome();
            syncLinkedField(id, clean);
            recordHistory(false);
            if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
        }

        function saveInputAsIs(input) {
            if (!input || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            const value = fieldBase(fieldId) === 'timezone'
                ? resolveTimezoneValue(input.value)
                : (fieldBase(fieldId) === 'countrycode' ? (resolveCountryCodeValue(input.value) || input.value) : input.value);
            writeLatestFact(fieldId, value, extrasFromInput(fieldId, value));
        }

        function playtestPick(list) {
            return list[Math.floor(Math.random() * list.length)];
        }

        function playtestInt(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        }

        function playtestHex(len) {
            let out = '';
            for (let i = 0; i < len; i++) out += '0123456789abcdef'.charAt(Math.floor(Math.random() * 16));
            return out;
        }

        function playtestDigits(len) {
            let out = '';
            for (let i = 0; i < len; i++) out += String(playtestInt(0, 9));
            return out;
        }

        function playtestMakePersona() {
            const first = playtestPick(['Jordan', 'Riley', 'Casey', 'Avery', 'Quinn', 'Morgan', 'Reese', 'Skyler', 'Harper', 'Cameron', 'Drew', 'Emerson']);
            const last = playtestPick(['Hale', 'Voss', 'Mercer', 'Lang', 'Whitaker', 'Brooks', 'Keene', 'Solis', 'Hart', 'Nguyen', 'Patel', 'Okada']);
            const place = playtestPick([
                { zone: 'America/Los_Angeles', city: 'Portland', region: 'Oregon', postal: '97214', country: 'United States', area: '503', street: '1842 SE Division St', neighborhood: 'Hawthorne', geo: '45.5047, -122.6540', wifi: 'CedarHaus5G', airport: 'PDX', hotel: 'Ace Hotel Portland', landmark: 'Powell\'s City of Books' },
                { zone: 'America/New_York', city: 'Brooklyn', region: 'New York', postal: '11215', country: 'United States', area: '347', street: '418 7th Ave', neighborhood: 'Park Slope', geo: '40.6602, -73.9982', wifi: 'SlopeFiber', airport: 'JFK', hotel: 'The William Vale', landmark: 'Prospect Park' },
                { zone: 'America/Chicago', city: 'Austin', region: 'Texas', postal: '78704', country: 'United States', area: '512', street: '2211 S Lamar Blvd', neighborhood: 'South Lamar', geo: '30.2500, -97.7649', wifi: 'LamarGuest', airport: 'AUS', hotel: 'Hotel San Jose', landmark: 'Barton Springs' },
                { zone: 'America/Denver', city: 'Denver', region: 'Colorado', postal: '80205', country: 'United States', area: '720', street: '3227 Larimer St', neighborhood: 'RiNo', geo: '39.7611, -104.9817', wifi: 'RiNoNet', airport: 'DEN', hotel: 'The Maven', landmark: 'Union Station' }
            ]);
            const handle = (first + last).toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) + String(playtestInt(2, 88));
            const company = playtestPick(['Northline Logistics', 'Harbor & Pine', 'Kitewell Analytics', 'Redcedar Studio', 'Lowbridge Press']);
            const n = playtestInt(100, 899);
            return {
                first: first,
                last: last,
                fullName: first + ' ' + last,
                handle: handle,
                email: handle + '@gmail.com',
                emailAlt: first.toLowerCase() + '.' + last.toLowerCase() + '@outlook.com',
                phone: place.area + playtestDigits(7),
                phoneAlt: place.area + playtestDigits(7),
                password: playtestPick(['Sunset', 'Cedar', 'Harbor', 'Maple']) + playtestInt(10, 99) + '!',
                passwordAlt: playtestPick(['River', 'Night', 'Quartz']) + playtestInt(10, 99) + '#',
                company: company,
                title: playtestPick(['Analyst', 'Coordinator', 'Designer', 'Operator', 'Producer']),
                industry: playtestPick(['Logistics', 'Media', 'Software', 'Retail', 'Transport']),
                domain: handle + '.net',
                site: 'https://' + handle + '.net',
                image: 'https://picsum.photos/seed/' + handle + '/800/600.jpg',
                audio: 'https://example.com/audio/' + handle + '-voicemail.mp3',
                video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                plate: playtestPick(['AVA', 'NXT', 'RNO', 'SLP']) + playtestInt(100, 999),
                vin: '1HGCM' + playtestInt(100, 999) + playtestPick(['A', 'B', 'C']) + playtestInt(10, 99) + playtestDigits(6),
                crypto: '0x' + playtestHex(40),
                ip: playtestInt(20, 220) + '.' + playtestInt(1, 254) + '.' + playtestInt(1, 254) + '.' + playtestInt(1, 254),
                mac: [0, 1, 2, 3, 4, 5].map(function () { return playtestHex(2); }).join(':'),
                record: place.region.slice(0, 2).toUpperCase() + '-' + playtestInt(2022, 2026) + '-CV-' + playtestInt(1000, 9999),
                notes: 'Public traces cluster around ' + place.city + '. Handle repeats on more than one site.',
                quote: '"Mostly in ' + place.city + ' these days."',
                event: 'Seen near ' + place.neighborhood + ', March 2026',
                date: playtestPick(['3 Mar 2026', '18 Jan 2026', '9 Nov 2025']),
                status: playtestPick(['Open', 'Linked', 'Need corroboration']),
                color: playtestPick(['Matte black', 'Forest green', 'White', 'Navy']),
                vehicle: playtestPick(['2018 Honda Civic', '2016 Toyota RAV4', '2014 Ford F-150']),
                language: playtestPick(['English', 'English, Spanish']),
                occupation: playtestPick(['Freight coordinator', 'Graphic designer', 'Night auditor']),
                bio: place.city + ' / ' + company,
                n: n,
                place: place
            };
        }

        function playtestValueFor(field, persona, extra, usedPlatforms) {
            const id = field.id;
            const base = fieldBase(id);
            const key = (id + ' ' + (field.label || '') + ' ' + (field.placeholder || '')).toLowerCase();
            const place = persona.place;
            if (isPlatformField(id)) {
                const pool = PLATFORMS.filter((item) => !usedPlatforms.has(item.id));
                const platform = playtestPick(pool.length ? pool : PLATFORMS);
                usedPlatforms.add(platform.id);
                extra.platform = platform.id;
                if (base === 'password') return id === 'password' ? persona.password : persona.passwordAlt + String(persona.n);
                return '@' + persona.handle + (id === 'username' ? '' : String(playtestInt(2, 9)));
            }
            if (base === 'phoneos') return playtestPick(['iOS 18', 'iOS 17', 'Android 15', 'Android 14']);
            if (base === 'os') return playtestPick(['Windows 11', 'macOS Sequoia', 'Ubuntu 24.04', 'Windows 10']);
            if (base === 'name') return persona.fullName;
            if (base === 'email' || base === 'email2') return base === 'email2' || id !== 'email' ? persona.emailAlt : persona.email;
            if (base === 'phone' || base === 'phone2' || base === 'fax' || /phone|fax|tel/.test(key)) {
                return formatPhoneNumber(id === 'phone' || base === 'phone' ? persona.phone : persona.phoneAlt);
            }
            if (base === 'address') return place.street + ', ' + place.city + ', ' + place.region + ' ' + place.postal;
            if (base === 'timezone') return place.zone;
            if (base === 'countrycode') return playtestPick(['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'JP']);
            if (base === 'age') return String(playtestInt(19, 68));
            if (base === 'dob') {
                const y = playtestInt(1958, 2005);
                const m = playtestInt(1, 12);
                const d = playtestInt(1, 28);
                return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            }
            if (base === 'image' || base === 'screenshot') {
                extra.preview = persona.image;
                extra.media = persona.image;
                extra.kind = 'image';
                return persona.image;
            }
            if (base === 'audio') {
                extra.media = persona.audio;
                extra.kind = 'audio';
                return persona.audio;
            }
            if (base === 'ip') return persona.ip;
            if (base === 'wifi') return place.wifi;
            if (base === 'plate') return persona.plate;
            if (base === 'record') return persona.record;
            if (base === 'domain' || isUrlFieldSpec(field)) return persona.domain;
            if (base === 'crypto') return persona.crypto;
            if (base === 'notes') return persona.notes;
            if (base === 'company') return persona.company;
            if (base === 'vin') return persona.vin.slice(0, 17);
            if (base === 'city') return place.city;
            if (base === 'country') return place.country;
            if (base === 'postal') return place.postal;
            if (base === 'region') return place.region;
            if (base === 'neighborhood') return place.neighborhood;
            if (base === 'landmark') return place.landmark;
            if (base === 'hotel') return place.hotel;
            if (base === 'airport') return place.airport;
            if (base === 'geo') return place.geo;
            if (base === 'title') return persona.title;
            if (base === 'industry') return persona.industry;
            if (base === 'mac') return persona.mac.toUpperCase();
            if (base === 'video') return persona.video;
            if (base === 'telegram') return '@' + persona.handle;
            if (base === 'discord') return persona.handle + '#' + playtestInt(1000, 9999);
            if (base === 'skype') return persona.handle;
            if (base === 'signal') return formatPhoneNumber(persona.phoneAlt);
            if (base === 'hashtag') return '#' + persona.city.replace(/\s+/g, '');
            if (base === 'mention') return '@' + persona.handle;
            if (base === 'keyword') return persona.fullName + ' ' + place.city;
            if (base === 'quote') return persona.quote;
            if (base === 'event') return persona.event;
            if (base === 'date') return persona.date;
            if (base === 'status') return persona.status;
            if (base === 'source') return 'Public web mention, ' + persona.date;
            if (base === 'color') return persona.color;
            if (base === 'vehicle') return persona.vehicle;
            if (base === 'language') return persona.language;
            if (base === 'occupation') return persona.occupation;
            if (base === 'bio') return persona.bio;
            if (base === 'w3w') return playtestPick(['cedar', 'harbor', 'maple']) + '.' + playtestPick(['quiet', 'rapid', 'solar']) + '.' + playtestPick(['river', 'orbit', 'linen']);
            if (base === 'hash') return playtestHex(64);
            if (base === 'uuid') return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : playtestHex(8) + '-' + playtestHex(4) + '-4' + playtestHex(3) + '-a' + playtestHex(3) + '-' + playtestHex(12);
            if (base === 'imei') return playtestDigits(15);
            if (base === 'barcode') return playtestDigits(12);
            if (base === 'filename') return persona.handle + '_id.jpg';
            if (base === 'useragent') return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
            if (base === 'exif') return 'iPhone 14, ' + place.geo;
            if (base === 'asn') return 'AS' + playtestInt(1000, 64999);
            if (base === 'ein') return playtestInt(10, 99) + '-' + playtestDigits(7);
            if (base === 'pgp') return playtestHex(40).toUpperCase();
            if (base === 'callsign') return 'W' + playtestPick(['A', 'B', 'K', 'N']) + playtestPick(['A', 'E', 'I', 'O']) + playtestPick(['L', 'M', 'R', 'T']);
            if (base === 'aircraft') return 'N' + playtestInt(10000, 99999);
            if (base === 'vessel') return 'MV ' + persona.last;
            if (base === 'brand') return persona.company.split(' ')[0];
            if (/url|website|link/.test(key)) return persona.site;
            if (/user|handle|alias/.test(key)) return '@' + persona.handle;
            if (/city/.test(key)) return place.city;
            if (/email/.test(key)) return persona.emailAlt;
            return persona.fullName + ' — ' + String(field.label || 'note').toLowerCase();
        }

        function playtestFillVisibleFields() {
            const nodes = Array.from(document.querySelectorAll('.node:not(.off)'));
            if (!nodes.length) return;
            const persona = playtestMakePersona();
            const usedPlatforms = new Set();
            nodes.forEach((node) => {
                const id = node.dataset.field;
                const field = fieldById(id);
                if (!field) return;
                const extra = {};
                const value = playtestValueFor(field, persona, extra, usedPlatforms);
                if (!value) return;
                if (isNullField(id)) setFieldNull(id, false, true);
                const fact = { value: value, addedAt: new Date().toISOString() };
                Object.keys(extra).forEach((key) => { fact[key] = extra[key]; });
                if (extra.platform) node.dataset.platform = extra.platform;
                profile.facts[id] = [fact];
                const input = document.getElementById('field-' + id);
                if (input) input.value = fieldBase(id) === 'timezone' ? resolveTimezoneValue(value) : value;
            });
            saveProfile();
            renderProfile();
            renderNodes();
            updateHubProgress();
            if (isPhone() && phoneFieldId) syncPhoneField();
            recordHistory(true);
        }

        function removeFact(id, value) {
            profile.facts[id] = (profile.facts[id] || []).filter((item) => item.value !== value);
            saveProfile();
            renderProfile();
            renderNodes();
            recordHistory(true);
        }

        function isNullField(id) {
            return Array.isArray(profile.nulls) && profile.nulls.indexOf(id) !== -1;
        }

        function setFieldNull(id, on, silent) {
            if (!Array.isArray(profile.nulls)) profile.nulls = [];
            const index = profile.nulls.indexOf(id);
            if (on && index === -1) profile.nulls.push(id);
            if (!on && index !== -1) profile.nulls.splice(index, 1);
            if (!silent) saveProfile();
        }

        function wipeFieldValue(id, keepPlatform) {
            profile.facts[id] = [];
            const input = document.getElementById('field-' + id);
            if (input) input.value = '';
            const node = document.querySelector('.node[data-field="' + id + '"]');
            if (node) {
                if (!keepPlatform) {
                    delete node.dataset.platform;
                    node.classList.remove('has-platform');
                }
                node.classList.remove('has-preview');
            }
            if (mediaStore[id] && mediaStore[id].src && String(mediaStore[id].src).indexOf('blob:') === 0) {
                URL.revokeObjectURL(mediaStore[id].src);
            }
            delete mediaStore[id];
            closeMediaViewer();
        }

        function toggleFieldNull(id) {
            if (isNullField(id)) {
                setFieldNull(id, false);
                const node = document.querySelector('.node[data-field="' + id + '"]');
                if (node) node.classList.remove('null');
                saveProfile();
                renderProfile();
                renderNodes();
                recordHistory(true);
                return;
            }
            wipeFieldValue(id, true);
            setFieldNull(id, true);
            saveProfile();
            renderProfile();
            renderNodes();
            recordHistory(true);
        }

        function clearField(id) {
            wipeFieldValue(id, false);
            setFieldNull(id, false, true);
            saveProfile();
            renderProfile();
            renderNodes();
            recordHistory(true);
        }

        function looksLikeUrl(value) {
            return /^https?:\/\//i.test(String(value || '').trim());
        }

        function looksLikeImageSrc(value) {
            const v = String(value || '').trim();
            return /^(https?:|data:image\/)/i.test(v) || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(v);
        }

        function looksLikeAudioSrc(value) {
            const v = String(value || '').trim();
            return /^(https?:|data:audio\/|blob:)/i.test(v) || /\.(mp3|wav|m4a|aac|ogg|flac|webm)(\?|#|$)/i.test(v);
        }

        function formatPhoneNumber(value) {
            let digits = String(value || '').replace(/\D/g, '');
            let prefix = '';
            if (digits.length > 10 && digits.charAt(0) === '1') {
                prefix = '1 ';
                digits = digits.slice(1);
            }
            digits = digits.slice(0, 10);
            if (!digits) return prefix.trim();
            if (digits.length < 4) return prefix + digits;
            if (digits.length < 7) return prefix + '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
            return prefix + '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
        }

        function applyPhoneMask(input) {
            const digitsBefore = input.value.slice(0, input.selectionStart || 0).replace(/\D/g, '').length;
            const formatted = formatPhoneNumber(input.value);
            if (input.value === formatted) return;
            input.value = formatted;
            let seen = 0;
            let pos = formatted.length;
            if (digitsBefore === 0) {
                pos = 0;
            } else {
                for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted.charAt(i))) {
                        seen += 1;
                        if (seen === digitsBefore) {
                            pos = i + 1;
                            break;
                        }
                    }
                }
            }
            try { input.setSelectionRange(pos, pos); } catch (error) {}
        }

        function drawImageData(img, size, cover, quality, type) {
            const canvas = document.createElement('canvas');
            let w;
            let h;
            if (cover) {
                canvas.width = size;
                canvas.height = size;
                const scale = Math.max(size / img.width, size / img.height);
                w = img.width * scale;
                h = img.height * scale;
                canvas.getContext('2d').drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
            } else {
                const scale = Math.min(1, size / Math.max(img.width, img.height));
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const format = type === 'image/png' ? 'image/png' : 'image/jpeg';
            return format === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
        }

        function imageVersionsFromFile(file) {
            return new Promise((resolve) => {
                const keepAlpha = /image\/(png|webp|gif)/i.test(file.type || '') || /\.(png|webp|gif)$/i.test(file.name || '');
                const type = keepAlpha ? 'image/png' : 'image/jpeg';
                let objectUrl = '';
                try { objectUrl = URL.createObjectURL(file); } catch (error) {}
                const finish = function (versions) {
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                    resolve(versions);
                };
                const fromImage = function (img) {
                    try {
                        finish({
                            preview: drawImageData(img, 420, true, 0.8, type),
                            media: drawImageData(img, keepAlpha ? 1100 : 1400, false, 0.84, type),
                            kind: 'image'
                        });
                    } catch (error) {
                        readFileAsDataURL(file).then(function (data) {
                            finish({ preview: '', media: data, kind: 'image' });
                        }).catch(function () { finish(null); });
                    }
                };
                const img = new Image();
                img.onload = function () { fromImage(img); };
                img.onerror = function () {
                    if (objectUrl) {
                        URL.revokeObjectURL(objectUrl);
                        objectUrl = '';
                    }
                    readFileAsDataURL(file).then(function (data) {
                        const fallback = new Image();
                        fallback.onload = function () { fromImage(fallback); };
                        fallback.onerror = function () { finish({ preview: '', media: data, kind: 'image' }); };
                        fallback.src = data;
                    }).catch(function () { finish(null); });
                };
                if (objectUrl) img.src = objectUrl;
                else img.onerror();
            });
        }

        function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });
        }

        const IMAGE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v8.2l3.4-3.4a1 1 0 0 1 1.4 0L14 15l2.2-2.2a1 1 0 0 1 1.4 0L19 14.2V6H5zm3.2 2.2A1.3 1.3 0 1 1 8.2 11a1.3 1.3 0 0 1 0-2.6z"/></svg>';
        const AUDIO_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V6.3c0-.7.4-1.2 1-1.4l9-3c.8-.3 1.6.3 1.6 1.1V15c0 .6-.4 1-1 1.2l-8 2.4V18c0 2-2 3.5-4.3 3.5S3 20 3 18s2-3.5 4.3-3.5c.6 0 1.1.1 1.7.3z"/></svg>';
        const PIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c3.3 0 6 2.6 6 5.8 0 4.4-6 12.2-6 12.2S6 12.2 6 7.8C6 4.6 8.7 2 12 2zm0 3.2A2.6 2.6 0 1 0 12 10.4 2.6 2.6 0 0 0 12 5.2z"/></svg>';

        function looksLikeIp(value) {
            const v = String(value || '').trim();
            if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) {
                return v.split('.').every((part) => Number(part) <= 255);
            }
            return v.length > 2 && v.indexOf(':') !== -1 && /^[0-9a-f:]+$/i.test(v);
        }

        async function openIpLocation(ip) {
            const clean = String(ip || '').trim();
            if (!looksLikeIp(clean)) return;
            try {
                const response = await fetch('https://ipwho.is/' + encodeURIComponent(clean));
                const data = await response.json();
                if (data && data.success && data.latitude != null && data.longitude != null) {
                    window.open(
                        'https://www.google.com/maps?q=' + encodeURIComponent(data.latitude + ',' + data.longitude),
                        '_blank',
                        'noopener,noreferrer'
                    );
                    return;
                }
            } catch (error) {}
            window.open('https://ipinfo.io/' + encodeURIComponent(clean), '_blank', 'noopener,noreferrer');
        }

        function mediaSource(fieldId) {
            const input = document.getElementById('field-' + fieldId);
            const live = input && input.value.trim();
            const fact = fieldId === 'image' ? (primaryImageFact() || latestFact(fieldId)) : latestFact(fieldId);
            const session = mediaStore[fieldId];
            if (fieldId === 'audio' && looksLikeUrl(live)) return { src: live, kind: 'audio', name: live };
            if (session && session.src) return session;
            if (fact && fact.media) return { src: fact.media, kind: fact.kind || fieldId, name: fact.value };
            if (fieldId === 'audio' && looksLikeAudioSrc(live)) return { src: live, kind: 'audio', name: live };
            if (fact && fieldId === 'image' && looksLikeImageSrc(fact.value)) return { src: fact.value, kind: 'image', name: fact.value };
            if (fact && fieldId === 'audio' && looksLikeAudioSrc(fact.value)) return { src: fact.value, kind: 'audio', name: fact.value };
            if (fact && fact.preview) return { src: fact.preview, kind: 'image', name: fact.value };
            return null;
        }

        function setFieldThumb(fieldId) {
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const thumb = node && node.querySelector('.media-thumb');
            const input = document.getElementById('field-' + fieldId);
            if (!node || !thumb) return;
            if (fieldBase(fieldId) === 'ip' || fieldBase(fieldId) === 'address') {
                const ready = fieldBase(fieldId) === 'ip'
                    ? looksLikeIp((input && input.value.trim()) || firstValue(fieldId))
                    : !!mapsQueryForField(fieldId);
                if (ready) {
                    thumb.hidden = false;
                    thumb.innerHTML = PIN_ICON;
                    thumb.setAttribute('aria-label', fieldBase(fieldId) === 'address' ? 'Open in Google Maps' : 'Open IP location');
                    thumb.title = fieldBase(fieldId) === 'address' ? 'Google Maps' : 'Map';
                    node.classList.add('has-preview');
                } else {
                    thumb.hidden = true;
                    thumb.innerHTML = '';
                    thumb.removeAttribute('title');
                    node.classList.remove('has-preview');
                }
                return;
            }
            const media = mediaSource(fieldId);
            if (!media) {
                thumb.hidden = true;
                thumb.innerHTML = '';
                node.classList.remove('has-preview');
                if (fieldId === 'image') updateHubFace();
                return;
            }
            thumb.hidden = false;
            node.classList.add('has-preview');
            if (fieldId === 'image') {
                const src = String(media.src || '');
                let img = thumb.querySelector('img');
                if (!img) {
                    thumb.textContent = '';
                    img = document.createElement('img');
                    img.alt = '';
                    thumb.appendChild(img);
                }
                if (img.getAttribute('src') !== src) img.src = src;
                img.onerror = function () {
                    thumb.innerHTML = IMAGE_ICON;
                };
                updateHubFace();
            } else {
                thumb.innerHTML = AUDIO_ICON;
            }
        }

        const DEFAULT_FACE = 'icons/defaultprofile.jpg';

        function subjectDisplayName() {
            return firstValue('name') || 'Anonymous';
        }

        function filedPortraitSrc() {
            const photo = mediaSource('image');
            if (photo && photo.src && (photo.kind === 'image' || !photo.kind)) {
                return String(photo.src).replace(/"/g, '');
            }
            return '';
        }

        function portraitSrc() {
            return filedPortraitSrc() || DEFAULT_FACE;
        }

        function updateHubFace() {
            const face = document.getElementById('hubFace');
            if (!hub || !face) return;
            const src = filedPortraitSrc();
            if (src) {
                if (face.getAttribute('src') !== src) face.src = src;
                face.hidden = false;
                hub.classList.add('has-face');
                face.onerror = function () {
                    face.removeAttribute('src');
                    face.hidden = true;
                    hub.classList.remove('has-face');
                };
                return;
            }
            face.removeAttribute('src');
            face.hidden = true;
            hub.classList.remove('has-face');
        }

        let mediaGallery = { items: [], index: 0, fieldId: '' };

        function closeMediaViewer() {
            const viewer = document.getElementById('mediaViewer');
            const audio = document.getElementById('mediaAudio');
            const prev = document.getElementById('mediaPrev');
            const next = document.getElementById('mediaNext');
            const counter = document.getElementById('mediaCounter');
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
            if (prev) prev.hidden = true;
            if (next) next.hidden = true;
            if (counter) {
                counter.hidden = true;
                counter.textContent = '';
            }
            mediaGallery.items = [];
            mediaGallery.index = 0;
            mediaGallery.fieldId = '';
            if (viewer) viewer.hidden = true;
        }

        function syncMediaGalleryChrome() {
            const prev = document.getElementById('mediaPrev');
            const next = document.getElementById('mediaNext');
            const counter = document.getElementById('mediaCounter');
            const multi = mediaGallery.items.length > 1;
            if (prev) prev.hidden = !multi;
            if (next) next.hidden = !multi;
            if (counter) {
                if (multi) {
                    counter.hidden = false;
                    counter.textContent = (mediaGallery.index + 1) + ' / ' + mediaGallery.items.length;
                } else {
                    counter.hidden = true;
                    counter.textContent = '';
                }
            }
        }

        function showMediaGalleryItem() {
            const item = mediaGallery.items[mediaGallery.index];
            const image = document.getElementById('mediaImage');
            const card = document.getElementById('mediaAudioCard');
            if (!item || !image) return;
            if (card) card.hidden = true;
            image.hidden = false;
            image.src = item.src;
            syncMediaGalleryChrome();
        }

        function stepMediaGallery(delta) {
            if (photosSheetOpen()) {
                const items = imageGalleryItems();
                if (items.length < 2) return;
                mediaGallery.items = items;
                mediaGallery.index = (mediaGallery.index + delta + items.length) % items.length;
                renderPhotosSheet();
                return;
            }
            if (mediaGallery.items.length < 2) return;
            const len = mediaGallery.items.length;
            mediaGallery.index = (mediaGallery.index + delta + len) % len;
            showMediaGalleryItem();
        }

        function openImageGallery(startIndex) {
            openPhotosSheet(startIndex);
        }

        function openMediaViewer(fieldId) {
            if (fieldId === 'image') {
                openImageGallery();
                return;
            }
            const media = mediaSource(fieldId);
            if (!media || !media.src) return;
            const viewer = document.getElementById('mediaViewer');
            const image = document.getElementById('mediaImage');
            const card = document.getElementById('mediaAudioCard');
            const audio = document.getElementById('mediaAudio');
            const name = document.getElementById('mediaAudioName');
            if (!viewer) return;
            closePlatformMenu();
            mediaGallery.items = [];
            mediaGallery.index = 0;
            mediaGallery.fieldId = fieldId;
            syncMediaGalleryChrome();
            if (fieldId === 'audio' || media.kind === 'audio') {
                image.hidden = true;
                card.hidden = false;
                name.textContent = media.name || (latestFact(fieldId) && latestFact(fieldId).value) || 'Audio';
                audio.src = media.src;
                audio.play().catch(function () {});
            } else {
                card.hidden = true;
                image.hidden = false;
                image.src = media.src;
            }
            viewer.hidden = false;
        }

        function imageFactSrc(fact, preferPreview) {
            if (!fact) return '';
            if (preferPreview && fact.preview) return String(fact.preview).replace(/"/g, '');
            if (fact.media) return String(fact.media).replace(/"/g, '');
            if (looksLikeImageSrc(fact.value)) return String(fact.value).replace(/"/g, '');
            if (fact.preview) return String(fact.preview).replace(/"/g, '');
            if (looksLikeUrl(fact.value)) return String(fact.value).replace(/"/g, '');
            return '';
        }

        function imageFacts() {
            return ((profile.facts && profile.facts.image) || []).filter((item) => item && String(item.value || '').trim());
        }

        function primaryImageFact() {
            return imageFacts()[0] || null;
        }

        function imageGalleryItems() {
            const facts = imageFacts();
            return facts.map((fact, index) => {
                const src = imageFactSrc(fact, false);
                const thumb = imageFactSrc(fact, true) || src;
                if (!src && !thumb) return null;
                const href = src || thumb;
                return {
                    index: index,
                    src: href,
                    thumb: thumb || src,
                    name: fact.value || 'Image',
                    value: fact.value,
                    http: /^https?:\/\//i.test(href) || looksLikeUrl(fact.value),
                    primary: index === 0
                };
            }).filter(Boolean);
        }

        function photoDownloadName(item) {
            const raw = String((item && item.name) || '').split(/[\\/]/).pop().split('?')[0];
            if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(raw)) return raw;
            const dataExt = String((item && item.src) || '').match(/^data:image\/([\w+]+)/i);
            let ext = dataExt ? dataExt[1].toLowerCase().replace('jpeg', 'jpg').replace('+xml', '') : '';
            if (!ext && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(String((item && item.src) || ''))) {
                ext = String(item.src).match(/\.(png|jpe?g|gif|webp|bmp|svg)/i)[1].toLowerCase().replace('jpeg', 'jpg');
            }
            const subject = (firstValue('name') || 'photo').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            return (subject || 'photo') + '-' + (((item && item.index) || 0) + 1) + '.' + (ext || 'jpg');
        }

        function openPhotoInTab(item) {
            const src = item && item.src;
            if (!src) return;
            if (/^https?:\/\//i.test(src)) {
                window.open(src, '_blank', 'noopener,noreferrer');
                return;
            }
            srcToBlob(src).then(function (blob) {
                window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
            }).catch(function () {
                window.open(src, '_blank', 'noopener,noreferrer');
            });
        }

        function downloadPhotoItem(item) {
            const src = item && item.src;
            if (!src) return;
            const name = photoDownloadName(item);
            const save = function (href, revoke) {
                const link = document.createElement('a');
                link.href = href;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                link.remove();
                if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 1500);
            };
            if (/^(data:|blob:)/i.test(src)) {
                save(src, false);
                return;
            }
            srcToBlob(src).then(function (blob) {
                save(URL.createObjectURL(blob), true);
            }).catch(function () {
                window.open(src, '_blank', 'noopener,noreferrer');
            });
        }

        function copyPhotoItem(item, button) {
            if (!item) return Promise.resolve();
            const href = item.http ? (looksLikeUrl(item.value) ? item.value : item.src) : '';
            const done = function () {
                if (!button) return;
                button.classList.add('is-done');
                const prior = button.getAttribute('title') || 'Copy';
                button.setAttribute('title', 'Copied');
                setTimeout(function () {
                    button.classList.remove('is-done');
                    button.setAttribute('title', prior);
                }, 1100);
            };
            if (href) {
                return (navigator.clipboard && navigator.clipboard.writeText
                    ? navigator.clipboard.writeText(href)
                    : Promise.resolve()).then(done).catch(function () {});
            }
            return copyImageSource(item.src).then(done);
        }

        function searchPhotoItem(item) {
            const src = item && item.src;
            if (!src) return;
            if (/^https?:\/\//i.test(src)) {
                window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(src), '_blank', 'noopener,noreferrer');
                return;
            }
            copyImageSource(src).finally(function () {
                window.open('https://lens.google.com/upload', '_blank', 'noopener,noreferrer');
            });
        }

        function reorderPhotoItem(index, delta) {
            const items = imageFacts();
            const next = index + delta;
            if (next < 0 || next >= items.length) return;
            const ordered = items.slice();
            const moved = ordered.splice(index, 1)[0];
            ordered.splice(next, 0, moved);
            profile.facts.image = ordered;
            mediaGallery.index = next;
            finishProfilePhotos(true);
        }

        function promotePhotoItem(item) {
            reorderPhotoItem(item && item.index, -(item && item.index));
        }

        function deletePhotoItem(item) {
            if (!item) return;
            removeFact('image', item.value);
            if (photosSheetOpen()) renderPhotosSheet();
        }

        const FACE_ADD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

        function renderFaceGallery() {
            const gallery = document.getElementById('faceGallery');
            if (!gallery) return;
            gallery.innerHTML = '<button type="button" class="face-view" data-face-view aria-label="View photos">View</button>';
        }

        function photosSheetOpen() {
            const sheet = document.getElementById('photosSheet');
            return !!(sheet && !sheet.hidden);
        }

        function closePhotosSheet() {
            const sheet = document.getElementById('photosSheet');
            if (sheet) sheet.classList.remove('is-drop');
            hideSheet(sheet);
        }

        const PHOTO_ACT_ICON = {
            open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5h5v5"/><path d="M10 14L19 5"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>',
            copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg>',
            search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>',
            meta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>',
            left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
            right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
            remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
        };

        function photoActButton(act, title, icon, extra) {
            return '<button type="button" data-photo-act="' + act + '" data-tip="' + title + '" aria-label="' + title + '"' + (extra || '') + '>' + icon + '</button>';
        }

        function renderPhotosSheet() {
            const items = imageGalleryItems();
            mediaGallery.items = items;
            if (mediaGallery.index >= items.length) mediaGallery.index = Math.max(0, items.length - 1);
            const empty = document.getElementById('photosEmpty');
            const list = document.getElementById('photosList');
            const count = document.getElementById('photosCount');
            if (empty) empty.hidden = items.length > 0;
            if (count) count.textContent = items.length ? (items.length === 1 ? '1 photo' : items.length + ' photos') : '';
            if (!list) return;
            list.hidden = !items.length;
            list.replaceChildren();
            items.forEach((entry, i) => {
                const article = document.createElement('article');
                article.className = 'photos-item' + (entry.primary ? ' primary' : '');
                article.dataset.photosIndex = String(i);
                const img = document.createElement('img');
                img.alt = entry.primary ? 'Primary photo' : 'Photo ' + (i + 1);
                img.decoding = 'async';
                img.referrerPolicy = 'no-referrer';
                const thumb = entry.thumb || entry.src;
                const full = entry.src || entry.thumb;
                img.src = thumb || full;
                if (full && thumb && full !== thumb) {
                    img.addEventListener('error', function () { img.src = full; }, { once: true });
                }
                article.appendChild(img);
                if (entry.primary) {
                    const badge = document.createElement('span');
                    badge.className = 'photos-badge';
                    badge.textContent = 'Primary';
                    article.appendChild(badge);
                }
                const actions = document.createElement('div');
                actions.className = 'photos-actions';
                actions.innerHTML =
                    photoActButton('left', 'Move left', PHOTO_ACT_ICON.left, i === 0 ? ' disabled' : '') +
                    photoActButton('right', 'Move right', PHOTO_ACT_ICON.right, i === items.length - 1 ? ' disabled' : '') +
                    '<span class="spacer"></span>' +
                    photoActButton('open', 'Open', PHOTO_ACT_ICON.open) +
                    photoActButton('download', 'Download', PHOTO_ACT_ICON.download) +
                    photoActButton(entry.http ? 'copy' : 'copy-image', entry.http ? 'Copy URL' : 'Copy image', PHOTO_ACT_ICON.copy) +
                    photoActButton('search', 'Reverse search', PHOTO_ACT_ICON.search) +
                    photoActButton('meta', 'Metadata', PHOTO_ACT_ICON.meta) +
                    photoActButton('delete', 'Remove', PHOTO_ACT_ICON.remove, ' class="danger"');
                article.appendChild(actions);
                list.appendChild(article);
            });
            const active = list.querySelector('[data-photos-index="' + mediaGallery.index + '"]');
            if (active) list.scrollLeft = Math.max(0, active.offsetLeft - 12);
        }

        function openPhotosSheet(startIndex) {
            const items = imageGalleryItems();
            mediaGallery.fieldId = 'image';
            mediaGallery.items = items;
            mediaGallery.index = items.length
                ? Math.max(0, Math.min(items.length - 1, startIndex == null ? items.length - 1 : startIndex))
                : 0;
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            renderPhotosSheet();
            showSheet(document.getElementById('photosSheet'));
        }

        function populatedCount() {
            return FIELDS.filter((field) => !!latestFact(field.id)).length;
        }

        function visibleOrbitFields() {
            return FIELDS.filter((field) => {
                const node = document.querySelector('.node[data-field="' + field.id + '"]');
                return !(node && node.classList.contains('off'));
            });
        }

        function fieldHasInput(field) {
            const input = document.getElementById('field-' + field.id);
            if (input) return !!String(input.value || '').trim();
            return !!latestFact(field.id);
        }

        function filledInputCount() {
            return visibleOrbitFields().filter(fieldHasInput).length;
        }

        function nullInputCount() {
            return visibleOrbitFields().filter((field) => !fieldHasInput(field) && isNullField(field.id)).length;
        }

        function orbitSpokeStroke(node, linked) {
            if (node && node.classList.contains('null')) {
                return linked ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.28)';
            }
            if (node && node.classList.contains('filled')) {
                return linked ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.28)';
            }
            return linked ? 'rgba(228,228,231,0.32)' : 'rgba(255,255,255,0.06)';
        }

        const HUB_RING = 2 * Math.PI * 46;

        function updateHubProgress() {
            const ring = document.getElementById('hubRingFill');
            const nullRing = document.getElementById('hubRingNull');
            if (!ring) return;
            const total = visibleOrbitFields().length || FIELDS.length;
            const filled = filledInputCount();
            const nulled = nullInputCount();
            const green = total ? filled / total : 0;
            const red = total ? nulled / total : 0;
            const greenLen = HUB_RING * green;
            const redLen = HUB_RING * red;
            ring.style.strokeDasharray = String(HUB_RING);
            ring.style.strokeDashoffset = String(HUB_RING * (1 - green));
            if (nullRing) {
                nullRing.style.strokeDasharray = redLen + ' ' + (HUB_RING - redLen);
                nullRing.style.strokeDashoffset = String(-greenLen);
                nullRing.style.opacity = redLen > 0.8 ? '1' : '0';
            }
            hub.classList.toggle('complete', green >= 1);
            hub.classList.toggle('has-null', red > 0);
            const known = Math.round(green * 100);
            const missing = Math.round(red * 100);
            hub.setAttribute('aria-label', missing
                ? known + '% known, ' + missing + '% missing'
                : known + '% complete');
        }

        function sheetFieldValue(field) {
            const fact = latestFact(field.id);
            const raw = (fact && fact.value) || '';
            if (fieldBase(field.id) === 'phone') return formatPhoneNumber(raw);
            if (fieldBase(field.id) === 'timezone') return resolveTimezoneValue(raw) || raw;
            if (fieldBase(field.id) === 'countrycode') {
                const meta = countryCodeMeta(raw);
                return meta ? meta.dial + ' · ' + meta.name : raw;
            }
            return raw;
        }

        function orbitFieldDisplay(fieldId, value) {
            if (fieldBase(fieldId) === 'phone') return formatPhoneNumber(value);
            if (fieldBase(fieldId) === 'timezone') return resolveTimezoneValue(value) || value;
            if (fieldBase(fieldId) === 'countrycode') return resolveCountryCodeValue(value) || value;
            return value || '';
        }

        function profileSheetEditing() {
            const el = document.activeElement;
            if (!el || !el.closest) return false;
            return el.id === 'subjectNameInput' || !!el.closest('#factsList [data-sheet-field], .fact-prov, .fact-detail, .case-file, .sheet-pick, #sheetPickMenu');
        }

        const openFactDetails = new Set();

        function factDetailsOpen(id) {
            return openFactDetails.has(id);
        }

        function toggleFactDetails(id) {
            if (!id) return;
            if (openFactDetails.has(id)) openFactDetails.delete(id);
            else openFactDetails.add(id);
            const item = document.querySelector('.fact-item[data-fact-item="' + id + '"]');
            if (!item) return;
            const on = openFactDetails.has(id);
            item.classList.toggle('is-open', on);
            const panel = item.querySelector('.fact-detail');
            const btn = item.querySelector('[data-fact-more]');
            if (panel) panel.setAttribute('aria-hidden', on ? 'false' : 'true');
            if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        }

        function dossierFieldRowHtml(field) {
            const base = fieldBase(field.id);
            const value = sheetFieldValue(field);
            const isNotes = base === 'notes';
            const secret = isSecretField(field.id);
            const secretOpen = secret && secretIsOpen(field.id);
            const platformField = isPlatformField(field.id);
            const platformId = platformField ? fieldPlatformId(field.id) : '';
            const platform = platformId ? platformById(platformId) : null;
            let control;
            const reveal = secret
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, secretOpen)) + '" title="' + (secretOpen ? 'Hide' : 'Show') + '">' + (secretOpen ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            if (isNotes) {
                control = '<textarea class="sheet-area" data-sheet-field="' + field.id + '" rows="2" placeholder="' + escapeHtml(field.placeholder || '') + '">' + escapeHtml(value) + '</textarea>';
            } else if (platformField) {
                const passInput = '<input class="sheet-input" data-sheet-field="' + field.id + '" type="' + (secret && !secretOpen ? 'password' : 'text') + '" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" value="' + escapeHtml(value) + '" spellcheck="false" autocomplete="off">';
                control =
                    '<button type="button" class="sheet-platform" data-sheet-platform="' + field.id + '"' + (platform ? ' hidden' : '') + '>Select site</button>' +
                    '<div class="sheet-platform-value"' + (platform ? '' : ' hidden') + '>' +
                        (platform
                            ? '<button type="button" class="sheet-platform-mark" data-sheet-platform="' + field.id + '" title="Change site" aria-label="Change site">' + platformMark(platform) + '</button>'
                            : '<button type="button" class="sheet-platform-mark" data-sheet-platform="' + field.id + '" hidden title="Change site" aria-label="Change site"></button>') +
                        (secret ? '<span class="sheet-secret">' + passInput + reveal + '</span>' : passInput) +
                    '</div>';
            } else {
                const input = '<input class="sheet-input" data-sheet-field="' + field.id + '" type="' + (secret && !secretOpen ? 'password' : 'text') + '" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder || '') + '" value="' + escapeHtml(value) + '" spellcheck="false" autocomplete="off">';
                control = secret ? '<span class="sheet-secret">' + input + reveal + '</span>' : input;
            }
            const maps = isMapsField(field.id) ? mapsButtonHtml(field.id) : '';
            const filled = !!String(value || '').trim() && (!platformField || !!platform);
            const find = '<button type="button" class="fact-find' + (filled ? ' ready' : '') + '" data-search-field="' + field.id + '" aria-label="' + (filled ? 'Search deeper' : 'How to find this') + '" title="' + (filled ? 'Search deeper' : 'How to find this') + '">' + (filled ? DEEP_ICON : FIND_ICON) + '</button>';
            const drop = '<button type="button" class="fact-drop" data-sheet-hide="' + field.id + '" aria-label="Delete" title="Delete">×</button>';
            const fact = lastFactRecord(field.id);
            const detailsOpen = factDetailsOpen(field.id);
            const more = '<button type="button" class="fact-more" data-fact-more="' + field.id + '" aria-expanded="' + (detailsOpen ? 'true' : 'false') + '" aria-label="Details" title="Details">' + SHEET_CHEVRON + '</button>';
            return '<div class="fact-item' + (detailsOpen ? ' is-open' : '') + '" data-fact-item="' + field.id + '">' +
                '<div class="fact-row sheet' + (isNotes ? ' wrap' : '') + (secret ? ' secret' : '') + (maps ? ' place' : '') + (platformField ? ' platform' : '') + (activeField === field.id ? ' active' : '') + '" data-focus="' + field.id + '">' +
                '<span class="fact-label">' + escapeHtml(field.label) + '</span>' +
                '<div class="fact-control">' + control + '</div>' +
                '<div class="fact-tools">' +
                    maps +
                    more +
                    find +
                    drop +
                '</div>' +
                '</div>' +
                factDetailHtml(field.id, fact, detailsOpen) +
                '</div>';
        }

        const SHEET_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

        function sheetPickButton(kind, value, extras) {
            const label = sheetPickLabel(kind, value);
            const empty = value ? '' : ' is-empty';
            return '<button type="button" class="sheet-pick' + empty + '" data-sheet-pick="' + kind + '" data-value="' + escapeHtml(value || '') + '" ' + (extras || '') + ' aria-haspopup="listbox" aria-expanded="false"><span>' + escapeHtml(label) + '</span>' + SHEET_CHEVRON + '</button>';
        }

        function factDetailHtml(fieldId, fact, open) {
            const source = (fact && fact.source) || '';
            const confidence = (fact && fact.confidence) || '';
            const method = (fact && fact.method) || '';
            const captured = factStampIso(fact);
            const locked = window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly();
            const lock = locked ? ' disabled' : '';
            const stamp = factStampHtml(fieldId, captured, lock);
            const dup = '<button type="button" class="fact-dup" data-sheet-dup="' + fieldId + '" aria-label="Duplicate" title="Duplicate">' + DUP_ICON + '<span>Duplicate</span></button>';
            return '<div class="fact-detail" data-fact-detail="' + fieldId + '" aria-hidden="' + (open ? 'false' : 'true') + '">' +
                '<div class="fact-detail-body">' +
                '<input class="fact-source" data-fact-meta="source" data-sheet-meta="' + fieldId + '" type="text" placeholder="Note" value="' + escapeHtml(source) + '" spellcheck="true" autocomplete="off" aria-label="Note">' +
                '<div class="fact-detail-row">' +
                    '<div class="fact-picks">' +
                        sheetPickButton('confidence', confidence, 'data-sheet-meta="' + fieldId + '" aria-label="Confidence"') +
                        sheetPickButton('method', method, 'data-sheet-meta="' + fieldId + '" aria-label="Collection method"') +
                        dup +
                        stamp +
                    '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        function lastFactRecord(id) {
            const list = (profile.facts && profile.facts[id]) || [];
            return list.length ? list[list.length - 1] : null;
        }

        function factStampIso(fact) {
            if (!fact) return '';
            return fact.capturedAt || fact.addedAt || '';
        }

        function factStampHtml(fieldId, captured, lock) {
            const empty = captured ? '' : ' is-empty';
            return '<div class="fact-stamp">' +
                '<button type="button" class="fact-captured' + empty + '" data-fact-cal="' + fieldId + '" aria-haspopup="dialog" aria-expanded="false" aria-label="Change date" title="Change date"' + lock + '>' +
                    escapeHtml(captured ? formatCapturedDate(captured) : 'Date') +
                '</button>' +
                '<span class="fact-stamp-sep" aria-hidden="true">·</span>' +
                '<button type="button" class="fact-captured fact-captured-time' + empty + '" data-fact-time="' + fieldId + '" aria-haspopup="dialog" aria-expanded="false" aria-label="Change time" title="Change time"' + lock + '>' +
                    escapeHtml(captured ? formatCapturedTime(captured) : 'Time') +
                '</button>' +
                '</div>';
        }

        function paintFactCaptured(id) {
            if (!id) return;
            const iso = factStampIso(lastFactRecord(id));
            const root = document.querySelector('#factsList [data-fact-item="' + id + '"]');
            if (!root) return;
            const dateBtn = root.querySelector('[data-fact-cal]');
            const timeBtn = root.querySelector('[data-fact-time]');
            if (dateBtn) {
                dateBtn.textContent = iso ? formatCapturedDate(iso) : 'Date';
                dateBtn.classList.toggle('is-empty', !iso);
            }
            if (timeBtn) {
                timeBtn.textContent = iso ? formatCapturedTime(iso) : 'Time';
                timeBtn.classList.toggle('is-empty', !iso);
            }
        }

        function formatCapturedDate(iso) {
            const d = new Date(iso);
            if (!Number.isFinite(d.getTime())) return 'Date';
            return d.toLocaleString('en-GB', { day: 'numeric', month: 'short' });
        }

        function formatCapturedTime(iso) {
            const d = new Date(iso);
            if (!Number.isFinite(d.getTime())) return 'Time';
            return d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
        }

        function formatCaptured(iso) {
            const day = formatCapturedDate(iso);
            const time = formatCapturedTime(iso);
            if (day === 'Date' || time === 'Time') return '';
            return day + ' · ' + time;
        }

        function dossierHtml() {
            const groups = groupsForProfile().map((group) => {
                const fields = group.fields.map(fieldById).filter((field) => field && !hiddenFields.has(field.id) && !skipSheetField(field));
                return { group: group, fields: fields };
            }).filter((entry) => entry.fields.length);
            const body = groups.map(({ group, fields }) => {
                const heading = group.id === 'identity'
                    ? ''
                    : '<div class="group-label">' + escapeHtml(group.label) + '</div>';
                return '<div class="group">' + heading + fields.map(dossierFieldRowHtml).join('') + '</div>';
            }).join('');
            return body +
                '<p class="site-updated" data-site-updated hidden></p>';
        }

        const SITE_REPO = 'Delexoo/OrbINT';
        let siteUpdatedAt = '';
        let siteUpdatedLoading = false;
        let siteUpdatedTimer = 0;

        function siteUpdatedLabel(iso) {
            const then = new Date(iso).getTime();
            if (!Number.isFinite(then)) return '';
            const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
            let amount;
            let unit;
            if (secs < 60) {
                amount = secs;
                unit = amount === 1 ? 'sec' : 'secs';
            } else if (secs < 3600) {
                amount = Math.floor(secs / 60);
                unit = 'min';
            } else if (secs < 86400) {
                amount = Math.floor(secs / 3600);
                unit = amount === 1 ? 'hour' : 'hours';
            } else if (secs < 365 * 86400) {
                amount = Math.floor(secs / 86400);
                unit = amount === 1 ? 'day' : 'days';
            } else {
                amount = Math.floor(secs / (365 * 86400));
                unit = amount === 1 ? 'year' : 'years';
            }
            return 'OrbINT.net last updated: ' + amount + ' ' + unit + ' ago';
        }

        function paintSiteUpdated() {
            const el = document.querySelector('[data-site-updated]');
            if (!el || !siteUpdatedAt) return;
            const text = siteUpdatedLabel(siteUpdatedAt);
            if (!text) return;
            if (el.textContent !== text) el.textContent = text;
            el.hidden = false;
            if (!siteUpdatedTimer) siteUpdatedTimer = setInterval(paintSiteUpdated, 1000);
        }

        function loadSiteUpdated() {
            paintSiteUpdated();
            if (siteUpdatedAt || siteUpdatedLoading) return;
            siteUpdatedLoading = true;
            const headers = { Accept: 'application/vnd.github+json' };
            fetch('https://api.github.com/repos/' + SITE_REPO + '/commits/main', { headers: headers })
                .then(function (res) {
                    if (!res.ok) throw new Error('github');
                    return res.json();
                })
                .then(function (data) {
                    const at = data && data.commit && ((data.commit.committer && data.commit.committer.date) || (data.commit.author && data.commit.author.date));
                    if (!at) throw new Error('date');
                    siteUpdatedAt = at;
                    paintSiteUpdated();
                })
                .catch(function () {
                    return fetch('https://api.github.com/repos/' + SITE_REPO, { headers: headers })
                        .then(function (res) {
                            if (!res.ok) return null;
                            return res.json();
                        })
                        .then(function (repo) {
                            const at = repo && (repo.pushed_at || repo.updated_at);
                            if (!at) return;
                            siteUpdatedAt = at;
                            paintSiteUpdated();
                        });
                })
                .finally(function () {
                    siteUpdatedLoading = false;
                });
        }

        function syncSheetInputs(except) {
            document.querySelectorAll('#factsList [data-sheet-field]').forEach((input) => {
                if (input === except || document.activeElement === input) return;
                const field = fieldById(input.dataset.sheetField);
                if (!field) return;
                const next = sheetFieldValue(field);
                if (input.value !== next) input.value = next;
            });
        }

        function syncLinkedField(fieldId, value) {
            const shown = orbitFieldDisplay(fieldId, value);
            const orbitInput = document.getElementById('field-' + fieldId);
            if (orbitInput && document.activeElement !== orbitInput) {
                orbitInput.value = shown;
                if (typeof syncNodeFilled === 'function') syncNodeFilled(orbitInput);
            }
            if (isPlatformField(fieldId)) {
                const node = document.querySelector('.node[data-field="' + fieldId + '"]');
                if (typeof setUsernameStep === 'function') {
                    setUsernameStep(node, fieldPlatformId(fieldId), !!String(shown || '').trim());
                }
                syncSheetPlatform(fieldId);
            }
            syncSheetInputs(document.activeElement);
            if (isThumbField(fieldId)) {
                if (typeof setFieldThumb === 'function') setFieldThumb(fieldId);
            }
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
            if (fieldBase(fieldId) === 'timezone' && typeof updateTimezoneClocks === 'function') updateTimezoneClocks();
            updateHubProgress();
        }

        function refreshProfileChrome() {
            const name = subjectDisplayName();
            const nameEl = document.getElementById('subjectName');
            const nameInput = document.getElementById('subjectNameInput');
            if (nameEl && document.activeElement !== nameInput) nameEl.textContent = name;
            const hubTitle = document.getElementById('hubTitle');
            if (hubTitle) hubTitle.textContent = name === 'Anonymous' ? 'OrbINT' : name;
            const nameFind = document.getElementById('subjectFind');
            if (nameFind) {
                const named = !!String(firstValue('name') || '').trim();
                const icon = named ? DEEP_ICON : FIND_ICON;
                if (nameFind.innerHTML !== icon) nameFind.innerHTML = icon;
                nameFind.classList.toggle('ready', named);
                nameFind.setAttribute('aria-label', named ? 'Search deeper' : 'How to find this');
                nameFind.title = named ? 'Search deeper' : 'How to find this';
            }

            const filled = populatedCount();
            const completeness = document.getElementById('completenessFill');
            const coverageLabel = document.getElementById('coverageLabel');
            const caseTotal = groupsForProfile().reduce((count, group) => (
                count + group.fields.filter((id) => fieldById(id) && !hiddenFields.has(id)).length
            ), 0) || FIELDS.length;
            if (completeness) completeness.style.width = ((filled / caseTotal) * 100) + '%';
            if (coverageLabel) coverageLabel.textContent = filled + ' of ' + caseTotal + ' filed';

            const rec = Object.assign({}, emptyCaseMeta(), (profile && profile.case) || {});
            const num = document.getElementById('caseNumber');
            const offense = document.getElementById('caseOffense');
            const status = document.getElementById('caseStatus');
            const who = document.getElementById('caseInvestigator');
            if (num && document.activeElement !== num) num.value = rec.number || '';
            if (offense && document.activeElement !== offense) offense.value = rec.offense || '';
            const offensePick = document.getElementById('caseOffensePick');
            if (offensePick) offensePick.dataset.value = rec.offense || '';
            if (status && document.activeElement !== status) {
                const val = rec.status || 'open';
                status.dataset.value = val;
                status.classList.toggle('is-empty', !val);
                const lab = document.getElementById('caseStatusLabel') || status.querySelector('span');
                if (lab) lab.textContent = sheetPickLabel('status', val);
            }
            if (who && document.activeElement !== who) who.value = rec.investigator || '';

            const face = document.getElementById('targetFace');
            if (face) {
                face.classList.add('visible');
                let img = face.querySelector('img');
                const src = portraitSrc();
                if (!img) {
                    img = document.createElement('img');
                    img.alt = '';
                    face.insertBefore(img, face.firstChild);
                }
                if (img.getAttribute('src') !== src) img.src = src;
                face.setAttribute('aria-label', 'View profile photos');
            }
            if (typeof renderFaceGallery === 'function') renderFaceGallery();
            updateHubFace();

            const socialsEl = document.getElementById('profileSocials');
            if (socialsEl) socialsEl.innerHTML = '';

            const addressLines = subjectAddressLines();
            const idStack = document.getElementById('idStack');
            if (idStack) {
                if (addressLines.length) {
                    idStack.hidden = false;
                    idStack.innerHTML =
                        '<span class="id-address">' + addressLines.map(escapeHtml).join('<br>') + '</span>' +
                        mapsControlHtml('address', 'id-maps');
                } else {
                    idStack.hidden = true;
                    idStack.textContent = '';
                }
            }
        }

        function renderProfile(forceSheet) {
            refreshProfileChrome();

            const factsSection = document.getElementById('factsSection');
            const factsList = document.getElementById('factsList');
            if (factsSection) factsSection.hidden = false;
            if (factsList) {
                factsList.className = 'dossier';
                if (!forceSheet && profileSheetEditing() && factsList.querySelector('[data-sheet-field]')) {
                    syncSheetInputs(document.activeElement);
                } else {
                    factsList.innerHTML = dossierHtml();
                }
                loadSiteUpdated();
            }

            const analysisSection = document.getElementById('analysisSection');
            const analysisBox = document.getElementById('analysisBox');
            if (profile.analysis) {
                analysisSection.hidden = false;
                analysisBox.textContent = profile.analysis;
            } else if (analysisSection) {
                analysisSection.hidden = true;
                if (analysisBox) analysisBox.textContent = '';
            }
            renderLeads(activeField);
            if (typeof renderProfileRail === 'function') renderProfileRail();
            renderPeerHubs();
            if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
            else if (window.OrbINTCase && typeof OrbINTCase.renderDatasheet === 'function') OrbINTCase.renderDatasheet();
        }

        function nextEmptyClone(sourceId) {
            const base = fieldBase(sourceId);
            if (!base) return '';
            const ids = [];
            groupsForProfile().forEach(function (group) {
                (group.fields || []).forEach(function (id) { ids.push(id); });
            });
            const at = ids.indexOf(sourceId);
            if (at < 0) return '';
            let i;
            for (i = at + 1; i < ids.length; i++) {
                if (fieldBase(ids[i]) !== base) break;
                if (typeof hiddenFields !== 'undefined' && hiddenFields.has(ids[i])) continue;
                const field = fieldById(ids[i]);
                if (!field || skipSheetField(field)) continue;
                const fact = latestFact(ids[i]);
                if (!String((fact && fact.value) || '').trim()) return ids[i];
            }
            return '';
        }

        function focusSheetField(id) {
            if (!id) return;
            activeField = id;
            const pick = document.querySelector('#factsList [data-sheet-platform="' + id + '"]');
            const input = document.querySelector('#factsList [data-sheet-field="' + id + '"]');
            const el = (input && !input.hidden) ? input : (pick && !pick.hidden ? pick : input || pick);
            if (!el) return;
            requestAnimationFrame(function () {
                el.focus();
                const item = el.closest('.fact-item');
                if (item && item.scrollIntoView) item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            });
        }

        function commitSheetEnter(fieldId) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            const field = fieldById(fieldId);
            if (!field || skipSheetField(field)) return;
            if (fieldBase(fieldId) === 'notes') return;
            const fact = latestFact(fieldId);
            if (!String((fact && fact.value) || '').trim()) return;
            const emptyId = nextEmptyClone(fieldId);
            if (emptyId) {
                focusSheetField(emptyId);
                return;
            }
            if (typeof duplicateField === 'function') duplicateField(fieldId, { focus: 'sheet' });
        }

        function beginNameEdit() {
            const row = document.getElementById('subjectNameRow');
            const input = document.getElementById('subjectNameInput');
            if (!row || !input) return;
            row.classList.add('editing');
            input.value = firstValue('name');
            input.hidden = false;
            requestAnimationFrame(function () {
                input.focus();
                input.select();
            });
        }

        function endNameEdit(save) {
            const row = document.getElementById('subjectNameRow');
            const input = document.getElementById('subjectNameInput');
            const nameEl = document.getElementById('subjectName');
            if (!row || !input || !row.classList.contains('editing')) return;
            if (save) writeLatestFact('name', input.value, extrasFromInput('name', input.value));
            row.classList.remove('editing');
            if (nameEl) nameEl.textContent = subjectDisplayName();
        }

        let photoUploadFor = '';

        function pickProfilePhoto(profileId) {
            photoUploadFor = profileId || (profileLibrary && profileLibrary.activeId) || '';
            const sheetInput = document.getElementById('photosFile');
            const input = (typeof photosSheetOpen === 'function' && photosSheetOpen() && sheetInput)
                ? sheetInput
                : document.getElementById('profilePhotoFile');
            if (input) input.click();
        }

        function applyPhotoToProfile(profileId, file) {
            if (!isImageFile(file)) return;
            const activeId = profileLibrary && profileLibrary.activeId;
            if (!profileId || profileId === activeId) {
                applyProfilePhotoFile(file);
                return;
            }
            const entry = profileLibrary && profileLibrary.items[profileId];
            if (!entry) return;
            imageVersionsFromFile(file).then((versions) => {
                const fact = {
                    value: file.name + ' (' + Math.round(file.size / 1024) + ' KB)',
                    addedAt: new Date().toISOString(),
                    kind: 'image'
                };
                if (versions) {
                    if (versions.preview) fact.preview = versions.preview;
                    if (versions.media) fact.media = versions.media;
                    if (versions.kind) fact.kind = versions.kind;
                }
                entry.facts = entry.facts || {};
                entry.facts.image = [fact];
                saveProfileEntry(entry);
                if (typeof renderPeerHubs === 'function') renderPeerHubs();
                if (typeof renderProfileRail === 'function') renderProfileRail();
            });
        }

        function finishProfilePhotos(keepIndex) {
            saveProfile();
            const input = document.getElementById('field-image');
            const primary = primaryImageFact();
            if (input && document.activeElement !== input) {
                input.value = (primary && primary.value) || firstValue('image');
                if (typeof syncNodeFilled === 'function') syncNodeFilled(input);
            }
            if (typeof setFieldThumb === 'function') setFieldThumb('image');
            renderProfile();
            renderNodes();
            recordHistory(true);
            if (typeof photosSheetOpen === 'function' && photosSheetOpen()) {
                const total = imageGalleryItems().length;
                if (!keepIndex) mediaGallery.index = Math.max(0, total - 1);
                else if (mediaGallery.index >= total) mediaGallery.index = Math.max(0, total - 1);
                renderPhotosSheet();
            }
        }

        function applyProfilePhotoUrl(url) {
            const clean = String(url || '').trim();
            if (!clean) return false;
            if (!looksLikeUrl(clean) && !looksLikeImageSrc(clean)) return false;
            profile.facts.image = profile.facts.image || [];
            const key = clean.toLowerCase();
            if (profile.facts.image.some((item) => item && String(item.value || '').toLowerCase() === key)) return true;
            if (isNullField('image')) setFieldNull('image', false, true);
            profile.facts.image.push({
                value: clean,
                addedAt: new Date().toISOString(),
                kind: 'image',
                media: clean,
                preview: clean
            });
            finishProfilePhotos();
            return true;
        }

        function applyProfilePhotoFile(file) {
            return applyProfilePhotoFiles([file]);
        }

        function isImageFile(file) {
            if (!file) return false;
            if (String(file.type || '').indexOf('image/') === 0) return true;
            return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(String(file.name || ''));
        }

        function cloneInputFile(file) {
            if (!file) return file;
            try {
                return new File([file], file.name || 'photo', {
                    type: file.type || 'application/octet-stream',
                    lastModified: file.lastModified
                });
            } catch (error) {
                try { return file.slice(0, file.size, file.type || 'application/octet-stream'); } catch (retry) { return file; }
            }
        }

        function takeInputFiles(input) {
            const files = Array.from((input && input.files) || []).map(cloneInputFile);
            if (input) input.value = '';
            return files;
        }

        function applyProfilePhotoFiles(files) {
            const list = Array.from(files || []).filter(isImageFile);
            if (!list.length) return Promise.resolve();
            return Promise.all(list.map((file) =>
                imageVersionsFromFile(file).then((versions) => ({ file: file, versions: versions }))
            )).then((results) => {
                profile.facts.image = profile.facts.image || [];
                results.forEach((entry) => {
                    const clean = entry.file.name + ' (' + Math.round(entry.file.size / 1024) + ' KB)';
                    const same = profile.facts.image.some((item) => item && String(item.value || '').toLowerCase() === clean.toLowerCase());
                    if (same) return;
                    const fact = { value: clean, addedAt: new Date().toISOString(), kind: 'image' };
                    if (entry.versions) {
                        if (entry.versions.preview) fact.preview = entry.versions.preview;
                        if (entry.versions.media) fact.media = entry.versions.media;
                        if (entry.versions.kind) fact.kind = entry.versions.kind;
                    }
                    if (isNullField('image')) setFieldNull('image', false, true);
                    profile.facts.image.push(fact);
                });
                finishProfilePhotos();
            });
        }

        function peerFaceSrc(entry) {
            return compactFaceFrom(entry && entry.facts) || DEFAULT_FACE;
        }

        function renderPeerHubs() {
            const layer = document.getElementById('peerHubs');
            const lines = document.getElementById('peerLinkLayer');
            if (!layer) return;
            const ids = linkedProfileIds();
            const rows = ids.map((id) => {
                const entry = profileLibrary.items[id];
                const name = displayProfileName(entry);
                const face = compactFaceFrom(entry && entry.facts);
                return { id: id, name: name, face: face, stamp: id + ':' + name + ':' + (face ? 'I' + faceStamp(face) : 'L') };
            });
            const stamp = rows.map((row) => row.stamp).join('|');
            if (layer.dataset.stamp === stamp && peerBodies.length === ids.length) {
                peerBodies.forEach((body) => {
                    const el = layer.querySelector('[data-peer="' + body.id + '"]');
                    if (el) body.el = el;
                });
                return;
            }
            layer.dataset.stamp = stamp;
            layer.innerHTML = rows.map((row) => {
                const mark = row.face
                    ? '<img class="peer-hub-face" alt="" data-peer="' + escapeHtml(row.id) + '" data-peer-face="' + escapeHtml(row.id) + '">'
                    : '<span class="peer-hub-letter" data-peer="' + escapeHtml(row.id) + '">' + escapeHtml(profileLetter(row.name)) + '</span>';
                return '<div class="peer-hub" data-peer="' + escapeHtml(row.id) + '" title="' + escapeHtml(row.name) + '" role="button" tabindex="0" aria-label="' + escapeHtml(row.name) + '">' +
                    mark +
                    '<span class="peer-hub-name" data-peer="' + escapeHtml(row.id) + '">' + escapeHtml(row.name) + '</span>' +
                    '</div>';
            }).join('');
            rows.forEach((row) => {
                if (!row.face) return;
                const img = layer.querySelector('img[data-peer-face="' + row.id + '"]');
                if (img) img.src = row.face;
            });
            if (lines) {
                const size = canvasSize();
                lines.setAttribute('viewBox', '0 0 ' + size.width + ' ' + size.height);
                lines.innerHTML = ids.map((id) => '<line data-peer-line="' + escapeHtml(id) + '"></line>').join('');
            }
            syncPeerBodies();
            positionPeerHubs();
        }

        function syncPeerBodies() {
            const layer = document.getElementById('peerHubs');
            const els = layer ? Array.from(layer.querySelectorAll('[data-peer]')) : [];
            const prev = new Map(peerBodies.map((body) => [body.id, body]));
            peerBodies = els.map((el) => {
                const old = prev.get(el.dataset.peer);
                if (old) {
                    old.el = el;
                    old.w = PEER_HUB_SIZE;
                    old.h = PEER_HUB_SIZE;
                    return old;
                }
                return {
                    id: el.dataset.peer,
                    el: el,
                    x: null,
                    y: null,
                    vx: 0,
                    vy: 0,
                    tx: 0,
                    ty: 0,
                    w: PEER_HUB_SIZE,
                    h: PEER_HUB_SIZE,
                    sw: PEER_HUB_SIZE,
                    sh: PEER_HUB_SIZE
                };
            });
            if (orbit.dragMode === 'peer' && orbit.dragItem && orbit.dragItem.id) {
                const live = peerBodies.find((body) => body.id === orbit.dragItem.id);
                if (live) orbit.dragItem = live;
            }
        }

        function peerBodyFromEl(el) {
            const hubEl = el && (el.classList && el.classList.contains('peer-hub') ? el : (el.closest && el.closest('.peer-hub')));
            if (!hubEl || !hubEl.dataset.peer) return null;
            let body = peerBodies.find((entry) => entry.id === hubEl.dataset.peer);
            if (body) {
                body.el = hubEl;
                return body;
            }
            body = {
                id: hubEl.dataset.peer,
                el: hubEl,
                x: null,
                y: null,
                vx: 0,
                vy: 0,
                tx: 0,
                ty: 0,
                w: PEER_HUB_SIZE,
                h: PEER_HUB_SIZE,
                sw: PEER_HUB_SIZE,
                sh: PEER_HUB_SIZE
            };
            peerBodies.push(body);
            return body;
        }

        function hubPeerClearance() {
            return (hub && hub.offsetWidth || 220) / 2 + PEER_HUB_SIZE / 2 + 20;
        }

        function peerPeerClearance() {
            return PEER_HUB_SIZE + 18;
        }

        function pushOutOfCircle(x, y, cx, cy, minDist) {
            let dx = x - cx;
            let dy = y - cy;
            let dist = Math.hypot(dx, dy);
            if (dist < 0.0001) {
                dx = 1;
                dy = 0;
                dist = 1;
            }
            if (dist >= minDist) return { x: x, y: y, hit: false };
            const scale = minDist / dist;
            return { x: cx + dx * scale, y: cy + dy * scale, hit: true };
        }

        function otherPeerWorlds(ignoreId) {
            const pts = [];
            (typeof linkedProfileIds === 'function' ? linkedProfileIds() : []).forEach((id) => {
                if (!id || id === ignoreId) return;
                const home = peerHomeFor(id);
                if (home) pts.push({ id: id, x: home.x, y: home.y });
            });
            peerBodies.forEach((body) => {
                if (!body || body.id === ignoreId || body.x == null) return;
                if (pts.some((pt) => pt.id === body.id)) return;
                const hubPt = typeof hubScreenPoint === 'function' ? hubScreenPoint() : { x: 0, y: 0 };
                const zoom = Math.max(orbit.zoom || 1, 0.01);
                pts.push({
                    id: body.id,
                    x: (body.x - hubPt.x) / zoom,
                    y: (body.y - hubPt.y) / zoom
                });
            });
            return pts;
        }

        function unclipPeerWorld(x, y, ignoreId) {
            let px = Number.isFinite(x) ? x : 0;
            let py = Number.isFinite(y) ? y : 0;
            const hubMin = hubPeerClearance();
            const peerMin = peerPeerClearance();
            const others = otherPeerWorlds(ignoreId);
            for (let iter = 0; iter < 18; iter++) {
                let hits = 0;
                const hubPush = pushOutOfCircle(px, py, 0, 0, hubMin);
                if (hubPush.hit) {
                    px = hubPush.x;
                    py = hubPush.y;
                    hits++;
                }
                others.forEach((other) => {
                    const dx = px - other.x;
                    const dy = py - other.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist < 0.0001) dist = 0.0001;
                    if (dist >= peerMin) return;
                    const scale = peerMin / dist;
                    px = other.x + dx * scale;
                    py = other.y + dy * scale;
                    hits++;
                });
                if (!hits) break;
            }
            return { x: px, y: py };
        }

        let peerHomeFixTimer = 0;
        function schedulePeerHomeFix() {
            clearTimeout(peerHomeFixTimer);
            peerHomeFixTimer = setTimeout(function () {
                if (typeof persistPeerHomes === 'function') persistPeerHomes();
            }, 280);
        }

        function phonePeerOnScreen(sx, sy) {
            const size = canvasSize();
            const insets = orbitViewInsets();
            const pad = 36;
            return sx >= insets.left + pad &&
                sx <= size.width - insets.right - pad &&
                sy >= insets.top + pad &&
                sy <= size.height - insets.bottom - pad;
        }

        function computePeerTargets(hx, hy, zoom) {
            const z = Math.max(zoom || 1, 0.01);
            const phone = typeof isPhone === 'function' && isPhone();
            const worldRing = hubPeerClearance() + (phone ? 28 : 48);
            let far = worldRing;
            if (!phone && orbitItems.length) {
                const reach = Math.max.apply(null, orbitItems.map((item) => {
                    if (item.x == null || item.y == null) return 0;
                    return (Math.hypot(item.x - hx, item.y - hy) + Math.max(item.sw || item.w || 0, item.sh || item.h || 0) / 2) / z;
                }));
                if (reach) far = Math.max(far, reach + 64);
            }
            const unplaced = [];
            peerBodies.forEach((body) => {
                body.sw = PEER_HUB_SIZE * z;
                body.sh = PEER_HUB_SIZE * z;
                const home = peerHomeFor(body.id);
                if (home) {
                    let wx = home.x;
                    let wy = home.y;
                    if (phone && !phonePeerOnScreen(hx + wx * z, hy + wy * z)) {
                        const ang = (wx === 0 && wy === 0) ? -Math.PI / 2 : Math.atan2(wy, wx);
                        const parked = unclipPeerWorld(Math.cos(ang) * worldRing, Math.sin(ang) * worldRing, body.id);
                        wx = parked.x;
                        wy = parked.y;
                    } else if (!phone) {
                        const clear = unclipPeerWorld(home.x, home.y, body.id);
                        if (Math.hypot(clear.x - home.x, clear.y - home.y) > 1.5) {
                            peerHomes[body.id] = { x: clear.x, y: clear.y };
                            schedulePeerHomeFix();
                        }
                        wx = clear.x;
                        wy = clear.y;
                    }
                    body.tx = hx + wx * z;
                    body.ty = hy + wy * z;
                    return;
                }
                unplaced.push(body);
            });
            unplaced.forEach((body, i) => {
                const angle = -Math.PI / 2 + (i / Math.max(unplaced.length, 1)) * Math.PI * 2;
                const clear = unclipPeerWorld(Math.cos(angle) * far, Math.sin(angle) * far, body.id);
                body.tx = hx + clear.x * z;
                body.ty = hy + clear.y * z;
            });
        }

        function resolveLinkedProfileCollisions(hx, hy, zoom, peerGrab) {
            if (!peerBodies.length) return;
            const z = Math.max(zoom || 1, 0.01);
            const hubMin = hubPeerClearance();
            const peerMin = peerPeerClearance();
            const pts = peerBodies.map((body) => {
                const sx = body.x == null ? body.tx : body.x;
                const sy = body.y == null ? body.ty : body.y;
                return {
                    body: body,
                    grabbed: !!(peerGrab && body.id === peerGrab.id),
                    x: (sx - hx) / z,
                    y: (sy - hy) / z
                };
            });
            for (let iter = 0; iter < 16; iter++) {
                let hits = 0;
                pts.forEach((pt) => {
                    const pushed = pushOutOfCircle(pt.x, pt.y, 0, 0, hubMin);
                    if (!pushed.hit) return;
                    pt.x = pushed.x;
                    pt.y = pushed.y;
                    hits++;
                });
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const a = pts[i];
                        const b = pts[j];
                        let dx = a.x - b.x;
                        let dy = a.y - b.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist < 0.0001) {
                            dx = 1;
                            dy = 0;
                            dist = 1;
                        }
                        if (dist >= peerMin) continue;
                        const overlap = peerMin - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        if (a.grabbed && !b.grabbed) {
                            b.x -= nx * overlap;
                            b.y -= ny * overlap;
                        } else if (b.grabbed && !a.grabbed) {
                            a.x += nx * overlap;
                            a.y += ny * overlap;
                        } else {
                            a.x += nx * overlap * 0.5;
                            a.y += ny * overlap * 0.5;
                            b.x -= nx * overlap * 0.5;
                            b.y -= ny * overlap * 0.5;
                        }
                        hits++;
                    }
                }
                if (!hits) break;
            }
            pts.forEach((pt) => {
                pt.body.x = hx + pt.x * z;
                pt.body.y = hy + pt.y * z;
                if (pt.grabbed) {
                    orbit.grabX = pt.body.x;
                    orbit.grabY = pt.body.y;
                    return;
                }
                pt.body.vx = 0;
                pt.body.vy = 0;
            });
        }

        function paintPeerHubs(hx, hy, zoom) {
            const lines = document.getElementById('peerLinkLayer');
            const size = canvasSize();
            if (lines) lines.setAttribute('viewBox', '0 0 ' + size.width + ' ' + size.height);
            peerBodies.forEach((body) => {
                if (!body.el) return;
                const x = body.x == null ? body.tx : body.x;
                const y = body.y == null ? body.ty : body.y;
                body.el.style.left = x + 'px';
                body.el.style.top = y + 'px';
                body.el.style.transform = 'translate(-50%, -50%) scale(' + zoom + ')';
                const line = lines && lines.querySelector('[data-peer-line="' + body.id + '"]');
                if (!line) return;
                const rest = Math.max(Math.hypot(body.tx - hx, body.ty - hy), 8);
                const stretch = Math.hypot(x - hx, y - hy) / rest;
                line.setAttribute('x1', hx);
                line.setAttribute('y1', hy);
                line.setAttribute('x2', x);
                line.setAttribute('y2', y);
                line.setAttribute('stroke-width', stretch > 1.12 ? '2.2' : '1.6');
            });
        }

        function positionPeerHubs() {
            const layer = document.getElementById('peerHubs');
            const lines = document.getElementById('peerLinkLayer');
            if (!layer || !hub) return;
            if (!peerBodies.length) {
                if (lines) lines.innerHTML = '';
                return;
            }
            const zoom = orbit.zoom || 1;
            const hubPt = hubScreenPoint();
            computePeerTargets(hubPt.x, hubPt.y, zoom);
            const snap = orbit.snapLayout || reduceMotion;
            peerBodies.forEach((body) => {
                if (snap || body.x == null || body.y == null) {
                    body.x = body.tx;
                    body.y = body.ty;
                    body.vx = 0;
                    body.vy = 0;
                }
            });
            resolveLinkedProfileCollisions(hubPt.x, hubPt.y, zoom, null);
            paintPeerHubs(hubPt.x, hubPt.y, zoom);
        }

        function commitPeerHome(body) {
            if (!body || !body.id) return;
            const hubPt = hubScreenPoint();
            const zoom = Math.max(orbit.zoom || 1, 0.01);
            resolveLinkedProfileCollisions(hubPt.x, hubPt.y, zoom, null);
            const clear = unclipPeerWorld((body.x - hubPt.x) / zoom, (body.y - hubPt.y) / zoom, body.id);
            body.x = hubPt.x + clear.x * zoom;
            body.y = hubPt.y + clear.y * zoom;
            peerHomes[body.id] = { x: clear.x, y: clear.y };
            persistPeerHomes();
            const mine = profileLibrary && profileLibrary.activeId;
            const other = profileLibrary && profileLibrary.items[body.id];
            if (mine && other) {
                other.peerHomes = other.peerHomes || {};
                other.peerHomes[mine] = { x: -clear.x, y: -clear.y };
                saveProfileEntry(other);
            }
        }

        function applyPeerPhysics(dt, hx, hy, zoom, step, rigidView, tug, nodeGrab, hubGrab, peerGrab, hvx, hvy) {
            if (!peerBodies.length) return;
            computePeerTargets(hx, hy, zoom);
            const posMs = reduceMotion || orbit.snapLayout || rigidView ? 1 : (nodeGrab || peerGrab ? 520 : 420);
            peerBodies.forEach((body) => {
                const grabbed = peerGrab && body.id === peerGrab.id;
                if (grabbed) {
                    body.x = orbit.grabX;
                    body.y = orbit.grabY;
                    body.vx = 0;
                    body.vy = 0;
                    return;
                }
                if (body.x == null) body.x = body.tx;
                if (body.y == null) body.y = body.ty;
                if (!tug) {
                    if (rigidView || posMs <= 1) {
                        body.x = body.tx;
                        body.y = body.ty;
                        body.vx = 0;
                        body.vy = 0;
                        body.sxv = 0;
                        body.syv = 0;
                        return;
                    }
                    const fromX = body.x;
                    const fromY = body.y;
                    const nx = smoothDamp(fromX, body.tx, body.sxv || 0, dt, posMs);
                    const ny = smoothDamp(fromY, body.ty, body.syv || 0, dt, posMs);
                    body.x = nx.value;
                    body.y = ny.value;
                    body.sxv = nx.vel;
                    body.syv = ny.vel;
                    body.vx = 0;
                    body.vy = 0;
                    return;
                }
                if (hubGrab) {
                    body.x += hvx * 0.38;
                    body.y += hvy * 0.38;
                }
                const kHome = hubGrab ? 0.055 : (nodeGrab || peerGrab ? 0.07 : 0.14);
                const damp = hubGrab || nodeGrab || peerGrab ? 0.9 : 0.84;
                body.vx = (body.vx || 0) + (body.tx - body.x) * kHome * step;
                body.vy = (body.vy || 0) + (body.ty - body.y) * kHome * step;
                if (peerGrab && peerGrab !== body && peerGrab.x != null) {
                    const bx = body.x - peerGrab.x;
                    const by = body.y - peerGrab.y;
                    const gap = Math.hypot(bx, by);
                    const minGap = ((body.sw || body.w) + (peerGrab.sw || peerGrab.w || 0)) / 2 + 16;
                    if (gap > 0.001 && gap < minGap) {
                        const push = (minGap - gap) * 0.04 * step;
                        body.vx += (bx / gap) * push;
                        body.vy += (by / gap) * push;
                    }
                }
                peerBodies.forEach((other) => {
                    if (other === body || (peerGrab && other.id === peerGrab.id) || other.x == null) return;
                    const bx = body.x - other.x;
                    const by = body.y - other.y;
                    const gap = Math.hypot(bx, by);
                    const minGap = ((body.sw || body.w) + (other.sw || other.w || 0)) / 2 + 18;
                    if (gap > 0.001 && gap < minGap) {
                        const push = (minGap - gap) * 0.04 * step;
                        body.vx += (bx / gap) * push;
                        body.vy += (by / gap) * push;
                    }
                });
                const rest = Math.max(Math.hypot(body.tx - hx, body.ty - hy), 10);
                const ldx = body.x - hx;
                const ldy = body.y - hy;
                const cur = Math.hypot(ldx, ldy);
                if (cur > rest + 6) {
                    const stretch = cur - rest;
                    const kLink = hubGrab || nodeGrab || peerGrab ? 0.16 : 0.11;
                    body.vx -= (ldx / cur) * stretch * kLink * step;
                    body.vy -= (ldy / cur) * stretch * kLink * step;
                }
                body.vx *= Math.pow(damp, step);
                body.vy *= Math.pow(damp, step);
                body.x += body.vx * step;
                body.y += body.vy * step;
                if (!hubGrab && !nodeGrab && !peerGrab && Math.hypot(body.x - body.tx, body.y - body.ty) < 0.45 && Math.hypot(body.vx, body.vy) < 0.2) {
                    body.x = body.tx;
                    body.y = body.ty;
                    body.vx = 0;
                    body.vy = 0;
                }
            });
            resolveLinkedProfileCollisions(hx, hy, zoom, peerGrab);
            paintPeerHubs(hx, hy, zoom);
        }

        function renderLeads(fieldId) {
            const field = FIELDS.find((item) => item.id === fieldId);
            const leadsList = document.getElementById('leadsList');
            const leadsSection = document.getElementById('leadsSection');
            const cautionSection = document.getElementById('cautionSection');
            const value = field ? firstValue(field.id) : '';

            leadsList.innerHTML = '';
            leadsSection.hidden = true;
            cautionSection.hidden = true;
        }

        function escapeHtml(text) {
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        const PROFILE_WEB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>';
        const PROFILE_LINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93"/><path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 1 0 7.07 7.07L14 18.07"/></svg>';
        const PROFILE_ICON_PLATFORMS = { telegram: 'telegram', discord: 'discord', skype: 'skype', signal: 'signal' };
        const PROFILE_PLACE_FIELDS = {
            address: 1, geo: 1, city: 1, country: 1, postal: 1, region: 1,
            neighborhood: 1, landmark: 1, hotel: 1, airport: 1, poi: 1, w3w: 1
        };

        function siteHref(value) {
            const raw = String(value || '').trim();
            if (!raw || /\s/.test(raw)) return '';
            if (/^https?:\/\//i.test(raw)) return raw;
            if (/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw)) return 'https://' + raw.replace(/^\/+/, '');
            return '';
        }

        function phoneHref(value) {
            const digits = String(value || '').replace(/[^\d+]/g, '');
            return digits ? 'tel:' + digits : '';
        }

        function mapsHref(value) {
            const raw = String(value || '').trim();
            return raw ? 'https://www.google.com/maps?q=' + encodeURIComponent(raw) : '';
        }

        function shortenCrypto(value) {
            const raw = String(value || '').trim();
            if (raw.length > 20 && /^[0-9a-zA-Z]+$/.test(raw)) return raw.slice(0, 10) + '…' + raw.slice(-6);
            return raw;
        }

        function cryptoHref(value) {
            const raw = String(value || '').trim();
            if (/^0x[a-fA-F0-9]{40}$/.test(raw)) return 'https://etherscan.io/address/' + raw;
            if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/.test(raw)) {
                return 'https://www.blockchain.com/explorer/search?search=' + encodeURIComponent(raw);
            }
            return '';
        }

        function hostOfHref(url) {
            try {
                return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
            } catch (error) {
                return '';
            }
        }

        function platformFromUrl(url) {
            const host = hostOfHref(url);
            if (!host) return null;
            return PLATFORMS.find((platform) => {
                try {
                    const sample = platform.profile('probe');
                    if (!sample || sample.indexOf('google.com') !== -1) return false;
                    const ph = hostOfHref(sample);
                    return ph && (host === ph || host.endsWith('.' + ph));
                } catch (error) {
                    return false;
                }
            }) || null;
        }

        function isSocialLikeField(field) {
            const base = fieldBase(field.id);
            return base === 'username' || base === 'social' || !!PROFILE_ICON_PLATFORMS[base];
        }

        function isWebIconField(field) {
            const base = fieldBase(field.id);
            return base === 'domain' || base === 'url';
        }

        function impliedPlatform(field, item) {
            if (item && item.platform && platformById(item.platform)) return platformById(item.platform);
            const mapped = PROFILE_ICON_PLATFORMS[fieldBase(field.id)];
            if (mapped) return platformById(mapped);
            const href = siteHref(item && item.value);
            return href ? platformFromUrl(href) : null;
        }

        function socialHref(field, item, platform) {
            const raw = String((item && item.value) || '').trim();
            const site = siteHref(raw);
            if (site && (/^https?:\/\//i.test(raw) || raw.indexOf('.') !== -1)) return site;
            if (platform) return platform.profile(usernameHandle(raw.split('/').pop()));
            return site;
        }

        function skipProfileRow(field, item) {
            const base = fieldBase(field.id);
            return base === 'name' || base === 'image';
        }

        function skipSheetField(field) {
            if (skipProfileRow(field)) return true;
            if (typeof investigatorHidesField === 'function' && investigatorHidesField(field)) return true;
            return false;
        }

        function subjectAddressLines() {
            const street = firstValue('address');
            const city = firstValue('city');
            const region = firstValue('region');
            const postal = firstValue('postal');
            const country = firstValue('country');
            const lines = [];
            if (street) {
                String(street).split(/\n+/).forEach((line) => {
                    const text = line.trim();
                    if (text) lines.push(text);
                });
            }
            const cityLine = [city && region ? city + ', ' + region : (city || region), postal].filter(Boolean).join(' ').trim();
            if (cityLine) {
                const already = lines.some((line) => line.toLowerCase().indexOf(cityLine.toLowerCase()) !== -1);
                if (!already) lines.push(cityLine);
            }
            if (country) {
                const already = lines.some((line) => line.toLowerCase().indexOf(country.toLowerCase()) !== -1);
                if (!already) lines.push(country);
            }
            return lines;
        }

        function mapsQueryForField(fieldId) {
            const live = (typeof fieldInputValue === 'function' ? fieldInputValue(fieldId) : '') || firstValue(fieldId) || '';
            if (fieldBase(fieldId) === 'address') {
                const composed = subjectAddressLines().join(', ');
                return composed || String(live || '').trim();
            }
            return String(live || '').trim();
        }

        function openMapsHref(href) {
            if (!href) return;
            const a = document.createElement('a');
            a.href = href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

        function openFieldMaps(fieldId) {
            openMapsHref(mapsHref(mapsQueryForField(fieldId)));
        }

        function mapsControlHtml(fieldId, className) {
            const href = mapsHref(mapsQueryForField(fieldId));
            const ready = !!href;
            return '<a class="' + className + '" href="' + (ready ? escapeHtml(href) : '#') + '"' +
                (ready ? ' target="_blank" rel="noopener noreferrer"' : ' aria-disabled="true" tabindex="-1"') +
                ' data-open-maps="' + fieldId + '" aria-label="Open in Google Maps" title="Google Maps">' +
                PIN_ICON + '</a>';
        }

        function mapsButtonHtml(fieldId) {
            return mapsControlHtml(fieldId, 'fact-maps');
        }

        function applyMapsControlState(btn, fieldId) {
            if (!btn) return;
            const id = fieldId || btn.dataset.openMaps;
            const href = mapsHref(mapsQueryForField(id));
            if (btn.tagName === 'A') {
                if (href) {
                    btn.href = href;
                    btn.target = '_blank';
                    btn.rel = 'noopener noreferrer';
                    btn.removeAttribute('aria-disabled');
                    btn.removeAttribute('tabindex');
                } else {
                    btn.href = '#';
                    btn.removeAttribute('target');
                    btn.removeAttribute('rel');
                    btn.setAttribute('aria-disabled', 'true');
                    btn.tabIndex = -1;
                }
            } else {
                btn.disabled = !href;
            }
        }

        function ensureMapsThumb(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            if (!isMapsField(fieldId)) return;
            let thumb = node.querySelector('.media-thumb');
            if (!thumb) {
                thumb = document.createElement('button');
                thumb.className = 'media-thumb';
                thumb.type = 'button';
                thumb.dataset.openMedia = fieldId;
                thumb.setAttribute('aria-label', 'Open in Google Maps');
                thumb.title = 'Google Maps';
                thumb.hidden = true;
                const copy = node.querySelector('.node-copy');
                node.insertBefore(thumb, copy || node.firstChild);
            }
            if (typeof setFieldThumb === 'function') setFieldThumb(fieldId);
        }

        function syncMapsButtons(fieldId) {
            const ready = !!mapsQueryForField(fieldId || 'address');
            const placeBase = fieldBase(fieldId);
            const refreshAddress = !fieldId || placeBase === 'address' || placeBase === 'city' || placeBase === 'region' || placeBase === 'postal' || placeBase === 'country';
            document.querySelectorAll('[data-open-maps]').forEach((btn) => {
                const id = btn.dataset.openMaps;
                if (fieldId && id !== fieldId && !(refreshAddress && fieldBase(id) === 'address')) return;
                applyMapsControlState(btn, id);
            });
            if (refreshAddress && typeof setFieldThumb === 'function') {
                const node = document.querySelector('.node[data-field="address"]');
                if (node && node.querySelector('.media-thumb')) setFieldThumb('address');
            }
            if (ready && fieldId && isThumbField(fieldId) && typeof setFieldThumb === 'function') setFieldThumb(fieldId);
        }

        function profileIconCaption(field, item, href) {
            const raw = String((item && item.value) || '').trim();
            if (isSocialLikeField(field)) {
                let handle = usernameHandle(raw);
                if (/^https?:\/\//i.test(raw) || (href && /[./]/.test(raw))) {
                    try {
                        const parts = new URL(href || raw).pathname.replace(/\/+$/, '').split('/').filter(Boolean);
                        if (parts.length) handle = usernameHandle(parts[parts.length - 1]);
                    } catch (error) {}
                }
                handle = usernameHandle(handle.split(/[/?#]/)[0]);
                return handle ? '@' + handle : raw;
            }
            if (href) {
                try {
                    const url = new URL(href);
                    const host = url.hostname.replace(/^www\./, '');
                    const path = url.pathname.replace(/\/+$/, '');
                    if (path && path !== '/') {
                        const full = host + path;
                        return full.length > 40 ? host + path.slice(0, 18) + '…' : full;
                    }
                    return host;
                } catch (error) {
                    return href.replace(/^https?:\/\//i, '').replace(/\/$/, '');
                }
            }
            return raw;
        }

        function collectProfileIcons() {
            const seen = {};
            const icons = [];
            FIELDS.forEach((field) => {
                ((profile.facts && profile.facts[field.id]) || []).forEach((item) => {
                    if (!item || !String(item.value || '').trim()) return;
                    let href = '';
                    let platform = null;
                    let mark = PROFILE_LINK_ICON;
                    let title = String(item.value).trim();
                    if (isSocialLikeField(field)) {
                        platform = impliedPlatform(field, item);
                        href = socialHref(field, item, platform);
                        if (!href) {
                            platform = platform || platformById('other');
                            href = socialHref(field, item, platform);
                        }
                        if (platform) {
                            mark = platformMark(platform);
                            title = platform.label + (usernameHandle(item.value) ? ' @' + usernameHandle(item.value) : '');
                        }
                    } else if (isWebIconField(field)) {
                        href = siteHref(item.value);
                        platform = href ? platformFromUrl(href) : null;
                        mark = platform ? platformMark(platform) : PROFILE_WEB_ICON;
                        title = platform ? platform.label : (href.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'Website');
                    }
                    if (!href) return;
                    const key = href.toLowerCase();
                    if (seen[key]) return;
                    seen[key] = true;
                    icons.push({
                        href: href,
                        mark: mark,
                        title: title,
                        caption: profileIconCaption(field, item, href),
                        fieldId: field.id,
                        value: item.value
                    });
                });
            });
            return icons;
        }

        function profileRowDisplay(field, item) {
            const base = fieldBase(field.id);
            const value = String((item && item.value) || '').trim();
            if (base === 'timezone') {
                const zone = resolveTimezoneValue(value);
                const meta = timezoneMeta(zone);
                const clock = zone ? formatZoneTime(zone) : '';
                const label = (meta && meta.abbr) || value;
                return {
                    text: clock ? label + '  ' + clock : label,
                    href: '',
                    title: (meta && meta.name) || value,
                    wrap: false,
                    zone: zone
                };
            }
            if (base === 'countrycode') {
                const code = resolveCountryCodeValue(value);
                const meta = countryCodeMeta(code);
                return {
                    text: meta ? meta.dial + ' · ' + meta.name : value,
                    href: '',
                    title: meta ? meta.name + ' (' + meta.id + ')' : value,
                    wrap: false,
                    mono: true
                };
            }
            if (base === 'phone' || base === 'phone2' || base === 'fax') {
                return { text: value, href: phoneHref(value), title: value, wrap: false, mono: true };
            }
            if (base === 'email' || base === 'email2') {
                return { text: value, href: value.indexOf('@') !== -1 ? 'mailto:' + value : '', title: value, wrap: true };
            }
            if (PROFILE_PLACE_FIELDS[base]) {
                return { text: value, href: mapsHref(value), title: value, wrap: true };
            }
            if (base === 'crypto') {
                return { text: shortenCrypto(value), href: cryptoHref(value), title: value, wrap: true, mono: true };
            }
            if (base === 'ip' || base === 'mac' || base === 'vin' || base === 'plate' || base === 'imei' || base === 'uuid') {
                const href = base === 'ip' ? 'https://ipinfo.io/' + encodeURIComponent(value) : '';
                return { text: value, href: href, title: value, wrap: true, mono: true };
            }
            if (base === 'record') {
                return { text: value, href: '', title: value, wrap: true, mono: true };
            }
            if (base === 'audio' || base === 'video' || base === 'screenshot') {
                return { text: field.label, href: siteHref(value), title: value, wrap: false };
            }
            if (isSecretField(field.id)) {
                const open = secretIsOpen(field.id);
                const dots = Array(Math.min(14, Math.max(6, value.length)) + 1).join('•');
                return {
                    text: open ? value : dots,
                    href: '',
                    title: open ? value : 'Hidden',
                    wrap: false,
                    secret: true,
                    revealed: open,
                    key: field.id
                };
            }
            if (base === 'notes' || base === 'bio' || base === 'quote' || base === 'appearance') {
                return { text: value, href: siteHref(value), title: value, wrap: true };
            }
            const href = siteHref(value);
            return { text: href ? value.replace(/^https?:\/\//i, '').replace(/\/$/, '') : value, href: href, title: value, wrap: value.length > 42 };
        }

        const EYE_OPEN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
        const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.7a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.3 4.4"/><path d="M6.1 6.1C3.8 7.8 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.4-.9"/></svg>';

        function setSecretRevealButton(btn, open, fieldId) {
            if (!btn) return;
            btn.innerHTML = open ? EYE_OFF_ICON : EYE_OPEN_ICON;
            btn.setAttribute('aria-label', secretAriaLabel(fieldId, open));
            btn.title = open ? 'Hide' : 'Show';
            btn.classList.toggle('open', !!open);
        }

        function secretRevealBtnHtml(fieldId) {
            return '<button class="secret-reveal" type="button" data-secret-reveal="' + fieldId + '" aria-label="' + escapeHtml(secretAriaLabel(fieldId, false)) + '" title="Show">' + EYE_OPEN_ICON + '</button>';
        }

        function ensureSecretControls(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            const secret = isSecretField(fieldId);
            node.classList.toggle('secret-node', secret);
            let btn = node.querySelector('.secret-reveal');
            if (!secret) {
                if (btn) btn.remove();
                const input = document.getElementById('field-' + fieldId);
                if (input && input.type === 'password') input.type = 'text';
                return;
            }
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'secret-reveal';
                btn.type = 'button';
                btn.dataset.secretReveal = fieldId;
                const search = node.querySelector('.search-btn');
                if (search && search.parentNode) search.parentNode.insertBefore(btn, search);
                else {
                    const copy = node.querySelector('.node-copy');
                    if (copy) copy.appendChild(btn);
                }
            }
            syncSecretNode(node);
        }

        function syncSecretNode(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            if (!isSecretField(fieldId)) return;
            const btn = node.querySelector('.secret-reveal');
            const input = document.getElementById('field-' + fieldId);
            const open = secretIsOpen(fieldId);
            if (input) {
                const next = open ? 'text' : 'password';
                if (input.type !== next && input.type !== 'hidden') input.type = next;
            }
            setSecretRevealButton(btn, open, fieldId);
            if (btn) btn.hidden = !!(input && input.hidden);
        }

        function applySecretReveal(fieldId) {
            if (!fieldId) return;
            const open = secretIsOpen(fieldId);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) syncSecretNode(node);
            const sheet = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]');
            if (sheet && sheet.tagName === 'INPUT') {
                const next = open ? 'text' : 'password';
                if (sheet.type !== next) {
                    const start = sheet.selectionStart;
                    const end = sheet.selectionEnd;
                    sheet.type = next;
                    try {
                        if (document.activeElement === sheet) sheet.setSelectionRange(start, end);
                    } catch (error) {}
                }
            }
            document.querySelectorAll('[data-secret-reveal="' + fieldId + '"]').forEach((btn) => {
                setSecretRevealButton(btn, open, fieldId);
            });
            if (phoneFieldId === fieldId) syncPhoneField();
        }

        function toggleSecretReveal(fieldId) {
            if (!fieldId) return;
            if (revealedPasswords.has(fieldId)) revealedPasswords.delete(fieldId);
            else revealedPasswords.add(fieldId);
            applySecretReveal(fieldId);
        }

        function profileFactRowHtml(field, item) {
            const shown = profileRowDisplay(field, item);
            const platform = item && item.platform && platformById(item.platform);
            const label = (isSocialLikeField(field) && platform) ? platform.label : field.label;
            const inner = shown.href
                ? '<a href="' + escapeHtml(shown.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(shown.text) + '</a>'
                : escapeHtml(shown.text);
            const tzAttr = shown.zone ? ' data-profile-tz="' + escapeHtml(shown.zone) + '"' : '';
            const reveal = shown.secret
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, shown.revealed)) + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            const find = isPhone()
                ? '<button type="button" class="fact-find ready" data-search-field="' + field.id + '" aria-label="Search deeper" title="Search deeper">' + DEEP_ICON + '</button>'
                : '';
            const wrap = shown.wrap || String(shown.text || '').length > 28;
            return '<div class="fact-row' + (activeField === field.id ? ' active' : '') + (wrap ? ' wrap' : '') + (shown.secret ? ' secret' : '') + (shown.mono ? ' mono' : '') + '" data-focus="' + field.id + '">' +
                '<span class="fact-label">' + escapeHtml(label) + '</span>' +
                '<em class="fact-value" title="' + escapeHtml(shown.title) + '"' + tzAttr + '>' + inner + '</em>' +
                '<div class="fact-tools">' +
                    reveal +
                    find +
                    '<button type="button" data-remove="' + field.id + '" data-value="' + encodeURIComponent(item.value) + '" aria-label="Remove">×</button>' +
                '</div></div>';
        }

        function phoneFactRowHtml(field, item) {
            if (!item) {
                return '<div class="phone-row empty" data-focus="' + field.id + '">' +
                    '<div class="phone-row-text">' +
                        '<span class="phone-row-label">' + escapeHtml(field.label) + '</span>' +
                        '<em class="phone-row-value">Not filed</em>' +
                    '</div>' +
                    '<div class="phone-row-tools">' +
                        '<button type="button" class="phone-row-find" data-search-field="' + field.id + '" aria-label="How to find this" title="How to find this">' + FIND_ICON + '</button>' +
                    '</div>' +
                '</div>';
            }
            const shown = profileRowDisplay(field, item);
            const inner = shown.href
                ? '<a href="' + escapeHtml(shown.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(shown.text) + '</a>'
                : escapeHtml(shown.text);
            const tzAttr = shown.zone ? ' data-profile-tz="' + escapeHtml(shown.zone) + '"' : '';
            const reveal = shown.secret
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, shown.revealed)) + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            return '<div class="phone-row' + (activeField === field.id ? ' active' : '') + (shown.secret ? ' secret' : '') + '" data-focus="' + field.id + '">' +
                '<div class="phone-row-text">' +
                    '<span class="phone-row-label">' + escapeHtml(field.label) + '</span>' +
                    '<em class="phone-row-value" title="' + escapeHtml(shown.title) + '"' + tzAttr + '>' + inner + '</em>' +
                '</div>' +
                '<div class="phone-row-tools">' +
                    reveal +
                    '<button type="button" class="phone-row-find ready" data-search-field="' + field.id + '" aria-label="Search deeper" title="Search deeper">' + DEEP_ICON + '</button>' +
                    '<button type="button" class="phone-row-remove" data-remove="' + field.id + '" data-value="' + encodeURIComponent(item.value) + '" aria-label="Remove">×</button>' +
                '</div></div>';
        }

        let phoneFieldId = '';

        function closePhoneField() {
            hideSheet(document.getElementById('phoneField'));
            phoneFieldId = '';
        }

        function closePhoneMore() {
            hideSheet(document.getElementById('phoneMore'));
        }

        function syncPhoneField() {
            if (!phoneFieldId) return;
            const field = fieldById(phoneFieldId);
            const input = document.getElementById('field-' + phoneFieldId);
            const node = document.querySelector('.node[data-field="' + phoneFieldId + '"]');
            const title = document.getElementById('phoneFieldTitle');
            const editor = document.getElementById('phoneFieldInput');
            const platBtn = document.getElementById('phonePlatformBtn');
            const tzBtn = document.getElementById('phoneTzBtn');
            const ccBtn = document.getElementById('phoneCcBtn');
            const upload = document.getElementById('phoneFieldUpload');
            const reveal = document.getElementById('phoneReveal');
            const mapsBtn = document.getElementById('phoneMaps');
            const fact = latestFact(phoneFieldId);
            const platformId = fieldPlatformId(phoneFieldId);
            const platformField = isPlatformField(phoneFieldId);
            const tz = fieldBase(phoneFieldId) === 'timezone';
            const cc = fieldBase(phoneFieldId) === 'countrycode';
            const img = fieldBase(phoneFieldId) === 'image';
            const needsPlatform = platformField && !platformId;
            if (title && field) title.textContent = field.label;
            if (platBtn) {
                platBtn.hidden = !needsPlatform;
                platBtn.textContent = 'Select site';
            }
            if (tzBtn) {
                tzBtn.hidden = !tz;
                const abbr = node && node.querySelector('.tz-abbr');
                tzBtn.textContent = (abbr && abbr.textContent && abbr.textContent !== 'Zone') ? abbr.textContent : 'Choose timezone';
            }
            if (ccBtn) {
                ccBtn.hidden = !cc;
                const meta = countryCodeMeta((input && input.value) || firstValue(phoneFieldId));
                const flag = meta ? countryFlagEmoji(meta.id) : '';
                ccBtn.textContent = meta ? [flag, meta.name, meta.dial].filter(Boolean).join('  ') : 'Choose country';
            }
            if (editor) {
                editor.hidden = tz || cc || needsPlatform || img;
                if (input && document.activeElement !== editor) editor.value = input.value || '';
                editor.placeholder = field ? (field.placeholder || 'Value') : 'Value';
                editor.inputMode = fieldBase(phoneFieldId) === 'phone' ? 'tel' : 'text';
                const hideSecret = isSecretField(phoneFieldId) && !secretIsOpen(phoneFieldId);
                editor.type = hideSecret ? 'password' : 'text';
            }
            if (reveal) {
                const show = isSecretField(phoneFieldId) && !needsPlatform;
                reveal.hidden = !show;
                const open = secretIsOpen(phoneFieldId);
                setSecretRevealButton(reveal, open, phoneFieldId);
            }
            if (mapsBtn) {
                const showMaps = isMapsField(phoneFieldId) && !needsPlatform;
                mapsBtn.hidden = !showMaps;
                applyMapsControlState(mapsBtn, phoneFieldId);
                mapsBtn.innerHTML = PIN_ICON;
            }
            if (upload) {
                if (img) {
                    upload.hidden = false;
                    upload.textContent = 'Add';
                } else {
                    upload.hidden = !(field && field.file);
                    upload.textContent = 'Upload';
                }
            }
            syncPhoneFindIcon();
            renderPhoneLeads(phoneFieldId);
        }

        function syncPhoneFindIcon() {
            const btn = document.getElementById('phoneFieldSearch');
            if (!btn || !phoneFieldId) return;
            const filled = !!fieldInputValue(phoneFieldId);
            btn.innerHTML = filled ? DEEP_ICON : FIND_ICON;
            btn.classList.toggle('ready', filled);
            btn.setAttribute('aria-label', filled ? 'Search deeper' : 'How to find this');
            btn.title = filled ? 'Search deeper' : 'How to find this';
        }

        function renderPhoneLeads(fieldId) {
            const box = document.getElementById('phoneLeads');
            const field = fieldById(fieldId);
            if (!box) return;
            if (!field) {
                box.innerHTML = '';
                return;
            }
            const value = fieldInputValue(fieldId);
            const filled = !!value;
            const pack = mergeToolkitLeads(fieldId, searchLinks(fieldId));
            const core = pack.links.slice(0, pack.extraStart);
            const extra = pack.links.slice(pack.extraStart);
            box.innerHTML =
                '<div class="phone-leads-title">' + (filled ? 'Search deeper' : 'How to find this') + '</div>' +
                '<p class="phone-leads-note">' +
                (filled
                    ? (fieldId === 'image' ? 'Searches the photo itself, not the file name.' : 'Opens with this value filled in. Copied for sites that need a paste.')
                    : 'Public sources where a ' + escapeHtml(field.label.toLowerCase()) + ' usually appears.') +
                (field.caution ? ' ' + escapeHtml(field.caution) : '') +
                '</p>' +
                core.map((item) => (
                    '<button type="button" data-open-lead="' + escapeHtml(item[2] || item[1]) + '" data-lead-mode="' + escapeHtml(item[3] || '') + '">' +
                    escapeHtml(item[0]) + '</button>'
                )).join('') +
                (extra.length ? '<div class="phone-leads-title">More OSINT tools</div>' + extra.map((item) => (
                    '<button type="button" data-open-lead="' + escapeHtml(item[2] || item[1]) + '" data-lead-mode="' + escapeHtml(item[3] || '') + '">' +
                    escapeHtml(item[0]) + '</button>'
                )).join('') : '') +
                toolkitBrowseButton(fieldId, pack.extraTotal);
        }

        function openPhoneField(id) {
            phoneFieldId = id;
            activeField = id;
            const sheet = document.getElementById('phoneField');
            showSheet(sheet);
            closePhoneMore();
            syncPhoneField();
            const editor = document.getElementById('phoneFieldInput');
            if (editor && !editor.hidden) setTimeout(function () { editor.focus(); }, 40);
            renderProfile();
        }

        function writePhoneField() {
            const editor = document.getElementById('phoneFieldInput');
            const input = document.getElementById('field-' + phoneFieldId);
            if (!editor || !input || editor.hidden) return;
            input.hidden = false;
            input.value = editor.value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';

        function platformForEmailDomain(domain) {
            let host = String(domain || '').toLowerCase();
            while (host) {
                if (Object.prototype.hasOwnProperty.call(EMAIL_DOMAIN_PLATFORMS, host)) {
                    return EMAIL_DOMAIN_PLATFORMS[host] || '';
                }
                const fromUrl = platformFromUrl('https://' + host);
                if (fromUrl) return fromUrl.id;
                const dot = host.indexOf('.');
                if (dot === -1) break;
                host = host.slice(dot + 1);
                if (host.indexOf('.') === -1) break;
            }
            return '';
        }

        function setEmailIcon(node, value) {
            if (!node) return;
            let icon = node.querySelector('.platform-icon');
            if (!icon) {
                icon = document.createElement('span');
                icon.className = 'platform-icon';
                icon.hidden = true;
                node.insertBefore(icon, node.firstChild);
            }
            const domain = emailDomain(value);
            if (!domain || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(domain)) {
                node.dataset.emailDomain = '';
                setPlatformIcon(node, '');
                return;
            }
            if (node.dataset.emailDomain === domain) return;
            node.dataset.emailDomain = domain;
            const platformId = platformForEmailDomain(domain);
            if (platformId) {
                setPlatformIcon(node, platformId);
                return;
            }
            icon.innerHTML = '<img class="platform-logo" src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64" alt="" width="18" height="18">';
            icon.hidden = false;
            icon.style.color = '';
            node.classList.add('has-platform');
            const img = icon.querySelector('img');
            if (img) {
                img.addEventListener('error', () => {
                    if (node.dataset.emailDomain !== domain) return;
                    icon.innerHTML = MAIL_ICON;
                });
            }
        }

        function setPlatformIcon(node, platformId) {
            const icon = node.querySelector('.platform-icon');
            const platform = platformById(platformId);
            if (!icon) return;
            if (!platform) {
                icon.innerHTML = '';
                icon.hidden = true;
                icon.style.color = '';
                node.classList.remove('has-platform');
                return;
            }
            icon.innerHTML = platformMark(platform);
            icon.style.color = platform.color;
            icon.hidden = false;
            node.classList.add('has-platform');
        }

        function setUsernameStep(node, platformId, filled) {
            if (!node) return;
            const fieldId = node.dataset.field;
            const trigger = node.querySelector('.platform-trigger');
            const input = document.getElementById('field-' + fieldId);
            if (!trigger || !input) return;
            const platform = platformById(platformId) || platformById(fieldPlatformId(fieldId));
            node.dataset.platform = platform ? platform.id : '';
            setPlatformIcon(node, node.dataset.platform);
            if (!platform) {
                trigger.hidden = false;
                trigger.textContent = 'Select site';
                input.hidden = true;
            } else {
                const secret = isSecretField(fieldId);
                trigger.hidden = true;
                input.hidden = false;
                if (!filled) input.placeholder = secret ? platformFieldPlaceholder(fieldId) : '@username';
                input.setAttribute('aria-label', platform.label + (secret ? ' password' : ' username'));
            }
            if (isSecretField(fieldId)) syncSecretNode(node);
            syncSheetPlatform(fieldId);
        }

        function syncSheetPlatform(fieldId) {
            if (!isPlatformField(fieldId)) return;
            const row = document.querySelector('#factsList [data-focus="' + fieldId + '"]');
            if (!row) return;
            const pick = row.querySelector('.sheet-platform');
            const wrap = row.querySelector('.sheet-platform-value');
            let mark = row.querySelector('.sheet-platform-mark');
            const input = row.querySelector('[data-sheet-field]');
            const platform = platformById(fieldPlatformId(fieldId));
            if (wrap && !mark) {
                mark = document.createElement('button');
                mark.type = 'button';
                mark.className = 'sheet-platform-mark';
                mark.setAttribute('data-sheet-platform', fieldId);
                mark.title = 'Change site';
                mark.setAttribute('aria-label', 'Change site');
                wrap.insertBefore(mark, wrap.firstChild);
            }
            if (pick) {
                pick.hidden = !!platform;
                pick.textContent = 'Select site';
            }
            if (wrap) wrap.hidden = !platform;
            if (mark) {
                if (platform) {
                    mark.innerHTML = platformMark(platform);
                    mark.title = 'Change site · ' + platform.label;
                    mark.setAttribute('aria-label', 'Change site');
                    mark.hidden = false;
                } else {
                    mark.hidden = true;
                    mark.innerHTML = '';
                }
            }
            if (input) input.hidden = !platform;
        }

        let platformMenuAnchor = null;

        function restorePlatformMenuHost() {
            const menu = document.getElementById('platformMenu');
            const stage = document.getElementById('mapStage');
            if (!menu) return;
            menu.style.position = '';
            menu.style.left = '';
            menu.style.top = '';
            menu.style.zIndex = '';
            if (stage && menu.parentNode !== stage) stage.appendChild(menu);
        }

        function closePlatformMenu() {
            const menu = document.getElementById('platformMenu');
            platformMenuAnchor = null;
            if (menu) {
                menu.hidden = true;
                menu.classList.remove('is-sheet');
            }
            document.querySelectorAll('.node.menu-open:not(.tz-open)').forEach((node) => node.classList.remove('menu-open'));
            document.querySelectorAll('[data-sheet-platform].is-open').forEach((el) => el.classList.remove('is-open'));
            restorePlatformMenuHost();
        }

        function closeTimezoneMenu() {
            const menu = document.getElementById('tzMenu');
            if (menu) menu.hidden = true;
            document.querySelectorAll('.node.tz-open').forEach((node) => node.classList.remove('tz-open', 'menu-open'));
        }

        function placeTimezoneMenu() {
            const menu = document.getElementById('tzMenu');
            const node = document.querySelector('.node.tz-open');
            const stage = document.getElementById('mapStage');
            if (!menu || menu.hidden || !node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 312);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function timezoneMenuHtml(selected) {
            const groups = [];
            const seen = {};
            TIMEZONES.forEach((zone) => {
                if (!seen[zone.group]) {
                    seen[zone.group] = [];
                    groups.push(zone.group);
                }
                seen[zone.group].push(zone);
            });
            return '<div class="tz-menu-title">Timezone</div>' +
                '<input class="tz-search" type="search" placeholder="Search PST, Tokyo, UTC…" spellcheck="false">' +
                '<div class="tz-list" role="listbox">' +
                groups.map((group) => (
                    '<div class="tz-group">' +
                    '<div class="tz-group-label">' + escapeHtml(group) + '</div>' +
                    seen[group].map((zone) => {
                        const search = [zone.abbr, zone.name, zone.id, zone.group].concat(zone.aliases || []).join(' ').toLowerCase();
                        return '<button class="tz-option' + (zone.id === selected ? ' selected' : '') + '" type="button" role="option" data-pick-tz="' +
                            escapeHtml(zone.id) + '" data-search="' + escapeHtml(search) + '">' +
                            '<span class="tz-option-main"><strong>' + escapeHtml(zone.abbr) + '</strong><em>' + escapeHtml(zone.name) + '</em></span>' +
                            '<span class="tz-option-meta"><b>' + escapeHtml(formatZoneTimeShort(zone.id)) + '</b><i>' + escapeHtml(formatZoneOffset(zone.id)) + '</i></span>' +
                            '</button>';
                    }).join('') +
                    '</div>'
                )).join('') +
                '</div>';
        }

        function filterTimezoneMenu(query) {
            const menu = document.getElementById('tzMenu');
            if (!menu) return;
            const q = String(query || '').trim().toLowerCase();
            menu.querySelectorAll('.tz-option').forEach((option) => {
                option.classList.toggle('hidden', !!(q && option.dataset.search.indexOf(q) === -1));
                option.classList.remove('active');
            });
            menu.querySelectorAll('.tz-group').forEach((group) => {
                group.hidden = !group.querySelector('.tz-option:not(.hidden)');
            });
        }

        function applyTimezonePick(fieldId, zoneId) {
            const input = document.getElementById('field-' + fieldId);
            if (!input) return;
            input.value = zoneId || '';
            if (zoneId && isNullField(fieldId)) setFieldNull(fieldId, false, true);
            syncNodeFilled(input);
            saveInputAsIs(input);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) syncTimezoneTrigger(node);
            updateTimezoneClocks();
            closeTimezoneMenu();
        }

        function openTimezoneMenu(node) {
            const menu = document.getElementById('tzMenu');
            const fieldId = node && node.dataset.field;
            if (!menu || !fieldId) return;
            closeSearchMenu();
            closePlatformMenu();
            closeCountryCodeMenu();
            closeFieldMenu();
            const input = document.getElementById('field-' + fieldId);
            const selected = resolveTimezoneValue((input && input.value) || firstValue(fieldId));
            menu.innerHTML = timezoneMenuHtml(selected);
            menu.dataset.field = fieldId;
            menu.hidden = false;
            node.classList.add('tz-open', 'menu-open');
            placeTimezoneMenu();
            const selectedBtn = menu.querySelector('.tz-option.selected');
            if (selectedBtn) selectedBtn.scrollIntoView({ block: 'nearest' });
            const search = menu.querySelector('.tz-search');
            if (search) {
                search.addEventListener('input', () => filterTimezoneMenu(search.value));
                search.addEventListener('keydown', (event) => {
                    const options = Array.from(menu.querySelectorAll('.tz-option:not(.hidden)'));
                    if (!options.length) return;
                    const current = menu.querySelector('.tz-option.active') || menu.querySelector('.tz-option.selected');
                    let index = options.indexOf(current);
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (index < 0) index = event.key === 'ArrowDown' ? -1 : 0;
                        index = event.key === 'ArrowDown' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
                        options.forEach((option) => option.classList.remove('active'));
                        options[index].classList.add('active');
                        options[index].scrollIntoView({ block: 'nearest' });
                        return;
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const pick = menu.querySelector('.tz-option.active') || options[0];
                        if (pick) applyTimezonePick(fieldId, pick.dataset.pickTz);
                        return;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        closeTimezoneMenu();
                    }
                });
                search.focus();
            }
        }

        function placePlatformMenu() {
            const menu = document.getElementById('platformMenu');
            if (!menu || menu.hidden) return;
            const stage = document.getElementById('mapStage');
            const node = document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const el = platformMenuAnchor || document.querySelector('[data-sheet-platform].is-open') || node;
            if (!el) return;
            const sheet = !!(el.closest && el.closest('#profilePanel, #factsList, .profile-panel, .phone-sheet, .phone-bar'));
            if (sheet || (stage && !stage.contains(el))) {
                if (menu.parentNode !== document.body) document.body.appendChild(menu);
                const r = el.getBoundingClientRect();
                const w = menu.offsetWidth || 260;
                const h = menu.offsetHeight || 280;
                let left = r.left;
                let top = r.bottom + 6;
                if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
                if (left < 8) left = 8;
                if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
                menu.classList.add('is-sheet');
                menu.style.position = 'fixed';
                menu.style.zIndex = '90';
                menu.style.left = left + 'px';
                menu.style.top = top + 'px';
                return;
            }
            restorePlatformMenuHost();
            menu.classList.remove('is-sheet');
            if (!node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 272);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function platformOptionHtml(item) {
            return '<button class="platform-option" type="button" data-pick-platform="' + escapeHtml(item.id) + '" data-label="' + escapeHtml(item.label.toLowerCase()) + '">' +
                platformMark(item) +
                escapeHtml(item.label) + '</button>';
        }

        function filterPlatformMenu(query) {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            const q = String(query || '').trim().toLowerCase();
            menu.querySelectorAll('.platform-option[data-pick-platform]').forEach((option) => {
                option.classList.toggle('hidden', !!(q && String(option.dataset.label || '').indexOf(q) === -1));
            });
            const match = menu.querySelector('[data-pick-custom]');
            if (match) {
                const exact = listedPlatforms().some((item) => item.label.toLowerCase() === q);
                match.hidden = !q || exact;
                match.dataset.pickCustom = String(query || '').trim();
                const label = match.querySelector('em');
                if (label) label.textContent = String(query || '').trim();
            }
        }

        function applyPlatformChoice(fieldId, platformId) {
            if (!fieldId || !platformId) return;
            const node = document.querySelector('.node[data-field="' + fieldId + '"]') || document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const input = document.getElementById('field-' + fieldId);
            const sheetInput = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]');
            const filled = !!(
                (input && String(input.value || '').trim()) ||
                (sheetInput && String(sheetInput.value || '').trim())
            );
            setFieldPlatform(fieldId, platformId);
            if (node) setUsernameStep(node, platformId, filled);
            else syncSheetPlatform(fieldId);
            if (filled && input) saveInputAsIs(input);
            if (isPhone()) syncPhoneField();
            closePlatformMenu();
            activeField = fieldId;
            renderProfile();
            recordHistory(false);
            const next = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]') || input;
            if (next) next.focus();
        }

        function applyCustomPlatformPick(label) {
            const menu = document.getElementById('platformMenu');
            const node = document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const fieldId = (node && node.dataset.field) || (menu && menu.dataset.field);
            const platform = makeCustomPlatform(label);
            if (!platform || !fieldId) return false;
            applyPlatformChoice(fieldId, platform.id);
            return true;
        }

        function openPlatformMenu(target, anchor) {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            const fieldId = (typeof target === 'string')
                ? target
                : ((target && target.dataset && target.dataset.field) ||
                    (anchor && (anchor.getAttribute('data-sheet-platform') || (anchor.dataset && anchor.dataset.sheetPlatform))) ||
                    '');
            if (!fieldId) return;
            const node = (target && target.classList && target.classList.contains('node'))
                ? target
                : document.querySelector('.node[data-field="' + fieldId + '"]');
            closeSearchMenu();
            closeTimezoneMenu();
            closeCountryCodeMenu();
            closeFieldMenu();
            const platforms = listedPlatforms();
            menu.innerHTML = '<div class="platform-menu-title">Select a site</div>' +
                '<input class="platform-search" type="search" placeholder="Search or type a site" spellcheck="false">' +
                '<form class="platform-custom" id="platformCustomForm">' +
                    '<input class="platform-custom-input" type="text" maxlength="48" placeholder="Not listed? Type it here" spellcheck="false" autocomplete="off">' +
                    '<button type="submit">Use</button>' +
                '</form>' +
                '<div class="platform-list">' +
                    '<button class="platform-option custom-add" type="button" data-pick-custom hidden>' +
                        '<span class="platform-letter">+</span>Use “<em></em>”' +
                    '</button>' +
                    platforms.map(platformOptionHtml).join('') +
                '</div>';
            menu.dataset.field = fieldId;
            menu.hidden = false;
            document.querySelectorAll('.node.menu-open:not(.tz-open)').forEach((item) => {
                if (item !== node) item.classList.remove('menu-open');
            });
            document.querySelectorAll('[data-sheet-platform].is-open').forEach((item) => item.classList.remove('is-open'));
            if (node) node.classList.add('menu-open');
            platformMenuAnchor = anchor || target || node;
            if (platformMenuAnchor && platformMenuAnchor.classList) platformMenuAnchor.classList.add('is-open');
            placePlatformMenu();
            const search = menu.querySelector('.platform-search');
            const form = menu.querySelector('#platformCustomForm');
            const customInput = menu.querySelector('.platform-custom-input');
            if (search) {
                search.addEventListener('input', () => {
                    filterPlatformMenu(search.value);
                    if (customInput && document.activeElement !== customInput) customInput.value = search.value;
                });
                search.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const visible = Array.from(menu.querySelectorAll('.platform-option[data-pick-platform]:not(.hidden)'));
                    const q = search.value.trim();
                    if (visible.length === 1) visible[0].click();
                    else if (q) applyCustomPlatformPick(q);
                });
                search.focus();
            }
            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const value = (customInput && customInput.value) || (search && search.value) || '';
                    applyCustomPlatformPick(value);
                });
            }
        }

        function closeCountryCodeMenu() {
            const menu = document.getElementById('ccMenu');
            if (menu) menu.hidden = true;
            document.querySelectorAll('.node.cc-open').forEach((node) => node.classList.remove('cc-open', 'menu-open'));
        }

        function placeCountryCodeMenu() {
            const menu = document.getElementById('ccMenu');
            const node = document.querySelector('.node.cc-open');
            const stage = document.getElementById('mapStage');
            if (!menu || menu.hidden || !node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 312);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function countryCodeMenuHtml(selected) {
            const groups = [];
            const seen = {};
            COUNTRY_CODES.forEach((item) => {
                if (!seen[item.group]) {
                    seen[item.group] = [];
                    groups.push(item.group);
                }
                seen[item.group].push(item);
            });
            return '<div class="tz-menu-title">Country code</div>' +
                '<input class="tz-search" type="search" placeholder="Search US, +44, Japan…" spellcheck="false">' +
                '<div class="tz-list" role="listbox">' +
                groups.map((group) => (
                    '<div class="tz-group">' +
                    '<div class="tz-group-label">' + escapeHtml(group) + '</div>' +
                    seen[group].map((item) => {
                        const search = [item.dial, item.name, item.id, item.group].concat(item.aliases || []).join(' ').toLowerCase();
                        const flag = countryFlagEmoji(item.id);
                        return '<button class="tz-option cc-option' + (item.id === selected ? ' selected' : '') + '" type="button" role="option" data-pick-cc="' +
                            escapeHtml(item.id) + '" data-search="' + escapeHtml(search) + '">' +
                            '<span class="cc-option-flag" aria-hidden="true">' + escapeHtml(flag) + '</span>' +
                            '<span class="tz-option-main"><strong>' + escapeHtml(item.name) + '</strong></span>' +
                            '<span class="tz-option-meta"><b>' + escapeHtml(item.dial) + '</b></span>' +
                            '</button>';
                    }).join('') +
                    '</div>'
                )).join('') +
                '</div>';
        }

        function filterCountryCodeMenu(query) {
            const menu = document.getElementById('ccMenu');
            if (!menu) return;
            const q = String(query || '').trim().toLowerCase();
            menu.querySelectorAll('.tz-option').forEach((option) => {
                option.classList.toggle('hidden', !!(q && option.dataset.search.indexOf(q) === -1));
                option.classList.remove('active');
            });
            menu.querySelectorAll('.tz-group').forEach((group) => {
                group.hidden = !group.querySelector('.tz-option:not(.hidden)');
            });
        }

        function applyCountryCodePick(fieldId, codeId) {
            const input = document.getElementById('field-' + fieldId);
            if (!input) return;
            input.value = codeId || '';
            if (codeId && isNullField(fieldId)) setFieldNull(fieldId, false, true);
            syncNodeFilled(input);
            saveInputAsIs(input);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) syncCountryCodeTrigger(node);
            closeCountryCodeMenu();
            if (isPhone()) syncPhoneField();
        }

        function openCountryCodeMenu(node) {
            const menu = document.getElementById('ccMenu');
            const fieldId = node && node.dataset.field;
            if (!menu || !fieldId) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            const input = document.getElementById('field-' + fieldId);
            const selected = resolveCountryCodeValue((input && input.value) || firstValue(fieldId));
            menu.innerHTML = countryCodeMenuHtml(selected);
            menu.dataset.field = fieldId;
            menu.hidden = false;
            node.classList.add('cc-open', 'menu-open');
            placeCountryCodeMenu();
            const selectedBtn = menu.querySelector('.tz-option.selected');
            if (selectedBtn) selectedBtn.scrollIntoView({ block: 'nearest' });
            const search = menu.querySelector('.tz-search');
            if (search) {
                search.addEventListener('input', () => filterCountryCodeMenu(search.value));
                search.addEventListener('keydown', (event) => {
                    const options = Array.from(menu.querySelectorAll('.tz-option:not(.hidden)'));
                    if (!options.length) return;
                    const current = menu.querySelector('.tz-option.active') || menu.querySelector('.tz-option.selected');
                    let index = options.indexOf(current);
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (index < 0) index = event.key === 'ArrowDown' ? -1 : 0;
                        index = event.key === 'ArrowDown' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
                        options.forEach((option) => option.classList.remove('active'));
                        options[index].classList.add('active');
                        options[index].scrollIntoView({ block: 'nearest' });
                        return;
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const pick = menu.querySelector('.tz-option.active') || options[0];
                        if (pick) applyCountryCodePick(fieldId, pick.dataset.pickCc);
                        return;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        closeCountryCodeMenu();
                    }
                });
                search.focus();
            }
        }
