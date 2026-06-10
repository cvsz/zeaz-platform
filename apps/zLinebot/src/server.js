import http from 'node:http';
import { getConfig } from './config/env.js';
import { healthResponse } from './routes/health.js';
import { handleLineWebhook, verifyLineSignature } from './webhooks/line.js';

const config = getConfig();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, healthResponse());
    }
    if (req.method === 'POST' && req.url === '/webhook/line') {
      const body = await readBody(req);
      const signature = req.headers['x-line-signature'];
      if (config.lineChannelSecret) {
        const verification = verifyLineSignature(body, signature, config.lineChannelSecret);
        if (!verification.ok) return sendJson(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid webhook signature' } });
      }
      const result = await handleLineWebhook(JSON.parse(body.toString('utf8') || '{}'));
      return sendJson(res, 200, result);
    }
    return sendJson(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  } catch (_error) {
    return sendJson(res, 500, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

server.listen(config.port, '0.0.0.0', () => {
  console.log(JSON.stringify({ level: 'info', service: 'zLinebot', event: 'listening', port: config.port }));
});
