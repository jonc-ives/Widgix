const { ipcRenderer } = require('electron');

var isSaved = true;

// tell the main process we're ready
ipcRenderer.send('editor-ready');

// response to 'editor-ready'. load the widget, confirm
// the load with the main process, and the session starts
ipcRenderer.on('load-widget', (event, widget) => {
	console.log('load-widget', widget);
	ipcRenderer.send('load-widget-done');
});

// DOM ELEMENT MANAGEMENT

// INTERFACE WITH MAIN PROCESS

// UTILITY FUNCTIONS




// let the main process know
window.onbeforeunload = (event) => {
	ipcRenderer.send('editor-closed');
	// return a non-default to cancel-close
};