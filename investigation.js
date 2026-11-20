/* Assembled from the js/* files listed in CASE_ORDER.
   Edit those files, then run: python tools/bundle.py */
(function () {
    'use strict';

    const PAGES = [
        { id: 'operations', label: 'Operations', kicker: 'Dashboard', blurb: 'This browser, public security news, and breach checks.' },
        { id: 'orbit', label: 'OrbINT', kicker: 'Workspace', blurb: 'Orbit-style profile for names, usernames, emails, phones, domains, companies, and other identifiers.' },
        { id: 'timeline', label: 'Timeline', kicker: 'Chronology', blurb: 'Events and discoveries in order — who, when, evidence, and source.' },
        { id: 'whiteboard', label: 'Whiteboard', kicker: 'Diagram', blurb: 'Flowchart shapes and case cards on one board, including investigation playbooks.' },
        { id: 'notepad', label: 'Notepad', kicker: 'Notes', blurb: 'Short notes kept with this case.' },
        { id: 'harvester', label: 'Harvester', kicker: 'Processor', blurb: 'Upload messy files. Keeps names, dates, accounts, passwords, times, age, and other key data — and cuts the rest.' },
        { id: 'datasheet', label: 'Case File', kicker: 'Record', blurb: 'On-screen preview is redacted. The downloaded PDF contains the full case file.' },
        { id: 'guide', label: 'Guide', kicker: 'Operator', blurb: 'How every page works, including the map, the case file, and the dock.' }
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
    const PAGE_ANIM_MS = 180;
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
            notepad: { notes: [], active: '', links: [], layout: {}, pan: { x: 0, y: 0 } },
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
        rec.blur = '';
        if (title) rec.title = title;
        fitImageNode(rec, src);
        renderWhiteboard();
        schedulePersist();
        const probe = new Image();
        probe.onload = function () {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = Math.max(1, Math.round(16 * probe.height / Math.max(1, probe.width)));
                canvas.getContext('2d').drawImage(probe, 0, 0, canvas.width, canvas.height);
                rec.blur = canvas.toDataURL('image/jpeg', 0.45);
                rec.imgW = probe.naturalWidth || probe.width;
                rec.imgH = probe.naturalHeight || probe.height;
                renderWhiteboard();
                schedulePersist();
            } catch (error) {}
        };
        probe.src = src;
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
            if (raw.notepad && typeof raw.notepad === 'object') {
                next.notepad.notes = (Array.isArray(raw.notepad.notes) ? raw.notepad.notes : []).map(normalizeNote);
                next.notepad.active = raw.notepad.active || (next.notepad.notes[0] && next.notepad.notes[0].id) || '';
                const ids = {};
                next.notepad.notes.forEach(function (note) { ids[note.id] = true; });
                next.notepad.links = (Array.isArray(raw.notepad.links) ? raw.notepad.links : []).map(normalizeNoteLink).filter(function (link) {
                    return ids[link.from] && ids[link.to];
                });
                next.notepad.layout = normalizeNoteLayout(raw.notepad.layout);
                const pan = raw.notepad.pan;
                next.notepad.pan = {
                    x: Number(pan && pan.x) || 0,
                    y: Number(pan && pan.y) || 0
                };
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

    let splitOn = false;
    let splitRatio = 46;

    function readSplitRatio() {
        try {
            const n = Number(localStorage.getItem('orbint-split-ratio'));
            if (n >= 28 && n <= 72) return n;
        } catch (error) {}
        return 46;
    }

    function splitSidePage() {
        let side = 'operations';
        try {
            const saved = localStorage.getItem('orbint-split-page');
            if (saved && saved !== 'orbit' && PAGES.some(function (item) { return item.id === saved; })) side = saved;
        } catch (error) {}
        if (page && page !== 'orbit') side = page;
        return side;
    }

    function paintSplitButton() {
        const on = splitOn;
        const tip = on ? 'Close split' : 'Split screen';
        const btn = $('dockSplit');
        if (btn) {
            btn.classList.toggle('is-on', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.setAttribute('data-tip', tip);
            btn.setAttribute('aria-label', tip);
        }
        const phone = $('phoneSplit');
        if (phone) phone.textContent = tip;
    }

    function refreshSplitLayout() {
        if (page === 'timeline') renderTimeline();
        if (page === 'whiteboard') renderWhiteboard();
        if (page === 'notepad') renderNotepad();
        if (page === 'datasheet') sizeDatasheet();
        if (typeof opsSyncMapSize === 'function') opsSyncMapSize();
        window.dispatchEvent(new Event('resize'));
    }

    function ensureSplitBar() {
        let bar = $('splitBar');
        if (bar) return bar;
        const stage = document.querySelector('.work-stage');
        if (!stage) return null;
        bar = document.createElement('div');
        bar.id = 'splitBar';
        bar.className = 'split-bar';
        bar.hidden = true;
        bar.tabIndex = 0;
        bar.setAttribute('role', 'separator');
        bar.setAttribute('aria-orientation', 'vertical');
        bar.setAttribute('aria-label', 'Resize split');
        bar.setAttribute('aria-valuemin', '28');
        bar.setAttribute('aria-valuemax', '72');
        stage.appendChild(bar);
        function setRatio(next) {
            splitRatio = Math.min(72, Math.max(28, next));
            document.body.style.setProperty('--split-w', splitRatio + '%');
            bar.setAttribute('aria-valuenow', String(Math.round(splitRatio)));
        }
        function narrow() {
            try { return window.matchMedia('(max-width: 820px)').matches; } catch (error) { return false; }
        }
        bar.addEventListener('pointerdown', function (event) {
            if (!splitOn || event.button) return;
            event.preventDefault();
            bar.setPointerCapture(event.pointerId);
            const move = function (ev) {
                const rect = stage.getBoundingClientRect();
                const ratio = narrow()
                    ? ((ev.clientY - rect.top) / rect.height) * 100
                    : ((ev.clientX - rect.left) / rect.width) * 100;
                setRatio(ratio);
            };
            const up = function (ev) {
                if (bar.hasPointerCapture(ev.pointerId)) bar.releasePointerCapture(ev.pointerId);
                bar.removeEventListener('pointermove', move);
                bar.removeEventListener('pointerup', up);
                bar.removeEventListener('pointercancel', up);
                try { localStorage.setItem('orbint-split-ratio', String(Math.round(splitRatio))); } catch (error) {}
                refreshSplitLayout();
            };
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
            bar.addEventListener('pointercancel', up);
        });
        bar.addEventListener('dblclick', function () {
            setRatio(46);
            try { localStorage.setItem('orbint-split-ratio', '46'); } catch (error) {}
            refreshSplitLayout();
        });
        bar.addEventListener('keydown', function (event) {
            if (!splitOn) return;
            const step = event.shiftKey ? 8 : 3;
            const key = event.key;
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Home' && key !== 'End') return;
            event.preventDefault();
            if (key === 'Home') setRatio(28);
            else if (key === 'End') setRatio(72);
            else if (key === 'ArrowLeft' || key === 'ArrowUp') setRatio(splitRatio - step);
            else setRatio(splitRatio + step);
            try { localStorage.setItem('orbint-split-ratio', String(Math.round(splitRatio))); } catch (error) {}
            refreshSplitLayout();
        });
        return bar;
    }

    function applySplit() {
        document.body.classList.toggle('split-orbit', splitOn);
        document.body.style.setProperty('--split-w', splitRatio + '%');
        const bar = ensureSplitBar();
        if (bar) {
            bar.hidden = !splitOn;
            bar.setAttribute('aria-valuenow', String(Math.round(splitRatio)));
            bar.setAttribute('aria-orientation', (function () {
                try { return window.matchMedia('(max-width: 820px)').matches ? 'horizontal' : 'vertical'; } catch (error) { return 'vertical'; }
            })());
        }
        paintSplitButton();
        try { localStorage.setItem('orbint-split', splitOn ? '1' : '0'); } catch (error) {}
    }

    function restoreSplit(savedPage) {
        splitRatio = readSplitRatio();
        splitOn = false;
        try {
            splitOn = localStorage.getItem('orbint-split') === '1' && !!savedPage && savedPage !== 'orbit' && savedPage !== 'guide';
        } catch (error) {}
        applySplit();
    }

    function toggleSplit() {
        if (splitOn) {
            splitOn = false;
            applySplit();
            setPage('orbit');
            return;
        }
        splitRatio = readSplitRatio();
        const side = splitSidePage();
        splitOn = true;
        applySplit();
        if (page === side) {
            const map = $('mapStage');
            if (map) map.setAttribute('aria-hidden', 'false');
            settlePages(page);
            refreshSplitLayout();
            return;
        }
        setPage(side);
        refreshSplitLayout();
    }

    function settlePages(activeId) {
        PAGES.forEach(function (item) {
            const el = pagePane(item.id);
            if (!el) return;
            clearPageAnim(el);
            if (item.id === 'orbit') {
                el.setAttribute('aria-hidden', (activeId === 'orbit' || splitOn) ? 'false' : 'true');
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
        if (next === 'orbit' && splitOn) {
            splitOn = false;
            applySplit();
        }
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

        const skipAnim = !pageSwitchReady || prev === next || reduceMotion() || splitOn;
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
            const paint = function () {
                if (fromEl && toEl) {
                    void toEl.offsetWidth;
                    fromEl.classList.add('is-page-leave');
                    toEl.classList.add('is-page-enter');
                    pageAnimTimer = setTimeout(function () {
                        pageAnimTimer = 0;
                        settlePages(page);
                    }, PAGE_ANIM_MS);
                } else {
                    settlePages(page);
                }
            };
            if (document.startViewTransition) document.startViewTransition(paint);
            else paint();
        }

        const map = $('mapStage');
        if (map) map.setAttribute('aria-hidden', (page === 'orbit' || splitOn) ? 'false' : 'true');
        renderPageSwitch({ instant: !slideTab });
        syncDock();
        if (page === 'timeline') {
            renderTimeline();
            syncTimelineIsland();
        }
        if (page === 'whiteboard') renderWhiteboard();
        if (page === 'notepad') renderNotepad();
        if (page === 'harvester') renderHarvester();
        if (page === 'datasheet') renderDatasheet();
        if (page === 'operations') renderOperations();
        try {
            if (window.OrbINTSettings && OrbINTSettings.get('rememberPage') === false) {
                /* keep the in-memory page without writing it */
            } else {
                localStorage.setItem('orbint-page', page);
            }
            if (splitOn && page !== 'orbit') localStorage.setItem('orbint-split-page', page);
        } catch (error) {}
        paintSplitButton();
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
            notepad: 'New note',
            harvester: 'Upload file',
            operations: 'Operations'
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
        if (page === 'notepad') {
            addNotepadNote();
            return true;
        }
        if (page === 'harvester') {
            openHarvesterPicker();
            return true;
        }
        if (page === 'operations') return true;
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
        const items = PAGES.filter(function (item) { return item.id !== 'guide'; });
        if (!isCompactNav()) return items;
        return [{ id: 'casebook', label: 'Casebook' }].concat(items);
    }

    function pageSwitchActive() {
        if (isCompactNav() && document.body.classList.contains('panel-open')) return 'casebook';
        return page;
    }

    let pageSwitchResize = null;
    let pageSwitchFonts = false;

    function syncPageSwitchThumb(instant) {
        const wrap = $('pageSwitch');
        if (!wrap) return;
        const thumb = wrap.querySelector('.page-switch-thumb');
        const on = wrap.querySelector('[aria-current="page"]');
        if (!thumb || !on) return;
        const x = on.offsetLeft;
        const w = on.offsetWidth;
        if (!(w > 0)) return;
        if (thumb._orbX === x && thumb._orbW === w) return;
        thumb._orbX = x;
        thumb._orbW = w;
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
        if (isCompactNav()) {
            const pad = 16;
            const edge = on.offsetLeft;
            const far = edge + on.offsetWidth;
            if (edge < wrap.scrollLeft + pad || far > wrap.scrollLeft + wrap.clientWidth - pad) {
                wrap.scrollTo({
                    left: Math.max(0, edge - (wrap.clientWidth - on.offsetWidth) / 2),
                    behavior: snap ? 'auto' : 'smooth'
                });
            }
        }
    }

    function bindPageSwitchResize() {
        const wrap = $('pageSwitch');
        if (!wrap || typeof ResizeObserver === 'undefined') return;
        if (!pageSwitchResize) {
            pageSwitchResize = new ResizeObserver(function () {
                syncPageSwitchThumb(true);
            });
        }
        pageSwitchResize.disconnect();
        pageSwitchResize.observe(wrap);
        const buttons = wrap.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) pageSwitchResize.observe(buttons[i]);
        if (!pageSwitchFonts && document.fonts && document.fonts.ready) {
            pageSwitchFonts = true;
            document.fonts.ready.then(function () { syncPageSwitchThumb(true); });
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
            bindPageSwitchResize();
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
        bindPageSwitchResize();
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
        renderNotepad();
        renderHarvester();
        renderDatasheet();
        renderOperations();
    }


    let dsLiveTimer = 0;
    let dsMarkup = '';
    let dsRevealed = new Set();
    let dsHidden = new Set();
    let dsRevealAll = false;

    function isRedactOpen(key) {
        if (dsRevealAll) return !dsHidden.has(key || '');
        return dsRevealed.has(key || '');
    }

    function paintDatasheetSpoilers() {
        const label = dsRevealAll ? 'Hide redacted' : 'Show redacted';
        const btn = $('dockSpoilers');
        if (btn) {
            btn.classList.toggle('is-on', !!dsRevealAll);
            btn.setAttribute('aria-pressed', dsRevealAll ? 'true' : 'false');
            btn.setAttribute('data-tip', label);
            btn.setAttribute('aria-label', label);
        }
        const phone = $('phoneSpoilers');
        if (phone) {
            phone.hidden = page !== 'datasheet';
            phone.textContent = label;
        }
    }

    function applyDatasheetSpoilers() {
        const view = $('datasheetView');
        if (view) {
            view.querySelectorAll('.ds-redact').forEach(function (btn) {
                const key = btn.getAttribute('data-redact') || '';
                btn.classList.toggle('is-open', isRedactOpen(key));
            });
        }
        paintDatasheetSpoilers();
    }

    function toggleDatasheetSpoilers() {
        dsRevealAll = !dsRevealAll;
        dsRevealed = new Set();
        dsHidden = new Set();
        applyDatasheetSpoilers();
        dsMarkup = '';
        renderDatasheet();
    }

    let dsOpening = null;
    let dsSuppressClick = false;

    function dsLocked() {
        return !!(host && host.readonly && host.readonly());
    }

    function dsSpec(row) {
        if (!row) return null;
        return {
            kind: row.getAttribute('data-ds-edit') || '',
            id: row.getAttribute('data-ds-id') || '',
            key: row.getAttribute('data-ds-key') || '',
            raw: row.getAttribute('data-ds-raw') || '',
            match: row.getAttribute('data-ds-match') || ''
        };
    }

    function dsPageIndex(page) {
        const view = $('datasheetView');
        if (!view || !page) return -1;
        return Array.prototype.indexOf.call(view.querySelectorAll('.ds-page'), page);
    }

    function dsFindRow(spec) {
        const view = $('datasheetView');
        if (!view || !spec) return null;
        const rows = view.querySelectorAll('[data-ds-edit]');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if ((row.getAttribute('data-ds-edit') || '') !== spec.kind) continue;
            if ((row.getAttribute('data-ds-id') || '') !== spec.id) continue;
            if ((row.getAttribute('data-ds-key') || '') !== spec.key) continue;
            if ((row.getAttribute('data-ds-match') || '') !== (spec.match || '')) continue;
            if (spec.raw && (row.getAttribute('data-ds-raw') || '') !== spec.raw) continue;
            return row;
        }
        return null;
    }

    function dsToggleRedact(btn) {
        const key = btn.getAttribute('data-redact') || '';
        const on = !btn.classList.contains('is-open');
        btn.classList.toggle('is-open', on);
        if (dsRevealAll) {
            if (on) dsHidden.delete(key);
            else dsHidden.add(key);
        } else if (on) dsRevealed.add(key);
        else dsRevealed.delete(key);
    }

    function dsChanged(next, show, raw) {
        if (next === show || next === raw) return false;
        if (!next && !show && !raw) return false;
        return true;
    }

    function dsApplyEdit(kind, id, key, raw, show, next, inputMatch) {
        if (!dsChanged(next, show, raw)) return;
        if (kind === 'case') {
            if (host && host.writeCaseField) host.writeCaseField(key, next);
            return;
        }
        if (kind === 'fact') {
            const match = inputMatch || raw;
            if (host && host.patchProfileFact) host.patchProfileFact(id, match, key === 'source' ? 'source' : 'value', next);
            return;
        }
        if (kind === 'note') {
            if (key === 'analysis') {
                if (host && host.writeAnalysis) host.writeAnalysis(next);
                return;
            }
            if (key === 'evidence') {
                const item = (data.evidence || [])[Number(id)];
                if (item) item.note = next;
                schedulePersist();
                return;
            }
            if (host && host.patchProfileFact) host.patchProfileFact(id || 'notes', raw, 'value', next);
            return;
        }
        if (kind === 'note-new') {
            if (next && host && host.addFact) host.addFact('notes', next);
            return;
        }
        if (kind === 'event') {
            const ev = (data.timeline || []).find(function (item) { return item && item.id === id; });
            if (!ev) return;
            if (key === 'body' && show !== raw) ev.moreNotes = [];
            ev[key] = next;
            schedulePersist();
            renderTimeline();
            return;
        }
        if (kind === 'board') {
            const node = ((data.whiteboard && data.whiteboard.nodes) || []).find(function (item) { return item && item.id === id; });
            if (!node) return;
            node[key] = next;
            schedulePersist();
            renderWhiteboard();
            return;
        }
        if (kind === 'pad') {
            const note = ((data.notepad && data.notepad.notes) || []).find(function (item) { return item && item.id === id; });
            if (!note) return;
            note[key] = next;
            if (key === 'body') note.html = '';
            schedulePersist();
            renderNotepad();
            return;
        }
        if (kind === 'harvest') {
            const hit = ((data.harvester && data.harvester.hits) || [])[Number(id)];
            if (!hit) return;
            hit[key] = next;
            schedulePersist();
            renderHarvester();
        }
    }

    function dsFinishEdit(nextOpen) {
        dsOpening = null;
        dsClearEditors();
        dsMarkup = '';
        renderDatasheet();
        if (!nextOpen) return;
        if (nextOpen.kind === 'note-new') {
            const pages = ($('datasheetView') || {}).querySelectorAll ? $('datasheetView').querySelectorAll('.ds-page') : [];
            dsOpenNote(pages[nextOpen.page], nextOpen.x, nextOpen.y);
            return;
        }
        const row = dsFindRow(nextOpen);
        if (row) dsOpenEditor(row);
    }

    function dsCommitEditor(input, cancel) {
        if (!input || input.dataset.dsDone) return;
        input.dataset.dsDone = '1';
        const kind = input.getAttribute('data-ds-kind') || '';
        const id = input.getAttribute('data-ds-id') || '';
        const key = input.getAttribute('data-ds-key') || '';
        const raw = input.getAttribute('data-ds-raw') || '';
        const show = input.getAttribute('data-ds-show') || '';
        const multiline = input.tagName === 'TEXTAREA';
        const next = multiline
            ? String(input.value || '').replace(/\s+$/g, '').replace(/^\s+/g, '')
            : String(input.value || '').replace(/\s+/g, ' ').trim();
        const match = input.getAttribute('data-ds-match') || '';
        const hold = cancel ? null : dsOpening;
        dsOpening = null;
        if (input.parentNode) input.remove();
        if (!cancel) dsApplyEdit(kind, id, key, raw, show, next, match);
        dsFinishEdit(hold);
    }

    function dsClearEditors() {
        const view = $('datasheetView');
        if (!view) return;
        view.querySelectorAll('.ds-inline, .ds-status-edit').forEach(function (el) { el.remove(); });
    }

    function dsPlaceCaret(input) {
        input.focus();
        const n = input.value.length;
        if (input.setSelectionRange) input.setSelectionRange(n, n);
    }

    function dsBindEditor(input) {
        input.addEventListener('mousedown', function (event) { event.stopPropagation(); });
        input.addEventListener('click', function (event) { event.stopPropagation(); });
        input.addEventListener('blur', function () { dsCommitEditor(input, false); });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                dsOpening = null;
                dsCommitEditor(input, true);
                return;
            }
            if (event.key === 'Enter' && (input.tagName !== 'TEXTAREA' || !event.shiftKey)) {
                event.preventDefault();
                input.blur();
            }
        });
    }

    function dsOpenEditor(row) {
        if (!row || dsLocked() || row.querySelector('.ds-inline, .ds-status-edit')) return;
        const kind = row.getAttribute('data-ds-edit') || '';
        const key = row.getAttribute('data-ds-key') || '';
        if (kind === 'case' && key === 'status') {
            dsOpenStatus(row);
            return;
        }
        const show = row.getAttribute('data-ds-show') || '';
        const raw = row.getAttribute('data-ds-raw') || '';
        const multiline = kind === 'note' || show.indexOf('\n') >= 0 || raw.indexOf('\n') >= 0;
        const input = document.createElement(multiline ? 'textarea' : 'input');
        input.className = 'ds-inline';
        if (!multiline) {
            input.type = 'text';
            if (kind === 'case' && key === 'number') input.maxLength = 48;
            if (kind === 'case' && key === 'offense') input.maxLength = 80;
            if (kind === 'case' && key === 'investigator') input.maxLength = 48;
            if (kind !== 'case') input.maxLength = 4000;
        } else input.maxLength = 4000;
        input.spellcheck = false;
        input.autocomplete = 'off';
        input.placeholder = show || raw ? '' : '--';
        input.value = show || raw;
        input.setAttribute('data-ds-kind', kind);
        input.setAttribute('data-ds-id', row.getAttribute('data-ds-id') || '');
        input.setAttribute('data-ds-key', key);
        input.setAttribute('data-ds-raw', raw);
        input.setAttribute('data-ds-show', show);
        input.setAttribute('data-ds-match', row.getAttribute('data-ds-match') || '');
        const label = row.querySelector('.ds-fill-k');
        if (label) input.setAttribute('aria-label', label.textContent || 'Edit');
        row.classList.add('is-editing');
        if (row.classList.contains('ds-note')) {
            row.textContent = '';
            row.appendChild(input);
        } else {
            const slot = row.querySelector('.ds-fill-v');
            if (!slot) return;
            slot.textContent = '';
            slot.appendChild(input);
        }
        dsBindEditor(input);
        dsPlaceCaret(input);
    }

    function dsOpenStatus(row) {
        const slot = row.querySelector('.ds-fill-v');
        if (!slot) return;
        const current = row.getAttribute('data-ds-raw') || 'open';
        const choices = [['open', 'Open'], ['inactive', 'Inactive'], ['closed', 'Closed']];
        const bar = document.createElement('span');
        bar.className = 'ds-status-edit';
        bar.addEventListener('mousedown', function (event) { event.stopPropagation(); });
        choices.forEach(function (pair) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = pair[1];
            if (pair[0] === current) btn.className = 'is-on';
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                dsOpening = null;
                if (host && host.writeCaseField) host.writeCaseField('status', pair[0]);
                dsFinishEdit(null);
            });
            bar.appendChild(btn);
        });
        row.classList.add('is-editing');
        slot.textContent = '';
        slot.appendChild(bar);
    }

    function dsOpenNote(page, clientX, clientY) {
        if (!page || dsLocked() || page.querySelector('.ds-inline')) return;
        const input = document.createElement('textarea');
        input.className = 'ds-inline ds-inline-note';
        input.maxLength = 4000;
        input.rows = 2;
        input.spellcheck = false;
        input.placeholder = 'Add to the record';
        input.setAttribute('aria-label', 'Add to the record');
        input.setAttribute('data-ds-kind', 'note-new');
        const rect = page.getBoundingClientRect();
        const scale = rect.width / (page.offsetWidth || 612) || 1;
        const localX = Number.isFinite(clientX) ? (clientX - rect.left) / scale : 72;
        const localY = Number.isFinite(clientY) ? (clientY - rect.top) / scale : 120;
        const left = Math.max(72, Math.min(localX, 430));
        const top = Math.max(86, Math.min(localY, 700));
        input.style.left = left + 'px';
        input.style.top = top + 'px';
        input.style.width = Math.max(140, 540 - left) + 'px';
        page.appendChild(input);
        dsBindEditor(input);
        input.focus();
    }

    function dsPaperTarget(event) {
        const page = event.target.closest('.ds-page');
        if (!page) return null;
        if (event.target.closest('.ds-headband, .ds-footband, .ds-cover, .ds-close, .ds-h, .ds-redact-photo, .ds-fill, .ds-item, .ds-meta, .ds-pair, .ds-case, .ds-p, .ds-cap')) return null;
        if (page.classList.contains('is-first') || page.classList.contains('is-close-page')) return null;
        return page;
    }

    function bindDatasheet() {
        const view = $('datasheetView');
        if (view && !view.dataset.redactBound) {
            view.dataset.redactBound = '1';
            view.addEventListener('mousedown', function (event) {
                if (event.button !== 0) return;
                const inline = view.querySelector('.ds-inline');
                const status = view.querySelector('.ds-status-edit');
                if (!inline && !status) return;
                if (event.target.closest('.ds-inline, .ds-status-edit')) return;
                const row = event.target.closest('[data-ds-edit]');
                const page = dsPaperTarget(event);
                dsSuppressClick = true;
                if (row) dsOpening = dsSpec(row);
                else if (page) dsOpening = { kind: 'note-new', page: dsPageIndex(page), x: event.clientX, y: event.clientY };
                else dsOpening = null;
                if (inline) return;
                dsFinishEdit(dsOpening);
            });
            view.addEventListener('click', function (event) {
                if (dsSuppressClick) {
                    dsSuppressClick = false;
                    return;
                }
                if (event.target.closest('.ds-inline, .ds-status-edit')) return;
                const photo = event.target.closest('.ds-redact-photo');
                if (photo) {
                    event.preventDefault();
                    dsToggleRedact(photo);
                    return;
                }
                const row = event.target.closest('[data-ds-edit]');
                if (row) {
                    event.preventDefault();
                    dsOpenEditor(row);
                    return;
                }
                const page = dsPaperTarget(event);
                if (!page) return;
                event.preventDefault();
                dsOpenNote(page, event.clientX, event.clientY);
            });
        }
        const dockBtn = $('dockSpoilers');
        if (dockBtn && !dockBtn.dataset.boundSpoilers) {
            dockBtn.dataset.boundSpoilers = '1';
            dockBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        const phoneBtn = $('phoneSpoilers');
        if (phoneBtn && !phoneBtn.dataset.boundSpoilers) {
            phoneBtn.dataset.boundSpoilers = '1';
            phoneBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        paintDatasheetSpoilers();
    }

    function renderDatasheet() {
        const view = $('datasheetView');
        if (!view) return;
        bindDatasheet();
        view.classList.toggle('is-locked', dsLocked());
        if (view.querySelector('.ds-inline, .ds-status-edit')) {
            dsMarkup = '';
            return;
        }
        const html = reportPreviewMarkup();
        if (html === dsMarkup && view.firstChild) {
            sizeDatasheet();
            applyDatasheetSpoilers();
            return;
        }
        dsMarkup = html;
        const y = view.scrollTop;
        view.innerHTML = html;
        applyDatasheetSpoilers();
        sizeDatasheet();
        view.scrollTop = y;
        requestAnimationFrame(function () {
            sizeDatasheet();
            view.scrollTop = y;
        });
    }

    function scheduleDatasheet() {
        if (page !== 'datasheet') return;
        clearTimeout(dsLiveTimer);
        dsLiveTimer = setTimeout(function () {
            dsLiveTimer = 0;
            renderDatasheet();
        }, 60);
    }


    const TL_AXIS_Y = 480;
    const TL_ORIGIN_X = 88;
    const TL_STAGE_W = 8000;
    const TL_STAGE_H = 2400;
    const TL_CARD_W = 272;
    const TL_CARD_MIN_W = 160;
    const TL_CARD_MAX_W = 2400;
    const TL_CARD_MIN_H = 86;
    const TL_CARD_MAX_H = 2400;
    const TL_GAP = 280;
    const TL_STEM = 64;
    const TL_AXIS_CLEAR = TL_STEM;
    const TL_MIN_DX = TL_CARD_W + 40;
    const TL_CTRL = 'button, input, textarea, [contenteditable="true"], [data-tl-info], [data-tl-cal], [data-tl-time], [data-tl-mini], [data-tl-fold], [data-tl-drop], [data-del-event], [data-connect-event], [data-tl-photo], [data-tl-add], [data-tl-expand], .tl-acts, .tl-attach, .tl-media, .tl-thumb, .tl-bit-btn';
    let tlAimX = 220;
    let tlNodeObs = null;
    let tlStemRedraw = 0;
    let tlStemTrack = 0;

    function tlHitFromPoint(x, y, selector) {
        if (typeof document.elementsFromPoint !== 'function') return null;
        const stack = document.elementsFromPoint(x, y) || [];
        const sel = selector || TL_CTRL;
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (!el || !el.closest) continue;
            if (el.closest('.tl-rs, .cal-pop, #timelineMenu, #timelineIsland')) {
                if (el.closest('.cal-pop')) {
                    const hit = el.closest(sel);
                    if (hit) return hit;
                }
                continue;
            }
            const hit = el.closest(sel);
            if (hit) return hit;
        }
        return null;
    }

    function tlCardW(ev) {
        const n = Number(ev && ev.w);
        if (n >= TL_CARD_MIN_W) return Math.min(TL_CARD_MAX_W, n);
        return TL_CARD_W;
    }

    function tlCardH(ev) {
        const n = Number(ev && ev.h);
        if (n >= TL_CARD_MIN_H) return Math.min(TL_CARD_MAX_H, n);
        return 0;
    }

    function tlNodeH(el, ev) {
        const card = el && el.querySelector('.tl-card');
        return Math.max(
            (card && card.offsetHeight) || 0,
            (el && el.offsetHeight) || 0,
            tlCardH(ev) || 0,
            86
        );
    }

    function tlNaturalH(el) {
        if (!el) return 86;
        const card = el.querySelector('.tl-card');
        const sized = el.classList.contains('is-sized');
        if (!sized) {
            return Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        }
        const extra = el.querySelector('.tl-extra-inner');
        const clipped = (extra && extra.scrollHeight > extra.clientHeight + 1) ||
            (card && card.scrollHeight > card.clientHeight + 1);
        if (!clipped) {
            return Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        }
        const prev = el.style.height;
        el.classList.remove('is-sized');
        el.style.height = 'auto';
        const h = Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
        el.style.height = prev;
        el.classList.add('is-sized');
        return h;
    }

    function tlFitNodeHeight(el, ev) {
        if (!el || !ev || ev.mini) return tlNodeH(el, ev);
        const natural = tlNaturalH(el);
        const locked = tlCardH(ev);
        if (locked) {
            if (natural > locked + 1) {
                ev.h = Math.min(TL_CARD_MAX_H, natural);
                el.style.height = ev.h + 'px';
                el.classList.add('is-sized');
                return ev.h;
            }
            return Math.max(locked, tlNodeH(el, ev));
        }
        return natural;
    }

    function tlFacingSide(top, h, stored) {
        const bottom = top + h;
        if (top >= TL_AXIS_Y - 8) return 1;
        if (bottom <= TL_AXIS_Y + 8) return -1;
        if (stored === 1 || stored === -1) return stored;
        return (top + h / 2) >= TL_AXIS_Y ? 1 : -1;
    }

    function tlPlantTop(side, h, freeTop, free) {
        const natural = side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
        if (!free || !isFinite(freeTop)) return natural;
        return tlKeepClearOfAxis(side, freeTop, h);
    }

    function placeTlCard(el, rec) {
        if (!el || !rec) return;
        const w = tlCardW(rec);
        const h = tlCardH(rec);
        el.style.width = w + 'px';
        el.style.left = ((Number(rec.pinX) || 0) - w / 2) + 'px';
        el.style.top = (Number(rec.pinY) || 0) + 'px';
        if (h && !rec.mini) {
            el.style.height = h + 'px';
            el.classList.add('is-sized');
        } else {
            el.style.height = '';
            if (h) el.classList.add('is-sized');
            else el.classList.remove('is-sized');
        }
    }

    function tlResizeCursor(handle) {
        if (handle === 'e' || handle === 'w') return 'ew-resize';
        if (handle === 'n' || handle === 's') return 'ns-resize';
        if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
        return 'nwse-resize';
    }

    function applyTlResize(rec, drag, dx, dy) {
        if (!rec || !drag) return;
        let handle = drag.handle || 'se';
        if (rec.mini) handle = handle.replace(/[ns]/g, '');
        if (!handle) return;
        const ow = drag.ow;
        const oh = drag.oh;
        const right = drag.ox - ow / 2 + ow;
        const bottom = drag.oy + oh;
        let w = ow;
        let h = oh;
        if (handle.indexOf('e') !== -1) w = ow + dx;
        if (handle.indexOf('w') !== -1) w = ow - dx;
        if (handle.indexOf('s') !== -1) h = oh + dy;
        if (handle.indexOf('n') !== -1) h = oh - dy;
        w = Math.round(Math.max(TL_CARD_MIN_W, Math.min(TL_CARD_MAX_W, w)));
        h = Math.round(Math.max(TL_CARD_MIN_H, Math.min(TL_CARD_MAX_H, h)));
        let left = drag.ox - ow / 2;
        let top = drag.oy;
        if (handle.indexOf('w') !== -1) left = right - w;
        if (handle.indexOf('n') !== -1) top = bottom - h;
        rec.w = w;
        rec.pinX = clampTimelineX(left + w / 2);
        rec.pinned = true;
        rec.free = true;
        if (!rec.mini) {
            rec.h = h;
            rec.pinY = top;
            rec.side = (rec.pinY + h / 2) >= TL_AXIS_Y ? 1 : -1;
        }
    }

    function clampTimelineX(x) {
        const n = Number(x);
        if (!isFinite(n)) return TL_ORIGIN_X;
        return Math.max(TL_ORIGIN_X, Math.min(TL_STAGE_W - 160, n));
    }

    function timelineCam() {
        if (!data.timelineView || typeof data.timelineView !== 'object') data.timelineView = { x: 48, y: 40, z: 1 };
        if (!(data.timelineView.z > 0)) data.timelineView.z = 1;
        return data.timelineView;
    }

    let tlCamAnim = 0;
    let tlCamAim = null;

    function timelineCamClose(a, b) {
        return !!a && !!b && Math.abs(a.x - b.x) < 0.6 && Math.abs(a.y - b.y) < 0.6 && Math.abs((a.z || 1) - (b.z || 1)) < 0.004;
    }

    function stopTimelineCamAnim() {
        if (tlCamAnim) cancelAnimationFrame(tlCamAnim);
        tlCamAnim = 0;
        tlCamAim = null;
    }

    function easeTimelineCam(target) {
        const cam = timelineCam();
        const to = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
            z: target.z > 0 ? target.z : 1
        };
        if (tlCamAnim && timelineCamClose(tlCamAim, to)) return;
        const from = { x: cam.x, y: cam.y, z: cam.z || 1 };
        if (timelineCamClose(from, to) || reduceMotion()) {
            stopTimelineCamAnim();
            cam.x = to.x;
            cam.y = to.y;
            cam.z = to.z;
            applyTimelineCam();
            drawTimelineAxis();
            return;
        }
        stopTimelineCamAnim();
        tlCamAim = to;
        const t0 = performance.now();
        const ms = 500;
        function frame(now) {
            const t = Math.min(1, (now - t0) / ms);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            cam.x = from.x + (to.x - from.x) * e;
            cam.y = from.y + (to.y - from.y) * e;
            cam.z = from.z + (to.z - from.z) * e;
            applyTimelineCam();
            if (t < 1) {
                tlCamAnim = requestAnimationFrame(frame);
                return;
            }
            cam.x = to.x;
            cam.y = to.y;
            cam.z = to.z;
            tlCamAnim = 0;
            tlCamAim = null;
            applyTimelineCam();
            drawTimelineAxis();
            schedulePersist();
        }
        tlCamAnim = requestAnimationFrame(frame);
    }

    function applyTimelineCam() {
        const stage = $('timelineStage');
        const cam = timelineCam();
        if (stage) stage.style.transform = 'translate(' + cam.x + 'px,' + cam.y + 'px) scale(' + cam.z + ')';
        const label = $('timelineZoomLabel');
        if (label) label.textContent = Math.round(cam.z * 100) + '%';
        const btn = $('timelineConnectBtn');
        if (btn) btn.classList.toggle('is-on', timelineConnectOn);
        const view = $('timelineView');
        if (view) view.classList.toggle('is-connect', timelineConnectOn);
        syncDock();
        syncTimelineIsland();
    }

    function hideTimelineIsland(instant) {
        const island = $('timelineIsland');
        if (!island) return;
        const alreadyOut = island.classList.contains('is-out') && !island.classList.contains('is-on');
        if (alreadyOut && !instant) return;
        island.classList.remove('is-on', 'is-connect');
        island.classList.add('is-out');
        island.setAttribute('aria-hidden', 'true');
        clearTimeout(tlIslandHide);
        if (instant || reduceMotion()) return;
    }

    function syncTimelineIsland() {
        const island = $('timelineIsland');
        const label = $('timelineIslandText');
        const hint = $('timelineHint');
        if (hint) {
            hint.hidden = true;
            hint.textContent = '';
        }
        if (!island) return;
        const connecting = !!timelineConnectOn;
        const empty = !(data.timeline && data.timeline.length);
        if (!connecting && !empty) {
            hideTimelineIsland();
            return;
        }
        clearTimeout(tlIslandHide);
        const text = connecting
            ? (connectFrom ? 'Click the second card to connect them.' : 'Click two cards to connect them.')
            : 'Click the number line to add a card';
        if (label) label.textContent = text;
        island.classList.toggle('is-connect', connecting);
        island.hidden = false;
        island.removeAttribute('hidden');
        island.setAttribute('aria-hidden', 'false');
        if (island.classList.contains('is-on') && !island.classList.contains('is-out')) return;
        island.classList.remove('is-on');
        island.classList.add('is-out');
        void island.offsetWidth;
        requestAnimationFrame(function () {
            island.classList.remove('is-out');
            island.classList.add('is-on');
        });
    }

    function relatedIds(ev) {
        const ids = {};
        (ev.links || []).forEach(function (link) { if (link && link.to) ids[link.to] = true; });
        (data.timeline || []).forEach(function (other) {
            (other.links || []).forEach(function (link) {
                if (link.to === ev.id) ids[other.id] = true;
            });
        });
        return Object.keys(ids);
    }

    function formatDayLabel(date) {
        if (!date) return 'Undated';
        const parts = String(date).split('-');
        if (parts.length !== 3) return date;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = months[Number(parts[1]) - 1] || parts[1];
        return parts[2] + ' ' + m + ' ' + parts[0];
    }

    function eventStamp(ev) {
        if (!ev || !ev.date) return 0;
        const t = Date.parse(String(ev.date) + 'T' + (ev.time || '00:00:00'));
        return isNaN(t) ? 0 : t;
    }

    function layoutTimelineEvents() {
        const events = numberedTimeline();
        const dated = events.filter(function (ev) { return ev.date && !ev.pinned; });
        const loose = events.filter(function (ev) { return !ev.date && !ev.pinned; });
        let min = Infinity;
        let max = -Infinity;
        dated.forEach(function (ev) {
            const t = eventStamp(ev);
            if (t < min) min = t;
            if (t > max) max = t;
        });
        if (!isFinite(min)) { min = 0; max = 1; }
        if (min === max) max = min + 86400000;
        const span = Math.max(dated.length * TL_GAP, 720);
        dated.forEach(function (ev, i) {
            const u = (eventStamp(ev) - min) / (max - min);
            ev.pinX = 180 + u * span;
            if (ev.side !== 1 && ev.side !== -1) ev.side = i % 2 === 0 ? -1 : 1;
        });
        loose.forEach(function (ev, i) {
            ev.pinX = 180 + span + 80 + i * TL_GAP;
            if (ev.side !== 1 && ev.side !== -1) ev.side = (dated.length + i) % 2 === 0 ? -1 : 1;
        });
        events.forEach(function (ev) {
            ev.pinX = clampTimelineX(ev.pinX);
            if (ev.side !== 1 && ev.side !== -1) ev.side = -1;
        });
        return events;
    }

    function tlKeepClearOfAxis(side, top, h) {
        if (side === 1) return Math.max(top, TL_AXIS_Y + TL_AXIS_CLEAR);
        const maxBottom = TL_AXIS_Y - TL_AXIS_CLEAR;
        if (top + h > maxBottom) return maxBottom - h;
        return top;
    }

    function stackTimelineStems(preferId) {
        const list = $('timelineList');
        if (!list) return;
        const GAP = 16;
        const OVERLAP = 8;
        const items = (data.timeline || []).map(function (ev) {
            const el = list.querySelector('[data-event="' + ev.id + '"]');
            if (!el || el.classList.contains('is-out') || el.classList.contains('is-moving') || el.classList.contains('is-resizing')) return null;
            const h = tlFitNodeHeight(el, ev);
            const w = el.offsetWidth || tlCardW(ev);
            const left = parseFloat(el.style.left);
            const top = parseFloat(el.style.top);
            return {
                ev: ev,
                el: el,
                h: h,
                left: isFinite(left) ? left : (Number(ev.pinX) || 0) - w / 2,
                right: (isFinite(left) ? left : (Number(ev.pinX) || 0) - w / 2) + w,
                top0: isFinite(top) ? top : (Number(ev.pinY) || 0)
            };
        }).filter(Boolean);
        items.forEach(function (item) {
            item.side = tlFacingSide(item.top0, item.h, item.ev.side);
        });
        [-1, 1].forEach(function (side) {
            const group = items.filter(function (item) { return item.side === side; }).sort(function (a, b) {
                if (preferId) {
                    if (a.ev.id === preferId) return 1;
                    if (b.ev.id === preferId) return -1;
                }
                const ca = String(a.ev.createdAt || '');
                const cb = String(b.ev.createdAt || '');
                if (ca !== cb) return ca < cb ? -1 : 1;
                return a.left - b.left;
            });
            const placed = [];
            group.forEach(function (item) {
                let top = item.ev.locked && isFinite(item.top0)
                    ? item.top0
                    : tlPlantTop(side, item.h, item.top0, !!(item.ev.free && isFinite(item.top0)));
                if (!item.ev.locked) top = tlKeepClearOfAxis(side, top, item.h);
                if (!item.ev.locked) {
                    let guard = 0;
                    while (guard++ < 64) {
                        const box = { left: item.left, right: item.right, top: top, bottom: top + item.h };
                        let bump = 0;
                        placed.forEach(function (p) {
                            const ox = box.left < p.right - OVERLAP && p.left < box.right - OVERLAP;
                            const oy = box.top < p.bottom + GAP && p.top < box.bottom + GAP;
                            if (!ox || !oy) return;
                            if (side === 1) bump = Math.max(bump, p.bottom + GAP - box.top);
                            else bump = Math.max(bump, box.bottom + GAP - p.top);
                        });
                        if (bump <= 0) break;
                        top += side === 1 ? bump : -bump;
                    }
                }
                item.ev.pinY = top;
                item.ev.side = side;
                item.el.style.top = top + 'px';
                item.el.setAttribute('data-side', side === 1 ? '1' : '-1');
                placed.push({ left: item.left, right: item.right, top: top, bottom: top + item.h });
            });
        });
    }

    function axisEnd() {
        let maxX = 2480;
        (data.timeline || []).forEach(function (ev) {
            maxX = Math.max(maxX, (Number(ev.pinX) || 0) + 420);
        });
        return Math.min(TL_STAGE_W - 80, maxX);
    }

    function timelineWorldAt(clientX, clientY) {
        const view = $('timelineView');
        const cam = timelineCam();
        if (!view) return { x: 0, y: 0, cam: cam };
        const rect = view.getBoundingClientRect();
        return {
            x: (clientX - rect.left - cam.x) / (cam.z || 1),
            y: (clientY - rect.top - cam.y) / (cam.z || 1),
            cam: cam
        };
    }

    function nearTlAxis(world) {
        const cam = (world && world.cam) || timelineCam();
        const slop = 28 / (cam.z || 1);
        const x0 = TL_ORIGIN_X;
        const x1 = axisEnd() + 160;
        return world.x >= x0 && world.x <= x1 && Math.abs(world.y - TL_AXIS_Y) <= slop;
    }

    function hideTlFollow() {
        const follow = $('timelineFollow');
        const view = $('timelineView');
        if (follow) follow.hidden = true;
        if (view) view.classList.remove('is-aim');
    }

    function updateTlFollow(world, overNode) {
        const follow = $('timelineFollow');
        const view = $('timelineView');
        if (!follow || !view) return;
        if (overNode || !nearTlAxis(world)) {
            hideTlFollow();
            return;
        }
        tlAimX = Math.max(TL_ORIGIN_X, world.x);
        follow.hidden = false;
        follow.style.left = tlAimX + 'px';
        follow.style.top = TL_AXIS_Y + 'px';
        view.classList.add('is-aim');
    }

    function cardTop(ev, height) {
        if (ev && ev.pinY != null && isFinite(Number(ev.pinY))) return Number(ev.pinY);
        const h = height || 168;
        return ev.side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
    }

    const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const CAL_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const CAL_DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function calPad(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function calIso(y, m, d) {
        return y + '-' + calPad(m + 1) + '-' + calPad(d);
    }

    function parseCalIso(value) {
        const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
        if (!hit) return null;
        const y = Number(hit[1]);
        const m = Number(hit[2]) - 1;
        const d = Number(hit[3]);
        if (!y || m < 0 || m > 11 || d < 1 || d > 31) return null;
        return { y: y, m: m, d: d };
    }

    function parseCalAny(value) {
        const exact = parseCalIso(value);
        if (exact) return exact;
        const d = new Date(value);
        if (!Number.isFinite(d.getTime())) return null;
        return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
    }

    function stampFromIso(iso) {
        const d = iso ? new Date(iso) : null;
        if (!d || !Number.isFinite(d.getTime())) return null;
        return {
            date: calIso(d.getFullYear(), d.getMonth(), d.getDate()),
            h: d.getHours(),
            m: d.getMinutes()
        };
    }

    function isoFromStamp(dateIso, h, m) {
        const parsed = parseCalIso(dateIso);
        if (!parsed) return '';
        const dt = new Date(parsed.y, parsed.m, parsed.d, ((h % 24) + 24) % 24, ((m % 60) + 60) % 60, 0, 0);
        return dt.toISOString();
    }

    function readFactStamp(factId) {
        return (host && host.getFactCaptured && host.getFactCaptured(factId)) || '';
    }

    function writeFactStamp(factId, iso) {
        if (host && host.setFactCaptured) host.setFactCaptured(factId, iso || '');
    }

    function factStampLocked() {
        return !!(host && host.readonly && host.readonly());
    }

    function calNavSvg(dir) {
        return dir === 'prev'
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 9 12l5.5 6"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6 15 12l-5.5 6"/></svg>';
    }

    function syncEventDateBtn() {
        const btn = $('eventDateBtn');
        const field = $('eventDate');
        if (!btn || !field) return;
        const value = field.value;
        btn.classList.toggle('is-empty', !value);
        btn.innerHTML = esc(value ? formatDayLabel(value) : 'Date') +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/></svg>';
    }

    function closeCalendar() {
        const pop = $('calPop');
        if (calState && calState.anchor) calState.anchor.setAttribute('aria-expanded', 'false');
        calState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeCalendar() {
        const pop = $('calPop');
        if (!pop || pop.hidden || !calState || !calState.anchor) return;
        const r = calState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 292;
        const h = pop.offsetHeight || 320;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function paintCalendar() {
        const pop = $('calPop');
        if (!pop || !calState) return;
        const now = new Date();
        const todayIso = calIso(now.getFullYear(), now.getMonth(), now.getDate());
        const sel = parseCalIso(calState.value);
        const y = calState.y;
        const m = calState.m;
        const mode = calState.mode || 'days';
        let title = CAL_MONTHS[m] + ' ' + y;
        if (mode === 'months') title = String(y);
        if (mode === 'years') {
            const start = Math.floor(y / 12) * 12;
            title = start + ' – ' + (start + 11);
        }
        let body = '';
        if (mode === 'months') {
            body = '<div class="cal-months">' + CAL_MONTHS_SHORT.map(function (name, i) {
                return '<button type="button" class="cal-chip' + (i === m ? ' is-on' : '') + '" data-cal="month" data-m="' + i + '">' + name + '</button>';
            }).join('') + '</div>';
        } else if (mode === 'years') {
            const start = Math.floor(y / 12) * 12;
            const chips = [];
            for (let n = start; n < start + 12; n++) {
                chips.push('<button type="button" class="cal-chip' + (n === y ? ' is-on' : '') + '" data-cal="year" data-y="' + n + '">' + n + '</button>');
            }
            body = '<div class="cal-years">' + chips.join('') + '</div>';
        } else {
            const first = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            const prevDays = new Date(y, m, 0).getDate();
            const cells = [];
            CAL_DOW.forEach(function (d) { cells.push('<span class="cal-dow">' + d + '</span>'); });
            for (let i = 0; i < 42; i++) {
                let cellY = y;
                let cellM = m;
                let cellD;
                if (i < first) {
                    cellM = m - 1;
                    if (cellM < 0) { cellM = 11; cellY -= 1; }
                    cellD = prevDays - first + i + 1;
                } else if (i >= first + days) {
                    cellM = m + 1;
                    if (cellM > 11) { cellM = 0; cellY += 1; }
                    cellD = i - first - days + 1;
                } else {
                    cellD = i - first + 1;
                }
                const iso = calIso(cellY, cellM, cellD);
                const mute = cellM !== m ? ' is-mute' : '';
                const on = sel && iso === calIso(sel.y, sel.m, sel.d) ? ' is-on' : '';
                const today = iso === todayIso ? ' is-today' : '';
                cells.push('<button type="button" class="cal-day' + mute + on + today + '" data-cal="day" data-iso="' + iso + '">' + cellD + '</button>');
            }
            body = '<div class="cal-grid">' + cells.join('') + '</div>';
        }
        pop.innerHTML =
            '<div class="cal-head">' +
            '<button type="button" class="cal-nav" data-cal="prev" aria-label="Previous">' + calNavSvg('prev') + '</button>' +
            '<button type="button" class="cal-title" data-cal="title">' + esc(title) + '</button>' +
            '<button type="button" class="cal-nav" data-cal="next" aria-label="Next">' + calNavSvg('next') + '</button>' +
            '</div>' + body +
            '<div class="cal-foot">' +
            '<button type="button" data-cal="clear">Clear</button>' +
            '<button type="button" data-cal="today">Today</button>' +
            '</div>';
        pop.hidden = false;
        placeCalendar();
    }

    function openCalendar(anchor) {
        if (!anchor) return;
        if (calState && calState.anchor === anchor) {
            closeCalendar();
            return;
        }
        const eventId = anchor.getAttribute('data-tl-cal') || '';
        const factId = anchor.getAttribute('data-fact-cal') || '';
        if (factId && factStampLocked()) return;
        let value = '';
        if (factId) {
            const stamp = stampFromIso(readFactStamp(factId));
            value = stamp ? stamp.date : '';
        } else if (eventId) {
            const rec = (data.timeline || []).find(function (item) { return item.id === eventId; });
            value = rec ? (rec.date || '') : '';
        } else {
            value = ($('eventDate') && $('eventDate').value) || '';
        }
        const parsed = parseCalAny(value);
        const now = new Date();
        if (host && host.closeSheetPick) host.closeSheetPick();
        closeTimePicker();
        closeTlInfoPop();
        closeCalendar();
        calState = {
            anchor: anchor,
            eventId: eventId,
            factId: factId,
            field: eventId || factId ? '' : 'eventDate',
            value: value,
            y: parsed ? parsed.y : now.getFullYear(),
            m: parsed ? parsed.m : now.getMonth(),
            mode: 'days'
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintCalendar();
    }

    function shiftCal(dir) {
        if (!calState) return;
        const mode = calState.mode || 'days';
        if (mode === 'years') calState.y += dir * 12;
        else if (mode === 'months') calState.y += dir;
        else {
            calState.m += dir;
            if (calState.m > 11) { calState.m = 0; calState.y += 1; }
            if (calState.m < 0) { calState.m = 11; calState.y -= 1; }
        }
        paintCalendar();
    }

    function applyCalValue(iso) {
        if (!calState) return;
        const eventId = calState.eventId;
        const factId = calState.factId;
        const field = calState.field;
        closeCalendar();
        if (factId) {
            if (!iso) {
                writeFactStamp(factId, '');
                return;
            }
            const prev = stampFromIso(readFactStamp(factId));
            const now = new Date();
            const h = prev ? prev.h : now.getHours();
            const m = prev ? prev.m : now.getMinutes();
            writeFactStamp(factId, isoFromStamp(iso, h, m));
            return;
        }
        if (eventId) {
            const rec = (data.timeline || []).find(function (item) { return item.id === eventId; });
            if (rec) {
                rememberTimeline();
                rec.date = iso || '';
                rec.pinned = true;
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        if (field === 'eventDate' && $('eventDate')) {
            $('eventDate').value = iso || '';
            syncEventDateBtn();
        }
    }

    function onCalendarClick(event) {
        const act = event.target.closest('[data-cal]');
        if (!act || !calState) return;
        const op = act.getAttribute('data-cal');
        if (op === 'prev') { shiftCal(-1); return; }
        if (op === 'next') { shiftCal(1); return; }
        if (op === 'title') {
            calState.mode = calState.mode === 'days' ? 'months' : (calState.mode === 'months' ? 'years' : 'days');
            paintCalendar();
            return;
        }
        if (op === 'month') {
            calState.m = Number(act.getAttribute('data-m')) || 0;
            calState.mode = 'days';
            paintCalendar();
            return;
        }
        if (op === 'year') {
            calState.y = Number(act.getAttribute('data-y')) || calState.y;
            calState.mode = 'months';
            paintCalendar();
            return;
        }
        if (op === 'day') {
            applyCalValue(act.getAttribute('data-iso') || '');
            return;
        }
        if (op === 'clear') {
            applyCalValue('');
            return;
        }
        if (op === 'today') {
            const now = new Date();
            applyCalValue(calIso(now.getFullYear(), now.getMonth(), now.getDate()));
        }
    }

    function parseTimeParts(value) {
        const raw = String(value || '').trim();
        const hit = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(raw);
        if (!hit) return null;
        let h = Number(hit[1]);
        const m = Number(hit[2]);
        if (m > 59) return null;
        const mer = hit[3] ? hit[3].toLowerCase() : '';
        if (mer) {
            if (h < 1 || h > 12) return null;
            if (h === 12) h = mer === 'pm' ? 12 : 0;
            else if (mer === 'pm') h += 12;
        } else if (h > 23) return null;
        return { h: h, m: m };
    }

    function toTime24(h, m) {
        return calPad(((h % 24) + 24) % 24) + ':' + calPad(((m % 60) + 60) % 60);
    }

    function formatTime12(value) {
        const p = parseTimeParts(value);
        if (!p) return 'Time';
        let h = p.h % 12;
        if (!h) h = 12;
        return h + ':' + calPad(p.m) + ' ' + (p.h >= 12 ? 'PM' : 'AM');
    }

    function closeTimePicker() {
        const pop = $('timePop');
        if (timeState && timeState.anchor) timeState.anchor.setAttribute('aria-expanded', 'false');
        timeState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeTimePicker() {
        const pop = $('timePop');
        if (!pop || pop.hidden || !timeState || !timeState.anchor) return;
        const r = timeState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 248;
        const h = pop.offsetHeight || 220;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function timeNavSvg(dir) {
        return dir === 'up'
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14.5 12 9l6 5.5"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5 12 15l6-5.5"/></svg>';
    }

    function hour12From24(h) {
        const n = h % 12;
        return n ? n : 12;
    }

    function paintTimePicker() {
        const pop = $('timePop');
        if (!pop || !timeState) return;
        const h12 = hour12From24(timeState.h);
        const pm = timeState.h >= 12;
        pop.innerHTML =
            '<div class="time-head">Time</div>' +
            '<div class="time-face">' +
            '<div class="time-col">' +
            '<button type="button" class="cal-nav" data-tm="h-up" aria-label="Hour up">' + timeNavSvg('up') + '</button>' +
            '<input class="time-num" data-tm="h-in" type="text" inputmode="numeric" maxlength="2" value="' + h12 + '" aria-label="Hour" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="cal-nav" data-tm="h-dn" aria-label="Hour down">' + timeNavSvg('down') + '</button>' +
            '</div>' +
            '<span class="time-colon">:</span>' +
            '<div class="time-col">' +
            '<button type="button" class="cal-nav" data-tm="m-up" aria-label="Minute up">' + timeNavSvg('up') + '</button>' +
            '<input class="time-num" data-tm="m-in" type="text" inputmode="numeric" maxlength="2" value="' + calPad(timeState.m) + '" aria-label="Minute" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="cal-nav" data-tm="m-dn" aria-label="Minute down">' + timeNavSvg('down') + '</button>' +
            '</div>' +
            '<div class="time-meridiem">' +
            '<button type="button" class="cal-chip' + (!pm ? ' is-on' : '') + '" data-tm="am">AM</button>' +
            '<button type="button" class="cal-chip' + (pm ? ' is-on' : '') + '" data-tm="pm">PM</button>' +
            '</div>' +
            '</div>' +
            '<div class="cal-foot">' +
            '<button type="button" data-tm="clear">Clear</button>' +
            '<button type="button" data-tm="now">Now</button>' +
            '</div>';
        pop.hidden = false;
        pop.querySelectorAll('.time-num').forEach(function (el) {
            el.addEventListener('focus', function () {
                requestAnimationFrame(function () { el.select(); });
            });
            el.addEventListener('blur', function () { finishTimeTyped(el); });
        });
        placeTimePicker();
    }

    function openTimePicker(anchor) {
        if (!anchor) return;
        if (timeState && timeState.anchor === anchor) {
            closeTimePicker();
            return;
        }
        const eventId = anchor.getAttribute('data-tl-time') || '';
        const factId = anchor.getAttribute('data-fact-time') || '';
        if (factId && factStampLocked()) return;
        const rec = factId ? null : findTimelineEvent(eventId);
        const field = anchor.getAttribute('data-tl-time-for') || 'time';
        const slotId = anchor.getAttribute('data-note-id') || '';
        let parsed = null;
        if (factId) {
            const stamp = stampFromIso(readFactStamp(factId));
            if (stamp) parsed = { h: stamp.h, m: stamp.m };
        } else if (field === 'moreTime' && rec) {
            const slot = (rec.moreTimes || []).find(function (item) { return item.id === slotId; });
            parsed = parseTimeParts(slot && slot.value);
        } else {
            parsed = parseTimeParts(rec && rec[field]);
        }
        const now = new Date();
        if (host && host.closeSheetPick) host.closeSheetPick();
        closeCalendar();
        closeTlInfoPop();
        closeTimePicker();
        timeState = {
            anchor: anchor,
            eventId: eventId,
            factId: factId,
            field: field,
            slotId: slotId,
            h: parsed ? parsed.h : now.getHours(),
            m: parsed ? parsed.m : now.getMinutes()
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintTimePicker();
    }

    function setTimeMeridiem(pm) {
        if (!timeState) return;
        if (pm && timeState.h < 12) timeState.h += 12;
        if (!pm && timeState.h >= 12) timeState.h -= 12;
        commitTimeValue(false);
        syncTimePickerFace();
    }

    function shiftTime(unit, dir) {
        if (!timeState) return;
        if (unit === 'h') timeState.h = (timeState.h + dir + 24) % 24;
        else timeState.m = (timeState.m + dir + 60) % 60;
        commitTimeValue(false);
        syncTimePickerFace(true);
    }

    function syncTimePickerFace(force) {
        const pop = $('timePop');
        if (!pop || pop.hidden || !timeState) return;
        const hIn = pop.querySelector('[data-tm="h-in"]');
        const mIn = pop.querySelector('[data-tm="m-in"]');
        const am = pop.querySelector('[data-tm="am"]');
        const pm = pop.querySelector('[data-tm="pm"]');
        const pmOn = timeState.h >= 12;
        if (hIn && (force || document.activeElement !== hIn)) hIn.value = String(hour12From24(timeState.h));
        if (mIn && (force || document.activeElement !== mIn)) mIn.value = calPad(timeState.m);
        if (am) am.classList.toggle('is-on', !pmOn);
        if (pm) pm.classList.toggle('is-on', pmOn);
    }

    function applyTimeTyped(el) {
        if (!timeState || !el) return;
        const kind = el.getAttribute('data-tm');
        const raw = String(el.value || '').replace(/\D/g, '').slice(0, 2);
        if (el.value !== raw) el.value = raw;
        if (!raw) return;
        const n = Number(raw);
        if (kind === 'h-in') {
            if (n < 1 || n > 12) return;
            const pm = timeState.h >= 12;
            if (n === 12) timeState.h = pm ? 12 : 0;
            else timeState.h = pm ? n + 12 : n;
        } else if (kind === 'm-in') {
            if (n > 59) return;
            timeState.m = n;
        } else return;
        commitTimeValue(false);
        syncTimePickerFace();
    }

    function finishTimeTyped(el) {
        if (!timeState || !el) return;
        applyTimeTyped(el);
        const kind = el.getAttribute('data-tm');
        if (kind === 'h-in') {
            let n = Number(String(el.value || '').replace(/\D/g, ''));
            if (!n) n = hour12From24(timeState.h);
            if (n < 1) n = 1;
            if (n > 12) n = 12;
            const pm = timeState.h >= 12;
            if (n === 12) timeState.h = pm ? 12 : 0;
            else timeState.h = pm ? n + 12 : n;
        } else if (kind === 'm-in') {
            let n = Number(String(el.value || '').replace(/\D/g, ''));
            if (!isFinite(n) || n < 0) n = timeState.m;
            if (n > 59) n = 59;
            timeState.m = n;
        }
        commitTimeValue(false);
        syncTimePickerFace(true);
    }

    function onTimeFieldKey(event) {
        const el = event.target;
        const kind = el && el.getAttribute && el.getAttribute('data-tm');
        if (kind !== 'h-in' && kind !== 'm-in') return false;
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            shiftTime(kind === 'h-in' ? 'h' : 'm', 1);
            return true;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            shiftTime(kind === 'h-in' ? 'h' : 'm', -1);
            return true;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            finishTimeTyped(el);
            closeTimePicker();
            return true;
        }
        return false;
    }

    function commitTimeValue(clear) {
        if (!timeState) return;
        if (timeState.factId) {
            const factId = timeState.factId;
            const prev = stampFromIso(readFactStamp(factId));
            const now = new Date();
            const date = prev ? prev.date : calIso(now.getFullYear(), now.getMonth(), now.getDate());
            if (clear) {
                writeFactStamp(factId, isoFromStamp(date, 0, 0));
                return;
            }
            writeFactStamp(factId, isoFromStamp(date, timeState.h, timeState.m));
            return;
        }
        const rec = findTimelineEvent(timeState.eventId);
        if (!rec) return;
        rememberTimeline('time:' + rec.id);
        const field = timeState.field || 'time';
        const stamp = clear ? '' : toTime24(timeState.h, timeState.m);
        const node = document.querySelector('#timelineList [data-event="' + rec.id + '"]');
        if (field === 'moreTime') {
            rec.moreTimes = Array.isArray(rec.moreTimes) ? rec.moreTimes : [];
            rec.moreTimes.forEach(function (item) {
                if (item.id === timeState.slotId) item.value = stamp;
            });
            const btn = node && node.querySelector('[data-tl-time-for="moreTime"][data-note-id="' + timeState.slotId + '"]');
            if (btn) {
                btn.textContent = stamp ? formatTime12(stamp) : 'Select time';
                btn.classList.toggle('has-time', !!stamp);
            }
        } else if (field === 'infoTime') {
            rec.infoTime = stamp;
            const btn = node && node.querySelector('[data-tl-time-for="infoTime"]');
            if (btn) {
                btn.textContent = rec.infoTime ? formatTime12(rec.infoTime) : 'Select time';
                btn.classList.toggle('has-time', !!rec.infoTime);
            }
        } else {
            rec.time = stamp;
            const label = node && node.querySelector('.tl-bar .tl-time');
            if (label) {
                label.textContent = rec.time ? formatTime12(rec.time) : 'Time';
                label.classList.toggle('has-time', !!rec.time);
            }
        }
        schedulePersist();
        scheduleDatasheet();
    }

    function onTimeClick(event) {
        const act = event.target.closest('[data-tm]');
        if (!act || !timeState) return;
        const op = act.getAttribute('data-tm');
        if (op === 'h-in' || op === 'm-in') return;
        if (op === 'h-up') { shiftTime('h', 1); return; }
        if (op === 'h-dn') { shiftTime('h', -1); return; }
        if (op === 'm-up') { shiftTime('m', 1); return; }
        if (op === 'm-dn') { shiftTime('m', -1); return; }
        if (op === 'am') { setTimeMeridiem(false); return; }
        if (op === 'pm') { setTimeMeridiem(true); return; }
        if (op === 'clear') {
            commitTimeValue(true);
            closeTimePicker();
            return;
        }
        if (op === 'now') {
            const now = new Date();
            timeState.h = now.getHours();
            timeState.m = now.getMinutes();
            commitTimeValue(false);
            closeTimePicker();
        }
    }

    function tlShows(ev, key) {
        if (!ev) return false;
        if (key === 'image') return !!(ev.image || (ev.show && ev.show.image));
        const shown = ev.show && ev.show[key];
        return !!(shown || String(ev[key] || '').trim());
    }

    function tlFolded(ev, key, note) {
        if (note) return !!note.fold;
        return !!(ev && ev.fold && ev.fold[key]);
    }

    function tlBitBar(ev, key, label, folded, noteId) {
        const nid = noteId ? ' data-note-id="' + esc(noteId) + '"' : '';
        const expand = folded ? 'Expand' : 'Minimize';
        return '<div class="tl-bit-bar">' +
            '<span>' + esc(label) + '</span>' +
            '<div class="tl-bit-acts">' +
            '<button type="button" class="tl-bit-btn" data-tl-fold="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="' + expand + '" aria-label="' + expand + '" aria-expanded="' + (folded ? 'false' : 'true') + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
            '</button>' +
            '<button type="button" class="tl-bit-btn is-del" data-tl-drop="' + key + '" data-event="' + esc(ev.id) + '"' + nid + ' title="Delete" aria-label="Delete">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
            '</button>' +
            '</div></div>';
    }

    function tlBitShell(ev, key, label, folded, innerHtml, noteId) {
        return '<div class="tl-bit' + (folded ? ' is-fold' : '') + '" data-tl-bit="' + key + '">' +
            tlBitBar(ev, key, label, folded, noteId) +
            '<div class="tl-bit-body"><div class="tl-bit-body-inner">' + innerHtml + '</div></div></div>';
    }

    function tlBitEl(id, key, noteId) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (!node) return null;
        if (key === 'more' || key === 'moreTime') {
            const hit = node.querySelector('[data-note-id="' + noteId + '"]');
            return hit ? hit.closest('.tl-bit') : null;
        }
        return node.querySelector('[data-tl-bit="' + key + '"]');
    }

    function afterEase(el, fn) {
        if (!el || reduceMotion()) {
            fn();
            return;
        }
        let done = false;
        const finish = function (event) {
            if (done) return;
            if (event) {
                if (event.target !== el) return;
                if (event.type === 'transitionend' && event.propertyName !== 'height') return;
            }
            done = true;
            fn();
        };
        el.addEventListener('transitionend', finish);
        el.addEventListener('animationend', finish);
        setTimeout(function () { finish(); }, 420);
    }

    function tickTlLayout(frames, preferId) {
        let n = 0;
        const max = frames || 20;
        const tick = function () {
            stackTimelineStems(preferId);
            drawTimelineAxis();
            n += 1;
            if (n < max) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function moreTimesOf(ev) {
        if (!ev) return [];
        ev.moreTimes = Array.isArray(ev.moreTimes) ? ev.moreTimes.filter(function (item) { return item && item.id; }) : [];
        if ((ev.infoTime || (ev.show && ev.show.infoTime)) && !ev.moreTimes.length) {
            ev.moreTimes.push({
                id: uid('tm'),
                value: ev.infoTime || '',
                fold: !!(ev.fold && ev.fold.infoTime)
            });
            ev.infoTime = '';
            if (ev.show) ev.show.infoTime = false;
        }
        return ev.moreTimes;
    }

    function tlInfoTimeHtml(ev) {
        return moreTimesOf(ev).map(function (item) {
            const folded = !!item.fold;
            const label = item.value ? formatTime12(item.value) : 'Select time';
            return tlBitShell(ev, 'moreTime', 'Time', folded,
                '<button type="button" class="tl-info-clock' + (item.value ? ' has-time' : '') + '" data-tl-time="' + esc(ev.id) + '" data-tl-time-for="moreTime" data-note-id="' + esc(item.id) + '" aria-haspopup="dialog" aria-label="Card time">' + esc(label) + '</button>',
                item.id);
        }).join('');
    }

    function tlFactRow(ev, key, label, ph) {
        if (!tlShows(ev, key)) return '';
        const folded = tlFolded(ev, key);
        return tlBitShell(ev, key, label, folded,
            '<input data-tl-field="' + key + '" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev[key] || '') + '" placeholder="' + esc(ph) + '" spellcheck="false" autocomplete="off">');
    }

    function tlMoreNotesHtml(ev) {
        return (Array.isArray(ev.moreNotes) ? ev.moreNotes : []).map(function (note) {
            if (!note || !note.id) return '';
            const blank = !(note.text || '').trim();
            const h = Number(note.h);
            const folded = tlFolded(ev, 'more', note);
            return tlBitShell(ev, 'more', 'Note', folded,
                '<div class="tl-note' + (blank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="more" data-event-id="' + esc(ev.id) + '" data-note-id="' + esc(note.id) + '" data-ph="Note" spellcheck="false" style="height:' + (h >= 48 ? h : 76) + 'px">' + esc(note.text || '') + '</div>',
                note.id);
        }).join('');
    }

    function tlMediaHtml(ev) {
        if (!ev.image && !tlShows(ev, 'image')) return '';
        const folded = tlFolded(ev, 'image');
        const body = ev.image
            ? '<div class="tl-media"><img class="tl-thumb" src="' + esc(ev.image) + '" alt="" data-tl-expand="' + esc(ev.id) + '"></div>'
            : '<div class="tl-attach">' +
                '<button type="button" class="tl-attach-hit" data-tl-photo="' + esc(ev.id) + '">Attach image</button>' +
                '<input class="tl-attach-url" data-tl-image-url="' + esc(ev.id) + '" type="url" placeholder="Paste image URL" spellcheck="false" autocomplete="off">' +
                '</div>';
        return tlBitShell(ev, 'image', 'Image', folded, body);
    }

    function toggleTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        rememberTimeline();
        let folded = false;
        if (key === 'more') {
            const note = (rec.moreNotes || []).find(function (item) { return item.id === noteId; });
            if (!note) return;
            note.fold = !note.fold;
            folded = !!note.fold;
        } else if (key === 'moreTime') {
            const slot = moreTimesOf(rec).find(function (item) { return item.id === noteId; });
            if (!slot) return;
            slot.fold = !slot.fold;
            folded = !!slot.fold;
            rec.moreTimes = moreTimesOf(rec);
        } else {
            rec.fold = rec.fold && typeof rec.fold === 'object' ? rec.fold : {};
            rec.fold[key] = !rec.fold[key];
            folded = !!rec.fold[key];
        }
        const bit = tlBitEl(id, key, noteId);
        if (bit) {
            bit.classList.toggle('is-fold', folded);
            const btn = bit.querySelector('[data-tl-fold]');
            if (btn) {
                btn.title = folded ? 'Expand' : 'Minimize';
                btn.setAttribute('aria-label', folded ? 'Expand' : 'Minimize');
                btn.setAttribute('aria-expanded', folded ? 'false' : 'true');
            }
            if (reduceMotion()) {
                stackTimelineStems();
                drawTimelineAxis();
            } else tickTlLayout(20);
        } else {
            renderTimeline();
        }
        schedulePersist();
    }

    function dropTlBit(id, key, noteId) {
        const rec = findTimelineEvent(id);
        if (!rec || !key) return;
        const bit = tlBitEl(id, key, noteId);
        if (bit && bit.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            const live = findTimelineEvent(id);
            if (!live) return;
            if (key === 'more') {
                live.moreNotes = (live.moreNotes || []).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'moreTime') {
                live.moreTimes = moreTimesOf(live).filter(function (item) { return item.id !== noteId; });
            } else if (key === 'image') {
                live.image = '';
                if (live.show) live.show.image = false;
                if (live.fold) live.fold.image = false;
            } else {
                live[key] = '';
                live.show = live.show && typeof live.show === 'object' ? live.show : {};
                live.show[key] = false;
                if (live.fold) live.fold[key] = false;
            }
            renderTimeline();
            schedulePersist();
        }
        if (bit && !reduceMotion()) {
            const h = bit.offsetHeight;
            bit.style.height = h + 'px';
            void bit.offsetHeight;
            bit.classList.add('is-out');
            bit.style.height = '0px';
            tickTlLayout(20);
            afterEase(bit, commit);
            return;
        }
        commit();
    }

    function closeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (infoState && infoState.anchor) infoState.anchor.setAttribute('aria-expanded', 'false');
        infoState = null;
        if (pop) {
            pop.hidden = true;
            pop.innerHTML = '';
        }
    }

    function placeTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || pop.hidden || !infoState || !infoState.anchor) return;
        const r = infoState.anchor.getBoundingClientRect();
        const w = pop.offsetWidth || 268;
        const h = pop.offsetHeight || 280;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = r.left;
        if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
        if (left < 8) left = 8;
        let top = r.bottom + 8;
        let up = false;
        if (top + h > vh - 8 && r.top - 8 - h >= 8) {
            top = r.top - 8 - h;
            up = true;
        } else if (top + h > vh - 8) {
            top = Math.max(8, vh - h - 8);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.classList.toggle('is-up', up);
    }

    function paintTlInfoPop() {
        const pop = $('tlInfoPop');
        if (!pop || !infoState) return;
        const rec = findTimelineEvent(infoState.eventId);
        const items = [
            ['image', 'image', rec && rec.image ? 'Replace image' : 'Image'],
            ['notes', 'note', 'More notes'],
            ['time', 'clock', 'Time'],
            ['date', 'calendar', 'Date'],
            ['entities', 'person', 'Entities'],
            ['source', 'link', 'Source'],
            ['evidence', 'document', 'Evidence']
        ];
        pop.innerHTML =
            '<div class="tl-info-head">Add information</div>' +
            '<div class="tl-info-grid">' +
            items.map(function (item) {
                return '<button type="button" data-tl-add="' + item[0] + '">' + boardIcon(item[1]) + '<span>' + item[2] + '</span></button>';
            }).join('') +
            '</div>';
        pop.hidden = false;
        placeTlInfoPop();
    }

    function openTlInfoPop(anchor) {
        if (!anchor) return;
        if (infoState && infoState.anchor === anchor) {
            if (Date.now() - (infoState.at || 0) < 500) return;
            closeTlInfoPop();
            return;
        }
        closeCalendar();
        closeTimePicker();
        hideTimelineMenu();
        closeTlInfoPop();
        infoState = {
            anchor: anchor,
            eventId: anchor.getAttribute('data-tl-info') || '',
            at: Date.now()
        };
        anchor.setAttribute('aria-expanded', 'true');
        paintTlInfoPop();
    }

    function runTlInfo(kind, id) {
        const rec = findTimelineEvent(id);
        if (!rec || !kind) return;
        closeTlInfoPop();
        if (kind === 'date') {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
            return;
        }
        rememberTimeline('info:' + id);
        rec.show = rec.show && typeof rec.show === 'object' ? rec.show : {};
        if (rec.mini) rec.mini = false;
        if (kind === 'time') {
            moreTimesOf(rec);
            const item = { id: uid('tm'), value: '' };
            rec.moreTimes.push(item);
            tlFocusAfter = { id: id, pickTime: item.id };
        } else if (kind === 'notes') {
            rec.moreNotes = Array.isArray(rec.moreNotes) ? rec.moreNotes : [];
            const note = { id: uid('note'), text: '' };
            rec.moreNotes.push(note);
            tlFocusAfter = { id: id, more: note.id };
        } else if (kind === 'image') {
            rec.show.image = true;
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        } else {
            rec.show[kind] = true;
            tlFocusAfter = { id: id, field: kind };
        }
        renderTimeline();
        tickTlLayout(28, id);
        schedulePersist();
    }

    function onTlInfoClick(event) {
        const act = event.target.closest('[data-tl-add]');
        if (!act || !infoState) return;
        runTlInfo(act.getAttribute('data-tl-add'), infoState.eventId);
    }

    function applyTlFocusAfter(list) {
        const spec = tlFocusAfter;
        tlFocusAfter = null;
        if (!spec || !list) return;
        const node = list.querySelector('[data-event="' + spec.id + '"]');
        if (!node) return;
        if (spec.photo) {
            timelinePhotoId = spec.id;
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        if (spec.pickTime) {
            const btn = node.querySelector('[data-tl-time-for="moreTime"][data-note-id="' + spec.pickTime + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        if (spec.pick) {
            const btn = node.querySelector('[data-tl-time-for="' + spec.pick + '"]');
            if (btn) openTimePicker(btn);
            return;
        }
        const el = spec.more
            ? node.querySelector('[data-note-id="' + spec.more + '"]')
            : node.querySelector('[data-tl-field="' + spec.field + '"]');
        if (el) el.focus();
    }

    function renderTimeline() {
        if (calState && calState.eventId) closeCalendar();
        if (timeState && timeState.eventId) closeTimePicker();
        if (infoState && infoState.eventId) closeTlInfoPop();
        const list = $('timelineList');
        const count = $('timelineCount');
        const events = layoutTimelineEvents();
        if (count) count.textContent = events.length ? (events.length === 1 ? '1 event' : events.length + ' events') : 'No events';
        applyTimelineCam();
        const empty = $('timelineEmpty');
        if (empty) empty.hidden = true;
        if (!events.length && !tlCamAnim) {
            const view = $('timelineView');
            const cam = timelineCam();
            if (view && view.clientHeight > 80) {
                const y = Math.round(view.clientHeight / 2 - TL_AXIS_Y * (cam.z || 1));
                if (Math.abs((cam.y || 0) - y) > 1) easeTimelineCam({ x: cam.x, y: y, z: cam.z || 1 });
            }
        }
        if (!list) {
            scheduleDatasheet();
            return;
        }
        list.innerHTML = events.map(function (ev) {
            const n = String(ev.n).padStart(2, '0');
            const active = ev.id === selectedEvent ? ' is-on' : '';
            const connecting = connectFrom === ev.id ? ' is-from' : '';
            const spawn = ev.spawn ? ' is-spawn' : '';
            delete ev.spawn;
            const mini = ev.mini ? ' is-mini' : '';
            const locked = ev.locked ? ' is-locked' : '';
            const facts = tlInfoTimeHtml(ev) +
                tlFactRow(ev, 'entities', 'Entities', 'People, accounts, companies') +
                tlFactRow(ev, 'source', 'Source', 'URL or origin') +
                tlFactRow(ev, 'evidence', 'Evidence', 'File, exhibit, or note');
            const media = tlMediaHtml(ev);
            const noteBlank = !(ev.body || '').trim();
            const noteH = Number(ev.noteH);
            const w = tlCardW(ev);
            const h = tlCardH(ev);
            const top = cardTop(ev, ev.mini ? 86 : (ev.image ? 420 : 220));
            return '<article class="tl-node' + active + connecting + spawn + mini + locked + (h ? ' is-sized' : '') + '" data-event="' + esc(ev.id) + '" data-side="' + (ev.side === 1 ? '1' : '-1') + '" style="left:' + (ev.pinX - w / 2) + 'px;top:' + top + 'px;width:' + w + 'px' + (h && !ev.mini ? ';height:' + h + 'px' : '') + '">' +
                '<div class="tl-card">' +
                '<div class="tl-bar" data-tl-drag>' +
                '<span class="tl-idx">' + n + '</span>' +
                '<div class="tl-when">' +
                '<span class="tl-date' + (ev.date ? ' has-date' : '') + '">' + esc(ev.date ? formatDayLabel(ev.date) : 'Date') + '</span>' +
                '<span class="tl-time' + (ev.time ? ' has-time' : '') + '">' + esc(ev.time ? formatTime12(ev.time) : 'Time') + '</span>' +
                '</div>' +
                '<div class="tl-bar-actions">' +
                '<button type="button" class="tl-ico" data-tl-cal="' + esc(ev.id) + '" title="Date" aria-label="Choose date" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 10h16"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-time="' + esc(ev.id) + '" title="Time" aria-label="Choose time" aria-haspopup="dialog" aria-expanded="false">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico' + (connectFrom === ev.id ? ' is-on' : '') + '" data-connect-event="' + esc(ev.id) + '" title="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-label="' + (connectFrom === ev.id ? 'Pick second card' : 'Connect cards') + '" aria-pressed="' + (connectFrom === ev.id ? 'true' : 'false') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a3.8 3.8 0 0 0 5.4.4l1.6-1.6a3.8 3.8 0 1 0-5.4-5.4l-.9.9"/><path d="M14 10.5a3.8 3.8 0 0 0-5.4-.4L7 11.7a3.8 3.8 0 0 0 5.4 5.4l.9-.9"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico" data-tl-mini="' + esc(ev.id) + '" title="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-label="' + (ev.mini ? 'Expand' : 'Minimize') + '" aria-expanded="' + (ev.mini ? 'false' : 'true') + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/><path class="tl-mini-v" d="M12 6v12"/></svg>' +
                '</button>' +
                '<button type="button" class="tl-ico danger" data-del-event="' + esc(ev.id) + '" title="Delete" aria-label="Delete">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
                '</button>' +
                '</div></div>' +
                '<input class="tl-title" data-tl-field="title" data-event-id="' + esc(ev.id) + '" type="text" value="' + esc(ev.title || '') + '" placeholder="Title" spellcheck="false" autocomplete="off" maxlength="120">' +
                '<div class="tl-extra"><div class="tl-extra-inner">' +
                '<div class="tl-note' + (noteBlank ? ' is-blank' : '') + '" contenteditable="true" data-tl-field="body" data-event-id="' + esc(ev.id) + '" data-ph="Note" spellcheck="false" style="height:' + (noteH >= 48 ? noteH : 76) + 'px">' + esc(ev.body || '') + '</div>' +
                tlMoreNotesHtml(ev) +
                (facts ? '<div class="tl-facts">' + facts + '</div>' : '') +
                media +
                '<div class="tl-acts">' +
                '<button type="button" class="tl-add-info" data-tl-info="' + esc(ev.id) + '" aria-haspopup="dialog" aria-expanded="false">+ Add information</button>' +
                '</div></div></div></div>' +
                '<div class="tl-rs" aria-hidden="true">' +
                '<i data-tl-rs="n"></i><i data-tl-rs="s"></i><i data-tl-rs="e"></i><i data-tl-rs="w"></i>' +
                '<i data-tl-rs="ne"></i><i data-tl-rs="nw"></i><i data-tl-rs="se"></i><i data-tl-rs="sw"></i>' +
                '</div></article>';
        }).join('');
        requestAnimationFrame(function () {
            list.querySelectorAll('.tl-node').forEach(function (el) {
                const rec = (data.timeline || []).find(function (item) { return item.id === el.getAttribute('data-event'); });
                if (!rec) return;
                if (!(rec.pinY != null && isFinite(Number(rec.pinY)))) rec.pinY = cardTop(rec, tlNodeH(el, rec));
                placeTlCard(el, rec);
            });
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
            bindTimelineFieldSizes(list);
            bindTimelineNodeSizes(list);
            applyTlFocusAfter(list);
            tickTlLayout(12);
        });
        scheduleDatasheet();
    }

    function tlEditableBlank(el) {
        return !String((el && el.innerText) || '').replace(/\u00a0/g, ' ').trim();
    }

    function syncTlPlaceholder(el) {
        if (!el || !el.hasAttribute || !el.hasAttribute('data-tl-field')) return;
        if (tlEditableBlank(el)) {
            el.classList.add('is-blank');
            const html = String(el.innerHTML || '').replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/gi, '').replace(/\s/g, '');
            if (!html && el.innerHTML) el.innerHTML = '';
        } else {
            el.classList.remove('is-blank');
        }
    }

    function bindTimelineFieldSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlSizeObs) tlSizeObs.disconnect();
        tlSizeObs = new ResizeObserver(function (entries) {
            entries.forEach(function (entry) {
                const el = entry.target;
                const rec = findTimelineEvent(el.getAttribute('data-event-id'));
                if (!rec) return;
                const field = el.getAttribute('data-tl-field');
                if (el.closest('.tl-node.is-sized, .tl-node.is-resizing')) return;
                const h = Math.round(el.offsetHeight);
                if (h < 16) return;
                if (field === 'more') {
                    const nid = el.getAttribute('data-note-id');
                    const item = (rec.moreNotes || []).find(function (note) { return note.id === nid; });
                    if (!item || item.h === h) return;
                    item.h = h;
                    schedulePersist();
                    scheduleStemRedraw();
                    return;
                }
                const key = field === 'title' ? 'titleH' : 'noteH';
                if (rec[key] === h) return;
                rec[key] = h;
                schedulePersist();
                scheduleStemRedraw();
            });
        });
        list.querySelectorAll('[data-tl-field="body"], [data-tl-field="more"]').forEach(function (el) { tlSizeObs.observe(el); });
    }

    function scheduleStemRedraw() {
        if (tlStemRedraw) return;
        tlStemRedraw = requestAnimationFrame(function () {
            tlStemRedraw = 0;
            stackTimelineStems();
            drawTimelineAxis();
            trackTimelineStems();
        });
    }

    function trackTimelineStems() {
        if (tlStemTrack) return;
        const tick = function () {
            tlStemTrack = 0;
            drawTimelineAxis();
            if (document.querySelector('#timelineList .tl-node.is-spawn, #timelineList .tl-node.is-moving, #timelineList .tl-node.is-resizing')) {
                tlStemTrack = requestAnimationFrame(tick);
            }
        };
        tlStemTrack = requestAnimationFrame(tick);
    }

    function bindTimelineNodeSizes(list) {
        if (!list || !window.ResizeObserver) return;
        if (tlNodeObs) tlNodeObs.disconnect();
        tlNodeObs = new ResizeObserver(function (entries) {
            let dirty = false;
            entries.forEach(function (entry) {
                const el = entry.target;
                if (!el || el.classList.contains('is-resizing') || el.classList.contains('is-moving') || el.classList.contains('is-out')) return;
                dirty = true;
            });
            if (dirty) scheduleStemRedraw();
        });
        list.querySelectorAll('.tl-node, .tl-node .tl-card').forEach(function (el) { tlNodeObs.observe(el); });
    }

    function formatWhen(ev) {
        if (!ev.date && !ev.time) return 'Undated';
        if (ev.date && ev.time) return ev.date + ' ' + ev.time;
        return ev.date || ev.time;
    }

    function tlPortPoint(box, side) {
        const mx = (box.left + box.right) / 2;
        const my = (box.top + box.bottom) / 2;
        if (side === 'n') return { x: mx, y: box.top };
        if (side === 's') return { x: mx, y: box.bottom };
        if (side === 'e') return { x: box.right, y: my };
        return { x: box.left, y: my };
    }

    function tlCardLinkPath(a, b) {
        const sides = ['n', 'e', 's', 'w'];
        let best = null;
        let dist = Infinity;
        sides.forEach(function (sa) {
            const pa = tlPortPoint(a, sa);
            sides.forEach(function (sb) {
                const pb = tlPortPoint(b, sb);
                const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
                if (d < dist) {
                    dist = d;
                    best = { sa: sa, sb: sb, a: pa, b: pb };
                }
            });
        });
        if (!best) return '';
        const out = { n: [0, -22], s: [0, 22], e: [22, 0], w: [-22, 0] };
        const a1 = { x: best.a.x + out[best.sa][0], y: best.a.y + out[best.sa][1] };
        const b1 = { x: best.b.x + out[best.sb][0], y: best.b.y + out[best.sb][1] };
        const mid = (best.sa === 'e' || best.sa === 'w')
            ? [{ x: a1.x, y: b1.y }]
            : [{ x: b1.x, y: a1.y }];
        return tlOrthoPath([best.a, a1].concat(mid).concat([b1, best.b]), 12);
    }

    function tlCardBox(ev, el) {
        const card = el && el.querySelector('.tl-card');
        const w = Math.max(1, (card && card.offsetWidth) || (el && el.offsetWidth) || tlCardW(ev));
        const h = Math.max(86, (card && card.offsetHeight) || tlNodeH(el, ev));
        const left = el
            ? (parseFloat(el.style.left) || el.offsetLeft || ((Number(ev.pinX) || 0) - w / 2))
            : ((Number(ev.pinX) || 0) - w / 2);
        const top = el
            ? (parseFloat(el.style.top) || el.offsetTop || Number(ev.pinY) || 0)
            : (Number(ev.pinY) || 0);
        const pin = left + w / 2;
        const side = tlFacingSide(top, h, ev && ev.side);
        return { id: ev.id, side: side, pin: pin, left: left, right: left + w, top: top, bottom: top + h };
    }

    function tlStemEnds(box, axisY) {
        const side = box.side === 1 ? 1 : -1;
        const glue = 5;
        return {
            side: side,
            pin: box.pin,
            tickY: side === 1 ? axisY + 22 : axisY - 22,
            cardY: side === 1 ? box.top + glue : box.bottom - glue
        };
    }

    function mergeTlBoxes(list) {
        if (!list.length) return [];
        const items = list.slice().sort(function (a, b) { return a.top - b.top; });
        const out = [{ left: items[0].left, right: items[0].right, top: items[0].top, bottom: items[0].bottom }];
        for (let i = 1; i < items.length; i++) {
            const last = out[out.length - 1];
            const cur = items[i];
            if (cur.top <= last.bottom + 18) {
                last.bottom = Math.max(last.bottom, cur.bottom);
                last.left = Math.min(last.left, cur.left);
                last.right = Math.max(last.right, cur.right);
            } else {
                out.push({ left: cur.left, right: cur.right, top: cur.top, bottom: cur.bottom });
            }
        }
        return out;
    }

    function tlOrthoPath(pts, radius) {
        if (!pts.length) return '';
        const r = radius == null ? 10 : radius;
        let d = 'M' + pts[0].x + ' ' + pts[0].y;
        if (pts.length === 1) return d;
        if (pts.length === 2) return d + ' L' + pts[1].x + ' ' + pts[1].y;
        for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            const next = pts[i + 1];
            const dx1 = cur.x - prev.x;
            const dy1 = cur.y - prev.y;
            const dx2 = next.x - cur.x;
            const dy2 = next.y - cur.y;
            const len1 = Math.hypot(dx1, dy1) || 1;
            const len2 = Math.hypot(dx2, dy2) || 1;
            const rr = Math.min(r, len1 / 2, len2 / 2);
            d += ' L' + (cur.x - dx1 / len1 * rr) + ' ' + (cur.y - dy1 / len1 * rr);
            d += ' Q' + cur.x + ' ' + cur.y + ' ' + (cur.x + dx2 / len2 * rr) + ' ' + (cur.y + dy2 / len2 * rr);
        }
        const last = pts[pts.length - 1];
        d += ' L' + last.x + ' ' + last.y;
        return d;
    }

    function tlStemPoints(pin, startY, endY, selfId, boxes) {
        const down = endY > startY;
        const hits = boxes.filter(function (b) {
            if (b.id === selfId) return false;
            if (pin < b.left - 1 || pin > b.right + 1) return false;
            if (down) return b.top < endY - 8 && b.bottom > startY + 8;
            return b.bottom > endY + 8 && b.top < startY - 8;
        });
        const merged = mergeTlBoxes(hits);
        const pad = 16;
        const pts = [{ x: pin, y: startY }];
        merged.forEach(function (obs) {
            let enter;
            let leave;
            if (down) {
                if (obs.bottom <= startY + 4 || obs.top >= endY - 4) return;
                enter = Math.max(startY, obs.top - pad);
                leave = Math.min(endY, obs.bottom + pad);
            } else {
                if (obs.top >= startY - 4 || obs.bottom <= endY + 4) return;
                enter = Math.min(startY, obs.bottom + pad);
                leave = Math.max(endY, obs.top - pad);
            }
            if (down ? leave <= enter : leave >= enter) return;
            const leftX = obs.left - pad;
            const rightX = obs.right + pad;
            let around = Math.abs(pin - leftX) <= Math.abs(rightX - pin) ? leftX : rightX;
            if (around < TL_ORIGIN_X - 8) around = rightX;
            pts.push({ x: pin, y: enter });
            pts.push({ x: around, y: enter });
            pts.push({ x: around, y: leave });
            pts.push({ x: pin, y: leave });
        });
        const last = pts[pts.length - 1];
        if (!last || last.x !== pin) pts.push({ x: pin, y: last ? last.y : startY });
        const tail = pts[pts.length - 1];
        if (!tail || Math.abs(tail.y - endY) > 0.5) pts.push({ x: pin, y: endY });
        if (pts.length < 2) {
            pts.push({ x: pin, y: startY });
            pts.push({ x: pin, y: endY });
        }
        return pts;
    }

    function drawTimelineAxis() {
        const svg = $('timelineAxis');
        const stage = $('timelineStage');
        if (!svg || !stage) return;
        const x0 = TL_ORIGIN_X;
        const x1 = axisEnd();
        const y = TL_AXIS_Y;
        svg.setAttribute('viewBox', '0 0 ' + TL_STAGE_W + ' ' + TL_STAGE_H);
        svg.setAttribute('width', TL_STAGE_W);
        svg.setAttribute('height', TL_STAGE_H);
        const parts = [];
        parts.push('<defs><marker id="tl-arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto"><polygon points="0 0, 12 5, 0 10" fill="#a1a1aa"/></marker><marker id="tl-card-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#73737a"/></marker></defs>');
        parts.push('<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#a1a1aa" stroke-width="1.5" marker-end="url(#tl-arrow)"/>');
        parts.push('<circle cx="' + x0 + '" cy="' + y + '" r="4" fill="#e4e4e7"/>');
        const tickStep = 80;
        let n = 0;
        for (let x = x0; x < x1 - 24; x += tickStep) {
            const major = n % 5 === 0;
            parts.push('<line x1="' + x + '" y1="' + (y - (major ? 16 : 7)) + '" x2="' + x + '" y2="' + (y + (major ? 16 : 7)) + '" stroke="' + (major ? '#d4d4d8' : '#52525b') + '" stroke-width="' + (major ? '1.3' : '1') + '"/>');
            if (major) {
                parts.push('<text x="' + x + '" y="' + (y + 34) + '" text-anchor="middle" fill="#71717a" font-size="11" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">' + n + '</text>');
            }
            n += 1;
        }
        const nodes = {};
        stage.querySelectorAll('[data-event]').forEach(function (el) {
            nodes[el.getAttribute('data-event')] = el;
        });
        const boxes = (data.timeline || []).map(function (ev) {
            return tlCardBox(ev, nodes[ev.id]);
        }).filter(function (b) { return b && nodes[b.id]; });
        (data.timeline || []).forEach(function (ev) {
            const el = nodes[ev.id];
            const box = el ? tlCardBox(ev, el) : null;
            const pin = box ? box.pin : (Number(ev.pinX) || x0 + 80);
            const leaving = !!(el && el.classList.contains('is-out'));
            const outClass = leaving ? ' is-out' : '';
            parts.push('<line class="tl-pin' + outClass + '" data-tl-pin="' + esc(ev.id) + '" pathLength="1" x1="' + pin + '" y1="' + (y - 22) + '" x2="' + pin + '" y2="' + (y + 22) + '" stroke="#fafafa" stroke-width="1.6"/>');
            if (box) {
                const ends = tlStemEnds(box, y);
                let pts = tlStemPoints(ends.pin, ends.tickY, ends.cardY, ev.id, boxes);
                if (pts.length < 2) {
                    pts = [{ x: ends.pin, y: ends.tickY }, { x: ends.pin, y: ends.cardY }];
                }
                pts[0] = { x: ends.pin, y: ends.tickY };
                pts[pts.length - 1] = { x: ends.pin, y: ends.cardY };
                pts.reverse();
                let d = tlOrthoPath(pts, 10);
                if (!d) d = 'M' + ends.pin + ' ' + ends.cardY + ' L' + ends.pin + ' ' + ends.tickY;
                parts.push('<path class="tl-stem' + outClass + '" data-tl-stem="' + esc(ev.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#a1a1aa" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>');
            }
            if (ev.date) {
                parts.push('<text class="tl-pin-date' + outClass + '" data-tl-pin-date="' + esc(ev.id) + '" x="' + pin + '" y="' + (y - 40) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(formatDayLabel(ev.date)) + '</text>');
            }
        });
        (data.timeline || []).forEach(function (ev) {
            (ev.links || []).forEach(function (link) {
                const b = (data.timeline || []).find(function (item) { return item.id === link.to; });
                if (!b || b.id === ev.id) return;
                const boxA = tlCardBox(ev, nodes[ev.id]);
                const boxB = tlCardBox(b, nodes[b.id]);
                if (!boxA || !boxB) return;
                const d = tlCardLinkPath(boxA, boxB);
                if (!d) return;
                const elA = nodes[ev.id];
                const elB = nodes[b.id];
                const leaving = !!(elA && elA.classList.contains('is-out')) || !!(elB && elB.classList.contains('is-out'));
                parts.push('<path class="tl-card-link' + (leaving ? ' is-out' : '') + '" data-tl-link-a="' + esc(ev.id) + '" data-tl-link-b="' + esc(b.id) + '"' + (leaving ? ' pathLength="1"' : '') + ' d="' + d + '" fill="none" stroke="#73737a" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" marker-end="url(#tl-card-arrow)"/>');
            });
        });
        svg.innerHTML = parts.join('');
    }

    function nextCardTitle() {
        return 'Untitled Card';
    }

    function isDefaultCardTitle(title) {
        const t = String(title || '').trim();
        return !t || /^untitled card$/i.test(t) || /^Card\s*#\{\d+\}$/i.test(t);
    }

    function addEventAt(x, side, spawn) {
        hideTimelineIsland();
        rememberTimeline();
        const pinX = clampTimelineX(x);
        const ev = {
            id: uid('ev'),
            title: nextCardTitle(),
            date: '',
            time: '',
            body: '',
            entities: '',
            source: '',
            evidence: '',
            image: '',
            createdAt: new Date().toISOString(),
            links: [],
            pinX: pinX,
            side: side === 1 ? 1 : -1,
            pinned: true,
            spawn: !!spawn,
            mini: false
        };
        data.timeline.push(ev);
        selectedEvent = ev.id;
        hideTlFollow();
        renderTimeline();
        schedulePersist();
        requestAnimationFrame(function () {
            const node = document.querySelector('[data-event="' + ev.id + '"]');
            if (node && spawn) {
                node.addEventListener('animationend', function () {
                    node.classList.remove('is-spawn');
                    stackTimelineStems();
                    drawTimelineAxis();
                }, { once: true });
            }
            const title = node && node.querySelector('[data-tl-field="title"]');
            if (title) title.focus();
        });
        return ev;
    }

    function attachTimelineImage(id, src) {
        let rec = (data.timeline || []).find(function (item) { return item.id === id; });
        if (!rec) {
            rec = addEventAt(tlAimX, -1, true);
        }
        if (!rec || !src) return rec;
        rememberTimeline();
        rec.image = src;
        renderTimeline();
        schedulePersist();
        return rec;
    }

    function expandTimelineImage(src) {
        if (!src) return;
        const viewer = $('mediaViewer');
        const image = $('mediaImage');
        const card = $('mediaAudioCard');
        const audio = $('mediaAudio');
        if (!viewer || !image) return;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
        }
        if (card) card.hidden = true;
        image.hidden = false;
        image.src = src;
        viewer.hidden = false;
    }

    function recenterTimeline() {
        const view = $('timelineView');
        const y = view ? Math.round(view.clientHeight / 2 - TL_AXIS_Y) : 40;
        easeTimelineCam({ x: 48, y: y, z: 1 });
    }

    function openEventEditor(id) {
        const sheet = $('eventSheet');
        const ev = id ? (data.timeline || []).find(function (item) { return item.id === id; }) : null;
        $('eventEditId').value = ev ? ev.id : '';
        $('eventTitle').value = ev ? (ev.title || '') : '';
        $('eventDate').value = ev ? (ev.date || '') : '';
        syncEventDateBtn();
        $('eventTime').value = ev ? (ev.time || '') : '';
        $('eventBody').value = ev ? (ev.body || '') : '';
        $('eventEntities').value = ev ? (ev.entities || '') : '';
        $('eventSource').value = ev ? (ev.source || '') : '';
        $('eventEvidence').value = ev ? (ev.evidence || '') : '';
        $('eventImage').value = ev ? (ev.image || '') : '';
        fillEventImagePick();
        showSheet(sheet);
        const title = $('eventTitle');
        if (title) title.focus();
    }

    function fillEventImagePick() {
        const sel = $('eventImagePick');
        if (!sel) return;
        const items = imageItems();
        sel.innerHTML = '<option value="">Attach a case photo…</option>' + items.map(function (item, i) {
            return '<option value="' + esc(item.src) + '">Photo ' + (i + 1) + (item.primary ? ' (primary)' : '') + '</option>';
        }).join('');
    }

    function saveEventEditor() {
        const id = $('eventEditId').value;
        const payload = {
            id: id || uid('ev'),
            title: $('eventTitle').value.trim(),
            date: $('eventDate').value,
            time: $('eventTime').value,
            body: $('eventBody').value.trim(),
            entities: $('eventEntities').value.trim(),
            source: $('eventSource').value.trim(),
            evidence: $('eventEvidence').value.trim(),
            image: $('eventImage').value.trim(),
            createdAt: ''
        };
        if (!payload.title && !payload.body && !payload.date) return;
        rememberTimeline();
        const existing = (data.timeline || []).find(function (item) { return item.id === payload.id; });
        if (existing) {
            payload.createdAt = existing.createdAt || new Date().toISOString();
            payload.links = existing.links || [];
            payload.pinX = existing.pinX;
            payload.side = existing.side;
            payload.pinY = existing.pinY;
            payload.pinned = existing.pinned;
            payload.free = existing.free;
            payload.mini = existing.mini;
            payload.locked = existing.locked;
            payload.titleH = existing.titleH;
            payload.noteH = existing.noteH;
            payload.w = existing.w;
            payload.h = existing.h;
            Object.assign(existing, payload);
        } else {
            if (!payload.title) payload.title = nextCardTitle();
            payload.createdAt = new Date().toISOString();
            payload.links = [];
            payload.pinned = false;
            data.timeline.push(payload);
        }
        hideSheet($('eventSheet'));
        selectedEvent = payload.id;
        renderTimeline();
        schedulePersist();
    }

    function markTimelineStemOut(id) {
        const svg = $('timelineAxis');
        if (!svg || !id) return;
        const sel = '[data-tl-stem="' + id + '"], [data-tl-pin="' + id + '"], [data-tl-pin-date="' + id + '"], [data-tl-link-a="' + id + '"], [data-tl-link-b="' + id + '"]';
        svg.querySelectorAll(sel).forEach(function (el) { el.classList.add('is-out'); });
    }

    function deleteEvent(id) {
        const node = document.querySelector('#timelineList [data-event="' + id + '"]');
        if (node && node.classList.contains('is-out')) return;
        rememberTimeline();
        function commit() {
            data.timeline = (data.timeline || []).filter(function (item) { return item.id !== id; });
            data.timeline.forEach(function (item) {
                item.links = (item.links || []).filter(function (link) { return link.to !== id; });
            });
            if (selectedEvent === id) selectedEvent = '';
            if (connectFrom === id) connectFrom = '';
            renderTimeline();
            schedulePersist();
        }
        if (node && !reduceMotion()) {
            node.classList.add('is-out');
            markTimelineStemOut(id);
            afterEase(node, commit);
            return;
        }
        commit();
    }

    function toggleConnect(id) {
        if (connectFrom && connectFrom !== id) {
            rememberTimeline();
            const from = (data.timeline || []).find(function (item) { return item.id === connectFrom; });
            if (from) {
                from.links = from.links || [];
                if (!from.links.some(function (link) { return link.to === id; })) {
                    from.links.push({ to: id, label: '' });
                }
            }
            connectFrom = '';
            renderTimeline();
            schedulePersist();
            return;
        }
        connectFrom = connectFrom === id ? '' : id;
        timelineConnectOn = !!connectFrom;
        renderTimeline();
    }

    function findTimelineEvent(id) {
        return (data.timeline || []).find(function (item) { return item.id === id; }) || null;
    }

    function cloneTimelinePayload(ev, dx, dy) {
        const copy = JSON.parse(JSON.stringify(ev || {}));
        copy.id = uid('ev');
        copy.createdAt = new Date().toISOString();
        copy.links = [];
        copy.locked = false;
        copy.pinned = true;
        copy.free = true;
        copy.spawn = true;
        copy.pinX = clampTimelineX((Number(ev && ev.pinX) || TL_ORIGIN_X + 160) + (dx == null ? 48 : dx));
        copy.pinY = (Number(ev && ev.pinY) || TL_AXIS_Y - 180) + (dy == null ? 28 : dy);
        return copy;
    }

    function copyTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        tlClip = JSON.parse(JSON.stringify(rec));
    }

    function cutTimelineEvent(id) {
        copyTimelineEvent(id);
        deleteEvent(id);
    }

    function pasteTimelineEvent() {
        if (!tlClip) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(tlClip);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        if (tlDropAt) {
            copy.pinX = clampTimelineX(tlDropAt.x);
            copy.pinY = tlDropAt.y;
        }
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function duplicateTimelineEvent(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        const copy = cloneTimelinePayload(rec);
        if (isDefaultCardTitle(copy.title)) copy.title = nextCardTitle();
        data.timeline.push(copy);
        selectedEvent = copy.id;
        renderTimeline();
        schedulePersist();
    }

    function clearTimelineLinks(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.links = [];
        (data.timeline || []).forEach(function (other) {
            other.links = (other.links || []).filter(function (link) { return link.to !== id; });
        });
        renderTimeline();
        schedulePersist();
    }

    function flipTimelineSide(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.side = rec.side === 1 ? -1 : 1;
        rec.free = true;
        rec.pinned = true;
        const el = document.querySelector('#timelineList [data-event="' + id + '"]');
        const h = el ? el.offsetHeight : 128;
        rec.pinY = rec.side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - h;
        renderTimeline();
        schedulePersist();
    }

    function layerTimelineEvent(id, dir) {
        const list = data.timeline || [];
        const i = list.findIndex(function (item) { return item.id === id; });
        if (i < 0) return;
        rememberTimeline();
        const rec = list.splice(i, 1)[0];
        if (dir === 'front') list.push(rec);
        else if (dir === 'back') list.unshift(rec);
        else if (dir === 'up' || dir === 'forward') list.splice(Math.min(list.length, i + 1), 0, rec);
        else list.splice(Math.max(0, i - 1), 0, rec);
        selectedEvent = id;
        renderTimeline();
        schedulePersist();
    }

    function toggleTimelineLock(id) {
        const rec = findTimelineEvent(id);
        if (!rec) return;
        rememberTimeline();
        rec.locked = !rec.locked;
        renderTimeline();
        schedulePersist();
    }

    function hideTimelineMenu() {
        const menu = $('timelineMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        tlMenuId = '';
    }

    function placeTimelineMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        const rect = view.getBoundingClientRect();
        const maxH = Math.max(160, rect.height - 16);
        menu.style.maxHeight = maxH + 'px';
        const left = Math.min(Math.max(8, clientX - rect.left), Math.max(8, rect.width - 248));
        const menuH = Math.min(menu.scrollHeight || 320, maxH);
        const top = Math.min(Math.max(8, clientY - rect.top), Math.max(8, rect.height - menuH - 8));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function placeCardAtDrop(side) {
        const at = tlDropAt || { x: tlAimX, y: TL_AXIS_Y };
        const useSide = side == null ? (at.y >= TL_AXIS_Y ? 1 : -1) : side;
        const ev = addEventAt(at.x, useSide, true);
        if (!ev) return null;
        ev.free = true;
        ev.pinned = true;
        ev.pinY = at.y;
        renderTimeline();
        return ev;
    }

    function showTimelineCanvasMenu(clientX, clientY) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        if (!menu || !view) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        tlMenuId = '';
        selectedEvent = '';
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        let html = '';
        html += menuItem('data-tl-ctx="add"', 'note', 'Add card');
        html += menuItem('data-tl-ctx="add-above"', 'up', 'Add card above');
        html += menuItem('data-tl-ctx="add-below"', 'down', 'Add card below');
        html += menuItem('data-tl-ctx="add-image"', 'image', 'Insert image');
        html += '<hr>';
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', timelineConnectOn ? 'Stop connecting' : 'Connect cards');
        html += '<hr>';
        html += menuItem('data-tl-ctx="recenter"', 'recenter', 'Recenter');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function showTimelineCardMenu(clientX, clientY, id) {
        const menu = $('timelineMenu');
        const view = $('timelineView');
        const rec = findTimelineEvent(id);
        if (!menu || !view || !rec) return;
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        selectedEvent = id;
        tlMenuId = id;
        const world = timelineWorldAt(clientX, clientY);
        tlDropAt = { x: world.x, y: world.y };
        document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
            el.classList.toggle('is-on', el.getAttribute('data-event') === id);
        });
        let html = '';
        html += menuItem('data-tl-ctx="cut"', 'cut', 'Cut', '<span class="board-kbd">Ctrl+X</span>');
        html += menuItem('data-tl-ctx="copy"', 'copy', 'Copy', '<span class="board-kbd">Ctrl+C</span>');
        html += menuItem('data-tl-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
        html += '<hr>';
        html += menuItem('data-tl-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
        html += menuItem('data-tl-ctx="connect"', 'connect', connectFrom === id ? 'Pick second card' : 'Connect cards');
        html += menuItem('data-tl-ctx="clear-links"', 'clear-links', 'Clear connections');
        html += '<hr>';
        html += menuItem('data-tl-ctx="date"', 'calendar', rec.date ? 'Change date' : 'Add date');
        html += menuItem('data-tl-ctx="time"', 'clock', rec.time ? 'Change time' : 'Add time');
        html += menuItem('data-tl-ctx="image"', 'image', rec.image ? 'Replace image' : 'Attach image');
        html += menuItem('data-tl-ctx="mini"', rec.mini ? 'expand' : 'mini', rec.mini ? 'Expand' : 'Minimize');
        html += menuItem('data-tl-ctx="flip"', 'flip-v', rec.side === 1 ? 'Move above axis' : 'Move below axis');
        html += '<hr>';
        html += menuItem('data-tl-ctx="up"', 'up', 'Bring forward');
        html += menuItem('data-tl-ctx="down"', 'down', 'Send backward');
        html += menuItem('data-tl-ctx="front"', 'front', 'Bring to front');
        html += menuItem('data-tl-ctx="back"', 'back', 'Send to back');
        html += '<hr>';
        html += menuItem('data-tl-ctx="lock"', rec.locked ? 'unlock' : 'lock', rec.locked ? 'Unlock' : 'Lock');
        html += '<hr>' + menuItem('data-tl-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        placeTimelineMenu(clientX, clientY);
    }

    function runTimelineMenu(act, id) {
        hideTimelineMenu();
        if (!act) return;
        if (act === 'add' || act === 'add-above' || act === 'add-below') {
            const side = act === 'add-above' ? -1 : act === 'add-below' ? 1 : null;
            placeCardAtDrop(side);
            return;
        }
        if (act === 'add-image') {
            const ev = placeCardAtDrop(null);
            if (ev) {
                timelinePhotoId = ev.id;
                const input = $('timelineImageFile');
                if (input) input.click();
            }
            return;
        }
        if (act === 'recenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        if (act === 'cut' && id) cutTimelineEvent(id);
        if (act === 'copy' && id) copyTimelineEvent(id);
        if (act === 'paste') pasteTimelineEvent();
        if (act === 'duplicate' && id) duplicateTimelineEvent(id);
        if (act === 'connect') {
            if (id) toggleConnect(id);
            else {
                timelineConnectOn = !timelineConnectOn;
                if (!timelineConnectOn) connectFrom = '';
                applyTimelineCam();
                renderTimeline();
            }
        }
        if (act === 'clear-links' && id) clearTimelineLinks(id);
        if (act === 'date' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-cal]');
            if (btn) openCalendar(btn);
        }
        if (act === 'time' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] .tl-ico[data-tl-time]');
            if (btn) openTimePicker(btn);
        }
        if (act === 'image' && id) {
            timelinePhotoId = id;
            const input = $('timelineImageFile');
            if (input) input.click();
        }
        if (act === 'mini' && id) {
            const btn = document.querySelector('#timelineList [data-event="' + id + '"] [data-tl-mini]');
            if (btn) btn.click();
        }
        if (act === 'flip' && id) flipTimelineSide(id);
        if (act === 'up' && id) layerTimelineEvent(id, 'up');
        if (act === 'down' && id) layerTimelineEvent(id, 'down');
        if (act === 'front' && id) layerTimelineEvent(id, 'front');
        if (act === 'back' && id) layerTimelineEvent(id, 'back');
        if (act === 'lock' && id) toggleTimelineLock(id);
        if (act === 'delete' && id) deleteEvent(id);
    }

    function boardImageTag(node) {
        const w = Math.max(1, Math.round(node.imgW || node.w || 240));
        const h = Math.max(1, Math.round(node.imgH || node.h || 168));
        if (node.blur) {
            return '<img src="' + esc(node.blur) + '" data-full="' + esc(node.src) + '" width="' + w + '" height="' + h + '" alt="" style="filter:blur(12px)">';
        }
        return '<img src="' + esc(node.src) + '" width="' + w + '" height="' + h + '" alt="">';
    }

    document.addEventListener('load', function (event) {
        const img = event.target;
        if (!img || !img.getAttribute || !img.getAttribute('data-full')) return;
        const full = img.getAttribute('data-full');
        img.removeAttribute('data-full');
        img.style.filter = '';
        if (full) img.src = full;
    }, true);

    function syncBoardToolThumb(instant) {
        const bar = document.querySelector('.board-toolbar');
        if (!bar) return;
        let thumb = bar.querySelector('.board-tool-thumb');
        if (!thumb) {
            thumb = document.createElement('span');
            thumb.className = 'board-tool-thumb';
            thumb.setAttribute('aria-hidden', 'true');
            bar.insertBefore(thumb, bar.firstChild);
            instant = true;
        }
        let on = bar.querySelector('[data-board-tool].is-on');
        if (!on) on = bar.querySelector('[data-board-more]');
        if (!on) {
            thumb.style.opacity = '0';
            return;
        }
        const x = on.offsetLeft;
        const y = on.offsetTop;
        const w = on.offsetWidth;
        const h = on.offsetHeight;
        if (!(w > 0)) return;
        const snap = instant || reduceMotion() || !thumb.style.width;
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = x + 'px';
        thumb.style.top = y + 'px';
        thumb.style.width = w + 'px';
        thumb.style.height = h + 'px';
        thumb.style.opacity = '1';
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function syncBoardTools() {
        document.querySelectorAll('[data-board-tool]').forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-board-tool') === boardTool);
        });
        const presetBtn = document.querySelector('[data-board-presets]');
        const presetSheet = $('boardPresetSheet');
        if (presetBtn) presetBtn.classList.toggle('is-on', !!(presetSheet && !presetSheet.hidden));
        const view = $('boardView');
        if (view) {
            view.classList.toggle('is-connect', boardTool === 'connect');
            view.classList.toggle('is-draw', BOARD_PLACE.indexOf(boardTool) >= 0 || boardTool === 'draw');
            view.classList.toggle('is-erase', boardTool === 'eraser');
            view.classList.toggle('is-laser', boardTool === 'laser');
            view.classList.toggle('is-lasso', boardTool === 'lasso');
            view.classList.toggle('is-bucket', boardTool === 'bucket');
            view.classList.toggle('is-pan', boardTool === 'pan');
            view.classList.toggle('is-select', boardTool === 'select' || !boardTool);
            view.classList.toggle('is-plain', data.whiteboard.grid === false);
        }
        if (boardTool !== 'laser') stopLaser(true);
        syncBoardToolThumb(false);
    }

    function boardHintText() {
        if (boardTool === 'connect') return 'Drag a point onto another shape.';
        if (boardTool === 'arrow' || boardTool === 'line') return 'Drag from one point to another. Drop an end on a shape to attach.';
        if (boardTool === 'draw') return boardDrawToShape ? 'Draw a shape. Release to snap it.' : 'Draw freely. Release to finish.';
        if (boardTool === 'eraser') return 'Click or drag to erase.';
        if (boardTool === 'laser') return 'Laser stays on until you pick another tool.';
        if (boardTool === 'lasso') return 'Drag around shapes to select them.';
        if (boardTool === 'bucket') return 'Click a shape to fill it.';
        if (boardTool === 'note') return 'Click or drag to place a sticky note.';
        if (boardTool === 'frame') return 'Drag to place a frame.';
        if (boardTool === 'embed') return 'Drag a frame, then paste a page URL.';
        return '';
    }

    function renderWhiteboard() {
        const stage = $('boardStage');
        const links = $('boardLinks');
        if (!stage) return;
        const board = data.whiteboard;
        stage.style.transform = 'translate(' + board.x + 'px,' + board.y + 'px) scale(' + board.z + ')';
        stage.style.setProperty('--wb-z', board.z || 1);
        const nodes = board.nodes || [];
        nodes.forEach(function (n) {
            if (isStrokeRec(n)) {
                followStrokeBinds(n);
                layoutStroke(n);
            }
        });
        stage.querySelectorAll('.wb-node').forEach(function (el) { el.remove(); });
        nodes.forEach(function (raw) {
            const node = normalizeBoardNode(raw);
            const el = document.createElement('article');
            const shape = node.shape || 'process';
            const ink = shape === 'draw' || node.type === 'draw';
            const stroke = isStrokeShape(shape);
            const geo = isGeoShape(shape) && node.type !== 'text' && !ink && !stroke;
            el.className = 'wb-node' +
                (geo ? ' is-geo' : '') +
                (ink ? ' is-ink' : '') +
                (node.type === 'text' ? ' is-text' : '') +
                (node.type === 'note' ? ' is-sticky' : '') +
                (node.type === 'image' ? ' is-image' : '') +
                (node.type === 'embed' ? ' is-embed' : '') +
                (stroke ? ' is-stroke' : '') +
                (node.type === 'image' && !node.src ? ' is-empty' : '') +
                ((boardPicked.length ? boardPicked : [boardSelected]).indexOf(node.id) >= 0 ? ' is-on' : '') +
                (boardConnect === node.id ? ' is-from' : '') +
                (node.done ? ' is-done' : '') +
                (node.locked ? ' is-locked' : '') +
                (node.flipX && !stroke ? ' is-flip-x' : '') +
                (node.flipY && !stroke ? ' is-flip-y' : '');
            el.dataset.node = node.id;
            el.dataset.shape = shape;
            el.style.setProperty('--tone', typeMeta(node.type).color);
            let copy = '';
            if (ink) {
                copy = '';
            } else if (node.type === 'embed' && node.src) {
                copy = '<iframe src="' + esc(node.src) + '" sandbox="allow-scripts allow-popups allow-forms" referrerpolicy="no-referrer" title=""></iframe>';
            } else if (node.type === 'embed') {
                copy = '<div class="wb-image-slot">' +
                    '<label for="wb-embed-' + esc(node.id) + '">Page URL</label>' +
                    '<input id="wb-embed-' + esc(node.id) + '" type="url" data-wb-embed-url placeholder="Paste page URL">' +
                    '</div>';
            } else if (node.type === 'image' && node.src) {
                copy = boardImageTag(node);
            } else if (node.type === 'image') {
                copy = '<div class="wb-image-slot">' +
                    '<button type="button" data-wb-upload>Upload</button>' +
                    '<label for="wb-image-' + esc(node.id) + '">Image URL</label>' +
                    '<input id="wb-image-' + esc(node.id) + '" type="url" data-wb-image-url placeholder="Paste image URL">' +
                    '</div>';
            } else {
                const img = node.shape === 'document' && node.src ? boardImageTag(node) : '';
                const href = node.href ? '<p class="wb-href">' + esc(node.href) + '</p>' : '';
                copy = img +
                    '<div class="wb-text" data-wb-text>' +
                    (node.title ? '<h3>' + esc(node.title) + '</h3>' : '') +
                    (node.body ? '<p>' + esc(node.body) + '</p>' : '') +
                    '</div>' + href;
            }
            el.innerHTML = (ink ? inkChrome(node) : (stroke || geo ? shapeChrome(shape, node) : '')) + (stroke ? '' : '<div class="wb-face"><div class="wb-copy">' +
                copy +
                '</div></div>') + portMarkup(shape) + (boardSelected === node.id && !node.locked && boardTool !== 'connect' ? handleMarkup(shape, node) : '');
            applyNodeBox(el, node);
            stage.appendChild(el);
            if (node.type === 'image' && node.src && !(Number(node.ratio) > 0)) fitImageNode(node, node.src);
        });
        const empty = $('boardEmpty');
        if (empty) empty.hidden = nodes.length > 0 || (board.links || []).length > 0;
        const hint = $('boardHint');
        if (hint) {
            const text = boardHintText();
            hint.hidden = !text;
            hint.textContent = text;
        }
        drawBoardLinks(links, board);
        syncBoardTools();
        syncBoardInspect();
        syncBoardGroupBox();
        syncDock();
        const play = $('boardPlaybook');
        if (play && data.flowchart && data.flowchart.preset && play.value !== data.flowchart.preset) {
            play.value = data.flowchart.preset;
        }
    }

    function nodeAnchor(node, toward) {
        return portPoint(node, inferPort(node, toward));
    }

    function drawBoardLinks(svg, board) {
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.setAttribute('overflow', 'visible');
        svg.classList.toggle('is-edit', !!boardLinkSelected);
        const list = board.links || [];
        list.forEach(function (link, i) { list[i] = normalizeLink(link); });
        const markers = {};
        const paths = ['<defs>'];
        list.forEach(function (link) {
            const color = link.stroke || '#d4d4d8';
            const key = markerKey(color);
            if (markers[key]) return;
            markers[key] = true;
            paths.push('<marker id="' + key + '" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0.6 L8 4 L0 7.4 z" fill="' + color + '"/></marker>');
        });
        paths.push('</defs>');
        let selectedEnds = null;
        list.forEach(function (link) {
            if (link.from && !findBoardNode(link.from)) {
                link.from = '';
                link.fromPort = '';
            }
            if (link.to && !findBoardNode(link.to)) {
                link.to = '';
                link.toPort = '';
            }
            if (!link.from && !link.to && !link.x1 && !link.y1 && !link.x2 && !link.y2) return;
            const ends = linkEnds(link);
            link.x1 = ends.p1.x;
            link.y1 = ends.p1.y;
            link.x2 = ends.p2.x;
            link.y2 = ends.p2.y;
            const on = boardLinkSelected === link.id || boardPickedLinks.indexOf(link.id) >= 0;
            if (on) selectedEnds = ends;
            const color = link.stroke || '#d4d4d8';
            const sw = link.sw || 1.7;
            const dash = dashFor(link.dash);
            const op = link.op == null ? 1 : link.op;
            const d = linkPath(ends.p1, ends.fromPort, ends.p2, ends.toPort);
            paths.push('<path class="wb-link-hit" data-link="' + esc(link.id) + '" d="' + d + '" fill="none"/>');
            paths.push('<path class="wb-link' + (on ? ' is-on' : '') + '" data-link="' + esc(link.id) + '" d="' + d + '" fill="none" stroke="' + color + '" style="--wb-link-sw:' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' opacity="' + op + '" marker-end="url(#' + markerKey(color) + ')"/>');
            if (link.label) {
                const mx = (ends.p1.x + ends.p2.x) / 2;
                const my = (ends.p1.y + ends.p2.y) / 2;
                paths.push('<text x="' + mx + '" y="' + (my - 8) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(link.label) + '</text>');
            }
        });
        paths.push('<path id="boardLinkDraft" fill="none" d="M0 0" opacity="0"/>');
        svg.innerHTML = paths.join('');
        const stage = svg.parentNode;
        if (!stage) return;
        let ui = stage.querySelector('.wb-link-ui');
        if (selectedEnds) {
            if (!ui) {
                ui = document.createElement('div');
                ui.className = 'wb-link-ui';
                stage.appendChild(ui);
            }
            ui.innerHTML =
                '<button type="button" class="wb-link-knob" data-link="' + esc(boardLinkSelected) + '" data-link-handle="start" style="left:' + selectedEnds.p1.x + 'px;top:' + selectedEnds.p1.y + 'px" aria-label="Move start"></button>' +
                '<button type="button" class="wb-link-knob" data-link="' + esc(boardLinkSelected) + '" data-link-handle="end" style="left:' + selectedEnds.p2.x + 'px;top:' + selectedEnds.p2.y + 'px" aria-label="Move end"></button>';
        } else if (ui) {
            ui.remove();
        }
    }

    function addBoardNode(type, at) {
        rememberBoard();
        const kind = BOARD_PLACE.indexOf(type) >= 0 ? type : (BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'process');
        const board = data.whiteboard;
        const origin = at || {
            x: (180 - board.x) / (board.z || 1),
            y: (120 - board.y) / (board.z || 1)
        };
        const meta = typeMeta(kind);
        const node = normalizeBoardNode({
            id: uid('nd'),
            type: kind,
            shape: meta.shape,
            x: origin.x,
            y: origin.y,
            w: origin.w,
            h: origin.h,
            title: BOARD_GEO.indexOf(kind) >= 0 || kind === 'image' || kind === 'embed' ? (kind === 'frame' ? 'Frame' : '') : (kind === 'person' ? (subjectName() || 'Person') : meta.label),
            body: '',
            src: ''
        });
        if (kind === 'web') node.body = firstValue('domain') || '';
        if (kind === 'person') node.body = [firstValue('username'), firstValue('email')].filter(Boolean).join(' · ');
        if (kind === 'text') { node.title = ''; node.body = ''; node.w = 220; node.h = 48; }
        if (kind === 'note') {
            node.title = '';
            node.body = '';
            node.w = 176;
            node.h = 176;
            node.fill = '#f3e08a';
            node.stroke = '#c9a227';
        }
        if (kind === 'image') { node.fill = 'rgba(250,250,250,0.08)'; node.dash = 'dotted'; node.stroke = '#3f3f46'; }
        if (kind === 'frame') { node.dash = 'dashed'; node.fill = 'rgba(250,250,250,0.04)'; }
        if (kind === 'finding') { node.title = 'Finding'; node.body = ''; }
        if (kind === 'question') { node.title = 'Question'; node.body = ''; }
        if (kind === 'event') {
            const last = numberedTimeline();
            node.body = last.length ? (last[last.length - 1].title || '') : '';
        }
        if (kind === 'evidence') {
            const locker = data.evidence || [];
            if (locker.length) node.body = locker[locker.length - 1].title || '';
        }
        board.nodes.push(node);
        boardSelected = node.id;
        renderWhiteboard();
        schedulePersist();
        return node;
    }

    function deleteBoardNode(id) {
        if (!id) return;
        const rec = findBoardNode(id);
        if (rec && rec.locked) return;
        rememberBoard();
        data.whiteboard.nodes = data.whiteboard.nodes.filter(function (n) { return n.id !== id; });
        data.whiteboard.links = data.whiteboard.links.filter(function (l) { return l.from !== id && l.to !== id; });
        if (boardSelected === id) boardSelected = '';
        boardPicked = boardPicked.filter(function (item) { return item !== id; });
        if (boardLinkSelected && !findBoardLink(boardLinkSelected)) boardLinkSelected = '';
        if (boardConnect === id) {
            boardConnect = '';
            boardConnectPort = '';
        }
        renderWhiteboard();
        schedulePersist();
    }

    function deleteBoardSelection() {
        const ids = (boardPicked.length ? boardPicked : (boardSelected ? [boardSelected] : [])).slice();
        const linkIds = (boardPickedLinks.length ? boardPickedLinks : (boardLinkSelected ? [boardLinkSelected] : [])).slice();
        if (!ids.length && !linkIds.length) return;
        rememberBoard();
        const drop = {};
        ids.forEach(function (id) {
            const rec = findBoardNode(id);
            if (rec && rec.locked) return;
            drop[id] = true;
        });
        const dropLink = {};
        linkIds.forEach(function (id) { dropLink[id] = true; });
        data.whiteboard.nodes = (data.whiteboard.nodes || []).filter(function (n) { return !drop[n.id]; });
        data.whiteboard.links = (data.whiteboard.links || []).filter(function (l) {
            if (dropLink[l.id]) return false;
            return !drop[l.from] && !drop[l.to];
        });
        boardSelected = '';
        boardLinkSelected = '';
        boardPicked = [];
        boardPickedLinks = [];
        boardConnect = '';
        boardConnectPort = '';
        renderWhiteboard();
        schedulePersist();
    }

    function toggleBoardDone(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        rec.done = !rec.done;
        if (rec.flow && rec.stepId) {
            data.flowchart.checks[rec.flow] = data.flowchart.checks[rec.flow] || {};
            data.flowchart.checks[rec.flow][rec.stepId] = rec.done;
        }
        renderWhiteboard();
        schedulePersist();
    }

    function insertPlaybook(presetId, at) {
        const preset = FLOW_PRESETS.find(function (item) { return item.id === presetId; }) || FLOW_PRESETS[0];
        const board = data.whiteboard;
        data.flowchart.preset = preset.id;
        const existing = (board.nodes || []).filter(function (n) { return n.flow === preset.id; });
        if (existing.length) {
            boardSelected = existing[0].id;
            board.x = 48 - existing[0].x * board.z;
            board.y = 96 - existing[0].y * board.z;
            renderWhiteboard();
            return;
        }
        const originX = at && at.x != null ? at.x : Math.max(80, (120 - board.x) / (board.z || 1));
        const originY = at && at.y != null ? at.y : Math.max(80, (140 - board.y) / (board.z || 1));
        const checks = data.flowchart.checks[preset.id] || {};
        const notes = data.flowchart.notes[preset.id] || {};
        const start = normalizeBoardNode({
            id: uid('nd'),
            type: 'terminator',
            shape: 'terminator',
            flow: preset.id,
            stepId: 'start',
            x: originX,
            y: originY,
            title: preset.chip,
            body: preset.lead
        });
        board.nodes.push(start);
        let prev = start;
        preset.steps.forEach(function (step, i) {
            const node = normalizeBoardNode({
                id: uid('nd'),
                type: 'process',
                shape: 'process',
                flow: preset.id,
                stepId: step.id,
                href: step.href || '',
                x: originX,
                y: originY + 92 + i * 118,
                title: String(i + 1).padStart(2, '0') + '  ' + step.title,
                body: notes[step.id] || step.body,
                done: !!checks[step.id]
            });
            board.nodes.push(node);
            board.links.push(normalizeLink({ from: prev.id, to: node.id, fromPort: 's', toPort: 'n', label: '' }));
            prev = node;
        });
        boardSelected = start.id;
        renderWhiteboard();
        schedulePersist();
    }

    function boardViewportOrigin(offsetX, offsetY) {
        const view = $('boardView');
        const board = data.whiteboard;
        const z = board.z || 1;
        const vw = view ? view.clientWidth : 900;
        const vh = view ? view.clientHeight : 600;
        return {
            x: Math.max(40, ((vw * 0.5) - (board.x || 0)) / z - (offsetX || 280)),
            y: Math.max(40, ((vh * 0.42) - (board.y || 0)) / z - (offsetY || 80))
        };
    }

    function openBoardPresets() {
        hideBoardMore();
        hideBoardAddMenu();
        showSheet($('boardPresetSheet'));
        syncBoardTools();
    }

    function closeBoardPresets() {
        hideSheet($('boardPresetSheet'));
        syncBoardTools();
    }

    function presetPush(ids, spec) {
        const node = normalizeBoardNode(Object.assign({ id: uid('nd') }, spec));
        data.whiteboard.nodes.push(node);
        ids.push(node.id);
        return node;
    }

    function presetJoin(fromNode, toNode, fromPort, toPort, label) {
        data.whiteboard.links = data.whiteboard.links || [];
        data.whiteboard.links.push(normalizeLink({
            from: fromNode.id,
            to: toNode.id,
            fromPort: fromPort || 'e',
            toPort: toPort || 'w',
            label: label || ''
        }));
    }

    function finishBoardPreset(ids) {
        boardPicked = ids.slice();
        boardSelected = ids[0] || '';
        boardTool = 'select';
        closeBoardPresets();
        renderWhiteboard();
        schedulePersist();
    }

    function insertBoardPreset(kind) {
        rememberBoard();
        if (kind === 'bubble') insertBubblePreset();
        else if (kind === 'flowchart') insertFlowchartPreset();
        else if (kind === 'timeline') insertTimelinePreset();
        else if (kind === 'treemap') insertTreemapPreset();
    }

    function insertBubblePreset() {
        const at = boardViewportOrigin(360, 80);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const topicA = presetPush(ids, {
            type: 'circle', shape: 'circle', x: ox + 168, y: oy + 56, w: 176, h: 176,
            title: 'Topic A', fill: 'rgba(103,232,249,0.12)', stroke: '#67e8f9'
        });
        const topicB = presetPush(ids, {
            type: 'circle', shape: 'circle', x: ox + 392, y: oy + 56, w: 176, h: 176,
            title: 'Topic B', fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        [
            { x: ox + 8, y: oy + 8, title: 'Unique to A' },
            { x: ox, y: oy + 108, title: 'Unique to A' },
            { x: ox + 8, y: oy + 208, title: 'Unique to A' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 112, h: 72,
                title: item.title, fill: 'rgba(250,250,250,0.06)'
            });
            presetJoin(node, topicA, 'e', 'w');
        });
        [
            { x: ox + 616, y: oy + 8, title: 'Unique to B' },
            { x: ox + 628, y: oy + 108, title: 'Unique to B' },
            { x: ox + 616, y: oy + 208, title: 'Unique to B' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 112, h: 72,
                title: item.title, fill: 'rgba(250,250,250,0.06)'
            });
            presetJoin(node, topicB, 'w', 'e');
        });
        [
            { x: ox + 248, y: oy + 268, title: 'Shared' },
            { x: ox + 376, y: oy + 268, title: 'Shared' },
            { x: ox + 312, y: oy + 356, title: 'Shared' }
        ].forEach(function (item) {
            const node = presetPush(ids, {
                type: 'circle', shape: 'circle', x: item.x, y: item.y, w: 120, h: 72,
                title: item.title, fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
            });
            presetJoin(node, topicA, 'n', 's');
            presetJoin(node, topicB, 'n', 's');
        });
        finishBoardPreset(ids);
    }

    function insertFlowchartPreset() {
        const at = boardViewportOrigin(200, 40);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const start = presetPush(ids, {
            type: 'terminator', shape: 'terminator', x: ox + 126, y: oy, w: 188, h: 64, title: 'Start',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        const step = presetPush(ids, {
            type: 'process', shape: 'process', x: ox + 120, y: oy + 108, w: 200, h: 80, title: 'Process'
        });
        const decision = presetPush(ids, {
            type: 'decision', shape: 'decision', x: ox + 136, y: oy + 232, w: 168, h: 168, title: 'Decision?',
            fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        const yes = presetPush(ids, {
            type: 'process', shape: 'process', x: ox, y: oy + 448, w: 168, h: 72, title: 'Yes'
        });
        const no = presetPush(ids, {
            type: 'process', shape: 'process', x: ox + 272, y: oy + 448, w: 168, h: 72, title: 'No'
        });
        const end = presetPush(ids, {
            type: 'terminator', shape: 'terminator', x: ox + 126, y: oy + 568, w: 188, h: 64, title: 'End',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        presetJoin(start, step, 's', 'n');
        presetJoin(step, decision, 's', 'n');
        presetJoin(decision, yes, 'w', 'n');
        presetJoin(decision, no, 'e', 'n');
        presetJoin(yes, end, 's', 'w');
        presetJoin(no, end, 's', 'e');
        finishBoardPreset(ids);
    }

    function insertTimelinePreset() {
        const at = boardViewportOrigin(380, 60);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        const labels = ['Event 1', 'Event 2', 'Event 3', 'Event 4'];
        const markers = [];
        labels.forEach(function (title, i) {
            const cx = ox + i * 210;
            const above = i % 2 === 0;
            const card = presetPush(ids, {
                type: 'process', shape: 'process', x: cx, y: above ? oy : oy + 168, w: 168, h: 72,
                title: title, body: 'Date'
            });
            const marker = presetPush(ids, {
                type: 'circle', shape: 'circle', x: cx + 68, y: oy + 96, w: 32, h: 32, title: '',
                fill: 'rgba(103,232,249,0.18)', stroke: '#67e8f9'
            });
            presetJoin(card, marker, above ? 's' : 'n', above ? 'n' : 's');
            if (markers.length) presetJoin(markers[markers.length - 1], marker, 'e', 'w');
            markers.push(marker);
        });
        finishBoardPreset(ids);
    }

    function insertTreemapPreset() {
        const at = boardViewportOrigin(340, 40);
        const ox = at.x;
        const oy = at.y;
        const ids = [];
        presetPush(ids, {
            type: 'frame', shape: 'frame', x: ox, y: oy, w: 680, h: 420, title: 'Treemap',
            dash: 'dashed', fill: 'rgba(250,250,250,0.04)'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 16, y: oy + 44, w: 328, h: 360, title: 'Group A', body: '42%',
            fill: 'rgba(103,232,249,0.12)', stroke: '#67e8f9'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 356, y: oy + 44, w: 308, h: 168, title: 'Group B', body: '28%',
            fill: 'rgba(251,191,36,0.12)', stroke: '#fbbf24'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 356, y: oy + 224, w: 148, h: 180, title: 'Group C', body: '16%',
            fill: 'rgba(196,181,253,0.12)', stroke: '#c4b5fd'
        });
        presetPush(ids, {
            type: 'process', shape: 'square', x: ox + 516, y: oy + 224, w: 148, h: 180, title: 'Group D', body: '14%',
            fill: 'rgba(134,239,172,0.12)', stroke: '#86efac'
        });
        finishBoardPreset(ids);
    }

    function openBoardEditor(id) {
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        $('boardEditId').value = rec.id;
        $('boardTitle').value = rec.title || '';
        $('boardBody').value = rec.body || '';
        $('boardImage').value = rec.src || '';
        const size = shapeSize(rec);
        const width = $('boardWidth');
        const height = $('boardHeight');
        if (width) width.value = Math.round(size.w);
        if (height) height.value = Math.round(size.h);
        const shape = $('boardShape');
        if (shape) shape.value = rec.shape && BOARD_SHAPES[rec.shape] ? rec.shape : (typeMeta(rec.type).shape || 'process');
        const kicker = $('boardSheetKicker');
        if (kicker) kicker.textContent = rec.flow ? 'Playbook' : prettyLabel(rec.type || 'shape');
        showSheet($('boardSheet'));
        const title = $('boardTitle');
        if (title) title.focus();
    }

    function saveBoardEditor() {
        const id = $('boardEditId').value;
        const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
        if (!rec) return;
        rec.title = $('boardTitle').value.trim().slice(0, 80);
        rec.body = $('boardBody').value.trim().slice(0, 400);
        rec.src = $('boardImage').value.trim();
        const shape = $('boardShape') && $('boardShape').value;
        if (shape && BOARD_SHAPES[shape]) rec.shape = shape;
        const width = Number($('boardWidth') && $('boardWidth').value);
        const height = Number($('boardHeight') && $('boardHeight').value);
        if (isImageNode(rec)) {
            if (width) rec.w = Math.max(48, Math.min(1200, width));
            applyImageRatio(rec, 'w');
            if (rec.src) fitImageNode(rec, rec.src);
        } else {
            if (width) rec.w = Math.max(48, Math.min(1200, width));
            if (height) rec.h = Math.max(48, Math.min(1200, height));
        }
        if (rec.flow && rec.stepId && rec.stepId !== 'start') {
            data.flowchart.notes[rec.flow] = data.flowchart.notes[rec.flow] || {};
            data.flowchart.notes[rec.flow][rec.stepId] = rec.body;
        }
        hideSheet($('boardSheet'));
        renderWhiteboard();
        schedulePersist();
    }

    function showSheet(el) {
        if (!el) return;
        el.hidden = false;
        requestAnimationFrame(function () { el.classList.add('is-in'); });
    }

    function hideSheet(el) {
        if (!el) return;
        el.classList.remove('is-in');
        el.hidden = true;
    }

    function hostName(value) {
        return String(value || '').trim().replace(/^https?:\/\//i, '').split('/')[0].replace(/:\d+$/, '').toLowerCase();
    }

    function applyBoardTransform() {
        const stage = $('boardStage');
        const board = data.whiteboard;
        if (stage) {
            stage.style.transform = 'translate(' + board.x + 'px,' + board.y + 'px) scale(' + board.z + ')';
            stage.style.setProperty('--wb-z', board.z || 1);
        }
    }

    function setBoardDrift(clientX, clientY) {
        const idle = reduceMotion() || clientX == null || clientY == null;
        let px = 0;
        let py = 0;
        let bgx = 0;
        let bgy = 0;
        if (!idle) {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const nx = Math.max(-1, Math.min(1, (clientX / w - 0.5) * 2));
            const ny = Math.max(-1, Math.min(1, (clientY / h - 0.5) * 2));
            px = nx * 8;
            py = ny * 6;
            bgx = nx * 14;
            bgy = ny * 10;
        }
        boardDrift.x = px;
        boardDrift.y = py;
        ['boardView'].forEach(function (id) {
            const el = $(id);
            if (!el) return;
            el.style.setProperty('--wb-px', px + 'px');
            el.style.setProperty('--wb-py', py + 'px');
            el.style.setProperty('--wb-bgx', bgx + 'px');
            el.style.setProperty('--wb-bgy', bgy + 'px');
        });
    }

    function worldFromClient(clientX, clientY) {
        const view = $('boardView');
        const board = data.whiteboard;
        const rect = view.getBoundingClientRect();
        const z = board.z || 1;
        return {
            x: (clientX - rect.left - board.x - boardDrift.x) / z,
            y: (clientY - rect.top - board.y - boardDrift.y) / z
        };
    }

    function hideBoardAddMenu(keepDrop) {
        const menu = $('boardAddMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        if (!keepDrop) boardDropAt = null;
    }

    function hideBoardMore() {
        const more = $('boardMoreMenu');
        if (more) more.hidden = true;
    }

    function showBoardMore() {
        const more = $('boardMoreMenu');
        const btn = document.querySelector('[data-board-more]');
        const view = $('boardView');
        if (!more) return;
        more.hidden = false;
        if (!btn || !view) return;
        const vr = view.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        const width = Math.min(248, vr.width - 16);
        more.style.width = width + 'px';
        more.style.transform = 'none';
        more.style.left = Math.min(Math.max(8, br.left - vr.left - 80), Math.max(8, vr.width - width - 8)) + 'px';
        more.style.top = (br.bottom - vr.top + 8) + 'px';
    }

    function setBoardOverlay(d, cls) {
        const svg = $('boardOverlay');
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.style.opacity = '1';
        svg.innerHTML = d ? '<path class="' + (cls || 'wb-lasso') + '" d="' + d + '"/>' : '';
    }

    function stopLaser(clear) {
        if (laserRaf) {
            cancelAnimationFrame(laserRaf);
            laserRaf = 0;
        }
        laserPts = [];
        if (!clear) return;
        const svg = $('boardOverlay');
        if (svg) {
            svg.style.opacity = '1';
            svg.innerHTML = '';
        }
    }

    function paintLaser() {
        const svg = $('boardOverlay');
        if (!svg) return;
        svg.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
        svg.setAttribute('width', BOARD_W);
        svg.setAttribute('height', BOARD_H);
        svg.style.opacity = '1';
        if (!laserPts.length) {
            svg.innerHTML = '';
            return;
        }
        const d = overlayLine(laserPts, false);
        const head = laserPts[laserPts.length - 1];
        svg.innerHTML =
            (d ? '<path class="wb-laser" d="' + d + '"/>' : '') +
            '<circle class="wb-laser-head" cx="' + head.x + '" cy="' + head.y + '" r="4"/>';
    }

    function tickLaser() {
        laserRaf = 0;
        if (boardTool !== 'laser') {
            stopLaser(true);
            return;
        }
        const now = performance.now();
        const life = 720;
        const last = laserPts[laserPts.length - 1];
        laserPts = laserPts.filter(function (pt, i, list) {
            return i === list.length - 1 || now - pt.t < life;
        });
        paintLaser();
        if (laserPts.length > 1 || (last && now - last.t < life)) {
            laserRaf = requestAnimationFrame(tickLaser);
        }
    }

    function feedLaser(world) {
        if (boardTool !== 'laser' || !world) return;
        const now = performance.now();
        const prev = laserPts[laserPts.length - 1];
        if (!prev || Math.hypot(world.x - prev.x, world.y - prev.y) > 1.1) {
            laserPts.push({ x: world.x, y: world.y, t: now });
        } else {
            prev.x = world.x;
            prev.y = world.y;
            prev.t = now;
        }
        if (laserPts.length > 180) laserPts = laserPts.slice(-140);
        if (!laserRaf) laserRaf = requestAnimationFrame(tickLaser);
        else paintLaser();
    }

    function overlayLine(pts, closed) {
        if (!pts || pts.length < 2) return '';
        const pairs = pts.map(function (p) { return Array.isArray(p) ? p : [p.x, p.y]; });
        return inkPath(pairs) + (closed ? ' Z' : '');
    }

    function pointInPoly(pt, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[j];
            const ay = a.y != null ? a.y : a[1];
            const ax = a.x != null ? a.x : a[0];
            const by = b.y != null ? b.y : b[1];
            const bx = b.x != null ? b.x : b[0];
            if (((ay > pt.y) !== (by > pt.y)) && (pt.x < (bx - ax) * (pt.y - ay) / ((by - ay) || 1) + ax)) inside = !inside;
            j = i;
        }
        return inside;
    }

    function convertInkToShape(rec) {
        if (!rec || rec.shape !== 'draw') return;
        const pts = rec.pts || [];
        if (pts.length < 4) return;
        const first = pts[0];
        const last = pts[pts.length - 1];
        const close = Math.hypot(first[0] - last[0], first[1] - last[1]) < Math.min(rec.w, rec.h) * 0.28;
        const aspect = rec.w / (rec.h || 1);
        let shape = 'square';
        if (!close && (aspect > 3.1 || aspect < 0.32)) {
            shape = 'line';
            rec.flipX = last[0] < first[0];
            rec.flipY = last[1] < first[1];
        } else if (Math.abs(aspect - 1) < 0.28) {
            shape = 'circle';
        }
        rec.type = shape;
        rec.shape = shape;
        rec.pts = [];
    }

    function parseFlowNode(chunk) {
        const text = String(chunk || '').trim().replace(/\|[^|]*\|/g, '').replace(/["']/g, '');
        const m = text.match(/^([A-Za-z0-9_]+)\s*(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\}|$)/);
        if (!m || !m[1]) {
            if (!text) return null;
            return { key: text.replace(/\s+/g, '_').slice(0, 24), title: text.slice(0, 80), shape: 'process' };
        }
        return {
            key: m[1],
            title: (m[2] || m[3] || m[4] || m[1]).slice(0, 80),
            shape: m[4] ? 'diamond' : (m[3] ? 'terminator' : 'process')
        };
    }

    function placeDiagram(specs, links, origin) {
        if (!specs.length) return;
        rememberBoard();
        const at = origin || boardPointerAt || { x: 180, y: 140 };
        const ids = {};
        specs.forEach(function (spec, i) {
            const node = normalizeBoardNode({
                id: uid('nd'),
                type: spec.shape === 'diamond' ? 'decision' : (spec.shape === 'terminator' ? 'terminator' : 'process'),
                shape: spec.shape || 'process',
                x: at.x + (i % 3) * 210,
                y: at.y + Math.floor(i / 3) * 120,
                w: spec.shape === 'diamond' ? 160 : 180,
                h: spec.shape === 'diamond' ? 88 : 70,
                title: spec.title || spec.key,
                body: ''
            });
            data.whiteboard.nodes.push(node);
            ids[spec.key] = node.id;
        });
        (links || []).forEach(function (link) {
            if (!ids[link.from] || !ids[link.to] || ids[link.from] === ids[link.to]) return;
            data.whiteboard.links.push(normalizeLink({
                from: ids[link.from],
                to: ids[link.to],
                fromPort: 's',
                toPort: 'n',
                label: link.label || ''
            }));
        });
        boardSelected = specs.length ? ids[specs[0].key] : '';
        boardPicked = boardSelected ? [boardSelected] : [];
        renderWhiteboard();
        schedulePersist();
    }

    function textToDiagram(raw) {
        const lines = String(raw || '').split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
        const nodes = [];
        const seen = {};
        const edges = [];
        function take(title) {
            const key = title.replace(/\s+/g, '_').slice(0, 28) || uid('n');
            if (!seen[key]) {
                seen[key] = true;
                nodes.push({ key: key, title: title.slice(0, 80), shape: 'process' });
            }
            return key;
        }
        lines.forEach(function (line) {
            const hit = line.match(/^(.*?)\s*(?:->|→)\s*(.*?)(?:\s*[:|]\s*(.*))?$/);
            if (hit) {
                const a = take(hit[1].trim());
                const b = take(hit[2].trim());
                edges.push({ from: a, to: b, label: (hit[3] || '').trim() });
            } else take(line);
        });
        placeDiagram(nodes, edges);
    }

    function mermaidToDiagram(raw) {
        const nodes = [];
        const seen = {};
        const edges = [];
        function take(spec) {
            if (!spec) return '';
            if (!seen[spec.key]) {
                seen[spec.key] = true;
                nodes.push(spec);
            }
            return spec.key;
        }
        String(raw || '').split(/\n/).forEach(function (line) {
            line = line.trim();
            if (!line || /^(graph|flowchart|%%)/i.test(line)) return;
            const parts = line.split(/\s*(?:-->|---|==>|-.->)\s*/);
            if (parts.length < 2) {
                take(parseFlowNode(line));
                return;
            }
            const a = parseFlowNode(parts[0]);
            const b = parseFlowNode(parts[1]);
            take(a);
            take(b);
            if (a && b) edges.push({ from: a.key, to: b.key });
        });
        placeDiagram(nodes, edges);
    }

    function wireframeToCode(raw) {
        const lines = String(raw || '').split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
        if (!lines.length) return;
        rememberBoard();
        const at = boardPointerAt || { x: 160, y: 120 };
        const frame = normalizeBoardNode({
            id: uid('nd'),
            type: 'frame',
            shape: 'frame',
            x: at.x,
            y: at.y,
            w: 360,
            h: Math.max(180, 56 + lines.length * 52),
            title: 'Wireframe',
            dash: 'dashed',
            fill: 'rgba(250,250,250,0.04)'
        });
        data.whiteboard.nodes.push(frame);
        lines.forEach(function (line, i) {
            data.whiteboard.nodes.push(normalizeBoardNode({
                id: uid('nd'),
                type: 'process',
                shape: 'process',
                x: at.x + 24,
                y: at.y + 36 + i * 50,
                w: 312,
                h: 40,
                title: line.slice(0, 80)
            }));
        });
        const html = '<main>\n' + lines.map(function (line) {
            return '  <section>' + line.replace(/</g, '&lt;') + '</section>';
        }).join('\n') + '\n</main>';
        try { navigator.clipboard.writeText(html); } catch (error) {}
        boardSelected = frame.id;
        boardPicked = [frame.id];
        renderWhiteboard();
        schedulePersist();
    }

    function startDrawToShape() {
        const rec = findBoardNode(boardSelected);
        if (rec && rec.shape === 'draw') {
            rememberBoard();
            convertInkToShape(rec);
            renderWhiteboard();
            schedulePersist();
            return;
        }
        boardDrawToShape = true;
        boardTool = 'draw';
        boardConnect = '';
        renderWhiteboard();
    }

    function showBoardAddMenu(clientX, clientY, kind) {
        const menu = $('boardAddMenu');
        const view = $('boardView');
        if (!menu || !view) return;
        hideBoardMore();
        boardDropAt = worldFromClient(clientX, clientY);
        boardMenuMode = kind === 'node' && boardSelected ? 'node' : (kind === 'link' && boardLinkSelected ? 'link' : 'canvas');
        const facts = filedFacts().slice(0, 8);
        const photos = imageItems().slice(0, 6);
        let html = '';
        if (boardMenuMode === 'node') {
            const rec = findBoardNode(boardSelected) || {};
            html += menuItem('data-board-ctx="cut"', 'cut', 'Cut', '<span class="board-kbd">Ctrl+X</span>');
            html += menuItem('data-board-ctx="copy"', 'copy', 'Copy', '<span class="board-kbd">Ctrl+C</span>');
            html += menuItem('data-board-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
            html += menuItem('data-board-add="connect"', 'connect', 'Connect shapes');
            html += menuItem('data-board-ctx="clear-links"', 'clear-links', 'Clear arrows');
            html += '<hr>';
            html += menuItem('data-board-ctx="copy-style"', 'style', 'Copy styles');
            html += menuItem('data-board-ctx="paste-style"', 'style', 'Paste styles');
            html += '<hr>';
            html += menuItem('data-board-layer="up"', 'up', 'Bring forward', '<span class="board-kbd">Ctrl+]</span>');
            html += menuItem('data-board-layer="down"', 'down', 'Send backward', '<span class="board-kbd">Ctrl+[</span>');
            html += menuItem('data-board-layer="forward"', 'front', 'Bring to front', '<span class="board-kbd">Ctrl+Shift+]</span>');
            html += menuItem('data-board-layer="back"', 'back', 'Send to back', '<span class="board-kbd">Ctrl+Shift+[</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="flip-h"', 'flip-h', 'Flip horizontal', '<span class="board-kbd">Shift+H</span>');
            html += menuItem('data-board-ctx="flip-v"', 'flip-v', 'Flip vertical', '<span class="board-kbd">Shift+V</span>');
            html += '<hr>';
            const boardChord = (/Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent || '')) ? '⌘⇧K' : 'Ctrl+Shift+K';
            html += menuItem('data-board-ctx="link"', 'link', rec.href ? 'Edit link' : 'Add link', '<span class="board-kbd">' + boardChord + '</span>');
            html += menuItem('data-board-ctx="lock"', rec.locked ? 'unlock' : 'lock', rec.locked ? 'Unlock' : 'Lock');
            html += '<hr>' + menuItem('data-board-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        } else if (boardMenuMode === 'link') {
            const link = findBoardLink(boardLinkSelected) || {};
            if (link.from || link.to) html += menuItem('data-board-ctx="detach"', 'detach', 'Detach');
            html += menuItem('data-board-ctx="duplicate"', 'duplicate', 'Duplicate', '<span class="board-kbd">Ctrl+D</span>');
            html += '<hr>';
            html += menuItem('data-board-ctx="copy-style"', 'style', 'Copy styles');
            html += menuItem('data-board-ctx="paste-style"', 'style', 'Paste styles');
            html += '<hr>' + menuItem('data-board-ctx="delete" class="danger"', 'delete', 'Delete', '<span class="board-kbd">Del</span>');
        } else {
            html += menuItem('data-board-add="square"', 'square', 'Rectangle');
            html += menuItem('data-board-add="diamond"', 'diamond', 'Diamond');
            html += menuItem('data-board-add="circle"', 'circle', 'Circle');
            html += menuItem('data-board-add="triangle"', 'triangle', 'Triangle');
            html += menuItem('data-board-add="line"', 'line', 'Line');
            html += menuItem('data-board-add="arrow"', 'arrow', 'Arrow');
            html += menuItem('data-board-tool="draw"', 'draw', 'Draw');
            html += menuItem('data-board-tool="eraser"', 'eraser', 'Eraser');
            html += menuItem('data-board-add="text"', 'text', 'Text');
            html += menuItem('data-board-add="note"', 'note', 'Sticky note');
            html += menuItem('data-board-add="image"', 'image', 'Image');
            html += '<hr>';
            html += menuItem('data-board-ctx="paste"', 'paste', 'Paste', '<span class="board-kbd">Ctrl+V</span>');
            html += menuItem('data-board-grid', 'grid', data.whiteboard.grid === false ? 'Show grid' : 'Hide grid');
            html += menuItem('data-board-ctx="recenter"', 'recenter', 'Recenter');
        }
        menu.innerHTML = html;
        menu.hidden = false;
        menu.dataset.skip = '1';
        const rect = view.getBoundingClientRect();
        const maxH = Math.max(160, rect.height - 16);
        menu.style.maxHeight = maxH + 'px';
        const left = Math.min(Math.max(8, clientX - rect.left), Math.max(8, rect.width - 248));
        const menuH = Math.min(menu.scrollHeight || 240, maxH);
        const top = Math.min(Math.max(8, clientY - rect.top), Math.max(8, rect.height - menuH - 8));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function placeFromMenu(kind) {
        const at = boardDropAt || { x: 180, y: 140 };
        const onto = boardMenuMode === 'node' && boardSelected;
        hideBoardAddMenu();
        if (kind === 'connect') {
            boardTool = 'connect';
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return;
        }
        if (onto) {
            applyBoardKind(kind);
            return;
        }
        const node = addBoardNode(kind, at);
        if (node && (kind === 'text' || kind === 'finding' || kind === 'question' || kind === 'note')) {
            beginBoardTextEdit(node.id);
        }
        if (node && (kind === 'image' || kind === 'embed')) focusImageSlot(node.id);
    }

    function bindBoardPointers() {
        const view = $('boardView');
        const stage = $('boardStage');
        if (!view || !stage || view.dataset.bound) return;
        view.dataset.bound = '1';
        let drag = null;
        function stopMiddleAutoscroll(event) {
            if (event.button === 1) event.preventDefault();
        }
        view.addEventListener('mousedown', stopMiddleAutoscroll, true);
        view.addEventListener('auxclick', stopMiddleAutoscroll);
        view.addEventListener('pointerdown', function (event) {
            if (event.button === 1) {
                event.preventDefault();
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.classList.add('is-grabbing');
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan') || boardTool === 'pan') {
                event.preventDefault();
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.classList.add('is-grabbing');
                view.setPointerCapture(event.pointerId);
                return;
            }
            boardPointerAt = worldFromClient(event.clientX, event.clientY);
            if (event.target.closest('.wb-node.is-editing')) return;
            if (document.querySelector('#boardStage [data-wb-text].is-edit')) commitBoardTextEdit();
            if (event.target.closest('.board-toolbar, .board-props, .board-more, .board-add-menu')) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount) sel.removeAllRanges();
                return;
            }
            if (event.target.closest('[data-board-done], .wb-image-slot, [data-wb-upload], [data-wb-image-url], [data-wb-embed-url]')) return;
            event.preventDefault();
            if (boardTool === 'eraser') {
                hideBoardAddMenu();
                hideBoardMore();
                rememberBoard();
                histQuiet = true;
                drag = { mode: 'erase' };
                const hit = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
                if (hit) deleteBoardNode(hit.dataset.node);
                else {
                    const linkEl = event.target.closest('[data-link]');
                    if (linkEl) deleteBoardLink(linkEl.getAttribute('data-link'));
                }
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'draw') {
                hideBoardAddMenu();
                hideBoardMore();
                const origin = worldFromClient(event.clientX, event.clientY);
                rememberBoard();
                const ink = normalizeBoardNode({
                    id: uid('nd'),
                    type: 'draw',
                    shape: 'draw',
                    x: origin.x - 8,
                    y: origin.y - 8,
                    w: 16,
                    h: 16,
                    pts: [[8, 8]],
                    title: '',
                    fill: 'transparent'
                });
                data.whiteboard.nodes.push(ink);
                boardSelected = ink.id;
                boardPicked = [ink.id];
                renderWhiteboard();
                drag = { mode: 'ink', id: ink.id, moved: false };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'laser') {
                hideBoardAddMenu();
                hideBoardMore();
                feedLaser(worldFromClient(event.clientX, event.clientY));
                drag = { mode: 'laser' };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'lasso') {
                hideBoardAddMenu();
                hideBoardMore();
                drag = { mode: 'lasso', pts: [worldFromClient(event.clientX, event.clientY)] };
                setBoardOverlay(overlayLine(drag.pts, true), 'wb-lasso');
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'bucket') {
                hideBoardAddMenu();
                hideBoardMore();
                const hit = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
                const rec = hit && findBoardNode(hit.dataset.node);
                if (rec && !rec.locked) {
                    rememberBoard();
                    rec.fill = boardPaintFill || 'rgba(103,232,249,0.12)';
                    if (!rec.fill || rec.fill === 'transparent') rec.fill = 'rgba(103,232,249,0.12)';
                    renderWhiteboard();
                    schedulePersist();
                }
                return;
            }
            const node = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
            const selectMode = boardTool === 'select' || !boardTool;
            function startMarquee(seed, add) {
                hideBoardAddMenu();
                hideBoardMore();
                if (!add && !seed) {
                    boardSelected = '';
                    boardLinkSelected = '';
                    boardPicked = [];
                    boardPickedLinks = [];
                    stage.querySelectorAll('.wb-node').forEach(function (el) {
                        el.classList.remove('is-on');
                        const box = el.querySelector('.wb-handles');
                        if (box) box.remove();
                    });
                    drawBoardLinks($('boardLinks'), data.whiteboard);
                    syncBoardInspect();
                    syncBoardGroupBox();
                }
                drag = {
                    mode: 'marquee',
                    origin: worldFromClient(event.clientX, event.clientY),
                    x: event.clientX,
                    y: event.clientY,
                    moved: false,
                    add: !!add,
                    seed: seed || '',
                    base: add ? boardPicked.slice() : [],
                    baseLinks: add ? boardPickedLinks.slice() : []
                };
                view.setPointerCapture(event.pointerId);
            }
            if (node) {
                const id = node.dataset.node;
                const port = event.target.closest('[data-port]');
                const handle = event.target.closest('[data-handle]');
                if (port) {
                    if (boardTool !== 'connect') return;
                    const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === id; });
                    if (!rec) return;
                    const portName = port.getAttribute('data-port');
                    if (boardConnect && boardConnectPort && boardConnect !== id) {
                        addBoardLink(boardConnect, boardConnectPort, id, portName);
                        boardConnect = '';
                        boardConnectPort = '';
                        return;
                    }
                    boardSelected = id;
                    boardConnect = id;
                    boardConnectPort = portName;
                    drag = {
                        mode: 'link',
                        id: id,
                        port: portName,
                        start: portPoint(rec, portName)
                    };
                    view.classList.add('is-linking');
                    markBoardPorts(id, portName, '', '');
                    view.setPointerCapture(event.pointerId);
                    syncBoardInspect();
                    return;
                }
                if (boardTool === 'connect') return;
                const rec = findBoardNode(id);
                if (!rec) return;
                const add = boardAddKey(event);
                const already = boardPicked.indexOf(id) >= 0;
                if (selectMode && !handle && !(already && !add && !rec.locked)) {
                    startMarquee(id, add);
                    return;
                }
                if (rec.locked) {
                    pickBoardNode(id, add);
                    return;
                }
                if (add) {
                    const ids = pickBoardNode(id, true);
                    if (ids.indexOf(id) < 0) return;
                } else if (boardPicked.indexOf(id) < 0) {
                    pickBoardNode(id, false);
                } else {
                    boardSelected = id;
                }
                const size = shapeSize(rec);
                if (handle) {
                    rememberBoard();
                    const hname = handle.getAttribute('data-handle');
                    if (isStrokeRec(rec) || hname === 'start' || hname === 'end') {
                        drag = {
                            mode: 'stroke-end',
                            id: id,
                            which: hname === 'start' ? 'start' : 'end',
                            x: event.clientX,
                            y: event.clientY
                        };
                        view.classList.add('is-snap');
                    } else {
                        drag = {
                            mode: 'resize',
                            id: id,
                            handle: hname,
                            x: event.clientX,
                            y: event.clientY,
                            ox: rec.x,
                            oy: rec.y,
                            ow: size.w,
                            oh: size.h
                        };
                    }
                } else {
                    rememberBoard();
                    const ids = boardPicked.indexOf(id) >= 0 && boardPicked.length > 1 ? boardPicked : [id];
                    drag = {
                        mode: 'node',
                        id: id,
                        x: event.clientX,
                        y: event.clientY,
                        pack: ids.map(function (nid) {
                            const n = findBoardNode(nid) || {};
                            return {
                                id: nid,
                                ox: n.x || 0,
                                oy: n.y || 0,
                                x1: n.x1,
                                y1: n.y1,
                                x2: n.x2,
                                y2: n.y2,
                                stroke: isStrokeShape(n.shape)
                            };
                        }),
                        moved: false
                    };
                }
                view.setPointerCapture(event.pointerId);
                boardLinkSelected = '';
                stage.querySelectorAll('.wb-node').forEach(function (el) {
                    const on = (boardPicked.indexOf(id) >= 0 ? boardPicked : [id]).indexOf(el.dataset.node) >= 0;
                    el.classList.toggle('is-on', on);
                    const box = el.querySelector('.wb-handles');
                    if (on && el.dataset.node === id && boardPicked.length < 2 && !box) {
                        el.insertAdjacentHTML('beforeend', handleMarkup((rec && rec.shape) || el.dataset.shape, rec));
                        if (isStrokeRec(rec)) positionStrokeHandles(el, rec);
                    }
                    if ((!on || el.dataset.node !== id || boardPicked.length > 1) && box) box.remove();
                });
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
                syncBoardGroupBox();
                return;
            }
            const linkHandle = event.target.closest('[data-link-handle]');
            const linkEl = event.target.closest('[data-link]');
            const linkId = (linkHandle && linkHandle.getAttribute('data-link')) || (linkEl && linkEl.getAttribute('data-link'));
            if (linkId && boardTool !== 'connect') {
                hideBoardAddMenu();
                hideBoardMore();
                event.preventDefault();
                const link = findBoardLink(linkId);
                if (!link) return;
                selectBoardLink(linkId);
                const which = linkHandle && linkHandle.getAttribute('data-link-handle');
                if (which === 'start' || which === 'end') {
                    rememberBoard();
                    drag = { mode: 'link-end', id: linkId, which: which };
                    view.classList.add('is-snap');
                } else {
                    const ends = linkEnds(link);
                    drag = {
                        mode: 'link-move',
                        id: linkId,
                        x: event.clientX,
                        y: event.clientY,
                        x1: ends.p1.x,
                        y1: ends.p1.y,
                        x2: ends.p2.x,
                        y2: ends.p2.y,
                        moved: false
                    };
                }
            view.setPointerCapture(event.pointerId);
                return;
            }
            hideBoardAddMenu();
            hideBoardMore();
            if (selectMode) {
                startMarquee('', boardAddKey(event));
                return;
            }
            if (BOARD_PLACE.indexOf(boardTool) >= 0) {
                const origin = worldFromClient(event.clientX, event.clientY);
                const node = addBoardNode(boardTool, { x: origin.x, y: origin.y, w: 8, h: 8 });
                if (!node) return;
                if (isStrokeShape(node.shape)) {
                    setStrokePoint(node, 'start', origin, true);
                    setStrokePoint(node, 'end', origin, false);
                    const elDraw = stage.querySelector('[data-node="' + node.id + '"]');
                    applyNodeBox(elDraw, node);
                    view.classList.add('is-snap');
                }
                drag = {
                    mode: 'draw',
                    id: node.id,
                    origin: origin,
                    x: event.clientX,
                    y: event.clientY,
                    moved: false
                };
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (boardTool === 'connect') {
                boardConnect = '';
                boardConnectPort = '';
                markBoardPorts('', '', '', '');
                setLinkDraft('', false);
                return;
            }
            if (boardTool !== 'connect') {
                boardSelected = '';
                boardLinkSelected = '';
                stage.querySelectorAll('.wb-node').forEach(function (el) {
                    el.classList.remove('is-on');
                    const box = el.querySelector('.wb-handles');
                    if (box) box.remove();
                });
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
            }
            if (boardTool === 'pan') {
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: data.whiteboard.x, oy: data.whiteboard.y, moved: false };
                view.setPointerCapture(event.pointerId);
            }
        });
        view.addEventListener('pointermove', function (event) {
            if (!drag) setBoardDrift(event.clientX, event.clientY);
            boardPointerAt = worldFromClient(event.clientX, event.clientY);
            if (boardTool === 'laser') feedLaser(boardPointerAt);
            if (!drag) return;
            const z = data.whiteboard.z || 1;
            if (drag.mode === 'pan') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) drag.moved = true;
                if (!drag.moved) return;
                data.whiteboard.x = drag.ox + (event.clientX - drag.x);
                data.whiteboard.y = drag.oy + (event.clientY - drag.y);
                applyBoardTransform();
                return;
            }
            if (drag.mode === 'marquee') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
                if (!drag.moved) return;
                const at = worldFromClient(event.clientX, event.clientY);
                drag.at = at;
                setMarqueeOverlay(drag.origin, at);
                const hits = hitsInRect(drag.origin, at);
                const nodeIds = drag.add ? drag.base.concat(hits.nodes.filter(function (id) { return drag.base.indexOf(id) < 0; })) : hits.nodes;
                const linkIds = drag.add ? (drag.baseLinks || []).concat(hits.links.filter(function (id) { return (drag.baseLinks || []).indexOf(id) < 0; })) : hits.links;
                drag.hits = { nodes: nodeIds, links: linkIds };
                previewBoardHits(nodeIds, linkIds);
                return;
            }
            if (drag.mode === 'draw') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
                const recDraw = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!recDraw) return;
                applyDrawBox(drag.origin, recDraw, worldFromClient(event.clientX, event.clientY), drawLocksAspect(recDraw.shape, event.shiftKey));
                applyNodeBox(stage.querySelector('[data-node="' + recDraw.id + '"]'), recDraw);
                syncBoardInspect();
                return;
            }
            if (drag.mode === 'ink') {
                const recInk = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!recInk) return;
                drag.moved = true;
                growInk(recInk, worldFromClient(event.clientX, event.clientY));
                const elInk = stage.querySelector('[data-node="' + recInk.id + '"]');
                applyNodeBox(elInk, recInk);
                const path = elInk && elInk.querySelector('.wb-ink .wb-shape');
                if (path) path.setAttribute('d', inkPath(recInk.pts));
                const svgInk = elInk && elInk.querySelector('.wb-ink');
                if (svgInk) svgInk.setAttribute('viewBox', '0 0 ' + recInk.w + ' ' + recInk.h);
                return;
            }
            if (drag.mode === 'laser') {
                feedLaser(boardPointerAt);
                return;
            }
            if (drag.mode === 'lasso') {
                drag.pts.push(worldFromClient(event.clientX, event.clientY));
                setBoardOverlay(overlayLine(drag.pts, true), 'wb-lasso');
                const hits = hitsInLasso(drag.pts);
                drag.hits = hits;
                previewBoardHits(hits.nodes, hits.links);
                return;
            }
            if (drag.mode === 'erase') {
                const hit = document.elementFromPoint(event.clientX, event.clientY);
                const over = hit && hit.closest && hit.closest('.wb-node');
                if (over) deleteBoardNode(over.dataset.node);
                else {
                    const linkEl = hit && hit.closest && hit.closest('[data-link]');
                    if (linkEl) deleteBoardLink(linkEl.getAttribute('data-link'));
                }
                return;
            }
            if (drag.mode === 'link') {
                const at = worldFromClient(event.clientX, event.clientY);
                const hit = document.elementFromPoint(event.clientX, event.clientY);
                const overNode = hit && hit.closest && hit.closest('.wb-node');
                const overPort = hit && hit.closest && hit.closest('[data-port]');
                let end = at;
                const dx = at.x - drag.start.x;
                const dy = at.y - drag.start.y;
                let toId = '';
                let toPort = Math.abs(dx) > Math.abs(dy) ? (dx >= 0 ? 'w' : 'e') : (dy >= 0 ? 'n' : 's');
                if (overNode && overNode.dataset.node !== drag.id) {
                    const recTo = (data.whiteboard.nodes || []).find(function (n) { return n.id === overNode.dataset.node; });
                    if (recTo) {
                        toId = recTo.id;
                        toPort = overPort ? overPort.getAttribute('data-port') : nearestPort(recTo, at);
                        end = portPoint(recTo, toPort);
                    }
                }
                markBoardPorts(drag.id, drag.port, toId, toPort);
                drag.hoverId = toId;
                drag.hoverPort = toPort;
                setLinkDraft(linkPath(drag.start, drag.port, end, toPort), true);
                return;
            }
            if (drag.mode === 'link-end') {
                const link = findBoardLink(drag.id);
                if (!link) return;
                let at = worldFromClient(event.clientX, event.clientY);
                const ends = linkEnds(link);
                const other = drag.which === 'start' ? ends.p2 : ends.p1;
                at = snapAxis(other, at, event.shiftKey);
                setLinkPoint(link, drag.which, at, true);
                drawBoardLinks($('boardLinks'), data.whiteboard);
                return;
            }
            if (drag.mode === 'link-move') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) <= 6) return;
                const link = findBoardLink(drag.id);
                if (!link) return;
                if (!drag.moved) {
                    drag.moved = true;
                    rememberBoard();
                    link.from = '';
                    link.fromPort = '';
                    link.to = '';
                    link.toPort = '';
                }
                const dx = (event.clientX - drag.x) / z;
                const dy = (event.clientY - drag.y) / z;
                link.x1 = drag.x1 + dx;
                link.y1 = drag.y1 + dy;
                link.x2 = drag.x2 + dx;
                link.y2 = drag.y2 + dy;
                drawBoardLinks($('boardLinks'), data.whiteboard);
                return;
            }
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
            if (!rec) return;
            const el = stage.querySelector('[data-node="' + drag.id + '"]');
            if (drag.mode === 'resize') {
                if (isStrokeRec(rec)) return;
                const lock = isImageNode(rec) || event.shiftKey || (drag.handle && drag.handle.length === 2 && (rec.shape === 'circle' || rec.shape === 'ellipse'));
                resizeFromHandle(drag, rec, (event.clientX - drag.x) / z, (event.clientY - drag.y) / z, lock);
                applyNodeBox(el, rec);
                followAllStrokes(drag.id);
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardInspect();
                return;
            }
            if (drag.mode === 'stroke-end') {
                let at = worldFromClient(event.clientX, event.clientY);
                const other = drag.which === 'start' ? { x: rec.x2, y: rec.y2 } : { x: rec.x1, y: rec.y1 };
                at = snapAxis(other, at, event.shiftKey);
                setStrokePoint(rec, drag.which, at, true);
                applyNodeBox(el, rec);
                return;
            }
            if (drag.mode === 'node') {
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) <= 6) return;
                drag.moved = true;
                const dx = (event.clientX - drag.x) / z;
                const dy = (event.clientY - drag.y) / z;
                (drag.pack || [{ id: drag.id, ox: drag.ox, oy: drag.oy }]).forEach(function (item) {
                    const n = findBoardNode(item.id);
                    const nel = stage.querySelector('[data-node="' + item.id + '"]');
                    if (!n) return;
                    if (item.stroke) {
                        n.x1 = item.x1 + dx;
                        n.y1 = item.y1 + dy;
                        n.x2 = item.x2 + dx;
                        n.y2 = item.y2 + dy;
                        n.startId = '';
                        n.startPort = '';
                        n.endId = '';
                        n.endPort = '';
                        layoutStroke(n);
                    } else {
                        n.x = item.ox + dx;
                        n.y = item.oy + dy;
                    }
                    applyNodeBox(nel, n);
                });
                followAllStrokes();
                drawBoardLinks($('boardLinks'), data.whiteboard);
                syncBoardGroupBox();
                return;
            }
            rec.x = drag.ox + (event.clientX - drag.x) / z;
            rec.y = drag.oy + (event.clientY - drag.y) / z;
            applyNodeBox(el, rec);
            drawBoardLinks($('boardLinks'), data.whiteboard);
        });
        view.addEventListener('pointerup', function (event) {
            view.classList.remove('is-grabbing');
            if (drag && drag.mode === 'marquee') {
                setBoardOverlay('', '');
                if (!drag.moved) {
                    if (drag.seed) pickBoardNode(drag.seed, drag.add);
                    else if (!drag.add) selectBoardNodes([]);
                } else {
                    const at = drag.at || worldFromClient(event.clientX, event.clientY);
                    const hits = drag.hits || hitsInRect(drag.origin, at);
                    const nodeIds = drag.add ? drag.base.concat((hits.nodes || []).filter(function (id) { return drag.base.indexOf(id) < 0; })) : (hits.nodes || []);
                    const linkIds = drag.add ? (drag.baseLinks || []).concat((hits.links || []).filter(function (id) { return (drag.baseLinks || []).indexOf(id) < 0; })) : (hits.links || []);
                    selectBoardNodes(nodeIds, linkIds);
                }
                drag = null;
                return;
            }
            if (drag && drag.mode === 'erase') {
                histQuiet = false;
                drag = null;
                return;
            }
            if (drag && drag.mode === 'ink') {
                const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                if (!rec || !drag.moved || (rec.pts || []).length < 3) {
                    histQuiet = true;
                    if (rec) deleteBoardNode(rec.id);
                    histQuiet = false;
                    if (boardUndo.length) boardUndo.pop();
                    syncBoardHistory();
                    drag = null;
                    return;
                }
                if (boardDrawToShape) convertInkToShape(rec);
                renderWhiteboard();
                schedulePersist();
                drag = null;
                finishBoardTool();
                return;
            }
            if (drag && drag.mode === 'laser') {
                drag = null;
                return;
            }
            if (drag && drag.mode === 'lasso') {
                const hits = drag.hits || hitsInLasso(drag.pts);
                setBoardOverlay('', '');
                selectBoardNodes(hits.nodes || [], hits.links || []);
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link') {
                if (drag.hoverId && drag.hoverId !== drag.id) {
                    addBoardLink(drag.id, drag.port, drag.hoverId, drag.hoverPort || 'w');
                    boardConnect = '';
                    boardConnectPort = '';
                }
                view.classList.remove('is-linking');
                markBoardPorts(boardConnect, boardConnectPort, '', '');
                setLinkDraft('', false);
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link-end') {
                clearStrokeSnap();
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'link-move') {
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'stroke-end') {
                clearStrokeSnap();
                renderWhiteboard();
                schedulePersist();
                drag = null;
                return;
            }
            if (drag && drag.mode === 'draw') {
                const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === drag.id; });
                const kind = rec && rec.type;
                if (!rec) {
                    clearStrokeSnap();
                    drag = null;
                    return;
                }
                if (!drag.moved && (kind === 'note' || kind === 'text')) {
                    rec.w = kind === 'note' ? 176 : 220;
                    rec.h = kind === 'note' ? 176 : 48;
                    rec.x = drag.origin.x;
                    rec.y = drag.origin.y;
                    renderWhiteboard();
                    schedulePersist();
                    drag = null;
                    clearStrokeSnap();
                    beginBoardTextEdit(rec.id);
                    finishBoardTool();
                    return;
                }
                if (!drag.moved) {
                    clearStrokeSnap();
                    histQuiet = true;
                    deleteBoardNode(rec.id);
                    histQuiet = false;
                    if (boardUndo.length) boardUndo.pop();
                    syncBoardHistory();
                    drag = null;
                    return;
                }
                if (!isStrokeRec(rec)) {
                    const left = rec.x < drag.origin.x;
                    const up = rec.y < drag.origin.y;
                    rec.w = Math.max(kind === 'note' ? 140 : 48, rec.w);
                    rec.h = Math.max(kind === 'note' ? 140 : 48, rec.h);
                    if (drawLocksAspect(rec.shape, event.shiftKey)) {
                        const side = Math.max(rec.w, rec.h);
                        rec.w = side;
                        rec.h = side;
                    }
                    rec.x = left ? drag.origin.x - rec.w : drag.origin.x;
                    rec.y = up ? drag.origin.y - rec.h : drag.origin.y;
                }
                renderWhiteboard();
                schedulePersist();
                drag = null;
                clearStrokeSnap();
                if (kind === 'text' || kind === 'finding' || kind === 'question' || kind === 'note') beginBoardTextEdit(rec.id);
                if (kind === 'image' || kind === 'embed') {
                    renderWhiteboard();
                    focusImageSlot(rec.id);
                    return;
                }
                finishBoardTool();
                return;
            }
            if (drag) schedulePersist();
            drag = null;
        });
        view.addEventListener('pointercancel', function () {
            view.classList.remove('is-grabbing');
            view.classList.remove('is-linking');
            markBoardPorts('', '', '', '');
            setLinkDraft('', false);
            if (boardTool !== 'laser') setBoardOverlay('', '');
            clearStrokeSnap();
            histQuiet = false;
            drag = null;
        });
        view.addEventListener('contextmenu', function (event) {
            if (event.target.closest('.board-toolbar, .board-props, .board-more, .board-add-menu')) return;
            event.preventDefault();
            const linkHandle = event.target.closest('[data-link-handle]');
            const linkEl = event.target.closest('[data-link]');
            const linkId = (linkHandle && linkHandle.getAttribute('data-link')) || (linkEl && linkEl.getAttribute('data-link'));
            if (linkId && findBoardLink(linkId)) {
                selectBoardLink(linkId);
                showBoardAddMenu(event.clientX, event.clientY, 'link');
                return;
            }
            const node = nodeElAtClient(event.clientX, event.clientY) || event.target.closest('.wb-node');
            if (node) {
                selectBoardNode(node.dataset.node);
                showBoardAddMenu(event.clientX, event.clientY, 'node');
                return;
            }
            showBoardAddMenu(event.clientX, event.clientY, 'canvas');
        });
        view.addEventListener('wheel', function (event) {
            if (event.target.closest('.board-add-menu, .board-more, .board-props')) return;
            event.preventDefault();
            const rect = view.getBoundingClientRect();
            const prev = data.whiteboard.z || 1;
            const next = Math.min(2.8, Math.max(0.25, prev * (event.deltaY > 0 ? 0.92 : 1.08)));
            const px = event.clientX - rect.left - boardDrift.x;
            const py = event.clientY - rect.top - boardDrift.y;
            const wx = (px - data.whiteboard.x) / prev;
            const wy = (py - data.whiteboard.y) / prev;
            data.whiteboard.z = next;
            data.whiteboard.x = px - wx * next;
            data.whiteboard.y = py - wy * next;
            applyBoardTransform();
            schedulePersist();
        }, { passive: false });
        view.addEventListener('dblclick', function (event) {
            if (event.target.closest('.board-toolbar, .board-props')) return;
            if (event.target.closest('[data-board-done]')) return;
            const node = event.target.closest('.wb-node') || nodeElAtClient(event.clientX, event.clientY);
            if (!node) return;
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === node.dataset.node; });
            if (!rec) return;
            event.preventDefault();
            if (rec.type === 'image') {
                if (!rec.src) focusImageSlot(rec.id);
                else openBoardImagePicker(rec.id);
                return;
            }
            beginBoardTextEdit(rec.id);
        });
    }

    let noteLinkFrom = '';
    let noteShiftIds = [];
    let noteDrag = null;
    let notePan = null;
    let noteBodies = {};
    let noteDotEls = {};
    let noteLineEls = {};
    let noteSimOn = false;
    let noteSimCalm = 0;
    let noteSimSize = null;
    let noteGraphSig = '';

    function setNoteTip(picking) {
        const tip = $('noteLinkHint');
        if (!tip) return;
        tip.classList.toggle('is-armed', !!picking);
        let touch = false;
        try {
            touch = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
        } catch (error) {}
        if (picking) {
            tip.textContent = touch ? 'Tap another note to link' : 'Click another note to link';
            return;
        }
        tip.innerHTML = touch
            ? 'Tap Link, then another note.'
            : 'Hold <kbd>Shift</kbd> and click notes to link. Middle-click to pan.';
    }

    function linkNoteIntoShift(id) {
        if (!id || !noteById(id)) return;
        if (noteLinkFrom) {
            noteLinkFrom = '';
            setNoteTip(false);
        }
        if (noteShiftIds.indexOf(id) === -1) {
            noteShiftIds.forEach(function (other) { addNoteLink(other, id); });
            noteShiftIds.push(id);
        }
        notepadState().active = id;
        renderNotepad();
        const tip = $('noteLinkHint');
        if (tip) tip.classList.add('is-armed');
    }

    function normalizeNote(note) {
        const rec = note && typeof note === 'object' ? note : {};
        const created = rec.created || rec.updated || '';
        return {
            id: rec.id || uid('note'),
            title: String(rec.title || '').slice(0, 80),
            body: String(rec.body || ''),
            html: String(rec.html || '').slice(0, 200000),
            created: created,
            updated: rec.updated || created
        };
    }

    function normalizeNoteLink(link) {
        const rec = link && typeof link === 'object' ? link : {};
        const from = String(rec.from || '');
        const to = String(rec.to || '');
        if (!from || !to || from === to) return { id: '', from: '', to: '' };
        return { id: rec.id || uid('nlink'), from: from, to: to };
    }

    function normalizeNoteLayout(layout) {
        const next = {};
        if (!layout || typeof layout !== 'object') return next;
        Object.keys(layout).forEach(function (id) {
            const spot = layout[id];
            const x = Number(spot && spot.x);
            const y = Number(spot && spot.y);
            if (!isFinite(x) || !isFinite(y)) return;
            next[id] = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
        });
        return next;
    }

    function noteNow() {
        return new Date().toISOString();
    }

    function noteWhen(note) {
        const raw = (note && (note.updated || note.created)) || '';
        const date = new Date(raw);
        if (!raw || isNaN(date.getTime())) return '';
        return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }

    function blankNote() {
        const now = noteNow();
        return { id: uid('note'), title: '', body: '', created: now, updated: now };
    }

    function notepadState() {
        if (!data.notepad || typeof data.notepad !== 'object') data.notepad = { notes: [], active: '', links: [], layout: {}, pan: { x: 0, y: 0 } };
        if (!Array.isArray(data.notepad.notes)) data.notepad.notes = [];
        if (!Array.isArray(data.notepad.links)) data.notepad.links = [];
        if (!data.notepad.layout || typeof data.notepad.layout !== 'object') data.notepad.layout = {};
        if (!data.notepad.pan || typeof data.notepad.pan !== 'object') data.notepad.pan = { x: 0, y: 0 };
        data.notepad.pan.x = Number(data.notepad.pan.x) || 0;
        data.notepad.pan.y = Number(data.notepad.pan.y) || 0;
        return data.notepad;
    }

    function noteById(id) {
        return notepadState().notes.filter(function (note) { return note.id === id; })[0] || null;
    }

    function noteTitleText(note) {
        return (note && note.title && note.title.trim()) || 'Untitled';
    }

    function notePreview(note) {
        const text = String(note.body || '').replace(/\s+/g, ' ').trim();
        const when = noteWhen(note);
        const bit = text ? text.slice(0, 42) : 'Empty note';
        return when ? when + ' · ' + bit : bit;
    }

    function noteHasLink(from, to) {
        return notepadState().links.some(function (link) {
            return (link.from === from && link.to === to) || (link.from === to && link.to === from);
        });
    }

    function closeNoteMenu() {
        const menu = $('noteMenu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
    }

    function cancelNoteLink() {
        noteLinkFrom = '';
        const cancel = $('noteLinkCancel');
        const go = $('noteLinkGo');
        if (cancel) cancel.hidden = true;
        if (go) go.classList.remove('is-on');
        setNoteTip(false);
        paintNoteGraph();
    }

    function startNoteLink(id) {
        const note = noteById(id);
        if (!note) return;
        noteLinkFrom = id;
        noteShiftIds = [];
        notepadState().active = id;
        const cancel = $('noteLinkCancel');
        const go = $('noteLinkGo');
        if (cancel) cancel.hidden = false;
        if (go) go.classList.add('is-on');
        setNoteTip(true);
        renderNotepad();
    }

    function addNoteLink(from, to) {
        if (!from || !to || from === to || noteHasLink(from, to)) return;
        if (!noteById(from) || !noteById(to)) return;
        notepadState().links.push({ id: uid('nlink'), from: from, to: to });
        schedulePersist();
    }

    function deleteNote(id) {
        const state = notepadState();
        state.notes = state.notes.filter(function (note) { return note.id !== id; });
        state.links = state.links.filter(function (link) { return link.from !== id && link.to !== id; });
        if (state.layout) delete state.layout[id];
        if (state.active === id) state.active = state.notes.length ? state.notes[0].id : '';
        if (noteLinkFrom === id) noteLinkFrom = '';
        noteShiftIds = noteShiftIds.filter(function (item) { return item !== id; });
        closeNoteMenu();
        renderNotepad();
        schedulePersist();
    }

    function noteActRow(act, label, attrs, danger) {
        return '<button type="button" role="menuitem" data-note-act="' + act + '"' + (attrs || '') + (danger ? ' class="is-danger"' : '') + '><span>' + esc(label) + '</span></button>';
    }

    function noteMenuHtml(noteId) {
        const links = notepadState().links.filter(function (link) { return link.from === noteId || link.to === noteId; });
        let html = '<p>Note</p>' +
            noteActRow('rename', 'Rename') +
            noteActRow('edit', 'Edit') +
            noteActRow('link', 'Link');
        links.forEach(function (link) {
            const otherId = link.from === noteId ? link.to : link.from;
            html += noteActRow('unlink', 'Unlink ' + noteTitleText(noteById(otherId)), ' data-link="' + esc(link.id) + '"');
        });
        html += '<hr>' + noteActRow('delete', 'Delete', '', true);
        return html;
    }

    function fillNoteMenu(html, noteId, fieldId) {
        const menu = $('noteMenu');
        if (!menu) return null;
        hideFieldMenu();
        menu.innerHTML = html;
        menu.dataset.note = noteId || '';
        menu.dataset.field = fieldId || '';
        return menu;
    }

    function openNoteMenu(noteId, anchor) {
        const note = noteById(noteId);
        const menu = note && anchor ? fillNoteMenu(noteMenuHtml(noteId), noteId, '') : null;
        if (!menu) return;
        menu.hidden = false;
        const rect = anchor.getBoundingClientRect();
        const width = menu.offsetWidth || 196;
        placeAppMenu(menu, rect.right - width, rect.bottom + 4);
    }

    function openNoteMenuAt(noteId, x, y) {
        if (!noteById(noteId)) return;
        const menu = fillNoteMenu(noteMenuHtml(noteId), noteId, '');
        if (menu) placeAppMenu(menu, x, y);
    }

    function openNoteEditMenu(field, x, y) {
        if (!field) return;
        armFieldEdit(field);
        const note = noteById(notepadState().active);
        let html = fieldEditRows(field);
        if (note) html += '<hr>' + noteActRow('delete', 'Delete note', '', true);
        const menu = fillNoteMenu(html, note ? note.id : '', field.id || '');
        if (menu) placeAppMenu(menu, x, y);
    }

    function openNoteCreateMenu(x, y) {
        const menu = fillNoteMenu('<p>Notepad</p>' + noteActRow('new', 'New note'), '', '');
        if (menu) placeAppMenu(menu, x, y);
    }

    function renderNotepad() {
        const list = $('noteList');
        const title = $('noteTitle');
        const body = $('noteBody');
        const empty = $('noteEmpty');
        if (!list || !title || !body) return;
        if (!noteLinkFrom) setNoteTip(false);
        const state = notepadState();
        if (!state.active || !state.notes.some(function (note) { return note.id === state.active; })) {
            state.active = state.notes.length ? state.notes[0].id : '';
        }
        list.innerHTML = state.notes.map(function (note) {
            const on = note.id === state.active;
            const shift = noteShiftIds.indexOf(note.id) >= 0;
            return '<div class="note-item' + (on ? ' is-on' : '') + (shift ? ' is-shift' : '') + '" role="option" tabindex="0" data-note="' + esc(note.id) + '"' +
                (on ? ' aria-selected="true"' : ' aria-selected="false"') + '>' +
                '<strong>' + esc(noteTitleText(note)) + '</strong>' +
                '<button type="button" class="note-more" data-note-more aria-label="Options for ' + esc(noteTitleText(note)) + '">⋯</button>' +
                '<small>' + esc(notePreview(note)) + '</small></div>';
        }).join('');
        const current = noteById(state.active);
        const has = !!current;
        if (empty) empty.hidden = state.notes.length > 0;
        if (document.activeElement !== title) title.value = has ? current.title : '';
        if (document.activeElement !== body) noteFillBody(body, has ? current : null);
        paintNoteGraph();
    }

    function noteSpots(notes, w, h) {
        const state = notepadState();
        const spots = {};
        notes.forEach(function (note, index) {
            const saved = state.layout[note.id];
            let x;
            let y;
            if (saved && isFinite(saved.x) && isFinite(saved.y)) {
                x = 28 + saved.x * Math.max(1, w - 56);
                y = 24 + saved.y * Math.max(1, h - 56);
            } else {
                const angle = (-Math.PI / 2) + (index / Math.max(1, notes.length)) * Math.PI * 2;
                const rx = Math.max(28, (w - 80) / 2);
                const ry = Math.max(24, (h - 72) / 2);
                x = w / 2 + Math.cos(angle) * rx * 0.78;
                y = h / 2 + Math.sin(angle) * ry * 0.72;
            }
            spots[note.id] = { x: x, y: y };
        });
        return spots;
    }

    function noteReduceMotion() {
        return document.documentElement.classList.contains('reduce-motion') ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function noteGraphSignature(state) {
        return state.notes.map(function (note) { return note.id; }).join('\n') + '\n' +
            state.links.map(function (link) { return link.id + ':' + link.from + ':' + link.to; }).join('\n');
    }

    function noteSyncBodies(notes, w, h) {
        const spots = noteSpots(notes, w, h);
        const next = {};
        notes.forEach(function (note) {
            const prev = noteBodies[note.id];
            if (prev) {
                next[note.id] = prev;
                return;
            }
            const spot = spots[note.id];
            let x = spot.x;
            let y = spot.y;
            const placed = Object.keys(next);
            let guard = 0;
            for (let i = 0; i < placed.length; i++) {
                const other = next[placed[i]];
                if (Math.hypot(other.x - x, other.y - y) < 48) {
                    guard += 1;
                    const angle = guard * 2.4;
                    x = w / 2 + Math.cos(angle) * Math.min(120, w * 0.34);
                    y = h / 2 + Math.sin(angle) * Math.min(120, h * 0.28);
                    i = -1;
                    if (guard > placed.length + 2) break;
                }
            }
            next[note.id] = { x: x, y: y, vx: 0, vy: 0 };
        });
        noteBodies = next;
    }

    function noteResizeBodies(w, h) {
        if (w < 20 || h < 20) return false;
        if (!noteSimSize) {
            noteSimSize = { w: w, h: h };
            return false;
        }
        if (Math.abs(noteSimSize.w - w) < 2 && Math.abs(noteSimSize.h - h) < 2) return false;
        if (noteSimSize.w < 20 || noteSimSize.h < 20) {
            noteBodies = {};
            noteSimSize = { w: w, h: h };
            return true;
        }
        const sx = w / noteSimSize.w;
        const sy = h / noteSimSize.h;
        Object.keys(noteBodies).forEach(function (id) {
            noteBodies[id].x *= sx;
            noteBodies[id].y *= sy;
        });
        noteSimSize = { w: w, h: h };
        return true;
    }

    function noteStoreLayout() {
        const stage = $('noteGraph');
        if (!stage) return;
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        const state = notepadState();
        Object.keys(noteBodies).forEach(function (id) {
            const body = noteBodies[id];
            state.layout[id] = {
                x: Math.min(1, Math.max(0, (body.x - 28) / Math.max(1, w - 56))),
                y: Math.min(1, Math.max(0, (body.y - 24) / Math.max(1, h - 56)))
            };
        });
    }

    function noteIndexGraph(svg) {
        noteDotEls = {};
        noteLineEls = {};
        const dots = svg.querySelectorAll('[data-graph-note]');
        for (let i = 0; i < dots.length; i++) noteDotEls[dots[i].getAttribute('data-graph-note')] = dots[i];
        const lines = svg.querySelectorAll('[data-note-edge]');
        for (let i = 0; i < lines.length; i++) {
            const id = lines[i].getAttribute('data-note-edge');
            if (!noteLineEls[id]) noteLineEls[id] = [];
            noteLineEls[id].push(lines[i]);
        }
    }

    function noteRefreshMarks(notes, state) {
        notes.forEach(function (note) {
            const dot = noteDotEls[note.id];
            if (!dot) return;
            dot.classList.toggle('is-on', note.id === state.active);
            dot.classList.toggle('is-from', note.id === noteLinkFrom);
            dot.classList.toggle('is-shift', noteShiftIds.indexOf(note.id) >= 0);
            const text = dot.querySelector('text');
            const label = noteTitleText(note).slice(0, 18);
            if (text && text.textContent !== label) text.textContent = label;
        });
    }

    function notePaintBodies() {
        Object.keys(noteBodies).forEach(function (id) {
            const dot = noteDotEls[id];
            const body = noteBodies[id];
            if (dot) dot.setAttribute('transform', 'translate(' + body.x.toFixed(1) + ' ' + body.y.toFixed(1) + ')');
        });
        const links = notepadState().links;
        links.forEach(function (link) {
            const lines = noteLineEls[link.id];
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            if (!lines || !a || !b) return;
            for (let i = 0; i < lines.length; i++) {
                lines[i].setAttribute('x1', a.x.toFixed(1));
                lines[i].setAttribute('y1', a.y.toFixed(1));
                lines[i].setAttribute('x2', b.x.toFixed(1));
                lines[i].setAttribute('y2', b.y.toFixed(1));
            }
        });
    }

    function noteSimStep(w, h) {
        const state = notepadState();
        const ids = Object.keys(noteBodies);
        const cx = w / 2;
        const cy = h / 2;
        const rest = Math.min(150, Math.max(78, Math.min(w, h) * 0.28));
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const a = noteBodies[ids[i]];
                const b = noteBodies[ids[j]];
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let dist = Math.hypot(dx, dy);
                if (dist < 1) {
                    dx = (i % 2 ? 1 : -1);
                    dy = 0.35;
                    dist = 1;
                }
                const push = Math.min(11, 1600 / (dist * dist));
                const fx = (dx / dist) * push;
                const fy = (dy / dist) * push;
                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
            }
        }
        state.links.forEach(function (link) {
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            if (!a || !b) return;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const pull = (dist - rest) * 0.02;
            const fx = (dx / dist) * pull;
            const fy = (dy / dist) * pull;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        });
        let energy = 0;
        ids.forEach(function (id) {
            const body = noteBodies[id];
            if (noteDrag && noteDrag.id === id) {
                body.vx = noteDrag.vx || 0;
                body.vy = noteDrag.vy || 0;
                energy += 1;
                return;
            }
            body.vx += (cx - body.x) * 0.012;
            body.vy += (cy - body.y) * 0.012;
            body.vx *= 0.8;
            body.vy *= 0.8;
            const speed = Math.hypot(body.vx, body.vy);
            if (speed > 12) {
                body.vx = body.vx / speed * 12;
                body.vy = body.vy / speed * 12;
            } else if (speed < 0.05) {
                body.vx = 0;
                body.vy = 0;
            }
            body.x += body.vx;
            body.y += body.vy;
            if (body.x < 36) { body.x = 36; body.vx *= -0.35; }
            if (body.x > w - 36) { body.x = w - 36; body.vx *= -0.35; }
            if (body.y < 28) { body.y = 28; body.vy *= -0.35; }
            if (body.y > h - 40) { body.y = h - 40; body.vy *= -0.35; }
            energy += body.vx * body.vx + body.vy * body.vy;
        });
        return energy;
    }

    function noteSimStop(save) {
        noteSimOn = false;
        noteSimCalm = 0;
        if (!save) return;
        noteStoreLayout();
        schedulePersist();
    }

    function noteSimTick() {
        if (!noteSimOn) return;
        const stage = $('noteGraph');
        const page = document.body && document.body.getAttribute('data-page');
        if (page !== 'notepad' || !stage || !stage.querySelector('svg')) {
            noteSimOn = false;
            return;
        }
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (w < 20 || h < 20) {
            requestAnimationFrame(noteSimTick);
            return;
        }
        const energy = noteSimStep(w, h);
        notePaintBodies();
        if (!noteDrag && energy < 0.08) noteSimCalm += 1;
        else noteSimCalm = 0;
        if (!noteDrag && noteSimCalm > 24) {
            noteSimStop(true);
            return;
        }
        requestAnimationFrame(noteSimTick);
    }

    function noteSimStart() {
        const stage = $('noteGraph');
        if (!stage || !Object.keys(noteBodies).length) return;
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        if (noteReduceMotion()) {
            for (let step = 0; step < 140; step++) noteSimStep(w, h);
            Object.keys(noteBodies).forEach(function (id) {
                noteBodies[id].vx = 0;
                noteBodies[id].vy = 0;
            });
            notePaintBodies();
            noteStoreLayout();
            return;
        }
        if (noteSimOn) return;
        noteSimCalm = 0;
        noteSimOn = true;
        requestAnimationFrame(noteSimTick);
    }

    function paintNoteGraph() {
        const stage = $('noteGraph');
        if (!stage) return;
        const state = notepadState();
        const notes = state.notes;
        if (!notes.length) {
            noteBodies = {};
            noteDotEls = {};
            noteLineEls = {};
            noteGraphSig = '';
            noteSimSize = null;
            noteSimOn = false;
            stage.innerHTML = '';
            return;
        }
        const w = Math.max(1, stage.clientWidth);
        const h = Math.max(1, stage.clientHeight);
        if (w < 20 || h < 20) return;
        const resized = noteResizeBodies(w, h);
        noteSyncBodies(notes, w, h);
        const sig = noteGraphSignature(state);
        const svg = stage.querySelector('svg');
        if (svg && sig === noteGraphSig) {
            svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            noteRefreshMarks(notes, state);
            notePaintBodies();
            if (resized) noteSimStart();
            return;
        }
        noteGraphSig = sig;
        const lines = state.links.filter(function (link) {
            return noteBodies[link.from] && noteBodies[link.to];
        }).map(function (link) {
            const a = noteBodies[link.from];
            const b = noteBodies[link.to];
            const id = esc(link.id);
            return '<line class="note-edge-hit" data-note-edge="' + id + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />' +
                '<line class="note-edge" data-note-edge="' + id + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />';
        }).join('');
        const dots = notes.map(function (note) {
            const spot = noteBodies[note.id];
            const on = note.id === state.active ? ' is-on' : '';
            const from = note.id === noteLinkFrom ? ' is-from' : '';
            const shift = noteShiftIds.indexOf(note.id) >= 0 ? ' is-shift' : '';
            const label = noteTitleText(note).slice(0, 18);
            return '<g class="note-dot' + on + from + shift + '" data-graph-note="' + esc(note.id) + '" transform="translate(' + spot.x + ' ' + spot.y + ')">' +
                '<circle r="7" />' +
                '<text y="18">' + esc(label) + '</text></g>';
        }).join('');
        stage.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><g data-note-cam transform="translate(' +
            notepadState().pan.x + ' ' + notepadState().pan.y + ')">' + lines + dots + '</g></svg>';
        noteIndexGraph(stage.querySelector('svg'));
        noteSimStart();
    }

    function addNotepadNote() {
        const state = notepadState();
        const note = blankNote();
        state.notes.unshift(note);
        state.active = note.id;
        renderNotepad();
        schedulePersist();
        const title = $('noteTitle');
        if (title) title.focus();
    }

    function writeActiveNote() {
        const state = notepadState();
        const title = $('noteTitle');
        const body = $('noteBody');
        if (!title || !body) return;
        noteMarkEmpty(body);
        let note = noteById(state.active);
        const fresh = !note;
        const plain = notePlainFrom(body);
        const html = noteSanitize(body.innerHTML);
        if (!note) {
            if (!title.value && !plain && !noteHasFormat(html)) return;
            note = blankNote();
            state.notes.unshift(note);
            state.active = note.id;
        }
        note.title = title.value.slice(0, 80);
        note.body = plain;
        note.html = (plain || noteHasFormat(html)) ? html : '';
        if (!note.created) note.created = note.updated || noteNow();
        note.updated = noteNow();
        if (fresh) {
            renderNotepad();
            schedulePersist();
            return;
        }
        const rows = document.querySelectorAll('#noteList [data-note]');
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute('data-note') !== note.id) continue;
            const strong = rows[i].querySelector('strong');
            const small = rows[i].querySelector('small');
            const more = rows[i].querySelector('[data-note-more]');
            if (strong) strong.textContent = noteTitleText(note);
            if (small) small.textContent = notePreview(note);
            if (more) more.setAttribute('aria-label', 'Options for ' + noteTitleText(note));
        }
        paintNoteGraph();
        schedulePersist();
    }

    function runNoteAction(action, noteId, linkId) {
        closeNoteMenu();
        if (action === 'new') {
            addNotepadNote();
            return;
        }
        const state = notepadState();
        if (noteId) state.active = noteId;
        if (action === 'rename') {
            renderNotepad();
            const title = $('noteTitle');
            if (title) {
                title.focus();
                title.select();
            }
            return;
        }
        if (action === 'edit') {
            renderNotepad();
            const body = $('noteBody');
            if (body) body.focus();
            return;
        }
        if (action === 'link') {
            startNoteLink(noteId);
            return;
        }
        if (action === 'unlink') {
            state.links = state.links.filter(function (link) { return link.id !== linkId; });
            renderNotepad();
            schedulePersist();
            return;
        }
        if (action === 'delete') deleteNote(noteId);
    }


    const NOTE_TAGS = { b: 1, strong: 1, i: 1, em: 1, u: 1, s: 1, strike: 1, del: 1, sup: 1, sub: 1, mark: 1, code: 1, span: 1, br: 1, div: 1, p: 1 };
    const NOTE_FONTS = {
        serif: 'Georgia, "Times New Roman", serif',
        sans: '"Segoe UI", sans-serif',
        mono: 'ui-monospace, Consolas, monospace',
        narrow: '"Arial Narrow", sans-serif'
    };
    const NOTE_COLORS = { '#fafafa': 1, '#a1a1aa': 1, '#f87171': 1, '#fb923c': 1, '#facc15': 1, '#4ade80': 1, '#67e8f9': 1, '#60a5fa': 1, '#c084fc': 1, '#f472b6': 1 };
    const NOTE_MARKS = { '#fde047': 1, '#86efac': 1, '#67e8f9': 1, '#fdba74': 1, '#f9a8d4': 1 };
    const NOTE_SIZES = { '12px': 1, '14px': 1, '15px': 1, '18px': 1, '22px': 1, '28px': 1 };
    let noteFormatRange = null;
    let noteFormatBlock = null;
    let noteFormatNote = '';
    let notePlusBlock = null;

    function noteColorHex(value) {
        const raw = String(value || '').trim().toLowerCase();
        if (/^#[0-9a-f]{3}$/.test(raw)) return '#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3];
        if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
        const rgb = raw.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
        if (!rgb) return '';
        return '#' + [rgb[1], rgb[2], rgb[3]].map(function (part) {
            const hex = Number(part).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function noteKnownColor(value) {
        const hex = noteColorHex(value);
        return NOTE_COLORS[hex] || NOTE_MARKS[hex] ? hex : '';
    }

    function noteFontKey(value) {
        const text = String(value || '').toLowerCase().replace(/["']/g, '');
        if (!text || text === 'inherit') return '';
        if (text.indexOf('narrow') >= 0) return 'narrow';
        if (text.indexOf('mono') >= 0 || text.indexOf('consolas') >= 0 || text.indexOf('courier') >= 0) return 'mono';
        if (text.indexOf('georgia') >= 0 || text.indexOf('times') >= 0) return 'serif';
        if (text.indexOf('segoe') >= 0) return 'sans';
        return '';
    }

    function noteSafeStyle(style) {
        const out = [];
        String(style || '').split(';').forEach(function (part) {
            const idx = part.indexOf(':');
            if (idx < 0) return;
            const key = part.slice(0, idx).trim().toLowerCase();
            const raw = part.slice(idx + 1).trim();
            let value = '';
            if (key === 'color' || key === 'background-color') value = noteKnownColor(raw);
            else if (key === 'font-size') value = NOTE_SIZES[raw.toLowerCase()] ? raw.toLowerCase() : '';
            else if (key === 'font-family') value = NOTE_FONTS[noteFontKey(raw)] || '';
            else if (key === 'font-weight' && /^(700|bold)$/i.test(raw)) value = '700';
            else if (key === 'font-style' && /^italic$/i.test(raw)) value = 'italic';
            else if (key === 'text-decoration') {
                const text = raw.toLowerCase();
                const bits = [];
                if (text.indexOf('underline') >= 0) bits.push('underline');
                if (text.indexOf('line-through') >= 0) bits.push('line-through');
                value = bits.join(' ');
            }
            if (value) out.push(key + ': ' + value);
        });
        return out.join('; ');
    }

    function noteCleanNode(node) {
        Array.from(node.childNodes).forEach(function (child) {
            if (child.nodeType !== 1) {
                if (child.nodeType !== 3) node.removeChild(child);
                return;
            }
            const tag = child.tagName.toLowerCase();
            if (!NOTE_TAGS[tag]) {
                noteCleanNode(child);
                while (child.firstChild) node.insertBefore(child.firstChild, child);
                node.removeChild(child);
                return;
            }
            const style = noteSafeStyle(child.getAttribute('style') || '');
            const code = (tag === 'div' || tag === 'p') && child.classList.contains('is-code');
            while (child.attributes.length) child.removeAttribute(child.attributes[0].name);
            if (style) child.setAttribute('style', style);
            if (code) child.className = 'is-code';
            noteCleanNode(child);
            if (tag === 'span' && !child.getAttribute('style') && child.parentNode) {
                while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
                child.parentNode.removeChild(child);
            }
        });
    }

    function noteSanitize(html) {
        const root = document.createElement('div');
        root.innerHTML = String(html || '');
        noteCleanNode(root);
        return root.innerHTML;
    }

    function noteHasFormat(html) {
        return /style=|class="is-code"|<(b|strong|i|em|u|s|strike|del|sup|sub|code|mark)\b/i.test(String(html || ''));
    }

    function noteInlineText(node) {
        let text = '';
        const kids = Array.from(node.childNodes || []);
        kids.forEach(function (child) {
            if (child.nodeType === 3) text += child.nodeValue || '';
            else if (child.nodeName === 'BR') {
                if (child !== kids[kids.length - 1]) text += '\n';
            } else text += noteInlineText(child);
        });
        return text.replace(/\u00a0/g, ' ');
    }

    function notePlainFrom(root) {
        if (!root) return '';
        const blocks = [];
        Array.from(root.childNodes).forEach(function (node) {
            if (node.nodeType === 3) blocks.push(node.nodeValue || '');
            else if (node.nodeType === 1) blocks.push(noteInlineText(node));
        });
        return blocks.join('\n').replace(/\u00a0/g, ' ');
    }

    function notePlainFromHtml(html) {
        const holder = document.createElement('div');
        holder.innerHTML = html;
        return notePlainFrom(holder);
    }

    function noteSameText(a, b) {
        return String(a || '').replace(/\u00a0/g, ' ').replace(/\s+$/g, '') === String(b || '').replace(/\u00a0/g, ' ').replace(/\s+$/g, '');
    }

    function noteTextToHtml(text) {
        const value = String(text || '');
        if (!value) return '';
        return value.split('\n').map(function (line) {
            return '<div>' + (esc(line) || '<br>') + '</div>';
        }).join('');
    }

    function noteMarkEmpty(el) {
        if (el) el.classList.toggle('is-empty', !notePlainFrom(el));
    }

    function noteFillBody(el, note) {
        if (!el) return;
        if (!note) {
            el.innerHTML = '';
            noteMarkEmpty(el);
            return;
        }
        const plain = String(note.body || '');
        let html = note.html ? noteSanitize(note.html) : '';
        if (html && !noteSameText(notePlainFromHtml(html), plain)) html = '';
        el.innerHTML = html || noteTextToHtml(plain);
        noteMarkEmpty(el);
    }

    function noteBodySelection() {
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || sel.isCollapsed || !sel.rangeCount) return false;
        return body.contains(sel.getRangeAt(0).commonAncestorContainer);
    }

    function noteCaptureRange() {
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (!body.contains(range.commonAncestorContainer)) return null;
        return range.cloneRange();
    }

    function noteRestoreRange() {
        const body = $('noteBody');
        if (!body) return;
        body.focus();
        if (!noteFormatRange) return;
        const sel = window.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        try { sel.addRange(noteFormatRange); } catch (error) {}
    }

    function noteRememberRange() {
        noteFormatRange = noteCaptureRange();
    }

    function noteOwningBlock(node) {
        const body = $('noteBody');
        let el = node && node.nodeType === 1 ? node : node && node.parentElement;
        if (!el || !body || !body.contains(el)) return null;
        if (el === body) return body.firstElementChild || null;
        while (el.parentElement && el.parentElement !== body) el = el.parentElement;
        return el === body ? null : el;
    }

    function noteBlockIsEmpty(block) {
        return !String(block && block.textContent || '').replace(/\u00a0/g, '').trim();
    }

    function noteCoversBlock(range, block) {
        if (!range || !block) return false;
        if (noteBlockIsEmpty(block)) return block.contains(range.startContainer);
        const full = document.createRange();
        full.selectNodeContents(block);
        try {
            return range.compareBoundaryPoints(Range.START_TO_START, full) <= 0 && range.compareBoundaryPoints(Range.END_TO_END, full) >= 0;
        } catch (error) {
            return false;
        }
    }

    function noteLiveBlock() {
        const body = $('noteBody');
        if (noteFormatBlock && body && body.contains(noteFormatBlock)) return noteFormatBlock;
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        return noteOwningBlock(sel.getRangeAt(0).startContainer);
    }

    function noteClosest(node, selector) {
        const body = $('noteBody');
        const el = node && node.nodeType === 1 ? node : node && node.parentElement;
        if (!el || !el.closest || !body) return null;
        const host = el.closest(selector);
        return host && body.contains(host) ? host : null;
    }

    function noteInlineValue(node, prop) {
        const body = $('noteBody');
        let el = node && node.nodeType === 1 ? node : node && node.parentElement;
        while (el && body && el !== body) {
            if (el.style && el.style[prop]) return el.style[prop];
            el = el.parentElement;
        }
        return '';
    }

    function noteUnwrapElement(node) {
        const parent = node && node.parentNode;
        if (!parent) return;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
    }

    function noteStripProp(node, prop) {
        if (!node || !node.childNodes) return;
        if (node.nodeType === 1 && node.style) {
            node.style[prop] = '';
            if (node.getAttribute('style') === '') node.removeAttribute('style');
        }
        Array.from(node.childNodes).forEach(function (child) { noteStripProp(child, prop); });
    }

    function notePruneSpans(node) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(notePruneSpans);
        if (node.nodeType === 1 && node.tagName === 'SPAN' && !node.getAttribute('style')) noteUnwrapElement(node);
    }

    function noteStripTag(node, tag) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(function (child) { noteStripTag(child, tag); });
        if (node.nodeType === 1 && node.tagName === tag) noteUnwrapElement(node);
    }

    function noteReselect(node) {
        if (!node) return;
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function noteCommandOn(command) {
        try { return !!document.queryCommandState(command); } catch (error) { return false; }
    }

    function noteFinishFormat() {
        noteRememberRange();
        noteSyncFormat();
        const body = $('noteBody');
        if (body) noteMarkEmpty(body);
        writeActiveNote();
    }

    function noteRun(command) {
        try { document.execCommand(command, false, null); } catch (error) {}
    }

    function noteToggleCommand(command, prop, onValue) {
        noteRestoreRange();
        const block = noteLiveBlock();
        if (block && noteBlockIsEmpty(block)) {
            block.style[prop] = block.style[prop] === onValue ? '' : onValue;
            if (!block.getAttribute('style')) block.removeAttribute('style');
        } else noteRun(command);
        noteFinishFormat();
    }

    function noteToggleDecor(word, command) {
        noteRestoreRange();
        const block = noteLiveBlock();
        if (block && noteBlockIsEmpty(block)) {
            const parts = String(block.style.textDecoration || '').toLowerCase().split(/\s+/).filter(Boolean);
            const has = parts.indexOf(word) >= 0;
            block.style.textDecoration = (has ? parts.filter(function (part) { return part !== word; }) : parts.concat([word])).join(' ');
            if (!block.getAttribute('style')) block.removeAttribute('style');
        } else noteRun(command);
        noteFinishFormat();
    }

    function noteApplyProp(prop, value) {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (block && (range.collapsed || noteCoversBlock(range, block))) {
            block.style[prop] = value || '';
            if (!block.getAttribute('style')) block.removeAttribute('style');
            Array.from(block.childNodes).forEach(function (child) { noteStripProp(child, prop); });
            notePruneSpans(block);
            noteReselect(block);
            noteFinishFormat();
            return;
        }
        if (range.collapsed) {
            noteFinishFormat();
            return;
        }
        const frag = range.extractContents();
        noteStripProp(frag, prop);
        notePruneSpans(frag);
        if (value) {
            const span = document.createElement('span');
            span.style[prop] = value;
            span.appendChild(frag);
            range.insertNode(span);
            noteReselect(span);
        } else range.insertNode(frag);
        noteFinishFormat();
    }

    function noteToggleCode() {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const host = noteClosest(range.startContainer, 'code');
        const block = noteLiveBlock();
        if (host) {
            noteUnwrapElement(host);
            if (block) noteReselect(block);
        } else if (range.collapsed && block) {
            block.classList.toggle('is-code');
        } else if (!range.collapsed) {
            const code = document.createElement('code');
            code.appendChild(range.extractContents());
            range.insertNode(code);
            noteReselect(code);
        }
        noteFinishFormat();
    }

    function noteApplyHighlight(color) {
        noteRestoreRange();
        const hex = noteKnownColor(color);
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (!hex) {
            if (block) {
                block.style.backgroundColor = '';
                if (!block.getAttribute('style')) block.removeAttribute('style');
            }
            if (!range.collapsed) {
                const frag = range.extractContents();
                noteStripTag(frag, 'MARK');
                noteStripProp(frag, 'backgroundColor');
                range.insertNode(frag);
            }
            noteFinishFormat();
            return;
        }
        if (range.collapsed && block) {
            block.style.backgroundColor = noteColorHex(block.style.backgroundColor) === hex ? '' : hex;
            if (!block.getAttribute('style')) block.removeAttribute('style');
            noteFinishFormat();
            return;
        }
        if (range.collapsed) {
            noteFinishFormat();
            return;
        }
        const mark = document.createElement('mark');
        mark.style.backgroundColor = hex;
        const frag = range.extractContents();
        noteStripTag(frag, 'MARK');
        mark.appendChild(frag);
        range.insertNode(mark);
        noteReselect(mark);
        noteFinishFormat();
    }

    function noteFlattenFormat(node) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(noteFlattenFormat);
        if (node.nodeType !== 1) return;
        const tag = node.tagName;
        if (tag === 'DIV' || tag === 'P') {
            node.removeAttribute('style');
            node.classList.remove('is-code');
            return;
        }
        if (/^(CODE|MARK|SPAN|FONT|B|STRONG|I|EM|U|S|STRIKE|DEL|SUP|SUB)$/.test(tag)) noteUnwrapElement(node);
    }

    function noteClearFormat() {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (block && (range.collapsed || noteCoversBlock(range, block))) {
            block.removeAttribute('style');
            block.classList.remove('is-code');
        }
        if (!range.collapsed) {
            noteRun('removeFormat');
            const live = window.getSelection();
            if (live && live.rangeCount) {
                const again = live.getRangeAt(0);
                if (!again.collapsed && body.contains(again.commonAncestorContainer)) {
                    const frag = again.extractContents();
                    noteFlattenFormat(frag);
                    again.insertNode(frag);
                }
            }
        }
        if (block) noteReselect(block);
        noteFinishFormat();
    }

    function noteApplyFormat(kind, value) {
        if (kind === 'bold') noteToggleCommand('bold', 'fontWeight', '700');
        else if (kind === 'italic') noteToggleCommand('italic', 'fontStyle', 'italic');
        else if (kind === 'underline') noteToggleDecor('underline', 'underline');
        else if (kind === 'strike') noteToggleDecor('line-through', 'strikeThrough');
        else if (kind === 'sup') noteToggleCommand('superscript', 'verticalAlign', 'super');
        else if (kind === 'sub') noteToggleCommand('subscript', 'verticalAlign', 'sub');
        else if (kind === 'code') noteToggleCode();
        else if (kind === 'clear') noteClearFormat();
        else if (kind === 'size') noteApplyProp('fontSize', value || '');
        else if (kind === 'color') noteApplyProp('color', value || '');
        else if (kind === 'font') noteApplyProp('fontFamily', value ? (NOTE_FONTS[value] || '') : '');
        else if (kind === 'highlight') noteApplyHighlight(value || '');
    }

    function noteSyncFormat() {
        const menu = $('noteFormat');
        if (!menu) return;
        const sel = window.getSelection();
        const node = sel && sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
        const size = noteInlineValue(node, 'fontSize');
        const color = noteColorHex(noteInlineValue(node, 'color'));
        const font = noteFontKey(noteInlineValue(node, 'fontFamily'));
        const decor = noteInlineValue(node, 'textDecoration').toLowerCase();
        const mark = noteClosest(node, 'mark');
        const block = noteLiveBlock();
        const markColor = noteColorHex((mark && mark.style.backgroundColor) || noteInlineValue(node, 'backgroundColor'));
        const code = !!(noteClosest(node, 'code') || (block && block.classList.contains('is-code')));
        menu.querySelectorAll('[data-fmt]').forEach(function (button) {
            const kind = button.getAttribute('data-fmt');
            const value = button.getAttribute('data-value') || '';
            let on = false;
            if (kind === 'bold') on = noteCommandOn('bold') || noteInlineValue(node, 'fontWeight') === '700';
            else if (kind === 'italic') on = noteCommandOn('italic') || noteInlineValue(node, 'fontStyle') === 'italic';
            else if (kind === 'underline') on = noteCommandOn('underline') || decor.indexOf('underline') >= 0;
            else if (kind === 'strike') on = noteCommandOn('strikeThrough') || decor.indexOf('line-through') >= 0;
            else if (kind === 'sup') on = noteCommandOn('superscript');
            else if (kind === 'sub') on = noteCommandOn('subscript');
            else if (kind === 'code') on = code;
            else if (kind === 'size') on = value ? size === value : !size;
            else if (kind === 'color') on = value ? color === value : !color;
            else if (kind === 'font') on = value ? font === value : !font;
            else if (kind === 'highlight') on = value ? markColor === noteColorHex(value) : !markColor;
            button.classList.toggle('is-on', on);
            if (button.hasAttribute('aria-label') && kind !== 'color' && kind !== 'highlight') button.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function closeNoteFormat() {
        const menu = $('noteFormat');
        if (menu) menu.hidden = true;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.remove('is-on');
        noteFormatRange = null;
        noteFormatBlock = null;
    }

    function openNoteFormat(x, y) {
        const menu = $('noteFormat');
        if (!menu) return;
        hideFieldMenu();
        closeNoteMenu();
        noteFormatRange = noteCaptureRange();
        noteFormatNote = notepadState().active || '';
        if (menu.parentElement !== document.body) document.body.appendChild(menu);
        placeAppMenu(menu, x, y);
        noteSyncFormat();
    }

    function openNoteSelectionFormat(x, y) {
        noteFormatBlock = null;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.remove('is-on');
        openNoteFormat(x, y);
    }

    function noteSelectBlock(block) {
        const body = $('noteBody');
        if (!body || !block) return null;
        let target = block;
        if (target === body) {
            if (!body.firstElementChild) body.innerHTML = '<div><br></div>';
            target = body.firstElementChild;
        }
        body.focus();
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        return target;
    }

    function openNoteLineFormat(block) {
        const target = noteSelectBlock(block);
        if (!target) return;
        noteFormatBlock = target;
        notePlusBlock = target;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.add('is-on');
        showNotePlus(target);
        const rect = plus ? plus.getBoundingClientRect() : target.getBoundingClientRect();
        openNoteFormat(rect.left, rect.bottom + 6);
    }

    function noteBlockAt(clientY) {
        const body = $('noteBody');
        if (!body) return null;
        const rect = body.getBoundingClientRect();
        if (clientY < rect.top || clientY > rect.bottom) return null;
        const kids = body.children;
        for (let i = 0; i < kids.length; i++) {
            const box = kids[i].getBoundingClientRect();
            if (clientY >= box.top - 3 && clientY <= box.bottom + 3) return kids[i];
        }
        if (!kids.length || body.classList.contains('is-empty')) return body;
        return kids[kids.length - 1] || null;
    }

    function showNotePlus(block) {
        const plus = $('noteLinePlus');
        const sheet = plus && plus.parentElement;
        const body = $('noteBody');
        if (!plus || !sheet || !block || !body) return;
        const sheetRect = sheet.getBoundingClientRect();
        const rect = block === body ? body.getBoundingClientRect() : block.getBoundingClientRect();
        const height = block === body ? 24 : rect.height;
        const top = block === body ? rect.top + 2 : rect.top;
        if (top + height < sheetRect.top + 2 || top > sheetRect.bottom - 2) {
            if (!plus.classList.contains('is-on')) plus.hidden = true;
            return;
        }
        notePlusBlock = block === body ? (body.firstElementChild || body) : block;
        plus.hidden = false;
        plus.style.top = Math.max(0, top - sheetRect.top + Math.min(height, 28) / 2 - 11) + 'px';
    }

    function hideNotePlus() {
        const plus = $('noteLinePlus');
        if (!plus || plus.classList.contains('is-on')) return;
        plus.hidden = true;
        notePlusBlock = null;
    }

    function bindNoteFormat() {
        const body = $('noteBody');
        const plus = $('noteLinePlus');
        const menu = $('noteFormat');
        const sheet = body && body.parentElement;
        if (!body || !plus || !menu || !sheet) return;
        try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (error) {}
        plus.addEventListener('mousedown', function (event) { event.preventDefault(); });
        plus.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openNoteLineFormat(notePlusBlock || noteBlockAt(plus.getBoundingClientRect().top + 11));
        });
        menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
        menu.addEventListener('click', function (event) {
            const button = event.target.closest('[data-fmt]');
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            noteApplyFormat(button.getAttribute('data-fmt') || '', button.getAttribute('data-value') || '');
        });
        sheet.addEventListener('pointermove', function (event) {
            if (!menu.hidden && plus.classList.contains('is-on')) return;
            if (event.buttons) {
                hideNotePlus();
                return;
            }
            if (event.target.closest && event.target.closest('#noteLinePlus')) return;
            const block = noteBlockAt(event.clientY);
            if (!block) hideNotePlus();
            else showNotePlus(block);
        });
        sheet.addEventListener('pointerleave', hideNotePlus);
        body.addEventListener('scroll', function () {
            if (notePlusBlock && (notePlusBlock === body || body.contains(notePlusBlock))) showNotePlus(notePlusBlock);
            else hideNotePlus();
        });
        body.addEventListener('paste', function (event) {
            const clip = event.clipboardData;
            if (!clip) return;
            event.preventDefault();
            event.stopPropagation();
            const text = clip.getData('text/plain') || '';
            const html = clip.getData('text/html') || '';
            let clean = html ? noteSanitize(html) : '';
            if (!clean || !notePlainFromHtml(clean)) clean = noteTextToHtml(text);
            if (!clean) return;
            document.execCommand('insertHTML', false, clean);
            writeActiveNote();
        });
        body.addEventListener('dragover', function (event) { event.preventDefault(); });
        body.addEventListener('drop', function (event) {
            event.preventDefault();
            const text = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
            if (!text) return;
            let range = null;
            if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(event.clientX, event.clientY);
            else if (document.caretPositionFromPoint) {
                const spot = document.caretPositionFromPoint(event.clientX, event.clientY);
                if (spot) {
                    range = document.createRange();
                    range.setStart(spot.offsetNode, spot.offset);
                    range.collapse(true);
                }
            }
            if (range) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            document.execCommand('insertText', false, text);
            writeActiveNote();
        });
    }

    bindNoteFormat();
    function bindNotepad() {
        const list = $('noteList');
        const title = $('noteTitle');
        const body = $('noteBody');
        const add = $('noteNew');
        const menu = $('noteMenu');
        const stage = $('noteGraph');
        const view = $('noteView');
        const linkGo = $('noteLinkGo');
        const linkCancel = $('noteLinkCancel');
        if (add) add.addEventListener('click', addNotepadNote);
        if (list) {
            list.addEventListener('click', function (event) {
                const more = event.target.closest('[data-note-more]');
                const row = event.target.closest('[data-note]');
                if (!row) return;
                const id = row.getAttribute('data-note') || '';
                if (event.shiftKey && !more) {
                    event.preventDefault();
                    linkNoteIntoShift(id);
                    return;
                }
                notepadState().active = id;
                if (more) {
                    event.stopPropagation();
                    renderNotepad();
                    const anchor = document.querySelector('#noteList [data-note="' + id + '"] [data-note-more]');
                    openNoteMenu(id, anchor);
                    return;
                }
                closeNoteMenu();
                renderNotepad();
            });
            list.addEventListener('keydown', function (event) {
                const row = event.target.closest('[data-note]');
                if (!row || (event.key !== 'Enter' && event.key !== ' ')) return;
                if (event.target.closest('[data-note-more]')) return;
                event.preventDefault();
                notepadState().active = row.getAttribute('data-note') || '';
                closeNoteMenu();
                renderNotepad();
            });
        }
        if (menu) {
            menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
            menu.addEventListener('click', function (event) {
                const fieldBtn = event.target.closest('[data-field-act]');
                if (fieldBtn) {
                    if (fieldBtn.disabled) return;
                    const field = document.getElementById(menu.dataset.field || '');
                    const act = fieldBtn.getAttribute('data-field-act');
                    closeNoteMenu();
                    if (field) runFieldEdit(field, act);
                    return;
                }
                const button = event.target.closest('[data-note-act]');
                if (!button) return;
                runNoteAction(button.getAttribute('data-note-act'), menu.dataset.note || '', button.getAttribute('data-link') || '');
            });
        }
        if (view) {
            view.addEventListener('contextmenu', function (event) {
                const field = event.target.closest('#noteTitle, #noteBody');
                if (field && field.id === 'noteBody' && noteBodySelection()) {
                    openNoteFormat(event.clientX, event.clientY);
                    return;
                }
                if (field) {
                    openNoteEditMenu(field, event.clientX, event.clientY);
                    return;
                }
                const row = event.target.closest('#noteList [data-note]');
                if (row) {
                    const id = row.getAttribute('data-note') || '';
                    notepadState().active = id;
                    renderNotepad();
                    openNoteMenuAt(id, event.clientX, event.clientY);
                    return;
                }
                const dot = event.target.closest('[data-graph-note]');
                if (dot) {
                    const id = dot.getAttribute('data-graph-note') || '';
                    notepadState().active = id;
                    renderNotepad();
                    openNoteMenuAt(id, event.clientX, event.clientY);
                    return;
                }
                openNoteCreateMenu(event.clientX, event.clientY);
            });
        }
        document.addEventListener('click', function (event) {
            if (event.target.closest('#noteMenu') || event.target.closest('#noteFormat') || event.target.closest('#noteLinePlus') || event.target.closest('[data-note-more]')) return;
            closeNoteMenu();
            closeNoteFormat();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Shift') {
                const tip = $('noteLinkHint');
                if (tip && !noteLinkFrom) tip.classList.add('is-armed');
            }
            if (event.key !== 'Escape') return;
            closeNoteMenu();
            closeNoteFormat();
            if (noteLinkFrom) cancelNoteLink();
        });
        document.addEventListener('keyup', function (event) {
            if (event.key !== 'Shift') return;
            const tip = $('noteLinkHint');
            if (tip && !noteLinkFrom) tip.classList.remove('is-armed');
            if (!noteShiftIds.length) return;
            noteShiftIds = [];
            renderNotepad();
        });
        if (title) title.addEventListener('input', writeActiveNote);
        if (body) body.addEventListener('input', writeActiveNote);
        if (linkGo) {
            linkGo.addEventListener('click', function () {
                if (noteLinkFrom) {
                    cancelNoteLink();
                    return;
                }
                const state = notepadState();
                const id = state.active || (state.notes[0] && state.notes[0].id) || '';
                if (id) startNoteLink(id);
            });
        }
        if (linkCancel) linkCancel.addEventListener('click', cancelNoteLink);
        if (stage) {
            function stopNoteAutoscroll(event) {
                if (event.button === 1) event.preventDefault();
            }
            stage.addEventListener('mousedown', stopNoteAutoscroll, true);
            stage.addEventListener('auxclick', stopNoteAutoscroll);
            stage.addEventListener('pointerdown', function (event) {
                if (event.button === 1) {
                    event.preventDefault();
                    notePan = { x: event.clientX, y: event.clientY, pointer: event.pointerId, moved: false };
                    stage.classList.add('is-panning');
                    try { stage.setPointerCapture(event.pointerId); } catch (error) {}
                    return;
                }
                if (event.button !== 0) return;
                if (event.target.closest('[data-note-edge]')) return;
                const dot = event.target.closest('[data-graph-note]');
                if (!dot) {
                    if (noteLinkFrom) cancelNoteLink();
                    return;
                }
                const id = dot.getAttribute('data-graph-note') || '';
                if (event.shiftKey) {
                    linkNoteIntoShift(id);
                    return;
                }
                if (noteLinkFrom) {
                    if (noteLinkFrom !== id) addNoteLink(noteLinkFrom, id);
                    cancelNoteLink();
                    notepadState().active = id;
                    renderNotepad();
                    return;
                }
                noteDrag = { id: id, x: event.clientX, y: event.clientY, vx: 0, vy: 0, moved: false, pointer: event.pointerId };
                stage.classList.add('is-dragging');
                try { stage.setPointerCapture(event.pointerId); } catch (error) {}
            });
            stage.addEventListener('pointermove', function (event) {
                if (notePan && notePan.pointer === event.pointerId) {
                    const dx = event.clientX - notePan.x;
                    const dy = event.clientY - notePan.y;
                    if (!notePan.moved && Math.hypot(dx, dy) < 3) return;
                    notePan.moved = true;
                    notePan.x = event.clientX;
                    notePan.y = event.clientY;
                    const pan = notepadState().pan;
                    pan.x += dx;
                    pan.y += dy;
                    const cam = stage.querySelector('[data-note-cam]');
                    if (cam) cam.setAttribute('transform', 'translate(' + pan.x + ' ' + pan.y + ')');
                    return;
                }
                if (!noteDrag || noteDrag.pointer !== event.pointerId) return;
                const dx = event.clientX - noteDrag.x;
                const dy = event.clientY - noteDrag.y;
                if (!noteDrag.moved && Math.hypot(dx, dy) < 4) return;
                noteDrag.moved = true;
                noteDrag.x = event.clientX;
                noteDrag.y = event.clientY;
                const body = noteBodies[noteDrag.id];
                const rect = stage.getBoundingClientRect();
                const pan = notepadState().pan;
                if (!body) return;
                const x = event.clientX - rect.left - pan.x;
                const y = event.clientY - rect.top - pan.y;
                noteDrag.vx = x - body.x;
                noteDrag.vy = y - body.y;
                body.x = x;
                body.y = y;
                noteSimStart();
            });
            stage.addEventListener('pointerup', function (event) {
                if (notePan && notePan.pointer === event.pointerId) {
                    const moved = notePan.moved;
                    notePan = null;
                    stage.classList.remove('is-panning');
                    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
                    if (moved) schedulePersist();
                    return;
                }
                if (!noteDrag || noteDrag.pointer !== event.pointerId) return;
                const drag = noteDrag;
                const body = noteBodies[drag.id];
                noteDrag = null;
                stage.classList.remove('is-dragging');
                if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
                if (!drag.moved) {
                    notepadState().active = drag.id;
                    renderNotepad();
                    return;
                }
                if (body) {
                    body.vx = drag.vx || 0;
                    body.vy = drag.vy || 0;
                }
                noteStoreLayout();
                schedulePersist();
                noteSimStart();
            });
            stage.addEventListener('pointercancel', function () {
                noteDrag = null;
                notePan = null;
                stage.classList.remove('is-dragging');
                stage.classList.remove('is-panning');
            });
            stage.addEventListener('click', function (event) {
                const edge = event.target.closest('[data-note-edge]');
                if (!edge) return;
                const id = edge.getAttribute('data-note-edge') || '';
                const state = notepadState();
                state.links = state.links.filter(function (link) { return link.id !== id; });
                paintNoteGraph();
                schedulePersist();
            });
            if (window.ResizeObserver) {
                const watcher = new ResizeObserver(function () {
                    if (!noteDrag) paintNoteGraph();
                });
                watcher.observe(stage);
            }
        }
        bindNoteSplit();
    }

    function notePaneNumber(view, name, fallback) {
        const n = parseFloat(view.style.getPropertyValue(name));
        return isFinite(n) ? n : fallback;
    }

    function notePaneSaved() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('orbint-note-panes') || '') || {}; } catch (error) {}
        const list = Number(saved.list);
        const graph = Number(saved.graph);
        return {
            list: isFinite(list) ? list : 220,
            graph: isFinite(graph) ? graph : 280
        };
    }

    function notePaneStore(list, graph) {
        try { localStorage.setItem('orbint-note-panes', JSON.stringify({ list: list, graph: graph })); } catch (error) {}
    }

    function applyNotePane(view, which, next) {
        const width = view.getBoundingClientRect().width;
        const narrow = window.innerWidth <= 1100;
        const listNow = notePaneNumber(view, '--note-list-w', 220);
        const graphNow = notePaneNumber(view, '--note-graph-w', 280);
        if (which === 'list') {
            const reserved = (narrow ? 12 : 24) + 220 + (narrow ? 0 : graphNow);
            const max = width > 40 ? Math.max(160, width - reserved) : 560;
            const list = Math.round(Math.min(max, Math.max(160, next)));
            view.style.setProperty('--note-list-w', list + 'px');
            const handle = view.querySelector('[data-note-split="list"]');
            if (handle) handle.setAttribute('aria-valuenow', String(list));
            return list;
        }
        const max = width > 40 ? Math.max(180, width - 24 - 220 - listNow) : 720;
        const graph = Math.round(Math.min(max, Math.max(180, next)));
        view.style.setProperty('--note-graph-w', graph + 'px');
        const handle = view.querySelector('[data-note-split="graph"]');
        if (handle) handle.setAttribute('aria-valuenow', String(graph));
        return graph;
    }

    function bindNoteSplit() {
        const view = $('noteView');
        if (!view) return;
        const saved = notePaneSaved();
        applyNotePane(view, 'list', saved.list);
        applyNotePane(view, 'graph', saved.graph);
        let drag = null;
        function finishNoteSplit() {
            if (!drag) return;
            drag.handle.classList.remove('is-on');
            document.body.classList.remove('note-splitting');
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
            drag = null;
        }
        view.addEventListener('pointerdown', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle || event.button || window.innerWidth <= 820) return;
            const which = handle.getAttribute('data-note-split');
            if (which === 'graph' && window.innerWidth <= 1100) return;
            event.preventDefault();
            drag = {
                which: which,
                handle: handle,
                x: event.clientX,
                size: notePaneNumber(view, which === 'list' ? '--note-list-w' : '--note-graph-w', which === 'list' ? 220 : 280)
            };
            handle.classList.add('is-on');
            document.body.classList.add('note-splitting');
            handle.setPointerCapture(event.pointerId);
        });
        view.addEventListener('pointermove', function (event) {
            if (!drag) return;
            const delta = event.clientX - drag.x;
            applyNotePane(view, drag.which, drag.which === 'list' ? drag.size + delta : drag.size - delta);
        });
        view.addEventListener('pointerup', finishNoteSplit);
        view.addEventListener('pointercancel', finishNoteSplit);
        view.addEventListener('dblclick', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle) return;
            const which = handle.getAttribute('data-note-split');
            applyNotePane(view, which, which === 'list' ? 220 : 280);
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
        });
        view.addEventListener('keydown', function (event) {
            const handle = event.target.closest('.note-split');
            if (!handle) return;
            const which = handle.getAttribute('data-note-split');
            const step = event.shiftKey ? 32 : 16;
            let delta = 0;
            if (event.key === 'ArrowLeft') delta = which === 'list' ? -step : step;
            else if (event.key === 'ArrowRight') delta = which === 'list' ? step : -step;
            else if (event.key === 'Home') {
                applyNotePane(view, which, which === 'list' ? 160 : 180);
                notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
                event.preventDefault();
                return;
            } else return;
            event.preventDefault();
            const current = notePaneNumber(view, which === 'list' ? '--note-list-w' : '--note-graph-w', which === 'list' ? 220 : 280);
            applyNotePane(view, which, current + delta);
            notePaneStore(notePaneNumber(view, '--note-list-w', 220), notePaneNumber(view, '--note-graph-w', 280));
        });
        if (window.ResizeObserver) {
            const panes = new ResizeObserver(function () {
                if (drag || view.hidden || !view.getBoundingClientRect().width) return;
                applyNotePane(view, 'list', notePaneNumber(view, '--note-list-w', 220));
                if (window.innerWidth > 1100) applyNotePane(view, 'graph', notePaneNumber(view, '--note-graph-w', 280));
            });
            panes.observe(view);
        }
    }

    bindNotepad();

    const CP_MAX = 2 * 1024 * 1024;
    const CP_KINDS = {
        txt: 1, md: 1, json: 1, html: 1, htm: 1, csv: 1, tsv: 1, xml: 1
    };
    const CP_PLAT = {
        github: 'github', gh: 'github', gitlab: 'gitlab', bitbucket: 'bitbucket',
        discord: 'discord', dc: 'discord',
        reddit: 'reddit',
        instagram: 'instagram', ig: 'instagram', insta: 'instagram',
        steam: 'steam',
        twitter: 'x', tweet: 'x', x: 'x',
        tiktok: 'tiktok',
        facebook: 'facebook', fb: 'facebook',
        linkedin: 'linkedin',
        telegram: 'telegram', tg: 'telegram', tme: 'telegram',
        snapchat: 'snapchat', snap: 'snapchat',
        twitch: 'twitch',
        youtube: 'youtube', yt: 'youtube',
        bluesky: 'bluesky', bsky: 'bluesky',
        threads: 'threads',
        mastodon: 'mastodon',
        pinterest: 'pinterest',
        whatsapp: 'whatsapp',
        signal: 'signal',
        skype: 'skype',
        slack: 'slack',
        medium: 'medium',
        patreon: 'patreon',
        twitchtv: 'twitch',
        xbox: 'xbox',
        playstation: 'playstation', psn: 'playstation',
        roblox: 'roblox',
        kick: 'kick',
        vk: 'vk', vkontakte: 'vk',
        ok: 'ok', odnoklassniki: 'ok',
        viber: 'viber'
    };
    const CP_KIND_LABEL = {
        name: 'Name',
        alias: 'Alias',
        username: 'Username',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        dob: 'Birthday',
        date: 'Date',
        time: 'Time',
        address: 'Location',
        id: 'ID',
        company: 'Company',
        occupation: 'Occupation',
        os: 'System',
        ip: 'IP',
        domain: 'Website',
        url: 'URL',
        crypto: 'Wallet',
        plate: 'Plate',
        vehicle: 'Vehicle',
        age: 'Age',
        timezone: 'Timezone',
        vin: 'VIN'
    };
    const CP_ORDER = [
        'name', 'alias', 'username', 'email', 'phone', 'password', 'dob', 'date', 'time',
        'address', 'id', 'company', 'occupation', 'os', 'ip', 'domain', 'url', 'crypto',
        'plate', 'vehicle', 'age', 'timezone', 'vin'
    ];
    const CP_JUNK_VAL = /^(unknown|unverified|partial|null|none|n\/a|na|maybe|weak|strong|low|medium|high|true|false|yes|no|nulls?|tbd|todo|n\/a\.?|current city|username correlation|employment not confirmed|ipv4|ipv6|scatter|true|false)$/i;
    const CP_SKIP_KEY = /^(notes?|misc|flags?|status|confidence|verified|type|types|output|record|handles|usernames|accounts|contact|observed|unresolved|random|digital|devices|identity match|location match|identity|links|ids|scratchpad|overlap|identifiers?|reason|metadata|version|begin|end|query|services|visitor|pictures?|cards?|financial|decoy|skip|comment|raw data|label|labels|caption|hint|scatter|kind|category|class|column|header|property|prop|attr|attribute|item|items|entry|entries|value|values|key|keys|field|fields)$/i;
    const CP_NOISE = /^(identity|handles?|links?|ids?|scratchpad|profile|notes?|accounts?|contact|observed|identifiers?|unresolved|digital|devices?|flags?|misc|random|confidence|output|record|people|data|info|information|section|block|online|type|value|key|field|status|browser|laptop|desktop|windows|linux|firefox|unknown|possibly|maybe|high|low|medium|flight|asn|ssid|ja3|isbn|doi|json|http|https|www|admin|root|test|user|baby|kiss|uwu|adorable|the|and|for|from|with|this|that|aliases|brother|dad|mom|sister|label|wife|husband|family)$/i;
    const CP_WEAK_HANDLE = /^(ok|jpg|png|gif|com|net|org|edu|gov|html|http|https|www|null|true|false|unknown|admin|root|test|user|guest|none|nulls?|baby|kiss|uwu|ar|l|x|skip|decoy|label|value|type)$/i;
    const CP_TYPE_LABEL = /^(android id|asset tag|cell tower|ham callsign|plus code|serial number|ssh fingerprint|wi-?fi bssid|user agent|tracking number|driver license|employee id|aircraft tail|what3words|ip address|mac address|phone number|full name|date of birth|advertising id|google ads? id|d-?u-?n-?s|pnr \/ booking|passport \(test\)|imei|imsi|idfa|uuid|mmsi|imo|doi|iban|isin|swift \/ bic)$/i;
    const CP_NAME_STOP = /\b(information|profile|section|details|notes?|employment|record|device|browser|windows|linux|house|contact|account|password|username|android|asset|serial|tower|fingerprint|callsign|bssid|ssid|imei|imsi|uuid|iban|isin|swift|booking|competitor|comp[eé]titeur|licence|license|online ids?|person record|ballot|appointments?|election|basement|officials?|resources?|occupied|absentee|only|type|user)\b/i;
    const CP_MONTH = {
        jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
        apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
        aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10',
        october: '10', nov: '11', november: '11', dec: '12', december: '12'
    };
    let cpBusy = false;
    let cpBound = false;
    let cpReveal = false;
    let cpModeThumbReady = false;
    const cpEditTimers = {};

    function harvesterState() {
        if (!data.harvester || typeof data.harvester !== 'object') {
            data.harvester = (data.compiler && typeof data.compiler === 'object')
                ? data.compiler
                : { files: [], hits: [], ready: false };
        }
        if (!Array.isArray(data.harvester.files)) data.harvester.files = [];
        if (!Array.isArray(data.harvester.hits)) data.harvester.hits = [];
        if (data.harvester.view !== 'original' && data.harvester.view !== 'stripped') {
            data.harvester.view = 'split';
        }
        const split = Number(data.harvester.split);
        data.harvester.split = isFinite(split) ? Math.min(78, Math.max(22, split)) : 50;
        return data.harvester;
    }

    function cpKind(name, type) {
        const ext = String(name || '').split('.').pop().toLowerCase();
        if (ext === 'tsv') return 'csv';
        if (ext === 'vcf' || ext === 'vcard' || ext === 'eml' || ext === 'ics' || ext === 'ldif' || ext === 'yml' || ext === 'yaml') return 'txt';
        if (CP_KINDS[ext]) return ext === 'htm' ? 'html' : ext;
        const t = String(type || '').toLowerCase();
        if (t.indexOf('json') >= 0) return 'json';
        if (t.indexOf('html') >= 0) return 'html';
        if (t.indexOf('csv') >= 0) return 'csv';
        if (t.indexOf('xml') >= 0) return 'xml';
        if (t.indexOf('markdown') >= 0) return 'md';
        return 'txt';
    }

    function cpPushHit(hits, kind, value, note, platform) {
        const v = String(value || '').trim();
        if (!v || !kind) return;
        if (v.length > 240) return;
        if (CP_JUNK_VAL.test(v)) return;
        const plat = platform ? String(platform) : '';
        if (kind === 'phone') {
            const digits = v.replace(/\D/g, '');
            hits._phone = hits._phone || {};
            const seen = Object.keys(hits._phone);
            if (seen.some(function (d) { return d === digits || d.endsWith(digits) || digits.endsWith(d); })) return;
            hits._phone[digits] = 1;
        }
        const key = kind + '\0' + v.toLowerCase() + '\0' + plat;
        if (hits._seen[key]) return;
        if (kind === 'date' && hits._seen['dob\0' + v.toLowerCase() + '\0']) return;
        if (kind === 'dob') hits._seen['date\0' + v.toLowerCase() + '\0'] = 1;
        hits._seen[key] = 1;
        const hit = { kind: kind, value: v, note: note || '' };
        if (plat) hit.platform = plat;
        hits.push(hit);
    }

    function cpNormKey(key) {
        let s = String(key || '').split(';')[0];
        s = s.replace(/\(.*?\)/g, ' ');
        s = s.replace(/^[^\p{L}\p{N}@]+/u, '');
        s = s.toLowerCase();
        s = s.replace(/[`"'*_#\[\]{}<>]/g, ' ');
        s = s.replace(/[_.\/\\-]+/g, ' ');
        s = s.replace(/[^\p{L}\p{N} ]+/gu, ' ');
        s = s.replace(/\s+/g, ' ').trim();
        s = s.replace(/\s+\d+$/, '');
        s = s.replace(/\s+(of )?(father|mother|mom|dad|brother|sister|parent|отца|мамы|маме|отцу|сестры)$/u, '');
        return s;
    }

    function cpCleanValue(value) {
        let s = String(value == null ? '' : value).trim();
        s = s.replace(/<br\s*\/?>/gi, ', ');
        s = s.replace(/<[^>]+>/g, ' ');
        s = s.replace(/[█░▓▀▄■□╔╗╚╝║╠╣═┌┐└┘│┬┴┼]/g, ' ');
        s = s.replace(/^[\s,;:.\-/|`"'*_]+/, '');
        s = s.replace(/[\s,;:`"'*_]+$/, '');
        s = s.replace(/\*\*/g, '');
        s = s.replace(/[?]+$/, '');
        if (/\.$/.test(s) && !/\d\.$/.test(s)) s = s.replace(/\.+$/, '');
        s = s.replace(/\s+\([^)]*(unverified|stale|maybe|copied|already changed|mobile|home|work|cell)[^)]*\)\s*$/i, '');
        s = s.replace(/\s{2,}/g, ' ').trim();
        if (s.length > 1 && /^["'].*["']$/.test(s)) s = s.slice(1, -1).trim();
        return s;
    }

    function cpLooksLikeTypeLabel(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (!s) return false;
        if (CP_TYPE_LABEL.test(s)) return true;
        if (CP_NAME_STOP.test(s) && s.split(' ').length <= 4) return true;
        return false;
    }

    function cpLooksLikePerson(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (s.length < 4 || s.length > 90) return false;
        if (/[@:/\\]|https?/i.test(s)) return false;
        if (/\d{3,}/.test(s)) return false;
        if (cpLooksLikeTypeLabel(s)) return false;
        if (/\b(shares the|unknown|unverified|possibly)\b/i.test(s)) return false;
        const words = s.split(' ');
        if (words.length < 2 || words.length > 4) return false;
        if (words.some(function (w) { return w.replace(/[.'’\-]/g, '').length < 2; })) return false;
        if (words.length === 2 && words.every(function (w) { return w.length < 4; })) return false;
        if (!words.every(function (w) {
            return /^[\p{L}][\p{L}'’. -]{0,38}[\p{L}.]?$/u.test(w);
        })) return false;
        if (/\b(City|College|University|Polytechnic|Harbor|Heights|Northwest|State|Record|Profile|Card|Notes?|Device|Browser|Windows|Linux|Street|Strasse|Address)\b/i.test(s) && words.length <= 2) return false;
        return true;
    }

    function cpLooksLikePersonLabeled(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (cpLooksLikePerson(s)) return true;
        if (s.length < 2 || s.length > 80) return false;
        if (cpLooksLikeTypeLabel(s) || /[\d@:/\\]/.test(s)) return false;
        const words = s.split(' ');
        if (words.length < 1 || words.length > 4) return false;
        return words.every(function (w) {
            return /^[\p{L}][\p{L}'’. -]{1,58}[\p{L}.]?$/u.test(w) && w.replace(/[.'’\-]/g, '').length >= 2;
        });
    }

    function cpLooksLikeHandle(value, loose) {
        const s = String(value || '').replace(/^@/, '').trim();
        if (s.length < (loose ? 2 : 3) || s.length > 40) return false;
        if (/\s/.test(s) || /@/.test(s)) return false;
        if (/\.(com|net|org|edu|gov|io|ru|me|co)$/i.test(s)) return false;
        if (/\.(mp3|mp4|png|gif|html|exe|zip|pdf)$/i.test(s)) return false;
        if (CP_NOISE.test(s) || CP_WEAK_HANDLE.test(s)) return false;
        if (/^[A-Z]{3,}$/.test(s)) return false;
        if (/^\d+$/.test(s)) return false;
        if (!loose && s.length < 4 && !/\d/.test(s)) return false;
        return /^[A-Za-z][A-Za-z0-9._-]{1,39}$/.test(s);
    }

    function cpValidDay(y, m, d) {
        const yy = Number(y), mm = Number(m), dd = Number(d);
        if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
        if (yy < 1900 || yy > 2100) return false;
        const dt = new Date(Date.UTC(yy, mm - 1, dd));
        return dt.getUTCFullYear() === yy && dt.getUTCMonth() === mm - 1 && dt.getUTCDate() === dd;
    }

    function cpLooksLikeDate(value) {
        const s = String(value || '').trim().replace(/\s+\([^)]*\)\s*$/, '');
        let m = s.match(/^((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])$/);
        if (m) return cpValidDay(m[1], m[2], m[3]);
        m = s.match(/^(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})$/);
        if (m) return cpValidDay(m[3], m[2], m[1]);
        m = s.match(/^(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.]((?:19|20)\d{2})$/);
        if (m) return cpValidDay(m[3], m[1], m[2]);
        if (/^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+(?:19|20)\d{2}$/i.test(s)) return true;
        if (/^\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2}$/i.test(s)) return true;
        if (/^class of (?:19|20)\d{2}$/i.test(s)) return true;
        return false;
    }

    function cpLooksLikeTime(value) {
        const s = String(value || '').trim();
        if (/^00:00(?::00)?$/.test(s)) return false;
        return /^(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\s?[APap][Mm])?$/.test(s);
    }

    function cpLooksLikeEmail(value) {
        const s = String(value || '').trim();
        if (/\*/.test(s)) return false;
        return /^[A-Z0-9._%+\-]{2,}@[A-Z0-9.\-]+\.[A-Z]{2,24}$/i.test(s);
    }

    function cpLooksLikePhone(value, labeled) {
        const s = String(value || '').trim();
        const digits = s.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) return false;
        if (/^(\d)\1{8,}$/.test(digits)) return false;
        if (/\*/.test(s)) return false;
        if (/^(?:19|20)\d{8}$/.test(digits)) return false;
        if (digits.length === 15 && !labeled) return false;
        if (!labeled) {
            if (!/[+\-().\s]/.test(s)) return false;
            if (digits.length > 13 && !/^\+/.test(s)) return false;
        }
        return true;
    }

    function cpLooksLikeId(value) {
        const s = String(value || '').trim();
        if (s.length < 4 || s.length > 48) return false;
        if (/^\d{4,24}$/.test(s)) return true;
        if (/^\d{2,3}-\d{2,8}-\d{1,2}$/.test(s)) return true;
        if (/^\d{3}-\d{2}-\d{4}$/.test(s)) return true;
        if (/^[A-Z]{1,5}-[A-Z0-9-]{2,24}$/i.test(s)) return true;
        if (/^[0-9a-f]{2}(?::[0-9a-f]{2}){5}$/i.test(s)) return true;
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true;
        if (/^[0-9a-f]{8,32}$/i.test(s)) return true;
        return false;
    }

    function cpLooksLikeCrypto(value) {
        const s = String(value || '').trim();
        if (/^bc1[a-z0-9]{25,87}$/i.test(s)) return true;
        if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
        return false;
    }

    function cpDateISO(value) {
        const s = String(value || '').trim().replace(/\s+\([^)]*\)\s*$/, '');
        let m = s.match(/^((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])$/);
        if (m && cpValidDay(m[1], m[2], m[3])) return m[1] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
        m = s.match(/^(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})$/);
        if (m && Number(m[1]) > 12 && cpValidDay(m[3], m[2], m[1])) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
        m = s.match(/^(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.]((?:19|20)\d{2})$/);
        if (m && cpValidDay(m[3], m[1], m[2])) return m[3] + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
        m = s.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})$/i);
        if (m) {
            const mm = CP_MONTH[m[1].toLowerCase()];
            if (mm) return m[2] + '-' + mm + '-01';
        }
        m = s.match(/class of ((?:19|20)\d{2})/i);
        if (m) return m[1] + '-01-01';
        return '';
    }

    function cpStripUser(value) {
        let s = cpCleanValue(value);
        s = s.replace(/^\/?u\//i, '');
        s = s.replace(/^@/, '');
        s = s.replace(/^https?:\/\/(www\.)?(reddit\.com\/(?:user|u)|github\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|t\.me|vk\.com)\//i, '');
        s = s.replace(/\/+$/, '');
        return s;
    }

    function cpClassifyKey(key) {
        let k = cpNormKey(key);
        if (!k || CP_SKIP_KEY.test(k)) return null;
        if (CP_PLAT[k]) return { kind: 'username', platform: CP_PLAT[k] };
        if (/\btiktok/.test(k)) return { kind: 'username', platform: 'tiktok' };
        if (/\btelegram|\bтелеграм/.test(k)) return { kind: 'username', platform: 'telegram' };
        if (/\binstagram|\binsta\b/.test(k)) return { kind: 'username', platform: 'instagram' };
        if (/\bgithub\b/.test(k)) return { kind: 'username', platform: 'github' };
        if (/\bdiscord\b/.test(k)) return { kind: 'username', platform: 'discord' };
        if (/\breddit\b/.test(k)) return { kind: 'username', platform: 'reddit' };
        if (/^(вк|vkontakte|одноклассники|телеграм+а?|вайбер|тик ток)$/u.test(k)) {
            const map = { 'вк': 'vk', vkontakte: 'vk', 'одноклассники': 'ok', 'телеграм': 'telegram', 'телеграмма': 'telegram', 'вайбер': 'viber', 'тик ток': 'tiktok' };
            return { kind: 'username', platform: map[k] || k };
        }
        if (/почт|e ?mails?|mails?|correo/.test(k) && !/gmail/.test(k)) return { kind: 'email' };
        if (/\b(phone|tel|mobile|cell|telephone|номер|телефон)\b/.test(k)) return { kind: 'phone' };
        if (/^(password|passwd|pwd|passphrase|passcode|pass|парол)/.test(k) || k === 'pwd') return { kind: 'password' };
        if (/\b(dob|bday|born|birthday|birth date|date of birth|birth|рожден|naissance)\b/.test(k) || /дата рождения|fecha de nacimiento/.test(k)) return { kind: 'dob' };
        if (/^(alias|aka|handle|nickname|nick|nicks|aliases|subject|display name|main handle|old alias|other names?|alternate handle|seen usernames|nickname)$/.test(k)) return { kind: 'alias' };
        if (/^(fn|fio|фио|имя|nombre|nom|prenom|prénom|apellido|apellidos|cognome|nachname|vorname|фамилия|отчество|name|full name|real name|legal name|full legal name|person|possible name)$/u.test(k) || /\bfull legal\b/.test(k) || /^name /.test(k)) return { kind: 'name' };
        if (/^(username|user name|user|userid|user id|login|account)$/.test(k)) return { kind: 'username' };
        if (/\b(location|address|street|city|state|region|place|country|area|addr|adr|adresse|город|адрес|проживан)\b/.test(k) || /address$/.test(k) || /^adresse/.test(k)) return { kind: 'address' };
        if (/^(school|university|college|education|uni|employer|company|workplace|org|organization|job|школа)$/.test(k)) return { kind: 'company' };
        if (/^(occupation|field|role|title|trade|employment|job title)$/.test(k)) return { kind: 'occupation' };
        if (/^(os|os seen|laptop|desktop|computer os|operating system|user agent)$/.test(k) || /^os /.test(k) || k === 'browser') return { kind: 'os' };
        if (/^(created|created account|last checked|signup date|created at|id issue|id expiry|date|when|дата)$/.test(k)) return { kind: 'date' };
        if (/^(time|seen)$/.test(k)) return { kind: 'time' };
        if (/^(id|profile id|case ref|case id|ref|reference|dni|ssn|social|cuit|inn|инн|passport|паспорт|snils|снилс|imei|imsi|iccid|mac|bssid|uuid|orcid|badge|employee id|asset|asset tag|serial|serial number|dl|driver license|licence|tracking|pnr|flight|callsign|ham callsign|asn|did|android id|androidid|idfa|mmsi|imo)$/.test(k)) return { kind: 'id' };
        if (/банковск/.test(k)) return { kind: 'id' };
        if (/^(ip|ip address|ipv4|ipv6)$/.test(k)) return { kind: 'ip' };
        if (/^(url|website|site|web)$/.test(k)) return { kind: 'url' };
        if (/^(domain)$/.test(k)) return { kind: 'domain' };
        if (/^(vin)$/.test(k)) return { kind: 'vin' };
        if (/^(plate|license plate|licence plate|dominio)$/.test(k)) return { kind: 'plate' };
        if (/^(vehicle|car|make|model|brand|автомобил)/.test(k)) return { kind: 'vehicle' };
        if (/^(age|yrs?|years? old|лет)$/.test(k) || /\b(age|лет)\b/.test(k)) return { kind: 'age' };
        if (/^(timezone|time zone|tz)$/.test(k)) return { kind: 'timezone' };
        if (/crypto|wallet|btc|eth/.test(k)) return { kind: 'crypto' };
        if (/^(ssid)$/.test(k)) return { kind: 'id' };
        if (/^(geo|coordinates|what3words|plus code)$/.test(k)) return { kind: 'address' };
        if (/^(iban|swift|bic|lei|cusip|isin|ein|duns)$/.test(k)) return { kind: 'id' };
        return null;
    }

    function cpAccountFromUrl(url) {
        try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, '').toLowerCase();
            const path = u.pathname.replace(/\/+$/, '');
            const last = path.split('/').filter(Boolean).pop() || '';
            if (host === 'vk.com' || host === 'vk.ru') return { platform: 'vk', value: last || path.slice(1) };
            if (host === 't.me' || host === 'telegram.me') {
                const first = path.split('/').filter(Boolean)[0] || '';
                if (/^\+/.test(first) || /^\d/.test(first) || /^joinchat$/i.test(first)) return null;
                return { platform: 'telegram', value: first.replace(/^@/, '') };
            }
            if (host === 'tiktok.com') return { platform: 'tiktok', value: last.replace(/^@/, '') };
            if (host === 'ok.ru') return { platform: 'ok', value: last };
            if (host === 'instagram.com') return { platform: 'instagram', value: last.replace(/^@/, '') };
            if (host === 'github.com') return { platform: 'github', value: last };
            if (host === 'reddit.com' && /\/(u|user)\//i.test(path)) return { platform: 'reddit', value: last };
        } catch (error) {}
        return null;
    }

    function cpIsGenericKey(key) {
        const raw = String(key || '');
        const k = cpNormKey(raw);
        if (!k || CP_SKIP_KEY.test(k)) return true;
        if (/_(type|flag|status|count|index|ratio|season)$/i.test(raw)) return true;
        return false;
    }

    function cpLooksLikeJunkUrl(url) {
        try {
            const u = new URL(url);
            const h = u.hostname.replace(/^www\./, '').toLowerCase();
            if (/\.(example|invalid|test|localhost)$/.test(h)) return true;
            if (h === 'doxbin.com' || /\.doxbin\.com$/.test(h)) return true;
            if (h === 'web.archive.org' || h === 'archive.org') return true;
            if (h === 'calendar.google.com') return true;
            if (/(^|\.)google\.(com|[a-z]{2}|co\.[a-z]{2})$/.test(h) && /\/(search|maps\/contrib|calendar|url)/.test(u.pathname + u.search)) return true;
        } catch (error) {
            return true;
        }
        return false;
    }

    function cpTakePair(hits, key, value, note) {
        const raw = cpCleanValue(value);
        if (!raw) return;
        if (cpIsGenericKey(key)) return;
        if (cpNormKey(key) === 'n' && /;/.test(raw)) {
            const p = raw.split(';');
            const assembled = [p[1], p[0]].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(' ');
            if (cpLooksLikePerson(assembled)) cpPushHit(hits, 'name', assembled, note);
            return;
        }
        const cls = cpClassifyKey(key);
        if (!cls) {
            if (raw.indexOf('|') >= 0 || /(?:github|plate|imei|discord|reddit)\s*=/i.test(raw)) {
                String(raw).split(/\s*\|\s*/).forEach(function (part) {
                    const inner = cpSplitPair(part);
                    if (inner && inner.key !== key) cpTakePair(hits, inner.key, inner.value, note);
                });
            }
            if (cpLooksLikeDate(raw)) cpPushHit(hits, 'date', raw, note);
            else if (cpLooksLikeEmail(raw)) cpPushHit(hits, 'email', raw, note);
            else {
                const keyHandle = cpStripUser(key);
                if (!/_/.test(keyHandle) && cpLooksLikeHandle(keyHandle, true) && cpLooksLikePerson(raw)) {
                    cpPushHit(hits, 'alias', keyHandle, note);
                    cpPushHit(hits, 'name', raw, note);
                }
            }
            return;
        }
        let kind = cls.kind;
        let platform = cls.platform || '';
        const values = (kind === 'username' || kind === 'alias' || kind === 'email' || kind === 'name') && /[,;]/.test(raw) && raw.length < 220
            ? raw.split(/[,;]/).map(function (p) { return cpCleanValue(p); }).filter(Boolean)
            : [raw];
        values.forEach(function (item) {
            let v = item;
            let k = kind;
            let plat = platform;
            if (/^https?:\/\//i.test(v) && (k === 'username' || k === 'alias' || k === 'url' || k === 'domain')) {
                const cleanUrl = v.replace(/[),.;]+$/, '');
                if (!cpLooksLikeJunkUrl(cleanUrl)) cpPushHit(hits, 'url', cleanUrl, note);
                const acc = cpAccountFromUrl(v);
                if (acc && acc.value) {
                    k = 'username';
                    plat = acc.platform;
                    v = acc.value;
                } else if (k === 'url' || k === 'domain') {
                    return;
                }
            }
            if (k === 'username' || k === 'alias') v = cpStripUser(v);
            if (k === 'email' && !cpLooksLikeEmail(v)) return;
            if (k === 'phone' && !cpLooksLikePhone(v, true)) return;
            if (k === 'date') {
                if (cpLooksLikeTime(v) && !cpLooksLikeDate(v)) k = 'time';
                else if (!cpLooksLikeDate(v) && !cpDateISO(v)) return;
            }
            if (k === 'time' && !cpLooksLikeTime(v)) return;
            if (k === 'dob') {
                v = v.replace(/\s+\([^)]*\)\s*$/, '');
                if (!cpLooksLikeDate(v) && !/\d/.test(v)) return;
            }
            if (k === 'id') {
                if (/\s/.test(v) && /^\d/.test(v)) v = v.split(/\s+/)[0];
                if (!cpLooksLikeId(v) && !/^[A-Z0-9:+._-]{3,24}$/i.test(v) && !/^did:/i.test(v)) return;
                if (/^(xfinitywifi|netgear|linksys|default|wifi|guest|androidap)$/i.test(v)) return;
            }
            if (k === 'address') {
                if (/^(?:\d+(?:\.\d+)?)$/.test(v)) return;
                if (/^(workplace|location|unknown|tbd|none|n\/a)$/i.test(v)) return;
                if (/^[A-Za-z_]+\/[A-Za-z_]+$/.test(v)) k = 'timezone';
            }
            if (k === 'age') {
                const n = v.match(/\d{1,3}/);
                if (!n || Number(n[0]) < 1 || Number(n[0]) > 120) return;
                v = n[0];
            }
            if (k === 'os' && /Mozilla\//i.test(v)) return;
            if (k === 'name') {
                if (cpLooksLikePerson(v) || cpLooksLikePersonLabeled(v)) {
                    /* keep */
                } else if (v.length >= 4 && !/\d/.test(v) && !/\s/.test(v) && cpLooksLikeHandle(v, true)) {
                    k = 'alias';
                } else {
                    return;
                }
            }
            if (k === 'alias' && !cpLooksLikeHandle(v, true) && !cpLooksLikePerson(v)) return;
            if (k === 'username' && !cpLooksLikeHandle(v, true) && !/^\d{4,}$/.test(v) && plat !== 'vk') return;
            if ((k === 'username' || k === 'alias') && CP_NOISE.test(v)) return;
            if (k === 'crypto' && !cpLooksLikeCrypto(v) && !/^0x[a-fA-F0-9]{40,64}$/.test(v) && !/^bc1/i.test(v)) return;
            if (k === 'domain') {
                v = v.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
                if (!/\./.test(v)) return;
            }
            if ((k === 'username' || k === 'alias') && /@/.test(v) && /\./.test(v.split('@')[1] || '')) {
                k = 'email';
                plat = '';
                if (!cpLooksLikeEmail(v)) return;
            }
            if (!v || CP_JUNK_VAL.test(v)) return;
            cpPushHit(hits, k, v, note, plat);
        });
    }

    function cpSplitPair(line) {
        let s = String(line || '').trim();
        if (!s || s.length > 800) return null;
        if (/^#\s*skip\b/i.test(s) || /^\/\/\s*seen\b/i.test(s)) return null;
        if (/^[=\-#*_/~]{3,}$/.test(s)) return null;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s)) return null;
        if (/^\[(?:\?|\+|-)\]/.test(s)) return null;
        if (/^\[(?:user@|root@)/i.test(s) || /\$\s+cat\s+/i.test(s)) return null;
        s = s.replace(/^[^\p{L}\p{N}@\/]+/u, '');
        if (/^\/\//.test(s) || /^#\s*skip\b/i.test(s) || /^decoy\b/i.test(s)) return null;
        s = s.replace(/^[-*+>]+(?:\s+)/, '');
        s = s.replace(/^#{1,6}\s+/, '');
        if (/^(?:user@|root@)/i.test(s)) return null;
        if (/^\|?\s*-{2,}\s*\|/.test(s)) return null;
        if (/^\|/.test(s)) {
            const cells = s.split('|').map(function (c) { return c.trim(); }).filter(function (c) {
                return c && !/^:?-{2,}:?$/.test(c);
            });
            if (cells.length >= 2 && !/^(type|value|key|field)$/i.test(cells[0])) {
                return { key: cells[0], value: cells.slice(1).join(' | ') };
            }
            return null;
        }
        let m = s.match(/^([A-Za-z][\w .-]{0,48})(?:;[^=:\n]{0,80})?\s*:\s*(.+)$/);
        if (m && !/^(BEGIN|END|VERSION)$/i.test(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^[*`"_]*([\p{L}][\p{L}\p{N} ._/-]{0,48}?)[*`"_]*\s*\??\s*(?:\.{2,}\s*)?(?::{1,3}|={1,2}|-{1,2}>|→|=>)\s*(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N} ._/-]{0,40})\s{2,}(\S.*)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^((?:[\p{L}][\p{L}'’.-]*\s+){0,2}[\p{L}][\p{L}'’.-]{1,32})\s+([^\s].{0,180})$/u);
        if (m && cpClassifyKey(m[1]) && !/^[\/—–]/.test(m[2]) && !/^(is|was|were|are|the|a|an|to|of|and)\b/i.test(m[2]) && m[2].split(/\s+/).length <= 14) {
            return { key: m[1], value: m[2] };
        }
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,32})\?\s+(.+)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,40})\s+\/\s+(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([A-Za-z][A-Za-z0-9._-]{2,32})\s+[—–]\s+(?:possibly\s+)?(.+)$/i);
        if (m) return { key: 'alias', value: m[1], extra: m[2] };
        return null;
    }

    function cpScanPairs(hits, text, note) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const pair = cpSplitPair(line);
            if (!pair) continue;
            let val = pair.value;
            const cls = cpClassifyKey(pair.key);
            if (cls && cls.kind === 'address' && !String(val).trim()) {
                const extra = [];
                while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !cpSplitPair(lines[i + 1].trim())) {
                    extra.push(lines[++i].trim());
                }
                val = extra.join(', ');
            }
            cpTakePair(hits, pair.key, val, note);
            if (pair.extra) {
                const extra = cpCleanValue(String(pair.extra).replace(/^possibly\s+/i, '').replace(/\.+$/, ''));
                if (cpLooksLikePerson(extra)) cpPushHit(hits, 'name', extra, note);
            }
        }
    }

    function cpScanPatterns(hits, text, note) {
        const src = String(text || '');
        if (!src) return;
        const email = src.match(/[A-Z0-9._%+\-]{2,}@[A-Z0-9.\-]+\.[A-Z]{2,24}/gi) || [];
        email.forEach(function (v) {
            if (cpLooksLikeEmail(v)) cpPushHit(hits, 'email', v, note);
        });
        const url = src.match(/\bhttps?:\/\/[^\s<>"'`]+/gi) || [];
        url.forEach(function (v) {
            const clean = v.replace(/[),.;]+$/, '');
            if (cpLooksLikeJunkUrl(clean)) return;
            cpPushHit(hits, 'url', clean, note);
            const acc = cpAccountFromUrl(clean);
            if (acc && acc.value && (cpLooksLikeHandle(acc.value, true) || /^(id)?\d+$/i.test(acc.value))) {
                cpPushHit(hits, 'username', acc.value, note, acc.platform);
            }
        });
        const tme = src.match(/\bt\.me\/([A-Za-z][A-Za-z0-9_]{3,32})\b/gi) || [];
        tme.forEach(function (v) {
            const h = v.replace(/^t\.me\//i, '');
            if (cpLooksLikeHandle(h, true)) cpPushHit(hits, 'username', h, note, 'telegram');
        });
        const ip = src.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g) || [];
        ip.forEach(function (v) {
            if (/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(v)) return;
            if (/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(v)) return;
            cpPushHit(hits, 'ip', v, note);
        });
        const ipv6 = src.match(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f:.]+\b/gi) || [];
        ipv6.forEach(function (v) {
            if (/::/.test(v) && v.length >= 10) cpPushHit(hits, 'ip', v, note);
        });
        const phone = src.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g) || [];
        phone.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const phoneUs = src.match(/\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g) || [];
        phoneUs.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const reddit = src.match(/\b\/?u\/[A-Za-z0-9_-]{3,32}\b/g) || [];
        reddit.forEach(function (v) {
            if (/\b(?:GET|POST|PUT|HEAD|DELETE)\s+\//i.test(src) && new RegExp('\\b(?:GET|POST) /u/' + cpStripUser(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(src)) return;
            cpPushHit(hits, 'username', cpStripUser(v), note, 'reddit');
        });
        const discord = src.match(/\b[A-Za-z][A-Za-z0-9._-]{2,31}#\d{4}\b/g) || [];
        discord.forEach(function (v) { cpPushHit(hits, 'username', v, note, 'discord'); });
        const at = src.match(/(^|[^\w])@([A-Za-z][A-Za-z0-9._]{2,31})\b/g) || [];
        at.forEach(function (v) {
            const h = cpStripUser(v.replace(/^[^@]+/, ''));
            if (!cpLooksLikeHandle(h)) return;
            if (new RegExp('@' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':').test(src)) return;
            cpPushHit(hits, 'username', h, note);
        });
        const seenT = src.match(/\bseen\s+((?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)/gi) || [];
        seenT.forEach(function (v) {
            const t = v.replace(/^seen\s+/i, '');
            if (cpLooksLikeTime(t)) cpPushHit(hits, 'time', t, note);
        });
        const btc = src.match(/\bbc1[a-z0-9]{25,87}\b/gi) || [];
        btc.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const eth = src.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
        eth.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const ids = src.match(/\b(?:EMP|AST|SF|NT|VT|FI|VN|EL|ID)-[A-Z0-9]{2,10}\b/g) || [];
        ids.forEach(function (v) { cpPushHit(hits, 'id', v, note); });
        String(src).split('\n').forEach(function (line) {
            const m = String(line).match(/^\s*(?:[-*+]|\d+[.)])?\s*[`*_]*((?:19|20)\d{2}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[./](?:0?[1-9]|1[0-2])[./](?:19|20)\d{2})\b/);
            if (m && cpLooksLikeDate(m[1])) cpPushHit(hits, 'date', m[1], note);
        });
        const ages = src.match(/\b(?:age\s*[:=]?\s*)?(\d{1,3})\s*(?:years?\s+old|yrs?\.?\s*old|лет)\b/gi) || [];
        ages.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
        const ageEq = src.match(/\bage\s*[:=]\s*(\d{1,3})\b/gi) || [];
        ageEq.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
    }

    function cpScanEmbeddedJson(hits, text, note) {
        const src = String(text || '');
        if (src.indexOf('{') < 0) return;
        let n = 0;
        for (let i = 0; i < src.length && n < 12; i++) {
            if (src.charAt(i) !== '{') continue;
            let depth = 0;
            let j = i;
            let inStr = false;
            let esc = false;
            for (; j < src.length && j - i < 80000; j++) {
                const c = src.charAt(j);
                if (inStr) {
                    if (esc) esc = false;
                    else if (c === '\\') esc = true;
                    else if (c === '"') inStr = false;
                    continue;
                }
                if (c === '"') inStr = true;
                else if (c === '{') depth += 1;
                else if (c === '}') {
                    depth -= 1;
                    if (depth === 0) {
                        try {
                            cpWalkJson(hits, JSON.parse(src.slice(i, j + 1)), '');
                            n += 1;
                            i = j;
                        } catch (error) {}
                        break;
                    }
                }
            }
        }
    }

    function cpLooksLikeLogLine(line) {
        return /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ \S+ \[[^\]]+\] "[A-Z]+ /i.test(String(line || '').trim());
    }

    function cpLooksLikeArtLine(line) {
        const s = String(line || '');
        const useful = (s.match(/[\p{L}\p{N}]/gu) || []).length;
        if (useful >= 8) return false;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s) && useful < 6) return true;
        if (s.length >= 50) {
            const noisy = (s.match(/[#%*=_\-|:+~.,;\\/<>]/g) || []).length;
            if (useful < 10 && noisy / s.length > 0.42) return true;
        }
        return false;
    }

    function cpStripArt(line) {
        return String(line || '')
            .replace(/[█░▓▀▄■□╔╗╚╝║╠╣═┌┐└┘│┬┴┼]/g, ' ')
            .replace(/[»↳]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function cpLooksLikeAddressLine(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (s.length < 12 || s.length > 140) return false;
        if (/https?:/i.test(s) || cpLooksLikeEmail(s)) return false;
        if (!/\d/.test(s)) return false;
        if (/(улиц|проспект|бульвар|переулок|\bдом\b|\bул\.|street|\bst\.|\bave\b|avenue|\broad\b|\brd\.|\bway\b|drive|\bdr\.|\blane|\bln\.|\bblvd\b|\brue\b|strasse|\bplaza\b|\bcourt\b|\bapt\b|\bsuite\b)/i.test(s)) return true;
        if (/^\d{5,6}\s*,/.test(s)) return true;
        return /\d{1,6}\s+[\p{L}].+\b(way|street|ave|road|drive|lane|blvd|court|улиц)/iu.test(s);
    }

    function cpPrepareText(text) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const logLines = [];
        const kept = [];
        lines.forEach(function (line) {
            if (cpLooksLikeArtLine(line)) return;
            if (cpLooksLikeLogLine(line)) {
                logLines.push(line);
                return;
            }
            kept.push(cpStripArt(line));
        });
        return {
            signals: kept.join('\n'),
            logLines: logLines,
            dropLogs: logLines.length >= 12
        };
    }

    function cpScanLogLines(hits, lines, note) {
        if (!lines || !lines.length || lines.length >= 12) return;
        lines.forEach(function (line) {
            const m = String(line).trim().match(/^((?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ (\S+) \[/);
            if (!m) return;
            if (!/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(m[1]) && !/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(m[1])) {
                cpPushHit(hits, 'ip', m[1], note);
            }
            if (m[2] && m[2] !== '-' && cpLooksLikeHandle(m[2], true)) cpPushHit(hits, 'username', m[2], note);
        });
    }

    function cpScanStandalone(hits, text, note) {
        String(text || '').split('\n').forEach(function (line) {
            const s = String(line || '').trim();
            if (!s || s.length > 140 || /^https?:/i.test(s) || cpSplitPair(s)) return;
            if (cpLooksLikeDate(s)) {
                const y = Number((s.match(/(?:19|20)\d{2}/) || [])[0]);
                if (y >= 1920 && y <= 2018) cpPushHit(hits, 'dob', s, note);
                else if (y >= 2019) cpPushHit(hits, 'date', s, note);
                return;
            }
            const titled = s.split(/\s+/);
            const nameCase = titled.length >= 2 && titled.every(function (w) {
                const core = w.replace(/[.'’-]/g, '');
                if (!core) return false;
                return core === core.toUpperCase() || /^[\p{Lu}][\p{Ll}'’-]*$/u.test(w) || /^[\p{Lu}]+$/u.test(core);
            });
            if (nameCase && !/[.?!]$/.test(s) && !/^(no|the|a|an|this|that|not)\b/i.test(s) && cpLooksLikePerson(s)) {
                cpPushHit(hits, 'name', s.replace(/\s+/g, ' '), note);
            } else if (cpLooksLikeAddressLine(s)) cpPushHit(hits, 'address', s, note);
        });
    }

    function cpScanAll(hits, text, note) {
        const prepared = cpPrepareText(text);
        cpScanEmbeddedJson(hits, prepared.signals, note);
        cpScanPairs(hits, prepared.signals, note);
        cpScanStandalone(hits, prepared.signals, note);
        cpScanPatterns(hits, prepared.signals, note);
        cpScanLogLines(hits, prepared.logLines, note);
    }

    function cpParseCsv(text, sep) {
        const rows = [];
        let row = [];
        let cell = '';
        let q = false;
        const delim = sep || ',';
        const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (q) {
                if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
                else if (ch === '"') q = false;
                else cell += ch;
            } else if (ch === '"') q = true;
            else if (ch === delim) { row.push(cell); cell = ''; }
            else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
            else cell += ch;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); }
        return rows.filter(function (r) { return r.some(function (c) { return String(c).trim(); }); });
    }

    function cpWalkJson(hits, val, path) {
        if (val == null) return;
        if (typeof val !== 'object') {
            const seg = String(path || '').split('.').pop().replace(/\[\d+\]/g, '');
            if (/^(timestamp|type|version|metadata|label|scatter|kind|category)$/i.test(seg)) return;
            if (/^Mozilla\//i.test(String(val))) return;
            cpTakePair(hits, seg, String(val), 'json');
            if (cpLooksLikeEmail(String(val)) || /^https?:\/\//i.test(String(val)) || /^\+?\d[\d\s().-]{8,}$/.test(String(val))) {
                cpScanPatterns(hits, String(val), 'json');
            }
            return;
        }
        if (Array.isArray(val)) {
            val.forEach(function (item, i) {
                cpWalkJson(hits, item, path ? path + '[' + i + ']' : '[' + i + ']');
            });
            return;
        }
        if ((val.prenom || val.firstname || val.first_name || val.given_name) && (val.nom || val.lastname || val.last_name || val.family_name || val.apellido)) {
            const full = cpCleanValue(String(val.prenom || val.firstname || val.first_name || val.given_name) + ' ' + String(val.nom || val.lastname || val.last_name || val.family_name || val.apellido));
            if (cpLooksLikePerson(full) || cpLooksLikePersonLabeled(full)) cpPushHit(hits, 'name', full, 'json');
        }
        if ((val.label != null || val.key != null) && val.value != null && typeof val.value !== 'object') {
            cpTakePair(hits, String(val.key != null ? val.key : val.label), String(val.value), 'json');
        }
        if (val.service && (val.username || val.handle || val.user || val.id)) {
            cpTakePair(hits, String(val.service), String(val.username || val.handle || val.user || val.id), 'json');
        }
        Object.keys(val).forEach(function (k) {
            if (/^(label|key|value|type|scatter)$/i.test(k) && val.value != null && (val.label != null || val.key != null)) return;
            cpWalkJson(hits, val[k], path ? path + '.' + k : k);
        });
    }

    function cpScanJsRecord(hits, src) {
        const re = /(?:^|[{\s,])([A-Za-z_]\w{1,32})\s*:\s*["']([^"']{1,160})["']/g;
        let m;
        while ((m = re.exec(String(src || '')))) {
            cpTakePair(hits, m[1], m[2], 'script');
        }
    }

    function cpDecodeHtml(text) {
        return String(text || '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'");
    }

    function cpStripMarkup(raw) {
        return cpDecodeHtml(String(raw || '')
            .replace(/<script[\s\S]*?<\/script>/gi, '\n')
            .replace(/<style[\s\S]*?<\/style>/gi, '\n')
            .replace(/<!--[\s\S]*?-->/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|h[1-6]|tr|section|pre|blockquote)>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim());
    }

    function cpHtml(raw, hits) {
        const src = String(raw || '');
        const scripts = src.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
        scripts.forEach(function (block) {
            const inner = block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
            cpScanJsRecord(hits, inner);
            cpScanAll(hits, inner, 'script');
        });
        const df = /data-field=["']([^"']+)["'][^>]*>([^<]*)/gi;
        let m;
        while ((m = df.exec(src))) cpTakePair(hits, m[1], cpDecodeHtml(m[2]), 'html');
        const mail = /mailto:([^"'>\s]+)/gi;
        while ((m = mail.exec(src))) cpPushHit(hits, 'email', decodeURIComponent(m[1]), 'html');
        const heads = /<h[1-6][^>]*>([^<]+)/gi;
        while ((m = heads.exec(src))) {
            const t = cpCleanValue(cpDecodeHtml(m[1]));
            if (CP_NOISE.test(t) || /^(profile card|data record|person record|signal frame)$/i.test(t)) {
                /* section title */
            } else if (cpLooksLikeHandle(t)) {
                cpPushHit(hits, 'alias', t, 'heading');
            } else if (cpLooksLikePerson(t)) {
                cpPushHit(hits, 'name', t, 'heading');
            }
        }
        cpScanAll(hits, cpStripMarkup(src), 'html');
        return { text: cpStripMarkup(src) };
    }

    function cpXml(raw, hits) {
        const src = String(raw || '');
        const tag = /<([A-Za-z_][\w:.-]*)\b[^>]*>([^<]{1,200})<\/\1>/g;
        let m;
        while ((m = tag.exec(src))) cpTakePair(hits, m[1].split(':').pop(), m[2], 'xml');
        const attr = /\b([A-Za-z_][\w:.-]*)=["']([^"']{1,200})["']/g;
        while ((m = attr.exec(src))) {
            if (/^(class|style|xmlns|id|width|height|type)$/i.test(m[1])) continue;
            cpTakePair(hits, m[1], m[2], 'xml');
        }
        cpScanAll(hits, cpStripMarkup(src), 'xml');
        return { text: cpStripMarkup(src) };
    }

    function cpJson(raw, hits) {
        let parsed = null;
        let error = '';
        try { parsed = JSON.parse(raw); }
        catch (e) { error = e.message || 'Invalid JSON'; }
        if (parsed != null) cpWalkJson(hits, parsed, '');
        else cpScanAll(hits, raw, 'json');
        return { error: error };
    }

    function cpMd(raw, hits) {
        cpScanAll(hits, raw, 'markdown');
        return { text: raw };
    }

    function cpCsv(raw, hits) {
        const first = String(raw || '').split(/\r?\n/, 1)[0] || '';
        const sep = first.split('\t').length > first.split(',').length ? '\t' : ',';
        const grid = cpParseCsv(raw, sep);
        if (grid.length >= 2) {
            const head = grid[0].map(function (c) { return String(c).trim(); });
            grid.slice(1).forEach(function (row) {
                row.forEach(function (cell, i) {
                    const key = head[i] || '';
                    if (key) cpTakePair(hits, key, cell, 'csv');
                    else cpScanPatterns(hits, cell, 'csv');
                });
            });
        } else {
            grid.forEach(function (row) {
                row.forEach(function (cell) { cpScanAll(hits, cell, 'csv'); });
            });
        }
        return {};
    }

    function cpTxt(raw, hits) {
        cpScanAll(hits, raw, 'text');
        return { text: raw };
    }

    function cpFinishHits(hits) {
        const plat = {};
        hits.forEach(function (h) {
            if (h.platform) plat[h.value.toLowerCase()] = 1;
        });
        const kept = hits.filter(function (h) {
            if (h.kind === 'name' && (cpLooksLikeTypeLabel(h.value) || !cpLooksLikePerson(h.value) && !cpLooksLikePersonLabeled(h.value))) return false;
            if (h.kind === 'url' && cpLooksLikeJunkUrl(h.value)) return false;
            if (h.platform || h.kind !== 'username') return true;
            return !plat[h.value.toLowerCase()];
        });
        kept.sort(function (a, b) {
            const ia = CP_ORDER.indexOf(a.kind);
            const ib = CP_ORDER.indexOf(b.kind);
            if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
            const pa = a.platform || '';
            const pb = b.platform || '';
            if (pa !== pb) return pa < pb ? -1 : 1;
            return a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1;
        });
        return kept;
    }

    function harvestOne(file, raw) {
        const kind = cpKind(file.name, file.type);
        const hits = [];
        hits._seen = {};
        if (kind === 'html') cpHtml(raw, hits);
        else if (kind === 'xml') cpXml(raw, hits);
        else if (kind === 'json') cpJson(raw, hits);
        else if (kind === 'md') cpMd(raw, hits);
        else if (kind === 'csv') cpCsv(raw, hits);
        else cpTxt(raw, hits);
        delete hits._seen;
        delete hits._phone;
        return {
            id: uid('cp'),
            name: file.name || 'untitled',
            kind: kind,
            size: file.size || raw.length,
            raw: raw,
            hits: cpFinishHits(hits)
        };
    }

    function mergeHarvesterHits(files) {
        const hits = [];
        hits._seen = {};
        files.forEach(function (file) {
            (file.hits || []).forEach(function (hit) {
                cpPushHit(hits, hit.kind, hit.value, hit.note || file.name, hit.platform);
            });
        });
        delete hits._seen;
        delete hits._phone;
        return cpFinishHits(hits);
    }

    function setHarvesterBusy(on, title, hint) {
        cpBusy = !!on;
        const load = $('harvesterLoad');
        const drop = $('harvesterDrop');
        if (load) {
            load.hidden = !on;
            const t = $('harvesterLoadTitle');
            const h = $('harvesterLoadHint');
            if (t && title) t.textContent = title;
            if (h && hint) h.textContent = hint;
        }
        if (drop) drop.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    function hideHarvesterDownload() {
        const menu = $('harvesterDownloadMenu');
        if (menu) menu.hidden = true;
    }

    function harvesterSplitPct() {
        const n = Number(harvesterState().split);
        return isFinite(n) ? Math.min(78, Math.max(22, n)) : 50;
    }

    function applyHarvesterSplit(pct, persist) {
        const n = Math.round(Math.min(78, Math.max(22, Number(pct))) * 10) / 10;
        harvesterState().split = n;
        document.querySelectorAll('.cp-diff:not(.is-single)').forEach(function (el) {
            el.style.setProperty('--cp-split', n + '%');
            const g = el.querySelector('.cp-split-gutter');
            if (g) {
                g.setAttribute('aria-valuenow', String(Math.round(n)));
                g.setAttribute('aria-valuetext', Math.round(n) + '% original');
            }
        });
        if (persist) schedulePersist();
    }

    function splitPctFromPointer(gutter, clientX) {
        const body = gutter.closest('.cp-diff-body') || gutter.parentNode;
        const rect = body.getBoundingClientRect();
        if (!rect.width) return harvesterSplitPct();
        const minPx = Math.min(160, rect.width * 0.22);
        const x = Math.min(rect.width - minPx, Math.max(minPx, clientX - rect.left));
        return (x / rect.width) * 100;
    }

    function harvesterView() {
        const view = harvesterState().view;
        return view === 'original' || view === 'stripped' ? view : 'split';
    }

    function syncCpModeThumb(instant) {
        const wrap = $('harvesterCount');
        if (!wrap) return;
        let thumb = wrap.querySelector('.cp-mode-thumb');
        if (!thumb) {
            thumb = document.createElement('span');
            thumb.className = 'cp-mode-thumb';
            thumb.setAttribute('aria-hidden', 'true');
            wrap.insertBefore(thumb, wrap.firstChild);
            instant = true;
        }
        const on = wrap.querySelector('[aria-checked="true"]') || wrap.querySelector('.is-on');
        if (!on) return;
        const w = on.offsetWidth;
        if (!(w > 0)) return;
        const snap = instant || !cpModeThumbReady || reduceMotion();
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.left = on.offsetLeft + 'px';
        thumb.style.width = w + 'px';
        cpModeThumbReady = true;
        if (snap && !reduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function setHarvesterView(view) {
        const next = view === 'original' || view === 'stripped' ? view : 'split';
        const st = harvesterState();
        const prev = harvesterView();
        if (prev === next) {
            harvesterSummary();
            return;
        }
        const order = ['split', 'original', 'stripped'];
        st.view = next;
        renderHarvester({ slide: order.indexOf(next) - order.indexOf(prev) });
        schedulePersist();
    }

    function harvesterSummary() {
        const st = harvesterState();
        const n = (st.files || []).length;
        const el = $('harvesterCount');
        const view = harvesterView();
        if (el) {
            el.querySelectorAll('[data-cp-view]').forEach(function (btn) {
                const on = btn.getAttribute('data-cp-view') === view;
                btn.setAttribute('aria-checked', on ? 'true' : 'false');
                btn.classList.toggle('is-on', on);
            });
            requestAnimationFrame(function () { syncCpModeThumb(false); });
        }
        const dl = $('harvesterDownloadBtn');
        const cpy = $('harvesterCopyBtn');
        const ins = $('harvesterInspectBtn');
        const clr = $('harvesterClearBtn');
        const on = !!(st.ready && n);
        if (dl) dl.disabled = !on;
        if (cpy) cpy.disabled = !on;
        if (ins) ins.disabled = !on;
        if (clr) clr.disabled = !on;
    }

    function cpEsc(text) {
        return esc(text);
    }

    function cpHitLabel(hit) {
        if (hit.platform) {
            const p = hit.platform;
            return p === 'github' ? 'GitHub' : p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1);
        }
        return CP_KIND_LABEL[hit.kind] || hit.kind;
    }

    function cpHitLine(hit) {
        return cpHitLabel(hit) + ': ' + hit.value;
    }

    function cpTokenAt(line, at, len) {
        const src = String(line || '');
        const left = at > 0 ? src.charAt(at - 1) : '';
        const right = at + len < src.length ? src.charAt(at + len) : '';
        const word = /[A-Za-z0-9_.-]/;
        if (left && word.test(left)) return false;
        if (right && word.test(right)) return false;
        return true;
    }

    function cpHasHint(line, hint) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const h = String(hint || '').toLowerCase();
        if (h.length < 2) return false;
        let from = 0;
        let at;
        while ((at = low.indexOf(h, from)) >= 0) {
            const left = at === 0 || !/[A-Za-z0-9]/.test(src.charAt(at - 1));
            const right = at + h.length >= src.length || !/[A-Za-z0-9]/.test(src.charAt(at + h.length));
            if (left && right) return true;
            from = at + 1;
        }
        return false;
    }

    function cpHitHints(hit) {
        const hints = [];
        function add(s) {
            const t = String(s || '').toLowerCase().trim();
            if (t.length >= 2 && hints.indexOf(t) < 0) hints.push(t);
        }
        add(cpHitLabel(hit));
        if (hit.platform) add(hit.platform);
        if (hit.kind && hit.kind !== 'username') add(hit.kind);
        const extra = {
            email: ['e-mail', 'mail'],
            phone: ['tel', 'mobile', 'cell', 'telephone'],
            dob: ['dob', 'd.o.b', 'birthday', 'birth date', 'date of birth', 'born', 'birth'],
            address: ['location', 'city', 'addr'],
            alias: ['aka', 'nick', 'nickname'],
            name: ['full name', 'real name', 'display name', 'display_name', 'legal name'],
            domain: ['website', 'url', 'site'],
            date: ['timestamp', 'created']
        };
        (extra[hit.kind] || []).forEach(add);
        return hints;
    }

    function cpMarkInLine(line, value) {
        const src = String(line || '');
        const needle = String(value || '');
        if (!src || !needle) return cpEsc(src);
        const low = src.toLowerCase();
        const want = needle.toLowerCase();
        let from = 0;
        let at = -1;
        while ((from = low.indexOf(want, from)) >= 0) {
            if (cpTokenAt(src, from, needle.length)) {
                at = from;
                break;
            }
            from += 1;
        }
        if (at < 0) return '<span class="cp-x">' + cpEsc(src) + '</span>';
        const before = src.slice(0, at);
        const mid = src.slice(at, at + needle.length);
        const after = src.slice(at + needle.length);
        return (before ? '<span class="cp-x">' + cpEsc(before) + '</span>' : '') +
            '<span class="cp-keep">' + cpEsc(mid) + '</span>' +
            (after ? '<span class="cp-x">' + cpEsc(after) + '</span>' : '');
    }

    function cpHitsOnLine(line, hits, used) {
        const src = String(line || '');
        const low = src.toLowerCase();
        const tokenHits = [];
        hits.forEach(function (hit, i) {
            if (used[i]) return;
            const v = String(hit.value || '');
            if (v.length < 2) return;
            const want = v.toLowerCase();
            let from = 0;
            let at = -1;
            while ((from = low.indexOf(want, from)) >= 0) {
                if (cpTokenAt(src, from, v.length)) {
                    at = from;
                    break;
                }
                from += 1;
            }
            if (at < 0) return;
            const hinted = cpHitHints(hit).some(function (h) { return cpHasHint(src, h); });
            tokenHits.push({ i: i, hit: hit, at: at, len: v.length, hinted: hinted });
        });
        const hinted = tokenHits.filter(function (item) { return item.hinted; });
        const pool = hinted.length ? hinted : tokenHits;
        pool.sort(function (a, b) {
            if (b.len !== a.len) return b.len - a.len;
            return a.at - b.at;
        });
        const taken = [];
        const found = [];
        pool.forEach(function (item) {
            const overlap = taken.some(function (t) {
                return !(item.at + item.len <= t.at || t.at + t.len <= item.at);
            });
            if (overlap) return;
            taken.push(item);
            found.push(item);
        });
        found.sort(function (a, b) { return a.at - b.at; });
        return found;
    }

    function cpBuildSplit(raw, hits) {
        const lines = String(raw || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const list = hits || [];
        const used = [];
        const rows = [];
        let lnL = 0;
        let lnR = 0;
        lines.forEach(function (line) {
            lnL += 1;
            const matched = cpHitsOnLine(line, list, used);
            if (!matched.length) {
                rows.push({
                    lnum: lnL,
                    ltext: line,
                    lhtml: cpEsc(line),
                    lkind: 'del',
                    rnum: '',
                    rtext: '',
                    rhtml: '',
                    rkind: 'empty'
                });
                return;
            }
            matched.forEach(function (item, j) {
                used[item.i] = 1;
                lnR += 1;
                const right = cpHitLine(item.hit);
                const rightHtml = '<span class="cp-lab">' + cpEsc(cpHitLabel(item.hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(item.hit.value) + '</span>';
                if (j === 0) {
                    rows.push({
                        lnum: lnL,
                        ltext: line,
                        lhtml: cpMarkInLine(line, item.hit.value),
                        lkind: 'del',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                } else {
                    rows.push({
                        lnum: '',
                        ltext: '',
                        lhtml: '',
                        lkind: 'empty',
                        rnum: lnR,
                        rtext: right,
                        rhtml: rightHtml,
                        rkind: 'add'
                    });
                }
            });
        });
        list.forEach(function (hit, i) {
            if (used[i]) return;
            lnR += 1;
            const right = cpHitLine(hit);
            rows.push({
                lnum: '',
                ltext: '',
                lhtml: '',
                lkind: 'empty',
                rnum: lnR,
                rtext: right,
                rhtml: '<span class="cp-lab">' + cpEsc(cpHitLabel(hit)) + '</span><span class="cp-sep">: </span><span class="cp-val">' + cpEsc(hit.value) + '</span>',
                rkind: 'add'
            });
        });
        return rows;
    }

    function cpDiffCell(kind, num, html, sign) {
        const empty = kind === 'empty';
        const cls = empty ? 'cp-empty' : (kind === 'add' ? 'cp-add' : (kind === 'del' ? 'cp-del' : 'cp-ctx'));
        const numHtml = empty || num === '' ? '' : String(num);
        const signHtml = empty ? '' : '<span class="cp-sign" aria-hidden="true">' + sign + '</span>';
        const body = empty ? '' : '<span class="cp-line">' + (html || '') + '</span>';
        return '<td class="cp-num ' + cls + '">' + numHtml + '</td>' +
            '<td class="cp-signcol ' + cls + '">' + signHtml + '</td>' +
            '<td class="cp-code ' + cls + '">' + body + '</td>';
    }

    function cpCounts(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        let plus = 0;
        let minus = 0;
        rows.forEach(function (row) {
            if (row.lkind === 'del') minus += 1;
            if (row.rkind === 'add') plus += 1;
        });
        return { plus: plus, minus: minus, rows: rows };
    }

    function cpGutterText(raw) {
        const n = Math.max(1, String(raw || '').split('\n').length);
        let out = '';
        for (let i = 1; i <= n; i++) out += i + '\n';
        return out;
    }

    function renderEditor(file) {
        const i = file && file._i != null ? file._i : 0;
        const raw = String(file.raw || '');
        return '<div class="cp-editor-shell">' +
            '<pre class="cp-editor-gutter" aria-hidden="true">' + cpGutterText(raw) + '</pre>' +
            '<textarea class="cp-editor" data-cp-file="' + i + '" spellcheck="false" placeholder="Type or paste. Identifiers show on the right." aria-label="Edit ' + cpEsc(file.name || 'untitled.txt') + '">' +
            cpEsc(raw) + '</textarea></div>';
    }

    function renderStrippedBody(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) {
            return row.rkind === 'add';
        });
        if (!rows.length) {
            return '<div class="cp-strip-row cp-strip-empty">' +
                '<div class="cp-num cp-empty"></div><div class="cp-signcol cp-empty"></div>' +
                '<div class="cp-code cp-empty">No names, accounts, dates, or other identifiers in this file.</div></div>';
        }
        return rows.map(function (row, i) {
            return '<div class="cp-strip-row" style="--cp-i:' + i + '">' +
                '<div class="cp-num cp-add">' + row.rnum + '</div>' +
                '<div class="cp-signcol cp-add"><span class="cp-sign" aria-hidden="true">+</span></div>' +
                '<div class="cp-code cp-add"><span class="cp-line">' + (row.rhtml || '') + '</span></div>' +
                '</div>';
        }).join('');
    }

    function cpPaneCopySvg() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="13" rx="1.6"/><path d="M5 15V5a1.6 1.6 0 0 1 1.6-1.6H15"/></svg>';
    }

    function cpPaneLabel(file, side, label) {
        const i = file && file._i != null ? file._i : 0;
        const tip = 'Copy ' + label.toLowerCase();
        return '<div class="cp-pane-label">' +
            '<span class="cp-th-pip" aria-hidden="true"></span>' +
            '<span class="cp-pane-name">' + label + '</span>' +
            '<button type="button" class="cp-ico cp-pane-copy" data-cp-pane-copy="' + side + '" data-cp-file="' + i + '" data-tip="' + tip + '" aria-label="' + tip + '">' +
            cpPaneCopySvg() + '</button></div>';
    }

    function renderStrippedTable(file) {
        return cpPaneLabel(file, 'stripped', 'Stripped') +
            '<div class="cp-strip-rows">' + renderStrippedBody(file) + '</div>';
    }

    function renderSplitDiff(file) {
        const i = file && file._i != null ? file._i : 0;
        const c = cpCounts(file);
        return '<section class="cp-diff" data-cp-card="' + i + '" style="--cp-split:' + harvesterSplitPct() + '%" aria-label="Split view">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span></span>') +
            '<div class="cp-diff-body">' +
            '<div class="cp-orig-pane">' +
            cpPaneLabel(file, 'original', 'Original') +
            renderEditor(file) + '</div>' +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div>' +
            '<div class="cp-split-gutter" role="separator" aria-orientation="vertical" aria-label="Resize original and stripped" title="Drag to resize" aria-valuemin="22" aria-valuemax="78" aria-valuenow="' + Math.round(harvesterSplitPct()) + '" tabindex="0"></div>' +
            '</div></section>';
    }

    function cpFileChrome(file, statHtml) {
        const i = file && file._i != null ? file._i : 0;
        return '<header class="cp-diff-head">' +
            '<label class="cp-diff-file">' +
            '<svg class="cp-file-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4.5 1.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V6.207a1.5 1.5 0 0 0-.44-1.06L9.854 2.44A1.5 1.5 0 0 0 8.793 2H4.5v-.5ZM4 3a.5.5 0 0 1 .5-.5H8v2.5A1.5 1.5 0 0 0 9.5 6.5H12V13a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 13V3Zm8.146 2.5H9.5a.5.5 0 0 1-.5-.5V2.854L12.146 5.5Z"/></svg>' +
            '<input class="cp-file-name" data-cp-name="' + i + '" value="' + cpEsc(file.name || 'untitled.txt') + '" spellcheck="false" aria-label="File name"></label>' +
            '<span class="cp-diff-actions">' +
            '<button type="button" class="cp-copy-btn" data-cp-copy="' + i + '">Copy</button>' +
            (statHtml || '') +
            '</span></header>';
    }

    function cpMarkHitsInLine(line, matched) {
        const src = String(line || '');
        if (!matched.length) return cpEsc(src);
        const marks = matched.slice().sort(function (a, b) { return a.at - b.at; });
        let html = '';
        let cursor = 0;
        marks.forEach(function (item) {
            if (item.at < cursor) return;
            if (item.at > cursor) html += cpEsc(src.slice(cursor, item.at));
            html += '<span class="cp-keep">' + cpEsc(src.slice(item.at, item.at + item.len)) + '</span>';
            cursor = item.at + item.len;
        });
        if (cursor < src.length) html += cpEsc(src.slice(cursor));
        return html;
    }

    function renderOriginalDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const lines = String(file.raw || '').split('\n').length;
        return '<section class="cp-diff is-single is-original" data-cp-card="' + i + '" aria-label="Original document">' +
            cpFileChrome(file, '<span class="cp-diff-stat">' + lines + (lines === 1 ? ' line' : ' lines') + '</span>') +
            '<div class="cp-orig-pane">' +
            cpPaneLabel(file, 'original', 'Original') +
            renderEditor(file) + '</div></section>';
    }

    function renderStrippedDoc(file) {
        const i = file && file._i != null ? file._i : 0;
        const rows = cpBuildSplit(file.raw, file.hits || []).filter(function (row) { return row.rkind === 'add'; });
        return '<section class="cp-diff is-single is-stripped" data-cp-card="' + i + '" aria-label="Stripped document">' +
            cpFileChrome(file, '<span class="cp-diff-stat"><span class="cp-diff-plus">+' + rows.length + '</span></span>') +
            '<div class="cp-ext-pane">' + renderStrippedTable(file) + '</div></section>';
    }

    function renderHarvesterFile(file, i) {
        if (file) file._i = i;
        const view = harvesterView();
        if (view === 'original') return renderOriginalDoc(file);
        if (view === 'stripped') return renderStrippedDoc(file);
        return renderSplitDiff(file);
    }

    function renderHarvester(opts) {
        const drop = $('harvesterDrop');
        const result = $('harvesterResult');
        const st = harvesterState();
        harvesterSummary();
        if (!drop || !result) return;
        if (!st.ready || !(st.files || []).length) {
            drop.hidden = false;
            result.hidden = true;
            result.innerHTML = '';
            return;
        }
        drop.hidden = true;
        result.hidden = false;
        const reveal = cpReveal && !reduceMotion();
        cpReveal = false;
        const slide = opts && opts.slide && !reduceMotion() && !reveal;
        const slideClass = slide ? (opts.slide > 0 ? ' cp-slide-next' : ' cp-slide-prev') : '';
        result.innerHTML = '<div class="cp-stack' + (reveal ? ' cp-in' : '') + slideClass + '">' + (st.files || []).map(renderHarvesterFile).join('') + '</div>';
        if (reveal) {
            result.querySelectorAll('.cp-strip-row').forEach(function (row, i) {
                row.style.setProperty('--cp-i', String(i));
            });
        }
        applyHarvesterSplit(harvesterSplitPct(), false);
    }

    function syncHarvesterGutter(ta) {
        if (!ta) return;
        const g = ta.parentNode && ta.parentNode.querySelector('.cp-editor-gutter');
        if (!g) return;
        const next = cpGutterText(ta.value);
        if (g.textContent !== next) g.textContent = next;
        g.scrollTop = ta.scrollTop;
    }

    function patchHarvesterCard(index) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        file._i = index;
        const card = document.querySelector('[data-cp-card="' + index + '"]');
        if (!card) return;
        const view = harvesterView();
        const stat = card.querySelector('.cp-diff-stat');
        if (view === 'original') {
            const lines = String(file.raw || '').split('\n').length;
            if (stat) stat.textContent = lines + (lines === 1 ? ' line' : ' lines');
            return;
        }
        const c = cpCounts(file);
        if (view === 'stripped') {
            if (stat) stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span>';
        } else if (stat) {
            stat.innerHTML = '<span class="cp-diff-plus">+' + c.plus + '</span><span class="cp-diff-minus">−' + c.minus + '</span>';
        }
        const body = card.querySelector('.cp-strip-rows');
        if (body) body.innerHTML = renderStrippedBody(file);
    }

    function applyHarvesterEdit(index, raw) {
        const st = harvesterState();
        const prev = st.files && st.files[index];
        if (!prev) return;
        let text = String(raw == null ? '' : raw);
        if (text.length > CP_MAX) text = text.slice(0, CP_MAX);
        if (prev.raw === text) {
            patchHarvesterCard(index);
            return;
        }
        const next = harvestOne({ name: prev.name, type: prev.kind, size: text.length }, text);
        next.id = prev.id;
        next.kind = prev.kind || next.kind;
        next.name = prev.name;
        st.files[index] = next;
        st.hits = mergeHarvesterHits(st.files);
        st.at = new Date().toISOString();
        patchHarvesterCard(index);
        schedulePersist();
    }

    function onHarvesterEditorInput(ta) {
        const i = parseInt(ta.getAttribute('data-cp-file'), 10);
        if (isNaN(i)) return;
        syncHarvesterGutter(ta);
        clearTimeout(cpEditTimers[i]);
        cpEditTimers[i] = setTimeout(function () {
            applyHarvesterEdit(i, ta.value);
        }, 160);
    }

    function renameHarvesterFile(index, name) {
        const st = harvesterState();
        const file = st.files && st.files[index];
        if (!file) return;
        let next = String(name || '').trim() || 'untitled.txt';
        if (next.length > 120) next = next.slice(0, 120);
        if (file.name === next) return;
        file.name = next;
        st.at = new Date().toISOString();
        schedulePersist();
    }

    function newHarvesterFile(raw) {
        if (cpBusy) return;
        const text = String(raw || '');
        const harvested = harvestOne({ name: 'untitled.txt', type: 'text/plain', size: text.length }, text);
        const st = harvesterState();
        if (!Array.isArray(st.files)) st.files = [];
        st.files.push(harvested);
        st.hits = mergeHarvesterHits(st.files);
        st.ready = true;
        st.at = new Date().toISOString();
        if (st.view === 'stripped') st.view = 'split';
        hideHarvesterDownload();
        renderHarvester();
        schedulePersist();
        const editors = document.querySelectorAll('.cp-editor');
        const last = editors[editors.length - 1];
        if (last) {
            last.focus();
            const end = last.value.length;
            last.setSelectionRange(end, end);
        }
    }

    function readHarvesterFile(file) {
        return new Promise(function (resolve, reject) {
            if (file.size > CP_MAX) {
                reject(new Error(file.name + ' is larger than 2 MB'));
                return;
            }
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result || '')); };
            reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
            reader.readAsText(file);
        });
    }

    function ingestHarvesterFiles(list) {
        const files = Array.prototype.slice.call(list || []).filter(Boolean);
        if (!files.length || cpBusy) return;
        hideHarvesterDownload();
        setHarvesterBusy(true, 'Harvesting', 'Keeping names, accounts, dates — cutting the rest…');
        const started = Date.now();
        Promise.all(files.map(function (file) {
            return readHarvesterFile(file).then(function (raw) { return harvestOne(file, raw); });
        })).then(function (harvested) {
            const wait = Math.max(0, 520 - (Date.now() - started));
            setTimeout(function () {
                const st = harvesterState();
                st.files = harvested;
                st.hits = mergeHarvesterHits(harvested);
                st.ready = true;
                st.at = new Date().toISOString();
                setHarvesterBusy(false);
                cpReveal = true;
                renderHarvester();
                schedulePersist();
                if (window.OrbINTDone) window.OrbINTDone('File harvested', 'Names, dates, and accounts from that file are on the desk. The rest of the file stays in the harvest view.');
            }, wait);
        }).catch(function (error) {
            setHarvesterBusy(false);
            const drop = $('harvesterDrop');
            if (drop) {
                const strong = drop.querySelector('strong');
                if (strong) strong.textContent = error.message || 'Could not harvest that file';
            }
        });
    }

    function openHarvesterPicker() {
        const input = $('harvesterFile');
        if (input) input.click();
    }

    function clearHarvester() {
        if (cpBusy) return;
        const st = harvesterState();
        if (!st.ready && !(st.files || []).length) return;
        hideHarvesterDownload();
        st.files = [];
        st.hits = [];
        st.ready = false;
        st.at = '';
        const input = $('harvesterFile');
        if (input) input.value = '';
        const drop = $('harvesterDrop');
        if (drop) {
            const strong = drop.querySelector('strong');
            if (strong) strong.textContent = 'Drop or write a file.';
        }
        renderHarvester();
        schedulePersist();
    }

    function cpPlainLine(text) {
        const s = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ');
        return s.length ? s : '(blank line)';
    }

    function harvesterDiffText(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        const kept = [];
        const cut = [];
        rows.forEach(function (row) {
            if (row.rkind === 'add') {
                kept.push({
                    fact: row.rtext,
                    line: row.lnum,
                    source: row.ltext
                });
            }
            if (row.lkind === 'del' && row.rkind === 'empty') {
                cut.push({ line: row.lnum, text: row.ltext });
            }
        });
        const origLines = rows.filter(function (row) { return row.lkind === 'del'; }).length;
        const out = [];
        out.push('HARVESTER COMPARISON');
        out.push('File: ' + (file.name || 'untitled'));
        out.push('Kept: ' + kept.length + (kept.length === 1 ? ' extracted identifier' : ' extracted identifiers'));
        out.push('Not kept: ' + cut.length + (cut.length === 1 ? ' original line' : ' original lines') + ' with no identifier');
        out.push('Original lines shown: ' + origLines);
        out.push('');
        out.push('======== KEPT ========');
        if (!kept.length) out.push('(nothing was extracted)');
        kept.forEach(function (item, i) {
            out.push((i + 1) + '. + ' + item.fact);
            if (item.source) out.push('   from original line ' + item.line + ': ' + cpPlainLine(item.source));
            else out.push('   not tied to a single original line');
        });
        out.push('');
        out.push('======== NOT KEPT ========');
        if (!cut.length) out.push('(every original line contributed an identifier)');
        cut.forEach(function (item) {
            out.push('- line ' + item.line + ': ' + cpPlainLine(item.text));
        });
        out.push('');
        out.push('======== FULL SPLIT TABLE ========');
        out.push('Orig#  Original                                      Ext#   Extracted');
        rows.forEach(function (row) {
            const lnum = row.lnum === '' || row.lnum == null ? '    ' : String(row.lnum);
            const rnum = row.rnum === '' || row.rnum == null ? '    ' : String(row.rnum);
            const left = row.lkind === 'empty' ? '' : '- ' + cpPlainLine(row.ltext);
            const right = row.rkind === 'empty' ? '' : '+ ' + cpPlainLine(row.rtext);
            const note = row.rkind === 'add' ? '  [kept]' : (row.lkind === 'del' ? '  [not kept]' : '');
            out.push(lnum + '  ' + left);
            out.push(rnum + '  ' + right + note);
            out.push('');
        });
        return out.join('\n').replace(/\n{3,}/g, '\n\n');
    }

    function cpMarkCopied(btn, ok) {
        if (!btn) return;
        if (btn.classList.contains('cp-ico')) {
            if (!btn.getAttribute('data-cp-idle')) {
                btn.setAttribute('data-cp-idle', btn.getAttribute('data-tip') || btn.getAttribute('aria-label') || 'Copy');
            }
            const idle = btn.getAttribute('data-cp-idle');
            btn.setAttribute('aria-label', ok ? 'Copied' : 'Copy failed');
            btn.setAttribute('data-tip', ok ? 'Copied' : 'Copy failed');
            btn.classList.toggle('is-copied', !!ok);
            clearTimeout(btn._cpCopyT);
            btn._cpCopyT = setTimeout(function () {
                btn.setAttribute('aria-label', idle);
                btn.setAttribute('data-tip', idle);
                btn.classList.remove('is-copied');
            }, 1500);
            return;
        }
        const idle = btn.getAttribute('data-cp-idle') || 'Copy';
        btn.setAttribute('data-cp-idle', idle);
        btn.textContent = ok ? 'Copied' : 'Copy failed';
        clearTimeout(btn._cpCopyT);
        btn._cpCopyT = setTimeout(function () {
            btn.textContent = btn.getAttribute('data-cp-idle') || 'Copy';
        }, 1500);
    }

    function cpWriteClipboard(text, btn) {
        const done = function (ok) { cpMarkCopied(btn, ok); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () {
                done(cpExecCopy(text));
            });
            return;
        }
        done(cpExecCopy(text));
    }

    function cpExecCopy(text) {
        let ok = false;
        function onCopy(event) {
            if (!event.clipboardData) return;
            event.preventDefault();
            event.clipboardData.setData('text/plain', text);
            ok = true;
        }
        document.addEventListener('copy', onCopy);
        try { document.execCommand('copy'); } catch (error) {}
        document.removeEventListener('copy', onCopy);
        if (ok) return true;
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;opacity:0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return !!ok;
        } catch (error) {
            return false;
        }
    }

    function harvesterPaneText(fileIndex, side) {
        const st = harvesterState();
        const file = st.files && st.files[fileIndex];
        if (!file) return '';
        if (side === 'original') {
            const ta = document.querySelector('.cp-editor[data-cp-file="' + fileIndex + '"]');
            return ta ? String(ta.value || '') : String(file.raw || '');
        }
        return cpBuildSplit(file.raw, file.hits || []).filter(function (row) {
            return row.rkind === 'add';
        }).map(function (row) {
            return row.rtext;
        }).join('\n');
    }

    function copyHarvesterPane(fileIndex, side, btn) {
        const st = harvesterState();
        if (!st.ready || !(st.files || []).length) return;
        cpWriteClipboard(harvesterPaneText(fileIndex, side), btn);
    }

    function copyHarvesterDiff(fileIndex, btn) {
        const st = harvesterState();
        const files = st.files || [];
        if (!st.ready || !files.length) return;
        let text = '';
        if (fileIndex != null && files[fileIndex]) text = harvesterDiffText(files[fileIndex]);
        else text = files.map(harvesterDiffText).join('\n\n' + '----------------------------------------' + '\n\n');
        cpWriteClipboard(text, btn);
    }

    function harvesterExport(fmt) {
        const st = harvesterState();
        if (!st.ready || !(st.files || []).length) return;
        const files = st.files;
        const hits = st.hits || [];
        let name = (files[0] && files[0].name ? files[0].name.replace(/\.[^.]+$/, '') : 'harvested') + '-harvested';
        let body = '';
        let type = 'text/plain';
        function row(h) {
            return {
                kind: h.platform ? h.platform : h.kind,
                value: h.value,
                field: h.kind,
                platform: h.platform || ''
            };
        }
        if (fmt === 'json') {
            type = 'application/json';
            body = JSON.stringify({ facts: hits.map(row) }, null, 2);
            name += '.json';
        } else if (fmt === 'csv') {
            type = 'text/csv';
            body = 'kind,value,platform\n' + hits.map(function (h) {
                return [h.platform || h.kind, h.value, h.platform || ''].map(function (c) {
                    const s = String(c || '');
                    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(',');
            }).join('\n');
            name += '.csv';
        } else if (fmt === 'xml') {
            type = 'application/xml';
            body = '<?xml version="1.0" encoding="UTF-8"?>\n<harvested>\n' +
                hits.map(function (h) {
                    return '  <fact kind="' + esc(h.kind) + '"' + (h.platform ? ' platform="' + esc(h.platform) + '"' : '') + '>' + esc(h.value) + '</fact>';
                }).join('\n') + '\n</harvested>\n';
            name += '.xml';
        } else if (fmt === 'html') {
            type = 'text/html';
            body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(name) + '</title></head><body>' +
                '<h1>Harvested facts</h1><ul>' + hits.map(function (h) {
                    return '<li><b>' + esc(cpHitLabel(h)) + '</b> ' + esc(h.value) + '</li>';
                }).join('') + '</ul></body></html>';
            name += '.html';
        } else if (fmt === 'md') {
            body = '# Harvested facts\n\n' + hits.map(function (h) {
                return '- **' + cpHitLabel(h) + ':** ' + h.value;
            }).join('\n') + '\n';
            name += '.md';
        } else {
            body = hits.map(function (h) {
                return cpHitLabel(h) + ': ' + h.value;
            }).join('\n') + '\n';
            name += '.txt';
        }
        const blob = new Blob([body], { type: type + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    const CP_FIELD = {
        email: 'email',
        phone: 'phone',
        username: 'username',
        alias: 'username',
        name: 'name',
        address: 'address',
        ip: 'ip',
        domain: 'domain',
        crypto: 'crypto',
        dob: 'dob',
        company: 'company',
        occupation: 'occupation',
        os: 'os',
        password: 'password',
        plate: 'plate',
        vehicle: 'vehicle',
        age: 'age',
        timezone: 'timezone',
        vin: 'vin',
        url: 'domain'
    };

    function inspectHarvester() {
        const st = harvesterState();
        if (!st.ready) return;
        const hits = st.hits || [];
        const names = (st.files || []).map(function (f) { return f.name; }).join(', ');
        if (host && (host.addFactSlot || host.addFact)) {
            const file = host.addFactSlot || host.addFact;
            hits.forEach(function (hit) {
                if (hit.kind === 'date' || hit.kind === 'time' || hit.kind === 'id') return;
                const field = CP_FIELD[hit.kind];
                if (!field) return;
                const extra = { source: 'harvester', method: 'file-harvest', quiet: true };
                if (hit.platform) extra.platform = hit.platform;
                file(field, hit.value, extra);
            });
            const ids = hits.filter(function (h) { return h.kind === 'id'; }).map(function (h) { return h.value; });
            if (ids.length) file('notes', 'IDs: ' + ids.join(', '), { source: 'harvester', method: 'file-harvest', quiet: true });
            const note = 'Harvested ' + names + ' — ' + hits.length + ' fact' + (hits.length === 1 ? '' : 's') + ' kept.';
            file('notes', note, { source: 'harvester', method: 'file-harvest', quiet: true });
            if (host.flushFacts) host.flushFacts();
        }
        schedulePersist();
        setPage('orbit');
    }

    function bindHarvester() {
        if (cpBound) return;
        const view = $('harvesterView');
        const drop = $('harvesterDrop');
        if (!view || !drop) return;
        cpBound = true;
        function over(event) {
            event.preventDefault();
            drop.classList.add('is-over');
        }
        function leave(event) {
            event.preventDefault();
            drop.classList.remove('is-over');
        }
        view.addEventListener('dragover', over);
        view.addEventListener('dragenter', over);
        view.addEventListener('dragleave', leave);
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            drop.classList.remove('is-over');
            const files = event.dataTransfer && event.dataTransfer.files;
            if (files && files.length) {
                ingestHarvesterFiles(files);
                return;
            }
            const text = event.dataTransfer && event.dataTransfer.getData('text/plain');
            if (text) newHarvesterFile(text);
        });
        let cpSplitDrag = null;
        function onSplitMove(event) {
            if (!cpSplitDrag) return;
            applyHarvesterSplit(splitPctFromPointer(cpSplitDrag, event.clientX), false);
        }
        function onSplitUp() {
            if (!cpSplitDrag) return;
            cpSplitDrag = null;
            document.body.classList.remove('cp-splitting');
            window.removeEventListener('pointermove', onSplitMove);
            window.removeEventListener('pointerup', onSplitUp);
            applyHarvesterSplit(harvesterSplitPct(), true);
        }
        view.addEventListener('pointerdown', function (event) {
            const g = event.target.closest('.cp-split-gutter');
            if (!g || event.button) return;
            event.preventDefault();
            cpSplitDrag = g;
            document.body.classList.add('cp-splitting');
            window.addEventListener('pointermove', onSplitMove);
            window.addEventListener('pointerup', onSplitUp);
        });
        view.addEventListener('dblclick', function (event) {
            if (!event.target.closest('.cp-split-gutter')) return;
            applyHarvesterSplit(50, true);
        });
        view.addEventListener('input', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta) {
                onHarvesterEditorInput(ta);
                return;
            }
            const name = event.target.closest('.cp-file-name');
            if (name) {
                const i = parseInt(name.getAttribute('data-cp-name'), 10);
                if (!isNaN(i)) renameHarvesterFile(i, name.value);
            }
        });
        view.addEventListener('focusout', function (event) {
            const ta = event.target.closest && event.target.closest('.cp-editor');
            if (!ta) return;
            const i = parseInt(ta.getAttribute('data-cp-file'), 10);
            if (isNaN(i)) return;
            clearTimeout(cpEditTimers[i]);
            applyHarvesterEdit(i, ta.value);
        });
        view.addEventListener('scroll', function (event) {
            if (event.target && event.target.classList && event.target.classList.contains('cp-editor')) {
                syncHarvesterGutter(event.target);
            }
        }, true);
        view.addEventListener('keydown', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta && event.key === 'Tab') {
                event.preventDefault();
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
                ta.selectionStart = ta.selectionEnd = start + 2;
                onHarvesterEditorInput(ta);
                return;
            }
            const g = event.target.closest('.cp-split-gutter');
            if (!g) return;
            const step = event.shiftKey ? 8 : 3;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() - step, true);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() + step, true);
            } else if (event.key === 'Home') {
                event.preventDefault();
                applyHarvesterSplit(50, true);
            }
        });
        window.addEventListener('resize', function () {
            syncCpModeThumb(true);
            if (!harvesterState().ready) return;
            applyHarvesterSplit(harvesterSplitPct(), false);
        });
        document.addEventListener('click', function (event) {
            const mode = event.target.closest('#harvesterCount [data-cp-view]');
            if (mode) {
                setHarvesterView(mode.getAttribute('data-cp-view'));
                return;
            }
            if (event.target.closest('#harvesterUploadBtn, #harvesterDropBtn')) {
                openHarvesterPicker();
                return;
            }
            if (event.target.closest('#harvesterNewBtn, #harvesterDropNewBtn')) {
                newHarvesterFile('');
                return;
            }
            if (event.target.closest('#harvesterDownloadBtn')) {
                const menu = $('harvesterDownloadMenu');
                if (menu) menu.hidden = !menu.hidden;
                return;
            }
            if (event.target.closest('[data-cp-fmt]')) {
                harvesterExport(event.target.getAttribute('data-cp-fmt'));
                hideHarvesterDownload();
                return;
            }
            if (event.target.closest('#harvesterCopyBtn')) {
                copyHarvesterDiff(null, event.target.closest('#harvesterCopyBtn'));
                return;
            }
            const paneCopy = event.target.closest('[data-cp-pane-copy]');
            if (paneCopy) {
                const i = parseInt(paneCopy.getAttribute('data-cp-file'), 10);
                copyHarvesterPane(isNaN(i) ? 0 : i, paneCopy.getAttribute('data-cp-pane-copy'), paneCopy);
                return;
            }
            const copyOne = event.target.closest('[data-cp-copy]');
            if (copyOne) {
                const i = parseInt(copyOne.getAttribute('data-cp-copy'), 10);
                copyHarvesterDiff(isNaN(i) ? null : i, copyOne);
                return;
            }
            if (event.target.closest('#harvesterInspectBtn')) {
                inspectHarvester();
                return;
            }
            if (event.target.closest('#harvesterClearBtn')) {
                clearHarvester();
                return;
            }
            if (!event.target.closest('.cp-dl')) hideHarvesterDownload();
        });
        document.addEventListener('keydown', function (event) {
            const btn = event.target.closest('#harvesterCount [data-cp-view]');
            if (!btn) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
            const order = ['split', 'original', 'stripped'];
            const i = order.indexOf(btn.getAttribute('data-cp-view'));
            let next = i;
            if (event.key === 'ArrowRight') next = (i + 1) % order.length;
            else if (event.key === 'ArrowLeft') next = (i + order.length - 1) % order.length;
            else if (event.key === 'Home') next = 0;
            else next = order.length - 1;
            event.preventDefault();
            setHarvesterView(order[next]);
            const focus = document.querySelector('#harvesterCount [data-cp-view="' + order[next] + '"]');
            if (focus) focus.focus();
        });
    }
const OPS_LAND = { cols: 180, rows: 90, bits: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAfAP8DAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw////wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAMAIL7//9//xOAAP/ff0668QD/HwAA+A8At///////v48PAAAAAODBB+D//x8AKAAEAAAAAAAAcwAAAABAB/7Af/j/YCgAAAAAAAAAAADw/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QAAAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYAAAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAAAAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAAPAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAAAPz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAYXgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAAAAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAAAAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8AAAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P///38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////////////////////HwDgPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' };
const OPS_PLACES = {"FJ":[179.59,-16.41],"TZ":[34.34,-6.52],"EH":[-12.03,24.78],"CA":[-90.74,56.4],"US":[-90.36,38.27],"KZ":[65.25,47.26],"UZ":[65.29,41.15],"PG":[146.21,-7.77],"ID":[121.59,-2.04],"AR":[-65.09,-37.02],"CL":[-71.42,-37.96],"CD":[23.0,-3.84],"SO":[46.84,6.42],"KE":[37.82,1.11],"SD":[29.34,12.81],"TD":[18.0,13.0],"HT":[-72.7,18.84],"DO":[-70.49,18.73],"RU":[95.53,59.56],"BS":[-77.95,24.53],"FK":[-59.58,-51.73],"NO":[18.09,66.23],"GL":[-41.03,74.15],"TF":[69.46,-49.12],"TL":[125.91,-8.75],"ZA":[24.72,-28.6],"LS":[28.37,-29.58],"MX":[-103.13,23.87],"UY":[-56.14,-32.7],"BR":[-56.93,-9.66],"BO":[-64.13,-16.34],"PE":[-74.08,-7.75],"CO":[-72.65,4.49],"PA":[-80.32,8.5],"CR":[-84.16,9.82],"NI":[-84.98,13.08],"HN":[-86.31,14.75],"SV":[-88.92,13.85],"GT":[-90.27,15.53],"BZ":[-88.63,17.42],"VE":[-66.85,7.21],"GY":[-58.9,4.48],"SR":[-55.87,3.7],"FR":[3.3,47.0],"EC":[-78.7,-1.64],"PR":[-66.43,18.28],"JM":[-77.35,18.19],"CU":[-79.73,21.72],"ZW":[29.66,-18.87],"BW":[24.47,-22.48],"NA":[17.93,-21.56],"SN":[-14.59,13.88],"ML":[-5.8,14.08],"MR":[-12.43,18.83],"BJ":[2.33,9.81],"NE":[8.74,15.48],"NG":[8.35,9.73],"CM":[13.17,6.91],"TG":[0.87,8.88],"GH":[-0.97,8.29],"CI":[-6.35,7.94],"GN":[-10.98,10.42],"GW":[-15.21,11.98],"LR":[-9.14,6.75],"SL":[-11.7,8.6],"BF":[-1.92,12.11],"CF":[20.7,6.29],"CG":[14.93,-0.92],"GA":[11.89,-0.34],"GQ":[10.07,1.59],"ZM":[27.98,-12.83],"MW":[34.06,-12.91],"MZ":[34.87,-17.91],"SZ":[31.44,-26.42],"AO":[17.38,-10.94],"BI":[30.04,-3.23],"IL":[35.19,32.06],"LB":[35.85,33.8],"MG":[46.99,-17.97],"PS":[35.24,31.81],"GM":[-15.29,13.5],"TN":[9.84,34.02],"DZ":[3.02,29.67],"JO":[36.65,31.13],"AE":[54.24,24.2],"QA":[51.15,25.26],"KW":[47.74,29.34],"IQ":[44.4,33.44],"OM":[56.57,20.86],"VU":[166.89,-15.38],"KH":[104.9,12.64],"TH":[100.66,13.18],"LA":[103.69,18.28],"MM":[97.15,20.0],"VN":[105.94,16.71],"KP":[127.33,39.89],"KR":[127.47,36.72],"MN":[104.59,47.2],"IN":[83.59,23.97],"BD":[90.61,23.4],"BT":[90.62,27.47],"NP":[84.56,28.21],"PK":[69.44,30.79],"AF":[67.77,34.83],"TJ":[70.79,38.51],"KG":[73.98,41.36],"TM":[58.46,39.33],"IR":[53.34,33.3],"SY":[37.95,35.15],"AM":[45.31,39.95],"SE":[16.56,62.74],"BY":[28.22,53.38],"UA":[30.45,48.69],"PL":[19.48,51.74],"AT":[13.48,47.64],"HU":[19.25,47.46],"MD":[28.47,47.05],"RO":[25.19,45.86],"LT":[24.02,55.2],"LV":[24.94,56.86],"EE":[25.93,58.61],"DE":[10.69,51.04],"BG":[24.69,42.89],"GR":[23.14,39.8],"TR":[36.75,38.4],"AL":[20.13,41.23],"HR":[16.38,44.9],"CH":[8.31,46.8],"LU":[5.98,49.81],"BE":[4.58,50.63],"NL":[5.65,52.16],"PT":[-8.04,39.76],"ES":[-4.45,40.18],"IE":[-7.72,53.53],"NC":[165.51,-21.18],"SB":[159.13,-7.9],"NZ":[175.48,-38.2],"AU":[133.25,-23.8],"LK":[80.86,7.63],"CN":[105.67,37.31],"TW":[121.11,23.86],"IT":[12.63,43.09],"DK":[9.62,56.28],"GB":[-3.08,53.9],"IS":[-19.27,65.28],"AZ":[47.41,40.37],"GE":[43.36,42.26],"PH":[121.82,15.37],"MY":[114.77,3.68],"BN":[115.0,4.74],"SI":[15.0,46.11],"FI":[25.77,65.48],"SK":[19.35,48.76],"CZ":[15.85,49.78],"ER":[39.59,14.71],"JP":[136.0,35.72],"PY":[-57.57,-23.3],"YE":[46.47,15.51],"SA":[43.59,24.04],"AQ":[-166.46,-72.96],"CY":[33.24,35.02],"MA":[-9.43,28.77],"EG":[31.64,28.1],"LY":[16.64,28.48],"ET":[39.21,8.98],"DJ":[42.52,11.8],"UG":[31.99,1.26],"RW":[29.89,-1.98],"BA":[17.87,44.15],"MK":[21.69,41.67],"RS":[20.94,43.83],"ME":[19.45,42.74],"TT":[-61.46,10.48],"SS":[30.09,8.01]};
const OPS_COUNTRY = { cols: 180, rows: 90, codes: ["","FJ","TZ","EH","CA","US","KZ","UZ","PG","ID","AR","CL","CD","SO","KE","SD","TD","HT","DO","RU","BS","FK","NO","GL","TF","TL","ZA","LS","MX","UY","BR","BO","PE","CO","PA","CR","NI","HN","SV","GT","BZ","VE","GY","SR","FR","EC","PR","JM","CU","ZW","BW","NA","SN","ML","MR","BJ","NE","NG","CM","TG","GH","CI","GN","GW","LR","SL","BF","CF","CG","GA","GQ","ZM","MW","MZ","SZ","AO","BI","IL","LB","MG","PS","GM","TN","DZ","JO","AE","QA","KW","IQ","OM","VU","KH","TH","LA","MM","VN","KP","KR","MN","IN","BD","BT","NP","PK","AF","TJ","KG","TM","IR","SY","AM","SE","BY","UA","PL","AT","HU","MD","RO","LT","LV","EE","DE","BG","GR","TR","AL","HR","CH","LU","BE","NL","PT","ES","IE","NC","SB","NZ","AU","LK","CN","TW","IT","DK","GB","IS","AZ","GE","PH","MY","BN","SI","FI","SK","CZ","ER","JP","PY","YE","SA","AQ","CY","MA","EG","LY","ET","DJ","UG","RW","BA","MK","RS","ME","TT","SS"], bits: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEAAAAAAAAAAAAAAAXFxcXFxcXFxcXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQEBAQEBAQEBAQAABcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAQEBAAEBAQEBAAAAAAXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcAAAAAAAAAAAAAAAAAAAAAFhYWFhYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExMTEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAABAAABAQEBAQAAAAAFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXAAAAAAAAAAAAAAAAAAAAAAAWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAAAAQABAAEBAQEBAQAAAAAAAAAAAAAABcXFxcXFxcXFxcXFxcXFxcXFxcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMTAAAAAAAAAAAAAAAAABMTExMTExMTExMTExMAAAAAAAAAAAAAAAAAExMTABMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAEAAAABAAAAAQABAQABAQEBAAEBAAAAAAAAAAAAAAXFxcXFxcXFxcXFxcXFxcXFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEwAAAAAAAAAAAAAAABMTExMTExMTExMTExMTExMTExMTEwATEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExcXFxcXFxcXFxcXFxcTFxMTExMTExMTExMTExMTExMTExMTExMTFhYTExMTExMTExMTExMTABMTExMTAAAAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAAAAAAAAAAAAABMTABMTExMTExMTExMAAAAAAAAAAAAFBQUFBQUFBQUFBQUEAAQEBAQEBAQEBAAABAQEAAAEAAAEAAQEBAAEBAAAAAQEBAQAAAAAAAAAABcXFxcXFxcXFxcXFxcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFpgWFpgTExMTAAAAAAAAAAAAAAAAExMTABMTABMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTABMTExMTAAAAExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTFxcXFxcXFxcXFxMTExMTExMTExMTExMTExMTExMTExMTExZvb29vmJiYAAAAAAAAEwATAAAAAAAAAAAAAAAAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExMAABMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExcXFxcXFxMTExMTExMTE5GRkZETExMTExMTExMTExMTFm9vb28TE5iYAAATABMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBQUFBQUFBQUFBQUEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAABAQABAAAAAAAAAAXFxcXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWb29vAACYmJiYmBMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAAAAAAAAAAUFBQUFBQUABQUFBQUEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAABAQEBAAAAAAAAAAAAAAAFxcXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhYWb29vAACYmJgTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAAATABMTExMAAAAAAAAAAAAAAAAABQUFBQAAAAAAAAAABQUEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAABAQEBAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhYWb29vAAAAeXkTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMAAAAAABMAAAATAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAFBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkJAAAAAAAI8Ab28AAAB4eHgTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAAAAAAAAAAAAExMTEwAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAABAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQkJAAAAAAAI8AAAAAABN3d3BwExMTExMTExMTExMTExMTExMTEwYTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMAAAAAAAAAAAAAExMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAABAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIaGAJCQAACDg3p6enJycnJycHBwcBMTExMTExMTExMTExMTEwYGBgYGBgYGExMTExMTExMTExMTExMTExMTExMTjIyMExMTExMTExMTAAAAAAAAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJCQAIKCenp6eppycnJycXFxcXFxExMTExMTEwYGEwYTEwYGBgYGBgYGBgYGExMTExMTE2JiExMTExMTExMTjIyMjBMTExMTEwATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAFBQUFBQUFBQUFBQUFBQQEBAQEBAQEBAQEBAQABAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCwsLHp6epqamZlxcXFxcXFxcXETExMGBgYGBgYGBgYGBgYGBgYGBgYGBgZiYmJiYmJiYmJiYmJiYoyMjIyMjIwTExMTEwATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUEBAQEBAQEBAUEBAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCwsgIBzc3N0dHR2dnZ1cXFxcRMTExMTBgYGBgYGBgYGBgYGBgYGBgYGjIyMYmJiYmJiYmJiYmJiYmJijIyMjIyMjBMTAAATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUFBQQEBAQFBQUABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCwsjo6OAH+pf6t2dnZ2AAATABMTExMTAAAGBgcHBgYGBgYGBgYGBoyMjIyMjIxiYmJiYmJiYmJijIyMjIyMjIyMExMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUFBQQEBQUFBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIWFhYUsLCwAAACOjgAArAB7e3sAAAAAAACTkxMTAAAGBgcHBwcHBgYGBmoGBoyMjIyMjIyMYmJiYmJiYoyMjIyMjIyMjIyMEwAAAJycAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEhYWFAAAAAI4AAI6OAKp8fH0AfX19fX19fW6SkgAAa2trawcHBwcHamqMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMYGAAAAAAAJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAISFhYWFAAAAAAAAAACOAHx8AH19fX19fX19fWxskgAAa2tra2sHB2lpaYyMjIyMjIyMjIyMjIyMjIyMjIyMjIwAAAAAYAAAAAAAAJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhYUAAAAAU1JSAI4AAAAAAAB9fX19fX1tWGxsbAAAbGxsa2toaGhoaGeMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjAAAYWEAAACcnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQUFBQUFBQUFBQUFBQUFBQUFBQUFBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoqJTU1NTU1IAAAAAAAAAfAAAAKEAbW1tWFhsbGxsbGxsaGhoaGhoZ2dnjIyMjIyMjIyMjIyMjIyMjIyMjIyMAAAAYQAAnJycnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACioqJTU1NTU1JSAAAAAAAAAAAAAAAAbVhYWFhsbGxsbGxsaGhoaGhnZ2NjY4yMjIyMjIyMjIyMjIyMjIyMjIyMAAAAAACcnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcHBwcHAUFBQUFBQUFBQUFBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKKiolNTU1NTU1OkpKSkAKSko6MAo6NNVJ+fWFhYbGxsbGxsbGhoZ2dnZ2NjY4yMjIyMjIyMjIyMjIyMjIyMjIyMjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwcHBwcHAUFAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKJTU1NTU1NTU1OkpKSkpKSkpKOjo6Ofn5+fn5+fAGxsbGxsbGdnZ2dnY2NjY2ZmjIyMjIxjjIyMjIyMjIyMjIyMjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcHBwcHAUAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiogNTU1NTU1NTU1OkpKSkpKSkpKOjo6MAn5+fn5+fnwAAbGxsbGxnZ2djY2NjY2NjZmZjZWNjXoyMjIyMjIyMjIyMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHBwcHBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiNjY2NlNTU1NTU1OkpKSkpKSkpKOjo6MAAJ+fn5+fn1YAVQAAAAAAZ2djY2NjY2NjY2NkZGNeXoyMjIyMjIyMjIyMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwcHBwAAAAAAAAAMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKI2NjY2NTVTU1NTU1NTOKSkpKSkpKOjo6OjAJ+fn5+fn59VVVlZAAAAAABjY2NjY2NjY2NkZGNeXl6MjF+MjIyMjAAAjQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwcHBwAAAAAHBwAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANjY2NjY2NTU1NVNTUzg4ODgQEKSkpA8PDw8PDwCfn5+fn5+fn1kAAAAAAABjY2NjY2NjY2MAAF5eXl5dXV9fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcHBwcAAAcHAAAAAAAAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADY2NjY2NTU1NTU4ODg4ODgQEBAQDw8PDw8PDwAAn5+fn59ZWVkAAAAAAAAAY2NjY2NjAAAAAABeXlxcXV8AjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwcHBwnKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADY2NjY2NTU1NTU4ODg4ODgQEBAQDw8PDw8PmwAAn56fnp5ZAAAAAAAAAAAAAGNjY2MAAAAAAABeXlxcXF1fAAAAAAAAlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnJSUlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDQ0NTU1NTU1NTg4ODg4OBAQEBAPDw8PDw8Pm5sAnp6engAAAAAAAAAAAAAAAGNjYwAAAAAAAAAAAFxcXFxdAAAAAAAAlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQ0NTU1NUJCQjg5OTg5ORAQEBAPDw8PDw8PpaWlAJ4AAAAAAAAAAAAAAAAAAGNjYwAAAAAAAAAAAF5cW1tbXwAAAAAAlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAACEhKSkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4+Pj41QkJCNzc5OTk5ORAQEBAPDw8PD66lpaWlAAAADQ0AAAAAAAAAAAAAAABjYwAAAAAAAAAAAF4AAFtfAAAAAAAAAACUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIwAiACEhKSkpKSkpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBQT49PT08Ozk5OTk5OhAQQ0NDrq6urq6lpaWlpQAADQAAAAAAAAAAAAAAAABjAIsAAAAAAAAAAFwAAF8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAISEhISkpKSkpKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEA9PTw8Ozk5OTk5OjpDQ0NDQ66urq6lpaWlpaUNDQAAAAAAAAAAAAAAAAAAAIsAAAAAAAAAAAAAAAAAAAAAAAAAAACUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAISEhISEpKSkpKisrLAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA9AD0AAAAAOTo6OkNDQ0NDQwyurq4OpaWlpQ0NAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQCVlQAAAAAAlpUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAISEhISEpKR4eKisrLB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6OjpEDAwMDAwMp6cODg4ODQ0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAlQAAAACVlQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtISEhIR4eHh4eHh4eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFRUREDAwMDAwMp6cODg4NDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkJAAAAAJUJCQkACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtLSAhIR4eHh4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEVFRUREDAwMDAwMpwIODg4OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJCQAAAAkJCQkAAAAAAAAJCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtICAgIB4eHh4eHh4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFREQMDAwMDAwMAgICAg4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQkAAAkJCQAJCQAAAAkACQAJCQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgICAgHh4eHh4eHh4eHh4eHh4eHh4eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAwMDAwMDAwMAgICAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAkAAAAAAAAACQkICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICAeHh4eHh4eHh4eHh4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS0sMDAwMDAwMAgICAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJCQkAAAAAAAAAAAAAAAAACQkICAgAAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICAeHh4eHh4eHh4eHh4eHh4eHh4eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS0tLS0sMDAxHRwICAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAkIAAgAAAAAAACIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICAgIB4fHh4eHh4eHh4eHh4eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtLS0tLDAxHR0cCAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgICAfHx8eHh4eHh4eHh4eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS0tLS0tHR0cMR0hJSUkAAAAATwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKiooAAACKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgIB8fHx8fHh4eHh4eHh4eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS0tLS0tHR0dHSUlISUkAAAAATwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKioqKiooAAACKigAAAAAAAAAAAABaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIB8fHx8fHx4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM0tLS0tHR0cxMUlJSQAAAE9PTwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKioqKioqKAACKigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsfHx8fHx4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMzMzIyMjExMUlJAAAAAE9PTwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKioqKioqKioqKigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsfHx+dnR4eHh4eHh4eHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMzMzIyMjIxMUlJAAAAAE9PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKioqKioqKioqKioqKioqKAAAAAAAAAIcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCgqdnZ0eHh4eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMzMzIyMjIaGklJAAAAAE9PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAioqKioqKioqKioqKioqKioqKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsKCgoKCp2dHh4eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMzMzIyMhoaGkkAAAAAAE8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAioqKioqKioqKioqKioqKioqKigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsKCgoKCp0KHh4eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMxoaGhoaSgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAioqKioqKioqKioqKioqKioqKiooAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwoKCgoKCgoeHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGhoaGhobGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAioqKioqKioqKioqKioqKioqKiooAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwoKCgoKCh0eHh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhoaGhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKioqKioqKioqKioqKioqKiooAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwoKCgoKCh0dHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhoaGhoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKiooAAAAAAIqKioqKioqKigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwoKCgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIoAAAAAAAAAAAAAioqKioqKAAAAAAAAAAAAAACJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIqKioqKAAAAAAAAAAAAAAAAiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCgoKAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiooAAAAAAAAAAAAAAACJiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIoAAAAAAAAAAAAAAImJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCgoKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCgoKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsLCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCwsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKAAAAAAAAAAAAAAAAAAAACgAAAAAACgoKCgoKCgoKAAAKCgoKCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAACgoKCgoKCgoKCgoKCgoKAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoKCgoKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKAAAAAAoAAAAAAAAAAAAACgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKCgoKCgoKCgoKCgoKCgAKAAAKCgoKCgoKCgoKCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAoAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgAAAAAAAAAAAAAAAAAACgoKAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoAAAAAAAAAAAAKAAAAAAAAAAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKAAAAAAAAAAAAAAAAAAAAAAoKCgoKCgoKCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' };
const OPS_FLOCK = {
    file: 'data/cameras.bin',
    flock: 335701,
    service: 214073,
    osm: 146322
};

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

    function opsNewsCache(next) {
        if (next) {
            try { localStorage.setItem(OPS_NEWS_KEY, JSON.stringify(next)); } catch (error) {}
            return next;
        }
        try {
            const saved = JSON.parse(localStorage.getItem(OPS_NEWS_KEY) || '');
            if (saved && Array.isArray(saved.items)) return saved;
        } catch (error) {}
        return null;
    }

    function opsAbsUrl(url) {
        const value = String(url || '').trim();
        return /^https?:\/\//i.test(value) ? value : '';
    }

    function opsPlain(html) {
        return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    }

    function opsResolveUrl(url, page) {
        const value = String(url || '').trim();
        if (!value) return '';
        if (value.indexOf('//') === 0) return 'https:' + value;
        if (/^https?:\/\//i.test(value)) return value;
        try { return new URL(value, page).href; } catch (error) { return ''; }
    }

    function opsNewsImage(item) {
        const direct = opsAbsUrl(item && item.thumbnail);
        if (direct) return direct;
        const enc = item && item.enclosure;
        const encLink = enc && (enc.link || enc.url);
        const encType = String(enc && enc.type || '');
        if (opsAbsUrl(encLink) && (!encType || encType.indexOf('image') === 0 || /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(encLink))) return encLink;
        const html = String(item && (item.content || item.description) || '');
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? opsAbsUrl(opsResolveUrl(match[1], item && item.link)) : '';
    }

    function opsOgImage(html, page) {
        const tags = String(html || '').match(/<meta\b[^>]*>/gi) || [];
        let found = '';
        tags.forEach(function (tag) {
            if (found) return;
            const image = /property\s*=\s*["']og:image(?::secure_url)?["']/i.test(tag) || /name\s*=\s*["']twitter:image(?::src)?["']/i.test(tag);
            if (!image) return;
            const content = tag.match(/content\s*=\s*["']([^"']+)["']/i);
            if (!content) return;
            const url = opsAbsUrl(opsResolveUrl(opsPlain(content[1]), page));
            if (url && !/sprite|pixel|spacer|favicon/i.test(url)) found = url;
        });
        return found;
    }

    function opsFilterNews(items) {
        const topic = OPS_TOPICS.filter(function (row) { return row.id === opsNewsTopic; })[0] || OPS_TOPICS[0];
        if (!topic.test) return items || [];
        return (items || []).filter(function (item) {
            return topic.test.test((item.title || '') + ' ' + (item.text || ''));
        });
    }

    function opsQueueImages(items) {
        const deck = opsFilterNews(items).slice(0, 8);
        const ordered = deck.concat((items || []).filter(function (item) { return deck.indexOf(item) < 0; }));
        ordered.forEach(function (item) {
            if (!item || item.image || item.imageTried || !item.link) return;
            if (opsImageQueue.indexOf(item) >= 0) return;
            opsImageQueue.push(item);
        });
        opsDrainImages();
    }

    function opsDrainImages() {
        if (opsImageBusy) return;
        const item = opsImageQueue.shift();
        if (!item) return;
        opsImageBusy = true;
        item.imageTries = (item.imageTries || 0) + 1;
        fetch('https://proxy.corsfix.com/?' + item.link).then(function (res) {
            if (res.status === 429 && item.imageTries < 3) {
                opsImageQueue.push(item);
                return '';
            }
            if (!res.ok) throw new Error('image');
            return res.text();
        }).then(function (html) {
            if (!html) return 1200;
            const image = opsOgImage(html, item.link);
            if (!image || image === item.imageBroken) {
                item.imageTried = true;
                return 900;
            }
            item.image = image;
            item.imageTried = true;
            opsNewsCache({ at: opsNewsAt || Date.now(), items: opsNewsAll });
            paintOpsNews(opsNewsAll, opsNewsNote, true);
            if (opsHover && opsHover.ip && opsTipPoint) {
                opsTipKey = '';
                opsPlaceTip(opsHover, opsTipPoint);
            }
            return 900;
        }).catch(function () {
            item.imageTried = true;
            return 900;
        }).then(function (wait) {
            opsImageBusy = false;
            setTimeout(opsDrainImages, wait || 900);
        });
    }

    function opsChapterKey(stories) {
        return stories.map(function (item) { return encodeURIComponent(item.link || ''); }).join(',');
    }

    function opsNewsElapsed() {
        let elapsed = Date.now() - (opsNewsStamp || Date.now());
        if (opsNewsPaused && opsNewsHold) elapsed -= Date.now() - opsNewsHold;
        if (elapsed < 0) elapsed = 0;
        if (elapsed > OPS_NEWS_MS) elapsed = OPS_NEWS_MS;
        return elapsed;
    }

    function resetOpsChapterFill(elapsed) {
        const fill = document.querySelector('#opsNews .ops-chapter-fill');
        if (!fill) return;
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
        fill.style.animationDelay = '-' + (elapsed || 0) + 'ms';
    }

    function mountOpsChapters(box, stories, chapters, slide) {
        const move = ++opsChapterMove;
        const wrap = box.querySelector('.ops-feature-wrap');
        if (!chapters) {
            const key = opsChapterKey(stories);
            const style = '--ops-news-ms:' + OPS_NEWS_MS + 'ms';
            const html = '<div class="ops-chapters" data-key="' + esc(key) + '"><div class="ops-chapter-track" role="tablist" aria-label="Stories" style="' + style + '">' +
                stories.map(function (item, index) {
                    const on = index === opsNewsIndex;
                    const fill = on ? '<span class="ops-chapter-fill" style="animation-delay:-' + opsNewsElapsed() + 'ms"></span>' : '';
                    return '<button type="button" class="ops-dot' + (on ? ' is-on' : '') + '" role="tab" data-news="' + index + '" aria-selected="' + (on ? 'true' : 'false') + '" aria-label="' + esc(item.title || 'Story') + '">' + fill + '</button>';
                }).join('') + '</div></div>';
            if (wrap) wrap.insertAdjacentHTML('afterend', html);
            else box.insertAdjacentHTML('beforeend', html);
            return;
        }
        if (wrap) wrap.insertAdjacentElement('afterend', chapters);
        else box.appendChild(chapters);
        const buttons = chapters.querySelectorAll('.ops-dot');
        buttons.forEach(function (button, index) {
            const on = index === opsNewsIndex;
            button.classList.toggle('is-on', on);
            button.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const on = buttons[opsNewsIndex];
        if (!on) return;
        let fill = chapters.querySelector('.ops-chapter-fill');
        if (!fill) {
            fill = document.createElement('span');
            fill.className = 'ops-chapter-fill';
        }
        const moved = fill.parentNode !== on;
        if (moved) on.appendChild(fill);
        if (move !== opsChapterMove || !on.isConnected) return;
        if (slide) resetOpsChapterFill(0);
        else if (moved) resetOpsChapterFill(opsNewsElapsed());
    }

    let opsNewsSkelTimer = 0;

    function paintOpsNewsSkeleton() {
        const box = $('opsNews');
        if (!box) return;
        box.innerHTML = '<div class="ops-lead ops-skel" aria-hidden="true"><span class="ops-pill">Source</span><h3>Story</h3><p>Summary</p></div>';
    }

    function opsNewsBlurb(text) {
        const value = String(text || '').replace(/\s+/g, ' ').trim();
        if (value.length <= 220) return value;
        return value.slice(0, 217).replace(/\s+\S*$/, '') + '…';
    }

    function paintOpsNews(items, note, keep) {
        clearTimeout(opsNewsSkelTimer);
        opsNewsSkelTimer = 0;
        const box = $('opsNews');
        if (!box) return;
        opsNewsAll = items || [];
        opsNewsNote = note || '';
        const filtered = opsFilterNews(opsNewsAll);
        const stories = filtered.slice(0, 12);
        opsNewsItems = stories;
        if (opsNewsIndex >= stories.length) opsNewsIndex = 0;
        const feature = stories[opsNewsIndex];
        const paintKey = opsNewsTopic + ':' + opsNewsIndex + ':' + (feature && feature.link || '');
        const changed = opsNewsPaintKey !== paintKey;
        opsNewsPaintKey = paintKey;
        if (changed && !keep) {
            opsNewsStamp = Date.now();
            if (opsNewsPaused) opsNewsHold = opsNewsStamp;
        }
        if (!opsNewsStamp) opsNewsStamp = Date.now();
        const filters = '<div class="ops-filters" role="group" aria-label="Topics">' + OPS_TOPICS.map(function (topic) {
            return '<button type="button" data-topic="' + topic.id + '"' + (topic.id === opsNewsTopic ? ' class="is-on"' : '') + '>' + esc(topic.label) + '</button>';
        }).join('') + '</div>';
        const label = opsNewsTopic === 'all' ? ' stories' : ' in topic';
        opsText('opsNewsStatus', filtered.length ? filtered.length + label : (note || 'No stories yet'));
        if (!stories.length) {
            box.innerHTML = filters + '<p class="ops-status">' + esc(note || 'No stories in this topic yet.') + '</p>';
            paintOpsRail();
            return;
        }
        const when = opsAgo(feature.date) || '';
        const blurb = opsNewsBlurb(feature.text);
        const photo = feature.image
            ? '<img class="ops-lead-photo" src="' + esc(feature.image) + '" alt="" width="184" height="144" referrerpolicy="no-referrer">'
            : '';
        const progress = stories.length > 1
            ? '<span class="ops-lead-progress" aria-hidden="true"><span class="ops-chapter-fill" style="animation-delay:-' + opsNewsElapsed() + 'ms"></span></span>'
            : '';
        const wire = stories.filter(function (item, index) { return index !== opsNewsIndex; }).map(function (item) {
            const meta = [item.source || '', opsAgo(item.date) || ''].filter(Boolean).join(' · ');
            return '<a href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(item.title || 'Untitled') + '</b><small>' + esc(meta) + '</small></a>';
        }).join('');
        const updated = opsNewsAt ? opsAgo(opsNewsAt) : '';
        const sources = [];
        filtered.forEach(function (item) {
            if (item.source && sources.indexOf(item.source) < 0) sources.push(item.source);
        });
        const meta = '<p class="ops-news-meta">' + esc(sources.join(', ')) + ' · ' + filtered.length + (opsNewsTopic === 'all' ? ' stories' : ' in this topic') + (updated ? ' · updated ' + esc(updated) : '') + '</p>';
        box.innerHTML = filters + meta +
            '<article class="ops-lead' + (photo ? ' has-photo' : '') + '"><a href="' + esc(feature.link) + '" target="_blank" rel="noopener noreferrer"><p class="ops-lead-meta"><span>' +
            esc(feature.source || 'Security') + '</span>' + (when ? '<time>' + esc(when) + '</time>' : '') + '</p><h3>' +
            esc(feature.title || 'Untitled') + '</h3>' + (blurb ? '<p class="ops-lead-text">' + esc(blurb) + '</p>' : '') + photo + '</a>' + progress + '</article>' +
            (wire ? '<div class="ops-wire">' + wire + '</div>' : '') +
            (note ? '<p class="ops-status">' + esc(note) + '</p>' : '');
        box.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                const failed = img.getAttribute('src');
                const current = opsNewsAll.filter(function (item) { return item.image === failed; })[0];
                if (current && !current.imageBroken) {
                    current.imageBroken = failed;
                    current.image = '';
                    if (!current.imageTried) opsQueueImages([current]);
                }
                const lead = img.closest('.ops-lead');
                if (lead) lead.classList.remove('has-photo');
                img.remove();
            });
        });
        opsQueueImages(opsNewsAll);
        paintOpsRail();
    }

    function opsNewsDayKey() {
        const now = new Date();
        return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    }

    function opsNewsFeeds() {
        const now = new Date();
        const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
        const count = Math.min(4, OPS_FEEDS.length);
        const start = day % OPS_FEEDS.length;
        const picked = [];
        for (let i = 0; i < count; i++) picked.push(OPS_FEEDS[(start + i) % OPS_FEEDS.length]);
        return picked;
    }

    let opsNewsMiss = 0;

    function loadOpsNews(force) {
        const cached = opsNewsCache();
        const today = opsNewsDayKey();
        const staleShape = cached && cached.items && cached.items.some(function (item) { return !('image' in item) || !('text' in item); });
        const sameDay = cached && cached.day === today;
        if (cached && cached.items) {
            opsNewsAt = cached.at || 0;
            paintOpsNews(cached.items, '');
        } else {
            clearTimeout(opsNewsSkelTimer);
            opsNewsSkelTimer = setTimeout(function () {
                opsNewsSkelTimer = 0;
                if (!opsNewsAll.length) paintOpsNewsSkeleton();
            }, 300);
        }
        if (opsNewsBusy) return;
        if (!force && !sameDay && opsNewsMiss && Date.now() - opsNewsMiss < 30 * 60 * 1000) return;
        if (!force && sameDay && cached.at && Date.now() - cached.at < 30 * 60 * 1000 && !staleShape) return;
        opsNewsBusy = true;
        Promise.all(opsNewsFeeds().map(function (feed) {
            const endpoint = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
            return fetch(endpoint).then(function (res) {
                if (!res.ok) throw new Error('feed');
                return res.json();
            }).then(function (payload) {
                const list = payload && payload.items;
                if (!Array.isArray(list)) return [];
                return list.slice(0, 8).map(function (item) {
                    const text = opsPlain(item.description || item.content || '');
                    return {
                        title: String(item.title || ''),
                        link: String(item.link || feed.home),
                        date: item.pubDate || '',
                        source: feed.name,
                        text: text.slice(0, 420),
                        image: opsNewsImage(item)
                    };
                });
            }).catch(function () { return []; });
        })).then(function (groups) {
            const items = groups.reduce(function (all, group) { return all.concat(group); }, []);
            items.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
            if (items.length) {
                opsNewsMiss = 0;
                opsNewsAt = Date.now();
                opsNewsCache({ at: opsNewsAt, day: opsNewsDayKey(), items: items });
                paintOpsNews(items, '');
            } else if (!(cached && cached.items && cached.items.length)) {
                opsNewsMiss = Date.now();
                paintOpsNews([], 'The feeds did not load. Open a publication directly.');
            } else opsNewsMiss = Date.now();
        }).then(function () { opsNewsBusy = false; }, function () { opsNewsBusy = false; });
    }

    window.addEventListener('focus', function () { loadOpsNews(true); });
    window.addEventListener('online', function () { loadOpsNews(true); });

    function opsReduceMotion() {
        return document.documentElement.classList.contains('reduce-motion') ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function opsCountryName(code) {
        const value = String(code || '').toUpperCase();
        if (!value) return '';
        try {
            if (!opsCountryName.names) opsCountryName.names = new Intl.DisplayNames(undefined, { type: 'region' });
            return opsCountryName.names.of(value) || value;
        } catch (error) {
            return value;
        }
    }

    function opsFresh(at) {
        const sec = Math.round((Date.now() - Number(at)) / 1000);
        if (!isFinite(sec) || sec < 0) return '';
        if (sec < 10) return 'just now';
        if (sec < 60) return sec + 's ago';
        return opsAgo(at);
    }

    function opsMapStatusLine() {}

    function opsModeThumb(instant) {
        const wrap = document.querySelector('.ops-mode');
        if (!wrap) return;
        const thumb = wrap.querySelector('.ops-mode-thumb');
        const on = wrap.querySelector('button.is-on');
        if (!thumb || !on || !(on.offsetWidth > 0)) return;
        const snap = instant || opsReduceMotion();
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.top = on.offsetTop + 'px';
        thumb.style.left = on.offsetLeft + 'px';
        thumb.style.width = on.offsetWidth + 'px';
        thumb.style.height = on.offsetHeight + 'px';
        if (snap && !opsReduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function setOpsMapMode(mode) {
        opsMapMode = mode === 'outages' ? 'outages' : (mode === 'cameras' ? 'cameras' : 'attacks');
        const attacks = $('opsMapAttacks');
        const outages = $('opsMapOutages');
        const cameras = $('opsMapCameras');
        if (attacks) attacks.classList.toggle('is-on', opsMapMode === 'attacks');
        if (outages) outages.classList.toggle('is-on', opsMapMode === 'outages');
        if (cameras) cameras.classList.toggle('is-on', opsMapMode === 'cameras');
        opsModeThumb(false);
        const range = $('opsRange');
        if (range) range.hidden = opsMapMode === 'cameras';
        const canvas = $('opsMap');
        if (canvas) canvas.setAttribute('aria-label', opsMapMode === 'cameras' ? 'Camera map' : 'World map');
        opsHideTip();
        closeOpsReport();
        opsMapStatusLine();
        paintOpsMapList();
        opsShowPinLayers();
        if (opsMapMode === 'cameras') opsEnsureCameras();
        else if (opsMapMode === 'outages') loadOpsOutages(false);
        else loadOpsAttacks(false);
    }

    let opsRealMap = null;
    let opsMapTouched = false;

    function opsFitWorld() {
        if (!opsRealMap || opsMapTouched) return;
        opsRealMap.fitBounds([[-168, -46], [180, 72]], { padding: 8, animate: false, maxZoom: 2 });
    }

    function opsScreenPoint(lon, lat) {
        if (!opsRealMap || !isFinite(Number(lon)) || !isFinite(Number(lat))) return null;
        const point = opsRealMap.project([opsNormLon(lon), Math.max(-85, Math.min(85, Number(lat)))]);
        if (!point || !isFinite(point.x) || !isFinite(point.y)) return null;
        return [point.x, point.y];
    }

    function opsOnScreen(x, y) {
        const canvas = $('opsMapDraw');
        if (!canvas) return false;
        const w = canvas.clientWidth || 0;
        const h = canvas.clientHeight || 0;
        return x >= -48 && y >= -48 && x <= w + 48 && y <= h + 48;
    }

    function opsInView(lon, lat) {
        if (!opsRealMap) return true;
        let bounds = null;
        try { bounds = opsRealMap.getBounds(); } catch (error) { return true; }
        if (!bounds) return true;
        const margin = 3;
        if (lat < bounds.getSouth() - margin || lat > bounds.getNorth() + margin) return false;
        const west = bounds.getWest();
        const east = bounds.getEast();
        if (west <= east) return lon >= west - margin && lon <= east + margin;
        return lon >= west - margin || lon <= east + margin;
    }

    function opsBindRealMap(map) {
        if (map.__orbintBound) return;
        map.__orbintBound = true;
        map.on('mousemove', function (event) {
            const hit = opsHitAt(event.point.x, event.point.y);
            const surface = map.getCanvas();
            if (surface) surface.style.cursor = hit ? 'pointer' : '';
            if (!hit) { opsHideTip(); return; }
            opsHoverHit = hit;
            opsHover = { kind: hit.kind, id: hit.id, ip: hit.ip || '' };
            opsPlaceTip(hit, event.originalEvent);
        });
        map.on('mouseout', function () { opsHideTip(); });
        map.on('click', function (event) {
            const hit = opsHitAt(event.point.x, event.point.y);
            if (!hit) {
                opsCameraFocus = null;
                opsSyncCameraFocus();
                closeOpsReport();
                return;
            }
            if (hit.kind === 'flock') {
                closeOpsReport();
                opsStreetAtCamera(hit);
                return;
            }
            opsOpenMapHit(hit);
        });
    }

    const OPS_MAP_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.1/dist/maplibre-gl.js';
    const OPS_MAP_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.1/dist/maplibre-gl.css';
    const OPS_MAP_JS_SRI = 'sha384-/L1njH4bbgNt9Uk3HwJ272N9fxJzRBQCxhtwGkZiqgl+Nxpq2ETUNZhNMNV1RgyW';
    const OPS_MAP_CSS_SRI = 'sha384-Nq6PQ+9vJPvw7U/VfDELyrWoGQMsy0gi6QShhaSrGzkpF5KkM40csg2leky+YMTd';

    function opsLoadMapLibre() {
        if (window.maplibregl) return Promise.resolve();
        if (opsLoadMapLibre.wait) return opsLoadMapLibre.wait;
        opsLoadMapLibre.wait = new Promise(function (resolve, reject) {
            if (!document.querySelector('link[data-orbint-maplibre]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = OPS_MAP_CSS;
                link.integrity = OPS_MAP_CSS_SRI;
                link.crossOrigin = 'anonymous';
                link.setAttribute('data-orbint-maplibre', '1');
                document.head.appendChild(link);
            }
            const script = document.createElement('script');
            script.src = OPS_MAP_JS;
            script.integrity = OPS_MAP_JS_SRI;
            script.crossOrigin = 'anonymous';
            script.onload = function () { resolve(); };
            script.onerror = function () { reject(new Error('map')); };
            document.head.appendChild(script);
        });
        return opsLoadMapLibre.wait;
    }

    function opsEnsureMap() {
        if (opsRealMap) return opsRealMap;
        const host = $('opsMap');
        if (!host) return null;
        if (!window.maplibregl) {
            if (!host.dataset.loading) {
                host.dataset.loading = '1';
                opsLoadMapLibre().then(function () {
                    delete host.dataset.loading;
                    opsEnsureMap();
                }).catch(function () {
                    host.classList.add('is-map-missing');
                    if (!host.dataset.warned) {
                        host.dataset.warned = '1';
                        host.textContent = 'The map library did not load. Check the network connection and refresh.';
                    }
                });
            }
            return null;
        }
        host.classList.remove('is-map-missing');
        if (host.dataset.warned) {
            host.textContent = '';
            delete host.dataset.warned;
        }
        opsRealMap = new maplibregl.Map({
            container: host,
            style: 'https://tiles.openfreemap.org/styles/dark',
            center: [0, 18],
            zoom: 0.8,
            minZoom: 0.4,
                maxZoom: 18,
            attributionControl: false,
            dragRotate: false,
            pitchWithRotate: false,
            fadeDuration: 0
        });
        opsRealMap.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
        const attrib = host.querySelector('.maplibregl-ctrl-attrib');
        if (attrib) {
            attrib.classList.add('maplibregl-compact');
            attrib.classList.remove('maplibregl-compact-show');
            attrib.removeAttribute('open');
        }
        if (opsRealMap.touchZoomRotate) opsRealMap.touchZoomRotate.disableRotation();
        if (opsRealMap.dragRotate) opsRealMap.dragRotate.disable();
        opsRealMap.on('dragstart', function () { opsMapTouched = true; });
        opsRealMap.on('zoomstart', function (event) {
            if (event.originalEvent) opsMapTouched = true;
        });
        function opsRaisePins(map) {
            ['ops-cameras', 'ops-attacks', 'ops-outages', 'ops-user-ring', 'ops-user-dot', 'ops-camera-focus'].forEach(function (id) {
                if (map.getLayer(id)) map.moveLayer(id);
            });
        }
        function opsRestorePins() {
            if (!opsRealMap || !opsRealMap.isStyleLoaded()) return;
            if (!opsRealMap.getSource('ops-attacks')) {
                try { opsInstallPinLayers(opsRealMap); } catch (error) {}
            }
            opsRaisePins(opsRealMap);
        }
        opsRealMap.on('style.load', opsRestorePins);
        opsRealMap.on('styledata', opsRestorePins);
        opsRealMap.on('idle', opsRestorePins);
        opsRealMap.on('load', function () {
            opsSyncMapSize();
            opsInstallPinLayers(opsRealMap);
        });
        opsBindRealMap(opsRealMap);
        if (typeof ResizeObserver !== 'undefined') {
            const watch = new ResizeObserver(function () { opsSyncMapSize(); });
            watch.observe(host);
        }
        requestAnimationFrame(function () { opsSyncMapSize(); });
        return opsRealMap;
    }

    function opsSyncMapSize() {
        const map = opsRealMap;
        const host = $('opsMap');
        if (!map || !host) return;
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (width < 20 || height < 20) return;
        const canvas = host.querySelector('.maplibregl-canvas');
        const stale = !canvas || Math.abs(canvas.clientWidth - width) > 1 || Math.abs(canvas.clientHeight - height) > 1;
        if (!stale) return;
        map.resize();
        opsFitWorld();
    }

    let opsPinGl = null;
    let opsPinProgram = null;
    let opsPinVariant = '';
    let opsPinMatrix = null;
    let opsPinWorld = null;
    let opsPinSize = null;
    let opsPinColor = null;
    let opsPinPos = null;
    let opsFlockMesh = null;
    let opsOsmMesh = null;
    let opsFlockDraw = 0;
    let opsOsmDraw = 0;

    function opsClearPinCanvas() {
        const canvas = $('opsMapDraw');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function opsPinFeatures(items, mapItem) {
        const features = [];
        items.forEach(function (item, index) {
            const feature = mapItem(item, index);
            if (feature) features.push(feature);
        });
        return { type: 'FeatureCollection', features: features };
    }

    function opsSyncAttackPins() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-attacks')) return;
        map.getSource('ops-attacks').setData(opsPinFeatures(opsAttacks, function (item) {
            const spot = opsAttackSpot(item);
            if (!spot || !item.ip) return null;
            return {
                type: 'Feature',
                properties: { ip: item.ip, link: opsAttackLink(item) || '' },
                geometry: { type: 'Point', coordinates: [spot.lon, spot.lat] }
            };
        }));
    }

    function opsSyncOutagePins() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-outages')) return;
        map.getSource('ops-outages').setData(opsPinFeatures(opsOutages, function (item, index) {
            const place = item.country && OPS_PLACES[item.country];
            const lon = isFinite(item.lon) ? item.lon : (place && place[0]);
            const lat = isFinite(item.lat) ? item.lat : (place && place[1]);
            if (!isFinite(lon) || !isFinite(lat)) return null;
            const meta = OPS_OUTAGE_META[item.source] || { color: '#e4e4e7' };
            return {
                type: 'Feature',
                properties: { index: index, link: item.link || '', color: meta.color },
                geometry: { type: 'Point', coordinates: [lon, lat] }
            };
        }));
    }

    function opsShowPinLayers() {
        const map = opsRealMap;
        if (!map || !map.getLayer('ops-attacks')) return;
        map.setLayoutProperty('ops-attacks', 'visibility', opsMapMode === 'attacks' ? 'visible' : 'none');
        map.setLayoutProperty('ops-outages', 'visibility', opsMapMode === 'outages' ? 'visible' : 'none');
        map.triggerRepaint();
    }

    function opsCompileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader) || 'shader';
            gl.deleteShader(shader);
            throw new Error(log);
        }
        return shader;
    }

    function opsMercatorMesh(view, offset, count) {
        const data = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            const base = offset + i * 8;
            const lat = view.getInt32(base, true) / 1000000;
            const lon = view.getInt32(base + 4, true) / 1000000;
            const coord = maplibregl.MercatorCoordinate.fromLngLat([lon, lat]);
            data[i * 2] = coord.x;
            data[i * 2 + 1] = coord.y;
        }
        return data;
    }

    function opsUploadMesh(gl, buffer, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    function opsUploadCameraPins() {
        if (!opsPinGl || !opsCameraBuf || !opsFlockMesh) return;
        const view = opsCameraBuf.view;
        opsUploadMesh(opsPinGl, opsFlockMesh, opsMercatorMesh(view, opsCameraBuf.flockAt, opsCameraBuf.flock));
        opsUploadMesh(opsPinGl, opsOsmMesh, opsMercatorMesh(view, opsCameraBuf.osmAt, opsCameraBuf.osm));
        opsFlockDraw = opsCameraBuf.flock;
        opsOsmDraw = opsCameraBuf.osm;
        const host = $('opsMap');
        if (host) host.dataset.pinCount = String(opsFlockDraw + opsOsmDraw);
    }

    function opsUseCameraProgram(gl) {
        if (opsPinProgram && opsPinVariant === 'mercator') return;
        const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
        const vertex = (webgl2 ? '#version 300 es\n' : '') +
            (webgl2 ? 'in vec2 a_pos;\n' : 'attribute vec2 a_pos;\n') +
            'uniform mat4 u_matrix;\nuniform float u_size;\nuniform float u_world;\nvoid main(){gl_Position=u_matrix*vec4(a_pos*u_world,0.0,1.0);gl_PointSize=u_size;}';
        const fragment = webgl2
            ? '#version 300 es\nprecision mediump float;\nuniform vec4 u_color;\nout vec4 fragColor;\nvoid main(){vec2 p=gl_PointCoord*2.0-1.0;if(dot(p,p)>1.0)discard;fragColor=u_color;}'
            : 'precision mediump float;\nuniform vec4 u_color;\nvoid main(){vec2 p=gl_PointCoord*2.0-1.0;if(dot(p,p)>1.0)discard;gl_FragColor=u_color;}';
        const program = gl.createProgram();
        gl.attachShader(program, opsCompileShader(gl, gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, opsCompileShader(gl, gl.FRAGMENT_SHADER, fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link');
        opsPinProgram = program;
        opsPinVariant = 'mercator';
        opsPinMatrix = gl.getUniformLocation(program, 'u_matrix');
        opsPinWorld = gl.getUniformLocation(program, 'u_world');
        opsPinSize = gl.getUniformLocation(program, 'u_size');
        opsPinColor = gl.getUniformLocation(program, 'u_color');
        opsPinPos = gl.getAttribLocation(program, 'a_pos');
    }

    function opsInstallPinLayers(map) {
        if (map.getSource('ops-attacks')) return;
        map.addSource('ops-attacks', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addSource('ops-outages', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        const dot = { 'circle-radius': 4.5, 'circle-opacity': 1, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#09090b' };
        map.addLayer({
            id: 'ops-attacks',
            type: 'circle',
            source: 'ops-attacks',
            paint: {
                'circle-radius': dot['circle-radius'],
                'circle-color': '#fb7185',
                'circle-opacity': dot['circle-opacity'],
                'circle-stroke-width': dot['circle-stroke-width'],
                'circle-stroke-color': dot['circle-stroke-color']
            }
        });
        map.addLayer({
            id: 'ops-outages',
            type: 'circle',
            source: 'ops-outages',
            paint: {
                'circle-radius': dot['circle-radius'],
                'circle-color': ['coalesce', ['get', 'color'], '#e4e4e7'],
                'circle-opacity': dot['circle-opacity'],
                'circle-stroke-width': dot['circle-stroke-width'],
                'circle-stroke-color': dot['circle-stroke-color']
            }
        });
        map.addLayer({
            id: 'ops-cameras',
            type: 'custom',
            renderingMode: '2d',
            onAdd: function (mapObj, gl) {
                opsPinGl = gl;
                opsPinProgram = null;
                opsPinVariant = '';
                opsFlockMesh = gl.createBuffer();
                opsOsmMesh = gl.createBuffer();
                opsUploadCameraPins();
            },
            render: function (gl, options) {
                const matrix = options && options.modelViewProjectionMatrix;
                if (opsMapMode !== 'cameras' || !matrix || (!opsFlockDraw && !opsOsmDraw)) return;
                try {
                    opsUseCameraProgram(gl);
                } catch (error) {
                    const host = $('opsMap');
                    if (host) host.dataset.pinError = String(error && error.message || error);
                    return;
                }
                const size = Math.max(4, 3.5 * (window.devicePixelRatio || 1));
                gl.useProgram(opsPinProgram);
                gl.uniformMatrix4fv(opsPinMatrix, false, matrix);
                gl.uniform1f(opsPinWorld, opsRealMap ? 512 * Math.pow(2, opsRealMap.getZoom()) : 512);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enableVertexAttribArray(opsPinPos);
                const draw = function (buffer, count, color, point) {
                    if (!count) return;
                    gl.uniform1f(opsPinSize, point);
                    gl.uniform4fv(opsPinColor, color);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(opsPinPos, 2, gl.FLOAT, false, 0, 0);
                    gl.drawArrays(gl.POINTS, 0, count);
                };
                draw(opsOsmMesh, opsOsmDraw, [0, 0, 0, 0.72], size + 3);
                draw(opsFlockMesh, opsFlockDraw, [0, 0, 0, 0.72], size + 3);
                draw(opsOsmMesh, opsOsmDraw, [56 / 255, 189 / 255, 248 / 255, 1], size);
                draw(opsFlockMesh, opsFlockDraw, [245 / 255, 158 / 255, 11 / 255, 1], size);
                gl.disableVertexAttribArray(opsPinPos);
            }
        });
        map.addSource('ops-user', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
            id: 'ops-user-ring',
            type: 'fill',
            source: 'ops-user',
            filter: ['==', ['get', 'kind'], 'ring'],
            paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.18 }
        });
        map.addLayer({
            id: 'ops-user-dot',
            type: 'circle',
            source: 'ops-user',
            filter: ['==', ['get', 'kind'], 'dot'],
            paint: {
                'circle-radius': 6,
                'circle-color': '#38bdf8',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fafafa'
            }
        });
        map.addSource('ops-camera-focus', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
            id: 'ops-camera-focus',
            type: 'circle',
            source: 'ops-camera-focus',
            paint: {
                'circle-radius': 8,
                'circle-color': '#f59e0b',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fafafa'
            }
        });
        opsClearPinCanvas();
        opsSyncAttackPins();
        opsSyncOutagePins();
        opsShowPinLayers();
        opsSyncUserPin();
        opsSyncCameraFocus();
    }

    let opsBasemap = 'dark';
    let opsCameraFocus = null;
    let opsUserFix = null;
    let opsUserNote = '';

    function opsBasemapStyle(id) {
        if (id === 'streets') return 'https://tiles.openfreemap.org/styles/liberty';
        if (id === 'satellite') {
            return {
                version: 8,
                sources: {
                    esri: {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
                        maxzoom: 19
                    }
                },
                layers: [{ id: 'satellite', type: 'raster', source: 'esri' }]
            };
        }
        return 'https://tiles.openfreemap.org/styles/dark';
    }

    function opsSetBasemap(id) {
        const map = opsRealMap;
        if (!map) return;
        opsBasemap = id || 'dark';
        document.querySelectorAll('[data-basemap]').forEach(function (button) {
            const on = button.getAttribute('data-basemap') === opsBasemap;
            button.classList.toggle('is-on', on);
            button.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        map.setMaxZoom(18);
        opsPinProgram = null;
        opsPinVariant = '';
        map.setStyle(opsBasemapStyle(opsBasemap));
    }

    function opsAccuracyRing(lng, lat, meters) {
        const steps = 64;
        const coords = [];
        const radius = Math.max(meters || 30, 20);
        const latRad = lat * Math.PI / 180;
        for (let step = 0; step <= steps; step++) {
            const bearing = (step / steps) * Math.PI * 2;
            const east = radius * Math.cos(bearing);
            const north = radius * Math.sin(bearing);
            coords.push([
                lng + east / (111320 * Math.cos(latRad)),
                lat + north / 110540
            ]);
        }
        return coords;
    }

    function opsSyncUserPin() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-user')) return;
        if (!opsUserFix) {
            map.getSource('ops-user').setData({ type: 'FeatureCollection', features: [] });
            return;
        }
        map.getSource('ops-user').setData({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { kind: 'ring' },
                    geometry: { type: 'Polygon', coordinates: [opsAccuracyRing(opsUserFix.lng, opsUserFix.lat, opsUserFix.accuracy)] }
                },
                {
                    type: 'Feature',
                    properties: { kind: 'dot' },
                    geometry: { type: 'Point', coordinates: [opsUserFix.lng, opsUserFix.lat] }
                }
            ]
        });
    }

    function opsPaintUserRow() {
        const node = $('opsUserPlace');
        if (!node) return;
        if (opsUserFix) {
            const meters = isFinite(opsUserFix.accuracy) ? ' ± ' + Math.round(opsUserFix.accuracy) + ' m' : '';
            node.textContent = opsUserFix.lat.toFixed(5) + ', ' + opsUserFix.lng.toFixed(5) + meters;
            return;
        }
        node.textContent = opsUserNote || 'Locating…';
    }

    function opsSyncCameraFocus() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-camera-focus')) return;
        if (!opsCameraFocus) {
            map.getSource('ops-camera-focus').setData({ type: 'FeatureCollection', features: [] });
            return;
        }
        map.getSource('ops-camera-focus').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [opsCameraFocus.lon, opsCameraFocus.lat] }
            }]
        });
    }

    function opsStreetAtCamera(hit) {
        if (!hit || !isFinite(hit.lat) || !isFinite(hit.lon)) return;
        opsCameraFocus = { lon: hit.lon, lat: hit.lat };
        opsSyncCameraFocus();
        const lat = hit.lat.toFixed(6);
        const lon = hit.lon.toFixed(6);
        const link = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lon);
        const opened = window.open(link, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    }

    function opsLocateUser(fly) {
        if (!navigator.geolocation) {
            opsUserNote = 'This browser has no location service';
            opsPaintUserRow();
            return;
        }
        opsUserNote = 'Locating…';
        opsPaintUserRow();
        navigator.geolocation.getCurrentPosition(function (pos) {
            opsUserFix = {
                lng: pos.coords.longitude,
                lat: pos.coords.latitude,
                accuracy: pos.coords.accuracy
            };
            opsUserNote = '';
            opsSyncUserPin();
            opsPaintUserRow();
            if (fly && opsRealMap) {
                opsMapTouched = true;
                opsRealMap.flyTo({
                    center: [opsUserFix.lng, opsUserFix.lat],
                    zoom: 15,
                    essential: true
                });
            }
        }, function () {
            opsUserFix = null;
            opsUserNote = 'Location was denied';
            opsSyncUserPin();
            opsPaintUserRow();
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
    }

    let opsCameraMiss = false;
    let opsCameraBuf = null;
    let opsCameraLoad = null;
    let opsPinChecked = false;
    let opsPinUseMap = false;

    let opsFlockMeta = null;
    let opsOsmCameras = [];
    let opsCameraDetails = null;
    let opsDetailsReady = false;
    let opsHoverHit = null;

    function opsEnsureCameraDetails() {
        if (opsCameraDetails) return opsCameraDetails;
        const meta = fetch('data/cameras-flock.meta').then(function (res) {
            if (!res.ok) throw new Error('meta');
            return res.arrayBuffer();
        }).then(function (buffer) {
            const view = new DataView(buffer);
            if (view.byteLength < 8 || view.getUint32(0, true) !== 0x4D42524F) throw new Error('meta');
            const count = view.getUint32(4, true);
            opsFlockMeta = { view: view, buffer: buffer, count: count, base: 8 + count * 4 };
        }).catch(function () { opsFlockMeta = null; });
        const osm = fetch('data/cameras-osm.json').then(function (res) {
            if (!res.ok) throw new Error('osm');
            return res.json();
        }).then(function (rows) {
            opsOsmCameras = Array.isArray(rows) ? rows : [];
        }).catch(function () { opsOsmCameras = []; });
        opsCameraDetails = Promise.all([meta, osm]).then(function () {
            opsDetailsReady = true;
            if (opsHoverHit && opsTipPoint) {
                opsTipKey = '';
                opsPlaceTip(opsHoverHit, opsTipPoint);
            }
        });
        return opsCameraDetails;
    }

    function opsFlockDetail(index) {
        const meta = opsFlockMeta;
        if (!meta || index < 0 || index >= meta.count) return null;
        const view = meta.view;
        const at = meta.base + view.getUint32(8 + index * 4, true);
        const angle10 = view.getInt16(at + 4, true);
        const typeLen = view.getUint8(at + 7);
        const nameLen = view.getUint16(at + 8, true);
        const bytes = new Uint8Array(meta.buffer, at + 10, typeLen + nameLen);
        const decode = new TextDecoder('utf-8');
        return {
            id: view.getUint32(at, true),
            angle: angle10 === -32768 ? null : angle10 / 10,
            service: (view.getUint8(at + 6) & 1) === 1,
            type: decode.decode(bytes.subarray(0, typeLen)),
            name: decode.decode(bytes.subarray(typeLen))
        };
    }

    function opsOsmDetail(lat, lon) {
        let best = null;
        let bestDist = 0.00015 * 0.00015;
        opsOsmCameras.forEach(function (cam) {
            const dLat = cam.lat - lat;
            const dLon = cam.lon - lon;
            const dist = dLat * dLat + dLon * dLon;
            if (dist > bestDist) return;
            bestDist = dist;
            best = cam;
        });
        return best;
    }

    function opsEnsureCameras() {
        opsEnsureCameraDetails();
        if (opsCameraBuf) return Promise.resolve(opsCameraBuf);
        if (opsCameraLoad) return opsCameraLoad;
        opsCameraLoad = fetch(OPS_FLOCK.file || 'data/cameras.bin').then(function (res) {
            if (!res.ok) throw new Error('cameras');
            return res.arrayBuffer();
        }).then(function (buffer) {
            const view = new DataView(buffer);
            if (view.byteLength < 12 || view.getUint32(0, true) !== 0x3142524F) throw new Error('cameras');
            const flock = view.getUint32(4, true);
            const osm = view.getUint32(8, true);
            if (12 + (flock + osm) * 8 !== view.byteLength) throw new Error('cameras');
            opsCameraBuf = { view: view, flock: flock, osm: osm, flockAt: 12, osmAt: 12 + flock * 8 };
            opsUploadCameraPins();
            if (opsRealMap) opsRealMap.triggerRepaint();
            return opsCameraBuf;
        }).catch(function () {
            opsCameraLoad = null;
            opsCameraMiss = true;
            opsMapStatusLine();
        });
        return opsCameraLoad;
    }

    function opsPinFrame() {
        const map = opsRealMap;
        const center = map.getCenter();
        const zoom = map.getZoom();
        const scale = 512 * Math.pow(2, zoom);
        const lat = Math.max(-85.051129, Math.min(85.051129, center.lat));
        const sine = Math.sin(lat * Math.PI / 180);
        const host = map.getContainer();
        return {
            lng: center.lng,
            scale: scale,
            cx: (center.lng + 180) / 360 * scale,
            cy: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
            hw: (host.clientWidth || 0) / 2,
            hh: (host.clientHeight || 0) / 2
        };
    }

    function opsPinPoint(lon, lat, frame) {
        let xLon = lon;
        const turn = xLon - frame.lng;
        if (turn > 180) xLon -= 360;
        else if (turn < -180) xLon += 360;
        const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
        const sine = Math.sin(clamped * Math.PI / 180);
        const x = (xLon + 180) / 360 * frame.scale - frame.cx + frame.hw;
        const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * frame.scale - frame.cy + frame.hh;
        return [x, y];
    }

    function opsPinTrust() {
        if (opsPinChecked || !opsRealMap) return;
        opsPinChecked = true;
        const frame = opsPinFrame();
        const samples = [[-122.4194, 37.7749], [-0.1276, 51.5072], [139.6917, 35.6895], [4.9041, 52.3676]];
        let worst = 0;
        samples.forEach(function (pair) {
            const exact = opsRealMap.project(pair);
            const fast = opsPinPoint(pair[0], pair[1], frame);
            worst = Math.max(worst, Math.abs(exact.x - fast[0]), Math.abs(exact.y - fast[1]));
        });
        opsPinUseMap = worst > 1.5;
        const canvas = $('opsMapDraw');
        if (canvas) canvas.dataset.pin = worst.toFixed(2);
    }

    function opsFlockPlace(lat, lon) {
        const latAbs = Math.abs(lat).toFixed(5);
        const lonAbs = Math.abs(lon).toFixed(5);
        return latAbs + '°' + (lat >= 0 ? 'N' : 'S') + ', ' + lonAbs + '°' + (lon >= 0 ? 'E' : 'W');
    }

    function opsCameraXY(lon, lat, frame) {
        if (opsPinUseMap && opsRealMap) {
            const point = opsRealMap.project([lon, lat]);
            return [point.x, point.y];
        }
        return opsPinPoint(lon, lat, frame);
    }

    let opsCameraStamp = '';
    let opsCameraSheet = null;

    function paintOpsFlockDots(ctx) {
        if (!opsCameraBuf) {
            opsEnsureCameras();
            return;
        }
        opsPinTrust();
        const frame = opsPinFrame();
        const canvas = $('opsMapDraw');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width;
        const height = canvas.height;
        const center = opsRealMap.getCenter();
        const stamp = center.lng.toFixed(6) + ',' + center.lat.toFixed(6) + ',' + opsRealMap.getZoom().toFixed(4) + ',' + width + 'x' + height + (opsPinUseMap ? ':m' : ':f');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (opsCameraSheet && opsCameraStamp === stamp) {
            ctx.drawImage(opsCameraSheet, 0, 0);
            return;
        }
        const img = ctx.createImageData(width, height);
        const data = img.data;
        const view = opsCameraBuf.view;
        const plot = function (offset, count, red, green, blue) {
            const end = offset + count * 8;
            for (let cursor = offset; cursor < end; cursor += 8) {
                const lat = view.getInt32(cursor, true) / 1000000;
                const lon = view.getInt32(cursor + 4, true) / 1000000;
                const xy = opsCameraXY(lon, lat, frame);
                const x = (xy[0] * dpr) | 0;
                const y = (xy[1] * dpr) | 0;
                if (x < 0 || y < 0 || x >= width || y >= height) continue;
                const index = (y * width + x) * 4;
                data[index] = red;
                data[index + 1] = green;
                data[index + 2] = blue;
                data[index + 3] = 235;
            }
        };
        plot(opsCameraBuf.osmAt, opsCameraBuf.osm, 56, 189, 248);
        plot(opsCameraBuf.flockAt, opsCameraBuf.flock, 245, 158, 11);
        if (!opsCameraSheet) opsCameraSheet = document.createElement('canvas');
        opsCameraSheet.width = width;
        opsCameraSheet.height = height;
        opsCameraSheet.getContext('2d').putImageData(img, 0, 0);
        opsCameraStamp = stamp;
        ctx.drawImage(opsCameraSheet, 0, 0);
    }

    function opsCameraHit(x, y) {
        if (!opsCameraBuf || !opsRealMap) return null;
        opsPinTrust();
        const frame = opsPinFrame();
        const here = opsRealMap.unproject([x, y]);
        const span = Math.max(0.02, (14 * 360) / frame.scale);
        const view = opsCameraBuf.view;
        let best = null;
        let bestDist = 36;
        const scan = function (offset, count, osm) {
            const end = offset + count * 8;
            for (let cursor = offset; cursor < end; cursor += 8) {
                const lat = view.getInt32(cursor, true) / 1000000;
                const lon = view.getInt32(cursor + 4, true) / 1000000;
                if (Math.abs(lat - here.lat) > span) continue;
                let turn = Math.abs(lon - here.lng);
                if (turn > 180) turn = 360 - turn;
                if (turn > span) continue;
                const xy = opsCameraXY(lon, lat, frame);
                const dx = xy[0] - x;
                const dy = xy[1] - y;
                const dist = dx * dx + dy * dy;
                if (dist > bestDist) continue;
                bestDist = dist;
                best = {
                    x: xy[0],
                    y: xy[1],
                    r: 6,
                    kind: 'flock',
                    id: lat + '|' + lon + '|' + (osm ? 'osm' : 'flock'),
                    lat: lat,
                    lon: lon,
                    index: (cursor - offset) / 8,
                    flock: osm ? 0 : 1,
                    osm: osm ? 1 : 0
                };
            }
        };
        scan(opsCameraBuf.osmAt, opsCameraBuf.osm, true);
        scan(opsCameraBuf.flockAt, opsCameraBuf.flock, false);
        return best;
    }

    function opsSeed(text) {
        let n = 0;
        const value = String(text || '');
        for (let i = 0; i < value.length; i++) n = (n * 33 + value.charCodeAt(i)) >>> 0;
        return n;
    }

    function paintOpsMapFrame(now) {
        const stage = document.querySelector('.ops-globe-stage');
        const canvas = $('opsMapDraw');
        if (!stage || !canvas) return;
        const bounds = stage.getBoundingClientRect();
        if (bounds.width < 20 || bounds.height < 20) return;
        const map = opsEnsureMap();
        if (!map) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round(bounds.width * dpr));
        const h = Math.max(1, Math.round(bounds.height * dpr));
        if (canvas.width !== w || canvas.height !== h || opsMapBox.w !== w || opsMapBox.h !== h) {
            canvas.width = w;
            canvas.height = h;
            opsMapBox.w = w;
            opsMapBox.h = h;
            map.resize();
            opsFitWorld();
        }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, bounds.width, bounds.height);
        opsMapHits = [];
        if (opsMapMode === 'outages') paintOpsOutageDots(ctx);
        else if (opsMapMode === 'cameras') paintOpsFlockDots(ctx);
        else paintOpsAttackDots(ctx);
    }

    function opsQuad(a, b, c, t) {
        const u = 1 - t;
        return [
            u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
            u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]
        ];
    }

    function opsPortDetail(port) {
        const n = String(port || '').replace(/\D/g, '');
        if (!n) return '';
        const name = OPS_PORTS[n];
        return name ? 'port ' + n + ' (' + name + ')' : 'port ' + n;
    }

    function opsNormLon(lon) {
        let x = Number(lon) || 0;
        while (x < -180) x += 360;
        while (x > 180) x -= 360;
        return x;
    }

    function opsLandOn(lon, lat) {
        if (!opsLandRaw) opsLandRaw = atob(OPS_LAND.bits);
        const cols = OPS_LAND.cols;
        const rows = OPS_LAND.rows;
        const col = Math.floor(((opsNormLon(lon) + 180) / 360) * cols);
        const row = Math.floor(((90 - Number(lat)) / 180) * rows);
        if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
        const i = row * cols + col;
        return (opsLandRaw.charCodeAt(i >> 3) & (1 << (i % 8))) !== 0;
    }

    function opsCountryAt(lon, lat) {
        if (!opsCountryRaw) opsCountryRaw = atob(OPS_COUNTRY.bits);
        const cols = OPS_COUNTRY.cols;
        const rows = OPS_COUNTRY.rows;
        const col = Math.floor(((opsNormLon(lon) + 180) / 360) * cols);
        const row = Math.floor(((90 - Number(lat)) / 180) * rows);
        if (col < 0 || row < 0 || col >= cols || row >= rows) return '';
        return OPS_COUNTRY.codes[opsCountryRaw.charCodeAt(row * cols + col)] || '';
    }

    function opsLandCell(lon, lat) {
        const cols = OPS_LAND.cols;
        const rows = OPS_LAND.rows;
        const col = Math.max(0, Math.min(cols - 1, Math.floor(((opsNormLon(lon) + 180) / 360) * cols)));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(((90 - Number(lat)) / 180) * rows)));
        return [-180 + (col + 0.5) * (360 / cols), 90 - (row + 0.5) * (180 / rows)];
    }

    function opsAttackAim(lon, lat, bearing, code) {
        const east = Math.cos(bearing);
        const north = Math.sin(bearing);
        const trail = [];
        for (let step = 1; step <= 48; step++) {
            const dist = step * 1.4;
            const nextLat = lat + north * dist;
            if (nextLat > 78 || nextLat < -70) break;
            const nextLon = lon + east * dist;
            if (opsCountryAt(nextLon, nextLat) !== code || !opsLandOn(nextLon, nextLat)) {
                if (trail.length || step > 4) break;
                continue;
            }
            const cell = opsLandCell(nextLon, nextLat);
            const prev = trail[trail.length - 1];
            if (!prev || prev[0] !== cell[0] || prev[1] !== cell[1]) trail.push(cell);
        }
        return trail.length ? trail[trail.length - 1] : null;
    }

    function opsStrokeArc(ctx, a, b, c, from, to) {
        const steps = 16;
        let point = opsQuad(a, b, c, from);
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        for (let step = 1; step <= steps; step++) {
            point = opsQuad(a, b, c, from + (to - from) * (step / steps));
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    }

    function opsAttackSpot(item, slot, w, h) {
        const hasLon = item.lon !== null && item.lon !== undefined && item.lon !== '' && isFinite(Number(item.lon));
        const hasLat = item.lat !== null && item.lat !== undefined && item.lat !== '' && isFinite(Number(item.lat));
        let lon = hasLon ? Number(item.lon) : NaN;
        let lat = hasLat ? Number(item.lat) : NaN;
        if (!isFinite(lon) || !isFinite(lat)) return null;
        while (lon < -180) lon += 360;
        while (lon > 180) lon -= 360;
        if (lat < -90 || lat > 90) return null;
        return { lon: lon, lat: lat };
    }

    function opsMapDot(ctx, x, y, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    function opsAttackLink(item) {
        const story = item && opsStoryForAttack(item);
        if (story && story.link) return story.link;
        if (!item || !item.ip) return '';
        return 'https://isc.sans.edu/ipdetails.html?ip=' + encodeURIComponent(item.ip);
    }

    function paintOpsAttackDots(ctx) {
        opsAttacks.forEach(function (item) {
            if (!item.ip) return;
            const spot = opsAttackSpot(item);
            const point = spot && opsScreenPoint(spot.lon, spot.lat);
            if (!point || !opsOnScreen(point[0], point[1])) return;
            opsMapDot(ctx, point[0], point[1], '#fb7185');
            opsMapHits.push({
                x: point[0],
                y: point[1],
                r: 8,
                kind: 'ip',
                id: item.ip,
                ip: item.ip,
                link: opsAttackLink(item)
            });
        });
    }

    function paintOpsOutageDots(ctx) {
        opsOutages.forEach(function (item, index) {
            if (!item.country || !OPS_PLACES[item.country]) return;
            const meta = OPS_OUTAGE_META[item.source] || { color: '#e4e4e7' };
            const place = OPS_PLACES[item.country];
            const lon = isFinite(item.lon) ? item.lon : place[0];
            const lat = isFinite(item.lat) ? item.lat : place[1];
            const point = opsScreenPoint(lon, lat);
            if (!point || !opsOnScreen(point[0], point[1])) return;
            opsMapDot(ctx, point[0], point[1], meta.color);
            opsMapHits.push({
                x: point[0],
                y: point[1],
                r: 8,
                kind: 'outage',
                id: String(index),
                link: item.link || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard'
            });
        });
    }

    function paintOpsMapList() {
        const key = $('opsMapKey');
        if (!key) return;
        key.hidden = false;
        if (opsMapMode === 'outages') {
            key.innerHTML = Object.keys(OPS_OUTAGE_META).map(function (id) {
                const meta = OPS_OUTAGE_META[id];
                return '<span><i style="background:' + meta.color + '"></i>' + esc(meta.label) + '</span>';
            }).join('');
            return;
        }
        if (opsMapMode === 'cameras') {
            key.innerHTML = '<span><i style="background:#f59e0b"></i>Flock</span><span><i style="background:#38bdf8"></i>ALPR</span>';
            return;
        }
        key.innerHTML = '<span><i style="background:#fb7185"></i>Attack</span>';
    }

    function opsSessionCache(key, next, ttl) {
        const life = ttl || 10 * 60 * 1000;
        if (next) {
            try { sessionStorage.setItem(key, JSON.stringify(next)); } catch (error) {}
            return next;
        }
        try {
            const saved = JSON.parse(sessionStorage.getItem(key) || '');
            if (saved && saved.at && Date.now() - saved.at < life) return saved;
        } catch (error) {}
        return null;
    }

    function opsPortCacheGet() {
        if (opsPortCache) return opsPortCache;
        try { opsPortCache = JSON.parse(sessionStorage.getItem('orbint-ops-ports2') || '{}') || {}; }
        catch (error) { opsPortCache = {}; }
        return opsPortCache;
    }

    function opsRememberPort(ip, port) {
        const cache = opsPortCacheGet();
        cache[ip] = { port: String(port || ''), at: Date.now() };
        try { sessionStorage.setItem('orbint-ops-ports2', JSON.stringify(cache)); } catch (error) {}
    }

    function opsKnownPort(ip) {
        const row = opsPortCacheGet()[ip];
        if (!row || Date.now() - row.at > 30 * 60 * 1000) return null;
        return String(row.port || '');
    }

    function opsTopPort(payload) {
        let rows = payload;
        if (payload && !Array.isArray(payload)) {
            const root = payload.ipdetails || payload;
            rows = root && (root.report || root.reports);
        }
        if (!rows) return '';
        if (!Array.isArray(rows)) rows = [rows];
        const counts = {};
        rows.forEach(function (row) {
            const port = String((row && (row.targetport || row.target_port)) || '').replace(/\D/g, '');
            if (!port) return;
            counts[port] = (counts[port] || 0) + 1;
        });
        let best = '';
        let n = 0;
        Object.keys(counts).forEach(function (port) {
            if (counts[port] > n) { best = port; n = counts[port]; }
        });
        return best;
    }

    function opsFillPorts(items) {
        opsPortStop = false;
        const pending = [];
        (items || []).forEach(function (item) {
            const known = opsKnownPort(item.ip);
            if (known !== null) { item.port = known; return; }
            pending.push(item);
        });
        let chain = Promise.resolve();
        pending.slice(0, 6).forEach(function (item) {
            chain = chain.then(function () {
                if (opsPortStop || !item.ip) return null;
                return fetch('https://isc.sans.edu/api/ipdetails/' + encodeURIComponent(item.ip) + '?json').then(function (res) {
                    if (res.status === 429) { opsPortStop = true; return null; }
                    if (!res.ok) return null;
                    const type = res.headers.get('content-type') || '';
                    if (type.indexOf('json') < 0) return null;
                    return res.json();
                }).then(function (payload) {
                    if (!payload) {
                        opsPortMiss[item.ip] = true;
                        if (opsReportKey) paintOpsReport();
                        return;
                    }
                    const port = opsTopPort(payload);
                    item.port = port;
                    delete opsPortMiss[item.ip];
                    opsRememberPort(item.ip, port);
                    paintOpsMapList();
                    if (opsReportKey) paintOpsReport();
                }).catch(function () {
                    opsPortMiss[item.ip] = true;
                    if (opsReportKey) paintOpsReport();
                });
            });
        });
    }

    function closeOpsReport() {
        opsReportKey = '';
        const box = $('opsReport');
        if (!box) return;
        box.hidden = true;
        box.innerHTML = '';
    }

    function opsOpenMapHit(hit) {
        if (!hit) return;
        let link = hit.link || '';
        if (!link && hit.kind === 'outage') {
            const item = opsOutages[Number(hit.id)];
            link = (item && item.link) || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
        }
        if (!link && hit.ip) link = opsAttackLink(opsAttacks.filter(function (row) { return row.ip === hit.ip; })[0]);
        if (!link) return;
        const opened = window.open(link, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    }

    function paintOpsReport() {
        const box = $('opsReport');
        if (!box || !opsReportKey) return;
        const split = opsReportKey.indexOf(':');
        const kind = opsReportKey.slice(0, split);
        const id = opsReportKey.slice(split + 1);
        let html = '';
        if (kind === 'flock') {
            const parts = id.split('|');
            const lat = Number(parts[0]);
            const lon = Number(parts[1]);
            if (!isFinite(lat) || !isFinite(lon)) { closeOpsReport(); return; }
            const which = parts[2] === 'osm' ? 'an OSM ALPR camera' : 'a Flock camera';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>Camera at ' + esc(opsFlockPlace(lat, lon)) +
                '</h3><p>This dot is ' + which + ', plotted on its published coordinates. A click opens that exact point in Google Maps.</p><p>Flock coordinates are the public inventory from Joshua Michael, 2026, the set published at Flock Surveillance. OSM points are DeFlock and OpenStreetMap contributors.</p><p>' +
                '<a href="https://flocksurveillance.org/" target="_blank" rel="noopener noreferrer">Flock Surveillance</a> · ' +
                '<a href="https://github.com/FoggedLens/deflock" target="_blank" rel="noopener noreferrer">DeFlock</a> · ' +
                '<a href="https://dontgetflocked.com/" target="_blank" rel="noopener noreferrer">DeFlock map</a></p>';
        } else if (kind === 'outage') {
            const item = opsOutages[Number(id)];
            if (!item) { closeOpsReport(); return; }
            const meta = OPS_OUTAGE_META[item.source] || { label: 'Outage' };
            const where = item.country ? opsCountryName(item.country) : '';
            const link = item.link || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>' + esc(item.name || 'Outage') +
                '</h3><p>' + esc([meta.label, item.level, where, item.time ? opsAgo(item.time) : ''].filter(Boolean).join(' · ')) +
                '</p><p>This is a live IODA alert for this network.</p><a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Open the IODA record</a>';
        } else {
            const rows = kind === 'ip'
                ? opsAttacks.filter(function (item) { return item.ip === id; })
                : opsAttacks.filter(function (item) { return item.country === id; });
            if (!rows.length) { closeOpsReport(); return; }
            const place = rows[0].country ? opsCountryName(rows[0].country) : 'Unlocated source';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>' + esc(rows[0].ip) +
                '</h3><p>' + esc([rows[0].city, place !== 'Unlocated source' ? place : '', (rows[0].count || 0) + ' reports', opsAttackWindowLabel()].filter(Boolean).join(' · ')) +
                '</p><p>The dot is the located address SANS recorded as an attack source. Sensor locations are not published.</p><ul>' +
                rows.map(function (item) {
                    const aim = item.port
                        ? ('Most often ' + opsPortDetail(item.port) + '.')
                        : (opsKnownPort(item.ip) === '' ? 'The latest report has no destination port.' : (opsPortMiss[item.ip] ? 'The destination port did not load. Open the SANS report.' : 'Reading the destination port…'));
                    const link = 'https://isc.sans.edu/ipdetails.html?ip=' + encodeURIComponent(item.ip);
                    return '<li><b>' + esc(item.ip) + '</b><span>' + esc((item.count || 0) + ' reports. ' + aim) +
                        '</span><a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Open the SANS report</a></li>';
                }).join('') + '</ul>';
        }
        box.innerHTML = html;
        box.hidden = false;
    }

    function opsFlagImg(code) {
        const value = String(code || '').toUpperCase();
        if (!/^[A-Z]{2}$/.test(value)) return '';
        return '<img alt="" src="https://flagcdn.com/w320/' + value.toLowerCase() + '.png" onerror="this.remove()">';
    }

    function opsAttackWindowLabel() {
        return ({ live: 'Live', day: 'Last day', week: 'Last week', month: 'Last month', year: 'Last year', decade: 'Last decade' })[opsAttackRange] || 'Live';
    }

    function opsStoryForAttack(item) {
        const country = item.country ? opsCountryName(item.country).toLowerCase() : '';
        const city = String(item.city || '').toLowerCase();
        const port = item.port ? String(opsPortDetail(item.port) || '').toLowerCase() : '';
        let best = null;
        let bestScore = 0;
        opsNewsAll.forEach(function (story) {
            const hay = ((story.title || '') + ' ' + (story.text || '')).toLowerCase();
            let points = 0;
            if (country && country.length > 3 && hay.indexOf(country) >= 0) points += 3;
            if (city && city.length > 2 && hay.indexOf(city) >= 0) points += 2;
            if (port && port.length > 2 && hay.indexOf(port) >= 0) points += 1;
            if (points > bestScore || (points && points === bestScore && (story.date || 0) > ((best && best.date) || 0))) {
                best = story;
                bestScore = points;
            }
        });
        return bestScore ? best : null;
    }

    function opsAttackTip(hit) {
        const item = opsAttacks.filter(function (row) { return row.ip === hit.ip; })[0];
        if (!item) return '';
        const story = opsStoryForAttack(item);
        if (story && !story.image && !story.imageTried) opsQueueImages([story]);
        const picture = story && story.image
            ? '<img alt="" referrerpolicy="no-referrer" src="' + esc(story.image) + '" onerror="this.remove()">'
            : opsFlagImg(item.country);
        const headline = story && story.title ? story.title : 'No matching article yet';
        const where = [item.city, item.country ? opsCountryName(item.country) : ''].filter(Boolean).join(', ');
        const port = item.port ? opsPortDetail(item.port) : 'port still loading';
        const facts = [item.ip, (item.count || 0) + ' reports', port, where].filter(Boolean).join(' · ');
        const note = story && story.link ? 'Click to open the article.' : 'Click to open the SANS source.';
        return picture + '<strong>' + esc(headline) + '</strong><p>' + esc(facts) + '</p><p>' + esc(note) + '</p>';
    }

    function opsCameraCard(hit) {
        const titleCase = function (text) {
            const value = String(text || '').replace(/[_-]+/g, ' ').trim();
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1);
        };
        const row = function (label, value) {
            if (!value) return '';
            return '<div class="ops-cam-row"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
        };
        let title = 'ALPR Camera';
        let id = '';
        let maker = hit.osm ? 'OpenStreetMap' : 'Flock Safety';
        let zone = '';
        let kind = '';
        let facing = '';
        if (hit.osm) {
            const found = opsOsmDetail(hit.lat, hit.lon);
            if (found) {
                id = found.id ? String(found.id) : '';
                if (found.maker) maker = found.maker;
                if (found.zone) zone = titleCase(found.zone);
                if (found.kind) title = titleCase(found.kind) + ' Camera';
                if (found.facing != null && found.facing !== '') facing = found.facing + '°';
            }
        } else {
            const found = opsFlockDetail(hit.index);
            if (found) {
                if (found.name) title = found.name;
                if (found.id) id = String(found.id);
                if (found.type) kind = titleCase(found.type);
                if (found.angle != null) facing = Math.round(found.angle) + '°';
            }
        }
        const mark = '<svg class="ops-cam-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="8" fill="#18181b"/><path fill="#e4e4e7" d="M10 16h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3zm20 5 9-4v16l-9-4V21z"/></svg>';
        return '<div class="ops-cam"><div class="ops-cam-top">' + mark +
            '<div><strong>' + esc(title) + '</strong>' +
            (id ? '<p class="ops-cam-id">ID: ' + esc(id) + '</p>' : '') +
            '</div></div>' +
            row('Made by', maker) +
            row('Zone', zone) +
            row('Type', kind) +
            row('Facing', facing) +
            row('Coords', hit.lat.toFixed(5) + ', ' + hit.lon.toFixed(5)) +
            '<p class="ops-cam-go">Click to open this camera in Google Maps.</p></div>';
    }

    function opsFlockTip(hit) {
        return opsCameraCard(hit);
    }

    function opsOutageTip(hit) {
        const item = opsOutages[Number(hit.id)];
        if (!item) return '';
        const meta = OPS_OUTAGE_META[item.source] || { label: 'Outage' };
        const where = item.country ? opsCountryName(item.country) : '';
        return opsFlagImg(item.country) + '<strong>' + esc(item.name || 'Outage') + '</strong><p>' +
            esc([meta.label, item.level, where, item.time ? opsAgo(item.time) : ''].filter(Boolean).join(' · ')) +
            '</p><p>IODA alert for this network.</p>';
    }

    function opsHideTip() {
        const tip = $('opsMapTip');
        opsHover = null;
        opsHoverHit = null;
        if (!tip || tip.hidden) return;
        opsTipKey = '';
        tip.hidden = true;
        tip.innerHTML = '';
        tip.classList.remove('is-cam');
    }

    function opsPlaceTip(hit, event) {
        const tip = $('opsMapTip');
        const stage = tip && tip.parentElement;
        if (!tip || !stage) return;
        opsTipPoint = event;
        const html = hit.kind === 'flock' ? opsFlockTip(hit) : (hit.kind === 'outage' ? opsOutageTip(hit) : opsAttackTip(hit));
        if (!html) { opsHideTip(); return; }
        tip.classList.toggle('is-cam', hit.kind === 'flock');
        const key = hit.kind + ':' + (hit.ip || hit.id) + (hit.kind === 'flock' && opsDetailsReady ? ':d' : '');
        if (opsTipKey !== key) {
            opsTipKey = key;
            tip.innerHTML = html;
        }
        tip.hidden = false;
        const bounds = stage.getBoundingClientRect();
        const width = tip.offsetWidth;
        const height = tip.offsetHeight;
        let left = event.clientX - bounds.left + 16;
        let top = event.clientY - bounds.top + 16;
        if (left + width > bounds.width - 8) left = event.clientX - bounds.left - width - 14;
        if (top + height > bounds.height - 8) top = Math.max(8, bounds.height - height - 8);
        if (left < 8) left = 8;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

    function opsLayerHit(x, y) {
        if (!opsRealMap) return null;
        const layer = opsMapMode === 'outages' ? 'ops-outages' : 'ops-attacks';
        if (!opsRealMap.getLayer(layer)) return null;
        let found = [];
        try { found = opsRealMap.queryRenderedFeatures([x, y], { layers: [layer] }); } catch (error) { return null; }
        if (!found.length) return null;
        const props = found[0].properties || {};
        if (opsMapMode === 'outages') {
            return { x: x, y: y, r: 8, kind: 'outage', id: String(props.index), link: props.link || '' };
        }
        return { x: x, y: y, r: 8, kind: 'ip', id: props.ip || '', ip: props.ip || '', link: props.link || '' };
    }

    function opsHitAt(x, y) {
        if (opsMapMode === 'cameras') return opsCameraHit(x, y);
        const layered = opsLayerHit(x, y);
        if (layered) return layered;
        let best = null;
        let bestDist = Infinity;
        opsMapHits.forEach(function (hit) {
            const dx = x - hit.x;
            const dy = y - hit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= hit.r && dist < bestDist) { best = hit; bestDist = dist; }
        });
        return best;
    }

    function opsAttackStartDate() {
        const days = { day: 1, week: 7, month: 30, year: 365, decade: 3650 }[opsAttackRange];
        if (!days) return '';
        const date = new Date(Date.now() - days * 86400000);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return date.getUTCFullYear() + '-' + month + '-' + day;
    }

    function opsUtcDay(offset) {
        const date = new Date(Date.now() - (offset || 0) * 86400000);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return date.getUTCFullYear() + '-' + month + '-' + day;
    }

    function opsAttackPlaceNote(items, range) {
        const list = items || [];
        const placed = list.filter(function (item) { return isFinite(item.lat) && isFinite(item.lon); }).length;
        if (!placed) return '';
        const windowNote = (range === 'month' || range === 'year' || range === 'decade') ? ' · public feed covers 30 days' : (range === 'live' ? ' · today and 30-day sources' : '');
        const of = list.length > placed ? ' of ' + list.length : '';
        return opsAttackWindowLabel() + windowNote + ' · ' + placed + of + ' sources · SANS ISC';
    }

    function opsAttackRecord(row, seen) {
        const ip = String(row.ip || row.source || '').trim();
        if (!ip) return null;
        const known = opsKnownPort(ip);
        return {
            ip: ip,
            count: Number(row.attacks || row.reports) || 0,
            country: '',
            city: '',
            lat: NaN,
            lon: NaN,
            port: known === null ? '' : known,
            seen: String(row.lastseen || seen || '')
        };
    }

    function opsReadAttackJson(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error('feed');
            return res.json();
        });
    }

    function opsMergeAttackDays(lists) {
        const byIp = {};
        lists.forEach(function (rows) {
            (Array.isArray(rows) ? rows : []).forEach(function (row) {
                const item = opsAttackRecord(row, '');
                if (!item) return;
                const prev = byIp[item.ip];
                if (!prev) byIp[item.ip] = item;
                else if (item.count > prev.count) {
                    item.count += prev.count;
                    byIp[item.ip] = item;
                } else prev.count += item.count;
            });
        });
        return Object.keys(byIp).map(function (ip) { return byIp[ip]; }).sort(function (a, b) { return b.count - a.count; });
    }

    function opsFetchAttackList(range) {
        const dayLists = function (count, limit) {
            const jobs = [];
            for (let day = 0; day < count; day++) {
                jobs.push(opsReadAttackJson('https://isc.sans.edu/api/topips/attacks/' + limit + '/' + opsUtcDay(day) + '?json').catch(function () { return []; }));
            }
            return jobs;
        };
        let jobs = [];
        if (range === 'week') jobs = dayLists(7, 500);
        else if (range === 'live' || range === 'day') {
            const day = range === 'live' ? opsUtcDay(0) : opsAttackStartDate();
            jobs = [
                opsReadAttackJson('https://isc.sans.edu/api/topips/attacks/1000/' + day + '?json').catch(function () { return []; }),
                opsReadAttackJson('https://isc.sans.edu/api/sources/attacks/500?json').catch(function () { return []; })
            ];
        } else {
            jobs = [opsReadAttackJson('https://isc.sans.edu/api/sources/attacks/500?json').catch(function () { return []; })].concat(dayLists(14, 200));
        }
        return Promise.all(jobs).then(opsMergeAttackDays);
    }

    function opsGeoCacheKey() {
        return 'orbint-ops-geo-city';
    }

    function opsCoarsePoint(lat, lon) {
        return Math.abs(lat - 37.751) < 0.02 && Math.abs(lon + 97.822) < 0.02;
    }

    function opsReadGeo(item, geo) {
        const lat = Number(geo.latitude != null ? geo.latitude : geo.lat);
        const lon = Number(geo.longitude != null ? geo.longitude : geo.lon);
        if (!isFinite(lat) || !isFinite(lon) || opsCoarsePoint(lat, lon)) return false;
        item.lat = lat;
        item.lon = lon;
        item.city = String(geo.city || '');
        const code = String(geo.country_code || geo.country || '').toUpperCase();
        if (/^[A-Z]{2}$/.test(code)) item.country = code;
        return true;
    }

    function opsFetchGeo(item) {
        const primary = 'https://json.geoiplookup.io/' + encodeURIComponent(item.ip);
        const timed = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(8000) } : {};
        return fetch(primary, timed).then(function (res) {
            if (!res.ok) throw new Error('geo');
            return res.json();
        }).then(function (geo) {
            opsReadGeo(item, geo);
        }).catch(function () {});
    }

    function opsApplyGeoRow(item, geo) {
        if (!geo) return false;
        return opsReadGeo(item, {
            latitude: geo.lat != null ? geo.lat : geo.latitude,
            longitude: geo.lon != null ? geo.lon : geo.longitude,
            city: geo.city,
            country_code: geo.countryCode || geo.country_code || geo.country
        });
    }

    function opsLocateSerial(items) {
        let cursor = 0;
        const worker = function () {
            if (cursor >= items.length) return Promise.resolve();
            const item = items[cursor++];
            return opsFetchGeo(item).then(worker);
        };
        const lanes = [];
        const width = Math.min(6, items.length || 1);
        for (let lane = 0; lane < width; lane++) lanes.push(worker());
        return Promise.all(lanes);
    }

    function opsGeoBatch(items) {
        if (!items.length) return Promise.resolve();
        if (location.protocol === 'https:') return opsLocateSerial(items);
        const timed = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(12000) } : {};
        return fetch('http://ip-api.com/batch?fields=status,countryCode,city,lat,lon,query', Object.assign({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items.map(function (item) { return item.ip; }))
        }, timed)).then(function (res) {
            if (!res.ok) throw new Error('geo');
            return res.json();
        }).then(function (rows) {
            const byIp = {};
            (Array.isArray(rows) ? rows : []).forEach(function (row) {
                if (row && row.query && row.status === 'success') byIp[row.query] = row;
            });
            const missed = [];
            items.forEach(function (item) {
                if (!opsApplyGeoRow(item, byIp[item.ip])) missed.push(item);
            });
            if (missed.length) return opsLocateSerial(missed.slice(0, 12));
        });
    }

    function opsLocateAttacks(items, onPaint) {
        let cache = {};
        try {
            const raw = sessionStorage.getItem(opsGeoCacheKey());
            const data = raw ? JSON.parse(raw) : {};
            if (data && typeof data === 'object') cache = data;
        } catch (error) { cache = {}; }
        const need = [];
        items.forEach(function (item) {
            const saved = cache[item.ip];
            if (saved && isFinite(saved.lat) && isFinite(saved.lon) && !opsCoarsePoint(saved.lat, saved.lon) && Date.now() - (saved.at || 0) < 6 * 3600000) {
                item.lat = saved.lat;
                item.lon = saved.lon;
                item.city = saved.city || '';
                if (!item.country) item.country = saved.country || '';
                return;
            }
            need.push(item);
        });
        need.sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
        const todo = need.slice(0, 1000);
        const save = function () {
            items.forEach(function (item) {
                if (!isFinite(item.lat) || !isFinite(item.lon)) return;
                cache[item.ip] = { lat: item.lat, lon: item.lon, city: item.city, country: item.country, at: Date.now() };
            });
            try { sessionStorage.setItem(opsGeoCacheKey(), JSON.stringify(cache)); } catch (error) { /* the dots still use this response */ }
        };
        if (onPaint) onPaint();
        let failed = false;
        const step = function () {
            if (!todo.length || failed) {
                save();
                return Promise.resolve(items);
            }
            const chunk = todo.splice(0, 100);
            return opsGeoBatch(chunk).catch(function () {
                failed = true;
                return opsLocateSerial(chunk.slice(0, 12));
            }).then(function () {
                save();
                if (onPaint) onPaint();
                return step();
            });
        };
        return step();
    }

    let opsAttackToken = 0;

    function loadOpsAttacks(force) {
        const range = opsAttackRange;
        const token = ++opsAttackToken;
        const key = 'orbint-ops-attacks6-' + range;
        const ttl = range === 'live' ? 20000 : 300000;
        const cached = !force && opsSessionCache(key, null, ttl);
        if (cached && Array.isArray(cached.items)) {
            opsAttacks = cached.items;
            opsAttackAt = cached.at || Date.now();
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'No located attack sources';
            opsAttacks.forEach(function (item) {
                const known = opsKnownPort(item.ip);
                if (known !== null) item.port = known;
            });
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncAttackPins();
            opsFillPorts(opsAttacks);
            return;
        }
        opsAttackNote = 'Loading ' + opsAttackWindowLabel().toLowerCase() + ' sources';
        opsMapStatusLine();
        opsFetchAttackList(range).then(function (picked) {
            if (token !== opsAttackToken || range !== opsAttackRange) return [];
            opsAttacks = picked || [];
            opsAttackNote = 'Locating ' + opsAttacks.length + ' sources';
            opsMapStatusLine();
            opsSyncAttackPins();
            return opsLocateAttacks(opsAttacks, function () {
                if (token !== opsAttackToken || range !== opsAttackRange) return;
                opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || ('Locating ' + opsAttacks.length + ' sources');
                opsMapStatusLine();
                paintOpsMapList();
                opsSyncAttackPins();
            });
        }).then(function (items) {
            if (token !== opsAttackToken || range !== opsAttackRange) return;
            opsAttacks = items || [];
            opsAttackAt = Date.now();
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'No attack sources returned';
            opsSessionCache(key, { at: opsAttackAt, items: opsAttacks }, ttl);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncAttackPins();
            opsFillPorts(opsAttacks);
        }).catch(function () {
            if (token !== opsAttackToken || range !== opsAttackRange) return;
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'Attack sources did not load';
            opsMapStatusLine();
            paintOpsMapList();
        });
    }

    function opsOutageCountry(entity) {
        entity = entity || {};
        const attrs = entity.attrs || {};
        const type = String(entity.type || '');
        const code = String(entity.code || '').toUpperCase();
        if (type === 'country' && /^[A-Z]{2}$/.test(code) && OPS_PLACES[code]) return code;
        const named = String(attrs.country_code || '').toUpperCase();
        if (/^[A-Z]{2}$/.test(named) && OPS_PLACES[named]) return named;
        if (type === 'geoasn') {
            const tail = code.split('-').pop();
            if (/^[A-Z]{2}$/.test(tail) && OPS_PLACES[tail]) return tail;
        }
        return '';
    }

    function opsSpreadOutages(items) {
        const seen = {};
        items.forEach(function (item) {
            const place = item.country && OPS_PLACES[item.country];
            if (!place) return;
            const n = seen[item.country] || 0;
            seen[item.country] = n + 1;
            if (!n) {
                item.lon = place[0];
                item.lat = place[1];
                return;
            }
            const ring = Math.floor((n - 1) / 8) + 1;
            const angle = ((n - 1) % 8) / 8 * Math.PI * 2;
            const step = 0.42 * ring;
            item.lon = place[0] + Math.cos(angle) * step;
            item.lat = Math.max(-85, Math.min(85, place[1] + Math.sin(angle) * step * 0.65));
        });
    }

    function opsFetchOutagePages(from, until, pages) {
        const jobs = [];
        for (let page = 1; page <= pages; page++) {
            const url = 'https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?from=' + from + '&until=' + until + '&limit=200&page=' + page;
            jobs.push(fetch(url).then(function (res) {
                if (!res.ok) throw new Error('feed');
                return res.json();
            }).then(function (payload) {
                return payload && Array.isArray(payload.data) ? payload.data : [];
            }).catch(function () { return []; }));
        }
        return Promise.all(jobs).then(function (lists) {
            const rows = [];
            const seen = {};
            lists.forEach(function (list) {
                list.forEach(function (row) {
                    const entity = row.entity || {};
                    const key = [row.datasource, entity.type, entity.code, row.time].join('|');
                    if (seen[key]) return;
                    seen[key] = true;
                    rows.push(row);
                });
            });
        return rows;
        });
    }

    function opsOutageSpan() {
        const days = { live: 1, day: 1, week: 7, month: 30, year: 365, decade: 365 }[opsAttackRange] || 1;
        const limit = days <= 1 ? 6 : 8;
        return { days: days, limit: limit };
    }

    function opsOutagePlaceNote(items) {
        const placed = (items || []).filter(function (item) { return OPS_PLACES[item.country]; }).length;
        if (!placed) return opsAttackWindowLabel() + ' · no outages with a country';
        return opsAttackWindowLabel() + ' · ' + placed + ' outages · IODA';
    }

    function loadOpsOutages(force) {
        const range = opsAttackRange;
        const span = opsOutageSpan();
        const cached = !force && opsSessionCache('orbint-ops-outages3-' + range, null, 55000);
        if (cached && Array.isArray(cached.items)) {
            opsOutages = cached.items;
            opsOutageAt = cached.at || Date.now();
            opsOutageNote = opsOutagePlaceNote(opsOutages);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncOutagePins();
            return;
        }
        opsOutageNote = 'Loading ' + opsAttackWindowLabel().toLowerCase() + ' outages';
        opsMapStatusLine();
        const until = Math.floor(Date.now() / 1000);
        const from = until - span.days * 24 * 60 * 60;
        const pages = span.limit;
        opsFetchOutagePages(from, until, pages).then(function (rows) {
            if (range !== opsAttackRange) return;
            opsOutages = rows.map(function (row) {
                const entity = row.entity || {};
                const type = String(entity.type || '');
                const code = String(entity.code || '');
                const link = type && code
                    ? 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard#view=inspect&entity=' + encodeURIComponent(type + '/' + code)
                    : 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
                return {
                    name: entity.name || 'Outage',
                    country: opsOutageCountry(entity),
                    source: String(row.datasource || ''),
                    level: String(row.level || ''),
                    time: (Number(row.time) || 0) * 1000,
                    link: link
                };
            }).filter(function (item) { return item.country; });
            opsSpreadOutages(opsOutages);
            opsOutageAt = Date.now();
            opsOutageNote = opsOutagePlaceNote(opsOutages);
            opsSessionCache('orbint-ops-outages3-' + range, { at: opsOutageAt, items: opsOutages }, 55000);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncOutagePins();
        }).catch(function () {
            if (range !== opsAttackRange) return;
            opsOutageNote = opsOutages.length ? opsOutagePlaceNote(opsOutages) : 'Internet outages did not load';
            opsMapStatusLine();
            paintOpsMapList();
        });
    }

    function startOpsMap() {
        opsEnsureMap();
        opsClearPinCanvas();
        opsSyncAttackPins();
        opsSyncOutagePins();
        opsShowPinLayers();
        if (opsMapMode === 'cameras') opsEnsureCameras();
        requestAnimationFrame(function () { opsSyncMapSize(); });
    }

    function bindOperations() {
        applyOpsLayout();
        const ask = $('opsAccessAsk');
        if (ask) ask.addEventListener('click', openOpsAsk);
        const deny = $('opsAskDeny');
        const allow = $('opsAskAllow');
        if (deny) deny.addEventListener('click', function () {
            setOpsDeviceChoice('deny');
            paintOpsAccess();
            paintOpsMachineHeld();
            closeOpsAsk();
        });
        if (allow) allow.addEventListener('click', function () {
            setOpsDeviceChoice('allow');
            paintOpsAccess();
            paintOpsMachine();
            setOpsOpen('machine', true);
            closeOpsAsk();
            opsLocateUser(true);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeOpsAsk();
                closeOpsReport();
                closeOpsBasemap();
            }
        });
        const news = $('opsNews');
        if (news) {
            news.addEventListener('click', function (event) {
                const topic = event.target.closest('[data-topic]');
                if (topic) {
                    opsNewsTopic = topic.getAttribute('data-topic') || 'all';
                    opsNewsIndex = 0;
                    opsNewsDir = 1;
                    paintOpsNews(opsNewsAll, opsNewsNote);
                    return;
                }
                const jump = event.target.closest('[data-news]');
                if (!jump || !opsNewsItems.length) return;
                event.preventDefault();
                const action = jump.getAttribute('data-news');
                const total = opsNewsItems.length;
                if (action === 'prev') {
                    opsNewsIndex = (opsNewsIndex + total - 1) % total;
                    opsNewsDir = -1;
                } else if (action === 'next') {
                    opsNewsIndex = (opsNewsIndex + 1) % total;
                    opsNewsDir = 1;
                } else {
                    const next = Number(action) || 0;
                    opsNewsDir = next >= opsNewsIndex ? 1 : -1;
                    opsNewsIndex = next;
                }
                paintOpsNews(opsNewsAll, opsNewsNote);
            });
        }
        const newsPanel = document.querySelector('[data-ops="news"]');
        if (newsPanel) {
            newsPanel.addEventListener('pointerenter', function () {
                if (!opsNewsPaused) opsNewsHold = Date.now();
                opsNewsPaused = true;
            });
            newsPanel.addEventListener('pointerleave', function () {
                if (opsNewsHold) {
                    opsNewsStamp += Date.now() - opsNewsHold;
                    opsNewsHold = 0;
                }
                opsNewsPaused = false;
            });
        }
        const reset = $('opsLayoutReset');
        if (reset) {
            reset.addEventListener('click', function () {
                try { localStorage.removeItem(OPS_LAYOUT_KEY); } catch (error) {}
                applyOpsLayout(OPS_LAYOUT_DEFAULT);
            });
        }
        document.querySelectorAll('.ops-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                const panel = toggle.closest('.ops-panel');
                if (!panel) return;
                setOpsOpen(panel.getAttribute('data-ops'), panel.classList.contains('is-closed'));
            });
        });
        let drag = null;
        document.addEventListener('pointerdown', function (event) {
            const handle = event.target.closest('.ops-resize-x, .ops-resize-y');
            if (!handle || window.innerWidth <= 900) return;
            const panel = handle.closest('.ops-panel');
            if (!panel) return;
            event.preventDefault();
            drag = {
                axis: handle.classList.contains('ops-resize-x') ? 'x' : 'y',
                panel: panel,
                id: panel.getAttribute('data-ops'),
                body: panel.querySelector('.ops-body')
            };
            document.body.classList.add('ops-resizing');
            handle.setPointerCapture(event.pointerId);
        });
        document.addEventListener('pointermove', function (event) {
            if (!drag) return;
            if (drag.axis === 'x') {
                const board = document.querySelector('.ops-board');
                if (!board) return;
                const span = opsSnapSpan(event.clientX - drag.panel.getBoundingClientRect().left, board.getBoundingClientRect().width);
                drag.panel.style.gridColumn = 'span ' + span;
                drag.span = span;
            } else if (drag.body) {
                const height = Math.max(140, Math.min(640, event.clientY - drag.body.getBoundingClientRect().top));
                drag.body.style.height = height + 'px';
                drag.height = height;
            }
        });
        function endOpsDrag() {
            if (!drag) return;
            const layout = opsLayout();
            const base = OPS_LAYOUT_DEFAULT[drag.id] || { span: 12, open: true, height: 0 };
            const spec = Object.assign({}, base, layout[drag.id] || {});
            if (drag.span) spec.span = drag.span;
            if (drag.height) spec.height = drag.height;
            layout[drag.id] = spec;
            opsLayout(layout);
            document.body.classList.remove('ops-resizing');
            drag = null;
        }
        document.addEventListener('pointerup', endOpsDrag);
        document.addEventListener('pointercancel', endOpsDrag);
        setInterval(function () {
            if (!document.body || document.body.getAttribute('data-page') !== 'operations') return;
            const reduce = opsReduceMotion();
            const panel = document.querySelector('[data-ops="news"]');
            const closed = !panel || panel.classList.contains('is-closed');
            if (closed) {
                opsNewsStamp = Date.now();
                if (!opsNewsClosed) {
                    opsNewsClosed = true;
                    resetOpsChapterFill(0);
                }
            } else if (opsNewsClosed) {
                opsNewsClosed = false;
                opsNewsStamp = Date.now();
                resetOpsChapterFill(0);
            }
            if (!opsNewsPaused && !reduce && !closed && opsNewsItems.length > 1 && Date.now() - opsNewsStamp >= OPS_NEWS_MS) {
                opsNewsIndex = (opsNewsIndex + 1) % opsNewsItems.length;
                opsNewsDir = 1;
                paintOpsNews(opsNewsAll, opsNewsNote);
            }
            opsMapStatusLine();
            const modeThumb = document.querySelector('.ops-mode-thumb');
            if (modeThumb && !(modeThumb.offsetWidth > 0)) opsModeThumb(true);
        }, 100);
        setInterval(function () {
            if (!document.body || document.body.getAttribute('data-page') !== 'operations' || document.hidden) return;
            loadOpsAttacks(false);
            loadOpsOutages(false);
            loadOpsNews(false);
        }, 60000);
        const stage = document.querySelector('.ops-globe-stage');
        if (stage) {
            stage.addEventListener('click', function (event) {
                if (event.target.closest('[data-report="close"]')) {
                    closeOpsReport();
                    return;
                }
                const hit = event.target.closest('[data-hit]');
                if (!hit) return;
                const kind = hit.getAttribute('data-hit') || '';
                const id = hit.getAttribute('data-id') || '';
                opsOpenMapHit({ kind: kind, id: id, ip: kind === 'ip' ? id : '' });
            });
        }
        window.addEventListener('resize', function () { opsModeThumb(true); });
        const basemapBtn = $('opsBasemapBtn');
        const basemapMenu = $('opsBasemap');
        function closeOpsBasemap() {
            if (!basemapMenu || basemapMenu.hidden) return;
            basemapMenu.hidden = true;
            if (basemapBtn) basemapBtn.setAttribute('aria-expanded', 'false');
        }
        if (basemapBtn && basemapMenu) {
            basemapBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                const open = basemapMenu.hidden;
                basemapMenu.hidden = !open;
                basemapBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
        document.addEventListener('click', function (event) {
            if (!basemapMenu || basemapMenu.hidden) return;
            if (event.target.closest('.ops-basemap-pop')) return;
            closeOpsBasemap();
        });
        document.querySelectorAll('[data-basemap]').forEach(function (button) {
            button.addEventListener('click', function () {
                opsSetBasemap(button.getAttribute('data-basemap') || 'dark');
                closeOpsBasemap();
            });
        });
        const locate = $('opsLocate');
        if (locate) locate.addEventListener('click', function () { opsLocateUser(true); });
        document.querySelectorAll('[data-map]').forEach(function (button) {
            button.addEventListener('click', function () {
                setOpsMapMode(button.getAttribute('data-map'));
            });
        });
        document.querySelectorAll('[data-range]').forEach(function (button) {
            button.addEventListener('click', function () {
                opsAttackRange = button.getAttribute('data-range') || 'live';
                document.querySelectorAll('[data-range]').forEach(function (other) {
                    other.classList.toggle('is-on', other === button);
                });
                opsHideTip();
                if (opsMapMode === 'outages') loadOpsOutages(true);
                else if (opsMapMode !== 'cameras') loadOpsAttacks(true);
            });
        });
        const mapRefresh = $('opsMapRefresh');
        if (mapRefresh) {
            mapRefresh.addEventListener('click', function () {
                if (opsMapMode === 'outages') loadOpsOutages(true);
                else if (opsMapMode !== 'cameras') loadOpsAttacks(true);
            });
        }
        startOpsMap();
    }

    bindOperations();

    function openDomainIntel(seed) {
        const hostValue = hostName(seed || data.intel.host || firstValue('domain'));
        const input = $('intelHost');
        if (input) input.value = hostValue;
        data.intel.host = hostValue;
        showSheet($('intelSheet'));
        if (hostValue) runDomainIntel(hostValue);
        else {
            const out = $('intelResults');
            if (out) out.innerHTML = '<p class="muted">Enter a domain such as example.com</p>';
        }
    }

    function dnsQuery(name, type) {
        return fetch('https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + encodeURIComponent(type))
            .then(function (res) { return res.json(); })
            .then(function (json) {
                return (json.Answer || []).map(function (row) {
                    return { type: type, data: row.data, ttl: row.TTL };
                });
            })
            .catch(function () { return []; });
    }

    function runDomainIntel(name) {
        const hostValue = hostName(name);
        const out = $('intelResults');
        if (!hostValue || !out) return;
        if (domainBusy) return;
        domainBusy = true;
        data.intel.host = hostValue;
        schedulePersist();
        out.innerHTML = '<p class="muted">Looking up ' + esc(hostValue) + '…</p>';
        const links = DOMAIN_TOOL_LINKS.map(function (pair) {
            const href = pair[1].indexOf('dnsdumpster') >= 0 || pair[1].indexOf('urlscan.io/search') >= 0
                ? pair[1]
                : pair[1] + encodeURIComponent(hostValue);
            return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(pair[0]) + '</a>';
        }).join('');

        const dnsJobs = DNS_TYPES.map(function (type) { return dnsQuery(hostValue, type); });
        const rdap = fetch('https://rdap.org/domain/' + encodeURIComponent(hostValue))
            .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
            .catch(function () {
                return fetch('https://rdap.verisign.com/com/v1/domain/' + encodeURIComponent(hostValue))
                    .then(function (res) { return res.ok ? res.json() : Promise.reject(); });
            })
            .catch(function () { return null; });
        const certs = fetch('https://crt.sh/?q=' + encodeURIComponent(hostValue) + '&output=json')
            .then(function (res) { return res.ok ? res.json() : []; })
            .catch(function () { return []; });
        const wayback = fetch('https://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(hostValue) + '/*&output=json&fl=timestamp,original,statuscode,mimetype&filter=statuscode:200&collapse=digest&limit=40')
            .then(function (res) { return res.ok ? res.json() : []; })
            .catch(function () { return []; });

        Promise.all([Promise.all(dnsJobs), rdap, certs, wayback]).then(function (parts) {
            domainBusy = false;
            const dns = parts[0].reduce(function (all, rows) { return all.concat(rows); }, []);
            const whois = parts[1];
            const ct = Array.isArray(parts[2]) ? parts[2] : [];
            const wb = Array.isArray(parts[3]) ? parts[3] : [];
            const names = {};
            ct.forEach(function (row) {
                String(row.name_value || row.common_name || '').split(/\s+/).forEach(function (name) {
                    const clean = name.replace(/^\*\./, '').trim().toLowerCase();
                    if (clean) names[clean] = true;
                });
            });
            const subdomains = Object.keys(names).filter(function (n) { return n === hostValue || n.slice(-hostValue.length - 1) === '.' + hostValue; }).sort();
            const events = whois && whois.events ? whois.events : [];
            const ns = whois && whois.nameservers ? whois.nameservers.map(function (n) { return n.ldhName || n; }) : [];
            const txt = dns.filter(function (r) { return r.type === 'TXT'; }).map(function (r) { return r.data; });
            const tech = fingerprintFrom(dns, txt, ns);
            const wbRows = wb.slice(1, 31);
            out.innerHTML =
                '<div class="intel-links">' + links + '</div>' +
                sectionBlock('DNS', dns.length ? '<table class="an-table"><thead><tr><th>Type</th><th>Data</th><th>TTL</th></tr></thead><tbody>' +
                    dns.map(function (r) { return '<tr><td>' + esc(r.type) + '</td><td>' + esc(r.data) + '</td><td>' + esc(r.ttl) + '</td></tr>'; }).join('') +
                    '</tbody></table>' : '<p class="muted">No DNS answers (blocked or NXDOMAIN).</p>') +
                sectionBlock('WHOIS / RDAP', whois ? '<dl class="intel-dl">' +
                    rowDl('Handle', whois.handle || whois.ldhName) +
                    rowDl('Registrar', rdapRegistrar(whois)) +
                    rowDl('Status', (whois.status || []).join(', ')) +
                    rowDl('Nameservers', ns.join(', ')) +
                    events.map(function (ev) { return rowDl(ev.eventAction, ev.eventDate); }).join('') +
                    '</dl>' : '<p class="muted">RDAP was blocked by CORS or the TLD has no public endpoint. Use WHOIS / RDAP links above.</p>') +
                sectionBlock('Certificates', ct.length ? '<p class="muted">' + ct.length + ' transparency rows. Unique names:</p><ul class="an-chips">' +
                    subdomains.slice(0, 80).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' :
                    '<p class="muted">crt.sh did not return JSON in this browser. Open crt.sh from the links.</p>') +
                sectionBlock('Subdomains (from CT)', subdomains.length ? '<ul class="an-chips">' + subdomains.slice(0, 60).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None parsed from certificates.</p>') +
                sectionBlock('Historical URLs', wbRows.length ? '<table class="an-table"><thead><tr><th>Captured</th><th>URL</th><th>Type</th></tr></thead><tbody>' +
                    wbRows.map(function (row) {
                        const ts = String(row[0] || '');
                        const when = ts.length >= 8 ? ts.slice(0, 4) + '-' + ts.slice(4, 6) + '-' + ts.slice(6, 8) : ts;
                        return '<tr><td>' + esc(when) + '</td><td><a href="https://web.archive.org/web/' + esc(ts) + '/' + esc(row[1] || '') + '" target="_blank" rel="noopener noreferrer">' + esc(row[1] || '') + '</a></td><td>' + esc(row[3] || '') + '</td></tr>';
                    }).join('') + '</tbody></table>' : '<p class="muted">No Wayback CDX rows. Open Wayback from the links if the API is blocked.</p>') +
                sectionBlock('Technology fingerprints', tech.length ? '<ul class="an-chips">' + tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul><p class="muted">Clues from DNS TXT, MX, and nameservers. Confirm on BuiltWith / Wappalyzer / urlscan.</p>' :
                    '<p class="muted">No stack clues in DNS. Use BuiltWith, Wappalyzer, or urlscan.</p>');
        }).catch(function () {
            domainBusy = false;
            out.innerHTML = '<div class="intel-links">' + links + '</div><p class="muted">Live lookup failed. Use the catalog links.</p>';
        });
    }

    function sectionBlock(title, html) {
        return '<section class="intel-block"><h3>' + esc(title) + '</h3>' + html + '</section>';
    }

    function rowDl(k, v) {
        if (!v) return '';
        return '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>';
    }

    function rdapRegistrar(whois) {
        const ents = whois.entities || [];
        for (let i = 0; i < ents.length; i++) {
            const vcard = ents[i].vcardArray && ents[i].vcardArray[1];
            if (!vcard) continue;
            const fn = vcard.find(function (row) { return row[0] === 'fn'; });
            if (fn) return fn[3];
        }
        return '';
    }

    function fingerprintFrom(dns, txt, ns) {
        const hits = [];
        const blob = (txt.join('\n') + '\n' + ns.join('\n') + '\n' + dns.map(function (r) { return r.data; }).join('\n')).toLowerCase();
        const rules = [
            ['Google Workspace', /google-site-verification|aspmx.l.google|googlemail/],
            ['Microsoft 365', /spf.protection.outlook|outlook/],
            ['Cloudflare', /cloudflare|ns.cloudflare/],
            ['AWS', /amazonaws|awsdns/],
            ['Fastmail', /fastmail/],
            ['Proton', /protonmail/],
            ['GitHub Pages', /github\.io|github-pages/],
            ['Shopify', /myshopify|shopify/],
            ['Squarespace', /squarespace/],
            ['Wix', /wixdns|wix\.com/],
            ['WordPress.com', /wordpress\.com/],
            ['Google Sites / Firebase', /web\.app|firebase/],
            ['SendGrid', /sendgrid/],
            ['Mailgun', /mailgun/],
            ['SPF record', /v=spf1/],
            ['DMARC', /v=dmarc1/],
            ['DKIM', /dkim1/]
        ];
        rules.forEach(function (rule) {
            if (rule[1].test(blob)) hits.push(rule[0]);
        });
        return hits;
    }

    function injectToolkit() {
        const kit = window.OSINT_TOOLKIT;
        if (!kit || !Array.isArray(kit.categories)) return;
        if (kit.categories.some(function (c) { return c.id === 'osint-domain-intel'; })) return;
        kit.categories.unshift({
            id: 'osint-domain-intel',
            title: 'Domain Intelligence',
            fields: ['domain'],
            tools: [
                { name: 'Google DNS', url: 'https://dns.google/', host: 'dns.google' },
                { name: 'RDAP.org', url: 'https://rdap.org/', host: 'rdap.org' },
                { name: 'who.is', url: 'https://who.is/', host: 'who.is' },
                { name: 'crt.sh', url: 'https://crt.sh/', host: 'crt.sh' },
                { name: 'SecurityTrails', url: 'https://securitytrails.com/', host: 'securitytrails.com' },
                { name: 'ViewDNS', url: 'https://viewdns.info/', host: 'viewdns.info' },
                { name: 'DNSdumpster', url: 'https://dnsdumpster.com/', host: 'dnsdumpster.com' },
                { name: 'urlscan', url: 'https://urlscan.io/', host: 'urlscan.io' },
                { name: 'Wayback Machine', url: 'https://web.archive.org/', host: 'web.archive.org' },
                { name: 'BuiltWith', url: 'https://builtwith.com/', host: 'builtwith.com' },
                { name: 'Wappalyzer', url: 'https://www.wappalyzer.com/', host: 'wappalyzer.com' },
                { name: 'VirusTotal domain', url: 'https://www.virustotal.com/gui/home/search', host: 'virustotal.com' },
                { name: 'Censys', url: 'https://search.censys.io/', host: 'censys.io' },
                { name: 'Shodan', url: 'https://www.shodan.io/', host: 'shodan.io' },
                { name: 'Netcraft', url: 'https://sitereport.netcraft.com/', host: 'netcraft.com' },
                { name: 'URLVoid', url: 'https://www.urlvoid.com/', host: 'urlvoid.com' }
            ]
        });
    }

    function readU16(view, offset, le) {
        return le ? view.getUint16(offset, true) : view.getUint16(offset, false);
    }

    function readU32(view, offset, le) {
        return le ? view.getUint32(offset, true) : view.getUint32(offset, false);
    }

    function parseExif(buffer) {
        const view = new DataView(buffer);
        if (view.byteLength < 12) return {};
        if (view.getUint16(0) !== 0xFFD8) return { format: 'not-jpeg' };
        let offset = 2;
        const out = { format: 'jpeg' };
        while (offset + 4 < view.byteLength) {
            if (view.getUint8(offset) !== 0xFF) break;
            const marker = view.getUint8(offset + 1);
            const size = view.getUint16(offset + 2);
            if (marker === 0xE1 && size > 8) {
                const start = offset + 4;
                const isExif = String.fromCharCode(view.getUint8(start), view.getUint8(start + 1), view.getUint8(start + 2), view.getUint8(start + 3)) === 'Exif';
                if (isExif) Object.assign(out, readExifBlock(view, start + 6));
            }
            if (marker === 0xC0 || marker === 0xC2) {
                out.height = view.getUint16(offset + 5);
                out.width = view.getUint16(offset + 7);
            }
            offset += 2 + size;
        }
        return out;
    }

    function readExifBlock(view, tiff) {
        const le = view.getUint16(tiff) === 0x4949;
        if (view.getUint16(tiff + 2, le) !== 0x002A) return {};
        const map = {};
        readIfd(view, tiff, tiff + readU32(view, tiff + 4, le), le, map, false);
        if (map._exif) readIfd(view, tiff, tiff + map._exif, le, map, false);
        if (map._gps) readIfd(view, tiff, tiff + map._gps, le, map, true);
        delete map._exif;
        delete map._gps;
        return map;
    }

    const EXIF_TAGS = {
        0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation', 0x011A: 'XResolution', 0x0131: 'Software',
        0x0132: 'DateTime', 0x829A: 'ExposureTime', 0x829D: 'FNumber', 0x8827: 'ISO', 0x9003: 'DateTimeOriginal',
        0x9004: 'DateTimeDigitized', 0x920A: 'FocalLength', 0xA002: 'ExifImageWidth', 0xA003: 'ExifImageHeight',
        0x0103: 'Compression', 0x0100: 'ImageWidth', 0x0101: 'ImageHeight', 0x8769: '_exif', 0x8825: '_gps',
        0x0001: 'GPSLatRef', 0x0002: 'GPSLatitude', 0x0003: 'GPSLonRef', 0x0004: 'GPSLongitude', 0x0006: 'GPSAltitude'
    };

    function readIfd(view, tiff, offset, le, map, gps) {
        if (offset < tiff || offset + 2 > view.byteLength) return;
        const count = readU16(view, offset, le);
        for (let i = 0; i < count; i++) {
            const entry = offset + 2 + i * 12;
            if (entry + 12 > view.byteLength) break;
            const tag = readU16(view, entry, le);
            const type = readU16(view, entry + 2, le);
            const n = readU32(view, entry + 4, le);
            const valOff = entry + 8;
            const name = EXIF_TAGS[tag];
            if (!name && !gps) continue;
            const key = name || ('tag_' + tag);
            map[key] = readExifValue(view, tiff, type, n, valOff, le);
        }
    }

    function readExifValue(view, tiff, type, n, valOff, le) {
        const unit = type === 3 ? 2 : type === 4 || type === 9 ? 4 : type === 5 || type === 10 ? 8 : 1;
        const bytes = unit * n;
        let pos = bytes > 4 ? tiff + readU32(view, valOff, le) : valOff;
        if (type === 2) {
            let s = '';
            for (let i = 0; i < n && pos + i < view.byteLength; i++) {
                const c = view.getUint8(pos + i);
                if (!c) break;
                s += String.fromCharCode(c);
            }
            return s;
        }
        if (type === 3) return n === 1 ? readU16(view, pos, le) : readU16(view, pos, le);
        if (type === 4) return readU32(view, pos, le);
        if (type === 5 || type === 10) {
            if (n >= 3 && bytes >= 24) {
                const vals = [];
                for (let i = 0; i < 3; i++) {
                    const a = readU32(view, pos + i * 8, le);
                    const b = readU32(view, pos + i * 8 + 4, le) || 1;
                    vals.push(a / b);
                }
                return vals;
            }
            const a = readU32(view, pos, le);
            const b = readU32(view, pos + 4, le) || 1;
            return a / b;
        }
        return n;
    }

    function gpsToDeg(arr, ref) {
        if (!Array.isArray(arr) || arr.length < 3) return '';
        let d = arr[0] + arr[1] / 60 + arr[2] / 3600;
        if (ref === 'S' || ref === 'W') d = -d;
        return d.toFixed(6);
    }

    function showPhotoMeta(item) {
        const sheet = $('metaSheet');
        const body = $('metaBody');
        if (!sheet || !body || !item || !item.src) return;
        body.innerHTML = '<p class="muted">Reading file…</p>';
        showSheet(sheet);
        const src = item.src;
        const rows = [];
        function add(k, v) {
            if (v == null || v === '' || v === 'undefined') return;
            rows.push('<tr><th>' + esc(k) + '</th><td>' + esc(String(v)) + '</td></tr>');
        }
        add('Name', item.name || item.value);
        add('Primary', item.primary ? 'Yes' : 'No');
        add('URL', /^https?:\/\//i.test(src) ? src : '(embedded file)');
        const img = new Image();
        img.onload = function () { add('Rendered size', img.naturalWidth + ' × ' + img.naturalHeight); flush(); };
        img.src = src;
        function flush() {
            body.innerHTML = rows.length ? '<table class="an-table meta-table">' + rows.join('') + '</table>' : '<p class="muted">No metadata readable in this browser.</p>';
        }
        const go = function (buf) {
            add('Bytes', buf.byteLength);
            const meta = parseExif(buf);
            Object.keys(meta).forEach(function (k) {
                if (k === 'GPSLatitude') add('Latitude', gpsToDeg(meta[k], meta.GPSLatRef) || meta[k]);
                else if (k === 'GPSLongitude') add('Longitude', gpsToDeg(meta[k], meta.GPSLonRef) || meta[k]);
                else if (k.indexOf('GPS') === 0 && (k === 'GPSLatRef' || k === 'GPSLonRef')) return;
                else add(k, Array.isArray(meta[k]) ? meta[k].join(', ') : meta[k]);
            });
            if (meta.GPSLatitude && meta.GPSLongitude) {
                const lat = gpsToDeg(meta.GPSLatitude, meta.GPSLatRef);
                const lon = gpsToDeg(meta.GPSLongitude, meta.GPSLonRef);
                if (lat && lon) add('Maps', 'https://www.google.com/maps?q=' + lat + ',' + lon);
            }
            flush();
        };
        if (host && host.srcToBlob) {
            host.srcToBlob(src).then(function (blob) {
                add('Type', blob.type);
                add('Size', blob.size + ' bytes');
                return blob.arrayBuffer();
            }).then(go).catch(function () { flush(); });
        } else {
            fetch(src).then(function (r) { return r.arrayBuffer(); }).then(go).catch(function () { flush(); });
        }
    }

    function reverseSearchPhoto(item, button) {
        if (!item || !item.src) return;
        const menu = $('reverseMenu');
        if (!menu) {
            openReverse(item.src, 'lens');
            return;
        }
        menu.innerHTML = REVERSE_ENGINES.map(function (eng) {
            return '<button type="button" data-rev="' + eng.id + '">' + esc(eng.label) + '</button>';
        }).join('');
        menu.hidden = false;
        menu.dataset.src = item.src;
        const rect = button ? button.getBoundingClientRect() : { left: 24, bottom: 80, right: 80 };
        menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 180)) + 'px';
        menu.style.top = Math.min(window.innerHeight - 200, rect.bottom + 6) + 'px';
        if (!/^https?:\/\//i.test(item.src) && host && host.copyImageSource) {
            host.copyImageSource(item.src);
        }
    }

    function openReverse(src, id) {
        const eng = REVERSE_ENGINES.find(function (item) { return item.id === id; }) || REVERSE_ENGINES[0];
        window.open(eng.url(src), '_blank', 'noopener,noreferrer');
        const menu = $('reverseMenu');
        if (menu) menu.hidden = true;
    }

    function pdfClean(text) {
        return String(text == null ? '' : text)
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '--')
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/[^\x20-\x7E]/g, function (ch) {
                try { return ch.normalize('NFKD').replace(/[^\x20-\x7E]/g, ''); } catch (error) { return ''; }
            });
    }

    function pdfSafe(text) {
        return pdfClean(text).replace(/\s+/g, ' ').trim();
    }

    function pdfEscape(text) {
        return pdfClean(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }

    function measurePdf(text, size) {
        return pdfClean(text).length * size * 0.6;
    }

    function wrapPdf(text, maxW, size) {
        var words = pdfSafe(text).split(/\s+/).filter(Boolean);
        var lines = [];
        var line = '';
        function pushChunk(raw) {
            var chunk = '';
            for (var i = 0; i < raw.length; i++) {
                if (measurePdf(chunk + raw[i], size) > maxW && chunk) {
                    lines.push(chunk);
                    chunk = raw[i];
                } else chunk += raw[i];
            }
            line = chunk;
        }
        words.forEach(function (w) {
            if (measurePdf(w, size) > maxW) {
                if (line) lines.push(line);
                pushChunk(w);
                return;
            }
            var next = line ? line + ' ' + w : w;
            if (measurePdf(next, size) > maxW && line) {
                lines.push(line);
                line = w;
            } else line = next;
        });
        if (line) lines.push(line);
        return lines.length ? lines : [''];
    }

    function wrapWords(text, width) {
        return wrapPdf(text, width * 5.4, 10);
    }

    function latin1Pdf(str) {
        var out = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 255;
        return out;
    }

    function concatPdf(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        var out = new Uint8Array(n);
        var o = 0;
        for (i = 0; i < chunks.length; i++) {
            out.set(chunks[i], o);
            o += chunks[i].length;
        }
        return out;
    }

    function pdfChunksLength(chunks) {
        var n = 0;
        var i;
        for (i = 0; i < chunks.length; i++) n += chunks[i].length;
        return n;
    }

    function longPdfDate(raw) {
        var s = String(raw || '').trim();
        var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return s;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return String(Number(m[3])) + ' ' + (months[Number(m[2]) - 1] || m[2]) + ' ' + m[1];
    }

    function displaySafe(raw) {
        var v = String(raw == null ? '' : raw).trim();
        if (!v) return '';
        if (/^(data:|blob:)/i.test(v)) return '';
        if (/^file:/i.test(v) || /^[a-zA-Z]:[\\/]/.test(v) || v.indexOf('\\Users\\') >= 0 || v.indexOf('/Users/') === 0 || v.indexOf('/home/') === 0) {
            return v.split(/[\\/]/).pop() || '';
        }
        return v;
    }

    function prettyPdfValue(raw) {
        var v = displaySafe(raw);
        if (!v) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
            var head = v.slice(0, 10);
            var rest = v.slice(10).trim();
            return rest ? longPdfDate(head) + ' ' + rest : longPdfDate(head);
        }
        return v;
    }

    var REPORT_HEAD = 'Open-source Reconnaissance Bureau of Intelligence';
    var REPORT_HEAD_SIZE = 12;
    var REPORT_BANNER = 'AUTHORIZED USE ONLY -- INFORMATION SUBJECT TO VERIFICATION -- DO NOT TREAT UNVERIFIED FINDINGS AS ESTABLISHED FACT';
    var REPORT_NOTICE = [
        'This record is intended strictly for **authorized investigative, research, and analytical purposes**. Access, reproduction, disclosure, and distribution should be limited to individuals with a legitimate need to review the information contained herein.',
        'Information within this record is derived primarily from publicly available and open-source material. Such information **cannot be presumed accurate**, as publicly available data may contain typographical errors, mistakes, or particulars that remain unconfirmed. Sources may also be false, misleading, outdated, incomplete, altered, misattributed, or otherwise unreliable. Accordingly, all findings should be treated as **information for consideration and further analysis**, rather than established fact, unless independently verified.',
        'The inclusion of a name, account, photograph, address, organization, relationship, identifier, or other data point does not by itself confirm identity, ownership, association, involvement, or responsibility. Similarities and apparent connections may be coincidental or the result of inaccurate source information.',
        'Information of material importance should be verified against its originating source and, where appropriate, corroborated through additional independent and reliable sources before any consequential action or conclusion is based upon it.',
        'This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion regarding an individual or organization. Analytical notes, suspected associations, and unresolved leads should remain clearly distinguished from verified findings.',
        'Information may change after collection. Accounts may be modified, records corrected, websites removed, and circumstances altered. Dates, source references, and supporting evidence should therefore be considered when evaluating the reliability and continued relevance of any finding.'
    ];
    var REPORT_CLOSE = [
        'This record is to be kept strictly confidential. It is issued for the use of the recipient only. Copying, forwarding, posting, printing for circulation, or any other reproduction, disclosure, or distribution of this file, in whole or in part, should be limited to individuals with a legitimate need to review it for **authorized investigative, research, and analytical purposes**. Recipients are required to store it securely and to destroy or return it when it is no longer required. Unauthorized disclosure of the particulars herein is to be avoided in every case.',
        'Nothing in this file should be treated as established fact unless independently verified. Information of material importance should be checked against its originating source, and where appropriate corroborated through additional independent and reliable sources, before any consequential action or conclusion is based upon it. This record should not be interpreted as establishing criminal activity, misconduct, intent, guilt, liability, or any other adverse conclusion. Analytical notes, suspected associations, and unresolved leads remain **information for consideration and further analysis** only.'
    ];
    var REPORT_CLOSE_TITLE = 'LIMITATION OF RELIANCE';
    var REPORT_LIABILITY_TITLE = 'LIABILITY AND DISTRIBUTION DISCLAIMER';
    var REPORT_LIABILITY = [
        'This disclaimer serves as formal notice that the creator(s), developer(s), and contributors of OrbINT assume no responsibility or liability for the use, misuse, disclosure, reproduction, distribution, or dissemination of this document or the information contained within it once it has been generated, exported, downloaded, shared, or otherwise transferred outside of their control.',
        'Responsibility for the lawful handling, verification, security, and distribution of this document rests solely with the individual or organization possessing or using it. The creator(s) of OrbINT shall not be held responsible for any unauthorized disclosure, improper use, reliance upon unverified information, or consequences arising from actions taken by users or third parties.',
        'Generation of this document does not constitute verification, endorsement, or certification of the information contained herein.'
    ];
    var NICE_LABEL = {
        name: 'Name',
        dob: 'Date of birth',
        age: 'Age',
        phone: 'Telephone',
        email: 'Electronic mail',
        username: 'Username',
        address: 'Address',
        city: 'City',
        country: 'Country',
        countrycode: 'Country code',
        company: 'Employer / company',
        occupation: 'Occupation',
        domain: 'Website',
        ip: 'Internet address',
        vehicle: 'Vehicle',
        plate: 'Registration plate',
        vin: 'VIN',
        image: 'Photograph',
        password: 'Password',
        phoneos: 'Telephone system',
        os: 'Computer system',
        timezone: 'Timezone',
        crypto: 'Wallet',
        notes: 'Notes'
    };
    var FIELD_ORDER = ['name', 'dob', 'age', 'address', 'city', 'country', 'countrycode', 'phone', 'email', 'username', 'occupation', 'company', 'domain', 'ip', 'timezone', 'phoneos', 'os', 'vehicle', 'plate', 'vin', 'crypto', 'password', 'notes', 'image'];
    var SKIP_TITLES = {
        Untitled: 1, 'Untitled Card': 1, Frame: 1, Finding: 1, Question: 1, Square: 1, Circle: 1, Triangle: 1,
        Diamond: 1, Note: 1, Person: 1, Evidence: 1, Image: 1, Website: 1, Event: 1, Text: 1,
        Rectangle: 1, Capsule: 1, Document: 1, Line: 1, Arrow: 1, Embed: 1, 'Web Embed': 1
    };

    var CONF_LABEL = { confirmed: 'Confirmed', probable: 'Probable', possible: 'Possible', unconfirmed: 'Unconfirmed' };
    var METHOD_LABEL = {
        'open-web': 'Open web',
        'public-records': 'Public records',
        'subscriber-db': 'Subscriber DB',
        interview: 'Interview',
        'legal-process': 'Legal process'
    };

    function factBaseId(id) {
        return String(id || '').replace(/:\d+$/, '').split(/[:_]/)[0];
    }

    function isRedactField(id) {
        var base = factBaseId(id);
        return /^(name|dob|age|phone|email|address|city|username|password|ip|plate|vin|crypto|image|notes)$/i.test(base)
            || /(password|passwd|pin|ssn|seed|privatekey|apikey|session|passport|secret|token)/i.test(String(id || ''));
    }

    function prettyConfidence(value) {
        return CONF_LABEL[value] || prettyPdfValue(value);
    }

    function prettyMethod(value) {
        return METHOD_LABEL[value] || prettyPdfValue(value);
    }

    function prettyCaptured(iso) {
        var d = new Date(iso);
        if (!Number.isFinite(d.getTime())) return prettyPdfValue(iso);
        return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
            '  ' + d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
    }

    function reportFactLabel(item) {
        var base = NICE_LABEL[factBaseId(item.id)] || item.label || 'Item';
        return item.platformLabel ? item.platformLabel + ' / ' + base : base;
    }

    function reportOrderedFacts() {
        var facts = filedFacts();
        var used = {};
        var out = [];
        function take(item) {
            if (factBaseId(item.id) === 'notes') return;
            var value = prettyPdfValue(item.value);
            if (!value) return;
            out.push({
                id: item.id,
                label: reportFactLabel(item),
                value: value,
                raw: String(item.value || '').trim(),
                source: prettyPdfValue(item.source),
                sourceRaw: String(item.source || '').trim(),
                confidence: prettyConfidence(item.confidence),
                method: prettyMethod(item.method),
                captured: item.capturedAt ? prettyCaptured(item.capturedAt) : '',
                redact: isRedactField(item.id)
            });
            used[item.id + '\0' + item.value] = true;
        }
        FIELD_ORDER.forEach(function (id) {
            facts.forEach(function (item) {
                if (factBaseId(item.id) === id && !used[item.id + '\0' + item.value]) take(item);
            });
        });
        facts.forEach(function (item) {
            if (!used[item.id + '\0' + item.value]) take(item);
        });
        return out;
    }

    function reportChronology() {
        return numberedTimeline().map(function (ev) {
            var title = prettyPdfValue(ev.title || '');
            if (SKIP_TITLES[title]) title = '';
            var bodyRaw = String(ev.body || '').trim();
            var bodyShow = [prettyPdfValue(ev.body || '')].concat((ev.moreNotes || []).map(function (note) {
                return prettyPdfValue(note && note.text);
            })).filter(Boolean).join('  ');
            return {
                id: ev.id,
                date: prettyPdfValue(ev.date || ''),
                time: prettyPdfValue(ev.time || ''),
                title: title,
                titleRaw: String(ev.title || '').trim(),
                body: bodyShow,
                bodyRaw: bodyRaw,
                source: prettyPdfValue(ev.source || ''),
                sourceRaw: String(ev.source || '').trim()
            };
        }).filter(function (row) {
            return row.date || row.time || row.body || row.title;
        });
    }

    function redactKey(id, value) {
        return String(id || '') + '|' + String(value || '').slice(0, 120);
    }

    function redactHtml(id, value) {
        var text = String(value || '');
        if (!text) return '<span class="ds-empty">--</span>';
        if (!isRedactField(id)) return esc(text);
        var key = redactKey(id, text);
        var open = (typeof isRedactOpen === 'function' ? isRedactOpen(key) : (typeof dsRevealed !== 'undefined' && dsRevealed.has(key))) ? ' is-open' : '';
        return '<button type="button" class="ds-redact' + open + '" data-redact="' + esc(key) + '" aria-label="Reveal redacted value">' +
            '<span class="ds-redact-bar" aria-hidden="true"></span>' +
            '<span class="ds-redact-val">' + esc(text) + '</span>' +
            '</button>';
    }

    function redactPhotoHtml(src, wide) {
        if (!src) return '';
        var key = redactKey('image', src);
        var open = (typeof isRedactOpen === 'function' ? isRedactOpen(key) : (typeof dsRevealed !== 'undefined' && dsRevealed.has(key))) ? ' is-open' : '';
        return '<button type="button" class="ds-redact ds-redact-photo' + open + (wide ? ' is-wide' : '') + '" data-redact="' + esc(key) + '" aria-label="Reveal photograph">' +
            '<span class="ds-redact-bar" aria-hidden="true"></span>' +
            '<img src="' + esc(src) + '" alt="">' +
            '</button>';
    }

    function pushReportNote(notes, text, ref) {
        var raw = String(text || '').trim();
        var t = prettyPdfValue(text);
        if (!t) return;
        if (notes.some(function (item) { return item.text === t; })) return;
        notes.push({ text: t, raw: raw, ref: ref || null });
    }

    function reportNotes() {
        var notes = [];
        filedFacts().forEach(function (item) {
            if (item.id === 'notes' || /^notes?$/i.test(item.label || '')) {
                pushReportNote(notes, item.value, { key: 'fact', id: item.id });
            }
        });
        pushReportNote(notes, profile().analysis, { key: 'analysis', id: '' });
        (data.evidence || []).forEach(function (item, idx) {
            pushReportNote(notes, item && item.note, { key: 'evidence', id: String(idx) });
        });
        return notes;
    }

    function reportNamed(text) {
        var value = prettyPdfValue(text || '');
        if (!value || SKIP_TITLES[value]) return '';
        return value;
    }

    function reportBoardItems() {
        var board = data.whiteboard || {};
        var nodes = board.nodes || [];
        var byId = {};
        var items = [];
        nodes.forEach(function (node) {
            if (!node || node.type === 'image' || node.type === 'draw') return;
            var title = reportNamed(node.title);
            var body = prettyPdfValue(node.body || '');
            if (!title && !body) return;
            byId[node.id] = title || body.slice(0, 48);
            items.push({
                label: title || 'Card',
                value: body,
                redact: body ? 'notes' : '',
                edit: { kind: 'board', id: node.id, key: body ? 'body' : 'title', raw: body || String(node.title || '').trim(), show: body || title }
            });
        });
        (board.links || []).forEach(function (link) {
            var from = byId[link && link.from];
            var to = byId[link && link.to];
            if (!from || !to) return;
            var label = prettyPdfValue(link.label || '');
            items.push({ label: from + ' → ' + to, value: label });
        });
        return items;
    }

    function reportPadItems() {
        var pad = data.notepad || {};
        var byId = {};
        var items = [];
        (pad.notes || []).forEach(function (note) {
            if (!note) return;
            var title = reportNamed(note.title);
            var body = prettyPdfValue(note.body || '');
            if (!title && !body) return;
            byId[note.id] = title || 'Note';
            items.push({
                label: title || 'Note',
                value: body,
                redact: body ? 'notes' : '',
                edit: { kind: 'pad', id: note.id, key: body ? 'body' : 'title', raw: body || String(note.title || '').trim(), show: body || title }
            });
        });
        (pad.links || []).forEach(function (link) {
            var from = byId[link && link.from];
            var to = byId[link && link.to];
            if (!from || !to) return;
            items.push({ label: from + ' → ' + to, value: '' });
        });
        return items;
    }

    function reportHarvestItems() {
        var names = {
            name: 'Name', alias: 'Alias', email: 'Email', phone: 'Phone', username: 'Username',
            password: 'Password', address: 'Address', dob: 'Date of birth', date: 'Date', time: 'Time',
            company: 'Company', occupation: 'Occupation', ip: 'IP address', url: 'URL', domain: 'Domain',
            id: 'Identifier', os: 'System', vin: 'VIN'
        };
        var redact = { name: 'name', alias: 'name', email: 'email', phone: 'phone', username: 'username', password: 'password', address: 'address', dob: 'dob', ip: 'ip', id: 'id' };
        var hits = (data.harvester && data.harvester.hits) || [];
        var out = [];
        hits.forEach(function (hit, index) {
            if (!hit) return;
            var value = prettyPdfValue(hit.value || '');
            if (!value) return;
            var kind = String(hit.kind || '');
            var label = names[kind] || (kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : 'Item');
            if (hit.platform) label += ' / ' + prettyPdfValue(hit.platform);
            var note = prettyPdfValue(hit.note || '');
            out.push({
                label: label,
                value: value,
                note: note,
                redact: redact[kind] || '',
                edit: { kind: 'harvest', id: String(index), key: 'value', raw: String(hit.value || '').trim(), show: value },
                noteEdit: note ? { kind: 'harvest', id: String(index), key: 'note', raw: String(hit.note || '').trim(), show: note } : null
            });
        });
        return out;
    }

    function reportRoman(n) {
        var romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return romans[n - 1] || String(n);
    }

    function reportCaseMeta() {
        var rec = (profile() && profile().case) || {};
        var status = pdfSafe(rec.status || 'open');
        return {
            number: pdfSafe(rec.number || ''),
            offense: pdfSafe(rec.offense || ''),
            status: status ? status.charAt(0).toUpperCase() + status.slice(1) : '',
            investigator: pdfSafe(rec.investigator || ''),
            openedAt: rec.openedAt ? prettyCaptured(rec.openedAt) : ''
        };
    }

    function reportDocument() {
        var rec = reportCaseMeta();
        return {
            subject: subjectName(),
            dateLong: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            notice: REPORT_NOTICE,
            close: REPORT_CLOSE,
            closeTitle: REPORT_CLOSE_TITLE,
            liabilityTitle: REPORT_LIABILITY_TITLE,
            liability: REPORT_LIABILITY,
            banner: REPORT_BANNER,
            case: rec,
            rows: reportOrderedFacts(),
            notes: reportNotes(),
            chronology: reportChronology(),
            board: reportBoardItems(),
            pad: reportPadItems(),
            harvest: reportHarvestItems(),
            photos: collectReportPhotos()
        };
    }

    function loadReportPhoto(src, opts) {
        opts = typeof opts === 'number' ? { max: opts } : (opts || {});
        return new Promise(function (resolve) {
            if (!src) { resolve(null); return; }
            function paint(img) {
                try {
                    var nw = img.naturalWidth || img.width || 1;
                    var nh = img.naturalHeight || img.height || 1;
                    var max = opts.max || 360;
                    var scale = Math.min(1, max / Math.max(nw, nh));
                    var w = Math.max(1, Math.round(nw * scale));
                    var h = Math.max(1, Math.round(nh * scale));
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    if (opts.paper) {
                        ctx.fillStyle = opts.paper;
                    ctx.fillRect(0, 0, w, h);
                    }
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(function (blob) {
                        if (!blob) { resolve(null); return; }
                        blob.arrayBuffer().then(function (buf) {
                            resolve({ bytes: new Uint8Array(buf), w: w, h: h });
                        }).catch(function () { resolve(null); });
                    }, 'image/jpeg', 0.86);
                } catch (err) { resolve(null); }
            }
            function fromUrl(url, cors) {
                var img = new Image();
                if (cors) img.crossOrigin = 'anonymous';
                img.onload = function () { paint(img); };
                img.onerror = function () { resolve(null); };
                img.src = url;
            }
            if (/^(data:|blob:)/i.test(src)) {
                fromUrl(src, false);
                return;
            }
            var job = host && host.srcToBlob ? host.srcToBlob(src) : fetch(src).then(function (r) { return r.blob(); });
            Promise.resolve(job).then(function (blob) {
                if (!blob) { fromUrl(src, true); return; }
                var u = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = function () { URL.revokeObjectURL(u); paint(img); };
                img.onerror = function () { URL.revokeObjectURL(u); fromUrl(src, true); };
                img.src = u;
            }).catch(function () { fromUrl(src, true); });
        });
    }

    function collectReportPhotos() {
        var seen = {};
        var list = [];
        function add(src, caption) {
            src = String(src || '').trim();
            if (!src || seen[src]) return;
            seen[src] = true;
            var cap = prettyPdfValue(caption) || (/^https?:\/\//i.test(src) ? src : '');
            list.push({ src: src, caption: cap });
        }
        imageItems().forEach(function (item) {
            add(item.src || item.thumb, item.value || item.name || '');
        });
        (data.timeline || []).forEach(function (ev) {
            if (ev && ev.image) add(ev.image, ev.title || ev.source || '');
        });
        ((data.whiteboard && data.whiteboard.nodes) || []).forEach(function (node) {
            if (!node || !node.src) return;
            if (node.type === 'image' || node.shape === 'image' || /^data:image/i.test(node.src) || /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(node.src) || /^https?:\/\//i.test(node.src)) {
                add(node.src, node.title || node.body || '');
            }
        });
        (data.evidence || []).forEach(function (item) {
            if (!item) return;
            var src = item.file || item.url || '';
            if (item.kind === 'image' || /^data:image/i.test(src) || /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(src)) add(src, item.title || '');
        });
        return list;
    }

    function downloadReport() {
        var photos = collectReportPhotos();
        var jobs = photos.slice(0, 8).map(function (item) {
            return loadReportPhoto(item.src).then(function (jpeg) {
                item.jpeg = jpeg;
                return item;
            });
        });
        Promise.all(jobs).then(function (loaded) {
            writeSubjectPdf(loaded);
        }).catch(function () {
            writeSubjectPdf(photos);
        });
    }

    function writeSubjectPdf(photos) {
        const doc = reportDocument();
        const subject = doc.subject;
        const dateLong = doc.dateLong;
        const pages = [];
        const LEFT = 72;
        const WIDTH = 612 - LEFT - 72;
        const NARROW = 420;
        const BOTTOM = 72;
        const BODY = 10;

        function newPage(kind) {
            if (kind === true) kind = 'cover';
            if (kind === false) kind = 'cont';
            var cover = kind === 'cover';
            var page = { ops: ['__PAGE_FOOT__'], y: 728, first: cover, kind: kind, images: [] };
            var rec = doc.case || {};
            var left = rec.number ? 'CASE ' + rec.number : 'CASE FILE';
            var mid = 'RECORD';
            var right = pdfSafe(dateLong);
            paint(page, '/F1', 9, LEFT, 758, left, '0.15 0.15 0.15');
            paint(page, '/F2', 9, (612 - measurePdf(mid, 9)) / 2, 758, mid, '0 0 0');
            paint(page, '/F1', 9, LEFT + WIDTH - measurePdf(right, 9), 758, right, '0.15 0.15 0.15');
            page.ops.push('0 0 0 RG 0.9 w ' + LEFT.toFixed(2) + ' 746 m ' + (LEFT + WIDTH).toFixed(2) + ' 746 l S');
            page.ops.push('0 0 0 RG 0.4 w ' + LEFT.toFixed(2) + ' 743 m ' + (LEFT + WIDTH).toFixed(2) + ' 743 l S');
            page.y = 728;
            return page;
        }

        function ensure(page, need) {
            if (page.y - need < BOTTOM) {
                pages.push(page);
                return newPage(page.kind === 'cover' ? 'record' : 'cont');
            }
            return page;
        }

        function paint(page, font, size, x, y, text, gray, track) {
            var g = gray == null ? '0.12 0.12 0.12' : gray;
            var tc = track ? String(track) + ' Tc ' : '0 Tc ';
            page.ops.push(g + ' rg BT ' + font + ' ' + size + ' Tf ' + tc + x.toFixed(2) + ' ' + y.toFixed(2) + ' Td (' + pdfEscape(text) + ') Tj ET');
        }

        function center(page, text, size, font, extra, gray, track) {
            page = ensure(page, size + extra + 4);
            var w = measurePdf(text, size) + (track || 0) * Math.max(0, pdfSafe(text).length - 1);
            paint(page, font, size, (612 - w) / 2, page.y, text, gray, track);
            page.y -= size + extra;
            return page;
        }

        function flow(page, text, opts) {
            opts = opts || {};
            var size = opts.size || BODY;
            var font = opts.font || '/F1';
            var width = opts.width || WIDTH;
            var x = opts.x != null ? opts.x : LEFT;
            var lead = opts.lead || (size + 4.4);
            var lines = wrapPdf(text, width, size);
            lines.forEach(function (ln, i) {
                page = ensure(page, lead + 2);
                var drawX = x;
                if (opts.center) drawX = (612 - measurePdf(ln, size)) / 2;
                page.ops.push((opts.gray || '0.12 0.12 0.12') + ' rg BT ' + font + ' ' + size + ' Tf 0 Tc 0 Tw ' + drawX.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td (' + pdfEscape(ln) + ') Tj ET');
                page.y -= lead;
            });
            if (opts.after) page.y -= opts.after;
            return page;
        }

        function flowRich(page, text, opts) {
            opts = opts || {};
            var size = opts.size || BODY;
            var width = opts.width || WIDTH;
            var x = opts.x != null ? opts.x : LEFT;
            var lead = opts.lead || (size + 4.4);
            var parts = String(text || '').split('**');
            var tokens = [];
            parts.forEach(function (part, i) {
                if (!part) return;
                var bold = i % 2 === 1;
                part.split(/(\s+)/).forEach(function (bit) {
                    if (!bit) return;
                    tokens.push({ bold: bold, text: bit, space: /^\s+$/.test(bit) });
                });
            });
            var lines = [];
            var line = [];
            var lineW = 0;
            tokens.forEach(function (tok) {
                var tw = measurePdf(tok.text, size);
                if (!line.length && tok.space) return;
                if (line.length && lineW + tw > width && !tok.space) {
                    while (line.length && line[line.length - 1].space) line.pop();
                    if (line.length) lines.push(line);
                    line = [tok];
                    lineW = tw;
                    return;
                }
                line.push(tok);
                lineW += tw;
            });
            while (line.length && line[line.length - 1].space) line.pop();
            if (line.length) lines.push(line);
            lines.forEach(function (ln, i) {
                page = ensure(page, lead + 2);
                var lineW = 0;
                ln.forEach(function (tok) {
                    var chunk = tok.space ? tok.text.replace(/\s+/g, ' ') : tok.text;
                    if (chunk) lineW += measurePdf(chunk, size);
                });
                var drawX = opts.center ? (612 - lineW) / 2 : x;
                var ops = [(opts.gray || '0.12 0.12 0.12') + ' rg BT 0 Tc 0 Tw ' + drawX.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td'];
                ln.forEach(function (tok) {
                    var chunk = tok.space ? tok.text.replace(/\s+/g, ' ') : tok.text;
                    if (!chunk) return;
                    ops.push((tok.bold ? '/F2 ' : '/F1 ') + size + ' Tf (' + pdfEscape(chunk) + ') Tj');
                });
                ops.push('ET');
                page.ops.push(ops.join(' '));
                page.y -= lead;
            });
            if (opts.after) page.y -= opts.after;
            return page;
        }

        function heading(page, text) {
            page = ensure(page, 20);
            page.y -= 3;
            paint(page, '/F2', 11, LEFT, page.y, pdfSafe(text).toUpperCase(), '0 0 0');
            page.y -= 4;
            page.ops.push('0 0 0 RG 0.7 w ' + LEFT.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (LEFT + WIDTH).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 10;
            return page;
        }

        function centerHeading(page, text) {
            page = center(page, pdfSafe(text).toUpperCase(), 11, '/F2', 6, '0 0 0', 0);
            var rw = 168;
            var rx = (612 - rw) / 2;
            page.ops.push('0 0 0 RG 0.7 w ' + rx.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (rx + rw).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 12;
            return page;
        }

        function closeParaH(text, after) {
            return wrapPdf(String(text || '').replace(/\*\*/g, ''), WIDTH, 9).length * 12.5 + (after || 8);
        }

        function paintFill(page, x, width, label, value, size) {
            size = size || 10;
            var lab = pdfSafe(label);
            var val = pdfSafe(value == null || value === '' ? '--' : value);
            var lines = wrapPdf(val, Math.max(72, width * 0.5), size);
            if (!lines.length) lines = ['--'];
            var v0 = lines[0];
            var labW = measurePdf(lab, size);
            var valW = measurePdf(v0, size);
            var valX = x + width - valW;
            paint(page, '/F2', size, x, page.y, lab, '0.12 0.12 0.12');
            if (valX > x + labW + 10) {
                var dots = '';
                var room = valX - x - labW - 8;
                while (measurePdf(dots + '.', 8) < room) dots += '.';
                if (dots) paint(page, '/F1', 8, x + labW + 4, page.y, dots, '0.5 0.5 0.5');
            }
            paint(page, '/F1', size, Math.max(x + labW + 6, valX), page.y, v0, '0.12 0.12 0.12');
            return lines;
        }

        function fillLine(page, label, value, opts) {
            opts = opts || {};
            var size = opts.size || 10;
            var lead = opts.lead || 12;
            var indent = opts.indent || 0;
            var width = opts.width != null ? opts.width : (WIDTH - indent);
            var x = LEFT + indent;
            page = ensure(page, lead + 2);
            var lines = paintFill(page, x, width, label, value, size);
            page.y -= lead;
            var i;
            for (i = 1; i < lines.length; i++) {
                page = ensure(page, lead);
                paint(page, '/F1', size, x + width - measurePdf(lines[i], size), page.y, lines[i], '0.12 0.12 0.12');
                page.y -= lead;
            }
            return page;
        }

        function pairLine(page, leftL, leftV, rightL, rightV, width) {
            width = width != null ? width : WIDTH;
            var col = (width - 14) / 2;
            page = ensure(page, 12);
            var y = page.y;
            paintFill(page, LEFT, col, leftL, leftV, 10);
            paintFill(page, LEFT + col + 14, col, rightL, rightV, 10);
            page.y = y - 12;
            return page;
        }

        function kvLine(page, label, value, indent) {
            return fillLine(page, label, value, { indent: indent || 0 });
        }

        function runIn(page, label, value) {
            return fillLine(page, label, value);
        }

        function rule(page) {
            page = ensure(page, 18);
            page.ops.push('0.35 0.35 0.35 RG 0.55 w ' + LEFT.toFixed(2) + ' ' + page.y.toFixed(2) + ' m ' + (LEFT + WIDTH).toFixed(2) + ' ' + page.y.toFixed(2) + ' l S');
            page.y -= 16;
            return page;
        }

        function placePhoto(page, jpeg, maxW, maxH) {
            if (!jpeg || !jpeg.bytes || !jpeg.bytes.length) return page;
            var aspect = jpeg.h / Math.max(1, jpeg.w);
            var w = maxW;
            var h = w * aspect;
            if (h > maxH) { h = maxH; w = h / aspect; }
            page = ensure(page, h + 22);
            var x = (612 - w) / 2;
            var y = page.y - h;
            var name = 'Im' + (page.images.length + 1);
            page.images.push({ name: name, bytes: jpeg.bytes, w: jpeg.w, h: jpeg.h });
            page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /' + name + ' Do Q');
            page.ops.push('0.42 0.42 0.42 RG 0.6 w ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
            page.y = y - 14;
            return page;
        }

        function placePhotoAt(page, jpeg, x, yTop, maxW, maxH) {
            if (!jpeg || !jpeg.bytes || !jpeg.bytes.length) return { w: 0, h: 0 };
            var aspect = jpeg.h / Math.max(1, jpeg.w);
            var w = maxW;
            var h = w * aspect;
            if (h > maxH) { h = maxH; w = h / aspect; }
            var y = yTop - h;
            var name = 'Im' + (page.images.length + 1);
            page.images.push({ name: name, bytes: jpeg.bytes, w: jpeg.w, h: jpeg.h });
            page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /' + name + ' Do Q');
            page.ops.push('0.42 0.42 0.42 RG 0.5 w ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
            return { w: w, h: h };
        }

        var portrait = (photos || []).find(function (item) { return item && item.jpeg && item.jpeg.bytes; }) || null;
        var morePhotos = (photos || []).filter(function (item) { return item && item.jpeg && item.jpeg.bytes && item !== portrait; });
        var rows = doc.rows;
        var notes = doc.notes;
        var rec = doc.case || {};
        var chrono = doc.chronology || [];

        let pageObj = newPage('cover');
        var head = REPORT_HEAD.toUpperCase();
        var headW = measurePdf(head, REPORT_HEAD_SIZE);
        var coverH = REPORT_HEAD_SIZE + 18 + 10 + 16;
        doc.notice.forEach(function (para, i) {
            coverH += wrapPdf(String(para || '').replace(/\*\*/g, ''), WIDTH, 10).length * 13.5 + (i === doc.notice.length - 1 ? 12 : 8);
        });
        coverH += wrapPdf(doc.banner, WIDTH, 9).length * 12;
        var coverTop = 728;
        var coverBot = 84;
        pageObj.y = Math.min(coverTop, (coverTop + coverBot + coverH) / 2);
        paint(pageObj, '/F2', REPORT_HEAD_SIZE, (612 - headW) / 2, pageObj.y, head, '0 0 0', 0);
        pageObj.y -= REPORT_HEAD_SIZE + 18;
        pageObj = center(pageObj, 'INVESTIGATIVE NOTICE', 10, '/F2', 16, '0 0 0', 0);
        doc.notice.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 10, lead: 13.5, after: i === doc.notice.length - 1 ? 12 : 8, center: true });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 3, '0 0 0', 0);
        });
        pages.push(pageObj);

        pageObj = newPage('record');
        pageObj = heading(pageObj, 'I. Case file');
        var caseTop = pageObj.y;
        var textW = WIDTH;
        var photoBox = { w: 0, h: 0 };
        if (portrait) {
            photoBox = placePhotoAt(pageObj, portrait.jpeg, LEFT + WIDTH - 92, caseTop, 92, 118);
            textW = WIDTH - photoBox.w - 14;
        }
        pageObj = pairLine(pageObj, 'Case no.', rec.number || '--', 'Status', rec.status || '--', textW);
        pageObj = pairLine(pageObj, 'Offense', rec.offense || '--', 'Investigator', rec.investigator || '--', textW);
        pageObj = pairLine(pageObj, 'Subject', subject || 'UNKNOWN', 'Recorded', dateLong, textW);
        if (rec.openedAt) pageObj = fillLine(pageObj, 'Opened', rec.openedAt, { width: textW, lead: 12 });
        if (photoBox.h) pageObj.y = Math.min(pageObj.y, caseTop - photoBox.h - 8);
        pageObj.y -= 4;

        pageObj = heading(pageObj, 'II. Particulars');
        if (!rows.length) {
            pageObj = flow(pageObj, 'No particulars have been recorded.', { size: 10, after: 6 });
        }
        rows.forEach(function (row, idx) {
            var title = String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(row.label).toUpperCase();
            var meta = [row.confidence, row.method, row.captured].filter(Boolean).join('   ');
            var valLines = wrapPdf(row.value || '--', WIDTH * 0.5, 10);
            var need = 16 + (valLines.length - 1) * 12 + (meta ? 11 : 0) + (row.source ? 12 : 0);
            pageObj = ensure(pageObj, Math.min(need, 220));
            pageObj = fillLine(pageObj, title, row.value || '--', { lead: 12 });
            if (meta) {
                pageObj = ensure(pageObj, 11);
                paint(pageObj, '/F3', 9, LEFT + 18, pageObj.y, pdfSafe(meta), '0.28 0.28 0.28');
                pageObj.y -= 11;
            }
            if (row.source) pageObj = fillLine(pageObj, 'Note', row.source, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
            pageObj.y -= 3;
        });

        var sectionNo = 2;
        function nextHeading(title) {
            sectionNo += 1;
            pageObj = heading(pageObj, reportRoman(sectionNo) + '. ' + title);
        }
        function paintItems(items) {
            items.forEach(function (row, idx) {
                pageObj = ensure(pageObj, 28);
                pageObj = fillLine(pageObj, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(row.label), row.value || '--', { lead: 12 });
                if (row.note) pageObj = fillLine(pageObj, 'Note', row.note, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                pageObj.y -= 3;
            });
        }

        if (chrono.length) {
            nextHeading('Timeline');
            chrono.forEach(function (row, idx) {
                var when = [row.date, row.time].filter(Boolean).join('  ') || '--';
                pageObj = ensure(pageObj, 28);
                if (row.title) {
                    pageObj = fillLine(pageObj, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(when), row.title, { lead: 12 });
                } else {
                    pageObj = ensure(pageObj, 13);
                    paint(pageObj, '/F2', 10, LEFT, pageObj.y, String(idx + 1).padStart(2, '0') + '  ' + pdfSafe(when), '0.12 0.12 0.12');
                    pageObj.y -= 12;
                }
                if (row.body) pageObj = fillLine(pageObj, 'Entry', row.body, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                if (row.source) pageObj = fillLine(pageObj, 'Source', row.source, { indent: 18, size: 9, lead: 11, width: WIDTH - 18 });
                pageObj.y -= 3;
            });
        }

        if ((doc.board || []).length) {
            nextHeading('Whiteboard');
            paintItems(doc.board);
        }
        if ((doc.pad || []).length) {
            nextHeading('Notepad');
            paintItems(doc.pad);
        }
        if ((doc.harvest || []).length) {
            nextHeading('Harvester');
            paintItems(doc.harvest);
        }

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            nextHeading('Photographs');
            morePhotos.forEach(function (item) {
                pageObj = placePhoto(pageObj, item.jpeg, 180, 160);
                if (item.caption) {
                    pageObj = flow(pageObj, item.caption, { center: true, size: 9, font: '/F3', width: NARROW, after: 10, gray: '0.25 0.25 0.25' });
                }
            });
            if (!morePhotos.length && portrait && portrait.caption) pageObj = kvLine(pageObj, 'Photograph', portrait.caption);
        }

        if (notes.length) {
            nextHeading('Notes');
            notes.forEach(function (item) {
                pageObj = flow(pageObj, item.text, { size: 10, lead: 13, after: 8 });
            });
        }

        pages.push(pageObj);
        pageObj = newPage('close');
        var closeH = closeParaH(doc.close[0], 16) + 29 + closeParaH(doc.close[1], 18) + 29;
        doc.liability.forEach(function (para, i) {
            closeH += closeParaH(para, i === doc.liability.length - 1 ? 14 : 10);
        });
        closeH += wrapPdf(doc.banner, WIDTH, 9).length * 12;
        var usableTop = 728;
        var usableBot = 84;
        pageObj.y = Math.min(usableTop, (usableTop + usableBot + closeH) / 2);
        pageObj = flowRich(pageObj, doc.close[0], { size: 9, lead: 12.5, after: 16, center: true });
        pageObj = centerHeading(pageObj, doc.closeTitle);
        pageObj = flowRich(pageObj, doc.close[1], { size: 9, lead: 12.5, after: 18, center: true });
        pageObj = centerHeading(pageObj, doc.liabilityTitle);
        doc.liability.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 9, lead: 12.5, after: i === doc.liability.length - 1 ? 14 : 10, center: true });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 3, '0 0 0', 0);
        });

        pages.push(pageObj);
        const pdf = buildPdf(pages);
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        var fileBase = String(rec.number || subject || 'file').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
        a.download = (fileBase || 'file') + '.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    function reportRichHtml(text) {
        return String(text || '').split('**').map(function (part, i) {
            return i % 2 === 1 ? '<b>' + esc(part) + '</b>' : esc(part);
        }).join('');
    }

    function reportPreviewMarkup() {
        var doc = reportDocument();
        var WIDTH = 468;
        var MAX = 580;
        var rec = doc.case || {};
        var photos = doc.photos || [];
        var portrait = photos[0] || null;
        var morePhotos = photos.slice(1);
        var chrono = doc.chronology || [];
        var pages = [];
        var cur = [];
        var used = 0;
        var nextKind = 'cover';
        var lockCover = true;

        function flush() {
            if (!cur.length && pages.length) return;
            pages.push({ kind: nextKind, first: nextKind === 'cover', html: cur.join('') });
            cur = [];
            used = 0;
            nextKind = nextKind === 'cover' ? 'record' : 'cont';
        }

        function add(html, h) {
            h = Math.max(8, Math.ceil(h || 20));
            if (!lockCover && cur.length && used + h > MAX) flush();
            cur.push(html);
            used += h;
        }

        function dsEditAttrs(edit) {
            if (!edit) return '';
            function attr(text) {
                return esc(String(text == null ? '' : text)).replace(/\r?\n/g, '&#10;');
            }
            return ' data-ds-edit="' + attr(edit.kind) + '" data-ds-id="' + attr(edit.id) + '" data-ds-key="' + attr(edit.key) + '" data-ds-match="' + attr(edit.match) + '" data-ds-raw="' + attr(edit.raw) + '" data-ds-show="' + attr(edit.show) + '"';
        }

        function fillHtml(label, valueHtml, edit) {
            return '<div class="ds-fill' + (edit ? ' is-editable' : '') + '"' + dsEditAttrs(edit) + '><span class="ds-fill-k">' + esc(label) + '</span><span class="ds-fill-dots" aria-hidden="true"></span><span class="ds-fill-v">' + valueHtml + '</span></div>';
        }

        function pairHtml(a, b) {
            return '<div class="ds-pair">' + fillHtml(a[0], a[1], a[2]) + fillHtml(b[0], b[1], b[2]) + '</div>';
        }

        function addRows(pairs) {
            var html = '';
            var h = 0;
            pairs.forEach(function (pair) {
                html += fillHtml(pair[0], pair[1]);
                h += 13 * Math.max(1, wrapPdf(String(pair[2] != null ? pair[2] : '').replace(/<[^>]*>/g, ' ') || '--', 220, 10).length);
            });
            add(html, h);
        }

        function addFact(row, idx) {
            var title = String(idx + 1).padStart(2, '0') + '  ' + String(row.label || '').toUpperCase();
            var html = '<div class="ds-item">' + fillHtml(title, redactHtml(row.id, row.value), {
                kind: 'fact', id: row.id, key: 'value', raw: row.raw || '', show: row.value || '', match: row.raw || ''
            });
            var h = 16;
            var bits = [row.confidence, row.method, row.captured].filter(Boolean);
            if (bits.length) {
                html += '<div class="ds-meta">' + esc(bits.join('  ·  ')) + '</div>';
                h += 11;
            }
            if (row.source) {
                html += fillHtml('Note', esc(row.source), {
                    kind: 'fact', id: row.id, key: 'source', raw: row.sourceRaw || '', show: row.source || '', match: row.raw || ''
                });
                h += 13 * Math.max(1, wrapPdf(row.source, 280, 9).length);
            }
            html += '</div>';
            add(html, h + 4);
        }

        function section(title) {
            add('<h3 class="ds-h">' + esc(title) + '</h3>', 22);
        }

        add('<div class="ds-cover"><div class="ds-c ds-banner"><span>' + esc(REPORT_HEAD.toUpperCase()) + '</span></div>', 22);
        add('<div class="ds-c ds-kicker">INVESTIGATIVE NOTICE</div>', 20);
        doc.notice.forEach(function (para, i) {
            var last = i === doc.notice.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 10).length * 14 + (last ? 12 : 8);
            add('<p class="ds-p' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        add('</div>', 1);
        lockCover = false;
        flush();

        section('I. Case file');
        (function () {
            var live = (profile().case) || {};
            var subjectRaw = firstValue('name') || '';
            var meta = pairHtml(
                ['Case no.', rec.number ? esc(rec.number) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'number', raw: live.number || '', show: live.number || '' }],
                ['Status', rec.status ? esc(rec.status) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'status', raw: live.status || 'open', show: rec.status || 'Open' }]
            ) + pairHtml(
                ['Offense', rec.offense ? esc(rec.offense) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'offense', raw: live.offense || '', show: live.offense || '' }],
                ['Investigator', rec.investigator ? esc(rec.investigator) : '<span class="ds-empty">--</span>', { kind: 'case', key: 'investigator', raw: live.investigator || '', show: live.investigator || '' }]
            ) + pairHtml(
                ['Subject', redactHtml('name', doc.subject || 'UNKNOWN'), { kind: 'fact', id: 'name', key: 'value', raw: subjectRaw, show: subjectRaw, match: subjectRaw }],
                ['Recorded', esc(doc.dateLong)]
            ) + (rec.openedAt ? fillHtml('Opened', esc(rec.openedAt)) : '');
            var html = '<div class="ds-case"><div class="ds-case-meta">' + meta + '</div>';
            if (portrait && portrait.src) html += redactPhotoHtml(portrait.src, false);
            html += '</div>';
            add(html, portrait && portrait.src ? 128 : 48);
        }());

        section('II. Particulars');
        if (!doc.rows.length) add('<p class="ds-p">No particulars have been recorded.</p>', 18);
        doc.rows.forEach(function (row, idx) {
            addFact(row, idx);
        });

        var sectionNo = 2;
        function nextSection(title) {
            sectionNo += 1;
            section(reportRoman(sectionNo) + '. ' + title);
        }
        function addItems(rows) {
            rows.forEach(function (row, idx) {
                var label = String(idx + 1).padStart(2, '0') + '  ' + row.label;
                var valueHtml = row.redact ? redactHtml(row.redact, row.value) : (row.value ? esc(row.value) : '<span class="ds-empty">--</span>');
                var html = '<div class="ds-item">' + fillHtml(label, valueHtml, row.edit || null);
                var h = 16 + 13 * Math.max(0, wrapPdf(row.value || '', 220, 10).length - 1);
                if (row.note) {
                    html += fillHtml('Note', esc(row.note), row.noteEdit || null);
                    h += 13;
                }
                html += '</div>';
                add(html, h + 4);
            });
        }

        if (chrono.length) {
            nextSection('Timeline');
            chrono.forEach(function (row, idx) {
                var when = [row.date, row.time].filter(Boolean).join('  ') || '--';
                var html = '<div class="ds-item">' + (row.title
                    ? fillHtml(String(idx + 1).padStart(2, '0') + '  ' + when, esc(row.title), { kind: 'event', id: row.id, key: 'title', raw: row.titleRaw || '', show: row.title || '' })
                    : '<div class="ds-fill"><span class="ds-fill-k">' + esc(String(idx + 1).padStart(2, '0') + '  ' + when) + '</span></div>');
                var h = 16;
                if (row.body) {
                    html += fillHtml('Entry', redactHtml('notes', row.body), { kind: 'event', id: row.id, key: 'body', raw: row.bodyRaw || '', show: row.body || '' });
                    h += 12;
                }
                if (row.source) {
                    html += fillHtml('Source', esc(row.source), { kind: 'event', id: row.id, key: 'source', raw: row.sourceRaw || '', show: row.source || '' });
                    h += 12;
                }
                html += '</div>';
                add(html, h + 4);
            });
        }

        if ((doc.board || []).length) {
            nextSection('Whiteboard');
            addItems(doc.board);
        }
        if ((doc.pad || []).length) {
            nextSection('Notepad');
            addItems(doc.pad);
        }
        if ((doc.harvest || []).length) {
            nextSection('Harvester');
            addItems(doc.harvest);
        }

        if (morePhotos.length || (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption))) {
            nextSection('Photographs');
            morePhotos.forEach(function (item) {
                add(redactPhotoHtml(item.src, true), 220);
                if (item.caption) add('<div class="ds-cap">' + esc(item.caption) + '</div>', 14);
            });
            if (!morePhotos.length && portrait && portrait.caption) {
                addRows([['Photograph', esc(portrait.caption), portrait.caption]]);
            }
        }

        if (doc.notes.length) {
            nextSection('Notes');
            doc.notes.forEach(function (item) {
                var ref = item.ref || {};
                var h = wrapPdf(item.text, WIDTH, 10).length * 13 + 8;
                add('<p class="ds-p ds-note is-editable"' + dsEditAttrs({ kind: 'note', id: ref.id || '', key: ref.key || '', raw: item.raw || item.text, show: item.text }) + '>' + redactHtml('notes', item.text) + '</p>', h);
            });
        }

        flush();
        nextKind = 'close';
        var closeHtml = '<div class="ds-close">';
        closeHtml += '<p class="ds-p is-close">' + reportRichHtml(doc.close[0]) + '</p>';
        closeHtml += '<h3 class="ds-h">' + esc(doc.closeTitle) + '</h3>';
        closeHtml += '<p class="ds-p is-close">' + reportRichHtml(doc.close[1]) + '</p>';
        closeHtml += '<h3 class="ds-h">' + esc(doc.liabilityTitle) + '</h3>';
        doc.liability.forEach(function (para, i) {
            closeHtml += '<p class="ds-p is-close' + (i === doc.liability.length - 1 ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>';
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            closeHtml += '<div class="ds-c ds-foot">' + esc(ln) + '</div>';
        });
        closeHtml += '</div>';
        add(closeHtml, 520);
        flush();

        var n = pages.length || 1;
        return '<div class="ds-fit">' + pages.map(function (page, i) {
            var kind = page.kind || (page.first ? 'cover' : 'cont');
            var cls = kind === 'cover' ? ' is-first' : (kind === 'record' ? ' is-record' : (kind === 'close' ? ' is-close-page' : ''));
            var head = '<div class="ds-headband"><span>' + esc(rec.number ? 'CASE ' + rec.number : 'CASE FILE') + '</span><span>RECORD</span><span>' + esc(doc.dateLong) + '</span></div>';
            var foot = '<div class="ds-footband"><span>AUTHORIZED USE ONLY</span><span>PAGE ' + (i + 1) + ' OF ' + n + '</span></div>';
            return '<div class="ds-sheet"><article class="ds-page' + cls + '">' + head + '<div class="ds-body">' + page.html + '</div>' + foot + '</article></div>';
        }).join('') + '</div>';
    }

    function sizeDatasheet() {
        var view = $('datasheetView');
        var fit = view && view.querySelector('.ds-fit');
        if (!view || !fit) return;
        var n = fit.querySelectorAll('.ds-page').length || 1;
        var avail = Math.max(240, view.clientWidth - (view.clientWidth < 820 ? 16 : 48));
        var s = Math.min(1.15, Math.max(0.42, avail / 612));
        fit.style.setProperty('--ds-scale', String(s));
        fit.style.height = (n * 792 * s + (n - 1) * 28 * s + 8) + 'px';
    }

    function buildPdf(pages) {
        var nPages = pages.length;
        var pageDictIds = [];
        var contentIds = [];
        var i;
        for (i = 0; i < nPages; i++) {
            pageDictIds.push(6 + i * 2);
            contentIds.push(7 + i * 2);
        }
        var nextId = 6 + nPages * 2;
        pages.forEach(function (pageObj) {
            (pageObj.images || []).forEach(function (im) {
                im.objId = nextId++;
            });
        });
        var objects = new Array(nextId - 1);
        objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
        objects[1] = '<< /Type /Pages /Kids [ ' + pageDictIds.map(function (id) { return id + ' 0 R'; }).join(' ') + ' ] /Count ' + nPages + ' /MediaBox [0 0 612 792] >>';
        objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
        objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';
        objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Oblique >>';
        pages.forEach(function (pageObj, idx) {
            var xobj = (pageObj.images || []).map(function (im) {
                return '/' + im.name + ' ' + im.objId + ' 0 R';
            }).join(' ');
            var res = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>' + (xobj ? ' /XObject << ' + xobj + ' >>' : '');
            var left = 'AUTHORIZED USE ONLY';
            var right = 'PAGE ' + (idx + 1) + ' OF ' + nPages;
            var rightX = 540 - measurePdf(right, 9);
            var pageFoot =
                '0 0 0 RG 0.8 w 72 62 m 540 62 l S\n' +
                '0.15 0.15 0.15 rg BT /F1 9 Tf 0 Tc 0 Tw 72 50 Td (' + pdfEscape(left) + ') Tj ET\n' +
                '0.15 0.15 0.15 rg BT /F1 9 Tf 0 Tc 0 Tw ' + rightX.toFixed(2) + ' 50 Td (' + pdfEscape(right) + ') Tj ET';
            var streamBytes = latin1Pdf(pageObj.ops.join('\n').replace(/__PAGE_FOOT__/g, pageFoot).replace(/__PAGE_NO__/g, pageFoot));
            objects[pageDictIds[idx] - 1] = '<< /Type /Page /Parent 2 0 R /Resources << ' + res + ' >> /Contents ' + contentIds[idx] + ' 0 R >>';
            objects[contentIds[idx] - 1] = { dict: '<< /Length ' + streamBytes.length + ' >>', stream: streamBytes };
            (pageObj.images || []).forEach(function (im) {
                objects[im.objId - 1] = {
                    dict: '<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.bytes.length + ' >>',
                    stream: im.bytes
                };
            });
        });
        var chunks = [];
        chunks.push(latin1Pdf('%PDF-1.4\n'));
        chunks.push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
        var offsets = [0];
        objects.forEach(function (obj, idx) {
            offsets.push(pdfChunksLength(chunks));
            chunks.push(latin1Pdf((idx + 1) + ' 0 obj\n'));
            if (obj && obj.stream) {
                chunks.push(latin1Pdf(obj.dict + '\nstream\n'));
                chunks.push(obj.stream);
                chunks.push(latin1Pdf('\nendstream\nendobj\n'));
            } else {
                chunks.push(latin1Pdf(obj + '\nendobj\n'));
            }
        });
        var xrefPos = pdfChunksLength(chunks);
        var xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
        for (i = 1; i < offsets.length; i++) {
            xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
        }
        chunks.push(latin1Pdf(xref + 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF'));
        return concatPdf(chunks);
    }


    function bindTimelinePointers() {
        const view = $('timelineView');
        const stage = $('timelineStage');
        if (!view || !stage || view.dataset.bound) return;
        view.dataset.bound = '1';
        let drag = null;
        function stopMiddleAutoscroll(event) {
            if (event.button === 1) event.preventDefault();
        }
        view.addEventListener('mousedown', stopMiddleAutoscroll, true);
        view.addEventListener('auxclick', stopMiddleAutoscroll);
        view.addEventListener('pointerdown', function (event) {
            if (event.target.closest('#timelineMenu, #timelineIsland, #calPop, #timePop, #tlInfoPop')) return;
            hideTimelineMenu();
            if (event.target.closest('.board-bar, .work-ghost')) return;
            if (!event.target.closest('[data-tl-rs]')) {
                if (event.target.closest('button, input, textarea, [contenteditable="true"], .tl-attach, .tl-media, .tl-acts')) return;
            }
            stopTimelineCamAnim();
            if (event.button === 1) {
                event.preventDefault();
                const cam = timelineCam();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: false };
                view.classList.add('is-grabbing');
                hideTlFollow();
                view.setPointerCapture(event.pointerId);
                return;
            }
            if (event.button !== 0) return;
            if (document.body.classList.contains('is-space-pan')) {
                const cam = timelineCam();
                event.preventDefault();
                drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: false };
                view.classList.add('is-grabbing');
                hideTlFollow();
                view.setPointerCapture(event.pointerId);
                return;
            }
            const node = event.target.closest('.tl-node');
            if (event.target.closest('[data-tl-cal], [data-tl-time], [data-tl-info], #calPop, #timePop, #tlInfoPop')) return;
            if (calState) closeCalendar();
            if (timeState) closeTimePicker();
            if (infoState) closeTlInfoPop();
            if (node) {
                const id = node.getAttribute('data-event');
                const rec = (data.timeline || []).find(function (n) { return n.id === id; });
                if (timelineConnectOn) {
                    event.preventDefault();
                    toggleConnect(id);
                    return;
                }
                selectedEvent = id;
                stage.querySelectorAll('.tl-node').forEach(function (el) {
                    el.classList.toggle('is-on', el.getAttribute('data-event') === id);
                });
                hideTlFollow();
                if (!rec || rec.locked) return;
                const rs = event.target.closest('[data-tl-rs]');
                if (rs && !event.target.closest('.tl-card, button, input, [contenteditable="true"]')) {
                    event.preventDefault();
                    const startY = rec && rec.pinY != null ? Number(rec.pinY) : (parseFloat(node.style.top) || 0);
                    drag = {
                        mode: 'resize',
                        id: id,
                        handle: rs.getAttribute('data-tl-rs') || 'se',
                        x: event.clientX,
                        y: event.clientY,
                        ox: rec ? rec.pinX : 0,
                        oy: startY,
                        ow: tlCardW(rec),
                        oh: tlCardH(rec) || node.offsetHeight,
                        moved: false
                    };
                    view.style.cursor = tlResizeCursor(drag.handle);
                    view.setPointerCapture(event.pointerId);
                    return;
                }
                if (!event.target.closest('.tl-bar')) return;
                event.preventDefault();
                rememberTimeline('move:' + id);
                const startY = rec && rec.pinY != null ? Number(rec.pinY) : (parseFloat(node.style.top) || 0);
                drag = {
                    mode: 'free',
                    id: id,
                    x: event.clientX,
                    y: event.clientY,
                    ox: rec ? rec.pinX : 0,
                    oy: startY
                };
                node.classList.add('is-moving');
                view.setPointerCapture(event.pointerId);
                return;
            }
            event.preventDefault();
            const world = timelineWorldAt(event.clientX, event.clientY);
            const cam = world.cam;
            if (nearTlAxis(world) && !timelineConnectOn) {
                hideTimelineIsland();
                drag = { mode: 'mark', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, worldX: world.x, worldY: world.y };
                view.setPointerCapture(event.pointerId);
                return;
            }
            drag = { mode: 'pan', x: event.clientX, y: event.clientY, ox: cam.x, oy: cam.y, moved: false, openMenu: true };
            hideTlFollow();
            view.setPointerCapture(event.pointerId);
        });
        view.addEventListener('pointermove', function (event) {
            const world = timelineWorldAt(event.clientX, event.clientY);
            if (!drag) {
                updateTlFollow(world, event.target.closest('.tl-node'));
                return;
            }
            const cam = timelineCam();
            const z = cam.z || 1;
            if (drag.mode === 'mark') {
                if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
                    drag.mode = 'pan';
                    drag.moved = true;
                    drag.openMenu = false;
                    view.classList.add('is-grabbing');
                    hideTlFollow();
                    cam.x = drag.ox + (event.clientX - drag.x);
                    cam.y = drag.oy + (event.clientY - drag.y);
                    applyTimelineCam();
                } else {
                    updateTlFollow(world, false);
                }
                return;
            }
            if (drag.mode === 'pan') {
                if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) drag.moved = true;
                if (!drag.moved) return;
                view.classList.add('is-grabbing');
                cam.x = drag.ox + (event.clientX - drag.x);
                cam.y = drag.oy + (event.clientY - drag.y);
                applyTimelineCam();
                return;
            }
            if (drag.mode === 'resize') {
                if (!drag.moved) {
                    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
                    drag.moved = true;
                    rememberTimeline('resize:' + drag.id);
                    const live = stage.querySelector('[data-event="' + drag.id + '"]');
                    if (live) live.classList.add('is-resizing');
                }
                const rec = (data.timeline || []).find(function (n) { return n.id === drag.id; });
                if (!rec) return;
                applyTlResize(rec, drag, (event.clientX - drag.x) / z, (event.clientY - drag.y) / z);
                const el = stage.querySelector('[data-event="' + drag.id + '"]');
                if (el) {
                    placeTlCard(el, rec);
                    el.setAttribute('data-side', rec.side === 1 ? '1' : '-1');
                }
                drawTimelineAxis();
                return;
            }
            if (drag.mode === 'free' || drag.mode === 'node') {
                const rec = (data.timeline || []).find(function (n) { return n.id === drag.id; });
                if (!rec) return;
                rec.pinX = clampTimelineX(drag.ox + (event.clientX - drag.x) / z);
                rec.pinY = drag.oy + (event.clientY - drag.y) / z;
                rec.pinned = true;
                rec.free = true;
                const el = stage.querySelector('[data-event="' + drag.id + '"]');
                const boxH = el ? el.offsetHeight : 128;
                rec.side = (rec.pinY + boxH / 2) >= TL_AXIS_Y ? 1 : -1;
                if (el) {
                    placeTlCard(el, rec);
                    el.setAttribute('data-side', rec.side === 1 ? '1' : '-1');
                }
                drawTimelineAxis();
                return;
            }
        });
        view.addEventListener('pointerup', function () {
            view.classList.remove('is-grabbing');
            view.style.cursor = '';
            stage.querySelectorAll('.tl-node.is-moving').forEach(function (el) { el.classList.remove('is-moving'); });
            stage.querySelectorAll('.tl-node.is-resizing').forEach(function (el) { el.classList.remove('is-resizing'); });
            if (drag && drag.mode === 'mark') {
                addEventAt(drag.worldX, drag.worldY >= TL_AXIS_Y ? 1 : -1, true);
            }
            if (drag && drag.mode === 'pan' && !drag.moved && drag.openMenu) {
                showTimelineCanvasMenu(drag.x, drag.y);
            }
            if (drag && (drag.mode === 'node' || drag.mode === 'free' || (drag.mode === 'resize' && drag.moved))) {
                stackTimelineStems(drag.id);
                drawTimelineAxis();
                schedulePersist();
            }
            if (drag && drag.mode === 'pan' && drag.moved) schedulePersist();
            drag = null;
        });
        view.addEventListener('pointercancel', function () {
            view.classList.remove('is-grabbing');
            view.style.cursor = '';
            stage.querySelectorAll('.tl-node.is-moving').forEach(function (el) { el.classList.remove('is-moving'); });
            stage.querySelectorAll('.tl-node.is-resizing').forEach(function (el) { el.classList.remove('is-resizing'); });
            drag = null;
            hideTlFollow();
        });
        view.addEventListener('pointerleave', function () {
            if (!drag) hideTlFollow();
        });
        view.addEventListener('wheel', function (event) {
            event.preventDefault();
            stopTimelineCamAnim();
            const cam = timelineCam();
            const rect = view.getBoundingClientRect();
            const prev = cam.z || 1;
            const next = Math.min(3.2, Math.max(0.2, prev * (event.deltaY > 0 ? 0.92 : 1.08)));
            const px = event.clientX - rect.left;
            const py = event.clientY - rect.top;
            const wx = (px - cam.x) / prev;
            const wy = (py - cam.y) / prev;
            cam.z = next;
            cam.x = px - wx * next;
            cam.y = py - wy * next;
            applyTimelineCam();
            schedulePersist();
        }, { passive: false });
        view.addEventListener('dragover', function (event) {
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
            event.preventDefault();
        });
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            if (!file || String(file.type || '').indexOf('image/') !== 0) return;
            const card = event.target.closest && event.target.closest('.tl-node');
            const rec = (data.timeline || []).find(function (item) {
                return item.id === (card ? card.getAttribute('data-event') : selectedEvent);
            }) || addEventAt(tlAimX, -1, true);
            const reader = new FileReader();
            reader.onload = function () { attachTimelineImage(rec.id, String(reader.result || '')); };
            reader.readAsDataURL(file);
        });
        view.addEventListener('contextmenu', function (event) {
            if (event.target.closest('#timelineMenu, #timelineIsland, .board-bar')) return;
            event.preventDefault();
            const node = event.target.closest('.tl-node');
            if (node) showTimelineCardMenu(event.clientX, event.clientY, node.getAttribute('data-event'));
            else showTimelineCanvasMenu(event.clientX, event.clientY);
        });
    }

    function onClick(event) {
        if (event.target.closest('#calPop')) {
            onCalendarClick(event);
            return;
        }
        if (event.target.closest('#timePop')) {
            onTimeClick(event);
            return;
        }
        if (event.target.closest('#tlInfoPop')) {
            onTlInfoClick(event);
            return;
        }
        const calBtn = event.target.closest('[data-tl-cal], [data-fact-cal], #eventDateBtn') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-cal], #eventDateBtn');
        if (calBtn) {
            event.preventDefault();
            openCalendar(calBtn);
            return;
        }
        const timeBtn = event.target.closest('[data-tl-time], [data-fact-time]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-time]');
        if (timeBtn) {
            event.preventDefault();
            openTimePicker(timeBtn);
            return;
        }
        const infoBtn = event.target.closest('[data-tl-info]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-info]');
        if (infoBtn) {
            event.preventDefault();
            openTlInfoPop(infoBtn);
            return;
        }
        if (calState) closeCalendar();
        if (timeState) closeTimePicker();
        if (infoState) closeTlInfoPop();
        const tlAct = event.target.closest('[data-tl-ctx]');
        if (tlAct) {
            runTimelineMenu(tlAct.getAttribute('data-tl-ctx'), tlMenuId || selectedEvent);
            return;
        }
        if (!event.target.closest('#timelineMenu')) hideTimelineMenu();
        const pageBtn = event.target.closest('[data-page]');
        if (pageBtn && pageBtn.closest('#pageSwitch')) {
            const id = pageBtn.getAttribute('data-page');
            if (id === 'casebook') {
                const panel = $('profilePanel');
                const toggle = $('profileToggle');
                if (panel && !panel.classList.contains('open') && toggle) toggle.click();
                return;
            }
            setPage(id);
            return;
        }
        const uploadBtn = event.target.closest('[data-wb-upload]');
        if (uploadBtn) {
            const node = uploadBtn.closest('.wb-node');
            openBoardImagePicker(node && node.dataset.node);
            return;
        }

        const addEv = event.target.closest('#timelineAdd, #timelineEmptyAdd');
        if (addEv) {
            const events = data.timeline || [];
            let x = 220;
            events.forEach(function (ev) { x = Math.max(x, (Number(ev.pinX) || 0) + TL_GAP); });
            addEventAt(x, events.length % 2 === 0 ? -1 : 1);
            return;
        }
        const foldBit = event.target.closest('[data-tl-fold]');
        if (foldBit) {
            event.preventDefault();
            toggleTlBit(foldBit.getAttribute('data-event'), foldBit.getAttribute('data-tl-fold'), foldBit.getAttribute('data-note-id'));
            return;
        }
        const dropBit = event.target.closest('[data-tl-drop]');
        if (dropBit) {
            event.preventDefault();
            dropTlBit(dropBit.getAttribute('data-event'), dropBit.getAttribute('data-tl-drop'), dropBit.getAttribute('data-note-id'));
            return;
        }
        const delEv = event.target.closest('[data-del-event]');
        if (delEv) { deleteEvent(delEv.getAttribute('data-del-event')); return; }
        const miniBtn = event.target.closest('[data-tl-mini]');
        if (miniBtn) {
            const id = miniBtn.getAttribute('data-tl-mini');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            const node = miniBtn.closest('.tl-node');
            if (rec && node) {
                rememberTimeline();
                rec.mini = !rec.mini;
                node.classList.toggle('is-mini', rec.mini);
                placeTlCard(node, rec);
                miniBtn.title = rec.mini ? 'Expand' : 'Minimize';
                miniBtn.setAttribute('aria-label', rec.mini ? 'Expand' : 'Minimize');
                miniBtn.setAttribute('aria-expanded', rec.mini ? 'false' : 'true');
                const extra = node.querySelector('.tl-extra');
                const finish = function () {
                    stackTimelineStems();
                    drawTimelineAxis();
                };
                if (reduceMotion()) {
                    finish();
                } else {
                    let frames = 0;
                    const tick = function () {
                        stackTimelineStems();
                        drawTimelineAxis();
                        frames += 1;
                        if (frames < 22) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                    if (extra) extra.addEventListener('transitionend', finish, { once: true });
                }
                schedulePersist();
            }
            return;
        }
        const clearImg = event.target.closest('[data-tl-clear-img]');
        if (clearImg) {
            const id = clearImg.getAttribute('data-tl-clear-img');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.image = '';
                if (rec.show) rec.show.image = false;
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const delNote = event.target.closest('[data-tl-del-note]');
        if (delNote) {
            const id = delNote.getAttribute('data-event');
            const nid = delNote.getAttribute('data-tl-del-note');
            const rec = findTimelineEvent(id);
            if (rec) {
                rememberTimeline();
                rec.moreNotes = (rec.moreNotes || []).filter(function (note) { return note.id !== nid; });
                renderTimeline();
                schedulePersist();
            }
            return;
        }
        const expandImg = event.target.closest('[data-tl-expand], .tl-thumb');
        if (expandImg && expandImg.closest('.tl-media')) {
            const id = expandImg.getAttribute('data-tl-expand') || (expandImg.closest('[data-event]') && expandImg.closest('[data-event]').getAttribute('data-event'));
            const rec = findTimelineEvent(id);
            if (rec && rec.image) expandTimelineImage(rec.image);
            return;
        }
        const photoBtn = event.target.closest('[data-tl-photo]');
        if (photoBtn) {
            timelinePhotoId = photoBtn.getAttribute('data-tl-photo');
            const input = $('timelineImageFile');
            if (input) input.click();
            return;
        }
        const conEv = event.target.closest('[data-connect-event]');
        if (conEv) { toggleConnect(conEv.getAttribute('data-connect-event')); return; }
        if (event.target.closest('#timelineIsland')) {
            timelineConnectOn = false;
            connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.closest('#timelineConnectBtn, [data-tl-connect]')) {
            timelineConnectOn = !timelineConnectOn;
            if (!timelineConnectOn) connectFrom = '';
            applyTimelineCam();
            renderTimeline();
            return;
        }
        if (event.target.id === 'timelineDelete' && selectedEvent) {
            deleteEvent(selectedEvent);
            return;
        }
        if (event.target.id === 'timelineRecenter') {
            recenterTimeline();
            schedulePersist();
            return;
        }
        const selEv = event.target.closest('[data-event]');
        if (selEv && selEv.closest('#timelineList') && !event.target.closest('button, input, [contenteditable="true"]')) {
            const id = selEv.getAttribute('data-event');
            if (timelineConnectOn || connectFrom) { toggleConnect(id); return; }
            selectedEvent = id;
            document.querySelectorAll('#timelineList .tl-node').forEach(function (el) {
                el.classList.toggle('is-on', el.getAttribute('data-event') === id);
            });
            return;
        }
        if (event.target.id === 'eventCancel' || event.target.id === 'eventClose') { hideSheet($('eventSheet')); return; }
        if (event.target.id === 'eventSheet') hideSheet($('eventSheet'));

        const done = event.target.closest('[data-board-done]');
        if (done) { toggleBoardDone(done.getAttribute('data-board-done')); return; }
        const addKind = event.target.closest('[data-board-add]');
        if (addKind) { placeFromMenu(addKind.getAttribute('data-board-add')); return; }
        const addFact = event.target.closest('[data-board-add-fact]');
        if (addFact) {
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec) {
                rec.type = 'data';
                rec.shape = typeMeta('data').shape || 'data';
                rec.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                rec.body = addFact.getAttribute('data-fact-value') || '';
                renderWhiteboard();
                schedulePersist();
                return;
            }
            const node = addBoardNode('data', at);
            if (node) {
                node.title = addFact.getAttribute('data-fact-label') || 'Identifier';
                node.body = addFact.getAttribute('data-fact-value') || '';
            renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPhoto = event.target.closest('[data-board-add-photo]');
        if (addPhoto) {
            const photos = imageItems();
            const item = photos[Number(addPhoto.getAttribute('data-board-add-photo'))];
            const onto = boardMenuMode === 'node' && boardSelected;
            const rec = onto && (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const at = boardDropAt || { x: 180, y: 140 };
            hideBoardAddMenu();
            if (rec && item) {
                rec.type = 'image';
                rec.shape = typeMeta('image').shape || 'image';
                rec.src = item.src;
                rec.title = item.name || item.value || rec.title || 'Photo';
            renderWhiteboard();
            schedulePersist();
            return;
        }
            const node = addBoardNode('image', at);
            if (node && item) {
                node.src = item.src;
                node.title = item.name || item.value || 'Photo';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const addPlay = event.target.closest('[data-board-add-play]');
        if (addPlay) {
            const at = boardDropAt;
            hideBoardAddMenu();
            insertPlaybook(addPlay.getAttribute('data-board-add-play'), at);
            return;
        }
        const addUpload = event.target.closest('[data-board-add-upload]');
        if (addUpload) {
            hideBoardAddMenu(true);
            const input = $('boardImageFile');
            if (input) input.click();
            return;
        }
        const moreBtn = event.target.closest('[data-board-more]');
        if (moreBtn) {
            hideBoardAddMenu();
            closeBoardPresets();
            const more = $('boardMoreMenu');
            if (more && !more.hidden) hideBoardMore();
            else showBoardMore();
            return;
        }
        if (event.target.closest('[data-board-presets]')) {
            hideBoardAddMenu();
            hideBoardMore();
            const sheet = $('boardPresetSheet');
            if (sheet && !sheet.hidden) closeBoardPresets();
            else openBoardPresets();
            return;
        }
        if (event.target.id === 'boardPresetClose' || event.target.id === 'boardPresetSheet') {
            closeBoardPresets();
            return;
        }
        const presetPick = event.target.closest('[data-board-preset]');
        if (presetPick) {
            insertBoardPreset(presetPick.getAttribute('data-board-preset'));
            return;
        }
        const more = $('boardMoreMenu');
        if (more && !more.hidden && !event.target.closest('#boardMoreMenu, [data-board-more]')) hideBoardMore();
        const addMenu = $('boardAddMenu');
        if (addMenu && !addMenu.hidden) {
            if (addMenu.dataset.skip) {
                delete addMenu.dataset.skip;
            } else if (!event.target.closest('#boardAddMenu')) {
                hideBoardAddMenu();
            }
        }
        const stroke = event.target.closest('[data-board-stroke]');
        if (stroke && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.stroke = stroke.getAttribute('data-board-stroke');
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const fill = event.target.closest('[data-board-fill]');
        if (fill && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.fill = fill.getAttribute('data-board-fill');
                boardPaintFill = rec.fill;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const sw = event.target.closest('[data-board-sw]');
        if (sw && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.sw = Number(sw.getAttribute('data-board-sw')) || 1.75;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const dash = event.target.closest('[data-board-dash]');
        if (dash && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard();
                rec.dash = dash.getAttribute('data-board-dash') || 'solid';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        const edge = event.target.closest('[data-board-edge]');
        if (edge && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            if (rec) {
                rememberBoard();
                rec.edge = edge.getAttribute('data-board-edge') || 'round';
                rec.radius = rec.edge === 'sharp' ? 0 : 12;
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('[data-board-grid]')) {
            data.whiteboard.grid = data.whiteboard.grid === false;
            hideBoardAddMenu();
            renderWhiteboard();
            schedulePersist();
            return;
        }
        const ctx = event.target.closest('[data-board-ctx]');
        if (ctx) {
            const act = ctx.getAttribute('data-board-ctx');
            const drop = boardDropAt;
            hideBoardAddMenu();
            if (act === 'cut' && boardSelected) cutBoardNode(boardSelected);
            if (act === 'copy' && boardSelected) copyBoardNode(boardSelected);
            if (act === 'paste') pasteBoardNode(drop || { x: 180, y: 140 });
            if (act === 'duplicate' && boardLinkSelected) duplicateBoardLink(boardLinkSelected);
            else if (act === 'duplicate' && boardSelected) duplicateBoardNode(boardSelected);
            if (act === 'clear-links' && boardSelected) clearBoardLinks(boardSelected);
            if (act === 'detach' && boardLinkSelected) detachBoardLink(boardLinkSelected, 'both');
            if (act === 'copy-style' && (boardSelected || boardLinkSelected)) copyBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'paste-style' && (boardSelected || boardLinkSelected)) pasteBoardStyle(boardSelected || boardLinkSelected);
            if (act === 'flip-h' && boardSelected) flipBoardNode(boardSelected, 'h');
            if (act === 'flip-v' && boardSelected) flipBoardNode(boardSelected, 'v');
            if (act === 'link' && boardSelected) setBoardHref(boardSelected);
            if (act === 'lock' && boardSelected) toggleBoardLock(boardSelected);
            if (act === 'delete' && boardLinkSelected) deleteBoardLink(boardLinkSelected);
            else if (act === 'delete' && boardSelected) deleteBoardNode(boardSelected);
            if (act === 'recenter') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            }
            return;
        }
        const tool = event.target.closest('[data-board-tool]');
        if (tool) {
            hideBoardMore();
            hideBoardAddMenu();
            boardDrawToShape = false;
            const nextTool = tool.getAttribute('data-board-tool');
            boardTool = boardTool === nextTool && nextTool !== 'select' ? 'select' : nextTool;
            boardConnect = '';
            boardConnectPort = '';
            renderWhiteboard();
            return;
        }
        const action = event.target.closest('[data-board-action]');
        if (action) {
            hideBoardMore();
            hideBoardAddMenu();
            const act = action.getAttribute('data-board-action');
            if (act === 'draw-shape') startDrawToShape();
            if (act === 'text-diagram') {
                const raw = window.prompt('Text to diagram\nUse lines, and arrows like Alice -> Bob', '');
                if (raw) textToDiagram(raw);
            }
            if (act === 'mermaid') {
                const raw = window.prompt('Mermaid flowchart\nExample:\ngraph TD\nA[Start] --> B{Check}\nB --> C[Done]', '');
                if (raw) mermaidToDiagram(raw);
            }
            if (act === 'wireframe') {
                const raw = window.prompt('Wireframe to code\nOne section per line. HTML is copied to the clipboard.', 'Header\nSearch\nResults\nFooter');
                if (raw) wireframeToCode(raw);
            }
            return;
        }
        if (event.target.closest('[data-board-undo]')) {
            undoBoard();
            return;
        }
        if (event.target.closest('[data-board-redo]')) {
            redoBoard();
            return;
        }
        if (event.target.id === 'boardAdd') {
            addBoardNode(BOARD_PLACE.indexOf(boardTool) >= 0 ? boardTool : 'square');
            return;
        }
        if (event.target.id === 'boardInsertPlaybook') {
            insertPlaybook(($('boardPlaybook') && $('boardPlaybook').value) || 'username');
            return;
        }
        if (event.target.id === 'boardDelete' && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            deleteBoardSelection();
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardLinkSelected) {
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (event.target.id === 'boardDuplicate' && boardSelected) {
            duplicateBoardNode(boardSelected);
            return;
        }
        if (event.target.id === 'boardEditBtn' && boardSelected) {
            beginBoardTextEdit(boardSelected);
            return;
        }
        const applyShape = event.target.closest('[data-board-apply]');
        if (applyShape && boardSelected) {
            const rec = (data.whiteboard.nodes || []).find(function (n) { return n.id === boardSelected; });
            const kind = applyShape.getAttribute('data-board-apply');
            if (rec && BOARD_SHAPES[kind]) {
                rec.type = kind;
                rec.shape = typeMeta(kind).shape || kind;
                if (kind === 'circle' || kind === 'square') {
                    const side = Math.max(shapeSize(rec).w, shapeSize(rec).h);
                    rec.w = side;
                    rec.h = side;
                }
                renderWhiteboard();
            schedulePersist();
            }
            return;
        }
        const layer = event.target.closest('[data-board-layer]');
        if (layer && boardSelected) {
            hideBoardAddMenu();
            layerBoardNode(boardSelected, layer.getAttribute('data-board-layer'));
            return;
        }
        if (event.target.id === 'boardSheetClose' || event.target.id === 'boardSheetCancel' || event.target.id === 'boardSheet') {
            hideSheet($('boardSheet'));
            return;
        }

        if (event.target.id === 'intelClose' || event.target.id === 'intelSheet') { hideSheet($('intelSheet')); return; }
        if (event.target.id === 'intelRun') {
            runDomainIntel($('intelHost') && $('intelHost').value);
            return;
        }
        if (event.target.id === 'metaClose' || event.target.id === 'metaSheet') hideSheet($('metaSheet'));
        const rev = event.target.closest('[data-rev]');
        if (rev) {
            openReverse(($('reverseMenu') && $('reverseMenu').dataset.src) || '', rev.getAttribute('data-rev'));
            return;
        }
        if (!event.target.closest('#reverseMenu')) {
            const menu = $('reverseMenu');
            if (menu) menu.hidden = true;
        }
        if (event.target.id === 'timelineZoomIn') {
            stopTimelineCamAnim();
            const cam = timelineCam();
            cam.z = Math.min(3.2, cam.z * 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
        if (event.target.id === 'timelineZoomOut') {
            stopTimelineCamAnim();
            const cam = timelineCam();
            cam.z = Math.max(0.2, cam.z / 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
    }

    function onChange(event) {
        if (event.target.id === 'eventImagePick' && event.target.value) {
            $('eventImage').value = event.target.value;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-date')) {
            const id = event.target.getAttribute('data-tl-date');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline();
                rec.date = event.target.value;
                rec.pinned = true;
                renderTimeline();
            schedulePersist();
            }
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url')) {
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-href')) {
            const id = event.target.getAttribute('data-tl-href');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rec.source = String(event.target.value || '').trim();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardPlaybook' && event.target.value) {
            data.flowchart.preset = event.target.value;
            schedulePersist();
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url')) {
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            const rec = node && findBoardNode(node.dataset.node);
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onInput(event) {
        if (event.target.closest && event.target.closest('#timePop .time-num')) {
            applyTimeTyped(event.target);
            return;
        }
        const wbText = event.target.closest('[data-wb-text].is-edit');
        if (wbText) {
            const nodeEl = wbText.closest('.wb-node');
            const rec = nodeEl && (data.whiteboard.nodes || []).find(function (n) { return n.id === nodeEl.dataset.node; });
            if (rec) {
                const parts = String(wbText.innerText || '').replace(/\r/g, '').split('\n');
                rec.title = (parts.shift() || '').trim().slice(0, 120);
                rec.body = parts.join('\n').replace(/^\n+/, '').trim().slice(0, 800);
            schedulePersist();
            }
        }
        const field = event.target.closest('[data-tl-field]');
        if (field) {
            const id = field.getAttribute('data-event-id');
            const rec = (data.timeline || []).find(function (item) { return item.id === id; });
            if (rec) {
                rememberTimeline('type:' + id);
                const key = field.getAttribute('data-tl-field');
                if (key === 'more') {
                    const nid = field.getAttribute('data-note-id');
                    rec.moreNotes = rec.moreNotes || [];
                    rec.moreNotes.forEach(function (item) {
                        if (item.id === nid) item.text = tlEditableBlank(field) ? '' : field.innerText;
                    });
                    syncTlPlaceholder(field);
                } else if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                    rec[key] = String(field.value || '').trim();
                } else {
                    syncTlPlaceholder(field);
                    rec[key] = tlEditableBlank(field) ? '' : field.innerText;
                }
                schedulePersist();
                scheduleStemRedraw();
            }
        }
        if (event.target.id === 'boardSizeW' || event.target.id === 'boardSizeH') {
            applyBoardSizeFromFields();
        }
        if (event.target.id === 'boardOpacity' && (boardSelected || boardLinkSelected)) {
            const rec = styleBoardItem();
            if (rec) {
                rememberBoard('op:' + rec.id);
                rec.op = Math.max(0, Math.min(1, Number(event.target.value) / 100));
                const el = document.querySelector('#boardStage [data-node="' + rec.id + '"]');
                if (el) el.style.setProperty('--wb-op', String(rec.op));
                if (boardLinkSelected) drawBoardLinks($('boardLinks'), data.whiteboard);
                schedulePersist();
            }
        }
        if (event.target.id === 'boardRadius' && boardSelected) {
            setBoardRadius(event.target.value);
        }
    }

    function onPaste(event) {
        const clip = event.clipboardData;
        if (!clip) return;
        const inField = event.target && event.target.closest && event.target.closest('input:not([data-wb-image-url]):not([data-wb-embed-url]):not([data-tl-image-url]), textarea, select, [contenteditable="true"]');
        const file = clipboardImageFile(clip);
        const text = String(clip.getData('text') || '').trim();
        const slot = event.target && event.target.closest && event.target.closest('[data-wb-image-url], [data-wb-embed-url]');
        const slotNode = slot && slot.closest && slot.closest('.wb-node');
        if (file) {
            if (inField) return;
            event.preventDefault();
            if (page === 'whiteboard') {
                readImageFile(file, slotNode ? slotNode.dataset.node : (findBoardNode(boardSelected) && findBoardNode(boardSelected).type === 'image' ? boardSelected : ''), boardPointerAt);
                return;
            }
            if (page === 'timeline') {
                const card = event.target.closest && event.target.closest('.tl-node');
                const rec = (data.timeline || []).find(function (item) {
                    return item.id === (card ? card.getAttribute('data-event') : selectedEvent);
                }) || addEventAt(tlAimX, -1, true);
                const reader = new FileReader();
                reader.onload = function () { attachTimelineImage(rec.id, String(reader.result || '')); };
                reader.readAsDataURL(file);
                return;
            }
            if (host && host.applyProfilePhotoFiles) host.applyProfilePhotoFiles([file]);
            return;
        }
        if (page === 'whiteboard' && /^https?:\/\//i.test(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'embed') {
                event.preventDefault();
                rememberBoard();
                rec.src = text;
                renderWhiteboard();
                schedulePersist();
                return;
            }
        }
        if (page === 'whiteboard' && looksLikeImageSrc(text) && !inField) {
            const rec = slotNode ? findBoardNode(slotNode.dataset.node) : findBoardNode(boardSelected);
            if (rec && rec.type === 'image') {
                event.preventDefault();
                applyImageSrc(rec.id, text, '');
            }
            return;
        }
        if (page === 'whiteboard' && boardClip && !inField && !slot) {
            event.preventDefault();
            pasteBoardNode(boardPointerAt || boardDropAt);
            return;
        }
        if (page === 'timeline' && looksLikeImageSrc(text) && !inField) {
            const card = event.target.closest && event.target.closest('.tl-node');
            event.preventDefault();
            attachTimelineImage(card ? card.getAttribute('data-event') : selectedEvent, text);
            return;
        }
    }

    function onKey(event) {
        if (event.key === 'Escape' && calState) {
            event.preventDefault();
            closeCalendar();
            return;
        }
        if (event.key === 'Escape' && timeState) {
            event.preventDefault();
            closeTimePicker();
            return;
        }
        if (timeState && event.target.closest && event.target.closest('#timePop .time-num')) {
            if (onTimeFieldKey(event)) return;
        }
        if (event.key === 'Escape' && infoState) {
            event.preventDefault();
            closeTlInfoPop();
            return;
        }
        if (event.key === 'Escape' && document.querySelector('#boardStage [data-wb-text].is-edit')) {
            event.preventDefault();
            commitBoardTextEdit();
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-tl-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const id = event.target.getAttribute('data-tl-image-url');
            const url = String(event.target.value || '').trim();
            if (looksLikeImageSrc(url)) attachTimelineImage(id, url);
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-image-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const url = String(event.target.value || '').trim();
            if (node && looksLikeImageSrc(url)) applyImageSrc(node.dataset.node, url, '');
            return;
        }
        if (event.target.hasAttribute && event.target.hasAttribute('data-wb-embed-url') && (event.key === 'Enter')) {
            event.preventDefault();
            const node = event.target.closest('.wb-node');
            const rec = node && findBoardNode(node.dataset.node);
            const url = String(event.target.value || '').trim();
            if (rec && /^https?:\/\//i.test(url)) {
                rememberBoard();
                rec.src = url;
                rec.type = 'embed';
                rec.shape = 'embed';
                renderWhiteboard();
                schedulePersist();
            }
            return;
        }
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'Escape') {
            hideTimelineMenu();
            if (connectFrom || timelineConnectOn) {
                connectFrom = '';
                timelineConnectOn = false;
                renderTimeline();
            }
            if (boardConnect || boardTool === 'connect') {
                boardConnect = '';
                boardConnectPort = '';
                boardTool = 'select';
                renderWhiteboard();
            }
            const view = $('boardView');
            if (view) view.classList.remove('is-linking');
            markBoardPorts('', '', '', '');
            setLinkDraft('', false);
            hideBoardAddMenu();
            hideBoardMore();
            closeBoardPresets();
            return;
        }
        if ((event.key === 'Delete' || event.key === 'Backspace') && page === 'timeline' && selectedEvent) {
            event.preventDefault();
            deleteEvent(selectedEvent);
            return;
        }
        if (page === 'timeline') {
            const meta = event.metaKey || event.ctrlKey;
            const key = event.key;
            if (meta && (key === 'x' || key === 'X') && selectedEvent) {
                event.preventDefault();
                cutTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'c' || key === 'C') && selectedEvent) {
                event.preventDefault();
                copyTimelineEvent(selectedEvent);
                return;
            }
            if (meta && (key === 'v' || key === 'V')) {
                event.preventDefault();
                pasteTimelineEvent();
                return;
            }
            if (meta && (key === 'd' || key === 'D') && selectedEvent) {
                event.preventDefault();
                duplicateTimelineEvent(selectedEvent);
                return;
            }
            if (meta && key === ']' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'front' : 'up');
                return;
            }
            if (meta && key === '[' && selectedEvent) {
                event.preventDefault();
                layerTimelineEvent(selectedEvent, event.shiftKey ? 'back' : 'down');
                return;
            }
        }
        if (page !== 'whiteboard') return;
        const meta = event.metaKey || event.ctrlKey;
        const key = event.key;
        if (meta && (key === 'a' || key === 'A')) {
            event.preventDefault();
            selectBoardNodes(
                (data.whiteboard.nodes || []).map(function (n) { return n.id; }),
                (data.whiteboard.links || []).map(function (l) { return l.id; })
            );
            return;
        }
        if (meta && (key === 'z' || key === 'Z' || key === 'y' || key === 'Y')) return;
        if (meta && (key === 'x' || key === 'X') && boardSelected) {
            event.preventDefault();
            cutBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            copyBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'v' || key === 'V') && event.altKey && (boardSelected || boardLinkSelected)) {
            event.preventDefault();
            pasteBoardStyle(boardSelected || boardLinkSelected);
            return;
        }
        if (meta && (key === 'c' || key === 'C') && boardSelected) {
            event.preventDefault();
            copyBoardNode(boardSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardLinkSelected) {
            event.preventDefault();
            duplicateBoardLink(boardLinkSelected);
            return;
        }
        if (meta && (key === 'd' || key === 'D') && boardSelected) {
            event.preventDefault();
            duplicateBoardNode(boardSelected);
            return;
        }
        if (meta && event.shiftKey && (key === 'k' || key === 'K') && boardSelected) {
            event.preventDefault();
            setBoardHref(boardSelected);
            return;
        }
        if (meta && key === ']' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'front' : 'up');
            return;
        }
        if (meta && key === '[' && boardSelected) {
            event.preventDefault();
            layerBoardNode(boardSelected, event.shiftKey ? 'back' : 'down');
            return;
        }
        if (event.shiftKey && (key === 'h' || key === 'H') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'h');
            return;
        }
        if (event.shiftKey && (key === 'v' || key === 'V') && !meta && boardSelected) {
            event.preventDefault();
            flipBoardNode(boardSelected, 'v');
            return;
        }
        if (event.shiftKey && (key === 'x' || key === 'X') && !meta) {
            event.preventDefault();
            startDrawToShape();
            return;
        }
        if (!meta && !event.shiftKey) {
            const tools = { h: 'pan', v: 'select', r: 'square', d: 'diamond', o: 'circle', a: 'arrow', l: 'line', p: 'draw', t: 'text', n: 'note', e: 'eraser', q: 'connect', i: 'image', f: 'frame', k: 'laser', b: 'bucket', '9': 'image' };
            const nextTool = tools[String(key).toLowerCase()];
            if (nextTool) {
                event.preventDefault();
                boardDrawToShape = false;
                boardTool = nextTool;
                boardConnect = '';
                boardConnectPort = '';
                renderWhiteboard();
                return;
            }
        }
        if ((key === 'Delete' || key === 'Backspace') && (boardPicked.length || boardPickedLinks.length || boardSelected || boardLinkSelected)) {
            event.preventDefault();
            deleteBoardSelection();
            return;
        }
    }

    function onSubmit(event) {
        if (event.target.id === 'intelForm') {
            event.preventDefault();
            const input = event.target.querySelector('input');
            const value = input ? input.value : '';
            runDomainIntel(value);
        }
        if (event.target.id === 'eventForm' || event.target.id === 'boardForm') {
            event.preventDefault();
            if (event.target.id === 'eventForm') saveEventEditor();
            else saveBoardEditor();
        }
    }

    function onFile(event) {
        if (event.target.id === 'harvesterFile') {
            ingestHarvesterFiles(event.target.files);
            event.target.value = '';
            return;
        }
        if (event.target.id === 'timelineImageFile') {
        const file = event.target.files && event.target.files[0];
            const id = timelinePhotoId;
            event.target.value = '';
            if (!file || !id) return;
            const reader = new FileReader();
            reader.onload = function () {
                const rec = (data.timeline || []).find(function (item) { return item.id === id; });
                if (!rec) return;
                rememberTimeline();
                rec.image = String(reader.result || '');
                renderTimeline();
                schedulePersist();
            };
            reader.readAsDataURL(file);
            return;
        }
        if (event.target.id === 'boardImageFile') {
            const file = event.target.files && event.target.files[0];
            const at = boardDropAt || { x: 180, y: 140 };
            const onto = boardMenuMode === 'node' && boardSelected;
            const selectedId = boardSelected;
            boardDropAt = null;
            event.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
                const src = String(reader.result || '');
                const rec = selectedId && (data.whiteboard.nodes || []).find(function (n) { return n.id === selectedId; });
                if (rec && (rec.type === 'image' || onto)) {
                    applyImageSrc(rec.id, src, file.name || rec.title || '');
                    return;
                }
                const node = addBoardNode('image', at);
                if (!node) return;
                applyImageSrc(node.id, src, file.name || 'Photo');
        };
        reader.readAsDataURL(file);
        }
    }

    let fieldMenuEl = null;
    let fieldMenuTarget = null;
    let fieldMenuRange = null;

    function editableField(node) {
        if (!node || !node.closest) return null;
        const field = node.closest('textarea, input, [contenteditable="true"]');
        if (!field || field.disabled) return null;
        if (field.matches('input')) {
            const type = (field.getAttribute('type') || 'text').toLowerCase();
            if (/^(button|submit|reset|checkbox|radio|file|range|color|hidden|image)$/.test(type)) return null;
        }
        return field;
    }

    function fieldHasSelection(field) {
        if (!field) return false;
        if (field.selectionStart != null) return field.selectionEnd > field.selectionStart;
        const sel = window.getSelection();
        return !!(sel && !sel.isCollapsed && field.contains(sel.anchorNode));
    }

    function captureFieldRange(field) {
        if (!field) return null;
        if (field.selectionStart != null) return { kind: 'input', start: field.selectionStart, end: field.selectionEnd };
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (!field.contains(range.commonAncestorContainer)) return null;
        return { kind: 'range', range: range.cloneRange() };
    }

    function restoreFieldRange(field, saved) {
        if (!field) return;
        field.focus();
        if (!saved) return;
        if (saved.kind === 'input' && field.setSelectionRange) {
            field.setSelectionRange(saved.start, saved.end);
            return;
        }
        if (saved.kind === 'range') {
            const sel = window.getSelection();
            if (!sel) return;
            sel.removeAllRanges();
            sel.addRange(saved.range);
        }
    }

    function armFieldEdit(field) {
        fieldMenuTarget = field;
        fieldMenuRange = captureFieldRange(field);
    }

    function fieldEditRows(field) {
        const secret = field && field.type === 'password';
        const locked = !!(field && (field.readOnly || field.disabled));
        const selected = fieldHasSelection(field);
        function row(act, label, keys, off) {
            return '<button type="button" role="menuitem" data-field-act="' + act + '"' + (off ? ' disabled' : '') + '><span>' + label + '</span><kbd>' + keys + '</kbd></button>';
        }
        return '<p>Edit</p>' +
            row('undo', 'Undo', 'Ctrl+Z', locked) +
            row('redo', 'Redo', 'Ctrl+Shift+Z', locked) +
            '<hr>' +
            row('cut', 'Cut', 'Ctrl+X', locked || secret || !selected) +
            row('copy', 'Copy', 'Ctrl+C', secret || !selected) +
            row('paste', 'Paste', 'Ctrl+V', locked) +
            '<hr>' +
            row('select', 'Select all', 'Ctrl+A', false);
    }

    function hideFieldMenu() {
        if (fieldMenuEl) fieldMenuEl.hidden = true;
    }

    function placeAppMenu(menu, x, y) {
        if (!menu) return;
        menu.hidden = false;
        const width = menu.offsetWidth || 196;
        const height = menu.offsetHeight || 40;
        const left = Math.min(Math.max(8, x), window.innerWidth - width - 8);
        const top = y + height > window.innerHeight - 8 ? Math.max(8, y - height) : Math.max(8, y);
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function fieldMenuHost() {
        if (fieldMenuEl) return fieldMenuEl;
        const menu = document.createElement('div');
        menu.id = 'editMenu';
        menu.className = 'app-menu';
        menu.hidden = true;
        menu.setAttribute('role', 'menu');
        menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
        menu.addEventListener('click', function (event) {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            const field = fieldMenuTarget;
            const act = button.getAttribute('data-field-act');
            hideFieldMenu();
            if (field) runFieldEdit(field, act);
        });
        document.body.appendChild(menu);
        fieldMenuEl = menu;
        return menu;
    }

    function showFieldMenu(field, x, y) {
        if (!field) return;
        closeNoteMenu();
        armFieldEdit(field);
        const menu = fieldMenuHost();
        menu.innerHTML = fieldEditRows(field);
        placeAppMenu(menu, x, y);
    }

    function runFieldEdit(field, action) {
        if (!field || field.disabled) return;
        const saved = fieldMenuRange;
        restoreFieldRange(field, saved);
        if (action === 'select') {
            if (field.select) field.select();
            else document.execCommand('selectAll');
            return;
        }
        if (action === 'undo' || action === 'redo') {
            if (field.readOnly) return;
            document.execCommand(action);
            field.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        const secret = field.type === 'password';
        if ((action === 'cut' || action === 'copy') && !secret) {
            let text = '';
            if (field.selectionStart != null) text = field.value.slice(field.selectionStart, field.selectionEnd);
            else text = String(window.getSelection() || '');
            if (!text) return;
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
            else document.execCommand('copy');
            if (action === 'cut' && !field.readOnly) {
                if (field.selectionStart != null) {
                    const start = field.selectionStart;
                    field.value = field.value.slice(0, start) + field.value.slice(field.selectionEnd);
                    field.setSelectionRange(start, start);
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    document.execCommand('delete');
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            return;
        }
        if (action !== 'paste' || field.readOnly) return;
        function insert(text) {
            restoreFieldRange(field, saved);
            if (field.selectionStart != null) {
                const start = field.selectionStart;
                const end = field.selectionEnd;
                field.value = field.value.slice(0, start) + text + field.value.slice(end);
                const caret = start + text.length;
                field.setSelectionRange(caret, caret);
                field.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            document.execCommand('insertText', false, text);
        }
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(insert).catch(function () {
                restoreFieldRange(field, saved);
                document.execCommand('paste');
            });
            return;
        }
        document.execCommand('paste');
    }

    function bindPageContextMenu() {
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            hideFieldMenu();
            if (!event.target.closest('#noteMenu')) closeNoteMenu();
        }, true);
        document.addEventListener('contextmenu', function (event) {
            if (event.target.closest('#timelineView, #boardView, #mapStage, #noteView, #noteMenu, #noteFormat, #editMenu, #fieldMenu, #peerHubs, .board-add-menu')) return;
            const field = editableField(event.target);
            if (field) showFieldMenu(field, event.clientX, event.clientY);
        });
        document.addEventListener('pointerdown', function (event) {
            if (event.target.closest('#editMenu')) return;
            hideFieldMenu();
        }, true);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideFieldMenu();
        });
    }

    function init(api) {
        host = api || {};
        injectToolkit();
        window.addEventListener('orbint-toolkit-ready', injectToolkit);
        document.addEventListener('click', onClick);
        bindPageContextMenu();
        document.addEventListener('change', onChange);
        document.addEventListener('input', onInput);
        document.addEventListener('focusout', function (event) {
            const field = event.target && event.target.closest && event.target.closest('[data-tl-field]');
            if (field) syncTlPlaceholder(field);
        });
        document.addEventListener('keydown', onKey);
        document.addEventListener('paste', onPaste);
        document.addEventListener('submit', onSubmit);
        document.addEventListener('change', onFile, true);
        bindBoardPointers();
        bindTimelinePointers();
        bindHarvester();
        document.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch') return;
            setBoardDrift(event.clientX, event.clientY);
            if (page === 'whiteboard' && boardTool === 'laser') {
                feedLaser(worldFromClient(event.clientX, event.clientY));
            }
        }, { passive: true });
        window.addEventListener('orbint-motion', function () {
            if (reduceMotion()) setBoardDrift(null, null);
        });
        let saved = 'orbit';
        try {
            if (settingValue('rememberPage', true) === false) {
                saved = settingValue('startPage', 'orbit') || 'orbit';
            } else {
                saved = localStorage.getItem('orbint-page') || settingValue('startPage', 'orbit') || 'orbit';
            }
        } catch (error) {}
        if (saved === 'compiler') saved = 'harvester';
        if (['operations', 'orbit', 'timeline', 'whiteboard', 'notepad', 'harvester', 'datasheet', 'guide'].indexOf(saved) < 0) saved = 'orbit';
        restoreSplit(saved);
        setPage(saved);
        renderAll();
        openVisitNotice();
        document.addEventListener('click', function (event) {
            const jump = event.target.closest('[data-guide-jump]');
            if (!jump || page !== 'guide') return;
            const target = document.getElementById(jump.getAttribute('data-guide-jump'));
            if (target) target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        });
        window.addEventListener('resize', function () {
            renderPageSwitch({ instant: true });
            syncBoardToolThumb(true);
            if (calState) placeCalendar();
            if (timeState) placeTimePicker();
            if (infoState) placeTlInfoPop();
            if (page === 'datasheet') sizeDatasheet();
        });
    }

    function openVisitNotice() {
        const sheet = $('visitNotice');
        if (!sheet) return;
        let seen = '';
        try { seen = localStorage.getItem('orbint-notice'); } catch (error) {}
        if (seen === '1') return;
        sheet.hidden = false;
        const ok = $('visitNoticeOk');
        if (ok && !ok.dataset.bound) {
            ok.dataset.bound = '1';
            ok.addEventListener('click', function () {
                try { localStorage.setItem('orbint-notice', '1'); } catch (error) {}
                sheet.classList.remove('is-in');
                sheet.hidden = true;
            });
        }
        requestAnimationFrame(function () {
            sheet.classList.add('is-in');
            if (ok) ok.focus();
        });
    }

    function closeOverlays() {
        hideSheet($('eventSheet'));
        hideSheet($('intelSheet'));
        hideSheet($('metaSheet'));
        hideSheet($('boardSheet'));
        hideSheet($('boardPresetSheet'));
        hideBoardAddMenu();
        hideBoardMore();
        hideTimelineMenu();
        closeCalendar();
        closeTimePicker();
        closeTlInfoPop();
        const viewer = $('mediaViewer');
        if (viewer) viewer.hidden = true;
        const menu = $('reverseMenu');
        if (menu) menu.hidden = true;
        return false;
    }

    function resetView() {
        if (page === 'whiteboard') {
            data.whiteboard.x = 0;
            data.whiteboard.y = 0;
            data.whiteboard.z = 1;
            renderWhiteboard();
            return true;
        }
        if (page === 'timeline') {
            recenterTimeline();
            return true;
        }
        if (page === 'datasheet') return true;
        if (page === 'notepad') return true;
        if (page === 'harvester') return true;
        if (page === 'operations') return true;
        return false;
    }

    window.OrbINTCase = {
        init: init,
        load: load,
        snapshot: snapshot,
        setPage: setPage,
        toggleSplit: toggleSplit,
        page: currentPage,
        downloadReport: downloadReport,
        showPhotoMeta: showPhotoMeta,
        reverseSearchPhoto: reverseSearchPhoto,
        openDomainIntel: openDomainIntel,
        closeOverlays: closeOverlays,
        resetView: resetView,
        dockAdd: dockAdd,
        dockConnect: dockConnect,
        undoBoard: undoBoard,
        redoBoard: redoBoard,
        undoTimeline: undoTimeline,
        redoTimeline: redoTimeline,
        boardHistory: function () {
            return { undo: boardUndo.length, redo: boardRedo.length };
        },
        syncBoardHistory: syncBoardHistory,
        pages: PAGES,
        renderPageSwitch: renderPageSwitch,
        renderDatasheet: renderDatasheet,
        scheduleDatasheet: scheduleDatasheet,
        ingestHarvesterFiles: ingestHarvesterFiles
    };
})();
