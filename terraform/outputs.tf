output "looker_manifest_paths" {
  description = "Folder URLs to use in Looker Studio (Looker Studio looks for manifest.json inside these folders)"
  value = {
    bar_chart = "gs://${google_storage_bucket.viz.name}/viz-bar"
    line_chart = "gs://${google_storage_bucket.viz.name}/viz-line"
    test_viz = "gs://${google_storage_bucket.viz.name}/viz-test"
  }
}


