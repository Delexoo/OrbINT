/* Harvester scanners for text, json, html, csv */
    function cpSplitPair(line) {
        let s = String(line || '').trim();
        if (!s || s.length > 800) return null;
        if (/^#\s*skip\b/i.test(s) || /^\/\/\s*seen\b/i.test(s)) return null;
        if (/^[=\-#*_/~]{3,}$/.test(s)) return null;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s)) return null;
        if (/^\[(?:\?|\+|-)\]/.test(s)) return null;
        if (/^\[(?:user@|root@)/i.test(s) || /\$\s+cat\s+/i.test(s)) return null;
        s = s.replace(/^[^\p{L}\p{N}@\/]+/u, '');
        if (/^\/\//.test(s) || /^#\s*skip\b/i.test(s) || /^decoy\b/i.test(s)) return null;
        s = s.replace(/^[-*+>]+(?:\s+)/, '');
        s = s.replace(/^#{1,6}\s+/, '');
        if (/^(?:user@|root@)/i.test(s)) return null;
        if (/^\|?\s*-{2,}\s*\|/.test(s)) return null;
        if (/^\|/.test(s)) {
            const cells = s.split('|').map(function (c) { return c.trim(); }).filter(function (c) {
                return c && !/^:?-{2,}:?$/.test(c);
            });
            if (cells.length >= 2 && !/^(type|value|key|field)$/i.test(cells[0])) {
                return { key: cells[0], value: cells.slice(1).join(' | ') };
            }
            return null;
        }
        let m = s.match(/^([A-Za-z][\w .-]{0,48})(?:;[^=:\n]{0,80})?\s*:\s*(.+)$/);
        if (m && !/^(BEGIN|END|VERSION)$/i.test(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^[*`"_]*([\p{L}][\p{L}\p{N} ._/-]{0,48}?)[*`"_]*\s*\??\s*(?:\.{2,}\s*)?(?::{1,3}|={1,2}|-{1,2}>|→|=>)\s*(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N} ._/-]{0,40})\s{2,}(\S.*)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^((?:[\p{L}][\p{L}'’.-]*\s+){0,2}[\p{L}][\p{L}'’.-]{1,32})\s+([^\s].{0,180})$/u);
        if (m && cpClassifyKey(m[1]) && !/^[\/—–]/.test(m[2]) && !/^(is|was|were|are|the|a|an|to|of|and)\b/i.test(m[2]) && m[2].split(/\s+/).length <= 14) {
            return { key: m[1], value: m[2] };
        }
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,32})\?\s+(.+)$/u);
        if (m && cpClassifyKey(m[1])) return { key: m[1], value: m[2] };
        m = s.match(/^([\p{L}][\p{L}\p{N}._-]{1,40})\s+\/\s+(.+)$/u);
        if (m) return { key: m[1], value: m[2] };
        m = s.match(/^([A-Za-z][A-Za-z0-9._-]{2,32})\s+[—–]\s+(?:possibly\s+)?(.+)$/i);
        if (m) return { key: 'alias', value: m[1], extra: m[2] };
        return null;
    }

    function cpScanPairs(hits, text, note) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const pair = cpSplitPair(line);
            if (!pair) continue;
            let val = pair.value;
            const cls = cpClassifyKey(pair.key);
            if (cls && cls.kind === 'address' && !String(val).trim()) {
                const extra = [];
                while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !cpSplitPair(lines[i + 1].trim())) {
                    extra.push(lines[++i].trim());
                }
                val = extra.join(', ');
            }
            cpTakePair(hits, pair.key, val, note);
            if (pair.extra) {
                const extra = cpCleanValue(String(pair.extra).replace(/^possibly\s+/i, '').replace(/\.+$/, ''));
                if (cpLooksLikePerson(extra)) cpPushHit(hits, 'name', extra, note);
            }
        }
    }

    function cpScanPatterns(hits, text, note) {
        const src = String(text || '');
        if (!src) return;
        const email = src.match(/[A-Z0-9._%+\-]{2,}@[A-Z0-9.\-]+\.[A-Z]{2,24}/gi) || [];
        email.forEach(function (v) {
            if (cpLooksLikeEmail(v)) cpPushHit(hits, 'email', v, note);
        });
        const url = src.match(/\bhttps?:\/\/[^\s<>"'`]+/gi) || [];
        url.forEach(function (v) {
            const clean = v.replace(/[),.;]+$/, '');
            if (cpLooksLikeJunkUrl(clean)) return;
            cpPushHit(hits, 'url', clean, note);
            const acc = cpAccountFromUrl(clean);
            if (acc && acc.value && (cpLooksLikeHandle(acc.value, true) || /^(id)?\d+$/i.test(acc.value))) {
                cpPushHit(hits, 'username', acc.value, note, acc.platform);
            }
        });
        const tme = src.match(/\bt\.me\/([A-Za-z][A-Za-z0-9_]{3,32})\b/gi) || [];
        tme.forEach(function (v) {
            const h = v.replace(/^t\.me\//i, '');
            if (cpLooksLikeHandle(h, true)) cpPushHit(hits, 'username', h, note, 'telegram');
        });
        const ip = src.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g) || [];
        ip.forEach(function (v) {
            if (/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(v)) return;
            if (/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(v)) return;
            cpPushHit(hits, 'ip', v, note);
        });
        const ipv6 = src.match(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f:.]+\b/gi) || [];
        ipv6.forEach(function (v) {
            if (/::/.test(v) && v.length >= 10) cpPushHit(hits, 'ip', v, note);
        });
        const phone = src.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g) || [];
        phone.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const phoneUs = src.match(/\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g) || [];
        phoneUs.forEach(function (v) {
            if (cpLooksLikePhone(v, false)) cpPushHit(hits, 'phone', v, note);
        });
        const reddit = src.match(/\b\/?u\/[A-Za-z0-9_-]{3,32}\b/g) || [];
        reddit.forEach(function (v) {
            if (/\b(?:GET|POST|PUT|HEAD|DELETE)\s+\//i.test(src) && new RegExp('\\b(?:GET|POST) /u/' + cpStripUser(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(src)) return;
            cpPushHit(hits, 'username', cpStripUser(v), note, 'reddit');
        });
        const discord = src.match(/\b[A-Za-z][A-Za-z0-9._-]{2,31}#\d{4}\b/g) || [];
        discord.forEach(function (v) { cpPushHit(hits, 'username', v, note, 'discord'); });
        const at = src.match(/(^|[^\w])@([A-Za-z][A-Za-z0-9._]{2,31})\b/g) || [];
        at.forEach(function (v) {
            const h = cpStripUser(v.replace(/^[^@]+/, ''));
            if (!cpLooksLikeHandle(h)) return;
            if (new RegExp('@' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':').test(src)) return;
            cpPushHit(hits, 'username', h, note);
        });
        const seenT = src.match(/\bseen\s+((?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)/gi) || [];
        seenT.forEach(function (v) {
            const t = v.replace(/^seen\s+/i, '');
            if (cpLooksLikeTime(t)) cpPushHit(hits, 'time', t, note);
        });
        const btc = src.match(/\bbc1[a-z0-9]{25,87}\b/gi) || [];
        btc.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const eth = src.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
        eth.forEach(function (v) { cpPushHit(hits, 'crypto', v, note); });
        const ids = src.match(/\b(?:EMP|AST|SF|NT|VT|FI|VN|EL|ID)-[A-Z0-9]{2,10}\b/g) || [];
        ids.forEach(function (v) { cpPushHit(hits, 'id', v, note); });
        String(src).split('\n').forEach(function (line) {
            const m = String(line).match(/^\s*(?:[-*+]|\d+[.)])?\s*[`*_]*((?:19|20)\d{2}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[./](?:0?[1-9]|1[0-2])[./](?:19|20)\d{2})\b/);
            if (m && cpLooksLikeDate(m[1])) cpPushHit(hits, 'date', m[1], note);
        });
        const ages = src.match(/\b(?:age\s*[:=]?\s*)?(\d{1,3})\s*(?:years?\s+old|yrs?\.?\s*old|лет)\b/gi) || [];
        ages.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
        const ageEq = src.match(/\bage\s*[:=]\s*(\d{1,3})\b/gi) || [];
        ageEq.forEach(function (v) {
            const n = String(v).match(/\d{1,3}/);
            if (n && Number(n[0]) >= 1 && Number(n[0]) <= 120) cpPushHit(hits, 'age', n[0], note);
        });
    }

    function cpScanEmbeddedJson(hits, text, note) {
        const src = String(text || '');
        if (src.indexOf('{') < 0) return;
        let n = 0;
        for (let i = 0; i < src.length && n < 12; i++) {
            if (src.charAt(i) !== '{') continue;
            let depth = 0;
            let j = i;
            let inStr = false;
            let esc = false;
            for (; j < src.length && j - i < 80000; j++) {
                const c = src.charAt(j);
                if (inStr) {
                    if (esc) esc = false;
                    else if (c === '\\') esc = true;
                    else if (c === '"') inStr = false;
                    continue;
                }
                if (c === '"') inStr = true;
                else if (c === '{') depth += 1;
                else if (c === '}') {
                    depth -= 1;
                    if (depth === 0) {
                        try {
                            cpWalkJson(hits, JSON.parse(src.slice(i, j + 1)), '');
                            n += 1;
                            i = j;
                        } catch (error) {}
                        break;
                    }
                }
            }
        }
    }

    function cpLooksLikeLogLine(line) {
        return /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ \S+ \[[^\]]+\] "[A-Z]+ /i.test(String(line || '').trim());
    }

    function cpLooksLikeArtLine(line) {
        const s = String(line || '');
        const useful = (s.match(/[\p{L}\p{N}]/gu) || []).length;
        if (useful >= 8) return false;
        if (/[█░▓▀▄■□╔╗╚╝║╠╣═]/.test(s) && useful < 6) return true;
        if (s.length >= 50) {
            const noisy = (s.match(/[#%*=_\-|:+~.,;\\/<>]/g) || []).length;
            if (useful < 10 && noisy / s.length > 0.42) return true;
        }
        return false;
    }

    function cpStripArt(line) {
        return String(line || '')
            .replace(/[█░▓▀▄■□╔╗╚╝║╠╣═┌┐└┘│┬┴┼]/g, ' ')
            .replace(/[»↳]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function cpLooksLikeAddressLine(value) {
        const s = String(value || '').replace(/\s+/g, ' ').trim();
        if (s.length < 12 || s.length > 140) return false;
        if (/https?:/i.test(s) || cpLooksLikeEmail(s)) return false;
        if (!/\d/.test(s)) return false;
        if (/(улиц|проспект|бульвар|переулок|\bдом\b|\bул\.|street|\bst\.|\bave\b|avenue|\broad\b|\brd\.|\bway\b|drive|\bdr\.|\blane|\bln\.|\bblvd\b|\brue\b|strasse|\bplaza\b|\bcourt\b|\bapt\b|\bsuite\b)/i.test(s)) return true;
        if (/^\d{5,6}\s*,/.test(s)) return true;
        return /\d{1,6}\s+[\p{L}].+\b(way|street|ave|road|drive|lane|blvd|court|улиц)/iu.test(s);
    }

    function cpPrepareText(text) {
        const lines = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const logLines = [];
        const kept = [];
        lines.forEach(function (line) {
            if (cpLooksLikeArtLine(line)) return;
            if (cpLooksLikeLogLine(line)) {
                logLines.push(line);
                return;
            }
            kept.push(cpStripArt(line));
        });
        return {
            signals: kept.join('\n'),
            logLines: logLines,
            dropLogs: logLines.length >= 12
        };
    }

    function cpScanLogLines(hits, lines, note) {
        if (!lines || !lines.length || lines.length >= 12) return;
        lines.forEach(function (line) {
            const m = String(line).trim().match(/^((?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+) \S+ (\S+) \[/);
            if (!m) return;
            if (!/^0\.|^255\.|127\.0\.0\.1|\.0\.0\.0$/.test(m[1]) && !/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(m[1])) {
                cpPushHit(hits, 'ip', m[1], note);
            }
            if (m[2] && m[2] !== '-' && cpLooksLikeHandle(m[2], true)) cpPushHit(hits, 'username', m[2], note);
        });
    }

    function cpScanStandalone(hits, text, note) {
        String(text || '').split('\n').forEach(function (line) {
            const s = String(line || '').trim();
            if (!s || s.length > 140 || /^https?:/i.test(s) || cpSplitPair(s)) return;
            if (cpLooksLikeDate(s)) {
                const y = Number((s.match(/(?:19|20)\d{2}/) || [])[0]);
                if (y >= 1920 && y <= 2018) cpPushHit(hits, 'dob', s, note);
                else if (y >= 2019) cpPushHit(hits, 'date', s, note);
                return;
            }
            const titled = s.split(/\s+/);
            const nameCase = titled.length >= 2 && titled.every(function (w) {
                const core = w.replace(/[.'’-]/g, '');
                if (!core) return false;
                return core === core.toUpperCase() || /^[\p{Lu}][\p{Ll}'’-]*$/u.test(w) || /^[\p{Lu}]+$/u.test(core);
            });
            if (nameCase && !/[.?!]$/.test(s) && !/^(no|the|a|an|this|that|not)\b/i.test(s) && cpLooksLikePerson(s)) {
                cpPushHit(hits, 'name', s.replace(/\s+/g, ' '), note);
            } else if (cpLooksLikeAddressLine(s)) cpPushHit(hits, 'address', s, note);
        });
    }

    function cpScanAll(hits, text, note) {
        const prepared = cpPrepareText(text);
        cpScanEmbeddedJson(hits, prepared.signals, note);
        cpScanPairs(hits, prepared.signals, note);
        cpScanStandalone(hits, prepared.signals, note);
        cpScanPatterns(hits, prepared.signals, note);
        cpScanLogLines(hits, prepared.logLines, note);
    }

    function cpParseCsv(text, sep) {
        const rows = [];
        let row = [];
        let cell = '';
        let q = false;
        const delim = sep || ',';
        const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (q) {
                if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
                else if (ch === '"') q = false;
                else cell += ch;
            } else if (ch === '"') q = true;
            else if (ch === delim) { row.push(cell); cell = ''; }
            else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
            else cell += ch;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); }
        return rows.filter(function (r) { return r.some(function (c) { return String(c).trim(); }); });
    }

    function cpWalkJson(hits, val, path) {
        if (val == null) return;
        if (typeof val !== 'object') {
            const seg = String(path || '').split('.').pop().replace(/\[\d+\]/g, '');
            if (/^(timestamp|type|version|metadata|label|scatter|kind|category)$/i.test(seg)) return;
            if (/^Mozilla\//i.test(String(val))) return;
            cpTakePair(hits, seg, String(val), 'json');
            if (cpLooksLikeEmail(String(val)) || /^https?:\/\//i.test(String(val)) || /^\+?\d[\d\s().-]{8,}$/.test(String(val))) {
                cpScanPatterns(hits, String(val), 'json');
            }
            return;
        }
        if (Array.isArray(val)) {
            val.forEach(function (item, i) {
                cpWalkJson(hits, item, path ? path + '[' + i + ']' : '[' + i + ']');
            });
            return;
        }
        if ((val.prenom || val.firstname || val.first_name || val.given_name) && (val.nom || val.lastname || val.last_name || val.family_name || val.apellido)) {
            const full = cpCleanValue(String(val.prenom || val.firstname || val.first_name || val.given_name) + ' ' + String(val.nom || val.lastname || val.last_name || val.family_name || val.apellido));
            if (cpLooksLikePerson(full) || cpLooksLikePersonLabeled(full)) cpPushHit(hits, 'name', full, 'json');
        }
        if ((val.label != null || val.key != null) && val.value != null && typeof val.value !== 'object') {
            cpTakePair(hits, String(val.key != null ? val.key : val.label), String(val.value), 'json');
        }
        if (val.service && (val.username || val.handle || val.user || val.id)) {
            cpTakePair(hits, String(val.service), String(val.username || val.handle || val.user || val.id), 'json');
        }
        Object.keys(val).forEach(function (k) {
            if (/^(label|key|value|type|scatter)$/i.test(k) && val.value != null && (val.label != null || val.key != null)) return;
            cpWalkJson(hits, val[k], path ? path + '.' + k : k);
        });
    }

    function cpScanJsRecord(hits, src) {
        const re = /(?:^|[{\s,])([A-Za-z_]\w{1,32})\s*:\s*["']([^"']{1,160})["']/g;
        let m;
        while ((m = re.exec(String(src || '')))) {
            cpTakePair(hits, m[1], m[2], 'script');
        }
    }

    function cpDecodeHtml(text) {
        return String(text || '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'");
    }

    function cpStripMarkup(raw) {
        return cpDecodeHtml(String(raw || '')
            .replace(/<script[\s\S]*?<\/script>/gi, '\n')
            .replace(/<style[\s\S]*?<\/style>/gi, '\n')
            .replace(/<!--[\s\S]*?-->/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|h[1-6]|tr|section|pre|blockquote)>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim());
    }

    function cpHtml(raw, hits) {
        const src = String(raw || '');
        const scripts = src.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
        scripts.forEach(function (block) {
            const inner = block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
            cpScanJsRecord(hits, inner);
            cpScanAll(hits, inner, 'script');
        });
        const df = /data-field=["']([^"']+)["'][^>]*>([^<]*)/gi;
        let m;
        while ((m = df.exec(src))) cpTakePair(hits, m[1], cpDecodeHtml(m[2]), 'html');
        const mail = /mailto:([^"'>\s]+)/gi;
        while ((m = mail.exec(src))) cpPushHit(hits, 'email', decodeURIComponent(m[1]), 'html');
        const heads = /<h[1-6][^>]*>([^<]+)/gi;
        while ((m = heads.exec(src))) {
            const t = cpCleanValue(cpDecodeHtml(m[1]));
            if (CP_NOISE.test(t) || /^(profile card|data record|person record|signal frame)$/i.test(t)) {
                /* section title */
            } else if (cpLooksLikeHandle(t)) {
                cpPushHit(hits, 'alias', t, 'heading');
            } else if (cpLooksLikePerson(t)) {
                cpPushHit(hits, 'name', t, 'heading');
            }
        }
        cpScanAll(hits, cpStripMarkup(src), 'html');
        return { text: cpStripMarkup(src) };
    }

    function cpXml(raw, hits) {
        const src = String(raw || '');
        const tag = /<([A-Za-z_][\w:.-]*)\b[^>]*>([^<]{1,200})<\/\1>/g;
        let m;
        while ((m = tag.exec(src))) cpTakePair(hits, m[1].split(':').pop(), m[2], 'xml');
        const attr = /\b([A-Za-z_][\w:.-]*)=["']([^"']{1,200})["']/g;
        while ((m = attr.exec(src))) {
            if (/^(class|style|xmlns|id|width|height|type)$/i.test(m[1])) continue;
            cpTakePair(hits, m[1], m[2], 'xml');
        }
        cpScanAll(hits, cpStripMarkup(src), 'xml');
        return { text: cpStripMarkup(src) };
    }

    function cpJson(raw, hits) {
        let parsed = null;
        let error = '';
        try { parsed = JSON.parse(raw); }
        catch (e) { error = e.message || 'Invalid JSON'; }
        if (parsed != null) cpWalkJson(hits, parsed, '');
        else cpScanAll(hits, raw, 'json');
        return { error: error };
    }

    function cpMd(raw, hits) {
        cpScanAll(hits, raw, 'markdown');
        return { text: raw };
    }

    function cpCsv(raw, hits) {
        const first = String(raw || '').split(/\r?\n/, 1)[0] || '';
        const sep = first.split('\t').length > first.split(',').length ? '\t' : ',';
        const grid = cpParseCsv(raw, sep);
        if (grid.length >= 2) {
            const head = grid[0].map(function (c) { return String(c).trim(); });
            grid.slice(1).forEach(function (row) {
                row.forEach(function (cell, i) {
                    const key = head[i] || '';
                    if (key) cpTakePair(hits, key, cell, 'csv');
                    else cpScanPatterns(hits, cell, 'csv');
                });
            });
        } else {
            grid.forEach(function (row) {
                row.forEach(function (cell) { cpScanAll(hits, cell, 'csv'); });
            });
        }
        return {};
    }

    function cpTxt(raw, hits) {
        cpScanAll(hits, raw, 'text');
        return { text: raw };
    }

    function cpFinishHits(hits) {
        const plat = {};
        hits.forEach(function (h) {
            if (h.platform) plat[h.value.toLowerCase()] = 1;
        });
        const kept = hits.filter(function (h) {
            if (h.kind === 'name' && (cpLooksLikeTypeLabel(h.value) || !cpLooksLikePerson(h.value) && !cpLooksLikePersonLabeled(h.value))) return false;
            if (h.kind === 'url' && cpLooksLikeJunkUrl(h.value)) return false;
            if (h.platform || h.kind !== 'username') return true;
            return !plat[h.value.toLowerCase()];
        });
        kept.sort(function (a, b) {
            const ia = CP_ORDER.indexOf(a.kind);
            const ib = CP_ORDER.indexOf(b.kind);
            if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
            const pa = a.platform || '';
            const pb = b.platform || '';
            if (pa !== pb) return pa < pb ? -1 : 1;
            return a.value.toLowerCase() < b.value.toLowerCase() ? -1 : 1;
        });
        return kept;
    }

    function harvestOne(file, raw) {
        const kind = cpKind(file.name, file.type);
        const hits = [];
        hits._seen = {};
        if (kind === 'html') cpHtml(raw, hits);
        else if (kind === 'xml') cpXml(raw, hits);
        else if (kind === 'json') cpJson(raw, hits);
        else if (kind === 'md') cpMd(raw, hits);
        else if (kind === 'csv') cpCsv(raw, hits);
        else cpTxt(raw, hits);
        delete hits._seen;
        delete hits._phone;
        return {
            id: uid('cp'),
            name: file.name || 'untitled',
            kind: kind,
            size: file.size || raw.length,
            raw: raw,
            hits: cpFinishHits(hits)
        };
    }

    function mergeHarvesterHits(files) {
        const hits = [];
        hits._seen = {};
        files.forEach(function (file) {
            (file.hits || []).forEach(function (hit) {
                cpPushHit(hits, hit.kind, hit.value, hit.note || file.name, hit.platform);
            });
        });
        delete hits._seen;
        delete hits._phone;
        return cpFinishHits(hits);
    }

