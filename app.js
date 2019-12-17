// Requires , libreria de terceros
var express = require('express');
var mongoose = require('mongoose');

//inicializar
var app = express();

//escuchar peticiones
app.listen(3000, () => console.log('Express server listen puero 3000: \x1b[32m%s\x1b[0m','online'));

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err,res) =>{
    if( err ) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
});

//Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({ 
        ok: true,
        mensaje: 'Petición realizada correctamente'
    })
} )
