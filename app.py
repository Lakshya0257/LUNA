from flask import Flask, render_template, request, jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from ytmusicapi import YTMusic
import json
import youtube_dl
from pytube import YouTube
from colorthief import ColorThief
from urllib.request import urlopen
from io import BytesIO

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///luna.db'
app.config['SQLALCHEMY_ECHO'] = True
db = SQLAlchemy(app)


class Luna(db.Model):
    sno = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    desc = db.Column(db.String(500), nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"{self.sno} - {self.title}"


# Routing
@app.route('/', methods=['GET'])
def homepage():
    home_data = ytmusic.get_home(10)
    artists = []
    genre = ytmusic.get_mood_categories()

    recommended_playlists = []
    recommended_music_videos = []
    quick_picks = []

    for data in home_data:
        if data['title'] == 'Recommended playlists':
            recommended_playlists = data['contents']
        elif data['title'] == 'Quick picks':
            quick_picks = data['contents']
            index=0;
            while artists==[]:
                try:
                    artists = ytmusic.get_artist(quick_picks[index]["artists"][0]["id"])[
                    'related']['results']
                    json_object = json.dumps(artists, indent=4)
                    f = open("trial.txt", 'w')
                    f.write(json_object)
                except:
                    index+=1
    return render_template('index.html', quick_picks=quick_picks, artists=artists, recommended_playlists=recommended_playlists, recommended_music_videos=recommended_music_videos, genre_category=genre)


@app.route('/watch')
def watch():
    return render_template('now-playing.html')


# API
@app.route('/recommendedQueue', methods=['GET'])
def queue():
    id = request.args.get("videoId")
    watch_playlist = ytmusic.get_watch_playlist(videoId=id)
    return watch_playlist

@app.route('/search', methods=['GET'])
def search():
    search = request.args.get("search")
    result=ytmusic.search(search,limit=100)
    songs=[]
    albums=[]
    community_playlist=[]
    artists=[]
    for element in result:
        if(element['category']=='Songs'):
            songs.append(element)
        elif(element['category']=='Community playlists'):
            community_playlist.append(element)
        elif(element['category']=='Albums'):
            albums.append(element)
        elif(element['category']=='Artists'):
            artists.append(element)            
    return render_template('search.html',songs=songs,albums=albums,community_playlist=community_playlist,artists=artists)


@app.route('/getSong', methods=['GET'])
def getSong():
    id = request.args.get("videoId")
    song_detail = ytmusic.get_song(videoId=id)
    song_url = f"https://music.youtube.com/watch?v={id}"
    print('waiting')
    try:
        ydl_opts = {
            'cachedir': 'D:\Web dev\Luna\cache',
            'youtube_skip_dash_manifest': True,
            # 'format': 'bestaudio/best',
            'outtmpl': '%(title)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'extractaudio': True,
            'audioformat': 'mp3',
            'preferredcodec': 'mp3',
            # 'preferredquality': '192',
            'nocheckcertificate': True,
            'format_limit': 1,
            'max_downloads': 1,
            'verbose': True
        }
        url = ''

        # Download the song and extract the streaming URL
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(song_url, download=False)
            print('done')
            url = info['formats'][0]['url']

    except:
        yt = YouTube(f'https://www.youtube.com/watch?v={id}')
        url = yt.streams.filter(only_audio=True).first().url

    print(url)
    # json_object = json.dumps(song_detail, indent=4)
    # f = open("trial.txt", 'w')
    # f.write(json_object)
    # Create a new ColorThief object with the image
    image_data = urlopen(song_detail['videoDetails']['thumbnail']['thumbnails'][len(song_detail['videoDetails']['thumbnail']['thumbnails'])-1]['url']).read()
    image = BytesIO(image_data)
    color_thief = ColorThief(image)
    dominant_color = color_thief.get_color(quality=1)
    print(dominant_color)
    return jsonify({'url': url, 'songDetail': song_detail,'color':dominant_color})



if __name__ == "__main__":
    ytmusic = YTMusic('D:\Web dev\Luna\python\headers_auth.json')
    app.run(debug=True)
