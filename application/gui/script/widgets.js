// evaluates to -1 if not windows
const win = navigator.appVersion.indexOf("Win");

const { ipcRenderer } = require('electron');
const edt = (win !== -1) ? require(".\\script\\lib\\editor.js") : require("./script/lib/editor.js"); 

// our very import globals
var widgets = {}, wd_focus = "", el_focus = "";
var cvs_zoom = 0.9, cvs_width = 800, cvs_height = 600;
var active_widget;

// the dynamic custom rules element
const custom_style_sheet = document.createElement('style');

// a few initial element bindings
var initialize_general_bindings = function() {
	document.getElementById("zm-inc").addEventListener("click", function(event) {
		event.preventDefault();
		scale_canvas(0.05);
	});

	document.getElementById("zm-dec").addEventListener("click", function(event) {
		event.preventDefault();
		scale_canvas(-0.05);
	});
};

// IPC -- loads widgets into map pane NEEDS WORK
var loadWidgetsTab = function() {
	ipcRenderer.send('get-widgets');
	let canvasblnk = reset_cnvs(document.getElementById("wd-cvs-cvs"));
	canvasblnk.style.display = "none"; // resets and hides canvas
}; ipcRenderer.on('get-widgets-reply', (event, widgets_obj) => {
	widgets = widgets_obj;
	if (!(widgets instanceof Object)) {
		document.getElementById("no-widgets").display = "inherit";
		return;
	}

	// manages the first few general element bindings
	initialize_general_bindings();

	// resets map elements so we don't just keep adding
	var map = document.getElementById("wd-map");
	map.innerHTML = "<div id='wd-map-new'><h3 id='wd-map-new-tt'>Create New</h3><button class='btn btn-primary btn-ghost' id='wd-map-new-btn'>+</button></div>";

	// creates widget object with button bindings
	for (var wd in widgets) {
		// create widget box
		let box = document.createElement("div");
		box.className = "wd-map-wd"; box.id = wd;
		box.addEventListener('click', function(event) {
			focus_widget(event.target.id);
		});

		// create widget title
		let tt = document.createElement("h3");
		tt.className = "wd-map-wd-tt";
		tt.innerHTML = widgets[wd]["title"];
		// create widget delete button
		let closeBox = document.createElement("div");
		closeBox.className = "close-container";
		let leftRight = document.createElement("div");
		leftRight.className = "leftright";
		let rightLeft = document.createElement("div");
		rightLeft.className = "rightleft";
		closeBox.addEventListener('click', function() {
			delete_widget(wd);
		});	closeBox.appendChild(leftRight);
		closeBox.appendChild(rightLeft);
		// finish by appending our new objects
		box.appendChild(tt);
		box.appendChild(closeBox);
		map.appendChild(box);
	}

	// finally, load all of the active styles
	custom_style_sheet.remove();
	// make sure the css rules are empty
	custom_style_sheet.innerHTML = "";
	// fetch and build the (possibly) new styles
	load_styles();
	document.body.prepend(custom_style_sheet);
});

// resets canvas to default pos and size
var reset_cnvs = function(el) {
	document.getElementById("zoom-ctl").innerHTML = "90%";
	el.style.width = cvs_width.toString() + "px";
	el.style.height = cvs_height.toString() + "px";
	el.style.transform = `translate(-50%, -50%) scale(0.9, 0.9)`;
	el.style.top = "60%"; el.style.left = "50%";
	cvs_zoom = 0.9; return el;
};

// begin editing view from widgets tab
var focus_widget = function(key) {
	if (!key) return;
	// change map borders to reflect
	if (document.getElementById(wd_focus)) 
		document.getElementById(wd_focus).className = "wd-map-wd";
	document.getElementById(key).className = "wd-map-wd wd-map-wd-open";
	wd_focus = key;

	// show canvas options bar
	let opt = document.getElementById("wd-cvs-opt");
	opt.style.display = "flex";

	// show widget tree
	let tree = document.getElementById("wd-tre");
	tree.style.display = "block";

	// show save/cancel buttons

	// reset and show canvas
	let canvasblnk = reset_cnvs(document.getElementById("wd-cvs-cvs"));
	canvasblnk.style.display = "inherit";

	// bind zoom and drag to canvas
	let editor = document.getElementById("wd-cvs");
	editor.addEventListener("wheel", function(event) {
		event.preventDefault();
		if (event.deltaY > 0) scale_canvas(-0.01);
		else scale_canvas(0.01);
	}); setDragCanvas(canvasblnk);

	// this does the rest of the hard work for us
	active_widget = new edt.WidgetInFocus(key, widgets[key]);
	// active_widget.append_tree_panes(tree);
	canvasblnk.appendChild(active_widget.build_widget_body());
};

