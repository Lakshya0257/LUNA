let progressBarValue = document.getElementById("progressBar");
let song = document.getElementById("song");
let play = document.getElementById("playButton");
let image = document.getElementById("song-image");

function updateTime() {
  let minutes = Math.floor(song.currentTime / 60);
  let seconds = Math.round(song.currentTime - minutes * 60);
  document.querySelector('.current-time').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
  progressBarValue.style.background = "linear-gradient(to right, green, " + (song.currentTime / song.duration) * 100 + "%, grey " + (song.currentTime / song.duration) * 100 + "%)";
  // progressBarValue.style.setProperty('--thumb-offset', (progressBarValue.value / (progressBarValue.max - progressBarValue.min)) * 100 + '%');
}

// add the timeupdate listener to the audio element
song.addEventListener('timeupdate', updateTime);

// define the input listener function for the progress bar
function handleProgressInput() {
  // set the current time of the audio to the value of the progress bar
  song.currentTime = progressBarValue.value;

  // update the current time display
  let minutes = Math.floor(song.currentTime / 60);
  let seconds = Math.round(song.currentTime - minutes * 60);
  document.querySelector('.current-time').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  progressBarValue.style.background = "linear-gradient(to right, green, " + (song.currentTime / song.duration) * 100 + "%, grey " + (song.currentTime / song.duration) * 100 + "%)";
}

// add the input listener to the progress bar
progressBarValue.addEventListener('input', handleProgressInput);

// add a mousedown listener to the progress bar to temporarily remove the timeupdate listener
progressBarValue.addEventListener('mousedown', function() {
  song.removeEventListener('timeupdate', updateTime);
});

// add a mouseup listener to the progress bar to re-add the timeupdate listener
progressBarValue.addEventListener('mouseup', function() {
  song.addEventListener('timeupdate', updateTime);
});


song.onloadedmetadata = function () {
  progressBarValue.max = song.duration;
  let minutes = Math.floor(song.duration / 60);
  let seconds = Math.round(song.duration - minutes * 60);
  document.querySelector('.ending-time').innerHTML=minutes+':'+(seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
};

function playPause() {
  if (play.classList.contains("fa-pause")) {
    song.pause();
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
  } else {
    song.play();
    play.classList.remove("fa-play");
    play.classList.add("fa-pause");
  }
}


function playSong(videoId){
  console.log(videoId)
  fetchSong(videoId)
}

function fetchSong(videoId) {
fetch(`?videoId=${videoId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
})
.then(response => response.json())
.then(data => {
  document.querySelector('.songsss').setAttribute('src',data['url']);
  document.querySelector('.music_player h1').innerHTML=data['songDetail']['videoDetails']['title'];
  document.querySelector('.music_player p').innerHTML=data['songDetail']['videoDetails']['author'];
  document.getElementById('song-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][0]['url']);
  console.log(data['url']);
  let songs=document.querySelector('.songsss');
  console.log(songs.duration);
  document.querySelector('.music_player').style='display: flex;';
  play.classList.remove("fa-pause");
  play.classList.add("fa-play");
  playPause();
})
.catch(error => {
  console.error(error);
});
}