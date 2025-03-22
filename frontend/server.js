const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde el directorio actual
app.use(express.static(__dirname));

// Manejar todas las rutas enviando el archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor frontend ejecutándose en el puerto ${PORT}`);
});