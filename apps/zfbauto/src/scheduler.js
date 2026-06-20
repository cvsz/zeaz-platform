const cron = require('node-cron');
const db = require('./db');
const fbController = require('./fbController');
const https = require('https');

const FB_VERSION = process.env.FB_API_VERSION || 'v19.0';

const isConfigured = () => {
  const pageId = fbController.getPageId();
  const token = fbController.getAccessToken();
  return pageId && token && !token.includes('placeholder');
};

// Active cron job registry: { [scheduleId]: cronJob }
const activeJobs = {};

/**
 * Post a message to the Facebook page.
 */
const postToFacebook = async (message, imageUrl = null) => {
  const axios = require('axios');
  const fbAxios = axios.create({
    baseURL: `https://graph.facebook.com/${FB_VERSION}`,
    httpsAgent: process.env.NODE_ENV !== 'production'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
    timeout: 15000,
  });

  const pageId = fbController.getPageId();
  const token = fbController.getAccessToken();

  if (imageUrl && !imageUrl.startsWith('data:')) {
    const params = { url: imageUrl, access_token: token };
    if (message) params.message = message;
    const r = await fbAxios.post(`/${pageId}/photos`, null, { params });
    return r.data;
  } else {
    const r = await fbAxios.post(`/${pageId}/feed`, null, {
      params: { message, access_token: token },
    });
    return r.data;
  }
};

/**
 * Auto-post logic: pulls next pending item from queue, or uses template.
 */
const autoPostToPage = async (scheduleId = null, customMessage = null) => {
  const label = scheduleId ? `[schedule:${scheduleId}]` : '[auto]';
  console.log(`${label} Running auto-post...`);

  // Check token age / trigger auto-refresh if close to expiration (every 30 days or so, or if checked and saved user token exists)
  try {
    const settings = db.settings.get();
    if (settings.facebookUserAccessToken && settings.facebookTokenRefreshedAt) {
      const refreshedAt = new Date(settings.facebookTokenRefreshedAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - refreshedAt > thirtyDays) {
        console.log('[scheduler] Saved token is older than 30 days. Auto-refreshing Page Access Token...');
        await fbController.refreshToken();
      }
    }
  } catch (err) {
    console.error('[scheduler] Failed to auto-refresh token during autoPost preflight:', err.message);
  }

  if (!isConfigured()) {
    console.log(`${label} Skipping: credentials not configured.`);
    return;
  }

  try {
    const pending = db.queue.getPending();
    if (pending.length > 0) {
      const item = pending[0];
      console.log(`${label} Publishing queued item: ${item.id}`);
      db.queue.updateStatus(item.id, 'publishing');
      const result = await postToFacebook(item.message, item.imageUrl);
      // Upload to Google Drive if configured (Non-blocking)
      if (item.imageUrl) {
        const { uploadToGoogleDrive } = require('./googleDrive');
        uploadToGoogleDrive(item.imageUrl, `queue-photo-${result.id}.png`).catch(e => {
          console.error('[scheduler] Non-blocking Google Drive upload failure:', e.message);
        });
      }

      db.queue.updateStatus(item.id, 'published', { publishedAt: new Date().toISOString(), postId: result.id });
      db.history.add({ type: item.type, message: item.message, status: 'success', postId: result.id, source: label });
      console.log(`${label} Published queued item ${item.id} → FB post ${result.id}`);
      return;
    }

    const settings = db.settings.get();
    const message = customMessage
      || settings.autoPostTemplate.replace('{TIME}', new Date().toLocaleString());

    const result = await postToFacebook(message);
    db.history.add({ type: 'text', message, status: 'success', postId: result.id, source: label });
    console.log(`${label} Auto-posted template → FB post ${result.id}`);
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error(`${label} Auto-post failed:`, msg);
    db.history.add({ type: 'auto', status: 'error', error: msg, source: label });
  }
};

/**
 * Register a cron job for a custom schedule entry from DB.
 */
const registerSchedule = (schedule) => {
  if (activeJobs[schedule.id]) {
    activeJobs[schedule.id].stop();
    delete activeJobs[schedule.id];
  }
  if (!schedule.enabled) return;
  if (!cron.validate(schedule.cron)) {
    console.warn(`[scheduler] Invalid cron for schedule ${schedule.id}: "${schedule.cron}"`);
    return;
  }
  activeJobs[schedule.id] = cron.schedule(schedule.cron, () => {
    autoPostToPage(schedule.id, schedule.message || null);
  });
  console.log(`[scheduler] Registered schedule "${schedule.name}" (${schedule.cron})`);
};

/**
 * Stop and remove a cron job by schedule ID.
 */
