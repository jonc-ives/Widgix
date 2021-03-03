const { ipcRenderer } = require('electron');

var dblogs = {};
var server = [false, "good"];
var oe_on_new = false;

// INTERFACE WITH MAIN APPLICATION

var create_widget = function(event) {
	document.getElementById("new-cover").style.display = "inherit";

	document.getElementById("new-confirm").onclick = function() {
		var widget_dict = {};
		var wd_title = document.getElementById("new-tt").value
		var wd_width = parseInt(document.getElementById("new-wid").value)
		var wd_height = parseInt(document.getElementById("new-hgt").value)
		
		if (wd_height === NaN || wd_height > 4000)
			return document.getElementById("new-hgt").style.color = "red";
		else document.getElementById("new-hgt").style.color = "#ffffff";

		if (wd_width === NaN || wd_width > 4000)
			return document.getElementById("new-wid").style.color = "red";
		else document.getElementById("new-wid").style.color = "#ffffff";
		
		if (wd_title.length > 28)
			return document.getElementById("new-tt").style.color = "red";
		else document.getElementById("new-tt").style.color = "#ffffff";

		widget_dict["title"] = wd_title;
		widget_dict["width"] = wd_width;
		widget_dict["height"] = wd_height;

		document.getElementById("new-tt").value = "New Widget";
		document.getElementById("new-wid").value = "800";
		document.getElementById("new-hgt").value = "600";
		document.getElementById("new-oe").checked = 0;
		document.getElementById("new-cover").style.display = "none";
		
		if (oe_on_new) {
			ipcRenderer.once('create-widget-reply', (event, wid) => {
				ipcRenderer.send('edit-widget', wid);
			});
		}

		ipcRenderer.send('create-widget', widget_dict);
	};

	document.getElementById("new-cancel").onclick = function() {
		document.getElementById("new-tt").value = "New Widget";
		document.getElementById("new-wid").value = "800";
		document.getElementById("new-hgt").value = "600";
		document.getElementById("new-oe").checked = 0;
		document.getElementById("new-cover").style.display = "none";
	};
};

var copy_widget = function(event) {
	var wid = event.path[1].children[3].innerHTML.replace(/http:\/\/localhost:3000\/widget\?name\=/, "");
	ipcRenderer.send('copy-widget', wid);
};

var open_widget = function(event) {
	var wid = event.path[1].children[3].innerHTML.replace(/http:\/\/localhost:3000\/widget\?name\=/, "");
	ipcRenderer.send('edit-widget', wid);
};

