const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio raíz
app.use(express.static(__dirname));

// Cualquier ruta redirige a index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌾 Servidor Granos RyR ejecutándose en el puerto ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
});
