import os
import json
import textwrap
from PIL import Image, ImageDraw, ImageFont
from src.utils.logger import get_logger
from src.utils.metrics import stickers_generated_total

logger = get_logger(__name__)

class StickerGenerator:
    def __init__(self, fonts_dir="./fonts", templates_dir="./templates"):
        self.fonts_dir = fonts_dir
        self.templates_dir = templates_dir
        
        self.font_fallbacks = [
            os.path.join(self.fonts_dir, "Kanit-Bold.ttf"),
            os.path.join(self.fonts_dir, "Sarabun-Bold.ttf"),
            "/System/Library/Fonts/Thonburi.ttc",  # Mac fallback
            "C:\\Windows\\Fonts\\tahoma.ttf",      # Win fallback
        ]
        self._font_cache = {}

    def _get_font(self, size: int):
        if size in self._font_cache:
            return self._font_cache[size]
            
        for font_path in self.font_fallbacks:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, size)
                    self._font_cache[size] = font
                    return font
                except Exception:
                    continue
                    
        logger.warning("No Thai font found in fallbacks. Using default font.")
        font = ImageFont.load_default()
        self._font_cache[size] = font
        return font

    def _get_fitted_font(self, draw, text: str, max_width: int, max_height: int, start_size: int = 72):
        size = start_size
        font = self._get_font(size)
        
        while size > 10:
            # textbbox returns (left, top, right, bottom)
            bbox = draw.textbbox((0, 0), text, font=font)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            if w <= max_width and h <= max_height:
                break
            size -= 2
            font = self._get_font(size)
            
        return font

    def create_sticker(self, product_name: str, price: str, promo: str, template_name: str, output_path: str = None, watermark: str = None, preview: bool = False):
        template_key = template_name.replace('.png', '')
        template_png = template_key + ".png"
        template_path = os.path.join(self.templates_dir, template_png)
        
        if not os.path.exists(template_path):
            logger.warning(f"Template {template_path} not found. Creating blank image.")
            img = Image.new("RGBA", (370, 320), (255, 255, 255, 0))
        else:
            img = Image.open(template_path).convert("RGBA")
        
        draw = ImageDraw.Draw(img)
        
        config_path = os.path.join(self.templates_dir, template_key + ".json")
        if os.path.exists(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                elements = json.load(f).get("elements", [])
        else:
            elements = [
                {"text": "{{product}}", "xy": [185, 50], "color": "#333333", "stroke": None, "max_w": 340, "max_h": 60, "start_size": 40},
                {"text": "{{price}}.-", "xy": [185, 140], "color": "#000000", "stroke": "#FFFFFF", "max_w": 340, "max_h": 100, "start_size": 72},
                {"text": "{{promo}}", "xy": [185, 220], "color": "#D92D20", "stroke": None, "max_w": 340, "max_h": 80, "start_size": 32}
            ]
            
        for el in elements:
            raw_text = el.get("text", "")
            if not raw_text:
                continue
                
            text = raw_text.replace("{{price}}", str(price)) \
                           .replace("{{promo}}", str(promo)) \
                           .replace("{{product}}", str(product_name))
                           
            # Only render if not empty after replacement or if the original wasn't empty
            if text.strip() == "" and raw_text.strip() != "":
                continue
                
            xy = tuple(el["xy"])
            font = self._get_fitted_font(draw, text, el.get("max_w", 300), el.get("max_h", 100), el.get("start_size", 40))
            
            stroke_kwargs = {}
            if el.get("stroke"):
                stroke_kwargs = {"stroke_width": 8, "stroke_fill": el["stroke"]}
                
            draw.text(xy, text, font=font, fill=el.get("color", "#000000"), anchor="mm", align="center", **stroke_kwargs)
            
        if watermark:
            wm_font = self._get_font(20)
            bbox = draw.textbbox((0, 0), watermark, font=wm_font)
            wm_w = bbox[2] - bbox[0]
            wm_h = bbox[3] - bbox[1]
            wm_layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
            wm_draw = ImageDraw.Draw(wm_layer)
            wm_draw.text((img.width - wm_w - 10, img.height - wm_h - 10), watermark, font=wm_font, fill=(100, 100, 100, 128))
            img = Image.alpha_composite(img, wm_layer)
            
        if preview:
            return img
            
        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            png_path = output_path
            if not png_path.endswith('.png'):
                png_path += '.png'
            img.save(png_path, "PNG")
            
            webp_path = png_path.replace('.png', '.webp')
            img.save(webp_path, "WEBP")
            
            stickers_generated_total.inc()
            logger.debug(f"Sticker saved to {png_path} and {webp_path}")
            return {"png": png_path, "webp": webp_path}
