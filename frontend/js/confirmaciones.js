if (typeof API_URL === 'undefined') {
    const API_URL = 'http://localhost:8080/api';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarConfirmaciones();

    const searchInput = document.querySelector('input[type="text"]');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filtrarRegistros(searchTerm);
    });

    const modal = document.getElementById('confirmacionModal');
    const btnNuevoRegistro = document.getElementById('nuevoRegistro');
    const btnCancelar = document.querySelector('.cancel');
    const form = document.getElementById('confirmacionForm');

    // Marcar campos no obligatorios
    const camposOpcionales = ['padrino', 'madrina', 'nota'];
    camposOpcionales.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.removeAttribute('required');
        }
    });

    // Manejar el envío del formulario
    // Remove the first form submit event listener and keep only this one
    // In the form submit event listener
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const editId = form.dataset.editId;
            
            const datos = {
                fecha_confirmacion: formData.get('fecha_confirmacion'),
                nombre_confirmante: formData.get('nombre_confirmante'),
                fecha_nacimiento: formData.get('fecha_nacimiento'),
                nombre_padre: formData.get('nombre_padre'),
                nombre_madre: formData.get('nombre_madre'),
                padrino: formData.get('padrino') || '',
                madrina: formData.get('madrina') || '',
                libro: formData.get('libro'),
                folio: formData.get('folio'),
                no_partida: formData.get('no_partida'),
                sacerdote: formData.get('parroco'),
                nota: formData.get('nota') || ''
            };
    
            console.log('Modo:', editId ? 'Edición' : 'Nuevo registro');
            console.log('Datos a enviar al backend:', {
                ID: editId || 'Nuevo',
                Método: editId ? 'PUT' : 'POST',
                'Fecha de Confirmación': datos.fecha_confirmacion,
                'Nombre del Confirmante': datos.nombre_confirmante,
                'Fecha de Nacimiento': datos.fecha_nacimiento,
                'Nombre del Padre': datos.nombre_padre,
                'Nombre de la Madre': datos.nombre_madre,
                'Padrino': datos.padrino,
                'Madrina': datos.madrina,
                'Libro': datos.libro,
                'Folio': datos.folio,
                'No. Partida': datos.no_partida,
                'Sacerdote': datos.sacerdote,
                'Nota': datos.nota
            });
    
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado');
                window.location.href = 'login.html';
                return;
            }
    
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `${API_URL}/confirmaciones/${editId}/` : `${API_URL}/confirmaciones/`;
    
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            console.log('Detalles de la petición:', {
                url,
                method,
                headers,
                datos
            });

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error en la respuesta:', {
                    estado: response.status,
                    mensaje: response.statusText,
                    detalles: errorData
                });
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const resultado = await response.json();
            // console.log('Respuesta del servidor:', resultado);
            
            await cargarConfirmaciones();
            alert(editId ? 'Registro actualizado exitosamente' : 'Confirmación guardada exitosamente');
            form.dataset.editId = '';
            ocultarModal();
            form.reset();

        } catch (error) {
            // console.error('Error completo:', error);
            alert(error.message || 'Error al guardar la confirmación');
        }
    });

    btnNuevoRegistro.addEventListener('click', () => {
        mostrarModal();
    });

    // Keep only this cancel button event listener inside DOMContentLoaded
    btnCancelar.addEventListener('click', () => {
        form.dataset.editId = '';
        form.reset();
        ocultarModal();
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            ocultarModal();
        }
    });
});

// Add these functions after the existing code

async function editarConfirmacion(id) {
    try {
        // console.log('Iniciando edición de confirmación:', id);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/confirmaciones/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener los datos: ${response.status}`);
        }
        
        const confirmacion = await response.json();
        console.log('Datos obtenidos para editar:', confirmacion);

        const form = document.getElementById('confirmacionForm');
        form.fecha_confirmacion.value = confirmacion.fecha_confirmacion;
        form.nombre_confirmante.value = confirmacion.nombre_confirmante;
        form.fecha_nacimiento.value = confirmacion.fecha_nacimiento;
        form.nombre_padre.value = confirmacion.nombre_padre || '';
        form.nombre_madre.value = confirmacion.nombre_madre || '';
        form.padrino.value = confirmacion.padrino || '';
        form.madrina.value = confirmacion.madrina || '';
        form.libro.value = confirmacion.libro;
        form.folio.value = confirmacion.folio;
        form.no_partida.value = confirmacion.no_partida;
        form.parroco.value = confirmacion.sacerdote;
        form.nota.value = confirmacion.nota || '';

        form.dataset.editId = id;
        console.log('ID guardado para edición:', id);
        
        mostrarModal();
    } catch (error) {
        // console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos para editar');
    }
}

