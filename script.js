// Application Setup State Context
const state = {
    videoUrl: '',
    videoTitle: 'Premium Course Lecture',
    videoDesc: 'Welcome to your custom workspace stream on Study Book.',
    hideControlsTimeout: null,
    mockRecommendations: [
        { id: 1, title: '02. Core Architectural Frameworks', duration: '14:25', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        { id: 2, title: '03. Advanced State Mechanics', duration: '22:10', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
        { id: 3, title: '04. Data Persistency Channels', duration: '18:45', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }
    ]
};

// Handle Native Document Mapping Target References
const el = {
    wrapper: document.getElementById('player-wrapper'),
    video: document.getElementById('main-video'),
    loader: document.getElementById('video-loader'),
    overlay: document.getElementById('control-overlay'),
    btnCenterPlay: document.getElementById('btn-center-play'),
    btnShelfPlay: document.getElementById('btn-shelf-play'),
    timelineContainer: document.getElementById('timeline-container'),
    progressBar: document.getElementById('progress-bar'),
    bufferBar: document.getElementById('buffer-bar'),
    timeCurrent: document.getElementById('time-current'),
    timeDuration: document.getElementById('time-duration'),
    btnVolume: document.getElementById('btn-volume'),
    volumeSlider: document.getElementById('volume-slider'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    metaTitle: document.getElementById('video-title'),
    metaDesc: document.getElementById('video-description'),
    relatedList: document.getElementById('related-list')
};

// Read URL parameters dynamically passed to the player environment
function parseQueryConfiguration() {
    const params = new URLSearchParams(window.location.search);
    // Reliable high-bandwidth public stream fallbacks if no URL is present
    state.videoUrl = params.get('url') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    if(params.get('title')) state.videoTitle = params.get('title');
    if(params.get('desc')) state.videoDesc = params.get('desc');
    
    el.metaTitle.textContent = state.videoTitle;
    el.metaDesc.textContent = state.videoDesc;
}

// Format media seconds into clean timestamps (00:00)
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize Custom Player Subsystems
function initVideoPlayer() {
    parseQueryConfiguration();
    loadVideoSource(state.videoUrl);
    generateRecommendations();
    setupEventHandlers();
    triggerControlsVisibility();
}

// Load Video Media Element Engine Safely
function loadVideoSource(url) {
    el.loader.classList.add('active');
    el.video.src = url;
    el.video.load();
}

// Setup Event Listeners Matrix
function setupEventHandlers() {
    // Media Play/Pause Event Responses
    const togglePlay = () => {
        if (el.video.paused) {
            el.video.play();
        } else {
            el.video.pause();
        }
        triggerControlsVisibility();
    };

    el.btnCenterPlay.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    el.btnShelfPlay.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    el.wrapper.addEventListener('click', toggleControlsActivity);

    el.video.addEventListener('play', () => {
        el.btnCenterPlay.querySelector('.material-icons-round').textContent = 'pause';
        el.btnShelfPlay.querySelector('.material-icons-round').textContent = 'pause';
    });

    el.video.addEventListener('pause', () => {
        el.btnCenterPlay.querySelector('.material-icons-round').textContent = 'play_arrow';
        el.btnShelfPlay.querySelector('.material-icons-round').textContent = 'play_arrow';
    });

    // Native Video State Changes Tracking
    el.video.addEventListener('waiting', () => el.loader.classList.add('active'));
    el.video.addEventListener('playing', () => el.loader.classList.remove('active'));
    el.video.addEventListener('loadedmetadata', () => {
        el.timeDuration.textContent = formatTime(el.video.duration);
        el.loader.classList.remove('active');
    });

    el.video.addEventListener('timeupdate', () => {
        // Track running timestamps
        el.timeCurrent.textContent = formatTime(el.video.currentTime);
        // Advance Progress Line
        const progress = (el.video.currentTime / el.video.duration) * 100;
        el.progressBar.style.width = `${progress}%`;
        
        // Track buffered state bar
        if (el.video.buffered.length > 0) {
            const buffered = (el.video.buffered.end(el.video.buffered.length - 1) / el.video.duration) * 100;
            el.bufferBar.style.width = `${buffered}%`;
        }
    });

    // Custom Interactive Progress Scrubbing
    el.timelineContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = el.timelineContainer.getBoundingClientRect();
        const clickPositionX = (e.clientX - rect.left) / rect.width;
        el.video.currentTime = clickPositionX * el.video.duration;
    });

    // Volume Adjustment Mechanics
    el.volumeSlider.addEventListener('input', (e) => {
        el.video.volume = e.target.value;
        if(el.video.volume === 0) {
            el.btnVolume.querySelector('.material-icons-round').textContent = 'volume_off';
        } else if(el.video.volume < 0.5) {
            el.btnVolume.querySelector('.material-icons-round').textContent = 'volume_down';
        } else {
            el.btnVolume.querySelector('.material-icons-round').textContent = 'volume_up';
        }
    });

    el.btnVolume.addEventListener('click', (e) => {
        e.stopPropagation();
        el.video.muted = !el.video.muted;
        el.btnVolume.querySelector('.material-icons-round').textContent = el.video.muted ? 'volume_off' : 'volume_up';
    });

    // Custom Native Fullscreen Integration Bridge
    el.btnFullscreen.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            el.wrapper.requestFullscreen().catch((err) => {
                console.error(`Error enabling fullscreen UI: ${err.message}`);
            });
            el.btnFullscreen.querySelector('.material-icons-round').textContent = 'fullscreen_exit';
        } else {
            document.exitFullscreen();
            el.btnFullscreen.querySelector('.material-icons-round').textContent = 'fullscreen';
        }
    });
}

// Auto-Hiding Control Layer Overlays Logic
function toggleControlsActivity() {
    if (el.overlay.classList.contains('hidden')) {
        triggerControlsVisibility();
    } else {
        el.overlay.classList.add('hidden');
    }
}

function triggerControlsVisibility() {
    el.overlay.classList.remove('hidden');
    clearTimeout(state.hideControlsTimeout);
    
    if (!el.video.paused) {
        state.hideControlsTimeout = setTimeout(() => {
            el.overlay.classList.add('hidden');
        }, 3500); // UI Controls vanish dynamically after 3.5 seconds
    }
}

// Generate Recommendation Row Node Cards
function generateRecommendations() {
    el.relatedList.innerHTML = '';
    state.mockRecommendations.forEach(item => {
        const card = document.createElement('div');
        card.className = 'related-card';
        card.innerHTML = `
            <div class="thumb-wrapper">
                <span class="material-icons-round">play_circle_filled</span>
            </div>
            <div class="card-info">
                <div class="card-title">${item.title}</div>
                <div class="card-duration">${item.duration}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            el.metaTitle.textContent = item.title;
            loadVideoSource(item.url);
            el.video.play();
        });
        el.relatedList.appendChild(card);
    });
}

// Boot setup parameters when system resources lock validation frames
window.addEventListener('DOMContentLoaded', initVideoPlayer);
