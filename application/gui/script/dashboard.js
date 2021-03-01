const { ipcRenderer } = require('electron');

var dblogs = {};
var server = [false, "good"];

var copy_widget_link = function(event) {
	// code goes here...
};

var preview_widget = function(event) {
	// assign widget_name here...
	ipcRenderer.send('launch-preview', widget_name);
};

var create_widget = function(event) {
	// open new widget dialogue launcher
	// if cancel, return to application
	// assign widget_dict here...
	ipcRenderer.send('create-widget', widget_dict);
};

var copy_widget = function(event) {
	// assign widget_name here...
	ipcRenderer.send('copy-widget', widget_name);
};

var open_widget = function(event) {
	// assign widget_name here...
	ipcRenderer.send('edit-widget', widget_name);
};

var delete_widget = function(event) {
	// assign widget_name here...
	// launch delete widget window
	// if cancel, return to application
	ipcRenderer.send('delete-widget', widget_name);
}

var toggle_server = function(event) {
	document.getElementById("server-st").innerHTML = "hold on a moment";
	document.getElementById("server-st-q").className = "cell cell-on";
	ipcRenderer.send('toggle-server');
}; ipcRenderer.on('toggle-server-reply', (event, state) => {
	document.getElementById("server-st-q").className = "cell cell-off";
	if (state) {
		document.getElementById("server-st").innerHTML = "serving widgets";
		document.getElementById("server-tg").className = "sld-track sld-tr-on";
		document.getElementById("server-tg-thumb").className = "sld-thumb sld-th-on";
	} else {
		document.getElementById("server-st").innerHTML = "ready to serve";
		document.getElementById("server-tg").className = "sld-track sld-tr-off";
		document.getElementById("server-tg-thumb").className = "sld-thumb sld-th-off";
	}
});

ipcRenderer.on('load-db', (event, data) => {
	// create widget panes
	// bind widget-pane actions
});