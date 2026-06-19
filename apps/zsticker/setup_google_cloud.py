import os, json, subprocess, sys

print("=== Google Cloud Auto Setup ===")
print("สคริปต์นี้จะช่วยสร้าง Service Account")

# 1. เช็คว่ามี gcloud ไหม
try:
    subprocess.run(['gcloud','--version'], capture_output=True, check=True)
    has_gcloud = True
except:
    has_gcloud = False
    print("⚠️ ไม่เจอ gcloud — จะใช้วิธี manual")

if has_gcloud:
    # รันคำสั่งอัตโนมัติ
    project = input("ตั้งชื่อ Project ID (เช่น line-sticker-123): ").strip() or f"line-sticker-{os.getpid()}"
    
    cmds = [
        f"gcloud projects create {project} --quiet",
        f"gcloud config set project {project}",
        f"gcloud services enable sheets.googleapis.com drive.googleapis.com --quiet",
        f"gcloud iam service-accounts create line-bot --display-name='Line Bot' --quiet",
        f"gcloud projects add-iam-policy-binding {project} --member=serviceAccount:line-bot@{project}.iam.gserviceaccount.com --role=roles/editor --quiet",
        f"gcloud iam service-accounts keys create credentials.json --iam-account=line-bot@{project}.iam.gserviceaccount.com --quiet"
    ]
    
    for cmd in cmds:
        print(f"→ {cmd}")
        os.system(cmd)
    
    print("\n✅ สร้างเสร็จ! credentials.json อยู่ในโฟลเดอร์ปัจจุบัน")
    print(f"ย้ายไฟล์: mv credentials.json ~/zsticker/")
else:
    # แนะนำแบบ manual
    print("""
ทำตามนี้ (2 นาที):
1. ไป https://console.cloud.google.com/
2. Create Project → ตั้งชื่อ "line-sticker"
3. APIs & Services → Enable APIs → ค้นหา "Google Sheets API" → Enable
4. ค้นหา "Google Drive API" → Enable
5. IAM & Admin → Service Accounts → Create
   - Name: line-bot
   - Role: Basic → Editor
6. คลิก service account → Keys → Add Key → JSON
7. ดาวน์โหลดไฟล์ → อัพโหลดขึ้น server:
   scp ~/Downloads/*.json your-server:~/zsticker/credentials.json
""")

# ทดสอบ
if os.path.exists('credentials.json') or os.path.exists(os.path.expanduser('~/zsticker/credentials.json')):
    print("\nทดสอบ credentials...")
    try:
        from oauth2client.service_account import ServiceAccountCredentials
        path = 'credentials.json' if os.path.exists('credentials.json') else os.path.expanduser('~/zsticker/credentials.json')
        creds = ServiceAccountCredentials.from_json_keyfile_name(path, ['https://www.googleapis.com/auth/spreadsheets'])
        print(f"✅ ใช้ได้! client_email: {json.load(open(path))['client_email']}")
    except Exception as e:
        print(f"❌ Error: {e}")

