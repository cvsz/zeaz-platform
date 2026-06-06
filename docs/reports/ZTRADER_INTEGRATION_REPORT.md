# ZTRADER Integration and Merge Report

รายงานความคืบหน้าการควบรวมระบบ **ABTPi18n** และ **zkbtrader** เข้าด้วยกันเป็น **ztrader** ภายใต้ไดเรกทอรี [apps/ztrader](file:///home/zeazdev/zeaz-platform/apps/ztrader) ของ monorepo `zeaz-platform`

---

## 1. Overview & Objectives (ภาพรวมและวัตถุประสงค์)

ระบบ **ztrader** ได้รับการออกแบบให้เป็นระบบเทรดคริปโทเคอร์เรนซีอัตโนมัติที่มีความปลอดภัยสูงระดับโปรดักชัน (Safety-First Algorithmic Trading Platform) โดยมีการรวมจุดเด่นของทั้งสองระบบดั้งเดิมดังนี้:
* **Rich, Localized UI** และ **Celery Task Loop** จากระบบ **ABTPi18n**
* **Fail-Closed Risk Engine**, **Paper Broker** และ **Audit Logs** ที่ปลอดภัยจากการสูญเสียเงินทุนจริงจากระบบ **zkbtrader**
* เปลี่ยนการใช้งานจาก Prisma ORM มาใช้ **PostgreSQL** ด้วย **SQLAlchemy** และ **asyncpg** เป็นการเชื่อมต่อหลักแบบ Asynchronous
* **Multi-Exchange Connection**: พัฒนาโมดูลเชื่อมโยงแบบ Live Broker รองรับตลาดการค้า 6 แพลตฟอร์มหลัก: `binance.com`, `binance.th` (Binance ประเทศไทย), `okx`, `bybit`, `kucoin`, และ `MT5` (MetaTrader 5 ผ่านการเชื่อมต่อเกตเวย์)

---

## 2. Core Security & Safety Design (การออกแบบความปลอดภัยที่เข้มงวด)

ระบบทำงานภายใต้หลักการความปลอดภัยสูงสุดโดยกำหนดค่าเริ่มต้นดังนี้:
* `EXECUTION_MODE = "paper"` เป็นค่าเริ่มต้นเสมอ
* `LIVE_TRADING_ENABLED = False` เพื่อป้องกันไม่ให้ออเดอร์จริงถูกส่งไปยังตลาดจนกว่าผู้ควบคุมจะเปิดใช้งานผ่าน Environment Variables อย่างชัดเจน
* มีระบบ **GLOBAL KILL SWITCH** ควบคุมการหยุดการประมวลผลกลยุทธ์การเทรดทั้งหมดทันทีเมื่อตรวจพบสัญญาณผิดปกติ
* ทุกๆ ออเดอร์เทรด (ทั้ง Paper และ Live) จะต้องผ่านการคัดกรองของ `RiskEngine` ก่อนเสมอ โดยจะมีการบันทึกเหตุการณ์การปฏิเสธหรืออนุญาตลงใน **Audit Logs**

---

## 3. Database Schema (โครงสร้างฐานข้อมูล PostgreSQL)

ตารางหลักได้รับการสร้างขึ้นใน PostgreSQL ด้วย SQLAlchemy ในไฟล์ [db_models.py](file:///home/zeazdev/zeaz-platform/apps/ztrader/backend/src/ztrader/models/db_models.py):
1. `users`: ข้อมูลผู้ใช้งานและบทบาท (admin, operator, user)
2. `rental_contracts`: สัญญาเช่าบอทและการยืนยันสิทธิ์
3. `exchange_keys`: ข้อมูล API Keys ของตลาดแลกเปลี่ยน ซึ่งได้รับการเข้ารหัสลับด้วยอัลกอริทึม **AES-256-GCM** ก่อนจัดเก็บ
4. `orders`: ข้อมูลออเดอร์และการทำธุรกรรม (รวมถึงระดับการทดสอบแบบ paper และ live)
5. `audit_logs`: บันทึกประวัติและข้อผิดพลาดในการตรวจสอบความปลอดภัยทั้งหมด

---

## 4. Backend Architecture & API Endpoints (การประมวลผลฝั่งเซิร์ฟเวอร์)

ฝั่ง Backend พัฒนาด้วย FastAPI ประกอบด้วยจุดบริการสำคัญใน [main.py](file:///home/zeazdev/zeaz-platform/apps/ztrader/backend/src/ztrader/main.py):
* `GET /health`: ตรวจสอบสถานะการเชื่อมต่อโหมดการรันและสถานะ Kill Switch
* `GET /ready`: ยืนยันความพร้อมในการให้บริการของแอปพลิเคชัน
* `POST /api/v1/backtest/run`: ประมวลผลย้อนหลัง (Backtest Replayer) ด้วยกลยุทธ์ MA Crossover
* `GET /api/v1/orders`: ดึงรายการออเดอร์เทรดทั้งหมด
* `GET /api/v1/audit/logs`: ตรวจสอบข้อผิดพลาดของระบบและความปลอดภัย
* `POST /api/v1/bot/start` / `POST /api/v1/bot/stop` / `GET /api/v1/bot/status`: จัดการวงจรชีวิตของบอทและอินสแตนซ์ที่รันอยู่
* `POST /api/v1/risk/kill-switch`: สั่งเปิด/ปิดปุ่มหยุดการเทรดฉุกเฉินระดับระบบสากล
* **TradingView Webhook Integration**:
  * `POST /api/v1/tradingview/webhook`: รับสัญญาณอินดิเคเตอร์หรือการแจ้งเตือนจาก TradingView พร้อมระบบตรวจสอบความถูกต้องของโทเค็นลับ (`X-Webhook-Secret`)
  * `GET /api/v1/tradingview/alerts`: ดึงประวัติรายการสัญญาณแจ้งเตือนย้อนหลังที่ได้รับบันทึกในระบบ
  * `GET /api/v1/tradingview/config`: ให้ข้อมูลความพร้อมทางเทคนิค เช่น URL ของ Webhook และตัวอย่าง payload รูปแบบ JSON สำหรับผู้ใช้งาน

ผลการทดสอบการทำงานของหน่วยย่อย (Unit Tests) ทั้งหมดผ่านอย่างสมบูรณ์แบบ 100% ในไฟล์ทดสอบ `test_api.py`, `test_engine.py`, `test_security.py`, `test_live.py`, และ `test_tradingview.py`


---

## 5. Frontend UI/UX Structure (การจัดวางโครงสร้างเว็บแอปพลิเคชัน)

ฝั่ง Frontend พัฒนาโดย Next.js App Router ภายใต้โฟลเดอร์ [apps/ztrader/frontend](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend) โดยใช้ชุดสไตล์ **Zeaz Unified Design System** (Outfit Font, Glassmorphism Aesthetics, Dark Theme):
* **Multi-Language (i18n) Locales**: รองรับการเปลี่ยนภาษาหลัก 4 ภาษา:
  * อังกฤษ (EN)
  * ไทย (TH)
  * ญี่ปุ่น (JA)
  * จีน (ZH)
  ผ่านไฟล์ [translation.json](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/public/locales/en/translation.json)
* **Pages**:
  * [login/page.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/app/[lng]/login/page.tsx): หน้าระบบลงชื่อเข้าใช้ระดับพรีเมียมที่เชื่อมต่อ Google Sign-in และระบบความปลอดภัย
  * [settings/page.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/app/[lng]/settings/page.tsx): การตั้งค่า API Key ของตลาด (Binance, OKX, Bybit, KuCoin), แสดงขีดจำกัดความเสี่ยง (Risk Limits) และส่วนปรับแต่งธีม (Theme Customizer)
  * [dashboard/page.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/app/[lng]/dashboard/page.tsx): แดชบอร์ดตรวจสอบประสิทธิภาพแบบ Real-time, กราฟ PNL จำลอง, การสร้างและเปิด/หยุดบอทเทรด, ตารางประวัติของ Audit Logs และปุ่ม **GLOBAL KILL SWITCH** เด่นชัด
* **Components**:
  * [LanguageSelector.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/components/LanguageSelector.tsx): เมนูเลือกภาษาแบบโปร่งแสง (Glassmorphic Selection Dropdown)
  * [Navigation.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/components/Navigation.tsx): เมนูนำทางด้านบนสไตล์มินิมัลพรีเมียม
  * [ThemeCustomizer.tsx](file:///home/zeazdev/zeaz-platform/apps/ztrader/frontend/src/components/settings/ThemeCustomizer.tsx): โมดูลย่อยช่วยในการปรับสีแอกเซนต์ ธีมมืด/ธีมสว่าง และบันทึกเก็บไว้ผ่าน LocalStorage อัตโนมัติ

---

## 6. Next Steps & Execution (ขั้นตอนถัดไป)

1. ทำการยืนยันการตั้งค่าสภาพแวดล้อม (Environment Variables) เช่น `DATABASE_URL`, `REDIS_URL`, และ `ENCRYPTION_KEY` ในเครื่องโลคัลให้ถูกต้อง
2. เริ่มการใช้งานการพัฒนารันเช็คฝั่ง Frontend ด้วยการรัน:
   ```bash
   pnpm install
   pnpm run dev
   ```
3. รันเช็คความปลอดภัยระดับ Monorepo ด้วยคำสั่ง:
   ```bash
   make validate
   ```
