import os, json
print("=== Auto Setup Line Sticker ===")
token = input("LINE_CHANNEL_ACCESS_TOKEN: ").strip()
group = input("LINE_GROUP_ID: ").strip()
sheet = input("SHEET_ID (เว้นว่างให้สร้างใหม่): ").strip()
imgur = input("IMGUR_CLIENT_ID: ").strip()

with open('.env','w') as f:
    f.write(f"LINE_CHANNEL_ACCESS_TOKEN={token}\nLINE_GROUP_ID={group}\nSHEET_ID={sheet}\nIMGUR_CLIENT_ID={imgur}\n")

print("✅ .env สร้างแล้ว")

cred = input("วาง path ไฟล์ credentials.json จาก Google (หรือ Enter เพื่อข้าม): ").strip()
if cred and os.path.exists(cred):
    with open(cred) as src, open('credentials.json','w') as dst:
        dst.write(src.read())
    print("✅ credentials.json วางแล้ว")
else:
    print("⚠️ ข้าม credentials.json — ต้องวางเองทีหลัง")

print("เสร็จ! รัน python main.py ได้เลย")
