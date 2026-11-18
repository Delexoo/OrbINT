/* Orbit node markup */

        function createNodes() {
            if (!mapCanvas) return;
            mapCanvas.querySelectorAll('.node').forEach((node) => {
                const id = node.dataset.field;
                if (id === 'url' || (id && id.indexOf('url-') === 0) || (id && !fieldById(id))) node.remove();
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
                            '<span class="tz-pick empty"><span class="tz-abbr">Zone</span><button class="tz-trigger" type="button" aria-label="Choose timezone" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="tz-clock" data-tz-clock="' + field.id + '" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'countrycode') {
                    node.className = 'node cc-node';
                    node.innerHTML =
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<span class="cc-pick empty"><span class="cc-flag" hidden></span><span class="cc-abbr">Code</span><button class="cc-trigger" type="button" aria-label="Choose country code" aria-haspopup="listbox"></button></span>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<span class="cc-name" hidden></span>' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (base === 'image') {
                    node.className = 'node image-node';
                    node.innerHTML =
                        '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="Open ' + escapeHtml(field.label) + '"></button>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="image-add" type="button" data-photos-open aria-label="Add photos">Add</button>' +
                            '<input id="field-' + field.id + '" type="hidden" value="">' +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else if (isPlatformField(field.id)) {
                    node.classList.add('platform-node');
                    if (isSecretField(field.id)) node.classList.add('secret-node');
                    node.innerHTML =
                        '<span class="platform-icon" hidden></span>' +
                        '<div class="node-copy">' +
                            '<label>' + escapeHtml(field.label) + '</label>' +
                            '<button class="platform-trigger" type="button">Select site</button>' +
                            '<input id="field-' + field.id + '" type="' + (isSecretField(field.id) ? 'password' : 'text') + '" placeholder="' + escapeHtml(platformFieldPlaceholder(field.id)) + '" spellcheck="false" autocomplete="off" hidden>' +
                            (isSecretField(field.id) ? secretRevealBtnHtml(field.id) : '') +
                            '<button class="search-btn" type="button" data-search="' + field.id + '" aria-label="How to find this">' + FIND_ICON + '</button>' +
                            '<button class="node-clear" type="button" data-clear="' + field.id + '" aria-label="Remove">×</button>' +
                        '</div>';
                } else {
                    const email = isEmailField(field.id);
                    const secret = isSecretField(field.id);
                    if (email) node.classList.add('email-node');
                    if (secret) node.classList.add('secret-node');
                    node.innerHTML =
                        (email ? '<span class="platform-icon" hidden></span>' : '') +
                        ((base === 'image' || base === 'audio' || base === 'ip' || base === 'address')
                            ? '<button class="media-thumb" type="button" data-open-media="' + field.id + '" hidden aria-label="' + (base === 'address' ? 'Open in Google Maps' : 'Open ' + escapeHtml(field.label)) + '"></button>'
                            : '') +
                        '<div class="node-copy">' +
                            '<label for="field-' + field.id + '">' + escapeHtml(field.label) + '</label>' +
                            '<input id="field-' + field.id + '" type="' + (secret ? 'password' : 'text') + '" inputmode="' + (base === 'phone' ? 'tel' : 'text') + '" placeholder="' + escapeHtml(field.placeholder) + '" spellcheck="false" autocomplete="off">' +
                            (secret ? secretRevealBtnHtml(field.id) : '') +
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
            fillCountryCodeSelects();
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
            if (input) input.placeholder = nulled ? 'Missing' : (input.dataset.ph || '');
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
                const fact = fieldBase(field.id) === 'image' ? (primaryImageFact() || latestFact(field.id)) : latestFact(field.id);
                if (input && document.activeElement !== input) {
                    const next = fact ? (fieldBase(field.id) === 'phone' ? formatPhoneNumber(fact.value) : fact.value) : '';
                    if (fieldBase(field.id) === 'timezone') input.value = resolveTimezoneValue(next);
                    else if (fieldBase(field.id) === 'countrycode') input.value = resolveCountryCodeValue(next);
                    else input.value = next;
                }
                const filled = syncNodeFilled(input);
                node.classList.toggle('active', activeField === field.id);

                if (isPlatformField(field.id)) {
                    setUsernameStep(node, fieldPlatformId(field.id), filled);
                }

                if (fieldBase(field.id) === 'timezone') {
                    syncTimezoneTrigger(node);
                    updateTimezoneClocks();
                }

                if (fieldBase(field.id) === 'countrycode') {
                    syncCountryCodeTrigger(node);
                }

                if (isThumbField(field.id)) {
                    setFieldThumb(field.id);
                }

                if (isSecretField(field.id)) syncSecretNode(node);
            });
            positionNodes();
        }

