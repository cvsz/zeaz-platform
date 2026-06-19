"""Publishing safeguards for official uploader integrations."""

from dataclasses import dataclass


@dataclass(frozen=True)
class UploadPolicy:
    """Policy controls for compliant publishing workflows."""

    require_human_approval: bool = True
    max_concurrency: int = 2
    official_api_only: bool = True


def can_publish(is_approved: bool, policy: UploadPolicy | None = None) -> bool:
    """Return whether an export can be published under the configured policy."""

    active_policy = policy or UploadPolicy()
    if active_policy.require_human_approval and not is_approved:
        return False
    return active_policy.official_api_only
