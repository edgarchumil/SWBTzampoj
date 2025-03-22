// Global API URL y funciones de utilidad
if (typeof API_URL === 'undefined') {
    const API_URL = 'http://localhost:8080/api';
}

// Definir API_URL como variable global
var API_URL = config.apiUrl;

// Funciones de formateo de fecha
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

// Update the formatDateForDisplay function
function formatDateForDisplay(date) {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

// Variables globales
let currentSort = {
    column: 'libro',
    direction: 'asc'
};
let searchTerm = '';
let currentPage = 1;
let itemsPerPage = 15;
let totalPages = 1;

// Función para verificar la conexión al servidor
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_URL}/matrimonios/todos`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            console.error(`Error de conexión: Estado ${response.status}`);
            throw new Error(`Error de conexión: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('❌ Error de conexión al servidor:', error);
        return false;
    }
}

// Función para manejar la búsqueda
function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    console.log('Término de búsqueda:', searchTerm);
    loadMatrimonios();
}

// Nueva función para ordenar los datos
function sortMatrimonios(matrimonios, column, direction) {
    console.log(`Ordenando por ${column} en dirección ${direction}`);
    
    return [...matrimonios].sort((a, b) => {
        let valueA, valueB;
        
        // Determinar los valores a comparar según la columna
        switch(column) {
            case 'libro':
                valueA = parseInt(a.libro) || 0;
                valueB = parseInt(b.libro) || 0;
                break;
            case 'folio':
                valueA = parseInt(a.folio) || 0;
                valueB = parseInt(b.folio) || 0;
                break;
            case 'no_partida':
                valueA = parseInt(a.no_partida) || 0;
                valueB = parseInt(b.no_partida) || 0;
                break;
            default:
                valueA = a[column] || '';
                valueB = b[column] || '';
        }
        
        // Comparar valores
        if (valueA < valueB) {
            return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

// Función para configurar los encabezados de la tabla para ordenamiento
function setupTableSorting() {
    const tableHeaders = document.querySelectorAll('table th');
    
    // Columnas ordenables
    const sortableColumns = [
        { index: 0, name: 'libro', text: 'Libro' },
        { index: 4, name: 'folio', text: 'Folio' },
        { index: 5, name: 'no_partida', text: 'No. Partida' }
    ];
    
    // Configurar cada encabezado ordenable
    sortableColumns.forEach(column => {
        const header = tableHeaders[column.index];
        if (header) {
            // Añadir clase para indicar que es ordenable
            header.classList.add('sortable');
            header.style.cursor = 'pointer';
            
            // Añadir indicador de ordenamiento
            let indicator = header.querySelector('.sort-indicator');
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.style.marginLeft = '5px';
                header.appendChild(indicator);
            }
            
            // Añadir evento de clic
            header.addEventListener('click', () => {
                // Cambiar dirección si ya está ordenado por esta columna
                if (currentSort.column === column.name) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.column = column.name;
                    currentSort.direction = 'asc';
                }
                
                console.log(`Ordenando por ${column.name} en dirección ${currentSort.direction}`);
                loadMatrimonios();
            });
        }
    });
    
    // Actualizar indicadores iniciales
    updateSortIndicators();
}

// Inicializar la página cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, inicializando página de matrimonios');
    
    // Mostrar indicador de carga
    mostrarCargando('Cargando datos de matrimonios...');

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No hay token de autenticación');
        window.location.href = 'login.html';
        return;
    }

        // Verificar conexión al servidor
    const serverConnected = await checkServerConnection();
    if (!serverConnected) {
        displayError('No se pudo conectar al servidor. Verifique su conexión a internet o contacte al administrador.');
        ocultarCargando();
        return;
    }
    
    // Verificar conexión al servidor
    const connected = await checkServerConnection();
    if (!connected) {
        ocultarCargando();
        displayError('No se pudo conectar al servidor. Verifique su conexión.');
        return;
    }
    

    // Configurar el buscador - asegurarse de que el ID sea correcto
    const searchInput = document.querySelector('input[type="text"], input[placeholder*="Buscar"]');
    if (searchInput) {
        console.log('Buscador encontrado, configurando evento de búsqueda');
        searchInput.addEventListener('input', handleSearch);
    } else {
        console.error('No se encontró el campo de búsqueda');
    }
    
    // Configurar el botón de nuevo registro
    const btnNuevoRegistro = document.getElementById('nuevoRegistro');
    if (btnNuevoRegistro) {
        console.log('Botón Nuevo Registro encontrado, configurando evento');
        btnNuevoRegistro.addEventListener('click', abrirModal);
    } else {
        console.error('No se encontró el botón de Nuevo Registro');
    }
    
    // Configurar el botón de descargar registros - CORREGIDO
    const btnDescargarRegistro = document.getElementById('exportExcel');
    if (btnDescargarRegistro) {
        console.log('Botón Descargar Registro encontrado, configurando evento');
        btnDescargarRegistro.addEventListener('click', descargarRegistrosExcel);
    } else {
        // Buscar por texto alternativo
        const botones = Array.from(document.querySelectorAll('button'));
        const btnDescargar = botones.find(btn => btn.textContent.includes('Descargar Registro'));
        if (btnDescargar) {
            console.log('Botón Descargar Registro encontrado por texto, configurando evento');
            btnDescargar.addEventListener('click', descargarRegistrosExcel);
        } else {
            console.error('No se encontró el botón de Descargar Registro');
        }
    }
    
    // Configurar el input de importación de Excel
    const importExcel = document.getElementById('importExcel');
    if (importExcel) {
        // Eliminar eventos anteriores para evitar duplicados
        const nuevoInput = importExcel.cloneNode(true);
        importExcel.parentNode.replaceChild(nuevoInput, importExcel);
        
        // Configurar un solo evento para el input
        nuevoInput.addEventListener('change', cargarRegistrosExcel);
    } else {
        console.error('No se encontró el input para importar Excel');
    }




    // Configurar el botón de cancelar en el modal
    const btnCancelar = document.querySelector('#matrimonioModal .cancel');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModal);
    }
    
    // Configurar el formulario para guardar
    const form = document.getElementById('matrimoniosForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarMatrimonio();
        });
    }
    
    
    // Cargar los matrimonios iniciales
    await loadMatrimonios();
    
    // Ocultar indicador de carga
    ocultarCargando();
});

