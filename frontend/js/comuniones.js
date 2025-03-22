// Definir URL base de la API
// Definir URL base de la API
if (typeof API_URL === 'undefined') {
    API_URL = 'http://localhost:8080/api';
}

// Definir API_URL como variable global
var API_URL = config.apiUrl;

// Función para formatear fechas en formato español
function formatearFecha(fecha) {
    if (!fecha) return '';
    
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    // Handle Date object (for current date)
    if (fecha instanceof Date) {
        const day = fecha.getDate();
        const month = fecha.getMonth(); // getMonth() returns 0-11
        const year = fecha.getFullYear();
        return `${day} de ${meses[month]} de ${year}`;
    }
    
    // Handle string date (for data from API)
    if (typeof fecha === 'string') {
        const [year, month, day] = fecha.split('-');
        return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
    }
    
    return '';
}

function filtrarRegistros(searchTerm) {
    const tbody = document.querySelector('#comunionTable tbody');
    const rows = tbody.getElementsByTagName('tr');

    for (let row of rows) {
        const nombreCell = row.cells[1]; // Column with names
        if (nombreCell) {
            const nombre = nombreCell.textContent || nombreCell.innerText;
            const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
            row.style.display = matchesSearch ? '' : 'none';
        }
    }

    // Show "no results" message if no matches found
    let visibleRows = 0;
    for (let row of rows) {
        if (row.style.display !== 'none') {
            visibleRows++;
        }
    }

    if (visibleRows === 0) {
        const existingNoResults = tbody.querySelector('.no-results');
        if (!existingNoResults) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results';
            noResultsRow.innerHTML = '<td colspan="8" class="text-center">No se encontraron registros</td>';
            tbody.appendChild(noResultsRow);
        }
    } else {
        const existingNoResults = tbody.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }
    }
}

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

const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

function formatDate(date, forDisplay = false) {
    if (!date) return '';
    
    try {
        if (forDisplay) {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); // Adjust timezone
            const dia = d.getDate().toString().padStart(2, '0');
            const mes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
            const año = d.getFullYear();
            return `${dia} de ${mes} de ${año}`;
        } else {
            // For API: YYYY-MM-DD
            if (date.includes('T')) {
                return date.split('T')[0];
            }
            return date;
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return date;
    }
}

async function editComunion(id) {
    try {
        mostrarCargando('Cargando datos del registro...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comuniones/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar el registro');
        }

        const comunion = await response.json();
        
        // Fill form with communion data
        document.getElementById('fechaComunion').value = formatDate(comunion.fecha_comunion);
        document.getElementById('nombre').value = comunion.nombre_comulgante;
        document.getElementById('fechaNacimiento').value = formatDate(comunion.fecha_nacimiento);
        document.getElementById('nombrePadre').value = comunion.nombre_padre;
        document.getElementById('nombreMadre').value = comunion.nombre_madre;
        document.getElementById('padrino').value = comunion.padrino;
        document.getElementById('madrina').value = comunion.madrina;
        document.getElementById('noPartida').value = comunion.no_partida;
        document.getElementById('libro').value = comunion.libro;
        document.getElementById('folio').value = comunion.folio;
        document.getElementById('parroco').value = comunion.sacerdote;
        document.getElementById('nota').value = comunion.nota || '';

        // Set edit mode
        document.getElementById('comunionForm').dataset.editId = id;

        // Show modal
        const modal = document.getElementById('comunionModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error loading communion:', error);
        alert('Error al cargar el registro para editar');
    }
}

async function deleteComunion(id) {
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
        return;
    }

    try {
        mostrarCargando('Eliminando registro...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comuniones/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar el registro');
        }

        alert('Registro eliminado exitosamente');
        
        // Add delay before reloading data
        setTimeout(async () => {
            try {
                await loadComuniones();
            } catch (loadError) {
                console.error('Error al recargar datos:', loadError);
            }
        }, 500);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error deleting communion:', error);
        alert('Error al eliminar el registro: ' + error.message);
    }
}

let allData = []; // Variable global para almacenar todos los datos

