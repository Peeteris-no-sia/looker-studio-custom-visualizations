
    Title: Bar (Color field) — Looker Studio Community Visualization
    What it does:
        Renders a simple SVG bar chart.
        Uses an optional Color dimension (HEX or rgb()) per category. Invalid/missing values fall back to deterministic HSL by category.
    Fields:
        Category: dimension (required)
        Value: metric (required)
        Color: dimension, text (optional; accepts #RRGGBB, #RGB, rgb(r,g,b))
    Features:
        Theme‑agnostic; fast; no external calls; deterministic fallback palette.
    Limitations:
        One metric; no stacked bars; minimal axes/labels in this starter.
    Local development:
        npx http-server -p 8080 -c-1 in viz-bar/
        Open http://127.0.0.1:8080/dev-harness.html
        Edit viz.js; auto‑refresh will show changes. Console logs: “viz.js loaded”, “draw called”.
    Deploy:
        Update manifest.json resource paths to gs://YOUR_BUCKET/viz-bar/…
        gsutil -h "Cache-Control:no-cache" cp -a public-read manifest.json gs://YOUR_BUCKET/viz-bar
        gsutil -h "Cache-Control:no-cache" cp -a public-read viz.* gs://YOUR_BUCKET/viz-bar
    Use in Looker Studio:
        Insert → Community visualizations → Build your own → gs://YOUR_BUCKET/viz-bar
        Map Category, Value, optional Color. Test with filters/sorts.
    Accessibility notes:
        Ensure text/background contrast when adding labels; prefer user‑provided colors that meet WCAG.
    Roadmap:
        Axes/labels, tooltips, responsive margins, series totals, color‑blind friendly presets.
    Changelog:
        0.1.0: Initial release.
