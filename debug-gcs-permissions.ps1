# =============================================================================
# GCS Permissions and Looker Studio Viz Debug Script (PowerShell)
# =============================================================================

param(
    [string]$BucketName = "darbnesis-viz-assets",
    [string]$ProjectId = "darbnesis-data-project",
    [string]$VizFolder = "viz-bar"
)

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    switch ($Status) {
        "OK" { Write-ColorOutput "✅ $Message" "Green" }
        "WARN" { Write-ColorOutput "⚠️  $Message" "Yellow" }
        "ERROR" { Write-ColorOutput "❌ $Message" "Red" }
    }
}

function Test-Url {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-ColorOutput "`nTesting: $Description" "Blue"
    Write-Host "URL: $Url"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Status "OK" "$Description is accessible"
            Write-Host "Headers:"
            $response.Headers.GetEnumerator() | ForEach-Object {
                Write-Host "  $($_.Key): $($_.Value)"
            }
        } else {
            Write-Status "ERROR" "$Description returned status $($response.StatusCode)"
        }
    }
    catch {
        Write-Status "ERROR" "$Description is NOT accessible - $($_.Exception.Message)"
    }
}

Write-ColorOutput "🔍 Looker Studio Visualization Debug Script" "Blue"
Write-ColorOutput "================================================" "Blue"
Write-Host ""

Write-ColorOutput "📋 Checking Prerequisites..." "Yellow"

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Status "OK" "gcloud CLI is installed"
}
catch {
    Write-Status "ERROR" "gcloud CLI is not installed or not in PATH"
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if authenticated
try {
    $activeAccount = & gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null | Select-Object -First 1
    if ($activeAccount) {
        Write-Status "OK" "Authenticated as: $activeAccount"
    } else {
        Write-Status "ERROR" "Not authenticated with gcloud. Run: gcloud auth login"
        exit 1
    }
}
catch {
    Write-Status "ERROR" "Failed to check authentication status"
    exit 1
}

# Check current project
try {
    $currentProject = & gcloud config get-value project 2>$null
    if ($currentProject -eq $ProjectId) {
        Write-Status "OK" "Current project: $currentProject"
    } else {
        Write-Status "WARN" "Current project is '$currentProject', expected '$ProjectId'"
        Write-Host "Run: gcloud config set project $ProjectId"
    }
}
catch {
    Write-Status "WARN" "Could not determine current project"
}

Write-ColorOutput "`n🗂️  Checking Bucket and Files..." "Yellow"

# Check if bucket exists
try {
    $null = & gsutil ls "gs://$BucketName" 2>$null
    Write-Status "OK" "Bucket gs://$BucketName exists"
}
catch {
    Write-Status "ERROR" "Bucket gs://$BucketName does not exist"
    Write-Host "Create with: gsutil mb -l EU gs://$BucketName"
    exit 1
}

# List files in viz folder
Write-ColorOutput "`nFiles in gs://$BucketName/$VizFolder/:" "Blue"
try {
    & gsutil ls -la "gs://$BucketName/$VizFolder/"
}
catch {
    Write-Status "ERROR" "No files found in gs://$BucketName/$VizFolder/"
}

Write-ColorOutput "`n🔐 Checking Permissions..." "Yellow"

# Check bucket IAM
Write-ColorOutput "`nBucket IAM Policy:" "Blue"
try {
    $iamPolicy = & gsutil iam get "gs://$BucketName" | ConvertFrom-Json
    $iamPolicy | ConvertTo-Json -Depth 10
    
    # Check for public access
    $hasPublicAccess = $false
    foreach ($binding in $iamPolicy.bindings) {
        if ($binding.role -eq "roles/storage.objectViewer" -and $binding.members -contains "allUsers") {
            $hasPublicAccess = $true
            break
        }
    }
    
    if ($hasPublicAccess) {
        Write-Status "OK" "Public read access is configured"
    } else {
        Write-Status "ERROR" "Public read access is NOT configured"
        Write-Host "Fix with: gsutil iam ch allUsers:objectViewer gs://$BucketName"
    }
}
catch {
    Write-Status "ERROR" "Failed to check IAM policy"
}

Write-ColorOutput "`n🌐 Testing HTTP Accessibility..." "Yellow"

# Test each required file
$files = @("manifest.json", "viz.js", "viz-config.json", "viz.css")
foreach ($file in $files) {
    $httpUrl = "https://storage.googleapis.com/$BucketName/$VizFolder/$file"
    Test-Url -Url $httpUrl -Description $file
}

Write-ColorOutput "`n📄 Validating File Contents..." "Yellow"

# Validate manifest.json
Write-ColorOutput "`nValidating manifest.json:" "Blue"
$manifestUrl = "https://storage.googleapis.com/$BucketName/$VizFolder/manifest.json"
try {
    $manifestContent = Invoke-RestMethod -Uri $manifestUrl -UseBasicParsing
    Write-Status "OK" "manifest.json is valid JSON"
    Write-Host "Content preview:"
    $manifestContent | ConvertTo-Json -Depth 5 | Select-Object -First 20
}
catch {
    Write-Status "ERROR" "manifest.json is invalid JSON or not accessible"
}

# Validate viz-config.json
Write-ColorOutput "`nValidating viz-config.json:" "Blue"
$configUrl = "https://storage.googleapis.com/$BucketName/$VizFolder/viz-config.json"
try {
    $configContent = Invoke-RestMethod -Uri $configUrl -UseBasicParsing
    Write-Status "OK" "viz-config.json is valid JSON"
    Write-Host "Content:"
    $configContent | ConvertTo-Json -Depth 5
}
catch {
    Write-Status "ERROR" "viz-config.json is invalid JSON or not accessible"
}

Write-ColorOutput "`n🔧 CORS Configuration..." "Yellow"

# Check CORS settings
Write-ColorOutput "`nCORS Configuration:" "Blue"
try {
    & gsutil cors get "gs://$BucketName"
}
catch {
    Write-Status "WARN" "Could not retrieve CORS configuration"
}

Write-ColorOutput "`n📊 Summary and Recommendations..." "Yellow"

Write-ColorOutput "`n✅ If all checks passed, your manifest URL for Looker Studio is:" "Blue"
Write-ColorOutput "gs://$BucketName/$VizFolder" "Green"

Write-ColorOutput "`n🔍 If you're still having issues:" "Blue"
Write-Host "1. Open browser dev tools in Looker Studio"
Write-Host "2. Check the Console tab for JavaScript errors"
Write-Host "3. Check the Network tab for failed requests"
Write-Host "4. Ensure field mappings match between viz-config.json and your data"

Write-ColorOutput "`n🚀 Quick fix commands:" "Blue"
Write-Host "# Re-upload with correct permissions and headers:"
Write-Host "gsutil -h `"Cache-Control:no-cache`" -h `"Content-Type:application/json`" cp -a public-read $VizFolder/manifest.json gs://$BucketName/$VizFolder/"
Write-Host "gsutil -h `"Cache-Control:no-cache`" -h `"Content-Type:application/json`" cp -a public-read $VizFolder/viz-config.json gs://$BucketName/$VizFolder/"
Write-Host "gsutil -h `"Cache-Control:no-cache`" -h `"Content-Type:application/javascript`" cp -a public-read $VizFolder/viz.js gs://$BucketName/$VizFolder/"
Write-Host "gsutil -h `"Cache-Control:no-cache`" -h `"Content-Type:text/css`" cp -a public-read $VizFolder/viz.css gs://$BucketName/$VizFolder/"

Write-ColorOutput "`n🎉 Debug script completed!" "Green"
