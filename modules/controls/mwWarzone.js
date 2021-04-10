const API = require('call-of-duty-api')({platform: "acti"});
const fsys = require('../../library/filesystem.js');
const path = require('path');

var throwawayUname = "devs.throw.away.01@gmail.com";
var throwawayPword = "thisIsThrowing11";
const GOOD_AUTH = "";
const BAD_AUTH = "";
const BAD_AUTH_STATUS = {
	"status":  {"id": "mwWarzone", "status": "critical" },
	"log": {"message": "AUTH ERROR [mwWarzone] -- failed to connect to Call of Duty Servers", "status": "critical"}
}, GOOD_AUTH_STATUS = {
	"status": {"id": "mwWarzone", "status": "good" },
	"log": {"message": "GOOD AUTH [mwWarzone] -- successfully connected to Call of Duty Servers", "status": "good"}
}, NO_INTERNET = {
	"status": {"id": "mwWarzone", "status": "important" },
	"log": {"message": "NO CONN [mwWarzone] -- the use of one or more widgets requires internet connectivity. Please check your connection then restart the application.", "status": "important"}
}

exports.checkStatus = async function(connection) {
	if (!connection) return NO_INTERNET;

	try {
		var auth = await API.login(throwawayUname, throwawayPword);
		return GOOD_AUTH_STATUS;
	} catch (error) { return BAD_AUTH_STATUS; }
}

exports.checkModuleSettings = async function(newSettings) {
	if (!newSettings["gamertag"]) return "Invalid Gamertag";
	if (!newSettings["actinum"]) return "Invalid Activision ID Number";
	if (!newSettings["platform"]) return "Missing platform";
	
	try {
		await API.MWcombatmp(newSettings["gamertag"], newSettings["platform"]);
		return true;
	} catch(error) {
		return "Account not found. Incorrect gamertag, ID Number, or platform? Misconfigured privacy settings?";
	}
}

exports.getStreamData = async function(modID, query) {
	var rawJSON = fsys.readFromJSONFile(path.resolve(`./modules/settings/${modID}.json`));

	var words = query.split(" ");
	var type = words[0];
	
	if (type === "rmatches") {
		var count = words[1];
		var data = words.slice(2);
		return await getWarzoneMatches(rawJSON["gamertag"], rawJSON["platform"], count, data);
	}

	if (type === "cstats") {
		var data = words.slice(1);
		return await getWarzoneCareer(rawJSON["gamertag"], rawJSON["platform"], data);
	}
}

var getWarzoneMatches = async function(gamertag, platform, count, attributes) {
	var dataReturn = [];
	var legalPlats = ["acti", "psn", "steam", "battle", "xbl"];
	var legalAttrs = ["kills", "kdRatio", "mode", "deaths", "gulagKills", "teamPlacement", "damageDone", "damageTaken"];
	if (isNaN(count) || count > 20) return "bad link -- count";
	if (!legalPlats.includes(platform)) return "bad link -- platform";
	for (var attr in attributes) if (!legalAttrs.includes(attributes[attr])) return "bad link -- bad stream";

	try {
		let data = await API.MWcombatwz(gamertag, platform);
		if (!data) return "bad load -- no data";
		if (!data["matches"]) return "bad load -- no matches";
		var matches = data["matches"];
		for (var i = 0; i < count; i++) {
			dataReturn.push({});
			for (attr in attributes) {
				if (attributes[attr] === "mode")
					dataReturn[i][attributes[attr]] = matches[i][attributes[attr]];
				else dataReturn[i][attributes[attr]] = matches[i]["playerStats"][attributes[attr]];
			}
		}
		return dataReturn;
	} catch(error) {
	    return error;
	}
};

var getWarzoneCareer = async function(gamertag, platform, attributes) {
	var dataReturn = {};
	var legalPlats = ["acti", "psn", "steam", "battle", "xbl"];
	var legalAttrs = ["wins", "kills", "kdRatio", "downs", "deaths", "topTwentyFive", "topTen", "topFive"];
	if (!legalPlats.includes(platform)) return "bad link -- platform";
	for (var attr in attributes) if (!legalAttrs.includes(attributes[attr])) return "bad link -- bad stream";

	try {
		let data = await API.MWwz(gamertag, platform);
		console.log(attributes);
		if (!data) return "bad load -- no data";
		if (!data["lifetime"]) return "bad load -- missing lifetime";
		if (!data["lifetime"]["mode"]) return "bad load -- missing lifetime.mode";
		if (!data["lifetime"]["mode"]["br"]) return "bad load -- missing lifetime.mode.br";
		if (!data["lifetime"]["mode"]["br"]["properties"]) return "bad load -- missing lifetime.mode.br.properties";
		var career = data["lifetime"]["mode"]["br"]["properties"];
		console.log(career);
		for (attr in attributes) {
			dataReturn[attributes[attr]] = career[attributes[attr]];
		}
		return dataReturn;
	} catch(error) {
	    return error;
	}
};
