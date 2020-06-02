var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ============================================
// Login de usuario autenticación normal
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

// ============================================
// Login de usuario autenticación de google
// ============================================
async function verify( token ) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	// const userid = payload['sub'];
	// If request specified a G Suite domain:
	// const domain = payload['hd'];
	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	}
}

app.post('/google', async(req, res) => { // Se debe definir una función async para que funcione el await dentro de la ruta

	let token = req.body.token;
	let googleUser = await verify(token)
				.catch( error => {
					return res.status(403).json({
						ok: false,
						message: 'Token inválido'
					});
				});

	Usuario.findOne( { email: googleUser.email }, (error, userDB) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar el usuario',
				errors: error
			});
		}

		if( userDB ){
			if( userDB.google === false ){
				return res.status(500).json({
					ok: false,
					message: 'Debe usar su autenticación normal',
				});
			} else {
				var token = jwt.sign({ usuario: userDB }, SEED,{ expiresIn: 14400 }); //4 horas

				res.status(200).json({
					ok: true,
					userDB,
					token,
					id: userDB._id
				});				
			}
		} else {
			// El usuario no existe, hay que crearlo
			var usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.apellidos = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = '>:)';

			usuario.save( (error, userSaved) => {

				if(error){
					return res.status(400).json({
						ok: false,
						mensaje: 'Error al crear el usuario',
						errors: error
					});
				}
				
				var token = jwt.sign({ usuario: userSaved }, SEED,{ expiresIn: 14400 }); //4 horas

				res.status(200).json({
					ok: true,
					userSaved,
					token,
					id: userSaved._id
				});
			});
		}
	} )

});

module.exports = app;