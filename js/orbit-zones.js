/* Timezone and country-code fields */
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

