var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Medico = require('../models/medico');

//==========================
// Obtener todos los usuario
//==========================
app.get('/', (req,resp) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})    
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec((err, medicos) => {
        if(err){
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al lsitar medicos',
                error: err
            })
        }
        Medico.count({}, (err, conteo) => {
            resp.status(200).json({ 
                ok: true,
                medicos,
                total : conteo
            })    
        })
    })       
});

//==========================
//  actualizar médico  ( put - patch)
//==========================
app.put('/:id',mdAutenticacion.verificaToken, (req,resp) => {
    var id= req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if(err){
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el médico',
                error: er
            });
        }

        if( !medico ){
            return resp.status(400).json({ 
                ok: false,
                mensaje: 'El médico con el id no existe',
                errors: {message: 'No existe el medico'}
            }); 
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        //medico.img = body.img;

        medico.save( (err, medicoGuardado) => {
            if(err){
                return resp.json({
                    ok: false,
                    mensaje:  'error al crear un medico',
                    error : err
                })
            }
            resp.status(200).json({
                ok: true,
                medicoGuardado
            });    
        });
        

    });

   
});

// ==========================================
// Crear un nuevo médico
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;
    var usuario = req.usuario;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: usuario,
        hospital: body.hospital
    })
    medico.save((err, medicoGuardado) => {
        if(err){
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                error: err
            })
        }
        resp.status(201).json({
            ok: true,
            medicoGuardado
        })
    });
});

// ============================================
//   Borrar un medico por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {    
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if(err){
            return resp.status(400).json({
                ok: false,
                mensaje: "Error al borrar médico",
                error: err
            })
        }

        if( !medicoBorrado ){
            return resp.status(400).json({ 
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errors: {message: 'No existe el médico'}
             }); 
         }

        resp.status(200).json({
            ok: true,
            medicoBorrado
        });

    });
});

module.exports = app;