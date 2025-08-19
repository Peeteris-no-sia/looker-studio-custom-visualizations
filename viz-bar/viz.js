// @ts-nocheck
// Looker Studio Community Visualization: Bar Chart with Category Colors

// EMERGENCY DEBUGGING - Set up global interceptors
console.log('🚨 VIZ.JS LOADING - EMERGENCY DEBUG MODE 🚨');
window.originalDraw = window.draw;
window.draw = function(data) {
  console.log('🚨 GLOBAL DRAW CALLED 🚨', data);
  if (window.originalDraw) window.originalDraw(data);
};

// Monitor all function calls
const originalConsoleLog = console.log;
window.debugCounter = 0;

// Standard Looker Studio Community Visualization Pattern
console.log('[VIZ-BAR] Setting up standard Looker Studio pattern...');

// Make sure our draw function is globally available
window.drawViz = drawViz;
window.draw = draw;

// Set up the standard DSCC subscription pattern
function initVisualization() {
  console.log('[VIZ-BAR] Initializing visualization...');
  
  // This is the standard pattern that Looker Studio expects
  if (typeof window.dscc !== 'undefined' && window.dscc.subscribeToData) {
    console.log('[VIZ-BAR] 🎉 DSCC available - subscribing in standard mode');
    
    // Use the standard transformation pattern
    window.dscc.subscribeToData(drawViz, {
      transform: window.dscc.objectTransform
    });
    
    console.log('[VIZ-BAR] ✅ Standard DSCC subscription complete');
  } else {
    console.log('[VIZ-BAR] DSCC not available - setting up polling...');
    
    let attempts = 0;
    const maxAttempts = 50;
    
    const pollForDSCC = () => {
      attempts++;
      console.log(`[VIZ-BAR] Poll attempt ${attempts}/${maxAttempts} for DSCC...`);
      
      if (typeof window.dscc !== 'undefined' && window.dscc.subscribeToData) {
        console.log('[VIZ-BAR] 🎉 DSCC found via polling - subscribing...');
        
        window.dscc.subscribeToData(drawViz, {
          transform: window.dscc.objectTransform
        });
        
        console.log('[VIZ-BAR] ✅ Polling DSCC subscription complete');
      } else if (attempts < maxAttempts) {
        setTimeout(pollForDSCC, 200);
      } else {
        console.log('[VIZ-BAR] ⏰ DSCC polling timeout - using mock data...');
        setupMockData();
      }
    };
    
    pollForDSCC();
  }
}

function setupMockData() {
  console.log('[VIZ-BAR] Setting up mock data for testing...');
  
  const mockData = {
    fields: { 
      Value: { label: 'Mock Value' },
      Category: { label: 'Mock Category' },
      Color: { label: 'Mock Color' }
    },
    tables: {
      DEFAULT: [
        { Category: 'Product A', Value: 23, Color: '#119d9d' },
        { Category: 'Product B', Value: 45, Color: '#48aeb3' },
        { Category: 'Product C', Value: 12, Color: '#1a686c' },
        { Category: 'Product D', Value: 67, Color: '#8cd7d6' },
        { Category: 'Product E', Value: 34, Color: '#4d6063' }
      ]
    },
    style: {}
  };
  
  console.log('[VIZ-BAR] Calling drawViz with mock data...');
  drawViz(mockData);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisualization);
} else {
  initVisualization();
}

// Listen for any data that Looker Studio might be sending
console.log('[VIZ-BAR] Setting up global data listeners...');

// Listen for postMessage events from parent window
window.addEventListener('message', function(event) {
  console.log('[VIZ-BAR] Received message event:', event);
  if (event.data && typeof event.data === 'object') {
    console.log('[VIZ-BAR] Message data:', event.data);
    // Check if this looks like Looker Studio data
    if (event.data.tables || event.data.fields || event.data.data) {
      console.log('[VIZ-BAR] 🎉 Received what looks like Looker Studio data via message!');
      window._receivedData = true;
      draw(event.data);
    }
  }
});

