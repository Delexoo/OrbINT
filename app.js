/* Assembled from js/orbit-settings.js, orbit-fields.js, orbit-library.js, crypto-share.js, orbit-map.js
   Edit those files, then run: python tools/bundle.py */

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

        function platformSearch(label) {
            return (h) => 'https://www.google.com/search?q=' + encodeURIComponent(h + ' ' + label);
        }

        const PLATFORMS = [
            { id: 'instagram', label: 'Instagram', color: '#E1306C', profile: (h) => 'https://www.instagram.com/' + h },
            { id: 'tiktok', label: 'TikTok', color: '#ffffff', profile: (h) => 'https://www.tiktok.com/@' + h },
            { id: 'youtube', label: 'YouTube', color: '#FF0000', profile: (h) => 'https://www.youtube.com/@' + h },
            { id: 'x', label: 'X', color: '#e4e4e7', profile: (h) => 'https://x.com/' + h },
            { id: 'facebook', label: 'Facebook', color: '#1877F2', profile: (h) => 'https://www.facebook.com/' + h },
            { id: 'snapchat', label: 'Snapchat', color: '#FFFC00', profile: (h) => 'https://www.snapchat.com/add/' + h },
            { id: 'discord', label: 'Discord', color: '#5865F2', profile: platformSearch('Discord') },
            { id: 'reddit', label: 'Reddit', color: '#FF4500', profile: (h) => 'https://www.reddit.com/user/' + h },
            { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', profile: (h) => 'https://www.linkedin.com/in/' + h },
            { id: 'telegram', label: 'Telegram', color: '#2AABEE', profile: (h) => 'https://t.me/' + h },
            { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', profile: platformSearch('WhatsApp') },
            { id: 'threads', label: 'Threads', color: '#e4e4e7', profile: (h) => 'https://www.threads.net/@' + h },
            { id: 'pinterest', label: 'Pinterest', color: '#E60023', profile: (h) => 'https://www.pinterest.com/' + h },
            { id: 'twitch', label: 'Twitch', color: '#9146FF', profile: (h) => 'https://www.twitch.tv/' + h },
            { id: 'kick', label: 'Kick', color: '#53FC18', profile: (h) => 'https://kick.com/' + h },
            { id: 'bluesky', label: 'Bluesky', color: '#1185FE', profile: (h) => 'https://bsky.app/profile/' + h },
            { id: 'mastodon', label: 'Mastodon', color: '#6364FF', profile: platformSearch('Mastodon') },
            { id: 'truthsocial', label: 'Truth Social', color: '#5B4BFF', profile: (h) => 'https://truthsocial.com/@' + h },
            { id: 'tumblr', label: 'Tumblr', color: '#001935', profile: (h) => 'https://www.tumblr.com/' + h },
            { id: 'bereal', label: 'BeReal', color: '#e4e4e7', profile: platformSearch('BeReal') },
            { id: 'vsco', label: 'VSCO', color: '#e4e4e7', profile: (h) => 'https://vsco.co/' + h },
            { id: 'flickr', label: 'Flickr', color: '#FF0084', profile: (h) => 'https://www.flickr.com/people/' + h },
            { id: 'imgur', label: 'Imgur', color: '#1BB76E', profile: (h) => 'https://imgur.com/user/' + h },
            { id: 'vimeo', label: 'Vimeo', color: '#1AB7EA', profile: (h) => 'https://vimeo.com/' + h },
            { id: 'rumble', label: 'Rumble', color: '#85C742', profile: (h) => 'https://rumble.com/user/' + h },
            { id: 'github', label: 'GitHub', color: '#e4e4e7', profile: (h) => 'https://github.com/' + h },
            { id: 'gitlab', label: 'GitLab', color: '#FC6D26', profile: (h) => 'https://gitlab.com/' + h },
            { id: 'bitbucket', label: 'Bitbucket', color: '#2684FF', profile: (h) => 'https://bitbucket.org/' + h },
            { id: 'stackoverflow', label: 'Stack Overflow', color: '#F48024', profile: platformSearch('Stack Overflow') },
            { id: 'medium', label: 'Medium', color: '#e4e4e7', profile: (h) => 'https://medium.com/@' + h },
            { id: 'substack', label: 'Substack', color: '#FF6719', profile: platformSearch('Substack') },
            { id: 'patreon', label: 'Patreon', color: '#FF424D', profile: (h) => 'https://www.patreon.com/' + h },
            { id: 'onlyfans', label: 'OnlyFans', color: '#00AFF0', profile: (h) => 'https://onlyfans.com/' + h },
            { id: 'spotify', label: 'Spotify', color: '#1DB954', profile: platformSearch('Spotify') },
            { id: 'soundcloud', label: 'SoundCloud', color: '#FF5500', profile: (h) => 'https://soundcloud.com/' + h },
            { id: 'bandcamp', label: 'Bandcamp', color: '#1DA0C3', profile: platformSearch('Bandcamp') },
            { id: 'lastfm', label: 'Last.fm', color: '#D51007', profile: (h) => 'https://www.last.fm/user/' + h },
            { id: 'steam', label: 'Steam', color: '#66C0F4', profile: platformSearch('Steam') },
            { id: 'xbox', label: 'Xbox', color: '#107C10', profile: platformSearch('Xbox') },
            { id: 'playstation', label: 'PlayStation', color: '#0070D1', profile: platformSearch('PlayStation') },
            { id: 'nintendo', label: 'Nintendo', color: '#E60012', profile: platformSearch('Nintendo') },
            { id: 'epic', label: 'Epic Games', color: '#e4e4e7', profile: platformSearch('Epic Games') },
            { id: 'roblox', label: 'Roblox', color: '#e4e4e7', profile: (h) => 'https://www.roblox.com/search/users?keyword=' + encodeURIComponent(h) },
            { id: 'minecraft', label: 'Minecraft', color: '#62A73B', profile: platformSearch('Minecraft') },
            { id: 'discordalt', label: 'Revolt', color: '#C0C0C0', profile: platformSearch('Revolt') },
            { id: 'signal', label: 'Signal', color: '#3A76F0', profile: platformSearch('Signal') },
            { id: 'messenger', label: 'Messenger', color: '#006AFF', profile: platformSearch('Messenger') },
            { id: 'skype', label: 'Skype', color: '#00AFF0', profile: platformSearch('Skype') },
            { id: 'slack', label: 'Slack', color: '#4A154B', profile: platformSearch('Slack') },
            { id: 'teams', label: 'Microsoft Teams', color: '#6264A7', profile: platformSearch('Microsoft Teams') },
            { id: 'zoom', label: 'Zoom', color: '#2D8CFF', profile: platformSearch('Zoom') },
            { id: 'vk', label: 'VK', color: '#0077FF', profile: (h) => 'https://vk.com/' + h },
            { id: 'okru', label: 'Odnoklassniki', color: '#EE8208', profile: (h) => 'https://ok.ru/' + h },
            { id: 'wechat', label: 'WeChat', color: '#07C160', profile: platformSearch('WeChat') },
            { id: 'weibo', label: 'Weibo', color: '#E6162D', profile: platformSearch('Weibo') },
            { id: 'qq', label: 'QQ', color: '#12B7F5', profile: platformSearch('QQ') },
            { id: 'line', label: 'LINE', color: '#00C300', profile: platformSearch('LINE') },
            { id: 'kakaotalk', label: 'KakaoTalk', color: '#FFCD00', profile: platformSearch('KakaoTalk') },
            { id: 'viber', label: 'Viber', color: '#7360F2', profile: platformSearch('Viber') },
            { id: 'tinder', label: 'Tinder', color: '#FE3C72', profile: platformSearch('Tinder') },
            { id: 'bumble', label: 'Bumble', color: '#FFC629', profile: platformSearch('Bumble') },
            { id: 'hinge', label: 'Hinge', color: '#e4e4e7', profile: platformSearch('Hinge') },
            { id: 'grindr', label: 'Grindr', color: '#FFD900', profile: platformSearch('Grindr') },
            { id: 'okcupid', label: 'OkCupid', color: '#FF3D57', profile: platformSearch('OkCupid') },
            { id: 'badoo', label: 'Badoo', color: '#7833F1', profile: (h) => 'https://badoo.com/profile/' + h },
            { id: 'meetup', label: 'Meetup', color: '#ED1C40', profile: platformSearch('Meetup') },
            { id: 'nextdoor', label: 'Nextdoor', color: '#8ED500', profile: platformSearch('Nextdoor') },
            { id: 'quora', label: 'Quora', color: '#B92B27', profile: (h) => 'https://www.quora.com/profile/' + h },
            { id: 'goodreads', label: 'Goodreads', color: '#372213', profile: platformSearch('Goodreads') },
            { id: 'letterboxd', label: 'Letterboxd', color: '#FF8000', profile: (h) => 'https://letterboxd.com/' + h },
            { id: 'myanimelist', label: 'MyAnimeList', color: '#2E51A2', profile: (h) => 'https://myanimelist.net/profile/' + h },
            { id: 'anilist', label: 'AniList', color: '#02A9FF', profile: (h) => 'https://anilist.co/user/' + h },
            { id: 'strava', label: 'Strava', color: '#FC4C02', profile: platformSearch('Strava') },
            { id: 'untappd', label: 'Untappd', color: '#FFC000', profile: (h) => 'https://untappd.com/user/' + h },
            { id: 'foursquare', label: 'Foursquare', color: '#F94877', profile: platformSearch('Foursquare') },
            { id: 'yelp', label: 'Yelp', color: '#FF1A1A', profile: platformSearch('Yelp') },
            { id: 'tripadvisor', label: 'Tripadvisor', color: '#34E0A1', profile: platformSearch('Tripadvisor') },
            { id: 'airbnb', label: 'Airbnb', color: '#FF5A5F', profile: platformSearch('Airbnb') },
            { id: 'ebay', label: 'eBay', color: '#E53238', profile: platformSearch('eBay') },
            { id: 'etsy', label: 'Etsy', color: '#F56400', profile: (h) => 'https://www.etsy.com/shop/' + h },
            { id: 'amazon', label: 'Amazon', color: '#FF9900', profile: platformSearch('Amazon') },
            { id: 'paypal', label: 'PayPal', color: '#003087', profile: platformSearch('PayPal') },
            { id: 'venmo', label: 'Venmo', color: '#008CFF', profile: (h) => 'https://venmo.com/' + h },
            { id: 'cashapp', label: 'Cash App', color: '#00D632', profile: (h) => 'https://cash.app/$' + h },
            { id: 'deviantart', label: 'DeviantArt', color: '#05CC47', profile: (h) => 'https://www.deviantart.com/' + h },
            { id: 'behance', label: 'Behance', color: '#1769FF', profile: (h) => 'https://www.behance.net/' + h },
            { id: 'dribbble', label: 'Dribbble', color: '#EA4C89', profile: (h) => 'https://dribbble.com/' + h },
            { id: 'artstation', label: 'ArtStation', color: '#13AFF0', profile: (h) => 'https://www.artstation.com/' + h },
            { id: 'figma', label: 'Figma', color: '#F24E1E', profile: platformSearch('Figma') },
            { id: 'canva', label: 'Canva', color: '#00C4CC', profile: platformSearch('Canva') },
            { id: 'wordpress', label: 'WordPress', color: '#21759B', profile: platformSearch('WordPress') },
            { id: 'blogger', label: 'Blogger', color: '#FF5722', profile: platformSearch('Blogger') },
            { id: 'livejournal', label: 'LiveJournal', color: '#00B0EA', profile: (h) => 'https://' + h + '.livejournal.com' },
            { id: 'wattpad', label: 'Wattpad', color: '#FF500A', profile: (h) => 'https://www.wattpad.com/user/' + h },
            { id: 'ao3', label: 'Archive of Our Own', color: '#990000', profile: platformSearch('AO3') },
            { id: 'producthunt', label: 'Product Hunt', color: '#DA552F', profile: (h) => 'https://www.producthunt.com/@' + h },
            { id: 'hackernews', label: 'Hacker News', color: '#FF6600', profile: (h) => 'https://news.ycombinator.com/user?id=' + encodeURIComponent(h) },
            { id: 'kaggle', label: 'Kaggle', color: '#20BEFF', profile: (h) => 'https://www.kaggle.com/' + h },
            { id: 'replit', label: 'Replit', color: '#F26207', profile: (h) => 'https://replit.com/@' + h },
            { id: 'codepen', label: 'CodePen', color: '#e4e4e7', profile: (h) => 'https://codepen.io/' + h },
            { id: 'notion', label: 'Notion', color: '#e4e4e7', profile: platformSearch('Notion') },
            { id: 'dropbox', label: 'Dropbox', color: '#0061FF', profile: platformSearch('Dropbox') },
            { id: 'google', label: 'Google', color: '#4285F4', profile: platformSearch('Google') },
            { id: 'apple', label: 'Apple', color: '#e4e4e7', profile: platformSearch('Apple') },
            { id: 'microsoft', label: 'Microsoft', color: '#00A4EF', profile: platformSearch('Microsoft') },
            { id: 'icloud', label: 'iCloud', color: '#3693F3', profile: platformSearch('iCloud') },
            { id: 'myspace', label: 'Myspace', color: '#030303', profile: platformSearch('Myspace') },
            { id: 'other', label: 'Other', color: '#a1a1aa', profile: platformSearch('') }
        ];

        function platformMark(platform) {
            if (!platform) return '';
            if (platform.custom || platform.id === 'other' || String(platform.id).indexOf('custom-') === 0) {
                return platformLetterMark(platform);
            }
            return '<img class="platform-logo" src="icons/platforms/' + platform.id + '.svg" alt="" width="18" height="18">';
        }

        function platformLetterMark(platform) {
            const ch = String((platform && platform.label) || '?').replace(/[^A-Za-z0-9]/g, '').charAt(0) || '?';
            return '<span class="platform-letter">' + escapeHtml(ch.toUpperCase()) + '</span>';
        }

        function customPlatformId(label) {
            const slug = String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'site';
            return 'custom-' + slug;
        }

        function hydrateCustomPlatform(raw) {
            const label = String((raw && (raw.label || raw.id)) || '').replace(/^custom-/, ' ').replace(/-/g, ' ').trim();
            const named = String((raw && raw.label) || label).trim().slice(0, 48);
            if (!named) return null;
            const id = String((raw && raw.id) || customPlatformId(named));
            if (PLATFORMS.some((item) => item.id === id)) return null;
            return {
                id: id,
                label: named,
                color: (raw && raw.color) || '#a1a1aa',
                custom: true,
                profile: platformSearch(named)
            };
        }

        function collectCustomPlatforms() {
            const seen = {};
            const list = [];
            function add(raw) {
                const platform = hydrateCustomPlatform(raw);
                if (!platform || seen[platform.id]) return;
                seen[platform.id] = true;
                list.push(platform);
            }
            (profile && profile.customPlatforms || []).forEach(add);
            Object.keys((profile && profile.facts) || {}).forEach((fieldId) => {
                ((profile.facts[fieldId]) || []).forEach((item) => {
                    if (!item || !item.platform || String(item.platform).indexOf('custom-') !== 0) return;
                    add({ id: item.platform, label: item.platformLabel || '' });
                });
            });
            return list;
        }

        function listedPlatforms() {
            return PLATFORMS.filter((item) => item.id !== 'other').concat(collectCustomPlatforms());
        }

        function rememberCustomPlatform(platform) {
            if (!platform || !platform.custom) return platform;
            profile.customPlatforms = Array.isArray(profile.customPlatforms) ? profile.customPlatforms : [];
            if (!profile.customPlatforms.some((item) => item.id === platform.id)) {
                profile.customPlatforms.push({ id: platform.id, label: platform.label, color: platform.color });
            }
            return platform;
        }

        function makeCustomPlatform(label) {
            const named = String(label || '').trim().replace(/\s+/g, ' ').slice(0, 48);
            if (!named) return null;
            const existing = listedPlatforms().find((item) => item.label.toLowerCase() === named.toLowerCase() || item.id === named.toLowerCase());
            if (existing) return existing;
            return rememberCustomPlatform(hydrateCustomPlatform({ id: customPlatformId(named), label: named }));
        }

        function platformById(id) {
            if (!id) return null;
            return listedPlatforms().find((item) => item.id === id) || PLATFORMS.find((item) => item.id === id) || null;
        }

        function usernameHandle(value) {
            return String(value || '').replace(/^@/, '').trim();
        }

        function isPlatformField(id) {
            const base = fieldBase(id);
            return base === 'username' || base === 'password';
        }

        function storedFieldPlatform(fieldId) {
            const facts = (profile.facts && profile.facts[fieldId]) || [];
            for (let i = facts.length - 1; i >= 0; i--) {
                const item = facts[i];
                if (item && item.platform && platformById(item.platform)) return item.platform;
            }
            return '';
        }

        function fieldPlatformId(fieldId) {
            const stored = storedFieldPlatform(fieldId);
            if (stored) return stored;
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const raw = (node && node.dataset.platform) || '';
            if (platformById(raw)) return raw;
            const fact = typeof latestFact === 'function' ? latestFact(fieldId) : null;
            const value = (fact && fact.value) || (document.getElementById('field-' + fieldId) || {}).value || '';
            if (typeof platformFromUrl === 'function' && looksLikeUrl(value)) {
                const fromUrl = platformFromUrl(value);
                if (fromUrl) return fromUrl.id;
            }
            return '';
        }

        function setFieldPlatform(fieldId, platformId) {
            if (!isPlatformField(fieldId)) return;
            profile.facts = profile.facts || {};
            profile.facts[fieldId] = profile.facts[fieldId] || [];
            let current = profile.facts[fieldId][profile.facts[fieldId].length - 1];
            const platform = platformById(platformId);
            if (!current) {
                if (!platform) return;
                current = { value: '', platform: platform.id, addedAt: new Date().toISOString() };
                if (platform.custom) current.platformLabel = platform.label;
                profile.facts[fieldId].push(current);
            } else if (platform) {
                current.platform = platform.id;
                if (platform.custom) current.platformLabel = platform.label;
                else delete current.platformLabel;
            } else {
                delete current.platform;
                if (!String(current.value || '').trim()) profile.facts[fieldId].pop();
            }
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) node.dataset.platform = platform ? platform.id : '';
            if (typeof saveProfile === 'function') saveProfile();
        }

        const SECRET_FIELD_RE = /\b(password|passwd|passphrase|passcode|pin|ssn|national[- ]?id|drivers?[- ]?license|passport|tax[- ]?id|iban|routing|bank[- ]?account|credit[- ]?card|medicare|medical|biometric|dna|secret|token|api[- ]?key|private[- ]?key|seed[- ]?phrase|recovery[- ]?code|2fa|totp|otp|session|cookie)\b/i;

        function isSecretField(id) {
            const base = fieldBase(id);
            if (base === 'password') return true;
            const field = fieldById(id);
            if (field && (field.group === 'spii' || fieldGroupId(field) === 'spii')) return true;
            const preset = EXTRA_PRESETS.find((item) => item.id === base);
            if (preset && preset.group === 'spii') return true;
            const blob = [base, field && field.id, field && field.label, field && field.placeholder, preset && preset.label].filter(Boolean).join(' ');
            return SECRET_FIELD_RE.test(blob);
        }

        function secretIsOpen(fieldId) {
            return revealedPasswords.has(fieldId);
        }

        function secretAriaLabel(fieldId, open) {
            const noun = fieldBase(fieldId) === 'password' ? 'password' : 'value';
            return (open ? 'Hide ' : 'Show ') + noun;
        }

        function isMapsField(id) {
            return fieldBase(id) === 'address';
        }

        function isThumbField(id) {
            const base = fieldBase(id);
            return base === 'image' || base === 'audio' || base === 'ip' || base === 'address';
        }

        function isEmailField(id) {
            const base = fieldBase(id);
            return base === 'email' || base === 'email2';
        }

        const EMAIL_DOMAIN_PLATFORMS = {
            'gmail.com': 'google',
            'googlemail.com': 'google',
            'google.com': 'google',
            'outlook.com': 'microsoft',
            'outlook.co.uk': 'microsoft',
            'outlook.fr': 'microsoft',
            'outlook.de': 'microsoft',
            'hotmail.com': 'microsoft',
            'hotmail.co.uk': 'microsoft',
            'hotmail.fr': 'microsoft',
            'live.com': 'microsoft',
            'live.co.uk': 'microsoft',
            'msn.com': 'microsoft',
            'icloud.com': 'icloud',
            'icloud.com.cn': 'icloud',
            'me.com': 'icloud',
            'mac.com': 'icloud',
            'apple.com': 'apple',
            'github.com': 'github',
            'users.noreply.github.com': 'github',
            'gitlab.com': 'gitlab',
            'bitbucket.org': 'bitbucket',
            'facebook.com': 'facebook',
            'messenger.com': 'messenger',
            'qq.com': 'qq',
            'foxmail.com': 'qq',
            'linkedin.com': 'linkedin',
            'paypal.com': 'paypal',
            'amazon.com': 'amazon'
        };

        function emailDomain(value) {
            const raw = String(value || '').trim().replace(/^mailto:/i, '');
            const at = raw.lastIndexOf('@');
            if (at < 0) return '';
            return raw.slice(at + 1).replace(/[>\s].*$/, '').replace(/\.$/, '').toLowerCase();
        }

        function platformFieldPlaceholder(id) {
            return fieldBase(id) === 'password' ? 'Password' : '@username';
        }

        function passwordLeads(value, fact) {
            const platform = fact && platformById(fact.platform);
            const leads = [];
            if (platform) {
                leads.push([platform.label, 'The associated site', 'https://www.google.com/search?q=' + encodeURIComponent(platform.label)]);
            }
            leads.push(
                ['Have I Been Pwned', 'Check breach exposure', 'https://haveibeenpwned.com/Passwords'],
                ['Intelligence X', 'Public leak collections', 'https://intelx.io/'],
                ['DeHashed', 'Breach compilation search', 'https://dehashed.com/']
            );
            return leads;
        }

        function usernameLeads(value, fact) {
            const handle = usernameHandle(value);
            const platform = fact && platformById(fact.platform);
            const leads = [];
            if (platform) {
                leads.push([platform.label, 'Open this ' + platform.label + ' profile', platform.profile(handle)]);
            }
            leads.push(
                ['WhatsMyName', 'Where this handle exists', 'https://whatsmyname.app/'],
                ['Namechk', 'Other accounts with this handle', 'https://namechk.com/' + encodeURIComponent(handle)],
                ['Instant Username', 'Availability across sites', 'https://instantusername.com/#' + encodeURIComponent(handle)],
                ['KnowEm', 'Username check', 'https://knowem.com/checkusernames.php?u=' + encodeURIComponent(handle)],
                ['IDCrawl', 'People and handle search', 'https://www.idcrawl.com/' + encodeURIComponent(handle)],
                ['GitHub', 'Commits, email, and bio clues', 'https://github.com/' + encodeURIComponent(handle)],
                ['Reddit', 'Communities and writing style', 'https://www.reddit.com/search/?q=' + encodeURIComponent(handle)],
                ['Public mentions', 'Web mentions of the handle', 'https://www.google.com/search?q=' + encodeURIComponent('"' + handle + '"')]
            );
            return leads;
        }

        const FIELDS = [
            {
                id: 'phone',
                label: 'Phone',
                placeholder: '(555) 123-4567',
                leads: (v) => [
                    ['Reverse lookup', 'Whitepages / Truecaller / Spokeo', 'https://www.whitepages.com/phone/' + encodeURIComponent(v.replace(/\D/g, ''))],
                    ['Truecaller', 'Name and spam reports', 'https://www.truecaller.com/search/' + encodeURIComponent(v.replace(/\D/g, ''))],
                    ['Social search', 'If the number is linked to WhatsApp, Telegram, or Facebook', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '"')],
                    ['Carrier / region', 'Prefix and area-code location', 'https://www.allareacodes.com/' + encodeURIComponent(v.replace(/\D/g, '').slice(0, 3))]
                ]
            },
            {
                id: 'name',
                label: 'Name',
                placeholder: 'Full name',
                leads: (v) => [
                    ['People search', 'Public directories and records', 'https://www.google.com/search?q=' + encodeURIComponent(v + ' phone address')],
                    ['LinkedIn', 'Employment and education', 'https://www.linkedin.com/search/results/all/?keywords=' + encodeURIComponent(v)],
                    ['Facebook', 'Social profiles', 'https://www.facebook.com/search/people/?q=' + encodeURIComponent(v)],
                    ['Username check', 'Namechk / Instant Username', 'https://namechk.com/' + encodeURIComponent(v.replace(/\s+/g, ''))]
                ]
            },
            {
                id: 'email',
                label: 'Email',
                placeholder: 'name@domain.com',
                leads: (v) => [
                    ['Have I Been Pwned', 'Breach exposure', 'https://haveibeenpwned.com/account/' + encodeURIComponent(v)],
                    ['Gravatar', 'Linked avatar and profile', 'https://en.gravatar.com/' + encodeURIComponent(v)],
                    ['GitHub', 'Accounts using this email', 'https://github.com/search?q=' + encodeURIComponent(v) + '&type=users'],
                    ['Domain MX', 'Where the mailbox is hosted', 'https://dns.google/query?name=' + encodeURIComponent(v.split('@')[1] || '') + '&type=MX']
                ]
            },
            {
                id: 'image',
                label: 'Image',
                placeholder: 'Image URL',
                file: 'image/*',
                leads: (v) => DEEP_LINKS.image(v)
            },
            {
                id: 'username',
                label: 'Username',
                placeholder: '@username',
                leads: (v, fact) => usernameLeads(v, fact)
            },
            {
                id: 'password',
                label: 'Password',
                placeholder: 'Password',
                caution: 'File it as a case fact. Search exposure and related accounts.',
                leads: (v, fact) => passwordLeads(v, fact)
            },
            {
                id: 'address',
                label: 'Address',
                placeholder: 'Street, city',
                leads: (v) => [
                    ['Maps', 'Street and satellite view', 'https://www.google.com/maps/search/' + encodeURIComponent(v)],
                    ['Zillow', 'Property and resident clues', 'https://www.zillow.com/homes/' + encodeURIComponent(v) + '_rb/'],
                    ['Local news', 'Public mentions of the address', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'ip',
                label: 'IP',
                placeholder: '1.2.3.4',
                leads: (v) => [
                    ['IPInfo', 'Approx. location and org', 'https://ipinfo.io/' + encodeURIComponent(v)],
                    ['ARIN / WHOIS', 'Allocation and organization', 'https://whois.arin.net/rest/ip/' + encodeURIComponent(v)],
                    ['Shodan', 'Public services on this host', 'https://www.shodan.io/host/' + encodeURIComponent(v)],
                    ['VirusTotal', 'Reputation', 'https://www.virustotal.com/gui/ip-address/' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'plate',
                label: 'Plate',
                placeholder: 'Plate text',
                caution: 'Run the plate through photos, indexes, and vehicle records.',
                leads: (v) => [
                    ['Web mentions', 'Photos, posts, or dashcam stills', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '" license plate')],
                    ['Image search', 'The plate in pictures', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v + ' license plate')],
                    ['FindByPlate', 'Plate lookup', 'https://findbyplate.com/'],
                    ['FaxVin', 'Plate and VIN records', 'https://www.faxvin.com/license-plate-lookup']
                ]
            },
            {
                id: 'vehicle',
                label: 'Vehicle',
                placeholder: 'Make and model',
                leads: (v) => [
                    ['Google', 'Public mentions', 'https://www.google.com/search?q=' + encodeURIComponent(v)],
                    ['Images', 'Photos of this vehicle', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v)],
                    ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'age',
                label: 'Age',
                placeholder: 'Age',
                leads: (v) => [
                    ['Google', 'Age with a name or place', 'https://www.google.com/search?q=' + encodeURIComponent(v + ' years old')],
                    ['People search', 'Directories that list age', 'https://www.truepeoplesearch.com/']
                ]
            },
            {
                id: 'dob',
                label: 'Birthday',
                placeholder: 'Date of birth',
                leads: (v) => [
                    ['Google', 'Quoted date with a name', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '"')],
                    ['FamilySearch', 'Vital records', 'https://www.familysearch.org/search/'],
                    ['News', 'Mentions of the date', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'countrycode',
                label: 'Country code',
                placeholder: 'Country',
                leads: (v) => {
                    const meta = countryCodeMeta(v);
                    const q = meta ? meta.dial + ' ' + meta.name : v;
                    return [
                        ['Country calling codes', 'ITU / dialing reference', 'https://www.countrycode.org/'],
                        ['Google', 'Dialing code and carriers', 'https://www.google.com/search?q=' + encodeURIComponent(q + ' country calling code')]
                    ];
                }
            },
            {
                id: 'phoneos',
                label: 'Phone OS',
                placeholder: 'iOS 18, Android 15…',
                leads: (v) => [
                    ['Google', 'Mobile OS mentions', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '"')],
                    ['Apple', 'iOS release notes', 'https://support.apple.com/en-us/HT201222'],
                    ['Android', 'Release notes', 'https://developer.android.com/about/versions']
                ]
            },
            {
                id: 'os',
                label: 'Computer OS',
                placeholder: 'Windows 11, macOS…',
                leads: (v) => [
                    ['Google', 'Desktop OS mentions', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '"')],
                    ['Microsoft', 'Windows support', 'https://learn.microsoft.com/windows/release-health/'],
                    ['Apple', 'macOS releases', 'https://support.apple.com/en-us/HT201222']
                ]
            },
            {
                id: 'occupation',
                label: 'Occupation',
                placeholder: 'Job title or trade',
                leads: (v) => [
                    ['LinkedIn', 'People with this title', 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(v)],
                    ['Google', 'Public mentions', 'https://www.google.com/search?q=' + encodeURIComponent(v)],
                    ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'domain',
                label: 'Website',
                placeholder: 'example.com',
                leads: (v) => [
                    ['Live Domain Intel', 'DNS, RDAP, certs, subdomains, archives, stack', 'orbint:intel'],
                    ['WHOIS', 'Registrant and history clues', 'https://whois.net/' + encodeURIComponent(v.replace(/^https?:\/\//, '').split('/')[0])],
                    ['crt.sh', 'Certificates and linked emails', 'https://crt.sh/?q=' + encodeURIComponent(v)],
                    ['Wayback', 'Historical site content', 'https://web.archive.org/web/*/' + encodeURIComponent(v)],
                    ['BuiltWith', 'Technology fingerprints', 'https://builtwith.com/' + encodeURIComponent(v.replace(/^https?:\/\//, '').split('/')[0])],
                    ['DNS', 'Hosting and mail records', 'https://dns.google/query?name=' + encodeURIComponent(v.replace(/^https?:\/\//, '').split('/')[0])]
                ]
            },
            {
                id: 'timezone',
                label: 'Timezone',
                placeholder: 'Zone',
                leads: (v) => [
                    ['Time and Date', 'World clock for this zone', 'https://www.timeanddate.com/worldclock/results.html?query=' + encodeURIComponent(v)],
                    ['Google', 'Offset, DST, and cities', 'https://www.google.com/search?q=' + encodeURIComponent(v + ' timezone')]
                ]
            },
            {
                id: 'crypto',
                label: 'Wallet',
                placeholder: 'Address',
                leads: (v) => [
                    ['Etherscan', 'Ethereum activity', 'https://etherscan.io/address/' + encodeURIComponent(v)],
                    ['Blockchain.com', 'Bitcoin explorer', 'https://www.blockchain.com/explorer/search?search=' + encodeURIComponent(v)],
                    ['Public mentions', 'Bios, signatures, and posts', 'https://www.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'notes',
                label: 'Notes',
                placeholder: 'Case note',
                leads: (v) => [
                    ['Search the note', 'Look up names, places, or phrases from this note', 'https://www.google.com/search?q=' + encodeURIComponent(v)],
                    ['News', 'Reporting that matches this note', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'company',
                label: 'Company',
                placeholder: 'Employer or workplace',
                leads: (v) => [
                    ['OpenCorporates', 'Company filings worldwide', 'https://opencorporates.com/companies?q=' + encodeURIComponent(v)],
                    ['SEC EDGAR', 'US issuer filings', 'https://www.sec.gov/cgi-bin/browse-edgar?company=' + encodeURIComponent(v) + '&action=getcompany'],
                    ['OpenSanctions', 'Watchlists and PEPs', 'https://www.opensanctions.org/search/?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'vin',
                label: 'VIN',
                placeholder: '17-character VIN',
                caution: 'Decode, history, registration, and owner trails.',
                leads: (v) => [
                    ['NHTSA decoder', 'Make, model, and plant', 'https://vpic.nhtsa.dot.gov/decoder/Decoder'],
                    ['NHTSA recalls', 'Public safety recalls', 'https://www.nhtsa.gov/recalls'],
                    ['Google', 'Public mentions of the VIN', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '" VIN')]
                ]
            }
        ];

        const STOCK_IDS = new Set(FIELDS.map((field) => field.id));
        const STOCK_LABELS = Object.fromEntries(FIELDS.map((field) => [field.id, field.label]));

        function gq(q) { return 'https://www.google.com/search?q=' + encodeURIComponent(q); }
        function bq(q) { return 'https://www.bing.com/search?q=' + encodeURIComponent(q); }
        function yq(q) { return 'https://yandex.com/search/?text=' + encodeURIComponent(q); }
        function dq(q) { return 'https://duckduckgo.com/?q=' + encodeURIComponent(q); }
        function quoted(v) { return '"' + String(v || '').trim() + '"'; }

        function engineSet(q) {
            return [
                ['Google', 'Exact and related pages', gq(q)],
                ['Bing', 'Alternate index and cached pages', bq(q)],
                ['Yandex', 'Often different regional hits', yq(q)],
                ['DuckDuckGo', 'Same query, different ranking', dq(q)]
            ];
        }

        const FIND_LINKS = {
            phone: () => [
                ['Google operators', 'Name + city + phone wording', gq('"phone number" OR "cell" OR "mobile"')],
                ['TruePeopleSearch', 'People directories often list numbers', 'https://www.truepeoplesearch.com/'],
                ['FastPeopleSearch', 'Public people directories', 'https://www.fastpeoplesearch.com/'],
                ['Whitepages', 'Directory listings', 'https://www.whitepages.com/'],
                ['Thatsthem', 'Phone and people search', 'https://thatsthem.com/'],
                ['Nuwber', 'People search', 'https://nuwber.com/'],
                ['Truecaller', 'Caller ID search', 'https://www.truecaller.com/'],
                ['GetProspect', 'Public contact finder', 'https://getprospect.com/'],
                ['SignalHire', 'Email / phone finder', 'https://www.signalhire.com/'],
                ['ContactOut', 'Public contact search', 'https://contactout.com/'],
                ['LinkedIn', 'About / contact clues', 'https://www.linkedin.com/search/results/people/'],
                ['Have I Been Pwned', 'If you already have an email', 'https://haveibeenpwned.com/'],
                ['DeHashed', 'Public breach search', 'https://dehashed.com/']
            ],
            name: () => [
                ['TruePeopleSearch', 'Public person records', 'https://www.truepeoplesearch.com/'],
                ['FastPeopleSearch', 'Name and city search', 'https://www.fastpeoplesearch.com/'],
                ['Thatsthem', 'Name, city, and relatives', 'https://thatsthem.com/'],
                ['WebMii', 'Public web footprint', 'https://webmii.com/'],
                ['Nuwber', 'People search', 'https://nuwber.com/'],
                ['FamilySearch', 'Genealogy and vital records', 'https://www.familysearch.org/search/'],
                ['LinkedIn', 'Employment and education', 'https://www.linkedin.com/search/results/people/'],
                ['Facebook', 'People search', 'https://www.facebook.com/search/people/']
            ],
            email: () => [
                ['Hunter', 'Find work emails by domain', 'https://hunter.io/'],
                ['Epieos', 'Accounts tied to an email', 'https://epieos.com/'],
                ['Have I Been Pwned', 'Breach notification', 'https://haveibeenpwned.com/'],
                ['Intelligence X', 'Public intel search', 'https://intelx.io/'],
                ['Thatsthem', 'Email in people records', 'https://thatsthem.com/'],
                ['Gravatar', 'Linked avatar / profile', 'https://en.gravatar.com/'],
                ['LinkedIn', 'Contact / about sections', 'https://www.linkedin.com/search/results/people/']
            ],
            image: () => [
                ['Google Images', 'Upload or paste a photo', 'https://images.google.com/'],
                ['Yandex Images', 'Strong on faces and places', 'https://yandex.com/images/'],
                ['TinEye', 'Find other copies of a photo', 'https://tineye.com/'],
                ['Bing Visual', 'Similar image search', 'https://www.bing.com/visualsearch'],
                ['Forensically', 'Clone and noise analysis', 'https://29a.ch/photo-forensics/'],
                ['FotoForensics', 'Error-level analysis', 'https://fotoforensics.com/'],
                ['InVID / WeVerify', 'Video and image verification', 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/'],
                ['Metadata2Go', 'Read public file metadata', 'https://www.metadata2go.com/']
            ],
            username: () => [
                ['WhatsMyName', 'Where a handle exists', 'https://whatsmyname.app/'],
                ['Namechk', 'Username availability / reuse', 'https://namechk.com/'],
                ['Instant Username', 'Multi-site handle check', 'https://instantusername.com/'],
                ['KnowEm', 'Username check', 'https://knowem.com/'],
                ['IDCrawl', 'People and handle search', 'https://www.idcrawl.com/'],
                ['Social Searcher', 'Public social mentions', 'https://www.social-searcher.com/']
            ],
            password: () => [
                ['Have I Been Pwned', 'Public password breaches', 'https://haveibeenpwned.com/Passwords'],
                ['Intelligence X', 'Public leak collections', 'https://intelx.io/'],
                ['DeHashed', 'Breach compilation search', 'https://dehashed.com/']
            ],
            address: () => [
                ['TruePeopleSearch', 'Residents listed at an address', 'https://www.truepeoplesearch.com/'],
                ['Zillow', 'Property listings', 'https://www.zillow.com/'],
                ['Google Maps', 'Street and satellite view', 'https://www.google.com/maps'],
                ['OpenStreetMap', 'Map features', 'https://www.openstreetmap.org/'],
                ['County assessor', 'Local property records', gq('property assessor')]
            ],
            occupation: () => [
                ['LinkedIn', 'People by title', 'https://www.linkedin.com/search/results/people/'],
                ['Google', 'Title + city / employer', gq('job title')],
                ['News', 'Mentions of the role', 'https://news.google.com/']
            ],
            age: () => [
                ['TruePeopleSearch', 'Directories that list age', 'https://www.truepeoplesearch.com/'],
                ['Google', 'Age with a name', gq('years old')]
            ],
            dob: () => [
                ['FamilySearch', 'Vital records', 'https://www.familysearch.org/search/'],
                ['Google', 'Quoted birthday', gq('born')],
                ['News', 'Public mentions', 'https://news.google.com/']
            ],
            countrycode: () => [
                ['Country calling codes', 'Dialing reference', 'https://www.countrycode.org/'],
                ['ITU', 'Country codes', 'https://www.itu.int/'],
                ['Google', 'Dialing code', gq('country calling code')]
            ],
            vehicle: () => [
                ['Google', 'Make and model mentions', gq('vehicle')],
                ['Google Images', 'Photos', 'https://images.google.com/'],
                ['NHTSA', 'Safety / recalls', 'https://www.nhtsa.gov/']
            ],
            audio: () => [
                ['Google', 'Search words you hear in the clip', gq('transcript')],
                ['YouTube', 'If the clip was posted publicly', 'https://www.youtube.com/'],
                ['InVID / WeVerify', 'Verify circulated media', 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/']
            ],
            wifi: () => [
                ['Wigle', 'Public SSID geolocation database', 'https://wigle.net/'],
                ['Google', 'SSID + city', gq('wifi ssid')]
            ],
            ip: () => [
                ['IPInfo', 'Lookup any public IP', 'https://ipinfo.io/'],
                ['MaxMind', 'GeoIP demo', 'https://www.maxmind.com/en/geoip-demo'],
                ['Shodan', 'Indexed internet services', 'https://www.shodan.io/'],
                ['Censys', 'Hosts and certificates', 'https://search.censys.io/'],
                ['AbuseIPDB', 'Abuse reports', 'https://www.abuseipdb.com/'],
                ['Hurricane Electric', 'BGP and DNS', 'https://bgp.he.net/'],
                ['GreyNoise', 'Internet-scan noise', 'https://viz.greynoise.io/'],
                ['Onyphe', 'Cyber search', 'https://www.onyphe.io/']
            ],
            plate: () => [
                ['Google Images', 'Public photos of the plate', 'https://images.google.com/'],
                ['Yandex Images', 'Alternate photo index', 'https://yandex.com/images/'],
                ['Google', 'Quoted plate text in posts', gq('"plate" license')]
            ],
            record: () => [
                ['CourtListener', 'Federal dockets and opinions', 'https://www.courtlistener.com/'],
                ['RECAP', 'Public PACER documents', 'https://www.courtlistener.com/recap/'],
                ['Google', 'Name + court / county', gq('court records')],
                ['News', 'Reporting around a filing', 'https://news.google.com/']
            ],
            domain: () => [
                ['Live Domain Intel', 'DNS, RDAP, certs, subdomains, archives, stack', 'orbint:intel'],
                ['WHOIS', 'Registration clues', 'https://who.is/'],
                ['RDAP', 'Registration data', 'https://rdap.org/'],
                ['Domain Dossier', 'WHOIS, DNS, and network', 'https://centralops.net/co/DomainDossier.aspx'],
                ['crt.sh', 'Certificate transparency', 'https://crt.sh/'],
                ['SecurityTrails', 'Historical DNS', 'https://securitytrails.com/'],
                ['ViewDNS', 'DNS and reverse records', 'https://viewdns.info/'],
                ['DNSdumpster', 'Host map', 'https://dnsdumpster.com/'],
                ['urlscan', 'Public URL scans', 'https://urlscan.io/'],
                ['Wayback', 'Historical URLs', 'https://web.archive.org/'],
                ['BuiltWith', 'Tech stack', 'https://builtwith.com/'],
                ['Wappalyzer', 'Technology fingerprints', 'https://www.wappalyzer.com/']
            ],
            timezone: () => [
                ['Time and Date', 'World clock and offsets', 'https://www.timeanddate.com/worldclock/'],
                ['Time.is', 'Current time by place', 'https://time.is/'],
                ['Google', 'Zone name or UTC offset', gq('timezone')]
            ],
            crypto: () => [
                ['Etherscan', 'Paste an ETH address', 'https://etherscan.io/'],
                ['Blockchain.com', 'Paste a BTC address', 'https://www.blockchain.com/explorer'],
                ['Mempool', 'Bitcoin transactions', 'https://mempool.space/'],
                ['WalletExplorer', 'Cluster clues', 'https://www.walletexplorer.com/']
            ],
            mac: () => [
                ['Wireshark OUI', 'Vendor from the first 6 hex digits', 'https://www.wireshark.org/tools/oui-lookup.html'],
                ['macaddress.io', 'OUI lookup', 'https://macaddress.io/']
            ],
            barcode: () => [
                ['UPCitemdb', 'Product barcodes', 'https://www.upcitemdb.com/'],
                ['Google Lens', 'Scan a QR or barcode', 'https://lens.google.com/']
            ],
            notes: () => [
                ['Google', 'Search names or phrases from the case', gq('')],
                ['News', 'Reporting that matches a detail', 'https://news.google.com/'],
                ['Intelligence X', 'Public intel search', 'https://intelx.io/']
            ],
            company: () => [
                ['OpenCorporates', 'Company filings worldwide', 'https://opencorporates.com/'],
                ['SEC EDGAR', 'US issuer filings', 'https://www.sec.gov/edgar/search/'],
                ['OpenOwnership', 'Beneficial ownership', 'https://register.openownership.org/'],
                ['OpenSanctions', 'Watchlists and PEPs', 'https://www.opensanctions.org/'],
                ['LittleSis', 'People and orgs', 'https://littlesis.org/'],
                ['OpenSecrets', 'US political money', 'https://www.opensecrets.org/'],
                ['Companies House', 'UK company register', 'https://find-and-update.company-information.service.gov.uk/']
            ],
            geo: () => [
                ['Google Maps', 'Street and satellite', 'https://www.google.com/maps'],
                ['OpenStreetMap', 'Map and nearby features', 'https://www.openstreetmap.org/'],
                ['Bing Maps', 'Alternate imagery', 'https://www.bing.com/maps'],
                ['What3words', '3-word location', 'https://what3words.com/'],
                ['Wikimapia', 'User-annotated places', 'https://wikimapia.org/'],
                ['SunCalc', 'Sun position for a place', 'https://www.suncalc.org/']
            ],
            vin: () => [
                ['NHTSA decoder', 'Make, model, and plant', 'https://vpic.nhtsa.dot.gov/decoder/Decoder'],
                ['FaxVin', 'VIN history and records', 'https://www.faxvin.com/'],
                ['VIN Decoderz', 'Decode and specs', 'https://www.vindecoderz.com/'],
                ['Bumper', 'Vehicle history', 'https://www.bumper.com/'],
                ['NHTSA recalls', 'Safety recalls', 'https://www.nhtsa.gov/recalls'],
                ['Google', 'Quoted VIN', gq('"VIN"')]
            ],
            social: () => [
                ['WhatsMyName', 'Find accounts from a handle', 'https://whatsmyname.app/'],
                ['Namechk', 'Same handle on other sites', 'https://namechk.com/'],
                ['Social Searcher', 'Public posts and mentions', 'https://www.social-searcher.com/'],
                ['Wayback', 'Old profile snapshots', 'https://web.archive.org/'],
                ['Google', 'Name + social', gq('site:instagram.com OR site:x.com')]
            ],
            url: () => [
                ['Wayback', 'Historical snapshots', 'https://web.archive.org/'],
                ['archive.today', 'Alternate snapshot', 'https://archive.ph/'],
                ['urlscan', 'Public scan history', 'https://urlscan.io/'],
                ['BuiltWith', 'Tech stack of a host', 'https://builtwith.com/'],
                ['VirusTotal', 'URL reputation', 'https://www.virustotal.com/gui/home/url']
            ],
            os: () => [
                ['Google', 'Desktop OS mentions', gq('Windows OR macOS OR Linux')],
                ['Microsoft', 'Windows releases', 'https://learn.microsoft.com/windows/release-health/'],
                ['Apple', 'macOS releases', 'https://support.apple.com/macos'],
                ['DistroWatch', 'Linux distros', 'https://distrowatch.com/']
            ],
            phoneos: () => [
                ['Google', 'Mobile OS mentions', gq('iOS OR Android')],
                ['Apple', 'iOS versions', 'https://support.apple.com/en-us/HT201222'],
                ['Android', 'Platform versions', 'https://developer.android.com/about/versions']
            ]
        };

        const DEEP_LINKS = {
            phone: (v) => {
                const n = String(v).replace(/\D/g, '');
                const last10 = n.slice(-10);
                const dashed = last10.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                const dotted = last10.replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
                const spaced = last10.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
                const formats = [v, n, last10, dashed, dotted, spaced];
                if (n.length > 10) formats.push('+' + n, '00' + n);
                const formatQ = formats.filter(Boolean).filter((item, i, all) => all.indexOf(item) === i).map((item) => '"' + item + '"').join(' OR ');
                const q = quoted(v);
                return [
                    ['Whitepages', 'Reverse lookup', 'https://www.whitepages.com/phone/' + encodeURIComponent(n)],
                    ['Truecaller', 'Caller ID and spam reports', 'https://www.truecaller.com/search/' + encodeURIComponent(n)],
                    ['Sync.me', 'Caller ID search', 'https://sync.me/search/?number=' + encodeURIComponent(n)],
                    ['NumLookup', 'Free reverse lookup', 'https://www.numlookup.com/' + encodeURIComponent(n)],
                    ['SpyDialer', 'Caller ID search', 'https://www.spydialer.com/default.aspx?n=' + encodeURIComponent(n)],
                    ['CallerID Test', 'CNAM / caller ID', 'https://calleridtest.com/'],
                    ['Old Phone Book', 'Historic listings', 'https://oldphonebook.com/'],
                    ['USA Phonebook', 'US directory', 'https://www.unitedstatesphonebook.com/'],
                    ['TruePeopleSearch', 'People records tied to the number', 'https://www.truepeoplesearch.com/resultphone?phoneno=' + encodeURIComponent(n)],
                    ['FastPeopleSearch', 'Directory match', 'https://www.fastpeoplesearch.com/phone/' + encodeURIComponent(n)],
                    ['FastBackgroundCheck', 'Public people records', 'https://www.fastbackgroundcheck.com/'],
                    ['Thatsthem', 'Phone in people records', 'https://thatsthem.com/phone/' + encodeURIComponent(n)],
                    ['Nuwber', 'People search', 'https://nuwber.com/search/phone?phone=' + encodeURIComponent(n)],
                    ['IntelTechniques', 'Telephone toolset', 'https://inteltechniques.com/tools/Telephone.html'],
                    ['Epieos', 'Accounts linked to the number', 'https://epieos.com/?q=' + encodeURIComponent(n)],
                    ['Castrick', 'Accounts and leak clues', 'https://castrickclues.com/'],
                    ['OSINT Industries', 'Account correlation', 'https://www.osint.industries/'],
                    ['IPQS', 'Validity / line type', 'https://www.ipqualityscore.com/free-phone-number-lookup'],
                    ['Comfi', 'Reverse phone book', 'https://www.comfi.com/abook/reverse'],
                    ['Numbering plans', 'Prefix and country analysis', 'https://www.numberingplans.com/?page=analysis&sub=phonenr'],
                    ['Phone Validator', 'Line validation', 'https://www.phonevalidator.com/'],
                    ['Yellow Search', 'Directory listings', 'https://www.searchyellowdirectory.com/'],
                    ['NPA NXX', 'North American prefix data', 'https://www.npanxxsource.com/nalennd.php'],
                    ['Area code', 'Carrier region', 'https://www.allareacodes.com/' + encodeURIComponent(n.slice(0, 3))],
                    ['Format search', 'International and US number forms', gq(formatQ)],
                    ['Have I Been Zuckered', 'Facebook leak check', 'https://haveibeenzuckered.com/'],
                    ['Have I Been Pwned', 'Notified breach exposure', 'https://haveibeenpwned.com/'],
                    ['DeHashed', 'Public breach search', 'https://dehashed.com/'],
                    ['SignalHire', 'LinkedIn / phone extension', 'https://chromewebstore.google.com/detail/signalhire-find-email-or/aeidadjdhppdffggfgjpanbafaedankd'],
                    ['PhoneInfoga', 'Local scanner docs', 'https://sundowndev.github.io/phoneinfoga/'],
                    ...engineSet(q)
                ];
            },
            name: (v) => {
                const q = quoted(v);
                const slug = encodeURIComponent(v);
                return [
                    ['TruePeopleSearch', 'Public people records', 'https://www.truepeoplesearch.com/results?name=' + slug],
                    ['FastPeopleSearch', 'Name directory', 'https://www.fastpeoplesearch.com/name/' + encodeURIComponent(v.replace(/\s+/g, '-'))],
                    ['Thatsthem', 'Name search', 'https://thatsthem.com/name/' + encodeURIComponent(v.replace(/\s+/g, '-'))],
                    ['WebMii', 'Public web footprint', 'https://webmii.com/people?n=' + slug],
                    ['Nuwber', 'People search', 'https://nuwber.com/search?name=' + slug],
                    ['FamilySearch', 'Genealogy records', 'https://www.familysearch.org/search/record/results?q.givenName=' + slug],
                    ['LinkedIn', 'Work and education', 'https://www.linkedin.com/search/results/all/?keywords=' + slug],
                    ['Facebook', 'People profiles', 'https://www.facebook.com/search/people/?q=' + slug],
                    ['Instagram', 'Public name hits', 'https://www.instagram.com/explore/search/keyword/?q=' + slug],
                    ['X', 'Posts and profiles', 'https://x.com/search?q=' + slug],
                    ['Namechk', 'Handle from the name', 'https://namechk.com/' + encodeURIComponent(v.replace(/\s+/g, ''))],
                    ['News', 'Reporting', 'https://news.google.com/search?q=' + slug],
                    ...engineSet(q)
                ];
            },
            email: (v) => {
                const q = quoted(v);
                const domain = (v.split('@')[1] || '').trim();
                return [
                    ['Have I Been Pwned', 'Breach notification', 'https://haveibeenpwned.com/account/' + encodeURIComponent(v)],
                    ['Epieos', 'Accounts tied to this email', 'https://epieos.com/?q=' + encodeURIComponent(v)],
                    ['EmailRep', 'Public reputation', 'https://emailrep.io/' + encodeURIComponent(v)],
                    ['Gravatar', 'Linked avatar / profile', 'https://en.gravatar.com/' + encodeURIComponent(v)],
                    ['Hunter', 'Domain email pattern', domain ? 'https://hunter.io/search/' + encodeURIComponent(domain) : 'https://hunter.io/'],
                    ['Thatsthem', 'People records with this email', 'https://thatsthem.com/email/' + encodeURIComponent(v)],
                    ['GitHub', 'Users and commits', 'https://github.com/search?q=' + encodeURIComponent(v) + '&type=users'],
                    ['IntelX', 'Public intel search', 'https://intelx.io/?s=' + encodeURIComponent(v)],
                    ['MX records', 'Mailbox host', domain ? 'https://dns.google/query?name=' + encodeURIComponent(domain) + '&type=MX' : gq(v)],
                    ...engineSet(q)
                ];
            },
            image: () => {
                const media = mediaSource('image');
                const src = (media && media.src) || '';
                if (/^https?:\/\//i.test(src)) {
                    return [
                        ['Google Lens', 'Reverse search this photo', 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(src)],
                        ['Yandex', 'Faces and places', 'https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(src)],
                        ['TinEye', 'Other copies of the same photo', 'https://tineye.com/search?url=' + encodeURIComponent(src)],
                        ['Bing Visual', 'Similar images', 'https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:' + encodeURIComponent(src)],
                        ['Forensically', 'Clone and noise analysis', 'https://29a.ch/photo-forensics/'],
                        ['FotoForensics', 'Error-level analysis', 'https://fotoforensics.com/']
                    ];
                }
                return [
                    ['Google Lens', 'Photo copied — paste it in Lens', 'https://lens.google.com/upload', 'image'],
                    ['Yandex', 'Photo copied — paste or upload', 'https://yandex.com/images/', 'image'],
                    ['TinEye', 'Photo copied — upload on TinEye', 'https://tineye.com/', 'image'],
                    ['Bing Visual', 'Photo copied — paste into Bing', 'https://www.bing.com/visualsearch', 'image'],
                    ['Forensically', 'Upload for clone/noise analysis', 'https://29a.ch/photo-forensics/', 'image'],
                    ['FotoForensics', 'Upload for error-level analysis', 'https://fotoforensics.com/', 'image']
                ];
            },
            username: (v, fact) => usernameLeads(v, fact).concat([
                ['Epieos', 'Accounts for this handle', 'https://epieos.com/?q=' + encodeURIComponent(usernameHandle(v))],
                ['Social Searcher', 'Public mentions', 'https://www.social-searcher.com/search-open/?q5=' + encodeURIComponent(usernameHandle(v))],
                ...engineSet(quoted(usernameHandle(v)))
            ]),
            password: (v, fact) => passwordLeads(v, fact),
            address: (v) => [
                ['Google Maps', 'Street and satellite', 'https://www.google.com/maps/search/' + encodeURIComponent(v)],
                ['Bing Maps', 'Alternate street view', 'https://www.bing.com/maps?q=' + encodeURIComponent(v)],
                ['Zillow', 'Property clues', 'https://www.zillow.com/homes/' + encodeURIComponent(v) + '_rb/'],
                ['TruePeopleSearch', 'Residents listed at an address', 'https://www.truepeoplesearch.com/results?streetaddress=' + encodeURIComponent(v)],
                ['News', 'Local mentions', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            audio: (v) => [
                ['Google', 'Words or place names from the clip', gq(v)],
                ['YouTube', 'If the clip was uploaded', 'https://www.youtube.com/results?search_query=' + encodeURIComponent(v)]
            ],
            wifi: (v) => [
                ['Wigle', 'SSID geolocation', 'https://wigle.net/search?ssid=' + encodeURIComponent(v)],
                ['Google', 'SSID mentions', gq(quoted(v) + ' wifi ssid')],
                ...engineSet(quoted(v))
            ],
            ip: (v) => [
                ['IPInfo', 'Org and approx. location', 'https://ipinfo.io/' + encodeURIComponent(v)],
                ['MaxMind', 'GeoIP demo', 'https://www.maxmind.com/en/geoip-demo'],
                ['IPQS', 'Reputation / proxy', 'https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/' + encodeURIComponent(v)],
                ['ARIN', 'Allocation', 'https://search.arin.net/rdap/?query=' + encodeURIComponent(v)],
                ['Shodan', 'Indexed services', 'https://www.shodan.io/host/' + encodeURIComponent(v)],
                ['Censys', 'Host details', 'https://search.censys.io/hosts/' + encodeURIComponent(v)],
                ['AbuseIPDB', 'Abuse reports', 'https://www.abuseipdb.com/check/' + encodeURIComponent(v)],
                ['Hurricane Electric', 'BGP', 'https://bgp.he.net/ip/' + encodeURIComponent(v)],
                ['GreyNoise', 'Internet-scan noise', 'https://viz.greynoise.io/ip/' + encodeURIComponent(v)],
                ['VirusTotal', 'Reputation', 'https://www.virustotal.com/gui/ip-address/' + encodeURIComponent(v)],
                ['ViewDNS', 'Reverse IP / domains', 'https://viewdns.info/reverseip/?host=' + encodeURIComponent(v) + '&t=1'],
                ...engineSet(v)
            ],
            plate: (v) => [
                ['FindByPlate', 'Plate lookup', 'https://findbyplate.com/'],
                ['FaxVin', 'Plate and VIN records', 'https://www.faxvin.com/license-plate-lookup'],
                ['Bumper', 'Vehicle history', 'https://www.bumper.com/'],
                ['Google', 'Quoted plate', gq(quoted(v) + ' license plate')],
                ['Google Images', 'Photos', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v + ' license plate')],
                ['Yandex Images', 'Alternate photo index', 'https://yandex.com/images/search?text=' + encodeURIComponent(v + ' license plate')],
                ...engineSet(quoted(v) + ' license plate')
            ],
            record: (v) => [
                ['CourtListener', 'Federal dockets', 'https://www.courtlistener.com/?q=' + encodeURIComponent(v) + '&type=r'],
                ['Google', 'County / court mentions', gq(v + ' court records')],
                ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            domain: (v) => {
                const host = v.replace(/^https?:\/\//, '').split('/')[0];
                return [
                    ['Live Domain Intel', 'DNS, RDAP, certs, subdomains, archives, stack', 'orbint:intel'],
                    ['WHOIS', 'Registrant clues', 'https://who.is/whois/' + encodeURIComponent(host)],
                    ['RDAP', 'Registration data', 'https://rdap.org/domain/' + encodeURIComponent(host)],
                    ['Domain Dossier', 'WHOIS, DNS, network', 'https://centralops.net/co/DomainDossier.aspx?addr=' + encodeURIComponent(host) + '&dom_whois=true&dom_dns=true'],
                    ['crt.sh', 'Certs and emails', 'https://crt.sh/?q=' + encodeURIComponent(host)],
                    ['SecurityTrails', 'Historical DNS', 'https://securitytrails.com/domain/' + encodeURIComponent(host) + '/dns'],
                    ['ViewDNS', 'Records', 'https://viewdns.info/whois/?domain=' + encodeURIComponent(host)],
                    ['DNSdumpster', 'Host map', 'https://dnsdumpster.com/'],
                    ['urlscan', 'Public scans', 'https://urlscan.io/domain/' + encodeURIComponent(host)],
                    ['Wayback', 'Old site content', 'https://web.archive.org/web/*/' + encodeURIComponent(host)],
                    ['BuiltWith', 'Tech stack', 'https://builtwith.com/' + encodeURIComponent(host)],
                    ['Wappalyzer', 'Technology fingerprints', 'https://www.wappalyzer.com/lookup/' + encodeURIComponent(host)],
                    ['VirusTotal', 'Related samples / resolutions', 'https://www.virustotal.com/gui/domain/' + encodeURIComponent(host)],
                    ...engineSet(host)
                ];
            },
            timezone: (v) => [
                ['Time and Date', 'World clock', 'https://www.timeanddate.com/worldclock/results.html?query=' + encodeURIComponent(v)],
                ['Time.is', 'Current time', 'https://time.is/' + encodeURIComponent(v)],
                ['Google', 'Offset and DST', gq(v + ' timezone')],
                ...engineSet(quoted(v))
            ],
            crypto: (v) => [
                ['Etherscan', 'ETH activity', 'https://etherscan.io/address/' + encodeURIComponent(v)],
                ['Blockchain.com', 'BTC explorer', 'https://www.blockchain.com/explorer/search?search=' + encodeURIComponent(v)],
                ['Mempool', 'Bitcoin transactions', 'https://mempool.space/address/' + encodeURIComponent(v)],
                ['WalletExplorer', 'Cluster clues', 'https://www.walletexplorer.com/address/' + encodeURIComponent(v)],
                ['Google', 'Wallet in bios and posts', gq(v)],
                ...engineSet(v)
            ],
            mac: (v) => [
                ['OUI / vendor', 'Manufacturer from the prefix', gq(v.replace(/[:\-]/g, '').slice(0, 6) + ' OUI lookup')],
                ...engineSet(v)
            ],
            barcode: (v) => [
                ['UPCitemdb', 'Product data', 'https://www.upcitemdb.com/upc/' + encodeURIComponent(v)],
                ['Google', 'Code or decoded URL', /^https?:/i.test(v) ? v : gq(v)]
            ],
            notes: (v) => [
                ['Google', 'Phrases from the note', gq(v)],
                ['News', 'Matching reports', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ['Intelligence X', 'Public intel search', 'https://intelx.io/?s=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            company: (v) => [
                ['OpenCorporates', 'Filings worldwide', 'https://opencorporates.com/companies?q=' + encodeURIComponent(v)],
                ['SEC EDGAR', 'US issuer filings', 'https://www.sec.gov/cgi-bin/browse-edgar?company=' + encodeURIComponent(v) + '&action=getcompany'],
                ['OpenOwnership', 'Beneficial ownership', 'https://register.openownership.org/search?utf8=%E2%9C%93&q=' + encodeURIComponent(v)],
                ['OpenSanctions', 'Watchlists and PEPs', 'https://www.opensanctions.org/search/?q=' + encodeURIComponent(v)],
                ['LittleSis', 'People and orgs', 'https://littlesis.org/search?q=' + encodeURIComponent(v)],
                ['OpenSecrets', 'US political money', 'https://www.opensecrets.org/search?q=' + encodeURIComponent(v)],
                ['Companies House', 'UK register', 'https://find-and-update.company-information.service.gov.uk/search?q=' + encodeURIComponent(v)],
                ['LinkedIn', 'Company page', 'https://www.linkedin.com/search/results/companies/?keywords=' + encodeURIComponent(v)],
                ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            occupation: (v) => [
                ['LinkedIn', 'People with this title', 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(v)],
                ['Google', 'Public mentions', gq(quoted(v))],
                ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            os: (v) => [
                ['Google', 'Desktop OS mentions', gq(quoted(v))],
                ['Microsoft', 'Windows support', 'https://learn.microsoft.com/search/?terms=' + encodeURIComponent(v)],
                ['Apple', 'macOS notes', 'https://support.apple.com/macos'],
                ...engineSet(quoted(v))
            ],
            phoneos: (v) => [
                ['Google', 'Mobile OS mentions', gq(quoted(v))],
                ['Apple', 'iOS notes', 'https://support.apple.com/en-us/HT201222'],
                ['Android', 'Platform versions', 'https://developer.android.com/about/versions'],
                ...engineSet(quoted(v))
            ],
            age: (v) => [
                ['TruePeopleSearch', 'Directories that list age', 'https://www.truepeoplesearch.com/'],
                ['Google', 'Age with a name or place', gq(v + ' years old')],
                ...engineSet(quoted(v) + ' years old')
            ],
            dob: (v) => [
                ['FamilySearch', 'Vital records', 'https://www.familysearch.org/search/'],
                ['Google', 'Quoted date', gq(quoted(v))],
                ['News', 'Mentions', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            countrycode: (v) => {
                const meta = countryCodeMeta(v);
                const q = meta ? meta.dial + ' ' + meta.name : v;
                return [
                    ['Country calling codes', 'Dialing reference', 'https://www.countrycode.org/' + encodeURIComponent((meta && meta.id) || v)],
                    ['Google', 'Dialing code and carriers', gq(q + ' country calling code')],
                    ...engineSet(quoted(q))
                ];
            },
            vehicle: (v) => [
                ['Google', 'Public mentions', gq(quoted(v))],
                ['Google Images', 'Photos', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v)],
                ['NHTSA', 'Safety / recalls', 'https://www.nhtsa.gov/recalls'],
                ['News', 'Reporting', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            geo: (v) => [
                ['Google Maps', 'Street and satellite', 'https://www.google.com/maps/search/' + encodeURIComponent(v)],
                ['OpenStreetMap', 'Map features', 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(v)],
                ['Bing Maps', 'Alternate imagery', 'https://www.bing.com/maps?q=' + encodeURIComponent(v)],
                ['What3words', '3-word location', 'https://what3words.com/' + encodeURIComponent(v.replace(/\s+/g, '.').replace(/^\.+|\.+$/g, ''))],
                ['Wikimapia', 'Annotated places', 'https://wikimapia.org/#lang=en&search=' + encodeURIComponent(v)],
                ['SunCalc', 'Sun position', 'https://www.suncalc.org/#/' + encodeURIComponent(v)],
                ['Google Earth', '3D / historical imagery', 'https://earth.google.com/web/search/' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            vin: (v) => [
                ['NHTSA decoder', 'Make, model, and plant', 'https://vpic.nhtsa.dot.gov/decoder/Decoder'],
                ['FaxVin', 'VIN history and records', 'https://www.faxvin.com/vin-check'],
                ['VIN Decoderz', 'Decode and specs', 'https://www.vindecoderz.com/EN/check-lookup/' + encodeURIComponent(v)],
                ['Bumper', 'Vehicle history', 'https://www.bumper.com/vin-lookup/' + encodeURIComponent(v) + '/'],
                ['NHTSA recalls', 'Safety recalls', 'https://www.nhtsa.gov/recalls'],
                ['Google', 'Quoted VIN', gq(quoted(v) + ' VIN')],
                ['News', 'Mentions', 'https://news.google.com/search?q=' + encodeURIComponent(v)],
                ...engineSet(quoted(v))
            ],
            social: (v) => [
                ['Open', 'Profile itself', /^https?:/i.test(v) ? v : gq(v)],
                ['Namechk', 'Handle reuse', 'https://namechk.com/' + encodeURIComponent(v.replace(/^@/, '').split('/').pop())],
                ['WhatsMyName', 'Other sites', 'https://whatsmyname.app/'],
                ['Wayback', 'Old profile snapshots', /^https?:/i.test(v) ? 'https://web.archive.org/web/*/' + encodeURIComponent(v) : gq(v)],
                ...engineSet(quoted(v))
            ],
            url: (v) => {
                const href = /^https?:\/\//i.test(v) ? v : 'https://' + v;
                const host = href.replace(/^https?:\/\//, '').split('/')[0];
                return [
                    ['Open', 'The page itself', href],
                    ['Wayback', 'Historical snapshots', 'https://web.archive.org/web/*/' + encodeURIComponent(href)],
                    ['archive.today', 'Alternate snapshot', 'https://archive.ph/' + encodeURIComponent(href)],
                    ['urlscan', 'Public scans', 'https://urlscan.io/search/#' + encodeURIComponent(href)],
                    ['BuiltWith', 'Tech stack', 'https://builtwith.com/' + encodeURIComponent(host)],
                    ['VirusTotal', 'URL reputation', 'https://www.virustotal.com/gui/domain/' + encodeURIComponent(host)],
                    ['WHOIS', 'Host registration', 'https://who.is/whois/' + encodeURIComponent(host)],
                    ...engineSet(quoted(href))
                ];
            }
        };

        const EXTRA_PRESETS = [
            // Identity
            { id: 'social', label: 'Social', placeholder: 'URL or handle', group: 'identity' },
            { id: 'alias', label: 'Alias', placeholder: 'Other name', group: 'identity' },
            { id: 'nickname', label: 'Nickname', placeholder: 'Handle or nickname', group: 'identity' },
            { id: 'middle', label: 'Middle name', placeholder: 'Middle name', group: 'identity' },
            { id: 'maiden', label: "Mother's maiden name", placeholder: 'Previous surname', group: 'identity' },
            { id: 'formername', label: 'Former name', placeholder: 'Previous legal name', group: 'identity' },
            { id: 'aka', label: 'AKA', placeholder: 'Also known as', group: 'identity' },
            { id: 'family', label: 'Family', placeholder: 'Relative or associate', group: 'identity' },
            { id: 'spouse', label: 'Spouse / partner', placeholder: 'Name', group: 'identity' },
            { id: 'child', label: 'Child', placeholder: 'Name', group: 'identity' },
            { id: 'parent', label: 'Parent', placeholder: 'Name', group: 'identity' },
            { id: 'sibling', label: 'Sibling', placeholder: 'Name', group: 'identity' },
            { id: 'roommate', label: 'Roommate', placeholder: 'Name', group: 'identity' },
            { id: 'employercontact', label: 'Work contact', placeholder: 'Colleague or HR', group: 'identity' },
            { id: 'gender', label: 'Gender', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'pronouns', label: 'Pronouns', placeholder: 'he/him, they/them…', group: 'identity' },
            { id: 'nationality', label: 'Nationality', placeholder: 'Citizenship or origin', group: 'identity' },
            { id: 'ethnicity', label: 'Ethnicity', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'religion', label: 'Religion', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'language', label: 'Language', placeholder: 'Spoken language', group: 'identity' },
            { id: 'accent', label: 'Accent', placeholder: 'Speech note', group: 'identity' },
            { id: 'school', label: 'School', placeholder: 'School or university', group: 'identity' },
            { id: 'degree', label: 'Degree', placeholder: 'Degree or certification', group: 'identity' },
            { id: 'graduation', label: 'Graduation year', placeholder: 'YYYY', group: 'identity' },
            { id: 'military', label: 'Military', placeholder: 'Service or unit', group: 'identity' },
            { id: 'rank', label: 'Rank', placeholder: 'Military or org rank', group: 'identity' },
            { id: 'bio', label: 'Bio', placeholder: 'Public bio text', group: 'identity' },
            { id: 'signature', label: 'Signature', placeholder: 'Name style or mark', group: 'identity' },
            { id: 'avatar', label: 'Avatar URL', placeholder: 'Profile image URL', group: 'identity' },

            // Person / physical
            { id: 'height', label: 'Height', placeholder: 'e.g. 5\'10" or 178 cm', group: 'person' },
            { id: 'weight', label: 'Weight', placeholder: 'e.g. 165 lb', group: 'person' },
            { id: 'build', label: 'Build', placeholder: 'Slim, athletic, heavy…', group: 'person' },
            { id: 'eyecolor', label: 'Eye color', placeholder: 'Brown, blue, hazel…', group: 'person' },
            { id: 'haircolor', label: 'Hair color', placeholder: 'Color', group: 'person' },
            { id: 'hairstyle', label: 'Hair style', placeholder: 'Length or style', group: 'person' },
            { id: 'skintone', label: 'Skin tone', placeholder: 'Description', group: 'person' },
            { id: 'facialhair', label: 'Facial hair', placeholder: 'Beard, clean-shaven…', group: 'person' },
            { id: 'tattoo', label: 'Tattoo', placeholder: 'Location and design', group: 'person' },
            { id: 'piercing', label: 'Piercing', placeholder: 'Location', group: 'person' },
            { id: 'scar', label: 'Scar / mark', placeholder: 'Visible mark', group: 'person' },
            { id: 'disability', label: 'Disability / aid', placeholder: 'As observed or stated', group: 'person' },
            { id: 'glasses', label: 'Glasses', placeholder: 'Yes / style', group: 'person' },
            { id: 'clothing', label: 'Clothing', placeholder: 'Last seen wearing', group: 'person' },
            { id: 'appearance', label: 'Appearance', placeholder: 'Build, hair, clothing', group: 'person' },
            { id: 'voice', label: 'Voice', placeholder: 'Tone or sample note', group: 'person' },
            { id: 'gait', label: 'Gait / walk', placeholder: 'How they move', group: 'person' },
            { id: 'handed', label: 'Handedness', placeholder: 'Left / right', group: 'person' },
            { id: 'bloodtype', label: 'Blood type', placeholder: 'A+, O−…', group: 'person' },
            { id: 'allergy', label: 'Allergy', placeholder: 'Known allergy', group: 'person' },
            { id: 'pet', label: 'Pet', placeholder: 'Animal or name', group: 'person' },
            { id: 'hobby', label: 'Hobby', placeholder: 'Interest or sport', group: 'person' },
            { id: 'habit', label: 'Habit', placeholder: 'Routine or pattern', group: 'person' },
            { id: 'personality', label: 'Personality', placeholder: 'Observed traits', group: 'person' },

            // Sensitive / SPII
            { id: 'ssn', label: 'SSN / national ID', placeholder: 'Only if already public', group: 'spii', caution: 'Sensitive identifier. File only from lawful public sources.' },
            { id: 'passport', label: 'Passport no.', placeholder: 'Number or country', group: 'spii', caution: 'Sensitive travel ID. File only from lawful public sources.' },
            { id: 'driverslicense', label: "Driver's license", placeholder: 'Number or state', group: 'spii', caution: 'Sensitive ID. File only from lawful public sources.' },
            { id: 'stateid', label: 'State ID', placeholder: 'Number or state', group: 'spii' },
            { id: 'taxid', label: 'Tax ID / EIN', placeholder: 'TIN, EIN, VAT…', group: 'spii' },
            { id: 'medicare', label: 'Health ID', placeholder: 'Member or policy ID', group: 'spii', caution: 'Health data is highly sensitive.' },
            { id: 'medical', label: 'Medical note', placeholder: 'Publicly known condition', group: 'spii', caution: 'Health data is highly sensitive.' },
            { id: 'biometric', label: 'Biometric', placeholder: 'Fingerprint, face ID note', group: 'spii', caution: 'Biometric data is highly sensitive.' },
            { id: 'dna', label: 'DNA / genealogy', placeholder: 'Kit or match note', group: 'spii', caution: 'Genetic data is highly sensitive.' },
            { id: 'creditcard', label: 'Card (last 4)', placeholder: '•••• 1234', group: 'spii', caution: 'Never store full card numbers.' },
            { id: 'bankaccount', label: 'Bank account', placeholder: 'Last digits or bank', group: 'spii', caution: 'Financial account data is sensitive.' },
            { id: 'routing', label: 'Routing number', placeholder: 'ABA / sort code', group: 'spii' },
            { id: 'iban', label: 'IBAN', placeholder: 'International account', group: 'spii' },
            { id: 'pin', label: 'PIN', placeholder: 'Only if already leaked', group: 'spii', caution: 'Credential. Do not use to sign in.' },
            { id: 'securityq', label: 'Security question', placeholder: 'Question or answer', group: 'spii' },
            { id: 'recoveryemail', label: 'Recovery email', placeholder: 'Backup email', group: 'spii' },
            { id: 'recoveryphone', label: 'Recovery phone', placeholder: 'Backup number', group: 'spii' },
            { id: 'seedphrase', label: 'Seed phrase', placeholder: 'Only if already exposed', group: 'spii', caution: 'Wallet seed. Extremely sensitive.' },
            { id: 'privatekey', label: 'Private key', placeholder: 'Only if already exposed', group: 'spii', caution: 'Cryptographic key. Extremely sensitive.' },
            { id: 'apikey', label: 'API key', placeholder: 'Token or key ID', group: 'spii' },
            { id: 'session', label: 'Session / cookie', placeholder: 'Token note', group: 'spii' },
            { id: 'voterid', label: 'Voter ID', placeholder: 'ID or precinct', group: 'spii' },
            { id: 'casenumber', label: 'Court case no.', placeholder: 'Docket or case ID', group: 'spii' },
            { id: 'inmate', label: 'Inmate ID', placeholder: 'Booking or DOC number', group: 'spii' },

            // Contact
            { id: 'phone2', label: 'Alt phone', placeholder: 'Second number', group: 'contact' },
            { id: 'phone3', label: 'Work phone', placeholder: 'Office or desk', group: 'contact' },
            { id: 'phonevoip', label: 'VoIP / Google Voice', placeholder: 'Number', group: 'contact' },
            { id: 'fax', label: 'Fax', placeholder: 'Fax number', group: 'contact' },
            { id: 'extension', label: 'Ext.', placeholder: 'PBX extension', group: 'contact' },
            { id: 'carrier', label: 'Carrier', placeholder: 'Verizon, T-Mobile…', group: 'contact' },
            { id: 'sms', label: 'SMS / text', placeholder: 'Number or thread note', group: 'contact' },
            { id: 'pager', label: 'Pager', placeholder: 'Pager number', group: 'contact' },
            { id: 'whatsappnum', label: 'WhatsApp number', placeholder: '+1…', group: 'contact' },

            // Life
            { id: 'birthplace', label: 'Birthplace', placeholder: 'City or hospital', group: 'life' },
            { id: 'birthyear', label: 'Birth year', placeholder: 'YYYY', group: 'life' },
            { id: 'zodiac', label: 'Zodiac', placeholder: 'Sign', group: 'life' },
            { id: 'anniversary', label: 'Anniversary', placeholder: 'Date', group: 'life' },
            { id: 'deathdate', label: 'Date of death', placeholder: 'If deceased', group: 'life' },
            { id: 'marital', label: 'Marital status', placeholder: 'Single, married…', group: 'life' },
            { id: 'children', label: 'Children count', placeholder: 'Number', group: 'life' },
            { id: 'education', label: 'Education level', placeholder: 'HS, BA, PhD…', group: 'life' },
            { id: 'employerhistory', label: 'Past employer', placeholder: 'Previous workplace', group: 'life' },
            { id: 'criminal', label: 'Criminal record', placeholder: 'Public case note', group: 'life' },
            { id: 'lawsuit', label: 'Lawsuit', placeholder: 'Civil case note', group: 'life' },
            { id: 'obituary', label: 'Obituary', placeholder: 'URL or text', group: 'life' },

            // Online
            { id: 'email2', label: 'Alt email', placeholder: 'Second email', group: 'online' },
            { id: 'emailwork', label: 'Work email', placeholder: 'name@company.com', group: 'online' },
            { id: 'emailschool', label: 'School email', placeholder: '.edu address', group: 'online' },
            { id: 'telegram', label: 'Telegram', placeholder: '@username or t.me', group: 'online' },
            { id: 'discord', label: 'Discord', placeholder: 'user#0000 or handle', group: 'online' },
            { id: 'skype', label: 'Skype', placeholder: 'Skype name', group: 'online' },
            { id: 'signal', label: 'Signal', placeholder: 'Public mention', group: 'online' },
            { id: 'matrix', label: 'Matrix / Element', placeholder: '@user:server', group: 'online' },
            { id: 'irc', label: 'IRC', placeholder: 'nick or channel', group: 'online' },
            { id: 'pgp', label: 'PGP', placeholder: 'Key ID or fingerprint', group: 'online' },
            { id: 'sshkey', label: 'SSH key', placeholder: 'Fingerprint or URL', group: 'online' },
            { id: 'useragent', label: 'Browser user agent', placeholder: 'Browser string', group: 'online' },
            { id: 'browser', label: 'Browser', placeholder: 'Chrome, Safari…', group: 'online' },
            { id: 'cookie', label: 'Cookie / tracker', placeholder: 'ID or note', group: 'online' },
            { id: 'forum', label: 'Forum', placeholder: 'Board or profile URL', group: 'online' },
            { id: 'blog', label: 'Blog', placeholder: 'URL', group: 'online' },
            { id: 'portfolio', label: 'Portfolio', placeholder: 'Site URL', group: 'online' },
            { id: 'dating', label: 'Dating profile', placeholder: 'Site or handle', group: 'online' },
            { id: 'gaming', label: 'Gaming ID', placeholder: 'Gamertag or Steam', group: 'online' },
            { id: 'nft', label: 'NFT / wallet ENS', placeholder: 'ENS or collection', group: 'online' },
            { id: 'tor', label: 'Tor / onion', placeholder: '.onion or note', group: 'online' },
            { id: 'pastebin', label: 'Paste', placeholder: 'Paste URL', group: 'online' },
            { id: 'leak', label: 'Breach / leak', placeholder: 'Source or dump name', group: 'online' },
            { id: 'darkweb', label: 'Dark web mention', placeholder: 'Market or alias', group: 'online' },

            // Device
            { id: 'imei', label: 'IMEI', placeholder: '15-digit IMEI', group: 'device' },
            { id: 'meid', label: 'MEID', placeholder: 'Device MEID', group: 'device' },
            { id: 'imsi', label: 'IMSI', placeholder: 'SIM IMSI', group: 'device' },
            { id: 'iccid', label: 'ICCID', placeholder: 'SIM card ID', group: 'device' },
            { id: 'phoneimei', label: 'Phone model', placeholder: 'iPhone 15, Pixel…', group: 'device' },
            { id: 'serial', label: 'Serial number', placeholder: 'Device serial', group: 'device' },
            { id: 'udid', label: 'UDID / device ID', placeholder: 'Mobile device ID', group: 'device' },
            { id: 'androidid', label: 'Android ID', placeholder: 'SSAID or GAID', group: 'device' },
            { id: 'idfa', label: 'IDFA / IDFV', placeholder: 'Apple ad ID', group: 'device' },
            { id: 'mac', label: 'MAC', placeholder: 'AA:BB:CC:DD:EE:FF', group: 'device', caution: 'Vendor from the OUI, plus any log or record that already has this address.' },
            { id: 'bluetooth', label: 'Bluetooth MAC', placeholder: 'BT address', group: 'device' },
            { id: 'wifimac', label: 'Wi-Fi BSSID', placeholder: 'AP MAC', group: 'device' },
            { id: 'osversion', label: 'OS version', placeholder: 'Build or version', group: 'device' },
            { id: 'browserfp', label: 'Browser fingerprint', placeholder: 'Hash or note', group: 'device' },
            { id: 'canvasfp', label: 'Canvas fingerprint', placeholder: 'Hash', group: 'device' },
            { id: 'screen', label: 'Screen', placeholder: '1920×1080', group: 'device' },
            { id: 'timezone_device', label: 'Device timezone', placeholder: 'Offset or zone', group: 'device' },
            { id: 'language_device', label: 'Device language', placeholder: 'en-US…', group: 'device' },
            { id: 'battery', label: 'Battery', placeholder: '% or note', group: 'device' },
            { id: 'carrier_device', label: 'SIM carrier', placeholder: 'Carrier on device', group: 'device' },
            { id: 'vpn', label: 'VPN / proxy', placeholder: 'Provider or IP', group: 'device' },
            { id: 'router', label: 'Router', placeholder: 'Model or MAC', group: 'device' },
            { id: 'iot', label: 'IoT device', placeholder: 'Camera, TV, etc.', group: 'device' },
            { id: 'laptop', label: 'Laptop / PC', placeholder: 'Make and model', group: 'device' },
            { id: 'tablet', label: 'Tablet', placeholder: 'Make and model', group: 'device' },
            { id: 'wearable', label: 'Wearable', placeholder: 'Watch or band', group: 'device' },
            { id: 'camera', label: 'Camera', placeholder: 'Make / EXIF model', group: 'device' },
            { id: 'drone', label: 'Drone', placeholder: 'Model or registration', group: 'device' },
            { id: 'uuid', label: 'UUID', placeholder: 'ID or GUID', group: 'device' },
            { id: 'installid', label: 'App install ID', placeholder: 'App-specific ID', group: 'device' },

            // Employment
            { id: 'title', label: 'Job title', placeholder: 'Role or title', group: 'entity' },
            { id: 'department', label: 'Department', placeholder: 'Team or division', group: 'entity' },
            { id: 'industry', label: 'Industry', placeholder: 'Sector', group: 'entity' },
            { id: 'ein', label: 'Company ID', placeholder: 'EIN, CRN, or filing no.', group: 'entity' },
            { id: 'duns', label: 'D-U-N-S', placeholder: 'DUNS number', group: 'entity' },
            { id: 'trademark', label: 'Trademark', placeholder: 'Mark or serial', group: 'entity' },
            { id: 'linkedinurl', label: 'LinkedIn URL', placeholder: 'Profile URL', group: 'entity' },
            { id: 'badge', label: 'Badge / employee ID', placeholder: 'ID number', group: 'entity' },
            { id: 'office', label: 'Office', placeholder: 'Building or floor', group: 'entity' },
            { id: 'salary', label: 'Salary band', placeholder: 'Public range only', group: 'entity' },
            { id: 'callsign', label: 'Callsign', placeholder: 'Radio or ham call', group: 'entity' },
            { id: 'asn', label: 'ASN', placeholder: 'AS12345', group: 'entity' },
            { id: 'vessel', label: 'Vessel', placeholder: 'Name or IMO', group: 'entity' },
            { id: 'aircraft', label: 'Aircraft', placeholder: 'Tail number', group: 'entity' },
            { id: 'nonprofit', label: 'Nonprofit', placeholder: 'Org name', group: 'entity' },
            { id: 'brand', label: 'Brand', placeholder: 'Product or brand', group: 'entity' },
            { id: 'license_pro', label: 'Professional license', placeholder: 'License no. or board', group: 'entity' },
            { id: 'union', label: 'Union / guild', placeholder: 'Organization', group: 'entity' },

            // Finance
            { id: 'bank', label: 'Bank', placeholder: 'Institution name', group: 'finance' },
            { id: 'paypal', label: 'PayPal', placeholder: 'Email or username', group: 'finance' },
            { id: 'venmo', label: 'Venmo', placeholder: '@handle', group: 'finance' },
            { id: 'cashapp', label: 'Cash App', placeholder: '$cashtag', group: 'finance' },
            { id: 'zelle', label: 'Zelle', placeholder: 'Email or phone', group: 'finance' },
            { id: 'wise', label: 'Wise / Revolut', placeholder: 'Handle or email', group: 'finance' },
            { id: 'stock', label: 'Stock / ticker', placeholder: 'Symbol or broker', group: 'finance' },
            { id: 'crypto_wallet', label: 'Wallet address', placeholder: '0x… or bc1…', group: 'finance' },
            { id: 'crypto_tx', label: 'TX hash', placeholder: 'Transaction ID', group: 'finance' },
            { id: 'exchange', label: 'Exchange', placeholder: 'Binance, Coinbase…', group: 'finance' },
            { id: 'einvoice', label: 'Invoice', placeholder: 'Number or URL', group: 'finance' },
            { id: 'donation', label: 'Donation / tip', placeholder: 'Link or handle', group: 'finance' },

            // Location
            { id: 'city', label: 'City', placeholder: 'City', group: 'location' },
            { id: 'country', label: 'Country', placeholder: 'Country', group: 'location' },
            { id: 'postal', label: 'Postal', placeholder: 'ZIP or postal code', group: 'location' },
            { id: 'region', label: 'Region', placeholder: 'State, province, county', group: 'location' },
            { id: 'county', label: 'County', placeholder: 'County', group: 'location' },
            { id: 'neighborhood', label: 'Neighborhood', placeholder: 'Area or district', group: 'location' },
            { id: 'landmark', label: 'Landmark', placeholder: 'Place or building', group: 'location' },
            { id: 'poi', label: 'POI', placeholder: 'Point of interest', group: 'location' },
            { id: 'geo', label: 'Coordinates', placeholder: 'lat, lng', group: 'location' },
            { id: 'pluscode', label: 'Plus Code', placeholder: 'Open Location Code', group: 'location' },
            { id: 'w3w', label: 'What3words', placeholder: 'word.word.word', group: 'location' },
            { id: 'timezone_loc', label: 'Local timezone', placeholder: 'Zone at location', group: 'location' },
            { id: 'property', label: 'Property / parcel', placeholder: 'APN or address', group: 'location' },
            { id: 'landlord', label: 'Landlord', placeholder: 'Owner or manager', group: 'location' },
            { id: 'mailing', label: 'Mailing address', placeholder: 'PO box or mail', group: 'location' },
            { id: 'previous_addr', label: 'Previous address', placeholder: 'Former residence', group: 'location' },
            { id: 'workplace_addr', label: 'Work address', placeholder: 'Office location', group: 'location' },
            { id: 'celltower', label: 'Cell tower', placeholder: 'CID / LAC note', group: 'location' },

            // Travel
            { id: 'hotel', label: 'Hotel', placeholder: 'Hotel or stay', group: 'travel' },
            { id: 'airport', label: 'Airport', placeholder: 'IATA or name', group: 'travel' },
            { id: 'flight', label: 'Flight', placeholder: 'Flight number', group: 'travel' },
            { id: 'airline', label: 'Airline', placeholder: 'Carrier', group: 'travel' },
            { id: 'pnr', label: 'PNR / booking', placeholder: 'Confirmation code', group: 'travel' },
            { id: 'visa', label: 'Visa', placeholder: 'Type or country', group: 'travel' },
            { id: 'border', label: 'Border crossing', placeholder: 'Port or date', group: 'travel' },
            { id: 'passportstamp', label: 'Entry stamp', placeholder: 'Country / date', group: 'travel' },
            { id: 'cruise', label: 'Cruise / ship', placeholder: 'Ship or booking', group: 'travel' },
            { id: 'rentalcar', label: 'Rental car', placeholder: 'Company or plate', group: 'travel' },
            { id: 'rideshare', label: 'Rideshare', placeholder: 'Uber / Lyft note', group: 'travel' },
            { id: 'loyalty', label: 'Loyalty / FF', placeholder: 'Frequent flyer no.', group: 'travel' },

            // Evidence / other
            { id: 'audio', label: 'Audio', placeholder: 'URL or upload', group: 'evidence', file: 'audio/*' },
            { id: 'record', label: 'Record', placeholder: 'Case or document', group: 'evidence' },
            { id: 'barcode', label: 'Barcode', placeholder: 'UPC, QR, or URL', group: 'evidence' },
            { id: 'color', label: 'Color', placeholder: 'Color or paint', group: 'evidence' },
            { id: 'document', label: 'Document', placeholder: 'Title or exhibit', group: 'evidence' },
            { id: 'hash', label: 'Hash', placeholder: 'MD5, SHA, or file hash', group: 'evidence' },
            { id: 'filename', label: 'Filename', placeholder: 'File name', group: 'evidence' },
            { id: 'video', label: 'Video', placeholder: 'URL or upload name', group: 'evidence' },
            { id: 'screenshot', label: 'Screenshot', placeholder: 'URL or note', group: 'evidence' },
            { id: 'exif', label: 'EXIF', placeholder: 'Camera or GPS note', group: 'evidence' },
            { id: 'metadata', label: 'Metadata', placeholder: 'File or page meta', group: 'evidence' },
            { id: 'weapon', label: 'Weapon', placeholder: 'Type or serial (public)', group: 'evidence' },
            { id: 'firearm', label: 'Firearm serial', placeholder: 'Only if public record', group: 'evidence' },
            { id: 'drug', label: 'Substance', placeholder: 'Public case note', group: 'evidence' },
            { id: 'evidence_bag', label: 'Exhibit ID', placeholder: 'Bag or tag', group: 'evidence' },
            { id: 'photo_id', label: 'Photo ID note', placeholder: 'Doc type seen', group: 'evidence' },
            { id: 'vehicle_color', label: 'Vehicle color', placeholder: 'Paint color', group: 'evidence' },
            { id: 'vehicle_make', label: 'Vehicle make', placeholder: 'Ford, Toyota…', group: 'evidence' },
            { id: 'vehicle_model', label: 'Vehicle model', placeholder: 'Model name', group: 'evidence' },
            { id: 'vehicle_year', label: 'Vehicle year', placeholder: 'YYYY', group: 'evidence' },

            // Notes / casework
            { id: 'source', label: 'Source', placeholder: 'Where this came from', group: 'notes' },
            { id: 'quote', label: 'Quote', placeholder: 'Public statement', group: 'notes' },
            { id: 'event', label: 'Event', placeholder: 'Date or incident', group: 'notes' },
            { id: 'keyword', label: 'Keyword', placeholder: 'Search term', group: 'notes' },
            { id: 'hashtag', label: 'Hashtag', placeholder: '#tag', group: 'notes' },
            { id: 'mention', label: 'Mention', placeholder: '@account or name', group: 'notes' },
            { id: 'date', label: 'Date', placeholder: 'When', group: 'notes' },
            { id: 'status', label: 'Status', placeholder: 'Open, linked, dead end', group: 'notes' },
            { id: 'confidence', label: 'Confidence', placeholder: 'Low / med / high', group: 'notes' },
            { id: 'theory', label: 'Theory', placeholder: 'Working hypothesis', group: 'notes' },
            { id: 'lead', label: 'Lead', placeholder: 'Next step', group: 'notes' },
            { id: 'deadend', label: 'Dead end', placeholder: 'What failed', group: 'notes' },
            { id: 'priority', label: 'Priority', placeholder: 'P1 / P2 / P3', group: 'notes' },
            { id: 'tag', label: 'Tag', placeholder: 'Case tag', group: 'notes' },
            { id: 'timeline', label: 'Timeline', placeholder: 'Sequence note', group: 'notes' },
            { id: 'witness', label: 'Witness', placeholder: 'Name or handle', group: 'notes' },
            { id: 'tipster', label: 'Tipster', placeholder: 'Anonymous tip note', group: 'notes' },
            { id: 'media_outlet', label: 'Media outlet', placeholder: 'Press source', group: 'notes' }
        ];
        const ADDED_KEY = 'osint-added-fields';

        function buildAddedField(spec) {
            const base = spec.cloneOf || spec.id;
            const extra = EXTRA_PRESETS.find((item) => item.id === spec.id);
            return {
                id: spec.id,
                label: spec.label,
                placeholder: spec.placeholder || 'Value',
                group: spec.group || 'custom',
                parent: spec.parent || '',
                cloneOf: spec.cloneOf || '',
                file: spec.file || (extra && extra.file) || '',
                custom: !!spec.custom,
                caution: spec.caution || (extra && extra.caution) || '',
                leads: (v, fact) => {
                    if (DEEP_LINKS[base]) return DEEP_LINKS[base](v, fact);
                    const source = FIELDS.find((item) => item.id === base && item !== spec);
                    if (source && source.leads) return source.leads(v, fact);
                    if (DEEP_LINKS[spec.id]) return DEEP_LINKS[spec.id](v, fact);
                    return engineSet(quoted(v));
                }
            };
        }

        function loadAddedSpecs() {
            try {
                const raw = JSON.parse(localStorage.getItem(ADDED_KEY) || '[]');
                return Array.isArray(raw) ? raw : [];
            } catch (error) {
                return [];
            }
        }

        function addedFieldSpecs() {
            return FIELDS.filter((field) => !STOCK_IDS.has(field.id)).map((field) => ({
                id: field.id,
                label: field.label,
                placeholder: field.placeholder,
                group: field.group || 'custom',
                parent: field.parent || '',
                cloneOf: field.cloneOf || '',
                file: field.file || '',
                custom: !!field.custom
            }));
        }

        function saveAddedFields() {
            try { localStorage.setItem(ADDED_KEY, JSON.stringify(addedFieldSpecs())); } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function isUrlFieldSpec(spec) {
            if (!spec || !spec.id) return false;
            return spec.id === 'url' || spec.cloneOf === 'url' || String(spec.id).indexOf('url-') === 0;
        }

        loadAddedSpecs().forEach((spec) => {
            if (!spec || !spec.id || isUrlFieldSpec(spec) || FIELDS.some((field) => field.id === spec.id)) return;
            FIELDS.push(buildAddedField(spec));
        });
        if (loadAddedSpecs().some(isUrlFieldSpec)) saveAddedFields();

        const LABEL_KEY = 'osint-field-labels';

        function storedFieldLabels() {
            try {
                const raw = JSON.parse(localStorage.getItem(LABEL_KEY) || '{}');
                return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
            } catch (error) {
                return {};
            }
        }

        function saveFieldLabel(id, label) {
            const map = storedFieldLabels();
            map[id] = label;
            try { localStorage.setItem(LABEL_KEY, JSON.stringify(map)); } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function applyStoredFieldLabels() {
            const map = storedFieldLabels();
            Object.keys(map).forEach((id) => {
                const field = fieldById(id);
                const name = String(map[id] || '').trim().slice(0, 28);
                if (field && name) field.label = name;
            });
            document.querySelectorAll('.node').forEach((node) => {
                const field = fieldById(node.dataset.field);
                const label = node.querySelector('label');
                if (field && label) label.textContent = field.label;
            });
        }

        function applyFieldLabel(id, label) {
            const field = fieldById(id);
            const name = String(label || '').trim().slice(0, 28);
            if (!field || !name) return;
            field.label = name;
            const node = document.querySelector('.node[data-field="' + id + '"]');
            const el = node && node.querySelector('label');
            if (el) el.textContent = name;
            saveFieldLabel(id, name);
            if (!STOCK_IDS.has(id)) saveAddedFields();
            if (typeof renderProfile === 'function') renderProfile();
        }

        const FIND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 8h.01"/></svg>';
        const DEEP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>';
        const MORE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>';
        const DUP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/><path d="M14.5 12.5v6M11.5 15.5h6"/></svg>';

        function fieldBase(id) {
            const field = fieldById(id);
            if (field && field.cloneOf) return field.cloneOf;
            const raw = String(id || '');
            const cut = raw.match(/^(.*)-(\d+)$/);
            if (cut && fieldById(cut[1])) return cut[1];
            return raw;
        }

        function fieldGroupId(field) {
            if (field && field.group) return field.group;
            const base = field ? (field.cloneOf || field.id) : '';
            const found = GROUPS.find((group) => group.fields.indexOf(base) !== -1);
            return found ? found.id : 'custom';
        }

        const TIMEZONES = [
            { id: 'Pacific/Honolulu', abbr: 'HST', name: 'Hawaii Time', group: 'North America', aliases: ['hawaii', 'hast'] },
            { id: 'America/Anchorage', abbr: 'AKST', name: 'Alaska Time', group: 'North America', aliases: ['akdt', 'alaska'] },
            { id: 'America/Los_Angeles', abbr: 'PST', name: 'Pacific Time', group: 'North America', aliases: ['pdt', 'pacific', 'pt'] },
            { id: 'America/Denver', abbr: 'MST', name: 'Mountain Time', group: 'North America', aliases: ['mdt', 'mountain', 'mt'] },
            { id: 'America/Phoenix', abbr: 'MST', name: 'Arizona Time', group: 'North America', aliases: ['arizona'] },
            { id: 'America/Chicago', abbr: 'CST', name: 'Central Time', group: 'North America', aliases: ['cdt', 'central', 'ct'] },
            { id: 'America/New_York', abbr: 'EST', name: 'Eastern Time', group: 'North America', aliases: ['edt', 'eastern', 'et'] },
            { id: 'America/Halifax', abbr: 'AST', name: 'Atlantic Time', group: 'North America', aliases: ['adt', 'atlantic'] },
            { id: 'America/St_Johns', abbr: 'NST', name: 'Newfoundland Time', group: 'North America', aliases: ['ndt', 'newfoundland'] },
            { id: 'America/Mexico_City', abbr: 'CST', name: 'Mexico Time', group: 'Americas', aliases: ['mexico'] },
            { id: 'America/Sao_Paulo', abbr: 'BRT', name: 'Brasilia Time', group: 'Americas', aliases: ['brazil', 'brasilia'] },
            { id: 'America/Argentina/Buenos_Aires', abbr: 'ART', name: 'Argentina Time', group: 'Americas', aliases: ['argentina'] },
            { id: 'UTC', abbr: 'UTC', name: 'Coordinated Universal Time', group: 'UTC', aliases: ['z', 'gmt+0'] },
            { id: 'Atlantic/Azores', abbr: 'AZOT', name: 'Azores Time', group: 'Atlantic', aliases: ['azost', 'azores'] },
            { id: 'Europe/London', abbr: 'GMT', name: 'Greenwich Time', group: 'Europe', aliases: ['bst', 'london', 'uk', 'wet'] },
            { id: 'Europe/Lisbon', abbr: 'WET', name: 'Western Europe Time', group: 'Europe', aliases: ['west', 'portugal'] },
            { id: 'Europe/Paris', abbr: 'CET', name: 'Central Europe Time', group: 'Europe', aliases: ['cest', 'paris', 'berlin', 'rome', 'madrid'] },
            { id: 'Europe/Athens', abbr: 'EET', name: 'Eastern Europe Time', group: 'Europe', aliases: ['eest', 'athens', 'helsinki'] },
            { id: 'Europe/Moscow', abbr: 'MSK', name: 'Moscow Time', group: 'Europe', aliases: ['moscow'] },
            { id: 'Africa/Cairo', abbr: 'EET', name: 'Egypt Time', group: 'Africa', aliases: ['cairo', 'egypt'] },
            { id: 'Africa/Johannesburg', abbr: 'SAST', name: 'South Africa Time', group: 'Africa', aliases: ['south africa'] },
            { id: 'Africa/Lagos', abbr: 'WAT', name: 'West Africa Time', group: 'Africa', aliases: ['lagos', 'nigeria'] },
            { id: 'Africa/Nairobi', abbr: 'EAT', name: 'East Africa Time', group: 'Africa', aliases: ['nairobi', 'kenya'] },
            { id: 'Asia/Dubai', abbr: 'GST', name: 'Gulf Time', group: 'Asia', aliases: ['gulf', 'dubai'] },
            { id: 'Asia/Tehran', abbr: 'IRST', name: 'Iran Time', group: 'Asia', aliases: ['irdt', 'iran'] },
            { id: 'Asia/Karachi', abbr: 'PKT', name: 'Pakistan Time', group: 'Asia', aliases: ['pakistan'] },
            { id: 'Asia/Kolkata', abbr: 'IST', name: 'India Time', group: 'Asia', aliases: ['india'] },
            { id: 'Asia/Dhaka', abbr: 'BST', name: 'Bangladesh Time', group: 'Asia', aliases: ['bangladesh'] },
            { id: 'Asia/Bangkok', abbr: 'ICT', name: 'Indochina Time', group: 'Asia', aliases: ['thailand', 'vietnam'] },
            { id: 'Asia/Shanghai', abbr: 'CST', name: 'China Time', group: 'Asia', aliases: ['china'] },
            { id: 'Asia/Hong_Kong', abbr: 'HKT', name: 'Hong Kong Time', group: 'Asia', aliases: ['hong kong'] },
            { id: 'Asia/Singapore', abbr: 'SGT', name: 'Singapore Time', group: 'Asia', aliases: ['singapore'] },
            { id: 'Asia/Tokyo', abbr: 'JST', name: 'Japan Time', group: 'Asia', aliases: ['japan'] },
            { id: 'Asia/Seoul', abbr: 'KST', name: 'Korea Time', group: 'Asia', aliases: ['korea'] },
            { id: 'Australia/Perth', abbr: 'AWST', name: 'Australian Western', group: 'Australia', aliases: ['perth'] },
            { id: 'Australia/Adelaide', abbr: 'ACST', name: 'Australian Central', group: 'Australia', aliases: ['acdt', 'adelaide'] },
            { id: 'Australia/Sydney', abbr: 'AEST', name: 'Australian Eastern', group: 'Australia', aliases: ['aedt', 'sydney', 'melbourne'] },
            { id: 'Pacific/Auckland', abbr: 'NZST', name: 'New Zealand Time', group: 'Pacific', aliases: ['nzdt', 'new zealand'] },
            { id: 'Pacific/Fiji', abbr: 'FJT', name: 'Fiji Time', group: 'Pacific', aliases: ['fiji'] }
        ];

        const COUNTRY_CODES = [
            { id: 'US', dial: '+1', name: 'United States', group: 'Americas', aliases: ['usa', 'america'] },
            { id: 'CA', dial: '+1', name: 'Canada', group: 'Americas', aliases: ['canada'] },
            { id: 'MX', dial: '+52', name: 'Mexico', group: 'Americas', aliases: ['mexico'] },
            { id: 'BR', dial: '+55', name: 'Brazil', group: 'Americas', aliases: ['brazil'] },
            { id: 'AR', dial: '+54', name: 'Argentina', group: 'Americas', aliases: ['argentina'] },
            { id: 'CL', dial: '+56', name: 'Chile', group: 'Americas', aliases: ['chile'] },
            { id: 'CO', dial: '+57', name: 'Colombia', group: 'Americas', aliases: ['colombia'] },
            { id: 'PE', dial: '+51', name: 'Peru', group: 'Americas', aliases: ['peru'] },
            { id: 'VE', dial: '+58', name: 'Venezuela', group: 'Americas', aliases: ['venezuela'] },
            { id: 'GB', dial: '+44', name: 'United Kingdom', group: 'Europe', aliases: ['uk', 'britain', 'england'] },
            { id: 'IE', dial: '+353', name: 'Ireland', group: 'Europe', aliases: ['ireland'] },
            { id: 'FR', dial: '+33', name: 'France', group: 'Europe', aliases: ['france'] },
            { id: 'DE', dial: '+49', name: 'Germany', group: 'Europe', aliases: ['germany', 'deutschland'] },
            { id: 'ES', dial: '+34', name: 'Spain', group: 'Europe', aliases: ['spain'] },
            { id: 'IT', dial: '+39', name: 'Italy', group: 'Europe', aliases: ['italy'] },
            { id: 'PT', dial: '+351', name: 'Portugal', group: 'Europe', aliases: ['portugal'] },
            { id: 'NL', dial: '+31', name: 'Netherlands', group: 'Europe', aliases: ['holland', 'netherlands'] },
            { id: 'BE', dial: '+32', name: 'Belgium', group: 'Europe', aliases: ['belgium'] },
            { id: 'CH', dial: '+41', name: 'Switzerland', group: 'Europe', aliases: ['switzerland'] },
            { id: 'AT', dial: '+43', name: 'Austria', group: 'Europe', aliases: ['austria'] },
            { id: 'SE', dial: '+46', name: 'Sweden', group: 'Europe', aliases: ['sweden'] },
            { id: 'NO', dial: '+47', name: 'Norway', group: 'Europe', aliases: ['norway'] },
            { id: 'DK', dial: '+45', name: 'Denmark', group: 'Europe', aliases: ['denmark'] },
            { id: 'FI', dial: '+358', name: 'Finland', group: 'Europe', aliases: ['finland'] },
            { id: 'PL', dial: '+48', name: 'Poland', group: 'Europe', aliases: ['poland'] },
            { id: 'CZ', dial: '+420', name: 'Czechia', group: 'Europe', aliases: ['czech', 'czechia'] },
            { id: 'RO', dial: '+40', name: 'Romania', group: 'Europe', aliases: ['romania'] },
            { id: 'HU', dial: '+36', name: 'Hungary', group: 'Europe', aliases: ['hungary'] },
            { id: 'GR', dial: '+30', name: 'Greece', group: 'Europe', aliases: ['greece'] },
            { id: 'TR', dial: '+90', name: 'Turkey', group: 'Europe', aliases: ['turkey', 'turkiye'] },
            { id: 'RU', dial: '+7', name: 'Russia', group: 'Europe', aliases: ['russia'] },
            { id: 'UA', dial: '+380', name: 'Ukraine', group: 'Europe', aliases: ['ukraine'] },
            { id: 'EG', dial: '+20', name: 'Egypt', group: 'Africa', aliases: ['egypt'] },
            { id: 'ZA', dial: '+27', name: 'South Africa', group: 'Africa', aliases: ['south africa'] },
            { id: 'NG', dial: '+234', name: 'Nigeria', group: 'Africa', aliases: ['nigeria'] },
            { id: 'KE', dial: '+254', name: 'Kenya', group: 'Africa', aliases: ['kenya'] },
            { id: 'GH', dial: '+233', name: 'Ghana', group: 'Africa', aliases: ['ghana'] },
            { id: 'MA', dial: '+212', name: 'Morocco', group: 'Africa', aliases: ['morocco'] },
            { id: 'AE', dial: '+971', name: 'United Arab Emirates', group: 'Middle East', aliases: ['uae', 'dubai'] },
            { id: 'SA', dial: '+966', name: 'Saudi Arabia', group: 'Middle East', aliases: ['saudi'] },
            { id: 'IL', dial: '+972', name: 'Israel', group: 'Middle East', aliases: ['israel'] },
            { id: 'IQ', dial: '+964', name: 'Iraq', group: 'Middle East', aliases: ['iraq'] },
            { id: 'IR', dial: '+98', name: 'Iran', group: 'Middle East', aliases: ['iran'] },
            { id: 'QA', dial: '+974', name: 'Qatar', group: 'Middle East', aliases: ['qatar'] },
            { id: 'KW', dial: '+965', name: 'Kuwait', group: 'Middle East', aliases: ['kuwait'] },
            { id: 'IN', dial: '+91', name: 'India', group: 'Asia', aliases: ['india'] },
            { id: 'PK', dial: '+92', name: 'Pakistan', group: 'Asia', aliases: ['pakistan'] },
            { id: 'BD', dial: '+880', name: 'Bangladesh', group: 'Asia', aliases: ['bangladesh'] },
            { id: 'CN', dial: '+86', name: 'China', group: 'Asia', aliases: ['china'] },
            { id: 'HK', dial: '+852', name: 'Hong Kong', group: 'Asia', aliases: ['hong kong'] },
            { id: 'TW', dial: '+886', name: 'Taiwan', group: 'Asia', aliases: ['taiwan'] },
            { id: 'JP', dial: '+81', name: 'Japan', group: 'Asia', aliases: ['japan'] },
            { id: 'KR', dial: '+82', name: 'South Korea', group: 'Asia', aliases: ['korea'] },
            { id: 'SG', dial: '+65', name: 'Singapore', group: 'Asia', aliases: ['singapore'] },
            { id: 'MY', dial: '+60', name: 'Malaysia', group: 'Asia', aliases: ['malaysia'] },
            { id: 'TH', dial: '+66', name: 'Thailand', group: 'Asia', aliases: ['thailand'] },
            { id: 'VN', dial: '+84', name: 'Vietnam', group: 'Asia', aliases: ['vietnam'] },
            { id: 'PH', dial: '+63', name: 'Philippines', group: 'Asia', aliases: ['philippines'] },
            { id: 'ID', dial: '+62', name: 'Indonesia', group: 'Asia', aliases: ['indonesia'] },
            { id: 'AU', dial: '+61', name: 'Australia', group: 'Oceania', aliases: ['australia'] },
            { id: 'NZ', dial: '+64', name: 'New Zealand', group: 'Oceania', aliases: ['new zealand'] },
            { id: 'FJ', dial: '+679', name: 'Fiji', group: 'Oceania', aliases: ['fiji'] }
        ];

        function countryFlagEmoji(code) {
            const id = String(code || '').toUpperCase();
            if (!/^[A-Z]{2}$/.test(id)) return '';
            return String.fromCodePoint(127397 + id.charCodeAt(0), 127397 + id.charCodeAt(1));
        }

        function countryCodeMeta(value) {
            const resolved = resolveCountryCodeValue(value);
            return COUNTRY_CODES.find((item) => item.id === resolved) || null;
        }

        function resolveCountryCodeValue(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            const upper = raw.toUpperCase();
            if (COUNTRY_CODES.some((item) => item.id === upper)) return upper;
            const lower = raw.toLowerCase().replace(/^\+/, '').replace(/\s+/g, ' ').trim();
            const dialPart = raw.split('·')[0].trim();
            const namePart = raw.indexOf('·') !== -1 ? raw.split('·').slice(1).join('·').trim().toLowerCase() : '';
            const hit = COUNTRY_CODES.find((item) => {
                const dial = item.dial.replace(/^\+/, '');
                return item.name.toLowerCase() === lower ||
                    item.name.toLowerCase() === namePart ||
                    item.dial === raw ||
                    item.dial === dialPart ||
                    item.dial === '+' + lower ||
                    dial === lower ||
                    (item.aliases || []).indexOf(lower) !== -1;
            });
            return hit ? hit.id : '';
        }

        function syncCountryCodeTrigger(node) {
            if (!node) return;
            const id = node.dataset.field;
            const input = document.getElementById('field-' + id);
            const pick = node.querySelector('.cc-pick');
            const trigger = node.querySelector('.cc-trigger');
            const abbr = node.querySelector('.cc-abbr');
            const flagEl = node.querySelector('.cc-flag');
            if (!trigger || !abbr) return;
            const code = resolveCountryCodeValue((input && input.value) || firstValue(id));
            const meta = countryCodeMeta(code);
            const nulled = !code && isNullField(id);
            const flag = meta ? countryFlagEmoji(meta.id) : '';
            abbr.textContent = nulled ? 'Missing' : ((meta && meta.dial) || 'Code');
            if (flagEl) {
                flagEl.hidden = !flag;
                flagEl.textContent = flag;
            }
            if (pick) pick.classList.toggle('empty', !code && !nulled);
            trigger.classList.toggle('empty', !code && !nulled);
            trigger.setAttribute('aria-label', meta ? meta.name + ' ' + meta.dial : 'Choose country code');
            const nameEl = node.querySelector('.cc-name');
            if (nameEl) {
                nameEl.hidden = !meta;
                nameEl.textContent = meta ? meta.name : '';
            }
        }

        function fillCountryCodeSelects() {
            document.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (fieldBase(id) !== 'countrycode') return;
                node.classList.add('cc-node');
                const input = document.getElementById('field-' + id);
                const resolved = resolveCountryCodeValue((input && input.value) || firstValue(id));
                if (input && resolved && input.value !== resolved) input.value = resolved;
                syncCountryCodeTrigger(node);
            });
        }

        function timezoneZoneList() {
            return TIMEZONES.map((zone) => zone.id);
        }

        function timezoneMeta(zone) {
            return TIMEZONES.find((item) => item.id === zone) || null;
        }

        function resolveTimezoneValue(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            if (TIMEZONES.some((zone) => zone.id === raw)) return raw;
            const lower = raw.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
            const hit = TIMEZONES.find((zone) => {
                const city = zone.id.split('/').pop().replace(/_/g, ' ').toLowerCase();
                return zone.abbr.toLowerCase() === lower ||
                    zone.name.toLowerCase() === lower ||
                    zone.id.toLowerCase() === raw.toLowerCase() ||
                    city === lower ||
                    raw.indexOf(zone.id) !== -1 ||
                    (zone.aliases || []).indexOf(lower) !== -1;
            });
            return hit ? hit.id : '';
        }

        function formatZoneTime(zone) {
            try {
                return new Intl.DateTimeFormat(undefined, {
                    timeZone: zone,
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit'
                }).format(new Date());
            } catch (error) {
                return '';
            }
        }

        function formatZoneTimeShort(zone) {
            try {
                return new Intl.DateTimeFormat(undefined, {
                    timeZone: zone,
                    hour: 'numeric',
                    minute: '2-digit'
                }).format(new Date());
            } catch (error) {
                return '';
            }
        }

        function formatZoneOffset(zone) {
            try {
                const parts = new Intl.DateTimeFormat('en-US', {
                    timeZone: zone,
                    timeZoneName: 'shortOffset'
                }).formatToParts(new Date());
                const part = parts.find((item) => item.type === 'timeZoneName');
                return part ? part.value.replace('GMT', 'UTC') : '';
            } catch (error) {
                return '';
            }
        }

        function syncTimezoneTrigger(node) {
            if (!node) return;
            const id = node.dataset.field;
            const input = document.getElementById('field-' + id);
            const pick = node.querySelector('.tz-pick');
            const trigger = node.querySelector('.tz-trigger');
            const abbr = node.querySelector('.tz-abbr');
            if (!trigger || !abbr) return;
            const zone = resolveTimezoneValue((input && input.value) || firstValue(id));
            const nulled = !zone && isNullField(id);
            abbr.textContent = nulled ? 'Missing' : ((timezoneMeta(zone) && timezoneMeta(zone).abbr) || 'Zone');
            if (pick) pick.classList.toggle('empty', !zone && !nulled);
            trigger.classList.toggle('empty', !zone && !nulled);
            trigger.setAttribute('aria-label', zone ? 'Timezone ' + abbr.textContent : 'Choose timezone');
        }

        function fillTimezoneSelects() {
            document.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (fieldBase(id) !== 'timezone') return;
                node.classList.add('tz-node');
                const input = document.getElementById('field-' + id);
                const resolved = resolveTimezoneValue((input && input.value) || firstValue(id));
                if (input && resolved && input.value !== resolved) input.value = resolved;
                syncTimezoneTrigger(node);
            });
            updateTimezoneClocks();
        }

        function updateTimezoneClocks() {
            document.querySelectorAll('[data-tz-clock]').forEach((el) => {
                const id = el.dataset.tzClock;
                const select = document.getElementById('field-' + id);
                const zone = resolveTimezoneValue((select && select.value) || firstValue(id));
                if (!zone) {
                    el.hidden = true;
                    el.textContent = '';
                    return;
                }
                const next = formatZoneTimeShort(zone);
                el.hidden = !next;
                if (next) el.textContent = next;
            });
            document.querySelectorAll('[data-profile-tz]').forEach((el) => {
                const zone = resolveTimezoneValue(el.dataset.profileTz);
                const meta = timezoneMeta(zone);
                const clock = zone ? formatZoneTime(zone) : '';
                const label = (meta && meta.abbr) || el.dataset.profileTz;
                el.textContent = clock ? label + '  ' + clock : label;
            });
            document.querySelectorAll('#tzMenu [data-pick-tz]').forEach((btn) => {
                const clock = btn.querySelector('.tz-option-meta b');
                if (clock) clock.textContent = formatZoneTimeShort(btn.dataset.pickTz);
            });
        }

        function fieldInputValue(fieldId) {
            const input = document.getElementById('field-' + fieldId);
            return ((input && input.value) || firstValue(fieldId) || '').trim();
        }

        function searchLinks(fieldId) {
            const value = fieldInputValue(fieldId);
            const base = fieldBase(fieldId);
            if (value) {
                if (DEEP_LINKS[base]) return DEEP_LINKS[base](value, latestFact(fieldId));
                const field = fieldById(fieldId);
                return field && field.leads ? field.leads(value, latestFact(fieldId)) : engineSet(quoted(value));
            }
            if (FIND_LINKS[base]) return FIND_LINKS[base]();
            const field = fieldById(fieldId);
            return [['Google', 'Search', gq(field ? field.label : '')]];
        }

        const TOOLKIT_SEARCH_CAP = 8;

        function toolkitCatalog() {
            return window.OSINT_TOOLKIT || null;
        }

        function ensureToolkitCatalog() {
            if (window.OSINT_TOOLKIT) return Promise.resolve(window.OSINT_TOOLKIT);
            if (window.__orbintToolkitWait) return window.__orbintToolkitWait;
            window.__orbintToolkitWait = new Promise(function (resolve) {
                const s = document.createElement('script');
                s.src = 'osint-tools.js?v=218';
                s.onload = function () {
                    try { window.dispatchEvent(new Event('orbint-toolkit-ready')); } catch (error) {}
                    resolve(window.OSINT_TOOLKIT || null);
                };
                s.onerror = function () { resolve(null); };
                document.head.appendChild(s);
            });
            return window.__orbintToolkitWait;
        }

        function leadHostKey(url) {
            try {
                const parsed = new URL(url);
                return parsed.hostname.replace(/^www\./i, '').toLowerCase() + parsed.pathname.replace(/\/$/, '').toLowerCase();
            } catch (error) {
                return String(url || '').toLowerCase();
            }
        }

        function fillToolkitUrl(url, value) {
            if (!url || !value) return url;
            const raw = String(value);
            const enc = encodeURIComponent(raw);
            return String(url)
                .replace(/%3C[^%]+%3E/gi, enc)
                .replace(/<[^>]+>/g, raw)
                .replace(/\{[^}]+\}/g, enc);
        }

        function toolkitToolsForField(fieldId) {
            const catalog = toolkitCatalog();
            if (!catalog || !catalog.byField) {
                ensureToolkitCatalog();
                return [];
            }
            return catalog.byField[fieldBase(fieldId)] || [];
        }

        function mergeToolkitLeads(fieldId, links) {
            const extras = toolkitToolsForField(fieldId);
            if (!extras.length) {
                return { links: links, extraStart: links.length, extraCount: 0, extraTotal: 0 };
            }
            const seen = {};
            links.forEach((item) => { seen[leadHostKey(item[2] || item[1])] = true; });
            const value = fieldInputValue(fieldId);
            const added = [];
            extras.forEach((tool) => {
                if (added.length >= TOOLKIT_SEARCH_CAP) return;
                const href = fillToolkitUrl(tool.url, value);
                const key = leadHostKey(href);
                if (seen[key]) return;
                seen[key] = true;
                added.push([tool.name, tool.host || '', href]);
            });
            return {
                links: links.concat(added),
                extraStart: links.length,
                extraCount: added.length,
                extraTotal: extras.length
            };
        }

        function searchLeadButton(item) {
            return '<button class="search-option" type="button" data-open-lead="' + escapeHtml(item[2] || item[1]) + '" data-lead-mode="' + escapeHtml(item[3] || '') + '">' +
                escapeHtml(item[0]) + '</button>';
        }

        function toolkitBrowseButton(fieldId, extraTotal) {
            const catalog = toolkitCatalog();
            if (!catalog) return '';
            const label = extraTotal > TOOLKIT_SEARCH_CAP
                ? 'Browse OSINT toolkit · ' + extraTotal + ' for this field'
                : 'Browse OSINT toolkit';
            return '<button class="search-option" type="button" data-open-toolkit="' + escapeHtml(fieldId || '') + '">' + label + '</button>';
        }

        function setSearchIcon(node, filled) {
            const btn = node && node.querySelector('.search-btn');
            if (!btn) return;
            const next = filled ? DEEP_ICON : FIND_ICON;
            const becameReady = filled && !btn.classList.contains('ready');
            if (btn.innerHTML !== next) btn.innerHTML = next;
            btn.classList.toggle('ready', filled);
            btn.setAttribute('aria-label', filled ? 'Search deeper' : 'How to find this');
            if (becameReady) {
                btn.classList.remove('icon-pop');
                void btn.offsetWidth;
                btn.classList.add('icon-pop');
            } else if (!filled) {
                btn.classList.remove('icon-pop');
            }
        }

        function closeSearchMenu() {
            const menu = document.getElementById('searchMenu');
            if (menu) menu.hidden = true;
            document.querySelectorAll('.node.search-open').forEach((node) => node.classList.remove('search-open'));
        }

        const HIDDEN_KEY = 'osint-hidden-fields';
        let hiddenFields = (function () {
            try {
                const raw = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]');
                return new Set(Array.isArray(raw) ? raw : []);
            } catch (error) {
                return new Set();
            }
        })();

        function saveHiddenFields() {
            try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(hiddenFields))); } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function applyHiddenFields() {
            document.querySelectorAll('.node').forEach((node) => {
                node.classList.toggle('off', hiddenFields.has(node.dataset.field));
            });
            if (!isPhone() && typeof positionNodes === 'function') positionNodes();
            updateHubProgress();
            if (typeof renderProfile === 'function') renderProfile(true);
            const addSheet = document.getElementById('addSheet');
            if (addSheet && !addSheet.hidden && typeof renderAddPanel === 'function') renderAddPanel();
        }

        function isDescendantOf(id, ancestor) {
            let cur = fieldById(id);
            const seen = new Set();
            while (cur && cur.parent && !seen.has(cur.id)) {
                seen.add(cur.id);
                if (cur.parent === ancestor) return true;
                cur = fieldById(cur.parent);
            }
            return false;
        }

        function hideField(id) {
            if (typeof recordHistory === 'function') recordHistory(true);
            hiddenFields.add(id);
            FIELDS.forEach((field) => {
                if (isDescendantOf(field.id, id)) hiddenFields.add(field.id);
            });
            saveHiddenFields();
            applyHiddenFields();
        }

        function showAllFields() {
            hiddenFields.clear();
            saveHiddenFields();
            applyHiddenFields();
        }

        function showField(id) {
            hiddenFields.delete(id);
            saveHiddenFields();
            applyHiddenFields();
        }

        function groupsForProfile() {
            const groups = GROUPS.map((group) => ({
                id: group.id,
                label: group.label,
                fields: []
            }));
            const placed = {};
            function place(gid, id) {
                if (!id || placed[id]) return;
                const group = groups.find((item) => item.id === gid) || groups.find((item) => item.id === 'custom');
                if (!group) return;
                group.fields.push(id);
                placed[id] = true;
            }
            GROUPS.forEach((group) => {
                group.fields.forEach((id) => {
                    place(group.id, id);
                    FIELDS.forEach((field) => {
                        if (!field || placed[field.id]) return;
                        if (field.id === id) return;
                        if (fieldBase(field.id) === id) place(group.id, field.id);
                    });
                });
            });
            FIELDS.forEach((field) => {
                if (!field || placed[field.id]) return;
                place(fieldGroupId(field), field.id);
            });
            return groups;
        }

        function fieldSlug(label) {
            const slug = String(label || 'field').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'field';
            let id = 'custom-' + slug;
            if (!fieldById(id)) return id;
            return id + '-' + Math.random().toString(36).slice(2, 6);
        }

        function focusOrbitField(id) {
            if (isPhone()) {
                closeAddField();
                openPhoneField(id);
                return;
            }
            const input = document.getElementById('field-' + id);
            const node = document.querySelector('.node[data-field="' + id + '"]');
            activeField = id;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item.dataset.field === id);
            });
            if (isPlatformField(id)) {
                const trigger = node && node.querySelector('.platform-trigger');
                const hasPlatform = !!fieldPlatformId(id);
                if (input) input.hidden = !hasPlatform;
                if (!hasPlatform && trigger) {
                    trigger.hidden = false;
                    trigger.focus();
                    if (node) openPlatformMenu(node);
                } else if (input) input.focus();
            } else if (fieldBase(id) === 'timezone' && node) {
                openTimezoneMenu(node);
            } else if (fieldBase(id) === 'countrycode' && node) {
                openCountryCodeMenu(node);
            } else if (fieldBase(id) === 'image') {
                openPhotosSheet();
            } else if (input && input.type !== 'hidden') {
                input.hidden = false;
                input.focus();
            }
            if (node) node.classList.add('just-added');
            setTimeout(() => { if (node) node.classList.remove('just-added'); }, 900);
            renderProfile();
        }

        function uniqueDupId(base) {
            let n = 2;
            let id = base + '-' + n;
            while (fieldById(id) || document.querySelector('.node[data-field="' + id + '"]')) {
                n += 1;
                id = base + '-' + n;
            }
            return id;
        }

        function decorateNodes() {
            document.querySelectorAll('.node').forEach((node) => {
                const field = fieldById(node.dataset.field);
                node.classList.toggle('branch', !!(field && field.parent));
                node.classList.toggle('tz-node', fieldBase(node.dataset.field) === 'timezone');
                node.classList.toggle('cc-node', fieldBase(node.dataset.field) === 'countrycode');
                node.classList.toggle('image-node', fieldBase(node.dataset.field) === 'image');
                node.classList.toggle('platform-node', isPlatformField(node.dataset.field));
                node.classList.toggle('email-node', isEmailField(node.dataset.field));
                node.classList.toggle('secret-node', isSecretField(node.dataset.field));
                ensureSecretControls(node);
                ensureMapsThumb(node);
                let btn = node.querySelector('.node-more');
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = 'node-more';
                    btn.type = 'button';
                    btn.setAttribute('aria-label', 'More options');
                    btn.title = 'More';
                    btn.innerHTML = MORE_ICON;
                    node.appendChild(btn);
                }
                btn.dataset.more = node.dataset.field;
            });
        }

        function duplicateField(sourceId, opts) {
            const source = fieldById(sourceId);
            if (!source) return;
            if (typeof recordHistory === 'function') recordHistory(true);
            const base = fieldBase(sourceId);
            const stock = fieldById(base);
            const id = uniqueDupId(base);
            const spec = {
                id: id,
                label: source.label,
                placeholder: source.placeholder || (stock && stock.placeholder) || 'Value',
                group: fieldGroupId(source),
                parent: sourceId,
                cloneOf: base === id ? '' : base,
                file: source.file || (stock && stock.file) || '',
                custom: !!source.custom
            };
            if (profile && profile.facts && !profile.facts[id]) profile.facts[id] = [];
            const at = FIELDS.findIndex((field) => field.id === sourceId);
            FIELDS.splice(at < 0 ? FIELDS.length : at + 1, 0, buildAddedField(spec));
            saveAddedFields();
            createNodes();
            applyHiddenFields();
            renderNodes();
            if (typeof renderProfile === 'function') renderProfile(true);
            updateHubProgress();
            if (opts && opts.focus === 'sheet' && typeof focusSheetField === 'function') focusSheetField(id);
            else focusOrbitField(id);
            return id;
        }

        function installOrbitField(spec) {
            if (!spec || !spec.id || isUrlFieldSpec(spec)) return;
            if (fieldById(spec.id)) {
                showField(spec.id);
                focusOrbitField(spec.id);
                closeAddField();
                return;
            }
            FIELDS.push(buildAddedField(spec));
            if (profile && profile.facts && !profile.facts[spec.id]) profile.facts[spec.id] = [];
            saveAddedFields();
            createNodes();
            applyHiddenFields();
            renderNodes();
            renderProfile();
            updateHubProgress();
            focusOrbitField(spec.id);
            closeAddField();
        }

        function addOrbitField(id) {
            const existing = fieldById(id);
            if (existing) {
                showField(id);
                focusOrbitField(id);
                closeAddField();
                return;
            }
            const preset = EXTRA_PRESETS.find((item) => item.id === id);
            if (preset) installOrbitField(preset);
        }

        function restoreFilledOptionalPresets() {
            if (!profile || !profile.facts) return;
            let added = false;
            EXTRA_PRESETS.forEach((preset) => {
                if (fieldById(preset.id)) return;
                const items = profile.facts[preset.id] || [];
                if (!items.some((item) => item && String(item.value || '').trim())) return;
                FIELDS.push(buildAddedField(preset));
                added = true;
            });
            if (added) saveAddedFields();
        }

        function addCustomField(label, placeholder) {
            const name = String(label || '').trim().slice(0, 28);
            if (!name) return;
            installOrbitField({
                id: fieldSlug(name),
                label: name,
                placeholder: String(placeholder || '').trim().slice(0, 40) || 'Value',
                group: 'custom',
                custom: true
            });
        }

        function renderAddPanel() {
            const hiddenList = document.getElementById('addHiddenList');
            const hiddenBlock = document.getElementById('addHiddenBlock');
            const presetList = document.getElementById('addPresetList');
            const filterEl = document.getElementById('addPresetFilter');
            const countEl = document.getElementById('addFilterCount');
            if (!hiddenList || !presetList) return;
            const hidden = FIELDS.filter((field) => hiddenFields.has(field.id));
            if (hiddenBlock) hiddenBlock.hidden = !hidden.length;
            hiddenList.innerHTML = hidden.map((field) => (
                '<button type="button" data-add-field="' + field.id + '">' + escapeHtml(field.label) + '</button>'
            )).join('');
            const q = ((filterEl && filterEl.value) || '').trim().toLowerCase();
            const unused = EXTRA_PRESETS.filter((preset) => {
                if (fieldById(preset.id)) return false;
                if (!q) return true;
                const hay = [preset.label, preset.placeholder || '', preset.id, preset.group || ''].join(' ').toLowerCase();
                return q.split(/\s+/).every((part) => hay.indexOf(part) !== -1);
            });
            if (countEl) {
                if (q) {
                    countEl.hidden = false;
                    countEl.textContent = unused.length + ' match' + (unused.length === 1 ? '' : 'es');
                } else {
                    countEl.hidden = true;
                    countEl.textContent = '';
                }
            }
            if (!unused.length) {
                presetList.innerHTML = '<p class="add-empty">' + (q ? 'No matching fields.' : 'Every extra field is already on the orbit.') + '</p>';
                return;
            }
            const grouped = {};
            unused.forEach((preset) => {
                const gid = preset.group || 'custom';
                if (!grouped[gid]) grouped[gid] = [];
                grouped[gid].push(preset);
            });
            presetList.innerHTML = GROUPS.map((group) => {
                const items = grouped[group.id];
                if (!items || !items.length) return '';
                return '<div class="add-group">' +
                    '<div class="add-group-label">' + escapeHtml(group.label) + '</div>' +
                    '<div class="add-chips">' +
                    items.map((preset) => (
                        '<button type="button" data-add-field="' + preset.id + '" title="' + escapeHtml(preset.placeholder || preset.label) + '">' + escapeHtml(preset.label) + '</button>'
                    )).join('') +
                    '</div></div>';
            }).join('');
        }

        function showSheet(sheet) {
            if (!sheet) return;
            const instant = reduceMotionOn();
            sheet.hidden = false;
            if (instant || sheet.classList.contains('is-in')) {
                sheet.classList.add('is-in');
                return;
            }
            sheet.classList.remove('is-in');
            void sheet.offsetWidth;
            requestAnimationFrame(function () { sheet.classList.add('is-in'); });
        }

        function hideSheet(sheet) {
            if (!sheet || sheet.hidden) return;
            if (!sheet.classList.contains('is-in') || reduceMotionOn()) {
                sheet.classList.remove('is-in');
                sheet.hidden = true;
                return;
            }
            sheet.classList.remove('is-in');
            let closed = false;
            const done = function (event) {
                if (event && event.target !== sheet) return;
                if (closed) return;
                closed = true;
                sheet.hidden = true;
                sheet.removeEventListener('transitionend', done);
            };
            sheet.addEventListener('transitionend', done);
            setTimeout(done, 340);
        }

        function closeAddField() {
            hideSheet(document.getElementById('addSheet'));
        }

        function openAddField() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeHelp();
            closeToolkit();
            const sheet = document.getElementById('addSheet');
            const label = document.getElementById('addCustomLabel');
            const hint = document.getElementById('addCustomHint');
            const filter = document.getElementById('addPresetFilter');
            if (label) label.value = '';
            if (hint) hint.value = '';
            if (filter) filter.value = '';
            renderAddPanel();
            showSheet(sheet);
            if (label) label.focus();
            else if (filter) filter.focus();
        }

        function toggleAddField() {
            const sheet = document.getElementById('addSheet');
            if (!sheet) return;
            if (sheet.hidden) openAddField();
            else closeAddField();
        }

        let toolkitFocusField = '';
        const toolkitOpenCats = new Set();
        const TOOLKIT_CHEVRON = '<svg class="toolkit-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
        const TOOLKIT_SECTIONS = [
            {
                id: 'identity',
                label: 'Identity',
                titles: [
                    'Username Search', 'Email Search', 'People Search', 'Phone Number Search',
                    'Dating Search', 'Social Network Search', 'Messaging Search', 'Forum Search', 'Community Search'
                ]
            },
            {
                id: 'web',
                label: 'Web & infrastructure',
                titles: [
                    'Domain Search', 'Cloud Infrastructure Search', 'IP Address Search',
                    'Web Archives', 'Search Engines', 'Dark Web Search'
                ]
            },
            {
                id: 'media',
                label: 'Media & files',
                titles: [
                    'Image Search', 'Video Search', 'Document Search', 'Media Verification',
                    'File Analysis', 'Malware Analysis'
                ]
            },
            {
                id: 'records',
                label: 'Places & records',
                titles: [
                    'Maps Search', 'Location Search', 'Public Records Search', 'Compliance Search',
                    'Business Records Search', 'Vehicle Search', 'Transport Search', 'Classifieds Search'
                ]
            },
            {
                id: 'crypto',
                label: 'Crypto & threat',
                titles: ['Crypto Search', 'Threat Intelligence']
            },
            {
                id: 'utilities',
                label: 'Utilities',
                titles: [
                    'Translation Tools', 'Mobile Search Tools', 'Fact-Check Tools', 'Encoding Tools',
                    'Decoding Tools', 'Privacy Tools', 'Safety Tools', 'Evidence Collection',
                    'Research Training', 'AI Research Tools', 'Research Toolkit'
                ]
            }
        ];
        const TOOLKIT_TITLE_CLEAN = {
            'Username Search': 'Usernames',
            'Email Search': 'Email',
            'Domain Search': 'Domains',
            'Cloud Infrastructure Search': 'Cloud & infra',
            'IP Address Search': 'IP addresses',
            'Image Search': 'Images',
            'Video Search': 'Video',
            'Document Search': 'Documents',
            'Social Network Search': 'Social networks',
            'Messaging Search': 'Messaging',
            'People Search': 'People',
            'Dating Search': 'Dating',
            'Phone Number Search': 'Phone numbers',
            'Public Records Search': 'Public records',
            'Compliance Search': 'Compliance',
            'Business Records Search': 'Business records',
            'Vehicle Search': 'Vehicles',
            'Transport Search': 'Transport',
            'Maps Search': 'Maps',
            'Location Search': 'Location',
            'Search Engines': 'Search engines',
            'Forum Search': 'Forums',
            'Community Search': 'Communities',
            'Web Archives': 'Web archives',
            'Translation Tools': 'Translation',
            'Mobile Search Tools': 'Mobile',
            'Dark Web Search': 'Dark web',
            'Fact-Check Tools': 'Fact-check',
            'Media Verification': 'Media verification',
            'Crypto Search': 'Crypto',
            'Classifieds Search': 'Classifieds',
            'Encoding Tools': 'Encoding',
            'Decoding Tools': 'Decoding',
            'Research Toolkit': 'Research toolkit',
            'AI Research Tools': 'AI research',
            'Malware Analysis': 'Malware analysis',
            'File Analysis': 'File analysis',
            'Threat Intelligence': 'Threat intel',
            'Privacy Tools': 'Privacy',
            'Safety Tools': 'Safety',
            'Evidence Collection': 'Evidence',
            'Research Training': 'Training'
        };

        function closeToolkit() {
            hideSheet(document.getElementById('toolkitSheet'));
            toolkitFocusField = '';
        }

        function toolkitCatKey(cat) {
            return String((cat && (cat.id || cat.title)) || '');
        }

        function toolkitCleanTitle(title) {
            if (TOOLKIT_TITLE_CLEAN[title]) return TOOLKIT_TITLE_CLEAN[title];
            return String(title || '')
                .replace(/\s+Search$/i, '')
                .replace(/\s+Tools$/i, '')
                .trim() || title;
        }

        function toolkitToolButton(tool, value) {
            const href = fillToolkitUrl(tool.url, value);
            return '<button type="button" class="toolkit-tool" data-open-lead="' + escapeHtml(href) + '">' +
                '<span>' + escapeHtml(tool.name) + '</span>' +
                (tool.host ? '<em>' + escapeHtml(tool.host) + '</em>' : '') +
                '</button>';
        }

        function toolkitCatHtml(cat, tools, value, open) {
            const key = toolkitCatKey(cat);
            const title = toolkitCleanTitle(cat.title);
            return '<div class="toolkit-cat" data-toolkit-cat="' + escapeHtml(key) + '">' +
                '<button type="button" class="toolkit-cat-toggle" data-toolkit-toggle="' + escapeHtml(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
                TOOLKIT_CHEVRON +
                '<span class="toolkit-cat-title">' + escapeHtml(title) + '</span>' +
                '<span class="toolkit-cat-count">' + tools.length + '</span>' +
                '</button>' +
                '<div class="toolkit-tools"' + (open ? '' : ' hidden') + '>' +
                tools.map((tool) => toolkitToolButton(tool, value)).join('') +
                '</div></div>';
        }

        function renderToolkit() {
            const catalog = toolkitCatalog();
            const list = document.getElementById('toolkitList');
            const meta = document.getElementById('toolkitMeta');
            const focusBar = document.getElementById('toolkitFocus');
            const focusLabel = document.getElementById('toolkitFocusLabel');
            if (!list) return;
            if (!catalog || !catalog.categories) {
                list.innerHTML = '<p class="toolkit-empty">Loading tools…</p>';
                if (meta) meta.textContent = '';
                if (focusBar) focusBar.dataset.on = '0';
                return;
            }
            const filterEl = document.getElementById('toolkitFilter');
            const q = String(filterEl && filterEl.value || '').trim().toLowerCase();
            const focus = toolkitFocusField;
            const value = focus ? fieldInputValue(focus) : '';
            const field = focus ? fieldById(focus) : null;
            if (focusBar) {
                focusBar.dataset.on = focus && field ? '1' : '0';
                if (focusLabel) focusLabel.textContent = field ? field.label : '';
            }

            const byTitle = new Map();
            catalog.categories.forEach((cat) => byTitle.set(cat.title, cat));
            const used = new Set();
            let shown = 0;
            let shownCats = 0;

            function filterTools(cat) {
                let tools = cat.tools || [];
                const titleHit = q && (
                    toolkitCleanTitle(cat.title).toLowerCase().indexOf(q) !== -1 ||
                    String(cat.title || '').toLowerCase().indexOf(q) !== -1
                );
                if (q && !titleHit) {
                    tools = tools.filter((tool) =>
                        (tool.name + ' ' + (tool.host || '') + ' ' + (tool.url || '')).toLowerCase().indexOf(q) !== -1
                    );
                }
                return tools;
            }

            function shouldOpen(cat, tools) {
                const key = toolkitCatKey(cat);
                if (toolkitOpenCats.has(key)) return true;
                if (q) return tools.length > 0 && tools.length <= 80;
                const fieldHit = focus && (cat.fields || []).indexOf(focus) !== -1;
                return !!(fieldHit && tools.length && tools.length <= 48);
            }

            function renderCat(cat) {
                if (!cat || used.has(cat.title)) return '';
                const tools = filterTools(cat);
                if (!tools.length) return '';
                used.add(cat.title);
                shown += tools.length;
                shownCats += 1;
                return toolkitCatHtml(cat, tools, value, shouldOpen(cat, tools));
            }

            let html = '';
            TOOLKIT_SECTIONS.forEach((section) => {
                const body = section.titles.map((title) => renderCat(byTitle.get(title))).join('');
                if (!body) return;
                html += '<section class="toolkit-section" data-toolkit-section="' + escapeHtml(section.id) + '">' +
                    '<div class="toolkit-section-label">' + escapeHtml(section.label) + '</div>' +
                    body +
                    '</section>';
            });
            const orphans = catalog.categories.map((cat) => renderCat(cat)).join('');
            if (orphans) {
                html += '<section class="toolkit-section" data-toolkit-section="other">' +
                    '<div class="toolkit-section-label">More</div>' +
                    orphans +
                    '</section>';
            }

            list.innerHTML = html || '<p class="toolkit-empty">No tools match.</p>';
            if (meta) {
                const total = catalog.categories.reduce((n, cat) => n + ((cat.tools && cat.tools.length) || 0), 0);
                meta.textContent = shownCats + ' categories · ' + shown + (q ? ' matching' : '') + ' tools · ' + total + ' total';
            }
        }

        function openToolkit(fieldId) {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeHelp();
            closeAddField();
            if (typeof closePhoneMore === 'function') closePhoneMore();
            toolkitFocusField = fieldBase(fieldId || '');
            toolkitOpenCats.clear();
            const filter = document.getElementById('toolkitFilter');
            const field = fieldById(toolkitFocusField);
            if (filter) {
                filter.value = '';
                filter.placeholder = field
                    ? ('Search tools for ' + field.label)
                    : 'Search categories or tools';
            }
            renderToolkit();
            showSheet(document.getElementById('toolkitSheet'));
            ensureToolkitCatalog().then(function () {
                renderToolkit();
                if (filter) filter.focus();
            });
        }

        function toggleToolkit() {
            const sheet = document.getElementById('toolkitSheet');
            if (!sheet) return;
            if (sheet.hidden) openToolkit();
            else closeToolkit();
        }

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
                '<button type="button" data-field-act="help">Help</button>' +
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

        function openSearchMenu(fieldId, fromEl) {
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const menu = document.getElementById('searchMenu');
            const field = fieldById(fieldId);
            const anchor = fromEl || node;
            if (!menu || !field || !anchor) return;
            closePlatformMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            const value = fieldInputValue(fieldId);
            const filled = !!value;
            const pack = mergeToolkitLeads(fieldId, searchLinks(fieldId));
            const core = pack.links.slice(0, pack.extraStart);
            const extra = pack.links.slice(pack.extraStart);
            menu.innerHTML =
                '<div class="search-menu-title">' + (filled ? 'Search deeper' : 'Find this') + ' · ' + escapeHtml(field.label) + '</div>' +
                (filled
                    ? '<div class="search-menu-note">' + (fieldId === 'image'
                        ? 'Searches the photo itself, not the file name.'
                        : 'Opens with this value filled in. Copied for sites that need a paste.') + '</div>'
                    : '<div class="search-menu-note">Sources for a ' + escapeHtml(field.label.toLowerCase()) + '.</div>') +
                (field.caution ? '<div class="search-menu-note">' + escapeHtml(field.caution) + '</div>' : '') +
                '<div class="search-list">' +
                core.map(searchLeadButton).join('') +
                (extra.length ? '<div class="search-menu-title">More OSINT tools</div>' + extra.map(searchLeadButton).join('') : '') +
                toolkitBrowseButton(fieldId, pack.extraTotal) +
                '</div>';
            menu.hidden = false;
            document.querySelectorAll('.node.search-open').forEach((item) => item.classList.remove('search-open'));
            if (node) node.classList.add('search-open');
            placeSearchMenu(anchor);
            activeField = fieldId;
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
        }

        function latestFact(id) {
            const values = ((profile.facts && profile.facts[id]) || []).filter((item) => item && String(item.value || '').trim());
            return values[values.length - 1] || null;
        }

        function addFact(id, value, extra) {
            const clean = String(value || '').trim();
            if (!clean) return;
            profile.facts[id] = profile.facts[id] || [];
            const same = profile.facts[id].some((item) => {
                if (item.value.toLowerCase() !== clean.toLowerCase()) return false;
                if (extra && extra.platform) return item.platform === extra.platform;
                return true;
            });
            if (same) {
                if (extra) {
                    const existing = profile.facts[id].find((item) => item.value.toLowerCase() === clean.toLowerCase());
                    if (existing) Object.keys(extra).forEach((key) => { existing[key] = extra[key]; });
                    saveProfile();
                    renderProfile();
                    renderNodes();
                    recordHistory(true);
                }
                return;
            }
            const fact = { value: clean, addedAt: new Date().toISOString() };
            if (extra) Object.keys(extra).forEach((key) => { fact[key] = extra[key]; });
            if (isNullField(id)) setFieldNull(id, false, true);
            profile.facts[id].push(fact);
            saveProfile();
            renderProfile();
            renderNodes();
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
            const hasMeta = !!(fact && (fact.source || fact.confidence || fact.method || fact.capturedAt));
            const more = '<button type="button" class="fact-more' + (hasMeta ? ' has-meta' : '') + '" data-fact-more="' + field.id + '" aria-expanded="' + (detailsOpen ? 'true' : 'false') + '" aria-label="Details" title="Details">' + SHEET_CHEVRON + '</button>';
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

        const SHARE_IV_LEN = 12;
        const SHARE_POLL_MS = 2800;
        const SHARE_HOST_KEY = 'orbint-share-host';
        let shareState = {
            roomId: '',
            keyB64: '',
            hostToken: '',
            hosting: false,
            live: false,
            ended: false,
            mode: '',
            readonly: false,
            rev: 0,
            lastPut: 0,
            timer: 0,
            watch: null,
            busy: false,
            error: '',
            lastViewUrl: ''
        };

        function shareServices() {
            const set = (typeof OrbINTSettings !== 'undefined' && OrbINTSettings.get) ? OrbINTSettings.get() : {};
            const baked = window.ORBINT_SERVICES || {};
            return {
                api: String(set.shareApiUrl || baked.shareApi || '').replace(/\/$/, ''),
                watch: String(set.collabWsUrl || baked.collabWs || '').replace(/\/$/, '')
            };
        }

        function shareRandomB64(bytes) {
            const buf = new Uint8Array(bytes);
            crypto.getRandomValues(buf);
            return btoa(String.fromCharCode.apply(null, buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        }

        function shareB64ToBytes(b64) {
            const pad = b64.replace(/-/g, '+').replace(/_/g, '/');
            const raw = atob(pad + '==='.slice((pad.length + 3) % 4));
            const out = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
            return out;
        }

        function shareParseHash(hash) {
            const raw = String(hash || location.hash || '').replace(/^#/, '');
            const room = /^room=([A-Za-z0-9_-]+),([A-Za-z0-9_-]+)(?:,(view|edit))?$/.exec(raw);
            if (room) {
                return { kind: 'room', id: room[1], key: room[2], mode: room[3] === 'edit' ? 'edit' : 'view' };
            }
            const frozen = /^json=([A-Za-z0-9_-]+),([A-Za-z0-9_-]+)$/.exec(raw);
            if (frozen) return { kind: 'json', id: frozen[1], key: frozen[2], mode: 'view' };
            return null;
        }

        function shareLink(id, key) {
            const origin = location.origin + location.pathname + location.search;
            return origin + '#room=' + id + ',' + key + ',view';
        }

        async function shareImportKey(b64) {
            return crypto.subtle.importKey(
                'raw',
                shareB64ToBytes(b64),
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        }

        async function shareEncrypt(keyB64, obj) {
            const key = await shareImportKey(keyB64);
            const iv = crypto.getRandomValues(new Uint8Array(SHARE_IV_LEN));
            const encoded = new TextEncoder().encode(JSON.stringify(obj));
            const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encoded));
            const out = new Uint8Array(iv.length + sealed.length);
            out.set(iv, 0);
            out.set(sealed, iv.length);
            return out;
        }

        async function shareDecrypt(keyB64, buf) {
            const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
            if (bytes.length < SHARE_IV_LEN + 16) throw new Error('short');
            const key = await shareImportKey(keyB64);
            const iv = bytes.slice(0, SHARE_IV_LEN);
            const data = bytes.slice(SHARE_IV_LEN);
            const open = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
            return JSON.parse(new TextDecoder().decode(open));
        }

        async function shareDigestHex(bytes) {
            const hash = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(hash)).map(function (n) {
                return (n < 16 ? '0' : '') + n.toString(16);
            }).join('');
        }

        function shareApiUrl(kind, id) {
            const svc = shareServices();
            if (!svc.api) return '';
            return svc.api + '/v1/' + kind + '/' + encodeURIComponent(id);
        }

        function shareHostHeaders(extra) {
            const headers = extra || {};
            if (shareState.hostToken) headers['X-OrbINT-Host'] = shareState.hostToken;
            headers['X-OrbINT-Live'] = shareState.live ? 'on' : 'off';
            return headers;
        }

        function sharePersistHost() {
            if (!shareState.hosting || !shareState.roomId || !shareState.keyB64 || !shareState.hostToken) return;
            try {
                localStorage.setItem(SHARE_HOST_KEY, JSON.stringify({
                    roomId: shareState.roomId,
                    keyB64: shareState.keyB64,
                    hostToken: shareState.hostToken,
                    live: !!shareState.live
                }));
            } catch (error) {}
        }

        function shareLoadHost() {
            try {
                const raw = JSON.parse(localStorage.getItem(SHARE_HOST_KEY) || 'null');
                if (!raw || !raw.roomId || !raw.keyB64 || !raw.hostToken) return;
                shareState.roomId = raw.roomId;
                shareState.keyB64 = raw.keyB64;
                shareState.hostToken = raw.hostToken;
                shareState.hosting = true;
                shareState.live = !!raw.live;
                shareState.mode = 'edit';
                shareState.lastViewUrl = shareLink(raw.roomId, raw.keyB64);
            } catch (error) {}
        }

        function shareEnsureIdentity() {
            if (shareState.roomId && shareState.keyB64 && shareState.hostToken) {
                shareState.lastViewUrl = shareLink(shareState.roomId, shareState.keyB64);
                return;
            }
            shareState.roomId = shareRandomB64(16);
            shareState.keyB64 = shareRandomB64(16);
            shareState.hostToken = shareRandomB64(18);
            shareState.hosting = true;
            shareState.live = false;
            shareState.mode = 'edit';
            shareState.lastViewUrl = shareLink(shareState.roomId, shareState.keyB64);
            sharePersistHost();
        }

        async function sharePutBlob(id, bytes) {
            const url = shareApiUrl('blob', id);
            if (!url) throw new Error('no-api');
            const headers = shareHostHeaders({ 'Content-Type': 'application/octet-stream', 'X-OrbINT-Kind': 'room' });
            const res = await fetch(url, { method: 'PUT', headers: headers, body: bytes });
            if (res.status === 403) throw new Error('host-token');
            if (!res.ok) throw new Error('put-' + res.status);
            return res;
        }

        async function sharePutSession(live) {
            const url = shareApiUrl('session', shareState.roomId);
            if (!url) throw new Error('no-api');
            const headers = shareHostHeaders({});
            headers['X-OrbINT-Live'] = live ? 'on' : 'off';
            const res = await fetch(url, { method: 'PUT', headers: headers });
            if (res.status === 403) throw new Error('host-token');
            if (!res.ok) throw new Error('session-' + res.status);
        }

        async function shareGetBlob(id) {
            const url = shareApiUrl('blob', id);
            if (!url) throw new Error('no-api');
            const res = await fetch(url, { method: 'GET' });
            if (res.status === 410 || res.status === 404) return { ended: true };
            if (!res.ok) throw new Error('get-' + res.status);
            return { bytes: new Uint8Array(await res.arrayBuffer()) };
        }

        function shareCurrentBundle() {
            if (typeof flushLibrarySync === 'function') flushLibrarySync();
            const id = profileLibrary && profileLibrary.activeId;
            if (typeof exportProfileBundle === 'function') return exportProfileBundle(id);
            return {};
        }

        function shareApplyBundle(bundle, opts) {
            if (!bundle || typeof bundle !== 'object') return;
            const entry = (typeof coerceImportedEntry === 'function')
                ? coerceImportedEntry(bundle, bundle.title || 'Shared case')
                : bundle;
            if (!entry) return;
            if (bundle.id) entry.id = bundle.id;
            if (bundle.case) entry.case = bundle.case;
            if (bundle.audit) entry.audit = bundle.audit;
            if (profileLibrary && profileLibrary.items) {
                const id = entry.id || (profileLibrary.activeId);
                entry.id = id;
                profileLibrary.items[id] = Object.assign(profileLibrary.items[id] || {}, entry);
                profileLibrary.activeId = id;
            }
            if (typeof applyWorkspace === 'function') applyWorkspace(entry, opts || { keepCamera: true });
        }

        function shareSetReadonly(on) {
            shareState.readonly = !!on;
            document.body.classList.toggle('share-readonly', shareState.readonly);
            const banner = document.getElementById('shareReadonlyBanner');
            if (banner) {
                banner.hidden = !shareState.readonly || shareState.ended;
                banner.textContent = 'View-only session. You can read this case while the host keeps it on.';
            }
        }

        function shareShowEnded(on) {
            const show = !shareState.hosting && !!on;
            const first = show && !shareState.ended;
            shareState.ended = !!on;
            document.body.classList.toggle('share-ended', show);
            const el = document.getElementById('shareEndedCurtain');
            if (el) el.hidden = !show;
            const banner = document.getElementById('shareReadonlyBanner');
            if (banner && show) banner.hidden = true;
            if (first) shareClearViewerCase();
        }

        function shareClearViewerCase() {
            if (shareState.hosting) return;
            const facts = (typeof emptyFacts === 'function') ? emptyFacts() : {};
            shareApplyBundle({
                facts: facts,
                title: '',
                analysis: '',
                added: [],
                labels: {},
                hidden: [],
                layout: null,
                peerHomes: {},
                investigation: null,
                case: {},
                audit: []
            }, { keepCamera: false });
        }

        async function sharePush() {
            if (!shareState.hosting || !shareState.live || shareState.busy) return;
            const id = shareState.roomId;
            const key = shareState.keyB64;
            if (!id || !key) return;
            shareState.rev += 1;
            const payload = {
                v: 1,
                kind: 'orbint-share',
                mode: 'view',
                rev: shareState.rev,
                at: new Date().toISOString(),
                bundle: shareCurrentBundle()
            };
            const bytes = await shareEncrypt(key, payload);
            await sharePutBlob(id, bytes);
            shareState.lastPut = Date.now();
            shareState.error = '';
        }

        async function sharePull(force) {
            if (!shareState.roomId || !shareState.keyB64 || shareState.busy) return;
            if (shareState.hosting && !force) return;
            shareState.busy = true;
            try {
                const got = await shareGetBlob(shareState.roomId);
                if (got && got.ended) {
                    shareState.live = false;
                    if (!shareState.hosting) shareShowEnded(true);
                    shareState.error = '';
                    return;
                }
                if (!got || !got.bytes) return;
                const payload = await shareDecrypt(shareState.keyB64, got.bytes);
                if (!payload || !payload.bundle) return;
                if (!force && Number(payload.rev || 0) <= shareState.rev) return;
                shareState.rev = Number(payload.rev || 0);
                shareState.live = true;
                shareShowEnded(false);
                shareApplyBundle(payload.bundle, { keepCamera: true });
                shareState.error = '';
            } catch (error) {
                shareState.error = String(error && error.message || error);
            } finally {
                shareState.busy = false;
            }
        }

        function shareStopLive() {
            if (shareState.timer) {
                clearInterval(shareState.timer);
                shareState.timer = 0;
            }
            if (shareState.watch) {
                try { shareState.watch.close(); } catch (error) {}
                shareState.watch = null;
            }
        }

        function shareStartLive() {
            shareStopLive();
            if (!shareState.roomId) return;
            const svc = shareServices();
            if (svc.watch) {
                try {
                    const url = svc.watch.replace(/\/$/, '') + '/v1/watch/' + encodeURIComponent(shareState.roomId);
                    const es = new EventSource(url);
                    es.onmessage = function (event) {
                        if (String(event.data || '').indexOf('ended') === 0) {
                            shareState.live = false;
                            if (!shareState.hosting) shareShowEnded(true);
                            sharePaint();
                            return;
                        }
                        sharePull(false);
                    };
                    shareState.watch = es;
                } catch (error) {}
            }
            shareState.timer = setInterval(function () {
                if (document.hidden) return;
                sharePull(false);
            }, SHARE_POLL_MS);
        }

        async function shareSetLive(on) {
            const svc = shareServices();
            if (!svc.api) throw new Error('Set a share API URL in Settings (or .env SHARE_API_URL).');
            shareEnsureIdentity();
            shareState.error = '';
            if (on) {
                shareState.hosting = true;
                shareSetReadonly(false);
                shareShowEnded(false);
                shareState.live = true;
                try {
                    await sharePush();
                } catch (error) {
                    shareState.live = false;
                    throw error;
                }
                shareStartLive();
                sharePersistHost();
                if (typeof appendCaseAudit === 'function') appendCaseAudit('share', '', 'Session on');
            } else {
                await sharePutSession(false);
                shareState.live = false;
                shareStopLive();
                sharePersistHost();
                if (typeof appendCaseAudit === 'function') appendCaseAudit('share', '', 'Session off');
            }
            sharePaint();
            return shareState.lastViewUrl;
        }

        async function shareJoinFromHash() {
            const parsed = shareParseHash(location.hash);
            if (!parsed) return false;
            const svc = shareServices();
            if (!svc.api) {
                shareState.error = 'This link needs SHARE_API_URL configured.';
                sharePaint();
                return false;
            }
            const isHost = !!(shareState.hosting && shareState.roomId === parsed.id && shareState.keyB64 === parsed.key);
            shareState.roomId = parsed.id;
            shareState.keyB64 = parsed.key;
            shareState.mode = parsed.mode;
            shareState.lastViewUrl = shareLink(parsed.id, parsed.key);
            if (isHost) {
                shareSetReadonly(false);
                shareShowEnded(false);
                if (shareState.live) shareStartLive();
                sharePaint();
                return true;
            }
            shareState.hosting = false;
            shareState.hostToken = '';
            shareSetReadonly(true);
            await sharePull(true);
            shareStartLive();
            sharePaint();
            return true;
        }

        function shareCopyText(text) {
            const value = String(text || '');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(value);
            }
            return Promise.resolve();
        }

        function sharePaint() {
            const status = document.getElementById('shareCollabStatus');
            const hint = document.getElementById('shareSessionHint');
            const viewUrl = document.getElementById('shareViewUrl');
            const err = document.getElementById('shareCollabError');
            const toggle = document.getElementById('shareSessionLive');
            const hostBox = document.getElementById('shareHostControls');
            const svc = shareServices();
            if (!shareState.readonly) shareEnsureIdentity();
            if (hostBox) hostBox.hidden = !!(shareState.readonly && !shareState.hosting);
            if (toggle && document.activeElement !== toggle) toggle.checked = !!(shareState.hosting && shareState.live);
            if (status) {
                if (!svc.api) status.textContent = 'No share server yet. Add SHARE_API_URL in .env / Settings.';
                else if (shareState.hosting && shareState.live) status.textContent = 'Session on. Anyone with the link can view this case.';
                else if (shareState.hosting) status.textContent = 'Session off. The link stays the same, but nobody can view the case.';
                else if (shareState.ended) status.textContent = 'This session is off. Nothing is available to view.';
                else if (shareState.readonly) status.textContent = 'Viewing an encrypted session.';
                else status.textContent = 'Turn the session on to let the link work. The key stays in the #hash.';
            }
            if (hint) {
                hint.textContent = shareState.live
                    ? 'On. Anyone with the link can view until you end it.'
                    : 'Off. Nobody can view anything.';
            }
            if (viewUrl) {
                const url = shareState.lastViewUrl || (shareState.roomId && shareState.keyB64 ? shareLink(shareState.roomId, shareState.keyB64) : '');
                viewUrl.textContent = url || 'A link appears here once this device is ready.';
            }
            if (err) {
                err.hidden = !shareState.error;
                err.textContent = shareState.error || '';
            }
        }

        window.OrbINTShare = {
            create: function () { return shareSetLive(true); },
            setLive: shareSetLive,
            join: shareJoinFromHash,
            push: function () {
                if (!shareState.hosting || !shareState.live) return Promise.resolve();
                return sharePush().catch(function (error) {
                    shareState.error = String(error && error.message || error);
                    sharePaint();
                });
            },
            paint: sharePaint,
            readonly: function () { return shareState.readonly; },
            digest: shareDigestHex,
            copy: shareCopyText,
            boot: function () {
                shareLoadHost();
                shareJoinFromHash().then(function () {
                    if (shareState.hosting && shareState.live && !shareState.readonly) {
                        return sharePush().then(function () { shareStartLive(); });
                    }
                }).then(function () {
                    sharePaint();
                }).catch(function (error) {
                    shareState.error = String(error && error.message || error);
                    sharePaint();
                });
                window.addEventListener('hashchange', function () {
                    shareJoinFromHash().then(sharePaint);
                });
            }
        };

        function createNodes() {
            if (!mapCanvas) return;
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (id === 'url' || (id && id.indexOf('url-') === 0) || (id && !fieldById(id))) node.remove();
            });
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                node.style.left = '';
                node.style.top = '';
            });
            FIELDS.forEach((field) => {
                if (mapCanvas.querySelector('.node[data-field="' + field.id + '"]')) return;
                const node = document.createElement('div');
                node.className = 'node';
                node.dataset.field = field.id;
                const base = fieldBase(field.id);
                if (base === 'timezone') {
                    node.className = 'node tz-node';
                    node.innerHTML =
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<span class="tz-pick empty"><span class="tz-abbr">Zone</span><button class="tz-trigger" type="button" aria-label="Choose timezone" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="tz-clock" data-tz-clock="' + field.id + '" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'countrycode') {
                    node.className = 'node cc-node';
                    node.innerHTML =
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<span class="cc-pick empty"><span class="cc-flag" hidden></span><span class="cc-abbr">Code</span><button class="cc-trigger" type="button" aria-label="Choose country code" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="cc-name" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'image') {
                    node.className = 'node image-node';
                    node.innerHTML =
                        '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="Open ' + escapeHtml(field.label) + '"></button>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="image-add" type="button" data-photos-open aria-label="Add photos">Add</button>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (isPlatformField(field.id)) {
                    node.classList.add('platform-node');
                    if (isSecretField(field.id)) node.classList.add('secret-node');
                    node.innerHTML =
                        '<span class="platform-icon" hidden></span>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="platform-trigger" type="button">Select site</button>' +
                            '<input id="field-' + field.id + '" type="' + (isSecretField(field.id) ? 'password' : 'text') + '" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" spellcheck="false" autocomplete="off" hidden>' +
                            (isSecretField(field.id) ? secretRevealBtnHtml(field.id) : '') +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else {
                    const email = isEmailField(field.id);
                    const secret = isSecretField(field.id);
                    if (email) node.classList.add('email-node');
                    if (secret) node.classList.add('secret-node');
                    node.innerHTML =
                        (email ? '<span class="platform-icon" hidden></span>' : '') +
                        ((base === 'image' || base === 'audio' || base === 'ip' || base === 'address')
                            ? '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="' + (base === 'address' ? 'Open in Google Maps' : 'Open ' + escapeHtml(field.label)) + '"></button>'
                            : '') +
                        '<div class="node-copy">' +
                            '<label for="field-' + field.id + '">' + escapeHtml(field.label) + '</label>' +
                            '<input id="field-' + field.id + '" type="' + (secret ? 'password' : 'text') + '" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder) + '" spellcheck="false" autocomplete="off">' +
                            (secret ? secretRevealBtnHtml(field.id) : '') +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            (field.file ? '<button class="file-btn" type="button" data-file="' + field.id + '">+</button>' : '') +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>' +
                        (field.file ? '<input type="file" accept="' + field.file + '" hidden data-upload="' + field.id + '">' : '');
                }
                mapCanvas.appendChild(node);
            });
            decorateNodes();
            fillTimezoneSelects();
            fillCountryCodeSelects();
        }

        function syncNodeFilled(input) {
            const node = input && input.closest('.node');
            if (!node) return false;
            const fieldId = node.dataset.field;
            const filled = !!(input.value && input.value.trim());
            if (filled && isNullField(fieldId)) {
                setFieldNull(fieldId, false, true);
                saveProfile();
            }
            const nulled = !filled && isNullField(fieldId);
            node.classList.toggle('filled', filled);
            node.classList.toggle('null', nulled);
            if (input && !input.dataset.ph) input.dataset.ph = input.getAttribute('placeholder') || '';
            if (input) input.placeholder = nulled ? 'Missing' : (input.dataset.ph || '');
            setSearchIcon(node, filled);
            if (isEmailField(fieldId)) setEmailIcon(node, input.value);
            updateHubProgress();
            return filled;
        }

        function renderNodes() {
            FIELDS.forEach((field) => {
                const node = document.querySelector('.node[data-field="' + field.id + '"]');
                if (!node) return;
                const input = document.getElementById('field-' + field.id);
                const fact = fieldBase(field.id) === 'image' ? (primaryImageFact() || latestFact(field.id)) : latestFact(field.id);
                if (input && document.activeElement !== input) {
                    const next = fact ? (fieldBase(field.id) === 'phone' ? formatPhoneNumber(fact.value) : fact.value) : '';
                    if (fieldBase(field.id) === 'timezone') input.value = resolveTimezoneValue(next);
                    else if (fieldBase(field.id) === 'countrycode') input.value = resolveCountryCodeValue(next);
                    else input.value = next;
                }
                const filled = syncNodeFilled(input);
                node.classList.toggle('active', activeField === field.id);

                if (isPlatformField(field.id)) {
                    setUsernameStep(node, fieldPlatformId(field.id), filled);
                }

                if (fieldBase(field.id) === 'timezone') {
                    syncTimezoneTrigger(node);
                    updateTimezoneClocks();
                }

                if (fieldBase(field.id) === 'countrycode') {
                    syncCountryCodeTrigger(node);
                }

                if (isThumbField(field.id)) {
                    setFieldThumb(field.id);
                }

                if (isSecretField(field.id)) syncSecretNode(node);
            });
            positionNodes();
        }

        const mapStage = document.getElementById('mapStage');
        let reduceMotion = reduceMotionOn();
        const orbit = {
            dragX: 0,
            dragY: 0,
            zoom: 1,
            targetZoom: 1,
            zoomFocusX: null,
            zoomFocusY: null,
            zoomWorldX: null,
            zoomWorldY: null,
            zoomBusy: false,
            spin: 0,
            dSpin: 0,
            pulse: 1,
            parallaxX: 0,
            parallaxY: 0,
            targetParallaxX: 0,
            targetParallaxY: 0,
            spotX: null,
            spotY: null,
            targetSpotX: null,
            targetSpotY: null,
            gridShiftX: 0,
            gridShiftY: 0,
            gridPanX: 0,
            gridPanY: 0,
            gridOriginX: 0,
            gridOriginY: 0,
            dragging: false,
            dragMode: null,
            dragStartX: 0,
            dragStartY: 0,
            dragOriginX: 0,
            dragOriginY: 0,
            hubPx: null,
            hubPy: null,
            hubLiveX: null,
            hubLiveY: null,
            hubLiveVX: 0,
            hubLiveVY: 0,
            dragItem: null,
            grabX: 0,
            grabY: 0,
            grabOffX: 0,
            grabOffY: 0,
            grabVX: 0,
            grabVY: 0,
            panVX: 0,
            panVY: 0,
            prevCX: 0,
            prevCY: 0,
            snapLayout: true,
            restoreHomes: false,
            userZoomed: false,
            freeCam: false,
            fitZoom: 1,
            fitZooming: false,
            fitCount: -1,
            pinching: false,
            pinchDist: 0,
            pinchZoom: 1,
            raf: 0,
            tickAt: 0
        };
        const LAYOUT_KEY = 'osint-orbit-layout-v1';
        const nodeHomes = new Map();
        let orbitItems = [];
        let peerBodies = [];
        const PEER_HUB_SIZE = 92;
        let cachedLayout = null;
        let saveLayoutTimer = 0;
        const pinchPointers = new Map();

        function loadSavedLayout() {
            try {
                const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '');
                return raw && raw.items && typeof raw.items === 'object' ? raw : null;
            } catch (error) {
                return null;
            }
        }

        function saveOrbitLayout() {
            const size = canvasSize();
            if (!size.width || !size.height || !orbitItems.length) return;
            const items = {};
            orbitItems.forEach((item) => {
                const id = item.node && item.node.dataset.field;
                if (!id) return;
                items[id] = {
                    angle: item.tAngle == null ? item.angle : item.tAngle,
                    rx: item.tRx == null ? item.rx : item.tRx,
                    ry: item.tRy == null ? item.ry : item.tRy
                };
            });
            nodeHomes.forEach((home, id) => { items[id] = home; });
            try {
                localStorage.setItem(LAYOUT_KEY, JSON.stringify({
                    w: size.width,
                    h: size.height,
                    dragX: orbit.dragX,
                    dragY: orbit.dragY,
                    gridPanX: orbit.gridPanX,
                    gridPanY: orbit.gridPanY,
                    zoom: orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom,
                    homes: Array.from(nodeHomes.entries()),
                    items: items
                }));
            } catch (error) {}
            if (typeof queueLibrarySync === 'function') queueLibrarySync();
        }

        function scheduleSaveLayout() {
            clearTimeout(saveLayoutTimer);
            saveLayoutTimer = setTimeout(saveOrbitLayout, 160);
        }

        function resetPhoneOrbitCamera() {
            if (typeof isPhone !== 'function' || !isPhone()) return false;
            orbit.dragX = 0;
            orbit.dragY = 0;
            orbit.gridPanX = 0;
            orbit.gridPanY = 0;
            orbit.gridShiftX = 0;
            orbit.gridShiftY = 0;
            orbit.userZoomed = false;
            orbit.freeCam = false;
            orbit.fitZooming = true;
            orbit.zoom = 1;
            orbit.targetZoom = 1;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.zoomBusy = false;
            orbit.pinching = false;
            return true;
        }

        cachedLayout = loadSavedLayout();
        if (cachedLayout) {
            if (!resetPhoneOrbitCamera()) {
                if (Number.isFinite(cachedLayout.dragX)) orbit.dragX = cachedLayout.dragX;
                if (Number.isFinite(cachedLayout.dragY)) orbit.dragY = cachedLayout.dragY;
                orbit.gridPanX = Number.isFinite(cachedLayout.gridPanX) ? cachedLayout.gridPanX : orbit.dragX;
                orbit.gridPanY = Number.isFinite(cachedLayout.gridPanY) ? cachedLayout.gridPanY : orbit.dragY;
                if (Number.isFinite(cachedLayout.zoom) && cachedLayout.zoom > 0) {
                    orbit.zoom = cachedLayout.zoom;
                    orbit.targetZoom = cachedLayout.zoom;
                }
            }
            (cachedLayout.homes || []).forEach((entry) => {
                if (entry && entry[0] && entry[1]) nodeHomes.set(entry[0], entry[1]);
            });
        }

        function boxesOverlap(a, b, gap) {
            return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + gap &&
                Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap;
        }

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function orbitMinZoom() {
            return 0.001;
        }

        function orbitMaxZoom() {
            return 500;
        }

        function orbitViewInsets() {
            if (!isPhone()) return { top: 0, right: 0, bottom: 0, left: 0 };
            return { top: 56, right: 10, bottom: 78, left: 10 };
        }

        function nodeScreenLimits(item, width, height) {
            const insets = orbitViewInsets();
            const pad = isPhone() ? 6 : 14;
            const halfW = Math.max((item.sw || item.w || 0) / 2, 8);
            const halfH = Math.max((item.sh || item.h || 0) / 2, 8);
            const minX = insets.left + pad + halfW;
            const maxX = width - insets.right - pad - halfW;
            const minY = insets.top + pad + halfH;
            const maxY = height - insets.bottom - pad - halfH;
            return {
                x: minX > maxX ? width / 2 : clamp(item.x, minX, maxX),
                y: minY > maxY ? height / 2 : clamp(item.y, minY, maxY),
                tx: minX > maxX ? width / 2 : clamp(item.tx == null ? item.x : item.tx, minX, maxX),
                ty: minY > maxY ? height / 2 : clamp(item.ty == null ? item.y : item.ty, minY, maxY)
            };
        }

        function keepNodeOnScreen(item, width, height) {
            const next = nodeScreenLimits(item, width, height);
            if (next.x !== item.x) item.vx = 0;
            if (next.y !== item.y) item.vy = 0;
            item.x = next.x;
            item.y = next.y;
            item.tx = next.tx;
            item.ty = next.ty;
            return next;
        }

        function hubScreenBox(width, height) {
            const zoom = orbit.zoom || 1;
            const w = (hub && hub.offsetWidth || 220) * zoom;
            const h = (hub && hub.offsetHeight || 220) * zoom;
            const x = width / 2 + orbit.dragX + orbit.parallaxX;
            const y = height / 2 + orbit.dragY + orbit.parallaxY;
            return { x: x, y: y, tx: x, ty: y, sw: w, sh: h, w: w, h: h };
        }

        function keepHubOnScreen(width, height) {
            const prevX = orbit.dragX;
            const prevY = orbit.dragY;
            if (orbit.dragging && orbit.dragMode === 'hub') {
                orbit.dragX = orbit.grabX - width / 2 - orbit.parallaxX;
                orbit.dragY = orbit.grabY - height / 2 - orbit.parallaxY;
            }
            const box = hubScreenBox(width, height);
            keepNodeOnScreen(box, width, height);
            orbit.dragX = box.x - width / 2 - orbit.parallaxX;
            orbit.dragY = box.y - height / 2 - orbit.parallaxY;
            if (orbit.dragging && orbit.dragMode === 'hub') {
                orbit.grabX = box.x;
                orbit.grabY = box.y;
            } else {
                orbit.gridPanX += orbit.dragX - prevX;
                orbit.gridPanY += orbit.dragY - prevY;
            }
            return box;
        }

        function shortestAngle(from, to) {
            let delta = to - from;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            return delta;
        }

        let canvasBox = { left: 0, top: 0, width: 0, height: 0 };

        function syncCanvasBox() {
            const stage = mapStage || mapCanvas;
            if (!stage) return canvasBox;
            const r = stage.getBoundingClientRect();
            canvasBox = {
                left: r.left,
                top: r.top,
                width: r.width || stage.clientWidth || window.innerWidth || 0,
                height: r.height || stage.clientHeight || window.innerHeight || 0
            };
            return canvasBox;
        }

        function canvasSize() {
            if (isPhone() || !canvasBox.width || !canvasBox.height) syncCanvasBox();
            if (canvasBox.width && canvasBox.height) return { width: canvasBox.width, height: canvasBox.height };
            const canvasW = mapCanvas && mapCanvas.clientWidth;
            const canvasH = mapCanvas && mapCanvas.clientHeight;
            if (canvasW && canvasH) return { width: canvasW, height: canvasH };
            const stage = document.getElementById('mapStage');
            const rect = (stage || mapCanvas || document.body).getBoundingClientRect();
            return { width: rect.width || window.innerWidth || 0, height: rect.height || window.innerHeight || 0 };
        }

        function computeLayout() {
            const nodes = Array.from(document.querySelectorAll('.node:not(.off)'));
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height || !nodes.length) return;

            const cx = width / 2;
            const cy = height / 2;
            const phone = isPhone();
            const insets = orbitViewInsets();
            const innerW = Math.max(80, width - insets.left - insets.right);
            const innerH = Math.max(80, height - insets.top - insets.bottom);
            const pad = phone ? 10 : 16;
            const hubClear = hub ? Math.max(hub.offsetWidth, hub.offsetHeight) / 2 + (phone ? 16 : 6) : (phone ? 68 : 116);

            const visibleIds = new Set(nodes.map((node) => node.dataset.field));

            function visibleParentId(id) {
                let field = fieldById(id);
                const seen = new Set();
                while (field && field.parent && !seen.has(field.id)) {
                    seen.add(field.id);
                    if (visibleIds.has(field.parent)) return field.parent;
                    field = fieldById(field.parent);
                }
                return '';
            }

            const items = nodes.map((node, index) => ({
                node,
                index,
                w: node.offsetWidth || 168,
                h: node.offsetHeight || 34,
                parentId: visibleParentId(node.dataset.field)
            }));

            const roots = items.filter((item) => !item.parentId);
            const maxNodeW = Math.max.apply(null, items.map((item) => item.w));
            const maxNodeH = Math.max.apply(null, items.map((item) => item.h));
            const viewMaxRx = Math.max(phone ? 36 : 80, innerW / 2 - pad - maxNodeW / 2);
            const viewMaxRy = Math.max(phone ? 36 : 80, innerH / 2 - pad - maxNodeH / 2);
            const hubMinX = hubClear + maxNodeW / 2 + 2;
            const hubMinY = hubClear + maxNodeH / 2 + 2;

            function fieldOrder(id) {
                const at = FIELDS.findIndex((field) => field.id === id);
                return at < 0 ? 999 : at;
            }

            function idJitter(id) {
                let h = 2166136261;
                const text = String(id || '');
                for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
                return (h >>> 0) / 4294967296;
            }

            const others = roots.filter((item) => item.node.dataset.field !== 'name').sort((a, b) => {
                return fieldOrder(a.node.dataset.field) - fieldOrder(b.node.dataset.field)
                    + (idJitter(a.node.dataset.field) - idJitter(b.node.dataset.field)) * 7;
            });
            const nameItem = roots.find((item) => item.node.dataset.field === 'name');
            const ordered = others.slice();
            if (nameItem) {
                const at = Math.min(ordered.length, Math.max(0, Math.round(idJitter(nameItem.node.dataset.field) * ordered.length)));
                ordered.splice(at, 0, nameItem);
            }
            const boxGap = (phone ? 6 : 12) + Math.min(6, Math.max(0, roots.length - 10) * 0.2);
            let ovalRatio = phone ? 1.12 : 0.6;

            function ovalRy(rx) {
                const lo = hubMinY + 10;
                const hi = phone ? viewMaxRy * 1.08 : viewMaxRy * 1.06;
                return Math.min(Math.max(rx * ovalRatio, lo), hi);
            }

            function poleAmount(angle) {
                const s = Math.abs(Math.sin(angle));
                return s * s;
            }

            function isPinnedRoot(item) {
                if (phone) return false;
                const home = nodeHomes.get(item.node.dataset.field);
                return !!(home && home.pinned && Number.isFinite(home.angle));
            }

            function ellipseSpeedAt(angle, rx, ry) {
                return Math.max(Math.hypot(rx * Math.sin(angle), ry * Math.cos(angle)), 10);
            }

            function warpAroundOval(t) {
                // Spend less time at 12 and 6 so wide pills sit on the sides of the oval.
                return t - 0.2 * Math.sin(2 * t);
            }

            function packRoots(rx, ry) {
                const n = ordered.length;
                if (n < 1) return 1;
                if (n === 1) {
                    ordered[0].angle = ordered[0].angle || -Math.PI / 2;
                    ordered[0].rx = rx;
                    ordered[0].ry = ry;
                    ordered[0].x = cx + Math.cos(ordered[0].angle) * rx;
                    ordered[0].y = cy + Math.sin(ordered[0].angle) * ry;
                    return 1;
                }

                ordered.forEach((item, i) => {
                    if (!isPinnedRoot(item)) {
                        const u = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2;
                        const jitter = (idJitter(item.node.dataset.field) - 0.5) * 0.055;
                        item.angle = warpAroundOval(u) + jitter;
                    }
                    if (!item.radialLift) {
                        item.rx = rx;
                        item.ry = ry;
                    }
                    item.x = cx + Math.cos(item.angle) * item.rx;
                    item.y = cy + Math.sin(item.angle) * item.ry;
                });

                let tight = 0;
                for (let i = 0; i < ordered.length; i++) {
                    for (let j = i + 1; j < ordered.length; j++) {
                        if (boxesOverlap(ordered[i], ordered[j], boxGap)) tight++;
                    }
                }
                return tight ? -tight : 1;
            }

            ordered.forEach((item) => {
                item.radialLift = false;
            });

            const crowd = Math.min(1, roots.length / 22);
            let maxRx = phone ? viewMaxRx * 1.06 : viewMaxRx * 1.12;
            let maxRy = phone ? viewMaxRy * 1.05 : viewMaxRy * 1.12;
            let ringRx = phone
                ? Math.max(hubMinX + 12, Math.min(maxRx, viewMaxRx * 0.96))
                : Math.min(maxRx, Math.max(hubMinX + 40, viewMaxRx * (0.78 + crowd * 0.14)));
            let ringRy = ovalRy(ringRx);
            packRoots(ringRx, ringRy);

            function project(item) {
                item.x = cx + Math.cos(item.angle) * item.rx;
                item.y = cy + Math.sin(item.angle) * item.ry;
            }

            function radialExtent(item, angle) {
                const a = angle == null ? item.angle : angle;
                return (item.w / 2) * Math.abs(Math.cos(a)) + (item.h / 2) * Math.abs(Math.sin(a));
            }

            function stampOval(item) {
                if (!item.radialLift) {
                    item.rx = ringRx;
                    item.ry = ringRy;
                }
                project(item);
            }

            function liftOutward(item, pix) {
                item.radialLift = true;
                item.rx = Math.min(maxRx, (item.rx || ringRx) + Math.max(18, pix));
                item.ry = Math.min(maxRy, Math.max(hubMinY, ovalRy(item.rx)));
                project(item);
            }

            function ellipseSpeed(item) {
                return Math.hypot((item.rx || ringRx) * Math.sin(item.angle), (item.ry || ringRy) * Math.cos(item.angle)) || 90;
            }

            function separatePair(a, b, gap) {
                if (!boxesOverlap(a, b, gap)) return false;
                const pinA = !a.parentId && isPinnedRoot(a);
                const pinB = !b.parentId && isPinnedRoot(b);
                const needX = (a.w + b.w) / 2 + gap - Math.abs(a.x - b.x);
                const needY = (a.h + b.h) / 2 + gap - Math.abs(a.y - b.y);
                let sep = shortestAngle(a.angle, b.angle);
                if (Math.abs(sep) < 0.02) {
                    sep = (idJitter(a.node.dataset.field) >= 0.5 ? 1 : -1) * 0.06;
                }
                const dir = sep >= 0 ? 1 : -1;
                const pix = Math.max(3, Math.min(needX, needY));
                const speed = Math.max((ellipseSpeed(a) + ellipseSpeed(b)) / 2, 50);
                const push = Math.min(0.2, (pix / speed) * 0.85);
                if (pinA && pinB) {
                    a.angle -= dir * Math.max(push, 0.03);
                    b.angle += dir * Math.max(push, 0.03);
                    project(a);
                    project(b);
                    return true;
                }
                if (!pinA && !pinB) {
                    a.angle -= dir * push * 0.5;
                    b.angle += dir * push * 0.5;
                } else if (!pinA) {
                    a.angle -= dir * push;
                } else {
                    b.angle += dir * push;
                }
                if (!a.parentId) stampOval(a);
                else project(a);
                if (!b.parentId) stampOval(b);
                else project(b);
                return true;
            }

            function overlapNeed(list) {
                let needX = 0;
                let needY = 0;
                let hits = 0;
                for (let i = 0; i < list.length; i++) {
                    for (let j = i + 1; j < list.length; j++) {
                        const a = list[i];
                        const b = list[j];
                        if (!boxesOverlap(a, b, boxGap)) continue;
                        hits++;
                        needX = Math.max(needX, (a.w + b.w) / 2 + boxGap - Math.abs(a.x - b.x));
                        needY = Math.max(needY, (a.h + b.h) / 2 + boxGap - Math.abs(a.y - b.y));
                    }
                }
                return { hits: hits, needX: needX, needY: needY };
            }

            function spreadRootsOnOval() {
                const growLimit = phone ? 8 : 10;
                const ratioCap = phone ? 1.16 : 0.68;
                for (let grow = 0; grow < growLimit; grow++) {
                    packRoots(ringRx, ringRy);
                    roots.forEach((item) => {
                        if (!item.radialLift) {
                            item.rx = ringRx;
                            item.ry = ringRy;
                        }
                        project(item);
                    });
                    for (let iter = 0; iter < (phone ? 28 : 36); iter++) {
                        let hits = 0;
                        for (let i = 0; i < roots.length; i++) {
                            for (let j = i + 1; j < roots.length; j++) {
                                if (separatePair(roots[i], roots[j], boxGap * (phone ? 0.4 : 0.45))) hits++;
                            }
                        }
                        if (!hits) return;
                    }
                    const stuck = overlapNeed(roots);
                    // Leave a few pixels of clip; the live ease finishes it.
                    if (!stuck.hits || (stuck.needX < 8 && stuck.needY < 8)) return;
                    if (ringRx < maxRx - 0.5) {
                        ringRx = Math.min(maxRx, ringRx * (phone ? 1.02 : 1.025));
                        ringRy = ovalRy(ringRx);
                    } else if (ovalRatio < ratioCap) {
                        ovalRatio = Math.min(ratioCap, ovalRatio + (phone ? 0.02 : 0.015));
                        ringRy = ovalRy(ringRx);
                    } else {
                        return;
                    }
                }
            }

            roots.forEach((item) => {
                if (phone) return;
                const home = nodeHomes.get(item.node.dataset.field);
                if (home && home.pinned && Number.isFinite(home.angle)) item.angle = home.angle;
            });
            spreadRootsOnOval();

            function placeBranches() {
                const byId = new Map(items.map((item) => [item.node.dataset.field, item]));
                const kids = {};
                items.forEach((item) => {
                    if (!item.parentId) return;
                    if (!kids[item.parentId]) kids[item.parentId] = [];
                    kids[item.parentId].push(item);
                });
                function placeKids(pid) {
                    const parent = byId.get(pid);
                    const list = kids[pid];
                    if (!parent || !list) return;
                    const extra = radialExtent(parent) + Math.max.apply(null, list.map((child) => radialExtent(child, parent.angle))) + (phone ? 18 : 28);
                    const midR = Math.max(parent.rx + extra, 90);
                    const angNeed = Math.atan2((Math.max.apply(null, list.map((child) => child.w)) + 16) / 2, midR) * 2;
                    const fan = list.length > 1 ? Math.min(1.15, angNeed * (list.length - 1)) : 0;
                    const polar = { angle: parent.angle, rx: parent.rx, ry: parent.ry };
                    const halves = list.map((entry) => Math.atan2((entry.w + 16) / 2, midR));
                    const used = halves.reduce((sum, span) => sum + 2 * span, 0);
                    const gap = list.length > 1 ? Math.max(0.04, (fan - used) / (list.length - 1)) : 0;
                    list.forEach((child, i) => {
                        if (list.length === 1) {
                            child.angle = polar.angle;
                        } else {
                            let angle = polar.angle - (used + gap * (list.length - 1)) / 2 + halves[0];
                            for (let k = 0; k < i; k++) angle += halves[k] + gap + halves[k + 1];
                            child.angle = angle;
                        }
                        child.rx = Math.min(maxRx, polar.rx + extra);
                        child.ry = ovalRy(child.rx);
                        project(child);
                        placeKids(child.node.dataset.field);
                    });
                }
                roots.forEach((root) => placeKids(root.node.dataset.field));

                for (let iter = 0; iter < 48; iter++) {
                    let hits = 0;
                    items.forEach((child) => {
                        if (!child.parentId) return;
                        const parent = byId.get(child.parentId);
                        items.forEach((other) => {
                            if (child === other || !boxesOverlap(child, other, 24)) return;
                            hits++;
                            child.rx = Math.min(maxRx, child.rx + 12);
                            child.ry = ovalRy(child.rx);
                            if (parent) {
                                const only = (kids[child.parentId] || []).length <= 1;
                                if (only) {
                                    child.angle = parent.angle;
                                } else {
                                    const away = shortestAngle(other.angle, child.angle) >= 0 ? 0.05 : -0.05;
                                    child.angle += away;
                                    const drift = shortestAngle(parent.angle, child.angle);
                                    if (Math.abs(drift) > 0.85) child.angle = parent.angle + Math.sign(drift || 1) * 0.85;
                                }
                            }
                            project(child);
                        });
                    });
                    if (!hits) break;
                }
            }

            roots.forEach(project);
            placeBranches();

            function chromeBoxes() {
                const boxes = [];
                const canvasRect = mapCanvas.getBoundingClientRect();
                function add(el, extra) {
                    if (!el || el.hidden) return;
                    const r = el.getBoundingClientRect();
                    if (!r.width || !r.height) return;
                    boxes.push({
                        x: r.left - canvasRect.left + r.width / 2,
                        y: r.top - canvasRect.top + r.height / 2,
                        w: r.width + extra,
                        h: r.height + extra
                    });
                }
                add(document.getElementById('dock'), 28);
                add(document.getElementById('donate'), 22);
                add(document.getElementById('workNav') || document.getElementById('pageSwitch'), 22);
                return boxes;
            }

            function clampToCanvas(item) {
                return false;
            }

            const chrome = phone ? [] : chromeBoxes();

            function unstackPoles() {
                spreadRootsOnOval();
            }

            function separateRoots(a, b) {
                separatePair(a, b, boxGap);
            }

            for (let iter = 0; iter < 48; iter++) {
                let hits = 0;
                roots.forEach((item) => {
                    if (clampToCanvas(item)) hits++;
                    chrome.forEach((box) => {
                        if (!boxesOverlap(item, box, 10)) return;
                        hits++;
                        item.angle += (Math.sin(item.angle) > 0 ? -1 : 1) * 0.04 * (Math.cos(item.angle) >= 0 ? 1 : -1);
                        project(item);
                    });
                    const dist = Math.hypot(item.x - cx, item.y - cy);
                    const need = hubClear + radialExtent(item) + 2;
                    if (dist < need) {
                        hits++;
                        const scale = need / Math.max(dist, 1);
                        item.rx = Math.min(maxRx, item.rx * scale);
                        item.ry = Math.min(maxRy, Math.max(item.ry * scale, ovalRy(item.rx)));
                        item.radialLift = item.rx > ringRx + 0.5 || item.ry > ringRy + 0.5;
                        project(item);
                    }
                });

                items.forEach((item) => {
                    if (!item.parentId) return;
                    if (clampToCanvas(item)) hits++;
                    chrome.forEach((box) => {
                        if (!boxesOverlap(item, box, 10)) return;
                        hits++;
                        item.rx = Math.min(maxRx, item.rx + 8);
                        item.ry = ovalRy(item.rx);
                        project(item);
                    });
                    const dist = Math.hypot(item.x - cx, item.y - cy);
                    const need = hubClear + radialExtent(item) + 2;
                    if (dist < need) {
                        hits++;
                        item.rx = Math.min(maxRx, item.rx * (need / Math.max(dist, 1)));
                        item.ry = ovalRy(item.rx);
                        project(item);
                    }
                });
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        const polarPad = (!a.parentId && !b.parentId)
                            ? 10 + 8 * Math.max(poleAmount(a.angle), poleAmount(b.angle))
                            : 10;
                        if (!boxesOverlap(a, b, polarPad)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separateRoots(a, b);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        const parent = move.parentId && items.find((item) => item.node.dataset.field === move.parentId);
                        move.rx = Math.min(maxRx, move.rx + 8);
                        move.ry = ovalRy(move.rx);
                        const siblings = items.filter((entry) => entry.parentId === move.parentId);
                        if (!(parent && siblings.length <= 1)) {
                            move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.04 : -0.04;
                        }
                        if (parent) {
                            if (siblings.length <= 1) {
                                move.angle = parent.angle;
                            } else {
                                const drift = shortestAngle(parent.angle, move.angle);
                                if (Math.abs(drift) > 0.85) move.angle = parent.angle + Math.sign(drift || 1) * 0.85;
                            }
                        }
                        project(move);
                    }
                }
                if (!hits) break;
            }

            unstackPoles();
            roots.forEach(stampOval);
            for (let pass = 0; pass < 4; pass++) {
                let hits = 0;
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        if (!boxesOverlap(a, b, boxGap * 0.25)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separatePair(a, b, boxGap * 0.25);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        const parent = move.parentId && items.find((item) => item.node.dataset.field === move.parentId);
                        move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.02 : -0.02;
                        if (parent) {
                            const drift = shortestAngle(parent.angle, move.angle);
                            if (Math.abs(drift) > 0.9) move.angle = parent.angle + Math.sign(drift || 1) * 0.9;
                        }
                        project(move);
                    }
                }
                if (!hits) break;
            }
            placeBranches();
            for (let pass = 0; pass < 6; pass++) {
                let hits = 0;
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        if (!boxesOverlap(a, b, boxGap * 0.2)) continue;
                        hits++;
                        if (!a.parentId && !b.parentId) {
                            separatePair(a, b, boxGap * 0.2);
                            continue;
                        }
                        const move = a.parentId ? a : b;
                        const other = move === a ? b : a;
                        move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.02 : -0.02;
                        project(move);
                    }
                }
                if (!hits) break;
            }

            function untangleBoxes(list, gap, loops) {
                for (let iter = 0; iter < loops; iter++) {
                    let hits = 0;
                    for (let i = 0; i < list.length; i++) {
                        for (let j = i + 1; j < list.length; j++) {
                            const a = list[i];
                            const b = list[j];
                            if (!boxesOverlap(a, b, gap)) continue;
                            hits++;
                            if (!a.parentId && !b.parentId) {
                                separatePair(a, b, gap);
                                continue;
                            }
                            const move = a.parentId ? a : b;
                            const other = move === a ? b : a;
                            move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.025 : -0.025;
                            project(move);
                        }
                    }
                    if (!hits) break;
                }
            }
            untangleBoxes(items, boxGap * 0.15, 8);

            if (linkLayer) {
                linkLayer.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                linkLayer.innerHTML = '';
            }
            const prev = new Map(orbitItems.map((item) => [item.node, item]));
            orbitItems = items.map((item) => {
                const old = prev.get(item.node);
                const parentOld = item.parentId && Array.from(prev.values()).find((other) => other.node.dataset.field === item.parentId);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('stroke', orbitSpokeStroke(item.node, false));
                line.setAttribute('stroke-width', '1');
                if (linkLayer) linkLayer.appendChild(line);
                let angle = item.angle;
                let rx = item.rx;
                let ry = item.ry;
                let x = item.x;
                let y = item.y;
                if (orbit.snapLayout) {
                    angle = item.angle;
                    rx = item.rx;
                    ry = item.ry;
                    x = item.x;
                    y = item.y;
                } else if (old) {
                    angle = old.angle;
                    rx = old.rx;
                    ry = old.ry;
                    x = old.x;
                    y = old.y;
                } else if (parentOld) {
                    angle = item.angle;
                    rx = Math.max(parentOld.rx + 24, item.rx * 0.86);
                    ry = Math.max(parentOld.ry + 24, item.ry * 0.86);
                    x = parentOld.x;
                    y = parentOld.y;
                }
                return {
                    node: item.node,
                    angle: angle,
                    rx: rx,
                    ry: ry,
                    tAngle: item.angle,
                    tRx: item.rx,
                    tRy: item.ry,
                    w: item.w,
                    h: item.h,
                    line: line,
                    parentId: item.parentId || '',
                    x: x,
                    y: y,
                    vx: old && !orbit.snapLayout ? old.vx : 0,
                    vy: old && !orbit.snapLayout ? old.vy : 0,
                    comingHome: old && old.comingHome,
                    bloomWait: old && old.bloomWait > 0 ? old.bloomWait : 0
                };
            });

            if (orbit.fitCount !== nodes.length) {
                orbit.fitCount = nodes.length;
            }
            let maxDx = hubClear + 24;
            let maxDy = hubClear + 24;
            items.forEach((item) => {
                maxDx = Math.max(maxDx, Math.abs(item.x - cx) + item.w / 2);
                maxDy = Math.max(maxDy, Math.abs(item.y - cy) + item.h / 2);
            });
            const availX = Math.max(phone ? 40 : 80, innerW / 2);
            const availY = Math.max(phone ? 40 : 80, innerH / 2);
            const raw = Math.min(1, availX / Math.max(maxDx, 1), availY / Math.max(maxDy, 1));
            const fit = phone
                ? clamp(raw * 0.96, 0.8, 0.98)
                : Math.max(0.86, 1 - (1 - raw) * 0.32);
            orbit.fitZoom = fit;
            if (!orbit.dragging && !orbit.userZoomed && !orbit.pinching) {
                orbit.targetZoom = fit;
                orbit.fitZooming = Math.abs(orbit.zoom - fit) > 0.008;
                if (orbit.snapLayout || reduceMotion) {
                    orbit.zoom = fit;
                    orbit.fitZooming = false;
                }
            }

            applyOrbit(orbit.snapLayout ? 1000 : 16);
            if (orbit.snapLayout && mapCanvas) mapCanvas.classList.add('orbit-ready');
            scheduleSaveLayout();
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        const mapGrid = document.getElementById('mapGrid');

        function follow(current, target, dt, ms) {
            if (current == null || !Number.isFinite(current)) return target;
            if (target == null || !Number.isFinite(target)) return current;
            const tau = Math.max(ms, 1);
            return current + (target - current) * (1 - Math.exp(-dt / tau));
        }

        function smoothDamp(current, target, vel, dt, ms) {
            if (current == null || !Number.isFinite(current)) return { value: target, vel: 0 };
            if (target == null || !Number.isFinite(target)) return { value: current, vel: 0 };
            const st = Math.max((ms || 420) / 1000, 0.02);
            const h = Math.min(Math.max(dt || 16, 1), 48) / 1000;
            const omega = 2 / st;
            const x = omega * h;
            const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
            const change = current - target;
            const temp = ((vel || 0) + omega * change) * h;
            let nextVel = ((vel || 0) - omega * temp) * exp;
            let next = target + (change + temp) * exp;
            if ((target - current > 0) === (next > target)) {
                next = target;
                nextVel = 0;
            }
            return { value: next, vel: nextVel };
        }

        function applyMapGrid() {
            if (!mapGrid) return;
            const x = orbit.gridShiftX + 'px';
            const y = orbit.gridShiftY + 'px';
            const z = String(orbit.zoom);
            if (orbit._gx === x && orbit._gy === y && orbit._gz === z) return;
            orbit._gx = x;
            orbit._gy = y;
            orbit._gz = z;
            mapGrid.style.setProperty('--grid-x', x);
            mapGrid.style.setProperty('--grid-y', y);
            mapGrid.style.setProperty('--grid-z', z);
        }

        function setGridSpot() {}

        function orbitBoxOverlap(a, b, gap) {
            const aw = a.sw || a.w || 0;
            const ah = a.sh || a.h || 0;
            const bw = b.sw || b.w || 0;
            const bh = b.sh || b.h || 0;
            const ox = (aw + bw) / 2 + gap - Math.abs(a.tx - b.tx);
            const oy = (ah + bh) / 2 + gap - Math.abs(a.ty - b.ty);
            if (ox <= 0 || oy <= 0) return null;
            return { ox: ox, oy: oy };
        }

        function projectOrbitTarget(item, hx, hy, zoom) {
            const rx = item.dispRx == null ? item.rx : item.dispRx;
            const ry = item.dispRy == null ? item.ry : item.dispRy;
            const z = Math.max(zoom, 0.01);
            const dx = (item.tx - hx) / z;
            const dy = (item.ty - hy) / z;
            const t = Math.atan2(dy / Math.max(ry, 1e-6), dx / Math.max(rx, 1e-6));
            item.tx = hx + Math.cos(t) * rx * z;
            item.ty = hy + Math.sin(t) * ry * z;
        }

        function keepOrbitBoxesClear(hx, hy, zoom, nodeGrab, dt) {
            if (!orbitItems.length) return;
            const gap = 6 * Math.max(zoom, 0.35);
            const maxLift = 56;
            const step = Math.min(Math.max(dt || 16, 8), 40);
            const dragging = !!nodeGrab;
            const k = (reduceMotion ? 0.55 : (1 - Math.exp(-step / (dragging ? 1800 : 1280)))) * (dragging ? 0.28 : 1);

            function fieldHash(item) {
                const text = String((item.node && item.node.dataset.field) || '');
                let h = 2166136261;
                for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
                return (h >>> 0) / 4294967296;
            }

            orbitItems.forEach((item) => {
                if (item.dispRx == null || !Number.isFinite(item.dispRx)) item.dispRx = item.rx;
                if (item.dispRy == null || !Number.isFinite(item.dispRy)) item.dispRy = item.ry;
                item.sw = item.w * zoom;
                item.sh = item.h * zoom;
                if (item === nodeGrab) {
                    item.tx = item.x;
                    item.ty = item.y;
                    return;
                }
                const ang = item.angle + orbit.spin;
                item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
            });

            let deepest = 0;
            for (let i = 0; i < orbitItems.length; i++) {
                for (let j = i + 1; j < orbitItems.length; j++) {
                    const a = orbitItems[i];
                    const b = orbitItems[j];
                    const hit = orbitBoxOverlap(a, b, gap);
                    if (!hit) continue;
                    const depth = Math.min(hit.ox, hit.oy);
                    deepest = Math.max(deepest, depth);

                    const grabA = a === nodeGrab;
                    const grabB = b === nodeGrab;
                    let wA = grabA ? 0 : 0.5;
                    let wB = grabB ? 0 : 0.5;
                    if (a.parentId && !b.parentId && !grabB) {
                        wA = 0.8;
                        wB = 0.2;
                    } else if (b.parentId && !a.parentId && !grabA) {
                        wA = 0.2;
                        wB = 0.8;
                    }
                    if (wA + wB === 0) continue;
                    const sum = wA + wB;
                    wA /= sum;
                    wB /= sum;

                    function ringAmt(item) {
                        const home = Math.max(item.tRx == null ? item.rx : item.tRx, 1);
                        const cur = Math.max(item.dispRx || 0, item.rx || 0);
                        return Math.min(1, Math.max(0, (cur / home - 0.5) / 0.45));
                    }
                    const arrived = Math.min(ringAmt(a), ringAmt(b));
                    if (arrived < 0.08) continue;

                    let sep = shortestAngle(a.angle, b.angle);
                    if (Math.abs(sep) < 0.025) {
                        sep = (fieldHash(a) >= 0.5 ? 1 : -1) * 0.08;
                    }
                    const dir = sep >= 0 ? 1 : -1;
                    const spA = Math.max(Math.hypot((a.dispRx || a.rx) * Math.sin(a.angle), (a.dispRy || a.ry) * Math.cos(a.angle)), 16);
                    const spB = Math.max(Math.hypot((b.dispRx || b.rx) * Math.sin(b.angle), (b.dispRy || b.ry) * Math.cos(b.angle)), 16);
                    const speed = Math.max((spA + spB) / 2, 18);
                    const push = Math.min(dragging ? 0.012 : 0.08, ((depth + 10) / speed) * k * arrived);

                    function shear(item, sign, weight) {
                        if (!item || item === nodeGrab || weight <= 0) return;
                        const delta = sign * push * weight;
                        item.angle += delta;
                        // While dragging, only yield live position so neighbors ease back home.
                        if (!dragging && item.tAngle != null) item.tAngle += delta;
                    }
                    shear(a, -dir, wA);
                    shear(b, dir, wB);

                    const related = (a.parentId && a.parentId === b.node.dataset.field)
                        || (b.parentId && b.parentId === a.node.dataset.field)
                        || (a.parentId && a.parentId === b.parentId);
                    if (depth > 16 || related) {
                        const lift = grabA ? b : (grabB ? a : (related
                            ? (a.parentId ? a : b)
                            : (a.dispRx <= b.dispRx ? a : b)));
                        if (lift && lift !== nodeGrab) {
                            const home = Math.max(lift.rx || 0, 1);
                            const room = Math.max(0, home + maxLift - lift.dispRx);
                            const extra = Math.min(room, depth * k * arrived * (dragging ? 0.03 : (related ? 0.22 : 0.1)));
                            if (extra > 0.04) {
                                lift.dispRx += extra;
                                lift.dispRy = Math.max(lift.dispRy, lift.dispRx * ((lift.ry || home) / home));
                                if (!dragging) {
                                    if (lift.tRx != null) lift.tRx = Math.min(lift.tRx + extra * 0.28, home + maxLift);
                                    if (lift.tRy != null) lift.tRy = Math.max(lift.tRy, lift.tRx * ((lift.ry || home) / home));
                                }
                            }
                        }
                    }

                    function ontoOval(item) {
                        if (!item || item === nodeGrab) return;
                        const ang = item.angle + orbit.spin;
                        item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                        item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
                    }
                    ontoOval(a);
                    ontoOval(b);
                }
            }

            const homePull = deepest < 4 ? 0.1 : (deepest < 12 ? 0.03 : 0.008);
            orbitItems.forEach((item) => {
                if (item === nodeGrab) return;
                const homeRx = item.rx;
                const homeRy = item.ry;
                item.dispRx = Math.min(item.dispRx, homeRx + maxLift);
                item.dispRy = Math.min(item.dispRy, Math.max(homeRy, item.dispRx * (homeRy / Math.max(homeRx, 1))));
                item.dispRx += (homeRx - item.dispRx) * homePull;
                item.dispRy += (homeRy - item.dispRy) * homePull;
                const ang = item.angle + orbit.spin;
                item.tx = hx + Math.cos(ang) * item.dispRx * zoom;
                item.ty = hy + Math.sin(ang) * item.dispRy * zoom;
            });
        }

        function applyOrbit(dt) {
            applyMapGrid();
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height) return;

            const viewPan = (orbit.dragging && orbit.dragMode === 'pan')
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingField = orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'peer');
            if (!viewPan && !holdingField && !orbit.userZoomed && !orbit.freeCam && ((!orbit.zoomBusy && orbit.zoomWorldX == null) || orbit.dragging)) keepHubOnScreen(width, height);

            const zoom = orbit.zoom;
            const zoomJump = Math.abs((orbit.prevZoom == null ? zoom : orbit.prevZoom) - zoom) > 0.00001;
            orbit.prevZoom = zoom;
            const cx = width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = height / 2 + orbit.dragY + orbit.parallaxY;
            if (orbit.hubPx == null) {
                orbit.hubPx = cx;
                orbit.hubPy = cy;
            }
            const hvx = cx - orbit.hubPx;
            const hvy = cy - orbit.hubPy;
            orbit.hubPx = cx;
            orbit.hubPy = cy;

            const nodeGrab = orbit.dragging && orbit.dragMode === 'node' ? orbit.dragItem : null;
            const peerGrab = orbit.dragging && orbit.dragMode === 'peer' ? orbit.dragItem : null;
            const hubGrab = orbit.dragging && orbit.dragMode === 'hub';
            const panning = orbit.dragging && orbit.dragMode === 'pan';
            const coasting = !orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12;
            const rigidView = panning || coasting || orbit.zoomBusy || zoomJump;
            const byId = new Map(orbitItems.map((item) => [item.node.dataset.field, item]));
            const step = Math.min(Math.max(dt || 16, 8), 32) / 16.67;

            if (orbit.hubLiveX == null || !Number.isFinite(orbit.hubLiveX)) {
                orbit.hubLiveX = cx;
                orbit.hubLiveY = cy;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
            }
            if (hubGrab || nodeGrab || rigidView || reduceMotion || orbit.snapLayout) {
                orbit.hubLiveX = cx;
                orbit.hubLiveY = cy;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
            } else {
                let ax = (cx - orbit.hubLiveX) * 0.2;
                let ay = (cy - orbit.hubLiveY) * 0.2;
                if (nodeGrab && nodeGrab.x != null) {
                    const restLen = Math.max(Math.hypot(
                        Math.cos((nodeGrab.tAngle == null ? nodeGrab.angle : nodeGrab.tAngle) + orbit.spin) * (nodeGrab.tRx == null ? nodeGrab.rx : nodeGrab.tRx) * zoom,
                        Math.sin((nodeGrab.tAngle == null ? nodeGrab.angle : nodeGrab.tAngle) + orbit.spin) * (nodeGrab.tRy == null ? nodeGrab.ry : nodeGrab.tRy) * zoom
                    ), 28);
                    const dx = nodeGrab.x - orbit.hubLiveX;
                    const dy = nodeGrab.y - orbit.hubLiveY;
                    const cur = Math.hypot(dx, dy) || 1;
                    const stretch = cur - restLen;
                    if (stretch > 14) {
                        const pull = (stretch - 14) * 0.016;
                        ax += (dx / cur) * pull;
                        ay += (dy / cur) * pull;
                    }
                    ax += (orbit.grabVX || 0) * 0.004;
                    ay += (orbit.grabVY || 0) * 0.004;
                }
                if (peerGrab && peerGrab.x != null) {
                    const restLen = Math.max(Math.hypot((peerGrab.tx || 0) - cx, (peerGrab.ty || 0) - cy), 48);
                    const dx = peerGrab.x - orbit.hubLiveX;
                    const dy = peerGrab.y - orbit.hubLiveY;
                    const cur = Math.hypot(dx, dy) || 1;
                    const stretch = cur - restLen;
                    if (stretch > 8) {
                        const pull = (stretch - 8) * 0.045;
                        ax += (dx / cur) * pull;
                        ay += (dy / cur) * pull;
                    }
                    ax += (orbit.grabVX || 0) * 0.014;
                    ay += (orbit.grabVY || 0) * 0.014;
                }
                orbit.hubLiveVX = (orbit.hubLiveVX || 0) + ax * step;
                orbit.hubLiveVY = (orbit.hubLiveVY || 0) + ay * step;
                orbit.hubLiveVX *= Math.pow(0.8, step);
                orbit.hubLiveVY *= Math.pow(0.8, step);
                orbit.hubLiveX += orbit.hubLiveVX * step;
                orbit.hubLiveY += orbit.hubLiveVY * step;
                const ndx = orbit.hubLiveX - cx;
                const ndy = orbit.hubLiveY - cy;
                const nlen = Math.hypot(ndx, ndy);
                const maxNudge = nodeGrab ? 22 : 40;
                if (nlen > maxNudge) {
                    orbit.hubLiveX = cx + ndx / nlen * maxNudge;
                    orbit.hubLiveY = cy + ndy / nlen * maxNudge;
                    orbit.hubLiveVX *= 0.4;
                    orbit.hubLiveVY *= 0.4;
                }
                if (!nodeGrab && !peerGrab && nlen < 0.35 && Math.hypot(orbit.hubLiveVX, orbit.hubLiveVY) < 0.2) {
                    orbit.hubLiveX = cx;
                    orbit.hubLiveY = cy;
                    orbit.hubLiveVX = 0;
                    orbit.hubLiveVY = 0;
                }
            }
            const hx = orbit.hubLiveX;
            const hy = orbit.hubLiveY;

            if (hub) {
                const hubTf = hx.toFixed(1) + ',' + hy.toFixed(1) + ',' + zoom;
                if (orbit._hubTf !== hubTf) {
                    orbit._hubTf = hubTf;
                    hub.style.left = hx + 'px';
                    hub.style.top = hy + 'px';
                    hub.style.transform = 'translate(-50%, -50%) translateZ(0) scale(' + zoom + ')';
                }
            }

            if (nodeGrab) {
                nodeGrab.x = orbit.grabX;
                nodeGrab.y = orbit.grabY;
                nodeGrab.vx = 0;
                nodeGrab.vy = 0;
                nodeGrab.bloomWait = 0;
                const liveDx = nodeGrab.x - hx;
                const liveDy = nodeGrab.y - hy;
                nodeGrab.angle = Math.atan2(liveDy, liveDx) - orbit.spin;
                const liveR = Math.hypot(liveDx, liveDy) / Math.max(zoom, 0.01);
                nodeGrab.rx = liveR;
                nodeGrab.ry = liveR;
                nodeGrab.dispRx = liveR;
                nodeGrab.dispRy = liveR;
            }

            const settle = reduceMotion || orbit.snapLayout ? 1 : 1 - Math.exp(-(dt || 16) / 720);
            const settleHome = reduceMotion || orbit.snapLayout ? 1 : 1 - Math.exp(-(dt || 16) / 2600);
            orbitItems.forEach((item) => {
                if (item === nodeGrab) {
                    item.bloomWait = 0;
                    return;
                }
                if (item.bloomWait > 0) item.bloomWait = Math.max(0, item.bloomWait - (dt || 16));
            });
            orbitItems.forEach((item) => {
                if (item.parentId || item === nodeGrab) return;
                if (item.bloomWait > 0) return;
                const rate = item.comingHome ? settleHome : settle;
                item.angle += shortestAngle(item.angle, item.tAngle == null ? item.angle : item.tAngle) * rate;
                item.rx += ((item.tRx == null ? item.rx : item.tRx) - item.rx) * rate;
                item.ry += ((item.tRy == null ? item.ry : item.tRy) - item.ry) * rate;
                if (item.comingHome) {
                    const homeRx = item.tRx == null ? item.rx : item.tRx;
                    const homeRy = item.tRy == null ? item.ry : item.tRy;
                    const angErr = Math.abs(shortestAngle(item.angle, item.tAngle == null ? item.angle : item.tAngle));
                    if (angErr < 0.01 && Math.abs(item.rx - homeRx) < 0.8 && Math.abs(item.ry - homeRy) < 0.8) {
                        item.angle = item.tAngle == null ? item.angle : item.tAngle;
                        item.rx = homeRx;
                        item.ry = homeRy;
                        item.comingHome = false;
                    }
                }
            });

            const kidsByParent = {};
            orbitItems.forEach((item) => {
                if (!item.parentId) return;
                if (!kidsByParent[item.parentId]) kidsByParent[item.parentId] = [];
                kidsByParent[item.parentId].push(item);
            });
            function deriveKids(pid) {
                const parent = byId.get(pid);
                const list = kidsByParent[pid];
                if (!parent || !list) return;
                const pAngle = parent.tAngle == null ? parent.angle : parent.tAngle;
                const pRx = parent.tRx == null ? parent.rx : parent.tRx;
                const pRy = parent.tRy == null ? parent.ry : parent.tRy;
                const grow = pRx > 1 ? Math.max(0, Math.min(1, parent.rx / pRx)) : 1;
                list.forEach((child) => {
                    const fan = (child.tAngle == null ? child.angle : child.tAngle) - pAngle;
                    const wantAngle = parent.angle + fan;
                    const wantRx = parent.rx + ((child.tRx == null ? child.rx : child.tRx) - pRx) * grow;
                    const wantRy = parent.ry + ((child.tRy == null ? child.ry : child.tRy) - pRy) * grow;
                    if (child !== nodeGrab) {
                        if (child.comingHome) {
                            child.angle += shortestAngle(child.angle, wantAngle) * settleHome;
                            child.rx += (wantRx - child.rx) * settleHome;
                            child.ry += (wantRy - child.ry) * settleHome;
                            const angErr = Math.abs(shortestAngle(child.angle, wantAngle));
                            if (angErr < 0.01 && Math.abs(child.rx - wantRx) < 0.8 && Math.abs(child.ry - wantRy) < 0.8) {
                                child.angle = wantAngle;
                                child.rx = wantRx;
                                child.ry = wantRy;
                                child.comingHome = false;
                            }
                        } else {
                            child.angle = wantAngle;
                            child.rx = wantRx;
                            child.ry = wantRy;
                        }
                    }
                    deriveKids(child.node.dataset.field);
                });
            }
            orbitItems.forEach((item) => {
                if (!item.parentId) deriveKids(item.node.dataset.field);
            });

            const blooming = !nodeGrab && !hubGrab && !panning && orbitItems.some((item) => {
                const home = item.tRx == null ? item.rx : item.tRx;
                return Math.abs((item.rx || 0) - home) > 10;
            });
            const homing = orbitItems.some((item) => item.comingHome);
            if (nodeGrab || hubGrab || panning || blooming || homing) {
                orbitItems.forEach((item) => {
                    item.sw = item.w * zoom;
                    item.sh = item.h * zoom;
                    if (item === nodeGrab) {
                        item.tx = item.x;
                        item.ty = item.y;
                        return;
                    }
                    item.dispRx = item.rx;
                    item.dispRy = item.ry;
                    const ang = item.angle + orbit.spin;
                    item.tx = hx + Math.cos(ang) * item.rx * zoom;
                    item.ty = hy + Math.sin(ang) * item.ry * zoom;
                });
            } else {
                keepOrbitBoxesClear(hx, hy, zoom, nodeGrab, dt);
            }

            orbitItems.forEach((item) => {
                if (item === nodeGrab) return;
                const ang = item.angle + orbit.spin;
                const rx = item.dispRx == null ? item.rx : item.dispRx;
                const ry = item.dispRy == null ? item.ry : item.dispRy;
                item.sw = item.w * zoom;
                item.sh = item.h * zoom;
                item.tx = hx + Math.cos(ang) * rx * zoom;
                item.ty = hy + Math.sin(ang) * ry * zoom;
                item.x = item.tx;
                item.y = item.ty;
                item.vx = 0;
                item.vy = 0;
                item.sxv = 0;
                item.syv = 0;
            });

            orbitItems.forEach((item) => {
                const next = 'translate3d(' + (item.x - item.w / 2) + 'px,' + (item.y - item.h / 2) + 'px,0) scale(' + zoom + ')';
                if (item._tf === next) return;
                item._tf = next;
                item.node.style.left = '0px';
                item.node.style.top = '0px';
                item.node.style.transform = next;
            });
            orbitItems.forEach((item) => {
                const parent = item.parentId && byId.get(item.parentId);
                const x1 = parent ? parent.x : hx;
                const y1 = parent ? parent.y : hy;
                if (item._lx !== x1 || item._ly !== y1 || item._lx2 !== item.x || item._ly2 !== item.y) {
                    item._lx = x1;
                    item._ly = y1;
                    item._lx2 = item.x;
                    item._ly2 = item.y;
                    item.line.setAttribute('x1', x1);
                    item.line.setAttribute('y1', y1);
                    item.line.setAttribute('x2', item.x);
                    item.line.setAttribute('y2', item.y);
                }
                if (item.bloomWait > 0) item.line.setAttribute('opacity', '0');
                else item.line.removeAttribute('opacity');
                if (nodeGrab || hubGrab || panning) return;
                const rest = Math.max(Math.hypot(item.tx - (parent ? parent.tx : hx), item.ty - (parent ? parent.ty : hy)), 8);
                const stretch = Math.hypot(item.x - x1, item.y - y1) / rest;
                item.line.setAttribute('stroke-linecap', 'round');
                if (parent) {
                    item.line.setAttribute('stroke', orbitSpokeStroke(item.node, true));
                    item.line.setAttribute('stroke-width', stretch > 1.08 ? '2' : '1.5');
                } else {
                    item.line.setAttribute('stroke', orbitSpokeStroke(item.node, false));
                    item.line.setAttribute('stroke-width', stretch > 1.12 ? '1.35' : '1');
                }
            });
            if (document.getElementById('platformMenu') && !document.getElementById('platformMenu').hidden) {
                placePlatformMenu();
                placeTimezoneMenu();
            } else if (document.querySelector('.node.menu-open')) {
                placeTimezoneMenu();
            }
            const searchNode = document.querySelector('.node.search-open');
            if (searchNode) placeSearchMenu(searchNode);
            applyPeerPhysics(dt, hx, hy, zoom, step, rigidView, false, nodeGrab, hubGrab, peerGrab, hvx, hvy);
        }

        function positionNodes() {
            computeLayout();
        }

        function serializeProfile() {
            return FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return platform ? platform.label + ' ' + item.value : item.value;
                }).join(', ');
                return values ? field.label + ': ' + values : '';
            }).filter(Boolean).join('\n') || 'No facts yet.';
        }

        function caseText() {
            return '# OSINT Subject Profile\n\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\n## Analyst notes\n\n' + profile.analysis : '');
        }

        function casePlainText() {
            return 'OrbINT target\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\nNotes\n' + profile.analysis : '');
        }

        function caseHtml() {
            const subject = firstValue('name') || 'Anonymous';
            const rows = FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return escapeHtml(platform ? platform.label + ' ' + item.value : item.value);
                }).join(', ');
                if (!values) return '';
                return '<tr><th>' + escapeHtml(field.label) + '</th><td>' + values + '</td></tr>';
            }).filter(Boolean).join('');
            return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' +
                escapeHtml(subject) + ' — OrbINT</title><style>' +
                'body{font:16px/1.5 Segoe UI,sans-serif;background:#09090b;color:#fafafa;padding:32px;}' +
                'h1{font-size:28px;margin:0 0 8px;}p{color:#a1a1aa;margin:0 0 24px;}' +
                'table{width:100%;border-collapse:collapse;}th,td{padding:8px 0;border-bottom:1px solid #27272a;text-align:left;vertical-align:top;}' +
                'th{width:140px;color:#a1a1aa;font-weight:500;}pre{white-space:pre-wrap;}</style></head><body>' +
                '<h1>' + escapeHtml(subject) + '</h1>' +
                '<p>Updated ' + escapeHtml(new Date().toLocaleString()) + '</p>' +
                (rows ? '<table>' + rows + '</table>' : '<p>No facts yet.</p>') +
                (profile.analysis ? '<h2>Notes</h2><pre>' + escapeHtml(profile.analysis) + '</pre>' : '') +
                '</body></html>';
        }

        function downloadBlob(name, type, text) {
            const blob = new Blob([text], { type: type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        function caseFileName(ext) {
            const name = (firstValue('name') || 'case').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            return 'orbint-' + (name || 'case') + '.' + ext;
        }

        function closeExportMenu() {
            const menu = document.getElementById('exportMenu');
            if (menu) menu.hidden = true;
            document.getElementById('dock').classList.remove('picking-export');
        }

        function siteShareUrl() {
            const href = String((window.location && window.location.href) || '').split('#')[0];
            if (/^https?:\/\//i.test(href) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(href)) {
                return href.replace(/\/index\.html$/i, '/');
            }
            return 'https://delexoo.github.io/OrbINT/';
        }

        const QR_EXP = new Uint8Array(512);
        const QR_LOG = new Uint8Array(256);
        (function () {
            let x = 1;
            for (let i = 0; i < 255; i++) {
                QR_EXP[i] = x;
                QR_LOG[x] = i;
                x <<= 1;
                if (x & 256) x ^= 0x11d;
            }
            for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
        })();

        function qrMul(a, b) {
            return a && b ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0;
        }

        const QR_M = {
            1: { ec: 10, g1: [1, 16], g2: [0, 0] },
            2: { ec: 16, g1: [1, 28], g2: [0, 0] },
            3: { ec: 26, g1: [1, 44], g2: [0, 0] },
            4: { ec: 18, g1: [2, 32], g2: [0, 0] },
            5: { ec: 24, g1: [2, 43], g2: [0, 0] },
            6: { ec: 16, g1: [4, 27], g2: [0, 0] },
            7: { ec: 18, g1: [4, 31], g2: [0, 0] },
            8: { ec: 22, g1: [2, 38], g2: [2, 39] },
            9: { ec: 22, g1: [3, 36], g2: [2, 37] },
            10: { ec: 26, g1: [4, 43], g2: [1, 44] }
        };
        const QR_ALIGN = { 1: [], 2: [18], 3: [22], 4: [26], 5: [30], 6: [34], 7: [22, 38], 8: [24, 42], 9: [26, 46], 10: [28, 50] };
        const QR_REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
        const QR_VERSION_BITS = { 7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3 };

        function qrPolyMul(a, b) {
            const out = new Array(a.length + b.length - 1).fill(0);
            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) out[i + j] ^= qrMul(a[i], b[j]);
            }
            return out;
        }

        function qrRsEncode(data, ec) {
            let gen = [1];
            for (let i = 0; i < ec; i++) gen = qrPolyMul(gen, [1, QR_EXP[i]]);
            const rest = data.concat(new Array(ec).fill(0));
            for (let i = 0; i < data.length; i++) {
                const coef = rest[i];
                if (!coef) continue;
                for (let j = 0; j < gen.length; j++) rest[i + j] ^= qrMul(gen[j], coef);
            }
            return rest.slice(data.length);
        }

        function qrBitsToBytes(bits) {
            const bytes = [];
            for (let i = 0; i < bits.length; i += 8) {
                let v = 0;
                for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i + j] || 0);
                bytes.push(v);
            }
            return bytes;
        }

        function qrEncode(text) {
            const bytes = Array.from(new TextEncoder().encode(text));
            let version = 0;
            for (let v = 1; v <= 10; v++) {
                const spec = QR_M[v];
                const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
                const need = 4 + (v >= 10 ? 16 : 8) + bytes.length * 8 + 4;
                if (need <= dataCw * 8) { version = v; break; }
            }
            if (!version) return null;
            const spec = QR_M[version];
            const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
            const bits = [];
            const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
            put(0b0100, 4);
            put(bytes.length, version >= 10 ? 16 : 8);
            bytes.forEach((b) => put(b, 8));
            const maxBits = dataCw * 8;
            put(0, Math.min(4, maxBits - bits.length));
            while (bits.length % 8) bits.push(0);
            const pad = [0xEC, 0x11];
            let pi = 0;
            while (bits.length + 8 <= maxBits) {
                put(pad[pi % 2], 8);
                pi++;
            }
            const codewords = qrBitsToBytes(bits);
            while (codewords.length < dataCw) codewords.push(0);
            codewords.length = dataCw;
            const blocks = [];
            let offset = 0;
            const groups = [spec.g1, spec.g2];
            groups.forEach((g) => {
                for (let i = 0; i < g[0]; i++) {
                    const d = codewords.slice(offset, offset + g[1]);
                    offset += g[1];
                    blocks.push({ d: d, e: qrRsEncode(d, spec.ec) });
                }
            });
            const interleaved = [];
            const maxD = Math.max(spec.g1[1], spec.g2[1]);
            for (let i = 0; i < maxD; i++) {
                blocks.forEach((b) => { if (i < b.d.length) interleaved.push(b.d[i]); });
            }
            for (let i = 0; i < spec.ec; i++) {
                blocks.forEach((b) => interleaved.push(b.e[i]));
            }
            const outBits = [];
            interleaved.forEach((b) => { for (let i = 7; i >= 0; i--) outBits.push((b >> i) & 1); });
            for (let i = 0; i < QR_REMAINDER[version]; i++) outBits.push(0);
            return { version: version, bits: outBits };
        }

        function qrFillFinder(grid, reserved, r, c) {
            for (let y = -1; y <= 7; y++) {
                for (let x = -1; x <= 7; x++) {
                    const rr = r + y;
                    const cc = c + x;
                    if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid.length) continue;
                    const dark = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
                    grid[rr][cc] = dark ? 1 : 0;
                    reserved[rr][cc] = 1;
                }
            }
        }

        function qrFillAlign(grid, reserved, cy, cx) {
            for (let y = -2; y <= 2; y++) {
                for (let x = -2; x <= 2; x++) {
                    const ring = Math.max(Math.abs(x), Math.abs(y));
                    grid[cy + y][cx + x] = (ring === 0 || ring === 2) ? 1 : 0;
                    reserved[cy + y][cx + x] = 1;
                }
            }
        }

        function qrFormatBits(mask) {
            const data = mask & 7;
            let rem = data;
            for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
            return ((data << 10) | rem) ^ 0x5412;
        }

        function qrSetFormat(grid, reserved, bits, size) {
            const set = (x, y, i) => {
                grid[y][x] = (bits >> i) & 1;
                reserved[y][x] = 1;
            };
            for (let i = 0; i <= 5; i++) set(8, i, i);
            set(8, 7, 6);
            set(8, 8, 7);
            set(7, 8, 8);
            for (let i = 9; i < 15; i++) set(14 - i, 8, i);
            for (let i = 0; i < 8; i++) set(size - 1 - i, 8, i);
            for (let i = 8; i < 15; i++) set(8, size - 15 + i, i);
            grid[size - 8][8] = 1;
            reserved[size - 8][8] = 1;
        }

        function qrMaskBit(mask, r, c) {
            if (mask === 0) return ((r + c) & 1) === 0;
            if (mask === 1) return (r & 1) === 0;
            if (mask === 2) return c % 3 === 0;
            if (mask === 3) return (r + c) % 3 === 0;
            if (mask === 4) return (((r >> 1) + Math.floor(c / 3)) & 1) === 0;
            if (mask === 5) return (r * c) % 2 + (r * c) % 3 === 0;
            if (mask === 6) return (((r * c) % 2 + (r * c) % 3) & 1) === 0;
            return (((r + c) % 2 + (r * c) % 3) & 1) === 0;
        }

        function qrPenalty(grid) {
            const size = grid.length;
            let score = 0;
            for (let r = 0; r < size; r++) {
                let run = 1;
                for (let c = 1; c <= size; c++) {
                    if (c < size && grid[r][c] === grid[r][c - 1]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let c = 0; c < size; c++) {
                let run = 1;
                for (let r = 1; r <= size; r++) {
                    if (r < size && grid[r][c] === grid[r - 1][c]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let r = 0; r < size - 1; r++) {
                for (let c = 0; c < size - 1; c++) {
                    const v = grid[r][c];
                    if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
                }
            }
            const pattern = function (line) {
                let s = 0;
                const str = line.join('');
                let i = 0;
                while ((i = str.indexOf('10111010000', i)) >= 0) { s += 40; i++; }
                i = 0;
                while ((i = str.indexOf('00001011101', i)) >= 0) { s += 40; i++; }
                return s;
            };
            for (let r = 0; r < size; r++) score += pattern(grid[r]);
            for (let c = 0; c < size; c++) {
                const col = [];
                for (let r = 0; r < size; r++) col.push(grid[r][c]);
                score += pattern(col);
            }
            let dark = 0;
            grid.forEach((row) => row.forEach((v) => { dark += v; }));
            score += Math.abs(Math.floor(dark * 100 / (size * size) / 5) - 10) * 10;
            return score;
        }

        function qrMatrix(text) {
            const encoded = qrEncode(text);
            if (!encoded) return null;
            const size = 21 + 4 * (encoded.version - 1);
            const base = Array.from({ length: size }, () => new Array(size).fill(0));
            const reserved = Array.from({ length: size }, () => new Array(size).fill(0));
            qrFillFinder(base, reserved, 0, 0);
            qrFillFinder(base, reserved, 0, size - 7);
            qrFillFinder(base, reserved, size - 7, 0);
            const pos = [6].concat(QR_ALIGN[encoded.version]);
            pos.forEach((r) => {
                pos.forEach((c) => {
                    if ((r < 9 && c < 9) || (r < 9 && c > size - 10) || (r > size - 10 && c < 9)) return;
                    qrFillAlign(base, reserved, r, c);
                });
            });
            for (let i = 8; i < size - 8; i++) {
                base[6][i] = 1 - (i & 1);
                base[i][6] = 1 - (i & 1);
                reserved[6][i] = 1;
                reserved[i][6] = 1;
            }
            reserved[size - 8][8] = 1;
            base[size - 8][8] = 1;
            if (encoded.version >= 7) {
                const vb = QR_VERSION_BITS[encoded.version];
                let k = 0;
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 3; j++) {
                        const bit = (vb >> k) & 1;
                        base[size - 11 + j][i] = bit;
                        base[i][size - 11 + j] = bit;
                        reserved[size - 11 + j][i] = 1;
                        reserved[i][size - 11 + j] = 1;
                        k++;
                    }
                }
            }
            for (let i = 0; i < 9; i++) {
                if (i !== 6) { reserved[8][i] = 1; reserved[i][8] = 1; }
            }
            reserved[8][7] = 1;
            reserved[7][8] = 1;
            reserved[8][8] = 1;
            for (let i = 0; i < 8; i++) reserved[size - 1 - i][8] = 1;
            for (let i = 0; i < 8; i++) reserved[8][size - 1 - i] = 1;

            let best = null;
            let bestScore = Infinity;
            for (let mask = 0; mask < 8; mask++) {
                const grid = base.map((row) => row.slice());
                const rec = reserved.map((row) => row.slice());
                let bit = 0;
                let upward = true;
                for (let col = size - 1; col > 0; col -= 2) {
                    if (col === 6) col--;
                    for (let i = 0; i < size; i++) {
                        const row = upward ? size - 1 - i : i;
                        for (let dc = 0; dc < 2; dc++) {
                            const c = col - dc;
                            if (rec[row][c]) continue;
                            const v = encoded.bits[bit] || 0;
                            grid[row][c] = v ^ (qrMaskBit(mask, row, c) ? 1 : 0);
                            bit++;
                        }
                    }
                    upward = !upward;
                }
                qrSetFormat(grid, rec, qrFormatBits(mask), size);
                const score = qrPenalty(grid);
                if (score < bestScore) {
                    bestScore = score;
                    best = grid;
                }
            }
            return best;
        }

        function drawShareQr(text) {
            const canvas = document.getElementById('shareQr');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const matrix = qrMatrix(text);
            const cssTarget = 232;
            if (!matrix) {
                canvas.width = cssTarget;
                canvas.height = cssTarget;
                canvas.style.width = cssTarget + 'px';
                canvas.style.height = 'auto';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, cssTarget, cssTarget);
                return;
            }
            const quiet = 4;
            const dim = matrix.length + quiet * 2;
            const moduleCss = Math.max(5, Math.round(cssTarget / dim));
            const css = dim * moduleCss;
            const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
            const module = moduleCss * dpr;
            const px = dim * module;
            canvas.width = px;
            canvas.height = px;
            canvas.style.width = css + 'px';
            canvas.style.height = 'auto';
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, px, px);
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            for (let r = 0; r < matrix.length; r++) {
                for (let c = 0; c < matrix[r].length; c++) {
                    if (!matrix[r][c]) continue;
                    ctx.rect((c + quiet) * module, (r + quiet) * module, module, module);
                }
            }
            ctx.fill();
        }

        function closeShare() {
            const sheet = document.getElementById('shareSheet');
            hideSheet(sheet);
            const dock = document.getElementById('dock');
            if (dock) dock.classList.remove('picking-share');
        }

        function openShare() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeHelp();
            closeInstall();
            closeAddField();
            closeToolkit();
            const sheet = document.getElementById('shareSheet');
            const urlEl = document.getElementById('shareUrl');
            const copyBtn = document.getElementById('shareCopy');
            if (!sheet) return;
            const url = siteShareUrl();
            if (urlEl) {
                urlEl.textContent = url;
                urlEl.title = url;
            }
            if (copyBtn) copyBtn.textContent = 'Copy';
            const nativeBtn = document.getElementById('shareNative');
            if (nativeBtn) nativeBtn.hidden = !navigator.share;
            if (window.OrbINTShare && typeof OrbINTShare.paint === 'function') OrbINTShare.paint();
            const viewEl = document.getElementById('shareViewUrl');
            const sessionUrl = viewEl && /^https?:/i.test(String(viewEl.textContent || '').trim())
                ? String(viewEl.textContent).trim()
                : url;
            drawShareQr(sessionUrl);
            showSheet(sheet);
            document.getElementById('dock').classList.add('picking-share');
        }

        let deferredInstallPrompt = null;

        function isAppInstalled() {
            if (window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches) return true;
            if (window.navigator.standalone) return true;
            return false;
        }

        function installDevice() {
            const ua = navigator.userAgent || '';
            const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const android = /Android/.test(ua);
            const mac = /Mac OS X|Macintosh/.test(ua) && !iOS;
            const win = /Windows/.test(ua);
            const chrome = /Chrome|CriOS|Edg|EdgiOS|OPR|Brave/i.test(ua) && !/iPhone|iPad|iPod/.test(ua);
            const safari = /Safari/.test(ua) && !/Chrome|CriOS|Android|Edg|OPR|Firefox/i.test(ua);
            return { iOS: iOS, android: android, mac: mac, win: win, chrome: chrome, safari: safari };
        }

        function installStepsHtml() {
            const d = installDevice();
            let steps = [];
            if (d.iOS) {
                steps = [
                    'Tap the Share button in Safari.',
                    'Scroll and tap Add to Home Screen.',
                    'Tap Add. OrbINT appears on your home screen.'
                ];
            } else if (d.android) {
                steps = [
                    'Tap Install in this window, or open the browser menu.',
                    'Choose Install app or Add to Home screen.',
                    'Confirm. OrbINT opens from your app drawer.'
                ];
            } else if (d.mac && d.safari) {
                steps = [
                    'Open the File menu in Safari, or the Share button.',
                    'Choose Add to Dock.',
                    'OrbINT stays in the Dock and Launchpad like any Mac app.'
                ];
            } else if (d.win || d.mac || d.chrome) {
                steps = [
                    'Click Install in this window, or the install icon in the address bar.',
                    'Confirm the prompt.',
                    'OrbINT opens in its own window from the Start menu, Dock, or desktop.'
                ];
            } else {
                steps = [
                    'Open this site in Chrome, Edge, or Safari.',
                    'Use Install in this window, or Add to Home Screen / Add to Dock from the browser menu.',
                    'OrbINT then launches like an app on this device.'
                ];
            }
            return steps.map(function (text, i) {
                return '<li><b>' + (i + 1) + '</b><span>' + text + '</span></li>';
            }).join('');
        }

        function fillInstallSheet() {
            const installed = isAppInstalled();
            const canPrompt = !!deferredInstallPrompt;
            const kicker = document.getElementById('installKicker');
            const title = document.getElementById('installTitle');
            const lead = document.getElementById('installLead');
            const steps = document.getElementById('installSteps');
            const go = document.getElementById('installGo');
            const dismiss = document.getElementById('installDismiss');
            if (kicker) kicker.textContent = installed ? 'This device' : 'Home screen';
            if (title) title.textContent = installed ? 'Already installed' : 'Install OrbINT';
            if (lead) {
                lead.textContent = installed
                    ? 'OrbINT is already running as an app on this device. You can keep using it from the home screen, Dock, or Start menu.'
                    : 'Add this case file to this device like an app. It works on iPhone, iPad, Android, Windows, and Mac.';
            }
            if (steps) {
                steps.hidden = installed;
                steps.innerHTML = installed ? '' : installStepsHtml();
            }
            if (dismiss) dismiss.textContent = installed ? 'Close' : 'Not now';
            if (go) {
                go.hidden = installed;
                go.textContent = canPrompt ? 'Install' : 'Got it';
            }
        }

        function closeInstall() {
            hideSheet(document.getElementById('installSheet'));
        }

        function openInstall() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeHelp();
            closeAddField();
            closeToolkit();
            fillInstallSheet();
            showSheet(document.getElementById('installSheet'));
        }

        async function confirmInstall() {
            const go = document.getElementById('installGo');
            if (!deferredInstallPrompt) {
                if (!go || go.textContent !== 'Install') closeInstall();
                return;
            }
            const prompt = deferredInstallPrompt;
            deferredInstallPrompt = null;
            try {
                prompt.prompt();
                const result = await prompt.userChoice;
                if (result && result.outcome === 'accepted') closeInstall();
                else fillInstallSheet();
            } catch (error) {
                fillInstallSheet();
            }
        }

        function toggleShare() {
            const sheet = document.getElementById('shareSheet');
            if (!sheet) return;
            if (sheet.hidden) openShare();
            else closeShare();
        }

        function copyShareLink() {
            const url = siteShareUrl();
            const button = document.getElementById('shareCopy');
            const done = () => {
                if (!button) return;
                button.textContent = 'Copied';
                setTimeout(() => { button.textContent = 'Copy'; }, 1200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done).catch(done);
                return;
            }
            const area = document.createElement('textarea');
            area.value = url;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            done();
        }

        function nativeShareSite() {
            const url = siteShareUrl();
            if (navigator.share) {
                navigator.share({
                    title: 'OrbINT',
                    text: 'Open-source Reconnaissance Bureau of Intelligence',
                    url: url
                }).catch(function () {});
                return;
            }
            copyShareLink();
        }

        function closeHelp() {
            hideSheet(document.getElementById('helpGuide'));
        }

        function openHelp() {
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
            closeSettings();
            showSheet(document.getElementById('helpGuide'));
        }

        function toggleExportMenu() {
            exportCase();
        }

        function exportCase() {
            closeExportMenu();
            const id = profileLibrary && profileLibrary.activeId;
            const bundle = (profileLibrary && typeof exportProfileBundle === 'function')
                ? exportProfileBundle(id)
                : stampMissingFields(JSON.parse(JSON.stringify(profile || {})), profile && profile.nulls);
            const skipMedia = !!(appSettings && appSettings.exportNoPhotos);
            Promise.resolve(skipMedia ? stripExportMedia(bundle) : attachImagesToBundle(bundle, id)).then((full) => {
                downloadBlob(caseFileName('json'), 'application/json', JSON.stringify(full, null, 2));
            });
        }

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
                const files = ['./', './index.html', './app.js', './app.js?v=218', './osint-tools.js', './osint-tools.js?v=218', './investigation.js', './investigation.js?v=218', './css/base.css?v=218', './css/orbit.css?v=218', './css/timeline.css?v=218', './css/whiteboard.css?v=218', './css/compiler.css?v=218', './css/datasheet.css?v=218', './sw.js', './manifest.webmanifest'];
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
        try { document.body.classList.toggle('phone', isPhone()); if (isPhone()) setPanelOpen(false); } catch (error) {}
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
        const bombTag = document.getElementById('bombTag');
        if (bombTag) bombTag.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openSettings();
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
            const guide = document.getElementById('helpGuide');
            if (guide && !guide.hidden) closeHelp();
            else openHelp();
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
        ['setShareApi', 'setCollabWs'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const key = id === 'setShareApi' ? 'shareApiUrl' : 'collabWsUrl';
            el.addEventListener('change', function () {
                patchSettings({ [key]: el.value.trim() });
                if (window.OrbINTShare) OrbINTShare.paint();
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
                setPanelOpen(!profilePanel.classList.contains('open'));
            });
        }
        document.getElementById('profileClose').addEventListener('click', () => setPanelOpen(false));
        const pageSwitchNav = document.getElementById('pageSwitch');
        if (pageSwitchNav) {
            pageSwitchNav.addEventListener('click', function (event) {
                if (event.target.closest('[data-page]') && isPhone() && profilePanel.classList.contains('open')) {
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
                const help = document.getElementById('helpGuide');
                if (help && !help.hidden) {
                    closeHelp();
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

        function onViewportChange() {
            const phone = isPhone();
            document.body.classList.toggle('phone', phone);
            if (!phone) {
                setPanelOpen(false);
                closePhoneField();
                closePhoneMore();
                const saved = Number(localStorage.getItem(SIDEBAR_KEY));
                applySidebarWidth(saved && saved !== 268 && saved !== 320 ? saved : SIDEBAR_DEFAULT);
            } else {
                resetPhoneOrbitCamera();
                orbit.snapLayout = true;
            }
            syncCanvasBox();
            if (typeof positionNodes === 'function') positionNodes();
            orbit.snapLayout = false;
            renderProfile();
        }

        if (drawerQuery.addEventListener) drawerQuery.addEventListener('change', onViewportChange);
        else drawerQuery.addListener(onViewportChange);

        let layoutSizeKey = '';
        function relayoutIfNeeded(force) {
            if (orbit.dragging || orbit.pinching) return;
            if (mapStage && (mapStage.classList.contains('boot-enter') || mapStage.classList.contains('profile-enter') || mapStage.classList.contains('profile-fly'))) return;
            syncCanvasBox();
            const size = canvasSize();
            const key = Math.round(size.width) + 'x' + Math.round(size.height);
            if (!force && key === layoutSizeKey) return;
            layoutSizeKey = key;
            if (isPhone() && !orbit.userZoomed) orbit.fitZooming = true;
            if (typeof positionNodes === 'function') positionNodes();
        }

        window.addEventListener('resize', () => relayoutIfNeeded(false));
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => relayoutIfNeeded(false));
        }
        requestAnimationFrame(() => {
            const animate = !reduceMotion;
            function startIntro() {
                const span = animate ? bloomOrbitFromHub() : 0;
                if (mapCanvas) mapCanvas.classList.add('orbit-ready');
                if (mapStage) mapStage.classList.add('orbit-ready');
                if (animate && mapStage) {
                    void mapStage.offsetWidth;
                    mapStage.classList.add('boot-enter');
                    if (typeof kickOrbit === 'function') kickOrbit();
                    setTimeout(function () {
                        if (mapStage) mapStage.classList.remove('boot-enter');
                        if (typeof clearOrbitBloomDelays === 'function') clearOrbitBloomDelays();
                    }, Math.max(800, span + 720));
                }
                saveOrbitLayout();
            }
            if (isPhone()) resetPhoneOrbitCamera();
            orbit.snapLayout = true;
            positionNodes();
            orbit.snapLayout = false;
            if (isPhone()) {
                requestAnimationFrame(function () {
                    resetPhoneOrbitCamera();
                    orbit.snapLayout = true;
                    positionNodes();
                    orbit.snapLayout = false;
                    startIntro();
                });
            } else {
                startIntro();
            }
        });
        if (window.ResizeObserver && mapCanvas) {
            const layoutWatch = new ResizeObserver(() => {
                if (orbit.dragging || orbit.pinching) return;
                relayoutIfNeeded(false);
            });
            layoutWatch.observe(mapCanvas);
        }

        function pointerOnCanvas(event) {
            if (isPhone() || !canvasBox.width) syncCanvasBox();
            return { x: event.clientX - canvasBox.left, y: event.clientY - canvasBox.top };
        }

        function paintHeldItem() {
            const zoom = orbit.zoom || 1;
            if (orbit.dragMode === 'node' && orbit.dragItem && orbit.dragItem.node) {
                const item = orbit.dragItem;
                item.x = orbit.grabX;
                item.y = orbit.grabY;
                const next = 'translate3d(' + (item.x - item.w / 2) + 'px,' + (item.y - item.h / 2) + 'px,0) scale(' + zoom + ')';
                item._tf = next;
                item.node.style.left = '0px';
                item.node.style.top = '0px';
                item.node.style.transform = next;
                if (item.line) {
                    const parent = item.parentId && orbitItems.find((other) => other.node.dataset.field === item.parentId);
                    const hx = orbit.hubLiveX != null ? orbit.hubLiveX : (canvasBox.width / 2 + orbit.dragX + orbit.parallaxX);
                    const hy = orbit.hubLiveY != null ? orbit.hubLiveY : (canvasBox.height / 2 + orbit.dragY + orbit.parallaxY);
                    item.line.setAttribute('x1', parent ? parent.x : hx);
                    item.line.setAttribute('y1', parent ? parent.y : hy);
                    item.line.setAttribute('x2', item.x);
                    item.line.setAttribute('y2', item.y);
                }
            } else if (orbit.dragMode === 'hub' && hub) {
                hub.style.left = orbit.grabX + 'px';
                hub.style.top = orbit.grabY + 'px';
            } else if (orbit.dragMode === 'peer' && orbit.dragItem && orbit.dragItem.el) {
                const body = orbit.dragItem;
                body.x = orbit.grabX;
                body.y = orbit.grabY;
                const size = PEER_HUB_SIZE * zoom;
                body.el.style.left = (body.x - size / 2) + 'px';
                body.el.style.top = (body.y - size / 2) + 'px';
            }
        }

        function commitNodeHome(item) {
            if (!item || !item.node) return;
            const size = canvasSize();
            const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
            const dx = item.x - cx;
            const dy = item.y - cy;
            const angle = Math.atan2(dy, dx) - orbit.spin;
            item.tAngle = angle;
            item.angle = angle;
            nodeHomes.set(item.node.dataset.field, {
                angle: angle,
                rx: item.tRx == null ? item.rx : item.tRx,
                ry: item.tRy == null ? item.ry : item.tRy,
                pinned: true
            });
            scheduleSaveLayout();
        }

        function beginOrbitDrag(event, mode, item) {
            if (orbit.pinching) return;
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            syncCanvasBox();
            orbit.dragging = true;
            if (mode === 'pan' || mode === 'hub') {
                orbit.freeCam = true;
                orbit.userZoomed = true;
            }
            if (typeof kickOrbit === 'function') kickOrbit();
            orbit.dragMode = mode || 'pan';
            orbit.dragItem = item || null;
            orbit.dragStartX = event.clientX;
            orbit.dragStartY = event.clientY;
            orbit.dragOriginX = orbit.dragX;
            orbit.dragOriginY = orbit.dragY;
            orbit.gridOriginX = orbit.gridPanX;
            orbit.gridOriginY = orbit.gridPanY;
            orbit.prevCX = event.clientX;
            orbit.prevCY = event.clientY;
            orbit.panVX = 0;
            orbit.panVY = 0;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.dragMoved = false;
            if (mode === 'pan') {
                orbit.targetParallaxX = 0;
                orbit.targetParallaxY = 0;
                orbit.hubLiveX = null;
                orbit.hubLiveY = null;
                orbit.hubLiveVX = 0;
                orbit.hubLiveVY = 0;
                orbitItems.forEach((entry) => {
                    entry.vx = 0;
                    entry.vy = 0;
                    if (entry.tx != null) {
                        entry.x = entry.tx;
                        entry.y = entry.ty;
                    }
                });
                peerBodies.forEach((entry) => {
                    entry.vx = 0;
                    entry.vy = 0;
                    if (entry.tx != null) {
                        entry.x = entry.tx;
                        entry.y = entry.ty;
                    }
                });
            }
            if (mode === 'node' && item) {
                const p = pointerOnCanvas(event);
                orbit.grabOffX = item.x - p.x;
                orbit.grabOffY = item.y - p.y;
                orbit.grabX = item.x;
                orbit.grabY = item.y;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                item.node.classList.add('dragging');
                mapStage.classList.add('dragging-node');
            } else if (mode === 'peer' && item) {
                const p = pointerOnCanvas(event);
                if (item.x == null) item.x = item.tx;
                if (item.y == null) item.y = item.ty;
                orbit.grabOffX = item.x - p.x;
                orbit.grabOffY = item.y - p.y;
                orbit.grabX = item.x;
                orbit.grabY = item.y;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                if (item.el) item.el.classList.add('dragging');
                mapStage.classList.add('dragging-node');
            } else if (mode === 'hub') {
                const p = pointerOnCanvas(event);
                const size = canvasSize();
                const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
                const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
                orbit.grabOffX = cx - p.x;
                orbit.grabOffY = cy - p.y;
                orbit.grabX = cx;
                orbit.grabY = cy;
                orbit.grabVX = 0;
                orbit.grabVY = 0;
                mapStage.classList.add('panning');
            } else {
                mapStage.classList.add('panning');
            }
            mapStage.setPointerCapture(event.pointerId);
        }

        function endOrbitDrag() {
            if (orbit.dragMode === 'node' && orbit.dragItem) {
                const item = orbit.dragItem;
                if (orbit.dragMoved) {
                    item.comingHome = true;
                } else {
                    item.comingHome = false;
                    if (item.tAngle != null) item.angle = item.tAngle;
                    if (item.tRx != null) item.rx = item.tRx;
                    if (item.tRy != null) item.ry = item.tRy;
                    item.dispRx = item.rx;
                    item.dispRy = item.ry;
                }
                item.node.classList.remove('dragging');
            }
            if (orbit.dragMode === 'peer' && orbit.dragItem) {
                const body = orbit.dragItem;
                if (body.el) body.el.classList.remove('dragging');
                if (orbit.dragMoved) commitPeerHome(body);
                else if (body.id && body.el) openLinkedProfile(body.id, body.el);
            }
            orbit.dragging = false;
            orbit.dragMode = null;
            orbit.dragItem = null;
            orbit.dragMoved = false;
            mapStage.classList.remove('panning');
            mapStage.classList.remove('dragging-node');
            scheduleSaveLayout();
        }

        if (mapStage) mapStage.addEventListener('mousedown', (event) => {
            if (event.button === 1) event.preventDefault();
        });

        if (mapStage) mapStage.addEventListener('auxclick', (event) => {
            if (event.button === 1) event.preventDefault();
        });

        if (mapStage) mapStage.addEventListener('pointerdown', (event) => {
            if (orbit.pinching || pinchPointers.size >= 2) return;
            if (event.button === 1) {
                event.preventDefault();
                beginOrbitDrag(event, 'pan');
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan')) {
                event.preventDefault();
                beginOrbitDrag(event, 'pan');
                return;
            }
            if (event.target.closest('#hubAdd')) return;
            const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            if (peerEl) {
                const body = peerBodyFromEl(peerEl);
                if (body) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'peer', body);
                    return;
                }
            }
            if (event.target.closest('input, select, textarea, button, .search-btn, .secret-reveal, .node-clear, .node-more, .file-btn, .image-add, .platform-trigger, .tz-trigger, .tz-pick, .tz-abbr, .cc-trigger, .cc-pick, .cc-abbr, .cc-name, .media-thumb, .platform-icon')) return;
            const node = event.target.closest('.node');
            if (node && !node.classList.contains('renaming')) {
                const item = orbitItems.find((entry) => entry.node === node);
                if (item) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'node', item);
                    return;
                }
            }
            if (event.target.closest('#hub')) return;
            event.preventDefault();
            beginOrbitDrag(event, 'pan');
        });

        if (hub) hub.addEventListener('pointerdown', (event) => {
            if (orbit.pinching || pinchPointers.size >= 2) return;
            if (event.target.closest('#hubAdd')) {
                event.stopPropagation();
                return;
            }
            if (event.button === 1) return;
            if (event.button !== 0) return;
            const peerEl = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            if (peerEl) {
                const body = peerBodyFromEl(peerEl);
                if (body) {
                    event.preventDefault();
                    event.stopPropagation();
                    beginOrbitDrag(event, 'peer', body);
                    return;
                }
            }
            event.preventDefault();
            event.stopPropagation();
            beginOrbitDrag(event, 'hub');
        });

        if (mapStage) mapStage.addEventListener('pointermove', (event) => {
            if (orbit.pinching) return;
            if (orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'hub' || orbit.dragMode === 'peer')) {
                if (Math.hypot(event.clientX - orbit.dragStartX, event.clientY - orbit.dragStartY) > ((event.pointerType === 'touch' && orbit.dragMode === 'peer') ? 16 : 8)) orbit.dragMoved = true;
                const p = pointerOnCanvas(event);
                orbit.grabVX = event.clientX - orbit.prevCX;
                orbit.grabVY = event.clientY - orbit.prevCY;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                orbit.grabX = p.x + orbit.grabOffX;
                orbit.grabY = p.y + orbit.grabOffY;
                const zoom = orbit.zoom || 1;
                const item = orbit.dragItem;
                const held = {
                    x: orbit.grabX,
                    y: orbit.grabY,
                    tx: orbit.grabX,
                    ty: orbit.grabY,
                    sw: orbit.dragMode === 'hub' ? 220 * zoom : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE * zoom : (item && (item.sw || item.w)) || 186),
                    sh: orbit.dragMode === 'hub' ? 220 * zoom : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE * zoom : (item && (item.sh || item.h)) || 34),
                    w: orbit.dragMode === 'hub' ? 220 : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE : (item && item.w) || 186),
                    h: orbit.dragMode === 'hub' ? 220 : (orbit.dragMode === 'peer' ? PEER_HUB_SIZE : (item && item.h) || 34)
                };
                orbit.grabX = held.x;
                orbit.grabY = held.y;
                if (orbit.dragMode === 'hub') {
                    orbit.dragX = orbit.grabX - canvasBox.width / 2 - orbit.parallaxX;
                    orbit.dragY = orbit.grabY - canvasBox.height / 2 - orbit.parallaxY;
                }
                paintHeldItem();
                return;
            }
            if (orbit.dragging) {
                orbit.panVX = event.clientX - orbit.prevCX;
                orbit.panVY = event.clientY - orbit.prevCY;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                const dx = event.clientX - orbit.dragStartX;
                const dy = event.clientY - orbit.dragStartY;
                orbit.dragX = orbit.dragOriginX + dx;
                orbit.dragY = orbit.dragOriginY + dy;
                orbit.gridPanX = orbit.gridOriginX + dx;
                orbit.gridPanY = orbit.gridOriginY + dy;
                orbit.gridShiftX = orbit.gridPanX + orbit.parallaxX * 2.05;
                orbit.gridShiftY = orbit.gridPanY + orbit.parallaxY * 2.05;
                applyMapGrid();
                return;
            }
        }, { passive: true });

        function updatePointerParallax(event) {
            if (!event || orbit.dragging) return;
            if (typeof isPhone === 'function' && isPhone()) return;
            if (event.pointerType === 'touch') return;
            if (reduceMotionOn()) {
                orbit.targetParallaxX = 0;
                orbit.targetParallaxY = 0;
                return;
            }
            if (!canvasBox.width) syncCanvasBox();
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const nx = event.clientX / w - 0.5;
            const ny = event.clientY / h - 0.5;
            const strength = 18;
            orbit.targetParallaxX = nx * strength;
            orbit.targetParallaxY = ny * strength;
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        document.addEventListener('pointermove', updatePointerParallax, { passive: true, capture: true });

        if (mapStage) mapStage.addEventListener('pointerup', endOrbitDrag);
        if (mapStage) mapStage.addEventListener('pointercancel', endOrbitDrag);

        document.getElementById('searchMenu').addEventListener('click', (event) => {
            const browse = event.target.closest('[data-open-toolkit]');
            if (browse) {
                event.stopPropagation();
                const node = document.querySelector('.node.search-open');
                closeSearchMenu();
                openToolkit(browse.dataset.openToolkit || (node && node.dataset.field));
                return;
            }
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.search-open');
            const fieldId = node && node.dataset.field;
            openLead(option.dataset.openLead, fieldInputValue(fieldId), option.dataset.leadMode);
        });

        document.getElementById('platformMenu').addEventListener('click', (event) => {
            const customPick = event.target.closest('[data-pick-custom]');
            if (customPick) {
                event.stopPropagation();
                applyCustomPlatformPick(customPick.dataset.pickCustom);
                return;
            }
            const option = event.target.closest('[data-pick-platform]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.menu-open:not(.tz-open)');
            const fieldId = (node && node.dataset.field) || document.getElementById('platformMenu').dataset.field;
            if (!fieldId) return;
            applyPlatformChoice(fieldId, option.dataset.pickPlatform);
        });

        document.getElementById('tzMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-tz]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('tzMenu').dataset.field;
            applyTimezonePick(fieldId, option.dataset.pickTz);
            if (isPhone()) syncPhoneField();
        });

        const ccMenuEl = document.getElementById('ccMenu');
        if (ccMenuEl) ccMenuEl.addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-cc]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('ccMenu').dataset.field;
            applyCountryCodePick(fieldId, option.dataset.pickCc);
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('#platformMenu, .platform-trigger, .platform-icon, #phonePlatformBtn, [data-sheet-platform], .node.menu-open:not(.tz-open):not(.cc-open)')) {
                closePlatformMenu();
            }
            if (!event.target.closest('#tzMenu, .tz-trigger, .tz-pick, .tz-abbr, #phoneTzBtn, .node.tz-open')) {
                closeTimezoneMenu();
            }
            if (!event.target.closest('#ccMenu, .cc-trigger, .cc-pick, .cc-abbr, .cc-name, #phoneCcBtn, .node.cc-open')) {
                closeCountryCodeMenu();
            }
            if (!event.target.closest('#searchMenu, [data-search], #phoneFieldSearch')) {
                closeSearchMenu();
            }
            if (!event.target.closest('#exportMenu, #dockExport, #phoneExport')) {
                closeExportMenu();
            }
            if (!fieldMenuGuard && !event.target.closest('#fieldMenu, .node-more')) {
                closeFieldMenu();
            }
            if (!event.target.closest('#profileMenu, .profile-rail-item')) {
                closeProfileMenu();
            }
        });

        document.addEventListener('pointerdown', (event) => {
            if (fieldMenuGuard) return;
            if (event.target.closest('#fieldMenu, .node-more')) return;
            closeFieldMenu();
        }, true);

        document.getElementById('fieldMenu').addEventListener('pointerdown', onFieldMenuAct);
        document.getElementById('fieldMenu').addEventListener('click', onFieldMenuAct);

        function onFieldMenuAct(event) {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            event.preventDefault();
            event.stopPropagation();
            const menu = document.getElementById('fieldMenu');
            const act = button.dataset.fieldAct;
            const fieldId = menu ? menu.dataset.field : '';
            const extra = button.dataset.linkId || (menu && menu.dataset.peer) || '';
            if (!act) return;
            if (menu && menu.dataset.actLock === act + ':' + extra) return;
            if (menu) menu.dataset.actLock = act + ':' + extra;
            closeFieldMenu();
            runFieldAction(act, fieldId, extra);
        }

        function orbitHitEl(event, selector) {
            const stage = document.getElementById('mapStage');
            if (!event || !selector || !stage) return null;
            const fromTarget = event.target && event.target.closest && event.target.closest(selector);
            if (fromTarget && stage.contains(fromTarget)) return fromTarget;
            let stack = [];
            try { stack = document.elementsFromPoint(event.clientX, event.clientY) || []; } catch (err) { stack = []; }
            for (let i = 0; i < stack.length; i++) {
                const node = stack[i];
                if (!node || !node.closest) continue;
                const el = node.closest(selector);
                if (el && stage.contains(el)) return el;
            }
            return null;
        }

        function peerIdFromEl(el) {
            if (!el) return '';
            return el.getAttribute('data-peer') || '';
        }

        if (mapStage) mapStage.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#fieldMenu, #searchMenu, #platformMenu, #tzMenu, #ccMenu, #exportMenu, #profileMenu, .profile-rail, .media-viewer, .help-guide, .share-sheet, .install-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            const peer = orbitHitEl(event, '.peer-hub') || orbitHitEl(event, '[data-peer]');
            const peerId = peerIdFromEl(peer);
            if (peerId) {
                event.preventDefault();
                event.stopPropagation();
                openPeerMenu(event, peerId);
                return;
            }
            const node = orbitHitEl(event, '.node');
            if (node) {
                event.preventDefault();
                openFieldMenu(event, node);
                return;
            }
            if (orbitHitEl(event, '#hubAdd')) {
                event.preventDefault();
                toggleAddField();
                return;
            }
            if (orbitHitEl(event, '#hub')) {
                event.preventDefault();
                openHubMenu(event);
                return;
            }
            if (event.target.closest('.map-toggle, .casebook-btn, #workNav, .donate, .dock')) return;
            event.preventDefault();
            openMapMenu(event);
        });

        document.getElementById('helpClose').addEventListener('click', closeHelp);
        document.getElementById('helpGuide').addEventListener('click', (event) => {
            if (event.target.id === 'helpGuide') closeHelp();
        });
        const photosSheet = document.getElementById('photosSheet');
        const photosClose = document.getElementById('photosClose');
        const photosAdd = document.getElementById('photosAdd');
        const photosList = document.getElementById('photosList');
        const photosFile = document.getElementById('photosFile');
        if (photosClose) photosClose.addEventListener('click', closePhotosSheet);
        if (photosAdd) photosAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target && event.target.id === 'photosFile') return;
            if (photosFile) photosFile.click();
        });
        if (photosFile) photosFile.addEventListener('change', () => {
            const files = takeInputFiles(photosFile);
            if (files.length) applyProfilePhotoFiles(files);
        });
        const photosUrlForm = document.getElementById('photosUrlForm');
        const photosUrl = document.getElementById('photosUrl');
        if (photosUrlForm) {
            photosUrlForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (applyProfilePhotoUrl(photosUrl && photosUrl.value)) {
                    if (photosUrl) photosUrl.value = '';
                }
            });
        }
        if (photosList) {
            photosList.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-photo-act]');
                if (!btn) return;
                const card = btn.closest('[data-photos-index]');
                const items = imageGalleryItems();
                const item = items[Number(card && card.dataset.photosIndex)];
                if (!item) return;
                event.preventDefault();
                event.stopPropagation();
                const act = btn.dataset.photoAct;
                if (act === 'open') openPhotoInTab(item);
                else if (act === 'download') downloadPhotoItem(item);
                else if (act === 'copy' || act === 'copy-image') copyPhotoItem(item, btn);
                else if (act === 'search') {
                    if (window.OrbINTCase && typeof OrbINTCase.reverseSearchPhoto === 'function') {
                        OrbINTCase.reverseSearchPhoto(item, btn);
                    } else {
                        searchPhotoItem(item);
                    }
                } else if (act === 'meta') {
                    if (window.OrbINTCase && typeof OrbINTCase.showPhotoMeta === 'function') {
                        OrbINTCase.showPhotoMeta(item);
                    }
                }
                else if (act === 'left') reorderPhotoItem(item.index, -1);
                else if (act === 'right') reorderPhotoItem(item.index, 1);
                else if (act === 'face') promotePhotoItem(item);
                else if (act === 'delete') deletePhotoItem(item);
            });
            photosList.addEventListener('wheel', (event) => {
                if (!photosList.scrollWidth || photosList.scrollWidth <= photosList.clientWidth + 4) return;
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                event.preventDefault();
                photosList.scrollLeft += event.deltaY;
            }, { passive: false });
        }
        if (photosSheet) {
            photosSheet.addEventListener('click', (event) => {
                if (event.target.id === 'photosSheet') closePhotosSheet();
            });
            ['dragenter', 'dragover'].forEach((type) => {
                photosSheet.addEventListener(type, (event) => {
                    event.preventDefault();
                    photosSheet.classList.add('is-drop');
                });
            });
            photosSheet.addEventListener('dragleave', (event) => {
                if (event.target === photosSheet || event.target.id === 'photosStage') photosSheet.classList.remove('is-drop');
            });
            photosSheet.addEventListener('drop', (event) => {
                event.preventDefault();
                photosSheet.classList.remove('is-drop');
                const files = event.dataTransfer && event.dataTransfer.files;
                if (files && files.length) applyProfilePhotoFiles(files);
            });
            photosSheet.addEventListener('paste', (event) => {
                const clip = event.clipboardData;
                if (!clip) return;
                const files = Array.from(clip.files || []).filter(isImageFile);
                if (files.length) {
                    event.preventDefault();
                    applyProfilePhotoFiles(files);
                    return;
                }
                if (event.target && event.target.id === 'photosUrl') return;
                const text = String(clip.getData('text') || '').trim();
                if (text && applyProfilePhotoUrl(text)) event.preventDefault();
            });
        }
        document.getElementById('mediaClose').addEventListener('click', closeMediaViewer);
        const mediaPrev = document.getElementById('mediaPrev');
        const mediaNext = document.getElementById('mediaNext');
        if (mediaPrev) mediaPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(-1);
        });
        if (mediaNext) mediaNext.addEventListener('click', (event) => {
            event.stopPropagation();
            stepMediaGallery(1);
        });
        document.getElementById('mediaViewer').addEventListener('click', (event) => {
            if (event.target.id === 'mediaViewer') closeMediaViewer();
        });
        document.getElementById('mediaViewer').addEventListener('wheel', (event) => {
            const viewer = document.getElementById('mediaViewer');
            if (!viewer || viewer.hidden || mediaGallery.items.length < 2) return;
            if (Math.abs(event.deltaY) < 2 && Math.abs(event.deltaX) < 2) return;
            event.preventDefault();
            stepMediaGallery((event.deltaY + event.deltaX) > 0 ? 1 : -1);
        }, { passive: false });

        function captureZoomFocus(mx, my) {
            const size = canvasSize();
            const zoom = Math.max(orbit.zoom, 0.01);
            const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
            orbit.zoomFocusX = mx;
            orbit.zoomFocusY = my;
            orbit.zoomWorldX = (mx - cx) / zoom;
            orbit.zoomWorldY = (my - cy) / zoom;
        }

        function applyZoomFocus(nextZoom) {
            if (orbit.zoomWorldX == null || orbit.zoomFocusX == null) return;
            const size = canvasSize();
            const nextX = orbit.zoomFocusX - orbit.zoomWorldX * nextZoom - size.width / 2 - orbit.parallaxX;
            const nextY = orbit.zoomFocusY - orbit.zoomWorldY * nextZoom - size.height / 2 - orbit.parallaxY;
            orbit.gridPanX += nextX - orbit.dragX;
            orbit.gridPanY += nextY - orbit.dragY;
            orbit.dragX = nextX;
            orbit.dragY = nextY;
        }

        function followZoom(current, target, dt, ms) {
            if (current <= 0 || target <= 0) return follow(current, target, dt, ms);
            return Math.exp(follow(Math.log(current), Math.log(target), dt, ms));
        }

        if (mapStage) mapStage.addEventListener('wheel', (event) => {
            if (event.target.closest('select, option, .platform-menu, .tz-menu, .search-menu, .field-menu, #profileMenu, .profile-rail, .media-viewer, .help-guide, .share-sheet, .install-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            event.preventDefault();
            const rect = mapCanvas.getBoundingClientRect();
            let delta = event.deltaY;
            if (event.deltaMode === 1) delta *= 16;
            else if (event.deltaMode === 2) delta *= rect.height || 800;
            const current = orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom;
            const next = clamp(current * Math.exp(-delta * 0.00105), orbitMinZoom(), orbitMaxZoom());
            captureZoomFocus(event.clientX - rect.left, event.clientY - rect.top);
            orbit.userZoomed = true;
            orbit.freeCam = true;
            orbit.fitZooming = false;
            orbit.targetZoom = next;
            orbit.zoom = next;
            orbit.zoomBusy = true;
            applyZoomFocus(next);
            if (reduceMotion) orbit.zoomBusy = false;
            if (typeof kickOrbit === 'function') kickOrbit();
        }, { passive: false });

        function pinchPointList() {
            return Array.from(pinchPointers.values());
        }

        function pinchDistance() {
            const pts = pinchPointList();
            if (pts.length < 2) return 0;
            return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        }

        function pinchCenter() {
            const pts = pinchPointList();
            if (pts.length < 2) return { x: 0, y: 0 };
            return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        }

        function startOrbitPinch() {
            if (orbit.dragging) endOrbitDrag({ pointerId: -1 });
            orbit.panVX = 0;
            orbit.panVY = 0;
            syncCanvasBox();
            const dist = Math.max(pinchDistance(), 8);
            const c = pinchCenter();
            captureZoomFocus(c.x - canvasBox.left, c.y - canvasBox.top);
            orbit.pinching = true;
            orbit.pinchDist = dist;
            orbit.pinchZoom = orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom;
            orbit.userZoomed = true;
            orbit.freeCam = true;
            orbit.fitZooming = false;
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        function moveOrbitPinch() {
            if (!orbit.pinching || pinchPointers.size < 2 || orbit.pinchDist < 8) return;
            const dist = pinchDistance();
            if (dist < 8) return;
            const next = clamp(orbit.pinchZoom * (dist / orbit.pinchDist), orbitMinZoom(), orbitMaxZoom());
            const c = pinchCenter();
            captureZoomFocus(c.x - canvasBox.left, c.y - canvasBox.top);
            orbit.targetZoom = next;
            orbit.zoom = next;
            orbit.zoomBusy = true;
            applyZoomFocus(next);
            if (typeof kickOrbit === 'function') kickOrbit();
        }

        function endOrbitPinch(pointerId) {
            pinchPointers.delete(pointerId);
            if (pinchPointers.size < 2) {
                orbit.pinching = false;
                orbit.pinchDist = 0;
                orbit.zoomBusy = false;
                if (typeof kickOrbit === 'function') kickOrbit();
            }
        }

        if (mapStage) {
            mapStage.addEventListener('pointerdown', (event) => {
                if (event.pointerType !== 'touch') return;
                if (event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (pinchPointers.size >= 2) {
                    event.preventDefault();
                    event.stopPropagation();
                    startOrbitPinch();
                }
            }, true);
            mapStage.addEventListener('pointermove', (event) => {
                if (!pinchPointers.has(event.pointerId)) return;
                pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (!orbit.pinching || pinchPointers.size < 2) return;
                event.preventDefault();
                event.stopPropagation();
                moveOrbitPinch();
            }, { capture: true, passive: false });
            mapStage.addEventListener('pointerup', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            mapStage.addEventListener('pointercancel', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            mapStage.addEventListener('lostpointercapture', (event) => {
                if (event.pointerType === 'touch') endOrbitPinch(event.pointerId);
            }, true);
            ['gesturestart', 'gesturechange', 'gestureend'].forEach((name) => {
                mapStage.addEventListener(name, (event) => {
                    if (event.target.closest && event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                    event.preventDefault();
                });
            });
            mapStage.addEventListener('touchmove', (event) => {
                if (event.target.closest && event.target.closest('.map-toggle, .casebook-btn, #workNav, button, a, input, select, textarea')) return;
                if (event.touches && event.touches.length > 1) event.preventDefault();
            }, { passive: false });
        }

        function orbitIsBusy() {
            if (document.hidden) return false;
            if (orbit.dragging) return true;
            if (orbit.pinching) return true;
            if (!reduceMotion && !isPhone() && !document.hidden) return true;
            if (orbit.zoomBusy || orbit.zoomWorldX != null) return true;
            if (Math.abs((orbit.zoom || 1) - (orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom)) > 0.0008) return true;
            if (Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.08) return true;
            if (Math.abs((orbit.parallaxX || 0) - (orbit.targetParallaxX || 0)) > 0.12) return true;
            if (Math.abs((orbit.parallaxY || 0) - (orbit.targetParallaxY || 0)) > 0.12) return true;
            if (orbit.targetSpotX != null && Math.abs((orbit.spotX || 0) - orbit.targetSpotX) > 0.2) return true;
            if (orbit.targetSpotY != null && Math.abs((orbit.spotY || 0) - orbit.targetSpotY) > 0.2) return true;
            if (Math.hypot(orbit.hubLiveVX || 0, orbit.hubLiveVY || 0) > 0.12) return true;
            const drift = reduceMotion ? 1 : 2.05;
            if (Math.abs((orbit.gridShiftX || 0) - ((orbit.gridPanX || 0) + (orbit.parallaxX || 0) * drift)) > 0.25) return true;
            if (Math.abs((orbit.gridShiftY || 0) - ((orbit.gridPanY || 0) + (orbit.parallaxY || 0) * drift)) > 0.25) return true;
            for (let i = 0; i < orbitItems.length; i++) {
                const item = orbitItems[i];
                if (item.comingHome || (item.bloomWait || 0) > 0) return true;
                if (Math.abs(item.vx || 0) > 0.05 || Math.abs(item.vy || 0) > 0.05) return true;
                const wantRx = item.tRx == null ? item.rx : item.tRx;
                const wantRy = item.tRy == null ? item.ry : item.tRy;
                if (Math.abs((item.rx || 0) - wantRx) > 0.8 || Math.abs((item.ry || 0) - wantRy) > 0.8) return true;
            }
            for (let i = 0; i < peerBodies.length; i++) {
                const body = peerBodies[i];
                if (Math.abs(body.vx || 0) > 0.05 || Math.abs(body.vy || 0) > 0.05) return true;
                if (body.tx != null && body.x != null && Math.hypot(body.tx - body.x, (body.ty || 0) - (body.y || 0)) > 0.8) return true;
            }
            return false;
        }

        function kickOrbit() {
            if (!orbit || orbit.raf || document.hidden) return;
            orbit.tickAt = performance.now();
            orbit.raf = requestAnimationFrame(tickOrbit);
        }

        function tickOrbit(now) {
            const dt = Math.min(48, now - (orbit.tickAt || now));
            orbit.tickAt = now;
            if (orbit.dragging || !canvasBox.width) syncCanvasBox();
            if (orbit.targetZoom == null) orbit.targetZoom = orbit.zoom;
            if (!orbit.dragging && !orbit.zoomBusy && !orbit.pinching) {
                if (Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12) {
                    orbit.dragX += orbit.panVX;
                    orbit.dragY += orbit.panVY;
                    orbit.gridPanX += orbit.panVX;
                    orbit.gridPanY += orbit.panVY;
                    orbit.panVX *= 0.86;
                    orbit.panVY *= 0.86;
                } else {
                    orbit.panVX = 0;
                    orbit.panVY = 0;
                }
            }
            const size = canvasSize();
            if (orbit.targetSpotX == null) {
                orbit.targetSpotX = size.width / 2;
                orbit.targetSpotY = size.height / 2;
                orbit.spotX = orbit.targetSpotX;
                orbit.spotY = orbit.targetSpotY;
            }
            const freezeWorld = !!orbit.dragging || !!orbit.pinching
                || (!orbit.dragging && Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.12);
            const holdingField = orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'peer');
            if (!reduceMotion && !isPhone() && !orbit.pinching && !holdingField) {
                orbit.spin += dt * 0.00007;
            }
            const zoomMs = reduceMotion ? 1 : (orbit.fitZooming && !orbit.zoomWorldX ? 640 : 48);
            orbit.zoom = followZoom(orbit.zoom, orbit.targetZoom, dt, zoomMs);
            if (Math.abs(Math.log(orbit.zoom / Math.max(orbit.targetZoom, 0.01))) < 0.0008) {
                orbit.zoom = orbit.targetZoom;
            }
            if (orbit.zoomWorldX != null) applyZoomFocus(orbit.zoom);
            orbit.zoomBusy = orbit.zoom !== orbit.targetZoom || orbit.zoomWorldX != null;
            const freezeCam = freezeWorld || orbit.zoomBusy;
            const mouseMs = reduceMotion ? 40 : 72;
            const snapMs = 16;
            orbit.parallaxX = follow(orbit.parallaxX, freezeCam ? orbit.parallaxX : orbit.targetParallaxX, dt, freezeCam ? snapMs : mouseMs);
            orbit.parallaxY = follow(orbit.parallaxY, freezeCam ? orbit.parallaxY : orbit.targetParallaxY, dt, freezeCam ? snapMs : mouseMs);
            orbit.spotX = follow(orbit.spotX, orbit.targetSpotX, dt, freezeCam ? snapMs : mouseMs);
            orbit.spotY = follow(orbit.spotY, orbit.targetSpotY, dt, freezeCam ? snapMs : mouseMs);
            const gridMs = reduceMotion ? 50 : (orbit.zoomBusy ? 1 : 110);
            const drift = reduceMotion ? 1 : 2.05;
            orbit.gridShiftX = follow(orbit.gridShiftX, orbit.gridPanX + orbit.parallaxX * drift, dt, freezeCam ? 1 : gridMs);
            orbit.gridShiftY = follow(orbit.gridShiftY, orbit.gridPanY + orbit.parallaxY * drift, dt, freezeCam ? 1 : gridMs);
            if (!isPhone() || !profilePanel.classList.contains('open')) applyOrbit(dt);
            if (orbit.zoom === orbit.targetZoom) {
                orbit.zoomBusy = false;
                orbit.fitZooming = false;
                orbit.zoomFocusX = null;
                orbit.zoomFocusY = null;
                orbit.zoomWorldX = null;
                orbit.zoomWorldY = null;
            }
            if (orbitIsBusy()) orbit.raf = requestAnimationFrame(tickOrbit);
            else orbit.raf = 0;
        }
        kickOrbit();
        setInterval(function () {
            if (document.hidden) return;
            updateTimezoneClocks();
            touchSeen();
            const settings = document.getElementById('settingsSheet');
            if (settings && !settings.hidden && appSettings.logicBomb && appSettings.logicBombPeriod !== 'now') {
                bombPulseLow = !bombPulseLow;
                updateBombCountdown();
            }
        }, 1000);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (orbit.raf) {
                    cancelAnimationFrame(orbit.raf);
                    orbit.raf = 0;
                }
                return;
            }
            kickOrbit();
        });
        if (window.OrbINTShare && typeof OrbINTShare.boot === 'function') OrbINTShare.boot();
