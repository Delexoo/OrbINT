/* Profile save, sidebar, and image database */
        const STORAGE_KEY = 'osint-case-file-v1';
        let profile = { facts: {}, analysis: '' };
        let activeField = null;
        const revealedPasswords = new Set();

        const mapCanvas = document.getElementById('mapCanvas');
        const linkLayer = document.getElementById('linkLayer');
        const hub = document.getElementById('hub');
        const profilePanel = document.getElementById('profilePanel');
        const backdrop = document.getElementById('backdrop');
        const drawerQuery = window.matchMedia('(max-width: 820px)');
        const SIDEBAR_KEY = 'osint-sidebar-w';
        const SIDEBAR_DEFAULT = 440;
        const SIDEBAR_MIN = 280;
        const SIDEBAR_MAX = 640;

        function applySidebarWidth(px) {
            const max = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, (window.innerWidth || 1200) - 220));
            const raw = Math.round(Number(px));
            const width = Math.max(SIDEBAR_MIN, Math.min(max, Number.isFinite(raw) ? raw : SIDEBAR_DEFAULT));
            document.documentElement.style.setProperty('--sidebar', width + 'px');
            if (profilePanel) profilePanel.style.width = '';
            return width;
        }

        function initSidebarWidth() {
            try {
                const saved = Number(localStorage.getItem(SIDEBAR_KEY));
                if (saved && saved !== 268 && saved !== 320 && saved !== 400) applySidebarWidth(saved);
                else applySidebarWidth(SIDEBAR_DEFAULT);
            } catch (error) {
                applySidebarWidth(SIDEBAR_DEFAULT);
            }
        }

        function bindSidebarResize() {
            const handle = document.getElementById('profileResize');
            if (!handle || !profilePanel) return;
            let startX = 0;
            let startW = 0;
            function onMove(event) {
                applySidebarWidth(startW + event.clientX - startX);
                if (typeof positionNodes === 'function') positionNodes();
            }
            function onUp() {
                document.body.classList.remove('resizing-sidebar');
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar')) || SIDEBAR_DEFAULT;
                try { localStorage.setItem(SIDEBAR_KEY, String(Math.round(current))); } catch (error) {}
                if (typeof positionNodes === 'function') positionNodes();
            }
            handle.addEventListener('pointerdown', (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                startX = event.clientX;
                startW = profilePanel.getBoundingClientRect().width;
                document.body.classList.add('resizing-sidebar');
                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onUp);
            });
        }

        function emptyFacts() {
            return Object.fromEntries(FIELDS.map((field) => [field.id, []]));
        }

        function missingFieldIds(source) {
            if (!source || typeof source !== 'object') return [];
            if (Array.isArray(source.missing)) return source.missing.filter(Boolean);
            if (Array.isArray(source.nulls)) return source.nulls.filter(Boolean);
            return [];
        }

        function stampMissingFields(bundle, ids) {
            const next = bundle && typeof bundle === 'object' ? bundle : {};
            const list = Array.isArray(ids) ? ids.filter(Boolean) : missingFieldIds(next);
            next.nulls = list.slice();
            next.missing = list.slice();
            return next;
        }

        function loadProfile() {
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
                if (saved && saved.facts && typeof saved.facts === 'object') {
                    const facts = Object.assign(emptyFacts(), saved.facts);
                    if ((!facts.timezone || !facts.timezone.length) && saved.facts.behavior) {
                        facts.timezone = saved.facts.behavior;
                    }
                    delete facts.behavior;
                    return {
                        analysis: saved.analysis || '',
                        facts,
                        nulls: missingFieldIds(saved),
                        customPlatforms: Array.isArray(saved.customPlatforms) ? saved.customPlatforms : [],
                        case: Object.assign({}, emptyCaseMeta(), saved.case || {}),
                        audit: Array.isArray(saved.audit) ? saved.audit.slice(-200) : []
                    };
                }
            } catch (error) {}
            return { facts: emptyFacts(), analysis: '', nulls: [], customPlatforms: [], case: emptyCaseMeta(), audit: [] };
        }

        function emptyCaseMeta() {
            return { number: '', offense: '', status: 'open', investigator: '', openedAt: '' };
        }

        const SHEET_PICKS = {
            confidence: [
                { value: '', label: 'Unrated' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'probable', label: 'Probable' },
                { value: 'possible', label: 'Possible' },
                { value: 'unconfirmed', label: 'Unconfirmed' }
            ],
            method: [
                { value: '', label: 'Method' },
                { value: 'open-web', label: 'Open web' },
                { value: 'public-records', label: 'Public records' },
                { value: 'subscriber-db', label: 'Subscriber DB' },
                { value: 'interview', label: 'Interview' },
                { value: 'legal-process', label: 'Legal process' }
            ],
            status: [
                { value: 'open', label: 'Open' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'closed', label: 'Closed' }
            ],
            offense: [
                { value: 'Background check', label: 'Background check', hint: 'Public history, records, and reputation of a person.' },
                { value: 'Due diligence', label: 'Due diligence', hint: 'Verify facts about a person or company before a deal or hire.' },
                { value: 'Person of interest', label: 'Person of interest', hint: 'Someone tied to the inquiry who has not been charged.' },
                { value: 'Missing person', label: 'Missing person', hint: 'Find someone whose whereabouts are unknown.' },
                { value: 'Open-source review', label: 'Open-source review', hint: 'Research from public sites, posts, and records only.' },
                { value: 'Intellectual property', label: 'Intellectual property', hint: 'Misuse of trademarks, copyrights, patents, or trade secrets.' },
                { value: 'Workplace inquiry', label: 'Workplace inquiry', hint: 'Internal review of an employee or workplace issue.' },
                { sep: true },
                { value: 'Murder', label: 'Murder', hint: 'Unlawful killing carried out with intent.' },
                { value: 'Homicide', label: 'Homicide', hint: 'A killing of one person by another, including murder and manslaughter.' },
                { value: 'Manslaughter', label: 'Manslaughter', hint: 'Unlawful killing without a prior intent to murder.' },
                { value: 'Attempted murder', label: 'Attempted murder', hint: 'Trying to kill someone but not succeeding.' },
                { value: 'Assault', label: 'Assault', hint: 'Unlawful threat or attempt to cause physical harm.' },
                { value: 'Aggravated assault', label: 'Aggravated assault', hint: 'Assault with a weapon or that causes serious injury.' },
                { value: 'Kidnapping', label: 'Kidnapping', hint: 'Taking or holding someone against their will.' },
                { value: 'Robbery', label: 'Robbery', hint: 'Theft from a person using force or the threat of force.' },
                { value: 'Sexual assault', label: 'Sexual assault', hint: 'Sexual contact without consent.' },
                { value: 'Human trafficking', label: 'Human trafficking', hint: 'Exploiting people through force, fraud, or coercion.' },
                { value: 'Domestic violence', label: 'Domestic violence', hint: 'Abuse by a current or former partner or family member.' },
                { value: 'Terrorism', label: 'Terrorism', hint: 'Violence meant to intimidate a population or government.' },
                { sep: true },
                { value: 'Harassment', label: 'Harassment', hint: 'Repeated unwanted contact that causes distress.' },
                { value: 'Stalking', label: 'Stalking', hint: 'Repeated following or watching that causes fear.' },
                { value: 'Threats', label: 'Threats', hint: 'Words or acts meant to frighten someone with harm.' },
                { value: 'Extortion', label: 'Extortion', hint: 'Forcing someone to pay or act by using threats.' },
                { value: 'Theft', label: 'Theft', hint: 'Taking property without permission.' },
                { value: 'Burglary', label: 'Burglary', hint: 'Entering a building to commit a crime, usually theft.' },
                { value: 'Arson', label: 'Arson', hint: 'Deliberately setting fire to property.' },
                { value: 'Fraud', label: 'Fraud', hint: 'Deceiving someone for money or other gain.' },
                { value: 'Identity theft', label: 'Identity theft', hint: 'Using someone else\'s identity without permission.' },
                { value: 'Impersonation', label: 'Impersonation', hint: 'Pretending to be another person.' },
                { value: 'Forgery', label: 'Forgery', hint: 'Making or altering a document in order to deceive.' },
                { value: 'Embezzlement', label: 'Embezzlement', hint: 'Stealing money or property you were trusted to handle.' },
                { value: 'Money laundering', label: 'Money laundering', hint: 'Hiding the source of money from crime.' },
                { value: 'Corruption', label: 'Corruption', hint: 'Abuse of power for private gain.' },
                { value: 'Drug trafficking', label: 'Drug trafficking', hint: 'Selling, moving, or distributing illegal drugs.' },
                { value: 'Weapons offense', label: 'Weapons offense', hint: 'Unlawful possession, sale, or use of a weapon.' },
                { value: 'Cybercrime', label: 'Cybercrime', hint: 'Crime committed with computers, accounts, or networks.' },
                { value: 'Conspiracy', label: 'Conspiracy', hint: 'An agreement between people to commit a crime.' },
                { value: 'Organized crime', label: 'Organized crime', hint: 'Crime carried out by a structured group.' }
            ]
        };

        function sheetPickLabel(kind, value) {
            const list = SHEET_PICKS[kind] || [];
            const hit = list.find(function (item) { return item.value === String(value || ''); });
            if (hit) return hit.label;
            return (list[0] && list[0].label) || '';
        }

        function investigatorModeOn() {
            try {
                if (typeof OrbINTSettings !== 'undefined' && OrbINTSettings.get) {
                    return OrbINTSettings.get('investigatorMode') !== false;
                }
            } catch (error) {}
            return true;
        }

        function investigatorHidesField(field) {
            if (!investigatorModeOn() || !field) return false;
            const base = fieldBase(field.id);
            return /^(password|pin|seedphrase|privatekey|apikey|session)$/.test(base);
        }

        function appendCaseAudit(act, field, note) {
            if (!profile) return;
            if (!Array.isArray(profile.audit)) profile.audit = [];
            profile.audit.push({
                at: new Date().toISOString(),
                act: String(act || ''),
                field: String(field || ''),
                note: String(note || '').slice(0, 180)
            });
            if (profile.audit.length > 200) profile.audit = profile.audit.slice(-200);
        }

        profile = loadProfile();
        if (!profile.facts) profile.facts = emptyFacts();
        if (!Array.isArray(profile.nulls)) profile.nulls = [];
        if (!Array.isArray(profile.customPlatforms)) profile.customPlatforms = [];
        profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
        if (!Array.isArray(profile.audit)) profile.audit = [];
        restoreFilledOptionalPresets();

        const mediaStore = {};
        const IMAGE_DB_NAME = 'orbint-media-v1';
        const IMAGE_DB_STORE = 'profile-images';

        function openOrbintMediaDb() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    reject(new Error('no-idb'));
                    return;
                }
                const req = indexedDB.open(IMAGE_DB_NAME, 1);
                req.onupgradeneeded = function () {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(IMAGE_DB_STORE)) db.createObjectStore(IMAGE_DB_STORE);
                };
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        }

        function usableImageSrc(value) {
            const src = String(value || '');
            return !!src && src.indexOf('blob:') !== 0;
        }

        function imagePackFromFacts(facts) {
            return ((facts && facts.image) || []).map((fact) => {
                const preview = usableImageSrc(fact && fact.preview) ? String(fact.preview) : '';
                const media = usableImageSrc(fact && fact.media) ? String(fact.media) : '';
                return {
                    addedAt: fact && fact.addedAt,
                    value: fact && fact.value,
                    preview: preview,
                    media: media,
                    kind: (fact && fact.kind) || 'image'
                };
            }).filter((item) => item && (item.preview || item.media));
        }

        function mergeImagePack(facts, pack) {
            if (!facts) return;
            const images = facts.image || [];
            const list = Array.isArray(pack) ? pack : [];
            images.forEach((fact) => {
                if (!fact) return;
                const hit = list.find((item) => item && item.addedAt === fact.addedAt && item.value === fact.value)
                    || list.find((item) => item && item.value === fact.value);
                if (!hit) return;
                if (!usableImageSrc(fact.preview) && hit.preview) fact.preview = hit.preview;
                if (!usableImageSrc(fact.media) && hit.media) fact.media = hit.media;
                if (!fact.kind && hit.kind) fact.kind = hit.kind;
            });
        }

        function slimFactsForStorage(facts) {
            const copy = JSON.parse(JSON.stringify(facts || {}));
            Object.keys(copy).forEach((id) => {
                (copy[id] || []).forEach((item) => {
                    if (!item) return;
                    const media = String(item.media || '');
                    const preview = String(item.preview || '');
                    if (media.indexOf('data:') === 0) delete item.media;
                    if (preview.indexOf('data:') === 0 && preview.length > 60000) delete item.preview;
                });
            });
            return copy;
        }

        function cloneFactsShallow(facts) {
            const src = facts || {};
            const out = {};
            Object.keys(src).forEach((id) => {
                const list = src[id];
                if (!Array.isArray(list)) {
                    out[id] = list;
                    return;
                }
                out[id] = list.map((item) => (item && typeof item === 'object') ? Object.assign({}, item) : item);
            });
            return out;
        }

        function faceStamp(src) {
            const s = String(src || '');
            if (!s) return '';
            return s.length + ':' + s.slice(0, 12) + s.slice(-16);
        }

        function saveProfileImages(profileId, facts) {
            const id = String(profileId || '');
            if (!id) return Promise.resolve();
            const pack = imagePackFromFacts(facts);
            const listed = ((facts && facts.image) || []).filter((item) => item && String(item.value || '').trim());
            if (!pack.length && listed.length) return Promise.resolve();
            return openOrbintMediaDb().then((db) => new Promise((resolve) => {
                const tx = db.transaction(IMAGE_DB_STORE, 'readwrite');
                const store = tx.objectStore(IMAGE_DB_STORE);
                if (pack.length) store.put(pack, id);
                else store.delete(id);
                tx.oncomplete = function () { db.close(); resolve(); };
                tx.onerror = function () { db.close(); resolve(); };
            })).catch(function () {});
        }

        function loadProfileImages(profileId) {
            const id = String(profileId || '');
            if (!id) return Promise.resolve([]);
            return openOrbintMediaDb().then((db) => new Promise((resolve) => {
                const tx = db.transaction(IMAGE_DB_STORE, 'readonly');
                const req = tx.objectStore(IMAGE_DB_STORE).get(id);
                req.onsuccess = function () {
                    db.close();
                    resolve(Array.isArray(req.result) ? req.result : []);
                };
                req.onerror = function () { db.close(); resolve([]); };
            })).catch(function () { return []; });
        }

        function clearProfileImages(profileId) {
            const id = String(profileId || '');
            if (!id) return Promise.resolve();
            return openOrbintMediaDb().then((db) => new Promise((resolve) => {
                const tx = db.transaction(IMAGE_DB_STORE, 'readwrite');
                tx.objectStore(IMAGE_DB_STORE).delete(id);
                tx.oncomplete = function () { db.close(); resolve(); };
                tx.onerror = function () { db.close(); resolve(); };
            })).catch(function () {});
        }

        function clearAllProfileImages() {
            return openOrbintMediaDb().then((db) => new Promise((resolve) => {
                const tx = db.transaction(IMAGE_DB_STORE, 'readwrite');
                tx.objectStore(IMAGE_DB_STORE).clear();
                tx.oncomplete = function () { db.close(); resolve(); };
                tx.onerror = function () { db.close(); resolve(); };
            })).catch(function () {});
        }

        function activeProfileId() {
            return (profileLibrary && profileLibrary.activeId) || '';
        }

        function refreshImageSurfaces() {
            if (typeof setFieldThumb === 'function') setFieldThumb('image');
            if (typeof renderProfile === 'function') renderProfile();
            if (typeof renderNodes === 'function') renderNodes();
            if (typeof photosSheetOpen === 'function' && photosSheetOpen() && typeof renderPhotosSheet === 'function') {
                renderPhotosSheet();
            }
        }

        function hydrateProfileImages(profileId, facts) {
            return loadProfileImages(profileId).then((pack) => {
                if (pack && pack.length) mergeImagePack(facts, pack);
                return pack;
            });
        }

        function hydrateActiveImages() {
            const id = activeProfileId();
            if (!id || !profile || !profile.facts) return Promise.resolve();
            return hydrateProfileImages(id, profile.facts).then(() => {
                if (activeProfileId() !== id) return;
                if (profileLibrary && profileLibrary.items[id] && profileLibrary.items[id].facts) {
                    mergeImagePack(profileLibrary.items[id].facts, imagePackFromFacts(profile.facts));
                }
                refreshImageSurfaces();
            });
        }

        function hydrateLibraryImages() {
            if (!profileLibrary) return Promise.resolve();
            const jobs = profileLibrary.order.map((id) => {
                const entry = profileLibrary.items[id];
                if (!entry || !entry.facts) return Promise.resolve();
                return hydrateProfileImages(id, entry.facts);
            });
            return Promise.all(jobs).then(() => hydrateActiveImages());
        }

        function attachImagesToBundle(bundle, profileId) {
            const next = bundle && typeof bundle === 'object' ? bundle : {};
            next.facts = next.facts || {};
            const liveId = activeProfileId();
            if (profileId && profileId === liveId && profile && profile.facts) {
                next.facts.image = JSON.parse(JSON.stringify(profile.facts.image || []));
            }
            return loadProfileImages(profileId).then((pack) => {
                mergeImagePack(next.facts, pack);
                if (profileLibrary && profileLibrary.items[profileId] && profileLibrary.items[profileId].facts) {
                    mergeImagePack(next.facts, imagePackFromFacts(profileLibrary.items[profileId].facts));
                }
                return next;
            });
        }

        function saveProfile() {
            const liveId = typeof activeProfileId === 'function' ? activeProfileId() : '';
            if (liveId) saveProfileImages(liveId, profile.facts);
            try {
                const payload = Object.assign({}, profile, {
                    nulls: Array.isArray(profile.nulls) ? profile.nulls.slice() : [],
                    missing: Array.isArray(profile.nulls) ? profile.nulls.slice() : [],
                    facts: slimFactsForStorage(profile.facts)
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } catch (error) {
                const slim = JSON.parse(JSON.stringify(profile));
                slim.nulls = Array.isArray(profile.nulls) ? profile.nulls.slice() : [];
                slim.missing = slim.nulls.slice();
                slim.facts = slimFactsForStorage(slim.facts);
                Object.keys(slim.facts || {}).forEach((id) => {
                    (slim.facts[id] || []).forEach((item) => {
                        if (item.media && String(item.media).length > 24000) delete item.media;
                        if (item.preview && String(item.preview).indexOf('data:') === 0) delete item.preview;
                    });
                });
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slim)); } catch (retry) {}
            }
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
            if (window.OrbINTShare && typeof OrbINTShare.push === 'function' && !OrbINTShare.readonly()) {
                clearTimeout(saveProfile.shareTimer);
                saveProfile.shareTimer = setTimeout(function () { OrbINTShare.push(); }, 1100);
            }
        }

