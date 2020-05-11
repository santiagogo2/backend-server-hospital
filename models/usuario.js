var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
	values: ['ADMIN_ROLE', 'USER_ROLE'],
	message: '{VALUE} no es un role permitido'
}

var usuarioSchema = new Schema({
	nombre: { type: String, required: [true, 'El nombre es necesario'] },
	apellidos: { type: String, required: [true, 'Los apellidos son requeridos'] },
	email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
	password: { type: String, required: [true, 'La contraseña es necesaria'] },
	role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único' } ); // El PATH se usa para referirse a la propiedad cuando se tienen varios unique

module.exports = mongoose.model('Usuario', usuarioSchema);