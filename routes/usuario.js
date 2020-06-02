'use strict'
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Usuario = require('../models/usuario');

// ============================================
// Obtener todos los usuarios
// ============================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde); // Se debe validar esta información o no va a pasar el código

	Usuario.find({}, 'nombre apellidos email img role') // Filtra los elementos del documento que se retornan en la petición
		   .skip(desde)
		   .limit(5)
		   .exec((error, usuarios) => {
				if(error){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error cargando usuario',
						errors: error
					});
				}

				Usuario.count({}, (error, total) => {
					if(error){
						return res.status(500).json({
							ok: false,
							mensaje: 'Error en el conteo de los usuarios',
							errors: error
						});
					}

					res.status(200).json({
						ok: true,
						total,
						usuarios,
					});
				});
	});
});

// ============================================
// Crear un nuevo usuario
// ============================================
app.post('/', mdAuthentication.tokenVerification, (req, res) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		apellidos: body.apellidos,
		email: body.email,
		password: bcrypt.hashSync( body.password, 10 ),
		img: body.img,
		role: body.role
	});

	usuario.save( (error, savedUser) => {
		if(error){
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear el usuario',
				errors: error
			});
		}
		res.status(201).json({
			ok: true,
			usuario,
			authenticatedUser: req.usuario 
		});
	});
});

// ============================================
// Actualizar usuario
// ============================================
app.put('/:id', (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Usuario.findById( id, (error, userFinded) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar usuario',
				errors: error
			});
		}

		if(!userFinded){
			return res.status(400).json({
				ok: false,
				message: 'El usuario con el id ' + id + ' no existe',
				errors: { message: 'No existe un usuario con ese ID' }
			});
		}

		userFinded.nombre = body.nombre;
		userFinded.apellidos = body.apellidos;
		userFinded.email = body.email;
		userFinded.role = body.role;

		userFinded.save( (error, userSaved) => {
			if(error){
				return res.status(400).json({
					ok: false,
					message: 'Error al actualizar el usuario',
					errors: error
				});
			}

			userSaved.password = ">:)";

			res.status(200).json({
				ok: true,
				userSaved
			});
		});

	});
});

// ============================================
// Eliminar usuario
// ============================================
app.delete('/:id', (req, res) => {
	var id = req.params.id;

	Usuario.findByIdAndRemove( id, (error, userDeleted) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar usuario',
				errors: error
			});
		}

		if(!userDeleted){
			return res.status(400).json({
				ok: false,
				message: 'El usuario con el id ' + id + ' no existe',
				errors: { message: 'No existe un usuario con ese ID' }
			});
		}

		res.status(200).json({
			ok: true,
			userDeleted
		});
	});
});

module.exports = app;