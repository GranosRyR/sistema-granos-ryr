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

// Variable de estado global para controlar si Firebase está activo y sincronizar datos
window.FirebaseStore = {
    isFirebaseActive: false,
    db: null,
    
    init() {
        if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.db = firebase.firestore();
                this.isFirebaseActive = true;
                console.log("🔥 Firebase Firestore inicializado correctamente para Granos RyR");
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
        const badge = document.getElementById('syncText');
        const dot = document.getElementById('syncDot');
        if (badge) {
            badge.textContent = active ? 'Sincronizado (Nube)' : 'Modo Local (Listo)';
        }
        if (dot) {
            dot.className = active ? 'sync-dot online' : 'sync-dot';
        }
    },

    /**
     * Sube todos los datos locales (productos, lotes, ventas) a la colección en Firestore
     */
    async pushToCloud(state) {
        if (!this.isFirebaseActive || !this.db) return false;
        try {
            await this.db.collection('empresa_ryr').doc('inventario_ventas').set({
                products: state.products || [],
                lotes: state.lotes || [],
                sales: state.sales || [],
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            console.log("☁️ Datos sincronizados con Firestore exitosamente.");
            return true;
        } catch (err) {
            console.error("❌ Error al guardar en Firestore:", err);
            return false;
        }
    },

    /**
     * Descarga y sincroniza los datos desde Firestore a la aplicación local
     */
    async pullFromCloud() {
        if (!this.isFirebaseActive || !this.db) return null;
        try {
            const doc = await this.db.collection('empresa_ryr').doc('inventario_ventas').get();
            if (doc.exists) {
                const data = doc.data();
                console.log("☁️ Datos descargados desde Firestore:", data);
                return data;
            }
        } catch (err) {
            console.error("❌ Error al leer de Firestore:", err);
        }
        return null;
    }
};

// Inicializar al cargar el script
document.addEventListener('DOMContentLoaded', () => {
    window.FirebaseStore.init();
});
