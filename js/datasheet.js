/* Case File page */

    let dsLiveTimer = 0;
    let dsMarkup = '';
    let dsRevealed = new Set();
    let dsHidden = new Set();
    let dsRevealAll = false;

    function isRedactOpen(key) {
        if (dsRevealAll) return !dsHidden.has(key || '');
        return dsRevealed.has(key || '');
    }

    function paintDatasheetSpoilers() {
        const label = dsRevealAll ? 'Hide redacted' : 'Show redacted';
        const btn = $('dockSpoilers');
        if (btn) {
            btn.classList.toggle('is-on', !!dsRevealAll);
            btn.setAttribute('aria-pressed', dsRevealAll ? 'true' : 'false');
            btn.setAttribute('data-tip', label);
            btn.setAttribute('aria-label', label);
        }
        const phone = $('phoneSpoilers');
        if (phone) {
            phone.hidden = page !== 'datasheet';
            phone.textContent = label;
        }
    }

    function applyDatasheetSpoilers() {
        const view = $('datasheetView');
        if (view) {
            view.querySelectorAll('.ds-redact').forEach(function (btn) {
                const key = btn.getAttribute('data-redact') || '';
                btn.classList.toggle('is-open', isRedactOpen(key));
            });
        }
        paintDatasheetSpoilers();
    }

    function toggleDatasheetSpoilers() {
        dsRevealAll = !dsRevealAll;
        dsRevealed = new Set();
        dsHidden = new Set();
        applyDatasheetSpoilers();
        dsMarkup = '';
        renderDatasheet();
    }

    function bindDatasheet() {
        const view = $('datasheetView');
        if (view && !view.dataset.redactBound) {
            view.dataset.redactBound = '1';
            view.addEventListener('click', function (event) {
                const btn = event.target.closest('.ds-redact');
                if (!btn) return;
                event.preventDefault();
                const key = btn.getAttribute('data-redact') || '';
                const on = !btn.classList.contains('is-open');
                btn.classList.toggle('is-open', on);
                if (dsRevealAll) {
                    if (on) dsHidden.delete(key);
                    else dsHidden.add(key);
                } else if (on) dsRevealed.add(key);
                else dsRevealed.delete(key);
            });
        }
        const dockBtn = $('dockSpoilers');
        if (dockBtn && !dockBtn.dataset.boundSpoilers) {
            dockBtn.dataset.boundSpoilers = '1';
            dockBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        const phoneBtn = $('phoneSpoilers');
        if (phoneBtn && !phoneBtn.dataset.boundSpoilers) {
            phoneBtn.dataset.boundSpoilers = '1';
            phoneBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleDatasheetSpoilers();
            });
        }
        paintDatasheetSpoilers();
    }

    function renderDatasheet() {
        const view = $('datasheetView');
        if (!view) return;
        bindDatasheet();
        const html = reportPreviewMarkup();
        if (html === dsMarkup && view.firstChild) {
            sizeDatasheet();
            applyDatasheetSpoilers();
            return;
        }
        dsMarkup = html;
        const y = view.scrollTop;
        view.innerHTML = html;
        applyDatasheetSpoilers();
        sizeDatasheet();
        view.scrollTop = y;
        requestAnimationFrame(function () {
            sizeDatasheet();
            view.scrollTop = y;
        });
    }

    function scheduleDatasheet() {
        if (page !== 'datasheet') return;
        clearTimeout(dsLiveTimer);
        dsLiveTimer = setTimeout(function () {
            dsLiveTimer = 0;
            renderDatasheet();
        }, 60);
    }
