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
			var goodLoad = {"message": "Application successfully intialized.", "status": "good"}
			this.mainWindow.webContents.send('add-console-log', goodLoad);
		});
	}

	loadModulesObject() {
		var rawJSON = fsys.readFromJSONFile(`${this.configObject["root"]}\\persistence\\modules.json`);
		if (rawJSON) {
			this.modules = rawJSON;
			for (var id in rawJSON) {
				moduleAPI.checkStatus(id, (status, log) => {
					exports.WidgixProcessManager.modules[id]["status"] = status["status"];
					this.mainWindow.webContents.send('set-module-status', status, log);
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
					"url": `${this.loggerObject.root}/modules/widgets/${id}.html`
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
		// note: no access to (this) --> this is inside the call of an async event handle
		var self = exports.WidgixProcessManager;

		const modal = new elc.BrowserWindow({
			parent: self.mainWindow,
			modal: true,
			resizable: false,
			alwaysOnTop: true,
			minimizable: false,
			autoHideMenuBar: true,
			width: 608,
			height: 346,
			webPreferences: { nodeIntegration: true }
		});

		modal.loadFile(`${self.loggerObject.root}/modules/modals/widgets/${widID}.html`);

		modal.once('ready-to-show', () => {
			var modalObject = {
				"widget": fsys.readFromJSONFile(`${self.loggerObject.root}\\modules\\widgets\\settings\\${widID}.json`),
				"widID": widID
			};

			modal.webContents.send('load-modal-settings', modalObject);
			modal.openDevTools();
			modal.show()
		});

		elc.ipcMain.once(`${widID}-cancelled`, (event) => {
			// this avoids refiring unloading events in renderer
			modal.destroy(); 
		});

		elc.ipcMain.once(`${widID}-saved`, (event, newSettings) => {
			fsys.writeToJSONFile(`${self.loggerObject.root}\\modules\\widgets\\settings\\${widID}.json`, newSettings);
			// this avoids refiring unloading events in renderer
			modal.destroy();
		});
	}

	openModule(event, modID) {
		// note: no access to (this) --> this is inside the call of an async event handle
		var self = exports.WidgixProcessManager;
		// make sure we have a return on the module status
		if (self.modules[modID]["status"] === undefined)
			return;

		const modal = new elc.BrowserWindow({ 
			parent: self.mainWindow,
			modal: true,
			resizable: false,
			alwaysOnTop: true,
			minimizable: false,
			autoHideMenuBar: true,
			width: 608,
			height: 168,
			webPreferences: { nodeIntegration: true }
		});
		
		modal.loadFile(`${self.loggerObject.root}/modules/modals/modules/${modID}.html`);
		
		modal.once('ready-to-show', () => {
			var modalObject = {
				"module": fsys.readFromJSONFile(`${self.loggerObject.root}\\modules\\settings\\${modID}.json`),
				"modID": modID,
				"status": self.modules[modID]["status"]
			};

			modal.webContents.send('load-modal-settings', modalObject);
			modal.openDevTools();
			modal.show()
		});

		elc.ipcMain.once(`${modID}-cancelled`, (event) => {
			// this avoids refiring unloading events in renderer
			modal.destroy(); 
		});

		elc.ipcMain.once(`${modID}-saved`, (event, newSettings) => {
			// send the settings to the module controls
			moduleAPI.checkModuleSettings(modID, newSettings).then((valid) => {
				if (valid !== true) modal.webContents.send('invalid-save', valid);
				else {
					fsys.writeToJSONFile(`${self.loggerObject.root}\\modules\\settings\\${modID}.json`, newSettings);
					modal.destroy();
				}
			});
		});
	}

	// in dev
	previewWidget(event, widID) {

	}

	// in dev
	editWidget(event, widID) {

	}

}

exports.WidgixProcessManager = new ApplicationProcessManager();
