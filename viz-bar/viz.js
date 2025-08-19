// @ts-nocheck
// Looker Studio Community Visualization: Bar Chart with Category Colors

const dscc = window.dscc;

// Report Builder palette (cycled)
const PALETTE = ['#119d9d', '#48aeb3', '#1a686c', '#8cd7d6', '#4d6063'];
const PRIORITIZE_DATA_COLOR = false; // set true to prefer data Color field when valid
const SHOW_LEGEND = true; // optional legend toggle
const DEBUG_LEGEND = false; // temporary: highlight legend background and log bbox

function parseColor(str, fallback) {
  if (!str) return fallback;
  // Accept #RRGGBB, #RGB, rgb(r,g,b)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) return str;
  if (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i.test(str)) return str;
  return fallback;
}

function fallbackColor(idx) {
  // Cycle through fixed palette
  return PALETTE[idx % PALETTE.length];
}

function setFont(el, size, weight, color) {
  if (size != null) el.setAttribute('font-size', String(size));
  if (weight) el.setAttribute('font-weight', String(weight));
  if (color) el.setAttribute('fill', color);
  el.setAttribute('font-family', 'Ubuntu,Roboto,system-ui,Arial,sans-serif');
}

function ensureShadowDef(svg, scale){
  const DEF_ID = 'legendShadow';
  let defs = svg.querySelector('defs');
  if(!defs){ defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.insertBefore(defs, svg.firstChild||null); }
  let filt = svg.querySelector('#'+DEF_ID);
  if(!filt){
    filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', DEF_ID);
    filt.setAttribute('x','-20%'); filt.setAttribute('y','-20%'); filt.setAttribute('width','140%'); filt.setAttribute('height','140%');
    const fe = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fe.setAttribute('dx', String(Math.max(0.5, Math.round(1*scale))));
    fe.setAttribute('dy', String(Math.max(0.5, Math.round(1*scale))));
    fe.setAttribute('stdDeviation', String(Math.max(0.5, Math.round(2*scale))));
    fe.setAttribute('flood-color','#000000');
    fe.setAttribute('flood-opacity','0.12');
    filt.appendChild(fe);
    defs.appendChild(filt);
  }
  return 'url(#'+DEF_ID+')';
}

function wrapLabel(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/);
  let line = '';
  const lines = [];
  words.forEach((wd) => {
    const trial = (line ? line + ' ' : '') + wd;
    if (trial.length <= maxChars) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = wd;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

// (no dynamic field resolver in the stable version)

function pathTopRoundedRect(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, h / 2, w / 2));
  const x0 = x, y0 = y; // top-left
  const x1 = x + w, y1 = y + h; // bottom-right
  // Bottom straight, top rounded using quadratic curves
  return [
    'M', x0, y1,
    'L', x1, y1,
    'L', x1, y0 + rr,
    'Q', x1, y0, x1 - rr, y0,
    'L', x0 + rr, y0,
    'Q', x0, y0, x0, y0 + rr,
    'Z'
  ].join(' ');
}