// Check for global data injection
window._checkForGlobalData = function() {
  console.log('[VIZ-BAR] Checking for global data injection...');
  
  // Common variable names Looker Studio might use
  const dataVars = ['data', 'vizData', 'visualizationData', 'chartData', 'reportData'];
  
  for (const varName of dataVars) {
    if (window[varName] && typeof window[varName] === 'object') {
      console.log(`[VIZ-BAR] Found potential data in window.${varName}:`, window[varName]);
      if (window[varName].tables || window[varName].fields) {
        console.log('[VIZ-BAR] 🎉 Found Looker Studio data in global variable!');
        window._receivedData = true;
        draw(window[varName]);
        return true;
      }
    }
  }
  
  return false;
};

// Check immediately and periodically
setTimeout(window._checkForGlobalData, 500);
setTimeout(window._checkForGlobalData, 1000);
setTimeout(window._checkForGlobalData, 2000);

// Get DSCC reference (might be null initially, but will be available after loading)
const dscc = window.dscc;

// Report Builder palette (cycled)
const PALETTE = ['#119d9d', '#48aeb3', '#1a686c', '#8cd7d6', '#4d6063'];
const PRIORITIZE_DATA_COLOR = false; // set true to prefer data Color field when valid
const SHOW_LEGEND = true; // optional legend toggle
const DEBUG_LEGEND = false; // temporary: highlight legend background and log bbox

// =============================================================================
// COMPREHENSIVE DEBUGGING SYSTEM
// =============================================================================
const DEBUG_MODE = true; // Set to false for production
const LOG_PREFIX = '[VIZ-BAR-DEBUG]';

function debugLog(message, data = null) {
  if (!DEBUG_MODE) return;
  const timestamp = new Date().toISOString();
  if (data !== null && data !== undefined) {
    try {
      // Try to safely log the data
      if (typeof data === 'object' && data !== null) {
        // For objects, try to stringify safely
        try {
          const jsonStr = JSON.stringify(data, null, 2);
          console.log(`${LOG_PREFIX} [${timestamp}] ${message}:`, jsonStr);
        } catch (jsonError) {
          // If JSON.stringify fails, try alternative
          console.log(`${LOG_PREFIX} [${timestamp}] ${message}: [Object - cannot stringify: ${jsonError.message}]`);
          console.log(`${LOG_PREFIX} [${timestamp}] ${message} (direct):`, data);
        }
      } else {
        console.log(`${LOG_PREFIX} [${timestamp}] ${message}:`, data);
      }
    } catch (error) {
      console.log(`${LOG_PREFIX} [${timestamp}] ${message}: [Error logging data: ${error.message}]`);
    }
  } else {
    console.log(`${LOG_PREFIX} [${timestamp}] ${message}`);
  }
}

function debugError(message, error = null) {
  const timestamp = new Date().toISOString();
  if (error) {
    console.error(`${LOG_PREFIX} [${timestamp}] ERROR: ${message}:`, error);
  } else {
    console.error(`${LOG_PREFIX} [${timestamp}] ERROR: ${message}`);
  }
}

