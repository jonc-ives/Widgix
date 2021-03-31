// MIT LICENSE | Jonathan Ives, 2021

const elc = require('electron');

mainOptions = {
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
	}

	start(server, logger) {
		this.serverObject = server;
		this.loggerObject = logger;
		exports.WidgixProcessManager.mainWindow = new elc.BrowserWindow(mainOptions);
		exports.WidgixProcessManager.mainWindow.loadFile(`${this.loggerObject.root}/electron/index.html`);
		exports.WidgixProcessManager.mainWindow.openDevTools();
		exports.WidgixProcessManager.mainWindow.maximize();
	}
}

exports.WidgixProcessManager = new ApplicationProcessManager();
