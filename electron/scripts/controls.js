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

// needs testing
var parseConsoleLogs = function(event) {
	var logBox = document.getElementById("console-pane-box");
	logBox.innerHTML = "";
	for (var node in consoleLogs) {
		if (logBox.value === "debug") logBox.prepend(logBox[node]);
		else if (logBox.value === "important") {
			if ("important-console" in consoleLogs[node].classList || "critical-console" in consoleLogs[node].classList)
				logBox.prepend(logBox[node]);
		} else if (logBox.value === "critical" && "critical-console" in consoleLogs[node].classList) {
			logBox.prepend(logBox[node]);
		}
	}
};

var openLogFile = function(event) {
	ipcRenderer.send('open-log-file');
};

// DYNAMIC CONTROLS

var previewWidget = function(widID) {
	// var widgetPane = event.target.parentNode.parentNode.parentNode;
	// ipcRenderer.send('preview-widget', widgetPane.id);
};

var editWidget = function(widID) {
	// var widgetPane = event.target.parentNode.parentNode.parentNode;
	// ipcRenderer.send('edit-widget', widgetPane.id);
};

var optionsWidget = function(widID) {
	ipcRenderer.send('options-widget', widID);
	// on the completion of the options changes, adjust pane
	ipcRenderer.once('options-widget-done', (event, changedObject) => {
		// handle changes to the widget's pane
	});
};

var deleteWidget = function(widID) {
	ipcRenderer.send('delete-widget', widID);
	// on the completion of the delete confirmation, adjust widgets
	ipcRenderer.once('delete-widget-done', (event, success) => {
		// handle removal/keeping of the widget pane
	});
};

// needs testing
var copyLink = function(widID) {
	// passiveAlert("Copied to Clipboard");
};

var openModule = function(modID) {
	console.log(modID);
	ipcRenderer.send('open-module', modID);
	// on the completion of the module settings
	ipcRenderer.once('open-module-done', (event, changedObject) => {
		// handle changes to the module pane
	});
};

// HANDLE IPC MAIN

// needs testing
ipcRenderer.on('add-console-log', (event, newObject) => {
	consoleLogs.append(newConsolePane(newObject));
	parseConsoleLogs(null);
});

// needs testing
ipcRenderer.on('load-objects', (event, loadObject) => {
	console.log(loadObject, loadObject["widgets"], loadObject["modules"]);
	
	var modules = loadObject["modules"];
	
	if (modules) {
		for (var modID in modules) {
			var newModule = newModulePane(modID, modules[modID]);
			document.getElementById("modules-pane-box").appendChild(newModule);
		}
	} else {
		// add no modules button
		// set no modules flag
	}

	var widgets = loadObject["widgets"];
	if (widgets) {
		for (var widID in widgets) {
			var newWidget = newWidgetPane(widID, widgets[widID]);
			document.getElementById("widgets-pane-box").appendChild(newWidget);
		}
	} else {
		// add no widgets button
		// set no widgets flag
	}
});