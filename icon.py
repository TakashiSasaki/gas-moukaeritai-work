import os
from PIL import Image, ImageDraw, ImageFont
import math

def generate_add_on_icon(output_path, size=(512, 512)):
    # 1. ベース画像の作成 (Google Docsの青色をイメージ)
    base_color = (66, 133, 244)  # Google Docs blue (approx)
    img = Image.new('RGB', size, color=base_color)
    draw = ImageDraw.Draw(img)

    # 2. 白い「T」の文字を描画
    # フォントは適当なものを選択、またはシステムフォントを使用
    try:
        font = ImageFont.truetype("arial.ttf", size=int(size[0] * 0.5))
    except IOError:
        # Fallback to default font if arial.ttf not found
        # ImageFont.load_default() only supports a limited size, so we scale it.
        font = ImageFont.load_default() 
        print("Using default font. Quality might vary.")
    
    text = "T"
    # Calculate text bounding box to center it
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # 中央に配置 (少し上に調整)
    text_x = (size[0] - text_width) / 2
    text_y = (size[1] - text_height) / 2 - (size[1] * 0.05) 
    draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255)) # 白

    # 3. マジックワンドを描画
    # ワンドの形状: シンプルな線と星
    wand_length = int(size[0] * 0.3)
    wand_thickness = int(size[0] * 0.02)
    wand_color = (200, 200, 200) # 薄いグレー/シルバー

    # Tの右上あたりから斜めに伸びるように
    wand_start_x = text_x + text_width * 0.8
    wand_start_y = text_y + text_height * 0.2
    wand_end_x = wand_start_x + wand_length * 0.7
    wand_end_y = wand_start_y - wand_length * 0.7

    draw.line([(wand_start_x, wand_start_y), (wand_end_x, wand_end_y)], fill=wand_color, width=wand_thickness)

    # ワンドの先端に星を描画 (5角の星を近似で描画)
    star_center_x = wand_end_x
    star_center_y = wand_end_y
    star_size = int(size[0] * 0.04) # 星のサイズを少し小さくする

    # 5角の星を描画 (より正確な5角星)
    star_points = []
    for i in range(5):
        outer_angle = math.pi/2 + i * 2 * math.pi / 5
        inner_angle = math.pi/2 + (i * 2 + 1) * math.pi / 5
        star_points.append((star_center_x + star_size * math.cos(outer_angle),
                            star_center_y + star_size * math.sin(outer_angle)))
        star_points.append((star_center_x + star_size * 0.4 * math.cos(inner_angle), # 内側の点を追加
                            star_center_y + star_size * 0.4 * math.sin(inner_angle)))
    
    draw.polygon(star_points, fill=(255, 223, 0), outline=(255, 223, 0)) # ゴールド

    img.save(output_path)
    print(f"Icon generated and saved to {output_path}")

if __name__ == "__main__":
    output_dir = "1jdrz76e6DCQI4bmZAqlkRhM8uMjvycSr8MfNE1AFEpNk3IDjwyw4i0Rc"
    os.makedirs(output_dir, exist_ok=True)
    generate_add_on_icon(os.path.join(output_dir, "icon.png"))