function mostrarCargando(mensaje = 'Cargando...') {
    // Crear el contenedor del indicador de carga si no existe
    let loadingContainer = document.getElementById('loadingContainer');
    if (!loadingContainer) {
        loadingContainer = document.createElement('div');
        loadingContainer.id = 'loadingContainer';
        loadingContainer.style.position = 'fixed';
        loadingContainer.style.top = '0';
        loadingContainer.style.left = '0';
        loadingContainer.style.width = '100%';
        loadingContainer.style.height = '100%';
        loadingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loadingContainer.style.display = 'flex';
        loadingContainer.style.flexDirection = 'column';
        loadingContainer.style.justifyContent = 'center';
        loadingContainer.style.alignItems = 'center';
        loadingContainer.style.zIndex = '9999';
        
        const loadingContent = document.createElement('div');
        loadingContent.style.backgroundColor = 'white';
        loadingContent.style.padding = '20px';
        loadingContent.style.borderRadius = '5px';
        loadingContent.style.textAlign = 'center';
        loadingContent.style.maxWidth = '80%';
        
        const loadingMessage = document.createElement('p');
        loadingMessage.id = 'loadingMessage';
        loadingMessage.style.marginBottom = '15px';
        loadingMessage.style.fontWeight = 'bold';
        
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100%';
        progressContainer.style.backgroundColor = '#f1f1f1';
        progressContainer.style.borderRadius = '5px';
        progressContainer.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'loadingProgressBar';
        progressBar.style.height = '20px';
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.transition = 'width 0.3s';
        
        progressContainer.appendChild(progressBar);
        loadingContent.appendChild(loadingMessage);
        loadingContent.appendChild(progressContainer);
        loadingContainer.appendChild(loadingContent);
        
        document.body.appendChild(loadingContainer);
    }
    
    // Actualizar el mensaje
    document.getElementById('loadingMessage').textContent = mensaje;
    
    // Iniciar la animación de la barra de progreso
    const progressBar = document.getElementById('loadingProgressBar');
    progressBar.style.width = '0%';
    
    // Simular progreso
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
        } else {
            width += Math.random() * 10;
            if (width > 90) width = 90;
            progressBar.style.width = width + '%';
        }
    }, 300);
    
    // Guardar el ID del intervalo para poder limpiarlo después
    loadingContainer.dataset.intervalId = interval;
}

// Función para mostrar indicador de carga
function mostrarTotalRegistros(totalItems) {

    
    // Buscar un elemento existente para mostrar el total o crear uno nuevo
    let totalElement = document.querySelector('.total-records-info');
    if (!totalElement) {
        totalElement = document.createElement('div');
        totalElement.className = 'total-records-info';
        totalElement.style.textAlign = 'center';
        totalElement.style.margin = '10px 0';
        totalElement.style.fontWeight = 'bold';
        
        // Insertar después de la tabla
        const table = document.querySelector('table');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(totalElement, table.nextSibling);
        }
    }
    
    totalElement.textContent = `Total: ${totalItems} registros`;
}

// Función para ocultar indicador de carga
function ocultarCargando() {
    const loadingContainer = document.getElementById('loadingContainer');
    if (loadingContainer) {
        // Completar la barra de progreso antes de ocultar
        const progressBar = document.getElementById('loadingProgressBar');
        progressBar.style.width = '100%';
        
        // Limpiar el intervalo
        if (loadingContainer.dataset.intervalId) {
            clearInterval(parseInt(loadingContainer.dataset.intervalId));
        }
        
        // Ocultar después de un breve retraso para mostrar el 100%
        setTimeout(() => {
            loadingContainer.style.display = 'none';
        }, 500);
    }
}

