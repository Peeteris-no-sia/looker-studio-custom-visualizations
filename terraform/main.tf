terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  bar_files  = setunion(setunion(fileset("${path.module}/../viz-bar", "manifest.json"), fileset("${path.module}/../viz-bar", "viz.*")), fileset("${path.module}/../viz-bar", "viz-config.json"))
  line_files = setunion(setunion(fileset("${path.module}/../viz-line", "manifest.json"), fileset("${path.module}/../viz-line", "viz.*")), fileset("${path.module}/../viz-line", "viz-config.json"))
  content_types = {
    "manifest.json"  = "application/json"
    "viz-config.json" = "application/json"
    "viz.js"          = "application/javascript"
    "viz.css"         = "text/css"
  }
}

resource "google_storage_bucket" "viz" {
  name                        = var.bucket_name
  location                    = var.location
  uniform_bucket_level_access = true
  public_access_prevention    = "inherited"  # allow public objects via IAM below

  cors {
    origin          = [
      "https://lookerstudio.google.com",
      "https://datastudio.google.com"
    ]
    method          = ["GET"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.viz.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_object" "bar_files" {
  for_each      = local.bar_files
  bucket        = google_storage_bucket.viz.name
  name          = "viz-bar/${each.value}"
  source        = "${path.module}/../viz-bar/${each.value}"
  cache_control = "no-cache"
  content_type  = lookup(local.content_types, each.value, null)
  depends_on    = [google_storage_bucket.viz]
}

resource "google_storage_bucket_object" "line_files" {
  for_each      = local.line_files
  bucket        = google_storage_bucket.viz.name
  name          = "viz-line/${each.value}"
  source        = "${path.module}/../viz-line/${each.value}"
  cache_control = "no-cache"
  content_type  = lookup(local.content_types, each.value, null)
  depends_on    = [google_storage_bucket.viz]
}

# Upload manifest files to root for easier access
resource "google_storage_bucket_object" "bar_manifest_root" {
  bucket        = google_storage_bucket.viz.name
  name          = "viz-bar-manifest.json"
  source        = "${path.module}/../viz-bar/manifest.json"
  cache_control = "no-cache"
  content_type  = "application/json"
  depends_on    = [google_storage_bucket.viz]
}

resource "google_storage_bucket_object" "line_manifest_root" {
  bucket        = google_storage_bucket.viz.name
  name          = "viz-line-manifest.json"
  source        = "${path.module}/../viz-line/manifest.json"
  cache_control = "no-cache"
  content_type  = "application/json"
  depends_on    = [google_storage_bucket.viz]
}


