import os
import glob

def replace_in_files(dir_path, old_str, new_str):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()
                if old_str in content:
                    content = content.replace(old_str, new_str)
                    with open(file_path, 'w') as f:
                        f.write(content)
                    print(f"Updated {file_path}")

base = "apps/ztrader/backend/src/ztrader/"
replace_in_files(base + "binance_perp_bot", "from binance_perp_bot", "from ztrader.binance_perp_bot")
replace_in_files(base + "binance_perp_bot", "import binance_perp_bot", "import ztrader.binance_perp_bot")
replace_in_files(base + "tools", "from tools", "from ztrader.tools")
replace_in_files(base + "tools", "import tools", "import ztrader.tools")
