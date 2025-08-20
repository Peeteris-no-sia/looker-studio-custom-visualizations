// 📈 Line Chart with Series and Color Field - WORKING SOLUTION
// Using the REAL Looker Studio API patterns discovered in 2024

console.log('🚀 Line Chart Loading...');

// Color validation helper functions (same as bar chart)
function isValidHexColor(color) {
  // Check for hex color format: #RRGGBB or #RGB
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

function isValidCssColor(color) {
  // Check if it's a valid CSS named color
  const cssColors = [
    'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
    'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'silver', 'aqua', 'fuchsia',
    'darkred', 'darkgreen', 'darkblue', 'darkorange', 'darkviolet', 'lightblue', 'lightgreen', 'lightgray',
    'steelblue', 'royalblue', 'mediumblue', 'lightcoral', 'palegreen', 'gold', 'crimson', 'indigo'
  ];
  return cssColors.includes(color.toLowerCase());
}

function validateAndCleanColor(color) {
  if (!color) return null;
  
  const cleanColor = String(color).trim();
  
  // Try as hex color
  if (isValidHexColor(cleanColor)) {
    return cleanColor;
  }
  
  // Try as CSS named color
  if (isValidCssColor(cleanColor)) {
    return cleanColor.toLowerCase();
  }
  
  // Try as RGB/RGBA
  if (cleanColor.startsWith('rgb')) {
    return cleanColor;
  }
  
  // Try to parse as hex without #
  if (/^[A-Fa-f0-9]{6}$/.test(cleanColor)) {
    return '#' + cleanColor;
  }
  
  if (/^[A-Fa-f0-9]{3}$/.test(cleanColor)) {
    return '#' + cleanColor;
  }
  
  return null;
}

function drawViz(data) {
  console.log('🎯 drawViz called with data:', data);
  
  // Get or create container (same as bar chart)
  let container = document.getElementById('container');
  if (!container) {
    console.log('📦 Creating container element...');
    container = document.createElement('div');
    container.id = 'container';
    container.style.width = '100%';
    container.style.height = '100%';
    document.body.appendChild(container);
  }
  
  // Clear any existing content
  container.innerHTML = '';

  try {
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Data keys:', data ? Object.keys(data) : 'data is null');
    console.log('🔍 Data.dataResponse exists:', !!data?.dataResponse);

    // Extract data - handle the REAL Looker Studio format!
    if (data && data.dataResponse && data.dataResponse.tables && data.fields) {
      console.log('🎉 Found REAL Looker Studio data format!');
      
      // Extract data from data.dataResponse.tables[0].rows (the REAL path!)
      const rows = data.dataResponse.tables[0].rows;
      const fieldIds = data.dataResponse.tables[0].fields;
      
      console.log('📊 Raw rows:', rows);
      console.log('📊 Field IDs:', fieldIds);
      
      // Create field mapping from IDs to names using data.fields
      const fieldsMap = {};
      data.fields.forEach(field => {
        fieldsMap[field.id] = field.name;
      });
      console.log('📊 Fields map:', fieldsMap);
      
      // Convert row arrays to objects with field names
      const tableData = rows.map(row => {
        const rowObj = {};
        fieldIds.forEach((fieldId, index) => {
          const fieldName = fieldsMap[fieldId];
          rowObj[fieldName] = row[index];
        });
        return rowObj;
      });
      
      console.log('📊 Converted table data:', tableData);
      
      // Create field mappings by concept type for flexible field access
      const fieldMappings = {
        dimensions: [],
        metrics: [],
        allFields: {}
      };
      
      data.fields.forEach(field => {
        fieldMappings.allFields[field.name] = field;
        if (field.concept === 'DIMENSION') {
          fieldMappings.dimensions.push({ id: field.id, name: field.name });
        } else if (field.concept === 'METRIC') {
          fieldMappings.metrics.push({ id: field.id, name: field.name });
        }
      });
      
      console.log('🔍 Field mappings:', fieldMappings);
      console.log('🔍 Available dimensions:', fieldMappings.dimensions.map(d => d.name));
      console.log('🔍 Available metrics:', fieldMappings.metrics.map(m => m.name));
      
      // Line chart specific field access
      const xAxisField = fieldMappings.dimensions[0]?.name;      // X-axis (time/category)
      const valueField = fieldMappings.metrics[0]?.name;         // Y-axis values
      const seriesField = fieldMappings.dimensions[1]?.name;     // Series grouping (multiple lines)
      const colorField = fieldMappings.dimensions[2]?.name;      // Color field (for line colors)

      console.log('📈 Line chart fields:', { 
        xAxis: xAxisField, 
        value: valueField, 
        series: seriesField,
        color: colorField 
      });

      if (!xAxisField || !valueField) {
        container.innerHTML = `
          <div style="padding: 20px; color: #d93025; border: 1px solid #d93025; border-radius: 4px; font-family: Arial, sans-serif;">
            <h3>⚠️ Missing Required Fields</h3>
            <p>Line chart requires:</p>
            <ul>
              <li><strong>X-Axis Field (Dimension):</strong> ${xAxisField ? '✅ ' + xAxisField : '❌ Not configured'}</li>
              <li><strong>Value Field (Metric):</strong> ${valueField ? '✅ ' + valueField : '❌ Not configured'}</li>
              <li><strong>Series Field (Dimension):</strong> ${seriesField ? '✅ ' + seriesField : '⚠️ Optional'}</li>
              <li><strong>Color Field (Dimension):</strong> ${colorField ? '✅ ' + colorField : '⚠️ Optional'}</li>
            </ul>
            <p>Available fields:</p>
            <ul>
              <li><strong>Dimensions:</strong> ${fieldMappings.dimensions.map(d => d.name).join(', ') || 'None'}</li>
              <li><strong>Metrics:</strong> ${fieldMappings.metrics.map(m => m.name).join(', ') || 'None'}</li>
            </ul>
            <p>Please configure your fields in Looker Studio.</p>
          </div>
        `;
        return;
      }

      // Render the line chart!
      renderLineChart(tableData, xAxisField, valueField, seriesField, colorField);

      console.log('✅ Line chart rendered successfully');

    } else {
      console.log('⚠️ No recognizable data format found');
      console.log('⚠️ Full data structure:', JSON.stringify(data, null, 2));
      
      container.innerHTML = `
        <div style="padding: 20px; color: #ea4335; border: 1px solid #ea4335; border-radius: 4px; font-family: Arial, sans-serif;">
          <h3>❌ No Data Available</h3>
          <p>Unable to find chart data in the expected format.</p>
          <details>
            <summary>Technical Details</summary>
            <pre style="font-size: 12px; overflow: auto; max-height: 200px;">${JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      `;
    }

  } catch (error) {
    console.error('❌ Error in drawViz:', error);
    container.innerHTML = `
      <div style="padding: 20px; color: red; border: 1px solid red; border-radius: 4px;">
        <h3>❌ Visualization Error</h3>
        <p>Unable to render line chart: ${error.message}</p>
        <details>
          <summary>Technical Details</summary>
          <pre style="font-size: 12px; overflow: auto;">${error.stack}</pre>
        </details>
      </div>
    `;
  } finally {
    // CRITICAL: Signal to Looker Studio that rendering is complete
    if (window.google && window.google.lookerstudio && window.google.lookerstudio.done) {
      window.google.lookerstudio.done();
      console.log('📡 Signaled rendering complete to Looker Studio');
    }
  }
}

function renderLineChart(tableData, xAxisField, valueField, seriesField, colorField) {
  console.log('🎨 Rendering enhanced line chart...');
  
  const container = document.getElementById('container');
  
  // Set fixed, good-looking dimensions
  const containerWidth = 900;
  const containerHeight = 600;
  
  // Chart dimensions with margins for labels and legend
  const margin = { top: 60, right: 80, bottom: 100, left: 120 };
  const chartWidth = containerWidth - margin.left - margin.right;
  const chartHeight = containerHeight - margin.top - margin.bottom;
  
  console.log('📐 Chart dimensions:', { chartWidth, chartHeight });

  // Create clean HTML structure
  container.innerHTML = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      padding: 20px;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin: 20px auto;
    ">
      <h3 style="
        margin: 0 0 20px 0;
        color: #202124;
        font-size: 18px;
        font-weight: 500;
        text-align: center;
      ">📈 ${xAxisField} vs ${valueField}${seriesField ? ` (by ${seriesField})` : ''}</h3>
      <div id="chart-container" style="
        width: 100%;
        height: calc(100% - 60px);
        position: relative;
        overflow: hidden;
      "></div>
    </div>
  `;

  const chartContainer = document.getElementById('chart-container');
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}`);
  svg.style.display = 'block';
  chartContainer.appendChild(svg);

  // Chart group
  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
  svg.appendChild(chartGroup);

  // Process data - group by series if available
  const dataGrouped = {};
  
  if (seriesField) {
    // Group by series field
    tableData.forEach(row => {
      const seriesValue = row[seriesField] || 'Default';
      if (!dataGrouped[seriesValue]) {
        dataGrouped[seriesValue] = [];
      }
      dataGrouped[seriesValue].push({
        x: row[xAxisField],
        y: parseFloat(row[valueField]) || 0,
        color: colorField ? row[colorField] : null,
        originalRow: row
      });
    });
  } else {
    // Single series
    dataGrouped['Default'] = tableData.map(row => ({
      x: row[xAxisField],
      y: parseFloat(row[valueField]) || 0,
      color: colorField ? row[colorField] : null,
      originalRow: row
    }));
  }

  const seriesNames = Object.keys(dataGrouped);
  
  // Get unique X values in order of appearance
  const xValues = [];
  tableData.forEach(row => {
    const xVal = row[xAxisField];
    if (!xValues.includes(xVal)) {
      xValues.push(xVal);
    }
  });
  
  // Sort each series by X value order
  seriesNames.forEach(seriesName => {
    dataGrouped[seriesName].sort((a, b) => {
      return xValues.indexOf(a.x) - xValues.indexOf(b.x);
    });
  });

  const allYValues = Object.values(dataGrouped).flat().map(d => d.y);
  const maxY = Math.max(...allYValues);
  const minY = Math.min(0, Math.min(...allYValues));
  const yRange = maxY - minY;

  console.log('📊 Data processed:', { 
    series: seriesNames.length, 
    xValues: xValues.length, 
    maxY, 
    minY 
  });
  
  // Debug color field processing
  if (colorField) {
    const colorValues = tableData.map(row => row[colorField]).filter(Boolean);
    const uniqueColorValues = [...new Set(colorValues)];
    console.log('🎨 Color field analysis:', {
      field: colorField,
      uniqueValues: uniqueColorValues,
      validColors: uniqueColorValues.map(color => ({
        original: color,
        validated: validateAndCleanColor(color),
        isValid: !!validateAndCleanColor(color)
      }))
    });
  }

  // Color palette for series (when no custom colors)
  const colors = ['#4285f4', '#34a853', '#ea4335', '#fbbc04', '#ff6d01', '#9aa0a6', '#ab47bc', '#00acc1'];

  // Scales
  const xStep = chartWidth / Math.max(1, xValues.length - 1);
  const yScale = (y) => chartHeight - ((y - minY) / yRange * chartHeight);

  // Add grid lines
  const numYTicks = 6;
  for (let i = 0; i <= numYTicks; i++) {
    const value = minY + (yRange * i / numYTicks);
    const y = yScale(value);
    
    // Grid line
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', 0);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('x2', chartWidth);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', '#f1f3f4');
    gridLine.setAttribute('stroke-width', '1');
    chartGroup.appendChild(gridLine);
    
    // Y-axis label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -15);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-family', 'Segoe UI, sans-serif');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#5f6368');
    label.textContent = Math.round(value).toLocaleString();
    chartGroup.appendChild(label);
  }

  // Add X-axis labels
  xValues.forEach((xVal, index) => {
    const x = index * xStep;
    
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', chartHeight + 25);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Segoe UI, sans-serif');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#202124');
    label.textContent = String(xVal);
    chartGroup.appendChild(label);
  });

  // Render lines for each series
  seriesNames.forEach((seriesName, seriesIndex) => {
    const seriesData = dataGrouped[seriesName];
    
    // Determine line color
    let lineColor = colors[seriesIndex % colors.length];
    
    // If color field is available, try to use it for this series
    if (colorField && seriesData.length > 0) {
      const firstColorValue = seriesData[0].color;
      const validColor = validateAndCleanColor(firstColorValue);
      if (validColor) {
        lineColor = validColor;
      }
    }
    
    // Create line path
    const points = seriesData.map(point => {
      const x = xValues.indexOf(point.x) * xStep;
      const y = yScale(point.y);
      return { x, y, value: point.y, originalData: point };
    });
    
    if (points.length > 1) {
      // Draw line
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
      }
      
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', lineColor);
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-linecap', 'round');
      chartGroup.appendChild(path);
    }
    
    // Draw points and labels
    points.forEach(point => {
      // Point circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', lineColor);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      
      // Add hover effect
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '6');
        showTooltip(point.originalData.x, point.value, seriesName, point.originalData.color);
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '4');
        hideTooltip();
      });
      
      chartGroup.appendChild(circle);
      
      // Value label (only show on hover or if not too crowded)
      if (points.length <= 10) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', point.x);
        text.setAttribute('y', point.y - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Segoe UI, sans-serif');
        text.setAttribute('font-size', '11');
        text.setAttribute('fill', '#5f6368');
        text.setAttribute('font-weight', '500');
        text.textContent = point.value.toLocaleString();
        chartGroup.appendChild(text);
      }
    });
  });

  // Add legend if multiple series
  if (seriesNames.length > 1) {
    renderLegend(svg, seriesNames, colors, colorField, dataGrouped, margin);
  }

  // Add axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', chartHeight);
  xAxis.setAttribute('x2', chartWidth);
  xAxis.setAttribute('y2', chartHeight);
  xAxis.setAttribute('stroke', '#dadce0');
  xAxis.setAttribute('stroke-width', '2');
  chartGroup.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 0);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 0);
  yAxis.setAttribute('y2', chartHeight);
  yAxis.setAttribute('stroke', '#dadce0');
  yAxis.setAttribute('stroke-width', '2');
  chartGroup.appendChild(yAxis);

  console.log('✅ Line chart rendered with', seriesNames.length, 'series and', xValues.length, 'data points');
}

