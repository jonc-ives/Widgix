const checkInternetConnection = require('check-internet-connected');

var connection = false;
checkInternetConnection().then( () => { connection = true } ).catch( () => { connection = false } );
var checkInternet = setInterval(function() {
	checkInternetConnection().then( () => { connection = true } ).catch( () => { connection = false } );
}, 1000 * 60);

exports.getStreamData = async function(query) {
	var ctl = require(`../modules/controls/${query.modid}.js`);
	return await ctl.getStreamData(query.modid, query.data, connection);
}

exports.checkStatus = async function(id, callback) {
	var ctl = require(`../modules/controls/${id}.js`);
	var rtn = await ctl.checkStatus(connection);
	callback(rtn["status"], rtn["log"]);
}

exports.checkModuleSettings = async function(id, object) {
	var ctl = require(`../modules/controls/${id}.js`);
	return await ctl.checkModuleSettings(object);	
}
