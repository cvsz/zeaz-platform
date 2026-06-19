resource "local_file" "traefik_dynamic_config" {
  filename = "${path.module}/../../infra/traefik/dynamic.yml"
  content = templatefile("${path.module}/dynamic.yml.tpl", {
    allowed_origins = var.allowed_origins
  })
}
