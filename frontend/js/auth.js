function verificarSesion() {
    const token = localStorage.getItem('token');
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const tiempoInactivo = new Date().getTime() - lastActivity;
    
    // Verificar token y tiempo de inactividad (30 minutos)
    if (!token || tiempoInactivo > 30 * 60 * 1000) {
        cerrarSesion();
        return false;
    }

    // Actualizar tiempo de actividad
    actualizarActividad();
    return true;
}

function actualizarActividad() {
    localStorage.setItem('lastActivity', new Date().getTime());
}

function cerrarSesion() {
    try {
        // Limpiar datos de sesión
        localStorage.clear();
        // Redirigir al login
        window.location.replace('index.html');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Agregar listeners para actividad
document.addEventListener('click', actualizarActividad);
document.addEventListener('keypress', actualizarActividad);
document.addEventListener('mousemove', actualizarActividad);