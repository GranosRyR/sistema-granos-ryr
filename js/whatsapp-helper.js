/* ==========================================================================
   SISTEMA GRANOS RyR - INTEGRACIÓN DE WHATSAPP Y PREPARACIÓN BOT
   Gestor de envío de comprobantes por WhatsApp y webhooks para Bots
   ========================================================================== */

window.WhatsAppHelper = {
    /**
     * Formatea y limpia el número de teléfono para WhatsApp (+591 Bolivia por defecto si no lleva código)
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        let cleaned = phone.replace(/\D/g, ''); // Remover todo lo que no sea número
        
        // Si tiene 8 dígitos (típico de celular en Bolivia), anteponer código 591
        if (cleaned.length === 8) {
            cleaned = '591' + cleaned;
        }
        return cleaned;
    },

    /**
     * Genera el texto del mensaje estructurado de la venta para enviar por WhatsApp
     */
    buildSaleMessage(saleData) {
        const dateStr = new Date(saleData.timestamp || Date.now()).toLocaleDateString('es-BO');
        
        let message = `🌾 *SISTEMA GRANOS RyR* 🌾\n`;
        message += `===========================\n`;
        message += `📄 *Comprobante de Venta N°:* #${saleData.saleId || '1001'}\n`;
        message += `👤 *Cliente:* ${saleData.customerName || 'Cliente'}\n`;
        message += `📅 *Fecha:* ${dateStr}\n`;
        message += `💳 *Método de Pago:* ${saleData.paymentMethod || 'Efectivo'}\n\n`;
        
        message += `📦 *Detalle de Granos:*\n`;
        saleData.items.forEach(item => {
            message += `• ${item.quantity}x ${item.productName} (${item.unitType}) - Bs. ${(item.quantity * item.unitPrice).toFixed(2)}\n`;
        });
        
        message += `\n💵 *TOTAL A PAGAR:* Bs. ${parseFloat(saleData.totalAmount).toFixed(2)}\n`;
        message += `===========================\n`;
        message += `✨ ¡Gracias por confiar en Granos RyR! Guarda este mensaje como constancia de tu compra.\n`;
        
        return encodeURIComponent(message);
    },

    /**
     * Abre WhatsApp Web o App con el mensaje prellenado para el cliente
     */
    sendInvoiceToWhatsApp(phone, saleData) {
        const cleanPhone = this.formatPhoneNumber(phone);
        const encodedText = this.buildSaleMessage(saleData);
        
        if (!cleanPhone) {
            alert('⚠️ Por favor ingrese un número de teléfono de WhatsApp válido.');
            return false;
        }

        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
        window.open(url, '_blank');
        return true;
    },

    /**
     * Hook de preparación para Integración con Bot Automatizado (Webhooks/API externa en el futuro)
     */
    triggerAutomatedBotWebhook(saleData, pdfUrl = '') {
        console.log("🤖 [Bot WhatsApp RyR] Evento listo para webhook de bot automatizado:", {
            saleId: saleData.saleId,
            customerPhone: saleData.customerPhone,
            totalAmount: saleData.totalAmount,
            pdfUrl: pdfUrl
        });
    }
};
