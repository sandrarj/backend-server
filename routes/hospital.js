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
    .limit(5)
    .populate('usuario','nombre email') 
    .exec((err, hospitales) =>{
        console.log('find hospitales')
        console.log(hospitales)
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
                total: conteo,
                hospitales
            });
        })        
    });
});

//====================================
// Obtener hospital por ID 
//====================================
app.get('/:id', (req, res) => {
    console.log('get:id hosptal.js')
    var id= req.params.id;
    Hospital.findById(id)
    .populate('usuario','nombre img email')
    .exec( (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        }
        console.log(hospital)
        if( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje:'El hospital con el id' +id+' no existe!',
                errors: {  mensaje: 'No existe un hospital con ese ID'}
            })
        }

        res.status(200).json({
            ok: true,
            hospital
        })

    })
})

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
        console.log(hospital)
        hospital.save( (err, hospital) => {
            if(err){
                return resp.status(400).json({
                    ok: false,
                    mensaje: "Error al guardar hospital",
                    error: err
                });
            }
            resp.status(200).json({
                ok: true,
                hospital
            })
            console.log(hospital)
        });

    });


});

// ==========================================
// Crear un nuevo hospital
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
//app.post('/', (req, resp) => {   
    console.log('post body') 
    console.log(req.body)
    console.log(req.usuario)

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })
    console.log(hospital)

    hospital.save((err, hospitalGuardado) => {
        if(err){
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                error: err
            })
        }
       return resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado
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