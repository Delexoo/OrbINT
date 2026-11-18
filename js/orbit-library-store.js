/* Profile library storage, links, and workspace restore */
        const history = { past: [], future: [], applying: false, timer: 0 };

        function snapshotProfile() {
            return {
                analysis: profile.analysis || '',
                facts: slimFactsForStorage(profile.facts || emptyFacts()),
                nulls: Array.isArray(profile.nulls) ? profile.nulls.slice() : [],
                missing: Array.isArray(profile.nulls) ? profile.nulls.slice() : [],
                customPlatforms: Array.isArray(profile.customPlatforms) ? profile.customPlatforms.slice() : [],
                case: Object.assign({}, emptyCaseMeta(), profile.case || {}),
                audit: Array.isArray(profile.audit) ? profile.audit.slice(-200) : []
            };
        }

        function snapshotsEqual(a, b) {
            return !!a && !!b && JSON.stringify(a) === JSON.stringify(b);
        }

        const PROFILE_INDEX_KEY = 'osint-profile-index-v1';
        const PROFILE_DATA_PREFIX = 'osint-profile-data-v1:';
        let profileLibrary = null;
        let libraryLock = false;
        let librarySyncTimer = 0;
        let profilePromptState = null;
        let peerHomes = {};
        let mapMenuAnchor = null;
        let profileFlyLock = false;
        let profileFlyTimer = 0;
        const PROFILE_LINK_BADGE = '<span class="profile-link-badge" title="Linked profile" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="6" cy="8" r="3.4"/><circle cx="10.2" cy="8" r="3.4"/></svg></span>';

        function profileDataKey(id) {
            return PROFILE_DATA_PREFIX + id;
        }

        function newProfileId() {
            return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        }

        function factNameFrom(facts) {
            const items = facts && facts.name;
            if (!Array.isArray(items) || !items.length) return '';
            const last = items[items.length - 1];
            return String((last && last.value) || '').trim();
        }

        function compactFaceFrom(facts) {
            const items = facts && facts.image;
            const first = Array.isArray(items) && items.length ? items[0] : null;
            if (!first) return '';
            if (first.preview) return String(first.preview);
            if (first.media && /^https?:/i.test(String(first.media))) return String(first.media);
            if (first.value && /^https?:/i.test(String(first.value))) return String(first.value);
            if (first.media && String(first.media).indexOf('data:image/') === 0) return String(first.media);
            return '';
        }

        function displayProfileName(entry) {
            if (!entry) return 'Untitled';
            if (entry.named && String(entry.title || '').trim()) return String(entry.title).trim();
            if (entry.id && profileLibrary && entry.id === profileLibrary.activeId) {
                const live = typeof subjectDisplayName === 'function' ? subjectDisplayName() : '';
                if (live && live !== 'Anonymous') return live;
            }
            const saved = factNameFrom(entry.facts);
            if (saved) return saved;
            if (String(entry.title || '').trim()) return String(entry.title).trim();
            return 'Untitled';
        }

        function profileLetter(name) {
            const ch = String(name || 'U').replace(/[^A-Za-z0-9]/g, '').charAt(0);
            return (ch || 'U').toUpperCase();
        }

        function emptyLibraryEntry(id, title, named) {
            return {
                id: id,
                kind: 'orbint-profile',
                title: String(title || '').trim().slice(0, 48),
                named: !!named,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analysis: '',
                facts: {},
                nulls: [],
                missing: [],
                added: [],
                labels: {},
                hidden: [],
                layout: null,
                peerHomes: {},
                customPlatforms: [],
                case: emptyCaseMeta(),
                audit: [],
                investigation: null
            };
        }

        function readStoredJson(key, fallback) {
            try {
                const raw = JSON.parse(localStorage.getItem(key) || '');
                return raw == null ? fallback : raw;
            } catch (error) {
                return fallback;
            }
        }

        function writeStoredJson(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                return false;
            }
        }

        function loadProfileEntry(id) {
            const raw = readStoredJson(profileDataKey(id), null);
            if (!raw || typeof raw !== 'object') return null;
            raw.id = id;
            raw.facts = raw.facts && typeof raw.facts === 'object' ? raw.facts : {};
            raw.nulls = missingFieldIds(raw);
            raw.added = Array.isArray(raw.added) ? raw.added : [];
            raw.labels = raw.labels && typeof raw.labels === 'object' && !Array.isArray(raw.labels) ? raw.labels : {};
            raw.hidden = Array.isArray(raw.hidden) ? raw.hidden : [];
            return raw;
        }

        function saveProfileEntry(entry) {
            if (!entry || !entry.id) return;
            saveProfileImages(entry.id, entry.facts);
            const slim = {
                id: entry.id,
                kind: entry.kind,
                title: entry.title,
                named: entry.named,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                analysis: entry.analysis || '',
                facts: slimFactsForStorage(entry.facts),
                nulls: Array.isArray(entry.nulls) ? entry.nulls.slice() : [],
                missing: Array.isArray(entry.nulls) ? entry.nulls.slice() : (Array.isArray(entry.missing) ? entry.missing.slice() : []),
                added: entry.added,
                labels: entry.labels,
                hidden: entry.hidden,
                layout: entry.layout,
                peerHomes: entry.peerHomes,
                customPlatforms: entry.customPlatforms,
                investigation: entry.investigation || null
            };
            writeStoredJson(profileDataKey(entry.id), slim);
        }

        function deleteProfileEntry(id) {
            try { localStorage.removeItem(profileDataKey(id)); } catch (error) {}
            clearProfileImages(id);
        }

        function saveProfileIndex() {
            if (!profileLibrary) return;
            writeStoredJson(PROFILE_INDEX_KEY, {
                activeId: profileLibrary.activeId,
                order: profileLibrary.order.slice(),
                links: (profileLibrary.links || []).map((item) => [item[0], item[1]])
            });
        }

        function profileLinkKey(a, b) {
            return a < b ? a + '\n' + b : b + '\n' + a;
        }

        function normalizePeerHomes(raw) {
            const out = {};
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
            Object.keys(raw).forEach((id) => {
                const point = raw[id];
                const x = point && Number(point.x);
                const y = point && Number(point.y);
                if (!id || !Number.isFinite(x) || !Number.isFinite(y)) return;
                out[id] = { x: x, y: y };
            });
            return out;
        }

        function hubScreenPoint() {
            const size = canvasSize();
            return {
                x: orbit.hubLiveX != null ? orbit.hubLiveX : (size.width / 2 + orbit.dragX + orbit.parallaxX),
                y: orbit.hubLiveY != null ? orbit.hubLiveY : (size.height / 2 + orbit.dragY + orbit.parallaxY)
            };
        }

        function mapEventToHubWorld(event) {
            const canvas = mapCanvas || document.getElementById('mapCanvas');
            if (!canvas || !event) return null;
            const rect = canvas.getBoundingClientRect();
            const hubPt = hubScreenPoint();
            const zoom = Math.max(orbit.zoom || 1, 0.01);
            return {
                x: (event.clientX - rect.left - hubPt.x) / zoom,
                y: (event.clientY - rect.top - hubPt.y) / zoom
            };
        }

        function peerHomeFor(peerId) {
            const stored = peerHomes && peerHomes[peerId];
            if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) return stored;
            const mine = profileLibrary && profileLibrary.activeId;
            const other = profileLibrary && profileLibrary.items[peerId];
            const fromOther = other && other.peerHomes && other.peerHomes[mine];
            if (fromOther && Number.isFinite(fromOther.x) && Number.isFinite(fromOther.y)) {
                return { x: -fromOther.x, y: -fromOther.y };
            }
            return null;
        }

        function defaultPeerOffset() {
            const dist = typeof hubPeerClearance === 'function' ? hubPeerClearance() + 48 : ((hub && hub.offsetWidth || 220) / 2 + 160);
            const taken = linkedProfileIds().map(peerHomeFor).filter(Boolean);
            for (let i = 0; i < 16; i++) {
                const angle = -Math.PI / 2 + (i / 8) * Math.PI * 2;
                const cand = unclipPeerWorld(Math.cos(angle) * dist, Math.sin(angle) * dist);
                if (!taken.some((point) => Math.hypot(point.x - cand.x, point.y - cand.y) < 120)) return cand;
            }
            return unclipPeerWorld(dist, 0);
        }

        function persistPeerHomes() {
            if (!profileLibrary || !profileLibrary.activeId) return;
            const entry = profileLibrary.items[profileLibrary.activeId];
            if (!entry) return;
            entry.peerHomes = Object.assign({}, peerHomes);
            saveProfileEntry(entry);
        }

        function placeLinkedProfile(home) {
            if (!profileLibrary || !profileLibrary.activeId) return;
            flushLibrarySync();
            const sourceId = profileLibrary.activeId;
            const id = newProfileId();
            const raw = home && Number.isFinite(home.x) && Number.isFinite(home.y)
                ? { x: home.x, y: home.y }
                : defaultPeerOffset();
            let pos = unclipPeerWorld(raw.x, raw.y);
            const entry = emptyLibraryEntry(id, '', false);
            entry.peerHomes[sourceId] = { x: -pos.x, y: -pos.y };
            profileLibrary.items[id] = entry;
            profileLibrary.order.push(id);
            saveProfileEntry(entry);
            peerHomes[id] = pos;
            persistPeerHomes();
            linkProfiles(sourceId, id);
        }

        function normalizeProfileLinks(raw) {
            const seen = {};
            const links = [];
            (Array.isArray(raw) ? raw : []).forEach((item) => {
                const a = Array.isArray(item) ? item[0] : item && item.a;
                const b = Array.isArray(item) ? item[1] : item && item.b;
                if (!a || !b || a === b) return;
                if (profileLibrary && (!profileLibrary.items[a] || !profileLibrary.items[b])) return;
                const key = profileLinkKey(a, b);
                if (seen[key]) return;
                seen[key] = true;
                links.push(a < b ? [a, b] : [b, a]);
            });
            return links;
        }

        function linkedProfileIds(id) {
            const src = id || (profileLibrary && profileLibrary.activeId);
            if (!src || !profileLibrary) return [];
            return (profileLibrary.links || []).reduce((list, pair) => {
                if (pair[0] === src) list.push(pair[1]);
                else if (pair[1] === src) list.push(pair[0]);
                return list;
            }, []).filter((other) => profileLibrary.items[other]);
        }

        function profilesLinked(a, b) {
            if (!a || !b || a === b) return false;
            const key = profileLinkKey(a, b);
            return (profileLibrary.links || []).some((pair) => profileLinkKey(pair[0], pair[1]) === key);
        }

        function linkProfiles(a, b) {
            if (!profileLibrary || !a || !b || a === b) return;
            if (!profileLibrary.items[a] || !profileLibrary.items[b]) return;
            if (profilesLinked(a, b)) return;
            profileLibrary.links = profileLibrary.links || [];
            profileLibrary.links.push(a < b ? [a, b] : [b, a]);
            saveProfileIndex();
            renderPeerHubs();
            renderProfileRail();
        }

        function unlinkProfiles(a, b) {
            if (!profileLibrary || !a || !b) return;
            const key = profileLinkKey(a, b);
            profileLibrary.links = (profileLibrary.links || []).filter((pair) => {
                if (!pair || pair.length < 2) return false;
                return profileLinkKey(pair[0], pair[1]) !== key;
            });
            if (profileLibrary.activeId === a) delete peerHomes[b];
            else if (profileLibrary.activeId === b) delete peerHomes[a];
            stripPeerHome(a, b);
            stripPeerHome(b, a);
            persistPeerHomes();
            saveProfileIndex();
            const layer = document.getElementById('peerHubs');
            if (layer) delete layer.dataset.stamp;
            peerBodies = peerBodies.filter((body) => body && body.id !== a && body.id !== b);
            renderPeerHubs();
            renderProfileRail();
            if (typeof positionPeerHubs === 'function') positionPeerHubs();
        }

        function stripPeerHome(ownerId, peerId) {
            const entry = profileLibrary && profileLibrary.items[ownerId];
            if (!entry || !entry.peerHomes) return;
            delete entry.peerHomes[peerId];
            saveProfileEntry(entry);
        }

        function pruneProfileLinks(id) {
            if (!profileLibrary || !id) return;
            profileLibrary.links = (profileLibrary.links || []).filter((pair) => pair[0] !== id && pair[1] !== id);
            delete peerHomes[id];
            Object.keys(profileLibrary.items || {}).forEach((ownerId) => stripPeerHome(ownerId, id));
        }

        function otherProfiles(exceptId) {
            if (!profileLibrary) return [];
            const skip = exceptId || profileLibrary.activeId;
            return profileLibrary.order.filter((id) => id && id !== skip && profileLibrary.items[id]);
        }

        function currentLayoutSnapshot() {
            if (typeof loadSavedLayout === 'function') {
                try { return loadSavedLayout(); } catch (error) {}
            }
            return readStoredJson(LAYOUT_KEY, null);
        }

        function captureWorkspace(id, prev) {
            const snap = {
                analysis: (profile && profile.analysis) || '',
                facts: cloneFactsShallow(profile && profile.facts),
                nulls: (profile && Array.isArray(profile.nulls)) ? profile.nulls.slice() : []
            };
            const title = prev && prev.named ? prev.title : (displayProfileName({
                id: id,
                title: prev && prev.title,
                named: prev && prev.named,
                facts: snap.facts
            }));
            return {
                id: id,
                kind: 'orbint-profile',
                title: String(title || '').trim().slice(0, 48),
                named: !!(prev && prev.named),
                createdAt: (prev && prev.createdAt) || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analysis: snap.analysis || '',
                facts: snap.facts || {},
                nulls: Array.isArray(snap.nulls) ? snap.nulls.slice() : [],
                missing: Array.isArray(snap.nulls) ? snap.nulls.slice() : [],
                added: addedFieldSpecs(),
                labels: storedFieldLabels(),
                hidden: Array.from(hiddenFields),
                layout: currentLayoutSnapshot(),
                peerHomes: Object.assign({}, peerHomes),
                customPlatforms: Array.isArray(profile.customPlatforms) ? profile.customPlatforms.slice() : [],
                case: Object.assign({}, emptyCaseMeta(), (profile && profile.case) || (prev && prev.case) || {}),
                audit: Array.isArray(profile && profile.audit) ? profile.audit.slice(-200) : ((prev && prev.audit) || []),
                investigation: (window.OrbINTCase && typeof OrbINTCase.snapshot === 'function')
                    ? OrbINTCase.snapshot()
                    : ((prev && prev.investigation) || null)
            };
        }

        function queueLibrarySync() {
            if (libraryLock || !profileLibrary) return;
            clearTimeout(librarySyncTimer);
            librarySyncTimer = setTimeout(syncActiveLibrary, 80);
        }

        function flushLibrarySync() {
            clearTimeout(librarySyncTimer);
            librarySyncTimer = 0;
            if (typeof saveOrbitLayout === 'function') {
                try { saveOrbitLayout(); } catch (error) {}
            }
            syncActiveLibrary();
        }

        function syncActiveLibrary() {
            if (libraryLock || !profileLibrary || !profileLibrary.activeId) return;
            const id = profileLibrary.activeId;
            const prev = profileLibrary.items[id] || emptyLibraryEntry(id, '', false);
            const next = captureWorkspace(id, prev);
            profileLibrary.items[id] = next;
            saveProfileEntry(next);
            saveProfileIndex();
        }

        function resetStockFields() {
            for (let i = FIELDS.length - 1; i >= 0; i--) {
                if (!STOCK_IDS.has(FIELDS[i].id)) FIELDS.splice(i, 1);
            }
            FIELDS.forEach((field) => {
                if (STOCK_LABELS[field.id]) field.label = STOCK_LABELS[field.id];
            });
        }

        function removeNonStockNodes() {
            if (!mapCanvas) return;
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                if (!STOCK_IDS.has(node.dataset.field)) node.remove();
            });
        }

        function clearSessionMedia() {
            Object.keys(mediaStore).forEach((id) => {
                if (mediaStore[id] && mediaStore[id].src && String(mediaStore[id].src).indexOf('blob:') === 0) {
                    URL.revokeObjectURL(mediaStore[id].src);
                }
                delete mediaStore[id];
            });
            if (typeof closeMediaViewer === 'function') closeMediaViewer();
            if (typeof closePhotosSheet === 'function') closePhotosSheet();
        }

        function applyOrbitLayout(layout, keepCamera) {
            nodeHomes.clear();
            orbitItems = [];
            cachedLayout = layout && layout.items ? layout : null;
            if (cachedLayout) {
                if (!keepCamera) {
                    if (typeof resetPhoneOrbitCamera === 'function' && resetPhoneOrbitCamera()) {
                        // Phone always refits instead of restoring a desktop camera.
                    } else {
                        orbit.dragX = Number.isFinite(cachedLayout.dragX) ? cachedLayout.dragX : 0;
                        orbit.dragY = Number.isFinite(cachedLayout.dragY) ? cachedLayout.dragY : 0;
                        orbit.gridPanX = Number.isFinite(cachedLayout.gridPanX) ? cachedLayout.gridPanX : orbit.dragX;
                        orbit.gridPanY = Number.isFinite(cachedLayout.gridPanY) ? cachedLayout.gridPanY : orbit.dragY;
                        if (Number.isFinite(cachedLayout.zoom) && cachedLayout.zoom > 0) {
                            orbit.zoom = cachedLayout.zoom;
                            orbit.targetZoom = cachedLayout.zoom;
                        } else if (typeof recenterOrbit === 'function') {
                            recenterOrbit();
                        }
                    }
                }
                (cachedLayout.homes || []).forEach((entry) => {
                    if (entry && entry[0] && entry[1]) nodeHomes.set(entry[0], entry[1]);
                });
                orbit.restoreHomes = nodeHomes.size > 0;
            } else {
                if (!keepCamera && typeof recenterOrbit === 'function') recenterOrbit();
                orbit.restoreHomes = false;
            }
            try {
                if (cachedLayout) localStorage.setItem(LAYOUT_KEY, JSON.stringify(cachedLayout));
                else localStorage.removeItem(LAYOUT_KEY);
            } catch (error) {}
        }

        function ovalBloomOrder(item) {
            const a = item.tAngle == null ? item.angle : item.tAngle;
            return ((a + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        }

        function staggerOrbitBloom() {
            const roots = orbitItems.filter((item) => item && !item.parentId);
            roots.sort((a, b) => ovalBloomOrder(a) - ovalBloomOrder(b));
            const step = Math.min(40, Math.max(20, 880 / Math.max(roots.length, 1)));
            const byId = new Map(orbitItems.map((item) => [item.node && item.node.dataset.field, item]));
            orbitItems.forEach((item) => {
                item.bloomWait = 0;
                if (item.node) item.node.style.animationDelay = '';
            });
            roots.forEach((item, i) => {
                item.bloomWait = 18 + i * step;
                if (item.node) item.node.style.animationDelay = item.bloomWait + 'ms';
            });
            orbitItems.forEach((item) => {
                if (!item.parentId) return;
                const parent = byId.get(item.parentId);
                item.bloomWait = parent && parent.bloomWait ? parent.bloomWait : 0;
                if (item.node) item.node.style.animationDelay = (item.bloomWait || 0) + 'ms';
            });
            return 18 + Math.max(0, roots.length - 1) * step;
        }

        function clearOrbitBloomDelays() {
            orbitItems.forEach((item) => {
                if (item.node) item.node.style.animationDelay = '';
                if (item.line) item.line.removeAttribute('opacity');
            });
        }

        function bloomOrbitFromHub() {
            const hubPt = typeof hubScreenPoint === 'function'
                ? hubScreenPoint()
                : { x: (canvasSize().width / 2), y: (canvasSize().height / 2) };
            const zoom = orbit.zoom || 1;
            orbitItems.forEach((item) => {
                const targetRx = item.tRx == null ? item.rx : item.tRx;
                const targetRy = item.tRy == null ? item.ry : item.tRy;
                item.tRx = targetRx;
                item.tRy = targetRy;
                item.rx = targetRx * 0.08;
                item.ry = targetRy * 0.08;
                item.comingHome = false;
                const angle = (item.tAngle == null ? item.angle : item.tAngle) + (orbit.spin || 0);
                item.x = hubPt.x + Math.cos(angle) * item.rx * zoom;
                item.y = hubPt.y + Math.sin(angle) * item.ry * zoom;
                item.vx = 0;
                item.vy = 0;
                item.sxv = 0;
                item.syv = 0;
            });
            const span = staggerOrbitBloom();
            if (typeof computePeerTargets === 'function') computePeerTargets(hubPt.x, hubPt.y, zoom);
            peerBodies.forEach((body) => {
                const tx = body.tx == null ? hubPt.x : body.tx;
                const ty = body.ty == null ? hubPt.y : body.ty;
                body.x = hubPt.x + (tx - hubPt.x) * 0.12;
                body.y = hubPt.y + (ty - hubPt.y) * 0.12;
                body.vx = 0;
                body.vy = 0;
                body.sxv = 0;
                body.syv = 0;
            });
            if (typeof applyOrbit === 'function') applyOrbit(16);
            return span;
        }

        let introTimer = 0;
        function replayCss(el, className, ms) {
            if (!el) return;
            el.classList.remove(className);
            void el.offsetWidth;
            el.classList.add(className);
            if (ms) {
                setTimeout(function () {
                    el.classList.remove(className);
                }, ms);
            }
        }

        function replayIntro() {
            if (typeof closeFieldMenu === 'function') closeFieldMenu();
            if (typeof closeSearchMenu === 'function') closeSearchMenu();
            if (typeof closePlatformMenu === 'function') closePlatformMenu();
            if (typeof closeExportMenu === 'function') closeExportMenu();
            if (introTimer) {
                clearTimeout(introTimer);
                introTimer = 0;
            }
            if (mapStage) mapStage.classList.remove('boot-enter', 'profile-enter');
            const panel = document.querySelector('.profile-panel');
            const dock = document.querySelector('.dock-anchor');
            const donate = document.getElementById('donate');
            const pageSwitch = document.getElementById('pageSwitch');
            if (panel) panel.classList.remove('replay-boot');
            if (dock) dock.classList.remove('replay-boot');
            if (donate) donate.classList.remove('replay-boot');
            if (pageSwitch) pageSwitch.classList.remove('replay-boot');
            const animate = !reduceMotion;
            if (typeof isPhone === 'function' && isPhone() && typeof setPanelOpen === 'function') setPanelOpen(false);
            const span = animate ? bloomOrbitFromHub() : 0;
            if (animate && typeof kickOrbit === 'function') kickOrbit();
            requestAnimationFrame(function () {
                replayCss(panel, 'replay-boot', 700);
                replayCss(dock, 'replay-boot', 750);
                replayCss(donate, 'replay-boot', 750);
                replayCss(pageSwitch, 'replay-boot', 750);
                if (animate && mapStage) {
                    void mapStage.offsetWidth;
                    mapStage.classList.add('boot-enter');
                    if (typeof kickOrbit === 'function') kickOrbit();
                    introTimer = setTimeout(function () {
                        if (mapStage) mapStage.classList.remove('boot-enter');
                        if (typeof clearOrbitBloomDelays === 'function') clearOrbitBloomDelays();
                        introTimer = 0;
                    }, Math.max(800, span + 720));
                }
            });
        }

        function applyWorkspace(entry, opts) {
            if (!entry) return;
            const keepCamera = !!(opts && opts.keepCamera);
            const fromHub = !!(opts && opts.fromHub);
            libraryLock = true;
            try {
                closeProfileMenu();
                closeProfilePrompt();
                if (typeof closeFieldMenu === 'function') closeFieldMenu();
                if (typeof closeSearchMenu === 'function') closeSearchMenu();
                if (typeof closePlatformMenu === 'function') closePlatformMenu();
                if (typeof closeExportMenu === 'function') closeExportMenu();
                clearSessionMedia();
                revealedPasswords.clear();
                activeField = null;
                history.past = [];
                history.future = [];
                history.applying = true;
                peerHomes = normalizePeerHomes(entry.peerHomes);

                resetStockFields();
                removeNonStockNodes();
                (entry.added || []).forEach((spec) => {
                    if (!spec || !spec.id || isUrlFieldSpec(spec) || fieldById(spec.id)) return;
                    FIELDS.push(buildAddedField(spec));
                });

                hiddenFields = new Set(entry.hidden || []);
                const labels = entry.labels && typeof entry.labels === 'object' ? entry.labels : {};
                try { localStorage.setItem(ADDED_KEY, JSON.stringify(entry.added || [])); } catch (error) {}
                try { localStorage.setItem(LABEL_KEY, JSON.stringify(labels)); } catch (error) {}
                try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(hiddenFields))); } catch (error) {}

                profile.facts = Object.assign(emptyFacts(), entry.facts || {});
                profile.analysis = entry.analysis || '';
                profile.nulls = missingFieldIds(entry);
                profile.customPlatforms = Array.isArray(entry.customPlatforms) ? entry.customPlatforms : [];
                profile.case = Object.assign({}, emptyCaseMeta(), entry.case || {});
                profile.audit = Array.isArray(entry.audit) ? entry.audit.slice(-200) : [];
                restoreFilledOptionalPresets();
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, profile, {
                        nulls: profile.nulls.slice(),
                        missing: profile.nulls.slice(),
                        facts: slimFactsForStorage(profile.facts)
                    })));
                } catch (error) {}

                applyOrbitLayout(entry.layout || null, keepCamera);
                if (window.OrbINTCase && typeof OrbINTCase.load === 'function') {
                    OrbINTCase.load(entry.investigation || null);
                }
                createNodes();
                applyStoredFieldLabels();
                applyHiddenFields();
                renderProfile();
                renderNodes();
                updateHubProgress();
                orbit.snapLayout = true;
                if (typeof positionNodes === 'function') positionNodes();
                orbit.snapLayout = false;
                if (fromHub && !reduceMotionOn()) {
                    bloomOrbitFromHub();
                    if (typeof kickOrbit === 'function') kickOrbit();
                }
                orbit.restoreHomes = false;
                history.applying = false;
                pushHistory();
                updateHistoryButtons();
            } finally {
                libraryLock = false;
            }
            hydrateActiveImages();
        }
