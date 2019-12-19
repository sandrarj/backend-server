var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


var Usuario = require('../models/usuario');
var app = express();

app.post('/', (request,response) => {
    var body = request.body;
    console.log(body)
    Usuario.findOne({email: body.email},(err,usuarioDB) =>{
        if(err){
            response.status(500).json({ 
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })        
        }
        if( !usuarioDB){
           return response.status(400).json({
               ok: false,
               mensaje: 'Credenciales incorrectas - email',
               errors: err
           })
        }
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return response.status(400).json({
                ok: false,
                mensaje: ' Credenciales incorrectas - pass',
                errors: err
            })
        }
        // Crear token
        usuarioDB.password = ':)';
        var token = jwt.sign(
            { usuario: usuarioDB },
            SEED,
            { expiresIn: 14400 }
        );

        response.status(200).json({ 
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        })
    })
})



module.exports = app;