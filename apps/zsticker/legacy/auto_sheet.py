import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
gc = gspread.authorize(creds)

sh = gc.create('Line Sticker Auto')
ws = sh.sheet1
ws.update('A1:E1', [['ชื่อสินค้า','ราคา','โปร','แคปชั่น','status']])
ws.update('A2:E2', [['เสื้อครอป','199','ส่งฟรี','ของใหม่เข้า','pending']])
sh.share(None, perm_type='anyone', role='writer')  # เปิดให้แก้ไขได้

print(f"✅ สร้าง Sheet แล้ว: {sh.url}")
print(f"SHEET_ID = {sh.id}")
print("คัดลอก SHEET_ID ไปใส่ใน .env ได้เลย")
