/* Casebook sheet, dossier rows, profile photos */
        function populatedCount() {
            return FIELDS.filter((field) => !!latestFact(field.id)).length;
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
            return !!latestFact(field.id);
        }

        function filledInputCount() {
            return visibleOrbitFields().filter(fieldHasInput).length;
        }

        function nullInputCount() {
            return visibleOrbitFields().filter((field) => !fieldHasInput(field) && isNullField(field.id)).length;
        }

        function orbitSpokeStroke(node, linked) {
            if (node && node.classList.contains('null')) {
                return linked ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.28)';
            }
            if (node && node.classList.contains('filled')) {
                return linked ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.28)';
            }
            return linked ? 'rgba(228,228,231,0.32)' : 'rgba(255,255,255,0.06)';
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
            const missing = Math.round(red * 100);
            hub.setAttribute('aria-label', missing
                ? known + '% known, ' + missing + '% missing'
                : known + '% complete');
        }

        function sheetFieldValue(field) {
            const fact = latestFact(field.id);
            const raw = (fact && fact.value) || '';
            if (fieldBase(field.id) === 'phone') return formatPhoneNumber(raw);
            if (fieldBase(field.id) === 'timezone') return resolveTimezoneValue(raw) || raw;
            if (fieldBase(field.id) === 'countrycode') {
                const meta = countryCodeMeta(raw);
                return meta ? meta.dial + ' · ' + meta.name : raw;
            }
            return raw;
        }

        function orbitFieldDisplay(fieldId, value) {
            if (fieldBase(fieldId) === 'phone') return formatPhoneNumber(value);
            if (fieldBase(fieldId) === 'timezone') return resolveTimezoneValue(value) || value;
            if (fieldBase(fieldId) === 'countrycode') return resolveCountryCodeValue(value) || value;
            return value || '';
        }

        function profileSheetEditing() {
            const el = document.activeElement;
            if (!el || !el.closest) return false;
            return el.id === 'subjectNameInput' || !!el.closest('#factsList [data-sheet-field], .fact-prov, .fact-detail, .case-file, .sheet-pick, #sheetPickMenu');
        }

        const openFactDetails = new Set();

        function factDetailsOpen(id) {
            return openFactDetails.has(id);
        }

        function toggleFactDetails(id) {
            if (!id) return;
            if (openFactDetails.has(id)) openFactDetails.delete(id);
            else openFactDetails.add(id);
            const item = document.querySelector('.fact-item[data-fact-item="' + id + '"]');
            if (!item) return;
            const on = openFactDetails.has(id);
            item.classList.toggle('is-open', on);
            const panel = item.querySelector('.fact-detail');
            const btn = item.querySelector('[data-fact-more]');
            if (panel) panel.setAttribute('aria-hidden', on ? 'false' : 'true');
            if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        }

        function dossierFieldRowHtml(field) {
            const base = fieldBase(field.id);
            const value = sheetFieldValue(field);
            const isNotes = base === 'notes';
            const secret = isSecretField(field.id);
            const secretOpen = secret && secretIsOpen(field.id);
            const platformField = isPlatformField(field.id);
            const platformId = platformField ? fieldPlatformId(field.id) : '';
            const platform = platformId ? platformById(platformId) : null;
            let control;
            const reveal = secret
                ? '<button type="button" class="fact-reveal" data-secret-reveal="' + field.id + '" aria-label="' + escapeHtml(secretAriaLabel(field.id, secretOpen)) + '" title="' + (secretOpen ? 'Hide' : 'Show') + '">' + (secretOpen ? EYE_OFF_ICON : EYE_OPEN_ICON) + '</button>'
                : '';
            if (isNotes) {
                control = '<textarea class="sheet-area" data-sheet-field="' + field.id + '" rows="2" placeholder="' + escapeHtml(field.placeholder || '') + '">' + escapeHtml(value) + '</textarea>';
            } else if (platformField) {
                const passInput = '<input class="sheet-input" data-sheet-field="' + field.id + '" type="' + (secret && !secretOpen ? 'password' : 'text') + '" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" value="' + escapeHtml(value) + '" spellcheck="false" autocomplete="off">';
                control =
                    '<button type="button" class="sheet-platform" data-sheet-platform="' + field.id + '"' + (platform ? ' hidden' : '') + '>Select site</button>' +
                    '<div class="sheet-platform-value"' + (platform ? '' : ' hidden') + '>' +
                        (platform
                            ? '<button type="button" class="sheet-platform-mark" data-sheet-platform="' + field.id + '" title="Change site" aria-label="Change site">' + platformMark(platform) + '</button>'
                            : '<button type="button" class="sheet-platform-mark" data-sheet-platform="' + field.id + '" hidden title="Change site" aria-label="Change site"></button>') +
                        (secret ? '<span class="sheet-secret">' + passInput + reveal + '</span>' : passInput) +
                    '</div>';
            } else {
                const input = '<input class="sheet-input" data-sheet-field="' + field.id + '" type="' + (secret && !secretOpen ? 'password' : 'text') + '" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder || '') + '" value="' + escapeHtml(value) + '" spellcheck="false" autocomplete="off">';
                control = secret ? '<span class="sheet-secret">' + input + reveal + '</span>' : input;
            }
            const maps = isMapsField(field.id) ? mapsButtonHtml(field.id) : '';
            const filled = !!String(value || '').trim() && (!platformField || !!platform);
            const find = '<button type="button" class="fact-find' + (filled ? ' ready' : '') + '" data-search-field="' + field.id + '" aria-label="' + (filled ? 'Search deeper' : 'How to find this') + '" title="' + (filled ? 'Search deeper' : 'How to find this') + '">' + (filled ? DEEP_ICON : FIND_ICON) + '</button>';
            const drop = '<button type="button" class="fact-drop" data-sheet-hide="' + field.id + '" aria-label="Delete" title="Delete">×</button>';
            const fact = lastFactRecord(field.id);
            const detailsOpen = factDetailsOpen(field.id);
            const more = '<button type="button" class="fact-more" data-fact-more="' + field.id + '" aria-expanded="' + (detailsOpen ? 'true' : 'false') + '" aria-label="Details" title="Details">' + SHEET_CHEVRON + '</button>';
            return '<div class="fact-item' + (detailsOpen ? ' is-open' : '') + '" data-fact-item="' + field.id + '">' +
                '<div class="fact-row sheet' + (isNotes ? ' wrap' : '') + (secret ? ' secret' : '') + (maps ? ' place' : '') + (platformField ? ' platform' : '') + (activeField === field.id ? ' active' : '') + '" data-focus="' + field.id + '">' +
                '<span class="fact-label">' + escapeHtml(field.label) + '</span>' +
                '<div class="fact-control">' + control + '</div>' +
                '<div class="fact-tools">' +
                    maps +
                    more +
                    find +
                    drop +
                '</div>' +
                '</div>' +
                factDetailHtml(field.id, fact, detailsOpen) +
                '</div>';
        }

        const SHEET_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

        function sheetPickButton(kind, value, extras) {
            const label = sheetPickLabel(kind, value);
            const empty = value ? '' : ' is-empty';
            return '<button type="button" class="sheet-pick' + empty + '" data-sheet-pick="' + kind + '" data-value="' + escapeHtml(value || '') + '" ' + (extras || '') + ' aria-haspopup="listbox" aria-expanded="false"><span>' + escapeHtml(label) + '</span>' + SHEET_CHEVRON + '</button>';
        }

        function factDetailHtml(fieldId, fact, open) {
            const source = (fact && fact.source) || '';
            const confidence = (fact && fact.confidence) || '';
            const method = (fact && fact.method) || '';
            const captured = factStampIso(fact);
            const locked = window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly();
            const lock = locked ? ' disabled' : '';
            const stamp = factStampHtml(fieldId, captured, lock);
            const dup = '<button type="button" class="fact-dup" data-sheet-dup="' + fieldId + '" aria-label="Duplicate" title="Duplicate">' + DUP_ICON + '<span>Duplicate</span></button>';
            return '<div class="fact-detail" data-fact-detail="' + fieldId + '" aria-hidden="' + (open ? 'false' : 'true') + '">' +
                '<div class="fact-detail-body">' +
                '<input class="fact-source" data-fact-meta="source" data-sheet-meta="' + fieldId + '" type="text" placeholder="Note" value="' + escapeHtml(source) + '" spellcheck="true" autocomplete="off" aria-label="Note">' +
                '<div class="fact-detail-row">' +
                    '<div class="fact-picks">' +
                        sheetPickButton('confidence', confidence, 'data-sheet-meta="' + fieldId + '" aria-label="Confidence"') +
                        sheetPickButton('method', method, 'data-sheet-meta="' + fieldId + '" aria-label="Collection method"') +
                        dup +
                        stamp +
                    '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        function lastFactRecord(id) {
            const list = (profile.facts && profile.facts[id]) || [];
            return list.length ? list[list.length - 1] : null;
        }

        function factStampIso(fact) {
            if (!fact) return '';
            return fact.capturedAt || fact.addedAt || '';
        }

        function factStampHtml(fieldId, captured, lock) {
            const empty = captured ? '' : ' is-empty';
            return '<div class="fact-stamp">' +
                '<button type="button" class="fact-captured' + empty + '" data-fact-cal="' + fieldId + '" aria-haspopup="dialog" aria-expanded="false" aria-label="Change date" title="Change date"' + lock + '>' +
                    escapeHtml(captured ? formatCapturedDate(captured) : 'Date') +
                '</button>' +
                '<span class="fact-stamp-sep" aria-hidden="true">·</span>' +
                '<button type="button" class="fact-captured fact-captured-time' + empty + '" data-fact-time="' + fieldId + '" aria-haspopup="dialog" aria-expanded="false" aria-label="Change time" title="Change time"' + lock + '>' +
                    escapeHtml(captured ? formatCapturedTime(captured) : 'Time') +
                '</button>' +
                '</div>';
        }

        function paintFactCaptured(id) {
            if (!id) return;
            const iso = factStampIso(lastFactRecord(id));
            const root = document.querySelector('#factsList [data-fact-item="' + id + '"]');
            if (!root) return;
            const dateBtn = root.querySelector('[data-fact-cal]');
            const timeBtn = root.querySelector('[data-fact-time]');
            if (dateBtn) {
                dateBtn.textContent = iso ? formatCapturedDate(iso) : 'Date';
                dateBtn.classList.toggle('is-empty', !iso);
            }
            if (timeBtn) {
                timeBtn.textContent = iso ? formatCapturedTime(iso) : 'Time';
                timeBtn.classList.toggle('is-empty', !iso);
            }
        }

        function formatCapturedDate(iso) {
            const d = new Date(iso);
            if (!Number.isFinite(d.getTime())) return 'Date';
            return d.toLocaleString('en-GB', { day: 'numeric', month: 'short' });
        }

        function formatCapturedTime(iso) {
            const d = new Date(iso);
            if (!Number.isFinite(d.getTime())) return 'Time';
            return d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
        }

        function formatCaptured(iso) {
            const day = formatCapturedDate(iso);
            const time = formatCapturedTime(iso);
            if (day === 'Date' || time === 'Time') return '';
            return day + ' · ' + time;
        }

        function dossierHtml() {
            const groups = groupsForProfile().map((group) => {
                const fields = group.fields.map(fieldById).filter((field) => field && !hiddenFields.has(field.id) && !skipSheetField(field));
                return { group: group, fields: fields };
            }).filter((entry) => entry.fields.length);
            const body = groups.map(({ group, fields }) => {
                const heading = group.id === 'identity'
                    ? ''
                    : '<div class="group-label">' + escapeHtml(group.label) + '</div>';
                return '<div class="group">' + heading + fields.map(dossierFieldRowHtml).join('') + '</div>';
            }).join('');
            return body +
                '<p class="site-updated" data-site-updated hidden></p>';
        }

        const SITE_REPO = 'Delexoo/OrbINT';
        let siteUpdatedAt = '';
        let siteUpdatedLoading = false;
        let siteUpdatedTimer = 0;

        function siteUpdatedLabel(iso) {
            const then = new Date(iso).getTime();
            if (!Number.isFinite(then)) return '';
            const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
            let amount;
            let unit;
            if (secs < 60) {
                amount = secs;
                unit = amount === 1 ? 'sec' : 'secs';
            } else if (secs < 3600) {
                amount = Math.floor(secs / 60);
                unit = 'min';
            } else if (secs < 86400) {
                amount = Math.floor(secs / 3600);
                unit = amount === 1 ? 'hour' : 'hours';
            } else if (secs < 365 * 86400) {
                amount = Math.floor(secs / 86400);
                unit = amount === 1 ? 'day' : 'days';
            } else {
                amount = Math.floor(secs / (365 * 86400));
                unit = amount === 1 ? 'year' : 'years';
            }
            return 'OrbINT.net last updated: ' + amount + ' ' + unit + ' ago';
        }

        function paintSiteUpdated() {
            const el = document.querySelector('[data-site-updated]');
            if (!el || !siteUpdatedAt) return;
            const text = siteUpdatedLabel(siteUpdatedAt);
            if (!text) return;
            if (el.textContent !== text) el.textContent = text;
            el.hidden = false;
            if (!siteUpdatedTimer) siteUpdatedTimer = setInterval(paintSiteUpdated, 1000);
        }

        function loadSiteUpdated() {
            paintSiteUpdated();
            if (siteUpdatedAt || siteUpdatedLoading) return;
            siteUpdatedLoading = true;
            const headers = { Accept: 'application/vnd.github+json' };
            fetch('https://api.github.com/repos/' + SITE_REPO + '/commits/main', { headers: headers })
                .then(function (res) {
                    if (!res.ok) throw new Error('github');
                    return res.json();
                })
                .then(function (data) {
                    const at = data && data.commit && ((data.commit.committer && data.commit.committer.date) || (data.commit.author && data.commit.author.date));
                    if (!at) throw new Error('date');
                    siteUpdatedAt = at;
                    paintSiteUpdated();
                })
                .catch(function () {
                    return fetch('https://api.github.com/repos/' + SITE_REPO, { headers: headers })
                        .then(function (res) {
                            if (!res.ok) return null;
                            return res.json();
                        })
                        .then(function (repo) {
                            const at = repo && (repo.pushed_at || repo.updated_at);
                            if (!at) return;
                            siteUpdatedAt = at;
                            paintSiteUpdated();
                        });
                })
                .finally(function () {
                    siteUpdatedLoading = false;
                });
        }

        function syncSheetInputs(except) {
            document.querySelectorAll('#factsList [data-sheet-field]').forEach((input) => {
                if (input === except || document.activeElement === input) return;
                const field = fieldById(input.dataset.sheetField);
                if (!field) return;
                const next = sheetFieldValue(field);
                if (input.value !== next) input.value = next;
            });
        }

        function syncLinkedField(fieldId, value) {
            const shown = orbitFieldDisplay(fieldId, value);
            const orbitInput = document.getElementById('field-' + fieldId);
            if (orbitInput && document.activeElement !== orbitInput) {
                orbitInput.value = shown;
                if (typeof syncNodeFilled === 'function') syncNodeFilled(orbitInput);
            }
            if (isPlatformField(fieldId)) {
                const node = document.querySelector('.node[data-field="' + fieldId + '"]');
                if (typeof setUsernameStep === 'function') {
                    setUsernameStep(node, fieldPlatformId(fieldId), !!String(shown || '').trim());
                }
                syncSheetPlatform(fieldId);
            }
            syncSheetInputs(document.activeElement);
            if (isThumbField(fieldId)) {
                if (typeof setFieldThumb === 'function') setFieldThumb(fieldId);
            }
            if (typeof syncMapsButtons === 'function') syncMapsButtons(fieldId);
            if (fieldBase(fieldId) === 'timezone' && typeof updateTimezoneClocks === 'function') updateTimezoneClocks();
            updateHubProgress();
        }

        function refreshProfileChrome() {
            const name = subjectDisplayName();
            const nameEl = document.getElementById('subjectName');
            const nameInput = document.getElementById('subjectNameInput');
            if (nameEl && document.activeElement !== nameInput) nameEl.textContent = name;
            const hubTitle = document.getElementById('hubTitle');
            if (hubTitle) hubTitle.textContent = name === 'Anonymous' ? 'OrbINT' : name;
            const nameFind = document.getElementById('subjectFind');
            if (nameFind) {
                const named = !!String(firstValue('name') || '').trim();
                const icon = named ? DEEP_ICON : FIND_ICON;
                if (nameFind.innerHTML !== icon) nameFind.innerHTML = icon;
                nameFind.classList.toggle('ready', named);
                nameFind.setAttribute('aria-label', named ? 'Search deeper' : 'How to find this');
                nameFind.title = named ? 'Search deeper' : 'How to find this';
            }

            const filled = populatedCount();
            const completeness = document.getElementById('completenessFill');
            const coverageLabel = document.getElementById('coverageLabel');
            const caseTotal = groupsForProfile().reduce((count, group) => (
                count + group.fields.filter((id) => fieldById(id) && !hiddenFields.has(id)).length
            ), 0) || FIELDS.length;
            if (completeness) completeness.style.width = ((filled / caseTotal) * 100) + '%';
            if (coverageLabel) coverageLabel.textContent = filled + ' of ' + caseTotal + ' filed';

            const rec = Object.assign({}, emptyCaseMeta(), (profile && profile.case) || {});
            const num = document.getElementById('caseNumber');
            const offense = document.getElementById('caseOffense');
            const status = document.getElementById('caseStatus');
            const who = document.getElementById('caseInvestigator');
            if (num && document.activeElement !== num) num.value = rec.number || '';
            if (offense && document.activeElement !== offense) offense.value = rec.offense || '';
            const offensePick = document.getElementById('caseOffensePick');
            if (offensePick) offensePick.dataset.value = rec.offense || '';
            if (status && document.activeElement !== status) {
                const val = rec.status || 'open';
                status.dataset.value = val;
                status.classList.toggle('is-empty', !val);
                const lab = document.getElementById('caseStatusLabel') || status.querySelector('span');
                if (lab) lab.textContent = sheetPickLabel('status', val);
            }
            if (who && document.activeElement !== who) who.value = rec.investigator || '';

            const face = document.getElementById('targetFace');
            if (face) {
                face.classList.add('visible');
                let img = face.querySelector('img');
                const src = portraitSrc();
                if (!img) {
                    img = document.createElement('img');
                    img.alt = '';
                    face.insertBefore(img, face.firstChild);
                }
                if (img.getAttribute('src') !== src) img.src = src;
                face.setAttribute('aria-label', 'View profile photos');
            }
            if (typeof renderFaceGallery === 'function') renderFaceGallery();
            updateHubFace();

            const socialsEl = document.getElementById('profileSocials');
            if (socialsEl) socialsEl.innerHTML = '';

            const addressLines = subjectAddressLines();
            const idStack = document.getElementById('idStack');
            if (idStack) {
                if (addressLines.length) {
                    idStack.hidden = false;
                    idStack.innerHTML =
                        '<span class="id-address">' + addressLines.map(escapeHtml).join('<br>') + '</span>' +
                        mapsControlHtml('address', 'id-maps');
                } else {
                    idStack.hidden = true;
                    idStack.textContent = '';
                }
            }
        }

        function renderProfile(forceSheet) {
            refreshProfileChrome();

            const factsSection = document.getElementById('factsSection');
            const factsList = document.getElementById('factsList');
            if (factsSection) factsSection.hidden = false;
            if (factsList) {
                factsList.className = 'dossier';
                if (!forceSheet && profileSheetEditing() && factsList.querySelector('[data-sheet-field]')) {
                    syncSheetInputs(document.activeElement);
                } else {
                    factsList.innerHTML = dossierHtml();
                }
                loadSiteUpdated();
            }

            const analysisSection = document.getElementById('analysisSection');
            const analysisBox = document.getElementById('analysisBox');
            if (profile.analysis) {
                analysisSection.hidden = false;
                analysisBox.textContent = profile.analysis;
            } else if (analysisSection) {
                analysisSection.hidden = true;
                if (analysisBox) analysisBox.textContent = '';
            }
            renderLeads(activeField);
            if (typeof renderProfileRail === 'function') renderProfileRail();
            renderPeerHubs();
            if (window.OrbINTCase && typeof OrbINTCase.scheduleDatasheet === 'function') OrbINTCase.scheduleDatasheet();
            else if (window.OrbINTCase && typeof OrbINTCase.renderDatasheet === 'function') OrbINTCase.renderDatasheet();
        }

        function nextEmptyClone(sourceId) {
            const base = fieldBase(sourceId);
            if (!base) return '';
            const ids = [];
            groupsForProfile().forEach(function (group) {
                (group.fields || []).forEach(function (id) { ids.push(id); });
            });
            const at = ids.indexOf(sourceId);
            if (at < 0) return '';
            let i;
            for (i = at + 1; i < ids.length; i++) {
                if (fieldBase(ids[i]) !== base) break;
                if (typeof hiddenFields !== 'undefined' && hiddenFields.has(ids[i])) continue;
                const field = fieldById(ids[i]);
                if (!field || skipSheetField(field)) continue;
                const fact = latestFact(ids[i]);
                if (!String((fact && fact.value) || '').trim()) return ids[i];
            }
            return '';
        }

        function focusSheetField(id) {
            if (!id) return;
            activeField = id;
            const pick = document.querySelector('#factsList [data-sheet-platform="' + id + '"]');
            const input = document.querySelector('#factsList [data-sheet-field="' + id + '"]');
            const el = (input && !input.hidden) ? input : (pick && !pick.hidden ? pick : input || pick);
            if (!el) return;
            requestAnimationFrame(function () {
                el.focus();
                const item = el.closest('.fact-item');
                if (item && item.scrollIntoView) item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            });
        }

        function commitSheetEnter(fieldId) {
            if (window.OrbINTShare && OrbINTShare.readonly && OrbINTShare.readonly()) return;
            const field = fieldById(fieldId);
            if (!field || skipSheetField(field)) return;
            if (fieldBase(fieldId) === 'notes') return;
            const fact = latestFact(fieldId);
            if (!String((fact && fact.value) || '').trim()) return;
            const emptyId = nextEmptyClone(fieldId);
            if (emptyId) {
                focusSheetField(emptyId);
                return;
            }
            if (typeof duplicateField === 'function') duplicateField(fieldId, { focus: 'sheet' });
        }

        function beginNameEdit() {
            const row = document.getElementById('subjectNameRow');
            const input = document.getElementById('subjectNameInput');
            if (!row || !input) return;
            row.classList.add('editing');
            input.value = firstValue('name');
            input.hidden = false;
            requestAnimationFrame(function () {
                input.focus();
                input.select();
            });
        }

        function endNameEdit(save) {
            const row = document.getElementById('subjectNameRow');
            const input = document.getElementById('subjectNameInput');
            const nameEl = document.getElementById('subjectName');
            if (!row || !input || !row.classList.contains('editing')) return;
            if (save) writeLatestFact('name', input.value, extrasFromInput('name', input.value));
            row.classList.remove('editing');
            if (nameEl) nameEl.textContent = subjectDisplayName();
        }

        let photoUploadFor = '';

        function pickProfilePhoto(profileId) {
            photoUploadFor = profileId || (profileLibrary && profileLibrary.activeId) || '';
            const sheetInput = document.getElementById('photosFile');
            const input = (typeof photosSheetOpen === 'function' && photosSheetOpen() && sheetInput)
                ? sheetInput
                : document.getElementById('profilePhotoFile');
            if (input) input.click();
        }

        function applyPhotoToProfile(profileId, file) {
            if (!isImageFile(file)) return;
            const activeId = profileLibrary && profileLibrary.activeId;
            if (!profileId || profileId === activeId) {
                applyProfilePhotoFile(file);
                return;
            }
            const entry = profileLibrary && profileLibrary.items[profileId];
            if (!entry) return;
            imageVersionsFromFile(file).then((versions) => {
                const fact = {
                    value: file.name + ' (' + Math.round(file.size / 1024) + ' KB)',
                    addedAt: new Date().toISOString(),
                    kind: 'image'
                };
                if (versions) {
                    if (versions.preview) fact.preview = versions.preview;
                    if (versions.media) fact.media = versions.media;
                    if (versions.blur) fact.blur = versions.blur;
                    if (versions.kind) fact.kind = versions.kind;
                }
                entry.facts = entry.facts || {};
                entry.facts.image = [fact];
                saveProfileEntry(entry);
                if (typeof renderPeerHubs === 'function') renderPeerHubs();
                if (typeof renderProfileRail === 'function') renderProfileRail();
            });
        }

        function finishProfilePhotos(keepIndex) {
            saveProfile();
            const input = document.getElementById('field-image');
            const primary = primaryImageFact();
            if (input && document.activeElement !== input) {
                input.value = (primary && primary.value) || firstValue('image');
                if (typeof syncNodeFilled === 'function') syncNodeFilled(input);
            }
            if (typeof setFieldThumb === 'function') setFieldThumb('image');
            renderProfile();
            renderNodes();
            recordHistory(true);
            if (typeof photosSheetOpen === 'function' && photosSheetOpen()) {
                const total = imageGalleryItems().length;
                if (!keepIndex) mediaGallery.index = Math.max(0, total - 1);
                else if (mediaGallery.index >= total) mediaGallery.index = Math.max(0, total - 1);
                renderPhotosSheet();
            }
        }

        function applyProfilePhotoUrl(url) {
            const clean = String(url || '').trim();
            if (!clean) return false;
            if (!looksLikeUrl(clean) && !looksLikeImageSrc(clean)) return false;
            profile.facts.image = profile.facts.image || [];
            const key = clean.toLowerCase();
            if (profile.facts.image.some((item) => item && String(item.value || '').toLowerCase() === key)) return true;
            if (isNullField('image')) setFieldNull('image', false, true);
            profile.facts.image.push({
                value: clean,
                addedAt: new Date().toISOString(),
                kind: 'image',
                media: clean,
                preview: clean
            });
            finishProfilePhotos();
            return true;
        }

        function applyProfilePhotoFile(file) {
            return applyProfilePhotoFiles([file]);
        }

        function isImageFile(file) {
            if (!file) return false;
            if (String(file.type || '').indexOf('image/') === 0) return true;
            return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(String(file.name || ''));
        }

        function cloneInputFile(file) {
            if (!file) return file;
            try {
                return new File([file], file.name || 'photo', {
                    type: file.type || 'application/octet-stream',
                    lastModified: file.lastModified
                });
            } catch (error) {
                try { return file.slice(0, file.size, file.type || 'application/octet-stream'); } catch (retry) { return file; }
            }
        }

        function takeInputFiles(input) {
            const files = Array.from((input && input.files) || []).map(cloneInputFile);
            if (input) input.value = '';
            return files;
        }

        function applyProfilePhotoFiles(files) {
            const list = Array.from(files || []).filter(isImageFile);
            if (!list.length) return Promise.resolve();
            return Promise.all(list.map((file) =>
                imageVersionsFromFile(file).then((versions) => ({ file: file, versions: versions }))
            )).then((results) => {
                profile.facts.image = profile.facts.image || [];
                results.forEach((entry) => {
                    const clean = entry.file.name + ' (' + Math.round(entry.file.size / 1024) + ' KB)';
                    const same = profile.facts.image.some((item) => item && String(item.value || '').toLowerCase() === clean.toLowerCase());
                    if (same) return;
                    const fact = { value: clean, addedAt: new Date().toISOString(), kind: 'image' };
                    if (entry.versions) {
                        if (entry.versions.preview) fact.preview = entry.versions.preview;
                        if (entry.versions.media) fact.media = entry.versions.media;
                        if (entry.versions.kind) fact.kind = entry.versions.kind;
                    }
                    if (isNullField('image')) setFieldNull('image', false, true);
                    profile.facts.image.push(fact);
                });
                finishProfilePhotos();
            });
        }

