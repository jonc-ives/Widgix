const { ipcRenderer } = require('electron');
const build = require('./build.js');

// GLOBAL VARIABLES
var consoleLogs = [];

// STATIC BINDING

document.getElementById("add-widget").onclick = launchNewWidget;
document.getElementById("add-module").onclick = launchNewModule;
document.getElementById("choose-logs").onchange = parseConsoleLogs;
document.getElementById("open-logs").onclick = openLogFile;

// STATIC CONTROLS

var launchNewWidget = function(event) {
	// request to launch the new widget modal process
	ipcRenderer.send('launch-new-widget');
	// on the completion of the new widget modal process
	ipcRenderer.once('add-new-widget', (event, newObject) => {
		// handle new widget information
	});
};

var launchNewModule = function(event) {
	// request to launch the new module modal process
	ipcRenderer.send('launch-new-module');
	// on the completion of the new module modal process
	ipcRenderer.once('add-new-module', (event, newObject) => {
		// handle new module information
	});
};

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

var previewWidget = function(event) {
	var widgetPane = event.target.parentNode.parentNode.parentNode;
	ipcRenderer.send('preview-widget', widgetPane.id);
};

var editWidget = function(event) {
	var widgetPane = event.target.parentNode.parentNode.parentNode;
	ipcRenderer.send('edit-widget', widgetPane.id);
};

var optionsWidget = function(event) {
	var widgetPane = event.target.parentNode.parentNode.parentNode;
	ipcRenderer.send('options-widget', widgetPane.id);
	// on the completion of the options changes, adjust pane
	ipcRenderer.once('options-widget-done', (event, changedObject) => {
		// handle changes to the widget's pane
	});
};

var deleteWidget = function(event) {
	var widgetPane = event.target.parentNode.parentNode.parentNode;
	ipcRenderer.send('delete-widget', widgetPane.id);
	// on the completion of the delete confirmation, adjust widgets
	ipcRenderer.once('delete-widget-done', (event, success) => {
		// handle removal/keeping of the widget pane
	});
};

var copyLink = function(event) {
	event.target.parentNode.firstChild.select();
	document.execCommand("copy");
	build.passiveAlert("Copied to Clipboard");
};

var openModule = function(event) {
	var modulePane = event.target.parentNode;
	ipcRenderer.send('open-module', modulePane.id);
	// on the completion of the module settings
	ipcRenderer.once('open-module-done', (event, changedObject) => {
		// handle changes to the module pane
	});
};
