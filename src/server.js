const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');

// Set values for the server's address
const PORT = process.env.PORT || 0;
const HOST = '0.0.0.0';

// Cool trick for when promises or other complex callstack things are breaking:
void process.on('unhandledRejection', (reason, p) => {
	console.log(`Things got pretty major here! Big error:\n`+ p);
	console.log(`That error happened because of:\n` + reason);
});

// Configure server security
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.contentSecurityPolicy({
	directives:{
		defaultSrc:["'self'"]
	}
}));

// Configure API data receiving & sending
// Assume we always receive and send JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Configure CORS, add domains to the origin array as needed.
var corsOptions = {
	origin: ["http://localhost:3000", "https://deployedApp.com"],
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Actual server behaviour
app.get('/', (req, res) => {
	console.log('ExpressJS API homepage received a request.');
  
	const target = process.env.NODE_ENV || 'World';
	if (target == "development"){
		res.send(`Hello <strong>${target}</strong> world, yay for local development!!`);
	} else {
		console.log("Testing oooooooooooh")
		res.send(`Hello <strong>${target}</strong> world, yay for deployment!!`);
	}

});

// Notice that we're not calling app.listen() anywhere in here.
// This file contains just the setup/config of the server,
// so that the server can be used more-simply for things like Jest testing.
// Because everything is bundled into app, 
// we can export that and a few other important variables.
module.exports = {
	app, PORT, HOST
}