function renderLegend(svg, seriesNames, colors, colorField, dataGrouped, margin) {
  const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legendGroup.setAttribute('transform', `translate(${margin.left + 20}, 20)`);
  
  seriesNames.forEach((seriesName, index) => {
    const legendItem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendItem.setAttribute('transform', `translate(${index * 120}, 0)`);
    
    // Determine color for this series
    let seriesColor = colors[index % colors.length];
    if (colorField && dataGrouped[seriesName] && dataGrouped[seriesName].length > 0) {
      const firstColorValue = dataGrouped[seriesName][0].color;
      const validColor = validateAndCleanColor(firstColorValue);
      if (validColor) {
        seriesColor = validColor;
      }
    }
    
    // Legend color indicator
    const colorRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    colorRect.setAttribute('x', 0);
    colorRect.setAttribute('y', 0);
    colorRect.setAttribute('width', 12);
    colorRect.setAttribute('height', 12);
    colorRect.setAttribute('fill', seriesColor);
    colorRect.setAttribute('rx', 2);
    legendItem.appendChild(colorRect);
    
    // Legend text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 18);
    text.setAttribute('y', 10);
    text.setAttribute('font-family', 'Segoe UI, sans-serif');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#202124');
    text.textContent = seriesName;
    legendItem.appendChild(text);
    
    legendGroup.appendChild(legendItem);
  });
  
  svg.appendChild(legendGroup);
}

