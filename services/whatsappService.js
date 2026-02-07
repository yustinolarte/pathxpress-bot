const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
const TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Envía un mensaje de texto simple.
 */
const sendTextMessage = async (to, body) => {
    try {
        const response = await axios.post(WHATSAPP_API_URL, {
            messaging_product: 'whatsapp',
            to: to,
            text: { body: body }
        }, {
            headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
        });
        console.log(`Mensaje enviado a ${to}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error enviando mensaje:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response ? error.response.data : error.message };
    }
};

/**
 * Envía un mensaje de plantilla (Template) para iniciar conversación (Business-Initiated).
 */
const sendTemplateMessage = async (to, templateName, languageCode, components) => {
    try {
        const response = await axios.post(WHATSAPP_API_URL, {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: components
            }
        }, {
            headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
        });
        console.log(`Plantilla '${templateName}' enviada a ${to}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error enviando plantilla:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response ? error.response.data : error.message };
    }
};

/**
 * Envía una solicitud de ubicación al cliente.
 */
const sendLocationRequest = async (customerName, phoneNumber, orderId) => {
    // Intentamos usar Plantilla (Business-Initiated) si está configurada
    const templateName = 'order_location_request'; // NOMBRE EXACTO PARA CREAR EN META

    // Componentes para llenar variables {{1}} y {{2}}
    const components = [
        {
            type: 'body',
            parameters: [
                { type: 'text', text: customerName }, // {{1}}
                { type: 'text', text: orderId }       // {{2}}
            ]
        }
    ];

    const result = await sendTemplateMessage(phoneNumber, templateName, 'en_US', components);

    // Si falla la plantilla (ej: no creada aún), fallback a texto simple (solo funciona si hay ventana 24h)
    if (!result.success) {
        console.warn('⚠️ Falló el envío de plantilla, intentando texto plano (Fallback)...');
        const supportNumber = process.env.SUPPORT_NUMBER || process.env.INTERNAL_CONTROL_NUMBER;
        const message = `👋 Hello ${customerName}, Order #${orderId} confirmed!\n\n📍 *ACTION REQUIRED:*\nPlease share your **Current Location Pin** using the WhatsApp attachment (📎) -> Location button.\n\n⚠️ *IMPORTANT:*\n- Do NOT send written addresses.\n- Do NOT send photos of maps.\n- This bot **ONLY** reads Location Pins.\n\n📞 For support or changes, please contact: ${supportNumber}`;
        return await sendTextMessage(phoneNumber, message);
    }

    return result;
};

/**
 * Reenvía la ubicación recibida al número de control interno.
 */
const sendInternalLocationForward = async (lat, long, senderPhone, orderId) => {
    const internalNumber = process.env.INTERNAL_CONTROL_NUMBER;
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${long}`;

    // Construimos un mensaje con los detalles
    const body = `📍 Ubicación recibida del cliente (${senderPhone}) para Orden #${orderId || 'Desconocida'}\nLink: ${googleMapsLink}\nLat: ${lat}, Long: ${long}`;

    await sendTextMessage(internalNumber, body);
};

/**
 * Envía un mensaje de error cuando el formato no es válido (texto o imagen).
 */
const sendInvalidFormatReply = async (phoneNumber) => {
    const supportNumber = process.env.SUPPORT_NUMBER || process.env.INTERNAL_CONTROL_NUMBER;
    const message = `❌ *Invalid Format*\n\nI am an automated bot and I can ONLY read **Location Pins** (📍).\n\nPlease click the (📎) button and select **"Location"**.\n\n📞 If you need to send a specific address or photo, please contact support manually at: ${supportNumber}`;
    return await sendTextMessage(phoneNumber, message);
};

module.exports = {
    sendTextMessage,
    sendLocationRequest,
    sendInternalLocationForward,
    sendInvalidFormatReply
};
