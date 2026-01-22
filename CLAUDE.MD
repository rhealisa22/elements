# Elements Project

An interactive web project containing creative UI components and visualizations.

## Project Structure

```
elements/
├── weather-ticket/         # Weather Ticket - Location-based weather display
│   ├── index.html          # Weather ticket UI with custom styling
│   └── app.js              # Weather data and geolocation logic
│
└── record-player/          # Vinyl Record Player - Interactive music player
    ├── index.html          # Record player interface
    ├── script.js           # Audio playback and vinyl animation
    ├── styles.css          # Visual styling for turntable
    ├── server.js           # Backend server for music streaming
    └── music/              # Audio files
```

## Components

### 1. Weather Ticket (`/weather-ticket/`)

An elegant weather display interface that shows current weather conditions in a ticket-style layout.

**Features:**
- Real-time weather data using Open-Meteo API (no API key required)
- Automatic geolocation with IP-based fallback
- Temperature unit toggle (Fahrenheit/Celsius)
- Minimalist, ticket-inspired design
- Displays: temperature, weather condition, humidity, wind speed

**Key Files:**
- `weather-ticket/index.html:1-165` - Weather ticket UI with custom styling
- `weather-ticket/app.js:1-274` - Handles geolocation, weather API calls, and display logic

**Technical Details:**
- Uses browser Geolocation API with timeout fallback
- Falls back to IP-based location via ipapi.co
- Weather data from Open-Meteo API (free, no key)
- WMO weather code interpretation for conditions
- Responsive temperature conversion

### 2. Vinyl Record Player (`/record-player/`)

An interactive vintage record player visualization with music playback.

**Features:**
- Interactive vinyl record animation
- Rotating vinyl with realistic spin effect
- Animated tonearm that moves to/from record
- Click/touch to play/pause
- Plays local MP3 file (Tessera - Relaxing Lofi)
- Beautiful wooden turntable design

**Key Files:**
- `record-player/index.html:1-40` - Record player structure
- `record-player/script.js:1-244` - Playback controls and animations
- `record-player/server.js` - Node.js server (optional, for streaming)

**Technical Details:**
- HTML5 Audio API for playback
- CSS animations for vinyl rotation and tonearm movement
- Touch and click event handling for mobile/desktop
- Works standalone with local MP3 or with backend server
- Handles autoplay restrictions with user interaction detection

**Audio Source:**
- Primary: Local file at `/music/Relaxing Lofi Tessera.mp3`
- Alternative: Backend streaming via Node.js server on port 3000
- Can be extended with additional royalty-free tracks

## Git Information

**Current Branch:** `record-player`
**Main Branch:** `main`

**Recent Commits:**
- f5b1704 - Changed audio source
- e734188 - Local mp3 file added, visual of vinyl improved
- e0b9433 - Main record component
- a1f3916 - Merge pull request #2 from rhealisa22/location-weather

## Development Notes

### Weather Ticket
- No build process required - pure HTML/CSS/JS
- CORS-friendly APIs (Open-Meteo, ipapi.co)
- Graceful error handling for network failures
- Default fallback data when APIs unavailable

### Record Player
- Can run directly in browser (file:// protocol) with local audio
- For streaming features, run: `node record-player/server.js`
- Server provides API endpoints for random track selection
- Mobile-optimized touch events

## API Dependencies

**Weather Ticket:**
- Open-Meteo API: `https://api.open-meteo.com/v1/forecast`
- IP Geolocation: `https://ipapi.co/json/`

**Record Player:**
- Optional backend server on `http://127.0.0.1:3000`
- Endpoints: `/api/lofi-track`, `/health`, `/tracks`

## Browser Support

Both components support modern browsers with:
- ES6 JavaScript
- CSS3 animations and transforms
- HTML5 Geolocation API (Weather Ticket)
- HTML5 Audio API (Record Player)
- Fetch API

## Design Philosophy

This project emphasizes:
- Clean, minimalist UI design
- No framework dependencies
- Vanilla JavaScript for simplicity
- Free/open APIs (no API key hassle)
- Mobile-first responsive design
- Graceful degradation and error handling

## Future Enhancements

Potential additions:
- More weather ticket themes/styles
- Multiple vinyl records with different tracks
- Playlist functionality for record player
- Weather-based music recommendations
- Shareable weather ticket images
