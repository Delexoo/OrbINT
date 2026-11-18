/* Fact editing, history, phone mask, image read */
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

        const CASEBOOK_KEY = 'orbint-casebook-collapsed';

        function setCasebookCollapsed(collapsed) {
            const next = !!collapsed;
            document.body.classList.toggle('casebook-collapsed', next);
            const toggle = document.getElementById('profileToggle');
            if (toggle && !(typeof isPhone === 'function' && isPhone())) {
                toggle.setAttribute('aria-expanded', next ? 'false' : 'true');
                toggle.classList.toggle('is-on', !next);
            }
            try { localStorage.setItem(CASEBOOK_KEY, next ? '1' : '0'); } catch (error) {}
            if (typeof positionNodes === 'function') positionNodes();
        }

        function setPanelOpen(open) {
            const next = !!open;
            profilePanel.classList.toggle('open', next);
            document.body.classList.toggle('panel-open', next);
            const phone = isPhone();
            backdrop.hidden = !next || !drawerQuery.matches || phone;
            backdrop.classList.toggle('visible', next && drawerQuery.matches && !phone);
            const toggle = document.getElementById('profileToggle');
            if (toggle && phone) {
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

        function writeCaseField(key, value) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            const allowed = { number: 1, offense: 1, status: 1, investigator: 1 };
            if (!allowed[key]) return;
            profile.case = Object.assign({}, emptyCaseMeta(), profile.case || {});
            let next = String(value || '');
            if (key === 'status' && next !== 'open' && next !== 'inactive' && next !== 'closed') next = 'open';
            profile.case[key] = next;
            if (key === 'number' && next && !profile.case.openedAt) profile.case.openedAt = new Date().toISOString();
            saveProfile();
            refreshProfileChrome();
            recordHistory(false);
        }

        function patchProfileFact(id, matchValue, field, next) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            if (!id || (field !== 'value' && field !== 'source')) return;
            const needle = String(matchValue || '').trim();
            const clean = String(next || '').trim();
            profile.facts[id] = profile.facts[id] || [];
            const list = profile.facts[id];
            let item = null;
            for (let i = list.length - 1; i >= 0; i--) {
                if (String((list[i] && list[i].value) || '').trim() === needle) {
                    item = list[i];
                    break;
                }
            }
            if (!item) {
                if (field === 'value') writeLatestFact(id, clean);
                return;
            }
            if (field === 'source') {
                if (clean) item.source = clean;
                else delete item.source;
            } else if (!clean) {
                list.splice(list.indexOf(item), 1);
            } else if (String(item.value || '').trim() !== clean) {
                item.value = clean;
            } else return;
            if (field === 'value') appendCaseAudit('fact', id, clean.slice(0, 80));
            saveProfile();
            refreshProfileChrome();
            if (field === 'value') syncLinkedField(id, clean);
            renderProfile();
            if (typeof renderNodes === 'function') renderNodes();
            recordHistory(false);
        }

        function writeAnalysis(text) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            profile.analysis = String(text || '').trim();
            saveProfile();
            renderProfile();
            recordHistory(false);
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
                            blur: drawImageData(img, 16, true, 0.4, 'image/jpeg'),
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