// ÚNICA FUNCIÓN PARA CARGAR MATRIMONIOS
async function loadMatrimonios() {
    try {
        console.log('Cargando matrimonios...');
        mostrarCargando('Cargando registros de matrimonios...');

        
        
        // Solicitar explícitamente todos los registros con un límite muy alto
        const response = await fetch(`${API_URL}/matrimonios/todos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        let matrimoniosData = {
            items: [],
            total: 0,
            filteredTotal: 0
        };
        
        // Verificar si los datos tienen el formato esperado (paginado)
        if (data && data.results && Array.isArray(data.results)) {
            // Usar data.results que contiene el array de matrimonios
            console.log('Usando datos paginados, encontrados:', data.results.length, 'registros');
            matrimoniosData.items = data.results;
            matrimoniosData.total = data.count || data.results.length;
        } else if (Array.isArray(data)) {
            // Si los datos son directamente un array
            console.log('Usando datos como array, encontrados:', data.length, 'registros');
            matrimoniosData.items = data;
            matrimoniosData.total = data.length;
        } else {
            console.error('Los datos recibidos no tienen un formato válido:', data);
            displayError('Error al cargar los datos: formato de datos incorrecto');
            ocultarCargando();
            return;
        }

        //Aplicar ordenamiento múltiple ANTES de filtrar y paginar
        matrimoniosData.items = ordenarMultiple(matrimoniosData.items);
        console.log('Datos ordenados por libro, folio y no_partida');
        
        // Filtrar los datos según el término de búsqueda
        if (searchTerm) {
            console.log('Filtrando por término de búsqueda:', searchTerm);
            matrimoniosData.items = matrimoniosData.items.filter(matrimonio => {
                const esposo = (matrimonio.nombre_esposo || matrimonio.esposo || '').toLowerCase();
                const esposa = (matrimonio.nombre_esposa || matrimonio.esposa || '').toLowerCase();
                const libro = (matrimonio.libro || '').toString().toLowerCase();
                const folio = (matrimonio.folio || '').toString().toLowerCase();
                const partida = (matrimonio.no_partida || '').toString().toLowerCase();
                
                return esposo.includes(searchTerm) || 
                       esposa.includes(searchTerm) || 
                       libro.includes(searchTerm) || 
                       folio.includes(searchTerm) || 
                       partida.includes(searchTerm);
            });
            console.log('Registros después de filtrar:', matrimoniosData.items.length);
            matrimoniosData.filteredTotal = matrimoniosData.items.length;
        } else {
            matrimoniosData.filteredTotal = matrimoniosData.total;
        }

        totalPages = Math.max(1, Math.ceil(matrimoniosData.items.length / itemsPerPage));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        } else if (currentPage < 1) {
            currentPage = 1;
        }

        // Obtener solo los elementos de la página actual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, matrimoniosData.items.length);
        const paginatedItems = matrimoniosData.items.slice(startIndex, endIndex);

        console.log(`Mostrando página ${currentPage} de ${totalPages} (${paginatedItems.length} registros de ${matrimoniosData.items.length})`);
        // Mostrar los datos paginados
        displayMatrimonios(paginatedItems);
        
        // Asegurarse de que la paginación esté configurada
        configurarPaginacion();

        // Actualizar indicadores de ordenamiento
        updateSortIndicators();
        
        
        // Mostrar el total de registros y actualizar controles de paginación
        mostrarTotalRegistros(matrimoniosData.filteredTotal);
        updatePaginationInfo(currentPage, totalPages, matrimoniosData.filteredTotal);

        // Mostrar los controles de paginación si hay más de una página
        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
        }
        
        matrimoniosData.items = ordenarMultiple(matrimoniosData.items);
        ocultarCargando();

    } catch (error) {
        console.error('Error al cargar matrimonios:', error);
        displayError('Error al cargar los datos: ' + error.message);
        ocultarCargando();
    }
}

function configurarPaginacion() {
    console.log('Configurando paginación inicial...');
    
    // Buscar el contenedor de paginación o crearlo si no existe
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.alignItems = 'center';
        paginationContainer.style.margin = '20px 0';
        
        // Insertar después de la tabla
        const table = document.querySelector('table');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(paginationContainer, table.nextSibling);
        } else {
            // Si no hay tabla, insertar al final del contenido principal
            const mainContent = document.querySelector('main') || document.body;
            mainContent.appendChild(paginationContainer);
        }
    }

    // Crear botón Anterior si no existe
    let btnAnterior = document.getElementById('btnAnterior');
    if (!btnAnterior) {
        btnAnterior = document.createElement('button');
        btnAnterior.id = 'btnAnterior';
        btnAnterior.textContent = 'Anterior';
        btnAnterior.className = 'btn-pagination';
        btnAnterior.style.padding = '8px 16px';
        btnAnterior.style.margin = '0 10px';
        btnAnterior.style.backgroundColor = '#f0f0f0';
        btnAnterior.style.border = '1px solid #ddd';
        btnAnterior.style.borderRadius = '4px';
        btnAnterior.style.cursor = 'pointer';
        
        // Agregar evento
        btnAnterior.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadMatrimonios();
            }
        });
        
        // Insertar al principio del contenedor
        paginationContainer.appendChild(btnAnterior);
    }
    
    // Crear elemento de información de paginación si no existe
    let paginationInfo = document.querySelector('.pagination-info');
    if (!paginationInfo) {
        paginationInfo = document.createElement('span');
        paginationInfo.className = 'pagination-info';
        paginationInfo.textContent = 'Página 1 de 1';
        paginationInfo.style.margin = '0 15px';
        paginationInfo.style.fontWeight = 'bold';
        
        // Insertar después del botón Anterior
        paginationContainer.appendChild(paginationInfo);
    }
    
    // Crear botón Siguiente si no existe
    let btnSiguiente = document.getElementById('btnSiguiente');
    if (!btnSiguiente) {
        btnSiguiente = document.createElement('button');
        btnSiguiente.id = 'btnSiguiente';
        btnSiguiente.textContent = 'Siguiente';
        btnSiguiente.className = 'btn-pagination';
        btnSiguiente.style.padding = '8px 16px';
        btnSiguiente.style.margin = '0 10px';
        btnSiguiente.style.backgroundColor = '#f0f0f0';
        btnSiguiente.style.border = '1px solid #ddd';
        btnSiguiente.style.borderRadius = '4px';
        btnSiguiente.style.cursor = 'pointer';
        
        // Agregar evento
        btnSiguiente.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadMatrimonios();
            }
        });
        
        // Insertar al final del contenedor
        paginationContainer.appendChild(btnSiguiente);
    }
    
    // Crear elemento para mostrar el total de registros
    let totalRecordsInfo = document.querySelector('.total-records-info');
    if (!totalRecordsInfo) {
        totalRecordsInfo = document.createElement('span');
        totalRecordsInfo.className = 'total-records-info';
        totalRecordsInfo.textContent = 'Total: 0 registros';
        totalRecordsInfo.style.margin = '0 15px';
        totalRecordsInfo.style.fontWeight = 'bold';
        
        // Insertar después del botón Siguiente
        paginationContainer.appendChild(totalRecordsInfo);
    }
    
    // Asegurarse de que los botones tengan los eventos correctos
    if (btnAnterior) {
        // Eliminar eventos anteriores para evitar duplicados
        const newBtnAnterior = btnAnterior.cloneNode(true);
        btnAnterior.parentNode.replaceChild(newBtnAnterior, btnAnterior);
        
        // Agregar nuevo evento
        newBtnAnterior.addEventListener('click', () => {
            console.log('Botón Anterior clickeado, página actual:', currentPage);
            if (currentPage > 1) {
                currentPage--;
                console.log('Cambiando a página:', currentPage);
                loadMatrimonios();
            }
        });
    }
    
    if (btnSiguiente) {
        // Eliminar eventos anteriores para evitar duplicados
        const newBtnSiguiente = btnSiguiente.cloneNode(true);
        btnSiguiente.parentNode.replaceChild(newBtnSiguiente, btnSiguiente);
        
        // Agregar nuevo evento
        newBtnSiguiente.addEventListener('click', () => {
            console.log('Botón Siguiente clickeado, página actual:', currentPage);
            if (currentPage < totalPages) {
                currentPage++;
                console.log('Cambiando a página:', currentPage);
                loadMatrimonios();
            }
        });
    }
    
    console.log('Paginación inicial configurada correctamente');
}

// Función para mostrar los matrimonios en la tabla
function displayMatrimonios(matrimonios) {
    // Seleccionar el elemento tbody de la tabla - usar un selector más específico
    const tableBody = document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('No se encontró el elemento tbody de la tabla');
        return;
    }
    
    console.log('Elemento tbody encontrado, mostrando', matrimonios.length, 'registros');
    
    // Limpiar la tabla antes de agregar nuevos datos
    tableBody.innerHTML = '';
    
    if (!matrimonios || matrimonios.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="9" class="text-center">No hay registros disponibles</td>`;
        tableBody.appendChild(row);
        return;
    }

    // Mostrar cada matrimonio en la tabla
    matrimonios.forEach((matrimonio, index) => {
        if (!matrimonio) return; // Saltar elementos nulos o indefinidos
        
        console.log(`Procesando matrimonio ${index+1}/${matrimonios.length}:`, matrimonio);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${matrimonio.libro || ''}</td>
            <td>${matrimonio.nombre_esposo || matrimonio.esposo || ''}</td>
            <td>${matrimonio.nombre_esposa || matrimonio.esposa || ''}</td>
            <td>${formatDateForDisplay(matrimonio.fecha_matrimonio) || ''}</td>
            <td>${matrimonio.folio || ''}</td>
            <td>${matrimonio.no_partida || ''}</td>
            <td>${matrimonio.nota || ''}</td>
            <td class="text-center">
                <button onclick="editarMatrimonio(${matrimonio.id})" class="edit-button">✏️</button>
                <button onclick="eliminarMatrimonio(${matrimonio.id})" class="delete-button">🗑️</button>
            </td>
            <td class="text-center">
                <button onclick="generarConstanciaMatrimonio(${matrimonio.id})" class="btn-constancia">📄</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
        
    console.log(`Total de filas agregadas a la tabla: ${tableBody.children.length}`);
}

// Función para editar un matrimonio
async function editarMatrimonio(id) {
    try {
        console.log('Editando matrimonio con ID:', id);
        
        // Obtener los datos del matrimonio
        const response = await fetch(`${API_URL}/matrimonios/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }
        
        const matrimonio = await response.json();
        console.log('Datos del matrimonio obtenidos:', matrimonio);
        
        // Abrir el modal
        const modal = document.getElementById('matrimonioModal');
        if (!modal) {
            throw new Error('No se encontró el modal');
        }
        
        // Cambiar el título para edición
        document.getElementById('modalTitle').textContent = 'Editar Registro de Matrimonio';
        
        // Llenar el formulario con los datos
        const form = document.getElementById('matrimoniosForm');
        form.dataset.editId = id; // Guardar el ID para saber que es una edición
        
        // Llenar los campos del formulario
        document.getElementById('fecha_matrimonio').value = matrimonio.fecha_matrimonio || '';
        
        // Datos del esposo
        document.getElementById('nombre_esposo').value = matrimonio.nombre_esposo || '';
        document.getElementById('fecha_nacimiento_esposo').value = matrimonio.fecha_nacimiento_esposo || '';
        document.getElementById('nacimiento_esposo').value = matrimonio.lugar_nacimiento_esposo || '';
        document.getElementById('nombre_padre_esposo').value = matrimonio.nombre_padre_esposo || '';
        document.getElementById('nombre_madre_esposo').value = matrimonio.nombre_madre_esposo || '';
        
        // Datos de la esposa
        document.getElementById('nombre_esposa').value = matrimonio.nombre_esposa || '';
        document.getElementById('fecha_nacimiento_esposa').value = matrimonio.fecha_nacimiento_esposa || '';
        document.getElementById('nacimiento_esposa').value = matrimonio.lugar_nacimiento_esposa || '';
        document.getElementById('nombre_padre_esposa').value = matrimonio.nombre_padre_esposa || '';
        document.getElementById('nombre_madre_esposa').value = matrimonio.nombre_madre_esposa || '';
        
        // Datos adicionales
        document.getElementById('padrino').value = matrimonio.padrino || '';
        document.getElementById('madrina').value = matrimonio.madrina || '';
        
        // Datos de registro
        document.getElementById('libro').value = matrimonio.libro || '';
        document.getElementById('folio').value = matrimonio.folio || '';
        document.getElementById('no_partida').value = matrimonio.no_partida || '';
        
        // Datos del sacerdote
        document.getElementById('parroco').value = matrimonio.parroco || '';
        
        // Nota
        document.getElementById('nota').value = matrimonio.nota || '';
        
        // Mostrar el modal
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error al editar matrimonio:', error);
        alert('Error al cargar los datos para editar: ' + error.message);
    }
}

// Función para eliminar un matrimonio
async function eliminarMatrimonio(id) {
    try {
        if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
            return;
        }
        
        console.log('Eliminando matrimonio con ID:', id);
        
        const response = await fetch(`${API_URL}/matrimonios/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }
        
        console.log('Matrimonio eliminado exitosamente');
        
        // Recargar los datos
        loadMatrimonios();
        
        // Mostrar mensaje de éxito
        alert('Registro eliminado exitosamente');
        
    } catch (error) {
        console.error('Error al eliminar matrimonio:', error);
        alert('Error al eliminar el registro: ' + error.message);
    }
}

// Función para generar constancia de matrimonio
async function generarConstanciaMatrimonio(id) {
    try {
        console.log('Generando constancia para matrimonio con ID:', id);
        
        // Obtener los datos del matrimonio
        const response = await fetch(`${API_URL}/matrimonios/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }
        
        const matrimonio = await response.json();
        console.log('Datos del matrimonio obtenidos:', matrimonio);
        
        // Verificar que jsPDF esté disponible
        if (!window.jspdf) {
            throw new Error('La librería jsPDF no está cargada correctamente');
        }
        
        // Crear nuevo documento PDF
        const doc = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        
        // Cargar y añadir la imagen del membrete
        const img = new Image();
        img.src = './img/membrete.jpeg';
        
        await new Promise((resolve, reject) => {
            img.onload = () => {
                try {
                    const imgWidth = 65;
                    const imgHeight = (img.height * imgWidth) / img.width;
                    doc.addImage(img, 'JPEG', 8, 5, imgWidth, imgHeight);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = reject;
        });
        
        // Configurar PDF
        doc.setFont('times', 'normal');
        
        // Header
        doc.setFontSize(13);
        doc.text('PARROQUIA NUESTRA SEÑORA DE LOURDES', 105, 29, { align: 'center' });
        doc.text('TZAMPOJ - IXTAHUACAN - SOLOLÁ', 105, 35, { align: 'center' });
        doc.text('DIÓCESIS SOLOLÁ - CHIMALTENANGO', 105, 40, { align: 'center' });
        
        // Title
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text('CONSTANCIA DE MATRIMONIO', 105, 60, { align: 'center' });
        doc.setFont('times', 'normal');
        
        // Fecha actual formateada
        const fechaActual = new Date();
        
        // Content
        doc.setFontSize(12);
        doc.text(`El infrascrito párroco hace constar que en la fecha: ${formatDateForDisplay(matrimonio.fecha_matrimonio)},`, 20, 78);
        doc.text('contrajeron matrimonio los señores:', 20, 83);
        
        // Datos del esposo
        doc.text('Datos del esposo:', 40, 97);
        doc.setFont('times', 'bold');
        doc.text(`${matrimonio.nombre_esposo}`, 105, 97,{ align: 'center' });
        doc.setFont('times', 'normal');
        doc.text('Hijo de:', 105, 102,{ align: 'center' });
        doc.text(`${matrimonio.nombre_padre_esposo}`, 105, 107,{ align: 'center' });
        doc.text(`${matrimonio.nombre_madre_esposo}`, 105, 112,{ align: 'center' });
        
        // Datos de la esposa
        doc.text('Datos de la esposa:', 40, 128);
        doc.setFont('times', 'bold');
        doc.text(`${matrimonio.nombre_esposa}`, 105, 128,{ align: 'center' });
        doc.setFont('times', 'normal');
        doc.text('Hija de:', 105, 133,{ align: 'center' });
        doc.text(`${matrimonio.nombre_padre_esposa}`, 105, 138,{ align: 'center' });
        doc.text(`${matrimonio.nombre_madre_esposa}`, 105, 143,{ align: 'center' });
        
        // Padrinos
        doc.text('Padrinos:', 40, 155);
        doc.text(`${matrimonio.padrino}`, 105, 155,{ align: 'center' });
        doc.text(`${matrimonio.madrina}`, 105, 160, { align: 'center' });
        
        // Datos de registro
        doc.text('Según Registro:', 20, 180);
        doc.text(`Libro: ${matrimonio.libro}, Folio: ${matrimonio.folio}, No. Partida: ${matrimonio.no_partida}`, 20, 185);
        doc.text(`Ministro Celebrante: ${matrimonio.parroco || 'Julio Calel'}`, 20, 190);
        doc.text(`Nota: ${matrimonio.nota || 'Primera Nota'}`, 20, 195);
        
        // Signature
        doc.text('F: _____________________', 105, 223, { align: 'center' });
        doc.text('Pbro. Julio César Calel Colaj', 105, 228, { align: 'center' });
        doc.text('Párroco', 105, 233, { align: 'center' });
        doc.text('Nuestra Señora de Lourdes – Tzampoj', 105, 238, { align: 'center' });
        doc.text('Diócesis de Sololá – Chimaltenango', 105, 243, { align: 'center' });
        
        // Footer with current date and time
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        doc.setFontSize(10);
        doc.text("Esta constancia sirve para:_____________________________________", 20, 263);
        doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${formatDateForDisplay(now)} a las ${hours}:${minutes}`, 20, 268);
        
        // Save PDF
        doc.save(`Constancia_Matrimonio_${matrimonio.nombre_esposo}_${matrimonio.nombre_esposa}.pdf`);
        
    } catch (error) {
        console.error('Error al generar constancia:', error);
        alert('Error al generar la constancia: ' + error.message);
    }
}

// Función para abrir el modal de matrimonio
function abrirModal() {
    const modal = document.getElementById('matrimonioModal');
    const form = document.getElementById('matrimoniosForm');
    
    if (modal) {
        // Limpiar el formulario
        if (form) {
            form.reset();
            form.dataset.editId = '';
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
        
        // Establecer el título del modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Nuevo Registro de Matrimonio';
        }
    } else {
        console.error('No se encontró el modal de matrimonio');
    }
}

// Función para cerrar el modal de matrimonio
function cerrarModal() {
    const modal = document.getElementById('matrimonioModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para guardar un matrimonio (nuevo o edición)
async function guardarMatrimonio() {
    try {
        // Obtener el formulario
        const form = document.getElementById('matrimoniosForm');
        if (!form) {
            throw new Error('No se pudo encontrar el formulario');
        }
        
        // Verificar si es una edición o un nuevo registro
        const editId = form.dataset.editId;
        const isEdit = !!editId;
        
        // Crear objeto con los datos del formulario
        const matrimonio = {
            // Datos básicos
            fecha_matrimonio: document.getElementById('fecha_matrimonio')?.value,
            
            // Datos del esposo
            nombre_esposo: document.getElementById('nombre_esposo')?.value,
            fecha_nacimiento_esposo: document.getElementById('fecha_nacimiento_esposo')?.value,
            lugar_nacimiento_esposo: document.getElementById('nacimiento_esposo')?.value,
            nombre_padre_esposo: document.getElementById('nombre_padre_esposo')?.value,
            nombre_madre_esposo: document.getElementById('nombre_madre_esposo')?.value,
            
            // Datos de la esposa
            nombre_esposa: document.getElementById('nombre_esposa')?.value,
            fecha_nacimiento_esposa: document.getElementById('fecha_nacimiento_esposa')?.value,
            lugar_nacimiento_esposa: document.getElementById('nacimiento_esposa')?.value,
            nombre_padre_esposa: document.getElementById('nombre_padre_esposa')?.value,
            nombre_madre_esposa: document.getElementById('nombre_madre_esposa')?.value,
            
            // Datos adicionales
            padrino: document.getElementById('padrino')?.value,
            madrina: document.getElementById('madrina')?.value,
            
            // Datos de registro
            libro: document.getElementById('libro')?.value,
            folio: document.getElementById('folio')?.value,
            no_partida: document.getElementById('no_partida')?.value,
            
            // Datos del sacerdote
            parroco: document.getElementById('parroco')?.value,
            
            // Nota
            nota: document.getElementById('nota')?.value
        };
        
        console.log('Datos a guardar:', matrimonio);
        
        // URL y método según sea creación o edición
        const url = isEdit ? `${API_URL}/matrimonios/${editId}/` : `${API_URL}/matrimonios/`;
        const method = isEdit ? 'PUT' : 'POST';
        
        // Mostrar indicador de carga
        mostrarCargando(isEdit ? 'Actualizando registro...' : 'Guardando nuevo registro...');
        
        // Enviar datos al servidor
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matrimonio)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Cerrar el modal
        cerrarModal();
        
        // Recargar los datos
        await loadMatrimonios();
        
        // Mostrar mensaje de éxito
        alert(isEdit ? 'Registro actualizado exitosamente' : 'Registro guardado exitosamente');
        
    } catch (error) {
        console.error('Error al guardar matrimonio:', error);
        alert('Error al guardar: ' + error.message);
    } finally {
        ocultarCargando();
    }
}

// Función para mostrar errores
function displayError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.style.backgroundColor = '#f8d7da';
    errorContainer.style.color = '#721c24';
    errorContainer.style.padding = '10px';
    errorContainer.style.margin = '10px 0';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.fontWeight = 'bold';
    errorContainer.textContent = message;
    
    // Insertar al principio del contenido principal
    const mainContent = document.querySelector('main') || document.body;
    mainContent.insertBefore(errorContainer, mainContent.firstChild);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}

// Función para descargar registros en formato Excel
async function descargarRegistrosExcel() {
    try {
        console.log('Iniciando descarga de registros en Excel...');
        mostrarCargando('Preparando archivo Excel...');
        
        // Obtener todos los datos desde el servidor
        const response = await fetch(`${API_URL}/matrimonios/todos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos para Excel:', data);
        
        let matrimonios = [];
        
        // Verificar si los datos tienen el formato esperado
        if (data && data.results && Array.isArray(data.results)) {
            matrimonios = data.results;
        } else if (Array.isArray(data)) {
            matrimonios = data;
        } else {
            throw new Error('Los datos recibidos no tienen un formato válido');
        }
        
        // Si no hay datos, mostrar mensaje
        if (matrimonios.length === 0) {
            alert('No hay datos para exportar');
            ocultarCargando();
            return;
        }
        
        // Crear un nuevo libro de Excel
        const workbook = XLSX.utils.book_new();
        
        // Encabezados completos de la tabla (todos los campos del modelo)
        const headers = [
            'Libro', 'Folio', 'No. Partida',
            'Fecha de Matrimonio',
            'Nombre del Esposo', 'Fecha de Nacimiento del Esposo', 'Lugar de Nacimiento del Esposo',
            'Nombre del Padre del Esposo', 'Nombre de la Madre del Esposo',
            'Nombre de la Esposa', 'Fecha de Nacimiento de la Esposa', 'Lugar de Nacimiento de la Esposa',
            'Nombre del Padre de la Esposa', 'Nombre de la Madre de la Esposa',
            'Padrino', 'Madrina',
            'Párroco', 'Nota'
        ];
        
        // Preparar los datos para Excel
        const rows = [];
        rows.push(headers); // Agregar encabezados como primera fila
        
        // Agregar todos los matrimonios al array de filas con todos los campos
        matrimonios.forEach(matrimonio => {
            const rowData = [
                matrimonio.libro || '',
                matrimonio.folio || '',
                matrimonio.no_partida || '',
                formatDateForDisplay(matrimonio.fecha_matrimonio) || '',
                matrimonio.nombre_esposo || '',
                formatDateForDisplay(matrimonio.fecha_nacimiento_esposo) || '',
                matrimonio.lugar_nacimiento_esposo || '',
                matrimonio.nombre_padre_esposo || '',
                matrimonio.nombre_madre_esposo || '',
                matrimonio.nombre_esposa || '',
                formatDateForDisplay(matrimonio.fecha_nacimiento_esposa) || '',
                matrimonio.lugar_nacimiento_esposa || '',
                matrimonio.nombre_padre_esposa || '',
                matrimonio.nombre_madre_esposa || '',
                matrimonio.padrino || '',
                matrimonio.madrina || '',
                matrimonio.parroco || '',
                matrimonio.nota || ''
            ];
            rows.push(rowData);
        });
        
        // Crear hoja de cálculo
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // Ajustar ancho de columnas para todos los campos
        const columnWidths = [
            { wch: 10 }, // Libro
            { wch: 10 }, // Folio
            { wch: 15 }, // No. Partida
            { wch: 20 }, // Fecha de Matrimonio
            { wch: 30 }, // Nombre del Esposo
            { wch: 20 }, // Fecha de Nacimiento del Esposo
            { wch: 30 }, // Lugar de Nacimiento del Esposo
            { wch: 30 }, // Nombre del Padre del Esposo
            { wch: 30 }, // Nombre de la Madre del Esposo
            { wch: 30 }, // Nombre de la Esposa
            { wch: 20 }, // Fecha de Nacimiento de la Esposa
            { wch: 30 }, // Lugar de Nacimiento de la Esposa
            { wch: 30 }, // Nombre del Padre de la Esposa
            { wch: 30 }, // Nombre de la Madre de la Esposa
            { wch: 30 }, // Padrino
            { wch: 30 }, // Madrina
            { wch: 30 }, // Párroco
            { wch: 40 }  // Nota
        ];
        worksheet['!cols'] = columnWidths;
        
        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Matrimonios');
        
        // Generar el archivo y descargarlo
        const fechaActual = new Date();
        const nombreArchivo = `Registros_Matrimonios_${fechaActual.getDate()}-${fechaActual.getMonth()+1}-${fechaActual.getFullYear()}.xlsx`;
        
        XLSX.writeFile(workbook, nombreArchivo);
        console.log('Archivo Excel generado correctamente:', nombreArchivo);
        console.log(`Total de registros exportados: ${matrimonios.length}`);
        
        ocultarCargando();
    } catch (error) {
        console.error('Error al generar archivo Excel:', error);
        alert('Error al generar el archivo Excel: ' + error.message);
        ocultarCargando();
    }
}

async function cargarRegistrosExcel(event) {
    try {
        // Prevenir comportamiento predeterminado y propagación
        event.stopPropagation();
        event.preventDefault();
        
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('Cargando archivo:', file.name);
        mostrarCargando('Procesando archivo Excel...');
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Obtener la primera hoja
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                // Verificar que haya datos
                if (jsonData.length <= 1) {
                    throw new Error('El archivo no contiene datos válidos');
                }
                
                // Obtener encabezados (primera fila)
                const headers = jsonData[0];
                
                // Verificar que los encabezados sean correctos
                const requiredHeaders = ['Libro', 'Nombre del Esposo', 'Nombre de la Esposa', 'Fecha de Matrimonio'];
                const headerCheck = requiredHeaders.every(header => 
                    headers.some(h => h && h.toString().includes(header))
                );
                
                if (!headerCheck) {
                    throw new Error('El formato del archivo no es válido. Verifique los encabezados.');
                }
                
                // Procesar cada fila (excepto la primera que son encabezados)
                let procesados = 0;
                let errores = 0;
                let erroresDetalle = [];
                
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length < 4) continue; // Saltar filas sin datos suficientes
                    
                    try {
                        // Usar safeFormatDate en lugar de formatDate para manejar mejor las fechas
                        const fechaMatrimonio = safeFormatDate(row[3]);
                        const fechaNacimientoEsposo = safeFormatDate(row[5]);
                        const fechaNacimientoEsposa = safeFormatDate(row[10]);
                        
                        // Validar que la fecha de matrimonio sea válida
                        if (row[3] && !fechaMatrimonio) {
                            throw new Error(`Fecha de matrimonio inválida: ${row[3]}`);
                        }
                        
                        // Mapear datos según los índices de las columnas
                        const matrimonio = {
                            libro: row[0] || '',
                            folio: row[1] || '',
                            no_partida: row[2] || '',
                            fecha_matrimonio: fechaMatrimonio,
                            nombre_esposo: row[4] || '',
                            fecha_nacimiento_esposo: fechaNacimientoEsposo,
                            lugar_nacimiento_esposo: row[6] || '',
                            nombre_padre_esposo: row[7] || '',
                            nombre_madre_esposo: row[8] || '',
                            nombre_esposa: row[9] || '',
                            fecha_nacimiento_esposa: fechaNacimientoEsposa,
                            lugar_nacimiento_esposa: row[11] || '',
                            nombre_padre_esposa: row[12] || '',
                            nombre_madre_esposa: row[13] || '',
                            padrino: row[14] || '',
                            madrina: row[15] || '',
                            parroco: row[16] || '',
                            nota: row[17] || ''
                        };

                        // Enviar al servidor
                        const response = await fetch(`${API_URL}/matrimonios/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(matrimonio)
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(`Error al guardar registro ${i}: ${response.status} - ${errorData.detail || response.statusText}`);
                        }
                        
                        procesados++;
                    } catch (error) {
                        console.error(`Error al procesar fila ${i}:`, error);
                        errores++;
                        erroresDetalle.push(`Fila ${i}: ${error.message}`);
                    }
                }
                
                // Recargar los datos
                await loadMatrimonios();
                
                // Mostrar resumen con detalles de errores
                if (errores > 0) {
                    const detallesError = erroresDetalle.slice(0, 5).join('\n'); // Mostrar solo los primeros 5 errores
                    const masErrores = errores > 5 ? `\n...y ${errores - 5} errores más` : '';
                    alert(`Proceso completado con errores:\n- Registros procesados: ${procesados}\n- Errores: ${errores}\n\nDetalles:\n${detallesError}${masErrores}`);
                } else {
                    alert(`Proceso completado exitosamente:\n- Registros procesados: ${procesados}`);
                }
                
            } catch (error) {
                console.error('Error al procesar archivo Excel:', error);
                alert('Error al procesar el archivo: ' + error.message);
            } finally {
                ocultarCargando();
                // Limpiar el input file para permitir cargar el mismo archivo nuevamente
                event.target.value = '';
            }
        };
        
        reader.onerror = function() {
            ocultarCargando();
            alert('Error al leer el archivo');
            event.target.value = '';
        };
        
        reader.readAsArrayBuffer(file);
        
    } catch (error) {
        console.error('Error al cargar archivo Excel:', error);
        alert('Error al cargar el archivo: ' + error.message);
        ocultarCargando();
        if (event.target) {
            event.target.value = '';
        }
    }
}

