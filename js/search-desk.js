/* Search desk: live public checks plus open-to-verify links */

        let searchFieldId = '';
        let searchToken = 0;

        function deskFetch(url, options, ms) {
            const ctrl = new AbortController();
            const timer = setTimeout(function () { ctrl.abort(); }, ms || 8000);
            const opts = Object.assign({}, options || {}, { signal: ctrl.signal });
            return fetch(url, opts).finally(function () { clearTimeout(timer); });
        }

        function certDesk(host) {
            return deskFetch('https://crt.sh/?q=' + encodeURIComponent(host) + '&output=json', null, 7000).then(function (res) {
                return res.ok ? res.json() : [];
            }).then(function (json) {
                return Array.isArray(json) ? json : [];
            }).catch(function () { return null; });
        }

        function searchHint() {
            const field = searchFieldId && fieldById(searchFieldId);
            return field ? fieldBase(searchFieldId) : '';
        }

        function deskHost(value) {
            return String(value || '').trim()
                .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
                .replace(/^www\./i, '')
                .split(/[/?#]/)[0]
                .replace(/\.$/, '')
                .toLowerCase();
        }

        function isDeskEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        function isDeskIpv4(value) {
            if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return false;
            return value.split('.').every(function (part) { return Number(part) <= 255; });
        }

        function isDeskIpv6(value) {
            return value.indexOf(':') >= 0 && /^[0-9a-f:]+$/i.test(value);
        }

        function isDeskHost(value) {
            const host = deskHost(value);
            return !!host && host.indexOf(' ') < 0 && host.indexOf('@') < 0 && host.indexOf('.') > 0 && /^[a-z0-9.-]+$/i.test(host);
        }

        function isDeskVin(value) {
            return /^[A-HJ-NPR-Z0-9]{17}$/i.test(value);
        }

        function isDeskPhone(value) {
            const digits = value.replace(/\D/g, '');
            return digits.length >= 7 && digits.length <= 15 && /^[+\d\s().-]+$/.test(value);
        }

        function isDeskHandle(value) {
            return /^@?[A-Za-z0-9._-]{2,39}$/.test(value);
        }

        function exactCountry(value) {
            const raw = String(value || '').trim();
            if (!raw) return null;
            const meta = countryCodeMeta(raw);
            if (meta) return meta;
            const lower = raw.toLowerCase();
            return COUNTRY_CODES.find(function (item) {
                return item.name.toLowerCase() === lower ||
                    item.dial === raw ||
                    item.dial === '+' + raw.replace(/^\+/, '') ||
                    (item.aliases || []).indexOf(lower) >= 0;
            }) || null;
        }

        function classifySearch(value, hint) {
            const text = String(value || '').trim();
            if (!text) return 'empty';
            if (isDeskEmail(text)) return 'email';
            if (isDeskIpv4(text) || isDeskIpv6(text)) return 'ip';
            if (isDeskVin(text) && hint !== 'username' && hint !== 'password') return 'vin';
            if (hint === 'countrycode' || (hint !== 'username' && hint !== 'name' && hint !== 'password' && exactCountry(text))) return 'country';
            if (hint === 'phone' || (hint !== 'username' && hint !== 'name' && hint !== 'password' && isDeskPhone(text))) return 'phone';
            if (isDeskHost(text) || /^https?:\/\//i.test(text)) return 'domain';
            if (hint === 'password') return 'password';
            if (hint === 'image') return 'image';
            if (hint === 'name' || hint === 'address' || /\s/.test(text)) return hint === 'address' ? 'address' : 'name';
            if (hint === 'username' || isDeskHandle(text)) return 'username';
            return 'text';
        }

        function phoneParts(value) {
            const digits = String(value || '').replace(/\D/g, '');
            const codes = COUNTRY_CODES.slice().sort(function (a, b) {
                return b.dial.length - a.dial.length;
            });
            let hit = null;
            codes.forEach(function (item) {
                if (hit) return;
                const dial = item.dial.replace(/\D/g, '');
                if (dial && digits.indexOf(dial) === 0 && digits.length > dial.length) hit = item;
            });
            return { digits: digits, country: hit };
        }

        function searchVerifyLinks(value) {
            const hint = searchHint();
            const kind = classifySearch(value, hint);
            const base = DEEP_LINKS[kind] ? kind : hint;
            const field = searchFieldId && fieldById(searchFieldId);
            const fact = searchFieldId && typeof latestFact === 'function' ? latestFact(searchFieldId) : null;
            let links = [];
            if (value && DEEP_LINKS[base]) links = DEEP_LINKS[base](value, fact);
            else if (value && field && field.leads && base === hint) links = field.leads(value, fact);
            else if (value) links = engineSet(quoted(value));
            else if (FIND_LINKS[base]) links = FIND_LINKS[base]();
            else links = [['Google', 'Search', gq(value || (field ? field.label : ''))]];
            const seen = {};
            links.forEach(function (item) { seen[leadHostKey(item[2] || item[1])] = true; });
            const extras = searchFieldId && typeof toolkitToolsForField === 'function' ? toolkitToolsForField(searchFieldId) : [];
            extras.forEach(function (tool) {
                if (!tool || !tool.url) return;
                const href = fillToolkitUrl(tool.url, value);
                const key = leadHostKey(href);
                if (seen[key]) return;
                seen[key] = true;
                links.push([tool.name, tool.host || '', href]);
            });
            return links.slice(0, 16);
        }

        function deskRow(source, answer, href, act) {
            const open = href
                ? '<button type="button" data-desk-open="' + escapeHtml(href) + '">Open</button>'
                : (act ? '<button type="button" data-desk-act="' + escapeHtml(act) + '">Open</button>' : '');
            return '<div class="search-desk-row"><b>' + escapeHtml(source) + '</b><span>' + escapeHtml(answer) + '</span>' + open + '</div>';
        }

        function paintSearchDesk(kind, checked, links, note, scan) {
            const box = document.getElementById('searchDeskResults');
            if (!box) return;
            const checks = checked.length
                ? checked.map(function (row) { return deskRow(row.source, row.answer, row.href, row.act); }).join('')
                : '<p class="search-desk-note">No public page, profile, article, or file matched yet.</p>';
            const verify = (links || []).map(function (item) {
                const href = item[2] || item[1];
                return '<button type="button" data-desk-open="' + escapeHtml(href) + '" data-desk-mode="' + escapeHtml(item[3] || '') + '">' + escapeHtml(item[0]) + '</button>';
            }).join('');
            const scanHtml = (scan || []).map(function (item) {
                return '<li class="is-' + escapeHtml(item.state) + '">' + escapeHtml(item.name) + '</li>';
            }).join('');
            box.innerHTML =
                (scanHtml ? '<ul class="search-desk-scan">' + scanHtml + '</ul>' : '') +
                (note ? '<p class="search-desk-note">' + escapeHtml(note) + '</p>' : '') +
                '<h3>Found</h3>' + checks +
                '<h3>Open to verify</h3>' +
                '<p class="search-desk-note">These sites hide their results from a web page. Open one to look there yourself.</p>' +
                '<div class="search-desk-links">' + verify + '</div>';
        }

        function mxHosts(rows) {
            return (rows || []).map(function (row) {
                const parts = String(row.data || '').trim().split(/\s+/);
                return (parts[parts.length - 1] || '').replace(/\.$/, '');
            }).filter(function (host) { return host && host !== '.'; });
        }

        function dnsDesk(name, type) {
            return fetch('https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + encodeURIComponent(type))
                .then(function (res) { return res.ok ? res.json() : { Answer: [] }; })
                .then(function (json) { return json.Answer || []; })
                .catch(function () { return []; });
        }

        function sha256Hex(text) {
            const data = new TextEncoder().encode(text);
            return crypto.subtle.digest('SHA-256', data).then(function (buf) {
                return Array.from(new Uint8Array(buf)).map(function (byte) {
                    return ('0' + byte.toString(16)).slice(-2);
                }).join('');
            });
        }

        function sha1Hex(text) {
            const data = new TextEncoder().encode(text);
            return crypto.subtle.digest('SHA-1', data).then(function (buf) {
                return Array.from(new Uint8Array(buf)).map(function (byte) {
                    return ('0' + byte.toString(16)).slice(-2);
                }).join('').toUpperCase();
            });
        }

        function gravatarExists(hash) {
            return new Promise(function (resolve) {
                const img = new Image();
                let done = false;
                const finish = function (yes) {
                    if (done) return;
                    done = true;
                    resolve(yes);
                };
                img.onload = function () { finish(true); };
                img.onerror = function () { finish(false); };
                img.src = 'https://www.gravatar.com/avatar/' + hash + '?d=404&s=40';
                setTimeout(function () { finish(false); }, 8000);
            });
        }

        function checkDomain(host) {
            return Promise.all([
                dnsDesk(host, 'A'),
                dnsDesk(host, 'MX'),
                dnsDesk(host, 'NS'),
                fetch('https://rdap.org/domain/' + encodeURIComponent(host)).then(function (res) {
                    return res.ok ? res.json() : null;
                }).catch(function () { return null; }),
                certDesk(host)
            ]).then(function (parts) {
                const a = parts[0].map(function (row) { return row.data; });
                const mx = mxHosts(parts[1]);
                const ns = parts[2].map(function (row) { return row.data; });
                const whois = parts[3];
                const certs = parts[4];
                const rows = [];
                rows.push({
                    source: 'DNS',
                    answer: a.length ? 'A ' + a.slice(0, 4).join(', ') : 'No A record from dns.google.',
                    href: 'https://dns.google/query?name=' + encodeURIComponent(host)
                });
                rows.push({
                    source: 'Mail',
                    answer: mx.length ? 'MX ' + mx.slice(0, 3).join(', ') : 'No MX record.',
                    href: 'https://dns.google/query?name=' + encodeURIComponent(host) + '&type=MX'
                });
                if (ns.length) rows.push({ source: 'Nameservers', answer: ns.slice(0, 3).join(', '), href: '' });
                const registrar = whois && (whois.registrar || (whois.entities && whois.entities[0] && whois.entities[0].handle) || '');
                rows.push({
                    source: 'RDAP',
                    answer: registrar ? 'Registrar ' + registrar : (whois ? 'Registration record found.' : 'No RDAP record.'),
                    href: 'https://rdap.org/domain/' + encodeURIComponent(host)
                });
                rows.push({
                    source: 'Certificates',
                    answer: certs === null ? 'crt.sh did not answer in time.' : (certs.length ? certs.length + ' certificate names on crt.sh.' : 'No certificate list returned.'),
                    href: 'https://crt.sh/?q=' + encodeURIComponent(host),
                    act: ''
                });
                rows.push({ source: 'Domain report', answer: 'DNS, certificates, and archives in the full report.', href: '', act: 'intel' });
                return rows;
            });
        }

        function checkEmail(email) {
            const domain = email.split('@')[1] || '';
            const jobs = [
                domain ? dnsDesk(domain, 'MX') : Promise.resolve([]),
                sha256Hex(email.trim().toLowerCase()).then(gravatarExists).catch(function () { return false; }),
                domain ? certDesk(domain) : Promise.resolve([])
            ];
            const key = window.OrbINTSettings && OrbINTSettings.get ? String(OrbINTSettings.get('hibpApiKey') || '').trim() : '';
            if (key) {
                jobs.push(fetch('https://haveibeenpwned.com/api/v3/breachedaccount/' + encodeURIComponent(email) + '?truncateResponse=false', {
                    headers: { 'hibp-api-key': key }
                }).then(function (res) {
                    if (res.status === 404) return [];
                    if (!res.ok) return null;
                    return res.json();
                }).catch(function () { return null; }));
            }
            return Promise.all(jobs).then(function (parts) {
                const mx = mxHosts(parts[0]);
                const rows = [{
                    source: 'Mailbox host',
                    answer: mx.length ? mx.slice(0, 3).join(', ') : 'No MX record for ' + domain + '.',
                    href: domain ? 'https://dns.google/query?name=' + encodeURIComponent(domain) + '&type=MX' : ''
                }];
                rows.push({
                    source: 'Gravatar',
                    answer: parts[1] ? 'A Gravatar avatar exists for this address.' : 'No Gravatar avatar.',
                    href: 'https://en.gravatar.com/' + encodeURIComponent(email)
                });
                const certs = parts[2];
                rows.push({
                    source: 'Certificates',
                    answer: certs === null ? 'crt.sh did not answer in time.' : ((certs && certs.length) ? certs.length + ' certificate names on ' + domain + '.' : 'No certificate list returned for ' + domain + '.'),
                    href: domain ? 'https://crt.sh/?q=' + encodeURIComponent(domain) : ''
                });
                if (key) {
                    const breaches = parts[3];
                    if (breaches === null) {
                        rows.push({ source: 'Have I Been Pwned', answer: 'The breach API did not answer. Open the public page to check.', href: 'https://haveibeenpwned.com/account/' + encodeURIComponent(email) });
                    } else if (!breaches.length) {
                        rows.push({ source: 'Have I Been Pwned', answer: 'No public breach for this address.', href: 'https://haveibeenpwned.com/account/' + encodeURIComponent(email) });
                    } else {
                        const names = breaches.map(function (item) { return item && (item.Title || item.Name); }).filter(Boolean);
                        rows.push({ source: 'Have I Been Pwned', answer: names.slice(0, 8).join(', ') || 'Breach records found.', href: 'https://haveibeenpwned.com/account/' + encodeURIComponent(email) });
                    }
                }
                return rows;
            });
        }

        function checkUsername(handle) {
            const name = String(handle || '').replace(/^@/, '');
            return Promise.all([
                fetch('https://api.github.com/users/' + encodeURIComponent(name), { headers: { Accept: 'application/vnd.github+json' } })
                    .then(function (res) {
                        if (res.status === 404) return { state: 'miss' };
                        if (!res.ok) return { state: 'err' };
                        return res.json().then(function (json) { return { state: 'hit', json: json }; });
                    }).catch(function () { return { state: 'err' }; }),
                fetch('https://gitlab.com/api/v4/users?username=' + encodeURIComponent(name))
                    .then(function (res) { return res.ok ? res.json() : null; })
                    .catch(function () { return null; })
            ]).then(function (parts) {
                const gh = parts[0];
                const gl = parts[1];
                const rows = [];
                if (gh.state === 'hit') {
                    const who = gh.json.name || gh.json.login;
                    const extra = [gh.json.bio, gh.json.company, gh.json.location].filter(Boolean).slice(0, 2).join(' · ');
                    rows.push({
                        source: 'GitHub',
                        answer: who + (extra ? ' — ' + extra : '') + '. ' + (gh.json.public_repos || 0) + ' public repos.',
                        href: gh.json.html_url || ('https://github.com/' + encodeURIComponent(name))
                    });
                } else if (gh.state === 'miss') {
                    rows.push({ source: 'GitHub', answer: 'Not found on this API.', href: 'https://github.com/' + encodeURIComponent(name) });
                } else {
                    rows.push({ source: 'GitHub', answer: 'GitHub did not answer.', href: 'https://github.com/' + encodeURIComponent(name) });
                }
                if (Array.isArray(gl) && gl.length) {
                    rows.push({
                        source: 'GitLab',
                        answer: (gl[0].name || gl[0].username) + ' has a GitLab account.',
                        href: gl[0].web_url || ('https://gitlab.com/' + encodeURIComponent(name))
                    });
                } else if (Array.isArray(gl)) {
                    rows.push({ source: 'GitLab', answer: 'Not found on this API.', href: 'https://gitlab.com/' + encodeURIComponent(name) });
                } else {
                    rows.push({ source: 'GitLab', answer: 'GitLab did not answer.', href: 'https://gitlab.com/' + encodeURIComponent(name) });
                }
                return rows;
            });
        }

        function checkPassword(secret) {
            if (!window.crypto || !crypto.subtle) {
                return Promise.resolve([{ source: 'Have I Been Pwned', answer: 'This browser cannot hash the password locally.', href: 'https://haveibeenpwned.com/Passwords' }]);
            }
            return sha1Hex(secret).then(function (hash) {
                const prefix = hash.slice(0, 5);
                const suffix = hash.slice(5);
                return fetch('https://api.pwnedpasswords.com/range/' + prefix).then(function (res) {
                    if (!res.ok) throw new Error('range');
                    return res.text();
                }).then(function (body) {
                    let count = 0;
                    String(body || '').split(/\n/).forEach(function (line) {
                        const bits = line.trim().split(':');
                        if (bits[0] && bits[0].toUpperCase() === suffix) count = Number(bits[1]) || 1;
                    });
                    if (count) {
                        return [{ source: 'Have I Been Pwned', answer: 'This password appears in public breach data, ' + count + ' times. The password itself was not sent.', href: 'https://haveibeenpwned.com/Passwords' }];
                    }
                    return [{ source: 'Have I Been Pwned', answer: 'No match in the range check. The password itself was not sent.', href: 'https://haveibeenpwned.com/Passwords' }];
                });
            }).catch(function () {
                return [{ source: 'Have I Been Pwned', answer: 'The range check did not answer. The password was not sent.', href: 'https://haveibeenpwned.com/Passwords' }];
            });
        }

        function checkIp(ip) {
            return fetch('https://rdap.org/ip/' + encodeURIComponent(ip)).then(function (res) {
                return res.ok ? res.json() : null;
            }).catch(function () { return null; }).then(function (json) {
                if (!json) return [{ source: 'RDAP', answer: 'No IP record returned.', href: 'https://rdap.org/ip/' + encodeURIComponent(ip) }];
                const name = json.name || json.handle || '';
                const country = json.country || '';
                const start = json.startAddress || '';
                const end = json.endAddress || '';
                const bits = [name, country, start && end ? start + ' – ' + end : ''].filter(Boolean);
                return [{ source: 'RDAP', answer: bits.join(' · ') || 'Registration record found.', href: 'https://rdap.org/ip/' + encodeURIComponent(ip) }];
            });
        }

        function checkVin(vin) {
            const url = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/' + encodeURIComponent(vin) + '?format=json';
            return fetch(url).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }).then(function (json) {
                const row = json && json.Results && json.Results[0];
                if (!row) {
                    return [{ source: 'NHTSA', answer: 'The decoder did not answer from this page.', href: 'https://vpic.nhtsa.dot.gov/decoder/Decoder' }];
                }
                const bits = [row.ModelYear, row.Make, row.Model, row.BodyClass].filter(function (item) { return item && item !== 'Not Applicable'; });
                return [{ source: 'NHTSA', answer: bits.join(' ') || 'No vehicle description in the decoder response.', href: 'https://vpic.nhtsa.dot.gov/decoder/Decoder' }];
            });
        }

        function localRows(kind, value) {
            if (kind === 'phone') {
                const parts = phoneParts(value);
                if (!parts.country) return [{ source: 'Number', answer: parts.digits ? parts.digits.length + ' digits. No calling-code match in the country list.' : 'Not a phone number.', href: '' }];
                return [{ source: 'Calling code', answer: parts.country.name + ' ' + parts.country.dial + '. National number ' + parts.digits.slice(parts.country.dial.replace(/\D/g, '').length) + '.', href: '' }];
            }
            if (kind === 'country') {
                const meta = exactCountry(value);
                if (!meta) return [{ source: 'Country code', answer: 'No match in the country list.', href: '' }];
                return [{ source: 'Country code', answer: meta.name + ' ' + meta.dial + ' (' + meta.id + ').', href: '' }];
            }
            return [];
        }

        function deskJson(url, options, ms) {
            return deskFetch(url, options, ms).then(function (res) {
                return res.ok ? res.json() : null;
            }).catch(function () { return null; });
        }

        function deskPlain(value) {
            return String(value || '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&quot;/g, '"')
                .replace(/&#39;|&apos;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function deskClip(value, max) {
            const text = deskPlain(value);
            if (text.length <= max) return text;
            return text.slice(0, max - 1).trim() + '…';
        }

        function deskQuery(value) {
            const text = String(value || '').trim().replace(/"/g, '');
            return /\s/.test(text) ? '"' + text + '"' : text;
        }

        function wikiDesk(value) {
            const url = 'https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srlimit=3&utf8=1&format=json&srsearch=' + encodeURIComponent(deskQuery(value));
            return deskJson(url).then(function (json) {
                const hits = json && json.query && json.query.search;
                if (!json) return { error: true };
                if (!hits || !hits.length) return { empty: true };
                const total = json.query.searchinfo && json.query.searchinfo.totalhits;
                const href = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(String(hits[0].title).replace(/ /g, '_'));
                return {
                    source: 'Wikipedia',
                    answer: (total ? total + ' pages. ' : '') + hits.map(function (hit) { return hit.title; }).join(', ') + '. ' + deskClip(hits[0].snippet, 160),
                    href: href
                };
            });
        }

        function wikidataDesk(value) {
            const url = 'https://www.wikidata.org/w/api.php?origin=*&action=wbsearchentities&language=en&format=json&limit=3&search=' + encodeURIComponent(value);
            return deskJson(url).then(function (json) {
                const hits = json && json.search;
                if (!json) return { error: true };
                if (!hits || !hits.length) return { empty: true };
                return {
                    source: 'Wikidata',
                    answer: hits.map(function (hit) { return hit.label + (hit.description ? ' — ' + hit.description : ''); }).join('; '),
                    href: hits[0].concepturi || hits[0].url || ''
                };
            });
        }

        function archiveDesk(value) {
            const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(deskQuery(value)) + '&fl[]=identifier&fl[]=title&fl[]=mediatype&output=json&rows=3';
            return deskJson(url, null, 12000).then(function (json) {
                const found = json && json.response;
                const docs = found && found.docs;
                if (!json) return { error: true };
                if (!docs || !docs.length) return { empty: true };
                const bits = docs.map(function (doc) {
                    const title = Array.isArray(doc.title) ? doc.title[0] : doc.title;
                    return (doc.mediatype ? doc.mediatype + ': ' : '') + (title || doc.identifier);
                });
                return {
                    source: 'Internet Archive',
                    answer: (found.numFound || docs.length) + ' public items, including pages and files. ' + deskClip(bits.join('; '), 180),
                    href: 'https://archive.org/search?query=' + encodeURIComponent(deskQuery(value))
                };
            });
        }

        function blueskyDesk(value) {
            const url = 'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q=' + encodeURIComponent(value) + '&limit=3';
            return deskJson(url).then(function (json) {
                const actors = json && json.actors;
                if (!json) return { error: true };
                if (!actors || !actors.length) return { empty: true };
                return {
                    source: 'Bluesky',
                    answer: actors.map(function (actor) {
                        return (actor.displayName || actor.handle) + ' @' + actor.handle;
                    }).join('; '),
                    href: 'https://bsky.app/profile/' + encodeURIComponent(actors[0].handle)
                };
            });
        }

        function hackerNewsDesk(value) {
            const url = 'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=3&query=' + encodeURIComponent(deskQuery(value));
            return deskJson(url).then(function (json) {
                const hits = json && json.hits;
                if (!json) return { error: true };
                if (!hits || !hits.length) return { empty: true };
                const first = hits[0];
                return {
                    source: 'Hacker News',
                    answer: (json.nbHits ? json.nbHits + ' stories. ' : '') + hits.map(function (hit) { return hit.title; }).filter(Boolean).join('; '),
                    href: first.url || ('https://news.ycombinator.com/item?id=' + first.objectID)
                };
            });
        }

        function openAlexDesk(value) {
            const url = 'https://api.openalex.org/works?per-page=3&search=' + encodeURIComponent(deskQuery(value));
            return deskJson(url).then(function (json) {
                const works = json && json.results;
                if (!json) return { error: true };
                if (!works || !works.length) return { empty: true };
                const first = works[0];
                const place = first.primary_location || first.best_oa_location || {};
                return {
                    source: 'Articles',
                    answer: ((json.meta && json.meta.count) ? json.meta.count + ' scholarly works. ' : '') + works.map(function (work) { return work.display_name; }).filter(Boolean).join('; '),
                    href: place.pdf_url || place.landing_page_url || first.doi || first.id || ''
                };
            });
        }

        function crossrefDesk(value) {
            const url = 'https://api.crossref.org/works?rows=3&query=' + encodeURIComponent(deskQuery(value));
            return deskJson(url).then(function (json) {
                const message = json && json.message;
                const items = message && message.items;
                if (!json) return { error: true };
                if (!items || !items.length) return { empty: true };
                const titles = items.map(function (item) { return Array.isArray(item.title) ? item.title[0] : item.title; }).filter(Boolean);
                return {
                    source: 'Crossref',
                    answer: (message['total-results'] ? message['total-results'] + ' published works. ' : '') + deskClip(titles.join('; '), 180),
                    href: items[0].URL || ''
                };
            });
        }

        function duckDesk(value) {
            const url = 'https://api.duckduckgo.com/?format=json&no_html=1&no_redirect=1&q=' + encodeURIComponent(deskQuery(value));
            return deskJson(url).then(function (json) {
                if (!json) return { error: true };
                const topics = [];
                if (json.AbstractText) topics.push(json.Heading ? json.Heading + ' — ' + json.AbstractText : json.AbstractText);
                (json.RelatedTopics || []).forEach(function (topic) {
                    if (topic.Text) topics.push(topic.Text);
                    (topic.Topics || []).forEach(function (child) { if (child.Text) topics.push(child.Text); });
                });
                if (!topics.length) return { empty: true };
                const href = json.AbstractURL || (json.RelatedTopics && json.RelatedTopics[0] && json.RelatedTopics[0].FirstURL) || '';
                return { source: 'DuckDuckGo', answer: deskClip(topics.slice(0, 3).join('; '), 200), href: href };
            });
        }

        function waybackDesk(host) {
            const url = 'https://web.archive.org/cdx/search/cdx?output=json&fl=original,timestamp&filter=statuscode:200&limit=5&collapse=urlkey&url=' + encodeURIComponent(host);
            return deskJson(url, null, 10000).then(function (json) {
                if (!json) return { error: true };
                if (!Array.isArray(json) || json.length < 2) return { empty: true };
                const pages = json.slice(1, 4).map(function (row) { return row[0]; });
                return {
                    source: 'Wayback Machine',
                    answer: 'Captured pages include ' + pages.join(', '),
                    href: 'https://web.archive.org/web/*/' + encodeURIComponent(host)
                };
            });
        }

        function githubEmailDesk(email) {
            return deskFetch('https://api.github.com/search/commits?per_page=3&q=' + encodeURIComponent('author-email:' + email), {
                headers: { Accept: 'application/vnd.github+json' }
            }, 8000).then(function (res) {
                return res.ok ? res.json() : null;
            }).catch(function () { return null; }).then(function (json) {
                if (!json) return { error: true };
                const items = json.items || [];
                if (!items.length) return { empty: true };
                const titles = items.map(function (item) {
                    return item.commit && item.commit.message ? item.commit.message.split('\n')[0] : '';
                }).filter(Boolean);
                return {
                    source: 'GitHub commits',
                    answer: (json.total_count || items.length) + ' public commits name this address. ' + deskClip(titles.join(' · '), 160),
                    href: items[0].html_url || ('https://github.com/search?type=commits&q=' + encodeURIComponent('author-email:' + email))
                };
            });
        }

        function searchSources(kind, value) {
            if (kind === 'password') return [{ name: 'Have I Been Pwned', run: function () { return checkPassword(value); } }];
            const sources = [];
            if (kind === 'domain') {
                const host = deskHost(value);
                sources.push({ name: 'Domain records', run: function () { return checkDomain(host); } });
                sources.push({ name: 'Wayback Machine', run: function () { return waybackDesk(host); } });
            } else if (kind === 'email') {
                sources.push({ name: 'Mailbox', run: function () { return checkEmail(value); } });
                sources.push({ name: 'GitHub commits', run: function () { return githubEmailDesk(value); } });
            } else if (kind === 'username') {
                sources.push({ name: 'Profiles', run: function () { return checkUsername(value); } });
            } else if (kind === 'ip') {
                sources.push({ name: 'RDAP', run: function () { return checkIp(value); } });
            } else if (kind === 'vin') {
                sources.push({ name: 'NHTSA', run: function () { return checkVin(value); } });
            } else if (kind === 'phone' || kind === 'country') {
                sources.push({ name: 'Local record', run: function () { return Promise.resolve(localRows(kind, value)); } });
            }
            sources.push(
                { name: 'Wikipedia', run: function () { return wikiDesk(value); } },
                { name: 'Wikidata', run: function () { return wikidataDesk(value); } },
                { name: 'Internet Archive', run: function () { return archiveDesk(value); } },
                { name: 'Bluesky', run: function () { return blueskyDesk(value); } },
                { name: 'Hacker News', run: function () { return hackerNewsDesk(value); } },
                { name: 'Articles', run: function () { return openAlexDesk(value); } },
                { name: 'Crossref', run: function () { return crossrefDesk(value); } },
                { name: 'DuckDuckGo', run: function () { return duckDesk(value); } }
            );
            return sources;
        }

        function scanNote(kind, scan) {
            const hits = scan.filter(function (item) { return item.state === 'hit'; }).length;
            const fails = scan.filter(function (item) { return item.state === 'fail'; }).length;
            if (kind === 'password') return 'Breach check only. The password was not sent to any website.';
            let note = 'Scanned public pages, social profiles, articles, and archived files.';
            note += hits ? ' ' + hits + ' sources returned results.' : ' No public source returned a match.';
            if (fails) note += ' ' + fails + ' sources did not answer from this browser.';
            return note;
        }

        function rowsFrom(result) {
            if (Array.isArray(result)) return result.filter(function (row) { return row && row.source; });
            if (result && result.source) return [result];
            return [];
        }

        function runSearchDesk() {
            const input = document.getElementById('searchDeskInput');
            const value = input ? input.value.trim() : '';
            const kind = classifySearch(value, searchHint());
            const token = ++searchToken;
            const links = searchVerifyLinks(value);
            if (!value) {
                paintSearchDesk(kind, [], links, 'Type a value to search.', []);
                return;
            }
            const sources = searchSources(kind, value);
            const scan = sources.map(function (source) { return { name: source.name, state: 'run' }; });
            const found = [];
            const waiting = kind === 'password'
                ? 'Checking exposure. The password is not sent.'
                : 'Scanning public pages, profiles, articles, and files.';
            paintSearchDesk(kind, found, links, waiting, scan);
            let pending = sources.length;
            sources.forEach(function (source, index) {
                Promise.resolve().then(source.run).then(function (result) {
                    return result;
                }).catch(function () {
                    return { error: true };
                }).then(function (result) {
                    if (token !== searchToken) return;
                    const rows = rowsFrom(result);
                    if (rows.length) {
                        scan[index].state = 'hit';
                        found.push.apply(found, rows);
                    } else if (result && result.error) {
                        scan[index].state = 'fail';
                    } else {
                        scan[index].state = 'miss';
                    }
                    pending -= 1;
                    paintSearchDesk(kind, found, links, pending ? waiting : scanNote(kind, scan), scan);
                });
            });
        }

        function openSearchDesk(fieldId) {
            const sheet = document.getElementById('searchDesk');
            const input = document.getElementById('searchDeskInput');
            if (!sheet || !input) return;
            searchFieldId = fieldId || '';
            const field = searchFieldId && fieldById(searchFieldId);
            const hint = searchHint();
            const value = searchFieldId ? fieldInputValue(searchFieldId) : '';
            input.type = hint === 'password' ? 'password' : 'text';
            input.value = value;
            const title = document.getElementById('searchDeskTitle');
            if (title) title.textContent = field ? field.label : 'Search';
            showSheet(sheet);
            if (value) runSearchDesk();
            else {
                const box = document.getElementById('searchDeskResults');
                if (box) box.innerHTML = '<p class="search-desk-note">Type a phone, email, username, site, or anything else.</p>';
            }
            setTimeout(function () { input.focus(); input.select(); }, 40);
        }

        function bindSearchDesk() {
            const form = document.getElementById('searchDeskForm');
            const close = document.getElementById('searchDeskClose');
            const results = document.getElementById('searchDeskResults');
            if (form) form.addEventListener('submit', function (event) {
                event.preventDefault();
                runSearchDesk();
            });
            if (close) close.addEventListener('click', function () {
                hideSheet(document.getElementById('searchDesk'));
            });
            if (results) results.addEventListener('click', function (event) {
                const act = event.target.closest('[data-desk-act]');
                if (act && act.getAttribute('data-desk-act') === 'intel') {
                    const input = document.getElementById('searchDeskInput');
                    const host = deskHost(input && input.value);
                    if (window.OrbINTCase && typeof OrbINTCase.openDomainIntel === 'function') OrbINTCase.openDomainIntel(host);
                    return;
                }
                const open = event.target.closest('[data-desk-open]');
                if (!open) return;
                const input = document.getElementById('searchDeskInput');
                const value = input && input.type === 'password' ? '' : (input ? input.value.trim() : '');
                openLead(open.getAttribute('data-desk-open'), value, open.getAttribute('data-desk-mode') || '');
            });
        }

        bindSearchDesk();
