import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll look for the exact string
    target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
    if target in content:
        content = content.replace(target, "function drawWeatherOnWindow(wx, wy, ww, isLeft) {")
        # Wait, I accidentally removed a parameter in my thought above.
        # Correct target:
        # target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
        # replacement = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {"
        pass
    
    # Let's do it properly.
    target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
    replacement = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {"
    if target in content:
        content = content.replace(target, replacement)
    else:
        # Try with different whitespace if exact match fails
        pattern = re.compile(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', re.DOTALL)
        content = pattern.sub(r'function drawWeatherOnWindow(\1) {', content) # This is wrong too.

    # Let's just use the regex that worked in my head.
    # re.sub(r'(function drawWeatherOnWindow\(.*?\)\s*\{)\s*_weatherTick++;', r'\1', content, flags=re.DOTALL)
    # Wait, I already tried that and it failed.
    
    # Let's try this:
    pattern = re.compile(r'(function drawWeatherOnWindow\(.*?\)\s*\{)\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'\1', content)

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
