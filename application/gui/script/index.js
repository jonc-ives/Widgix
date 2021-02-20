var view = "dashboard";
var service_port = 3000;

var openGithub = function() {

};

// Tab Navigation

var openModules = function() {
	if (view === "modules") return;
	document.getElementById(view).style.display = "none";
	document.getElementById("n-"+view).className = "";
	view = "modules"; loadModulesTab(); // async
	document.getElementById(view).style.display = "inherit";
	document.getElementById("n-"+view).className = "n-selected";
};

var openStyles = function() {
	if (view === "styles") return;
	document.getElementById(view).style.display = "none";
	document.getElementById("n-"+view).className = "";
	view = "styles"; loadStylesTab(); // async
	document.getElementById(view).style.display = "inherit";
	document.getElementById("n-"+view).className = "n-selected";
};

var openWidgets = function() {
	if (view === "widgets") return;
	document.getElementById(view).style.display = "none";
	document.getElementById("n-"+view).className = "";
	view = "widgets"; loadWidgetsTab(); // async
	document.getElementById(view).style.display = "inherit";
	document.getElementById("n-"+view).className = "n-selected";
};

var openDashboard = function() {
	if (view === "dashboard") return;
	document.getElementById(view).style.display = "none";
	document.getElementById("n-"+view).className = "";
	view = "dashboard";
	document.getElementById(view).style.display = "inherit";
	document.getElementById("n-"+view).className = "n-selected";
};
