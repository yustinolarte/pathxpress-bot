const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const webhookController = require('../controllers/webhookController');

// Ruta para recibir nuevas órdenes (Trigger)
router.post('/new-order', orderController.createOrder);

// Rutas para el Webhook de WhatsApp
router.get('/webhook', webhookController.verifyWebhook);   // Verificación
router.post('/webhook', webhookController.processWebhook); // Recepción de mensajes

module.exports = router;
