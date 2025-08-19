#!/bin/bash

# =============================================================================
# GCS Permissions and Looker Studio Viz Debug Script
# =============================================================================

set -e

# Configuration
BUCKET_NAME="darbnesis-viz-assets"
PROJECT_ID="darbnesis-data-project"
VIZ_FOLDER="viz-bar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Looker Studio Visualization Debug Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Function to test URL accessibility
test_url() {
    local url=$1
    local description=$2
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    
    if curl -s -I "$url" | head -n 1 | grep -q "200 OK"; then
        print_status "OK" "$description is accessible"
        # Get headers
        echo "Headers:"
        curl -s -I "$url" | sed 's/^/  /'
    else
        print_status "ERROR" "$description is NOT accessible"
        echo "Response:"
        curl -s -I "$url" | sed 's/^/  /'
    fi
}

echo -e "${YELLOW}📋 Checking Prerequisites...${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    print_status "ERROR" "gcloud CLI is not installed"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    print_status "ERROR" "Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
fi

# Check if project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_status "WARN" "Current project is '$CURRENT_PROJECT', expected '$PROJECT_ID'"
    echo "Run: gcloud config set project $PROJECT_ID"
fi

print_status "OK" "Prerequisites check complete"

echo -e "\n${YELLOW}🗂️  Checking Bucket and Files...${NC}"

# Check if bucket exists
if gsutil ls "gs://$BUCKET_NAME" > /dev/null 2>&1; then
    print_status "OK" "Bucket gs://$BUCKET_NAME exists"
else
    print_status "ERROR" "Bucket gs://$BUCKET_NAME does not exist"
    echo "Create with: gsutil mb -l EU gs://$BUCKET_NAME"
    exit 1
fi

# Check bucket location
BUCKET_LOCATION=$(gsutil ls -L -b "gs://$BUCKET_NAME" | grep "Location constraint:" | awk '{print $3}')
echo "Bucket location: $BUCKET_LOCATION"

# List files in viz folder
echo -e "\n${BLUE}Files in gs://$BUCKET_NAME/$VIZ_FOLDER/:${NC}"
if gsutil ls "gs://$BUCKET_NAME/$VIZ_FOLDER/" > /dev/null 2>&1; then
    gsutil ls -la "gs://$BUCKET_NAME/$VIZ_FOLDER/"
else
    print_status "ERROR" "No files found in gs://$BUCKET_NAME/$VIZ_FOLDER/"
fi

echo -e "\n${YELLOW}🔐 Checking Permissions...${NC}"

# Check bucket IAM
echo -e "\n${BLUE}Bucket IAM Policy:${NC}"
gsutil iam get "gs://$BUCKET_NAME"

# Check if allUsers has objectViewer role
if gsutil iam get "gs://$BUCKET_NAME" | grep -q "allUsers" && gsutil iam get "gs://$BUCKET_NAME" | grep -q "roles/storage.objectViewer"; then
    print_status "OK" "Public read access is configured"
else
    print_status "ERROR" "Public read access is NOT configured"
    echo "Fix with: gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME"
fi

echo -e "\n${YELLOW}🌐 Testing HTTP Accessibility...${NC}"

# Test each required file
FILES=("manifest.json" "viz.js" "viz-config.json" "viz.css")
for file in "${FILES[@]}"; do
    HTTP_URL="https://storage.googleapis.com/$BUCKET_NAME/$VIZ_FOLDER/$file"
    test_url "$HTTP_URL" "$file"
done

echo -e "\n${YELLOW}📄 Validating File Contents...${NC}"

# Validate manifest.json
echo -e "\n${BLUE}Validating manifest.json:${NC}"
MANIFEST_URL="https://storage.googleapis.com/$BUCKET_NAME/$VIZ_FOLDER/manifest.json"
if curl -s "$MANIFEST_URL" | jq . > /dev/null 2>&1; then
    print_status "OK" "manifest.json is valid JSON"
    echo "Content preview:"
    curl -s "$MANIFEST_URL" | jq . | head -20
else
    print_status "ERROR" "manifest.json is invalid JSON or not accessible"
fi

# Validate viz-config.json
echo -e "\n${BLUE}Validating viz-config.json:${NC}"
CONFIG_URL="https://storage.googleapis.com/$BUCKET_NAME/$VIZ_FOLDER/viz-config.json"
if curl -s "$CONFIG_URL" | jq . > /dev/null 2>&1; then
    print_status "OK" "viz-config.json is valid JSON"
    echo "Content preview:"
    curl -s "$CONFIG_URL" | jq .
else
    print_status "ERROR" "viz-config.json is invalid JSON or not accessible"
fi

# Check JavaScript file
echo -e "\n${BLUE}Validating viz.js:${NC}"
JS_URL="https://storage.googleapis.com/$BUCKET_NAME/$VIZ_FOLDER/viz.js"
JS_SIZE=$(curl -s -I "$JS_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
if [ -n "$JS_SIZE" ] && [ "$JS_SIZE" -gt 1000 ]; then
    print_status "OK" "viz.js exists and has reasonable size ($JS_SIZE bytes)"
else
    print_status "ERROR" "viz.js is missing or too small"
fi

echo -e "\n${YELLOW}🔧 CORS Configuration...${NC}"

# Check CORS settings
echo -e "\n${BLUE}CORS Configuration:${NC}"
gsutil cors get "gs://$BUCKET_NAME"

echo -e "\n${YELLOW}📊 Summary and Recommendations...${NC}"

echo -e "\n${BLUE}✅ If all checks passed, your manifest URL for Looker Studio is:${NC}"
echo -e "${GREEN}gs://$BUCKET_NAME/$VIZ_FOLDER${NC}"

echo -e "\n${BLUE}🔍 If you're still having issues:${NC}"
echo "1. Open browser dev tools in Looker Studio"
echo "2. Check the Console tab for JavaScript errors"
echo "3. Check the Network tab for failed requests"
echo "4. Ensure field mappings match between viz-config.json and your data"

echo -e "\n${BLUE}🚀 Quick fix commands:${NC}"
echo "# Re-upload with correct permissions and headers:"
echo "gsutil -h \"Cache-Control:no-cache\" -h \"Content-Type:application/json\" cp -a public-read $VIZ_FOLDER/manifest.json gs://$BUCKET_NAME/$VIZ_FOLDER/"
echo "gsutil -h \"Cache-Control:no-cache\" -h \"Content-Type:application/json\" cp -a public-read $VIZ_FOLDER/viz-config.json gs://$BUCKET_NAME/$VIZ_FOLDER/"
echo "gsutil -h \"Cache-Control:no-cache\" -h \"Content-Type:application/javascript\" cp -a public-read $VIZ_FOLDER/viz.js gs://$BUCKET_NAME/$VIZ_FOLDER/"
echo "gsutil -h \"Cache-Control:no-cache\" -h \"Content-Type:text/css\" cp -a public-read $VIZ_FOLDER/viz.css gs://$BUCKET_NAME/$VIZ_FOLDER/"

echo -e "\n${GREEN}🎉 Debug script completed!${NC}"