async function loadComuniones(searchTerm = '') {
    try {
        mostrarCargando('Cargando registros de comuniones...');
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // First request to get total count
        const initialUrl = `${API_URL}/comuniones/`;

        const initialResponse = await fetch(initialUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!initialResponse.ok) {
            throw new Error(`Error al cargar los datos: ${initialResponse.status}`);
        }

        const initialData = await initialResponse.json();
        const totalRecords = initialData.count;
        let allResults = [...initialData.results];

        // Fetch remaining pages if any
        if (initialData.next) {
            let nextUrl = initialData.next;
            while (nextUrl) {
                const pageResponse = await fetch(nextUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!pageResponse.ok) {
                    throw new Error(`Error al cargar los datos: ${pageResponse.status}`);
                }

                const pageData = await pageResponse.json();
                allResults = [...allResults, ...pageData.results];
                nextUrl = pageData.next;
            }
        }

        // Sort all collected data
        const sortedData = allResults.sort((a, b) => {
            // First sort by libro
            const libroA = parseInt(a.libro) || 0;
            const libroB = parseInt(b.libro) || 0;
            if (libroA !== libroB) {
                return libroA - libroB;
            }
            
            // If libro is equal, sort by folio
            const folioA = parseInt(a.folio) || 0;
            const folioB = parseInt(b.folio) || 0;
            if (folioA !== folioB) {
                return folioA - folioB;
            }
            
            // If folio is equal, sort by no_partida
            const partidaA = parseInt(a.no_partida) || 0;
            const partidaB = parseInt(b.no_partida) || 0;
            return partidaA - partidaB;
        });

        //console.log('Total records fetched:', allResults.length);
        allData = sortedData; // Guardar los datos en la variable global
        
        // Si hay un término de búsqueda, filtrar los datos
        if (searchTerm) {
            const filteredData = allData.filter(comunion => 
                comunion.nombre_comulgante.toLowerCase().includes(searchTerm.toLowerCase())
            );
            updateTable(filteredData);
        } else {
            updateTable(sortedData);
        }
        
        ocultarCargando();

    } catch (error) {
        ocultarCargando();
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos. Por favor, intente nuevamente.');
    }
}

function updatePagination(responseData) {
    const anteriorBtn = document.getElementById('anterior');
    const siguienteBtn = document.getElementById('siguiente');
    const paginaInfo = document.querySelector('.pagination-info');

    if (anteriorBtn && siguienteBtn) {
        const currentPage = responseData.current_page || 1;
        const totalPages = Math.ceil(responseData.count / 15);

        anteriorBtn.style.display = currentPage > 1 ? 'inline' : 'none';
        siguienteBtn.style.display = currentPage < totalPages ? 'inline' : 'none';

        anteriorBtn.onclick = () => loadComuniones(document.getElementById('searchInput').value.trim(), currentPage - 1);
        siguienteBtn.onclick = () => loadComuniones(document.getElementById('searchInput').value.trim(), currentPage + 1);

        if (paginaInfo) {
            paginaInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        }
    }
}

// searchInput?.addEventListener('input', debounce(searchTable, 300));

// Update the table row generation in updateTable function
// Add these variables at the top of the file, after API_URL
const ITEMS_PER_PAGE = 15;
let currentPage = 1;

function updateTable(data) {
    const tbody = document.querySelector('#comunionTable tbody');
    if (!tbody) {
        console.error('No se encontró el cuerpo de la tabla!');
        return;
    }

    tbody.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedData = data.slice(start, end);

    if (paginatedData.length > 0) {
        paginatedData.forEach(comunion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">${comunion.libro || ''}</td>
                <td>${comunion.nombre_comulgante || ''}</td>
                <td>${formatDate(comunion.fecha_nacimiento, true) || ''}</td>
                <td class="text-center">${comunion.folio || ''}</td>
                <td class="text-center">${comunion.no_partida || ''}</td>
                <td>${comunion.nota || '-'}</td>
                <td class="text-center">
                    <button onclick="editComunion(${comunion.id})" class="edit-button">✏️</button>
                    <button onclick="deleteComunion(${comunion.id})" class="delete-button">🗑️</button>
                </td>
                <td class="text-center">
                    <button class="btn-constancia" data-id="${comunion.id}">📄</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update pagination controls
        const paginationDiv = document.querySelector('.pagination-info');
        if (paginationDiv) {
            paginationDiv.innerHTML = `
                <button id="anterior" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                <span>Página ${currentPage} de ${totalPages}</span>
                <button id="siguiente" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
            `;

            // Add pagination event listeners
            document.getElementById('anterior')?.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateTable(data);
                }
            });

            document.getElementById('siguiente')?.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateTable(data);
                }
            });
        }
    } else {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay datos registrados</td></tr>';
    }

    // Add constancia button listeners
    const constanciaButtons = tbody.querySelectorAll('.btn-constancia');
    constanciaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            if (id) {
                certificadoController.generarConstancia(id);
            }
        });
    });
}

