document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('comunionForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            fecha_comunion: document.getElementById('fecha_comunion').value,
            nombre_comulgante: document.getElementById('nombre_comulgante').value,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            libro: document.getElementById('libro').value,
            folio: document.getElementById('folio').value,
            partida: document.getElementById('partida').value,
            nombre_padre: document.getElementById('nombre_padre').value,
            nombre_madre: document.getElementById('nombre_madre').value,
            nombre_padrino: document.getElementById('nombre_padrino').value,
            nombre_madrina: document.getElementById('nombre_madrina').value,
            ministro: document.getElementById('ministro').value,
            nota_marginal: document.getElementById('nota_marginal').value
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/comuniones/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Registro guardado exitosamente');
                window.location.href = 'comuniones.html';
            } else {
                throw new Error('Error al guardar el registro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar el registro');
        }
    });
});