function debugEnvironment() {
  debugLog('=== ENVIRONMENT DEBUG INFO ===');
  debugLog('User Agent', navigator.userAgent);
  debugLog('Location', window.location.href);
  debugLog('Window size', {width: window.innerWidth, height: window.innerHeight});
  
  // Check all possible DSCC variations
  debugLog('window.dscc', !!window.dscc);
  debugLog('window.DSCC', !!window.DSCC);
  debugLog('window.google', !!window.google);
  debugLog('window.googleVisualizationApi', !!window.googleVisualizationApi);
  
  // Check for common Looker Studio globals that should exist
  debugLog('window.parent', !!window.parent);
  debugLog('window.top', !!window.top);
  debugLog('document.domain', document.domain);
  
  // Check if parent window has DSCC
  try {
    if (window.parent && window.parent !== window) {
      debugLog('Parent window exists - checking for DSCC');
      debugLog('Parent has dscc', !!window.parent.dscc);
    }
  } catch (parentError) {
    debugLog('Cannot access parent window (expected in iframe)');
  }
  
  // Check if we're in Looker Studio environment
  const isLookerStudio = window.location.href.includes('lookerstudio.google');
  const isGoogleusercontent = window.location.href.includes('googleusercontent.com');
  debugLog('Is Looker Studio environment', isLookerStudio);
  debugLog('Is Google User Content', isGoogleusercontent);
  
  // Check what global objects exist
  const globals = [];
  for (let prop in window) {
    if (prop.toLowerCase().includes('dscc') || prop.toLowerCase().includes('google') || prop.toLowerCase().includes('viz')) {
      globals.push(prop);
    }
  }
  debugLog('Relevant global objects', globals.join(', ') || 'none found');
  
  // Check if DSCC script was loaded
  const scripts = Array.from(document.scripts).map(s => s.src).filter(src => src);
  const dsccScripts = scripts.filter(src => src.toLowerCase().includes('dscc'));
  debugLog('DSCC-related scripts', dsccScripts.length > 0 ? dsccScripts : 'none found');
  
  debugLog('Document ready state', document.readyState);
  debugLog('=== END ENVIRONMENT DEBUG ===');
}

function debugDataStructure(data) {
  debugLog('=== DATA STRUCTURE DEBUG ===');
  debugLog('Raw data received', data);
  debugLog('Data type', typeof data);
  debugLog('Data keys', data ? Object.keys(data) : 'null/undefined');
  
  if (data && data.tables) {
    debugLog('Tables available', Object.keys(data.tables));
    if (data.tables.DEFAULT) {
      debugLog('DEFAULT table length', data.tables.DEFAULT.length);
      debugLog('First row sample', data.tables.DEFAULT[0]);
      debugLog('All row keys from first row', data.tables.DEFAULT[0] ? Object.keys(data.tables.DEFAULT[0]) : 'no first row');
    }
  }
  
  if (data && data.fields) {
    debugLog('Fields available', Object.keys(data.fields));
    debugLog('Field details', data.fields);
  }
  
  debugLog('=== END DATA DEBUG ===');
}

function debugRenderingContext(width, height, scale, margin, chartW, chartH) {
  debugLog('=== RENDERING CONTEXT DEBUG ===');
  debugLog('Container dimensions', {width, height});
  debugLog('Scale factor', scale);
  debugLog('Margins', margin);
  debugLog('Chart dimensions', {chartW, chartH});
  debugLog('Element info', {
    targetElement: document.getElementById('bar-chart'),
    targetElementExists: !!document.getElementById('bar-chart'),
    targetElementDimensions: document.getElementById('bar-chart') ? {
      clientWidth: document.getElementById('bar-chart').clientWidth,
      clientHeight: document.getElementById('bar-chart').clientHeight,
      offsetWidth: document.getElementById('bar-chart').offsetWidth,
      offsetHeight: document.getElementById('bar-chart').offsetHeight
    } : 'element not found'
  });
  debugLog('=== END RENDERING DEBUG ===');
}

