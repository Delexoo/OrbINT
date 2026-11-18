/* Operations map hits, feeds, and binding */
    function opsLayerHit(x, y) {
        if (!opsRealMap) return null;
        const layer = opsMapMode === 'outages' ? 'ops-outages' : 'ops-attacks';
        if (!opsRealMap.getLayer(layer)) return null;
        let found = [];
        try { found = opsRealMap.queryRenderedFeatures([x, y], { layers: [layer] }); } catch (error) { return null; }
        if (!found.length) return null;
        const props = found[0].properties || {};
        if (opsMapMode === 'outages') {
            return { x: x, y: y, r: 8, kind: 'outage', id: String(props.index), link: props.link || '' };
        }
        return { x: x, y: y, r: 8, kind: 'ip', id: props.ip || '', ip: props.ip || '', link: props.link || '' };
    }

    function opsHitAt(x, y) {
        if (opsMapMode === 'cameras') return opsCameraHit(x, y);
        const layered = opsLayerHit(x, y);
        if (layered) return layered;
        let best = null;
        let bestDist = Infinity;
        opsMapHits.forEach(function (hit) {
            const dx = x - hit.x;
            const dy = y - hit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= hit.r && dist < bestDist) { best = hit; bestDist = dist; }
        });
        return best;
    }

    function opsAttackStartDate() {
        const days = { day: 1, week: 7, month: 30, year: 365, decade: 3650 }[opsAttackRange];
        if (!days) return '';
        const date = new Date(Date.now() - days * 86400000);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return date.getUTCFullYear() + '-' + month + '-' + day;
    }

    function opsUtcDay(offset) {
        const date = new Date(Date.now() - (offset || 0) * 86400000);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return date.getUTCFullYear() + '-' + month + '-' + day;
    }

    function opsAttackPlaceNote(items, range) {
        const list = items || [];
        const placed = list.filter(function (item) { return isFinite(item.lat) && isFinite(item.lon); }).length;
        if (!placed) return '';
        const windowNote = (range === 'month' || range === 'year' || range === 'decade') ? ' · public feed covers 30 days' : (range === 'live' ? ' · today and 30-day sources' : '');
        const of = list.length > placed ? ' of ' + list.length : '';
        return opsAttackWindowLabel() + windowNote + ' · ' + placed + of + ' sources · SANS ISC';
    }

    function opsAttackRecord(row, seen) {
        const ip = String(row.ip || row.source || '').trim();
        if (!ip) return null;
        const known = opsKnownPort(ip);
        return {
            ip: ip,
            count: Number(row.attacks || row.reports) || 0,
            country: '',
            city: '',
            lat: NaN,
            lon: NaN,
            port: known === null ? '' : known,
            seen: String(row.lastseen || seen || '')
        };
    }

    function opsReadAttackJson(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error('feed');
            return res.json();
        });
    }

    function opsMergeAttackDays(lists) {
        const byIp = {};
        lists.forEach(function (rows) {
            (Array.isArray(rows) ? rows : []).forEach(function (row) {
                const item = opsAttackRecord(row, '');
                if (!item) return;
                const prev = byIp[item.ip];
                if (!prev) byIp[item.ip] = item;
                else if (item.count > prev.count) {
                    item.count += prev.count;
                    byIp[item.ip] = item;
                } else prev.count += item.count;
            });
        });
        return Object.keys(byIp).map(function (ip) { return byIp[ip]; }).sort(function (a, b) { return b.count - a.count; });
    }

    function opsFetchAttackList(range) {
        const dayLists = function (count, limit) {
            const jobs = [];
            for (let day = 0; day < count; day++) {
                jobs.push(opsReadAttackJson('https://isc.sans.edu/api/topips/attacks/' + limit + '/' + opsUtcDay(day) + '?json').catch(function () { return []; }));
            }
            return jobs;
        };
        let jobs = [];
        if (range === 'week') jobs = dayLists(7, 500);
        else if (range === 'live' || range === 'day') {
            const day = range === 'live' ? opsUtcDay(0) : opsAttackStartDate();
            jobs = [
                opsReadAttackJson('https://isc.sans.edu/api/topips/attacks/1000/' + day + '?json').catch(function () { return []; }),
                opsReadAttackJson('https://isc.sans.edu/api/sources/attacks/500?json').catch(function () { return []; })
            ];
        } else {
            jobs = [opsReadAttackJson('https://isc.sans.edu/api/sources/attacks/500?json').catch(function () { return []; })].concat(dayLists(14, 200));
        }
        return Promise.all(jobs).then(opsMergeAttackDays);
    }

    function opsGeoCacheKey() {
        return 'orbint-ops-geo-city';
    }

    function opsCoarsePoint(lat, lon) {
        return Math.abs(lat - 37.751) < 0.02 && Math.abs(lon + 97.822) < 0.02;
    }

    function opsReadGeo(item, geo) {
        const lat = Number(geo.latitude != null ? geo.latitude : geo.lat);
        const lon = Number(geo.longitude != null ? geo.longitude : geo.lon);
        if (!isFinite(lat) || !isFinite(lon) || opsCoarsePoint(lat, lon)) return false;
        item.lat = lat;
        item.lon = lon;
        item.city = String(geo.city || '');
        const code = String(geo.country_code || geo.country || '').toUpperCase();
        if (/^[A-Z]{2}$/.test(code)) item.country = code;
        return true;
    }

    function opsFetchGeo(item) {
        const primary = 'https://json.geoiplookup.io/' + encodeURIComponent(item.ip);
        const timed = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(8000) } : {};
        return fetch(primary, timed).then(function (res) {
            if (!res.ok) throw new Error('geo');
            return res.json();
        }).then(function (geo) {
            opsReadGeo(item, geo);
        }).catch(function () {});
    }

    function opsApplyGeoRow(item, geo) {
        if (!geo) return false;
        return opsReadGeo(item, {
            latitude: geo.lat != null ? geo.lat : geo.latitude,
            longitude: geo.lon != null ? geo.lon : geo.longitude,
            city: geo.city,
            country_code: geo.countryCode || geo.country_code || geo.country
        });
    }

    function opsLocateSerial(items) {
        let cursor = 0;
        const worker = function () {
            if (cursor >= items.length) return Promise.resolve();
            const item = items[cursor++];
            return opsFetchGeo(item).then(worker);
        };
        const lanes = [];
        const width = Math.min(6, items.length || 1);
        for (let lane = 0; lane < width; lane++) lanes.push(worker());
        return Promise.all(lanes);
    }

    function opsGeoBatch(items) {
        if (!items.length) return Promise.resolve();
        if (location.protocol === 'https:') return opsLocateSerial(items);
        const timed = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(12000) } : {};
        return fetch('http://ip-api.com/batch?fields=status,countryCode,city,lat,lon,query', Object.assign({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items.map(function (item) { return item.ip; }))
        }, timed)).then(function (res) {
            if (!res.ok) throw new Error('geo');
            return res.json();
        }).then(function (rows) {
            const byIp = {};
            (Array.isArray(rows) ? rows : []).forEach(function (row) {
                if (row && row.query && row.status === 'success') byIp[row.query] = row;
            });
            const missed = [];
            items.forEach(function (item) {
                if (!opsApplyGeoRow(item, byIp[item.ip])) missed.push(item);
            });
            if (missed.length) return opsLocateSerial(missed.slice(0, 12));
        });
    }

    function opsLocateAttacks(items, onPaint) {
        let cache = {};
        try {
            const raw = sessionStorage.getItem(opsGeoCacheKey());
            const data = raw ? JSON.parse(raw) : {};
            if (data && typeof data === 'object') cache = data;
        } catch (error) { cache = {}; }
        const need = [];
        items.forEach(function (item) {
            const saved = cache[item.ip];
            if (saved && isFinite(saved.lat) && isFinite(saved.lon) && !opsCoarsePoint(saved.lat, saved.lon) && Date.now() - (saved.at || 0) < 6 * 3600000) {
                item.lat = saved.lat;
                item.lon = saved.lon;
                item.city = saved.city || '';
                if (!item.country) item.country = saved.country || '';
                return;
            }
            need.push(item);
        });
        need.sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
        const todo = need.slice(0, 1000);
        const save = function () {
            items.forEach(function (item) {
                if (!isFinite(item.lat) || !isFinite(item.lon)) return;
                cache[item.ip] = { lat: item.lat, lon: item.lon, city: item.city, country: item.country, at: Date.now() };
            });
            try { sessionStorage.setItem(opsGeoCacheKey(), JSON.stringify(cache)); } catch (error) { /* the dots still use this response */ }
        };
        if (onPaint) onPaint();
        let failed = false;
        const step = function () {
            if (!todo.length || failed) {
                save();
                return Promise.resolve(items);
            }
            const chunk = todo.splice(0, 100);
            return opsGeoBatch(chunk).catch(function () {
                failed = true;
                return opsLocateSerial(chunk.slice(0, 12));
            }).then(function () {
                save();
                if (onPaint) onPaint();
                return step();
            });
        };
        return step();
    }

    let opsAttackToken = 0;

    function loadOpsAttacks(force) {
        const range = opsAttackRange;
        const token = ++opsAttackToken;
        const key = 'orbint-ops-attacks6-' + range;
        const ttl = range === 'live' ? 20000 : 300000;
        const cached = !force && opsSessionCache(key, null, ttl);
        if (cached && Array.isArray(cached.items)) {
            opsAttacks = cached.items;
            opsAttackAt = cached.at || Date.now();
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'No located attack sources';
            opsAttacks.forEach(function (item) {
                const known = opsKnownPort(item.ip);
                if (known !== null) item.port = known;
            });
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncAttackPins();
            opsFillPorts(opsAttacks);
            return;
        }
        opsAttackNote = 'Loading ' + opsAttackWindowLabel().toLowerCase() + ' sources';
        opsMapStatusLine();
        opsFetchAttackList(range).then(function (picked) {
            if (token !== opsAttackToken || range !== opsAttackRange) return [];
            opsAttacks = picked || [];
            opsAttackNote = 'Locating ' + opsAttacks.length + ' sources';
            opsMapStatusLine();
            opsSyncAttackPins();
            return opsLocateAttacks(opsAttacks, function () {
                if (token !== opsAttackToken || range !== opsAttackRange) return;
                opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || ('Locating ' + opsAttacks.length + ' sources');
                opsMapStatusLine();
                paintOpsMapList();
                opsSyncAttackPins();
            });
        }).then(function (items) {
            if (token !== opsAttackToken || range !== opsAttackRange) return;
            opsAttacks = items || [];
            opsAttackAt = Date.now();
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'No attack sources returned';
            opsSessionCache(key, { at: opsAttackAt, items: opsAttacks }, ttl);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncAttackPins();
            opsFillPorts(opsAttacks);
        }).catch(function () {
            if (token !== opsAttackToken || range !== opsAttackRange) return;
            opsAttackNote = opsAttackPlaceNote(opsAttacks, range) || 'Attack sources did not load';
            opsMapStatusLine();
            paintOpsMapList();
        });
    }

    function opsOutageCountry(entity) {
        entity = entity || {};
        const attrs = entity.attrs || {};
        const type = String(entity.type || '');
        const code = String(entity.code || '').toUpperCase();
        if (type === 'country' && /^[A-Z]{2}$/.test(code) && OPS_PLACES[code]) return code;
        const named = String(attrs.country_code || '').toUpperCase();
        if (/^[A-Z]{2}$/.test(named) && OPS_PLACES[named]) return named;
        if (type === 'geoasn') {
            const tail = code.split('-').pop();
            if (/^[A-Z]{2}$/.test(tail) && OPS_PLACES[tail]) return tail;
        }
        return '';
    }

    function opsSpreadOutages(items) {
        const seen = {};
        items.forEach(function (item) {
            const place = item.country && OPS_PLACES[item.country];
            if (!place) return;
            const n = seen[item.country] || 0;
            seen[item.country] = n + 1;
            if (!n) {
                item.lon = place[0];
                item.lat = place[1];
                return;
            }
            const ring = Math.floor((n - 1) / 8) + 1;
            const angle = ((n - 1) % 8) / 8 * Math.PI * 2;
            const step = 0.42 * ring;
            item.lon = place[0] + Math.cos(angle) * step;
            item.lat = Math.max(-85, Math.min(85, place[1] + Math.sin(angle) * step * 0.65));
        });
    }

    function opsFetchOutagePages(from, until, pages) {
        const jobs = [];
        for (let page = 1; page <= pages; page++) {
            const url = 'https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?from=' + from + '&until=' + until + '&limit=200&page=' + page;
            jobs.push(fetch(url).then(function (res) {
                if (!res.ok) throw new Error('feed');
                return res.json();
            }).then(function (payload) {
                return payload && Array.isArray(payload.data) ? payload.data : [];
            }).catch(function () { return []; }));
        }
        return Promise.all(jobs).then(function (lists) {
            const rows = [];
            const seen = {};
            lists.forEach(function (list) {
                list.forEach(function (row) {
                    const entity = row.entity || {};
                    const key = [row.datasource, entity.type, entity.code, row.time].join('|');
                    if (seen[key]) return;
                    seen[key] = true;
                    rows.push(row);
                });
            });
        return rows;
        });
    }

    function opsOutageSpan() {
        const days = { live: 1, day: 1, week: 7, month: 30, year: 365, decade: 365 }[opsAttackRange] || 1;
        const limit = days <= 1 ? 6 : 8;
        return { days: days, limit: limit };
    }

    function opsOutagePlaceNote(items) {
        const placed = (items || []).filter(function (item) { return OPS_PLACES[item.country]; }).length;
        if (!placed) return opsAttackWindowLabel() + ' · no outages with a country';
        return opsAttackWindowLabel() + ' · ' + placed + ' outages · IODA';
    }

    function loadOpsOutages(force) {
        const range = opsAttackRange;
        const span = opsOutageSpan();
        const cached = !force && opsSessionCache('orbint-ops-outages3-' + range, null, 55000);
        if (cached && Array.isArray(cached.items)) {
            opsOutages = cached.items;
            opsOutageAt = cached.at || Date.now();
            opsOutageNote = opsOutagePlaceNote(opsOutages);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncOutagePins();
            return;
        }
        opsOutageNote = 'Loading ' + opsAttackWindowLabel().toLowerCase() + ' outages';
        opsMapStatusLine();
        const until = Math.floor(Date.now() / 1000);
        const from = until - span.days * 24 * 60 * 60;
        const pages = span.limit;
        opsFetchOutagePages(from, until, pages).then(function (rows) {
            if (range !== opsAttackRange) return;
            opsOutages = rows.map(function (row) {
                const entity = row.entity || {};
                const type = String(entity.type || '');
                const code = String(entity.code || '');
                const link = type && code
                    ? 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard#view=inspect&entity=' + encodeURIComponent(type + '/' + code)
                    : 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
                return {
                    name: entity.name || 'Outage',
                    country: opsOutageCountry(entity),
                    source: String(row.datasource || ''),
                    level: String(row.level || ''),
                    time: (Number(row.time) || 0) * 1000,
                    link: link
                };
            }).filter(function (item) { return item.country; });
            opsSpreadOutages(opsOutages);
            opsOutageAt = Date.now();
            opsOutageNote = opsOutagePlaceNote(opsOutages);
            opsSessionCache('orbint-ops-outages3-' + range, { at: opsOutageAt, items: opsOutages }, 55000);
            opsMapStatusLine();
            paintOpsMapList();
            opsSyncOutagePins();
        }).catch(function () {
            if (range !== opsAttackRange) return;
            opsOutageNote = opsOutages.length ? opsOutagePlaceNote(opsOutages) : 'Internet outages did not load';
            opsMapStatusLine();
            paintOpsMapList();
        });
    }

    function startOpsMap() {
        opsEnsureMap();
        opsClearPinCanvas();
        opsSyncAttackPins();
        opsSyncOutagePins();
        opsShowPinLayers();
        if (opsMapMode === 'cameras') opsEnsureCameras();
        requestAnimationFrame(function () { opsSyncMapSize(); });
    }

    function bindOperations() {
        applyOpsLayout();
        const ask = $('opsAccessAsk');
        if (ask) ask.addEventListener('click', openOpsAsk);
        const deny = $('opsAskDeny');
        const allow = $('opsAskAllow');
        if (deny) deny.addEventListener('click', function () {
            setOpsDeviceChoice('deny');
            paintOpsAccess();
            paintOpsMachineHeld();
            closeOpsAsk();
        });
        if (allow) allow.addEventListener('click', function () {
            setOpsDeviceChoice('allow');
            paintOpsAccess();
            paintOpsMachine();
            setOpsOpen('machine', true);
            closeOpsAsk();
            opsLocateUser(true);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeOpsAsk();
                closeOpsReport();
                closeOpsBasemap();
            }
        });
        const news = $('opsNews');
        if (news) {
            news.addEventListener('click', function (event) {
                const topic = event.target.closest('[data-topic]');
                if (topic) {
                    opsNewsTopic = topic.getAttribute('data-topic') || 'all';
                    opsNewsIndex = 0;
                    opsNewsDir = 1;
                    paintOpsNews(opsNewsAll, opsNewsNote);
                    return;
                }
                const jump = event.target.closest('[data-news]');
                if (!jump || !opsNewsItems.length) return;
                event.preventDefault();
                const action = jump.getAttribute('data-news');
                const total = opsNewsItems.length;
                if (action === 'prev') {
                    opsNewsIndex = (opsNewsIndex + total - 1) % total;
                    opsNewsDir = -1;
                } else if (action === 'next') {
                    opsNewsIndex = (opsNewsIndex + 1) % total;
                    opsNewsDir = 1;
                } else {
                    const next = Number(action) || 0;
                    opsNewsDir = next >= opsNewsIndex ? 1 : -1;
                    opsNewsIndex = next;
                }
                paintOpsNews(opsNewsAll, opsNewsNote);
            });
        }
        const newsPanel = document.querySelector('[data-ops="news"]');
        if (newsPanel) {
            newsPanel.addEventListener('pointerenter', function () {
                if (!opsNewsPaused) opsNewsHold = Date.now();
                opsNewsPaused = true;
            });
            newsPanel.addEventListener('pointerleave', function () {
                if (opsNewsHold) {
                    opsNewsStamp += Date.now() - opsNewsHold;
                    opsNewsHold = 0;
                }
                opsNewsPaused = false;
            });
        }
        const reset = $('opsLayoutReset');
        if (reset) {
            reset.addEventListener('click', function () {
                try { localStorage.removeItem(OPS_LAYOUT_KEY); } catch (error) {}
                applyOpsLayout(OPS_LAYOUT_DEFAULT);
            });
        }
        document.querySelectorAll('.ops-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                const panel = toggle.closest('.ops-panel');
                if (!panel) return;
                setOpsOpen(panel.getAttribute('data-ops'), panel.classList.contains('is-closed'));
            });
        });
        let drag = null;
        document.addEventListener('pointerdown', function (event) {
            const handle = event.target.closest('.ops-resize-x, .ops-resize-y');
            if (!handle || window.innerWidth <= 900) return;
            const panel = handle.closest('.ops-panel');
            if (!panel) return;
            event.preventDefault();
            drag = {
                axis: handle.classList.contains('ops-resize-x') ? 'x' : 'y',
                panel: panel,
                id: panel.getAttribute('data-ops'),
                body: panel.querySelector('.ops-body')
            };
            document.body.classList.add('ops-resizing');
            handle.setPointerCapture(event.pointerId);
        });
        document.addEventListener('pointermove', function (event) {
            if (!drag) return;
            if (drag.axis === 'x') {
                const board = document.querySelector('.ops-board');
                if (!board) return;
                const span = opsSnapSpan(event.clientX - drag.panel.getBoundingClientRect().left, board.getBoundingClientRect().width);
                drag.panel.style.gridColumn = 'span ' + span;
                drag.span = span;
            } else if (drag.body) {
                const height = Math.max(140, Math.min(640, event.clientY - drag.body.getBoundingClientRect().top));
                drag.body.style.height = height + 'px';
                drag.height = height;
            }
        });
        function endOpsDrag() {
            if (!drag) return;
            const layout = opsLayout();
            const base = OPS_LAYOUT_DEFAULT[drag.id] || { span: 12, open: true, height: 0 };
            const spec = Object.assign({}, base, layout[drag.id] || {});
            if (drag.span) spec.span = drag.span;
            if (drag.height) spec.height = drag.height;
            layout[drag.id] = spec;
            opsLayout(layout);
            document.body.classList.remove('ops-resizing');
            drag = null;
        }
        document.addEventListener('pointerup', endOpsDrag);
        document.addEventListener('pointercancel', endOpsDrag);
        setInterval(function () {
            if (!document.body || document.body.getAttribute('data-page') !== 'operations') return;
            const reduce = opsReduceMotion();
            const panel = document.querySelector('[data-ops="news"]');
            const closed = !panel || panel.classList.contains('is-closed');
            if (closed) {
                opsNewsStamp = Date.now();
                if (!opsNewsClosed) {
                    opsNewsClosed = true;
                    resetOpsChapterFill(0);
                }
            } else if (opsNewsClosed) {
                opsNewsClosed = false;
                opsNewsStamp = Date.now();
                resetOpsChapterFill(0);
            }
            if (!opsNewsPaused && !reduce && !closed && opsNewsItems.length > 1 && Date.now() - opsNewsStamp >= OPS_NEWS_MS) {
                opsNewsIndex = (opsNewsIndex + 1) % opsNewsItems.length;
                opsNewsDir = 1;
                paintOpsNews(opsNewsAll, opsNewsNote);
            }
            opsMapStatusLine();
            const modeThumb = document.querySelector('.ops-mode-thumb');
            if (modeThumb && !(modeThumb.offsetWidth > 0)) opsModeThumb(true);
        }, 100);
        setInterval(function () {
            if (!document.body || document.body.getAttribute('data-page') !== 'operations' || document.hidden) return;
            loadOpsAttacks(false);
            loadOpsOutages(false);
            loadOpsNews(false);
        }, 60000);
        const stage = document.querySelector('.ops-globe-stage');
        if (stage) {
            stage.addEventListener('click', function (event) {
                if (event.target.closest('[data-report="close"]')) {
                    closeOpsReport();
                    return;
                }
                const hit = event.target.closest('[data-hit]');
                if (!hit) return;
                const kind = hit.getAttribute('data-hit') || '';
                const id = hit.getAttribute('data-id') || '';
                opsOpenMapHit({ kind: kind, id: id, ip: kind === 'ip' ? id : '' });
            });
        }
        window.addEventListener('resize', function () { opsModeThumb(true); });
        const basemapBtn = $('opsBasemapBtn');
        const basemapMenu = $('opsBasemap');
        function closeOpsBasemap() {
            if (!basemapMenu || basemapMenu.hidden) return;
            basemapMenu.hidden = true;
            if (basemapBtn) basemapBtn.setAttribute('aria-expanded', 'false');
        }
        if (basemapBtn && basemapMenu) {
            basemapBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                const open = basemapMenu.hidden;
                basemapMenu.hidden = !open;
                basemapBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
        document.addEventListener('click', function (event) {
            if (!basemapMenu || basemapMenu.hidden) return;
            if (event.target.closest('.ops-basemap-pop')) return;
            closeOpsBasemap();
        });
        document.querySelectorAll('[data-basemap]').forEach(function (button) {
            button.addEventListener('click', function () {
                opsSetBasemap(button.getAttribute('data-basemap') || 'dark');
                closeOpsBasemap();
            });
        });
        const locate = $('opsLocate');
        if (locate) locate.addEventListener('click', function () { opsLocateUser(true); });
        document.querySelectorAll('[data-map]').forEach(function (button) {
            button.addEventListener('click', function () {
                setOpsMapMode(button.getAttribute('data-map'));
            });
        });
        document.querySelectorAll('[data-range]').forEach(function (button) {
            button.addEventListener('click', function () {
                opsAttackRange = button.getAttribute('data-range') || 'live';
                document.querySelectorAll('[data-range]').forEach(function (other) {
                    other.classList.toggle('is-on', other === button);
                });
                opsHideTip();
                if (opsMapMode === 'outages') loadOpsOutages(true);
                else if (opsMapMode !== 'cameras') loadOpsAttacks(true);
            });
        });
        const mapRefresh = $('opsMapRefresh');
        if (mapRefresh) {
            mapRefresh.addEventListener('click', function () {
                if (opsMapMode === 'outages') loadOpsOutages(true);
                else if (opsMapMode !== 'cameras') loadOpsAttacks(true);
            });
        }
        startOpsMap();
    }

    bindOperations();
