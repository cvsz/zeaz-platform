import subprocess

def run_command(command_list):
    result = subprocess.run(command_list, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(command_list)}")
        print(result.stderr)
        return False
    return True

def main():
    # 1. Fix Canvas null crash and implement _weatherTick in loop
    # Change const canvas/ctx to let
    run_command(["sed", "-i", "s/const canvas =/let canvas =/", "app/game.js"])
    run_command(["sed", "-i", "s/const ctx =/let ctx =/", "app/game.js"])
    
    # In loop(), add the check and the increment.
    # loop() starts at 10972.
    # We want to insert after line 10973 (the comment).
    # The comment is "// Update ambient light cache once per frame"
    
    # Using a temporary file to avoid sed insertion issues with multi-line
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    new_lines = []
    inserted = False
    for line in lines:
        new_lines.append(line)
        if not inserted and "Update ambient light cache once per frame" in line:
            new_lines.append("    if (!canvas) {\n")
            new_lines.append("        canvas = document.getElementById('officeCanvas');\n")
            new_lines.append("        if (canvas) ctx = canvas.getContext('2d');\n")
            new_lines.append("    }\n")
            new_lines.append("    if (!canvas || !ctx) return;\n")
            new_lines.append("    _weatherTick++;\n")
            inserted = True
    
    with open("app/game.js", "w") as f:
        f.writelines(new_lines)

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from drawWeatherOnWindow (line 534)
    # We'll use a range-based sed to be safe, or just find and replace in the file content.
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    with open("app/game.js", "w") as f:
        for line in lines:
            # Only remove it if it's inside drawWeatherOnWindow
            # This is tricky with just line-by-line.
            # Let's just use a simple approach: 
            # We know it's around 534.
            f.write(line)
    
    # Actually, let's use a safer way to remove it.
    # We'll look for the function and remove the line.
    # For simplicity, let's just use sed again but with a different approach.
    # We want to remove "_weatherTick++;" ONLY inside "function drawWeatherOnWindow"
    run_command(["sed", "-i", "/function drawWeatherOnWindow/,/}/ s/_weatherTick++;//", "app/game.js"])

    # Replace Date.now() in the specific sin-based animation lines.
    run_command(["sed", "-i", "s/Math.sin(Date.now() * 0.008 + seed)/Math.sin(_weatherTick * 0.008 + seed)/", "app/game.js"])
    run_command(["sed", "-i", "s/Math.floor((Date.now() \\/ 120 + seed * 3)/Math.floor((_weatherTick \\/ 120 + seed * 3)/", "app/game.js"])
    run_command(["sed", "-i", "s/Math.sin(Date.now() * 0.005)/Math.sin(_weatherTick * 0.005)/", "app/game.js"])

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()
