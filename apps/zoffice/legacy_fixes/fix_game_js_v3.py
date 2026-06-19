import subprocess

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    # Change const canvas/ctx to let
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from drawWeatherOnWindow (line 534)
    # We'll search for the specific pattern in drawWeatherOnWindow
    # It's usually after some code.
    # The existing code has:
    # function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {
    #     _weatherTick++;
    #     ...
    
    # Let's just find and replace it carefully.
    # But wait, _weatherTick++ might be anywhere.
    # I'll find the one inside drawWeatherOnWindow.
    
    import re
    
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # This regex looks for the function definition and then the increment
    pattern = re.compile(r'(function drawWeatherOnWindow\(.*?\)\s*\{.*?)\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'\1', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    # Loop starts at 10972.
    # We want to insert after line 10973 (the comment).
    # The comment is "// Update ambient light cache once per frame"
    
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment)
        # We want to add it after the comment. 
        # But loop() also needs the canvas/ctx check.
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()
