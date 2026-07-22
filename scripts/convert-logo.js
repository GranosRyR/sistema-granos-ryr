const fs = require('fs');
const path = require('path');

const validNames = [
  'Granos RyR SIN FONDO.png',
  'Logo, Granos RYR nutricion Animal .jpeg',
  'logo.jpeg',
  'logo-clean.png'
];

let logoPath = null;
for (const name of validNames) {
  const p = path.join(__dirname, '..', name);
  if (fs.existsSync(p)) {
    logoPath = p;
    break;
  }
}

if (!logoPath) {
  console.error('No se encontr ningn archivo de logo. Busc: ' + validNames.join(', '));
  process.exit(1);
}

const ext = path.extname(logoPath).toLowerCase();
const mime = ext === '.png' ? 'image/png' : 'image/jpeg';

const b64 = fs.readFileSync(logoPath).toString('base64');
const dataUrl = `data:${mime};base64,${b64}`;

const outputPath = path.join(__dirname, '..', 'js', 'logo-base64.js');
fs.writeFileSync(outputPath, `window.RyRLogoBase64 = ${JSON.stringify(dataUrl)};\n`);
console.log('Logo convertido exitosamente a Base64 en js/logo-base64.js');