function updatePaginationInfo(currentPage, totalPages, totalItems) {
    console.log('Actualizando información de paginación...');
    
    // Actualizar texto de paginación
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    // Actualizar texto del total de registros
    const totalRecordsInfo = document.querySelector('.total-records-info');
    if (totalRecordsInfo) {
        totalRecordsInfo.textContent = `Total: ${totalItems} registros`;
    }
    
    // Actualizar estado de los botones
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (btnAnterior) {
        btnAnterior.disabled = currentPage <= 1;
        btnAnterior.classList.toggle('disabled', currentPage <= 1);
        btnAnterior.style.opacity = currentPage <= 1 ? '0.5' : '1';
        btnAnterior.style.cursor = currentPage <= 1 ? 'not-allowed' : 'pointer';
    }
    
    if (btnSiguiente) {
        btnSiguiente.disabled = currentPage >= totalPages;
        btnSiguiente.classList.toggle('disabled', currentPage >= totalPages);
        btnSiguiente.style.opacity = currentPage >= totalPages ? '0.5' : '1';
        btnSiguiente.style.cursor = currentPage >= totalPages ? 'not-allowed' : 'pointer';
    }
    
    console.log(`Información de paginación actualizada: Página ${currentPage} de ${totalPages}, Total: ${totalItems} registros`);
}

