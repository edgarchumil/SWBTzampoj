/**
 * Utilidades de autenticación para el Sistema Parroquial
 * Este archivo centraliza todas las funciones relacionadas con la autenticación
 * y verificación de sesión para mantener consistencia en toda la aplicación.
 */

/**
 * Verifica si hay una sesión activa válida
 * @returns {boolean} - true si hay una sesión válida, false en caso contrario
 */
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

/**
 * Actualiza el tiempo de la última actividad del usuario
 */
function actualizarActividad() {
    localStorage.setItem('lastActivity', new Date().getTime());
}

/**
 * Cierra la sesión del usuario y redirecciona al login
 */
function cerrarSesion() {
    try {
        // Limpiar datos de sesión
        localStorage.clear();
        // Redirigir al login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

/**
 * Protege una página verificando si hay una sesión activa
 * Si no hay sesión, redirecciona al login
 */
function protegerRuta() {
    if (!verificarSesion()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * Configura los listeners para actualizar la actividad del usuario
 */
function configurarListenersActividad() {
    document.addEventListener('click', actualizarActividad);
    document.addEventListener('keypress', actualizarActividad);
    document.addEventListener('mousemove', actualizarActividad);
}

/**
 * Configura la verificación periódica de sesión
 * @param {number} intervalo - Intervalo en milisegundos (por defecto 60 segundos)
 */
function configurarVerificacionPeriodica(intervalo = 60000) {
    setInterval(verificarSesion, intervalo);
}

/**
 * Configura el botón de logout para cerrar sesión
 * @param {string} selectorBoton - Selector CSS del botón de logout
 */
function configurarBotonLogout(selectorBoton = '#logout') {
    const botonLogout = document.querySelector(selectorBoton);
    if (botonLogout) {
        botonLogout.addEventListener('click', cerrarSesion);
    }
}

/**
 * Inicializa todas las funcionalidades de autenticación en una página
 * @param {Object} opciones - Opciones de configuración
 * @param {boolean} opciones.protegerPagina - Si se debe proteger la página
 * @param {boolean} opciones.configurarListeners - Si se deben configurar los listeners de actividad
 * @param {boolean} opciones.verificacionPeriodica - Si se debe configurar la verificación periódica
 * @param {number} opciones.intervaloVerificacion - Intervalo para la verificación periódica
 * @param {boolean} opciones.configurarLogout - Si se debe configurar el botón de logout
 * @param {string} opciones.selectorLogout - Selector CSS del botón de logout
 */
function inicializarAutenticacion(opciones = {}) {
    const config = {
        protegerPagina: true,
        configurarListeners: true,
        verificacionPeriodica: true,
        intervaloVerificacion: 60000,
        configurarLogout: true,
        selectorLogout: '#logout'
    };

    // Combinar opciones proporcionadas con las predeterminadas
    Object.assign(config, opciones);

    // Proteger la página si es necesario
    if (config.protegerPagina && !protegerRuta()) {
        return false;
    }

    // Configurar listeners de actividad
    if (config.configurarListeners) {
        configurarListenersActividad();
    }

    // Configurar verificación periódica
    if (config.verificacionPeriodica) {
        configurarVerificacionPeriodica(config.intervaloVerificacion);
    }

    // Configurar botón de logout
    if (config.configurarLogout) {
        configurarBotonLogout(config.selectorLogout);
    }

    return true;
}