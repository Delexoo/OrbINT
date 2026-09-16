/* Assembled from js/{core,datasheet,timeline,whiteboard,intel,report,boot}.js
   Edit those files, then run: python tools/bundle.py */
(function () {
    'use strict';

    const PAGES = [
        { id: 'orbit', label: 'OrbINT', kicker: 'Workspace', blurb: 'Orbit-style profile for names, usernames, emails, phones, domains, companies, and other identifiers.' },
        { id: 'timeline', label: 'Timeline', kicker: 'Chronology', blurb: 'Events and discoveries in order — who, when, evidence, and source.' },
        { id: 'whiteboard', label: 'Whiteboard', kicker: 'Diagram', blurb: 'Flowchart shapes and case cards on one board, including investigation playbooks.' },
        { id: 'datasheet', label: 'Datasheet', kicker: 'Record', blurb: 'Preview of the printed case record, as it appears in the PDF.' }
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
    }

    function setPage(id) {
        if (id === 'flowchart') id = 'whiteboard';
        if (id === 'analytics' || id === 'evidence') id = 'orbit';
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
        if (page === 'timeline') renderTimeline();
        if (page === 'whiteboard') renderWhiteboard();
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
            whiteboard: 'Add shape'
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
        const existing = wrap.querySelectorAll('[data-page]');
        if (existing.length !== PAGES.length) {
            wrap.innerHTML = '<span class="page-switch-thumb" aria-hidden="true"></span>' + PAGES.map(function (item) {
            const on = item.id === page;
            return '<button type="button" role="tab" data-page="' + item.id + '"' +
                (on ? ' aria-current="page" aria-selected="true"' : ' aria-selected="false"') +
                '>' + esc(item.label) + '</button>';
        }).join('');
            requestAnimationFrame(function () { syncPageSwitchThumb(true); });
            return;
        }
        PAGES.forEach(function (item) {
            const btn = wrap.querySelector('[data-page="' + item.id + '"]');
            if (!btn) return;
            const on = item.id === page;
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
                    platformLabel: (platformById(item.platform) || {}).label || item.platformLabel || ''
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
        renderDatasheet();
    }


    let dsLiveTimer = 0;
    let dsMarkup = '';

    function renderDatasheet() {
        const view = $('datasheetView');
        if (!view) return;
        const html = reportPreviewMarkup();
        if (html === dsMarkup && view.firstChild) {
            sizeDatasheet();
            return;
        }
        dsMarkup = html;
        const y = view.scrollTop;
        view.innerHTML = html;
        sizeDatasheet();
        view.scrollTop = y;
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

    function tlHitFromPoint(x, y, selector) {
        if (typeof document.elementsFromPoint !== 'function') return null;
        const stack = document.elementsFromPoint(x, y) || [];
        const sel = selector || TL_CTRL;
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (!el || !el.closest) continue;
            if (el.closest('.tl-rs, .cal-pop, #timelineMenu, #timelineIsland, #timelineTips')) {
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

    function syncTimelineIsland() {
        const island = $('timelineIsland');
        const label = $('timelineIslandText');
        const hint = $('timelineHint');
        if (island) {
            if (timelineConnectOn) {
                clearTimeout(tlIslandHide);
                if (label) label.textContent = connectFrom ? 'Click the second card to connect them.' : 'Click two cards to connect them.';
                island.hidden = false;
                island.setAttribute('aria-hidden', 'false');
                requestAnimationFrame(function () {
                    island.classList.add('is-on');
                    island.classList.remove('is-out');
                });
            } else if (island.classList.contains('is-on')) {
                island.classList.remove('is-on');
                island.classList.add('is-out');
                island.setAttribute('aria-hidden', 'true');
                clearTimeout(tlIslandHide);
                tlIslandHide = setTimeout(function () {
                    if (timelineConnectOn) return;
                    island.hidden = true;
                    island.classList.remove('is-out');
                    if (label) label.textContent = '';
                }, 340);
            }
        }
        if (hint) {
            hint.hidden = true;
            hint.textContent = '';
        }
    }

    function timelineTipsWanted() {
        try { return localStorage.getItem('orbint-tl-tips') !== 'off'; } catch (error) { return true; }
    }

    function setTimelineTips(open) {
        const widget = $('timelineTips');
        const btn = $('timelineTipsBtn');
        const card = $('timelineTipsCard');
        if (!widget) return;
        widget.classList.toggle('is-open', !!open);
        if (btn) {
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.setAttribute('aria-label', open ? 'Hide timeline tips' : 'Show timeline tips');
        }
        if (card) card.hidden = !open;
        try { localStorage.setItem('orbint-tl-tips', open ? 'on' : 'off'); } catch (error) {}
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
            const card = el.querySelector('.tl-card');
            const h = Math.max((card && card.offsetHeight) || 0, el.offsetHeight || 0, 86);
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
            item.side = (item.ev.side === 1 || item.ev.side === -1)
                ? item.ev.side
                : ((item.top0 + item.h / 2) >= TL_AXIS_Y ? 1 : -1);
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
                const natural = side === 1 ? TL_AXIS_Y + TL_STEM : TL_AXIS_Y - TL_STEM - item.h;
                let top = item.ev.free && isFinite(item.top0) ? item.top0 : natural;
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
        if (ev && ev.free && ev.pinY != null && isFinite(Number(ev.pinY))) return Number(ev.pinY);
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
        let value = '';
        if (eventId) {
            const rec = (data.timeline || []).find(function (item) { return item.id === eventId; });
            value = rec ? (rec.date || '') : '';
        } else {
            value = ($('eventDate') && $('eventDate').value) || '';
        }
        const parsed = parseCalIso(value);
        const now = new Date();
        closeTimePicker();
        closeTlInfoPop();
        closeCalendar();
        calState = {
            anchor: anchor,
            eventId: eventId,
            field: eventId ? '' : 'eventDate',
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
        const field = calState.field;
        closeCalendar();
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
        const rec = findTimelineEvent(eventId);
        const field = anchor.getAttribute('data-tl-time-for') || 'time';
        const slotId = anchor.getAttribute('data-note-id') || '';
        let parsed = null;
        if (field === 'moreTime' && rec) {
            const slot = (rec.moreTimes || []).find(function (item) { return item.id === slotId; });
            parsed = parseTimeParts(slot && slot.value);
        } else {
            parsed = parseTimeParts(rec && rec[field]);
        }
        const now = new Date();
        closeCalendar();
        closeTlInfoPop();
        closeTimePicker();
        timeState = {
            anchor: anchor,
            eventId: eventId,
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
        tickTlLayout(22, id);
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
        if (!events.length) {
            const view = $('timelineView');
            const cam = timelineCam();
            if (view && view.clientHeight > 80) {
                cam.y = Math.round(view.clientHeight / 2 - TL_AXIS_Y * cam.z);
                applyTimelineCam();
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
                if (!(rec.free && rec.pinY != null && isFinite(Number(rec.pinY)))) rec.pinY = cardTop(rec, el.offsetHeight);
                placeTlCard(el, rec);
            });
            stackTimelineStems();
            drawTimelineAxis();
            bindTimelineFieldSizes(list);
            bindTimelineNodeSizes(list);
            applyTlFocusAfter(list);
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
        });
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
        list.querySelectorAll('.tl-node').forEach(function (el) { tlNodeObs.observe(el); });
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
        const w = (el && el.offsetWidth) || tlCardW(ev);
        const left = el ? (parseFloat(el.style.left) || el.offsetLeft || 0) : ((Number(ev.pinX) || 0) - w / 2);
        const top = el ? (parseFloat(el.style.top) || el.offsetTop || 0) : (Number(ev.pinY) || 0);
        const card = el && el.querySelector('.tl-card');
        const h = Math.max((card && card.offsetHeight) || 0, (el && el.offsetHeight) || 0, tlCardH(ev) || 0, 86);
        const pin = left + w / 2;
        const side = (ev.side === 1 || ev.side === -1) ? ev.side : ((top + h / 2) >= TL_AXIS_Y ? 1 : -1);
        return { id: ev.id, side: side, pin: pin, left: left, right: left + w, top: top, bottom: top + h };
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
        const lo = Math.min(startY, endY);
        const hi = Math.max(startY, endY);
        const dest = boxes.find(function (b) { return b.id === selfId; });
        const hits = boxes.filter(function (b) {
            if (b.id === selfId) return false;
            if (pin < b.left - 1 || pin > b.right + 1) return false;
            return b.bottom > lo + 6 && b.top < hi - 6;
        });
        const merged = mergeTlBoxes(hits);
        const pad = 14;
        const pts = [{ x: pin, y: startY }];
        let lastAround = pin;
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
            lastAround = around;
            pts.push({ x: pin, y: enter });
            pts.push({ x: around, y: enter });
            pts.push({ x: around, y: leave });
            pts.push({ x: pin, y: leave });
        });
        if (lastAround !== pin && dest && Math.abs((pts[pts.length - 1] || {}).y - endY) < 28) {
            pts.pop();
            pts.push({ x: lastAround, y: endY });
            pts.push({ x: pin, y: endY });
            return pts;
        }
        pts.push({ x: pin, y: endY });
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
            parts.push('<line x1="' + pin + '" y1="' + (y - 22) + '" x2="' + pin + '" y2="' + (y + 22) + '" stroke="#fafafa" stroke-width="1.6"/>');
            if (box) {
                const axisY = box.side === 1 ? y + 22 : y - 22;
                const cardY = box.side === 1 ? box.top : box.bottom;
                const d = tlOrthoPath(tlStemPoints(pin, axisY, cardY, ev.id, boxes), 10);
                if (d) parts.push('<path d="' + d + '" fill="none" stroke="#a1a1aa" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>');
            }
            if (ev.date) {
                parts.push('<text x="' + pin + '" y="' + (y - 40) + '" text-anchor="middle" fill="#a1a1aa" font-size="11">' + esc(formatDayLabel(ev.date)) + '</text>');
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
                parts.push('<path d="' + d + '" fill="none" stroke="#73737a" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" marker-end="url(#tl-card-arrow)"/>');
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
                node.addEventListener('animationend', function () { node.classList.remove('is-spawn'); }, { once: true });
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
        const cam = timelineCam();
        const z = 1;
        const y = view ? Math.round(view.clientHeight / 2 - TL_AXIS_Y) : 40;
        cam.x = 48;
        cam.y = y;
        cam.z = z;
        applyTimelineCam();
        drawTimelineAxis();
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
        const lockBtn = document.querySelector('[data-board-lock]');
        if (lockBtn) lockBtn.classList.toggle('is-on', boardToolLock);
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
                    '<input type="url" data-wb-embed-url placeholder="Paste page URL">' +
                    '</div>';
            } else if (node.type === 'image' && node.src) {
                copy = '<img src="' + esc(node.src) + '" alt="">';
            } else if (node.type === 'image') {
                copy = '<div class="wb-image-slot">' +
                    '<button type="button" data-wb-upload>Upload</button>' +
                    '<input type="url" data-wb-image-url placeholder="Paste image URL">' +
                    '</div>';
            } else {
                const img = node.shape === 'document' && node.src ? '<img src="' + esc(node.src) + '" alt="">' : '';
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
            html += menuItem('data-board-ctx="link"', 'link', rec.href ? 'Edit link' : 'Add link', '<span class="board-kbd">Ctrl+K</span>');
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
                    boardTool = 'select';
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

    var TIMES_W = {
        32:250,33:333,34:408,35:500,36:500,37:833,38:778,39:333,40:333,41:333,42:500,43:564,44:250,45:333,46:250,47:278,
        48:500,49:500,50:500,51:500,52:500,53:500,54:500,55:500,56:500,57:500,58:278,59:278,60:564,61:564,62:564,63:444,
        64:921,65:722,66:667,67:667,68:722,69:611,70:556,71:722,72:722,73:333,74:389,75:722,76:611,77:889,78:722,79:722,
        80:556,81:722,82:667,83:556,84:611,85:722,86:722,87:944,88:722,89:722,90:611,91:333,92:278,93:333,94:469,95:500,
        96:333,97:444,98:500,99:444,100:500,101:444,102:333,103:500,104:500,105:278,106:278,107:500,108:278,109:778,110:500,111:500,
        112:500,113:500,114:333,115:389,116:278,117:500,118:500,119:722,120:500,121:500,122:444,123:480,124:200,125:480,126:541
    };

    function measurePdf(text, size) {
        var w = 0;
        var s = pdfClean(text);
        for (var i = 0; i < s.length; i++) {
            w += TIMES_W[s.charCodeAt(i)] || 500;
        }
        return w * size / 1000;
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
    var REPORT_HEAD_SIZE = 16;
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

    function noteSource(origin) {
        return '[' + origin + ']';
    }

    function reportFactLabel(item) {
        var base = NICE_LABEL[item.id] || item.label || 'Item';
        return item.platformLabel ? item.platformLabel + ' / ' + base : base;
    }

    function reportOrderedFacts() {
        var facts = filedFacts();
        var used = {};
        var out = [];
        function take(item) {
            if (item.id === 'notes') return;
            var value = prettyPdfValue(item.value);
            if (!value) return;
            out.push({ label: reportFactLabel(item), value: value });
            used[item.id + '\0' + item.value] = true;
        }
        FIELD_ORDER.forEach(function (id) {
            facts.forEach(function (item) {
                if (item.id === id && !used[item.id + '\0' + item.value]) take(item);
            });
        });
        facts.forEach(function (item) {
            if (!used[item.id + '\0' + item.value]) take(item);
        });
        return out;
    }

    function pushReportNote(notes, origin, text) {
        var t = prettyPdfValue(text);
        if (!t) return;
        notes.push({ label: noteSource(origin), text: t });
    }

    function reportNotes() {
        var notes = [];
        filedFacts().forEach(function (item) {
            if (item.id === 'notes' || /^notes?$/i.test(item.label || '')) {
                pushReportNote(notes, 'OrbINT', item.value);
            }
        });
        pushReportNote(notes, 'OrbINT', profile().analysis);
        numberedTimeline().forEach(function (ev) {
            var title = String(ev.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            function addTl(text) {
                var t = prettyPdfValue(text);
                if (!t) return;
                pushReportNote(notes, 'Timeline', title ? title + '. ' + t : t);
            }
            addTl(ev.body);
            (ev.moreNotes || []).forEach(function (note) {
                addTl(note && note.text);
            });
        });
        (data.evidence || []).forEach(function (item) {
            pushReportNote(notes, 'OrbINT', item && item.note);
        });
        ((data.whiteboard && data.whiteboard.nodes) || []).forEach(function (node) {
            if (!node || node.type !== 'note') return;
            var title = String(node.title || '').trim();
            if (SKIP_TITLES[title]) title = '';
            var body = String(node.body || '').trim();
            var bits = [];
            if (title) bits.push(title);
            if (body) bits.push(body);
            pushReportNote(notes, 'Whiteboard', bits.join('. '));
        });
        return notes;
    }

    function reportDocument() {
        return {
            subject: subjectName(),
            dateLong: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            notice: REPORT_NOTICE,
            close: REPORT_CLOSE,
            banner: REPORT_BANNER,
            rows: reportOrderedFacts(),
            notes: reportNotes(),
            photos: collectReportPhotos()
        };
    }

    function loadGreyPhoto(src) {
        return new Promise(function (resolve) {
            if (!src) { resolve(null); return; }
            function paint(img) {
                try {
                    var nw = img.naturalWidth || img.width || 1;
                    var nh = img.naturalHeight || img.height || 1;
                    var max = 360;
                    var scale = Math.min(1, max / Math.max(nw, nh));
                    var w = Math.max(1, Math.round(nw * scale));
                    var h = Math.max(1, Math.round(nh * scale));
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    ctx.filter = 'grayscale(100%) contrast(0.9) brightness(1.06)';
                    ctx.drawImage(img, 0, 0, w, h);
                    ctx.filter = 'none';
                    ctx.fillStyle = 'rgba(118,118,118,0.22)';
                    ctx.fillRect(0, 0, w, h);
                    canvas.toBlob(function (blob) {
                        if (!blob) { resolve(null); return; }
                        blob.arrayBuffer().then(function (buf) {
                            resolve({ bytes: new Uint8Array(buf), w: w, h: h });
                        }).catch(function () { resolve(null); });
                    }, 'image/jpeg', 0.7);
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
            return loadGreyPhoto(item.src).then(function (jpeg) {
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
        const BOTTOM = 64;
        const BODY = 11;
        const LEAD = 15.4;

        function newPage(kind) {
            if (kind === true) kind = 'cover';
            if (kind === false) kind = 'cont';
            var cover = kind === 'cover';
            var record = kind === 'record';
            var page = { ops: ['__PAGE_NO__'], y: cover ? 700 : 720, first: cover, kind: kind, images: [] };
            if (!cover && !record) {
                var run = pdfSafe(subject);
                if (run) {
                    var w = measurePdf(run, 9);
                    page.ops.push('0.35 0.35 0.35 rg BT /F3 9 Tf 0 Tc 0 Tw ' + ((612 - w) / 2).toFixed(2) + ' 748 Td (' + pdfEscape(run) + ') Tj ET');
                }
            }
            return page;
        }

        function ensure(page, need) {
            if (page.y - need < BOTTOM) {
                pages.push(page);
                return newPage(page.kind === 'cover' ? 'cover' : 'cont');
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
                var ops = [(opts.gray || '0.12 0.12 0.12') + ' rg BT 0 Tc 0 Tw ' + x.toFixed(2) + ' ' + page.y.toFixed(2) + ' Td'];
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
            page = ensure(page, 28);
            page.y -= 8;
            paint(page, '/F2', 12, LEFT, page.y, text, '0 0 0');
            page.y -= 18;
            return page;
        }

        function runIn(page, label, value) {
            var size = BODY;
            var rowLead = 17;
            var labelText = pdfSafe(label);
            var right = LEFT + WIDTH;
            var labelW = measurePdf(labelText, size);
            var maxVal = Math.max(90, WIDTH - labelW - 28);
            var lines = wrapPdf(value, maxVal, size);
            if (!lines.length) lines = [''];
            page = ensure(page, rowLead + 2);
            paint(page, '/F1', size, LEFT, page.y, labelText, '0.1 0.1 0.1');
            var v0w = measurePdf(lines[0] || '', size);
            var valueX = right - v0w;
            var dotsStart = LEFT + labelW + 4;
            var dotsEnd = valueX - 2;
            var dotW = measurePdf('.', size);
            var nDots = (dotW && dotsEnd > dotsStart) ? Math.max(0, Math.floor((dotsEnd - dotsStart) / dotW) + 1) : 0;
            if (nDots >= 2) paint(page, '/F1', size, dotsStart, page.y, Array(nDots + 1).join('.'), '0.55 0.55 0.55');
            paint(page, '/F1', size, valueX, page.y, lines[0] || '', '0.1 0.1 0.1');
            page.y -= rowLead;
            for (var i = 1; i < lines.length; i++) {
                page = ensure(page, rowLead);
                var lw = measurePdf(lines[i], size);
                paint(page, '/F1', size, right - lw, page.y, lines[i], '0.1 0.1 0.1');
                page.y -= rowLead;
            }
            page.y -= 3;
            return page;
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

        var portrait = (photos || []).find(function (item) { return item && item.jpeg && item.jpeg.bytes; }) || null;
        var morePhotos = (photos || []).filter(function (item) { return item && item.jpeg && item.jpeg.bytes && item !== portrait; });
        var rows = doc.rows;
        var notes = doc.notes;

        let pageObj = newPage('cover');
        pageObj = center(pageObj, REPORT_HEAD, REPORT_HEAD_SIZE, '/F2', 8, '0 0 0', 0);
        pageObj.y -= 28;
        doc.notice.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 11, lead: 16, after: i === doc.notice.length - 1 ? 14 : 11 });
        });
        wrapPdf(doc.banner, NARROW, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 4, '0 0 0', 0.4);
        });
        pages.push(pageObj);
        pageObj = newPage('record');
        wrapPdf(String(subject || 'UNKNOWN').toUpperCase(), NARROW, 16).forEach(function (ln) {
            pageObj = center(pageObj, ln, 16, '/F2', 6, '0 0 0', 0.7);
        });
        pageObj.y -= 6;
        if (portrait) pageObj = placePhoto(pageObj, portrait.jpeg, 168, 210);
        pageObj = center(pageObj, dateLong, 11, '/F3', 14, '0.2 0.2 0.2');
        pageObj = rule(pageObj);

        if (!rows.length && !notes.length && !portrait) {
            pageObj = flow(pageObj, 'No particulars have been recorded for this person.', { after: 8 });
        }
        rows.forEach(function (row) {
            pageObj = runIn(pageObj, row.label, row.value);
        });

        if (morePhotos.length) {
            pageObj.y -= 6;
            pageObj = heading(pageObj, 'Photographs');
            morePhotos.forEach(function (item) {
                pageObj = placePhoto(pageObj, item.jpeg, 220, 200);
                if (item.caption) {
                    pageObj = flow(pageObj, item.caption, { center: true, size: 9, font: '/F3', width: NARROW, after: 12, gray: '0.25 0.25 0.25' });
                }
            });
        } else if (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption)) {
            pageObj = runIn(pageObj, 'Photograph', portrait.caption);
        }

        if (notes.length) {
            pageObj.y -= 4;
            pageObj = heading(pageObj, 'Notes');
            notes.forEach(function (item) {
                pageObj = runIn(pageObj, item.label, item.text);
            });
        }

        pageObj.y -= 8;
        pageObj = rule(pageObj);
        doc.close.forEach(function (para, i) {
            pageObj = flowRich(pageObj, para, { size: 10.5, lead: 15.4, after: i === doc.close.length - 1 ? 12 : 10 });
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            pageObj = center(pageObj, ln, 9, '/F2', 4, '0 0 0', 0.4);
        });

        pages.push(pageObj);
        const pdf = buildPdf(pages);
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        var fileBase = String(subject || 'file').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
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
        var NARROW = 420;
        var MAX = 668;
        var subject = pdfSafe(doc.subject || 'UNKNOWN').toUpperCase();
        var photos = doc.photos || [];
        var portrait = photos[0] || null;
        var morePhotos = photos.slice(1);
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
            h = h || 20;
            if (!lockCover && used + h > MAX && cur.length) flush();
            cur.push(html);
            used += h;
        }

        function kv(label, value) {
            var lines = wrapPdf(value, 250, 11);
            if (!lines.length) lines = [''];
            var h = 20 + Math.max(0, lines.length - 1) * 17;
            var html = '<div class="ds-kv"><span class="ds-k">' + esc(label) + '</span><span class="ds-leader" aria-hidden="true"></span><span class="ds-v">' + esc(lines[0]) + '</span></div>';
            for (var i = 1; i < lines.length; i++) {
                html += '<div class="ds-kv is-cont"><span class="ds-v">' + esc(lines[i]) + '</span></div>';
            }
            add(html, h);
        }

        function photoFig(src, wide) {
            if (!src) return;
            add('<figure class="ds-fig' + (wide ? ' is-wide' : '') + '"><img src="' + esc(src) + '" alt=""></figure>', wide ? 214 : 224);
        }

        add('<div class="ds-c ds-banner">' + esc(REPORT_HEAD) + '</div>', 24);
        add('<div class="ds-after-head"></div>', 28);
        doc.notice.forEach(function (para, i) {
            var last = i === doc.notice.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 11).length * 16 + (last ? 14 : 11);
            add('<p class="ds-p' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, NARROW, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        lockCover = false;
        flush();
        wrapPdf(subject, NARROW, 16).forEach(function (ln) {
            add('<div class="ds-c ds-subject">' + esc(ln) + '</div>', 22);
        });
        add('<div class="ds-gap"></div>', 6);
        if (portrait && portrait.src) photoFig(portrait.src, false);
        add('<div class="ds-c ds-date">' + esc(doc.dateLong) + '</div>', 25);
        add('<hr class="ds-rule">', 16);

        if (!doc.rows.length && !doc.notes.length && !portrait) {
            add('<p class="ds-p">No particulars have been recorded for this person.</p>', 24);
        }
        doc.rows.forEach(function (row) { kv(row.label, row.value); });

        if (morePhotos.length) {
            add('<h3 class="ds-h">Photographs</h3>', 28);
            morePhotos.forEach(function (item) {
                photoFig(item.src, true);
                if (item.caption) {
                    wrapPdf(item.caption, NARROW, 9).forEach(function (ln) {
                        add('<div class="ds-cap">' + esc(ln) + '</div>', 13);
                    });
                }
            });
        } else if (portrait && portrait.caption && /^https?:\/\//i.test(portrait.caption)) {
            kv('Photograph', portrait.caption);
        }

        if (doc.notes.length) {
            add('<h3 class="ds-h">Notes</h3>', 28);
            doc.notes.forEach(function (item) { kv(item.label, item.text); });
        }

        add('<hr class="ds-rule">', 24);
        doc.close.forEach(function (para, i) {
            var last = i === doc.close.length - 1;
            var h = wrapPdf(para.replace(/\*\*/g, ''), WIDTH, 10.5).length * 15.4 + (last ? 12 : 10);
            add('<p class="ds-p is-close' + (last ? ' is-last' : '') + '">' + reportRichHtml(para) + '</p>', h);
        });
        wrapPdf(doc.banner, WIDTH, 9).forEach(function (ln) {
            add('<div class="ds-c ds-foot">' + esc(ln) + '</div>', 13);
        });
        flush();

        var inner = pages.map(function (page, i) {
            var kind = page.kind || (page.first ? 'cover' : 'cont');
            var head = kind === 'cont' ? '<div class="ds-runhead">' + esc(pdfSafe(doc.subject)) + '</div>' : '';
            var cls = kind === 'cover' ? ' is-first' : (kind === 'record' ? ' is-record' : '');
            return '<article class="ds-page' + cls + '">' + head + page.html + '<div class="ds-pageno">' + (i + 1) + '</div></article>';
        }).join('');
        return '<div class="ds-fit"><div class="ds-stage">' + inner + '</div></div>';
    }

    function sizeDatasheet() {
        var view = $('datasheetView');
        var fit = view && view.querySelector('.ds-fit');
        var stage = view && view.querySelector('.ds-stage');
        if (!view || !fit || !stage) return;
        var n = stage.querySelectorAll('.ds-page').length || 1;
        var gap = 28;
        var avail = Math.max(280, view.clientWidth - 48);
        var s = Math.min(1.22, Math.max(0.42, avail / 612));
        stage.style.setProperty('--ds-scale', String(s));
        fit.style.height = (n * 792 * s + (n - 1) * gap * s + 8) + 'px';
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
        objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>';
        objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>';
        objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>';
        pages.forEach(function (pageObj, idx) {
            var xobj = (pageObj.images || []).map(function (im) {
                return '/' + im.name + ' ' + im.objId + ' 0 R';
            }).join(' ');
            var res = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>' + (xobj ? ' /XObject << ' + xobj + ' >>' : '');
            var label = String(idx + 1);
            var numW = measurePdf(label, 9);
            var pageNo = '0.35 0.35 0.35 rg BT /F1 9 Tf 0 Tc 0 Tw ' + ((612 - numW) / 2).toFixed(2) + ' 46 Td (' + label + ') Tj ET';
            var streamBytes = latin1Pdf(pageObj.ops.join('\n').replace(/__PAGE_NO__/g, pageNo));
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
            if (event.target.closest('#timelineMenu, #timelineIsland, #timelineTips, #calPop, #timePop, #tlInfoPop')) return;
            hideTimelineMenu();
            if (event.target.closest('.board-bar, .work-ghost')) return;
            if (!event.target.closest('[data-tl-rs]')) {
                if (event.target.closest('button, input, textarea, [contenteditable="true"], .tl-attach, .tl-media, .tl-acts')) return;
            }
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
            if (event.target.closest('#timelineMenu, #timelineIsland, #timelineTips, .board-bar')) return;
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
        const calBtn = event.target.closest('[data-tl-cal], #eventDateBtn') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-cal], #eventDateBtn');
        if (calBtn) {
            event.preventDefault();
            openCalendar(calBtn);
            return;
        }
        const timeBtn = event.target.closest('[data-tl-time]') || tlHitFromPoint(event.clientX, event.clientY, '[data-tl-time]');
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
            setPage(pageBtn.getAttribute('data-page'));
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
        if (event.target.closest('#timelineTipsClose') || (event.target.closest('#timelineTipsBtn') && $('timelineTips') && $('timelineTips').classList.contains('is-open'))) {
            event.preventDefault();
            setTimelineTips(false);
            return;
        }
        if (event.target.closest('#timelineTipsBtn, #timelineTips')) {
            event.preventDefault();
            setTimelineTips(true);
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
            boardTool = tool.getAttribute('data-board-tool');
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
        if (event.target.closest('[data-board-lock]')) {
            boardToolLock = !boardToolLock;
            syncBoardTools();
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
            const cam = timelineCam();
            cam.z = Math.min(3.2, cam.z * 1.12);
            applyTimelineCam();
            schedulePersist();
            return;
        }
        if (event.target.id === 'timelineZoomOut') {
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
        if (event.key === 'Escape' && $('timelineTips') && $('timelineTips').classList.contains('is-open')) {
            event.preventDefault();
            setTimelineTips(false);
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
        if (meta && (key === 'k' || key === 'K') && boardSelected) {
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

    function init(api) {
        host = api || {};
        injectToolkit();
        window.addEventListener('orbint-toolkit-ready', injectToolkit);
        document.addEventListener('click', onClick);
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
        setTimelineTips(timelineTipsWanted());
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
        if (['orbit', 'timeline', 'whiteboard', 'datasheet'].indexOf(saved) < 0) saved = 'orbit';
        setPage(saved);
        renderAll();
        window.addEventListener('resize', function () {
            syncPageSwitchThumb(true);
            syncBoardToolThumb(true);
            if (calState) placeCalendar();
            if (timeState) placeTimePicker();
            if (infoState) placeTlInfoPop();
            if (page === 'datasheet') sizeDatasheet();
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
        return false;
    }

    window.OrbINTCase = {
        init: init,
        load: load,
        snapshot: snapshot,
        setPage: setPage,
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
        renderDatasheet: renderDatasheet,
        scheduleDatasheet: scheduleDatasheet
    };
})();
