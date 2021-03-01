// LICENSE | Jonathan Ives, 2021

// dependency imports
const bodyParser = require('body-parser');
const { app, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const fileSystem = require('fs');
const hbs = require('hbs');
const path = require('path');

// library imports
const moduleAPI = require(__dirname + '/lib/module.js');

// default settings if they can't be found
const configdef = {
	"widgets": ["/user_data", "relative"],
	"modules": ["/lib/modules", "relative"],
	"writeOnMissing": "true",
	"user_settings": {
		"server_port": 3000,
		"serve_remote": "no",
		"trusted": ["127.000.000.001"],
		"refresh_rate": "medium",
		"config": "all"
	}
}

// here are a few states for the app
var http_instance = undefined;
var service_port = 3000;
var dblog_buffer = [];

// the application content channel -- cannot be created before app.onReady 
var appWindow = null;

// SYNCHRONOUS FILE SYSTEM AND USER DATA CONFIGURATION
// Note - if at any point data is written to file, the corresponding object must be updated.

var createDirectory = function(pathname, dblog_key) {
	pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
	fileSystem.mkdirSync(path.resolve(__dirname, pathname), { recursive: true });
};

var writeFile = function(pathname, data, dblog_key) {
	pathname = pathname.replace(/^\.*\/|\/$/g, '');
	fileSystem.writeFileSync(path.resolve(__dirname, pathname), JSON.stringify(data));
};

var createDirFile = function(pathname, data, dblog_key) {
	var directory = pathname.replace(/\/?[^\/]+\.[a-z]+|\/$/g, '');
	if (!fileSystem.existsSync(directory))
		fileSystem.mkdirSync(path.resolve(directory, { recursive: true }));
	if (!fileSystem.existsSync(pathname))
		fileSystem.writeFileSync(path.resolve(__dirname, pathname), JSON.stringify(data));
};

var readFile = function(pathname, dblog_key) {
	var raw = fileSystem.readFileSync(pathname);
	return JSON.parse(raw);
};

// locate/create config file
let config_fn = __dirname + "/config.json";
if (!fileSystem.existsSync(config_fn))
	writeFile(config_fn, configdef, "configdne");
// read config object from config file
var config_obj = readFile(config_fn, "configobj");

// locate/create widgets file and path
var widgets_fn = config_obj["widgets"][0] ? config_obj["widgets"][0] : configdef["widgets"][0];
widgets_fn = (config_obj["widgets"][1] === "absolute" ? "" : __dirname) + widgets_fn + "/widgets.json";
if (!fileSystem.existsSync(widgets_fn) && config_obj["writeOnMissing"] === "true")
	createDirFile(widgets_fn, "{}", "widgetsdne")
else if (!fileSystem.existsSync(widgets_fn))
	fatal_error("widgetsdne");
// read widgets object from widgets file
var widgets_obj = readFile(widgets_fn, "widgetsobj");

// locate/create modules file and path
var modules_fn = config_obj["modules"][0] ? config_obj["modules"][0] : configdef["modules"][0];
modules_fn = (config_obj["modules"][1] === "absolute" ? "" : __dirname) + modules_fn + "/modules.json";
if (!fileSystem.existsSync(modules_fn) && config_obj["writeOnMissing"] === "true")
	createDirFile(modules_fn, "{}", "modulesdne")
else if (!fileSystem.existsSync(modules_fn))
	fatal_error("modulesdne");
// read widgets object from widgets file
var modules_obj = readFile(modules_fn, "modulesobj");

// LOGGING, DEBUGGING, CONSOLE MESSAGES

var fatal_error = function(dblog) {

};

var handle_error = function(dblog, error) {

};

var build_dblog = function(dblog) {

};

// CONFIGURE AND MANAGE THE SERVER

const server = express();
server.set('views', __dirname + "/hbs");
server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({extended: true}));

server.get('/widget', (req, res) => {
	// make sure it's a legal client
	if (req.ip !== "::ffff:127.0.0.1" && req.ip != "::1" && !network_on) {
		buildNewLog(dblogs["ext-net"]); res.close();
	}
	// get the requested widget name
	let rname = req.query["name"];
	if (!rname) return rnameNotify();
	// get the widget_object -- this is sync
	let widget = getWidgetObject(rname);
	if (widget === 0) return widgetNotify();
	// get the strdat_object -- this is async so callback to render
	moduleAPI.getStreamData(widget["stream"]).then((strdat) => {
		if (strdat === 0) return strdatNotify();
		let render = { // build the render_object for render
		 	"title": widget["title"] ? widget["title"] : "Widgix Widget",
		 	"hwidth": widget["width"] ? widget["width"] : "800px",
		 	"hheight": widget["height"] ? widget["height"] : "600px",
		 	"refsh": widget["refsh"] ? widget["refsh"] : "300",
		 	"strdat": strdat,
		 	"hnodes": widget["hnodes"] ? widget["hnodes"] : {}
		}; buildNewLog(dblogs["widget-served"]); res.render('main', render);
	});
});

// INTERFACE TO RENDERER PROCESS

ipcMain.on('launch-preview', (event, widget_name) => {

});

ipcMain.on('create-widget', (event, widget_dict) => {

});

ipcMain.on('copy-widget', (event, widget_name) => {

});

ipcMain.on('edit-widget', (event, widget_name) => {

});

ipcMain.on('rename-widget', (event, new_name) => {

});

ipcMain.on('delete-widget', (event, key) => {
	
});

ipcMain.on('save-widget', (event, widget_name) => {

});

ipcMain.on('toggle-server', (event) => {
	if (http_instance === undefined) {
		http_instance = server.listen({ port: service_port }, function(error) {
			if (error) handle_error("serverup", error);
			event.reply('toggle-server-reply', (http_instance ? true : false));
		});
	} else if (http_instance) {
		http_instance.close(function(error) {
			if (error) handle_error("serverdown", error);
			else http_instance = undefined;
			event.reply('toggle-server-reply', (http_instance ? true : false));
		});
	}
});

// BEGIN THE APPLICATION

app.whenReady().then(() => {
	appWindow = new BrowserWindow({
	title: "Widgix - Custom OBS Browser Sources",
	width: 900, height: 633, autoHideMenuBar: true,
	webPreferences: { nodeIntegration: true }
	});	appWindow.maximize(); appWindow.openDevTools();
	appWindow.loadFile(`${__dirname}/gui/index.html`);
});

// appWindow.webContents.postMessage('dashboard-update', data);
