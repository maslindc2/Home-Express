const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache();

const fetchWeather = async(zipCode) => {
    const cacheKey = `weather_${zipCode}`;
    const cachedWeather = cache.get(cacheKey);
    if (cachedWeather)
        return cachedWeather;

    const weatherRes = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${zipCode}&aqi=no`);
    const weatherData = weatherRes.data;
    
    const weatherJSON = {
        location: weatherData.location.name,
        temp_f: weatherData.current.temp_f,
        feelslike_f: weatherData.current.feelslike_f,
        condition: weatherData.current.condition.text,
        wind_mph: weatherData.current.wind_mph
    }
    
    cache.set(cacheKey, weatherJSON, process.env.CACHE_EXPIRATION);

    return weatherJSON;
};

module.exports = {
    fetchWeather
};