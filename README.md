
    Title: Looker Studio Custom Visuals (Community Visualizations)
    Overview:
        Collection of lightweight, privacy‑preserving Looker Studio custom charts.
        Current: viz-bar (Bar with Color field). Planned: viz-line, viz-pie.
    Repo structure:
        viz-bar/ … one viz per folder
        shared/ … optional utilities
        scripts/ … optional deploy helpers
    Requirements:
        Node.js LTS, VS Code (optional Live Server), Google Cloud SDK (gcloud/gsutil), a Google Cloud project, Git.
    Quick start (local):
        cd viz-bar
        npx http-server -p 8080 -c-1
        Open http://127.0.0.1:8080/dev-harness.html
    Deploy (GCS):
        gsutil mb -l EU gs://YOUR_BUCKET
        Update manifest.json resource paths to gs://YOUR_BUCKET/viz-bar/…
        gsutil -h "Cache-Control:no-cache" cp -a public-read viz-bar/manifest.json gs://YOUR_BUCKET/viz-bar
        gsutil -h "Cache-Control:no-cache" cp -a public-read viz-bar/viz.* gs://YOUR_BUCKET/viz-bar
    Add in Looker Studio:
        Insert → Community visualizations → Build your own → Component/Manifest path: gs://YOUR_BUCKET/viz-bar
        Map fields as per each viz’s README.
    Conventions:
        Accessibility: aim for WCAG AA contrast; color‑blind safe defaults.
        Privacy: no external data calls; static assets only.
        Performance: target <150 ms render for ~2k rows; avoid heavy deps.
        Versioning: semantic tags per viz; keep changes backward‑compatible.
    Troubleshooting:
        Blank viz: check Console; confirm dev-harness loads, dscc shim before viz.js.
        Stale code: ensure Cache-Control:no-cache and devMode:true in manifest during dev.
        403/404 from GCS: ensure objects are public-read; paths match manifest.
    License/credits:
        Your chosen license. Acknowledge Google Community Viz APIs.