function drawViz(data) {
  const el = document.getElementById('bar-chart') || document.body;
  el.innerHTML = '';
  try {

  let width = (dscc && typeof dscc.getWidth === 'function') ? dscc.getWidth() : (el.clientWidth || 900);
  let height = (dscc && typeof dscc.getHeight === 'function') ? dscc.getHeight() : (el.clientHeight || 350);
  if (!width || width <= 0) width = el.clientWidth || 900;
  if (!height || height <= 0) height = el.clientHeight || 350;
  // Scale factor relative to a 900x350 baseline, clamped
  const scale = Math.max(0.75, Math.min(3, Math.min(width / 900, height / 350)));

  // Dynamic margins and typography
  const margin = {
    top: Math.round(24 * scale),
    right: Math.round(28 * scale),
    bottom: Math.round(180 * scale),
    left: Math.round(100 * scale)
  };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;

  // Font sizes (bigger)
  const fsTick = Math.round(22 * scale);
  const fsAxisTitle = Math.round(40 * scale);
  const fsValue = Math.round(34 * scale);
  const fsCategory = Math.round(20 * scale);
  const lineDyCategory = Math.round(22 * scale);

  let legendWrapRef = null;

  // Prepare data (stable: assume Category/Value keys from config)
  const inputRows = (data && data.tables && data.tables.DEFAULT) ? data.tables.DEFAULT : [];
  const rows = inputRows.map((row, i) => {
    const fallback = fallbackColor(i);
    const useDataColor = PRIORITIZE_DATA_COLOR ? parseColor(row['Color'] || row['color'], null) : null;
    const category = row['Category'] ?? row['category'];
    const valueRaw = row['Value'] ?? row['value'];
    return {
      category: String(category ?? ''),
      value: Number(valueRaw) || 0,
      color: useDataColor || fallback
    };
  });

  if (!rows.length) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    const base = document.createElementNS(svg.namespaceURI, 'rect');
    base.setAttribute('x', '0'); base.setAttribute('y', '0');
    base.setAttribute('width', String(width)); base.setAttribute('height', String(height));
    base.setAttribute('fill', '#ffffff');
    svg.appendChild(base);
    const msg = document.createElementNS(svg.namespaceURI, 'text');
    msg.setAttribute('x', String(Math.round(width/2)));
    msg.setAttribute('y', String(Math.round(height/2)));
    msg.setAttribute('text-anchor', 'middle');
    setFont(msg, Math.round(20 * Math.max(0.75, Math.min(3, Math.min(width/900, height/350)))), 700, '#777');
    msg.textContent = 'No data';
    svg.appendChild(msg);
    el.appendChild(svg);
    return;
  }

  // Sort descending (optional, remove if you want native order)
  rows.sort((a, b) => b.value - a.value);

  // Scales and ticks similar to Python version
  const rawMax = Math.max(...rows.map(r => r.value), 1);
  const niceMax = Math.ceil(rawMax * 1.15);
  const approxTicks = 8;
  const step = Math.max(1, Math.ceil(niceMax / approxTicks));
  const ticks = [];
  for (let t = 0; t <= niceMax; t += step) ticks.push(t);

  // SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  // solid background to avoid transparency in Looker Studio
  const base = document.createElementNS(svg.namespaceURI, 'rect');
  base.setAttribute('x', '0');
  base.setAttribute('y', '0');
  base.setAttribute('width', String(width));
  base.setAttribute('height', String(height));
  base.setAttribute('fill', '#ffffff');
  svg.appendChild(base);

  // Grid lines & Y axis tick labels
  const dashUnit = Math.max(2, Math.round(6 * scale));
  const strokeW = Math.max(1, Math.round(2 * scale));
  ticks.forEach((t) => {
    const yPos = margin.top + chartH - (t / niceMax) * chartH;
    // Grid
    const grid = document.createElementNS(svg.namespaceURI, 'line');
    grid.setAttribute('x1', margin.left);
    grid.setAttribute('x2', width - margin.right);
    grid.setAttribute('y1', yPos);
    grid.setAttribute('y2', yPos);
    grid.setAttribute('stroke', '#C0C0C0');
    grid.setAttribute('stroke-dasharray', `${dashUnit} ${dashUnit}`);
    grid.setAttribute('stroke-width', String(strokeW));
    svg.appendChild(grid);
    // Tick label
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('x', margin.left - Math.round(12 * scale));
    label.setAttribute('y', yPos + Math.round(5 * scale));
    label.setAttribute('text-anchor', 'end');
    setFont(label, fsTick, null, '#404040');
    label.textContent = String(t);
    svg.appendChild(label);
  });

  // Bars & labels
  const stepX = chartW / Math.max(1, rows.length);
  const barW = Math.max(8, Math.floor(stepX * 0.72));
  const labelInsideThreshold = 0.15; // match Python logic

  // Optional legend (categories with their colors)
  if (SHOW_LEGEND) {
    const fsLegend = Math.round(16 * scale);
    const sw = Math.round(14 * scale);
    const padX = Math.round(10 * scale);
    const padY = Math.round(8 * scale);
    const gap = Math.round(18 * scale);
    const wrapW = chartW;
    const legendOffsetX = Math.round(16 * scale);
    const legendWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let xCur = margin.left + legendOffsetX;
    let yCur = Math.max(0, margin.top - Math.round(10 * scale));
    // Build unique entries in order, cap to 12 to avoid overflow
    const seen = new Set();
    const entries = [];
    rows.forEach(r => { if (!seen.has(r.category)) { seen.add(r.category); entries.push({name: r.category, color: r.color}); } });
    const maxEntries = 12;
    entries.slice(0, maxEntries).forEach(entry => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      // swatch
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', xCur);
      rect.setAttribute('y', yCur);
      rect.setAttribute('width', sw);
      rect.setAttribute('height', sw);
      rect.setAttribute('rx', Math.round(3 * scale));
      rect.setAttribute('fill', entry.color);
      g.appendChild(rect);
      // text
      const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', xCur + sw + padX);
      tx.setAttribute('y', yCur + Math.round(sw * 0.78));
      tx.setAttribute('text-anchor', 'start');
      setFont(tx, fsLegend, 700, '#333');
      tx.textContent = entry.name;
      g.appendChild(tx);
      legend.appendChild(g);
      const approxTextW = Math.max(sw, Math.round(tx.textContent.length * fsLegend * 0.6));
      xCur += sw + padX + approxTextW + gap;
      if (xCur > margin.left + legendOffsetX + wrapW) { xCur = margin.left + legendOffsetX; yCur += sw + padY; }
    });
    legendWrap.appendChild(legend);
    svg.appendChild(legendWrap);
    // Background behind legend (inside wrapper so it sits directly behind)
    const lb = legend.getBBox();
    if (DEBUG_LEGEND) console.log('[viz-bar] legend bbox initial', {x: lb.x, y: lb.y, width: lb.width, height: lb.height});
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const padBGx = Math.round(10 * scale);
    const padBGy = Math.round(6 * scale);
    bg.setAttribute('x', lb.x - padBGx);
    bg.setAttribute('y', lb.y - padBGy);
    bg.setAttribute('width', lb.width + padBGx * 2);
    bg.setAttribute('height', lb.height + padBGy * 2);
    bg.setAttribute('rx', Math.round(10 * scale));
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('stroke', '#d0d0d0');
    bg.setAttribute('stroke-width', String(Math.max(1, Math.round(2 * scale))));
    bg.setAttribute('filter', ensureShadowDef(svg, scale));
    bg.setAttribute('pointer-events', 'none');
    legendWrap.insertBefore(bg, legendWrap.firstChild);

    // Re-measure after layout to handle async font metrics
    const remeasure = (attempt = 1) => {
      requestAnimationFrame(() => {
        const lb2 = legend.getBBox();
        if (DEBUG_LEGEND) console.log(`[viz-bar] legend bbox attempt ${attempt}`, {x: lb2.x, y: lb2.y, width: lb2.width, height: lb2.height});
        bg.setAttribute('x', lb2.x - padBGx);
        bg.setAttribute('y', lb2.y - padBGy);
        bg.setAttribute('width', lb2.width + padBGx * 2);
        bg.setAttribute('height', lb2.height + padBGy * 2);
        // Try up to 3 times if bbox unstable/zero
        if (attempt < 3 && (lb2.width === 0 || lb2.height === 0)) remeasure(attempt + 1);
      });
    };
    remeasure();
    legendWrapRef = legendWrap;
  }

  rows.forEach((row, i) => {
    const x = margin.left + i * stepX + Math.floor((stepX - barW) / 2);
    const barH = niceMax ? (row.value / niceMax) * chartH : 0;
    const y = margin.top + chartH - barH;

    // Bar with rounded top only; radius scales with bar width
    const r = Math.max(2, Math.floor(barW / 8));
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', pathTopRoundedRect(x, y, barW, barH, r));
    path.setAttribute('fill', row.color);
    svg.appendChild(path);

    // Value label: inside if tall enough, else outside
    const ratio = rawMax ? row.value / rawMax : 0;
    const isInside = ratio >= labelInsideThreshold;
    const valLabel = document.createElementNS(svg.namespaceURI, 'text');
    valLabel.setAttribute('x', x + barW / 2);
    valLabel.setAttribute('text-anchor', 'middle');
    setFont(valLabel, fsValue, 700, isInside ? '#fff' : '#404040');
    const insidePad = Math.round(fsValue * 0.9 + 10 * scale); // more distance from the top
    const outsidePad = Math.round(10 * scale);
    valLabel.setAttribute('y', isInside ? Math.max(margin.top + insidePad, y + insidePad) : Math.max(0, y - outsidePad));
    valLabel.textContent = String(Math.round(row.value));
    svg.appendChild(valLabel);

    // Category label: wrapped, centered, multiple lines
    const cx = x + barW / 2;
    const baseY = margin.top + chartH + Math.round(28 * scale);
    const lab = document.createElementNS(svg.namespaceURI, 'text');
    lab.setAttribute('x', cx);
    lab.setAttribute('y', baseY);
    lab.setAttribute('text-anchor', 'middle');
    setFont(lab, fsCategory, null, '#333');
    // Estimate characters per line from font size (~0.6 * font size per char)
    const approxCharPx = Math.max(6, 0.6 * fsCategory);
    const maxChars = Math.max(5, Math.floor(barW / approxCharPx));
    const lines = wrapLabel(row.category, maxChars, 3);
    lines.forEach((ln, idx) => {
      const tsp = document.createElementNS(svg.namespaceURI, 'tspan');
      tsp.setAttribute('x', cx);
      tsp.setAttribute('dy', idx === 0 ? '0' : String(lineDyCategory));
      tsp.textContent = ln;
      lab.appendChild(tsp);
    });
    svg.appendChild(lab);
  });

  // Y axis label (vertical)
  const yAxisLabel = document.createElementNS(svg.namespaceURI, 'text');
  yAxisLabel.setAttribute('x', Math.round(34 * scale));
  yAxisLabel.setAttribute('y', margin.top + chartH / 2);
  yAxisLabel.setAttribute('text-anchor', 'middle');
  setFont(yAxisLabel, fsAxisTitle, 700, '#333');
  yAxisLabel.setAttribute('transform', `rotate(-90,${Math.round(34 * scale)},${margin.top + chartH / 2})`);
  yAxisLabel.textContent = (data.fields && data.fields.Value && data.fields.Value.label) || 'Vērtība';
  svg.appendChild(yAxisLabel);

  // Ensure legend sits on top
  if (legendWrapRef) svg.appendChild(legendWrapRef);
  el.appendChild(svg);
  } catch (err) {
    // Render a basic error so the frame is not empty
    const w = el.clientWidth || 900; const h = el.clientHeight || 350;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    const base = document.createElementNS(svg.namespaceURI, 'rect');
    base.setAttribute('x','0'); base.setAttribute('y','0'); base.setAttribute('width', String(w)); base.setAttribute('height', String(h));
    base.setAttribute('fill', '#ffffff'); svg.appendChild(base);
    const t = document.createElementNS(svg.namespaceURI, 'text');
    t.setAttribute('x', String(Math.round(w/2))); t.setAttribute('y', String(Math.round(h/2)));
    t.setAttribute('text-anchor','middle'); setFont(t, 16, 700, '#d33');
    t.textContent = 'Visualization error. Check fields/data.';
    svg.appendChild(t);
    el.appendChild(svg);
  }
}

