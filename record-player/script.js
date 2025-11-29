let isPlaying = false;
let currentTrack = null;
let audioPlayer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const playerBoard = document.querySelector('.player-board');
    const tonearm = document.getElementById('tonearm');
    const vinyl = document.querySelector('.vinyl');
    audioPlayer = document.getElementById('audioPlayer');
    
    playerBoard.addEventListener('mouseenter', () => {
        if (!isPlaying) {
            playMusic();
            tonearm.classList.add('down');
            vinyl.classList.add('playing');
            isPlaying = true;
            console.log('🎵 Music started');
        }
    });

    playerBoard.addEventListener('mouseleave', () => {
        if (isPlaying) {
            stopMusic();
            tonearm.classList.remove('down');
            vinyl.classList.remove('playing');
            isPlaying = false;
            console.log('🛑 Music stopped');
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
});

async function playMusic() {
    try {
        console.log('🎵 Fetching track...');
        
        // Fetch from our backend server
        const response = await fetch('http://localhost:3000/api/lofi-track');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch track: ${response.status}`);
        }
        
        const track = await response.json();
        console.log('✓ Got track:', track.title, 'by', track.artist);
        console.log('🔗 Audio URL:', track.url);
        
        // Set audio source
        audioPlayer.src = track.url;
        audioPlayer.crossOrigin = "anonymous";
        audioPlayer.loop = true;
        audioPlayer.volume = 0.7;
        
        // Attempt to play
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
