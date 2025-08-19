output "looker_manifest_paths" {
  description = "Manifest paths to use in Looker Studio"
  value = [
    "gs://${google_storage_bucket.viz.name}/viz-bar",
    "gs://${google_storage_bucket.viz.name}/viz-line",
    "gs://${google_storage_bucket.viz.name}/viz-test",
  ]
}


