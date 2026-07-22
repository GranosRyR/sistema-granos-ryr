import os
import base64
from PIL import Image

def process_new_logo():
    new_logo_path = "Granos RyR SIN FONDO.png"
    clean_logo_path = "logo-clean.png"
    js_logo_path = os.path.join("js", "logo-base64.js")

    if not os.path.exists(new_logo_path):
        print("No se encontro Granos RyR SIN FONDO.png")
        return

    print("Procesando nueva imagen Granos RyR SIN FONDO.png...")
    img = Image.open(new_logo_path)
    print(f"Dimensiones de la nueva imagen: {img.size[0]}x{img.size[1]}px, modo: {img.mode}")

    # Si es muy pesada (8MB), crear una versión optimizada manteniendo alta resolución (max 1200px)
    max_dim = 1200
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / float(max(w, h))
        new_w = int(w * scale)
        new_h = int(h * scale)
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        img_resized.save(clean_logo_path, "PNG", optimize=True)
        print(f"Imagen optimizada a {new_w}x{new_h}px en logo-clean.png")
    else:
        img.save(clean_logo_path, "PNG", optimize=True)

    # Convertir a Base64 para JS
    with open(clean_logo_path, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")

    js_content = f'window.RyRLogoBase64 = "data:image/png;base64,{b64_data}";\n'
    with open(js_logo_path, "w", encoding="utf-8") as f_js:
        f_js.write(js_content)

    print("Base64 JS actualizado exitosamente en js/logo-base64.js")

if __name__ == "__main__":
    process_new_logo()
