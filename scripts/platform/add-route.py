#!/usr/bin/env python3
import argparse
import json
import os
import re
import socket
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLAN_JSON = ROOT / "configs/platform/apps-port-plan.json"
CLOUDFLARED_CONFIG = Path("/etc/cloudflared/config.yml")
ENV_CF_FILE = ROOT / ".env.cloudflare"

def load_cf_env():
    env = {}
    if ENV_CF_FILE.exists():
        with open(ENV_CF_FILE) as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    try:
                        k, v = line.strip().split("=", 1)
                        env[k] = v
                        os.environ[k] = v
                    except:
                        pass
    return env

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_suggested_port(role, plan_data):
    policy = plan_data.get("policy", {})
    ranges_config = policy.get("reserved_port_ranges", {})
    
    port_range_str = ranges_config.get(role, "3000-9999")
    if "-" in port_range_str:
        try:
            start_port, end_port = map(int, port_range_str.split("-"))
        except ValueError:
            start_port, end_port = 3000, 9999
    else:
        try:
            start_port = int(port_range_str)
            end_port = start_port
        except ValueError:
            start_port, end_port = 3000, 9999
            
    # Find all ports used in plan
    used_ports_in_plan = set()
    routes = plan_data.get("routes", [])
    for r in routes:
        if "port" in r:
            try:
                used_ports_in_plan.add(int(r["port"]))
            except ValueError:
                pass
            
    # Add api_gateway port
    api_gw = plan_data.get("api_gateway", {})
    if "port" in api_gw:
        try:
            used_ports_in_plan.add(int(api_gw["port"]))
        except ValueError:
            pass
        
    # Scan for first free port
    for port in range(start_port, end_port + 1):
        if port in used_ports_in_plan:
            continue
        if is_port_in_use(port):
            continue
        return port
        
    return None

def run_interactive_wizard():
    print("\n=======================================================")
    print("      Cloudflare Routing Setup & Deploy Wizard         ")
    print("=======================================================")
    
    if not PLAN_JSON.exists():
        print(f"ERROR: {PLAN_JSON} not found.")
        sys.exit(1)
        
    plan_data = json.loads(PLAN_JSON.read_text())
    domain = plan_data.get("zone", "zeaz.dev")
    
    # 1. Get role
    roles_list = ["ui", "api", "evidence", "ops"]
    print("\nSelect Application Role:")
    for idx, r in enumerate(roles_list, 1):
        print(f"  [{idx}] {r}")
    print("  [5] Custom Role")
    
    role_choice = input("Enter choice [1 (ui)]: ").strip()
    if role_choice == "2":
        role = "api"
    elif role_choice == "3":
        role = "evidence"
    elif role_choice == "4":
        role = "ops"
    elif role_choice == "5":
        role = input("Enter custom role: ").strip()
        if not role:
            role = "ui"
    else:
        role = "ui"
        
    # 2. Get app_id
    apps_dir = ROOT / "apps"
    available_apps = []
    if apps_dir.exists():
        available_apps = [d.name for d in apps_dir.iterdir() if d.is_dir()]
        available_apps.sort()
        
    print(f"\nSelect or enter App ID (e.g. zcloud):")
    if available_apps:
        print("Detected local apps:")
        for idx, app in enumerate(available_apps, 1):
            print(f"  [{idx:2d}] {app}")
        print("  [ 0] Other (Create new / custom)")
        app_choice = input("Enter number or app name: ").strip()
        if app_choice.isdigit():
            val = int(app_choice)
            if 1 <= val <= len(available_apps):
                app_id = available_apps[val - 1]
            else:
                app_id = input("Enter custom App ID: ").strip()
        else:
            app_id = app_choice if app_choice else "new-app"
    else:
        app_id = input("Enter App ID: ").strip()
        
    if not app_id:
        app_id = "temp-app"
        
    # 3. Suggest and get Hostname
    suggested_hostname = f"api-{app_id}.{domain}" if role == "api" else f"{app_id}.{domain}"
    hostname = input(f"\nEnter Hostname [{suggested_hostname}]: ").strip()
    if not hostname:
        hostname = suggested_hostname
        
    # 4. Suggest and get Port
    suggested_port = find_suggested_port(role, plan_data)
    if not suggested_port:
        suggested_port = 3005
        
    port_input = input(f"\nEnter Internal Port [{suggested_port}]: ").strip()
    if port_input:
        try:
            port = int(port_input)
        except ValueError:
            print(f"Invalid port format. Using default suggested port: {suggested_port}")
            port = suggested_port
    else:
        port = suggested_port
        
    print("\n=======================================================")
    print("                Summary of Configuration               ")
    print("=======================================================")
    print(f"  App ID   : {app_id}")
    print(f"  Role     : {role}")
    print(f"  Hostname : {hostname}")
    print(f"  Port     : {port} (Internal origin: http://127.0.0.1:{port})")
    print("=======================================================")
    
    confirm = input("\nProceed with deployment to Cloudflare & Tunnels? (y/N): ").strip().lower()
    if confirm != 'y' and confirm != 'yes':
        print("Deployment cancelled by user.")
        sys.exit(0)
        
    return app_id, hostname, port, role

