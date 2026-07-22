from PIL import Image, ImageChops, ImageEnhance, ImageFilter
import numpy as np

def process_logo():
    input_path = "Logo, Granos RYR nutricion Animal .jpeg"
    output_path = "logo-clean.png"
    
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Dimensiones del logo original: {w}x{h}")
    
    # 1. Recortar la pared gris circundante (Crop centrado en el emblema)
    # El emblema de Granos RyR está en la zona central-izquierda
    # Coordenadas relativas aproximadas: x_min ~ 10%, y_min ~ 10%, x_max ~ 90%, y_max ~ 90%
    
    # Convertir a numpy array para detección inteligente de la elipse/emblema
    arr = np.array(img)
    
    # El fondo es la pared gris (R ~ G ~ B entre 80 y 160)
    # El logotipo tiene verdes brillantes, rojos, amarillos y texto verde/azul nítido
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Calcular saturación cromática (diferencia entre canales para identificar colores vivos vs pared gris neutra)
    max_rgb = np.maximum(r, np.maximum(g, b))
    min_rgb = np.minimum(r, np.minimum(g, b))
    chroma = max_rgb - min_rgb
    
    # Crear máscara donde el color sea significativamente más brillante o más saturado que la pared gris
    # O donde la luminosidad/color corresponda al letrero
    # Detectar el badge circular/ovalado y el marco metálico/rojo/verde
    mask = (chroma > 18) | (r > 170) | (g > 170) | (b > 170)
    
    # Encontrar bounding box del letrero
    nonzero_coords = np.argwhere(mask)
    if len(nonzero_coords) > 0:
        ymin, xmin = nonzero_coords.min(axis=0)
        ymax, xmax = nonzero_coords.max(axis=0)
        
        # Añadir un pequeño margen de 5px
        padding = 5
        xmin = max(0, xmin - padding)
        ymin = max(0, ymin - padding)
        xmax = min(w, xmax + padding)
        ymax = min(h, ymax + padding)
        
        print(f"Bounding box detectado del emblema: ({xmin}, {ymin}) a ({xmax}, {ymax})")
        img_cropped = img.crop((xmin, ymin, xmax, ymax))
    else:
        img_cropped = img

    # Recortar con alta precisión
    cw, ch = img_cropped.size
    c_arr = np.array(img_cropped)
    cr, cg, cb, ca = c_arr[:,:,0], c_arr[:,:,1], c_arr[:,:,2], c_arr[:,:,3]
    
    # Mascara alfa de transparencia para eliminar la pared exterior
    # Calculamos la distancia de cada píxel a los tonos grises de pared (alrededor de 120,120,120)
    gray_dist = np.sqrt((cr.astype(float) - 120)**2 + (cg.astype(float) - 120)**2 + (cb.astype(float) - 120)**2)
    c_chroma = np.maximum(cr, np.maximum(cg, cb)) - np.minimum(cr, np.minimum(cg, cb))
    
    # Transparencia inteligente: los píxeles que son de la pared (baja saturación y tono gris neutro) se vuelven transparentes
    alpha_channel = np.where((c_chroma < 20) & (gray_dist < 60), 0, 255).astype(np.uint8)
    
    # Refinar bordes con suavizado
    c_arr[:,:,3] = alpha_channel
    final_img = Image.fromarray(c_arr)
    
    # Ajustar contraste y brillo levemente para que se vea súper nítido
    enhancer = ImageEnhance.Contrast(final_img)
    final_img = enhancer.enhance(1.15)
    
    enhancer_sharp = ImageEnhance.Sharpness(final_img)
    final_img = enhancer_sharp.enhance(1.3)
    
    final_img.save(output_path, "PNG")
    print(f"✅ Logo limpio guardado en {output_path}")

if __name__ == "__main__":
    process_logo()
