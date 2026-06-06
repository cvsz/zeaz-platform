import { createHash, randomUUID } from 'node:crypto';
import { assertTransferRequest, type TransferRequest } from '@zwallet/shared-types/wallet';
import { wipeBuffer } from '@zwallet/crypto';

export interface TransferPreview { id: string; digest: string; canonical: string }

export function buildTransferDigest(request: unknown): TransferPreview {
  assertTransferRequest(request);
  const payload = request as TransferRequest;
  const canonical = JSON.stringify({
    chain: payload.chain,
    from: payload.from.toLowerCase(),
    to: payload.to.toLowerCase(),
    amountAtomic: String(payload.amountAtomic),
    nonce: Number(payload.nonce ?? 0),
    createdAt: payload.createdAt ?? new Date().toISOString()
  });

  const digest = createHash('sha256').update(canonical).digest('hex');

  // Note: canonical is a string, but the digest is already computed.
  // We return the preview and assume the caller will clear sensitive data if needed.
  return { id: randomUUID(), digest, canonical };
}
