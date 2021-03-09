const { ipcRenderer } = require('electron');

var is_saved = true;
var fclose = false;
var cvs_zoom = 0.4;
var widget = {};
var focused = null;
var els = []; // vector between type and element, id --> 9 letter random 

// these are all used to keep track of the editing selectors
var sizeUp, sizeDn, sizePx, fontB, fontI, fontU, fontC;
var marT, marR, marB, marL, padT, padR, padB, padL;
var bordT, bordC, bordPx, bordR, bgT, bgSrc, bgClr;
var posHL, posHR, posHC, posVT, posVB, posVC, zUp, zDn;
var txtAl, txtSp, txtCnt;

// tell the main process we're ready
ipcRenderer.send('editor-ready');

// response to 'editor-ready'. loads the widget
ipcRenderer.on('load-widget', (event, widget_obj) => {
	widget = widget_obj;

	// Create widget body
	var body = document.createElement("div");
	document.getElementById("cvs-bnk").appendChild(body);
	body.style.width = widget_obj["width"];
	body.style.height = widget_obj["height"];
	body.id = "widget-body";
	body.className = "edit";


	// load hnodes into widget body
	console.log(widget_obj["hnodes"]);
	for (var ch in widget_obj["hnodes"])
		body.appendChild(create_element(widget_obj["hnodes"][ch]));

	// Load and Display Initial Options/Ctls
	document.getElementById("wid-tit").value = widget_obj["title"];

	// we're readdyyyyy
	ipcRenderer.send('load-widget-done');
});

// DOM ELEMENT MANAGEMENT

var create_element = function(el) {
	if (el instanceof Object) { 
		// element DOM & style
		var ele = document.createElement(el["type"]);
		ele.className = el["class"] + " edit";
		ele.textContent = el["text"];
		ele.style = el["inline"];
		ele.onclick = focus_element;

		// element vector object

	} else { // from editor
	
	}

	return ele
};

var delete_element = function(el_idx) {

};

// var set_element_drag = function(element) {
// 	// set canvas bindings for drag
	
// 	element.onmousedown = (event) => {
// 		event.preventDefault();
// 		console.log("dragging element: ", element);
// 		if (event.ctrlKey) return;
// 		element.style.cursor = "grabbing";
// 		pos3 = event.clientX;
// 		pos4 = event.clientY;
// 		document.onmouseup = (event) => {
// 			element.style.cursor = "initial";
// 			document.onmouseup = null;
// 			document.onmousemove = null;
// 		}; document.onmousemove = (event) => {
// 			console.log("moving");
// 			event.preventDefault();
// 			pos1 = pos3 - event.clientX;
// 			pos2 = pos4 - event.clientY;
// 			pos3 = event.clientX;
// 			pos4 = event.clientY;
// 			element.style.left = (element.offsetLeft - pos1) + "px";
// 			element.style.top = (element.offsetTop - pos2) + "px"
// 		};
// 	};
// };

var set_element_resize = function(element) {

};

// FOCUS (AND UNFOCUS) ELEMENTS

var focus_element = function(e) {
	var target_element = e.target;
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

	var drag_mousedown = function(event) {
		console.log(".focused.(e) --> mousedown");
		event.preventDefault();
		if (event.ctrlKey) return;
		pos3 = event.clientX;
		pos4 = event.clientY;
		document.addEventListener('mouseup', drag_mouseup);
		document.addEventListener('mousemove', drag_mousemove);
	};

	var drag_mouseup = function(e) {
		console.log(".focused.(e) --> mouseup");
		document.removeEventListener('mouseup', drag_mouseup);
		document.removeEventListener('mousemove', drag_mousemove);
	};

	var drag_mousemove = function(event) {
		console.log(".focused.(e) --> mousemove");
		event.preventDefault();
		pos1 = pos3 - event.clientX;
		pos2 = pos4 - event.clientY;
		pos3 = event.clientX;
		pos4 = event.clientY;
		event.target.style.left = (event.target.offsetLeft - pos1) + "px";
		event.target.style.top = (event.target.offsetTop - pos2) + "px"
	};
	
	// unfocus previously focused element(s)
	var focused_els = document.getElementsByClassName("focused");
	for (var i in focused_els) {
		if (focused_els[i].className) {
			focused_els[i].classList.remove("focused");
			focused_els[i].removeEventListener('mousedown', drag_mousedown);
			focused_els[i].addEventListener('click', focus_element);
		}
	}

	target_element.removeEventListener('click', focus_element);
	target_element.addEventListener('mousedown', drag_mousedown);
	target_element.classList.add("focused");


};

