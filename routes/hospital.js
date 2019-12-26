var express = require('express');
//middleware
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');

app.get('/', (req,resp) =>{
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(2)
    .populate('usuario','nombre email') 
    .exec((err, hospitales) =>{
        if(err){
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al obtener hospitales',
                error: err
            });
        }
        Hospital.count({}, (err, conteo) => {
            resp.status(200).json({
                ok: true,
                hospitales
            });
        })        
    });
});

//==========================
//  actualizar hospital  ( put - patch)
//==========================
app.put('/:id', (req,resp) => {
    var id= req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if(err){
            return resp.status(400).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                error: err
            });
        }
        if(!hospital){
            return resp.status(400).json({ 
                ok: false,
                mensaje: 'El hospital con el id no existe',
                errors: {message: 'No existe el hospital'}
            }); 
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario;
        //hospital.img = body.img;

        hospital.save( (err, hospitalGuardado) => {
            if(err){
                return resp.status(400).json({
                    ok: false,
                    mensaje: "Error al guardar hospital",
                    error: err
                });
            }
            resp.status(200).json({
                ok: true,
                hospitalGuardado
            })
        });

    });


});

// ==========================================
// Crear un nuevo hospital
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })
    hospital.save((err, hospitalGuardado) => {
        if(err){
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                error: err
            })
        }
        resp.status(201).json({
            ok: true,
            hospitalGuardado
        })
    });
});

// ============================================
//   Borrar un hospital por el id
// ============================================
app.delete('/:id',mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if(err){
            // ERROR: bad request   
            return resp.status(400).json({ 
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            }) 
           }
        if( !hospitalBorrado ){
           return resp.status(400).json({ 
               ok: false,
               mensaje: 'No existe un hospital con ese id',
               errors: {message: 'No existe el hospital'}
            }); 
        }
        resp.status(200).json({ 
           ok: true,
           hospitalBorrado
        })
    })
});

module.exports = app;