async function loadComuniones(searchTerm = '') {
    try {
        mostrarCargando('Cargando registros de comuniones...');
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // First request to get total count
        const initialUrl = searchTerm 
            ? `${API_URL}/comuniones/?search=${encodeURIComponent(searchTerm)}`
            : `${API_URL}/comuniones/`;

        const initialResponse = await fetch(initialUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!initialResponse.ok) {
            throw new Error(`Error al cargar los datos: ${initialResponse.status}`);
        }

        const initialData = await initialResponse.json();
        const totalRecords = initialData.count;
        let allResults = [...initialData.results];

        // Fetch remaining pages if any
        if (initialData.next) {
            let nextUrl = initialData.next;
            while (nextUrl) {
                const pageResponse = await fetch(nextUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!pageResponse.ok) {
                    throw new Error(`Error al cargar los datos: ${pageResponse.status}`);
                }

                const pageData = await pageResponse.json();
                allResults = [...allResults, ...pageData.results];
                nextUrl = pageData.next;
            }
        }

        // Sort all collected data
        const sortedData = allResults.sort((a, b) => {
            // First sort by libro
            const libroA = parseInt(a.libro) || 0;
            const libroB = parseInt(b.libro) || 0;
            if (libroA !== libroB) {
                return libroA - libroB;
            }
            
            // If libro is equal, sort by folio
            const folioA = parseInt(a.folio) || 0;
            const folioB = parseInt(b.folio) || 0;
            if (folioA !== folioB) {
                return folioA - folioB;
            }
            
            // If folio is equal, sort by no_partida
            const partidaA = parseInt(a.no_partida) || 0;
            const partidaB = parseInt(b.no_partida) || 0;
            return partidaA - partidaB;
        });

        //console.log('Total records fetched:', allResults.length);
        updateTable(sortedData);
        ocultarCargando();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        ocultarCargando();
        alert('Error al cargar los datos. Por favor, intente nuevamente.');
    }
}

// Ejecutar solo una vez cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya se ha inicializado para evitar múltiples inicializaciones
    if (document.querySelector('#comunionForm[data-initialized="true"]')) {
        console.log('El formulario ya ha sido inicializado');
        return;
    }
    
    // Marcar el formulario como inicializado
    const form = document.getElementById('comunionForm');
    form.setAttribute('data-initialized', 'true');
    
    // Eliminar todos los event listeners existentes clonando el nodo
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Obtener la referencia actualizada al formulario
    const comunionForm = document.getElementById('comunionForm');
    comunionForm.setAttribute('data-initialized', 'true');
    
    // Agregar un único event listener al formulario
    comunionForm.addEventListener('submit', async function(e) {
    
    // Search input configuration
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.setAttribute('placeholder', 'Buscar por nombre...');
        searchInput.style.cssText = `
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
            width: 200px;
            font-size: 14px;
            margin: 10px 0;
        `;
        
        // Agregar el event listener directamente aquí y asegurarse de que funcione
        searchInput.addEventListener('input', function() {
            //console.log('Evento de búsqueda activado');
            const searchTerm = this.value.trim().toLowerCase();
            filtrarRegistros(searchTerm);
        });
    }

    // Modal elements and functions
    const modal = document.getElementById('comunionModal');
    const nuevoRegistroBtn = document.getElementById('nuevoRegistro');
    const cancelBtn = modal.querySelector('.cancel');

    function showModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('comunionForm').reset();
        document.getElementById('comunionForm').dataset.editId = '';
    }

    // Event listeners
    nuevoRegistroBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => event.target === modal && hideModal());
    document.addEventListener('keydown', (event) => event.key === 'Escape' && modal.style.display === 'block' && hideModal());

    // Add initial data load
    loadComuniones();  // Add this line to load data when page loads

    // Form submit handler - ONLY ONE EVENT LISTENER TO PREVENT DUPLICATES
    // Este código ya no se ejecutará porque hemos reemplazado el formulario y agregado un único listener arriba
    // const form = document.getElementById('comunionForm');
    // Remover cualquier event listener existente (no funciona directamente, pero es una buena práctica)
    // form.replaceWith(form.cloneNode(true));
    // Obtener la referencia actualizada después de clonar
    // const newForm = document.getElementById('comunionForm');
    // newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            fecha_comunion: document.getElementById('fechaComunion').value,
            nombre_comulgante: document.getElementById('nombre').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            nombre_padre: document.getElementById('nombrePadre').value,
            nombre_madre: document.getElementById('nombreMadre').value,
            padrino: document.getElementById('padrino').value,
            madrina: document.getElementById('madrina').value,
            no_partida: document.getElementById('noPartida').value,
            libro: document.getElementById('libro').value,
            folio: document.getElementById('folio').value,
            sacerdote: document.getElementById('parroco').value,
            nota: document.getElementById('nota').value || ''
        };
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
    
            const editId = this.dataset.editId;
            const url = editId 
                ? `${API_URL}/comuniones/${editId}/`
                : `${API_URL}/comuniones/`;
    
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Error al guardar el registro');
            }
    
            alert('Registro guardado exitosamente');
            hideModal();
            
            // Add delay before reloading data
            setTimeout(async () => {
                try {
                    await loadComuniones();
                } catch (loadError) {
                    console.error('Error al recargar datos:', loadError);
                }
            }, 500);
    
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el registro: ' + error.message);
        }
    }); // Close form submit handler

    // Add event listeners for Excel operations
    document.getElementById('descargarRegistro').addEventListener('click', downloadRegistros);
    
    document.getElementById('cargarRegistro').addEventListener('click', () => {
        document.getElementById('uploadExcel').click();
    });

    document.getElementById('uploadExcel').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (confirm('¿Está seguro de cargar estos registros? Esta acción no se puede deshacer.')) {
                uploadRegistros(file);
            }
            e.target.value = ''; // Reset file input
        }
    });
});

