// Usar la configuración centralizada de config.js
if (typeof config === 'undefined') {
    console.warn('La configuración centralizada no está disponible, usando valores por defecto');
    var config = {
        apiUrl: 'http://localhost:8080/api',
        endpoints: {
            bautismos: '/bautismos'
        }
    };
}

// Definir API_URL como variable global
var API_URL = config.apiUrl;

const ITEMS_PER_PAGE = 15;
let currentPage = 1;

document.getElementById('nuevoRegistro').addEventListener('click', abrirModal);
document.querySelector('#bautismoModal .cancel').addEventListener('click', cerrarModal);
document.getElementById('bautismoForm').addEventListener('submit', guardarBautismo);
document.getElementById('descargarRegistro').addEventListener('click', downloadRegistros);



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

async function loadBautismosTable() {

    // Mostrar indicador de carga
    //mostrarCargando('Cargando datos de matrimonios...');


    try {
        mostrarCargando('Cargando registros de bautismos...');
        //console.log('Iniciando carga de datos de bautismos...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No se encontró el token de autenticación');
            throw new Error('Token de autenticación no encontrado');
        }

        //console.log('Realizando petición al servidor...');
        const response = await fetch(`${API_URL}/bautismos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error(`Error en la respuesta del servidor: ${response.status} - ${response.statusText}`);
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        // In the loadBautismosTable function, add this sorting before creating the table rows:
        const data = await response.json();
        
        // Sort the data by libro, folio, and noPartida
        data.sort((a, b) => {
            // First compare by libro
            if (a.libro !== b.libro) {
                return parseInt(a.libro) - parseInt(b.libro);
            }
            // If libro is the same, compare by folio
            if (a.folio !== b.folio) {
                return parseInt(a.folio) - parseInt(b.folio);
            }
            // If folio is the same, compare by noPartida
            return parseInt(a.noPartida) - parseInt(b.noPartida);
        });

        // Calculate pagination
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedData = data.slice(start, end);

        const tableBody = document.querySelector('#bautismoTable tbody');
        tableBody.innerHTML = '';

        // Render only paginated data (remove the previous data.forEach)
        // Update the row generation in loadBautismosTable
        paginatedData.forEach(bautismo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">${bautismo.libro}</td>
                <td>${bautismo.nombre}</td>
                <td>${formatearFecha(bautismo.fechaNacimiento)}</td>
                <td class="text-center">${bautismo.folio}</td>
                <td class="text-center">${bautismo.noPartida}</td>
                <td class="text-center">${bautismo.estaCasado === true ? 'Sí' : 'No'}</td>
                <td>${bautismo.nota || ' - '}</td>
                <td class="text-center">
                    <button onclick="editBautismo(${bautismo.id})" class="edit-button">✏️</button>
                    <button onclick="deleteBautismo(${bautismo.id})" class="delete-button">🗑️</button>
                </td>
                <td class="text-center">
                    <button class="btn-constancia" data-id="${bautismo.id}">📄</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Create pagination controls
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        paginationContainer.innerHTML = `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
        `;

        // Add pagination controls after the table
        const table = document.querySelector('#bautismoTable');
        if (table.nextElementSibling?.className === 'pagination') {
            table.nextElementSibling.remove();
        }
        table.after(paginationContainer);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        //console.error('Error al cargar los datos de bautismos:', error.message);
        //alert(`Error al cargar los datos de bautismos: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar autenticación con todas las opciones predeterminadas
    if (!inicializarAutenticacion()) {
        return; // Si la autenticación falla, detener la ejecución
    }
    
    loadBautismosTable();
});

function abrirModal(isEditing = false) {
    const modal = document.getElementById('bautismoModal');
    modal.style.display = 'block';
    if (!isEditing) {
        document.getElementById('bautismoForm').reset();
    }
}

function cerrarModal() {
    const modal = document.getElementById('bautismoModal');
    modal.style.display = 'none';
}

