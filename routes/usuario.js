var express = require('express');
var bcryptjs = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Usuario = require('../models/usuario');



//=======================================
// Obtener todos los usuario paginados
//.skip(5)
//.limit(5)
//Usuario.count({})
//=======================================
app.get('/', (req, resp) => {
    var desde = req.query.desde || 0;
    //hardcodear
    desde= Number(desde);    
    Usuario.find({ }, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) =>{
        console.log('find usuarios')
        console.log(usuarios)
        if(err){
            //ERROR: Internal server
            return resp.status(500).json({ 
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            })        
        }
        Usuario.count({}, (err, conteo) => {
            resp.status(200).json({ 
                ok: true,
                usuarios: usuarios,
                total : conteo
            })    
        })
        
    })    
} );

//==========================
// Obtener todos los usuario
//==========================
// app.get('/', (req, resp) => {
//     //Usuario.find({ }, (err, usuarios) =>{}

//     Usuario.find({ }, 'nombre email img role ')
//     .exec((err, usuarios) =>{
//         if(err){
//             //ERROR: Internal server
//             return resp.status(500).json({ 
//                 ok: false,
//                 mensaje: 'Error cargando usuario',
//                 errors: err
//             })        
//         }
//         resp.status(200).json({ 
//             ok: true,
//             usuarios: usuarios
//         })
//     })    
// } );




//*********************** */
// verificar token
//********************** */
// app.use('/', (req,resp,next) => {
//     var  token = req.query.token;
//     jwt.verify( token, SEED, (err, decoded) =>{
//         if(err){
//             //unauthorize
//             return resp.status(401).json({
//                 ok:false,
//                 mensaje:'Token incorrecto',
//                 errors: err
//             })
//         }
//         next();
//     } );
// })

//==========================
//  actualizar usuario ( put - patch)
//==========================
app.put('/:id', mdAutenticacion.verificaToken, (req,resp) => {
    var id= req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if( err ){
            return resp.status(500).json({ 
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            }); 
        }  

        if( !usuario ){
            return resp.status(400).json({ 
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
             // ERROR: bad req   
             resp.status(400).json({ 
                 ok: false,
                 mensaje: 'Error al guardar usuario',
                 errors: err
             }) 
            }
           usuarioGuardado.password = ':)';
           resp.status(200).json({ 
            ok: true,
            usuario: usuarioGuardado
           })
       });
    })    
})

//==========================
//  crear nuevo usuario
//==========================
 //app.post('/', mdAutenticacion.verificaToken ,(req, resp) => {
app.post('/', (req, resp) => {
    var body = req.body;
    var usuario = new Usuario({
         nombre: body.nombre,
         email: body.email,
         password: bcryptjs.hashSync( body.password, 10),
         img: body.img,
         role: body.role
     })
     
     usuario.save( (err, usuarioGuardado ) => {
         if(err){
          // ERROR: bad req   
          return resp.status(400).json({ 
              ok: false,
              mensaje: 'Error al crear usuario',
              errors: err
          }) 
         }
        resp.status(201).json({ 
         ok: true,
         usuario: usuarioGuardado,
         usuarioTk : req.usuario
        })
        
    });
 });


//==========================
// borrar usuario por el id
//==========================

app.delete('/:id',mdAutenticacion.verificaToken,(req,resp) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if(err){
            // ERROR: bad req   
            return resp.status(400).json({ 
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            }) 
           }
        if( !usuarioBorrado ){
           return resp.status(400).json({ 
               ok: false,
               mensaje: 'No existe un usuario con ese id',
               errors: {message: 'No existe el usuario'}
            }); 
        }
        resp.status(200).json({ 
           ok: true,
           usuario: usuarioBorrado
        })
    })
})





module.exports = app;