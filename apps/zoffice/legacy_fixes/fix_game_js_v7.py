import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll use a more robust replacement.
    # We'll find the function and the line and remove it.
    
    # Find the function start and the line to remove
    match = re.search(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', content, re.DOTALL)
    if match:
        # The match includes the function header and the _weatherTick++;
        # We want to replace it with just the function header (without the _weatherTick++; part)
        # But we need to keep the header part.
        # The header part is everything before \s*_weatherTick++;
        header_match = re.search(r'function drawWeatherOnWindow\(.*?\)\s*\{', match.group(0), re.DOTALL)
        if header_match:
            header = header_match.group(0)
            content = content.replace(match.group(0), header)
    
    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()
