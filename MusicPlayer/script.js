
const songs = [
  { file: '1-Kanye-West-Good-Morning-VTIGMR', title: 'Good Morning', artist: 'Kanye West' },
  { file: '03 Myself', title: 'Myself', artist: 'Bazzi' },
  { file: 'Akon_-_Lonely___Lyrics___Lirik_(128k)', title: 'Lonely', artist: 'Akon' },
  { file: 'Alan_Walker_&_Ava_Max_-_Alone,_Pt._II(128k)', title: 'Alone, Pt. II', artist: 'Alan Walker & Ava Max' },
  { file: 'Alan_Walker_-_Faded(128k)', title: 'Faded', artist: 'Alan Walker' },
  { file: 'Alec_Benjamin_Let_Me_Down_Slowly_Official_Music_Video128k', title: 'Let Me Down Slowly', artist: 'Alec Benjamin' },
  { file: 'Bones', title: 'Bones', artist: 'Imagine Dragons' },
];

const audio = document.getElementById('audio-player');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const disc = document.getElementById('disc');

const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
const autoplayCheckbox = document.getElementById('autoplay-checkbox');
const playlistEl = document.getElementById('playlist');

let currentSongIndex = 0;
let isPlaying = false;
let previousVolume = 0.8;

// Format seconds into M:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Load audio file with automatic extension detection (.mp3, .flac, .m4a, .wav)
function setAudioSourceWithFallback(fileName, autoPlayAfterLoad) {
  const extensions = ['mp3', 'flac', 'm4a', 'wav', 'ogg'];
  let extIndex = 0;

  audio.src = `songs/${encodeURIComponent(fileName)}.${extensions[extIndex]}`;

  audio.onerror = function () {
    extIndex++;
    if (extIndex < extensions.length) {
      audio.src = `songs/${encodeURIComponent(fileName)}.${extensions[extIndex]}`;
      if (autoPlayAfterLoad) {
        audio.play().catch(() => {});
      }
    } else {
      audio.onerror = null;
      console.warn(`Could not load audio file: ${fileName}`);
    }
  };
}

// Load song metadata and source
function loadSong(index, autoPlayAfterLoad = false) {
  const song = songs[index];
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  totalDurationEl.textContent = '0:00';

  setAudioSourceWithFallback(song.file, autoPlayAfterLoad);
  updatePlaylistUI();
}

// Play & Pause Controls
function playSong() {
  isPlaying = true;
  audio.play();
  playPauseBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
  disc.classList.add('playing');
}

function pauseSong() {
  isPlaying = false;
  audio.pause();
  playPauseBtn.innerHTML = '&#9654;'; // Play icon
  disc.classList.remove('playing');
}

playPauseBtn.addEventListener('click', () => {
  isPlaying ? pauseSong() : playSong();
});

// Next & Previous Controls
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex, true);
  playSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex, true);
  playSong();
}

nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// Update Duration & Progress Bar
audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration)) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

// Seek when dragging progress bar
progressBar.addEventListener('input', () => {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

// Volume & Mute Controls
audio.volume = volumeSlider.value;

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
  audio.muted = false;
  updateVolumeIcon();
});

muteBtn.addEventListener('click', () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = previousVolume || 0.5;
    volumeSlider.value = audio.volume;
  } else {
    previousVolume = audio.volume;
    audio.muted = true;
    volumeSlider.value = 0;
  }
  updateVolumeIcon();
});

function updateVolumeIcon() {
  if (audio.muted || audio.volume === 0) {
    muteBtn.textContent = '🔇';
  } else if (audio.volume < 0.5) {
    muteBtn.textContent = '🔉';
  } else {
    muteBtn.textContent = '🔊';
  }
}

// Autoplay next song when current ends
audio.addEventListener('ended', () => {
  if (autoplayCheckbox.checked) {
    nextSong();
  } else {
    pauseSong();
    progressBar.value = 0;
  }
});

// Render Playlist & Highlight Active Song
function buildPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${song.title}</span>
      <span class="track-artist">${song.artist}</span>
    `;
    li.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong(currentSongIndex, true);
      playSong();
    });
    playlistEl.appendChild(li);
  });
}

function updatePlaylistUI() {
  const items = playlistEl.querySelectorAll('li');
  items.forEach((item, index) => {
    const isActive = index === currentSongIndex;
    item.classList.toggle('active', isActive);
    if (isActive) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// Initialize Player
buildPlaylist();
loadSong(currentSongIndex, false);