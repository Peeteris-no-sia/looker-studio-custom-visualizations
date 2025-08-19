# 🚀 Terraform Deployment for Looker Studio Community Visualizations

> **✅ Proven infrastructure for deploying working Looker Studio Community Visualizations to Google Cloud Storage**

## 🎯 **What This Deploys**

This Terraform configuration creates the complete infrastructure for hosting Looker Studio Community Visualizations:

- **📦 Google Cloud Storage bucket** with public read access
- **🌐 CORS configuration** for cross-origin requests from Looker Studio
- **📊 Multiple visualizations** (bar chart, line chart, test visualization)
- **🔗 Manifest files** ready for Looker Studio integration

## 🚀 **Quick Start**

### **1. Prerequisites**

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# Authenticate with Google Cloud
gcloud auth application-default login
```

### **2. Deploy Infrastructure**

```bash
# Initialize Terraform
terraform init

# Deploy with your project settings
terraform apply \
  -var "project_id=your-gcp-project-id" \
  -var "bucket_name=your-unique-bucket-name"
```

### **3. Get Manifest URLs**

After deployment, Terraform outputs the manifest URLs:

```bash
# View the manifest paths
terraform output looker_manifest_paths
```

## 📊 **Deployed Visualizations**

| Visualization | Manifest URL | Status |
|---------------|--------------|---------|
| **🎯 Test Viz** | `gs://bucket/viz-test-manifest.json` | ✅ **Working with real data** |
| **📊 Bar Chart** | `gs://bucket/viz-bar-manifest.json` | 🔄 Being updated with working patterns |
| **📈 Line Chart** | `gs://bucket/viz-line-manifest.json` | 🔄 Being updated with working patterns |

## 🔧 **Configuration Variables**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `project_id` | Google Cloud Project ID | `my-data-project` | ✅ Yes |
| `bucket_name` | Unique GCS bucket name | `my-viz-assets` | ✅ Yes |

## 📁 **File Structure**

The Terraform configuration deploys these files to GCS:

```
gs://your-bucket/
├── viz-test/
│   ├── manifest.json         # ✅ Working visualization metadata
│   ├── viz.js               # ✅ Real data parsing logic
│   ├── viz-config.json      # Field configuration
│   └── viz.css              # Styling
├── viz-bar/
│   ├── manifest.json         # Bar chart metadata
│   ├── viz.js               # Bar chart logic (being updated)
│   ├── viz-config.json      # Category, Value, Color fields
│   └── viz.css              # Bar chart styling
├── viz-line/
│   └── ...                  # Line chart files
├── viz-test-manifest.json   # ✅ Root manifest for test viz
├── viz-bar-manifest.json    # Root manifest for bar chart
└── viz-line-manifest.json   # Root manifest for line chart
```

## 🌐 **Infrastructure Details**

### **Google Cloud Storage Bucket**
- **Public read access** for Looker Studio
- **CORS enabled** for cross-origin requests
- **Cache control** set to no-cache for development
- **Content types** properly configured (JS, JSON, CSS)

### **Security Configuration**
```hcl
# Public read access for Looker Studio
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.viz.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# CORS configuration for web access
cors {
  origin          = ["*"]
  method          = ["GET", "HEAD"]
  response_header = ["*"]
  max_age_seconds = 3600
}
```

## 🎯 **Using in Looker Studio**

### **1. Add Community Visualization**
1. Open Looker Studio
2. Add Chart → Community Visualizations  
3. Click "Explore more" → "Build your own visualization"

### **2. Use Manifest URL**
```
gs://your-bucket-name/viz-test-manifest.json
```

### **3. Configure Fields**
- **Dimension**: Select your category field
- **Metric**: Select your value field

### **4. See Real Data** 🎉
The test visualization will display your actual data with:
- Dynamic table showing all fields
- Field type indicators (📊 dimensions, 📈 metrics)  
- Developer guide for accessing fields
- Debug information

## 🔄 **Updates and Development**

### **Continuous Deployment**
```bash
# Update visualization files and redeploy
terraform apply -auto-approve \
  -var "project_id=your-project" \
  -var "bucket_name=your-bucket"
```

### **File Watching**
The Terraform configuration automatically detects changes to:
- `../viz-test/*` files
- `../viz-bar/*` files  
- `../viz-line/*` files

## 🔍 **Troubleshooting**

### **Issue: "Manifest not found"**
```bash
# Check bucket contents
gsutil ls gs://your-bucket-name/

# Verify public access
gsutil iam get gs://your-bucket-name/
```

### **Issue: "CORS errors"**
The Terraform configuration includes proper CORS settings. If issues persist:
```bash
# Re-apply CORS configuration
terraform apply -replace="google_storage_bucket.viz"
```

### **Issue: "Visualization not loading"**
Check the browser console for errors. The test visualization includes extensive debugging.

## 📊 **Monitoring and Logs**

### **GCS Access Logs**
Access logs are automatically generated for the bucket to monitor usage.

### **Visualization Debugging**
The test visualization includes comprehensive console logging:
```javascript
console.log('🎉 FOUND REAL LOOKER STUDIO API!');
console.log('📊 Raw data:', data);
console.log('🔍 Field mappings:', fieldMappings);
```

## 🎯 **Next Steps**

1. **Deploy the infrastructure** with your project settings
2. **Test with the working visualization** (viz-test)
3. **Update other visualizations** with the proven patterns
4. **Develop custom visualizations** using the working foundation

## 📚 **Resources**

- **Working Test Visualization**: `../viz-test/` - Copy these patterns
- **Google Cloud Storage**: [Official Documentation](https://cloud.google.com/storage)
- **Terraform GCP Provider**: [Documentation](https://registry.terraform.io/providers/hashicorp/google)

**🎉 This infrastructure is proven to work with real Looker Studio data!**