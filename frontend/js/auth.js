// Este archivo está obsoleto y ha sido reemplazado por auth-utils.js
// Se mantiene por compatibilidad con versiones anteriores

// Redirigir a las funciones en auth-utils.js para evitar duplicación
function verificarSesion() {
    // Usar la función de auth-utils.js si está disponible
    if (typeof window.verificarSesion === 'function') {
        return window.verificarSesion();
    }
    
    // Implementación de respaldo por si auth-utils.js no está cargado
    const token = localStorage.getItem('token');
    if (!token) return false;
    return true;
}

function actualizarActividad() {
    // No hacer nada, esta funcionalidad ahora está en auth-utils.js
    // Evitar duplicar listeners de eventos
}

function cerrarSesion() {
    // Usar la función de auth-utils.js si está disponible
    if (typeof window.cerrarSesion === 'function') {
        window.cerrarSesion();
        return;
    }
    
    // Implementación de respaldo
    localStorage.clear();
    window.location.href = 'index.html';
}

// No agregar listeners duplicados
// Los listeners ahora se manejan en auth-utils.js