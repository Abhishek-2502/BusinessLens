output "instance_ips" {
  description = "Public IPs of all instances"
  value       = { for name, vm in google_compute_instance.vm_instances : name => vm.network_interface[0].access_config[0].nat_ip }
}

output "internal_firewall_rules" {
  description = "Internal firewall rules"
  value       = [for fw in google_compute_firewall.instance_internal : fw.name]
}

output "external_firewall_rules" {
  description = "External firewall rules"
  value       = [for fw in google_compute_firewall.instance_external : fw.name]
}

output "ssh_firewall_rule" {
  description = "SSH firewall rule"
  value       = google_compute_firewall.ssh_external.name
}