// Manejar el envío del formulario
async function editBautismo(id) {
    try {
        mostrarCargando('Cargando datos del registro...');
        const token = localStorage.getItem('token');
        console.log('Obteniendo datos para editar bautismo ID:', id);
        
        const response = await fetch(`${API_URL}/bautismos/${id}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener el registro: ${response.status}`);
        }

        const bautismo = await response.json();
        console.log('Datos recibidos para editar:', bautismo);
        
        // Llenar el formulario con los datos existentes
        const form = document.getElementById('bautismoForm');
        
        // Asignar valores a los campos
        form.elements['fechaBautismo'].value = bautismo.fechaBautismo || '';
        form.elements['nombre'].value = bautismo.nombre || '';
        form.elements['fechaNacimiento'].value = bautismo.fechaNacimiento || '';
        form.elements['nombrePadre'].value = bautismo.nombrePadre || '';
        form.elements['nombreMadre'].value = bautismo.nombreMadre || '';
        form.elements['padrino'].value = bautismo.padrino || '';
        form.elements['madrina'].value = bautismo.madrina || '';
        form.elements['libro'].value = bautismo.libro || '';
        form.elements['folio'].value = bautismo.folio || '';
        form.elements['noPartida'].value = bautismo.noPartida || '';
        form.elements['sacerdote'].value = bautismo.parroco || '';
        form.elements['estaCasado'].checked = bautismo.estaCasado || false;
        form.elements['nota'].value = bautismo.nota || '';

        // Guardar el ID del registro que se está editando
        form.dataset.editId = id;
        
        // Abrir el modal sin resetear el formulario
        abrirModal(true);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error al cargar el registro para editar:', error);
        mostrarMensajeError('Error al cargar el registro: ' + error.message);
    }
}

// Modificar la función guardarBautismo para manejar tanto creación como edición
async function guardarBautismo(event) {
    event.preventDefault();
    
    try {
        mostrarCargando('Guardando registro...');
        const formData = new FormData(event.target);
        const editId = event.target.dataset.editId;
        
        //console.log(editId ? 'Actualizando registro existente...' : 'Creando nuevo registro...');
        
        const bautismoData = {
            fechaBautismo: formData.get('fechaBautismo'),
            nombre: formData.get('nombre'),
            fechaNacimiento: formData.get('fechaNacimiento'),
            nombrePadre: formData.get('nombrePadre'),
            nombreMadre: formData.get('nombreMadre'),
            padrino: formData.get('padrino'),
            madrina: formData.get('madrina'),
            libro: formData.get('libro'),
            folio: formData.get('folio'),
            noPartida: formData.get('noPartida'),
            parroco: formData.get('sacerdote'),
            estaCasado: formData.get('estaCasado') === 'on',
            nota: formData.get('nota')
        };

        const token = localStorage.getItem('token');
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API_URL}/bautismos/${editId}/` : `${API_URL}/bautismos/`;

        //console.log(`Enviando petición ${method} a ${url}`);
        //console.log('Datos a enviar:', bautismoData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bautismoData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(editId ? 
                'Error al actualizar el registro. Por favor, intente nuevamente.' : 
                'Error al guardar el registro. Por favor, intente nuevamente.'
            );
        }

        const mensaje = editId ? 
            'El registro se ha actualizado correctamente' : 
            'El nuevo registro se ha guardado correctamente';
        
        cerrarModal();
        await loadBautismosTable(); // Esperar a que se carguen los datos
        alert(mensaje); // Mostrar mensaje después de que todo esté listo
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error en la operación:', error);
        alert('Error: ' + error.message);
    }
}

// Eliminar la función mostrarMensajeExito ya que no la necesitamos
// Simplificar la función mostrarMensajeError
function mostrarMensajeError(mensaje) {
    alert('Error: ' + mensaje);
}

// Event Listeners

async function deleteBautismo(id) {
    try {
        mostrarCargando('Eliminando registro...');
        const confirmDelete = confirm('¿Está seguro que desea eliminar este registro?');
        
        if (!confirmDelete) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${API_URL}/bautismos/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar el registro (${response.status})`);
        }

        // Show success message first
        alert('Registro eliminado satisfactoriamente');

        // Then reload the table
        await loadBautismosTable();
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error en la operación de eliminación:', error);
        alert('Error: ' + error.message);
    }
}

