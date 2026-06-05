import requests, os, pyimgur
from dotenv import load_dotenv
load_dotenv()
LINE_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
GROUP_ID = os.getenv("LINE_GROUP_ID")
IMGUR_ID = os.getenv("IMGUR_CLIENT_ID")

def upload_to_imgur(image_path):
    im = pyimgur.Imgur(IMGUR_ID)
    uploaded = im.upload_image(image_path, title="Line Sticker Auto")
    return uploaded.link

def send_image_to_line(image_path, caption=""):
    image_url = upload_to_imgur(image_path)
    url = "https://api.line.me/v2/bot/message/push"
    headers = {"Authorization": f"Bearer {LINE_TOKEN}"}
    data = {"to": GROUP_ID, "messages": [{"type": "image", "originalContentUrl": image_url, "previewImageUrl": image_url},{"type": "text", "text": caption}]}
    r = requests.post(url, headers=headers, json=data)
    return r.status_code, r.text
