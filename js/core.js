/* Shared investigation state, page switch, persist */

    const PAGES = [
        { id: 'orbit', label: 'OrbINT', kicker: 'Workspace', blurb: 'Orbit-style profile for names, usernames, emails, phones, domains, companies, and other identifiers.' },
        { id: 'timeline', label: 'Timeline', kicker: 'Chronology', blurb: 'Events and discoveries in order — who, when, evidence, and source.' },
        { id: 'whiteboard', label: 'Whiteboard', kicker: 'Diagram', blurb: 'Flowchart shapes and case cards on one board, including investigation playbooks.' },
        { id: 'harvester', label: 'Harvester', kicker: 'Processor', blurb: 'Upload messy files. Keeps names, dates, accounts, passwords, times, age, and other key data — and cuts the rest.' },
        { id: 'datasheet', label: 'Case File', kicker: 'Record', blurb: 'On-screen preview is redacted. The downloaded PDF contains the full case file.' }
    ];

    const FLOW_PRESETS = [
        {
            id: 'username',
            chip: 'Username',
            title: 'Username investigation',
            lead: 'Check whether a handle repeats across accounts, mail, domains, and archives.',
            steps: [
                { id: 'u1', title: 'Normalize the handle', body: 'Strip @, note capitalization, and record alternate spellings.' },
                { id: 'u2', title: 'WhatsMyName / Namechk', body: 'Run the handle through username occupancy indexes.', href: 'https://whatsmyname.app/' },
                { id: 'u3', title: 'Social profile pages', body: 'Open Instagram, X, TikTok, Reddit, GitHub, Telegram, and LinkedIn directly.' },
                { id: 'u4', title: 'Search engines', body: 'Quoted handle plus site: and related names or cities.' },
                { id: 'u5', title: 'Email pairing', body: 'Try handle@common-providers and paste into HIBP / Epieos.' },
                { id: 'u6', title: 'Domain / site', body: 'Look for handle.com, handle.net, and GitHub Pages.' },
                { id: 'u7', title: 'Archives', body: 'Wayback, Ghostarchive, and cached copies of profile URLs.', href: 'https://web.archive.org/' },
                { id: 'u8', title: 'File hits', body: 'Move confirmed accounts onto the orbit and link related profiles.' }
            ]
        },
        {
            id: 'email',
            chip: 'Email',
            title: 'Email investigation',
            lead: 'Breach data, account graphs, and the domain behind the mailbox.',
            steps: [
                { id: 'e1', title: 'Have I Been Pwned', body: 'Note breach names and dates; do not request dumps.', href: 'https://haveibeenpwned.com/' },
                { id: 'e2', title: 'Epieos / holehe-class tools', body: 'Public account graphs tied to the address.', href: 'https://epieos.com/' },
                { id: 'e3', title: 'Gravatar / GitHub', body: 'Avatar, profile, and commit history using the address.' },
                { id: 'e4', title: 'MX / provider', body: 'DNS MX shows Google, Microsoft, Fastmail, or a vanity domain.' },
                { id: 'e5', title: 'Domain intelligence', body: 'If the host is custom, run WHOIS, certs, and historical URLs.' },
                { id: 'e6', title: 'People indexes', body: 'Thatsthem, Hunter, and quoted search with the full address.' },
                { id: 'e7', title: 'File on the orbit', body: 'Add the email, provider, and any recovered usernames.' }
            ]
        },
        {
            id: 'domain',
            chip: 'Domain',
            title: 'Domain investigation',
            lead: 'Registration, DNS, certificates, subdomains, archives, and stack.',
            steps: [
                { id: 'd1', title: 'Normalize the host', body: 'Drop scheme and path. Record www vs apex.' },
                { id: 'd2', title: 'Live Domain Intel', body: 'Run DNS, RDAP, certificates, subdomains, and Wayback from the Toolkit Domain Intelligence tools or this playbook.' },
                { id: 'd3', title: 'WHOIS / RDAP', body: 'Registrar, created date, nameservers, and privacy service.' },
                { id: 'd4', title: 'Certificate transparency', body: 'crt.sh for SAN names and forgotten hosts.', href: 'https://crt.sh/' },
                { id: 'd5', title: 'Historical URLs', body: 'Wayback CDX and urlscan public snapshots.', href: 'https://web.archive.org/' },
                { id: 'd6', title: 'Technology fingerprints', body: 'BuiltWith, Wappalyzer, and HTTP/security headers.', href: 'https://builtwith.com/' },
                { id: 'd7', title: 'Related infrastructure', body: 'Shared IPs, MX, and tracking IDs on the whiteboard.' }
            ]
        },
        {
            id: 'phone',
            chip: 'Phone',
            title: 'Phone investigation',
            lead: 'Carrier region, messaging apps, and public listings.',
            steps: [
                { id: 'p1', title: 'Format E.164', body: 'Country code plus national number. Record the source.' },
                { id: 'p2', title: 'Prefix / carrier', body: 'Area code, time zone, and possible carrier.' },
                { id: 'p3', title: 'Reverse indexes', body: 'Whitepages, Truecaller, and people-search sites.' },
                { id: 'p4', title: 'Messaging apps', body: 'WhatsApp, Telegram, Signal, and iMessage availability clues.' },
                { id: 'p5', title: 'Quoted search', body: 'The number in quotes, with and without punctuation.' },
                { id: 'p6', title: 'File related IDs', body: 'Name, city, and accounts recovered from listings.' }
            ]
        },
        {
            id: 'name',
            chip: 'Person',
            title: 'Person / name investigation',
            lead: 'Directories, employment, local footprint, then usernames.',
            steps: [
                { id: 'n1', title: 'Full name + locale', body: 'Pair the name with city, school, or employer before searching.' },
                { id: 'n2', title: 'People directories', body: 'Thatsthem, TruePeopleSearch, FastPeopleSearch, WebMii.' },
                { id: 'n3', title: 'Employment graph', body: 'LinkedIn, company sites, and professional licenses.' },
                { id: 'n4', title: 'Social name hits', body: 'Facebook, Instagram, X, and local groups.' },
                { id: 'n5', title: 'News and records', body: 'Google News, CourtListener, property, and voter indexes where public.' },
                { id: 'n6', title: 'Username pivot', body: 'Once a handle appears, switch to the username playbook.' }
            ]
        },
        {
            id: 'image',
            chip: 'Image',
            title: 'Image investigation',
            lead: 'Reverse search, EXIF, and copies of the same photo.',
            steps: [
                { id: 'i1', title: 'Read metadata', body: 'Use Meta on the photo window for camera, GPS, and timestamps.' },
                { id: 'i2', title: 'Reverse search', body: 'Google Lens, Yandex, TinEye, and Bing Visual from the photo window.' },
                { id: 'i3', title: 'Forensics', body: 'Error-level and clone analysis on Forensically / FotoForensics.', href: 'https://29a.ch/photo-forensics/' },
                { id: 'i4', title: 'Places and people', body: 'Yandex is often stronger on faces and interiors.' },
                { id: 'i5', title: 'File copies', body: 'Save original, note source URL, and drop a timeline event.' }
            ]
        },
        {
            id: 'vehicle',
            chip: 'Vehicle',
            title: 'Vehicle / plate investigation',
            lead: 'Plate, VIN, photos, and public vehicle records.',
            steps: [
                { id: 'v1', title: 'Record identifiers', body: 'Plate, state, VIN, color, make, model, year.' },
                { id: 'v2', title: 'Plate photos', body: 'Google / Yandex image search for the plate text.' },
                { id: 'v3', title: 'VIN decode', body: 'NHTSA-style decoders for year, plant, and equipment.' },
                { id: 'v4', title: 'Public indexes', body: 'FindByPlate, FaxVin, Bumper — only public layers.' },
                { id: 'v5', title: 'Context', body: 'Parking location, employer lot, or social posts with the vehicle.' }
            ]
        }
    ];

    const BOARD_SHAPES = {
        square: { w: 148, h: 148 },
        circle: { w: 148, h: 148 },
        triangle: { w: 168, h: 148 },
        diamond: { w: 168, h: 168 },
        process: { w: 200, h: 88 },
        decision: { w: 168, h: 168 },
        terminator: { w: 188, h: 64 },
        data: { w: 210, h: 80 },
        document: { w: 200, h: 96 },
        note: { w: 176, h: 176 },
        ellipse: { w: 140, h: 140 },
        line: { w: 200, h: 32 },
        arrow: { w: 200, h: 36 },
        image: { w: 240, h: 168 },
        frame: { w: 320, h: 220 },
        embed: { w: 280, h: 180 },
        draw: { w: 16, h: 16 }
    };

    const BOARD_TYPES = [
        { id: 'square', label: 'Square', shape: 'square', color: '#67e8f9' },
        { id: 'circle', label: 'Circle', shape: 'circle', color: '#67e8f9' },
        { id: 'triangle', label: 'Triangle', shape: 'triangle', color: '#fbbf24' },
        { id: 'line', label: 'Line', shape: 'line', color: '#e4e4e7' },
        { id: 'arrow', label: 'Arrow', shape: 'arrow', color: '#e4e4e7' },
        { id: 'diamond', label: 'Diamond', shape: 'diamond', color: '#fbbf24' },
        { id: 'process', label: 'Rectangle', shape: 'process', color: '#67e8f9' },
        { id: 'decision', label: 'Decision', shape: 'decision', color: '#fbbf24' },
        { id: 'terminator', label: 'Capsule', shape: 'terminator', color: '#86efac' },
        { id: 'data', label: 'Parallelogram', shape: 'data', color: '#7dd3fc' },
        { id: 'document', label: 'Document', shape: 'document', color: '#c4b5fd' },
        { id: 'note', label: 'Note', shape: 'note', color: '#f3e08a' },
        { id: 'person', label: 'Person', shape: 'ellipse', color: '#67e8f9' },
        { id: 'evidence', label: 'Evidence', shape: 'data', color: '#fbbf24' },
        { id: 'image', label: 'Image', shape: 'image', color: '#c4b5fd' },
        { id: 'draw', label: 'Draw', shape: 'draw', color: '#e4e4e7' },
        { id: 'frame', label: 'Frame', shape: 'frame', color: '#a1a1aa' },
        { id: 'embed', label: 'Embed', shape: 'embed', color: '#67e8f9' },
        { id: 'web', label: 'Website', shape: 'terminator', color: '#86efac' },
        { id: 'event', label: 'Event', shape: 'decision', color: '#fda4af' },
        { id: 'text', label: 'Text', shape: 'note', color: '#e4e4e7' },
        { id: 'finding', label: 'Finding', shape: 'document', color: '#86efac' },
        { id: 'question', label: 'Question', shape: 'decision', color: '#fbbf24' }
    ];

    const BOARD_PLACE = ['square', 'circle', 'triangle', 'diamond', 'line', 'arrow', 'process', 'decision', 'terminator', 'data', 'document', 'note', 'person', 'evidence', 'image', 'frame', 'embed', 'web', 'event', 'text', 'finding', 'question'];
    const BOARD_GEO = ['square', 'circle', 'triangle', 'diamond', 'ellipse', 'decision', 'process', 'terminator', 'data', 'document', 'line', 'arrow', 'image', 'frame', 'embed'];
    const BOARD_HANDLES = ['nw', 'ne', 'se', 'sw'];
    const BOARD_PORTS = ['n', 'e', 's', 'w'];
    const BOARD_STROKES = ['#e4e4e7', '#a1a1aa', '#67e8f9', '#86efac', '#fbbf24', '#fda4af', '#c4b5fd'];
    const BOARD_FILLS = ['transparent', 'rgba(250,250,250,0.06)', 'rgba(103,232,249,0.12)', 'rgba(134,239,172,0.12)', 'rgba(251,191,36,0.12)', 'rgba(253,164,175,0.12)', 'rgba(196,181,253,0.12)'];
    const BOARD_WIDTHS = [1.25, 1.75, 2.75];
    const BOARD_W = 4800;
    const BOARD_H = 3600;
    const BOARD_ICONS = {
        square: '<rect x="5" y="5" width="14" height="14" rx="1.5"/>',
        diamond: '<path d="M12 4 20 12 12 20 4 12z"/>',
        circle: '<circle cx="12" cy="12" r="7"/>',
        triangle: '<path d="M12 5.5 20 18.5H4z"/>',
        line: '<path d="M4 12h16"/>',
        arrow: '<path d="M4 12h14"/><path d="M14 8l4 4-4 4"/>',
        draw: '<path d="M5 16c2-6 4-9 7-9 4 0 3 8 7 8"/>',
        eraser: '<path d="M7 15 15 7l3 3-8 8H7z"/><path d="M7 18h13"/>',
        undo: '<path d="M8 8H4v4"/><path d="M4 12a8 8 0 1 0 2.2-5.6"/>',
        redo: '<path d="M16 8h4v4"/><path d="M20 12a8 8 0 1 1-2.2-5.6"/>',
        text: '<text x="12" y="18" text-anchor="middle" font-family="Times New Roman, Times, serif" font-size="16" font-weight="700" fill="currentColor" stroke="none">A</text>',
        image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="M7 17l4-4 3 3 3-2 3 3"/>',
        note: '<rect x="5.5" y="4.5" width="13" height="15.5" rx="1"/><path d="M8 9.5h8M8 12.5h8M8 15.5h5"/><path d="M8.5 4.5h7v2.2h-7z"/>',
        person: '<circle cx="12" cy="8" r="3"/><path d="M6 19c1.2-3.2 3-4.5 6-4.5s4.8 1.3 6 4.5"/>',
        finding: '<path d="M7 4h10v14l-5-2-5 2z"/>',
        question: '<circle cx="12" cy="12" r="8"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.2 2.2c-.8.4-1.3 1-1.3 1.9"/><circle cx="12" cy="16.6" r="0.7"/>',
        document: '<path d="M7 4h8l4 4v12H7z"/><path d="M15 4v4h4"/><path d="M9 12h6M9 16h4"/>',
        connect: '<circle cx="6.5" cy="12" r="2.4"/><circle cx="17.5" cy="12" r="2.4"/><path d="M9 12h6"/>',
        grid: '<path d="M5 5h14v14H5z"/><path d="M5 12h14M12 5v14"/>',
        recenter: '<path d="M12 4v3M12 17v3M4 12h3M17 12h3"/><circle cx="12" cy="12" r="3"/>',
        duplicate: '<rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M6 14V5h9"/>',
        cut: '<path d="M7.5 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM7.5 19.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/><path d="M9.2 8.8 20 18M9.2 15.2 20 6"/>',
        copy: '<rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M6 14V5h9"/>',
        paste: '<path d="M8 8h8v12H8z"/><path d="M10 8V6h4v2"/>',
        lock: '<rect x="7" y="11" width="10" height="8" rx="1.5"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>',
        unlock: '<rect x="7" y="11" width="10" height="8" rx="1.5"/><path d="M9 11V8a3 3 0 0 1 6 0"/>',
        'flip-h': '<path d="M12 4v16"/><path d="M10 8 5 12l5 4M14 8l5 4-5 4"/>',
        'flip-v': '<path d="M4 12h16"/><path d="M8 10 12 5l4 5M8 14l4 5 4-5"/>',
        style: '<circle cx="12" cy="12" r="7"/><path d="M12 5v14"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.5.4l1.5-1.5a4.2 4.2 0 0 0-6-6L12 7"/><path d="M14 11a5 5 0 0 0-7.5-.4L5 12.1a4.2 4.2 0 0 0 6 6L12 17"/>',
        front: '<rect x="6" y="8" width="10" height="10" rx="1"/><path d="M9 6h10v10"/>',
        up: '<path d="M12 18V6"/><path d="M7 11l5-5 5 5"/>',
        down: '<path d="M12 6v12"/><path d="M7 13l5 5 5-5"/>',
        upload: '<path d="M12 16V7"/><path d="M8 10l4-4 4 4"/><path d="M6 18h12"/>',
        forward: '<path d="M12 18V6"/><path d="M7 11l5-5 5 5"/>',
        back: '<path d="M12 6v12"/><path d="M7 13l5 5 5-5"/>',
        'clear-links': '<path d="M6 12h12"/><path d="M9 9l-3 3 3 3M15 9l3 3-3 3"/>',
        detach: '<path d="M9 13a4 4 0 0 0 5.7.3L16 12a3.4 3.4 0 0 0-4.8-4.8L10 8.4"/><path d="M15 11a4 4 0 0 0-5.7-.3L8 12a3.4 3.4 0 0 0 4.8 4.8L14 15.6"/><path d="M6 6l12 12"/>',
        delete: '<path d="M6 8h12M10 8V6h4v2M9 8l.6 10h4.8L15 8"/>',
        calendar: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/>',
        clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>',
        details: '<rect x="6" y="4" width="12" height="16" rx="1.5"/><path d="M9 9h6M9 13h6M9 17h4"/>',
        mini: '<path d="M6 12h12"/>',
        expand: '<path d="M6 12h12"/><path d="M12 6v12"/>'
    };


    const REVERSE_ENGINES = [
        { id: 'lens', label: 'Google Lens', url: function (src) { return /^https?:\/\//i.test(src) ? 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(src) : 'https://lens.google.com/upload'; } },
        { id: 'yandex', label: 'Yandex Images', url: function (src) { return /^https?:\/\//i.test(src) ? 'https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(src) : 'https://yandex.com/images/'; } },
        { id: 'tineye', label: 'TinEye', url: function (src) { return /^https?:\/\//i.test(src) ? 'https://tineye.com/search?url=' + encodeURIComponent(src) : 'https://tineye.com/'; } },
        { id: 'bing', label: 'Bing Visual', url: function (src) { return /^https?:\/\//i.test(src) ? 'https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:' + encodeURIComponent(src) : 'https://www.bing.com/visualsearch'; } }
    ];

    const DNS_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA'];

    const DOMAIN_TOOL_LINKS = [
        ['WHOIS', 'https://who.is/whois/'],
        ['RDAP', 'https://rdap.org/domain/'],
        ['crt.sh', 'https://crt.sh/?q='],
        ['SecurityTrails', 'https://securitytrails.com/domain/'],
        ['ViewDNS', 'https://viewdns.info/whois/?domain='],
        ['DNSdumpster', 'https://dnsdumpster.com/'],
        ['urlscan', 'https://urlscan.io/domain/'],
        ['Wayback', 'https://web.archive.org/web/*/'],
        ['BuiltWith', 'https://builtwith.com/'],
        ['Wappalyzer', 'https://www.wappalyzer.com/lookup/'],
        ['VirusTotal', 'https://www.virustotal.com/gui/domain/'],
        ['urlscan search', 'https://urlscan.io/search/#']
    ];

    let host = null;

    function settingValue(key, fallback) {
        if (window.OrbINTSettings) {
            const value = OrbINTSettings.get(key);
            return value === undefined ? fallback : value;
        }
        try {
            const saved = JSON.parse(localStorage.getItem('orbint-settings') || '');
            if (saved && saved[key] !== undefined) return saved[key];
        } catch (error) {}
        return fallback;
    }

    let page = 'orbit';
    let pageAnimTimer = 0;
    let pageSwitchReady = false;
    const PAGE_ANIM_MS = 420;
    let data = emptyInvestigation();
    let persistTimer = 0;
    let selectedEvent = '';
    let connectFrom = '';
    let timelineConnectOn = false;
    let calState = null;
    let timeState = null;
    let infoState = null;
    let tlFocusAfter = null;
    let boardTool = 'select';
    let boardConnect = '';
    let boardConnectPort = '';
    let boardSelected = '';
    let boardLinkSelected = '';
    let boardDropAt = null;
    let boardPointerAt = { x: 180, y: 140 };
    let boardMenuMode = 'canvas';
    let boardDrift = { x: 0, y: 0 };
    let boardClip = null;
    let boardStyleClip = null;
    let boardToolLock = false;
    let boardPicked = [];
    let boardPickedLinks = [];
    let boardPaintFill = 'rgba(103,232,249,0.12)';
    let boardDrawToShape = false;
    let laserPts = [];
    let laserRaf = 0;
    let boardUndo = [];
    let boardRedo = [];
    let boardHistMerge = '';
    let boardHistMergeTimer = 0;
    let tlUndo = [];
    let tlRedo = [];
    let tlHistMerge = '';
    let tlHistMergeTimer = 0;
    let histQuiet = false;
    let timelineZoom = 1;
    let timelinePhotoId = '';
    let tlClip = null;
    let tlMenuId = '';
    let tlDropAt = null;
    let tlSizeObs = null;
    let tlIslandHide = 0;
    let domainBusy = false;

    function emptyInvestigation() {
        return {
            timeline: [],
            timelineView: { x: 48, y: 40, z: 1 },
            evidence: [],
            whiteboard: { x: 0, y: 0, z: 1, nodes: [], links: [], grid: true },
            harvester: { files: [], hits: [], ready: false, view: 'split', split: 50 },
            flowchart: { preset: 'username', checks: {}, notes: {} },
            intel: { host: '' }
        };
    }

    function uid(prefix) {
        return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function esc(text) {
        if (host && host.escapeHtml) return host.escapeHtml(text);
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function boardIcon(name) {
        const d = BOARD_ICONS[name];
        if (!d) return '';
        return '<svg class="board-mi" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
    }

    function menuItem(attrs, icon, label, extra) {
        return '<button type="button" ' + attrs + '>' + boardIcon(icon) + '<span>' + label + '</span>' + (extra || '') + '</button>';
    }

    function $(id) {
        return document.getElementById(id);
    }

    function profile() {
        return (host && host.getProfile && host.getProfile()) || { facts: {} };
    }

    function fields() {
        return (host && host.getFields && host.getFields()) || [];
    }

    function firstValue(id) {
        return (host && host.firstValue && host.firstValue(id)) || '';
    }

    function platformById(id) {
        return host && host.platformById ? host.platformById(id) : null;
    }

    function imageItems() {
        return (host && host.imageGalleryItems && host.imageGalleryItems()) || [];
    }

    function schedulePersist() {
        scheduleDatasheet();
        clearTimeout(persistTimer);
        persistTimer = setTimeout(function () {
            persistTimer = 0;
            if (host && host.save) host.save();
        }, 160);
    }

    function boardStateJson() {
        return JSON.stringify({
            nodes: data.whiteboard.nodes || [],
            links: data.whiteboard.links || [],
            selected: boardSelected || '',
            picked: boardPicked || [],
            link: boardLinkSelected || ''
        });
    }

    function timelineStateJson() {
        return JSON.stringify({
            events: data.timeline || [],
            view: data.timelineView || { x: 48, y: 40, z: 1 },
            selected: selectedEvent || '',
            connectFrom: connectFrom || '',
            connectOn: !!timelineConnectOn
        });
    }

    function syncBoardHistory() {
        const undo = $('dockUndo');
        const redo = $('dockRedo');
        if (page === 'whiteboard') {
            if (undo) {
                undo.disabled = !boardUndo.length;
                undo.setAttribute('data-tip', 'Undo (Ctrl+Z)');
                undo.setAttribute('aria-label', 'Undo');
            }
            if (redo) {
                redo.disabled = !boardRedo.length;
                redo.setAttribute('data-tip', 'Redo (Ctrl+Y)');
                redo.setAttribute('aria-label', 'Redo');
            }
            return;
        }
        if (page === 'timeline') {
            if (undo) {
                undo.disabled = !tlUndo.length;
                undo.setAttribute('data-tip', 'Undo (Ctrl+Z)');
                undo.setAttribute('aria-label', 'Undo');
            }
            if (redo) {
                redo.disabled = !tlRedo.length;
                redo.setAttribute('data-tip', 'Redo (Ctrl+Y)');
                redo.setAttribute('aria-label', 'Redo');
            }
            return;
        }
        window.dispatchEvent(new CustomEvent('orbint-history'));
    }

    function rememberTimeline(mergeKey) {
        if (histQuiet) return;
        const snap = timelineStateJson();
        if (mergeKey && tlHistMerge === mergeKey) {
            syncBoardHistory();
            return;
        }
        if (tlUndo.length && tlUndo[tlUndo.length - 1] === snap) {
            tlHistMerge = mergeKey || '';
            syncBoardHistory();
            return;
        }
        tlUndo.push(snap);
        if (tlUndo.length > 100) tlUndo.shift();
        tlRedo = [];
        tlHistMerge = mergeKey || '';
        if (tlHistMergeTimer) clearTimeout(tlHistMergeTimer);
        if (mergeKey) {
            tlHistMergeTimer = setTimeout(function () { tlHistMerge = ''; }, 900);
        }
        syncBoardHistory();
    }

    function applyTimelineSnapshot(raw) {
        const prev = typeof raw === 'string' ? JSON.parse(raw) : raw;
        histQuiet = true;
        data.timeline = JSON.parse(JSON.stringify(prev.events || []));
        if (prev.view && typeof prev.view === 'object') {
            data.timelineView = {
                x: Number(prev.view.x) || 0,
                y: Number(prev.view.y) || 0,
                z: Number(prev.view.z) > 0 ? Number(prev.view.z) : 1
            };
        }
        selectedEvent = prev.selected || '';
        connectFrom = prev.connectFrom || '';
        timelineConnectOn = !!prev.connectOn;
        renderTimeline();
        schedulePersist();
        histQuiet = false;
        syncBoardHistory();
    }

    function undoTimeline() {
        if (!tlUndo.length) return;
        tlHistMerge = '';
        tlRedo.push(timelineStateJson());
        applyTimelineSnapshot(tlUndo.pop());
    }

    function redoTimeline() {
        if (!tlRedo.length) return;
        tlHistMerge = '';
        tlUndo.push(timelineStateJson());
        applyTimelineSnapshot(tlRedo.pop());
    }

    function rememberBoard(mergeKey) {
        if (histQuiet) return;
        const snap = boardStateJson();
        if (mergeKey && boardHistMerge === mergeKey) {
            syncBoardHistory();
            return;
        }
        if (boardUndo.length && boardUndo[boardUndo.length - 1] === snap) {
            boardHistMerge = mergeKey || '';
            syncBoardHistory();
            return;
        }
        boardUndo.push(snap);
        if (boardUndo.length > 100) boardUndo.shift();
        boardRedo = [];
        boardHistMerge = mergeKey || '';
        if (boardHistMergeTimer) clearTimeout(boardHistMergeTimer);
        if (mergeKey) {
            boardHistMergeTimer = setTimeout(function () { boardHistMerge = ''; }, 900);
        }
        syncBoardHistory();
    }

    function applyBoardSnapshot(raw) {
        const prev = typeof raw === 'string' ? JSON.parse(raw) : raw;
        data.whiteboard.nodes = (prev.nodes || []).map(normalizeBoardNode);
        data.whiteboard.links = (prev.links || []).map(normalizeLink);
        boardSelected = prev.selected || '';
        boardPicked = Array.isArray(prev.picked) && prev.picked.length ? prev.picked.slice() : (boardSelected ? [boardSelected] : []);
        boardLinkSelected = prev.link || '';
        if (boardSelected && !findBoardNode(boardSelected)) {
            boardSelected = '';
            boardPicked = [];
        }
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
        syncBoardHistory();
    }

    function undoBoard() {
        if (!boardUndo.length) return;
        boardHistMerge = '';
        boardRedo.push(boardStateJson());
        applyBoardSnapshot(boardUndo.pop());
    }

    function redoBoard() {
        if (!boardRedo.length) return;
        boardHistMerge = '';
        boardUndo.push(boardStateJson());
        applyBoardSnapshot(boardRedo.pop());
    }

    function finishBoardTool() {
        if (boardToolLock) return;
        if (boardTool === 'select' || boardTool === 'pan' || boardTool === 'connect' || boardTool === 'eraser' || boardTool === 'laser' || boardTool === 'lasso' || boardTool === 'bucket') return;
        boardTool = 'select';
        boardDrawToShape = false;
        syncBoardTools();
    }

    function typeMeta(type) {
        return BOARD_TYPES.find(function (item) { return item.id === type; }) || BOARD_TYPES[0];
    }

    function isGeoShape(shape) {
        return BOARD_GEO.indexOf(shape) >= 0;
    }

    function isStrokeShape(shape) {
        return shape === 'line' || shape === 'arrow';
    }

    function isStrokeRec(rec) {
        return !!(rec && isStrokeShape(rec.shape || rec.type));
    }

    function layoutStroke(rec) {
        if (!isStrokeRec(rec)) return;
        if (rec.x1 == null || rec.y1 == null || rec.x2 == null || rec.y2 == null) {
            rec.x1 = (rec.x || 0) + (rec.flipX ? (rec.w || 0) : 0);
            rec.y1 = (rec.y || 0) + (rec.flipY ? (rec.h || 0) : 0);
            rec.x2 = (rec.x || 0) + (rec.flipX ? 0 : (rec.w || 0));
            rec.y2 = (rec.y || 0) + (rec.flipY ? 0 : (rec.h || 0));
        }
        rec.startId = rec.startId || '';
        rec.startPort = rec.startPort || '';
        rec.endId = rec.endId || '';
        rec.endPort = rec.endPort || '';
        const pad = 12;
        const minx = Math.min(rec.x1, rec.x2);
        const miny = Math.min(rec.y1, rec.y2);
        rec.x = minx - pad;
        rec.y = miny - pad;
        rec.w = Math.max(1, Math.abs(rec.x2 - rec.x1) + pad * 2);
        rec.h = Math.max(1, Math.abs(rec.y2 - rec.y1) + pad * 2);
    }

    function followStrokeBinds(rec) {
        if (!isStrokeRec(rec)) return;
        if (rec.startId && rec.startPort) {
            const n = findBoardNode(rec.startId);
            if (n && n.id !== rec.id) {
                const p = portPoint(n, rec.startPort);
                rec.x1 = p.x;
                rec.y1 = p.y;
            } else {
                rec.startId = '';
                rec.startPort = '';
            }
        }
        if (rec.endId && rec.endPort) {
            const n = findBoardNode(rec.endId);
            if (n && n.id !== rec.id) {
                const p = portPoint(n, rec.endPort);
                rec.x2 = p.x;
                rec.y2 = p.y;
            } else {
                rec.endId = '';
                rec.endPort = '';
            }
        }
    }

    function followAllStrokes(exceptId) {
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (!isStrokeRec(n) || n.id === exceptId) return;
            followStrokeBinds(n);
            layoutStroke(n);
            const el = document.querySelector('#boardStage [data-node="' + n.id + '"]');
            if (el) applyNodeBox(el, n);
        });
    }

    function nearestBind(world, skipId) {
        const z = (data.whiteboard && data.whiteboard.z) || 1;
        const max = 28 / z;
        let best = null;
        let bestD = max;
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (!n || n.id === skipId || isStrokeRec(n) || n.shape === 'draw' || n.type === 'draw') return;
            BOARD_PORTS.forEach(function (port) {
                const pt = portPoint(n, port);
                const d = Math.hypot(pt.x - world.x, pt.y - world.y);
                if (d <= bestD) {
                    bestD = d;
                    best = { id: n.id, port: port, x: pt.x, y: pt.y };
                }
            });
        });
        return best;
    }

    function snapAxis(from, to, shift) {
        if (!shift || !from || !to) return to;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const step = Math.PI / 4;
        const ang = Math.round(Math.atan2(dy, dx) / step) * step;
        return { x: from.x + Math.cos(ang) * len, y: from.y + Math.sin(ang) * len };
    }

    function setStrokeSnap(hit) {
        const view = $('boardView');
        if (view) view.classList.add('is-snap');
        if (hit) markBoardPorts('', '', hit.id, hit.port);
        else markBoardPorts('', '', '', '');
    }

    function clearStrokeSnap() {
        const view = $('boardView');
        if (view && boardTool !== 'connect') view.classList.remove('is-snap');
        if (boardTool !== 'connect') markBoardPorts('', '', '', '');
    }

    function setStrokePoint(rec, which, world, snap) {
        if (!rec) return;
        const hit = snap ? nearestBind(world, rec.id) : null;
        if (which === 'start') {
            rec.startId = hit ? hit.id : '';
            rec.startPort = hit ? hit.port : '';
            rec.x1 = hit ? hit.x : world.x;
            rec.y1 = hit ? hit.y : world.y;
        } else {
            rec.endId = hit ? hit.id : '';
            rec.endPort = hit ? hit.port : '';
            rec.x2 = hit ? hit.x : world.x;
            rec.y2 = hit ? hit.y : world.y;
        }
        layoutStroke(rec);
        setStrokeSnap(hit);
    }

    function strokeEnds(rec) {
        layoutStroke(rec);
        return {
            w: rec.w,
            h: rec.h,
            x1: rec.x1 - rec.x,
            y1: rec.y1 - rec.y,
            x2: rec.x2 - rec.x,
            y2: rec.y2 - rec.y
        };
    }

    function arrowHeadPoints(x1, y1, x2, y2, size) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const s = size || 12;
        const bx = x2 - ux * s;
        const by = y2 - uy * s;
        const hw = s * 0.55;
        return x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' +
            (bx - uy * hw).toFixed(1) + ',' + (by + ux * hw).toFixed(1) + ' ' +
            (bx + uy * hw).toFixed(1) + ',' + (by - ux * hw).toFixed(1);
    }

    function strokeInner(rec) {
        const e = strokeEnds(rec);
        const dx = e.x2 - e.x1;
        const dy = e.y2 - e.y1;
        const len = Math.hypot(dx, dy) || 1;
        const back = rec && rec.shape === 'arrow' ? Math.min(12, len * 0.35) : 0;
        let html = '<line class="wb-hit" x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) +
            '" x2="' + e.x2.toFixed(1) + '" y2="' + e.y2.toFixed(1) + '"/>';
        html += '<line class="wb-shape" x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) +
            '" x2="' + (e.x2 - dx / len * back).toFixed(1) + '" y2="' + (e.y2 - dy / len * back).toFixed(1) + '"/>';
        if (rec && rec.shape === 'arrow') {
            html += '<polygon class="wb-arrowhead" points="' + arrowHeadPoints(e.x1, e.y1, e.x2, e.y2, 12) + '"/>';
        }
        return html;
    }

    function syncStrokeChrome(el, rec) {
        if (!el || !isStrokeRec(rec)) return;
        const svg = el.querySelector('.wb-geo');
        if (!svg) return;
        const e = strokeEnds(rec);
        svg.setAttribute('viewBox', '0 0 ' + e.w + ' ' + e.h);
        svg.setAttribute('width', String(e.w));
        svg.setAttribute('height', String(e.h));
        const dx = e.x2 - e.x1;
        const dy = e.y2 - e.y1;
        const len = Math.hypot(dx, dy) || 1;
        const back = rec.shape === 'arrow' ? Math.min(12, len * 0.35) : 0;
        const hit = svg.querySelector('line.wb-hit');
        if (hit) {
            hit.setAttribute('x1', e.x1.toFixed(1));
            hit.setAttribute('y1', e.y1.toFixed(1));
            hit.setAttribute('x2', e.x2.toFixed(1));
            hit.setAttribute('y2', e.y2.toFixed(1));
        }
        const line = svg.querySelector('line.wb-shape');
        if (line) {
            line.setAttribute('x1', e.x1.toFixed(1));
            line.setAttribute('y1', e.y1.toFixed(1));
            line.setAttribute('x2', (e.x2 - dx / len * back).toFixed(1));
            line.setAttribute('y2', (e.y2 - dy / len * back).toFixed(1));
        }
        const head = svg.querySelector('.wb-arrowhead');
        if (head) head.setAttribute('points', arrowHeadPoints(e.x1, e.y1, e.x2, e.y2, 12));
        positionStrokeHandles(el, rec);
    }

    function positionStrokeHandles(el, rec) {
        if (!el || !rec) return;
        const e = strokeEnds(rec);
        const w = rec.w || 1;
        const h = rec.h || 1;
        const start = el.querySelector('[data-handle="start"]');
        const end = el.querySelector('[data-handle="end"]');
        if (start) {
            start.style.left = ((e.x1 / w) * 100) + '%';
            start.style.top = ((e.y1 / h) * 100) + '%';
        }
        if (end) {
            end.style.left = ((e.x2 / w) * 100) + '%';
            end.style.top = ((e.y2 / h) * 100) + '%';
        }
    }

    function shapeRadius(rec) {
        const shape = rec && (rec.shape || rec.type);
        if (rec && rec.radius != null && rec.radius !== '' && !isNaN(Number(rec.radius))) {
            return Math.max(0, Math.min(50, Number(rec.radius)));
        }
        if (rec && rec.edge === 'sharp') return 0;
        if (shape === 'circle' || shape === 'ellipse' || shape === 'terminator') return 50;
        return 12;
    }

    function shapeBoxSize(rec) {
        const size = shapeSize(rec);
        return { w: Math.max(8, size.w), h: Math.max(8, size.h) };
    }

    function isRoundRectShape(shape) {
        return shape === 'square' || shape === 'circle' || shape === 'ellipse' || shape === 'process' || shape === 'terminator' || shape === 'frame' || shape === 'image' || shape === 'embed';
    }

    function cornerRadiusPx(rec, w, h) {
        const pad = 1.5;
        const innerW = Math.max(0, w - pad * 2);
        const innerH = Math.max(0, h - pad * 2);
        const n = shapeRadius(rec);
        const shape = (rec && (rec.shape || rec.type)) || '';
        if (n <= 0) return { rx: 0, ry: 0, innerW: innerW, innerH: innerH, pad: pad };
        if (shape === 'circle' || shape === 'ellipse') {
            return { rx: innerW / 2, ry: innerH / 2, innerW: innerW, innerH: innerH, pad: pad };
        }
        const maxR = Math.min(innerW, innerH) / 2;
        const px = n >= 50 ? maxR : Math.min(maxR, n);
        return { rx: px, ry: px, innerW: innerW, innerH: innerH, pad: pad };
    }

    function applyShapeRadius(el, rec) {
        if (!el || !rec) return;
        rec.edge = shapeRadius(rec) < 1 ? 'sharp' : 'round';
        const geo = el.querySelector('.wb-geo');
        const shapeEl = geo && geo.querySelector('.wb-shape');
        el.style.setProperty('--wb-lc', shapeRadius(rec) < 1 ? 'butt' : 'round');
        el.style.setProperty('--wb-lj', shapeRadius(rec) < 1 ? 'miter' : 'round');
        if (!geo || !shapeEl || geo.classList.contains('wb-stroke') || geo.classList.contains('wb-ink')) return;
        if (String(shapeEl.tagName).toLowerCase() !== 'rect') return;
        const size = shapeBoxSize(rec);
        const r = cornerRadiusPx(rec, size.w, size.h);
        geo.setAttribute('viewBox', '0 0 ' + size.w + ' ' + size.h);
        geo.setAttribute('width', String(size.w));
        geo.setAttribute('height', String(size.h));
        shapeEl.setAttribute('x', String(r.pad));
        shapeEl.setAttribute('y', String(r.pad));
        shapeEl.setAttribute('width', String(r.innerW));
        shapeEl.setAttribute('height', String(r.innerH));
        shapeEl.setAttribute('rx', String(r.rx));
        shapeEl.setAttribute('ry', String(r.ry));
    }

    function setBoardRadius(value) {
        const rec = findBoardNode(boardSelected);
        if (!rec || rec.locked || isStrokeRec(rec)) return;
        const next = Math.max(0, Math.min(50, Math.round(Number(value))));
        if (isNaN(next)) return;
        rememberBoard('radius:' + rec.id);
        rec.radius = next;
        rec.edge = next < 1 ? 'sharp' : 'round';
        const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
        applyShapeRadius(el, rec);
        const slider = $('boardRadius');
        if (slider && document.activeElement !== slider) slider.value = String(next);
        schedulePersist();
    }

    function shapeChrome(shape, rec) {
        if (!isGeoShape(shape)) return '';
        if (isStrokeShape(shape)) {
            const e = strokeEnds(rec);
            return '<svg class="wb-geo wb-stroke" width="' + e.w + '" height="' + e.h + '" viewBox="0 0 ' + e.w + ' ' + e.h + '" preserveAspectRatio="xMinYMin meet" overflow="visible" aria-hidden="true">' +
                strokeInner(Object.assign({}, rec, { shape: shape })) + '</svg>';
        }
        const size = shapeBoxSize(rec);
        if (isRoundRectShape(shape)) {
            const r = cornerRadiusPx(Object.assign({}, rec || {}, { shape: shape }), size.w, size.h);
            return '<svg class="wb-geo" viewBox="0 0 ' + size.w + ' ' + size.h + '" width="' + size.w + '" height="' + size.h + '" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' +
                '<rect class="wb-shape" x="' + r.pad + '" y="' + r.pad + '" width="' + r.innerW + '" height="' + r.innerH + '" rx="' + r.rx + '" ry="' + r.ry + '"/>' +
                '</svg>';
        }
        let inner = '<rect class="wb-shape" x="1.5" y="1.5" width="97" height="97" rx="0" ry="0"/>';
        if (shape === 'triangle') inner = '<polygon class="wb-shape" points="50,1.5 98.5,98.5 1.5,98.5"/>';
        else if (shape === 'diamond' || shape === 'decision') inner = '<polygon class="wb-shape" points="50,1.5 98.5,50 50,98.5 1.5,50"/>';
        else if (shape === 'data') inner = '<polygon class="wb-shape" points="12,1.5 98.5,1.5 88,98.5 1.5,98.5"/>';
        else if (shape === 'document') inner = '<path class="wb-shape" d="M1.5 1.5 H98.5 V78 C84 92 66 72 50 84 C34 96 18 74 1.5 82 Z"/>';
        else if (shape === 'note') {
            inner = '<path class="wb-shape" d="M1.5 1.5 H72 L98.5 28 V98.5 H1.5 Z"/>' +
                '<path class="wb-fold" d="M72 1.5 V28 H98.5"/>';
        }
        return '<svg class="wb-geo" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' + inner + '</svg>';
    }

    function inkPath(pts) {
        if (!pts || !pts.length) return 'M0 0';
        const clean = [];
        pts.forEach(function (p) {
            const prev = clean[clean.length - 1];
            if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 0.7) clean.push(p);
        });
        if (!clean.length) return 'M0 0';
        if (clean.length === 1) return 'M' + clean[0][0].toFixed(1) + ' ' + clean[0][1].toFixed(1);
        let d = 'M' + clean[0][0].toFixed(1) + ' ' + clean[0][1].toFixed(1);
        if (clean.length === 2) return d + ' L' + clean[1][0].toFixed(1) + ' ' + clean[1][1].toFixed(1);
        function at(i) {
            return clean[Math.max(0, Math.min(clean.length - 1, i))];
        }
        for (let i = 0; i < clean.length - 1; i++) {
            const p0 = at(i - 1);
            const p1 = at(i);
            const p2 = at(i + 1);
            const p3 = at(i + 2);
            d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
                (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
                p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
        }
        return d;
    }

    function inkChrome(node) {
        const w = Math.max(8, Number(node.w) || 8);
        const h = Math.max(8, Number(node.h) || 8);
        return '<svg class="wb-geo wb-ink" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" overflow="visible" aria-hidden="true">' +
            '<path class="wb-shape" d="' + inkPath(node.pts) + '" fill="none"/>' +
            '</svg>';
    }

    function growInk(rec, world) {
        const pad = 10;
        let x = world.x - rec.x;
        let y = world.y - rec.y;
        let dx = 0;
        let dy = 0;
        if (x < pad) { dx = pad - x; rec.x -= dx; rec.w += dx; x += dx; }
        if (y < pad) { dy = pad - y; rec.y -= dy; rec.h += dy; y += dy; }
        if (x > rec.w - pad) rec.w = x + pad;
        if (y > rec.h - pad) rec.h = y + pad;
        if (dx || dy) rec.pts = (rec.pts || []).map(function (p) { return [p[0] + dx, p[1] + dy]; });
        rec.pts = rec.pts || [];
        rec.pts.push([x, y]);
    }

    function applyNodeBox(el, node) {
        if (!el || !node) return;
        const size = shapeSize(node);
        el.style.left = (node.x || 0) + 'px';
        el.style.top = (node.y || 0) + 'px';
        el.style.width = size.w + 'px';
        el.style.height = size.h + 'px';
        el.style.setProperty('--wb-w', size.w + 'px');
        el.style.setProperty('--wb-h', size.h + 'px');
        el.style.setProperty('--wb-stroke', node.type === 'note' ? (node.stroke || '#c9a227') : (node.type === 'image' && !node.src ? '#3f3f46' : (node.stroke || '#e4e4e7')));
        el.style.setProperty('--wb-fill', node.type === 'note'
            ? (node.fill && node.fill !== 'transparent' && node.fill !== 'none' ? node.fill : '#f3e08a')
            : (node.type === 'image' && !node.src ? 'rgba(250,250,250,0.08)' : (size.shape === 'line' || size.shape === 'arrow' || !node.fill || node.fill === 'transparent' || node.fill === '#111113' ? 'none' : node.fill)));
        el.style.setProperty('--wb-sw', String(node.sw || 1.75));
        el.style.setProperty('--wb-op', String(node.op == null ? 1 : node.op));
        el.style.setProperty('--wb-dash', (node.type === 'image' && !node.src) ? '2.4 6' : node.dash === 'dashed' ? '8 6' : node.dash === 'dotted' ? '1.4 6' : 'none');
        el.style.setProperty('--wb-lc', shapeRadius(node) < 1 ? 'butt' : 'round');
        el.style.setProperty('--wb-lj', shapeRadius(node) < 1 ? 'miter' : 'round');
        el.style.setProperty('--wb-flip-x', node.flipX ? '-1' : '1');
        el.style.setProperty('--wb-flip-y', node.flipY ? '-1' : '1');
        el.querySelectorAll('img').forEach(function (img) { img.draggable = false; });
        syncStrokeChrome(el, node);
        applyShapeRadius(el, node);
    }

    function handleMarkup(shape, rec) {
        if (isStrokeShape(shape) || isStrokeRec(rec)) {
            const e = rec && rec.x1 != null ? strokeEnds(rec) : { x1: 0, y1: 0, x2: 1, y2: 0, w: 1, h: 1 };
            const w = e.w || 1;
            const h = e.h || 1;
            return '<div class="wb-handles is-stroke">' +
                '<span class="wb-handle" data-handle="start" style="left:' + ((e.x1 / w) * 100) + '%;top:' + ((e.y1 / h) * 100) + '%"></span>' +
                '<span class="wb-handle" data-handle="end" style="left:' + ((e.x2 / w) * 100) + '%;top:' + ((e.y2 / h) * 100) + '%"></span>' +
                '</div>';
        }
        return '<div class="wb-handles">' + BOARD_HANDLES.map(function (name) {
            return '<span class="wb-handle" data-handle="' + name + '"></span>';
        }).join('') + '</div>';
    }

    function portAnchor(shape, port) {
        const spots = {
            triangle: { n: [50, 1.5], e: [74.5, 50], s: [50, 98.5], w: [25.5, 50] },
            diamond: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            decision: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            circle: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            ellipse: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] },
            square: { n: [50, 1.5], e: [98.5, 50], s: [50, 98.5], w: [1.5, 50] }
        };
        const box = { n: [50, 0], e: [100, 50], s: [50, 100], w: [0, 50] };
        const pt = ((spots[shape] || box)[port] || box[port]);
        return { x: pt[0] / 100, y: pt[1] / 100 };
    }

    function portMarkup(shape) {
        if (isStrokeShape(shape)) return '';
        return '<div class="wb-ports">' + BOARD_PORTS.map(function (name) {
            const a = portAnchor(shape, name);
            return '<span class="wb-port" data-port="' + name + '" style="left:' + (a.x * 100) + '%;top:' + (a.y * 100) + '%"></span>';
        }).join('') + '</div>';
    }

    function portPoint(node, port) {
        const size = shapeSize(node);
        const a = portAnchor(node.shape || typeMeta(node.type).shape, port);
        return {
            x: (node.x || 0) + size.w * a.x,
            y: (node.y || 0) + size.h * a.y
        };
    }

    function portNormal(port, dist) {
        if (port === 'n') return { x: 0, y: -dist };
        if (port === 'e') return { x: dist, y: 0 };
        if (port === 's') return { x: 0, y: dist };
        return { x: -dist, y: 0 };
    }

    function inferPort(node, toward) {
        const size = shapeSize(node);
        const dx = toward.x - ((node.x || 0) + size.w / 2);
        const dy = toward.y - ((node.y || 0) + size.h / 2);
        if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'e' : 'w';
        return dy >= 0 ? 's' : 'n';
    }

    function nearestPort(node, point) {
        let best = 'n';
        let bestD = Infinity;
        BOARD_PORTS.forEach(function (port) {
            const pt = portPoint(node, port);
            const d = Math.hypot(pt.x - point.x, pt.y - point.y);
            if (d < bestD) {
                bestD = d;
                best = port;
            }
        });
        return best;
    }

    function linkWaypoints(p1, fromPort, p2, toPort) {
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        const gap = Math.min(56, Math.max(28, dist * 0.18));
        const a = { x: p1.x + portNormal(fromPort, gap).x, y: p1.y + portNormal(fromPort, gap).y };
        const b = { x: p2.x + portNormal(toPort, gap).x, y: p2.y + portNormal(toPort, gap).y };
        const fromH = fromPort === 'e' || fromPort === 'w';
        const toH = toPort === 'e' || toPort === 'w';
        const pts = [p1, a];
        if (fromH === toH) {
            if (fromH) {
                const midX = (a.x + b.x) / 2;
                pts.push({ x: midX, y: a.y }, { x: midX, y: b.y });
            } else {
                const midY = (a.y + b.y) / 2;
                pts.push({ x: a.x, y: midY }, { x: b.x, y: midY });
            }
        } else if (fromH) {
            pts.push({ x: b.x, y: a.y });
        } else {
            pts.push({ x: a.x, y: b.y });
        }
        pts.push(b, p2);
        const clean = [];
        pts.forEach(function (p) {
            const prev = clean[clean.length - 1];
            if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 0.6) clean.push(p);
        });
        return clean;
    }

    function roundedPolyline(pts, radius) {
        if (!pts || pts.length < 2) return 'M0 0';
        if (pts.length === 2) return 'M' + pts[0].x + ' ' + pts[0].y + ' L' + pts[1].x + ' ' + pts[1].y;
        let d = 'M' + pts[0].x + ' ' + pts[0].y;
        for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            const next = pts[i + 1];
            const d1 = Math.hypot(cur.x - prev.x, cur.y - prev.y) || 1;
            const d2 = Math.hypot(next.x - cur.x, next.y - cur.y) || 1;
            const r = Math.min(radius, d1 / 2, d2 / 2);
            d += ' L' + (cur.x - (cur.x - prev.x) / d1 * r) + ' ' + (cur.y - (cur.y - prev.y) / d1 * r);
            d += ' Q' + cur.x + ' ' + cur.y + ' ' +
                (cur.x + (next.x - cur.x) / d2 * r) + ' ' + (cur.y + (next.y - cur.y) / d2 * r);
        }
        const last = pts[pts.length - 1];
        return d + ' L' + last.x + ' ' + last.y;
    }

    function linkPath(p1, fromPort, p2, toPort) {
        if (!p1 || !p2) return 'M0 0';
        return 'M' + p1.x + ' ' + p1.y + ' L' + p2.x + ' ' + p2.y;
    }

    function setLinkDraft(d, on) {
        const svg = $('boardLinks');
        if (!svg) return;
        let el = svg.querySelector('#boardLinkDraft');
        if (!el) {
            el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            el.setAttribute('id', 'boardLinkDraft');
            el.setAttribute('fill', 'none');
            svg.appendChild(el);
        }
        el.setAttribute('d', d || 'M0 0');
        el.setAttribute('opacity', on ? '1' : '0');
    }

    function markBoardPorts(fromId, fromPort, toId, toPort) {
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (node) {
            node.classList.toggle('is-aim', !!(toId && node.dataset.node === toId));
        });
        stage.querySelectorAll('.wb-port').forEach(function (el) {
            const node = el.closest('.wb-node');
            const id = node ? node.dataset.node : '';
            const port = el.getAttribute('data-port');
            el.classList.toggle('is-from', !!(fromId && id === fromId && port === fromPort));
            el.classList.toggle('is-target', !!(toId && id === toId && port === toPort));
        });
    }

    function portFromDelta(from, to) {
        const dx = (to && to.x || 0) - (from && from.x || 0);
        const dy = (to && to.y || 0) - (from && from.y || 0);
        if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'e' : 'w';
        return dy >= 0 ? 's' : 'n';
    }

    function dashFor(dash) {
        if (dash === 'dashed') return '8 6';
        if (dash === 'dotted') return '1.6 5';
        return '';
    }

    function markerKey(color) {
        return 'wbarr' + String(color || 'd4d4d8').replace(/[^a-zA-Z0-9]/g, '');
    }

    function normalizeLink(raw) {
        const link = raw || {};
        if (!link.id) link.id = uid('lk');
        link.from = link.from || '';
        link.to = link.to || '';
        link.fromPort = link.fromPort || '';
        link.toPort = link.toPort || '';
        link.x1 = Number(link.x1) || 0;
        link.y1 = Number(link.y1) || 0;
        link.x2 = Number(link.x2) || 0;
        link.y2 = Number(link.y2) || 0;
        link.stroke = link.stroke || '#d4d4d8';
        link.sw = Number(link.sw) > 0 ? Number(link.sw) : 1.7;
        link.op = link.op == null ? 1 : Math.max(0, Math.min(1, Number(link.op)));
        link.dash = link.dash === 'dashed' || link.dash === 'dotted' ? link.dash : 'solid';
        link.label = link.label || '';
        return link;
    }

    function findBoardLink(id) {
        if (!id) return null;
        return (data.whiteboard.links || []).find(function (l) { return l.id === id; }) || null;
    }

    function linkEnds(link) {
        const a = link && link.from ? findBoardNode(link.from) : null;
        const b = link && link.to ? findBoardNode(link.to) : null;
        let fromPort = (link && link.fromPort) || '';
        let toPort = (link && link.toPort) || '';
        let p1;
        let p2;
        if (a) {
            if (!fromPort && b) {
                const sb = shapeSize(b);
                fromPort = inferPort(a, { x: (b.x || 0) + sb.w / 2, y: (b.y || 0) + sb.h / 2 });
            }
            p1 = portPoint(a, fromPort || 'e');
        } else {
            p1 = { x: Number(link && link.x1) || 0, y: Number(link && link.y1) || 0 };
        }
        if (b) {
            if (!toPort && a) {
                const sa = shapeSize(a);
                toPort = inferPort(b, { x: (a.x || 0) + sa.w / 2, y: (a.y || 0) + sa.h / 2 });
            }
            p2 = portPoint(b, toPort || 'w');
        } else {
            p2 = { x: Number(link && link.x2) || 0, y: Number(link && link.y2) || 0 };
        }
        if (!a) fromPort = portFromDelta(p1, p2);
        if (!b) toPort = portFromDelta(p2, p1);
        return { p1: p1, p2: p2, fromPort: fromPort || 'e', toPort: toPort || 'w' };
    }

    function setLinkPoint(link, which, world, snap) {
        if (!link) return;
        const skip = which === 'start' ? link.to : link.from;
        let hit = snap ? nearestBind(world, skip) : null;
        if (hit && hit.id === skip) hit = null;
        if (which === 'start') {
            link.from = hit ? hit.id : '';
            link.fromPort = hit ? hit.port : '';
            link.x1 = hit ? hit.x : world.x;
            link.y1 = hit ? hit.y : world.y;
        } else {
            link.to = hit ? hit.id : '';
            link.toPort = hit ? hit.port : '';
            link.x2 = hit ? hit.x : world.x;
            link.y2 = hit ? hit.y : world.y;
        }
        setStrokeSnap(hit);
    }

    function addBoardLink(from, fromPort, to, toPort) {
        if (!from || !to || from === to) return;
        const links = data.whiteboard.links || [];
        const dup = links.some(function (l) {
            return l.from === from && l.to === to && (l.fromPort || '') === (fromPort || '') && (l.toPort || '') === (toPort || '');
        });
        if (dup) return;
        rememberBoard();
        links.push(normalizeLink({ from: from, to: to, fromPort: fromPort || 'e', toPort: toPort || 'w', label: '' }));
        data.whiteboard.links = links;
        renderWhiteboard();
        schedulePersist();
    }

    function clearBoardLinks(id) {
        if (!id) return;
        const links = data.whiteboard.links || [];
        const next = links.filter(function (l) { return l.from !== id && l.to !== id; });
        if (next.length === links.length) return;
        rememberBoard();
        data.whiteboard.links = next;
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
    }

    function deleteBoardLink(id) {
        if (!id) return;
        const links = data.whiteboard.links || [];
        if (!links.some(function (l) { return l.id === id; })) return;
        rememberBoard();
        data.whiteboard.links = links.filter(function (l) { return l.id !== id; });
        if (boardLinkSelected === id) boardLinkSelected = '';
        renderWhiteboard();
        schedulePersist();
    }

    function detachBoardLink(id, which) {
        const link = findBoardLink(id);
        if (!link) return;
        if (!link.from && !link.to) return;
        rememberBoard();
        const ends = linkEnds(link);
        link.x1 = ends.p1.x;
        link.y1 = ends.p1.y;
        link.x2 = ends.p2.x;
        link.y2 = ends.p2.y;
        if (!which || which === 'both' || which === 'start') {
            link.from = '';
            link.fromPort = '';
        }
        if (!which || which === 'both' || which === 'end') {
            link.to = '';
            link.toPort = '';
        }
        renderWhiteboard();
        schedulePersist();
    }

    function duplicateBoardLink(id) {
        const link = findBoardLink(id);
        if (!link) return;
        rememberBoard();
        const ends = linkEnds(link);
        const copy = normalizeLink(Object.assign({}, link, {
            id: '',
            from: '',
            to: '',
            fromPort: '',
            toPort: '',
            x1: ends.p1.x + 24,
            y1: ends.p1.y + 24,
            x2: ends.p2.x + 24,
            y2: ends.p2.y + 24
        }));
        data.whiteboard.links = data.whiteboard.links || [];
        data.whiteboard.links.push(copy);
        selectBoardLink(copy.id);
        schedulePersist();
    }

    function selectBoardLink(id) {
        boardLinkSelected = id || '';
        boardSelected = '';
        boardPicked = [];
        boardPickedLinks = id ? [id] : [];
        const stage = $('boardStage');
        if (stage) {
            stage.querySelectorAll('.wb-node').forEach(function (el) {
                el.classList.remove('is-on');
                const box = el.querySelector('.wb-handles');
                if (box) box.remove();
            });
        }
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function styleBoardItem() {
        return findBoardNode(boardSelected) || findBoardLink(boardLinkSelected);
    }

    function syncBoardInspect() {
        const inspect = $('boardInspect');
        if (!inspect) return;
        const rec = findBoardNode(boardSelected) || findBoardLink(boardLinkSelected);
        inspect.hidden = !rec;
        inspect.classList.toggle('is-link', !!boardLinkSelected && !boardSelected);
        inspect.classList.toggle('is-stroke', !!(boardSelected && rec && isStrokeRec(rec)));
        if (!rec) return;
        if (boardSelected) {
            const size = shapeSize(rec);
            const w = $('boardSizeW');
            const h = $('boardSizeH');
            if (w && document.activeElement !== w) w.value = Math.round(size.w);
            if (h && document.activeElement !== h) h.value = Math.round(size.h);
        }
        const strokeBox = $('boardStrokeSwatches');
        const fillBox = $('boardFillSwatches');
        if (strokeBox) {
            strokeBox.innerHTML = BOARD_STROKES.map(function (color) {
                return '<button type="button" class="board-swatch' + (rec.stroke === color ? ' is-on' : '') + '" data-board-stroke="' + color + '" style="background:' + color + '" aria-label="Stroke"></button>';
            }).join('');
        }
        if (fillBox) {
            fillBox.innerHTML = BOARD_FILLS.map(function (color) {
                const none = color === 'transparent';
                return '<button type="button" class="board-swatch' + (none ? ' is-none' : '') + (rec.fill === color ? ' is-on' : '') + '" data-board-fill="' + color + '"' + (none ? '' : ' style="background:' + color + '"') + ' aria-label="Fill"></button>';
            }).join('');
        }
        inspect.querySelectorAll('[data-board-sw]').forEach(function (btn) {
            btn.classList.toggle('is-on', Number(btn.getAttribute('data-board-sw')) === Number(rec.sw || 1.75));
        });
        inspect.querySelectorAll('[data-board-dash]').forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-board-dash') === (rec.dash || 'solid'));
        });
        const radius = shapeRadius(rec);
        const radiusRange = $('boardRadius');
        if (radiusRange && document.activeElement !== radiusRange) radiusRange.value = String(Math.round(radius));
        const op = $('boardOpacity');
        if (op && document.activeElement !== op) op.value = Math.round((rec.op == null ? 1 : rec.op) * 100);
    }

    function applyBoardSizeFromFields() {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
        if (!rec) return;
        rememberBoard();
        const w = Number($('boardSizeW') && $('boardSizeW').value);
        const h = Number($('boardSizeH') && $('boardSizeH').value);
        if (isImageNode(rec)) {
            const ratio = imageRatio(rec);
            if (document.activeElement && document.activeElement.id === 'boardSizeH' && h) {
                rec.h = Math.max(48, Math.min(1200, h));
                rec.w = Math.max(48, Math.min(1200, rec.h * ratio));
            } else {
                rec.w = Math.max(48, Math.min(1200, w || rec.w));
                rec.h = Math.max(48, Math.min(1200, rec.w / ratio));
            }
            rec.ratio = ratio;
        } else if (isStrokeRec(rec)) {
            layoutStroke(rec);
        } else {
            if (w) rec.w = Math.max(48, Math.min(1200, w));
            if (h) rec.h = Math.max(48, Math.min(1200, h));
        }
        const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
        applyNodeBox(el, rec);
        drawBoardLinks($('boardLinks'), data.whiteboard);
        schedulePersist();
    }

    function findBoardNode(id) {
        return (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
    }

    function cloneBoardPayload(rec) {
        return {
            type: rec.type,
            shape: rec.shape,
            w: rec.w,
            h: rec.h,
            title: rec.title,
            body: rec.body,
            src: rec.src,
            href: rec.href || '',
            stroke: rec.stroke,
            fill: rec.fill,
            sw: rec.sw,
            op: rec.op,
            flipX: !!rec.flipX,
            flipY: !!rec.flipY,
            dash: rec.dash || 'solid',
            edge: rec.edge || 'round',
            radius: rec.radius,
            ratio: Number(rec.ratio) > 0 ? Number(rec.ratio) : 0,
            pts: Array.isArray(rec.pts) ? rec.pts : [],
            x1: rec.x1,
            y1: rec.y1,
            x2: rec.x2,
            y2: rec.y2,
            startId: rec.startId || '',
            startPort: rec.startPort || '',
            endId: rec.endId || '',
            endPort: rec.endPort || ''
        };
    }

    function copyBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        boardClip = cloneBoardPayload(rec);
        boardClip.x = rec.x;
        boardClip.y = rec.y;
    }

    function cutBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        copyBoardNode(id);
        deleteBoardNode(id);
    }

    function pasteBoardNode(at) {
        if (!boardClip) return;
        rememberBoard();
        const origin = at || { x: (boardClip.x || 0) + 28, y: (boardClip.y || 0) + 28 };
        const dx = origin.x - (boardClip.x || 0);
        const dy = origin.y - (boardClip.y || 0);
        const copy = normalizeBoardNode(Object.assign({}, boardClip, {
            id: uid('nd'),
            x: origin.x,
            y: origin.y,
            x1: boardClip.x1 != null ? boardClip.x1 + dx : boardClip.x1,
            y1: boardClip.y1 != null ? boardClip.y1 + dy : boardClip.y1,
            x2: boardClip.x2 != null ? boardClip.x2 + dx : boardClip.x2,
            y2: boardClip.y2 != null ? boardClip.y2 + dy : boardClip.y2,
            startId: '',
            startPort: '',
            endId: '',
            endPort: '',
            locked: false
        }));
        data.whiteboard.nodes.push(copy);
        boardSelected = copy.id;
        renderWhiteboard();
        schedulePersist();
        return copy;
    }

    function flipBoardNode(id, axis) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        if (isStrokeRec(rec)) {
            if (axis === 'h') {
                const t = rec.x1; rec.x1 = rec.x2; rec.x2 = t;
            } else {
                const t = rec.y1; rec.y1 = rec.y2; rec.y2 = t;
            }
            const sid = rec.startId; rec.startId = rec.endId; rec.endId = sid;
            const sport = rec.startPort; rec.startPort = rec.endPort; rec.endPort = sport;
            layoutStroke(rec);
        } else if (axis === 'h') rec.flipX = !rec.flipX;
        else rec.flipY = !rec.flipY;
        renderWhiteboard();
        schedulePersist();
    }

    function toggleBoardLock(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        rec.locked = !rec.locked;
        renderWhiteboard();
        schedulePersist();
    }

    function copyBoardStyle(id) {
        const rec = findBoardNode(id) || findBoardLink(id) || findBoardLink(boardLinkSelected);
        if (!rec) return;
        boardStyleClip = { stroke: rec.stroke, fill: rec.fill, sw: rec.sw, op: rec.op, dash: rec.dash, radius: rec.radius, edge: rec.edge };
    }

    function pasteBoardStyle(id) {
        const rec = findBoardNode(id) || findBoardLink(id) || findBoardLink(boardLinkSelected);
        if (!rec || !boardStyleClip || rec.locked) return;
        rec.stroke = boardStyleClip.stroke;
        if (rec.fill !== undefined && boardStyleClip.fill !== undefined) rec.fill = boardStyleClip.fill;
        rec.sw = boardStyleClip.sw;
        rec.op = boardStyleClip.op;
        if (boardStyleClip.dash) rec.dash = boardStyleClip.dash;
        if (boardStyleClip.radius != null) rec.radius = boardStyleClip.radius;
        if (boardStyleClip.edge) rec.edge = boardStyleClip.edge;
        renderWhiteboard();
        schedulePersist();
    }

    function looksLikeImageSrc(text) {
        const value = String(text || '').trim();
        return /^(https?:\/\/|data:image\/)/i.test(value);
    }

    function isImageNode(rec) {
        return !!(rec && (rec.type === 'image' || rec.shape === 'image'));
    }

    function imageRatio(rec) {
        const r = Number(rec && rec.ratio);
        if (r > 0.04 && r < 50) return r;
        const w = Number(rec && rec.w) || 0;
        const h = Number(rec && rec.h) || 0;
        return w > 0 && h > 0 ? w / h : 4 / 3;
    }

    function clampRatioSize(w, h, ratio, min, max) {
        min = min || 48;
        max = max || 1200;
        w = Math.abs(w) || min;
        h = Math.abs(h) || min;
        if (ratio > 0) h = w / ratio;
        if (w > max) { w = max; h = w / ratio; }
        if (h > max) { h = max; w = h * ratio; }
        if (w < min) { w = min; h = w / ratio; }
        if (h < min) { h = min; w = h * ratio; }
        return { w: w, h: h };
    }

    function applyImageRatio(rec, prefer) {
        if (!isImageNode(rec)) return;
        const ratio = imageRatio(rec);
        rec.ratio = ratio;
        const size = prefer === 'h'
            ? clampRatioSize((Number(rec.h) || 168) * ratio, rec.h || 168, ratio, 48, 1200)
            : clampRatioSize(rec.w || 240, rec.h || 168, ratio, 48, 1200);
        rec.w = size.w;
        rec.h = size.h;
    }

    function fitImageNode(rec, src) {
        if (!rec || !src) return;
        const img = new Image();
        img.onload = function () {
            const nw = img.naturalWidth || img.width || 0;
            const nh = img.naturalHeight || img.height || 0;
            if (!(nw > 0 && nh > 0)) return;
            rec.ratio = nw / nh;
            applyImageRatio(rec, 'w');
            const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
            applyNodeBox(el, rec);
            followAllStrokes(rec.id);
            drawBoardLinks($('boardLinks'), data.whiteboard);
            syncBoardInspect();
            schedulePersist();
        };
        img.src = src;
    }

    function clipboardImageFile(clip) {
        if (!clip) return null;
        const files = Array.from(clip.files || []);
        let hit = files.find(function (file) { return file && /^image\//i.test(file.type); });
        if (hit) return hit;
        const items = Array.from(clip.items || []);
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && /^image\//i.test(items[i].type)) {
                const file = items[i].getAsFile && items[i].getAsFile();
                if (file) return file;
            }
        }
        return null;
    }

    function applyImageSrc(id, src, title) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked || !src) return false;
        rememberBoard();
        rec.type = 'image';
        rec.shape = rec.shape === 'image' ? rec.shape : (typeMeta('image').shape || 'image');
        rec.src = src;
        if (title) rec.title = title;
        fitImageNode(rec, src);
        renderWhiteboard();
        schedulePersist();
        return true;
    }

    function placePastedImage(src, title, at) {
        const rec = findBoardNode(boardSelected);
        if (rec && rec.type === 'image') {
            applyImageSrc(rec.id, src, title);
            return rec;
        }
        const origin = at || boardPointerAt || { x: 180, y: 140 };
        const node = addBoardNode('image', { x: origin.x, y: origin.y, w: origin.w || 240, h: origin.h || 168 });
        if (node) applyImageSrc(node.id, src, title);
        return node;
    }

    function readImageFile(file, ontoId, at) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
            const src = String(reader.result || '');
            if (!src) return;
            if (ontoId && applyImageSrc(ontoId, src, file.name || '')) return;
            placePastedImage(src, file.name || '', at);
        };
        reader.readAsDataURL(file);
    }

    function focusImageSlot(id) {
        requestAnimationFrame(function () {
            const input = document.querySelector('#boardStage [data-node="' + id + '"] [data-wb-image-url], #boardStage [data-node="' + id + '"] [data-wb-embed-url]');
            if (input) input.focus();
        });
    }

    function openBoardImagePicker(id) {
        if (id) {
            boardSelected = id;
            boardMenuMode = 'node';
        }
        const input = $('boardImageFile');
        if (input) input.click();
    }

    function setBoardHref(id) {
        const rec = findBoardNode(id);
        if (!rec || rec.locked) return;
        const next = window.prompt('Link URL', rec.href || 'https://');
        if (next == null) return;
        rec.href = String(next).trim();
        renderWhiteboard();
        schedulePersist();
    }

    function duplicateBoardNode(id) {
        const rec = findBoardNode(id);
        if (!rec) return;
        const copy = normalizeBoardNode(Object.assign(cloneBoardPayload(rec), {
            id: uid('nd'),
            x: (rec.x || 0) + 28,
            y: (rec.y || 0) + 28,
            x1: rec.x1 != null ? rec.x1 + 28 : rec.x1,
            y1: rec.y1 != null ? rec.y1 + 28 : rec.y1,
            x2: rec.x2 != null ? rec.x2 + 28 : rec.x2,
            y2: rec.y2 != null ? rec.y2 + 28 : rec.y2,
            startId: '',
            startPort: '',
            endId: '',
            endPort: '',
            locked: false
        }));
        data.whiteboard.nodes.push(copy);
        boardSelected = copy.id;
        renderWhiteboard();
        schedulePersist();
        return copy;
    }

    function applyBoardKind(kind) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
        if (!rec || BOARD_PLACE.indexOf(kind) < 0) return;
        rec.type = kind;
        rec.shape = typeMeta(kind).shape || kind;
        if (kind === 'circle' || kind === 'square') {
            const side = Math.max(shapeSize(rec).w, shapeSize(rec).h);
            rec.w = side;
            rec.h = side;
        }
        if (kind === 'text' && !rec.title) rec.title = 'Text';
        if (kind === 'note') {
            rec.title = rec.title && rec.title !== 'Note' ? rec.title : '';
            rec.fill = rec.fill && rec.fill !== 'transparent' && rec.fill !== 'none' ? rec.fill : '#f3e08a';
            rec.stroke = rec.stroke || '#c9a227';
            if (!(rec.w > 120)) rec.w = 176;
            if (!(rec.h > 120)) rec.h = 176;
        }
        if (kind === 'person' && !rec.title) rec.title = subjectName() || 'Person';
        renderWhiteboard();
        schedulePersist();
        if (kind === 'text' || kind === 'note' || kind === 'finding' || kind === 'question') beginBoardTextEdit(rec.id);
    }

    function nodeElAtClient(clientX, clientY) {
        const stack = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (!el || !el.closest) continue;
            const node = el.closest('.wb-node');
            if (!node) continue;
            if (node.classList.contains('is-stroke')) {
                if ((el.classList && (el.classList.contains('wb-hit') || el.classList.contains('wb-handle'))) || (el.getAttribute && el.getAttribute('data-handle'))) return node;
                continue;
            }
            return node;
        }
        const stage = $('boardStage');
        if (!stage) return null;
        const at = worldFromClient(clientX, clientY);
        const nodes = data.whiteboard.nodes || [];
        for (let i = nodes.length - 1; i >= 0; i--) {
            const rec = nodes[i];
            if (isStrokeShape(rec.shape)) continue;
            const size = shapeSize(rec);
            if (at.x >= (rec.x || 0) && at.x <= (rec.x || 0) + size.w && at.y >= (rec.y || 0) && at.y <= (rec.y || 0) + size.h) {
                if (boardTool === 'select' || !boardTool) continue;
                return stage.querySelector('[data-node="' + rec.id + '"]');
            }
        }
        return null;
    }

    function selectBoardNode(id) {
        boardLinkSelected = '';
        boardPickedLinks = [];
        boardSelected = id || '';
        boardPicked = id ? [id] : [];
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (el) {
            const on = boardPicked.indexOf(el.dataset.node) >= 0;
            el.classList.toggle('is-on', on);
            const box = el.querySelector('.wb-handles');
            const rec = findBoardNode(el.dataset.node);
            if (on && el.dataset.node === boardSelected && !box && rec && !rec.locked) {
                el.insertAdjacentHTML('beforeend', handleMarkup(rec.shape, rec));
                if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
            }
            if ((!on || el.dataset.node !== boardSelected || (rec && rec.locked)) && box) box.remove();
        });
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function selectBoardNodes(ids, linkIds, primary) {
        boardPicked = (ids || []).filter(Boolean);
        boardPickedLinks = (linkIds || []).filter(Boolean);
        boardSelected = (primary && boardPicked.indexOf(primary) >= 0) ? primary : (boardPicked[0] || '');
        boardLinkSelected = boardPicked.length ? '' : (boardPickedLinks[0] || '');
        const stage = $('boardStage');
        if (!stage) return;
        stage.querySelectorAll('.wb-node').forEach(function (el) {
            const on = boardPicked.indexOf(el.dataset.node) >= 0;
            el.classList.toggle('is-on', on);
            const box = el.querySelector('.wb-handles');
            const rec = findBoardNode(el.dataset.node);
            if (on && el.dataset.node === boardSelected && boardPicked.length < 2 && !box && rec && !rec.locked) {
                el.insertAdjacentHTML('beforeend', handleMarkup(rec.shape, rec));
                if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
            }
            if ((!on || el.dataset.node !== boardSelected || boardPicked.length > 1 || (rec && rec.locked)) && box) box.remove();
        });
        drawBoardLinks($('boardLinks'), data.whiteboard);
        syncBoardInspect();
        syncBoardGroupBox();
    }

    function boardAddKey(event) {
        return !!(event && (event.shiftKey || event.ctrlKey || event.metaKey));
    }

    function pickBoardNode(id, add) {
        if (!id) {
            selectBoardNodes([]);
            return [];
        }
        if (!add) {
            selectBoardNodes([id], [], id);
            return [id];
        }
        const ids = boardPicked.slice();
        const at = ids.indexOf(id);
        if (at >= 0) ids.splice(at, 1);
        else ids.push(id);
        selectBoardNodes(ids, boardPickedLinks, at < 0 ? id : '');
        return ids;
    }

    function nodesInRect(a, b) {
        return hitsInRect(a, b).nodes;
    }

    function normHitRect(a, b) {
        return {
            x0: Math.min(a.x, b.x),
            y0: Math.min(a.y, b.y),
            x1: Math.max(a.x, b.x),
            y1: Math.max(a.y, b.y)
        };
    }

    function pointInHitRect(x, y, r) {
        return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
    }

    function rectsTouch(a, b) {
        return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
    }

    function segHitsSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
        const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(d) < 1e-8) {
            const r = { x0: Math.min(x3, x4), y0: Math.min(y3, y4), x1: Math.max(x3, x4), y1: Math.max(y3, y4) };
            return (pointInHitRect(x1, y1, r) || pointInHitRect(x2, y2, r)) &&
                Math.min(x1, x2) <= r.x1 && Math.max(x1, x2) >= r.x0 &&
                Math.min(y1, y2) <= r.y1 && Math.max(y1, y2) >= r.y0;
        }
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    function segHitsRect(x1, y1, x2, y2, r) {
        if (pointInHitRect(x1, y1, r) || pointInHitRect(x2, y2, r)) return true;
        return segHitsSeg(x1, y1, x2, y2, r.x0, r.y0, r.x1, r.y0) ||
            segHitsSeg(x1, y1, x2, y2, r.x1, r.y0, r.x1, r.y1) ||
            segHitsSeg(x1, y1, x2, y2, r.x1, r.y1, r.x0, r.y1) ||
            segHitsSeg(x1, y1, x2, y2, r.x0, r.y1, r.x0, r.y0);
    }

    function nodeWorldBox(n) {
        if (!n) return null;
        if (isStrokeRec(n) && n.x1 != null && n.y1 != null && n.x2 != null && n.y2 != null) {
            return {
                x0: Math.min(Number(n.x1), Number(n.x2)),
                y0: Math.min(Number(n.y1), Number(n.y2)),
                x1: Math.max(Number(n.x1), Number(n.x2)),
                y1: Math.max(Number(n.y1), Number(n.y2))
            };
        }
        const size = shapeSize(n);
        return {
            x0: n.x || 0,
            y0: n.y || 0,
            x1: (n.x || 0) + size.w,
            y1: (n.y || 0) + size.h
        };
    }

    function selectionWorldBox(nodeIds, linkIds) {
        const boxes = [];
        (nodeIds || []).forEach(function (id) {
            const box = nodeWorldBox(findBoardNode(id));
            if (box) boxes.push(box);
        });
        (linkIds || []).forEach(function (id) {
            const link = findBoardLink(id);
            if (!link) return;
            const ends = linkEnds(link);
            boxes.push({
                x0: Math.min(ends.p1.x, ends.p2.x),
                y0: Math.min(ends.p1.y, ends.p2.y),
                x1: Math.max(ends.p1.x, ends.p2.x),
                y1: Math.max(ends.p1.y, ends.p2.y)
            });
        });
        if (!boxes.length) return null;
        let x0 = boxes[0].x0;
        let y0 = boxes[0].y0;
        let x1 = boxes[0].x1;
        let y1 = boxes[0].y1;
        boxes.forEach(function (b) {
            x0 = Math.min(x0, b.x0);
            y0 = Math.min(y0, b.y0);
            x1 = Math.max(x1, b.x1);
            y1 = Math.max(y1, b.y1);
        });
        const pad = 24;
        return { x: x0 - pad, y: y0 - pad, w: (x1 - x0) + pad * 2, h: (y1 - y0) + pad * 2 };
    }

    function syncBoardGroupBox(nodeIds, linkIds) {
        const stage = $('boardStage');
        if (!stage) return;
        const ids = nodeIds || boardPicked || [];
        const lids = linkIds || boardPickedLinks || [];
        const count = ids.length + lids.length;
        const box = count > 1 ? selectionWorldBox(ids, lids) : null;
        let el = stage.querySelector('.wb-group');
        if (!box) {
            if (el) el.remove();
            return;
        }
        if (!el) {
            el = document.createElement('div');
            el.className = 'wb-group';
            el.innerHTML = '<i></i><i></i><i></i><i></i>';
            el.setAttribute('aria-hidden', 'true');
            stage.appendChild(el);
        }
        el.style.left = box.x + 'px';
        el.style.top = box.y + 'px';
        el.style.width = box.w + 'px';
        el.style.height = box.h + 'px';
    }

    function inflateRect(r, pad) {
        return { x0: r.x0 - pad, y0: r.y0 - pad, x1: r.x1 + pad, y1: r.y1 + pad };
    }

    function nodeHitsRect(n, r) {
        if (!n) return false;
        const pad = Math.max(2, (Number(n.sw) || 1.75) + 1);
        const box = inflateRect(r, pad);
        if (isStrokeRec(n) && n.x1 != null && n.y1 != null && n.x2 != null && n.y2 != null) {
            return segHitsRect(Number(n.x1), Number(n.y1), Number(n.x2), Number(n.y2), box);
        }
        if ((n.shape === 'draw' || n.type === 'draw') && (n.pts || []).length) {
            const ox = n.x || 0;
            const oy = n.y || 0;
            const pts = n.pts;
            if (pts.length === 1) return pointInHitRect(ox + pts[0][0], oy + pts[0][1], box);
            for (let i = 1; i < pts.length; i++) {
                if (segHitsRect(ox + pts[i - 1][0], oy + pts[i - 1][1], ox + pts[i][0], oy + pts[i][1], box)) return true;
            }
            return false;
        }
        const size = shapeSize(n);
        return rectsTouch(box, {
            x0: n.x || 0,
            y0: n.y || 0,
            x1: (n.x || 0) + size.w,
            y1: (n.y || 0) + size.h
        });
    }

    function linkHitsRect(link, r) {
        if (!link) return false;
        const ends = linkEnds(link);
        const pad = Math.max(2, (Number(link.sw) || 1.7) + 2);
        return segHitsRect(ends.p1.x, ends.p1.y, ends.p2.x, ends.p2.y, inflateRect(r, pad));
    }

    function hitsInRect(a, b) {
        const r = normHitRect(a, b);
        const nodes = [];
        const links = [];
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (nodeHitsRect(n, r)) nodes.push(n.id);
        });
        (data.whiteboard.links || []).forEach(function (link) {
            if (linkHitsRect(link, r)) links.push(link.id);
        });
        return { nodes: nodes, links: links };
    }

    function previewBoardHits(nodeIds, linkIds) {
        const stage = $('boardStage');
        if (stage) {
            stage.querySelectorAll('.wb-node').forEach(function (el) {
                el.classList.toggle('is-on', nodeIds.indexOf(el.dataset.node) >= 0);
            });
        }
        const prevNodes = boardPicked;
        const prevLinks = boardPickedLinks;
        const prevLink = boardLinkSelected;
        boardPickedLinks = linkIds || [];
        boardLinkSelected = nodeIds.length ? '' : (boardPickedLinks[0] || '');
        drawBoardLinks($('boardLinks'), data.whiteboard);
        boardPicked = prevNodes;
        boardPickedLinks = prevLinks;
        boardLinkSelected = prevLink;
        syncBoardGroupBox(nodeIds, linkIds);
    }

    function polyPoint(p) {
        return p && p.x != null ? p : { x: (p && p[0]) || 0, y: (p && p[1]) || 0 };
    }

    function nodeHitsLasso(n, pts) {
        const poly = (pts || []).map(polyPoint);
        if (poly.length < 2) return false;
        const size = shapeSize(n);
        const samples = isStrokeRec(n)
            ? [{ x: n.x1, y: n.y1 }, { x: n.x2, y: n.y2 }, { x: (Number(n.x1) + Number(n.x2)) / 2, y: (Number(n.y1) + Number(n.y2)) / 2 }]
            : [
                { x: n.x || 0, y: n.y || 0 },
                { x: (n.x || 0) + size.w, y: n.y || 0 },
                { x: (n.x || 0) + size.w, y: (n.y || 0) + size.h },
                { x: n.x || 0, y: (n.y || 0) + size.h },
                { x: (n.x || 0) + size.w / 2, y: (n.y || 0) + size.h / 2 }
            ];
        for (let i = 0; i < samples.length; i++) {
            if (pointInPoly(samples[i], poly)) return true;
        }
        const box = isStrokeRec(n)
            ? { x0: Math.min(n.x1, n.x2), y0: Math.min(n.y1, n.y2), x1: Math.max(n.x1, n.x2), y1: Math.max(n.y1, n.y2) }
            : { x0: n.x || 0, y0: n.y || 0, x1: (n.x || 0) + size.w, y1: (n.y || 0) + size.h };
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            if (pointInHitRect(a.x, a.y, box) || segHitsRect(a.x, a.y, b.x, b.y, box)) return true;
            if (isStrokeRec(n) && segHitsSeg(Number(n.x1), Number(n.y1), Number(n.x2), Number(n.y2), a.x, a.y, b.x, b.y)) return true;
        }
        if ((n.shape === 'draw' || n.type === 'draw') && (n.pts || []).length) {
            const ox = n.x || 0;
            const oy = n.y || 0;
            for (let i = 0; i < n.pts.length; i++) {
                if (pointInPoly({ x: ox + n.pts[i][0], y: oy + n.pts[i][1] }, poly)) return true;
            }
        }
        return false;
    }

    function linkHitsLasso(link, pts) {
        const poly = (pts || []).map(polyPoint);
        if (!link || poly.length < 2) return false;
        const ends = linkEnds(link);
        if (pointInPoly(ends.p1, poly) || pointInPoly(ends.p2, poly)) return true;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            if (segHitsSeg(ends.p1.x, ends.p1.y, ends.p2.x, ends.p2.y, a.x, a.y, b.x, b.y)) return true;
        }
        return false;
    }

    function hitsInLasso(pts) {
        const nodes = [];
        const links = [];
        (data.whiteboard.nodes || []).forEach(function (n) {
            if (nodeHitsLasso(n, pts)) nodes.push(n.id);
        });
        (data.whiteboard.links || []).forEach(function (link) {
            if (linkHitsLasso(link, pts)) links.push(link.id);
        });
        return { nodes: nodes, links: links };
    }

    function setMarqueeOverlay(a, b) {
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(b.x - a.x);
        const h = Math.abs(b.y - a.y);
        setBoardOverlay('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z', 'wb-marquee');
    }

    function boardTextValue(rec) {
        const title = rec && rec.title ? String(rec.title) : '';
        const body = rec && rec.body ? String(rec.body) : '';
        if (title && body) return title + '\n' + body;
        return title || body;
    }

    function beginBoardTextEdit(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        const el = document.querySelector('#boardStage [data-node="' + id + '"]');
        if (!rec || !el) return;
        const active = document.querySelector('#boardStage [data-wb-text].is-edit');
        if (active && active.closest('.wb-node') === el) {
            active.focus();
            return;
        }
        commitBoardTextEdit();
        rememberBoard();
        selectBoardNode(id);
        hideBoardAddMenu();
        hideBoardMore();
        let label = el.querySelector('[data-wb-text]');
        const copy = el.querySelector('.wb-copy');
        if (!label && copy) {
            copy.insertAdjacentHTML('beforeend', '<div class="wb-text" data-wb-text></div>');
            label = copy.querySelector('[data-wb-text]');
        }
        if (!label) return;
        label.textContent = boardTextValue(rec);
        label.contentEditable = 'true';
        label.classList.add('is-edit');
        el.classList.add('is-editing');
        label.focus();
        const range = document.createRange();
        range.selectNodeContents(label);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function commitBoardTextEdit() {
        const label = document.querySelector('#boardStage [data-wb-text].is-edit');
        if (!label) return;
        const nodeEl = label.closest('.wb-node');
        const rec = nodeEl && (data.whiteboard.nodes || []).find(function (n) { return n.id === nodeEl.dataset.node; });
        label.contentEditable = 'false';
        label.classList.remove('is-edit');
        if (nodeEl) nodeEl.classList.remove('is-editing');
        if (!rec) return;
        const parts = String(label.innerText || '').replace(/\r/g, '').split('\n');
        rec.title = (parts.shift() || '').trim().slice(0, 120);
        rec.body = parts.join('\n').replace(/^\n+/, '').trim().slice(0, 800);
        renderWhiteboard();
        schedulePersist();
    }

    function layerBoardNode(id, dir) {
        const nodes = data.whiteboard.nodes || [];
        const i = nodes.findIndex(function (n) { return n.id === id; });
        if (i < 0) return;
        if (dir === 'up' && i < nodes.length - 1) {
            rememberBoard();
            const swap = nodes[i];
            nodes[i] = nodes[i + 1];
            nodes[i + 1] = swap;
        } else if (dir === 'down' && i > 0) {
            rememberBoard();
            const swap = nodes[i];
            nodes[i] = nodes[i - 1];
            nodes[i - 1] = swap;
        } else if (dir === 'front' || dir === 'forward') {
            rememberBoard();
            nodes.push(nodes.splice(i, 1)[0]);
        } else if (dir === 'back') {
            rememberBoard();
            nodes.unshift(nodes.splice(i, 1)[0]);
        } else {
            return;
        }
        data.whiteboard.nodes = nodes;
        renderWhiteboard();
        schedulePersist();
    }

    function resizeFromHandle(drag, rec, dx, dy, lockAspect) {
        if (isStrokeRec(rec)) return;
        const hdl = drag.handle || 'se';
        const min = isStrokeShape(rec.shape) ? 4 : 48;
        let w = drag.ow;
        let h = drag.oh;
        if (hdl.indexOf('e') >= 0) w = drag.ow + dx;
        if (hdl.indexOf('s') >= 0) h = drag.oh + dy;
        if (hdl.indexOf('w') >= 0) w = drag.ow - dx;
        if (hdl.indexOf('n') >= 0) h = drag.oh - dy;
        if (lockAspect) {
            const ratio = isImageNode(rec) ? imageRatio(rec) : drag.ow / (drag.oh || 1);
            if (hdl === 'n' || hdl === 's') w = h * ratio;
            else if (hdl === 'e' || hdl === 'w') h = w / ratio;
            else if (Math.abs(w - drag.ow) >= Math.abs(h - drag.oh)) h = w / ratio;
            else w = h * ratio;
            const boxed = clampRatioSize(w, h, ratio, min, 1200);
            w = boxed.w;
            h = boxed.h;
        } else {
            w = Math.max(min, Math.min(1200, w));
            h = Math.max(min, Math.min(1200, h));
        }
        rec.w = w;
        rec.h = h;
        rec.x = hdl.indexOf('w') >= 0 ? drag.ox + (drag.ow - w) : ((hdl === 'n' || hdl === 's') && lockAspect ? drag.ox + (drag.ow - w) / 2 : drag.ox);
        rec.y = hdl.indexOf('n') >= 0 ? drag.oy + (drag.oh - h) : ((hdl === 'e' || hdl === 'w') && lockAspect ? drag.oy + (drag.oh - h) / 2 : drag.oy);
    }

    function applyDrawBox(origin, rec, at, lockAspect) {
        const stroke = isStrokeRec(rec);
        if (stroke) {
            let end = at;
            if (lockAspect) end = snapAxis(origin, at, true);
            if (rec.x1 == null) rec.x1 = origin.x;
            if (rec.y1 == null) rec.y1 = origin.y;
            setStrokePoint(rec, 'end', end, true);
            return;
        }
        let dx = at.x - origin.x;
        let dy = at.y - origin.y;
        if (lockAspect) {
            const side = Math.max(8, Math.abs(dx), Math.abs(dy));
            dx = dx < 0 ? -side : side;
            dy = dy < 0 ? -side : side;
        }
        rec.x = dx < 0 ? origin.x + dx : origin.x;
        rec.y = dy < 0 ? origin.y + dy : origin.y;
        rec.w = Math.max(8, Math.min(1200, Math.abs(dx) || 8));
        rec.h = Math.max(8, Math.min(1200, Math.abs(dy) || 8));
    }

    function drawLocksAspect(shape, shift) {
        const locked = shape === 'circle' || shape === 'ellipse';
        return shift ? !locked : locked;
    }

    function shapeSize(node) {
        const shape = (node && node.shape) || typeMeta(node && node.type).shape || 'process';
        const size = BOARD_SHAPES[shape] || BOARD_SHAPES.process;
        return { w: Number(node && node.w) || size.w, h: Number(node && node.h) || size.h, shape: shape };
    }

    function normalizeBoardNode(node) {
        const rec = node && typeof node === 'object' ? node : {};
        const meta = typeMeta(rec.type || 'note');
        rec.type = rec.type || 'note';
        rec.shape = rec.shape || meta.shape || 'process';
        const size = BOARD_SHAPES[rec.shape] || BOARD_SHAPES.process;
        rec.x = Number(rec.x) || 0;
        rec.y = Number(rec.y) || 0;
        rec.w = Number(rec.w) || size.w;
        rec.h = Number(rec.h) || size.h;
        rec.title = rec.title || '';
        rec.body = rec.body || '';
        rec.src = rec.src || '';
        rec.done = !!rec.done;
        rec.stroke = rec.stroke || '#e4e4e7';
        rec.fill = !rec.fill || rec.fill === '#111113' ? 'transparent' : rec.fill;
        rec.sw = Number(rec.sw) || 1.75;
        rec.op = rec.op == null ? 1 : Math.max(0, Math.min(1, Number(rec.op)));
        rec.href = rec.href || '';
        rec.flipX = !!rec.flipX;
        rec.flipY = !!rec.flipY;
        rec.locked = !!rec.locked;
        rec.dash = rec.dash === 'dashed' || rec.dash === 'dotted' ? rec.dash : 'solid';
        rec.edge = rec.edge === 'sharp' ? 'sharp' : 'round';
        rec.radius = shapeRadius(rec);
        rec.ratio = Number(rec.ratio) > 0 ? Number(rec.ratio) : 0;
        rec.pts = Array.isArray(rec.pts) ? rec.pts : [];
        rec.startId = rec.startId || '';
        rec.startPort = rec.startPort || '';
        rec.endId = rec.endId || '';
        rec.endPort = rec.endPort || '';
        if (isStrokeRec(rec)) layoutStroke(rec);
        return rec;
    }

    function snapshot() {
        return JSON.parse(JSON.stringify(data));
    }

    function load(raw) {
        const next = emptyInvestigation();
        if (raw && typeof raw === 'object') {
            next.timeline = Array.isArray(raw.timeline) ? raw.timeline : [];
            if (raw.timelineView && typeof raw.timelineView === 'object') {
                next.timelineView.x = Number(raw.timelineView.x) || 0;
                next.timelineView.y = Number(raw.timelineView.y) || 0;
                next.timelineView.z = Number(raw.timelineView.z) > 0 ? Number(raw.timelineView.z) : 1;
            }
            next.evidence = Array.isArray(raw.evidence) ? raw.evidence : [];
            if (raw.whiteboard && typeof raw.whiteboard === 'object') {
                next.whiteboard.x = Number(raw.whiteboard.x) || 0;
                next.whiteboard.y = Number(raw.whiteboard.y) || 0;
                next.whiteboard.z = Number(raw.whiteboard.z) > 0 ? Number(raw.whiteboard.z) : 1;
                next.whiteboard.nodes = (Array.isArray(raw.whiteboard.nodes) ? raw.whiteboard.nodes : []).map(normalizeBoardNode);
                next.whiteboard.links = (Array.isArray(raw.whiteboard.links) ? raw.whiteboard.links : []).map(normalizeLink);
            }
            if (raw.flowchart && typeof raw.flowchart === 'object') {
                next.flowchart.preset = raw.flowchart.preset || 'username';
                next.flowchart.checks = raw.flowchart.checks && typeof raw.flowchart.checks === 'object' ? raw.flowchart.checks : {};
                next.flowchart.notes = raw.flowchart.notes && typeof raw.flowchart.notes === 'object' ? raw.flowchart.notes : {};
            }
            next.intel.host = (raw.intel && raw.intel.host) || '';
            const harvestedIn = (raw.harvester && typeof raw.harvester === 'object')
                ? raw.harvester
                : (raw.compiler && typeof raw.compiler === 'object')
                    ? raw.compiler
                    : null;
            if (harvestedIn) {
                next.harvester.files = Array.isArray(harvestedIn.files) ? harvestedIn.files : [];
                next.harvester.hits = Array.isArray(harvestedIn.hits) ? harvestedIn.hits : [];
                next.harvester.ready = !!harvestedIn.ready;
                next.harvester.at = harvestedIn.at || '';
                next.harvester.view = harvestedIn.view === 'original' || harvestedIn.view === 'stripped'
                    ? harvestedIn.view
                    : 'split';
                const split = Number(harvestedIn.split);
                next.harvester.split = isFinite(split) ? Math.min(78, Math.max(22, split)) : 50;
            }
        }
        data = next;
        selectedEvent = '';
        connectFrom = '';
        boardConnect = '';
        boardConnectPort = '';
        boardSelected = '';
        boardLinkSelected = '';
        boardPicked = [];
        boardPickedLinks = [];
        boardUndo = [];
        boardRedo = [];
        tlUndo = [];
        tlRedo = [];
        renderAll();
    }

    function reduceMotion() {
        try {
            return document.documentElement.classList.contains('reduce-motion') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (error) {
            return false;
        }
    }

    function pagePane(id) {
        return id === 'orbit' ? $('mapStage') : $('page-' + id);
    }

    function pageIndex(id) {
        const i = PAGES.findIndex(function (item) { return item.id === id; });
        return i < 0 ? 0 : i;
    }

    function clearPageAnim(el) {
        if (!el) return;
        el.classList.remove('is-page-enter', 'is-page-leave', 'from-left', 'from-right', 'to-left', 'to-right');
    }

    function settlePages(activeId) {
        PAGES.forEach(function (item) {
            const el = pagePane(item.id);
            if (!el) return;
            clearPageAnim(el);
            if (item.id === 'orbit') {
                el.setAttribute('aria-hidden', activeId === 'orbit' ? 'false' : 'true');
                return;
            }
            el.hidden = item.id !== activeId;
        });
        if (activeId === 'datasheet') sizeDatasheet();
    }

    function setPage(id) {
        if (id === 'flowchart') id = 'whiteboard';
        if (id === 'analytics' || id === 'evidence') id = 'orbit';
        if (id === 'compiler') id = 'harvester';
        const next = PAGES.some(function (item) { return item.id === id; }) ? id : 'orbit';
        const prev = page;
        if (page === 'whiteboard' && next !== 'whiteboard') {
            hideBoardAddMenu();
            hideBoardMore();
            stopLaser(true);
        }
        if (next !== 'timeline') {
            closeCalendar();
            closeTimePicker();
            closeTlInfoPop();
        }
        page = next;
        document.body.setAttribute('data-page', page);
        document.body.classList.toggle('page-orbit', page === 'orbit');

        const skipAnim = !pageSwitchReady || prev === next || reduceMotion();
        const slideTab = pageSwitchReady && prev !== next;
        pageSwitchReady = true;
        if (pageAnimTimer) {
            clearTimeout(pageAnimTimer);
            pageAnimTimer = 0;
        }

        if (skipAnim) {
            settlePages(page);
        } else {
            const fromEl = pagePane(prev);
            const toEl = pagePane(next);
            const goingRight = pageIndex(next) > pageIndex(prev);
        PAGES.forEach(function (item) {
                if (item.id === prev || item.id === next) return;
                const el = pagePane(item.id);
            if (!el) return;
                clearPageAnim(el);
                if (item.id !== 'orbit') el.hidden = true;
            });
            if (fromEl) {
                clearPageAnim(fromEl);
                if (fromEl.id !== 'mapStage') fromEl.hidden = false;
            }
            if (toEl) {
                clearPageAnim(toEl);
                if (toEl.id !== 'mapStage') toEl.hidden = false;
            }
            if (fromEl && toEl) {
                void toEl.offsetWidth;
                fromEl.classList.add('is-page-leave', goingRight ? 'to-left' : 'to-right');
                toEl.classList.add('is-page-enter', goingRight ? 'from-right' : 'from-left');
                pageAnimTimer = setTimeout(function () {
                    pageAnimTimer = 0;
                    settlePages(page);
                }, PAGE_ANIM_MS);
            } else {
                settlePages(page);
            }
        }

        const map = $('mapStage');
        if (map) map.setAttribute('aria-hidden', page === 'orbit' ? 'false' : 'true');
        renderPageSwitch({ instant: !slideTab });
        syncDock();
        if (page === 'timeline') {
            renderTimeline();
            syncTimelineIsland();
        }
        if (page === 'whiteboard') renderWhiteboard();
        if (page === 'harvester') renderHarvester();
        if (page === 'datasheet') renderDatasheet();
        try {
            if (window.OrbINTSettings && OrbINTSettings.get('rememberPage') === false) {
                /* keep the in-memory page without writing it */
            } else {
                localStorage.setItem('orbint-page', page);
            }
        } catch (error) {}
    }

    function currentPage() {
        return page;
    }

    function syncDock() {
        const add = $('dockAdd');
        const phone = $('phoneAdd');
        const connect = $('dockConnect');
        const labels = {
            orbit: 'Add field',
            timeline: 'Add event',
            whiteboard: 'Add shape',
            harvester: 'Upload file'
        };
        const label = labels[page] || labels.orbit;
        if (add) {
            add.setAttribute('data-tip', label);
            add.setAttribute('aria-label', label);
        }
        if (phone) phone.setAttribute('aria-label', label);
        if (connect) {
            connect.classList.toggle('is-on', !!timelineConnectOn);
            connect.setAttribute('data-tip', 'Connect cards');
            connect.setAttribute('aria-label', 'Connect cards');
        }
        if (typeof paintDatasheetSpoilers === 'function') paintDatasheetSpoilers();
        syncBoardHistory();
    }

    function dockAdd() {
        if (page === 'timeline') {
            const view = $('timelineView');
            const cam = timelineCam();
            const z = cam.z || 1;
            const mid = view ? ((view.clientWidth / 2) - cam.x) / z : 400;
            addEventAt(mid, -1);
            return true;
        }
        if (page === 'whiteboard') {
            const view = $('boardView');
            const board = data.whiteboard;
            const z = board.z || 1;
            const w = view ? view.clientWidth : 480;
            const h = view ? view.clientHeight : 320;
            addBoardNode(BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'square', {
                x: ((w / 2) - board.x) / z - 74,
                y: ((h / 2) - board.y) / z - 74
            });
            return true;
        }
        if (page === 'harvester') {
            openHarvesterPicker();
            return true;
        }
        return false;
    }

    function dockConnect() {
        if (page === 'timeline') {
            timelineConnectOn = !timelineConnectOn;
            if (!timelineConnectOn) connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return true;
        }
        if (page === 'whiteboard') {
            boardTool = boardTool === 'connect' ? 'select' : 'connect';
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return true;
        }
        return false;
    }

    function isCompactNav() {
        try { return window.matchMedia('(max-width: 820px)').matches; } catch (error) { return false; }
    }

    function pageSwitchItems() {
        if (!isCompactNav()) return PAGES;
        return [{ id: 'casebook', label: 'Casebook' }].concat(PAGES);
    }

    function pageSwitchActive() {
        if (isCompactNav() && document.body.classList.contains('panel-open')) return 'casebook';
        return page;
    }

    function syncPageSwitchThumb(instant) {
        const wrap = $('pageSwitch');
        if (!wrap) return;
        const thumb = wrap.querySelector('.page-switch-thumb');
        const on = wrap.querySelector('[aria-current="page"]');
        if (!thumb || !on) return;
        const x = on.offsetLeft;
        const w = on.offsetWidth;
        if (!(w > 0)) return;
        const snap = instant || reduceMotion();
        thumb.style.transform = '';
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = x + 'px';
        thumb.style.width = w + 'px';
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function renderPageSwitch(opts) {
        const wrap = $('pageSwitch');
        if (!wrap) return;
        opts = opts || {};
        const items = pageSwitchItems();
        const active = pageSwitchActive();
        const existing = wrap.querySelectorAll('[data-page]');
        const have = Array.prototype.map.call(existing, function (el) { return el.getAttribute('data-page'); }).join(',');
        const want = items.map(function (item) { return item.id; }).join(',');
        if (have !== want) {
            wrap.innerHTML = '<span class="page-switch-thumb" aria-hidden="true"></span>' + items.map(function (item) {
                const on = item.id === active;
                return '<button type="button" role="tab" data-page="' + item.id + '"' +
                    (on ? ' aria-current="page" aria-selected="true"' : ' aria-selected="false"') +
                    '>' + esc(item.label) + '</button>';
            }).join('');
            requestAnimationFrame(function () { syncPageSwitchThumb(true); });
            return;
        }
        items.forEach(function (item) {
            const btn = wrap.querySelector('[data-page="' + item.id + '"]');
            if (!btn) return;
            const on = item.id === active;
            if (on) {
                btn.setAttribute('aria-current', 'page');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.removeAttribute('aria-current');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        syncPageSwitchThumb(!!opts.instant);
    }

    function filedFacts() {
        const facts = (profile().facts) || {};
        const out = [];
        fields().forEach(function (field) {
            (facts[field.id] || []).forEach(function (item) {
                if (!item || !String(item.value || '').trim()) return;
                out.push({
                    id: field.id,
                    label: field.label,
                    group: field.group || '',
                    value: String(item.value).trim(),
                    platform: item.platform || '',
                    platformLabel: (platformById(item.platform) || {}).label || item.platformLabel || '',
                    source: item.source || '',
                    confidence: item.confidence || '',
                    method: item.method || '',
                    capturedAt: item.capturedAt || item.addedAt || ''
                });
            });
        });
        return out;
    }

    function subjectName() {
        return firstValue('name') || 'Anonymous';
    }

    function numberedTimeline() {
        const list = (data.timeline || []).slice().sort(function (a, b) {
            const da = String(a.date || '') + 'T' + String(a.time || '00:00');
            const db = String(b.date || '') + 'T' + String(b.time || '00:00');
            if (da !== db) return da < db ? -1 : 1;
            return String(a.createdAt || '') < String(b.createdAt || '') ? -1 : 1;
        });
        list.forEach(function (item, i) { item.n = i + 1; });
        return list;
    }

    function renderAll() {
        renderPageSwitch();
        renderTimeline();
        renderWhiteboard();
        renderHarvester();
        renderDatasheet();
    }

