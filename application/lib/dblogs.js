
exports.fatals = {
	"configdne": "Application configuration file (./config.json) does not exist. See README for more information [ERRF00].",
	"configobj": "Application failed to read from configuration file [ERRF01].",
	"widgetsdne": "Application cannot find user data storage. See README for more information [ERRF10].",
	"widgetsobj": "Application failed to read from user data storage. See README for more information [ERRF11].",
	"modulesdne": "Application cannot find module configurations.  See README for more information [ERRF20].",
	"modulesobj": "Application failed to read from module configurations. See README for more information [ERRF21]."
};

exports.dblogs = {
	"loaddashboard": {"msg":"Application configuration complete. Server is ready.","priority":"notification"},
	"serverup": {"msg":"Local server instance is now managing requests (L0) on port 3000.","priority":"notification"},
	"serverdown": {"msg":"Local server instance is no longer managing requests. You're widgets will not load while the server is down.","priority":"notification"},
	"serverupf": {"msg":"Local server failed to instantiate. If the problem persists, attempt the solutions detailed in 'Troubleshoot' [ERRC80].","priority":"error"},
	"serverdownf": {"msg":"Local server failed to shut down safely. There could be many reasons for this. There is no danger in force-closing the application.","priority":"error"},
	"newwidget": {"msg":"Failed to write new widget to user data [ERRC20].","priority":"error"},
	"copywidget": {"msg":"Failed to copy widget to user data [ERRC21].","priority":"error"},
	"delwidget": {"msg":"Failed to delete widget from user data [ERRC22]","priority":"error"},
	"lastup": {"msg":"Failed to update widget meta tags in user data [ERRC23].","priority":"error"},
	"failedremote": {"msg":"","priority":""},
	"norname": {"msg":"Local system attempted to access the application's widget endpoint without specifying a widget name. Check your OBS's browser source URLs.","priority":"warning"},
	"badrname": {"msg":"Local system attempted to access a widget that does not exist. Check your OBS's browser source URLs.","priority":"warning"},
	"badstream": {"msg":"A module failed to access a data stream. Check your authentication status in the 'Modules' tab.","priority":"warning"},
	"goodwidget": {"msg":"Widget served successfully.","priority":"notification"},
	"editorrepeat": {"msg":"The editor cannot be opened twice. Close the current widget to open another.","priority":"warning"}
};
