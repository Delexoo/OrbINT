/* How-to-find and deep links for each field */
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

