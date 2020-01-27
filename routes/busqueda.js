var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//******************************
// Busqueda general
//****************************** 
app.get('/todo/:busqueda', (req, resp) => {
    console.log('buscar todo')
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all(
        [buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)]
    ).then( respuestas =>{
        resp.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        })
    })     
})

function buscarHospitales( busqueda, regex){
    return new Promise( (resolve, reject) => {
        //paginar
        Hospital.find({nombre: regex })
        .populate('usuario','nombre email img')
        .exec( (err,hospitales) => {
            if(err){
                reject('Error al cargar hospitales', err);
            }else {
                resolve( hospitales)
            }
        })       
    })
}

function buscarMedicos( busqueda, regex){
    return new Promise( (resolve, reject) => {
        //paginar
        Medico.find({nombre: regex })
        .populate('usuario',' nombre email')
        .populate('hospital',' img ')
        .exec( (err,medicos) => {
            if(err){
                reject('Error al cargar medicos', err);
            }else {
                resolve( medicos)
            }
        })       
    })
}

function buscarUsuarios( busqueda, regex){
    return new Promise( (resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
        .or([ {'nombre': regex}, {'email': regex}])
        .exec({nombre: regex }, (err,medicos) => {
            if(err){
                reject('Error al cargar medicos', err);
            }else {
                resolve( medicos)
            }
        })        
    })
}

//************************
// busqueda por colecion
//************************
app.get('/coleccion/:tabla/:busqueda', (req, resp, next)=>{
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'hospitales':
            promesa =  buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: {
                    menasaje: 'Tipo de tabla / colleccion no validos'
                }
            })
            break;
    }
    promesa.then( respuesta => {
        resp.status(200).json({
            ok: true,
            [tabla]:respuesta
        })
    })
    


});

// buscarHospitales(busqueda, regex)
    // .then( hospitales =>{
    //     resp.status(200).json({
    //         ok: true,
    //         hospitales
    //     })
    // })
    // Hospital.find({nombre: regex}, (err, hospitales) => {
    //     resp.status(200).json({
    //         ok: true,
    //         hospitales
    //     })
 // }) 
 
//  function buscarusuarios( busqueda, regex){
//     return new Promise( (resolve, reject) => {
//         Medico.find({nombre: regex }, (err,medicos) => {
//             if(err){
//                 reject('Error al cargar medicos', err);
//             }else {
//                 resolve( medicos)
//             }
//         })       
//     })
// }


module.exports = app;