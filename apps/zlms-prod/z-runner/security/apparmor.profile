#include <tunables/global>

profile z-runner flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  capability net_bind_service,
  deny capability sys_admin,
  deny capability sys_module,
  deny capability sys_ptrace,
  deny mount,
  deny /proc/sys/** rwklx,
  deny /sys/** rwklx,
  /opt/z-runner/** rix,
  /var/lib/z-runner/** rwk,
  /var/log/z-runner/** rwk,
  /tmp/** rwk,
  /etc/ssl/certs/** r,
  /etc/z-runner/github-app.pem r,
  network inet stream,
  network inet6 stream,
}
