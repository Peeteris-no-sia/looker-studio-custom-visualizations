# 🔍 Looker Studio Custom Visualization Debugging Guide

This guide will help you troubleshoot the "config file cannot be found" error and other common issues with your Looker Studio custom visualizations.

## 🚨 Common Issues Fixed

### 1. **Field ID Mismatch (FIXED)**
- **Problem**: The field IDs in `viz-config.json` didn't match what the JavaScript code expected
- **Fix**: Updated field IDs to use proper capitalization: `Category`, `Value`, `Color`
- **File Updated**: `viz-bar/viz-config.json`

### 2. **Missing Debugging Infrastructure (FIXED)**
- **Problem**: No way to see what's happening when visualization fails to load
- **Fix**: Added comprehensive logging system to `viz.js`
- **File Updated**: `viz-bar/viz.js`

## 🛠️ Debugging Tools Created

### 1. Enhanced Visualization (`viz.js`)
The visualization now includes:
```javascript
// Debug mode - set to false for production
const DEBUG_MODE = true;

// Comprehensive logging
debugLog('Environment info', environmentData);
debugDataStructure(data);
debugRenderingContext(width, height, scale, margin, chartW, chartH);
```

### 2. Network Debug Tool (`network-debug.html`)
Open this file in your browser to test resource accessibility:
- Tests all GS:// URLs by converting to HTTP
- Validates JSON files
- Checks CORS configuration
- **Usage**: Open `viz-bar/network-debug.html` in browser

### 3. GCS Permission Scripts
Two scripts to validate your Google Cloud Storage setup:
- **Windows**: `debug-gcs-permissions.ps1`
- **Linux/Mac**: `debug-gcs-permissions.sh`

### 4. Debug Manifest (`manifest-debug.json`)
A separate manifest file with debug labels to help identify issues.

## 🔧 Step-by-Step Debugging Process

### Step 1: Test Local Development
```bash
cd viz-bar
npx http-server -p 8080 -c-1
# Open http://127.0.0.1:8080/dev-harness.html
```
**Expected Result**: Bar chart should render with test data and debug logs in console.

### Step 2: Validate GCS Resources
**Windows:**
```powershell
.\debug-gcs-permissions.ps1
```

**Linux/Mac:**
```bash
./debug-gcs-permissions.sh
```

**What it checks:**
- ✅ Bucket exists and is accessible
- ✅ Files are uploaded correctly
- ✅ Public read permissions are set
- ✅ CORS configuration
- ✅ File content validation

### Step 3: Test Network Accessibility
1. Open `viz-bar/network-debug.html` in browser
2. Click "Test" buttons for each resource
3. Check that all files return HTTP 200 status

### Step 4: Deploy with Terraform
```bash
cd terraform
terraform apply -auto-approve -var "project_id=darbnesis-data-project" -var "bucket_name=darbnesis-viz-assets"
```

### Step 5: Add to Looker Studio
**Manifest URL**: `gs://darbnesis-viz-assets/viz-bar`

## 📋 Browser Console Debugging

When you add the visualization to Looker Studio, open browser dev tools:

### Console Tab
Look for debug messages starting with `[VIZ-BAR-DEBUG]`:
```
[VIZ-BAR-DEBUG] Viz.js script loaded successfully
[VIZ-BAR-DEBUG] DSCC detected - subscribing to data
[VIZ-BAR-DEBUG] === DRAW FUNCTION CALLED ===
[VIZ-BAR-DEBUG] === DATA STRUCTURE DEBUG ===
```

### Network Tab
Check for failed requests:
- ❌ 404 errors = file not found
- ❌ 403 errors = permission issues
- ❌ CORS errors = cross-origin policy problems

## 🔍 Common Error Solutions

### "Config file cannot be found"
**Causes & Solutions:**
1. **Field ID Mismatch**: Fixed in this update
2. **File not uploaded**: Run terraform apply
3. **Wrong permissions**: Run debug script to fix
4. **Invalid JSON**: Check network debug tool

### "Visualization not loading"
**Debug steps:**
1. Check browser console for JavaScript errors
2. Verify all network requests succeed (200 status)
3. Ensure data field mappings match config
4. Check if DSCC library is loading properly

### "Network errors in Looker Studio"
**Solutions:**
1. Verify public read access: `gsutil iam ch allUsers:objectViewer gs://your-bucket`
2. Check CORS configuration
3. Ensure cache headers are set correctly
4. Validate GCS bucket location (should be EU or US)

## 📄 File Structure Overview

```
viz-bar/
├── manifest.json          # Main manifest for Looker Studio
├── manifest-debug.json    # Debug version with verbose labels
├── viz-config.json        # Field configuration (FIXED)
├── viz.js                 # Visualization code with debugging
├── viz.css               # Styles
├── dev-harness.html      # Local development test
└── network-debug.html    # Network connectivity tester

Root/
├── debug-gcs-permissions.ps1  # Windows debug script
├── debug-gcs-permissions.sh   # Linux/Mac debug script
└── DEBUG-GUIDE.md            # This file
```

## 🚀 Quick Fix Commands

If you're still having issues, try these commands:

```bash
# 1. Re-upload with correct headers
gsutil -h "Cache-Control:no-cache" -h "Content-Type:application/json" cp -a public-read viz-bar/manifest.json gs://darbnesis-viz-assets/viz-bar/
gsutil -h "Cache-Control:no-cache" -h "Content-Type:application/json" cp -a public-read viz-bar/viz-config.json gs://darbnesis-viz-assets/viz-bar/
gsutil -h "Cache-Control:no-cache" -h "Content-Type:application/javascript" cp -a public-read viz-bar/viz.js gs://darbnesis-viz-assets/viz-bar/
gsutil -h "Cache-Control:no-cache" -h "Content-Type:text/css" cp -a public-read viz-bar/viz.css gs://darbnesis-viz-assets/viz-bar/

# 2. Ensure public access
gsutil iam ch allUsers:objectViewer gs://darbnesis-viz-assets

# 3. Test accessibility
curl -I https://storage.googleapis.com/darbnesis-viz-assets/viz-bar/manifest.json
```

## 📞 Still Need Help?

1. **Check the console**: Look for `[VIZ-BAR-DEBUG]` messages
2. **Run debug scripts**: Use the PowerShell or bash scripts provided
3. **Test network access**: Use the network-debug.html tool
4. **Verify field mappings**: Ensure your data has Category and Value fields

## 🎯 Expected Outcome

After following this guide:
- ✅ Local development harness works
- ✅ All GCS files are accessible via HTTP
- ✅ Looker Studio loads the visualization without errors
- ✅ Data renders correctly in the bar chart
- ✅ Debug logs provide clear information about any issues

## 🔄 Turn Off Debug Mode

Once everything is working, set `DEBUG_MODE = false` in `viz.js` before production use.
