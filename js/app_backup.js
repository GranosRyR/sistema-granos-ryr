/* ==========================================================================
   SISTEMA GRANOS RyR - LÓGICA PRINCIPAL CON ANIMACIONES Y FLUIDEZ PREMIUM
   Copiado exactamente del comportamiento y animaciones de SISTEMA LICORERIA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Estado Principal
    window.RyRState = {
        products: [],
        lotes: [],
        sales: [],
        currentCart: [],
        activeSection: 'dashboard'
    };

    // Chart.js global instances
    let salesTrendChart = null;
    let salesByCategoryChart = null;

    // 1. ANIMACIÓN SPLIT-TEXT PARA EL TÍTULO "GRANOS RyR"
    function initSplitTitle() {
        const titleEl = document.getElementById('shop-title');
        if (!titleEl) return;
        const text = "GRANOS RyR";
        titleEl.innerHTML = text.split('').map((char, i) => {
            if (char === ' ') return ' ';
            return `<span class="split-char" style="animation-delay: ${i * 0.05}s">${char}</span>`;
        }).join('');
    }

    // 2. TEMA CLARO / OSCURO
    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ryr_theme', newTheme);
        
        const label = document.getElementById('themeLabel');
        const thumb = document.getElementById('themeThumb');
        if (label && thumb) {
            label.textContent = newTheme === 'light' ? 'Modo claro' : 'Modo oscuro';
            thumb.textContent = newTheme === 'light' ? '☀️' : '🌙';
        }

        // Re-render charts with new theme colors
        if (RyRState.activeSection === 'dashboard') {
            renderDashboardCharts();
        }
    };

    function initTheme() {
        const savedTheme = localStorage.getItem('ryr_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const toggle = document.getElementById('themeToggle');
        const label = document.getElementById('themeLabel');
        const thumb = document.getElementById('themeThumb');
        
        if (toggle) toggle.checked = (savedTheme === 'dark');
        if (label && thumb) {
            label.textContent = savedTheme === 'light' ? 'Modo claro' : 'Modo oscuro';
            thumb.textContent = savedTheme === 'light' ? '☀️' : '🌙';
        }
    }

    // 3. MOSTRAR TOAST NOTIFICATION
    window.showToast = function(message, type = 'success') {
        const toast = document.getElementById('toastMessage');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    window.sincronizarConNube = async function() {
        const syncIcon = document.getElementById('syncIcon');
        const syncText = document.getElementById('syncText');
        const syncDot = document.getElementById('syncDot');

        showToast('Sincronizando con Firebase...', 'success');
        if (syncIcon) syncIcon.classList.add('spinning');
        if (syncText) syncText.textContent = 'Sincronizando...';
        if (syncDot) syncDot.className = 'sync-dot online';

        if (window.FirebaseStore && window.FirebaseStore.isFirebaseActive) {
            // Intentar bajar datos de la nube
            const cloudData = await window.FirebaseStore.pullFromCloud();
            if (cloudData) {
                if (cloudData.products && cloudData.products.length) RyRState.products = cloudData.products;
                if (cloudData.lotes && cloudData.lotes.length) RyRState.lotes = cloudData.lotes;
                if (cloudData.sales && cloudData.sales.length) RyRState.sales = cloudData.sales;
                persistState(false);
                renderActiveSection();
            }

            // Subir datos locales a la nube
            const success = await window.FirebaseStore.pushToCloud(RyRState);
            if (success) {
                showToast('🔥 Datos sincronizados con Firestore', 'success');
                if (syncText) syncText.textContent = 'Sincronizado (Nube)';
            } else {
                showToast('⚠️ Error al sincronizar con Firebase', 'error');
                if (syncText) syncText.textContent = 'Error de Sync';
            }
        } else {
            showToast('Modo Local - Firebase no conectado', 'warning');
            if (syncText) syncText.textContent = 'Modo Local (Listo)';
        }

        if (syncIcon) syncIcon.classList.remove('spinning');
    };

    // 4. DATOS INICIALES (SEED DATA)
    function seedInitialData() {
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
            RyRState.products = initialProducts;
        } else {
            RyRState.products = JSON.parse(savedProducts);
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
            RyRState.lotes = initialLotes;
        } else {
            RyRState.lotes = JSON.parse(savedLotes);
        }

        if (!savedSales) {
            RyRState.sales = [];
        } else {
            RyRState.sales = JSON.parse(savedSales);
        }
    }

    function persistState(syncCloud = true) {
        localStorage.setItem('ryr_products', JSON.stringify(RyRState.products));
        localStorage.setItem('ryr_lotes', JSON.stringify(RyRState.lotes));
        localStorage.setItem('ryr_sales', JSON.stringify(RyRState.sales));
        if (syncCloud && window.FirebaseStore && window.FirebaseStore.isFirebaseActive) {
            window.FirebaseStore.pushToCloud(RyRState);
        }
    }

    // 5. NAVEGACIÓN Y TRANSICIÓN DE SECCIONES CON ANIMACIÓN
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (!section) return;

                switchSection(section);
                
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            });
        });
    }

    window.switchSection = function(sectionName) {
        if (RyRState.activeSection === sectionName) return;

        const currentActive = document.getElementById(`section-${RyRState.activeSection}`);
        RyRState.activeSection = sectionName;

        // Función que activa la sección nueva (se ejecuta DESPUÉS de ocultar la anterior)
        function activateNewSection() {
            const target = document.getElementById(`section-${sectionName}`);
            if (target) {
                target.style.display = 'block';
                void target.offsetWidth; // Forzar reflow para garantizar que la animación CSS se dispare
                target.classList.add('active');
            }

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(i => {
                i.classList.toggle('active', i.getAttribute('data-section') === sectionName);
            });

            renderActiveSection();
        }

        if (currentActive) {
            currentActive.classList.add('exiting');
            setTimeout(() => {
                currentActive.classList.remove('active', 'exiting');
                currentActive.style.display = 'none';
                // Solo después de ocultar la sección vieja, mostramos la nueva
                activateNewSection();
            }, 180);
        } else {
            activateNewSection();
        }
    };

    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    };

    // 6. RENDERS Y ANIMACIÓN BUMP EN VALORES
    function updateValueWithBump(id, newValue) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.textContent !== newValue) {
            el.textContent = newValue;
            el.classList.remove('bump');
            void el.offsetWidth; // Re-trigger animación
            el.classList.add('bump');
        }
    }

    function renderActiveSection() {
        switch (RyRState.activeSection) {
            case 'dashboard':
                initSplitTitle();
                renderDashboard();
                break;
            case 'inventario':
                renderInventario();
                break;
            case 'pos':
                renderPOS();
                break;
            case 'historial':
                renderHistorial();
                break;
            case 'analytics':
                renderAnalytics();
                break;
            case 'lotes':
                renderLotes();
                break;
            case 'agregar':
                populateProductDatalist();
                break;
            case 'qr':
                break;
        }
        updateBadges();
    }

    function renderDashboard() {
        const totalProducts = RyRState.products.length;
        const totalStock = RyRState.lotes.reduce((sum, l) => sum + l.stock, 0);
        const lowStockCount = RyRState.lotes.filter(l => l.stock <= 20).length;

        const today = new Date().toISOString().split('T')[0];
        const salesToday = RyRState.sales.filter(s => s.timestamp.startsWith(today));
        const salesAmountToday = salesToday.reduce((sum, s) => sum + s.totalAmount, 0);
        const profitToday = salesToday.reduce((sum, s) => sum + (s.netProfit || 0), 0);

        updateValueWithBump('stat-total-productos', totalProducts.toString());
        updateValueWithBump('stat-total-stock', `${totalStock} Ql.`);
        updateValueWithBump('stat-lotes-bajo', lowStockCount.toString());
        updateValueWithBump('stat-ventas-hoy', `Bs. ${salesAmountToday.toFixed(2)}`);
        updateValueWithBump('stat-ganancia-hoy', `Bs. ${profitToday.toFixed(2)}`);

        const recentBody = document.getElementById('dashRecentSalesBody');
        if (recentBody) {
            const recent = RyRState.sales.slice(-5).reverse();
            if (recent.length === 0) {
                recentBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text3); padding:16px;">Sin ventas registradas aún</td></tr>`;
            } else {
                recentBody.innerHTML = recent.map(s => `
                    <tr class="inventory-row">
                        <td><strong>#${s.saleId}</strong></td>
                        <td>${s.customerName}</td>
                        <td>${s.customerPhone || 'S/N'}</td>
                        <td><strong style="color:var(--green);">Bs. ${s.totalAmount.toFixed(2)}</strong></td>
                        <td><span class="badge badge-ok">${s.paymentMethod}</span></td>
                    </tr>
                `).join('');
            }
        }
        // Render charts after dashboard stats
        renderDashboardCharts();
    }

    // ── CHART.JS DASHBOARD CHARTS ──
    function renderDashboardCharts() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#a1a1aa' : '#52525b';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        const greenColor = isDark ? '#22c55e' : '#16a34a';
        const accentColor = isDark ? '#60a5fa' : '#2563eb';

        // --- LINE CHART: Sales Trend (Last 7 days) ---
        const lineCtx = document.getElementById('chartSalesTrend');
        if (!lineCtx) return;

        const labels = [];
        const revenueData = [];
        const profitData = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric' });
            labels.push(dayLabel);

            const daySales = RyRState.sales.filter(s => s.timestamp.startsWith(key));
            revenueData.push(daySales.reduce((sum, s) => sum + s.totalAmount, 0));
            profitData.push(daySales.reduce((sum, s) => sum + (s.netProfit || 0), 0));
        }

        if (salesTrendChart) salesTrendChart.destroy();
        salesTrendChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ingresos (Bs.)',
                        data: revenueData,
                        borderColor: accentColor,
                        backgroundColor: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(37,99,235,0.08)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: accentColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Ganancia Neta (Bs.)',
                        data: profitData,
                        borderColor: greenColor,
                        backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.08)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: greenColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { family: "'Plus Jakarta Sans'", size: 11, weight: '600' }, usePointStyle: true, pointStyle: 'circle', padding: 16 }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#18181b' : '#09090b',
                        titleFont: { family: "'Plus Jakarta Sans'", size: 12, weight: '700' },
                        bodyFont: { family: "'Space Grotesk'", size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(ctx) { return ctx.dataset.label + ': Bs. ' + ctx.parsed.y.toFixed(2); }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'Plus Jakarta Sans'", size: 10 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'Space Grotesk'", size: 10 }, callback: v => 'Bs.' + v }, beginAtZero: true }
                }
            }
        });

        // --- DOUGHNUT CHART: Sales by Category ---
        const donutCtx = document.getElementById('chartSalesByCategory');
        if (!donutCtx) return;

        const catTotals = {};
        RyRState.sales.forEach(s => {
            s.items.forEach(item => {
                const product = RyRState.products.find(p => p.id === item.productId);
                const cat = product ? product.category : 'Otros';
                catTotals[cat] = (catTotals[cat] || 0) + item.subtotal;
            });
        });

        const catLabels = Object.keys(catTotals);
        const catValues = Object.values(catTotals);
        const catColors = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];

        if (salesByCategoryChart) salesByCategoryChart.destroy();
        salesByCategoryChart = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: catLabels.length > 0 ? catLabels : ['Sin datos'],
                datasets: [{
                    data: catValues.length > 0 ? catValues : [1],
                    backgroundColor: catValues.length > 0 ? catColors.slice(0, catLabels.length) : ['#e4e4e7'],
                    borderColor: isDark ? '#141416' : '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { family: "'Plus Jakarta Sans'", size: 11, weight: '600' }, usePointStyle: true, pointStyle: 'circle', padding: 14 }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#18181b' : '#09090b',
                        titleFont: { family: "'Plus Jakarta Sans'", size: 12, weight: '700' },
                        bodyFont: { family: "'Space Grotesk'", size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) { return ctx.label + ': Bs. ' + ctx.parsed.toFixed(2); }
                        }
                    }
                }
            }
        });
    }

    function renderInventario() {
        const body = document.getElementById('invTableBody');
        if (!body) return;

        body.innerHTML = RyRState.products.map(p => {
            const lotes = RyRState.lotes.filter(l => l.productId === p.id);
            const totalStock = lotes.reduce((sum, l) => sum + l.stock, 0);
            const avgCost = lotes.length > 0 ? (lotes.reduce((s, l) => s + l.costPrice, 0) / lotes.length) : 0;
            const avgSale = lotes.length > 0 ? (lotes.reduce((s, l) => s + l.salePrice, 0) / lotes.length) : 0;
            const ganancia = avgCost > 0 ? (((avgSale - avgCost) / avgCost) * 100).toFixed(1) : '0.0';

            const costStr = lotes.length > 0 ? `Bs. ${avgCost.toFixed(2)}` : '—';
            const saleStr = lotes.length > 0 ? `Bs. ${avgSale.toFixed(2)}` : 'Bs. 0.00';
            const gananciaStr = lotes.length > 0 ? `${ganancia}%` : '—';

            const statusBadge = totalStock > 20 
                ? `<span class="badge badge-ok">En stock</span>`
                : (totalStock > 0 ? `<span class="badge badge-bajo">Bajo</span>` : `<span class="badge badge-agotado">Agotado</span>`);

            let lotesHTML = '';
            if (lotes.length > 0) {
                const lotRows = lotes.map((l, i) => {
                    const ganancia = l.costPrice > 0 ? ((l.salePrice - l.costPrice) * l.stock).toFixed(2) : '0.00';
                    const lotStatus = l.stock > 20 
                        ? `<span class="badge badge-ok">Disponible</span>` 
                        : (l.stock > 0 ? `<span class="badge badge-bajo">Bajo</span>` : `<span class="badge badge-agotado">Agotado</span>`);
                    return `
                        <tr>
                            <td class="inv-lote-td inv-lote-td-name">${l.code}</td>
                            <td class="inv-lote-td">${l.stock} Ql.</td>
                            <td class="inv-lote-td">Bs. ${l.costPrice.toFixed(2)}</td>
                            <td class="inv-lote-td" style="color:var(--green); font-weight:600;">Bs. ${l.salePrice.toFixed(2)}</td>
                            <td class="inv-lote-td" style="color:var(--green); font-weight:600;">Bs. ${ganancia}</td>
                            <td class="inv-lote-td">${l.supplier}</td>
                            <td class="inv-lote-td">${l.entryDate}</td>
                            <td class="inv-lote-td">${lotStatus}</td>
                        </tr>
                    `;
                }).join('');
                lotesHTML = `
                    <table class="inv-lote-subtable">
                        <thead>
                            <tr>
                                <th>Lote</th>
                                <th>Stock</th>
                                <th>Costo</th>
                                <th>Venta</th>
                                <th>Ganancia</th>
                                <th>Proveedor</th>
                                <th>F. Ingreso</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>${lotRows}</tbody>
                    </table>
                `;
            } else {
                lotesHTML = `<div class="inv-lote-empty">Sin lotes registrados</div>`;
            }

            return `
                <tr class="inventory-row inv-product-row" onclick="toggleInvRow(this)" data-product="${p.id}">
                    <td><span class="inv-toggle-icon">▶</span></td>
                    <td>
                        <div class="inv-product-name">${p.name}</div>
                        <div class="inv-product-sub">${p.defaultUnit} / ${lotes.length} lote(s)</div>
                    </td>
                    <td><span class="badge badge-gold">${p.category}</span></td>
                    <td><strong style="color:var(--text);">${totalStock}</strong> Ql.</td>
                    <td>${costStr}</td>
                    <td style="font-weight:700; color:var(--green); font-size:1.05rem;">${saleStr}</td>
                    <td>${gananciaStr}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="inv-actions" onclick="event.stopPropagation()">
                            <button class="inv-btn-action" title="Editar" onclick="editProduct('${p.id}')">✏️</button>
                            <button class="inv-btn-action" title="Ajustar Precios" onclick="openPriceAdjust('${p.id}')">%</button>
                            <button class="inv-btn-action inv-btn-danger" title="Eliminar" onclick="deleteProduct('${p.id}')">✕</button>
                        </div>
                    </td>
                </tr>
                <tr class="inv-lotes-row" data-lotes-for="${p.id}" style="display:none;">
                    <td colspan="9">
                        <div class="inv-lotes-container">
                            ${lotesHTML}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.toggleInvRow = function(row) {
        const productId = row.getAttribute('data-product');
        const lotesRow = document.querySelector(`tr[data-lotes-for="${productId}"]`);
        const icon = row.querySelector('.inv-toggle-icon');
        if (!lotesRow || !icon) return;

        const isOpen = lotesRow.style.display !== 'none';
        lotesRow.style.display = isOpen ? 'none' : 'table-row';
        icon.classList.toggle('open', !isOpen);
    };

    window.editProduct = function(productId) {
        const product = RyRState.products.find(p => p.id === productId);
        if (!product) return;

        window._editingProductId = productId;

        document.getElementById('newGrainName').value = product.name;
        document.getElementById('newGrainCategory').value = product.category;
        document.getElementById('newSupplier').value = '';

        const lotes = RyRState.lotes.filter(l => l.productId === productId);
        if (lotes.length > 0) {
            const lastLote = lotes[lotes.length - 1];
            document.getElementById('newCostPrice').value = lastLote.costPrice;
            document.getElementById('newSalePrice').value = lastLote.salePrice;
        } else {
            document.getElementById('newCostPrice').value = '';
            document.getElementById('newSalePrice').value = '';
        }

        const loteCodeInput = document.getElementById('newLoteCode');
        loteCodeInput.value = '';
        loteCodeInput.placeholder = 'Nuevo lote para stock extra';
        document.getElementById('newStockQty').value = '';

        const saveBtn = document.querySelector('#section-agregar .btn-primary');
        if (saveBtn) {
            saveBtn.textContent = '💾 Actualizar Producto';
            saveBtn.setAttribute('onclick', 'updateExistingProduct()');
        }

        switchSection('agregar');
    };

    window.updateExistingProduct = function() {
        if (!window._editingProductId) return;

        const product = RyRState.products.find(p => p.id === window._editingProductId);
        if (!product) return;

        product.name = document.getElementById('newGrainName').value.trim() || product.name;
        product.category = document.getElementById('newGrainCategory').value;

        const newCost = parseFloat(document.getElementById('newCostPrice').value);
        const newSale = parseFloat(document.getElementById('newSalePrice').value);
        const newStock = parseFloat(document.getElementById('newStockQty').value);
        const newLoteCode = document.getElementById('newLoteCode').value.trim();
        const newSupplier = document.getElementById('newSupplier').value.trim() || 'Proveedor General';

        if (!isNaN(newCost) && !isNaN(newSale) && !isNaN(newStock) && newStock > 0 && newLoteCode) {
            RyRState.lotes.push({
                id: 'l_' + Date.now(),
                productId: product.id,
                code: newLoteCode,
                costPrice: newCost,
                salePrice: newSale,
                stock: newStock,
                entryDate: new Date().toISOString().split('T')[0],
                supplier: newSupplier
            });
            showToast(`Nuevo lote ${newLoteCode} agregado al producto`, 'success');
        } else {
            const lotes = RyRState.lotes.filter(l => l.productId === product.id);
            lotes.forEach(l => {
                if (!isNaN(newCost) && newCost > 0) l.costPrice = newCost;
                if (!isNaN(newSale) && newSale > 0) l.salePrice = newSale;
            });
            if (lotes.length > 0) {
                showToast('Precios actualizados en todos los lotes', 'success');
            }
        }

        persistState();
        window._editingProductId = null;
        resetAgregarForm();
        switchSection('inventario');
    };

    function resetAgregarForm() {
        document.getElementById('newGrainName').value = '';
        document.getElementById('newGrainCategory').value = 'Soya';
        document.getElementById('newLoteCode').value = '';
        document.getElementById('newLoteCode').placeholder = 'Ej. LOTE-SOY-2026-02';
        document.getElementById('newCostPrice').value = '';
        document.getElementById('newSalePrice').value = '';
        document.getElementById('newStockQty').value = '';
        document.getElementById('newSupplier').value = '';

        const saveBtn = document.querySelector('#section-agregar .btn-primary');
        if (saveBtn) {
            saveBtn.textContent = '💾 Guardar Producto / Lote';
            saveBtn.setAttribute('onclick', 'saveNewProductOrLote()');
        }
    }

    window.deleteProduct = function(productId) {
        const product = RyRState.products.find(p => p.id === productId);
        if (!product) return;

        if (!confirm(`¿Eliminar "${product.name}" y todos sus lotes?`)) return;

        RyRState.products = RyRState.products.filter(p => p.id !== productId);
        RyRState.lotes = RyRState.lotes.filter(l => l.productId !== productId);
        persistState();
        renderActiveSection();
        showToast(`${product.name} eliminado`, 'success');
    };

    let _adjustProductId = null;

    window.openPriceAdjust = function(productId) {
        const product = RyRState.products.find(p => p.id === productId);
        if (!product) return;

        _adjustProductId = productId;
        const lotes = RyRState.lotes.filter(l => l.productId === productId);
        const avgCost = lotes.length > 0 ? lotes.reduce((s, l) => s + l.costPrice, 0) / lotes.length : 0;
        const avgSale = lotes.length > 0 ? lotes.reduce((s, l) => s + l.salePrice, 0) / lotes.length : 0;

        document.getElementById('adjustProductName').textContent = product.name;
        document.getElementById('adjustCurrentCost').value = avgCost.toFixed(2);
        document.getElementById('adjustCurrentSale').value = avgSale.toFixed(2);
        document.getElementById('adjustCostPercent').value = '';
        document.getElementById('adjustSalePercent').value = '';
        document.getElementById('previewNewCost').textContent = `Bs. ${avgCost.toFixed(2)}`;
        document.getElementById('previewNewSale').textContent = `Bs. ${avgSale.toFixed(2)}`;
        document.getElementById('previewOldMargin').textContent = avgCost > 0 ? `${(((avgSale - avgCost) / avgCost) * 100).toFixed(1)}%` : '0%';
        document.getElementById('previewNewMargin').textContent = avgCost > 0 ? `${(((avgSale - avgCost) / avgCost) * 100).toFixed(1)}%` : '0%';

        document.getElementById('priceAdjustModal').style.display = 'flex';
    };

    window.previewAdjustPrice = function() {
        const currentCost = parseFloat(document.getElementById('adjustCurrentCost').value) || 0;
        const currentSale = parseFloat(document.getElementById('adjustCurrentSale').value) || 0;
        const costPct = parseFloat(document.getElementById('adjustCostPercent').value) || 0;
        const salePct = parseFloat(document.getElementById('adjustSalePercent').value) || 0;

        const newCost = currentCost * (1 + costPct / 100);
        const newSale = currentSale * (1 + salePct / 100);
        const newMargin = newCost > 0 ? (((newSale - newCost) / newCost) * 100).toFixed(1) : '0.0';

        document.getElementById('previewNewCost').textContent = `Bs. ${newCost.toFixed(2)}`;
        document.getElementById('previewNewSale').textContent = `Bs. ${newSale.toFixed(2)}`;
        document.getElementById('previewNewMargin').textContent = `${newMargin}%`;
    };

    window.applyPriceAdjust = function() {
        if (!_adjustProductId) return;

        const lotes = RyRState.lotes.filter(l => l.productId === _adjustProductId);
        if (lotes.length === 0) {
            showToast('Este producto no tiene lotes para ajustar', 'warning');
            return;
        }

        const costPct = parseFloat(document.getElementById('adjustCostPercent').value) || 0;
        const salePct = parseFloat(document.getElementById('adjustSalePercent').value) || 0;

        lotes.forEach(l => {
            if (costPct !== 0) l.costPrice = parseFloat((l.costPrice * (1 + costPct / 100)).toFixed(2));
            if (salePct !== 0) l.salePrice = parseFloat((l.salePrice * (1 + salePct / 100)).toFixed(2));
        });

        persistState();
        closePriceAdjustModal();
        renderActiveSection();
        showToast('Precios ajustados correctamente', 'success');
    };

    window.closePriceAdjustModal = function() {
        document.getElementById('priceAdjustModal').style.display = 'none';
        _adjustProductId = null;
    };

    window.filterInventoryTable = function() {
        const q = (document.getElementById('searchInput').value || '').toLowerCase();
        const cat = document.getElementById('filterCategoria').value;
        const rows = document.querySelectorAll('#invTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matchesQuery = !q || text.includes(q);
            const matchesCat = !cat || text.includes(cat.toLowerCase());
            row.style.display = (matchesQuery && matchesCat) ? '' : 'none';
        });
    };

    // 7. POS Y CARRITO
    function renderPOS() {
        const pSelect = document.getElementById('posProductSelect');
        if (!pSelect) return;

        pSelect.innerHTML = `<option value="">-- Seleccionar --</option>` + RyRState.products.map(p => `
            <option value="${p.id}">${p.name} (${p.category})</option>
        `).join('');

        renderPOSCart();
    }

    window.onPOSProductChange = function() {
        const pId = document.getElementById('posProductSelect').value;
        const loteSelect = document.getElementById('posLoteSelect');
        const unitPriceInput = document.getElementById('posUnitPrice');

        if (!pId) {
            loteSelect.innerHTML = `<option value="">-- Seleccionar Lote --</option>`;
            unitPriceInput.value = '';
            return;
        }

        const lotes = RyRState.lotes.filter(l => l.productId === pId && l.stock > 0);
        if (lotes.length === 0) {
            loteSelect.innerHTML = `<option value="">-- Sin Stock Disponible --</option>`;
            unitPriceInput.value = '';
            return;
        }

        loteSelect.innerHTML = lotes.map(l => `
            <option value="${l.id}">${l.code} - Stock: ${l.stock} Ql. (Precio: Bs. ${l.salePrice})</option>
        `).join('');

        unitPriceInput.value = lotes[0].salePrice;
    };

    window.onPOSLoteChange = function() {
        const loteId = document.getElementById('posLoteSelect').value;
        const lote = RyRState.lotes.find(l => l.id === loteId);
        if (lote) {
            document.getElementById('posUnitPrice').value = lote.salePrice;
        }
    };

    window.addPosItem = function() {
        const pId = document.getElementById('posProductSelect').value;
        const loteId = document.getElementById('posLoteSelect').value;
        const unitType = document.getElementById('posUnitType').value;
        const qty = parseFloat(document.getElementById('posQuantity').value);
        const unitPrice = parseFloat(document.getElementById('posUnitPrice').value);

        if (!pId || !loteId || isNaN(qty) || qty <= 0 || isNaN(unitPrice)) {
            showToast('⚠️ Complete los campos requeridos.', 'warning');
            return;
        }

        const product = RyRState.products.find(p => p.id === pId);
        const lote = RyRState.lotes.find(l => l.id === loteId);

        // 🛡️ DEFENSA 1: Validación de Lote Inexistente
        if (!lote) {
            showToast('⚠️ Error de sistema: El lote seleccionado no existe.', 'error');
            return;
        }

        // 🛡️ DEFENSA 2: Vulnerabilidad de Manipulación del DOM (Inspeccionar Elemento)
        // Protegemos matemáticamente que el precio de venta unitario no sea menor al costo de compra
        if (unitPrice < lote.costPrice) {
            showToast(`⚠️ Error: El precio (Bs. ${unitPrice}) no puede ser menor al costo (Bs. ${lote.costPrice}).`, 'error');
            return;
        }

        // 🛡️ DEFENSA 3: Matemáticas de Lotaje para Carrito Acumulado
        // Calculamos cuánto stock de este lote ya está apartado en el carrito actual
        const stockComprometido = RyRState.currentCart
            .filter(item => item.loteId === lote.id)
            .reduce((sum, item) => sum + item.quantity, 0);

        const stockDisponibleReal = lote.stock - stockComprometido;

        if (qty > stockDisponibleReal) {
            showToast(`⚠️ Stock insuficiente. Disponibles: ${stockDisponibleReal} Ql. (Ya hay ${stockComprometido} en carrito).`, 'error');
            return;
        }

        RyRState.currentCart.push({
            productId: pId,
            productName: product.name,
            loteId: lote.id,
            loteCode: lote.code,
            unitType: unitType,
            quantity: qty,
            unitPrice: unitPrice,
            costPrice: lote.costPrice,
            subtotal: qty * unitPrice
        });

        showToast(`✔ ${product.name} agregado al carrito`, 'success');
        renderPOSCart();

        // Frontend Design: Signature Element Animation Pulse
        const posSection = document.getElementById('section-pos');
        if (posSection) {
            posSection.classList.remove('pos-signature-pulse');
            void posSection.offsetWidth; // Force reflow to restart animation
            posSection.classList.add('pos-signature-pulse');
        }
    };

    function renderPOSCart() {
        const body = document.getElementById('posCartTableBody');
        const totalEl = document.getElementById('posCartTotalAmount');
        if (!body) return;

        if (RyRState.currentCart.length === 0) {
            body.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text3); padding: 12px;">Carrito vacío</td></tr>`;
            if (totalEl) totalEl.textContent = 'Bs. 0.00';
            return;
        }

        let total = 0;
        body.innerHTML = RyRState.currentCart.map((item, index) => {
            total += item.subtotal;
            return `
                <tr class="inventory-row">
                    <td><strong>${item.productName}</strong></td>
                    <td><span class="badge badge-gold">${item.loteCode}</span></td>
                    <td>${item.quantity} ${item.unitType.split(' ')[0]}</td>
                    <td><strong>Bs. ${item.subtotal.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-secondary" style="padding:2px 6px; font-size:0.75rem;" onclick="removePosItem(${index})">❌</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (totalEl) totalEl.textContent = `Bs. ${total.toFixed(2)}`;
    }

    window.removePosItem = function(index) {
        RyRState.currentCart.splice(index, 1);
        renderPOSCart();
    };

    window.processSale = function(sendWhatsApp = false) {
        if (RyRState.currentCart.length === 0) {
            showToast('⚠️ Agregue productos antes de cobrar.', 'warning');
            return;
        }

        // 🛡️ DEFENSA 4: Bloqueo de Concurrencia (UI Block) para evitar Multi-Clicks
        const btnsPos = document.querySelectorAll('#section-pos .btn');
        btnsPos.forEach(btn => btn.style.pointerEvents = 'none');
        
        try {
            const customerName = document.getElementById('posCustomerName').value.trim() || 'Cliente General';
            const customerNit = document.getElementById('posCustomerNit').value.trim() || 'S/N';
            const customerPhone = document.getElementById('posCustomerPhone').value.trim();
            const paymentMethod = document.getElementById('posPaymentMethod').value;

            const carPlaca = document.getElementById('posCarPlaca').value.trim();
            const carModel = document.getElementById('posCarModel').value.trim();
            const driverName = document.getElementById('posDriverName').value.trim();

            if (sendWhatsApp && !customerPhone) {
                showToast('⚠️ Ingrese el número de WhatsApp del cliente.', 'warning');
                return;
            }

            // 🛡️ DEFENSA 5: Validación TDD (Doble Chequeo) antes de descontar stock
            // Agrupamos el carrito por lotes para confirmar que el stock total a descontar existe
            const loteRestants = {};
            for (let item of RyRState.currentCart) {
                loteRestants[item.loteId] = (loteRestants[item.loteId] || 0) + item.quantity;
            }
            
            for (let lId in loteRestants) {
                const lote = RyRState.lotes.find(l => l.id === lId);
                if (!lote || lote.stock < loteRestants[lId]) {
                    throw new Error(`Stock inconsistente para el Lote ${lote ? lote.code : 'Desconocido'}. Recargue la página.`);
                }
            }

            const totalAmount = RyRState.currentCart.reduce((sum, i) => sum + i.subtotal, 0);
            const totalCost = RyRState.currentCart.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0);
            const netProfit = totalAmount - totalCost;

            const saleId = (1000 + RyRState.sales.length + 1).toString();
            const saleData = {
                saleId: saleId,
                customerName: customerName,
                customerNit: customerNit,
                customerPhone: customerPhone,
                paymentMethod: paymentMethod,
                carPlaca: carPlaca,
                carModel: carModel,
                driverName: driverName,
                items: [...RyRState.currentCart],
                totalAmount: totalAmount,
                totalCost: totalCost,
                netProfit: netProfit,
                timestamp: new Date().toISOString()
            };

            // Ejecución Quirúrgica: Descontar Stock Oficialmente
            RyRState.currentCart.forEach(cartItem => {
                const lote = RyRState.lotes.find(l => l.id === cartItem.loteId);
                if (lote) {
                    lote.stock -= cartItem.quantity;
                }
            });

            RyRState.sales.push(saleData);
            persistState();

            showToast(`🎉 Venta #${saleId} registrada con éxito`, 'success');
            showReceiptModal(saleData, sendWhatsApp);

            RyRState.currentCart = [];
            document.getElementById('posCustomerName').value = '';
            document.getElementById('posCustomerNit').value = '';
            document.getElementById('posCustomerPhone').value = '';
            document.getElementById('posProductSelect').value = '';
            document.getElementById('posLoteSelect').innerHTML = '<option value="">-- Seleccionar Lote --</option>';
            document.getElementById('posQuantity').value = '1';
            document.getElementById('posUnitPrice').value = '';
            document.getElementById('posPaymentMethod').value = 'Efectivo';
            
            document.getElementById('posCarPlaca').value = '';
            document.getElementById('posCarModel').value = '';
            document.getElementById('posDriverName').value = '';
            renderPOSCart();

            if (RyRState.activeSection === 'dashboard') {
                renderDashboard();
            }
        } catch (err) {
            showToast(err.message, 'error');
            console.error("Transacción abortada: ", err);
        } finally {
            // 🛡️ Liberar el bloqueo de UI
            btnsPos.forEach(btn => btn.style.pointerEvents = 'auto');
        }
    };

    function showReceiptModal(saleData, triggerWhatsApp = false) {
        const modal = document.getElementById('receiptModal');
        const body = document.getElementById('receiptModalBody');
        if (!modal || !body) return;

        body.innerHTML = window.PDFGenerator.generateReceiptHTML(saleData);
        modal.style.display = 'flex';

        document.getElementById('btnModalPrint').onclick = () => window.PDFGenerator.printReceipt();
        document.getElementById('btnModalDownloadPDF').onclick = () => window.PDFGenerator.downloadPDF(saleData);
        document.getElementById('btnModalWhatsApp').onclick = () => {
            window.WhatsAppHelper.sendInvoiceToWhatsApp(saleData.customerPhone, saleData);
        };

        if (triggerWhatsApp && saleData.customerPhone) {
            setTimeout(() => {
                window.WhatsAppHelper.sendInvoiceToWhatsApp(saleData.customerPhone, saleData);
            }, 400);
        }
    }

    window.closeReceiptModal = function() {
        const modal = document.getElementById('receiptModal');
        if (modal) modal.style.display = 'none';
    };

    function renderHistorial() {
        const body = document.getElementById('historyTableBody');
        if (!body) return;

        if (RyRState.sales.length === 0) {
            body.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text3); padding:16px;">Sin ventas registradas</td></tr>`;
            return;
        }

        body.innerHTML = [...RyRState.sales].reverse().map(s => {
            const dateStr = new Date(s.timestamp).toLocaleString('es-BO');
            const isoDate = s.timestamp.split('T')[0];
            return `
                <tr class="inventory-row" data-date="${isoDate}">
                    <td><strong>#${s.saleId}</strong></td>
                    <td>${dateStr}</td>
                    <td>${s.customerName}</td>
                    <td>${s.customerPhone || 'S/N'}</td>
                    <td><span class="badge badge-ok">${s.paymentMethod}</span></td>
                    <td><strong style="color:var(--green);">Bs. ${s.totalAmount.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="reprintSale('${s.saleId}')">📄 Recibo</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.filterHistoryTable = function() {
        const q = (document.getElementById('searchHistoryInput').value || '').toLowerCase();
        const dateFilter = document.getElementById('filterHistoryDate').value;
        const rows = document.querySelectorAll('#historyTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matchesQuery = !q || text.includes(q);
            
            let matchesDate = true;
            if (dateFilter) {
                const rowDate = row.getAttribute('data-date');
                if (rowDate !== dateFilter) {
                    matchesDate = false;
                }
            }
            row.style.display = (matchesQuery && matchesDate) ? '' : 'none';
        });
    };

    window.reprintSale = function(saleId) {
        const sale = RyRState.sales.find(s => s.saleId === saleId);
        if (sale) showReceiptModal(sale, false);
    };

    function renderAnalytics() {
        const totalRev = RyRState.sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalCOGS = RyRState.sales.reduce((sum, s) => sum + s.totalCost, 0);
        const netProfit = totalRev - totalCOGS;

        updateValueWithBump('anaTotalRevenue', `Bs. ${totalRev.toFixed(2)}`);
        updateValueWithBump('anaTotalCOGS', `Bs. ${totalCOGS.toFixed(2)}`);
        updateValueWithBump('anaNetProfit', `Bs. ${netProfit.toFixed(2)}`);

        // New metrics
        const totalVentas = RyRState.sales.length;
        updateValueWithBump('anaTotalVentas', totalVentas.toString());

        let productCounts = {};
        RyRState.sales.forEach(sale => {
            sale.items.forEach(item => {
                productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
            });
        });
        let topProduct = '-';
        let maxQty = 0;
        for (const [name, qty] of Object.entries(productCounts)) {
            if (qty > maxQty) {
                maxQty = qty;
                topProduct = name;
            }
        }
        updateValueWithBump('anaTopProducto', topProduct);

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

        const salesToday = RyRState.sales.filter(s => s.timestamp.startsWith(todayStr)).length;
        const salesYesterday = RyRState.sales.filter(s => s.timestamp.startsWith(yesterdayStr)).length;
        
        let compText = `${salesToday} vs ${salesYesterday}`;
        if (salesToday > salesYesterday) compText += ' (↑)';
        else if (salesToday < salesYesterday) compText += ' (↓)';
        else compText += ' (=)';
        updateValueWithBump('anaVentasComparacion', compText);

        const avgMargin = totalCOGS > 0 ? ((netProfit / totalCOGS) * 100).toFixed(1) + '%' : '0%';
        updateValueWithBump('anaMargenPromedio', avgMargin);
    }

    function renderLotes() {
        const body = document.getElementById('lotesTableBody');
        if (!body) return;

        body.innerHTML = RyRState.lotes.map(l => {
            const product = RyRState.products.find(p => p.id === l.productId);
            const margin = ((l.salePrice - l.costPrice) / l.costPrice * 100).toFixed(1);
            return `
                <tr class="inventory-row">
                    <td><strong class="badge badge-gold">${l.code}</strong></td>
                    <td>${product ? product.name : 'N/A'}</td>
                    <td>Bs. ${l.costPrice.toFixed(2)}</td>
                    <td>Bs. ${l.salePrice.toFixed(2)}</td>
                    <td><span class="badge badge-ok">+${margin}%</span></td>
                    <td><strong>${l.stock} Ql.</strong></td>
                    <td>${l.supplier}</td>
                    <td>${l.entryDate}</td>
                </tr>
            `;
        }).join('');
    }

    function populateProductDatalist() {
        const datalist = document.getElementById('existingProductsList');
        if (!datalist) return;
        
        // Clear existing
        datalist.innerHTML = '';
        
        // Populate with current products
        RyRState.products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            datalist.appendChild(option);
        });
    }

    window.saveNewProductOrLote = function() {
        const grainName = document.getElementById('newGrainName').value.trim();
        const category = document.getElementById('newGrainCategory').value;
        const costPrice = parseFloat(document.getElementById('newCostPrice').value);
        const salePrice = parseFloat(document.getElementById('newSalePrice').value);
        const stockQty = parseFloat(document.getElementById('newStockQty').value);
        const supplier = document.getElementById('newSupplier').value.trim() || 'Proveedor General';
        const manualLoteCode = document.getElementById('newLoteCode').value.trim();

        // Enhanced validation
        if (!grainName) {
            showToast('⚠️ Ingrese el nombre del grano.', 'warning');
            document.getElementById('newGrainName').focus();
            return;
        }
        if (isNaN(costPrice) || costPrice <= 0) {
            showToast('⚠️ Ingrese un costo de compra válido.', 'warning');
            document.getElementById('newCostPrice').focus();
            return;
        }
        if (isNaN(salePrice) || salePrice <= 0) {
            showToast('⚠️ Ingrese un precio de venta válido.', 'warning');
            document.getElementById('newSalePrice').focus();
            return;
        }
        if (isNaN(stockQty) || stockQty <= 0) {
            showToast('⚠️ Ingrese una cantidad de stock válida.', 'warning');
            document.getElementById('newStockQty').focus();
            return;
        }
        if (salePrice <= costPrice) {
            if (!confirm(`⚠️ El precio de venta (Bs. ${salePrice}) es menor o igual al costo (Bs. ${costPrice}). ¿Desea continuar?`)) {
                return;
            }
        }

        // 3. Duplicate Lot Code Validation
        if (manualLoteCode) {
            const isDuplicate = RyRState.lotes.some(l => l.code.toLowerCase() === manualLoteCode.toLowerCase());
            if (isDuplicate) {
                showToast(`⚠️ El Código de Lote "${manualLoteCode}" ya existe. Use uno diferente.`, 'error');
                document.getElementById('newLoteCode').focus();
                return;
            }
        }

        let existingProduct = RyRState.products.find(p => p.name.toLowerCase() === grainName.toLowerCase());

        if (!existingProduct) {
            existingProduct = {
                id: 'p_' + Date.now(),
                name: grainName, // Keep original casing inputted by user
                category: category,
                defaultUnit: 'Quintal (46 kg)',
                totalStock: 0
            };
            RyRState.products.push(existingProduct);
        }

        const existingLotes = RyRState.lotes.filter(l => l.productId === existingProduct.id);
        const nextLoteNum = existingLotes.length + 1;
        
        // 2. Intelligent Auto-Generation of Lot Code
        let loteCode = manualLoteCode;
        if (!loteCode) {
            const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '').substring(2); // e.g. 260722
            const catPart = category.substring(0, 3).toUpperCase();
            loteCode = `${catPart}-${datePart}-${nextLoteNum.toString().padStart(2, '0')}`;
        }

        const newLote = {
            id: 'l_' + Date.now(),
            productId: existingProduct.id,
            code: loteCode,
            costPrice: costPrice,
            salePrice: salePrice,
            stock: stockQty,
            entryDate: new Date().toISOString().split('T')[0],
            supplier: supplier
        };

        RyRState.lotes.push(newLote);
        persistState();

        resetAgregarForm();
        showToast(`Lote ${loteCode} guardado exitosamente`, 'success');
        switchSection('inventario');
    };

    window.exportarDatosJSON = function() {
        const data = {
            products: RyRState.products,
            lotes: RyRState.lotes,
            sales: RyRState.sales
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_Granos_RyR_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('📥 Copia de seguridad exportada', 'success');
    };

    // ── EXPORTACIÓN EXCEL CONSOLIDADO (2 CUADROS EN 1 HOJA) ──
    window.exportarConsolidadoExcel = function() {
        if (typeof XLSX === 'undefined') {
            showToast('⚠️ Librería SheetJS no cargada. Recargue la página.', 'error');
            return;
        }

        const ws_data = [];
        const merges = [];

        // ─── ENCABEZADO PRINCIPAL ───
        // Fila 1: Título principal
        ws_data.push(['GRANOS RyR — REPORTE Y CONTROL DE OPERACIONES', '', '', '', '', '', '', '', '']);
        merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

        // Fila 2: Subtítulo
        ws_data.push(['Nutrición Animal | Sistema Consolidado de Inventario y Ventas', '', '', '', '', '', '', '', '']);
        merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 8 } });

        // Fila 3: Fecha de emisión
        const fechaEmision = new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
        ws_data.push(['📅 FECHA DE EMISIÓN DE ESTE REPORTE:', '', '', fechaEmision, '', '', '', '', '']);

        // Fila 4: Vacía
        ws_data.push([]);

        // ─── CUADRO 1: INVENTARIO ───
        // Fila 5: Título sección
        ws_data.push(['📦 1. ESTADO DE INVENTARIO Y STOCK ACTUAL', '', '', '', '', '', '', '', '']);
        merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 8 } });

        // Fila 6: Headers
        ws_data.push([
            'ID Producto', 'Producto / Grano', 'Categoría', 'Stock Total',
            'Costo Compra (Bs/Ql)', 'Precio Venta (Bs/Ql)', 'Ganancia Neta (Bs/Ql)',
            'Margen %', 'Estado'
        ]);

        // Filas de datos de inventario
        let totalStockInv = 0;
        RyRState.products.forEach(function(p, idx) {
            const lotes = RyRState.lotes.filter(function(l) { return l.productId === p.id; });
            const totalStock = lotes.reduce(function(sum, l) { return sum + l.stock; }, 0);
            const avgCost = lotes.length > 0 ? (lotes.reduce(function(s, l) { return s + l.costPrice; }, 0) / lotes.length) : 0;
            const avgSale = lotes.length > 0 ? (lotes.reduce(function(s, l) { return s + l.salePrice; }, 0) / lotes.length) : 0;
            const ganancia = avgSale - avgCost;
            const margen = avgCost > 0 ? ((ganancia / avgCost) * 100) : 0;
            const estado = totalStock > 20 ? 'En stock' : (totalStock > 0 ? 'Bajo stock' : 'Agotado');

            totalStockInv += totalStock;

            ws_data.push([
                'PROD-' + String(idx + 1).padStart(3, '0'),
                p.name,
                p.category,
                totalStock,
                Math.round(avgCost * 100) / 100,
                Math.round(avgSale * 100) / 100,
                Math.round(ganancia * 100) / 100,
                Math.round(margen * 10) / 10 + '%',
                estado
            ]);
        });

        // Fila de totales inventario
        const invTotalRowIdx = ws_data.length;
        ws_data.push(['', 'TOTAL STOCK DISPONIBLE', '', totalStockInv, '', '', '', '', '']);

        // 3 filas vacías de separación
        ws_data.push([]);
        ws_data.push([]);

        // ─── CUADRO 2: VENTAS ───
        const salesTitleRowIdx = ws_data.length;
        ws_data.push(['🛒 2. REGISTRO DETALLADO DE VENTAS', '', '', '', '', '', '', '', '', '', '', '']);
        merges.push({ s: { r: salesTitleRowIdx, c: 0 }, e: { r: salesTitleRowIdx, c: 11 } });

        // Headers ventas
        ws_data.push([
            'N° Comprobante', 'Fecha / Hora', 'Nombre Cliente', 'NIT / CI',
            'Teléfono / WhatsApp', 'Detalle de Productos', 'Método de Pago',
            'Placa Vehículo', 'Modelo Auto', 'Nombre Conductor',
            'Monto Total (Bs.)', 'Estado Venta'
        ]);

        // Filas de datos de ventas
        let totalIngresos = 0;
        RyRState.sales.forEach(function(s) {
            const fecha = s.timestamp ? new Date(s.timestamp).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : '';
            const detalle = s.items.map(function(item) {
                const prod = RyRState.products.find(function(p) { return p.id === item.productId; });
                return item.quantity + ' Ql. ' + (prod ? prod.name : 'Producto');
            }).join(', ');

            totalIngresos += s.totalAmount;

            ws_data.push([
                'REC-' + s.saleId,
                fecha,
                s.customerName || 'Cliente General',
                s.customerNit || 'S/N',
                s.customerPhone || 'S/N',
                detalle,
                s.paymentMethod || 'Efectivo',
                s.carPlaca || '---',
                s.carModel || '---',
                s.driverName || '---',
                Math.round(s.totalAmount * 100) / 100,
                'Completado'
            ]);
        });

        // Fila de totales ventas
        ws_data.push(['', '', 'TOTAL INGRESOS POR VENTAS', '', '', '', '', '', '', '', Math.round(totalIngresos * 100) / 100, '']);

        // ─── CREAR WORKBOOK ───
        var ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Aplicar merges
        ws['!merges'] = merges;

        // Anchos de columna
        ws['!cols'] = [
            { wch: 14 },  // A
            { wch: 26 },  // B
            { wch: 14 },  // C
            { wch: 14 },  // D
            { wch: 22 },  // E
            { wch: 22 },  // F
            { wch: 22 },  // G
            { wch: 18 },  // H: Margen / Placa
            { wch: 18 },  // I: Estado / Modelo
            { wch: 18 },  // J: Conductor
            { wch: 18 },  // K: Total
            { wch: 14 }   // L: Estado Venta
        ];

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte General');

        // Descargar
        XLSX.writeFile(wb, 'Granos_RyR_Reporte_Consolidado.xlsx');
        showToast('📊 Reporte Excel exportado exitosamente', 'success');
    };

    window.importarDatosJSON = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.products && data.lotes && data.sales) {
                    RyRState.products = data.products;
                    RyRState.lotes = data.lotes;
                    RyRState.sales = data.sales;
                    persistState();
                    renderActiveSection();
                    // Refresh charts after import
                    if (RyRState.activeSection === 'dashboard') {
                        renderDashboardCharts();
                    }
                    showToast('✔ Datos importados correctamente', 'success');
                } else {
                    showToast('⚠️ El archivo JSON no tiene la estructura correcta.', 'error');
                }
            } catch (err) {
                showToast('⚠️ Error al leer el archivo JSON.', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    window.handleQRUpload = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            localStorage.setItem('ryr_qr_image', dataUrl);
            updateQRPreview();
            showToast('Código QR actualizado correctamente', 'success');
        };
        reader.readAsDataURL(file);
    };

    function updateQRPreview() {
        const savedQR = localStorage.getItem('ryr_qr_image');
        const img = document.getElementById('qrPreviewImage');
        const placeholder = document.getElementById('qrPlaceholderText');
        
        if (img && placeholder) {
            if (savedQR) {
                img.src = savedQR;
                img.style.display = 'block';
                placeholder.style.display = 'none';
            } else {
                img.style.display = 'none';
                placeholder.style.display = 'block';
            }
        }
    }

    function updateBadges() {
        const lowStockCount = RyRState.lotes.filter(l => l.stock <= 20).length;
        const badge = document.getElementById('badge-lotes');
        if (badge) {
            badge.textContent = lowStockCount;
            badge.style.display = lowStockCount > 0 ? 'inline-block' : 'none';
        }
    }


    // INICIALIZACIÓN
    initTheme();
    seedInitialData();
    setupNavigation();
    initSplitTitle();
    updateQRPreview();
    renderActiveSection();

    // Margin preview function
    window.previewNewProductMargin = function() {
        const cost = parseFloat(document.getElementById('newCostPrice').value) || 0;
        const sale = parseFloat(document.getElementById('newSalePrice').value) || 0;
        const marginEl = document.getElementById('newMarginPreview');
        if (!marginEl) return;

        if (cost > 0 && sale > 0) {
            const margin = ((sale - cost) / cost * 100).toFixed(1);
            const profitPerUnit = (sale - cost).toFixed(2);
            const isPositive = parseFloat(margin) > 0;
            marginEl.innerHTML = `<span style="color:var(--text3);">Margen:</span> <span class="margin-value ${isPositive ? 'margin-positive' : 'margin-negative'}">${isPositive ? '+' : ''}${margin}%</span> <span style="color:var(--text3); margin-left:8px;">Ganancia/Ql:</span> <span class="margin-value ${isPositive ? 'margin-positive' : 'margin-negative'}">Bs. ${profitPerUnit}</span>`;
        } else {
            marginEl.innerHTML = '<span class="margin-value margin-neutral">Ingrese costo y precio de venta</span>';
        }
    };

    // Margin preview listeners
    const costInput = document.getElementById('newCostPrice');
    const saleInput = document.getElementById('newSalePrice');
    if (costInput) costInput.addEventListener('input', window.previewNewProductMargin);
    if (saleInput) saleInput.addEventListener('input', window.previewNewProductMargin);
});
