package zeaz.evolution

default allow := false

allow if {
  count(deny) == 0
}

deny contains "tenant id is required" if {
  not input.tenant_id
}

deny contains "real-money activity is blocked in Thailand" if {
  input.real_money == true
  upper(input.country) == "TH"
}

deny contains "kill switch is active" if {
  input.metrics.kill_switch_active == true
}

deny contains "risk exceeds maximum" if {
  input.risk > 0.7
}

deny contains "error rate exceeds guardrail" if {
  input.metrics.error_rate > input.guardrails.max_error_rate
}

deny contains "spend exceeds budget" if {
  input.metrics.budget_per_hour > 0
  input.metrics.spend_per_hour > input.metrics.budget_per_hour
}

deny contains "risky action requires human approval" if {
  risky_actions[input.requested_action]
  not input.guardrails.allow_direct_risky_actions
}

deny contains "cluster deletion is forbidden" if {
  input.type == "infra"
  input.change == "delete_cluster"
}

deny contains "direct production writes are forbidden" if {
  input.change == "direct_production_write"
}

deny contains "unbounded resource use is forbidden" if {
  input.change == "unbounded_resources"
}

risky_actions := {
  "scale_up",
  "rollback",
  "autoscale_traffic",
  "kill_switch",
}