// var unfocus_elements = function() {
// 	var focused_els = document.getElementsByClassName("focused");
// 	if (focused_els.length === 0) return;
// 	for (var i in focused_els) {
// 		if (!focused_els[i].className) break;
// 		focused_els[i].classList.remove("focused");
// 		focused_els[i].onmousedown = null;
// 		focused_els[i].onclick = focus_element;
// 	}
// };

// var add_focus_binding = function(element) {
// 	element.onclick = (event) => {
// 		console.log("focused");
// 		// change states
// 		focused = element;
// 		element.className += " focused";

// 		// add resizing and drag bindings
// 		set_element_drag(element);
// 		set_element_resize(element);

// 		// remove focus events
// 		var editables = document.getElementsByClassName("edit");
// 		for (var i in editables)
// 			editables[i].onclick = null;
// 	};
// };

var rem_focus_binding = function() {

};

// STATIC OPTION BINDINGS

var exit_edit = function(save=true) {

};

var select_cbg = function() {
	// alpha, dark, light, custom
	var canvas = document.getElementById("cvs-bnk");
	var cbg = document.getElementById("opt-cbg").value;
	
	if (cbg === "alpha") {
		canvas.style.background = "url(asset/alpha_canvas_dark.jpg)";
	} else if (cbg === "dark") {
		canvas.style.background = "#323232";
	} else if (cbg === "light") {
		canvas.style.background = "#dfdfdf";
	} else if (cbg === "custom") {
		ipcRenderer.send('custom-cbg');
		ipcRenderer.once('custom-cbg-reply', (event, pathname) => {
			canvas.style.background = `url(${pathname})`;
		});
	}
};

var select_csz = function() {
	// 1080p, 720p, 8b
	var canvas = document.getElementById("cvs-bnk");
	var csz = document.getElementById("opt-csz").value;

	if (csz === "1080") {
		canvas.style.width = "1980px";
		canvas.style.height = "1080px";
	} else if (csz === "720") {
		canvas.style.width = "1280px";
		canvas.style.height = "720px";
	} else if (csz === "8") {
		canvas.style.width = "1360px";
		canvas.style.height = "768px";
	}

	// need to adjust edge if zoom pulls it away from boundary
	var nleft = canvas.offsetLeft - (canvas.offsetWidth * cvs_zoom / 2);
	var nright = canvas.offsetLeft + (canvas.offsetWidth * cvs_zoom / 2);
	var ntop = canvas.offsetTop - (canvas.offsetHeight * cvs_zoom / 2);
	var nbott = canvas.offsetTop + (canvas.offsetHeight * cvs_zoom / 2);
	
	if (nleft > (window.innerWidth - 280) / 2)
		canvas.style.left = (((window.innerWidth - 280) / 2) + canvas.offsetWidth * cvs_zoom / 2) + "px";
	else if (nright < (window.innerWidth - 280) / 2)
		canvas.style.left = (((window.innerWidth - 280) / 2) - canvas.offsetWidth * cvs_zoom / 2) + "px";
	else if (ntop > (window.innerHeight - 32) / 2)
		canvas.style.top = (((window.innerHeight - 32) / 2) + canvas.offsetHeight * cvs_zoom / 2) + "px";
	else if (nbott < (window.innerHeight - 32) / 2)
		canvas.style.top = (((window.innerHeight - 32) / 2) - canvas.offsetHeight * cvs_zoom / 2) + "px";
};

var change_title = function() {

};

// UTILITY FUNCTIONS

