var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ==========================================
//  Verificar token
// ==========================================
exports.verificaToken = function(request,response,next){
    
    var token = request.query.token;
    jwt.verify(token, SEED, (err, decoded) =>{
        if(err){
            return response.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            })
        }
       request.usuario = decoded.usuario;
       next();
    //    response.status(200).json({
    //     ok: true,
    //     decoded: decoded
    // })
    })
      
};


// ==========================================
//  Verificar ADMIN
// ==========================================
exports.verificaADMIM_MismoUsuario = function(request,response,next){
    var usuario = request.usuario;
    var id = request.params.id;
    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id){
        next();
        return;
    }else{
        return response.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto- No es admin o no es el mismo usuario',
            errors: { message: 'No es administrador, no puede hecer eso'}
        })
    }      
};

// ==========================================
//  Verificar ADMIN
// ==========================================
exports.verificaADMIN_ROLE = function(req, res, next) {


    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });

    }


}