// user 'save changes' button
var save_changes = function() {

};

// user 'cancel' button
var cancel_changes = function() {

};

var focus_element = function(element) {
	// clear previous border and handles
	// show resizable border and handles
	// load element settings
};

// for canvas drag
setDragCanvas = function(element) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;	
	element.onmousedown = (event) => {
		event.preventDefault();
		event.target.style.cursor = "move";
		pos3 = event.clientX;
		pos4 = event.clientY;
		document.onmouseup = (event) => {
			event.target.style.cursor = "pointer";
			document.onmouseup = null;
			document.onmousemove = null;
		}; document.onmousemove = (event) => {
			event.preventDefault();
			var nleft = element.offsetLeft - (element.offsetWidth * cvs_zoom / 2) - pos1;
			var nright = element.offsetLeft + (element.offsetWidth * cvs_zoom / 2) - pos1;
			var ntop = element.offsetTop - (element.offsetHeight * cvs_zoom / 2) - pos2;
			var nbott = element.offsetTop + (element.offsetHeight * cvs_zoom / 2) - pos2;
			pos1 = pos3 - event.clientX;
			pos2 = pos4 - event.clientY;
			pos3 = event.clientX;
			pos4 = event.clientY;
			if (!(nleft > window.innerWidth / 2) && !(nright < window.innerWidth / 2))
				element.style.left = (element.offsetLeft - pos1) + "px";
			if (!(ntop > window.innerHeight / 2) && !(nbott < window.innerHeight / 2))
				element.style.top = (element.offsetTop - pos2) + "px";			
		};
	};
};

// IPC -- create a widget object
var create_widget = function() {

};

// IPC -- update a widget object
var update_widgets = function() {

};

// IPC -- delete a widget object
var delete_widget = function(key) {
	ipcRenderer.send('delete-widget', key);
}; ipcRenderer.on('delete-widget-reply', (event, success) => {
	loadWidgetsObjects(); console.log(`Widget delete --> ${success}`);
});

var load_styles = function() {
	ipcRenderer.send('request-styles');	
}; ipcRenderer.on('request-styles-reply', (event, styles) => {
	for (var key in styles) {
		var new_rule_string = "\n." + key + " {\n";
		var rules = styles[key];
		for (rule in rules) {
			if (rule === "type") continue;
			new_rule_string += "\t" + rule + ": ";
			new_rule_string += rules[rule] + ";\n";
		}

		new_rule_string += "}";
		custom_style_sheet.innerHTML += new_rule_string;
	}
});

var scale_canvas = function(increment) {
	console.log("scaling", cvs_zoom);
	if (cvs_zoom + increment > 0.35 && cvs_zoom + increment < 1.5)
		cvs_zoom += increment;
	// this changes the zoom indicator text in the options bar
	document.getElementById("zoom-ctl").innerHTML = Math.round(cvs_zoom * 100) + "%";
	// these actually scale the canvas -- simple, right?
	var open_canvas = document.getElementById("wd-cvs-cvs");
	open_canvas.style.transform = `translate(-50%, -50%) scale(${cvs_zoom}, ${cvs_zoom})`;
	// need to adjust edge if zoom pulls it away from boundary
	var nleft = open_canvas.offsetLeft - (open_canvas.offsetWidth * cvs_zoom / 2);
	var nright = open_canvas.offsetLeft + (open_canvas.offsetWidth * cvs_zoom / 2);
	var ntop = open_canvas.offsetTop - (open_canvas.offsetHeight * cvs_zoom / 2);
	var nbott = open_canvas.offsetTop + (open_canvas.offsetHeight * cvs_zoom / 2);
	if (nleft > window.innerWidth / 2)
		open_canvas.style.left = ((window.innerWidth / 2) + open_canvas.offsetWidth * cvs_zoom / 2) + "px";
	else if (nright < window.innerWidth / 2)
		open_canvas.style.left = ((window.innerWidth / 2) - open_canvas.offsetWidth * cvs_zoom / 2) + "px";
	else if (ntop > window.innerHeight / 2)
		open_canvas.style.top = ((window.innerHeight / 2) + open_canvas.offsetHeight * cvs_zoom / 2) + "px";
	else if (nbott < window.innerHeight / 2)
		open_canvas.style.top = ((window.innerHeight / 2) - open_canvas.offsetHeight * cvs_zoom / 2) + "px";
}
