'use strict'
var express = require('express');

var app = express();
var mdAuthentication = require('../middlewares/authentication');

var Hospital = require('../models/hospital');

// ============================================
// Obtener todos los hospitales
// ============================================
app.get('/', (req, res) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({})
			.skip(desde)
			.limit(5)
			.populate('usuario', 'nombre apellidos email')
			.exec((error, hospitals) => {
				if(error){
					return res.status(500).json({
						ok: false,
						message: 'Error cargando los hospitales',
						errors: error
					});
				}
				if(!hospitals || hospitals == ''){
					return res.status(400).json({
						ok: false,
						message: 'No existen hospitales en la base de datos',
						errors: error
					});
				}
				Hospital.count({}, (error, total) => {
					if(error){
						return res.status(500).json({
							ok: false,
							mensaje: 'Error en el conteo de los hospitales',
							errors: error
						});
					}
					
					res.status(200).json({
						ok: true,
						total,
						hospitals
					});
				})
	});
});

// ============================================
// Agregar un nuevo hospital
// ============================================
app.post('/', mdAuthentication.tokenVerification, (req, res) => {
	var body = req.body;

	var hospital = new Hospital({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id
	});

	hospital.save( (error, hospitalSaved) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al crear el hospitales',
				errors: error
			});
		}
		res.status(200).json({
			ok: true,
			hospitalSaved
		});
	});

});

// ============================================
// Actualizar un hospital
// ============================================
app.put('/:id', mdAuthentication.tokenVerification, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Hospital.findById( id, (error, hospitalFinded) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar el hospitales',
				errors: error
			});
		}

		if(!hospitalFinded){
			return res.status(400).json({
				ok: false,
				message: 'El hospital con el id ' + id + ' no existe',
				errors: { message: 'No existe un hospital con ese ID' }
			});
		}

		hospitalFinded.nombre = body.nombre;
		if(body.img) hospitalFinded.img = body.img;
		hospitalFinded.usuario = req.usuario._id;

		hospitalFinded.save( (error, hospitalSaved) => {
			if(error){
				return res.status(400).json({
					ok: false,
					message: 'Error al actualizar el hospital',
					errors: error
				});
			}

			res.status(200).json({
				ok: true,
				hospitalSaved
			});
		});
	});
});

// ============================================
// Eliminar hospitales
// ============================================
app.delete('/:id', mdAuthentication.tokenVerification, (req, res) => {
	var id = req.params.id;

	Hospital.findByIdAndRemove( id, (error, hospitalDeleted) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar el hospital',
				errors: error
			});
		}

		if(!hospitalDeleted){
			return res.status(400).json({
				ok: false,
				message: 'El hospital con el id ' + id + ' no existe',
				errors: { message: 'No existe un hospital con ese ID' }
			});
		}

		res.status(200).json({
			ok: true,
			hospitalDeleted
		});
	});
});

module.exports = app;