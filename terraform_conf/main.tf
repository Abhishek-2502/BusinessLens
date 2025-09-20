# VPC
resource "google_compute_network" "vpc_network" {
  name = "terraform-vpc"
}

# VM instances
resource "google_compute_instance" "vm_instances" {
  for_each     = var.instances
  name         = each.key
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = var.image
      size  = 20
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {} # Assigns external IP
  }

  # Assign VM its own tag for port firewall targeting and optional "internal-vpc" tag for internal communication
  tags = ["internal-vpc", each.value.tag]
}

# Internal traffic rule (only VPC-internal)
resource "google_compute_firewall" "instance_internal" {
  for_each = var.instances

  name    = "${each.key}-internal-fw"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = [22, 80, 443, each.value.port]
  }

  source_tags = ["internal-vpc"]       # Only VMs with this tag can access
  target_tags = [each.value.tag]
}

# External traffic rule (internet access)
resource "google_compute_firewall" "instance_external" {
  for_each = var.instances

  name    = "${each.key}-external-fw"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = [each.value.port]       # Only expose the app port externally
  }

  source_ranges = ["0.0.0.0/0"]        # Public internet (can restrict to your IP)
  target_tags   = [each.value.tag]
}

# Optional: External SSH for all instances
resource "google_compute_firewall" "ssh_external" {
  name    = "ssh-external"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = [for k in keys(var.instances) : var.instances[k].tag]
}
