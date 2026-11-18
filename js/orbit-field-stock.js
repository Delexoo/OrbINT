/* Built-in orbit field list */
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

