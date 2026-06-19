import os
import subprocess

def audit_apps():
    apps_dir = "apps"
    report_file = "reports/build_audit.txt"
    with open(report_file, "w") as f:
        for app in os.listdir(apps_dir):
            app_path = os.path.join(apps_dir, app)
            if not os.path.isdir(app_path):
                continue
            
            f.write(f"Auditing {app}...\n")
            
            if os.path.exists(os.path.join(app_path, "package.json")):
                result = subprocess.run(["npm", "run", "build"], cwd=app_path, capture_output=True, text=True)
                if result.returncode == 0:
                    f.write(f"{app}: BUILD PASSED\n")
                else:
                    f.write(f"{app}: BUILD FAILED\n{result.stderr}\n")
            elif os.path.exists(os.path.join(app_path, "go.mod")):
                result = subprocess.run(["go", "build", "./..."], cwd=app_path, capture_output=True, text=True)
                if result.returncode == 0:
                    f.write(f"{app}: BUILD PASSED\n")
                else:
                    f.write(f"{app}: BUILD FAILED\n{result.stderr}\n")
            else:
                f.write(f"{app}: UNKNOWN BUILD SYSTEM\n")
            f.write("-" * 20 + "\n")

audit_apps()
