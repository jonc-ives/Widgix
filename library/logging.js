// MIT LICENSE | Jonathan Ives, 2021

exports.ApplicationLogManager = class {

	constructor(dir) {
		// namespaces
		this.load = 0;
		this.main = 1;
		// log ids
		this.KEY_DNE = 0;
		this.KEY_INV = 1;
		this.FIL_INV = 2;
		this.NO_PING = 3;
		this.CFG_EMP = 4;
		// instance variables
		this.root = dir;
		this.loadBuffer = [];
		this.mainBuffer = [];
		this.notifQueue = [];
	}

	add(namespace, id, key=null, outcome=null) {
		// add logs to the appropriate buffers for queue management
		// console.log(namespace, id, key, outcome);
	}
}