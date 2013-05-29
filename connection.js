var net = require('net');

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