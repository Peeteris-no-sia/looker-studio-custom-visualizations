// Simple Test Visualization - Enhanced data detection
console.log('🚀 Test Visualization Loading...');

// Enhanced environment inspection
function inspectEnvironment() {
  console.log('🔍 === FULL ENVIRONMENT INSPECTION ===');
  
  // Check URL parameters for data
  const url = new URL(window.location.href);
  console.log('📍 Current URL:', window.location.href);
  console.log('📋 URL Search Params:', url.searchParams.toString());
  
  // Check for any global data variables
  const potentialDataVars = ['data', 'vizData', 'chartData', 'tableData', 'reportData', 'visualization'];
  potentialDataVars.forEach(varName => {
    if (window[varName]) {
      console.log(`📊 Found window.${varName}:`, window[varName]);
    }
  });
  
  // Check for parent window communication
  try {
    if (window.parent && window.parent !== window) {
      console.log('👥 Parent window exists');
      // Try to listen for messages from parent
      window.addEventListener('message', function(event) {
        console.log('📨 Received message from parent:', event);
        if (event.data && typeof event.data === 'object') {
          console.log('📊 Message data looks like:', event.data);
          // Check if this looks like visualization data
          if (event.data.tables || event.data.fields || event.data.rows) {
            console.log('🎉 Found data in message! Trying to visualize...');
            drawViz(event.data);
          }
        }
      });
    }
  } catch (e) {
    console.log('❌ Cannot access parent:', e.message);
  }
  
  // Check window object for any Looker Studio specific properties
  const windowProps = Object.getOwnPropertyNames(window).filter(prop => 
    prop.toLowerCase().includes('google') || 
    prop.toLowerCase().includes('looker') || 
    prop.toLowerCase().includes('data') || 
    prop.toLowerCase().includes('viz') ||
    prop.toLowerCase().includes('chart')
  );
  console.log('🔍 Looker/Data related window properties:', windowProps);
  
  // Inspect any functions that might be callbacks
  windowProps.forEach(prop => {
    if (typeof window[prop] === 'function') {
      console.log(`🔧 Function ${prop}:`, window[prop].toString().substring(0, 200));
    } else if (window[prop] && typeof window[prop] === 'object') {
      console.log(`📦 Object ${prop}:`, window[prop]);
      
      // Deep dive into google.lookerstudio!
      if (prop === 'google' && window[prop].lookerstudio) {
        console.log('🎯 FOUND LOOKERSTUDIO OBJECT! Inspecting...');
        console.log('google.lookerstudio:', window[prop].lookerstudio);
        
        const ls = window[prop].lookerstudio;
        console.log('lookerstudio keys:', Object.keys(ls));
        
        Object.keys(ls).forEach(key => {
          console.log(`lookerstudio.${key}:`, ls[key]);
          if (typeof ls[key] === 'function') {
            console.log(`lookerstudio.${key} function:`, ls[key].toString().substring(0, 300));
          } else if (ls[key] && typeof ls[key] === 'object') {
            console.log(`lookerstudio.${key} object keys:`, Object.keys(ls[key]));
          }
        });
      }
    }
  });
  
  console.log('🔍 === END ENVIRONMENT INSPECTION ===');
}