// Tooltip functions (same as bar chart)
function showTooltip(xValue, yValue, series, color) {
  hideTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.id = 'line-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-family: Segoe UI, sans-serif;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  let content = `<strong>${xValue}</strong><br/>Value: ${yValue.toLocaleString()}`;
  if (series && series !== 'Default') {
    content += `<br/>Series: ${series}`;
  }
  if (color) {
    content += `<br/>Color: ${color}`;
  }
  
  tooltip.innerHTML = content;
  document.body.appendChild(tooltip);
  
  document.addEventListener('mousemove', updateTooltipPosition);
}

function hideTooltip() {
  const tooltip = document.getElementById('line-tooltip');
  if (tooltip) {
    tooltip.remove();
    document.removeEventListener('mousemove', updateTooltipPosition);
  }
}

function updateTooltipPosition(e) {
  const tooltip = document.getElementById('line-tooltip');
  if (tooltip) {
    tooltip.style.left = (e.clientX + 10) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
  }
}

// Initialize using the postMessage pattern that was actually working
function initVisualization() {
  console.log('🚀 Initializing line chart visualization...');
  
  // USE THE WORKING POSTMESSAGE PATTERN (same as bar chart)
  console.log('🔧 Setting up postMessage subscription...');

  // Listen for postMessage from parent window (this is the working pattern!)
  window.addEventListener('message', function(event) {
    console.log('📨 Received message from parent:', event);
    console.log('📊 Message data looks like:', event.data);
    if (event.data && typeof event.data === 'object') {
      console.log('🎉 Found data in message! Trying to visualize...');
      drawViz(event.data);
    }
  });

  // Signal to parent that we're ready
  console.log('📡 Signaling ready to parent window...');
  try {
    if (window.parent) {
      window.parent.postMessage({type: 'ready'}, '*');
    }
  } catch (e) {
    console.log('⚠️ Could not signal parent (normal in iframe)');
  }

  // Also try the new API if available, but don't rely on it
  if (window.google?.lookerstudio?.registerVisualization) {
    console.log('🔍 Trying new Looker Studio API as backup...');
    try {
      // Try without objectTransform first (same as working test viz)
      window.google.lookerstudio.registerVisualization(drawViz);
      console.log('✅ Registered with new API (no transform)');
    } catch (e) {
      console.log('⚠️ New API failed:', e.message);
    }
  }
  
  // Fallback: show test data after delay if no real data comes
  setTimeout(() => {
    const container = document.getElementById('container') || document.body;
    if (!container.innerHTML.trim()) {
      console.log('⚠️ No data received after 5 seconds - showing test line chart');
      showTestLineChart();
    }
  }, 5000);
}

// Test line chart fallback function
function showTestLineChart() {
  console.log('🧪 Showing test line chart...');
  
  const testData = {
    dataResponse: {
      tables: [{
        id: "DEFAULT",
        fields: ["dimension", "metric", "series"],
        rows: [
          ["Jan", "100", "Series A"],
          ["Feb", "150", "Series A"], 
          ["Mar", "120", "Series A"],
          ["Apr", "180", "Series A"],
          ["Jan", "80", "Series B"],
          ["Feb", "110", "Series B"],
          ["Mar", "140", "Series B"],
          ["Apr", "160", "Series B"]
        ]
      }]
    },
    fields: [
      {id: "dimension", name: "month", concept: "DIMENSION"},
      {id: "metric", name: "value", concept: "METRIC"},
      {id: "series", name: "category", concept: "DIMENSION"}
    ]
  };
  
  drawViz(testData);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisualization);
} else {
  initVisualization();
}

console.log('📈 Line chart script loaded and ready!');
