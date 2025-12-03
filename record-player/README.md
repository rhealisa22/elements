# Vinyl Record Player

An interactive vintage record player interface with royalty-free music streaming. No API key required!

## Features

- 🎵 Interactive record player visualization
- 🎚️ Rotating vinyl with realistic animations
- 🎵 Curated royalty-free music tracks
- 🎨 Beautiful wooden turntable design
- 🔊 Automatic play/pause on hover
- ⚡ No API key needed - works out of the box

## Setup

### Quick Start

```bash
node server.js
```

Open `index.html` in your browser or navigate to `http://localhost:3000`.

That's it! No API key configuration needed.

### How to Use

- **Hover over the record player** - Music automatically starts playing
- **Move mouse away** - Music stops playing
- Vinyl rotates while music plays
- Tonearm moves to the vinyl when playing

## API Endpoints

- `GET /api/lofi-track` - Get a random track
- `GET /health` - Check server status and track count
- `GET /tracks` - List all available tracks

## Available Tracks

The player comes with 10 curated royalty-free tracks from:
- **Incompetech** (Kevin MacLeod)
- **Bensound** (Benjamin Tissot)
- **FreePD**

All tracks are free to use and properly licensed.

## Customization

### Add More Tracks

Edit the `musicTracks` array in `server.js` to add new tracks:

```javascript
{
    id: 11,
    title: 'Your Track Title',
    artist: 'Artist Name',
    url: 'https://your-music-url.mp3',
    image: 'https://via.placeholder.com/200?text=Your+Track',
    duration: 240
}
```

### Adjust Visual Settings

Edit `styles.css` to customize:
- Vinyl rotation speed: `vinyl-spin` animation
- Tonearm movement: `.tonearm.down` transform
- Colors and shadows: CSS variables in `.player-board`

## Music Sources


## Browser Support

Works in modern browsers that support:
- CSS animations and transforms
- Web Audio API
- ES6 JavaScript

## License

Open source - feel free to modify and use!

