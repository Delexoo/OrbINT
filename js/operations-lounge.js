/* Operations device, layout, and lounge render */

    const OPS_NEWS_KEY = 'orbint-ops-news';
    const OPS_LAYOUT_KEY = 'orbint-ops-layout';
    const OPS_SPANS = [3, 4, 6, 8, 12];
    const OPS_LAYOUT_DEFAULT = {
        machine: { span: 12, open: true, height: 0 },
        news: { span: 4, open: true, height: 0 }
    };
    const OPS_OUTAGE_META = {
        bgp: { label: 'Network', color: '#fb7185' },
        'ping-slash24': { label: 'Reachability', color: '#c084fc' },
        'merit-nt': { label: 'Telescope', color: '#fbbf24' }
    };
    const OPS_FEEDS = [
        { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', home: 'https://thehackernews.com/' },
        { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', home: 'https://www.darkreading.com/' },
        { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', home: 'https://krebsonsecurity.com/' },
        { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/', home: 'https://www.securityweek.com/' },
        { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', home: 'https://www.bleepingcomputer.com/' },
        { name: 'The Record', url: 'https://therecord.media/feed', home: 'https://therecord.media/' },
        { name: 'SANS Internet Storm Center', url: 'https://isc.sans.edu/rssfeed.xml', home: 'https://isc.sans.edu/' },
        { name: 'CISA', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', home: 'https://www.cisa.gov/news-events/cybersecurity-advisories' }
    ];
    const OPS_NEWS_MS = 7000;
    const OPS_TOPICS = [
        { id: 'all', label: 'All' },
        { id: 'ai', label: 'AI', test: /\b(ai|llm|chatgpt|openai|anthropic|claude|machine learning)\b/i },
        { id: 'malware', label: 'Malware', test: /\b(malware|trojan|botnet|stealer|backdoor|spyware|rootkit)\b/i },
        { id: 'virus', label: 'Viruses', test: /\b(virus|worm|ransomware|wiper)\b/i },
        { id: 'outage', label: 'Outages', test: /\b(outage|outages|offline|disruption|downtime)\b/i },
        { id: 'breach', label: 'Breaches', test: /\b(breach|breaches|leak|leaked|stolen|exposed)\b/i },
        { id: 'vuln', label: 'Vulnerabilities', test: /\b(vulnerability|vulnerabilities|cve-\d|zero-day|0-day|exploit|rce|patch)\b/i }
    ];
    const OPS_PORTS = {
        21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 43: 'WHOIS', 53: 'DNS',
        80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB',
        1433: 'MSSQL', 3306: 'MySQL', 3389: 'RDP', 5900: 'VNC', 8080: 'HTTP', 8443: 'HTTPS'
    };
    let opsNewsBusy = false;
    let opsNewsAll = [];
    let opsNewsItems = [];
    let opsNewsIndex = 0;
    let opsNewsAt = 0;
    let opsNewsNote = '';
    let opsNewsPaused = false;
    let opsNewsTopic = 'all';
    let opsNewsDir = 1;
    let opsNewsStamp = 0;
    let opsNewsHold = 0;
    let opsNewsPaintKey = '';
    let opsNewsClosed = false;
    let opsChapterMove = 0;
    let opsImageQueue = [];
    let opsImageBusy = false;
    let opsFinger = '';
    const OPS_DEVICE_KEY = 'orbint-ops-device';

    function opsDeviceChoice() {
        try { return localStorage.getItem(OPS_DEVICE_KEY) || ''; } catch (error) { return ''; }
    }

    function opsDeviceAllowed() {
        return opsDeviceChoice() === 'allow';
    }

    function setOpsDeviceChoice(value) {
        try {
            if (value) localStorage.setItem(OPS_DEVICE_KEY, value);
            else localStorage.removeItem(OPS_DEVICE_KEY);
        } catch (error) {}
    }
    let opsMapMode = 'cameras';
    let opsAttackRange = 'live';
    let opsPointer = null;
    let opsTipPoint = null;
    let opsAttacks = [];
    let opsOutages = [];
    let opsAttackNote = 'Loading attack sources';
    let opsOutageNote = 'Loading internet outages';
    let opsAttackAt = 0;
    let opsOutageAt = 0;
    let opsMapHits = [];
    let opsFlockCells = null;
    let opsView = { z: 1, x: 0, y: 0 };
    let opsViewPlaced = false;
    let opsWorldW = 1;
    let opsMapBox = { w: 0, h: 0 };
    let opsMapDrag = null;
    let opsHover = null;
    let opsTipKey = '';
    let opsReportKey = '';
    let opsPortCache = null;
    let opsPortStop = false;
    let opsPortMiss = {};
    let opsMapRunning = false;
    let opsLandDots = null;
    let opsLandRaw = '';
    let opsCountryRaw = '';
    let opsLandCanvas = null;
    let opsLandSize = '';

    function opsText(id, text) {
        const node = $(id);
        if (node) node.textContent = text;
    }

    function opsHash(text) {
        let hash = 2166136261;
        const value = String(text || '');
        for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
    }

    function opsGpu() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return '';
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
            const lose = gl.getExtension('WEBGL_lose_context');
            if (lose) lose.loseContext();
            return name || '';
        } catch (error) {
            return '';
        }
    }

    function opsBytes(size) {
        const n = Number(size);
        if (!isFinite(n) || n < 0) return '';
        if (n < 1024) return n + ' B';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
        if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
        return (n / 1073741824).toFixed(1) + ' GB';
    }

    function opsClock() {
        return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    function opsAgo(date) {
        let raw = date;
        if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(raw.trim())) raw = raw.trim().replace(' ', 'T') + 'Z';
        const time = new Date(raw).getTime();
        if (!time || isNaN(time)) return '';
        const min = Math.round((Date.now() - time) / 60000);
        if (min < 0) return new Date(time).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        if (min < 1) return 'Just now';
        if (min < 60) return min + 'm ago';
        const hr = Math.round(min / 60);
        if (hr < 36) return hr + 'h ago';
        return new Date(time).toLocaleDateString();
    }

    function opsNetLabel() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!conn) return 'Network unavailable';
        const label = [conn.effectiveType, conn.downlink ? conn.downlink + ' Mb/s' : ''].filter(Boolean).join(' · ');
        return label || 'Network unavailable';
    }

    function paintOpsRail() {}

    function opsLayout(next) {
        if (next) {
            try { localStorage.setItem(OPS_LAYOUT_KEY, JSON.stringify(next)); } catch (error) {}
            return next;
        }
        try {
            const saved = JSON.parse(localStorage.getItem(OPS_LAYOUT_KEY) || '');
            if (saved && typeof saved === 'object') {
                if (saved._v !== 2) {
                    ['machine'].forEach(function (id) {
                        if (saved[id]) saved[id].open = false;
                    });
                    saved._v = 2;
                    try { localStorage.setItem(OPS_LAYOUT_KEY, JSON.stringify(saved)); } catch (error) {}
                }
                return saved;
            }
        } catch (error) {}
        return {};
    }

    function applyOpsLayout(source) {
        const saved = source || opsLayout();
        document.querySelectorAll('.ops-panel').forEach(function (panel) {
            panel.style.gridColumn = '';
            const id = panel.getAttribute('data-ops');
            const base = OPS_LAYOUT_DEFAULT[id] || { span: 3, open: true, height: 0 };
            const spec = Object.assign({}, base, saved[id] || {});
            if (id === 'news' || id === 'machine') spec.open = true;
            panel.classList.toggle('is-closed', !spec.open);
            const toggle = panel.querySelector('.ops-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', spec.open ? 'true' : 'false');
            const body = panel.querySelector('.ops-body');
            if (body) body.style.height = '';
        });
    }

    function setOpsOpen(id, open) {
        const layout = opsLayout();
        const base = OPS_LAYOUT_DEFAULT[id] || { span: 12, open: true, height: 0 };
        const spec = Object.assign({}, base, layout[id] || {});
        spec.open = !!open;
        layout[id] = spec;
        opsLayout(layout);
        applyOpsLayout(layout);
    }

    function opsSnapSpan(width, boardWidth) {
        const raw = Math.round((width / boardWidth) * 12);
        let best = 12;
        OPS_SPANS.forEach(function (span) {
            if (Math.abs(span - raw) < Math.abs(best - raw)) best = span;
        });
        return best;
    }

    function paintOpsAccess() {
        const status = $('opsAccessStatus');
        const ask = $('opsAccessAsk');
        const choice = opsDeviceChoice();
        if (choice === 'allow') {
            if (status) status.textContent = 'Allowed. This computer shows what the browser can see.';
            if (ask) ask.textContent = 'Access on';
        } else if (choice === 'deny') {
            if (status) status.textContent = 'Not collected. This device stays unread.';
            if (ask) ask.textContent = 'Allow access';
        } else {
            if (status) status.textContent = 'Nothing about this device is read yet.';
            if (ask) ask.textContent = 'Allow access';
        }
    }

    function paintOpsMachineHeld() {
        opsFinger = '';
        opsText('opsMachineStatus', 'Not collected');
        const box = $('opsMachine');
        if (box) box.innerHTML = '<p class="ops-note">Nothing about this device is read until you allow access.</p>';
    }

    function openOpsAsk() {
        const ask = $('opsAsk');
        if (!ask) return;
        ask.hidden = false;
        const deny = $('opsAskDeny');
        if (deny) deny.focus();
    }

    function closeOpsAsk() {
        const ask = $('opsAsk');
        if (ask) ask.hidden = true;
    }

    function paintOpsMachine() {
        const box = $('opsMachine');
        if (!box) return;
        if (!opsDeviceAllowed()) {
            paintOpsMachineHeld();
            return;
        }
        const nav = navigator;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        const gpu = opsGpu();
        const screenBits = window.screen
            ? (window.screen.width + '×' + window.screen.height + ' @ ' + (window.devicePixelRatio || 1) + 'x')
            : '';
        let zone = '';
        try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (error) {}
        const net = conn
            ? [conn.effectiveType, conn.downlink ? conn.downlink + ' Mb/s' : ''].filter(Boolean).join(' · ')
            : '';
        const platform = nav.platform || (nav.userAgentData && nav.userAgentData.platform) || '';
        const rows = [
            ['User agent', nav.userAgent || ''],
            ['Platform', platform],
            ['CPU cores', nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : ''],
            ['Device memory', nav.deviceMemory ? nav.deviceMemory + ' GB (browser hint)' : ''],
            ['Screen', screenBits],
            ['Language', nav.language || ''],
            ['Timezone', zone],
            ['GPU', gpu],
            ['Network', net],
            ['CPU usage', ''],
            ['Disk usage', ''],
            ['Live network usage', '']
        ];
        const place = opsUserFix
            ? opsUserFix.lat.toFixed(5) + ', ' + opsUserFix.lng.toFixed(5) + (isFinite(opsUserFix.accuracy) ? ' ± ' + Math.round(opsUserFix.accuracy) + ' m' : '')
            : (opsUserNote || 'Locating…');
        opsFinger = opsHash(rows.slice(0, 9).map(function (row) { return row[0] + ':' + row[1]; }).join('|'));
        const bits = [platform, nav.hardwareConcurrency ? nav.hardwareConcurrency + ' cores' : ''].filter(Boolean);
        opsText('opsMachineStatus', bits.join(' · ') || 'Browser specs');
        box.innerHTML = rows.map(function (row) {
            return '<div class="ops-row"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1] || 'Unavailable') + '</strong></div>';
        }).join('') + '<div class="ops-row"><span>Location</span><strong id="opsUserPlace">' + esc(place) + '</strong></div>' +
            '<div class="ops-row"><span>Fingerprint</span><strong>' + esc(opsFinger) + '</strong></div>' +
            '<div class="ops-row"><span>Storage</span><strong id="opsStorage">Checking…</strong></div>';
        if (nav.storage && nav.storage.estimate) {
            nav.storage.estimate().then(function (est) {
                const node = $('opsStorage');
                if (!node) return;
                const used = opsBytes(est && est.usage);
                const quota = opsBytes(est && est.quota);
                node.textContent = used && quota ? used + ' used of ' + quota : 'Unavailable';
            }).catch(function () {
                const node = $('opsStorage');
                if (node) node.textContent = 'Unavailable';
            });
        } else {
            const node = $('opsStorage');
            if (node) node.textContent = 'Unavailable';
        }
        paintOpsRail();
    }

    function renderOperations() {
        applyOpsLayout();
        paintOpsAccess();
        paintOpsMachine();
        loadOpsNews(false);
        loadOpsAttacks(false);
        loadOpsOutages(false);
        opsMapStatusLine();
        paintOpsMapList();
        startOpsMap();
        if (opsDeviceAllowed()) opsLocateUser(false);
    }

