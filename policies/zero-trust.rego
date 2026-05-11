package zeaz.cloudflare

default allow = false
allow if {
  input.session.mfa_verified == true
  input.session.device_posture == "healthy"
}
