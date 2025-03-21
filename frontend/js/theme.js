document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Aplicar tema inmediatamente
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.checked = theme === 'dark';
    }

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Escuchar cambios
    themeToggle.addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'dark' : 'light');
    });
});