// MIT LICENSE | Jonathan Ives, 2021

const elc = require('electron');
const fsys = require('./filesystem.js');
const moduleAPI = require('./modules.js');

var mainOptions = {
	title: "widgix - Custom OBS Browser Sources",
	width: 900,
	height: 733,
	autoHideMenuBar: true,
	webPreferences: { nodeIntegration: true }
};

var moduleStub = {
	"codJonIves": {
		"title": "Call of Duty Live Warzone Stats",
		"status": "good"
	},
	"Dota2JonIves": {
		"title": "Dota 2 Career Stats",
		"status": "important"
	}
};

var widgetStub = {
	"1617307732": {
		"title": "First Widget Stub",
		"width": "340",
		"height": "48",
		"url": `${__dirname}`
	},
	"1617307736": {
		"title": "Second Widget Stub",
		"width": "500",
		"height": "600",
		"url": "file:///c:Users/J-Breezy/Desktop/WSOne/Widgix/electron/index.html"
	}
};

class ApplicationProcessManager {
	
	constructor() {
		this.app = elc.app;
		this.mainWindow = null;
		this.serverObject = null;
		this.loggerObject = null;
		this.modules = {};
		this.widgets = {};
	}

	start(server, logger, config) {
		this.configObject = config;
		this.serverObject = server;
		this.loggerObject = logger;
		// begin electron application
		this.mainWindow = new elc.BrowserWindow(mainOptions);
		this.mainWindow.loadFile(`${this.loggerObject.root}/electron/index.html`);
		this.mainWindow.openDevTools();
		this.mainWindow.maximize();
		// manage the logger.load items
		// this is for adding new logs to renderer built from logger object
		this.loggerObject.emitter.on('logger-console-log', this.addConsoleLog);
		// bindings for ipcRenderer events
		elc.ipcMain.on('launch-new-widget', this.launchNewWidget);
		elc.ipcMain.on('launch-new-module', this.launchNewModule);
		elc.ipcMain.on('open-log-file', this.openLogFile);
		elc.ipcMain.on('preview-widget', this.previewWidget); // in dev
		elc.ipcMain.on('edit-widget', this.editWidget); // in dev
		elc.ipcMain.on('delete-widget', this.deleteWidget);
		elc.ipcMain.on('options-widget', this.optionsWidget);
		elc.ipcMain.on('open-module', this.openModule);
		// build and send startup objects to renderer (stubs for now)
		this.mainWindow.webContents.once('dom-ready', () => {
			this.loadModulesObject();
			this.loadWidgetsObject();
			var loadObject = { "modules": this.modules, "widgets": this.widgets };
			this.mainWindow.webContents.send('load-objects', loadObject);
		});
	}

	loadModulesObject() {
		var rawJSON = fsys.readFromJSONFile(`${this.configObject["root"]}\\persistence\\modules.json`);
		if (rawJSON) {
			for (var id in rawJSON) {
				// copy relevant object attributes
				this.modules[id] = {
					"title": rawJSON[id]["title"],
					"status": "checking"
				}; // begin async status check
				moduleAPI.checkStatus(id, (status, log) => {
					// this is where we would add the log, normally
					var state = { "id": id, "status": status };
					this.mainWindow.webContents.send('set-module-status', state);
				});
			}
		} else this.modules = {};
	}

	loadWidgetsObject() {
		var rawJSON = fsys.readFromJSONFile(`${this.configObject["root"]}\\persistence\\widgets.json`);
		if (rawJSON) {
			for (var id in rawJSON) {
				this.widgets[id] = {
					"title": rawJSON[id]["title"],
					"width": rawJSON[id]["width"],
					"height": rawJSON[id]["height"],
					"url": rawJSON[id]["url"],
				};
			}
		} else this.widgets = {};
	}

	addConsoleLog(eventlogObject) {

	}

	launchNewWidget(event) {
		console.log("launch new widget modal");
	}

	launchNewModule(event) {
		console.log("launch new module modal");
	}

	openLogFile(event) {
		console.log("open log file");
	}

	deleteWidget(event, widID) {
		console.log("launch delete widget modal");
	}

	optionsWidget(event, widID) {
		console.log("launch options widget modal");
	}

	openModule(event, modID) {
		console.log("launch module modal");
	}

	// in dev
	previewWidget(event, widID) {

	}

	// in dev
	editWidget(event, widID) {

	}

}

exports.WidgixProcessManager = new ApplicationProcessManager();
