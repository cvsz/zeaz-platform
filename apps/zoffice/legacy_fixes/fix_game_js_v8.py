import subprocess
import re

def run_command(command_list):
    result = subprocess.run(command_list, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(command_list)}")
        print(result.stderr)
        return False
    return True

def main():
    # 1. Fix Canvas null crash
    # Change const canvas/ctx to let
    run_command(["sed", "-i", "s/const canvas =/let canvas =/", "app/game.js"])
    run_command(["sed", "-i", "s/const ctx =/let ctx =/", "app/game.js"])

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll find the line number of the function and then the line after it.
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if "function drawWeatherOnWindow" in line:
            # Check the next few lines for _weatherTick++;
            for j in range(i + 1, i + 5):
                if j < len(lines) and "_weatherTick++;" in lines[j]:
                    print(f"Removing _weatherTick++; at line {j+1}")
                    del lines[j]
                    break
            break
    
    with open("app/game.js", "w") as f:
        f.writelines(lines)

    # Replace Date.now() in the specific sin-based animation lines.
    # Using regex to be safer
    with open("app/game.js", "r") as f:
        content = f.read()
    
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    with open("app/game.js", "w") as f:
        f.write(content)

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        # Re-read content because it changed
        with open("app/game.js", "r") as f:
            content = f.read()
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
        with open("app/game.js", "w") as f:
            f.write(content)
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()
