const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache();

const fetchWeather = async(coordinates) => {
    const cacheKey = `weather_${coordinates}`;
    const cachedWeather = cache.get(cacheKey);
    if (cachedWeather)
        return cachedWeather;

    const weatherRes = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${coordinates}&aqi=no`);
    const weatherData = weatherRes.data;
    
    // If the weather data, or weather data.current does not exist or is empty fetch weather from OWP
    if (!weatherData || !weatherData.current || Object.keys(weatherData.current).length === 0){
        return fetchWeatherFromOWP(coordinates);
    }
    
    const weatherJSON = {
        weather: {
            location: weatherData.location.name,
            temp_f: weatherData.current.temp_f,
            feelsLike_f: weatherData.current.feelslike_f,
            condition: {
                icon: `https:${weatherData.current.condition.icon}`,
                text: weatherData.current.condition.text
            },
        },
        wind: {
            wind_mph: weatherData.current.wind_mph,
            windDirection_degree: weatherData.current.wind_degree
        } 
    };
    
    cache.set(cacheKey, weatherJSON, process.env.CACHE_EXPIRATION);

    return weatherJSON;
};

const fetchWeatherFromOWP = async(coordinates) =>{
    console.log("OpenWeather Map Triggered");

    const cacheKey = `owpWeather_${coordinates}`;
    const cachedWeather = cache.get(cacheKey);
    
    const coordinatesArr = coordinates.split(',');

    if (cachedWeather)
        return cachedWeather;

    const openWeatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinatesArr[0]}&lon=${coordinatesArr[1]}&appid=${process.env.OPENWEATHER_MAP_API_KEY}&units=imperial`
    );
    const openWeatherData = openWeatherRes.data;
    
    const weatherJSON = {
        weather: {
            location: openWeatherData.name,
            temp_f: openWeatherData.main.temp,
            feelslike_f: openWeatherData.main.feels_like,
            condition: {
                icon: `https://openweathermap.org/img/wn/${openWeatherData.weather[0].icon}.png`,
                text: openWeatherData.weather[0].main
            },
        },
        wind: {
            wind_mph: openWeatherData.wind.speed,
            wind_degree: openWeatherData.wind.deg
        }
    };
    cache.set(cacheKey, weatherJSON, process.env.CACHE_EXPIRATION);
    return weatherJSON;
};

module.exports = {
    fetchWeather
};