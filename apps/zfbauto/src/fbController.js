const axios = require('axios');
const db = require('./db');
const https = require('https');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_API_URL = 'https://graph.facebook.com/v19.0';

// Axios instance that tolerates self-signed certs in development
const FB_VERSION = process.env.FB_API_VERSION || 'v19.0';
const fbAxios = axios.create({
  baseURL: `https://graph.facebook.com/${FB_VERSION}`,
  httpsAgent:
    process.env.NODE_ENV !== 'production'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  timeout: 15000,
});

/** Helper: safe error response */
const fbError = (res, status, msg, raw) => {
  console.error(`[fbController] ${msg}`, raw || '');
  return res.status(status).json({
    ok: false,
    error: { code: 'FB_API_ERROR', message: msg, detail: raw?.message || String(raw || '') },
  });
};

const isConfigured = () => PAGE_ID && ACCESS_TOKEN && !ACCESS_TOKEN.includes('placeholder');

/**
 * POST /api/facebook/post-message
 * Body: { message, link? }
 */
const postMessage = async (req, res) => {
  const { message, link } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ ok: false, error: { code: 'MISSING_MESSAGE', message: 'message is required' } });
  }
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: { code: 'NOT_CONFIGURED', message: 'Facebook credentials are not configured' } });
  }

  try {
    const params = { message: message.trim(), access_token: ACCESS_TOKEN };
    if (link) params.link = link;

    const response = await fbAxios.post(`/${PAGE_ID}/feed`, null, { params });

    db.history.add({ type: 'text', message: message.trim(), postId: response.data.id, status: 'success' });

    return res.status(200).json({ ok: true, data: response.data });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    db.history.add({ type: 'text', message: message.trim(), status: 'error', error: String(raw) });
    return fbError(res, 500, raw?.message || 'Failed to post message', raw);
  }
};

/**
 * POST /api/facebook/post-photo
 * Body: { url, message? } OR multipart with file
 */
const postPhoto = async (req, res) => {
  const { url, message } = req.body;
  const hasUpload = req.file;

  if (!url && !hasUpload) {
    return res.status(400).json({ ok: false, error: { code: 'MISSING_PHOTO', message: 'url or file upload is required' } });
  }
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: { code: 'NOT_CONFIGURED', message: 'Facebook credentials are not configured' } });
  }

  try {
    let response;
    if (hasUpload) {
      // Upload from local file using form-data
      const form = new FormData();
      form.append('source', fs.createReadStream(req.file.path), req.file.originalname);
      if (message) form.append('message', message);
      form.append('access_token', ACCESS_TOKEN);

      response = await fbAxios.post(`/${PAGE_ID}/photos`, form, {
        headers: form.getHeaders(),
        httpsAgent: process.env.NODE_ENV !== 'production'
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      });

      // Clean up temp upload
      fs.unlinkSync(req.file.path);
    } else {
      const params = { url, access_token: ACCESS_TOKEN };
      if (message) params.message = message;
      response = await fbAxios.post(`/${PAGE_ID}/photos`, null, { params });
    }

    db.history.add({ type: 'photo', message: message || '', status: 'success', postId: response.data.id });

    return res.status(200).json({ ok: true, data: response.data });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    db.history.add({ type: 'photo', status: 'error', error: String(raw) });
    return fbError(res, 500, raw?.message || 'Failed to post photo', raw);
  }
};

/**
 * GET /api/facebook/posts
 * Query: ?limit=10&fields=message,created_time,story
 */
const getPosts = async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: { code: 'NOT_CONFIGURED', message: 'Facebook credentials are not configured' } });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const fields = req.query.fields || 'message,created_time,story,full_picture,permalink_url';

    const response = await fbAxios.get(`/${PAGE_ID}/feed`, {
      params: { access_token: ACCESS_TOKEN, limit, fields },
    });

    return res.status(200).json({ ok: true, data: response.data });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    return fbError(res, 500, raw?.message || 'Failed to fetch posts', raw);
  }
};

/**
 * DELETE /api/facebook/posts/:postId
 */
const deletePost = async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    return res.status(400).json({ ok: false, error: { code: 'MISSING_ID', message: 'postId is required' } });
  }
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: { code: 'NOT_CONFIGURED', message: 'Facebook credentials are not configured' } });
  }

  try {
    await fbAxios.delete(`/${postId}`, {
      params: { access_token: ACCESS_TOKEN },
    });

    db.history.add({ type: 'delete', postId, status: 'success' });
    return res.status(200).json({ ok: true, message: 'Post deleted successfully' });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    return fbError(res, 500, raw?.message || 'Failed to delete post', raw);
  }
};

/**
 * GET /api/facebook/insights
 * Fetch page insights: fan count, followers, engagement
 */
const getInsights = async (req, res) => {
  if (!isConfigured()) {
    // Return placeholder data in unconfigured state
    return res.status(200).json({
      ok: true,
      configured: false,
      data: { name: 'Not Connected', fan_count: 0, followers_count: 0 },
    });
  }

  try {
    const [pageRes, insightsRes] = await Promise.allSettled([
      fbAxios.get(`/${PAGE_ID}`, {
        params: { fields: 'fan_count,followers_count,name,about,category,picture', access_token: ACCESS_TOKEN },
      }),
      fbAxios.get(`/${PAGE_ID}/insights`, {
        params: {
          metric: 'page_impressions,page_engaged_users,page_post_engagements',
          period: 'day',
          access_token: ACCESS_TOKEN,
        },
      }),
    ]);

    const pageData = pageRes.status === 'fulfilled' ? pageRes.value.data : {};
    const insightsData = insightsRes.status === 'fulfilled' ? insightsRes.value.data : {};

    return res.status(200).json({ ok: true, configured: true, data: pageData, insights: insightsData });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    return fbError(res, 500, raw?.message || 'Failed to fetch insights', raw);
  }
};

