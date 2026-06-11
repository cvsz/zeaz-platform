// Draft builder utilities for Shopee Affiliate social media drafts

// We define a robust IngestionItem interface that matches the application's actual data structure.
export interface IngestionItemData {
  title?: string | null;
  affiliateUrl?: string | null;
  productUrl?: string | null;
  price?: number | null;
  campaignNote?: string | null;
  [key: string]: any;
}

export type ThreadsMode = "casual" | "promo" | "engagement";
export type XMode = "casual" | "promo" | "news";
export type InstagramMode = "casual" | "promo" | "story";
export type YoutubeShortsMode = "teaser" | "highlight" | "cta";

const affiliateDisclosure = "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ";
const shortAffiliateDisclosure = "ลิงก์นี้เป็นลิงก์ Affiliate";

/**
 * Build a Threads (Meta) post draft.
 */
export function buildThreadsPostDraft(
  item: IngestionItemData | null,
  mode: ThreadsMode,
  hashtags: string[]
): string {
  if (!item) return "";
  const title = item.title ?? "สินค้าจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "ไม่มีลิงก์";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";
  const hashtagString = hashtags.length > 0 ? hashtags.join(" ") : "";

  const templates: Record<ThreadsMode, string> = {
    casual: `เพิ่งเจอของดีมาบอกต่อ! ${title}\n${priceStr ? `ราคาดีงาม แค่ ${priceStr}` : ""}\n\nใครสนใจไปส่องกันได้น้า 👇\n${link}\n\n${shortAffiliateDisclosure}`,
    promo: `🔥 โปรแรงรับสิทธิ์ด่วน! ${title}\n${priceStr ? `💸 ลดเหลือเพียง: ${priceStr}\n` : ""}${campaign ? `📌 เพิ่มเติม: ${campaign}\n` : ""}\nพิกัดตำ 👇\n${link}\n\n${affiliateDisclosure}`,
    engagement: `ทุกคนคิดว่าไงกับ ${title}?\nส่วนตัวคิดว่าคุ้มมาก ${priceStr ? `ในราคา ${priceStr}` : ""}\n\nมีใครเคยใช้บ้าง คอมเมนต์บอกหน่อยยย 👇\n${link}\n\n${shortAffiliateDisclosure}`
  };

  let draft = templates[mode];
  draft = draft.replace(/\n{3,}/g, "\n\n").trim();
  return `${draft}\n\n${hashtagString}`.trim();
}

/**
 * Build an X (Twitter) post draft.
 */
export function buildXPostDraft(
  item: IngestionItemData | null,
  mode: XMode,
  hashtags: string[]
): string {
  if (!item) return "";
  const title = item.title ?? "สินค้าจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "ไม่มีลิงก์";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";
  const hashtagString = hashtags.length > 0 ? hashtags.join(" ") : "";

  const templates: Record<XMode, string> = {
    casual: `มาป้ายยา ${title} ✨\n${priceStr ? `ค่าตัวน้อง ${priceStr}` : ""}\n\n👉 ${link}\n\n${shortAffiliateDisclosure}`,
    promo: `🚨 โปรด่วน! ${title} ${priceStr ? `ราคาพิเศษ ${priceStr}` : ""}\n${campaign ? `✅ ${campaign}` : ""}\n\nไปตำด่วน: ${link}\n\n${shortAffiliateDisclosure}`,
    news: `[อัปเดต] ${title} เข้าแล้วนะทุกคน!\n${priceStr ? `เช็คราคาล่าสุด ${priceStr}` : ""}\n\nรายละเอียดเพิ่มเติม: ${link}\n\n${shortAffiliateDisclosure}`
  };

  let draft = templates[mode];
  draft = draft.replace(/\n{3,}/g, "\n\n").trim();
  // X limits to 280 chars, but let the user edit if it exceeds.
  return `${draft}\n\n${hashtagString}`.trim();
}

/**
 * Build an Instagram post draft.
 */
export function buildInstagramPostDraft(
  item: IngestionItemData | null,
  mode: InstagramMode,
  hashtags: string[]
): string {
  if (!item) return "";
  const title = item.title ?? "สินค้าจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "เช็คลิงก์ที่ Bio";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";
  const hashtagString = hashtags.length > 0 ? hashtags.join(" ") : "";

  const templates: Record<InstagramMode, string> = {
    casual: `วันสบายๆ กับ ${title} 📸\n\n${priceStr ? `ได้มาในราคา ${priceStr} คุ้มมากก` : ""}\nบอกเลยว่าห้ามพลาด!\n\n📍 พิกัด: ${link}\n\n${affiliateDisclosure}`,
    promo: `🔥 SALE! ลดจัดเต็ม 🔥\n\n${title}\n${priceStr ? `💰 ราคาพิเศษ: ${priceStr}\n` : ""}${campaign ? `✨ โปรโมชั่น: ${campaign}\n` : ""}\nอย่ารอช้า กดลิงก์เลย 👇\n🔗 ${link}\n\n${affiliateDisclosure}`,
    story: `ใครกำลังมองหา ${title} ต้องจัด!\n${priceStr ? `ราคา ${priceStr}` : ""}\n\n📍 จิ้มลิงก์เลย ${link}`
  };

  let draft = templates[mode];
  draft = draft.replace(/\n{3,}/g, "\n\n").trim();
  return `${draft}\n\n${hashtagString}`.trim();
}

/**
 * Build a YouTube Shorts post draft.
 */
export function buildYoutubeShortsPostDraft(
  item: IngestionItemData | null,
  mode: YoutubeShortsMode,
  hashtags: string[]
): string {
  if (!item) return "";
  const title = item.title ?? "Shopee Finds";
  const link = item.affiliateUrl ?? item.productUrl ?? "ดูลิงก์ในคอมเมนต์";
  const priceStr = item.price && item.price > 0 ? `฿${item.price.toLocaleString("th-TH")}` : "";
  const campaign = item.campaignNote ?? "";
  const hashtagString = hashtags.length > 0 ? hashtags.join(" ") : "";

  const templates: Record<YoutubeShortsMode, string> = {
    teaser: `แกะกล่อง ${title} 📦 มาดูกันว่าคุ้มไหม?\n${priceStr ? `ค่าตัว ${priceStr}` : ""}\n\n🔗 พิกัด: ${link}\n\n${shortAffiliateDisclosure}`,
    highlight: `ไฮไลท์เด็ด! ${title} 🔥 ของดีที่ต้องมี\n${campaign ? `✨ ${campaign}\n` : ""}\n👉 สั่งซื้อได้ที่นี่: ${link}\n\n${shortAffiliateDisclosure}`,
    cta: `${title} หมดแล้วหมดเลย! 🛒\n${priceStr ? `ราคาปังมาก ${priceStr}` : ""}\n\n👇 กดสั่งซื้อที่ลิงก์ด้านล่าง 👇\n🔗 ${link}\n\n${shortAffiliateDisclosure}`
  };

  let draft = templates[mode];
  draft = draft.replace(/\n{3,}/g, "\n\n").trim();
  return `${draft}\n\n${hashtagString}`.trim();
}
