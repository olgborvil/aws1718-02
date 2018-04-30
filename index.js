'use strict';

var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var favicon = require('serve-favicon');
var cors = require("cors");
var request = require("request").defaults({json: true});


var researchers = require("./researchers.js");
var config = require('./config');

var port = (process.env.PORT || 15000);
var baseAPI = "/api/v1";

// External API params
var baseAPIEA = "/api/v1";
var snapshotEA = 1804;
var serverURLEA = "https://researcher.data.sabius-alpha.services.governify.io";

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(bodyParser.json());
app.use(cors());

// Postman documentation
app.get(baseAPI + "/help", (req, res) => {
	console.log("GET Postman documentation");
	res.redirect('https://documenter.getpostman.com/view/3947164/aws-1718-02/RVtvqYmp');
});

// Apikey authentication middleware
app.use(`${baseAPI}/researchers\*`,(req, res, next) => {
	const apikey = req.query.apikey || req.headers.apikey;
	if (!apikey) {
		res.status(401).send('Apikey required');
	} else if (apikey != config.apikey) {
		res.status(403).send('Invalid apikey');
	} else {
		next();
	}
});

// OAuth authentication middleware
// passport.use(
// 	new GoogleStrategy({
// 		clientID: config.passportGoogle.GOOGLE_CLIENT_ID,
// 		clientSecret: config.passportGoogle.GOOGLE_CLIENT_SECRET,
// 		callbackURL: config.passportGoogle.callbackURL
// 	},
// 	function(accessToken, refreshToken, profile, cb) {
// 		return cb(err, user);
// 		console.log("hola");
// 	})
// );

// app.use(passport.initialize());

// // Redirect route
// app.get('/redirect', (req, res) => {
// 	res.send('Hello');
// })

// app.get('/preredirect', passport.authenticate('google', { scope: ['profile'] }));

// API routes
app.get(baseAPI + "/researchers", (req, res) => {
	console.log("GET /researchers");
	researchers.allResearchers((err, resResearchers) => {
		if (err) {
			return res.sendStatus(500);
		}
		res.send(resResearchers.map(researcher => {
			delete researcher._id;
			return researcher;
		}));
	});
});

app.post(baseAPI + "/researchers", (req, res) => {
	console.log("POST /researchers");
	var researcher = req.body;
	researchers.get(researcher.ORCID, (err, resResearchers) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (resResearchers.length === 0) {
			researchers.add(researcher);
			res.sendStatus(201);
		}
		else {
			res.status(409).send('Resource already exists');
		}
	});
});

app.put(baseAPI + "/researchers", (req, res) => {
	console.log("PUT /researchers");
	res.sendStatus(405);
});

app.delete(baseAPI + "/researchers", (req, res) => {
	console.log("DELETE /researchers");
	researchers.removeAll((err, numRemoved) => {
		if (err) {
			return res.sendStatus(500);
		}
		console.log("researchers removed:" + numRemoved);
		res.sendStatus(200);
	});
});

app.get(baseAPI + "/researchers/:orcid", (req, res) => {
	console.log("GET /researchers/" + req.params.orcid);
	var orcid = req.params.orcid;
	researchers.get(orcid, (err, researchers) => {
		if (err) {
			return res.sendStatus(500);
		}
		if (researchers.length === 0) {
			res.status(404).send('There\'s no researcher with that ORCID');
		}
		else {
			delete researchers[0]._id;
			res.send(researchers[0]);
		}
	});
});

app.post(baseAPI + "/researchers/:orcid", (req, res) => {
	console.log("POST /researchers/" + req.params.orcid);
	res.sendStatus(405);
});

app.put(baseAPI + "/researchers/:orcid", (req, res) => {
	console.log("PUT /researchers/" + req.params.orcid);
	var updatedResearcher = req.body;
	if (updatedResearcher.ORCID) {
		res.status(400).send('ORCID field cannot be updated');
	}
	else {
		var orcid = req.params.orcid;
		updatedResearcher.ORCID = orcid;
		researchers.update(orcid, updatedResearcher, (err, numUpdates) => {
			if (err) {
				return res.sendStatus(500);
			}
			console.log("researchers updated:" + numUpdates);
			if (numUpdates === 0) {
				res.sendStatus(404);
			}
			else {
				res.sendStatus(200);
			}
		});
	}
});

app.delete(baseAPI + "/researchers/:orcid", (req, res) => {
	console.log("DELETE /researchers/" + req.params.orcid);
	var orcid = req.params.orcid;
	researchers.remove(orcid, (err, numRemoved) => {
		if (err) {
			return res.sendStatus(500);
		}
		console.log("researchers removed:" + numRemoved);
		if (numRemoved != 0) {
			res.sendStatus(200);
		} else {
			res.sendStatus(404);
		}
	});
});

// Universities routes
app.get(baseAPI + "/universities/:id", (req, res) => {
	console.log("GET /universities/" + req.params.id);
	res.send({
		name: "Universidad Complutense de Madrid",
		address: "Avda. de Séneca, 2 Ciudad Universitaria",
		city: "Madrid",
		ZipCode: 28040,
		phone: 923294500,
		fax: 914520400,
		mail: "infocom@ucm.es",
		web: "https://www.ucm.es/",
		researchGroups: [
			"ISA",
			"TDG",
			"Grupo de Computación Natural",
			"Ciencia de los Materiales"
		]
	});
});

// Research groups routes
app.get(baseAPI + "/groups/:id", (req, res) => {
	console.log("GET /groups/" + req.params.id);
	res.send({
		name: "ISA",
		id: "1",
		responsable: "Antonio Ruiz",
		email: "isagroup.us@gmail.com",
		components: [
			"Pablo Fernández",
			"Antonio Ruiz",
			"Manolo Resinas"
		],
		lineresearch: "REST APIs",
		_id: "OeZgEeTAh4BfJD3l"
		});
});

// External API (Sabius) routes
app.get(baseAPI + "/departments", (req, res) => {
	console.log("GET /departments");
	request.get(`${serverURLEA}${baseAPIEA}/${snapshotEA}/departments`, (err, resp, body) => {
		if (err) {
			console.log('Error: '+err);
			res.sendStatus(500);
		} else {
			res.status(resp.statusCode).send(body);
		}
	});
});

app.get(baseAPI + "/departments/:id", (req, res) => {
	console.log("GET /departments/" + req.params.id);
	request.get(`${serverURLEA}${baseAPIEA}/${snapshotEA}/departments/${req.params.id}`, (err, resp, body) => {
		if (err) {
			console.log('Error: '+err);
			res.sendStatus(500);
		} else {
			res.status(resp.statusCode).send(body);
		}
	});
});

researchers.connectDb((err) => {
	if (err) {
		console.log("Could not connect with MongoDB");
		process.exit(1);
	}

	app.listen(port, () => {
		console.log("Server with GUI up and running!!");
	});
});
