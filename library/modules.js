
exports.getStreamData = async function() {
	return "";
}

exports.checkStatus = async function(id, callback) {
	setTimeout(() => { callback("good", null) }, 3500);
}