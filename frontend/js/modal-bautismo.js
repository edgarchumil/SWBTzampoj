// Funciones para el manejo del modal
function mostrarFormulario(bautismo = null) {
    if (!modalBautismo || !formBautismo) return;
    
    formBautismo.reset();
    if (bautismo) {
        Object.keys(bautismo).forEach(key => {
            const input = formBautismo.elements[key];
            if (input) {
                input.value = key === 'fechaNacimiento' ? 
                    bautismo[key].split('T')[0] : 
                    bautismo[key];
            }
        });
    }
    
    modalBautismo.style.display = 'block';
}

async function guardarBautismo(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesión no válida. Por favor, inicie sesión nuevamente.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const formData = new FormData(formBautismo);
        const datosBautismo = Object.fromEntries(formData.entries());

        const response = await fetch(ENDPOINTS.bautismos, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosBautismo)
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        alert('Registro guardado exitosamente');
        modalBautismo.style.display = 'none';
        formBautismo.reset();
        await cargarBautismos();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    }
}