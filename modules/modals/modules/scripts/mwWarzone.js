 const elc = require('electron');
 const ctl = require('../../controls/mwWarzone.js');

var moduleSettings = {};
var moduleID = "";
var moduleState = false;
var validatingSettings = false;

 // the modal is in four states at any point
 //		loading -- applying load object
 //		working -- logging into cod
 //		waiting -- allowing the user to enter
 //		success -- waiting for the user to exit

// IMPORTANT NOTE -- IF CHANGES ARE MADE TO THE SAVE AND CANCEL BUTTONS,
// ONCLICK SHOULD STILL BE BOUND TO FUNCTIONS save AND cancel.

elc.ipcRenderer.on('load-modal-settings', (event, modalObject) => {
	console.log(modalObject);
	moduleSettings = modalObject["module"];
	moduleID = modalObject["modID"];
	moduleState = modalObject["status"];

	// set input fields
	document.getElementById("pform").value = moduleSettings["platform"];
	document.getElementById("gamertag").value = moduleSettings["gamertag"];
	document.getElementById("actinum").value = moduleSettings["actinum"];

	// bind modal buttons
	document.getElementById("cancel").onclick = cancel;
	document.getElementById("proceed").onclick = save;
});

window.onbeforeunload = (e) => {
	elc.ipcRenderer.send(`${moduleID}-cancelled`, moduleID);
	e.returnValue = true;
}

var cancel = function() {
	elc.ipcRenderer.send(`${moduleID}-cancelled`);
}

var save = function() {

	if (moduleState === false) {
		document.getElementById("error").innerHTML = "Module failed to load. Check the dashboard log for more information.";
	}

	validatingSettings = true;
	moduleSettings["gamertag"] = document.getElementById("gamertag").value;
	moduleSettings["actinum"] = document.getElementById("actinum").value;
	moduleSettings["platform"] = document.getElementById("pform").value;
	document.getElementById("proceed").innerHTML = null;
	document.getElementById("proceed").opacity = 0.6;
	elc.ipcRenderer.send(`${moduleID}-saved`, moduleSettings);
	elc.ipcRenderer.once('invalid-save', (event, res) => {
		validatingSettings = false;
		document.getElementById('error').innerHTML = res;
		document.getElementById("proceed").innerHTML = "Locate";
		document.getElementById("proceed").opacity = 1;
	});
}
