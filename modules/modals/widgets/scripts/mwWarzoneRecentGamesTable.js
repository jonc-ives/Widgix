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
	console.log(modalObject);
	widgetSettings = modalObject["widget"];
	widgetID = modalObject["widID"];

	// set input fields
	document.getElementById("bc").value = widgetSettings["background"];
	document.getElementById("bo").value = hexToCent(widgetSettings["background_opacity"]);
	document.getElementById("tc").value = widgetSettings["font_color"];
	document.getElementById("gcount").value = widgetSettings["game_count"];
	document.getElementById("headers").checked = widgetSettings["column_headers"];

	// show sample box field
	document.getElementById("sample-bar").style.background = `${widgetSettings["background"]}${widgetSettings["background_opacity"]}`;
	document.getElementById("th").style.color = widgetSettings["font_color"];
	document.getElementById("tr").style.color = widgetSettings["font_color"];	

	// bind input changes -- reflect in sample box
	document.getElementById("bc").onchange = changeBGColor;
	document.getElementById("bo").onchange = changeBGOpacity;
	document.getElementById("tc").onchange = changeTextColor;

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
	widgetSettings["background"] = document.getElementById("bc").value;
	widgetSettings["font_color"] = document.getElementById("tc").value;
	widgetSettings["game_count"] = document.getElementById("gcount").value;
	widgetSettings["column_headers"] = document.getElementById("headers").checked;
	if (document.getElementById("bo").value > 255) 
		widgetSettings["background_opacity"] = centToHex(255);
	else if (document.getElementById("bo").value < 0)
		widgetSettings["background_opacity"] = centToHex(0);
	else widgetSettings["background_opacity"] = centToHex(document.getElementById("bo").value);
	elc.ipcRenderer.send(`${widgetID}-saved`, widgetSettings);
}

var changeBGColor = function(event) {
	document.getElementById("sample-bar").style.background = event.target.value + centToHex(document.getElementById("bo").value);
}

var changeBGOpacity = function(event) {
	if (event.target.value > 255) event.target.value = 255;
	if (event.target.value < 0) event.target.value = 0;
	console.log(document.getElementById("bc").value + centToHex(event.target.value));
	document.getElementById("sample-bar").style.background = document.getElementById("bc").value + centToHex(event.target.value);
}

var changeTextColor = function(event) {
	document.getElementById("th").style.color = event.target.value;
	document.getElementById("tr").style.color = event.target.value;	
}

var centToHex = function(cent) {
	return parseInt(cent).toString(16);
}

var hexToCent = function(hex) {
	return parseInt(hex, 16);
}

