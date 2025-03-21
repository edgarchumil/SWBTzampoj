document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const events = {
        // Ejemplo de eventos
        '2024-03-20': ['Misa Solemne - 10:00 AM', 'Bautizos - 11:30 AM'],
        '2024-03-25': ['Primera Comunión - 9:00 AM'],
    };

    let activities = {};

    async function fetchActivities() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8080/api/actividades/por_mes/?mes=${currentMonth + 1}&anio=${currentYear}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Error fetching activities');
            
            const data = await response.json();
            activities = data.reduce((acc, activity) => {
                const dateStr = new Date(activity.fecha).toISOString().split('T')[0];
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(activity);
                return acc;
            }, {});
            
            renderCalendar();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function showActivityForm(dateStr = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Nueva Actividad</h3>
                <form id="activityForm">
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" id="titulo" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción:</label>
                        <textarea id="descripcion" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Fecha y Hora:</label>
                        <input type="datetime-local" id="fecha" required>
                    </div>
                    <div class="form-group">
                        <label>Lugar:</label>
                        <input type="text" id="lugar" required>
                    </div>
                    <div class="form-group">
                        <label>Estado:</label>
                        <select id="estado">
                            <option value="programada">Programada</option>
                            <option value="en_curso">En Curso</option>
                            <option value="finalizada">Finalizada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Guardar</button>
                        <button type="button" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (dateStr) {
            const dateInput = document.getElementById('fecha');
            dateInput.value = dateStr + 'T00:00';
        }
        
        document.getElementById('activityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveActivity();
            modal.remove();
        });
    }

    // Update the createDayElement function
    function createDayElement(day) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        
        if (day) {
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            div.appendChild(dayNumber);
            
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (activities[dateStr]) {
                activities[dateStr].forEach(() => {
                    const indicator = document.createElement('div');
                    indicator.className = 'event-indicator';
                    div.appendChild(indicator);
                });
                
                div.addEventListener('click', () => showEvents(dateStr));
            } else {
                div.addEventListener('click', () => showActivityForm(dateStr));
            }
        }
        
        return div;
    }
    
    // Update the saveActivity function
    async function saveActivity() {
        try {
            const token = localStorage.getItem('token');
            const formData = {
                titulo: document.getElementById('titulo').value,
                descripcion: document.getElementById('descripcion').value,
                fecha: new Date(document.getElementById('fecha').value).toISOString(),
                lugar: document.getElementById('lugar').value,
                estado: document.getElementById('estado').value
            };
            
            const response = await fetch('http://127.0.0.1:8080/api/actividades/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Error saving activity');
            
            await fetchActivities();
            renderCalendar();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la actividad');
        }
    }
    
    // Update the fetchActivities function
    async function fetchActivities() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8080/api/actividades/por_mes/?mes=${currentMonth + 1}&anio=${currentYear}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Error fetching activities');
            
            const data = await response.json();
            activities = {};
            
            data.forEach(activity => {
                const dateStr = new Date(activity.fecha).toISOString().split('T')[0];
                if (!activities[dateStr]) activities[dateStr] = [];
                activities[dateStr].push(activity);
            });
            
            renderCalendar();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function showEvents(dateStr) {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';
        
        const dateTitle = document.createElement('h4');
        dateTitle.textContent = new Date(dateStr).toLocaleDateString('es', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        eventsList.appendChild(dateTitle);
        
        const addButton = document.createElement('button');
        addButton.textContent = '+ Nueva Actividad';
        addButton.className = 'add-activity-btn';
        addButton.onclick = () => showActivityForm(dateStr);
        eventsList.appendChild(addButton);
        
        if (activities[dateStr]) {
            activities[dateStr].forEach(activity => {
                const div = document.createElement('div');
                div.className = `event-item ${activity.estado}`;
                div.innerHTML = `
                    <h5>${activity.titulo}</h5>
                    <p>${activity.descripcion}</p>
                    <div class="event-details">
                        <span>📍 ${activity.lugar}</span>
                        <span>🕒 ${new Date(activity.fecha).toLocaleTimeString()}</span>
                        <span class="status-badge">${activity.estado}</span>
                    </div>
                `;
                eventsList.appendChild(div);
            });
        }
    }

    // Modify renderCalendar function
    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();

        document.getElementById('monthYear').textContent = 
            new Date(currentYear, currentMonth).toLocaleDateString('es', { month: 'long', year: 'numeric' });

        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        // Días vacíos antes del primer día del mes
        for (let i = 0; i < startingDay; i++) {
            calendarDays.appendChild(createDayElement(''));
        }

        // Días del mes
        for (let day = 1; day <= monthLength; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayElement = createDayElement(day);
            
            if (activities[dateStr]) {
                dayElement.classList.add('has-event');
                dayElement.addEventListener('click', () => showEvents(dateStr));
            }

            if (isToday(day)) {
                dayElement.classList.add('today');
            }

            calendarDays.appendChild(dayElement);
        }
    }

    function createDayElement(content) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.textContent = content;
        return div;
    }

    function isToday(day) {
        const today = new Date();
        return day === today.getDate() && 
               currentMonth === today.getMonth() && 
               currentYear === today.getFullYear();
    }

    function showEvents(dateStr) {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';
        
        if (events[dateStr]) {
            const dateTitle = document.createElement('h4');
            dateTitle.textContent = new Date(dateStr).toLocaleDateString('es', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            eventsList.appendChild(dateTitle);

            events[dateStr].forEach(event => {
                const div = document.createElement('div');
                div.className = 'event-item';
                div.textContent = event;
                eventsList.appendChild(div);
            });
        }
    }

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();
});