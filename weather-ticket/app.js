// Global variables
let weatherData = null;
let currentTemperatureF = null;
let currentUnit = 'F';
let userLocation = null;
let locationName = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    initializeApp();
});

// Main initialization
async function initializeApp() {
    try {
        console.log('Starting app initialization...');
        
        // Get geolocation
        console.log('Requesting geolocation permission...');
        userLocation = await getGeolocation();
        console.log('Location obtained:', userLocation);
        
        // Get location name - use city from IP geolocation or fetch it
        console.log('Getting location name...');
        locationName = await getLocationName(userLocation);
        console.log('Location name:', locationName);
        
        // Fetch weather data
        console.log('Fetching weather data...');
        weatherData = await fetchWeatherData(userLocation.latitude, userLocation.longitude);
        console.log('Weather data obtained:', weatherData);
        currentTemperatureF = weatherData.temp;

        // Display the ticket
        console.log('Displaying ticket...');
        displayTicket();
    } catch (error) {
        console.error('Error initializing app:', error);
        handleError(error);
    }
}

// Get user's geolocation
function getGeolocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported, using IP-based location');
            fallbackGeolocation().then(resolve).catch(reject);
            return;
        }

        // Set a timeout for geolocation
        const timeout = setTimeout(() => {
            console.warn('Geolocation timeout, using IP-based location');
            fallbackGeolocation().then(resolve).catch(reject);
        }, 10000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeout);
                const { latitude, longitude } = position.coords;
                console.log('User allowed geolocation');
                // Also get city/country from IP to have complete location data
                fallbackGeolocation().then(ipLocation => {
                    resolve({
                        latitude,
                        longitude,
                        city: ipLocation.city,
                        country: ipLocation.country
                    });
                }).catch(() => {
                    // If fallback fails, just return lat/lon
                    resolve({ latitude, longitude });
                });
            },
            (error) => {
                clearTimeout(timeout);
                console.warn('Geolocation permission denied, using IP-based location:', error);
                fallbackGeolocation().then(resolve).catch(reject);
            }
        );
    });
}

// Fallback: Get location from IP
async function fallbackGeolocation() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        
        const data = await response.json();
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || 'Unknown',
            country: data.country_name || ''
        };
    } catch (error) {
        console.warn('Could not determine location from IP:', error);
        // Return default coordinates (center of US) if all fails
        return {
            latitude: 39.8283,
            longitude: -98.5795,
            city: 'Central US',
            country: 'United States'
        };
    }
}

// Fetch weather data
async function fetchWeatherData(lat, lon) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit&timezone=auto`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        const current = data.current;
        
        // Convert weather code to description
        const description = getWeatherDescription(current.weather_code);
        
        return {
            temp: Math.round(current.temperature_2m),
            description: description,
            code: current.weather_code,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m)
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        // Return default weather data if fetch fails
        return {
            temp: 72,
            description: 'Clear',
            code: 0,
            humidity: 0,
            windSpeed: 0
        };
    }
}

// Get location name from location object or coordinates
async function getLocationName(locationObj) {
    try {
        // First, try to use city/country from IP geolocation if available
        if (locationObj && locationObj.city) {
            const country = locationObj.country || '';
            const name = `${locationObj.city}${country ? ', ' + country : ''}`.trim().toUpperCase();
            console.log('Using city from IP geolocation:', name);
            return name;
        }
        
        console.log('No city in location object, location object:', locationObj);
        return 'YOUR LOCATION';
    } catch (error) {
        console.warn('Could not get location name:', error);
        return 'YOUR LOCATION';
    }
}

// Convert weather code to description (WMO Weather interpretation codes)
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Light Rain Showers',
        81: 'Rain Showers',
        82: 'Heavy Rain Showers',
        85: 'Light Snow Showers',
        86: 'Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
    };
    
    return weatherCodes[code] || 'Unknown';
}

// Display the weather ticket
function displayTicket() {
    try {
        console.log('displayTicket called');
        
        const tempF = currentTemperatureF;
        const tempC = Math.round((tempF - 32) * 5 / 9);
        const temp = currentUnit === 'F' ? tempF : tempC;
        
        // Get all elements
        const locationEl = document.getElementById('location');
        const tempEl = document.getElementById('temperature');
        const unitEl = document.getElementById('unit');
        const condEl = document.getElementById('condition');
        const condDetailEl = document.getElementById('conditionDetail');
        const humidityEl = document.getElementById('humidity');
        const windEl = document.getElementById('windSpeed');
        
        console.log('Elements found:', {
            location: !!locationEl,
            temperature: !!tempEl,
            unit: !!unitEl,
            condition: !!condEl,
            conditionDetail: !!condDetailEl,
            humidity: !!humidityEl,
            windSpeed: !!windEl
        });
        
        // Update elements if they exist
        if (locationEl) locationEl.textContent = locationName;
        if (tempEl) tempEl.textContent = temp;
        if (unitEl) unitEl.textContent = currentUnit;
        if (condEl) condEl.textContent = weatherData.description;
        if (condDetailEl) condDetailEl.textContent = weatherData.description;
        if (humidityEl) humidityEl.textContent = weatherData.humidity + '%';
        if (windEl) windEl.textContent = weatherData.windSpeed + ' mph';
        
        console.log('Display ticket completed');
    } catch (error) {
        console.error('Error in displayTicket:', error);
    }
}

// Toggle temperature unit
function toggleTemperature() {
    currentUnit = currentUnit === 'F' ? 'C' : 'F';
    const toggle = document.getElementById('toggleSwitch');
    toggle.classList.toggle('active');
    displayTicket();
}

// Switch temperature unit
function switchUnit(unit) {
    currentUnit = unit;
    displayTicket();
}

// Error handling
function handleError(error) {
    const content = document.getElementById('content');
    const errorMessage = error?.message || 'Unknown error occurred';
    console.error('Full error:', error);
    content.innerHTML = `
        <h2>Error</h2>
        <p>${errorMessage}</p>
        <p style="color: #999; font-size: 12px;">Check browser console (F12) for more details</p>
    `;
}