// Add after the existing event listeners
function searchTable() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const tableBody = document.querySelector('#bautismoTable tbody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const nameCell = row.getElementsByTagName('td')[1]; // Index 1 is the name column
        if (nameCell) {
            const nameText = nameCell.textContent || nameCell.innerText;
            if (nameText.toLowerCase().indexOf(filter) > -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
}

// Add this event listener
document.getElementById('searchInput').addEventListener('keyup', searchTable);


// Add after the search function
// Add this helper function for date formatting
function formatearFecha(fecha) {
    if (!fecha) return '';
    //console.log('Fecha a formatear:', fecha, typeof fecha);

    try {
        // Ensure we're working with a string
        fecha = fecha.toString();
        
        // If date is already in the desired format, return it
        if (fecha.includes(' de ')) {
            return fecha;
        }

        // Parse the date based on expected format YYYY-MM-DD
        const [year, month, day] = fecha.split('-');
        
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        // JavaScript months are 0-based, so subtract 1 from the month
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = months[monthIndex];

        return `${parseInt(day, 10)} de ${monthName} de ${year}`;
    } catch (error) {
        console.error('Error formatting date:', fecha, error);
        return fecha; // Return original if formatting fails
    }
}

async function generarConstancia(id) {
    try {
        mostrarCargando('Generando constancia...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bautismos/${id}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del registro');
        }

        const bautismo = await response.json();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add logo
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
        doc.text('CONSTANCIA DE BAUTISMO', 105, 65, { align: 'center' });
        doc.setFont('times', 'normal');

        // Content
        doc.setFontSize(12);
        doc.text('Certifico que: ', 20, 97);
        doc.setFont('times', 'bold');
        doc.text(`${bautismo.nombre},`, 44, 97);
        doc.setFont('times', 'normal');

        doc.text(`nacido(a) el ${formatearFecha(bautismo.fechaNacimiento)}, hijo(a) de: ${bautismo.nombrePadre} y`, 20, 103);
        doc.text(`${bautismo.nombreMadre}, recibió el Sacramento del Bautismo en esta Parroquial`, 20, 109);
        doc.text(`el ${formatearFecha(bautismo.fechaBautismo)}.`, 20, 115);

        // Registration data
        doc.text('Según Registro:', 20, 147);
        doc.text(`Libro: ${bautismo.libro}, Folio: ${bautismo.folio}, Partida: ${bautismo.noPartida}`, 20, 153);
        doc.text(`Padrinos: ${bautismo.padrino} y ${bautismo.madrina}`, 20, 159);
        doc.text(`Ministro celebrante: ${bautismo.parroco}`, 20, 165);
        doc.text(`Nota: ${bautismo.nota || 'Sin notas marginales'}`, 20, 171);

        // Signature
        doc.text('F: _____________________', 105, 210, { align: 'center' });
        doc.text('Pbro. Julio César Calel Colaj', 105, 215, { align: 'center' });
        doc.text('Párroco', 105, 220, { align: 'center' });
        doc.text('Nuestra Señora de Lourdes – Tzampoj', 105, 225, { align: 'center' });
        doc.text('Diócesis de Sololá – Chimaltenango', 105, 230, { align: 'center' });

        // Update the footer section in generarConstancia function
        // Footer
        const now = new Date();
        const day = now.getDate();
        const month = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ][now.getMonth()];
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        doc.setFontSize(12);
        doc.text("Esta constancia sirve para:_____________________________________", 20, 270);
        doc.text(`Extendido en: Tzampoj, Santa Catarina Ixtahuacan, Sololá, ${day} de ${month} de ${year} a las ${hours}:${minutes}`, 20, 275);

        // Save PDF
        doc.save(`Constancia_Bautismo_${bautismo.nombre}.pdf`);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error al generar la constancia:', error);
        alert('Error al generar la constancia: ' + error.message);
    }
}

