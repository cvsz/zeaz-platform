from __future__ import annotations

from ztrader.zkb.zkbtrader.config import get_settings


def main() -> None:
    settings = get_settings()
    print(f"zkbtrader worker ready mode={settings.execution_mode.value}")


if __name__ == "__main__":
    main()
