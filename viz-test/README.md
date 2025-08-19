# 🎯 Test Visualization - WORKING SOLUTION

> **✅ This is the VERIFIED WORKING Looker Studio Community Visualization pattern that connects to real data!**

## 🚀 **What This Demonstrates**

This test visualization showcases the **real, working API patterns** for Looker Studio Community Visualizations in 2024:

- ✅ **Real data connection** using `google.lookerstudio.registerVisualization`
- ✅ **Correct data parsing** from `data.dataResponse.tables[0].rows`
- ✅ **Dynamic field mapping** supporting any number of dimensions/metrics
- ✅ **Universal pattern** that works for bar charts, line charts, pie charts, tables

## 📊 **Live Demo**

When deployed, this visualization shows:

1. **📋 Dynamic table** displaying all your data fields
2. **📊 Field type indicators** (📊 for dimensions, 📈 for metrics)
3. **🔧 Developer guide** showing how to access fields for different chart types
4. **🔍 Debug information** to understand the data structure

## 🎯 **Key Files**

- **`manifest.json`** - Visualization metadata and resource paths
- **`viz-config.json`** - Field configuration (dimension + metric)
- **`viz.js`** - ✅ **WORKING** data parsing and rendering logic
- **`viz.css`** - Basic styling for the table display

## 🔧 **The Working API Pattern**

### **1. Initialization (CORRECT)**
```javascript
// ✅ This actually works in 2024
google.lookerstudio.registerVisualization(drawViz, google.lookerstudio.objectTransform);
```

### **2. Data Structure (REAL FORMAT)**
```javascript
// ✅ Real data structure from Looker Studio
{
  "dataResponse": {
    "tables": [{
      "id": "DEFAULT",
      "fields": ["qt_abc123", "qt_def456"],
      "rows": [
        ["Company A", "100000"],
        ["Company B", "150000"]
      ]
    }]
  },
  "fields": [
    {"id": "qt_abc123", "name": "company_name", "concept": "DIMENSION"},
    {"id": "qt_def456", "name": "salary", "concept": "METRIC"}
  ]
}
```

### **3. Universal Data Parsing**
```javascript
function drawViz(data) {
  // Extract the real data structure
  const table = data.dataResponse.tables[0];
  const rawRows = table.rows || [];
  const fieldIds = table.fields || [];
  
  // Create field mapping
  const fieldsMap = {};
  data.fields.forEach(field => {
    fieldsMap[field.id] = field.name;
  });
  
  // Convert to usable objects
  const tableData = rawRows.map(row => {
    const rowObj = {};
    fieldIds.forEach((fieldId, index) => {
      const fieldName = fieldsMap[fieldId];
      rowObj[fieldName] = row[index];
    });
    return rowObj;
  });
  
  // Get field mappings for any visualization type
  const fieldMappings = {
    dimensions: data.fields.filter(f => f.concept === 'DIMENSION'),
    metrics: data.fields.filter(f => f.concept === 'METRIC')
  };
  
  // Access fields for different chart types
  const category = fieldMappings.dimensions[0]?.name;  // Bar chart category
  const value = fieldMappings.metrics[0]?.name;        // Bar chart value  
  const color = fieldMappings.dimensions[1]?.name;     // Bar chart color
  
  // Render your visualization...
}
```

## 📈 **Adaptation for Different Chart Types**

### **📊 Bar Chart with Color**
```javascript
const category = fieldMappings.dimensions[0]?.name;   // X-axis categories
const value = fieldMappings.metrics[0]?.name;         // Bar heights
const color = fieldMappings.dimensions[1]?.name;      // Color grouping
```

### **📈 Line Chart**
```javascript
const xAxis = fieldMappings.dimensions[0]?.name;      // Time/category axis
const yAxis = fieldMappings.metrics[0]?.name;         // Values
const series = fieldMappings.dimensions[1]?.name;     // Multiple lines
```

### **🥧 Pie Chart**
```javascript
const labels = fieldMappings.dimensions[0]?.name;     // Slice labels
const values = fieldMappings.metrics[0]?.name;        // Slice sizes
```

### **📋 Table (All Fields)**
```javascript
const allFieldNames = Object.keys(tableData[0]);     // All columns
// Render dynamically based on available fields
```

## 🚀 **Deployment**

Deploy using the Terraform configuration in the project root:

```bash
cd ../terraform
terraform apply -var "project_id=your-project" -var "bucket_name=your-bucket"
```

Then use this folder URL in Looker Studio:
```
gs://your-bucket/viz-test
```

## 🔍 **Debugging Features**

This test visualization includes extensive debugging tools:

1. **📊 Data structure logging** - See exactly what Looker Studio sends
2. **🔧 Field access examples** - Learn patterns for different chart types
3. **📈 Dynamic rendering** - Handle any field configuration automatically
4. **🔍 Raw data inspector** - Debug transformation issues

## ✅ **Success Indicators**

When working correctly, you'll see these console logs:

```
🎉 FOUND REAL LOOKER STUDIO API! Using registerVisualization...
✅ Successfully registered with google.lookerstudio.registerVisualization  
📨 Received message from parent: MessageEvent
🎉 Found REAL Looker Studio data format!
📊 Raw rows: [["Company A", "100000"], ...]
📊 Converted table data: [{company_name: "Company A", salary: "100000"}, ...]
🔍 Available dimensions: ["company_name"]
🔍 Available metrics: ["salary"]
```

## 🎯 **Copy This Pattern**

This test visualization serves as the **reference implementation**. Copy the patterns from `viz.js` to create:

- Bar charts with color fields
- Line charts with multiple series  
- Pie charts with dynamic data
- Tables with any field configuration
- Any custom visualization type

**This is the proven, working foundation for all Looker Studio Community Visualizations!** 🎉
