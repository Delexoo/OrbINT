/* Case pages, playbooks, board constants, lookup tables */

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