// Main visualization function
function drawViz(data) {
  console.log('🎯 drawViz called with data:', data);
  
  // Clear any existing content
  const container = document.getElementById('container') || document.body;
  container.innerHTML = '';
  
  // Create container if it doesn't exist
  if (!document.getElementById('container')) {
    const div = document.createElement('div');
    div.id = 'container';
    document.body.appendChild(div);
  }
  
  try {
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Data keys:', data ? Object.keys(data) : 'data is null');
    console.log('🔍 Data.tables exists:', !!data.tables);
    
    // Log each key and its type/value
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        console.log(`🔍 data.${key}:`, typeof data[key], data[key]);
      });
    }
    
    // Extract data - handle the REAL Looker Studio format!
    let tableData = [];
    let fieldsMap = {};
    
    if (data && data.dataResponse && data.dataResponse.tables && data.dataResponse.tables.length > 0) {
      console.log('🎉 Found REAL Looker Studio data format!');
      
      // Get the table data
      const table = data.dataResponse.tables[0]; // Use first table
      const rawRows = table.rows || [];
      const fieldIds = table.fields || [];
      
      console.log('📊 Raw rows:', rawRows);
      console.log('📊 Field IDs:', fieldIds);
      
      // Create field mapping from field definitions
      if (data.fields && Array.isArray(data.fields)) {
        data.fields.forEach(field => {
          fieldsMap[field.id] = field.name;
        });
      }
      
      console.log('📊 Fields map:', fieldsMap);
      
      // Convert rows to objects with proper field names
      tableData = rawRows.map(row => {
        const rowObj = {};
        fieldIds.forEach((fieldId, index) => {
          const fieldName = fieldsMap[fieldId] || fieldId;
          rowObj[fieldName] = row[index];
        });
        return rowObj;
      });
      
      console.log('📊 Converted table data:', tableData);
    } else {
      console.log('⚠️ No recognizable table data found');
      container.innerHTML = `
        <div style="padding: 20px;">
          <h3>🔍 Debug: Received Data Structure</h3>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
      return;
    }
    
    console.log('📊 Table data:', tableData);
    
    if (tableData.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No data available</div>';
      return;
    }
    
    // Get ALL field mappings dynamically - works for any visualization type!
    const fieldMappings = {
      dimensions: [],
      metrics: [],
      allFields: {}
    };
    
    if (data.fields && Array.isArray(data.fields)) {
      data.fields.forEach(field => {
        fieldMappings.allFields[field.name] = field;
        
        if (field.concept === 'DIMENSION') {
          fieldMappings.dimensions.push(field);
        } else if (field.concept === 'METRIC') {
          fieldMappings.metrics.push(field);
        }
      });
    }
    
    console.log('🔍 Field mappings:', fieldMappings);
    console.log('🔍 Available dimensions:', fieldMappings.dimensions.map(f => f.name));
    console.log('🔍 Available metrics:', fieldMappings.metrics.map(f => f.name));
    
    // For backwards compatibility, still provide the first dimension/metric
    const primaryDimension = fieldMappings.dimensions[0]?.name || 'dimension';
    const primaryMetric = fieldMappings.metrics[0]?.name || 'metric';
    
    console.log('🔍 Primary fields:', { dimension: primaryDimension, metric: primaryMetric });
    
    // Create DYNAMIC table that handles any number of fields!
    let html = '<h3>🎯 Dynamic Test Visualization</h3>';
    
    // Get all unique field names from the actual data
    const allFieldNames = tableData.length > 0 ? Object.keys(tableData[0]) : [];
    
    html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    
    // Dynamic header based on actual fields
    html += '<thead><tr>';
    allFieldNames.forEach(fieldName => {
      const fieldInfo = fieldMappings.allFields[fieldName];
      const fieldType = fieldInfo ? fieldInfo.concept : 'UNKNOWN';
      const badge = fieldType === 'DIMENSION' ? '📊' : fieldType === 'METRIC' ? '📈' : '❓';
      html += `<th style="padding: 8px; background: #f5f5f5;">${badge} ${fieldName} <small>(${fieldType})</small></th>`;
    });
    html += '</tr></thead>';
    
    // Dynamic rows
    html += '<tbody>';
    tableData.forEach(row => {
      html += '<tr>';
      allFieldNames.forEach(fieldName => {
        const value = row[fieldName] || 'N/A';
        html += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    // Enhanced data summary
    html += `<div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">`;
    html += `<h4>📊 Data Summary</h4>`;
    html += `<ul style="margin: 0;">`;
    html += `<li><strong>Total rows:</strong> ${tableData.length}</li>`;
    html += `<li><strong>Dimensions:</strong> ${fieldMappings.dimensions.map(f => f.name).join(', ') || 'None'}</li>`;
    html += `<li><strong>Metrics:</strong> ${fieldMappings.metrics.map(f => f.name).join(', ') || 'None'}</li>`;
    html += `<li><strong>Total fields:</strong> ${allFieldNames.length}</li>`;
    html += `</ul>`;
    html += `</div>`;
    
    // Field access patterns for different viz types
    html += `<div style="background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px;">`;
    html += `<h4>🔧 Field Access Patterns for Different Visualizations</h4>`;
    html += `<div style="font-family: monospace; font-size: 12px;">`;
    html += `<p><strong>📊 Bar Chart with Color:</strong></p>`;
    html += `<ul style="margin: 0 0 10px 20px;">`;
    html += `<li>Category: fieldMappings.dimensions[0]?.name = "${fieldMappings.dimensions[0]?.name || 'undefined'}"</li>`;
    html += `<li>Value: fieldMappings.metrics[0]?.name = "${fieldMappings.metrics[0]?.name || 'undefined'}"</li>`;
    html += `<li>Color: fieldMappings.dimensions[1]?.name = "${fieldMappings.dimensions[1]?.name || 'undefined'}"</li>`;
    html += `</ul>`;
    html += `<p><strong>📈 Line Chart:</strong></p>`;
    html += `<ul style="margin: 0 0 10px 20px;">`;
    html += `<li>X-axis: fieldMappings.dimensions[0]?.name</li>`;
    html += `<li>Y-axis: fieldMappings.metrics[0]?.name</li>`;
    html += `<li>Series: fieldMappings.dimensions[1]?.name</li>`;
    html += `</ul>`;
    html += `<p><strong>🥧 Pie Chart:</strong></p>`;
    html += `<ul style="margin: 0;">`;
    html += `<li>Label: fieldMappings.dimensions[0]?.name</li>`;
    html += `<li>Value: fieldMappings.metrics[0]?.name</li>`;
    html += `</ul>`;
    html += `</div>`;
    html += `</div>`;
    
    // Collapsible raw data for debugging
    html += '<details style="margin: 10px 0;"><summary>🔍 Raw Data Structure (for debugging)</summary>';
    html += `<pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 11px;">${JSON.stringify(data, null, 2)}</pre>`;
    html += '</details>';
    
    container.innerHTML = html;
    console.log('✅ Visualization rendered successfully');
  
  // CRITICAL: Signal to Looker Studio that rendering is complete
  if (window.google && window.google.lookerstudio && window.google.lookerstudio.done) {
    window.google.lookerstudio.done();
    console.log('📡 Signaled rendering complete to Looker Studio');
  }
    
  } catch (error) {
    console.error('❌ Error in drawViz:', error);
    container.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}

