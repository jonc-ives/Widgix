
var widgetHTMLString = `
`

var moduleHTMLString = `
<div class="module-pane">
	
</div>`

var logHTMLString = `
<div class="console-pane good-console">
	<h3></h3>
	<p></p>
</div>`

var newConsoleLog = function(logObject) {

};

var newModulePane = function(modID, modObject) {
	var pane = document.createElement("div");
	pane.className = "module-pane";
	pane.id = modID;
	pane.innerHTML = 
	`<div class="module-title">
		<h3>${modObject["title"]}</h3>
		<div class=${modObject["status"]}-icon></div>
	</div>
	<div class="open-module active-option" onclick="openModule('${modID}')"><h3>Setup</h3></div>`.trim();
	return (pane);
};

var newWidgetPane = function(widID, widObject) {
	var pane = document.createElement("div");
	pane.className = "widget-pane";
	pane.id = `c${widID}`;
	pane.innerHTML = 
	`<div class="widget-title">
		<h3>${widObject["title"]} (${widObject["width"]}x${widObject["height"]})</h3>
		<p>Created: ${utcToDate(widID.replace('c', ''))}</p> 
	</div>
	<div class="widget-controls">
		<div class="widget-link-box">
			<input class="widget-link" value=${widObject["url"]} disabled="true" />
			<div class="clipboard copy-link inactive-option" onclick="copyLink(${'c' + widID})"></div>
		</div>
		<div class="widget-options">
			<div class="preview-widget inactive-option" onclick="previewWidget(${widID})"><h3>Preview</h3></div>
			<div class="edit-widget inactive-option" onclick="editWidget(${widID})"><h3>Edit</h3></div>
			<div class="settings-widget active-option" onclick="optionsWidget(${widID})"><h3>Options</h3></div>
			<div class="delete-widget active-option" onclick="deleteWidget(${widID})"><h3>Delete</h3></div>
		</div>
	</div>`.trim();
	return (pane);
};

var utcToDate = function(utc, precise=false) {
	return (precise ? "04/01/2021" : "04/01/2021:14:58");
};
