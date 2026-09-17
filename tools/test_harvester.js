#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'js', 'harvester.js'), 'utf8');
const context = {
    data: { harvester: { files: [], hits: [] } },
    uid: (p) => p + '1',
    esc: (t) => String(t),
    host: null,
    addEventAt: () => null,
    schedulePersist: () => {},
    setPage: () => {},
    document: { addEventListener() {}, createElement() { return { click() {} }; }, querySelector() { return null; } },
    URL,
    Blob: function () {},
    console,
    Date,
    JSON,
    Array,
    Object,
    String,
    Math,
    RegExp,
    Error,
    parseInt,
    decodeURIComponent
};
context.$ = () => null;
vm.createContext(context);
vm.runInContext(src + '\nthis.harvestOne = harvestOne;\nthis.mergeHarvesterHits = mergeHarvesterHits;\n', context);

const dir = path.join(root, '_samples_extract');
const files = fs.readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
const expect = {
    '01_classic_dividers.txt': ['Adrian Cole Mercer', 'StaticFox', 'staticfox@example.com', 'staticfox-labs', '1999-04-12', 'foxbyte'],
    '02_loose_notes.md': ['Rowan Ellis', 'BlueStatic', 'bluStatic@example.net', 'bluestatic-dev', 'bluestatic11'],
    '03_nested_profile.json': ['Elena Marrow', 'CipherMoth', 'ciphermoth@example.com', 'ciphermoth', '2002-09-03'],
    '04_minimal_card.html': ['Maya Trent', 'NovaTrace', 'novatrace@example.com', 'nova-trace'],
    '05_dash_blocks.txt': ['Morgan Vale', 'KiteSignal', 'kitesignal@example.net', 'kite-signal', '2000-11-28'],
    '06_human_scratchpad.md': ['Jordan Avery', 'EmberLine', 'emberline@example.org', 'emberline-code', 'EL-7742'],
    '07_flat_object.json': ['Noah Quinn', 'GlassByte', 'glassbyte@example.com', '1998-01-17'],
    '08_comment_heavy.html': ['Tessa Rook', 'ORCHID-9', 'orchid9@example.net', 'orchid-nine'],
    '09_key_value_mess.txt': ['Camille Frost', 'RedLattice', 'redlattice@example.com', '2019/07/04'],
    '10_timeline_first.md': ['Leo Arden', 'SignalFrame', 'signalframe@example.com', '2019-02-10', 'SF-20019'],
    '11_array_records.json': ['Priya Sloan', 'VelvetNode', 'velvetnode@example.net', 'velvet-node', 'VN-26-118'],
    '12_terminal_dump.txt': ['Avery Monroe', 'LunarKey', 'lunarkey@example.org', 'lunar-key-dev'],
    '13_sectionless_notes.md': ['Devon Hale', 'FrostIndex', 'frostindex@example.com', 'FI-8841', '2026-09-10'],
    '14_embedded_script.html': ['Sienna Cross', 'EchoVale', 'echovale@example.com', 'echo-vale'],
    '15_chaotic_mixed_format.md': ['Kieran Moss', 'VantaThread', 'vantathread@example.net', 'vanta-thread', '2020.12.02']
};

let failed = 0;
files.forEach((name) => {
    const raw = fs.readFileSync(path.join(dir, name), 'utf8');
    const harvested = context.harvestOne({ name, type: '', size: raw.length }, raw);
    const values = harvested.hits.map((h) => h.value);
    const kinds = harvested.hits.map((h) => (h.platform ? h.platform + ':' : '') + h.kind + '=' + h.value);
    const need = expect[name] || [];
    const missing = need.filter((v) => !values.some((x) => String(x).toLowerCase() === String(v).toLowerCase()));
    console.log('\n== ' + name + ' (' + harvested.hits.length + ' facts) ==');
    kinds.forEach((k) => console.log('  ' + k));
    if (missing.length) {
        failed += 1;
        console.log('  MISSING: ' + missing.join(', '));
    }
});
process.exit(failed ? 1 : 0);
