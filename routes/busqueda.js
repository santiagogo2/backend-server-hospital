'use strict'
var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ============================================
// Busqueda por colleción
// ============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
	var tabla = req.params.tabla;
	var busqueda = req.params.busqueda;

	var regex = new RegExp( busqueda, 'i' );

	var promesa;

	switch( tabla ){
		case 'hospitales':
			promesa = buscarHospitales( busqueda, regex );
			break;
		case 'medicos':
			promesa = buscarMedicos( busqueda, regex );
			break;
		case 'usuarios':
			promesa = buscarUsuarios( busqueda, regex );
			break;

		default:
			return res.status(400).json({
				ok: false,
				message: 'No existen tablas con el nombre: ' + tabla + '. Los tipos de busqueda solo son hospitales, medicos, usuarios',
				error: { message: 'Tipo de tabla/colección no válida' }
			});	
	}

	promesa.then( data => {
		res.status(200).json({
			ok: true,
			[tabla]: data
		});
	});
});

// ============================================
// Busqueda general
// ============================================
app.get('/todo/:busqueda', (req, res) => {
	var busqueda = req.params.busqueda;
	var regex = new RegExp( busqueda, 'i' );

	Promise.all([
		buscarHospitales( busqueda, regex ),
		buscarMedicos( busqueda, regex ),
		buscarUsuarios( busqueda, regex )
	]).then( respuestas => {
		res.status(200).json({
			ok: true,
			hospitales: respuestas[0],
			medicos: respuestas[1],
			usuarios: respuestas[2]
		});		
	});

});

function buscarHospitales( busqueda, regex ){
	return new Promise( (resolve, reject) => {
		Hospital.find({ nombre: regex })
				.populate('usuario', 'nombre apellidos email')
		        .exec((error, hospitals) => {
					if(error){
						reject('Error al cargar los hospitales', error);
					} else {
						resolve(hospitals);
					}
		});		
	})
}

function buscarMedicos( busqueda, regex ){
	return new Promise( (resolve, reject) => {
		Medico.find({ nombre: regex })
			  .populate('usuario', 'nombre apellidos email')
			  .populate('hospital')
			  .exec((error, doctors) => {
			if(error){
				reject('Error al cargar los hospitales', error);
			} else {
				resolve(doctors);
			}
		});		
	})
}

function buscarUsuarios( busqueda, regex ){
	return new Promise( (resolve, reject) => {
		Usuario.find({}, 'nombre apellidos email role')
			   .or([ { 'nombre': regex }, { 'apellido': regex }, { 'email': regex } ])
			   .exec((error, users) => {
					if(error){
						reject('Error al cargar los hospitales', error);
					} else {
						resolve(users);
					}
		});		
	})
}

module.exports = app;