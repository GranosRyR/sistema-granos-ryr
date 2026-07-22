# 📘 Guía Paso a Paso: Publicación de Sistema Granos RyR en GitHub, Firebase y Render

Esta guía te explica de forma clara y sencilla cómo poner tu sistema en línea para que tú y tus clientes puedan usarlo desde cualquier computadora o teléfono celular.

---

## 📌 PARTE 1: Subir el Código a GitHub

[GitHub](https://github.com) es donde guardaremos el código fuente de tu sistema. Render leerá automáticamente este repositorio para publicar la página.

### Paso 1.1: Crear una cuenta y repositorio en GitHub
1. Ingresa a [https://github.com](https://github.com) e inicia sesión (o regístrate gratis).
2. En la esquina superior derecha, haz clic en el botón **`+`** y selecciona **"New repository"** (Nuevo repositorio).
3. En **Repository name**, escribe: `sistema-granos-ryr`.
4. Elige si deseas que sea **Público** o **Privado**.
5. Deja desmarcadas las casillas de inicialización (ya tenemos nuestro código listo).
6. Haz clic en **"Create repository"**.

### Paso 1.2: Subir tu código desde la computadora
Abre una terminal o consola de comandos en la carpeta de tu proyecto (`c:\Users\J. Valdivia\Documents\Proyecto RYR`) y ejecuta estos comandos uno por uno:

```bash
git init
git add .
git commit -m "Primer commit: Sistema Granos RyR listo con POS, PDF, WhatsApp y Lotaje"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sistema-granos-ryr.git
git push -u origin main
```
*(Reemplaza `TU_USUARIO` con tu nombre de usuario exacto en GitHub)*.

---

## 📌 PARTE 2: Activar y Configurar Firebase

[Firebase](https://firebase.google.com) te dará la base de datos en la nube para guardar tus ventas, clientes y stock de granos de forma segura.

### Paso 2.1: Crear el proyecto en Firebase
1. Entra a la consola de Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** (o "Add project").
3. Escribe el nombre: `Granos RyR` y haz clic en **Continuar**.
4. Puedes desactivar o activar Google Analytics (opcional) y presionar **"Crear proyecto"**.

### Paso 2.2: Crear la Base de Datos Firestore
1. En el menú izquierdo de Firebase, ve a **Compilaciones / Build** -> **Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Selecciona la ubicación más cercana (ejemplo: `us-central` o `southamerica-east1`).
4. Selecciona **"Iniciar en modo de prueba"** (para permitir lectura y escritura inicial) y presiona **Crear**.

### Paso 2.3: Obtener las Claves de Configuración para tu Sistema
1. En la pantalla principal de tu proyecto en Firebase, haz clic en el icono de Web **`</>`**.
2. En el nombre de la app escribe: `Granos RyR Web` y presiona **"Registrar app"**.
3. Te aparecerá un bloque de código con un objeto `const firebaseConfig = { ... }`.
4. Copia los valores (`apiKey`, `authDomain`, `projectId`, `storageBucket`, etc.).
5. Abre en tu proyecto el archivo `js/firebase-config.js` y pega tus claves en el objeto:
   ```javascript
   const firebaseConfig = {
       apiKey: "TU_API_KEY_REAL",
       authDomain: "granos-ryr.firebaseapp.com",
       projectId: "granos-ryr",
       ...
   };
   ```
6. Guarda el archivo y sube este pequeño cambio a GitHub ejecutando:
   ```bash
   git add .
   git commit -m "Configurar credenciales de Firebase"
   git push origin main
   ```

---

## 📌 PARTE 3: Poner la Página en Línea en Render

[Render](https://render.com) alojará tu sistema gratis en la nube y se actualizará automáticamente cada vez que hagas un cambio en GitHub.

### Paso 3.1: Crear tu cuenta en Render
1. Ingresa a [https://render.com](https://render.com).
2. Haz clic en **"GET STARTED FOR FREE"** o **"Sign In"**.
3. Elige la opción **"Continue with GitHub"** para vincular directamente tu cuenta.

### Paso 3.2: Crear el Web Service en Render
1. En el panel principal de Render, haz clic en el botón azul **"New +"** y selecciona **"Web Service"**.
2. Selecciona la opción **"Build and deploy from a Git repository"** y haz clic en **Next**.
3. Conecta tu repositorio de GitHub `sistema-granos-ryr` haciendo clic en **"Connect"**.
4. Configura los siguientes campos:
   - **Name**: `sistema-granos-ryr`
   - **Region**: La más cercana (ejemplo: Oregon, US / Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: (Déjalo en blanco).
   - **Runtime**: `Node`
   - **Build Command**: `npm install` (o déjalo en blanco).
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ($0 / month).
5. Presiona el botón azul **"Create Web Service"**.

### Paso 3.3: ¡Tu Sistema está en Línea! 🎉
- Render comenzará el proceso de compilación y despliegue (tardará entre 1 y 2 minutos).
- Cuando el estado cambie a **"Live"**, verás una URL en la parte superior izquierda como:
  `https://sistema-granos-ryr.onrender.com`
- ¡Listo! Abre ese enlace en tu computadora o en tu celular para empezar a usar tu **Sistema Granos RyR**.

---

## 💡 Resumen del Flujo de Trabajo Futuro
- Cada vez que quieras realizar una mejora o cambio en el sistema, solo editas tus archivos locales y ejecutas en tu terminal:
  ```bash
  git add .
  git commit -m "Nueva mejora realizada"
  git push origin main
  ```
- Render detectará el push de GitHub y actualizará tu página en línea en cuestión de segundos de forma automática.
