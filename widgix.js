// MIT LICENSE | Jonathan Ives, 2021

// library imports
const expr = require("./library/express.js");
const fsys = require("./library/filesystem.js");
const logs = require("./library/logging.js");
const main = require("./library/ipcmain.js");
const util = require("./library/utilities.js");

// this acts as default
var config = {
	"version": "1.0.A",
	"serve_port": 3000,
	"serve_remote": false,
	"widget_dir": __dirname + "\\persistence\\widgets",
	"update_repo": ""
};

// INSTANTIATE LOGGING OBJECT

const logger = new logs.ApplicationLogManager(__dirname);

// LOCATE PERSISTENCE FOLDER -- WRITES ON DNE

fsys.assertFileDirectory(__dirname + "/persistence", true, (error) => {
	if (error instanceof Error) {
		throw error;
	}
});

// LOCATE CONFIGURATION -- WRITES ON DNE, VALIDATES ON READ

fsys.assertFileDirectory(__dirname + "/persistence/config.json", true, (assert) => {
	if (assert instanceof Error) {		// handle error -- fatal, in this case
		throw assert;	
	} else if (!assert) {				// write default configuration to config.json
		var assertion = fsys.writeToJSONFile(__dirname + "/persistence/config.json", config); // no throws
		logger.add(logger.load, logger.CFG_DEF, key=key, outcome=assertion); // manages throws (if necessary)
	} else {							// read and validate configuration data
		var changesMade = false;
		var raw = fsys.readFromJSONFile(__dirname + "/persistence/config.json");
		if (raw instanceof Error) throw raw;
		if (!(raw instanceof Object)) {
			raw = config;
			logger.add(logger.load, logger.CFG_EMP, key=key);
		}

		for (var key in config) {		// validate raw config using default
		
			if (!(key in config)) {
				raw[key] = config[key];
				logger.add(logger.load, logger.KEY_DNE, key=key);
				changesMade = true;
			}

			if (key === "serve_port" && (!(raw[key] instanceof Number) || raw[key] <= 0 || raw[key] >= 1023)) {
				raw[key] = config[key];
				logger.add(logger.load, logger.KEY_INV, key=key);
				changesMade = true;
			} else if (key === "serve_remote" && !(raw[key] instanceof Boolean)) {
				raw[key] = config[key];
				logger.add(logger.load, logger.KEY_INV, key=key);
				changesMade = true;
			} else if (key === "widget_dir") {
				var assertion = fsys.assertFileDirectory(raw[key], true); // no throws
				if (!assertion) {
					raw[key] = config[key];
					assertion = fsys.assertFileDirectory(raw[key], true); // no throws
					logger.add(logger.load, logger.FIL_INV, key=key, outcome=assertion); // manages throws (if necessary)
					changesMade = true;
				}
			} else if (key === "update_repo") {
				var assertion = util.assertUpdatesRepo(raw[key]); // no throws
				if (!assertion) {
					raw[key] = config[key];
					assertion = util.assertUpdatesRepo(raw[key]); // no throws
					logger.add(logger.load, logger.NO_PING, key=key, outcome=assertion); // bad repo doesn't throw	
					changesMade = true;
				}
				
			}
		}
		
		if (changesMade) fsys.writeToJSONFile(__dirname + "/persistence/config.json", raw);
		config = raw;
	}
});

// LOCATE WIDGETS TABLE MAP -- WRITES ON DNE, VALIDATES ON READ

fsys.assertFileDirectory(__dirname + "/persistence/widgets.json", true, (assert) => {
	if (assert instanceof Error) {
		throw assert;
	} else if (!assert) {
		var assertion = fsys.writeToJSONFile(__dirname + "/persistence/widgets.json", {}); // no throws
		logger.add(logger.load, logger.WDG_DEF, key=key, outcome=assertion); // manages throws (if necessary)
	} else {
		var raw = fsys.readFromJSONFile(__dirname + "/persistence/config.json");
		if (raw instanceof Error) throw raw;
		// validation will come later, maybe from utilities
	}
});

// LOCATE MODULES TABLE MAP -- WRITES ON DNE, VALIDATES ON READ

fsys.assertFileDirectory(__dirname + "/persistence/modules.json", true, (assert) => {
	if (assert instanceof Error) {
		throw assert;
	} else if (!assert) {
		var assertion = fsys.writeToJSONFile(__dirname + "/persistence/modules.json", {}); // no throws
		logger.add(logger.load, logger.WDG_DEF, key=key, outcome=assertion); // manages throws (if necessary)
	} else {
		var raw = fsys.readFromJSONFile(__dirname + "/persistence/modules.json"); // now throws
		if (raw instanceof Error) throw raw;
		// validation will come later, maybe from uitilities
	}
});

// CONFIGURE SERVER OBJECT

const server = new expr.ApplicationServiceManager(config);

// CONFIGURE APPLICATION OBJECT

const application = main.WidgixProcessManager;
config["root"] = __dirname;

application.app.whenReady().then( () => {
	application.start(server, logger, config);
});