function updateSortIndicators() {
    const tableHeaders = document.querySelectorAll('table th');
    
    // Limpiar todos los indicadores
    tableHeaders.forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        if (indicator) {
            indicator.textContent = '';
        }
    });
    
    // Establecer el indicador para la columna actualmente ordenada
    const sortableColumns = [
        { index: 0, name: 'libro', text: 'Libro' },
        { index: 4, name: 'folio', text: 'Folio' },
        { index: 5, name: 'no_partida', text: 'No. Partida' }
    ];
    
    sortableColumns.forEach(column => {
        if (column.name === currentSort.column) {
            const header = tableHeaders[column.index];
            if (header) {
                const indicator = header.querySelector('.sort-indicator');
                if (indicator) {
                    indicator.textContent = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
                }
            }
        }
    });
}

function ordenarMultiple(matrimonios) {
    console.log('Aplicando ordenamiento múltiple: libro, folio, no_partida');
    
    return [...matrimonios].sort((a, b) => {
        // Primero ordenar por libro
        const libroA = parseInt(a.libro) || 0;
        const libroB = parseInt(b.libro) || 0;
        
        if (libroA !== libroB) {
            return libroA - libroB; // Orden ascendente por libro
        }
        
        // Si los libros son iguales, ordenar por folio
        const folioA = parseInt(a.folio) || 0;
        const folioB = parseInt(b.folio) || 0;
        
        if (folioA !== folioB) {
            return folioA - folioB; // Orden ascendente por folio
        }
        
        // Si los folios son iguales, ordenar por no_partida
        const partidaA = parseInt(a.no_partida) || 0;
        const partidaB = parseInt(b.no_partida) || 0;
        
        return partidaA - partidaB; // Orden ascendente por no_partida
    });
}