/**
 * GET /api/facebook/config
 */
const getConfig = (req, res) => {
  const settings = db.settings.get();
  return res.status(200).json({
    ok: true,
    data: {
      pageId: PAGE_ID || null,
      hasAccessToken: !!ACCESS_TOKEN && !ACCESS_TOKEN.includes('placeholder'),
      schedulerEnabled: settings.schedulerEnabled,
      defaultCron: settings.defaultCron,
      queueLength: db.queue.getAll().length,
      pendingCount: db.queue.getPending().length,
    },
  });
};

// ── Queue API ─────────────────────────────────────────────────────────────────

/**
 * GET /api/queue
 */
const getQueue = (req, res) => {
  return res.status(200).json({ ok: true, data: db.queue.getAll() });
};

/**
 * POST /api/queue
 * Body: { message, imageUrl?, scheduledAt? }
 */
const addToQueue = (req, res) => {
  const { message, imageUrl, scheduledAt } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ ok: false, error: { code: 'MISSING_MESSAGE', message: 'message is required' } });
  }

  const entry = db.queue.add({
    message: message.trim(),
    imageUrl: imageUrl || null,
    scheduledAt: scheduledAt || null,
    type: imageUrl ? 'photo' : 'text',
  });

  return res.status(201).json({ ok: true, data: entry });
};

/**
 * DELETE /api/queue/:id
 */
const removeFromQueue = (req, res) => {
  const { id } = req.params;
  const removed = db.queue.remove(id);
  if (!removed) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Queue item not found' } });
  }
  return res.status(200).json({ ok: true, data: removed });
};

/**
 * DELETE /api/queue  — clear entire queue
 */
const clearQueue = (req, res) => {
  db.queue.clear();
  return res.status(200).json({ ok: true, message: 'Queue cleared' });
};

/**
 * POST /api/queue/:id/publish — immediately post a queued item
 */
const publishQueueItem = async (req, res) => {
  const { id } = req.params;
  const item = db.queue.getAll().find(q => q.id === id);
  if (!item) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Queue item not found' } });
  }
  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: { code: 'NOT_CONFIGURED', message: 'Facebook credentials are not configured' } });
  }

  db.queue.updateStatus(id, 'publishing');
  try {
    let response;
    if (item.imageUrl) {
      const params = { url: item.imageUrl, access_token: ACCESS_TOKEN };
      if (item.message) params.message = item.message;
      response = await fbAxios.post(`/${PAGE_ID}/photos`, null, { params });
    } else {
      response = await fbAxios.post(`/${PAGE_ID}/feed`, null, {
        params: { message: item.message, access_token: ACCESS_TOKEN },
      });
    }

    db.queue.updateStatus(id, 'published', { publishedAt: new Date().toISOString(), postId: response.data.id });
    db.history.add({ type: item.type, message: item.message, status: 'success', postId: response.data.id });

    return res.status(200).json({ ok: true, data: { queueItem: item, postResult: response.data } });
  } catch (error) {
    const raw = error.response?.data?.error || error.message;
    db.queue.updateStatus(id, 'error', { error: String(raw) });
    return fbError(res, 500, raw?.message || 'Failed to publish queue item', raw);
  }
};

// ── History API ───────────────────────────────────────────────────────────────

/**
 * GET /api/history
 */
const getHistory = (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  return res.status(200).json({ ok: true, data: db.history.getAll(limit) });
};

// ── Scheduler API ─────────────────────────────────────────────────────────────

/**
 * GET /api/schedules
 */
const getSchedules = (req, res) => {
  return res.status(200).json({ ok: true, data: db.schedules.getAll() });
};

/**
 * POST /api/schedules
 * Body: { name, cron, message, imageUrl? }
 */
const addSchedule = (req, res) => {
  const { name, cron, message } = req.body;
  if (!name || !cron || !message) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'name, cron, and message are required' },
    });
  }

  const entry = db.schedules.add({ name, cron, message, imageUrl: req.body.imageUrl || null });
  return res.status(201).json({ ok: true, data: entry });
};

/**
 * PATCH /api/schedules/:id
 */
const updateSchedule = (req, res) => {
  const { id } = req.params;
  const updated = db.schedules.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
  }
  return res.status(200).json({ ok: true, data: updated });
};

/**
 * DELETE /api/schedules/:id
 */
const removeSchedule = (req, res) => {
  const { id } = req.params;
  const removed = db.schedules.remove(id);
  if (!removed) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
  }
  return res.status(200).json({ ok: true, data: removed });
};

// ── Settings API ──────────────────────────────────────────────────────────────

/**
 * GET /api/settings
 */
const getSettings = (req, res) => {
  return res.status(200).json({ ok: true, data: db.settings.get() });
};

/**
 * PATCH /api/settings
 */
const updateSettings = (req, res) => {
  const allowed = ['defaultCron', 'schedulerEnabled', 'autoPostTemplate', 'maxQueueSize'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  const updated = db.settings.update(updates);
  return res.status(200).json({ ok: true, data: updated });
};

module.exports = {
  postMessage,
  postPhoto,
  getPosts,
  deletePost,
  getInsights,
  getConfig,
  getQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  publishQueueItem,
  getHistory,
  getSchedules,
  addSchedule,
  updateSchedule,
  removeSchedule,
  getSettings,
  updateSettings,
};
