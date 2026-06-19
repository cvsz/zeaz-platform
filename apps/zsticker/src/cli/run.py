import os
import random
import asyncio
from datetime import datetime
from src.utils.config import Config
from src.core.sheets import GoogleSheetsAPI
from src.core.sticker import StickerGenerator
from src.core.line import LineAPI
from src.utils.logger import get_logger
from src.utils.metrics import last_run_timestamp, sheets_errors
import time

logger = get_logger(__name__)

async def amain():
    logger.info("🚀 Starting zsticker...")
    config = Config()
    
    sheets_api = GoogleSheetsAPI(config)
    sticker_gen = StickerGenerator()
    line_api = LineAPI(config)
    
    pending_rows = sheets_api.get_pending_rows()
    if not pending_rows:
        logger.info("💤 No pending tasks found.")
        return

    templates = [f for f in os.listdir('templates') if f.endswith('.png')]
    if not templates:
        templates = ['default.png']

    updates = []

    for row_index, row in pending_rows:
        product = row.get('ชื่อสินค้า', 'Unknown')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        try:
            price = row.get('ราคา', '')
            promo = row.get('โปร', '')
            caption = row.get('แคปชั่น', '')
            
            template = random.choice(templates)
            output_file = f"output/{product}_{price}.png"
            
            logger.info(f"⚙️ Processing: {product}")
            sticker_gen.create_sticker(product, price, promo, template, output_file)
            
            # Use the new async LINE API
            image_url = await line_api.upload_to_imgur(output_file)
            
            result = await line_api.send_image(image_url, caption)
            
            if result['success']:
                updates.append({
                    'row_id': row_index,
                    'status': 'done',
                    'error': '',
                    'image_url': image_url,
                    'timestamp': timestamp
                })
                logger.info(f"✅ Successfully processed {product}")
            else:
                error_msg = f"LINE API Error {result['error_code']}"
                updates.append({
                    'row_id': row_index,
                    'status': 'error',
                    'error': error_msg,
                    'image_url': image_url,
                    'timestamp': timestamp
                })
                logger.error(f"❌ Failed to send LINE message for {product}: {error_msg}")
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Error processing row {row_index} ({product}): {error_msg}")
            updates.append({
                'row_id': row_index,
                'status': 'error',
                'error': error_msg,
                'image_url': '',
                'timestamp': timestamp
            })

    # Execute Batch Update
    if updates:
        try:
            sheets_api.batch_update_rows(updates)
        except Exception as e:
            sheets_errors.inc()
            logger.error(f"Failed to batch update sheets: {e}")
            
    # Cleanly stop the background worker queue
    await line_api.stop_worker()
    
    last_run_timestamp.set(time.time())

def main():
    asyncio.run(amain())

if __name__ == "__main__":
    main()
