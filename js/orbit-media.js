/* Photo viewer and photo sheet */
        const IMAGE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v8.2l3.4-3.4a1 1 0 0 1 1.4 0L14 15l2.2-2.2a1 1 0 0 1 1.4 0L19 14.2V6H5zm3.2 2.2A1.3 1.3 0 1 1 8.2 11a1.3 1.3 0 0 1 0-2.6z"/></svg>';
        const AUDIO_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18V6.3c0-.7.4-1.2 1-1.4l9-3c.8-.3 1.6.3 1.6 1.1V15c0 .6-.4 1-1 1.2l-8 2.4V18c0 2-2 3.5-4.3 3.5S3 20 3 18s2-3.5 4.3-3.5c.6 0 1.1.1 1.7.3z"/></svg>';
        const PIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c3.3 0 6 2.6 6 5.8 0 4.4-6 12.2-6 12.2S6 12.2 6 7.8C6 4.6 8.7 2 12 2zm0 3.2A2.6 2.6 0 1 0 12 10.4 2.6 2.6 0 0 0 12 5.2z"/></svg>';

        function looksLikeIp(value) {
            const v = String(value || '').trim();
            if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) {
                return v.split('.').every((part) => Number(part) <= 255);
            }
            return v.length > 2 && v.indexOf(':') !== -1 && /^[0-9a-f:]+$/i.test(v);
        }

        async function openIpLocation(ip) {
            const clean = String(ip || '').trim();
            if (!looksLikeIp(clean)) return;
            try {
                const response = await fetch('https://ipwho.is/' + encodeURIComponent(clean));
                const data = await response.json();
                if (data && data.success && data.latitude != null && data.longitude != null) {
                    window.open(
                        'https://www.google.com/maps?q=' + encodeURIComponent(data.latitude + ',' + data.longitude),
                        '_blank',
                        'noopener,noreferrer'
                    );
                    return;
                }
            } catch (error) {}
            window.open('https://ipinfo.io/' + encodeURIComponent(clean), '_blank', 'noopener,noreferrer');
        }

        function mediaSource(fieldId) {
            const input = document.getElementById('field-' + fieldId);
            const live = input && input.value.trim();
            const fact = fieldId === 'image' ? (primaryImageFact() || latestFact(fieldId)) : latestFact(fieldId);
            const session = mediaStore[fieldId];
            if (fieldId === 'audio' && looksLikeUrl(live)) return { src: live, kind: 'audio', name: live };
            if (session && session.src) return session;
            if (fact && fact.media) return { src: fact.media, kind: fact.kind || fieldId, name: fact.value, blur: fact.blur || '' };
            if (fieldId === 'audio' && looksLikeAudioSrc(live)) return { src: live, kind: 'audio', name: live };
            if (fact && fieldId === 'image' && looksLikeImageSrc(fact.value)) return { src: fact.value, kind: 'image', name: fact.value, blur: fact.blur || '' };
            if (fact && fieldId === 'audio' && looksLikeAudioSrc(fact.value)) return { src: fact.value, kind: 'audio', name: fact.value };
            if (fact && fact.preview) return { src: fact.preview, kind: 'image', name: fact.value, blur: fact.blur || '' };
            return null;
        }

        function setFieldThumb(fieldId) {
            const node = document.querySelector('.node[data-field="' + fieldId + '"]');
            const thumb = node && node.querySelector('.media-thumb');
            const input = document.getElementById('field-' + fieldId);
            if (!node || !thumb) return;
            if (fieldBase(fieldId) === 'ip' || fieldBase(fieldId) === 'address') {
                const ready = fieldBase(fieldId) === 'ip'
                    ? looksLikeIp((input && input.value.trim()) || firstValue(fieldId))
                    : !!mapsQueryForField(fieldId);
                if (ready) {
                    thumb.hidden = false;
                    thumb.innerHTML = PIN_ICON;
                    thumb.setAttribute('aria-label', fieldBase(fieldId) === 'address' ? 'Open in Google Maps' : 'Open IP location');
                    thumb.title = fieldBase(fieldId) === 'address' ? 'Google Maps' : 'Map';
                    node.classList.add('has-preview');
                } else {
                    thumb.hidden = true;
                    thumb.innerHTML = '';
                    thumb.removeAttribute('title');
                    node.classList.remove('has-preview');
                }
                return;
            }
            const media = mediaSource(fieldId);
            if (!media) {
                thumb.hidden = true;
                thumb.innerHTML = '';
                node.classList.remove('has-preview');
                if (fieldId === 'image') updateHubFace();
                return;
            }
            thumb.hidden = false;
            node.classList.add('has-preview');
            if (fieldId === 'image') {
                const src = String(media.src || '');
                let img = thumb.querySelector('img');
                if (!img) {
                    thumb.textContent = '';
                    img = document.createElement('img');
                    img.alt = '';
                    thumb.appendChild(img);
                }
                if (img.getAttribute('src') !== src) img.src = src;
                img.onerror = function () {
                    thumb.innerHTML = IMAGE_ICON;
                };
                updateHubFace();
            } else {
                thumb.innerHTML = AUDIO_ICON;
            }
        }

        const DEFAULT_FACE = 'icons/defaultprofile.jpg';

        function subjectDisplayName() {
            return firstValue('name') || 'Anonymous';
        }

        function filedPortraitSrc() {
            const photo = mediaSource('image');
            if (photo && photo.src && (photo.kind === 'image' || !photo.kind)) {
                return String(photo.src).replace(/"/g, '');
            }
            return '';
        }

        function portraitSrc() {
            return filedPortraitSrc() || DEFAULT_FACE;
        }

        function updateHubFace() {
            const face = document.getElementById('hubFace');
            if (!hub || !face) return;
            const photo = mediaSource('image');
            const src = filedPortraitSrc();
            if (src) {
                face.width = 120;
                face.height = 120;
                if (photo && photo.blur && face.getAttribute('src') !== src) {
                    face.src = photo.blur;
                    face.style.filter = 'blur(8px)';
                    const full = new Image();
                    full.onload = function () {
                        if (filedPortraitSrc() !== src) return;
                        face.src = src;
                        face.style.filter = '';
                    };
                    full.src = src;
                } else if (face.getAttribute('src') !== src) {
                    face.src = src;
                    face.style.filter = '';
                }
                face.hidden = false;
                hub.classList.add('has-face');
                face.onerror = function () {
                    face.removeAttribute('src');
                    face.hidden = true;
                    hub.classList.remove('has-face');
                };
                return;
            }
            face.removeAttribute('src');
            face.hidden = true;
            hub.classList.remove('has-face');
        }

        let mediaGallery = { items: [], index: 0, fieldId: '' };

        function closeMediaViewer() {
            const viewer = document.getElementById('mediaViewer');
            const audio = document.getElementById('mediaAudio');
            const prev = document.getElementById('mediaPrev');
            const next = document.getElementById('mediaNext');
            const counter = document.getElementById('mediaCounter');
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
            if (prev) prev.hidden = true;
            if (next) next.hidden = true;
            if (counter) {
                counter.hidden = true;
                counter.textContent = '';
            }
            mediaGallery.items = [];
            mediaGallery.index = 0;
            mediaGallery.fieldId = '';
            if (viewer) viewer.hidden = true;
        }

        function syncMediaGalleryChrome() {
            const prev = document.getElementById('mediaPrev');
            const next = document.getElementById('mediaNext');
            const counter = document.getElementById('mediaCounter');
            const multi = mediaGallery.items.length > 1;
            if (prev) prev.hidden = !multi;
            if (next) next.hidden = !multi;
            if (counter) {
                if (multi) {
                    counter.hidden = false;
                    counter.textContent = (mediaGallery.index + 1) + ' / ' + mediaGallery.items.length;
                } else {
                    counter.hidden = true;
                    counter.textContent = '';
                }
            }
        }

        function showMediaGalleryItem() {
            const item = mediaGallery.items[mediaGallery.index];
            const image = document.getElementById('mediaImage');
            const card = document.getElementById('mediaAudioCard');
            if (!item || !image) return;
            if (card) card.hidden = true;
            image.hidden = false;
            image.src = item.src;
            syncMediaGalleryChrome();
        }

        function stepMediaGallery(delta) {
            if (photosSheetOpen()) {
                const items = imageGalleryItems();
                if (items.length < 2) return;
                mediaGallery.items = items;
                mediaGallery.index = (mediaGallery.index + delta + items.length) % items.length;
                renderPhotosSheet();
                return;
            }
            if (mediaGallery.items.length < 2) return;
            const len = mediaGallery.items.length;
            mediaGallery.index = (mediaGallery.index + delta + len) % len;
            showMediaGalleryItem();
        }

        function openImageGallery(startIndex) {
            openPhotosSheet(startIndex);
        }

        function openMediaViewer(fieldId) {
            if (fieldId === 'image') {
                openImageGallery();
                return;
            }
            const media = mediaSource(fieldId);
            if (!media || !media.src) return;
            const viewer = document.getElementById('mediaViewer');
            const image = document.getElementById('mediaImage');
            const card = document.getElementById('mediaAudioCard');
            const audio = document.getElementById('mediaAudio');
            const name = document.getElementById('mediaAudioName');
            if (!viewer) return;
            closePlatformMenu();
            mediaGallery.items = [];
            mediaGallery.index = 0;
            mediaGallery.fieldId = fieldId;
            syncMediaGalleryChrome();
            if (fieldId === 'audio' || media.kind === 'audio') {
                image.hidden = true;
                card.hidden = false;
                name.textContent = media.name || (latestFact(fieldId) && latestFact(fieldId).value) || 'Audio';
                audio.src = media.src;
                audio.play().catch(function () {});
            } else {
                card.hidden = true;
                image.hidden = false;
                image.src = media.src;
            }
            viewer.hidden = false;
        }

        function imageFactSrc(fact, preferPreview) {
            if (!fact) return '';
            if (preferPreview && fact.preview) return String(fact.preview).replace(/"/g, '');
            if (fact.media) return String(fact.media).replace(/"/g, '');
            if (looksLikeImageSrc(fact.value)) return String(fact.value).replace(/"/g, '');
            if (fact.preview) return String(fact.preview).replace(/"/g, '');
            if (looksLikeUrl(fact.value)) return String(fact.value).replace(/"/g, '');
            return '';
        }

        function imageFacts() {
            return ((profile.facts && profile.facts.image) || []).filter((item) => item && String(item.value || '').trim());
        }

        function primaryImageFact() {
            return imageFacts()[0] || null;
        }

        function imageGalleryItems() {
            const facts = imageFacts();
            return facts.map((fact, index) => {
                const src = imageFactSrc(fact, false);
                const thumb = imageFactSrc(fact, true) || src;
                if (!src && !thumb) return null;
                const href = src || thumb;
                return {
                    index: index,
                    src: href,
                    thumb: thumb || src,
                    name: fact.value || 'Image',
                    value: fact.value,
                    http: /^https?:\/\//i.test(href) || looksLikeUrl(fact.value),
                    primary: index === 0
                };
            }).filter(Boolean);
        }

        function photoDownloadName(item) {
            const raw = String((item && item.name) || '').split(/[\\/]/).pop().split('?')[0];
            if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(raw)) return raw;
            const dataExt = String((item && item.src) || '').match(/^data:image\/([\w+]+)/i);
            let ext = dataExt ? dataExt[1].toLowerCase().replace('jpeg', 'jpg').replace('+xml', '') : '';
            if (!ext && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(String((item && item.src) || ''))) {
                ext = String(item.src).match(/\.(png|jpe?g|gif|webp|bmp|svg)/i)[1].toLowerCase().replace('jpeg', 'jpg');
            }
            const subject = (firstValue('name') || 'photo').replace(/[^\w\-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
            return (subject || 'photo') + '-' + (((item && item.index) || 0) + 1) + '.' + (ext || 'jpg');
        }

        function openPhotoInTab(item) {
            const src = item && item.src;
            if (!src) return;
            if (/^https?:\/\//i.test(src)) {
                window.open(src, '_blank', 'noopener,noreferrer');
                return;
            }
            srcToBlob(src).then(function (blob) {
                window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
            }).catch(function () {
                window.open(src, '_blank', 'noopener,noreferrer');
            });
        }

        function downloadPhotoItem(item) {
            const src = item && item.src;
            if (!src) return;
            const name = photoDownloadName(item);
            const save = function (href, revoke) {
                const link = document.createElement('a');
                link.href = href;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                link.remove();
                if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 1500);
            };
            if (/^(data:|blob:)/i.test(src)) {
                save(src, false);
                return;
            }
            srcToBlob(src).then(function (blob) {
                save(URL.createObjectURL(blob), true);
            }).catch(function () {
                window.open(src, '_blank', 'noopener,noreferrer');
            });
        }

        function copyPhotoItem(item, button) {
            if (!item) return Promise.resolve();
            const href = item.http ? (looksLikeUrl(item.value) ? item.value : item.src) : '';
            const done = function () {
                if (!button) return;
                button.classList.add('is-done');
                const prior = button.getAttribute('title') || 'Copy';
                button.setAttribute('title', 'Copied');
                setTimeout(function () {
                    button.classList.remove('is-done');
                    button.setAttribute('title', prior);
                }, 1100);
            };
            if (href) {
                return (navigator.clipboard && navigator.clipboard.writeText
                    ? navigator.clipboard.writeText(href)
                    : Promise.resolve()).then(done).catch(function () {});
            }
            return copyImageSource(item.src).then(done);
        }

        function searchPhotoItem(item) {
            const src = item && item.src;
            if (!src) return;
            if (/^https?:\/\//i.test(src)) {
                window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(src), '_blank', 'noopener,noreferrer');
                return;
            }
            copyImageSource(src).finally(function () {
                window.open('https://lens.google.com/upload', '_blank', 'noopener,noreferrer');
            });
        }

        function reorderPhotoItem(index, delta) {
            const items = imageFacts();
            const next = index + delta;
            if (next < 0 || next >= items.length) return;
            const ordered = items.slice();
            const moved = ordered.splice(index, 1)[0];
            ordered.splice(next, 0, moved);
            profile.facts.image = ordered;
            mediaGallery.index = next;
            finishProfilePhotos(true);
        }

        function promotePhotoItem(item) {
            reorderPhotoItem(item && item.index, -(item && item.index));
        }

        function deletePhotoItem(item) {
            if (!item) return;
            removeFact('image', item.value);
            if (photosSheetOpen()) renderPhotosSheet();
        }

        const FACE_ADD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

        function renderFaceGallery() {
            const gallery = document.getElementById('faceGallery');
            if (!gallery) return;
            gallery.innerHTML = '<button type="button" class="face-view" data-face-view aria-label="View photos">View</button>';
        }

        function photosSheetOpen() {
            const sheet = document.getElementById('photosSheet');
            return !!(sheet && !sheet.hidden);
        }

        function closePhotosSheet() {
            const sheet = document.getElementById('photosSheet');
            if (sheet) sheet.classList.remove('is-drop');
            hideSheet(sheet);
        }

        const PHOTO_ACT_ICON = {
            open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5h5v5"/><path d="M10 14L19 5"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>',
            copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg>',
            search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>',
            meta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>',
            left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
            right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
            remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
        };

        function photoActButton(act, title, icon, extra) {
            return '<button type="button" data-photo-act="' + act + '" data-tip="' + title + '" aria-label="' + title + '"' + (extra || '') + '>' + icon + '</button>';
        }

        function renderPhotosSheet() {
            const items = imageGalleryItems();
            mediaGallery.items = items;
            if (mediaGallery.index >= items.length) mediaGallery.index = Math.max(0, items.length - 1);
            const empty = document.getElementById('photosEmpty');
            const list = document.getElementById('photosList');
            const count = document.getElementById('photosCount');
            if (empty) empty.hidden = items.length > 0;
            if (count) count.textContent = items.length ? (items.length === 1 ? '1 photo' : items.length + ' photos') : '';
            if (!list) return;
            list.hidden = !items.length;
            list.replaceChildren();
            items.forEach((entry, i) => {
                const article = document.createElement('article');
                article.className = 'photos-item' + (entry.primary ? ' primary' : '');
                article.dataset.photosIndex = String(i);
                const img = document.createElement('img');
                img.alt = entry.primary ? 'Primary photo' : 'Photo ' + (i + 1);
                img.decoding = 'async';
                img.referrerPolicy = 'no-referrer';
                const thumb = entry.thumb || entry.src;
                const full = entry.src || entry.thumb;
                img.src = thumb || full;
                if (full && thumb && full !== thumb) {
                    img.addEventListener('error', function () { img.src = full; }, { once: true });
                }
                article.appendChild(img);
                if (entry.primary) {
                    const badge = document.createElement('span');
                    badge.className = 'photos-badge';
                    badge.textContent = 'Primary';
                    article.appendChild(badge);
                }
                const actions = document.createElement('div');
                actions.className = 'photos-actions';
                actions.innerHTML =
                    photoActButton('left', 'Move left', PHOTO_ACT_ICON.left, i === 0 ? ' disabled' : '') +
                    photoActButton('right', 'Move right', PHOTO_ACT_ICON.right, i === items.length - 1 ? ' disabled' : '') +
                    '<span class="spacer"></span>' +
                    photoActButton('open', 'Open', PHOTO_ACT_ICON.open) +
                    photoActButton('download', 'Download', PHOTO_ACT_ICON.download) +
                    photoActButton(entry.http ? 'copy' : 'copy-image', entry.http ? 'Copy URL' : 'Copy image', PHOTO_ACT_ICON.copy) +
                    photoActButton('search', 'Reverse search', PHOTO_ACT_ICON.search) +
                    photoActButton('meta', 'Metadata', PHOTO_ACT_ICON.meta) +
                    photoActButton('delete', 'Remove', PHOTO_ACT_ICON.remove, ' class="danger"');
                article.appendChild(actions);
                list.appendChild(article);
            });
            const active = list.querySelector('[data-photos-index="' + mediaGallery.index + '"]');
            if (active) list.scrollLeft = Math.max(0, active.offsetLeft - 12);
        }

        function openPhotosSheet(startIndex) {
            const items = imageGalleryItems();
            mediaGallery.fieldId = 'image';
            mediaGallery.items = items;
            mediaGallery.index = items.length
                ? Math.max(0, Math.min(items.length - 1, startIndex == null ? items.length - 1 : startIndex))
                : 0;
            closePlatformMenu();
            closeSearchMenu();
            closeExportMenu();
            closeFieldMenu();
            renderPhotosSheet();
            showSheet(document.getElementById('photosSheet'));
        }

