var events = require('events');

exports.EventManager = function() {
	events.EventEmitter.call(this);
	this.table = [];
	this.visited = [];
	this.addRoutes = function(routes) {
		var temp = [];
		temp = this.table.concat(routes);
		this.table = temp;
	};
	this.addVisited = function(address,port) {
		this.visited.push({address: address, port: port});
	}
	
};

exports.EventManager.prototype = new events.EventEmitter;
exports.EventManager.prototype.constructor = exports.EventManager;

//Singleton
exports.eventManager = new exports.EventManager();