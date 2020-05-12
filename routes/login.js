var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// ============================================
// Login de usuario
// ============================================
app.post('/', (req, res) => {
	var body = req.body;

	Usuario.findOne({ email: body.email }, (error, userDB) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar usuarios',
				errors: error
			});
		}

		if(!userDB){
			return res.status(400).json({
				ok: false,
				message: 'Credenciales incorrectas - email',
				errors: error
			});
		}

		if( !bcrypt.compareSync( body.password, userDB.password ) ){
			return res.status(400).json({
				ok: false,
				message: 'Credenciales incorrectas - password',
				errors: error
			});
		}

		userDB.password = ">:)";

		// Crear un token
		var token = jwt.sign({ usuario: userDB }, SEED,{ expiresIn: 14400 }); //4 horas
		res.status(200).json({
			ok: true,
			userDB,
			token,
			id: userDB._id
		});
	});
});

module.exports = app;