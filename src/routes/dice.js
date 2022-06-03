const express = require('express');

const routes = express.Router();

routes.get('/', (request, response) => {
	response.type('json').json(
		{
			result: 7
		}
	);
});


module.exports = routes;
