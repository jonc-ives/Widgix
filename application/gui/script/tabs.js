var view = "dashboard";

// THESE ARE FOR WHEN TABS ARE SELECTED

var openModules = function() {
	if (view === "modules") return;
	document.getElementById(view).style.opacity = 0;
	document.getElementById("n-"+view).className = "";
	view = "modules"; loadModulesTab(); // async
	document.getElementById(view).style.opacity = 1;
	document.getElementById("n-"+view).className = "n-selected";
};

var openStyles = function() {
	if (view === "styles") return;
	document.getElementById(view).style.opacity = 0;
	document.getElementById("n-"+view).className = "";
	view = "styles"; loadStylesTab(); // async
	document.getElementById(view).style.opacity = 1;
	document.getElementById("n-"+view).className = "n-selected";
};

var openWidgets = function() {
	if (view === "widgets") return;
	document.getElementById(view).style.opacity = 0;
	document.getElementById("n-"+view).className = "";
	view = "widgets"; loadWidgetsTab(); // async
	document.getElementById(view).style.opacity = 1;
	document.getElementById("n-"+view).className = "n-selected";
};

var openDashboard = function() {
	if (view === "dashboard") return;
	document.getElementById(view).style.opacity = 0;
	document.getElementById("n-"+view).className = "";
	view = "dashboard"; loadDashboardTab(); // async
	document.getElementById(view).style.opacity = 1;
	document.getElementById("n-"+view).className = "n-selected";
};

// THESE ARE THE MECHANISMS BEHIND LOADING A TAB

// each content area is cleared on selection, and then rebuilt piece by piece
// this only happens when a content area comes into view, not out of view
// everytime a change is required to a file, it happens immediately, no buffer&queue
// we'll try to work synchronously when changing UI elements, async otherwise

var loadModulesTab = async function() {

};

var loadStylesTab = async function() {

};

var loadWidgetsTab = async function() {

};

var loadDashboardTab = async function() {

};

