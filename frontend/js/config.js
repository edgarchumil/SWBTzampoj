// Definir config como variable global para que sea accesible desde otros archivos
var config = {
    // Determinar si estamos en producción o desarrollo
    apiUrl: window.location.hostname.includes('render.com') || window.location.hostname === 'sistemawebparroquia-frontend.onrender.com'
        ? 'https://sistemawebparroquia-backend.onrender.com/api'
        : 'http://localhost:8080/api',
    endpoints: {
        bautismos: '/bautismos',
        bautismosCount: '/bautismo/count',
        comuniones: '/comunion/total',
        confirmaciones: '/confirmacion/total',
        matrimonios: '/matrimonio/total',
        auth: '/auth/login'
    }
};

// Función para obtener la URL completa de un endpoint
function getApiUrl(endpoint) {
    return config.apiUrl + config.endpoints[endpoint];
}

// Función para verificar el estado de la conexión
async function checkServerConnection() {
    try {
        const response = await fetch(config.apiUrl + '/health');
        return response.ok;
    } catch (error) {
        console.error('Error de conexión:', error);
        return false;
    }
}

// Función para obtener el token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Función para verificar si el token es válido
function isValidToken() {
    const token = getAuthToken();
    return token && token.length > 0;
}