const unregisterSchedule = (scheduleId) => {
  if (activeJobs[scheduleId]) {
    activeJobs[scheduleId].stop();
    delete activeJobs[scheduleId];
    console.log(`[scheduler] Unregistered schedule ${scheduleId}`);
  }
};

/**
 * Register the AI Auto-Poster 3-hour job.
 */
const registerAiAutoPoster = () => {
  // Lazy require to avoid circular deps
  let aiAutoPoster;
  try { aiAutoPoster = require('./aiAutoPoster'); } catch (e) {
    console.error('[scheduler] Could not load aiAutoPoster:', e.message);
    return;
  }

  const { aiAutoPostWithJitter, AI_AUTOPOSTER_CRON } = aiAutoPoster;

  if (activeJobs['__ai_autoposter__']) {
    activeJobs['__ai_autoposter__'].stop();
    delete activeJobs['__ai_autoposter__'];
  }

  if (!cron.validate(AI_AUTOPOSTER_CRON)) {
    console.warn('[scheduler] Invalid AI autoposter cron:', AI_AUTOPOSTER_CRON);
    return;
  }

  activeJobs['__ai_autoposter__'] = cron.schedule(AI_AUTOPOSTER_CRON, () => {
    aiAutoPostWithJitter();
  });

  console.log(`[scheduler] AI Auto-Poster registered (${AI_AUTOPOSTER_CRON}) — posts every 3h with random jitter.`);
};

/**
 * Initialize all scheduler jobs from DB and settings.
 */
const initJobs = () => {
  const settings = db.settings.get();

  // Default hourly queue-drain job
  if (settings.schedulerEnabled) {
    const defaultCron = settings.defaultCron || '0 * * * *';
    if (cron.validate(defaultCron)) {
      activeJobs['__default__'] = cron.schedule(defaultCron, () => autoPostToPage());
      console.log(`[scheduler] Default auto-post job initialized (${defaultCron}).`);
    }
  }

  // AI Content Auto-Poster (every 3h)
  const aiSettings = settings.aiAutoPoster || {};
  if (aiSettings.enabled !== false) {
    registerAiAutoPoster();
  } else {
    console.log('[scheduler] AI Auto-Poster is disabled in settings.');
  }

  // Custom schedules from DB
  const schedules = db.schedules.getAll();
  for (const schedule of schedules) {
    registerSchedule(schedule);
  }

  // Set up token auto-refresh check job (checks daily at 02:00)
  activeJobs['__token_refresh__'] = cron.schedule('0 2 * * *', async () => {
    console.log('[scheduler] Running scheduled token refresh check...');
    try {
      const currentSettings = db.settings.get();
      if (currentSettings.facebookUserAccessToken && currentSettings.facebookTokenRefreshedAt) {
        const refreshedAt = new Date(currentSettings.facebookTokenRefreshedAt).getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - refreshedAt > thirtyDays) {
          console.log('[scheduler] Saved token is older than 30 days. Auto-refreshing Page Access Token...');
          await fbController.refreshToken();
        }
      }
    } catch (err) {
      console.error('[scheduler] Daily token refresh job error:', err.message);
    }
  });

  console.log(`[scheduler] Initialized ${Object.keys(activeJobs).length} cron job(s).`);
};

/**
 * Restart the default job with a new cron expression.
 */
const restartDefaultJob = (cronExpr) => {
  if (activeJobs['__default__']) {
    activeJobs['__default__'].stop();
    delete activeJobs['__default__'];
  }
  if (cronExpr && cron.validate(cronExpr)) {
    activeJobs['__default__'] = cron.schedule(cronExpr, () => autoPostToPage());
    console.log(`[scheduler] Default job restarted: ${cronExpr}`);
    return true;
  }
  return false;
};

/**
 * Toggle the AI auto-poster on/off at runtime.
 */
const setAiAutoPosterEnabled = (enabled) => {
  if (enabled) {
    registerAiAutoPoster();
  } else {
    if (activeJobs['__ai_autoposter__']) {
      activeJobs['__ai_autoposter__'].stop();
      delete activeJobs['__ai_autoposter__'];
      console.log('[scheduler] AI Auto-Poster disabled.');
    }
  }
  // Persist
  db.settings.update({ aiAutoPoster: { ...(db.settings.get().aiAutoPoster || {}), enabled } });
};

/**
 * Get status of all active jobs.
 */
const getStatus = () => ({
  activeJobs: Object.keys(activeJobs),
  count: Object.keys(activeJobs).length,
  aiAutoPosterActive: !!activeJobs['__ai_autoposter__'],
});

module.exports = {
  initJobs,
  autoPostToPage,
  registerSchedule,
  unregisterSchedule,
  registerAiAutoPoster,
  setAiAutoPosterEnabled,
  restartDefaultJob,
  getStatus,
};
