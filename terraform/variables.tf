variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Default region for the Google provider"
  type        = string
  default     = "europe-west1"
}

variable "location" {
  description = "GCS bucket location (e.g., EU, US, europe-west1)"
  type        = string
  default     = "EU"
}

variable "bucket_name" {
  description = "Name of the GCS bucket to create"
  type        = string
}


