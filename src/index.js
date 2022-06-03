var {app, PORT, HOST} = require('./server');

// Separate the "app.listen" from the rest of the server config & setup.
// This allows us to simplify how the server unit testing is gonna work.
const server = app.listen(PORT, HOST, () => {

	// Handles when the PORT was set to 0, as the server will randomly generate
	// a new number to use if PORT is left as 0.
	if (server.address().port != PORT){
		PORT = server.address().port;
	}

	console.log(`	
	ExpressJS Demo server is now running!

	Server address mapping is:
	
	HOST: ${HOST}
	PORT: ${PORT}

	Congrats!
	`);
})