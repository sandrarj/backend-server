var moongose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = moongose.Schema;

var hospitalSchema = Schema({
    nombre: { type: String, required:[true, 'El nombre es necesario']},
    usuario: { type: Schema.Types.ObjectId, ref:'Usuario'},
    img: { type: String, required:false}
},{collection:'hospitales'});
//usuarioSchema.plugin( uniqueValidator, { message: 'El {PATH} debe ser único'})
module.exports = moongose.model('Hospital', hospitalSchema);