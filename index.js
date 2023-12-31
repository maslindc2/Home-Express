const { fetchPurpleAir } = require('./airQualityService');
const { fetchWeather } = require('./weatherService');

const rateLimiter = require('express-rate-limit');
const express = require('express');
const helmet = require('helmet');


require('dotenv').config();

if (!process.env.WEATHER_API_KEY || !process.env.PURPLE_AIR_API_KEY || !process.env.OPENWEATHER_MAP_API_KEY) {
    console.error('Error: Missing required environment variables.');
    process.exit(1);
}

const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
    windowMs: process.env.WINDOW_MIN * 60 * 1000, // 10 minute window
    max: process.env.MAX_REQUESTS, //limit each IP to 10 requests
});

app.use(limiter);
app.use(helmet());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`);
});

app.get('/', async (req, res) => {
    res.send('Welcome to Home Express. The route for posting requests is /fetch')
});

app.post('/fetch', async (req,res) => {
    try {
        const coordinates = req.body.data.coordinates;
        const aqiSensor = req.body.data.sensor;

        if (!coordinates || !aqiSensor){
            res.status(400).json({ success: false, error: 'Zip Code or AQI Sensor was not defined in the request' });
        }else{
            const [weatherData, purpleAir] = await Promise.all([
                fetchWeather(coordinates),
                fetchPurpleAir(aqiSensor)
            ]);
            res.status(200).json({
                success: true, 
                weatherData,
                purpleAir
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
});

module.exports = app;