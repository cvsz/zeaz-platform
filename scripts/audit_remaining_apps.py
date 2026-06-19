import os
import subprocess

apps_to_audit = ["api", "zdash", "zoffice", "zAcademy", "zLinebot", "zlms", "zsticker", "zwallet"]
report_file = "reports/final_audit.txt"

with open(report_file, "w") as f:
    for app in apps_to_audit:
        app_path = os.path.join("apps", app)
        if not os.path.exists(app_path):
            f.write(f"{app}: NOT FOUND\n")
            continue
            
        f.write(f"Auditing {app}...\n")
        
        # Determine build method
        cmd = None
        if os.path.exists(os.path.join(app_path, "package.json")):
            cmd = ["npm", "run", "build"]
        elif os.path.exists(os.path.join(app_path, "go.mod")):
            cmd = ["go", "build", "./..."]
            
        if cmd:
            result = subprocess.run(cmd, cwd=app_path, capture_output=True, text=True)
            if result.returncode == 0:
                f.write(f"{app}: BUILD PASSED\n")
            else:
                f.write(f"{app}: BUILD FAILED\n{result.stderr}\n")
        else:
            f.write(f"{app}: NO BUILD SYSTEM\n")
        f.write("-" * 20 + "\n")

