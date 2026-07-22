from PIL import Image, ImageChops, ImageEnhance, ImageFilter
import numpy as np
import os

def process_logo():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "..", "Logo, Granos RYR nutricion Animal .jpeg")
    output_path = os.path.join(script_dir, "..", "logo-clean.png")

    if not os.path.exists(input_path):
        print(f"No se encontro {input_path}")
        return

    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Dimensiones del logo original: {w}x{h}")

    arr = np.array(img)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

    max_rgb = np.maximum(r, np.maximum(g, b))
    min_rgb = np.minimum(r, np.minimum(g, b))
    chroma = max_rgb - min_rgb

    mask = (chroma > 18) | (r > 170) | (g > 170) | (b > 170)

    nonzero_coords = np.argwhere(mask)
    if len(nonzero_coords) > 0:
        ymin, xmin = nonzero_coords.min(axis=0)
        ymax, xmax = nonzero_coords.max(axis=0)
        padding = 5
        xmin = max(0, xmin - padding)
        ymin = max(0, ymin - padding)
        xmax = min(w, xmax + padding)
        ymax = min(h, ymax + padding)
        print(f"Bounding box detectado del emblema: ({xmin}, {ymin}) a ({xmax}, {ymax})")
        img_cropped = img.crop((xmin, ymin, xmax, ymax))
    else:
        img_cropped = img

    cw, ch = img_cropped.size
    c_arr = np.array(img_cropped)
    cr, cg, cb, ca = c_arr[:,:,0], c_arr[:,:,1], c_arr[:,:,2], c_arr[:,:,3]

    gray_dist = np.sqrt((cr.astype(float) - 120)**2 + (cg.astype(float) - 120)**2 + (cb.astype(float) - 120)**2)
    c_chroma = np.maximum(cr, np.maximum(cg, cb)) - np.minimum(cr, np.minimum(cg, cb))

    alpha_channel = np.where((c_chroma < 20) & (gray_dist < 60), 0, 255).astype(np.uint8)

    c_arr[:,:,3] = alpha_channel
    final_img = Image.fromarray(c_arr)

    enhancer = ImageEnhance.Contrast(final_img)
    final_img = enhancer.enhance(1.15)

    enhancer_sharp = ImageEnhance.Sharpness(final_img)
    final_img = enhancer_sharp.enhance(1.3)

    final_img.save(output_path, "PNG")
    print(f"Logo limpio guardado en {output_path}")

if __name__ == "__main__":
    process_logo()