// Función para manejar fechas de manera segura
const safeFormatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
        // Si es un número (fecha de Excel), convertirlo a fecha JavaScript
        if (typeof dateValue === 'number') {
            const excelDate = XLSX.SSF.parse_date_code(dateValue);
            if (excelDate && excelDate.y && excelDate.m && excelDate.d) {
                return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
            }
        }
        
        // Si es un string, intentar parsearlo
        if (typeof dateValue === 'string') {
            // Manejar formato español "dd de [mes] de yyyy"
            const mesesEspanol = {
                'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 
                'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08', 
                'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
            };
            
            const regexFechaEspanol = /(\d{1,2})\s+de\s+([a-zé]+)\s+de\s+(\d{4})/i;
            const coincidenciaEspanol = dateValue.match(regexFechaEspanol);
            
            if (coincidenciaEspanol) {
                const dia = String(coincidenciaEspanol[1]).padStart(2, '0');
                const nombreMes = coincidenciaEspanol[2].toLowerCase();
                const anio = coincidenciaEspanol[3];
                
                if (mesesEspanol[nombreMes]) {
                    console.log(`Fecha en formato español convertida: ${dia}/${mesesEspanol[nombreMes]}/${anio}`);
                    return `${anio}-${mesesEspanol[nombreMes]}-${dia}`;
                }
            }
            
            // Verificar si tiene formato dd/mm/yyyy o dd-mm-yyyy
            if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateValue)) {
                const partes = dateValue.split(/[\/\-]/);
                return `${partes[2]}-${String(partes[1]).padStart(2, '0')}-${String(partes[0]).padStart(2, '0')}`;
            }
            
            // Intentar con Date.parse
            const fechaParseada = new Date(dateValue);
            if (!isNaN(fechaParseada.getTime())) {
                return fechaParseada.toISOString().split('T')[0];
            }
        }
        
        // Si llegamos aquí, no pudimos parsear la fecha
        console.warn(`No se pudo parsear la fecha: ${dateValue}`);
        return '';
    } catch (error) {
        console.error(`Error al procesar fecha ${dateValue}:`, error);
        return '';
    }
};