Terraform deployment for Looker Studio Community Visualizations

Prereqs
- Google Cloud project with billing enabled (e.g., `darbnesis-data-project`)
- Google Cloud SDK installed and on PATH
- Terraform installed

Usage
1) Authenticate and select your project (PowerShell):
   - `gcloud config set project darbnesis-data-project`
   - `gcloud auth application-default login`
2) From this `terraform/` folder:
   - `terraform init`
   - `terraform apply -auto-approve -var "project_id=darbnesis-data-project" -var "bucket_name=darbnesis-viz-assets"`

What it does
- Creates a GCS bucket (`google_storage_bucket.viz`)
- Grants public read on objects (so Looker Studio can fetch files)
- Uploads `viz-bar/manifest.json`, `viz-bar/viz.*`, and the same for `viz-line/`, with `Cache-Control: no-cache`

After apply
- Get manifest paths:
  - `terraform output looker_manifest_paths`
- Optional: verify objects are public (open in browser):
  - `https://storage.googleapis.com/darbnesis-viz-assets/viz-bar/manifest.json`
  - `https://storage.googleapis.com/darbnesis-viz-assets/viz-line/manifest.json`
- In Looker Studio: Insert → Community visualizations → Build your own → use manifest path(s):
  - `gs://darbnesis-viz-assets/viz-bar`
  - `gs://darbnesis-viz-assets/viz-line`

Notes
- Bucket `location` defaults to `EU`; change via `-var "location=US"` if needed.
- Bucket names are globally unique and lowercase; change `darbnesis-viz-assets` if it collides.
- Files are uploaded from `../viz-bar` and `../viz-line` relative to this folder.
- To update visuals later, re-run the same `terraform apply` after editing files.

Troubleshooting
- If public access is blocked by org policy, the legend will fail to load in Looker Studio. Options:
  - Ask an admin to allow object-level public access for this bucket, or
  - Host via HTTPS on a public site/Cloud CDN and point Looker Studio to that manifest URL.

