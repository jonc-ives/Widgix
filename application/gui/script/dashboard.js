// updates console log every few seconds
var readConsoleLogs = function() {
	ipcRenderer.send('read-console');
	setTimeout(readConsoleLogs, 4*1000);
}; ipcRenderer.on('read-console-reply', (event, new_logs) => {
	var cse = document.getElementById("db-cse");
	for (var i=0;i<new_logs.length;i++) {
		let log = document.createElement("div");
		log.className = new_logs[i].type;
		let txt = document.createElement("p");
		txt.innerHTML = new_logs[i].text;
		log.appendChild(txt); cse.prepend(log);
	}
});

// server toggle invocation and reply handling
var toggleServer = function() {
	document.getElementById("serverToggleQ").style.display = "inline-block";
	ipcRenderer.send('toggle-server');
}; ipcRenderer.on('toggle-server-reply', (event, server_state) => {
	document.getElementById("serverToggleQ").style.display = "none";
	element = document.getElementById("serverToggle");
	if (server_state) {
		element.style.background = "#66ff33";
		element.firstChild.className = "sld-ind sld-rgt";
	} else {
		element.style.background = "#e1e1e1";
		element.firstChild.className = "sld-ind sld-lft";
	}
});

// server toggle invocation and reply handling
var toggleNetwork = function() {
	document.getElementById("networkToggleQ").style.display = "inline-block";
	ipcRenderer.send('toggle-network');
}; ipcRenderer.on('toggle-network-reply', (event, network_state) => {
	document.getElementById("networkToggleQ").style.display = "none";
	element = document.getElementById("networkToggle");
	if (network_state) {
		element.style.background = "#66ff33";
		element.firstChild.className = "sld-ind sld-rgt";
	} else {
		element.style.background = "#e1e1e1";
		element.firstChild.className = "sld-ind sld-lft";
	}
});