// Initialize debugging when script loads
debugLog('Viz.js script loaded successfully');
debugEnvironment();

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
  debugLog('=== DRAW VIZ FUNCTION CALLED ===');
  debugDataStructure(data);
  
  const el = document.getElementById('bar-chart') || document.body;
  debugLog('Target element found', {
    hasElement: !!el,
    elementId: el.id || 'no-id',
    elementTag: el.tagName
  });
  
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

  debugRenderingContext(width, height, scale, margin, chartW, chartH);

  // Font sizes (bigger)
  const fsTick = Math.round(22 * scale);
  const fsAxisTitle = Math.round(40 * scale);
  const fsValue = Math.round(34 * scale);
  const fsCategory = Math.round(20 * scale);
  const lineDyCategory = Math.round(22 * scale);

  let legendWrapRef = null;

  // Prepare data (stable: assume Category/Value keys from config)
  const inputRows = (data && data.tables && data.tables.DEFAULT) ? data.tables.DEFAULT : [];
  debugLog('Input rows count', inputRows.length);
  debugLog('Sample input row', inputRows[0]);
  
  const rows = inputRows.map((row, i) => {
    const fallback = fallbackColor(i);
    const useDataColor = PRIORITIZE_DATA_COLOR ? parseColor(row['Color'] || row['color'], null) : null;
    const category = row['Category'] ?? row['category'];
    const valueRaw = row['Value'] ?? row['value'];
    
    debugLog(`Processing row ${i}`, {
      originalRow: row,
      category,
      valueRaw,
      useDataColor,
      fallback
    });
    
    return {
      category: String(category ?? ''),
      value: Number(valueRaw) || 0,
      color: useDataColor || fallback
    };
  });
  
  debugLog('Processed rows', rows);

  if (!rows.length) {
    debugLog('=== EMPTY DATA SCENARIO ===');
    debugLog('No data rows found. Common causes:');
    debugLog('1. No data source connected in Looker Studio');
    debugLog('2. Fields not mapped correctly');
    debugLog('3. Data source has no data');
    debugLog('4. Filters excluding all data');
    debugLog('=== RENDERING EMPTY STATE ===');
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
    debugError('Visualization rendering failed', err);
    debugError('Error stack trace', err.stack);
    
    // Render a detailed error so the frame is not empty
    const w = el.clientWidth || 900; const h = el.clientHeight || 350;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    const base = document.createElementNS(svg.namespaceURI, 'rect');
    base.setAttribute('x','0'); base.setAttribute('y','0'); base.setAttribute('width', String(w)); base.setAttribute('height', String(h));
    base.setAttribute('fill', '#ffffff'); svg.appendChild(base);
    
    // Main error message
    const t = document.createElementNS(svg.namespaceURI, 'text');
    t.setAttribute('x', String(Math.round(w/2))); t.setAttribute('y', String(Math.round(h/2 - 20)));
    t.setAttribute('text-anchor','middle'); setFont(t, 16, 700, '#d33');
    t.textContent = 'Visualization error. Check console for details.';
    svg.appendChild(t);
    
    // Error details
    const t2 = document.createElementNS(svg.namespaceURI, 'text');
    t2.setAttribute('x', String(Math.round(w/2))); t2.setAttribute('y', String(Math.round(h/2 + 10)));
    t2.setAttribute('text-anchor','middle'); setFont(t2, 12, 400, '#666');
    t2.textContent = `Error: ${err.message}`;
    svg.appendChild(t2);
    
    el.appendChild(svg);
  }
}

function draw(data) {
  // EMERGENCY DEBUGGING - log everything about this call
  console.log('🚨 EMERGENCY DEBUG - DRAW FUNCTION CALLED 🚨');
  console.log('Raw data parameter:', data);
  console.log('Data type:', typeof data);
  console.log('Data keys:', data ? Object.keys(data) : 'data is null/undefined');
  
  if (data) {
    console.log('Data.tables:', data.tables);
    console.log('Data.fields:', data.fields);
    if (data.tables && data.tables.DEFAULT) {
      console.log('DEFAULT table:', data.tables.DEFAULT);
      console.log('DEFAULT table length:', data.tables.DEFAULT.length);
      if (data.tables.DEFAULT.length > 0) {
        console.log('First row:', data.tables.DEFAULT[0]);
        console.log('First row keys:', Object.keys(data.tables.DEFAULT[0]));
      }
    }
  }
  
  debugLog('=== DRAW FUNCTION CALLED ===');
  debugLog('Data passed to draw function', data);
  drawViz(data);
}

