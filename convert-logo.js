const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'logo.jpeg');
const outputPath = path.join(__dirname, 'js', 'logo-base64.js');

if (fs.existsSync(logoPath)) {
    const b64 = fs.readFileSync(logoPath).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${b64}`;
    fs.writeFileSync(outputPath, `window.RyRLogoBase64 = ${JSON.stringify(dataUrl)};\n`);
    console.log('✅ Logo convertido exitosamente a Base64 e insertado en js/logo-base64.js');
} else {
    console.error('❌ No se encontró logo.jpeg');
}
