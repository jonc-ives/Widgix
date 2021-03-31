// MIT LICENSE | Jonathan Ives, 2021
// ASYNCHRONOUS FILE SYSTEM OPERATIONS

const fileSystem = require('fs');
const path = require('path');

exports.writeToJSONFile = function(pathname, data, callback=null) {
	pathname = pathname.replace(/^\.*\/|\/$/g, '');
	fileSystem.writeFileSync(path.resolve(__dirname, pathname), JSON.stringify(data), (error) => {
		if (error instanceof Error && callback) return callback(error);
		if (error instanceof Error && !callback) return error;
		return true;
	});
};

exports.readFromJSONFile = function(pathname, callback=null) {
	fileSystem.readFileSync(pathname, (raw) => {
		if (raw instanceof Error && callback) return callback(raw);
		if (raw instanceof Error && !callback) return raw;
		if (!(raw instanceof Error) && callback) return callback(JSON.parse(raw));
		if (!(raw instanceof Error) && !callback) return JSON.parse(raw);
	});
};

exports.assertFileDirectory = function(pathname, writeOnFalse=false, callback=null) {
	var dirPath = pathname.replace(/\/?[^\/]+\.[a-z]+|\/$/g, '');

	var dirIsReal = fileSystem.existsSync(dirPath);
	if (!dirIsReal && !writeOnFalse && callback) return callback(false);
	if (!dirIsReal && !writeOnFalse && !callback) return false;

	var fileIsReal = fileSystem.existsSync(pathname);
	if (!dirIsReal && !writeOnFalse && callback) return callback(false);
	if (!dirIsReal && !writeOnFalse && !callback) return false;
	
	if (dirIsReal && fileIsReal && callback) return callback(true);
	if (dirIsReal && fileIsReal && !callback) return true;

	if (!dirIsReal && writeOnFalse) {
		fileSystem.mkdirSync(path.resolve(dirPath), { recursive: true }, (error) => {
			if (error instanceof Error && callback) return callback(error);
			if (error instanceof Error && !callback) return error;
			fileSystem.writeFileSync(path.resolve(pathname), "", (error) => {
				if (error instanceof Error && callback) return callback(error);
				if (error instanceof Error && !callback) return error;
				if (callback) return callback(true);
				return true;
			});
		});
	}

	if (!fileIsReal && writeOnFalse) {
		fileSystem.writeFileSync(path.resolve(pathname), {}, (error) => {
			if (error instanceof Error && callback) return callback(error);
			if (error instanceof Error && !callback) return error;
			if (callback) return callback(true);
			return true;
		});
	}


}