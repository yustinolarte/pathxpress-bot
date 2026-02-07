const whatsappService = require('../services/whatsappService');
const followUpService = require('../services/followUpService');
const orderStateService = require('../services/orderStateService');

/**
 * Maneja la creación de una nueva orden.
 * Trigger: POST /new-order
 */
const createOrder = async (req, res) => {
    try {
        const { customer_name, phone_number, order_id } = req.body;

        if (!customer_name || !phone_number || !order_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos (customer_name, phone_number, order_id)' });
        }

        // GUARDAR EN MEMORIA: Vinculamos el teléfono con la orden
        orderStateService.setOrder(phone_number, order_id);

        // Lógica de negocio: Enviar mensaje de solicitud de ubicación
        const whatsappResult = await whatsappService.sendLocationRequest(customer_name, phone_number, order_id);

        if (!whatsappResult.success) {
            return res.status(500).json({
                error: 'Error al enviar mensaje de WhatsApp',
                details: whatsappResult.error
            });
        }

        // Iniciamos el seguimiento (Timers de recordatorio y alerta)
        followUpService.startFollowUp(order_id, customer_name, phone_number);

        // Opcional: Guardar en base de datos local el estado "Esperando Ubicación" para este order_id
        // Para este MVP, asumiremos que el flujo es síncrono o stateless

        res.status(200).json({
            message: 'Orden recibida y solicitud de ubicación enviada',
            order_id: order_id,
            whatsapp_response: whatsappResult.data
        });

    } catch (error) {
        console.error('Error en createOrder:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    createOrder
};
