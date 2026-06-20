/**
 * AI Auto-Poster for zfbauto
 * ──────────────────────────────────────────────────────────────────────────────
 * Posts AI-generated "learn how to" content to Facebook every ~3 hours with
 * randomized timing to appear organic (±0-30 min jitter per cycle).
 *
 * Integration with scheduler.js:
 *  - Registers itself as a named cron job '__ai_autoposter__'
 *  - Reads settings from db.js for enable/disable + topic/format overrides
 */

const db = require('./db');
const { generateContent } = require('./contentGenerator');
const fbController = require('./fbController');
const https = require('https');

const FB_VERSION = process.env.FB_API_VERSION || 'v19.0';

const isConfigured = () => {
  const pageId = fbController.getPageId();
  const token = fbController.getAccessToken();
  return pageId && token && !token.includes('placeholder');
};

// ── Jitter ─────────────────────────────────────────────────────────────────────
// Adds ±0 to 30 minutes of randomness to make posts look organic
const JITTER_MAX_MS = 30 * 60 * 1000; // 30 minutes

const randomJitter = () => Math.floor(Math.random() * JITTER_MAX_MS);

// ── Post to Facebook ──────────────────────────────────────────────────────────
async function postToFacebook(message, imageUrl) {
  const axios = require('axios');
  const fbAxios = axios.create({
    baseURL: `https://graph.facebook.com/${FB_VERSION}`,
    httpsAgent: process.env.NODE_ENV !== 'production'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
    timeout: 20000,
  });

  const token = fbController.getAccessToken();
  const pageId = fbController.getPageId();

  if (imageUrl && !imageUrl.startsWith('data:')) {
    // Post with photo URL
    const params = { url: imageUrl, access_token: token };
    if (message) params.message = message;
    const res = await fbAxios.post(`/${pageId}/photos`, null, { params });
    return res.data;
  } else {
    // Text-only post
    const res = await fbAxios.post(`/${pageId}/feed`, null, {
      params: { message, access_token: token },
    });
    return res.data;
  }
}

// ── AI Auto-Post job ──────────────────────────────────────────────────────────

/**
 * Run one AI generation + Facebook post cycle.
 * @param {Object} opts
 * @param {string} [opts.tag]       Force topic tag
 * @param {string} [opts.format]    Force post format
 * @param {string} [opts.provider]  AI provider: 'auto'|'cloudflare'|'openai'|'gemini'|'local'
 * @param {boolean} [opts.dryRun]  Generate but don't post
 * @returns {Promise<Object>} result metadata
 */
async function runAiAutoPost(opts = {}) {
  const settings = db.settings.get();
  const aiSettings = settings.aiAutoPoster || {};

  const options = {
    tag:       opts.tag      || aiSettings.topicTag  || undefined,
    format:    opts.format   || aiSettings.postFormat || undefined,
    withImage: opts.withImage !== undefined ? opts.withImage : (aiSettings.withImage !== false),
    provider:  opts.provider || aiSettings.provider   || 'auto',
    dryRun:    opts.dryRun   || false,
  };

  console.log('[ai-autoposter] Generating content...', { tag: options.tag, format: options.format, provider: options.provider });

  let generated;
  try {
    generated = await generateContent(options);
    console.log(`[ai-autoposter] Generated (${generated.provider}): topic=${generated.topic.tag}, format=${generated.format}`);
  } catch (e) {
    const msg = `Content generation failed: ${e.message}`;
    console.error('[ai-autoposter]', msg);
    db.history.add({ type: 'ai-auto', status: 'error', error: msg, source: '[ai-autoposter]' });
    throw e;
  }

  if (options.dryRun) {
    console.log('[ai-autoposter] DRY RUN — not posting');
    return { dryRun: true, generated };
  }

  if (!isConfigured()) {
    console.log('[ai-autoposter] Not posting — Facebook credentials not configured. Saving to queue instead.');
    const queued = db.queue.add({
      message: generated.message,
      imageUrl: generated.imageUrl || null,
      type: generated.imageUrl ? 'photo' : 'text',
      source: 'ai-autoposter',
      topic: generated.topic,
      format: generated.format,
      aiProvider: generated.provider,
    });
    db.history.add({
      type: 'ai-auto',
      message: generated.message.substring(0, 120),
      status: 'queued',
      source: '[ai-autoposter]',
      topic: generated.topic.tag,
      queueId: queued.id,
    });
    return { queued: true, queueId: queued.id, generated };
  }

  // Post to Facebook
  try {
    const result = await postToFacebook(generated.message, generated.imageUrl);
    console.log(`[ai-autoposter] Posted to Facebook! Post ID: ${result.id}`);

    // Upload to Google Drive if configured (Non-blocking)
    if (generated.imageUrl) {
      const { uploadToGoogleDrive } = require('./googleDrive');
      uploadToGoogleDrive(generated.imageUrl, `ai-photo-${result.id}.png`).catch(e => {
        console.error('[ai-autoposter] Non-blocking Google Drive upload failure:', e.message);
      });
    }

    db.history.add({
      type: 'ai-auto',
      message: generated.message.substring(0, 120),
      status: 'success',
      postId: result.id,
      source: '[ai-autoposter]',
      topic: generated.topic.tag,
      format: generated.format,
      aiProvider: generated.provider,
      hasImage: !!generated.imageUrl,
    });

    return { posted: true, postId: result.id, generated };
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.message;
    console.error('[ai-autoposter] Facebook post failed:', msg);

    // Save to queue as fallback on FB error
    const queued = db.queue.add({
      message: generated.message,
      imageUrl: generated.imageUrl || null,
      type: generated.imageUrl ? 'photo' : 'text',
      source: 'ai-autoposter-retry',
      topic: generated.topic,
      error: msg,
    });

    db.history.add({
      type: 'ai-auto',
      message: generated.message.substring(0, 120),
      status: 'error',
      error: msg,
      source: '[ai-autoposter]',
      queueId: queued.id,
    });

    throw new Error(msg);
  }
}

// ── Cron schedule calculation ──────────────────────────────────────────────────

/**
 * Get next 3h slot cron expressions for current day (8 slots: 0,3,6,9,12,15,18,21)
 * We use a fixed 3-hour schedule but apply jitter at runtime.
 */
const AI_AUTOPOSTER_CRON = '0 0,3,6,9,12,15,18,21 * * *'; // every 3h on the hour

/**
 * The actual job wrapper — applies jitter before posting.
 */
async function aiAutoPostWithJitter(opts = {}) {
  const settings = db.settings.get();
  const aiSettings = settings.aiAutoPoster || {};

  if (!aiSettings.enabled) {
    console.log('[ai-autoposter] Disabled in settings — skipping.');
    return;
  }

  const jitter = randomJitter();
  console.log(`[ai-autoposter] Waiting ${Math.round(jitter / 60000)}m jitter before posting...`);

  await new Promise(resolve => setTimeout(resolve, jitter));

  try {
    await runAiAutoPost(opts);
  } catch (e) {
    // Already logged above
  }
}

module.exports = {
  runAiAutoPost,
  aiAutoPostWithJitter,
  AI_AUTOPOSTER_CRON,
};
