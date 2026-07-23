/* ==========================================================================
   SISTEMA GRANOS RyR - POS CONTROLLER
   Módulo encargado del comportamiento de la caja registradora, carrito y cobro
   ========================================================================== */

window.renderPOS = function() {
    const pSelect = document.getElementById('posProductSelect');
    if (!pSelect) return;

    pSelect.innerHTML = `<option value="">-- Seleccionar --</option>` + window.RyRState.products.map(p => `
        <option value="${p.id}">${p.name} (${p.category})</option>
    `).join('');

    window.renderPOSCart();
};

window.onPOSProductChange = function() {
    const pId = document.getElementById('posProductSelect').value;
    const loteSelect = document.getElementById('posLoteSelect');
    const unitPriceInput = document.getElementById('posUnitPrice');

    if (!pId) {
        loteSelect.innerHTML = `<option value="">-- Seleccionar Lote --</option>`;
        unitPriceInput.value = '';
        return;
    }

    const lotes = window.RyRState.lotes.filter(l => l.productId === pId && l.stock > 0);
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
    const lote = window.RyRState.lotes.find(l => l.id === loteId);
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
        window.showToast('⚠️ Complete los campos requeridos.', 'warning');
        return;
    }

    const product = window.RyRState.products.find(p => p.id === pId);
    const lote = window.RyRState.lotes.find(l => l.id === loteId);

    if (!lote) {
        window.showToast('⚠️ Error de sistema: El lote seleccionado no existe.', 'error');
        return;
    }

    if (unitPrice < lote.costPrice) {
        window.showToast(`⚠️ Error: El precio (Bs. ${unitPrice}) no puede ser menor al costo (Bs. ${lote.costPrice}).`, 'error');
        return;
    }

    const stockComprometido = window.RyRState.currentCart
        .filter(item => item.loteId === lote.id)
        .reduce((sum, item) => sum + item.quantity, 0);

    const stockDisponibleReal = lote.stock - stockComprometido;

    if (qty > stockDisponibleReal) {
        window.showToast(`⚠️ Stock insuficiente. Disponibles: ${stockDisponibleReal} Ql. (Ya hay ${stockComprometido} en carrito).`, 'error');
        return;
    }

    window.RyRState.currentCart.push({
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

    window.showToast(`✔ ${product.name} agregado al carrito`, 'success');
    window.renderPOSCart();
};

window.renderPOSCart = function() {
    const body = document.getElementById('posCartTableBody');
    const totalEl = document.getElementById('posCartTotalAmount');
    if (!body) return;

    if (window.RyRState.currentCart.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text3); padding: 12px;">Carrito vacío</td></tr>`;
        if (totalEl) totalEl.textContent = 'Bs. 0.00';
        return;
    }

    let total = 0;
    body.innerHTML = window.RyRState.currentCart.map((item, index) => {
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
};

window.removePosItem = function(index) {
    window.RyRState.currentCart.splice(index, 1);
    window.renderPOSCart();
};

window.processSale = function(sendWhatsApp = false) {
    if (window.RyRState.currentCart.length === 0) {
        window.showToast('⚠️ Agregue productos antes de cobrar.', 'warning');
        return;
    }

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
        const driverCi = document.getElementById('posDriverCi').value.trim();

        if (sendWhatsApp && !customerPhone) {
            window.showToast('⚠️ Ingrese el número de WhatsApp del cliente.', 'warning');
            return;
        }

        const loteRestants = {};
        for (let item of window.RyRState.currentCart) {
            loteRestants[item.loteId] = (loteRestants[item.loteId] || 0) + item.quantity;
        }
        
        for (let lId in loteRestants) {
            const lote = window.RyRState.lotes.find(l => l.id === lId);
            if (!lote || lote.stock < loteRestants[lId]) {
                throw new Error(`Stock inconsistente para el Lote ${lote ? lote.code : 'Desconocido'}. Recargue la página.`);
            }
        }

        const totalAmount = window.RyRState.currentCart.reduce((sum, i) => sum + i.subtotal, 0);
        const totalCost = window.RyRState.currentCart.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0);
        const netProfit = totalAmount - totalCost;

        const saleId = (1000 + window.RyRState.sales.length + 1).toString();
        const saleData = {
            saleId: saleId,
            customerName: customerName,
            customerNit: customerNit,
            customerPhone: customerPhone,
            paymentMethod: paymentMethod,
            carPlaca: carPlaca,
            carModel: carModel,
            driverName: driverName,
            driverCi: driverCi,
            items: [...window.RyRState.currentCart],
            totalAmount: totalAmount,
            totalCost: totalCost,
            netProfit: netProfit,
            timestamp: new Date().toISOString()
        };

        window.RyRState.currentCart.forEach(cartItem => {
            const lote = window.RyRState.lotes.find(l => l.id === cartItem.loteId);
            if (lote) {
                lote.stock -= cartItem.quantity;
            }
        });

        window.RyRState.sales.push(saleData);
        window.persistState();

        window.showToast(`🎉 Venta #${saleId} registrada con éxito`, 'success');
        window.showReceiptModal(saleData, sendWhatsApp);

        window.RyRState.currentCart = [];
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
        document.getElementById('posDriverCi').value = '';
        window.renderPOSCart();

        if (window.RyRState.activeSection === 'dashboard') {
            window.renderDashboard();
        }
    } catch (err) {
        window.showToast(err.message, 'error');
        console.error("Transacción abortada: ", err);
    } finally {
        btnsPos.forEach(btn => btn.style.pointerEvents = 'auto');
    }
};

window.showReceiptModal = function(saleData, triggerWhatsApp = false) {
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
