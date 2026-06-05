from PIL import Image, ImageDraw, ImageFont
import textwrap, os

def create_sticker(product_name, price, promo, template_path, output_path):
    if not os.path.exists(template_path):
        img = Image.new("RGBA", (370, 320), (255, 255, 255, 0))
    else:
        img = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    font_path = "./fonts/Kanit-Bold.ttf"
    try:
        font_price = ImageFont.truetype(font_path, 72)
        font_promo = ImageFont.truetype(font_path, 32)
    except:
        font_price = ImageFont.load_default()
        font_promo = ImageFont.load_default()
    draw.text((185, 140), f"{price}.-", font=font_price, fill="#000000", anchor="mm", stroke_width=8, stroke_fill="#FFFFFF")
    if promo:
        wrapped = textwrap.fill(str(promo), width=12)
        draw.text((185, 220), wrapped, font=font_promo, fill="#D92D20", anchor="mm", align="center")
    img.save(output_path, "PNG")
    return output_path
