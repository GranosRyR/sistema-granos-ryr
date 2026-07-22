/* ==========================================================================
   SISTEMA GRANOS RyR - CONFIGURACIÓN DE FIREBASE & PERSISTENCIA REFORZADA
   Firebase SDK v9/v10 Modular Integration + LocalStorage Auto-Fallback
   ========================================================================== */

// Reemplaza estas credenciales cuando crees tu proyecto en la consola de Firebase: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "AIzaSyDxWdVMD1FUxaba-O5cw70oAruMnb-jxmE",
    authDomain: "granos-ryr.firebaseapp.com",
    projectId: "granos-ryr",
    storageBucket: "granos-ryr.firebasestorage.app",
    messagingSenderId: "535873461807",
    appId: "1:535873461807:web:1c1492fe76c40e9d7f30da"
};

// Variable de estado global para controlar si Firebase está activo
window.FirebaseStore = {
    isFirebaseActive: false,
    db: null,
    
    init() {
        if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
            try {
                firebase.initializeApp(firebaseConfig);
                this.db = firebase.firestore();
                this.isFirebaseActive = true;
                console.log("🔥 Firebase inicializado correctamente para Granos RyR");
                this.updateStatusBadge(true);
            } catch (err) {
                console.warn("⚠️ No se pudo conectar a Firebase, usando almacenamiento local:", err);
                this.updateStatusBadge(false);
            }
        } else {
            console.log("⚡ Modo Almacenamiento Local Activo (LocalStorage fallback listo para Firebase)");
            this.updateStatusBadge(false);
        }
    },
    
    updateStatusBadge(active) {
        const badge = document.getElementById('firebaseStatusBadge');
        if (badge) {
            if (active) {
                badge.innerHTML = `<span class="status-dot"></span> Firebase Conectado`;
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = '#10b981';
            } else {
                badge.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b"></span> Modo Local (Listo para Firebase)`;
                badge.style.background = 'rgba(245, 158, 11, 0.15)';
                badge.style.color = '#f59e0b';
            }
        }
    }
};

// Inicializar al cargar el script
document.addEventListener('DOMContentLoaded', () => {
    window.FirebaseStore.init();
});
