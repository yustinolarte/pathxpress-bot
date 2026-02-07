const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Rutas
app.use('/', apiRoutes); // Montamos las rutas en la raíz

// Health Check
app.get('/', (req, res) => {
    res.send('Servidor de Automatización Logística Activo 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Webhook URL para Meta: {TUNNEL_URL}/webhook`);
});
