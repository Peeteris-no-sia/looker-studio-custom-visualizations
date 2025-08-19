# 🔧 Looker Studio Community Visualizations - Developer Guide

> **The definitive guide to building working Looker Studio Community Visualizations in 2024**

## 🎯 **Table of Contents**

1. [🚀 The Real API (What Actually Works)](#-the-real-api-what-actually-works)
2. [📊 Data Structure Deep Dive](#-data-structure-deep-dive)
3. [🔧 Universal Field Mapping](#-universal-field-mapping)
4. [📈 Visualization Patterns](#-visualization-patterns)
5. [🐛 Debugging and Troubleshooting](#-debugging-and-troubleshooting)
6. [⚡ Performance and Best Practices](#-performance-and-best-practices)

---

## 🚀 **The Real API (What Actually Works)**

### ❌ **OBSOLETE - Don't Use These Patterns**

```javascript
// ❌ OLD/BROKEN - This doesn't work in 2024
window.dscc.subscribeToData(callback, {transform: dscc.objectTransform});

// ❌ WRONG DATA STRUCTURE - This format doesn't exist
data.tables.DEFAULT

// ❌ MANUAL LOADING - This approach fails
<script src="https://cdn.jsdelivr.net/npm/@google/dscc@latest"></script>
```

### ✅ **WORKING - Use These Patterns**

```javascript
// ✅ CORRECT INITIALIZATION
google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);

// ✅ CORRECT COMPLETION SIGNAL
google.lookerstudio.done();

// ✅ REAL DATA STRUCTURE
data.dataResponse.tables[0].rows
```

### **Complete Working Template**

```javascript
// Simple Test Visualization - WORKING PATTERN
console.log('🚀 Visualization Loading...');

function drawViz(data) {
  console.log('🎯 drawViz called with data:', data);
  
  try {
    // 1. Extract the REAL data structure
    if (!data?.dataResponse?.tables?.[0]) {
      console.log('⚠️ No data available');
      return;
    }
    
    const table = data.dataResponse.tables[0];
    const rawRows = table.rows || [];
    const fieldIds = table.fields || [];
    
    // 2. Create field mapping from definitions
    const fieldsMap = {};
    if (data.fields && Array.isArray(data.fields)) {
      data.fields.forEach(field => {
        fieldsMap[field.id] = field.name;
      });
    }
    
    // 3. Convert rows to objects
    const tableData = rawRows.map(row => {
      const rowObj = {};
      fieldIds.forEach((fieldId, index) => {
        const fieldName = fieldsMap[fieldId] || fieldId;
        rowObj[fieldName] = row[index];
      });
      return rowObj;
    });
    
    // 4. Get field mappings by type
    const fieldMappings = {
      dimensions: data.fields.filter(f => f.concept === 'DIMENSION'),
      metrics: data.fields.filter(f => f.concept === 'METRIC')
    };
    
    // 5. Render your visualization
    renderVisualization(tableData, fieldMappings);
    
    // 6. CRITICAL: Signal completion
    if (window.google?.lookerstudio?.done) {
      window.google.lookerstudio.done();
    }
    
  } catch (error) {
    console.error('❌ Visualization error:', error);
  }
}

function renderVisualization(tableData, fieldMappings) {
  // Your visualization logic here...
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Setting up Looker Studio API...');
    
    if (window.google?.lookerstudio?.registerVisualization) {
      google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);
      console.log('✅ Successfully registered visualization');
    } else {
      console.error('❌ Looker Studio API not available');
    }
  });
} else {
  // DOM already loaded
  if (window.google?.lookerstudio?.registerVisualization) {
    google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);
  }
}
```

---

## 📊 **Data Structure Deep Dive**

### **What Looker Studio Actually Sends**

```javascript
{
  "type": "RENDER",
  "config": {
    "data": [/*...field configuration...*/],
    "style": [/*...style configuration...*/],
    "themeStyle": {/*...theme colors...*/}
  },
  "fields": [
    {
      "id": "qt_7z1nbcqgvd",           // ← Internal field ID
      "name": "company_name",          // ← Real field name
      "type": "TEXT",                  // ← Data type
      "concept": "DIMENSION"           // ← Field concept
    },
    {
      "id": "qt_0r2nbcqgvd", 
      "name": "salary",
      "type": "NUMBER",
      "concept": "METRIC"
    }
  ],
  "dataResponse": {
    "tables": [
      {
        "id": "DEFAULT",
        "fields": ["qt_7z1nbcqgvd", "qt_0r2nbcqgvd"],  // ← Field ID order
        "rows": [
          ["Innovate Inc.", "725000"],                   // ← Raw data rows
          ["CloudScape Corp", "570000"],
          ["QuantumLeap Co.", "560000"]
        ]
      }
    ]
  }
}
```

### **Data Transformation Process**

```javascript
// Step 1: Extract raw data
const table = data.dataResponse.tables[0];
const rawRows = table.rows;           // [["Company A", "100"], ["Company B", "200"]]
const fieldIds = table.fields;       // ["qt_abc123", "qt_def456"]

// Step 2: Create field ID to name mapping
const fieldsMap = {};
data.fields.forEach(field => {
  fieldsMap[field.id] = field.name;
});
// Result: {"qt_abc123": "company_name", "qt_def456": "salary"}

// Step 3: Convert to objects
const tableData = rawRows.map(row => {
  const rowObj = {};
  fieldIds.forEach((fieldId, index) => {
    const fieldName = fieldsMap[fieldId];
    rowObj[fieldName] = row[index];
  });
  return rowObj;
});
// Result: [
//   {company_name: "Company A", salary: "100"},
//   {company_name: "Company B", salary: "200"}
// ]
```

---

## 🔧 **Universal Field Mapping**

### **Field Types and Concepts**

```javascript
// Field concept types from Looker Studio
const FIELD_CONCEPTS = {
  DIMENSION: 'DIMENSION',    // Categories, text, dates
  METRIC: 'METRIC'          // Numbers, calculated values
};

// Field data types
const FIELD_TYPES = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER', 
  PERCENT: 'PERCENT',
  CURRENCY: 'CURRENCY',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  BOOLEAN: 'BOOLEAN'
};
```

### **Universal Field Mapper**

```javascript
function createFieldMappings(data) {
  const mappings = {
    dimensions: [],
    metrics: [],
    byName: {},
    byId: {},
    byConcept: {
      DIMENSION: [],
      METRIC: []
    }
  };
  
  if (data.fields && Array.isArray(data.fields)) {
    data.fields.forEach((field, index) => {
      // Add to all collections
      mappings.byName[field.name] = field;
      mappings.byId[field.id] = field;
      mappings.byConcept[field.concept].push(field);
      
      // Add to typed arrays
      if (field.concept === 'DIMENSION') {
        mappings.dimensions.push(field);
      } else if (field.concept === 'METRIC') {
        mappings.metrics.push(field);
      }
    });
  }
  
  return mappings;
}

// Usage
const fieldMappings = createFieldMappings(data);

// Access patterns for different needs
const primaryDimension = fieldMappings.dimensions[0]?.name;      // First dimension
const primaryMetric = fieldMappings.metrics[0]?.name;           // First metric
const colorDimension = fieldMappings.dimensions[1]?.name;       // Second dimension for color
const allDimensions = fieldMappings.dimensions.map(f => f.name); // All dimensions
```

---

## 📈 **Visualization Patterns**

### **📊 Bar Chart with Color Field**

```javascript
function renderBarChart(tableData, fieldMappings) {
  // Field assignment for bar chart
  const categoryField = fieldMappings.dimensions[0]?.name;  // X-axis
  const valueField = fieldMappings.metrics[0]?.name;        // Bar height
  const colorField = fieldMappings.dimensions[1]?.name;     // Color grouping (optional)
  
  if (!categoryField || !valueField) {
    throw new Error('Bar chart requires at least one dimension and one metric');
  }
  
  // Group data by color field if available
  const groupedData = colorField ? groupByField(tableData, colorField) : {default: tableData};
  
  // SVG setup
  const svg = d3.select('#container')
    .append('svg')
    .attr('width', 600)
    .attr('height', 400);
    
  // Scales
  const xScale = d3.scaleBand()
    .domain(tableData.map(d => d[categoryField]))
    .range([50, 550])
    .padding(0.1);
    
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(tableData, d => +d[valueField])])
    .range([350, 50]);
    
  // Color scale (if color field exists)
  const colorScale = colorField ? 
    d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(tableData.map(d => d[colorField]))]) :
    () => '#4285f4';
  
  // Render bars
  svg.selectAll('.bar')
    .data(tableData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d[categoryField]))
    .attr('y', d => yScale(+d[valueField]))
    .attr('width', xScale.bandwidth())
    .attr('height', d => 350 - yScale(+d[valueField]))
    .attr('fill', d => colorScale(colorField ? d[colorField] : 'default'));
}
```

### **📈 Line Chart with Series**

```javascript
function renderLineChart(tableData, fieldMappings) {
  const xField = fieldMappings.dimensions[0]?.name;      // X-axis (usually time/category)
  const yField = fieldMappings.metrics[0]?.name;         // Y-axis values
  const seriesField = fieldMappings.dimensions[1]?.name;  // Series grouping (optional)
  
  // Group by series if available
  const series = seriesField ? 
    d3.group(tableData, d => d[seriesField]) :
    new Map([['default', tableData]]);
    
  // SVG setup
  const svg = d3.select('#container')
    .append('svg')
    .attr('width', 600)
    .attr('height', 400);
    
  // Scales
  const xScale = d3.scalePoint()
    .domain(tableData.map(d => d[xField]))
    .range([50, 550]);
    
  const yScale = d3.scaleLinear()
    .domain(d3.extent(tableData, d => +d[yField]))
    .range([350, 50]);
    
  // Line generator
  const line = d3.line()
    .x(d => xScale(d[xField]))
    .y(d => yScale(+d[yField]));
    
  // Render lines for each series
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  series.forEach((seriesData, seriesName) => {
    svg.append('path')
      .datum(seriesData)
      .attr('fill', 'none')
      .attr('stroke', colorScale(seriesName))
      .attr('stroke-width', 2)
      .attr('d', line);
  });
}
```

### **🥧 Pie Chart**

```javascript
function renderPieChart(tableData, fieldMappings) {
  const labelField = fieldMappings.dimensions[0]?.name;   // Slice labels
  const valueField = fieldMappings.metrics[0]?.name;      // Slice sizes
  
  if (!labelField || !valueField) {
    throw new Error('Pie chart requires one dimension and one metric');
  }
  
  // SVG setup
  const width = 400, height = 400, radius = 150;
  const svg = d3.select('#container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
    
  const g = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);
    
  // Pie generator
  const pie = d3.pie()
    .value(d => +d[valueField]);
    
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
    
  // Color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  // Render slices
  const slices = g.selectAll('.slice')
    .data(pie(tableData))
    .enter()
    .append('g')
    .attr('class', 'slice');
    
  slices.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => colorScale(i));
    
  // Labels
  slices.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .text(d => d.data[labelField]);
}
```

### **📋 Dynamic Table**

```javascript
function renderTable(tableData, fieldMappings) {
  const container = document.getElementById('container');
  
  if (tableData.length === 0) {
    container.innerHTML = '<p>No data available</p>';
    return;
  }
  
  // Get all field names
  const fieldNames = Object.keys(tableData[0]);
  
  // Create table HTML
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  
  // Header with field type indicators
  html += '<thead><tr>';
  fieldNames.forEach(fieldName => {
    const fieldInfo = fieldMappings.byName[fieldName];
    const badge = fieldInfo?.concept === 'DIMENSION' ? '📊' : '📈';
    const type = fieldInfo?.concept || 'UNKNOWN';
    html += `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">
      ${badge} ${fieldName} <small>(${type})</small>
    </th>`;
  });
  html += '</tr></thead>';
  
  // Data rows
  html += '<tbody>';
  tableData.forEach(row => {
    html += '<tr>';
    fieldNames.forEach(fieldName => {
      const value = row[fieldName] || 'N/A';
      html += `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  
  container.innerHTML = html;
}
```

---

## 🐛 **Debugging and Troubleshooting**

### **Essential Debug Logging**

```javascript
function debugDataStructure(data) {
  console.group('🔍 Data Structure Debug');
  
  // Basic structure
  console.log('Data type:', typeof data);
  console.log('Data keys:', data ? Object.keys(data) : 'null');
  
  // Fields analysis
  if (data.fields) {
    console.log('📊 Fields count:', data.fields.length);
    console.table(data.fields);
    
    const dimensions = data.fields.filter(f => f.concept === 'DIMENSION');
    const metrics = data.fields.filter(f => f.concept === 'METRIC');
    console.log('Dimensions:', dimensions.map(f => f.name));
    console.log('Metrics:', metrics.map(f => f.name));
  }
  
  // Data analysis
  if (data.dataResponse?.tables?.[0]) {
    const table = data.dataResponse.tables[0];
    console.log('📈 Data rows:', table.rows.length);
    console.log('Field order:', table.fields);
    console.log('Sample rows:', table.rows.slice(0, 3));
  }
  
  // Config analysis
  if (data.config) {
    console.log('⚙️ Config elements:', data.config.data?.[0]?.elements?.map(e => ({
      id: e.id,
      type: e.type,
      value: e.value
    })));
  }
  
  console.groupEnd();
}

// Use in your drawViz function
function drawViz(data) {
  debugDataStructure(data);
  // ... rest of your visualization logic
}
```

### **Common Issues and Solutions**

#### **🚨 Issue: Visualization appears empty**

```javascript
// Problem: Not handling the real data structure
❌ const tableData = data.tables.DEFAULT; // Wrong!

// Solution: Use the correct data path
✅ const tableData = data.dataResponse.tables[0].rows;
```

#### **🚨 Issue: Field names not mapping correctly**

```javascript
// Problem: Using field IDs instead of names
❌ const value = row['qt_abc123']; // Field ID

// Solution: Map IDs to names first
✅ const fieldsMap = {};
   data.fields.forEach(field => {
     fieldsMap[field.id] = field.name;
   });
   const value = row[fieldsMap['qt_abc123']]; // Field name
```

#### **🚨 Issue: Visualization not initializing**

```javascript
// Problem: Using old DSCC pattern
❌ window.dscc.subscribeToData(callback);

// Solution: Use real Looker Studio API
✅ google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);
```

#### **🚨 Issue: No data received**

```javascript
// Check these in order:
1. Console logs - is drawViz being called?
2. Data structure - log the raw data parameter
3. Field configuration - are fields properly configured in viz-config.json?
4. Manifest URL - is it correctly pointing to your GCS bucket?
5. CORS settings - is your bucket publicly readable?
```

### **Browser Console Commands for Debugging**

```javascript
// Inspect global variables (run in browser console)
console.log('Google Looker Studio API:', window.google?.lookerstudio);
console.log('Available methods:', Object.keys(window.google?.lookerstudio || {}));

// Check if visualization is registered
console.log('Visualization registered:', !!window.google?.lookerstudio);

// Inspect the current data (if stored globally for debugging)
console.log('Last data received:', window.lastVisualizationData);
```

---

## ⚡ **Performance and Best Practices**

### **Optimal Rendering Patterns**

```javascript
function drawViz(data) {
  // 1. Early validation
  if (!data?.dataResponse?.tables?.[0]?.rows?.length) {
    renderEmptyState();
    return;
  }
  
  // 2. Data transformation (do once)
  const transformedData = transformData(data);
  
  // 3. Batch DOM updates
  const container = document.getElementById('container');
  container.style.display = 'none'; // Hide during updates
  
  // 4. Clear and render
  container.innerHTML = '';
  renderVisualization(transformedData);
  
  // 5. Show results
  container.style.display = 'block';
  
  // 6. Signal completion
  google.lookerstudio.done();
}
```

### **Memory Management**

```javascript
// Clean up previous visualizations
function cleanupVisualization() {
  // Remove event listeners
  d3.select('#container').selectAll('*').on('.zoom', null);
  
  // Clear intervals/timeouts
  if (window.vizUpdateInterval) {
    clearInterval(window.vizUpdateInterval);
    window.vizUpdateInterval = null;
  }
  
  // Remove SVG elements
  d3.select('#container').selectAll('svg').remove();
}

function drawViz(data) {
  cleanupVisualization(); // Clean first
  // ... render new visualization
}
```

### **Data Processing Optimization**

```javascript
// Efficient data transformation
function transformDataOptimized(data) {
  const table = data.dataResponse.tables[0];
  const fieldIds = table.fields;
  
  // Create field mapping once
  const fieldMap = new Map();
  data.fields.forEach(field => {
    fieldMap.set(field.id, field.name);
  });
  
  // Transform rows efficiently
  return table.rows.map(row => {
    const obj = {};
    for (let i = 0; i < fieldIds.length; i++) {
      obj[fieldMap.get(fieldIds[i])] = row[i];
    }
    return obj;
  });
}
```

### **Error Handling**

```javascript
function drawViz(data) {
  try {
    // Visualization logic
    renderVisualization(data);
    
  } catch (error) {
    console.error('Visualization error:', error);
    
    // Show user-friendly error
    const container = document.getElementById('container');
    container.innerHTML = `
      <div style="padding: 20px; color: red; border: 1px solid red; border-radius: 4px;">
        <h3>Visualization Error</h3>
        <p>Unable to render visualization. Please check your data configuration.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error.stack}</pre>
        </details>
      </div>
    `;
    
  } finally {
    // Always signal completion
    if (window.google?.lookerstudio?.done) {
      google.lookerstudio.done();
    }
  }
}
```

### **Responsive Design**

```javascript
function getContainerDimensions() {
  // Use Looker Studio's dimension functions
  const width = window.google?.lookerstudio?.getWidth?.() || 
                document.body.clientWidth;
  const height = window.google?.lookerstudio?.getHeight?.() || 
                 400; // fallback height
  
  return { width, height };
}

function renderResponsive(data) {
  const { width, height } = getContainerDimensions();
  
  // Adapt visualization to container size
  const svg = d3.select('#container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%')
    .style('height', 'auto');
}
```

---

## 🎯 **Quick Reference**

### **Essential Code Snippets**

```javascript
// Initialization
google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);

// Data extraction
const table = data.dataResponse.tables[0];
const rows = table.rows;
const fieldIds = table.fields;

// Field mapping
const fieldsMap = {};
data.fields.forEach(f => fieldsMap[f.id] = f.name);

// Field access by type
const dimensions = data.fields.filter(f => f.concept === 'DIMENSION');
const metrics = data.fields.filter(f => f.concept === 'METRIC');

// Completion signal
google.lookerstudio.done();
```

### **File Structure Template**

```
your-visualization/
├── manifest.json       # Metadata and resource paths
├── viz-config.json     # Field configuration
├── viz.js             # Main visualization logic
├── viz.css            # Styling
└── README.md          # Documentation
```

### **Looker Studio URL Format**

```
gs://your-bucket/your-visualization-folder
```

**Note**: Looker Studio expects a **folder URL**, not a manifest.json file URL. It automatically looks for `manifest.json` inside the folder.

### **Testing Checklist**

- ✅ Visualization loads without errors
- ✅ Real data appears (not just mock data)
- ✅ All configured fields are used correctly
- ✅ Responsive design works on different screen sizes
- ✅ Error states are handled gracefully
- ✅ Console shows no errors or warnings
- ✅ `google.lookerstudio.done()` is called

**🎉 You now have everything needed to build working Looker Studio Community Visualizations!**
