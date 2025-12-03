// routes/weather.js
const express = require('express');
const router = express.Router();
const request = require('request');

// Load API key from environment
const apiKey = process.env.OWM_API_KEY;

// Basic page with form
router.get('/', (req, res) => {
  res.render('weather', {
    title: 'Weather',
    weather: null,
    error: null
  });
});

// Handle form submission and fetch weather data
router.get('/now', (req, res, next) => {
  const city = (req.query.city || 'London').trim();

  if (!apiKey) {
    return res.status(500).send('Weather API key not configured on server.');
  }

  const url = `http://api.openweathermap.org/data/2.5/weather` +
              `?q=${encodeURIComponent(city)}` +
              `&units=metric&appid=${apiKey}`;

  request(url, (err, response, body) => {
    if (err) {
      return next(err);             
    }

    let weather;
    try {
      weather = JSON.parse(body);
    } catch (e) {
      return res.status(500).send('Error parsing weather data from API.');
    }

    // Error handling for bad city name
    if (!weather || !weather.main) {
      return res.render('weather', {
        title: 'Weather',
        weather: null,
        error: `No data found for "${city}".`
      });
    }

    // Build a friendly message
    const wmsg = {
      city: weather.name,
      temp: weather.main.temp,
      humidity: weather.main.humidity,
      feelsLike: weather.main.feels_like,
      min: weather.main.temp_min,
      max: weather.main.temp_max,
      windSpeed: weather.wind && weather.wind.speed,
      description: weather.weather && weather.weather[0] && weather.weather[0].description
    };

    res.render('weather', {
      title: 'Weather',
      weather: wmsg,
      error: null
    });
  });
});

module.exports = router;
