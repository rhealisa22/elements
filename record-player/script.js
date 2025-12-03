let isPlaying = false;
let currentTrack = null;
let audioPlayer = null;
let userInteracted = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const vinylContainer = document.querySelector('.vinyl-container');
    const tonearm = document.getElementById('tonearm');
    const vinyl = document.getElementById('vinyl');
    audioPlayer = document.getElementById('audioPlayer');
    
    // Allow audio autoplay after any user interaction
    document.addEventListener('click', () => {
        userInteracted = true;
        console.log('✓ User interaction detected');
    });

    document.addEventListener('mousemove', () => {
        userInteracted = true;
    });
    
    // Click to toggle play/stop
    vinylContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            // Stop music on second click
            stopMusic();
            tonearm.classList.remove('down');
            vinyl.classList.remove('playing');
            isPlaying = false;
            console.log('🛑 Music stopped (clicked)');
        } else {
            // Play music on first click
            playMusic();
            tonearm.classList.add('down');
            vinyl.classList.add('playing');
            isPlaying = true;
            console.log('🎵 Music started (clicked)');
        }
    });

    audioPlayer.addEventListener('playing', () => {
        console.log('✓ Audio is playing');
    });

    audioPlayer.addEventListener('error', (e) => {
        console.error('✗ Audio error:', e);
    });

    audioPlayer.addEventListener('canplay', () => {
        console.log('✓ Audio can play');
    });

    audioPlayer.addEventListener('loadstart', () => {
        console.log('📡 Loading audio...');
    });
});

async function playMusic() {
    try {
        console.log('🎵 Fetching track...');
        
        // Fetch from our backend server
        const response = await fetch('http://127.0.0.1:3000/api/lofi-track');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch track: ${response.status}`);
        }
        
        const track = await response.json();
        console.log('✓ Got track:', track.title, 'by', track.artist);
        console.log('🔗 Audio URL:', track.url);
        
        // Update track info display
        document.getElementById('track-title').textContent = 'Playing now - Tessera';
        
        // Set audio source with proxied URL
        audioPlayer.src = track.url;
        audioPlayer.crossOrigin = "anonymous";
        audioPlayer.loop = true;
        audioPlayer.volume = 0.3;
        audioPlayer.preload = "auto";
        
        // Try to play
        console.log('▶️ Attempting to play...');
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✓ Now playing:', track.title, 'by', track.artist);
                    currentTrack = track;
                })
                .catch(error => {
                    console.error('❌ Playback failed:', error.message);
                    console.error('Error code:', error.name);
                    
                    // If autoplay blocked, try a simple play on next interaction
                    if (error.name === 'NotAllowedError') {
                        console.log('⏸️ Autoplay blocked. Click vinyl to play.');
                        isPlaying = false;
                    }
                });
        }
        
    } catch (error) {
        console.error('❌ Error fetching track:', error.message);
        console.log('⚠️  Make sure the Node.js server is running:');
        console.log('   cd /Users/rhea/Documents/GitHub/elements/record-player');
        console.log('   node server.js');
    }
}

function stopMusic() {
    try {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            console.log('✓ Music paused');
        }
    } catch (error) {
        console.error('Error stopping music:', error);
    }
}