function draw(data) {
  drawViz(data);
}

if (dscc) {
  dscc.subscribeToData(draw, {transform: dscc.objectTransform});
} else {
  // Dev harness
  window.drawViz = drawViz;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = '<div id="bar-chart" style="width:900px;height:350px"></div>';
    // Example data for local dev
    drawViz({
      fields: {Value: {label: 'Vakanču skaits'}},
      tables: {DEFAULT: [
        {Category: 'Sabiedrība ar ierobežotu atbildību "LPP Latvia ltd"', Value: 77},
        {Category: 'SIA "APRANGA LV"', Value: 44},
        {Category: 'SPORTLAND, Sabiedrība ar ierobežotu atbildību', Value: 28},
        {Category: 'Sabiedrība ar ierobežotu atbildību "New Yorker Latvija"', Value: 28},
        {Category: 'SIA "Stockmann"', Value: 21},
        {Category: 'SIA "Lindex Latvia"', Value: 16},
        {Category: 'POLDMA KAUBANDUSE AKTSIASELTS filiāle Latvijā', Value: 10},
        {Category: 'SIA WEEKEND LATVIA', Value: 10},
        {Category: 'SIA "CCC Shoes Latvia"', Value: 9},
        {Category: 'SIA "Eiropas Apavi"', Value: 6},
        {Category: 'SIA Danbalt Footwear', Value: 5}
      ]}
    });
  });
}