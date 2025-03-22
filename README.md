# Sistema Web Parroquia Nuestra Señora de Lourdes

## Configuración de la Base de Datos en Render.com

### Pasos para crear la instancia de base de datos

1. **Crear una cuenta en Render.com**
   - Regístrate en [Render.com](https://render.com) si aún no tienes una cuenta.

2. **Crear una base de datos PostgreSQL**
   - En el Dashboard de Render, haz clic en "New" y selecciona "PostgreSQL".
   - Configura tu base de datos:
     - **Name**: parroquia-db (o el nombre que prefieras)
     - **Database**: parroquia
     - **User**: parroquia_user (o el usuario que prefieras)
     - **Region**: Oregon (o la región más cercana a tus usuarios)
     - **Plan**: Free
   - Haz clic en "Create Database".

3. **Obtener la URL de conexión**
   - Una vez creada la base de datos, Render te proporcionará una URL de conexión (Internal Database URL).
   - Esta URL tiene el formato: `postgres://usuario:contraseña@host:puerto/nombre_db`
   - Guarda esta URL, la necesitarás para configurar tu aplicación.

4. **Desplegar el backend**
   - En el Dashboard de Render, haz clic en "New" y selecciona "Web Service".
   - Conecta tu repositorio de GitHub.
   - Configura el servicio:
     - **Name**: SistemaWebParroquia-backend
     - **Environment**: Python
     - **Root Directory**: backend
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`
   - En la sección "Environment Variables", agrega:
     - `DATABASE_URL`: La URL de conexión que obtuviste en el paso anterior
     - `DJANGO_SECRET_KEY`: Una clave secreta aleatoria
     - `DJANGO_DEBUG`: False
     - `ALLOWED_HOSTS`: .onrender.com,localhost,127.0.0.1
   - Haz clic en "Create Web Service".

5. **Desplegar el frontend**
   - En el Dashboard de Render, haz clic en "New" y selecciona "Web Service".
   - Conecta tu repositorio de GitHub.
   - Configura el servicio:
     - **Name**: SistemaWebParroquia-frontend
     - **Environment**: Static Site
     - **Root Directory**: frontend
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Haz clic en "Create Web Service".

6. **Migrar la base de datos**
   - Una vez desplegado el backend, puedes ejecutar las migraciones desde la consola de Render:
     ```
     python manage.py migrate
     ```

7. **Crear un superusuario**
   - Crea un superusuario para acceder al panel de administración:
     ```
     python manage.py createsuperuser
     ```

### Notas importantes

- La configuración en `settings.py` está preparada para usar SQLite en desarrollo local y PostgreSQL en producción.
- Asegúrate de que las variables de entorno estén correctamente configuradas en Render.
- Para probar localmente con PostgreSQL, puedes instalar PostgreSQL en tu máquina y configurar la variable de entorno `DATABASE_URL`.

### Solución de problemas

- Si encuentras errores de conexión, verifica que la URL de la base de datos sea correcta.
- Asegúrate de que los paquetes `dj-database-url` y `psycopg2-binary` estén instalados.
- Revisa los logs de Render para identificar posibles errores durante el despliegue.