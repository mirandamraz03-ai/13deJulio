const rows = Array.from(document.querySelectorAll('.song-row'));
const player = document.querySelector('#player');
const playButton = document.querySelector('#play-btn');
const prevButton = document.querySelector('#prev-btn');
const nextButton = document.querySelector('#next-btn');
const progressBar = document.querySelector('#progress');
const currentTimeLabel = document.querySelector('#current-time');
const durationLabel = document.querySelector('#duration');
const currentTitle = document.querySelector('#current-title');
const currentArtist = document.querySelector('#current-artist');
const libraryTitle = document.querySelector('#library-title');
const albumTitle = document.querySelector('#album-title');
const albumArtist = document.querySelector('#album-artist');
const coverImage = document.querySelector('#cover-image');
const youtubeLink = document.querySelector('#youtube-link');
const volumeBar = document.querySelector('#volume');
const songMessage = document.querySelector("#song-message");

const tracks = rows.map((row) => ({
  title: row.dataset.title ?? row.querySelector('.song-info strong')?.textContent ?? 'Canción',
  artist: row.dataset.artist ?? row.querySelector('.song-info span')?.textContent ?? '',
  duration: '',
  audioSrc: row.dataset.audioSrc ?? '',
  cover: row.dataset.cover ?? '',
  youtubeUrl: row.dataset.youtubeUrl ?? '',
  message: row.dataset.message ?? '',
}));

let activeIndex = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updatePlayState(isPlaying) {
  playButton.textContent = isPlaying ? '❚❚' : '▶';
  playButton.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
  document.body.classList.toggle('is-playing', isPlaying);
}

function updateCover(track) {

}

function updateYoutubeLink(track) {
  youtubeLink.href = track.youtubeUrl || '#';
  youtubeLink.setAttribute('aria-disabled', track.youtubeUrl ? 'false' : 'true');
}

function setTrackUI(track) {
  currentTitle.textContent = track.title;
  currentArtist.textContent = track.artist;
  libraryTitle.textContent = track.title;
  durationLabel.textContent = track.duration;
  songMessage.textContent = track.message;

  progressBar.value = '0';
  currentTimeLabel.textContent = '0:00';

  updateCover(track);
  updateYoutubeLink(track);
}

function setActiveTrack(index, shouldPlay = false) {
  activeIndex = (index + tracks.length) % tracks.length;
  const track = tracks[activeIndex];

  rows.forEach((item) => item.classList.remove('is-active'));
  rows[activeIndex].classList.add('is-active');
  setTrackUI(track);

  if (player.src !== track.audioSrc) {
    player.src = track.audioSrc;
    player.load();
  }

  if (shouldPlay) {
    player.play().catch(() => {
      updatePlayState(false);
    });
    return;
  }

  updatePlayState(false);
}

function playCurrentTrack() {
  if (!tracks[activeIndex]) {
    return;
  }

  player.play().catch(() => {
    updatePlayState(false);
  });
}

rows.forEach((row, index) => {
  row.addEventListener('click', () => {
    setActiveTrack(index, true);
  });
});

playButton.addEventListener('click', () => {
  if (player.paused) {
    playCurrentTrack();
    return;
  }

  player.pause();
});

prevButton.addEventListener('click', () => {
  setActiveTrack(activeIndex - 1, true);
});

nextButton.addEventListener('click', () => {
  setActiveTrack(activeIndex + 1, true);
});

progressBar.addEventListener('input', () => {
  if (!player.duration) {
    return;
  }

  const seekTime = (Number(progressBar.value) / 100) * player.duration;
  player.currentTime = seekTime;
  currentTimeLabel.textContent = formatTime(seekTime);
});

player.addEventListener('loadedmetadata', () => {
    durationLabel.textContent = formatTime(player.duration);

    rows[activeIndex]
        .querySelector(".song-time")
        .textContent = formatTime(player.duration);
});

player.addEventListener('timeupdate', () => {
  if (!player.duration) {
    return;
  }

  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = String(progress);
  currentTimeLabel.textContent = formatTime(player.currentTime);
});

player.addEventListener('play', () => {
  updatePlayState(true);
});

player.addEventListener('pause', () => {
  updatePlayState(false);
});

player.addEventListener('ended', () => {
  setActiveTrack(activeIndex + 1, true);
});

setActiveTrack(0, false);

player.volume = 0.5;
volumeBar.value = 0.5;

volumeBar.addEventListener('input', (e) => {
  const volume = e.target.value;
  player.volume = volume;
});

