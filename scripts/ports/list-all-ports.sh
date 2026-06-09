#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ cat <<'USAGE'
Usage: list-all-ports.sh [--plain]

Print the canonical ZEAZ app/domain/port map.
USAGE
}
plain=0
while [ "$#" -gt 0 ]; do case "$1" in --plain) plain=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
if [ "$plain" -eq 0 ]; then printf '%-12s %-32s %-5s %s\n' APP DOMAIN PORT PATH; fi
cat <<'MAP' | while IFS='|' read -r app domain port path; do
openwork|zow.zeaz.dev|4101|apps/openwork
api|api-zcfdash.zeaz.dev|4102|apps/api
web|zcfdash.zeaz.dev|4103|apps/web
zoffice|zoffice.zeaz.dev|4104|apps/zoffice
zwallet|app.zeaz.dev|4105|apps/zwallet
ztrader|ztrader.zeaz.dev|4106|apps/ztrader
zdash|dash.zeaz.dev|4107|apps/zdash
zsp-aitool|zaiz.zeaz.dev|4108|apps/zsp-aitool
zveo|zveo.zeaz.dev|4109|apps/zveo
zsticker|zsticker.zeaz.dev|4110|apps/zsticker
zcino|zcino.zeaz.dev|4111|apps/zcino
zlms-prod|zlms.zeaz.dev|4112|apps/zlms-prod
zLinebot|internal|4113|apps/zLinebot
MAP
  if [ "$plain" -eq 1 ]; then printf '%s|%s|%s|%s\n' "$app" "$domain" "$port" "$path"; else printf '%-12s %-32s %-5s %s\n' "$app" "$domain" "$port" "$path"; fi
done
