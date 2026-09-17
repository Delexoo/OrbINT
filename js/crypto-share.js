/* E2E share + live session — AES-GCM, key stays in the URL hash */

        const SHARE_IV_LEN = 12;
        const SHARE_POLL_MS = 2800;
        const SHARE_HOST_KEY = 'orbint-share-host';
        let shareState = {
            roomId: '',
            keyB64: '',
            hostToken: '',
            hosting: false,
            live: false,
            ended: false,
            mode: '',
            readonly: false,
            rev: 0,
            lastPut: 0,
            timer: 0,
            watch: null,
            busy: false,
            error: '',
            lastViewUrl: ''
        };

        function shareServices() {
            const set = (typeof OrbINTSettings !== 'undefined' && OrbINTSettings.get) ? OrbINTSettings.get() : {};
            const baked = window.ORBINT_SERVICES || {};
            return {
                api: String(set.shareApiUrl || baked.shareApi || '').replace(/\/$/, ''),
                watch: String(set.collabWsUrl || baked.collabWs || '').replace(/\/$/, '')
            };
        }

        function shareRandomB64(bytes) {
            const buf = new Uint8Array(bytes);
            crypto.getRandomValues(buf);
            return btoa(String.fromCharCode.apply(null, buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        }

        function shareB64ToBytes(b64) {
            const pad = b64.replace(/-/g, '+').replace(/_/g, '/');
            const raw = atob(pad + '==='.slice((pad.length + 3) % 4));
            const out = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
            return out;
        }

        function shareParseHash(hash) {
            const raw = String(hash || location.hash || '').replace(/^#/, '');
            const room = /^room=([A-Za-z0-9_-]+),([A-Za-z0-9_-]+)(?:,(view|edit))?$/.exec(raw);
            if (room) {
                return { kind: 'room', id: room[1], key: room[2], mode: room[3] === 'edit' ? 'edit' : 'view' };
            }
            const frozen = /^json=([A-Za-z0-9_-]+),([A-Za-z0-9_-]+)$/.exec(raw);
            if (frozen) return { kind: 'json', id: frozen[1], key: frozen[2], mode: 'view' };
            return null;
        }

        function shareLink(id, key) {
            const origin = location.origin + location.pathname + location.search;
            return origin + '#room=' + id + ',' + key + ',view';
        }

        async function shareImportKey(b64) {
            return crypto.subtle.importKey(
                'raw',
                shareB64ToBytes(b64),
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        }

        async function shareEncrypt(keyB64, obj) {
            const key = await shareImportKey(keyB64);
            const iv = crypto.getRandomValues(new Uint8Array(SHARE_IV_LEN));
            const encoded = new TextEncoder().encode(JSON.stringify(obj));
            const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encoded));
            const out = new Uint8Array(iv.length + sealed.length);
            out.set(iv, 0);
            out.set(sealed, iv.length);
            return out;
        }

        async function shareDecrypt(keyB64, buf) {
            const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
            if (bytes.length < SHARE_IV_LEN + 16) throw new Error('short');
            const key = await shareImportKey(keyB64);
            const iv = bytes.slice(0, SHARE_IV_LEN);
            const data = bytes.slice(SHARE_IV_LEN);
            const open = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
            return JSON.parse(new TextDecoder().decode(open));
        }

        async function shareDigestHex(bytes) {
            const hash = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(hash)).map(function (n) {
                return (n < 16 ? '0' : '') + n.toString(16);
            }).join('');
        }

        function shareApiUrl(kind, id) {
            const svc = shareServices();
            if (!svc.api) return '';
            return svc.api + '/v1/' + kind + '/' + encodeURIComponent(id);
        }

        function shareHostHeaders(extra) {
            const headers = extra || {};
            if (shareState.hostToken) headers['X-OrbINT-Host'] = shareState.hostToken;
            headers['X-OrbINT-Live'] = shareState.live ? 'on' : 'off';
            return headers;
        }

        function sharePersistHost() {
            if (!shareState.hosting || !shareState.roomId || !shareState.keyB64 || !shareState.hostToken) return;
            try {
                localStorage.setItem(SHARE_HOST_KEY, JSON.stringify({
                    roomId: shareState.roomId,
                    keyB64: shareState.keyB64,
                    hostToken: shareState.hostToken,
                    live: !!shareState.live
                }));
            } catch (error) {}
        }

        function shareLoadHost() {
            try {
                const raw = JSON.parse(localStorage.getItem(SHARE_HOST_KEY) || 'null');
                if (!raw || !raw.roomId || !raw.keyB64 || !raw.hostToken) return;
                shareState.roomId = raw.roomId;
                shareState.keyB64 = raw.keyB64;
                shareState.hostToken = raw.hostToken;
                shareState.hosting = true;
                shareState.live = !!raw.live;
                shareState.mode = 'edit';
                shareState.lastViewUrl = shareLink(raw.roomId, raw.keyB64);
            } catch (error) {}
        }

        function shareEnsureIdentity() {
            if (shareState.roomId && shareState.keyB64 && shareState.hostToken) {
                shareState.lastViewUrl = shareLink(shareState.roomId, shareState.keyB64);
                return;
            }
            shareState.roomId = shareRandomB64(16);
            shareState.keyB64 = shareRandomB64(16);
            shareState.hostToken = shareRandomB64(18);
            shareState.hosting = true;
            shareState.live = false;
            shareState.mode = 'edit';
            shareState.lastViewUrl = shareLink(shareState.roomId, shareState.keyB64);
            sharePersistHost();
        }

        async function sharePutBlob(id, bytes) {
            const url = shareApiUrl('blob', id);
            if (!url) throw new Error('no-api');
            const headers = shareHostHeaders({ 'Content-Type': 'application/octet-stream', 'X-OrbINT-Kind': 'room' });
            const res = await fetch(url, { method: 'PUT', headers: headers, body: bytes });
            if (res.status === 403) throw new Error('host-token');
            if (!res.ok) throw new Error('put-' + res.status);
            return res;
        }

        async function sharePutSession(live) {
            const url = shareApiUrl('session', shareState.roomId);
            if (!url) throw new Error('no-api');
            const headers = shareHostHeaders({});
            headers['X-OrbINT-Live'] = live ? 'on' : 'off';
            const res = await fetch(url, { method: 'PUT', headers: headers });
            if (res.status === 403) throw new Error('host-token');
            if (!res.ok) throw new Error('session-' + res.status);
        }

        async function shareGetBlob(id) {
            const url = shareApiUrl('blob', id);
            if (!url) throw new Error('no-api');
            const res = await fetch(url, { method: 'GET' });
            if (res.status === 410 || res.status === 404) return { ended: true };
            if (!res.ok) throw new Error('get-' + res.status);
            return { bytes: new Uint8Array(await res.arrayBuffer()) };
        }

        function shareCurrentBundle() {
            if (typeof flushLibrarySync === 'function') flushLibrarySync();
            const id = profileLibrary && profileLibrary.activeId;
            if (typeof exportProfileBundle === 'function') return exportProfileBundle(id);
            return {};
        }

        function shareApplyBundle(bundle, opts) {
            if (!bundle || typeof bundle !== 'object') return;
            const entry = (typeof coerceImportedEntry === 'function')
                ? coerceImportedEntry(bundle, bundle.title || 'Shared case')
                : bundle;
            if (!entry) return;
            if (bundle.id) entry.id = bundle.id;
            if (bundle.case) entry.case = bundle.case;
            if (bundle.audit) entry.audit = bundle.audit;
            if (profileLibrary && profileLibrary.items) {
                const id = entry.id || (profileLibrary.activeId);
                entry.id = id;
                profileLibrary.items[id] = Object.assign(profileLibrary.items[id] || {}, entry);
                profileLibrary.activeId = id;
            }
            if (typeof applyWorkspace === 'function') applyWorkspace(entry, opts || { keepCamera: true });
        }

        function shareSetReadonly(on) {
            shareState.readonly = !!on;
            document.body.classList.toggle('share-readonly', shareState.readonly);
            const banner = document.getElementById('shareReadonlyBanner');
            if (banner) {
                banner.hidden = !shareState.readonly || shareState.ended;
                banner.textContent = 'View-only session. You can read this case while the host keeps it on.';
            }
        }

        function shareShowEnded(on) {
            const show = !shareState.hosting && !!on;
            const first = show && !shareState.ended;
            shareState.ended = !!on;
            document.body.classList.toggle('share-ended', show);
            const el = document.getElementById('shareEndedCurtain');
            if (el) el.hidden = !show;
            const banner = document.getElementById('shareReadonlyBanner');
            if (banner && show) banner.hidden = true;
            if (first) shareClearViewerCase();
        }

        function shareClearViewerCase() {
            if (shareState.hosting) return;
            const facts = (typeof emptyFacts === 'function') ? emptyFacts() : {};
            shareApplyBundle({
                facts: facts,
                title: '',
                analysis: '',
                added: [],
                labels: {},
                hidden: [],
                layout: null,
                peerHomes: {},
                investigation: null,
                case: {},
                audit: []
            }, { keepCamera: false });
        }

        async function sharePush() {
            if (!shareState.hosting || !shareState.live || shareState.busy) return;
            const id = shareState.roomId;
            const key = shareState.keyB64;
            if (!id || !key) return;
            shareState.rev += 1;
            const payload = {
                v: 1,
                kind: 'orbint-share',
                mode: 'view',
                rev: shareState.rev,
                at: new Date().toISOString(),
                bundle: shareCurrentBundle()
            };
            const bytes = await shareEncrypt(key, payload);
            await sharePutBlob(id, bytes);
            shareState.lastPut = Date.now();
            shareState.error = '';
        }

        async function sharePull(force) {
            if (!shareState.roomId || !shareState.keyB64 || shareState.busy) return;
            if (shareState.hosting && !force) return;
            shareState.busy = true;
            try {
                const got = await shareGetBlob(shareState.roomId);
                if (got && got.ended) {
                    shareState.live = false;
                    if (!shareState.hosting) shareShowEnded(true);
                    shareState.error = '';
                    return;
                }
                if (!got || !got.bytes) return;
                const payload = await shareDecrypt(shareState.keyB64, got.bytes);
                if (!payload || !payload.bundle) return;
                if (!force && Number(payload.rev || 0) <= shareState.rev) return;
                shareState.rev = Number(payload.rev || 0);
                shareState.live = true;
                shareShowEnded(false);
                shareApplyBundle(payload.bundle, { keepCamera: true });
                shareState.error = '';
            } catch (error) {
                shareState.error = String(error && error.message || error);
            } finally {
                shareState.busy = false;
            }
        }

        function shareStopLive() {
            if (shareState.timer) {
                clearInterval(shareState.timer);
                shareState.timer = 0;
            }
            if (shareState.watch) {
                try { shareState.watch.close(); } catch (error) {}
                shareState.watch = null;
            }
        }

        function shareStartLive() {
            shareStopLive();
            if (!shareState.roomId) return;
            const svc = shareServices();
            if (svc.watch) {
                try {
                    const url = svc.watch.replace(/\/$/, '') + '/v1/watch/' + encodeURIComponent(shareState.roomId);
                    const es = new EventSource(url);
                    es.onmessage = function (event) {
                        if (String(event.data || '').indexOf('ended') === 0) {
                            shareState.live = false;
                            if (!shareState.hosting) shareShowEnded(true);
                            sharePaint();
                            return;
                        }
                        sharePull(false);
                    };
                    shareState.watch = es;
                } catch (error) {}
            }
            shareState.timer = setInterval(function () {
                if (document.hidden) return;
                sharePull(false);
            }, SHARE_POLL_MS);
        }

        async function shareSetLive(on) {
            const svc = shareServices();
            if (!svc.api) throw new Error('Set a share API URL in Settings (or .env SHARE_API_URL).');
            shareEnsureIdentity();
            shareState.error = '';
            if (on) {
                shareState.hosting = true;
                shareSetReadonly(false);
                shareShowEnded(false);
                shareState.live = true;
                try {
                    await sharePush();
                } catch (error) {
                    shareState.live = false;
                    throw error;
                }
                shareStartLive();
                sharePersistHost();
                if (typeof appendCaseAudit === 'function') appendCaseAudit('share', '', 'Session on');
            } else {
                await sharePutSession(false);
                shareState.live = false;
                shareStopLive();
                sharePersistHost();
                if (typeof appendCaseAudit === 'function') appendCaseAudit('share', '', 'Session off');
            }
            sharePaint();
            return shareState.lastViewUrl;
        }

        async function shareJoinFromHash() {
            const parsed = shareParseHash(location.hash);
            if (!parsed) return false;
            const svc = shareServices();
            if (!svc.api) {
                shareState.error = 'This link needs SHARE_API_URL configured.';
                sharePaint();
                return false;
            }
            const isHost = !!(shareState.hosting && shareState.roomId === parsed.id && shareState.keyB64 === parsed.key);
            shareState.roomId = parsed.id;
            shareState.keyB64 = parsed.key;
            shareState.mode = parsed.mode;
            shareState.lastViewUrl = shareLink(parsed.id, parsed.key);
            if (isHost) {
                shareSetReadonly(false);
                shareShowEnded(false);
                if (shareState.live) shareStartLive();
                sharePaint();
                return true;
            }
            shareState.hosting = false;
            shareState.hostToken = '';
            shareSetReadonly(true);
            await sharePull(true);
            shareStartLive();
            sharePaint();
            return true;
        }

        function shareCopyText(text) {
            const value = String(text || '');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(value);
            }
            return Promise.resolve();
        }

        function sharePaint() {
            const status = document.getElementById('shareCollabStatus');
            const hint = document.getElementById('shareSessionHint');
            const viewUrl = document.getElementById('shareViewUrl');
            const err = document.getElementById('shareCollabError');
            const toggle = document.getElementById('shareSessionLive');
            const hostBox = document.getElementById('shareHostControls');
            const svc = shareServices();
            if (!shareState.readonly) shareEnsureIdentity();
            if (hostBox) hostBox.hidden = !!(shareState.readonly && !shareState.hosting);
            if (toggle && document.activeElement !== toggle) toggle.checked = !!(shareState.hosting && shareState.live);
            if (status) {
                if (!svc.api) status.textContent = 'No share server yet. Add SHARE_API_URL in .env / Settings.';
                else if (shareState.hosting && shareState.live) status.textContent = 'Session on. Anyone with the link can view this case.';
                else if (shareState.hosting) status.textContent = 'Session off. The link stays the same, but nobody can view the case.';
                else if (shareState.ended) status.textContent = 'This session is off. Nothing is available to view.';
                else if (shareState.readonly) status.textContent = 'Viewing an encrypted session.';
                else status.textContent = 'Turn the session on to let the link work. The key stays in the #hash.';
            }
            if (hint) {
                hint.textContent = shareState.live
                    ? 'On. Anyone with the link can view until you end it.'
                    : 'Off. Nobody can view anything.';
            }
            if (viewUrl) {
                const url = shareState.lastViewUrl || (shareState.roomId && shareState.keyB64 ? shareLink(shareState.roomId, shareState.keyB64) : '');
                viewUrl.textContent = url || 'A link appears here once this device is ready.';
            }
            if (err) {
                err.hidden = !shareState.error;
                err.textContent = shareState.error || '';
            }
        }

        window.OrbINTShare = {
            create: function () { return shareSetLive(true); },
            setLive: shareSetLive,
            join: shareJoinFromHash,
            push: function () {
                if (!shareState.hosting || !shareState.live) return Promise.resolve();
                return sharePush().catch(function (error) {
                    shareState.error = String(error && error.message || error);
                    sharePaint();
                });
            },
            paint: sharePaint,
            readonly: function () { return shareState.readonly; },
            digest: shareDigestHex,
            copy: shareCopyText,
            boot: function () {
                shareLoadHost();
                shareJoinFromHash().then(function () {
                    if (shareState.hosting && shareState.live && !shareState.readonly) {
                        return sharePush().then(function () { shareStartLive(); });
                    }
                }).then(function () {
                    sharePaint();
                }).catch(function (error) {
                    shareState.error = String(error && error.message || error);
                    sharePaint();
                });
                window.addEventListener('hashchange', function () {
                    shareJoinFromHash().then(sharePaint);
                });
            }
        };
