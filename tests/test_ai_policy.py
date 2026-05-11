from pathlib import Path
import yaml

def test_ai_policy_targets_and_mfa():
    policy = yaml.safe_load(Path('policies/ai-platform.yaml').read_text())
    assert 'zveo.zeaz.dev' in policy['targets']
    assert 'studio.zeaz.dev' in policy['targets']
    assert policy['authn']['mfa_required'] is True
    assert policy['authn']['webauthn_required'] is True

def test_bot_mitigation_plan_gate():
    policy = yaml.safe_load(Path('policies/ai-platform.yaml').read_text())
    assert policy['bot_mitigation']['requires_enterprise_plan'] is True
