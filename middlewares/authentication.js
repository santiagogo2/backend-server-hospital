var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

exports.tokenVerification = function(req, res, next){
	var token = req.query.token;

	jwt.verify( token, SEED, (error, decoded) => {
		if(error){
			return res.status(401).json({
				ok: false,
				message: 'Token incorrecto',
				errors: error
			});
		}

		req.usuario = decoded.usuario;
		
		next();
	});
}