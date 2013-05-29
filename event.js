var events = require('events');

exports.EventManager = function() {
	events.EventEmitter.call(this);
	this.table = [];
	this.addRoutes = function(routes) {
		var temp = [];
		temp = this.table.concat(routes);
		this.table = temp;
	};
	
};

exports.EventManager.prototype = new events.EventEmitter;
exports.EventManager.prototype.constructor = exports.EventManager;

