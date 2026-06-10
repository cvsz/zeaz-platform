#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/ports/list-all-ports.sh'; }
[[ "${1:-}" =~ ^(--help|-h)$ ]] && { usage; exit 0; }
cat <<'PORTS'
app,path,domain,port
openwork,apps/openwork,zow.zeaz.dev,4101
api,apps/api,api-zcfdash.zeaz.dev,4102
web,apps/web,zcfdash.zeaz.dev,4103
zoffice,apps/zoffice,zoffice.zeaz.dev,4104
zwallet,apps/zwallet,app.zeaz.dev,4105
ztrader,apps/ztrader,ztrader.zeaz.dev,4106
zdash,apps/zdash,dash.zeaz.dev,4107
zsp-aitool,apps/zsp-aitool,zaiz.zeaz.dev,4108
zveo,apps/zveo,zveo.zeaz.dev,4109
zsticker,apps/zsticker,zsticker.zeaz.dev,4110
zcino,apps/zcino,zcino.zeaz.dev,4111
zlms,apps/zlms,zlms.zeaz.dev,4112
zLinebot,apps/zLinebot,internal,4113
postgres,compose,local,5432
redis,compose,local,6379
PORTS
