 const elc = require('electron');

var widgetSettings = {};
var widID = "";

 // the modal is in four states at any point
 //		loading -- applying load object
 //		working -- logging into cod
 //		waiting -- allowing the user to enter
 //		success -- waiting for the user to exit

// IMPORTANT NOTE -- IF CHANGES ARE MADE TO THE SAVE AND CANCEL BUTTONS,
// ONCLICK SHOULD STILL BE BOUND TO FUNCTIONS save AND cancel.

elc.ipcRenderer.on('load-modal-settings', (event, modalObject) => {
	widgetSettings = modalObject["widget"];
	widgetID = modalObject["widID"];

	// set input fields
	document.getElementById("gcount").value = widgetSettings["game_count"];

	// bind modal buttons
	document.getElementById("cancel").onclick = cancel;
	document.getElementById("save").onclick = save;
});

window.onbeforeunload = (e) => {
	elc.ipcRenderer.send(`${widgetID}-cancelled`, widgetID);
	e.returnValue = true;
}

var cancel = function() {
	elc.ipcRenderer.send(`${widgetID}-cancelled`);
}

var save = function() {
	widgetSettings["game_count"] = document.getElementById("gcount").value;
	elc.ipcRenderer.send(`${widgetID}-saved`, widgetSettings);
}
