import re
import requests
import execjs
from ytmusicapi import YTMusic
ytmusic = YTMusic('D:\Web dev\Luna\python\headers_auth.json')


signature = "UOq0QJ8wRAIgNt-a1x2ISL8DGADIvE5R8DVPwZWbyxPGOuiP59hVyhECID9bVaqDSlq9EtAihu_TRzMR_9fRf6z9aNI0pZ_FlxSRSY"
url = "https://rr5---sn-gwpa-5hqy.googlevideo.com/videoplayback?expire=1677939174"
video_id = "qJhRL6BJYKI"

# Fetch the player source code
response = requests.get(f"https://www.youtube.com/watch?v={video_id}")
player_source = response.text

# Extract the base.js URL from the player source code
match = re.search(r"https://www.youtube.com/s/player/[\w\d]+/player_ias.vflset/en_US/base.js", player_source)
if not match:
    print("Could not find basejs URL")
    exit()
basejs_url = match.group(0)

# Fetch the base.js content
response = requests.get(basejs_url)
basejs = response.text

# Extract the function name and its code from base.js
match = re.search(r"([a-zA-Z0-9$]+)=function\(\w+\){[a-z=\.\(\)\"\'\[\]};:!]+\};", basejs)
if not match:
    print("Could not extract signature decipher function")
    exit()
function_name = match.group(1)
function_code = match.group(0)

# Execute the function to get the signature decipher function
exec(function_code)
signature_decipher_func = locals()[function_name]

# Extract the signature and apply the decipher function
signature = signature_decipher_func(signature)

# Construct the final URL with signature and other parameters
final_url = f"{url}&signature={signature}"

# Fetch the stream manifest
response = requests.get(final_url)
stream_manifest = response.text

# Extract the audio URL from the stream manifest
match = re.search(r'"url":"([^"]+)"', stream_manifest)
if not match:
    print("Could not extract audio URL")
    exit()
audio_url = match.group(1)

# Print the audio URL
print(audio_url)