// Standard community visualization initialization
console.log('🔧 Setting up DSCC subscription...');

// Wait for DSCC to be available
function initVisualization() {
  console.log('🚀 Initializing visualization...');
  
  // USE THE REAL LOOKER STUDIO API!
  if (window.google && window.google.lookerstudio && window.google.lookerstudio.registerVisualization) {
    console.log('🎉 FOUND REAL LOOKER STUDIO API! Using registerVisualization...');
    
    const ls = window.google.lookerstudio;
    
    // This is the CORRECT modern Looker Studio pattern
    ls.registerVisualization(drawViz, ls.objectTransform);
    
    console.log('✅ Successfully registered with google.lookerstudio.registerVisualization');
    console.log('🎯 Waiting for data from Looker Studio...');
    
    // Signal to Looker Studio that we're done initializing
    if (ls.done) {
      ls.done();
      console.log('📡 Signaled render complete to Looker Studio');
    }
    
    return;
  }
  
  // Fallback to DSCC pattern (older)
  if (typeof window.dscc !== 'undefined' && window.dscc.subscribeToData) {
    console.log('✅ Fallback: Using DSCC pattern');
    
    window.dscc.subscribeToData(drawViz, {
      transform: window.dscc.objectTransform
    });
    
    console.log('🎉 Successfully subscribed to DSCC data');
  } else {
    console.log('⚠️ No data API found - using test data');
    setTimeout(showTestData, 1000);
  }
}

function showTestData() {
  console.log('🧪 Showing test data...');
  
  const testData = {
    fields: {
      dimension: [{ id: 'dimension', name: 'Test Dimension' }],
      metric: [{ id: 'metric', name: 'Test Metric' }]
    },
    tables: {
      DEFAULT: [
        { dimension: 'Category A', metric: 100 },
        { dimension: 'Category B', metric: 250 },
        { dimension: 'Category C', metric: 175 },
        { dimension: 'Category D', metric: 300 }
      ]
    }
  };
  
  drawViz(testData);
}

// Run environment inspection immediately
inspectEnvironment();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisualization);
} else {
  initVisualization();
}

// Also run inspection after a delay to catch late-loading items
setTimeout(inspectEnvironment, 2000);
setTimeout(inspectEnvironment, 5000);

console.log('📄 Test visualization script loaded');
