        const GROUPS = [
            { id: 'identity', label: 'Identity', fields: ['name', 'username', 'image'] },
            { id: 'contact', label: 'Contact', fields: ['phone', 'email', 'password'] },
            { id: 'location', label: 'Location', fields: ['address', 'geo', 'ip', 'wifi'] },
            { id: 'entity', label: 'Entity', fields: ['company', 'domain', 'crypto'] },
            { id: 'evidence', label: 'Evidence', fields: ['audio', 'vin', 'plate', 'mac', 'record', 'barcode'] },
            { id: 'notes', label: 'Notes', fields: ['timezone', 'notes'] },
            { id: 'custom', label: 'Custom', fields: [] }
        ];

        function isPhone() {
            return window.matchMedia('(max-width: 820px)').matches;
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
            return '<img class="platform-logo" src="icons/platforms/' + platform.id + '.svg" alt="" width="18" height="18">';
        }

        function platformById(id) {
            return PLATFORMS.find((item) => item.id === id);
        }

        function usernameHandle(value) {
            return String(value || '').replace(/^@/, '').trim();
        }

        function isPlatformField(id) {
            const base = fieldBase(id);
            return base === 'username' || base === 'password';
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
                ['Have I Been Pwned', 'Check public breach exposure', 'https://haveibeenpwned.com/Passwords'],
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
                caution: 'Only file passwords that already appear in public sources. Do not use them to sign in.',
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
                id: 'audio',
                label: 'Audio',
                placeholder: 'URL or upload',
                file: 'audio/*',
                leads: (v) => [
                    ['Transcribe and search', 'Keywords, place names, announcements', 'https://www.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'wifi',
                label: 'Wi-Fi',
                placeholder: 'SSID',
                leads: (v) => [
                    ['Wigle', 'If the SSID was logged by wardrivers', 'https://wigle.net/search?ssid=' + encodeURIComponent(v)],
                    ['Owner hint', 'Family names or ISP defaults in the SSID', 'https://www.google.com/search?q=' + encodeURIComponent(v + ' wifi ssid')]
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
                caution: 'Plate-to-owner lookups are restricted in many places. Use only public photos, maps, and lawful records.',
                leads: (v) => [
                    ['Public web mentions', 'Photos, posts, or dashcam stills', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '" license plate')],
                    ['Image search', 'The plate appearing in public pictures', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v + ' license plate')]
                ]
            },
            {
                id: 'record',
                label: 'Record',
                placeholder: 'Case or document',
                leads: (v) => [
                    ['Court / docket search', 'Public case details and parties', 'https://www.google.com/search?q=' + encodeURIComponent(v + ' court records')],
                    ['News', 'Reporting around the filing', 'https://news.google.com/search?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'domain',
                label: 'Website',
                placeholder: 'example.com',
                leads: (v) => [
                    ['WHOIS', 'Registrant and history clues', 'https://whois.net/' + encodeURIComponent(v.replace(/^https?:\/\//, '').split('/')[0])],
                    ['crt.sh', 'Certificates and linked emails', 'https://crt.sh/?q=' + encodeURIComponent(v)],
                    ['Wayback', 'Historical site content', 'https://web.archive.org/web/*/' + encodeURIComponent(v)],
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
                id: 'mac',
                label: 'MAC',
                placeholder: 'AA:BB:CC:DD:EE:FF',
                caution: 'MAC addresses usually stay on the local network. Useful mainly when they already appear in a public leak or log.',
                leads: (v) => [
                    ['OUI / vendor', 'Manufacturer from the first 6 hex digits', 'https://www.google.com/search?q=' + encodeURIComponent(v.replace(/[:\-]/g, '').slice(0, 6) + ' OUI lookup')]
                ]
            },
            {
                id: 'barcode',
                label: 'Barcode',
                placeholder: 'UPC, QR, or URL',
                leads: (v) => [
                    ['Product lookup', 'UPC and catalog data', 'https://www.upcitemdb.com/upc/' + encodeURIComponent(v)],
                    ['Safe URL open', 'Only if this is a known-good link', /^https?:/i.test(v) ? v : 'https://www.google.com/search?q=' + encodeURIComponent(v)]
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
                label: 'Work',
                placeholder: 'Employer or workplace',
                leads: (v) => [
                    ['OpenCorporates', 'Company filings worldwide', 'https://opencorporates.com/companies?q=' + encodeURIComponent(v)],
                    ['SEC EDGAR', 'US issuer filings', 'https://www.sec.gov/cgi-bin/browse-edgar?company=' + encodeURIComponent(v) + '&action=getcompany'],
                    ['OpenSanctions', 'Watchlists and PEPs', 'https://www.opensanctions.org/search/?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'geo',
                label: 'Geo',
                placeholder: 'Place or lat, lng',
                leads: (v) => [
                    ['Google Maps', 'Street and satellite', 'https://www.google.com/maps/search/' + encodeURIComponent(v)],
                    ['OpenStreetMap', 'Map and nearby features', 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(v)],
                    ['Bing Maps', 'Alternate imagery', 'https://www.bing.com/maps?q=' + encodeURIComponent(v)]
                ]
            },
            {
                id: 'vin',
                label: 'VIN',
                placeholder: '17-character VIN',
                caution: 'VIN decode and recalls are public. Owner and registration lookups are restricted in many places.',
                leads: (v) => [
                    ['NHTSA decoder', 'Make, model, and plant', 'https://vpic.nhtsa.dot.gov/decoder/Decoder'],
                    ['NHTSA recalls', 'Public safety recalls', 'https://www.nhtsa.gov/recalls'],
                    ['Google', 'Public mentions of the VIN', 'https://www.google.com/search?q=' + encodeURIComponent('"' + v + '" VIN')]
                ]
            }
        ];

        const STOCK_IDS = new Set(FIELDS.map((field) => field.id));

        function gq(q) { return 'https://www.google.com/search?q=' + encodeURIComponent(q); }
        function bq(q) { return 'https://www.bing.com/search?q=' + encodeURIComponent(q); }
        function yq(q) { return 'https://yandex.com/search/?text=' + encodeURIComponent(q); }
        function dq(q) { return 'https://duckduckgo.com/?q=' + encodeURIComponent(q); }
        function quoted(v) { return '"' + String(v || '').trim() + '"'; }

        function engineSet(q) {
            return [
                ['Google', 'Exact and related public pages', gq(q)],
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
                ['WHOIS', 'Registration clues', 'https://who.is/'],
                ['Domain Dossier', 'WHOIS, DNS, and network', 'https://centralops.net/co/DomainDossier.aspx'],
                ['crt.sh', 'Certificate transparency', 'https://crt.sh/'],
                ['SecurityTrails', 'Historical DNS', 'https://securitytrails.com/'],
                ['ViewDNS', 'DNS and reverse records', 'https://viewdns.info/'],
                ['DNSdumpster', 'Host map', 'https://dnsdumpster.com/'],
                ['urlscan', 'Public URL scans', 'https://urlscan.io/'],
                ['BuiltWith', 'Tech stack', 'https://builtwith.com/']
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
                ['NHTSA recalls', 'Public safety recalls', 'https://www.nhtsa.gov/recalls'],
                ['Google', 'Quoted VIN in public pages', gq('"VIN"')]
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
                ['Google', 'Quoted plate in posts', gq(quoted(v) + ' license plate')],
                ['Google Images', 'Public photos', 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(v + ' license plate')],
                ['Yandex Images', 'Alternate photo index', 'https://yandex.com/images/search?text=' + encodeURIComponent(v + ' license plate')]
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
                    ['WHOIS', 'Registrant clues', 'https://who.is/whois/' + encodeURIComponent(host)],
                    ['Domain Dossier', 'WHOIS, DNS, network', 'https://centralops.net/co/DomainDossier.aspx?addr=' + encodeURIComponent(host) + '&dom_whois=true&dom_dns=true'],
                    ['crt.sh', 'Certs and emails', 'https://crt.sh/?q=' + encodeURIComponent(host)],
                    ['SecurityTrails', 'Historical DNS', 'https://securitytrails.com/domain/' + encodeURIComponent(host) + '/dns'],
                    ['ViewDNS', 'Records', 'https://viewdns.info/whois/?domain=' + encodeURIComponent(host)],
                    ['DNSdumpster', 'Host map', 'https://dnsdumpster.com/'],
                    ['urlscan', 'Public scans', 'https://urlscan.io/domain/' + encodeURIComponent(host)],
                    ['Wayback', 'Old site content', 'https://web.archive.org/web/*/' + encodeURIComponent(host)],
                    ['BuiltWith', 'Tech stack', 'https://builtwith.com/' + encodeURIComponent(host)],
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
                ['NHTSA recalls', 'Public safety recalls', 'https://www.nhtsa.gov/recalls'],
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
            { id: 'social', label: 'Social', placeholder: 'URL or handle', group: 'identity' },
            { id: 'alias', label: 'Alias', placeholder: 'Other name', group: 'identity' },
            { id: 'nickname', label: 'Nickname', placeholder: 'Handle or nickname', group: 'identity' },
            { id: 'maiden', label: 'Maiden name', placeholder: 'Previous surname', group: 'identity' },
            { id: 'middle', label: 'Middle name', placeholder: 'Middle name', group: 'identity' },
            { id: 'family', label: 'Family', placeholder: 'Relative or associate', group: 'identity' },
            { id: 'age', label: 'Age', placeholder: 'Age', group: 'identity' },
            { id: 'dob', label: 'Birthday', placeholder: 'Date of birth', group: 'identity' },
            { id: 'gender', label: 'Gender', placeholder: 'As publicly stated', group: 'identity' },
            { id: 'appearance', label: 'Appearance', placeholder: 'Build, hair, clothing', group: 'identity' },
            { id: 'school', label: 'School', placeholder: 'School or university', group: 'identity' },
            { id: 'degree', label: 'Degree', placeholder: 'Degree or certification', group: 'identity' },
            { id: 'military', label: 'Military', placeholder: 'Service or unit', group: 'identity' },
            { id: 'nationality', label: 'Nationality', placeholder: 'Citizenship or origin', group: 'identity' },
            { id: 'language', label: 'Language', placeholder: 'Spoken language', group: 'identity' },
            { id: 'passport', label: 'Passport', placeholder: 'Country or public mention', group: 'identity' },
            { id: 'occupation', label: 'Occupation', placeholder: 'Job title or trade', group: 'identity' },
            { id: 'bio', label: 'Bio', placeholder: 'Public bio text', group: 'identity' },
            { id: 'email2', label: 'Alt email', placeholder: 'Second email', group: 'contact' },
            { id: 'phone2', label: 'Alt phone', placeholder: 'Second number', group: 'contact' },
            { id: 'telegram', label: 'Telegram', placeholder: '@username or t.me', group: 'contact' },
            { id: 'discord', label: 'Discord', placeholder: 'user#0000 or handle', group: 'contact' },
            { id: 'skype', label: 'Skype', placeholder: 'Skype name', group: 'contact' },
            { id: 'signal', label: 'Signal', placeholder: 'Public mention', group: 'contact' },
            { id: 'fax', label: 'Fax', placeholder: 'Fax number', group: 'contact' },
            { id: 'pgp', label: 'PGP', placeholder: 'Key ID or fingerprint', group: 'contact' },
            { id: 'city', label: 'City', placeholder: 'City', group: 'location' },
            { id: 'country', label: 'Country', placeholder: 'Country', group: 'location' },
            { id: 'postal', label: 'Postal', placeholder: 'ZIP or postal code', group: 'location' },
            { id: 'region', label: 'Region', placeholder: 'State, province, county', group: 'location' },
            { id: 'neighborhood', label: 'Neighborhood', placeholder: 'Area or district', group: 'location' },
            { id: 'landmark', label: 'Landmark', placeholder: 'Place or building', group: 'location' },
            { id: 'hotel', label: 'Hotel', placeholder: 'Hotel or stay', group: 'location' },
            { id: 'airport', label: 'Airport', placeholder: 'IATA or name', group: 'location' },
            { id: 'w3w', label: 'What3words', placeholder: 'word.word.word', group: 'location' },
            { id: 'poi', label: 'POI', placeholder: 'Point of interest', group: 'location' },
            { id: 'title', label: 'Job title', placeholder: 'Role or title', group: 'entity' },
            { id: 'industry', label: 'Industry', placeholder: 'Sector', group: 'entity' },
            { id: 'ein', label: 'Company ID', placeholder: 'EIN, CRN, or filing no.', group: 'entity' },
            { id: 'trademark', label: 'Trademark', placeholder: 'Mark or serial', group: 'entity' },
            { id: 'callsign', label: 'Callsign', placeholder: 'Radio or ham call', group: 'entity' },
            { id: 'asn', label: 'ASN', placeholder: 'AS12345', group: 'entity' },
            { id: 'vessel', label: 'Vessel', placeholder: 'Name or IMO', group: 'entity' },
            { id: 'aircraft', label: 'Aircraft', placeholder: 'Tail number', group: 'entity' },
            { id: 'nonprofit', label: 'Nonprofit', placeholder: 'Org name', group: 'entity' },
            { id: 'brand', label: 'Brand', placeholder: 'Product or brand', group: 'entity' },
            { id: 'vehicle', label: 'Vehicle', placeholder: 'Make and model', group: 'evidence' },
            { id: 'color', label: 'Color', placeholder: 'Color or paint', group: 'evidence' },
            { id: 'document', label: 'Document', placeholder: 'Title or exhibit', group: 'evidence' },
            { id: 'hash', label: 'Hash', placeholder: 'MD5, SHA, or file hash', group: 'evidence' },
            { id: 'filename', label: 'Filename', placeholder: 'File name', group: 'evidence' },
            { id: 'video', label: 'Video', placeholder: 'URL or upload name', group: 'evidence' },
            { id: 'screenshot', label: 'Screenshot', placeholder: 'URL or note', group: 'evidence' },
            { id: 'imei', label: 'IMEI', placeholder: 'Device IMEI', group: 'evidence' },
            { id: 'uuid', label: 'UUID', placeholder: 'ID or GUID', group: 'evidence' },
            { id: 'useragent', label: 'User-agent', placeholder: 'Browser string', group: 'evidence' },
            { id: 'exif', label: 'EXIF', placeholder: 'Camera or GPS note', group: 'evidence' },
            { id: 'source', label: 'Source', placeholder: 'Where this came from', group: 'notes' },
            { id: 'quote', label: 'Quote', placeholder: 'Public statement', group: 'notes' },
            { id: 'event', label: 'Event', placeholder: 'Date or incident', group: 'notes' },
            { id: 'keyword', label: 'Keyword', placeholder: 'Search term', group: 'notes' },
            { id: 'hashtag', label: 'Hashtag', placeholder: '#tag', group: 'notes' },
            { id: 'mention', label: 'Mention', placeholder: '@account or name', group: 'notes' },
            { id: 'date', label: 'Date', placeholder: 'When', group: 'notes' },
            { id: 'status', label: 'Status', placeholder: 'Open, linked, dead end', group: 'notes' }
        ];
        const ADDED_KEY = 'osint-added-fields';

        function buildAddedField(spec) {
            const base = spec.cloneOf || spec.id;
            return {
                id: spec.id,
                label: spec.label,
                placeholder: spec.placeholder || 'Value',
                group: spec.group || 'custom',
                parent: spec.parent || '',
                cloneOf: spec.cloneOf || '',
                file: spec.file || '',
                custom: !!spec.custom,
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

        function saveAddedFields() {
            const specs = FIELDS.filter((field) => !STOCK_IDS.has(field.id)).map((field) => ({
                id: field.id,
                label: field.label,
                placeholder: field.placeholder,
                group: field.group || 'custom',
                parent: field.parent || '',
                cloneOf: field.cloneOf || '',
                file: field.file || '',
                custom: !!field.custom
            }));
            try { localStorage.setItem(ADDED_KEY, JSON.stringify(specs)); } catch (error) {}
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

        function fieldBase(id) {
            const field = fieldById(id);
            return (field && field.cloneOf) || id;
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
            const trigger = node.querySelector('.tz-trigger');
            const abbr = trigger && trigger.querySelector('.tz-abbr');
            if (!trigger || !abbr) return;
            const zone = resolveTimezoneValue((input && input.value) || firstValue(id));
            const nulled = !zone && isNullField(id);
            abbr.textContent = nulled ? 'Unknown' : ((timezoneMeta(zone) && timezoneMeta(zone).abbr) || 'Zone');
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
                const next = formatZoneTime(zone);
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
            return [['Google', 'Public search', gq(field ? field.label : '')]];
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
        }

        function applyHiddenFields() {
            document.querySelectorAll('.node').forEach((node) => {
                node.classList.toggle('off', hiddenFields.has(node.dataset.field));
            });
            if (!isPhone() && typeof positionNodes === 'function') positionNodes();
            updateHubProgress();
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
                fields: group.fields.slice()
            }));
            FIELDS.forEach((field) => {
                if (groups.some((group) => group.fields.indexOf(field.id) !== -1)) return;
                const gid = fieldGroupId(field);
                let group = groups.find((item) => item.id === gid);
                if (!group) group = groups.find((item) => item.id === 'custom');
                if (group) group.fields.push(field.id);
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
            if (input) {
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
                node.classList.toggle('platform-node', isPlatformField(node.dataset.field));
                node.classList.toggle('email-node', isEmailField(node.dataset.field));
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

        function duplicateField(sourceId) {
            const source = fieldById(sourceId);
            if (!source) return;
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
            renderProfile();
            updateHubProgress();
            focusOrbitField(id);
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
                return (preset.label + ' ' + (preset.placeholder || '') + ' ' + preset.id).toLowerCase().indexOf(q) !== -1;
            });
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
                return '<div class="add-group-label">' + escapeHtml(group.label) + '</div>' +
                    '<div class="add-chips">' +
                    items.map((preset) => (
                        '<button type="button" data-add-field="' + preset.id + '">' + escapeHtml(preset.label) + '</button>'
                    )).join('') +
                    '</div>';
            }).join('');
        }

        function showSheet(sheet) {
            if (!sheet) return;
            const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
            if (!sheet.classList.contains('is-in') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
            closeHelp();
            const sheet = document.getElementById('addSheet');
            const label = document.getElementById('addCustomLabel');
            const hint = document.getElementById('addCustomHint');
            const filter = document.getElementById('addPresetFilter');
            if (label) label.value = '';
            if (hint) hint.value = '';
            if (filter) filter.value = '';
            renderAddPanel();
            showSheet(sheet);
            if (filter) filter.focus();
        }

        function toggleAddField() {
            const sheet = document.getElementById('addSheet');
            if (!sheet) return;
            if (sheet.hidden) openAddField();
            else closeAddField();
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
                '<button type="button" class="field-danger" data-field-act="null">' + (isNullField(fieldId) ? 'Unmark null' : 'Null') + '</button>' +
                '<button type="button" data-field-act="clear" ' + (hasValue || isNullField(fieldId) ? '' : 'disabled') + '>Clear value</button>' +
                '<button type="button" data-field-act="hide">Remove field</button>' +
                (hiddenFields.size ? '<div class="field-sep"></div><button type="button" data-field-act="restore">Show hidden fields</button>' : '');
            menu.dataset.field = fieldId;
            menu.hidden = false;
            const mapRect = stage.getBoundingClientRect();
            const left = event.clientX - mapRect.left;
            const top = event.clientY - mapRect.top;
            menu.style.left = Math.max(8, Math.min(left, mapRect.width - menu.offsetWidth - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(top, mapRect.height - menu.offsetHeight - 8)) + 'px';
            armFieldMenuGuard();
        }

        function runFieldAction(act, fieldId) {
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
                    if (fieldBase(fieldId) === 'image' || fieldBase(fieldId) === 'audio' || fieldBase(fieldId) === 'ip') setFieldThumb(fieldId);
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
            if (act === 'help') openHelp();
            if (act === 'undo') undoCase();
            if (act === 'redo') redoCase();
            if (act === 'export') toggleExportMenu();
            if (act === 'share') openShare();
            if (act === 'reset') resetCase();
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
            const canUndo = history.past.length >= 2;
            const canRedo = !!history.future.length;
            menu.innerHTML =
                '<button type="button" data-field-act="help">Help</button>' +
                '<button type="button" data-field-act="recenter">Recenter</button>' +
                '<button type="button" data-field-act="undo" ' + (canUndo ? '' : 'disabled') + '>Undo</button>' +
                '<button type="button" data-field-act="redo" ' + (canRedo ? '' : 'disabled') + '>Redo</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" data-field-act="export">Export</button>' +
                '<button type="button" data-field-act="share">Share</button>' +
                '<div class="field-sep"></div>' +
                '<button type="button" class="field-danger" data-field-act="reset">Reset</button>';
            menu.dataset.field = '';
            menu.hidden = false;
            placeFieldMenu(event);
        }

        function openHubMenu(event) {
            const menu = document.getElementById('fieldMenu');
            const stage = document.getElementById('mapStage');
            if (!menu || !stage) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeExportMenu();
            menu.innerHTML =
                (hiddenFields.size
                    ? '<button type="button" data-field-act="restore">Show hidden fields</button>'
                    : '<button type="button" disabled>No hidden fields</button>') +
                '<button type="button" data-field-act="recenter">Recenter map</button>';
            menu.dataset.field = '';
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

        function openSearchMenu(fieldId) {
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const menu = document.getElementById('searchMenu');
            const field = fieldById(fieldId);
            if (!node || !menu || !field) return;
            closePlatformMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            const value = fieldInputValue(fieldId);
            const filled = !!value;
            const links = searchLinks(fieldId);
            menu.innerHTML =
                '<div class="search-menu-title">' + (filled ? 'Search deeper' : 'Find this') + ' · ' + escapeHtml(field.label) + '</div>' +
                (filled
                    ? '<div class="search-menu-note">' + (fieldId === 'image'
                        ? 'Searches the photo itself, not the file name.'
                        : 'Opens with this value filled in. Copied for sites that need a paste.') + '</div>'
                    : '<div class="search-menu-note">Public OSINT Framework sources for a ' + escapeHtml(field.label.toLowerCase()) + '.</div>') +
                (field.caution ? '<div class="search-menu-note">' + escapeHtml(field.caution) + '</div>' : '') +
                '<div class="search-list">' +
                links.map((item) => (
                    '<button class="search-option" type="button" data-open-lead="' + escapeHtml(item[2] || item[1]) + '" data-lead-mode="' + escapeHtml(item[3] || '') + '">' +
                    escapeHtml(item[0]) + '</button>'
                )).join('') +
                '</div>';
            menu.hidden = false;
            document.querySelectorAll('.node.search-open').forEach((item) => item.classList.remove('search-open'));
            node.classList.add('search-open');
            placeSearchMenu(node);
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

        function applySidebarWidth(px) {
            const max = Math.max(200, Math.min(560, (window.innerWidth || 1200) - 220));
            const raw = Math.round(Number(px));
            const width = Math.max(200, Math.min(max, Number.isFinite(raw) ? raw : 268));
            document.documentElement.style.setProperty('--sidebar', width + 'px');
            if (profilePanel) profilePanel.style.width = '';
            return width;
        }

        function initSidebarWidth() {
            try {
                const saved = Number(localStorage.getItem(SIDEBAR_KEY));
                if (saved) applySidebarWidth(saved);
            } catch (error) {}
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
                const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar')) || 268;
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
                        nulls: Array.isArray(saved.nulls) ? saved.nulls.filter(Boolean) : []
                    };
                }
            } catch (error) {}
            return { facts: emptyFacts(), analysis: '', nulls: [] };
        }

        profile = loadProfile();
        if (!profile.facts) profile.facts = emptyFacts();
        if (!Array.isArray(profile.nulls)) profile.nulls = [];

        const mediaStore = {};

        function saveProfile() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            } catch (error) {
                const slim = JSON.parse(JSON.stringify(profile));
                Object.keys(slim.facts || {}).forEach((id) => {
                    (slim.facts[id] || []).forEach((item) => {
                        if (item.media && String(item.media).length > 180000) delete item.media;
                    });
                });
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slim)); } catch (retry) {}
            }
        }

        const history = { past: [], future: [], applying: false, timer: 0 };

        function snapshotProfile() {
            return JSON.parse(JSON.stringify({
                analysis: profile.analysis || '',
                facts: profile.facts || emptyFacts(),
                nulls: Array.isArray(profile.nulls) ? profile.nulls : []
            }));
        }

        function snapshotsEqual(a, b) {
            return !!a && !!b && JSON.stringify(a) === JSON.stringify(b);
        }

        function updateHistoryButtons() {
            const undo = document.getElementById('dockUndo');
            const redo = document.getElementById('dockRedo');
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
            if (isPhone()) open = true;
            profilePanel.classList.toggle('open', open);
            backdrop.hidden = !open || !drawerQuery.matches || isPhone();
            backdrop.classList.toggle('visible', open && drawerQuery.matches && !isPhone());
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
                const node = document.querySelector('.node[data-field="' + fieldId + '"]');
                if (node && node.dataset.platform) extra.platform = node.dataset.platform;
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

        function writeLatestFact(id, value, extra) {
            const clean = String(value || '').trim();
            profile.facts[id] = profile.facts[id] || [];
            if (!clean) {
                if (!profile.facts[id].length) {
                    updateHubProgress();
                    return;
                }
                profile.facts[id].pop();
                saveProfile();
                renderProfile();
                updateHubProgress();
                recordHistory(false);
                return;
            }
            if (isNullField(id)) setFieldNull(id, false, true);
            let current = profile.facts[id][profile.facts[id].length - 1];
            if (!current) {
                current = { value: clean, addedAt: new Date().toISOString() };
                profile.facts[id].push(current);
            } else {
                current.value = clean;
            }
            if (extra) Object.keys(extra).forEach((key) => { current[key] = extra[key]; });
            saveProfile();
            renderProfile();
            recordHistory(false);
        }

        function saveInputAsIs(input) {
            if (!input || !input.id.startsWith('field-')) return;
            const fieldId = input.id.replace('field-', '');
            const value = fieldBase(fieldId) === 'timezone' ? resolveTimezoneValue(input.value) : input.value;
            writeLatestFact(fieldId, value, extrasFromInput(fieldId, value));
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
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    const keepAlpha = /image\/(png|webp|gif)/i.test(file.type || '');
                    const type = keepAlpha ? 'image/png' : 'image/jpeg';
                    img.onload = () => resolve({
                        preview: drawImageData(img, 64, true, 0.72, type),
                        media: drawImageData(img, keepAlpha ? 1100 : 1400, false, 0.84, type),
                        kind: 'image'
                    });
                    img.onerror = () => resolve({ preview: '', media: reader.result, kind: 'image' });
                    img.src = reader.result;
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
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
            const fact = latestFact(fieldId);
            const session = mediaStore[fieldId];
            if (fieldId === 'image' && looksLikeUrl(live)) return { src: live, kind: 'image', name: live };
            if (fieldId === 'audio' && looksLikeUrl(live)) return { src: live, kind: 'audio', name: live };
            if (session && session.src) return session;
            if (fact && fact.media) return { src: fact.media, kind: fact.kind || fieldId, name: fact.value };
            if (fieldId === 'image' && looksLikeImageSrc(live)) return { src: live, kind: 'image', name: live };
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
            if (fieldBase(fieldId) === 'ip') {
                const ipValue = (input && input.value.trim()) || firstValue(fieldId);
                if (looksLikeIp(ipValue)) {
                    thumb.hidden = false;
                    thumb.innerHTML = PIN_ICON;
                    node.classList.add('has-preview');
                } else {
                    thumb.hidden = true;
                    thumb.innerHTML = '';
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
                const safe = String(media.src).replace(/"/g, '');
                thumb.innerHTML = '<img alt="" src="' + safe + '">';
                const img = thumb.querySelector('img');
                if (img) {
                    img.onerror = function () {
                        thumb.innerHTML = IMAGE_ICON;
                    };
                }
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
                face.src = src;
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

        function closeMediaViewer() {
            const viewer = document.getElementById('mediaViewer');
            const audio = document.getElementById('mediaAudio');
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
            if (viewer) viewer.hidden = true;
        }

        function openMediaViewer(fieldId) {
            const media = mediaSource(fieldId);
            if (!media || !media.src) return;
            const viewer = document.getElementById('mediaViewer');
            const image = document.getElementById('mediaImage');
            const card = document.getElementById('mediaAudioCard');
            const audio = document.getElementById('mediaAudio');
            const name = document.getElementById('mediaAudioName');
            if (!viewer) return;
            closePlatformMenu();
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

        function populatedCount() {
            return FIELDS.filter((field) => (profile.facts[field.id] || []).length).length;
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
            return !!(profile.facts[field.id] || []).length;
        }

        function filledInputCount() {
            return visibleOrbitFields().filter(fieldHasInput).length;
        }

        function nullInputCount() {
            return visibleOrbitFields().filter((field) => !fieldHasInput(field) && isNullField(field.id)).length;
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
            const unknown = Math.round(red * 100);
            hub.setAttribute('aria-label', unknown
                ? known + '% known, ' + unknown + '% unknown'
                : known + '% complete');
        }

        function renderProfile() {
            const name = subjectDisplayName();
            document.getElementById('subjectName').textContent = name;
            document.getElementById('hubTitle').textContent = 'OrbINT';

            const filled = populatedCount();
            const completeness = document.getElementById('completenessFill');
            const coverageLabel = document.getElementById('coverageLabel');
            const caseTotal = groupsForProfile().reduce((count, group) => (
                count + group.fields.filter((id) => fieldById(id) && !hiddenFields.has(id)).length
            ), 0) || FIELDS.length;
            if (completeness) completeness.style.width = ((filled / caseTotal) * 100) + '%';
            if (coverageLabel) coverageLabel.textContent = filled + ' of ' + caseTotal + ' filed';

            const face = document.getElementById('targetFace');
            face.classList.add('visible');
            face.innerHTML = '<img alt="" src="' + portraitSrc() + '">';
            updateHubFace();

            const socials = collectProfileIcons();
            const socialsEl = document.getElementById('profileSocials');
            if (socialsEl) {
                socialsEl.innerHTML = socials.map((item) => {
                    const label = item.title;
                    const mark = item.mark;
                    return '<a class="profile-social" href="' + escapeHtml(item.href) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '" data-focus="' + escapeHtml(item.fieldId) + '">' + mark + '</a>';
                }).join('');
            }

            const bits = [];
            if (firstValue('company')) bits.push(firstValue('company'));
            if (firstValue('address')) bits.push(firstValue('address'));
            else if (firstValue('city')) bits.push(firstValue('city'));
            else if (firstValue('geo')) bits.push(firstValue('geo'));
            const idStack = document.getElementById('idStack');
            if (bits.length) {
                idStack.hidden = false;
                idStack.textContent = bits.join('  ·  ');
            } else if (name !== 'Anonymous' || socials.length) {
                idStack.hidden = true;
            } else {
                idStack.hidden = false;
                idStack.textContent = isPhone()
                    ? 'No public facts yet'
                    : 'Unidentified · File public facts to build this profile';
            }

            const factsSection = document.getElementById('factsSection');
            const factsList = document.getElementById('factsList');
            const filledGroups = groupsForProfile().map((group) => {
                const rows = group.fields.flatMap((id) => {
                    const field = fieldById(id);
                    if (!field) return [];
                    return ((profile.facts && profile.facts[id]) || []).filter((item) => item && String(item.value || '').trim()).filter((item) => !skipProfileRow(field, item)).map((item) => ({ field, item }));
                });
                return { group, rows };
            }).filter((entry) => entry.rows.length);

            factsSection.hidden = false;
            if (isPhone()) {
                factsList.className = 'phone-facts';
                const phoneGroups = groupsForProfile().map((group) => {
                    const rows = group.fields.map((id) => {
                        const field = fieldById(id);
                        if (!field || hiddenFields.has(id)) return '';
                        const items = ((profile.facts && profile.facts[id]) || []).filter((item) => item && String(item.value || '').trim());
                        if (items.length) return items.map((item) => phoneFactRowHtml(field, item)).join('');
                        return phoneFactRowHtml(field, null);
                    }).join('');
                    return rows
                        ? '<section class="phone-group"><h3 class="phone-group-title">' + escapeHtml(group.label) + '</h3><div class="phone-group-card">' + rows + '</div></section>'
                        : '';
                }).join('');
                factsList.innerHTML = phoneGroups || '<p class="empty-note empty-brief"><strong>Start a case</strong>Tap + to add a field, or tap Name, email, or phone below to file what you already have.</p>';
            } else if (filledGroups.length) {
                factsList.className = '';
                factsList.innerHTML = filledGroups.map(({ group, rows }) => (
                    '<div class="group"><div class="group-label">' + group.label + '</div>' +
                    rows.map(({ field, item }) => profileFactRowHtml(field, item)).join('') + '</div>'
                )).join('');
            } else if (name !== 'Anonymous' || socials.length || firstValue('image')) {
                factsList.innerHTML = '';
            } else {
                factsList.innerHTML = '<p class="empty-note empty-brief"><strong>Anonymous</strong>Placeholder information. Replace it with real public information using the diagram.</p>';
            }

            const analysisSection = document.getElementById('analysisSection');
            const analysisBox = document.getElementById('analysisBox');
            if (profile.analysis) {
                analysisSection.hidden = false;
                analysisBox.textContent = profile.analysis;
            } else {
                analysisSection.hidden = true;
                analysisBox.textContent = '';
            }
            renderLeads(activeField);
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
            return raw ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(raw) : '';
        }

        function shortenCrypto(value) {
            const raw = String(value || '').trim();
            if (raw.length > 16 && /^[0-9a-zA-Z]+$/.test(raw)) return raw.slice(0, 6) + '…' + raw.slice(-4);
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
            if (isPhone()) return false;
            const base = fieldBase(field.id);
            if (base === 'name' || base === 'image') return true;
            if (isSocialLikeField(field)) return true;
            if (isWebIconField(field) && siteHref(item && item.value)) return true;
            return false;
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
                    icons.push({ href, mark, title, fieldId: field.id, value: item.value });
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
            if (base === 'phone' || base === 'phone2' || base === 'fax') {
                return { text: value, href: phoneHref(value), title: value, wrap: false };
            }
            if (base === 'email' || base === 'email2') {
                return { text: value, href: value.indexOf('@') !== -1 ? 'mailto:' + value : '', title: value, wrap: false };
            }
            if (PROFILE_PLACE_FIELDS[base]) {
                return { text: value, href: mapsHref(value), title: value, wrap: false };
            }
            if (base === 'crypto') {
                return { text: shortenCrypto(value), href: cryptoHref(value), title: value, wrap: false };
            }
            if (base === 'ip') {
                return { text: value, href: 'https://ipinfo.io/' + encodeURIComponent(value), title: value, wrap: false };
            }
            if (base === 'audio' || base === 'video' || base === 'screenshot') {
                return { text: field.label, href: siteHref(value), title: value, wrap: false };
            }
            if (base === 'password') {
                const key = field.id + '|' + ((item && item.platform) || '') + '|' + value;
                const open = revealedPasswords.has(key);
                const dots = Array(Math.min(14, Math.max(6, value.length)) + 1).join('•');
                return {
                    text: open ? value : dots,
                    href: '',
                    title: open ? value : 'Hidden password',
                    wrap: false,
                    secret: true,
                    revealed: open,
                    key: key
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

        function profileFactRowHtml(field, item) {
            const shown = profileRowDisplay(field, item);
            const label = field.label;
            const inner = shown.href
                ? '<a href="' + escapeHtml(shown.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(shown.text) + '</a>'
                : escapeHtml(shown.text);
            const tzAttr = shown.zone ? ' data-profile-tz="' + escapeHtml(shown.zone) + '"' : '';
            const reveal = shown.secret
                ? '<button type="button" class="fact-reveal" data-reveal="' + encodeURIComponent(shown.key) + '" aria-label="' + (shown.revealed ? 'Hide password' : 'Show password') + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            const find = isPhone()
                ? '<button type="button" class="fact-find ready" data-search-field="' + field.id + '" aria-label="Search deeper" title="Search deeper">' + DEEP_ICON + '</button>'
                : '';
            return '<div class="fact-row' + (activeField === field.id ? ' active' : '') + (shown.wrap ? ' wrap' : '') + (shown.secret ? ' secret' : '') + '" data-focus="' + field.id + '">' +
                '<span>' + escapeHtml(label) + '</span>' +
                '<em title="' + escapeHtml(shown.title) + '"' + tzAttr + '>' + inner + '</em>' +
                find +
                reveal +
                '<button type="button" data-remove="' + field.id + '" data-value="' + encodeURIComponent(item.value) + '" aria-label="Remove">×</button></div>';
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
                ? '<button type="button" class="fact-reveal" data-reveal="' + encodeURIComponent(shown.key) + '" aria-label="' + (shown.revealed ? 'Hide password' : 'Show password') + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
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
            const upload = document.getElementById('phoneFieldUpload');
            const reveal = document.getElementById('phoneReveal');
            const fact = latestFact(phoneFieldId);
            const platformId = (fact && fact.platform) || (node && node.dataset.platform) || '';
            const platformField = isPlatformField(phoneFieldId);
            const tz = fieldBase(phoneFieldId) === 'timezone';
            const needsPlatform = platformField && !platformId;
            if (title && field) title.textContent = field.label;
            if (platBtn) {
                platBtn.hidden = !needsPlatform;
                platBtn.textContent = 'Choose platform';
            }
            if (tzBtn) {
                tzBtn.hidden = !tz;
                const abbr = node && node.querySelector('.tz-abbr');
                tzBtn.textContent = (abbr && abbr.textContent && abbr.textContent !== 'Zone') ? abbr.textContent : 'Choose timezone';
            }
            if (editor) {
                editor.hidden = tz || needsPlatform;
                if (input && document.activeElement !== editor) editor.value = input.value || '';
                editor.placeholder = field ? (field.placeholder || 'Value') : 'Value';
                editor.inputMode = fieldBase(phoneFieldId) === 'phone' ? 'tel' : 'text';
                const hideSecret = fieldBase(phoneFieldId) === 'password' && reveal && reveal.dataset.open !== '1';
                editor.type = hideSecret ? 'password' : 'text';
            }
            if (reveal) {
                const show = fieldBase(phoneFieldId) === 'password' && !needsPlatform;
                reveal.hidden = !show;
                const open = reveal.dataset.open === '1';
                reveal.innerHTML = open ? EYE_OFF_ICON : EYE_OPEN_ICON;
                reveal.setAttribute('aria-label', open ? 'Hide password' : 'Show password');
            }
            if (upload) upload.hidden = !(field && field.file);
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
            const links = searchLinks(fieldId);
            box.innerHTML =
                '<div class="phone-leads-title">' + (filled ? 'Search deeper' : 'How to find this') + '</div>' +
                '<p class="phone-leads-note">' +
                (filled
                    ? (fieldId === 'image' ? 'Searches the photo itself, not the file name.' : 'Opens with this value filled in. Copied for sites that need a paste.')
                    : 'Public sources where a ' + escapeHtml(field.label.toLowerCase()) + ' usually appears.') +
                (field.caution ? ' ' + escapeHtml(field.caution) : '') +
                '</p>' +
                links.map((item) => (
                    '<button type="button" data-open-lead="' + escapeHtml(item[2] || item[1]) + '" data-lead-mode="' + escapeHtml(item[3] || '') + '">' +
                    escapeHtml(item[0]) + '</button>'
                )).join('');
        }

        function openPhoneField(id) {
            phoneFieldId = id;
            activeField = id;
            const reveal = document.getElementById('phoneReveal');
            if (reveal) reveal.dataset.open = '';
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
            const trigger = node.querySelector('.platform-trigger');
            const input = document.getElementById('field-' + node.dataset.field);
            if (!trigger || !input) return;
            node.dataset.platform = platformId || '';
            setPlatformIcon(node, platformId);
            if (filled) {
                trigger.hidden = true;
                input.hidden = false;
            } else if (platformId) {
                const platform = platformById(platformId);
                trigger.hidden = true;
                input.hidden = false;
                input.placeholder = '@username';
                if (platform) input.setAttribute('aria-label', platform.label + ' username');
            } else {
                trigger.hidden = false;
                trigger.textContent = 'Choose platform';
                input.hidden = true;
            }
        }

        function closePlatformMenu() {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            menu.hidden = true;
            document.querySelectorAll('.node.menu-open:not(.tz-open)').forEach((node) => node.classList.remove('menu-open'));
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
            const node = document.querySelector('.node.menu-open');
            const stage = document.getElementById('mapStage');
            if (!menu || menu.hidden || !node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 252);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function openPlatformMenu(node) {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            closeSearchMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            menu.innerHTML = '<div class="platform-menu-title">Choose a platform</div>' +
                '<input class="platform-search" type="search" placeholder="Search platforms" spellcheck="false">' +
                '<div class="platform-list">' +
                PLATFORMS.map((item) => (
                    '<button class="platform-option" type="button" data-pick-platform="' + item.id + '" data-label="' + item.label.toLowerCase() + '">' +
                    platformMark(item) +
                    escapeHtml(item.label) + '</button>'
                )).join('') + '</div>';
            menu.hidden = false;
            node.classList.add('menu-open');
            placePlatformMenu();
            const search = menu.querySelector('.platform-search');
            if (search) {
                search.addEventListener('input', () => {
                    const q = search.value.trim().toLowerCase();
                    menu.querySelectorAll('.platform-option').forEach((option) => {
                        option.classList.toggle('hidden', q && option.dataset.label.indexOf(q) === -1);
                    });
                });
                search.focus();
            }
        }

        function createNodes() {
            if (!mapCanvas) return;
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (id === 'url' || (id && id.indexOf('url-') === 0)) node.remove();
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
                            '<button class="tz-trigger empty" type="button" aria-label="Timezone" aria-haspopup="listbox"><span class="tz-abbr">Zone</span></button>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="tz-clock" data-tz-clock="' + field.id + '" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (isPlatformField(field.id)) {
                    node.classList.add('platform-node');
                    node.innerHTML =
                        '<span class="platform-icon" hidden></span>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="platform-trigger" type="button">Choose platform</button>' +
                            '<input id="field-' + field.id + '" type="text" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" spellcheck="false" autocomplete="off" hidden>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else {
                    const email = isEmailField(field.id);
                    if (email) node.classList.add('email-node');
                    node.innerHTML =
                        (email ? '<span class="platform-icon" hidden></span>' : '') +
                        ((base === 'image' || base === 'audio' || base === 'ip')
                            ? '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="Open ' + field.label + '"></button>'
                            : '') +
                        '<div class="node-copy">' +
                            '<label for="field-' + field.id + '">' + escapeHtml(field.label) + '</label>' +
                            '<input id="field-' + field.id + '" type="text" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder) + '" spellcheck="false" autocomplete="off">' +
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
            if (input) input.placeholder = nulled ? 'Unknown' : (input.dataset.ph || '');
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
                const fact = latestFact(field.id);
                if (input && document.activeElement !== input) {
                    const next = fact ? (fieldBase(field.id) === 'phone' ? formatPhoneNumber(fact.value) : fact.value) : '';
                    input.value = fieldBase(field.id) === 'timezone' ? resolveTimezoneValue(next) : next;
                }
                const filled = syncNodeFilled(input);
                node.classList.toggle('active', activeField === field.id);

                if (fieldBase(field.id) === 'username') {
                    const platformId = (fact && fact.platform) || node.dataset.platform || '';
                    setUsernameStep(node, platformId, filled);
                    return;
                }

                if (fieldBase(field.id) === 'timezone') {
                    syncTimezoneTrigger(node);
                    updateTimezoneClocks();
                }

                if (fieldBase(field.id) === 'image' || fieldBase(field.id) === 'audio' || fieldBase(field.id) === 'ip') {
                    setFieldThumb(field.id);
                }
            });
            positionNodes();
        }

        const mapStage = document.getElementById('mapStage');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
            dragging: false,
            dragMode: null,
            dragStartX: 0,
            dragStartY: 0,
            dragOriginX: 0,
            dragOriginY: 0,
            hubPx: null,
            hubPy: null,
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
            snapLayout: true
        };
        const LAYOUT_KEY = 'osint-orbit-layout-v1';
        const nodeHomes = new Map();
        let orbitItems = [];
        let cachedLayout = null;
        let saveLayoutTimer = 0;

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
                    zoom: orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom,
                    homes: Array.from(nodeHomes.entries()),
                    items: items
                }));
            } catch (error) {}
        }

        function scheduleSaveLayout() {
            clearTimeout(saveLayoutTimer);
            saveLayoutTimer = setTimeout(saveOrbitLayout, 160);
        }

        cachedLayout = loadSavedLayout();
        if (cachedLayout) {
            if (Number.isFinite(cachedLayout.dragX)) orbit.dragX = cachedLayout.dragX;
            if (Number.isFinite(cachedLayout.dragY)) orbit.dragY = cachedLayout.dragY;
            if (Number.isFinite(cachedLayout.zoom) && cachedLayout.zoom > 0) {
                orbit.zoom = cachedLayout.zoom;
                orbit.targetZoom = cachedLayout.zoom;
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

        function nodeScreenLimits(item, width, height) {
            const pad = 14;
            const halfW = Math.max((item.sw || item.w || 0) / 2, 8);
            const halfH = Math.max((item.sh || item.h || 0) / 2, 8);
            const minX = pad + halfW;
            const maxX = width - pad - halfW;
            const minY = pad + halfH;
            const maxY = height - pad - halfH;
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
            const w = (hub && hub.offsetWidth || 96) * zoom;
            const h = (hub && hub.offsetHeight || 96) * zoom;
            const x = width / 2 + orbit.dragX + orbit.parallaxX;
            const y = height / 2 + orbit.dragY + orbit.parallaxY;
            return { x: x, y: y, tx: x, ty: y, sw: w, sh: h, w: w, h: h };
        }

        function keepHubOnScreen(width, height) {
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
            }
            return box;
        }

        function shortestAngle(from, to) {
            let delta = to - from;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            return delta;
        }

        function canvasSize() {
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
            const pad = 16;
            const hubClear = hub ? Math.max(hub.offsetWidth, hub.offsetHeight) / 2 + 12 : 60;

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
            const maxRx = Math.max(80, width / 2 - pad - maxNodeW / 2);
            const maxRy = Math.max(80, height / 2 - pad - maxNodeH / 2);
            const hubMinX = hubClear + maxNodeW / 2 + 4;
            const hubMinY = hubClear + maxNodeH / 2 + 4;

            function fieldOrder(id) {
                const at = FIELDS.findIndex((field) => field.id === id);
                return at < 0 ? 999 : at;
            }

            const nameItem = roots.find((item) => item.node.dataset.field === 'name');
            const others = roots.filter((item) => item.node.dataset.field !== 'name').sort((a, b) => {
                return fieldOrder(a.node.dataset.field) - fieldOrder(b.node.dataset.field);
            });
            const ordered = nameItem ? [nameItem].concat(others) : others;
            const count = Math.max(ordered.length, 1);
            const step = (Math.PI * 2) / count;
            const inner = [];
            const outer = [];
            ordered.forEach((item, index) => {
                if (item.node.dataset.field === 'name' || index % 2 === 0) inner.push(item);
                else outer.push(item);
            });

            function placeRing(ring, rx, ry, offset) {
                const ringStep = (Math.PI * 2) / Math.max(ring.length, 1);
                ring.forEach((item, index) => {
                    item.angle = -Math.PI / 2 + ringStep * index + offset;
                    item.rx = rx;
                    item.ry = ry;
                });
            }

            const boxGap = 22;
            function radiusForRing(n, maxR, minR) {
                if (n <= 1) return Math.max(minR, 84);
                const need = Math.max(maxNodeW, maxNodeH) + boxGap;
                return Math.min(maxR, Math.max(minR, need / (2 * Math.sin(Math.PI / n))));
            }
            const ringSep = Math.max(maxNodeH + 20, 52);
            const pull = 0.88;
            const innerFit = radiusForRing(inner.length, Math.min(maxRx, maxRy), Math.max(hubMinX, hubMinY)) * pull;
            const innerRx = Math.min(maxRx, Math.max(hubMinX, innerFit));
            const innerRy = Math.min(maxRy, Math.max(hubMinY, innerFit * 0.9));
            const outerFit = radiusForRing(outer.length, Math.min(maxRx, maxRy), innerFit + ringSep) * pull;
            const outerRx = Math.min(maxRx, Math.max(innerRx + ringSep, outerFit));
            const outerRy = Math.min(maxRy, Math.max(innerRy + ringSep, outerFit * 0.9));

            placeRing(inner, innerRx, innerRy, 0);
            placeRing(outer, outerRx, outerRy, outer.length ? Math.PI / outer.length : 0);
            if (nameItem) nameItem.angle = -Math.PI / 2;

            function project(item) {
                item.x = cx + Math.cos(item.angle) * item.rx;
                item.y = cy + Math.sin(item.angle) * item.ry;
            }

            function radialExtent(item, angle) {
                const a = angle == null ? item.angle : angle;
                return (item.w / 2) * Math.abs(Math.cos(a)) + (item.h / 2) * Math.abs(Math.sin(a));
            }

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
                    const extra = radialExtent(parent) + Math.max.apply(null, list.map((child) => radialExtent(child, parent.angle))) + 18;
                    const midR = Math.max(parent.rx + extra, 90);
                    const angNeed = Math.atan2((Math.max.apply(null, list.map((child) => child.w)) + 16) / 2, midR) * 2;
                    const fan = list.length > 1 ? Math.min(1.15, angNeed * (list.length - 1)) : 0;
                    list.forEach((child, i) => {
                        const t = list.length === 1 ? 0.5 : i / (list.length - 1);
                        child.angle = parent.angle + (t - 0.5) * fan;
                        child.rx = Math.min(maxRx, parent.rx + extra);
                        child.ry = Math.min(maxRy, parent.ry + extra);
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
                            child.ry = Math.min(maxRy, child.ry + 10);
                            if (parent) {
                                const away = shortestAngle(other.angle, child.angle) >= 0 ? 0.05 : -0.05;
                                child.angle += away;
                                const drift = shortestAngle(parent.angle, child.angle);
                                if (Math.abs(drift) > 0.85) child.angle = parent.angle + Math.sign(drift || 1) * 0.85;
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
                add(document.querySelector('.map-toggle'), 16);
                return boxes;
            }

            function clampToCanvas(item) {
                const halfW = item.w / 2;
                const halfH = item.h / 2;
                const minX = pad + halfW;
                const maxX = width - pad - halfW;
                const minY = pad + halfH;
                const maxY = height - pad - halfH;
                if (item.x >= minX && item.x <= maxX && item.y >= minY && item.y <= maxY) return false;
                const dx = item.x - cx;
                const dy = item.y - cy;
                const scaleX = dx === 0 ? 1 : ((dx > 0 ? maxX - cx : cx - minX) / Math.abs(dx));
                const scaleY = dy === 0 ? 1 : ((dy > 0 ? maxY - cy : cy - minY) / Math.abs(dy));
                item.rx *= Math.min(1, scaleX, scaleY);
                item.ry *= Math.min(1, scaleX, scaleY);
                project(item);
                return true;
            }

            const chrome = chromeBoxes();
            const outerSet = new Set(outer);

            for (let iter = 0; iter < 40; iter++) {
                let hits = 0;
                items.forEach((item) => {
                    if (clampToCanvas(item)) hits++;
                    chrome.forEach((box) => {
                        if (!boxesOverlap(item, box, 10)) return;
                        hits++;
                        item.rx = Math.max(hubMinX, item.rx * 0.94);
                        item.ry = Math.max(hubMinY, item.ry * 0.94);
                        project(item);
                    });
                    const dist = Math.hypot(item.x - cx, item.y - cy);
                    const need = hubClear + Math.max(item.w, item.h) / 2;
                    if (dist < need) {
                        hits++;
                        const scale = need / Math.max(dist, 1);
                        item.rx = Math.min(maxRx, item.rx * scale);
                        item.ry = Math.min(maxRy, item.ry * scale);
                        project(item);
                    }
                });
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const a = items[i];
                        const b = items[j];
                        if (!boxesOverlap(a, b, 10)) continue;
                        hits++;
                        const aName = a.node.dataset.field === 'name';
                        const bName = b.node.dataset.field === 'name';
                        let move = aName ? b : bName ? a : (outerSet.has(a) === outerSet.has(b) ? (a.parentId ? a : b) : (outerSet.has(a) ? a : b));
                        const other = move === a ? b : a;
                        const parent = move.parentId && items.find((item) => item.node.dataset.field === move.parentId);
                        move.rx = Math.min(maxRx, move.rx + 8);
                        move.ry = Math.min(maxRy, move.ry + 6);
                        move.angle += shortestAngle(other.angle, move.angle) >= 0 ? 0.04 : -0.04;
                        if (aName) a.angle = -Math.PI / 2;
                        if (bName) b.angle = -Math.PI / 2;
                        if (parent) {
                            const drift = shortestAngle(parent.angle, move.angle);
                            if (Math.abs(drift) > 0.85) move.angle = parent.angle + Math.sign(drift || 1) * 0.85;
                        }
                        project(move);
                        if (aName) project(a);
                        if (bName) project(b);
                    }
                }
                if (!hits) break;
            }

            if (linkLayer) {
                linkLayer.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                linkLayer.innerHTML = '';
            }
            const prev = new Map(orbitItems.map((item) => [item.node, item]));
            orbitItems = items.map((item) => {
                const old = prev.get(item.node);
                const parentOld = item.parentId && Array.from(prev.values()).find((other) => other.node.dataset.field === item.parentId);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('stroke', item.node.classList.contains('filled') ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.06)');
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
                    vy: old && !orbit.snapLayout ? old.vy : 0
                };
            });

            applyOrbit(orbit.snapLayout ? 1000 : 16);
            if (orbit.snapLayout && mapCanvas) mapCanvas.classList.add('orbit-ready');
            scheduleSaveLayout();
        }

        const mapGrid = document.getElementById('mapGrid');

        function follow(current, target, dt, ms) {
            if (current == null || !Number.isFinite(current)) return target;
            if (target == null || !Number.isFinite(target)) return current;
            const tau = Math.max(ms, 1);
            return current + (target - current) * (1 - Math.exp(-dt / tau));
        }

        function applyMapGrid() {
            if (!mapGrid) return;
            mapGrid.style.setProperty('--grid-x', orbit.gridShiftX + 'px');
            mapGrid.style.setProperty('--grid-y', orbit.gridShiftY + 'px');
            mapGrid.style.setProperty('--grid-z', String(orbit.zoom));
        }

        function setGridSpot() {}

        function applyOrbit(dt) {
            applyMapGrid();
            const size = canvasSize();
            const width = size.width;
            const height = size.height;
            if (!width || !height || !orbitItems.length) return;

            if (!orbit.zoomBusy || orbit.dragging) keepHubOnScreen(width, height);

            const zoom = orbit.zoom;
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

            if (hub) {
                hub.style.left = cx + 'px';
                hub.style.top = cy + 'px';
                hub.style.transform = 'translate(-50%, -50%) translateZ(0) scale(' + zoom + ')';
            }

            const nodeGrab = orbit.dragging && orbit.dragMode === 'node' ? orbit.dragItem : null;
            const byId = new Map(orbitItems.map((item) => [item.node.dataset.field, item]));

            function isAncestor(maybeAncestor, item) {
                if (!maybeAncestor || !item) return false;
                const root = maybeAncestor.node.dataset.field;
                let cur = item;
                const seen = new Set();
                while (cur && cur.parentId && !seen.has(cur.node.dataset.field)) {
                    seen.add(cur.node.dataset.field);
                    if (cur.parentId === root) return true;
                    cur = byId.get(cur.parentId);
                }
                return false;
            }

            const settle = reduceMotion || orbit.snapLayout ? 1 : 1 - Math.exp(-(dt || 16) / 360);
            orbitItems.forEach((item) => {
                if (item !== nodeGrab) {
                    item.angle += shortestAngle(item.angle, item.tAngle == null ? item.angle : item.tAngle) * settle;
                    item.rx += ((item.tRx == null ? item.rx : item.tRx) - item.rx) * settle;
                    item.ry += ((item.tRy == null ? item.ry : item.tRy) - item.ry) * settle;
                }
                const angle = item.angle + orbit.spin;
                item.tx = cx + Math.cos(angle) * item.rx * zoom;
                item.ty = cy + Math.sin(angle) * item.ry * zoom;
                item.sw = item.w * zoom;
                item.sh = item.h * zoom;
            });

            const step = Math.min(Math.max(dt || 16, 8), 32) / 16.67;
            const livePhysics = !reduceMotion && !orbit.snapLayout && (nodeGrab || orbitItems.some((item) => {
                return Math.hypot(item.vx || 0, item.vy || 0) > 0.12 || Math.hypot((item.x || 0) - item.tx, (item.y || 0) - item.ty) > 0.7;
            }));

            if (nodeGrab) {
                const parent = nodeGrab.parentId ? byId.get(nodeGrab.parentId) : null;
                const px = parent ? parent.x : cx;
                const py = parent ? parent.y : cy;
                const ptx = parent ? parent.tx : cx;
                const pty = parent ? parent.ty : cy;
                const rest = Math.max(Math.hypot(nodeGrab.tx - ptx, nodeGrab.ty - pty), 10);
                const dx = orbit.grabX - px;
                const dy = orbit.grabY - py;
                const cur = Math.hypot(dx, dy);
                if (cur > rest) {
                    const extra = cur - rest;
                    const pull = extra * extra / (extra + 180);
                    nodeGrab.x = orbit.grabX - (dx / cur) * pull * 0.42;
                    nodeGrab.y = orbit.grabY - (dy / cur) * pull * 0.42;
                } else {
                    nodeGrab.x = orbit.grabX;
                    nodeGrab.y = orbit.grabY;
                }
                nodeGrab.vx = 0;
                nodeGrab.vy = 0;
            }

            if (!livePhysics) {
                orbitItems.forEach((item) => {
                    if (item === nodeGrab) return;
                    item.x = item.tx;
                    item.y = item.ty;
                    item.vx = 0;
                    item.vy = 0;
                });
            } else {
                orbitItems.forEach((item) => {
                    if (item === nodeGrab) return;
                    const linked = nodeGrab && (isAncestor(nodeGrab, item) || isAncestor(item, nodeGrab));
                    const kHome = linked ? 0.05 : 0.36;
                    item.vx = (item.vx || 0) + (item.tx - item.x) * kHome * step;
                    item.vy = (item.vy || 0) + (item.ty - item.y) * kHome * step;
                });
                orbitItems.forEach((item) => {
                    const parent = item.parentId ? byId.get(item.parentId) : null;
                    const px = parent ? parent.x : cx;
                    const py = parent ? parent.y : cy;
                    const ptx = parent ? parent.tx : cx;
                    const pty = parent ? parent.ty : cy;
                    const rest = Math.max(Math.hypot(item.tx - ptx, item.ty - pty), 8);
                    const dx = item.x - px;
                    const dy = item.y - py;
                    const cur = Math.hypot(dx, dy);
                    if (cur < 0.001) return;
                    const stretch = cur - rest;
                    if (Math.abs(stretch) < 0.5) return;
                    const nx = dx / cur;
                    const ny = dy / cur;
                    const kLink = parent ? 0.2 : 0.12;
                    if (item !== nodeGrab) {
                        item.vx -= nx * stretch * kLink * step;
                        item.vy -= ny * stretch * kLink * step;
                    }
                    if (parent && parent !== nodeGrab) {
                        parent.vx = (parent.vx || 0) + nx * stretch * kLink * 0.7 * step;
                        parent.vy = (parent.vy || 0) + ny * stretch * kLink * 0.7 * step;
                    }
                });
                orbitItems.forEach((item) => {
                    if (item === nodeGrab) return;
                    item.vx *= Math.pow(0.8, step);
                    item.vy *= Math.pow(0.8, step);
                    item.x += item.vx * step;
                    item.y += item.vy * step;
                    if (!nodeGrab && Math.hypot(item.x - item.tx, item.y - item.ty) < 0.45 && Math.hypot(item.vx, item.vy) < 0.2) {
                        item.x = item.tx;
                        item.y = item.ty;
                        item.vx = 0;
                        item.vy = 0;
                    }
                });
            }

            orbitItems.forEach((item) => {
                item.node.style.left = '0px';
                item.node.style.top = '0px';
                item.node.style.transform = 'translate3d(' + (item.x - item.w / 2) + 'px,' + (item.y - item.h / 2) + 'px,0) scale(' + zoom + ')';
            });
            orbitItems.forEach((item) => {
                const parent = item.parentId && byId.get(item.parentId);
                const x1 = parent ? parent.x : cx;
                const y1 = parent ? parent.y : cy;
                const rest = Math.max(Math.hypot(item.tx - (parent ? parent.tx : cx), item.ty - (parent ? parent.ty : cy)), 8);
                const stretch = Math.hypot(item.x - x1, item.y - y1) / rest;
                item.line.setAttribute('x1', x1);
                item.line.setAttribute('y1', y1);
                item.line.setAttribute('x2', item.x);
                item.line.setAttribute('y2', item.y);
                item.line.setAttribute('stroke-linecap', 'round');
                if (parent) {
                    item.line.setAttribute('stroke', item.node.classList.contains('filled') ? 'rgba(74,222,128,0.5)' : 'rgba(228,228,231,0.32)');
                    item.line.setAttribute('stroke-width', stretch > 1.08 ? '2' : '1.5');
                } else {
                    item.line.setAttribute('stroke', item.node.classList.contains('filled') ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.06)');
                    item.line.setAttribute('stroke-width', stretch > 1.12 ? '1.35' : '1');
                }
            });
            placePlatformMenu();
            placeTimezoneMenu();
            const searchNode = document.querySelector('.node.search-open');
            if (searchNode) placeSearchMenu(searchNode);
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
            closeAddField();
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
            drawShareQr(url);
            showSheet(sheet);
            document.getElementById('dock').classList.add('picking-share');
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
                    text: 'Public-source OSINT case file',
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
            closeAddField();
            showSheet(document.getElementById('helpGuide'));
        }

        function toggleExportMenu() {
            const menu = document.getElementById('exportMenu');
            if (!menu) return;
            const open = menu.hidden;
            closeSearchMenu();
            closePlatformMenu();
            closeFieldMenu();
            closeShare();
            closeAddField();
            menu.hidden = !open;
            document.getElementById('dock').classList.toggle('picking-export', open);
        }

        function exportCase(format) {
            closeExportMenu();
            if (format === 'txt') downloadBlob(caseFileName('txt'), 'text/plain', casePlainText());
            else if (format === 'md') downloadBlob(caseFileName('md'), 'text/markdown', caseText());
            else if (format === 'json') downloadBlob(caseFileName('json'), 'application/json', JSON.stringify(profile, null, 2));
            else if (format === 'html') downloadBlob(caseFileName('html'), 'text/html', caseHtml());
        }

        function closeResetConfirm() {
            hideSheet(document.getElementById('resetConfirm'));
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
            const reloadFresh = function () {
                location.replace(location.origin + location.pathname);
            };
            if (window.caches && caches.keys) {
                caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(function () {}).then(reloadFresh);
                return;
            }
            reloadFresh();
        }

        function recenterOrbit() {
            orbit.dragX = 0;
            orbit.dragY = 0;
            orbit.zoom = 1;
            orbit.targetZoom = 1;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            orbit.zoomBusy = false;
            orbit.parallaxX = 0;
            orbit.parallaxY = 0;
            orbit.targetParallaxX = 0;
            orbit.targetParallaxY = 0;
            orbit.gridShiftX = 0;
            orbit.gridShiftY = 0;
        }

        try { createNodes(); applyStoredFieldLabels(); applyHiddenFields(); } catch (error) { console.error(error); }
        try { document.body.classList.toggle('phone', isPhone()); if (isPhone()) setPanelOpen(true); } catch (error) {}
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
            const tzTrigger = event.target.closest('.tz-trigger');
            if (tzTrigger) {
                event.preventDefault();
                event.stopPropagation();
                const node = tzTrigger.closest('.node');
                const menu = document.getElementById('tzMenu');
                if (menu && !menu.hidden && node && node.classList.contains('tz-open')) closeTimezoneMenu();
                else openTimezoneMenu(node);
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
                const input = fieldId && document.getElementById('field-' + fieldId);
                if (node && isPlatformField(fieldId) && !latestFact(fieldId) && !(input && input.value.trim())) {
                    setUsernameStep(node, '', false);
                    openPlatformMenu(node);
                }
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
            if (fieldBase(fieldId) === 'image' || fieldBase(fieldId) === 'audio' || fieldBase(fieldId) === 'ip') {
                setFieldThumb(fieldId);
            }
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
            if (event.target.closest('a')) return;
            const find = event.target.closest('[data-search-field]');
            if (find) {
                event.preventDefault();
                event.stopPropagation();
                openSearchMenu(find.dataset.searchField);
                return;
            }
            const reveal = event.target.closest('[data-reveal]');
            if (reveal) {
                event.preventDefault();
                event.stopPropagation();
                const key = decodeURIComponent(reveal.dataset.reveal || '');
                if (revealedPasswords.has(key)) revealedPasswords.delete(key);
                else revealedPasswords.add(key);
                renderProfile();
                return;
            }
            const button = event.target.closest('[data-remove]');
            if (button) {
                removeFact(button.dataset.remove, decodeURIComponent(button.dataset.value));
                return;
            }
            const row = event.target.closest('[data-focus]');
            if (!row) return;
            if (isPhone()) {
                openPhoneField(row.dataset.focus);
                return;
            }
            activeField = row.dataset.focus;
            document.querySelectorAll('.node').forEach((item) => {
                item.classList.toggle('active', item.dataset.field === activeField);
            });
            renderProfile();
        });

        document.getElementById('dockReset').addEventListener('click', resetCase);
        const resetSheet = document.getElementById('resetConfirm');
        document.getElementById('resetCancel').addEventListener('click', closeResetConfirm);
        document.getElementById('resetConfirmBtn').addEventListener('click', applyResetCase);
        if (resetSheet) resetSheet.addEventListener('click', (event) => {
            if (event.target.id === 'resetConfirm') closeResetConfirm();
        });
        document.getElementById('dockRecenter').addEventListener('click', recenterOrbit);
        const dockAdd = document.getElementById('dockAdd');
        if (dockAdd) dockAdd.addEventListener('click', (event) => {
            event.stopPropagation();
            closePhoneField();
            closePhoneMore();
            openAddField();
        });
        document.getElementById('dockHelp').addEventListener('click', (event) => {
            event.stopPropagation();
            const guide = document.getElementById('helpGuide');
            if (guide && !guide.hidden) closeHelp();
            else openHelp();
        });
        document.getElementById('dockUndo').addEventListener('click', undoCase);
        document.getElementById('dockRedo').addEventListener('click', redoCase);
        document.getElementById('dockExport').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleExportMenu();
        });
        document.getElementById('dockShare').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleShare();
        });
        document.getElementById('phoneHelp').addEventListener('click', openHelp);
        document.getElementById('phoneAdd').addEventListener('click', () => {
            closePhoneField();
            closePhoneMore();
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
        document.getElementById('phoneMoreClose').addEventListener('click', closePhoneMore);
        document.getElementById('phoneMore').addEventListener('click', (event) => {
            if (event.target.id === 'phoneMore') closePhoneMore();
        });
        document.getElementById('phoneUndo').addEventListener('click', () => { closePhoneMore(); undoCase(); });
        document.getElementById('phoneRedo').addEventListener('click', () => { closePhoneMore(); redoCase(); });
        document.getElementById('phoneExport').addEventListener('click', () => { closePhoneMore(); toggleExportMenu(); });
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
        const phoneFieldSearch = document.getElementById('phoneFieldSearch');
        if (phoneFieldSearch) phoneFieldSearch.addEventListener('click', () => {
            writePhoneField();
            if (phoneFieldId) openSearchMenu(phoneFieldId);
        });
        document.getElementById('phoneLeads').addEventListener('click', (event) => {
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            openLead(option.dataset.openLead, fieldInputValue(phoneFieldId), option.dataset.leadMode);
        });
        document.getElementById('phoneFieldUpload').addEventListener('click', () => {
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
            const reveal = document.getElementById('phoneReveal');
            reveal.dataset.open = reveal.dataset.open === '1' ? '' : '1';
            syncPhoneField();
        });
        document.getElementById('shareClose').addEventListener('click', closeShare);
        document.getElementById('shareSheet').addEventListener('click', (event) => {
            if (event.target.id === 'shareSheet') closeShare();
        });
        document.getElementById('shareCopy').addEventListener('click', copyShareLink);
        document.getElementById('shareNative').addEventListener('click', nativeShareSite);
        document.getElementById('hubAdd').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleAddField();
        });
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
        document.getElementById('exportMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-export]');
            if (!option) return;
            event.stopPropagation();
            exportCase(option.dataset.export);
        });

        document.getElementById('profileToggle').addEventListener('click', () => setPanelOpen(true));
        document.getElementById('profileClose').addEventListener('click', () => setPanelOpen(false));
        backdrop.addEventListener('click', () => setPanelOpen(false));
        document.addEventListener('keydown', (event) => {
            const key = (event.key || '').toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
                event.preventDefault();
                undoCase();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && (key === 'y' || (key === 'z' && event.shiftKey))) {
                event.preventDefault();
                redoCase();
                return;
            }
            if (event.key === 'Escape') {
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
                const add = document.getElementById('addSheet');
                if (add && !add.hidden) {
                    closeAddField();
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

        function onViewportChange() {
            document.body.classList.toggle('phone', isPhone());
            if (isPhone()) setPanelOpen(true);
            else setPanelOpen(false);
            if (!isPhone()) {
                closePhoneField();
                closePhoneMore();
                const saved = Number(localStorage.getItem(SIDEBAR_KEY));
                applySidebarWidth(saved || 268);
                positionNodes();
            }
            renderProfile();
        }

        if (drawerQuery.addEventListener) drawerQuery.addEventListener('change', onViewportChange);
        else drawerQuery.addListener(onViewportChange);

        window.addEventListener('resize', () => { if (!isPhone()) positionNodes(); });
        requestAnimationFrame(() => {
            orbit.snapLayout = true;
            positionNodes();
            if (mapCanvas) mapCanvas.classList.add('orbit-ready');
            saveOrbitLayout();
            orbit.snapLayout = false;
        });
        if (window.ResizeObserver && mapCanvas) {
            const layoutWatch = new ResizeObserver(() => {
                if (orbit.dragging || isPhone()) return;
                positionNodes();
            });
            layoutWatch.observe(mapCanvas);
        }

        function pointerOnCanvas(event) {
            const rect = mapCanvas.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }

        function commitNodeHome(item) {
            if (!item || !item.node) return;
            const size = canvasSize();
            const zoom = Math.max(orbit.zoom * orbit.pulse, 0.01);
            const cx = size.width / 2 + orbit.dragX + orbit.parallaxX;
            const cy = size.height / 2 + orbit.dragY + orbit.parallaxY;
            const dx = item.x - cx;
            const dy = item.y - cy;
            const angle = Math.atan2(dy, dx) - orbit.spin;
            const r = Math.hypot(dx, dy) / zoom;
            item.tAngle = angle;
            item.angle = angle;
            item.tRx = r;
            item.tRy = r;
            item.rx = r;
            item.ry = r;
            nodeHomes.set(item.node.dataset.field, { angle: angle, rx: r, ry: r });
            scheduleSaveLayout();
        }

        function beginOrbitDrag(event, mode, item) {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            orbit.dragging = true;
            orbit.dragMode = mode || 'pan';
            orbit.dragItem = item || null;
            orbit.dragStartX = event.clientX;
            orbit.dragStartY = event.clientY;
            orbit.dragOriginX = orbit.dragX;
            orbit.dragOriginY = orbit.dragY;
            orbit.prevCX = event.clientX;
            orbit.prevCY = event.clientY;
            orbit.panVX = 0;
            orbit.panVY = 0;
            orbit.zoomFocusX = null;
            orbit.zoomFocusY = null;
            orbit.zoomWorldX = null;
            orbit.zoomWorldY = null;
            if (mode === 'pan') {
                orbit.targetParallaxX = 0;
                orbit.targetParallaxY = 0;
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
                commitNodeHome(orbit.dragItem);
                orbit.dragItem.node.classList.remove('dragging');
            }
            orbit.dragging = false;
            orbit.dragMode = null;
            orbit.dragItem = null;
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
            if (event.button !== 1) return;
            event.preventDefault();
            beginOrbitDrag(event, 'pan');
        });

        if (hub) hub.addEventListener('pointerdown', (event) => {
            if (event.target.closest('#hubAdd')) {
                event.stopPropagation();
                return;
            }
            if (event.button === 1) return;
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            beginOrbitDrag(event, 'hub');
        });

        if (mapCanvas) mapCanvas.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            if (event.target.closest('input, select, textarea, button, .search-btn, .node-clear, .node-more, .file-btn, .platform-trigger, .tz-trigger, .media-thumb, .platform-icon')) return;
            const node = event.target.closest('.node');
            if (!node || node.classList.contains('renaming')) return;
            const item = orbitItems.find((entry) => entry.node === node);
            if (!item) return;
            event.preventDefault();
            event.stopPropagation();
            beginOrbitDrag(event, 'node', item);
        });

        if (mapStage) mapStage.addEventListener('pointermove', (event) => {
            const rect = mapCanvas.getBoundingClientRect();
            setGridSpot(event.clientX - rect.left, event.clientY - rect.top);
            if (orbit.dragging && (orbit.dragMode === 'node' || orbit.dragMode === 'hub')) {
                const p = pointerOnCanvas(event);
                orbit.grabVX = (event.clientX - orbit.prevCX) * 0.85;
                orbit.grabVY = (event.clientY - orbit.prevCY) * 0.85;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                orbit.grabX = p.x + orbit.grabOffX;
                orbit.grabY = p.y + orbit.grabOffY;
                const size = canvasSize();
                const held = {
                    x: orbit.grabX,
                    y: orbit.grabY,
                    tx: orbit.grabX,
                    ty: orbit.grabY,
                    sw: orbit.dragMode === 'hub'
                        ? (hub && hub.offsetWidth || 96) * orbit.zoom
                        : (orbit.dragItem && orbit.dragItem.sw),
                    sh: orbit.dragMode === 'hub'
                        ? (hub && hub.offsetHeight || 96) * orbit.zoom
                        : (orbit.dragItem && orbit.dragItem.sh),
                    w: orbit.dragMode === 'hub'
                        ? (hub && hub.offsetWidth || 96)
                        : (orbit.dragItem && orbit.dragItem.w),
                    h: orbit.dragMode === 'hub'
                        ? (hub && hub.offsetHeight || 96)
                        : (orbit.dragItem && orbit.dragItem.h)
                };
                keepNodeOnScreen(held, size.width, size.height);
                orbit.grabX = held.x;
                orbit.grabY = held.y;
                if (orbit.dragMode === 'hub') {
                    orbit.dragX = orbit.grabX - size.width / 2 - orbit.parallaxX;
                    orbit.dragY = orbit.grabY - size.height / 2 - orbit.parallaxY;
                }
            } else if (orbit.dragging) {
                orbit.panVX = event.clientX - orbit.prevCX;
                orbit.panVY = event.clientY - orbit.prevCY;
                orbit.prevCX = event.clientX;
                orbit.prevCY = event.clientY;
                orbit.dragX = orbit.dragOriginX + (event.clientX - orbit.dragStartX);
                orbit.dragY = orbit.dragOriginY + (event.clientY - orbit.dragStartY);
                return;
            }
            if (!orbit.dragging || orbit.dragMode === 'node' || orbit.dragMode === 'hub') {
                const nx = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
                const ny = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
                const strength = reduceMotion ? 6 : 22;
                orbit.targetParallaxX = nx * strength;
                orbit.targetParallaxY = ny * strength;
            }
        });

        if (mapStage) mapStage.addEventListener('pointerup', endOrbitDrag);
        if (mapStage) mapStage.addEventListener('pointercancel', endOrbitDrag);
        if (mapStage) mapStage.addEventListener('pointerleave', () => {
            if (orbit.dragging) return;
            orbit.targetParallaxX = 0;
            orbit.targetParallaxY = 0;
            setGridSpot('50%', '50%');
        });

        document.getElementById('searchMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-open-lead]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.search-open');
            const fieldId = node && node.dataset.field;
            openLead(option.dataset.openLead, fieldInputValue(fieldId), option.dataset.leadMode);
        });

        document.getElementById('platformMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-platform]');
            if (!option) return;
            event.stopPropagation();
            const node = document.querySelector('.node.menu-open:not(.tz-open)');
            if (!node) return;
            setUsernameStep(node, option.dataset.pickPlatform, false);
            if (isPhone()) syncPhoneField();
            closePlatformMenu();
            const input = document.getElementById('field-' + node.dataset.field);
            if (input) input.focus();
            activeField = node.dataset.field;
        });

        document.getElementById('tzMenu').addEventListener('click', (event) => {
            const option = event.target.closest('[data-pick-tz]');
            if (!option) return;
            event.stopPropagation();
            const fieldId = document.getElementById('tzMenu').dataset.field;
            applyTimezonePick(fieldId, option.dataset.pickTz);
            if (isPhone()) syncPhoneField();
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('#platformMenu, .platform-trigger, #phonePlatformBtn, .node.menu-open:not(.tz-open)')) {
                closePlatformMenu();
            }
            if (!event.target.closest('#tzMenu, .tz-trigger, #phoneTzBtn, .node.tz-open')) {
                closeTimezoneMenu();
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
        });

        document.addEventListener('pointerdown', (event) => {
            if (fieldMenuGuard) return;
            if (event.target.closest('#fieldMenu, .node-more')) return;
            closeFieldMenu();
        }, true);

        document.getElementById('fieldMenu').addEventListener('click', (event) => {
            const button = event.target.closest('[data-field-act]');
            if (!button || button.disabled) return;
            event.stopPropagation();
            const act = button.dataset.fieldAct;
            const fieldId = document.getElementById('fieldMenu').dataset.field;
            closeFieldMenu();
            runFieldAction(act, fieldId);
        });

        if (mapStage) mapStage.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#fieldMenu, #searchMenu, #platformMenu, #tzMenu, #exportMenu, .media-viewer, .help-guide, .share-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            const node = event.target.closest('.node');
            if (node) {
                event.preventDefault();
                openFieldMenu(event, node);
                return;
            }
            if (event.target.closest('#hubAdd')) {
                event.preventDefault();
                toggleAddField();
                return;
            }
            if (event.target.closest('#hub')) {
                event.preventDefault();
                openHubMenu(event);
                return;
            }
            if (event.target.closest('.map-toggle, .donate, .dock')) return;
            event.preventDefault();
            openMapMenu(event);
        });

        document.getElementById('helpClose').addEventListener('click', closeHelp);
        document.getElementById('helpGuide').addEventListener('click', (event) => {
            if (event.target.id === 'helpGuide') closeHelp();
        });
        document.getElementById('mediaClose').addEventListener('click', closeMediaViewer);
        document.getElementById('mediaViewer').addEventListener('click', (event) => {
            if (event.target.id === 'mediaViewer') closeMediaViewer();
        });

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
            orbit.dragX = orbit.zoomFocusX - orbit.zoomWorldX * nextZoom - size.width / 2 - orbit.parallaxX;
            orbit.dragY = orbit.zoomFocusY - orbit.zoomWorldY * nextZoom - size.height / 2 - orbit.parallaxY;
        }

        function followZoom(current, target, dt, ms) {
            if (current <= 0 || target <= 0) return follow(current, target, dt, ms);
            return Math.exp(follow(Math.log(current), Math.log(target), dt, ms));
        }

        if (mapStage) mapStage.addEventListener('wheel', (event) => {
            if (event.target.closest('select, option, .platform-menu, .tz-menu, .search-menu, .field-menu, .media-viewer, .help-guide, .share-sheet, .add-sheet, .confirm-sheet, .phone-sheet, .phone-bar')) return;
            event.preventDefault();
            const rect = mapCanvas.getBoundingClientRect();
            let delta = event.deltaY;
            if (event.deltaMode === 1) delta *= 16;
            else if (event.deltaMode === 2) delta *= rect.height || 800;
            const current = orbit.targetZoom == null ? orbit.zoom : orbit.targetZoom;
            const next = clamp(current * Math.exp(-delta * 0.00105), 0.4, 2.8);
            captureZoomFocus(event.clientX - rect.left, event.clientY - rect.top);
            orbit.targetZoom = next;
            orbit.zoomBusy = true;
            if (reduceMotion) {
                orbit.zoom = next;
                applyZoomFocus(next);
                orbit.zoomBusy = false;
            }
        }, { passive: false });

        let lastTick = performance.now();
        function tickOrbit(now) {
            const dt = Math.min(48, now - lastTick);
            lastTick = now;
            const freezeWorld = orbit.dragging && orbit.dragMode === 'pan';
            orbit.pulse = 1;
            if (orbit.targetZoom == null) orbit.targetZoom = orbit.zoom;
            if (!reduceMotion && !freezeWorld) {
                orbit.spin += dt * 0.000024;
            }
            if (!orbit.dragging && !orbit.zoomBusy) {
                if (Math.hypot(orbit.panVX || 0, orbit.panVY || 0) > 0.25) {
                    orbit.dragX += orbit.panVX;
                    orbit.dragY += orbit.panVY;
                    orbit.panVX *= 0.9;
                    orbit.panVY *= 0.9;
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
            const mouseMs = reduceMotion ? 50 : 180;
            const snapMs = 18;
            orbit.parallaxX = follow(orbit.parallaxX, orbit.targetParallaxX, dt, freezeWorld ? snapMs : mouseMs);
            orbit.parallaxY = follow(orbit.parallaxY, orbit.targetParallaxY, dt, freezeWorld ? snapMs : mouseMs);
            orbit.spotX = follow(orbit.spotX, orbit.targetSpotX, dt, mouseMs);
            orbit.spotY = follow(orbit.spotY, orbit.targetSpotY, dt, mouseMs);
            const zoomMs = reduceMotion ? 1 : 220;
            orbit.zoom = followZoom(orbit.zoom, orbit.targetZoom, dt, zoomMs);
            if (Math.abs(Math.log(orbit.zoom / Math.max(orbit.targetZoom, 0.01))) < 0.00035) {
                orbit.zoom = orbit.targetZoom;
            }
            orbit.zoomBusy = orbit.zoom !== orbit.targetZoom;
            if (orbit.zoomWorldX != null) applyZoomFocus(orbit.zoom);
            if (!orbit.zoomBusy) {
                orbit.zoomFocusX = null;
                orbit.zoomFocusY = null;
                orbit.zoomWorldX = null;
                orbit.zoomWorldY = null;
            }
            const gridMs = reduceMotion ? 60 : (orbit.zoomBusy ? 1 : 280);
            const drift = reduceMotion ? 1 : 1.75;
            orbit.gridShiftX = follow(orbit.gridShiftX, orbit.dragX + orbit.parallaxX * drift, dt, freezeWorld || orbit.zoomBusy ? 1 : gridMs);
            orbit.gridShiftY = follow(orbit.gridShiftY, orbit.dragY + orbit.parallaxY * drift, dt, freezeWorld || orbit.zoomBusy ? 1 : gridMs);
            if (!isPhone()) applyOrbit(dt);
            const sec = Math.floor(now / 1000);
            if (sec !== tickOrbit.clockSec) {
                tickOrbit.clockSec = sec;
                updateTimezoneClocks();
            }
            requestAnimationFrame(tickOrbit);
        }
        requestAnimationFrame(tickOrbit);
