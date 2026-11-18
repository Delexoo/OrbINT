/* Harvester copy, export, and page binding */
    function cpPlainLine(text) {
        const s = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ');
        return s.length ? s : '(blank line)';
    }

    function harvesterDiffText(file) {
        const rows = cpBuildSplit(file.raw, file.hits || []);
        const kept = [];
        const cut = [];
        rows.forEach(function (row) {
            if (row.rkind === 'add') {
                kept.push({
                    fact: row.rtext,
                    line: row.lnum,
                    source: row.ltext
                });
            }
            if (row.lkind === 'del' && row.rkind === 'empty') {
                cut.push({ line: row.lnum, text: row.ltext });
            }
        });
        const origLines = rows.filter(function (row) { return row.lkind === 'del'; }).length;
        const out = [];
        out.push('HARVESTER COMPARISON');
        out.push('File: ' + (file.name || 'untitled'));
        out.push('Kept: ' + kept.length + (kept.length === 1 ? ' extracted identifier' : ' extracted identifiers'));
        out.push('Not kept: ' + cut.length + (cut.length === 1 ? ' original line' : ' original lines') + ' with no identifier');
        out.push('Original lines shown: ' + origLines);
        out.push('');
        out.push('======== KEPT ========');
        if (!kept.length) out.push('(nothing was extracted)');
        kept.forEach(function (item, i) {
            out.push((i + 1) + '. + ' + item.fact);
            if (item.source) out.push('   from original line ' + item.line + ': ' + cpPlainLine(item.source));
            else out.push('   not tied to a single original line');
        });
        out.push('');
        out.push('======== NOT KEPT ========');
        if (!cut.length) out.push('(every original line contributed an identifier)');
        cut.forEach(function (item) {
            out.push('- line ' + item.line + ': ' + cpPlainLine(item.text));
        });
        out.push('');
        out.push('======== FULL SPLIT TABLE ========');
        out.push('Orig#  Original                                      Ext#   Extracted');
        rows.forEach(function (row) {
            const lnum = row.lnum === '' || row.lnum == null ? '    ' : String(row.lnum);
            const rnum = row.rnum === '' || row.rnum == null ? '    ' : String(row.rnum);
            const left = row.lkind === 'empty' ? '' : '- ' + cpPlainLine(row.ltext);
            const right = row.rkind === 'empty' ? '' : '+ ' + cpPlainLine(row.rtext);
            const note = row.rkind === 'add' ? '  [kept]' : (row.lkind === 'del' ? '  [not kept]' : '');
            out.push(lnum + '  ' + left);
            out.push(rnum + '  ' + right + note);
            out.push('');
        });
        return out.join('\n').replace(/\n{3,}/g, '\n\n');
    }

    function cpMarkCopied(btn, ok) {
        if (!btn) return;
        if (btn.classList.contains('cp-ico')) {
            if (!btn.getAttribute('data-cp-idle')) {
                btn.setAttribute('data-cp-idle', btn.getAttribute('data-tip') || btn.getAttribute('aria-label') || 'Copy');
            }
            const idle = btn.getAttribute('data-cp-idle');
            btn.setAttribute('aria-label', ok ? 'Copied' : 'Copy failed');
            btn.setAttribute('data-tip', ok ? 'Copied' : 'Copy failed');
            btn.classList.toggle('is-copied', !!ok);
            clearTimeout(btn._cpCopyT);
            btn._cpCopyT = setTimeout(function () {
                btn.setAttribute('aria-label', idle);
                btn.setAttribute('data-tip', idle);
                btn.classList.remove('is-copied');
            }, 1500);
            return;
        }
        const idle = btn.getAttribute('data-cp-idle') || 'Copy';
        btn.setAttribute('data-cp-idle', idle);
        btn.textContent = ok ? 'Copied' : 'Copy failed';
        clearTimeout(btn._cpCopyT);
        btn._cpCopyT = setTimeout(function () {
            btn.textContent = btn.getAttribute('data-cp-idle') || 'Copy';
        }, 1500);
    }

    function cpWriteClipboard(text, btn) {
        const done = function (ok) { cpMarkCopied(btn, ok); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () {
                done(cpExecCopy(text));
            });
            return;
        }
        done(cpExecCopy(text));
    }

    function cpExecCopy(text) {
        let ok = false;
        function onCopy(event) {
            if (!event.clipboardData) return;
            event.preventDefault();
            event.clipboardData.setData('text/plain', text);
            ok = true;
        }
        document.addEventListener('copy', onCopy);
        try { document.execCommand('copy'); } catch (error) {}
        document.removeEventListener('copy', onCopy);
        if (ok) return true;
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;opacity:0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return !!ok;
        } catch (error) {
            return false;
        }
    }

    function harvesterPaneText(fileIndex, side) {
        const st = harvesterState();
        const file = st.files && st.files[fileIndex];
        if (!file) return '';
        if (side === 'original') {
            const ta = document.querySelector('.cp-editor[data-cp-file="' + fileIndex + '"]');
            return ta ? String(ta.value || '') : String(file.raw || '');
        }
        return cpBuildSplit(file.raw, file.hits || []).filter(function (row) {
            return row.rkind === 'add';
        }).map(function (row) {
            return row.rtext;
        }).join('\n');
    }

    function copyHarvesterPane(fileIndex, side, btn) {
        const st = harvesterState();
        if (!st.ready || !(st.files || []).length) return;
        cpWriteClipboard(harvesterPaneText(fileIndex, side), btn);
    }

    function copyHarvesterDiff(fileIndex, btn) {
        const st = harvesterState();
        const files = st.files || [];
        if (!st.ready || !files.length) return;
        let text = '';
        if (fileIndex != null && files[fileIndex]) text = harvesterDiffText(files[fileIndex]);
        else text = files.map(harvesterDiffText).join('\n\n' + '----------------------------------------' + '\n\n');
        cpWriteClipboard(text, btn);
    }

    function harvesterExport(fmt) {
        const st = harvesterState();
        if (!st.ready || !(st.files || []).length) return;
        const files = st.files;
        const hits = st.hits || [];
        let name = (files[0] && files[0].name ? files[0].name.replace(/\.[^.]+$/, '') : 'harvested') + '-harvested';
        let body = '';
        let type = 'text/plain';
        function row(h) {
            return {
                kind: h.platform ? h.platform : h.kind,
                value: h.value,
                field: h.kind,
                platform: h.platform || ''
            };
        }
        if (fmt === 'json') {
            type = 'application/json';
            body = JSON.stringify({ facts: hits.map(row) }, null, 2);
            name += '.json';
        } else if (fmt === 'csv') {
            type = 'text/csv';
            body = 'kind,value,platform\n' + hits.map(function (h) {
                return [h.platform || h.kind, h.value, h.platform || ''].map(function (c) {
                    const s = String(c || '');
                    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(',');
            }).join('\n');
            name += '.csv';
        } else if (fmt === 'xml') {
            type = 'application/xml';
            body = '<?xml version="1.0" encoding="UTF-8"?>\n<harvested>\n' +
                hits.map(function (h) {
                    return '  <fact kind="' + esc(h.kind) + '"' + (h.platform ? ' platform="' + esc(h.platform) + '"' : '') + '>' + esc(h.value) + '</fact>';
                }).join('\n') + '\n</harvested>\n';
            name += '.xml';
        } else if (fmt === 'html') {
            type = 'text/html';
            body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(name) + '</title></head><body>' +
                '<h1>Harvested facts</h1><ul>' + hits.map(function (h) {
                    return '<li><b>' + esc(cpHitLabel(h)) + '</b> ' + esc(h.value) + '</li>';
                }).join('') + '</ul></body></html>';
            name += '.html';
        } else if (fmt === 'md') {
            body = '# Harvested facts\n\n' + hits.map(function (h) {
                return '- **' + cpHitLabel(h) + ':** ' + h.value;
            }).join('\n') + '\n';
            name += '.md';
        } else {
            body = hits.map(function (h) {
                return cpHitLabel(h) + ': ' + h.value;
            }).join('\n') + '\n';
            name += '.txt';
        }
        const blob = new Blob([body], { type: type + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    const CP_FIELD = {
        email: 'email',
        phone: 'phone',
        username: 'username',
        alias: 'username',
        name: 'name',
        address: 'address',
        ip: 'ip',
        domain: 'domain',
        crypto: 'crypto',
        dob: 'dob',
        company: 'company',
        occupation: 'occupation',
        os: 'os',
        password: 'password',
        plate: 'plate',
        vehicle: 'vehicle',
        age: 'age',
        timezone: 'timezone',
        vin: 'vin',
        url: 'domain'
    };

    function inspectHarvester() {
        const st = harvesterState();
        if (!st.ready) return;
        const hits = st.hits || [];
        const names = (st.files || []).map(function (f) { return f.name; }).join(', ');
        if (host && (host.addFactSlot || host.addFact)) {
            const file = host.addFactSlot || host.addFact;
            hits.forEach(function (hit) {
                if (hit.kind === 'date' || hit.kind === 'time' || hit.kind === 'id') return;
                const field = CP_FIELD[hit.kind];
                if (!field) return;
                const extra = { source: 'harvester', method: 'file-harvest', quiet: true };
                if (hit.platform) extra.platform = hit.platform;
                file(field, hit.value, extra);
            });
            const ids = hits.filter(function (h) { return h.kind === 'id'; }).map(function (h) { return h.value; });
            if (ids.length) file('notes', 'IDs: ' + ids.join(', '), { source: 'harvester', method: 'file-harvest', quiet: true });
            const note = 'Harvested ' + names + ' — ' + hits.length + ' fact' + (hits.length === 1 ? '' : 's') + ' kept.';
            file('notes', note, { source: 'harvester', method: 'file-harvest', quiet: true });
            if (host.flushFacts) host.flushFacts();
        }
        schedulePersist();
        setPage('orbit');
    }

    function bindHarvester() {
        if (cpBound) return;
        const view = $('harvesterView');
        const drop = $('harvesterDrop');
        if (!view || !drop) return;
        cpBound = true;
        function over(event) {
            event.preventDefault();
            drop.classList.add('is-over');
        }
        function leave(event) {
            event.preventDefault();
            drop.classList.remove('is-over');
        }
        view.addEventListener('dragover', over);
        view.addEventListener('dragenter', over);
        view.addEventListener('dragleave', leave);
        view.addEventListener('drop', function (event) {
            event.preventDefault();
            drop.classList.remove('is-over');
            const files = event.dataTransfer && event.dataTransfer.files;
            if (files && files.length) {
                ingestHarvesterFiles(files);
                return;
            }
            const text = event.dataTransfer && event.dataTransfer.getData('text/plain');
            if (text) newHarvesterFile(text);
        });
        let cpSplitDrag = null;
        function onSplitMove(event) {
            if (!cpSplitDrag) return;
            applyHarvesterSplit(splitPctFromPointer(cpSplitDrag, event.clientX), false);
        }
        function onSplitUp() {
            if (!cpSplitDrag) return;
            cpSplitDrag = null;
            document.body.classList.remove('cp-splitting');
            window.removeEventListener('pointermove', onSplitMove);
            window.removeEventListener('pointerup', onSplitUp);
            applyHarvesterSplit(harvesterSplitPct(), true);
        }
        view.addEventListener('pointerdown', function (event) {
            const g = event.target.closest('.cp-split-gutter');
            if (!g || event.button) return;
            event.preventDefault();
            cpSplitDrag = g;
            document.body.classList.add('cp-splitting');
            window.addEventListener('pointermove', onSplitMove);
            window.addEventListener('pointerup', onSplitUp);
        });
        view.addEventListener('dblclick', function (event) {
            if (!event.target.closest('.cp-split-gutter')) return;
            applyHarvesterSplit(50, true);
        });
        view.addEventListener('input', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta) {
                onHarvesterEditorInput(ta);
                return;
            }
            const name = event.target.closest('.cp-file-name');
            if (name) {
                const i = parseInt(name.getAttribute('data-cp-name'), 10);
                if (!isNaN(i)) renameHarvesterFile(i, name.value);
            }
        });
        view.addEventListener('focusout', function (event) {
            const ta = event.target.closest && event.target.closest('.cp-editor');
            if (!ta) return;
            const i = parseInt(ta.getAttribute('data-cp-file'), 10);
            if (isNaN(i)) return;
            clearTimeout(cpEditTimers[i]);
            applyHarvesterEdit(i, ta.value);
        });
        view.addEventListener('scroll', function (event) {
            if (event.target && event.target.classList && event.target.classList.contains('cp-editor')) {
                syncHarvesterGutter(event.target);
            }
        }, true);
        view.addEventListener('keydown', function (event) {
            const ta = event.target.closest('.cp-editor');
            if (ta && event.key === 'Tab') {
                event.preventDefault();
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
                ta.selectionStart = ta.selectionEnd = start + 2;
                onHarvesterEditorInput(ta);
                return;
            }
            const g = event.target.closest('.cp-split-gutter');
            if (!g) return;
            const step = event.shiftKey ? 8 : 3;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() - step, true);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                applyHarvesterSplit(harvesterSplitPct() + step, true);
            } else if (event.key === 'Home') {
                event.preventDefault();
                applyHarvesterSplit(50, true);
            }
        });
        window.addEventListener('resize', function () {
            syncCpModeThumb(true);
            if (!harvesterState().ready) return;
            applyHarvesterSplit(harvesterSplitPct(), false);
        });
        document.addEventListener('click', function (event) {
            const mode = event.target.closest('#harvesterCount [data-cp-view]');
            if (mode) {
                setHarvesterView(mode.getAttribute('data-cp-view'));
                return;
            }
            if (event.target.closest('#harvesterUploadBtn, #harvesterDropBtn')) {
                openHarvesterPicker();
                return;
            }
            if (event.target.closest('#harvesterNewBtn, #harvesterDropNewBtn')) {
                newHarvesterFile('');
                return;
            }
            if (event.target.closest('#harvesterDownloadBtn')) {
                const menu = $('harvesterDownloadMenu');
                if (menu) menu.hidden = !menu.hidden;
                return;
            }
            if (event.target.closest('[data-cp-fmt]')) {
                harvesterExport(event.target.getAttribute('data-cp-fmt'));
                hideHarvesterDownload();
                return;
            }
            if (event.target.closest('#harvesterCopyBtn')) {
                copyHarvesterDiff(null, event.target.closest('#harvesterCopyBtn'));
                return;
            }
            const paneCopy = event.target.closest('[data-cp-pane-copy]');
            if (paneCopy) {
                const i = parseInt(paneCopy.getAttribute('data-cp-file'), 10);
                copyHarvesterPane(isNaN(i) ? 0 : i, paneCopy.getAttribute('data-cp-pane-copy'), paneCopy);
                return;
            }
            const copyOne = event.target.closest('[data-cp-copy]');
            if (copyOne) {
                const i = parseInt(copyOne.getAttribute('data-cp-copy'), 10);
                copyHarvesterDiff(isNaN(i) ? null : i, copyOne);
                return;
            }
            if (event.target.closest('#harvesterInspectBtn')) {
                inspectHarvester();
                return;
            }
            if (event.target.closest('#harvesterClearBtn')) {
                clearHarvester();
                return;
            }
            if (!event.target.closest('.cp-dl')) hideHarvesterDownload();
        });
        document.addEventListener('keydown', function (event) {
            const btn = event.target.closest('#harvesterCount [data-cp-view]');
            if (!btn) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
            const order = ['split', 'original', 'stripped'];
            const i = order.indexOf(btn.getAttribute('data-cp-view'));
            let next = i;
            if (event.key === 'ArrowRight') next = (i + 1) % order.length;
            else if (event.key === 'ArrowLeft') next = (i + order.length - 1) % order.length;
            else if (event.key === 'Home') next = 0;
            else next = order.length - 1;
            event.preventDefault();
            setHarvesterView(order[next]);
            const focus = document.querySelector('#harvesterCount [data-cp-view="' + order[next] + '"]');
            if (focus) focus.focus();
        });
    }
