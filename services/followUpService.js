const whatsappService = require('./whatsappService');

// Almacén en memoria para los timers de seguimiento (Solo para MVP)
// En producción, usar BullMQ + Redis
const followUpTimers = new Map();

// Configuraciones de tiempo (en milisegundos)
const FIRST_REMINDER_DELAY = 30 * 60 * 1000; // 30 minutos
const ESCALATION_DELAY = 60 * 60 * 1000;     // 60 minutos (1 hora)

/**
 * Inicia el proceso de seguimiento para una orden.
 */
const startFollowUp = (orderId, customerName, phoneNumber) => {
    console.log(`⏱️ Iniciando seguimiento para Orden #${orderId}`);

    // Timer 1: Recordatorio al Cliente (30 min)
    const reminderTimer = setTimeout(async () => {
        console.log(`⏰ Ejecutando recordatorio para Orden #${orderId}`);
        const message = `⏳ Hello again ${customerName}, we are still waiting for your **Location Pin** for Order #${orderId}.\n\nPlease share it so we can proceed with delivery. 🚚`;
        await whatsappService.sendTextMessage(phoneNumber, message);
    }, FIRST_REMINDER_DELAY);

    // Timer 2: Escalada al Admin (60 min)
    const escalationTimer = setTimeout(async () => {
        console.log(`🚨 Escalando Orden #${orderId} a soporte manual`);
        const adminNumber = process.env.INTERNAL_CONTROL_NUMBER;
        const alertMessage = `⚠️ *ALERTA DE PEDIDO TRABADO*\n\nOrden #${orderId} de ${customerName} (${phoneNumber}).\n\nEl cliente NO ha enviado su ubicación después de 1 hora.\n\n👉 Por favor contactar manualmente.`;
        await whatsappService.sendTextMessage(adminNumber, alertMessage);

        // Limpiamos los timers del mapa una vez completado el flujo
        stopFollowUp(orderId);
    }, ESCALATION_DELAY);

    // Guardamos los timers para poder cancelarlos si el cliente responde antes
    followUpTimers.set(orderId, { reminder: reminderTimer, escalation: escalationTimer });
};

/**
 * Detiene el seguimiento (cuando el cliente ya respondió).
 */
const stopFollowUp = (orderId) => {
    if (followUpTimers.has(orderId)) {
        const timers = followUpTimers.get(orderId);
        clearTimeout(timers.reminder);
        clearTimeout(timers.escalation);
        followUpTimers.delete(orderId);
        console.log(`✅ Seguimiento detenido para Orden #${orderId} (Cliente respondió)`);
    }
};

module.exports = {
    startFollowUp,
    stopFollowUp
};