function searchTable() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    
    // Si el campo de búsqueda está vacío, mostrar todos los registros
    if (!filter) {
        updateTable(allData);
        hideSearchSuggestions();
        return;
    }
    
    // Filtrar los datos localmente por nombre
    const filteredData = allData.filter(comunion => {
        // Asegurarse de que nombre_comulgante existe y convertirlo a minúsculas
        const nombre = (comunion.nombre_comulgante || '').toLowerCase();
        // Verificar si el nombre incluye el filtro
        return nombre.includes(filter);
    });
    
    console.log('Término de búsqueda:', filter);
    console.log('Registros encontrados:', filteredData.length);
    
    // Actualizar la tabla con los datos filtrados
    currentPage = 1; // Resetear a la primera página al filtrar
    updateTable(filteredData);
    
    // Ocultar sugerencias después de realizar la búsqueda
    hideSearchSuggestions();
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function showSearchSuggestions(suggestions) {
    let suggestionsContainer = document.getElementById('searchSuggestions');
    
    // Crear el contenedor de sugerencias si no existe
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            background-color: white;
            border: 1px solid #ddd;
            border-top: none;
            z-index: 99;
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        `;
        
        const searchInput = document.getElementById('searchInput');
        const rect = searchInput.getBoundingClientRect();
        suggestionsContainer.style.top = `${rect.bottom}px`;
        suggestionsContainer.style.left = `${rect.left}px`;
        
        document.body.appendChild(suggestionsContainer);
    }
    
    // Limpiar sugerencias anteriores
    suggestionsContainer.innerHTML = '';
    
    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Mostrar sugerencias
    suggestionsContainer.style.display = 'block';
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.textContent = suggestion;
        item.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.addEventListener('click', () => {
            document.getElementById('searchInput').value = suggestion;
            loadComuniones(suggestion);
            hideSearchSuggestions();
        });
        item.addEventListener('mouseover', () => {
            item.style.backgroundColor = '#f1f1f1';
        });
        item.addEventListener('mouseout', () => {
            item.style.backgroundColor = 'white';
        });
        suggestionsContainer.appendChild(item);
    });
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Controlador unificado para certificados
const certificadoController = {
    generarConstancia: async function(id) {
        try {
            const respuesta = await fetchWithAuth(`${API_URL}/comuniones/${id}/`);
            const comunion = await respuesta.json();
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

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
            
            // Header
            doc.setFontSize(13);
            doc.text('PARROQUIA NUESTRA SEÑORA DE LOURDES', 105, 29, { align: 'center' });
            doc.text('TZAMPOJ - IXTAHUCAN - SOLOLÁ', 105, 35, { align: 'center' });
            doc.text('DIÓCESIS SOLOLÁ - CHIMALTENANGO', 105, 40, { align: 'center' });
            
            // Title
            doc.setFontSize(16);
            doc.setFont('times', 'bold');
            doc.text('CONSTANCIA DE PRIMERA COMUNIÓN', 105, 65, { align: 'center' });
            doc.setFont('times', 'normal');
            
            // Update the content section with new date formatting
            doc.setFontSize(12);
            doc.text('Certifico que: ', 20, 97);
            doc.setFont('times', 'bold');
            doc.text(`${comunion.nombre_comulgante},`, 44, 97);
            doc.setFont('times', 'normal');
            
            doc.text(`nacido(a) el ${formatearFecha(comunion.fecha_nacimiento)}, hijo(a) de: ${comunion.nombre_padre} y`, 20, 103);
            doc.text(`${comunion.nombre_madre}, recibió el Sacramento de la Primera Comunión en esta Parroquial`, 20, 109);
            doc.text(`el ${formatearFecha(comunion.fecha_comunion)}.`, 20, 115);
            
            // Registration data
            doc.text(`Según Registro:`, 20, 147);
            doc.text(`Libro: ${comunion.libro}, Folio: ${comunion.folio}, Partida: ${comunion.no_partida}`, 20, 153);
            doc.text(`Padrinos: ${comunion.padrino} y ${comunion.madrina}`, 20, 159);
            doc.text(`Ministro celebrante: ${comunion.sacerdote}`, 20, 165);
            doc.text(`Nota: ${comunion.nota || 'Sin notas marginales'}`, 20, 171);
            
            // Signature
            doc.text('F: _____________________', 105, 210, { align: 'center' });
            doc.text('Pbro. Julio César Calel Colaj', 105, 215, { align: 'center' });
            doc.text('Párroco', 105, 220, { align: 'center' });
            doc.text('Nuestra Señora de Lourdes – Tzampoj', 105, 225, { align: 'center' });
            doc.text('Diócesis de Sololá – Chimaltenango', 105, 230, { align: 'center' });
            
            // Footer with current date and time
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
    
            doc.setFontSize(12);
            doc.text("Esta constancia sirve para:_____________________________________", 20, 270);
            //doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${formatDateForDisplay(new Date())} a las ${new Date().toLocaleTimeString()}`, 20, 282);
            doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${formatearFecha(now)} a las ${hours}:${minutes}`, 20, 275);
            
            // Save PDF
            doc.save(`Constancia_Primera_Comunion_${comunion.nombre_comulgante}.pdf`);
            
        } catch (error) {
            console.error('Error al generar constancia:', error);
            alert('Error al generar la constancia');
        }
    }
};

document.querySelector('#comunionTable tbody').addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-constancia')) {
        const id = target.dataset.id;
        if (id) {
            certificadoController.generarConstancia(id);
        }
    }
});

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

document.querySelector('#comunionTable tbody').addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-constancia')) {
        const id = target.dataset.id;
        if (id) {
            certificadoController.generarConstancia(id);
        }
    }
});

async function downloadRegistros() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comuniones/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }

        const responseData = await response.json();
        const registros = responseData.results || [];

        // Format data for Excel
        const excelData = registros.map(record => ({
            'Libro': record.libro,
            'Folio': record.folio,
            'No. Partida': record.no_partida,
            'Nombre': record.nombre_comulgante,
            'Fecha de Nacimiento': formatDate(record.fecha_nacimiento),
            'Fecha de Comunión': formatDate(record.fecha_comunion),
            'Nombre del Padre': record.nombre_padre,
            'Nombre de la Madre': record.nombre_madre,
            'Padrino': record.padrino,
            'Madrina': record.madrina,
            'Sacerdote': record.sacerdote,
            'Nota': record.nota || ''
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 8 },  // Libro
            { wch: 8 },  // Folio
            { wch: 10 }, // No. Partida
            { wch: 30 }, // Nombre
            { wch: 15 }, // Fecha Nacimiento
            { wch: 15 }, // Fecha Comunión
            { wch: 30 }, // Nombre Padre
            { wch: 30 }, // Nombre Madre
            { wch: 25 }, // Padrino
            { wch: 25 }, // Madrina
            { wch: 25 }, // Sacerdote
            { wch: 40 }  // Nota
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Registros de Comuniones");

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Registros_Comuniones_${date}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);

    } catch (error) {
        console.error('Error al descargar registros:', error);
        alert('Error al descargar registros: ' + error.message);
    }
}

async function uploadRegistros(file) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        // Test server connection
        try {
            const testResponse = await fetch(`${API_URL}/comuniones`, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!testResponse.ok) {
                throw new Error('No se puede conectar al servidor');
            }
        } catch (error) {
            throw new Error('Error de conexión con el servidor');
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                let successCount = 0;
                let errorCount = 0;

                // Transform Excel data to match API format
                const formattedData = jsonData.map(row => ({
                    libro: parseInt(row['Libro']) || 0,
                    folio: parseInt(row['Folio']) || 0,
                    no_partida: parseInt(row['No. Partida']) || 0,
                    nombre_comulgante: (row['Nombre'] || '').toString().trim(),
                    fecha_nacimiento: row['Fecha de Nacimiento'] || '',
                    fecha_comunion: row['Fecha de Comunión'] || '',
                    nombre_padre: (row['Nombre del Padre'] || '').toString().trim(),
                    nombre_madre: (row['Nombre de la Madre'] || '').toString().trim(),
                    padrino: (row['Padrino'] || '').toString().trim(),
                    madrina: (row['Madrina'] || '').toString().trim(),
                    sacerdote: (row['Sacerdote'] || '').toString().trim(),
                    nota: (row['Nota'] || '').toString().trim()
                }));

                // Process each record
                for (const record of formattedData) {
                    try {
                        const response = await fetch(`${API_URL}/comuniones/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(record)
                        });

                        if (response.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    await loadComuniones();
                }
                alert(`Carga completada:\n${successCount} registros exitosos\n${errorCount} registros con error`);

            } catch (error) {
                console.error('Error al procesar archivo:', error);
                alert('Error al procesar el archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);

    } catch (error) {
        console.error('Error en la carga:', error);
        alert(error.message || 'Error en la carga del archivo');
    }
}

