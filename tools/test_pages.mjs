const pages = ['orbit', 'timeline', 'whiteboard', 'harvester', 'datasheet'];

async function cdp(ws, method, params = {}, sessionId) {
    const id = cdp._n = (cdp._n || 0) + 1;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout ' + method)), 15000);
        ws._pending.set(id, (err, result) => {
            clearTimeout(t);
            if (err) reject(err);
            else resolve(result);
        });
        ws.send(JSON.stringify(msg));
    });
}

async function main() {
    const list = await fetch('http://127.0.0.1:9224/json/list').then((r) => r.json());
    const target = list.find((t) => t.type === 'page' && /8766/.test(t.url)) || list.find((t) => t.type === 'page');
    if (!target) throw new Error('no page target ' + JSON.stringify(list));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws._pending = new Map();
    await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve);
        ws.addEventListener('error', reject);
    });
    ws.addEventListener('message', (ev) => {
        const data = JSON.parse(ev.data);
        if (data.id && ws._pending.has(data.id)) {
            const cb = ws._pending.get(data.id);
            ws._pending.delete(data.id);
            cb(data.error, data.result);
        }
    });

    await cdp(ws, 'Runtime.enable');
    await cdp(ws, 'Page.enable');
    await new Promise((r) => setTimeout(r, 2500));

    const evalJs = async (expression) => {
        const result = await cdp(ws, 'Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (result.exceptionDetails) {
            throw new Error(result.exceptionDetails.text || JSON.stringify(result.exceptionDetails));
        }
        return result.result.value;
    };

    const boot = await evalJs(`({
        page: document.body.getAttribute('data-page'),
        case: typeof window.OrbINTCase,
        pages: window.OrbINTCase && OrbINTCase.pages && OrbINTCase.pages.map(p => p.id),
        tabs: [...document.querySelectorAll('#pageSwitch [data-page]')].map(b => b.getAttribute('data-page')),
        hub: !!document.getElementById('hub'),
        timelineBound: document.getElementById('timelineView') && timelineView.dataset.bound,
        boardTools: document.querySelectorAll('.board-toolbar [data-board-tool]').length,
        datasheet: !!document.getElementById('datasheetBody'),
        css: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    })`);
    console.log('BOOT', JSON.stringify(boot, null, 2));
    if (boot.case !== 'object') throw new Error('OrbINTCase missing');
    if (boot.css !== '#09090b') throw new Error('base CSS tokens missing: ' + boot.css);
    if (boot.tabs.join(',') !== pages.join(',')) throw new Error('tabs ' + boot.tabs);

    const results = {};
    for (const id of pages) {
        const info = await evalJs(`(function(){
            OrbINTCase.setPage(${JSON.stringify(id)});
            const body = document.body.getAttribute('data-page');
            const pane = ${JSON.stringify(id)} === 'orbit' ? document.getElementById('mapStage') : document.getElementById('page-' + ${JSON.stringify(id)});
            const hidden = pane ? pane.hidden : null;
            const display = pane ? getComputedStyle(pane).display : null;
            return { body, hidden, display, current: document.querySelector('#pageSwitch [aria-current="page"]').getAttribute('data-page') };
        })()`);
        results[id] = info;
        console.log('PAGE', id, JSON.stringify(info));
        if (info.body !== id) throw new Error('setPage failed for ' + id);
        if (info.current !== id) throw new Error('tab not current for ' + id);
        if (info.hidden === true) throw new Error('pane hidden for ' + id);
    }
    const extra = await evalJs(`(async function(){
        const scripts = [...document.scripts].map(s => s.src).join(' ');
        const before = typeof window.OSINT_TOOLKIT;
        if (typeof ensureToolkitCatalog === 'function') await ensureToolkitCatalog();
        else {
            await new Promise(function(resolve){
                const s = document.createElement('script');
                s.src = 'osint-tools.js?v=125';
                s.onload = resolve;
                s.onerror = resolve;
                document.head.appendChild(s);
            });
        }
        return {
            hadToolsScript: /osint-tools/.test(scripts),
            before: before,
            after: typeof window.OSINT_TOOLKIT,
            cats: window.OSINT_TOOLKIT && OSINT_TOOLKIT.categories && OSINT_TOOLKIT.categories.length,
            report: typeof OrbINTCase.downloadReport,
            settings: !!(document.getElementById('settingsSheet') && document.getElementById('addSheet'))
        };
    })()`);
    console.log('EXTRA', JSON.stringify(extra));
    if (extra.hadToolsScript) throw new Error('toolkit catalog should not load on boot');
    if (extra.after !== 'object' || !(extra.cats > 0)) throw new Error('lazy toolkit failed');
    if (extra.report !== 'function') throw new Error('downloadReport missing');
    if (!extra.settings) throw new Error('chrome sheets missing');
    console.log('ALL_PAGES_OK');
    ws.close();
}

main().catch((err) => {
    console.error('FAIL', err);
    process.exit(1);
});
