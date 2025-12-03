const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Local music tracks
const musicTracks = [
    {
        id: 1,
        title: 'Relaxing Lofi',
        artist: 'Tessera',
        filename: 'music/Relaxing Lofi Tessera.mp3',
        duration: 180
    }
];

function getRandomTrack() {
    return musicTracks[Math.floor(Math.random() * musicTracks.length)];
}

// Proxy audio with CORS headers
function serveAudioFile(filename, res) {
    const filepath = path.join(__dirname, filename);
    
    console.log(`📡 Serving: ${filepath}`);
    
    fs.stat(filepath, (err, stats) => {
        if (err) {
            console.error(`❌ File not found: ${filename}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Audio file not found');
            return;
        }
        
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', stats.size);
        
        res.writeHead(200);
        
        const stream = fs.createReadStream(filepath);
        stream.pipe(res);
        
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.end();
        });
    });
}

// HTTP Server
const server = http.createServer((req, res) => {
    // Default CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/lofi-track') {
        console.log('\n🎧 Request for track...');
        
        const track = getRandomTrack();
        console.log(`✓ Now Playing: "${track.title}" by ${track.artist}`);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            id: track.id,
            title: track.title,
            artist: track.artist,
            url: `http://127.0.0.1:3000/api/audio/${track.id}`,
            image: track.image,
            duration: track.duration
        }));

    } else if (pathname.startsWith('/api/audio/')) {
        // Serve local audio file
        const trackId = parseInt(pathname.split('/').pop());
        const track = musicTracks.find(t => t.id === trackId);
        
        if (track) {
            console.log(`🔊 Streaming: ${track.title}`);
            serveAudioFile(track.filename, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Track not found');
        }

    } else if (pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: 'ok', 
            tracks_available: musicTracks.length,
            mode: 'Royalty-Free Music (No API Key Required)'
        }));
    } else if (pathname === '/tracks') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ tracks: musicTracks }));
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎵 Record Player Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Also accessible at http://127.0.0.1:${PORT}`);
    console.log(`   Available Tracks: ${musicTracks.length}`);
    console.log(`   Endpoint: /api/lofi-track\n`);
});
