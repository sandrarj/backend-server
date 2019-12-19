var express = require('express');
var bcryptjs = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Usuario = require('../models/usuario');


//==========================
// Obtener todos los usuario
//==========================
app.get('/', (request, response) => {
    //Usuario.find({ }, (err, usuarios) =>{}

    Usuario.find({ }, 'nombre email img role ')
    .exec((err, usuarios) =>{
        if(err){
            //ERROR: Internal server
            return response.status(500).json({ 
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            })        
        }
        response.status(200).json({ 
            ok: true,
            usuarios: usuarios
        })
    })    
} );

//*********************** */
// verificar token
//********************** */
// app.use('/', (request,response,next) => {
//     var  token = request.query.token;
//     jwt.verify( token, SEED, (err, decoded) =>{
//         if(err){
//             //unauthorize
//             return response.status(401).json({
//                 ok:false,
//                 mensaje:'Token incorrecto',
//                 errors: err
//             })
//         }
//         next();
//     } );
// })

//==========================
//  crear nuevo usuario ( put - patch)
//==========================
app.put('/:id', mdAutenticacion.verificaToken, (request,response) => {
    var id= request.params.id;
    var body = request.body;

    Usuario.findById(id, (err, usuario) => {
        if( err ){
            response.status(500).json({ 
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            }); 
        }  

        if( !usuario ){
            response.status(400).json({ 
                ok: false,
                mensaje: 'El usuario con el id no existe',
                errors: {message: 'No existe el usuario'}
            }); 
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado ) => {
            if(err){
             // ERROR: bad request   
             response.status(400).json({ 
                 ok: false,
                 mensaje: 'Error al crear usuario',
                 errors: err
             }) 
            }
           usuarioGuardado.password = ':)';
           response.status(200).json({ 
            ok: true,
            usuario: usuarioGuardado
           })
       });
    })    
})

//==========================
//  crear nuevo usuario
//==========================
 app.post('/', mdAutenticacion.verificaToken ,(request, response) => {
    var body = request.body;
    var usuario = new Usuario({
         nombre: body.nombre,
         email: body.email,
         password: bcryptjs.hashSync( body.password, 10),
         img: body.img,
         role: body.role
     })
     
     usuario.save( (err, usuarioGuardado ) => {
         if(err){
          // ERROR: bad request   
          response.status(400).json({ 
              ok: false,
              mensaje: 'Error al crear usuario',
              errors: err
          }) 
         }
        response.status(201).json({ 
         ok: true,
         usuario: usuarioGuardado,
         usuarioTk : request.usuario
        })
        
    });
 });


//==========================
// borrar usuario por el id
//==========================

app.delete('/:id',mdAutenticacion.verificaToken,(request,response) => {
    var id = request.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if(err){
            // ERROR: bad request   
            response.status(400).json({ 
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            }) 
           }
        if( !usuarioBorrado ){
           response.status(400).json({ 
               ok: false,
               mensaje: 'No existe un usuario con ese id',
               errors: {message: 'No existe el usuario'}
            }); 
        }
        response.status(200).json({ 
           ok: true,
           usuario: usuarioBorrado
        })
    })
})





module.exports = app;