// Add event listener for certificate buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-constancia')) {
        const id = e.target.dataset.id;
        generarConstancia(id);
    }
});

// Add this function at the end of the file
function changePage(newPage) {
    currentPage = newPage;
    loadBautismosTable();
}

async function uploadRegistros(file) {
    try {
        mostrarCargando('Cargando registros desde Excel...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        // Verificar conexión con el servidor antes de procesar
        try {
            const testResponse = await fetch(`${API_URL}/bautismos`, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!testResponse.ok) {
                throw new Error('No se puede conectar al servidor');
            }
        } catch (error) {
            throw new Error('Error de conexión con el servidor. Verifique que el servidor esté activo.');
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
                    noPartida: parseInt(row['No. Partida']) || 0,
                    nombre: (row['Nombre'] || '').toString().trim(),
                    fechaNacimiento: row['Fecha de Nacimiento'] || '',
                    fechaBautismo: row['Fecha de Bautismo'] || '',
                    nombrePadre: (row['Nombre del Padre'] || '').toString().trim(),
                    nombreMadre: (row['Nombre de la Madre'] || '').toString().trim(),
                    padrino: (row['Padrino'] || '').toString().trim(),
                    madrina: (row['Madrina'] || '').toString().trim(),
                    parroco: (row['Sacerdote'] || '').toString().trim(),
                    estaCasado: row['Está Casado'] === 'Sí',
                    nota: (row['Nota'] || '').toString().trim()
                }));

                // Process each record
                for (const record of formattedData) {
                    try {
                        const response = await fetch(`${API_URL}/bautismos/`, {
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
                            const errorText = await response.text();
                            console.error('Error en el registro:', errorText);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error('Error al procesar registro:', error);
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    await loadBautismosTable();
                }
                alert(`Carga completada:\n${successCount} registros exitosos\n${errorCount} registros con error`);

            } catch (error) {
                console.error('Error detallado:', error);
                alert('Error al procesar el archivo Excel: Verifique el formato del archivo');
            }
        };
        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            alert('Error al leer el archivo: Verifique que el archivo sea válido');
        };
        reader.readAsArrayBuffer(file);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error en la carga:', error);
        alert(error.message || 'Error en la carga del archivo');
    }
}

// Add these event listeners
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

// Add this function to handle downloads
async function downloadRegistros() {
    try {
        mostrarCargando('Preparando descarga de registros...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bautismos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }

        const data = await response.json();

        // Sort data by libro, folio, and noPartida
        data.sort((a, b) => {
            if (a.libro !== b.libro) return a.libro - b.libro;
            if (a.folio !== b.folio) return a.folio - b.folio;
            return a.noPartida - b.noPartida;
        });

        // Format data for Excel
        const excelData = data.map(record => ({
            'Libro': record.libro,
            'Folio': record.folio,
            'No. Partida': record.noPartida,
            'Nombre': record.nombre,
            'Fecha de Nacimiento': record.fechaNacimiento,
            'Fecha de Bautismo': record.fechaBautismo,
            'Nombre del Padre': record.nombrePadre,
            'Nombre de la Madre': record.nombreMadre,
            'Padrino': record.padrino,
            'Madrina': record.madrina,
            'Sacerdote': record.parroco,
            'Está Casado': record.estaCasado ? 'Sí' : 'No',
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
            { wch: 15 }, // Fecha Bautismo
            { wch: 30 }, // Nombre Padre
            { wch: 30 }, // Nombre Madre
            { wch: 25 }, // Padrino
            { wch: 25 }, // Madrina
            { wch: 25 }, // Sacerdote
            { wch: 10 }, // Está Casado
            { wch: 40 }  // Nota
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Registros de Bautismos");

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Registros_Bautismos_${date}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);
        ocultarCargando();
    } catch (error) {
        ocultarCargando();
        console.error('Error al descargar registros:', error);
        alert('Error al descargar registros: ' + error.message);
    }
}

// Add event listener for download button