def update_apps_port_plan(app_id, hostname, port, role):
    if not PLAN_JSON.exists():
        print(f"ERROR: {PLAN_JSON} not found.")
        return False
    
    data = json.loads(PLAN_JSON.read_text())
    routes = data.get("routes", [])
    
    # Check if already exists
    existing = None
    for r in routes:
        if r.get("hostname") == hostname:
            existing = r
            break
            
    if existing:
        print(f"Route for {hostname} already exists in plan. Updating port to {port}.")
        existing["port"] = port
        existing["origin"] = f"http://127.0.0.1:{port}"
        existing["app_id"] = app_id
        existing["role"] = role
    else:
        print(f"Adding new route for {hostname} on port {port} to plan.")
        new_route = {
            "app_id": app_id,
            "role": role,
            "path": f"apps/{app_id}",
            "hostname": hostname,
            "port": port,
            "origin": f"http://127.0.0.1:{port}",
            "status": "active"
        }
        routes.append(new_route)
        
    data["routes"] = routes
    PLAN_JSON.write_text(json.dumps(data, indent=2) + "\n")
    print(f"PASS: Updated apps-port-plan.json")
    return True

def update_cloudflared_config(hostname, port):
    if not CLOUDFLARED_CONFIG.exists():
        print(f"WARNING: {CLOUDFLARED_CONFIG} not found. Skipping local service update.")
        return True
        
    content = CLOUDFLARED_CONFIG.read_text()
    
    # Check if host already exists in ingress
    if f"hostname: {hostname}" in content:
        print(f"Ingress entry for {hostname} already exists in {CLOUDFLARED_CONFIG}.")
        # We can update the port using regex
        pattern = rf"(hostname:\s*{re.escape(hostname)}\s*\n\s*service:\s*http://127\.0\.0\.1:)\d+"
        updated = re.sub(pattern, rf"\g<1>{port}", content)
        # Write to temp and copy via sudo
        temp_file = ROOT / ".cloudflare-backups/config.yml.tmp"
        temp_file.parent.mkdir(parents=True, exist_ok=True)
        temp_file.write_text(updated)
        subprocess.run(["sudo", "cp", str(temp_file), str(CLOUDFLARED_CONFIG)])
        print("PASS: Updated cloudflared config port")
        return True
        
    # If not exists, insert before catch-all rule
    lines = content.splitlines()
    insert_idx = -1
    for i, line in enumerate(lines):
        if "- service: http_status:404" in line:
            insert_idx = i
            break
            
    if insert_idx != -1:
        new_entry = [
            f"  - hostname: {hostname}",
            f"    service: http://127.0.0.1:{port}",
            ""
        ]
        lines = lines[:insert_idx] + new_entry + lines[insert_idx:]
        temp_file = ROOT / ".cloudflare-backups/config.yml.tmp"
        temp_file.parent.mkdir(parents=True, exist_ok=True)
        temp_file.write_text("\n".join(lines) + "\n")
        subprocess.run(["sudo", "cp", str(temp_file), str(CLOUDFLARED_CONFIG)])
        print(f"PASS: Inserted new ingress rule for {hostname} into {CLOUDFLARED_CONFIG}")
        # Restart cloudflared
        subprocess.run(["sudo", "systemctl", "restart", "cloudflared"])
        print("PASS: Restarted cloudflared service")
        return True
    else:
        print("ERROR: Could not find catch-all rule in cloudflared config. Ingress mapping skipped.")
        return False