// Add reset handler for the cancel button
// Remove this duplicate event listener that's outside DOMContentLoaded
// btnCancelar.addEventListener('click', () => {
//     form.dataset.editId = '';
//     form.reset();
//     ocultarModal();
// });

function mostrarModal() {
    const modal = document.getElementById('confirmacionModal');
    const form = document.getElementById('confirmacionForm');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        if (!form.dataset.editId) {
            form.reset();
        }
    }
}

function ocultarModal() {
    const modal = document.getElementById('confirmacionModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

async function cargarConfirmaciones() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Token no encontrado, redirigiendo a login');
            window.location.href = 'login.html';
            return;
        }

        let allConfirmaciones = [];
        let nextUrl = `${API_URL}/confirmaciones/?limit=100`;
        //console.log('Obteniendo datos desde:', nextUrl);

        while (nextUrl) {
            const response = await fetch(nextUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Respuesta no válida:', {
                    estado: response.status,
                    mensaje: response.statusText,
                    detalles: errorData
                });
                throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            //console.log('Datos recibidos:', data);

            if (data.results && Array.isArray(data.results)) {
                allConfirmaciones = [...allConfirmaciones, ...data.results];
            }

            nextUrl = data.next;
        }

        //console.log('Total de registros cargados:', allConfirmaciones.length);

        // Ordenar por libro, folio y partida
        allConfirmaciones.sort((a, b) => {
            const libroA = parseInt(a.libro) || 0;
            const libroB = parseInt(b.libro) || 0;
            if (libroA !== libroB) return libroA - libroB;
            
            const folioA = parseInt(a.folio) || 0;
            const folioB = parseInt(b.folio) || 0;
            if (folioA !== folioB) return folioA - folioB;
            
            const partA = parseInt(a.no_partida) || 0;
            const partB = parseInt(b.no_partida) || 0;
            return partA - partB;
        });

        allData = allConfirmaciones;
        actualizarTabla(allConfirmaciones);

    } catch (error) {
        console.error('Error al cargar confirmaciones:', error);
        alert('Error al cargar los datos: ' + error.message);
        actualizarTabla([]);
    }
}

// Add these variables at the top of the file after API_URL
const ITEMS_PER_PAGE = 15;
let currentPage = 1;
let allData = [];

// Add these variables at the top of your file after API_URL
// Update the currentSort initialization
let currentSort = {
    column: 'libro',  // Changed from 'no_partida' to 'libro'
    direction: 'asc'
};

// Update the sortTable function
function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    allData.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Convert to numbers for numeric columns
        if (column === 'no_partida' || column === 'libro' || column === 'folio') {
            valueA = parseInt(valueA) || 0;
            valueB = parseInt(valueB) || 0;
        }

        const multiplier = currentSort.direction === 'asc' ? 1 : -1;
        return valueA > valueB ? multiplier : -multiplier;
    });

    // Update the UI
    const header = document.querySelector(`th[data-column="${column}"]`);
    if (header) {
        // Remove sort indicators from all headers
        document.querySelectorAll('th[data-column]').forEach(h => 
            h.textContent = h.textContent.replace(' ↑', '').replace(' ↓', '')
        );
        // Add sort indicator to current header
        header.textContent += currentSort.direction === 'asc' ? ' ↑' : ' ↓';
    }

    currentPage = 1;
    actualizarTabla(allData);
}

// Add this to the end of cargarConfirmaciones function, just before the catch block
    // Sort data by no_partida by default after loading
    sortTable('no_partida');

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for sortable columns
    const headers = document.querySelectorAll('th[data-column]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            sortTable(column);
            
            // Update sort indicators
            headers.forEach(h => h.textContent = h.textContent.replace(' ↑', '').replace(' ↓', ''));
            header.textContent += currentSort.direction === 'asc' ? ' ↑' : ' ↓';
        });
    });
});