var delete_widget = function(event) {
	var wid = event.path[1].children[3].innerHTML.replace(/http:\/\/localhost:3000\/widget\?name\=/, "");
	document.getElementById("del-cover").style.display = "inherit";
	
	document.getElementById("del-cancel").onclick = function() {
		document.getElementById("del-cancel").onclick = null;
		document.getElementById("del-confirm").onclick = null;
		document.getElementById("del-cover").style.display = "none";
	};

	document.getElementById("del-confirm").onclick = function() {
		document.getElementById("del-cancel").onclick = null;
		document.getElementById("del-confirm").onclick = null;
		document.getElementById("del-cover").style.display = "none";
		ipcRenderer.send('delete-widget', wid);
	};
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

// INTERACTION WITH DOM OBJECTS

var build_widget_pane = function(id, title_str, since_str) {
	// sample html in index.html
	var dbwidgets = document.getElementById("db-widgets");
	var reference = document.getElementById("new-wd");

	var wid_con = document.createElement("div");
	wid_con.className = "dbwd-pane bot-wall";

	var text_con = document.createElement("div");
	text_con.className = "dbwd-txt";
	var title = document.createElement("h2");
	title.innerHTML = title_str;
	text_con.appendChild(title);
	var lused = document.createElement("p");
	lused.innerHTML = since_str;
	text_con.appendChild(lused);

	var controls = document.createElement("div");
	controls.className = "dbwd-ctl";
	var edit = document.createElement("div");
	edit.className = "main-button dbwd-edit";
	edit.innerHTML = "EDIT";
	edit.onclick = open_widget;
	controls.appendChild(edit);
	var copy = document.createElement("div");
	copy.className = "main-button dbwd-cpy";
	copy.innerHTML = "COPY";
	copy.onclick = copy_widget;
	controls.appendChild(copy);
	var dele = document.createElement("div");
	dele.className = "main-button dbwd-del";
	dele.innerHTML = "DEL";
	dele.onclick = delete_widget;
	controls.appendChild(dele);
	var link = document.createElement("h3");
	link.innerHTML = "http://localhost:3000/widget?name=" + id;
	controls.appendChild(link);

	wid_con.appendChild(text_con);
	wid_con.appendChild(controls);

	dbwidgets.insertBefore(wid_con, reference);
};

var build_dblog_pane = function(ts_str, msg_str, priority) {
	// sample html in index.html
	var cons = document.getElementById("db-console");
	// the dblog-pane container
	var pane = document.createElement("div");
	if (priority === "error") pane.className = "dblog-pane bot-wall dblog-err";
	else if (priority === "warning") pane.className = "dblog-pane bot-wall dblog-war";
	else pane.className = "dblog-pane bot-wall-lt dblog-not";
	// the dblog-ts stamp text
	var tstamp = document.createElement("p");
	tstamp.className = "dblog-ts";
	tstamp.innerHTML = ts_str;
	pane.appendChild(tstamp);
	// the dblog-txt message text
	var msg = document.createElement("msg");
	msg.className = "dblog-txt";
	msg.innerHTML = msg_str;
	pane.appendChild(msg);
	// append the pane to the page
	cons.prepend(pane);

};

var parse_lastup = function(utc) {
	if (!utc) return "last used: never"
	var elapsed = Math.floor(Date.now() / 1000) - utc;
	if (elapsed < 60) return "last used: a few seconds ago";
	if (elapsed < 60*2) return "last used: a minute ago";
	if (elapsed < 60*5) return "last used: a few minutes ago";
	if (elapsed < 60*60) return "last used: " + Math.floor(elapsed / 60) + " minutes ago";
	if (elapsed < 60*90) return "last used: an hour ago";
	if (elapsed < 60*60*24) return "last used: " + Math.floor(elapsed / (60*60)) + " hours ago";
	if (elapsed < 60*60*36) return "last used: a day ago";
	if (elapsed < 60*60*24*60) return "last used: " + Math.floor(elapsed / (60*60*24)) + " days ago";
	if (elapsed > 60*60*24*60) return "last used: " + Math.floor(elapsed / (60*60*24*34)) + " months ago";
};

var parse_dblogt = function(utc) {
	if (!utc) return "<no timestamp>"
	var elapsed = Math.floor(Date.now() / 1000) - utc;
	if (elapsed < 60) return "a few seconds ago:";
	if (elapsed < 60*2) return "a minute ago:";
	if (elapsed < 60*5) return "a few minutes ago:";
	if (elapsed < 60*60) return Math.floor(elapsed / 60) + " minutes ago:";
	if (elapsed < 60*90) return "an hour ago:";
	if (elapsed < 60*60*24) return Math.floor(elapsed / (60*60)) + " hours ago:";
	if (elapsed < 60*60*36) return "a day ago:";
	if (elapsed < 60*60*24*60) return Math.floor(elapsed / (60*60*24)) + " days ago:";
	if (elapsed > 60*60*24*60) return Math.floor(elapsed / (60*60*24*34)) + " months ago:";
};

// RECEIVE INTERFACE FROM MAIN APPPLICATION

ipcRenderer.on('load-db-reply', (event, dbwidgets, dblogs) => {
	// it's possible we have some early load logs we don't want to repeat
	document.getElementById("db-console").innerHTML = "";
	for (wd in dbwidgets)
		build_widget_pane(wd, dbwidgets[wd]["title"], parse_lastup(dbwidgets[wd]["lastup"]));
	for (dl in dblogs)
		build_dblog_pane(parse_dblogt(dl), dblogs[dl]["msg"], dblogs[dl]["priorityority"]);
	document.getElementById("new-oe").onclick = function() { oe_on_new = !oe_on_new; }
});

ipcRenderer.on('reload-dblogs', (event, dblogs) => {
	document.getElementById("db-console").innerHTML = "";
	for (dl in dblogs)
		build_dblog_pane(parse_dblogt(dl), dblogs[dl]["msg"], dblogs[dl]["priority"]);
});

ipcRenderer.on('reload-dbwidgets', (event, dbwidgets) => {
	var new_widget_button = document.getElementById("new-wd");
	var wd = document.getElementById("db-widgets");
	wd.innerHTML = ""; wd.appendChild(new_widget_button);
	for (wd in dbwidgets)
		build_widget_pane(wd, dbwidgets[wd]["title"], parse_lastup(dbwidgets[wd]["lastup"]));
});

// LOAD THE PAGE-DATA

ipcRenderer.send('load-db');