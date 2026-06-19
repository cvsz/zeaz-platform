#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

REPO_SKILLS="/home/zeazdev/zeaz-platform/.agents/skills"
GLOBAL_SKILLS="/home/zeazdev/.agents/skills"
TS="$(date +%Y%m%d-%H%M%S)"
QUARANTINE="/home/zeazdev/skill-conflict-quarantine-$TS"
REPORT="/home/zeazdev/zeaz-platform/reports/omega/skill-conflicts-$TS.md"
APPLY="${APPLY:-0}"

mkdir -p "$(dirname "$REPORT")"

echo "# Gemini Skill Conflict Report" > "$REPORT"
echo >> "$REPORT"
echo "- Repo skills: \`$REPO_SKILLS\`" >> "$REPORT"
echo "- Global skills: \`$GLOBAL_SKILLS\`" >> "$REPORT"
echo "- Apply: \`$APPLY\`" >> "$REPORT"
echo "- Quarantine: \`$QUARANTINE\`" >> "$REPORT"
echo >> "$REPORT"

if [ ! -d "$REPO_SKILLS" ]; then
  echo "ERROR: repo skills not found: $REPO_SKILLS" >&2
  exit 1
fi

if [ ! -d "$GLOBAL_SKILLS" ]; then
  echo "No global skills dir found: $GLOBAL_SKILLS"
  exit 0
fi

dir_hash() {
  local dir="$1"
  find "$dir" -type f \
    ! -path '*/.git/*' \
    ! -name '.DS_Store' \
    -print0 \
    | sort -z \
    | xargs -0 sha256sum \
    | sha256sum \
    | awk '{print $1}'
}

echo "## Conflicts" >> "$REPORT"
echo >> "$REPORT"
echo "| Skill | Status | Repo hash | Global hash |" >> "$REPORT"
echo "|---|---|---|---|" >> "$REPORT"

count_same=0
count_diff=0
count_missing=0

for repo_skill in "$REPO_SKILLS"/*; do
  [ -d "$repo_skill" ] || continue

  name="$(basename "$repo_skill")"
  global_skill="$GLOBAL_SKILLS/$name"

  if [ ! -d "$global_skill" ]; then
    count_missing=$((count_missing + 1))
    continue
  fi

  repo_hash="$(dir_hash "$repo_skill")"
  global_hash="$(dir_hash "$global_skill")"

  if [ "$repo_hash" = "$global_hash" ]; then
    status="duplicate-same-sha"
    count_same=$((count_same + 1))

    if [ "$APPLY" = "1" ]; then
      mkdir -p "$QUARANTINE"
      mv "$global_skill" "$QUARANTINE/$name"
      status="moved-global-to-quarantine"
    fi
  else
    status="conflict-different-content"
    count_diff=$((count_diff + 1))
  fi

  echo "| \`$name\` | \`$status\` | \`$repo_hash\` | \`$global_hash\` |" >> "$REPORT"
done

echo >> "$REPORT"
echo "## Summary" >> "$REPORT"
echo >> "$REPORT"
echo "- Same SHA duplicates: \`$count_same\`" >> "$REPORT"
echo "- Different content conflicts: \`$count_diff\`" >> "$REPORT"
echo "- Repo-only skills: \`$count_missing\`" >> "$REPORT"

echo "Report: $REPORT"

if [ "$APPLY" = "1" ]; then
  echo "Quarantine: $QUARANTINE"
else
  echo "Dry-run only. To move exact duplicates:"
  echo "APPLY=1 bash scripts/omega/clean-gemini-skill-conflicts.sh"
fi
