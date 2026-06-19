from packages.ai_prompts.engine import build_prompt


def test_build_prompt_includes_subject_and_style() -> None:
    prompt = build_prompt("robot chef", "studio lighting")

    assert "robot chef" in prompt
    assert "studio lighting" in prompt
    assert "cinematic volumetric lighting" in prompt