// Ejecutar solo una vez cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya se ha inicializado para evitar múltiples inicializaciones
    if (document.querySelector('#comunionForm[data-initialized="true"]')) {
        console.log('El formulario ya ha sido inicializado');
        return;
    }
    
    // Marcar el formulario como inicializado
    const form = document.getElementById('comunionForm');
    form.setAttribute('data-initialized', 'true');
    
    // Eliminar todos los event listeners existentes clonando el nodo
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Obtener la referencia actualizada al formulario
    const comunionForm = document.getElementById('comunionForm');
    comunionForm.setAttribute('data-initialized', 'true');
    
    // Agregar un único event listener al formulario
    comunionForm.addEventListener('submit', async function(e) {
    
    // Search input configuration
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.setAttribute('placeholder', 'Buscar por nombre...');
        searchInput.style.cssText = `
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
            width: 200px;
            font-size: 14px;
            margin: 10px 0;
        `;
        
        // Agregar el event listener directamente aquí y asegurarse de que funcione
        searchInput.addEventListener('input', function() {
            //console.log('Evento de búsqueda activado');
            const searchTerm = this.value.trim().toLowerCase();
            filtrarRegistros(searchTerm);
        });
    }

    // Modal elements and functions
    const modal = document.getElementById('comunionModal');
    const nuevoRegistroBtn = document.getElementById('nuevoRegistro');
    const cancelBtn = modal.querySelector('.cancel');

    function showModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('comunionForm').reset();
        document.getElementById('comunionForm').dataset.editId = '';
    }

    // Event listeners
    nuevoRegistroBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => event.target === modal && hideModal());
    document.addEventListener('keydown', (event) => event.key === 'Escape' && modal.style.display === 'block' && hideModal());

    // Add initial data load
    loadComuniones();  // Add this line to load data when page loads

    // Form submit handler - ONLY ONE EVENT LISTENER TO PREVENT DUPLICATES
    // Este código ya no se ejecutará porque hemos reemplazado el formulario y agregado un único listener arriba
    // const form = document.getElementById('comunionForm');
    // Remover cualquier event listener existente (no funciona directamente, pero es una buena práctica)
    // form.replaceWith(form.cloneNode(true));
    // Obtener la referencia actualizada después de clonar
    // const newForm = document.getElementById('comunionForm');
    // newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            fecha_comunion: document.getElementById('fechaComunion').value,
            nombre_comulgante: document.getElementById('nombre').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            nombre_padre: document.getElementById('nombrePadre').value,
            nombre_madre: document.getElementById('nombreMadre').value,
            padrino: document.getElementById('padrino').value,
            madrina: document.getElementById('madrina').value,
            no_partida: document.getElementById('noPartida').value,
            libro: document.getElementById('libro').value,
            folio: document.getElementById('folio').value,
            sacerdote: document.getElementById('parroco').value,
            nota: document.getElementById('nota').value || ''
        };
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
    
            const editId = this.dataset.editId;
            const url = editId 
                ? `${API_URL}/comuniones/${editId}/`
                : `${API_URL}/comuniones/`;
    
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Error al guardar el registro');
            }
    
            alert('Registro guardado exitosamente');
            hideModal();
            
            // Add delay before reloading data
            setTimeout(async () => {
                try {
                    await loadComuniones();
                } catch (loadError) {
                    console.error('Error al recargar datos:', loadError);
                }
            }, 500);
    
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el registro: ' + error.message);
        }
    }); // Close form submit handler

    // Add event listeners for Excel operations
    document.getElementById('descargarRegistro').addEventListener('click', downloadRegistros);
    
    document.getElementById('cargarRegistro').addEventListener('click', () => {
        document.getElementById('uploadExcel').click();
    });

    document.getElementById('uploadExcel').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (confirm('¿Está seguro de cargar estos registros? Esta acción no se puede deshacer.')) {
                uploadRegistros(file);
            }
            e.target.value = ''; // Reset file input
        }
    });
});

