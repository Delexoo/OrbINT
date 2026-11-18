/* Operations news, breach check, and test machine */
    function opsNewsCache(next) {
        if (next) {
            try { localStorage.setItem(OPS_NEWS_KEY, JSON.stringify(next)); } catch (error) {}
            return next;
        }
        try {
            const saved = JSON.parse(localStorage.getItem(OPS_NEWS_KEY) || '');
            if (saved && Array.isArray(saved.items)) return saved;
        } catch (error) {}
        return null;
    }

    function opsAbsUrl(url) {
        const value = String(url || '').trim();
        return /^https?:\/\//i.test(value) ? value : '';
    }

    function opsPlain(html) {
        return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    }

    function opsResolveUrl(url, page) {
        const value = String(url || '').trim();
        if (!value) return '';
        if (value.indexOf('//') === 0) return 'https:' + value;
        if (/^https?:\/\//i.test(value)) return value;
        try { return new URL(value, page).href; } catch (error) { return ''; }
    }

    function opsNewsImage(item) {
        const direct = opsAbsUrl(item && item.thumbnail);
        if (direct) return direct;
        const enc = item && item.enclosure;
        const encLink = enc && (enc.link || enc.url);
        const encType = String(enc && enc.type || '');
        if (opsAbsUrl(encLink) && (!encType || encType.indexOf('image') === 0 || /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(encLink))) return encLink;
        const html = String(item && (item.content || item.description) || '');
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? opsAbsUrl(opsResolveUrl(match[1], item && item.link)) : '';
    }

    function opsOgImage(html, page) {
        const tags = String(html || '').match(/<meta\b[^>]*>/gi) || [];
        let found = '';
        tags.forEach(function (tag) {
            if (found) return;
            const image = /property\s*=\s*["']og:image(?::secure_url)?["']/i.test(tag) || /name\s*=\s*["']twitter:image(?::src)?["']/i.test(tag);
            if (!image) return;
            const content = tag.match(/content\s*=\s*["']([^"']+)["']/i);
            if (!content) return;
            const url = opsAbsUrl(opsResolveUrl(opsPlain(content[1]), page));
            if (url && !/sprite|pixel|spacer|favicon/i.test(url)) found = url;
        });
        return found;
    }

    function opsFilterNews(items) {
        const topic = OPS_TOPICS.filter(function (row) { return row.id === opsNewsTopic; })[0] || OPS_TOPICS[0];
        if (!topic.test) return items || [];
        return (items || []).filter(function (item) {
            return topic.test.test((item.title || '') + ' ' + (item.text || ''));
        });
    }

    function opsQueueImages(items) {
        const deck = opsFilterNews(items).slice(0, 8);
        const ordered = deck.concat((items || []).filter(function (item) { return deck.indexOf(item) < 0; }));
        ordered.forEach(function (item) {
            if (!item || item.image || item.imageTried || !item.link) return;
            if (opsImageQueue.indexOf(item) >= 0) return;
            opsImageQueue.push(item);
        });
        opsDrainImages();
    }

    function opsDrainImages() {
        if (opsImageBusy) return;
        const item = opsImageQueue.shift();
        if (!item) return;
        opsImageBusy = true;
        item.imageTries = (item.imageTries || 0) + 1;
        fetch('https://proxy.corsfix.com/?' + item.link).then(function (res) {
            if (res.status === 429 && item.imageTries < 3) {
                opsImageQueue.push(item);
                return '';
            }
            if (!res.ok) throw new Error('image');
            return res.text();
        }).then(function (html) {
            if (!html) return 1200;
            const image = opsOgImage(html, item.link);
            if (!image || image === item.imageBroken) {
                item.imageTried = true;
                return 900;
            }
            item.image = image;
            item.imageTried = true;
            opsNewsCache({ at: opsNewsAt || Date.now(), items: opsNewsAll });
            paintOpsNews(opsNewsAll, opsNewsNote, true);
            if (opsHover && opsHover.ip && opsTipPoint) {
                opsTipKey = '';
                opsPlaceTip(opsHover, opsTipPoint);
            }
            return 900;
        }).catch(function () {
            item.imageTried = true;
            return 900;
        }).then(function (wait) {
            opsImageBusy = false;
            setTimeout(opsDrainImages, wait || 900);
        });
    }

    function opsChapterKey(stories) {
        return stories.map(function (item) { return encodeURIComponent(item.link || ''); }).join(',');
    }

    function opsNewsElapsed() {
        let elapsed = Date.now() - (opsNewsStamp || Date.now());
        if (opsNewsPaused && opsNewsHold) elapsed -= Date.now() - opsNewsHold;
        if (elapsed < 0) elapsed = 0;
        if (elapsed > OPS_NEWS_MS) elapsed = OPS_NEWS_MS;
        return elapsed;
    }

    function resetOpsChapterFill(elapsed) {
        const fill = document.querySelector('#opsNews .ops-chapter-fill');
        if (!fill) return;
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
        fill.style.animationDelay = '-' + (elapsed || 0) + 'ms';
    }

    function mountOpsChapters(box, stories, chapters, slide) {
        const move = ++opsChapterMove;
        const wrap = box.querySelector('.ops-feature-wrap');
        if (!chapters) {
            const key = opsChapterKey(stories);
            const style = '--ops-news-ms:' + OPS_NEWS_MS + 'ms';
            const html = '<div class="ops-chapters" data-key="' + esc(key) + '"><div class="ops-chapter-track" role="tablist" aria-label="Stories" style="' + style + '">' +
                stories.map(function (item, index) {
                    const on = index === opsNewsIndex;
                    const fill = on ? '<span class="ops-chapter-fill" style="animation-delay:-' + opsNewsElapsed() + 'ms"></span>' : '';
                    return '<button type="button" class="ops-dot' + (on ? ' is-on' : '') + '" role="tab" data-news="' + index + '" aria-selected="' + (on ? 'true' : 'false') + '" aria-label="' + esc(item.title || 'Story') + '">' + fill + '</button>';
                }).join('') + '</div></div>';
            if (wrap) wrap.insertAdjacentHTML('afterend', html);
            else box.insertAdjacentHTML('beforeend', html);
            return;
        }
        if (wrap) wrap.insertAdjacentElement('afterend', chapters);
        else box.appendChild(chapters);
        const buttons = chapters.querySelectorAll('.ops-dot');
        buttons.forEach(function (button, index) {
            const on = index === opsNewsIndex;
            button.classList.toggle('is-on', on);
            button.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const on = buttons[opsNewsIndex];
        if (!on) return;
        let fill = chapters.querySelector('.ops-chapter-fill');
        if (!fill) {
            fill = document.createElement('span');
            fill.className = 'ops-chapter-fill';
        }
        const moved = fill.parentNode !== on;
        if (moved) on.appendChild(fill);
        if (move !== opsChapterMove || !on.isConnected) return;
        if (slide) resetOpsChapterFill(0);
        else if (moved) resetOpsChapterFill(opsNewsElapsed());
    }

    let opsNewsSkelTimer = 0;

    function paintOpsNewsSkeleton() {
        const box = $('opsNews');
        if (!box) return;
        box.innerHTML = '<div class="ops-lead ops-skel" aria-hidden="true"><span class="ops-pill">Source</span><h3>Story</h3><p>Summary</p></div>';
    }

    function opsNewsBlurb(text) {
        const value = String(text || '').replace(/\s+/g, ' ').trim();
        if (value.length <= 220) return value;
        return value.slice(0, 217).replace(/\s+\S*$/, '') + '…';
    }

    function paintOpsNews(items, note, keep) {
        clearTimeout(opsNewsSkelTimer);
        opsNewsSkelTimer = 0;
        const box = $('opsNews');
        if (!box) return;
        opsNewsAll = items || [];
        opsNewsNote = note || '';
        const filtered = opsFilterNews(opsNewsAll);
        const stories = filtered.slice(0, 12);
        opsNewsItems = stories;
        if (opsNewsIndex >= stories.length) opsNewsIndex = 0;
        const feature = stories[opsNewsIndex];
        const paintKey = opsNewsTopic + ':' + opsNewsIndex + ':' + (feature && feature.link || '');
        const changed = opsNewsPaintKey !== paintKey;
        opsNewsPaintKey = paintKey;
        if (changed && !keep) {
            opsNewsStamp = Date.now();
            if (opsNewsPaused) opsNewsHold = opsNewsStamp;
        }
        if (!opsNewsStamp) opsNewsStamp = Date.now();
        const filters = '<div class="ops-filters" role="group" aria-label="Topics">' + OPS_TOPICS.map(function (topic) {
            return '<button type="button" data-topic="' + topic.id + '"' + (topic.id === opsNewsTopic ? ' class="is-on"' : '') + '>' + esc(topic.label) + '</button>';
        }).join('') + '</div>';
        const label = opsNewsTopic === 'all' ? ' stories' : ' in topic';
        opsText('opsNewsStatus', filtered.length ? filtered.length + label : (note || 'No stories yet'));
        if (!stories.length) {
            box.innerHTML = filters + '<p class="ops-status">' + esc(note || 'No stories in this topic yet.') + '</p>';
            paintOpsRail();
            return;
        }
        const when = opsAgo(feature.date) || '';
        const blurb = opsNewsBlurb(feature.text);
        const photo = feature.image
            ? '<img class="ops-lead-photo" src="' + esc(feature.image) + '" alt="" width="184" height="144" referrerpolicy="no-referrer">'
            : '';
        const progress = stories.length > 1
            ? '<span class="ops-lead-progress" aria-hidden="true"><span class="ops-chapter-fill" style="animation-delay:-' + opsNewsElapsed() + 'ms"></span></span>'
            : '';
        const wire = stories.filter(function (item, index) { return index !== opsNewsIndex; }).map(function (item) {
            const meta = [item.source || '', opsAgo(item.date) || ''].filter(Boolean).join(' · ');
            return '<a href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(item.title || 'Untitled') + '</b><small>' + esc(meta) + '</small></a>';
        }).join('');
        const updated = opsNewsAt ? opsAgo(opsNewsAt) : '';
        const sources = [];
        filtered.forEach(function (item) {
            if (item.source && sources.indexOf(item.source) < 0) sources.push(item.source);
        });
        const meta = '<p class="ops-news-meta">' + esc(sources.join(', ')) + ' · ' + filtered.length + (opsNewsTopic === 'all' ? ' stories' : ' in this topic') + (updated ? ' · updated ' + esc(updated) : '') + '</p>';
        box.innerHTML = filters + meta +
            '<article class="ops-lead' + (photo ? ' has-photo' : '') + '"><a href="' + esc(feature.link) + '" target="_blank" rel="noopener noreferrer"><p class="ops-lead-meta"><span>' +
            esc(feature.source || 'Security') + '</span>' + (when ? '<time>' + esc(when) + '</time>' : '') + '</p><h3>' +
            esc(feature.title || 'Untitled') + '</h3>' + (blurb ? '<p class="ops-lead-text">' + esc(blurb) + '</p>' : '') + photo + '</a>' + progress + '</article>' +
            (wire ? '<div class="ops-wire">' + wire + '</div>' : '') +
            (note ? '<p class="ops-status">' + esc(note) + '</p>' : '');
        box.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                const failed = img.getAttribute('src');
                const current = opsNewsAll.filter(function (item) { return item.image === failed; })[0];
                if (current && !current.imageBroken) {
                    current.imageBroken = failed;
                    current.image = '';
                    if (!current.imageTried) opsQueueImages([current]);
                }
                const lead = img.closest('.ops-lead');
                if (lead) lead.classList.remove('has-photo');
                img.remove();
            });
        });
        opsQueueImages(opsNewsAll);
        paintOpsRail();
    }

    function opsNewsDayKey() {
        const now = new Date();
        return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    }

    function opsNewsFeeds() {
        const now = new Date();
        const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
        const count = Math.min(4, OPS_FEEDS.length);
        const start = day % OPS_FEEDS.length;
        const picked = [];
        for (let i = 0; i < count; i++) picked.push(OPS_FEEDS[(start + i) % OPS_FEEDS.length]);
        return picked;
    }

    let opsNewsMiss = 0;

    function loadOpsNews(force) {
        const cached = opsNewsCache();
        const today = opsNewsDayKey();
        const staleShape = cached && cached.items && cached.items.some(function (item) { return !('image' in item) || !('text' in item); });
        const sameDay = cached && cached.day === today;
        if (cached && cached.items) {
            opsNewsAt = cached.at || 0;
            paintOpsNews(cached.items, '');
        } else {
            clearTimeout(opsNewsSkelTimer);
            opsNewsSkelTimer = setTimeout(function () {
                opsNewsSkelTimer = 0;
                if (!opsNewsAll.length) paintOpsNewsSkeleton();
            }, 300);
        }
        if (opsNewsBusy) return;
        if (!force && !sameDay && opsNewsMiss && Date.now() - opsNewsMiss < 30 * 60 * 1000) return;
        if (!force && sameDay && cached.at && Date.now() - cached.at < 30 * 60 * 1000 && !staleShape) return;
        opsNewsBusy = true;
        Promise.all(opsNewsFeeds().map(function (feed) {
            const endpoint = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
            return fetch(endpoint).then(function (res) {
                if (!res.ok) throw new Error('feed');
                return res.json();
            }).then(function (payload) {
                const list = payload && payload.items;
                if (!Array.isArray(list)) return [];
                return list.slice(0, 8).map(function (item) {
                    const text = opsPlain(item.description || item.content || '');
                    return {
                        title: String(item.title || ''),
                        link: String(item.link || feed.home),
                        date: item.pubDate || '',
                        source: feed.name,
                        text: text.slice(0, 420),
                        image: opsNewsImage(item)
                    };
                });
            }).catch(function () { return []; });
        })).then(function (groups) {
            const items = groups.reduce(function (all, group) { return all.concat(group); }, []);
            items.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
            if (items.length) {
                opsNewsMiss = 0;
                opsNewsAt = Date.now();
                opsNewsCache({ at: opsNewsAt, day: opsNewsDayKey(), items: items });
                paintOpsNews(items, '');
            } else if (!(cached && cached.items && cached.items.length)) {
                opsNewsMiss = Date.now();
                paintOpsNews([], 'The feeds did not load. Open a publication directly.');
            } else opsNewsMiss = Date.now();
        }).then(function () { opsNewsBusy = false; }, function () { opsNewsBusy = false; });
    }

    window.addEventListener('focus', function () { loadOpsNews(true); });
    window.addEventListener('online', function () { loadOpsNews(true); });

