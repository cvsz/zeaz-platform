const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const os = require('os');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// File upload handling (temp dir, max 10MB)
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ── Controllers ───────────────────────────────────────────────────────────────
const fb = require('./fbController');
const scheduler = require('./scheduler');

// ── Routes ────────────────────────────────────────────────────────────────────

// Health
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'zfbauto',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    scheduler: scheduler.getStatus(),
  });
});

// Facebook API
app.post('/api/facebook/post-message', fb.postMessage);
app.post('/api/facebook/post-photo', upload.single('image'), fb.postPhoto);
app.get('/api/facebook/posts', fb.getPosts);
app.delete('/api/facebook/posts/:postId', fb.deletePost);
app.get('/api/facebook/insights', fb.getInsights);
app.get('/api/facebook/config', fb.getConfig);

// Queue
app.get('/api/queue', fb.getQueue);
app.post('/api/queue', fb.addToQueue);
app.delete('/api/queue', fb.clearQueue);
app.delete('/api/queue/:id', fb.removeFromQueue);
app.post('/api/queue/:id/publish', fb.publishQueueItem);

// Post History
app.get('/api/history', fb.getHistory);

// Schedules
app.get('/api/schedules', fb.getSchedules);
app.post('/api/schedules', fb.addSchedule);
app.patch('/api/schedules/:id', fb.updateSchedule);
app.delete('/api/schedules/:id', fb.removeSchedule);

// Settings
app.get('/api/settings', fb.getSettings);
app.patch('/api/settings', fb.updateSettings);

// ── AI Content Generator API ────────────────────────────────────────────────
const { generateContent, getTopics, getFormats } = require('./contentGenerator');
const { runAiAutoPost } = require('./aiAutoPoster');
const db = require('./db');

/**
 * GET /api/ai/topics — list all available topics
 */
app.get('/api/ai/topics', (req, res) => {
  return res.status(200).json({ ok: true, data: getTopics() });
});

/**
 * GET /api/ai/formats — list all post formats
 */
app.get('/api/ai/formats', (req, res) => {
  return res.status(200).json({ ok: true, data: getFormats() });
});

/**
 * POST /api/ai/generate — generate content (preview, don't post)
 * Body: { tag?, format?, withImage?, provider? }
 */
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { tag, format, withImage, provider } = req.body;
    const content = await generateContent({ tag, format, withImage: withImage !== false, provider: provider || 'auto' });
    return res.status(200).json({ ok: true, data: content });
  } catch (e) {
    return res.status(500).json({ ok: false, error: { code: 'GENERATION_ERROR', message: e.message } });
  }
});

/**
 * POST /api/ai/generate-and-post — generate + post to Facebook immediately
 * Body: { tag?, format?, withImage?, provider? }
 */
app.post('/api/ai/generate-and-post', async (req, res) => {
  try {
    const { tag, format, withImage, provider, dryRun } = req.body;
    const result = await runAiAutoPost({ tag, format, withImage, provider, dryRun });
    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: { code: 'POST_ERROR', message: e.message } });
  }
});

/**
 * PATCH /api/ai/settings — update AI auto-poster configuration
 * Body: { enabled?, topicTag?, postFormat?, withImage?, provider?, intervalHours? }
 */
app.patch('/api/ai/settings', (req, res) => {
  const allowed = ['enabled', 'topicTag', 'postFormat', 'withImage', 'provider', 'intervalHours'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  const current = db.settings.get();
  const aiSettings = { ...(current.aiAutoPoster || {}), ...updates };
  db.settings.update({ aiAutoPoster: aiSettings });

  // Apply enable/disable change at runtime
  if ('enabled' in updates) {
    scheduler.setAiAutoPosterEnabled(updates.enabled);
  }

  return res.status(200).json({ ok: true, data: aiSettings });
});

/**
 * GET /api/ai/settings — get AI auto-poster configuration
 */
app.get('/api/ai/settings', (req, res) => {
  const settings = db.settings.get();
  return res.status(200).json({ ok: true, data: settings.aiAutoPoster || { enabled: true } });
});

// Scheduler control
app.post('/api/scheduler/trigger', async (req, res) => {
  try {
    await scheduler.autoPostToPage();
    return res.status(200).json({ ok: true, message: 'Manual trigger executed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: { message: e.message } });
  }
});

app.post('/api/scheduler/restart', (req, res) => {
  const { cron } = req.body;
  const ok = scheduler.restartDefaultJob(cron);
  if (ok) return res.status(200).json({ ok: true, message: `Default job restarted with ${cron}` });
  return res.status(400).json({ ok: false, error: { message: 'Invalid cron expression' } });
});

// Catch-all: serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File too large (max 10MB)' } });
  }
  return res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`✅ zfbauto server listening on http://localhost:${port}`);
  scheduler.initJobs();
});
