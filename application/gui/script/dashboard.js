const { ipcRenderer } = require('electron');

var change_remote = function() {
	// assign new_value here
	ipcRenderer.send('change-remote', new_value);
};

var add_trusted = function() {
	// assign new_trusted here
	ipcRenderer.send('add-trusted', new_trusted);
};

var change_port = function() {
	// assert server is inactive, indicate if not
	// assign new_port here
	ipcRenderer.send('change-port', new_port);
};

var change_refresh = function() {
	// assign new_refresh here
	ipcRenderer.send('change-refresh', new_refresh);
};

var change_debug = function() {
	// assing new_debug here
	ipcRenderer.send('change-debug', new_debug);
};

var preview_widget = function() {
	// assign widget_name here
	ipcRenderer.send('launch-preview', widget_name);
};

var create_widget = function() {
	// open new widget dialogue launcher
	// if cancel, return to application
	// assign widget_dict here
	ipcRenderer.send('create-widget', widget_dict);
};

var copy_widget = function() {
	// assign widget_name here
	ipcRenderer.send('copy-widget', widget_name);
};

var open_widget = function() {
	// assign widget_name here
	ipcRenderer.send('edit-widget', widget_name);
};

var delete_widget = function() {
	// assign widget_name here
	// launch delete widget window
	// if cancel, return to application
	ipcRenderer.send('delete-widget', widget_name);
}

var toggle_server = function() {
	// make style changes here
	ipcRenderer.send('toggle-server');
};
