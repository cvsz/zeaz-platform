import gspread, random, os
from oauth2client.service_account import ServiceAccountCredentials
from sticker_generator import create_sticker
from line_api import send_image_to_line
from dotenv import load_dotenv
load_dotenv()

def run():
    scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(os.getenv("SHEET_ID")).sheet1
    rows = sheet.get_all_records()
    templates = [f for f in os.listdir('templates') if f.endswith('.png')]
    if not templates: templates = ['default.png']
    for i, row in enumerate(rows, start=2):
        if str(row.get('status', '')).lower() == 'pending':
            product = row['ชื่อสินค้า']; price = row['ราคา']; promo = row['โปร']; caption = row.get('แคปชั่น', '')
            template = os.path.join('templates', random.choice(templates))
            output_file = f"output/{product}_{price}.png"
            create_sticker(product, price, promo, template, output_file)
            status_code, res = send_image_to_line(output_file, caption)
            sheet.update_cell(i, 5, 'done' if status_code==200 else 'error')
            print(f"{product}: {status_code}")

if __name__ == "__main__":
    run()
