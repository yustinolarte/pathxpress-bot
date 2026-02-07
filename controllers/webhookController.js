const whatsappService = require('../services/whatsappService');
const routingService = require('../services/routingService');
const followUpService = require('../services/followUpService');

// Nota: En un sistema real, necesitaríamos persistencia (DB) para mapear 
// el número de teléfono del usuario con el order_id activo.
// Para este ejemplo, asumiremos que el order_id viene en el contexto o es el último activo.
// Como simplificación, enviaremos "Desconocida" si no tenemos contexto, o parsearemos si es posible.

/**
 * Valida el token del Webhook de Meta.
 * GET /webhook
 */
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('Webhook verificado exitosamente');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400); // Bad Request si faltan parámetros
    }
};

/**
 * Procesa los mensajes entrantes de WhatsApp.
 * POST /webhook
 */
const processWebhook = async (req, res) => {
    try {
        const body = req.body;

        // Comprobar si es un evento de WhatsApp
        if (body.object === 'whatsapp_business_account') {

            // Iterar sobre las entradas (pueden venir en lote)
            for (const entry of body.entry) {
                // Iterar sobre los cambios
                for (const change of entry.changes) {
                    if (change.value.messages) {
                        const message = change.value.messages[0];
                        const fromPhone = message.from;

                        // Filtrar por tipo 'location'
                        if (message.type === 'location') {
                            const { latitude, longitude } = message.location;
                            console.log(`Ubicación recibida de ${fromPhone}: ${latitude}, ${longitude}`);

                            // Acción A: Reenviar a número interno
                            // Asumimos Order ID desconocido poque el webhook no trae contexto de sesión en este punto
                            // En producción, buscaríamos en DB: `db.orders.find({ phone: fromPhone, status: 'pending_location' })`
                            const simulatedOrderId = 'PENDIENTE_ASIGNACION';

                            await whatsappService.sendInternalLocationForward(latitude, longitude, fromPhone, simulatedOrderId);

                            // Acción B: Enviar a API de optimización
                            await routingService.sendToOptimizationAPI(latitude, longitude, simulatedOrderId);
                        } else {
                            // Si envían texto, imagen, etc., respondemos que NO lo entendemos
                            console.log(`Mensaje recibido de tipo ${message.type}. Enviando advertencia de formato...`);
                            await whatsappService.sendInvalidFormatReply(fromPhone);
                        }
                    }
                }
            }

            // Siempre responder 200 OK a Meta para confirmar recepción
            res.sendStatus(200);
        } else {
            // Si no es un evento conocido
            res.sendStatus(404);
        }

    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.sendStatus(500);
    }
};

module.exports = {
    verifyWebhook,
    processWebhook
};
