var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

app.use(fileUpload());

app.put('/:tipo/:id',(req, resp) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //tipos de colecciones
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if( tiposValidos.indexOf(tipo) < 0){
        return resp.status(400).json({
            ok: false,
            mensaje: 'Tipo no válid',
            errors : {mensaje: 'Los tipos válidas son: '+ tiposValidas.join(', ')}
        })
    }
    
    if( !req.files ){
        return resp.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        })
    }
    //obtener archivo seleccionado
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1];
    
    //solo extensiones válidas
    var extensionValidas = ['png','jpeg','jpg','gif'];
    if( extensionValidas.indexOf( extensionArchivo) < 0){
        return resp.status(400).json({
            ok: false,
            mensaje: 'Extensiones no válidas',
            errors : {mensaje: 'Las extensiones válidas son: '+ extensionValidas.join(', ')}
        })
    }
    //nombre de archivo personalizado
    //var d= new Date().getMilliseconds
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;
    //mover el archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;   

    archivo.mv(path, err =>{
        if( err ){
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors : err
            })
        }
    });

    subirPorTipo( tipo, id, nombreArchivo, resp);    
   
})

function subirPorTipo( tipo, id, nombreArchivo, res){
    switch ( tipo ) {
        case 'usuarios':         
        {
            Usuario.findById(id, (err, usuario) => {
                if( ! usuario ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no encontrado',
                        errors: err
                    })
                }
                // validar si existe una img en el usuario
                var pathViejo = './upload/usuarios/'+ usuario.img;
                if( fs.existsSync(pathViejo)){
                    //eliminar el archivo si existe
                    fs.unlink(pathViejo);
                }
                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    if( ! usuarioActualizado ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'usuario no actualizado',
                            errors: err
                        })
                    }
                    return res.status(200).json({
                        ok: true,
                        mensaje:'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    })    
                });
            });       
        }break;
        case 'medicos': {
            Medico.findById(id, (err, medico) => {
                if( ! medico ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Medico no encontrado',
                        errors: err
                    })
                }
                // validar si existe ima img en el usuario
                var pathViejo = './upload/medicos/'+ medico.img;
                if( fs.existsSync(pathViejo)){
                    //eliminar el archivo si existe
                    fs.unlink(pathViejo);
                }
                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    if( err ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'medico no actualizado',
                            errors: err
                        })
                    }
                    return res.status(200).json({
                        ok: true,
                        mensaje:'Imagen de médico actualizada',
                        medico: medicoActualizado
                    })    
                });
            }); 
        }break;
        case 'hospitales':{
            Hospital.findById(id, (err, hospital) => {
                if( ! hospital ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no encontrado',
                        errors: err
                    })
                }
                // validar si existe ima img en el usuario
                var pathViejo = './upload/hospitales/'+ hospital.img;
                if( fs.existsSync(pathViejo)){
                    //eliminar el archivo si existe
                    fs.unlink(pathViejo);
                }
                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    if( err ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Hospital no actualizado',
                            errors: err
                        })
                    }
                    return res.status(200).json({
                        ok: true,
                        mensaje:'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    })    
                });
            }); 
        }break;
        default:
            break;
    }
}

app.get('/', function(req, res) {
    res.status(200).json({ 
        ok: true,
        mensaje:' Conectado con upload'
    })   
});
module.exports = app;