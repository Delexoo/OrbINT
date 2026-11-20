/* Operations map projection and attack painting */
    function opsReduceMotion() {
        return document.documentElement.classList.contains('reduce-motion') ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function opsCountryName(code) {
        const value = String(code || '').toUpperCase();
        if (!value) return '';
        try {
            if (!opsCountryName.names) opsCountryName.names = new Intl.DisplayNames(undefined, { type: 'region' });
            return opsCountryName.names.of(value) || value;
        } catch (error) {
            return value;
        }
    }

    function opsFresh(at) {
        const sec = Math.round((Date.now() - Number(at)) / 1000);
        if (!isFinite(sec) || sec < 0) return '';
        if (sec < 10) return 'just now';
        if (sec < 60) return sec + 's ago';
        return opsAgo(at);
    }

    function opsMapStatusLine() {}

    function opsModeThumb(instant) {
        const wrap = document.querySelector('.ops-mode');
        if (!wrap) return;
        const thumb = wrap.querySelector('.ops-mode-thumb');
        const on = wrap.querySelector('button.is-on');
        if (!thumb || !on || !(on.offsetWidth > 0)) return;
        const snap = instant || opsReduceMotion();
        if (snap) thumb.classList.add('is-instant');
        else thumb.classList.remove('is-instant');
        thumb.style.top = on.offsetTop + 'px';
        thumb.style.left = on.offsetLeft + 'px';
        thumb.style.width = on.offsetWidth + 'px';
        thumb.style.height = on.offsetHeight + 'px';
        if (snap && !opsReduceMotion()) {
            void thumb.offsetWidth;
            thumb.classList.remove('is-instant');
        }
    }

    function setOpsMapMode(mode) {
        opsMapMode = mode === 'outages' ? 'outages' : (mode === 'cameras' ? 'cameras' : 'attacks');
        const attacks = $('opsMapAttacks');
        const outages = $('opsMapOutages');
        const cameras = $('opsMapCameras');
        if (attacks) attacks.classList.toggle('is-on', opsMapMode === 'attacks');
        if (outages) outages.classList.toggle('is-on', opsMapMode === 'outages');
        if (cameras) cameras.classList.toggle('is-on', opsMapMode === 'cameras');
        opsModeThumb(false);
        const range = $('opsRange');
        if (range) range.hidden = opsMapMode === 'cameras';
        const canvas = $('opsMap');
        if (canvas) canvas.setAttribute('aria-label', opsMapMode === 'cameras' ? 'Camera map' : 'World map');
        opsHideTip();
        closeOpsReport();
        opsMapStatusLine();
        paintOpsMapList();
        opsShowPinLayers();
        if (opsMapMode === 'cameras') opsEnsureCameras();
        else if (opsMapMode === 'outages') loadOpsOutages(false);
        else loadOpsAttacks(false);
    }

    let opsRealMap = null;
    let opsMapTouched = false;

    function opsFitWorld() {
        if (!opsRealMap || opsMapTouched) return;
        opsRealMap.fitBounds([[-168, -46], [180, 72]], { padding: 8, animate: false, maxZoom: 2 });
    }

    function opsScreenPoint(lon, lat) {
        if (!opsRealMap || !isFinite(Number(lon)) || !isFinite(Number(lat))) return null;
        const point = opsRealMap.project([opsNormLon(lon), Math.max(-85, Math.min(85, Number(lat)))]);
        if (!point || !isFinite(point.x) || !isFinite(point.y)) return null;
        return [point.x, point.y];
    }

    function opsOnScreen(x, y) {
        const canvas = $('opsMapDraw');
        if (!canvas) return false;
        const w = canvas.clientWidth || 0;
        const h = canvas.clientHeight || 0;
        return x >= -48 && y >= -48 && x <= w + 48 && y <= h + 48;
    }

    function opsInView(lon, lat) {
        if (!opsRealMap) return true;
        let bounds = null;
        try { bounds = opsRealMap.getBounds(); } catch (error) { return true; }
        if (!bounds) return true;
        const margin = 3;
        if (lat < bounds.getSouth() - margin || lat > bounds.getNorth() + margin) return false;
        const west = bounds.getWest();
        const east = bounds.getEast();
        if (west <= east) return lon >= west - margin && lon <= east + margin;
        return lon >= west - margin || lon <= east + margin;
    }

    function opsBindRealMap(map) {
        if (map.__orbintBound) return;
        map.__orbintBound = true;
        map.on('mousemove', function (event) {
            const hit = opsHitAt(event.point.x, event.point.y);
            const surface = map.getCanvas();
            if (surface) surface.style.cursor = hit ? 'pointer' : '';
            if (!hit) { opsHideTip(); return; }
            opsHoverHit = hit;
            opsHover = { kind: hit.kind, id: hit.id, ip: hit.ip || '' };
            opsPlaceTip(hit, event.originalEvent);
        });
        map.on('mouseout', function () { opsHideTip(); });
        map.on('click', function (event) {
            const hit = opsHitAt(event.point.x, event.point.y);
            if (!hit) {
                opsCameraFocus = null;
                opsSyncCameraFocus();
                closeOpsReport();
                return;
            }
            if (hit.kind === 'flock') {
                closeOpsReport();
                opsStreetAtCamera(hit);
                return;
            }
            opsOpenMapHit(hit);
        });
    }

    const OPS_MAP_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.1/dist/maplibre-gl.js';
    const OPS_MAP_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.1/dist/maplibre-gl.css';
    const OPS_MAP_JS_SRI = 'sha384-/L1njH4bbgNt9Uk3HwJ272N9fxJzRBQCxhtwGkZiqgl+Nxpq2ETUNZhNMNV1RgyW';
    const OPS_MAP_CSS_SRI = 'sha384-Nq6PQ+9vJPvw7U/VfDELyrWoGQMsy0gi6QShhaSrGzkpF5KkM40csg2leky+YMTd';

    function opsLoadMapLibre() {
        if (window.maplibregl) return Promise.resolve();
        if (opsLoadMapLibre.wait) return opsLoadMapLibre.wait;
        opsLoadMapLibre.wait = new Promise(function (resolve, reject) {
            if (!document.querySelector('link[data-orbint-maplibre]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = OPS_MAP_CSS;
                link.integrity = OPS_MAP_CSS_SRI;
                link.crossOrigin = 'anonymous';
                link.setAttribute('data-orbint-maplibre', '1');
                document.head.appendChild(link);
            }
            const script = document.createElement('script');
            script.src = OPS_MAP_JS;
            script.integrity = OPS_MAP_JS_SRI;
            script.crossOrigin = 'anonymous';
            script.onload = function () { resolve(); };
            script.onerror = function () { reject(new Error('map')); };
            document.head.appendChild(script);
        });
        return opsLoadMapLibre.wait;
    }

    function opsEnsureMap() {
        if (opsRealMap) return opsRealMap;
        const host = $('opsMap');
        if (!host) return null;
        if (!window.maplibregl) {
            if (!host.dataset.loading) {
                host.dataset.loading = '1';
                opsLoadMapLibre().then(function () {
                    delete host.dataset.loading;
                    opsEnsureMap();
                }).catch(function () {
                    host.classList.add('is-map-missing');
                    if (!host.dataset.warned) {
                        host.dataset.warned = '1';
                        host.textContent = 'The map library did not load. Check the network connection and refresh.';
                    }
                });
            }
            return null;
        }
        host.classList.remove('is-map-missing');
        if (host.dataset.warned) {
            host.textContent = '';
            delete host.dataset.warned;
        }
        opsRealMap = new maplibregl.Map({
            container: host,
            style: 'https://tiles.openfreemap.org/styles/dark',
            center: [0, 18],
            zoom: 0.8,
            minZoom: 0.4,
                maxZoom: 18,
            attributionControl: false,
            dragRotate: false,
            pitchWithRotate: false,
            fadeDuration: 0
        });
        opsRealMap.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
        const attrib = host.querySelector('.maplibregl-ctrl-attrib');
        if (attrib) {
            attrib.classList.add('maplibregl-compact');
            attrib.classList.remove('maplibregl-compact-show');
            attrib.removeAttribute('open');
        }
        if (opsRealMap.touchZoomRotate) opsRealMap.touchZoomRotate.disableRotation();
        if (opsRealMap.dragRotate) opsRealMap.dragRotate.disable();
        opsRealMap.on('dragstart', function () { opsMapTouched = true; });
        opsRealMap.on('zoomstart', function (event) {
            if (event.originalEvent) opsMapTouched = true;
        });
        function opsRaisePins(map) {
            ['ops-cameras', 'ops-attacks', 'ops-outages', 'ops-user-ring', 'ops-user-dot', 'ops-camera-focus'].forEach(function (id) {
                if (map.getLayer(id)) map.moveLayer(id);
            });
        }
        function opsRestorePins() {
            if (!opsRealMap || !opsRealMap.isStyleLoaded()) return;
            if (!opsRealMap.getSource('ops-attacks')) {
                try { opsInstallPinLayers(opsRealMap); } catch (error) {}
            }
            opsRaisePins(opsRealMap);
        }
        opsRealMap.on('style.load', opsRestorePins);
        opsRealMap.on('styledata', opsRestorePins);
        opsRealMap.on('idle', opsRestorePins);
        opsRealMap.on('load', function () {
            opsSyncMapSize();
            opsInstallPinLayers(opsRealMap);
        });
        opsBindRealMap(opsRealMap);
        if (typeof ResizeObserver !== 'undefined') {
            const watch = new ResizeObserver(function () { opsSyncMapSize(); });
            watch.observe(host);
        }
        requestAnimationFrame(function () { opsSyncMapSize(); });
        return opsRealMap;
    }

    function opsSyncMapSize() {
        const map = opsRealMap;
        const host = $('opsMap');
        if (!map || !host) return;
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (width < 20 || height < 20) return;
        const canvas = host.querySelector('.maplibregl-canvas');
        const stale = !canvas || Math.abs(canvas.clientWidth - width) > 1 || Math.abs(canvas.clientHeight - height) > 1;
        if (!stale) return;
        map.resize();
        opsFitWorld();
    }

    let opsPinGl = null;
    let opsPinProgram = null;
    let opsPinVariant = '';
    let opsPinMatrix = null;
    let opsPinWorld = null;
    let opsPinSize = null;
    let opsPinColor = null;
    let opsPinPos = null;
    let opsFlockMesh = null;
    let opsOsmMesh = null;
    let opsFlockDraw = 0;
    let opsOsmDraw = 0;

    function opsClearPinCanvas() {
        const canvas = $('opsMapDraw');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function opsPinFeatures(items, mapItem) {
        const features = [];
        items.forEach(function (item, index) {
            const feature = mapItem(item, index);
            if (feature) features.push(feature);
        });
        return { type: 'FeatureCollection', features: features };
    }

    function opsSyncAttackPins() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-attacks')) return;
        map.getSource('ops-attacks').setData(opsPinFeatures(opsAttacks, function (item) {
            const spot = opsAttackSpot(item);
            if (!spot || !item.ip) return null;
            return {
                type: 'Feature',
                properties: { ip: item.ip, link: opsAttackLink(item) || '' },
                geometry: { type: 'Point', coordinates: [spot.lon, spot.lat] }
            };
        }));
    }

    function opsSyncOutagePins() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-outages')) return;
        map.getSource('ops-outages').setData(opsPinFeatures(opsOutages, function (item, index) {
            const place = item.country && OPS_PLACES[item.country];
            const lon = isFinite(item.lon) ? item.lon : (place && place[0]);
            const lat = isFinite(item.lat) ? item.lat : (place && place[1]);
            if (!isFinite(lon) || !isFinite(lat)) return null;
            const meta = OPS_OUTAGE_META[item.source] || { color: '#e4e4e7' };
            return {
                type: 'Feature',
                properties: { index: index, link: item.link || '', color: meta.color },
                geometry: { type: 'Point', coordinates: [lon, lat] }
            };
        }));
    }

    function opsShowPinLayers() {
        const map = opsRealMap;
        if (!map || !map.getLayer('ops-attacks')) return;
        map.setLayoutProperty('ops-attacks', 'visibility', opsMapMode === 'attacks' ? 'visible' : 'none');
        map.setLayoutProperty('ops-outages', 'visibility', opsMapMode === 'outages' ? 'visible' : 'none');
        map.triggerRepaint();
    }

    function opsCompileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader) || 'shader';
            gl.deleteShader(shader);
            throw new Error(log);
        }
        return shader;
    }

    function opsMercatorMesh(view, offset, count) {
        const data = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            const base = offset + i * 8;
            const lat = view.getInt32(base, true) / 1000000;
            const lon = view.getInt32(base + 4, true) / 1000000;
            const coord = maplibregl.MercatorCoordinate.fromLngLat([lon, lat]);
            data[i * 2] = coord.x;
            data[i * 2 + 1] = coord.y;
        }
        return data;
    }

    function opsUploadMesh(gl, buffer, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    function opsUploadCameraPins() {
        if (!opsPinGl || !opsCameraBuf || !opsFlockMesh) return;
        const view = opsCameraBuf.view;
        opsUploadMesh(opsPinGl, opsFlockMesh, opsMercatorMesh(view, opsCameraBuf.flockAt, opsCameraBuf.flock));
        opsUploadMesh(opsPinGl, opsOsmMesh, opsMercatorMesh(view, opsCameraBuf.osmAt, opsCameraBuf.osm));
        opsFlockDraw = opsCameraBuf.flock;
        opsOsmDraw = opsCameraBuf.osm;
        const host = $('opsMap');
        if (host) host.dataset.pinCount = String(opsFlockDraw + opsOsmDraw);
    }

    function opsUseCameraProgram(gl) {
        if (opsPinProgram && opsPinVariant === 'mercator') return;
        const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
        const vertex = (webgl2 ? '#version 300 es\n' : '') +
            (webgl2 ? 'in vec2 a_pos;\n' : 'attribute vec2 a_pos;\n') +
            'uniform mat4 u_matrix;\nuniform float u_size;\nuniform float u_world;\nvoid main(){gl_Position=u_matrix*vec4(a_pos*u_world,0.0,1.0);gl_PointSize=u_size;}';
        const fragment = webgl2
            ? '#version 300 es\nprecision mediump float;\nuniform vec4 u_color;\nout vec4 fragColor;\nvoid main(){vec2 p=gl_PointCoord*2.0-1.0;if(dot(p,p)>1.0)discard;fragColor=u_color;}'
            : 'precision mediump float;\nuniform vec4 u_color;\nvoid main(){vec2 p=gl_PointCoord*2.0-1.0;if(dot(p,p)>1.0)discard;gl_FragColor=u_color;}';
        const program = gl.createProgram();
        gl.attachShader(program, opsCompileShader(gl, gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, opsCompileShader(gl, gl.FRAGMENT_SHADER, fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link');
        opsPinProgram = program;
        opsPinVariant = 'mercator';
        opsPinMatrix = gl.getUniformLocation(program, 'u_matrix');
        opsPinWorld = gl.getUniformLocation(program, 'u_world');
        opsPinSize = gl.getUniformLocation(program, 'u_size');
        opsPinColor = gl.getUniformLocation(program, 'u_color');
        opsPinPos = gl.getAttribLocation(program, 'a_pos');
    }

    function opsInstallPinLayers(map) {
        if (map.getSource('ops-attacks')) return;
        map.addSource('ops-attacks', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addSource('ops-outages', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        const dot = { 'circle-radius': 4.5, 'circle-opacity': 1, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#09090b' };
        map.addLayer({
            id: 'ops-attacks',
            type: 'circle',
            source: 'ops-attacks',
            paint: {
                'circle-radius': dot['circle-radius'],
                'circle-color': '#fb7185',
                'circle-opacity': dot['circle-opacity'],
                'circle-stroke-width': dot['circle-stroke-width'],
                'circle-stroke-color': dot['circle-stroke-color']
            }
        });
        map.addLayer({
            id: 'ops-outages',
            type: 'circle',
            source: 'ops-outages',
            paint: {
                'circle-radius': dot['circle-radius'],
                'circle-color': ['coalesce', ['get', 'color'], '#e4e4e7'],
                'circle-opacity': dot['circle-opacity'],
                'circle-stroke-width': dot['circle-stroke-width'],
                'circle-stroke-color': dot['circle-stroke-color']
            }
        });
        map.addLayer({
            id: 'ops-cameras',
            type: 'custom',
            renderingMode: '2d',
            onAdd: function (mapObj, gl) {
                opsPinGl = gl;
                opsPinProgram = null;
                opsPinVariant = '';
                opsFlockMesh = gl.createBuffer();
                opsOsmMesh = gl.createBuffer();
                opsUploadCameraPins();
            },
            render: function (gl, options) {
                const matrix = options && options.modelViewProjectionMatrix;
                if (opsMapMode !== 'cameras' || !matrix || (!opsFlockDraw && !opsOsmDraw)) return;
                try {
                    opsUseCameraProgram(gl);
                } catch (error) {
                    const host = $('opsMap');
                    if (host) host.dataset.pinError = String(error && error.message || error);
                    return;
                }
                const size = Math.max(4, 3.5 * (window.devicePixelRatio || 1));
                gl.useProgram(opsPinProgram);
                gl.uniformMatrix4fv(opsPinMatrix, false, matrix);
                gl.uniform1f(opsPinWorld, opsRealMap ? 512 * Math.pow(2, opsRealMap.getZoom()) : 512);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enableVertexAttribArray(opsPinPos);
                const draw = function (buffer, count, color, point) {
                    if (!count) return;
                    gl.uniform1f(opsPinSize, point);
                    gl.uniform4fv(opsPinColor, color);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(opsPinPos, 2, gl.FLOAT, false, 0, 0);
                    gl.drawArrays(gl.POINTS, 0, count);
                };
                draw(opsOsmMesh, opsOsmDraw, [0, 0, 0, 0.72], size + 3);
                draw(opsFlockMesh, opsFlockDraw, [0, 0, 0, 0.72], size + 3);
                draw(opsOsmMesh, opsOsmDraw, [56 / 255, 189 / 255, 248 / 255, 1], size);
                draw(opsFlockMesh, opsFlockDraw, [245 / 255, 158 / 255, 11 / 255, 1], size);
                gl.disableVertexAttribArray(opsPinPos);
            }
        });
        map.addSource('ops-user', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
            id: 'ops-user-ring',
            type: 'fill',
            source: 'ops-user',
            filter: ['==', ['get', 'kind'], 'ring'],
            paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.18 }
        });
        map.addLayer({
            id: 'ops-user-dot',
            type: 'circle',
            source: 'ops-user',
            filter: ['==', ['get', 'kind'], 'dot'],
            paint: {
                'circle-radius': 6,
                'circle-color': '#38bdf8',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fafafa'
            }
        });
        map.addSource('ops-camera-focus', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
            id: 'ops-camera-focus',
            type: 'circle',
            source: 'ops-camera-focus',
            paint: {
                'circle-radius': 8,
                'circle-color': '#f59e0b',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fafafa'
            }
        });
        opsClearPinCanvas();
        opsSyncAttackPins();
        opsSyncOutagePins();
        opsShowPinLayers();
        opsSyncUserPin();
        opsSyncCameraFocus();
    }

    let opsBasemap = 'dark';
    let opsCameraFocus = null;
    let opsUserFix = null;
    let opsUserNote = '';

    function opsBasemapStyle(id) {
        if (id === 'streets') return 'https://tiles.openfreemap.org/styles/liberty';
        if (id === 'satellite') {
            return {
                version: 8,
                sources: {
                    esri: {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
                        maxzoom: 19
                    }
                },
                layers: [{ id: 'satellite', type: 'raster', source: 'esri' }]
            };
        }
        return 'https://tiles.openfreemap.org/styles/dark';
    }

    function opsSetBasemap(id) {
        const map = opsRealMap;
        if (!map) return;
        opsBasemap = id || 'dark';
        document.querySelectorAll('[data-basemap]').forEach(function (button) {
            const on = button.getAttribute('data-basemap') === opsBasemap;
            button.classList.toggle('is-on', on);
            button.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        map.setMaxZoom(18);
        opsPinProgram = null;
        opsPinVariant = '';
        map.setStyle(opsBasemapStyle(opsBasemap));
    }

    function opsAccuracyRing(lng, lat, meters) {
        const steps = 64;
        const coords = [];
        const radius = Math.max(meters || 30, 20);
        const latRad = lat * Math.PI / 180;
        for (let step = 0; step <= steps; step++) {
            const bearing = (step / steps) * Math.PI * 2;
            const east = radius * Math.cos(bearing);
            const north = radius * Math.sin(bearing);
            coords.push([
                lng + east / (111320 * Math.cos(latRad)),
                lat + north / 110540
            ]);
        }
        return coords;
    }

    function opsSyncUserPin() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-user')) return;
        if (!opsUserFix) {
            map.getSource('ops-user').setData({ type: 'FeatureCollection', features: [] });
            return;
        }
        map.getSource('ops-user').setData({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { kind: 'ring' },
                    geometry: { type: 'Polygon', coordinates: [opsAccuracyRing(opsUserFix.lng, opsUserFix.lat, opsUserFix.accuracy)] }
                },
                {
                    type: 'Feature',
                    properties: { kind: 'dot' },
                    geometry: { type: 'Point', coordinates: [opsUserFix.lng, opsUserFix.lat] }
                }
            ]
        });
    }

    function opsPaintUserRow() {
        const node = $('opsUserPlace');
        if (!node) return;
        if (opsUserFix) {
            const meters = isFinite(opsUserFix.accuracy) ? ' ± ' + Math.round(opsUserFix.accuracy) + ' m' : '';
            node.textContent = opsUserFix.lat.toFixed(5) + ', ' + opsUserFix.lng.toFixed(5) + meters;
            return;
        }
        node.textContent = opsUserNote || 'Locating…';
    }

    function opsSyncCameraFocus() {
        const map = opsRealMap;
        if (!map || !map.getSource('ops-camera-focus')) return;
        if (!opsCameraFocus) {
            map.getSource('ops-camera-focus').setData({ type: 'FeatureCollection', features: [] });
            return;
        }
        map.getSource('ops-camera-focus').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [opsCameraFocus.lon, opsCameraFocus.lat] }
            }]
        });
    }

    function opsStreetAtCamera(hit) {
        if (!hit || !isFinite(hit.lat) || !isFinite(hit.lon)) return;
        opsCameraFocus = { lon: hit.lon, lat: hit.lat };
        opsSyncCameraFocus();
        const lat = hit.lat.toFixed(6);
        const lon = hit.lon.toFixed(6);
        const link = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lon);
        const opened = window.open(link, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    }

    function opsLocateUser(fly) {
        if (!navigator.geolocation) {
            opsUserNote = 'This browser has no location service';
            opsPaintUserRow();
            return;
        }
        opsUserNote = 'Locating…';
        opsPaintUserRow();
        navigator.geolocation.getCurrentPosition(function (pos) {
            opsUserFix = {
                lng: pos.coords.longitude,
                lat: pos.coords.latitude,
                accuracy: pos.coords.accuracy
            };
            opsUserNote = '';
            opsSyncUserPin();
            opsPaintUserRow();
            if (fly && opsRealMap) {
                opsMapTouched = true;
                opsRealMap.flyTo({
                    center: [opsUserFix.lng, opsUserFix.lat],
                    zoom: 15,
                    essential: true
                });
            }
        }, function () {
            opsUserFix = null;
            opsUserNote = 'Location was denied';
            opsSyncUserPin();
            opsPaintUserRow();
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
    }

    let opsCameraMiss = false;
    let opsCameraBuf = null;
    let opsCameraLoad = null;
    let opsPinChecked = false;
    let opsPinUseMap = false;

    let opsFlockMeta = null;
    let opsOsmCameras = [];
    let opsCameraDetails = null;
    let opsDetailsReady = false;
    let opsHoverHit = null;

    function opsEnsureCameraDetails() {
        if (opsCameraDetails) return opsCameraDetails;
        const meta = fetch('data/cameras-flock.meta').then(function (res) {
            if (!res.ok) throw new Error('meta');
            return res.arrayBuffer();
        }).then(function (buffer) {
            const view = new DataView(buffer);
            if (view.byteLength < 8 || view.getUint32(0, true) !== 0x4D42524F) throw new Error('meta');
            const count = view.getUint32(4, true);
            opsFlockMeta = { view: view, buffer: buffer, count: count, base: 8 + count * 4 };
        }).catch(function () { opsFlockMeta = null; });
        const osm = fetch('data/cameras-osm.json').then(function (res) {
            if (!res.ok) throw new Error('osm');
            return res.json();
        }).then(function (rows) {
            opsOsmCameras = Array.isArray(rows) ? rows : [];
        }).catch(function () { opsOsmCameras = []; });
        opsCameraDetails = Promise.all([meta, osm]).then(function () {
            opsDetailsReady = true;
            if (opsHoverHit && opsTipPoint) {
                opsTipKey = '';
                opsPlaceTip(opsHoverHit, opsTipPoint);
            }
        });
        return opsCameraDetails;
    }

    function opsFlockDetail(index) {
        const meta = opsFlockMeta;
        if (!meta || index < 0 || index >= meta.count) return null;
        const view = meta.view;
        const at = meta.base + view.getUint32(8 + index * 4, true);
        const angle10 = view.getInt16(at + 4, true);
        const typeLen = view.getUint8(at + 7);
        const nameLen = view.getUint16(at + 8, true);
        const bytes = new Uint8Array(meta.buffer, at + 10, typeLen + nameLen);
        const decode = new TextDecoder('utf-8');
        return {
            id: view.getUint32(at, true),
            angle: angle10 === -32768 ? null : angle10 / 10,
            service: (view.getUint8(at + 6) & 1) === 1,
            type: decode.decode(bytes.subarray(0, typeLen)),
            name: decode.decode(bytes.subarray(typeLen))
        };
    }

    function opsOsmDetail(lat, lon) {
        let best = null;
        let bestDist = 0.00015 * 0.00015;
        opsOsmCameras.forEach(function (cam) {
            const dLat = cam.lat - lat;
            const dLon = cam.lon - lon;
            const dist = dLat * dLat + dLon * dLon;
            if (dist > bestDist) return;
            bestDist = dist;
            best = cam;
        });
        return best;
    }

    function opsEnsureCameras() {
        opsEnsureCameraDetails();
        if (opsCameraBuf) return Promise.resolve(opsCameraBuf);
        if (opsCameraLoad) return opsCameraLoad;
        opsCameraLoad = fetch(OPS_FLOCK.file || 'data/cameras.bin').then(function (res) {
            if (!res.ok) throw new Error('cameras');
            return res.arrayBuffer();
        }).then(function (buffer) {
            const view = new DataView(buffer);
            if (view.byteLength < 12 || view.getUint32(0, true) !== 0x3142524F) throw new Error('cameras');
            const flock = view.getUint32(4, true);
            const osm = view.getUint32(8, true);
            if (12 + (flock + osm) * 8 !== view.byteLength) throw new Error('cameras');
            opsCameraBuf = { view: view, flock: flock, osm: osm, flockAt: 12, osmAt: 12 + flock * 8 };
            opsUploadCameraPins();
            if (opsRealMap) opsRealMap.triggerRepaint();
            return opsCameraBuf;
        }).catch(function () {
            opsCameraLoad = null;
            opsCameraMiss = true;
            opsMapStatusLine();
        });
        return opsCameraLoad;
    }

    function opsPinFrame() {
        const map = opsRealMap;
        const center = map.getCenter();
        const zoom = map.getZoom();
        const scale = 512 * Math.pow(2, zoom);
        const lat = Math.max(-85.051129, Math.min(85.051129, center.lat));
        const sine = Math.sin(lat * Math.PI / 180);
        const host = map.getContainer();
        return {
            lng: center.lng,
            scale: scale,
            cx: (center.lng + 180) / 360 * scale,
            cy: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
            hw: (host.clientWidth || 0) / 2,
            hh: (host.clientHeight || 0) / 2
        };
    }

    function opsPinPoint(lon, lat, frame) {
        let xLon = lon;
        const turn = xLon - frame.lng;
        if (turn > 180) xLon -= 360;
        else if (turn < -180) xLon += 360;
        const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
        const sine = Math.sin(clamped * Math.PI / 180);
        const x = (xLon + 180) / 360 * frame.scale - frame.cx + frame.hw;
        const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * frame.scale - frame.cy + frame.hh;
        return [x, y];
    }

    function opsPinTrust() {
        if (opsPinChecked || !opsRealMap) return;
        opsPinChecked = true;
        const frame = opsPinFrame();
        const samples = [[-122.4194, 37.7749], [-0.1276, 51.5072], [139.6917, 35.6895], [4.9041, 52.3676]];
        let worst = 0;
        samples.forEach(function (pair) {
            const exact = opsRealMap.project(pair);
            const fast = opsPinPoint(pair[0], pair[1], frame);
            worst = Math.max(worst, Math.abs(exact.x - fast[0]), Math.abs(exact.y - fast[1]));
        });
        opsPinUseMap = worst > 1.5;
        const canvas = $('opsMapDraw');
        if (canvas) canvas.dataset.pin = worst.toFixed(2);
    }

    function opsFlockPlace(lat, lon) {
        const latAbs = Math.abs(lat).toFixed(5);
        const lonAbs = Math.abs(lon).toFixed(5);
        return latAbs + '°' + (lat >= 0 ? 'N' : 'S') + ', ' + lonAbs + '°' + (lon >= 0 ? 'E' : 'W');
    }

    function opsCameraXY(lon, lat, frame) {
        if (opsPinUseMap && opsRealMap) {
            const point = opsRealMap.project([lon, lat]);
            return [point.x, point.y];
        }
        return opsPinPoint(lon, lat, frame);
    }

    let opsCameraStamp = '';
    let opsCameraSheet = null;

    function paintOpsFlockDots(ctx) {
        if (!opsCameraBuf) {
            opsEnsureCameras();
            return;
        }
        opsPinTrust();
        const frame = opsPinFrame();
        const canvas = $('opsMapDraw');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width;
        const height = canvas.height;
        const center = opsRealMap.getCenter();
        const stamp = center.lng.toFixed(6) + ',' + center.lat.toFixed(6) + ',' + opsRealMap.getZoom().toFixed(4) + ',' + width + 'x' + height + (opsPinUseMap ? ':m' : ':f');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (opsCameraSheet && opsCameraStamp === stamp) {
            ctx.drawImage(opsCameraSheet, 0, 0);
            return;
        }
        const img = ctx.createImageData(width, height);
        const data = img.data;
        const view = opsCameraBuf.view;
        const plot = function (offset, count, red, green, blue) {
            const end = offset + count * 8;
            for (let cursor = offset; cursor < end; cursor += 8) {
                const lat = view.getInt32(cursor, true) / 1000000;
                const lon = view.getInt32(cursor + 4, true) / 1000000;
                const xy = opsCameraXY(lon, lat, frame);
                const x = (xy[0] * dpr) | 0;
                const y = (xy[1] * dpr) | 0;
                if (x < 0 || y < 0 || x >= width || y >= height) continue;
                const index = (y * width + x) * 4;
                data[index] = red;
                data[index + 1] = green;
                data[index + 2] = blue;
                data[index + 3] = 235;
            }
        };
        plot(opsCameraBuf.osmAt, opsCameraBuf.osm, 56, 189, 248);
        plot(opsCameraBuf.flockAt, opsCameraBuf.flock, 245, 158, 11);
        if (!opsCameraSheet) opsCameraSheet = document.createElement('canvas');
        opsCameraSheet.width = width;
        opsCameraSheet.height = height;
        opsCameraSheet.getContext('2d').putImageData(img, 0, 0);
        opsCameraStamp = stamp;
        ctx.drawImage(opsCameraSheet, 0, 0);
    }

    function opsCameraHit(x, y) {
        if (!opsCameraBuf || !opsRealMap) return null;
        opsPinTrust();
        const frame = opsPinFrame();
        const here = opsRealMap.unproject([x, y]);
        const span = Math.max(0.02, (14 * 360) / frame.scale);
        const view = opsCameraBuf.view;
        let best = null;
        let bestDist = 36;
        const scan = function (offset, count, osm) {
            const end = offset + count * 8;
            for (let cursor = offset; cursor < end; cursor += 8) {
                const lat = view.getInt32(cursor, true) / 1000000;
                const lon = view.getInt32(cursor + 4, true) / 1000000;
                if (Math.abs(lat - here.lat) > span) continue;
                let turn = Math.abs(lon - here.lng);
                if (turn > 180) turn = 360 - turn;
                if (turn > span) continue;
                const xy = opsCameraXY(lon, lat, frame);
                const dx = xy[0] - x;
                const dy = xy[1] - y;
                const dist = dx * dx + dy * dy;
                if (dist > bestDist) continue;
                bestDist = dist;
                best = {
                    x: xy[0],
                    y: xy[1],
                    r: 6,
                    kind: 'flock',
                    id: lat + '|' + lon + '|' + (osm ? 'osm' : 'flock'),
                    lat: lat,
                    lon: lon,
                    index: (cursor - offset) / 8,
                    flock: osm ? 0 : 1,
                    osm: osm ? 1 : 0
                };
            }
        };
        scan(opsCameraBuf.osmAt, opsCameraBuf.osm, true);
        scan(opsCameraBuf.flockAt, opsCameraBuf.flock, false);
        return best;
    }

    function opsSeed(text) {
        let n = 0;
        const value = String(text || '');
        for (let i = 0; i < value.length; i++) n = (n * 33 + value.charCodeAt(i)) >>> 0;
        return n;
    }

    function paintOpsMapFrame(now) {
        const stage = document.querySelector('.ops-globe-stage');
        const canvas = $('opsMapDraw');
        if (!stage || !canvas) return;
        const bounds = stage.getBoundingClientRect();
        if (bounds.width < 20 || bounds.height < 20) return;
        const map = opsEnsureMap();
        if (!map) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round(bounds.width * dpr));
        const h = Math.max(1, Math.round(bounds.height * dpr));
        if (canvas.width !== w || canvas.height !== h || opsMapBox.w !== w || opsMapBox.h !== h) {
            canvas.width = w;
            canvas.height = h;
            opsMapBox.w = w;
            opsMapBox.h = h;
            map.resize();
            opsFitWorld();
        }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, bounds.width, bounds.height);
        opsMapHits = [];
        if (opsMapMode === 'outages') paintOpsOutageDots(ctx);
        else if (opsMapMode === 'cameras') paintOpsFlockDots(ctx);
        else paintOpsAttackDots(ctx);
    }

    function opsQuad(a, b, c, t) {
        const u = 1 - t;
        return [
            u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
            u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]
        ];
    }

    function opsPortDetail(port) {
        const n = String(port || '').replace(/\D/g, '');
        if (!n) return '';
        const name = OPS_PORTS[n];
        return name ? 'port ' + n + ' (' + name + ')' : 'port ' + n;
    }

    function opsNormLon(lon) {
        let x = Number(lon) || 0;
        while (x < -180) x += 360;
        while (x > 180) x -= 360;
        return x;
    }

    function opsLandOn(lon, lat) {
        if (!opsLandRaw) opsLandRaw = atob(OPS_LAND.bits);
        const cols = OPS_LAND.cols;
        const rows = OPS_LAND.rows;
        const col = Math.floor(((opsNormLon(lon) + 180) / 360) * cols);
        const row = Math.floor(((90 - Number(lat)) / 180) * rows);
        if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
        const i = row * cols + col;
        return (opsLandRaw.charCodeAt(i >> 3) & (1 << (i % 8))) !== 0;
    }

    function opsCountryAt(lon, lat) {
        if (!opsCountryRaw) opsCountryRaw = atob(OPS_COUNTRY.bits);
        const cols = OPS_COUNTRY.cols;
        const rows = OPS_COUNTRY.rows;
        const col = Math.floor(((opsNormLon(lon) + 180) / 360) * cols);
        const row = Math.floor(((90 - Number(lat)) / 180) * rows);
        if (col < 0 || row < 0 || col >= cols || row >= rows) return '';
        return OPS_COUNTRY.codes[opsCountryRaw.charCodeAt(row * cols + col)] || '';
    }

    function opsLandCell(lon, lat) {
        const cols = OPS_LAND.cols;
        const rows = OPS_LAND.rows;
        const col = Math.max(0, Math.min(cols - 1, Math.floor(((opsNormLon(lon) + 180) / 360) * cols)));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(((90 - Number(lat)) / 180) * rows)));
        return [-180 + (col + 0.5) * (360 / cols), 90 - (row + 0.5) * (180 / rows)];
    }

    function opsAttackAim(lon, lat, bearing, code) {
        const east = Math.cos(bearing);
        const north = Math.sin(bearing);
        const trail = [];
        for (let step = 1; step <= 48; step++) {
            const dist = step * 1.4;
            const nextLat = lat + north * dist;
            if (nextLat > 78 || nextLat < -70) break;
            const nextLon = lon + east * dist;
            if (opsCountryAt(nextLon, nextLat) !== code || !opsLandOn(nextLon, nextLat)) {
                if (trail.length || step > 4) break;
                continue;
            }
            const cell = opsLandCell(nextLon, nextLat);
            const prev = trail[trail.length - 1];
            if (!prev || prev[0] !== cell[0] || prev[1] !== cell[1]) trail.push(cell);
        }
        return trail.length ? trail[trail.length - 1] : null;
    }

    function opsStrokeArc(ctx, a, b, c, from, to) {
        const steps = 16;
        let point = opsQuad(a, b, c, from);
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        for (let step = 1; step <= steps; step++) {
            point = opsQuad(a, b, c, from + (to - from) * (step / steps));
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    }

    function opsAttackSpot(item, slot, w, h) {
        const hasLon = item.lon !== null && item.lon !== undefined && item.lon !== '' && isFinite(Number(item.lon));
        const hasLat = item.lat !== null && item.lat !== undefined && item.lat !== '' && isFinite(Number(item.lat));
        let lon = hasLon ? Number(item.lon) : NaN;
        let lat = hasLat ? Number(item.lat) : NaN;
        if (!isFinite(lon) || !isFinite(lat)) return null;
        while (lon < -180) lon += 360;
        while (lon > 180) lon -= 360;
        if (lat < -90 || lat > 90) return null;
        return { lon: lon, lat: lat };
    }

    function opsMapDot(ctx, x, y, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    function opsAttackLink(item) {
        const story = item && opsStoryForAttack(item);
        if (story && story.link) return story.link;
        if (!item || !item.ip) return '';
        return 'https://isc.sans.edu/ipdetails.html?ip=' + encodeURIComponent(item.ip);
    }

    function paintOpsAttackDots(ctx) {
        opsAttacks.forEach(function (item) {
            if (!item.ip) return;
            const spot = opsAttackSpot(item);
            const point = spot && opsScreenPoint(spot.lon, spot.lat);
            if (!point || !opsOnScreen(point[0], point[1])) return;
            opsMapDot(ctx, point[0], point[1], '#fb7185');
            opsMapHits.push({
                x: point[0],
                y: point[1],
                r: 8,
                kind: 'ip',
                id: item.ip,
                ip: item.ip,
                link: opsAttackLink(item)
            });
        });
    }

    function paintOpsOutageDots(ctx) {
        opsOutages.forEach(function (item, index) {
            if (!item.country || !OPS_PLACES[item.country]) return;
            const meta = OPS_OUTAGE_META[item.source] || { color: '#e4e4e7' };
            const place = OPS_PLACES[item.country];
            const lon = isFinite(item.lon) ? item.lon : place[0];
            const lat = isFinite(item.lat) ? item.lat : place[1];
            const point = opsScreenPoint(lon, lat);
            if (!point || !opsOnScreen(point[0], point[1])) return;
            opsMapDot(ctx, point[0], point[1], meta.color);
            opsMapHits.push({
                x: point[0],
                y: point[1],
                r: 8,
                kind: 'outage',
                id: String(index),
                link: item.link || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard'
            });
        });
    }

    function paintOpsMapList() {
        const key = $('opsMapKey');
        if (!key) return;
        key.hidden = false;
        if (opsMapMode === 'outages') {
            key.innerHTML = Object.keys(OPS_OUTAGE_META).map(function (id) {
                const meta = OPS_OUTAGE_META[id];
                return '<span><i style="background:' + meta.color + '"></i>' + esc(meta.label) + '</span>';
            }).join('');
            return;
        }
        if (opsMapMode === 'cameras') {
            key.innerHTML = '<span><i style="background:#f59e0b"></i>Flock</span><span><i style="background:#38bdf8"></i>ALPR</span>';
            return;
        }
        key.innerHTML = '<span><i style="background:#fb7185"></i>Attack</span>';
    }

    function opsSessionCache(key, next, ttl) {
        const life = ttl || 10 * 60 * 1000;
        if (next) {
            try { sessionStorage.setItem(key, JSON.stringify(next)); } catch (error) {}
            return next;
        }
        try {
            const saved = JSON.parse(sessionStorage.getItem(key) || '');
            if (saved && saved.at && Date.now() - saved.at < life) return saved;
        } catch (error) {}
        return null;
    }

    function opsPortCacheGet() {
        if (opsPortCache) return opsPortCache;
        try { opsPortCache = JSON.parse(sessionStorage.getItem('orbint-ops-ports2') || '{}') || {}; }
        catch (error) { opsPortCache = {}; }
        return opsPortCache;
    }

    function opsRememberPort(ip, port) {
        const cache = opsPortCacheGet();
        cache[ip] = { port: String(port || ''), at: Date.now() };
        try { sessionStorage.setItem('orbint-ops-ports2', JSON.stringify(cache)); } catch (error) {}
    }

    function opsKnownPort(ip) {
        const row = opsPortCacheGet()[ip];
        if (!row || Date.now() - row.at > 30 * 60 * 1000) return null;
        return String(row.port || '');
    }

    function opsTopPort(payload) {
        let rows = payload;
        if (payload && !Array.isArray(payload)) {
            const root = payload.ipdetails || payload;
            rows = root && (root.report || root.reports);
        }
        if (!rows) return '';
        if (!Array.isArray(rows)) rows = [rows];
        const counts = {};
        rows.forEach(function (row) {
            const port = String((row && (row.targetport || row.target_port)) || '').replace(/\D/g, '');
            if (!port) return;
            counts[port] = (counts[port] || 0) + 1;
        });
        let best = '';
        let n = 0;
        Object.keys(counts).forEach(function (port) {
            if (counts[port] > n) { best = port; n = counts[port]; }
        });
        return best;
    }

    function opsFillPorts(items) {
        opsPortStop = false;
        const pending = [];
        (items || []).forEach(function (item) {
            const known = opsKnownPort(item.ip);
            if (known !== null) { item.port = known; return; }
            pending.push(item);
        });
        let chain = Promise.resolve();
        pending.slice(0, 6).forEach(function (item) {
            chain = chain.then(function () {
                if (opsPortStop || !item.ip) return null;
                return fetch('https://isc.sans.edu/api/ipdetails/' + encodeURIComponent(item.ip) + '?json').then(function (res) {
                    if (res.status === 429) { opsPortStop = true; return null; }
                    if (!res.ok) return null;
                    const type = res.headers.get('content-type') || '';
                    if (type.indexOf('json') < 0) return null;
                    return res.json();
                }).then(function (payload) {
                    if (!payload) {
                        opsPortMiss[item.ip] = true;
                        if (opsReportKey) paintOpsReport();
                        return;
                    }
                    const port = opsTopPort(payload);
                    item.port = port;
                    delete opsPortMiss[item.ip];
                    opsRememberPort(item.ip, port);
                    paintOpsMapList();
                    if (opsReportKey) paintOpsReport();
                }).catch(function () {
                    opsPortMiss[item.ip] = true;
                    if (opsReportKey) paintOpsReport();
                });
            });
        });
    }

    function closeOpsReport() {
        opsReportKey = '';
        const box = $('opsReport');
        if (!box) return;
        box.hidden = true;
        box.innerHTML = '';
    }

    function opsOpenMapHit(hit) {
        if (!hit) return;
        let link = hit.link || '';
        if (!link && hit.kind === 'outage') {
            const item = opsOutages[Number(hit.id)];
            link = (item && item.link) || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
        }
        if (!link && hit.ip) link = opsAttackLink(opsAttacks.filter(function (row) { return row.ip === hit.ip; })[0]);
        if (!link) return;
        const opened = window.open(link, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    }

    function paintOpsReport() {
        const box = $('opsReport');
        if (!box || !opsReportKey) return;
        const split = opsReportKey.indexOf(':');
        const kind = opsReportKey.slice(0, split);
        const id = opsReportKey.slice(split + 1);
        let html = '';
        if (kind === 'flock') {
            const parts = id.split('|');
            const lat = Number(parts[0]);
            const lon = Number(parts[1]);
            if (!isFinite(lat) || !isFinite(lon)) { closeOpsReport(); return; }
            const which = parts[2] === 'osm' ? 'an OSM ALPR camera' : 'a Flock camera';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>Camera at ' + esc(opsFlockPlace(lat, lon)) +
                '</h3><p>This dot is ' + which + ', plotted on its published coordinates. A click opens that exact point in Google Maps.</p><p>Flock coordinates are the public inventory from Joshua Michael, 2026, the set published at Flock Surveillance. OSM points are DeFlock and OpenStreetMap contributors.</p><p>' +
                '<a href="https://flocksurveillance.org/" target="_blank" rel="noopener noreferrer">Flock Surveillance</a> · ' +
                '<a href="https://github.com/FoggedLens/deflock" target="_blank" rel="noopener noreferrer">DeFlock</a> · ' +
                '<a href="https://dontgetflocked.com/" target="_blank" rel="noopener noreferrer">DeFlock map</a></p>';
        } else if (kind === 'outage') {
            const item = opsOutages[Number(id)];
            if (!item) { closeOpsReport(); return; }
            const meta = OPS_OUTAGE_META[item.source] || { label: 'Outage' };
            const where = item.country ? opsCountryName(item.country) : '';
            const link = item.link || 'https://ioda.inetintel.cc.gatech.edu/ioda/dashboard';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>' + esc(item.name || 'Outage') +
                '</h3><p>' + esc([meta.label, item.level, where, item.time ? opsAgo(item.time) : ''].filter(Boolean).join(' · ')) +
                '</p><p>This is a live IODA alert for this network.</p><a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Open the IODA record</a>';
        } else {
            const rows = kind === 'ip'
                ? opsAttacks.filter(function (item) { return item.ip === id; })
                : opsAttacks.filter(function (item) { return item.country === id; });
            if (!rows.length) { closeOpsReport(); return; }
            const place = rows[0].country ? opsCountryName(rows[0].country) : 'Unlocated source';
            html = '<button type="button" class="ops-report-close" data-report="close">Close</button><h3>' + esc(rows[0].ip) +
                '</h3><p>' + esc([rows[0].city, place !== 'Unlocated source' ? place : '', (rows[0].count || 0) + ' reports', opsAttackWindowLabel()].filter(Boolean).join(' · ')) +
                '</p><p>The dot is the located address SANS recorded as an attack source. Sensor locations are not published.</p><ul>' +
                rows.map(function (item) {
                    const aim = item.port
                        ? ('Most often ' + opsPortDetail(item.port) + '.')
                        : (opsKnownPort(item.ip) === '' ? 'The latest report has no destination port.' : (opsPortMiss[item.ip] ? 'The destination port did not load. Open the SANS report.' : 'Reading the destination port…'));
                    const link = 'https://isc.sans.edu/ipdetails.html?ip=' + encodeURIComponent(item.ip);
                    return '<li><b>' + esc(item.ip) + '</b><span>' + esc((item.count || 0) + ' reports. ' + aim) +
                        '</span><a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Open the SANS report</a></li>';
                }).join('') + '</ul>';
        }
        box.innerHTML = html;
        box.hidden = false;
    }

    function opsFlagImg(code) {
        const value = String(code || '').toUpperCase();
        if (!/^[A-Z]{2}$/.test(value)) return '';
        return '<img alt="" src="https://flagcdn.com/w320/' + value.toLowerCase() + '.png" onerror="this.remove()">';
    }

    function opsAttackWindowLabel() {
        return ({ live: 'Live', day: 'Last day', week: 'Last week', month: 'Last month', year: 'Last year', decade: 'Last decade' })[opsAttackRange] || 'Live';
    }

    function opsStoryForAttack(item) {
        const country = item.country ? opsCountryName(item.country).toLowerCase() : '';
        const city = String(item.city || '').toLowerCase();
        const port = item.port ? String(opsPortDetail(item.port) || '').toLowerCase() : '';
        let best = null;
        let bestScore = 0;
        opsNewsAll.forEach(function (story) {
            const hay = ((story.title || '') + ' ' + (story.text || '')).toLowerCase();
            let points = 0;
            if (country && country.length > 3 && hay.indexOf(country) >= 0) points += 3;
            if (city && city.length > 2 && hay.indexOf(city) >= 0) points += 2;
            if (port && port.length > 2 && hay.indexOf(port) >= 0) points += 1;
            if (points > bestScore || (points && points === bestScore && (story.date || 0) > ((best && best.date) || 0))) {
                best = story;
                bestScore = points;
            }
        });
        return bestScore ? best : null;
    }

    function opsAttackTip(hit) {
        const item = opsAttacks.filter(function (row) { return row.ip === hit.ip; })[0];
        if (!item) return '';
        const story = opsStoryForAttack(item);
        if (story && !story.image && !story.imageTried) opsQueueImages([story]);
        const picture = story && story.image
            ? '<img alt="" referrerpolicy="no-referrer" src="' + esc(story.image) + '" onerror="this.remove()">'
            : opsFlagImg(item.country);
        const headline = story && story.title ? story.title : 'No matching article yet';
        const where = [item.city, item.country ? opsCountryName(item.country) : ''].filter(Boolean).join(', ');
        const port = item.port ? opsPortDetail(item.port) : 'port still loading';
        const facts = [item.ip, (item.count || 0) + ' reports', port, where].filter(Boolean).join(' · ');
        const note = story && story.link ? 'Click to open the article.' : 'Click to open the SANS source.';
        return picture + '<strong>' + esc(headline) + '</strong><p>' + esc(facts) + '</p><p>' + esc(note) + '</p>';
    }

    function opsCameraCard(hit) {
        const titleCase = function (text) {
            const value = String(text || '').replace(/[_-]+/g, ' ').trim();
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1);
        };
        const row = function (label, value) {
            if (!value) return '';
            return '<div class="ops-cam-row"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
        };
        let title = 'ALPR Camera';
        let id = '';
        let maker = hit.osm ? 'OpenStreetMap' : 'Flock Safety';
        let zone = '';
        let kind = '';
        let facing = '';
        if (hit.osm) {
            const found = opsOsmDetail(hit.lat, hit.lon);
            if (found) {
                id = found.id ? String(found.id) : '';
                if (found.maker) maker = found.maker;
                if (found.zone) zone = titleCase(found.zone);
                if (found.kind) title = titleCase(found.kind) + ' Camera';
                if (found.facing != null && found.facing !== '') facing = found.facing + '°';
            }
        } else {
            const found = opsFlockDetail(hit.index);
            if (found) {
                if (found.name) title = found.name;
                if (found.id) id = String(found.id);
                if (found.type) kind = titleCase(found.type);
                if (found.angle != null) facing = Math.round(found.angle) + '°';
            }
        }
        const mark = '<svg class="ops-cam-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="8" fill="#18181b"/><path fill="#e4e4e7" d="M10 16h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3zm20 5 9-4v16l-9-4V21z"/></svg>';
        return '<div class="ops-cam"><div class="ops-cam-top">' + mark +
            '<div><strong>' + esc(title) + '</strong>' +
            (id ? '<p class="ops-cam-id">ID: ' + esc(id) + '</p>' : '') +
            '</div></div>' +
            row('Made by', maker) +
            row('Zone', zone) +
            row('Type', kind) +
            row('Facing', facing) +
            row('Coords', hit.lat.toFixed(5) + ', ' + hit.lon.toFixed(5)) +
            '<p class="ops-cam-go">Click to open this camera in Google Maps.</p></div>';
    }

    function opsFlockTip(hit) {
        return opsCameraCard(hit);
    }

    function opsOutageTip(hit) {
        const item = opsOutages[Number(hit.id)];
        if (!item) return '';
        const meta = OPS_OUTAGE_META[item.source] || { label: 'Outage' };
        const where = item.country ? opsCountryName(item.country) : '';
        return opsFlagImg(item.country) + '<strong>' + esc(item.name || 'Outage') + '</strong><p>' +
            esc([meta.label, item.level, where, item.time ? opsAgo(item.time) : ''].filter(Boolean).join(' · ')) +
            '</p><p>IODA alert for this network.</p>';
    }

    function opsHideTip() {
        const tip = $('opsMapTip');
        opsHover = null;
        opsHoverHit = null;
        if (!tip || tip.hidden) return;
        opsTipKey = '';
        tip.hidden = true;
        tip.innerHTML = '';
        tip.classList.remove('is-cam');
    }

    function opsPlaceTip(hit, event) {
        const tip = $('opsMapTip');
        const stage = tip && tip.parentElement;
        if (!tip || !stage) return;
        opsTipPoint = event;
        const html = hit.kind === 'flock' ? opsFlockTip(hit) : (hit.kind === 'outage' ? opsOutageTip(hit) : opsAttackTip(hit));
        if (!html) { opsHideTip(); return; }
        tip.classList.toggle('is-cam', hit.kind === 'flock');
        const key = hit.kind + ':' + (hit.ip || hit.id) + (hit.kind === 'flock' && opsDetailsReady ? ':d' : '');
        if (opsTipKey !== key) {
            opsTipKey = key;
            tip.innerHTML = html;
        }
        tip.hidden = false;
        const bounds = stage.getBoundingClientRect();
        const width = tip.offsetWidth;
        const height = tip.offsetHeight;
        let left = event.clientX - bounds.left + 16;
        let top = event.clientY - bounds.top + 16;
        if (left + width > bounds.width - 8) left = event.clientX - bounds.left - width - 14;
        if (top + height > bounds.height - 8) top = Math.max(8, bounds.height - height - 8);
        if (left < 8) left = 8;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

