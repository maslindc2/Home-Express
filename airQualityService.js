const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache();

const fetchPurpleAir = async(sensorLocation) => {
    const cacheKey = `purpleAir_${sensorLocation}`;
    const cachedPurpleAir = cache.get(cacheKey);

    if (cachedPurpleAir)
        return cachedPurpleAir;

    const purpleAirURL = `https://api.purpleair.com/v1/sensors/${sensorLocation}?fields=pm2.5_10minute_a`;
    const purpleAirRes = await axios.get(purpleAirURL, {
        headers: {
            'X-API-KEY': process.env.PURPLE_AIR_API_KEY
        }
    });
    
    const purpleAirData = purpleAirRes.data;
    const airQuality = {
        airQuality:{
            pm25: purpleAirData.sensor.stats_a['pm2.5_10minute']
        }
    }

    cache.set(cacheKey, airQuality, process.env.CACHE_EXPIRATION);

    return airQuality;
};

module.exports = {
    fetchPurpleAir
};