// Check for DSCC more thoroughly with polling
function checkDSCC() {
  debugLog('=== DSCC AVAILABILITY CHECK ===');
  
  // Basic existence checks
  const dsccExists = !!(window.dscc);
  const dsccIsObject = typeof window.dscc === 'object';
  const dsccIsFunction = typeof window.dscc === 'function';
  
  debugLog('window.dscc exists:', dsccExists);
  debugLog('window.dscc is object:', dsccIsObject);
  debugLog('window.dscc is function:', dsccIsFunction);
  
  if (!dsccExists) {
    debugLog('❌ DSCC not available - window.dscc is null/undefined');
    return false;
  }
  
  // Check for methods directly
  let hasSubscribeToData = false;
  let hasObjectTransform = false;
  
  try {
    hasSubscribeToData = typeof window.dscc.subscribeToData === 'function';
    hasObjectTransform = typeof window.dscc.objectTransform === 'function';
    
    debugLog('subscribeToData is function:', hasSubscribeToData);
    debugLog('objectTransform is function:', hasObjectTransform);
    
    // If we have subscribeToData, let's try to inspect what we can
    if (hasSubscribeToData) {
      debugLog('✅ DSCC appears to be ready - has subscribeToData method');
      
      // Try to get some safe property names
      try {
        const props = [];
        for (let prop in window.dscc) {
          if (typeof window.dscc[prop] === 'function') {
            props.push(prop + '()');
          } else {
            props.push(prop);
          }
        }
        debugLog('DSCC properties/methods:', props.join(', ') || 'none enumerable');
      } catch (propError) {
        debugLog('Could not enumerate DSCC properties');
      }
      
      return true;
    } else {
      debugLog('❌ DSCC exists but subscribeToData method not found');
      
      // Let's see if we can find anything useful
      try {
        const hasAnyMethods = Object.getOwnPropertyNames(window.dscc).some(prop => 
          typeof window.dscc[prop] === 'function'
        );
        debugLog('DSCC has any methods:', hasAnyMethods);
        
        if (hasAnyMethods) {
          const methods = Object.getOwnPropertyNames(window.dscc)
            .filter(prop => typeof window.dscc[prop] === 'function');
          debugLog('Available methods:', methods.join(', '));
        }
      } catch (methodError) {
        debugLog('Could not check for methods:', methodError.message);
      }
      
      return false;
    }
    
  } catch (error) {
    debugLog('Error checking DSCC methods:', error.message);
    return false;
  }
}

function initializeDSCC() {
  if (checkDSCC()) {
    debugLog('DSCC detected - subscribing to data');
    try {
      window.dscc.subscribeToData(draw, {transform: window.dscc.objectTransform});
      debugLog('Successfully subscribed to DSCC data');
      
      // Add a timeout to check if we receive data
      setTimeout(() => {
        debugLog('=== DATA RECEPTION CHECK ===');
        debugLog('5 seconds elapsed - if no draw calls happened, check data mapping in Looker Studio');
        debugLog('Make sure you have:');
        debugLog('1. Mapped a dimension to Category field');
        debugLog('2. Mapped a metric to Value field');
        debugLog('3. Added the visualization to a report with data');
        debugLog('=== END DATA RECEPTION CHECK ===');
      }, 5000);
      
      return true;
    } catch (err) {
      debugError('Failed to subscribe to DSCC data', err);
      return false;
    }
  }
  return false;
}

