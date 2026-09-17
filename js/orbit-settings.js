/* OrbINT settings, logic bomb, stealth */

        const GROUPS = [
            { id: 'identity', label: 'Identity', fields: ['name', 'image'] },
            { id: 'person', label: 'Person', fields: [] },
            { id: 'spii', label: 'Sensitive', fields: [] },
            { id: 'contact', label: 'Phone', fields: ['phone', 'countrycode', 'phoneos'] },
            { id: 'life', label: 'Life', fields: ['age', 'dob'] },
            { id: 'online', label: 'Online', fields: ['email', 'username', 'password', 'domain'] },
            { id: 'device', label: 'Device', fields: ['os'] },
            { id: 'entity', label: 'Employment', fields: ['company', 'occupation'] },
            { id: 'finance', label: 'Finance', fields: ['crypto'] },
            { id: 'location', label: 'Location', fields: ['address', 'ip'] },
            { id: 'travel', label: 'Travel', fields: [] },
            { id: 'evidence', label: 'Other', fields: ['vehicle', 'vin', 'plate'] },
            { id: 'notes', label: 'Notes', fields: ['timezone', 'notes'] },
            { id: 'custom', label: 'Custom', fields: [] }
        ];

        function isPhone() {
            return window.matchMedia('(max-width: 820px)').matches;
        }

        const SETTINGS_KEY = 'orbint-settings';
        const SETTINGS_DEFAULTS = {
            logicBomb: false,
            logicBombPeriod: '6m',
            lastSeen: 0,
            curtain: false,
            confirmOutbound: false,
            clipClear: 'off',
            reduceMotion: false,
            hideTips: false,
            startPage: 'orbit',
            rememberPage: true,
            hideBackground: false,
            idleLock: 'off',
            exportNoPhotos: false,
            stealthTab: false,
            largeType: false,
            investigatorMode: true,
            shareApiUrl: 'http://127.0.0.1:8788',
            collabWsUrl: 'http://127.0.0.1:8788'
        };
        const BOMB_DAYS = { '1d': 1, '3d': 3, '1w': 7, '2w': 14, '1m': 30, '3m': 90, '6m': 180, '12m': 365, '24m': 730 };
        const STEALTH_TITLE = 'Notes';
        const LIVE_TITLE = document.title;
        let appSettings = Object.assign({}, SETTINGS_DEFAULTS);
        let idleLockTimer = 0;
        let clipClearTimer = 0;
        let bombPrevPeriod = '6m';
        const nativeOpen = window.open.bind(window);
        const nativeWriteText = (navigator.clipboard && navigator.clipboard.writeText)
            ? navigator.clipboard.writeText.bind(navigator.clipboard)
            : null;

        function readSettings() {
            try {
                const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '');
                if (saved && typeof saved === 'object') {
                    const next = Object.assign({}, SETTINGS_DEFAULTS, saved);
                    if (saved.hideBackground == null && saved.boardGrid === false) next.hideBackground = true;
                    if (next.logicBombPeriod === '4w') next.logicBombPeriod = '1m';
                    if (next.logicBombPeriod === '18m') next.logicBombPeriod = '12m';
                    return next;
                }
            } catch (error) {}
            return Object.assign({}, SETTINGS_DEFAULTS);
        }

        function writeSettings(next) {
            appSettings = Object.assign({}, SETTINGS_DEFAULTS, next || {});
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings)); } catch (error) {}
            return appSettings;
        }

        function patchSettings(partial) {
            return writeSettings(Object.assign({}, appSettings, partial));
        }

        function reduceMotionOn() {
            return document.documentElement.classList.contains('reduce-motion') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function shouldConfirmOpen(url) {
            const href = String(url || '');
            if (!/^https?:/i.test(href)) return false;
            try {
                return new URL(href, location.href).origin !== location.origin;
            } catch (error) {
                return true;
            }
        }

        let bombPulseLow = false;
        let lastSeenWrite = 0;

        function markSeen() {
            if (appSettings.logicBombPeriod === 'now') return;
            const now = Date.now();
            lastSeenWrite = now;
            patchSettings({ lastSeen: now });
        }

        function touchSeen(force) {
            if (appSettings.logicBombPeriod === 'now') return;
            const now = Date.now();
            if (!force && now - lastSeenWrite < 8000) return;
            markSeen();
        }

        function pad2(n) {
            return (n < 10 ? '0' : '') + n;
        }

        function bombPeriodMs() {
            if (!appSettings.logicBombPeriod || appSettings.logicBombPeriod === 'now') return 0;
            return (BOMB_DAYS[appSettings.logicBombPeriod] || 180) * 86400000;
        }

        function bombDisplayMs() {
            const period = bombPeriodMs();
            if (!period) return 0;
            if (!document.hidden) {
                return bombPulseLow && period > 1000 ? period - 1000 : period;
            }
            const last = Number(appSettings.lastSeen) || Date.now();
            return Math.max(0, last + period - Date.now());
        }

        function formatBombCountdown(ms) {
            if (ms <= 0) return '00:00:00';
            const total = Math.floor(ms / 1000);
            const hours = Math.floor(total / 3600);
            const mins = Math.floor((total % 3600) / 60);
            const secs = total % 60;
            return pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs);
        }

        function updateBombCountdown() {
            const node = document.getElementById('setBombCount');
            if (!node) return;
            if (!appSettings.logicBomb) {
                node.hidden = true;
                node.textContent = '';
                node.classList.remove('is-due');
                bombPulseLow = false;
                return;
            }
            if (appSettings.logicBombPeriod === 'now') {
                node.hidden = false;
                node.textContent = 'now';
                node.classList.add('is-due');
                return;
            }
            const left = bombDisplayMs();
            node.hidden = false;
            node.textContent = formatBombCountdown(left);
            node.classList.toggle('is-due', left <= 0);
        }

        const SET_PICKS = {
            bomb: {
                labelId: 'setBombPeriodLabel',
                value: function () { return appSettings.logicBombPeriod || '6m'; },
                options: [
                    { value: '1d', label: '1 day' },
                    { value: '3d', label: '3 days' },
                    { value: '1w', label: '1 week' },
                    { value: '2w', label: '2 weeks' },
                    { value: '1m', label: '1 month' },
                    { value: '3m', label: '3 months' },
                    { value: '6m', label: '6 months' },
                    { value: '12m', label: '12 months' },
                    { value: '24m', label: '24 months' },
                    { value: 'now', label: 'Clear now', danger: true, sep: true }
                ]
            },
            clip: {
                labelId: 'setClipClearLabel',
                value: function () { return appSettings.clipClear || 'off'; },
                options: [
                    { value: 'off', label: 'Off' },
                    { value: '15', label: '15 seconds' },
                    { value: '60', label: '60 seconds' }
                ]
            },
            idle: {
                labelId: 'setIdleLockLabel',
                value: function () { return String(appSettings.idleLock || 'off'); },
                options: [
                    { value: 'off', label: 'Off' },
                    { value: '1', label: '1 minute' },
                    { value: '5', label: '5 minutes' },
                    { value: '15', label: '15 minutes' }
                ]
            },
            start: {
                labelId: 'setStartPageLabel',
                value: function () { return appSettings.startPage || 'orbit'; },
                options: [
                    { value: 'orbit', label: 'Orbit' },
                    { value: 'timeline', label: 'Timeline' },
                    { value: 'whiteboard', label: 'Whiteboard' },
                    { value: 'compiler', label: 'Compiler' },
                    { value: 'datasheet', label: 'Case File' }
                ]
            }
        };
        let setPickOpen = '';

        function pickLabel(id, value) {
            const spec = SET_PICKS[id];
            if (!spec) return '';
            const hit = spec.options.filter(function (item) { return item.value === value; })[0];
            return (hit && hit.label) || spec.options[0].label;
        }

        function syncSetPickLabels() {
            Object.keys(SET_PICKS).forEach(function (id) {
                const spec = SET_PICKS[id];
                const node = document.getElementById(spec.labelId);
                if (node) node.textContent = pickLabel(id, spec.value());
            });
        }

        function closeSetPick() {
            setPickOpen = '';
            const menu = document.getElementById('setPickMenu');
            if (menu) {
                menu.hidden = true;
                menu.innerHTML = '';
                menu.classList.remove('is-up');
            }
            document.querySelectorAll('.set-pick.is-open').forEach(function (el) {
                el.classList.remove('is-open');
            });
            document.querySelectorAll('.set-pick-btn').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
            });
        }

        function applySetPick(id, value) {
            if (id === 'bomb') {
                if (value === 'now') {
                    armLogicBombNow();
                    return;
                }
                bombPrevPeriod = value;
                patchSettings({ logicBombPeriod: value, lastSeen: Date.now() });
                syncSettingsForm();
                return;
            }
            if (id === 'clip') patchSettings({ clipClear: value || 'off' });
            if (id === 'idle') {
                patchSettings({ idleLock: value || 'off' });
                applyAppSettings();
            }
            if (id === 'start') patchSettings({ startPage: value || 'orbit' });
            syncSetPickLabels();
        }

        function openSetPick(id, btn) {
            const spec = SET_PICKS[id];
            const menu = document.getElementById('setPickMenu');
            if (!spec || !menu || !btn) return;
            if (setPickOpen === id) {
                closeSetPick();
                return;
            }
            closeSetPick();
            const current = spec.value();
            const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
            menu.innerHTML = spec.options.map(function (item) {
                const sep = item.sep ? '<div class="set-pick-sep"></div>' : '';
                const cls = [
                    item.value === current ? 'is-active' : '',
                    item.danger ? 'is-danger' : ''
                ].filter(Boolean).join(' ');
                return sep + '<button type="button" role="option" data-set-value="' + item.value + '" class="' + cls + '"' +
                    (item.value === current ? ' aria-selected="true"' : '') + '>' +
                    '<span>' + item.label + '</span>' + check + '</button>';
            }).join('');
            menu.hidden = false;
            const wrap = btn.closest('.set-pick');
            if (wrap) wrap.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            setPickOpen = id;
            const rect = btn.getBoundingClientRect();
            const width = Math.max(rect.width, 188);
            menu.style.minWidth = width + 'px';
            menu.style.left = Math.min(rect.left, window.innerWidth - width - 12) + 'px';
            menu.style.top = (rect.bottom + 6) + 'px';
            const spaceBelow = window.innerHeight - rect.bottom - 16;
            const spaceAbove = rect.top - 16;
            if (menu.offsetHeight > spaceBelow && spaceAbove > spaceBelow) {
                menu.classList.add('is-up');
                menu.style.top = Math.max(12, rect.top - 6 - menu.offsetHeight) + 'px';
            } else {
                menu.classList.remove('is-up');
            }
        }

        function stripExportMedia(bundle) {
            const next = bundle && typeof bundle === 'object' ? JSON.parse(JSON.stringify(bundle)) : {};
            next.facts = next.facts || {};
            next.facts.image = [];
            Object.keys(next.facts).forEach(function (id) {
                (next.facts[id] || []).forEach(function (item) {
                    if (!item || typeof item !== 'object') return;
                    delete item.media;
                    delete item.preview;
                    delete item.src;
                    delete item.thumb;
                });
            });
            return next;
        }

        function applyStealthTitle() {
            if (!appSettings.stealthTab) {
                document.title = LIVE_TITLE;
                return;
            }
            document.title = document.hidden ? STEALTH_TITLE : LIVE_TITLE;
        }

        function coverWorkspace(on) {
            const curtain = document.getElementById('lockCurtain');
            if (!curtain) return;
            curtain.hidden = !on;
        }

        function bumpIdleLock() {
            clearTimeout(idleLockTimer);
            idleLockTimer = 0;
            const mins = Number(appSettings.idleLock);
            if (!mins) {
                coverWorkspace(false);
                return;
            }
            idleLockTimer = setTimeout(function () {
                coverWorkspace(true);
            }, mins * 60000);
        }

        function applyAppSettings(fromUser) {
            const root = document.documentElement;
            const body = document.body;
            if (body) {
                body.classList.toggle('is-curtain', !!appSettings.curtain);
                body.classList.toggle('hide-tips', !!appSettings.hideTips);
                body.classList.toggle('no-bg', !!appSettings.hideBackground);
                body.classList.toggle('investigator-mode', appSettings.investigatorMode !== false);
            }
            root.classList.toggle('reduce-motion', !!appSettings.reduceMotion);
            root.classList.toggle('large-type', !!appSettings.largeType);
            applyStealthTitle();
            bumpIdleLock();
            try { reduceMotion = reduceMotionOn(); } catch (error) {}
            try {
                if (orbit) {
                    if (reduceMotionOn()) {
                        orbit.targetParallaxX = 0;
                        orbit.targetParallaxY = 0;
                        orbit.parallaxX = 0;
                        orbit.parallaxY = 0;
                    }
                    if (typeof kickOrbit === 'function') kickOrbit();
                }
            } catch (error) {}
            try {
                window.dispatchEvent(new CustomEvent('orbint-motion', { detail: { reduceMotion: reduceMotionOn() } }));
            } catch (error) {}
            if (fromUser) {
                try {
                    window.dispatchEvent(new CustomEvent('orbint-settings', { detail: Object.assign({}, appSettings) }));
                } catch (error) {}
            }
            syncBombTag();
        }

        function syncBombTag() {
            const tag = document.getElementById('bombTag');
            if (!tag) return;
            tag.hidden = !appSettings.logicBomb;
        }

        function syncSettingsForm() {
            bombPulseLow = false;
            const bomb = document.getElementById('setLogicBomb');
            const box = document.getElementById('setBombBox');
            const map = {
                setCurtain: 'curtain',
                setConfirmOut: 'confirmOutbound',
                setStealth: 'stealthTab',
                setReduceMotion: 'reduceMotion',
                setHideTips: 'hideTips',
                setLargeType: 'largeType',
                setRememberPage: 'rememberPage',
                setHideBg: 'hideBackground',
                setExportNoPhotos: 'exportNoPhotos',
                setInvestigator: 'investigatorMode'
            };
            if (bomb) bomb.checked = !!appSettings.logicBomb;
            bombPrevPeriod = appSettings.logicBombPeriod === 'now' ? '6m' : (appSettings.logicBombPeriod || '6m');
            if (box) box.classList.toggle('is-open', !!appSettings.logicBomb);
            Object.keys(map).forEach(function (id) {
                const el = document.getElementById(id);
                if (el) el.checked = !!appSettings[map[id]];
            });
            const api = document.getElementById('setShareApi');
            const watch = document.getElementById('setCollabWs');
            if (api && document.activeElement !== api) api.value = appSettings.shareApiUrl || '';
            if (watch && document.activeElement !== watch) watch.value = appSettings.collabWsUrl || '';
            updateBombCountdown();
            syncSetPickLabels();
        }

        window.OrbINTSettings = {
            get: function (key) {
                return key ? appSettings[key] : Object.assign({}, appSettings);
            },
            set: function (partial) {
                const next = patchSettings(partial);
                applyAppSettings(true);
                return next;
            }
        };

        appSettings = readSettings();
        if (!appSettings.lastSeen) markSeen();
        try {
            const root = document.documentElement;
            const body = document.body;
            if (body) {
                body.classList.toggle('is-curtain', !!appSettings.curtain);
                body.classList.toggle('hide-tips', !!appSettings.hideTips);
                body.classList.toggle('no-bg', !!appSettings.hideBackground);
                body.classList.toggle('investigator-mode', appSettings.investigatorMode !== false);
            }
            root.classList.toggle('reduce-motion', !!appSettings.reduceMotion);
            root.classList.toggle('large-type', !!appSettings.largeType);
        } catch (error) {}
        window.open = function (url, name, specs) {
            if (appSettings.confirmOutbound && shouldConfirmOpen(url)) {
                if (!window.confirm('Open this site?\n\n' + url)) return null;
            }
            return nativeOpen(url, name, specs);
        };
        if (nativeWriteText && navigator.clipboard) {
            navigator.clipboard.writeText = function (text) {
                return nativeWriteText(text).then(function () {
                    clearTimeout(clipClearTimer);
                    const wait = Number(appSettings.clipClear);
                    if (!wait) return;
                    clipClearTimer = setTimeout(function () {
                        nativeWriteText('').catch(function () {});
                    }, wait * 1000);
                });
            };
        }
