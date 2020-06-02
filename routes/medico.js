var express = require('express');

var app = express();
var mdAuthentication = require('../middlewares/authentication');

var Medico = require('../models/medico');

// ============================================
// Obtener todos los médicos
// ============================================
app.get('/', (req, res) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Medico.find({})
		  .skip(desde)
		  .limit(5)
		  .populate('usuario', 'nombre apellidos email img')
		  .populate('hospital')
		  .exec((error, doctor) => {
				if(error){
					return res.status(500).json({
						ok: false,
						message: 'Error al buscar los médicos',
						errors: error
					});
				}
				if(!doctor || doctor == ''){
					return res.status(404).json({
						ok: false,
						message: 'No existen médicos en la base de datos',
						errors: error
					});
				}

				Medico.count({}, (error, total) => {
					if(error){
						return res.status(500).json({
							ok: false,
							mensaje: 'Error en el conteo de los médicos',
							errors: error
						});
					}
					
					res.status(200).json({
						ok: true,
						total,
						doctor
					});
				});

	});
});

// ============================================
// Guardar un nuevo médico
// ============================================
app.post('/', mdAuthentication.tokenVerification, (req, res) => {
	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id,
		hospital: body.hospital
	});

	medico.save( (error, doctorSaved) => {
		if(error){
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear el médico',
				errors: error
			});
		}
		res.status(201).json({
			ok: true,
			doctorSaved
		});
	});
});

// ============================================
// Ingrese el comentario
// ============================================
app.put('/:id', mdAuthentication.tokenVerification, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Medico.findById( id, (error, doctorFinded) => {
		if(error){
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al buscar el médico',
				errors: error
			});
		}
		if(!doctorFinded){
			return res.status(400).json({
				ok: false,
				message: 'El médico con el id ' + id + ' no existe',
				errors: { message: 'No existe un médico con ese ID' }
			});
		}
		doctorFinded.nombre = body.nombre;
		if(body.img) doctorFinded.img = body.img;
		doctorFinded.usuario = req.usuario._id;
		doctorFinded.hospital = body.hospital;

		doctorFinded.save( (error, doctorSaved) => {
			if(error){
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar el médico',
					errors: error
				});
			}

			res.status(201).json({
				ok: true,
				doctorSaved
			});
		});
	});
})

// ============================================
// Eliminar un médico
// ============================================
app.delete('/:id', mdAuthentication.tokenVerification, (req, res) => {
	var id = req.params.id;

	Medico.findByIdAndRemove( id, (error, doctorDeleted) => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al buscar el médico',
				errors: error
			});
		}

		if(!doctorDeleted){
			return res.status(400).json({
				ok: false,
				message: 'El médico con el id ' + id + ' no existe',
				errors: { message: 'No existe un médico con ese ID' }
			});
		}

		res.status(200).json({
			ok: true,
			doctorDeleted
		});
	});
});

module.exports = app;