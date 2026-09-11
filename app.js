(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const words = {
    en: {
      title: 'Sheep gathering',
      basemap: 'Basemap', mapView: 'Map', satellite: 'Satellite',
      satelliteUnavailable: 'Satellite unavailable. Showing Map.', retrySatellite: 'Retry satellite',
      done: 'Done', placeAction: 'Place',
      marker: 'Marker', drawing: 'Drawing',
      red:'Red', orange:'Orange', yellow:'Yellow', green:'Green', blue:'Blue', indigo:'Indigo', violet:'Violet',
      welcome: 'Gather together',
      joinHelp:
        'Open your group invite and enter your name. Location sharing is optional.',
      name: 'Your name',
      join: 'Join gathering',
      start: 'Start sharing',
      stop: 'Stop sharing',
      place: 'Place marker',
      placeHelp: 'Move the map. The crosshair is the saved position.',
      note: 'Note',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add marker',
      draw: 'Draw',
      drawHelp: 'Draw with one finger. Map movement is paused.',
      color: 'Color',
      undo: 'Undo',
      group: 'People & notes',
      conflict: 'Some edits need review — no overwrite was made.',
      connected: 'Connected',
      offline: 'Offline · cached positions',
      pending: 'pending',
      redraw: 'Redraw',
      editNote: 'Edit',
      edit: 'Move',
      deleteMarker: 'Delete',
      deleteLine: 'Delete',
      stale: 'Stale',
      live: 'Live',
    },
    is: {
      title: 'smali',
      basemap: 'Bakgrunnskort', mapView: 'Kort', satellite: 'Gervihnöttur',
      satelliteUnavailable: 'Gervihnattamyndir eru ekki tiltækar. Kort birt í staðinn.', retrySatellite: 'Reyna aftur',
      done: 'Lokið', placeAction: 'Setja',
      marker: 'Merki', drawing: 'Teikning',
      red:'Rauður', orange:'Appelsínugulur', yellow:'Gulur', green:'Grænn', blue:'Blár', indigo:'Indígó', violet:'Fjólublár',
      welcome: 'Saman í leit',
      joinHelp:
        'Opnaðu boðið og sláðu inn nafnið þitt. Staðsetningardeiling er valfrjáls.',
      name: 'Nafnið þitt',
      join: 'Taka þátt',
      start: 'Deila staðsetningu',
      stop: 'Hætta deilingu',
      place: 'Setja merki',
      placeHelp: 'Færðu kortið. Krossinn sýnir staðsetninguna.',
      note: 'Athugasemd',
      cancel: 'Hætta við',
      save: 'Vista',
      add: 'Bæta við merki',
      draw: 'Teikna',
      drawHelp: 'Teiknaðu með einum fingri. Kortið er kyrrt.',
      color: 'Litur',
      undo: 'Afturkalla',
      group: 'Fólk og merki',
      conflict: 'Breytingar þarfnast skoðunar — engu var yfirskrifað.',
      connected: 'Tengt',
      offline: 'Ótengt · vistaðar staðsetningar',
      pending: 'í bið',
      redraw: 'Teikna aftur',
      editNote: 'Breyta',
      edit: 'Færa',
      deleteMarker: 'Eyða',
      deleteLine: 'Eyða',
      stale: 'Úrelt',
      live: 'Nýtt',
    },
    da: {
      title: 'Fåresamling',
      basemap: 'Baggrundskort', mapView: 'Kort', satellite: 'Satellit',
      satelliteUnavailable: 'Satellit er ikke tilgængelig. Viser kort.', retrySatellite: 'Prøv satellit igen',
      done: 'Færdig', placeAction: 'Placér',
      marker: 'Mærke', drawing: 'Tegning',
      red:'Rød', orange:'Orange', yellow:'Gul', green:'Grøn', blue:'Blå', indigo:'Indigo', violet:'Violet',
      welcome: 'Sammen på kortet',
      joinHelp:
        'Åbn invitationen og skriv dit navn. Deling af position er valgfri.',
      name: 'Dit navn',
      join: 'Deltag',
      start: 'Del position',
      stop: 'Stop deling',
      place: 'Placér mærke',
      placeHelp: 'Flyt kortet. Krydset viser den gemte position.',
      note: 'Note',
      cancel: 'Annuller',
      save: 'Gem',
      add: 'Tilføj mærke',
      draw: 'Tegn',
      drawHelp: 'Tegn med én finger. Kortet er låst.',
      color: 'Farve',
      undo: 'Fortryd',
      group: 'Personer og noter',
      conflict: 'Ændringer skal gennemgås — intet blev overskrevet.',
      connected: 'Forbundet',
      offline: 'Offline · gemte positioner',
      pending: 'afventer',
      redraw: 'Tegn igen',
      editNote: 'Redigér',
      edit: 'Flyt',
      deleteMarker: 'Slet',
      deleteLine: 'Slet',
      stale: 'Forældet',
      live: 'Aktuel',
    },
  };
  let language = localStorage.getItem('language') || 'en';
  if (!words[language]) language = 'en';
  const tr = (k) => words[language][k] || words.en[k] || k;
  function translate() {
    document.documentElement.lang = language;
    document
      .querySelectorAll('[data-i18n]')
      .forEach((e) => (e.textContent = tr(e.dataset.i18n)));
    $('share').textContent = tr(sharing ? 'stop' : 'start');
    if (!$('draw-panel').hidden) renderPalette();
  }
  let invite = new URLSearchParams(location.hash.slice(1)).get('invite') || new URLSearchParams(location.search).get('invite');
  const apiOrigin = window.SMALI_CONFIG?.apiOrigin || '';
  const separateAPI = !!apiOrigin && apiOrigin !== location.origin;
  const sessionKey = 'smali-session:' + apiOrigin;
  let bearerSession = null;
  try { bearerSession = JSON.parse(sessionStorage.getItem(sessionKey)); } catch {}
  if (bearerSession?.expiresAt <= Date.now()) {bearerSession=null;sessionStorage.removeItem(sessionKey);}
  const load = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const store = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));
  let data = load('state', null),
    pending = load('pending', []),
    busy = false,
    editing = null,
    online = false,
    initialized = false;
  let conflicts = load('conflicts', []);
  let watch = null,
    sharing = false,
    latest = null,
    locationPending = load('locationPending', null);
  if (locationPending && !locationPending.clear) {
    locationPending = { clear: true };
    store('locationPending', locationPending);
  }
  const map = L.map('map', { zoomControl: false }).setView(
    [66.1128801, -20.1105266],
    11,
  );
  L.control.zoom({ position: 'topright' }).addTo(map);
  const basemaps = {
    map: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Powered by <a href="https://www.esri.com/">Esri</a> | Source: <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri, Vantor, Earthstar Geographics, and the GIS User Community</a>',
    },
  };
  let basemapLayer;
  function setBasemap(choice) {
    if (!Object.hasOwn(basemaps, choice)) choice = 'satellite';
    if (basemapLayer) map.removeLayer(basemapLayer);
    const source = basemaps[choice];
    const layer = choice === 'satellite'
      ? L.esri.tiledMapLayer({url: source.url.replace('/tile/{z}/{y}/{x}', ''), maxZoom: 19, attribution: source.attribution, errorTileUrl: ''})
      : L.tileLayer(source.url, {maxZoom: 19, attribution: source.attribution});
    basemapLayer = layer;
    $('basemap-notice').hidden = true;
    if (choice === 'satellite') {
      let failures = 0;
      const fallback = () => {
        if (basemapLayer !== layer) return;
        setBasemap('map'); // Remember the working fallback, including across reloads.
        $('basemap-notice').hidden = false;
      };
      layer.on('tileerror', () => { if (++failures >= 3) fallback(); });
      layer.on('requesterror', fallback); // Esri metadata is required before tiles can load.
    }
    layer.addTo(map);
    $('basemap').value = choice;
    try { store('smali-basemap-v2', choice); } catch {} // Private storage must not prevent switching.
  }
  $('basemap').onchange = () => setBasemap($('basemap').value);
  $('retry-satellite').onclick = () => setBasemap('satellite');
  // One-time default update; subsequent manual choices and fallback remain remembered.
  setBasemap(load('smali-basemap-v2', 'satellite'));
  const features = L.layerGroup().addTo(map);
  const annotations = new Map();
  function annotation(key, item, create, update, content) {
    let entry = annotations.get(key);
    if (!entry) {
      entry = {layer:create().addTo(map), signature:null};
      annotations.set(key, entry);
    }
    const signature = JSON.stringify([item, language]);
    if (entry.signature !== signature) {
      update(entry.layer);
      entry.layer.bindPopup(content());
      entry.signature = signature;
    }
    entry.seen = true;
  }
  const element = (tag, text) => {
    const e = document.createElement(tag);
    e.textContent = text;
    return e;
  };
  function status(message) {
    $('status').textContent =
      message ||
      (online ? tr('connected') : tr('offline')) +
        ` · ${pending.length} ${tr('pending')}` +
        (locationPending?.clear ? ' · Location clear pending' : '');
    $('status').classList.toggle('offline', !online);
  }
  async function api(url, body, method = body ? 'POST' : 'GET') {
    const r = await fetch(apiOrigin + url, {
      method,
      credentials: separateAPI ? 'omit' : 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(separateAPI && bearerSession?.expiresAt > Date.now() ? {Authorization:'Bearer '+bearerSession.token} : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await r.json();
    if (!r.ok)
      throw Object.assign(new Error(result.error || 'Request failed'), {
        status: r.status,
      });
    return result;
  }
  function renderConflicts() {
    $('conflict-panel').hidden = !conflicts.length;
    $('conflict-list').replaceChildren();
    for (const op of conflicts) {
      const row = element(
        'div',
        `${op.body.text || (op.url === '/api/markers' ? 'Marker' : 'Drawing')} — ${op.error || 'Conflict'}. Review the current map before making a new edit.`,
      );
      if (op.url === '/api/markers' && !op.body.id && op.body.text === '' && op.error === 'Invalid marker') {
        const retry = element('button', 'Retry marker');
        retry.onclick = () => {
          pending.push({url: op.url, body: op.body});
          store('pending', pending);
          conflicts = conflicts.filter(c => c !== op);
          store('conflicts', conflicts);
          renderConflicts();
          sync();
        };
        row.append(retry);
      }
      const dismiss = element('button', 'Discard this draft');
      dismiss.onclick = () => {
        conflicts = conflicts.filter((c) => c !== op);
        store('conflicts', conflicts);
        renderConflicts();
      };
      row.append(dismiss);
      $('conflict-list').append(row);
    }
  }
  function itemBox(item, isDrawing) {
    const box = element('div', '');
    box.className = 'item';
    box.append(element('strong', item.text || tr(isDrawing ? 'drawing' : 'marker')));
    box.append(
      element(
        'p',
        `${item.author.name} → ${item.lastEditor.name} · v${item.version}`,
      ),
    );
    const actions = element('div', '');
    actions.className = 'item-actions';
    const note = element('button', tr('editNote'));
    note.onclick = () => editNote(item, isDrawing);
    actions.append(note);
    const edit = element('button', tr(isDrawing ? 'redraw' : 'edit'));
    edit.onclick = () => {
      $('group-panel').open = false;
      isDrawing ? beginDrawing(item) : editMarker(item);
    };
    actions.append(edit);
    const del = element('button', tr(isDrawing ? 'deleteLine' : 'deleteMarker'));
    del.className = 'delete-item danger';
    del.disabled = pending.some((op) =>
      op.url === (isDrawing ? '/api/drawings' : '/api/markers') &&
      op.body.id === item.id && op.body.deleted,
    );
    del.onclick = () => {
      if (del.disabled) return;
      del.disabled = true;
      map.closePopup();
      queue(isDrawing ? '/api/drawings' : '/api/markers', {
        id: item.id,
        version: item.version,
        deleted: true,
      });
    };
    actions.append(del);
    box.append(actions);
    return box;
  }
  function annotationLabel(layer, text, offset = [0, 0]) {
    const label = (text || '').trim();
    if (!label) { layer.unbindTooltip(); return; }
    const content = element('span', label);
    if (layer.getTooltip()) layer.setTooltipContent(content);
    else layer.bindTooltip(content, {permanent:true, direction:'top', interactive:false, className:'annotation-label', offset});
    layer.openTooltip();
  }
  function render() {
    renderConflicts();
    features.clearLayers();
    $('people-list').replaceChildren();
    $('items-list').replaceChildren();
    for (const entry of annotations.values()) entry.seen = false;
    if (!data) {
      for (const entry of annotations.values()) map.removeLayer(entry.layer);
      annotations.clear();
      return;
    }
    if (noteEditing) {
      const current=(noteEditing.isDrawing ? data.drawings : data.markers)?.find(i=>i.id===noteEditing.item.id);
      const changed=!current || current.version!==noteEditing.item.version;
      $('note-review').textContent=changed ? (current ? 'This item changed remotely. Your draft is kept. Cancel to review the latest before editing again.' : 'This item was removed remotely. Your draft is kept; copy it before Cancel.') : '';
      $('save-note').disabled=changed;
    }
    const showLocal = sharing && latest && data.me;
    const people = (data.people || []).filter(p => !showLocal || p.id !== data.me.id);
    if (showLocal) people.push({...latest, id:data.me.id, name:data.me.name, updatedAt:latest.measuredAt, localOnly:true});
    for (const p of people) {
      const stale = p.stale || (!online && !p.localOnly) || Date.now() - p.updatedAt > 60000;
      const displayName = p.localOnly ? `${p.name} (you · local GPS${online ? '' : ' · not shared'})` : p.name;
      const text = `${displayName} · ±${Math.round(p.accuracy)} m · ${tr(stale ? 'stale' : 'live')} · ${new Date(p.updatedAt).toLocaleTimeString()}`;
      const row = element('button', text);
      row.className = stale ? 'person stale' : 'person';
      row.onclick = () => {
        map.setView([p.lat, p.lon], 14);
        $('group-panel').open = false;
      };
      $('people-list').append(row);
      annotation('p:'+p.id, {...p,stale,text},
        () => L.circleMarker([p.lat,p.lon],{radius:10,fillOpacity:0.85,weight:3}).bindTooltip(element('span',p.name),{permanent:true,direction:'top'}),
        layer => {layer.setLatLng([p.lat,p.lon]);layer.setStyle({color:stale?'#737373':'#16634c'});},
        () => element('p',text));
      if (
        !stale &&
        Number.isFinite(p.heading) &&
        Number.isFinite(p.speed) &&
        p.speed >= 0.5
      ) {
        const arrow = element('span', '↑');
        arrow.className = 'travel-arrow';
        arrow.style.transform = `rotate(${p.heading}deg)`;
        arrow.title = 'Direction of travel';
        L.marker([p.lat, p.lon], {
          interactive: false,
          icon: L.divIcon({
            html: arrow,
            className: 'travel-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(features);
      }
    }
    for (const m of data.markers || []) {
      annotation('m:'+m.id, m, () => L.marker([m.lat,m.lon]),
        layer => { const pin = element('span','');pin.className='annotation-pin';pin.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(m.color) ? m.color : '#2563eb';layer.setIcon(L.divIcon({html:pin,className:'annotation-marker',iconSize:[48,48],iconAnchor:[24,40],popupAnchor:[0,-36]})); layer.setLatLng([m.lat,m.lon]); annotationLabel(layer, m.text, [0, -32]); },
        () => itemBox(m,false));
      $('items-list').append(itemBox(m, false));
    }
    for (const d of data.drawings || []) {
      annotation('d:'+d.id, d, () => L.featureGroup([
        L.polyline(d.strokes, {color:d.color,weight:40,opacity:0,className:'drawing-hit'}),
        L.polyline(d.strokes, {color:d.color,weight:6,interactive:false,className:'drawing-visible'}),
      ]),
        layer => {layer.eachLayer(stroke => {stroke.setLatLngs(d.strokes);stroke.setStyle({color:d.color});});annotationLabel(layer, d.text);}, () => itemBox(d,true));
      $('items-list').append(itemBox(d, true));
    }
    for (const [key,entry] of annotations) if (!entry.seen) {
      if (entry.layer.isPopupOpen()) $('remote-notice').hidden=false;
      map.removeLayer(entry.layer); annotations.delete(key);
    }
  }

  function fitVisualViewport() {
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--visual-height', `${height}px`);
    document.documentElement.style.setProperty('--visual-bottom', `${height + (viewport?.offsetTop || 0)}px`);
  }
  window.visualViewport?.addEventListener('resize', fitVisualViewport);
  window.visualViewport?.addEventListener('scroll', fitVisualViewport);
  window.addEventListener('resize', fitVisualViewport);
  fitVisualViewport();
  let noteEditing = null;
  function closeNote() {
    $('note-panel').hidden = true;
    $('note-text').blur();
    noteEditing = null;
  }
  function editNote(item, isDrawing) {
    closeMarker(); closeDrawing(); closeNote();
    map.closePopup(); $('group-panel').open = false;
    noteEditing = {item, isDrawing};
    $('note-review').textContent='';$('save-note').disabled=false;
    $('note-text').value = item.text || '';
    $('note-color-row').hidden = false;
    $('note-color').value = item.color || (isDrawing ? '#b45309' : '#2563eb');
    renderNotePalette();
    $('note-panel').hidden = false;
  }
  $('dismiss-remote').onclick = () => { $('remote-notice').hidden=true; };
  $('cancel-note').onclick = closeNote;
  $('save-note').onclick = () => {
    if (!noteEditing || $('save-note').disabled) return;
    const {item, isDrawing} = noteEditing;
    queue(isDrawing ? '/api/drawings' : '/api/markers', {
      id:item.id, version:item.version, text:$('note-text').value.trim(),
      color:$('note-color').value,
      ...(isDrawing ? {strokes:item.strokes} : {lat:item.lat, lon:item.lon}),
    });
    closeNote();
  };
  function editMarker(m = null) {
    closeDrawing(); closeNote();
    $('group-panel').open = false;
    status();
    editing = m;
    map.closePopup();
    if (m) map.panTo([m.lat, m.lon]);
    $('marker-panel').hidden = false;
    $('crosshair').hidden = false;
  }
  function closeMarker() {
    $('marker-panel').hidden = true;
    $('crosshair').hidden = true;
    editing = null;
  }
  async function sync() {
    if (busy) return;
    busy = true;
    try {
      if (locationPending) {
        const sent = locationPending;
        await api(
          '/api/location',
          sent.clear ? {} : sent,
          sent.clear ? 'DELETE' : 'POST',
        );
        if (locationPending === sent) {
          locationPending = null;
          store('locationPending', null);
        }
      }
      while (pending.length) {
        const op = pending[0];
        try {
          await api(op.url, op.body);
        } catch (e) {
          if (![409, 400, 413].includes(e.status)) throw e;
          conflicts.push({ ...op, error: e.message });
          store('conflicts', conflicts);
        }
        pending.shift();
        store('pending', pending);
      }
      data = await api('/api/state');
      store('state', data);
      online = true;
      $('join-panel').hidden = true;
      $('share').disabled = false;
      $('add-marker').disabled = false;
      $('draw').disabled = false;
      if (!initialized) {
        if (data.center) map.setView(data.center, data.zoom || 11);
        initialized = true;
      }
      render();
      status();
    } catch (e) {
      online = false;
      if (e.status === 401) {
        bearerSession=null;sessionStorage.removeItem(sessionKey);
        data = null;
        localStorage.removeItem('state');
        if (watch !== null) navigator.geolocation.clearWatch(watch);
        watch = null;
        sharing = false;
        locationPending = { clear: true };
        store('locationPending', locationPending);
        $('join-panel').hidden = false;
        for (const id of ['share', 'add-marker', 'draw']) $(id).disabled = true;
        closeMarker();
        closeDrawing();
        closeNote();
      }
      render();
      status(
        e.status === 401
          ? 'Join required — open your invite'
          : e.status === 409
            ? 'Conflict — your edit was not saved. Review latest.'
            : e.status
              ? e.message
              : undefined,
      );
    } finally {
      busy = false;
    }
  }
  function queue(url, body) {
    pending.push({ url, body: { ...body, operationId: crypto.randomUUID() } });
    store('pending', pending);
    status();
    sync();
  }
  $('add-marker').onclick = () => editMarker();
  $('cancel-marker').onclick = closeMarker;
  $('save-marker').onclick = () => {
    const text = editing?.text || '';
    const c = map.getCenter();
    queue('/api/markers', {
      text,
      lat: c.lat,
      lon: c.lng,
      ...(editing ? { id: editing.id, version: editing.version } : {}),
    });
    closeMarker();
  };
  let drawingColor = '#b45309';
  const palette = [['#dc2626','red'],['#b45309','orange'],['#ca8a04','yellow'],['#15803d','green'],['#2563eb','blue'],['#4f46e5','indigo'],['#9333ea','violet']];
  function renderNotePalette() {
    $('note-palette').replaceChildren();
    for (const [color,name] of palette) {
      const b=element('button',color===$('note-color').value ? '✓' : '');
      b.type='button';b.style.setProperty('--swatch',color);
      b.setAttribute('aria-label',tr(name));b.setAttribute('aria-pressed',String(color===$('note-color').value));
      b.onclick=()=>{$('note-color').value=color;renderNotePalette();};
      $('note-palette').append(b);
    }
  }
  function renderPalette() {
    $('drawing-palette').replaceChildren();
    for (const [color, name] of palette) {
      const button = element('button', color === drawingColor ? '✓' : '');
      button.type = 'button'; button.style.setProperty('--swatch', color);
      button.setAttribute('aria-label', tr(name));
      button.setAttribute('aria-pressed', String(color === drawingColor));
      button.onclick = () => {
        drawingColor = color;
        for (const swatch of $('drawing-palette').children) {
          const selected = swatch === button;
          swatch.setAttribute('aria-pressed', String(selected));
          swatch.textContent = selected ? '✓' : '';
        }
        paintDraft();
      };
      $('drawing-palette').append(button);
    }
  }
  let drawing = null,
    strokes = [],
    stroke = null;
  const draft = L.layerGroup().addTo(map);
  function paintDraft() {
    draft.clearLayers();
    for (const s of strokes)
      L.polyline(s, {
        color: drawingColor,
        weight: 5,
        interactive: false,
      }).addTo(draft);
  }
  function beginDrawing(d = null) {
    closeNote();
    closeMarker();
    $('group-panel').open = false;
    status();
    map.closePopup();
    drawing = d;
    strokes = [];
    stroke = null;
    drawingColor = d?.color || '#b45309';
    renderPalette();
    $('draw-panel').hidden = false;
    $('draw-canvas').hidden = false;
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    paintDraft();
  }
  function closeDrawing() {
    $('draw-panel').hidden = true;
    $('draw-canvas').hidden = true;
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    drawing = null;
    strokes = [];
    stroke = null;
    draft.clearLayers();
  }
  $('draw').onclick = () => beginDrawing();
  $('cancel-drawing').onclick = closeDrawing;
  $('undo-stroke').onclick = () => {
    strokes.pop();
    paintDraft();
  };

  const canvas = $('draw-canvas');
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (strokes.length >= 20 || strokes.flat().length >= 599) return;
    canvas.setPointerCapture?.(e.pointerId);
    const p = map.mouseEventToLatLng(e);
    stroke = [[p.lat, p.lng]];
    strokes.push(stroke);
    status();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!stroke) return;
    e.preventDefault();
    if (strokes.flat().length >= 600) return;
    const p = map.mouseEventToLatLng(e),
      last = stroke[stroke.length - 1];
    if (
      map
        .latLngToContainerPoint(last)
        .distanceTo(map.latLngToContainerPoint(p)) < 3
    )
      return;
    stroke.push([p.lat, p.lng]);
    paintDraft();
  });
  const finishStroke = () => {
    if (stroke?.length < 2) strokes.pop();
    stroke = null;
    paintDraft();
  };
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);
  $('save-drawing').onclick = () => {
    const valid = strokes.filter((s) => s.length >= 2);
    if (!valid.length) {
      status('Draw a line first');
      return;
    }
    queue('/api/drawings', {
      strokes: valid,
      text: drawing?.text || '',
      color: drawingColor,
      ...(drawing ? { id: drawing.id, version: drawing.version } : {}),
    });
    closeDrawing();
  };
  function stopSharing() {
    sharing = false;
    if (watch !== null) navigator.geolocation.clearWatch(watch);
    watch = null;
    latest = null;
    locationPending = { clear: true };
    store('locationPending', locationPending);
    $('share').textContent = tr('start');
    sync();
  }
  $('share').onclick = () => {
    if (sharing) {
      stopSharing();
      return;
    }
    if (!navigator.geolocation) {
      status('Location is unavailable. You can still use the map.');
      return;
    }
    sharing = true;
    $('share').textContent = tr('stop');
    watch = navigator.geolocation.watchPosition(
      (p) => {
        if (!sharing) return;
        latest = {
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          accuracy: p.coords.accuracy,
          heading: Number.isFinite(p.coords.heading) ? p.coords.heading : null,
          speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null,
          measuredAt: Date.now(),
        };
        locationPending = latest;
        store('locationPending', locationPending);
        render();
      },
      () => {
        stopSharing();
        status('Location permission denied or unavailable. Map still works.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  };
  $('name').value = localStorage.getItem('name') || '';
  $('join-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const joined = await api('/api/join', { invite: invite || '', name: $('name').value });
      if (separateAPI && joined.token && joined.expiresAt > Date.now()) {
        bearerSession={token:joined.token,expiresAt:joined.expiresAt};
        sessionStorage.setItem(sessionKey,JSON.stringify(bearerSession));
      }
      invite=null;
      localStorage.setItem('name', $('name').value);
      history.replaceState(null, '', location.pathname);
      await sync();
    } catch (err) {
      status(err.message);
    }
  };
  $('language').value = language;
  $('language').onchange = () => {
    language = $('language').value;
    localStorage.setItem('language', language);
    translate();
    render();
    status();
  };
  translate();
  if (data) {
    $('join-panel').hidden = true;
    for (const id of ['share', 'add-marker', 'draw']) $(id).disabled = false;
  }
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  render();
  sync();
  setInterval(sync, 5000);
  window.addEventListener('online', sync);
  window.addEventListener('offline', () => {
    online = false;
    render();
    status();
  });
})();
