# 🚀 zsticker v1.0.0

บอทอัตโนมัติสำหรับสร้างและส่ง LINE Sticker ที่สามารถดึงข้อมูลจาก Google Sheets, สร้างภาพ Sticker (พร้อมข้อความ สินค้า, ราคา, โปรโมชั่น), อัปโหลดผ่าน Imgur และส่งเข้า LINE แบบอัตโนมัติ!

## ✨ Features
- **Auto-Resize & Templates**: รองรับเทมเพลตและปรับขนาดฟอนต์อัตโนมัติเพื่อไม่ให้ข้อความล้น (รองรับฟอนต์ไทย 100%)
- **Google Sheets Sync**: ดึงข้อมูลและอัปเดตสถานะกลับไปที่ Google Sheets ทันทีด้วย Batch Update
- **Smart Queueing**: ระบบคิวส่งข้อความ LINE แบบ Asynchronous เพื่อป้องกันการโดนแบนจาก Rate Limit (ส่งได้สูงสุด 1000 ข้อความ/นาที)
- **Comprehensive Logging**: ระบบเก็บ Log (loguru) แบบแยกไฟล์ หมุนเวียนไฟล์อัตโนมัติ และแจ้งเตือน CRITICAL Error ผ่าน LINE Admin
- **Web Dashboard**: มีหน้า Dashboard (FastAPI) เพื่อเช็คสถานะ, ดู Log, อัปโหลดเทมเพลตใหม่แบบ Real-time และ Manual Trigger
- **Docker Ready**: มาพร้อม Dockerfile แบบ Multi-stage และ docker-compose สำหรับ Deploy ขึ้น VPS พร้อม GitHub Actions CI/CD

## ⚡ Quick Start (รันบนเครื่อง)
1. ทำการติดตั้ง Dependencies
   ```bash
   make install
   ```
2. รันหน้า Dashboard (เช็คผ่าน http://localhost:8007)
   ```bash
   uvicorn src.cli.dashboard:app --port 8007
   ```
3. รันระบบ Automation 
   ```bash
   make run
   ```

## 🏗️ Architecture
```text
[ Google Sheets ] <--(Read/Write)--> [ Line Sticker Bot ]
                                           |   |
                                           |   |-- (Upload PNG) --> [ Imgur API ]
                                           |
                                           v (Send Image URL)
                                     [ LINE API ] --> [ LINE Admin / Group ]

[ Web Dashboard (FastAPI) ] <---(View Logs / Upload Templates / Metrics)
```

## 🛠️ Troubleshooting
- **Error 401 Unauthorized**: เช็คว่า `LINE_CHANNEL_ACCESS_TOKEN` ใน `.env` ถูกต้องหรือไม่
- **Imgur Upload Failed**: หากเกิดข้อผิดพลาด บอทจะพยายามส่งใหม่ (Retry) อัตโนมัติ 3 ครั้ง หากไม่สำเร็จระบบจะแจ้งเตือน
- **No Thai font found**: ระบบจะพยายามหาฟอนต์ Kanit หรือ Sarabun ในโฟลเดอร์ `fonts/` ก่อน หากไม่พบจะ Fallback ไปใช้ฟอนต์ Default ของระบบ (Thonburi/Tahoma)