function searchTable() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    
    // Si el campo de búsqueda está vacío, mostrar todos los registros
    if (!filter) {
        updateTable(allData);
        hideSearchSuggestions();
        return;
    }
    
    // Filtrar los datos localmente por nombre
    const filteredData = allData.filter(comunion => {
        // Asegurarse de que nombre_comulgante existe y convertirlo a minúsculas
        const nombre = (comunion.nombre_comulgante || '').toLowerCase();
        // Verificar si el nombre incluye el filtro
        return nombre.includes(filter);
    });
    
    console.log('Término de búsqueda:', filter);
    console.log('Registros encontrados:', filteredData.length);
    
    // Actualizar la tabla con los datos filtrados
    currentPage = 1; // Resetear a la primera página al filtrar
    updateTable(filteredData);
    
    // Ocultar sugerencias después de realizar la búsqueda
    hideSearchSuggestions();
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function showSearchSuggestions(suggestions) {
    let suggestionsContainer = document.getElementById('searchSuggestions');
    
    // Crear el contenedor de sugerencias si no existe
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            background-color: white;
            border: 1px solid #ddd;
            border-top: none;
            z-index: 99;
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        `;
        
        const searchInput = document.getElementById('searchInput');
        const rect = searchInput.getBoundingClientRect();
        suggestionsContainer.style.top = `${rect.bottom}px`;
        suggestionsContainer.style.left = `${rect.left}px`;
        
        document.body.appendChild(suggestionsContainer);
    }
    
    // Limpiar sugerencias anteriores
    suggestionsContainer.innerHTML = '';
    
    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Mostrar sugerencias
    suggestionsContainer.style.display = 'block';
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.textContent = suggestion;
        item.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.addEventListener('click', () => {
            document.getElementById('searchInput').value = suggestion;
            loadComuniones(suggestion);
            hideSearchSuggestions();
        });
        item.addEventListener('mouseover', () => {
            item.style.backgroundColor = '#f1f1f1';
        });
        item.addEventListener('mouseout', () => {
            item.style.backgroundColor = 'white';
        });
        suggestionsContainer.appendChild(item);
    });
}

document.querySelector('#comunionTable tbody').addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-constancia')) {
        const id = target.dataset.id;
        if (id) {
            certificadoController.generarConstancia(id);
        }
    }
});

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

document.querySelector('#comunionTable tbody').addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-constancia')) {
        const id = target.dataset.id;
        if (id) {
            certificadoController.generarConstancia(id);
        }
    }
});

async function downloadRegistros() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comuniones/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }

        const responseData = await response.json();
        const registros = responseData.results || [];

        // Format data for Excel
        const excelData = registros.map(record => ({
            'Libro': record.libro,
            'Folio': record.folio,
            'No. Partida': record.no_partida,
            'Nombre': record.nombre_comulgante,
            'Fecha de Nacimiento': formatDate(record.fecha_nacimiento),
            'Fecha de Comunión': formatDate(record.fecha_comunion),
            'Nombre del Padre': record.nombre_padre,
            'Nombre de la Madre': record.nombre_madre,
            'Padrino': record.padrino,
            'Madrina': record.madrina,
            'Sacerdote': record.sacerdote,
            'Nota': record.nota || ''
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 8 },  // Libro
            { wch: 8 },  // Folio
            { wch: 10 }, // No. Partida
            { wch: 30 }, // Nombre
            { wch: 15 }, // Fecha Nacimiento
            { wch: 15 }, // Fecha Comunión
            { wch: 30 }, // Nombre Padre
            { wch: 30 }, // Nombre Madre
            { wch: 25 }, // Padrino
            { wch: 25 }, // Madrina
            { wch: 25 }, // Sacerdote
            { wch: 40 }  // Nota
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Registros de Comuniones");

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Registros_Comuniones_${date}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);

    } catch (error) {
        console.error('Error al descargar registros:', error);
        alert('Error al descargar registros: ' + error.message);
    }
}

async function uploadRegistros(file) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        // Test server connection
        try {
            const testResponse = await fetch(`${API_URL}/comuniones`, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!testResponse.ok) {
                throw new Error('No se puede conectar al servidor');
            }
        } catch (error) {
            throw new Error('Error de conexión con el servidor');
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                let successCount = 0;
                let errorCount = 0;

                // Transform Excel data to match API format
                const formattedData = jsonData.map(row => ({
                    libro: parseInt(row['Libro']) || 0,
                    folio: parseInt(row['Folio']) || 0,
                    no_partida: parseInt(row['No. Partida']) || 0,
                    nombre_comulgante: (row['Nombre'] || '').toString().trim(),
                    fecha_nacimiento: row['Fecha de Nacimiento'] || '',
                    fecha_comunion: row['Fecha de Comunión'] || '',
                    nombre_padre: (row['Nombre del Padre'] || '').toString().trim(),
                    nombre_madre: (row['Nombre de la Madre'] || '').toString().trim(),
                    padrino: (row['Padrino'] || '').toString().trim(),
                    madrina: (row['Madrina'] || '').toString().trim(),
                    sacerdote: (row['Sacerdote'] || '').toString().trim(),
                    nota: (row['Nota'] || '').toString().trim()
                }));

                // Process each record
                for (const record of formattedData) {
                    try {
                        const response = await fetch(`${API_URL}/comuniones/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(record)
                        });

                        if (response.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    await loadComuniones();
                }
                alert(`Carga completada:\n${successCount} registros exitosos\n${errorCount} registros con error`);

            } catch (error) {
                console.error('Error al procesar archivo:', error);
                alert('Error al procesar el archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);

    } catch (error) {
        console.error('Error en la carga:', error);
        alert(error.message || 'Error en la carga del archivo');
    }
}

