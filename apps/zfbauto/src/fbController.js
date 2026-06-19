const axios = require('axios');

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_API_URL = 'https://graph.facebook.com/v19.0';

/**
 * Post a message to the Facebook page.
 * Request body: { "message": "Your text here" }
 */
const postMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(`${FB_API_URL}/${PAGE_ID}/feed`, null, {
      params: {
        message,
        access_token: ACCESS_TOKEN
      }
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error posting message to Facebook:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to post message to Facebook'
    });
  }
};

/**
 * Post a photo to the Facebook page.
 * Request body: { "url": "http://image.url", "message": "Optional text" }
 */
const postPhoto = async (req, res) => {
  const { url, message } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const params = {
      url,
      access_token: ACCESS_TOKEN
    };
    if (message) {
      params.message = message;
    }

    const response = await axios.post(`${FB_API_URL}/${PAGE_ID}/photos`, null, { params });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error posting photo to Facebook:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to post photo to Facebook'
    });
  }
};

/**
 * Get recent posts from the Facebook page.
 */
const getPosts = async (req, res) => {
  try {
    const response = await axios.get(`${FB_API_URL}/${PAGE_ID}/feed`, {
      params: {
        access_token: ACCESS_TOKEN
      }
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching posts from Facebook:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to fetch posts from Facebook'
    });
  }
};

module.exports = {
  postMessage,
  postPhoto,
  getPosts
};
