/* Profile icons, phone sheet, email and platform marks */
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
            return raw ? 'https://www.google.com/maps?q=' + encodeURIComponent(raw) : '';
        }

        function shortenCrypto(value) {
            const raw = String(value || '').trim();
            if (raw.length > 20 && /^[0-9a-zA-Z]+$/.test(raw)) return raw.slice(0, 10) + '…' + raw.slice(-6);
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
            const base = fieldBase(field.id);
            return base === 'name' || base === 'image';
        }

        function skipSheetField(field) {
            if (skipProfileRow(field)) return true;
            if (typeof investigatorHidesField === 'function' && investigatorHidesField(field)) return true;
            return false;
        }

        function subjectAddressLines() {
            const street = firstValue('address');
            const city = firstValue('city');
            const region = firstValue('region');
            const postal = firstValue('postal');
            const country = firstValue('country');
            const lines = [];
            if (street) {
                String(street).split(/\n+/).forEach((line) => {
                    const text = line.trim();
                    if (text) lines.push(text);
                });
            }
            const cityLine = [city && region ? city + ', ' + region : (city || region), postal].filter(Boolean).join(' ').trim();
            if (cityLine) {
                const already = lines.some((line) => line.toLowerCase().indexOf(cityLine.toLowerCase()) !== -1);
                if (!already) lines.push(cityLine);
            }
            if (country) {
                const already = lines.some((line) => line.toLowerCase().indexOf(country.toLowerCase()) !== -1);
                if (!already) lines.push(country);
            }
            return lines;
        }

        function mapsQueryForField(fieldId) {
            const live = (typeof fieldInputValue === 'function' ? fieldInputValue(fieldId) : '') || firstValue(fieldId) || '';
            if (fieldBase(fieldId) === 'address') {
                const composed = subjectAddressLines().join(', ');
                return composed || String(live || '').trim();
            }
            return String(live || '').trim();
        }

        function openMapsHref(href) {
            if (!href) return;
            const a = document.createElement('a');
            a.href = href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

        function openFieldMaps(fieldId) {
            openMapsHref(mapsHref(mapsQueryForField(fieldId)));
        }

        function mapsControlHtml(fieldId, className) {
            const href = mapsHref(mapsQueryForField(fieldId));
            const ready = !!href;
            return '<a class="' + className + '" href="' + (ready ? escapeHtml(href) : '#') + '"' +
                (ready ? ' target="_blank" rel="noopener noreferrer"' : ' aria-disabled="true" tabindex="-1"') +
                ' data-open-maps="' + fieldId + '" aria-label="Open in Google Maps" title="Google Maps">' +
                PIN_ICON + '</a>';
        }

        function mapsButtonHtml(fieldId) {
            return mapsControlHtml(fieldId, 'fact-maps');
        }

        function applyMapsControlState(btn, fieldId) {
            if (!btn) return;
            const id = fieldId || btn.dataset.openMaps;
            const href = mapsHref(mapsQueryForField(id));
            if (btn.tagName === 'A') {
                if (href) {
                    btn.href = href;
                    btn.target = '_blank';
                    btn.rel = 'noopener noreferrer';
                    btn.removeAttribute('aria-disabled');
                    btn.removeAttribute('tabindex');
                } else {
                    btn.href = '#';
                    btn.removeAttribute('target');
                    btn.removeAttribute('rel');
                    btn.setAttribute('aria-disabled', 'true');
                    btn.tabIndex = -1;
                }
            } else {
                btn.disabled = !href;
            }
        }

        function ensureMapsThumb(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            if (!isMapsField(fieldId)) return;
            let thumb = node.querySelector('.media-thumb');
            if (!thumb) {
                thumb = document.createElement('button');
                thumb.className = 'media-thumb';
                thumb.type = 'button';
                thumb.dataset.openMedia = fieldId;
                thumb.setAttribute('aria-label', 'Open in Google Maps');
                thumb.title = 'Google Maps';
                thumb.hidden = true;
                const copy = node.querySelector('.node-copy');
                node.insertBefore(thumb, copy || node.firstChild);
            }
            if (typeof setFieldThumb === 'function') setFieldThumb(fieldId);
        }

        function syncMapsButtons(fieldId) {
            const ready = !!mapsQueryForField(fieldId || 'address');
            const placeBase = fieldBase(fieldId);
            const refreshAddress = !fieldId || placeBase === 'address' || placeBase === 'city' || placeBase === 'region' || placeBase === 'postal' || placeBase === 'country';
            document.querySelectorAll('[data-open-maps]').forEach((btn) => {
                const id = btn.dataset.openMaps;
                if (fieldId && id !== fieldId && !(refreshAddress && fieldBase(id) === 'address')) return;
                applyMapsControlState(btn, id);
            });
            if (refreshAddress && typeof setFieldThumb === 'function') {
                const node = document.querySelector('.node[data-field="address"]');
                if (node && node.querySelector('.media-thumb')) setFieldThumb('address');
            }
            if (ready && fieldId && isThumbField(fieldId) && typeof setFieldThumb === 'function') setFieldThumb(fieldId);
        }

        function profileIconCaption(field, item, href) {
            const raw = String((item && item.value) || '').trim();
            if (isSocialLikeField(field)) {
                let handle = usernameHandle(raw);
                if (/^https?:\/\//i.test(raw) || (href && /[./]/.test(raw))) {
                    try {
                        const parts = new URL(href || raw).pathname.replace(/\/+$/, '').split('/').filter(Boolean);
                        if (parts.length) handle = usernameHandle(parts[parts.length - 1]);
                    } catch (error) {}
                }
                handle = usernameHandle(handle.split(/[/?#]/)[0]);
                return handle ? '@' + handle : raw;
            }
            if (href) {
                try {
                    const url = new URL(href);
                    const host = url.hostname.replace(/^www\./, '');
                    const path = url.pathname.replace(/\/+$/, '');
                    if (path && path !== '/') {
                        const full = host + path;
                        return full.length > 40 ? host + path.slice(0, 18) + '…' : full;
                    }
                    return host;
                } catch (error) {
                    return href.replace(/^https?:\/\//i, '').replace(/\/$/, '');
                }
            }
            return raw;
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
                    icons.push({
                        href: href,
                        mark: mark,
                        title: title,
                        caption: profileIconCaption(field, item, href),
                        fieldId: field.id,
                        value: item.value
                    });
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
            if (base === 'countrycode') {
                const code = resolveCountryCodeValue(value);
                const meta = countryCodeMeta(code);
                return {
                    text: meta ? meta.dial + ' · ' + meta.name : value,
                    href: '',
                    title: meta ? meta.name + ' (' + meta.id + ')' : value,
                    wrap: false,
                    mono: true
                };
            }
            if (base === 'phone' || base === 'phone2' || base === 'fax') {
                return { text: value, href: phoneHref(value), title: value, wrap: false, mono: true };
            }
            if (base === 'email' || base === 'email2') {
                return { text: value, href: value.indexOf('@') !== -1 ? 'mailto:' + value : '', title: value, wrap: true };
            }
            if (PROFILE_PLACE_FIELDS[base]) {
                return { text: value, href: mapsHref(value), title: value, wrap: true };
            }
            if (base === 'crypto') {
                return { text: shortenCrypto(value), href: cryptoHref(value), title: value, wrap: true, mono: true };
            }
            if (base === 'ip' || base === 'mac' || base === 'vin' || base === 'plate' || base === 'imei' || base === 'uuid') {
                const href = base === 'ip' ? 'https://ipinfo.io/' + encodeURIComponent(value) : '';
                return { text: value, href: href, title: value, wrap: true, mono: true };
            }
            if (base === 'record') {
                return { text: value, href: '', title: value, wrap: true, mono: true };
            }
            if (base === 'audio' || base === 'video' || base === 'screenshot') {
                return { text: field.label, href: siteHref(value), title: value, wrap: false };
            }
            if (isSecretField(field.id)) {
                const open = secretIsOpen(field.id);
                const dots = Array(Math.min(14, Math.max(6, value.length)) + 1).join('•');
                return {
                    text: open ? value : dots,
                    href: '',
                    title: open ? value : 'Hidden',
                    wrap: false,
                    secret: true,
                    revealed: open,
                    key: field.id
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

        function setSecretRevealButton(btn, open, fieldId) {
            if (!btn) return;
            btn.innerHTML = open ? EYE_OFF_ICON : EYE_OPEN_ICON;
            btn.setAttribute('aria-label', secretAriaLabel(fieldId, open));
            btn.title = open ? 'Hide' : 'Show';
            btn.classList.toggle('open', !!open);
        }

        function secretRevealBtnHtml(fieldId) {
            return '<button class="secret-reveal" type="button" data-secret-reveal="' + fieldId + '" aria-label="' + escapeHtml(secretAriaLabel(fieldId, false)) + '" title="Show">' + EYE_OPEN_ICON + '</button>';
        }

        function ensureSecretControls(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            const secret = isSecretField(fieldId);
            node.classList.toggle('secret-node', secret);
            let btn = node.querySelector('.secret-reveal');
            if (!secret) {
                if (btn) btn.remove();
                const input = document.getElementById('field-' + fieldId);
                if (input && input.type === 'password') input.type = 'text';
                return;
            }
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'secret-reveal';
                btn.type = 'button';
                btn.dataset.secretReveal = fieldId;
                const search = node.querySelector('.search-btn');
                if (search && search.parentNode) search.parentNode.insertBefore(btn, search);
                else {
                    const copy = node.querySelector('.node-copy');
                    if (copy) copy.appendChild(btn);
                }
            }
            syncSecretNode(node);
        }

        function syncSecretNode(node) {
            if (!node) return;
            const fieldId = node.dataset.field;
            if (!isSecretField(fieldId)) return;
            const btn = node.querySelector('.secret-reveal');
            const input = document.getElementById('field-' + fieldId);
            const open = secretIsOpen(fieldId);
            if (input) {
                const next = open ? 'text' : 'password';
                if (input.type !== next && input.type !== 'hidden') input.type = next;
            }
            setSecretRevealButton(btn, open, fieldId);
            if (btn) btn.hidden = !!(input && input.hidden);
        }

        function applySecretReveal(fieldId) {
            if (!fieldId) return;
            const open = secretIsOpen(fieldId);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) syncSecretNode(node);
            const sheet = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]');
            if (sheet && sheet.tagName === 'INPUT') {
                const next = open ? 'text' : 'password';
                if (sheet.type !== next) {
                    const start = sheet.selectionStart;
                    const end = sheet.selectionEnd;
                    sheet.type = next;
                    try {
                        if (document.activeElement === sheet) sheet.setSelectionRange(start, end);
                    } catch (error) {}
                }
            }
            document.querySelectorAll('[data-secret-reveal="' + fieldId + '"]').forEach((btn) => {
                setSecretRevealButton(btn, open, fieldId);
            });
            if (phoneFieldId === fieldId) syncPhoneField();
        }

        function toggleSecretReveal(fieldId) {
            if (!fieldId) return;
            if (revealedPasswords.has(fieldId)) revealedPasswords.delete(fieldId);
            else revealedPasswords.add(fieldId);
            applySecretReveal(fieldId);
        }

        function profileFactRowHtml(field, item) {
            const shown = profileRowDisplay(field, item);
            const platform = item && item.platform && platformById(item.platform);
            const label = (isSocialLikeField(field) && platform) ? platform.label : field.label;
            const inner = shown.href
                ? '<a href="' + escapeHtml(shown.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(shown.text) + '</a>'
                : escapeHtml(shown.text);
            const tzAttr = shown.zone ? ' data-profile-tz="' + escapeHtml(shown.zone) + '"' : '';
            const reveal = shown.secret
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, shown.revealed)) + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            const find = isPhone()
                ? '<button type="button" class="fact-find ready" data-search-field="' + field.id + '" aria-label="Search deeper" title="Search deeper">' + DEEP_ICON + '</button>'
                : '';
            const wrap = shown.wrap || String(shown.text || '').length > 28;
            return '<div class="fact-row' + (activeField === field.id ? ' active' : '') + (wrap ? ' wrap' : '') + (shown.secret ? ' secret' : '') + (shown.mono ? ' mono' : '') + '" data-focus="' + field.id + '">' +
                '<span class="fact-label">' + escapeHtml(label) + '</span>' +
                '<em class="fact-value" title="' + escapeHtml(shown.title) + '"' + tzAttr + '>' + inner + '</em>' +
                '<div class="fact-tools">' +
                    reveal +
                    find +
                    '<button type="button" data-remove="' + field.id + '" data-value="' + encodeURIComponent(item.value) + '" aria-label="Remove">×</button>' +
                '</div></div>';
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
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, shown.revealed)) + '" title="' + (shown.revealed ? 'Hide' : 'Show') + '">' + (shown.revealed ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
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
            const ccBtn = document.getElementById('phoneCcBtn');
            const upload = document.getElementById('phoneFieldUpload');
            const reveal = document.getElementById('phoneReveal');
            const mapsBtn = document.getElementById('phoneMaps');
            const fact = latestFact(phoneFieldId);
            const platformId = fieldPlatformId(phoneFieldId);
            const platformField = isPlatformField(phoneFieldId);
            const tz = fieldBase(phoneFieldId) === 'timezone';
            const cc = fieldBase(phoneFieldId) === 'countrycode';
            const img = fieldBase(phoneFieldId) === 'image';
            const needsPlatform = platformField && !platformId;
            if (title && field) title.textContent = field.label;
            if (platBtn) {
                platBtn.hidden = !needsPlatform;
                platBtn.textContent = 'Select site';
            }
            if (tzBtn) {
                tzBtn.hidden = !tz;
                const abbr = node && node.querySelector('.tz-abbr');
                tzBtn.textContent = (abbr && abbr.textContent && abbr.textContent !== 'Zone') ? abbr.textContent : 'Choose timezone';
            }
            if (ccBtn) {
                ccBtn.hidden = !cc;
                const meta = countryCodeMeta((input && input.value) || firstValue(phoneFieldId));
                const flag = meta ? countryFlagEmoji(meta.id) : '';
                ccBtn.textContent = meta ? [flag, meta.name, meta.dial].filter(Boolean).join('  ') : 'Choose country';
            }
            if (editor) {
                editor.hidden = tz || cc || needsPlatform || img;
                if (input && document.activeElement !== editor) editor.value = input.value || '';
                editor.placeholder = field ? (field.placeholder || 'Value') : 'Value';
                editor.inputMode = fieldBase(phoneFieldId) === 'phone' ? 'tel' : 'text';
                const hideSecret = isSecretField(phoneFieldId) && !secretIsOpen(phoneFieldId);
                editor.type = hideSecret ? 'password' : 'text';
            }
            if (reveal) {
                const show = isSecretField(phoneFieldId) && !needsPlatform;
                reveal.hidden = !show;
                const open = secretIsOpen(phoneFieldId);
                setSecretRevealButton(reveal, open, phoneFieldId);
            }
            if (mapsBtn) {
                const showMaps = isMapsField(phoneFieldId) && !needsPlatform;
                mapsBtn.hidden = !showMaps;
                applyMapsControlState(mapsBtn, phoneFieldId);
                mapsBtn.innerHTML = PIN_ICON;
            }
            if (upload) {
                if (img) {
                    upload.hidden = false;
                    upload.textContent = 'Add';
                } else {
                    upload.hidden = !(field && field.file);
                    upload.textContent = 'Upload';
                }
            }
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
            box.innerHTML = '<p class="phone-leads-note">Use the find button. The search window takes this value, or any other value you type.</p>';
        }

        function openPhoneField(id) {
            phoneFieldId = id;
            activeField = id;
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
            const fieldId = node.dataset.field;
            const trigger = node.querySelector('.platform-trigger');
            const input = document.getElementById('field-' + fieldId);
            if (!trigger || !input) return;
            const platform = platformById(platformId) || platformById(fieldPlatformId(fieldId));
            node.dataset.platform = platform ? platform.id : '';
            setPlatformIcon(node, node.dataset.platform);
            if (!platform) {
                trigger.hidden = false;
                trigger.textContent = 'Select site';
                input.hidden = true;
            } else {
                const secret = isSecretField(fieldId);
                trigger.hidden = true;
                input.hidden = false;
                if (!filled) input.placeholder = secret ? platformFieldPlaceholder(fieldId) : '@username';
                input.setAttribute('aria-label', platform.label + (secret ? ' password' : ' username'));
            }
            if (isSecretField(fieldId)) syncSecretNode(node);
            syncSheetPlatform(fieldId);
        }

        function syncSheetPlatform(fieldId) {
            if (!isPlatformField(fieldId)) return;
            const row = document.querySelector('#factsList [data-focus="' + fieldId + '"]');
            if (!row) return;
            const pick = row.querySelector('.sheet-platform');
            const wrap = row.querySelector('.sheet-platform-value');
            let mark = row.querySelector('.sheet-platform-mark');
            const input = row.querySelector('[data-sheet-field]');
            const platform = platformById(fieldPlatformId(fieldId));
            if (wrap && !mark) {
                mark = document.createElement('button');
                mark.type = 'button';
                mark.className = 'sheet-platform-mark';
                mark.setAttribute('data-sheet-platform', fieldId);
                mark.title = 'Change site';
                mark.setAttribute('aria-label', 'Change site');
                wrap.insertBefore(mark, wrap.firstChild);
            }
            if (pick) {
                pick.hidden = !!platform;
                pick.textContent = 'Select site';
            }
            if (wrap) wrap.hidden = !platform;
            if (mark) {
                if (platform) {
                    mark.innerHTML = platformMark(platform);
                    mark.title = 'Change site · ' + platform.label;
                    mark.setAttribute('aria-label', 'Change site');
                    mark.hidden = false;
                } else {
                    mark.hidden = true;
                    mark.innerHTML = '';
                }
            }
            if (input) input.hidden = !platform;
        }

