from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import os

def crop_and_clean_logo():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "..", "Logo, Granos RYR nutricion Animal .jpeg")
    output_path = os.path.join(script_dir, "..", "logo-clean.png")

    if not os.path.exists(input_path):
        print(f"No se encontro {input_path}")
        return

    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Dimensiones de la foto original: {w}x{h}")

    left = int(w * 0.08)
    top = int(h * 0.08)
    right = int(w * 0.92)
    bottom = int(h * 0.92)

    cropped = img.crop((left, top, right, bottom))
    cw, ch = cropped.size

    result = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))

    mask = Image.new("L", (cw, ch), 0)
    draw = ImageDraw.Draw(mask)

    margin = 8
    draw.ellipse((margin, margin, cw - margin, ch - margin), fill=255)

    mask = mask.filter(ImageFilter.GaussianBlur(1.5))

    result.paste(cropped, (0, 0), mask)

    data = result.getdata()
    new_data = []

    for item in data:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue

        max_c = max(r, g, b)
        min_c = min(r, g, b)
        chroma = max_c - min_c
        brightness = (r + g + b) / 3.0

        if chroma < 22 and 60 < brightness < 160:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, a))

    result.putdata(new_data)

    enhancer_contrast = ImageEnhance.Contrast(result)
    result = enhancer_contrast.enhance(1.18)

    enhancer_sharp = ImageEnhance.Sharpness(result)
    result = enhancer_sharp.enhance(1.4)

    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)

    result.save(output_path, "PNG")
    print(f"Logo limpio, sin fondo y recortado guardado exitosamente en {output_path}!")

if __name__ == "__main__":
    crop_and_clean_logo()
