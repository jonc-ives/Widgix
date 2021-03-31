// MIT LICENSE | Jonathan Ives, 2021

const bodyParser = require('body-parser');
const express = require('express');

const moduleAPI = require('./modules.js');

// const hbs = require('hbs');
// const path = require('path');
// server.set('views', __dirname + "/widgets"); // for custom widgets
// server.set('view engine', 'hbs'); // for custom widgets

exports.ApplicationServiceManager = class {
	
	constructor(configObject) {
		this.httpInstance = undefined;
		this.server = express();	
		this.streamList = [];
		this.server.get('/stream', this.getStream);
		this.server.get('/widget', this.getWidget);
		this.server.use(bodyParser.urlencoded({extended: true}));
		this.httpInstance = this.server.listen({ port: configObject.serve_port ? configObject.serve_port : 3000 }, (error) => {
			// handle server error here
		});
	}

	updateStreams(streams) {
		this.streamList = streams;
	}

	getStream(req, res) {
		if (req.ip !== "::ffff:127.0.0.1" && req.ip != "::1" && !network_on) {
			return handle_dblog("failedremote");
		}

		// fetch strdat object -- async
		moduleAPI.getStreamData(req.query.streams).then( (strdat) => {
			res.json({message: "yippeee"});
		});

	}

	getWidget(req, res) {
		res.json({message: "Would normally send widget.html here..."});
	}
}
