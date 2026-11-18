/* Timezone, platform, and country-code menus */
        let platformMenuAnchor = null;

        function restorePlatformMenuHost() {
            const menu = document.getElementById('platformMenu');
            const stage = document.getElementById('mapStage');
            if (!menu) return;
            menu.style.position = '';
            menu.style.left = '';
            menu.style.top = '';
            menu.style.zIndex = '';
            if (stage && menu.parentNode !== stage) stage.appendChild(menu);
        }

        function closePlatformMenu() {
            const menu = document.getElementById('platformMenu');
            platformMenuAnchor = null;
            if (menu) {
                menu.hidden = true;
                menu.classList.remove('is-sheet');
            }
            document.querySelectorAll('.node.menu-open:not(.tz-open)').forEach((node) => node.classList.remove('menu-open'));
            document.querySelectorAll('[data-sheet-platform].is-open').forEach((el) => el.classList.remove('is-open'));
            restorePlatformMenuHost();
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
            closeCountryCodeMenu();
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
            if (!menu || menu.hidden) return;
            const stage = document.getElementById('mapStage');
            const node = document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const el = platformMenuAnchor || document.querySelector('[data-sheet-platform].is-open') || node;
            if (!el) return;
            const sheet = !!(el.closest && el.closest('#profilePanel, #factsList, .profile-panel, .phone-sheet, .phone-bar'));
            if (sheet || (stage && !stage.contains(el))) {
                if (menu.parentNode !== document.body) document.body.appendChild(menu);
                const r = el.getBoundingClientRect();
                const w = menu.offsetWidth || 260;
                const h = menu.offsetHeight || 280;
                let left = r.left;
                let top = r.bottom + 6;
                if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
                if (left < 8) left = 8;
                if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
                menu.classList.add('is-sheet');
                menu.style.position = 'fixed';
                menu.style.zIndex = '90';
                menu.style.left = left + 'px';
                menu.style.top = top + 'px';
                return;
            }
            restorePlatformMenuHost();
            menu.classList.remove('is-sheet');
            if (!node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 272);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function platformOptionHtml(item) {
            return '<button class="platform-option" type="button" data-pick-platform="' + escapeHtml(item.id) + '" data-label="' + escapeHtml(item.label.toLowerCase()) + '">' +
                platformMark(item) +
                escapeHtml(item.label) + '</button>';
        }

        function filterPlatformMenu(query) {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            const q = String(query || '').trim().toLowerCase();
            menu.querySelectorAll('.platform-option[data-pick-platform]').forEach((option) => {
                option.classList.toggle('hidden', !!(q && String(option.dataset.label || '').indexOf(q) === -1));
            });
            const match = menu.querySelector('[data-pick-custom]');
            if (match) {
                const exact = listedPlatforms().some((item) => item.label.toLowerCase() === q);
                match.hidden = !q || exact;
                match.dataset.pickCustom = String(query || '').trim();
                const label = match.querySelector('em');
                if (label) label.textContent = String(query || '').trim();
            }
        }

        function applyPlatformChoice(fieldId, platformId) {
            if (!fieldId || !platformId) return;
            const node = document.querySelector('.node[data-field="' + fieldId + '"]') || document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const input = document.getElementById('field-' + fieldId);
            const sheetInput = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]');
            const filled = !!(
                (input && String(input.value || '').trim()) ||
                (sheetInput && String(sheetInput.value || '').trim())
            );
            setFieldPlatform(fieldId, platformId);
            if (node) setUsernameStep(node, platformId, filled);
            else syncSheetPlatform(fieldId);
            if (filled && input) saveInputAsIs(input);
            if (isPhone()) syncPhoneField();
            closePlatformMenu();
            activeField = fieldId;
            renderProfile();
            recordHistory(false);
            const next = document.querySelector('#factsList [data-sheet-field="' + fieldId + '"]') || input;
            if (next) next.focus();
        }

        function applyCustomPlatformPick(label) {
            const menu = document.getElementById('platformMenu');
            const node = document.querySelector('.node.menu-open:not(.tz-open):not(.cc-open)');
            const fieldId = (node && node.dataset.field) || (menu && menu.dataset.field);
            const platform = makeCustomPlatform(label);
            if (!platform || !fieldId) return false;
            applyPlatformChoice(fieldId, platform.id);
            return true;
        }

        function openPlatformMenu(target, anchor) {
            const menu = document.getElementById('platformMenu');
            if (!menu) return;
            const fieldId = (typeof target === 'string')
                ? target
                : ((target && target.dataset && target.dataset.field) ||
                    (anchor && (anchor.getAttribute('data-sheet-platform') || (anchor.dataset && anchor.dataset.sheetPlatform))) ||
                    '');
            if (!fieldId) return;
            const node = (target && target.classList && target.classList.contains('node'))
                ? target
                : document.querySelector('.node[data-field="' + fieldId + '"]');
            closeSearchMenu();
            closeTimezoneMenu();
            closeCountryCodeMenu();
            closeFieldMenu();
            const platforms = listedPlatforms();
            menu.innerHTML = '<div class="platform-menu-title">Select a site</div>' +
                '<input class="platform-search" type="search" placeholder="Search or type a site" spellcheck="false">' +
                '<form class="platform-custom" id="platformCustomForm">' +
                    '<input class="platform-custom-input" type="text" maxlength="48" placeholder="Not listed? Type it here" spellcheck="false" autocomplete="off">' +
                    '<button type="submit">Use</button>' +
                '</form>' +
                '<div class="platform-list">' +
                    '<button class="platform-option custom-add" type="button" data-pick-custom hidden>' +
                        '<span class="platform-letter">+</span>Use “<em></em>”' +
                    '</button>' +
                    platforms.map(platformOptionHtml).join('') +
                '</div>';
            menu.dataset.field = fieldId;
            menu.hidden = false;
            document.querySelectorAll('.node.menu-open:not(.tz-open)').forEach((item) => {
                if (item !== node) item.classList.remove('menu-open');
            });
            document.querySelectorAll('[data-sheet-platform].is-open').forEach((item) => item.classList.remove('is-open'));
            if (node) node.classList.add('menu-open');
            platformMenuAnchor = anchor || target || node;
            if (platformMenuAnchor && platformMenuAnchor.classList) platformMenuAnchor.classList.add('is-open');
            placePlatformMenu();
            const search = menu.querySelector('.platform-search');
            const form = menu.querySelector('#platformCustomForm');
            const customInput = menu.querySelector('.platform-custom-input');
            if (search) {
                search.addEventListener('input', () => {
                    filterPlatformMenu(search.value);
                    if (customInput && document.activeElement !== customInput) customInput.value = search.value;
                });
                search.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const visible = Array.from(menu.querySelectorAll('.platform-option[data-pick-platform]:not(.hidden)'));
                    const q = search.value.trim();
                    if (visible.length === 1) visible[0].click();
                    else if (q) applyCustomPlatformPick(q);
                });
                search.focus();
            }
            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const value = (customInput && customInput.value) || (search && search.value) || '';
                    applyCustomPlatformPick(value);
                });
            }
        }

        function closeCountryCodeMenu() {
            const menu = document.getElementById('ccMenu');
            if (menu) menu.hidden = true;
            document.querySelectorAll('.node.cc-open').forEach((node) => node.classList.remove('cc-open', 'menu-open'));
        }

        function placeCountryCodeMenu() {
            const menu = document.getElementById('ccMenu');
            const node = document.querySelector('.node.cc-open');
            const stage = document.getElementById('mapStage');
            if (!menu || menu.hidden || !node || !stage) return;
            const nodeRect = node.getBoundingClientRect();
            const mapRect = stage.getBoundingClientRect();
            const left = Math.min(nodeRect.left - mapRect.left, mapRect.width - 312);
            const top = nodeRect.bottom - mapRect.top + 8;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top = Math.min(top, mapRect.height - menu.offsetHeight - 8) + 'px';
        }

        function countryCodeMenuHtml(selected) {
            const groups = [];
            const seen = {};
            COUNTRY_CODES.forEach((item) => {
                if (!seen[item.group]) {
                    seen[item.group] = [];
                    groups.push(item.group);
                }
                seen[item.group].push(item);
            });
            return '<div class="tz-menu-title">Country code</div>' +
                '<input class="tz-search" type="search" placeholder="Search US, +44, Japan…" spellcheck="false">' +
                '<div class="tz-list" role="listbox">' +
                groups.map((group) => (
                    '<div class="tz-group">' +
                    '<div class="tz-group-label">' + escapeHtml(group) + '</div>' +
                    seen[group].map((item) => {
                        const search = [item.dial, item.name, item.id, item.group].concat(item.aliases || []).join(' ').toLowerCase();
                        const flag = countryFlagEmoji(item.id);
                        return '<button class="tz-option cc-option' + (item.id === selected ? ' selected' : '') + '" type="button" role="option" data-pick-cc="' +
                            escapeHtml(item.id) + '" data-search="' + escapeHtml(search) + '">' +
                            '<span class="cc-option-flag" aria-hidden="true">' + escapeHtml(flag) + '</span>' +
                            '<span class="tz-option-main"><strong>' + escapeHtml(item.name) + '</strong></span>' +
                            '<span class="tz-option-meta"><b>' + escapeHtml(item.dial) + '</b></span>' +
                            '</button>';
                    }).join('') +
                    '</div>'
                )).join('') +
                '</div>';
        }

        function filterCountryCodeMenu(query) {
            const menu = document.getElementById('ccMenu');
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

        function applyCountryCodePick(fieldId, codeId) {
            const input = document.getElementById('field-' + fieldId);
            if (!input) return;
            input.value = codeId || '';
            if (codeId && isNullField(fieldId)) setFieldNull(fieldId, false, true);
            syncNodeFilled(input);
            saveInputAsIs(input);
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            if (node) syncCountryCodeTrigger(node);
            closeCountryCodeMenu();
            if (isPhone()) syncPhoneField();
        }

        function openCountryCodeMenu(node) {
            const menu = document.getElementById('ccMenu');
            const fieldId = node && node.dataset.field;
            if (!menu || !fieldId) return;
            closeSearchMenu();
            closePlatformMenu();
            closeTimezoneMenu();
            closeFieldMenu();
            const input = document.getElementById('field-' + fieldId);
            const selected = resolveCountryCodeValue((input && input.value) || firstValue(fieldId));
            menu.innerHTML = countryCodeMenuHtml(selected);
            menu.dataset.field = fieldId;
            menu.hidden = false;
            node.classList.add('cc-open', 'menu-open');
            placeCountryCodeMenu();
            const selectedBtn = menu.querySelector('.tz-option.selected');
            if (selectedBtn) selectedBtn.scrollIntoView({ block: 'nearest' });
            const search = menu.querySelector('.tz-search');
            if (search) {
                search.addEventListener('input', () => filterCountryCodeMenu(search.value));
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
                        if (pick) applyCountryCodePick(fieldId, pick.dataset.pickCc);
                        return;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        closeCountryCodeMenu();
                    }
                });
                search.focus();
            }
        }
