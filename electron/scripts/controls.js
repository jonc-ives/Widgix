const { ipcRenderer, clipboard } = require('electron');

// GLOBAL VARIABLES
var consoleLogs = [];
var noWidgets = false, noModules = false;

// STATIC BINDING

document.addEventListener('DOMContentLoaded', (event) => {
	document.getElementById("add-widget").onclick = launchNewWidget;
	document.getElementById("add-module").onclick = launchNewModule;
	document.getElementById("choose-logs").onchange = parseConsoleLogs;
	document.getElementById("open-logs").onclick = openLogFile;
});

// STATIC CONTROLS

// incomplete
var launchNewWidget = function(event) {
	// request to launch the new widget modal process
	ipcRenderer.send('launch-new-widget');
	// on the completion of the new widget modal process
	ipcRenderer.once('add-new-widget', (event, newObject) => {
		// handle new widget information
	});
};

// incomplete
var launchNewModule = function(event) {
	// request to launch the new module modal process
	ipcRenderer.send('launch-new-module');
	// on the completion of the new module modal process
	ipcRenderer.once('add-new-module', (event, newObject) => {
		// handle new module information
	});
};

var openLogFile = function(event) {
	ipcRenderer.send('open-log-file');
};

// needs testing
var parseConsoleLogs = function(event) {
	var logBox = document.getElementById("console-pane-box");
	logBox.innerHTML = "";
	for (var node in consoleLogs) {
		if (logBox.value === "important") {
			if (consoleLogs[node].classList.includes("important-console") || consoleLogs[node].classList.includes("critical-console"))
				logBox.prepend(consoleLogs[node]);
		} else if (logBox.value === "critical" && consoleLogs[node].classList.includes("critical-console")) {
			logBox.prepend(consoleLogs[node]);
		} else logBox.prepend(consoleLogs[node]);
	}
};

// DYNAMIC CONTROLS

var optionsWidget = function(widID) {
	ipcRenderer.send('options-widget', widID);
	// on the completion of the options changes, adjust pane
	ipcRenderer.once('options-widget-done', (event, changedObject) => {
		// handle changes to the widget's pane
	});
};

var openModule = function(modID) {
	ipcRenderer.send('open-module', modID);
	// on the completion of the module settings
	ipcRenderer.once('open-module-done', (event, changedObject) => {
		// handle changes to the module pane
	});
};

// needs testing
var copyLink = function(widID) {
	// passiveAlert("Copied to Clipboard");
};

// in dev
var deleteWidget = function(widID) {
	// ipcRenderer.send('delete-widget', widID);
	// // on the completion of the delete confirmation, adjust widgets
	// ipcRenderer.once('delete-widget-done', (event, success) => {
	// 	// handle removal/keeping of the widget pane
	// });
};

// in dev
var editWidget = function(widID) {
	// var widgetPane = event.target.parentNode.parentNode.parentNode;
	// ipcRenderer.send('edit-widget', widgetPane.id);
};

// in dev
var previewWidget = function(widID) {
	// var widgetPane = event.target.parentNode.parentNode.parentNode;
	// ipcRenderer.send('preview-widget', widgetPane.id);
};

// HANDLE IPC MAIN

// needs testing
ipcRenderer.on('add-console-log', (event, newObject) => {
	console.log(newObject);
	consoleLogs.push(newConsoleLog(newObject));
	parseConsoleLogs(null);
});

// needs testing
ipcRenderer.on('load-objects', (event, loadObject) => {
	var moduleCount, widgetCount;	
	var modules = loadObject["modules"];
	
	if (modules) {
		moduleCount = modules.length;
		for (var modID in modules) {
			var newModule = newModulePane(modID, modules[modID]);
			document.getElementById("modules-pane-box").appendChild(newModule);
		}
	} else {
		moduleCount = 0;
		// add no modules button
		// set no modules flag
	}

	var widgets = loadObject["widgets"];
	if (widgets) {
		widgetCount = widgets.length;
		for (var widID in widgets) {
			var newWidget = newWidgetPane(widID, widgets[widID]);
			document.getElementById("widgets-pane-box").appendChild(newWidget);
		}
	} else {
		widgetCount = 0;
		// add no widgets button
		// set no widgets flag
	}

	var newLog = {};
	if (widgetCount === 0 && moduleCount === 0) {
		newLog = {
			"message": "Application failed to locate valid modules and widgets. Try reinstalling the application, or see the application log file for more details.",
			"status": "critical"
		}; consoleLogs.push(newConsoleLog(newLog));
	} else if (widgetCount === 0) {
		newLog = {
			"message": "Application failed to locate valid widgets. Try reinstalling the application, or see the application log file for more details.",
			"status": "critical"
		}; consoleLogs.push(newConsoleLog(newLog));
		newLog = {
			"message": `Application successfully loaded ${moduleCount} module${moduleCount === 1 ? '' : 's'}.`,
			"status": "good"
		}; consoleLogs.push(newConsoleLog(newLog));
	} else if (moduleCount === 0) {
		newLog = {
			"message": "Application failed to locate valid modules. Try reinstalling the application, or see the application log file for more details.",
			"status": "critical"
		}; consoleLogs.push(newConsoleLog(newLog));
		newLog = {
			"message": `Application successfully loaded ${widgetCount} widget${widgetCount === 1 ? '' : 's'}.`,
			"status": "good"
		}; consoleLogs.push(newConsoleLog(newLog));
	} else {
		newLog = {
			"message": `Application successfully loaded ${moduleCount} module${moduleCount === 1 ? '' : 's'} and ${widgetCount} widget${widgetCount === 1 ? '' : 's'}.`,
			"status": "good"
		}; consoleLogs.push(newConsoleLog(newLog));
	} parseConsoleLogs(null);
});

ipcRenderer.on('set-module-status', (event, statusObject, logObject) => {
	console.log(statusObject, logObject);
	var icon = document.querySelector(`#${statusObject["id"]} > .module-title > div`);
	icon.className = `${statusObject["status"]}-icon`;
	if (logObject) consoleLogs.push(newConsoleLog(logObject));
});