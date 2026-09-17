/* OrbINT fields, platforms, toolkit, search */

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
