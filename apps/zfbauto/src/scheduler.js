const cron = require('node-cron');
const axios = require('axios');

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_API_URL = 'https://graph.facebook.com/v19.0';

/**
 * Perform the auto-posting logic.
 * Here you can fetch posts from a database, file, or external API
 * and then post them to the Facebook page.
 */
const autoPostToPage = async () => {
  console.log('Running auto-post to Facebook page...');

  if (!PAGE_ID || !ACCESS_TOKEN || ACCESS_TOKEN.includes('placeholder')) {
    console.log('Skipping auto-post: Valid FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required.');
    return;
  }

  // Example: We could fetch a quote of the day or similar content to post.
  // For demonstration, we'll post a simple automated message.
  const message = `Automated post at ${new Date().toLocaleString()} 🤖✨`;

  try {
    const response = await axios.post(`${FB_API_URL}/${PAGE_ID}/feed`, null, {
      params: {
        message,
        access_token: ACCESS_TOKEN
      }
    });
    console.log('Successfully posted to Facebook:', response.data);
  } catch (error) {
    console.error('Failed to post to Facebook:', error.response?.data || error.message);
  }
};

/**
 * Initialize all scheduled jobs.
 */
const initJobs = () => {
  // Schedule to run every hour at minute 0 (0 * * * *)
  cron.schedule('0 * * * *', autoPostToPage);
  console.log('Facebook auto-post scheduler initialized (runs every hour).');
};

module.exports = {
  initJobs,
  autoPostToPage
};
