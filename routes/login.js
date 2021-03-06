var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
//Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID); 


var Usuario = require('../models/usuario');
var app = express();



//****************************/
// Autenticación de google
//***************************/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }


app.post('/google', async (req,res) =>{
    var token = req.body.token;
    var googleUser = await verify(token).catch(
        e => {
            res.status(403).json({
                ok: false,
                mensaje: 'token no valido'
            })
        } 
    );
    //validoar si el usuario se autentico previamente
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if(err){ //error de BD
            res.status(500).json({ 
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })        
        }
        if( usuarioDB ){
            //se creo por google = true ,si ya viene autenticado de la BD = false
            if( usuarioDB.google === false ){
                res.status(400).json({ 
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: err
                })  
            } else {
                // Crear token
                //usuarioDB.password = ':)';
                var token = jwt.sign(
                    { usuario: usuarioDB },
                    SEED,
                    { expiresIn: 14400 }
                );

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                })
            }
        } else  {
            //el usuario no existe hay que crearlo
            console.log('creando un nuevo usuario en la bd')
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err, usuarioDB => {
                 // Crear token
                 var token = jwt.sign(
                     { usuario: usuarioDB },
                     SEED,
                     { expiresIn: 14400 }
                 );
 
                 res.status(200).json({
                     ok: true,
                     usuario: usuarioDB,
                     token: token,
                     id: usuarioDB._id,
                     menu: obtenerMenu(usuarioDB.role)
                 })
            }))
        }
    });

    // return res.status(200).json({ 
    //     ok: true,
    //     mensaje: 'Google responde Ok !!!',
    //     googleUser
    // })
});

//****************************/
// Autenticación normal
//***************************/
app.post('/', (request,response) => {
    var body = request.body;
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
                mensaje: ' Credenciales incorrectas - xxx',
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
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        })
    })
})

//**************** */
// opciones del menu
//**************** */
function obtenerMenu( ROLE ){

    var menu = [
        { 
          titulo: 'principal' , 
          icono:'mdi mdi-gauge', 
          submenu: [ 
            { 
              titulo:'Dashboard',
              url:'/dashboard'
            },
            { 
              titulo:'Progress',
              url:'/progress'
            },
            { 
              titulo:'Graficas',
              url:'/graficas1'
            },
            { 
              titulo:'Promesas',
              url:'/promesas'
            },
            { 
              titulo:'rxjs',
              url:'/rxjs'
            }       
          ]
        },
        { 
          titulo:'Mantenimiento',
          icono:'mdi mdi-folder-lock-open',
          submenu: [
           // {titulo: 'Usuarios', url:'/usuarios'},
            {titulo: 'Hospitales', url:'/hospitales'},
            {titulo: 'Médicos', url:'/medicos'}
          ]
        }
      ];

      if( ROLE === 'ADMIN_ROLE' ){
          console.log(ROLE)
          menu[1].submenu.unshift({titulo: 'Usuarios', url:'/usuarios'});
      }
    return menu

  }





module.exports = app;