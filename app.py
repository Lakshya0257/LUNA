from flask import Flask, render_template, request, jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from ytmusicapi import YTMusic
import json
import youtube_dl

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


@app.route('/',methods=['POST','GET'])
def helloWorld():
    if(request.method=='POST'):
        id=request.args.get("videoId")
        song_detail= ytmusic.get_song(videoId=id)
        song_url = f"https://music.youtube.com/watch?v={id}"
        json_object=json.dumps(song_detail,indent=4)
        f=open("trial.txt",'w')
        f.write(json_object)
        url=song_detail['videoDetails']['thumbnail']['thumbnails'][len(song_detail['videoDetails']['thumbnail']['thumbnails'])-1]['url']
        image_data = urlopen(url).read()
        image = BytesIO(image_data)

        # Create a new ColorThief object with the image
        color_thief = ColorThief(image)
        dominant_color = color_thief.get_color(quality=10)

# Print the RGB values of the dominant color
        print(dominant_color)
        # Extract the colors from an image
        # colors = colorgram.extract('https://lh3.googleusercontent.com/TlXKDSRGrj0ogqmGbzyGvZrsT9T0F6xgV-2-3pelbzRms0cODdb-ndDg6SpFzkHYMb4NMMMW957wmrObfw=w544-h544-l90-rj', 6)

        # Get the RGB values of the colors
        # rgb_colors = [(color.rgb.r, color.rgb.g, color.rgb.b) for color in colors]

        # Print the RGB values
        # print(rgb_colors)
        
        
        

    # Configure youtube_dl options
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
            'max_downloads': 1
        }
        # ydl_opts = {
        #     'cachedir': False,
        #     'youtube_skip_dash_manifest': True,
        #     'quiet': True,
        #     'no_warnings': True,
        #     'extractaudio': True,
        #     'audioformat': 'mp3',
        #     'preferredcodec': 'mp3',
        #     'nocheckcertificate': True,
        #     'format_limit': 1,
        #     'max_downloads': 1
        # }

        url=''

        # Download the song and extract the streaming URL
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            print('waiting')
            info = ydl.extract_info(song_url, download=False)
            print('done')
            url = info['formats'][0]['url']
        
        print(url)
        return jsonify({'url':url,'songDetail':song_detail,'color':dominant_color})
    else:
        home_data = ytmusic.get_home(10)
        artists=[]
        trial=ytmusic.get_artist(home_data[0]['contents'][0]["artists"][0]["id"])
        # json_object=json.dumps(trial,indent=4)
        # f=open("trial.txt",'w')
        # f.write(json_object)
        # print('dome')
        artists=trial['related']['results']
        # try:
        #     for i in range(0,9):
        #         if home_data[0]['contents'][i]["artists"][0]["id"] in artists_id:
        #             print('Skipped')
        #         else:
        #             artists_id.append(home_data[0]['contents'][i]["artists"][0]["id"])
        #             try:
        #                 print(home_data[0]['contents'][i]["artists"][0]["id"])
        #                 z=(home_data[0]['contents'][i]["artists"][0]["id"])
        #                 artists.append(ytmusic.get_artist(channelId=z))
        #             except:
        #                 print('Internal Error occured')
        # except:
        #     print("Error")
        

        
        recommended_playlists=[]
        recommended_music_videos=[]


        # song_info=ytmusic.get_song("ejDDk5n7AbM")
        # streaming_data=song_info['streamingData']
        # streaming_url=None
        

        for data in home_data:
            if data['title']=='Recommended playlists':
                recommended_playlists=data['contents']
            elif data['title']=='Recommended music videos':
                recommended_music_videos=data['contents']

        return render_template('index.html', homepage=home_data,artists=artists,recommended_playlists=recommended_playlists,recommended_music_videos=recommended_music_videos)


@app.route('/music')
def helloW():
    return 'Products'


if __name__ == "__main__":
    ytmusic = YTMusic('D:\Web dev\Luna\python\headers_auth.json')
    
    app.run(debug=True)
