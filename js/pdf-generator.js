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
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 16px; text-align: center; color: #64748b; font-size: 13px;">${index + 1}</td>
                <td style="padding: 12px 16px; font-size: 13px;">
                    <strong style="color: #1e293b; font-weight: 600; display: block; margin-bottom: 2px;">${item.productName}</strong>
                    <span style="font-size: 11.5px; color: #64748b;">Lote: ${item.loteCode || 'N/A'} &middot; Unit: ${item.unitType}</span>
                </td>
                <td style="padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 600; color: #334155;">${item.quantity}</td>
                <td style="padding: 12px 16px; text-align: right; font-size: 13px; color: #475569;">Bs. ${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td style="padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 700; color: #0f172a;">Bs. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <div id="printableReceiptArea" class="word-document-letter" style="font-family: 'Space Grotesk', 'Plus Jakarta Sans', Arial, sans-serif; background: #ffffff; color: #0f172a; padding: 45px 50px; border-radius: 8px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; box-sizing: border-box;">
                
                <!-- 1. HEADER -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                    <!-- Logo & Brand -->
                    <div style="display: flex; align-items: center;">
                        <div>
                            ${logoHTML}
                        </div>
                    </div>
                    
                    <!-- Invoice Details -->
                    <div style="text-align: right;">
                        <div style="font-size: 26px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">RECIBO</div>
                        <div style="font-size: 14px; color: #334155; font-weight: 600;">N° <span style="color: #0f172a;">#${saleData.saleId || '1001'}</span></div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Original Cliente</div>
                    </div>
                </div>

                <!-- 2. BILLING & COMPANY INFO -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
                    <!-- Billed To -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 3px solid #0f172a;">
                        <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Recibo a</h3>
                        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${saleData.customerName || 'Cliente General'}</p>
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;"><strong>NIT/CI:</strong> ${saleData.customerNit || 'S/N'}</p>
                        <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Método:</strong> <span style="display: inline-block; padding: 2px 8px; background: #e2e8f0; border-radius: 4px; font-size: 11px; font-weight: 600; color: #1e293b; margin-left: 4px;">${saleData.paymentMethod || 'Efectivo'}</span></p>
                    </div>

                    <!-- Company Info -->
                    <div style="padding: 20px 0; text-align: right; font-size: 13px; color: #475569; line-height: 1.6;">
                        <p style="margin: 0;"><strong>NIT:</strong> 10293847501</p>
                        <p style="margin: 0;"><strong>WhatsApp:</strong> +591 70000000</p>
                        <p style="margin: 0;">Santa Cruz - Bolivia</p>
                        <p style="margin: 8px 0 0 0; color: #0f172a; font-weight: 600;">Fecha: ${dateStr.split(',')[0]}</p>
                    </div>
                </div>

                ${(saleData.carPlaca || saleData.driverName || saleData.carModel) ? `
                <!-- 3. SHIPPING / TRANSPORT -->
                <div style="margin-bottom: 30px; padding: 16px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 24px;">🚛</div>
                    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                        <p style="margin: 0; color: #475569;"><strong>Placa/Modelo:</strong> <span style="color: #0f172a; font-weight: 500;">${saleData.carPlaca || 'S/P'} - ${saleData.carModel || 'S/M'}</span></p>
                        <p style="margin: 0; color: #475569;"><strong>Conductor:</strong> <span style="color: #0f172a; font-weight: 500;">${saleData.driverName || 'No registrado'} ${saleData.driverCi ? `(CI: ${saleData.driverCi})` : ''}</span></p>
                    </div>
                </div>
                ` : ''}

                <!-- 4. ITEMS TABLE -->
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                <th style="padding: 14px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; width: 6%;">N°</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Descripción</th>
                                <th style="padding: 14px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; width: 12%;">Cant</th>
                                <th style="padding: 14px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; width: 18%;">Precio</th>
                                <th style="padding: 14px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; width: 22%;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- 5. TOTALS -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 50px;">
                    <div style="flex: 1; max-width: 60%;">
                        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Son:</p>
                        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e293b; background: #f8fafc; padding: 10px 14px; border-radius: 6px; display: inline-block;">${this.numeroALetras(totalNum)}</p>
                    </div>

                    <div style="width: 250px; background: #0f172a; color: white; padding: 20px; border-radius: 12px; text-align: right; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);">
                        <div style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Total a Pagar</div>
                        <div style="font-size: 28px; font-weight: 800;">Bs. ${totalNum.toFixed(2)}</div>
                    </div>
                </div>

                <!-- 6. SIGNATURES -->
                <div style="display: flex; justify-content: space-between; margin-top: 80px; padding: 0 40px;">
                    <div style="width: 200px; text-align: center;">
                        <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-bottom: 4px;">
                            <strong style="font-size: 13px; color: #0f172a;">Entregado por</strong>
                        </div>
                        <span style="font-size: 11px; color: #64748b;">Granos RyR</span>
                    </div>
                    <div style="width: 200px; text-align: center;">
                        <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-bottom: 4px;">
                            <strong style="font-size: 13px; color: #0f172a;">Recibí Conforme</strong>
                        </div>
                        <span style="font-size: 11px; color: #64748b;">Firma / Sello Cliente</span>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 50px; text-align: center; font-size: 10.5px; color: #94a3b8; padding-top: 16px;">
                    Documento generado por <strong>Sistema Granos RyR</strong> &middot; ¡Gracias por su preferencia!
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
