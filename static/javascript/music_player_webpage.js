let progressBarValue = document.getElementById("PlayerProgressBar");
let song = document.getElementById("song");
let play = document.getElementById("PlayerPlayButton");
let image = document.getElementById("song-image");

//Homepage progress bar update
function updateTime() {
  let minutes = Math.floor(song.currentTime / 60);
  let seconds = Math.round(song.currentTime - minutes * 60);
  document.querySelector('.current-time').innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
  sessionStorage.setItem('song-time',song.currentTime);
  progressBarValue.style.background = "linear-gradient(to right, green, " + (song.currentTime / song.duration) * 100 + "%, grey " + (song.currentTime / song.duration) * 100 + "%)";
  if((song.currentTime/song.duration)==1 && watch_playlist!=[]){
    console.log(watch_playlist);
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
  document.querySelector('.player-ending-time').innerHTML=minutes+':'+(seconds < 10 ? '0' : '') + seconds;
  progressBarValue.value = song.currentTime;
};



//Play-Pause event
function playPause(event) {
  if(event){
    event.stopPropagation();
  }
  if (play.classList.contains("fa-pause")) {
    sessionStorage.setItem('songStatus','pause');
    song.pause();
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
  } else {
    sessionStorage.setItem('songStatus','play');
    song.play();
    play.classList.remove("fa-play");
    play.classList.add("fa-pause");
  }
}



//watch playlist data

function watchPlaylist(videoId) {
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
  .then(async data => {
    console.log(song_index);
    var d=JSON.stringify(data);
    sessionStorage.setItem('songData',d);
    document.querySelector('.audio-link').setAttribute('src',data['url']);
    document.querySelector('.upper-info h1').innerHTML=data['songDetail']['videoDetails']['title'];
    document.body.style=`background-color: rgb(${data['color']['0']}, ${data['color']['1']}, ${data['color']['2']})`
    document.querySelector('.lower-info h1').innerHTML=data['songDetail']['videoDetails']['author'];
    document.querySelector('.lower-info p').innerHTML=`Views: ${data['songDetail']['videoDetails']['viewCount']}`;
    document.querySelector('.background-image img').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][data['songDetail']['videoDetails']['thumbnail']['thumbnails'].length-1]['url']);
    console.log(data['url']);
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    playPause();
    song_index=song_index+1;
    sessionStorage.setItem('song_index',song_index);
    console.log(song_index);
    if(song_index>watch_playlist.length-4){
      console.log('Getting New List...');
      let extendedQueue = await newQueue(videoId); // wait for the promise to resolve
      await extendedQueue.forEach(element => {
        const existsInX = watch_playlist.some((xItem) => xItem.videoId === element.videoId);
        // If the item doesn't exist in x, add it
        if (!existsInX) {
          watch_playlist.push(element);
        }
      });
      var d=JSON.stringify(watch_playlist)
      sessionStorage.setItem('watch_playlist',d);
      displayingQueue();
    }
  })
  .catch(error => {
    console.error(error);
    if (error.response && error.response.status === 403) {
      console.log('Something went wrong! Trying again..');
      fetchNextSong(videoId);
    }
  });
}


async function newQueue(videoId){
  try {
    const response = await fetch(`/recommendedQueue?videoId=${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    return data['tracks'];
  } catch (error) {
    console.error(error);
  }
}



function jumpToNext(){
  console.log(typeof song_index);
  console.log(song_index);
  fetchNextSong(watch_playlist[song_index]['videoId']);
}

function jumpToPrevious(){
  song_index=song_index-2;
  fetchNextSong(watch_playlist[song_index]['videoId']);
}




var data = JSON.parse(sessionStorage.getItem('songData'));
document.querySelector('.audio-link').setAttribute('src',data['url']);
if(sessionStorage.getItem('songStatus')=='play'){
  play.classList.remove("fa-pause");
  play.classList.add("fa-play");
  playPause();
}
document.body.style=`background-color: rgb(${data['color']['0']}, ${data['color']['1']}, ${data['color']['2']})`
document.querySelector('.upper-info h1').innerHTML=data['songDetail']['videoDetails']['title'];
document.querySelector('.lower-info h1').innerHTML=data['songDetail']['videoDetails']['author'];
document.querySelector('.lower-info p').innerHTML=`Views: ${data['songDetail']['videoDetails']['viewCount']}`;
document.querySelector('.background-image img').setAttribute('src',data['songDetail']['videoDetails']['thumbnail']['thumbnails'][data['songDetail']['videoDetails']['thumbnail']['thumbnails'].length-1]['url']);
song.currentTime=sessionStorage.getItem('song-time');
let watch_playlist=JSON.parse(sessionStorage.getItem('watch_playlist'));
let song_index=parseInt(sessionStorage.getItem('song_index'));


function displayingQueue(){
  const queue=document.querySelector('.queue');
  queue.innerHTML='';
  for(const [index,song] of watch_playlist.entries()){
    const div=document.createElement('div');
    div.setAttribute('id',index);
    div.setAttribute('onclick',`onClickNext(${index})`);
    div.classList.add('queue-song');
    const img=document.createElement('img');
    img.setAttribute('src',song['thumbnail'][song['thumbnail'].length-1]['url']);
    const p=document.createElement('p');
    p.innerHTML=song['title'];
    div.appendChild(img);
    div.appendChild(p);
    queue.appendChild(div);
}
}

displayingQueue();

function onClickNext(index){
  song_index=index;
  fetchNextSong(watch_playlist[index]['videoId']);
}


function homepage(event){
  window.location.href='/';
}