def check_and_import_cloudflare(hostname):
    load_cf_env()
    zone_id = os.environ.get("CLOUDFLARE_ZONE_ID")
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    
    if not zone_id or not token:
        print("WARNING: Missing Cloudflare Zone ID or Token in environment. Skipping auto-import.")
        return True
        
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?name={hostname}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            if res.get("success") and res.get("result"):
                record = res["result"][0]
                rec_id = record["id"]
                print(f"Cloudflare record exists for {hostname} with ID: {rec_id}. Executing terraform import...")
                cmd = ["terraform", "import", f"cloudflare_dns_record.app_routes[\"{hostname}\"]", f"{zone_id}/{rec_id}"]
                # Run import, ignore if already imported
                subprocess.run(cmd, cwd=str(ROOT / "terraform/cloudflare-apps"), env=os.environ)
                print("PASS: Executed terraform import checks")
            else:
                print(f"No existing Cloudflare DNS record found for {hostname}. Terraform will create it.")
    except Exception as e:
        print(f"Cloudflare check failed: {e}. Moving forward.")
        
    return True

def main():
    parser = argparse.ArgumentParser(description="Add new domain/subdomain to Cloudflare & local tunnels")
    parser.add_argument("--app-id", help="App ID (e.g. zcloud)")
    parser.add_argument("--hostname", help="Hostname (e.g. zcloud.zeaz.dev)")
    parser.add_argument("--port", type=int, help="Internal port (e.g. 3004)")
    parser.add_argument("--role", default="ui", help="App role (ui/api/etc.)")
    
    args = parser.parse_args()
    
    # Check if we should use interactive wizard mode
    if not (args.app_id and args.hostname and args.port):
        app_id, hostname, port, role = run_interactive_wizard()
    else:
        app_id = args.app_id
        hostname = args.hostname
        port = args.port
        role = args.role
        
    print(f"=== Starting Route Registration for {hostname} ===")
    
    # 1. Update JSON port plan
    if not update_apps_port_plan(app_id, hostname, port, role):
        return 1
        
    # 2. Update cloudflared local config
    if not update_cloudflared_config(hostname, port):
        return 1
        
    # 3. Generate port refactor assets
    print("Generating assets...")
    subprocess.run(["make", "apps-port-refactor-generate"], cwd=str(ROOT))
    
    # 4. Check and import existing CF DNS record
    check_and_import_cloudflare(hostname)
    
    # 5. Apply port plan to Cloudflare
    print("Applying port plan to Cloudflare...")
    env = os.environ.copy()
    env["APPLY"] = "true"
    env["CONFIRM_TERRAFORM_APPLY"] = "yes"
    
    res = subprocess.run(
        ["make", "apply-port-plan"], 
        cwd=str(ROOT), 
        env=env
    )
    
    if res.returncode == 0:
        print(f"\nSUCCESS! {hostname} has been successfully added to Cloudflare and local tunnels.")
        return 0
    else:
        print("\nERROR: Failed to apply port plan to Cloudflare.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
