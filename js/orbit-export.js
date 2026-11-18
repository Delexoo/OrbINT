/* Case export, share QR, install, and settings sheets */
        function serializeProfile() {
            return FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return platform ? platform.label + ' ' + item.value : item.value;
                }).join(', ');
                return values ? field.label + ': ' + values : '';
            }).filter(Boolean).join('\n') || 'No facts yet.';
        }

        function caseText() {
            return '# OSINT Subject Profile\n\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\n## Analyst notes\n\n' + profile.analysis : '');
        }

        function casePlainText() {
            return 'OrbINT target\n' +
                'Subject: ' + (firstValue('name') || 'Anonymous') + '\n' +
                'Updated: ' + new Date().toLocaleString() + '\n\n' +
                serializeProfile() +
                (profile.analysis ? '\n\nNotes\n' + profile.analysis : '');
        }

        function caseHtml() {
            const subject = firstValue('name') || 'Anonymous';
            const rows = FIELDS.map((field) => {
                const values = (profile.facts[field.id] || []).map((item) => {
                    const platform = item.platform && platformById(item.platform);
                    return escapeHtml(platform ? platform.label + ' ' + item.value : item.value);
                }).join(', ');
                if (!values) return '';
                return '<tr><th>' + escapeHtml(field.label) + '</th><td>' + values + '</td></tr>';
            }).filter(Boolean).join('');
            return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' +
                escapeHtml(subject) + ' — OrbINT</title><style>' +
                'body{font:16px/1.5 Segoe UI,sans-serif;background:#09090b;color:#fafafa;padding:32px;}' +
                'h1{font-size:28px;margin:0 0 8px;}p{color:#a1a1aa;margin:0 0 24px;}' +
                'table{width:100%;border-collapse:collapse;}th,td{padding:8px 0;border-bottom:1px solid #27272a;text-align:left;vertical-align:top;}' +
                'th{width:140px;color:#a1a1aa;font-weight:500;}pre{white-space:pre-wrap;}</style></head><body>' +
                '<h1>' + escapeHtml(subject) + '</h1>' +
                '<p>Updated ' + escapeHtml(new Date().toLocaleString()) + '</p>' +
                (rows ? '<table>' + rows + '</table>' : '<p>No facts yet.</p>') +
                (profile.analysis ? '<h2>Notes</h2><pre>' + escapeHtml(profile.analysis) + '</pre>' : '') +
                '</body></html>';
        }

        function downloadBlob(name, type, text) {
            const blob = new Blob([text], { type: type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        function caseFileName(ext) {
            const name = (firstValue('name') || 'case').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            return 'orbint-' + (name || 'case') + '.' + ext;
        }

        function closeExportMenu() {
            const menu = document.getElementById('exportMenu');
            if (menu) menu.hidden = true;
            document.getElementById('dock').classList.remove('picking-export');
        }

        function siteShareUrl() {
            const href = String((window.location && window.location.href) || '').split('#')[0];
            if (/^https?:\/\//i.test(href) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(href)) {
                return href.replace(/\/index\.html$/i, '/');
            }
            return 'https://orbint.net/';
        }

        const QR_EXP = new Uint8Array(512);
        const QR_LOG = new Uint8Array(256);
        (function () {
            let x = 1;
            for (let i = 0; i < 255; i++) {
                QR_EXP[i] = x;
                QR_LOG[x] = i;
                x <<= 1;
                if (x & 256) x ^= 0x11d;
            }
            for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
        })();

        function qrMul(a, b) {
            return a && b ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0;
        }

        const QR_M = {
            1: { ec: 10, g1: [1, 16], g2: [0, 0] },
            2: { ec: 16, g1: [1, 28], g2: [0, 0] },
            3: { ec: 26, g1: [1, 44], g2: [0, 0] },
            4: { ec: 18, g1: [2, 32], g2: [0, 0] },
            5: { ec: 24, g1: [2, 43], g2: [0, 0] },
            6: { ec: 16, g1: [4, 27], g2: [0, 0] },
            7: { ec: 18, g1: [4, 31], g2: [0, 0] },
            8: { ec: 22, g1: [2, 38], g2: [2, 39] },
            9: { ec: 22, g1: [3, 36], g2: [2, 37] },
            10: { ec: 26, g1: [4, 43], g2: [1, 44] }
        };
        const QR_ALIGN = { 1: [], 2: [18], 3: [22], 4: [26], 5: [30], 6: [34], 7: [22, 38], 8: [24, 42], 9: [26, 46], 10: [28, 50] };
        const QR_REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
        const QR_VERSION_BITS = { 7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3 };

        function qrPolyMul(a, b) {
            const out = new Array(a.length + b.length - 1).fill(0);
            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) out[i + j] ^= qrMul(a[i], b[j]);
            }
            return out;
        }

        function qrRsEncode(data, ec) {
            let gen = [1];
            for (let i = 0; i < ec; i++) gen = qrPolyMul(gen, [1, QR_EXP[i]]);
            const rest = data.concat(new Array(ec).fill(0));
            for (let i = 0; i < data.length; i++) {
                const coef = rest[i];
                if (!coef) continue;
                for (let j = 0; j < gen.length; j++) rest[i + j] ^= qrMul(gen[j], coef);
            }
            return rest.slice(data.length);
        }

        function qrBitsToBytes(bits) {
            const bytes = [];
            for (let i = 0; i < bits.length; i += 8) {
                let v = 0;
                for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i + j] || 0);
                bytes.push(v);
            }
            return bytes;
        }

        function qrEncode(text) {
            const bytes = Array.from(new TextEncoder().encode(text));
            let version = 0;
            for (let v = 1; v <= 10; v++) {
                const spec = QR_M[v];
                const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
                const need = 4 + (v >= 10 ? 16 : 8) + bytes.length * 8 + 4;
                if (need <= dataCw * 8) { version = v; break; }
            }
            if (!version) return null;
            const spec = QR_M[version];
            const dataCw = spec.g1[0] * spec.g1[1] + spec.g2[0] * spec.g2[1];
            const bits = [];
            const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
            put(0b0100, 4);
            put(bytes.length, version >= 10 ? 16 : 8);
            bytes.forEach((b) => put(b, 8));
            const maxBits = dataCw * 8;
            put(0, Math.min(4, maxBits - bits.length));
            while (bits.length % 8) bits.push(0);
            const pad = [0xEC, 0x11];
            let pi = 0;
            while (bits.length + 8 <= maxBits) {
                put(pad[pi % 2], 8);
                pi++;
            }
            const codewords = qrBitsToBytes(bits);
            while (codewords.length < dataCw) codewords.push(0);
            codewords.length = dataCw;
            const blocks = [];
            let offset = 0;
            const groups = [spec.g1, spec.g2];
            groups.forEach((g) => {
                for (let i = 0; i < g[0]; i++) {
                    const d = codewords.slice(offset, offset + g[1]);
                    offset += g[1];
                    blocks.push({ d: d, e: qrRsEncode(d, spec.ec) });
                }
            });
            const interleaved = [];
            const maxD = Math.max(spec.g1[1], spec.g2[1]);
            for (let i = 0; i < maxD; i++) {
                blocks.forEach((b) => { if (i < b.d.length) interleaved.push(b.d[i]); });
            }
            for (let i = 0; i < spec.ec; i++) {
                blocks.forEach((b) => interleaved.push(b.e[i]));
            }
            const outBits = [];
            interleaved.forEach((b) => { for (let i = 7; i >= 0; i--) outBits.push((b >> i) & 1); });
            for (let i = 0; i < QR_REMAINDER[version]; i++) outBits.push(0);
            return { version: version, bits: outBits };
        }

        function qrFillFinder(grid, reserved, r, c) {
            for (let y = -1; y <= 7; y++) {
                for (let x = -1; x <= 7; x++) {
                    const rr = r + y;
                    const cc = c + x;
                    if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid.length) continue;
                    const dark = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
                    grid[rr][cc] = dark ? 1 : 0;
                    reserved[rr][cc] = 1;
                }
            }
        }

        function qrFillAlign(grid, reserved, cy, cx) {
            for (let y = -2; y <= 2; y++) {
                for (let x = -2; x <= 2; x++) {
                    const ring = Math.max(Math.abs(x), Math.abs(y));
                    grid[cy + y][cx + x] = (ring === 0 || ring === 2) ? 1 : 0;
                    reserved[cy + y][cx + x] = 1;
                }
            }
        }

        function qrFormatBits(mask) {
            const data = mask & 7;
            let rem = data;
            for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
            return ((data << 10) | rem) ^ 0x5412;
        }

        function qrSetFormat(grid, reserved, bits, size) {
            const set = (x, y, i) => {
                grid[y][x] = (bits >> i) & 1;
                reserved[y][x] = 1;
            };
            for (let i = 0; i <= 5; i++) set(8, i, i);
            set(8, 7, 6);
            set(8, 8, 7);
            set(7, 8, 8);
            for (let i = 9; i < 15; i++) set(14 - i, 8, i);
            for (let i = 0; i < 8; i++) set(size - 1 - i, 8, i);
            for (let i = 8; i < 15; i++) set(8, size - 15 + i, i);
            grid[size - 8][8] = 1;
            reserved[size - 8][8] = 1;
        }

        function qrMaskBit(mask, r, c) {
            if (mask === 0) return ((r + c) & 1) === 0;
            if (mask === 1) return (r & 1) === 0;
            if (mask === 2) return c % 3 === 0;
            if (mask === 3) return (r + c) % 3 === 0;
            if (mask === 4) return (((r >> 1) + Math.floor(c / 3)) & 1) === 0;
            if (mask === 5) return (r * c) % 2 + (r * c) % 3 === 0;
            if (mask === 6) return (((r * c) % 2 + (r * c) % 3) & 1) === 0;
            return (((r + c) % 2 + (r * c) % 3) & 1) === 0;
        }

        function qrPenalty(grid) {
            const size = grid.length;
            let score = 0;
            for (let r = 0; r < size; r++) {
                let run = 1;
                for (let c = 1; c <= size; c++) {
                    if (c < size && grid[r][c] === grid[r][c - 1]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let c = 0; c < size; c++) {
                let run = 1;
                for (let r = 1; r <= size; r++) {
                    if (r < size && grid[r][c] === grid[r - 1][c]) run++;
                    else {
                        if (run >= 5) score += 3 + (run - 5);
                        run = 1;
                    }
                }
            }
            for (let r = 0; r < size - 1; r++) {
                for (let c = 0; c < size - 1; c++) {
                    const v = grid[r][c];
                    if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
                }
            }
            const pattern = function (line) {
                let s = 0;
                const str = line.join('');
                let i = 0;
                while ((i = str.indexOf('10111010000', i)) >= 0) { s += 40; i++; }
                i = 0;
                while ((i = str.indexOf('00001011101', i)) >= 0) { s += 40; i++; }
                return s;
            };
            for (let r = 0; r < size; r++) score += pattern(grid[r]);
            for (let c = 0; c < size; c++) {
                const col = [];
                for (let r = 0; r < size; r++) col.push(grid[r][c]);
                score += pattern(col);
            }
            let dark = 0;
            grid.forEach((row) => row.forEach((v) => { dark += v; }));
            score += Math.abs(Math.floor(dark * 100 / (size * size) / 5) - 10) * 10;
            return score;
        }

        function qrMatrix(text) {
            const encoded = qrEncode(text);
            if (!encoded) return null;
            const size = 21 + 4 * (encoded.version - 1);
            const base = Array.from({ length: size }, () => new Array(size).fill(0));
            const reserved = Array.from({ length: size }, () => new Array(size).fill(0));
            qrFillFinder(base, reserved, 0, 0);
            qrFillFinder(base, reserved, 0, size - 7);
            qrFillFinder(base, reserved, size - 7, 0);
            const pos = [6].concat(QR_ALIGN[encoded.version]);
            pos.forEach((r) => {
                pos.forEach((c) => {
                    if ((r < 9 && c < 9) || (r < 9 && c > size - 10) || (r > size - 10 && c < 9)) return;
                    qrFillAlign(base, reserved, r, c);
                });
            });
            for (let i = 8; i < size - 8; i++) {
                base[6][i] = 1 - (i & 1);
                base[i][6] = 1 - (i & 1);
                reserved[6][i] = 1;
                reserved[i][6] = 1;
            }
            reserved[size - 8][8] = 1;
            base[size - 8][8] = 1;
            if (encoded.version >= 7) {
                const vb = QR_VERSION_BITS[encoded.version];
                let k = 0;
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 3; j++) {
                        const bit = (vb >> k) & 1;
                        base[size - 11 + j][i] = bit;
                        base[i][size - 11 + j] = bit;
                        reserved[size - 11 + j][i] = 1;
                        reserved[i][size - 11 + j] = 1;
                        k++;
                    }
                }
            }
            for (let i = 0; i < 9; i++) {
                if (i !== 6) { reserved[8][i] = 1; reserved[i][8] = 1; }
            }
            reserved[8][7] = 1;
            reserved[7][8] = 1;
            reserved[8][8] = 1;
            for (let i = 0; i < 8; i++) reserved[size - 1 - i][8] = 1;
            for (let i = 0; i < 8; i++) reserved[8][size - 1 - i] = 1;

            let best = null;
            let bestScore = Infinity;
            for (let mask = 0; mask < 8; mask++) {
                const grid = base.map((row) => row.slice());
                const rec = reserved.map((row) => row.slice());
                let bit = 0;
                let upward = true;
                for (let col = size - 1; col > 0; col -= 2) {
                    if (col === 6) col--;
                    for (let i = 0; i < size; i++) {
                        const row = upward ? size - 1 - i : i;
                        for (let dc = 0; dc < 2; dc++) {
                            const c = col - dc;
                            if (rec[row][c]) continue;
                            const v = encoded.bits[bit] || 0;
                            grid[row][c] = v ^ (qrMaskBit(mask, row, c) ? 1 : 0);
                            bit++;
                        }
                    }
                    upward = !upward;
                }
                qrSetFormat(grid, rec, qrFormatBits(mask), size);
                const score = qrPenalty(grid);
                if (score < bestScore) {
                    bestScore = score;
                    best = grid;
                }
            }
            return best;
        }

        function drawShareQr(text) {
            const canvas = document.getElementById('shareQr');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const matrix = qrMatrix(text);
            const cssTarget = 232;
            if (!matrix) {
                canvas.width = cssTarget;
                canvas.height = cssTarget;
                canvas.style.width = cssTarget + 'px';
                canvas.style.height = 'auto';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, cssTarget, cssTarget);
                return;
            }
            const quiet = 4;
            const dim = matrix.length + quiet * 2;
            const moduleCss = Math.max(5, Math.round(cssTarget / dim));
            const css = dim * moduleCss;
            const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
            const module = moduleCss * dpr;
            const px = dim * module;
            canvas.width = px;
            canvas.height = px;
            canvas.style.width = css + 'px';
            canvas.style.height = 'auto';
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, px, px);
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            for (let r = 0; r < matrix.length; r++) {
                for (let c = 0; c < matrix[r].length; c++) {
                    if (!matrix[r][c]) continue;
                    ctx.rect((c + quiet) * module, (r + quiet) * module, module, module);
                }
            }
            ctx.fill();
        }

        function closeShare() {
            const sheet = document.getElementById('shareSheet');
            hideSheet(sheet);
            const dock = document.getElementById('dock');
            if (dock) dock.classList.remove('picking-share');
        }

        function openShare() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeHelp();
            closeInstall();
            closeAddField();
            closeToolkit();
            const sheet = document.getElementById('shareSheet');
            const urlEl = document.getElementById('shareUrl');
            const copyBtn = document.getElementById('shareCopy');
            if (!sheet) return;
            const url = siteShareUrl();
            if (urlEl) {
                urlEl.textContent = url;
                urlEl.title = url;
            }
            if (copyBtn) copyBtn.textContent = 'Copy';
            const nativeBtn = document.getElementById('shareNative');
            if (nativeBtn) nativeBtn.hidden = !navigator.share;
            if (window.OrbINTShare && typeof OrbINTShare.paint === 'function') OrbINTShare.paint();
            const viewEl = document.getElementById('shareViewUrl');
            const sessionUrl = viewEl && /^https?:/i.test(String(viewEl.textContent || '').trim())
                ? String(viewEl.textContent).trim()
                : url;
            drawShareQr(sessionUrl);
            showSheet(sheet);
            document.getElementById('dock').classList.add('picking-share');
        }

        let deferredInstallPrompt = null;

        function isAppInstalled() {
            if (window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches) return true;
            if (window.navigator.standalone) return true;
            return false;
        }

        function installDevice() {
            const ua = navigator.userAgent || '';
            const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const android = /Android/.test(ua);
            const mac = /Mac OS X|Macintosh/.test(ua) && !iOS;
            const win = /Windows/.test(ua);
            const chrome = /Chrome|CriOS|Edg|EdgiOS|OPR|Brave/i.test(ua) && !/iPhone|iPad|iPod/.test(ua);
            const safari = /Safari/.test(ua) && !/Chrome|CriOS|Android|Edg|OPR|Firefox/i.test(ua);
            return { iOS: iOS, android: android, mac: mac, win: win, chrome: chrome, safari: safari };
        }

        function installStepsHtml() {
            const d = installDevice();
            let steps = [];
            if (d.iOS) {
                steps = [
                    'Tap the Share button in Safari.',
                    'Scroll and tap Add to Home Screen.',
                    'Tap Add. OrbINT appears on your home screen.'
                ];
            } else if (d.android) {
                steps = [
                    'Tap Install in this window, or open the browser menu.',
                    'Choose Install app or Add to Home screen.',
                    'Confirm. OrbINT opens from your app drawer.'
                ];
            } else if (d.mac && d.safari) {
                steps = [
                    'Open the File menu in Safari, or the Share button.',
                    'Choose Add to Dock.',
                    'OrbINT stays in the Dock and Launchpad like any Mac app.'
                ];
            } else if (d.win || d.mac || d.chrome) {
                steps = [
                    'Click Install in this window, or the install icon in the address bar.',
                    'Confirm the prompt.',
                    'OrbINT opens in its own window from the Start menu, Dock, or desktop.'
                ];
            } else {
                steps = [
                    'Open this site in Chrome, Edge, or Safari.',
                    'Use Install in this window, or Add to Home Screen / Add to Dock from the browser menu.',
                    'OrbINT then launches like an app on this device.'
                ];
            }
            return steps.map(function (text, i) {
                return '<li><b>' + (i + 1) + '</b><span>' + text + '</span></li>';
            }).join('');
        }

        function fillInstallSheet() {
            const installed = isAppInstalled();
            const canPrompt = !!deferredInstallPrompt;
            const kicker = document.getElementById('installKicker');
            const title = document.getElementById('installTitle');
            const lead = document.getElementById('installLead');
            const steps = document.getElementById('installSteps');
            const go = document.getElementById('installGo');
            const dismiss = document.getElementById('installDismiss');
            if (kicker) kicker.textContent = installed ? 'This device' : 'Home screen';
            if (title) title.textContent = installed ? 'Already installed' : 'Install OrbINT';
            if (lead) {
                lead.textContent = installed
                    ? 'OrbINT is already running as an app on this device. You can keep using it from the home screen, Dock, or Start menu.'
                    : 'Add this case file to this device like an app. It works on iPhone, iPad, Android, Windows, and Mac.';
            }
            if (steps) {
                steps.hidden = installed;
                steps.innerHTML = installed ? '' : installStepsHtml();
            }
            if (dismiss) dismiss.textContent = installed ? 'Close' : 'Not now';
            if (go) {
                go.hidden = installed;
                go.textContent = canPrompt ? 'Install' : 'Got it';
            }
        }

        function closeInstall() {
            hideSheet(document.getElementById('installSheet'));
        }

        function openInstall() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeHelp();
            closeAddField();
            closeToolkit();
            fillInstallSheet();
            showSheet(document.getElementById('installSheet'));
        }

        async function confirmInstall() {
            const go = document.getElementById('installGo');
            if (!deferredInstallPrompt) {
                if (!go || go.textContent !== 'Install') closeInstall();
                return;
            }
            const prompt = deferredInstallPrompt;
            deferredInstallPrompt = null;
            try {
                prompt.prompt();
                const result = await prompt.userChoice;
                if (result && result.outcome === 'accepted') closeInstall();
                else fillInstallSheet();
            } catch (error) {
                fillInstallSheet();
            }
        }

        function toggleShare() {
            const sheet = document.getElementById('shareSheet');
            if (!sheet) return;
            if (sheet.hidden) openShare();
            else closeShare();
        }

        function copyShareLink() {
            const url = siteShareUrl();
            const button = document.getElementById('shareCopy');
            const done = () => {
                if (!button) return;
                button.textContent = 'Copied';
                setTimeout(() => { button.textContent = 'Copy'; }, 1200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done).catch(done);
                return;
            }
            const area = document.createElement('textarea');
            area.value = url;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            done();
        }

        function nativeShareSite() {
            const url = siteShareUrl();
            if (navigator.share) {
                navigator.share({
                    title: 'OrbINT',
                    text: 'Open-source Reconnaissance Bureau of Intelligence',
                    url: url
                }).catch(function () {});
                return;
            }
            copyShareLink();
        }

        function closeHelp() {}

        function openHelp() {
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            closeShare();
            closeInstall();
            closeAddField();
            closeToolkit();
            closeProfileMenu();
            closeProfilePrompt();
            closeSettings();
            if (window.OrbINTCase && typeof OrbINTCase.setPage === 'function') OrbINTCase.setPage('guide');
        }

        function toggleExportMenu() {
            exportCase();
        }

        function exportCase() {
            closeExportMenu();
            const id = profileLibrary && profileLibrary.activeId;
            const bundle = (profileLibrary && typeof exportProfileBundle === 'function')
                ? exportProfileBundle(id)
                : stampMissingFields(JSON.parse(JSON.stringify(profile || {})), profile && profile.nulls);
            const skipMedia = !!(appSettings && appSettings.exportNoPhotos);
            Promise.resolve(skipMedia ? stripExportMedia(bundle) : attachImagesToBundle(bundle, id)).then((full) => {
                downloadBlob(caseFileName('json'), 'application/json', JSON.stringify(full, null, 2));
                if (window.OrbINTDone) window.OrbINTDone('Case exported', 'The JSON file downloaded. Upload JSON on the profile rail puts that file back. The browser does not keep an automatic backup.');
            });
        }

