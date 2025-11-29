const http = require('http');
const https = require('https');
const url = require('url');

// Original audio source URLs
const audioSources = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
];

// Working free audio tracks metadata
const musicTracks = [
    { title: 'Ambient Study', artist: 'Kevin MacLeod', index: 0 },
    { title: 'Relaxing Piano', artist: 'Incompetech', index: 1 },
    { title: 'Chill Vibes', artist: 'Free Music Archive', index: 2 },
    { title: 'Night Drive', artist: 'Epidemic Sound', index: 3 },
    { title: 'Sunset Mood', artist: 'Creative Commons', index: 4 },
    { title: 'Coffee Shop', artist: 'YouTube Audio Library', index: 5 },
    { title: 'Focus Music', artist: 'Royalty Free Music', index: 6 },
    { title: 'Urban Jungle', artist: 'Open Source', index: 7 },
    { title: 'Dreamy Nights', artist: 'Creative Commons', index: 8 },
    { title: 'Morning Light', artist: 'Free Music', index: 9 }
];

function getRandomTrack() {
    return musicTracks[Math.floor(Math.random() * musicTracks.length)];
}

// Proxy audio through our server to add CORS headers
function proxyAudio(sourceUrl, res) {
    const isHttps = sourceUrl.startsWith('https');
    const protocol = isHttps ? https : http;
    
    protocol.get(sourceUrl, (proxyRes) => {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Accept-Ranges', 'bytes');
        
        // Copy content headers
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
        if (proxyRes.headers['content-length']) {
            res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }
        
        res.writeHead(proxyRes.statusCode);
        proxyRes.pipe(res);
    }).on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500);
        res.end('Proxy error');
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
        const sourceUrl = audioSources[track.index];
        console.log(`✓ Now Playing: "${track.title}" by ${track.artist}`);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            title: track.title,
            artist: track.artist,
            url: `http://localhost:3000/api/audio/${track.index}`
        }));

    } else if (pathname.startsWith('/api/audio/')) {
        // Proxy audio files through this server
        const index = parseInt(pathname.split('/').pop());
        if (index >= 0 && index < audioSources.length) {
            console.log(`🔊 Proxying audio ${index}...`);
            proxyAudio(audioSources[index], res);
        } else {
            res.writeHead(404);
            res.end('Not found');
        }

    } else if (pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: 'ok', 
            tracks_available: musicTracks.length,
            mode: 'CORS-Proxied Audio'
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
server.listen(PORT, () => {
    console.log(`\n🎵 Record Player Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Endpoint: /api/lofi-track`);
    console.log(`   Available Tracks: ${musicTracks.length}\n`);
});
