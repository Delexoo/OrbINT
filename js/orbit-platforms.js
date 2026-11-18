/* Platform catalog and field platform assignment */

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

