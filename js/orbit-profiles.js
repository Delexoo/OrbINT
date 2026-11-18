/* Profile rail, create, rename, import, export */

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

        let profileUndo = null;

        function hideProfileUndo() {
            const toast = document.getElementById('undoToast');
            if (toast) toast.hidden = true;
        }

        function commitProfileDelete() {
            const held = profileUndo;
            profileUndo = null;
            hideProfileUndo();
            if (!held) return;
            deleteProfileEntry(held.id);
            pruneProfileLinks(held.id);
            const layer = document.getElementById('peerHubs');
            if (layer) delete layer.dataset.stamp;
            if (typeof peerBodies !== 'undefined' && Array.isArray(peerBodies)) {
                peerBodies = peerBodies.filter((body) => body && body.id !== held.id);
            }
        }

        function undoProfileDelete() {
            const held = profileUndo;
            if (!held || !profileLibrary) return;
            clearTimeout(held.timer);
            profileUndo = null;
            hideProfileUndo();
            profileLibrary.items[held.id] = held.entry;
            const at = Math.max(0, Math.min(held.at, profileLibrary.order.length));
            if (profileLibrary.order.indexOf(held.id) < 0) profileLibrary.order.splice(at, 0, held.id);
            if (held.wasActive) {
                profileLibrary.activeId = held.id;
                saveProfileIndex();
                applyWorkspace(held.entry);
            } else {
                saveProfileIndex();
                if (typeof renderPeerHubs === 'function') renderPeerHubs();
                if (typeof positionPeerHubs === 'function') positionPeerHubs();
            }
            renderProfileRail();
        }

        function deleteProfile(id) {
            if (!profileLibrary || !id || profileLibrary.order.length < 2) return;
            if (profileUndo) commitProfileDelete();
            const at = profileLibrary.order.indexOf(id);
            if (at < 0) return;
            const wasActive = profileLibrary.activeId === id;
            const entry = profileLibrary.items[id];
            profileLibrary.order.splice(at, 1);
            delete profileLibrary.items[id];
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
            const toast = document.getElementById('undoToast');
            const text = document.getElementById('undoToastText');
            const name = (entry && (entry.title || entry.name)) || 'Profile';
            if (text) text.textContent = name + ' removed.';
            if (toast) toast.hidden = false;
            const timer = setTimeout(commitProfileDelete, 8000);
            let copy = entry;
            try { copy = JSON.parse(JSON.stringify(entry)); } catch (error) {}
            profileUndo = { id: id, at: at, entry: copy, wasActive: wasActive, timer: timer };
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

