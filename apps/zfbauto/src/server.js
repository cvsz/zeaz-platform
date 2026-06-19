const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "zfbauto service is running",
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(port, () => {
  console.log(`zfbauto server listening on port ${port}`);
});
