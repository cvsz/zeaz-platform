# Rescue Tags

## What Are Rescue Tags?

Rescue tags are emergency recovery snapshot tags created during critical incident response. They mark a point-in-time reference of the repository state so that operators can roll back to a known-good state during an incident without hunting through git history.

Rescue tags follow the pattern:

```
rescue-YYYYMMDD-HHMMSS
```

They are lightweight git tags (not annotated) and are intended as temporary markers, not long-term releases.

---

## Current Rescue Tags Detected

The following rescue tags exist in the repository:

```
rescue-20260511-171642
rescue-20260511-171345
rescue-20260511-171146
```

These were created as part of a recovery operation. They represent snapshots of the repository state at specific points during the incident response.

---

## When to Keep

Keep a rescue tag when:

- The tag corresponds to the **successful recovery point** that was actually used to restore service
- The recovery window is still open (tag is less than 30 days old)
- Forensic analysis of the incident is still in progress
- A postmortem or RCA references the tag as a critical checkpoint

---

## When to Delete

Delete a rescue tag when:

- The tag is more than **30 days old** and no longer referenced in active incidents
- The recovery window has passed and service has been stable
- The postmortem is complete and the tag is not needed for audit purposes
- Multiple duplicate tags exist from the same incident (keep only the final restore point)

---

## Manual Deletion

Rescue tags must be deleted **manually by a maintainer**. Deletion is never automated.

### List all rescue tags

```bash
git tag -l 'rescue-*'
```

### Delete a single tag locally

```bash
git tag -d rescue-20260511-171642
```

### Delete from remote (if the tag was pushed)

```bash
git push origin --delete rescue-20260511-171642
```

### Delete multiple tags at once

```bash
# Delete all rescue tags older than 30 days locally
git tag -l 'rescue-*' | while read -r tag; do
  tag_date="${tag#rescue-}"
  tag_date="${tag_date%-*}"
  if [[ "$tag_date" < "$(date -d '30 days ago' +%Y%m%d)" ]]; then
    git tag -d "$tag"
  fi
done
```

---

## Recommendation

| Tag | Age (as of writing) | Action |
|---|---|---|
| `rescue-20260511-171642` | ~30 days | Keep — recent recovery reference |
| `rescue-20260511-171345` | ~30 days | Consider cleaning up |
| `rescue-20260511-171146` | ~30 days | Consider cleaning up |

**Keep for now, plan cleanup on a set schedule.** A reasonable approach is:

1. Keep all rescue tags until the next quarterly review
2. During review, evaluate which tags still serve a purpose
3. Delete tags that are no longer referenced in any active runbook or postmortem

---

## Do NOT Automate Deletion

Rescue tag deletion is intentionally a **manual process**. An automated process cannot:

- Determine whether a tag is still needed for an open incident
- Evaluate whether a tag is referenced in a postmortem draft
- Assess whether the tag represents the final restore point

**Only a maintainer chooses when a rescue tag is safe to delete.**

---

## See Also

- [Paid Upgrade Options](./paid-upgrade-options.md)
- [Backup Script](../../scripts/backup/local-state-backup.sh)
- Git documentation: `man git-tag`
