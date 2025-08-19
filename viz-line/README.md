Title: Line (Series) — Looker Studio Community Visualization

What it does:
- Renders an SVG line chart with optional series dimension and markers.
- Inherits visual rules from `viz-bar`: privacy-first, fast, dynamic typography, fixed palette cycling.

Fields:
- X: dimension (required)
- Value: metric (required)
- Series: dimension (optional)

Local development:
- npx http-server -p 8080 -c-1 in viz-line/
- Open http://127.0.0.1:8080/dev-harness.html

Deploy:
- Update `manifest.json` paths to your GCS bucket.

Use:
- Insert → Community visualizations → Build your own → gs://YOUR_BUCKET/viz-line


