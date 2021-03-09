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
const DBLogs = require(__dirname + '/lib/dblogs.js');

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
var dblog_buffer = {};
var editor_open = false;

// the application content channel -- cannot be created before app.onReady 
var appWindow = null;

// SYNCHRONOUS FILE SYSTEM AND USER DATA CONFIGURATION
// Note - if at any point data is written to file, the corresponding object must be updated.

var createDirectory = function(pathname, dblog_key) {
	pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
	fileSystem.mkdirSync(path.resolve(__dirname, pathname), { recursive: true }, (error) => {
		if (error) handle_dblog(dblog_key);
	});
};

var writeFile = function(pathname, data, dblog_key) {
	pathname = pathname.replace(/^\.*\/|\/$/g, '');
	fileSystem.writeFileSync(path.resolve(__dirname, pathname), JSON.stringify(data), (error) => {
		if (error) handle_dblog(dblog_key);
	}); if (pathname === widgets_fn) reload_dbwidgets();
};

var createDirFile = function(pathname, data, dblog_key) {
	var directory = pathname.replace(/\/?[^\/]+\.[a-z]+|\/$/g, '');
	if (!fileSystem.existsSync(directory))
		fileSystem.mkdirSync(path.resolve(directory, { recursive: true }), (error) => {
			if (error) handle_dblog(dblog_key);
		});
	if (!fileSystem.existsSync(pathname))
		fileSystem.writeFileSync(path.resolve(__dirname, pathname), JSON.stringify(data), (error) => {
			if (error) handle_dblog(dblog_key);
		});
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

var fatal_error = function(dblog, error) {
	console.log(DBLogs.fatals[dblog], error);
	app.quit(); // we don't mess with this
};

var handle_dblog = function(dblog) {
	var dblog_obj = DBLogs.dblogs[dblog];
	if (dblog_obj["callback_handler"] instanceof Function)
		setTimeout(dblog_obj["callback_handler"], 0);
	if (dblog_obj["priority"] === "fatal")
		fatal_error(dblog, null);

	var tstamp = Math.floor(Date.now() / 1000);
	dblog_buffer[tstamp] = {
		"msg": dblog_obj["msg"],
		"priority": dblog_obj["priority"]
	};

	reload_dblogs();
};

// CONFIGURE AND MANAGE THE SERVER

const server = express();
server.set('views', __dirname + "/hbs");
server.set('view engine', 'hbs');
server.use(bodyParser.urlencoded({extended: true}));

server.get('/widget', (req, res) => {
	
	// make sure it's a legal client
	if (req.ip !== "::ffff:127.0.0.1" && req.ip != "::1" && !network_on) {
		handle_dblog("failedremote"); res.close();
	}
	
	// get the requested widget name
	let rname = req.query["name"];
	if (!rname) {
		handle_dblog("norname"); res.close();
	}
	
	// get the widget_object -- this is sync
	let widget = widgets_obj[rname];
	if (widget === undefined) {
		handle_dblog("badrname"); res.close();
	}

	// get the strdat_object -- this is async so callback to render
	moduleAPI.getStreamData(widget["stream"]).then((strdat) => {
		// we don't serve widgets with bad data
		if (strdat === 0) {
			handle_dblog("badstream"); res.close();
		}

		// build the render object, render
		let render = { // build the render_object for render
		 	"title": widget["title"] ? widget["title"] : "Widgix Widget",
		 	"hwidth": widget["width"] ? widget["width"] : "800px",
		 	"hheight": widget["height"] ? widget["height"] : "600px",
		 	"refsh": widget["refsh"] ? widget["refsh"] : "300",
		 	"strdat": strdat,
		 	"hnodes": widget["hnodes"] ? widget["hnodes"] : {}
		};

		// change the lastup object from widget -- store
		widgets_obj[rname]["lastup"] = Math.floor(Date.now() / 1000);
		writeFile(widgets_fn, widgets_obj, "lastup");

		// log and complete the successful widget request
		handle_dblog("goodwidget");
		res.render('main', render);
	});
});

// INTERFACE TO DASHBOARD WINDOW

// this is really lazy, but ask me if I gaf
var create_wid = function() {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	var new_wid = "";
	for (var i = 0; i < 9; i++)
		new_wid += alphabet[Math.floor(Math.random() * alphabet.length)]
	return new_wid;
};

var reload_dbwidgets = function() {
	appWindow.webContents.send('reload-dbwidgets', widgets_obj);
};

var reload_dblogs = function() {
	appWindow.webContents.send('reload-dblogs', dblog_buffer);
};

ipcMain.on('load-db', (event) => {
	// create a dblog to indicate load
	handle_dblog("loaddashboard");
	// pull the necessary data for widget panes
	var dbwidgets = {};
	for (var wid in widgets_obj) {
		dbwidgets[wid] = {
			"title": widgets_obj[wid]["title"],
			"lastup": widgets_obj[wid]["lastup"]
		};
	} // send the widgets and dblog to the rendered process
	event.reply('load-db-reply', dbwidgets, dblog_buffer);
});

ipcMain.on('toggle-server', (event) => {
	if (http_instance === undefined) {
		http_instance = server.listen({ port: service_port }, function(error) {
			if (error) handle_dblog("serverupf");
			else handle_dblog("serverup");
			event.reply('toggle-server-reply', (http_instance ? true : false));
		});
	} else if (http_instance) {
		http_instance.close(function(error) {
			if (error) handle_dblog("serverdownf");
			else {http_instance = undefined; handle_dblog("serverdown");}
			event.reply('toggle-server-reply', (http_instance ? true : false));
		});
	}
});

ipcMain.on('create-widget', (event, widget_dict) => {
	var new_widget = {
		"title": widget_dict["title"],
		"width": widget_dict["width"],
		"height": widget_dict["height"],
		"refsh": "60",
		"stream": [],
		"hnodes": []
	}

	var new_widget_id = create_wid()
	widgets_obj[new_widget_id] = new_widget;
	writeFile(widgets_fn, widgets_obj, "newwidget");
	event.reply('create-widget-reply', new_widget_id);
});

ipcMain.on('copy-widget', (event, widget_name) => {
	var new_widget = JSON.parse(JSON.stringify(widgets_obj[widget_name]));
	new_widget["title"] += " (copy)";
	new_widget["lastup"] = undefined;
	widgets_obj[create_wid()] = new_widget;
	writeFile(widgets_fn, widgets_obj, "copywidget");
	reload_dblogs(); reload_dbwidgets();
});

ipcMain.on('delete-widget', (event, key) => {
	delete widgets_obj[key];
	writeFile(widgets_fn, widgets_obj, "delwidget");
});

ipcMain.on('edit-widget', (event, wid) => {
	if (editor_open) return handle_dblog('editorrepeat');

	// load the widget to be edited
	var widget = widgets_obj[wid];

	// create a new window for the editor
	var edtWindow = new BrowserWindow({
		title: `Widgix Editor - ${widget["title"]}`,
		width: 900, height: 633, autoHideMenuBar: true,
		webPreferences: { nodeIntegration: true },
		show: false
	});

	// load the window, load the widget, set editor state
	edtWindow.loadFile(`${__dirname}/gui/editor.html`);
	edtWindow.maximize();
	edtWindow.openDevTools();
	editor_open = true;

	// NOTE -- THIS WORKFLOW IS A LITTLE CONVOLUTED. IT'S A RESULT
	// OF MANAGING THREE PROCESSES AT ONCE. SEE THE DEVELOPMENT NOTES
	// FOR A GOOD FLOWCHART.

	ipcMain.once('editor-ready', (event) => {
		event.reply('load-widget', widget);
	});

	ipcMain.once('load-widget-done', (event) => {
		console.log("showing window");
		edtWindow.show();
	});

	ipcMain.once('editor-closed', (event) => {
		console.log('editor-closed');
		editor_open = false;
	});
});

// INTERFACE TO EDITOR WINDOW

ipcMain.on('rename-widget', (event, new_name) => {

});

ipcMain.on('save-widget', (event, widget_name) => {

});

// BEGIN THE APPLICATION

app.whenReady().then(() => {
	appWindow = new BrowserWindow({
		title: "Widgix - Custom OBS Browser Sources",
		width: 900, height: 633, autoHideMenuBar: true,
		webPreferences: { nodeIntegration: true }
	});

	appWindow.loadFile(`${__dirname}/gui/index.html`);
	// appWindow.openDevTools();
	appWindow.maximize();
});
