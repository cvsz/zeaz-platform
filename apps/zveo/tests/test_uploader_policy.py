from apps.uploader.policy import UploadPolicy, can_publish


def test_upload_policy_requires_approval_by_default() -> None:
    assert can_publish(is_approved=False) is False
    assert can_publish(is_approved=True) is True


def test_upload_policy_can_disable_approval_for_internal_exports() -> None:
    policy = UploadPolicy(require_human_approval=False)

    assert can_publish(is_approved=False, policy=policy) is True
