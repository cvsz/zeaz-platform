from packages.ffmpeg.composer import build_compose_command


def test_build_compose_command_uses_expected_codecs() -> None:
    cmd = build_compose_command("input.mp4", "audio.wav", "captions.srt", "out.mp4")

    assert cmd[:6] == ["ffmpeg", "-y", "-i", "input.mp4", "-i", "audio.wav"]
    assert "libx264" in cmd
    assert "aac" in cmd
    assert cmd[-1] == "out.mp4"
