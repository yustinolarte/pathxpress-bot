require('dotenv').config();
const axios = require('axios');

const PORT = process.env.PORT || 3000;
// Usamos el número de control interno como el "cliente" para la prueba,
// así el mensaje te llega a TI mismo.
const MY_NUMBER = process.env.INTERNAL_CONTROL_NUMBER;

if (!MY_NUMBER) {
    console.error("❌ Error: No encontré INTERNAL_CONTROL_NUMBER en el archivo .env");
    console.error("Por favor, asegúrate de haber configurado tu número en el .env");
    process.exit(1);
}

const testOrder = {
    customer_name: "Steve (Tester)",
    phone_number: MY_NUMBER,
    order_id: "DEMO-" + Math.floor(Math.random() * 1000)
};

console.log(`📡 Enviando orden de prueba a http://localhost:${PORT}/new-order...`);
console.log(`📋 Datos de la orden simulada:`, testOrder);

axios.post(`http://localhost:${PORT}/new-order`, testOrder)
    .then(response => {
        console.log("\n✅ ¡Éxito! Respuesta del servidor:");
        console.log(response.data);
        console.log("\n📱 Revisa tu WhatsApp. Deberías recibir un mensaje pidiendo tu ubicación.");
        console.log("   (Si no llega, revisa que el TOKEN de WhatsApp en .env sea válido y el número esté verificado si estás en modo desarrollo).");
    })
    .catch(error => {
        console.error("\n❌ Error al conectar con el servidor:");
        if (error.code === 'ECONNREFUSED') {
            console.error("   Parece que el servidor NO está corriendo.");
            console.error("   Ejecuta 'node server.js' en otra terminal primero.");
        } else {
            console.error(error.response ? error.response.data : error.message);
        }
    });
