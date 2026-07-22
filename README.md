# 🌾 Sistema Granos RyR - Sistema de Inventario, POS, Lotaje y Facturación

Sistema web moderno y robusto diseñado específicamente para la comercialización de granos en quintales, medios quintales y derivados (**Soya, Maíz, Sorgo, Cascarilla de Soya y Soya Molida**).

---

## 🚀 Características Principales

1. **Gestión por Lotes (Lotaje)**:
   - Control individual por cada compra/ingreso de grano con su propio código de lote (`LOTE-SOY-XXXX`), costo de adquisición, precio de venta, proveedor y stock disponible.
   - Cálculo automático de ganancia neta real basada en el costo real del lote vendido.
2. **Caja Rápida POS (Punto de Venta)**:
   - Formulario adaptado para PC, laptop y celulares.
   - Calculadora por Quintal (46 kg), Medio Quintal (23 kg), Sacos o Kilos.
   - Registro completo de cliente (Nombre, NIT/CI, WhatsApp).
   - Opciones: **"Guardar Venta"** y **"Guardar y Enviar por WhatsApp 💬"**.
3. **Facturación PDF e Impresión Directa**:
   - Generador cliente de comprobantes/facturas PDF en tiempo real con el membrete oficial de Granos RyR.
   - Formato optimizado para impresión en impresoras térmicas de 80mm y papel A4.
4. **WhatsApp Integrado y Preparación de Bot Automatizado**:
   - Apertura automática de WhatsApp con mensaje estructurado para el cliente.
   - Estructura y webhooks JSON listos para integración futura con bots de WhatsApp automatizados.
5. **Arquitectura Limpia & Firebase**:
   - Integración modular de Firebase Firestore.
   - Capa de persistencia transparente con `LocalStorage` que permite ejecutar el sistema inmediatamente antes de configurar las claves de API de Firebase.
6. **Listo para GitHub & Render**:
   - Incluye servidor `server.js` liviano en Node.js/Express para despliegue instantáneo en la plataforma **Render** con auto-deploy mediante **GitHub**.

---

## 📂 Estructura del Proyecto

```
Proyecto RYR/
├── css/
│   └── styles.css           # Sistema de diseño (Dark Glassmorphism, Dorado/Ámbar & Verde Agrícola)
├── js/
│   ├── firebase-config.js   # Inicialización Firebase SDK v9/v10 + Fallback LocalStorage
│   ├── pdf-generator.js     # Generador de Facturas/Recibos en PDF e Impresión
│   ├── whatsapp-helper.js   # Gestor de mensajes y enlaces para WhatsApp y Bots
│   └── app.js               # Lógica del sistema (Lotaje, POS, Inventario, Historial, Cierre)
├── index.html               # Interfaz Principal SPA
├── server.js                # Servidor Node.js Express para Render
├── package.json             # Configuración de dependencias y scripts de ejecución
└── README.md                # Documentación técnica del proyecto
```

---

## 🛠️ Ejecución Local

Para probar el sistema localmente en tu computadora:

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta el servidor Node.js:
   ```bash
   node server.js
   ```
3. Abre tu navegador e ingresa a `http://localhost:3000`.

---

## 🔒 Configuración de Firebase

Para activar la sincronización en la nube con Firebase:
1. Abre el archivo [`js/firebase-config.js`](file:///c:/Users/J.%20Valdivia/Documents/Proyecto%20RYR/js/firebase-config.js).
2. Reemplaza los valores de `firebaseConfig` con las credenciales de tu consola de Firebase.
