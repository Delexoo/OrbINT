/* Notepad rich text: selection menu and per-line format */

    const NOTE_TAGS = { b: 1, strong: 1, i: 1, em: 1, u: 1, s: 1, strike: 1, del: 1, sup: 1, sub: 1, mark: 1, code: 1, span: 1, br: 1, div: 1, p: 1 };
    const NOTE_FONTS = {
        serif: 'Georgia, "Times New Roman", serif',
        sans: '"Segoe UI", sans-serif',
        mono: 'ui-monospace, Consolas, monospace',
        narrow: '"Arial Narrow", sans-serif'
    };
    const NOTE_COLORS = { '#fafafa': 1, '#a1a1aa': 1, '#f87171': 1, '#fb923c': 1, '#facc15': 1, '#4ade80': 1, '#67e8f9': 1, '#60a5fa': 1, '#c084fc': 1, '#f472b6': 1 };
    const NOTE_MARKS = { '#fde047': 1, '#86efac': 1, '#67e8f9': 1, '#fdba74': 1, '#f9a8d4': 1 };
    const NOTE_SIZES = { '12px': 1, '14px': 1, '15px': 1, '18px': 1, '22px': 1, '28px': 1 };
    let noteFormatRange = null;
    let noteFormatBlock = null;
    let noteFormatNote = '';
    let notePlusBlock = null;

    function noteColorHex(value) {
        const raw = String(value || '').trim().toLowerCase();
        if (/^#[0-9a-f]{3}$/.test(raw)) return '#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3];
        if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
        const rgb = raw.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
        if (!rgb) return '';
        return '#' + [rgb[1], rgb[2], rgb[3]].map(function (part) {
            const hex = Number(part).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function noteKnownColor(value) {
        const hex = noteColorHex(value);
        return NOTE_COLORS[hex] || NOTE_MARKS[hex] ? hex : '';
    }

    function noteFontKey(value) {
        const text = String(value || '').toLowerCase().replace(/["']/g, '');
        if (!text || text === 'inherit') return '';
        if (text.indexOf('narrow') >= 0) return 'narrow';
        if (text.indexOf('mono') >= 0 || text.indexOf('consolas') >= 0 || text.indexOf('courier') >= 0) return 'mono';
        if (text.indexOf('georgia') >= 0 || text.indexOf('times') >= 0) return 'serif';
        if (text.indexOf('segoe') >= 0) return 'sans';
        return '';
    }

    function noteSafeStyle(style) {
        const out = [];
        String(style || '').split(';').forEach(function (part) {
            const idx = part.indexOf(':');
            if (idx < 0) return;
            const key = part.slice(0, idx).trim().toLowerCase();
            const raw = part.slice(idx + 1).trim();
            let value = '';
            if (key === 'color' || key === 'background-color') value = noteKnownColor(raw);
            else if (key === 'font-size') value = NOTE_SIZES[raw.toLowerCase()] ? raw.toLowerCase() : '';
            else if (key === 'font-family') value = NOTE_FONTS[noteFontKey(raw)] || '';
            else if (key === 'font-weight' && /^(700|bold)$/i.test(raw)) value = '700';
            else if (key === 'font-style' && /^italic$/i.test(raw)) value = 'italic';
            else if (key === 'text-decoration') {
                const text = raw.toLowerCase();
                const bits = [];
                if (text.indexOf('underline') >= 0) bits.push('underline');
                if (text.indexOf('line-through') >= 0) bits.push('line-through');
                value = bits.join(' ');
            }
            if (value) out.push(key + ': ' + value);
        });
        return out.join('; ');
    }

    function noteCleanNode(node) {
        Array.from(node.childNodes).forEach(function (child) {
            if (child.nodeType !== 1) {
                if (child.nodeType !== 3) node.removeChild(child);
                return;
            }
            const tag = child.tagName.toLowerCase();
            if (!NOTE_TAGS[tag]) {
                noteCleanNode(child);
                while (child.firstChild) node.insertBefore(child.firstChild, child);
                node.removeChild(child);
                return;
            }
            const style = noteSafeStyle(child.getAttribute('style') || '');
            const code = (tag === 'div' || tag === 'p') && child.classList.contains('is-code');
            while (child.attributes.length) child.removeAttribute(child.attributes[0].name);
            if (style) child.setAttribute('style', style);
            if (code) child.className = 'is-code';
            noteCleanNode(child);
            if (tag === 'span' && !child.getAttribute('style') && child.parentNode) {
                while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
                child.parentNode.removeChild(child);
            }
        });
    }

    function noteSanitize(html) {
        const root = document.createElement('div');
        root.innerHTML = String(html || '');
        noteCleanNode(root);
        return root.innerHTML;
    }

    function noteHasFormat(html) {
        return /style=|class="is-code"|<(b|strong|i|em|u|s|strike|del|sup|sub|code|mark)\b/i.test(String(html || ''));
    }

    function noteInlineText(node) {
        let text = '';
        const kids = Array.from(node.childNodes || []);
        kids.forEach(function (child) {
            if (child.nodeType === 3) text += child.nodeValue || '';
            else if (child.nodeName === 'BR') {
                if (child !== kids[kids.length - 1]) text += '\n';
            } else text += noteInlineText(child);
        });
        return text.replace(/\u00a0/g, ' ');
    }

    function notePlainFrom(root) {
        if (!root) return '';
        const blocks = [];
        Array.from(root.childNodes).forEach(function (node) {
            if (node.nodeType === 3) blocks.push(node.nodeValue || '');
            else if (node.nodeType === 1) blocks.push(noteInlineText(node));
        });
        return blocks.join('\n').replace(/\u00a0/g, ' ');
    }

    function notePlainFromHtml(html) {
        const holder = document.createElement('div');
        holder.innerHTML = html;
        return notePlainFrom(holder);
    }

    function noteSameText(a, b) {
        return String(a || '').replace(/\u00a0/g, ' ').replace(/\s+$/g, '') === String(b || '').replace(/\u00a0/g, ' ').replace(/\s+$/g, '');
    }

    function noteTextToHtml(text) {
        const value = String(text || '');
        if (!value) return '';
        return value.split('\n').map(function (line) {
            return '<div>' + (esc(line) || '<br>') + '</div>';
        }).join('');
    }

    function noteMarkEmpty(el) {
        if (el) el.classList.toggle('is-empty', !notePlainFrom(el));
    }

    function noteFillBody(el, note) {
        if (!el) return;
        if (!note) {
            el.innerHTML = '';
            noteMarkEmpty(el);
            return;
        }
        const plain = String(note.body || '');
        let html = note.html ? noteSanitize(note.html) : '';
        if (html && !noteSameText(notePlainFromHtml(html), plain)) html = '';
        el.innerHTML = html || noteTextToHtml(plain);
        noteMarkEmpty(el);
    }

    function noteBodySelection() {
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || sel.isCollapsed || !sel.rangeCount) return false;
        return body.contains(sel.getRangeAt(0).commonAncestorContainer);
    }

    function noteCaptureRange() {
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (!body.contains(range.commonAncestorContainer)) return null;
        return range.cloneRange();
    }

    function noteRestoreRange() {
        const body = $('noteBody');
        if (!body) return;
        body.focus();
        if (!noteFormatRange) return;
        const sel = window.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        try { sel.addRange(noteFormatRange); } catch (error) {}
    }

    function noteRememberRange() {
        noteFormatRange = noteCaptureRange();
    }

    function noteOwningBlock(node) {
        const body = $('noteBody');
        let el = node && node.nodeType === 1 ? node : node && node.parentElement;
        if (!el || !body || !body.contains(el)) return null;
        if (el === body) return body.firstElementChild || null;
        while (el.parentElement && el.parentElement !== body) el = el.parentElement;
        return el === body ? null : el;
    }

    function noteBlockIsEmpty(block) {
        return !String(block && block.textContent || '').replace(/\u00a0/g, '').trim();
    }

    function noteCoversBlock(range, block) {
        if (!range || !block) return false;
        if (noteBlockIsEmpty(block)) return block.contains(range.startContainer);
        const full = document.createRange();
        full.selectNodeContents(block);
        try {
            return range.compareBoundaryPoints(Range.START_TO_START, full) <= 0 && range.compareBoundaryPoints(Range.END_TO_END, full) >= 0;
        } catch (error) {
            return false;
        }
    }

    function noteLiveBlock() {
        const body = $('noteBody');
        if (noteFormatBlock && body && body.contains(noteFormatBlock)) return noteFormatBlock;
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        return noteOwningBlock(sel.getRangeAt(0).startContainer);
    }

    function noteClosest(node, selector) {
        const body = $('noteBody');
        const el = node && node.nodeType === 1 ? node : node && node.parentElement;
        if (!el || !el.closest || !body) return null;
        const host = el.closest(selector);
        return host && body.contains(host) ? host : null;
    }

    function noteInlineValue(node, prop) {
        const body = $('noteBody');
        let el = node && node.nodeType === 1 ? node : node && node.parentElement;
        while (el && body && el !== body) {
            if (el.style && el.style[prop]) return el.style[prop];
            el = el.parentElement;
        }
        return '';
    }

    function noteUnwrapElement(node) {
        const parent = node && node.parentNode;
        if (!parent) return;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
    }

    function noteStripProp(node, prop) {
        if (!node || !node.childNodes) return;
        if (node.nodeType === 1 && node.style) {
            node.style[prop] = '';
            if (node.getAttribute('style') === '') node.removeAttribute('style');
        }
        Array.from(node.childNodes).forEach(function (child) { noteStripProp(child, prop); });
    }

    function notePruneSpans(node) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(notePruneSpans);
        if (node.nodeType === 1 && node.tagName === 'SPAN' && !node.getAttribute('style')) noteUnwrapElement(node);
    }

    function noteStripTag(node, tag) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(function (child) { noteStripTag(child, tag); });
        if (node.nodeType === 1 && node.tagName === tag) noteUnwrapElement(node);
    }

    function noteReselect(node) {
        if (!node) return;
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function noteCommandOn(command) {
        try { return !!document.queryCommandState(command); } catch (error) { return false; }
    }

    function noteFinishFormat() {
        noteRememberRange();
        noteSyncFormat();
        const body = $('noteBody');
        if (body) noteMarkEmpty(body);
        writeActiveNote();
    }

    function noteRun(command) {
        try { document.execCommand(command, false, null); } catch (error) {}
    }

    function noteToggleCommand(command, prop, onValue) {
        noteRestoreRange();
        const block = noteLiveBlock();
        if (block && noteBlockIsEmpty(block)) {
            block.style[prop] = block.style[prop] === onValue ? '' : onValue;
            if (!block.getAttribute('style')) block.removeAttribute('style');
        } else noteRun(command);
        noteFinishFormat();
    }

    function noteToggleDecor(word, command) {
        noteRestoreRange();
        const block = noteLiveBlock();
        if (block && noteBlockIsEmpty(block)) {
            const parts = String(block.style.textDecoration || '').toLowerCase().split(/\s+/).filter(Boolean);
            const has = parts.indexOf(word) >= 0;
            block.style.textDecoration = (has ? parts.filter(function (part) { return part !== word; }) : parts.concat([word])).join(' ');
            if (!block.getAttribute('style')) block.removeAttribute('style');
        } else noteRun(command);
        noteFinishFormat();
    }

    function noteApplyProp(prop, value) {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (block && (range.collapsed || noteCoversBlock(range, block))) {
            block.style[prop] = value || '';
            if (!block.getAttribute('style')) block.removeAttribute('style');
            Array.from(block.childNodes).forEach(function (child) { noteStripProp(child, prop); });
            notePruneSpans(block);
            noteReselect(block);
            noteFinishFormat();
            return;
        }
        if (range.collapsed) {
            noteFinishFormat();
            return;
        }
        const frag = range.extractContents();
        noteStripProp(frag, prop);
        notePruneSpans(frag);
        if (value) {
            const span = document.createElement('span');
            span.style[prop] = value;
            span.appendChild(frag);
            range.insertNode(span);
            noteReselect(span);
        } else range.insertNode(frag);
        noteFinishFormat();
    }

    function noteToggleCode() {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const host = noteClosest(range.startContainer, 'code');
        const block = noteLiveBlock();
        if (host) {
            noteUnwrapElement(host);
            if (block) noteReselect(block);
        } else if (range.collapsed && block) {
            block.classList.toggle('is-code');
        } else if (!range.collapsed) {
            const code = document.createElement('code');
            code.appendChild(range.extractContents());
            range.insertNode(code);
            noteReselect(code);
        }
        noteFinishFormat();
    }

    function noteApplyHighlight(color) {
        noteRestoreRange();
        const hex = noteKnownColor(color);
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (!hex) {
            if (block) {
                block.style.backgroundColor = '';
                if (!block.getAttribute('style')) block.removeAttribute('style');
            }
            if (!range.collapsed) {
                const frag = range.extractContents();
                noteStripTag(frag, 'MARK');
                noteStripProp(frag, 'backgroundColor');
                range.insertNode(frag);
            }
            noteFinishFormat();
            return;
        }
        if (range.collapsed && block) {
            block.style.backgroundColor = noteColorHex(block.style.backgroundColor) === hex ? '' : hex;
            if (!block.getAttribute('style')) block.removeAttribute('style');
            noteFinishFormat();
            return;
        }
        if (range.collapsed) {
            noteFinishFormat();
            return;
        }
        const mark = document.createElement('mark');
        mark.style.backgroundColor = hex;
        const frag = range.extractContents();
        noteStripTag(frag, 'MARK');
        mark.appendChild(frag);
        range.insertNode(mark);
        noteReselect(mark);
        noteFinishFormat();
    }

    function noteFlattenFormat(node) {
        if (!node || !node.childNodes) return;
        Array.from(node.childNodes).forEach(noteFlattenFormat);
        if (node.nodeType !== 1) return;
        const tag = node.tagName;
        if (tag === 'DIV' || tag === 'P') {
            node.removeAttribute('style');
            node.classList.remove('is-code');
            return;
        }
        if (/^(CODE|MARK|SPAN|FONT|B|STRONG|I|EM|U|S|STRIKE|DEL|SUP|SUB)$/.test(tag)) noteUnwrapElement(node);
    }

    function noteClearFormat() {
        noteRestoreRange();
        const body = $('noteBody');
        const sel = window.getSelection();
        if (!body || !sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const block = noteLiveBlock();
        if (block && (range.collapsed || noteCoversBlock(range, block))) {
            block.removeAttribute('style');
            block.classList.remove('is-code');
        }
        if (!range.collapsed) {
            noteRun('removeFormat');
            const live = window.getSelection();
            if (live && live.rangeCount) {
                const again = live.getRangeAt(0);
                if (!again.collapsed && body.contains(again.commonAncestorContainer)) {
                    const frag = again.extractContents();
                    noteFlattenFormat(frag);
                    again.insertNode(frag);
                }
            }
        }
        if (block) noteReselect(block);
        noteFinishFormat();
    }

    function noteApplyFormat(kind, value) {
        if (kind === 'bold') noteToggleCommand('bold', 'fontWeight', '700');
        else if (kind === 'italic') noteToggleCommand('italic', 'fontStyle', 'italic');
        else if (kind === 'underline') noteToggleDecor('underline', 'underline');
        else if (kind === 'strike') noteToggleDecor('line-through', 'strikeThrough');
        else if (kind === 'sup') noteToggleCommand('superscript', 'verticalAlign', 'super');
        else if (kind === 'sub') noteToggleCommand('subscript', 'verticalAlign', 'sub');
        else if (kind === 'code') noteToggleCode();
        else if (kind === 'clear') noteClearFormat();
        else if (kind === 'size') noteApplyProp('fontSize', value || '');
        else if (kind === 'color') noteApplyProp('color', value || '');
        else if (kind === 'font') noteApplyProp('fontFamily', value ? (NOTE_FONTS[value] || '') : '');
        else if (kind === 'highlight') noteApplyHighlight(value || '');
    }

    function noteSyncFormat() {
        const menu = $('noteFormat');
        if (!menu) return;
        const sel = window.getSelection();
        const node = sel && sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
        const size = noteInlineValue(node, 'fontSize');
        const color = noteColorHex(noteInlineValue(node, 'color'));
        const font = noteFontKey(noteInlineValue(node, 'fontFamily'));
        const decor = noteInlineValue(node, 'textDecoration').toLowerCase();
        const mark = noteClosest(node, 'mark');
        const block = noteLiveBlock();
        const markColor = noteColorHex((mark && mark.style.backgroundColor) || noteInlineValue(node, 'backgroundColor'));
        const code = !!(noteClosest(node, 'code') || (block && block.classList.contains('is-code')));
        menu.querySelectorAll('[data-fmt]').forEach(function (button) {
            const kind = button.getAttribute('data-fmt');
            const value = button.getAttribute('data-value') || '';
            let on = false;
            if (kind === 'bold') on = noteCommandOn('bold') || noteInlineValue(node, 'fontWeight') === '700';
            else if (kind === 'italic') on = noteCommandOn('italic') || noteInlineValue(node, 'fontStyle') === 'italic';
            else if (kind === 'underline') on = noteCommandOn('underline') || decor.indexOf('underline') >= 0;
            else if (kind === 'strike') on = noteCommandOn('strikeThrough') || decor.indexOf('line-through') >= 0;
            else if (kind === 'sup') on = noteCommandOn('superscript');
            else if (kind === 'sub') on = noteCommandOn('subscript');
            else if (kind === 'code') on = code;
            else if (kind === 'size') on = value ? size === value : !size;
            else if (kind === 'color') on = value ? color === value : !color;
            else if (kind === 'font') on = value ? font === value : !font;
            else if (kind === 'highlight') on = value ? markColor === noteColorHex(value) : !markColor;
            button.classList.toggle('is-on', on);
            if (button.hasAttribute('aria-label') && kind !== 'color' && kind !== 'highlight') button.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function closeNoteFormat() {
        const menu = $('noteFormat');
        if (menu) menu.hidden = true;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.remove('is-on');
        noteFormatRange = null;
        noteFormatBlock = null;
    }

    function openNoteFormat(x, y) {
        const menu = $('noteFormat');
        if (!menu) return;
        hideFieldMenu();
        closeNoteMenu();
        noteFormatRange = noteCaptureRange();
        noteFormatNote = notepadState().active || '';
        if (menu.parentElement !== document.body) document.body.appendChild(menu);
        placeAppMenu(menu, x, y);
        noteSyncFormat();
    }

    function openNoteSelectionFormat(x, y) {
        noteFormatBlock = null;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.remove('is-on');
        openNoteFormat(x, y);
    }

    function noteSelectBlock(block) {
        const body = $('noteBody');
        if (!body || !block) return null;
        let target = block;
        if (target === body) {
            if (!body.firstElementChild) body.innerHTML = '<div><br></div>';
            target = body.firstElementChild;
        }
        body.focus();
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        return target;
    }

    function openNoteLineFormat(block) {
        const target = noteSelectBlock(block);
        if (!target) return;
        noteFormatBlock = target;
        notePlusBlock = target;
        const plus = $('noteLinePlus');
        if (plus) plus.classList.add('is-on');
        showNotePlus(target);
        const rect = plus ? plus.getBoundingClientRect() : target.getBoundingClientRect();
        openNoteFormat(rect.left, rect.bottom + 6);
    }

    function noteBlockAt(clientY) {
        const body = $('noteBody');
        if (!body) return null;
        const rect = body.getBoundingClientRect();
        if (clientY < rect.top || clientY > rect.bottom) return null;
        const kids = body.children;
        for (let i = 0; i < kids.length; i++) {
            const box = kids[i].getBoundingClientRect();
            if (clientY >= box.top - 3 && clientY <= box.bottom + 3) return kids[i];
        }
        if (!kids.length || body.classList.contains('is-empty')) return body;
        return kids[kids.length - 1] || null;
    }

    function showNotePlus(block) {
        const plus = $('noteLinePlus');
        const sheet = plus && plus.parentElement;
        const body = $('noteBody');
        if (!plus || !sheet || !block || !body) return;
        const sheetRect = sheet.getBoundingClientRect();
        const rect = block === body ? body.getBoundingClientRect() : block.getBoundingClientRect();
        const height = block === body ? 24 : rect.height;
        const top = block === body ? rect.top + 2 : rect.top;
        if (top + height < sheetRect.top + 2 || top > sheetRect.bottom - 2) {
            if (!plus.classList.contains('is-on')) plus.hidden = true;
            return;
        }
        notePlusBlock = block === body ? (body.firstElementChild || body) : block;
        plus.hidden = false;
        plus.style.top = Math.max(0, top - sheetRect.top + Math.min(height, 28) / 2 - 11) + 'px';
    }

    function hideNotePlus() {
        const plus = $('noteLinePlus');
        if (!plus || plus.classList.contains('is-on')) return;
        plus.hidden = true;
        notePlusBlock = null;
    }

    function bindNoteFormat() {
        const body = $('noteBody');
        const plus = $('noteLinePlus');
        const menu = $('noteFormat');
        const sheet = body && body.parentElement;
        if (!body || !plus || !menu || !sheet) return;
        try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (error) {}
        plus.addEventListener('mousedown', function (event) { event.preventDefault(); });
        plus.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openNoteLineFormat(notePlusBlock || noteBlockAt(plus.getBoundingClientRect().top + 11));
        });
        menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
        menu.addEventListener('click', function (event) {
            const button = event.target.closest('[data-fmt]');
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            noteApplyFormat(button.getAttribute('data-fmt') || '', button.getAttribute('data-value') || '');
        });
        sheet.addEventListener('pointermove', function (event) {
            if (!menu.hidden && plus.classList.contains('is-on')) return;
            if (event.buttons) {
                hideNotePlus();
                return;
            }
            if (event.target.closest && event.target.closest('#noteLinePlus')) return;
            const block = noteBlockAt(event.clientY);
            if (!block) hideNotePlus();
            else showNotePlus(block);
        });
        sheet.addEventListener('pointerleave', hideNotePlus);
        body.addEventListener('scroll', function () {
            if (notePlusBlock && (notePlusBlock === body || body.contains(notePlusBlock))) showNotePlus(notePlusBlock);
            else hideNotePlus();
        });
        body.addEventListener('paste', function (event) {
            const clip = event.clipboardData;
            if (!clip) return;
            event.preventDefault();
            event.stopPropagation();
            const text = clip.getData('text/plain') || '';
            const html = clip.getData('text/html') || '';
            let clean = html ? noteSanitize(html) : '';
            if (!clean || !notePlainFromHtml(clean)) clean = noteTextToHtml(text);
            if (!clean) return;
            document.execCommand('insertHTML', false, clean);
            writeActiveNote();
        });
        body.addEventListener('dragover', function (event) { event.preventDefault(); });
        body.addEventListener('drop', function (event) {
            event.preventDefault();
            const text = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
            if (!text) return;
            let range = null;
            if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(event.clientX, event.clientY);
            else if (document.caretPositionFromPoint) {
                const spot = document.caretPositionFromPoint(event.clientX, event.clientY);
                if (spot) {
                    range = document.createRange();
                    range.setStart(spot.offsetNode, spot.offset);
                    range.collapse(true);
                }
            }
            if (range) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            document.execCommand('insertText', false, text);
            writeActiveNote();
        });
    }

    bindNoteFormat();
