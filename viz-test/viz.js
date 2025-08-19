// Simple Test Visualization - Using the ORIGINAL working pattern from before
console.log('🚀 Test Visualization Loading...');

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
    
    // Check if we have the correct Looker Studio data format
    if (data && data.dataResponse && data.dataResponse.tables && data.fields) {
      console.log('🎉 Found REAL Looker Studio data format!');
      
      // Extract data from the correct path: data.dataResponse.tables[0].rows
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
      
      // Get primary dimension and metric for simple display
      const primaryFields = {
        dimension: fieldMappings.dimensions[0]?.name,
        metric: fieldMappings.metrics[0]?.name
      };
      
      console.log('🔍 Primary fields:', primaryFields);
      
      // Create simple table visualization
      let html = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h3>✅ Test Visualization Working!</h3>
          <div style="margin-bottom: 15px;">
            <strong>📊 Data Summary:</strong><br>
            • Rows: ${tableData.length}<br>
            • Dimensions: ${fieldMappings.dimensions.length}<br>
            • Metrics: ${fieldMappings.metrics.length}<br>
            • Primary Dimension: ${primaryFields.dimension}<br>
            • Primary Metric: ${primaryFields.metric}
          </div>
          
          <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">${primaryFields.dimension}</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">${primaryFields.metric}</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      tableData.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        html += `
          <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #ddd; padding: 12px;">${row[primaryFields.dimension]}</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${row[primaryFields.metric]}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
          
          <div style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px;">
            <strong>✅ Success!</strong> Data loaded and rendered successfully using the Looker Studio Community Visualization API.
          </div>
        </div>
      `;
      
      container.innerHTML = html;
      console.log('✅ Visualization rendered successfully');
      
    } else {
      // If we don't have the expected data format, show what we got
      console.log('⚠️ No recognizable table data found');
      console.log('⚠️ Full data structure:', JSON.stringify(data, null, 2));
      
      showTestData();
    }
    
  } catch (error) {
    console.error('❌ Error in drawViz:', error);
    console.error('❌ Error stack:', error.stack);
    showTestData();
  }
}

// Test data fallback
function showTestData() {
  console.log('🧪 Showing test data...');
  
  const container = document.getElementById('container') || document.body;
  container.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3>🧪 Test Mode</h3>
      <p>No live data received. Showing sample data for testing.</p>
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Test Dimension</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Test Metric</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #ffffff;">
            <td style="border: 1px solid #ddd; padding: 12px;">Category A</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">100</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="border: 1px solid #ddd; padding: 12px;">Category B</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">200</td>
          </tr>
          <tr style="background-color: #ffffff;">
            <td style="border: 1px solid #ddd; padding: 12px;">Category C</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">150</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="border: 1px solid #ddd; padding: 12px;">Category D</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">300</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Initialize using the postMessage pattern that was actually working
console.log('🔧 Setting up DSCC subscription...');

// Listen for postMessage from parent window (this was the working pattern!)
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
    // Try without objectTransform first
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
    console.log('⚠️ No data received after 5 seconds - showing test data');
    showTestData();
  }
}, 5000);

console.log('📄 Test visualization script loaded');