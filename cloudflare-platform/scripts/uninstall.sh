#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'
	'
log(){ printf '{"ts":"%s","level":"%s","script":"%s","msg":"%s"}
' "$(date -Iseconds)" "$1" "uninstall.sh" "$2"; }
trap 'log ERROR "failed at line $LINENO"' ERR
retry(){ local n=0 max=3; until "$@"; do n=$((n+1)); [[ $n -ge $max ]] && return 1; sleep $((n*2)); done; }
health(){ command -v terraform >/dev/null && command -v curl >/dev/null; }
rollback(){ log WARN "rollback hook executed"; }
main(){
  health || { log ERROR "missing deps"; exit 1; }
  scripts/validate.sh
  case "${1:-run}" in
    plan) retry terraform -chdir=terraform/envs/${2:-dev} init -input=false; retry terraform -chdir=terraform/envs/${2:-dev} plan ;;
    apply) retry terraform -chdir=terraform/envs/${2:-dev} init -input=false; retry terraform -chdir=terraform/envs/${2:-dev} apply -auto-approve ;;
    *) log INFO "no-op uninstall.sh" ;;
  esac
}
main "$@" || { rollback; exit 1; }
