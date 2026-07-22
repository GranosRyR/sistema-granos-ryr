from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

def crop_and_clean_logo():
    input_path = "Logo, Granos RYR nutricion Animal .jpeg"
    output_path = "logo-clean.png"
    
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Dimensiones de la foto original: {w}x{h}")
    
    # 1. Recortar la zona del letrero ovalado "GRANOS RyR Nutrición Animal"
    # El letrero está dentro de la placa metálica/ovalada
    # Coordenadas exactas relativas al letrero:
    left = int(w * 0.08)
    top = int(h * 0.08)
    right = int(w * 0.92)
    bottom = int(h * 0.92)
    
    cropped = img.crop((left, top, right, bottom))
    cw, ch = cropped.size
    
    # Crear imagen de salida transparente
    result = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    
    # Crear una máscara elíptica suave con bordes limpios para extraer exactamente el óvalo del logo
    mask = Image.new("L", (cw, ch), 0)
    draw = ImageDraw.Draw(mask)
    
    # Dibujar elipse ajustada al borde del marco del letrero
    margin = 8
    draw.ellipse((margin, margin, cw - margin, ch - margin), fill=255)
    
    # Difuminar levemente los bordes para antialiasing perfecto (sin bordes serruchados)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    
    # Aplicar la máscara transparente al logo recortado
    result.paste(cropped, (0, 0), mask)
    
    # Procesar transparencia de los píxeles de la pared circundante dentro del recuadro
    data = result.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue
            
        # Calcular tono gris neutro de la pared (baja saturación)
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        chroma = max_c - min_c
        brightness = (r + g + b) / 3.0
        
        # Si es tono grisáceo de pared (saturación baja y brillo de pared)
        if chroma < 22 and 60 < brightness < 160:
            # Hacer transparente
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, a))
            
    result.putdata(new_data)
    
    # Ajustar nitidez y contraste para lograr un acabado perfecto y profesional
    enhancer_contrast = ImageEnhance.Contrast(result)
    result = enhancer_contrast.enhance(1.18)
    
    enhancer_sharp = ImageEnhance.Sharpness(result)
    result = enhancer_sharp.enhance(1.4)
    
    # Recortar espacios transparentes sobrantes (autocrop)
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    result.save(output_path, "PNG")
    print(f"✅ ¡Logo limpio, sin fondo y recortado guardado exitosamente en {output_path}!")

if __name__ == "__main__":
    crop_and_clean_logo()
