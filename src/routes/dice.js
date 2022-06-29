const express = require('express');

const routes = express.Router();

routes.get('/', (request, response) => {
	response.type('json').json(
		{
			// Random feature can be later
			// But basically, change the number to 7
			// and tests will fail.
			// When tests fail, deployment doesn't happen.
			result: 6
		}
	);
});


module.exports = routes;
