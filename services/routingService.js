const axios = require('axios');

const OPTIMIZATION_API_URL = 'https://api.routeapp.com/v1/add-stop';

/**
 * Envía las coordenadas y el ID de la orden a la API externa de optimización.
 */
const sendToOptimizationAPI = async (lat, long, orderId) => {
    try {
        // Simulando la llamada a la API externa
        // En un escenario real, descomentar la llamada axios y manejar autenticación si es necesario

        console.log(`[SIMULACIÓN] Enviando datos a RouteApp: Lat: ${lat}, Long: ${long}, OrderID: ${orderId}`);

        /* 
        const response = await axios.post(OPTIMIZATION_API_URL, {
            latitude: lat,
            longitude: long,
            order_id: orderId,
            action: 'delivery'
        });
        return response.data;
        */

        return { success: true, message: "Datos enviados correctamente (Simulado)" };

    } catch (error) {
        console.error('Error al enviar a API de optimización:', error.message);
        // No lanzamos el error para no detener el flujo principal, solo lo logueamos
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendToOptimizationAPI
};
