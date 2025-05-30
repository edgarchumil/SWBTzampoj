// Funciones de utilidad

async function actualizarContadores() {
    try {
        await Promise.all([
            actualizarContadorBautismos(),
            actualizarContadorPrimerasComuniones(),
            actualizarContadorConfirmaciones(),
            actualizarContadorMatrimonios()
        ]);
    } catch (error) {
        console.error('Error al actualizar contadores:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Verificar si ya hay una sesión activa antes de inicializar la autenticación completa
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Inicializar autenticación con verificación periódica menos frecuente para evitar parpadeos
        if (!inicializarAutenticacion({
            verificacionPeriodica: true,
            intervaloVerificacion: 300000 // Verificar cada 5 minutos en lugar de cada minuto
        })) {
            return; // Si la autenticación falla, detener la ejecución
        }

        const username = localStorage.getItem('username');
        if (username) {
            document.getElementById('username').textContent = username;
        }

        inicializarSidebar();
        await actualizarContadores();

        // Configurar actualización periódica de contadores
        setInterval(actualizarContadores, 300000);

    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
});

// El botón de logout ahora se maneja a través de auth-utils.js

function inicializarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar || !mainContent || !sidebarToggle) return;

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
    }
}


// Usar la configuración centralizada de config.js
// Verificar si config está definido, si no, definir una URL por defecto
if (typeof config === 'undefined') {
    console.warn('La configuración centralizada no está disponible, usando valores por defecto');
    var config = {
        apiUrl: 'http://localhost:8080/api',
        endpoints: {
            bautismosCount: '/bautismo/count',
            comuniones: '/comunion/total',
            confirmaciones: '/confirmacion/total',
            matrimonios: '/matrimonio/total'
        }
    };
}

// Rutas de la API usando la configuración centralizada
const API_ROUTES = {
    bautismos: `${config.apiUrl}${config.endpoints.bautismosCount}`,
    comuniones: `${config.apiUrl}${config.endpoints.comuniones}`,
    comunionesCount: `${config.apiUrl}${config.endpoints.comunionesCount}`,
    confirmaciones: `${config.apiUrl}${config.endpoints.confirmaciones}`,
    matrimonios: `${config.apiUrl}${config.endpoints.matrimonios}`
};

async function actualizarContadorBautismos() {
    try {
        //console.log('🌐 Verificando ruta de bautismos:', API_ROUTES.bautismos);
        const response = await fetch(API_ROUTES.bautismos, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`Error al obtener bautismos: Estado ${response.status}`);
            const counterElement = document.getElementById('bautismosCounter');
            if (counterElement) counterElement.textContent = '0 registros';
            return;
        }
        
        const data = await response.json();
        //console.log('Datos de bautismos recibidos:', data);
        
        const counterElement = document.getElementById('bautismosCounter');
        if (counterElement) {
            counterElement.textContent = `${data.total || 0} registros`;
            //console.log('Contador de bautismos actualizado:', counterElement.textContent);
        }
    } catch (error) {
        console.error('Error al actualizar contador de bautismos:', error);
        const counterElement = document.getElementById('bautismosCounter');
        if (counterElement) counterElement.textContent = '0 registros';
    }
}

async function actualizarContadorPrimerasComuniones() {
    try {
        //console.log('🌐 Verificando ruta de comuniones:', API_ROUTES.comunionesCount);
        const response = await fetch(API_ROUTES.comunionesCount, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'  // Añadido header explícito
            }
        });
        
        //console.log('Estado respuesta comuniones:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error detallado:', errorText);
            const counterElement = document.getElementById('primerasComunionesCounter');
            if (counterElement) counterElement.textContent = 'Error';
            return;
        }
        
        const data = await response.json();
        //console.log('Datos de comuniones recibidos:', data);
        
        const counterElement = document.getElementById('primerasComunionesCounter');
        if (counterElement) {
            counterElement.textContent = `${data.total || 0} registros`;
        }
    } catch (error) {
        console.error('Error al actualizar contador de comuniones:', error);
        const counterElement = document.getElementById('primerasComunionesCounter');
        if (counterElement) counterElement.textContent = 'Error';
    }
}

async function actualizarContadorConfirmaciones() {
    try {
        //console.log('Intentando obtener contador de confirmaciones...');
        const response = await fetch(API_ROUTES.confirmaciones, { // Usar la ruta desde API_ROUTES
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`Error al obtener confirmaciones: Estado ${response.status}`);
            const counterElement = document.getElementById('confirmacionesCounter');
            if (counterElement) counterElement.textContent = '0 registros';
            return;
        }
        
        const data = await response.json();
        const counterElement = document.getElementById('confirmacionesCounter');
        if (counterElement) {
            counterElement.textContent = `${data.total || 0} registros`;
        }
    } catch (error) {
        console.error('Error al actualizar contador de confirmaciones:', error);
        const counterElement = document.getElementById('confirmacionesCounter');
        if (counterElement) counterElement.textContent = '0 registros';
    }
}

async function actualizarContadorMatrimonios() {
    try {
        //console.log('Intentando obtener contador de matrimonios...');
        const response = await fetch(API_ROUTES.matrimonios, { // Usar la ruta desde API_ROUTES
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`Error al obtener matrimonios: Estado ${response.status}`);
            const counterElement = document.getElementById('matrimoniosCounter');
            if (counterElement) counterElement.textContent = '0 registros';
            return;
        }
        
        const data = await response.json();
        const counterElement = document.getElementById('matrimoniosCounter');
        if (counterElement) {
            counterElement.textContent = `${data.total || 0} registros`;
        }
    } catch (error) {
        console.error('Error al actualizar contador de matrimonios:', error);
        const counterElement = document.getElementById('matrimoniosCounter');
        if (counterElement) counterElement.textContent = '0 registros';
    }
}
