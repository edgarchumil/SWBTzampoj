// Funciones de utilidad

async function verificarSesion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

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
        if (!await verificarSesion()) {
            return;
        }

        const username = localStorage.getItem('username');
        if (username) {
            document.getElementById('username').textContent = username;
        }

        inicializarSidebar();
        await actualizarContadores();

        setInterval(verificarSesion, 60000);
        setInterval(actualizarContadores, 300000);

    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
});

document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = './index.html'; // Cambiado a ruta relativa
});

function actualizarActividad() {
    localStorage.setItem('lastActivity', new Date().getTime());
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html'; // Cambiado a ruta relativa
}

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


// Actualizar la constante API_URL con las rutas correctas
const API_URL = 'http://127.0.0.1:8080/api';

// Rutas de la API
// Actualizar las rutas para que coincidan con el backend
const API_ROUTES = {
    bautismos: `${API_URL}/bautismo/count`,
    comuniones: `${API_URL}/comunion/total`,
    confirmaciones: `${API_URL}/confirmacion/total`, // Cambiado a plural
    matrimonios: `${API_URL}/matrimonio/total`       // Corregido de matrimonion a matrimonios
};

async function actualizarContadorBautismos() {
    try {
        console.log('🌐 Verificando ruta de bautismos:', API_ROUTES.bautismos);
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
        console.log('Datos de bautismos recibidos:', data);
        
        const counterElement = document.getElementById('bautismosCounter');
        if (counterElement) {
            counterElement.textContent = `${data.total || 0} registros`;
            console.log('Contador de bautismos actualizado:', counterElement.textContent);
        }
    } catch (error) {
        console.error('Error al actualizar contador de bautismos:', error);
        const counterElement = document.getElementById('bautismosCounter');
        if (counterElement) counterElement.textContent = '0 registros';
    }
}

async function actualizarContadorPrimerasComuniones() {
    try {
        console.log('🌐 Verificando ruta de comuniones:', API_ROUTES.comuniones);
        const response = await fetch(API_ROUTES.comuniones, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'  // Añadido header explícito
            }
        });
        
        console.log('Estado respuesta comuniones:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error detallado:', errorText);
            const counterElement = document.getElementById('primerasComunionesCounter');
            if (counterElement) counterElement.textContent = 'Error';
            return;
        }
        
        const data = await response.json();
        console.log('Datos de comuniones recibidos:', data);
        
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
        console.log('Intentando obtener contador de confirmaciones...');
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
        console.log('Intentando obtener contador de matrimonios...');
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
