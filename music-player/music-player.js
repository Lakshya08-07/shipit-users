class MusicPlayer { 
    constructor() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');
        
        // UI elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressHandle = document.getElementById('progressHandle');
        this.volumeBar = document.getElementById('volumeBar');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.albumImage = document.getElementById('albumImage');
        this.albumArt = document.getElementById('albumArt');
        this.playlist = document.getElementById('playlist');

        // Player state
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.volume = 0.7;

        // Playlist data with sample tracks
        this.tracks = [
            {
                title: "Chill Vibes",
                artist: "Lo-Fi Beats",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
                cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
                duration: "3:45"
            },
            {
                title: "Midnight Jazz",
                artist: "Smooth Collective",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
                cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop&crop=center",
                duration: "4:20"
            },
            {
                title: "Ocean Waves",
                artist: "Nature Sounds",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
                cover: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop&crop=center",
                duration: "5:12"
            },
            {
                title: "Electric Dreams",
                artist: "Synthwave Pro",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
                cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop&crop=center",
                duration: "3:58"
            },
            {
                title: "Forest Rain",
                artist: "Ambient Sounds",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio
                cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&crop=center",
                duration: "6:33"
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTrack(this.currentTrackIndex);
        this.renderPlaylist();
        this.audio.volume = this.volume;
        this.updateVolumeBar();
    }

    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Previous/Next buttons
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Shuffle and repeat buttons
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());

        // Progress bar interaction
        this.setupProgressBarInteraction();
        
        // Volume control interaction
        this.setupVolumeControlInteraction();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupProgressBarInteraction() {
        const progressContainer = this.progressBar.parentElement;
        let isDragging = false;

        const updateProgress = (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
            // Correction: Only seek if audio is loaded
            if (this.audio.duration) {
                this.audio.currentTime = percentage * this.audio.duration;
                this.updateProgressBar(percentage);
            }
        };

        progressContainer.addEventListener('click', updateProgress);

        this.progressHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateProgress(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupVolumeControlInteraction() {
        const volumeContainer = this.volumeBar.parentElement;
        let isDragging = false;

        const updateVolume = (e) => {
            const rect = volumeContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
            this.volume = percentage;
            this.audio.volume = this.volume;
            this.updateVolumeBar();
        };

        volumeContainer.addEventListener('click', updateVolume);

        this.volumeHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        // Note: For a real fix, you should remove these listeners when not needed to avoid memory leaks.
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateVolume(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            const track = this.tracks[index];
            this.audio.src = track.src;
            this.songTitle.textContent = track.title;
            this.artistName.textContent = track.artist;
            this.albumImage.src = track.cover;
            this.currentTrackIndex = index;
            // Update playlist highlighting
            this.updatePlaylistHighlight();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    // Correction: Make play() async and handle race condition
    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            // Correction: Show pause icon when playing
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause text-2xl"></i>';
            this.albumArt.classList.remove('paused');
            this.updatePlaylistHighlight();
        } catch (err) {
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play text-2xl ml-1"></i>';
            this.albumArt.classList.add('paused');
            // Optionally, show error to user
            // alert('Playback failed: ' + err.message);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        // Correction: Show play icon when paused
        this.playPauseBtn.innerHTML = '<i class="fas fa-play text-2xl ml-1"></i>';
        this.albumArt.classList.add('paused');
    }

    previousTrack() {
        if (this.isShuffle) {
            // Correction: Prevent shuffle from selecting the same track
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.tracks.length);
            } while (this.tracks.length > 1 && newIndex === this.currentTrackIndex);
            this.currentTrackIndex = newIndex;
        } else {
            this.currentTrackIndex = this.currentTrackIndex > 0 ? this.currentTrackIndex - 1 : this.tracks.length - 1;
        }
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    nextTrack() {
        if (this.isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.tracks.length);
            } while (this.tracks.length > 1 && newIndex === this.currentTrackIndex);
            this.currentTrackIndex = newIndex;
        } else {
            this.currentTrackIndex = this.currentTrackIndex < this.tracks.length - 1 ? this.currentTrackIndex + 1 : 0;
        }
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        // Correction: text-white when shuffle is ON, text-white/60 when OFF
        this.shuffleBtn.classList.toggle('text-white', this.isShuffle);
        this.shuffleBtn.classList.toggle('text-white/60', !this.isShuffle);
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('text-white', this.repeatMode !== 'none');
        this.repeatBtn.classList.toggle('text-white/60', this.repeatMode === 'none');
        
        if (this.repeatMode === 'one') {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo text-lg"></i><span class="text-xs">1</span>';
        } else {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo text-lg"></i>';
        }
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all') {
            this.nextTrack();
        } else {
            if (this.currentTrackIndex < this.tracks.length - 1) {
                this.nextTrack();
            } else {
                this.pause();
                this.audio.currentTime = 0;
                this.updateProgress();
            }
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const percentage = (this.audio.currentTime / this.audio.duration) * 100;
            this.updateProgressBar(percentage / 100);
            // Correction: Show current time, not duration
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateProgressBar(percentage) {
        this.progressBar.style.width = `${percentage * 100}%`;
        this.progressHandle.style.left = `${percentage * 100}%`;
    }

    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    updateVolumeBar() {
        this.volumeBar.style.width = `${this.volume * 100}%`;
        this.volumeHandle.style.left = `${this.volume * 100}%`;
    }

    // Correction: Add colon in time format
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    renderPlaylist() {
        this.playlist.innerHTML = '';
        this.tracks.forEach((track, index) => {
            const trackElement = document.createElement('div');
            trackElement.className = 'flex items-center p-2 rounded cursor-pointer hover:bg-white/10 transition-colors';
            trackElement.innerHTML = `
                <img src="${track.cover}" alt="${track.title}" class="w-10 h-10 rounded object-cover mr-3">
                <div class="flex-1">
                    <div class="font-medium text-sm">${track.title}</div>
                    <div class="text-xs text-gray-400">${track.artist}</div>
                </div>
                <div class="text-xs text-gray-400">${track.duration}</div>
            `;
            // Correction: If clicking current track, toggle play/pause
            trackElement.addEventListener('click', () => {
                if (this.currentTrackIndex === index) {
                    this.togglePlayPause();
                } else {
                    this.loadTrack(index);
                    this.play();
                }
            });
            this.playlist.appendChild(trackElement);
        });
    }

    updatePlaylistHighlight() {
        const playlistItems = this.playlist.children;
        for (let i = 0; i < playlistItems.length; i++) {
            // Correction: Always clear highlight first
            playlistItems[i].classList.remove('bg-white/20');
            if (i === this.currentTrackIndex && this.isPlaying) {
                playlistItems[i].classList.add('bg-white/20');
            }
        }
    }

    handleKeyboardShortcuts(e) {
        // Correction: Ignore if focus is in input, textarea, or contenteditable
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) {
            return;
        }
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.volume = Math.min(1, this.volume + 0.1);
                this.audio.volume = this.volume;
                this.updateVolumeBar();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.volume = Math.max(0, this.volume - 0.1);
                this.audio.volume = this.volume;
                this.updateVolumeBar();
                break;
        }
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});