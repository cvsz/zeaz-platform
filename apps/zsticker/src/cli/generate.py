import argparse
import sys
from src.core.sticker import StickerGenerator
from src.utils.logger import get_logger

logger = get_logger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Generate Line Sticker manually via CLI")
    parser.add_argument("--product", required=True, help="Product name to be rendered")
    parser.add_argument("--price", required=True, help="Price of the product")
    parser.add_argument("--promo", default="", help="Promo text")
    parser.add_argument("--template", default="default", help="Template name (without extension, will look for .png and .json)")
    parser.add_argument("--watermark", default=None, help="Optional watermark text placed at bottom right")
    parser.add_argument("--output", default=None, help="Output file path (e.g. output/test1.png)")
    parser.add_argument("--preview", action="store_true", help="Generate preview and show without saving to disk")
    
    args = parser.parse_args()
    gen = StickerGenerator()
    
    if args.preview:
        logger.info(f"Generating preview for {args.product}...")
        img = gen.create_sticker(
            product_name=args.product, 
            price=args.price, 
            promo=args.promo, 
            template_name=args.template, 
            preview=True, 
            watermark=args.watermark
        )
        img.show()
        logger.info("Preview opened. (Check your image viewer)")
    else:
        output_file = args.output or f"output/{args.product}_{args.price}.png"
        logger.info(f"Generating sticker for {args.product}...")
        paths = gen.create_sticker(
            product_name=args.product, 
            price=args.price, 
            promo=args.promo, 
            template_name=args.template, 
            output_path=output_file, 
            watermark=args.watermark
        )
        logger.info(f"✅ Sticker successfully generated and saved:")
        logger.info(f"   PNG:  {paths['png']}")
        logger.info(f"   WEBP: {paths['webp']}")

if __name__ == "__main__":
    main()
