package zrunner.admission

default deny := []

deny contains msg if {
  input.review.kind.kind == "Pod"
  input.review.object.metadata.namespace == "z-runner"
  input.review.object.spec.hostNetwork == true
  msg := "z-runner pods must not use hostNetwork"
}

deny contains msg if {
  input.review.kind.kind == "Pod"
  input.review.object.metadata.namespace == "z-runner"
  c := input.review.object.spec.containers[_]
  not c.securityContext.runAsNonRoot
  msg := sprintf("container %s must run as non-root", [c.name])
}

deny contains msg if {
  input.review.kind.kind == "Pod"
  input.review.object.metadata.namespace == "z-runner"
  c := input.review.object.spec.containers[_]
  c.securityContext.privileged == true
  msg := sprintf("container %s must not be privileged", [c.name])
}

deny contains msg if {
  input.review.kind.kind == "Pod"
  input.review.object.metadata.namespace == "z-runner"
  c := input.review.object.spec.containers[_]
  not c.securityContext.readOnlyRootFilesystem
  msg := sprintf("container %s must use a read-only root filesystem", [c.name])
}
