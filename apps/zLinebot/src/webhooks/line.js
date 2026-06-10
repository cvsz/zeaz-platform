import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyLineSignature(body, signature, channelSecret) {
  if (!channelSecret) return { ok: false, reason: 'missing_channel_secret' };
  if (!signature) return { ok: false, reason: 'missing_signature' };
  const expected = createHmac('sha256', channelSecret).update(body).digest('base64');
  const provided = Buffer.from(signature);
  const actual = Buffer.from(expected);
  if (provided.length !== actual.length) return { ok: false, reason: 'invalid_signature' };
  return { ok: timingSafeEqual(provided, actual), reason: 'validated' };
}

export async function handleLineWebhook(_payload) {
  return { ok: true, accepted: true };
}
