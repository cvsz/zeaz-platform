# 🎨 LINE Sticker AI Prompt Pack 
**Ultimate Guide & Prompt Pack สำหรับการสร้างสติกเกอร์ LINE ด้วย AI (Midjourney / DALL-E 3)**

จากการวิเคราะห์ [คู่มือสร้างสรรค์ LINE Creators Market](https://creator.line.me/th/guideline/sticker/) อย่างละเอียด เพื่อให้สติกเกอร์ของคุณผ่านการอนุมัติ (Approve) ได้ง่าย ใช้งานได้จริง และยอดขายปัง ผมได้สรุปกฎเหล็กและสร้าง **Prompt Pack** ที่ออกแบบมาเพื่อ AI โดยเฉพาะครับ

---

## 📌 กฎเหล็กที่ซ่อนอยู่ในการ Generate ด้วย AI
1. **Background Removal:** AI ปัจจุบัน (เช่น DALL-E 3 หรือ Midjourney) ยังไม่สามารถเซฟเป็น `.png` พื้นใสได้โดยตรง ดังนั้นเราต้องสั่งให้พื้นหลังมีสีพื้น (Solid Color หรือ White) เพื่อนำไปลบพื้นหลังต่อด้วยเว็บลบพื้นหลังได้ง่ายๆ ไร้ขอบขยะ
2. **Die-cut Outlines:** สติกเกอร์ LINE ที่ดีควรมีขอบสีขาว (White outline) หุ้มรอบตัวละคร เพื่อไม่ให้จมไปกับพื้นหลังห้องแชทสีเข้มหรือสีแปลกๆ
3. **Margins:** กฎของ LINE บังคับให้เว้นขอบประมาณ **10 px** ดังนั้นรูปที่ AI สร้างมาต้องไม่ล้นหรือโดนตัดขอบ (Cropped)
4. **Visibility:** ต้องเด่นชัด แม้ย่อเหลือขนาด 370 x 320 px (ไซส์สูงสุดของ LINE) ห้ามใช้สีซีดๆ ลอยๆ เด็ดขาด!

---

## 🛠️ 1. Master Style Prompt (คำสั่งกำหนดสไตล์หลัก)
*คำสั่งนี้คือส่วนฐาน (Base) ที่ต้องเอาไปแปะท้ายทุกรูป เพื่อคุมให้ภาพออกมาเป็นลายเส้นเดียวกันและเหมาะกับสติกเกอร์ LINE*

> **Prompt:** `cute chibi style, vector art, 2D flat color, thick clean white outline around the character, solid pure white background, kawaii aesthetic, expressive eyes, simple and bold design, high contrast, no cropping, full body inside frame, isolated on white background, line sticker art style, --no typography, text, words`

---

## 🐶 2. Character Setup (คำสั่งสร้างตัวละครเอก)
*ตัวอย่างการกำหนดตัวละครให้ AI จำหน้าได้ (เปลี่ยนจากหมาปั๊กเป็นตัวละครของคุณได้เลย)*

> **Character Base:** `A cute chubby pug dog wearing a tiny red scarf`

---

## 💬 3. Emotion Prompts Pack (ชุดคำสั่ง 16 ท่าทางยอดฮิตที่ผ่านฉลุย)
*นำ [Character Base] + [Emotion Action] + [Master Style] มารวมกัน*

**ตัวอย่างการผสม:**
`A cute chubby pug dog wearing a tiny red scarf, saying hello with a big smile and waving paw. cute chibi style, vector art, 2D flat color, thick clean white outline around the character, solid pure white background, isolated on white background, line sticker art style`

| แอคชั่น (อารมณ์) | Prompt สำหรับ Action (เติมคำต่อจากตัวละคร) |
| :--- | :--- |
| **ทักทาย (Hello)** | `saying hello, waving paw enthusiastically with a bright joyful smile and sparkles` |
| **ขอบคุณ (Thanks)** | `bowing slightly with hands together, grateful expression, surrounded by small glowing hearts` |
| **รับทราบ (OK)** | `giving a big thumbs up with a confident and cheerful wink` |
| **ขอโทษ (Sorry)** | `looking down sadly with puppy eyes, crying a little bit, holding a small "sorry" sign` |
| **รักนะ (Love)** | `hugging a giant red heart tightly, eyes shaped like hearts, blushing cheeks` |
| **หัวเราะ (Haha)** | `laughing out loud, holding its belly, tears of joy in eyes, huge mouth open` |
| **เศร้า/ร้องไห้ (Sad)** | `sitting in a corner, crying waterfalls of tears, holding a tissue, gloomy aura` |
| **โกรธ (Angry)** | `angry expression, puffing cheeks, steam blowing out of ears, fiery aura` |
| **งง/สงสัย (Confused)** | `tilting head to the side, a big glowing yellow question mark above head, blank stare` |
| **ตกใจ (Shocked)** | `jumping in surprise, eyes wide open, fur standing up, dramatic shock lines` |
| **เหนื่อย/หมดแรง (Tired)** | `melting onto the floor like a puddle, sighing with a small ghost floating out of mouth` |
| **ยินดีด้วย (Congrats)** | `throwing confetti in the air, wearing a small party hat, blowing a party horn` |
| **ฝันดี (Goodnight)** | `sleeping peacefully on a fluffy cloud, wearing a nightcap, small "Zzz" floating above` |
| **หิว (Hungry)** | `drooling, staring at an empty plate with a fork and knife in hands, sparkling eyes` |
| **สู้ๆ (Cheer Up)** | `wearing a hachimaki headband, holding pom-poms, jumping enthusiastically to cheer` |
| **ลาก่อน (Bye)** | `turning around, waving goodbye with a warm gentle smile, walking away slowly` |

---

## ✂️ 4. Workflow ขั้นตอนการจบงานให้ตรงสเปค LINE เป๊ะๆ
หลังจากให้ AI Gen รูปเสร็จแล้ว ให้ทำตามขั้นตอนดังนี้ก่อนอัปโหลดขึ้น Creators Market:

1. **ลบพื้นหลัง (Remove BG):** นำรูปไปใส่ในเว็บอย่าง remove.bg หรือใช้ Canva ลบพื้นหลังสีขาวออกให้หมด (พื้นหลังต้องโปร่งใส Transparent)
2. **ปรับสัดส่วนรูปสติกเกอร์ (Resize):** 
   - ครอปให้พอดีตัวละคร จากนั้นตั้งค่า Canvas Size ให้เป็น **370 x 320 px** (แนะนำไซส์นี้เพราะใหญ่สุดและคุ้มค่า)
   - เว้นระยะห่างจากขอบด้านละ 10 px เป็นอย่างน้อย (ตัวละครไม่ควรใหญ่เกิน 350 x 300 px)
3. **รูปภาพหลัก (Main Image):** ย่อตัวสติกเกอร์ตัวที่เด่นที่สุด ให้มีขนาดเป๊ะๆ ที่ **240 x 240 px**
4. **รูปแท็บห้องแชท (Tab Image):** ย่อให้เหลือขนาด **96 x 74 px**
5. **เพิ่มข้อความ:** หากต้องการเพิ่มคำภาษาไทย เช่น "สวัสดี", "ขอบคุณ" ให้ใช้โปรแกรมแต่งภาพพิมพ์ทับเข้าไปด้วยฟอนต์ที่อ่านง่าย และ**ต้องใส่ขอบสีขาวหนาๆ ล้อมข้อความไว้ด้วย** เพื่อกันมองไม่เห็นในแชทสีดำ

> 💡 **Pro Tip จากไกด์ไลน์:** รูปภาพห้ามมีตัวหนังสือที่เล็กเกินไป ห้ามมีเนื้อหารุนแรงหรือโฆษณา และห้ามยาวผิดสัดส่วนจนมองในมือถือไม่รู้เรื่อง!
