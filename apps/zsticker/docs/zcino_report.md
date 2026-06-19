# รายงานสรุปโปรเจกต์ Zcino (Game Catalog Service)

โปรเจกต์ **Zcino** เป็น `production-grade Go REST microservice` ที่ถูกออกแบบมาเพื่อให้บริการแคตตาล็อกเกม (Game Catalog) พร้อมด้วยสถาปัตยกรรมที่เน้นความสะอาด (`clean architecture`) และรองรับสเกลระดับองค์กร

## 📌 สถาปัตยกรรมหลัก (Core Architecture)

โปรเจกต์นี้แบ่งออกเป็น 4 ส่วนหลัก (Layers):

1. **Catalog API Service (Backend)**
   - พัฒนาด้วย `Go` สำหรับให้บริการ REST API แก่ `frontend`
   - จัดการข้อมูลเกม, ผู้ให้บริการ (`providers`), ระบบยืนยันตัวตน (`auth`), ระบบเก็บสถิติ (`tracking`), และ `metrics`
   - มีระบบ `API gateway policy middleware` สำหรับคัดกรอง request ที่ไม่ได้รับอนุญาต (เช่น คำที่เกี่ยวกับ wallet, betting, หรือ payment)

2. **Zcino Frontend**
   - พัฒนาด้วย `Next.js 14 App Router`
   - เป็น `control-plane` และ `lobby UI` สำหรับแสดงผลเกม
   - ใช้ `TailwindCSS` สำหรับจัดหน้าตา UI รองรับการค้นหา, ตัวกรอง (filters), และการดึงข้อมูลแบบ `infinite scroll`

3. **ZEAZ Protocol & Reference Node**
   - มีระบบเครือข่ายสำหรับ `autonomous network` ภายใต้โปรโตคอล ZEAZ (เวอร์ชัน 4 ถึง 9)
   - มี `SDK` สำหรับทั้ง `Go` และ `TypeScript`

4. **Experimental Autonomous Layers**
   - ระบบทดลองอัจฉริยะ (เช่น `internal/brain`, `internal/evolution`, `internal/ecosystem`) 
   - เน้นการทำงานแบบ `event-driven` และการเรียนรู้ด้วยตนเองแบบมีการควบคุม (Guarded scaffolds)

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Backend:** `Go 1.25`, `PostgreSQL` (สำหรับ persistence), `Redis` (สำหรับ caching)
- **Frontend:** `Next.js 14`, `React Query`, `TailwindCSS`
- **Event Bus & Analytics:** `NATS`, เตรียมพร้อมสำหรับต่อยอดไปยัง `ClickHouse`
- **Infrastructure:** `Docker Compose` (สำหรับ local/full-stack), `Kubernetes` (Deployment, Service, HPA)

## 🔄 การอัปเดตล่าสุด (Recent Refactoring)

จากการดำเนินการล่าสุด โค้ดส่วนที่เป็น API เก่าถูกจัดการให้สะอาดขึ้น:
- **Legacy API Refactor:** รวมไฟล์ `stub` ที่แปลงมาจาก `PHP` จำนวน 124 ไฟล์ในโฟลเดอร์ `internal/legacy_api` เข้าไว้ในไฟล์เดียวคือ `legacy_api.go` ที่โฟลเดอร์ `apps/zcino` พร้อมเปลี่ยน package เป็น `main` และลบโฟลเดอร์เก่าทิ้งเรียบร้อยแล้ว เพื่อลดความซ้ำซ้อนของไฟล์

## 🚀 ทิศทางของโปรเจกต์ (Evolution & Roadmap)

โปรเจกต์มีการวางรากฐานการอัปเกรดในระดับ `v4` ถึง `v9`:
- **v4:** เพิ่ม `Decision engine` สำหรับจัดอันดับเกมด้วย `RTP` และ `CTR`
- **v5:** ระบบ `Self-evolution layer` ที่สามารถให้ AI นำเสนอการปรับปรุงโค้ดและทำการทดสอบ (Canary deployment) ภายใต้การตรวจสอบ (Policy gates)
- **v7-v8:** ระบบ `Multi-org` และ `Cross-platform ecosystem` สำหรับแลกเปลี่ยนงานข้ามแพลตฟอร์ม
- **v9:** ระบบ `Open autonomous coordination network` แบบ `permissionless` ที่พึ่งพา `reputation` และ `quorum` ในการอนุมัติการทำงาน

---
*รายงานนี้สรุปจากเอกสาร `README.md` และโครงสร้างล่าสุดของโปรเจกต์*
