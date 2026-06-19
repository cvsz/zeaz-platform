export function wipeBuffer(buffer: Uint8Array | Buffer): void {
  buffer.fill(0);
}
