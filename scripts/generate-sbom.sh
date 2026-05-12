#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'printf "{\"level\":\"error\",\"script\":\"generate-sbom\",\"line\":%s}\n" "$LINENO" >&2' ERR

command -v syft >/dev/null 2>&1 || { echo 'missing required tool: syft' >&2; exit 1; }
out_file="${1:-artifacts.sbom.spdx.json}"
tmp_file="${out_file}.tmp"

syft . -o "spdx-json=${tmp_file}"
mv "${tmp_file}" "${out_file}"
printf '{"level":"info","script":"generate-sbom","output":"%s"}\n' "${out_file}"
