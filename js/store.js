/* ==========================================================================
   SISTEMA GRANOS RyR - STATE MANAGEMENT (STORE)
   Módulo profundo de persistencia y estado global
   ========================================================================== */

window.RyRState = {
    products: [],
    lotes: [],
    sales: [],
    currentCart: [],
    activeSection: 'dashboard'
};

window.seedInitialData = function() {
    const savedProducts = localStorage.getItem('ryr_products');
    const savedLotes = localStorage.getItem('ryr_lotes');
    const savedSales = localStorage.getItem('ryr_sales');

    if (!savedProducts) {
        const initialProducts = [
            { id: 'p1', name: 'Quintal de Soya', category: 'Soya', defaultUnit: 'Quintal (46 kg)', totalStock: 120 },
            { id: 'p2', name: 'Quintal de Maíz', category: 'Maíz', defaultUnit: 'Quintal (46 kg)', totalStock: 250 },
            { id: 'p3', name: 'Quintal de Sorgo', category: 'Sorgo', defaultUnit: 'Quintal (46 kg)', totalStock: 180 },
            { id: 'p4', name: 'Cascarilla de Soya', category: 'Cascarilla', defaultUnit: 'Quintal / Saco', totalStock: 95 },
            { id: 'p5', name: 'Soya Molida', category: 'Derivados', defaultUnit: 'Quintal / Saco', totalStock: 80 },
            { id: 'p6', name: 'Medio Quintal de Soya', category: 'Soya', defaultUnit: 'Medio Quintal (23 kg)', totalStock: 60 }
        ];
        localStorage.setItem('ryr_products', JSON.stringify(initialProducts));
        window.RyRState.products = initialProducts;
    } else {
        window.RyRState.products = JSON.parse(savedProducts);
    }

    if (!savedLotes) {
        const initialLotes = [
            { id: 'l1', productId: 'p1', code: 'LOTE-SOY-202607-01', costPrice: 110, salePrice: 145, stock: 70, entryDate: '2026-07-01', supplier: 'Agrícola Este' },
            { id: 'l2', productId: 'p1', code: 'LOTE-SOY-202607-02', costPrice: 115, salePrice: 150, stock: 50, entryDate: '2026-07-15', supplier: 'Silo Chiquitania' },
            { id: 'l3', productId: 'p2', code: 'LOTE-MAIZ-202607-01', costPrice: 70, salePrice: 95, stock: 250, entryDate: '2026-07-10', supplier: 'Granos del Sur' },
            { id: 'l4', productId: 'p3', code: 'LOTE-SORGO-202607-01', costPrice: 65, salePrice: 88, stock: 180, entryDate: '2026-07-12', supplier: 'Productoras Unidas' },
            { id: 'l5', productId: 'p4', code: 'LOTE-CASC-202607-01', costPrice: 30, salePrice: 45, stock: 95, entryDate: '2026-07-14', supplier: 'Molienda RyR' },
            { id: 'l6', productId: 'p5', code: 'LOTE-SMOL-202607-01', costPrice: 50, salePrice: 72, stock: 80, entryDate: '2026-07-14', supplier: 'Molienda RyR' }
        ];
        localStorage.setItem('ryr_lotes', JSON.stringify(initialLotes));
        window.RyRState.lotes = initialLotes;
    } else {
        window.RyRState.lotes = JSON.parse(savedLotes);
    }

    if (!savedSales) {
        window.RyRState.sales = [];
    } else {
        window.RyRState.sales = JSON.parse(savedSales);
    }
};

window.persistState = function(syncCloud = true) {
    localStorage.setItem('ryr_products', JSON.stringify(window.RyRState.products));
    localStorage.setItem('ryr_lotes', JSON.stringify(window.RyRState.lotes));
    localStorage.setItem('ryr_sales', JSON.stringify(window.RyRState.sales));
    if (syncCloud && window.FirebaseStore && window.FirebaseStore.isFirebaseActive) {
        window.FirebaseStore.pushToCloud(window.RyRState);
    }
};
