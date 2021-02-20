// LICENSE | Jonathan Ives, 2021

// dependency imports
const bodyParser = require('body-parser');
const { app, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const fileSystem = require('fs');
const hbs = require('hbs');

// library imports
const moduleAPI = require(__dirname + '/lib/module.js');

// here are a states for the app
var http_instance = undefined;
var server_on = false;
var network_on = false;
var service_port = 3000;
var log_buffer = [];

// the first thing is validation of dir ./user_data
if (!fileSystem.existsSync(__dirname + "/user_data"))
	fileSystem.mkdirSync(__dirname + "/user_data", { recursive: true }, (error) => { if (error) throw error; });

// the next thing is validation of dir ./modules
if (!fileSystem.existsSync(__dirname + "/lib/modules"))
	fileSystem.mkdirSync(__dirname + "/lib/modules", { recursive: true }, (error) => { if (error) throw error; })

// assign and validate user_styles dictionary
let user_styles = __dirname + "/user_data/styles.json";
if (!fileSystem.existsSync(user_styles))
	fileSystem.writeFile(user_styles, "{}", (error) => { if (error) throw error; });

// assign and validate user_widgets dictionary
let user_widgets = __dirname + "/user_data/widgets.json";
if (!fileSystem.existsSync(user_widgets))
	fileSystem.writeFile(user_widgets, "{}", (error) => { if (error) throw error; });

// assign and validate user_settings dictionary
let user_settings = __dirname + "/user_data/styles.json";
if (!fileSystem.existsSync(user_settings))
	fileSystem.writeFile(user_settings, "{}", (error) => { if (error) throw error; });

// assign and validate stream_map dictionary
let stream_map = __dirname + "/lib/modules/map.json";
if (!fileSystem.existsSync(stream_map))
	fileSystem.writeFile(stream_map, "{}", (error) => { if (error) throw error; });

let dblogs = JSON.parse(fileSystem.readFileSync(__dirname + "/lib/dblogs.json"));
if (!dblogs) throw "FATAL -- no console log data. Rebuild application or restore library files.";

// a few filesystem procedures for easier work (all sync)
var getWidgetObject = function(name) {
	try {
		let widget_map = JSON.parse( fileSystem.readFileSync(user_widgets) );
		let widget = widget_map[name];
		if (!widget) throw "Widget '" + name + "' does not exist.";
		return widget;
	} catch(Error) { console.log(Error); return 0; }
};

var getRulesObject = function(style_list) {
	try {
		let style_rules = JSON.parse( fileSystem.readFileSync(user_styles) );
		var rules = {}; // declare it as an empty object
		for (var k=0; k<style_list.length; k++) {
			var r = style_rules[style_list[k]];
			if (r && style_list[k] !== "type") rules[style_list[k]] = r;
		} // that should be the end 
		return rules;
	} catch(Error) { console.log(Error); return 0; }
};

var useModuleAPI = async function(streams, callback) {
	try {
		strdat = await moduleAPI.getStreamData(streams);
		return strdat;
	} catch(Error) {
		return 0;
	}
};

// these are all for user notifications and logs
var buildNewLog = async function(obj) {
	var time = new Date().toLocaleTimeString();
	log_buffer.push({
		"type": obj.type,
		"text": time + " - " + obj.msg
	});
}

var rnameNotify = function() {
	buildNewLog(dblogs["no-rname"]);
};

var widgetNotify = function() {
	buildNewLog(dblogs["bad-rname"]);
};

var rulesNotify = function() {
	buildNewLog(dblogs["failed-rules"]);
};

var strdatNotify = function() {
	buildNewLog(dblogs["failed-strdat"]);
};

// create and route express server for application's use
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
	// get the rules_object -- this is sync
	let rules = getRulesObject(widget["styles"]);
	if (rules === 0) return rulesNotify();
	// get the strdat_object -- this is async so callback to render

	moduleAPI.getStreamData(widget["stream"]).then((strdat) => {
		if (strdat === 0) return strdatNotify();
		let render = { // build the render_object for render
		 	"title": widget["title"] ? widget["title"] : "Widgix Widget",
		 	"hwidth": widget["width"] ? widget["width"] : "800px",
		 	"hheight": widget["height"] ? widget["height"] : "600px",
		 	"refsh": widget["refsh"] ? widget["refsh"] : "300",
		 	"styles": rules,
		 	"strdat": strdat,
		 	"hnodes": widget["hnodes"] ? widget["hnodes"] : {}
		}; buildNewLog(dblogs["widget-served"]); res.render('main', render);
	});
});

server.get('/', (req, res) => {

});

server.use((req, res) => {

});

server.use((error, req, res, next) => {

});

// electron's interfaces with the node API

ipcMain.on('read-console', (event) => {
	event.reply('read-console-reply', log_buffer);
	log_buffer = []; // no race -- all on main
});

ipcMain.on('toggle-server', (event) => {
	if (!server_on) {
		http_instance = server.listen({port: service_port}, function(){
			server_on = true;
		event.reply('toggle-server-reply', server_on);
		});
	} else {
		http_instance.close(function() {
			server_on = false;
			event.reply('toggle-server-reply', server_on);
		});
	}
});

ipcMain.on('toggle-network', (event) => {
	network_on = !network_on;
	event.reply('toggle-network-reply', network_on);
});

ipcMain.on('get-widgets', (event) => {
	var wd_buffer = JSON.parse(fileSystem.readFileSync(user_widgets));
	event.reply('get-widgets-reply', wd_buffer);
});

ipcMain.on('delete-widget', (event, key) => {
	if (!key) return; console.log(key);
	var old_widgets = JSON.parse(fileSystem.readFileSync(user_widgets));
	delete old_widgets[key]; var new_widgets = JSON.stringify(old_widgets);
	console.log(old_widgets); console.log(new_widgets);
	fileSystem.writeFile(user_widgets, new_widgets, function(err) {
		if (err) event.reply('delete-widget-reply', false);
		else event.reply('delete-widget-reply', true);
	});
});

ipcMain.on('request-styles', (event) => {
	let style_rules = JSON.parse( fileSystem.readFileSync(user_styles) );
	event.reply('request-styles-reply', style_rules);
});

// all we need to start the gui
app.whenReady().then(() => {
	appWindow = new BrowserWindow({
		title: "Widgix - Custom OBS Browser Sources",
		width: 200, height: 224, autoHideMenuBar: true,
		webPreferences: { nodeIntegration: true }
	}); appWindow.maximize();
	appWindow.openDevTools();
	appWindow.loadFile(__dirname + '/gui/index.html');
	buildNewLog(dblogs["app-loaded"]);
});



// for this side of things
// ipcMain.handle('perform-action', (event, ...args) => {
//   // ... do actions on behalf of the Renderer
// })

// for the browser side scripting
// ipcRenderer.invoke('perform-action', ...args)