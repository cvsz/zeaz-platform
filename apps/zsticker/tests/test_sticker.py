import os
from PIL import Image
from src.core.sticker import StickerGenerator

def test_sticker_generation(tmp_path):
    gen = StickerGenerator()
    
    # Create mock templates
    os.makedirs("templates", exist_ok=True)
    for name in ["temp1.png", "temp2.png", "temp3.png"]:
        Image.new("RGBA", (370, 320)).save(f"templates/{name}")
        
    out1 = gen.create_sticker("Product A", "100", "Promo", "temp1", str(tmp_path / "out1.png"))
    assert os.path.exists(out1["png"])
    assert os.path.exists(out1["webp"])
    
    out2 = gen.create_sticker("Product B", "200", "", "temp2", str(tmp_path / "out2.png"), watermark="WM")
    assert os.path.exists(out2["png"])
    
    out3 = gen.create_sticker("Product C", "300", "Sale", "temp3", str(tmp_path / "out3.png"))
    assert os.path.exists(out3["png"])
