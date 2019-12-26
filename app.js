// Requires , libreria de terceros
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//inicializar
var app = express();


//parser application/a-www-form-urlencode
 app.use(bodyParser.urlencoded({ extended: false}));
 app.use(bodyParser.json());

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var medicoRoutes = require('./routes/medico');
var hospitalRoutes = require('./routes/hospital');
var busquedaRoutes = require('./routes/busqueda')

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err,res) =>{
    if( err ) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
});

//Rutas
app.use('/coleccion',busquedaRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario',usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/',appRoutes);

//escuchar peticiones
app.listen(3000, () => console.log('Express server listen puero 3000: \x1b[32m%s\x1b[0m','online'));

