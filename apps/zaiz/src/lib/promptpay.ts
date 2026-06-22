/**
 * PromptPay QR code generator — server-safe (no SDK, pure string building).
 *
 * Generates the EMVCo QR payload string for Thailand's PromptPay payment
 * system. The payload follows the Tag-Length-Value (TLV) format defined by
 * EMVCo. The resulting string is encoded as a QR code on the client.
 *
 * Reference: https://www.emvco.com/terms-of-use/business-and-application/
 */

/** CRC16-CCITT (0x1021) checksum used by PromptPay QR payloads. */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Encode a TLV field: tag (2 digits) + length (2 digits) + value. */
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

/**
 * Generate a PromptPay QR payload.
 *
 * @param target - Phone number (e.g. "0812345678") or National ID (e.g. "1234567890123")
 * @param amount - Amount in THB (e.g. 99.50)
 * @returns The QR payload string to encode as a QR code
 */
export function generatePromptPayPayload(
  target: string,
  amount?: number,
): string {
  // Normalize: remove spaces, dashes, leading 0 for phone
  const cleaned = target.replace(/[\s-]/g, "");

  // Determine if it's a phone number or national ID
  let idType: string;
  let idValue: string;

  if (/^0\d{9}$/.test(cleaned)) {
    // Thai phone: 0812345678 → 0066812345678
    idType = "01"; // MSISDN
    idValue = "0066" + cleaned.slice(1);
  } else if (/^\d{13}$/.test(cleaned)) {
    // National ID: 13 digits
    idType = "02"; // National ID
    idValue = cleaned;
  } else if (/^0066\d{9}$/.test(cleaned)) {
    // Already international format
    idType = "01";
    idValue = cleaned;
  } else {
    throw new Error("Invalid target: must be a Thai phone (0812345678) or National ID (13 digits)");
  }

  // Build the payload
  // Tag 00: Payload format indicator (01)
  // Tag 01: Point of initiation method (12 = dynamic, 11 = static)
  const isDynamic = typeof amount === "number" && amount > 0;
  const initMethod = isDynamic ? "12" : "11";

  // Tag 29: Merchant account information (PromptPay)
  //   Sub-tag 00: AID (A000000677010111)
  //   Sub-tag 01 or 02: Phone or National ID
  const merchantAccount = tlv("00", "A000000677010111") + tlv(idType, idValue);

  // Tag 53: Currency (764 = THB)
  // Tag 54: Amount (if dynamic)
  // Tag 58: Country (TH)
  // Tag 63: CRC

  let payload =
    tlv("00", "01") +
    tlv("01", initMethod) +
    tlv("29", merchantAccount) +
    tlv("53", "764") +
    tlv("58", "TH");

  if (isDynamic) {
    payload += tlv("54", amount!.toFixed(2));
  }

  // Add CRC placeholder, compute, then append
  payload += "6304"; // Tag 63, length 04
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}

export interface PromptPayResult {
  ok: boolean;
  payload?: string;
  target: string;
  amount?: number;
  qrDataUrl?: string;
  error?: string;
}

/** Generate a PromptPay QR payload + return metadata. */
export function createPromptPay(
  target: string,
  amount?: number,
): PromptPayResult {
  try {
    const payload = generatePromptPayPayload(target, amount);
    return {
      ok: true,
      payload,
      target,
      amount,
    };
  } catch (err) {
    return {
      ok: false,
      target,
      error: err instanceof Error ? err.message : "Failed to generate PromptPay QR",
    };
  }
}
