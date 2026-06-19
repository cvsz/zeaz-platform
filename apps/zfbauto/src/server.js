const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const fbController = require('./fbController');
const scheduler = require('./scheduler');
const path = require('path');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "zfbauto service is running",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Facebook Auto Post Routes
app.post('/api/facebook/post-message', fbController.postMessage);
app.post('/api/facebook/post-photo', fbController.postPhoto);
app.get('/api/facebook/posts', fbController.getPosts);

app.listen(port, () => {
  console.log(`zfbauto server listening on port ${port}`);
  
  // Initialize cron jobs
  scheduler.initJobs();
});
