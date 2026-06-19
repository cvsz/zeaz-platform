export const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (err) => {
    const msg = err instanceof Error ? err.stack : err;
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
  },
};
