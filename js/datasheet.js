/* Datasheet page */

    let dsLiveTimer = 0;
    let dsMarkup = '';

    function renderDatasheet() {
        const view = $('datasheetView');
        if (!view) return;
        const html = reportPreviewMarkup();
        if (html === dsMarkup && view.firstChild) {
            sizeDatasheet();
            return;
        }
        dsMarkup = html;
        const y = view.scrollTop;
        view.innerHTML = html;
        sizeDatasheet();
        view.scrollTop = y;
    }

    function scheduleDatasheet() {
        if (page !== 'datasheet') return;
        clearTimeout(dsLiveTimer);
        dsLiveTimer = setTimeout(function () {
            dsLiveTimer = 0;
            renderDatasheet();
        }, 60);
    }