var scale_canvas = function(increment) {
	if (cvs_zoom + increment > 0.35 && cvs_zoom + increment < 1.5)
		cvs_zoom += increment;

	document.getElementById("opt-wzm").innerHTML = `${Math.floor(cvs_zoom*100)}%`;

	// these actually scale the canvas -- simple, right?
	var element = document.getElementById("cvs-bnk");
	element.style.transform = `translate(-50%, -50%) scale(${cvs_zoom}, ${cvs_zoom})`;

	// need to adjust edge if zoom pulls it away from boundary
	var nleft = element.offsetLeft - (element.offsetWidth * cvs_zoom / 2);
	var nright = element.offsetLeft + (element.offsetWidth * cvs_zoom / 2);
	var ntop = element.offsetTop - (element.offsetHeight * cvs_zoom / 2);
	var nbott = element.offsetTop + (element.offsetHeight * cvs_zoom / 2);
	
	if (nleft > (window.innerWidth - 280) / 2)
		element.style.left = (((window.innerWidth - 280) / 2) + element.offsetWidth * cvs_zoom / 2) + "px";
	else if (nright < (window.innerWidth - 280) / 2)
		element.style.left = (((window.innerWidth - 280) / 2) - element.offsetWidth * cvs_zoom / 2) + "px";
	else if (ntop > (window.innerHeight - 32) / 2)
		element.style.top = (((window.innerHeight - 32) / 2) + element.offsetHeight * cvs_zoom / 2) + "px";
	else if (nbott < (window.innerHeight - 32) / 2)
		element.style.top = (((window.innerHeight - 32) / 2) - element.offsetHeight * cvs_zoom / 2) + "px";
};

var create_eid = function() {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	var new_wid = "";
	for (var i = 0; i < 9; i++)
		new_wid += alphabet[Math.floor(Math.random() * alphabet.length)]
	return new_wid;
};

// WINDOW EVENT HANDLING

window.onload = (event) => {
	// Load Canvas Blank and Scale
	var blank = document.getElementById("cvs-bnk");
	blank.style.transform = `translate(-50%, -50%) scale(${cvs_zoom}, ${cvs_zoom})`;
	blank.style.display = "inherit";

	// set canvas bindings for drag
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var parent = document.getElementById("edt-cvs");
	var element = document.getElementById("cvs-bnk");
	parent.onmousedown = (event) => {
		console.log("#edt-cvs.(e) --> mousedown");
		event.preventDefault();
		if (!event.ctrlKey) return;
		event.target.style.cursor = "grabbing";
		pos3 = event.clientX;
		pos4 = event.clientY;
		document.onmouseup = (event) => {
			console.log("#edt-cvs.(e) --> mouseup");
			parent.style.cursor = "initial";
			event.target.style.cursor = "initial";
			document.onmouseup = null;
			document.onmousemove = null;
		}; document.onmousemove = (event) => {
			console.log("#edt-cvs.(e) --> mousemove");
			event.preventDefault();
			// only move w/ ctrl
			if (event.ctrlKey) {
				pos1 = pos3 - event.clientX;
				pos2 = pos4 - event.clientY;
				pos3 = event.clientX;
				pos4 = event.clientY;
				// these are the scaled objects actual positions
				var nleft = element.offsetLeft - (element.offsetWidth * cvs_zoom / 2) - pos1;
				var nright = element.offsetLeft + (element.offsetWidth * cvs_zoom / 2) - pos1;
				var ntop = element.offsetTop - (element.offsetHeight * cvs_zoom / 2) - pos2;
				var nbott = element.offsetTop + (element.offsetHeight * cvs_zoom / 2) - pos2;
				// make sure we don't pull the canvas off the screen
				if (!(nleft > (window.innerWidth - 280) / 2) && !(nright < (window.innerWidth - 280) / 2))
					element.style.left = (element.offsetLeft - pos1) + "px";
				if (!(ntop > (window.innerHeight - 32) / 2) && !(nbott < (window.innerHeight - 32) / 2))
					element.style.top = (element.offsetTop - pos2) + "px";
			} else {
				// no ctrl, no drag
				parent.style.cursor = "initial";
				event.target.style.cursor = "initial";
				document.onmouseup = null;
				document.onmousemove = null;
			}
		};
	};
	
	// set canvas binding for zoom
	document.getElementById('edt-cvs').onwheel = (event) => {
		event.preventDefault();
		if (!event.ctrlKey) return;
		scale_canvas((event.deltaY > 0) ? -0.01 : 0.01);		
	};
};

window.onbeforeunload = (event) => {
	ipcRenderer.send('editor-closed');
	// return a non-default to cancel-close
};