// Modify the actualizarTabla function to add the sort header
function actualizarTabla(datos) {
    const tbody = document.querySelector('#confirmacionTable tbody');
    if (!tbody) {
        // console.error('No se encontró el elemento tbody');
        return;
    }

    allData = datos; // Store all data for pagination
    const totalPages = Math.ceil(datos.length / ITEMS_PER_PAGE);
    
    // Get paginated data
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = datos.slice(start, start + ITEMS_PER_PAGE);

    tbody.innerHTML = '';
    // console.log('Actualizando tabla con datos:', paginatedData);
    
    if (paginatedData && paginatedData.length > 0) {
        paginatedData.forEach(confirmacion => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="text-center">${confirmacion.libro || ''}</td>
                <td>${confirmacion.nombre_confirmante || ''}</td>
                <td>${formatearFecha(confirmacion.fecha_nacimiento)}</td>
                <td class="text-center">${confirmacion.folio || ''}</td>
                <td class="text-center">${confirmacion.no_partida || ''}</td>
                <td>${confirmacion.nota || '-'}</td>
                <td class="text-center">
                    <button onclick="editarConfirmacion(${confirmacion.id})" class="edit-button">✏️</button>
                    <button onclick="eliminarConfirmacion(${confirmacion.id})" class="delete-button">🗑️</button>
                </td>
                <td class="text-center">
                    <button onclick="generarConstancia(${confirmacion.id})" class="btn-constancia">📄</button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay registros disponibles</td></tr>';
    }

    // Update pagination controls
    actualizarControlesPaginacion(totalPages);
}

// Add this new function for pagination controls
function actualizarControlesPaginacion(totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = `
        <button onclick="cambiarPagina('anterior')" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${currentPage} de ${totalPages}</span>
        <button onclick="cambiarPagina('siguiente')" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
    `;
}

// Add this new function to handle page changes
function cambiarPagina(direccion) {
    if (direccion === 'anterior' && currentPage > 1) {
        currentPage--;
    } else if (direccion === 'siguiente' && currentPage < Math.ceil(allData.length / ITEMS_PER_PAGE)) {
        currentPage++;
    }
    actualizarTabla(allData);
}

// Modify the filtrarRegistros function to work with pagination
function filtrarRegistros(searchTerm) {
    const filteredData = allData.filter(confirmacion => 
        confirmacion.nombre_confirmante.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reset to first page when filtering
    actualizarTabla(filteredData);
}

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

function abrirModal() {
    const modal = document.getElementById('confirmacionModal');
    const form = document.getElementById('confirmacionForm');
    
    if (modal) {
        // Limpiar el formulario
        if (form) {
            form.reset();
            form.dataset.editId = '';
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Establecer el título del modal
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Nuevo Registro de Confirmación';
        }
    } else {
        console.error('No se encontró el modal de confirmación');
    }
}

// Add this function after the existing functions
async function eliminarConfirmacion(id) {
    try {
        if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
            return;
        }

        // console.log('Eliminando confirmación:', id);
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_URL}/confirmaciones/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // console.error('Error al eliminar:', errorData);
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        // console.log('Registro eliminado exitosamente');
        await cargarConfirmaciones();
        alert('Registro eliminado exitosamente');

    } catch (error) {
        // console.error('Error al eliminar la confirmación:', error);
        alert(error.message || 'Error al eliminar el registro');
    }
}

