var events = require('events');
var net = require('net');

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

exports.ClientSocket = function () {
	net.Socket.call(this);
	this.on('data', function(data) {
		console.log(data.toString());
		data = JSON.parse(data.toString());
		exports.processMessage(data);
	});
	this.on('error', function(e) {
		console.log(e.code);
		eventEmitter.emit('reconnect');
	});
	this.on('end', function() {
		eventEmitter.emit('reconnect');
	});
};

exports.ClientSocket.prototype = new net.Socket();
exports.ClientSocket.prototype.constructor = exports.ClientSocket;