// Ejecutar solo una vez cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya se ha inicializado para evitar múltiples inicializaciones
    if (document.querySelector('#comunionForm[data-initialized="true"]')) {
        console.log('El formulario ya ha sido inicializado');
        return;
    }
    
    // Marcar el formulario como inicializado
    const form = document.getElementById('comunionForm');
    form.setAttribute('data-initialized', 'true');
    
    // Eliminar todos los event listeners existentes clonando el nodo
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Obtener la referencia actualizada al formulario
    const comunionForm = document.getElementById('comunionForm');
    comunionForm.setAttribute('data-initialized', 'true');
    
    // Agregar un único event listener al formulario
    comunionForm.addEventListener('submit', async function(e) {
    
    // Search input configuration
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.setAttribute('placeholder', 'Buscar por nombre...');
        searchInput.style.cssText = `
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
            width: 200px;
            font-size: 14px;
            margin: 10px 0;
        `;
        
        // Agregar el event listener directamente aquí y asegurarse de que funcione
        searchInput.addEventListener('input', function() {
            //console.log('Evento de búsqueda activado');
            const searchTerm = this.value.trim().toLowerCase();
            filtrarRegistros(searchTerm);
        });
    }

    // Modal elements and functions
    const modal = document.getElementById('comunionModal');
    const nuevoRegistroBtn = document.getElementById('nuevoRegistro');
    const cancelBtn = modal.querySelector('.cancel');

    function showModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('comunionForm').reset();
        document.getElementById('comunionForm').dataset.editId = '';
    }

    // Event listeners
    nuevoRegistroBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => event.target === modal && hideModal());
    document.addEventListener('keydown', (event) => event.key === 'Escape' && modal.style.display === 'block' && hideModal());

    // Add initial data load
    loadComuniones();  // Add this line to load data when page loads

    // Form submit handler - ONLY ONE EVENT LISTENER TO PREVENT DUPLICATES
    // Este código ya no se ejecutará porque hemos reemplazado el formulario y agregado un único listener arriba
    // const form = document.getElementById('comunionForm');
    // Remover cualquier event listener existente (no funciona directamente, pero es una buena práctica)
    // form.replaceWith(form.cloneNode(true));
    // Obtener la referencia actualizada después de clonar
    // const newForm = document.getElementById('comunionForm');
    // newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            fecha_comunion: document.getElementById('fechaComunion').value,
            nombre_comulgante: document.getElementById('nombre').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            nombre_padre: document.getElementById('nombrePadre').value,
            nombre_madre: document.getElementById('nombreMadre').value,
            padrino: document.getElementById('padrino').value,
            madrina: document.getElementById('madrina').value,
            no_partida: document.getElementById('noPartida').value,
            libro: document.getElementById('libro').value,
            folio: document.getElementById('folio').value,
            sacerdote: document.getElementById('parroco').value,
            nota: document.getElementById('nota').value || ''
        };
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
    
            const editId = this.dataset.editId;
            const url = editId 
                ? `${API_URL}/comuniones/${editId}/`
                : `${API_URL}/comuniones/`;
    
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Error al guardar el registro');
            }
    
            alert('Registro guardado exitosamente');
            hideModal();
            
            // Add delay before reloading data
            setTimeout(async () => {
                try {
                    await loadComuniones();
                } catch (loadError) {
                    console.error('Error al recargar datos:', loadError);
                }
            }, 500);
    
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el registro: ' + error.message);
        }
    }); // Close form submit handler

    // Add event listeners for Excel operations
    document.getElementById('descargarRegistro').addEventListener('click', downloadRegistros);
    
    document.getElementById('cargarRegistro').addEventListener('click', () => {
        document.getElementById('uploadExcel').click();
    });

    document.getElementById('uploadExcel').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (confirm('¿Está seguro de cargar estos registros? Esta acción no se puede deshacer.')) {
                uploadRegistros(file);
            }
            e.target.value = ''; // Reset file input
        }
    });
});

