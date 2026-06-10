import sys
import os
import random

# Add project root to path
sys.path.append('/home/zeazdev/zeaz-platform/apps/zsticker')

from src.utils.config import Config
from src.core.sheets import GoogleSheetsAPI

def generate_prompts():
    characters = ['chubby orange tabby cat', 'cute white rabbit', 'fluffy golden retriever dog', 'panda bear', 'tiny hamster', 'koala', 'little penguin', 'brown bear', 'baby dinosaur', 'unicorn']
    emotions = ['happy', 'sad', 'angry', 'surprised', 'confused', 'sleepy', 'excited', 'cool', 'laughing', 'crying', 'in love', 'hungry']
    actions = ['waving hand', 'giving a thumbs up', 'holding a blank sign', 'dancing', 'sleeping', 'eating a big burger', 'drinking boba tea', 'running', 'jumping', 'hiding behind a wall', 'sitting quietly', 'looking closely with a magnifying glass']

    all_prompts = []
    
    for char in characters:
        char_prompts = set()
        # 12 emotions * 12 actions = 144 combinations. We need 100 per char.
        while len(char_prompts) < 100:
            emo = random.choice(emotions)
            act = random.choice(actions)
            prompt = f"A {char} looking {emo} and {act}. Flat vector illustration, kawaii style, solid colors, clean thick outlines, isolated on a solid white background, thick white border around the character, 2D sticker art, highly detailed."
            char_prompts.add(prompt)
            
        all_prompts.extend(list(char_prompts))
        
    return all_prompts

def main():
    config = Config()
    api = GoogleSheetsAPI(config)
    sheet = api.get_sheet()

    prompts = generate_prompts()
    
    rows_to_append = []
    for prompt in prompts:
        # A: status, B: prompt, C: image_url, D: line_sent_at, E: error_message, F: updated_at, G: timestamp
        rows_to_append.append(['pending', prompt, '', '', '', '', ''])

    print(f"Appending {len(rows_to_append)} rows to Google Sheets...")
    sheet.append_rows(rows_to_append, value_input_option='USER_ENTERED')
    print("Done!")

if __name__ == '__main__':
    main()
