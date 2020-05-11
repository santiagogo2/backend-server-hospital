'use strict'
var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

// ============================================
// Obtener todos los usuarios
// ============================================
app.get('/', (req, res, next) => {
	Usuario.find({}, 'nombre apellidos img role') // Filtra los elementos del documento que se retornan en la petición
		   .exec((error, usuarios) => {
				if(error){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error cargando usuario',
						errors: error
					});
				}
				res.status(200).json({
					ok: true,
					usuarios
				});
	});
});

// ============================================
// Crear un nuevo usuario
// ============================================
app.post('/', (req, res) => {
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
			usuario
		});
	});
});

module.exports = app;