/* Toolkit, hide, duplicate, and add-field sheet */
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
                s.src = 'osint-tools.js?v=232';
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
            const quiet = !!(opts && opts.quiet);
            if (!quiet && typeof recordHistory === 'function') recordHistory(true);
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
            if (!quiet) {
                createNodes();
                applyHiddenFields();
                renderNodes();
                if (typeof renderProfile === 'function') renderProfile(true);
                updateHubProgress();
                if (opts && opts.focus === 'sheet' && typeof focusSheetField === 'function') focusSheetField(id);
                else focusOrbitField(id);
            }
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
                if (meta) meta.textContent = '';
                if (focusBar) focusBar.dataset.on = '0';
                if (list.dataset.skel !== 'wait') {
                    list.dataset.skel = 'wait';
                    list.innerHTML = '';
                    setTimeout(function () {
                        if (toolkitCatalog() || !list.isConnected) return;
                        list.innerHTML = '<div class="toolkit-cat toolkit-skel" aria-hidden="true"><button type="button" class="toolkit-cat-toggle" tabindex="-1"><span class="toolkit-cat-title">Tools</span><span class="toolkit-cat-count">0</span></button><div class="toolkit-tools"><button type="button" class="toolkit-tool" tabindex="-1">Search</button></div></div>';
                    }, 300);
                }
                return;
            }
            delete list.dataset.skel;
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