function searchTable() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    
    // Si el campo de búsqueda está vacío, mostrar todos los registros
    if (!filter) {
        updateTable(allData);
        hideSearchSuggestions();
        return;
    }
    
    // Filtrar los datos localmente por nombre
    const filteredData = allData.filter(comunion => {
        // Asegurarse de que nombre_comulgante existe y convertirlo a minúsculas
        const nombre = (comunion.nombre_comulgante || '').toLowerCase();
        // Verificar si el nombre incluye el filtro
        return nombre.includes(filter);
    });
    
    console.log('Término de búsqueda:', filter);
    console.log('Registros encontrados:', filteredData.length);
    
    // Actualizar la tabla con los datos filtrados
    currentPage = 1; // Resetear a la primera página al filtrar
    updateTable(filteredData);
    
    // Ocultar sugerencias después de realizar la búsqueda
    hideSearchSuggestions();
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function showSearchSuggestions(suggestions) {
    let suggestionsContainer = document.getElementById('searchSuggestions');
    
    // Crear el contenedor de sugerencias si no existe
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            background-color: white;
            border: 1px solid #ddd;
            border-top: none;
            z-index: 99;
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        `;
        
        const searchInput = document.getElementById('searchInput');
        const rect = searchInput.getBoundingClientRect();
        suggestionsContainer.style.top = `${rect.bottom}px`;
        suggestionsContainer.style.left = `${rect.left}px`;
        
        document.body.appendChild(suggestionsContainer);
    }
    
    // Limpiar sugerencias anteriores
    suggestionsContainer.innerHTML = '';
    
    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Mostrar sugerencias
    suggestionsContainer.style.display = 'block';
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.textContent = suggestion;
        item.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.addEventListener('click', () => {
            document.getElementById('searchInput').value = suggestion;
            loadComuniones(suggestion);
            hideSearchSuggestions();
        });
        item.addEventListener('mouseover', () => {
            item.style.backgroundColor = '#f1f1f1';
        });
        item.addEventListener('mouseout', () => {
            item.style.backgroundColor = 'white';
        });
        suggestionsContainer.appendChild(item);
    });
}