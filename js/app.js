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
        if (currentActive) {
            currentActive.classList.add('exiting');
            setTimeout(() => {
                currentActive.classList.remove('active', 'exiting');
                currentActive.style.display = 'none';
            }, 180);
        }

        RyRState.activeSection = sectionName;

        setTimeout(() => {
            const target = document.getElementById(`section-${sectionName}`);
            if (target) {
                target.style.display = 'block';
                target.classList.add('active');
            }

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(i => {
                if (i.getAttribute('data-section') === sectionName) {
                    i.classList.add('active');
                } else {
                    i.classList.remove('active');
                }
            });

            renderActiveSection();
        }, 180);
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
    }

    function renderInventario() {
        const body = document.getElementById('invTableBody');
        if (!body) return;

        body.innerHTML = RyRState.products.map(p => {
            const lotes = RyRState.lotes.filter(l => l.productId === p.id);
            const totalStock = lotes.reduce((sum, l) => sum + l.stock, 0);
            const prices = lotes.map(l => l.salePrice);
            const priceStr = prices.length ? `Bs. ${Math.min(...prices)} - ${Math.max(...prices)}` : 'Sin Lote';

            const statusBadge = totalStock > 20 
                ? `<span class="badge badge-ok">En stock</span>`
                : (totalStock > 0 ? `<span class="badge badge-bajo">Stock bajo</span>` : `<span class="badge badge-agotado">Agotado</span>`);

            return `
                <tr class="inventory-row">
                    <td><strong>${p.name}</strong></td>
                    <td><span class="badge badge-gold">${p.category}</span></td>
                    <td>${p.defaultUnit}</td>
                    <td>${lotes.length} Lote(s)</td>
                    <td><strong>${totalStock} Ql.</strong></td>
                    <td><strong style="color: var(--green);">${priceStr}</strong></td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

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

        if (qty > lote.stock) {
            showToast(`⚠️ Stock insuficiente. Disponibles: ${lote.stock} Ql.`, 'error');
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

        showToast(`✔ ${product.name} agregado`, 'success');
        renderPOSCart();
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

        const customerName = document.getElementById('posCustomerName').value.trim() || 'Cliente General';
        const customerNit = document.getElementById('posCustomerNit').value.trim() || 'S/N';
        const customerPhone = document.getElementById('posCustomerPhone').value.trim();
        const paymentMethod = document.getElementById('posPaymentMethod').value;

        if (sendWhatsApp && !customerPhone) {
            showToast('⚠️ Ingrese el número de WhatsApp del cliente.', 'warning');
            return;
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
            items: [...RyRState.currentCart],
            totalAmount: totalAmount,
            totalCost: totalCost,
            netProfit: netProfit,
            timestamp: new Date().toISOString()
        };

        // Descontar Stock
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
        renderPOSCart();
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

    window.saveNewProductOrLote = function() {
        const grainName = document.getElementById('newGrainName').value.trim();
        const category = document.getElementById('newGrainCategory').value;
        const loteCode = document.getElementById('newLoteCode').value.trim() || `LOTE-${Date.now().toString().slice(-4)}`;
        const costPrice = parseFloat(document.getElementById('newCostPrice').value);
        const salePrice = parseFloat(document.getElementById('newSalePrice').value);
        const stockQty = parseFloat(document.getElementById('newStockQty').value);
        const supplier = document.getElementById('newSupplier').value.trim() || 'Proveedor General';

        if (!grainName || isNaN(costPrice) || isNaN(salePrice) || isNaN(stockQty)) {
            showToast('⚠️ Complete los campos requeridos.', 'warning');
            return;
        }

        let existingProduct = RyRState.products.find(p => p.name.toLowerCase() === grainName.toLowerCase());

        if (!existingProduct) {
            existingProduct = {
                id: 'p_' + Date.now(),
                name: grainName,
                category: category,
                defaultUnit: 'Quintal (46 kg)',
                totalStock: 0
            };
            RyRState.products.push(existingProduct);
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

        showToast(`✅ Lote ${loteCode} guardado exitosamente`, 'success');
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
                    showToast('✔ Datos importados correctamente', 'success');
                } else {
                    showToast('⚠️ El archivo JSON no tiene la estructura correcta.', 'error');
                }
            } catch (err) {
                showToast('⚠️ Error al leer el archivo JSON.', 'error');
            }
        };
        reader.readAsText(file);
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
});
