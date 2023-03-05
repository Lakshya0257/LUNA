let progressBarValue = document.getElementById("progressBar");
let song = document.getElementById("song");
let play = document.getElementById("playButton");
let image = document.getElementById("song-image");

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



// let title="We don't talk anymore"
// document.querySelector('.music_player h1').innerHTML=title;

progressBarValue.onchange = function () {
  song.pause();
  song.currentTime = progressBarValue.value;
  play.classList.remove("fa-play");
  play.classList.add("fa-pause");
  song.play();
};

song.onloadedmetadata = function () {
  progressBarValue.max = song.duration;
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

if (song.play()) {
  setInterval(() => {
    progressBarValue.value = song.currentTime;
  }, 800);
}
