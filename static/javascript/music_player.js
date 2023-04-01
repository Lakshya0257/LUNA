const progressBarValue = document.getElementById("progressBar");
const song = document.getElementById("song");
const play = document.getElementById("playButton");
const songImage = document.getElementById("song-image");
let watch_playlist = [];
let song_index = 1;



if(sessionStorage.getItem('watch_playlist')!=null){
  watch_playlist = JSON.parse(sessionStorage.getItem('watch_playlist'));
}
if(sessionStorage.getItem('song_index')!=null){
  song_index=parseInt(sessionStorage.getItem('song_index'));
  console.log(song_index);
}


//Checking for previous data in progressBar(mainly when navigating back to music player)
if(sessionStorage.getItem('songData')!=null){
  var data = JSON.parse(sessionStorage.getItem('songData'));
  console.log(sessionStorage.getItem('songData'))
  document.querySelector('.audio-link').setAttribute('src',data['url']);
  document.querySelector('.music_player h1').innerHTML=data['songDetail']['videoDetails']['title'];
  document.querySelector('.music_player p').innerHTML=data['songDetail']['videoDetails']['author'];
  document.getElementById('song-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][0]['url']);
  document.getElementById('side-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][data['songDetail']['videoDetails']['thumbnail']['thumbnails'].length-1]['url']);
  console.log(data['url']);
  const music_player=document.querySelector('.music_player');
  music_player.style=`display: flex;`;
  song.currentTime=sessionStorage.getItem('song-time');
}


//Homepage progress bar update
function updateTime() {
  let minutes = Math.floor(song.currentTime / 60);
  let seconds = Math.round(song.currentTime - minutes * 60);
  document.querySelector('.current-time').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
  progressBarValue.style.background = "linear-gradient(to right, green, " + (song.currentTime / song.duration) * 100 + "%, grey " + (song.currentTime / song.duration) * 100 + "%)";
  if((song.currentTime/song.duration)==1 && watch_playlist!=[]){
    // console.log(watch_playlist);
    console.log(song_index);
    fetchNextSong(watch_playlist[song_index]['videoId']);
  }
}
song.addEventListener('timeupdate', updateTime);
function handleProgressInput() {
  song.currentTime = progressBarValue.value;
  let minutes = Math.floor(song.currentTime / 60);
  let seconds = Math.round(song.currentTime - minutes * 60);
  document.querySelector('.current-time').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  progressBarValue.style.background = "linear-gradient(to right, green, " + (song.currentTime / song.duration) * 100 + "%, grey " + (song.currentTime / song.duration) * 100 + "%)";
}
progressBarValue.addEventListener('input', handleProgressInput);
progressBarValue.addEventListener('mousedown', function() {
  song.removeEventListener('timeupdate', updateTime);
});
progressBarValue.addEventListener('mouseup', function() {
  song.addEventListener('timeupdate', updateTime);
});



//On loading song
song.onloadedmetadata = function () {
  progressBarValue.max = song.duration;
  let minutes = Math.floor(song.duration / 60);
  let seconds = Math.round(song.duration - minutes * 60);
  document.querySelector('.ending-time').innerHTML=minutes+':'+(seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
};



//Play-Pause event
const playPause = (event) => {
  if(event){
    event.stopPropagation();
  }
  if (play.classList.contains("fa-pause")) {
    song.pause();
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    sessionStorage.setItem('songStatus','pause');
  } else {
    
    song.play();
    play.classList.remove("fa-play");
    play.classList.add("fa-pause");
    sessionStorage.setItem('songStatus','play');
  }
}

if(sessionStorage.getItem('songStatus')=='play'){
  console.log('playing');
  play.classList.remove("fa-pause");
  play.classList.add("fa-play");
  playPause();
}else{
  console.log('pause');
  play.classList.remove("fa-play");
  play.classList.add("fa-pause");
  playPause();
}



//playing song when user selects from mainPage not from music PLayer
function playSong(videoId){
  console.log(videoId)
  fetchSong(videoId)
}

function fetchSong(videoId) {
try{
  fetch(`/getSong?videoId=${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(async data => {
    song_index=1;
    sessionStorage.setItem('song_index',song_index);
    var d=JSON.stringify(data);
    sessionStorage.setItem('songData',d);
    document.querySelector('.audio-link').setAttribute('src',data['url']);
    document.querySelector('.music_player h1').innerHTML=data['songDetail']['videoDetails']['title'];
    document.querySelector('.music_player p').innerHTML=data['songDetail']['videoDetails']['author'];
    document.getElementById('song-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][0]['url']);
    document.getElementById('side-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][data['songDetail']['videoDetails']['thumbnail']['thumbnails'].length-1]['url']);
    console.log(data['url']);
    const music_player=document.querySelector('.music_player');
    watchPlaylist(videoId);
    music_player.style=`display: flex;`;
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    playPause();
    
  })
  .catch(error => {
    console.error(error);
    if (error.response && error.response.status === 403) {
      console.log('Something went wrong! Trying again..');
      fetchSong(videoId);
    }
  });
}catch{error => {
  console.error(error);
  if (error.response && error.response.status === 403) {
    console.log('Something went wrong! Trying again..');
    fetchSong(videoId);
  }
}
}
}




//watch playlist data
async function watchPlaylist(videoId) {
  fetch(`/recommendedQueue?videoId=${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(data => {
    watch_playlist=data['tracks'];
    var d=JSON.stringify(watch_playlist)
    sessionStorage.setItem('watch_playlist',d);
  })
  .catch(error => {
    console.error(error);
  });
  }


//Playing next song from queue
 async function fetchNextSong(videoId) {
  fetch(`/getSong?videoId=${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(data => {
    
    
    var d=JSON.stringify(data);
    sessionStorage.setItem('songData',d);
    document.querySelector('.audio-link').setAttribute('src',data['url']);
    document.querySelector('.music_player h1').innerHTML=data['songDetail']['videoDetails']['title'];
    document.querySelector('.music_player p').innerHTML=data['songDetail']['videoDetails']['author'];
    document.getElementById('song-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][0]['url']);
    document.getElementById('side-image').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][data['songDetail']['videoDetails']['thumbnail']['thumbnails'].length-1]['url']);
    console.log(data['url']);
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    playPause();
    song_index=song_index+1;
    sessionStorage.setItem('song_index',song_index);
  })
  .catch(error => {
    console.error(error);
    if (error.response && error.response.status === 403) {
      console.log('Something went wrong! Trying again..');
      fetchNextSong(videoId);
    }
  });
  }


function jumpToNext(){
  fetchNextSong(watch_playlist[song_index]['videoId']);
}

async function jumpToPrevious(){
  song_index=song_index-2;
  fetchNextSong(watch_playlist[song_index]['videoId']);
}



//Navigating to music player from anypage
function musicPlayer(event){
  sessionStorage.setItem('song-time',song.currentTime);
  window.location.href='/watch';
}


function search(){
  const search=document.getElementById('search-input').value;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `/search?search=${search}`, true);

  xhr.onload = function() {
    if (this.status === 200) {
      // Replace the content of an element with the AJAX response
      document.getElementById('content').innerHTML = this.responseText;

      // Change the URL displayed in the address bar
      history.pushState(null, '', '/search');
      
    }
  };
  xhr.send();
}
