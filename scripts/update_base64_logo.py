import base64
import os

def update_logo_base64():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.join(script_dir, "..", "logo-clean.png")
    output_js = os.path.join(script_dir, "..", "js", "logo-base64.js")

    if os.path.exists(logo_path):
        with open(logo_path, "rb") as f:
            b64_str = base64.b64encode(f.read()).decode("utf-8")

        js_content = f'window.RyRLogoBase64 = "data:image/png;base64,{b64_str}";\n'
        with open(output_js, "w", encoding="utf-8") as f_out:
            f_out.write(js_content)
        print("Logo base64 actualizado exitosamente en js/logo-base64.js")
    else:
        print("No se encontro logo-clean.png")

if __name__ == "__main__":
    update_logo_base64()
