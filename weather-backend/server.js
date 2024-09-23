const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // Import path for serving static files
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const WEATHERSTACK_API_URL = 'http://api.weatherstack.com/current';
const API_KEY = process.env.WEATHERSTACK_API_KEY;

// Weather data endpoint
app.get('/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const response = await axios.get(`${WEATHERSTACK_API_URL}?access_key=${API_KEY}&query=${city}`);
    const data = response.data;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't match one above, send back the React app.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
