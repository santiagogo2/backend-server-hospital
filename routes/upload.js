'use strict'
var express = require('express');

var fileupload = require('express-fileupload');
var fs = require('fs-extra');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Default options
app.use(fileupload());

app.put('/:tipo/:id', (req, res, next) => {
	var tipo = req.params.tipo;
	var id = req.params.id;

	// Tipos de collección
	var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
	if( tiposValidos.indexOf( tipo ) < 0 ){
		return res.status(400).json({
			ok: false,
			message: 'Tipo de colección no es válida',
			errors: { message: 'Tipo de colección no es válida' }
		});
	}

	if( !req.files ){
		return res.status(400).json({
			ok: false,
			message: 'No selecciono nada',
			errors: { message: 'Debe seleccionar una imágen' }
		});
	}

	// Obtener nombre del archivo
	var archivo = req.files.imagen;
	var nombreCortado = archivo.name.split('.');
	var extensionArchivo = nombreCortado[ nombreCortado.length-1 ];
	
	// Solo estas extensiones aceptamos
	var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if( extensionesValidas.indexOf( extensionArchivo ) < 0 ){
		return res.status(400).json({
			ok: false,
			message: 'Extensión no válida',
			errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
		});
	}

	// Crear un nombre de archivo personalizado
	var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

	// Mover el archivo del temporal a un path en específico
	var path = `./uploads/${ tipo }/${ nombreArchivo }`;

	archivo.mv( path, error => {
		if(error){
			return res.status(500).json({
				ok: false,
				message: 'Error al mover archivo',
				errors: error
			});			
		}
	});

	subirPorTipo( tipo, id, nombreArchivo, res );

	// res.status(200).json({
	// 	ok: true,
	// 	message: 'Archivo movido',
	// 	extensionArchivo
	// });
});

function subirPorTipo( tipo, id, nombreArchivo, res ){
	if( tipo === 'usuarios' ){
		Usuario.findById( id, 'nombre apellidos email img role').exec((error, usuario) => {
			if(error){
				return res.status(500).json({
					ok: false,
					message: 'Error al buscar el usuario',
					errors: error
				});
			}
			if(!usuario || usuario == ''){
				return res.status(400).json({
					ok: false,
					message: 'No se han encontrado usuarios con el id ingresado',
					errors: error
				});
			}

			var pathViejo = './uploads/usuarios/' + usuario.img; 
			if( fs.existsSync(pathViejo) ){
				fs.unlink( pathViejo );
			}

			usuario.img = nombreArchivo;

			usuario.save( (error, usuarioActualizado) => {
				if(error){
					return res.status(500).json({
						ok: false,
						message: 'Error al actualizar el usuario',
						errors: error
					});
				}
				return res.status(200).json({
					ok: true,
					message: 'Imagen de usuario actualizada',
					usuario: usuarioActualizado
				});
			});
		})
	}
	if( tipo === 'medicos' ){
		Medico.findById( id, (error, doctor) => {
			if(error){
				return res.status(500).json({
					ok: false,
					message: 'Error al buscar el médico',
					errors: error
				});
			}
			if(!doctor || doctor == ''){
				return res.status(400).json({
					ok: false,
					message: 'No se han encontrado doctores con el id ingresado',
					errors: error
				});
			}

			var pathViejo = './uploads/medicos/' + doctor.img; 
			if( fs.existsSync(pathViejo) ){
				fs.unlink( pathViejo );
			}

			doctor.img = nombreArchivo;

			doctor.save( (error, doctorUpdated) => {
				if(error){
					return res.status(500).json({
						ok: false,
						message: 'Error al actualizar el médico',
						errors: error
					});
				}
				return res.status(200).json({
					ok: true,
					message: 'Imagen de médico actualizada',
					medico: doctorUpdated
				});
			});
		});
	}
	if( tipo === 'hospitales' ){
		Hospital.findById(id, (error, hospital) => {
			if(error){
				return res.status(500).json({
					ok: false,
					message: 'Error al buscar el hospital',
					errors: error
				});
			}
			if(!hospital || hospital == ''){
				return res.status(400).json({
					ok: false,
					message: 'No se han encontrado hospitales con el id ingresado',
					errors: error
				});
			}

			var pathViejo = './uploads/hospitales/' + hospital.img;
			if( fs.existsSync(pathViejo) ){
				fs.unlink(pathViejo);
			}

			hospital.img = nombreArchivo;

			hospital.save((error, hospitalUpdated) => {
				if(error){
					return res.status(500).json({
						ok: false,
						message: 'Error al actualizar el hospital',
						errors: error
					});
				}
				return res.status(200).json({
					ok: true,
					message: 'Imagen de hospital actualizada',
					hospital: hospitalUpdated
				});
			});
		});	
	}
}

module.exports = app;