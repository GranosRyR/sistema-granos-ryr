/* ==========================================================================
   SISTEMA GRANOS RyR - GENERADOR DE RECIBO EN TAMAÑO CARTA (WORD)
   Con logo más grande, recuadro de 'RECIBO' compacto y alineado a la derecha
   ========================================================================== */

window.PDFGenerator = {
    /**
     * Obtiene el elemento HTML del logo oficial más grande
     */
    getLogoImageHTML() {
        if (window.RyRLogoBase64) {
            return `<img src="${window.RyRLogoBase64}" alt="Granos RyR Logo" style="max-height: 115px; width: auto; object-fit: contain;" />`;
        }
        return `<img src="Granos RyR SIN FONDO.png" alt="Granos RyR Logo" style="max-height: 115px; width: auto; object-fit: contain;" />`;
    },

    numeroALetras(monto) {
        const entero = Math.floor(monto);
        const centavos = Math.round((monto - entero) * 100).toString().padStart(2, '0');

        const unidades = ['CERO', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        function convertirGrupo(n) {
            if (n === 0) return '';
            let res = '';
            const c = Math.floor(n / 100);
            const d = Math.floor((n % 100) / 10);
            const u = n % 10;

            if (c > 0) {
                res += (c === 1 && d === 0 && u === 0) ? 'CIEN' : centenas[c];
                if (d > 0 || u > 0) res += ' ';
            }

            if (d === 1) {
                res += especiales[u];
            } else {
                if (d > 1) {
                    res += (d === 2 && u > 0) ? 'VEINTI' : decenas[d];
                    if (d > 2 && u > 0) res += ' Y ';
                }
                if (u > 0) {
                    if (d > 1) {
                        if (d < 2) res += unidades[u];
                        else if (d === 2) res += unidades[u].toLowerCase();
                        else res += unidades[u].toLowerCase();
                    } else {
                        res += unidades[u];
                    }
                }
            }
            return res.trim();
        }

        if (entero === 0) return `Bs. 0.00 (CERO ${centavos}/100 BOLIVIANOS)`;

        const millones = Math.floor(entero / 1000000);
        const miles = Math.floor((entero % 1000000) / 1000);
        const resto = entero % 1000;

        let letras = '';
        if (millones > 0) {
            if (millones === 1) {
                letras += 'UN MILLÓN';
            } else {
                letras += convertirGrupo(millones) + ' MILLONES';
            }
            if (miles > 0 || resto > 0) letras += ' ';
        }
        if (miles > 0) {
            letras += (miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL');
            if (resto > 0) letras += ' ';
        }
        if (resto > 0) {
            letras += convertirGrupo(resto);
        }

        return `Bs. ${monto.toFixed(2)} (${letras.trim()} ${centavos}/100 BOLIVIANOS)`;
    },

    /**
     * Genera el comprobante con formato de Recibo en Tamaño Carta
     */
    generateReceiptHTML(saleData) {
        const items = saleData.items || [];
        const dateStr = new Date(saleData.timestamp || Date.now()).toLocaleString('es-BO');
        const logoHTML = this.getLogoImageHTML();
        const totalNum = parseFloat(saleData.totalAmount || 0);

        let rowsHTML = items.map((item, index) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 12px; text-align: center; color: #475569; font-size: 13px;">${index + 1}</td>
                <td style="padding: 10px 12px; font-size: 13px;">
                    <strong style="color: #0f172a; display: block;">${item.productName}</strong>
                    <span style="font-size: 11px; color: #64748b;">Lote de Origen: ${item.loteCode || 'N/A'} &middot; Presentación: ${item.unitType}</span>
                </td>
                <td style="padding: 10px 12px; text-align: center; font-size: 13px; font-weight: 600; color: #0f172a;">${item.quantity}</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #334155;">Bs. ${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">Bs. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <div id="printableReceiptArea" class="word-document-letter" style="font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #0f172a; padding: 35px 40px; border-radius: 4px; border: 1px solid #cbd5e1; max-width: 800px; margin: 0 auto; box-sizing: border-box;">
                
                <!-- 1. ENCABEZADO MEMBRETADO: LOGO MÁS GRANDE Y RECUADRO 'RECIBO' COMPACTO A LA DERECHA -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #b45309; padding-bottom: 18px; margin-bottom: 22px;">
                    <!-- Logo Aumentado de Tamaño -->
                    <div style="flex: 0 0 220px; text-align: left;">
                        ${logoHTML}
                    </div>
                    
                    <!-- Datos de la Empresa -->
                    <div style="flex: 1; padding: 0 10px; text-align: center;">
                        <h1 style="margin: 0; color: #b45309; font-size: 26px; font-weight: 900; letter-spacing: 1px; font-family: 'Space Grotesk', sans-serif;">GRANOS RyR</h1>
                        <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase;">COMERCIALIZADORA & NUTRICIÓN ANIMAL</p>
                        <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569;">Venta de Soya, Sorgo, Maíz, Cascarilla de Soya y Soya Molida</p>
                        <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">NIT: 10293847501 &middot; Tel/WhatsApp: +591 70000000 &middot; Santa Cruz - Bolivia</p>
                    </div>

                    <!-- Recuadro 'RECIBO' Más Pequeño y Pegado al Borde Derecho -->
                    <div style="flex: 0 0 135px; background: #f8fafc; border: 1.5px solid #b45309; border-radius: 6px; padding: 8px 6px; text-align: center; margin-left: auto;">
                        <div style="font-size: 11px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">RECIBO</div>
                        <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 3px 0;">N° #${saleData.saleId || '1001'}</div>
                        <div style="font-size: 9px; color: #64748b; font-weight: 600;">ORIGINAL CLIENTE</div>
                    </div>
                </div>

                <!-- 2. DATOS DEL CLIENTE Y DOCUMENTO -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
                    <div>
                        <p style="margin: 0 0 6px 0;"><strong>SEÑOR(ES):</strong> <span style="color: #0f172a;">${saleData.customerName || 'Cliente General'}</span></p>
                        <p style="margin: 0;"><strong>NIT / CI:</strong> <span style="color: #0f172a;">${saleData.customerNit || 'S/N'}</span></p>
                    </div>
                    <div>
                        <p style="margin: 0 0 6px 0;"><strong>FECHA Y HORA:</strong> <span style="color: #0f172a;">${dateStr}</span></p>
                        <p style="margin: 0;"><strong>FORMA DE PAGO:</strong> <span style="color: #b45309; font-weight: bold;">${saleData.paymentMethod || 'Efectivo'}</span></p>
                    </div>
                </div>

                <!-- 3. TABLA FORMAL DE PRODUCTOS -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <th style="padding: 10px; text-align: center; width: 6%;">N°</th>
                            <th style="padding: 10px; text-align: left;">DESCRIPCIÓN DE GRANOS / LOTE</th>
                            <th style="padding: 10px; text-align: center; width: 15%;">CANTIDAD</th>
                            <th style="padding: 10px; text-align: right; width: 18%;">P. UNITARIO</th>
                            <th style="padding: 10px; text-align: right; width: 20%;">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>

                <!-- 4. TOTALES Y MONTO EN LETRAS -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px; gap: 20px;">
                    <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 12px;">
                        <p style="margin: 0; color: #475569;"><strong>IMPORTE TOTAL:</strong></p>
                        <p style="margin: 4px 0 0 0; font-weight: 700; color: #0f172a;">${this.numeroALetras(totalNum)}</p>
                    </div>

                    <div style="flex: 0 0 240px; background: #ffffff; border: 2px solid #0f172a; border-radius: 8px; padding: 14px; text-align: right;">
                        <div style="font-size: 12px; color: #475569; font-weight: 600;">TOTAL COBRADO</div>
                        <div style="font-size: 24px; font-weight: 900; color: #b45309; margin-top: 4px; font-family: 'Space Grotesk', sans-serif;">Bs. ${totalNum.toFixed(2)}</div>
                    </div>
                </div>

                <!-- 5. FIRMAS DE CONFORMIDAD -->
                <div style="display: flex; justify-content: space-around; margin-top: 60px; padding-top: 10px; text-align: center; font-size: 12px; color: #475569;">
                    <div style="width: 220px; border-top: 1px solid #94a3b8; padding-top: 8px;">
                        <strong>ENTREGADO POR</strong><br>
                        <span>Granos RyR Nutrición Animal</span>
                    </div>
                    <div style="width: 220px; border-top: 1px solid #94a3b8; padding-top: 8px;">
                        <strong>RECIBÍ CONFORME</strong><br>
                        <span>Firma / Sello Cliente</span>
                    </div>
                </div>

                <!-- Pie Legal Documento Word -->
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    Documento emitido por el Sistema Granos RyR &middot; Recibo Oficial Tamaño Carta
                </div>
            </div>
        `;
    },

    printReceipt() {
        window.print();
    },

    downloadPDF(saleData) {
        const element = document.getElementById('printableReceiptArea');
        if (!element) return;
        
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin:       [0.3, 0.3, 0.3, 0.3],
                filename:     `Recibo_Carta_RyR_${saleData.saleId || '1001'}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2.5, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        } else {
            window.print();
        }
    }
};
