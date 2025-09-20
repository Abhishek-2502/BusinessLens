variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "machine_type" {
  description = "Machine type for VM"
  type        = string
  default     = "e2-medium"
}

variable "image" {
  description = "Disk image to use for VM"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2204-lts"
}

variable "credentials_file" {
  description = "Path to the GCP service account credentials JSON file"
  type        = string
}

# Map of instances and ports
variable "instances" {
  description = "Map of instances with port and network tag"
  type = map(object({
    port = number
    tag  = string
  }))
  default = {
    "instance1-backend" = { port = 5000, tag = "backend-port" }
    "instance1-frontend" = { port = 5173, tag = "frontend-port" }
    "instance1-jenkins"  = { port = 8080, tag = "jenkins-port" }
  }
}