// Add this new function after the existing functions
function filtrarRegistros(searchTerm) {
    const tbody = document.querySelector('#confirmacionTable tbody');
    const rows = tbody.getElementsByTagName('tr');

    for (let row of rows) {
        const nombreCell = row.cells[1]; // Column with names
        if (nombreCell) {
            const nombre = nombreCell.textContent || nombreCell.innerText;
            const matchesSearch = nombre.toLowerCase().includes(searchTerm);
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

async function generarConstancia(id) {
    try {
        if (!window.jspdf) {
            throw new Error('La librería jsPDF no está cargada correctamente');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/confirmaciones/${id}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al obtener los datos');
        const confirmacion = await response.json();

        // Create new document with proper initialization
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

        // Configure PDF
        doc.setFont('times', 'normal');

        // Header
        doc.setFontSize(13);
        doc.text('PARROQUIA NUESTRA SEÑORA DE LOURDES', 105, 29, { align: 'center' });
        doc.text('TZAMPOJ - IXTAHUCAN - SOLOLÁ', 105, 35, { align: 'center' });
        doc.text('DIÓCESIS SOLOLÁ - CHIMALTENANGO', 105, 40, { align: 'center' });

        // Title
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text('CONSTANCIA DE CONFIRMACIÓN', 105, 65, { align: 'center' });
        doc.setFont('times', 'normal');

        // Content
        doc.setFontSize(12);
        doc.text('Certifico que: ', 20, 97);
        doc.setFont('times', 'bold');
        doc.text(`${confirmacion.nombre_confirmante},`, 44, 97);
        doc.setFont('times', 'normal');

        doc.text(`nacido(a) el ${formatearFecha(confirmacion.fecha_nacimiento)}, hijo(a) de: ${confirmacion.nombre_padre} y`, 20, 103);
        doc.text(`${confirmacion.nombre_madre}, recibió el Sacramento de la Confirmación en esta Parroquial`, 20, 109);
        doc.text(`el ${formatearFecha(confirmacion.fecha_confirmacion)}.`, 20, 115);

        // Registration data
        doc.text(`Según Registro:`, 20, 147);
        doc.text(`Libro: ${confirmacion.libro}, Folio: ${confirmacion.folio}, Partida: ${confirmacion.no_partida}`, 20, 153);
        doc.text(`Padrinos: ${confirmacion.padrino} y ${confirmacion.madrina}`, 20, 159);
        doc.text(`Ministro celebrante: ${confirmacion.sacerdote}`, 20, 165);
        doc.text(`Nota: ${confirmacion.nota || 'Sin notas marginales'}`, 20, 171);

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
        doc.text("Esta constancia sirve para:_____________________________________", 20, 263);
        //doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${formatDateForDisplay(new Date())} a las ${new Date().toLocaleTimeString()}`, 20, 282);
        doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${formatearFecha(now)} a las ${hours}:${minutes}`, 20, 268);

        // Save PDF
        // Save PDF with error handling
        try {
            doc.save(`Constancia_Confirmacion_${confirmacion.nombre_confirmante}.pdf`);
        } catch (pdfError) {
            console.error('Error al guardar PDF:', pdfError);
            throw new Error('Error al generar el documento PDF');
        }

    } catch (error) {
        // console.error('Error al generar constancia:', error);
        alert('Error al generar la constancia: ' + error.message);
    }
}

function descargarDatos() {
    if (!allData || allData.length === 0) {
        alert('No hay datos para descargar');
        return;
    }

    // Format data for Excel
    const excelData = allData.map(item => ({
        'Fecha de Confirmación': item.fecha_confirmacion,
        'Nombre del Confirmante': item.nombre_confirmante,
        'Fecha de Nacimiento': item.fecha_nacimiento,
        'Nombre del Padre': item.nombre_padre,
        'Nombre de la Madre': item.nombre_madre,
        'Padrino': item.padrino,
        'Madrina': item.madrina,
        'Libro': item.libro,
        'Folio': item.folio,
        'No. Partida': item.no_partida,
        'Sacerdote': item.sacerdote,
        'Nota': item.nota
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Confirmaciones");

    // Generate Excel file
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `confirmaciones_${fecha}.xlsx`);
}

async function cargarDatos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async function(e) {
        try {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const token = localStorage.getItem('token');
                    if (!token) {
                        window.location.href = 'login.html';
                        return;
                    }

                    let successful = 0;
                    let failed = 0;

                    for (const row of jsonData) {
                        try {
                            const confirmacionData = {
                                fecha_confirmacion: row['Fecha de Confirmación'],
                                nombre_confirmante: row['Nombre del Confirmante'],
                                fecha_nacimiento: row['Fecha de Nacimiento'],
                                nombre_padre: row['Nombre del Padre'],
                                nombre_madre: row['Nombre de la Madre'],
                                padrino: row['Padrino'] || '',
                                madrina: row['Madrina'] || '',
                                libro: row['Libro'],
                                folio: row['Folio'],
                                no_partida: row['No. Partida'],
                                sacerdote: row['Sacerdote'],
                                nota: row['Nota'] || ''
                            };

                            const response = await fetch(`${API_URL}/confirmaciones/`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(confirmacionData)
                            });

                            if (response.ok) {
                                successful++;
                            } else {
                                failed++;
                            }
                        } catch (error) {
                            failed++;
                        }
                    }

                    await cargarConfirmaciones();
                    alert(`Importación completada:\nRegistros exitosos: ${successful}\nRegistros fallidos: ${failed}`);

                } catch (error) {
                    alert('Error al procesar el archivo Excel: ' + error.message);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            alert('Error al leer el archivo: ' + error.message);
        }
    };

    input.click();
}

// Inicializar la página cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, inicializando página de confirmaciones');
    
    // Mostrar indicador de carga
    mostrarCargando('Cargando datos de confirmaciones...');
    
    // Verificar conexión al servidor
    const connected = await checkServerConnection();
    if (!connected) {
        ocultarCargando();
        displayError('No se pudo conectar al servidor. Verifique su conexión.');
        return;
    }
    
    // Configurar el buscador
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
    
    // Configurar el botón de cancelar en el modal
    const btnCancelar = document.querySelector('#confirmacionModal .cancel');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarModal);
    }
    
    // Configurar el formulario para guardar
    const form = document.getElementById('confirmacionesForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarConfirmacion();
        });
    }
    
    // Cargar las confirmaciones iniciales
    await loadConfirmaciones();
    
    // Ocultar indicador de carga
    ocultarCargando();
    
    // Configurar botones de paginación si existen
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (btnAnterior && btnSiguiente) {
        btnAnterior.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadConfirmaciones();
            }
        });
        
        btnSiguiente.addEventListener('click', () => {
            currentPage++;
            loadConfirmaciones();
        });
    }
});

// Función para mostrar indicador de carga
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
    
    // Guardar el intervalo para poder limpiarlo después
    loadingContainer.dataset.intervalId = interval;
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

// Función para cargar confirmaciones
async function loadConfirmaciones() {
    try {
        console.log('Cargando confirmaciones...');
        mostrarCargando('Cargando registros de confirmaciones...');
        
        const response = await fetch(`${API_URL}/confirmaciones/`, {
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
        
        let confirmacionesArray = [];
        
        // Verificar si los datos tienen el formato esperado (paginado)
        if (data && data.results && Array.isArray(data.results)) {
            console.log('Usando datos paginados, encontrados:', data.results.length, 'registros');
            confirmacionesArray = data.results;
        } else if (Array.isArray(data)) {
            console.log('Usando datos como array, encontrados:', data.length, 'registros');
            confirmacionesArray = data;
        } else {
            console.error('Los datos recibidos no tienen un formato válido:', data);
            displayError('Error al cargar los datos: formato de datos incorrecto');
            ocultarCargando();
            return;
        }
        
        // Filtrar los datos según el término de búsqueda
        if (searchTerm) {
            console.log('Filtrando por término de búsqueda:', searchTerm);
            confirmacionesArray = confirmacionesArray.filter(confirmacion => {
                const nombre = (confirmacion.nombre_confirmado || '').toLowerCase();
                return nombre.includes(searchTerm);
            });
            console.log('Registros después de filtrar:', confirmacionesArray.length);
        }

        // Mostrar los datos filtrados
        displayConfirmaciones(confirmacionesArray);
        ocultarCargando();

    } catch (error) {
        console.error('Error al cargar confirmaciones:', error);
        displayError('Error al cargar los datos: ' + error.message);
        ocultarCargando();
    }
}

// Función para verificar la conexión al servidor
async function checkServerConnection() {
    try {
        // En lugar de verificar un endpoint específico, simplemente verificamos
        // si podemos conectarnos al servidor base
        const response = await fetch(`${API_URL}/confirmaciones/`, {
            method: 'HEAD', // Solo verificamos si el endpoint existe, no necesitamos datos
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            },
            // Timeout de 5 segundos
            signal: AbortSignal.timeout(5000)
        }).catch(() => ({ ok: false }));
        
        return response.ok;
    } catch (error) {
        console.error('Error al verificar conexión:', error);
        return false;
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

// Función para manejar la búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    filtrarRegistros(searchTerm);
}

// Variable para almacenar el término de búsqueda
let searchTerm = '';

// Función para mostrar confirmaciones
function displayConfirmaciones(confirmaciones) {
    const tbody = document.querySelector('#confirmacionTable tbody');
    if (!tbody) {
        console.error('No se encontró el elemento tbody');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (confirmaciones && confirmaciones.length > 0) {
        confirmaciones.forEach(confirmacion => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="text-center">${confirmacion.libro || ''}</td>
                <td>${confirmacion.nombre_confirmante || ''}</td>
                <td>${formatearFecha(confirmacion.fecha_nacimiento)}</td>
                <td class="text-center">${confirmacion.folio || ''}</td>
                <td class="text-center">${confirmacion.no_partida || ''}</td>
                <td>${confirmacion.nota || '-'}</td>
                <td class="text-center">
                    <button onclick="editarConfirmacion(${confirmacion.id})" class="edit-button">✏️</button>
                    <button onclick="eliminarConfirmacion(${confirmacion.id})" class="delete-button">🗑️</button>
                </td>
                <td class="text-center">
                    <button onclick="generarConstancia(${confirmacion.id})" class="btn-constancia">📄</button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay registros disponibles</td></tr>';
    }
}