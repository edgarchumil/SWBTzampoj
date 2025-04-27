document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // Verificar si config está definido
    if (typeof config === 'undefined') {
        console.warn('La configuración centralizada no está disponible, usando valores por defecto');
        var config = {
            apiUrl: 'http://localhost:8080/api',
            endpoints: {
                auth: '/auth/login'
            }
        };
    }

    // Verificar si ya hay una sesión activa y redirigir al dashboard
    if (verificarSesion()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            mostrarError('Por favor complete todos los campos');
            return;
        }

        try {
            console.log('Intentando login con:', { email, password });
            // Usar la función getApiUrl que asegura que la URL termine con barra diagonal
            const authUrl = getApiUrl('auth');
            console.log('URL de autenticación:', authUrl);
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                // Guardar datos de sesión
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', email);
                localStorage.setItem('lastActivity', new Date().getTime());
                localStorage.setItem('sessionStart', new Date().getTime());
                
                // Redirigir al dashboard
                window.location.href = 'dashboard.html';
            } else {
                mostrarError(data.message || 'Credenciales inválidas');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor');
        }
    });

    function mostrarError(mensaje) {
        if (errorMessage) {
            errorMessage.textContent = mensaje;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('show');
            
            setTimeout(() => {
                errorMessage.classList.remove('show');
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 300);
            }, 5000);
        }
    }
});