// Almacén temporal en memoria para vincular Teléfonos <-> Órdenes
// Nota: Si el servidor se reinicia (Render free tier), esto se borra.
// Solución definitiva: Usar Base de Datos (MongoDB/MySQL).

const activeOrders = new Map();

/**
 * Guarda la asociación Teléfono -> OrderID
 */
const setOrder = (phone, orderId) => {
    // Normalizamos el teléfono (quitamos espacios, +, etc) por si acaso
    const cleanPhone = phone.replace(/\D/g, '');
    activeOrders.set(cleanPhone, orderId);
    console.log(`💾 Memoria: Teléfono ${cleanPhone} vinculado a Orden #${orderId}`);
};

/**
 * Recupera el OrderID dado un teléfono
 */
const getOrder = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return activeOrders.get(cleanPhone);
};

module.exports = {
    setOrder,
    getOrder
};
