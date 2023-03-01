from flask import Flask, render_template
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from ytmusicapi import YTMusic
import json
ytmusic = YTMusic('D:\Web dev\Luna\python\headers_auth.json')

# search_results = ytmusic.search("Oasis Wonderwall")


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


@app.route('/')
def helloWorld():
    # artistss= ytmusic.get_charts()
    home_data = ytmusic.get_home(10)

    # print(artists)
    # artists=[]
    # for data in home_data[1]['contents']:
    #     z=(data["artists"][0]["id"])
    #     artists.append(ytmusic.get_artist(channelId=z))
    # print(artists)

    # json_object=json.dumps(artistss,indent=4)
    # x=json.loads(json_object)
    # f=open("trial.txt",'w')
    # f.write(json_object)
    # print(x[0]['contents']['thumbnails'][0]['url'])
    # print(json_object)
    # print(json_object)
    # db.session.add(luna)
    # db.session.commit()
    return render_template('index.html', homepage=home_data)


@app.route('/products')
def helloW():
    return 'Products'


if __name__ == "__main__":

    app.run(debug=True)