// Wait for DSCC to be injected by Looker Studio
function waitForDSCCInjection() {
  debugLog('Waiting for DSCC to be injected by Looker Studio...');
  
  // Try to manually load DSCC if it's not available
  debugLog('Attempting to load DSCC manually...');
  
  // For Looker Studio community visualizations, DSCC is usually at this path
  const dsccScript = document.createElement('script');
  dsccScript.src = 'https://developers.google.com/looker-studio/visualization/library';
  dsccScript.onload = () => {
    debugLog('DSCC script load event fired');
    setTimeout(() => {
      if (initializeDSCC()) {
        debugLog('DSCC successfully loaded manually');
      } else {
        debugLog('DSCC script loaded but dscc object still not available');
      }
    }, 100);
  };
  dsccScript.onerror = (error) => {
    debugLog('Failed to load DSCC script:', error);
  };
  
  // Try loading from common DSCC locations
  const tryLoadDSCC = () => {
    debugLog('Trying alternative DSCC loading methods...');
    
    // Method 1: Check if there's a dscc object in a global namespace
    if (window.google && window.google.visualization) {
      debugLog('Google Visualization API found - checking for DSCC');
      if (window.google.visualization.dscc) {
        window.dscc = window.google.visualization.dscc;
        debugLog('Found DSCC in google.visualization namespace');
        initializeDSCC();
        return;
      }
    }
    
    // Method 2: Try to find DSCC in parent frames
    try {
      if (window.parent && window.parent.dscc) {
        window.dscc = window.parent.dscc;
        debugLog('Found DSCC in parent window');
        initializeDSCC();
        return;
      }
    } catch (e) {
      debugLog('Cannot access parent for DSCC');
    }
    
    debugLog('All DSCC loading methods failed');
  };
  
  // Try alternative loading after a delay
  setTimeout(tryLoadDSCC, 1000);
  
  // Check if DSCC script is being loaded
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'SCRIPT' && node.src && node.src.toLowerCase().includes('dscc')) {
          debugLog('DSCC script detected:', node.src);
          // Wait a bit for it to load
          setTimeout(() => {
            if (initializeDSCC()) {
              observer.disconnect();
            }
          }, 100);
        }
      });
    });
  });
  
  observer.observe(document.head, { childList: true, subtree: true });
  
  // Also listen for window load in case DSCC loads later
  window.addEventListener('load', () => {
    debugLog('Window load event fired - checking for DSCC');
    setTimeout(() => {
      if (!initializeDSCC()) {
        debugLog('DSCC still not available after window load');
        tryLoadDSCC();
        startPolling();
      }
    }, 500);
  });
  
  // Start polling immediately as well
  startPolling();
}

// Simplified initialization - we load DSCC ourselves and use it directly
debugLog('=== SIMPLIFIED DSCC APPROACH ===');
debugLog('DSCC loading handled in main script - no complex detection needed');

function startPolling() {
  debugLog('Starting DSCC polling...');
  
  let attempts = 0;
  const maxAttempts = 30; // 3 seconds total
  
  const pollDSCC = setInterval(() => {
    attempts++;
    debugLog(`DSCC poll attempt ${attempts}/${maxAttempts}`);
    
    if (initializeDSCC()) {
      clearInterval(pollDSCC);
      debugLog('DSCC initialized successfully after polling');
    } else if (attempts >= maxAttempts) {
      clearInterval(pollDSCC);
      debugLog('DSCC polling failed - trying last resort methods');
      debugLog('Final window.dscc state:', window.dscc);
      debugLog('Available methods:', window.dscc ? Object.keys(window.dscc) : 'none');
      
      // Last resort: try to manually set up DSCC if it exists but methods are missing
      if (window.dscc && !window.dscc.subscribeToData) {
        debugLog('DSCC object exists but missing methods - this might be a timing issue');
        debugLog('Trying one more time in 1 second...');
        setTimeout(() => {
          if (initializeDSCC()) {
            debugLog('Late DSCC initialization successful!');
          } else {
            debugLog('All DSCC initialization attempts failed');
            setupDevHarness();
          }
        }, 1000);
} else {
        setupDevHarness();
      }
    }
  }, 100); // Poll every 100ms
}

function setupDevHarness() {
  debugLog('Setting up dev harness fallback');
  // Dev harness
  window.drawViz = drawViz;
  document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOMContentLoaded - setting up dev environment');
    document.body.innerHTML = '<div id="bar-chart" style="width:900px;height:350px"></div>';
    // Example data for local dev
    const testData = {
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
    };
    debugLog('Test data prepared', testData);
    drawViz(testData);
  });
}